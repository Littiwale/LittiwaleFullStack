import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange, logoutUser } from './api/auth';
import { fetchAllUsers, fetchUsersByRole, updateUserRole } from './api/users';
import { assignRiderToOrder } from './api/orders';
import { fetchAnalyticsData } from './api/analytics';
import { ORDER_STATUS } from './constants/orderStatus';
import { fetchAllCoupons, createCoupon, deleteCoupon } from './api/coupons';
import { fetchAllAnnouncements, createAnnouncement, toggleAnnouncementActive, deleteAnnouncement } from './api/announcements';

/**
 * 👑 LITTIWALE ADMIN PANEL CORE (PREMIUM REDESIGN)
 */

// View Elements
const viewDashboard = document.querySelector('#view-dashboard');
const viewOrders = document.querySelector('#view-orders');
const viewCustomers = document.querySelector('#view-customers');
const viewRiders = document.querySelector('#view-riders');
const viewAnalytics = document.querySelector('#view-analytics');

// Stats Elements
const kpiRevenue = document.querySelector('#kpi-revenue');
const kpiActive = document.querySelector('#kpi-active');
const kpiCompleted = document.querySelector('#kpi-completed');
const kpiCancelled = document.querySelector('#kpi-cancelled');
const orderBadge = document.querySelector('#order-badge');
const notifCountBadge = document.querySelector('#notif-count');
const newOrderToast = document.querySelector('#new-order-toast');

// Lists
const ordersContainer = document.querySelector('#orders-list-container');
const customersTableBody = document.querySelector('#customers-table-body');
const ridersContainer = document.querySelector('#riders-list-container');

// State
let isInitialLoad = true;
let currentUser = null;
let ridersList = [];
let activeOrders = [];
let completedOrders = [];
let currentFilter = 'ALL';
let currentView = 'dashboard';

/**
 * 🚀 Initialization
 */
const initAdmin = () => {
    onAuthChange(async (user) => {
        // No session → login
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        const role = user.profile?.role;

        // Rider → rider panel
        if (role === 'rider') {
            window.location.href = '/rider/index.html';
            return;
        }

        // Customer or unknown → storefront
        if (role !== 'admin' && role !== 'manager') {
            window.location.href = '/customer/index.html';
            return;
        }

        // Admin / Manager → ALLOW
        currentUser = user;
        updateAdminProfileUI();
        setupNavigation();
        setupOrderFiltering();

        Promise.all([
            fetchUsersByRole('rider'),
            loadCustomers(),
            loadDashboardAnalytics()
        ]).then(([riders]) => {
            ridersList = riders;
            renderRiders(riders);
        });

        startOrderListener();
        setupLogout();
        setupCouponAdmin();
        setupAnnouncementAdmin();
    });
};

const updateAdminProfileUI = () => {
    const name = currentUser.profile?.name || 'Admin';
    const email = currentUser.email || '';
    const initial = name.charAt(0).toUpperCase();
    
    document.querySelector('#admin-name-display').textContent = name;
    document.querySelector('#admin-avatar-initial').textContent = initial;

    // Populate dropdown header
    const trigger = document.querySelector('#admin-avatar-trigger');
    if (trigger) trigger.textContent = initial;
    const ddName = document.querySelector('#admin-dd-name');
    const ddEmail = document.querySelector('#admin-dd-email');
    if (ddName) ddName.textContent = name;
    if (ddEmail) ddEmail.textContent = email;

    setupProfileDropdown('admin-avatar-trigger', 'admin-profile-dropdown', 'admin-dd-logout');
};

/**
 * Shared helper — mount toggle + outside-click for any dropdown
 */
const setupProfileDropdown = (triggerId, dropdownId, logoutId) => {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);
    if (!trigger || !dropdown) return;

    // Toggle open/close on avatar click
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        document.querySelectorAll('.lw-dropdown.open').forEach(d => d.classList.remove('open'));
        if (!isOpen) dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Navigation items — plain click, no preventDefault so navigation is never blocked
    document.getElementById('admin-dd-storefront')?.addEventListener('click', function() {
        window.location.href = '/customer/index.html';
    });
    document.getElementById('admin-dd-rider')?.addEventListener('click', function() {
        window.location.href = '/rider/index.html';
    });

    // Logout
    document.getElementById(logoutId)?.addEventListener('click', async function() {
        if (confirm('Logout from Admin Session?')) {
            await logoutUser();
            window.location.href = '/login.html';
        }
    });
};

