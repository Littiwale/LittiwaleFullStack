/**
 * 🍳 LITTIWALE KITCHEN PANEL
 * Shows orders assigned to this kitchen. Kitchen can mark: Preparing → Ready.
 * Auth: role must be 'kitchen', 'admin', or 'manager'
 */

import { collection, query, where, onSnapshot, orderBy, Timestamp, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange, logoutUser, getUserRole, isKitchenStaff } from './api/auth';
import { updateKitchenStatus, assignRiderToOrder } from './api/orders';
import { fetchUsersByRole } from './api/users';

let ridersList = [];

// ── Which kitchen is this terminal? ──────────────────────────────────────────
// Set via URL param: kitchen/index.html?id=kitchen_a  OR  kitchen/index.html?id=kitchen_b
// Falls back to user's assigned kitchenId from Firestore profile
let KITCHEN_ID = null;
let KITCHEN_NAME = null;

const getKitchenIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const container = document.getElementById('kitchen-orders-container');
const emptyState = document.getElementById('kitchen-empty-state');
const statPending = document.getElementById('stat-pending');
const statPreparing = document.getElementById('stat-preparing');
const statReady = document.getElementById('stat-ready');
const kitchenNameHeader = document.getElementById('kitchen-name-header');
const logoutBtn = document.getElementById('kitchen-logout-btn');
const liveBadge = document.getElementById('kitchen-live-badge');

let unsubscribeOrders = null;

// Dropdown event listeners
const setupDropdown = () => {
    const avatarTrigger = document.getElementById('kitchen-avatar-trigger');
    const profileDropdown = document.getElementById('kitchen-profile-dropdown');
    
    if (avatarTrigger && profileDropdown) {
        avatarTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!avatarTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('open');
            }
        });
    }
    document.getElementById('kitchen-dd-storefront')?.addEventListener('click', () => { window.location.href = '/'; });
    document.getElementById('kitchen-dd-admin')?.addEventListener('click', () => { window.location.href = '/admin'; });
    document.getElementById('kitchen-dd-rider')?.addEventListener('click', () => { window.location.href = '/rider'; });
    document.getElementById('kitchen-dd-orders')?.addEventListener('click', () => { window.location.href = '/menu?openOrders=1'; });
};
setupDropdown();

// ── Auth ──────────────────────────────────────────────────────────────────────
const showAuthLoader = () => {
    const el = document.createElement('div');
    el.id = 'k-auth-loader';
    el.style.cssText = 'position:fixed;inset:0;background:#080b12;z-index:99999;display:flex;align-items:center;justify-content:center;';
    el.innerHTML = `<div style="text-align:center;color:#9ca3af;">
        <div style="font-size:32px;margin-bottom:12px;">🍳</div>
        <div style="font-size:14px;">Authenticating...</div>
    </div>`;
    document.body.appendChild(el);
};

const hideAuthLoader = () => {
    document.getElementById('k-auth-loader')?.remove();
};

const redirectToLogin = () => {
    window.location.href = '/login';
};

// ── Order Card ────────────────────────────────────────────────────────────────
const statusColor = { pending: '#F5A800', preparing: '#3b82f6', packing: '#8b5cf6', ready: '#10b981' };
const statusLabel = { pending: '⏳ Pending', preparing: '🔥 Preparing', packing: '📦 Packing', ready: '✅ Ready' };

