// ============================================================
// SERVICE WORKER FOR PS SOCIETY SOLUTIONS (PWA)
// ============================================================

const CACHE_VERSION = 'v4.2';
const CACHE_NAME = `ps-society-${CACHE_VERSION}`;

const APP_SHELL = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ============================================================
// INSTALL
// ============================================================

self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing:', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(APP_SHELL);
            })
            .then(() => {
                console.log('✅ App shell cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activated:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName.startsWith('ps-society-'))
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
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

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // --------------------------------------------------------
    // NAVIGATION / DEEP LINKS
    // --------------------------------------------------------

    if (request.mode === 'navigate') {

        event.respondWith(

            fetch(request)
                .then(response => {

                    // Normal successful page response
                    if (response.ok) {
                        return response;
                    }

                    // Server returned 404/500/etc.
                    console.warn(
                        '⚠️ Navigation failed:',
                        response.status,
                        request.url,
                        '→ Loading index.html'
                    );

                    return caches.match('./index.html');
                })

                .catch(error => {

                    console.warn(
                        '📴 Network unavailable:',
                        request.url,
                        '→ Loading cached index.html'
                    );

                    return caches.match('./index.html');
                })
        );

        return;
    }


    // --------------------------------------------------------
    // STATIC ASSETS
    // CACHE FIRST → NETWORK → CACHE NEW RESPONSE
    // --------------------------------------------------------

    event.respondWith(

        caches.match(request)
            .then(cachedResponse => {

                // Cache hit
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Cache miss → Network
                return fetch(request)
                    .then(networkResponse => {

                        // Only cache successful responses
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === 'basic'
                        ) {

                            const responseToCache =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return networkResponse;
                    });
            })
            .catch(() => {

                // Optional offline fallback for assets
                console.warn(
                    '❌ Asset unavailable offline:',
                    request.url
                );

                return new Response(
                    'Offline - resource unavailable',
                    {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: {
                            'Content-Type': 'text/plain'
                        }
                    }
                );
            })
    );
});
