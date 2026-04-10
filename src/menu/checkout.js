import { getCart, getCartTotal, clearCart } from '../store/cart';
import { validateOrder, createOrderEntry, updateOrderDetails } from '../api/orders';
import { functions, auth } from '../firebase/config';
import { normalizePhone } from '../api/auth';
import { ORDER_STATUS } from '../constants/orderStatus';
import { httpsCallable } from 'firebase/functions';

const checkoutModal = document.querySelector('#checkout-modal');
const checkoutForm = document.querySelector('#checkout-form');
const checkoutAmount = document.querySelector('#checkout-amount');
const closeCheckout = document.querySelector('#close-checkout');
const proceedBtn = document.querySelector('#checkout-btn');
const cartModal = document.querySelector('#cart-modal');
const errorDisplay = document.querySelector('#checkout-error');
const placeOrderBtn = document.querySelector('#place-order-btn');

export const initCheckout = () => {
    if (!proceedBtn || !checkoutModal || !closeCheckout) return;

    // Open Checkout Modal
    proceedBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        cartModal.classList.add('hidden');
        checkoutModal.classList.remove('hidden');
        checkoutAmount.textContent = getCartTotal();
    });

    // Close Checkout Modal
    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });

    // Form Submission
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
};

const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    // 1. Protection & Loading
    placeOrderBtn.disabled = true;
    const originalBtnText = placeOrderBtn.innerHTML;
    placeOrderBtn.textContent = 'Processing...';
    hideError();

    try {
        const formData = new FormData(checkoutForm);
        const paymentMethod = formData.get('payment-method');
        const customerDetails = {
            name: document.querySelector('#cust-name').value.trim(),
            phone: sanitizePhone(document.querySelector('#cust-phone').value),
            address: document.querySelector('#cust-address').value.trim(),
            paymentMethod: paymentMethod
        };

        // 2. Client-side Phone Validation
        if (customerDetails.phone.length !== 10) {
            showError('Please enter a valid 10-digit phone number.');
            resetButton(originalBtnText);
            return;
        }

        const cart = getCart();
        const total = getCartTotal();

        // 3. Server-side Style Validation
        const validation = await validateOrder(cart);
        if (!validation.isValid) {
            showError(validation.error);
            resetButton(originalBtnText);
            return;
        }

        // 4. Create Order in Firestore (Timing: Before payment)
        const orderData = {
            customer: customerDetails,
            items: cart,
            total: total,
            paymentMethod: paymentMethod
        };

        const { success, orderId, docId } = await createOrderEntry(orderData);
        if (!success) throw new Error('Failed to create order entry');

        // 5. Branch based on Payment Method
        if (paymentMethod === 'COD') {
            await handleCODSuccess(orderId);
        } else {
            // Online Payment Disabled - Show Notice
            alert("Online payment coming soon! Please select Cash on Delivery.");
            resetButton(originalBtnText);
            // await handleOnlinePayment(orderId, docId, total, customerDetails);
        }

    } catch (error) {
        console.error('Checkout failed:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
        resetButton(originalBtnText);
    }
};

const handleCODSuccess = async (orderId) => {
    clearCart();
    window.location.href = `/track.html?id=${orderId}`;
};

/* 
const handleOnlinePayment = async (orderId, docId, amount, customer) => {
    try {
        // A. Create Razorpay Order via Cloud Function
        const createRzpOrder = httpsCallable(functions, 'createRazorpayOrder');
        const rzpResult = await createRzpOrder({ amount, receipt: orderId });
        
        if (!rzpResult.data.success) throw new Error('Razorpay order creation failed');

        const rzpOrderId = rzpResult.data.orderId;

        // B. Configure Razorpay Options
        const options = {
            key: 'rzp_test_placeholder', // Replaced with actual key later
            amount: amount * 100,
            currency: 'INR',
            name: 'Littiwale',
            description: `Order ${orderId}`,
            image: '/images/logo.png',
            order_id: rzpOrderId,
            handler: async (response) => {
                await verifyAndComplete(response, orderId, docId);
            },
            prefill: {
                name: customer.name,
                contact: customer.phone
            },
            notes: {
                internal_order_id: orderId
            },
            theme: {
                color: '#FACC15' // Updated to match new accent
            },
            modal: {
                ondismiss: async () => {
                    await handlePaymentCancel(docId);
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerHTML = `Place Order (₹${getCartTotal()})`;
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async (response) => {
            console.error('Payment Failed Event:', response.error);
            await handlePaymentCancel(docId);
            showError(`Payment Failed: ${response.error.description}`);
            resetButton(`Place Order (₹${amount})`);
        });

        rzp.open();

    } catch (error) {
        console.error('Online payment initialization failed:', error);
        await handlePaymentCancel(docId);
        throw error;
    }
};

const verifyAndComplete = async (rzpResponse, orderId, docId) => {
    try {
        placeOrderBtn.textContent = 'Verifying Payment...';
        
        const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
        const verifyResult = await verifyPayment({
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_signature: rzpResponse.razorpay_signature,
            internal_order_id: docId
        });

        if (verifyResult.data.success) {
            clearCart();
            window.location.href = `/track.html?id=${orderId}`;
        } else {
            throw new Error('Verification failed');
        }
    } catch (error) {
        console.error('Verification error:', error);
        showError('Payment verification failed. Please contact support if amount was deducted.');
        resetButton(`Retry Payment`);
    }
};
*/

const handlePaymentCancel = async (docId) => {
    await updateOrderDetails(docId, {
        status: ORDER_STATUS.PAYMENT_FAILED,
        paymentStatus: 'failed'
    });
};

const sanitizePhone = (phone) => {
    return phone.replace(/[^0-9]/g, '').slice(-10);
};

const resetButton = (text) => {
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = text;
};

const showError = (msg) => {
    if (!errorDisplay) {
        alert(msg);
        return;
    }
    errorDisplay.textContent = msg;
    errorDisplay.classList.remove('hidden');
};

const hideError = () => {
    if (errorDisplay) errorDisplay.classList.add('hidden');
};
