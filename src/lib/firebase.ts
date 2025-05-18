
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFGVtLGvNXOPhgF6cXx4y9vYWg6ipeBEU",
  authDomain: "mavazi-market.firebaseapp.com",
  projectId: "mavazi-market",
  storageBucket: "mavazi-market.appspot.com", // Corrected bucket name from provided config
  messagingSenderId: "488811968016",
  appId: "1:488811968016:web:c1bf5ad48916de91acfc95"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
