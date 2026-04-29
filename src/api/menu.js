import { db, storage } from '../firebase/config';
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const menuCollection = collection(db, 'menu');

const uploadMenuImage = async (imageFile) => {
    const timestamp = Date.now();
    const storagePath = `menu/${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);
    return { imageUrl, storagePath };
};

/**
 * Fetches all menu items from Firestore for the customer storefront.
 */
export const fetchMenuItems = async () => {
    try {
        const q = query(menuCollection, orderBy('category'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
            .map(doc => ({ id: doc.id, ...doc.data() }))
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
 * Creates a new menu item document.
 */
export const createMenuItem = async (data, imageFile = null) => {
    try {
        let imageUrl = data.image || null;
        let storagePath = data.storagePath || null;

        if (imageFile) {
            const upload = await uploadMenuImage(imageFile);
            imageUrl = upload.imageUrl;
            storagePath = upload.storagePath;
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
            image: imageUrl || null,
            storagePath: storagePath || null,
            bestseller: data.bestseller === true,
            spiceLevel: data.spiceLevel || 'regular',
            prepTime: data.prepTime || 15,
            tags: Array.isArray(data.tags) ? data.tags : [],
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
export const updateMenuItem = async (id, data, imageFile = null, currentStoragePath = '') => {
    try {
        const updates = {
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            category: String(data.category || 'Uncategorized').trim(),
            veg: data.veg === true || data.veg === 'true',
            spiceLevel: data.spiceLevel || 'regular',
            prepTime: data.prepTime || 15,
            tags: Array.isArray(data.tags) ? data.tags : [],
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
            const upload = await uploadMenuImage(imageFile);
            updates.image = upload.imageUrl;
            updates.storagePath = upload.storagePath;

            if (currentStoragePath) {
                try { await deleteObject(ref(storage, currentStoragePath)); } catch (err) { /* ignore delete failures */ }
            }
        }

        await updateDoc(doc(menuCollection, id), updates);
        return { success: true };
    } catch (error) {
        console.error('Error updating menu item:', error);
        throw error;
    }
};

/**
 * Deletes a menu item document and its uploaded image if present.
 */
export const deleteMenuItem = async (id, storagePath = '') => {
    try {
        await deleteDoc(doc(menuCollection, id));
        if (storagePath) {
            try { await deleteObject(ref(storage, storagePath)); } catch (err) { /* ignore delete failures */ }
        }
        return { success: true };
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};
