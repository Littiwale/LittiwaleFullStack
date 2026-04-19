import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { ORDER_STATUS } from './constants/orderStatus';
import { onAuthChange, logoutUser, getUserRole, isRider, isAdminOrManager } from './api/auth';
import { updateOrderDetails } from './api/orders';
import { RIDER_EARNING_PER_ORDER } from './constants/config';

/**
 * 🛵 LITTIWALE RIDER PANEL
 * FIX: Removed orderBy('createdAt') from the Firestore query to avoid
 * requiring a composite index. Sorting is done in-memory instead.
 */

let isInitialLoad = true;
let riderListenerUnsubscribe = null;

const initRider = () => {
    // Show a loading overlay immediately to prevent flashing the rider UI
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'rider-auth-loader';
    loadingOverlay.style.cssText = [
        'position:fixed;inset:0;background:#0d0f14;z-index:99999',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px'
    ].join(';');
    loadingOverlay.innerHTML = `
        <div style="width:40px;height:40px;border:3px solid #252830;border-top-color:#F5A800;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <p style="color:#F5A800;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">Verifying Session…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(loadingOverlay);

    onAuthChange((user, isLoading) => {
        // Auth SDK still initializing — do nothing
        if (isLoading) return;

        // Remove overlay once auth state is confirmed
        loadingOverlay.remove();

        // JS-level secondary auth guard
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        const role = getUserRole(user);
        if (!['rider', 'admin', 'manager'].includes(role)) {
            window.location.href = '/customer/index.html';
            return;
        }

        // Populate dropdown header
        const name = user.profile?.name || 'Rider';
        const initial = name.charAt(0).toUpperCase();
        const trigger = document.getElementById('rider-avatar-trigger');
        const ddName = document.getElementById('rider-dd-name');
        const ddRole = document.getElementById('rider-dd-role');
        if (trigger) trigger.textContent = initial;
        if (ddName) ddName.textContent = name;
        if (ddRole) ddRole.textContent = role.toUpperCase();

        // Inject Admin Panel link for admins visiting this page
        if (role === 'admin' || role === 'manager') {
            const dropdown = document.getElementById('rider-profile-dropdown');
            const storefrontBtn = document.getElementById('rider-dd-storefront');
            if (dropdown && storefrontBtn) {
                const adminBtn = document.createElement('button');
                adminBtn.className = 'lw-dropdown-item';
                adminBtn.id = 'rider-dd-admin';
                adminBtn.textContent = '🏠 Admin Panel';
                dropdown.insertBefore(adminBtn, storefrontBtn);
            }
        }

        // Wire dropdown toggle
        const dropdown = document.getElementById('rider-profile-dropdown');
        trigger?.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
        });
        document.addEventListener('click', function(e) {
            if (!trigger?.contains(e.target) && !dropdown?.contains(e.target)) {
                dropdown?.classList.remove('open');
            }
        });

        // Nav buttons
        document.getElementById('rider-dd-admin')?.addEventListener('click', function() {
            window.location.href = '/admin/index.html';
        });
        document.getElementById('rider-dd-storefront')?.addEventListener('click', function() {
            window.location.href = '/customer/index.html';
        });
        document.getElementById('rider-dd-logout')?.addEventListener('click', async function() {
            await logoutUser();
            window.location.href = '/login.html';
        });

        // Bottom nav profile button
        document.getElementById('bnav-profile')?.addEventListener('click', function() {
            alert(`👤 ${name}\nRole: ${role.toUpperCase()}\n\nTo update your profile, contact the admin.`);
        });

        startRiderListener(user.uid);
        initRiderToggle(user.uid);
    });
};

const initRiderToggle = async (riderId) => {
    const toggle = document.getElementById('rider-status-toggle');
    const text = document.getElementById('rider-status-text');
    const knob = document.getElementById('rider-toggle-knob');
    const slider = document.getElementById('rider-toggle-slider');
    if (!toggle) return;

    try {
        const userDoc = await getDoc(doc(db, 'users', riderId));
        if (userDoc.exists()) {
            const isOnline = userDoc.data().isOnline || false;
            toggle.checked = isOnline;
            text.textContent = isOnline ? 'Online' : 'Offline';
            text.style.color = isOnline ? '#10B981' : '#7a8098';
            slider.style.backgroundColor = isOnline ? '#10B981' : '#ef4444';
            knob.style.transform = isOnline ? 'translateX(24px)' : 'translateX(0)';
        }
    } catch(e) {}

    toggle.addEventListener('change', async (e) => {
        const isOnline = e.target.checked;
        try {
            const updateData = { 
                isOnline,
                lastOnlineStatusChangeAt: new Date()
            };
            if (isOnline) {
                updateData.lastOnlineAt = new Date();
            } else {
                updateData.lastOfflineAt = new Date();
            }
            await updateDoc(doc(db, 'users', riderId), updateData);
            text.textContent = isOnline ? 'Online' : 'Offline';
            text.style.color = isOnline ? '#10B981' : '#7a8098';
            slider.style.backgroundColor = isOnline ? '#10B981' : '#ef4444';
            knob.style.transform = isOnline ? 'translateX(24px)' : 'translateX(0)';
        } catch(err) {
            console.error('Failed to toggle status', err);
            e.target.checked = !isOnline; // revert
        }
    });
};

/**
 * Real-time order listener
 * FIX: No orderBy() in Firestore query → avoids composite index requirement.
 * Sorting is done client-side after fetching.
 */
const startRiderListener = (riderId) => {
    const ordersRef = collection(db, 'orders');
    // Simple single-field query — no composite index needed
    const q = query(ordersRef, where('riderId', '==', riderId));

    riderListenerUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) playNotificationSound();
        });

        // Collect all orders and separate today's delivered for earnings
        const today = new Date();
        today.setHours(0,0,0,0);
        let todaysEarnings = 0;
        let deliveriesCount = 0;

        const allOrders = snapshot.docs
            .map(snap => ({ id: snap.id, ...snap.data() }))
            .sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });

        // Filter active orders
        const activeOrders = allOrders.filter(o => ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(o.status));

        // Calculate Earnings
        allOrders.forEach(o => {
            if (o.status === ORDER_STATUS.DELIVERED && o.updatedAt) {
                const updatedDate = o.updatedAt.toDate ? o.updatedAt.toDate() : new Date(o.updatedAt);
                if (updatedDate >= today) {
                    todaysEarnings += RIDER_EARNING_PER_ORDER;
                    deliveriesCount++;
                }
            }
        });

        const earnEl = document.getElementById('rider-earnings');
        const countEl = document.getElementById('rider-deliveries');
        if (earnEl) earnEl.textContent = `₹${todaysEarnings}`;
        if (countEl) countEl.textContent = `${deliveriesCount} deliveries`;

        // Split into pending (READY) and current (ASSIGNED)
        const pendingOrders = activeOrders.filter(o => o.status === ORDER_STATUS.READY);
        const currentOrders = activeOrders.filter(o => o.status === ORDER_STATUS.ASSIGNED);

        renderPendingPickups(pendingOrders);
        renderCurrentDelivery(currentOrders);

        isInitialLoad = false;
    });
};

window.addEventListener('beforeunload', () => {
    if (typeof riderListenerUnsubscribe === 'function') {
        riderListenerUnsubscribe();
    }
});

/**
 * Render pending pickups section
 */
const renderPendingPickups = (orders) => {
    const container = document.getElementById('pending-pickups-list');
    const countEl = document.getElementById('pending-count');
    if (!container) return;

    if (countEl) countEl.textContent = orders.length;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="rider-empty">
                <div class="empty-emoji">🎉</div>
                <p>No new pickups yet</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => createPendingCard(order)).join('');
};

const createPendingCard = (order) => {
    const time = order.createdAt?.toDate
        ? new Date(order.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';
    const items = order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';
    const cod = order.paymentMethod === 'COD';

    return `
        <div class="rider-card">
            <div class="order-meta">
                <div>
                    <div class="order-id">${order.orderId || order.id.slice(0, 8)}</div>
                    <div class="order-customer-name">${order.customer?.name || 'Customer'}</div>
                </div>
                <div style="text-align:right;">
                    <div class="order-total">₹${order.total}</div>
                    <div class="order-time">${time}</div>
                </div>
            </div>

            <div class="order-info-row">
                <div>
                    <div class="order-info-label">Delivery Address</div>
                    <div class="order-info-value" style="font-size:12px;">${order.customer?.address || '—'}</div>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.address || '')}"
                   target="_blank" class="order-action-icon icon-map">📍</a>
            </div>

            <div class="items-summary">
                <strong style="color:#fff;font-size:11px;">ITEMS:</strong> ${items}
            </div>

            <span class="cod-tag ${cod ? 'collect' : 'paid'}">
                ${cod ? `💵 Collect ₹${order.total}` : '✅ Paid Online'}
            </span>

            <button class="btn-pickup" onclick="window.pickupOrder('${order.id}')">
                PICK UP ORDER 🛵
            </button>
        </div>
    `;
};

/**
 * Render current delivery section
 */
const renderCurrentDelivery = (orders) => {
    const container = document.getElementById('current-delivery-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="rider-empty">
                <div class="empty-emoji">🛵</div>
                <p>No active delivery</p>
            </div>
        `;
        return;
    }

    // Show only the most recent assigned order
    const order = orders[0];
    const items = order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';
    const cod = order.paymentMethod === 'COD';

    container.innerHTML = `
        <div class="rider-card current-delivery" style="position:relative;overflow:hidden;">
            <div class="delivery-glow"></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
                <span style="width:8px;height:8px;background:#10B981;border-radius:50%;display:inline-block;animation:pulse 1.5s infinite;"></span>
                <span style="font-size:10px;font-weight:800;color:#10B981;letter-spacing:2px;text-transform:uppercase;">In Transit</span>
            </div>

            <div class="order-meta">
                <div>
                    <div class="order-id">${order.orderId || order.id.slice(0, 8)}</div>
                    <div class="order-customer-name">${order.customer?.name || 'Customer'}</div>
                </div>
                <div class="order-total">₹${order.total}</div>
            </div>

            <div class="order-info-row">
                <div>
                    <div class="order-info-label">Phone</div>
                    <div class="order-info-value">${order.customer?.phone || '—'}</div>
                </div>
                <a href="tel:${order.customer?.phone}" class="order-action-icon icon-call">📞</a>
            </div>

            <div class="order-info-row">
                <div>
                    <div class="order-info-label">Delivery Address</div>
                    <div class="order-info-value" style="font-size:12px;">${order.customer?.address || '—'}</div>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.address || '')}"
                   target="_blank" class="order-action-icon icon-map">📍</a>
            </div>

            <div class="items-summary">
                <strong style="color:#fff;font-size:11px;">ITEMS:</strong> ${items}
            </div>

            <span class="cod-tag ${cod ? 'collect' : 'paid'}">
                ${cod ? `💵 Collect ₹${order.total}` : '✅ Paid Online'}
            </span>

            <button class="btn-delivered" onclick="window.markDelivered('${order.id}')">
                MARK AS DELIVERED ✅
            </button>
        </div>
    `;
};

/**
 * Global status update functions
 */
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
        await updateOrderDetails(docId, {
            status: ORDER_STATUS.DELIVERED,
            paymentStatus: 'paid'
        });
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
