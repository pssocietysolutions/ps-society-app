// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log("🔥 Service Worker Loaded Successfully!");

// ✅ GitHub Pages Base Path
const APP_BASE = '/ps-society-app/';

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

// ✅ Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  
  const notificationTitle = payload.data?.title || payload.notification?.title || 'PS Society';
  const notificationBody = payload.data?.body || payload.notification?.body || 'New update';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: APP_BASE + 'icon.png',
    badge: APP_BASE + 'icon.png',
    tag: payload.data?.tag || 'ps-notif',
    renotify: true,
    data: payload.data || {}
  });
});

// ✅ Notification Click Handler
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = data.click_action || data.url || data.deep_link || APP_BASE;

  // Absolute URL banao
  if (!urlToOpen.startsWith('http')) {
    const baseUrl = self.location.origin;
    urlToOpen = baseUrl + (urlToOpen.startsWith('/') ? urlToOpen : '/' + urlToOpen);
  }

  console.log('🌐 Opening URL:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1) Same origin ka koi window khula hai → focus + navigate
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }

      // 2) Warna naya window kholo
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});