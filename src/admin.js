import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange } from './api/auth';
import { fetchAllUsers, fetchUsersByRole, updateUserRole } from './api/users';
import { assignRiderToOrder } from './api/orders';
import { fetchAnalyticsData } from './api/analytics';

const activeList = document.querySelector('#active-orders-list');
const completedList = document.querySelector('#completed-orders-list');
const activeCount = document.querySelector('#active-count');
const completedCount = document.querySelector('#completed-count');
const alertBanner = document.querySelector('#new-order-alert');
const notifSound = document.querySelector('#notif-sound');

// Tabs
const tabViewOrders = document.querySelector('#view-orders');
const tabViewUsers = document.querySelector('#view-users');
const tabViewAnalytics = document.querySelector('#view-analytics');

const sectionOrders = document.querySelector('.grid');
const sectionUsers = document.querySelector('#users-section');
const sectionAnalytics = document.querySelector('#analytics-section');
const usersListBody = document.querySelector('#users-list-body');

let isInitialLoad = true;
let currentUser = null;
let ridersList = [];

/**
 * Initializes the real-time order listener with role security
 */
const initAdmin = () => {
    onAuthChange(async (user) => {
        if (!user || !['admin', 'manager'].includes(user.profile?.role)) {
            console.warn('⛔ Unauthorized Admin Access Attempt');
            alert('Access Denied: Admin/Manager privileges required.');
            window.location.href = '/';
            return;
        }

        currentUser = user;
        setupTabs();
        
        // Fetch riders for assignment dropdowns
        ridersList = await fetchUsersByRole('rider');
        
        startOrderListener();
        
        if (currentUser.profile.role === 'admin') {
            loadUsersList();
            loadAnalytics();
        } else {
            // Managers don't see the Users tab
            tabViewUsers?.classList.add('hidden');
            loadAnalytics(); // Still load analytics (filtered)
        }
    });
};

const setupTabs = () => {
    const tabs = [
        { btn: tabViewOrders, section: sectionOrders, display: 'grid' },
        { btn: tabViewUsers, section: sectionUsers, display: 'block' },
        { btn: tabViewAnalytics, section: sectionAnalytics, display: 'block' }
    ];

    tabs.forEach(tab => {
        tab.btn?.addEventListener('click', () => {
            tabs.forEach(t => {
                t.section?.classList.add('hidden');
                t.section?.classList.remove('grid', 'block');
                t.btn?.classList.remove('bg-accent', 'text-black');
                t.btn?.classList.add('text-gray-500');
            });
            tab.section?.classList.remove('hidden');
            tab.section?.classList.add(tab.display);
            tab.btn?.classList.add('bg-accent', 'text-black');
            tab.btn?.classList.remove('text-gray-500');
            
            if (tab.btn === tabViewAnalytics) loadAnalytics();
        });
    });
};

