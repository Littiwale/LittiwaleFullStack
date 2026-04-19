import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { fetchAnnouncements } from './api/announcements';
import { createTicket } from './api/tickets';
import { addItem } from './store/cart';
import { fetchOrdersByUser } from './api/orders';
import { updateDeliveryEstimate, loadMyOrders, showToast } from './utils';
import './pwa.js';

const HOURLY_DEAL_IMAGE_MAP = {
  'Kuch bhi khila de 😭': '/images/menu/Craziest%20Deal%20Menu/kuch-bhi-khila-de.png',
  'Tera jo mann wo khila de 😏': '/images/menu/Craziest%20Deal%20Menu/tera-jo-mann-wo-khila-de.png',
  'Aaj diet bhool ja 😈': '/images/menu/Craziest%20Deal%20Menu/aaj-diet-bhool-ja.png',
  'Bhook lagi hai boss 🔥': '/images/menu/Craziest%20Deal%20Menu/bhook-lagi-hai-boss.png',
  'Mehmaan nawazi special ✨': '/images/menu/Craziest%20Deal%20Menu/pet-bhar-combo.png',
  'Tera jo mann khila de 😌': '/images/menu/Craziest%20Deal%20Menu/tera-jo-mann-khila-de.png',
};

/**
 * 🚀 LITTIWALE CORE ENGINE (VANILLA JS)
 */

let menuData = [];

