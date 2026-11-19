/**
 * sw.js - Service Worker pour Violet Startpage (Mode Hors-Ligne & Cache Instantané 0 ms)
 */

const CACHE_NAME = 'violet-startpage-v11.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/fonts.css',
  './css/fontawesome.min.css',
  './css/base.css',
  './css/dashboard.css',
  './css/search.css',
  './css/bookmarks.css',
  './css/modals.css',
  './css/responsive.css',
  './css/themes/glass.css',
  './fonts/inter-latin.woff2',
  './fonts/jetbrains-mono-latin.woff2',
  './fonts/orbitron-latin.woff2',
  './webfonts/fa-solid-900.woff2',
  './webfonts/fa-brands-400.woff2',
  './webfonts/fa-regular-400.woff2',
  './images/glass.svg',
  './images/gif.gif',
  './images/gif2.webp',
  './images/gif3.webp',
  './images/gif4.gif',
  './js/themes.js',
  './js/appearance.js',
  './js/search.js',
  './js/bookmarks.js',
  './js/custom-hub.js',
  './js/command-palette.js',
  './js/shortcuts.js',
  './js/app.js'
];

// Installation : mise en cache immédiate de tous les fichiers locaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache partiel lors de l\'installation:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage instantané des anciens caches
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

// Interception : Stale-While-Revalidate pour un affichage en 0 ms
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // Fichiers locaux : Cache-First avec rafraîchissement en arrière-plan (0 ms immédiat)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Autres requêtes éventuelles : Cache-First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
