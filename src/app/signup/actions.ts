
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
import path from 'path'; // Ensure path is imported

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Attempt to initialize Firebase Admin SDK only if it hasn't been initialized yet.
// This structure helps prevent "already initialized" errors.
if (!admin.apps.length) {
  let serviceAccountJson: ServiceAccount | undefined;
  const expectedServiceAccountFileName = 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json';

  console.log("Admin SDK (module scope): Checking for Admin SDK configuration...");

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
    console.log("Admin SDK (module scope): Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("Admin SDK (module scope): Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR (module scope): Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON. Content might be invalid JSON.", e);
      serviceAccountJson = undefined;
    }
  } else {
    console.warn("Admin SDK (module scope): FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set or is empty.");
    console.warn("Admin SDK (module scope): Attempting fallback to require service account key file directly from project root...");
    try {
      const serviceAccountPath = path.join(process.cwd(), expectedServiceAccountFileName);
      console.log(`Admin SDK (module scope): Trying to require service account key from absolute path: ${serviceAccountPath}`);
      serviceAccountJson = require(serviceAccountPath) as ServiceAccount; // Use the absolute path
      console.log(`Admin SDK (module scope): Successfully required service account key file as fallback from: ${serviceAccountPath}`);
    } catch (fileError) {
      console.error(`CRITICAL ERROR (module scope): Failed to require service account key file '${expectedServiceAccountFileName}' from project root as fallback using path: ${path.join(process.cwd(), expectedServiceAccountFileName)}. Error:`, fileError);
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
      // If it's "already initialized", that's okay, means another part of the code initialized it.
      if (!e.message.includes('already initialized')) {
        // Potentially problematic if this fails silently here, error might surface later
      } else {
        console.log("Admin SDK (module scope): Already initialized by another part of the application or a previous call.");
      }
    }
  } else {
    console.error("CRITICAL ERROR (module scope): Service account JSON is undefined. Firebase Admin SDK cannot be initialized at module scope. Ensure FIREBASE_ADMIN_SDK_CONFIG_JSON env var is set OR the key file is in the project root and readable.");
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {

  console.log("handleUserSignupCompletion action started for userId:", userId);
  
  // Ensure Admin SDK is initialized specifically for this function call if not done at module scope
  if (!admin.apps.length) {
    console.warn("handleUserSignupCompletion: Admin SDK not initialized at module scope, attempting initialization within action...");
    let serviceAccountJsonInstance: ServiceAccount | undefined;
    const expectedServiceAccountFileNameInstance = 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json';

    if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON && process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON.trim() !== '') {
        console.log("handleUserSignupCompletion (action scope): Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
        try {
            serviceAccountJsonInstance = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);
             console.log("handleUserSignupCompletion (action scope): Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
        } catch (e) {
            console.error("CRITICAL ERROR (action scope): Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e);
            return { success: false, error: "Admin SDK configuration JSON parsing error (action scope)." };
        }
    } else {
        console.warn("handleUserSignupCompletion (action scope): FIREBASE_ADMIN_SDK_CONFIG_JSON env var not set. Trying file fallback.");
        try {
            const serviceAccountPathInstance = path.join(process.cwd(), expectedServiceAccountFileNameInstance);
            console.log(`handleUserSignupCompletion (action scope): Trying to require service account key from absolute path: ${serviceAccountPathInstance}`);
            serviceAccountJsonInstance = require(serviceAccountPathInstance) as ServiceAccount;
            console.log(`handleUserSignupCompletion (action scope): Successfully required service account key file as fallback from: ${serviceAccountPathInstance}`);
        } catch (fileError) {
            console.error(`CRITICAL ERROR (action scope): Failed to require service account key '${expectedServiceAccountFileNameInstance}' using path: ${path.join(process.cwd(), expectedServiceAccountFileNameInstance)}. Error:`, fileError);
            // This is a likely point for the "Module not found" error if the path is still wrong or file missing
            return { success: false, error: `Admin SDK configuration file not found at specified path. Attempted: ${path.join(process.cwd(), expectedServiceAccountFileNameInstance)}` };
        }
    }

    if (serviceAccountJsonInstance) {
        try {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccountJsonInstance) });
            console.log("Firebase Admin SDK initialized successfully (action scope).");
        } catch (e: any) {
            console.error('CRITICAL ERROR (action scope): Firebase Admin SDK initialization failed:', e.message);
            if (!e.message.includes('already initialized')) {
                 return { success: false, error: "Admin SDK initialization failed with error (action scope)." };
            } else {
                 console.log("Admin SDK (action scope): Already initialized, proceeding.");
            }
        }
    } else {
        console.error("handleUserSignupCompletion (action scope): Firebase Admin SDK cannot be initialized because serviceAccountJsonInstance is undefined.");
        return { success: false, error: "Admin SDK not initialized due to missing/invalid configuration (action scope)." };
    }
  }
  
  if (!admin.apps.length) {
    console.error("handleUserSignupCompletion: Firebase Admin SDK is STILL not initialized after attempts. Configuration is definitely missing or invalid. Check server logs for credential loading issues (env var or file path/content).");
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

  