const init = async () => {

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
                const role = user.profile?.role || 'customer';
                const initial = displayName.charAt(0).toUpperCase();

                // Build role-aware menu items.
                // Admin = super user → gets all panels + My Orders.
                // Rider  → gets Rider Panel + My Orders (can also order from storefront).
                // Customer → My Orders only.
                let menuItems = '';
                if (role === 'admin' || role === 'manager') {
                    menuItems = `
                        <button type="button" class="lw-dropdown-item" id="dd-nav-admin">🏠 Admin Panel</button>
                        <button type="button" class="lw-dropdown-item" id="dd-nav-rider">🛵 Rider Panel</button>
                        <button type="button" class="lw-dropdown-item" id="dd-nav-orders">📦 My Orders</button>
                    `;
                } else if (role === 'rider') {
                    menuItems = `
                        <button type="button" class="lw-dropdown-item" id="dd-nav-rider">🏍️ Rider Panel</button>
                        <button type="button" class="lw-dropdown-item" id="dd-nav-orders">📦 My Orders</button>
                    `;
                } else {
                    // customer (and any unknown role)
                    menuItems = `
                        <button type="button" class="lw-dropdown-item" id="dd-nav-orders">📦 My Orders</button>
                    `;
                }

                profileArea.innerHTML = `
                    <div class="lw-profile-wrap" id="customer-profile-wrap">
                        <span>Hi, ${displayName.split(' ')[0]}</span>
                        <button type="button" class="lw-avatar-btn" id="customer-avatar-trigger" aria-haspopup="true" aria-expanded="false">${initial}</button>
                        <div class="lw-dropdown" id="customer-profile-dropdown" role="menu">
                            <div class="lw-dropdown-header">
                                <p>${displayName}</p>
                                <span style="text-transform:uppercase;letter-spacing:1px;">${role}</span>
                            </div>
                            ${menuItems}
                            <div class="lw-dropdown-divider"></div>
                            <button type="button" class="lw-dropdown-item danger" id="dd-nav-logout">🚪 Logout</button>
                        </div>
                    </div>
                `;

                // Toggle open/close
                const trigger = document.getElementById('customer-avatar-trigger');
                const dropdown = document.getElementById('customer-profile-dropdown');
                trigger?.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdown.classList.toggle('open');
                    trigger.setAttribute('aria-expanded', dropdown.classList.contains('open'));
                });
                document.addEventListener('click', function(e) {
                    if (!trigger?.contains(e.target) && !dropdown?.contains(e.target)) {
                        dropdown?.classList.remove('open');
                    }
                });

                // Preserve normal navbar anchor behavior for storefront links
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.addEventListener('click', (e) => {
                        // Allow default nav anchor semantics, but do not let any outside listener hijack it.
                        e.stopPropagation();
                        if (dropdown?.classList.contains('open')) {
                            dropdown.classList.remove('open');
                            trigger?.setAttribute('aria-expanded', 'false');
                        }
                    });
                });

                const closeDropdown = () => {
                    dropdown?.classList.remove('open');
                    trigger?.setAttribute('aria-expanded', 'false');
                };

                // Role-specific nav actions
                document.getElementById('dd-nav-admin')?.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeDropdown();
                    window.location.href = '/admin/index.html';
                });
                document.getElementById('dd-nav-rider')?.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeDropdown();
                    window.location.href = '/rider/index.html';
                });
                document.getElementById('dd-nav-orders')?.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeDropdown();
                    window.location.href = '/customer/track.html';
                });
                document.getElementById('dd-nav-logout')?.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    closeDropdown();
                    await logoutUser();
                    window.location.href = '/login.html';
                });

            } else if (isGuest) {
                profileArea.innerHTML = `<span style="font-size:12px;font-weight:700;color:var(--text-secondary);cursor:pointer;" onclick="window.location.href='/login'">Hi, Guest 👋</span>`;
            } else {
                profileArea.innerHTML = `<a href="/login.html" class="btn btn-primary" style="padding:8px 16px;font-size:12px;">Login</a>`;
            }
        }
    });

    // 2. ANNOUNCEMENTS CAROUSEL
    const annSection = document.getElementById('announcement');
    const annCarousel = document.getElementById('announcement-carousel');
    const annDots = document.getElementById('announcement-dots');

    try {
        const announcements = await fetchAnnouncements();
        if (announcements && announcements.length > 0) {
            annSection.style.display = 'block';
            announcements.forEach((ann, idx) => {
                const slide = document.createElement('div');
                slide.className = 'announcement-slide';

                // Item 8: if image exists (new static path) OR imageUrl exists (legacy Firebase URL) → image slide, else text slide
                const imageUrl = ann.image || ann.imageUrl;
                if (imageUrl) {
                    slide.innerHTML = `
                        <img src="${imageUrl}" alt="${ann.title || 'Announcement'}"
                            style="max-width:100%;max-height:400px;height:auto;width:auto;object-fit:contain;border-radius:12px;display:block;margin:0 auto;">
                        ${ann.title ? `<p style="margin-top:12px;font-size:13px;font-weight:700;text-align:center;">${ann.title}</p>` : ''}
                    `;
                } else {
                    slide.innerHTML = `<p>${ann.title || ''}${ann.title && ann.description ? ' — ' : ''}${ann.description || ''}</p>`;
                }

                annCarousel.appendChild(slide);

                const dot = document.createElement('div');
                dot.className = 'ann-dot';
                dot.style = `width: 8px; height: 8px; border-radius: 50%; background: ${idx === 0 ? '#F5A800' : 'rgba(255,255,255,0.3)'}; cursor: pointer; transition: background 0.3s;`;
                annDots.appendChild(dot);
            });

            // Auto-carousel
            let currentSlide = 0;
            setInterval(() => {
                currentSlide = (currentSlide + 1) % announcements.length;
                annCarousel.scrollTo({ left: currentSlide * annCarousel.clientWidth, behavior: 'smooth' });
                Array.from(annDots.children).forEach((dot, i) => {
                    dot.style.background = i === currentSlide ? '#F5A800' : 'rgba(255,255,255,0.3)';
                });
            }, 5000);
        }
    } catch (err) { console.error('Announcements failed:', err); }


    // 3. MENU DATA & SECTIONS
    try {
        menuData = await fetchMenuItems();
        if (menuData.length > 0) {
            renderHourlyDeals(menuData);
            renderHallOfFame(menuData);
        }
    } catch (err) { console.error('Menu load failed:', err); }

    // 4. CART & CHECKOUT
    updateCartUI();
    initCheckout();

    // Global Cart Badge Sync
    window.addEventListener('cartUpdated', () => {
        const counts = JSON.parse(localStorage.getItem('littiwale_cart') || '[]');
        const totalItems = counts.reduce((acc, item) => acc + item.quantity, 0);
        document.querySelectorAll('#cart-count, #float-cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    });

    // Initialize global cart bubbles on load
    const initialCart = JSON.parse(localStorage.getItem('littiwale_cart') || '[]');
    const total = initialCart.reduce((acc, item) => acc + item.quantity, 0);
    document.querySelectorAll('#cart-count, #float-cart-count').forEach(el => el.textContent = total);

    // Cart Modal Interactions
    const cartBtn = document.querySelector('#nav-cart-btn');
    const floatCartBtn = document.querySelector('#float-cart-btn');
    const modal = document.querySelector('#cart-modal');
    const closeModal = document.querySelector('#close-cart');

    [cartBtn, floatCartBtn].forEach(btn => btn?.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        // Refresh delivery estimate every time cart opens
        updateDeliveryEstimate();
    }));

    closeModal?.addEventListener('click', () => modal.style.display = 'none');
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    // Floating Buttons - Order & Connect
    const orderBtn = document.querySelector('#floating-order-btn');
    const orderModal = document.querySelector('#order-modal');
    const closeOrderModal = document.querySelector('#close-order-modal');

    const connectBtn = document.querySelector('#floating-connect-btn');
    const connectModal = document.querySelector('#connect-modal');
    const closeConnectModal = document.querySelector('#close-connect-modal');

    orderBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        orderModal.style.display = 'flex';
    });

    closeOrderModal?.addEventListener('click', () => orderModal.style.display = 'none');
    orderModal?.addEventListener('click', (e) => { if (e.target === orderModal) orderModal.style.display = 'none'; });

    connectBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
        connectModal.style.display = 'flex';
    });

    closeConnectModal?.addEventListener('click', () => connectModal.style.display = 'none');
    connectModal?.addEventListener('click', (e) => { if (e.target === connectModal) connectModal.style.display = 'none'; });

    // Complaint Modal
    const complaintButton = document.querySelector('#raise-complaint-btn');
    const complaintModal = document.querySelector('#complaint-modal');
    const closeComplaintModal = document.querySelector('#close-complaint-modal');
    const complaintCancelBtn = document.querySelector('#complaint-cancel-btn');

    complaintButton?.addEventListener('click', () => {
        connectModal.style.display = 'none';
        complaintModal.style.display = 'flex';
    });

    closeComplaintModal?.addEventListener('click', () => complaintModal.style.display = 'none');
    complaintModal?.addEventListener('click', (e) => { if (e.target === complaintModal) complaintModal.style.display = 'none'; });
    complaintCancelBtn?.addEventListener('click', () => complaintModal.style.display = 'none');

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
                complaintModal.style.display = 'none';
                complaintFeedback.textContent = '';
            }, 2000);
        } catch (err) {
            complaintFeedback.textContent = '✗ Error submitting complaint. Please try again.';
            complaintFeedback.style.color = '#EF4444';
        }
    });

    // ── DELIVERY ESTIMATE (Item 7) ──
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

