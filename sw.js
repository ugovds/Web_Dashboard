/**
 * sw.js - Service Worker pour Violet Startpage (Mode Hors-Ligne & Cache PWA)
 */

const CACHE_NAME = 'violet-startpage-v4.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/base.css',
  './css/sidebar.css',
  './css/dashboard.css',
  './css/clock.css',
  './css/search.css',
  './css/bookmarks.css',
  './css/calendar.css',
  './css/tasks.css',
  './css/weather.css',
  './css/feeds.css',
  './css/markets.css',
  './css/deck.css',
  './css/widgets.css',
  './css/modals.css',
  './css/responsive.css',
  './css/themes/kanagawa.css',
  './css/themes/sakura.css',
  './css/themes/cyberdeck.css',
  './css/themes/retrowave.css',
  './js/themes.js',
  './js/appearance.js',
  './js/clock.js',
  './js/weather-fx.js',
  './js/weather.js',
  './js/calendar.js',
  './js/tasks.js',
  './js/search.js',
  './js/feeds.js',
  './js/bookmarks.js',
  './js/markets.js',
  './js/widgets.js',
  './js/custom-hub.js',
  './js/command-palette.js',
  './js/shortcuts.js',
  './js/app.js',
  './js/tasks.js',
  './js/search.js',
  './js/feeds.js',
  './js/bookmarks.js',
  './js/widgets.js',
  './js/custom-hub.js',
  './js/command-palette.js',
  './js/shortcuts.js',
  './js/app.js',
  './images/gif.gif',
  './images/gif2.gif',
  './images/gif3.gif',
  './images/gif4.gif'
];

// Installation : mise en cache des fichiers statiques
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

// Interception des requêtes réseau :
// Network-First pour les assets locaux pour voir instantanément les mises à jour sans bloquer sur l'ancien cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Requêtes non-GET ignorées
  if (event.request.method !== 'GET') return;

  // Assets locaux : Network-First avec repli sur cache si hors-ligne
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // APIs externes (wttr.in, feeds, coingecko) : Network-First avec repli sur cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
