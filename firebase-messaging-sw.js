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

// 1. Double notification fix: Agar payload me notification object nahi hai tabhi manual show karein
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message: ', payload);
  
  if (!payload.notification) {
    const title = payload.data?.title || "PS Society Notification";
    const options = {
      body: payload.data?.body || "New update received.",
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: payload.data || {}
    };
    self.registration.showNotification(title, options);
  }
});

// 2. 404 Error Fix & Deep Linking
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let clickAction = data.click_action || '';

  const fullOrigin = self.location.origin;
  const pathname = self.location.pathname.replace('/firebase-messaging-sw.js', ''); 
  
  let targetUrl = `${fullOrigin}${pathname}/index.html`;
  if (clickAction) {
    if (clickAction.startsWith('?')) {
      targetUrl = `${fullOrigin}${pathname}/index.html${clickAction}`;
    } else if (clickAction.startsWith('/')) {
      targetUrl = `${fullOrigin}${pathname}${clickAction}`;
    } else {
      targetUrl = `${fullOrigin}${pathname}/${clickAction}`;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(fullOrigin + pathname) && 'focus' in client) {
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
