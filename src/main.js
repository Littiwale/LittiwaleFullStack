import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { fetchAnnouncements } from './api/announcements';
import { addItem } from './store/cart';
import { fetchOrdersByUser } from './api/orders';

/**
 * 🚀 LITTIWALE CORE ENGINE (VANILLA JS)
 */

let menuData = [];

const init = async () => {
    console.log('🔥 Littiwale Landing Rebuild Initializing...');

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
                const role = user.profile?.role || 'customer';
                const initial = displayName.charAt(0).toUpperCase();

                // Build role-specific menu items
                let menuItems = '';
                if (role === 'admin' || role === 'manager') {
                    menuItems = `
                        <button class="lw-dropdown-item" id="dd-nav-admin">🏠 Admin Panel</button>
                        <button class="lw-dropdown-item" id="dd-nav-rider">🛵 Rider Panel</button>
                    `;
                } else if (role === 'rider') {
                    menuItems = `
                        <button class="lw-dropdown-item" id="dd-nav-rider">🏍️ Rider Panel</button>
                    `;
                } else {
                    // customer
                    menuItems = `
                        <button class="lw-dropdown-item" id="dd-nav-orders">📦 My Orders</button>
                    `;
                }

                profileArea.innerHTML = `
                    <div class="lw-profile-wrap" id="customer-profile-wrap">
                        <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">Hi, ${displayName.split(' ')[0]}</span>
                        <button class="lw-avatar-btn" id="customer-avatar-trigger" aria-haspopup="true" aria-expanded="false">${initial}</button>
                        <div class="lw-dropdown" id="customer-profile-dropdown" role="menu">
                            <div class="lw-dropdown-header">
                                <p>${displayName}</p>
                                <span style="text-transform:uppercase;letter-spacing:1px;">${role}</span>
                            </div>
                            ${menuItems}
                            <div class="lw-dropdown-divider"></div>
                            <button class="lw-dropdown-item danger" id="dd-nav-logout">🚪 Logout</button>
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

                // Role-specific nav actions
                document.getElementById('dd-nav-admin')?.addEventListener('click', function() {
                    window.location.href = '/admin/index.html';
                });
                document.getElementById('dd-nav-rider')?.addEventListener('click', function() {
                    window.location.href = '/rider/index.html';
                });
                document.getElementById('dd-nav-orders')?.addEventListener('click', function() {
                    window.location.href = '/customer/track.html';
                });
                document.getElementById('dd-nav-logout')?.addEventListener('click', async function() {
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

                // Item 8: if imageUrl exists → image slide, else text slide
                if (ann.imageUrl) {
                    slide.innerHTML = `
                        <img src="${ann.imageUrl}" alt="${ann.title || 'Announcement'}"
                            style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;display:block;">
                        ${ann.title ? `<p style="margin-top:8px;font-size:13px;font-weight:700;text-align:center;">${ann.title}</p>` : ''}
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

/**
 * 🕐 DELIVERY ESTIMATE ENGINE (Item 7)
 * Checks online riders in Firestore, adjusts for peak hours.
 */
const updateDeliveryEstimate = async () => {
    const el = document.querySelector('#delivery-estimate');
    if (!el) return;

    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');

        const ridersSnap = await getDocs(
            query(collection(db, 'users'), where('role', '==', 'rider'), where('isOnline', '==', true))
        );
        const onlineCount = ridersSnap.size;

        // Base estimate
        let low = onlineCount > 0 ? 25 : 35;
        let high = onlineCount > 0 ? 35 : 50;

        // Peak hour check (12–14 or 19–21)
        const hour = new Date().getHours();
        const isPeak = (hour >= 12 && hour < 14) || (hour >= 19 && hour < 21);
        if (isPeak) { low += 10; high += 10; }

        el.textContent = `🕐 Estimated delivery: ${low}–${high} min`;
    } catch {
        el.textContent = '🕐 Estimated delivery: 30–45 min';
    }
};

/**
 * 📦 MY ORDERS LOADER (Item 5)
 */
