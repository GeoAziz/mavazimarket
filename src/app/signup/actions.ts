
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
// path module is no longer needed as we are removing the file path fallback
// import path from 'path';

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Helper function to ensure Firebase Admin SDK is initialized only once
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    // console.log("Firebase Admin SDK already initialized.");
    return admin.app(); // Return the already initialized app
  }

  console.log("handleUserSignupCompletion: Attempting to load service account from FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
  let serviceAccountJson: ServiceAccount | undefined;

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("handleUserSignupCompletion: Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON. Content might be invalid JSON.", e);
      throw new Error("Admin SDK configuration JSON parsing error.");
    }
  } else {
    console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    throw new Error("Admin SDK configuration environment variable missing.");
  }

  if (!serviceAccountJson) {
    // This case should ideally not be reached if the above throws, but as a safeguard:
    console.error("handleUserSignupCompletion: serviceAccountJson is undefined after attempting to load from env var.");
    throw new Error("Service account JSON is undefined.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log("Firebase Admin SDK initialized successfully by initializeAdminApp().");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() failed:', e.message, e.stack);
    if (e.message.includes('already initialized')) {
      console.warn("Admin SDK: Attempted to initialize when already initialized. Returning existing app.");
      return admin.app();
    }
    throw new Error(`Admin SDK initialization failed with error: ${e.message}`);
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  console.log("handleUserSignupCompletion action started for userId:", userId);

  try {
    initializeAdminApp(); // Ensure admin app is initialized
    const adminDb = admin.firestore(); // Get Firestore instance from the initialized app

    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      role: 'user',
      disabled: false,
      wishlist: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User document created/updated for ${userId} using Admin SDK.`);

    sendWelcomeEmail(userData.email, userData.fullName)
      .then(emailResult => {
        if (!emailResult.success) {
          console.warn(`User ${userId} signed up, but welcome email failed:`, emailResult.error);
        } else {
          console.log(`Welcome email successfully queued for ${userData.email}`);
        }
      })
      .catch(emailError => {
        console.warn(`User ${userId} signed up, but an error occurred while trying to send welcome email:`, emailError);
      });

    return { success: true };

  } catch (error) {
    console.error("Error in handleUserSignupCompletion (Admin SDK operation or initialization):", error);
    let errorMessage = "Failed to complete signup process due to an internal server error.";
    if (error instanceof Error) {
      // More specific error messages from the initializeAdminApp helper or Firestore operation
      errorMessage = error.message; 
    }
    // Prepend a clear indicator for the client-side error reporting
    return { success: false, error: `Server Action Error: ${errorMessage}` };
  }
}
    