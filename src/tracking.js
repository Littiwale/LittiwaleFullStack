import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase/config';
import { requestNotificationPermission, saveFCMTokenToOrder } from './notifications';
import { getUserProfile, onAuthChange, normalizePhone } from './api/auth';
import { ORDER_STATUS } from './constants/orderStatus';

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

const riderInfo = document.querySelector('#rider-info');
const riderName = document.querySelector('#rider-name-display');
const riderCall = document.querySelector('#rider-call-btn');

const initTracking = async () => {
    const isGuest = localStorage.getItem('littiwale_guest') === 'true';
    if (isGuest) {
        window.location.href = '/login.html?redirect=' + window.location.pathname + window.location.search;
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        showError();
        return;
    }

    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('orderId', '==', orderId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showError();
            return;
        }

        const doc = querySnapshot.docs[0];
        const orderData = doc.data();
        renderOrder(orderData);

        // Handle Notifications
        setTimeout(async () => {
            const token = await requestNotificationPermission();
            if (token && !orderData.fcmToken) {
                await saveFCMTokenToOrder(doc.id, token);
            }
        }, 2000);

    } catch (error) {
        console.error('Tracking fetch failed:', error);
        showError();
    }
};

const renderOrder = async (order) => {
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
};

const showError = () => {
    loading.classList.add('hidden');
    errorDiv.classList.remove('hidden');
};

initTracking();
