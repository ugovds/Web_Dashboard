/**
 * sw.js - Service Worker pour Violet Startpage (Mode Hors-Ligne & Cache Instantané PWA)
 */

const CACHE_NAME = 'violet-startpage-v9.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/base.css',
  './css/sidebar.css',
  './css/dashboard.css',
  './css/skeletons.css',
  './css/search.css',
  './css/bookmarks.css',
  './css/deck.css',
  './css/modals.css',
  './css/responsive.css',
  './css/themes/kanagawa.css',
  './css/themes/sakura.css',
  './css/themes/cyberdeck.css',
  './css/themes/retrowave.css',
  './css/themes/glass.css',
  './images/glass.svg',
  './js/themes.js',
  './js/appearance.js',
  './js/search.js',
  './js/bookmarks.js',
  './js/custom-hub.js',
  './js/command-palette.js',
  './js/shortcuts.js',
  './js/app.js',
  './images/gif.gif',
  './images/gif2.webp',
  './images/gif3.webp',
  './images/gif4.gif'
];

// Installation : pré-mise en cache des fichiers statiques optimisés
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache partiel lors de l\'installation:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation : nettoyage immédiat des anciens caches
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

// Interception des requêtes : Stale-While-Revalidate pour 0 ms de latence
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // Fichiers locaux : Network-First avec mise à jour du cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Polices & Font Awesome : Cache-First
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        });
      })
    );
  }
});
