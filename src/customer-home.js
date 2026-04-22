import { updateCartUI } from '/src/menu/cart-ui.js';
import { getCartCount } from '/src/store/cart.js';
import {
  RESTAURANT_WHATSAPP,
  RESTAURANT_PHONE,
  RESTAURANT_LAT,
  RESTAURANT_LNG,
} from '/src/constants/config.js';

const DEALS = [
  {
    id: 'litti-combo',
    title: 'Litti Combo Feast',
    subtitle: 'Authentic litti, chokha, dal & salad',
    description: 'A premium family feast with flame-grilled litti, tangy chokha, and house-made chutney.',
    image: '/assets/menu/craziest-images/bhook-lagi-hai-boss.png',
    originalPrice: '₹520',
    discountedPrice: '₹399',
  },
  {
    id: 'pizza-party',
    title: 'Pizza Party Pack',
    subtitle: 'Cheese-loaded thin crust + sides',
    description: 'Perfect for friends or small parties, with crispy crust and loaded toppings.',
    image: '/assets/menu/craziest-images/aaj-diet-bhool-ja.png',
    originalPrice: '₹720',
    discountedPrice: '₹549',
  },
  {
    id: 'biryani-feast',
    title: 'Biryani Feast Box',
    subtitle: 'Masala biryani with raita & kebab',
    description: 'Rich aromatic biryani served with cooling raita and a succulent kebab.',
    image: '/assets/menu/craziest-images/pet-bhar-combo.png',
    originalPrice: '₹620',
    discountedPrice: '₹499',
  },
];

const SERVICE_DATA = {
  'Party Orders': {
    icon: '🎉',
    badge: 'Family Catering',
    title: 'Party Orders',
    description: 'Book large-format meals and buffet-style servings for weddings, family events, and celebrations.',
    message: 'Hi Littiwale, I would like to enquire about Party Orders for an upcoming event. Please share your menu options, pricing, and availability.',
  },
  'Birthday Orders': {
    icon: '🎂',
    badge: 'Birthday Catering',
    title: 'Birthday Orders',
    description: 'Celebrate with custom birthday combos, sweet treats, and kid-friendly party platters.',
    message: 'Hi Littiwale, I would like to enquire about Birthday Orders for an upcoming celebration. Please share your options and pricing.',
  },
  'Office Meals': {
    icon: '🏢',
    badge: 'Corporate Meals',
    title: 'Office Meals',
    description: 'Smart corporate catering with delivery-ready thali sets and office-friendly meal packages.',
    message: 'Hi Littiwale, I would like to enquire about Office Meals for my team. Please share your corporate menu and pricing.',
  },
  'Custom Menu': {
    icon: '✨',
    badge: 'Custom Catering',
    title: 'Custom Menu',
    description: 'Build a tailored meal plan for your event with bespoke dishes and portion sizes.',
    message: 'Hi Littiwale, I would like to book a Custom Menu for an event. Please help me design the best menu and pricing.',
  },
};

const getWhatsAppUrl = (message) => {
  const encoded = encodeURIComponent(message);
  return `${RESTAURANT_WHATSAPP}?text=${encoded}`;
};

const renderDeals = () => {
  const dealsSection = document.getElementById('craziest-deals-section');
  const dealsGrid = document.getElementById('deals-grid');
  if (!dealsSection || !dealsGrid || !DEALS.length) return;

  dealsGrid.innerHTML = DEALS.map((deal) => {
    const message = `Hi Littiwale, I am interested in your ${deal.title} deal. Please share order details.`;
    return `
      <article class="deal-card">
        <div class="deal-visual">
          <img src="${deal.image}" alt="${deal.title}" loading="lazy" onerror="this.src='/images/logo.png'" />
          <div class="deal-visual-overlay"></div>
          <div class="deal-tag">Hot Deal</div>
        </div>
        <div class="deal-content">
          <span class="deal-subtitle">${deal.subtitle}</span>
          <h3>${deal.title}</h3>
          <p>${deal.description}</p>
          <div class="deal-pricing">
            <span class="price-old">${deal.originalPrice}</span>
            <span class="price-new">${deal.discountedPrice}</span>
          </div>
          <a href="${getWhatsAppUrl(message)}" target="_blank" rel="noreferrer noopener" class="btn btn-primary">Order Now</a>
        </div>
      </article>
    `;
  }).join('');

  dealsSection.style.display = 'block';
};

const openServiceModal = (serviceKey) => {
  const service = SERVICE_DATA[serviceKey];
  if (!service) return;

  const modal = document.getElementById('service-modal');
  const title = document.getElementById('service-modal-title');
  const copy = document.getElementById('service-modal-copy');
  const description = document.getElementById('service-modal-description');
  const icon = document.getElementById('service-modal-icon');
  const whatsappBtn = document.getElementById('service-whatsapp-btn');
  const callBtn = document.getElementById('service-call-btn');
  const visitBtn = document.getElementById('service-visit-btn');

  if (!modal || !title || !copy || !description || !icon || !whatsappBtn || !callBtn || !visitBtn) return;

  icon.textContent = service.icon;
  title.textContent = service.title;
  copy.textContent = service.badge;
  description.textContent = service.description;
  callBtn.href = `tel:${RESTAURANT_PHONE}`;
  whatsappBtn.href = getWhatsAppUrl(service.message);
  visitBtn.href = `https://maps.google.com/?q=${RESTAURANT_LAT},${RESTAURANT_LNG}`;

  modal.style.display = 'flex';
};

const closeServiceModal = () => {
  const modal = document.getElementById('service-modal');
  if (modal) modal.style.display = 'none';
};

const initCateringFlow = () => {
  document.querySelectorAll('.catering-service-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const service = button.dataset.service;
      openServiceModal(service);
    });
  });

  const modal = document.getElementById('service-modal');
  const closeButton = document.getElementById('close-service-modal');

  closeButton?.addEventListener('click', closeServiceModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeServiceModal();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeServiceModal();
  });
};

const syncCartBadges = () => {
  const total = getCartCount();
  document.querySelectorAll('#cart-count, #float-cart-count').forEach((el) => {
    el.textContent = total;
  });
};

const initCartInteractions = () => {
  const cartBtn = document.querySelector('#nav-cart-btn');
  const floatCartBtn = document.querySelector('#float-cart-btn');
  const modal = document.querySelector('#cart-modal');
  const closeModal = document.querySelector('#close-cart');

  const openCart = (event) => {
    event.preventDefault();
    if (!modal) return;
    modal.style.display = 'flex';
    updateCartUI();
    syncCartBadges();
  };

  [cartBtn, floatCartBtn].forEach((btn) => btn?.addEventListener('click', openCart));
  closeModal?.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
  modal?.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });

  window.addEventListener('cartUpdated', () => {
    updateCartUI();
    syncCartBadges();
  });

  updateCartUI();
  syncCartBadges();
};

const initNavbarScroll = () => {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
};

const init = () => {
  renderDeals();
  initCateringFlow();
  initCartInteractions();
  initNavbarScroll();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
