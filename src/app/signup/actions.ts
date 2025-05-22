
// Ensure 'use server' is the very first line
'use server';

import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin'; // For typing
import { sendWelcomeEmail } from '@/lib/emailService';

// Helper function to initialize Firebase Admin SDK (singleton pattern for this named app)
function initializeAdminApp(): admin.app.App {
  const appName = 'mavazi-signup-action-admin-app-' + Date.now().toString();
  console.log(`initializeAdminApp from signup/actions.ts: Called. Attempting to initialize/get app: ${appName}`);

  if (admin.apps.find(app => app?.name === appName)) {
    console.log(`initializeAdminApp: Firebase Admin SDK app "${appName}" already initialized.`);
    return admin.app(appName);
  }

  console.log("initializeAdminApp: Attempting to initialize Firebase Admin SDK with embedded credentials...");

  // Directly embed your service account key JSON object here
  // CRITICAL: Ensure property names are camelCase (projectId, privateKey, clientEmail)
  // CRITICAL: Ensure privateKey has its newlines preserved correctly (template literals handle this)
  const serviceAccountJson: ServiceAccount = {
    // Ensure these match your actual service account key file's content, but with camelCase keys
    type: "service_account",
    projectId: "mavazi-market", // camelCase
    privateKeyId: "c781dbd1ae300c8a536c2fe7160f6ce27918a81f", // camelCase
    privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDHnAokBFSnfuL8\nd2LGnLGAQOUQ8gSsVFjalLaZXAux6s4/YTUxEZihv9LpBpFsUz2lqMdDxt0OW3Gg\nE3KSqLkfSPHDfBepWnZxGWw5KU4qekQLIUOXE61nW9D5BL3Ec3tgt9QK9FNOMOSW\nPSgtz3HYScpAoUXGTLGClpwyXRscvIK+VyKvQlSlGnA18ghwIq3DyzZIDVDIwAjo\nk98XMoRBFxAmcj8gJxP5KlrlyXlbQq9tygnGeh8PsCK4PuZHVOyztCBB625H4y4l\nGlyTDZXKmOF350ramFduVGi830cBLMi1LUQ1tXqhKwAjBexVo050sxQQLH5kDaPD\nyylXOUGZAgMBAAECgf9cEjLwlLl3iPpU+byAtZt/om9bzEaGNrcaxlMeP2wlj5O9\nfa52CRJziXJU33K0mgYVeNnGVDQi1eB+CyUOAPANk4KbaOHWe/j7XNP5NH7u7kv0\ngPjBoZHv2v9c3XwANu7x7dkg3xHjPyoxIoR7R58mOjh7Fz3X+gg8SWbtftoX+7YC\nUu2CBM5NqmUHQEHhvMvwTTwsfU5zkISwB4jTKn5a5qMXCoR/aOYZBAHqYToVhxrS\nL0S/KWVoLP7Fht6irHIhESDlt/hvocC5vey3JQtTJp3uvkrhTXbSMDkwT0m/KGFI\naR3XZABu0Q49Oy8Bt2ai2Y/Ge060N2usct1x9kECgYEA6XQuBqlegmYKnDZFMUBn\nRHP5ny0eZjAzYBHJX24rTGgwXcp9Js7X+1r7brG5RbK6JPnHRLQbHa9tAm01kP0w\nqJ0Se71TR3pmwaveNQd6ZNLB+bHGNije2Rs0cqf2Po+sf4Rzzbb5W2L8mxx8d3XZ\ntmRpHWiPg3aP9EKYXNx95aECgYEA2uMbVdasCeo2Pc7xDdH6njm+yTO9RtzCM5V3\n0LuQMXp2V1MUelVw7IUTahgfypct+vkTBBdmdtbNXXiyTvnVUhDSlfYzoMbCp1FR\n3qZX6awUdQ1u0fFK52ImjKj7gs+QRVgzoPJYA3EpLind/mKfsx8aBTKhUT5gVCWG\nLnLL6PkCgYB/7ZtfKSbSHCrKSW8HOzybpVXv5SCYbOdqSLTp54wwlZOTgeetAYIX\nilbn5NobGIKqynlo661ESiJZRxEof6ZPb6t2RVxCeg+fJ5hfxNZMM7X6J3HvsdvU\navUFs4bb541mX2W6H/9rFcZJFYYbTGhea42ygN7L8oeWGXw2vtj6oQKBgQCNi4dF\nvwiJcNeaqJPhKAQ1BYqGedrQVDmROfq9FE1ucY7NcYAwi8f2ayfe17LXQ2QMg7z0\nTF2KQ+WRqFdGEvELnK1RJGDGe0GtCT00CcWX6htghks/oBWcAzCCjVP3h1n4Pc1F\nKvIXZ7oFjDVuJ0C2iEo/SjpfW0LXp1xZ9Qo/oQKBgQCeDho842fz6igzOD7Jn0Vs\nAuY1EREX6Uc0UCL1X46VmiYWIe/9KCjpGDHbDqYdlcOrinFBOKtKRI2vWiOYQ2fw\n1/6UUlSvWVeJH31cTTU8Er759FeVHt8glcqDk46881HxVx4Ivkm9h8Y/7zWQolFE\nE//04mEEMu3uJgEQjSqFag==\n-----END PRIVATE KEY-----\n`.replace(/\\n/g, '\n'), // Important: ensure actual newlines for PEM
    clientEmail: "firebase-adminsdk-fbsvc@mavazi-market.iam.gserviceaccount.com", // camelCase
    clientId: "103851015213759963529", // camelCase
    authUri: "https://accounts.google.com/o/oauth2/auth", // camelCase
    tokenUri: "https://oauth2.googleapis.com/token", // camelCase
    authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs", // camelCase
    clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mavazi-market.iam.gserviceaccount.com", // camelCase
    universeDomain: "googleapis.com" // camelCase
  };

  // Pre-validation of critical fields
  if (!serviceAccountJson.projectId || typeof serviceAccountJson.projectId !== 'string') {
    console.error("initializeAdminApp: Embedded service account JSON is missing or has invalid 'projectId'.");
    throw new Error("Admin SDK: Embedded credentials error - projectId.");
  }
  if (!serviceAccountJson.clientEmail || typeof serviceAccountJson.clientEmail !== 'string') {
    console.error("initializeAdminApp: Embedded service account JSON is missing or has invalid 'clientEmail'.");
    throw new Error("Admin SDK: Embedded credentials error - clientEmail.");
  }
  if (!serviceAccountJson.privateKey || typeof serviceAccountJson.privateKey !== 'string') {
    console.error("initializeAdminApp: Embedded service account JSON is missing or has invalid 'privateKey'.");
    throw new Error("Admin SDK: Embedded credentials error - privateKey.");
  }
  
  try {
    console.log("initializeAdminApp: Attempting admin.initializeApp with embedded credentials for app name:", appName);
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    }, appName); // Use the unique name
    console.log(`initializeAdminApp: Firebase Admin SDK app "${appName}" initialized successfully.`);
    return app;
  } catch (e: any) {
    console.error(`CRITICAL ERROR: Firebase Admin SDK initializeApp() FAILED for app "${appName}":`, e.message, e.stack);
    throw new Error(`Admin SDK: Initialization failed - ${e.message}`);
  }
}

