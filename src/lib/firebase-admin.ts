'use server';

import * as admin from 'firebase-admin';
import { sendWelcomeEmail } from '@/lib/emailService';
import fs from 'fs';
import path from 'path';

// Helper function to initialize Firebase Admin SDK (singleton pattern)
// 🔁 NOW reads credentials from a real .json file, not from an environment variable
function initializeAdminApp(): admin.app.App {
  console.log("initializeAdminApp: Called.");
  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized.");
    return admin.app();
  }

  try {
    const serviceAccountPath = path.join(process.cwd(), 'secrets', 'firebase-adminsdk.json');
    const rawKey = fs.readFileSync(serviceAccountPath, 'utf-8');

    if (!rawKey) {
      throw new Error(`Failed to read Firebase Admin SDK credentials from file at: ${serviceAccountPath}`);
    }

    const serviceAccountJson = JSON.parse(rawKey);

    if (!serviceAccountJson) {
      throw new Error('Invalid service account JSON: Parsing failed.');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });

    console.log("initializeAdminApp: Firebase Admin SDK initialized successfully from file.");
    return app;

  } catch (e: any) {
    console.error("CRITICAL ERROR: Failed to initialize Firebase Admin SDK from file.", e.message);
    throw new Error(`Admin SDK initialization failed: ${e.message}`);
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
    console.log("handleUserSignupCompletion: Admin SDK app obtained.");
  } catch (initError: any) {
    console.error("handleUserSignupCompletion: Failed to initialize Admin SDK.", initError.message);
    return { success: false, error: `Server Action Error: ${initError.message}` };
  }

  if (!adminAppInstance) {
    console.error("handleUserSignupCompletion: Admin app instance is null/undefined after initialization.");
    return { success: false, error: "Server Action Error: Admin SDK could not be prepared." };
  }

  const adminDb = admin.firestore(adminAppInstance);
  console.log("handleUserSignupCompletion: Firestore instance obtained.");

  const userDocRef = adminDb.collection("users").doc(userId);

  try {
    console.log(`handleUserSignupCompletion: Creating Firestore document for user ${userId}...`);
    await userDocRef.set({
      id: userId,
      name: userData.fullName,
      email: userData.email,
      role: 'user',
      disabled: false,
      wishlist: [],
      shippingAddress: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`handleUserSignupCompletion: Firestore document created for user ${userId}.`);

    console.log(`handleUserSignupCompletion: Sending welcome email to ${userData.email}...`);
    const emailResult = await sendWelcomeEmail(userData.email, userData.fullName);
    if (emailResult.success) {
      console.log(`handleUserSignupCompletion: Welcome email sent to ${userData.email}.`);
    } else {
      console.warn(`handleUserSignupCompletion: Failed to send welcome email. Error: ${emailResult.error}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error(`handleUserSignupCompletion: Error during Firestore/email ops for user ${userId}.`, error.message, error.stack);
    return {
      success: false,
      error: `Server Action Error: ${error.message || 'Unexpected error during signup completion.'}`,
    };
  }
}
