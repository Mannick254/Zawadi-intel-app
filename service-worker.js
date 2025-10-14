const cacheName = "zawadi-intel-v3";
const assets = [
  "/",
  "index.html",
  "app.html",
  "biography.html",
  "media.html",
  "legacy.html",
  "offline.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});


self.addEventListener("fetch", event => {
  // Runtime caching for images (network first, fallback to cache)
  if (event.request.destination === 'image') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const resClone = response.clone();
          caches.open(cacheName).then(cache => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // Default: cache first, then network, fallback to offline.html for navigation
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match("offline.html");
        }
      });
    })
  );
});

// Listen for skipWaiting message to allow manual cache refresh
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key.startsWith('zawadi-intel-') && key !== cacheName)
          .map(key => caches.delete(key))
      )
    )
  );
});
