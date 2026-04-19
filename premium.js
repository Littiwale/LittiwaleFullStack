/*
  SELECTORS MAP
  Category Bar: #category-tabs .category-tab
  Category Wrapper: #category-tabs
  Floating Filter Btn: #floating-filter-btn
  Floating Cart: #float-cart-btn
  Add to Cart Btn: button[data-add]
  Cart Count: #cart-count, #float-cart-count
  Menu Grid: #menu-grid-container
  Menu Data Variable: menuData

  SOCIAL LINKS FOUND
  Instagram: customer/index.html → line 162 → https://www.instagram.com/reel/DM0OaRuTorz/
  Instagram: customer/index.html → line 165 → https://www.instagram.com/reel/DVOCmnIk-Yt/
  Instagram: customer/index.html → line 168 → https://www.instagram.com/reel/DUsneR7E1Vh/
  Instagram: customer/index.html → line 171 → https://www.instagram.com/reel/DU20uoDE9VY/
  Instagram: customer/index.html → line 174 → https://www.instagram.com/reel/DUVd2y6k_bG/
  Instagram: customer/index.html → line 177 → https://www.instagram.com/reel/DTcsHKbE2C7/
  Instagram: customer/index.html → line 215 → https://instagram.com/littiwale
  Facebook:  customer/index.html → line 219 → https://facebook.com/littiwale
  Instagram: customer/menu.html → line 215 → https://instagram.com/littiwale
  Facebook:  customer/menu.html → line 222 → https://facebook.com/littiwale
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 306 → https://www.instagram.com/reel/DM0OaRuTorz/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 311 → https://www.instagram.com/reel/DVOCmnIk-Yt/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 316 → https://www.instagram.com/reel/DUsneR7E1Vh/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 321 → https://www.instagram.com/reel/DU20uoDE9VY/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 326 → https://www.instagram.com/reel/DUVd2y6k_bG/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 331 → https://www.instagram.com/reel/DTcsHKbE2C7/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 439 → https://www.instagram.com/littiwaleofficial/
  Facebook:  __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html → line 448 → https://www.facebook.com/share/18fQs5NEQU/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/checkout.html → line 184 → https://www.instagram.com/littiwaleofficial/
  Facebook:  __DO_NOT_TOUCH_LEGACY_ARCHIVE__/checkout.html → line 193 → https://www.facebook.com/share/18fQs5NEQU/
*/

import { addItem, getCart } from '/src/store/cart.js';

const selectors = {
  categoryBar: '#category-tabs',
  categoryWrapper: '#category-tabs',
  floatingFilter: '#floating-filter-btn',
  floatingCart: '#float-cart-btn',
  addToCartBtn: 'button[data-add]',
  cartCount: '#cart-count, #float-cart-count',
  menuGrid: '#menu-grid-container',
  recommendationsSection: '#recommendations-section',
};

let lastClickedAddButton = null;
let categoryVisible = true;
let revealTimer = null;

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getMenuData = () => {
  return window.littiwaleMenuData || [];
};

const createSkeletonCards = () => {
  return Array.from({ length: 6 }, () => `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-btn"></div>
    </div>
  `).join('');
};

const injectSkeletonLoaders = () => {
  const menuGrid = document.querySelector(selectors.menuGrid);
  if (!menuGrid || menuGrid.querySelector('.menu-card')) return;
  if (!menuGrid.querySelector('.skeleton-card')) {
    menuGrid.innerHTML = createSkeletonCards();
  }
};

const cleanupSkeletonLoaders = () => {
  const skeletons = document.querySelectorAll('.skeleton-card');
  if (!skeletons.length) return;
  skeletons.forEach((card) => {
    card.classList.add('fade-out');
    card.addEventListener('transitionend', () => {
      card.remove();
    }, { once: true });
  });
};

const setupSkeletonObserver = () => {
  const menuGrid = document.querySelector(selectors.menuGrid);
  if (!menuGrid) return;

  const observer = new MutationObserver(() => {
    if (menuGrid.querySelector('.menu-card')) {
      cleanupSkeletonLoaders();
    }
  });

  observer.observe(menuGrid, { childList: true, subtree: true });
  window.addEventListener('menuDataReady', () => {
    cleanupSkeletonLoaders();
  });
};

const updateFloatingCartAnimation = () => {
  const cartIcon = document.querySelector(selectors.floatingCart);
  if (cartIcon) {
    cartIcon.classList.add('cart-animate');
    window.setTimeout(() => cartIcon.classList.remove('cart-animate'), 550);
  }
};

const animateCartBadges = () => {
  document.querySelectorAll(selectors.cartCount).forEach((badge) => {
    badge.classList.add('cart-count-animate');
    window.setTimeout(() => badge.classList.remove('cart-count-animate'), 550);
  });
};

const setupCartAnimation = () => {
  document.addEventListener('click', (event) => {
    const button = event.target.closest(selectors.addToCartBtn);
    if (!button) return;
    lastClickedAddButton = button;
  });

  window.addEventListener('cartUpdated', () => {
    if (lastClickedAddButton && lastClickedAddButton.isConnected) {
      lastClickedAddButton.classList.add('adding');
      window.setTimeout(() => {
        lastClickedAddButton?.classList.remove('adding');
      }, 450);
    }
    updateFloatingCartAnimation();
    animateCartBadges();
    lastClickedAddButton = null;
  });
};

