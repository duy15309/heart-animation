// Service Worker for 3D Heart Animation
const CACHE_NAME = "heart-animation-v1";
const urlsToCache = [
   "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/three.min.js",
  "./assets/js/main.js",
  "./assets/js/mesh-surface-sampler.js",
  "./assets/js/trackball-controls.js",
  "./assets/js/simplex-noise.js",
  "./assets/js/obj-loader.js",
  "./assets/js/gsap.min.js",
  "./assets/music/Goy Arachaporn.mp3",
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
