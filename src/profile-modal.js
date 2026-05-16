import { auth, db } from './firebase/config';
import {
    doc, getDoc, updateDoc, collection,
    getDocs, addDoc, deleteDoc, orderBy, query, serverTimestamp, where, onSnapshot
} from 'firebase/firestore';

import { fetchTickets, addMessageToTicket, resolveTicket, closeTicket } from './api/tickets';


// ── INJECT MODAL HTML INTO BODY ──
const injectProfileModal = () => {
    if (document.getElementById('lw-profile-modal')) return;
    const html = `
    <div id="lw-profile-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:16px;">
        <div style="background:#13141a;border:1px solid rgba(245,168,0,0.2);border-radius:20px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.7);">
            
            <!-- Header -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:1px solid rgba(255,255,255,0.07);">
                <div>
                    <h3 style="margin:0;font-size:17px;font-weight:900;color:#F0EAD6;letter-spacing:0.5px;">👤 My Profile</h3>
                    <p style="margin:3px 0 0;font-size:11px;color:#6B7280;">Manage your details & addresses</p>
                </div>
                <button id="lw-profile-close" style="background:rgba(255,255,255,0.06);border:none;color:#9CA3AF;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>
            </div>

            <div style="padding:20px 24px 24px;">

                <!-- Personal Info -->
                <p style="font-size:9px;font-weight:900;color:#F5A800;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Personal Info</p>
                <div style="display:grid;gap:10px;margin-bottom:20px;">
                    <div>
                        <label style="font-size:10px;color:#6B7280;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Full Name</label>
                        <input id="lw-profile-name" type="text" placeholder="Your name"
                            style="width:100%;margin-top:4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#F0EAD6;font-size:13px;font-weight:600;outline:none;box-sizing:border-box;transition:border 0.2s;"
                            onfocus="this.style.borderColor='rgba(245,168,0,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                    </div>
                    <div>
                        <label style="font-size:10px;color:#6B7280;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Phone</label>
                        <input id="lw-profile-phone" type="tel" placeholder="10-digit phone"
                            style="width:100%;margin-top:4px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#F0EAD6;font-size:13px;font-weight:600;outline:none;box-sizing:border-box;transition:border 0.2s;"
                            onfocus="this.style.borderColor='rgba(245,168,0,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
                    </div>
                    <div>
                        <label style="font-size:10px;color:#6B7280;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Email</label>
                        <input id="lw-profile-email" type="email" disabled
                            style="width:100%;margin-top:4px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 14px;color:#6B7280;font-size:13px;font-weight:600;outline:none;box-sizing:border-box;cursor:not-allowed;">
                    </div>
                </div>
                <button id="lw-profile-save" style="width:100%;padding:12px;background:#F5A800;border:none;border-radius:12px;color:#0d0d0d;font-size:13px;font-weight:900;letter-spacing:1px;text-transform:uppercase;cursor:pointer;margin-bottom:6px;">
                    Save Changes
                </button>
                <p id="lw-profile-msg" style="font-size:11px;text-align:center;min-height:18px;margin:4px 0 0;"></p>

                <!-- Divider -->
                <div style="height:1px;background:rgba(255,255,255,0.07);margin:20px 0;"></div>

                <!-- Saved Addresses -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <p style="font-size:9px;font-weight:900;color:#F5A800;letter-spacing:2px;text-transform:uppercase;margin:0;">Saved Addresses</p>
                    <button id="lw-addr-add-btn" style="font-size:10px;font-weight:800;color:#F5A800;background:rgba(245,168,0,0.1);border:1px solid rgba(245,168,0,0.3);border-radius:8px;padding:4px 10px;cursor:pointer;">+ Add New</button>
                </div>

                <!-- Add address form (hidden by default) -->
                <div id="lw-addr-form" style="display:none;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <textarea id="lw-addr-input" rows="2" placeholder="Full address (house no., street, landmark...)"
                        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;color:#F0EAD6;font-size:12px;resize:none;outline:none;box-sizing:border-box;font-family:inherit;"></textarea>
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <button id="lw-addr-save-btn" style="flex:1;padding:9px;background:#F5A800;border:none;border-radius:8px;color:#0d0d0d;font-size:11px;font-weight:900;cursor:pointer;text-transform:uppercase;">Save Address</button>
                        <button id="lw-addr-cancel-btn" style="flex:1;padding:9px;background:rgba(255,255,255,0.06);border:none;border-radius:8px;color:#9CA3AF;font-size:11px;font-weight:900;cursor:pointer;text-transform:uppercase;">Cancel</button>
                    </div>
                </div>

                <!-- Address list -->
                <div id="lw-addr-list" style="display:flex;flex-direction:column;gap:8px;">
                    <p style="text-align:center;color:#6B7280;font-size:12px;padding:16px 0;">Loading addresses...</p>
                </div>

                <!-- Divider -->
                <div style="height:1px;background:rgba(255,255,255,0.07);margin:20px 0;"></div>

                <!-- My Tickets -->
                <div style="height:1px;background:rgba(255,255,255,0.07);margin:20px 0;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <p style="font-size:9px;font-weight:900;color:#F5A800;letter-spacing:2px;text-transform:uppercase;margin:0;">My Tickets</p>
                    <button id="lw-ticket-refresh-btn" style="font-size:10px;font-weight:800;color:#6B7280;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:3px 8px;cursor:pointer;">↻ Refresh</button>
                </div>
                <div id="lw-tickets-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:4px;">
                    <p style="text-align:center;color:#6B7280;font-size:12px;padding:12px 0;">Loading tickets...</p>
                </div>

                <!-- Quick actions -->
                <div style="height:1px;background:rgba(255,255,255,0.07);margin:20px 0;"></div>
                <p style="font-size:9px;font-weight:900;color:#F5A800;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Quick Actions</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button id="lw-profile-orders-btn" style="padding:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#D1D5DB;font-size:11px;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;">📦 My Orders</button>
                    <button id="lw-profile-track-btn" style="padding:11px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#D1D5DB;font-size:11px;font-weight:800;cursor:pointer;text-transform:uppercase;letter-spacing:0.5px;">🛵 Track Order</button>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
};

// ── LOAD PROFILE DATA ──
const loadProfileData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
            const p = snap.data();
            const nameEl = document.getElementById('lw-profile-name');
            const phoneEl = document.getElementById('lw-profile-phone');
            const emailEl = document.getElementById('lw-profile-email');
            if (nameEl) nameEl.value = p.name || '';
            if (phoneEl) phoneEl.value = p.phone || '';
            if (emailEl) emailEl.value = p.email || user.email || '';
        }
    } catch(e) { console.error('Profile load error', e); }
};

// ── LOAD SAVED ADDRESSES ──
const loadAddresses = async () => {
    const list = document.getElementById('lw-addr-list');
    if (!list || !auth.currentUser) return;

    try {
        const q = query(collection(db, 'users', auth.currentUser.uid, 'addresses'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        if (snap.empty) {
            list.innerHTML = '<p style="text-align:center;color:#6B7280;font-size:12px;padding:16px 0;">No saved addresses yet</p>';
            return;
        }

        list.innerHTML = '';
        snap.forEach(docSnap => {
            const addr = docSnap.data().address;
            const docId = docSnap.id;
            const card = document.createElement('div');
            card.style.cssText = 'display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;';
            card.innerHTML = `
                <span style="font-size:16px;margin-top:1px;">📍</span>
                <p style="flex:1;font-size:12px;color:#D1D5DB;line-height:1.5;margin:0;">${addr}</p>
                <button data-id="${docId}" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#EF4444;font-size:10px;font-weight:800;padding:4px 8px;border-radius:6px;cursor:pointer;white-space:nowrap;flex-shrink:0;" class="lw-addr-delete">Delete</button>
            `;
            list.appendChild(card);
        });

        // Delete handlers
        list.querySelectorAll('.lw-addr-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                btn.textContent = '...';
                try {
                    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', id));
                    await loadAddresses();
                } catch(e) { btn.textContent = 'Delete'; }
            });
        });

    } catch(e) {
        list.innerHTML = '<p style="text-align:center;color:#EF4444;font-size:12px;padding:16px 0;">Failed to load addresses</p>';
    }
};

// ── LOAD MY TICKETS ──
const loadMyTickets = async () => {
    const list = document.getElementById('lw-tickets-list');
    if (!list) return;
    
    if (!auth.currentUser) {
        list.innerHTML = '<p style="text-align:center;color:#6B7280;font-size:12px;padding:12px 0;">Login to view your tickets</p>';
        return;
    }

    // Anonymous users have a real uid — show tickets but with a session note
    const isAnon = auth.currentUser.isAnonymous;

    list.innerHTML = '<p style="text-align:center;color:#6B7280;font-size:12px;padding:12px 0;">Loading...</p>';
    try {
        const tickets = await fetchTickets({ userId: auth.currentUser.uid });
        if (!tickets || tickets.length === 0) {
            list.innerHTML = `<p style="text-align:center;color:#6B7280;font-size:12px;padding:12px 0;">No support tickets yet 🎉${isAnon ? '<br><span style="font-size:10px;color:#4B5563;">Login to see tickets across all sessions.</span>' : ''}</p>`;
            return;
        }

        const statusBadge = (status) => {
            const map = {
                resolved: { bg:'rgba(16,185,129,0.12)',color:'#10b981', label:'Resolved' },
                closed:   { bg:'rgba(100,100,100,0.12)',color:'#9ca3af', label:'Closed' },
                replied:  { bg:'rgba(59,130,246,0.12)',color:'#60a5fa', label:'Replied' },
                pending:  { bg:'rgba(245,158,11,0.12)',color:'#F5A800', label:'Pending' },
                open:     { bg:'rgba(239,68,68,0.12)',color:'#f87171', label:'Open' },
            };
            const s = map[status] || map.open;
            return `<span style="font-size:9px;padding:2px 8px;border-radius:20px;font-weight:800;background:${s.bg};color:${s.color};">${s.label}</span>`;
        };

        const timeAgo = (ts) => {
            if (!ts?.seconds) return '';
            const diff = Math.floor((Date.now() - ts.seconds * 1000) / 60000);
            if (diff < 60) return `${diff}m ago`;
            if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
            return `${Math.floor(diff/1440)}d ago`;
        };

        list.innerHTML = '';
        tickets.forEach(ticket => {
            const isClosed = ['resolved','closed'].includes(ticket.status);
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;cursor:pointer;transition:border-color 0.2s;';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
                    <div>
                        <span style="font-size:11px;font-weight:800;color:#F0EAD6;font-family:var(--font-futuristic,sans-serif);">${ticket.ticketId ? '#' + ticket.ticketId : ticket.id?.slice(0,10)}</span>
                        <span style="font-size:9px;color:#6B7280;margin-left:6px;">${timeAgo(ticket.createdAt)}</span>
                    </div>
                    ${statusBadge(ticket.status)}
                </div>
                <p style="font-size:11px;color:#9CA3AF;line-height:1.5;margin:0 0 8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${ticket.issue || ticket.message || 'No description'}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:9px;color:#6B7280;">${ticket.messages?.length || 0} message${(ticket.messages?.length || 0) !== 1 ? 's' : ''}</span>
                    <button class="lw-ticket-view-btn" data-id="${ticket.id}" style="font-size:10px;font-weight:800;color:${isClosed ? '#6B7280' : '#F5A800'};background:${isClosed ? 'rgba(255,255,255,0.04)' : 'rgba(245,168,0,0.1)'};border:1px solid ${isClosed ? 'rgba(255,255,255,0.08)' : 'rgba(245,168,0,0.3)'};border-radius:8px;padding:4px 10px;cursor:pointer;">${isClosed ? 'View History' : '💬 Reply'}</button>
                </div>
            `;
            card.addEventListener('mouseenter', () => card.style.borderColor = 'rgba(245,168,0,0.3)');
            card.addEventListener('mouseleave', () => card.style.borderColor = 'rgba(255,255,255,0.08)');
            card.style.cursor = 'pointer';
            list.appendChild(card);

            // Whole card click opens chat
            card.addEventListener('click', () => openTicketChat(ticket));

            // Button also opens chat (stopPropagation so card click doesn't double-fire)
            card.querySelector('.lw-ticket-view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openTicketChat(ticket);
            });
        });
    } catch(e) {
        console.error('Tickets load error', e);
        list.innerHTML = '<p style="text-align:center;color:#EF4444;font-size:12px;padding:12px 0;">Failed to load tickets</p>';
    }
};


