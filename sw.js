// sw.js – PWA Service Worker

const CACHE_NAME = 'ps-society-v1';   // जब भी assets बदलें, v1 को v2 करें
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/firebase-messaging-sw.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/bg.jpeg',
  '/qr-payment.png'
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // नया SW तुरंत Activate करें
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ पुराना Cache हटाया:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // सभी Clients पर Control लें
      return self.clients.claim();
    })
  );
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache में मिला → वही Return करें
        if (response) {
          return response;
        }
        // Cache में नहीं मिला → Network से Fetch करें
        return fetch(event.request)
          .then(networkResponse => {
            // नए Assets को Cache में डालें (वैकल्पिक)
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network भी फेल → SPA के लिए index.html Return करें (404 खत्म)
            return caches.match('/index.html');
          });
      })
  );
});
