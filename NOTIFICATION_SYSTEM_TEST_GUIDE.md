# Littiwale Notification System - Quick Test Guide

## Quick Start Checklist ✓

### Prerequisites
- [ ] Admin logged in to `/admin/index.html`
- [ ] Rider logged in to `/rider/index.html` (separate browser/tab)
- [ ] Browser notifications enabled
- [ ] Sound enabled on device
- [ ] Volume turned up for testing

---

## Test 1: Admin Receives New Order Notification

### Setup
1. Open Admin panel in one window: `https://yoursite.com/admin/`
2. Open Customer panel in another window: `https://yoursite.com/customer/`

### Steps
1. As Customer: Add items to cart
2. As Customer: Proceed to checkout
3. As Customer: Place order (COD)
4. Look at Admin window...

### Expected Result ✓
- Admin hears: **Sound plays** (beep sound)
- Admin sees: **Banner appears** showing "📦 NEW ORDER: [ID] - ₹[Amount]"
- Admin feels: **Phone vibrates** (single pattern)
- Admin can: **Click banner** to navigate to Orders view

### Troubleshooting
- **No sound?** → Check browser volume + notification permissions
- **No vibration?** → Vibration may not work on desktop (test on mobile)
- **No banner?** → Check browser console for errors

---

## Test 2: Admin Assigns Rider - Rider Gets Persistent Notification

### Setup
1. Ensure order from Test 1 is in "READY" status (admin changed it)
2. Have Rider panel open in another browser tab

### Steps
1. **Admin:** In Orders view, find the ready order
2. **Admin:** Click status to change from "PREPARING" → "READY"
3. **Admin:** Dropdown appears with rider list
4. **Admin:** Select any rider from dropdown
5. **Admin:** Click yellow **"✓ Assign"** button
6. Look at Rider window...

### Expected Result ✓ (Rider should see)
- **Modal appears** (big box in center of screen)
- Title: "🛵 NEW DELIVERY ASSIGNED!"
- Order details shown:
  - Order ID (e.g., "LW-20260426-ABC1")
  - Amount (e.g., "₹450")
  - Customer name & phone
  - Items list
- **Sound plays** (continuous ringing beep - keeps repeating!)
- **Phone vibrates** (continuous pattern - keeps vibrating!)
- **Two buttons:** Red ✕ REJECT | Yellow ✓ ACCEPT
- **Modal stays open** (won't close on its own!)

### Actions (Rider)
- **Option A:** Click **"✓ ACCEPT"**
  - Sound stops ✓
  - Vibration stops ✓
  - Modal closes smoothly
  - Order marked as accepted
  
- **Option B:** Click **"✕ REJECT"**
  - Sound stops ✓
  - Vibration stops ✓
  - Modal closes smoothly
  - Order marked as rejected

### Expected Result During Sound/Vibration
- 🔊 **Sound:** Continuous ringing (don't worry if it's on your computer speaker!)
- 📳 **Vibration:** Continuous pattern (phone keeps vibrating!)
- **Won't stop** until you click a button
- This is intentional! Forces rider to acknowledge

### Troubleshooting
- **Modal doesn't appear?** → Check browser console for errors
- **Sound plays but won't loop?** → Browser might have audio restrictions
- **Vibration not working?** → Desktop doesn't support vibration (use mobile)
- **Can't see order details?** → Firestore might not have data yet, check console

---

## Test 3: Sound & Vibration Verification

### Sound Test
- Open browser DevTools (F12)
- Go to Console tab
- Run this code to test sound:
```javascript
// Test sound
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain);
gain.connect(ctx.destination);
gain.gain.setValueAtTime(0.3, ctx.currentTime);
osc.start();
setTimeout(() => osc.stop(), 500);
```
- Should hear a 500ms beep

### Vibration Test
- Run this in browser console:
```javascript
// Test vibration
navigator.vibrate([100, 50, 100]);
```
- Should feel phone vibrate (if supported)

---

## Status Indicator

### What You Should See at Each Order Status

| Status | Admin View | Rider View |
|--------|-----------|-----------|
| PLACED | Order card, pending | — |
| ACCEPTED | Kitchen status | — |
| PREPARING | Send to Kitchen | — |
| READY | **Dropdown + Assign Button** | — |
| ASSIGNED | Mark Delivered button | **🛵 Can see order in "Current Delivery"** |
| DELIVERED | Green checkmark | ✓ Marked delivered |

---

## Common Issues & Fixes

### Issue: Notification modal doesn't show
**Fix:**
- Check browser console (F12 → Console tab)
- Look for errors related to Firebase or notification-manager
- Verify Firestore has `riderNotifications` collection
- Test in a different browser

### Issue: Sound plays for admin but not rider
**Fix:**
- Rider notification sound comes from Web Audio API (oscillator)
- Might need to interact with page first (browser security)
- Try clicking on page before assigning order
- Test in Chrome (best support)

### Issue: Vibration doesn't work
**Fix:**
- Vibration API only works on mobile devices
- Desktop browsers don't support it
- Test on Android phone or iOS device
- Some browsers may block it

### Issue: Modal appears but disappears immediately
**Fix:**
- Check if another notification is conflicting
- Close any other modals/popups
- Refresh rider page and try again
- Check browser console for errors

---

## Video Demo (If Testing Manually)

1. **00:00-00:10** - Admin places order from customer
2. **00:10-00:15** - Admin sees notification banner
3. **00:15-00:30** - Admin marks order as READY
4. **00:30-00:40** - Admin selects rider & clicks Assign
5. **00:40-00:50** - Rider sees persistent modal with ringing
6. **00:50-01:00** - Rider clicks ACCEPT, sound stops
7. **01:00-01:10** - Order status updates to ASSIGNED

---

## Live Testing Checklist

### Before Testing
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Refresh both windows (F5)
- [ ] Check Firebase/Firestore is accessible
- [ ] Check network tab in DevTools (no red errors)
- [ ] Disable browser audio if testing sound

### During Testing
- [ ] Note all sounds heard
- [ ] Document vibration patterns
- [ ] Check all order details visible
- [ ] Verify buttons work correctly
- [ ] Confirm status updates in Firestore

### After Testing
- [ ] Check browser console for any errors
- [ ] Verify Firestore data was updated
- [ ] Note any UI glitches
- [ ] Document any improvements needed

---

## Success Criteria ✓

System is working if:
- ✅ Admin hears sound when new order arrives
- ✅ Admin sees notification banner
- ✅ Rider sees persistent modal when assigned
- ✅ Rider hears continuous ringing sound
- ✅ Rider phone vibrates continuously
- ✅ Sound/vibration stop when rider accepts/rejects
- ✅ Notification marked as read in Firestore
- ✅ Order status updates correctly
- ✅ No errors in browser console

---

## Next Steps

If everything works:
1. ✅ Deploy to production
2. ✅ Inform riders about new notification system
3. ✅ Monitor for any issues
4. ✅ Collect user feedback

If issues found:
1. Check browser console for errors
2. Review troubleshooting section above
3. Check Firestore data structure
4. Test in different browser
