import { collection, query, where, onSnapshot, limit, addDoc, serverTimestamp, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import { requestNotificationPermission, saveFCMTokenToOrder } from './notifications';
import { getUserProfile, onAuthChange } from './api/auth';
import { fetchTickets } from './api/tickets';
import { ORDER_STATUS } from './constants/orderStatus';
import { updateDeliveryEstimate } from './utils';
import { initCheckout } from './menu/checkout';

const content = document.querySelector('#tracking-content');
const loading = document.querySelector('#tracking-loading');
const result = document.querySelector('#tracking-result');
const errorDiv = document.querySelector('#tracking-error');

const orderIdDisplay = document.querySelector('#order-id-display');
const statusBadge = document.querySelector('#order-status-badge');
const itemsList = document.querySelector('#order-items-list');
const totalDisplay = document.querySelector('#order-total-display');
const custName = document.querySelector('#cust-name-display');
const custPhone = document.querySelector('#cust-phone-display');
const custAddress = document.querySelector('#cust-address-display');
let trackingUnsubscribe = null;

const riderInfo = document.querySelector('#rider-info');
const riderName = document.querySelector('#rider-name-display');
const riderCall = document.querySelector('#rider-call-btn');

const initTracking = async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const trackingToken = urlParams.get('token');

    if (!orderId || !trackingToken) {
        showError();
        return;
    }

    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('orderId', '==', orderId),
            where('trackingToken', '==', trackingToken),
            limit(1)
        );
        
        let previousStatus = null;
        let isFirstLoad = true;

        trackingUnsubscribe = onSnapshot(q, async (querySnapshot) => {
            if (querySnapshot.empty) {
                showError();
                return;
            }

            const docRef = querySnapshot.docs[0];
            const orderData = docRef.data();
            
            // Audio Notification Logic (Item 12)
            if (!isFirstLoad && previousStatus !== orderData.status) {
                const triggerStatuses = [
                    ORDER_STATUS.PREPARING, 
                    ORDER_STATUS.READY, 
                    ORDER_STATUS.ASSIGNED, 
                    ORDER_STATUS.DELIVERED
                ];
                if (triggerStatuses.includes(orderData.status)) {
                    const audio = document.getElementById('status-sound');
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.warn('Audio play failed', e));
                    }
                }
            }
            
            previousStatus = orderData.status;

            renderOrder(orderData, docRef.id);

            // Handle Notifications (only on first load)
            if (isFirstLoad) {
                setTimeout(async () => {
                    const token = await requestNotificationPermission();
                    if (token && !orderData.fcmToken) {
                        await saveFCMTokenToOrder(docRef.id, token);
                    }
                }, 2000);
                isFirstLoad = false;
            }
        }, (error) => {
            console.error('Tracking listen failed:', error);
            showError();
        });

    } catch (error) {
        console.error('Tracking setup failed:', error);
        showError();
    }
};