// ── REORDER GLOBAL HANDLER ──
window.reorderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) return;
    items.forEach(item => addItem(item, item.variant || 'single', item.price));

    // Close My Orders modal, show cart
    const myOrdersModal = document.querySelector('#my-orders-modal');
    const cartModal = document.querySelector('#cart-modal');
    if (myOrdersModal) myOrdersModal.style.display = 'none';
    if (cartModal) cartModal.style.display = 'flex';

    showToast('Items added to cart! 🛒');
};

/**
 * 🔥 HOURLY DEALS ENGINE
 */
const renderHourlyDeals = (menu) => {
    const dealsSection = document.getElementById('craziest-deals-section');
    const dealsGrid = document.getElementById('deals-grid');
    if (!dealsSection || !dealsGrid) return;

    const now = new Date();
    const currentHourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    
    let deals = [];
    const cachedKey = localStorage.getItem('littiWaleDealsDateHour');
    const cachedData = localStorage.getItem('littiWaleDealsData');

    if (cachedKey === currentHourKey && cachedData) {
        deals = JSON.parse(cachedData);
    } else {
        // Generate new deals
        const filtered = menu.filter(i => i.category.toLowerCase() !== 'thali' && i.category.toLowerCase() !== 'combo');
        const dealNames = [
            'Kuch bhi khila de 😭',
            'Tera jo mann wo khila de 😏',
            'Aaj diet bhool ja 😈',
            'Bhook lagi hai boss 🔥',
            'Mehmaan nawazi special ✨'
        ];
        
        for (let i = 0; i < 3; i++) {
            const dealName = dealNames[i % dealNames.length];
            const item1 = filtered[Math.floor(Math.random() * filtered.length)];
            const item2 = filtered[Math.floor(Math.random() * filtered.length)];
            
            if (item1 && item2) {
                const realPrice = Math.round(((item1.price + item2.price) * 0.88) / 10) * 10 + 9;
                const fakePrice = Math.round(realPrice * 1.35);
                
                deals.push({
                    id: `deal-${i}-${currentHourKey}`,
                    name: dealName,
                    items: `${item1.name} + ${item2.name}`,
                    price: realPrice,
                    oldPrice: fakePrice,
                    image: HOURLY_DEAL_IMAGE_MAP[dealName] || item1.image || '/images/logo.png',
                    item1: { id: item1.id, name: item1.name, price: item1.price, image: item1.image, category: item1.category, veg: item1.veg },
                    item2: { id: item2.id, name: item2.name, price: item2.price, image: item2.image, category: item2.category, veg: item2.veg }
                });
            }
        }
        localStorage.setItem('littiWaleDealsDateHour', currentHourKey);
        localStorage.setItem('littiWaleDealsData', JSON.stringify(deals));
    }

    if (deals.length > 0) {
        dealsSection.style.display = 'block';
        dealsGrid.innerHTML = deals.map(deal => `
            <div class="food-card deal-card">
                <div class="deal-badge">SAVE BIG</div>
                <img src="${deal.image}" alt="${deal.name}" onerror="this.src='/images/logo.png'">
                <div class="food-info">
                    <h3>${deal.name}</h3>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">${deal.items}</p>
                    <div class="food-price">
                        <span class="price-old">₹${deal.oldPrice}</span>
                        <span>₹${deal.price}</span>
                    </div>
                    <button class="add-btn deal-add-btn" data-deal='${JSON.stringify(deal)}'>Add Combo</button>
                </div>
            </div>
        `).join('');

        // Deal Add Listener (Maps to existing Cart logic)
        dealsGrid.querySelectorAll('.deal-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const deal = JSON.parse(btn.getAttribute('data-deal'));
                // Add each component item individually at their real Firestore IDs
                // so validateOrder() can find them in the menu collection
                if (deal.item1 && deal.item2) {
                    addItem(deal.item1, 'single', deal.item1.price);
                    addItem(deal.item2, 'single', deal.item2.price);
                } else {
                    // Fallback: add as single item (for any deal that only has one item reference)
                    addItem({ id: deal.id, name: deal.name, price: deal.price, image: deal.image }, 'single', deal.price);
                }
                btn.textContent = 'Added! ✅';
                setTimeout(() => btn.textContent = 'Add Combo', 1500);
            });
        });
    }
};



