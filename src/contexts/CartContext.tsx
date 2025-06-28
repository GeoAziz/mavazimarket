
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
  // loadCartFromFirestore: (userId: string) => Promise<void>; // Made internal
  // mergeGuestCartToFirestore: (userId: string) => Promise<void>; // Made internal
  totalItems: number;
  totalAmount: number;
  isCartLoaded: boolean;
  clearLocalCart: () => void;
  clearCartContextState: () => void; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const { currentUser } = useAuth(); // useAuth hook is called here

  const getCartCollectionRef = useCallback((userId: string) => {
    if (!db) return null; // Guard against null db
    return collection(db, "users", userId, "cartItems");
  }, []);

  const loadCartFromFirestore = useCallback(async (userId: string) => {
    console.log("CartContext: Attempting to load cart from Firestore for user:", userId);
    setIsCartLoaded(false);
    try {
      const cartColRef = getCartCollectionRef(userId);
      if (!cartColRef) {
        console.warn("CartContext: Firestore DB not available, cannot load cart.");
        setIsCartLoaded(true);
        return;
      }
      const snapshot = await getDocs(cartColRef);
      const firestoreCartItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CartItem));
      setCartItems(firestoreCartItems);
      console.log("CartContext: Cart loaded from Firestore:", firestoreCartItems);
    } catch (error) {
      console.error("CartContext: Error loading cart from Firestore:", error);
    } finally {
      setIsCartLoaded(true);
    }
  }, [getCartCollectionRef]);
  
  const mergeGuestCartToFirestore = useCallback(async (userId: string) => {
    console.log("CartContext: Attempting to merge guest cart to Firestore for user:", userId);
    const cartColRef = getCartCollectionRef(userId);
    if (typeof window === 'undefined' || !cartColRef) {
      console.warn("CartContext: Firestore DB not available or not in browser, cannot merge cart.");
      return;
    };
    const localCartData = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
    if (!localCartData) {
      console.log("CartContext: No guest cart data to merge.");
      return;
    }

    const guestCartItems: CartItem[] = JSON.parse(localCartData);
    if (guestCartItems.length === 0) {
      console.log("CartContext: Guest cart is empty, nothing to merge.");
      return;
    }

    try {
      const batch = writeBatch(db!); // Use non-null assertion as we've checked for cartColRef

      const snapshot = await getDocs(cartColRef);
      const firestoreCartItemsMap = new Map(snapshot.docs.map(doc => [doc.id, doc.data() as CartItem]));

      guestCartItems.forEach(guestItem => {
        const firestoreItem = firestoreCartItemsMap.get(guestItem.id);
        if (firestoreItem) {
          const newQuantity = firestoreItem.quantity + guestItem.quantity;
          batch.update(doc(cartColRef, guestItem.id), { quantity: newQuantity });
        } else {
          batch.set(doc(cartColRef, guestItem.id), guestItem);
        }
      });

      await batch.commit();
      console.log("CartContext: Guest cart merged to Firestore.");
      localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("CartContext: Error merging guest cart to Firestore:", error);
    }
  }, [getCartCollectionRef]);

  // Effect to handle cart loading/merging based on auth state
  useEffect(() => {
    if (currentUser) {
      console.log("CartContext: User logged in (", currentUser.uid, "), merging and loading Firestore cart.");
      const performAsyncOps = async () => {
        await mergeGuestCartToFirestore(currentUser.uid);
        await loadCartFromFirestore(currentUser.uid);
      };
      performAsyncOps();
    } else {
      console.log("CartContext: No user logged in, loading guest cart from localStorage.");
      if (typeof window !== 'undefined') {
        const localCartData = localStorage.getItem(CART_LOCAL_STORAGE_KEY);
        if (localCartData) {
          setCartItems(JSON.parse(localCartData));
        } else {
          setCartItems([]); // Ensure cart is empty if no local data
        }
      }
      setIsCartLoaded(true);
    }
  }, [currentUser, loadCartFromFirestore, mergeGuestCartToFirestore]);


  const addToCart = async (product: ProductType, quantity: number = 1, selectedSize?: string, selectedColor?: string) => {
    const cartItemId = `${product.id}${selectedSize ? `-${selectedSize}` : ''}${selectedColor ? `-${selectedColor}` : ''}`;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prevItems, {
          id: cartItemId,
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
        const cartColRef = getCartCollectionRef(currentUser.uid);
        if (cartColRef) {
          const itemToAddOrUpdate = newItems.find(item => item.id === cartItemId);
          if (itemToAddOrUpdate) {
            const itemDocRef = doc(cartColRef, itemToAddOrUpdate.id);
            setDoc(itemDocRef, itemToAddOrUpdate, { merge: true }).catch(err => console.error("Error adding/updating item in Firestore cart:", err));
          }
        }
      }
      return newItems;
    });
  };

  const removeFromCart = async (itemId: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      if (currentUser) {
        const cartColRef = getCartCollectionRef(currentUser.uid);
        if (cartColRef) {
            deleteDoc(doc(cartColRef, itemId)).catch(err => console.error("Error removing item from Firestore cart:", err));
        }
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
        const cartColRef = getCartCollectionRef(currentUser.uid);
        if (cartColRef) {
          const itemToUpdate = newItems.find(item => item.id === itemId);
          if (itemToUpdate) {
              setDoc(doc(cartColRef, itemId), itemToUpdate, {merge: true}).catch(err => console.error("Error updating quantity in Firestore cart:", err));
          }
        }
      }
      return newItems;
    });
  };
  
  const clearLocalCart = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
        console.log("CartContext: Local guest cart cleared.");
    }
  };
  
  const clearCartContextState = () => {
     setCartItems([]);
     setIsCartLoaded(false); 
     console.log("CartContext: Context state cleared (e.g., on logout).");
  }

  const clearCart = async () => {
    if (currentUser) {
      try {
        const cartColRef = getCartCollectionRef(currentUser.uid);
        if (cartColRef) {
            const snapshot = await getDocs(cartColRef);
            if (snapshot.docs.length > 0) {
              const batch = writeBatch(db!);
              snapshot.docs.forEach(d => batch.delete(d.ref));
              await batch.commit();
              console.log("CartContext: Firestore cart cleared for user:", currentUser.uid);
            }
        }
      } catch (error) {
        console.error("CartContext: Error clearing Firestore cart:", error);
      }
    } else {
      clearLocalCart();
    }
    setCartItems([]); 
  };

  // Save to local storage for guests
  useEffect(() => {
    if (!currentUser && isCartLoaded) { // Only save if cart is loaded and user is guest
      console.log("CartContext: Saving guest cart to localStorage:", cartItems);
      localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser, isCartLoaded]);


  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
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
