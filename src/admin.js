import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where, Timestamp, getDocs, limit, addDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange, logoutUser, getUserRole, isAdminOrManager } from './api/auth';
import { fetchAllUsers, fetchUsersByRole, updateUserRole } from './api/users';
import { assignRiderToOrder, updateOrderDetails } from './api/orders';
import { fetchAnalyticsData } from './api/analytics';
import { ORDER_STATUS } from './constants/orderStatus';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon, getCouponAnalytics, getTopCoupons, getCouponTimeline } from './api/coupons';
import { fetchAllAnnouncements, createAnnouncement, toggleAnnouncementActive, deleteAnnouncement } from './api/announcements';
import { createMenuItem, updateMenuItem, deleteMenuItem } from './api/menu';

/**
 * 👑 LITTIWALE ADMIN PANEL CORE (PREMIUM REDESIGN)
 */

// View Elements
const viewDashboard = document.querySelector('#view-dashboard');
const viewOrders = document.querySelector('#view-orders');
const viewTickets = document.querySelector('#view-tickets');
const viewCustomers = document.querySelector('#view-customers');
const viewMenu = document.querySelector('#view-menu');
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

// Menu Admin Elements
const ticketsListContainer = document.querySelector('#tickets-list-container');
const menuListContainer = document.querySelector('#menu-list-container');
const menuCategoryFilter = document.querySelector('#menu-category-filter');

const handleTicketActionClick = (event) => {
    const resolveBtn = event.target.closest('[data-ticket-action="resolve"]');
    if (!resolveBtn) return;
    const ticketId = resolveBtn.dataset.id;
    resolveTicket(ticketId);
};

if (ticketsListContainer) {
    ticketsListContainer.addEventListener('click', handleTicketActionClick);
}
const menuForm = document.querySelector('#menu-form');
const menuFormTitle = document.querySelector('#menu-form-title');
const menuItemIdInput = document.querySelector('#menu-item-id');
const menuItemStoragePathInput = document.querySelector('#menu-item-storage-path');
const menuNameInput = document.querySelector('#menu-name');
const menuDescriptionInput = document.querySelector('#menu-description');
const menuCategoryInput = document.querySelector('#menu-category');
const menuPriceInput = document.querySelector('#menu-price');
const menuVegInput = document.querySelector('#menu-veg');
const menuAvailableInput = document.querySelector('#menu-available');
const menuStockInput = document.querySelector('#menu-stock');
const menuImageInput = document.querySelector('#menu-image');
const menuImagePreview = document.querySelector('#menu-image-preview');
const menuVariantsList = document.querySelector('#menu-variants-list');
const addVariantBtn = document.querySelector('#add-variant-btn');
const saveMenuItemBtn = document.querySelector('#save-menu-item-btn');
const resetMenuFormBtn = document.querySelector('#reset-menu-form-btn');
const menuFormMessage = document.querySelector('#menu-form-message');
const menuItemsCount = document.querySelector('#menu-items-count');
const menuSearchInput = document.querySelector('#menu-search');
const showMenuListBtn = document.querySelector('#show-menu-list-btn');
const showMenuAddBtn = document.querySelector('#show-menu-add-btn');
const closeMenuFormBtn = document.querySelector('#close-menu-form-btn');
const menuFormPanel = document.querySelector('#menu-form-panel');
const menuListCard = document.querySelector('#menu-list-card');

// State
let isInitialLoad = true;
let currentUser = null;
let menuSearchQuery = '';
let ridersList = [];
let activeOrders = [];
let completedOrders = [];
let currentFilter = 'ALL';
let currentView = 'dashboard';
let orderListenerUnsubscribe = null;
let menuItems = [];
let menuListenerUnsubscribe = null;
let menuViewInitialized = false;
let currentMenuCategory = 'all';
let editingMenuItemId = null;
let editingCouponCode = null;

/**
 * 🚀 Initialization
 */
const initAdmin = () => {
    // Show a loading overlay immediately to prevent flashing the admin UI
    // before auth resolves. We create it inline to avoid HTML dependency.
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'admin-auth-loader';
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

    onAuthChange(async (user, isLoading) => {
        // Auth SDK still initializing — do nothing
        if (isLoading) return;

        // Remove loading overlay now that auth state is confirmed
        loadingOverlay.remove();

        // No session → login
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        const role = getUserRole(user);

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
        restoreViewFromHash();
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
const setActiveNavItem = (viewName) => {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
};

const navigateToView = (viewName) => {
    if (!viewName) return;
    const validViews = ['dashboard','orders','tickets','customers','menu','analytics','riders','coupons','announcements'];
    const normalizedView = validViews.includes(viewName) ? viewName : 'dashboard';

    setActiveNavItem(normalizedView);
    switchView(normalizedView);
    window.history.replaceState(null, '', `#${normalizedView}`);

    const pageTitle = document.querySelector('#page-title');
    if (pageTitle) {
        pageTitle.textContent = normalizedView.charAt(0).toUpperCase() + normalizedView.slice(1);
    }
};

const setupNavigation = () => {
    const navItems = document.querySelectorAll('.nav-item[data-view]');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            navigateToView(view);
        });
    });
};

const restoreViewFromHash = () => {
    const currentHash = window.location.hash.replace('#', '').trim();
    const validViews = ['dashboard','orders','tickets','customers','menu','analytics','riders','coupons','announcements'];
    const view = validViews.includes(currentHash) ? currentHash : 'dashboard';
    navigateToView(view);
};

const switchView = (viewName) => {
    currentView = viewName;
    document.querySelectorAll('.content-view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${viewName}`);
    });

    if (viewName === 'analytics') {
        loadDashboardAnalytics();
        setupAnalyticsAdmin();
    }
    if (viewName === 'customers') loadCustomers();
    if (viewName === 'menu') setupMenuAdmin();
    if (viewName === 'tickets') loadTickets();
    if (viewName === 'coupons') {
        loadCoupons();
        setupCouponAdmin();
    }
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

const setupMenuAdmin = () => {
    if (menuViewInitialized) return;
    menuViewInitialized = true;

    initMenuForm();
    startMenuListener();
    hideMenuFormPanel();
    setMenuMode('list');

    menuCategoryFilter?.addEventListener('change', (e) => {
        currentMenuCategory = e.target.value || 'all';
        renderMenuList();
    });

    menuSearchInput?.addEventListener('input', (e) => {
        menuSearchQuery = e.target.value.trim().toLowerCase();
        renderMenuList();
    });

    showMenuAddBtn?.addEventListener('click', () => {
        resetMenuForm();
        showMenuFormPanel(true, 'create');
        setMenuMode('form');
    });

    showMenuListBtn?.addEventListener('click', () => {
        hideMenuFormPanel();
        setMenuMode('list');
    });

    closeMenuFormBtn?.addEventListener('click', () => {
        hideMenuFormPanel();
        setMenuMode('list');
    });

    // Bulk operations
    initMenuBulkOperations();
};

const initMenuBulkOperations = () => {
    const selectAllCheckbox = document.getElementById('menu-select-all');
    const bulkSelectAllBtn = document.getElementById('menu-bulk-select-all');
    const bulkEditBtn = document.getElementById('menu-bulk-edit');
    const bulkDeleteBtn = document.getElementById('menu-bulk-delete');
    const selectedCountEl = document.getElementById('menu-selected-count');

    const updateBulkButtons = () => {
        const selectedCheckboxes = document.querySelectorAll('.menu-item-checkbox:checked');
        const selectedCount = selectedCheckboxes.length;
        
        selectedCountEl.textContent = selectedCount;
        bulkEditBtn.disabled = selectedCount === 0;
        bulkDeleteBtn.disabled = selectedCount === 0;
        
        bulkEditBtn.classList.toggle('opacity-50', selectedCount === 0);
        bulkDeleteBtn.classList.toggle('opacity-50', selectedCount === 0);
    };

    // Select all checkbox
    selectAllCheckbox?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.menu-item-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateBulkButtons();
    });

    // Select all button
    bulkSelectAllBtn?.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.menu-item-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(cb => cb.checked = !allChecked);
        selectAllCheckbox.checked = !allChecked;
        updateBulkButtons();
    });

    // Bulk edit
    bulkEditBtn?.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.menu-item-checkbox:checked')).map(cb => cb.dataset.id);
        if (selectedIds.length === 0) return;
        
        handleBulkEdit(selectedIds);
    });

    // Bulk delete
    bulkDeleteBtn?.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.menu-item-checkbox:checked')).map(cb => cb.dataset.id);
        if (selectedIds.length === 0) return;
        
        handleBulkDelete(selectedIds);
    });

    // Update buttons when individual checkboxes change
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('menu-item-checkbox')) {
            updateBulkButtons();
            
            // Update select all checkbox state
            const allCheckboxes = document.querySelectorAll('.menu-item-checkbox');
            const checkedCheckboxes = document.querySelectorAll('.menu-item-checkbox:checked');
            selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
            selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
        }
    });
};

