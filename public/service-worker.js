const STATIC_CACHE = "zawadi-intel-static-v5";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v5";

const STATIC_ASSETS = [
  "/", "/index.html", "/offline.html",
  "/css/style.css", "/css/layout.css", "/css/theme.css",
  "/js/index-feed.js", "/js/notifications.js",
  "/icons/icon-192.png", "/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.error("Failed to precache:", err))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  const keep = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (!keep.includes(k) ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxItems);
  }
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(resp => {
          if (!resp || resp.status !== 200 || resp.type !== "basic") return resp;
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, resp.clone());
            limitCacheSize(DYNAMIC_CACHE, 50);
            return resp;
          });
        })
        .catch(() => {
          if (event.request.destination === "document") return caches.match("/offline.html");
          if (event.request.destination === "image") return caches.match("/icons/icon-192.png");
        });
    })
  );
});

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

self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;

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
