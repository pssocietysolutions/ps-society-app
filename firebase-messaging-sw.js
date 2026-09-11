// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log("🔥 Service Worker Loaded Successfully!");

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
  
  // एज फंक्शन से आने वाले data या notification दोनों से वैल्यू सुरक्षित रूप से निकालें
  const notificationTitle = payload.data?.title || payload.notification?.title || 'PS Society';
  const notificationBody = payload.data?.body || payload.notification?.body || 'New update';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/icon-192.png',
    data: payload.data || {}
  });
});

// ✅ Notification Click Handler (Direct Tab Redirection Fix)
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = data.click_action || data.url || '/';

  // यदि click_action में 상대 पाथ (relative path) है तो उसे सही से बेस यूआरएल के साथ जोड़ें
  if (!urlToOpen.startsWith('http')) {
    const baseUrl = self.location.origin;
    urlToOpen = baseUrl + (urlToOpen.startsWith('/') ? '' : '/') + urlToOpen;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
