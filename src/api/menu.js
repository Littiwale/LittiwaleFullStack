import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches all menu items from Firestore
 * @returns {Promise<Array>} Array of menu items
 */
export const fetchMenuItems = async () => {
    try {
        const menuRef = collection(db, 'menu');
        // We can sort by name or category if needed
        const q = query(menuRef, orderBy('category'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};
