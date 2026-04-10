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
                const initial = displayName.charAt(0).toUpperCase();
                profileArea.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; position: relative;" id="profile-container">
                        <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer;">Hi, ${displayName.split(' ')[0]}</span>
                        <div id="profile-bubble" style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; cursor: pointer;">${initial}</div>
                        <div id="profile-dropdown" class="profile-dropdown-custom">
                            <button onclick="window.location.href='/#reach'">Profile</button>
                            <button onclick="window.location.href='/track.html'">Orders</button>
                            <button id="logout-final-btn" style="color: var(--error);">Logout</button>
                        </div>
                    </div>
                `;

                const style = document.createElement('style');
                style.textContent = `
                    .profile-dropdown-custom {
                        position: absolute; top: 100%; right: 0; background: #1a1a1a; border: 1px solid var(--glass-border); 
                        border-radius: 12px; padding: 8px; width: 140px; display: none; z-index: 2000; margin-top: 10px;
                    }
                    .profile-dropdown-custom.show { display: block; }
                    .profile-dropdown-custom button { 
                        width: 100%; text-align: left; background: none; border: none; color: white; 
                        padding: 10px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600;
                    }
                    .profile-dropdown-custom button:hover { background: var(--glass); }
                `;
                document.head.appendChild(style);

                const bubble = document.getElementById('profile-bubble');
                const dropdown = document.getElementById('profile-dropdown');
                bubble?.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('show'); });
                document.addEventListener('click', () => dropdown?.classList.remove('show'));

                document.getElementById('logout-final-btn')?.addEventListener('click', async () => {
                    await logoutUser();
                    localStorage.removeItem('littiwale_guest');
                    window.location.href = '/login.html';
                });
            } else if (isGuest) {
                profileArea.innerHTML = `<span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer;" onclick="window.location.href='/login.html'">Hi, Guest 👋</span>`;
            } else {
                profileArea.innerHTML = `<a href="login.html" class="btn btn-primary" style="padding: 8px 16px; font-size: 12px;">Login</a>`;
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
