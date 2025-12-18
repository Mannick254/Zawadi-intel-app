const STATIC_CACHE = "zawadi-intel-static-v4";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v4";

// Static files to cache at install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/layout.css",
  "/css/theme.css",
  "/global.html",
  "/articles/africa.html",
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
  "/js/index-feed.js",
  "/public/articles/africa-business.html",
  "/public/articles/africa-climate.html",
  "/public/articles/africa.html",
  "/public/articles/aids-day.html",
  "/public/articles/amazon-ai-chip.html",
  "/public/articles/article11.html",
  "/public/articles/article12.html",
  "/public/articles/article13.html",
  "/public/articles/article15.html",
  "/public/articles/article17.html",
  "/public/articles/article19.html",
  "/public/articles/article8.html",
  "/public/articles/article9.html",
  "/public/articles/asia-floods.html",
  "/public/articles/bahati-family.html",
  "/public/articles/bishop-kiengei.html",
  "/public/articles/breakthroughs-in-global-health.html",
  "/public/articles/cop30-outcomes.html",
  "/public/articles/cyber-utilities.html",
  "/public/articles/eac-fgm-law.html",
  "/public/articles/eastafrica-instability.html",
  "/public/articles/emerging-economies-drive-global-growth.html",
  "/public/articles/epl-chelsea.html",
  "/public/articles/epl-villa.html",
  "/public/articles/europe-defense.html",
  "/public/articles/europe-russia.html",
  "/public/articles/factory-farming.html",
  "/public/articles/gates-foundation.html",
  "/public/articles/gaza-aid.html",
  "/public/articles/genz-politics.html",
  "/public/articles/global-ai.html",
  "/public/articles/global-aid.html",
  "/public/articles/global-debate-on-ai-regulation.html",
  "/public/articles/global-festivals-celebrate-diversity.html",
  "/public/articles/global-markets.html",
  "/public/articles/global-un.html",
  "/public/articles/haiti-mission.html",
  "/public/articles/japan-earthquake.html",
  "/public/articles/kenya-gdp.html",
  "/public/articles/kenya-health.html",
  "/public/articles/kenya-politics.html",
  "/public/articles/kenya-sports.html",
  "/public/articles/kisii-airbus.html",
  "/public/articles/lebanon-israel-talks.html",
  "/public/articles/middle-east-energy.html",
  "/public/articles/middle-east-security.html",
  "/public/articles/middleeast-drones.html",
  "/public/articles/nairobi-football.html",
  "/public/articles/nairobi-gangs.html",
  "/public/articles/nairobi-matatus.html",
  "/public/articles/nakuru-industry.html",
  "/public/articles/new-era-of-space-exploration.html",
  "/public/articles/nigeria-power.html",
  "/public/articles/pdiddy-netflix.html",
  "/public/articles/polar-vortex.html",
  "/public/articles/raila-bodyguard.html",
  "/public/articles/ruto-wedding.html",
  "/public/articles/siaya-doctors.html",
  "/public/articles/tennessee-election.html",
  "/public/articles/uda-odm.html",
  "/public/articles/ukraine-energy.html",
  "/public/articles/us-defense-survey.html",
  "/public/articles/voter-mobilization.html",
  "/public/articles/westafrica-drugs.html",
  "/public/articles/wmo-warning.html",
  "/public/articles/world-leaders-gather-for-climate-summit.html",
  "/public/articles/zoho-eastafrica.html",
  "/public/images/Copilot_20251209_132001.png",
  "/public/images/Copilot_20251209_132050.png",
  "/public/images/Copilot_20251209_132406.png",
  "/public/images/Copilot_20251209_132420.png",
  "/public/images/Copilot_20251212_160553.png",
  "/public/images/Copilot_20251213_124157.png",
  "/public/images/Copilot_20251213_144107.png",
  "/public/images/Copilot_20251213_144113.png",
  "/public/images/Copilot_20251213_144124.png",
  "/public/images/Copilot_20251213_152435.png",
  "/public/images/Copilot_20251213_165740.png",
  "/public/images/Copilot_20251213_224355.png",
  "/public/images/Copilot_20251214_142648.png",
  "/public/images/E Peace.png",
  "/public/images/Lutalo.jpg",
  "/public/images/Lutalo.png",
  "/public/images/Russia-air defense.png",
  "/public/images/Sheeber.png",
  "/public/images/Spice.png",
  "/public/images/Vinka.png",
  "/public/images/africa-colony.jpeg",
  "/public/images/africa1.jpeg",
  "/public/images/aids-day.jpg",
  "/public/images/baba.png",
  "/public/images/bahati1.jpg",
  "/public/images/bishop.jpeg",
  "/public/images/chip.jpg",
  "/public/images/cyber.jpg",
  "/public/images/cyberlaw.jpeg",
  "/public/images/digital-arrests.jpeg",
  "/public/images/download.jpeg",
  "/public/images/economy.jpg",
  "/public/images/education.jpg",
  "/public/images/emeka-cover.png",
  "/public/images/energy.jpeg",
  "/public/images/ethopia1.jpg",
  "/public/images/gaza-aid.avif",
  "/public/images/gaza-bombing.jpg",
  "/public/images/global-celebrates.jpg",
  "/public/images/global-climate.jpg",
  "/public/images/global-earthquake.png",
  "/public/images/global1.webp",
  "/public/images/glowing-logo.png",
  "/public/images/gordie-bridge.jpeg",
  "/public/images/health.jpg",
  "/public/images/i-hub-Kenya.jpg",
  "/public/images/infrastructure.jpg",
  "/public/images/iran1.jpg",
  "/public/images/island-resilience.jpeg",
  "/public/images/jirongo.jpg",
  "/public/images/kenya-gdp.png",
  "/public/images/kigali.jpeg",
  "/public/images/kisii-crash.jpeg",
  "/public/images/machetes-cover.png",
  "/public/images/mahesh-cover.png",
  "/public/images/mellissa.jpeg",
  "/public/images/netflix1.avif",
  "/public/images/netherlands-elections.jpeg",
  "/public/images/newark.jpeg",
  "/public/images/north-korea.jpeg",
  "/public/images/nyota.png",
  "/public/images/phl-airport.jpeg",
  "/public/images/politics1.jpg",
  "/public/images/raila .jpeg",
  "/public/images/raila-bodyguard.jpeg",
  "/public/images/raila-cover.png",
  "/public/images/railafarewell.jpeg",
  "/public/images/railafarewell.png",
  "/public/images/rare-earths.jpeg",
  "/public/images/ruto-cabinet.jpeg",
  "/public/images/ruto-wedding.jpg",
  "/public/images/sahel.webp",
  "/public/images/sammy-lui.jpeg",
  "/public/images/siaya.jpg",
  "/public/images/southafrica1.jpg",
  "/public/images/sudan.png",
  "/public/images/taiwan .png",
  "/public/images/tennesse.jpg",
  "/public/images/uda-odm.png",
  "/public/images/ukraine.png",
  "/public/images/west bank.png",
  "/public/images/wmo.avif",
  "/public/images/zawadi-cover.png"
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
