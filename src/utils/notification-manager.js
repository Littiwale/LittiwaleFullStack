/**
 * Advanced Notification Manager
 * Handles notifications with sound, vibration, and persistent alerts
 */

let currentNotificationId = null;
let audioContext = null;
let audioSource = null;
let vibrationInterval = null;
let isNotificationActive = false;

/**
 * Initialize audio context for sound generation
 */
const initAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined' && window.AudioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
};

/**
 * Play a continuous ringing sound using Web Audio API
 * Duration in ms (0 = infinite until stopped)
 */
export const playRingSound = (durationMs = 0) => {
    try {
        initAudioContext();
        if (!audioContext) {
            // Fallback to audio element if Web Audio not available
            const audio = document.querySelector('#notif-sound');
            if (audio) {
                audio.loop = true;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
            return;
        }

        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a ringing pattern (alternating frequencies)
        oscillator.frequency.value = 800; // Start at 800Hz
        oscillator.type = 'sine';
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0.3, now);
        
        // Pattern: beep every 200ms
        let beepCount = 0;
        const beepInterval = setInterval(() => {
            if (isNotificationActive && audioContext) {
                const beepStart = audioContext.currentTime;
                oscillator.frequency.setValueAtTime(800, beepStart);
                oscillator.frequency.setValueAtTime(1200, beepStart + 0.1);
                gainNode.gain.setValueAtTime(0.3, beepStart);
                gainNode.gain.setValueAtTime(0, beepStart + 0.1);
                beepCount++;
            } else {
                clearInterval(beepInterval);
                try {
                    oscillator.stop();
                } catch (e) {}
            }
        }, 300);

        oscillator.start(now);
        
        // Auto-stop after duration if specified
        if (durationMs > 0) {
            setTimeout(() => {
                stopRingSound();
            }, durationMs);
        }
    } catch (error) {
        console.warn('Could not play ring sound:', error);
    }
};

/**
 * Stop the ringing sound
 */
export const stopRingSound = () => {
    isNotificationActive = false;
    try {
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.resume();
        }
    } catch (e) {}
    
    const audio = document.querySelector('#notif-sound');
    if (audio) {
        audio.pause();
        audio.loop = false;
        audio.currentTime = 0;
    }
};

/**
 * Start continuous vibration pattern
 */
export const startContinuousVibration = () => {
    if (!('vibrate' in navigator)) return;
    
    // Stop any existing vibration
    stopContinuousVibration();
    
    // Vibration pattern: strong-pause-strong-pause (repeating)
    vibrationInterval = setInterval(() => {
        if (isNotificationActive) {
            navigator.vibrate([300, 200, 300, 200]); // vibrate, pause, vibrate, pause
        }
    }, 1000);
};

/**
 * Stop continuous vibration
 */
export const stopContinuousVibration = () => {
    if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
        navigator.vibrate(0); // Turn off any active vibration
    }
};

/**
 * Show a persistent alert notification (until dismissed/acted upon)
 * @param {Object} config
 * @param {string} config.title - Notification title
 * @param {string} config.message - Notification message
 * @param {string} config.type - 'assignment' | 'order' | 'alert'
 * @param {Array} config.data - Additional data (e.g., order details)
 * @param {Function} config.onAccept - Callback for accept button
 * @param {Function} config.onReject - Callback for reject button
 * @param {boolean} config.persistent - Whether to persist until acted upon
 * @returns {string} Notification ID
 */
