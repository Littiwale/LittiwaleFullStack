import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEgXj63A1Ut0ldXLJmM9QRmtGeh66KAmw",
  authDomain: "littiwale-90990.firebaseapp.com",
  projectId: "littiwale-90990",
  storageBucket: "littiwale-90990.firebasestorage.app",
  messagingSenderId: "937555170322",
  appId: "1:937555170322:web:c31008dac8833c308eb4cb",
  measurementId: "G-CRSQF7SR49"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const functions = getFunctions(app);
export const messaging = getMessaging(app);
export const auth = getAuth(app);
export const storage = getStorage(app);  // For image uploads (announcements, etc.)

console.log("🔥 Firebase Connected");