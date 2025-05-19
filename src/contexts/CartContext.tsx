"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, Product as ProductType } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // To get currentUser for Firestore operations

const CART_LOCAL_STORAGE_KEY = 'mavaziGuestCart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductType, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => Promise<void>;
  loadCartFromFirestore: (userId: string) => Promise<void>;
  mergeGuestCartToFirestore: (userId: string) => Promise<void>;
  totalItems: number;
  totalAmount: number;
  isCartLoaded: boolean;
  clearLocalCart: () => void;
  clearCartContextState: () => void; // For logout
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const { currentUser } = useAuth();

  const getCartCollectionRef = (userId: string) => {
    return collection(db, "users", userId, "cartItems");
  };

  // Load cart from local storage for guests or if no user
  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined') {
      const localCartData = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
      if (localCartData) {
        setCartItems(JSON.parse(localCartData));
      }
      setIsCartLoaded(true);
    }
  }, [currentUser]);

  // Save to local storage for guests
  useEffect(() => {
    if (!currentUser && typeof window !== 'undefined' && isCartLoaded) {
      localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser, isCartLoaded]);

  const loadCartFromFirestore = useCallback(async (userId: string) => {
    setIsCartLoaded(false);
    try {
      const cartColRef = getCartCollectionRef(userId);
      const snapshot = await getDocs(cartColRef);
      const firestoreCartItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CartItem));
      setCartItems(firestoreCartItems);
    } catch (error) {
      console.error("Error loading cart from Firestore:", error);
    } finally {
      setIsCartLoaded(true);
    }
  }, []);
  
  const mergeGuestCartToFirestore = useCallback(async (userId: string) => {
    if (typeof window === 'undefined') return;
    const localCartData = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
    if (!localCartData) return;

    const guestCartItems: CartItem[] = JSON.parse(localCartData);
    if (guestCartItems.length === 0) return;

    try {
      const cartColRef = getCartCollectionRef(userId);
      const batch = writeBatch(db);

      // Fetch current Firestore cart to avoid duplicates and merge quantities
      const snapshot = await getDocs(cartColRef);
      const firestoreCartItemsMap = new Map(snapshot.docs.map(doc => [doc.id, doc.data() as CartItem]));

      guestCartItems.forEach(guestItem => {
        const firestoreItem = firestoreCartItemsMap.get(guestItem.id);
        if (firestoreItem) {
          // Item exists, update quantity (or other merging logic)
          const newQuantity = firestoreItem.quantity + guestItem.quantity;
          batch.update(doc(cartColRef, guestItem.id), { quantity: newQuantity });
        } else {
          // New item, add it
          batch.set(doc(cartColRef, guestItem.id), guestItem);
        }
      });

      await batch.commit();
      console.log("Guest cart merged to Firestore.");
      localStorage.removeItem(CART_LOCAL_STORAGE_KEY); // Clear local cart after merge
      await loadCartFromFirestore(userId); // Reload cart to reflect merged state
    } catch (error) {
      console.error("Error merging guest cart to Firestore:", error);
    }
  }, [loadCartFromFirestore]);


  const addToCart = async (product: ProductType, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === product.id && item.size === selectedSize && item.color === selectedColor
      );
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id && item.size === selectedSize && item.color === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, {
          id: product.id, // Use product.id as the cart item ID for simplicity if variants are simple
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.images[0],
          slug: product.slug,
          size: selectedSize,
          color: selectedColor,
        }];
      }

      if (currentUser) {
        // Update Firestore
        const itemToAddOrUpdate = newItems.find(item => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
        if (itemToAddOrUpdate) {
          const itemDocRef = doc(getCartCollectionRef(currentUser.uid), itemToAddOrUpdate.id); // Use item id for doc id
          setDoc(itemDocRef, itemToAddOrUpdate, { merge: true }).catch(console.error);
        }
      }
      return newItems;
    });
  };

  const removeFromCart = async (itemId: string) => { // itemId is now the specific cart item's ID (product.id + variant info if needed)
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      if (currentUser) {
        deleteDoc(doc(getCartCollectionRef(currentUser.uid), itemId)).catch(console.error);
      }
      return newItems;
    });
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      if (currentUser) {
        const itemToUpdate = newItems.find(item => item.id === itemId);
        if (itemToUpdate) {
            setDoc(doc(getCartCollectionRef(currentUser.uid), itemId), itemToUpdate, {merge: true}).catch(console.error);
        }
      }
      return newItems;
    });
  };
  
  const clearLocalCart = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
    }
  };
  
  const clearCartContextState = () => {
     setCartItems([]);
     setIsCartLoaded(false); // Reset loaded state so it can reload for guest or new user
  }

  const clearCart = async () => {
    if (currentUser) {
      try {
        const cartColRef = getCartCollectionRef(currentUser.uid);
        const snapshot = await getDocs(cartColRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (error) {
        console.error("Error clearing Firestore cart:", error);
      }
    } else {
      clearLocalCart();
    }
    setCartItems([]); // Clear context state immediately
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCartFromFirestore,
      mergeGuestCartToFirestore,
      totalItems,
      totalAmount,
      isCartLoaded,
      clearLocalCart,
      clearCartContextState,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
