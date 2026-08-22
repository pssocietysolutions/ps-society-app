// ============================================================
// SERVICE WORKER FOR PS SOCIETY SOLUTIONS (PWA)
// ============================================================

const CACHE_VERSION = 'v4.1';  // v3 → v4
const CACHE_NAME = `ps-society-${CACHE_VERSION}`;

const urlsToCache = [
  '.',
  'index.html',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
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
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      return self.clients.claim();
    })
  );
});

// ===== FETCH (Modified – SPA Navigation Fallback Added) =====
self.addEventListener('fetch', event => {
  // ✅ अगर यह Navigation Request है (नया पेज माँगना)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Network से मिला तो Return करें
          return response;
        })
        .catch(() => {
          // Network Fail → Cache से index.html Return करें (404 खत्म)
          return caches.match('index.html');
        })
    );
  } else {
    // ✅ बाकी Requests (CSS, JS, Images) – पहले Cache फिर Network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});

// ===== MESSAGE (Skip Waiting) =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
