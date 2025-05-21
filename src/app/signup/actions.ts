// Ensure 'use server' is the very first line
'use server';

import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { sendWelcomeEmail } from '@/lib/emailService';
// Removed path import as we are solely relying on env var

// Helper function to initialize Firebase Admin SDK (singleton pattern)
// This function will now ONLY use environment variables.
function initializeAdminApp(): admin.app.App {
  console.log("initializeAdminApp: Called.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized. Apps count:", admin.apps.length);
    return admin.app();
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK using environment variable...");
  let serviceAccountJson;

  const serviceAccountEnvVar = process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON;

  if (serviceAccountEnvVar && serviceAccountEnvVar.trim() !== "") {
    console.log("initializeAdminApp: Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(serviceAccountEnvVar);
      console.log("initializeAdminApp: Successfully parsed service account JSON from environment variable.");
      console.log("initializeAdminApp: Keys found in parsed service account JSON:", Object.keys(serviceAccountJson));

      // Explicitly check for required fields before passing to admin.credential.cert()
      if (!serviceAccountJson.client_email || typeof serviceAccountJson.client_email !== 'string') {
        console.error("CRITICAL ERROR: Parsed service account JSON is missing or has invalid 'client_email'. Value:", serviceAccountJson.client_email);
        throw new Error("Service account object from environment variable must contain a valid string 'client_email' property.");
      }
      if (!serviceAccountJson.private_key || typeof serviceAccountJson.private_key !== 'string') {
        console.error("CRITICAL ERROR: Parsed service account JSON is missing or has invalid 'private_key'.");
        throw new Error("Service account object from environment variable must contain a valid string 'private_key' property.");
      }
      if (!serviceAccountJson.project_id || typeof serviceAccountJson.project_id !== 'string') {
        console.error("CRITICAL ERROR: Parsed service account JSON is missing or has invalid 'project_id'. Value:", serviceAccountJson.project_id);
        throw new Error("Service account object from environment variable must contain a valid string 'project_id' property.");
      }

    } catch (e: any) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e.message);
      throw new Error(`Admin SDK configuration JSON parsing error: ${e.message}`);
    }
  } else {
    console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    throw new Error("Admin SDK configuration environment variable missing.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson), // serviceAccountJson is now guaranteed to be an object
    });
    console.log("initializeAdminApp: Firebase Admin SDK initialized successfully via environment variable.");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED:', e.message, e.stack);
    // Log the serviceAccountJson without the private key for debugging if needed
    const { private_key, ...restOfKey } = serviceAccountJson || {};
    console.error("initializeAdminApp: Service account JSON used (private key redacted):", JSON.stringify(restOfKey, null, 2));
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
      // This case should ideally be caught by the throw in initializeAdminApp
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
      role: 'user', // Default role
      disabled: false, // Default status
      wishlist: [],
      shippingAddress: {}, // Default empty shipping address
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
      // Optionally, you might want to return this non-critical error to the client if email is essential
      // For now, we prioritize account creation.
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore operation or email sending for user ${userId}. Error:`, error.message, error.stack);
    if (error.code) { // Firebase errors often have a code
        console.error(`Firebase error code: ${error.code}`);
    }
    return {
      success: false,
      error: `Server Action Error: ${error.message || 'An unexpected error occurred during signup completion.'}`,
    };
  }
}
