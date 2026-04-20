import { getCart, getCartTotal, getCartCount, addItem, removeItem, deleteEntry } from '../store/cart';

const cartItemsContainer = document.querySelector('#cart-items');
const drawerSummaryContainer = document.querySelector('#drawer-summary-container');
const drawerItemCount = document.querySelector('#drawer-item-count');

// Coupon state (we share this with checkout, or just hold visually in drawer)
// Currently coupon is ONLY applied in checkout modal, but drawer has a discount row.
// The specs say: "Coupon discount row: only show if coupon is applied".
// However, the coupon input is currently in the checkout modal form!
// Wait - if the coupon is applied in checkout, the drawer wouldn't show it unless we go back.
// But the spec says: "Drawer order summary: Subtotal, Delivery fee, Discount (if coupon), Total".
// I'll render the variables if they are somehow globally available, but normally it's 0.

/**
 * Updates the cart UI components
 */
export const updateCartUI = () => {
    renderCartItems();
    updateCartTally();
};

/**
 * Renders the list of items in the cart modal
 */
const renderCartItems = () => {
    if (!cartItemsContainer || !drawerSummaryContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full gap-4 text-white/40 pt-10">
                <span class="text-5xl">🛒</span>
                <p class="text-sm">Your cart is empty</p>
                <button class="text-[#C47F17] text-sm underline mt-2" onclick="document.querySelector('#cart-modal').style.display='none'">Browse Menu</button>
            </div>
        `;
        drawerSummaryContainer.innerHTML = '';
        if (drawerItemCount) drawerItemCount.textContent = '0';
        return;
    }

    if (drawerItemCount) drawerItemCount.textContent = cart.reduce((acc, i) => acc + i.quantity, 0).toString();

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center gap-3 bg-[#1f222b] border border-white/10 rounded-xl p-3">
            <img src="${item.image || '/images/logo.png'}" class="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0" onerror="this.src='/images/logo.png'"/>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">${item.name}</p>
                <p class="text-xs text-white/70 uppercase tracking-wider">${item.variant}</p>
                <p class="text-sm font-medium text-[#C47F17] mt-1">₹${item.price * item.quantity}</p>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button class="qty-drawer-btn minus w-7 h-7 rounded-full bg-[#C47F17] text-black font-bold text-base flex items-center justify-center" data-key="${item.cartKey}">−</button>
                <span class="text-white text-sm w-4 text-center">${item.quantity}</span>
                <button class="qty-drawer-btn plus w-7 h-7 rounded-full bg-[#C47F17] text-black font-bold text-base flex items-center justify-center" data-key="${item.cartKey}">+</button>
            </div>
        </div>
    `).join('');

    const subtotal = getCartTotal();

    // Since coupon is entered at checkout, discount is mostly 0 here, but keeping structure as req
    const discount = window.appliedDiscount || 0; 
    const couponCode = window.appliedCouponCode || '';
    
    drawerSummaryContainer.innerHTML = `
        <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
                <span class="text-white/80">Subtotal</span>
                <span class="text-white font-bold">₹${subtotal}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-white/80">Delivery fee</span>
                <div class="text-right">
                    <span class="text-white font-bold">₹--</span>
                    <p class="text-[11px] text-white/60">(calculated at checkout)</p>
                </div>
            </div>
            ${discount > 0 ? `
            <div class="flex justify-between text-sm text-green-400" id="drawer-discount-row">
                <span>Discount (${couponCode})</span>
                <span class="font-bold">−₹${discount}</span>
            </div>
            ` : ''}
            <div class="border-t border-white/10 pt-2 flex justify-between mt-2">
                <span class="text-white font-medium">Total</span>
                <span class="text-white font-black text-base">₹${subtotal - discount}</span>
            </div>
        </div>
        <button class="w-full py-3 bg-[#C47F17] text-black font-black uppercase tracking-widest rounded-xl text-sm hover:opacity-90 transition-opacity" id="proceed-checkout-btn">
            PROCEED TO CHECKOUT
        </button>
        <button class="w-full py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl text-sm hover:opacity-90 transition-opacity mt-2" id="clear-cart-btn">
            CLEAR CART
        </button>
    `;
    
    // Setup clear cart button handler
    const clearBtn = document.querySelector('#clear-cart-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to empty your entire cart?')) {
                const cartItems = getCart();
                cartItems.forEach(item => deleteEntry(item.cartKey));
                updateCartUI();
            }
        });
    }
};

/**
 * Updates the cart tally badges
 */
const updateCartTally = () => {
    // Both nav badge and floating badge updated inside menu.js via syncCartBadges!
    // But we can trigger animation here if we find them
    document.querySelectorAll('#cart-count, #float-cart-count').forEach(el => {
        el.classList.add('scale-125', 'text-[#C47F17]');
        setTimeout(() => {
            el.classList.remove('scale-125', 'text-[#C47F17]');
        }, 200);
    });
};

// Event Delegation for Cart Actions
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Increment Quantity
    if (target.classList.contains('plus')) {
        const key = target.getAttribute('data-key');
        const cart = getCart();
        const item = cart.find(i => i.cartKey === key);
        if (item) addItem(item, item.variant, item.price);
    }
    
    // Decrement Quantity
    if (target.classList.contains('minus')) {
        const key = target.getAttribute('data-key');
        removeItem(key);
    }
    
    // Open Checkout Modal Event Delegation
    if (target.id === 'proceed-checkout-btn' || target.closest('#proceed-checkout-btn')) {
        const cart = getCart();
        if (cart.length === 0) return;
        
        // Trigger a custom event that checkout.js listens to
        window.dispatchEvent(new CustomEvent('openCheckout'));
    }
});

// Sync UI whenever cart is updated
window.addEventListener('cartUpdated', updateCartUI);
