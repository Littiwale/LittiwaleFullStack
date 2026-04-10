import { doc, getDoc, collection, addDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Validates a coupon code against Firestore.
 * Returns { valid, discount, message } 
 * @param {string} code - The coupon code entered by user (case-insensitive)
 * @param {number} cartTotal - Current cart total in ₹
 */
export const validateCoupon = async (code, cartTotal) => {
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

        // Check minimum order value
        if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
            return {
                valid: false,
                message: `Minimum order of ₹${coupon.minOrderValue} required for this coupon.`
            };
        }

        return {
            valid: true,
            discount: coupon.discountAmount || 0,
            message: `₹${coupon.discountAmount} off applied! 🎉`
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
 * Creates a new coupon (admin use).
 * The coupon code is used as the document ID (uppercased).
 * @param {Object} couponData - { code, discountAmount, expiresAt (Date), minOrderValue, active }
 */
export const createCoupon = async (couponData) => {
    try {
        const code = couponData.code.trim().toUpperCase();
        const couponRef = doc(db, 'coupons', code);
        await import('firebase/firestore').then(({ setDoc }) =>
            setDoc(couponRef, {
                ...couponData,
                code,
                active: true,
                createdAt: serverTimestamp()
            })
        );
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
export const deleteCoupon = async (code) => {
    try {
        await deleteDoc(doc(db, 'coupons', code.toUpperCase()));
        return { success: true };
    } catch (error) {
        console.error('Error deleting coupon:', error);
        throw error;
    }
};
