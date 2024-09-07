self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('dayglo-store').then((cache) => cache.addAll([
            'index.html',
            'style.css',
            'index.js',
            'suncalc.js',
        ])),
    );
});

self.addEventListener('fetch', (event) => {
    // console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request)),
    );
});