export async function handleUserSignupCompletion(
  userId: string,
  userData: { fullName: string; email: string }
): Promise<{ success: boolean; error?: string }> {
  console.log(`handleUserSignupCompletion: Called for userId: ${userId}, email: ${userData.email}`);

  let adminAppInstance: admin.app.App;
  try {
    adminAppInstance = initializeAdminApp();
    console.log("handleUserSignupCompletion: Admin SDK app instance obtained:", adminAppInstance.name);
  } catch (initError: any) {
    console.error("handleUserSignupCompletion: Failed to initialize or obtain Admin SDK app instance.", initError.message);
    return { success: false, error: `Server Action Error: ${initError.message}` };
  }

  // Get Firestore instance from the specifically initialized admin app
  const adminDb = admin.firestore(adminAppInstance);
  console.log("handleUserSignupCompletion: Admin Firestore instance obtained from app:", adminAppInstance.name);
  const userDocRef = adminDb.collection("users").doc(userId);

  try {
    console.log(`handleUserSignupCompletion: Attempting to create Firestore document for user ${userId} using Admin SDK...`);
    await userDocRef.set({
      id: userId, // Storing userId also in the document
      name: userData.fullName,
      email: userData.email,
      role: 'user', // Default role for new signups
      disabled: false,
      wishlist: [], // Initialize with an empty wishlist
      shippingAddress: {}, // Initialize with an empty shipping address object
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`handleUserSignupCompletion: Firestore document created successfully for user ${userId}.`);

    // Attempt to send welcome email
    console.log(`handleUserSignupCompletion: Attempting to send welcome email to ${userData.email}...`);
    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
      if (emailResult.success) {
        console.log(`handleUserSignupCompletion: Welcome email sent successfully to ${userData.email}.`);
      } else {
        console.warn(`handleUserSignupCompletion: Failed to send welcome email to ${userData.email}. Error: ${emailResult.error}`);
        // Don't fail the whole operation if email fails, just log it.
      }
    } else {
      console.warn("handleUserSignupCompletion: Gmail credentials (GMAIL_EMAIL or GMAIL_APP_PASSWORD) not set in environment variables, skipping welcome email.");
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore write or email sending for user ${userId}.`, error.message, error.stack);
    // Check if it's a permission error from Firestore, though Admin SDK should bypass rules
    if (error.code === 7 || (error.message && error.message.includes('PERMISSION_DENIED'))) {
         return { success: false, error: "Server Action Error: Firestore permission denied even with Admin SDK. Check service account IAM roles." };
    }
    return {
      success: false,
      error: `Server Action Error: ${error.message || 'Unexpected error during signup completion.'}`,
    };
  }
}

    