// Mocking the environment for testing
global.localStorage = {
    _data: {},
    setItem(id, val) { this._data[id] = String(val); },
    getItem(id) { return this._data[id] || null; }
};
global.window = { dispatchEvent: () => {} };
global.CustomEvent = class {};

// Mock fetch/firebase logic partially if needed, but let's test the logic we can.

async function testOrder() {
    console.log("🧪 Testing Step 4: Order System Logic...");

    // 1. Test Order ID format
    const generateOrderId = () => {
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `LW-${dateStr}-${randomSuffix}`;
    };

    const id = generateOrderId();
    console.log(`- Generated ID: ${id}`);
    const idRegex = /^LW-\d{8}-[A-Z0-9]{4}$/;
    if (idRegex.test(id)) {
        console.log("✅ Order ID format matches: LW-YYYYMMDD-XXXX");
    } else {
        console.log("❌ Order ID format mismatch!");
    }

    // 2. Test Phone Sanitization
    const sanitizePhone = (phone) => phone.replace(/[^0-9]/g, '').slice(-10);
    const phones = ["+91 9876543210", "987-654-3210", "1234567890123"];
    phones.forEach(p => {
        const clean = sanitizePhone(p);
        console.log(`- Phone: ${p} -> Clean: ${clean} (${clean.length} digits)`);
    });

}

testOrder();
