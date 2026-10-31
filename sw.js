const CACHE_NAME = 'smart-garden-v4.8';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/i18n.js',
  './js/crops-data.js',
  './js/storage.js',
  './js/garden-map.js',
  './js/rotation-advisor.js',
  './js/app.js',
  './js/app-bed-modal.js',
  './js/app-views.js',
  './js/app-tools.js',
  './js/app-modals.js',
  './icon.png',
  './icon.ico',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

// Install: pre-cache all core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clear older caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-First strategy so users ALWAYS get the latest published code immediately!
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip chrome-extension, non-http(s), and external analytics (Yandex.Metrika)
  if (!url.protocol.startsWith('http') || url.hostname.includes('yandex.ru')) return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // Offline fallback: return cached version
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html', { ignoreSearch: true });
      }
      return caches.match(event.request, { ignoreSearch: true });
    })
  );
});
