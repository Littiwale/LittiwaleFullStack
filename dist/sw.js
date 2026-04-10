const CACHE_NAME = 'littiwale-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/style.css',
    '/images/logo.png',
    '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 PWA: Caching basic static assets (Safe Mode)');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Fetch Event (Network First for safety, Caching for static assets only)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-static assets (API/Firestore/Dynamic)
    if (!STATIC_ASSETS.includes(url.pathname)) {
        return;
    }

    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
