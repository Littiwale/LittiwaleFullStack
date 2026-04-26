const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const razorpayUnavailableResponse = () => ({
    success: false,
    error: 'Online payment is currently unavailable. Please choose Cash on Delivery.'
});

/**
 * Cloud Function to create a Razorpay Order
 */
exports.createRazorpayOrder = onCall(async () => {
    return razorpayUnavailableResponse();
});

/**
 * Cloud Function to verify Razorpay Payment Signature
 */
exports.verifyRazorpayPayment = onCall(async () => {
    return razorpayUnavailableResponse();
});

/**
 * Webhook Handler for Razorpay
 */
exports.razorpayWebhook = onRequest(async (req, res) => {
    res.status(503).send('Online payment processing is currently disabled.');
});

/**
 * Firestore Trigger: Notify user on order status change
 */
exports.onOrderUpdate = onDocumentUpdated('orders/{orderId}', async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    // Only trigger if status has changed
    if (beforeData.status !== afterData.status) {
        const token = afterData.fcmToken;
        if (!token) return;

        const statusMessages = {
            'RECEIVED': 'Your order has been received by the kitchen! 🧑‍🍳',
            'PREPARING': 'Your delicious litti is being prepared! 🔥',
            'OUT_FOR_DELIVERY': 'Your order is out for delivery! 🛵',
            'DELIVERED': 'Enjoy your meal! Your order has been delivered. ✅',
            'CANCELLED': 'Your order has been cancelled. Please contact support. ❌'
        };

        const message = statusMessages[afterData.status];
        if (!message) return;

        const payload = {
            token: token,
            notification: {
                title: `Order Update: ${afterData.orderId}`,
                body: message
            },
            data: {
                orderId: afterData.orderId,
                status: afterData.status
            }
        };

        try {
            await admin.messaging().send(payload);
            console.log(`🚀 Notification sent for order ${afterData.orderId} (Status: ${afterData.status})`);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }
});

/**
 * 🛵 Firestore Trigger: Send push notification to rider when assigned a delivery
 */
exports.onRiderNotificationCreated = onDocumentCreated('riderNotifications/{notifId}', async (event) => {
    const notifData = event.data.data();
    
    try {
        // Fetch rider's FCM token from users collection
        const riderRef = db.collection('users').doc(notifData.riderId);
        const riderSnap = await riderRef.get();
        
        if (!riderSnap.exists()) {
            console.warn(`Rider ${notifData.riderId} not found`);
            return;
        }
        
        const riderData = riderSnap.data();
        const fcmToken = riderData.fcmToken;
        
        if (!fcmToken) {
            console.warn(`No FCM token for rider ${notifData.riderId}`);
            return;
        }
        
        const payload = {
            token: fcmToken,
            notification: {
                title: notifData.title || '🛵 New Delivery Assigned!',
                body: notifData.message || 'You have a new delivery to complete',
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/littiwale-ordering-system.appspot.com/o/images%2Flogo.png?alt=media'
            },
            data: {
                orderId: notifData.orderId,
                type: 'NEW_ASSIGNMENT',
                customerId: notifData.orderData?.customerId || '',
                customerName: notifData.orderData?.customerName || '',
                customerAddress: notifData.orderData?.customerAddress || '',
                total: notifData.orderData?.total?.toString() || '0'
            },
            webpush: {
                fcmOptions: {
                    link: '/rider/index.html'
                },
                notification: {
                    icon: 'https://firebasestorage.googleapis.com/v0/b/littiwale-ordering-system.appspot.com/o/images%2Flogo.png?alt=media',
                    badge: 'https://firebasestorage.googleapis.com/v0/b/littiwale-ordering-system.appspot.com/o/images%2Flogo.png?alt=media',
                    tag: `order_${notifData.orderId}`
                }
            }
        };
        
        await admin.messaging().send(payload);
        console.log(`✅ Push notification sent to rider ${notifData.riderId} for order ${notifData.orderId}`);
        
    } catch (error) {
        console.error('Error sending rider notification:', error);
    }
});
