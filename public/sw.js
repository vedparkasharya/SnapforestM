/** Snapforest service worker. Never cache API responses because some GET APIs are authenticated. */
const CACHE_VERSION = "v4";
const STATIC_CACHE = `snapforest-static-${CACHE_VERSION}`;
const IMAGE_CACHE = `snapforest-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/rooms",
  "/dashboard",
  "/manifest.json?v=4",
  "/icon-192.png?v=4",
  "/icon-512.png?v=4",
  "/favicon.ico?v=4",
  "/favicon.png?v=4",
  "/apple-touch-icon.png?v=4",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith("snapforest-") && name !== STATIC_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

const isImageRequest = (url) => /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname);
const isStaticAsset = (url) => url.pathname.startsWith("/_next/") || STATIC_ASSETS.some((asset) => url.pathname === asset.split("?")[0]);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API responses are intentionally network-only. Caching them can leak one
  // user's authenticated data to another browser session through Cache Storage.
  if (url.pathname.startsWith("/api/")) return;

  if (isImageRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached || Response.error());
        return cached || network;
      })
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((cached) => cached || Response.error()))
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Snapforest", body: event.data?.text() || "You have a new notification" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Snapforest", {
      body: data.body || "New notification from Snapforest",
      icon: "/icon-192.png?v=4",
      badge: "/icon-192.png?v=4",
      tag: data.tag || "snapforest-notification",
      data: data.data || {},
      actions: data.actions || [{ action: "open", title: "Open App" }, { action: "dismiss", title: "Dismiss" }],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const requestedUrl = event.notification.data?.url || "/";
  let urlToOpen = "/";
  try {
    const parsed = new URL(requestedUrl, self.location.origin);
    if (parsed.origin === self.location.origin) urlToOpen = parsed.href;
  } catch {
    urlToOpen = "/";
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url === urlToOpen);
      if (existing && "focus" in existing) return existing.focus();
      return self.clients.openWindow ? self.clients.openWindow(urlToOpen) : undefined;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
