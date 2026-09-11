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

// firebase-messaging-sw.js में यह कोड अपडेट करें

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  
  const notificationTitle = payload.data?.title || payload.notification?.title || 'PS Society';
  const notificationBody = payload.data?.body || payload.notification?.body || 'New update';
  
  // डेटा से तय करें कौन सा टैब खोलना है (जैसे polls, notices आदि)
  const targetTab = payload.data?.tab || 'dashboard';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/icon-192.png',
    data: { ...payload.data, tab: targetTab }
  });
});

self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  
  // 🟢 FIX: अगर डेटा में tab दिया है तो उसी टैब का URL बनाएं, वरना डिफ़ॉल्ट होम
  let relativePath = data.tab ? `/?tab=${data.tab}` : (data.click_action || data.url || '/');
  const urlToOpen = new URL(relativePath, self.location.origin).href;

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