/**
 * 🌟 HALL OF FAME RENDERER (6 Random Unique)
 */
const renderHallOfFame = (menu) => {
    const grid = document.getElementById('bestseller-grid');
    if (!grid) return;

    const shuffled = [...menu].sort(() => 0.5 - Math.random());
    const picks = shuffled.slice(0, 6);

    grid.innerHTML = picks.map(item => `
        <div class="food-card hof-card">
            <img src="${item.image || '/images/logo.png'}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.src='/images/logo.png'">
            <div class="hof-card-body">
                <h3 class="hof-card-name">${item.name}</h3>
                <p class="hof-card-price">₹${item.price}</p>
                <button onclick="addToCart('${item.id}')" class="hof-card-btn">ADD TO CART</button>
            </div>
        </div>
    `).join('');
};

// Global wrapper for Hall of Fame Add to Cart
window.addToCart = (id) => {
    const item = menuData.find(i => i.id === id);
    if (item) {
        addItem(item, 'single', item.price);
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'ADDED! ✅';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'var(--primary)';
        }, 1500);
    }
};

// ── PWA SERVICE WORKER & INSTALL PROMPT (Phase 4) ──
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    let btn = document.querySelector('#pwa-install-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'pwa-install-btn';
        btn.innerHTML = '📱 Install App';
        btn.style.cssText = 'position:fixed;bottom:24px;left:24px;background:var(--primary);color:var(--button-on-primary);border:none;border-radius:40px;padding:12px 20px;font-weight:900;font-size:13px;box-shadow:0 4px 15px rgba(244,180,0,0.4);cursor:pointer;z-index:9999;animation:fadeUp 0.5s ease;letter-spacing:0.5px;text-transform:uppercase;';
        document.body.appendChild(btn);

        btn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    btn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        });
    }
    btn.style.display = 'block';
});

window.addEventListener('appinstalled', () => {
    const btn = document.querySelector('#pwa-install-btn');
    if (btn) btn.style.display = 'none';
    deferredPrompt = null;
});

init();
