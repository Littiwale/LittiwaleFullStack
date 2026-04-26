# 🛵 LITTIWALE ORDER ASSIGNMENT FLOW

## Complete End-to-End Workflow

### 📋 Overview
When an order is ready, admin assigns a rider. Rider accepts or rejects. If accepted, customer and admin get notifications with rider details. If rejected, admin selects another rider.

---

## 🔄 STEP-BY-STEP FLOW

### **STEP 1: CUSTOMER PLACES ORDER**
```
Customer Dashboard → Place Order → Order Status: PLACED
```
**What happens:**
- Order appears in Admin's Orders view with status "New Order"
- Admin gets notification 🔊 sound + 📳 vibration + 📲 banner

---

### **STEP 2: ADMIN ACCEPTS ORDER**
```
Admin Orders View → Click "✅ Accept Order"
```
**Order Status Flow:** PLACED → ACCEPTED
**Button appears for:** "👨‍🍳 Send to Kitchen"

---

### **STEP 3: KITCHEN PREPARES ORDER**
```
Admin Orders View → Click "👨‍🍳 Send to Kitchen"
```
**Order Status Flow:** ACCEPTED → PREPARING
**Button appears for:** "🔔 Mark Ready"

---

### **STEP 4: MARK ORDER READY**
```
Admin Orders View → Click "🔔 Mark Ready"
```
**Order Status Flow:** PREPARING → READY
**NEW SECTION APPEARS:** 🛵 Rider Selection & Assignment

---

### **🎯 STEP 5: ASSIGN RIDER TO ORDER** ⭐ KEY STEP

#### **5A. Admin Selects Rider from Dropdown**
```
Order Card (READY Status) → Dropdown: "🛵 Choose Rider from List"
↓
Admin sees: Rider Name + Online Status (🟢 Online or 🔴 Offline)
```

**Dropdown shows:**
- All available riders
- Online status indicator (🟢 = online, 🔴 = offline)
- Example: "Rahul 🟢" or "Priya 🔴"

#### **5B. Admin Clicks ASSIGN BUTTON**
```
Order Card (READY Status) → Button: "✓ ASSIGN NOW"
↓
Confirmation Modal:
  Title: "🛵 Assign Rider?"
  Message: "Assign [Rider Name] to this order?"
  Buttons: [Cancel] [Assign]
↓
Admin clicks "Assign"
```

**What happens behind the scenes:**
1. Order status stays READY (waiting for rider acceptance)
2. `riderId` and `riderName` stored in order document
3. `riderStatus: 'pending'` stored
4. `riderAssignedAt: [timestamp]` recorded

---

## 🚀 RIDER RECEIVES NOTIFICATION (REAL-TIME)

### **STEP 6: RIDER GETS ASSIGNMENT NOTIFICATION**

#### **6A. Notification Triggers**
**When:** Admin clicks "✓ ASSIGN NOW" and confirms
**Format:** Persistent Modal (Cannot close, must accept or reject)

#### **6B. What Rider Sees**

```
┌─────────────────────────────────────────┐
│                                         │
│  🛵 NEW DELIVERY ASSIGNED!              │
│                                         │
│  Order ID: #12345                       │
│  Amount: ₹450                           │
│  Customer: Raj Kumar                    │
│  Phone: +91 98765 43210                │
│                                         │
│  Items:                                 │
│  • 2x Litti Chokha                      │
│  • 1x Baati (Spicy)                     │
│                                         │
│  Pickup Address:                        │
│  Littiwale Restaurant, Main Street      │
│                                         │
│  [✅ ACCEPT]  [❌ REJECT]               │
│                                         │
└─────────────────────────────────────────┘
```

#### **6C. Rider Alerts**
- **Sound:** 🔊 Continuous ringing (Web Audio API oscillator) - 300ms beeps
- **Vibration:** 📳 Continuous haptic feedback - 300ms vibrate, 200ms pause
- **Visual:** Persistent modal blocking other actions
- **Won't stop until:** Rider taps ACCEPT or REJECT

---

## ✅ SCENARIO A: RIDER ACCEPTS

### **STEP 7A: RIDER CLICKS "✅ ACCEPT"**

```
Rider clicks ACCEPT button
↓
Sound & Vibration STOP ✓
Modal CLOSES ✓
↓
Order Status: READY → ASSIGNED
riderStatus: pending → accepted
riderAcceptedAt: [timestamp]
↓
Notification marked as read in Firestore
↓
Rider sees success message: "✅ Order Accepted!"
```

