// Mock localStorage for Node environment 
global.localStorage = {
    _data: {},
    setItem(id, val) { this._data[id] = String(val); },
    getItem(id) { return this._data[id] || null; }
};

// Dispatch mock for window
global.window = {
    dispatchEvent: () => {}
};
global.CustomEvent = class {};

// Dynamic import after mocking
const { addItem, getCart, getCartTotal, getCartCount } = await import('./src/store/cart.js');

async function testCart() {
    console.log("🧪 Testing Cart Logic (Strict Separation)...");
    
    const mockItem = { id: 'veg-noodles', name: 'Veg Noodles', category: 'Noodles', image: 'img.jpg', price: 49 };
    
    // Add Half variant
    addItem(mockItem, 'half', 49);
    console.log("✅ Added 1x Half Veg Noodles");
    
    // Add another Half variant
    addItem(mockItem, 'half', 49);
    console.log("✅ Added another 1x Half Veg Noodles");
    
    // Add Full variant
    addItem(mockItem, 'full', 99);
    console.log("✅ Added 1x Full Veg Noodles");
    
    const cart = getCart();
    console.log("\n📊 Cart Items:");
    cart.forEach(i => console.log(`- ${i.name} [${i.variant}]: Qty ${i.quantity}, Price ${i.price}`));
    
    if (cart.length === 2 && cart.find(i => i.variant === 'half').quantity === 2) {
        console.log("\n✨ SUCCESS: Half and Full are separate entries!");
    } else {
        console.log("\n❌ FAILURE: Separation logic check failed.");
    }
    
    console.log(`💰 Total Price: ₹${getCartTotal()}`);
    console.log(`📦 Total Items: ${getCartCount()}`);
}

testCart();
