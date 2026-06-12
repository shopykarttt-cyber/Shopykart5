
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBvt1UJZN0zMTGJi-XslILBjSO7bbru9U4",
  authDomain: "studio-9409412291-7e891.firebaseapp.com",
  projectId: "studio-9409412291-7e891",
  storageBucket: "studio-9409412291-7e891.firebasestorage.app",
  messagingSenderId: "111802176671",
  appId: "1:111802176671:web:fe4cf15dd067fa82107eaa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