const handleBulkEdit = (selectedIds) => {
    if (selectedIds.length === 0) return;
    
    // For now, show a simple bulk edit modal
    // In a full implementation, this would allow editing multiple fields at once
    const confirmed = confirm(`Bulk edit ${selectedIds.length} items?\n\nThis feature allows you to:\n• Change category for all selected items\n• Toggle availability (show/hide)\n• Apply price adjustments\n\nContinue to bulk edit form?`);
    
    if (confirmed) {
        showBulkEditModal(selectedIds);
    }
};

const handleBulkDelete = (selectedIds) => {
    if (selectedIds.length === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedIds.length} menu item(s)?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
        bulkDeleteMenuItems(selectedIds);
    }
};

const bulkDeleteMenuItems = async (itemIds) => {
    try {
        const deletePromises = itemIds.map(id => deleteMenuItem(id));
        await Promise.all(deletePromises);
        
        showToast(`Successfully deleted ${itemIds.length} menu item(s)`, 'success');
        
        // Clear selections
        document.querySelectorAll('.menu-item-checkbox:checked').forEach(cb => cb.checked = false);
        document.getElementById('menu-select-all').checked = false;
        document.getElementById('menu-selected-count').textContent = '0';
        
    } catch (error) {
        console.error('Bulk delete error:', error);
        showToast('Error deleting menu items', 'error');
    }
};

const showBulkEditModal = (selectedIds) => {
    // Simple implementation - could be expanded to a full modal
    const newCategory = prompt('Enter new category for all selected items (leave empty to skip):');
    const priceAdjustment = prompt('Price adjustment (e.g., +10, -5, *1.1, leave empty to skip):');
    const toggleAvailability = confirm('Toggle availability (show/hide) for all selected items?');
    
    if (!newCategory && !priceAdjustment && !toggleAvailability) {
        return;
    }
    
    bulkEditMenuItems(selectedIds, { newCategory, priceAdjustment, toggleAvailability });
};

const bulkEditMenuItems = async (itemIds, changes) => {
    try {
        const updatePromises = itemIds.map(async (id) => {
            const item = menuItems.find(item => item.id === id);
            if (!item) return;
            
            const updates = {};
            
            if (changes.newCategory) {
                updates.category = changes.newCategory;
            }
            
            if (changes.priceAdjustment) {
                let newPrice = item.price;
                const adjustment = changes.priceAdjustment.trim();
                
                if (adjustment.startsWith('+')) {
                    newPrice += parseFloat(adjustment.substring(1));
                } else if (adjustment.startsWith('-')) {
                    newPrice -= parseFloat(adjustment.substring(1));
                } else if (adjustment.startsWith('*')) {
                    newPrice *= parseFloat(adjustment.substring(1));
                } else {
                    newPrice = parseFloat(adjustment);
                }
                
                updates.price = Math.max(0, Math.round(newPrice));
            }
            
            if (changes.toggleAvailability) {
                updates.available = !item.available;
            }
            
            if (Object.keys(updates).length > 0) {
                return updateMenuItem(id, updates);
            }
        });
        
        await Promise.all(updatePromises);
        
        showToast(`Successfully updated ${itemIds.length} menu item(s)`, 'success');
        
        // Clear selections
        document.querySelectorAll('.menu-item-checkbox:checked').forEach(cb => cb.checked = false);
        document.getElementById('menu-select-all').checked = false;
        document.getElementById('menu-selected-count').textContent = '0';
        
    } catch (error) {
        console.error('Bulk edit error:', error);
        showToast('Error updating menu items', 'error');
    }
};

const startMenuListener = () => {
    const menuRef = collection(db, 'menu');
    const q = query(menuRef, orderBy('category'));

    if (typeof menuListenerUnsubscribe === 'function') {
        menuListenerUnsubscribe();
    }

    menuListenerUnsubscribe = onSnapshot(q, (snapshot) => {
        menuItems = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                if (a.category === b.category) {
                    return String(a.name || '').localeCompare(String(b.name || ''));
                }
                return String(a.category || '').localeCompare(String(b.category || ''));
            });
        renderMenuCategories();
        renderMenuList();
    }, (error) => {
        console.error('Menu listener failed:', error);
        if (menuListContainer) {
            menuListContainer.innerHTML = `
                <div class="admin-card p-6 rounded-3xl border border-gray-800 bg-red-900/30 text-red-200">
                    Failed to load menu items. Check Firestore rules or query indexes.
                </div>
            `;
        }
    });
};

const setMenuMode = (mode) => {
    if (showMenuAddBtn) showMenuAddBtn.classList.toggle('active', mode === 'form');
    if (showMenuListBtn) showMenuListBtn.classList.toggle('active', mode === 'list');
    if (menuListCard) menuListCard.classList.toggle('hidden', mode === 'form');
};

const loadTickets = async () => {
    if (!ticketsListContainer) return;
    ticketsListContainer.innerHTML = `<p class="text-gray-500">Loading tickets...</p>`;

    try {
        const ticketsRef = collection(db, 'tickets');
        const ticketsQuery = query(ticketsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ticketsQuery);
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTickets(tickets);
    } catch (error) {
        console.error('Failed to load tickets:', error);
        ticketsListContainer.innerHTML = `
            <div class="admin-card p-6 rounded-3xl border border-red-700 bg-red-900/20 text-red-100">
                Failed to load tickets. Please check Firestore rules and configuration.
            </div>
        `;
    }
};

const renderTickets = (tickets) => {
    if (!ticketsListContainer) return;
    if (!tickets || tickets.length === 0) {
        ticketsListContainer.innerHTML = `
            <div class="admin-card p-6 rounded-3xl border border-gray-800 bg-gray-900/40 text-gray-400">
                No tickets found.
            </div>
        `;
        return;
    }

    ticketsListContainer.innerHTML = `
        <div class="overflow-x-auto">
            <table class="admin-table w-full">
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.map(ticket => `
                        <tr>
                            <td>${ticket.ticketId || ''}</td>
                            <td>${ticket.name || ''}</td>
                            <td>${ticket.phone || ''}</td>
                            <td>${ticket.issue || ''}</td>
                            <td><span class="table-badge ${ticket.status === 'resolved' ? 'success' : 'warning'}">${ticket.status || 'pending'}</span></td>
                            <td>${ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleString() : '—'}</td>
                            <td>
                                ${ticket.status === 'pending' ? `<button type="button" data-ticket-action="resolve" data-id="${ticket.id}" class="btn btn-primary">Mark as resolved</button>` : '<span class="text-gray-400">No action</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const resolveTicket = async (ticketDocId) => {
    if (!ticketDocId) return;
    try {
        await updateDoc(doc(db, 'tickets', ticketDocId), { status: 'resolved' });
        loadTickets();
    } catch (error) {
        console.error('Failed to resolve ticket:', error);
        alert('Could not mark ticket as resolved. Please try again.');
    }
};

const renderMenuCategories = () => {
    if (!menuCategoryFilter) return;

    const categories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean))).sort();
    menuCategoryFilter.innerHTML = `
        <option value="all">All Categories</option>
        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
    `;

    if (!categories.includes(currentMenuCategory) && currentMenuCategory !== 'all') {
        currentMenuCategory = 'all';
    }

    menuCategoryFilter.value = currentMenuCategory;
};

