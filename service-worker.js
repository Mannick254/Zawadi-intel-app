const STATIC_CACHE = "zawadi-intel-static-v1";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v1";

// Essential static assets
const STATIC_ASSETS = [
  "/index.html",
  "/offline.html",
  "/css/style.css",
  "/css/layout.css",
  "/assets/main.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.json"
];

// Install event — pre-cache essentials
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
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
  self.clients.claim();
});

// Fetch event — cache-first with dynamic fallback
self.addEventListener("fetch", event => {
  const req = event.request;

  // Skip extensions and non-GET requests
  if (
    req.url.startsWith("chrome-extension://") ||
    req.url.startsWith("moz-extension://") ||
    req.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(req)
        .then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === "opaque"
          ) {
            return networkResponse;
          }
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(req, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (req.destination === "document") {
            return caches.match("/offline.html");
          }
          if (req.destination === "image") {
            return caches.match("/icons/icon-192.png");
          }
        });
    })
  );
});

// Push event — notifications
self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "Zawadi Intel Update";
  const options = {
    body: data.body || "Breaking story just in...",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Read more" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener("notificationclick", event => {
  event.notification.close();

  if (event.action === "dismiss") {
    return; // do nothing
  }

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
