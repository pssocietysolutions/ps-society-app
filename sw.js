// ============================================================
// PS SOCIETY SOLUTIONS
// COMBINED PWA + FIREBASE MESSAGING SERVICE WORKER
// ============================================================

const CACHE_VERSION = 'ps-society-v6';  // Version बढ़ाएँ
const CACHE_NAME = CACHE_VERSION;

// ✅ Root Path – Firebase Hosting पर App Root पर है
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/app.js',
    '/icon-192.png',
    '/icon-512.png'
];


// ============================================================
// FIREBASE
// ============================================================

importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js'
);
importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
);

firebase.initializeApp({
    apiKey: "AIzaSyAEDLQQIhlkCGupdvjp8IQiEqv6miVlRVKk",
    authDomain: "ps-society-solutions.firebaseapp.com",
    projectId: "ps-society-solutions",
    storageBucket: "ps-society-solutions.firebasestorage.app",
    messagingSenderId: "345202451409",
    appId: "1:345202451409:web:d72246d863c4131e7036f0"
});

const messaging = firebase.messaging();

// ============================================================
// FIREBASE BACKGROUND NOTIFICATION
// ============================================================

messaging.onBackgroundMessage(payload => {
    console.log('[FCM] Background message:', payload);

    const title =
        payload.notification?.title ||
        payload.data?.title ||
        'PS Society Solutions';

    const body =
        payload.notification?.body ||
        payload.data?.body ||
        'You have a new notification.';

    const icon =
        payload.notification?.icon ||
        '/icon-192.png';

    self.registration.showNotification(title, {
        body: body,
        icon: icon,
        badge: icon,
        data: payload.data || {}
    });
});

// ============================================================
// NOTIFICATION CLICK – ✅ सही (Dynamic URL)
// ============================================================

self.addEventListener('notificationclick', function(event) {
    console.log('🔔 Notification clicked:', event.notification);
    event.notification.close();

    const data = event.notification.data || {};
    let urlToOpen = data.click_action || data.url || '/';

    if (!urlToOpen.startsWith('http')) {
        const baseUrl = self.location.origin;
        urlToOpen = baseUrl + urlToOpen;
    }

    console.log('🔗 Opening URL:', urlToOpen);

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
// INSTALL
// ============================================================

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// ============================================================
// ACTIVATE
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
// FETCH – ✅ SPA Navigation Fallback (कोई BASE_PATH नहीं)
// ============================================================

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method !== 'GET') return;

    // ====== SPA NAVIGATION (Deep Links) ======
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // अगर Response OK है तो Return करें
                    if (response.ok) {
                        return response;
                    }
                    // 404 → index.html
                    console.warn('⚠️ Navigation got status:', response.status, '→ Falling back to index.html');
                    return caches.match('/index.html');
                })
                .catch(() => {
                    // Network Fail → index.html
                    return caches.match('/index.html');
                })
        );
        return;
    }

    // ====== Static Assets (CSS, JS, Images) – Cache First ======
    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    return cached;
                }
                return fetch(request)
                    .then(response => {
                        if (response.status === 200 && response.type === 'basic') {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, clone));
                        }
                        return response;
                    });
            })
    );
});
