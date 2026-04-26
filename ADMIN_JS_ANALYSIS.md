# Admin.js UI Component Analysis

## Overview
This document maps all major UI rendering sections in admin.js with line numbers and state variables.

---

## 1. KPI CARDS (Revenue, Active, Completed, Cancelled)

### State Variables
- **Lines 33-36**: Element references
  ```javascript
  const kpiRevenue = document.querySelector('#kpi-revenue');
  const kpiActive = document.querySelector('#kpi-active');
  const kpiCompleted = document.querySelector('#kpi-completed');
  const kpiCancelled = document.querySelector('#kpi-cancelled');
  ```

### Rendering Function
- **Lines 820-850**: `updateKPIs()` - Updates KPI card text content
  - Calculates revenue from active + completed orders
  - Counts pending orders
  - Updates badge visibility (#order-badge, #notif-count)
  - **Key variables**:
    - `activeOrders` (Line 96)
    - `completedOrders` (Line 97)
    - `ORDER_STATUS` constants

### HTML Targets
- `#kpi-revenue` - Revenue text
- `#kpi-active` - Active orders count
- `#kpi-completed` - Delivered orders count
- `#kpi-cancelled` - Cancelled/rejected count
- `#order-badge` - Badge on orders nav
- `#notif-count` - Badge on notification bell

---

## 2. ORDER CARDS

### State Variables
- **Line 99**: `ordersContainer` - Container element (#orders-list-container)
- **Line 96-97**: `activeOrders`, `completedOrders` - Order arrays
- **Line 102**: `currentFilter` - Filter state ('ALL', 'PLACED', 'ACCEPTED', etc.)

### Real-time Listener
- **Lines 1002-1057**: `startOrderListener()` - Sets up Firestore snapshot listener
  - Orders query with limit(100) and orderBy createdAt desc
  - Categorizes orders into activeOrders/completedOrders
  - Triggers new order alert on new documents
  - Calls `updateKPIs()` and `renderOrders()`

### Main Rendering Function
- **Lines 1059-1074**: `renderOrders()` 
  - Filters based on `currentFilter`
  - Calls `createOrderCard()` for each order
  - Returns empty state message if no orders

### Order Card Template
- **Lines 1076-1138**: `createOrderCard(order)` - Creates individual order card HTML
  - Status badges with color mapping (lines 1081-1095)
  - Customer info and total amount
  - Item list with variant info
  - Dynamic action buttons based on status (lines 1103-1138)
  - Rider assignment dropdown for READY/ASSIGNED status
  - **Status flow**: PLACED → ACCEPTED → PREPARING → READY → ASSIGNED → DELIVERED

### Action Handlers
- **Lines 1143-1165**: Window-exposed functions:
  - `window.updateOrderStatus()` - Updates order status in Firestore
  - `window.handleRiderAssignment()` - Assigns rider to order

### Filter Setup
- **Lines 488-496**: `setupOrderFiltering()` - Handles filter tab clicks

---

## 3. TICKETS LIST

### State Variables
- **Line 100**: `ticketsListContainer` - Container element (#tickets-list-container)
- **Lines 48-50**: Event listener for ticket action clicks

### Loading Function
- **Lines 758-781**: `loadTickets()` - Fetches tickets from Firestore
  - Query: `collection(db, 'tickets')` ordered by createdAt desc
  - Calls `renderTickets(tickets)`

### Rendering Function
- **Lines 783-838**: `renderTickets(tickets)` - Creates table with ticket data
  - **HTML Structure**: Table with columns:
    - Ticket ID
    - Name
    - Phone
    - Issue
    - Status (badge)
    - Created date
    - Action button (Mark as resolved)
  - **Status Display**: "pending" vs "resolved" badge

### Resolution Handler
- **Lines 840-849**: `resolveTicket(ticketDocId)` - Updates ticket status to 'resolved'
  - Updates Firestore document
  - Reloads ticket list

### HTML Targets
- `#tickets-list-container` - Main container for table
- `[data-ticket-action="resolve"]` - Resolve buttons

---

## 4. CUSTOMERS TABLE

### State Variables
- **Line 101**: `customersTableBody` - Table body element (#customers-table-body)

### Loading Function
- **Lines 1169-1187**: `loadCustomers()` - Fetches all users
  - Calls `fetchAllUsers()` API
  - Maps users to table rows
  - Displays: Name, Email, Phone, Role, Role selector dropdown

### Rendering
- **Inside loadCustomers()**: Direct innerHTML render with columns:
  - User name + email
  - Phone number (with tel: link)
  - Current role badge (#F5A800 accent color)
  - Dropdown to change role (customer/rider/manager/admin)

### Role Change Handler
- **Lines 1189-1192**: `window.changeRole(uid, role)` - Updates user role
  - Confirms action with user
  - Calls `updateUserRole()` API
  - Reloads customer table

### HTML Targets
- `#customers-table-body` - Table tbody
- `onchange="changeRole(...)"` - Role dropdown

---

## 5. MENU ITEMS

### State Variables
- **Lines 55-89**: Menu form element references (23 elements total)
- **Line 104**: `menuItems` - Array of menu items from Firestore
- **Lines 105-114**: Filter and pagination states
  ```javascript
  let currentMenuCategory = 'all';
  let currentMenuStatus = 'all';
  let currentMenuType = 'all';
  let currentMenuStock = 'all';
  let menuSearchQuery = '';
  let currentMenuPage = 1;
  ```

### Firestore Listener
- **Lines 587-609**: `startMenuListener()` - Real-time menu data sync
  - Query: `collection(db, 'menu')` ordered by category
  - Populates `menuItems` array
  - Calls `renderMenuCategories()` and `renderMenuList()`

### Menu List Rendering
- **Lines 683-819**: `renderMenuList()` - Main menu items table
  - **Features**: 
    - Filtering by category, status, type, stock
    - Search functionality (case-insensitive)
    - Pagination (ITEMS_PER_PAGE = 20)
    - Caching with menuListCache Map
  - **Table Columns**:
    - Checkbox for bulk selection
    - Item image + name + meta (category, veg/non-veg)
    - Price
    - Stock quantity
    - Status badge (Visible/Hidden)
    - Actions: Edit, Toggle visibility, Delete
  - **Pagination Controls**: Previous/Next buttons

### Category Dropdown
- **Lines 649-661**: `renderMenuCategories()` - Populates category filter
  - Extracts unique categories from menuItems
  - Generates options

### Menu Form Rendering
- **Lines 887-948**: `populateMenuForm(item)` - Edit mode form population
  - Populates all input fields
  - Shows image preview
  - Renders variant rows
  - Sets form title and button text to "Edit"

### Menu Form Submission
- **Lines 950-1000**: `handleMenuFormSubmit()` - Create/update logic
  - Validates required fields
  - Collects variant data
  - Handles image upload
  - Calls `createMenuItem()` or `updateMenuItem()`

### Bulk Operations
- **Lines 506-582**: `initMenuBulkOperations()` 
  - Select all checkbox
  - Bulk edit (category, price adjustment, availability)
  - Bulk delete
  - Updates selected count display

### Menu Form Modal/Drawer
- **Lines 911-928**: `showMenuFormPanel(open, mode)`, `hideMenuFormPanel()`
  - Controls visibility of #menu-form-panel
  - Switches between list and form modes
  - Button states: #show-menu-list-btn, #show-menu-add-btn

### HTML Targets
- `#menu-list-container` - Table container
- `#menu-form-panel` - Form drawer/modal
- `#menu-category-filter` - Category dropdown
- `#menu-status-filter`, `#menu-type-filter`, `#menu-stock-filter` - Advanced filters
- `#menu-search` - Search input
- `#menu-select-all` - Bulk select checkbox
- `#menu-item-checkbox` - Individual item checkboxes

---

## 6. RIDER CARDS

### State Variables
- **Line 94**: `ridersList` - Array of riders
- **Line 103**: `ridersContainer` - Container element (#riders-list-container)

### Loading Function
- **Lines 241-251**: Initial rider load in `initAdmin()`
  - Fetches riders with `fetchUsersByRole('rider')`
  - Calls `renderRiders(riders)`

### Rendering Function
- **Lines 1254-1349**: `renderRiders(riders)` - Premium card layout
  - **Features**:
    - Sorts by online status, then name
    - Fetches delivery stats in parallel
    - Shows rider emoji (🛵) in gradient box
    - **Status Indicator**:
      - Online/Offline dot with pulse animation
      - Online duration or last offline time
    - **Stats Cards**:
      - Deliveries count (#F5A800)
      - ID code snippet (#3B82F6)
    - **Action Buttons**:
      - 💬 Contact button (placeholder)
      - 📊 Stats button (opens analytics modal)

### Rider Analytics Modal
- **Lines 1309-1349**: `window.openRiderAnalytics(riderId, riderName)` 
  - Modal ID: #rider-analytics-modal
  - Displays:
    - Total deliveries (#analytics-total-deliveries)
    - Average delivery time (#analytics-avg-time)
    - On-time rate percentage (#analytics-ontime-rate)
    - Active orders (#analytics-active-orders)
    - Recent 5 deliveries list (#analytics-recent-deliveries)
  - Fetches data with `getRiderAnalytics(riderId)`

### Rider Contact Modal
- **Lines 1276-1304**: `window.openRiderContact(riderId, riderName, riderPhone)`
  - Modal ID: #rider-contact-modal
  - Fields:
    - Rider name (#rider-contact-name)
    - Phone (tel: link) (#rider-contact-phone)
    - Messages area (#rider-contact-messages)
    - Message input + send button
  - `window.sendRiderContactMessage()` - Stores messages in Firestore

### Helper Functions
- **Lines 1211-1231**: `calculateOnlineDuration(rider)` - Format online time
- **Lines 1233-1252**: `getLastOfflineTime(rider)` - Format offline time
- **Lines 1169-1194**: `getRiderDeliveryStats(riderId)` - Query delivered orders
- **Lines 1196-1253**: `getRiderAnalytics(riderId)` - Comprehensive analytics

### HTML Targets
- `#riders-list-container` - Grid container
- `#rider-contact-modal` - Contact modal
- `#rider-analytics-modal` - Analytics modal
- `onlinefor` indicator animation

---

## 7. NOTIFICATION BELL

### Badge Elements
- **Line 37**: `notifCountBadge` - Badge counter (#notif-count)
- **Line 36**: `orderBadge` - Badge on orders nav (#order-badge)
- **Line 38**: `newOrderToast` - Toast notification (#new-order-toast)

### Badge Update Logic
- **Lines 845-851 in updateKPIs()**:
  ```javascript
  if (pendingCount > 0) {
    orderBadge?.classList.remove('hidden');
    orderBadge.textContent = pendingCount;
    notifCountBadge?.classList.remove('hidden');
    notifCountBadge.textContent = pendingCount;
  } else {
    orderBadge?.classList.add('hidden');
    notifCountBadge?.classList.add('hidden');
  }
  ```

### New Order Alert
- **Lines 1370-1378**: `triggerNewOrderAlert()`
  - Plays notification sound (#notif-sound)
  - Shows toast (#new-order-toast) for 5 seconds
  - Triggered when new order detected in snapshot

### Triggering Logic
- **Line 1028**: Detects new orders: `if (change.type === 'added' && !isInitialLoad) newDetected = true;`
- **Line 1032**: Calls `triggerNewOrderAlert()` if new order detected

### HTML Targets
- `#order-badge` - Order nav badge
- `#notif-count` - Notification bell badge
- `#new-order-toast` - Toast container
- `#notif-sound` - Audio element for notification sound

---

## 8. EXISTING MODAL/DRAWER PATTERNS

### Rider Analytics Modal
- **ID**: #rider-analytics-modal
- **Display Type**: Flex overlay
- **Content**: Displays rider delivery statistics
- **Trigger**: `openRiderAnalytics()` function
- **Close**: Not explicitly shown - likely click outside or close button

### Rider Contact Modal
- **ID**: #rider-contact-modal
- **Content**: Rider name, phone, message history, input
- **Trigger**: `openRiderContact()` function
- **Actions**: Send message button

### Menu Form Drawer
- **ID**: #menu-form-panel
- **Type**: Side panel/drawer
- **States**: `setMenuMode('form')` or `setMenuMode('list')`
- **Toggle**: `showMenuFormPanel()`, `hideMenuFormPanel()`
- **Content**: Form for creating/editing menu items
- **Associated Card**: #menu-list-card (hidden in form mode)

### Coupon Form Section
- **ID**: #coupon-create-msg (feedback message area)
- **Type**: Inline form with message display
- **Elements**:
  - #new-coupon-code
  - #new-coupon-type (changes dynamic fields)
  - #new-coupon-min
  - #new-coupon-max-uses
  - #new-coupon-expiry
  - #coupon-type-fields (dynamic based on type)

### Announcement Upload Form
- **Elements**:
  - #ann-image (file input)
  - #ann-title (text input)
  - #ann-expiry (datetime)
  - #ann-preview (image preview container)
  - #ann-create-msg (feedback message)
  - #create-ann-btn (submit button)

### Fraud Alert Banner
- **ID**: #fraud-alert
- **Content**: #fraud-alert-content
- **Display**: Block/none toggle
- **Type**: Alert banner (not modal)

---

## 9. ANALYTICS DASHBOARD

### Analytics View Sections
- **Lines 378-382**: Switch analytics on `switchView('analytics')`
- **Lines 1389-1393**: `loadDashboardAnalytics()` - Main analytics load
- **Lines 1395-1429**: `renderPremiumChart()` - Chart.js line charts
  - Revenue chart (#revenue-chart)
  - Orders chart (#orders-chart)
  - Trend indicators (% change vs yesterday)

### Menu Analytics (Task 6.3)
- **Lines 1557-1572**: `loadMenuAnalytics()` - Menu-specific analytics
- **Lines 1574-1610**: `calculateMenuAnalytics()` - Calculate stats
- **Lines 1612-1631**: `updateMenuAnalyticsKPIs()` - Update KPI cards
  - #analytics-total-items
  - #analytics-available-items
  - #analytics-out-of-stock
  - #analytics-hidden-items
  - #analytics-avg-price
  - #analytics-low-stock
  - #analytics-veg-items
  - #analytics-nonveg-items

### Chart Components
- **Lines 1633-1675**: `renderCategoryChart()` - Doughnut chart of categories
- **Lines 1677-1719**: `renderPriceChart()` - Horizontal bar chart of price ranges

### Coupon Analytics (Phase 4)
- **Lines 1493-1510**: `loadCouponAnalytics()` - Fetch and update coupon data
- **Lines 1512-1524**: `updateCouponKPIs()` - Update coupon KPIs
- **Lines 1493-1510**: Period selector (7/30/90 days)
- **Lines 1526-1550**: `updateCouponAnalyticsTable()` - Coupon data table

---

## KEY STATE VARIABLES SUMMARY

| Variable | Purpose | Initial Value |
|----------|---------|---|
| `currentUser` | Logged-in user object | null |
| `activeOrders` | Non-completed orders | [] |
| `completedOrders` | Completed/cancelled orders | [] |
| `ridersList` | Available riders | [] |
| `menuItems` | All menu items from Firestore | [] |
| `currentFilter` | Order filter state | 'ALL' |
| `currentView` | Active view/tab | 'dashboard' |
| `currentMenuCategory` | Menu category filter | 'all' |
| `currentMenuStatus` | Menu availability filter | 'all' |
| `currentMenuType` | Menu veg/non-veg filter | 'all' |
| `currentMenuStock` | Menu stock filter | 'all' |
| `currentMenuPage` | Pagination page | 1 |
| `editingMenuItemId` | ID of menu item being edited | null |
| `editingCouponCode` | Code of coupon being edited | null |
| `activeCharts` | Chart.js instances (map) | {} |

---

## UNSUBSCRIBE PATTERNS

- **Line 112**: `orderListenerUnsubscribe` - Cleanup function for order listener
- **Line 115**: `menuListenerUnsubscribe` - Cleanup function for menu listener
- **Lines 1016-1021**: Cleanup on page unload

---

## EVENT LISTENERS SETUP

| Function | Listener Type | Line |
|----------|--|---|
| `setupNavigation()` | Nav item clicks | 324-332 |
| `setupOrderFiltering()` | Filter tab clicks | 488-496 |
| `setupMenuAdmin()` | Menu filter/search changes | 498-563 |
| `initMenuForm()` | Form submit, image preview | 653-663 |
| `setupCouponAdmin()` | Coupon form setup | 2055-2206 |
| `setupAnnouncementAdmin()` | Announcement form setup | 2299-2350 |

---

## NEXT STEPS FOR UI FIXES

1. **KPI Cards**: Check styling in CSS for #kpi-* elements
2. **Order Cards**: Verify `createOrderCard()` template and action button styling
3. **Tickets Table**: Check table CSS and badge colors
4. **Customers Table**: Verify dropdown styling and role badge colors
5. **Menu List**: Test pagination and bulk selection UI
6. **Rider Cards**: Check gradient box and status indicator animation
7. **Modals**: Verify backdrop, animation, and close button functionality
8. **Analytics Charts**: Check Chart.js rendering and responsiveness
