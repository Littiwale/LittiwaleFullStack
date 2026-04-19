importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// This service worker intentionally avoids embedding hardcoded Firebase credentials.
// Firebase Cloud Messaging background handling is disabled until env-safe config is available.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  console.log('[firebase-messaging-sw.js] message received:', event.data);
});

// Background message handling is currently disabled in this build.
