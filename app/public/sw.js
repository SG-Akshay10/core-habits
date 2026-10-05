/* Core Habits service worker.
 *
 * Responsibilities:
 *  1. Cache the app shell so the dashboard can open (from cache) offline.
 *  2. Receive Web Push events and show a notification.
 *  3. Handle notification clicks — deep-link into the habit and let the
 *     opened page log it in one tap.
 *
 * Versioning: bump CACHE_VERSION whenever the cached asset list changes so
 * clients pick up the new shell instead of getting stuck on a stale one.
 * `skipWaiting` + `clients.claim` make the new SW take over immediately,
 * and the app can prompt the user to refresh via the "controllerchange"
 * event (see sw-register.tsx).
 */
// v2 drops the older cached Next.js chunks, which could leave a refreshed
// application mixing module factories from different development builds.
const CACHE_VERSION = "v2";
const SHELL_CACHE = `core-habits-shell-${CACHE_VERSION}`;
const SHELL_URLS = ["/dashboard", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        // Best-effort — don't block install if a shell URL 404s in dev.
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("core-habits-shell-") && key !== SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first for navigations (so users get fresh content online), with
// a cached app-shell fallback when the network is unavailable.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match(request).then((res) => res || caches.match("/dashboard")),
      ),
    );
    return;
  }

  // Next.js chunks can change in place during development. Let Next/browser
  // caching handle them so the worker never serves a chunk from an older build.
  if (url.pathname.startsWith("/_next/")) return;

  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "Habit reminder", body: "You have a habit to log." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // Non-JSON payload — fall back to defaults.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      data: { url: payload.url || "/dashboard", habitId: payload.habitId },
      tag: payload.habitId ? `habit-${payload.habitId}` : undefined,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});
