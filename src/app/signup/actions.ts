
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
import path from 'path'; // For constructing absolute path in fallback

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Attempt to initialize Firebase Admin SDK only if it hasn't been initialized yet.
// This structure helps prevent "already initialized" errors.
if (!admin.apps.length) {
  let serviceAccountJson: ServiceAccount | undefined;
  const expectedServiceAccountFileName = 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json';

  console.log("handleUserSignupCompletion (module scope): Checking for Admin SDK configuration...");

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
    console.log("handleUserSignupCompletion (module scope): Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("handleUserSignupCompletion (module scope): Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR (module scope): Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON. Content might be invalid JSON.", e);
      serviceAccountJson = undefined;
    }
  } else {
    console.warn("handleUserSignupCompletion (module scope): FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    console.warn("handleUserSignupCompletion (module scope): Attempting fallback to require service account key file directly from project root...");
    try {
      const serviceAccountPath = path.join(process.cwd(), expectedServiceAccountFileName);
      console.log(`handleUserSignupCompletion (module scope): Trying to require service account key from absolute path: ${serviceAccountPath}`);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      serviceAccountJson = require(serviceAccountPath) as ServiceAccount;
      console.log("handleUserSignupCompletion (module scope): Successfully required service account key file as fallback.");
    } catch (fileError) {
      console.error(`CRITICAL ERROR (module scope): Failed to require service account key file '${expectedServiceAccountFileName}' from project root as fallback. Ensure the file exists at the project root.`, fileError);
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
      // If initialization fails here, subsequent adminDb calls will fail.
    }
  } else {
    console.error("CRITICAL ERROR (module scope): Service account JSON is undefined. Firebase Admin SDK cannot be initialized at module scope.");
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {

  console.log("handleUserSignupCompletion action started for userId:", userId);

  // Ensure Admin SDK is initialized (it might have been initialized at module scope or needs it now)
  if (!admin.apps.length) {
    console.warn("handleUserSignupCompletion action: Admin SDK not initialized at module scope, attempting again or configuration was faulty.");
    // Re-attempt loading credentials logic here if it wasn't successful at module scope,
    // or rely on the initial module scope attempt and fail if it wasn't set up.
    // For robustness, let's include the check again, though it indicates a setup issue if module-scope init failed.
    let serviceAccountJson: ServiceAccount | undefined;
    const expectedServiceAccountFileName = 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json';

    if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
        try {
            serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);
        } catch (e) {
            console.error("CRITICAL (action scope): Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e);
            return { success: false, error: "Admin SDK configuration JSON parsing error (action scope)." };
        }
    } else {
        console.warn("CRITICAL (action scope): FIREBASE_ADMIN_SDK_CONFIG_JSON env var not set. Trying file fallback.");
        try {
            const serviceAccountPath = path.join(process.cwd(), expectedServiceAccountFileName);
            console.log(`handleUserSignupCompletion (action scope): Trying to require service account key from absolute path: ${serviceAccountPath}`);
            serviceAccountJson = require(serviceAccountPath) as ServiceAccount;
        } catch (fileError) {
            console.error(`CRITICAL (action scope): Failed to require service account key '${expectedServiceAccountFileName}' from project root as fallback.`, fileError);
            return { success: false, error: "Admin SDK configuration file not found (action scope)." };
        }
    }

    if (serviceAccountJson) {
        try {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
            console.log("Firebase Admin SDK initialized successfully (action scope).");
        } catch (e: any) {
            console.error('CRITICAL (action scope): Firebase Admin SDK initialization failed:', e.message);
            return { success: false, error: "Admin SDK initialization failed with error (action scope)." };
        }
    } else {
        console.error("CRITICAL (action scope): Firebase Admin SDK cannot be initialized because serviceAccountJson is undefined.");
        return { success: false, error: "Admin SDK not initialized due to missing/invalid configuration (action scope)." };
    }
  }
  
  // Check again if apps array is populated after trying to initialize
  if (!admin.apps.length) {
    console.error("handleUserSignupCompletion action: Firebase Admin SDK is STILL not initialized after attempts. Configuration is definitely missing or invalid.");
    return { success: false, error: "Admin SDK critically failed to initialize. Check server logs for credential loading issues." };
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
    console.log(`User document created for ${userId} using Admin SDK.`);

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
