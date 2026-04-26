import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where, Timestamp, getDocs, limit, addDoc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase/config';
import { onAuthChange, logoutUser, getUserRole, isAdminOrManager } from './api/auth';
import { fetchAllUsers, fetchUsersByRole, updateUserRole } from './api/users';
import { assignRiderToOrder, updateOrderDetails } from './api/orders';
import { fetchAnalyticsData } from './api/analytics';
import { ORDER_STATUS } from './constants/orderStatus';
import { fetchAllCoupons, createCoupon, updateCoupon, deleteCoupon, getCouponAnalytics, getTopCoupons, getCouponTimeline } from './api/coupons';
import { fetchAllAnnouncements, createAnnouncement, toggleAnnouncementActive, deleteAnnouncement } from './api/announcements';
import { createMenuItem, updateMenuItem, deleteMenuItem } from './api/menu';
import Chart from 'chart.js/auto';
import toast from './ui/toast';
import ImageUploader from './ui/image-uploader';
import { initializeAdminUIEnhancements, showToast, showCustomModal } from './admin-ui-enhancements';
import { showPersistentNotification } from './utils/notification-manager';

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
let currentMenuStatus = 'all';
let currentMenuType = 'all';
let currentMenuStock = 'all';
let editingMenuItemId = null;
let editingCouponCode = null;

// ─────────────────────────────────────────────
// Mobile Sidebar Toggle Handler
// ─────────────────────────────────────────────
const initMobileSidebarToggle = () => {
    const toggle = document.getElementById('admin-mobile-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');
    
    if (!toggle || !sidebar) return;
    
    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    };
    
    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
    };
    
    // Toggle button click
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    
    // Overlay click to close
    overlay.addEventListener('click', closeSidebar);
    
    // Nav item click to close sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
};

