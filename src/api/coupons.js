import { doc, getDoc, collection, addDoc, deleteDoc, getDocs, updateDoc, serverTimestamp, setDoc, query, orderBy, where, limit, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Validates a coupon code against Firestore.
 * Returns { valid, discount, message, type, details }
 * @param {string} code - The coupon code entered by user (case-insensitive)
 * @param {number} cartTotal - Current cart total in ₹
 * @param {Array} cartItems - Current cart items for advanced validation
 */
export const validateCoupon = async (code, cartTotal, cartItems = []) => {
    try {
        const normalized = code.trim().toUpperCase();
        const couponRef = doc(db, 'coupons', normalized);
        const snap = await getDoc(couponRef);

        if (!snap.exists()) {
            return { valid: false, message: 'Invalid coupon code.' };
        }

        const coupon = snap.data();

        // Check if active
        if (coupon.active === false) {
            return { valid: false, message: 'This coupon is no longer active.' };
        }

        // Check expiry
        if (coupon.expiresAt) {
            const expiry = coupon.expiresAt.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
            if (new Date() > expiry) {
                return { valid: false, message: 'This coupon has expired.' };
            }
        }

        // Check usage limit
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, message: 'This coupon has reached maximum usage limit.' };
        }

        // Check minimum order value
        if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
            return {
                valid: false,
                message: `Minimum order of ₹${coupon.minOrderValue} required for this coupon.`
            };
        }

        // Type-specific validation and discount calculation
        let discount = 0;
        let message = '';
        let details = {};

        switch (coupon.type) {
            case 'percentage':
                const percentDiscount = (cartTotal * coupon.discountPercent) / 100;
                const maxDiscount = coupon.maxDiscount || percentDiscount;
                discount = Math.round(Math.min(percentDiscount, maxDiscount));
                message = `${coupon.discountPercent}% off applied! Save ₹${discount} 🎉`;
                details = { percent: coupon.discountPercent, maxDiscount };
                break;

            case 'flat':
                discount = coupon.discountAmount;
                if (discount > cartTotal) {
                    discount = cartTotal; // Don't allow discount > cart total
                }
                message = `₹${discount} off applied! 🎉`;
                details = { flatAmount: coupon.discountAmount };
                break;

            case 'flat_percent':
                const flatPercentDiscount = (cartTotal * coupon.discountPercent) / 100;
                discount = Math.round(flatPercentDiscount);
                message = `${coupon.discountPercent}% off applied! Save ₹${discount} 🎉`;
                details = { percent: coupon.discountPercent };
                break;

            case 'freebie':
                // Freebie coupons don't provide monetary discount
                // They unlock free items which are handled separately
                discount = 0;
                const freebies = coupon.freebieItems || (coupon.freeItemName ? [{ name: coupon.freeItemName, quantity: coupon.freeItemQuantity || 1 }] : []);
                message = `Free items unlocked! 🎁`;
                details = { freebieItems: freebies };
                break;

            case 'special_price':
                // Special price unlocks items at a special price (like ₹99 items)
                // Validation is ONLY based on cart minimum value — no need for items in cart
                const specialItems = coupon.specialItems || (coupon.productName ? [{ name: coupon.productName, price: coupon.offerPrice || 99 }] : []);
                discount = 0; // No direct discount — customer adds the special-price items separately
                message = `🎯 Special items unlocked! Add items below at ₹${specialItems[0]?.price || 99} each.`;
                details = { specialItems };
                break;

            case 'combo_upgrade':
                discount = 0; // Upgrade pricing handled separately
                const comboItems = coupon.comboItems || (coupon.upgradeDescription ? [{ description: coupon.upgradeDescription, price: coupon.upgradePrice || 0 }] : []);
                message = `Combo upgrades available! ⬆️`;
                details = { comboItems };
                break;

            default:
                // Backward compatibility for old coupons
                discount = coupon.discountAmount || 0;
                message = `₹${discount} off applied! 🎉`;
                break;
        }

        return {
            valid: true,
            discount,
            message,
            type: coupon.type,
            details,
            couponData: coupon
        };

    } catch (error) {
        console.error('Coupon validation error:', error);
        return { valid: false, message: 'Could not validate coupon. Try again.' };
    }
};

/**
 * Fetches all coupons (admin use)
 * @returns {Promise<Array>}
 */
export const fetchAllCoupons = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'coupons'));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return [];
    }
};

/**
 * Fetches active coupons for customers (only active, non-expired, within usage limits)
 * @param {number} cartTotal - Current cart total to filter eligible coupons
 * @returns {Promise<Array>}
 */
