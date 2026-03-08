
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CartItem, Product as ProductType } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useCartStore } from '@/lib/store/useCartStore';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductType, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  isCartLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { cartItems, addToCart: storeAddToCart, removeFromCart: storeRemoveFromCart, updateQuantity: storeUpdateQuantity, clearCart: storeClearCart, totalItems: storeTotalItems, totalAmount: storeTotalAmount } = useCartStore();
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const { currentUser } = useAuth();

  const getCartCollectionRef = useCallback((userId: string) => {
    if (!db) return null;
    return collection(db, "users", userId, "cartItems");
  }, []);

  // Sync with Firestore for logged in users
  useEffect(() => {
    const syncCart = async () => {
      if (currentUser && db) {
        setIsCartLoaded(false);
        try {
          const cartColRef = getCartCollectionRef(currentUser.uid);
          if (cartColRef) {
            const snapshot = await getDocs(cartColRef);
            const firestoreItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CartItem));
            
            // For MVP, we'll favor the local cart if firestore is empty, otherwise favor firestore
            if (firestoreItems.length > 0) {
              useCartStore.setState({ cartItems: firestoreItems });
            } else if (cartItems.length > 0) {
              // Push local items to firestore
              const batch = writeBatch(db);
              cartItems.forEach(item => {
                batch.set(doc(cartColRef, item.id), item);
              });
              await batch.commit();
            }
          }
        } catch (error) {
          console.error("Cart sync error:", error);
        } finally {
          setIsCartLoaded(true);
        }
      } else {
        setIsCartLoaded(true);
      }
    };
    syncCart();
  }, [currentUser, getCartCollectionRef]);

  const addToCart = async (product: ProductType, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    storeAddToCart(product, quantity, selectedSize, selectedColor);
    if (currentUser && db) {
      const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
      const cartColRef = getCartCollectionRef(currentUser.uid);
      if (cartColRef) {
        const item = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity, // Note: This logic needs to handle merging if we want full firestore sync
          image: product.images[0],
          slug: product.slug,
          size: selectedSize,
          color: selectedColor,
        };
        await setDoc(doc(cartColRef, cartItemId), item, { merge: true });
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    storeRemoveFromCart(itemId);
    if (currentUser && db) {
      const cartColRef = getCartCollectionRef(currentUser.uid);
      if (cartColRef) {
        await deleteDoc(doc(cartColRef, itemId));
      }
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    storeUpdateQuantity(itemId, newQuantity);
    if (currentUser && db) {
      const cartColRef = getCartCollectionRef(currentUser.uid);
      if (cartColRef) {
        if (newQuantity < 1) {
          await deleteDoc(doc(cartColRef, itemId));
        } else {
          await setDoc(doc(cartColRef, itemId), { quantity: newQuantity }, { merge: true });
        }
      }
    }
  };

  const clearCart = async () => {
    storeClearCart();
    if (currentUser && db) {
      const cartColRef = getCartCollectionRef(currentUser.uid);
      if (cartColRef) {
        const snapshot = await getDocs(cartColRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems: storeTotalItems(),
      totalAmount: storeTotalAmount(),
      isCartLoaded,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
