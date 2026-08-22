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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message: ', payload);

  const title = payload.notification?.title || payload.data?.title || "PS Society Alert";
  const options = {
    body: payload.notification?.body || payload.data?.body || "New update received.",
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let clickAction = data.click_action || '';

  const fullOrigin = self.location.origin;
  const pathname = self.location.pathname.replace('/firebase-messaging-sw.js', '').replace(/\/$/, ''); 
  
  let targetUrl = `${fullOrigin}${pathname}/`;
  if (clickAction) {
    if (clickAction.startsWith('?')) {
      targetUrl = `${fullOrigin}${pathname}/${clickAction}`;
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
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
