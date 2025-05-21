// lib/firebase-admin.ts

import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export function getAdminApp(): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
    throw new Error("Missing FIREBASE_ADMIN_SDK_CONFIG_JSON in environment variables.");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return adminApp;
}

export function getAuth() {
  return getAdminApp().auth();
}

export function getFirestore() {
  return getAdminApp().firestore();
}

export function getStorage() {
  return getAdminApp().storage();
}
