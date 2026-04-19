import { addItem, removeItem, getCart } from '../store/cart';
import { createTicket } from '../api/tickets';

let currentDietFilter = 'all';
let currentCategory = 'all';
let currentMenuItems = [];

const getDietFilteredItems = (items) => {
    if (!Array.isArray(items)) return [];
    if (currentDietFilter === 'all') return items;
    return items.filter(item => {
        if (currentDietFilter === 'veg') return item.veg;
        return !item.veg;
    });
};

/**
 * Renders the menu items grouped by category into the specified container.
 * Also renders category tabs for filtering.
 */
export const renderMenu = (container, items) => {
    if (!container) return;
    currentMenuItems = items;

    const activeItems = getDietFilteredItems(items);
    const groupedItems = activeItems.reduce((acc, item) => {
        if (item.available === false) return acc;
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const categories = Object.keys(groupedItems).sort();
    renderCategoryTabs(categories, container, groupedItems, activeItems);
    if (!currentCategory || currentCategory === 'all' || !groupedItems[currentCategory]) {
        currentCategory = 'all';
        renderAllCategories(container, groupedItems, activeItems);
    } else {
        renderSingleCategory(container, currentCategory, groupedItems[currentCategory], activeItems);
    }

    updateDietButtons();
    updateCategoryTabUI();
    initDietFilter(container, items);
    initMenuEvents(container, items);
    initFloatingFilterShortcut();
    initFilterScrollBehavior();

    // Refresh CTA zones after rendering
    refreshAllCardCTAs(items);
};

const updateDietButtons = () => {
    document.querySelectorAll('.diet-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diet === currentDietFilter);
    });
};

const initDietFilter = (container, items) => {
    const filterGroup = document.querySelector('#category-filter');
    if (!filterGroup || filterGroup.dataset.initialized === 'true') return;
    filterGroup.dataset.initialized = 'true';
    filterGroup.addEventListener('click', (event) => {
        const pill = event.target.closest('.diet-pill');
        if (!pill) return;
        const selectedDiet = pill.dataset.diet;
        if (!selectedDiet || selectedDiet === currentDietFilter) return;
        currentDietFilter = selectedDiet;
        updateDietButtons();
        renderMenu(container, items);
    });
};

const renderCategoryTabs = (categories, container, groupedItems, items) => {
    const tabsContainer = document.querySelector('#category-tabs');
    if (!tabsContainer) return;
    tabsContainer.innerHTML = `
        <button class="category-tab" data-category="all">All Items</button>
        ${categories.map(cat => `<button class="category-tab" data-category="${cat}">${cat}</button>`).join('')}
    `;
    tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            currentCategory = category || 'all';
            updateCategoryTabUI();
            if (currentCategory === 'all') {
                renderAllCategories(container, groupedItems, items);
            } else {
                renderSingleCategory(container, currentCategory, groupedItems[currentCategory], items);
            }
            refreshAllCardCTAs(items);
        });
    });
};

const updateCategoryTabUI = () => {
    const tabsContainer = document.querySelector('#category-tabs');
    if (!tabsContainer) return;
    tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === currentCategory);
    });
};

const renderAllCategories = (container, groupedItems, items) => {
    container.innerHTML = '';
    const categories = Object.keys(groupedItems).sort();
    categories.forEach((category) => {
        renderSingleCategory(container, category, groupedItems[category], items, true);
    });
};

const renderSingleCategory = (container, category, categoryItems, items, append = false) => {
    if (!append) container.innerHTML = '';
    const categorySection = document.createElement('div');
    categorySection.className = 'col-span-full mt-12 mb-6 animate-fade-in';
    categorySection.innerHTML = `
        <h2 class="menu-category-heading text-3xl font-black mb-8 flex items-center">
            <span class="h-8 w-1.5 bg-accent rounded-full mr-4"></span>
            ${category}
        </h2>
        <div class="grid grid-products">
            ${categoryItems.map(item => createItemCard(item)).join('')}
        </div>
    `;
    container.appendChild(categorySection);
};

// ── ADD TO CART button HTML ──────────────────────────────────────────────────
const addToCartBtnHTML = (itemId) => `
    <button
        class="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
        data-add="${itemId}">
        ADD TO CART 🛒
    </button>`;

