const CACHE_NAME = 'gemini-kamus-v5'; // Bump version for the build update

// These are the files that make up the "app shell".
const urlsToCache = [
  // App Shell & Assets
  '/',
  '/index.html',
  '/manifest.json',
  '/bundle.js', // Cache the bundled JS instead of source files
  '/sw.js',
  '/icon-192.svg',
  '/icon-512.svg',

  // External Dependencies
  'https://cdn.tailwindcss.com'
];

// Install event: cache the app shell.
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache all resources:', err);
      })
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients.
  );
});

// Fetch event: serve from cache, fall back to network.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});