import { collection, addDoc, getDoc, getDocs, doc, serverTimestamp, updateDoc, query, where, orderBy, limit, runTransaction } from 'firebase/firestore';
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

const generateTrackingToken = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
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
            const stockCount = typeof liveData.stockQuantity === 'number' ? liveData.stockQuantity : null;

            if (liveData.available === false || stockCount === 0) {
                return { isValid: false, error: `Sorry, "${item.name}" is currently out of stock.` };
            }

            if (stockCount !== null && stockCount < item.quantity) {
                return { isValid: false, error: `Only ${stockCount} of "${item.name}" are available right now.` };
            }

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
 * Places a new order in Firestore and decrements stock atomically
 * @param {Object} orderData 
 */
export const createOrderEntry = async (orderData) => {
    try {
        const orderId = generateOrderId();
        const initialStatus = orderData.paymentMethod === 'COD' ? ORDER_STATUS.PLACED : ORDER_STATUS.AWAITING_PAYMENT;
        const finalOrder = {
            ...orderData,
            orderId,
            trackingToken: generateTrackingToken(),
            status: initialStatus,
            paymentStatus: orderData.paymentMethod === 'COD' ? 'cod' : 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const ordersRef = collection(db, 'orders');
        const orderRef = doc(ordersRef);

        await runTransaction(db, async (transaction) => {
            for (const item of orderData.items) {
                const menuRef = doc(db, 'menu', item.id);
                const menuSnap = await transaction.get(menuRef);

                if (!menuSnap.exists()) {
                    throw new Error(`Item "${item.name}" is no longer available.`);
                }

                const liveData = menuSnap.data();
                const stockCount = typeof liveData.stockQuantity === 'number' ? liveData.stockQuantity : null;

                if (liveData.available === false || stockCount === 0) {
                    throw new Error(`Sorry, "${item.name}" is currently out of stock.`);
                }

                if (stockCount !== null) {
                    if (stockCount < item.quantity) {
                        throw new Error(`Only ${stockCount} of "${item.name}" are available right now.`);
                    }

                    const newStock = stockCount - item.quantity;
                    transaction.update(menuRef, {
                        stockQuantity: newStock,
                        available: newStock > 0,
                        updatedAt: serverTimestamp()
                    });
                }
            }

            transaction.set(orderRef, finalOrder);
        });

        return { success: true, orderId, docId: orderRef.id, trackingToken: finalOrder.trackingToken };
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
        
        // Prevent changing status if already DELIVERED
        if (updates.status) {
            const snap = await getDoc(orderRef);
            if (snap.exists() && snap.data().status === ORDER_STATUS.DELIVERED && updates.status !== ORDER_STATUS.DELIVERED) {
                throw new Error('Order is already DELIVERED. Status cannot be changed further.');
            }
        }

        const finalUpdates = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        if (updates.status === ORDER_STATUS.DELIVERED && !('paymentStatus' in updates)) {
            // Only auto-mark online payments as paid upon delivery (or leave them if already paid).
            // COD must be marked paid manually when cash is collected.
            const snap = await getDoc(orderRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.paymentMethod === 'ONLINE') {
                    finalUpdates.paymentStatus = 'paid';
                }
            }
        }

        await updateDoc(orderRef, finalUpdates);
        return { success: true };
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
};

/**
 * Assigns a specific rider to an order and sends notification
 * @param {string} docId 
 * @param {string} riderId 
 * @param {string} riderName
 */
export const assignRiderToOrder = async (docId, riderId, riderName) => {
    try {
        // Get the order data first
        const orderRef = doc(db, 'orders', docId);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
            throw new Error('Order not found');
        }
        
        const orderData = orderSnap.data();
        
        // Update order with rider assignment (keep status as READY, rider will accept to start delivery)
        await updateOrderDetails(docId, {
            riderId,
            riderName,
            riderStatus: 'pending',  // Track pending assignment
            riderAssignedAt: serverTimestamp()
        });
        
        // Create a notification for the rider in Firestore
        try {
            console.log('[ASSIGN] Creating notification for rider:', riderId);
            const notificationsRef = collection(db, 'riderNotifications');
            const notifPayload = {
                riderId,
                orderId: docId,
                orderData: {
                    orderId: orderData.orderId || docId.slice(0, 10),
                    customerId: orderData.userId,
                    customerName: orderData.customer?.name || 'Customer',
                    customerPhone: orderData.customer?.phone || '',
                    customerAddress: orderData.customer?.address || '',
                    total: orderData.total,
                    items: orderData.items
                },
                type: 'NEW_ASSIGNMENT',
                title: '🛵 New Delivery Assigned!',
                message: `New order assigned: ${orderData.orderId || docId.slice(0, 10)} - ₹${orderData.total}`,
                read: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            console.log('[ASSIGN] Notification payload:', notifPayload);
            const notifDocRef = await addDoc(notificationsRef, notifPayload);
            console.log('[ASSIGN] ✅ Notification created:', notifDocRef.id);
        } catch (notifError) {
            console.error('❌ CRITICAL: Failed to create notification:', {
                error: notifError.message,
                code: notifError.code,
                fullError: notifError
            });
            // Still throw error so admin knows something failed
            throw new Error(`Notification failed: ${notifError.message}`);
        }
        
    } catch (error) {
        console.error('Error assigning rider to order:', error);
        throw error;
    }
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

