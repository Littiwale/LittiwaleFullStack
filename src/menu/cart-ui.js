import { getCart, getCartTotal, getCartCount, addItem, removeItem, deleteEntry } from '../store/cart';

const cartItemsContainer = document.querySelector('#cart-items');
const cartTotalDisplay = document.querySelector('#cart-total');
const cartTally = document.querySelector('#cart-tally');

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
    if (!cartItemsContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <p class="text-lg">Your cart is empty.</p>
                <p class="text-sm mt-2">Add some delicious litti to get started!</p>
            </div>
        `;
        cartTotalDisplay.textContent = '₹0';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center space-x-4 bg-secondary p-5 rounded-[24px] border border-white/5 group animate-fade-in">
            <div class="h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src="${item.image || '/images/logo.png'}" alt="${item.name}" class="h-full w-full object-cover transition-transform group-hover:scale-110"/>
            </div>
            
            <div class="flex-grow">
                <div class="flex justify-between items-start mb-1">
                    <div>
                        <h4 class="font-bold text-base leading-tight">${item.name}</h4>
                        <p class="text-[10px] text-accent uppercase font-black tracking-widest mt-1">${item.variant}</p>
                    </div>
                    <button class="delete-item text-gray-600 hover:text-error transition-colors text-xl font-light" data-key="${item.cartKey}">
                        &times;
                    </button>
                </div>
                
                <div class="flex justify-between items-center mt-4">
                    <div class="flex items-center bg-primary rounded-xl p-1 border border-gray-800">
                        <button class="qty-btn minus w-8 h-8 flex items-center justify-center hover:text-accent font-bold" data-key="${item.cartKey}">-</button>
                        <span class="px-2 text-sm font-black min-w-[1.5rem] text-center">${item.quantity}</span>
                        <button class="qty-btn plus w-8 h-8 flex items-center justify-center hover:text-accent font-bold" data-key="${item.cartKey}">+</button>
                    </div>
                    <span class="font-black text-lg">₹${item.price * item.quantity}</span>
                </div>
            </div>
        </div>
    `).join('');

    cartTotalDisplay.textContent = `₹${getCartTotal()}`;
};

/**
 * Updates the cart tally button in the header
 */
const updateCartTally = () => {
    if (!cartTally) return;
    const count = getCartCount();
    cartTally.textContent = `Cart (${count})`;
    
    // Add a quick animation effect
    cartTally.classList.add('scale-110', 'bg-white');
    setTimeout(() => {
        cartTally.classList.remove('scale-110', 'bg-white');
    }, 200);
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
    
    // Delete Entry
    if (target.classList.contains('delete-item')) {
        const key = target.getAttribute('data-key');
        deleteEntry(key);
    }
});

// Sync UI whenever cart is updated
window.addEventListener('cart-updated', updateCartUI);
