const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
        await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
        console.warn('Service worker registration failed:', error);
    }
};

const createInstallButton = () => {
    let button = document.querySelector('#pwa-install-btn');
    if (button) {
        button.style.display = 'none';
        return button;
    }

    button = document.createElement('button');
    button.id = 'pwa-install-btn';
    button.type = 'button';
    button.innerHTML = '📱 Install App';
    button.style.cssText = 'position:fixed;bottom:24px;left:24px;background:var(--primary);color:var(--button-on-primary);border:none;border-radius:40px;padding:12px 20px;font-weight:900;font-size:13px;box-shadow:0 4px 15px rgba(244,180,0,0.4);cursor:pointer;z-index:9999;display:none;letter-spacing:0.5px;text-transform:uppercase;';
    document.body.appendChild(button);
    return button;
};

const initPwaInstallPrompt = () => {
    if (!window) return;

    let deferredPrompt = null;
    const installBtn = createInstallButton();

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installBtn.style.display = 'block';

        installBtn.onclick = async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        };
    });

    window.addEventListener('appinstalled', () => {
        installBtn.style.display = 'none';
        deferredPrompt = null;
    });
};

window.addEventListener('load', () => {
    registerServiceWorker();
    initPwaInstallPrompt();
});
