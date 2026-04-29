import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase/config';
import { ORDER_STATUS } from './constants/orderStatus';
import { onAuthChange, logoutUser, getUserRole } from './api/auth';
import { updateOrderDetails } from './api/orders';
import { fetchRiderPayments } from './api/users';
import { RIDER_EARNING_PER_ORDER } from './constants/config';
import { showPersistentNotification, closePersistentNotification } from './utils/notification-manager';

/**
 * 🛵 LITTIWALE RIDER PANEL — NEON DARK
 * Real Firebase data · Neon Dark card layout (Option 1 mockup)
 */

let isInitialLoad = true;
let riderListenerUnsubscribe = null;

/* ── INIT ─────────────────────────────────────────── */
const initRider = () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'rider-auth-loader';
    loadingOverlay.style.cssText = [
        'position:fixed;inset:0;background:#080b12;z-index:99999',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px'
    ].join(';');
    loadingOverlay.innerHTML = `
        <div style="width:40px;height:40px;border:3px solid #1a2035;border-top-color:#F5A800;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <p style="color:#F5A800;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;font-family:'Space Mono',monospace;">Verifying…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(loadingOverlay);

    onAuthChange((user, isLoading) => {
        if (isLoading) return;
        loadingOverlay.remove();

        if (!user) { window.location.href = '/login.html'; return; }
        const role = getUserRole(user);
        if (!['rider', 'admin', 'manager'].includes(role)) {
            window.location.href = '/customer/index.html'; return;
        }

        const name    = user.profile?.name || 'Rider';
        const initial = name.charAt(0).toUpperCase();
        const trigger = document.getElementById('rider-avatar-trigger');
        const ddName  = document.getElementById('rider-dd-name');
        const ddRole  = document.getElementById('rider-dd-role');
        if (trigger) trigger.textContent = initial;
        if (ddName)  ddName.textContent  = name;
        if (ddRole)  ddRole.textContent  = role.toUpperCase();

        if (role === 'admin' || role === 'manager') {
            const dropdown      = document.getElementById('rider-profile-dropdown');
            const storefrontBtn = document.getElementById('rider-dd-storefront');
            if (dropdown && storefrontBtn) {
                const adminBtn = document.createElement('button');
                adminBtn.className   = 'lw-dropdown-item';
                adminBtn.id          = 'rider-dd-admin';
                adminBtn.textContent = '🏠 Admin Panel';
                dropdown.insertBefore(adminBtn, storefrontBtn);
            }
        }

        const dropdown = document.getElementById('rider-profile-dropdown');
        trigger?.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
        });
        document.addEventListener('click', function(e) {
            if (!trigger?.contains(e.target) && !dropdown?.contains(e.target))
                dropdown?.classList.remove('open');
        });

        document.getElementById('rider-dd-admin')?.addEventListener('click',      () => { window.location.href = '/admin/index.html'; });
        document.getElementById('rider-dd-storefront')?.addEventListener('click', () => { window.location.href = '/customer/index.html'; });
        document.getElementById('rider-dd-logout')?.addEventListener('click', async () => { await logoutUser(); window.location.href = '/login.html'; });
        document.getElementById('bnav-profile')?.addEventListener('click', () => {
            alert(`👤 ${name}\nRole: ${role.toUpperCase()}\n\nTo update your profile, contact the admin.`);
        });

        startRiderListener(user.uid);
        initRiderToggle(user.uid);
        startRiderNotificationListener(user.uid);
    });
};

/* ── ONLINE / OFFLINE TOGGLE ─────────────────────── */
const initRiderToggle = async (riderId) => {
    const toggle = document.getElementById('rider-status-toggle');
    const text   = document.getElementById('rider-status-text');
    const knob   = document.getElementById('rider-toggle-knob');
    const slider = document.getElementById('rider-toggle-slider');
    if (!toggle) return;

    const applyState = (isOnline) => {
        toggle.checked = isOnline;
        if (text) {
            text.textContent = isOnline ? '● ONLINE' : '● OFFLINE';
            text.className   = 'nd-online-tag' + (isOnline ? '' : ' offline');
        }
        if (slider) slider.style.backgroundColor = isOnline ? '#10B981' : '#ef4444';
        if (knob)   knob.style.transform          = isOnline ? 'translateX(24px)' : 'translateX(0)';
    };

    try {
        const userDoc = await getDoc(doc(db, 'users', riderId));
        if (userDoc.exists()) applyState(userDoc.data().isOnline || false);
    } catch(e) {}

    toggle.addEventListener('change', async (e) => {
        const isOnline = e.target.checked;
        try {
            const updateData = { isOnline, lastOnlineStatusChangeAt: new Date() };
            if (isOnline) updateData.lastOnlineAt  = new Date();
            else          updateData.lastOfflineAt = new Date();
            await updateDoc(doc(db, 'users', riderId), updateData);
            applyState(isOnline);
        } catch(err) {
            console.error('Failed to toggle status', err);
            e.target.checked = !isOnline;
        }
    });
};

/* ── REAL-TIME ORDER LISTENER ────────────────────── */
const startRiderListener = (riderId) => {
    if (typeof riderListenerUnsubscribe === 'function') riderListenerUnsubscribe();

    console.log('[RIDER] Starting order listener for rider:', riderId);
    const q = query(collection(db, 'orders'), where('riderId', '==', riderId));

    riderListenerUnsubscribe = onSnapshot(q, (snapshot) => {
        console.log('[RIDER] Orders found:', snapshot.size);
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) {
                playNotificationSound();
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            }
        });

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let todaysEarnings = 0, deliveriesCount = 0;
        let monthlyEarnings = 0, allTimeEarnings = 0;

        const allOrders = snapshot.docs
            .map(snap => ({ id: snap.id, ...snap.data() }))
            .sort((a, b) => {
                const aT = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bT = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bT - aT;
            });

        allOrders.forEach(o => {
            if (o.status === ORDER_STATUS.DELIVERED && o.updatedAt) {
                const d = o.updatedAt.toDate ? o.updatedAt.toDate() : new Date(o.updatedAt);
                allTimeEarnings += RIDER_EARNING_PER_ORDER;
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    monthlyEarnings += RIDER_EARNING_PER_ORDER;
                }
                if (d >= today) { todaysEarnings += RIDER_EARNING_PER_ORDER; deliveriesCount++; }
            }
        });

        // Update DOM for basic metrics
        const earnEl       = document.getElementById('rider-earnings');
        const countEl      = document.getElementById('rider-deliveries');
        const todayCountEl = document.getElementById('rider-today-count');
        if (earnEl)       earnEl.textContent      = `₹${todaysEarnings}`;
        if (countEl)      countEl.textContent      = `${deliveriesCount} deliveries`;
        if (todayCountEl) todayCountEl.textContent = `${deliveriesCount} today`;
        
        // Fetch Payments and Update Financial Overview
        fetchRiderPayments(riderId).then(payments => {
            const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const pendingDue = allTimeEarnings - totalPaid;
            
            document.getElementById('rider-pending-due').textContent = `₹${pendingDue}`;
            document.getElementById('rider-total-paid').textContent = `₹${totalPaid}`;
            document.getElementById('rider-monthly-earn').textContent = `₹${monthlyEarnings}`;
            document.getElementById('rider-alltime-earn').textContent = `₹${allTimeEarnings}`;
            
            // Ledger logic
            const ledgerList = document.getElementById('ledger-list');
            if (ledgerList) {
                if (payments.length === 0) {
                    ledgerList.innerHTML = `<div style="color:#888;text-align:center;font-size:13px;padding:20px;">No payments recorded yet.</div>`;
                } else {
                    ledgerList.innerHTML = payments.map(p => {
                        const date = p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString() : 'Unknown date';
                        return `
                        <div style="background:#13151A;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:4px;">${p.note || 'Cash Payment'}</div>
                                <div style="color:#888;font-size:11px;">${date}</div>
                            </div>
                            <div style="color:#10b981;font-weight:900;font-size:16px;">+₹${p.amount}</div>
                        </div>`;
                    }).join('');
                }
            }
        });

        const activeOrders  = allOrders.filter(o => ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(o.status));
        const pendingOrders = activeOrders.filter(o => o.status === ORDER_STATUS.READY);
        const currentOrders = activeOrders.filter(o => o.status === ORDER_STATUS.ASSIGNED);

        renderPendingPickups(pendingOrders);
        renderCurrentDelivery(currentOrders);
        isInitialLoad = false;
    });
};

window.addEventListener('beforeunload', () => {
    if (typeof riderListenerUnsubscribe === 'function') riderListenerUnsubscribe();
});

/* ── RIDER NOTIFICATIONS (NEW ASSIGNMENTS) ──────── */
let riderNotificationUnsubscribe = null;
let riderNotificationId = null;

const startRiderNotificationListener = (riderId) => {
    if (typeof riderNotificationUnsubscribe === 'function') riderNotificationUnsubscribe();

    console.log('[RIDER] Starting notification listener for rider:', riderId);
    // Removed orderBy temporarily - Firestore composite index issue
    const q = query(
        collection(db, 'riderNotifications'),
        where('riderId', '==', riderId)
    );

    riderNotificationUnsubscribe = onSnapshot(q, (snapshot) => {
        console.log('[RIDER] Notifications received:', snapshot.size, snapshot.docs.map(d => ({id: d.id, read: d.data().read, createdAt: d.data().createdAt})));
        
        // Sort manually since we can't use orderBy with composite index yet
        const docs = snapshot.docs.sort((a, b) => {
            const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
            const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
            return bTime - aTime;
        });
        
        docs.forEach(docSnapshot => {
            const change = {type: 'added', doc: docSnapshot};
            if (change.type === 'added') {
                const notif = change.doc.data();
                const notifDocId = change.doc.id;
                
                // Client-side filter: only show unread notifications
                if (notif.read === true) {
                    console.log('[RIDER] Skipping read notification:', notifDocId);
                    return;
                }
                
                console.log('[RIDER] ✅ Showing notification:', notifDocId, notif);
                
                // Show persistent modal notification with buttons
                riderNotificationId = showPersistentNotification({
                    title: '🛵 NEW DELIVERY ASSIGNED!',
                    message: 'You have a new order assignment. Review details and accept or reject.',
                    type: 'assignment',
                    data: {
                        orderId: notif.orderData?.orderId || change.doc.id,
                        total: notif.orderData?.total,
                        customerName: notif.orderData?.customerName,
                        customerPhone: notif.orderData?.customerPhone,
                        items: notif.orderData?.items
                    },
                    persistent: true,
                    onAccept: async () => {
                        // Track rider acceptance in the order
                        try {
                            const orderId = notif.orderId;
                            if (!orderId) throw new Error('Order ID not found');
                            await updateOrderDetails(orderId, {
                                riderStatus: 'accepted',
                                riderAcceptedAt: new Date(),
                                status: ORDER_STATUS.ASSIGNED  // Move to assigned when rider accepts
                            });
                            await updateDoc(doc(db, 'riderNotifications', notifDocId), { read: true });
                            showPersistentNotification({
                                title: '✅ Order Accepted!',
                                message: 'Order ready for pickup',
                                type: 'success',
                                duration: 3000
                            });
                        } catch (e) {
                            console.error('Error accepting order:', e);
                            alert('❌ Failed to accept order. Please try again.');
                        }
                    },
                    onReject: async () => {
                        // Track rider rejection in the order
                        try {
                            const orderId = notif.orderId;
                            if (!orderId) throw new Error('Order ID not found');
                            // Only update riderStatus and riderRejectedAt - don't clear riderId/riderName
                            // Admin will handle reassignment
                            await updateOrderDetails(orderId, {
                                riderStatus: 'rejected',
                                riderRejectedAt: new Date()
                            });
                            await updateDoc(doc(db, 'riderNotifications', notifDocId), { read: true });
                            showPersistentNotification({
                                title: '❌ Order Rejected',
                                message: 'Admin will reassign to another rider',
                                type: 'warning',
                                duration: 3000
                            });
                        } catch (e) {
                            console.error('Error rejecting order:', e);
                            alert('❌ Failed to reject order. Please try again.');
                        }
                    }
                });
            }
        });
    });
};



window.addEventListener('beforeunload', () => {
    if (typeof riderNotificationUnsubscribe === 'function') riderNotificationUnsubscribe();
});

/* ── PENDING PICKUPS ─────────────────────────────── */
const renderPendingPickups = (orders) => {
    const container = document.getElementById('pending-pickups-list');
    const countEl   = document.getElementById('pending-count');
    if (!container) return;
    if (countEl) countEl.textContent = orders.length;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="rider-empty">
                <div class="empty-emoji">🎉</div>
                <p>No new pickups yet</p>
            </div>`;
        return;
    }
    container.innerHTML = orders.map(createPendingCard).join('');
};