// Performance optimizations (Task 6.4)
const ITEMS_PER_PAGE = 20;
let currentMenuPage = 1;
let menuListCache = new Map();
let chartsLoadedFlags = {};

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
        setupDashboardCardHandlers();

        // Load riders FIRST, then start order listener
        Promise.all([
            fetchUsersByRole('rider'),
            loadCustomers(),
            loadDashboardAnalytics()
        ]).then(([riders]) => {
            ridersList = riders;
            renderRiders(riders);
            
            // Start order listener AFTER riders are loaded
            startOrderListener();
            
            // Re-render orders to show rider dropdowns
            renderOrders();
        });

        setupLogout();
        setupAnnouncementAdmin();
        setupNotificationBell();
        initializeAdminUIEnhancements();
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
    document.getElementById('admin-dd-storefront')?.addEventListener('click', function () {
        window.location.href = '/customer/index.html';
    });
    document.getElementById('admin-dd-rider')?.addEventListener('click', function () {
        window.location.href = '/rider/index.html';
    });

    // Logout
    document.getElementById(logoutId)?.addEventListener('click', async function () {
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
    const validViews = ['dashboard', 'orders', 'tickets', 'customers', 'menu', 'analytics', 'riders', 'coupons', 'announcements', 'settings'];
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
    const validViews = ['dashboard', 'orders', 'tickets', 'customers', 'menu', 'analytics', 'riders', 'coupons', 'announcements', 'settings'];
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
    if (viewName === 'settings') initSettings();
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
    if (menuViewInitialized) {
        startMenuListener();
        return;
    }
    menuViewInitialized = true;

    initMenuForm();

    // Initialize ImageUploader only if container exists in HTML
    const uploaderContainer = document.getElementById('menu-image-uploader-container');
    if (uploaderContainer) {
        try {
            const imageUploader = new ImageUploader({
                container: uploaderContainer,
                onFileSelect: (file) => {
                    const menuImageInput = document.getElementById('menu-image');
                    if (menuImageInput) {
                        const dataTransfer = new DataTransfer();
                        if (file) dataTransfer.items.add(file);
                        menuImageInput.files = dataTransfer.files;
                    }
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => { window.menuImagePreviewUrl = e.target.result; };
                        reader.readAsDataURL(file);
                    }
                },
                currentImageUrl: null,
                label: 'Upload Item Photo'
            });
        } catch (e) {
            console.warn('ImageUploader init skipped:', e.message);
        }
    }

    startMenuListener();
    hideMenuFormPanel();
    setMenuMode('list');

    menuCategoryFilter?.addEventListener('change', (e) => {
        currentMenuCategory = e.target.value || 'all';
        menuListCache.clear(); // Clear cache on filter change (Performance optimization)
        renderMenuList();
    });

    // Advanced filters
    const menuStatusFilter = document.getElementById('menu-status-filter');
    const menuTypeFilter = document.getElementById('menu-type-filter');
    const menuStockFilter = document.getElementById('menu-stock-filter');

    menuStatusFilter?.addEventListener('change', (e) => {
        currentMenuStatus = e.target.value || 'all';
        menuListCache.clear(); // Clear cache on filter change
        renderMenuList();
    });

    menuTypeFilter?.addEventListener('change', (e) => {
        currentMenuType = e.target.value || 'all';
        menuListCache.clear(); // Clear cache on filter change
        renderMenuList();
    });

    menuStockFilter?.addEventListener('change', (e) => {
        currentMenuStock = e.target.value || 'all';
        menuListCache.clear(); // Clear cache on filter change
        renderMenuList();
    });

    menuSearchInput?.addEventListener('input', (e) => {
        menuSearchQuery = e.target.value.trim().toLowerCase();
        menuListCache.clear(); // Clear cache on search
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

// Module-level so renderMenuList() can also call it after re-rendering checkboxes
const updateBulkButtons = () => {
    const selectedCheckboxes = document.querySelectorAll('.menu-item-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;

    const selectedCountEl = document.getElementById('menu-selected-count');
    const bulkEditBtn = document.getElementById('menu-bulk-edit');
    const bulkDeleteBtn = document.getElementById('menu-bulk-delete');

    if (selectedCountEl) selectedCountEl.textContent = selectedCount;
    if (bulkEditBtn) {
        bulkEditBtn.disabled = selectedCount === 0;
        bulkEditBtn.classList.toggle('opacity-50', selectedCount === 0);
    }
    if (bulkDeleteBtn) {
        bulkDeleteBtn.disabled = selectedCount === 0;
        bulkDeleteBtn.classList.toggle('opacity-50', selectedCount === 0);
    }
};

const initMenuBulkOperations = () => {
    const selectAllCheckbox = document.getElementById('menu-select-all');
    const bulkSelectAllBtn = document.getElementById('menu-bulk-select-all');
    const bulkEditBtn = document.getElementById('menu-bulk-edit');
    const bulkDeleteBtn = document.getElementById('menu-bulk-delete');
    const selectedCountEl = document.getElementById('menu-selected-count');

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
        if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;  // Safe null guard
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

            // Update select all checkbox state with safe null guard
            if (selectAllCheckbox) {
                const allCheckboxes = document.querySelectorAll('.menu-item-checkbox');
                const checkedCheckboxes = document.querySelectorAll('.menu-item-checkbox:checked');
                selectAllCheckbox.checked = allCheckboxes.length > 0 && allCheckboxes.length === checkedCheckboxes.length;
                selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
            }
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

    if (menuItems.length > 0) {
        renderMenuCategories();
        renderMenuList();
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
        migrateMenuItemDefaults();
        menuListCache.clear();
        renderMenuCategories();
        renderMenuList();
    }, (error) => {
        console.warn('Menu listener error (connection issue?):', error.code, error.message);

        // Agar items pehle load ho chuke hain toh unhe hatao mat — sirf offline banner dikhao
        if (menuItems.length > 0) {
            // Items already rendered hain — bas ek soft warning dikhao
            const existingBanner = document.getElementById('menu-offline-banner');
            if (!existingBanner && menuListContainer) {
                const banner = document.createElement('div');
                banner.id = 'menu-offline-banner';
                banner.style.cssText = 'background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:10px 16px;margin-bottom:16px;font-size:12px;color:#F5A800;font-weight:600;display:flex;align-items:center;gap:8px;';
                banner.innerHTML = '⚠️ Internet connection lost. Showing last loaded data. <button onclick="window._retryMenuListener()" style="margin-left:auto;background:#F5A800;color:#000;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:800;cursor:pointer;">Retry</button>';
                menuListContainer.insertAdjacentElement('beforebegin', banner);
            }
            return; // Existing items preserve karo
        }

        // Pehli baar hi fail hua — error show karo
        if (menuListContainer) {
            menuListContainer.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:#F5A800;">
                    <div style="font-size:40px;margin-bottom:12px;">📡</div>
                    <p style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px;">Connection Lost</p>
                    <p style="font-size:13px;color:#7a8098;margin-bottom:16px;">Internet disconnected. Check your connection and retry.</p>
                    <button onclick="window._retryMenuListener()" 
                        style="background:#F5A800;color:#000;border:none;border-radius:10px;padding:10px 24px;font-size:13px;font-weight:800;cursor:pointer;">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    });
};

const setMenuMode = (mode) => {
    const listCard = document.getElementById('menu-list-card');
    const formPanel = document.getElementById('menu-form-panel');

    if (mode === 'form') {
        showMenuFormPanel();
    } else {
        hideMenuFormPanel();
    }
};

const loadTickets = async () => {
    if (!ticketsListContainer) return;
    ticketsListContainer.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${[1,2,3].map(() => `
                <div style="background:#12141b;border:1px solid #252830;border-radius:14px;padding:18px;animation:lwSkelPulse 1.4s ease infinite;">
                    <div style="height:12px;width:30%;background:#1e2130;border-radius:6px;margin-bottom:10px;"></div>
                    <div style="height:14px;width:55%;background:#1e2130;border-radius:6px;margin-bottom:14px;"></div>
                    <div style="height:10px;width:80%;background:#1e2130;border-radius:6px;"></div>
                </div>
            `).join('')}
        </div>
        <style>@keyframes lwSkelPulse{0%,100%{opacity:1}50%{opacity:.5}}</style>
    `;

    try {
        const ticketsRef = collection(db, 'tickets');
        const ticketsQuery = query(ticketsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ticketsQuery);
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderTickets(tickets);
    } catch (error) {
        console.error('Failed to load tickets:', error);
        ticketsListContainer.innerHTML = `
            <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.25);border-radius:14px;padding:18px;color:#f87171;font-size:13px;font-weight:600;">
                ⚠️ Failed to load tickets. Check Firestore rules.
            </div>
        `;
    }
};

const renderTickets = (tickets) => {
    if (!ticketsListContainer) return;

    // Inject ticket styles once
    if (!document.getElementById('lw-ticket-styles')) {
        const s = document.createElement('style');
        s.id = 'lw-ticket-styles';
        s.textContent = `
            .lw-ticket-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
            .lw-t-stat { background:#12141b; border:1px solid #252830; border-radius:12px; padding:12px 16px; }
            .lw-t-stat-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; margin-bottom:3px; }
            .lw-t-stat-label { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
            .lw-ticket-toolbar { display:flex; gap:8px; margin-bottom:12px; align-items:center; }
            .lw-ticket-search { flex:1; padding:8px 14px; border:1px solid #252830; border-radius:8px; background:#12141b; color:#e5e7eb; font-size:12px; outline:none; transition:border-color .15s; font-family:inherit; }
            .lw-ticket-search:focus { border-color:#F5A800; }
            .lw-ticket-search::placeholder { color:#6b7280; }
            .lw-tf-btn { padding:6px 14px; border-radius:20px; border:1px solid #252830; background:#12141b; font-size:11px; cursor:pointer; color:#9ca3af; font-weight:600; transition:all .15s; font-family:inherit; }
            .lw-tf-btn:hover { border-color:#374151; color:#e5e7eb; }
            .lw-tf-btn.active { background:#1e2130; color:#e5e7eb; border-color:#374151; font-weight:700; }
            .lw-ticket-cards { display:flex; flex-direction:column; gap:10px; }
            .lw-ticket-card { background:#12141b; border:1px solid #252830; border-radius:14px; padding:16px; transition:border-color .2s; position:relative; overflow:hidden; }
            .lw-ticket-card:hover { border-color:#374151; }
            .lw-ticket-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; }
            .lw-ticket-card.open::before { background:#ef4444; }
            .lw-ticket-card.resolved::before { background:#10b981; }
            .lw-tc-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
            .lw-tc-user { font-size:14px; font-weight:800; color:#fff; font-family:'Syne',sans-serif; margin-bottom:2px; }
            .lw-tc-order-id { font-size:10px; color:#6b7280; letter-spacing:.04em; }
            .lw-tc-badge { font-size:10px; padding:3px 10px; border-radius:20px; font-weight:700; border:1px solid transparent; white-space:nowrap; }
            .lw-tc-badge.open { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.3); }
            .lw-tc-badge.resolved { background:rgba(16,185,129,0.1); color:#34d399; border-color:rgba(16,185,129,0.3); }
            .lw-tc-badge.pending { background:rgba(245,168,0,0.1); color:#F5A800; border-color:rgba(245,168,0,0.3); }
            .lw-tc-category { display:inline-flex; align-items:center; gap:5px; font-size:10px; color:#9ca3af; background:#1e2130; border:1px solid #252830; padding:3px 10px; border-radius:20px; margin-bottom:8px; }
            .lw-tc-msg { font-size:12px; color:#9ca3af; line-height:1.6; margin-bottom:12px; border-left:2px solid #252830; padding-left:10px; }
            .lw-ticket-card.open .lw-tc-msg { border-left-color:rgba(239,68,68,0.4); }
            .lw-ticket-card.resolved .lw-tc-msg { border-left-color:rgba(16,185,129,0.3); }
            .lw-tc-footer { display:flex; align-items:center; justify-content:space-between; gap:10px; }
            .lw-tc-meta { font-size:10px; color:#6b7280; }
            .lw-tc-actions { display:flex; gap:6px; }
            .lw-tc-btn { padding:6px 14px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; border:1px solid transparent; transition:all .15s; font-family:inherit; }
            .lw-tc-btn.resolve { background:#10b981; color:#fff; border:none; }
            .lw-tc-btn.resolve:hover { opacity:.85; }
            .lw-tc-btn.view { background:#1e2130; border-color:#252830; color:#9ca3af; }
            .lw-tc-btn.view:hover { border-color:#374151; color:#e5e7eb; }
            .lw-tickets-empty { text-align:center; padding:48px 20px; color:#6b7280; }
            .lw-te-icon { width:52px; height:52px; background:#12141b; border:1px solid #252830; border-radius:14px; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:22px; }
            .lw-te-title { font-size:13px; color:#9ca3af; font-weight:600; margin-bottom:5px; font-family:'Syne',sans-serif; }
        `;
        document.head.appendChild(s);
    }

    if (!tickets || tickets.length === 0) {
        ticketsListContainer.innerHTML = `
            <div class="lw-tickets-empty">
                <div class="lw-te-icon">🎫</div>
                <div class="lw-te-title">No tickets found</div>
                <div style="font-size:11px;">All clear — no support requests yet</div>
            </div>
        `;
        return;
    }

    const openCount = tickets.filter(t => t.status !== 'resolved').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

    const categoryIcon = (issue = '') => {
        const i = issue.toLowerCase();
        if (i.includes('delivery') || i.includes('rider')) return '🛵';
        if (i.includes('wrong') || i.includes('item')) return '🍽️';
        if (i.includes('late') || i.includes('time')) return '⏱️';
        if (i.includes('payment') || i.includes('refund')) return '💳';
        return '📋';
    };

    const timeAgo = (ts) => {
        if (!ts?.seconds) return '—';
        const diff = Math.floor((Date.now() - ts.seconds * 1000) / 60000);
        if (diff < 60) return `${diff} min ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
        return `${Math.floor(diff / 1440)} days ago`;
    };

    ticketsListContainer.innerHTML = `
        <div class="lw-ticket-stats">
            <div class="lw-t-stat">
                <div class="lw-t-stat-val" style="color:#ef4444;">${openCount}</div>
                <div class="lw-t-stat-label">Open</div>
            </div>
            <div class="lw-t-stat">
                <div class="lw-t-stat-val" style="color:#10b981;">${resolvedCount}</div>
                <div class="lw-t-stat-label">Resolved</div>
            </div>
            <div class="lw-t-stat">
                <div class="lw-t-stat-val" style="color:#F5A800;">${tickets.length}</div>
                <div class="lw-t-stat-label">Total</div>
            </div>
        </div>
        <div class="lw-ticket-toolbar">
            <input class="lw-ticket-search" placeholder="Search by name or order ID..." id="lw-ticket-search" oninput="lwFilterTickets()">
        </div>
        <div style="display:flex;gap:6px;margin-bottom:14px;" id="lw-tf-filters">
            <button class="lw-tf-btn active" onclick="lwSetTicketFilter('all',this)">All</button>
            <button class="lw-tf-btn" onclick="lwSetTicketFilter('open',this)">Open</button>
            <button class="lw-tf-btn" onclick="lwSetTicketFilter('resolved',this)">Resolved</button>
        </div>
        <div class="lw-ticket-cards" id="lw-ticket-cards">
            ${tickets.map(ticket => {
                const isResolved = ticket.status === 'resolved';
                const statusClass = isResolved ? 'resolved' : 'open';
                const badgeLabel = isResolved ? 'Resolved' : (ticket.status || 'Open');
                return `
                    <div class="lw-ticket-card ${statusClass}"
                         data-status="${statusClass}"
                         data-search="${(ticket.name || '').toLowerCase()} ${(ticket.ticketId || '').toLowerCase()} ${(ticket.phone || '').toLowerCase()}">
                        <div class="lw-tc-head">
                            <div>
                                <div class="lw-tc-user">${ticket.name || 'Customer'}</div>
                                <div class="lw-tc-order-id">${ticket.ticketId ? `#${ticket.ticketId}` : ticket.id?.slice(0,10)} · ${timeAgo(ticket.createdAt)}</div>
                            </div>
                            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                                <span class="lw-tc-badge ${statusClass}">${badgeLabel.charAt(0).toUpperCase() + badgeLabel.slice(1)}</span>
                                ${ticket.phone ? `<span style="font-size:10px;color:#6b7280;">${ticket.phone}</span>` : ''}
                            </div>
                        </div>
                        <div class="lw-tc-category">${categoryIcon(ticket.issue)} ${ticket.category || ticket.issueType || 'Support'}</div>
                        <div class="lw-tc-msg">${ticket.issue || ticket.message || 'No description provided.'}</div>
                        <div class="lw-tc-footer">
                            <div class="lw-tc-meta">${ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString('en-IN', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</div>
                            <div class="lw-tc-actions">
                                ${!isResolved ? `<button type="button" class="lw-tc-btn resolve" data-ticket-action="resolve" data-id="${ticket.id}">✓ Resolve</button>` : `<button type="button" class="lw-tc-btn view" disabled style="opacity:.5;cursor:default;">✓ Resolved</button>`}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div id="lw-tickets-empty" style="display:none;" class="lw-tickets-empty">
            <div class="lw-te-icon">🔍</div>
            <div class="lw-te-title">No tickets found</div>
            <div style="font-size:11px;">Try a different filter</div>
        </div>
    `;
};

// Ticket filter helpers (global so inline onclick works)
let _lwTicketFilter = 'all';
window.lwSetTicketFilter = (f, el) => {
    _lwTicketFilter = f;
    document.querySelectorAll('#lw-tf-filters .lw-tf-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    window.lwFilterTickets();
};
window.lwFilterTickets = () => {
    const q = (document.getElementById('lw-ticket-search')?.value || '').toLowerCase();
    let visible = 0;
    document.querySelectorAll('#lw-ticket-cards .lw-ticket-card').forEach(c => {
        const matchFilter = _lwTicketFilter === 'all' || c.dataset.status === _lwTicketFilter;
        const matchSearch = !q || (c.dataset.search || '').includes(q);
        const show = matchFilter && matchSearch;
        c.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    const empty = document.getElementById('lw-tickets-empty');
    if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
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

    // Apply filters
    let filteredItems = [...menuItems];
    if (currentMenuCategory && currentMenuCategory !== 'all') filteredItems = filteredItems.filter(i => i.category === currentMenuCategory);
    if (currentMenuStatus === 'visible') filteredItems = filteredItems.filter(i => i.available !== false);
    if (currentMenuStatus === 'hidden') filteredItems = filteredItems.filter(i => i.available === false);
    if (currentMenuType === 'veg') filteredItems = filteredItems.filter(i => i.veg === true);
    if (currentMenuType === 'non-veg') filteredItems = filteredItems.filter(i => i.veg === false);
    if (currentMenuStock === 'in-stock') filteredItems = filteredItems.filter(i => i.inStock !== false);
    if (currentMenuStock === 'out-of-stock') filteredItems = filteredItems.filter(i => i.inStock === false);
    if (menuSearchQuery) {
        const q = menuSearchQuery.toLowerCase();
        filteredItems = filteredItems.filter(i =>
            i.name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
        );
    }

    if (filteredItems.length === 0) {
        menuListContainer.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#7a8098;">
                <div style="font-size:48px;margin-bottom:16px;">🍽️</div>
                <p style="font-size:16px;font-weight:600;color:#fff;margin-bottom:8px;">No items found</p>
                <p style="font-size:13px;">Try adjusting your filters or add a new item.</p>
            </div>`;
        return;
    }

    // Group by category
    const grouped = {};
    filteredItems.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    const sortedCategories = Object.keys(grouped).sort();

    const html = sortedCategories.map(cat => {
        const items = grouped[cat];
        const catId = cat.replace(/\s+/g, '-').toLowerCase();

        const cardsHtml = items.map(item => {
            const isInStock = item.inStock !== false;
            const isVisible = item.available !== false;
            const vegDot = item.veg ? '#10B981' : '#ef4444';

            return `
            <div class="menu-admin-card" data-id="${item.id}" style="
                background:#1a1c23;
                border:1px solid #252830;
                border-radius:16px;
                overflow:hidden;
                position:relative;
                transition:transform 0.2s, box-shadow 0.2s;
                cursor:default;
            " onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'"
               onmouseleave="this.style.transform='none';this.style.boxShadow='none'">

                <!-- Checkbox -->
                <div style="position:absolute;top:10px;left:10px;z-index:2;">
                    <input type="checkbox" class="menu-item-checkbox" data-id="${item.id}"
                        style="width:16px;height:16px;accent-color:#F5A800;cursor:pointer;">
                </div>

                <!-- Hidden overlay -->
                ${!isVisible ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:1;border-radius:16px;display:flex;align-items:center;justify-content:center;">
                    <span style="background:#374151;color:#9CA3AF;font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">Hidden</span>
                </div>` : ''}

                <!-- Image -->
                <div style="aspect-ratio:4/3;overflow:hidden;background:#0d0f14;position:relative;">
                    <img src="${item.image || '/images/logo.png'}" alt="${item.name}"
                        loading="lazy" style="width:100%;height:100%;object-fit:cover;">
                    ${!isInStock ? `<div style="position:absolute;bottom:8px;left:8px;">
                        <span style="background:#ef4444;color:#fff;font-size:9px;font-weight:800;padding:3px 8px;border-radius:10px;letter-spacing:0.5px;text-transform:uppercase;">Out of Stock</span>
                    </div>` : ''}
                </div>

                <!-- Info -->
                <div style="padding:12px 14px;">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:${vegDot};flex-shrink:0;"></span>
                        <span style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name || 'Untitled'}</span>
                    </div>
                    <div style="font-size:14px;font-weight:800;color:#F5A800;margin-bottom:10px;">₹${item.price ?? 0}</div>

                    <!-- Actions -->
                    <div style="display:flex;gap:6px;">
                        <button type="button" data-menu-action="edit" data-id="${item.id}"
                            style="flex:1;padding:6px;background:#252830;border:none;border-radius:8px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;transition:background 0.2s;"
                            onmouseenter="this.style.background='#F5A800';this.style.color='#000'"
                            onmouseleave="this.style.background='#252830';this.style.color='#fff'">
                            ✏️ Edit
                        </button>
                        <button type="button" data-menu-action="toggle" data-id="${item.id}" data-available="${isVisible}"
                            style="flex:1;padding:6px;background:#252830;border:none;border-radius:8px;color:${isVisible ? '#9CA3AF' : '#10B981'};font-size:11px;font-weight:700;cursor:pointer;transition:background 0.2s;"
                            onmouseenter="this.style.background='#374151'"
                            onmouseleave="this.style.background='#252830'">
                            ${isVisible ? '🙈 Hide' : '👁 Show'}
                        </button>
                        <button type="button" data-menu-action="stock" data-id="${item.id}"
                            style="flex:1.5;padding:6px;background:${item.inStock !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'};border:none;border-radius:8px;color:${item.inStock !== false ? '#4ade80' : '#f87171'};font-size:11px;font-weight:700;cursor:pointer;transition:opacity 0.2s;"
                            onmouseenter="this.style.opacity='0.8'"
                            onmouseleave="this.style.opacity='1'">
                            📦 ${item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <button type="button" data-menu-action="delete" data-id="${item.id}" data-storage="${item.storagePath || ''}"
                            style="padding:6px 10px;background:#252830;border:none;border-radius:8px;color:#ef4444;font-size:13px;cursor:pointer;transition:background 0.2s;"
                            onmouseenter="this.style.background='#3d1515'"
                            onmouseleave="this.style.background='#252830'">
                            🗑
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        // "+ Add Item" card for this category
        const addCard = `
        <div onclick="window._openMenuDrawerForCategory('${cat.replace(/'/g, "\\'")}')"
            style="
                background:#1a1c23;
                border:2px dashed #252830;
                border-radius:16px;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                min-height:200px;
                cursor:pointer;
                transition:border-color 0.2s, background 0.2s;
                color:#7a8098;
                gap:8px;
            "
            onmouseenter="this.style.borderColor='#F5A800';this.style.background='rgba(245,168,0,0.04)';this.querySelector('span').style.color='#F5A800'"
            onmouseleave="this.style.borderColor='#252830';this.style.background='#1a1c23';this.querySelector('span').style.color='#7a8098'">
            <div style="width:40px;height:40px;border-radius:50%;background:#252830;display:flex;align-items:center;justify-content:center;font-size:20px;">+</div>
            <span style="font-size:12px;font-weight:600;transition:color 0.2s;">Add Item</span>
        </div>`;

        return `
        <div class="menu-category-section" style="margin-bottom:32px;">
            <!-- Category Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #252830;cursor:pointer;"
                 onclick="this.nextElementSibling.classList.toggle('collapsed');this.querySelector('.cat-arrow').style.transform=this.nextElementSibling.classList.contains('collapsed')?'rotate(-90deg)':'rotate(0)'">
                <div style="display:flex;align-items:center;gap:12px;">
                    <span style="font-size:16px;font-weight:800;color:#fff;">${cat}</span>
                    <span style="font-size:11px;font-weight:600;color:#7a8098;background:#252830;padding:2px 10px;border-radius:20px;">${items.length} items</span>
                </div>
                <span class="cat-arrow" style="color:#7a8098;font-size:18px;transition:transform 0.3s;">▾</span>
            </div>

            <!-- Items Grid -->
            <div id="cat-grid-${catId}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;transition:all 0.3s;">
                ${cardsHtml}
                ${addCard}
            </div>
        </div>`;
    }).join('');

    menuListContainer.innerHTML = html;

    // Wire up bulk checkboxes
    updateBulkButtons();
};

// Opens drawer pre-filled with a category
window._openMenuDrawerForCategory = (category) => {
    resetMenuForm();
    const catInput = document.getElementById('menu-category');
    if (catInput) catInput.value = category;
    showMenuFormPanel(true, 'create');
};


const initMenuForm = () => {
    const menuForm = document.getElementById('menu-form');
    if (!menuForm) return;

    window._lwCurrentTags = [];

    menuForm.addEventListener('submit', handleMenuFormSubmit);
    document.getElementById('add-variant-btn')?.addEventListener('click', () => {
        addVariantGroup('', [{ label: '', price: '' }]);
    });

    // Preset chips — Portion, Size, Piece
    document.querySelectorAll('.variant-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetName = btn.dataset.preset;
            const opts = (btn.dataset.options || '').split(',').map(o => ({ label: o.trim(), price: '' }));
            // Don't add if group with same name already exists
            const existing = [...document.querySelectorAll('.variant-group-name')].find(i => i.value === presetName);
            if (existing) {
                existing.closest('.variant-group').querySelector('.variant-group-name').focus();
                return;
            }
            addVariantGroup(presetName, opts);
        });
    });
    document.getElementById('reset-menu-form-btn')?.addEventListener('click', resetMenuForm);
    document.getElementById('menu-list-container')?.addEventListener('click', handleMenuListClick);

    // Tag input handler
    const tagInput = document.getElementById('menu-tag-input');
    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = tagInput.value.trim().toLowerCase();
                if (val && !window._lwCurrentTags.includes(val) && window._lwCurrentTags.length < 8) {
                    window._lwCurrentTags.push(val);
                    renderMenuTags();
                    window._lwSyncPreview?.();
                }
                tagInput.value = '';
            }
        });
    }

    // Global pill toggler helper
    window.setMenuPill = (type, val) => {
        const input = document.getElementById(`menu-${type}-input`);
        if (input) input.value = val;

        if (type === 'veg') {
            document.getElementById('menu-type-veg').className = val === 'true'
                ? 'flex-1 py-2 text-[11px] font-bold rounded-lg bg-green-500/20 text-green-400 truncate px-1 text-center transition-colors min-w-0'
                : 'flex-1 py-2 text-[11px] font-bold rounded-lg text-gray-500 truncate px-1 text-center transition-colors min-w-0';
            document.getElementById('menu-type-nonveg').className = val === 'false'
                ? 'flex-1 py-2 text-[11px] font-bold rounded-lg bg-red-500/20 text-red-400 truncate px-1 text-center transition-colors min-w-0'
                : 'flex-1 py-2 text-[11px] font-bold rounded-lg text-gray-500 truncate px-1 text-center transition-colors min-w-0';
        } else if (type === 'avail') {
            document.getElementById('menu-avail-visible').className = val === 'true'
                ? 'flex-1 py-2 text-[11px] font-bold rounded-lg bg-blue-500/20 text-blue-400 truncate px-1 text-center transition-colors min-w-0'
                : 'flex-1 py-2 text-[11px] font-bold rounded-lg text-gray-500 truncate px-1 text-center transition-colors min-w-0';
            document.getElementById('menu-avail-hidden').className = val === 'false'
                ? 'flex-1 py-2 text-[11px] font-bold rounded-lg bg-gray-500/20 text-gray-400 truncate px-1 text-center transition-colors min-w-0'
                : 'flex-1 py-2 text-[11px] font-bold rounded-lg text-gray-500 truncate px-1 text-center transition-colors min-w-0';
        } else if (type === 'spice') {
            document.querySelectorAll('.menu-spice-btn').forEach(btn => {
                if (btn.dataset.spice === val) {
                    btn.className = 'menu-spice-btn flex-1 py-2 text-[11px] font-bold rounded-lg bg-white/10 text-white truncate px-1 text-center transition-colors min-w-0';
                } else {
                    btn.className = 'menu-spice-btn flex-1 py-2 text-[11px] font-bold rounded-lg text-gray-500 truncate px-1 text-center transition-colors min-w-0';
                }
            });
        }
        window._lwSyncPreview?.();
    };

    document.getElementById('menu-type-veg')?.addEventListener('click', () => setMenuPill('veg', 'true'));
    document.getElementById('menu-type-nonveg')?.addEventListener('click', () => setMenuPill('veg', 'false'));

    document.querySelectorAll('.menu-spice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setMenuPill('spice', e.target.dataset.spice));
    });

    document.getElementById('menu-avail-visible')?.addEventListener('click', () => setMenuPill('avail', 'true'));
    document.getElementById('menu-avail-hidden')?.addEventListener('click', () => setMenuPill('avail', 'false'));

    const syncPreview = () => {
        const name = document.getElementById('menu-name')?.value?.trim();
        const desc = document.getElementById('menu-description')?.value?.trim();
        const cat = document.getElementById('menu-category')?.value?.trim();
        const price = document.getElementById('menu-price')?.value;
        const veg = document.getElementById('menu-veg-input')?.value;
        const spice = document.getElementById('menu-spice-input')?.value;
        const prep = document.getElementById('menu-prep-time')?.value;
        const avail = document.getElementById('menu-avail-input')?.value;

        const prevName = document.getElementById('lw-prev-name');
        const prevDesc = document.getElementById('lw-prev-desc');
        const prevCat = document.getElementById('lw-prev-cat');
        const prevPrice = document.getElementById('lw-prev-price');
        const prevVeg = document.getElementById('lw-prev-veg');
        const prevSpice = document.getElementById('lw-prev-spice');
        const prevPrep = document.getElementById('lw-prev-prep');
        const prevTags = document.getElementById('lw-prev-tags');
        const prevAvail = document.getElementById('lw-prev-avail');
        const prevVariants = document.getElementById('lw-prev-variants');

        if (prevName) prevName.textContent = name || 'Item Name';
        if (prevDesc) prevDesc.textContent = desc || 'Item description will appear here...';
        if (prevCat) prevCat.textContent = cat || '—';
        if (prevPrice) prevPrice.textContent = price ? `₹${price}` : '₹—';

        if (prevVeg) {
            const isVeg = veg === 'true';
            prevVeg.innerHTML = isVeg ? '🟢 Veg' : '🔴 Non-Veg';
            prevVeg.className = isVeg
                ? 'font-bold text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20'
                : 'font-bold text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20';
        }

        if (prevSpice) {
            let label = '🌶 Regular';
            if (spice === 'spicy') label = '🌶🌶 Spicy';
            if (spice === 'extra_spicy') label = '🌶🌶🌶 Extra';
            prevSpice.textContent = label;
        }

        if (prevPrep) prevPrep.textContent = prep ? `~${prep} mins` : '—';

        if (prevTags) {
            if (window._lwCurrentTags && window._lwCurrentTags.length > 0) {
                prevTags.innerHTML = window._lwCurrentTags.map(t => `<span class="bg-white/10 px-1.5 py-0.5 rounded text-[9px] text-white">${t}</span>`).join('');
            } else {
                prevTags.innerHTML = '<span class="text-gray-500 text-[10px] font-bold italic">None</span>';
            }
        }

        if (prevAvail) {
            const visible = avail === 'true';
            prevAvail.textContent = visible ? 'Visible ✓' : 'Hidden 🚫';
            prevAvail.className = visible ? 'text-blue-400 font-bold text-[10px]' : 'text-gray-500 font-bold text-[10px]';
        }

        if (prevVariants) {
            const variants = parseVariants();
            if (variants.length > 0) {
                // Group by groupName for cleaner preview display
                const grouped = {};
                variants.forEach(v => {
                    const g = v.groupName || 'Variant';
                    if (!grouped[g]) grouped[g] = [];
                    grouped[g].push(v);
                });
                prevVariants.innerHTML = Object.entries(grouped).map(([gName, opts]) =>
                    `<div class="mb-1.5">
                        <div class="text-[9px] font-black uppercase tracking-widest text-gray-600 mb-0.5">${gName}</div>
                        ${opts.map(v => `<div class="flex justify-between items-center"><span class="text-gray-400 text-[10px]">${v.type}</span><span class="text-white text-[10px] font-bold">₹${v.price || 0}</span></div>`).join('')}
                    </div>`
                ).join('');
            } else {
                prevVariants.innerHTML = '<div class="text-gray-500 text-[10px] font-bold italic">No variants</div>';
            }
        }
    };

    window._lwSyncPreview = syncPreview;

    ['menu-name', 'menu-description', 'menu-category', 'menu-price', 'menu-prep-time'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', syncPreview);
    });

    const syncImage = (src) => {
        const img = document.getElementById('lw-preview-img');
        const placeholder = document.getElementById('lw-preview-placeholder');
        const thumb = document.getElementById('menu-image-thumbnail');
        const content = document.getElementById('menu-image-zone-content');

        if (img && placeholder) {
            if (src) {
                img.src = src;
                img.classList.remove('hidden');
                placeholder.classList.add('hidden');
                if (thumb) { thumb.src = src; thumb.classList.remove('hidden'); }
                if (content) { content.classList.add('opacity-0'); }
            } else {
                img.src = '';
                img.classList.add('hidden');
                placeholder.classList.remove('hidden');
                if (thumb) { thumb.src = ''; thumb.classList.add('hidden'); }
                if (content) { content.classList.remove('opacity-0'); }
            }
        }
    };
    window._lwSyncPreviewImage = syncImage;

    document.getElementById('menu-image')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => syncImage(ev.target.result);
            reader.readAsDataURL(file);
            const fn = document.getElementById('menu-image-filename');
            if (fn) fn.textContent = file.name;
        } else {
            syncImage('');
            const fn = document.getElementById('menu-image-filename');
            if (fn) fn.textContent = 'Click or drag image to upload';
        }
    });

    // Close buttons
    document.getElementById('close-menu-form-btn')?.addEventListener('click', () => showMenuFormPanel(false));
    document.getElementById('menu-drawer-overlay')?.addEventListener('click', () => showMenuFormPanel(false));

    resetMenuForm();
};

window.renderMenuTags = () => {
    const container = document.getElementById('menu-tags-container');
    const input = document.getElementById('menu-tag-input');
    if (!container || !input) return;

    // Remove existing chips
    container.querySelectorAll('.tag-chip').forEach(el => el.remove());

    // Insert new chips before input
    (window._lwCurrentTags || []).forEach((tag, idx) => {
        const chip = document.createElement('div');
        chip.className = 'tag-chip bg-white/10 text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5';
        chip.innerHTML = `${tag} <span class="cursor-pointer text-gray-400 hover:text-white" onclick="window._lwCurrentTags.splice(${idx}, 1); renderMenuTags(); window._lwSyncPreview?.();">✕</span>`;
        container.insertBefore(chip, input);
    });
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
        if (item) {
            populateMenuForm(item);
            setMenuMode('form');
        }
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
                available: !item.available
            }, null, item.storagePath || '');
            showMenuFormMessage(`Item "${item.name}" updated.`, true);
        } catch (err) {
            showMenuFormMessage('Failed to update item visibility.', false);
        }
        return;
    }

    const stockBtn = event.target.closest('[data-menu-action="stock"]');
    if (stockBtn) {
        const id = stockBtn.dataset.id;
        const item = menuItems.find(mi => mi.id === id);
        if (!item) return;
        try {
            await updateMenuItem(id, {
                ...item,
                inStock: !item.inStock
            }, null, item.storagePath || '');
            showToast(`Item "${item.name}" stock updated.`, 'success');
        } catch (err) {
            showToast('Failed to update item stock.', 'error');
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
    document.getElementById('menu-item-id').value = item.id;
    document.getElementById('menu-item-storage-path').value = item.storagePath || '';
    document.getElementById('menu-form-title').textContent = 'Edit Item';
    document.getElementById('save-menu-item-btn').textContent = 'Save Changes';

    document.getElementById('menu-name').value = item.name || '';
    document.getElementById('menu-description').value = item.description || '';
    document.getElementById('menu-category').value = item.category || '';
    document.getElementById('menu-price').value = item.price || 0;

    window.setMenuPill?.('veg', item.veg ? 'true' : 'false');
    window.setMenuPill?.('avail', item.available !== false ? 'true' : 'false');
    window.setMenuPill?.('spice', item.spiceLevel || 'regular');

    document.getElementById('menu-prep-time').value = item.prepTime || 15;

    window._lwCurrentTags = item.tags ? [...item.tags] : [];
    window.renderMenuTags?.();

    document.getElementById('menu-image').value = '';
    const fn = document.getElementById('menu-image-filename');
    if (fn) fn.textContent = item.image ? 'Existing image loaded (click to replace)' : 'Click or drag image to upload';

    if (item.image && window._lwSyncPreviewImage) {
        window._lwSyncPreviewImage(item.image);
    } else if (window._lwSyncPreviewImage) {
        window._lwSyncPreviewImage('');
    }

    const menuVariantsList = document.getElementById('menu-variants-list');
    const menuVariantsEmpty = document.getElementById('menu-variants-empty');
    if (menuVariantsList) {
        menuVariantsList.innerHTML = '';
        if (item.hasVariants && Array.isArray(item.variants) && item.variants.length > 0) {
            // Group variants by groupName (new format) or treat each as its own group (legacy)
            const grouped = {};
            item.variants.forEach(v => {
                const gName = v.groupName || v.type || 'Variant';
                if (!grouped[gName]) grouped[gName] = [];
                grouped[gName].push({ label: v.type, price: v.price });
            });
            Object.entries(grouped).forEach(([gName, options]) => {
                addVariantGroup(gName, options);
            });
            if (menuVariantsEmpty) menuVariantsEmpty.style.display = 'none';
        } else {
            if (menuVariantsEmpty) menuVariantsEmpty.style.display = 'block';
        }
    }

    window._lwSyncPreview?.();
};

const resetMenuForm = () => {
    editingMenuItemId = null;
    document.getElementById('menu-item-id').value = '';
    document.getElementById('menu-item-storage-path').value = '';
    document.getElementById('menu-form-title').textContent = 'Add New Item';
    document.getElementById('save-menu-item-btn').textContent = 'Create Item';

    document.getElementById('menu-name').value = '';
    document.getElementById('menu-description').value = '';
    document.getElementById('menu-category').value = '';
    document.getElementById('menu-price').value = '';

    window.setMenuPill?.('veg', 'true');
    window.setMenuPill?.('avail', 'true');
    window.setMenuPill?.('spice', 'regular');

    document.getElementById('menu-prep-time').value = '';

    window._lwCurrentTags = [];
    window.renderMenuTags?.();

    document.getElementById('menu-image').value = '';
    const fn = document.getElementById('menu-image-filename');
    if (fn) fn.textContent = 'Click or drag image to upload';
    if (window._lwSyncPreviewImage) window._lwSyncPreviewImage('');

    const menuVariantsList = document.getElementById('menu-variants-list');
    const menuVariantsEmpty = document.getElementById('menu-variants-empty');
    if (menuVariantsList) menuVariantsList.innerHTML = '';
    if (menuVariantsEmpty) menuVariantsEmpty.style.display = 'block';
    // Also reset save button text
    const saveBtn = document.getElementById('save-menu-item-btn');
    if (saveBtn) saveBtn.textContent = 'Save Changes';

    showMenuFormMessage('');
    window._lwSyncPreview?.();
};

const showMenuFormPanel = (open = true, mode = 'create') => {
    const panel = document.getElementById('menu-form-panel');
    const overlay = document.getElementById('menu-drawer-overlay');
    if (!panel) return;

    if (open) {
        const title = document.getElementById('menu-form-title');
        const saveBtn = document.getElementById('save-menu-item-btn');
        if (title) title.textContent = mode === 'edit' ? 'Edit Item' : 'Add New Item';
        if (saveBtn) saveBtn.textContent = mode === 'edit' ? 'Update Item' : 'Create Item';

        // Step 1: remove hidden so element exists in layout (still transparent)
        panel.classList.remove('hidden');
        overlay?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Step 2: double rAF ensures browser has painted before transition starts
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                panel.classList.remove('opacity-0', 'pointer-events-none');
                overlay?.classList.remove('opacity-0');
                panel.querySelector('.lw-split-modal')?.classList.remove('scale-95');
            });
        });

        // Step 3: sync live preview after modal is visible
        setTimeout(() => window._lwSyncPreview?.(), 100);
    } else {
        panel.classList.add('opacity-0', 'pointer-events-none');
        overlay?.classList.add('opacity-0');
        panel.querySelector('.lw-split-modal')?.classList.add('scale-95');
        document.body.style.overflow = '';
        setTimeout(() => {
            panel.classList.add('hidden');
            overlay?.classList.add('hidden');
        }, 320);
    }
};

const hideMenuFormPanel = () => showMenuFormPanel(false);

// Helper functions for grid card interactions
const editMenuItemHandler = (itemId) => {
    const item = menuItems.find(mi => mi.id === itemId);
    if (item) {
        populateMenuForm(item);
        setMenuMode('form');
    }
};

const confirmDeleteMenuItemHandler = (itemId, itemName) => {
    if (confirm(`Delete "${itemName}"? This cannot be undone.`)) {
        const item = menuItems.find(mi => mi.id === itemId);
        if (item) {
            confirmDeleteMenuItem(itemId, item.storagePath);
        }
    }
};

// ── GROUPED VARIANT SYSTEM ────────────────────────────────────

/**
 * addVariantGroup(groupName, options)
 * groupName: string — e.g. "Portion", "Egg Variant"
 * options: array of {label, price} — pre-filled options (for edit mode)
 */
const addVariantGroup = (groupName = '', options = []) => {
    const list = document.getElementById('menu-variants-list');
    const empty = document.getElementById('menu-variants-empty');
    if (!list) return;

    const groupId = 'vg_' + Date.now() + Math.random().toString(36).slice(2, 6);

    const group = document.createElement('div');
    group.className = 'variant-group rounded-xl border border-[#252830] bg-[#1a1c23] overflow-hidden';
    group.dataset.groupId = groupId;

    // Build initial options HTML
    const buildOptionRow = (label = '', price = '') => `
        <div class="variant-option-row flex gap-2 items-center px-3 py-2 border-t border-[#252830]">
            <input type="text" placeholder="e.g. Half"
                class="variant-option-label flex-1 min-w-0 bg-[#0e1018] border border-[#252830] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent transition-colors"
                value="${label}">
            <div class="relative flex-shrink-0 w-28">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500 pointer-events-none select-none">₹</span>
                <input type="number" min="0" placeholder="0"
                    class="variant-option-price w-full bg-[#0e1018] border border-[#252830] rounded-lg pl-7 pr-3 py-2 text-sm text-white outline-none focus:border-accent transition-colors"
                    value="${price}">
            </div>
            <button type="button" class="remove-option-btn flex-shrink-0 w-7 h-7 rounded-lg bg-[#252830] hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>`;

    const initialOptions = options.length > 0
        ? options.map(o => buildOptionRow(o.label || o.type || '', o.price || '')).join('')
        : buildOptionRow();  // one blank row by default

    group.innerHTML = `
        <!-- Group Header -->
        <div class="variant-group-header flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none" data-expanded="true">
            <button type="button" class="toggle-group-btn text-gray-500 hover:text-white transition-colors flex-shrink-0">
                <svg class="toggle-icon transition-transform duration-200" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <input type="text" placeholder="Variant type (e.g. Portion, Egg)"
                class="variant-group-name flex-1 min-w-0 bg-transparent border-none outline-none text-sm font-bold text-white placeholder-gray-600"
                value="${groupName}">
            <button type="button" class="add-option-btn ml-auto flex-shrink-0 text-[10px] font-black text-accent hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Add
            </button>
            <button type="button" class="remove-group-btn flex-shrink-0 w-6 h-6 rounded-md hover:bg-red-500/20 text-gray-600 hover:text-red-400 flex items-center justify-center transition-colors ml-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
        </div>
        <!-- Options Container -->
        <div class="variant-options-container">
            ${initialOptions}
        </div>`;

    // ── Toggle expand/collapse
    const header = group.querySelector('.variant-group-header');
    const toggleBtn = group.querySelector('.toggle-group-btn');
    const toggleIcon = group.querySelector('.toggle-icon');
    const optionsContainer = group.querySelector('.variant-options-container');

    const toggleGroup = () => {
        const expanded = header.dataset.expanded === 'true';
        header.dataset.expanded = String(!expanded);
        optionsContainer.style.display = expanded ? 'none' : '';
        toggleIcon.style.transform = expanded ? 'rotate(-90deg)' : '';
    };
    toggleBtn.addEventListener('click', toggleGroup);
    header.querySelector('.variant-group-name').addEventListener('click', e => e.stopPropagation());

    // ── Remove entire group
    group.querySelector('.remove-group-btn').addEventListener('click', () => {
        group.remove();
        const remaining = list.querySelectorAll('.variant-group').length;
        if (remaining === 0 && empty) empty.style.display = 'block';
        window._lwSyncPreview?.();
    });

    // ── Add new option row inside group
    const addOptionToGroup = (label = '', price = '') => {
        const row = document.createElement('div');
        row.innerHTML = buildOptionRow(label, price);
        const optRow = row.firstElementChild;
        attachOptionRowEvents(optRow);
        optionsContainer.appendChild(optRow);
        window._lwSyncPreview?.();
    };

    group.querySelector('.add-option-btn').addEventListener('click', () => addOptionToGroup());

    // ── Attach events to initial option rows
    const attachOptionRowEvents = (row) => {
        row.querySelector('.remove-option-btn')?.addEventListener('click', () => {
            row.remove();
            window._lwSyncPreview?.();
        });
        row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => window._lwSyncPreview?.()));
    };
    optionsContainer.querySelectorAll('.variant-option-row').forEach(attachOptionRowEvents);

    // ── Name input sync
    group.querySelector('.variant-group-name').addEventListener('input', () => window._lwSyncPreview?.());

    list.appendChild(group);
    if (empty) empty.style.display = 'none';
    window._lwSyncPreview?.();
};

// Legacy shim — old code calls addVariantRow(type, price) for single flat variants
// We map these: if called with type+price, create a group with that type name + one option
const addVariantRow = (type = '', price = '') => {
    // Check if a group with this name already exists (for edit-mode bulk loading)
    // We group flat variants by their group name stored as "GroupName: OptionName"
    // Format from Firestore: {type: "Portion: Half", price: 99} OR new format {groupName, options:[]}
    addVariantGroup(type, price ? [{ label: type, price }] : []);
};

const parseVariants = () => {
    const list = document.getElementById('menu-variants-list');
    if (!list) return [];
    const variants = [];

    list.querySelectorAll('.variant-group').forEach(group => {
        const groupName = group.querySelector('.variant-group-name')?.value.trim() || 'Variant';
        group.querySelectorAll('.variant-option-row').forEach(row => {
            const label = row.querySelector('.variant-option-label')?.value.trim();
            const price = Number(row.querySelector('.variant-option-price')?.value || 0);
            if (label) {
                variants.push({
                    type: label,          // keep "type" for Firestore compat
                    groupName,            // new field
                    price
                });
            }
        });
    });

    return variants;
};

const handleMenuFormSubmit = async (event) => {
    event.preventDefault();

    const name = document.getElementById('menu-name').value.trim();
    const description = document.getElementById('menu-description').value.trim();
    const category = document.getElementById('menu-category').value.trim();
    const price = Number(document.getElementById('menu-price').value || 0);
    const veg = document.getElementById('menu-veg-input').value === 'true';
    const available = document.getElementById('menu-avail-input')?.value === 'true';
    const spiceLevel = document.getElementById('menu-spice-input')?.value || 'regular';
    const prepTime = Number(document.getElementById('menu-prep-time')?.value || 15);
    const tags = window._lwCurrentTags || [];

    const variants = parseVariants();
    const imageFile = document.getElementById('menu-image').files?.[0] || null;

    if (!name || !category || (!price && variants.length === 0)) {
        showMenuFormMessage('Name, category, and price are required.', false);
        return;
    }

    const payload = {
        name,
        description,
        category,
        price,
        veg,
        available,
        spiceLevel,
        prepTime,
        tags,
        variants
    };

    const saveMenuItemBtn = document.getElementById('save-menu-item-btn');
    if (saveMenuItemBtn) saveMenuItemBtn.disabled = true;
    const originalText = saveMenuItemBtn ? saveMenuItemBtn.textContent : '';
    if (saveMenuItemBtn) saveMenuItemBtn.textContent = editingMenuItemId ? 'Updating…' : 'Saving…';

    try {
        if (editingMenuItemId) {
            await updateMenuItem(editingMenuItemId, payload, imageFile, document.getElementById('menu-item-storage-path').value);
            showMenuFormMessage('Menu item updated successfully.', true);
        } else {
            // New items are default inStock: true
            payload.inStock = true;
            await createMenuItem(payload, imageFile);
            showMenuFormMessage('Menu item created successfully.', true);
        }
        resetMenuForm();
        setTimeout(() => showMenuFormPanel(false), 1000);
    } catch (error) {
        console.error('Menu save failed:', error);
        showMenuFormMessage('Failed to save menu item. Please try again.', false);
    } finally {
        if (saveMenuItemBtn) {
            saveMenuItemBtn.disabled = false;
            saveMenuItemBtn.textContent = originalText;
        }
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

// Auto-reconnect when internet comes back
window.addEventListener('online', () => {
    const banner = document.getElementById('menu-offline-banner');
    if (banner) {
        banner.innerHTML = '✅ Back online! Refreshing menu...';
        banner.style.background = 'rgba(16,185,129,0.08)';
        banner.style.borderColor = 'rgba(16,185,129,0.2)';
        banner.style.color = '#10B981';
        setTimeout(() => {
            banner.remove();
            startMenuListener();
        }, 1200);
    }
});

/**
 * 📦 Order Lifecycle & Real-time Listeners
 */
const startOrderListener = () => {
    // Guard: Clean up any existing listener before creating a new one
    if (typeof orderListenerUnsubscribe === 'function') {
        orderListenerUnsubscribe();
    }
    if (typeof menuListenerUnsubscribe === 'function') {
        menuListenerUnsubscribe();
    }

    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));

    orderListenerUnsubscribe = onSnapshot(q, (snapshot) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        activeOrders = [];
        completedOrders = [];

        let newOrder = null;
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added' && !isInitialLoad) {
                newOrder = { id: change.doc.id, ...change.doc.data() };
            }
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

        if (newOrder) triggerNewOrderAlert(newOrder);

        updateKPIs();
        renderOrders();

        // Re-render dashboard charts + insights on every order change (realtime)
        loadDashboardAnalytics().catch(() => {});

        isInitialLoad = false;
    });
};

const updateKPIs = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

// Dashboard modal handlers
let dashboardActiveModal = null;

const openDashboardModal = (modalType) => {
    dashboardActiveModal = modalType;
    const overlay = document.getElementById('dashboard-modal-overlay');
    const content = document.getElementById('dashboard-modal-content');

    if (!overlay || !content) return;

    // Build modal content based on type
    if (modalType === 'revenue') {
        content.innerHTML = `
      <div>
        <h3 style="fontFamily:'Syne',sans-serif;fontSize:20px;marginBottom:20px;">💰 Today's Revenue</h3>
        <div style="display:flex;flexDirection:column;gap:12px;">
          ${completedOrders.filter(o => [ORDER_STATUS.DELIVERED].includes(o.status)).map(order => `
            <div style="display:flex;justifyContent:space-between;alignItems:center;padding:12px 0;borderBottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="fontWeight:600;fontSize:14px;">${order.orderId || order.id.slice(0, 8)}</div>
                <div style="color:#6b7280;fontSize:12px;">${order.customer?.name || 'N/A'} · ${order.paymentMethod}</div>
              </div>
              <div style="color:#f5a623;fontWeight:700;">₹${order.total}</div>
            </div>
          `).join('')}
        </div>
        <button style="marginTop:24px;width:100%;padding:10px 20px;background:#374151;color:white;border:none;borderRadius:8px;cursor:pointer;fontWeight:600;" onclick="document.getElementById('dashboard-modal-overlay').style.display='none';">Close</button>
      </div>
    `;
    } else if (modalType === 'active') {
        content.innerHTML = `
      <div>
        <h3 style="fontFamily:'Syne',sans-serif;fontSize:20px;marginBottom:20px;">🍳 Active Kitchen Orders</h3>
        <div style="display:flex;flexDirection:column;gap:12px;">
          ${activeOrders.filter(o => [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING].includes(o.status)).map(order => `
            <div style="background:#1a1e2e;borderRadius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);">
              <div style="display:flex;justifyContent:space-between;marginBottom:8px;">
                <span style="fontWeight:700;">${order.orderId || order.id.slice(0, 8)}</span>
                <span style="color:#f5a623;fontWeight:700;">₹${order.total}</span>
              </div>
              <div style="color:#6b7280;fontSize:12px;">
                ${order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
              </div>
            </div>
          `).join('')}
        </div>
        <button style="marginTop:24px;width:100%;padding:10px 20px;background:#374151;color:white;border:none;borderRadius:8px;cursor:pointer;fontWeight:600;" onclick="document.getElementById('dashboard-modal-overlay').style.display='none';">Close</button>
      </div>
    `;
    } else if (modalType === 'completed') {
        content.innerHTML = `
      <div>
        <h3 style="fontFamily:'Syne',sans-serif;fontSize:20px;marginBottom:20px;">✅ Completed Today</h3>
        <div style="display:flex;flexDirection:column;gap:12px;">
          ${completedOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).map(order => `
            <div style="display:flex;justifyContent:space-between;padding:12px 0;borderBottom:1px solid rgba(255,255,255,0.05);">
              <div>
                <div style="fontWeight:600;">${order.orderId || order.id.slice(0, 8)}</div>
                <div style="color:#6b7280;fontSize:12px;">${order.items?.map(i => i.name).join(', ')}</div>
              </div>
              <span style="background:rgba(34,197,94,0.1);color:#22c55e;padding:3px 10px;borderRadius:999px;fontSize:11px;fontWeight:600;textTransform:uppercase;">Delivered</span>
            </div>
          `).join('')}
        </div>
        <button style="marginTop:24px;width:100%;padding:10px 20px;background:#374151;color:white;border:none;borderRadius:8px;cursor:pointer;fontWeight:600;" onclick="document.getElementById('dashboard-modal-overlay').style.display='none';">Close</button>
      </div>
    `;
    } else if (modalType === 'cancelled') {
        content.innerHTML = `
      <div>
        <h3 style="fontFamily:'Syne',sans-serif;fontSize:20px;marginBottom:20px;">❌ Rejected / Cancelled</h3>
        <div style="display:flex;flexDirection:column;gap:12px;">
          ${completedOrders.filter(o => [ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(o.status)).map(order => `
            <div style="padding:14px 0;borderBottom:1px solid rgba(255,255,255,0.05);">
              <div style="display:flex;justifyContent:space-between;marginBottom:6px;">
                <span style="fontWeight:600;">${order.orderId || order.id.slice(0, 8)}</span>
                <span style="color:#ef4444;fontWeight:700;">₹${order.total}</span>
              </div>
              <span style="background:rgba(239,68,68,0.1);color:#ef4444;padding:3px 10px;borderRadius:999px;fontSize:11px;fontWeight:600;textTransform:uppercase;">
                ${order.status === ORDER_STATUS.REJECTED ? '❌ Rejected' : '❌ Cancelled'}
              </span>
            </div>
          `).join('')}
        </div>
        <button style="marginTop:24px;width:100%;padding:10px 20px;background:#374151;color:white;border:none;borderRadius:8px;cursor:pointer;fontWeight:600;" onclick="document.getElementById('dashboard-modal-overlay').style.display='none';">Close</button>
      </div>
    `;
    }

    overlay.style.display = 'flex';
};

// Attach click handlers to KPI cards
const setupDashboardCardHandlers = () => {
    document.querySelectorAll('[data-kpi]').forEach(card => {
        card.addEventListener('click', () => {
            const kpiType = card.getAttribute('data-kpi');
            openDashboardModal(kpiType);
        });
    });
};

// Close modal on backdrop click
document.getElementById('dashboard-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'dashboard-modal-overlay') {
        e.target.style.display = 'none';
    }
});

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
    const time = order.createdAt?.toDate
        ? new Date(order.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Now';

    // Inject order card styles once
    if (!document.getElementById('order-card-styles')) {
        const s = document.createElement('style');
        s.id = 'order-card-styles';
        s.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
            .lw-order-card {
                background: #0f1119;
                border: 1px solid #1e2130;
                border-radius: 16px;
                overflow: hidden;
                transition: border-color .2s, transform .2s;
                position: relative;
            }
            .lw-order-card:hover { border-color: #2d3148; transform: translateY(-2px); }
            .lw-order-card::before {
                content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%;
            }
            .lw-order-card.st-placed::before   { background: #818cf8; }
            .lw-order-card.st-accepted::before  { background: #60a5fa; }
            .lw-order-card.st-preparing::before { background: #F5A800; }
            .lw-order-card.st-ready::before     { background: #34d399; }
            .lw-order-card.st-assigned::before  { background: #a78bfa; }
            .lw-order-card.st-delivered::before { background: #34d399; }
            .lw-order-card.st-cancelled::before { background: #f87171; }
            .lw-order-card-header { padding: 16px 18px 12px 20px; border-bottom: 1px solid #1a1d28; }
            .lw-order-card-body   { padding: 13px 18px 13px 20px; }
            .lw-order-card-footer { padding: 12px 18px 14px 20px; border-top: 1px solid #1a1d28; }
            .lw-status-pill {
                display: inline-flex; align-items: center; gap: 5px;
                font-size: 10px; font-weight: 800; padding: 3px 10px;
                border-radius: 20px; text-transform: uppercase; letter-spacing: .5px; border: 1px solid;
            }
            .lw-status-placed   { background:rgba(99,102,241,.1);  color:#818cf8; border-color:rgba(99,102,241,.3); }
            .lw-status-accepted { background:rgba(59,130,246,.1);  color:#60a5fa; border-color:rgba(59,130,246,.3); }
            .lw-status-preparing{ background:rgba(245,168,0,.1);   color:#F5A800; border-color:rgba(245,168,0,.3); }
            .lw-status-ready    { background:rgba(16,185,129,.1);  color:#34d399; border-color:rgba(16,185,129,.3); }
            .lw-status-assigned { background:rgba(139,92,246,.1);  color:#a78bfa; border-color:rgba(139,92,246,.3); }
            .lw-status-delivered{ background:rgba(16,185,129,.1);  color:#34d399; border-color:rgba(16,185,129,.3); }
            .lw-status-cancelled{ background:rgba(239,68,68,.1);   color:#f87171; border-color:rgba(239,68,68,.3); }
            .lw-status-rejected { background:rgba(239,68,68,.1);   color:#f87171; border-color:rgba(239,68,68,.3); }
            .lw-order-item-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #1a1d28; }
            .lw-order-item-row:last-child { border-bottom:none; }
            .lw-order-btn {
                width:100%; padding:10px 16px; border:none; border-radius:10px;
                font-size:12px; font-weight:800; cursor:pointer; letter-spacing:.3px;
                transition: opacity .15s, transform .15s; font-family: inherit;
            }
            .lw-order-btn:hover { opacity:.88; transform:translateY(-1px); }
            .lw-order-btn:active { transform:translateY(0); }
            .lw-btn-accept  { background:#6366f1; color:#fff; }
            .lw-btn-reject  { background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.3) !important; }
            .lw-btn-kitchen { background:#F5A800; color:#000; }
            .lw-btn-ready   { background:#10b981; color:#fff; }
            .lw-btn-deliver { background:#10b981; color:#fff; }
            .lw-progress-track { display:flex; align-items:center; margin-bottom:13px; }
            .lw-progress-step { display:flex; flex-direction:column; align-items:center; flex:1; position:relative; }
            .lw-progress-dot {
                width:22px; height:22px; border-radius:50%; border:2px solid #252830;
                display:flex; align-items:center; justify-content:center;
                font-size:9px; background:#161820; color:#6b7280; z-index:1; transition:all .25s;
            }
            .lw-progress-dot.done   { background:#F5A800; border-color:#F5A800; color:#000; }
            .lw-progress-dot.active { background:#161820; border-color:#F5A800; color:#F5A800; box-shadow:0 0 0 3px rgba(245,168,0,.2); }
            .lw-progress-line { position:absolute; top:10px; left:50%; width:100%; height:2px; background:#252830; z-index:0; }
            .lw-progress-line.done { background:#F5A800; }
            .lw-progress-label { font-size:8px; color:#6b7280; margin-top:4px; font-weight:700; text-transform:uppercase; letter-spacing:.3px; text-align:center; }
            .lw-progress-label.active { color:#F5A800; }
            .lw-progress-label.done   { color:#F5A800; }
            .lw-rider-select {
                width:100%; padding:12px 14px; background:#1a1f2e; border:2px solid #F5A800;
                border-radius:10px; color:#fff; font-size:13px; outline:none; cursor:pointer;
                font-family:inherit; font-weight:600; appearance:none; -webkit-appearance:none;
                background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F5A800' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                background-repeat:no-repeat; background-position:right 10px center; background-size:20px;
                padding-right:40px; box-shadow:0 4px 12px rgba(245, 168, 0, 0.15);
                transition:all 0.3s ease;
            }
            .lw-rider-select:hover { 
                border-color:#ffc940; background-color:#1f2437; box-shadow:0 6px 16px rgba(245, 168, 0, 0.25);
            }
            .lw-rider-select:focus { 
                border-color:#ffc940; box-shadow:0 0 0 3px rgba(245, 168, 0, 0.1); background-color:#1f2437;
            }
            .lw-rider-assign-btn:hover {
                filter:brightness(1.1);
                box-shadow:0 6px 20px rgba(245,168,0,0.4) !important;
                transform:translateY(-2px);
            }
            .lw-rider-assign-btn:active {
                transform:translateY(0);
                filter:brightness(0.95);
            }
            /* Responsive design for mobile */
            @media (max-width: 768px) {
                .lw-rider-select-container {
                    display:grid !important;
                    grid-template-columns:1fr !important;
                    gap:10px !important;
                }
                .lw-rider-select {
                    width:100% !important;
                }
                .lw-rider-assign-btn {
                    width:100% !important;
                    min-height:44px !important;
                }
            }
        `;
        document.head.appendChild(s);
    }

    const STATUS_META = {
        'PLACED':    { label: 'New Order',        cls: 'lw-status-placed',    icon: '🆕', step: 0, cardCls: 'st-placed'   },
        'ACCEPTED':  { label: 'Accepted',          cls: 'lw-status-accepted',  icon: '✅', step: 1, cardCls: 'st-accepted'  },
        'PREPARING': { label: 'In Kitchen',        cls: 'lw-status-preparing', icon: '👨‍🍳', step: 2, cardCls: 'st-preparing' },
        'READY':     { label: 'Ready',             cls: 'lw-status-ready',     icon: '🔔', step: 3, cardCls: 'st-ready'    },
        'ASSIGNED':  { label: 'Out for Delivery',  cls: 'lw-status-assigned',  icon: '🛵', step: 4, cardCls: 'st-assigned'  },
        'DELIVERED': { label: 'Delivered',         cls: 'lw-status-delivered', icon: '🎉', step: 5, cardCls: 'st-delivered' },
        'CANCELLED': { label: 'Cancelled',         cls: 'lw-status-cancelled', icon: '❌', step: -1, cardCls: 'st-cancelled' },
        'REJECTED':  { label: 'Rejected',          cls: 'lw-status-rejected',  icon: '🚫', step: -1, cardCls: 'st-cancelled' },
    };
    const meta = STATUS_META[order.status] || { label: order.status, cls: '', icon: '•', step: -1, cardCls: '' };
    const currentStep = meta.step;

    // Progress bar
    const steps = [
        { label: 'Placed',    icon: '📥' },
        { label: 'Accepted',  icon: '✅' },
        { label: 'Kitchen',   icon: '👨‍🍳' },
        { label: 'Ready',     icon: '🔔' },
        { label: 'Delivery',  icon: '🛵' },
    ];
    const showProgress = currentStep >= 0;
    const progressHTML = showProgress ? `
        <div class="lw-progress-track">
            ${steps.map((st, i) => `
                <div class="lw-progress-step">
                    ${i < steps.length - 1 ? `<div class="lw-progress-line ${i < currentStep ? 'done' : ''}"></div>` : ''}
                    <div class="lw-progress-dot ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}">${i < currentStep ? '✓' : st.icon}</div>
                    <span class="lw-progress-label ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}">${st.label}</span>
                </div>
            `).join('')}
        </div>` : '';

    // Items
    const itemsHTML = (order.items || []).map(i => `
        <div class="lw-order-item-row">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="background:#1e2130;color:#F5A800;font-size:9px;font-weight:800;padding:2px 7px;border-radius:6px;font-family:'Syne',sans-serif;">×${i.quantity}</span>
                <span style="font-size:12px;font-weight:600;color:#e5e7eb;">${i.name}</span>
                ${i.variant ? `<span style="font-size:10px;color:#6b7280;font-weight:600;background:#1e2130;padding:1px 6px;border-radius:4px;">${i.variant}</span>` : ''}
            </div>
            <span style="font-size:12px;font-weight:700;color:#9ca3af;">₹${(i.price || 0) * (i.quantity || 1)}</span>
        </div>
    `).join('');

    // Action buttons
    let actionsHTML = '';
    switch (order.status) {
        case ORDER_STATUS.PLACED:
            actionsHTML = `
                <div style="display:grid;grid-template-columns:1fr auto;gap:8px;">
                    <button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.ACCEPTED}')" class="lw-order-btn lw-btn-accept">✅ Accept Order</button>
                    <button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.REJECTED}')" class="lw-order-btn lw-btn-reject" style="width:auto;padding:10px 16px;">🚫</button>
                </div>`;
            break;
        case ORDER_STATUS.ACCEPTED:
            actionsHTML = `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.PREPARING}')" class="lw-order-btn lw-btn-kitchen">👨‍🍳 Send to Kitchen</button>`;
            break;
        case ORDER_STATUS.PREPARING:
            actionsHTML = `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.READY}')" class="lw-order-btn lw-btn-ready">🔔 Mark Ready</button>`;
            break;
        case ORDER_STATUS.READY:
            actionsHTML = `
                <div style="background:linear-gradient(135deg, rgba(245,168,0,0.1) 0%, rgba(245,168,0,0.05) 100%); padding:16px; border-radius:12px; border:1px solid rgba(245,168,0,0.3);">
                    <p style="font-size:12px;color:#F5A800;font-weight:800;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:.1em;">🛵 SELECT RIDER & ASSIGN</p>
                    <div class="lw-rider-select-container" style="display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;width:100%;">
                        <select id="rider-select-${order.id}" class="lw-rider-select" style="width:100%;padding:12px 14px;background:#1a1f2e;border:2px solid #F5A800;border-radius:10px;color:#fff;font-size:13px;outline:none;cursor:pointer;font-family:inherit;font-weight:600;appearance:none;-webkit-appearance:none;background-image:url(&quot;data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F5A800' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e&quot;);background-repeat:no-repeat;background-position:right 10px center;background-size:20px;padding-right:40px;box-shadow:0 4px 12px rgba(245, 168, 0, 0.15);transition:all 0.3s ease;">
                            <option value="">🛵 Choose Rider from List</option>
                            ${ridersList.map(r => {
                                const riderName = r.profile?.name || r.name || r.email || 'Unknown Rider';
                                const riderDisplay = `${riderName}${r.isOnline ? ' 🟢' : ' 🔴'}`;
                                return `<option value="${r.id}" ${order.riderId === r.id ? 'selected' : ''}>${riderDisplay}</option>`;
                            }).join('')}
                        </select>
                        <button onclick="handleRiderAssignment('${order.id}')" class="lw-order-btn lw-rider-assign-btn" style="background:linear-gradient(135deg, #F5A800, #ffc940);color:#000;font-weight:800;padding:12px 20px;white-space:nowrap;border-radius:10px;font-size:13px;text-transform:uppercase;letter-spacing:.05em;box-shadow:0 4px 12px rgba(245,168,0,0.3);transition:all 0.3s ease;border:none;cursor:pointer;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✓ ASSIGN NOW</button>
                    </div>
                </div>`;
            break;
        case ORDER_STATUS.ASSIGNED:
            actionsHTML = `<button onclick="updateOrderStatus('${order.id}', '${ORDER_STATUS.DELIVERED}')" class="lw-order-btn lw-btn-deliver">🎉 Mark Delivered</button>`;
            break;
        default:
            const archiveLabel = order.status?.replace(/_/g, ' ') || 'Unknown';
            actionsHTML = `<span style="font-size:10px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Archive: ${archiveLabel}</span>`;
    }

    const payBadge = order.paymentMethod === 'ONLINE'
        ? `<span style="background:rgba(59,130,246,.1);color:#60a5fa;border:1px solid rgba(59,130,246,.3);font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;text-transform:uppercase;">💳 Online</span>`
        : `<span style="background:rgba(16,185,129,.1);color:#34d399;border:1px solid rgba(16,185,129,.3);font-size:9px;font-weight:800;padding:2px 8px;border-radius:10px;text-transform:uppercase;">💵 COD</span>`;

    return `
        <div class="lw-order-card ${meta.cardCls}">
            <div class="lw-order-card-header">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:9px;">
                    <div>
                        <span style="font-size:9px;font-weight:800;color:#6b7280;letter-spacing:1.5px;text-transform:uppercase;">${order.orderId || order.id.slice(0,10)}</span>
                        <h3 style="font-size:16px;font-weight:900;color:#fff;margin:3px 0 0 0;font-family:'Syne',sans-serif;">${order.customer?.name || 'Customer'}</h3>
                        <span style="font-size:10px;color:#6b7280;font-weight:600;">${time}</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:22px;font-weight:900;color:#F5A800;font-family:'Syne',sans-serif;">₹${order.total}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                    <span class="lw-status-pill ${meta.cls}">${meta.icon} ${meta.label}</span>
                    ${payBadge}
                </div>
            </div>
            <div class="lw-order-card-body">
                ${progressHTML}
                <div style="background:#0a0c12;border-radius:10px;padding:9px 12px;border:1px solid #1a1d28;">
                    ${itemsHTML}
                    <div style="display:flex;justify-content:space-between;padding:7px 0 2px;border-top:1px solid #1a1d28;margin-top:3px;">
                        <span style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Total</span>
                        <span style="font-size:13px;font-weight:900;color:#F5A800;font-family:'Syne',sans-serif;">₹${order.total}</span>
                    </div>
                </div>
                ${order.customer?.address ? `
                    <div style="display:flex;align-items:flex-start;gap:6px;margin-top:9px;">
                        <span style="font-size:12px;flex-shrink:0;">📍</span>
                        <span style="font-size:11px;color:#9ca3af;font-weight:500;line-height:1.4;">${order.customer.address}</span>
                    </div>` : ''}
                ${order.riderId ? `
                    <div style="display:flex;align-items:center;gap:8px;margin-top:12px;background:rgba(245,168,0,0.1);padding:10px 12px;border-radius:10px;border:1px solid rgba(245,168,0,0.2);">
                        <span style="font-size:14px;">🛵</span>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px;">Assigned Rider</div>
                            <div style="font-size:13px;color:#F5A800;font-weight:800;">${order.riderName || 'Unknown'}</div>
                            ${order.riderStatus ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px;">Status: ${order.riderStatus}</div>` : ''}
                            ${order.riderAcceptedAt ? `<div style="font-size:10px;color:#10B981;margin-top:2px;">✓ Accepted ${new Date(order.riderAcceptedAt.seconds ? order.riderAcceptedAt.seconds * 1000 : order.riderAcceptedAt).toLocaleTimeString()}</div>` : ''}
                            ${order.riderRejectedAt ? `<div style="font-size:10px;color:#ef4444;margin-top:2px;">✗ Rejected ${new Date(order.riderRejectedAt.seconds ? order.riderRejectedAt.seconds * 1000 : order.riderRejectedAt).toLocaleTimeString()}</div>` : ''}
                        </div>
                    </div>` : ''}
            </div>
            <div class="lw-order-card-footer">
                ${actionsHTML}
            </div>
        </div>
    `;
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

window.handleRiderAssignment = async (orderId) => {
    const dropdown = document.getElementById(`rider-select-${orderId}`);
    if (!dropdown) return;
    const riderId = dropdown.value;
    if (!riderId) {
        alert('🛵 Please select a rider first!');
        return;
    }
    const rider = ridersList.find(r => r.id === riderId);
    if (!rider) return;
    const riderDisplayName = rider.profile?.name || rider.name || rider.email || 'Unknown Rider';
    const confirmed = await showCustomModal({
        title: '🛵 Assign Rider?',
        html: `Assign <strong style="color:#F5A800;">${riderDisplayName}</strong> to this order?`,
        buttons: [
            { label: 'Cancel', value: false, style: 'background:#252830;color:#fff;' },
            { label: 'Assign', value: true, style: 'background:#F5A800;color:#000;' },
        ]
    });
    if (confirmed) {
        try {
            console.log('[ADMIN] Assigning rider:', { orderId, riderId, riderDisplayName });
            await assignRiderToOrder(orderId, riderId, riderDisplayName);
            showToast(`✅ Order assigned to ${riderDisplayName}!`, 'success');
        } catch (e) {
            console.error('Assignment failed:', e);
            showToast('❌ Failed to assign rider', 'error');
        }
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
                    <div style="display:flex;gap:8px;alignItems:center;">
                        <select onchange="changeRole('${u.id}', this.value)" class="bg-gray-800 rounded-lg text-xs px-2 py-1 outline-none border border-gray-700">
                            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
                            <option value="rider" ${u.role === 'rider' ? 'selected' : ''}>Rider</option>
                            <option value="manager" ${u.role === 'manager' ? 'selected' : ''}>Manager</option>
                            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <button onclick="openDeleteCustomerConfirm('${u.id}', '${u.name}')" style="background:#ef4444;color:white;border:none;borderRadius:6px;padding:6px 12px;cursor:pointer;fontSize:12px;fontWeight:600;">🗑️ Delete</button>
                    </div>
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

let customerToDelete = null;

const openDeleteCustomerConfirm = (customerId, customerName) => {
    customerToDelete = customerId;
    document.getElementById('delete-customer-name').textContent = customerName;
    document.getElementById('customer-delete-modal').style.display = 'flex';
};

const deleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
        const userRef = doc(db, 'users', customerToDelete);
        await updateDoc(userRef, { deleted: true, deletedAt: serverTimestamp() });
        showToast('Customer deleted successfully', 'success');
        customerToDelete = null;
        document.getElementById('customer-delete-modal').style.display = 'none';
        loadCustomers();
    } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Failed to delete customer', 'error');
    }
};

// Attach confirm button
document.getElementById('confirm-delete-btn')?.addEventListener('click', deleteCustomer);

// Close modal on backdrop click
document.getElementById('customer-delete-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'customer-delete-modal') {
        e.target.style.display = 'none';
    }
});

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
            const nameA = a.profile?.name || a.name || a.email || '';
            const nameB = b.profile?.name || b.name || b.email || '';
            return nameA.localeCompare(nameB);
        });

        ridersContainer.innerHTML = sorted.map(r => {
            const riderName = r.profile?.name || r.name || r.email || 'Unknown Rider';
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
                <div class="rider-card-premium">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #F5A800, #c47f17); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; box-shadow: 0 8px 16px rgba(245, 168, 0, 0.2);">🛵</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 16px; font-weight: 900; color: #fff; margin-bottom: 2px;">${riderName}</div>
                            <div style="font-size: 12px; color: #9ca3af; word-break: break-all;">${phone}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 8px; background: ${statusBg}; padding: 10px 14px; border-radius: 14px; border: 1px solid ${statusColor};">
                        <span style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%; animation: ${r.isOnline ? 'pulse' : 'none'} 2s infinite;"></span>
                        <div style="flex: 1;">
                            <div style="font-size: 13px; font-weight: 800; color: ${statusColor};">${status}</div>
                            <div style="font-size: 10px; color: ${statusColor}; opacity: 0.8; font-weight: 600;">${duration}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 14px; text-align: center;">
                            <div style="font-size: 20px; font-weight: 950; color: #F5A800;">${deliveries}</div>
                            <div style="font-size: 9px; color: #F5A800; font-weight: 800; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Delivered</div>
                        </div>
                        <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 14px; text-align: center;">
                            <div style="font-size: 20px; font-weight: 950; color: #3b82f6;">${r.email ? r.email.split('@')[0].slice(0, 5) : 'N/A'}</div>
                            <div style="font-size: 9px; color: #3b82f6; font-weight: 800; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">ID CODE</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <button onclick="alert('Chat feature coming soon!')" class="action-btn-sm bg-gray-800 text-gray-300 flex-1 hover:bg-gray-700 transition-colors">💬 Contact</button>
                        <button onclick="openRiderAnalytics('${r.uid}', '${r.name}')" class="action-btn-sm bg-gray-800 text-gray-300 flex-1 hover:bg-gray-700 transition-colors">📊 Stats</button>
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
            const sorted = Object.entries(data.topItems).sort((a, b) => b[1] - a[1]).slice(0, 5);
            container.innerHTML = sorted.map(([name, qty]) => `
                <div class="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                    <span class="text-xs text-gray-300 font-medium">${name}</span>
                    <span class="text-xs font-black text-accent">${qty} SOLD</span>
                </div>
            `).join('');
        } else {
            const sorted = Object.values(data.customers).sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5);
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

    // Calculate trends
    const calculateTrend = (series) => {
        if (series.length < 2) return { val: 0, up: true };
        const current = series[series.length - 1];
        const previous = series[series.length - 2] || 0;
        if (previous === 0) return { val: 100, up: true };
        const diff = ((current - previous) / previous) * 100;
        return { val: Math.abs(Math.round(diff)), up: diff >= 0 };
    };

    const revTrend = calculateTrend(revs);
    const ordTrend = calculateTrend(ords);

    renderPremiumChart('revenue-chart', dates, revs, '#F5A800', 'Revenue', revTrend);
    renderPremiumChart('orders-chart', dates, ords, '#3B82F6', 'Orders', ordTrend);
    renderPremiumChart('analytics-revenue-chart', dates, revs, '#F5A800', 'Revenue', revTrend);
    renderPremiumChart('analytics-orders-chart', dates, ords, '#3B82F6', 'Orders', ordTrend);
};

const renderPremiumChart = (id, labels, data, color, label, trend) => {
    const el = document.getElementById(id);
    if (!el) return;

    const hasData = data.length > 0 && data.some(v => v > 0);
    if (!hasData) {
        el.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center gap-3 opacity-30">
                <span class="text-4xl">📊</span>
                <p class="text-[10px] font-bold uppercase tracking-widest text-center">No data trends yet</p>
            </div>
        `;
        return;
    }

    // Add trend indicator to parent if possible
    const parent = el.parentElement;
    const existingTrend = parent.querySelector('.trend-indicator');
    if (existingTrend) existingTrend.remove();

    const trendHtml = `
        <div class="trend-indicator absolute top-6 right-6 flex items-center gap-1 font-black text-[10px] ${trend.up ? 'text-green-500' : 'text-red-500'}">
            ${trend.up ? '↑' : '↓'} ${trend.val}%
            <span class="text-gray-600 font-bold ml-1 uppercase">vs yesterday</span>
        </div>
    `;
    parent.insertAdjacentHTML('beforeend', trendHtml);

    // Destroy existing
    if (activeCharts[id]) activeCharts[id].destroy();

    // Setup Canvas
    el.innerHTML = '<canvas></canvas>';
    const ctx = el.querySelector('canvas').getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, `${color}33`);
    gradient.addColorStop(1, `${color}00`);

    activeCharts[id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(d => d.split('-').slice(1).join('/')), // Shorten dates
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e2130',
                    titleColor: '#9ca3af',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => `${label}: ${label === 'Revenue' ? '₹' : ''}${ctx.raw}`
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { color: '#4b5563', font: { size: 10, weight: 'bold' } }
                },
                y: {
                    display: false,
                    grid: { display: false }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            }
        }
    });
};

/**
 * 🔔 Notifications
 */
const triggerNewOrderAlert = (order) => {
    // Play notification sound
    const audio = document.querySelector('#notif-sound');
    if (audio) { audio.currentTime = 0; audio.play().catch(console.warn); }

    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }

    // Show toast notification with order details
    if (newOrderToast) {
        const orderSummary = order ? 
            `${order.orderId || order.id.slice(0, 8)} - ₹${order.total}` :
            'New Order Received!';
        
        newOrderToast.innerHTML = `<strong>📦 NEW ORDER:</strong> ${orderSummary}`;
        newOrderToast.style.cursor = 'pointer';
        newOrderToast.classList.remove('hidden');
        
        // Click to navigate to orders view
        const clickHandler = () => {
            document.querySelector('[data-view="orders"]').click();
            newOrderToast.removeEventListener('click', clickHandler);
        };
        newOrderToast.addEventListener('click', clickHandler);
        
        setTimeout(() => {
            newOrderToast.classList.add('hidden');
            newOrderToast.removeEventListener('click', clickHandler);
        }, 6000);
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

const setupNotificationBell = () => {
    const bellElement = document.querySelector('.notification-bell');
    if (!bellElement) return;

    bellElement.addEventListener('click', () => {
        const pendingOrders = activeOrders.filter(o => [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING].includes(o.status));

        if (pendingOrders.length === 0) {
            alert('No new notifications or pending orders.');
            return;
        }

        // Create modal for notifications
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:1001;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#12151f;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;width:580px;max-height:80vh;overflow-y:auto;animation:fadeIn 0.25s ease;">
                <div style="display:flex;justifyContent:space-between;alignItems:center;marginBottom:20px;">
                    <h3 style="fontFamily:'Syne',sans-serif;fontSize:20px;margin:0;">🔔 Pending Orders (${pendingOrders.length})</h3>
                    <button onclick="this.closest('[style*=position:fixed]').remove();" style="background:rgba(255,255,255,0.06);border:none;color:white;borderRadius:8px;padding:6px 12px;cursor:pointer;fontSize:16px;">✕</button>
                </div>
                <div style="display:flex;flexDirection:column;gap:12px;">
                    ${pendingOrders.map(order => `
                        <div style="background:#1a1e2e;borderRadius:12px;padding:16px;border:1px solid rgba(255,255,255,0.06);">
                            <div style="display:flex;justifyContent:space-between;marginBottom:8px;">
                                <span style="fontWeight:700;fontSize:14px;">${order.orderId || order.id.slice(0, 8)}</span>
                                <span style="color:#f5a623;fontWeight:700;">₹${order.total}</span>
                            </div>
                            <div style="color:#6b7280;fontSize:12px;marginBottom:8px;">
                                👤 ${order.customer?.name || 'N/A'} · 📍 ${order.customer?.address || 'N/A'}
                            </div>
                            <div style="color:#6b7280;fontSize:12px;">
                                Items: ${order.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                            </div>
                            <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.05);">
                                <span style="background:${order.status === ORDER_STATUS.PLACED ? 'rgba(245,158,11,0.1)' : order.status === ORDER_STATUS.ACCEPTED ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)'};color:${order.status === ORDER_STATUS.PLACED ? '#f5a623' : order.status === ORDER_STATUS.ACCEPTED ? '#22c55e' : '#3b82f6'};padding:4px 12px;borderRadius:999px;fontSize:11px;fontWeight:600;textTransform:uppercase;">
                                    ${order.status}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('[style*=position:fixed]').remove();" style="marginTop:24px;width:100%;padding:10px 20px;background:#374151;color:white;border:none;borderRadius:8px;cursor:pointer;fontWeight:600;">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    });
};

// Fire it up
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    initMobileSidebarToggle();
});

/**
 * 🎟️ COUPON ADMIN (Item 6)
 */
// ─── Coupon Drawer ─────────────────────────────────────────────────────────
let _freebieItems = [];
let _specialItems = [];
let _comboItems = [];

const COUPON_TYPE_META = {
    flat: { icon: '🏷️', title: 'Create Flat Discount', subtitle: 'Fixed ₹ amount off every order', color: '#F5A800' },
    flat_percent: { icon: '🏷️', title: 'Create Flat Percent', subtitle: '% off with no cap', color: '#F5A800' },
    percentage: { icon: '💸', title: 'Create Percentage Discount', subtitle: '% based discount with optional cap', color: '#3B82F6' },
    freebie: { icon: '🎁', title: 'Create Free Item Coupon', subtitle: 'Gift a free dish above order value', color: '#10B981' },
    special_price: { icon: '⚡', title: 'Create Special Price', subtitle: 'Unlock an item at offer price', color: '#8B5CF6' },
    combo_upgrade: { icon: '🔄', title: 'Create Combo Upgrade', subtitle: 'Upgrade an item for a small charge', color: '#EC4899' },
};

window.openCouponDrawer = (type) => {
    // Reset form fields first
    resetCouponForm();

    // Set hidden select value (JS logic reads it)
    const typeSelect = document.querySelector('#new-coupon-type');
    if (typeSelect) { typeSelect.value = type; typeSelect.dispatchEvent(new Event('change')); }

    // Update drawer header
    const meta = COUPON_TYPE_META[type] || COUPON_TYPE_META.flat;
    const iconEl = document.getElementById('coupon-drawer-icon');
    const titleEl = document.getElementById('coupon-drawer-title');
    const subEl = document.getElementById('coupon-drawer-subtitle');
    if (iconEl) { iconEl.textContent = meta.icon; iconEl.style.background = `${meta.color}20`; }
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.subtitle;

    // Update create button color
    const btn = document.getElementById('create-coupon-btn');
    if (btn) { btn.style.background = meta.color; btn.style.color = type === 'flat' ? '#000' : '#fff'; }

    // Show drawer
    const overlay = document.getElementById('coupon-drawer-overlay');
    const panel = document.getElementById('coupon-drawer-panel');
    if (overlay) overlay.style.display = 'block';
    if (panel) { panel.style.right = '0'; }
    document.body.style.overflow = 'hidden';

    // Ensure setupCouponAdmin ran
    setupCouponAdmin();
};

window.closeCouponDrawer = () => {
    const overlay = document.getElementById('coupon-drawer-overlay');
    const panel = document.getElementById('coupon-drawer-panel');
    if (overlay) overlay.style.display = 'none';
    if (panel) panel.style.right = '-520px';
    document.body.style.overflow = '';
};

// Filter buttons for coupon list
let _allCouponsCache = [];
window.filterCoupons = (filter) => {
    ['all', 'active', 'expired'].forEach(f => {
        const btn = document.getElementById(`coupon-filter-${f}`);
        if (btn) {
            btn.style.background = f === filter ? '#F5A800' : 'transparent';
            btn.style.color = f === filter ? '#000' : '#9ca3af';
            btn.style.border = f === filter ? 'none' : '1px solid #374151';
        }
    });
    renderCouponList(_allCouponsCache, filter);
};

const renderCouponList = (coupons, filter = 'all') => {
    const listEl = document.querySelector('#coupons-list');
    if (!listEl) return;

    const now = new Date();
    let filtered = coupons;
    if (filter === 'active') filtered = coupons.filter(c => c.active !== false && !(c.expiresAt?.toDate && now > c.expiresAt.toDate()));
    if (filter === 'expired') filtered = coupons.filter(c => c.expiresAt?.toDate && now > c.expiresAt.toDate());

    if (filtered.length === 0) {
        listEl.innerHTML = '<p style="color:#7a8098;padding:20px 0;">No coupons found.</p>';
        return;
    }

    const TYPE_COLORS = { flat: '#F5A800', percentage: '#3B82F6', freebie: '#10B981', special_price: '#8B5CF6', combo_upgrade: '#EC4899' };
    const TYPE_ICONS = { flat: '🏷️', percentage: '💸', freebie: '🎁', special_price: '⚡', combo_upgrade: '🔄' };

    listEl.innerHTML = filtered.map(c => {
        const expiry = c.expiresAt?.toDate ? c.expiresAt.toDate().toLocaleString('en-IN') : 'No expiry';
        const isExpired = c.expiresAt?.toDate && now > c.expiresAt.toDate();
        const usageInfo = c.maxUses > 0 ? `${c.usedCount || 0}/${c.maxUses} used` : 'Unlimited';
        const color = TYPE_COLORS[c.type] || '#F5A800';
        const icon = TYPE_ICONS[c.type] || '🎟️';

        let couponDetails = '';
        switch (c.type) {
            case 'percentage': couponDetails = `${c.discountPercent}% OFF${c.maxDiscount ? ` (Max ₹${c.maxDiscount})` : ''}`; break;
            case 'flat': couponDetails = `₹${c.discountAmount} OFF`; break;
            case 'flat_percent': couponDetails = `${c.discountPercent}% OFF`; break;
            case 'freebie':
                if (c.freebieItems && c.freebieItems.length > 0) couponDetails = `Free ${c.freebieItems.map(i => i.name).join(', ')}`;
                else couponDetails = `Free ${c.freeItemName}${c.freeItemQuantity > 1 ? ` ×${c.freeItemQuantity}` : ''}`;
                break;
            case 'special_price':
                if (c.specialItems && c.specialItems.length > 0) couponDetails = `${c.specialItems.length} items @ special price`;
                else couponDetails = `${c.productName} @ ₹${c.offerPrice}`;
                break;
            case 'combo_upgrade':
                if (c.comboItems && c.comboItems.length > 0) couponDetails = `${c.comboItems.length} upgrades`;
                else couponDetails = c.upgradeDescription;
                break;
            default: couponDetails = `₹${c.discountAmount} OFF`; break;
        }

        return `
        <div style="background:#12141b;border:1px solid #252830;border-radius:16px;padding:18px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:44px;height:44px;background:${color}18;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${icon}</div>
            <div style="flex:1;min-width:160px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                    <span style="font-size:15px;font-weight:900;color:${color};letter-spacing:1px;">${c.id}</span>
                    <span style="background:${color}18;color:${color};font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">${couponDetails}</span>
                    ${isExpired
                ? '<span style="background:rgba(239,68,68,0.1);color:#ef4444;font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;text-transform:uppercase;">Expired</span>'
                : (c.active !== false
                    ? '<span style="background:rgba(16,185,129,0.1);color:#10B981;font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;text-transform:uppercase;">Active</span>'
                    : '<span style="background:rgba(156,163,175,0.1);color:#9ca3af;font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;text-transform:uppercase;">Inactive</span>')}
                    ${c.autoApply ? '<span style="background:rgba(59,130,246,0.1);color:#3B82F6;font-size:9px;font-weight:800;padding:3px 8px;border-radius:20px;text-transform:uppercase;">Auto</span>' : ''}
                </div>
                <p style="font-size:11px;color:#7a8098;font-weight:600;">Min ₹${c.minOrderValue || 0} &nbsp;·&nbsp; ${usageInfo} &nbsp;·&nbsp; Expires: ${expiry}</p>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button onclick="window.adminEditCoupon('${c.id}')"
                    style="padding:8px 16px;background:#1e2130;border:1px solid #374151;border-radius:10px;color:#fff;font-size:12px;font-weight:700;cursor:pointer;">✏️ Edit</button>
                <button onclick="window.adminDeleteCoupon('${c.id}')"
                    style="padding:8px 14px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;color:#ef4444;font-size:12px;font-weight:700;cursor:pointer;">🗑</button>
            </div>
        </div>`;
    }).join('');
};

// ─── End Coupon Drawer ──────────────────────────────────────────────────────

const loadCoupons = async () => {
    const listEl = document.querySelector('#coupons-list');
    if (!listEl) return;
    listEl.innerHTML = '<p style="color:#7a8098;">Loading...</p>';
    const coupons = await fetchAllCoupons();

    _allCouponsCache = coupons;

    // Update KPI counts
    const now = new Date();
    const activeCount = coupons.filter(c => c.active !== false && !(c.expiresAt?.toDate && now > c.expiresAt.toDate())).length;
    const expiredCount = coupons.filter(c => c.expiresAt?.toDate && now > c.expiresAt.toDate()).length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const activeEl = document.getElementById('coupon-active-count');
    const expiredEl = document.getElementById('coupon-expired-count');
    const usesEl = document.getElementById('coupon-total-uses');
    if (activeEl) activeEl.textContent = activeCount;
    if (expiredEl) expiredEl.textContent = expiredCount;
    if (usesEl) usesEl.textContent = totalUses;

    renderCouponList(coupons, 'all');
};

window.addFreebieItem = () => {
    const name = document.querySelector('#new-coupon-free-item')?.value.trim();
    const quantity = parseInt(document.querySelector('#new-coupon-free-quantity')?.value) || 1;
    if (name) {
        _freebieItems.push({ name, quantity });
        document.querySelector('#new-coupon-free-item').value = '';
        document.querySelector('#new-coupon-free-quantity').value = '1';
        renderFreebieItems();
        generateCouponDescription();
    }
};
window.removeFreebieItem = (index) => {
    _freebieItems.splice(index, 1);
    renderFreebieItems();
    generateCouponDescription();
};
const renderFreebieItems = () => {
    const list = document.querySelector('#freebie-items-list');
    if (!list) return;
    list.innerHTML = _freebieItems.map((item, index) => `
        <div style="display:flex;justify-content:space-between;background:#1a1c23;padding:8px 12px;border-radius:8px;margin-top:8px;border:1px solid #252830;">
            <span style="color:#fff;font-size:13px;">${item.name} (x${item.quantity})</span>
            <button type="button" onclick="window.removeFreebieItem(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold;">✕</button>
        </div>
    `).join('');
};

window.addSpecialItem = () => {
    const name = document.querySelector('#new-coupon-product-name')?.value.trim();
    const price = parseInt(document.querySelector('#new-coupon-offer-price')?.value);
    if (name && !isNaN(price)) {
        _specialItems.push({ name, price });
        document.querySelector('#new-coupon-product-name').value = '';
        document.querySelector('#new-coupon-offer-price').value = '';
        renderSpecialItems();
        generateCouponDescription();
    }
};
window.removeSpecialItem = (index) => {
    _specialItems.splice(index, 1);
    renderSpecialItems();
    generateCouponDescription();
};
const renderSpecialItems = () => {
    const list = document.querySelector('#special-items-list');
    if (!list) return;
    list.innerHTML = _specialItems.map((item, index) => `
        <div style="display:flex;justify-content:space-between;background:#1a1c23;padding:8px 12px;border-radius:8px;margin-top:8px;border:1px solid #252830;">
            <span style="color:#fff;font-size:13px;">${item.name} @ ₹${item.price}</span>
            <button type="button" onclick="window.removeSpecialItem(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold;">✕</button>
        </div>
    `).join('');
};

window.addComboItem = () => {
    const description = document.querySelector('#new-coupon-upgrade-desc')?.value.trim();
    const price = parseInt(document.querySelector('#new-coupon-upgrade-price')?.value);
    if (description && !isNaN(price)) {
        _comboItems.push({ description, price });
        document.querySelector('#new-coupon-upgrade-desc').value = '';
        document.querySelector('#new-coupon-upgrade-price').value = '';
        renderComboItems();
        generateCouponDescription();
    }
};
window.removeComboItem = (index) => {
    _comboItems.splice(index, 1);
    renderComboItems();
    generateCouponDescription();
};
const renderComboItems = () => {
    const list = document.querySelector('#combo-items-list');
    if (!list) return;
    list.innerHTML = _comboItems.map((item, index) => `
        <div style="display:flex;justify-content:space-between;background:#1a1c23;padding:8px 12px;border-radius:8px;margin-top:8px;border:1px solid #252830;">
            <span style="color:#fff;font-size:13px;">${item.description} (+₹${item.price})</span>
            <button type="button" onclick="window.removeComboItem(${index})" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold;">✕</button>
        </div>
    `).join('');
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

        case 'flat_percent':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Discount %</label>
                        <input id="new-coupon-discount-percent" type="number" placeholder="e.g. 15" min="1" max="100" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                </div>
            `;
            break;

        case 'freebie':
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:1fr 100px auto;gap:12px;align-items:end;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Free Item Name</label>
                        <input id="new-coupon-free-item" type="text" placeholder="e.g. Coke" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Qty</label>
                        <input id="new-coupon-free-quantity" type="number" placeholder="1" min="1" value="1" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <button type="button" onclick="window.addFreebieItem()" style="padding:10px 16px;background:#10B981;color:#000;border:none;border-radius:10px;font-weight:900;cursor:pointer;height:42px;">Add</button>
                </div>
                <div id="freebie-items-list" style="margin-top:16px;"></div>
            `;
            break;

        case 'special_price':
            const specialMenuOptions = menuItems.map(item => `<option value="${item.name}">${item.name} (₹${item.price})</option>`).join('');
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:1fr 100px auto;gap:12px;align-items:end;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Product Name</label>
                        <select id="new-coupon-product-name" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;appearance:none;cursor:pointer;">
                            <option value="">-- Select Menu Item --</option>
                            ${specialMenuOptions}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Price (₹)</label>
                        <input id="new-coupon-offer-price" type="number" placeholder="99" min="0" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <button type="button" onclick="window.addSpecialItem()" style="padding:10px 16px;background:#8B5CF6;color:#fff;border:none;border-radius:10px;font-weight:900;cursor:pointer;height:42px;">Add</button>
                </div>
                <div id="special-items-list" style="margin-top:16px;"></div>
            `;
            break;

        case 'combo_upgrade':
            const comboMenuItems = menuItems.filter(item => {
                const catStr = (item.category || '').toLowerCase();
                const nameStr = (item.name || '').toLowerCase();
                return catStr.includes('combo') || nameStr.includes('combo') ||
                    catStr.includes('meal for one') || nameStr.includes('meal for one') ||
                    catStr.includes('mega feast') || nameStr.includes('mega feast');
            });
            const itemsToUse = comboMenuItems.length > 0 ? comboMenuItems : menuItems;
            const comboMenuOptions = itemsToUse.map(item => `<option value="${item.name}">${item.name} (₹${item.price})</option>`).join('');
            fieldsHTML = `
                <div style="display:grid;grid-template-columns:1fr 100px auto;gap:12px;align-items:end;">
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Upgrade Desc / Item</label>
                        <select id="new-coupon-upgrade-desc" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;appearance:none;cursor:pointer;">
                            <option value="">-- Select Upgrade Item --</option>
                            ${comboMenuOptions}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:800;color:#7a8098;text-transform:uppercase;display:block;margin-bottom:6px;">Price (₹)</label>
                        <input id="new-coupon-upgrade-price" type="number" placeholder="29" min="0" style="width:100%;padding:10px 14px;background:#1a1c23;border:1px solid #252830;border-radius:10px;color:#fff;font-size:14px;outline:none;">
                    </div>
                    <button type="button" onclick="window.addComboItem()" style="padding:10px 16px;background:#EC4899;color:#fff;border:none;border-radius:10px;font-weight:900;cursor:pointer;height:42px;">Add</button>
                </div>
                <div id="combo-items-list" style="margin-top:16px;"></div>
            `;
            break;
    }

    typeFields.innerHTML = fieldsHTML;

    // Move both operations into the same setTimeout so inputs exist when description runs
    setTimeout(() => {
        const inputs = typeFields.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', generateCouponDescription);
        });
        generateCouponDescription();
    }, 50);
};

// Generate coupon description based on form values
const generateCouponDescription = () => {
    const typeSelect = document.querySelector('#new-coupon-type');
    const minOrderInput = document.querySelector('#new-coupon-min');

    const previewEl = document.querySelector('#coupon-desc-preview');

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

        case 'flat_percent':
            const flatPercent = document.querySelector('#new-coupon-discount-percent')?.value;
            if (flatPercent) {
                autoDesc = `Get ${flatPercent}% OFF`;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'freebie':
            if (_freebieItems.length > 0) {
                autoDesc = `Get Free ${_freebieItems.map(i => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')}`;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'special_price':
            if (_specialItems.length > 0) {
                autoDesc = `Unlock ${_specialItems.map(i => `${i.name} @ ₹${i.price}`).join(', ')}`;
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;

        case 'combo_upgrade':
            if (_comboItems.length > 0) {
                autoDesc = _comboItems.map(i => i.description).join(', ');
                if (minOrder > 0) {
                    autoDesc += ` on orders above ₹${minOrder}`;
                }
            }
            break;
    }

    if (previewEl) {
        previewEl.textContent = autoDesc || '(Fill details to see preview)';
        previewEl.style.color = autoDesc ? '#fff' : '#7a8098';
    }

    return autoDesc;
};

const resetCouponForm = () => {
    const inputs = [
        '#new-coupon-code', '#new-coupon-min',
        '#new-coupon-max-uses', '#new-coupon-expiry'
    ];

    inputs.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.value = '';
    });

    _freebieItems = [];
    _specialItems = [];
    _comboItems = [];

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
    if (menuItems.length === 0) {
        getDocs(collection(db, 'menu'))
            .then(snapshot => {
                menuItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); migrateMenuItemDefaults();
                updateCouponTypeFields();
            })
            .catch(err => console.error('Failed to load menu for coupons:', err));
    } else {
        updateCouponTypeFields();
    }

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
        if (expiryInput) expiryInput.value = coupon.expiresAt ? new Date(coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt)).toISOString().slice(0, 16) : '';
        if (autoApplyInput) autoApplyInput.checked = coupon.autoApply || false;
        if (stackableInput) stackableInput.checked = coupon.stackable || false;

        // Update type fields and populate type-specific values
        updateCouponTypeFields();

        // Populate type-specific fields
        setTimeout(() => {
            switch (coupon.type) {
                case 'percentage':
                    document.querySelector('#new-coupon-discount-percent') && (document.querySelector('#new-coupon-discount-percent').value = coupon.discountPercent || '');
                    document.querySelector('#new-coupon-max-discount') && (document.querySelector('#new-coupon-max-discount').value = coupon.maxDiscount || '');
                    document.querySelector('#new-coupon-min-guaranteed') && (document.querySelector('#new-coupon-min-guaranteed').value = coupon.minGuaranteedDiscount || '');
                    break;
                case 'flat':
                    document.querySelector('#new-coupon-discount-amount') && (document.querySelector('#new-coupon-discount-amount').value = coupon.discountAmount || '');
                    break;
                case 'flat_percent':
                    document.querySelector('#new-coupon-discount-percent') && (document.querySelector('#new-coupon-discount-percent').value = coupon.discountPercent || '');
                    break;
                case 'freebie':
                    _freebieItems = coupon.freebieItems || (coupon.freeItemName ? [{ name: coupon.freeItemName, quantity: coupon.freeItemQuantity || 1 }] : []);
                    renderFreebieItems();
                    break;
                case 'special_price':
                    _specialItems = coupon.specialItems || (coupon.productName ? [{ name: coupon.productName, price: coupon.offerPrice || 0 }] : []);
                    renderSpecialItems();
                    break;
                case 'combo_upgrade':
                    _comboItems = coupon.comboItems || (coupon.upgradeDescription ? [{ description: coupon.upgradeDescription, price: coupon.upgradePrice || 0 }] : []);
                    renderComboItems();
                    break;
            }
        }, 10);

        if (msg) { msg.textContent = `Editing coupon ${coupon.id}. Update the values and save.`; msg.style.color = '#F59E0B'; }
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        createBtn.textContent = 'Update Coupon';
    };

    cancelBtn?.addEventListener('click', () => { resetCouponForm(); window.closeCouponDrawer(); });

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
                case 'flat_percent':
                    couponPayload.discountPercent = parseInt(document.querySelector('#new-coupon-discount-percent')?.value || '0');
                    break;
                case 'freebie':
                    couponPayload.freebieItems = [..._freebieItems];
                    break;
                case 'special_price':
                    couponPayload.specialItems = [..._specialItems];
                    break;
                case 'combo_upgrade':
                    couponPayload.comboItems = [..._comboItems];
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
                case 'flat_percent':
                    if (!couponPayload.discountPercent || couponPayload.discountPercent <= 0) validationErrors.push('Discount % is required.');
                    break;
                case 'freebie':
                    if (!couponPayload.freebieItems || couponPayload.freebieItems.length === 0) validationErrors.push('At least one free item is required.');
                    break;
                case 'special_price':
                    if (!couponPayload.specialItems || couponPayload.specialItems.length === 0) validationErrors.push('At least one special price item is required.');
                    break;
                case 'combo_upgrade':
                    if (!couponPayload.comboItems || couponPayload.comboItems.length === 0) validationErrors.push('At least one combo upgrade is required.');
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

            // Close drawer after short delay so user sees success message
            setTimeout(() => { window.closeCouponDrawer(); }, 900);
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

        // Open drawer for the right type first
        window.openCouponDrawer(coupon.type || 'flat');

        // Small delay so drawer fields are rendered
        await new Promise(r => setTimeout(r, 60));

        const cancelBtn = document.querySelector('#cancel-coupon-edit-btn');
        const createBtn = document.querySelector('#create-coupon-btn');
        const msg = document.querySelector('#coupon-create-msg');

        if (cancelBtn) { cancelBtn.style.display = 'inline-flex'; }
        if (createBtn) { createBtn.textContent = 'Update Coupon'; }
        if (msg) { msg.textContent = `Editing "${code}" — update and save.`; msg.style.color = '#F59E0B'; }

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
        if (expiryInput) expiryInput.value = coupon.expiresAt ? new Date(coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt)).toISOString().slice(0, 16) : '';
        if (autoApplyInput) autoApplyInput.checked = coupon.autoApply || false;
        if (stackableInput) stackableInput.checked = coupon.stackable || false;

        updateCouponTypeFields();

        setTimeout(() => {
            switch (coupon.type) {
                case 'percentage':
                    document.querySelector('#new-coupon-discount-percent')?.value !== undefined && (document.querySelector('#new-coupon-discount-percent').value = coupon.discountPercent || '');
                    document.querySelector('#new-coupon-max-discount')?.value !== undefined && (document.querySelector('#new-coupon-max-discount').value = coupon.maxDiscount || '');
                    document.querySelector('#new-coupon-min-guaranteed')?.value !== undefined && (document.querySelector('#new-coupon-min-guaranteed').value = coupon.minGuaranteedDiscount || '');
                    break;
                case 'flat':
                    document.querySelector('#new-coupon-discount-amount')?.value !== undefined && (document.querySelector('#new-coupon-discount-amount').value = coupon.discountAmount || '');
                    break;
                case 'freebie':
                    document.querySelector('#new-coupon-free-item')?.value !== undefined && (document.querySelector('#new-coupon-free-item').value = coupon.freeItemName || '');
                    document.querySelector('#new-coupon-free-quantity')?.value !== undefined && (document.querySelector('#new-coupon-free-quantity').value = coupon.freeItemQuantity || 1);
                    break;
                case 'special_price':
                    document.querySelector('#new-coupon-product-name')?.value !== undefined && (document.querySelector('#new-coupon-product-name').value = coupon.productName || '');
                    document.querySelector('#new-coupon-offer-price')?.value !== undefined && (document.querySelector('#new-coupon-offer-price').value = coupon.offerPrice || '');
                    break;
                case 'combo_upgrade':
                    document.querySelector('#new-coupon-upgrade-desc')?.value !== undefined && (document.querySelector('#new-coupon-upgrade-desc').value = coupon.upgradeDescription || '');
                    document.querySelector('#new-coupon-upgrade-price')?.value !== undefined && (document.querySelector('#new-coupon-upgrade-price').value = coupon.upgradePrice || '');
                    break;
            }
        }, 80);
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
            <div class="announcement-card-premium">
                ${imageSource ? `<img src="${imageSource}" style="width:100px;height:70px;object-fit:cover;border-radius:14px;flex-shrink:0;box-shadow: 0 8px 20px rgba(0,0,0,0.3);">` : '<div style="width:100px;height:70px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:32px;">📢</div>'}
                <div style="flex:1;min-width:0;">
                    <p style="font-weight:900;color:#fff;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-display);">${a.title || '(No title)'}</p>
                    <div style="display:flex;gap:12px;align-items:center;margin-top:8px;">
                        ${isExpired ? '<span class="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase border border-red-500/20">Expired</span>' : (a.active ? '<span class="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px] font-black uppercase border border-green-500/20">Live</span>' : '<span class="px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 text-[9px] font-black uppercase border border-gray-500/20">Hidden</span>')}
                        <p style="font-size:11px;color:#7a8098;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Ends: ${expiry}</p>
                    </div>
                </div>
                <div style="display:flex;gap:10px;flex-shrink:0;">
                    <button onclick="window.adminToggleAnn('${a.id}', ${!a.active})" class="action-btn-sm bg-gray-800 text-white hover:bg-gray-700">${a.active ? 'Hide' : 'Publish'}</button>
                    <button onclick="window.adminDeleteAnn('${a.id}', '${a.storagePath || ''}')" class="action-btn-sm bg-red-950/30 text-red-500 border border-red-500/20 hover:bg-red-900/40">Delete</button>
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
let activeCharts = {}; // Store active Chart.js instances for cleanup

const setupAnalyticsAdmin = () => {
    // Load menu analytics dashboard
    loadMenuAnalytics();
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

/**
 * 📊 MENU ANALYTICS DASHBOARD (Phase 6 Task 6.3)
 */
const loadMenuAnalytics = async () => {
    try {
        // Calculate analytics from menu items
        const analytics = calculateMenuAnalytics();

        // Update KPI cards immediately (fast)
        updateMenuAnalyticsKPIs(analytics);

        // Lazy load charts with IntersectionObserver for better performance
        const categoryChartEl = document.querySelector('#category-chart');
        const priceChartEl = document.querySelector('#price-chart');

        if (categoryChartEl && !chartsLoadedFlags['categoryChart']) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !chartsLoadedFlags['categoryChart']) {
                    chartsLoadedFlags['categoryChart'] = true;
                    renderCategoryChart(analytics.categoryData);
                    observer.unobserve(categoryChartEl);
                }
            });
            observer.observe(categoryChartEl);
        } else if (categoryChartEl) {
            renderCategoryChart(analytics.categoryData);
        }

        if (priceChartEl && !chartsLoadedFlags['priceChart']) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !chartsLoadedFlags['priceChart']) {
                    chartsLoadedFlags['priceChart'] = true;
                    renderPriceChart(analytics.priceData);
                    observer.unobserve(priceChartEl);
                }
            });
            observer.observe(priceChartEl);
        } else if (priceChartEl) {
            renderPriceChart(analytics.priceData);
        }

        // Update overview table asynchronously
        setTimeout(() => {
            renderMenuAnalyticsTable(analytics);
        }, 100);

    } catch (error) {
        console.error('Error loading menu analytics:', error);
        showAnalyticsError('Failed to load menu analytics. Please try again.');
    }
};

const calculateMenuAnalytics = () => {
    const totalItems = menuItems.length;
    const availableItems = menuItems.filter(item => item.available !== false).length;
    const outOfStockItems = menuItems.filter(item => item.inStock === false).length;
    const hiddenItems = totalItems - availableItems;

    // Category distribution
    const categoryData = {};
    menuItems.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });

    // Price distribution (buckets)
    const priceData = {
        '₹0-50': 0,
        '₹51-100': 0,
        '₹101-200': 0,
        '₹201-500': 0,
        '₹500+': 0
    };

    const prices = [];
    menuItems.forEach(item => {
        const price = item.price || 0;
        prices.push(price);
        if (price <= 50) priceData['₹0-50']++;
        else if (price <= 100) priceData['₹51-100']++;
        else if (price <= 200) priceData['₹101-200']++;
        else if (price <= 500) priceData['₹201-500']++;
        else priceData['₹500+']++;
    });

    // Calculate price statistics
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const maxPrice = Math.max(...prices, 0);
    const minPrice = Math.min(...prices, 0);

    // Low stock items (stock < 10)
    const lowStockItems = menuItems.filter(item => item.inStock === false).length;

    // Veg/Non-Veg split
    const vegItems = menuItems.filter(item => item.veg === true).length;
    const nonVegItems = menuItems.filter(item => item.veg === false).length;

    return {
        totalItems,
        availableItems,
        outOfStockItems,
        hiddenItems,
        categoryData,
        priceData,
        items: menuItems,
        stats: {
            avgPrice: Math.round(avgPrice),
            maxPrice,
            minPrice,
            lowStockItems,
            vegItems,
            nonVegItems
        }
    };
};

const updateMenuAnalyticsKPIs = (analytics) => {
    const totalEl = document.querySelector('#analytics-total-items');
    const availableEl = document.querySelector('#analytics-available-items');
    const outOfStockEl = document.querySelector('#analytics-out-of-stock');
    const hiddenEl = document.querySelector('#analytics-hidden-items');
    const avgPriceEl = document.querySelector('#analytics-avg-price');
    const lowStockEl = document.querySelector('#analytics-low-stock');
    const vegEl = document.querySelector('#analytics-veg-items');
    const nonVegEl = document.querySelector('#analytics-nonveg-items');

    if (totalEl) totalEl.textContent = analytics.totalItems;
    if (availableEl) availableEl.textContent = analytics.availableItems;
    if (outOfStockEl) outOfStockEl.textContent = analytics.outOfStockItems;
    if (hiddenEl) hiddenEl.textContent = analytics.hiddenItems;
    if (avgPriceEl) avgPriceEl.textContent = `₹${analytics.stats.avgPrice}`;
    if (lowStockEl) lowStockEl.textContent = analytics.stats.lowStockItems;
    if (vegEl) vegEl.textContent = analytics.stats.vegItems;
    if (nonVegEl) nonVegEl.textContent = analytics.stats.nonVegItems;
};

const renderCategoryChart = (categoryData) => {
    const chartEl = document.querySelector('#category-chart');
    if (!chartEl) return;

    const entries = Object.entries(categoryData);
    if (entries.length === 0) {
        chartEl.innerHTML = '<p style="color:#6b7280;font-size:12px;text-align:center;padding:24px;">No category data</p>';
        return;
    }

    if (activeCharts['categoryChart']) activeCharts['categoryChart'].destroy();
    chartEl.innerHTML = '<canvas></canvas>';
    const ctx = chartEl.querySelector('canvas').getContext('2d');
    const labels = entries.map(([cat]) => cat);
    const data = entries.map(([, count]) => count);
    const colors = ['#F5A800','#3B82F6','#10B981','#EF4444','#8B5CF6','#EC4899','#06B6D4','#F59E0B'];

    activeCharts['categoryChart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderColor: '#0d0f14', borderWidth: 3 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '62%',
            animation: { animateRotate: true, animateScale: false, duration: 900, easing: 'easeOutQuart' },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#9CA3AF', padding: 14, font: { size: 11, weight: '600' }, usePointStyle: true, pointStyleWidth: 8 } },
                tooltip: {
                    backgroundColor: '#1e2130', titleColor: '#9ca3af', bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 10,
                    callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} items` }
                }
            }
        }
    });
};

const renderPriceChart = (priceData) => {
    const chartEl = document.querySelector('#price-chart');
    if (!chartEl) return;

    const entries = Object.entries(priceData);
    if (entries.length === 0) {
        chartEl.innerHTML = '<p style="color:#6b7280;font-size:12px;text-align:center;padding:24px;">No price data</p>';
        return;
    }

    if (activeCharts['priceChart']) activeCharts['priceChart'].destroy();
    chartEl.innerHTML = '<canvas></canvas>';
    const ctx = chartEl.querySelector('canvas').getContext('2d');
    const labels = entries.map(([range]) => range);
    const data = entries.map(([, count]) => count);

    const grad = ctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, 'rgba(59,130,246,0.6)');
    grad.addColorStop(1, 'rgba(59,130,246,0.15)');

    activeCharts['priceChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Items',
                data,
                backgroundColor: data.map((v, i) => i === data.indexOf(Math.max(...data)) ? '#F5A800' : 'rgba(59,130,246,0.65)'),
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e2130', titleColor: '#9ca3af', bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, padding: 10,
                    callbacks: { label: (ctx) => ` ${ctx.parsed.y} items` }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10, weight: '600' } } },
                y: { display: false, grid: { display: false } }
            }
        }
    });
};

const renderMenuAnalyticsTable = (analytics) => {
    const tableBody = document.querySelector('#analytics-table-body');
    if (!tableBody) return;

    if (analytics.items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:#6b7280;font-size:13px;">No menu items available</td></tr>';
        return;
    }

    const sorted = [...analytics.items].sort((a, b) => {
        if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
        return (a.name || '').localeCompare(b.name || '');
    });

    tableBody.innerHTML = sorted.map(item => {
        const stock = item.inStock !== false;
        const isVisible = item.available !== false;
        const isVeg = item.veg === true;
        return `
            <tr style="border-bottom:1px solid #1e2130;transition:background .15s;" onmouseover="this.style.background='#12141b'" onmouseout="this.style.background=''">
                <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#e5e7eb;">${item.name || 'Untitled'}</td>
                <td style="padding:10px 12px;font-size:11px;color:#9ca3af;">${item.category || 'Uncategorized'}</td>
                <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#F5A800;font-family:'Syne',sans-serif;">₹${item.price ?? 0}</td>
                <td style="padding:10px 12px;">
                    <span style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;border:1px solid;
                        ${stock ? 'background:rgba(16,185,129,.1);color:#34d399;border-color:rgba(16,185,129,.3);' : 'background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.3);'}">
                        ${stock ? 'In Stock' : 'Out'}
                    </span>
                </td>
                <td style="padding:10px 12px;">
                    <span style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;border:1px solid;
                        ${isVisible ? 'background:rgba(16,185,129,.1);color:#34d399;border-color:rgba(16,185,129,.3);' : 'background:rgba(107,114,128,.1);color:#9ca3af;border-color:rgba(107,114,128,.3);'}">
                        ${isVisible ? 'Visible' : 'Hidden'}
                    </span>
                </td>
                <td style="padding:10px 12px;">
                    <span style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700;border:1px solid;
                        ${isVeg ? 'background:rgba(16,185,129,.1);color:#34d399;border-color:rgba(16,185,129,.3);' : 'background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.3);'}">
                        ${isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
};

const initSettings = async () => {
    const input = document.getElementById('admin-delivery-fee-input');
    const saveBtn = document.getElementById('admin-delivery-fee-save');
    const status = document.getElementById('admin-delivery-fee-status');
    if (!input || !saveBtn) return;

    // Load current value from Firestore
    try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists() && snap.data().deliveryFee !== undefined) {
            input.value = snap.data().deliveryFee;
        } else {
            input.value = 30;
        }
    } catch (e) {
        input.value = 30;
    }

    saveBtn.addEventListener('click', async () => {
        const fee = parseInt(input.value);
        if (isNaN(fee) || fee < 0) return;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        try {
            await setDoc(doc(db, 'settings', 'store'), { deliveryFee: fee }, { merge: true });
            status.style.display = 'block';
            setTimeout(() => { status.style.display = 'none'; }, 3000);
        } catch (e) {
            alert('Failed to save. Check Firestore connection.');
        }
        saveBtn.textContent = 'Save';
        saveBtn.disabled = false;
    });
};


const migrateMenuItemDefaults = async () => {
    if (localStorage.getItem('lw_migration_v2') === 'done') return;
    if (!menuItems || menuItems.length === 0) return; // Wait until data is loaded

    console.log('Running menu item v2 migration...');
    const batch = writeBatch(db);
    let count = 0;

    menuItems.forEach(item => {
        let needsUpdate = false;
        const updates = {};

        if (item.prepTime === undefined) {
            updates.prepTime = 15;
            needsUpdate = true;
        }
        if (item.tags === undefined) {
            updates.tags = [];
            needsUpdate = true;
        }
        if (item.spiceLevel === undefined) {
            const name = (item.name || "").toLowerCase();
            if (name.includes("thecha")) {
                updates.spiceLevel = "extra_spicy";
            } else if (name.includes("chilly") || name.includes("chilli") || name.includes("chili") || name.includes("spicy")) {
                updates.spiceLevel = "spicy";
            } else {
                updates.spiceLevel = "regular";
            }
            needsUpdate = true;
        }

        if (needsUpdate) {
            const ref = doc(db, 'menu', item.id);
            batch.update(ref, updates);
            count++;
        }
    });

    if (count > 0) {
        try {
            await batch.commit();
            console.log(`Migrated ${count} menu items.`);
            if (window.showToast) window.showToast('✅ Menu items updated with new fields', 'success');
        } catch (e) {
            console.error('Migration failed:', e);
            return; // don't set done if failed
        }
    }
    localStorage.setItem('lw_migration_v2', 'done');
};