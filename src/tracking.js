import { collection, query, where, onSnapshot, limit, addDoc, serverTimestamp, doc, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase/config';
import { requestNotificationPermission, saveFCMTokenToOrder } from './notifications';
import { getUserProfile, onAuthChange, logoutUser } from './api/auth';
import { fetchTickets, createTicket, addMessageToTicket, resolveTicket } from './api/tickets';

import { ORDER_STATUS } from './constants/orderStatus';
import { updateDeliveryEstimate } from './utils';
import { initCheckout } from './menu/checkout';
import { openProfileModal } from './profile-modal';

const content = document.querySelector('#tracking-content');
const loading = document.querySelector('#tracking-loading');
const result = document.querySelector('#tracking-result');
const errorDiv = document.querySelector('#tracking-error');

const orderIdDisplay = document.querySelector('#order-id-display');
const statusBadge = document.querySelector('#order-status-badge');
const itemsList = document.querySelector('#order-items-list');
const totalDisplay = document.querySelector('#order-total-display');
const custName = document.querySelector('#cust-name-display');
const custPhone = document.querySelector('#cust-phone-display');
const custAddress = document.querySelector('#cust-address-display');
let trackingUnsubscribe = null;

const riderInfo = document.querySelector('#rider-info');
const riderName = document.querySelector('#rider-name-display');
const riderCall = document.querySelector('#rider-call-btn');
const whatsappShareBtn = document.querySelector('#whatsapp-share-btn');

const initTracking = async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const trackingToken = urlParams.get('token');

    if (!orderId || !trackingToken) {
        showError();
        return;
    }

    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('orderId', '==', orderId),
            where('trackingToken', '==', trackingToken),
            limit(1)
        );
        
        // Guard: Clean up any existing listener before creating a new one
        if (typeof trackingUnsubscribe === 'function') {
            trackingUnsubscribe();
        }
        
        let previousStatus = null;
        let isFirstLoad = true;
        let errorTimeout = null;

        trackingUnsubscribe = onSnapshot(q, async (querySnapshot) => {
            if (querySnapshot.empty) {
                // Don't show error immediately, wait for 4 seconds to allow for Firestore propagation
                if (!errorTimeout) {
                    errorTimeout = setTimeout(() => {
                        showError();
                    }, 4000);
                }
                return;
            }

            // Data found! Clear any pending error timeout
            if (errorTimeout) {
                clearTimeout(errorTimeout);
                errorTimeout = null;
            }
            errorDiv.classList.add('hidden'); // Hide error if it was previously shown

            const docRef = querySnapshot.docs[0];
            const orderData = docRef.data();
            
            // Audio Notification Logic (Item 12)
            if (!isFirstLoad && previousStatus !== orderData.status) {
                const triggerStatuses = [
                    ORDER_STATUS.PREPARING, 
                    ORDER_STATUS.READY, 
                    ORDER_STATUS.ASSIGNED, 
                    ORDER_STATUS.DELIVERED
                ];
                if (triggerStatuses.includes(orderData.status)) {
                    const audio = document.getElementById('status-sound');
                    if (audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.warn('Audio play failed', e));
                    }
                }
            }
            
            previousStatus = orderData.status;

            renderOrder(orderData, docRef.id);

            // Handle Notifications (only on first load)
            if (isFirstLoad) {
                setTimeout(async () => {
                    const token = await requestNotificationPermission();
                    if (token && !orderData.fcmToken) {
                        await saveFCMTokenToOrder(docRef.id, token);
                    }
                }, 2000);
                isFirstLoad = false;
            }
        }, (error) => {
            console.error('Tracking listen failed:', error);
            showError();
        });

    } catch (error) {
        console.error('Tracking setup failed:', error);
        showError();
    }
};

let currentOrderTicket = null;

