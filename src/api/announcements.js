import { db, storage } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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
 * Admin: Upload image to Firebase Storage and create announcement doc.
 * @param {File} imageFile
 * @param {Object} meta - { expiresAt: Date|null, active: boolean, title?: string }
 */
export const createAnnouncement = async (imageFile, meta) => {
    try {
        let imageUrl = null;
        let storagePath = null;

        if (imageFile) {
            const timestamp = Date.now();
            storagePath = `announcements/${timestamp}_${imageFile.name}`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }

        const docRef = await addDoc(collection(db, 'announcements'), {
            imageUrl: imageUrl || null,
            storagePath: storagePath || null,
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
 * Admin: Delete announcement (and its storage image if any)
 */
export const deleteAnnouncement = async (id, storagePath) => {
    try {
        await deleteDoc(doc(db, 'announcements', id));
        if (storagePath) {
            try { await deleteObject(ref(storage, storagePath)); } catch {}
        }
        return { success: true };
    } catch (error) {
        console.error('Error deleting announcement:', error);
        throw error;
    }
};
