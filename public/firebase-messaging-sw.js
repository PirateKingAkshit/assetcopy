console.log('SW Loaded ✅')
self.addEventListener('install', () => console.log('SW Installed ✅'))
self.addEventListener('activate', () => console.log('SW Activated ✅'))

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAz0cITqUU-EZo6WmIbBFpHEVQbzdWLvxE',
  authDomain: 'betterbet-ios-2fb66.firebaseapp.com',
  projectId: 'betterbet-ios-2fb66',
  storageBucket: 'betterbet-ios-2fb66.firebasestorage.app',
  messagingSenderId: '489236606308',
  appId: '1:489236606308:web:705ad78dbc2f7702965e71'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  console.log('📩 Background notification received:', payload)

  const { title, body, icon } = payload.notification || {}

  self.registration.showNotification(title || 'New Message', {
    body: body || 'You have a new notification',
    icon: icon || '/icon.png',
    data: payload.data || {}
  })
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(clients.openWindow(url))
})
