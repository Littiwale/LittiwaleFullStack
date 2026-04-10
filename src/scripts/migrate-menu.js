import { readFileSync, writeFileSync } from 'fs';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  setDoc, 
  doc, 
  writeBatch 
} from "firebase/firestore";

// Firebase configuration from src/firebase/config.js
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
const db = getFirestore(app);

const SLUGIFY_REGEX = /[^a-z0-9]+/g;
const slugify = (text) => text.toLowerCase().trim().replace(SLUGIFY_REGEX, '-').replace(/^-+|-+$/g, '');

async function migrate() {
    console.log("🚀 Starting Menu Migration...");
    
    // Read original data
    const rawData = JSON.parse(readFileSync('legacy/backups/menu.json', 'utf8'));
    console.log(`📦 Loaded ${rawData.length} items from backup.`);

    // Read image mapping
    const imageMap = JSON.parse(readFileSync('legacy/data/imagemap.json', 'utf8'));
    console.log(`🖼️ Loaded ${Object.keys(imageMap).length} image mappings.`);

    const menuMap = new Map();

    rawData.forEach(item => {
        // Clean name and identify variants
        let name = item.name.trim();
        let variantType = null;
        
        // Strip suffixes like (Half) or (Full) but preserve original for mapping check
        const originalName = name.toLowerCase();

        if (name.includes('(Half)')) {
            name = name.replace('(Half)', '').trim();
            variantType = 'half';
        } else if (name.includes('(Full)')) {
            name = name.replace('(Full)', '').trim();
            variantType = 'full';
        }

        const id = slugify(name);
        const searchName = name.toLowerCase();
        
        // Find image path (try item name, then strip variant-related words)
        let imagePath = imageMap[searchName] || imageMap[originalName] || '';
        
        // Prefix with / if it doesn't have it
        if (imagePath && !imagePath.startsWith('/')) {
            imagePath = '/' + imagePath;
        }

        if (!menuMap.has(id)) {
            menuMap.set(id, {
                id: id,
                name: name,
                category: item.category,
                description: item.description === 'nan' ? '' : item.description,
                veg: item.veg === 'veg',
                bestseller: !!item.bestseller,
                hasVariants: false,
                variants: [],
                price: item.price,
                image: imagePath,
                available: true // Default to true
            });
        }

        const entry = menuMap.get(id);

        if (variantType) {
            entry.hasVariants = true;
            entry.variants.push({ type: variantType, price: item.price });
            // Sort variants for consistency
            entry.variants.sort((a, b) => a.price - b.price);
            // Update base price to lowest variant price
            entry.price = Math.min(...entry.variants.map(v => v.price));
        } else {
            entry.price = item.price;
        }
    });

    const migratedItems = Array.from(menuMap.values());
    console.log(`🔧 Transformed into ${migratedItems.length} logical menu items.`);

    // Batch Upload to Firestore
    console.log("📤 Uploading to Firestore...");
    const batchSize = 500; // Firestore limit is 500
    for (let i = 0; i < migratedItems.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = migratedItems.slice(i, i + batchSize);
        
        chunk.forEach(item => {
            const menuRef = doc(collection(db, "menu"), item.id);
            batch.set(menuRef, item);
        });

        await batch.commit();
        console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log("🏁 Migration Complete!");
    process.exit(0);
}

migrate().catch(err => {
    console.error("❌ Migration Failed:", err);
    process.exit(1);
});
