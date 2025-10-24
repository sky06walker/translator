
const CACHE_NAME = 'gemini-kamus-v4'; // Bump version to trigger update with correct URLs

// These are the files that make up the "app shell".
// We want to cache them on install, including external dependencies.
const urlsToCache = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',

  // Icons
  '/logo192.png',
  '/logo512.png',

  // Local Modules
  '/index.tsx',
  '/App.tsx',
  '/services/geminiService.ts',
  '/types.ts',
  '/utils/audio.ts',
  '/components/ResultCard.tsx',
  '/components/icons/SearchIcon.tsx',
  '/components/icons/SpeakerIcon.tsx',
  '/components/icons/LoadingSpinner.tsx',

  // External Dependencies (from CDN and importmap) - CORRECTED URLs
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@19.2.0/index.js',
  'https://aistudiocdn.com/react@19.2.0/jsx-runtime.js',
  'https://aistudiocdn.com/react-dom@19.2.0/client.js',
  'https://aistudiocdn.com/@google/genai@1.26.0/dist/index.js'
];

// Install event: cache the app shell.
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell with dependencies');
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

// Fetch event: serve from cache, fall back to network, and cache new resources.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try to get the response from the cache.
      const cachedResponse = await cache.match(event.request);
      
      // If it's in the cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If it's not in the cache, fetch it from the network.
      try {
        const networkResponse = await fetch(event.request);
        
        // If the fetch was successful, clone it and store it in the cache.
        // We check the protocol to avoid caching chrome-extension:// requests.
        if (networkResponse.ok && event.request.url.startsWith('http')) {
          // Do not cache API calls to Google
          if (!event.request.url.includes('generativelanguage.googleapis.com')) {
             await cache.put(event.request, networkResponse.clone());
          }
        }
        
        return networkResponse;
      } catch (error) {
        // The network request failed, probably because the user is offline.
        console.error('Fetch failed; user may be offline:', error);
        // Let the browser handle the error, which will result in a standard offline error page.
        throw error;
      }
    })
  );
});