const checkOrderTicket = async (orderId) => {
    // Any authenticated user (including anonymous) can check for their ticket
    const user = auth.currentUser;
    if (!user) return; // Not authenticated at all — skip
    
    try {
        const tickets = await fetchTickets({ orderId, userId: user.uid });
        if (tickets.length > 0) {
            currentOrderTicket = tickets[0];
            updateHelpCardUI(currentOrderTicket);
        }
    } catch (e) { console.warn('[Track] Could not load order ticket:', e.code || e.message); }
};

const updateHelpCardUI = (ticket) => {
    const btn = document.getElementById('track-raise-ticket-btn');
    const text = document.getElementById('help-card-text');
    if (!btn || !text) return;

    if (ticket) {
        text.innerHTML = `Your ticket <span class="text-primary font-bold">#${ticket.ticketId}</span> is <span class="uppercase font-black text-xs">${ticket.status}</span>.`;
        btn.innerHTML = '💬 View & Reply';
        btn.classList.remove('bg-primary');
        btn.style.background = 'rgba(244,180,0,0.1)';
        btn.style.border = '1px solid var(--primary)';
        btn.style.color = 'var(--primary)';
    }
};

const renderOrder = async (order, docId) => {
    loading.classList.add('hidden');
    result.classList.remove('hidden');

    orderIdDisplay.textContent = order.orderId;
    statusBadge.textContent = order.status.replace(/_/g, ' ');
    
    // Status badge colors - brand-aligned (amber/green/red)
    const statusConfig = {
        [ORDER_STATUS.PLACED]:           { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Order Placed', emoji: '📋' },
        [ORDER_STATUS.ACCEPTED]:         { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Accepted', emoji: '✅' },
        [ORDER_STATUS.PREPARING]:        { bg: 'rgba(244,180,0,0.12)', color: '#F4B400', label: 'Preparing', emoji: '👨‍🍳' },
        [ORDER_STATUS.READY]:            { bg: 'rgba(244,180,0,0.12)', color: '#F4B400', label: 'Ready for Pickup', emoji: '🎉' },
        [ORDER_STATUS.ASSIGNED]:         { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Out for Delivery', emoji: '🛵' },
        [ORDER_STATUS.DELIVERED]:        { bg: 'rgba(16,185,129,0.15)', color: '#10B981', label: 'Delivered', emoji: '🎉' },
        [ORDER_STATUS.CANCELLED]:        { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Cancelled', emoji: '❌' },
        [ORDER_STATUS.REJECTED]:         { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Rejected', emoji: '❌' }
    };
    
    const config = statusConfig[order.status] || { bg: 'rgba(107,114,128,0.12)', color: '#9CA3AF', label: order.status.replace(/_/g, ' '), emoji: '' };
    statusBadge.style.background = config.bg;
    statusBadge.style.color = config.color;
    statusBadge.style.border = `1px solid ${config.color}40`;
    statusBadge.textContent = `${config.emoji} ${config.label}`;
    statusBadge.className = 'px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest';
    statusBadge.setAttribute('data-status', order.status); // stepper hook
    
    // Friendly status message
    const statusMessages = {
        [ORDER_STATUS.PLACED]: "Your order is confirmed! Hang tight.",
        [ORDER_STATUS.ACCEPTED]: "The kitchen has your order. Starting soon!",
        [ORDER_STATUS.PREPARING]: "Your food is being made right now 🔥",
        [ORDER_STATUS.READY]: "Your order is ready for pickup!",
        [ORDER_STATUS.ASSIGNED]: "On the way! Usually arrives in 10–20 minutes.",
        [ORDER_STATUS.DELIVERED]: "Enjoy your meal! Come back soon 😊",
        [ORDER_STATUS.CANCELLED]: "This order was cancelled. Contact us if you need help.",
        [ORDER_STATUS.REJECTED]: "This order was rejected. Contact us for assistance."
    };
    const msg = statusMessages[order.status] || "Your order is being processed.";
    const msgEl = document.querySelector('#order-status-message');
    if (msgEl) msgEl.textContent = msg;

    // Handle Rider Info
    if (order.riderId && order.status === ORDER_STATUS.ASSIGNED) {
        const profile = await getUserProfile(order.riderId);
        if (profile) {
            riderInfo.classList.remove('hidden');
            riderName.textContent = profile.name;
            const phone = profile.phone || profile.email; // Fallback to email if phone missing
            riderCall.href = `tel:${phone}`;
        }
    } else {
        riderInfo.classList.add('hidden');
    }

    itemsList.innerHTML = order.items.map(item => `
        <div class="flex justify-between text-sm">
            <span>
                ${item.name} 
                <span class="text-gray-500">(${item.variant.toUpperCase()} × ${item.quantity})</span>
                ${item.spiceLevel ? `<span style="font-size:10px; color:#ef4444; font-weight:800; background:rgba(239,68,68,0.1); padding:2px 6px; border-radius:4px; margin-left:4px;">🌶 ${item.spiceLevel.replace('_', ' ').toUpperCase()}</span>` : ''}
            </span>
            <span class="font-bold">₹${item.price * item.quantity}</span>
        </div>
    `).join('');

    totalDisplay.textContent = `₹${order.total}`;
    
    // Customer Details
    custName.textContent = order.customer.name;
    custPhone.textContent = order.customer.phone;
    custAddress.textContent = order.customer.address;

    // Check for ticket for this order
    if (order.orderId) {
        checkOrderTicket(order.orderId);
    }

    // ── RATING (Item 10) ──
    const ratingContainer = document.querySelector('#rating-container');
    if (order.status === ORDER_STATUS.DELIVERED && order.userId) {
        // Check if already rated
        try {
            const rSnap = await getDocs(query(collection(db, 'orders', docId, 'rating')));
            if (rSnap.empty) {
                ratingContainer.style.display = 'block';
                setupRatingInput(docId);
            }
        } catch (e) { console.warn('Could not fetch rating info', e); }
    } else if (ratingContainer) {
        ratingContainer.style.display = 'none';
    }

    // Call ETA logic for active orders
    const activeStatuses = [
        ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.PREPARING, 
        ORDER_STATUS.READY, ORDER_STATUS.ASSIGNED
    ];
    const etaDiv = document.querySelector('#delivery-estimate');
    if (etaDiv) {
        if (activeStatuses.includes(order.status)) {
            updateDeliveryEstimate();
            etaDiv.style.display = 'block';
        } else {
            etaDiv.style.display = 'none';
        }
    }

    // ── WHATSAPP SHARE (Task 9.2) ──
    const trackingUrl = `${window.location.origin}/track?id=${order.orderId}&token=${order.trackingToken}`;
    const whatsappMessage = `Hey! 🍽️ I just ordered from Littiwale! Order #${order.orderId} - Track it here: ${trackingUrl}`;
    
    if (whatsappShareBtn) {
        whatsappShareBtn.href = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    }
};

const setupRatingInput = (orderDocId) => {
    const starContainer = document.querySelector('#star-rating');
    const msg = document.querySelector('#rating-msg');
    if (!starContainer) return;

    const stars = Array.from(starContainer.children);
    let selectedRating = 0;

    const updateStars = (val) => {
        stars.forEach(s => {
            const sVal = parseInt(s.dataset.val);
            s.style.color = sVal <= val ? '#F5A800' : '#4b5563';
        });
    };

    stars.forEach(s => {
        s.addEventListener('mouseenter', () => updateStars(parseInt(s.dataset.val)));
        s.addEventListener('mouseleave', () => updateStars(selectedRating));
        s.addEventListener('click', async () => {
            selectedRating = parseInt(s.dataset.val);
            updateStars(selectedRating);
            starContainer.style.pointerEvents = 'none';
            msg.style.display = 'block';
            msg.textContent = 'Submitting...';
            msg.style.color = '#F5A800';

            try {
                await addDoc(collection(db, 'orders', orderDocId, 'rating'), {
                    rating: selectedRating,
                    createdAt: serverTimestamp()
                });
                msg.textContent = `Thanks for your ${selectedRating}-star rating! 🎉`;
                msg.style.color = '#10B981';
            } catch (err) {
                console.error('Rating failed:', err);
                msg.textContent = 'Failed to submit rating.';
                msg.style.color = '#ef4444';
                starContainer.style.pointerEvents = 'auto'; // allow retry
            }
        });
    });
};

window.addEventListener('beforeunload', () => {
    if (typeof trackingUnsubscribe === 'function') {
        trackingUnsubscribe();
    }
});

initCheckout();

const showError = () => {
    loading.classList.add('hidden');
    errorDiv.classList.remove('hidden');
};

initTracking();
// ── CUSTOM CONFIRM POPUP (replaces native confirm()) ──
const showConfirmPopup = (message, onConfirm) => {
    const existing = document.getElementById('lw-confirm-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'lw-confirm-popup';
    popup.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;';
    popup.innerHTML = `
        <div style="background:#0d0d0d;border:1px solid rgba(244,180,0,0.25);border-radius:20px;max-width:360px;width:100%;padding:28px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.8);text-align:center;">
            <div style="font-size:32px;margin-bottom:14px;">⚠️</div>
            <div style="font-family:var(--font-head,'Playfair Display'),serif;font-size:15px;font-weight:900;color:#F0EAD6;margin-bottom:10px;">Are you sure?</div>
            <p style="font-size:13px;color:#9CA3AF;line-height:1.6;margin:0 0 24px;">${message}</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button id="lw-confirm-cancel" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#9CA3AF;border-radius:12px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;">Cancel</button>
                <button id="lw-confirm-ok" style="flex:1;background:#ef4444;border:none;color:#fff;border-radius:12px;padding:12px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(239,68,68,0.3);">Yes, Close</button>
            </div>
        </div>`;

    document.body.appendChild(popup);
    popup.querySelector('#lw-confirm-cancel').addEventListener('click', () => popup.remove());
    popup.querySelector('#lw-confirm-ok').addEventListener('click', () => { popup.remove(); onConfirm(); });
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
};

const tmModal = document.getElementById('ticket-modal');
const tmClose = document.getElementById('close-ticket-modal');
const tmRaiseBtn = document.getElementById('track-raise-ticket-btn');

tmRaiseBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!tmModal) return;
    tmModal.style.display = 'flex';
    const label = document.getElementById('tm-order-id-label');
    if (label) label.textContent = orderId;
    
    if (currentOrderTicket) {
        showChatHistory();
    } else {
        showNewTicketForm();
    }
});

const showNewTicketForm = () => {
    const f = document.getElementById('tm-new-form');
    const c = document.getElementById('tm-chat-list');
    const r = document.getElementById('tm-reply-area');
    if (f) f.style.display = 'block';
    if (c) c.style.display = 'none';
    if (r) r.style.display = 'none';
    const tmId = document.getElementById('tm-id');
    if (tmId) tmId.textContent = 'NEW COMPLAINT';
};

const showChatHistory = () => {
    const f = document.getElementById('tm-new-form');
    const c = document.getElementById('tm-chat-list');
    if (f) f.style.display = 'none';
    if (c) { c.style.display = 'flex'; c.style.flexDirection = 'column'; }
    const tmId = document.getElementById('tm-id');
    if (tmId) tmId.textContent = '#' + (currentOrderTicket.ticketId || currentOrderTicket.id?.slice(0,8));

    const isClosed = ['resolved', 'closed'].includes(currentOrderTicket.status);
    const replyArea = document.getElementById('tm-reply-area');
    const closeBtn = document.getElementById('tm-close-ticket-btn');

    if (replyArea) {
        if (isClosed) {
            replyArea.style.display = 'block';
            replyArea.innerHTML = `
                <div style="text-align:center;padding:14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:14px;">
                    <span style="font-size:12px;font-weight:800;color:#10b981;text-transform:uppercase;letter-spacing:1px;">✓ Ticket ${currentOrderTicket.status === 'resolved' ? 'Resolved' : 'Closed'}</span>
                    <p style="margin:6px 0 0;font-size:11px;color:#6b7280;">This ticket has been resolved. <button id="tm-reopen-text" style="background:none;border:none;color:#F5A800;font-size:11px;font-weight:700;cursor:pointer;text-decoration:underline;">Raise new ticket?</button></p>
                </div>`;
            document.getElementById('tm-reopen-text')?.addEventListener('click', () => {
                currentOrderTicket = null;
                showNewTicketForm();
            });
        } else {
            replyArea.style.display = 'block';
        }
    }

    const statusPill = document.getElementById('tm-status-pill');
    if (statusPill) {
        const statusColors = {
            resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
            closed:   { bg: 'rgba(100,100,100,0.15)', color: '#9ca3af' },
            replied:  { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
            pending:  { bg: 'rgba(245,158,11,0.15)', color: '#F5A800' },
            open:     { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
        };
        const sc = statusColors[currentOrderTicket.status] || statusColors.pending;
        statusPill.textContent = currentOrderTicket.status?.toUpperCase() || 'OPEN';
        statusPill.style.background = sc.bg;
        statusPill.style.color = sc.color;
        statusPill.style.display = 'inline-block';
    }

    if (closeBtn) closeBtn.style.display = isClosed ? 'none' : '';
    renderChatHistory(currentOrderTicket.messages || []);
};

const renderChatHistory = (messages) => {
    const list = document.getElementById('tm-chat-list');
    if (!list) return;
    list.innerHTML = messages.map(msg => {
        const isUser = msg.sender === 'user';
        const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
        return `<div style="display:flex; flex-direction:column; align-items:${isUser ? 'flex-end' : 'flex-start'}; gap:4px;">
            <div style="
                max-width: 82%; padding: 10px 14px;
                border-radius: ${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
                background: ${isUser ? '#F4B400' : '#181818'};
                color: ${isUser ? '#000' : '#F0EAD6'};
                font-size: 13px; line-height: 1.6;
                border: 1px solid ${isUser ? 'rgba(244,180,0,0.4)' : 'rgba(255,255,255,0.06)'};
                font-weight: ${isUser ? '600' : '400'};
            ">${msg.text}</div>
            <span style="font-size: 9px; color: #4B5563;">${time}</span>
        </div>`;
    }).join('');
    const body = document.getElementById('tm-chat-body');
    if (body) body.scrollTop = body.scrollHeight;
};

document.getElementById('tm-submit-btn')?.addEventListener('click', async () => {
    const issue = document.getElementById('tm-issue-input').value.trim();
    if (!issue) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    document.getElementById('tm-submit-btn').disabled = true;
    document.getElementById('tm-submit-btn').textContent = 'Submitting...';

    try {
        const { auth } = await import('./firebase/config');
        const ticket = await createTicket({
            issue,
            orderId,
            userId: auth.currentUser?.uid || null,
            name: document.getElementById('cust-name-display').textContent,
            phone: document.getElementById('cust-phone-display').textContent
        });
        currentOrderTicket = ticket;
        updateHelpCardUI(ticket);
        showChatHistory();
    } catch (e) {
        console.error(e);
        document.getElementById('tm-submit-btn').disabled = false;
        document.getElementById('tm-submit-btn').textContent = 'Error. Try Again';
    }
});

document.getElementById('tm-send-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('tm-reply-input');
    const text = input.value.trim();
    if (!text || !currentOrderTicket) return;
    
    input.value = '';
    try {
        const msg = await addMessageToTicket(currentOrderTicket.id, text, 'user');
        currentOrderTicket.messages.push(msg);
        renderChatHistory(currentOrderTicket.messages);
    } catch (e) { console.error(e); }
});

document.getElementById('tm-close-ticket-btn')?.addEventListener('click', async () => {
    if (!currentOrderTicket) return;
    showConfirmPopup('This ticket will be closed and the conversation will end.', async () => {
        try {
            await resolveTicket(currentOrderTicket.id);

            if (tmModal) tmModal.style.display = 'none';
            window.location.reload();
        } catch (e) { console.error(e); }
    });
});

tmClose?.addEventListener('click', () => { if (tmModal) tmModal.style.display = 'none'; });
tmModal?.addEventListener('click', (e) => { if (e.target === tmModal) tmModal.style.display = 'none'; });

// ── NAV PROFILE AREA (Track Page) ──
const setupNavProfile = () => {
    // Single document click handler — registered once, not inside onAuthChange
    let dropdownEl = null;
    let triggerEl = null;

    document.addEventListener('click', (e) => {
        if (!dropdownEl || !triggerEl) return;
        if (!triggerEl.contains(e.target) && !dropdownEl.contains(e.target)) {
            dropdownEl.classList.remove('open');
            triggerEl.setAttribute('aria-expanded', 'false');
        }
    });

    onAuthChange((user) => {
        const profileArea = document.querySelector('#nav-profile-area');
        if (!profileArea) return;

        if (!user || user.isAnonymous) {
            if (user?.isAnonymous) {
                profileArea.innerHTML = `<span style="font-size:12px;font-weight:700;color:var(--text-secondary);cursor:pointer;" onclick="window.location.href='/login'">Hi, Guest 👋</span>`;
            } else {
                profileArea.innerHTML = `<a href="/login" class="btn btn-primary" style="padding:8px 16px;font-size:12px;">Login</a>`;
            }
            dropdownEl = null; triggerEl = null;
            return;
        }

        const displayName = user.profile?.name || user.displayName || 'User';
        const initial = displayName.charAt(0).toUpperCase();
        const role = user.profile?.role || 'customer';

        profileArea.innerHTML = `
            <div class="lw-profile-wrap" id="track-profile-wrap">
                <span>Hi, ${displayName.split(' ')[0]}</span>
                <button class="lw-avatar-btn" id="track-avatar-trigger" aria-haspopup="true" aria-expanded="false">${initial}</button>
                <div class="lw-dropdown" id="track-profile-dropdown" role="menu">
                    <div class="lw-dropdown-header">
                        <p>${displayName}</p>
                        <span style="text-transform:uppercase;letter-spacing:1px;font-size:10px;">${role}</span>
                    </div>
                    <button class="lw-dropdown-item" id="track-dd-profile">👤 My Profile</button>
                    <button class="lw-dropdown-item" id="track-dd-tickets">🎫 My Tickets</button>
                    <button class="lw-dropdown-item" id="track-dd-orders">📦 My Orders</button>
                    <div class="lw-dropdown-divider"></div>
                    <button class="lw-dropdown-item danger" id="track-dd-logout">🚪 Logout</button>
                </div>
            </div>
        `;

        triggerEl = document.getElementById('track-avatar-trigger');
        dropdownEl = document.getElementById('track-profile-dropdown');

        triggerEl?.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownEl.classList.contains('open');
            dropdownEl.classList.toggle('open', !isOpen);
            triggerEl.setAttribute('aria-expanded', !isOpen);
        });

        const closeDropdown = () => {
            dropdownEl?.classList.remove('open');
            triggerEl?.setAttribute('aria-expanded', 'false');
        };

        document.getElementById('track-dd-profile')?.addEventListener('click', () => {
            closeDropdown();
            openProfileModal({
                onMyOrders: () => { window.location.href = '/menu?openOrders=1'; }
            });
        });

        document.getElementById('track-dd-tickets')?.addEventListener('click', () => {
            closeDropdown();
            openProfileModal({
                onMyOrders: () => { window.location.href = '/menu?openOrders=1'; }
            });
            setTimeout(() => {
                const ticketsList = document.getElementById('lw-tickets-list');
                if (ticketsList) ticketsList.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });

        document.getElementById('track-dd-orders')?.addEventListener('click', () => {
            closeDropdown();
            window.location.href = '/menu?openOrders=1';
        });

        document.getElementById('track-dd-logout')?.addEventListener('click', async () => {
            closeDropdown();
            await logoutUser();
            window.location.href = '/login';
        });
    });
};

setupNavProfile();
