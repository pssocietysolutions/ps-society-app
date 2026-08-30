// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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

// Background Message Handler
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  
  const title = payload.notification?.title || payload.data?.title || 'PS Society';
  const body = payload.notification?.body || payload.data?.body || 'New update';
  const icon = '/ps-society-app/icon-192.png';
  const data = payload.data || {};

  self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: icon,
    data: data
  });
});

// Notification Click Handler (Deep Linking WhatsApp/Facebook style)
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.click_action || data.url || '/ps-society-app/';

  // Absolute URL conversion for GitHub Pages sub-path
  if (!targetUrl.startsWith('http')) {
    const baseUrl = self.location.origin;
    if (targetUrl.startsWith('/')) {
      targetUrl = baseUrl + targetUrl;
    } else {
      targetUrl = baseUrl + '/ps-society-app/' + targetUrl;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('/ps-society-app/') && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});