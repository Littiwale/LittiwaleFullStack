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
            const statusColor = {
                'DELIVERED': '#10B981',
                'PLACED': '#3B82F6',
                'CANCELLED': '#ef4444',
                'PREPARING': '#F59E0B',
                'ASSIGNED': '#8B5CF6'
            }[order.status] || '#7a8098';

            return `
                <div style="padding:16px;border-bottom:1px solid var(--card-border);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <div>
                            <p style="font-size:10px;color:var(--text-muted);font-weight:800;letter-spacing:1px;text-transform:uppercase;">${order.orderId || order.docId?.slice(0,8)}</p>
                            <p style="font-size:12px;color:var(--text-muted);margin-top:2px;">${date}</p>
                        </div>
                        <div style="text-align:right;">
                            <p style="font-size:18px;font-weight:900;color:var(--primary);">₹${order.total}</p>
                            <span style="font-size:9px;font-weight:900;color:${statusColor};text-transform:uppercase;letter-spacing:1px;">${order.status?.replace(/_/g,' ')}</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;line-height:1.5;">${items}</p>
                    <button
                        onclick="window.reorderItems(${JSON.stringify(order.items).replace(/"/g, '&quot;')})"
                        style="width:100%;padding:10px;background:transparent;border:1px solid var(--primary);border-radius:10px;color:var(--primary);font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">
                        🔄 Reorder
                    </button>
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
