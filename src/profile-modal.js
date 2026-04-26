import { auth, db } from './firebase/config';
import {
    doc, getDoc, updateDoc, collection,
    getDocs, addDoc, deleteDoc, orderBy, query, serverTimestamp
} from 'firebase/firestore';

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

                <!-- Quick actions -->
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

    modal.style.display = 'flex';
    loadProfileData();
    loadAddresses();

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
