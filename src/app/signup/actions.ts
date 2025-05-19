
"use server";

import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Attempt to load and parse the service account key from environment variable.
let serviceAccountJson: admin.ServiceAccount | undefined;
if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
  try {
    serviceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);
  } catch (e) {
    console.error("CRITICAL ERROR: Failed to parse FIREBASE_ADMIN_SDK_CONFIG_JSON on module load. Admin SDK might not initialize correctly.", e);
    // Depending on error handling, could throw or log. For now, allows function to proceed and try init.
  }
} else {
  console.error("CRITICAL ERROR: FIREBASE_ADMIN_SDK_CONFIG_JSON environment variable is not set on module load. Admin SDK might not initialize correctly.");
}

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
// and if the service account was successfully parsed.
if (serviceAccountJson && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson)
    });
    console.log("Firebase Admin SDK initialized globally in signup action module.");
  } catch (e: any) {
    console.error('Firebase Admin SDK global initialization error in signup action module:', e.stack);
    // If admin SDK fails to initialize here, subsequent calls within functions might also fail or try to re-initialize.
  }
} else if (!serviceAccountJson && !admin.apps.length) {
    console.warn("Firebase Admin SDK cannot be initialized globally because FIREBASE_ADMIN_SDK_CONFIG_JSON was not available or parsed correctly at module load.");
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  
  // Ensure admin app is initialized before trying to use its services
  // This is a fallback if the global initialization didn't run or failed silently
  if (!admin.apps.length) {
    console.warn("Admin SDK not initialized at start of handleUserSignupCompletion. Attempting to re-initialize.");
    if (serviceAccountJson) { // Use the globally loaded/parsed JSON if available
        try {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccountJson) });
            console.log("Firebase Admin SDK re-initialized within handleUserSignupCompletion (fallback).");
        } catch (e:any) {
            console.error("Fallback Admin SDK initialization failed:", e.stack);
            return { success: false, error: "Admin SDK failed to initialize."};
        }
    } else if (process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) { // Try parsing again if not available globally
        try {
            const fallbackServiceAccountJson = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);
            admin.initializeApp({ credential: admin.credential.cert(fallbackServiceAccountJson) });
            console.log("Firebase Admin SDK initialized from ENV within handleUserSignupCompletion (secondary fallback).");
        } catch(e:any) {
            console.error("Secondary fallback Admin SDK initialization from ENV failed:", e.stack);
            return { success: false, error: "Admin SDK configuration parsing error on fallback." };
        }
    } else {
        console.error("Service account key not available for Admin SDK initialization in handleUserSignupCompletion (FIREBASE_ADMIN_SDK_CONFIG_JSON missing).");
        return { success: false, error: "Admin SDK configuration missing." };
    }
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
      // Optionally return a specific error or flag about email failure if critical
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
