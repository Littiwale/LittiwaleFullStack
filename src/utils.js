import { fetchOrdersByUser } from './api/orders';

/**
 * 🕐 DELIVERY ESTIMATE ENGINE (Item 7)
 */
export const updateDeliveryEstimate = async () => {
    const el = document.querySelector('#delivery-estimate');
    if (!el) return;

    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');

        const ridersSnap = await getDocs(
            query(collection(db, 'users'), where('role', '==', 'rider'), where('isOnline', '==', true))
        );
        const onlineCount = ridersSnap.size;

        let low = onlineCount > 0 ? 25 : 35;
        let high = onlineCount > 0 ? 35 : 50;

        const hour = new Date().getHours();
        const isPeak = (hour >= 12 && hour < 14) || (hour >= 19 && hour < 21);
        if (isPeak) { low += 10; high += 10; }

        el.textContent = `🕐 Estimated delivery: ${low}–${high} min`;
    } catch {
        el.textContent = '🕐 Estimated delivery: 30–45 min';
    }
};

/**
 * 📦 MY ORDERS LOADER (Item 5)
 */
export const loadMyOrders = async () => {
    const list = document.querySelector('#my-orders-list');
    if (!list) return;

    const { auth } = await import('./firebase/config');
    const user = auth.currentUser;
    if (!user) {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">Please log in to see your orders.</p>';
        return;
    }

    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">Loading...</p>';

    try {
        const orders = await fetchOrdersByUser(user.uid);
        if (orders.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px 0;">No orders yet! Start ordering 🍽️</p>';
            return;
        }

        list.innerHTML = orders.map(order => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Recently';
            const items = order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';

            const statusConfig = {
                'DELIVERED':  { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  emoji: '✅', label: 'Delivered' },
                'PLACED':     { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', emoji: '📋', label: 'Order Placed' },
                'ACCEPTED':   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', emoji: '✅', label: 'Accepted' },
                'PREPARING':  { color: '#F4B400', bg: 'rgba(244,180,0,0.12)',  emoji: '👨‍🍳', label: 'Preparing' },
                'READY':      { color: '#F4B400', bg: 'rgba(244,180,0,0.12)',  emoji: '🎉', label: 'Ready' },
                'ASSIGNED':   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', emoji: '🛵', label: 'Out for Delivery' },
                'CANCELLED':  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', emoji: '❌', label: 'Cancelled' },
                'REJECTED':   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', emoji: '❌', label: 'Rejected' },
            };
            const sc = statusConfig[order.status] || { color: '#9CA3AF', bg: 'rgba(107,114,128,0.1)', emoji: '📦', label: order.status?.replace(/_/g,' ') };

            const canTrack = order.orderId && order.trackingToken && !['CANCELLED','REJECTED','DELIVERED'].includes(order.status);
            const trackUrl = `/customer/track.html?id=${order.orderId}&token=${order.trackingToken}`;

            return `
                <div style="margin:10px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
                    <!-- Header row -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px 10px;">
                        <div>
                            <p style="font-size:9px;color:#9CA3AF;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px;">Order #${order.orderId || order.docId?.slice(0,8)}</p>
                            <p style="font-size:11px;color:#6B7280;">${date}</p>
                        </div>
                        <div style="text-align:right;">
                            <p style="font-size:20px;font-weight:900;color:#F5A800;line-height:1;">₹${order.total}</p>
                            <span style="display:inline-block;margin-top:4px;font-size:9px;font-weight:900;color:${sc.color};background:${sc.bg};padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${sc.emoji} ${sc.label}</span>
                        </div>
                    </div>
                    <!-- Items -->
                    <div style="padding:0 16px 12px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <p style="font-size:12px;color:#9CA3AF;line-height:1.6;">${items}</p>
                    </div>
                    <!-- Action buttons -->
                    <div style="display:flex;gap:8px;padding:12px 16px;">
                        ${canTrack ? `
                        <a href="${trackUrl}"
                            style="flex:1;display:block;padding:10px 0;background:rgba(245,168,0,0.12);border:1px solid rgba(245,168,0,0.4);border-radius:10px;color:#F5A800;font-size:11px;font-weight:900;letter-spacing:1px;cursor:pointer;text-transform:uppercase;text-align:center;text-decoration:none;">
                            🛵 Track Order
                        </a>` : ''}
                        <button
                            onclick="window.reorderItems(${JSON.stringify(order.items).replace(/"/g, '&quot;')})"
                            style="flex:1;padding:10px 0;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#D1D5DB;font-size:11px;font-weight:900;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">
                            🔄 Reorder
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('My orders failed:', err);
        list.innerHTML = '<p style="text-align:center;color:var(--error);padding:40px 0;">Failed to load orders. Try again.</p>';
    }
};

/**
 * ── TOAST HELPER ──
 */
export const showToast = (msg) => {
    let toast = document.querySelector('#lw-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lw-toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--primary);color:var(--button-on-primary);padding:12px 24px;border-radius:40px;font-weight:800;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.style.opacity = '0', 3000);
};