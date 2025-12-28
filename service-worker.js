const STATIC_CACHE = "zawadi-intel-static-v4";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v4";

// Static files to cache at install
const STATIC_ASSETS = [
  /* DYNAMIC_CACHE_LIST */
];

// Install event — pre-cache static assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Activate new SW immediately
});

// Activate event — clean old caches
self.addEventListener("activate", event => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Control all clients without reload
});

// Fetch event — cache-first with dynamic fallback
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return; // Only cache GET requests

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then(networkResponse => {
        // Avoid caching opaque responses (e.g., cross-origin without CORS)
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === "opaque") {
          return networkResponse;
        }

        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Offline fallbacks
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }
        if (event.request.destination === "image") {
          return caches.match("/icons/icon-192.png");
        }
      });
    })
  );
});

// Push event — handle incoming notifications
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Zawadi Intel Update";
  const options = {
    body: data.body || "Breaking story just in...",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" } // optional click-through URL
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event — open relevant page
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
