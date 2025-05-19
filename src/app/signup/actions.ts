
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
}

export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  
  console.log("handleUserSignupCompletion: Action started for userId:", userId);

  let serviceAccountJson: ServiceAccount | undefined;

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
    console.log("handleUserSignupCompletion: FIREBASE_ADMIN_SDK_CONFIG_JSON found.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("handleUserSignupCompletion: Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON in handleUserSignupCompletion.", e);
      return { success: false, error: "Admin SDK configuration JSON parsing error." };
    }
  } else {
    console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set when calling handleUserSignupCompletion.");
    return { success: false, error: "Admin SDK configuration missing." };
  }

  // Initialize Firebase Admin SDK only if it hasn't been initialized yet
  // and if the service account was successfully parsed.
  if (!admin.apps.length) {
    if (serviceAccountJson) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountJson),
        });
        console.log("Firebase Admin SDK initialized in signup action.");
      } catch (e: any) {
        console.error('Firebase Admin SDK initialization error in signup action:', e.stack);
        return { success: false, error: "Admin SDK failed to initialize." };
      }
    } else {
      // This case should ideally not be reached if the above checks are in place,
      // but as a safeguard:
      console.error("Firebase Admin SDK cannot be initialized because serviceAccountJson is undefined (should have been caught earlier).");
      return { success: false, error: "Admin SDK service account undefined before initialization."};
    }
  } else {
    console.log("Firebase Admin SDK already initialized.");
  }

  const adminDb = admin.firestore();

  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      wishlist: [],
      role: 'user',
      disabled: false,
    });
    console.log(`User document created for ${userId} using Admin SDK.`);

    // Send welcome email
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (!emailResult.success) {
      console.warn(`User ${userId} signed up, but welcome email failed:`, emailResult.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in handleUserSignupCompletion (Admin SDK Firestore operation):", error);
    let errorMessage = "Failed to complete signup process with Admin SDK Firestore operation.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
