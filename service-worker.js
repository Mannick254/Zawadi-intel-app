self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('zawadi-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/js/main.js',
        '/icons/icon-192.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
