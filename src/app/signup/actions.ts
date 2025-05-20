
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { sendWelcomeEmail } from "@/lib/emailService";
// NOTE: No longer attempting to require 'path' or use file system fallbacks here.
// We are solely relying on the embedded service account key for this action.

interface SignupFormValues {
  fullName: string;
  email: string;
}

// --- Helper function to initialize Firebase Admin SDK (Singleton pattern) ---
function initializeAdminApp(): admin.app.App {
  console.log("initializeAdminApp: Called.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized. Returning existing default app.");
    return admin.app(); // Return the already initialized default app
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK with embedded credentials...");
  const serviceAccount: ServiceAccount = {
    "type": "service_account",
    "project_id": "mavazi-market",
    "private_key_id": "c781dbd1ae300c8a536c2fe7160f6ce27918a81f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHnAokBFSnfuL8\nd2LGnLGAQOUQ8gSsVFjalLaZXAux6s4/YTUxEZihv9LpBpFsUz2lqMdDxt0OW3Gg\nE3KSqLkfSPHDfBepWnZxGWw5KU4qekQLIUOXE61nW9D5BL3Ec3tgt9QK9FNOMOSW\nPSgtz3HYScpAoUXGTLGClpwyXRscvIK+VyKvQlSlGnA18ghwIq3DyzZIDVDIwAjo\nk98XMoRBFxAmcj8gJxP5KlrlyXlbQq9tygnGeh8PsCK4PuZHVOyztCBB625H4y4l\nGlyTDZXKmOF350ramFduVGi830cBLMi1LUQ1tXqhKwAjBexVo050sxQQLH5kDaPD\nyylXOUGZAgMBAAECgf9cEjLwlLl3iPpU+byAtZt/om9bzEaGNrcaxlMeP2wlj5O9\nfa52CRJziXJU33K0mgYVeNnGVDQi1eB+CyUOAPANk4KbaOHWe/j7XNP5NH7u7kv0\ngPjBoZHv2v9z3XwANu7x7dkg3xHjPyoxIoR7R58mOjh7Fz3X+gg8SWbtftoX+7YC\nUu2CBM5NqmUHQEHhvMvwTTwsfU5zkISwB4jTKn5a5qMXCoR/aOYZBAHqYToVhxrS\nL0S/KWVoLP7Fht6irHIhESDlt/hvocC5vey3JQtTJp3uvkrhTXbSMDkwT0m/KGFI\naR3XZABu0Q49Oy8Bt2ai2Y/Ge060N2usct1x9kECgYEA6XQuBqlegmYKnDZFMUBn\nRHP5ny0eZjAzYBHJX24rTGgwXcp9Js7X+1r7brG5RbK6JPnHRLQbHa9tAm01kP0w\nqJ0Se71TR3pmwaveNQd6ZNLB+bHGNije2Rs0cqf2Po+sf4Rzzbb5W2L8mxx8d3XZ\ntmRpHWiPg3aP9EKYXNx95aECgYEA2uMbVdasCeo2Pc7xDdH6njm+yTO9RtzCM5V3\n0LuQMXp2V1MUelVw7IUTahgfypct+vkTBBdmdtbNXXiyTvnVUhDSlfYzoMbCp1FR\n3qZX6awUdQ1u0fFK52ImjKj7gs+QRVgzoPJYA3EpLind/mKfsx8aBTKhUT5gVCWG\nLnLL6PkCgYB/7ZtfKSbSHCrKSW8HOzybpVXv5SCYbOdqSLTp54wwlZOTgeetAYIX\nilbn5NobGIKqynlo661ESiJZRxEof6ZPb6t2RVxCeg+fJ5hfxNZMM7X6J3HvsdvU\navUFs4bb541mX2W6H/9rFcZJFYYbTGhea42ygN7L8oeWGXw2vtj6oQKBgQCNi4dF\nvwiJcNeaqJPhKAQ1BYqGedrQVDmROfq9FE1ucY7NcYAwi8f2ayfe17LXQ2QMg7z0\nTF2KQ+WRqFdGEvELnK1RJGDGe0GtCT00CcWX6htghks/oBWcAzCCjVP3h1n4Pc1F\nKvIXZ7oFjDVuJ0C2iEo/SjpfW0LXp1xZ9Qo/oQKBgQCeDho842fz6igzOD7Jn0Vs\nAuY1EREX6Uc0UCL1X46VmiYWIe/9KCjpGDHbDqYdlcOrinFBOKtKRI2vWiOYQ2fw\n1/6UUlSvWVeJH31cTTU8Er759FeVHt8glcqDk46881HxVx4Ivkm9h8Y/7zWQolFE\nE//04mEEMu3uJgEQjSqFag==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-fbsvc@mavazi-market.iam.gserviceaccount.com",
    "client_id": "103851015213759963529",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mavazi-market.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("initializeAdminApp: Firebase Admin SDK initialized successfully.");
    return app;
  } catch (e: any) {
    console.error("CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED with embedded credentials:", e.message, e.stack);
    throw new Error("Admin SDK initialization failed using embedded credentials."); // Re-throw to be caught by caller
  }
}
// --- End of Helper ---


export async function handleUserSignupCompletion(
  userId: string,
  userData: SignupFormValues
): Promise<{ success: boolean; error?: string }> {
  console.log("handleUserSignupCompletion action started for userId:", userId);

  try {
    const adminApp = initializeAdminApp(); // Ensure admin app is initialized
    const adminDb = adminApp.firestore(); // Get Firestore from the initialized admin app
    console.log("handleUserSignupCompletion: Admin SDK app obtained successfully.");

    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId} using Admin SDK...`);
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
    console.error("Error in handleUserSignupCompletion (after SDK init attempt):", error.message, error.stack);
    return { success: false, error: `Server Action Error: ${error.message || "Failed to complete signup due to internal server error."}` };
  }
}