/**
 * 🗺️ Navigation Logic
 */
const setupNavigation = () => {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const pageTitle = document.querySelector('#page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            switchView(view);
            
            navItems.forEach(i => i.classList.toggle('active', i === item));
            pageTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
        });
    });
};

const switchView = (viewName) => {
    currentView = viewName;
    document.querySelectorAll('.content-view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${viewName}`);
    });

    if (viewName === 'analytics') loadDashboardAnalytics();
    if (viewName === 'customers') loadCustomers();
    if (viewName === 'coupons') loadCoupons();
    if (viewName === 'announcements') loadAnnouncements();
};

const setupOrderFiltering = () => {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentFilter = tab.getAttribute('data-filter');
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            renderOrders();
        });
    });
};

/**
 * 📦 Order Lifecycle & Real-time Listeners
 */
const startOrderListener = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        activeOrders = [];
        completedOrders = [];

        let newDetected = false;
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) newDetected = true;
        });

        snapshot.docs.forEach(doc => {
            const data = doc.id ? { id: doc.id, ...doc.data() } : doc.data();
            const status = data.status;
            
            // Stats logic (Today's metrics)
            const orderDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            const isToday = orderDate >= today;

            if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(status)) {
                if (isToday) completedOrders.push(data);
            } else {
                activeOrders.push(data);
            }
        });

        if (newDetected) triggerNewOrderAlert();
        
        updateKPIs();
        renderOrders();
        isInitialLoad = false;
    });
};

const updateKPIs = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Revenue today
    const revenue = activeOrders.concat(completedOrders)
        .filter(o => o.status !== ORDER_STATUS.REJECTED && o.status !== ORDER_STATUS.CANCELLED)
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const pendingCount = activeOrders.filter(o => o.status === ORDER_STATUS.PLACED).length;

    if (kpiRevenue) kpiRevenue.textContent = `₹${revenue.toLocaleString()}`;
    if (kpiActive) kpiActive.textContent = activeOrders.length;
    if (kpiCompleted) kpiCompleted.textContent = completedOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length;
    if (kpiCancelled) kpiCancelled.textContent = completedOrders.filter(o => [ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(o.status)).length;

    // Badges
    if (pendingCount > 0) {
        orderBadge?.classList.remove('hidden');
        orderBadge.textContent = pendingCount;
        notifCountBadge?.classList.remove('hidden');
        notifCountBadge.textContent = pendingCount;
    } else {
        orderBadge?.classList.add('hidden');
        notifCountBadge?.classList.add('hidden');
    }
};

const renderOrders = () => {
    if (!ordersContainer) return;

    let filtered = activeOrders.concat(completedOrders);

    if (currentFilter !== 'ALL') {
        if (currentFilter === 'COMPLETED') {
            filtered = filtered.filter(o => o.status === ORDER_STATUS.DELIVERED);
        } else {
            filtered = filtered.filter(o => o.status === currentFilter);
        }
    }

    ordersContainer.innerHTML = filtered.length > 0 
        ? filtered.map(order => createOrderCard(order)).join('')
        : `<div class="col-span-full py-20 text-center text-gray-600">No orders found for this category.</div>`;
};

