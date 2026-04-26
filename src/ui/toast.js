/**
 * Global Toast System - Vanilla JS
 * Usage: toast.success('msg'), toast.error('msg'), toast.info('msg')
 */

class ToastSystem {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.init();
  }

  init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(msg, type = 'info') {
    const id = Date.now();
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6',
    };
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    };

    const el = document.createElement('div');
    el.style.cssText = `
      background: #1a1e2e;
      border: 1px solid ${colors[type]}40;
      border-left: 3px solid ${colors[type]};
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      animation: slideInRight 0.3s ease;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      min-width: 260px;
      pointer-events: all;
      color: #f0f2f8;
    `;

    el.innerHTML = `
      <span style="color: ${colors[type]}; font-weight: 700;">${icons[type]}</span>
      <span>${msg}</span>
    `;

    this.container.appendChild(el);
    this.toasts.push({ id, el });

    setTimeout(() => {
      el.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        el.remove();
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }, 3000);
  }

  success(msg) {
    this.show(msg, 'success');
  }

  error(msg) {
    this.show(msg, 'error');
  }

  info(msg) {
    this.show(msg, 'info');
  }
}

// Create global toast instance
const toast = new ToastSystem();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.toast = toast;
}

export default toast;
