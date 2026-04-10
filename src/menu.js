import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { renderMenu } from './menu/render';
import { addItem } from './store/cart';
import { fetchOrdersByUser } from './api/orders';

/**
 * 🍱 LITTIWALE MENU ENGINE
 * Standalone entry point for menu.html
 */

let menuData = [];

const initMenu = async () => {
    console.log('🍱 Littiwale Menu Page Initializing...');

    // 1. AUTH & NAVIGATION STATE
    onAuthChange((user) => {
        const isGuest = localStorage.getItem('littiwale_guest') === 'true';
        const profileArea = document.querySelector('#nav-profile-area');
        const app = document.querySelector('#app');
        if (app) app.classList.remove('hidden');

        if (profileArea) {
            if (user) {
                const displayName = user.profile?.name || user.displayName || 'User';
                const email = user.profile?.email || user.email || '';
                const initial = displayName.charAt(0).toUpperCase();
                profileArea.innerHTML = `
                    <div class="lw-profile-wrap" id="menu-profile-wrap">
                        <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Hi, ${displayName.split(' ')[0]}</span>
                        <button class="lw-avatar-btn" id="menu-avatar-trigger" aria-haspopup="true" aria-expanded="false">${initial}</button>
                        <div class="lw-dropdown" id="menu-profile-dropdown" role="menu">
                            <div class="lw-dropdown-header">
                                <p>${displayName}</p>
                                <span>${email}</span>
                            </div>
                            <button class="lw-dropdown-item" id="menu-dd-profile">👤 My Profile</button>
                            <button class="lw-dropdown-item" id="menu-dd-orders">📦 My Orders</button>
                            <div class="lw-dropdown-divider"></div>
                            <button class="lw-dropdown-item danger" id="menu-dd-logout">🚪 Logout</button>
                        </div>
                    </div>
                `;

                const trigger = document.getElementById('menu-avatar-trigger');
                const dropdown = document.getElementById('menu-profile-dropdown');
                trigger?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = dropdown.classList.contains('open');
                    dropdown.classList.toggle('open', !isOpen);
                    trigger.setAttribute('aria-expanded', !isOpen);
                });
                document.addEventListener('click', () => {
                    dropdown?.classList.remove('open');
                    trigger?.setAttribute('aria-expanded', 'false');
                });

                document.getElementById('menu-dd-profile')?.addEventListener('click', () => {
                    window.location.href = '/customer/index.html#reach';
                    dropdown.classList.remove('open');
                });
                document.getElementById('menu-dd-orders')?.addEventListener('click', () => {
                    window.location.href = '/customer/track.html';
                    dropdown.classList.remove('open');
                });
                document.getElementById('menu-dd-logout')?.addEventListener('click', async () => {
                    await logoutUser();
                    localStorage.removeItem('littiwale_guest');
                    window.location.href = '/login.html';
                });

            } else if (isGuest) {
                profileArea.innerHTML = `<span style="font-size:12px;font-weight:700;color:var(--text-secondary);cursor:pointer;" onclick="window.location.href='/login.html'">Hi, Guest 👋</span>`;
            } else {
                profileArea.innerHTML = `<a href="/login.html" class="btn btn-primary" style="padding:8px 16px;font-size:12px;">Login</a>`;
            }
        }
    });

    // 2. FETCH & RENDER MENU
    const container = document.querySelector('#menu-grid-container');
    try {
        menuData = await fetchMenuItems();
        if (menuData.length > 0) {
            renderMenu(container, menuData);
            initMenuSearch(menuData);
        }
    } catch (err) { 
        console.error('Menu load failed:', err);
        if (container) container.innerHTML = '<p class="text-center text-error">Failed to load menu. Please refresh.</p>';
    }

    // 3. CART & CHECKOUT
    updateCartUI();
    initCheckout();

    // Global Cart Badge Sync
    const syncCartBadges = () => {
        const counts = JSON.parse(localStorage.getItem('littiwale_cart') || '[]');
        const totalItems = counts.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('#cart-count, #float-cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    };

    window.addEventListener('cartUpdated', syncCartBadges);
    syncCartBadges();

    // Cart Modal Interactions
    const cartBtn = document.querySelector('#nav-cart-btn');
    const floatCartBtn = document.querySelector('#float-cart-btn');
    const modal = document.querySelector('#cart-modal');
    const closeModal = document.querySelector('#close-cart');

    [cartBtn, floatCartBtn].forEach(btn => btn?.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    }));

    closeModal?.addEventListener('click', () => modal.style.display = 'none');
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Refresh ETA each time cart opens
    [cartBtn, floatCartBtn].forEach(btn => {
        btn?.addEventListener('click', () => updateDeliveryEstimate());
    });
    updateDeliveryEstimate();

    // ── MY ORDERS MODAL (Item 5) ──
    const myOrdersBtn = document.querySelector('#my-orders-btn');
    const myOrdersModal = document.querySelector('#my-orders-modal');
    const closeMyOrders = document.querySelector('#close-my-orders');

    if (myOrdersBtn && myOrdersModal) {
        myOrdersBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            myOrdersModal.style.display = 'flex';
            loadMyOrders();
        });
        closeMyOrders?.addEventListener('click', () => myOrdersModal.style.display = 'none');
        myOrdersModal.addEventListener('click', (e) => {
            if (e.target === myOrdersModal) myOrdersModal.style.display = 'none';
        });
    }
};

