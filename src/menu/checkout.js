import { getCart, getCartTotal, clearCart } from '../store/cart';
import { validateOrder, createOrderEntry, updateOrderDetails } from '../api/orders';
import { validateCoupon, fetchActiveCoupons, recordCouponUsage, recordCouponAttempt } from '../api/coupons';
import { auth, db } from '../firebase/config';
import { ORDER_STATUS } from '../constants/orderStatus';
import { collection, getDocs, addDoc, doc, query, orderBy, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';

// Simple debounce utility
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Coupon state
let appliedDiscount = 0;
let appliedCouponCode = '';
let appliedCouponType = '';
let appliedCouponDetails = {};
let appliedCouponData = null;

// DOM elements (populated in initCheckout)
let checkoutItemsList = null;
let checkoutAmount = null;
let errorDisplay = null;
let checkoutForm = null;

// Handle special coupon types (freebie, special price, combo upgrade)


// Remove coupon reward (removes the entire coupon)
window.removeCouponReward = (rewardName) => {
    if (confirm(`Remove coupon reward "${rewardName}"? This will remove the entire coupon.`)) {
        // Remove the coupon
        appliedDiscount = 0;
        appliedCouponCode = '';
        appliedCouponType = '';
        appliedCouponDetails = {};
        appliedCouponData = null;

        window.appliedDiscount = 0;
        window.appliedCouponCode = '';
        window.appliedCouponType = '';
        window.appliedCouponDetails = {};

        updateCheckoutTotal();

        // Clear UI
        const couponInput = document.querySelector('#coupon-input');
        const couponMsg = document.querySelector('#coupon-message');
        if (couponInput) couponInput.value = '';
        if (couponMsg) {
            couponMsg.textContent = 'Coupon removed.';
            couponMsg.style.color = '#6B7280';
        }

        clearSpecialCouponUI();

        // Dispatch cartUpdated to sync drawer discount row
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
};

// Revalidate applied coupon when cart changes
const revalidateAppliedCoupon = async () => {
    if (!appliedCouponCode) return;

    try {
        const cartTotal = getCartTotal();
        const cartItems = getCart();
        const result = await validateCoupon(appliedCouponCode, cartTotal, cartItems);

        if (!result.valid) {
            // Coupon no longer valid - remove it
            appliedDiscount = 0;
            appliedCouponCode = '';
            appliedCouponType = '';
            appliedCouponDetails = {};
            appliedCouponData = null;

            window.appliedDiscount = 0;
            window.appliedCouponCode = '';
            window.appliedCouponType = '';
            window.appliedCouponDetails = {};

            updateCheckoutTotal();

            // Clear coupon input and show message
            const couponInput = document.querySelector('#coupon-input');
            const couponMsg = document.querySelector('#coupon-message');
            if (couponInput) couponInput.value = '';
            if (couponMsg) {
                couponMsg.textContent = `Coupon "${appliedCouponCode}" removed - ${result.message}`;
                couponMsg.style.color = '#F59E0B';
            }

            // Clear any special coupon UI
            clearSpecialCouponUI();

            // Dispatch cartUpdated to sync drawer discount row
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        }
    } catch (error) {
        console.error('Error revalidating coupon:', error);
    }
};

let DELIVERY_FEE = 30; // default, overridden by Firestore on init

const loadDeliveryFee = async () => {
    try {
        const snap = await getDoc(doc(db, 'settings', 'store'));
        if (snap.exists() && snap.data().deliveryFee !== undefined) {
            DELIVERY_FEE = snap.data().deliveryFee;
        }
    } catch (e) {
        // keep default 30
    }
};

export const initCheckout = () => {
    loadDeliveryFee(); // load from Firestore, falls back to 30
    // Query DOM elements only when initializing (after DOM is ready)
    checkoutItemsList = document.querySelector('#checkout-items-list');
    checkoutAmount = document.querySelector('#checkout-amount');
    const checkoutModal = document.querySelector('#checkout-modal');
    checkoutForm = document.querySelector('#checkout-form');
    const closeCheckout = document.querySelector('#close-checkout');
    const cartModal = document.querySelector('#cart-modal');
    errorDisplay = document.querySelector('#checkout-error');
    
    if (!checkoutModal || !checkoutForm) return;
    if (!checkoutModal || !closeCheckout) return;

    // Listen to custom event from cart-ui
    window.addEventListener('openCheckout', () => {
        const cart = getCart();
        if (cart.length === 0) return;

        // Reset coupon state
        appliedDiscount = 0;
        appliedCouponCode = '';
        window.appliedDiscount = 0;
        window.appliedCouponCode = '';
        
        const couponInput = document.querySelector('#coupon-input');
        const couponMsg = document.querySelector('#coupon-message');
        if (couponInput) couponInput.value = '';
        if (couponMsg) { couponMsg.textContent = ''; couponMsg.style.color = ''; }

        if (cartModal) {
            cartModal.classList.add('hidden');
            cartModal.style.display = 'none';
        }
        checkoutModal.style.display = 'flex';

        populateCheckoutItems(cart);
        updateCheckoutTotal();
        loadSavedAddresses();
        loadActiveCoupons();
        suggestBestCoupon();

        // Wire promo-toggle-btn every time checkout opens — works regardless of coupon count
        // 600ms delay so loadActiveCoupons has time to inject coupon-toggle-btn if coupons exist
        setTimeout(() => {
            const promoBtn = document.getElementById('promo-toggle-btn');
            if (!promoBtn) return;
            const freshBtn = promoBtn.cloneNode(true);
            promoBtn.parentNode.replaceChild(freshBtn, promoBtn);
            freshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const innerToggle = document.getElementById('coupon-toggle-btn');
                const noMsg = document.getElementById('no-coupon-msg');
                if (innerToggle) {
                    // Coupons exist — expand/collapse coupon list
                    if (noMsg) noMsg.style.display = 'none';
                    innerToggle.click();
                } else {
                    // No coupons — toggle the friendly message
                    if (noMsg) {
                        noMsg.style.display = noMsg.style.display === 'block' ? 'none' : 'block';
                    }
                }
            });
        }, 600);
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) checkoutModal.style.display = 'none';
    });

    // Coupon Apply
    const applyBtn = document.querySelector('#apply-coupon-btn');
    const couponInput = document.querySelector('#coupon-input');
    const couponMsg = document.querySelector('#coupon-message');

    if (applyBtn && couponInput && couponMsg) {
        applyBtn.addEventListener('click', async () => {
            const code = couponInput.value.trim();
            if (!code) return;

            applyBtn.textContent = '...';
            applyBtn.disabled = true;

            const rawTotal = getCartTotal();
            const cartItems = getCart(); // Get full cart items for advanced coupon logic

            // Check for coupon stacking restrictions
            if (appliedCouponCode && appliedCouponData && !appliedCouponData.stackable) {
                couponMsg.textContent = 'Only one coupon can be applied at a time. Remove current coupon first.';
                couponMsg.style.color = '#ef4444';
                applyBtn.textContent = 'Apply';
                applyBtn.disabled = false;
                return;
            }

            const result = await validateCoupon(code, rawTotal, cartItems);

            applyBtn.textContent = 'Apply';
            applyBtn.disabled = false;

            if (result.valid) {
                // Store coupon details for different types
                appliedDiscount = result.discount;
                appliedCouponCode = code.toUpperCase();
                appliedCouponType = result.type;
                appliedCouponDetails = result.details;
                appliedCouponData = result.couponData;

                window.appliedDiscount = appliedDiscount;
                window.appliedCouponCode = appliedCouponCode;
                window.appliedCouponType = appliedCouponType;
                window.appliedCouponDetails = appliedCouponDetails;

                updateCheckoutTotal();
                couponMsg.textContent = result.message;
                couponMsg.style.color = '#10B981';

                // Handle special coupon types
                handleSpecialCouponTypes(result);
            } else {
                couponMsg.textContent = result.message;
                couponMsg.style.color = '#ef4444';
            }

            // Dispatch cartUpdated to sync drawer discount row if user goes back
            window.dispatchEvent(new CustomEvent('cartUpdated'));
        });
    }

    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Add cart change listener for coupon revalidation (debounced to prevent excessive Firestore reads)
    const debouncedCouponUpdate = debounce(() => {
        revalidateAppliedCoupon();
        loadActiveCoupons();
        suggestBestCoupon();
    }, 500); // 500ms debounce

    window.addEventListener('cartUpdated', debouncedCouponUpdate);
};

