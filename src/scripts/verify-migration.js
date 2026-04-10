import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";

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
