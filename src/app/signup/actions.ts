
"use server";

import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
  password_not_needed_here?: string; // Password is used directly in client component by Firebase Auth
}


export async function handleUserSignupCompletion(
  userId: string, 
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user document in Firestore
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      id: userId,
      name: userData.fullName,
      email: userData.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      wishlist: [],
      role: 'user', // Default role
    });

    // Send welcome email
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (!emailResult.success) {
      console.warn(`User ${userId} signed up, but welcome email failed:`, emailResult.error);
      // Log this, but don't fail the signup process for it
    }

    return { success: true };
  } catch (error) {
    console.error("Error in handleUserSignupCompletion:", error);
    let errorMessage = "Failed to complete signup process.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
