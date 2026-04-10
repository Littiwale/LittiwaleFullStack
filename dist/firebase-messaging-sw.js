importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDEgXj63A1Ut0ldXLJmM9QRmtGeh66KAmw",
  projectId: "littiwale-90990",
  messagingSenderId: "937555170322",
  appId: "1:937555170322:web:c31008dac8833c308eb4cb"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
