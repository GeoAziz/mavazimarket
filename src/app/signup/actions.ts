'use server'

// lib/firebase-admin.ts

import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export async function getAdminApp(): Promise<admin.app.App> {
  if (adminApp) {
    return adminApp;
  }
  const {
    project_id,
    private_key,
    client_email,
  } = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON || '{}');

  if (!project_id || !private_key || !client_email) {
    throw new Error("Missing required Firebase Admin SDK configuration values.");
  }

  // Ensure private key is properly formatted
  const formattedPrivateKey = private_key.replace(/\\n/g, '\n');
  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: project_id,
      clientEmail: client_email,
      privateKey: formattedPrivateKey
    }),
  });

  return adminApp;
}

export async function getAuth() {
  return (await getAdminApp()).auth();
}

export async function getFirestore() {
  return (await getAdminApp()).firestore();
}

export async function getStorage() {
  return (await getAdminApp()).storage();
}

// server actions
import { getAdminFirestore } from '@/lib/firebase-admin';

interface UserData {
  fullName: string;
  email: string;
}

export async function handleUserSignupCompletion(
  userId: string, 
  userData: UserData
) {
  try {
    const db = getAdminFirestore();
    
    await db.collection('users').doc(userId).set({
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error in handleUserSignupCompletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
