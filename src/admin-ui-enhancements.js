/**
 * ADMIN PANEL UI ENHANCEMENTS - PREMIUM REDESIGN
 * Handles modals, drawers, toasts, and new UI features
 * Imported in admin.js after initialization
 */

import toast from './ui/toast';
import ImageUploader from './ui/image-uploader';

/**
 * MODAL SYSTEM — KPI Cards (Clickable stat cards)
 */
export function initKPIModals() {
  // Wait for DOM to be ready
  setTimeout(() => {
    const revenueCard = document.querySelector('[data-kpi="revenue"]');
    const activeCard = document.querySelector('[data-kpi="active"]');
    const completedCard = document.querySelector('[data-kpi="completed"]');
    const cancelledCard = document.querySelector('[data-kpi="cancelled"]');

    if (revenueCard) revenueCard.addEventListener('click', () => openKPIModal('revenue'));
    if (activeCard) activeCard.addEventListener('click', () => openKPIModal('kitchen'));
    if (completedCard) completedCard.addEventListener('click', () => openKPIModal('completed'));
    if (cancelledCard) cancelledCard.addEventListener('click', () => openKPIModal('cancelled'));
  }, 100);
}

export function openKPIModal(type) {
  let existing = document.querySelector('.kpi-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'kpi-modal-overlay';
  overlay.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center;`;

  const modal = document.createElement('div');
  modal.style.cssText = `background: var(--admin-card-bg, #12151f); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; width: 580px; max-height: 80vh; overflow-y: auto; animation: fadeIn 0.25s ease;`;

  // Get state from global admin scope
  const todayOrders = window.adminState?.todayOrders || [];
  const activeOrders = window.adminState?.activeOrders || [];
  const completedOrders = window.adminState?.completedOrders || [];
  const cancelledOrders = window.adminState?.cancelledOrders || [];

  let content = '';
  let title = '';

  if (type === 'revenue') {
    title = '💰 Today\'s Revenue';
    const paidOrders = todayOrders.filter(o => o.status === 'delivered' || o.paymentStatus === 'paid');
    const total = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    content = `
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.06);">
        <div style="font-size: 28px; font-weight: 800; color: #f5a623; font-family: Syne;">₹${total.toFixed(2)}</div>
        <div style="color: #6b7280; font-size: 13px;">From ${paidOrders.length} paid orders</div>
      </div>
      ${paidOrders.length > 0 ? paidOrders.slice(0, 10).map(o => `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div><div style="font-weight: 600;">${o.id}</div><div style="color: #6b7280; font-size: 12px;">${o.customerName}</div></div>
          <div style="color: #f5a623; font-weight: 700;">₹${o.total}</div>
        </div>
      `).join('') : '<div style="color: #6b7280; text-align: center; padding: 20px;">No paid orders</div>'}
    `;
  } else if (type === 'kitchen') {
    title = '🍳 Active Kitchen Orders';
    content = activeOrders.length > 0 ? activeOrders.slice(0, 8).map(o => `
      <div style="background: #1a1e2e; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.06);">
        <div style="font-weight: 700; margin-bottom: 8px;">${o.id}</div>
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">${o.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}</div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #f59e0b; font-weight: 600;">Preparing</span>
          <span style="color: #f5a623; font-weight: 700;">₹${o.total || 0}</span>
        </div>
      </div>
    `).join('') : '<div style="color: #6b7280; text-align: center; padding: 40px;">No active orders</div>';
  } else if (type === 'completed') {
    title = '✅ Completed Today';
    content = completedOrders.length > 0 ? completedOrders.slice(0, 10).map(o => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div><div style="font-weight: 600;">${o.id}</div><div style="color: #6b7280; font-size: 12px;">${o.items?.map(i => i.name).join(', ')}</div></div>
        <span style="padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(34,197,94,0.12); color: #22c55e; text-transform: uppercase;">✓ Done</span>
      </div>
    `).join('') : '<div style="color: #6b7280; text-align: center; padding: 40px;">No completed orders</div>';
  } else if (type === 'cancelled') {
    title = '❌ Rejected / Cancelled';
    content = cancelledOrders.length > 0 ? cancelledOrders.slice(0, 10).map(o => `
      <div style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;"><span style="font-weight: 600;">${o.id}</span><span style="color: #ef4444; font-weight: 700;">₹${o.total || 0}</span></div>
        <span style="display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(239,68,68,0.12); color: #ef4444; text-transform: uppercase;">❌ ${o.rejectedBy === 'kitchen' ? 'Kitchen' : 'Cancelled'}</span>
      </div>
    `).join('') : '<div style="color: #6b7280; text-align: center; padding: 40px;">No cancelled orders</div>';
  }

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3 style="font-family: Syne; font-size: 20px; font-weight: 700;">${title}</h3>
      <button style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; padding: 0;">×</button>
    </div>
    ${content}
    <button class="btn-ghost" style="margin-top: 24px; width: 100%; padding: 12px;">Close</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.querySelector('button').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  modal.querySelector('.btn-ghost').addEventListener('click', () => overlay.remove());
}

/**
 * APPLY PREMIUM STYLING TO EXISTING ELEMENTS
 */
export function applyPremiumStyling() {
  // Nav items styling
  document.querySelectorAll('.nav-item').forEach(item => {
    item.style.transition = 'all 0.18s ease';
    item.style.borderRadius = '10px';
  });

  // Cards styling
  document.querySelectorAll('.admin-card, .kpi-card').forEach(card => {
    card.style.transition = 'all 0.2s ease';
  });

  // Table hover effects
  document.querySelectorAll('.admin-table tbody tr').forEach((row, idx) => {
    row.style.transition = 'background 0.15s ease';
  });
}

/**
 * TOAST NOTIFICATIONS
 */
export function showToast(msg, type = 'info') {
  toast[type](msg);
}

/**
 * INITIALIZE ALL UI ENHANCEMENTS
 */
export function initializeAdminUIEnhancements() {
  setTimeout(() => {
    // Initialize KPI modals
    initKPIModals();

    // Apply premium styling
    applyPremiumStyling();

    // Add global state container
    if (!window.adminState) {
      window.adminState = {
        todayOrders: [],
        activeOrders: [],
        completedOrders: [],
        cancelledOrders: [],
      };
    }

    console.log('✓ Admin UI Enhancements initialized');
  }, 500);
}

export default {
  initializeAdminUIEnhancements,
  openKPIModal,
  showToast,
  initKPIModals,
  applyPremiumStyling,
};
