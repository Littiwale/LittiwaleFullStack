import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';



/**
 * Fetches active, non-expired announcements for the homepage carousel.
 * Expiry is checked client-side to avoid a composite index requirement.
 */
export const fetchAnnouncements = async () => {
    try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(announcementsRef, where('active', '==', true));
        const snapshot = await getDocs(q);
        const now = new Date();

        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(ann => {
                if (!ann.expiresAt) return true;
                const expiry = ann.expiresAt.toDate ? ann.expiresAt.toDate() : new Date(ann.expiresAt);
                return now < expiry;
            })
            // Sort by admin-set order first, then by newest
            .sort((a, b) => {
                if (a.order != null && b.order != null) return a.order - b.order;
                if (a.order != null) return -1;
                if (b.order != null) return 1;
                const ta = a.createdAt?.seconds || 0;
                const tb = b.createdAt?.seconds || 0;
                return tb - ta;
            })
            .map(ann => ({
                ...ann,
                image: ann.imageBase64 || ann.image || ann.imageUrl || null
            }));
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
};

/**
 * Admin: Fetch ALL announcements (active + inactive, for management list)
 */
export const fetchAllAnnouncements = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'announcements'));
        return snapshot.docs
            .map(d => ({
                id: d.id, ...d.data(),
                imageSource: d.data().imageBase64 || d.data().image || d.data().imageUrl || null
            }))
            // Sort by admin-set order, then newest first
            .sort((a, b) => {
                if (a.order != null && b.order != null) return a.order - b.order;
                if (a.order != null) return -1;
                if (b.order != null) return 1;
                const ta = a.createdAt?.seconds || 0;
                const tb = b.createdAt?.seconds || 0;
                return tb - ta;
            });
    } catch (error) {
        console.error('Error fetching all announcements:', error);
        return [];
    }
};

/**
 * Admin: Save reordered announcement positions to Firestore.
 * @param {Array<{id: string}>} orderedList - announcements in new order
 */
export const reorderAnnouncements = async (orderedList) => {
    const batch = writeBatch(db);
    orderedList.forEach((ann, index) => {
        batch.update(doc(db, 'announcements', ann.id), { order: index });
    });
    await batch.commit();
};


// Helper: compress image file to base64 using Canvas (max 1200px, JPEG 0.72)
const compressImageToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const MAX_W = 1200;
            const scale = img.width > MAX_W ? MAX_W / img.width : 1;
            const canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = reject;
        img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

/**
 * Admin: Create announcement — image compressed to base64 and stored in Firestore.
 * No Firebase Storage needed (works on free Spark plan).
 */
export const createAnnouncement = async (imageFile, meta) => {
    try {
        let imageBase64 = null;

        if (imageFile) {
            imageBase64 = await compressImageToBase64(imageFile);
            // Safety check: base64 string must be under ~900KB
            if (imageBase64.length > 900_000) {
                // Re-compress at lower quality if too large
                const reader = new FileReader();
                imageBase64 = await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        const MAX_W = 800;
                        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
                        const canvas = document.createElement('canvas');
                        canvas.width  = Math.round(img.width  * scale);
                        canvas.height = Math.round(img.height * scale);
                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', 0.55));
                    };
                    img.src = imageBase64;
                });
            }
        }

        // Assign order = current count (new item goes to end)
        let newOrder = 0;
        try {
            const snap = await getDocs(collection(db, 'announcements'));
            newOrder = snap.size;
        } catch { newOrder = Date.now(); }

        const docRef = await addDoc(collection(db, 'announcements'), {
            imageBase64: imageBase64 || null,
            image:    null,
            imageUrl: null,
            title:    meta.title || '',
            expiresAt: meta.expiresAt || null,
            active:   meta.active !== false,
            order:    newOrder,
            createdAt: serverTimestamp()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating announcement:', error);
        throw error;
    }
};


/**
 * Admin: Update announcement title
 */
export const updateAnnouncementTitle = async (id, title) => {
    try {
        await updateDoc(doc(db, 'announcements', id), { title });
        return { success: true };
    } catch (error) {
        console.error('Error updating announcement title:', error);
        throw error;
    }
};

/**
 * Admin: Toggle active status of an announcement
 */
export const toggleAnnouncementActive = async (id, active) => {
    try {
        await updateDoc(doc(db, 'announcements', id), { active });
        return { success: true };
    } catch (error) {
        console.error('Error toggling announcement:', error);
        throw error;
    }
};

/**
 * Admin: Delete announcement (no Firebase Storage cleanup needed with static files)
 */
export const deleteAnnouncement = async (id, storagePath) => {
    try {
        await deleteDoc(doc(db, 'announcements', id));
        // No Firebase Storage file to delete since we're using static files
        return { success: true };
    } catch (error) {
        console.error('Error deleting announcement:', error);
        throw error;
    }
};
