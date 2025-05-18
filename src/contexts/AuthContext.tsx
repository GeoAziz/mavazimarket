
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types'; // Your app's User type
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  appUser: User | null; // Your application's user profile type
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      if (user) {
        setCurrentUser(user);
        // Check for admin role (e.g., via email or custom claim if set up)
        // For simplicity, we'll check the email you provided for admin
        const adminEmail = "admin@mixostore.com";
        setIsAdmin(user.email === adminEmail);

        // Fetch app-specific user profile from Firestore
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setAppUser({ id: userDocSnap.id, ...userDocSnap.data() } as User);
          } else {
            console.warn("No app user profile found in Firestore for UID:", user.uid);
            setAppUser(null); // Or create one if necessary
          }
        } catch (e) {
          console.error("Error fetching app user profile:", e);
          setError(e instanceof Error ? e : new Error("Failed to fetch user profile"));
          setAppUser(null);
        }

      } else {
        setCurrentUser(null);
        setAppUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    appUser,
    isAdmin,
    loading,
    error
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