// ── TICKET CHAT MODAL (in-profile) ──
const openTicketChat = (ticket) => {
    const existingOverlay = document.getElementById('lw-profile-ticket-chat');
    if (existingOverlay) existingOverlay.remove();

    const isClosed = ['resolved','closed'].includes(ticket.status);

    const formatTime = (ts) => {
        try { return new Date(ts).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); } catch { return ''; }
    };

    const renderMsgs = (msgs) => msgs.map(m => {
        const isUser = m.sender === 'user';
        return `
            <div style="display:flex;flex-direction:column;align-items:${isUser ? 'flex-end' : 'flex-start'};margin-bottom:12px;">
                <div style="max-width:80%;background:${isUser ? '#F4B400' : 'rgba(255,255,255,0.06)'};color:${isUser ? '#000' : '#e5e7eb'};padding:10px 14px;border-radius:${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};font-size:12px;line-height:1.6;font-weight:${isUser ? '600' : '400'};border:1px solid ${isUser ? 'rgba(244,180,0,0.3)' : 'rgba(255,255,255,0.05)'}">${m.text || ''}</div>
                <span style="font-size:9px;color:#6B7280;margin-top:3px;padding:0 4px">${isUser ? '👤 You' : '🛡️ Support'} · ${formatTime(m.timestamp)}</span>
            </div>`;
    }).join('');

    const footerOpen = `
        <div style="display:flex;gap:10px;align-items:flex-end;margin-bottom:10px;">
            <textarea id="lw-tc-input" placeholder="Type your reply…" rows="2" style="flex:1;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 14px;color:#F0EAD6;font-size:13px;font-family:inherit;resize:none;outline:none;line-height:1.5;"></textarea>
            <button id="lw-tc-send" style="background:#F4B400;color:#000;border:none;border-radius:12px;padding:10px 18px;font-weight:900;font-size:12px;cursor:pointer;flex-shrink:0;letter-spacing:.5px;box-shadow:0 4px 12px rgba(244,180,0,0.25);height:44px;">Send</button>
        </div>
        <div style="display:flex;justify-content:flex-end;">
            <button id="lw-tc-resolve" style="font-size:10px;font-weight:800;color:#f87171;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:5px 12px;cursor:pointer;text-transform:uppercase;">✕ Close Ticket</button>
        </div>`;

    const footerClosed = (status) => `
        <div style="text-align:center;padding:12px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:12px;">
            <span style="font-size:11px;font-weight:800;color:#10b981;text-transform:uppercase;letter-spacing:1px;">✓ Ticket ${status === 'resolved' ? 'Resolved' : 'Closed'}</span>
            <p style="margin:4px 0 0;font-size:11px;color:#6B7280;">This conversation has ended.</p>
        </div>`;

    const overlay = document.createElement('div');
    overlay.id = 'lw-profile-ticket-chat';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10010;display:flex;align-items:center;justify-content:center;padding:16px;';
    overlay.innerHTML = `
        <div style="background:#0d0d0d;border:1px solid rgba(244,180,0,0.2);border-radius:24px;width:100%;max-width:480px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.8);">
            <div style="padding:18px 20px;border-bottom:1px solid rgba(244,180,0,0.1);display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0;background:linear-gradient(135deg,rgba(244,180,0,0.07) 0%,transparent 100%);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(244,180,0,0.1);border:1px solid rgba(244,180,0,0.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">🎫</div>
                    <div>
                        <div style="font-size:14px;font-weight:900;color:#F0EAD6;">Ticket ${ticket.ticketId ? '#' + ticket.ticketId : ''}</div>
                        <div style="font-size:10px;color:#6B7280;margin-top:2px;">${ticket.orderId ? 'Order ' + ticket.orderId.slice(0,12) + ' · ' : ''}<span id="lw-tc-status-text" style="color:${isClosed ? '#10b981' : '#F5A800'};font-weight:700;">${isClosed ? '✓ ' + ticket.status : 'Open'}</span></div>
                    </div>
                </div>
                <button id="lw-tc-close" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#9CA3AF;font-size:15px;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
            </div>
            <div style="padding:10px 20px;background:rgba(244,180,0,0.04);border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;">
                <div style="font-size:9px;color:#F5A800;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;">Issue</div>
                <div style="font-size:12px;color:#9CA3AF;line-height:1.6;">${ticket.issue || ticket.message || 'No description.'}</div>
            </div>
            <div id="lw-tc-messages" style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;min-height:120px;">
                ${(ticket.messages || []).length ? renderMsgs(ticket.messages || []) : '<div style="text-align:center;color:#4b5563;font-size:12px;padding:24px 0;">No messages yet.</div>'}
            </div>
            <div id="lw-tc-footer" style="padding:14px 20px;border-top:1px solid rgba(244,180,0,0.08);flex-shrink:0;background:#111318;">
                ${isClosed ? footerClosed(ticket.status) : footerOpen}
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const msgContainer = overlay.querySelector('#lw-tc-messages');
    if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

    let unsubLive = null;

    const closeOverlay = () => { if (unsubLive) unsubLive(); overlay.remove(); };
    overlay.querySelector('#lw-tc-close').addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

    // ── LIVE LISTENER via static onSnapshot import ──
    try {
        unsubLive = onSnapshot(doc(db, 'tickets', ticket.id), (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            const nowClosed = ['resolved','closed'].includes(data.status);
            const footer = overlay.querySelector('#lw-tc-footer');
            const statusText = overlay.querySelector('#lw-tc-status-text');

            if (statusText) {
                statusText.textContent = nowClosed ? '\u2713 ' + data.status : 'Open';
                statusText.style.color = nowClosed ? '#10b981' : '#F5A800';
            }
            if (msgContainer && data.messages) {
                msgContainer.innerHTML = data.messages.length
                    ? renderMsgs(data.messages)
                    : '<div style="text-align:center;color:#4b5563;font-size:12px;padding:24px 0;">No messages yet.</div>';
                msgContainer.scrollTop = msgContainer.scrollHeight;
            }
            if (nowClosed && footer) {
                footer.innerHTML = footerClosed(data.status);
            }
        });
    } catch(e) { console.warn('[TicketChat] Live listener error:', e.message); }

    if (!isClosed) {
        const input = overlay.querySelector('#lw-tc-input');
        const sendBtn = overlay.querySelector('#lw-tc-send');
        const resolveBtn = overlay.querySelector('#lw-tc-resolve');

        const doSend = async () => {
            const text = input?.value?.trim();
            if (!text) return;
            sendBtn.disabled = true; sendBtn.textContent = '...';
            try {
                await addMessageToTicket(ticket.id, text, 'user');
                input.value = ''; // onSnapshot updates the message list
            } catch(e) { console.error(e); }
            finally { sendBtn.disabled = false; sendBtn.textContent = 'Send'; }
        };

        sendBtn?.addEventListener('click', doSend);
        input?.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') doSend(); });

        resolveBtn?.addEventListener('click', () => {
            const existing = document.getElementById('lw-confirm-popup');
            if (existing) existing.remove();
            const popup = document.createElement('div');
            popup.id = 'lw-confirm-popup';
            popup.style.cssText = 'position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;';
            popup.innerHTML = `
                <div style="background:#0d0d0d;border:1px solid rgba(244,180,0,0.25);border-radius:20px;max-width:340px;width:100%;padding:28px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.8);text-align:center;">
                    <div style="font-size:30px;margin-bottom:12px;">⚠️</div>
                    <div style="font-family:var(--font-head,'Playfair Display'),serif;font-size:15px;font-weight:900;color:#F0EAD6;margin-bottom:8px;">Close Ticket?</div>
                    <p style="font-size:12px;color:#9CA3AF;line-height:1.6;margin:0 0 22px;">This ticket will be closed and you won't be able to send more messages.</p>
                    <div style="display:flex;gap:10px;">
                        <button id="lw-cp-cancel" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#9CA3AF;border-radius:12px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;">Cancel</button>
                        <button id="lw-cp-ok" style="flex:1;background:#ef4444;border:none;color:#fff;border-radius:12px;padding:11px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(239,68,68,0.3);">Yes, Close</button>
                    </div>
                </div>`;
            document.body.appendChild(popup);
            popup.querySelector('#lw-cp-cancel').addEventListener('click', () => popup.remove());
            popup.querySelector('#lw-cp-ok').addEventListener('click', async () => {
                popup.remove();
                resolveBtn.disabled = true; resolveBtn.textContent = 'Closing...';
                try {
                    await resolveTicket(ticket.id);
                } catch(e) { resolveBtn.disabled = false; resolveBtn.textContent = 'Close Ticket'; }

            });
            popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
        });
    }
};

// ── OPEN PROFILE MODAL ──
export const openProfileModal = (callbacks = {}) => {
    injectProfileModal();

    const modal = document.getElementById('lw-profile-modal');
    const closeBtn = document.getElementById('lw-profile-close');
    const saveBtn = document.getElementById('lw-profile-save');
    const msg = document.getElementById('lw-profile-msg');
    const addBtn = document.getElementById('lw-addr-add-btn');
    const addrForm = document.getElementById('lw-addr-form');
    const addrSaveBtn = document.getElementById('lw-addr-save-btn');
    const addrCancelBtn = document.getElementById('lw-addr-cancel-btn');
    const ordersBtn = document.getElementById('lw-profile-orders-btn');
    const trackBtn = document.getElementById('lw-profile-track-btn');
    const ticketRefreshBtn = document.getElementById('lw-ticket-refresh-btn');
    ticketRefreshBtn?.addEventListener('click', loadMyTickets);

    modal.style.display = 'flex';
    loadProfileData();
    loadAddresses();
    loadMyTickets();

    // Close
    const close = () => { modal.style.display = 'none'; };
    closeBtn.onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Save profile
    saveBtn.onclick = async () => {
        const name = document.getElementById('lw-profile-name').value.trim();
        const phone = document.getElementById('lw-profile-phone').value.trim();
        if (!name) { msg.textContent = 'Name cannot be empty'; msg.style.color = '#EF4444'; return; }

        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), { name, phone });
            msg.textContent = '✓ Profile updated!';
            msg.style.color = '#10B981';
            if (callbacks.onProfileSaved) callbacks.onProfileSaved(name);
        } catch(e) {
            msg.textContent = '✗ Failed to save';
            msg.style.color = '#EF4444';
        }
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
        setTimeout(() => msg.textContent = '', 3000);
    };

    // Add address toggle
    addBtn.onclick = () => {
        addrForm.style.display = addrForm.style.display === 'none' ? 'block' : 'none';
    };
    addrCancelBtn.onclick = () => {
        addrForm.style.display = 'none';
        document.getElementById('lw-addr-input').value = '';
    };

    // Save new address
    addrSaveBtn.onclick = async () => {
        const val = document.getElementById('lw-addr-input').value.trim();
        if (!val) return;
        addrSaveBtn.textContent = 'Saving...';
        try {
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'addresses'), {
                address: val,
                createdAt: serverTimestamp()
            });
            document.getElementById('lw-addr-input').value = '';
            addrForm.style.display = 'none';
            await loadAddresses();
        } catch(e) { console.error(e); }
        addrSaveBtn.textContent = 'Save Address';
    };

    // Quick actions
    ordersBtn.onclick = () => {
        close();
        if (callbacks.onMyOrders) callbacks.onMyOrders();
    };
    trackBtn.onclick = async () => {
        close();
        if (callbacks.onTrack) { callbacks.onTrack(); return; }
        // Default: find latest order
        try {
            const { fetchOrdersByUser } = await import('./api/orders');
            const orders = await fetchOrdersByUser(auth.currentUser.uid);
            const active = orders.find(o => !['DELIVERED','CANCELLED','REJECTED'].includes(o.status));
            const target = active || orders[0];
            if (target?.orderId && target?.trackingToken) {
                window.location.href = `/customer/track.html?id=${target.orderId}&token=${target.trackingToken}`;
            }
        } catch(e) { console.error(e); }
    };
};