export const showPersistentNotification = (config) => {
    const {
        title = 'Notification',
        message = '',
        type = 'alert',
        data = {},
        onAccept = () => {},
        onReject = () => {},
        persistent = true
    } = config;

    // Clear previous notification if any
    if (currentNotificationId) {
        closePersistentNotification(currentNotificationId);
    }

    const notificationId = `notif-${Date.now()}`;
    currentNotificationId = notificationId;
    isNotificationActive = true;

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = `overlay-${notificationId}`;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    // Create notification card
    const card = document.createElement('div');
    card.id = notificationId;
    card.style.cssText = `
        background: linear-gradient(135deg, #1a1e2e 0%, #16192b 100%);
        border: 2px solid #F5A800;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 168, 0, 0.3);
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-align: center;
        color: white;
        font-family: 'Poppins', sans-serif;
    `;

    // Determine icon based on type
    let icon = '🔔';
    if (type === 'assignment') icon = '🛵';
    if (type === 'order') icon = '📦';

    // Build content HTML
    let contentHTML = `
        <div style="font-size: 48px; margin-bottom: 16px; animation: bounce 1s infinite;">${icon}</div>
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #F5A800;">${title}</h2>
        <p style="margin: 0 0 24px 0; font-size: 16px; color: #d1d5db; line-height: 1.6;">${message}</p>
    `;

    // Add order details if available
    if (data.orderId) {
        contentHTML += `
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px;">
                    <div>
                        <span style="color: #9ca3af; display: block; margin-bottom: 4px;">Order ID</span>
                        <span style="font-weight: 700; font-family: 'Space Mono', monospace;">${data.orderId}</span>
                    </div>
                    <div>
                        <span style="color: #9ca3af; display: block; margin-bottom: 4px;">Amount</span>
                        <span style="font-weight: 700; color: #F5A800; font-size: 16px;">₹${data.total || '—'}</span>
                    </div>
                    ${data.customerName ? `
                    <div>
                        <span style="color: #9ca3af; display: block; margin-bottom: 4px;">Customer</span>
                        <span style="font-weight: 600;">${data.customerName}</span>
                    </div>
                    ` : ''}
                    ${data.customerPhone ? `
                    <div>
                        <span style="color: #9ca3af; display: block; margin-bottom: 4px;">Phone</span>
                        <span style="font-weight: 600;">${data.customerPhone}</span>
                    </div>
                    ` : ''}
                </div>
                ${data.items ? `
                <div style="margin-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 16px; text-align: left;">
                    <span style="color: #9ca3af; font-size: 12px;">ITEMS:</span>
                    <div style="margin-top: 8px; font-size: 13px;">
                        ${Array.isArray(data.items) ? data.items.map((item, i) => `
                            <div style="display: flex; justify-content: space-between; padding: 4px 0;">
                                <span>${item.name} <span style="color: #9ca3af;">x${item.quantity || 1}</span></span>
                            </div>
                        `).join('') : ''}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Add action buttons
    contentHTML += `
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="notif-btn-reject" style="
                flex: 1;
                padding: 14px 20px;
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
                border: 2px solid #ef4444;
                border-radius: 10px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            ">
                ✕ REJECT
            </button>
            <button class="notif-btn-accept" style="
                flex: 1;
                padding: 14px 20px;
                background: linear-gradient(135deg, #F5A800, #ffc940);
                color: #000;
                border: none;
                border-radius: 10px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Poppins', sans-serif;
            ">
                ✓ ACCEPT
            </button>
        </div>
        ${!persistent ? `<p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">Auto-closing in 30s...</p>` : ''}
    `;

    card.innerHTML = contentHTML;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Add CSS animations if not already present
    if (!document.querySelector('style[data-notif-manager]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notif-manager', 'true');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(60px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .notif-btn-reject:hover {
                background: rgba(239, 68, 68, 0.3) !important;
                transform: translateY(-2px);
            }
            .notif-btn-accept:hover {
                filter: brightness(1.1);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    // Button event listeners
    const acceptBtn = card.querySelector('.notif-btn-accept');
    const rejectBtn = card.querySelector('.notif-btn-reject');

    const handleClose = () => {
        stopRingSound();
        stopContinuousVibration();
        overlay.style.animation = 'slideUp 0.4s ease reverse';
        setTimeout(() => {
            overlay.remove();
            if (currentNotificationId === notificationId) {
                currentNotificationId = null;
                isNotificationActive = false;
            }
        }, 400);
    };

    acceptBtn?.addEventListener('click', () => {
        handleClose();
        onAccept();
    });

    rejectBtn?.addEventListener('click', () => {
        handleClose();
        onReject();
    });

    // Auto-close after 30 seconds if not persistent
    if (!persistent) {
        setTimeout(() => {
            if (overlay.parentElement) {
                handleClose();
            }
        }, 30000);
    }

    // Start sound and vibration
    playRingSound();
    startContinuousVibration();

    return notificationId;
};

/**
 * Close a specific persistent notification
 */
export const closePersistentNotification = (notificationId) => {
    const overlay = document.getElementById(`overlay-${notificationId}`);
    if (overlay) {
        stopRingSound();
        stopContinuousVibration();
        overlay.style.animation = 'slideUp 0.4s ease reverse';
        setTimeout(() => {
            overlay.remove();
            if (currentNotificationId === notificationId) {
                currentNotificationId = null;
                isNotificationActive = false;
            }
        }, 400);
    }
};

/**
 * Check if a notification is currently active
 */
export const isNotificationShowing = () => {
    return isNotificationActive && currentNotificationId !== null;
};

/**
 * Get current active notification ID
 */
export const getCurrentNotificationId = () => {
    return currentNotificationId;
};
