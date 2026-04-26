# 🎬 LITTIWALE ORDER ASSIGNMENT - VISUAL FLOW DIAGRAM

## Complete Journey from Order to Delivery

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🛒 CUSTOMER PLACES ORDER                             │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   📱 ADMIN RECEIVES NOTIFICATION                            │
│  • 🔊 Sound Alert  • 📳 Vibration  • 📲 Banner  • Auto-dismisses in 6s   │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               📦 ORDER IN ADMIN DASHBOARD - STATUS: PLACED 🆕              │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Order ID: #12345                                                   │  │
│  │  Amount: ₹450                                                       │  │
│  │  Customer: Raj Kumar (+91 98765 43210)                             │  │
│  │  Items: 2x Litti Chokha, 1x Baati                                  │  │
│  │  Address: Main Street, Downtown                                    │  │
│  │                                                                     │  │
│  │  [✅ ACCEPT] [🚫 REJECT]                                            │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Admin clicks "✅ ACCEPT ORDER"                                            │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│            📦 ORDER STATUS: ACCEPTED ✅ - SEND TO KITCHEN                   │
│                                                                             │
│  [👨‍🍳 SEND TO KITCHEN]                                                      │
│                                                                             │
│  Admin clicks button                                                       │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│          📦 ORDER STATUS: PREPARING 👨‍🍳 - MARK READY                        │
│                                                                             │
│  [🔔 MARK READY]                                                           │
│                                                                             │
│  Admin clicks button when order is prepared                                │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│              📦 ORDER STATUS: READY 🔔 ⭐ ASSIGN RIDER                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ 🛵 SELECT RIDER & ASSIGN                                            │  │
│  │                                                                     │  │
│  │ ┌──────────────────────────────┐  ┌───────────────────┐          │  │
│  │ │ Dropdown: [Rahul 🟢] ▼       │  │ [✓ ASSIGN NOW]    │          │  │
│  │ │ (shows online status)        │  │                   │          │  │
│  │ └──────────────────────────────┘  └───────────────────┘          │  │
│  │ (All riders listed with 🟢/🔴)                                    │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Admin selects rider + clicks "✓ ASSIGN NOW"                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ CONFIRMATION MODAL   │
                    │ "Assign Rahul?"      │
                    │ [Cancel] [Assign]    │
                    │ Admin clicks Assign  │
                    └──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                  🚀 RIDER NOTIFICATION SENT TO RAHUL                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  🛵 NEW DELIVERY ASSIGNED!                                         │  │
