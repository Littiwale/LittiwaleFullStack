import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error('Firebase configuration is not fully provided. Set FIREBASE_* values in your environment.');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verify() {
    console.log("🔍 Verifying Firestore Migration...");
    
    const menuSnapshot = await getDocs(collection(db, "menu"));
    console.log(`📊 Total documents in 'menu': ${menuSnapshot.size}`);

    const sampleIds = ['veg-noodles', 'chilly-chicken', 'mumbai-street-vada-pav'];
    
    for (const id of sampleIds) {
        const item = menuSnapshot.docs.find(d => d.id === id);
        if (item) {
            const data = item.data();
            console.log(`\n📄 Item: ${id}`);
            console.log(`- Name: ${data.name}`);
            console.log(`- Image: ${data.image || 'MISSING'}`);
            console.log(`- Price: ${data.price}`);
        } else {
            console.log(`\n❌ Item not found: ${id}`);
        }
    }
    
    process.exit(0);
}

verify().catch(console.error);
