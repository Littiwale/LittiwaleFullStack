import { addItem } from '../store/cart';

/**
 * Renders the menu items grouped by category into the specified container.
 * Also renders category tabs for filtering.
 * @param {HTMLElement} container 
 * @param {Array} items 
 */
export const renderMenu = (container, items) => {
    if (!container) return;

    // Filter available items and group by category
    const groupedItems = items.reduce((acc, item) => {
        if (item.available === false) return acc;
        
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    const categories = Object.keys(groupedItems).sort();
    
    // Render Category Tabs
    renderCategoryTabs(categories, container, groupedItems, items);

    // Initial Render of all categories
    renderAllCategories(container, groupedItems, items);

    // Initialize Event Listeners
    initMenuEvents(container, items);
};

/**
 * Renders the pill-style category tabs
 */
const renderCategoryTabs = (categories, container, groupedItems, items) => {
    const tabsContainer = document.querySelector('#category-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = `
        <button class="category-tab active" data-category="all">All Items</button>
        ${categories.map(cat => `<button class="category-tab" data-category="${cat}">${cat}</button>`).join('')}
    `;

    tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');
            if (category === 'all') {
                renderAllCategories(container, groupedItems, items);
            } else {
                renderSingleCategory(container, category, groupedItems[category], items);
            }
        });
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
        <h2 class="text-3xl font-black mb-8 flex items-center">
            <span class="h-8 w-1.5 bg-accent rounded-full mr-4"></span>
            ${category}
        </h2>
        <div class="grid grid-products">
            ${categoryItems.map(item => createItemCard(item)).join('')}
        </div>
    `;
    container.appendChild(categorySection);
};

/**
 * Creates the HTML for a single menu item card (Premium Design)
 */
const createItemCard = (item) => {
    const hasVariants = item.hasVariants && item.variants.length > 0;
    const defaultVariant = hasVariants ? item.variants[0] : null;
    const displayPrice = defaultVariant ? defaultVariant.price : item.price;
    
    const imageSrc = item.image || '/images/logo.png';

    return `
        <div class="menu-card rounded-3xl overflow-hidden flex flex-col h-full group" data-id="${item.id}">
            <div class="relative h-64 md:h-72 overflow-hidden">
                <img 
                    src="${imageSrc}" 
                    alt="${item.name}" 
                    loading="lazy"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onerror="this.src='/images/menu-litti.jpg'"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                ${item.bestseller ? `
                    <span class="absolute top-4 left-4 bg-accent text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl uppercase tracking-widest">
                        Bestseller
                    </span>
                ` : ''}
                
                <div class="absolute top-4 right-4 h-4 w-4 rounded-full border-2 border-white/20 shadow-lg ${item.veg ? 'bg-success' : 'bg-error'}" title="${item.veg ? 'Veg' : 'Non-Veg'}"></div>
                
                <div class="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <p class="text-[10px] text-gray-300 font-medium line-clamp-2">${item.description || 'Authentic flavors prepared with fresh ingredients.'}</p>
                </div>
            </div>
            
            <div class="p-6 flex flex-col flex-grow bg-secondary">
                <div class="mb-4">
                    <h3 class="text-xl font-bold mb-1 group-hover:text-accent transition-colors">${item.name}</h3>
                    <span class="text-accent font-black text-2xl item-price">₹${displayPrice}</span>
                </div>

                ${hasVariants ? `
                    <div class="flex space-x-2 mb-6">
                        ${item.variants.map((v, idx) => `
                            <button 
                                class="variant-btn flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${idx === 0 ? 'bg-accent text-black border-accent active-variant' : 'border-gray-800 text-gray-500 hover:border-accent/40 hover:text-gray-300'}"
                                data-price="${v.price}"
                                data-type="${v.type.toLowerCase()}"
                            >
                                ${v.type}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}

                <button class="add-to-cart-btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center space-x-3 mt-auto">
                    <span class="uppercase tracking-widest text-xs font-black">Add to Cart</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                </button>
            </div>
        </div>
    `;
};

/**
 * Attaches event listeners for variant switching and interactions
 */
const initMenuEvents = (container, items) => {
    container.addEventListener('click', (e) => {
        const btn = e.target;
        
        // Variant Selection
        if (btn.classList.contains('variant-btn')) {
            const card = btn.closest('.menu-card');
            const priceDisplay = card.querySelector('.item-price');
            const allVariantBtns = card.querySelectorAll('.variant-btn');

            allVariantBtns.forEach(b => {
                b.classList.remove('bg-accent', 'text-black', 'border-accent', 'active-variant');
                b.classList.add('border-gray-800', 'text-gray-500');
            });
            btn.classList.add('bg-accent', 'text-black', 'border-accent', 'active-variant');
            btn.classList.remove('border-gray-800', 'text-gray-500');

            const newPrice = btn.getAttribute('data-price');
            priceDisplay.textContent = `₹${newPrice}`;
        }

        // Add to Cart
        const cartBtn = targetOrClosest(e.target, '.add-to-cart-btn');
        if (cartBtn) {
            const card = cartBtn.closest('.menu-card');
            const id = card.getAttribute('data-id');
            const item = items.find(i => i.id === id);
            
            if (item) {
                const activeVariantBtn = card.querySelector('.variant-btn.active-variant');
                const variantType = activeVariantBtn ? activeVariantBtn.getAttribute('data-type') : 'single';
                const priceAtMoment = activeVariantBtn ? parseInt(activeVariantBtn.getAttribute('data-price')) : item.price;
                
                addItem(item, variantType, priceAtMoment);
                
                // Visual feedback
                const originalContent = cartBtn.innerHTML;
                cartBtn.innerHTML = '<span class="uppercase tracking-widest text-xs font-black">Success! ✅</span>';
                cartBtn.style.background = 'var(--success)';
                setTimeout(() => {
                    cartBtn.innerHTML = originalContent;
                    cartBtn.style.background = '';
                }, 1000);
            }
        }
    });
};

const targetOrClosest = (target, selector) => {
    if (target.matches(selector)) return target;
    return target.closest(selector);
};
