// Service Worker for 3D Heart Animation
const CACHE_NAME = "heart-animation-v1";
const urlsToCache = [
  "/heart-animation/",
  "/heart-animation/index.html",
  "/heart-animation/assets/css/style.css",
  "/heart-animation/assets/js/three.min.js",
  "/heart-animation/assets/js/main.js",
  "/heart-animation/assets/js/mesh-surface-sampler.js",
  "/heart-animation/assets/js/trackball-controls.js",
  "/heart-animation/assets/js/simplex-noise.js",
  "/heart-animation/assets/js/obj-loader.js",
  "/heart-animation/assets/js/gsap.min.js",
  "/heart-animation/assets/music/Goy Arachaporn.mp3",
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