const createOrderCard = (order) => {
    const time = order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
    
    // Status color mapping
    const statusColors = {
        [ORDER_STATUS.PLACED]: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        [ORDER_STATUS.ACCEPTED]: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        [ORDER_STATUS.PREPARING]: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        [ORDER_STATUS.READY]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        [ORDER_STATUS.ASSIGNED]: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        [ORDER_STATUS.DELIVERED]: 'bg-green-500/10 text-green-400 border-green-500/30',
        [ORDER_STATUS.CANCELLED]: 'bg-red-500/10 text-red-500 border-red-500/30',
        [ORDER_STATUS.REJECTED]: 'bg-red-500/10 text-red-500 border-red-500/30'
    };

    const colorClass = statusColors[order.status] || 'bg-gray-800 text-gray-400 border-gray-700';

    return `
        <div class="admin-order-card">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-black tracking-widest text-gray-500 uppercase">${order.orderId || order.id.slice(0,8)}</span>
                    <h3 class="font-bold text-lg text-white">${order.customer.name}</h3>
                </div>
                <div class="text-right">
                    <span class="text-xl font-black text-accent">₹${order.total}</span>
                    <p class="text-[10px] text-gray-500 font-bold uppercase mt-1">${time}</p>
                </div>
            </div>

            <div class="flex items-center gap-2 mb-4">
                <span class="order-badge-pill border ${colorClass}">${order.status.replace(/_/g, ' ')}</span>
                <span class="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-gray-400 border border-gray-700">${order.paymentMethod}</span>
            </div>

            <div class="bg-black/20 p-4 rounded-2xl mb-4 text-xs">
                ${order.items.map(i => `<div class="flex justify-between py-1 border-b border-gray-800/30 last:border-0"><span class="text-gray-300 font-medium">${i.name} × ${i.quantity}</span> <span class="text-gray-500">${i.variant}</span></div>`).join('')}
                <div class="pt-3 mt-3 border-t border-gray-800/50 text-gray-400 leading-relaxed text-[11px]">
                    📍 ${order.customer.address}
                </div>
            </div>

            <!-- ACTIONS -->
            <div class="action-btn-group">
                ${renderActionButtons(order)}
            </div>
            
            ${[ORDER_STATUS.READY, ORDER_STATUS.ASSIGNED].includes(order.status) ? `
                <div class="mt-4 pt-4 border-t border-gray-800">
                    <p class="text-[10px] font-bold text-gray-500 uppercase mb-2">Assignment</p>
                    <select onchange="handleRiderAssignment('${order.id}', this.value)" class="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-xs outline-none">
                        <option value="">-- Choose Rider --</option>
                        ${ridersList.map(r => `<option value="${r.uid}" ${order.riderId === r.uid ? 'selected' : ''}>${r.name}</option>`).join('')}
                    </select>
                </div>
            ` : ''}
        </div>
    `;
};

const renderActionButtons = (order) => {
    switch(order.status) {
        case ORDER_STATUS.PLACED:
            return `
                <button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.ACCEPTED}')" class="action-btn-sm bg-indigo-600 text-white flex-1">Accept</button>
                <button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.REJECTED}')" class="action-btn-sm bg-red-900/40 text-red-500 border border-red-500/20">Reject</button>
            `;
        case ORDER_STATUS.ACCEPTED:
            return `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.PREPARING}')" class="action-btn-sm bg-orange-600 text-white w-full">Start Preparing</button>`;
        case ORDER_STATUS.PREPARING:
            return `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.READY}')" class="action-btn-sm bg-yellow-500 text-black w-full">Mark Ready</button>`;
        case ORDER_STATUS.READY:
            return `<p class="text-[10px] text-gray-500 font-bold uppercase italic">Awaiting Rider Pickup</p>`;
        case ORDER_STATUS.ASSIGNED:
             return `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.DELIVERED}')" class="action-btn-sm bg-green-600 text-white w-full">Mark Delivered</button>`;
        default:
            return `<span class="text-[10px] text-gray-600 font-bold uppercase">Archive: ${order.status}</span>`;
    }
};

/**
 * 🛠️ Global Actions (Exposed to Window)
 */
window.updateOrderStatus = async (docId, newStatus) => {
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    } catch (e) { console.error('Status Update Failed:', e); }
};

window.handleRiderAssignment = async (orderId, riderId) => {
    if (!riderId) return;
    const rider = ridersList.find(r => r.uid === riderId);
    if (confirm(`Assign tracking to ${rider.name}?`)) {
        await assignRiderToOrder(orderId, riderId, rider.name);
    }
};

/**
 * 👥 People & Directory
 */