const renderMenuList = () => {
    if (!menuListContainer) return;

    const searchTerm = menuSearchQuery.trim().toLowerCase();
    const filteredItems = menuItems
        .filter(item => currentMenuCategory === 'all' || item.category === currentMenuCategory)
        .filter(item => {
            if (!searchTerm) return true;
            return [item.name, item.category, item.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(searchTerm);
        });

    if (menuItemsCount) {
        menuItemsCount.textContent = filteredItems.length;
    }

    if (filteredItems.length === 0) {
        menuListContainer.innerHTML = `
            <div class="admin-card p-6 rounded-3xl border border-gray-800 bg-gray-900/40 text-gray-400">
                No menu items found for this category.
            </div>
        `;
        return;
    }

    menuListContainer.innerHTML = `
        <table class="admin-table w-full">
            <thead>
                <tr>
                    <th style="width: 40px;">
                        <input type="checkbox" id="menu-select-all" class="menu-bulk-checkbox" />
                    </th>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredItems.map(item => `
                    <tr>
                        <td>
                            <input type="checkbox" class="menu-item-checkbox" data-id="${item.id}" />
                        </td>
                        <td>
                            <div class="flex items-center gap-3">
                                <img src="${item.image || '/images/logo.png'}" alt="${item.name}" loading="lazy" decoding="async" />
                                <div>
                                    <div class="item-name">${item.name || 'Untitled item'}</div>
                                    <div class="item-meta">${item.category || 'Uncategorized'} · ${item.veg ? 'Veg' : 'Non-Veg'}</div>
                                </div>
                            </div>
                        </td>
                        <td>₹${item.price ?? 0}</td>
                        <td>${item.stockQuantity ?? 0}</td>
                        <td><span class="table-badge ${item.available ? 'success' : 'danger'}">${item.available ? 'Visible' : 'Hidden'}</span></td>
                        <td class="table-cell-actions">
                            <button type="button" data-menu-action="edit" data-id="${item.id}" class="btn btn-outline">Edit</button>
                            <button type="button" data-menu-action="toggle" data-id="${item.id}" data-available="${item.available}" class="btn btn-secondary">${item.available ? 'Hide' : 'Show'}</button>
                            <button type="button" data-menu-action="delete" data-id="${item.id}" data-storage="${item.storagePath || ''}" class="btn btn-outline">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

const initMenuForm = () => {
    if (!menuForm) return;

    menuForm.addEventListener('submit', handleMenuFormSubmit);
    addVariantBtn?.addEventListener('click', () => addVariantRow());
    resetMenuFormBtn?.addEventListener('click', resetMenuForm);
    menuListContainer?.addEventListener('click', handleMenuListClick);
    menuImageInput?.addEventListener('change', handleMenuImagePreview);

    resetMenuForm();
};

const handleMenuImagePreview = () => {
    const file = menuImageInput?.files?.[0];
    if (!file || !menuImagePreview) {
        if (menuImagePreview) menuImagePreview.classList.add('hidden');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = menuImagePreview.querySelector('img');
        if (img) {
            img.src = e.target.result;
            menuImagePreview.classList.remove('hidden');
        }
    };
    reader.readAsDataURL(file);
};

const handleMenuListClick = async (event) => {
    const editBtn = event.target.closest('[data-menu-action="edit"]');
    if (editBtn) {
        const id = editBtn.dataset.id;
        const item = menuItems.find(mi => mi.id === id);
        if (item) populateMenuForm(item);
        return;
    }

    const toggleBtn = event.target.closest('[data-menu-action="toggle"]');
    if (toggleBtn) {
        const id = toggleBtn.dataset.id;
        const item = menuItems.find(mi => mi.id === id);
        if (!item) return;
        try {
            await updateMenuItem(id, {
                ...item,
                available: !item.available,
                stockQuantity: item.stockQuantity ?? 0
            }, null, item.storagePath || '');
            showMenuFormMessage(`Item "${item.name}" updated.`, true);
        } catch (err) {
            showMenuFormMessage('Failed to update item visibility.', false);
        }
        return;
    }

    const deleteBtn = event.target.closest('[data-menu-action="delete"]');
    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const storagePath = deleteBtn.dataset.storage || '';
        if (!confirm('Delete this menu item? This cannot be undone.')) return;
        try {
            await deleteMenuItem(id, storagePath);
            showMenuFormMessage('Menu item deleted successfully.', true);
        } catch (err) {
            showMenuFormMessage('Failed to delete menu item.', false);
        }
    }
};

const populateMenuForm = (item) => {
    editingMenuItemId = item.id;
    menuItemIdInput.value = item.id;
    menuItemStoragePathInput.value = item.storagePath || '';
    menuFormTitle.textContent = 'Edit Menu Item';
    saveMenuItemBtn.textContent = 'Update Item';

    menuNameInput.value = item.name || '';
    menuDescriptionInput.value = item.description || '';
    menuCategoryInput.value = item.category || '';
    menuPriceInput.value = item.price || 0;
    menuVegInput.value = item.veg ? 'true' : 'false';
    menuAvailableInput.value = item.available ? 'true' : 'false';
    menuStockInput.value = item.stockQuantity ?? 0;
    menuImageInput.value = '';

    if (item.image && menuImagePreview) {
        const img = menuImagePreview.querySelector('img');
        if (img) img.src = item.image;
        menuImagePreview.classList.remove('hidden');
    }

    menuVariantsList.innerHTML = '';
    if (item.hasVariants && Array.isArray(item.variants) && item.variants.length > 0) {
        item.variants.forEach(variant => addVariantRow(variant.type, variant.price));
    } else {
        addVariantRow();
    }

    showMenuFormPanel(true, 'edit');
};

const resetMenuForm = () => {
    editingMenuItemId = null;
    menuItemIdInput.value = '';
    menuItemStoragePathInput.value = '';
    menuFormTitle.textContent = 'Create New Item';
    saveMenuItemBtn.textContent = 'Create Item';
    menuNameInput.value = '';
    menuDescriptionInput.value = '';
    menuCategoryInput.value = '';
    menuPriceInput.value = '';
    menuVegInput.value = 'true';
    menuAvailableInput.value = 'true';
    menuStockInput.value = '0';
    menuImageInput.value = '';
    if (menuImagePreview) menuImagePreview.classList.add('hidden');
    menuVariantsList.innerHTML = '';
    addVariantRow();
    showMenuFormMessage('');
};

const showMenuFormPanel = (open = true, mode = 'create') => {
    if (!menuFormPanel) return;
    menuFormPanel.classList.toggle('hidden', !open);
    if (!open) return;
    menuFormTitle.textContent = mode === 'edit' ? 'Edit Menu Item' : 'Create New Item';
    saveMenuItemBtn.textContent = mode === 'edit' ? 'Update Item' : 'Create Item';
};

const hideMenuFormPanel = () => showMenuFormPanel(false);

const addVariantRow = (type = '', price = '') => {
    if (!menuVariantsList) return;

    const row = document.createElement('div');
    row.className = 'grid grid-cols-[1fr_auto] gap-3 items-end mb-3 variant-row';
    row.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Variant</label>
                <input type="text" class="variant-type w-full rounded-xl border border-gray-700 bg-black/50 px-3 py-2 text-sm outline-none" value="${type}">
            </div>
            <div>
                <label class="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Price</label>
                <input type="number" min="0" class="variant-price w-full rounded-xl border border-gray-700 bg-black/50 px-3 py-2 text-sm outline-none" value="${price}">
            </div>
        </div>
        <button type="button" class="remove-variant-btn px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-black uppercase tracking-widest">Remove</button>
    `;

    const removeBtn = row.querySelector('.remove-variant-btn');
    removeBtn?.addEventListener('click', () => row.remove());
    menuVariantsList.appendChild(row);
};

const parseVariants = () => {
    if (!menuVariantsList) return [];
    const variants = [];

    menuVariantsList.querySelectorAll('.variant-row').forEach(row => {
        const typeInput = row.querySelector('.variant-type');
        const priceInput = row.querySelector('.variant-price');
        const type = typeInput?.value.trim();
        const price = Number(priceInput?.value || 0);

        if (type && !Number.isNaN(price) && price >= 0) {
            variants.push({ type, price });
        }
    });

    return variants;
};

const handleMenuFormSubmit = async (event) => {
    event.preventDefault();
    if (!menuForm || !saveMenuItemBtn) return;

    const name = menuNameInput.value.trim();
    const description = menuDescriptionInput.value.trim();
    const category = menuCategoryInput.value.trim();
    const price = Number(menuPriceInput.value || 0);
    const veg = menuVegInput.value === 'true';
    const available = menuAvailableInput.value === 'true';
    const stockQuantity = Number(menuStockInput.value || 0);
    const variants = parseVariants();
    const imageFile = menuImageInput.files?.[0] || null;

    if (!name || !category || (!price && variants.length === 0 && stockQuantity === 0)) {
        showMenuFormMessage('Name, category, price, and stock are required.', false);
        return;
    }

    const payload = {
        name,
        description,
        category,
        price,
        veg,
        available,
        stockQuantity,
        variants
    };

    saveMenuItemBtn.disabled = true;
    const originalText = saveMenuItemBtn.textContent;
    saveMenuItemBtn.textContent = editingMenuItemId ? 'Updating…' : 'Creating…';

    try {
        if (editingMenuItemId) {
            await updateMenuItem(editingMenuItemId, payload, imageFile, menuItemStoragePathInput.value);
            showMenuFormMessage('Menu item updated successfully.', true);
        } else {
            await createMenuItem(payload, imageFile);
            showMenuFormMessage('Menu item created successfully.', true);
        }
        resetMenuForm();
    } catch (error) {
        console.error('Menu save failed:', error);
        showMenuFormMessage('Failed to save menu item. Please try again.', false);
    } finally {
        saveMenuItemBtn.disabled = false;
        saveMenuItemBtn.textContent = originalText;
    }
};

const showMenuFormMessage = (message, success = true) => {
    if (!menuFormMessage) return;
    menuFormMessage.textContent = message;
    menuFormMessage.style.color = success ? '#10B981' : '#ef4444';
};

window.addEventListener('beforeunload', () => {
    if (typeof orderListenerUnsubscribe === 'function') {
        orderListenerUnsubscribe();
    }
    if (typeof menuListenerUnsubscribe === 'function') {
        menuListenerUnsubscribe();
    }
});

/**
 * 📦 Order Lifecycle & Real-time Listeners
 */
const startOrderListener = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));

    orderListenerUnsubscribe = onSnapshot(q, (snapshot) => {
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
        const updates = { status: newStatus };
        if (newStatus === ORDER_STATUS.DELIVERED) {
            updates.paymentStatus = 'paid';
        }
        await updateOrderDetails(docId, updates);
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

// Get delivery stats for a rider
const getRiderDeliveryStats = async (riderId) => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('riderId', '==', riderId),
            where('status', '==', 'delivered')
        );
        const snapshot = await getDocs(q);
        return snapshot.size; // Count of delivered orders
    } catch (error) {
        console.error('Error fetching delivery stats:', error);
        return 0;
    }
};

// Get comprehensive rider analytics
const getRiderAnalytics = async (riderId) => {
    try {
        const ordersRef = collection(db, 'orders');
        
        // Get all orders for this rider
        const allOrdersQuery = query(ordersRef, where('riderId', '==', riderId));
        const allOrdersSnap = await getDocs(allOrdersQuery);
        const allOrders = allOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get delivered orders
        const deliveredQuery = query(
            ordersRef,
            where('riderId', '==', riderId),
            where('status', '==', 'delivered')
        );
        const deliveredSnap = await getDocs(deliveredQuery);
        const deliveredOrders = deliveredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get active orders
        const activeQuery = query(
            ordersRef,
            where('riderId', '==', riderId),
            where('status', 'in', ['accepted', 'out_for_delivery'])
        );
        const activeSnap = await getDocs(activeQuery);
        const activeOrders = activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate average delivery time (in minutes)
        let totalTime = 0;
        let validDeliveries = 0;
        deliveredOrders.forEach(order => {
            if (order.createdAt && order.deliveredAt) {
                const created = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                const delivered = order.deliveredAt.toDate ? order.deliveredAt.toDate() : new Date(order.deliveredAt);
                const diffMs = delivered - created;
                const diffMins = Math.floor(diffMs / (1000 * 60));
                if (diffMins > 0 && diffMins < 1440) { // Valid if less than 24 hours
                    totalTime += diffMins;
                    validDeliveries++;
                }
            }
        });
        
        const avgDeliveryTime = validDeliveries > 0 ? Math.round(totalTime / validDeliveries) : 0;
        
        // Calculate on-time delivery rate (assume orders marked as delivered on time)
        const onTimeRate = deliveredOrders.length > 0 
            ? Math.round((deliveredOrders.length / allOrders.length) * 100) 
            : 0;
        
        return {
            totalDeliveries: deliveredOrders.length,
            activeOrders: activeOrders.length,
            avgDeliveryTime,
            onTimeRate,
            recentDeliveries: deliveredOrders.slice(-5).reverse() // Last 5 deliveries
        };
    } catch (error) {
        console.error('Error fetching rider analytics:', error);
        return {
            totalDeliveries: 0,
            activeOrders: 0,
            avgDeliveryTime: 0,
            onTimeRate: 0,
            recentDeliveries: []
        };
    }
};

// Open rider contact modal
window.openRiderContact = (riderId, riderName, riderPhone) => {
    const modal = document.getElementById('rider-contact-modal');
    const header = document.getElementById('rider-contact-header');
    const nameEl = document.getElementById('rider-contact-name');
    const phoneEl = document.getElementById('rider-contact-phone');
    const messagesEl = document.getElementById('rider-contact-messages');
    
    if (modal && nameEl && phoneEl) {
        nameEl.textContent = riderName || 'Rider';
        phoneEl.innerHTML = `<a href="tel:${riderPhone}" style="color:#9ca3af;text-decoration:none;">${riderPhone || 'No phone'}</a>`;
        modal.setAttribute('data-rider-id', riderId);
        modal.style.display = 'flex';
        
        // Clear and load messages
        messagesEl.innerHTML = '<div style="text-align:center;color:#6b7280;padding:20px;">No messages yet. Start a conversation!</div>';
    }
};

// Send rider contact message
window.sendRiderContactMessage = async () => {
    const modal = document.getElementById('rider-contact-modal');
    const input = document.getElementById('rider-contact-input');
    const riderId = modal.getAttribute('data-rider-id');
    const message = input?.value.trim();
    
    if (!message || !riderId) return;
    
    try {
        // Store message in Firestore
        const messagesRef = collection(db, 'admin_messages');
        await addDoc(messagesRef, {
            riderId,
            message,
            sentBy: 'admin',
            sentAt: serverTimestamp(),
            read: false
        });
        
        input.value = '';
        
        // Show success feedback
        const oldText = event.target.textContent;
        event.target.textContent = '✓ Sent';
        setTimeout(() => {
            event.target.textContent = oldText;
        }, 2000);
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
};

// Open rider analytics modal
window.openRiderAnalytics = async (riderId, riderName) => {
    const modal = document.getElementById('rider-analytics-modal');
    if (!modal) return;
    
    // Show loading state
    modal.style.display = 'flex';
    document.getElementById('analytics-total-deliveries').textContent = 'Loading...';
    document.getElementById('analytics-avg-time').textContent = '-';
    document.getElementById('analytics-ontime-rate').textContent = '-';
    document.getElementById('analytics-active-orders').textContent = 'Loading...';
    document.getElementById('analytics-recent-deliveries').innerHTML = '<div style="color:#6b7280;">Loading...</div>';
    
    try {
        const analytics = await getRiderAnalytics(riderId);
        
        document.getElementById('analytics-total-deliveries').textContent = analytics.totalDeliveries;
        document.getElementById('analytics-avg-time').textContent = analytics.avgDeliveryTime > 0 ? `${analytics.avgDeliveryTime}m` : '-';
        document.getElementById('analytics-ontime-rate').textContent = `${analytics.onTimeRate}%`;
        document.getElementById('analytics-active-orders').textContent = analytics.activeOrders;
        
        // Display recent deliveries
        const recentEl = document.getElementById('analytics-recent-deliveries');
        if (analytics.recentDeliveries.length > 0) {
            recentEl.innerHTML = analytics.recentDeliveries.map(order => {
                const created = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
                const date = created.toLocaleDateString();
                return `
                    <div style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);padding:10px;border-radius:8px;font-size:12px;">
                        <div style="font-weight:700;color:#F5A800;">${order.orderId || 'N/A'}</div>
                        <div style="color:#9ca3af;margin-top:4px;">₹${order.total || 0} • ${date}</div>
                    </div>
                `;
            }).join('');
        } else {
            recentEl.innerHTML = '<div style="color:#6b7280;">No deliveries yet</div>';
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        document.getElementById('analytics-recent-deliveries').innerHTML = '<div style="color:#ef4444;">Error loading data</div>';
    }
};

// Calculate online duration in hours
const calculateOnlineDuration = (rider) => {
    if (!rider.isOnline) return null;
    
    const lastOnlineAt = rider.lastOnlineAt?.toDate ? rider.lastOnlineAt.toDate() : new Date(rider.lastOnlineAt);
    if (!lastOnlineAt) return null;
    
    const now = new Date();
    const diffMs = now - lastOnlineAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
        return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
};

// Get last offline time for display
const getLastOfflineTime = (rider) => {
    if (rider.isOnline) return null;
    
    const lastOfflineAt = rider.lastOfflineAt?.toDate ? rider.lastOfflineAt.toDate() : new Date(rider.lastOfflineAt);
    if (!lastOfflineAt) return 'Unknown';
    
    const now = new Date();
    const diffMs = now - lastOfflineAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
};

const renderRiders = async (riders) => {
    if (!ridersContainer) return;
    ridersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">Loading rider data...</div>';
    
    try {
        // Fetch delivery stats for all riders in parallel
        const riderDataPromises = riders.map(async (r) => {
            const deliveryCount = await getRiderDeliveryStats(r.id);
            return { ...r, deliveryCount };
        });
        
        const ridersWithStats = await Promise.all(riderDataPromises);
        
        // Sort by online status first, then by name
        const sorted = ridersWithStats.sort((a, b) => {
            if (a.isOnline !== b.isOnline) return b.isOnline ? 1 : -1;
            return (a.name || '').localeCompare(b.name || '');
        });
        
        ridersContainer.innerHTML = sorted.map(r => {
            const status = r.isOnline ? 'Online' : 'Offline';
            const statusColor = r.isOnline ? '#10B981' : '#ef4444';
            const statusBg = r.isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
            
            let duration = '';
            if (r.isOnline) {
                const onlineTime = calculateOnlineDuration(r);
                duration = onlineTime ? `Online for ${onlineTime}` : 'Recently online';
            } else {
                const offlineTime = getLastOfflineTime(r);
                duration = `Last online ${offlineTime}`;
            }
            
            const deliveries = r.deliveryCount || 0;
            const phone = r.phone ? `<a href="tel:${r.phone}" style="color:#10B981;text-decoration:none;font-weight:600;">${r.phone}</a>` : 'No phone';
            
            return `
                <div style="background: linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(26,28,35,1) 100%); border: 1px solid #252830; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; hover: border-color: #F5A800; transition: all 0.3s;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #F5A800, #c47f17); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;">🛵</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 2px;">${r.name || 'Unknown'}</div>
                            <div style="font-size: 12px; color: #9ca3af; word-break: break-all;">${phone}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; background: ${statusBg}; padding: 8px 12px; border-radius: 8px; border: 1px solid ${statusColor};">
                        <span style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%; animation: ${r.isOnline ? 'pulse' : 'none'} 2s infinite;"></span>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; font-weight: 700; color: ${statusColor};">${status}</div>
                            <div style="font-size: 10px; color: ${statusColor}; opacity: 0.8;">${duration}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 900; color: #F5A800;">${deliveries}</div>
                            <div style="font-size: 10px; color: #F5A800; font-weight: 600; margin-top: 2px; text-transform: uppercase;">Delivered</div>
                        </div>
                        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); padding: 10px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 18px; font-weight: 900; color: #3b82f6;">${r.email ? r.email.split('@')[0] : 'N/A'}</div>
                            <div style="font-size: 10px; color: #3b82f6; font-weight: 600; margin-top: 2px; text-transform: uppercase;">User ID</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <button onclick="alert('Chat feature coming soon!')" style="flex: 1; padding: 8px 12px; background: #374151; color: #fff; border: 1px solid #4b5563; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">💬 Contact</button>
                        <button onclick="openRiderAnalytics('${r.uid}', '${r.name}')" style="flex: 1; padding: 8px 12px; background: #374151; color: #fff; border: 1px solid #4b5563; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">📊 Analytics</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add pulse animation for online indicator
        if (!document.querySelector('style[data-rider-pulse]')) {
            const style = document.createElement('style');
            style.setAttribute('data-rider-pulse', 'true');
            style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }';
            document.head.appendChild(style);
        }
    } catch (error) {
        console.error('Error rendering riders:', error);
        ridersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Error loading riders. Please try again.</div>';
    }
};

