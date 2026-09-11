// ==================== firebase-messaging-sw.js ====================
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log("🔥 Service Worker Loaded Successfully!");

// 🟢 नया कोड तुरंत एक्टिवेट करने के लिए (पुरानी कैश हट जाएगी)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

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
  
  // 🟢 1. अगर Firebase ने पहले ही नोटिफिकेशन दिखा दिया है, तो दोबारा न दिखाएं (डबल बंद)
  if (payload.notification) {
    return;
  }

  const notificationTitle = payload.data?.title || 'PS Society';
  const notificationBody = payload.data?.body || 'New update';

  // 🟢 2. 'return' लगाना अनिवार्य है ताकि Chrome को प्रॉमिस मिले और वो 'updated in background' न दिखाए
  return self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'ps-society-alert', // डुप्लीकेट रोक देगा
    renotify: true,
    data: payload.data || {}
  });
});

// ✅ Notification Click Handler (सीधे Dashboard ले जाने के लिए)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  const title = (event.notification.title || '').toLowerCase();
  const body = (event.notification.body || '').toLowerCase();

  let urlToOpen = data.deep_link || data.click_action || data.url || '';

  // अगर पेमेंट वेरिफ़िकेशन / रिजेक्शन है तो सीधे Dashboard पर ले जाएं
  if (
    title.includes('payment') || 
    title.includes('verified') || 
    title.includes('reject') || 
    body.includes('payment') || 
    body.includes('verify')
  ) {
    urlToOpen = '/?tab=dashboard&section=myPaymentSubmissionsCard';
  } else if (!urlToOpen || urlToOpen === '/') {
    urlToOpen = '/?tab=dashboard';
  }

  if (!urlToOpen.startsWith('http')) {
    urlToOpen = self.location.origin + urlToOpen;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if ('navigate' in client) {
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