const loadCustomers = async () => {
    const users = await fetchAllUsers();
    if (customersTableBody) {
        customersTableBody.innerHTML = users.map(u => `
            <tr class="hover:bg-white/5 transition">
                <td class="p-4">
                    <p class="font-bold text-white">${u.name}</p>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">${u.email}</p>
                </td>
                <td class="p-4 text-gray-300 font-mono">${u.phone || 'N/A'}</td>
                <td class="p-4">
                    <span class="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-black uppercase text-accent border border-accent/20">${u.role}</span>
                </td>
                <td class="p-4">
                    <select onchange="changeRole('${u.id}', this.value)" class="bg-gray-800 rounded-lg text-xs px-2 py-1 outline-none border border-gray-700">
                        <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
                        <option value="rider" ${u.role === 'rider' ? 'selected' : ''}>Rider</option>
                        <option value="manager" ${u.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }
};

window.changeRole = async (uid, role) => {
    if (confirm(`Change this user to ${role.toUpperCase()}?`)) {
        await updateUserRole(uid, role);
        loadCustomers();
    }
};

const renderRiders = (riders) => {
    if (!ridersContainer) return;
    ridersContainer.innerHTML = riders.map(r => `
        <div class="admin-card bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex items-center gap-4">
            <div class="h-14 w-14 bg-accent text-black rounded-2xl flex items-center justify-center text-2xl">🛵</div>
            <div>
                <h4 class="font-bold text-white">${r.name}</h4>
                <p class="text-xs text-gray-500">${r.phone || 'No phone provided'}</p>
                <span class="inline-block mt-2 px-2 py-0.5 bg-green-900/30 text-green-400 text-[9px] font-black uppercase rounded">Online</span>
            </div>
        </div>
    `).join('');
};

/**
 * 📊 Insights & Charts
 */
const loadDashboardAnalytics = async () => {
    const data = await fetchAnalyticsData();
    
    // Summary Cards In Analytics View
    const insightList = document.querySelector('#top-items-list');
    if (insightList) {
        const sorted = Object.entries(data.topItems).sort((a,b) => b[1] - a[1]).slice(0, 5);
        insightList.innerHTML = sorted.map(([name, qty]) => `
            <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                <span class="text-xs text-gray-300 font-medium">${name}</span>
                <span class="text-xs font-black text-accent">${qty} SOLD</span>
            </div>
        `).join('');
    }

    const customerList = document.querySelector('#top-customers-list');
    if (customerList) {
        const sorted = Object.values(data.customers).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        customerList.innerHTML = sorted.map(c => `
            <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                <span class="text-xs text-gray-300 font-medium">${c.name}</span>
                <span class="text-xs font-black text-white">₹${c.revenue}</span>
            </div>
        `).join('');
    }

    // Charts
    const dates = Object.keys(data.dailyStats).sort();
    const revs = dates.map(d => data.dailyStats[d].revenue);
    const ords = dates.map(d => data.dailyStats[d].orders);
    
    renderMinimalChart('revenue-chart', revs, '#F5A800');
    renderMinimalChart('orders-chart', ords, '#3B82F6');
};

const renderMinimalChart = (id, data, color) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Empty state — no orders yet
    const hasData = data.length > 0 && data.some(v => v > 0);
    if (!hasData) {
        el.innerHTML = `
            <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0.4;">
                <span style="font-size:28px;">📊</span>
                <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7a8098;text-align:center;line-height:1.5;">
                    No data yet —<br>place your first order<br>to see trends
                </p>
            </div>
        `;
        return;
    }
    
    const max = Math.max(...data, 1);
    const step = 100 / (data.length - 1 || 1);
    const points = data.map((v, i) => `${i * step},${100 - (v / max * 100)}`).join(' ');
    
    el.innerHTML = `
        <svg viewBox="0 0 100 100" class="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="grad-${id}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <path d="M 0,100 L ${points} L 100,100 Z" fill="url(#grad-${id})" stroke="none" />
            <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        </svg>
    `;
};

/**
 * 🔔 Notifications
 */
const triggerNewOrderAlert = () => {
    const audio = document.querySelector('#notif-sound');
    if (audio) { audio.currentTime = 0; audio.play().catch(console.warn); }
    
    if (newOrderToast) {
        newOrderToast.classList.remove('hidden');
        setTimeout(() => newOrderToast.classList.add('hidden'), 5000);
    }
};

const setupLogout = () => {
    document.querySelector('#admin-logout-btn')?.addEventListener('click', async () => {
        if (confirm('Logout from Admin Session?')) {
            await logoutUser();
            window.location.href = '/login.html';
        }
    });
    // Note: header avatar dropdown logout is wired in setupProfileDropdown()
};

// Fire it up
document.addEventListener('DOMContentLoaded', initAdmin);

/**
 * 🎟️ COUPON ADMIN (Item 6)
 */
const loadCoupons = async () => {
    const listEl = document.querySelector('#coupons-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:#7a8098;">Loading...</p>';
    const coupons = await fetchAllCoupons();
    if (coupons.length === 0) {
        listEl.innerHTML = '<p style="color:#7a8098;">No coupons created yet.</p>';
        return;
    }
    listEl.innerHTML = coupons.map(c => {
        const expiry = c.expiresAt?.toDate ? c.expiresAt.toDate().toLocaleString('en-IN') : 'No expiry';
        const isExpired = c.expiresAt?.toDate && new Date() > c.expiresAt.toDate();
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#0d0f14;border:1px solid #252830;border-radius:14px;">
                <div>
                    <p style="font-weight:900;color:#F5A800;font-size:15px;letter-spacing:1px;">${c.id}</p>
                    <p style="font-size:12px;color:#9ca3af;margin-top:4px;">Discount: ₹${c.discountAmount} &nbsp;|&nbsp; Min: ₹${c.minOrderValue || 0} &nbsp;|&nbsp; Expires: ${expiry}</p>
                    ${isExpired ? '<span style="font-size:10px;font-weight:800;color:#ef4444;text-transform:uppercase;">EXPIRED</span>' : '<span style="font-size:10px;font-weight:800;color:#10B981;text-transform:uppercase;">ACTIVE</span>'}
                </div>
                <button onclick="window.adminDeleteCoupon('${c.id}')" style="padding:8px 16px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Delete</button>
            </div>
        `;
    }).join('');
};

