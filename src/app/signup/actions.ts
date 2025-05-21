// Ensure 'use server' is the very first line
'use server';

import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth'; // Not directly used but good for context
import { sendWelcomeEmail } from '@/lib/emailService';
// No longer importing 'path' as we are not using file paths here

// Helper function to initialize Firebase Admin SDK (singleton pattern)
// CREDENTIALS ARE NOW EMBEDDED DIRECTLY
function initializeAdminApp(): admin.app.App {
  console.log("initializeAdminApp: Called from signup action.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized. Returning existing app.");
    return admin.app();
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK with embedded credentials...");

  // Directly embed your service account key JSON object here
  // Ensure the private_key has its newlines preserved correctly.
  // Using template literals for the private_key helps maintain newlines.
  const serviceAccountJson = {
    "type": "service_account",
    "project_id": "mavazi-market",
    "private_key_id": "c781dbd1ae300c8a536c2fe7160f6ce27918a81f",
    "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHnAokBFSnfuL8\nd2LGnLGAQOUQ8gSsVFjalLaZXAux6s4/YTUxEZihv9LpBpFsUz2lqMdDxt0OW3Gg\nE3KSqLkfSPHDfBepWnZxGWw5KU4qekQLIUOXE61nW9D5BL3Ec3tgt9QK9FNOMOSW\nPSgtz3HYScpAoUXGTLGClpwyXRscvIK+VyKvQlSlGnA18ghwIq3DyzZIDVDIwAjo\nk98XMoRBFxAmcj8gJxP5KlrlyXlbQq9tygnGeh8PsCK4PuZHVOyztCBB625H4y4l\nGlyTDZXKmOF350ramFduVGi830cBLMi1LUQ1tXqhKwAjBexVo050sxQQLH5kDaPD\nyylXOUGZAgMBAAECgf9cEjLwlLl3iPpU+byAtZt/om9bzEaGNrcaxlMeP2wlj5O9\nfa52CRJziXJU33K0mgYVeNnGVDQi1eB+CyUOAPANk4KbaOHWe/j7XNP5NH7u7kv0\ngPjBoZHv2v9c3XwANu7x7dkg3xHjPyoxIoR7R58mOjh7Fz3X+gg8SWbtftoX+7YC\nUu2CBM5NqmUHQEHhvMvwTTwsfU5zkISwB4jTKn5a5qMXCoR/aOYZBAHqYToVhxrS\nL0S/KWVoLP7Fht6irHIhESDlt/hvocC5vey3JQtTJp3uvkrhTXbSMDkwT0m/KGFI\naR3XZABu0Q49Oy8Bt2ai2Y/Ge060N2usct1x9kECgYEA6XQuBqlegmYKnDZFMUBn\nRHP5ny0eZjAzYBHJX24rTGgwXcp9Js7X+1r7brG5RbK6JPnHRLQbHa9tAm01kP0w\nqJ0Se71TR3pmwaveNQd6ZNLB+bHGNije2Rs0cqf2Po+sf4Rzzbb5W2L8mxx8d3XZ\ntmRpHWiPg3aP9EKYXNx95aECgYEA2uMbVdasCeo2Pc7xDdH6njm+yTO9RtzCM5V3\n0LuQMXp2V1MUelVw7IUTahgfypct+vkTBBdmdtbNXXiyTvnVUhDSlfYzoMbCp1FR\n3qZX6awUdQ1u0fFK52ImjKj7gs+QRVgzoPJYA3EpLind/mKfsx8aBTKhUT5gVCWG\nLnLL6PkCgYB/7ZtfKSbSHCrKSW8HOzybpVXv5SCYbOdqSLTp54wwlZOTgeetAYIX\nilbn5NobGIKqynlo661ESiJZRxEof6ZPb6t2RVxCeg+fJ5hfxNZMM7X6J3HvsdvU\navUFs4bb541mX2W6H/9rFcZJFYYbTGhea42ygN7L8oeWGXw2vtj6oQKBgQCNi4dF\nvwiJcNeaqJPhKAQ1BYqGedrQVDmROfq9FE1ucY7NcYAwi8f2ayfe17LXQ2QMg7z0\nTF2KQ+WRqFdGEvELnK1RJGDGe0GtCT00CcWX6htghks/oBWcAzCCjVP3h1n4Pc1F\nKvIXZ7oFjDVuJ0C2iEo/SjpfW0LXp1xZ9Qo/oQKBgQCeDho842fz6igzOD7Jn0Vs\nAuY1EREX6Uc0UCL1X46VmiYWIe/9KCjpGDHbDqYdlcOrinFBOKtKRI2vWiOYQ2fw\n1/6UUlSvWVeJH31cTTU8Er759FeVHt8glcqDk46881HxVx4Ivkm9h8Y/7zWQolFE\nE//04mEEMu3uJgEQjSqFag==\n-----END PRIVATE KEY-----`,
    "client_email": "firebase-adminsdk-fbsvc@mavazi-market.iam.gserviceaccount.com",
    "client_id": "103851015213759963529",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mavazi-market.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  } as admin.ServiceAccount; // Type assertion for clarity

  // Critical sanity checks for the embedded object
  if (!serviceAccountJson.project_id) {
    console.error("CRITICAL ERROR: Embedded service account JSON is missing 'project_id'.");
    throw new Error("Admin SDK: Embedded credentials error - missing project_id.");
  }
  if (!serviceAccountJson.client_email) {
    console.error("CRITICAL ERROR: Embedded service account JSON is missing 'client_email'.");
    throw new Error("Admin SDK: Embedded credentials error - missing client_email.");
  }
  if (!serviceAccountJson.private_key) {
    console.error("CRITICAL ERROR: Embedded service account JSON is missing 'private_key'.");
    throw new Error("Admin SDK: Embedded credentials error - missing private_key.");
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
    console.log("initializeAdminApp: Firebase Admin SDK initialized successfully using embedded credentials.");
    return app;
  } catch (e: any) {
    console.error('CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED with embedded credentials:', e.message, e.stack);
    throw new Error(`Admin SDK: Initialization failed - ${e.message}`);
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
    console.log("handleUserSignupCompletion: Admin SDK app instance obtained.");
  } catch (initError: any) {
    console.error("handleUserSignupCompletion: Failed to obtain Admin SDK app instance.", initError.message);
    return { success: false, error: `Server Action Error: ${initError.message}` };
  }

  const adminDb = admin.firestore(adminAppInstance);
  console.log("handleUserSignupCompletion: Admin Firestore instance obtained.");

  const userDocRef = adminDb.collection("users").doc(userId);

  try {
    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId} using Admin SDK...`);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      role: 'user', // Default role
      disabled: false,
      wishlist: [],
      shippingAddress: {}, // Default empty address
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`handleUserSignupCompletion: Firestore document created successfully for user ${userId}.`);

    console.log(`handleUserSignupCompletion: Attempting to send welcome email to ${userData.email}...`);
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (emailResult.success) {
      console.log(`handleUserSignupCompletion: Welcome email sent successfully to ${userData.email}.`);
    } else {
      console.warn(`handleUserSignupCompletion: Failed to send welcome email to ${userData.email}. Error: ${emailResult.error}`);
      // Log the error but don't fail the whole signup completion for this
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore write or email sending for user ${userId}.`, error.message, error.stack);
    let errorMessage = `Server Action Error: ${error.message || 'Unexpected error during signup completion.'}`;
    if (error.code === 7 && error.message.includes('PERMISSION_DENIED')) { // Firestore permission denied
        errorMessage = "Server Action Error: Firestore permission denied while creating user profile.";
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}
