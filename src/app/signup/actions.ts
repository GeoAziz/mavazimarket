
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Helper function to initialize Firebase Admin SDK (Singleton pattern)
// This function should only be called from within server actions.
function initializeAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    // console.log("initializeAdminApp: Firebase Admin SDK already initialized. Returning existing app.");
    return admin.app(); // Return the already initialized app
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK.");
  const serviceAccountEnvVar = process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON;

  if (!serviceAccountEnvVar || serviceAccountEnvVar.trim() === '') {
    console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty in initializeAdminApp.");
    throw new Error("Admin SDK configuration environment variable missing.");
  }

  let serviceAccountJson: ServiceAccount;
  try {
    serviceAccountJson = JSON.parse(serviceAccountEnvVar);
    // console.log("initializeAdminApp: Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
  } catch (e: any) {
    console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON. Content might be invalid JSON.", e.message);
    throw new Error("Admin SDK configuration JSON parsing error.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log("initializeAdminApp: Firebase Admin SDK initialized successfully.");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() failed:', e.message);
    throw new Error(`Admin SDK initialization failed with error: ${e.message}`);
  }
}

export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  console.log("handleUserSignupCompletion action started for userId:", userId);

  try {
    const adminApp = initializeAdminApp(); // Ensure admin app is initialized
    const adminDb = adminApp.firestore();

    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId}...`);
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
    console.log(`User document created for ${userId} in Firestore using Admin SDK.`);

    console.log(`handleUserSignupCompletion: Attempting to send welcome email to ${userData.email}...`);
    // Intentionally not awaiting sendWelcomeEmail to avoid making signup completion dependent on email success
    sendWelcomeEmail(userData.email, userData.fullName)
      .then(emailResult => {
        if (!emailResult.success) {
          console.warn(`User ${userId} signed up, but welcome email failed to send:`, emailResult.error);
        } else {
          console.log(`Welcome email successfully queued for ${userData.email}`);
        }
      })
      .catch(emailError => {
        console.error(`User ${userId} signed up, but an unhandled error occurred while trying to send welcome email:`, emailError);
      });

    return { success: true };

  } catch (error: any) {
    console.error("Error in handleUserSignupCompletion:", error.message, error.stack);
    // The error message from initializeAdminApp will propagate here if it throws
    return { success: false, error: `Server Action Error: ${error.message || "Failed to complete signup due to internal server error."}` };
  }
}