// ── DELIVERY ESTIMATE ENGINE ──
const updateDeliveryEstimate = async () => {
    const el = document.querySelector('#delivery-estimate');
    if (!el) return;
    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');
        const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'rider'), where('isOnline', '==', true)));
        let low = snap.size > 0 ? 25 : 35;
        let high = snap.size > 0 ? 35 : 50;
        const hour = new Date().getHours();
        if ((hour >= 12 && hour < 14) || (hour >= 19 && hour < 21)) { low += 10; high += 10; }
        el.textContent = `🕐 Estimated delivery: ${low}–${high} min`;
    } catch { el.textContent = '🕐 Estimated delivery: 30–45 min'; }
};

// ── MY ORDERS LOADER ──
const loadMyOrders = async () => {
    const list = document.querySelector('#my-orders-list');
    if (!list) return;
    const { auth } = await import('./firebase/config');
    const user = auth.currentUser;
    if (!user) { list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">Please log in to see your orders.</p>'; return; }
    list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">Loading...</p>';
    try {
        const orders = await fetchOrdersByUser(user.uid);
        if (orders.length === 0) { list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">No orders yet!</p>'; return; }
        list.innerHTML = orders.map(order => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Recently';
            const items = order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';
            const statusColor = { 'DELIVERED':'#10B981','PLACED':'#3B82F6','CANCELLED':'#ef4444','PREPARING':'#F59E0B','ASSIGNED':'#8B5CF6' }[order.status] || '#7a8098';
            return `<div style="padding:16px;border-bottom:1px solid #252830;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <div><p style="font-size:10px;color:#7a8098;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${order.orderId || order.docId?.slice(0,8)}</p><p style="font-size:12px;color:#9ca3af;">${date}</p></div>
                    <div style="text-align:right;"><p style="font-size:18px;font-weight:900;color:#F5A800;">₹${order.total}</p><span style="font-size:9px;font-weight:900;color:${statusColor};text-transform:uppercase;">${order.status?.replace(/_/g,' ')}</span></div>
                </div>
                <p style="font-size:12px;color:#9ca3af;margin-bottom:12px;">${items}</p>
                <button onclick="window.reorderItems(${JSON.stringify(order.items).replace(/"/g,'&quot;')})" style="width:100%;padding:10px;background:transparent;border:1px solid #F5A800;border-radius:10px;color:#F5A800;font-size:12px;font-weight:800;cursor:pointer;text-transform:uppercase;">🔄 Reorder</button>
            </div>`;
        }).join('');
    } catch (err) {
        list.innerHTML = '<p style="text-align:center;color:#ef4444;padding:40px 0;">Failed to load. Try again.</p>';
    }
};

// ── REORDER GLOBAL HANDLER ──
window.reorderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    items.forEach(item => addItem(item, item.variant || 'single', item.price));
    const myOrdersModal = document.querySelector('#my-orders-modal');
    const cartModal = document.querySelector('#cart-modal');
    if (myOrdersModal) myOrdersModal.style.display = 'none';
    if (cartModal) cartModal.style.display = 'flex';
    // Show toast
    let toast = document.querySelector('#lw-toast');
    if (!toast) {
        toast = document.createElement('div'); toast.id = 'lw-toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#F5A800;color:#000;padding:12px 24px;border-radius:40px;font-weight:800;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.textContent = 'Items added to cart! 🛒';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.style.opacity = '0', 3000);
};

/**
 * 🔍 LEGACY SEARCH MODULE (Enhanced for Premium UI)
 */
function initMenuSearch(items) {
    const searchInput = document.getElementById('menu-search-input');
    const dropdown = document.getElementById('menu-search-dropdown');
    const clearBtn = document.getElementById('menu-search-clear');
    const filterNotice = document.getElementById('lw-search-filter-notice');
    const clearLink = document.getElementById('lw-clear-search-link');
    const stickyBar = document.getElementById('lw-search-sticky-bar');
    const spacer = document.getElementById('lw-search-spacer');
    const container = document.querySelector('#menu-grid-container');

    if (!searchInput || !dropdown || !clearBtn) return;

    let activeIndex = -1;
    let highlightTimer = null;

    // Helper: Scroll and Pulse Highlight
    const scrollAndHighlight = (name) => {
        const cards = document.querySelectorAll('.menu-card');
        const q = name.toLowerCase();
        let target = null;

        for (const card of cards) {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(q)) {
                target = card;
                break;
            }
        }

        if (target) {
            const offset = 160; // Navbar + Searchbar + padding
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });

            clearTimeout(highlightTimer);
            cards.forEach(c => c.classList.remove('lw-search-highlight'));
            target.classList.add('lw-search-highlight');
            highlightTimer = setTimeout(() => target.classList.remove('lw-search-highlight'), 3000);
        }
    };

    const renderDropdown = (query) => {
        dropdown.innerHTML = '';
        const q = query.trim().toLowerCase();
        if (!q) { dropdown.style.display = 'none'; return; }

        const matched = items.filter(item => 
            item.name.toLowerCase().includes(q) || 
            item.category.toLowerCase().includes(q)
        ).slice(0, 10);

        if (matched.length === 0) {
            dropdown.innerHTML = '<div class="lw-no-results">No items found</div>';
        } else {
            matched.forEach((item, idx) => {
                const el = document.createElement('div');
                el.className = 'lw-suggestion-item';
                el.innerHTML = `
                    <img src="${item.image || '/images/logo.png'}" class="lw-suggestion-icon" onerror="this.src='/images/logo.png'">
                    <div class="lw-suggestion-text">
                        <span class="lw-suggestion-name">${item.name.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')}</span>
                        <span class="lw-suggestion-cat">${item.category}</span>
                    </div>
                `;
                el.addEventListener('click', () => {
                    searchInput.value = item.name;
                    dropdown.style.display = 'none';
                    applyFilter(item.name);
                    scrollAndHighlight(item.name);
                });
                dropdown.appendChild(el);
            });
        }
        dropdown.style.display = 'block';
    };

    const applyFilter = (query) => {
        const q = query.toLowerCase();
        if (!q) {
            renderMenu(container, items);
            filterNotice.style.display = 'none';
            return;
        }

        const filtered = items.filter(item => 
            item.name.toLowerCase().includes(q) || 
            item.category.toLowerCase().includes(q) ||
            (item.description && item.description.toLowerCase().includes(q))
        );

        renderMenu(container, filtered);
        filterNotice.style.display = 'block';
    };

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length > 0) {
            searchInput.classList.add('lw-has-text');
            renderDropdown(val);
        } else {
            searchInput.classList.remove('lw-has-text');
            dropdown.style.display = 'none';
            applyFilter('');
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        const sugItems = dropdown.querySelectorAll('.lw-suggestion-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % sugItems.length;
            sugItems.forEach((it, i) => it.classList.toggle('lw-active', i === activeIndex));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + sugItems.length) % sugItems.length;
            sugItems.forEach((it, i) => it.classList.toggle('lw-active', i === activeIndex));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const active = dropdown.querySelector('.lw-suggestion-item.lw-active');
            if (active) {
                const name = active.querySelector('.lw-suggestion-name').textContent;
                searchInput.value = name;
                dropdown.style.display = 'none';
                applyFilter(name);
                scrollAndHighlight(name);
            } else {
                applyFilter(searchInput.value);
                dropdown.style.display = 'none';
            }
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.classList.remove('lw-has-text');
        dropdown.style.display = 'none';
        applyFilter('');
    });

    clearLink.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        searchInput.classList.remove('lw-has-text');
        applyFilter('');
    });

    // Sticky Scroll Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            stickyBar.classList.add('lw-scrolled');
        } else {
            stickyBar.classList.remove('lw-scrolled');
        }
    }, { passive: true });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#menu-search-wrapper')) {
            dropdown.style.display = 'none';
        }
    });
}

// Start the engine
document.addEventListener('DOMContentLoaded', initMenu);