const setupScrollHide = () => {
  const categoryBar = document.querySelector(selectors.categoryBar);
  const floatingFilter = document.querySelector(selectors.floatingFilter);
  if (!categoryBar || !floatingFilter) return;

  const observer = new IntersectionObserver(([entry]) => {
    categoryVisible = entry.isIntersecting;
    categoryBar.classList.toggle('cats-hidden', !categoryVisible);
  }, {
    root: null,
    threshold: 0,
  });

  observer.observe(categoryBar);

  floatingFilter.addEventListener('click', () => {
    categoryBar.classList.remove('cats-hidden');
    clearTimeout(revealTimer);
    revealTimer = window.setTimeout(() => {
      if (!categoryVisible) {
        categoryBar.classList.add('cats-hidden');
      }
    }, 3500);
  });
};

const prepareSectionTransition = () => {
  const pageSection = document.querySelector('#menu-page-section');
  if (!pageSection) return;
  pageSection.classList.add('page-section');

  const activate = () => pageSection.classList.add('active');
  const deactivate = () => pageSection.classList.remove('active');

  window.requestAnimationFrame(() => {
    window.setTimeout(activate, 50);
  });

  const scheduleTransition = () => {
    deactivate();
    window.setTimeout(activate, 70);
  };

  const categoryTabs = document.querySelector('#category-tabs');
  const categoryFilter = document.querySelector('#category-filter');

  categoryTabs?.addEventListener('click', scheduleTransition);
  categoryFilter?.addEventListener('click', (event) => {
    if (event.target.closest('.diet-pill')) {
      scheduleTransition();
    }
  });
};

const buildRecommendationCard = (item) => {
  return `
    <div class="recommendation-card">
      <div class="recommendation-media">
        <img src="${escapeHtml(item.image || '/images/logo.png')}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">
        <span class="card-badge">⭐ Popular</span>
      </div>
      <div class="recommendation-body">
        <h3 class="recommendation-title">${escapeHtml(item.name)}</h3>
        <p class="text-sm text-secondary leading-relaxed">${escapeHtml(item.description || item.category || 'Delicious choice')}</p>
        <div class="recommendation-footer">
          <div class="flex items-center justify-between gap-4 mb-3">
            <span class="font-bold">₹${item.price ?? 0}</span>
            <span class="text-xs uppercase tracking-[0.18em] text-white/70">${escapeHtml(item.category || 'Menu')}</span>
          </div>
          <button type="button" class="btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-medium" data-add="${escapeHtml(item.id)}">
            ADD TO CART 🛒
          </button>
        </div>
      </div>
    </div>
  `;
};

const getRecommendations = () => {
  const menuData = getMenuData();
  if (!menuData.length) return [];

  const cartItems = getCart();
  if (cartItems.length === 0) {
    return menuData.slice(0, 4);
  }

  const cartCategories = new Set(cartItems.map((entry) => entry.category).filter(Boolean));
  const byCategory = menuData.filter((item) => cartCategories.has(item.category));
  const uniqueRecommendations = [];
  const seenIds = new Set();

  for (const item of byCategory) {
    if (uniqueRecommendations.length >= 4) break;
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueRecommendations.push(item);
    }
  }

  if (uniqueRecommendations.length < 4) {
    for (const item of menuData) {
      if (uniqueRecommendations.length >= 4) break;
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueRecommendations.push(item);
      }
    }
  }

  return uniqueRecommendations.slice(0, 4);
};

const renderRecommendations = () => {
  const menuGrid = document.querySelector(selectors.menuGrid);
  if (!menuGrid) return;

  let recommendationsSection = document.querySelector(selectors.recommendationsSection);
  if (!recommendationsSection) {
    recommendationsSection = document.createElement('section');
    recommendationsSection.id = 'recommendations-section';
    recommendationsSection.innerHTML = `
      <div class="section-header">
        <h2>Recommended for You 🔥</h2>
      </div>
      <div class="recommendation-grid"></div>
    `;
    menuGrid.parentNode.insertBefore(recommendationsSection, menuGrid);
  }

  const recommendedItems = getRecommendations();
  const grid = recommendationsSection.querySelector('.recommendation-grid');
  if (!grid) return;

  if (!recommendedItems.length) {
    recommendationsSection.style.display = 'none';
    return;
  }

  recommendationsSection.style.display = '';
  grid.innerHTML = recommendedItems.map(buildRecommendationCard).join('');
};

const setupRecommendationActions = () => {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('#recommendations-section button[data-add]');
    if (!button) return;
    const itemId = button.dataset.add;
    const menuData = getMenuData();
    const item = menuData.find((entry) => entry.id === itemId);
    if (!item) return;
    addItem(item, 'single', item.price);
  });
};

const initPremium = () => {
  injectSkeletonLoaders();
  setupSkeletonObserver();
  setupScrollHide();
  setupCartAnimation();
  prepareSectionTransition();
  setupRecommendationActions();
  renderRecommendations();

  window.addEventListener('menuDataReady', renderRecommendations);
  window.addEventListener('cartUpdated', renderRecommendations);

  if (getMenuData().length) {
    renderRecommendations();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremium);
} else {
  initPremium();
}
