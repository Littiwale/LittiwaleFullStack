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
  Instagram: customer/index.html ΓåÆ line 162 ΓåÆ https://www.instagram.com/reel/DM0OaRuTorz/
  Instagram: customer/index.html ΓåÆ line 165 ΓåÆ https://www.instagram.com/reel/DVOCmnIk-Yt/
  Instagram: customer/index.html ΓåÆ line 168 ΓåÆ https://www.instagram.com/reel/DUsneR7E1Vh/
  Instagram: customer/index.html ΓåÆ line 171 ΓåÆ https://www.instagram.com/reel/DU20uoDE9VY/
  Instagram: customer/index.html ΓåÆ line 174 ΓåÆ https://www.instagram.com/reel/DUVd2y6k_bG/
  Instagram: customer/index.html ΓåÆ line 177 ΓåÆ https://www.instagram.com/reel/DTcsHKbE2C7/
  Instagram: customer/index.html ΓåÆ line 215 ΓåÆ https://instagram.com/littiwale
  Facebook:  customer/index.html ΓåÆ line 219 ΓåÆ https://facebook.com/littiwale
  Instagram: customer/menu.html ΓåÆ line 215 ΓåÆ https://instagram.com/littiwale
  Facebook:  customer/menu.html ΓåÆ line 222 ΓåÆ https://facebook.com/littiwale
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 306 ΓåÆ https://www.instagram.com/reel/DM0OaRuTorz/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 311 ΓåÆ https://www.instagram.com/reel/DVOCmnIk-Yt/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 316 ΓåÆ https://www.instagram.com/reel/DUsneR7E1Vh/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 321 ΓåÆ https://www.instagram.com/reel/DU20uoDE9VY/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 326 ΓåÆ https://www.instagram.com/reel/DUVd2y6k_bG/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 331 ΓåÆ https://www.instagram.com/reel/DTcsHKbE2C7/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 439 ΓåÆ https://www.instagram.com/littiwaleofficial/
  Facebook:  __DO_NOT_TOUCH_LEGACY_ARCHIVE__/index.html ΓåÆ line 448 ΓåÆ https://www.facebook.com/share/18fQs5NEQU/
  Instagram: __DO_NOT_TOUCH_LEGACY_ARCHIVE__/checkout.html ΓåÆ line 184 ΓåÆ https://www.instagram.com/littiwaleofficial/
  Facebook:  __DO_NOT_TOUCH_LEGACY_ARCHIVE__/checkout.html ΓåÆ line 193 ΓåÆ https://www.facebook.com/share/18fQs5NEQU/
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

const initPremium = () => {
  injectSkeletonLoaders();
  setupSkeletonObserver();
  setupScrollHide();
  setupCartAnimation();
  prepareSectionTransition();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPremium);
} else {
  initPremium();
}