// ── INLINE QUANTITY SELECTOR HTML ───────────────────────────────────────────
const qtySelectorHTML = (itemId, qty) => `
    <div class="flex items-center justify-between bg-[#C47F17] rounded-xl w-full h-12 overflow-hidden">
        <button class="qty-btn w-12 h-12 flex items-center justify-center text-black text-xl font-medium"
            data-action="decrease" data-id="${itemId}">−</button>
        <span class="text-black font-medium text-sm">${qty}</span>
        <button class="qty-btn w-12 h-12 flex items-center justify-center text-black text-xl font-medium"
            data-action="increase" data-id="${itemId}">+</button>
    </div>`;

/**
 * Refreshes all .card-cta-zone elements based on current cart state.
 * Called after every cartUpdated event and after renderMenu.
 */
export const refreshAllCardCTAs = (items) => {
    const cart = getCart();
    const ctaZones = document.querySelectorAll('.card-cta-zone');
    ctaZones.forEach(zone => {
        const itemId = zone.dataset.itemId;
        const cartEntry = cart.find(i => i.id === itemId);
        const qty = cartEntry ? cartEntry.quantity : 0;
        zone.innerHTML = qty > 0 ? qtySelectorHTML(itemId, qty) : addToCartBtnHTML(itemId);
    });
};

/**
 * Creates the HTML for a single menu item card (Premium Design)
 */
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');

