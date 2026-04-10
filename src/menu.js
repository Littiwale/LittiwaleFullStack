import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { renderMenu } from './menu/render';
import { addItem } from './store/cart';

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
