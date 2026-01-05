const STATIC_CACHE = "zawadi-intel-static-v4";
const DYNAMIC_CACHE = "zawadi-intel-dynamic-v4";

const STATIC_ASSETS = [
  "/about.html",
  "/account.html",
  "/admin.html",
  "/app.html",
  "/article.html",
  "/articles/africa-business.html",
  "/articles/africa-climate.html",
  "/articles/aids-day.html",
  "/articles/amazon-ai-chip.html",
  "/articles/article11.html",
  "/articles/article12.html",
  "/articles/article13.html",
  "/articles/article15.html",
  "/articles/article17.html",
  "/articles/article19.html",
  "/articles/article8.html",
  "/articles/article9.html",
  "/articles/asia-floods.html",
  "/articles/bahati-family.html",
  "/articles/bishop-kiengei.html",
  "/articles/breakthroughs-in-global-health.html",
  "/articles/cop30-outcomes.html",
  "/articles/cyber-utilities.html",
  "/articles/eac-fgm-law.html",
  "/articles/eastafrica-instability.html",
  "/articles/emerging-economies-drive-global-growth.html",
  "/articles/epl-chelsea.html",
  "/articles/epl-villa.html",
  "/articles/europe-defense.html",
  "/articles/europe-russia.html",
  "/articles/factory-farming.html",
  "/articles/gates-foundation.html",
  "/articles/gaza-aid.html",
  "/articles/genz-politics.html",
  "/articles/global-ai.html",
  "/articles/global-aid.html",
  "/articles/global-debate-on-ai-regulation.html",
  "/articles/global-festivals-celebrate-diversity.html",
  "/articles/global-markets.html",
  "/articles/global-un.html",
  "/articles/haiti-mission.html",
  "/articles/iran-protests.html",
  "/articles/japan-earthquake.html",
  "/articles/kenya-collapse.html",
  "/articles/kenya-gdp.html",
  "/articles/kenya-health.html",
  "/articles/kenya-politics.html",
  "/articles/kenya-sports.html",
  "/articles/kericho-accident.html",
  "/articles/kisii-airbus.html",
  "/articles/lebanon-israel-talks.html",
  "/articles/middle-east-energy.html",
  "/articles/middle-east-security.html",
  "/articles/middleeast-drones.html",
  "/articles/nairobi-football.html",
  "/articles/nairobi-gangs.html",
  "/articles/nairobi-matatus.html",
  "/articles/nakuru-industry.html",
  "/articles/new-era-of-space-exploration.html",
  "/articles/nigeria-power.html",
  "/articles/pdiddy-netflix.html",
  "/articles/polar-vortex.html",
  "/articles/raila-bodyguard.html",
  "/articles/raila-legacy.html",
  "/articles/ruto-wedding.html",
  "/articles/siaya-doctors.html",
  "/articles/switzerland-fire.html",
  "/articles/tennessee-election.html",
  "/articles/uda-odm.html",
  "/articles/ukraine-energy.html",
  "/articles/us-defense-survey.html",
  "/articles/us-immigration.html",
  "/articles/voter-mobilization.html",
  "/articles/westafrica-drugs.html",
  "/articles/wmo-warning.html",
  "/articles/world-leaders-gather-for-climate-summit.html",
  "/articles/zoho-eastafrica.html",
  "/articles-sitemap.xml",
  "/biography.html",
  "/books.html",
  "/css/admin.css",
  "/css/articles.css",
  "/css/custom.css",
  "/css/featuredstory.css",
  "/css/layout.css",
  "/css/style.css",
  "/css/theme.css",
  "/css/widgets.css",
  "/data/africa.json",
  "/data/global.json",
  "/data/local.json",
  "/global.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/images/Copilot_20251209_132001.png",
  "/images/Copilot_20251209_132050.png",
  "/images/Copilot_20251209_132406.png",
  "/images/Copilot_20251209_132420.png",
  "/images/Copilot_20251212_160553.png",
  "/images/Copilot_20251213_124157.png",
  "/images/Copilot_20251213_144107.png",
  "/images/Copilot_20251213_144113.png",
  "/images/Copilot_20251213_144124.png",
  "/images/Copilot_20251213_152435.png",
  "/images/Copilot_20251213_165740.png",
  "/images/Copilot_20251213_224355.png",
  "/images/Copilot_20251214_142648.png",
  "/images/Copilot_20251221_102109.png",
  "/images/Copilot_20251221_103118.png",
  "/images/Copilot_20251221_103936.png",
  "/images/E Peace.png",
  "/images/Lutalo.jpg",
  "/images/Lutalo.png",
  "/images/Russia-air defense.png",
  "/images/Sheeber.png",
  "/images/Spice.png",
  "/images/Vinka.png",
  "/images/africa-colony.jpeg",
  "/images/africa1.jpeg",
  "/images/aids-day.jpg",
  "/images/baba.png",
  "/images/bahati1.jpg",
  "/images/bishop.jpeg",
  "/images/chip.jpg",
  "/images/cyber.jpg",
  "/images/cyberlaw.jpeg",
  "/images/digital-arrests.jpeg",
  "/images/download.jpeg",
  "/images/economy.jpg",
  "/images/education.jpg",
  "/images/emeka-cover.png",
  "/images/energy.jpeg",
  "/images/ethopia1.jpg",
  "/images/gaza-aid.avif",
  "/images/gaza-bombing.jpg",
  "/images/global-celebrates.jpg",
  "/images/global-climate.jpg",
  "/images/global-earthquake.png",
  "/images/global1.webp",
  "/images/glowing-logo.png",
  "/images/gordie-bridge.jpeg",
  "/images/health.jpg",
  "/images/i-hub-Kenya.jpg",
  "/images/infrastructure.jpg",
  "/images/iran1.jpg",
  "/images/island-resilience.jpeg",
  "/images/jirongo.jpg",
  "/images/kenya-gdp.png",
  "/images/kigali.jpeg",
  "/images/kisii-crash.jpeg",
  "/images/machetes-cover.png",
  "/images/mahesh-cover.png",
  "/images/mellissa.jpeg",
  "/images/netflix1.avif",
  "/images/netherlands-elections.jpeg",
  "/images/newark.jpeg",
  "/images/north-korea.jpeg",
  "/images/nyota.png",
  "/images/phl-airport.jpeg",
  "/images/politics1.jpg",
  "/images/raila .jpeg",
  "/images/raila-bodyguard.jpeg",
  "/images/raila-cover.png",
  "/images/railafarewell.jpeg",
  "/images/railafarewell.png",
  "/images/rare-earths.jpeg",
  "/images/ruto-cabinet.jpeg",
  "/images/ruto-wedding.jpg",
  "/images/sahel.webp",
  "/images/sammy-lui.jpeg",
  "/images/siaya.jpg",
  "/images/southafrica1.jpg",
  "/images/sudan.png",
  "/images/taiwan .png",
  "/images/tennesse.jpg",
  "/images/uda-odm.png",
  "/images/ukraine.png",
  "/images/west bank.png",
  "/images/wmo.avif",
  "/images/zawadi-cover.png",
  "/index.html",
  "/js/admin.js",
  "/js/article-management.js",
  "/js/auth.js",
  "/js/clock-calendar.js",
  "/js/index-feed.js",
  "/js/load-articles.js",
  "/js/main.js",
  "/js/notifications-admin.js",
  "/js/notifications.js",
  "/js/prevent-broken-images.js",
  "/js/profile.js",
  "/js/seo.js",
  "/js/server-status.js",
  "/login.html",
  "/main.js",
  "/manifest.json",
  "/media.html",
  "/middle-east.html",
  "/news/Wahoho.html",
  "/news/cyrus-jirongo.html",
  "/news.json",
  "/offline.html",
  "/profile.html",
  "/sitemap-index.xml",
  "/sitemap.xsl",
  "/search.html",
  "/robots.txt"
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
        if (event.request.destination === "image") return caches.match("/icons/icon-192.png");
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
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
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
