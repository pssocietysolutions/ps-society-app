// ============================================================
// PS SOCIETY SOLUTIONS – COMBINED PWA + FIREBASE MESSAGING SW
// WITH OFFLINE SUPPORT (Sub‑path: /ps-society-app/)
// ============================================================

const BASE_PATH = '/ps-society-app/';
const CACHE_VERSION = 'ps-society-v6';
const CACHE_NAME = CACHE_VERSION;

const APP_SHELL = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'offline.html',          // ✅ Offline page cached
    BASE_PATH + 'manifest.json',
    BASE_PATH + 'app.js',
    BASE_PATH + 'icon-192.png',
    BASE_PATH + 'icon-512.png',
    BASE_PATH + 'qr-payment.png'
];

// ============================================================
// FIREBASE
// ============================================================

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAEDLQQIhlkCGupdvjp8IQiEqv6miVlRVKk",
    authDomain: "ps-society-solutions.firebaseapp.com",
    projectId: "ps-society-solutions",
    storageBucket: "ps-society-solutions.firebasestorage.app",
    messagingSenderId: "345202451409",
    appId: "1:345202451409:web:d72246d863c4131e7036f0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log('[FCM] Background message:', payload);
    const title = payload.notification?.title || payload.data?.title || 'PS Society Solutions';
    const body = payload.notification?.body || payload.data?.body || 'You have a new notification.';
    const icon = payload.notification?.icon || BASE_PATH + 'icon-192.png';
    self.registration.showNotification(title, { body, icon, badge: icon, data: payload.data || {} });
});

self.addEventListener('notificationclick', function(event) {
    console.log('🔔 Notification clicked:', event.notification);
    event.notification.close();
    const data = event.notification.data || {};
    let urlToOpen = data.click_action || data.url || BASE_PATH;
    if (!urlToOpen.startsWith('http')) {
        const baseUrl = self.location.origin;
        if (urlToOpen.startsWith('/')) {
            urlToOpen = baseUrl + urlToOpen;
        } else {
            urlToOpen = baseUrl + BASE_PATH + urlToOpen;
        }
    }
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ============================================================
// INSTALL – Cache App Shell
// ============================================================

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// ============================================================
// ACTIVATE – Clean old caches
// ============================================================

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// ============================================================
// FETCH – SPA Navigation + Offline Fallback
// ============================================================

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Only intercept same-origin + sub‑path requests
    if (url.origin !== self.location.origin) return;
    if (!url.pathname.startsWith(BASE_PATH)) return;

    // ===== SPA NAVIGATION =====
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) return response;
                    console.warn('⚠️ Navigation got status:', response.status, '→ Falling back to index.html');
                    return caches.match(BASE_PATH + 'index.html');
                })
                .catch(() => {
                    // 🟢 Offline: Show offline page
                    return caches.match(BASE_PATH + 'offline.html');
                })
        );
        return;
    }

    // ===== Static Assets – Cache First =====
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) return cached;
                return fetch(request)
                    .then(response => {
                        if (response.status === 200 && response.type === 'basic') {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, clone));
                        }
                        return response;
                    })
                    .catch(() => {
                        return new Response('Resource not available offline', { status: 503 });
                    });
            })
    );
});