│  │  ══════════════════════════════════════════════════════           │  │
│  │  Order #12345                                                      │  │
│  │  ₹450  •  30 min away                                             │  │
│  │                                                                     │  │
│  │  Customer: Raj Kumar                                              │  │
│  │  Phone: +91 98765 43210                                           │  │
│  │  Pickup: Littiwale Restaurant, Main Street                        │  │
│  │  Items:                                                            │  │
│  │    • 2x Litti Chokha                                              │  │
│  │    • 1x Baati (Spicy)                                             │  │
│  │                                                                     │  │
│  │  [✅ ACCEPT]              [❌ REJECT]                              │  │
│  │                                                                     │  │
│  │  (Cannot close without clicking a button)                         │  │
│  │  🔊 Continuous ringing (300ms beeps)                              │  │
│  │  📳 Continuous vibration (300ms on/off)                           │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Rahul hears: 🔊 Ding ding ding... (won't stop)                           │
│  Rahul feels: 📳 Vib vib vib... (won't stop)                              │
└──────────────────────────┬──────────────────────┬──────────────────────────┘
                           │                      │
                    SCENARIO A:            SCENARIO B:
                    ACCEPT                 REJECT
                           │                      │
                ┌──────────▼──────────┐  ┌────────▼──────────┐
                │  Rider clicks       │  │  Rider clicks     │
                │  [✅ ACCEPT]        │  │  [❌ REJECT]      │
                └─────────┬───────────┘  └────────┬──────────┘
                          │                       │
                          ▼                       ▼
        ┌─────────────────────────────┐  ┌───────────────────────┐
        │ Sound & Vibration: STOP ✓  │  │ Sound & Vibration:    │
        │ Modal: CLOSE ✓             │  │ STOP ✓                │
        │ Status: READY → ASSIGNED   │  │ Modal: CLOSE ✓        │
        │ Timestamp: SAVED ✓         │  │ Status: ASSIGNED →    │
        │ Success message shown      │  │ READY (back)          │
        │                            │  │ Timestamp: SAVED ✓    │
        │ ✅ ACCEPTED 14:32:45       │  │ Warning message shown │
        └─────────────┬──────────────┘  │ ✗ REJECTED 14:32:45  │
                      │                 └────────┬──────────────┘
                      │                         │
                      │                         │
        ┌─────────────▼──────────────┐         │
        │ 📱 ADMIN SEES UPDATE       │         │
        │ ══════════════════════════ │         │
        │ Status: OUT FOR DELIVERY   │         │
        │ 🛵 Assigned Rider:         │         │
        │    Rahul Kumar             │         │
        │    ✓ Accepted 14:32:45     │         │
        │                            │         │
        │ [🎉 MARK DELIVERED]        │         │
        └────────────┬───────────────┘         │
                     │                         │
                     │                   ┌─────▼──────────────────┐
                     │                   │ 📱 ADMIN SEES UPDATE   │
                     │                   │ ════════════════════   │
                     │                   │ Status: READY 🔔       │
                     │                   │ ✗ Rejected 14:32:45    │
                     │                   │                        │
                     │                   │ Admin can now select   │
                     │                   │ another rider and      │
                     │                   │ assign again           │
                     │                   │                        │
                     │                   │ [RIDER #2 FLOW]        │
                     │                   └────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ 📱 CUSTOMER TRACKING PAGE    │
        │ ══════════════════════════  │
        │ Status: OUT FOR DELIVERY 🛵 │
        │                              │
        │ On the way with:             │
        │ 🛵 Rahul Kumar               │
        │ [☎️ CALL PARTNER]            │
        │                              │
        │ Order Summary:               │
        │ • 2x Litti — ₹250           │
        │ • 1x Baati — ₹200           │
        │ Total: ₹450                  │
        │                              │
        │ Estimated: 18 minutes        │
        │                              │
        │ ✓ Customer can now call      │
        │   Rahul directly             │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ 🛵 RIDER MARKS DELIVERED     │
        │ ══════════════════════════  │
        │ Picks up order at restaurant │
        │ Clicks: PICK UP ORDER        │
        │ Status changes to ASSIGNED   │
        │                              │
        │ Delivers to customer         │
        │ Clicks: MARK DELIVERED       │
        │ Status: ASSIGNED → DELIVERED │
        │                              │
        │ Earnings: +₹50               │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │ ✅ ORDER COMPLETE!           │
        │ ══════════════════════════  │
        │ Customer sees: "Delivered"   │
        │ Timestamp: 14:45 PM          │
        │ Feedback option available    │
        │                              │
        │ Admin sees: DELIVERED ✓      │
        │ Full timeline stored         │
        │                              │
        │ Rider sees: Earnings updated │
        │ Order in completed list      │
        └──────────────────────────────┘
```

---

## 🔑 KEY DECISION POINTS

### **Point 1: Admin Clicks "✓ ASSIGN NOW"**
```
✓ OUTCOME: Rider gets notification
✓ OUTCOME: Order stays at READY (waiting for acceptance)
✓ OUTCOME: Confirmation modal shows
```

### **Point 2: Rider Accepts**
```
✓ STATUS: ASSIGNED (can now pick up)
✓ CUSTOMER: Gets rider details on tracking page
✓ ADMIN: Sees acceptance timestamp
```

### **Point 3: Rider Rejects**
```
✓ STATUS: Back to READY
✓ RIDER: Removed from order
✓ ADMIN: Can select different rider
```

---

## 📊 PARALLEL EVENTS

### **When Admin Assigns Rider:**

```
        ADMIN              RIDER              CUSTOMER
         │                 │                     │
         ├─ Sees modal     │                     │
         │  "Confirm?"     │                     │
         │                 │                     │
         ├─ Clicks OK      │                     │
         │                 │                     │
         ├─ Order updated  ├─ Notification      │
         │  in Firestore   │  received 🔔        │
         │                 │  (sound+vibration)  │
         │                 │                     │
         │                 ├─ Shows modal        │
         │                 │  (2-button choice)  │
         │                 │                     │
         │                 ├─ Clicks ACCEPT      │
         │                 │                     │
         │                 ├─ Order status      ├─ Tracking page
         │                 │  becomes ASSIGNED   │  updates 🔄
         │                 │                     │
         │                 │                     ├─ Shows rider
         │                 │                     │  name & phone
         │                 │                     │
         │ Refresh ◄───────┼─────────────────────┤
         │ page            │                     │
         │ to see          │                     │
         │ acceptance ✓    │                     │
```

---

## 🎯 INFORMATION FLOW

```
┌─────────────────────────────────────────┐
│  FIRESTORE DATABASE                     │
├─────────────────────────────────────────┤
│                                         │
│  ORDERS Collection:                     │
│  ├─ orderId: "#12345"                  │
│  ├─ status: "ASSIGNED"                 │
│  ├─ riderId: "rider_doc_id"            │
│  ├─ riderName: "Rahul Kumar"           │
│  ├─ riderStatus: "accepted"            │
│  ├─ riderAcceptedAt: Timestamp         │
│  └─ customer info...                   │
│                                         │
│  RIDER NOTIFICATIONS Collection:       │
│  ├─ riderId: "rider_doc_id"            │
│  ├─ orderId: "#12345"                  │
│  ├─ orderData: {...full order...}      │
│  ├─ type: "NEW_ASSIGNMENT"             │
│  ├─ read: true (after action)          │
│  └─ createdAt: Timestamp               │
│                                         │
└─────────────────────────────────────────┘
          ▲     ▲     ▲     ▲
          │     │     │     │
    ┌─────┘     │     │     └──────┐
    │           │     │            │
    │      ┌────┘     └────┐       │
    │      │               │       │
┌───▼──┐ ┌─▼──┐      ┌────▼───┐ ┌─▼──────┐
│ ADMIN│ │RIDE│      │CUSTOMER│ │FUNCTIONS
│PANEL │ │PANEL      │TRACKING│ │(Firebase)
└──────┘ └────┘      └────────┘ └────────┘
```

---

## ✅ USER ACTIONS REQUIRED

| User | Action | Trigger | Result |
|------|--------|---------|--------|
| **Admin** | Accept order | Click "✅ ACCEPT" | Status: ACCEPTED |
| **Admin** | Send to kitchen | Click "👨‍🍳 SEND" | Status: PREPARING |
| **Admin** | Mark ready | Click "🔔 MARK READY" | Status: READY |
| **Admin** | Select rider | Choose from dropdown | Dropdown updated |
| **Admin** | Assign rider | Click "✓ ASSIGN NOW" | Rider gets notif |
| **Rider** | Accept order | Click "✅ ACCEPT" | Status: ASSIGNED |
| **Rider** | Reject order | Click "❌ REJECT" | Status: Back to READY |
| **Rider** | Mark delivered | Click "🎉 MARK" | Status: DELIVERED |
| **Customer** | Call rider | Click "☎️ CALL" | Phone call initiates |

---

**Legend:**
- 🟢 = Online
- 🔴 = Offline
- ✓ = Successful
- ✗ = Rejected/Failed
- 🔊 = Sound
- 📳 = Vibration
- 📲 = Notification

**Created:** April 26, 2026
**Status:** ✅ COMPLETE & TESTED
