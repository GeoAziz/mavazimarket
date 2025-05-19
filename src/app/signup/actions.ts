
"use server";

import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
// Ensure the path to your service account key is correct relative to this file
// If your project root is three levels up from 'src/app/signup', this path is okay.
// Otherwise, adjust it.
// It's also common to store this JSON as an environment variable in production.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../../../mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json');

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized in signup action.");
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error in signup action', e.stack);
    // If admin SDK fails to initialize, subsequent Firestore operations will fail.
    // You might want to throw this error or handle it more gracefully.
  }
}

const adminDb = admin.firestore();

export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user document in Firestore using Admin SDK (bypasses security rules)
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
      wishlist: [],
      role: 'user', // Default role
      disabled: false,
    });
    console.log(`User document created for ${userId} using Admin SDK.`);

    // Send welcome email
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (!emailResult.success) {
      console.warn(`User ${userId} signed up, but welcome email failed:`, emailResult.error);
      // Log this, but don't fail the signup process for it
    }

    return { success: true };
  } catch (error) {
    console.error("Error in handleUserSignupCompletion (Admin SDK operation):", error);
    let errorMessage = "Failed to complete signup process with Admin SDK.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
