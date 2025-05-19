"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase'; // db import added
import type { User as AppUserType } from '@/lib/types'; // Renamed to avoid conflict
import { doc, getDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore'; // Added updateDoc, arrayUnion, writeBatch
import { useCart } from './CartContext'; // Import useCart

const GUEST_WISHLIST_LOCAL_STORAGE_KEY = 'mavaziGuestWishlist';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  appUser: AppUserType | null;
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
  fetchAppUser: (uid: string) => Promise<void>; // Expose a function to refetch appUser
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUserType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cartContext = useCart(); // Get cart context

  const fetchAppUser = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setAppUser({ id: userDocSnap.id, ...userDocSnap.data() } as AppUserType);
      } else {
        console.warn("No app user profile found in Firestore for UID:", uid);
        setAppUser(null);
      }
    } catch (e) {
      console.error("Error fetching app user profile:", e);
      setError(e instanceof Error ? e : new Error("Failed to fetch user profile"));
      setAppUser(null);
    }
  };

  const mergeGuestWishlistToFirestore = async (userId: string) => {
    if (typeof window === 'undefined') return;
    const guestWishlistData = localStorage.getItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
    if (!guestWishlistData) return;

    const guestWishlist: string[] = JSON.parse(guestWishlistData);
    if (guestWishlist.length === 0) return;

    try {
      const userDocRef = doc(db, "users", userId);
      // Use arrayUnion to merge without duplicates, or fetch existing and merge manually if more control is needed
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(...guestWishlist) 
      });
      console.log("Guest wishlist merged to Firestore.");
      localStorage.removeItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
      await fetchAppUser(userId); // Re-fetch appUser to update context with merged wishlist
    } catch (error) {
      console.error("Error merging guest wishlist to Firestore:", error);
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        setCurrentUser(user);
        const adminEmail = "admin@mixostore.com"; // Ensure this is your admin email
        setIsAdmin(user.email === adminEmail);
        
        await fetchAppUser(user.uid);

        if (cartContext) {
          await cartContext.mergeGuestCartToFirestore(user.uid); // Merge cart first
          await cartContext.loadCartFromFirestore(user.uid);   // Then load the full Firestore cart
        }
        await mergeGuestWishlistToFirestore(user.uid);

      } else {
        setCurrentUser(null);
        setAppUser(null);
        setIsAdmin(false);
        if (cartContext) {
          cartContext.clearCartContextState(); // Clear cart items from context but keep local storage for guest
          // Optionally load guest cart from local storage here if not already handled by CartContext's own useEffect
          const localCartData = localStorage.getItem('mavaziGuestCart');
          if (localCartData) {
            // This might conflict if CartContext also tries to load. Ensure one source of truth.
            // For simplicity, CartContext handles its own guest loading.
          }
        }
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartContext]); // cartContext added as dependency

  const value = {
    currentUser,
    appUser,
    isAdmin,
    loading,
    error,
    fetchAppUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
