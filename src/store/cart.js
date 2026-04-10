/**
 * Cart Store - Manages the state and persistence of the shopping cart
 * Strict variant separation is enforced via composite keys.
 */

let cart = [];

// Initialize cart from localStorage
const loadCart = () => {
    const savedCart = localStorage.getItem('littiwale_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Failed to parse cart from localStorage', e);
            cart = [];
        }
    }
};

const saveCart = () => {
    localStorage.setItem('littiwale_cart', JSON.stringify(cart));
    // Dispatch a custom event to notify UI components
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
};

export const getCart = () => [...cart];

/**
 * Adds an item to the cart with strict variant separation
 * @param {Object} item - Original item from Firestore
 * @param {String} variantType - 'half', 'full', or 'single'
 * @param {Number} lockedPrice - Price at the time of adding
 */
export const addItem = (item, variantType = 'single', lockedPrice) => {
    const cartKey = `${item.id}_${variantType}`;
    const existingIndex = cart.findIndex(i => i.cartKey === cartKey);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            cartKey,
            id: item.id,
            name: item.name,
            category: item.category,
            variant: variantType,
            price: lockedPrice,
            image: item.image,
            veg: item.veg,
            quantity: 1
        });
    }
    saveCart();
};

/**
 * Decrements or removes an item by its composite key
 * @param {String} cartKey 
 */
export const removeItem = (cartKey) => {
    const index = cart.findIndex(i => i.cartKey === cartKey);
    if (index > -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
    }
};

/**
 * Completely removes an item entry from the cart
 * @param {String} cartKey 
 */
export const deleteEntry = (cartKey) => {
    cart = cart.filter(i => i.cartKey !== cartKey);
    saveCart();
};

export const clearCart = () => {
    cart = [];
    saveCart();
};

export const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
};

// Auto-load on Module Import
loadCart();
