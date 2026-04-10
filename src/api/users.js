import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches all registered users (Admin only)
 * @returns {Promise<Array>}
 */
export const fetchAllUsers = async () => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/**
 * Fetches only users with a specific role (e.g., 'rider')
 * @param {string} role 
 * @returns {Promise<Array>}
 */
export const fetchUsersByRole = async (role) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', role));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching ${role}s:`, error);
        throw error;
    }
};

/**
 * Updates a user's role in Firestore
 * @param {string} uid 
 * @param {string} newRole 
 */
export const updateUserRole = async (uid, newRole) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};
