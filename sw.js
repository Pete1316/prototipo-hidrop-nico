// Service Worker para PWA - Offline Support
const CACHE_NAME = 'sistema-hidroponico-v1';
const urlsToCache = [
  '/sistema-hidroponico/',
  '/sistema-hidroponico/index.html',
  '/sistema-hidroponico/manifest.json',
  '/sistema-hidroponico/src/estilo.css',
  '/sistema-hidroponico/src/script.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('✓ Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✓ Cache abierto');
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn('⚠️ Algunos recursos no se pudieron cachear:', err);
        // Continuar incluso si algunos no se cachean
      });
    })
  );
  // Activar inmediatamente (skip waiting)
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✓ Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('✓ Limpiando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control de todas las páginas inmediatamente
  return self.clients.claim();
});

// Estrategia Fetch: Cache First para estáticos, Network First para dinámicos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear peticiones no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Cache First para recursos estáticos
  if (url.pathname.includes('/src/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      }).catch(() => {
        // Si no hay conexión, devolver fallback
        return caches.match(request) || 
               new Response('No disponible offline', { status: 503 });
      })
    );
  } 
  // Network First para contenido dinámico (Firebase)
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla, intentar obtener del caché
          return caches.match(request) || 
                 new Response('No disponible offline', { status: 503 });
        })
    );
  }
});

// Manejo de notificaciones push (opcional)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/sistema-hidroponico/data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 192 192%22><rect fill=%22%23dc2626%22 width=%22192%22 height=%22192%22 rx=%2240%22/><text x=%2296%22 y=%2296%22 font-size=%22100%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-weight=%22bold%22>H</text></svg>',
    badge: '/sistema-hidroponico/data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 96 96%22><rect fill=%22%23dc2626%22 width=%2296%22 height=%2296%22/></svg>'
  };
  
  event.waitUntil(
    self.registration.showNotification('Sistema Hidropónico', options)
  );
});

// Sincronización en background (cuando vuelve la conexión)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      new Promise((resolve) => {
        console.log('✓ Sincronizando datos...');
        // Aquí iría la lógica de sincronización
        resolve();
      })
    );
  }
});

console.log('✓ Service Worker definido correctamente');

