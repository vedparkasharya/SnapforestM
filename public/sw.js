/**
 * Snapforest PWA Service Worker
 *
 * Provides:
 * - Offline page caching
 * - Static asset caching
 * - API response caching with stale-while-revalidate
 * - Image caching
 * - Push notification support
 *
 * Version: 2.0 - Enhanced for production
 */

const CACHE_VERSION = "v2";
const STATIC_CACHE = `snapforest-static-${CACHE_VERSION}`;
const API_CACHE = `snapforest-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `snapforest-images-${CACHE_VERSION}`;
const OFFLINE_PAGE = "/";

// Assets to cache on install - core app shell
const STATIC_ASSETS = [
  "/",
  "/rooms",
  "/dashboard",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Snapforest Service Worker v2...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets...");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error("[SW] Cache install failed:", err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Snapforest Service Worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old snapforest caches that don't match current version
              return (
                name.startsWith("snapforest-") &&
                name !== STATIC_CACHE &&
                name !== API_CACHE &&
                name !== IMAGE_CACHE
              );
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("[SW] Service Worker activated, claiming clients...");
        return self.clients.claim();
      })
  );
});

// Helper functions
const isApiRequest = (url) => {
  return url.pathname.startsWith("/api/");
};

const isImageRequest = (url) => {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);
};

const isStaticAsset = (url) => {
  return STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("/_next/");
};

/**
 * Fetch event - serve from cache or network
 * Strategy:
 * - API requests: Network first, cache fallback (stale-while-revalidate)
 * - Images: Cache first, network fallback
 * - Static assets: Cache first, network fallback
 * - Navigation: Network first, cache fallback
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE go directly to network)
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (except for essential third-party APIs)
  if (url.origin !== self.location.origin) {
    // Allow Razorpay checkout requests to pass through
    if (url.hostname.includes("razorpay.com")) {
      return;
    }
    return;
  }

  // API requests - Network first with cache fallback
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log("[SW] Serving cached API response for:", url.pathname);
              return cached;
            }
            // Return offline JSON response for API calls
            return new Response(
              JSON.stringify({
                success: false,
                message: "You are offline. Please check your internet connection.",
                offline: true,
              }),
              {
                status: 503,
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-cache",
                },
              }
            );
          });
        })
    );
    return;
  }

  // Image requests - Stale-while-revalidate
  if (isImageRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            console.log("[SW] Image fetch failed, serving from cache:", url.pathname);
            return cached;
          });

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Update cache in background (stale-while-revalidate)
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                caches.open(STATIC_CACHE).then((cache) => {
                  cache.put(request, response);
                });
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === "navigate") {
              return caches.match("/");
            }
            throw new Error("Network error");
          });
      })
    );
    return;
  }

  // Default: Network first, cache fallback for navigation
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return home page as fallback for navigation
          if (request.mode === "navigate") {
            return caches.match("/");
          }
          throw new Error("Network error");
        });
      })
  );
});

/**
 * Push notification support
 * Handles incoming push messages from the server
 */
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Snapforest",
      body: event.data?.text() || "You have a new notification",
    };
  }

  const options = {
    body: data.body || "New notification from Snapforest",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: data.tag || "snapforest-notification",
    requireInteraction: false,
    data: data.data || {},
    actions: data.actions || [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Snapforest",
      options
    )
  );
});

/**
 * Notification click handler
 * Opens the app when user clicks on a notification
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || "/";

  if (event.action === "dismiss") {
    return;
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Message handler for skipWaiting
 * Allows the page to trigger service worker updates
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting triggered from page");
    self.skipWaiting();
  }
});

console.log("[SW] Snapforest Service Worker v2 loaded");
