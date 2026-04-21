import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { renderMenu, refreshAllCardCTAs } from './menu/render';
import { createTicket } from './api/tickets';
import { addItem, getCartTotal, getCartCount } from './store/cart';
import { fetchOrdersByUser } from './api/orders';
import { updateDeliveryEstimate, loadMyOrders, showToast } from './utils';

/**
 * 🍱 LITTIWALE MENU ENGINE
 * Standalone entry point for menu.html
 */

let menuData = [];

// ── MODAL UTILITIES (Module-Level for Global Access) ──
const showModal = (modalElement) => {
    if (!modalElement) return;
    modalElement.classList.remove('modal-closing');
    modalElement.style.display = 'flex';
    requestAnimationFrame(() => modalElement.classList.add('modal-open'));
};

const hideModal = (modalElement) => {
    if (!modalElement) return;
    modalElement.classList.add('modal-closing');
    modalElement.classList.remove('modal-open');
    window.setTimeout(() => {
        // GUARD: only hide if still in closing state (not reopened)
        if (modalElement.classList.contains('modal-closing')) {
            modalElement.style.display = 'none';
            modalElement.classList.remove('modal-closing');
        }
    }, 250);
};

const initMenu = async () => {

    // Mark that user has visited the menu page (for contextual cart banner display)
    localStorage.setItem('lw_visited_menu', 'true');

    // 1. AUTH & NAVIGATION STATE
    onAuthChange((user) => {
        const isGuest = user?.isAnonymous;
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
                        <span>Hi, ${displayName.split(' ')[0]}</span>
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
                    window.location.href = '/track';
                    dropdown.classList.remove('open');
                });
                document.getElementById('menu-dd-logout')?.addEventListener('click', async () => {
                    await logoutUser();
                    window.location.href = '/login';
                });

            } else if (isGuest) {
                profileArea.innerHTML = `<span class="lw-profile-wrap" style="cursor:pointer;" onclick="window.location.href='/login'">Hi, Guest 👋</span>`;
            } else {
                profileArea.innerHTML = `<a href="/login" class="btn btn-primary" style="padding:8px 16px;font-size:12px;">Login</a>`;
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
            window.littiwaleMenuData = menuData;
            window.dispatchEvent(new CustomEvent('menuDataReady', { detail: { menuData } }));
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
        const totalItems = getCartCount();
        const totalAmount = getCartTotal();
        
        // Update floating badges
        document.querySelectorAll('#cart-count, #float-cart-count').forEach(el => {
            el.textContent = totalItems;
        });
        
        // Update mobile cart bar
        const mobileCountEl = document.getElementById('mobile-cart-count');
        const mobileTotalEl = document.getElementById('mobile-cart-total');
        if (mobileCountEl) {
            mobileCountEl.textContent = totalItems === 1 ? '1 item' : `${totalItems} items`;
        }
        if (mobileTotalEl) {
            mobileTotalEl.textContent = `₹${totalAmount}`;
        }
    };

    window.addEventListener('cartUpdated', syncCartBadges);
    window.addEventListener('cartUpdated', () => refreshAllCardCTAs(menuData));
    syncCartBadges();

    // Cart Modal Interactions
    const cartBtn = document.querySelector('#nav-cart-btn');
    const floatCartBtn = document.querySelector('#float-cart-btn');
    const mobileCartBtn = document.querySelector('#mobile-cart-btn');
    const modal = document.querySelector('#cart-modal');
    const closeModal = document.querySelector('#close-cart');

    const orderBtn = document.querySelector('#floating-order-btn');
    const orderModal = document.querySelector('#order-modal');
    const closeOrderModal = document.querySelector('#close-order-modal');

    const connectBtn = document.querySelector('#floating-connect-btn');
    const connectModal = document.querySelector('#connect-modal');
    const closeConnectModal = document.querySelector('#close-connect-modal');

    const complaintButton = document.querySelector('#raise-complaint-btn');
    const complaintModal = document.querySelector('#complaint-modal');
    const closeComplaintModal = document.querySelector('#close-complaint-modal');
    const complaintCancelBtn = document.querySelector('#complaint-cancel-btn');

    [cartBtn, floatCartBtn, mobileCartBtn].forEach(btn => btn?.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(modal);
    }));

    orderBtn?.addEventListener('click', () => {
        hideModal(modal);
        showModal(orderModal);
    });

    connectBtn?.addEventListener('click', () => {
        hideModal(modal);
        showModal(connectModal);
    });

    complaintButton?.addEventListener('click', () => {
        hideModal(connectModal);
        showModal(complaintModal);
    });

    closeModal?.addEventListener('click', () => hideModal(modal));
    modal?.addEventListener('click', (e) => { if (e.target === modal) hideModal(modal); });

    closeOrderModal?.addEventListener('click', () => hideModal(orderModal));
    orderModal?.addEventListener('click', (e) => { if (e.target === orderModal) hideModal(orderModal); });

    closeConnectModal?.addEventListener('click', () => hideModal(connectModal));
    connectModal?.addEventListener('click', (e) => { if (e.target === connectModal) hideModal(connectModal); });

    closeComplaintModal?.addEventListener('click', () => hideModal(complaintModal));
    complaintModal?.addEventListener('click', (e) => { if (e.target === complaintModal) hideModal(complaintModal); });
    complaintCancelBtn?.addEventListener('click', () => hideModal(complaintModal));

    // Complaint Form Submission
    const complaintForm = document.querySelector('#complaint-form');
    const complaintFeedback = document.querySelector('#complaint-feedback');

    complaintForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.querySelector('#complaint-name').value;
        const phone = document.querySelector('#complaint-phone').value;
        const issue = document.querySelector('#complaint-issue').value;

        // Show loading state
        complaintFeedback.textContent = 'Submitting your complaint...';
        complaintFeedback.style.color = '#C47F17';

        try {
            await createTicket({ name, phone, issue });

            complaintFeedback.textContent = '✓ Thank you! Your complaint has been submitted. We will follow up soon.';
            complaintFeedback.style.color = '#10B981';

            // Reset form
            complaintForm.reset();

            // Close modal after 2 seconds
            setTimeout(() => {
                hideModal(complaintModal);
                complaintFeedback.textContent = '';
            }, 2000);
        } catch (err) {
            complaintFeedback.textContent = '✗ Error submitting complaint. Please try again.';
            complaintFeedback.style.color = '#EF4444';
        }
    });

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
            hideModal(modal);
            showModal(myOrdersModal);
            loadMyOrders();
        });
        closeMyOrders?.addEventListener('click', () => hideModal(myOrdersModal));
        myOrdersModal.addEventListener('click', (e) => {
            if (e.target === myOrdersModal) hideModal(myOrdersModal);
        });
    }
};

