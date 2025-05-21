// Ensure 'use server' is the very first line
'use server';

import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from '@/lib/emailService';

// Helper function to initialize Firebase Admin SDK (singleton pattern)
// This function will now ONLY use environment variables.
function initializeAdminApp() {
  console.log("initializeAdminApp: Called.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized. Apps count:", admin.apps.length);
    return admin.app();
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK using environment variable...");
  let serviceAccountJson;

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== "") {
    console.log("initializeAdminApp: Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);
      console.log("initializeAdminApp: Successfully parsed service account JSON from environment variable.");
    } catch (e: any) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e.message);
      throw new Error("Admin SDK configuration JSON parsing error from environment variable.");
    }
  } else {
    console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    throw new Error("Admin SDK configuration environment variable missing.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log("Firebase Admin SDK initialized successfully via environment variable.");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED:', e.message, e.stack);
    // Log the serviceAccountJson without the private key for debugging if needed
    const { private_key, ...restOfKey } = serviceAccountJson || {};
    console.error("Service account JSON used (private key redacted):", JSON.stringify(restOfKey, null, 2));
    throw new Error(`Admin SDK initialization failed: ${e.message}`);
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: { fullName: string; email: string }
): Promise<{ success: boolean; error?: string }> {
  console.log(`handleUserSignupCompletion: Called for userId: ${userId}, email: ${userData.email}`);
  let adminAppInstance;
  try {
    adminAppInstance = initializeAdminApp();
    console.log("handleUserSignupCompletion: Admin SDK app obtained.");
  } catch (initError: any) {
    console.error("handleUserSignupCompletion: Failed to initialize Admin SDK.", initError.message);
    return { success: false, error: `Server Action Error: ${initError.message}` };
  }

  if (!adminAppInstance) {
      console.error("handleUserSignupCompletion: Admin app instance is null/undefined after initialization attempt.");
      return { success: false, error: "Server Action Error: Admin SDK could not be prepared." };
  }

  const adminDb = admin.firestore(adminAppInstance);
  console.log("handleUserSignupCompletion: Firestore instance obtained from Admin SDK.");

  const userDocRef = adminDb.collection("users").doc(userId);

  try {
    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId} using Admin SDK...`);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      role: 'user',
      disabled: false,
      wishlist: [],
      shippingAddress: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`handleUserSignupCompletion: Firestore document created successfully for user ${userId}.`);

    console.log(`handleUserSignupCompletion: Attempting to send welcome email to ${userData.email}...`);
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (emailResult.success) {
      console.log(`handleUserSignupCompletion: Welcome email sent successfully to ${userData.email}.`);
    } else {
      console.warn(`handleUserSignupCompletion: Welcome email failed to send to ${userData.email}. Error: ${emailResult.error}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore operation or email sending for user ${userId}. Error:`, error.message, error.stack);
    if (error.code) {
        console.error(`Firebase error code: ${error.code}`);
    }
    return {
      success: false,
      error: `Server Action Error: ${error.message || 'An unexpected error occurred during signup completion.'}`,
    };
  }
}
