const CACHE_NAME = 'hidro-pwa-v1';
const BASE_PATH = '/prototipo-hidrop-nico/';

const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'src/estilo.css',
  BASE_PATH + 'src/script.js',
  // Add CDN resources you want cached for offline
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('✓ Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✓ Cache abierto');
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('⚠️ Algunos recursos no se cachearon:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('✓ Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('✓ Eliminando caché antiguo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de fetch híbrida
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  // Cache First para recursos estáticos locales
  if (url.pathname.startsWith(BASE_PATH + 'src/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('manifest.json') ||
      url.hostname === location.hostname) {
    
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        
        return fetch(request).then((response) => {
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        }).catch(() => {
          // Fallback para HTML principal
          if (request.destination === 'document') {
            return caches.match(BASE_PATH + 'index.html');
          }
          return new Response('Recurso no disponible offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
  } 
  // Network First para APIs dinámicas (Firebase)
  else if (url.hostname.includes('firebase') || url.hostname.includes('gstatic')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
  // CDN resources - Stale-while-revalidate
  else if (url.hostname.includes('cdn.jsdelivr') || 
           url.hostname.includes('cdnjs') ||
           url.hostname.includes('fonts.googleapis')) {
    event.respondWith(
      caches.open(CACHE_NAME + '-cdn').then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);
          
          return cached || fetchPromise;
        });
      })
    );
  }
});

// Notificaciones push (opcional)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Hidro', body: 'Actualización disponible' };
  
  const options = {
    body: data.body,
    icon: BASE_PATH + 'icons/icon-192.png',
    badge: BASE_PATH + 'icons/badge-72.png',
    tag: 'hidro-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-hidro-data') {
    event.waitUntil(
      // Aquí puedes agregar lógica para reintentar envíos pendientes
      console.log('✓ Sincronización de datos iniciada')
    );
  }
});

console.log('✓ Service Worker listo para:', BASE_PATH);

