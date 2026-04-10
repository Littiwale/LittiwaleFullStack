import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange, logoutUser } from './api/auth';

const ordersList = document.querySelector('#rider-orders-list');
const assignCount = document.querySelector('#assign-count');
const logoutBtn = document.querySelector('#rider-logout');
const notifSound = document.querySelector('#notif-sound');

let isInitialLoad = true;

/**
 * Initializes the Rider Panel with role security
 */
const initRider = () => {
    onAuthChange((user) => {
        if (!user || user.profile?.role !== 'rider') {
            console.warn('⛔ Unauthorized Rider Access Attempt');
            alert('Access Denied: Partner login required.');
            window.location.href = '/';
            return;
        }

        startRiderListener(user.uid);
    });

    logoutBtn?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = '/';
    });
};

const startRiderListener = (riderId) => {
    const ordersRef = collection(db, 'orders');
    // Riders only see Active orders assigned to them
    const q = query(
        ordersRef, 
        where('riderId', '==', riderId),
        orderBy('createdAt', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        const orders = [];
        let hasNewAssignment = false;

        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) hasNewOrderAssignment();
        });

        snapshot.docs.forEach(doc => {
            const order = { id: doc.id, ...doc.data() };
            // Filter out completed orders (delivered/cancelled)
            if (!['DELIVERED', 'CANCELLED'].includes(order.status)) {
                orders.push(order);
            }
        });

        renderRiderOrders(orders);
        if (assignCount) assignCount.textContent = orders.length;
        isInitialLoad = false;
    });
};

const renderRiderOrders = (orders) => {
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="text-center py-20 text-gray-600">
                <p>No active orders assigned to you.</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => createRiderOrderCard(order)).join('');
};

const createRiderOrderCard = (order) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;
    const statusClass = `status-${order.status.toLowerCase()}`;

    return `
        <div class="admin-card glass p-6 rounded-3xl border border-gray-800 shadow-xl overflow-hidden relative">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-black tracking-widest text-gray-500">${order.orderId}</span>
                    <h3 class="text-xl font-black">${order.customer.name}</h3>
                </div>
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusClass}">
                    ${order.status.replace(/_/g, ' ')}
                </span>
            </div>

            <div class="space-y-4 mb-6">
                <!-- Contact Action -->
                <div class="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <div class="text-sm">
                        <p class="text-gray-500 text-[10px] uppercase font-bold">Contact Customer</p>
                        <p class="font-bold">${order.customer.phone}</p>
                    </div>
                    <a href="tel:${order.customer.phone}" class="bg-success text-white p-3 rounded-full flex items-center shadow-lg active:scale-90 transition-transform">
                        📞
                    </a>
                </div>

                <!-- Address Action -->
                <div class="flex items-start justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                    <div class="text-sm flex-1 mr-4">
                        <p class="text-gray-500 text-[10px] uppercase font-bold">Delivery Address</p>
                        <p class="text-gray-300 leading-snug">${order.customer.address}</p>
                    </div>
                    <a href="${googleMapsUrl}" target="_blank" class="bg-blue-600 text-white p-3 rounded-full flex items-center shadow-lg active:scale-90 transition-transform">
                        📍
                    </a>
                </div>

                <!-- Order Tally -->
                <div class="text-xs text-gray-400">
                    <p class="font-bold uppercase mb-1">Items</p>
                    <p>${order.items.map(i => `${i.name} (${i.variant} x ${i.quantity})`).join(', ')}</p>
                </div>

                <div class="flex justify-between items-center pt-2 border-t border-gray-800">
                    <p class="text-sm font-bold uppercase ${order.paymentMethod === 'COD' ? 'text-orange-500' : 'text-green-500'}">
                        ${order.paymentMethod === 'COD' ? `Collect: ₹${order.total}` : 'Paid Online'}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
                <button class="action-btn status-out_for_delivery py-4" onclick="updateRiderStatus('${order.id}', 'OUT_FOR_DELIVERY')">Start Delivery</button>
                <button class="action-btn status-delivered py-4" onclick="updateRiderStatus('${order.id}', 'DELIVERED')">Mark Delivered</button>
            </div>
        </div>
    `;
};

window.updateRiderStatus = async (docId, newStatus) => {
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Update failed:', error);
        alert('Action failed. Try again.');
    }
};

const hasNewOrderAssignment = () => {
    if (notifSound) {
        notifSound.currentTime = 0;
        notifSound.play().catch(e => console.warn('Audio blocked:', e));
    }
};

initRider();
