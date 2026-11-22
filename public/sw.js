// Minimal pass-through service worker.
//
// It exists so the app is installable, and deliberately caches nothing: this is
// an authenticated admin panel, so serving a stored page to a later (possibly
// different) session would be both stale and a privacy problem. The `fetch`
// listener has no `respondWith`, so every request goes straight to the network.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty: no caching, network only.
});