/**
 * 📊 Insights & Charts
 */
const loadDashboardAnalytics = async () => {
    const data = await fetchAnalyticsData();
    
    const renderInsights = (selector) => {
        const container = document.querySelector(selector);
        if (!container) return;
        if (selector.includes('items')) {
            const sorted = Object.entries(data.topItems).sort((a,b) => b[1] - a[1]).slice(0, 5);
            container.innerHTML = sorted.map(([name, qty]) => `
                <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                    <span class="text-xs text-gray-300 font-medium">${name}</span>
                    <span class="text-xs font-black text-accent">${qty} SOLD</span>
                </div>
            `).join('');
        } else {
            const sorted = Object.values(data.customers).sort((a,b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5);
            container.innerHTML = sorted.map(c => `
                <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                    <span class="text-xs text-gray-300 font-medium">${c.name}</span>
                    <span class="text-xs font-black text-white">₹${c.revenue || 0}</span>
                </div>
            `).join('');
        }
    };

    renderInsights('#top-items-list');
    renderInsights('#analytics-top-items-list');
    renderInsights('#top-customers-list');
    renderInsights('#analytics-top-customers-list');

    const dates = Object.keys(data.dailyStats).sort();
    const revs = dates.map(d => data.dailyStats[d].revenue);
    const ords = dates.map(d => data.dailyStats[d].orders);
    
    renderMinimalChart('revenue-chart', revs, '#F5A800');
    renderMinimalChart('orders-chart', ords, '#3B82F6');
    renderMinimalChart('analytics-revenue-chart', revs, '#F5A800');
    renderMinimalChart('analytics-orders-chart', ords, '#3B82F6');
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
            window.location.href = '/login';
        }
    });
    // Note: header avatar dropdown logout is wired in setupProfileDropdown()
};

