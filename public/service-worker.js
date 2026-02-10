// Service Worker para Mystery Hunter
// Permite notificaciones y vibración con el móvil en el bolsillo

const CACHE_NAME = 'mystery-hunter-v1';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  event.waitUntil(clients.claim());
});

// Escuchar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PROXIMITY_ALERT') {
    const { title, body, mystery } = event.data;
    
    // Mostrar notificación con vibración
    self.registration.showNotification(title, {
      body: body,
      icon: '/assets/logoMistery.png',
      badge: '/assets/locked.png',
      vibrate: [200, 100, 200, 100, 200], // Patrón más notorio
      tag: `proximity-${mystery.id}`,
      requireInteraction: false,
      silent: false,
      data: { mysteryId: mystery.id }
    });
  }
});

// Cuando hacen click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfócala
      for (let client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva ventana
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});