export const fetchActiveCoupons = async (cartTotal = 0) => {
    try {
        const snapshot = await getDocs(collection(db, 'coupons'));
        const now = new Date();

        return snapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(coupon => {
                // Basic filters
                if (!coupon.active) return false;
                if (coupon.expiresAt && coupon.expiresAt.toDate && coupon.expiresAt.toDate() < now) return false;
                if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return false;

                // Cart total filter (optional)
                if (cartTotal > 0 && coupon.minOrderValue && cartTotal < coupon.minOrderValue) return false;

                return true;
            });
    } catch (error) {
        console.error('Error fetching active coupons:', error);
        return [];
    }
};

/**
 * Creates a new coupon (admin use).
 * The coupon code is used as the document ID (uppercased).
 * @param {Object} couponData - Enhanced coupon data structure
 */
export const createCoupon = async (couponData) => {
    try {
        const code = couponData.code.trim().toUpperCase();
        const couponRef = doc(db, 'coupons', code);

        // Build coupon document based on type
        const couponDoc = {
            // Common fields
            type: couponData.type || 'flat', // Default to flat for backward compatibility
            description: couponData.description || '',
            minOrderValue: couponData.minOrderValue || 0,
            maxUses: couponData.maxUses || 0,
            usedCount: 0,
            expiresAt: couponData.expiresAt || null,
            active: couponData.active !== false,
            autoApply: couponData.autoApply || false,
            stackable: couponData.stackable || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Type-specific fields
        switch (couponData.type) {
            case 'percentage':
                couponDoc.discountPercent = couponData.discountPercent || 0;
                couponDoc.maxDiscount = couponData.maxDiscount || 0;
                break;

            case 'flat':
                couponDoc.discountAmount = couponData.discountAmount || 0;
                break;

            case 'flat_percent':
                couponDoc.discountPercent = couponData.discountPercent || 0;
                break;

            case 'freebie':
                couponDoc.freebieItems = couponData.freebieItems || [];
                // Add reward item structure for compatibility
                couponDoc.rewardItems = couponDoc.freebieItems.map(item => ({
                    name: item.name || '',
                    price: 0, // Free
                    quantity: item.quantity || 1,
                    type: 'free'
                }));
                break;

            case 'special_price':
                couponDoc.specialItems = couponData.specialItems || [];
                // Add reward item structure for compatibility
                couponDoc.rewardItems = couponDoc.specialItems.map(item => ({
                    name: item.name || '',
                    price: item.price || 0,
                    quantity: 1,
                    type: 'special'
                }));
                break;

            case 'combo_upgrade':
                couponDoc.comboItems = couponData.comboItems || [];
                // Add reward item structure for compatibility
                couponDoc.rewardItems = couponDoc.comboItems.map(item => ({
                    name: item.description || '',
                    price: item.price || 0,
                    quantity: 1,
                    type: 'upgrade'
                }));
                break;

            default:
                // Backward compatibility
                couponDoc.discountAmount = couponData.discountAmount || 0;
                break;
        }

        await setDoc(couponRef, couponDoc);
        return { success: true };
    } catch (error) {
        console.error('Error creating coupon:', error);
        throw error;
    }
};

/**
 * Deletes a coupon by code (admin use)
 * @param {string} code 
 */
export const updateCoupon = async (couponData) => {
    try {
        const code = couponData.code.trim().toUpperCase();
        const couponRef = doc(db, 'coupons', code);

        const updateData = {
            type: couponData.type,
            description: couponData.description,
            minOrderValue: couponData.minOrderValue || 0,
            maxUses: couponData.maxUses || 0,
            expiresAt: couponData.expiresAt || null,
            active: couponData.active !== false,
            autoApply: couponData.autoApply || false,
            stackable: couponData.stackable || false,
            updatedAt: serverTimestamp()
        };

        // Type-specific fields
        switch (couponData.type) {
            case 'percentage':
                updateData.discountPercent = couponData.discountPercent || 0;
                updateData.maxDiscount = couponData.maxDiscount || 0;
                updateData.minGuaranteedDiscount = deleteField();
                updateData.discountAmount = deleteField();
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.freebieItems = deleteField();
                updateData.specialItems = deleteField();
                updateData.comboItems = deleteField();
                break;

            case 'flat':
                updateData.discountAmount = couponData.discountAmount || 0;
                updateData.discountPercent = deleteField();
                updateData.maxDiscount = deleteField();
                updateData.minGuaranteedDiscount = deleteField();
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.freebieItems = deleteField();
                updateData.specialItems = deleteField();
                updateData.comboItems = deleteField();
                break;

            case 'flat_percent':
                updateData.discountPercent = couponData.discountPercent || 0;
                updateData.discountAmount = deleteField();
                updateData.maxDiscount = deleteField();
                updateData.minGuaranteedDiscount = deleteField();
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.freebieItems = deleteField();
                updateData.specialItems = deleteField();
                updateData.comboItems = deleteField();
                break;

            case 'freebie':
                updateData.freebieItems = couponData.freebieItems || [];
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.discountPercent = deleteField();
                updateData.maxDiscount = deleteField();
                updateData.minGuaranteedDiscount = deleteField();
                updateData.discountAmount = deleteField();
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.specialItems = deleteField();
                updateData.comboItems = deleteField();
                break;

            case 'special_price':
                updateData.specialItems = couponData.specialItems || [];
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.discountPercent = deleteField();
                updateData.maxDiscount = deleteField();
                updateData.minGuaranteedDiscount = deleteField();
                updateData.discountAmount = deleteField();
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.freebieItems = deleteField();
                updateData.comboItems = deleteField();
                break;

            case 'combo_upgrade':
                updateData.comboItems = couponData.comboItems || [];
                updateData.upgradeDescription = deleteField();
                updateData.upgradePrice = deleteField();
                updateData.discountPercent = deleteField();
                updateData.maxDiscount = deleteField();
                updateData.minGuaranteedDiscount = deleteField();
                updateData.discountAmount = deleteField();
                updateData.freeItemName = deleteField();
                updateData.freeItemQuantity = deleteField();
                updateData.productName = deleteField();
                updateData.offerPrice = deleteField();
                updateData.freebieItems = deleteField();
                updateData.specialItems = deleteField();
                break;
        }

        await updateDoc(couponRef, updateData);
        return { success: true };
    } catch (error) {
        console.error('Error updating coupon:', error);
        throw error;
    }
};

export const deleteCoupon = async (code) => {
    try {
        await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
        return { success: true };
    } catch (error) {
        console.error('Error deleting coupon:', error);
        throw error;
    }
};

// ===== ANALYTICS FUNCTIONS =====

/**
 * Records a coupon usage event for analytics
 * @param {string} couponCode - The coupon code used
 * @param {string} userId - User ID who used the coupon
 * @param {number} discountAmount - Amount discounted
 * @param {number} orderTotal - Original order total before discount
 * @param {string} orderId - Order ID for tracking
 */
export const recordCouponUsage = async (couponCode, userId, discountAmount, orderTotal, orderId) => {
    try {
        const analyticsRef = collection(db, 'coupon-analytics');
        await addDoc(analyticsRef, {
            couponCode: couponCode.toUpperCase(),
            userId: userId || 'anonymous',
            discountAmount,
            orderTotal,
            orderValue: orderTotal - discountAmount,
            orderId,
            timestamp: serverTimestamp(),
            type: 'usage'
        });
    } catch (error) {
        console.error('Error recording coupon usage:', error);
        // Don't throw - analytics failure shouldn't break checkout
    }
};

/**
 * Records a failed coupon attempt for fraud detection
 * @param {string} couponCode - The attempted coupon code
 * @param {string} userId - User ID who attempted
 * @param {string} reason - Reason for failure
 * @param {string} ipAddress - IP address (if available)
 */
export const recordCouponAttempt = async (couponCode, userId, reason, ipAddress = null) => {
    try {
        const analyticsRef = collection(db, 'coupon-analytics');
        await addDoc(analyticsRef, {
            couponCode: couponCode.toUpperCase(),
            userId: userId || 'anonymous',
            reason,
            ipAddress,
            timestamp: serverTimestamp(),
            type: 'attempt'
        });
    } catch (error) {
        console.error('Error recording coupon attempt:', error);
    }
};

/**
 * Gets comprehensive coupon analytics data
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Analytics data
 */
export const getCouponAnalytics = async (days = 30) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const analyticsRef = collection(db, 'coupon-analytics');
        const q = query(
            analyticsRef,
            where('timestamp', '>=', startDate),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Process analytics data
        const analytics = {
            summary: {
                totalUsage: 0,
                totalAttempts: 0,
                totalRevenueSaved: 0,
                totalOrderValue: 0,
                uniqueUsers: new Set(),
                period: `${days} days`
            },
            coupons: {},
            timeline: {},
            fraudIndicators: []
        };

        events.forEach(event => {
            const couponCode = event.couponCode;
            const dateKey = event.timestamp.toDate().toISOString().split('T')[0];

            // Initialize coupon data if not exists
            if (!analytics.coupons[couponCode]) {
                analytics.coupons[couponCode] = {
                    usageCount: 0,
                    attemptCount: 0,
                    revenueSaved: 0,
                    orderValue: 0,
                    uniqueUsers: new Set(),
                    lastUsed: null
                };
            }

            // Track unique users
            analytics.summary.uniqueUsers.add(event.userId);

            if (event.type === 'usage') {
                analytics.summary.totalUsage++;
                analytics.summary.totalRevenueSaved += event.discountAmount;
                analytics.summary.totalOrderValue += event.orderValue;

                analytics.coupons[couponCode].usageCount++;
                analytics.coupons[couponCode].revenueSaved += event.discountAmount;
                analytics.coupons[couponCode].orderValue += event.orderValue;
                analytics.coupons[couponCode].uniqueUsers.add(event.userId);
                analytics.coupons[couponCode].lastUsed = event.timestamp;

            } else if (event.type === 'attempt') {
                analytics.summary.totalAttempts++;
                analytics.coupons[couponCode].attemptCount++;

                // Detect potential fraud patterns
                if (analytics.coupons[couponCode].attemptCount > 10) {
                    analytics.fraudIndicators.push({
                        couponCode,
                        attempts: analytics.coupons[couponCode].attemptCount,
                        risk: 'high'
                    });
                }
            }

            // Timeline data
            if (!analytics.timeline[dateKey]) {
                analytics.timeline[dateKey] = { usage: 0, attempts: 0, revenue: 0 };
            }
            if (event.type === 'usage') {
                analytics.timeline[dateKey].usage++;
                analytics.timeline[dateKey].revenue += event.discountAmount;
            } else {
                analytics.timeline[dateKey].attempts++;
            }
        });

        // Convert Sets to counts
        analytics.summary.uniqueUsers = analytics.summary.uniqueUsers.size;
        Object.keys(analytics.coupons).forEach(code => {
            analytics.coupons[code].uniqueUsers = analytics.coupons[code].uniqueUsers.size;
        });

        // Calculate derived metrics
        analytics.summary.averageDiscount = analytics.summary.totalUsage > 0
            ? analytics.summary.totalRevenueSaved / analytics.summary.totalUsage
            : 0;

        analytics.summary.conversionRate = analytics.summary.totalAttempts > 0
            ? (analytics.summary.totalUsage / (analytics.summary.totalUsage + analytics.summary.totalAttempts)) * 100
            : 0;

        return analytics;

    } catch (error) {
        console.error('Error fetching coupon analytics:', error);
        return {
            summary: { totalUsage: 0, totalAttempts: 0, totalRevenueSaved: 0, totalOrderValue: 0, uniqueUsers: 0 },
            coupons: {},
            timeline: {},
            fraudIndicators: []
        };
    }
};