// Fire it up
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

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
        const usageInfo = c.maxUses > 0 ? `${c.usedCount || 0}/${c.maxUses} used` : 'Unlimited uses';

        // Generate display text based on coupon type
        let couponDetails = '';
        switch (c.type) {
            case 'percentage':
                couponDetails = `${c.discountPercent}% OFF${c.maxDiscount ? ` (Max ₹${c.maxDiscount})` : ''}`;
                break;
            case 'flat':
                couponDetails = `₹${c.discountAmount} OFF`;
                break;
            case 'freebie':
                couponDetails = `Free ${c.freeItemName}${c.freeItemQuantity > 1 ? ` x${c.freeItemQuantity}` : ''}`;
                break;
            case 'special_price':
                couponDetails = `${c.productName} @ ₹${c.offerPrice}`;
                break;
            case 'combo_upgrade':
                couponDetails = `${c.upgradeDescription}`;
                break;
            default:
                // Backward compatibility
                couponDetails = `₹${c.discountAmount} OFF`;
                break;
        }

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#0d0f14;border:1px solid #252830;border-radius:14px;">
                <div>
                    <p style="font-weight:900;color:#F5A800;font-size:15px;letter-spacing:1px;">${c.id} | ${couponDetails}</p>
                    <p style="font-size:12px;color:#9ca3af;margin-top:4px;">${c.description || 'No description'} &nbsp;|&nbsp; Min Order: ₹${c.minOrderValue || 0}</p>
                    <p style="font-size:11px;color:#7a8098;margin-top:2px;">Type: ${c.type || 'flat'} &nbsp;|&nbsp; ${usageInfo} &nbsp;|&nbsp; Expires: ${expiry}</p>
                    ${isExpired ? '<span style="font-size:10px;font-weight:800;color:#ef4444;text-transform:uppercase;">EXPIRED</span>' : (c.active !== false ? '<span style="font-size:10px;font-weight:800;color:#10B981;text-transform:uppercase;">ACTIVE</span>' : '<span style="font-size:10px;font-weight:800;color:#7a8098;text-transform:uppercase;">INACTIVE</span>')}
                    ${c.autoApply ? '<span style="font-size:10px;font-weight:800;color:#3B82F6;text-transform:uppercase;margin-left:8px;">AUTO</span>' : ''}
                    ${c.stackable ? '<span style="font-size:10px;font-weight:800;color:#8B5CF6;text-transform:uppercase;margin-left:8px;">STACKABLE</span>' : ''}
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button onclick="window.adminEditCoupon('${c.id}')" style="padding:8px 16px;background:#374151;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Edit</button>
                    <button onclick="window.adminDeleteCoupon('${c.id}')" style="padding:8px 16px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;">Delete</button>
                </div>
            </div>
        `;
    }).join('');
};

const updateCouponTypeFields = () => {
    const typeSelect = document.querySelector('#new-coupon-type');
    const typeFields = document.querySelector('#coupon-type-fields');
    if (!typeSelect || !typeFields) return;

    const selectedType = typeSelect.value;
    let fieldsHTML = '';

    switch (selectedType) {
        case 'percentage':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Discount %</label>
                        <input id="new-coupon-discount-percent" type="number" placeholder="e.g. 15" min="1" max="100" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Max Discount (₹)</label>
                        <input id="new-coupon-max-discount" type="number" placeholder="e.g. 100" min="0" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Min Guaranteed (₹) - Optional</label>
                        <input id="new-coupon-min-guaranteed" type="number" placeholder="e.g. 30" min="0" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;

        case 'flat':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Flat Discount (₹)</label>
                        <input id="new-coupon-discount-amount" type="number" placeholder="e.g. 50" min="1" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;

        case 'freebie':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Free Item Name</label>
                        <input id="new-coupon-free-item" type="text" placeholder="e.g. Coke" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Quantity</label>
                        <input id="new-coupon-free-quantity" type="number" placeholder="e.g. 1" min="1" value="1" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;

        case 'special_price':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Product Name</label>
                        <input id="new-coupon-product-name" type="text" placeholder="e.g. Pizza" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Offer Price (₹)</label>
                        <input id="new-coupon-offer-price" type="number" placeholder="e.g. 99" min="1" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;

        case 'combo_upgrade':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Upgrade Description</label>
                        <input id="new-coupon-upgrade-desc" type="text" placeholder="e.g. Upgrade drink for ₹29" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Upgrade Price (₹)</label>
                        <input id="new-coupon-upgrade-price" type="number" placeholder="e.g. 29" min="0" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;
    }

    typeFields.innerHTML = fieldsHTML;

    // Move both operations into the same setTimeout so inputs exist when description runs
    setTimeout(() => {
        const inputs = typeFields.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', autoGenerateCouponDescription);
        });
        autoGenerateCouponDescription();
    }, 50);
};

// Generate coupon description based on form values
const generateCouponDescription = () => {
    const typeSelect = document.querySelector('#new-coupon-type');
    const minOrderInput = document.querySelector('#new-coupon-min');

    if (!typeSelect || !minOrderInput) return '';

    const type = typeSelect.value;
    const minOrder = parseInt(minOrderInput.value) || 0;
    let autoDesc = '';

    switch (type) {
        case 'percentage':
            const percent = document.querySelector('#new-coupon-discount-percent')?.value;
            const maxDisc = document.querySelector('#new-coupon-max-discount')?.value;
            if (percent) {
                autoDesc = `Get upto ${percent}% OFF`;
                if (maxDisc && maxDisc > 0) {
                    autoDesc += ` (Max ₹${maxDisc})`;
                }
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'flat':
            const flatAmount = document.querySelector('#new-coupon-discount-amount')?.value;
            if (flatAmount) {
                autoDesc = `Get ₹${flatAmount} OFF`;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'freebie':
            const freeItem = document.querySelector('#new-coupon-free-item')?.value;
            const quantity = document.querySelector('#new-coupon-free-quantity')?.value || 1;
            if (freeItem) {
                autoDesc = `Get Free ${freeItem}`;
                if (quantity > 1) {
                    autoDesc += ` x${quantity}`;
                }
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'special_price':
            const productName = document.querySelector('#new-coupon-product-name')?.value;
            const offerPrice = document.querySelector('#new-coupon-offer-price')?.value;
            if (productName && offerPrice) {
                autoDesc = `Unlock ${productName} @ ₹${offerPrice}`;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'combo_upgrade':
            const upgradeDesc = document.querySelector('#new-coupon-upgrade-desc')?.value;
            if (upgradeDesc) {
                autoDesc = upgradeDesc;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;
    }

    return autoDesc;
};

const resetCouponForm = () => {
    const inputs = [
        '#new-coupon-code', '#new-coupon-min',
        '#new-coupon-max-uses', '#new-coupon-expiry', '#new-coupon-type'
    ];

    inputs.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.value = '';
    });

    // Reset checkboxes
    const autoApply = document.querySelector('#new-coupon-auto-apply');
    const stackable = document.querySelector('#new-coupon-stackable');
    if (autoApply) autoApply.checked = false;
    if (stackable) stackable.checked = false;

    // Clear type-specific fields
    const typeFields = document.querySelector('#coupon-type-fields');
    if (typeFields) typeFields.innerHTML = '';

    // Reset form state
    editingCouponCode = null;
    const codeInput = document.querySelector('#new-coupon-code');
    const msg = document.querySelector('#coupon-create-msg');
    const cancelBtn = document.querySelector('#cancel-coupon-edit-btn');
    const createBtn = document.querySelector('#create-coupon-btn');

    if (codeInput) codeInput.disabled = false;
    if (msg) { msg.textContent = ''; msg.style.color = ''; }
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (createBtn) createBtn.textContent = 'Create Coupon';

    // Re-initialize type fields for default type
    updateCouponTypeFields();
};

const setupCouponAdmin = () => {
    const createBtn = document.querySelector('#create-coupon-btn');
    const cancelBtn = document.querySelector('#cancel-coupon-edit-btn');
    const typeSelect = document.querySelector('#new-coupon-type');
    if (!createBtn) return;
    if (createBtn.dataset.initialized === 'true') return;
    createBtn.dataset.initialized = 'true';

    // Initialize type fields on load
    updateCouponTypeFields();

    // Update fields when type changes
    typeSelect?.addEventListener('change', updateCouponTypeFields);

    const populateForm = (coupon) => {
        const codeInput = document.querySelector('#new-coupon-code');
        const typeSelect = document.querySelector('#new-coupon-type');
        const minInput = document.querySelector('#new-coupon-min');
        const maxUsesInput = document.querySelector('#new-coupon-max-uses');
        const expiryInput = document.querySelector('#new-coupon-expiry');
        const autoApplyInput = document.querySelector('#new-coupon-auto-apply');
        const stackableInput = document.querySelector('#new-coupon-stackable');
        const msg = document.querySelector('#coupon-create-msg');

        editingCouponCode = coupon.id;
        if (codeInput) { codeInput.value = coupon.id; codeInput.disabled = true; }
        if (typeSelect) typeSelect.value = coupon.type || 'flat';
        if (minInput) minInput.value = coupon.minOrderValue || 0;
        if (maxUsesInput) maxUsesInput.value = coupon.maxUses || 0;
        if (expiryInput) expiryInput.value = coupon.expiresAt ? new Date(coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt)).toISOString().slice(0,16) : '';
        if (autoApplyInput) autoApplyInput.checked = coupon.autoApply || false;
        if (stackableInput) stackableInput.checked = coupon.stackable || false;

        // Update type fields and populate type-specific values
        updateCouponTypeFields();

        // Populate type-specific fields
        setTimeout(() => {
            switch (coupon.type) {
                case 'percentage':
                    document.querySelector('#new-coupon-discount-percent').value = coupon.discountPercent || '';
                    document.querySelector('#new-coupon-max-discount').value = coupon.maxDiscount || '';
                    document.querySelector('#new-coupon-min-guaranteed').value = coupon.minGuaranteedDiscount || '';
                    break;
                case 'flat':
                    document.querySelector('#new-coupon-discount-amount').value = coupon.discountAmount || '';
                    break;
                case 'freebie':
                    document.querySelector('#new-coupon-free-item').value = coupon.freeItemName || '';
                    document.querySelector('#new-coupon-free-quantity').value = coupon.freeItemQuantity || 1;
                    break;
                case 'special_price':
                    document.querySelector('#new-coupon-product-name').value = coupon.productName || '';
                    document.querySelector('#new-coupon-offer-price').value = coupon.offerPrice || '';
                    break;
                case 'combo_upgrade':
                    document.querySelector('#new-coupon-upgrade-desc').value = coupon.upgradeDescription || '';
                    document.querySelector('#new-coupon-upgrade-price').value = coupon.upgradePrice || '';
                    break;
            }
        }, 10);

        if (msg) { msg.textContent = `Editing coupon ${coupon.id}. Update the values and save.`; msg.style.color = '#F59E0B'; }
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        createBtn.textContent = 'Update Coupon';
    };

    cancelBtn?.addEventListener('click', () => resetCouponForm());

    createBtn.addEventListener('click', async () => {
        const code = document.querySelector('#new-coupon-code')?.value.trim();
        const type = document.querySelector('#new-coupon-type')?.value;
        const minOrder = parseInt(document.querySelector('#new-coupon-min')?.value || '0');
        const maxUses = parseInt(document.querySelector('#new-coupon-max-uses')?.value || '0');
        const expiryVal = document.querySelector('#new-coupon-expiry')?.value;
        const autoApply = document.querySelector('#new-coupon-auto-apply')?.checked || false;
        const stackable = document.querySelector('#new-coupon-stackable')?.checked || false;
        const msg = document.querySelector('#coupon-create-msg');
        const isEditing = editingCouponCode !== null;

        // Generate description from form values
        const description = generateCouponDescription();

        if (!code) {
            if (msg) { msg.textContent = 'Coupon code is required.'; msg.style.color = '#ef4444'; }
            return;
        }

        // Description is optional now
        // if (!description) {
        //     if (msg) { msg.textContent = 'Please fill in all required coupon details to generate a description.'; msg.style.color = '#ef4444'; }
        //     return;
        // }

        try {
            createBtn.textContent = isEditing ? 'Updating...' : 'Creating...';
            createBtn.disabled = true;

            const couponPayload = {
                code,
                type,
                description,
                minOrderValue: minOrder,
                maxUses,
                expiresAt: expiryVal ? new Date(expiryVal) : null,
                autoApply,
                stackable
            };

            // Add type-specific fields
            switch (type) {
                case 'percentage':
                    couponPayload.discountPercent = parseInt(document.querySelector('#new-coupon-discount-percent')?.value || '0');
                    couponPayload.maxDiscount = parseInt(document.querySelector('#new-coupon-max-discount')?.value || '0');
                    couponPayload.minGuaranteedDiscount = parseInt(document.querySelector('#new-coupon-min-guaranteed')?.value || '0');
                    break;
                case 'flat':
                    couponPayload.discountAmount = parseInt(document.querySelector('#new-coupon-discount-amount')?.value || '0');
                    break;
                case 'freebie':
                    couponPayload.freeItemName = document.querySelector('#new-coupon-free-item')?.value.trim() || '';
                    couponPayload.freeItemQuantity = parseInt(document.querySelector('#new-coupon-free-quantity')?.value || '1');
                    break;
                case 'special_price':
                    couponPayload.productName = document.querySelector('#new-coupon-product-name')?.value.trim() || '';
                    couponPayload.offerPrice = parseInt(document.querySelector('#new-coupon-offer-price')?.value || '0');
                    break;
                case 'combo_upgrade':
                    couponPayload.upgradeDescription = document.querySelector('#new-coupon-upgrade-desc')?.value.trim() || '';
                    couponPayload.upgradePrice = parseInt(document.querySelector('#new-coupon-upgrade-price')?.value || '0');
                    break;
            }

            // Validate type-specific coupon details
            const validationErrors = [];
            switch (type) {
                case 'percentage':
                    if (!couponPayload.discountPercent || couponPayload.discountPercent <= 0) validationErrors.push('Discount % is required.');
                    break;
                case 'flat':
                    if (!couponPayload.discountAmount || couponPayload.discountAmount <= 0) validationErrors.push('Flat discount amount is required.');
                    break;
                case 'freebie':
                    if (!couponPayload.freeItemName) validationErrors.push('Free item name is required.');
                    if (!couponPayload.freeItemQuantity || couponPayload.freeItemQuantity <= 0) validationErrors.push('Free item quantity must be at least 1.');
                    break;
                case 'special_price':
                    if (!couponPayload.productName) validationErrors.push('Product name is required.');
                    if (!couponPayload.offerPrice || couponPayload.offerPrice <= 0) validationErrors.push('Offer price is required.');
                    break;
                case 'combo_upgrade':
                    if (!couponPayload.upgradeDescription) validationErrors.push('Upgrade description is required.');
                    if (couponPayload.upgradePrice < 0) validationErrors.push('Upgrade price cannot be negative.');
                    break;
            }

            if (validationErrors.length > 0) {
                if (msg) { msg.textContent = validationErrors[0]; msg.style.color = '#ef4444'; }
                createBtn.textContent = isEditing ? 'Update Coupon' : 'Create Coupon';
                createBtn.disabled = false;
                return;
            }

            if (isEditing) {
                await updateCoupon(couponPayload);
                if (msg) { msg.textContent = `✅ Coupon "${code.toUpperCase()}" updated!`; msg.style.color = '#10B981'; }
            } else {
                await createCoupon(couponPayload);
                if (msg) { msg.textContent = `✅ Coupon "${code.toUpperCase()}" created!`; msg.style.color = '#10B981'; }
            }

            resetCouponForm();
            loadCoupons();
        } catch (e) {
            console.error('Coupon operation error:', e);
            if (msg) { msg.textContent = isEditing ? 'Failed to update coupon. Try again.' : 'Failed to create coupon. Try again.'; msg.style.color = '#ef4444'; }
        } finally {
            createBtn.textContent = isEditing ? 'Update Coupon' : 'Create Coupon';
            createBtn.disabled = false;
        }
    });
};

window.adminEditCoupon = async (code) => {
    try {
        const coupons = await fetchAllCoupons();
        const coupon = coupons.find(c => c.id === code);
        if (!coupon) return;

        const cancelBtn = document.querySelector('#cancel-coupon-edit-btn');
        const createBtn = document.querySelector('#create-coupon-btn');
        const msg = document.querySelector('#coupon-create-msg');

        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        if (createBtn) createBtn.textContent = 'Update Coupon';
        if (msg) { msg.textContent = `Editing coupon ${code}. Update and save.`; msg.style.color = '#F59E0B'; }

        const codeInput = document.querySelector('#new-coupon-code');
        const typeSelect = document.querySelector('#new-coupon-type');
        const minInput = document.querySelector('#new-coupon-min');
        const maxUsesInput = document.querySelector('#new-coupon-max-uses');
        const expiryInput = document.querySelector('#new-coupon-expiry');
        const autoApplyInput = document.querySelector('#new-coupon-auto-apply');
        const stackableInput = document.querySelector('#new-coupon-stackable');

        editingCouponCode = code;
        if (codeInput) { codeInput.value = code; codeInput.disabled = true; }
        if (typeSelect) typeSelect.value = coupon.type || 'flat';
        if (minInput) minInput.value = coupon.minOrderValue || 0;
        if (maxUsesInput) maxUsesInput.value = coupon.maxUses || 0;
        if (expiryInput) expiryInput.value = coupon.expiresAt ? new Date(coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt)).toISOString().slice(0,16) : '';
        if (autoApplyInput) autoApplyInput.checked = coupon.autoApply || false;
        if (stackableInput) stackableInput.checked = coupon.stackable || false;

        // Update type fields and populate type-specific values
        updateCouponTypeFields();

        // Populate type-specific fields
        setTimeout(() => {
            switch (coupon.type) {
                case 'percentage':
                    document.querySelector('#new-coupon-discount-percent').value = coupon.discountPercent || '';
                    document.querySelector('#new-coupon-max-discount').value = coupon.maxDiscount || '';
                    document.querySelector('#new-coupon-min-guaranteed').value = coupon.minGuaranteedDiscount || '';
                    break;
                case 'flat':
                    document.querySelector('#new-coupon-discount-amount').value = coupon.discountAmount || '';
                    break;
                case 'freebie':
                    document.querySelector('#new-coupon-free-item').value = coupon.freeItemName || '';
                    document.querySelector('#new-coupon-free-quantity').value = coupon.freeItemQuantity || 1;
                    break;
                case 'special_price':
                    document.querySelector('#new-coupon-product-name').value = coupon.productName || '';
                    document.querySelector('#new-coupon-offer-price').value = coupon.offerPrice || '';
                    break;
                case 'combo_upgrade':
                    document.querySelector('#new-coupon-upgrade-desc').value = coupon.upgradeDescription || '';
                    document.querySelector('#new-coupon-upgrade-price').value = coupon.upgradePrice || '';
                    break;
            }
        }, 10);
    } catch (e) {
        console.error('Edit coupon failed:', e);
    }
};

window.adminDeleteCoupon = async (code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
        await deleteCoupon(code);
        resetCouponForm();
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
        // Support both old imageUrl and new image field for backward compatibility
        const imageSource = a.image || a.imageUrl;
        return `
            <div style="display:flex;align-items:center;gap:16px;padding:14px 18px;background:#0d0f14;border:1px solid #252830;border-radius:14px;">
                ${imageSource ? `<img src="${imageSource}" style="width:80px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;">` : '<div style="width:80px;height:56px;background:#1a1c23;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:24px;">📢</div>'}
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
            createBtn.textContent = 'Publishing...';
            createBtn.disabled = true;

            await createAnnouncement(imageFile, {
                title,
                expiresAt: expiryVal ? new Date(expiryVal) : null,
                active: true
            });

            if (msg) {
                const fileName = imageFile ? imageFile.name.toLowerCase().replace(/\s+/g, '-') : 'announcement';
                const instructions = imageFile ? `✅ Announcement created! Upload "${fileName}" to public/images/announcements/ folder.` : '✅ Announcement published!';
                msg.textContent = instructions;
                msg.style.color = '#10B981';
            }
            // Reset
            if (document.querySelector('#ann-title')) document.querySelector('#ann-title').value = '';
            if (document.querySelector('#ann-expiry')) document.querySelector('#ann-expiry').value = '';
            if (imageInput) imageInput.value = '';
            if (preview) preview.style.display = 'none';
            loadAnnouncements();
        } catch (e) {
            if (msg) { msg.textContent = 'Error creating announcement. Check browser console.'; msg.style.color = '#ef4444'; }
            console.error('Create announcement failed:', e);
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

/**
 * 📊 COUPON ANALYTICS (Phase 4)
 */
let currentAnalyticsPeriod = 30; // Default to 30 days

const setupAnalyticsAdmin = () => {
    // Period selector buttons
    const period7Btn = document.querySelector('#analytics-period-7');
    const period30Btn = document.querySelector('#analytics-period-30');
    const period90Btn = document.querySelector('#analytics-period-90');

    if (period7Btn) period7Btn.addEventListener('click', () => setAnalyticsPeriod(7));
    if (period30Btn) period30Btn.addEventListener('click', () => setAnalyticsPeriod(30));
    if (period90Btn) period90Btn.addEventListener('click', () => setAnalyticsPeriod(90));

    // Load initial analytics
    loadCouponAnalytics();
};

const setAnalyticsPeriod = (days) => {
    currentAnalyticsPeriod = days;

    // Update button states
    const buttons = document.querySelectorAll('#analytics-period-7, #analytics-period-30, #analytics-period-90');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.querySelector(`#analytics-period-${days}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Reload analytics
    loadCouponAnalytics();
};

const loadCouponAnalytics = async () => {
    try {
        const analytics = await getCouponAnalytics(currentAnalyticsPeriod);

        // Update KPI cards
        updateCouponKPIs(analytics);

        // Update top coupons list
        updateTopCouponsList(analytics);

        // Update coupon analytics table
        updateCouponAnalyticsTable(analytics);

        // Show fraud alerts if any
        showFraudAlerts(analytics.fraudIndicators);

    } catch (error) {
        console.error('Error loading coupon analytics:', error);
        showAnalyticsError('Failed to load coupon analytics. Please try again.');
    }
};

const updateCouponKPIs = (analytics) => {
    const revenueSavedEl = document.querySelector('#coupon-revenue-saved');
    const usageCountEl = document.querySelector('#coupon-usage-count');
    const conversionRateEl = document.querySelector('#coupon-conversion-rate');
    const fakeAttemptsEl = document.querySelector('#coupon-fake-attempts');

    if (revenueSavedEl) revenueSavedEl.textContent = `₹${analytics.summary.totalRevenueSaved.toLocaleString()}`;
    if (usageCountEl) usageCountEl.textContent = analytics.summary.totalUsage.toLocaleString();
    if (conversionRateEl) conversionRateEl.textContent = `${analytics.summary.conversionRate.toFixed(1)}%`;
    if (fakeAttemptsEl) fakeAttemptsEl.textContent = analytics.summary.totalAttempts - analytics.summary.totalUsage;
};

const updateTopCouponsList = async (analytics) => {
    const container = document.querySelector('#analytics-top-coupons-list');
    if (!container) return;

    try {
        const topCoupons = await getTopCoupons(currentAnalyticsPeriod, 'usage', 5);

        if (topCoupons.length === 0) {
            container.innerHTML = '<div class="insight-item">No coupon usage data available</div>';
            return;
        }

        container.innerHTML = topCoupons.map((coupon, index) => `
            <div class="insight-item">
                <div class="insight-rank">#${index + 1}</div>
                <div class="insight-content">
                    <div class="insight-title">${coupon.code}</div>
                    <div class="insight-meta">${coupon.usageCount} uses • ₹${coupon.revenueSaved} saved</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading top coupons:', error);
        container.innerHTML = '<div class="insight-item">Error loading top coupons</div>';
    }
};

const updateCouponAnalyticsTable = (analytics) => {
    const tableBody = document.querySelector('#coupon-analytics-table-body');
    if (!tableBody) return;

    const coupons = Object.entries(analytics.coupons);

    if (coupons.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-gray-500">No coupon data available for this period</td></tr>';
        return;
    }

    // Sort by usage count descending
    coupons.sort((a, b) => b[1].usageCount - a[1].usageCount);

    tableBody.innerHTML = coupons.map(([code, data]) => {
        const efficiency = data.usageCount > 0 ? (data.revenueSaved / data.usageCount).toFixed(1) : '0.0';
        const lastUsed = data.lastUsed ? new Date(data.lastUsed.toDate()).toLocaleDateString() : 'Never';
        const attemptCount = data.attemptCount || 0;

        return `
            <tr>
                <td><strong>${code}</strong></td>
                <td><span class="table-badge">${data.type || 'flat'}</span></td>
                <td>${data.usageCount}</td>
                <td>₹${data.revenueSaved}</td>
                <td>₹${efficiency}</td>
                <td>${data.usageCount + attemptCount > 0 ? ((data.usageCount / (data.usageCount + attemptCount)) * 100).toFixed(1) : 0}%</td>
                <td>${attemptCount}</td>
                <td>${lastUsed}</td>
            </tr>
        `;
    }).join('');
};

const showFraudAlerts = (fraudIndicators) => {
    const alertEl = document.querySelector('#fraud-alert');
    const alertContent = document.querySelector('#fraud-alert-content');

    if (!alertEl || !alertContent) return;

    if (fraudIndicators.length === 0) {
        alertEl.style.display = 'none';
        return;
    }

    const alertText = fraudIndicators.map(indicator =>
        `🚨 ${indicator.couponCode}: ${indicator.attempts} suspicious attempts detected`
    ).join('<br>');

    alertContent.innerHTML = alertText;
    alertEl.style.display = 'block';
};

const showAnalyticsError = (message) => {
    // Show error in the analytics view
    const container = document.querySelector('#view-analytics');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'admin-card p-6 rounded-3xl border border-red-700 bg-red-900/20 text-red-100 mt-6';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);

        // Remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }
};

