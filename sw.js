// ============================================================
// PS SOCIETY SOLUTIONS
// COMBINED PWA + FIREBASE MESSAGING SERVICE WORKER
// ============================================================

const CACHE_VERSION = 'ps-society-v5';
const CACHE_NAME = CACHE_VERSION;

const BASE_PATH = '/ps-society-app/';

const APP_SHELL = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'manifest.json',
    BASE_PATH + 'app.js',
    BASE_PATH + 'icon-192.png',
    BASE_PATH + 'icon-512.png'
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

    console.log(
        '[FCM] Background message:',
        payload
    );

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
        `${BASE_PATH}icon-192.png`;

    self.registration.showNotification(
        title,
        {
            body: body,
            icon: icon,
            badge: icon,
            data: payload.data || {}
        }
    );

});


// ============================================================
// NOTIFICATION CLICK
// ============================================================

self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = data.click_action || data.url || '/';

  // ✅ पूरा URL (Absolute) बनाएँ – Dynamic Origin
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
// FETCH
// ============================================================

self.addEventListener('fetch', event => {

    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);

    if (
        url.origin !== self.location.origin ||
        !url.pathname.startsWith(BASE_PATH)
    ) {
        return;
    }


    // ========================================================
    // DEEP LINK / SPA NAVIGATION
    // ========================================================

    if (request.mode === 'navigate') {

        event.respondWith(

            fetch(request)
                .then(response => {

                    // Normal page
                    if (response.ok) {
                        return response;
                    }

                    // GitHub Pages 404 → index.html
                    return caches.match(
                        BASE_PATH + 'index.html'
                    );

                })
                .catch(() => {

                    return caches.match(
                        BASE_PATH + 'index.html'
                    );

                })

        );

        return;
    }


    // ========================================================
    // STATIC FILES
    // ========================================================

    event.respondWith(

        caches.match(request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(request)
                    .then(response => {

                        if (
                            response.status === 200 &&
                            response.type === 'basic'
                        ) {

                            const clone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        clone
                                    );

                                });

                        }

                        return response;

                    });

            })

    );

});