### **STEP 8A: ADMIN SEES RIDER ACCEPTED**

```
Admin's Order Card Updates Automatically:
┌─────────────────────────────────────────┐
│ Order ID: #12345                        │
│ Status: "Out for Delivery" (with 🛵)    │
│ ...                                     │
│ ┌──────────────────────────────────────┐│
│ │ 🛵 Assigned Rider                     ││
│ │ Name: Rahul Kumar                     ││
│ │ Status: pending                       ││
│ │ ✓ Accepted 14:32:45                   ││
│ │ (Rider has 2 min to leave restaurant) ││
│ └──────────────────────────────────────┘│
│                                         │
│ [🎉 Mark Delivered]                     │
└─────────────────────────────────────────┘
```

### **STEP 9A: CUSTOMER GETS RIDER DETAILS**

```
Customer's Tracking Page:
┌─────────────────────────────────────────┐
│ Order Status: OUT FOR DELIVERY 🛵       │
│                                         │
│ ┌──────────────────────────────────────┐│
│ │ 🛵 On the way with                    ││
│ │ Rahul Kumar                           ││
│ │ [Call Partner] ☎️                     ││
│ └──────────────────────────────────────┘│
│                                         │
│ Order Summary:                          │
│ • 2x Litti Chokha — ₹250               │
│ • 1x Baati (Spicy) — ₹200              │
│ Total: ₹450                             │
│                                         │
│ Estimated Delivery: 18 min              │
└─────────────────────────────────────────┘
```

**Customer receives:**
- ✅ Rider's name
- ✅ Rider's phone number (clickable to call)
- ✅ Tracking updates in real-time
- ✅ SMS/Push notification (optional)

---

## ❌ SCENARIO B: RIDER REJECTS

### **STEP 7B: RIDER CLICKS "❌ REJECT"**

```
Rider clicks REJECT button
↓
Sound & Vibration STOP ✓
Modal CLOSES ✓
↓
Order Status: READY (back to READY)
riderId: null (cleared)
riderName: null (cleared)
riderStatus: pending → rejected
riderRejectedAt: [timestamp]
↓
Rider sees warning: "❌ Order Rejected"
Message: "Admin can reassign to another rider"
```

### **STEP 8B: ADMIN SEES RIDER REJECTED**

```
Admin's Order Card Updates Automatically:
┌─────────────────────────────────────────┐
│ Order ID: #12345                        │
│ Status: "Ready" (back to READY)          │
│ ...                                     │
│ ┌──────────────────────────────────────┐│
│ │ 🛵 Assigned Rider (Previous)           ││
│ │ Name: Rahul Kumar                     ││
│ │ ✗ Rejected 14:32:45                   ││
│ └──────────────────────────────────────┘│
│                                         │
│ [🛵 SELECT RIDER & ASSIGN]              │
│ ┌──────────────────────────────────────┐│
│ │ Dropdown: [Priya 🟢]      [ASSIGN]   ││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### **STEP 9B: ADMIN SELECTS ANOTHER RIDER**

```
Admin selects: "Priya" from dropdown
Admin clicks: "✓ ASSIGN NOW"
Confirmation: "Assign Priya to this order?"
↓
Process repeats: Priya gets notification
↓
If Priya accepts → Customer gets Priya's details
If Priya rejects → Admin selects another rider
```

---

## 📊 STATUS TRACKING IN ADMIN PANEL

### **Assigned Section Shows:**
```
✓ Accepted [timestamp] — Green text, Order delivered successfully
✗ Rejected [timestamp] — Red text, Order returned to READY for reassignment
```

### **Example Timeline:**
```
14:00 — ✓ Accepted from Rahul (ASSIGNED status)
        → Next button: [🎉 Mark Delivered]

OR

14:05 — ✗ Rejected from Rahul, back to READY status
        → Next button: [🛵 SELECT RIDER & ASSIGN]
14:08 — ✓ Accepted from Priya (ASSIGNED status)
        → Next button: [🎉 Mark Delivered]
