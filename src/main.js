import { fetchMenuItems } from './api/menu';
import { updateCartUI } from './menu/cart-ui';
import { initCheckout } from './menu/checkout';
import { onAuthChange, logoutUser } from './api/auth';
import { fetchAnnouncements } from './api/announcements';
import { addItem } from './store/cart';

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

                // Internal Dropdown CSS (Since I can't edit style.css again easily for small tweaks)
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

                // Interactions
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
                slide.innerHTML = `<p>${ann.title} - ${ann.description}</p>`;
                annCarousel.appendChild(slide);

                const dot = document.createElement('div');
                dot.className = 'ann-dot';
                dot.style = `width: 8px; height: 8px; border-radius: 50%; background: ${idx === 0 ? '#000' : 'rgba(0,0,0,0.2)'}; cursor: pointer;`;
                annDots.appendChild(dot);
            });

            // Auto-carousel
            let currentSlide = 0;
            setInterval(() => {
                currentSlide = (currentSlide + 1) % announcements.length;
                annCarousel.scrollTo({ left: currentSlide * annCarousel.clientWidth, behavior: 'smooth' });
                Array.from(annDots.children).forEach((dot, i) => {
                    dot.style.background = i === currentSlide ? '#000' : 'rgba(0,0,0,0.2)';
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
    }));

    closeModal?.addEventListener('click', () => modal.style.display = 'none');
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
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



init();
