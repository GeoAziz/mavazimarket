import * as admin from "firebase-admin";

function initializeAdminApp(): admin.app.App {
  console.log("initializeAdminApp: Called.");

  if (admin.apps.length > 0) {
    console.log("initializeAdminApp: Firebase Admin SDK already initialized.");
    return admin.app();
  }

  console.log("initializeAdminApp: Initializing Firebase Admin SDK using environment credentials...");
  
  if (!process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
    throw new Error("Missing FIREBASE_ADMIN_SDK_CONFIG_JSON in environment variables.");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error) {
    // ✅ Fix TypeScript "unknown" error by casting `error` as `Error`
    const err = error as Error;
    console.error("ERROR: Firebase Admin SDK failed to initialize:", err.message);
    throw new Error("Admin SDK initialization failed.");
  }
}

// ** Initialize the Admin App **
export const adminApp = initializeAdminApp();
export const auth = adminApp.auth();
export const db = adminApp.firestore();
export const storage = adminApp.storage();
