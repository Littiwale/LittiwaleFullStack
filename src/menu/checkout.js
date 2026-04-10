import { getCart, getCartTotal, clearCart } from '../store/cart';
import { validateOrder, createOrderEntry, updateOrderDetails } from '../api/orders';
import { validateCoupon } from '../api/coupons';
import { functions, auth, db } from '../firebase/config';
import { normalizePhone } from '../api/auth';
import { ORDER_STATUS } from '../constants/orderStatus';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

const checkoutModal = document.querySelector('#checkout-modal');
const checkoutForm = document.querySelector('#checkout-form');
const checkoutAmount = document.querySelector('#checkout-amount');
const closeCheckout = document.querySelector('#close-checkout');
const proceedBtn = document.querySelector('#checkout-btn');
const cartModal = document.querySelector('#cart-modal');
const errorDisplay = document.querySelector('#checkout-error');
const placeOrderBtn = document.querySelector('#place-order-btn');

// Coupon state — module-level so handleCheckoutSubmit can read it
let appliedDiscount = 0;
let appliedCouponCode = '';

export const initCheckout = () => {
    if (!proceedBtn || !checkoutModal || !closeCheckout) return;

    // Open Checkout Modal
    proceedBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Reset coupon state every time modal opens
        appliedDiscount = 0;
        appliedCouponCode = '';
        const couponInput = document.querySelector('#coupon-input');
        const couponMsg = document.querySelector('#coupon-message');
        if (couponInput) couponInput.value = '';
        if (couponMsg) { couponMsg.textContent = ''; couponMsg.style.color = ''; }

        cartModal.classList.add('hidden');
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'flex';

        // Show total (before coupon)
        if (checkoutAmount) checkoutAmount.textContent = `₹${getCartTotal()}`;

        // Item 9: Load Saved Addresses
        loadSavedAddresses();
    });

    // Close Checkout Modal
    closeCheckout.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    });

    // ── COUPON APPLY (Item 6) ──
    const applyBtn = document.querySelector('#apply-coupon-btn');
    const couponInput = document.querySelector('#coupon-input');
    const couponMsg = document.querySelector('#coupon-message');

    if (applyBtn && couponInput && couponMsg) {
        applyBtn.addEventListener('click', async () => {
            const code = couponInput.value.trim();
            if (!code) return;

            applyBtn.textContent = '...';
            applyBtn.disabled = true;

            const rawTotal = getCartTotal();
            const result = await validateCoupon(code, rawTotal);

            applyBtn.textContent = 'Apply';
            applyBtn.disabled = false;

            if (result.valid) {
                appliedDiscount = result.discount;
                appliedCouponCode = code.toUpperCase();
                const newTotal = Math.max(0, rawTotal - appliedDiscount);
                if (checkoutAmount) checkoutAmount.textContent = `₹${newTotal}`;
                couponMsg.textContent = result.message;
                couponMsg.style.color = '#10B981';
            } else {
                appliedDiscount = 0;
                appliedCouponCode = '';
                if (checkoutAmount) checkoutAmount.textContent = `₹${rawTotal}`;
                couponMsg.textContent = result.message;
                couponMsg.style.color = '#ef4444';
            }
        });
    }

    // Form Submission
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
};

const loadSavedAddresses = async () => {
    const selectEl = document.querySelector('#saved-addresses-select');
    const saveCb = document.querySelector('#save-address-cb');
    if (!selectEl) return;
    
    // Hide for guests
    if (!auth?.currentUser) {
        selectEl.style.display = 'none';
        if (saveCb) saveCb.parentElement.style.display = 'none';
        return;
    }

    if (saveCb) saveCb.parentElement.style.display = 'flex'; // Show checkbox for logged-in

    try {
        const q = query(
            collection(db, 'users', auth.currentUser.uid, 'addresses'),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        if (snap.empty) {
            selectEl.style.display = 'none';
            return;
        }

        selectEl.innerHTML = '<option value="">-- Saved Addresses --</option>';
        let idx = 1;
        snap.forEach(doc => {
            const val = doc.data().address;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = `Address ${idx++}: ${val.substring(0, 25)}...`;
            selectEl.appendChild(opt);
        });
        
        selectEl.style.display = 'block';
        selectEl.onchange = (e) => {
            if (e.target.value) {
                document.querySelector('#cust-address').value = e.target.value;
            }
        };
    } catch (err) {
        console.error('Error fetching saved addresses:', err);
        selectEl.style.display = 'none';
    }
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
        const rawTotal = getCartTotal();
        // Apply coupon discount (floor at 0)
        const total = Math.max(0, rawTotal - appliedDiscount);

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
            rawTotal: rawTotal,
            paymentMethod: paymentMethod,
            // Attach userId if logged in
            userId: auth?.currentUser?.uid || null,
            ...(appliedCouponCode ? { couponCode: appliedCouponCode, discount: appliedDiscount } : {})
        };

        const { success, orderId, docId } = await createOrderEntry(orderData);
        if (!success) throw new Error('Failed to create order entry');

        // Item 9: Save Address logic
        const saveCb = document.querySelector('#save-address-cb');
        if (auth?.currentUser && saveCb?.checked) {
            try {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'addresses'), {
                    address: customerDetails.address,
                    createdAt: serverTimestamp()
                });
            } catch (err) {
                console.error('Failed to save address:', err);
            }
        }

        // 5. Branch based on Payment Method
        if (paymentMethod === 'COD') {
            await handleCODSuccess(orderId);
        } else {
            // Online Payment Disabled - Show Notice
            alert("Online payment coming soon! Please select Cash on Delivery.");
            resetButton(originalBtnText);
        }

    } catch (error) {
        console.error('Checkout failed:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
        resetButton(originalBtnText);
    }
};

const handleCODSuccess = async (orderId) => {
    clearCart();
    window.location.href = `/customer/track.html?id=${orderId}`;
};

/* 
const handleOnlinePayment = async (orderId, docId, amount, customer) => { ... };
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