const setupCouponAdmin = () => {
    const createBtn = document.querySelector('#create-coupon-btn');
    if (!createBtn) return;

    createBtn.addEventListener('click', async () => {
        const code = document.querySelector('#new-coupon-code')?.value.trim();
        const discount = parseInt(document.querySelector('#new-coupon-discount')?.value);
        const minOrder = parseInt(document.querySelector('#new-coupon-min')?.value || '0');
        const expiryVal = document.querySelector('#new-coupon-expiry')?.value;
        const msg = document.querySelector('#coupon-create-msg');

        if (!code || !discount) {
            if (msg) { msg.textContent = 'Code and discount amount are required.'; msg.style.color = '#ef4444'; }
            return;
        }

        try {
            createBtn.textContent = 'Creating...';
            createBtn.disabled = true;
            await createCoupon({
                code,
                discountAmount: discount,
                minOrderValue: minOrder || 0,
                expiresAt: expiryVal ? new Date(expiryVal) : null
            });
            if (msg) { msg.textContent = `✅ Coupon "${code.toUpperCase()}" created!`; msg.style.color = '#10B981'; }
            // Clear fields
            ['#new-coupon-code','#new-coupon-discount','#new-coupon-min','#new-coupon-expiry'].forEach(sel => {
                const el = document.querySelector(sel);
                if (el) el.value = '';
            });
            loadCoupons();
        } catch (e) {
            if (msg) { msg.textContent = 'Failed to create coupon. Try again.'; msg.style.color = '#ef4444'; }
        } finally {
            createBtn.textContent = 'Create Coupon';
            createBtn.disabled = false;
        }
    });
};

window.adminDeleteCoupon = async (code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
        await deleteCoupon(code);
        loadCoupons();
    } catch (e) { console.error('Delete coupon failed:', e); }
};

/**
 * 📢 ANNOUNCEMENT ADMIN (Item 8)
 */