// ── REORDER GLOBAL HANDLER ──
window.reorderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    items.forEach(item => addItem(item, item.variant || 'single', item.price));
    const myOrdersModal = document.querySelector('#my-orders-modal');
    const cartModal = document.querySelector('#cart-modal');
    if (myOrdersModal) hideModal(myOrdersModal);
    if (cartModal) showModal(cartModal);
    showToast('Items added to cart! 🛒');
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
    const floatingFilterBtn = document.getElementById('floating-filter-btn');
    const categoryFilter = document.getElementById('category-filter');

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

    window.littiwaleMenuSearch = {
        getQuery: () => searchInput.value.trim(),
        apply: (query) => applyFilter(query),
        clear: () => {
            searchInput.value = '';
            searchInput.classList.remove('lw-has-text');
            applyFilter('');
        }
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
    // Initial state: floating filter hidden (shown only on scroll)
    if (floatingFilterBtn) floatingFilterBtn.style.display = 'none';

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 120;

        // Sticky search bar scroll class (existing)
        if (scrolled) {
            stickyBar.classList.add('lw-scrolled');
        } else {
            stickyBar.classList.remove('lw-scrolled');
        }

        // Hide BOTH filters together on scroll
        const categoryStrip = document.getElementById('category-tabs');

        let shouldHide = scrolled;
        // Prevent hiding during programmatic programmatic scroll up
        if (window.isMenuScrollingToFilter) {
            shouldHide = false;
        }

        if (categoryFilter) {
            if (shouldHide) {
                categoryFilter.classList.add('filter-hidden');
            } else {
                categoryFilter.classList.remove('filter-hidden');
            }
        }

        if (categoryStrip) {
            if (shouldHide) {
                categoryStrip.classList.add('strip-hidden');
            } else {
                categoryStrip.classList.remove('strip-hidden');
            }
        }

        // Floating filter button: opposite of filter section visibility
        if (floatingFilterBtn) {
            // Only show floating button if we actually hide the filters
            floatingFilterBtn.style.display = shouldHide ? 'inline-flex' : 'none';
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
