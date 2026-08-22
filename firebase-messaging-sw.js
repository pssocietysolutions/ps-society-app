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

// ✅ FIXED: payload.data को notification options में pass करें
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || "PS Society";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "New update",
    icon: '/icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 Notification Click Handler
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  // अब data available होगा
  const data = event.notification.data || {};
  let urlToOpen = data.click_action || data.url || '/';

  if (!urlToOpen.startsWith('http')) {
    const baseUrl = self.location.origin;
    urlToOpen = baseUrl + urlToOpen;
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