const loadOrderTickets = async (customerPhone) => {
    const section = document.getElementById('order-tickets-section');
    const list = document.getElementById('order-tickets-list');
    if (!section || !list || !customerPhone) return;

    try {
        const allTickets = await fetchTickets();
        const myTickets = allTickets.filter(t => t.phone === customerPhone);
        if (myTickets.length === 0) return;

        section.style.display = 'block';
        list.innerHTML = myTickets.map(t => `
            <div style="background: var(--surface); border: 1px solid var(--glass-border); border-radius: 12px; padding: 14px; margin-bottom: 10px;">
                <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 4px;">${t.issue}</p>
                <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: ${t.status === 'resolved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${t.status === 'resolved' ? '#10B981' : '#F59E0B'};">${t.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}</span>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading tickets:', err);
    }
};

const renderOrder = async (order, docId) => {
    loading.classList.add('hidden');
    result.classList.remove('hidden');

    orderIdDisplay.textContent = order.orderId;
    statusBadge.textContent = order.status;
    
    orderIdDisplay.textContent = order.orderId;
    statusBadge.textContent = order.status.replace(/_/g, ' ');
    
    // Status color
    const statusClasses = {
        [ORDER_STATUS.PLACED]:           'bg-blue-900 text-blue-300',
        [ORDER_STATUS.ACCEPTED]:         'bg-indigo-900 text-indigo-300',
        [ORDER_STATUS.PREPARING]:        'bg-orange-900 text-orange-300',
        [ORDER_STATUS.READY]:            'bg-yellow-900 text-yellow-300',
        [ORDER_STATUS.ASSIGNED]:         'bg-purple-900 text-purple-300',
        [ORDER_STATUS.DELIVERED]:        'bg-green-900 text-green-300',
        [ORDER_STATUS.CANCELLED]:        'bg-red-900 text-red-300',
        [ORDER_STATUS.REJECTED]:         'bg-red-900 text-red-300'
    };
    statusBadge.className = `px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClasses[order.status] || 'bg-gray-800'}`;

    // Handle Rider Info
    if (order.riderId && order.status === ORDER_STATUS.ASSIGNED) {
        const profile = await getUserProfile(order.riderId);
        if (profile) {
            riderInfo.classList.remove('hidden');
            riderName.textContent = profile.name;
            const phone = profile.phone || profile.email; // Fallback to email if phone missing
            riderCall.href = `tel:${phone}`;
        }
    } else {
        riderInfo.classList.add('hidden');
    }

    itemsList.innerHTML = order.items.map(item => `
        <div class="flex justify-between text-sm">
            <span>${item.name} <span class="text-gray-500">(${item.variant.toUpperCase()} × ${item.quantity})</span></span>
            <span class="font-bold">₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    totalDisplay.textContent = `₹${order.total}`;
    
    // Customer Details
    custName.textContent = order.customer.name;
    custPhone.textContent = order.customer.phone;
    custAddress.textContent = order.customer.address;

    // Load customer tickets
    if (order.customer?.phone) {
        loadOrderTickets(order.customer.phone);
    }

    // ── RATING (Item 10) ──
    const ratingContainer = document.querySelector('#rating-container');
    if (order.status === ORDER_STATUS.DELIVERED && order.userId) {
        // Check if already rated
        try {
            const rSnap = await getDocs(query(collection(db, 'orders', docId, 'rating')));
            if (rSnap.empty) {
                ratingContainer.style.display = 'block';
                setupRatingInput(docId);
            }
        } catch (e) { console.warn('Could not fetch rating info', e); }
    } else if (ratingContainer) {
        ratingContainer.style.display = 'none';
    }

    // Call ETA logic for active orders
    const activeStatuses = [
        ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, 
        ORDER_STATUS.READY, ORDER_STATUS.ASSIGNED
    ];
    const etaDiv = document.querySelector('#delivery-estimate');
    if (etaDiv) {
        if (activeStatuses.includes(order.status)) {
            updateDeliveryEstimate();
            etaDiv.style.display = 'block';
        } else {
            etaDiv.style.display = 'none';
        }
    }
};

const setupRatingInput = (orderDocId) => {
    const starContainer = document.querySelector('#star-rating');
    const msg = document.querySelector('#rating-msg');
    if (!starContainer) return;

    const stars = Array.from(starContainer.children);
    let selectedRating = 0;

    const updateStars = (val) => {
        stars.forEach(s => {
            const sVal = parseInt(s.dataset.val);
            s.style.color = sVal <= val ? '#F5A800' : '#4b5563';
        });
    };

    stars.forEach(s => {
        s.addEventListener('mouseenter', () => updateStars(parseInt(s.dataset.val)));
        s.addEventListener('mouseleave', () => updateStars(selectedRating));
        s.addEventListener('click', async () => {
            selectedRating = parseInt(s.dataset.val);
            updateStars(selectedRating);
            starContainer.style.pointerEvents = 'none';
            msg.style.display = 'block';
            msg.textContent = 'Submitting...';
            msg.style.color = '#F5A800';

            try {
                await addDoc(collection(db, 'orders', orderDocId, 'rating'), {
                    rating: selectedRating,
                    createdAt: serverTimestamp()
                });
                msg.textContent = `Thanks for your ${selectedRating}-star rating! 🎉`;
                msg.style.color = '#10B981';
            } catch (err) {
                console.error('Rating failed:', err);
                msg.textContent = 'Failed to submit rating.';
                msg.style.color = '#ef4444';
                starContainer.style.pointerEvents = 'auto'; // allow retry
            }
        });
    });
};

window.addEventListener('beforeunload', () => {
    if (typeof trackingUnsubscribe === 'function') {
        trackingUnsubscribe();
    }
});

initCheckout();

const showError = () => {
    loading.classList.add('hidden');
    errorDiv.classList.remove('hidden');
};

initTracking();