const populateCheckoutItems = (cart) => {
    if (!checkoutItemsList) return;
    checkoutItemsList.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center text-sm py-1 border-b border-white/20 last:border-0 text-white/90">
            <div class="flex-1 min-w-0 pr-4">
                <p class="truncate"><span class="text-white font-bold">${item.quantity}x</span> ${item.name}</p>
                <p class="text-[10px] uppercase tracking-widest text-[#C47F17]">${item.variant}</p>
            </div>
            <div class="font-bold whitespace-nowrap text-white">₹${item.price * item.quantity}</div>
        </div>
    `).join('');
};

const updateCheckoutTotal = () => {
    const rawTotal = getCartTotal();
    const itemSubtotal = Math.max(0, rawTotal - appliedDiscount);
    if (checkoutAmount) {
        let savingsText = '';
        let couponDisplay = appliedCouponCode;

        if (appliedCouponType === 'freebie') {
            const items = appliedCouponDetails.freebieItems || [];
            savingsText = `Free ${items.map(i => i.name).join(', ')}`;
            couponDisplay = appliedCouponCode;
        } else if (appliedCouponType === 'special_price') {
            const items = appliedCouponDetails.specialItems || [];
            savingsText = `${items.length} items @ Special Price`;
            couponDisplay = appliedCouponCode;
        } else if (appliedCouponType === 'combo_upgrade') {
            const items = appliedCouponDetails.comboItems || [];
            savingsText = items.map(i => i.description).join(', ');
            couponDisplay = appliedCouponCode;
        } else if (appliedDiscount > 0) {
            savingsText = `You save ₹${appliedDiscount}`;
        }

        checkoutAmount.innerHTML = `
            <div class="flex flex-col items-end gap-2">
                ${appliedCouponCode ? `
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.1); padding: 8px 12px; border-radius: 8px; width: 100%;">
                        <span style="font-size: 14px;">🎉</span>
                        <div style="flex: 1;">
                            <div style="font-size: 12px; color: #10B981; font-weight: 700;">${savingsText}</div>
                            <div style="font-size: 10px; color: #10B981; opacity: 0.9;">with coupon ${couponDisplay}</div>
                        </div>
                    </div>
                    ${appliedDiscount > 0 ? `<div style="font-size: 11px; color: #ef4444; text-decoration: line-through; opacity: 0.8;">₹${rawTotal}</div>` : ''}
                ` : ''}
                <div style="display:flex;justify-content:space-between;width:100%;font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:4px;">
                    <span>Subtotal</span><span>₹${itemSubtotal}</span>
                </div>
                <div style="display:flex;justify-content:space-between;width:100%;font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:8px;">
                    <span>Delivery fee</span><span>₹${DELIVERY_FEE}</span>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:8px;display:flex;justify-content:space-between;width:100%;font-size:20px;font-weight:900;color:#C47F17;">
                    <span>Grand Total</span><span>₹${itemSubtotal + DELIVERY_FEE}</span>
                </div>
            </div>
        `;
    }
};

const handleSpecialCouponTypes = (result) => {
    const couponBenefits = document.querySelector('#coupon-benefits');
    if (!couponBenefits) return;

    let benefitsHTML = '';

    switch (result.type) {
        case 'freebie':
            const fItems = result.details.freebieItems || [];
            if (fItems.length > 0) {
                benefitsHTML = `
                    <div style="background: rgba(196, 127, 23, 0.1); border: 1px solid #C47F17; border-radius: 8px; padding: 12px; margin-top: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🎁</span>
                            <div>
                                <div style="font-size: 14px; font-weight: 700; color: #C47F17;">Free Items Unlocked!</div>
                                <div style="font-size: 12px; color: #C47F17; opacity: 0.9;">${fItems.map(i => `${i.name} (x${i.quantity})`).join(', ')}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            break;

        case 'special_price':
            const sItems = result.details.specialItems || [];
            if (sItems.length > 0) {
                benefitsHTML = `
                    <div style="background: rgba(196, 127, 23, 0.1); border: 1px solid #C47F17; border-radius: 8px; padding: 12px; margin-top: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">🎯</span>
                            <div>
                                <div style="font-size: 14px; font-weight: 700; color: #C47F17;">Special Price Unlocked!</div>
                                <div style="font-size: 12px; color: #C47F17; opacity: 0.9;">${sItems.map(i => `${i.name} @ ₹${i.price}`).join('<br>')}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            break;

        case 'combo_upgrade':
            const cItems = result.details.comboItems || [];
            if (cItems.length > 0) {
                benefitsHTML = `
                    <div style="background: rgba(196, 127, 23, 0.1); border: 1px solid #C47F17; border-radius: 8px; padding: 12px; margin-top: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 16px;">⬆️</span>
                            <div>
                                <div style="font-size: 14px; font-weight: 700; color: #C47F17;">Combo Upgrade Available!</div>
                                <div style="font-size: 12px; color: #C47F17; opacity: 0.9;">${cItems.map(i => `${i.description} for ₹${i.price}`).join('<br>')}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            break;
    }

    couponBenefits.innerHTML = benefitsHTML;
};

