self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('dayglo-store').then((cache) => cache.addAll([
            '/dayglo/',
            '/dayglo/index.html',
            '/dayglo/style.css',
            '/dayglo/index.js',
            '/dayglo/suncalc.js',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    // console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
