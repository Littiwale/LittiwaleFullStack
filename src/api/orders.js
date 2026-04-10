import { collection, addDoc, getDoc, getDocs, doc, serverTimestamp, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ORDER_STATUS } from '../constants/orderStatus';

/**
 * Generates a unique Order ID in the format LW-YYYYMMDD-XXXX
 */
const generateOrderId = () => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LW-${dateStr}-${randomSuffix}`;
};

/**
 * Validates cart items against the live Firestore database.
 * No price mismatch allowed. Availability must be true.
 * @param {Array} cartItems 
 * @returns {Promise<{isValid: boolean, error?: string}>}
 */
export const validateOrder = async (cartItems) => {
    try {
        for (const item of cartItems) {
            const menuRef = doc(db, 'menu', item.id);
            const menuSnap = await getDoc(menuRef);

            if (!menuSnap.exists()) {
                return { isValid: false, error: `Item "${item.name}" no longer exists in our menu.` };
            }

            const liveData = menuSnap.data();

            // 1. Check Availability
            if (liveData.available === false) {
                return { isValid: false, error: `Sorry, "${item.name}" is currently out of stock.` };
            }

            // 2. Check Price Integrity
            let livePrice;
            if (item.variant === 'single') {
                livePrice = liveData.price;
            } else {
                const variantData = liveData.variants.find(v => v.type === item.variant);
                if (!variantData) {
                    return { isValid: false, error: `Invalid variant "${item.variant}" for ${item.name}.` };
                }
                livePrice = variantData.price;
            }

            if (livePrice !== item.price) {
                return { isValid: false, error: `Price mismatch for "${item.name}". Please refresh your cart.` };
            }
        }
        return { isValid: true };
    } catch (error) {
        console.error('Validation error:', error);
        return { isValid: false, error: 'Internal validation failed. Please try again.' };
    }
};

/**
 * Places a new order in Firestore
 * @param {Object} orderData 
 */
export const createOrderEntry = async (orderData) => {
    try {
        const orderId = generateOrderId();
        const initialStatus = orderData.paymentMethod === 'COD' ? ORDER_STATUS.PLACED : ORDER_STATUS.AWAITING_PAYMENT;
        
        const finalOrder = {
            ...orderData,
            orderId,
            status: initialStatus,
            paymentStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, finalOrder);
        
        return { success: true, orderId, docId: docRef.id };
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
};

/**
 * Updates an order's status and payment status
 * @param {String} docId 
 * @param {Object} updates 
 */
export const updateOrderDetails = async (docId, updates) => {
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

/**
 * Assigns a specific rider to an order
 * @param {string} docId 
 * @param {string} riderId 
 */
export const assignRiderToOrder = async (docId, riderId, riderName) => {
    return updateOrderDetails(docId, {
        riderId,
        riderName,
        status: ORDER_STATUS.ASSIGNED
    });
};

/**
 * Fetches the last 10 orders for a given user UID (for My Orders modal)
 * @param {string} uid
 * @returns {Promise<Array>}
 */
export const fetchOrdersByUser = async (uid) => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('userId', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

