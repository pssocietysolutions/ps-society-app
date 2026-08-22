// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAEDLQQIhlkCGupdvjp8IQiEqv6miVlRVk",
  authDomain: "ps-society-solutions.firebaseapp.com",
  projectId: "ps-society-solutions",
  storageBucket: "ps-society-solutions.firebasestorage.app",
  messagingSenderId: "345202451409",
  appId: "1:345202451409:web:d72246d863c4131e7036f0",
  measurementId: "G-8CZMXHWK5M"
});

const messaging = firebase.messaging();

// ✅ Background Notification Handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const title = payload.notification?.title || payload.data?.title || "PS Society Alert";
  const body = payload.notification?.body || payload.data?.body || "New society update.";

  let clickAction = payload.data?.click_action || payload.data?.url || '';
  if (!clickAction.startsWith('http')) {
    clickAction = 'https://pssocietysolutions.github.io/ps-society-app/' + clickAction;
  }

  const options = {
    body: body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: clickAction },
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(title, options);
});

// 🔥 Notification Click Handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  let targetUrl = data.url || 'https://pssocietysolutions.github.io/ps-society-app/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('pssocietysolutions.github.io/ps-society-app') && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ⚡ Force SW to activate immediately
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());