const clearSpecialCouponUI = () => {
    const couponBenefits = document.querySelector('#coupon-benefits');
    if (couponBenefits) {
        couponBenefits.innerHTML = '';
    }
};

const suggestBestCoupon = async () => {
    const suggestionEl = document.querySelector('#coupon-suggestion');
    if (!suggestionEl) return;

    const cartTotal = getCartTotal();
    const cartItems = getCart();

    // Hide suggestions if coupon already applied
    if (appliedCouponCode) {
        suggestionEl.innerHTML = `
            <div style="margin-top: 16px; padding: 12px 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #10B981; font-weight: 700;">✓ Coupon Applied: <strong>${appliedCouponCode}</strong></p>
                <p style="margin: 4px 0 0; font-size: 11px; color: #10B981; opacity: 0.8;">Clear to view other coupons</p>
            </div>
        `;
        suggestionEl.style.display = 'block';
        return;
    }

    if (cartTotal < 100) return; // Don't suggest coupons for small orders

    try {
        const activeCoupons = await fetchActiveCoupons(cartTotal);
        if (activeCoupons.length === 0) return;

        // Calculate potential savings for each coupon with detailed analysis
        const couponAnalysis = await Promise.all(
            activeCoupons.map(async (coupon) => {
                const result = await validateCoupon(coupon.id, cartTotal, cartItems);
                return {
                    coupon,
                    valid: result.valid,
                    savings: result.discount,
                    type: result.type,
                    message: result.message,
                    details: result.details,
                    // Calculate eligibility score based on cart composition
                    eligibilityScore: calculateEligibilityScore(coupon, cartItems, cartTotal),
                    // Calculate recommendation priority
                    priority: calculateRecommendationPriority(coupon, result, cartItems)
                };
            })
        );

        // Filter and sort coupons by priority and savings
        const eligibleCoupons = couponAnalysis
            .filter(c => c.valid && c.savings > 0)
            .sort((a, b) => {
                // Primary sort: priority score
                if (a.priority !== b.priority) return b.priority - a.priority;
                // Secondary sort: savings amount
                return b.savings - a.savings;
            });

        if (eligibleCoupons.length === 0) return;

        // Show enhanced suggestion UI with top 3 coupons
        const topCoupons = eligibleCoupons.slice(0, 3);
        showEnhancedCouponSuggestions(topCoupons, cartTotal);

    } catch (error) {
        console.error('Error suggesting best coupon:', error);
    }
};