const createPendingCard = (order) => {
    const time      = order.createdAt?.toDate
        ? new Date(order.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';
    const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || '—';
    const cod       = order.paymentMethod === 'COD';
    const mapUrl    = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.address || '')}`;

    return `
        <div class="nd-card">
            <div class="nd-card-top">
                <div class="nd-order-id">${order.orderId || '#' + order.id.slice(0, 6).toUpperCase()}</div>
                <div class="nd-amount">₹${order.total}</div>
            </div>

            <div class="nd-cust-name">${order.customer?.name || 'Customer'}</div>

            <div class="nd-chips">
                <div class="nd-chip">
                    <div class="nd-chip-label">Items</div>
                    <div class="nd-chip-val">${itemCount}</div>
                </div>
                <div class="nd-chip">
                    <div class="nd-chip-label">Time</div>
                    <div class="nd-chip-val">${time}</div>
                </div>
                <div class="nd-chip">
                    <div class="nd-chip-label">Payment</div>
                    <div class="nd-chip-val ${cod ? 'cod' : 'paid'}">${cod ? 'COD' : 'PAID'}</div>
                </div>
            </div>

            <div class="nd-addr-row">
                <div class="nd-addr-info">
                    <div class="nd-addr-label">Deliver To</div>
                    <div class="nd-addr-val">${order.customer?.address || '—'}</div>
                </div>
                <div class="nd-icon-btns">
                    <a href="tel:${order.customer?.phone || ''}" class="nd-icon-btn call">📞</a>
                    <a href="${mapUrl}" target="_blank" class="nd-icon-btn map">🗺️</a>
                </div>
            </div>

            <button class="nd-btn-primary" onclick="window.pickupOrder('${order.id}')">
                📦 PICK UP ORDER
            </button>
        </div>`;
};

/* ── CURRENT DELIVERY ────────────────────────────── */
const renderCurrentDelivery = (orders) => {
    const container = document.getElementById('current-delivery-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="rider-empty">
                <div class="empty-emoji">🛵</div>
                <p>No active delivery</p>
            </div>`;
        return;
    }

    const order     = orders[0];
    const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || '—';
    const cod       = order.paymentMethod === 'COD';
    const mapUrl    = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.address || '')}`;

    container.innerHTML = `
        <div class="nd-card nd-card-delivery">
            <div class="nd-delivery-glow"></div>

            <div class="nd-in-transit">
                <span class="nd-transit-dot"></span>
                IN TRANSIT
            </div>

            <div class="nd-card-top">
                <div class="nd-order-id">${order.orderId || '#' + order.id.slice(0, 6).toUpperCase()}</div>
                <div class="nd-amount nd-amount-green">₹${order.total}</div>
            </div>

            <div class="nd-cust-name">${order.customer?.name || 'Customer'}</div>

            <div class="nd-chips">
                <div class="nd-chip">
                    <div class="nd-chip-label">Items</div>
                    <div class="nd-chip-val">${itemCount}</div>
                </div>
                <div class="nd-chip">
                    <div class="nd-chip-label">Payment</div>
                    <div class="nd-chip-val ${cod ? 'cod' : 'paid'}">${cod ? 'COD' : 'PAID'}</div>
                </div>
            </div>

            <div class="nd-addr-row">
                <div class="nd-addr-info">
                    <div class="nd-addr-label">Deliver To</div>
                    <div class="nd-addr-val">${order.customer?.address || '—'}</div>
                </div>
                <div class="nd-icon-btns">
                    <a href="tel:${order.customer?.phone || ''}" class="nd-icon-btn call">📞</a>
                    <a href="${mapUrl}" target="_blank" class="nd-icon-btn map">🗺️</a>
                </div>
            </div>

            <button class="nd-btn-success" onclick="window.markDelivered('${order.id}')">
                ✅ MARK DELIVERED
            </button>
        </div>`;
};

/* ── GLOBAL ACTIONS ──────────────────────────────── */
window.pickupOrder = async (docId) => {
    try {
        await updateOrderDetails(docId, { status: ORDER_STATUS.ASSIGNED });
    } catch (e) {
        console.error('Pickup failed:', e);
        alert('Could not update order. Try again.');
    }
};

window.markDelivered = async (docId) => {
    try {
        await updateOrderDetails(docId, { status: ORDER_STATUS.DELIVERED, paymentStatus: 'paid' });
    } catch (e) {
        console.error('Delivery update failed:', e);
        alert('Could not mark as delivered. Try again.');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    initRider();
    
    // Ledger Modal Events
    const ledgerModal = document.getElementById('ledger-modal');
    const ledgerBtn = document.getElementById('view-ledger-btn');
    const closeLedgerBtn = document.getElementById('close-ledger');
    
    if (ledgerBtn && ledgerModal) {
        ledgerBtn.addEventListener('click', () => {
            ledgerModal.style.display = 'flex';
        });
    }
    
    if (closeLedgerBtn && ledgerModal) {
        closeLedgerBtn.addEventListener('click', () => {
            ledgerModal.style.display = 'none';
        });
    }
    
    if (ledgerModal) {
        ledgerModal.addEventListener('click', (e) => {
            if (e.target === ledgerModal) {
                ledgerModal.style.display = 'none';
            }
        });
    }
});