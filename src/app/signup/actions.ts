
'use server';

import * as admin from 'firebase-admin';
import path from 'path';
import { sendWelcomeEmail } from '@/lib/emailService'; // Assuming this is correctly set up

// Helper function to initialize Firebase Admin SDK (singleton pattern)
function initializeAdminApp() {
  console.log("initializeAdminApp: Called.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized. Apps count:", admin.apps.length);
    return admin.app(); // Return the already initialized default app
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK...");
  let serviceAccountJson;

  const envVarConfig = process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON;

  if (envVarConfig && typeof envVarConfig === 'string' && envVarConfig.trim() !== "") {
    console.log("initializeAdminApp: Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(envVarConfig);
      console.log("initializeAdminApp: Successfully parsed service account JSON from environment variable.");
    } catch (e: any) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e.message);
      throw new Error("Admin SDK configuration JSON parsing error from environment variable.");
    }
  } else {
    console.warn("initializeAdminApp: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    // Fallback to file - less ideal for production, ensure this file is NOT in your client bundle
    // and handle security appropriately (e.g., .gitignore, secure deployment environment)
    const serviceAccountFilePath = path.resolve(process.cwd(), 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json');
    console.warn(`initializeAdminApp: Attempting fallback to require service account key file directly from: ${serviceAccountFilePath}`);
    try {
      serviceAccountJson = require(serviceAccountFilePath);
      console.log("initializeAdminApp: Successfully required service account key from file as fallback.");
    } catch (fileError: any) {
      console.error(`CRITICAL ERROR: Failed to require service account key file as fallback from ${serviceAccountFilePath}. Error: ${fileError.message}`);
      throw new Error("Admin SDK configuration file not found or unreadable.");
    }
  }

  if (!serviceAccountJson) {
    // This case should ideally be caught by the errors thrown above
    console.error("initializeAdminApp: Service account JSON is still undefined after checks.");
    throw new Error("Admin SDK critical configuration failure: service account JSON is undefined.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED:', e.message, e.stack);
    // Log the serviceAccountJson without the private key for debugging if needed
    // const { private_key, ...restOfKey } = serviceAccountJson || {};
    // console.error("Service account JSON used (private key redacted):", JSON.stringify(restOfKey, null, 2));
    throw new Error(`Admin SDK initialization failed: ${e.message}`);
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: { fullName: string; email: string }
) {
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
      // This case should theoretically be caught by the throw in initializeAdminApp
      console.error("handleUserSignupCompletion: Admin app instance is null/undefined after initialization attempt.");
      return { success: false, error: "Server Action Error: Admin SDK could not be prepared." };
  }

  const adminDb = admin.firestore(adminAppInstance); // Get Firestore from the specific app instance
  console.log("handleUserSignupCompletion: Firestore instance obtained from Admin SDK.");

  const userDocRef = adminDb.collection("users").doc(userId);

  try {
    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId}...`);
    await userDocRef.set({
      id: userId, // Storing the UID also in the document for convenience
      name: userData.fullName,
      email: userData.email,
      role: 'user', // Default role
      disabled: false,
      wishlist: [],
      shippingAddress: {}, // Initialize with an empty object or null
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`handleUserSignupCompletion: Firestore document created successfully for user ${userId}.`);

    // Send welcome email
    console.log(`handleUserSignupCompletion: Attempting to send welcome email to ${userData.email}...`);
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (emailResult.success) {
      console.log(`handleUserSignupCompletion: Welcome email sent successfully to ${userData.email}.`);
    } else {
      console.warn(`handleUserSignupCompletion: Welcome email failed to send to ${userData.email}. Error: ${emailResult.error}`);
      // Don't fail the whole operation for an email error, but log it.
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore operation or email sending for user ${userId}. Error:`, error.message, error.stack);
    // Log the error object itself for more details if available
    if (error.code) { // Firebase errors often have a code
        console.error(`Firebase error code: ${error.code}`);
    }
    return {
      success: false,
      error: `Server Action Error: ${error.message || 'An unexpected error occurred during signup completion.'}`,
    };
  }
}