// Calculate eligibility score based on cart composition and coupon type
const calculateEligibilityScore = (coupon, cartItems, cartTotal) => {
    let score = 0;

    switch (coupon.type) {
        case 'percentage':
            // Higher score for percentage coupons on larger orders
            score = Math.min(cartTotal / 500, 1) * 100;
            break;
        case 'flat':
            // Flat discounts are good for any order
            score = 80;
            break;
        case 'flat_percent':
            score = Math.min(cartTotal / 500, 1) * 100;
            break;
        case 'freebie':
            // Freebie coupons depend on specific items
            const requiredFreebieItems = coupon.freebieItems || (coupon.freeItemName ? [{ name: coupon.freeItemName }] : []);
            const hasRequiredItem = cartItems.some(cartItem =>
                requiredFreebieItems.some(i => cartItem.name.toLowerCase().includes(i.name.toLowerCase()))
            );
            score = hasRequiredItem ? 95 : 30;
            break;
        case 'special_price':
            // Special price depends on specific products
            const requiredSpecialItems = coupon.specialItems || (coupon.productName ? [{ name: coupon.productName }] : []);
            const hasSpecialProduct = cartItems.some(cartItem =>
                requiredSpecialItems.some(i => cartItem.name.toLowerCase().includes(i.name.toLowerCase()))
            );
            score = hasSpecialProduct ? 100 : 20;
            break;
        case 'combo_upgrade':
            // Combo upgrades depend on cart composition
            score = cartItems.length >= 2 ? 90 : 40;
            break;
    }

    return score;
};

// Calculate recommendation priority based on multiple factors
const calculateRecommendationPriority = (coupon, validationResult, cartItems) => {
    let priority = 0;

    // Base priority from savings amount
    priority += Math.min(validationResult.discount / 50, 5) * 20;

    // Bonus for coupon type relevance
    switch (coupon.type) {
        case 'percentage':
            priority += validationResult.discount > 100 ? 30 : 10;
            break;
        case 'freebie':
            priority += 25; // Free items are highly attractive
            break;
        case 'special_price':
            priority += 20; // Special pricing is valuable
            break;
        case 'combo_upgrade':
            priority += cartItems.length >= 3 ? 35 : 15;
            break;
        case 'flat':
            priority += 15;
            break;
    }

    // Popularity bonus (coupons with higher usage are more trustworthy)
    priority += Math.min((coupon.usedCount || 0) / 10, 10);

    // New coupon bonus
    const isNew = coupon.createdAt && (new Date() - coupon.createdAt.toDate()) < 7 * 24 * 60 * 60 * 1000;
    if (isNew) priority += 15;

    return priority;
};

