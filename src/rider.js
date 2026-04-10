import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { ORDER_STATUS } from './constants/orderStatus';
import { onAuthChange, logoutUser } from './api/auth';

/**
 * 🛵 LITTIWALE RIDER PANEL
 * FIX: Removed orderBy('createdAt') from the Firestore query to avoid
 * requiring a composite index. Sorting is done in-memory instead.
 */

let isInitialLoad = true;

const initRider = () => {
    onAuthChange((user) => {
        // JS-level secondary auth guard
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        const role = user.profile?.role;
        if (role !== 'rider' && role !== 'admin' && role !== 'manager') {
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
            // Show a simple alert with profile info for now
            alert(`👤 ${name}\nRole: ${role.toUpperCase()}\n\nTo update your profile, contact the admin.`);
        });

        startRiderListener(user.uid);
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

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) playNotificationSound();
        });

        // Collect all active orders, sort by createdAt desc in memory
        const allOrders = snapshot.docs
            .map(snap => ({ id: snap.id, ...snap.data() }))
            .filter(o => ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(o.status))
            .sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });

        // Split into pending (READY) and current (ASSIGNED)
        const pendingOrders = allOrders.filter(o => o.status === ORDER_STATUS.READY);
        const currentOrders = allOrders.filter(o => o.status === ORDER_STATUS.ASSIGNED);

        renderPendingPickups(pendingOrders);
        renderCurrentDelivery(currentOrders);

        isInitialLoad = false;
    });
};

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
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            status: ORDER_STATUS.ASSIGNED,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error('Pickup failed:', e);
        alert('Could not update order. Try again.');
    }
};

window.markDelivered = async (docId) => {
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            status: ORDER_STATUS.DELIVERED,
            updatedAt: serverTimestamp()
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
