import { db } from '../firebase/config';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Fetches active, non-expired announcements for the homepage carousel.
 * Expiry is checked client-side to avoid a composite index requirement.
 */
export const fetchAnnouncements = async () => {
    try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(
            announcementsRef,
            where('active', '==', true),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const now = new Date();

        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(ann => {
                // Keep if no expiry OR expiry is in the future
                if (!ann.expiresAt) return true;
                const expiry = ann.expiresAt.toDate ? ann.expiresAt.toDate() : new Date(ann.expiresAt);
                return now < expiry;
            });
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
        const snapshot = await getDocs(
            query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
        );
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching all announcements:', error);
        return [];
    }
};

/**
 * Admin: Create announcement with static image path (no Firebase Storage).
 * Images should be placed manually in public/images/announcements/ folder.
 * @param {File} imageFile - Image file selected by admin (used to generate filename)
 * @param {Object} meta - { expiresAt: Date|null, active: boolean, title?: string }
 */
export const createAnnouncement = async (imageFile, meta) => {
    try {
        let image = null;

        // Upload to Firebase Storage and get real download URL
        if (imageFile) {
            const timestamp = Date.now();
            const filename = imageFile.name.toLowerCase().replace(/\s+/g, '-');
            const storagePath = `announcements/${timestamp}_${filename}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, imageFile);
            image = await getDownloadURL(storageRef);
        }

        const docRef = await addDoc(collection(db, 'announcements'), {
            image: image || null,
            imageUrl: null, // Legacy field for backward compatibility
            title: meta.title || '',
            expiresAt: meta.expiresAt || null,
            active: meta.active !== false,
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
