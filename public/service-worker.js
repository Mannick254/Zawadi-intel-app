const STATIC_CACHE = "zawadi-intel-static-v4";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v4";

const STATIC_ASSETS = [
  "/", "/index.html", "/offline.html",
  "/assets/css/style.css", "/assets/css/layout.css", "/assets/css/theme.css",
  "/assets/js/index-feed.js", "/assets/js/notifications.js",
  "/assets/icons/icon-192.png", "/assets/icons/icon-512.png"
];

// Install: precache core assets
self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", event => {
  const keep = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (!keep.includes(k) ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

// Fetch: cache-first, then network with dynamic cache
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === "opaque") return resp;
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, resp.clone());
          return resp;
        });
      }).catch(() => {
        if (event.request.destination === "document") return caches.match("/offline.html");
        if (event.request.destination === "image") return caches.match("/assets/icons/icon-192.png");
      });
    })
  );
});

// Push: display notifications
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Zawadi Intel Update";
  const options = {
    body: data.body || "Breaking story just in...",
    icon: "/assets/icons/icon-192.png",
    badge: "/assets/icons/icon-192.png",
    data: { url: data.url || "/" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click: open target URL
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