const formatItems = (items = []) =>
    items.map(i => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="font-size:13px;color:#e5e7eb;">${i.name}${i.variant && i.variant !== 'single' ? ` <span style="color:#9ca3af;font-size:11px;">(${i.variant})</span>` : ''}</span>
        <span style="font-size:13px;font-weight:700;color:#F5A800;">×${i.quantity}</span>
    </div>`).join('');

const buildCard = (order, docId) => {
    const ks = order.kitchenStatus || 'pending';
    const color = statusColor[ks] || '#9ca3af';
    const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
    const timeStr = createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.id = `kcard-${docId}`;
    card.style.cssText = `background:#0d1117;border:1px solid ${color}40;border-left:4px solid ${color};border-radius:12px;padding:16px;margin-bottom:14px;`;

    card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
                <div style="font-size:13px;font-weight:800;color:#fff;font-family:'Space Mono',monospace;">${order.orderId || docId.slice(0,10).toUpperCase()}</div>
                <div style="font-size:11px;color:#6b7280;margin-top:2px;">Placed at ${timeStr}</div>
            </div>
            <span style="background:${color}20;color:${color};border:1px solid ${color}40;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;">${statusLabel[ks] || ks.toUpperCase()}</span>
        </div>

        <div style="margin-bottom:14px;">${formatItems(order.items)}</div>

        ${order.customer?.note ? `<div style="background:rgba(245,168,0,0.08);border:1px solid rgba(245,168,0,0.2);border-radius:6px;padding:8px;margin-bottom:12px;font-size:12px;color:#F5A800;">📝 Note: ${order.customer.note}</div>` : ''}

        <div style="display:flex;gap:8px;margin-top:4px;">
            ${ks === 'pending' ? `
                <button data-docid="${docId}" data-action="preparing"
                    style="flex:1;padding:10px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
                    🔥 Start Preparing
                </button>` : ''}
            ${ks === 'preparing' ? `
                <button data-docid="${docId}" data-action="packing"
                    style="flex:1;padding:10px;background:#8b5cf6;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
                    📦 Pack Order
                </button>` : ''}
            ${ks === 'packing' ? `
                <button data-docid="${docId}" data-action="ready"
                    style="flex:1;padding:10px;background:#059669;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
                    ✅ Mark Ready
                </button>` : ''}
            ${ks === 'ready' ? `
                ${order.riderId ? `
                    <div style="flex:1;text-align:center;padding:10px;color:#10b981;font-size:13px;font-weight:700;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;">
                        🛵 Assigned to ${order.riderName} — ${order.riderStatus === 'pending' ? '⏳ Waiting to accept' : '✅ Heading to pickup'}
                    </div>
                ` : `
                    <div style="flex:1;display:flex;gap:10px;">
                        <select id="k-rider-select-${docId}" style="flex:2;padding:8px;background:#1e2130;color:#fff;border:1px solid #374151;border-radius:8px;font-size:13px;outline:none;">
                            <option value="">🛵 Select Rider</option>
                            ${ridersList.map(r => {
                                const isOnline = r.isOnline !== false;
                                const n = r.profile?.name || r.name || 'Rider';
                                return `<option value="${r.id}">${n} ${isOnline ? '🟢' : '🔴'}</option>`;
                            }).join('')}
                        </select>
                        <button data-docid="${docId}" data-action="assign-rider" style="flex:1;padding:8px;background:#F5A800;color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Assign</button>
                    </div>
                `}
            ` : ''}
        </div>
    `;

    // Button handlers
    card.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (btn.dataset.action === 'assign-rider') {
                const select = document.getElementById(`k-rider-select-${btn.dataset.docid}`);
                const riderId = select?.value;
                if (!riderId) { alert('Please select a rider first!'); return; }
                const rider = ridersList.find(r => r.id === riderId);
                const rName = rider?.profile?.name || rider?.name || 'Rider';
                
                btn.disabled = true;
                btn.textContent = 'Assigning...';
                try {
                    await assignRiderToOrder(btn.dataset.docid, riderId, rName);
                } catch (e) {
                    console.error(e);
                    btn.disabled = false;
                    btn.textContent = 'Retry';
                    alert('Failed to assign rider');
                }
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Updating...';
            try {
                await updateKitchenStatus(btn.dataset.docid, btn.dataset.action);
            } catch (e) {
                console.error(e);
                btn.disabled = false;
                btn.textContent = 'Retry';
            }
        });
    });

    return card;
};

// ── Realtime listener ─────────────────────────────────────────────────────────
const subscribeOrders = (kitchenId) => {
    if (unsubscribeOrders) unsubscribeOrders();

    // Today's start timestamp
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const q = query(
        collection(db, 'orders'),
        where('kitchenId', '==', kitchenId),
        where('createdAt', '>=', Timestamp.fromDate(todayStart)),
        orderBy('createdAt', 'desc')
    );

    unsubscribeOrders = onSnapshot(q, (snap) => {
        const orders = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        renderOrders(orders);
    }, (err) => {
        console.error('Kitchen listener error:', err);
    });
};

const renderOrders = (orders) => {
    // Update stats
    const pending = orders.filter(o => o.kitchenStatus === 'pending').length;
    const preparing = orders.filter(o => o.kitchenStatus === 'preparing').length;
    const ready = orders.filter(o => o.kitchenStatus === 'ready').length;

    statPending.textContent = pending;
    statPreparing.textContent = preparing;
    statReady.textContent = ready;
    liveBadge.textContent = orders.length > 0 ? `● LIVE` : '';

    // Active orders only (pending + preparing + packing + ready if not picked up)
    const activeOrders = orders.filter(o => 
        ['pending', 'preparing', 'packing', 'ready'].includes(o.kitchenStatus) &&
        !['PICKED_UP', 'DELIVERED'].includes(o.status)
    );

    // Clear and rebuild (except empty state)
    container.innerHTML = '';

    if (activeOrders.length === 0) {
        emptyState.style.display = 'block';
        container.appendChild(emptyState);
    } else {
        emptyState.style.display = 'none';
        activeOrders.forEach(order => {
            container.appendChild(buildCard(order, order.docId));
        });
    }
};

// ── Tabs & Menu Stock Logic ──────────────────────────────────────────────────────
const tabOrders = document.getElementById('tab-orders');
const tabMenu = document.getElementById('tab-menu');
const sectionOrders = document.getElementById('kitchen-orders-section');
const sectionMenu = document.getElementById('kitchen-menu-section');
const statsBar = document.getElementById('kitchen-stats-bar');

const switchTab = (tab) => {
    if (tab === 'orders') {
        if(tabOrders) { tabOrders.style.background = '#F5A800'; tabOrders.style.color = '#000'; tabOrders.style.border = 'none'; }
        if(tabMenu) { tabMenu.style.background = '#1e2130'; tabMenu.style.color = '#e5e7eb'; tabMenu.style.border = '1px solid #374151'; }
        if(sectionOrders) sectionOrders.style.display = 'block';
        if(statsBar) statsBar.style.display = 'flex';
        if(sectionMenu) sectionMenu.style.display = 'none';
    } else {
        if(tabMenu) { tabMenu.style.background = '#F5A800'; tabMenu.style.color = '#000'; tabMenu.style.border = 'none'; }
        if(tabOrders) { tabOrders.style.background = '#1e2130'; tabOrders.style.color = '#e5e7eb'; tabOrders.style.border = '1px solid #374151'; }
        if(sectionMenu) sectionMenu.style.display = 'block';
        if(sectionOrders) sectionOrders.style.display = 'none';
        if(statsBar) statsBar.style.display = 'none';
        loadKitchenMenu();
    }
};

tabOrders?.addEventListener('click', () => switchTab('orders'));
tabMenu?.addEventListener('click', () => switchTab('menu'));

let kitchenMenu = [];

const loadKitchenMenu = async () => {
    const container = document.getElementById('kitchen-menu-container');
    if(!container) return;
    container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:40px;">Loading menu...</div>';
    try {
        const snap = await getDocs(collection(db, 'menu'));
        kitchenMenu = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.name.localeCompare(b.name));
        renderKitchenMenu();
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align:center;color:#ef4444;padding:40px;">Failed to load menu.</div>';
    }
};

const renderKitchenMenu = (filter = '') => {
    const container = document.getElementById('kitchen-menu-container');
    if(!container) return;
    
    // Filter by KITCHEN_ID and search text
    const filtered = kitchenMenu.filter(m => {
        const avail = m.availability || 'cloud_only';
        if (KITCHEN_ID === 'kitchen_outlet' && avail === 'cloud_only') return false;
        if (KITCHEN_ID === 'kitchen_cloud' && avail === 'outlet_only') return false;
        
        return m.name.toLowerCase().includes(filter.toLowerCase());
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#9ca3af;padding:40px;">No items found.</div>';
        return;
    }

    // Group by category
    const grouped = {};
    filtered.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    let html = '';
    
    Object.keys(grouped).sort().forEach(cat => {
        const items = grouped[cat];
        html += `
            <div style="margin-top:24px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #252830;padding-bottom:8px;">
                <div style="font-size:16px;font-weight:800;color:#F5A800;">${cat.toUpperCase()}</div>
                <div style="display:flex;gap:8px;">
                    <button class="k-cat-stock-btn" data-cat="${cat}" data-action="in" style="background:#10b981;color:#000;border:none;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">IN STOCK ALL</button>
                    <button class="k-cat-stock-btn" data-cat="${cat}" data-action="out" style="background:#ef4444;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">OUT ALL</button>
                </div>
            </div>
        `;
        
        html += items.map(item => {
            const inStock = item.inStock !== false;
            const color = inStock ? '#10b981' : '#ef4444';
            return `
                <div style="background:#0d1117;border:1px solid #252830;border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="${item.image || '/images/logo.png'}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" onerror="this.src='/images/logo.png'">
                        <div>
                            <div style="font-size:14px;font-weight:700;color:#fff;">${item.name}</div>
                            <div style="font-size:12px;color:#9ca3af;">₹${item.price}</div>
                        </div>
                    </div>
                    <button class="k-stock-btn" data-id="${item.id}" data-stock="${inStock}" style="padding:8px 16px;background:${inStock ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};color:${color};border:1px solid ${color};border-radius:8px;font-weight:700;cursor:pointer;min-width:100px;">
                        ${inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                </div>
            `;
        }).join('');
    });

    container.innerHTML = html;

    container.querySelectorAll('.k-stock-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-id');
            const currentStock = btn.getAttribute('data-stock') === 'true';
            btn.textContent = 'Updating...';
            btn.style.opacity = '0.5';
            btn.disabled = true;
            try {
                await updateDoc(doc(db, 'menu', id), { inStock: !currentStock });
                const item = kitchenMenu.find(m => m.id === id);
                if (item) item.inStock = !currentStock;
                renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
            } catch (err) {
                console.error(err);
                alert('Failed to update stock. Permission denied or network error.');
                renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
            }
        });
    });

    container.querySelectorAll('.k-cat-stock-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const cat = btn.getAttribute('data-cat');
            const action = btn.getAttribute('data-action');
            const targetStock = action === 'in';
            
            if (!confirm(`Mark ALL items in ${cat} as ${targetStock ? 'IN STOCK' : 'OUT OF STOCK'}?`)) return;
            
            btn.textContent = '...';
            btn.disabled = true;
            
            try {
                const catItems = filtered.filter(m => (m.category || 'Uncategorized') === cat);
                const batch = [];
                for (const item of catItems) {
                    if ((item.inStock !== false) !== targetStock) {
                        batch.push(updateDoc(doc(db, 'menu', item.id), { inStock: targetStock }));
                        item.inStock = targetStock;
                    }
                }
                if (batch.length > 0) {
                    await Promise.all(batch);
                }
                renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
            } catch (err) {
                console.error(err);
                alert('Failed to update category stock.');
                renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
            }
        });
    });
};

document.getElementById('kitchen-menu-search')?.addEventListener('input', (e) => {
    renderKitchenMenu(e.target.value);
});

// ── Init ──────────────────────────────────────────────────────────────────────
const init = () => {
    showAuthLoader();

    logoutBtn?.addEventListener('click', async () => {
        if (unsubscribeOrders) unsubscribeOrders();
        await logoutUser();
        redirectToLogin();
    });

    onAuthChange(async (user) => {
        if (!user) { hideAuthLoader(); redirectToLogin(); return; }

        const role = getUserRole(user);
        if (!isKitchenStaff(user)) {
            hideAuthLoader();
            document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#080b12;color:#e5e7eb;font-size:16px;">⛔ Access denied. Kitchen staff only.</div>`;
            return;
        }

        // Fetch riders list for rider assignment dropdown
        try {
            const [riders, admins] = await Promise.all([
                fetchUsersByRole('rider'),
                fetchUsersByRole('admin')
            ]);
            const adminAsRiders = (admins || []).map(a => ({
                ...a,
                _isAdmin: true,
                profile: { ...(a.profile || {}), name: (a.profile?.name || a.name || 'Admin') + ' 👑' }
            }));
            ridersList = [...(riders || []), ...adminAsRiders];
        } catch (err) {
            console.error('Error fetching riders list:', err);
        }

        // Determine which kitchen this terminal serves
        // URL param: /kitchen?id=kitchen_cloud  OR  /kitchen?id=kitchen_outlet
        KITCHEN_ID = getKitchenIdFromUrl()
            || user?.profile?.kitchenId
            || 'kitchen_cloud'; // fallback

        const kitchenLabels = {
            'kitchen_cloud':  '☁️ Cloud Kitchen',
            'kitchen_outlet': '🏠 Outlet Kitchen',
            'kitchen_a':      'Kitchen A',
            'kitchen_b':      'Kitchen B',
        };
        KITCHEN_NAME = kitchenLabels[KITCHEN_ID] || KITCHEN_ID;

        if (kitchenNameHeader) kitchenNameHeader.textContent = KITCHEN_NAME.toUpperCase();

        const ddName = document.getElementById('kitchen-dd-name');
        const ddEmail = document.getElementById('kitchen-dd-email');
        const avatarTrigger = document.getElementById('kitchen-avatar-trigger');
        const name = user.profile?.name || 'Kitchen';
        if (ddName) ddName.textContent = name;
        if (ddEmail) ddEmail.textContent = user.email;
        if (avatarTrigger) avatarTrigger.textContent = name.charAt(0).toUpperCase();

        const ddAdmin = document.getElementById('kitchen-dd-admin');
        const ddRider = document.getElementById('kitchen-dd-rider');
        if (role === 'admin' || role === 'manager') {
            if (ddAdmin) { ddAdmin.style.display = 'block'; ddAdmin.classList.remove('hidden'); }
            if (ddRider) { ddRider.style.display = 'block'; ddRider.classList.remove('hidden'); }
        }

        const locToggle = document.getElementById('kitchen-location-toggle');
        const btnCloud = document.getElementById('toggle-cloud');
        const btnOutlet = document.getElementById('toggle-outlet');

        if (role === 'admin' || role === 'manager') {
            if (locToggle) locToggle.style.display = 'flex';
            
            const updateToggleUI = () => {
                if (KITCHEN_ID === 'kitchen_cloud') {
                    btnCloud.style.background = '#F5A800'; btnCloud.style.color = '#000';
                    btnOutlet.style.background = 'transparent'; btnOutlet.style.color = '#9ca3af';
                } else {
                    btnOutlet.style.background = '#F5A800'; btnOutlet.style.color = '#000';
                    btnCloud.style.background = 'transparent'; btnCloud.style.color = '#9ca3af';
                }
                if (kitchenNameHeader) kitchenNameHeader.textContent = (kitchenLabels[KITCHEN_ID] || KITCHEN_ID).toUpperCase();
            };
            
            btnCloud?.addEventListener('click', () => {
                if (KITCHEN_ID === 'kitchen_cloud') return;
                KITCHEN_ID = 'kitchen_cloud';
                updateToggleUI();
                subscribeOrders(KITCHEN_ID);
                if (document.getElementById('kitchen-menu-section')?.style.display === 'block') {
                    renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
                }
            });
            
            btnOutlet?.addEventListener('click', () => {
                if (KITCHEN_ID === 'kitchen_outlet') return;
                KITCHEN_ID = 'kitchen_outlet';
                updateToggleUI();
                subscribeOrders(KITCHEN_ID);
                if (document.getElementById('kitchen-menu-section')?.style.display === 'block') {
                    renderKitchenMenu(document.getElementById('kitchen-menu-search')?.value || '');
                }
            });
            updateToggleUI();
        }

        hideAuthLoader();
        subscribeOrders(KITCHEN_ID);
    });
};

init();
