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
  console.log('[SW] Background message received: ', payload);
  
  const notificationTitle = payload.notification?.title || 'PS Society';
  
  // ⭐ UNIVERSAL: Kisi bhi type ki notification ke liye kaam karega
  let tabName = payload.data?.tab || 'dashboard';
  let itemId = payload.data?.id || '';
  let itemType = payload.data?.type || ''; // poll, notice, complaint, event, visitor, etc.
  
  // ⭐ Deep link URL banayein - Sabhi types ke liye
  let clickAction = payload.data?.click_action || 'https://pssocietysolutions.github.io/ps-society-app/';
  
  if (!clickAction.includes('tab=')) {
    clickAction = `${clickAction}?tab=${tabName}`;
    if (itemId && itemType) {
      clickAction += `&${itemType}Id=${itemId}`;
    }
  }

  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: clickAction,
      tab: tabName,
      id: itemId,
      type: itemType
    },
    actions: [
      {
        action: 'open',
        title: '📂 Open'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ⭐ UNIVERSAL CLICK HANDLER - Sabhi notifications ke liye
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || 'https://pssocietysolutions.github.io/ps-society-app/';
  const tab = data.tab || 'dashboard';
  const id = data.id || '';
  const type = data.type || '';

  // ⭐ Ensure URL me tab parameter hai
  if (!targetUrl.includes('tab=')) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    targetUrl = `${targetUrl}${separator}tab=${tab}`;
    if (id && type) {
      targetUrl += `&${type}Id=${id}`;
    }
  }

  console.log('[SW] Opening URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url.includes('ps-society-app') && 'focus' in client) {
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