// Enhanced coupon suggestions UI with comparison and better UX
const showEnhancedCouponSuggestions = (topCoupons, cartTotal) => {
    const suggestionEl = document.querySelector('#coupon-suggestion');
    if (!suggestionEl) return;

    // Don't show if a coupon is already applied
    if (appliedCouponCode) return;

    const couponCards = topCoupons.map((couponData, index) => {
        const { coupon, savings, type, details } = couponData;
        const isTopPick = index === 0;

        let benefitText = '';
        let icon = '';
        let bgColor = '';

        switch (type) {
            case 'percentage':
                benefitText = `Up to ${coupon.discountPercent}% OFF`;
                icon = '💰';
                bgColor = 'rgba(16, 185, 129, 0.1)';
                break;
            case 'flat_percent':
                benefitText = `${coupon.discountPercent}% OFF`;
                icon = '💰';
                bgColor = 'rgba(16, 185, 129, 0.1)';
                break;
            case 'flat':
                benefitText = `₹${coupon.discountAmount} OFF`;
                icon = '💵';
                bgColor = 'rgba(59, 130, 246, 0.1)';
                break;
            case 'freebie':
                const fItems = details.freebieItems || [];
                benefitText = `Free ${fItems.map(i => i.name).join(', ')}`;
                icon = '🎁';
                bgColor = 'rgba(245, 158, 11, 0.1)';
                break;
            case 'special_price':
                const sItems = details.specialItems || [];
                benefitText = `${sItems.length} items @ Special Price`;
                icon = '🎯';
                bgColor = 'rgba(139, 92, 246, 0.1)';
                break;
            case 'combo_upgrade':
                const cItems = details.comboItems || [];
                benefitText = `${cItems.length} upgrades available`;
                icon = '⬆️';
                bgColor = 'rgba(236, 72, 153, 0.1)';
                break;
        }

        return `
            <div style="background: ${bgColor}; border: 2px solid ${isTopPick ? '#C47F17' : 'rgba(196, 127, 23, 0.3)'}; border-radius: 12px; padding: 12px; margin-bottom: 8px; position: relative; transition: all 0.3s ease; cursor: pointer;"
                 onclick="document.querySelector('#coupon-input').value = '${coupon.id}'; document.querySelector('#apply-coupon-btn').click();"
                 onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(196, 127, 23, 0.2)';"
                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                ${isTopPick ? '<div style="position: absolute; top: -8px; left: 12px; background: #C47F17; color: black; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 10px; text-transform: uppercase;">⭐ Top Pick</div>' : ''}
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: 800; color: #C47F17; margin-bottom: 2px;">${coupon.id}</div>
                        <div style="font-size: 12px; color: #C47F17; opacity: 0.9; margin-bottom: 2px;">${benefitText}</div>
                        <div style="font-size: 11px; color: #10B981; font-weight: 700;">Save ₹${savings}</div>
                    </div>
                    <button style="background: #C47F17; color: black; border: none; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.2s ease;"
                            onmouseover="this.style.background='#a66f12';"
                            onmouseout="this.style.background='#C47F17';">
                        APPLY
                    </button>
                </div>
            </div>
        `;
    }).join('');

    suggestionEl.innerHTML = `
        <div style="margin-top: 16px; padding: 16px; background: rgba(196, 127, 23, 0.05); border: 1px solid rgba(196, 127, 23, 0.2); border-radius: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 16px;">🎉</span>
                <div>
                    <div style="font-size: 14px; font-weight: 800; color: #C47F17;">Smart Coupon Recommendations</div>
                    <div style="font-size: 11px; color: #C47F17; opacity: 0.8;">Best deals for your ₹${cartTotal} order</div>
                </div>
            </div>
            <div style="display: flex; flex-col; gap: 8px;">
                ${couponCards}
            </div>
            <div style="text-align: center; margin-top: 12px;">
                <button onclick="this.parentElement.parentElement.parentElement.style.display='none';"
                    style="background: none; border: none; color: #C47F17; font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">
                    Hide suggestions
                </button>
            </div>
        </div>
    `;
    suggestionEl.style.display = 'block';
};

const getEligibilityReason = (coupon, result, cartItems, cartTotal) => {
    if (result.valid && result.discount > 0) {
        return `✓ Eligible — saves ₹${result.discount}`;
    }
    const minOrder = coupon.minOrderValue || 0;
    if (minOrder > cartTotal) {
        return `Add ₹${minOrder - cartTotal} more to unlock`;
    }
    if (coupon.expiresAt) {
        const exp = coupon.expiresAt.toDate
            ? coupon.expiresAt.toDate()
            : new Date(coupon.expiresAt);
        if (new Date() > exp) return 'This coupon has expired';
    }
    if (coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) {
        return 'Usage limit reached';
    }
    return result.message || 'Not eligible for current cart';
};

