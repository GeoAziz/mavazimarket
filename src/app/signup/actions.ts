
"use server";

import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";

interface SignupFormValues {
  fullName: string;
  email: string;
}

// Attempt to load the service account key.
// Using a try-catch block for more robust error handling if the file is missing or path is incorrect.
let serviceAccount: admin.ServiceAccount | undefined;
try {
  // IMPORTANT: Ensure this path is correct relative to the CWD when the server action runs.
  // For Next.js, this path is usually relative to the project root when compiled.
  // Consider using environment variables for service account JSON in production.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  serviceAccount = require('../../../mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json');
} catch (error) {
  console.error("CRITICAL ERROR: Failed to load Firebase service account key. Path might be incorrect or file missing.", error);
  // Depending on your error handling strategy, you might want to throw this error
  // or ensure that functions relying on admin SDK don't execute.
}

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
// and if the service account was successfully loaded.
if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized in signup action module.");
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error in signup action module:', e.stack);
    // If admin SDK fails to initialize, subsequent Firestore operations will fail.
  }
} else if (!serviceAccount) {
    console.error("Firebase Admin SDK cannot be initialized because the service account key is missing or failed to load.");
}


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  // Ensure admin app is initialized before trying to use its services
  if (!admin.apps.length) {
    // This case should ideally not be hit if the module-level initialization worked.
    // However, as a fallback, especially if module-level init had an issue not caught above.
    if (serviceAccount) {
        try {
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            console.log("Firebase Admin SDK re-initialized within handleUserSignupCompletion (fallback).");
        } catch (e:any) {
            console.error("Fallback Admin SDK initialization failed:", e.stack);
            return { success: false, error: "Admin SDK failed to initialize."};
        }
    } else {
        console.error("Service account key not available for Admin SDK initialization in handleUserSignupCompletion.");
        return { success: false, error: "Admin SDK configuration error." };
    }
  }

  const adminDb = admin.firestore(); // Get Firestore instance *after* potential initialization

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
    }

    return { success: true };
  } catch (error) {
    console.error("Error in handleUserSignupCompletion (Admin SDK operation):", error);
    let errorMessage = "Failed to complete signup process with Admin SDK.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
