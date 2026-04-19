const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
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
