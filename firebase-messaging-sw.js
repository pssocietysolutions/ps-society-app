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

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);
  const notificationTitle = payload.notification?.title || 'PS Society';
  
  // ✅ FIX: Use the correct app URL (root path)
  const clickAction = payload.data?.click_action || self.registration.scope || '/';

  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: 'icon-192.png',
    data: { 
      url: clickAction,
      ...payload.data 
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Notification Click Handler - opens PWA correctly
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || self.registration.scope || '/';

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then(windowClients => {
      // Try to focus existing client
      for (let client of windowClients) {
        if (client.url === targetUrl || client.url.includes(window.location.hostname)) {
          client.focus();
          // Navigate if needed
          if (client.url !== targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Open new window if none exists
      return clients.openWindow(targetUrl);
    })
  );
});