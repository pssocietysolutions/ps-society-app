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

// ✅ Sirf ek single notification show hoga
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message: ', payload);
  const data = payload.data || {};
  const notificationTitle = data.title || payload.notification?.title || "PS Society Alert";
  const notificationOptions = {
    body: data.body || payload.notification?.body || "New society update.",
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 Notification Click Handler (404 error fix)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  let clickAction = data.click_action || '';

  // GitHub repository subfolder handle karega
  const scopePath = self.registration.scope; // e.g. https://pssocietysolutions.github.io/ps-society-app/
  let urlToOpen = new URL(clickAction, scopePath).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if ('focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});