const loadActiveCoupons = async () => {
    const container = document.querySelector('#active-coupons-list');
    if (!container) return;

    try {
        // Get current cart total for filtering eligible coupons
        const cartTotal = getCartTotal();
        const cartItems = getCart();
        const activeCoupons = await fetchActiveCoupons(cartTotal);

        if (activeCoupons.length === 0) {
            container.style.display = 'none';
            // no-coupon-msg is shown by promo-toggle-btn click, not auto-shown
            return;
        }
        // Hide no-coupon message when coupons exist
        const noMsgEl = document.querySelector('#no-coupon-msg');
        if (noMsgEl) noMsgEl.style.display = 'none';

        container.style.display = 'block';

        // Analyze each coupon for eligibility and benefits
        const couponAnalysis = await Promise.all(
            activeCoupons.map(async (coupon) => {
                const result = await validateCoupon(coupon.id, cartTotal, cartItems);
                return {
                    coupon,
                    valid: result.valid,
                    savings: result.discount,
                    type: result.type,
                    message: result.message,
                    details: result.details,
                    eligibilityReason: getEligibilityReason(coupon, result, cartItems, cartTotal)
                };
            })
        );

        // Separate eligible and ineligible coupons
        const eligibleCoupons = couponAnalysis.filter(c => c.valid && c.savings > 0);
        const ineligibleCoupons = couponAnalysis.filter(c => !c.valid || c.savings === 0);

        // Generate enhanced coupon display
        let couponHTML = '';

        if (eligibleCoupons.length > 0) {
            couponHTML += `
                <div style="margin-bottom: 16px;">
                    <p style="font-size: 12px; font-weight: 800; color: #10B981; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🎯 Eligible Coupons (${eligibleCoupons.length})</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
                        ${eligibleCoupons.map(c => generateCouponCard(c, true)).join('')}
                    </div>
                </div>
            `;
        }

        if (ineligibleCoupons.length > 0) {
            // Show progress messaging for near-eligible coupons
            const progressCoupons = getProgressCoupons(ineligibleCoupons, cartTotal);
            if (progressCoupons.length > 0) {
                couponHTML += `
                    <div style="margin-bottom: 16px;">
                        <p style="font-size: 12px; font-weight: 800; color: #F59E0B; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">⏳ Almost There (${progressCoupons.length})</p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
                            ${progressCoupons.map(c => generateProgressCouponCard(c)).join('')}
                        </div>
                    </div>
                `;
            }

            couponHTML += `
                <div style="margin-bottom: 16px;">
                    <p style="font-size: 12px; font-weight: 800; color: #ef4444; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">🚫 Not Eligible (${ineligibleCoupons.length - progressCoupons.length})</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
                        ${ineligibleCoupons.filter(c => !progressCoupons.find(pc => pc.coupon.id === c.coupon.id)).map(c => generateCouponCard(c, false)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div style="margin-top: 16px;">
                <button type="button" id="coupon-toggle-btn" style="background: none; border: none; color: #C47F17; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline; padding: 0; margin: 0;">
                    🎟️ View all available coupons (${activeCoupons.length})
                </button>
                <div id="coupon-offers-section" style="margin-top: 16px; display: none;">
                    <div style="background: rgba(196, 127, 23, 0.05); border: 1px solid rgba(196, 127, 23, 0.2); border-radius: 12px; padding: 16px;">
                        ${couponHTML}
                        <div style="text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(196, 127, 23, 0.2);">
                            <p style="font-size: 11px; color: #C47F17; opacity: 0.8; margin-bottom: 8px;">💡 Pro tip: Add more items to unlock additional coupons!</p>
                            <button onclick="this.parentElement.parentElement.parentElement.style.display='none';"
                                style="background: none; border: none; color: #C47F17; font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">
                                Hide coupons
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update toggle functionality
        const section = document.getElementById('coupon-offers-section');
        const toggleBtn = document.getElementById('coupon-toggle-btn');
        if (toggleBtn && section) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isVisible = section.style.display === 'block';
                section.style.display = isVisible ? 'none' : 'block';
            });
        }

    } catch (err) {
        console.error('Error loading active coupons:', err);
        const container = document.querySelector('#active-coupons-list');
        if (container) container.style.display = 'none';
    }
};

// Get coupons that are close to being eligible (progress messaging)
const getProgressCoupons = (ineligibleCoupons, cartTotal) => {
    return ineligibleCoupons.filter(couponData => {
        const coupon = couponData.coupon;
        const minOrder = coupon.minOrderValue || 0;

        // Only show progress for coupons within ₹200 of eligibility
        if (minOrder - cartTotal <= 200 && minOrder > cartTotal) {
            return true;
        }

        return false;
    });
};

// Generate progress coupon card with messaging
const generateProgressCouponCard = (couponData) => {
    const { coupon, eligibilityReason } = couponData;
    const cartTotal = getCartTotal();
    const minOrder = coupon.minOrderValue || 0;
    const remaining = minOrder - cartTotal;

    let benefitText = '';
    let icon = '⏳';

    switch (coupon.type) {
        case 'percentage':
            benefitText = `Up to ${coupon.discountPercent}% OFF`;
            break;
        case 'flat':
            benefitText = `₹${coupon.discountAmount} OFF`;
            break;
        case 'freebie':
            benefitText = `Free ${coupon.freeItemName || 'Item'}`;
            break;
        case 'special_price':
            benefitText = `${coupon.productName || 'Item'} @ ₹${coupon.offerPrice || 0}`;
            break;
        case 'combo_upgrade':
            benefitText = coupon.upgradeDescription || 'Upgrade Available';
            break;
        default:
            benefitText = 'Discount Available';
            break;
    }

    return `
        <div style="background: rgba(245, 158, 11, 0.1); border: 2px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 12px; position: relative;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">${icon}</span>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 800; color: #F59E0B; margin-bottom: 2px;">${coupon.id}</div>
                    <div style="font-size: 12px; color: #F59E0B; opacity: 0.9; margin-bottom: 2px;">${benefitText}</div>
                    <div style="font-size: 11px; color: #F59E0B; font-weight: 700;">Add ₹${remaining} more to unlock</div>
                </div>
            </div>
            <div style="margin-top: 8px; background: rgba(245, 158, 11, 0.2); border-radius: 6px; height: 4px; overflow: hidden;">
                <div style="background: #F59E0B; height: 100%; width: ${Math.max(10, (cartTotal / minOrder) * 100)}%; border-radius: 6px;"></div>
            </div>
        </div>
    `;
};

// Generate enhanced coupon card with eligibility indicators
const generateCouponCard = (couponData, isEligible) => {
    const { coupon, savings, type, details, eligibilityReason } = couponData;

    let displayText = '';
    let subText = '';
    let icon = '';
    let bgColor = isEligible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    let borderColor = isEligible ? '#10B981' : '#ef4444';
    let buttonText = isEligible ? 'APPLY' : 'VIEW';
    let buttonBg = isEligible ? '#10B981' : '#6b7280';

    switch (type) {
        case 'percentage':
            displayText = coupon.id;
            subText = `Up to ${coupon.discountPercent}% OFF`;
            icon = '💰';
            break;
        case 'flat':
            displayText = coupon.id;
            subText = `₹${coupon.discountAmount} OFF`;
            icon = '💵';
            break;
        case 'freebie':
            displayText = coupon.id;
            subText = `Free ${coupon.freeItemName}`;
            icon = '🎁';
            break;
        case 'special_price':
            displayText = coupon.id;
            subText = `${coupon.productName} @ ₹${coupon.offerPrice}`;
            icon = '🎯';
            break;
        case 'combo_upgrade':
            displayText = coupon.id;
            subText = coupon.upgradeDescription || 'Combo Upgrade';
            icon = '⬆️';
            break;
        default:
            displayText = coupon.id;
            subText = `₹${coupon.discountAmount} OFF`;
            icon = '🎫';
            break;
    }

    const savingsText = isEligible && savings > 0 ? `<div style="font-size: 10px; color: #10B981; font-weight: 700; margin-top: 2px;">Save ₹${savings}</div>` : '';

    return `
        <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 12px; transition: all 0.3s ease; ${isEligible ? 'cursor: pointer;' : ''}"
             ${isEligible ? `onclick="document.querySelector('#coupon-input').value = '${coupon.id}'; document.querySelector('#apply-coupon-btn').click(); document.getElementById('coupon-offers-section').style.display='none';"` : ''}
             onmouseover="${isEligible ? 'this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 8px 25px rgba(16, 185, 129, 0.2)\';' : ''}"
             onmouseout="${isEligible ? 'this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'none\';' : ''}">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 16px;">${icon}</span>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 900; color: ${isEligible ? '#10B981' : '#ef4444'}; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayText}</div>
                    <div style="font-size: 10px; color: ${isEligible ? '#10B981' : '#ef4444'}; opacity: 0.9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${subText}</div>
                    ${savingsText}
                </div>
            </div>
            <div style="font-size: 9px; color: ${isEligible ? '#10B981' : '#ef4444'}; opacity: 0.8; margin-bottom: 8px; font-weight: 600;">${eligibilityReason}</div>
            <button style="width: 100%; background: ${buttonBg}; color: white; border: none; border-radius: 6px; padding: 6px; font-size: 10px; font-weight: 800; cursor: ${isEligible ? 'pointer' : 'not-allowed'}; transition: all 0.2s ease;"
                    ${isEligible ? `onmouseover="this.style.background='${buttonBg === '#10B981' ? '#059669' : '#4b5563'}';"`
                               : `onmouseover="this.style.background='${buttonBg}';"`}
                    onmouseout="this.style.background='${buttonBg}';">
                ${buttonText}
            </button>
        </div>
    `;
};

const loadSavedAddresses = async () => {
    const selectEl = document.querySelector('#saved-addresses-select');
    const saveCb = document.querySelector('#save-address-cb');
    if (!selectEl) return;
    
    if (!auth?.currentUser) {
        selectEl.classList.add('hidden');
        if (saveCb) saveCb.parentElement.classList.add('hidden');
        return;
    }

    if (saveCb) saveCb.parentElement.classList.remove('hidden');

    try {
        const q = query(collection(db, 'users', auth.currentUser.uid, 'addresses'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (snap.empty) {
            selectEl.classList.add('hidden');
            return;
        }

        selectEl.innerHTML = '<option value="">-- Saved Addresses --</option>';
        let idx = 1;
        snap.forEach(doc => {
            const val = doc.data().address;
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = `Address ${idx++}: ${val.substring(0, 25)}...`;
            selectEl.appendChild(opt);
        });
        
        selectEl.classList.remove('hidden');
        selectEl.classList.add('block');
        selectEl.onchange = (e) => {
            if (e.target.value) {
                document.querySelector('#cust-address').value = e.target.value;
            }
        };
    } catch (err) {
        console.error('Error fetching saved addresses:', err);
        selectEl.classList.add('hidden');
    }
};

const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    // Re-query button every time handler fires — modal elements may not exist at module load
    const placeOrderBtn = document.querySelector('#place-order-btn');
    if (!placeOrderBtn) return; // Safety guard

    placeOrderBtn.disabled = true;
    const originalBtnText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = 'PROCESSING... ⏳';
    hideError();

    try {
        const formData = new FormData(checkoutForm);
        const paymentMethod = formData.get('payment-method') || 'COD';
        
        const nameInput = document.querySelector('#cust-name').value.trim();
        const phoneInput = document.querySelector('#cust-phone').value;
        const addressInput = document.querySelector('#cust-address').value.trim();
        const pincodeInput = document.querySelector('#checkout-pincode')?.value.trim() || '';
        
        // Validate name
        if (!nameInput) {
            showError('Please enter your full name.');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
            return;
        }

        // Validate phone
        const sanitizedPhone = sanitizePhone(phoneInput);
        if (sanitizedPhone.length !== 10) {
            showError('Please enter a valid 10-digit phone number.');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
            return;
        }

        // Validate address
        if (!addressInput) {
            showError('Please enter your delivery address.');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
            return;
        }

        // Validate pincode if provided
        if (pincodeInput && (pincodeInput.length < 5 || pincodeInput.length > 6 || !/^[0-9]+$/.test(pincodeInput))) {
            showError('Please enter a valid pincode (5-6 digits).');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
            return;
        }
        
        const customerDetails = {
            name: nameInput,
            phone: sanitizedPhone,
            address: addressInput,
            pincode: pincodeInput,
            instructions: document.querySelector('#checkout-instructions')?.value.trim() || '',
            paymentMethod: paymentMethod
        };

        const cart = getCart();
        const rawTotal = getCartTotal();
        const finalTotal = Math.max(0, rawTotal - appliedDiscount) + DELIVERY_FEE;

        const validation = await validateOrder(cart);
        if (!validation.isValid) {
            showError(validation.error);
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
            return;
        }

        const orderData = {
            customer: customerDetails,
            items: cart,
            total: finalTotal, // Includes delivery fee now
            rawTotal: rawTotal,
            deliveryFee: DELIVERY_FEE,
            paymentMethod: paymentMethod,
            userId: auth?.currentUser?.uid || null,
            ...(appliedCouponCode ? {
                coupon: {
                    code: appliedCouponCode,
                    type: appliedCouponType,
                    discount: appliedDiscount,
                    details: appliedCouponDetails,
                    data: appliedCouponData
                }
            } : {})
        };

        const { success, orderId, docId, trackingToken } = await createOrderEntry(orderData);
        if (!success) throw new Error('Failed to create order entry');
        if (!trackingToken) throw new Error('Failed to generate secure tracking token.');

        // Record coupon usage ONLY after successful order creation
        if (appliedCouponCode && success) {
            try {
                await recordCouponUsage(
                    appliedCouponCode,
                    auth?.currentUser?.uid,
                    appliedDiscount,
                    rawTotal,
                    orderId
                );
            } catch (error) {
                console.error('Failed to record coupon usage analytics:', error);
                // Non-critical — don't fail the order
            }
        }

        const saveCb = document.querySelector('#save-address-cb');
        if (auth?.currentUser && saveCb?.checked) {
            try {
                await addDoc(collection(db, 'users', auth.currentUser.uid, 'addresses'), {
                    address: customerDetails.address,
                    createdAt: serverTimestamp()
                });
            } catch (err) {}
        }

        // Only COD is enabled in the UI anyway
        if (paymentMethod === 'COD') {
            await handleCODSuccess(orderId, trackingToken);
        } else {
            // Future-proofing, theoretically unreachable due to disabled radio inputs
            showError("Selected payment method is currently unavailable.");
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalBtnText;
        }

    } catch (error) {
        console.error('Checkout failed:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = originalBtnText;
    }
};

const handleCODSuccess = async (orderId, trackingToken) => {
    // Update status from AWAITING_PAYMENT → PENDING so admin sees it immediately
    try {
        await updateOrderDetails(orderId, { status: ORDER_STATUS.PENDING });
    } catch (err) {
        console.error('Failed to update order status to PENDING:', err);
        // Don't block the customer — order is created, proceed
    }
    clearCart();
    // Secure tracking now requires both order ID and generated token
    window.location.href = `/customer/track.html?id=${orderId}&token=${trackingToken}`;
};

const sanitizePhone = (phone) => {
    return phone.replace(/[^0-9]/g, '').slice(-10);
};

const showError = (msg) => {
    if (!errorDisplay) {
        alert(msg);
        return;
    }
    errorDisplay.textContent = msg;
    errorDisplay.classList.remove('hidden');
    errorDisplay.classList.add('block');
};

const hideError = () => {
    if (errorDisplay) {
        errorDisplay.classList.add('hidden');
        errorDisplay.classList.remove('block');
    }
};
