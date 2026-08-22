// ============================================================
// SERVICE WORKER FOR PS SOCIETY SOLUTIONS (PWA)
// ============================================================

const CACHE_VERSION = 'v4.2';
const CACHE_NAME = `ps-society-${CACHE_VERSION}`;

const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  // Bootstrap
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',

  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',

  // jsPDF
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',

  // jsPDF AutoTable
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// ============================================================
// INSTALL
// ============================================================

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('✅ Service Worker: Cache opened');
        // Cache files individually so one failed CDN request
        // does NOT break the entire Service Worker installation.
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
            console.log(`✅ Cached: ${url}`);
          } catch (error) {
            console.warn(`⚠️ Could not cache: ${url}`, error);
          }
        }
      })
      .then(() => {
        // Activate the new Service Worker immediately
        return self.skipWaiting();
      })
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
          cacheNames.map(cacheName => {
            if (
              cacheName.startsWith('ps-society-') &&
              cacheName !== CACHE_NAME
            ) {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        // Take control of all open pages immediately
        return self.clients.claim();
      })
  );
});

// ============================================================
// FETCH - SPA 404 FALLBACK FIX (✅ यहाँ बदलाव किया गया है)
// ============================================================

self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // ===== SPECIAL HANDLING FOR NAVIGATION (Deep Links) =====
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // ✅ अगर Response OK (200-299) है, तो उसे Return करें
          if (response.ok) {
            return response;
          }
          // ❌ अगर 404 या कोई और Error Status है → index.html दें
          console.warn('⚠️ Navigation returned status:', response.status, '→ Falling back to index.html');
          return caches.match('./index.html');
        })
        .catch(() => {
          // ✅ Network पूरी तरह Fail (ऑफलाइन) → index.html दें
          return caches.match('./index.html');
        })
    );
    return;
  }

  // ===== ASSETS (CSS, JS, Images) – Cache First, Then Network =====
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then(networkResponse => {
            // Only cache successful responses
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== 'opaque'
            ) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.warn('⚠️ Network request failed:', request.url, error);
            // Offline fallback for HTML pages
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            // If no cached response exists, return a proper offline response
            return new Response(
              'You are currently offline.',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'text/plain'
                }
              }
            );
          });
      })
  );
});

// ============================================================
// MESSAGE
// ============================================================

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================
// OPTIONAL: CLEAN OLD CACHE ON MESSAGE
// ============================================================

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          console.log('🧹 Current cache cleared');
        })
    );
  }
});