const createItemCard = (item) => {
    const hasVariants = item.hasVariants && item.variants && item.variants.length > 0;
    const defaultVariant = hasVariants ? item.variants[0] : null;
    const displayPrice = defaultVariant ? defaultVariant.price : item.price;
    const imageSrc = item.image || '/images/logo.png';
    const rawDescription = item.description ? item.description : '';
    const description = escapeHtml(rawDescription);
    const initialDetail = description || (hasVariants ? `Selected: ${escapeHtml(defaultVariant.type)}` : '\u00A0');

    return `
        <div class="menu-card rounded-3xl overflow-hidden flex flex-col h-full group" data-id="${escapeHtml(item.id)}">
            <div class="menu-card-media relative overflow-hidden" style="aspect-ratio:4/3;">
                <img
                    src="${escapeHtml(imageSrc)}"
                    alt="${escapeHtml(item.name)}"
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onerror="this.closest('.menu-card-media')?.classList.add('img-error')"
                />
                <div class="menu-card-media-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                ${item.bestseller ? `
                    <span class="menu-card-badge">
                        Bestseller
                    </span>
                ` : ''}

                <span class="diet-tag ${item.veg ? 'diet-tag--veg' : 'diet-tag--nonveg'}" title="${item.veg ? 'Veg' : 'Non-Veg'}"></span>
            </div>

            <div class="menu-card-body p-5 flex flex-col flex-grow" style="background: var(--card-bg, #FFFFFF);" data-base-description="${description}">
                <div class="menu-card-intro mb-4">
                    <h3 class="menu-card-title text-base font-semibold mb-2 group-hover:text-[#C47F17] transition-colors leading-tight">${escapeHtml(item.name)}</h3>
                    <span class="item-price">₹${displayPrice}</span>
                </div>

                <p class="item-description text-sm leading-relaxed mb-4">${initialDetail}</p>

                ${hasVariants ? `
                    <div class="flex gap-2 mb-4">
                        ${item.variants.map((v, idx) => `
                            <button
                                class="variant-btn flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border-2 transition-all ${idx === 0 ? 'bg-[#C47F17] text-black border-[#C47F17] active-variant' : 'border-white/20 text-white/50 hover:border-[#C47F17]/40'}"
                                data-price="${escapeHtml(v.price)}"
                                data-type="${escapeHtml(v.type.toLowerCase())}"
                            >
                                ${escapeHtml(v.type)}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="card-cta-zone mt-auto" data-item-id="${escapeHtml(item.id)}">
                    ${addToCartBtnHTML(item.id)}
                </div>
            </div>
        </div>
    `;
};

/**
 * Attaches event listeners for variant switching and cart interactions
 */
const initMenuEvents = (container, items) => {
    if (container.dataset.menuEventsInitialized === 'true') return;
    container.dataset.menuEventsInitialized = 'true';

    container.addEventListener('click', (e) => {
        // Variant Selection
        if (e.target.classList.contains('variant-btn')) {
            const btn = e.target;
            const card = btn.closest('.menu-card');
            const priceDisplay = card.querySelector('.item-price');
            const descriptionEl = card.querySelector('.item-description');
            const allVariantBtns = card.querySelectorAll('.variant-btn');
            allVariantBtns.forEach(b => {
                b.classList.remove('bg-[#C47F17]', 'text-black', 'border-[#C47F17]', 'active-variant');
                b.classList.add('border-white/20', 'text-white/50');
            });
            btn.classList.add('bg-[#C47F17]', 'text-black', 'border-[#C47F17]', 'active-variant');
            btn.classList.remove('border-white/20', 'text-white/50');
            priceDisplay.textContent = `₹${btn.getAttribute('data-price')}`;

            if (descriptionEl) {
                const baseDescription = card.querySelector('.menu-card-body')?.dataset.baseDescription || '';
                const variantLabel = btn.textContent.trim();
                descriptionEl.textContent = baseDescription
                    ? `${baseDescription} · ${variantLabel}`
                    : `Selected: ${variantLabel}`;
            }
        }

        // ADD TO CART button
        const addBtn = e.target.closest('[data-add]');
        if (addBtn) {
            const itemId = addBtn.getAttribute('data-add');
            const card = addBtn.closest('.menu-card');
            if (!card) return;
            const item = items.find(i => i.id === itemId);
            if (!item) return;
            const activeVariantBtn = card.querySelector('.variant-btn.active-variant');
            const variantType = activeVariantBtn ? activeVariantBtn.getAttribute('data-type') : 'single';
            const priceAtMoment = activeVariantBtn ? parseInt(activeVariantBtn.getAttribute('data-price')) : item.price;
            addItem(item, variantType, priceAtMoment);
            return;
        }

        // QTY SELECTOR (+/-) on card
        const qtyBtn = e.target.closest('.qty-btn[data-action]');
        if (qtyBtn) {
            const action = qtyBtn.getAttribute('data-action');
            const itemId = qtyBtn.getAttribute('data-id');
            const card = qtyBtn.closest('.menu-card');
            const item = items.find(i => i.id === itemId);
            if (!item) return;

            if (action === 'increase') {
                const activeVariantBtn = card ? card.querySelector('.variant-btn.active-variant') : null;
                const variantType = activeVariantBtn ? activeVariantBtn.getAttribute('data-type') : 'single';
                const priceAtMoment = activeVariantBtn ? parseInt(activeVariantBtn.getAttribute('data-price')) : item.price;
                addItem(item, variantType, priceAtMoment);
            } else if (action === 'decrease') {
                // Find the cartKey — use first matching entry for this item
                const cart = getCart();
                const entry = cart.find(i => i.id === itemId);
                if (entry) removeItem(entry.cartKey);
            }
        }
    });
};

const applyCurrentFilters = (container, items) => {
    const searchManager = window.littiwaleMenuSearch;
    if (searchManager && searchManager.getQuery()) {
        searchManager.apply(searchManager.getQuery());
        return;
    }
    renderMenu(container, items);
};

const initFloatingFilterShortcut = () => {
    const trigger = document.getElementById('floating-filter-btn');
    const topFilter = document.getElementById('category-filter');
    if (!trigger || !topFilter || trigger.dataset.initialized === 'true') return;
    trigger.dataset.initialized = 'true';
    trigger.addEventListener('click', () => {
        topFilter.scrollIntoView({ behavior: 'smooth', block: 'start' });
        topFilter.classList.remove('filter-hidden');
    });
};

const initFilterScrollBehavior = () => {
    const topFilter = document.getElementById('category-filter');
    const header = document.querySelector('nav.navbar');
    if (!topFilter || topFilter.dataset.scrollInit === 'true') return;
    topFilter.dataset.scrollInit = 'true';

    let lastScrollY = window.scrollY;

    const updateTopFilterVisibility = () => {
        const currentScroll = window.scrollY;
        const isScrollingDown = currentScroll > lastScrollY;
        const shouldHideTop = currentScroll > 150 && isScrollingDown;

        topFilter.classList.toggle('filter-hidden', shouldHideTop);
        if (!shouldHideTop) {
            topFilter.classList.remove('filter-hidden');
        }

        if (header) {
            header.classList.toggle('navbar-scrolled', currentScroll > 50);
        }
        document.body.classList.toggle('page-scrolled', currentScroll > 50);

        lastScrollY = currentScroll;
    };

    window.addEventListener('scroll', updateTopFilterVisibility, { passive: true });
    updateTopFilterVisibility();
};

const targetOrClosest = (target, selector) => {
    if (!(target instanceof Element)) target = target.parentElement;
    return target?.closest(selector) || null;
};
