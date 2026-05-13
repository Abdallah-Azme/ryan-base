
/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyAYnxNyTXGTFoc326t3etbRiLgGHNV-QZk",
  authDomain: "gen-lang-client-0866692767.firebaseapp.com",
  projectId: "gen-lang-client-0866692767",
  storageBucket: "gen-lang-client-0866692767.firebasestorage.app",
  messagingSenderId: "279685047132",
  appId: "1:279685047132:web:f24a542355e851fd851799",
  measurementId: "G-JNGZ44RR2R"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.png',
    // We can add the sound file here if hosted
    // sound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
