import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { RIDER_EARNING_PER_ORDER } from '../constants/config';

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
        console.log(`[API] fetchUsersByRole('${role}'): Found ${snapshot.size} users`);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (users.length > 0) {
            console.log(`[API] ${role} sample:`, users[0]);
        }
        return users;
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

/**
 * Record a manual cash payment given to the rider
 */
export const addRiderPayment = async (riderId, amount, note = 'Cash Payment') => {
    try {
        const paymentsRef = collection(db, 'users', riderId, 'payments');
        await addDoc(paymentsRef, {
            amount: parseFloat(amount),
            note,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
    }
};

/**
 * Fetch all payments for a rider
 */
export const fetchRiderPayments = async (riderId) => {
    try {
        const paymentsRef = collection(db, 'users', riderId, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
};

/**
 * Get comprehensive financial stats for a rider
 */
export const getRiderFinancialStats = async (riderId) => {
    try {
        const ordersRef = collection(db, 'orders');
        const ordersQ = query(ordersRef, where('riderId', '==', riderId), where('status', '==', 'DELIVERED'));
        const ordersSnap = await getDocs(ordersQ);
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let allTimeDeliveries = 0;
        let monthlyDeliveries = 0;
        let todayDeliveries = 0;
        
        ordersSnap.forEach(doc => {
            const data = doc.data();
            allTimeDeliveries++;
            
            const date = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
            if (date) {
                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    monthlyDeliveries++;
                }
                if (date.toDateString() === now.toDateString()) {
                    todayDeliveries++;
                }
            }
        });
        
        const totalEarnings = allTimeDeliveries * RIDER_EARNING_PER_ORDER;
        const monthlyEarnings = monthlyDeliveries * RIDER_EARNING_PER_ORDER;
        const todayEarnings = todayDeliveries * RIDER_EARNING_PER_ORDER;
        
        const payments = await fetchRiderPayments(riderId);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingAmount = totalEarnings - totalPaid;
        
        return {
            allTimeDeliveries,
            monthlyDeliveries,
            todayDeliveries,
            totalEarnings,
            monthlyEarnings,
            todayEarnings,
            totalPaid,
            pendingAmount,
            payments
        };
    } catch (error) {
        console.error('Error fetching rider financial stats:', error);
        return {
            allTimeDeliveries: 0,
            monthlyDeliveries: 0,
            todayDeliveries: 0,
            totalEarnings: 0,
            monthlyEarnings: 0,
            todayEarnings: 0,
            totalPaid: 0,
            pendingAmount: 0,
            payments: []
        };
    }
};
