// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getMessaging } from "firebase/messaging";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEgXj63A1Ut0ldXLJmM9QRmtGeh66KAmw",
  authDomain: "littiwale-90990.firebaseapp.com",
  projectId: "littiwale-90990",
  storageBucket: "littiwale-90990.firebasestorage.app",
  messagingSenderId: "937555170322",
  appId: "1:937555170322:web:c31008dac8833c308eb4cb",
  measurementId: "G-CRSQF7SR49"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database
export const db = getFirestore(app);

// Backend functions
export const functions = getFunctions(app);

// Messaging
export const messaging = getMessaging(app);

// Auth
export const auth = getAuth(app);

console.log("🔥 Firebase Connected");