/**
 * Gets top performing coupons by various metrics
 * @param {number} days - Number of days to analyze
 * @param {string} metric - 'usage', 'revenue', 'efficiency'
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Top coupons
 */
export const getTopCoupons = async (days = 30, metric = 'usage', limit = 10) => {
    try {
        const analytics = await getCouponAnalytics(days);
        const coupons = Object.entries(analytics.coupons);

        let sortedCoupons;
        switch (metric) {
            case 'usage':
                sortedCoupons = coupons.sort((a, b) => b[1].usageCount - a[1].usageCount);
                break;
            case 'revenue':
                sortedCoupons = coupons.sort((a, b) => b[1].revenueSaved - a[1].revenueSaved);
                break;
            case 'efficiency':
                sortedCoupons = coupons
                    .filter(([_, data]) => data.usageCount > 0)
                    .sort((a, b) => (b[1].revenueSaved / b[1].usageCount) - (a[1].revenueSaved / a[1].usageCount));
                break;
            default:
                sortedCoupons = coupons.sort((a, b) => b[1].usageCount - a[1].usageCount);
        }

        return sortedCoupons.slice(0, limit).map(([code, data]) => ({
            code,
            ...data,
            efficiency: data.usageCount > 0 ? data.revenueSaved / data.usageCount : 0
        }));

    } catch (error) {
        console.error('Error getting top coupons:', error);
        return [];
    }
};

/**
 * Gets coupon performance over time
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Timeline data
 */
export const getCouponTimeline = async (days = 30) => {
    try {
        const analytics = await getCouponAnalytics(days);
        return analytics.timeline;
    } catch (error) {
        console.error('Error getting coupon timeline:', error);
        return {};
    }
};
