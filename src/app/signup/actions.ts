
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
import path from 'path'; // Ensure path is imported

interface SignupFormValues {
  fullName: string;
  email: string;
}

// This structure helps prevent "already initialized" errors if the action is called multiple times.
// The goal is to initialize the admin app only once per server instance.
if (!admin.apps.length) {
  let serviceAccountJson: ServiceAccount | undefined;
  console.log("handleUserSignupCompletion (module scope): Checking for Admin SDK configuration...");
  console.log("handleUserSignupCompletion (module scope): Current working directory (process.cwd()):", process.cwd());
  console.log("handleUserSignupCompletion (module scope): NODE_ENV:", process.env.NODE_ENV);


  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
    console.log("handleUserSignupCompletion (module scope): Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("handleUserSignupCompletion (module scope): Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR (module scope): Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON. Content might be invalid JSON.", e);
      serviceAccountJson = undefined; // Ensure it's undefined if parsing fails
    }
  } else {
    console.warn("handleUserSignupCompletion (module scope): FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    const fallbackPath = path.resolve(process.cwd(), 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json');
    console.warn(`handleUserSignupCompletion (module scope): Attempting fallback to require service account key file directly from project root. Absolute path: ${fallbackPath}`);
    try {
      serviceAccountJson = require(fallbackPath) as ServiceAccount;
      console.log(`handleUserSignupCompletion (module scope): Successfully required service account key file as fallback from: ${fallbackPath}`);
    } catch (fileError: any) {
      console.error(`CRITICAL ERROR (module scope): Failed to require service account key file '${path.basename(fallbackPath)}' using fallback. Path attempted: ${fallbackPath}. Error:`, fileError.message, fileError.stack);
      serviceAccountJson = undefined;
    }
  }

  if (serviceAccountJson) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      console.log("Firebase Admin SDK initialized successfully (module scope).");
    } catch (e: any) {
      console.error('CRITICAL ERROR (module scope): Firebase Admin SDK initialization failed:', e.message, e.stack);
      if (e.message.includes('already initialized')) {
        console.log("Admin SDK (module scope): Already initialized by another part of the application or a previous call.");
      }
    }
  } else {
    console.error("CRITICAL ERROR (module scope): Service account JSON is undefined after all attempts. Firebase Admin SDK cannot be initialized at module scope. Ensure FIREBASE_ADMIN_SDK_CONFIG_JSON env var is set OR the key file is in the project root and readable, and its path is correct.");
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {

  console.log("handleUserSignupCompletion action started for userId:", userId);
  
  // Final check: If admin SDK is still not initialized, it's a critical failure.
  if (!admin.apps.length) {
    console.error("handleUserSignupCompletion (action scope): Firebase Admin SDK is STILL NOT INITIALIZED. This indicates a critical failure in loading credentials at module scope. Check server startup logs for credential loading issues (env var or file path/content).");
    return { success: false, error: "Admin SDK critically failed to initialize. Check server logs." };
  }

  const adminDb = admin.firestore();

  try {
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

    // No need to await email sending for the core signup completion success/failure
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
    console.error("Error in handleUserSignupCompletion (Admin SDK Firestore operation):", error);
    let errorMessage = "Failed to complete signup process with Admin SDK Firestore operation.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
