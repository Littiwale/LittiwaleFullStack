import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);
export const isFirebaseConfigured = missingKeys.length === 0;

if (!isFirebaseConfigured) {
  console.error(
    `Firebase configuration is missing: ${missingKeys.join(', ')}. Copy .env.example to .env and add your VITE_FIREBASE_* values.`
  );
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

export const db = app ? getFirestore(app) : null;
export const functions = app ? getFunctions(app) : null;
export const messaging = app ? getMessaging(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;  // For image uploads (announcements, etc.)
