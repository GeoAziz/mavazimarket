import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Initialize admin only if not already initialized
function getFirebaseAdmin() {
  if (getApps().length === 0) {
    if (!process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON) {
      throw new Error("Missing FIREBASE_ADMIN_SDK_CONFIG_JSON in environment variables.");
    }

    try {
      const {
        project_id,
        private_key,
        client_email,
      } = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG_JSON);

      if (!project_id || !private_key || !client_email) {
        throw new Error("Missing required Firebase Admin SDK configuration values.");
      }

      // Ensure private key is properly formatted
      const formattedPrivateKey = private_key.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: project_id,
          clientEmail: client_email,
          privateKey: formattedPrivateKey
        }),
      });
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw error;
    }
  }
  return admin;
}

export const getAdminFirestore = () => getFirebaseAdmin().firestore();
export const getAdminAuth = () => getFirebaseAdmin().auth();