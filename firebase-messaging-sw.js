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

// ✅ Background Message Handler (सिर्फ एक बार)
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  
  // 🟢 अगर Firebase ने पहले ही नोटिफिकेशन भेज दिया है, तो दोबारा न दिखाएं (डबल और background update रुक जाएगा)
  if (payload.notification) {
    return;
  }

  const notificationTitle = payload.data?.title || 'PS Society';
  const notificationBody = payload.data?.body || 'New update';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/icon-192.png',
    data: payload.data || {}
  });
});

// ✅ Notification Click Handler
// ✅ Notification Click Handler (Smart Tab Redirection)
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data || {};
  const title = (event.notification.title || '').toLowerCase();
  const body = (event.notification.body || '').toLowerCase();

  // 1. पहले deep_link चेक करें, फिर click_action, फिर url
  let urlToOpen = data.deep_link || data.click_action || data.url || '';

  // 🎯 2. अगर पेमेंट से जुड़ा नोटिफिकेशन है तो जबरन Dashboard पर भेजें
  if (
    title.includes('payment') || 
    title.includes('verified') || 
    title.includes('reject') || 
    body.includes('payment') || 
    body.includes('verify')
  ) {
    urlToOpen = '/?tab=dashboard&section=myPaymentSubmissionsCard';
  } 
  // अगर कोई URL नहीं मिला तो डिफ़ॉल्ट Dashboard
  else if (!urlToOpen || urlToOpen === '/') {
    urlToOpen = '/?tab=dashboard';
  }

  // पूरा यूआरएल बनाएं
  if (!urlToOpen.startsWith('http')) {
    urlToOpen = self.location.origin + urlToOpen;
  }

  // 3. विंडो ओपन या फोकस करें
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
