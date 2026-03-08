
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

/**
 * CartProvider - The Synchronized Logistics Coordinator
 * Bridges the gap between local persistence (Zustand/localStorage) and cloud persistence (Firestore).
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { 
    cartItems, 
    addToCart: storeAddToCart, 
    removeFromCart: storeRemoveFromCart, 
    updateQuantity: storeUpdateQuantity, 
    clearCart: storeClearCart, 
    setCartItems: storeSetCartItems,
    totalItems: storeTotalItems, 
    totalAmount: storeTotalAmount 
  } = useCartStore();
  
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const { currentUser } = useAuth();

  const getCartCollectionRef = useCallback((userId: string) => {
    if (!db) return null;
    return collection(db, "users", userId, "cartItems");
  }, []);

  /**
   * Dual-Sync Logic: Synchronization between Guest Local Storage and User Cloud Archive
   */
  useEffect(() => {
    const syncCartWithCloud = async () => {
      if (currentUser && db) {
        setIsCartLoaded(false);
        try {
          const cartColRef = getCartCollectionRef(currentUser.uid);
          if (!cartColRef) return;

          const snapshot = await getDocs(cartColRef);
          const firestoreItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CartItem));
          
          // Logic: Merge local items into Firestore if user just logged in
          if (cartItems.length > 0) {
            const batch = writeBatch(db);
            const mergedItems = [...firestoreItems];

            cartItems.forEach(localItem => {
              const existingIndex = mergedItems.findIndex(i => i.id === localItem.id);
              if (existingIndex > -1) {
                // Update quantity if item exists in both
                mergedItems[existingIndex].quantity += localItem.quantity;
                batch.set(doc(cartColRef, localItem.id), { quantity: mergedItems[existingIndex].quantity }, { merge: true });
              } else {
                // Add new item from local to cloud
                mergedItems.push(localItem);
                batch.set(doc(cartColRef, localItem.id), localItem);
              }
            });

            await batch.commit();
            storeSetCartItems(mergedItems);
          } else if (firestoreItems.length > 0) {
            // Load cloud cart if local store was empty
            storeSetCartItems(firestoreItems);
          }
        } catch (error) {
          console.error("Cart Logistics Error (Cloud Sync):", error);
        } finally {
          setIsCartLoaded(true);
        }
      } else {
        // Guest mode: Zustand handles persist via localStorage automatically
        setIsCartLoaded(true);
      }
    };

    syncCartWithCloud();
    
    // Clear cart on logout to prevent state leak between users on same machine
    if (!currentUser && isCartLoaded) {
      storeClearCart();
    }
  }, [currentUser]);

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
          quantity: (cartItems.find(i => i.id === cartItemId)?.quantity || 0) + quantity, 
          image: product.images[0],
          slug: product.slug,
          size: selectedSize || 'OS',
          color: selectedColor || 'Default',
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
