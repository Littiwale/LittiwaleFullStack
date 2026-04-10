const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

// PLACEHOLDERS - To be configured via Firebase Functions Secrets or Config
const RAZORPAY_KEY_ID = 'rzp_test_placeholder';
const RAZORPAY_KEY_SECRET = 'placeholder_secret';
const RAZORPAY_WEBHOOK_SECRET = 'webhook_secret_placeholder';

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

/**
 * Cloud Function to create a Razorpay Order
 */
exports.createRazorpayOrder = onCall(async (request) => {
    const { amount, receipt } = request.data;
    try {
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: receipt,
        };
        const order = await razorpay.orders.create(options);
        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return { success: false, error: 'Failed to create payment order.' };
    }
});

/**
 * Cloud Function to verify Razorpay Payment Signature
 */
exports.verifyRazorpayPayment = onCall(async (request) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = request.data;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        const orderRef = db.collection('orders').doc(internal_order_id);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists && orderSnap.data().paymentStatus !== 'captured') {
            await orderRef.update({
                status: 'PLACED',
                paymentStatus: 'captured',
                razorpayPaymentId: razorpay_payment_id,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        return { success: true };
    } else {
        return { success: false, error: 'Invalid payment signature.' };
    }
});

/**
 * Webhook Handler for Razorpay
 */
exports.razorpayWebhook = onRequest(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (signature !== expectedSignature) return res.status(400).send('Invalid signature');

    const event = req.body;
    if (event.event === 'payment.captured') {
        const internalOrderId = event.payload.payment.entity.notes.internal_order_id;
        if (internalOrderId) {
            const orderRef = db.collection('orders').doc(internalOrderId);
            const orderSnap = await orderRef.get();
            if (orderSnap.exists && orderSnap.data().paymentStatus !== 'captured') {
                await orderRef.update({
                    status: 'PLACED',
                    paymentStatus: 'captured',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    }
    res.status(200).send('ok');
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
