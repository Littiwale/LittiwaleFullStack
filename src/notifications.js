import { getToken } from 'firebase/messaging';
import { messaging, db } from './firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

// TODO: Add real VAPID key from Firebase Console
// Firebase Console → Project Settings → 
// Cloud Messaging → Web Push certificates
const VAPID_KEY = '';
// const VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY_PLACEHOLDER';

/**
 * Requests browser notification permission and retrieves the FCM token.
 * @returns {Promise<string|null>}
 */
export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            if (!VAPID_KEY || VAPID_KEY.includes('PLACEHOLDER')) {
                console.warn('Push notifications disabled — VAPID key not set');
                return null;
            }
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            if (token) {
                return token;
            }
        }
        return null;
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
        return null;
    }
};

/**
 * Updates an order in Firestore with the user's FCM token
 * @param {string} docId - The Firestore Document ID of the order
 * @param {string} token - The FCM token
 */
export const saveFCMTokenToOrder = async (docId, token) => {
    if (!docId || !token) return;
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            fcmToken: token
        });
    } catch (error) {
        console.error('Failed to save FCM token to order:', error);
    }
};
