import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { ORDER_STATUS } from './constants/orderStatus';
import { onAuthChange, logoutUser, getUserRole } from './api/auth';
import { updateOrderDetails } from './api/orders';
import { RIDER_EARNING_PER_ORDER } from './constants/config';

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

    const q = query(collection(db, 'orders'), where('riderId', '==', riderId));

    riderListenerUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) {
                playNotificationSound();
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            }
        });

        const today = new Date(); today.setHours(0, 0, 0, 0);
        let todaysEarnings = 0, deliveriesCount = 0;

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
                if (d >= today) { todaysEarnings += RIDER_EARNING_PER_ORDER; deliveriesCount++; }
            }
        });

        const earnEl       = document.getElementById('rider-earnings');
        const countEl      = document.getElementById('rider-deliveries');
        const todayCountEl = document.getElementById('rider-today-count');
        if (earnEl)       earnEl.textContent      = `₹${todaysEarnings}`;
        if (countEl)      countEl.textContent      = `${deliveriesCount} deliveries`;
        if (todayCountEl) todayCountEl.textContent = `${deliveriesCount} today`;

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

const playNotificationSound = () => {
    const audio = document.querySelector('#notif-sound');
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
};

document.addEventListener('DOMContentLoaded', initRider);