import { db } from '../firebase/config';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const menuCollection = collection(db, 'menu');

// Helper: compress image to base64 using Canvas (max 900px, JPEG 0.75)
const compressImageToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const MAX_W = 900;
            const scale = img.width > MAX_W ? MAX_W / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            let b64 = canvas.toDataURL('image/jpeg', 0.75);
            // If still too large, re-compress smaller
            if (b64.length > 900_000) {
                const c2 = document.createElement('canvas');
                const s2 = 700 / img.width < 1 ? 700 / img.width : 1;
                c2.width  = Math.round(img.width  * s2);
                c2.height = Math.round(img.height * s2);
                c2.getContext('2d').drawImage(img, 0, 0, c2.width, c2.height);
                b64 = c2.toDataURL('image/jpeg', 0.6);
            }
            resolve(b64);
        };
        img.onerror = reject;
        img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/**
 * Fetches all menu items from Firestore for the customer storefront.
 */
export const fetchMenuItems = async () => {
    try {
        const q = query(menuCollection, orderBy('category'));
        const querySnapshot = await getDocs(q);
        const allItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Resolve image: base64 (new) → imageUrl (legacy Firebase Storage URL)
            image: doc.data().imageBase64 || doc.data().image || doc.data().imageUrl || null
        }));

        const selectedLoc = localStorage.getItem('selectedLocation') || 'cloud';

        return allItems.filter(item => {
            const avail = item.availability || 'cloud_only';

            const combinedText = ((item.name || '') + ' ' + (item.description || '')).toLowerCase();
            const isEggless = combinedText.includes('eggless');
            const hasNonVegWords = /chicken|egg|fish|mutton|murgh|seekh|kebab|kabab|keema/.test(combinedText);
            const isVegByText = !(!isEggless && hasNonVegWords);

            const isVeg = (item.veg === true || item.veg === 'true' || item.veg === 'veg' || item.isVeg === true) && isVegByText;

            if (selectedLoc === 'outlet') {
                if (avail === 'cloud_only') return false;
                if (!isVeg) return false;
            } else {
                if (avail === 'outlet_only') return false;
            }
            return true;
        });
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};

/**
 * Fetches all menu items for admin management.
 */
export const fetchAllMenuItems = async () => {
    try {
        const q = query(menuCollection, orderBy('category'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                image: doc.data().imageBase64 || doc.data().image || doc.data().imageUrl || null
            }))
            .sort((a, b) => {
                if (a.category === b.category) {
                    return String(a.name || '').localeCompare(String(b.name || ''));
                }
                return String(a.category || '').localeCompare(String(b.category || ''));
            });
    } catch (error) {
        console.error('Error fetching admin menu items:', error);
        throw error;
    }
};

/**
 * Creates a new menu item — image stored as base64 in Firestore (no Storage needed).
 */
export const createMenuItem = async (data, imageFile = null) => {
    try {
        let imageBase64 = data.imageBase64 || null;

        if (imageFile) {
            imageBase64 = await compressImageToBase64(imageFile);
        }

        const variants = Array.isArray(data.variants)
            ? data.variants.map(v => ({ type: String(v.type).trim(), price: Number(v.price) }))
            : [];

        const hasVariants = variants.length > 0;

        const payload = {
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            category: String(data.category || 'Uncategorized').trim(),
            veg: data.veg === true || data.veg === 'true',
            available: data.available !== false,
            inStock: data.inStock !== false,
            hasVariants,
            variants,
            imageBase64: imageBase64 || null,
            image: null,       // legacy field — null for new items
            storagePath: null, // no Storage used
            bestseller: data.bestseller === true,
            spiceLevel: data.spiceLevel || 'regular',
            prepTime: data.prepTime || 15,
            tags: Array.isArray(data.tags) ? data.tags : [],
            availability: data.availability || 'cloud_only',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        payload.price = hasVariants
            ? Math.min(...variants.map(v => Number(v.price) || 0))
            : Number(data.price || 0);

        const docRef = await addDoc(menuCollection, payload);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating menu item:', error);
        throw error;
    }
};

/**
 * Updates an existing menu item.
 */
export const updateMenuItem = async (id, data, imageFile = null) => {
    try {
        const updates = {
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            category: String(data.category || 'Uncategorized').trim(),
            veg: data.veg === true || data.veg === 'true',
            spiceLevel: data.spiceLevel || 'regular',
            prepTime: data.prepTime || 15,
            tags: Array.isArray(data.tags) ? data.tags : [],
            availability: data.availability || 'cloud_only',
            updatedAt: serverTimestamp()
        };

        updates.available = data.available !== false;
        updates.inStock = data.inStock !== false;

        const variants = Array.isArray(data.variants)
            ? data.variants.map(v => ({ type: String(v.type).trim(), price: Number(v.price) }))
            : [];

        updates.hasVariants = variants.length > 0;
        updates.variants = variants;
        updates.price = updates.hasVariants
            ? Math.min(...variants.map(v => Number(v.price) || 0))
            : Number(data.price || 0);

        if (imageFile) {
            updates.imageBase64 = await compressImageToBase64(imageFile);
            updates.image = null;     // clear legacy field
            updates.storagePath = null;
        }

        await updateDoc(doc(menuCollection, id), updates);
        return { success: true };
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

/**
 * Deletes a menu item document (no Storage cleanup needed).
 */
export const deleteMenuItem = async (id) => {
    try {
        await deleteDoc(doc(menuCollection, id));
        return { success: true };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};
