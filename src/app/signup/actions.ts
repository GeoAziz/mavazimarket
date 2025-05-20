
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Attempt to initialize Firebase Admin SDK only if it hasn't been initialized yet.
// This structure helps prevent "already initialized" errors if the action is called multiple times
// or if other server-side code also initializes admin.
if (!admin.apps.length) {
  let serviceAccountJson: ServiceAccount | undefined;
  console.log("handleUserSignupCompletion: Checking for Admin SDK configuration...");

  if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
    console.log("handleUserSignupCompletion: Found FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable.");
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) as ServiceAccount;
      console.log("handleUserSignupCompletion: Successfully parsed FIREBASE_ADMIN_SDK_CONFIG_JSON.");
    } catch (e) {
      console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON.", e);
      serviceAccountJson = undefined; // Ensure it's undefined if parsing fails
    }
  } else {
    console.warn("handleUserSignupCompletion: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set.");
    console.warn("handleUserSignupCompletion: Attempting fallback to require service account key file directly (not recommended for production).");
    try {
      // Path relative from the CJS output directory (e.g., .next/server/app/signup/actions.js) to the project root
      // This path might need adjustment based on your specific build output structure if it differs.
      // A common structure is actions.js being in .next/server/app/your-route/
      // So, going up three levels gets to .next/server/, then one more to .next/, then one more to project root.
      // This path can be fragile. Using environment variables is STRONGLY preferred.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      serviceAccountJson = require('../../../mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json') as ServiceAccount;
      console.log("handleUserSignupCompletion: Successfully required service account key file as fallback.");
    } catch (fileError) {
      console.error("CRITICAL ERROR: Failed to require service account key file as fallback.", fileError);
      serviceAccountJson = undefined;
    }
  }

  if (serviceAccountJson) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      console.log("Firebase Admin SDK initialized successfully in signup action.");
    } catch (e: any) {
      console.error('CRITICAL ERROR: Firebase Admin SDK initialization failed:', e.message, e.stack);
      // If initialization fails here, subsequent adminDb calls will fail.
      // The function will likely return an error based on adminDb not being available.
    }
  } else {
    console.error("CRITICAL ERROR: Service account JSON is undefined. Firebase Admin SDK cannot be initialized.");
  }
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  
  console.log("handleUserSignupCompletion: Action started for userId:", userId);

  if (!admin.apps.length) {
    // This case means the initial attempt to initialize (outside this function or at module load) failed
    // and the serviceAccountJson was not available or parsing failed.
    console.error("handleUserSignupCompletion: Firebase Admin SDK is not initialized. Configuration was likely missing or invalid.");
    return { success: false, error: "Admin SDK not initialized due to missing/invalid configuration." };
  }

  const adminDb = admin.firestore();

  try {
    const userDocRef = adminDb.collection("users").doc(userId);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      role: 'user', // Default role
      disabled: false, // Default status
      wishlist: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User document created for ${userId} using Admin SDK.`);

    // Send welcome email
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (!emailResult.success) {
      console.warn(`User ${userId} signed up, but welcome email failed:`, emailResult.error);
      // Don't fail the whole signup for email error, but log it.
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
