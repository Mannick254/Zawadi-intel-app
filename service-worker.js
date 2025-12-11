const CACHE_NAME = "zawadi-intel-cache-v2";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v2";

// Static files to cache at install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/layout.css",
  "/css/theme.css",
  "/global.html",
  "/africa.html",
  "/biography.html",
  "/media.html",
  "/books.html",
  "/app.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/search.html",
  "/articles_list.txt",
  "/offline.html",
  "/css/articles.css",
  "/js/index-feed.js"
];

// Install event — pre-cache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event — serve from cache, update dynamically
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Serve cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network and cache dynamically
      return fetch(event.request).then(networkResponse => {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request.url, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Optional: fallback page when offline
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }
      });
    })
  );
});

// Activate event — clean old caches
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Push event — handle incoming notifications
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Zawadi Intel Update";
  const options = {
    body: data.body || "Breaking story just in...",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png"
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