const loadMyOrders = async () => {
    const list = document.querySelector('#my-orders-list');
    if (!list) return;

    // Need auth user
    const { auth } = await import('./firebase/config');
    const user = auth.currentUser;
    if (!user) {
        list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">Please log in to see your orders.</p>';
        return;
    }

    list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">Loading...</p>';

    try {
        const orders = await fetchOrdersByUser(user.uid);
        if (orders.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#7a8098;padding:40px 0;">No orders yet! Start ordering 🍽️</p>';
            return;
        }

        list.innerHTML = orders.map(order => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Recently';
            const items = order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '—';
            const statusColor = {
                'DELIVERED': '#10B981', 'PLACED': '#3B82F6', 'CANCELLED': '#ef4444',
                'PREPARING': '#F59E0B', 'ASSIGNED': '#8B5CF6'
            }[order.status] || '#7a8098';

            return `
                <div style="padding:16px;border-bottom:1px solid #252830;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <div>
                            <p style="font-size:10px;color:#7a8098;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${order.orderId || order.docId?.slice(0,8)}</p>
                            <p style="font-size:12px;color:#9ca3af;margin-top:2px;">${date}</p>
                        </div>
                        <div style="text-align:right;">
                            <p style="font-size:18px;font-weight:900;color:#F5A800;">₹${order.total}</p>
                            <span style="font-size:9px;font-weight:900;color:${statusColor};text-transform:uppercase;letter-spacing:1px;">${order.status?.replace(/_/g,' ')}</span>
                        </div>
                    </div>
                    <p style="font-size:12px;color:#9ca3af;margin-bottom:12px;line-height:1.5;">${items}</p>
                    <button
                        onclick="window.reorderItems(${JSON.stringify(order.items).replace(/"/g, '&quot;')})"
                        style="width:100%;padding:10px;background:transparent;border:1px solid #F5A800;border-radius:10px;color:#F5A800;font-size:12px;font-weight:800;letter-spacing:1px;cursor:pointer;text-transform:uppercase;">
                        🔄 Reorder
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('My orders failed:', err);
        list.innerHTML = '<p style="text-align:center;color:#ef4444;padding:40px 0;">Failed to load orders. Try again.</p>';
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

    // Toast
    showToast('Items added to cart! 🛒');
};

// ── TOAST HELPER ──
const showToast = (msg) => {
    let toast = document.querySelector('#lw-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lw-toast';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#F5A800;color:#000;padding:12px 24px;border-radius:40px;font-weight:800;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.3s;pointer-events:none;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.style.opacity = '0', 3000);
};

window.showToast = showToast;

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
        const dealNames = ["Kuch bhi khila de 😭", "Tera jo mann wo khila de 😏", "Aaj diet bhool ja 😈", "Bhook lagi hai boss 🔥", "Mehmaan nawazi special ✨"];
        
        for (let i = 0; i < 3; i++) {
            const item1 = filtered[Math.floor(Math.random() * filtered.length)];
            const item2 = filtered[Math.floor(Math.random() * filtered.length)];
            
            if (item1 && item2) {
                const realPrice = Math.round(((item1.price + item2.price) * 0.88) / 10) * 10 + 9;
                const fakePrice = Math.round(realPrice * 1.35);
                
                deals.push({
                    id: `deal-${i}-${currentHourKey}`,
                    name: dealNames[i % dealNames.length],
                    items: `${item1.name} + ${item2.name}`,
                    price: realPrice,
                    oldPrice: fakePrice,
                    image: item1.image || '/images/logo.png'
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
                addItem({ id: deal.id, name: deal.name, price: deal.price, image: deal.image }, 'combo', deal.price);
                
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
        <div style="background:#13161e; border:1px solid #252830; border-radius:16px; overflow:hidden; transition: transform 0.2s;" class="food-card">
          <img src="${item.image || '/images/logo.png'}" alt="${item.name}" style="width:100%; height:200px; object-fit:cover;" onerror="this.src='/images/logo.png'">
          <div style="padding: 16px;">
            <h3 style="color:#fff; font-size:16px; font-weight:700; margin-bottom:6px;">${item.name}</h3>
            <p style="color:#F5A800; font-size:18px; font-weight:800;">₹${item.price}</p>
            <button onclick="addToCart('${item.id}')" style="width:100%; margin-top:12px; padding:10px; background:#F5A800; border:none; border-radius:8px; font-weight:700; cursor:pointer; font-size:13px; letter-spacing:1px;">ADD TO CART</button>
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
        btn.style.background = '#10B981';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#F5A800';
        }, 1500);
    }
};

// ── PWA SERVICE WORKER & INSTALL PROMPT (Phase 4) ──
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
            console.log('✅ PWA Service Worker registered:', reg.scope);
        }).catch((err) => console.log('❌ PWA SW Registration failed:', err));
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
        btn.style.cssText = 'position:fixed;bottom:24px;left:24px;background:#F5A800;color:#000;border:none;border-radius:40px;padding:12px 20px;font-weight:900;font-size:13px;box-shadow:0 4px 15px rgba(245,168,0,0.4);cursor:pointer;z-index:9999;animation:fadeUp 0.5s ease;letter-spacing:0.5px;text-transform:uppercase;';
        document.body.appendChild(btn);

        btn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('✅ User accepted PWA install');
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
    console.log('✅ PWA was installed successfully');
});

init();