const loadAnnouncements = async () => {
    const listEl = document.querySelector('#announcements-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:#7a8098;">Loading...</p>';
    const anns = await fetchAllAnnouncements();
    if (anns.length === 0) {
        listEl.innerHTML = '<p style="color:#7a8098;">No announcements yet.</p>';
        return;
    }
    listEl.innerHTML = anns.map(a => {
        const expiry = a.expiresAt?.toDate ? a.expiresAt.toDate().toLocaleString('en-IN') : 'No expiry';
        const isExpired = a.expiresAt?.toDate && new Date() > a.expiresAt.toDate();
        return `
            <div style="display:flex;align-items:center;gap:16px;padding:14px 18px;background:#0d0f14;border:1px solid #252830;border-radius:14px;">
                ${a.imageUrl ? `<img src="${a.imageUrl}" style="width:80px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;">` : '<div style="width:80px;height:56px;background:#1a1c23;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:24px;">📢</div>'}
                <div style="flex:1;min-width:0;">
                    <p style="font-weight:800;color:#fff;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.title || '(No title)'}</p>
                    <p style="font-size:12px;color:#9ca3af;margin-top:3px;">Expires: ${expiry}</p>
                    ${isExpired ? '<span style="font-size:10px;font-weight:800;color:#ef4444;">EXPIRED</span>' : (a.active ? '<span style="font-size:10px;font-weight:800;color:#10B981;">ACTIVE</span>' : '<span style="font-size:10px;font-weight:800;color:#7a8098;">HIDDEN</span>')}
                </div>
                <div style="display:flex;gap:8px;flex-shrink:0;">
                    <button onclick="window.adminToggleAnn('${a.id}', ${!a.active})" style="padding:8px 12px;background:${a.active ? '#374151' : '#10B981'};color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">${a.active ? 'Hide' : 'Show'}</button>
                    <button onclick="window.adminDeleteAnn('${a.id}', '${a.storagePath || ''}')" style="padding:8px 12px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
};

const setupAnnouncementAdmin = () => {
    const createBtn = document.querySelector('#create-ann-btn');
    const imageInput = document.querySelector('#ann-image');
    const preview = document.querySelector('#ann-preview');
    const previewImg = document.querySelector('#ann-preview-img');

    if (!createBtn) return;

    // Image preview
    imageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewImg.src = ev.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    });

    createBtn.addEventListener('click', async () => {
        const title = document.querySelector('#ann-title')?.value.trim() || '';
        const expiryVal = document.querySelector('#ann-expiry')?.value;
        const imageFile = imageInput?.files[0] || null;
        const msg = document.querySelector('#ann-create-msg');

        if (!imageFile && !title) {
            if (msg) { msg.textContent = 'Provide at least an image or a title.'; msg.style.color = '#ef4444'; }
            return;
        }

        try {
            createBtn.textContent = 'Uploading...';
            createBtn.disabled = true;

            await createAnnouncement(imageFile, {
                title,
                expiresAt: expiryVal ? new Date(expiryVal) : null,
                active: true
            });

            if (msg) { msg.textContent = '✅ Announcement published!'; msg.style.color = '#10B981'; }
            // Reset
            if (document.querySelector('#ann-title')) document.querySelector('#ann-title').value = '';
            if (document.querySelector('#ann-expiry')) document.querySelector('#ann-expiry').value = '';
            if (imageInput) imageInput.value = '';
            if (preview) preview.style.display = 'none';
            loadAnnouncements();
        } catch (e) {
            if (msg) { msg.textContent = 'Upload failed. Check Storage rules.'; msg.style.color = '#ef4444'; }
        } finally {
            createBtn.textContent = 'Upload & Publish';
            createBtn.disabled = false;
        }
    });
};

window.adminToggleAnn = async (id, active) => {
    try {
        await toggleAnnouncementActive(id, active);
        loadAnnouncements();
    } catch (e) { console.error('Toggle failed:', e); }
};

window.adminDeleteAnn = async (id, storagePath) => {
    if (!confirm('Delete this announcement?')) return;
    try {
        await deleteAnnouncement(id, storagePath || null);
        loadAnnouncements();
    } catch (e) { console.error('Delete ann failed:', e); }
};