const loadUsersList = async () => {
    const users = await fetchAllUsers();
    if (usersListBody) {
        usersListBody.innerHTML = users.map(user => `
            <tr class="hover:bg-white/5 transition">
                <td class="p-6">
                    <div class="font-bold">${user.name}</div>
                    <div class="text-[10px] text-gray-500">${user.email}</div>
                </td>
                <td class="p-6">
                    <span class="px-3 py-1 bg-gray-800 rounded-full text-[10px] uppercase font-bold tracking-widest text-accent">
                        ${user.role}
                    </span>
                </td>
                <td class="p-6">
                    <select onchange="handleRoleChange('${user.id}', this.value)" class="bg-gray-800 border-none rounded-lg text-xs px-2 py-1 outline-none">
                        <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                        <option value="rider" ${user.role === 'rider' ? 'selected' : ''}>Rider</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }
};

window.handleRoleChange = async (uid, newRole) => {
    if (confirm(`Change user role to ${newRole.toUpperCase()}?`)) {
        await updateUserRole(uid, newRole);
        loadUsersList();
    }
};

const startOrderListener = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
        const activeOrders = [];
        const completedOrders = [];
        let hasNewOrder = false;

        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && !isInitialLoad) hasNewOrder = true;
        });

        if (hasNewOrder) triggerNotification();

        snapshot.docs.forEach(doc => {
            const order = { id: doc.id, ...doc.data() };
            if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
                completedOrders.push(order);
            } else {
                activeOrders.push(order);
            }
        });

        renderOrders(activeOrders, completedOrders);
        updateStats(activeOrders.length, completedOrders.length);
        isInitialLoad = false;
    });
};

const renderOrders = (active, completed) => {
    if (activeList) {
        activeList.innerHTML = active.length > 0 
            ? active.map(order => createOrderCard(order, true)).join('')
            : '<p class="text-gray-600 text-center py-20">Monitoring for incoming orders...</p>';
    }

    if (completedList) {
        completedList.innerHTML = completed.length > 0
            ? completed.map(order => createOrderCard(order, false)).join('')
            : '<p class="text-gray-600 text-center py-10">No recent completions.</p>';
    }
};

const createOrderCard = (order, isActive) => {
    const time = order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleTimeString() : 'Just now';
    const statusClass = `status-${order.status.toLowerCase()}`;
    const isNew = isActive && (Date.now() - (order.createdAt?.toMillis() || Date.now()) < 60000);

    return `
        <div class="admin-card glass p-6 rounded-2xl border border-gray-800 ${isNew ? 'new-order' : ''}" data-id="${order.id}">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <div class="flex items-center space-x-3 mb-1">
                        <span class="text-xs font-black text-gray-500 uppercase tracking-widest">${order.orderId}</span>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClass}">
                            ${order.status.replace(/_/g, ' ')}
                        </span>
                        ${order.paymentMethod === 'ONLINE' ? '<span class="text-[10px] font-bold text-green-500 italic">PAID</span>' : '<span class="text-[10px] font-bold text-orange-500 italic">COD</span>'}
                    </div>
                    <h3 class="text-lg font-bold">${order.customer.name}</h3>
                </div>
                <div class="text-right">
                    <p class="text-xl font-black text-accent">₹${order.total}</p>
                    <p class="text-[10px] text-gray-500">${time}</p>
                </div>
            </div>

            <!-- Details -->
            <div class="bg-black/20 p-4 rounded-xl mb-4 text-xs space-y-1">
                ${order.items.map(item => `<div>${item.name} (${item.variant} x ${item.quantity})</div>`).join('')}
                <div class="pt-2 mt-2 border-t border-gray-800 text-gray-500">📍 ${order.customer.address}</div>
            </div>

            <!-- Rider Assignment -->
            ${isActive ? `
                <div class="mb-4 bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <p class="text-[10px] font-bold uppercase text-gray-500 mb-1">Assigned Rider</p>
                    <select onchange="handleRiderAssign('${order.id}', this.value)" class="w-full bg-transparent text-xs outline-none cursor-pointer">
                        <option value="">-- Assign Rider --</option>
                        ${ridersList.map(r => `<option value="${r.uid}" ${order.riderId === r.uid ? 'selected' : ''}>${r.name}</option>`).join('')}
                    </select>
                </div>
            ` : ''}

            ${isActive ? `
                <div class="flex flex-wrap gap-2">
                    <button class="action-btn status-received" onclick="updateOrderStatus('${order.id}', 'RECEIVED')">Received</button>
                    <button class="action-btn status-preparing" onclick="updateOrderStatus('${order.id}', 'PREPARING')">Preparing</button>
                    <button class="action-btn status-out_for_delivery" onclick="updateOrderStatus('${order.id}', 'OUT_FOR_DELIVERY')">Delivery</button>
                    <button class="action-btn status-delivered" onclick="updateOrderStatus('${order.id}', 'Complete')">Done</button>
                </div>
            ` : ''}
        </div>
    `;
};

window.handleRiderAssign = async (orderId, riderId) => {
    if (!riderId) return;
    await assignRiderToOrder(orderId, riderId);
    alert('Rider Assigned Successfully');
};

window.updateOrderStatus = async (docId, newStatus) => {
    try {
        const orderRef = doc(db, 'orders', docId);
        await updateDoc(orderRef, {
            status: newStatus.toUpperCase(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Update failed:', error);
    }
};

const triggerNotification = () => {
    if (alertBanner) {
        alertBanner.classList.remove('hidden');
        setTimeout(() => alertBanner.classList.add('hidden'), 5000);
    }
    if (notifSound) {
        notifSound.currentTime = 0;
        notifSound.play().catch(e => console.warn('Audio play blocked:', e));
    }
};

const loadAnalytics = async () => {
    const data = await fetchAnalyticsData();
    const isManager = currentUser.profile.role === 'manager';

    // 1. Update KPI Cards
    if (isManager) {
        document.querySelector('#revenue-card')?.classList.add('hidden');
        document.querySelector('#revenue-graph-card')?.classList.add('hidden');
        document.querySelector('#customers-card')?.classList.add('hidden');
    } else {
        document.querySelector('#stat-revenue').textContent = `₹${data.totalRevenue}`;
    }

    document.querySelector('#stat-orders').textContent = data.totalOrders;
    document.querySelector('#stat-comparison').textContent = `${data.todayOrders} / ${data.yesterdayOrders}`;

    // 2. Render Charts
    const dates = Object.keys(data.dailyStats).sort();
    const revenueTrend = dates.map(d => data.dailyStats[d].revenue);
    const orderTrend = dates.map(d => data.dailyStats[d].orders);

    if (!isManager) renderLineChart('revenue-chart', dates, revenueTrend, '#fbbf24');
    renderBarChart('orders-chart', dates, orderTrend, '#3B82F6');

    // 3. Render Top Items
    const topItemsList = document.querySelector('#top-items-list');
    if (topItemsList) {
        const sortedItems = Object.entries(data.topItems).sort((a, b) => b[1] - a[1]).slice(0, 5);
        topItemsList.innerHTML = sortedItems.map(([name, qty]) => `
            <div class="flex justify-between items-center text-sm p-2 border-b border-gray-800/50">
                <span class="text-gray-300">${name}</span>
                <span class="font-bold text-accent">${qty} sold</span>
            </div>
        `).join('') || '<p class="text-xs text-gray-500 text-center">No sales data yet.</p>';
    }

    // 4. Render Repeat Customers
    const customersList = document.querySelector('#customers-list');
    if (customersList && !isManager) {
        const repeats = Object.values(data.customers).filter(c => c.count >= 2).sort((a,b) => b.count - a.count);
        customersList.innerHTML = repeats.map(c => `
            <div class="flex justify-between items-center text-sm p-2 border-b border-gray-800/50">
                <span class="text-gray-300">${c.name}</span>
                <span class="font-bold bg-accent/20 px-2 py-0.5 rounded text-[10px]">${c.count} orders</span>
            </div>
        `).join('') || '<p class="text-xs text-gray-500 text-center">No repeats yet.</p>';
    }
};

const renderLineChart = (containerId, labels, data, color) => {
    const container = document.getElementById(containerId);
    if (!container || data.length === 0) return;

    const max = Math.max(...data, 1);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = 40;

    const points = data.map((val, i) => {
        const x = padding + (i * (width - padding * 2) / (data.length - 1 || 1));
        const y = height - padding - (val * (height - padding * 2) / max);
        return `${x},${y}`;
    }).join(' ');

    container.innerHTML = `
        <svg class="w-full h-full" viewBox="0 0 ${width} ${height}">
            <polyline fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" class="opacity-80" />
            ${data.map((val, i) => {
                const [x, y] = points.split(' ')[i].split(',');
                return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" class="hover:r-6 cursor-pointer" />`;
            }).join('')}
        </svg>
    `;
};

const renderBarChart = (containerId, labels, data, color) => {
    const container = document.getElementById(containerId);
    if (!container || data.length === 0) return;

    const max = Math.max(...data, 1);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const padding = 20;
    const barWidth = (width - padding * 2) / data.length;

    container.innerHTML = `
        <svg class="w-full h-full" viewBox="0 0 ${width} ${height}">
            ${data.map((val, i) => {
                const h = (val * (height - padding * 2) / max);
                const x = padding + (i * barWidth);
                const y = height - padding - h;
                return `<rect x="${x + 2}" y="${y}" width="${barWidth - 4}" height="${h}" fill="${color}" rx="4" class="opacity-60" />`;
            }).join('')}
        </svg>
    `;
};

initAdmin();