```

---

## 🎯 FINAL DELIVERY

### **STEP 10: RIDER MARKS DELIVERED**

```
Rider clicks "MARK DELIVERED" on their dashboard
↓
Order Status: ASSIGNED → DELIVERED
paymentStatus: paid
↓
Order archived in Rider's completed list
Earnings: ₹[amount] added to rider's total
```

### **STEP 11: CUSTOMER & ADMIN SEE DELIVERY COMPLETE**

```
Customer's Tracking Page:
✅ DELIVERED — Enjoy your meal! Come back soon 😊
🎉 Order completed at 14:18 PM

Admin's Order Card:
Status: "Delivered" (🎉)
Full timeline showing all accept/reject history
```

---

## 🔐 DATA STORED IN FIRESTORE

### **Orders Collection - Rider Assignment Fields:**
```javascript
{
  orderId: "12345",
  status: "ASSIGNED",
  riderId: "rider_doc_id",
  riderName: "Rahul Kumar",
  riderStatus: "pending" | "accepted" | "rejected",
  riderAssignedAt: Timestamp,
  riderAcceptedAt: Timestamp,    // Only if accepted
  riderRejectedAt: Timestamp,    // Only if rejected
  riderEarning: 50,              // Per config
  customerId: "customer_id",
  total: 450,
  customer: {
    name: "Raj Kumar",
    phone: "+91 98765 43210",
    address: "123 Main Street"
  }
}
```

### **RiderNotifications Collection:**
```javascript
{
  riderId: "rider_doc_id",
  orderId: "12345",
  orderData: {
    orderId: "12345",
    customerId: "customer_id",
    customerName: "Raj Kumar",
    customerPhone: "+91 98765 43210",
    customerAddress: "Delivery address",
    total: 450,
    items: [
      { name: "Litti Chokha", quantity: 2, price: 125 },
      { name: "Baati (Spicy)", quantity: 1, price: 200 }
    ]
  },
  type: "NEW_ASSIGNMENT",
  title: "🛵 New Delivery Assigned!",
  message: "New order #12345 - ₹450",
  read: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🎨 BUTTON ALIGNMENT & STYLING

### **Admin Panel - Rider Selection Container**

```
┌─────────────────────────────────────────────────────────┐
│ 🛵 SELECT RIDER & ASSIGN                                │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Dropdown: Choose Rider from List ▼              │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────┐                                    │
│ │ ✓ ASSIGN NOW     │                                    │
│ └──────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

**Layout:** CSS Grid - 2 columns
- Column 1: Dropdown (flexible width)
- Column 2: Button (fixed width, right-aligned)
- Both align to center height

**Styling:**
- Dropdown: 12px padding, 2px border, gold (#F5A800), shadow
- Button: Gold gradient, black text, shadow, hover effect
- Gap: 10px between elements

---

## ✅ TESTING CHECKLIST

- [ ] Admin places order in READY status
- [ ] Rider dropdown shows available riders with online status
- [ ] Admin selects rider and clicks "✓ ASSIGN NOW"
- [ ] Confirmation modal appears
- [ ] Rider receives notification with sound + vibration
- [ ] Rider taps ACCEPT → Order status becomes ASSIGNED
- [ ] Admin sees acceptance timestamp
- [ ] Customer sees rider details on tracking page
- [ ] Customer can call rider
- [ ] (If rejected) Admin can reassign to another rider
- [ ] Rider marks as delivered
- [ ] Order status becomes DELIVERED
- [ ] All parties see completion message

---

## 🚀 FEATURES IMPLEMENTED

✅ Rider dropdown in admin panel (shows online status)
✅ ASSIGN button with confirmation modal
✅ Persistent notification for rider (can't close)
✅ Continuous sound (300ms beeps) until accept/reject
✅ Continuous vibration until accept/reject
✅ Full order details in rider notification
✅ Accept/Reject buttons with different actions
✅ Admin sees acceptance/rejection timestamps
✅ Order status updates automatically
✅ Customer tracking shows rider details
✅ Rider rejection returns order to READY for reassignment
✅ Complete Firebase data structure for tracking

---

## 📱 RESPONSIVE DESIGN

**Mobile (< 768px):**
- Dropdown: Full width
- Button: Below dropdown with full width
- Layout adapts for small screens

**Desktop (> 768px):**
- Dropdown: Left side (flexible)
- Button: Right side (fixed width)
- Aligned perfectly in grid

---

Last Updated: April 26, 2026
Status: ✅ PRODUCTION READY
