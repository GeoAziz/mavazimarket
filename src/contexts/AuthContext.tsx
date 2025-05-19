
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react'; // Added useCallback
import { auth, db } from '@/lib/firebase';
import type { User as AppUserType } from '@/lib/types';
import { doc, getDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
// Removed direct import of useCart here

const GUEST_WISHLIST_LOCAL_STORAGE_KEY = 'mavaziGuestWishlist';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  appUser: AppUserType | null;
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
  fetchAppUser: (uid: string) => Promise<void>;
  mergeGuestWishlistToFirestore: (userId: string) => Promise<void>; // Added for explicit call
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUserType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // cartContext is no longer initialized at the top level here

  const fetchAppUser = useCallback(async (uid: string) => {
    // Added useCallback for stability if passed as dependency
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
  }, []);

  const mergeGuestWishlistToFirestore = useCallback(async (userId: string) => {
    // Added useCallback
    if (typeof window === 'undefined') return;
    const guestWishlistData = localStorage.getItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
    if (!guestWishlistData) return;

    const guestWishlist: string[] = JSON.parse(guestWishlistData);
    if (guestWishlist.length === 0) return;

    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(...guestWishlist)
      });
      console.log("Guest wishlist merged to Firestore.");
      localStorage.removeItem(GUEST_WISHLIST_LOCAL_STORAGE_KEY);
      await fetchAppUser(userId);
    } catch (error) {
      console.error("Error merging guest wishlist to Firestore:", error);
    }
  }, [fetchAppUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        setCurrentUser(user);
        const adminEmail = "admin@mixostore.com";
        setIsAdmin(user.email === adminEmail);
        
        await fetchAppUser(user.uid);
        // Cart merging/loading will be handled by CartProvider reacting to currentUser
        await mergeGuestWishlistToFirestore(user.uid); 

      } else {
        setCurrentUser(null);
        setAppUser(null);
        setIsAdmin(false);
        // Cart clearing will be handled by CartProvider reacting to currentUser being null
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAppUser, mergeGuestWishlistToFirestore]);

  const value = {
    currentUser,
    appUser,
    isAdmin,
    loading,
    error,
    fetchAppUser,
    mergeGuestWishlistToFirestore, // Provide the function
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
