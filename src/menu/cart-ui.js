import { getCart, getCartTotal, getCartCount, addItem, removeItem, deleteEntry } from '../store/cart';

const cartItemsContainer = document.querySelector('#cart-items');
const drawerSummaryContainer = document.querySelector('#drawer-summary-container');
const drawerItemCount = document.querySelector('#drawer-item-count');

/**
 * Updates the cart UI components
 */
export const updateCartUI = () => {
    renderCartItems();
    updateCartTally();
};

/**
 * Renders the list of items in the cart modal — Image 2 reference style
 */
const renderCartItems = () => {
    if (!cartItemsContainer || !drawerSummaryContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;gap:14px;">
                <span style="font-size:52px;">🛒</span>
                <p style="color:rgba(255,255,255,0.3);font-size:13px;font-family:var(--font-futuristic);letter-spacing:1.5px;text-transform:uppercase;margin:0;">Your cart is empty</p>
                <button style="color:#F4B400;font-size:13px;background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;font-family:var(--font-futuristic);letter-spacing:0.5px;"
                    onclick="document.querySelector('#cart-modal').style.display='none'">Browse Menu →</button>
            </div>
        `;
        drawerSummaryContainer.innerHTML = '';
        if (drawerItemCount) drawerItemCount.textContent = '(0 items)';
        return;
    }

    const totalQty = cart.reduce((acc, i) => acc + i.quantity, 0);
    if (drawerItemCount) drawerItemCount.textContent = `(${totalQty} item${totalQty !== 1 ? 's' : ''})`;

    // Cart items — matching Image 2 reference design
    cartItemsContainer.innerHTML = cart.map(item => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(244,180,0,0.08);">
            <img src="${item.image || '/images/logo.png'}"
                style="width:58px;height:58px;border-radius:12px;object-fit:cover;flex-shrink:0;border:1px solid rgba(244,180,0,0.15);"
                onerror="this.src='/images/logo.png'"/>
            <div style="flex:1;min-width:0;">
                <p style="font-size:13px;font-weight:700;color:#F0EAD6;margin:0 0 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</p>
                <p style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;">${item.variant}</p>
                <p style="font-size:15px;font-weight:900;color:#F4B400;margin:0;">&#8377;${item.price * item.quantity}</p>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                <button class="qty-drawer-btn minus"
                    data-key="${item.cartKey}"
                    style="width:30px;height:30px;border-radius:8px;background:rgba(244,180,0,0.1);border:1px solid rgba(244,180,0,0.3);color:#F4B400;font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;transition:background 0.15s;"
                    onmouseover="this.style.background='rgba(244,180,0,0.2)'" onmouseout="this.style.background='rgba(244,180,0,0.1)'">&#x2212;</button>
                <span style="color:#F0EAD6;font-size:14px;font-weight:800;min-width:18px;text-align:center;">${item.quantity}</span>
                <button class="qty-drawer-btn plus"
                    data-key="${item.cartKey}"
                    style="width:30px;height:30px;border-radius:8px;background:#F4B400;border:none;color:#000;font-size:18px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;transition:opacity 0.15s;"
                    onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">+</button>
            </div>
        </div>
    `).join('');

    const subtotal = getCartTotal();
    const discount = window.appliedDiscount || 0;
    const couponCode = window.appliedCouponCode || '';

    // Summary footer — matching Image 2 reference
    drawerSummaryContainer.innerHTML = `
        <div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:7px;">
                <span>Subtotal</span><span style="color:#F0EAD6;font-weight:700;">&#8377;${subtotal}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:7px;">
                <span>Delivery fee</span>
                <span style="text-align:right;line-height:1.4;">&#8377;30<br><span style="font-size:10px;color:rgba(255,255,255,0.3);">(at checkout)</span></span>
            </div>
            ${discount > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#4ade80;margin-bottom:7px;">
                <span>Discount (${couponCode})</span><span>&#x2212;&#8377;${discount}</span>
            </div>` : ''}
            <div style="border-top:1px solid rgba(244,180,0,0.15);margin:12px 0 14px;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                <span style="font-size:18px;font-weight:900;color:#F0EAD6;font-family:var(--font-futuristic);">Grand Total</span>
                <span style="font-size:22px;font-weight:900;color:#F4B400;font-family:var(--font-futuristic);">&#8377;${subtotal - discount}</span>
            </div>
            <button id="proceed-checkout-btn"
                style="width:100%;padding:15px;background:#F4B400;color:#000;font-family:var(--font-futuristic);font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;border:none;border-radius:14px;cursor:pointer;transition:opacity 0.2s;"
                onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
                PROCEED TO CHECKOUT &#8594;
            </button>
        </div>
    `;
};

/**
 * Updates the cart tally badges
 */
const updateCartTally = () => {
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
    if (target.classList.contains('plus') && target.classList.contains('qty-drawer-btn')) {
        const key = target.getAttribute('data-key');
        const cart = getCart();
        const item = cart.find(i => i.cartKey === key);
        if (item) addItem(item, item.variant, item.price);
    }

    // Decrement Quantity
    if (target.classList.contains('minus') && target.classList.contains('qty-drawer-btn')) {
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
