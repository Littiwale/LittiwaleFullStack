/**
 * 🌙 LITTI WALE PHASE 2: PERMANENT DARK MODE & GLOBAL LOCATION SWITCHER
 * Enforces permanent dark mode and manages Cloud Kitchen vs Physical Outlet state.
 */

const THEME_STORAGE_KEY = 'littiwale_theme';

const enforceDarkMode = () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#0d0d0d';
};

const initLocationSwitcher = () => {
    const locBtn = document.getElementById('nav-location-btn');
    const locDropdown = document.getElementById('nav-location-dropdown');
    const locLabel = document.getElementById('nav-location-label');

    console.log('[Location Switcher] Initializing...', { locBtn, locDropdown, locLabel });
    if (!locBtn || !locDropdown || !locLabel) {
        // Silently return if elements are missing (e.g., on Admin/Rider panels)
        return;
    }

    // Load initial state
    const currentLoc = localStorage.getItem('selectedLocation') || 'cloud';
    console.log('[Location Switcher] Current location:', currentLoc);
    localStorage.setItem('selectedLocation', currentLoc);
    locLabel.textContent = currentLoc === 'outlet' ? 'Physical Outlet' : 'Cloud Kitchen';

    // Toggle dropdown
    locBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = locDropdown.classList.contains('open');
        if (isOpen) {
            locDropdown.classList.remove('open');
            locBtn.setAttribute('aria-expanded', 'false');
        } else {
            locDropdown.classList.add('open');
            locBtn.setAttribute('aria-expanded', 'true');
        }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!locBtn.contains(e.target) && !locDropdown.contains(e.target)) {
            locDropdown.classList.remove('open');
            locBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Select location option
    document.querySelectorAll('.lw-loc-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const newLoc = option.getAttribute('data-loc');
            localStorage.setItem('selectedLocation', newLoc);
            locLabel.textContent = newLoc === 'outlet' ? 'Physical Outlet' : 'Cloud Kitchen';
            locDropdown.classList.remove('open');
            locBtn.setAttribute('aria-expanded', 'false');

            console.log(`[Location Switcher] Changed to: ${newLoc}`);
            window.dispatchEvent(new CustomEvent('lw_location_changed', { detail: { location: newLoc } }));

            // If on menu page or storefront, trigger re-render
            const path = window.location.pathname;
            const isMenu = path.includes('menu') || path.includes('menu.html');
            const isHome = path === '/' || path.includes('index.html') || path.includes('customer');
            
            if (isMenu || isHome) {
                if (typeof window.refreshMenuGrid === 'function') {
                    window.refreshMenuGrid();
                } else {
                    window.location.reload();
                }
            }
        });
    });
};

const initAll = () => {
    enforceDarkMode();
    initLocationSwitcher();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
