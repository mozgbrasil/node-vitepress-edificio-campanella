const VERSION = "mozg-site-edificio-campanella-v10";
const HOME_PATH = "/node-vitepress-edificio-campanella/";
const APP_SHELL = [
  "/node-vitepress-edificio-campanella/",
  "/node-vitepress-edificio-campanella/manifest.json",
  "/node-vitepress-edificio-campanella/logo-mini.svg",
  "/node-vitepress-edificio-campanella/logo-mini.png",
  "/node-vitepress-edificio-campanella/og.jpg",
  "/node-vitepress-edificio-campanella/data/site-catalog.json",
  "/node-vitepress-edificio-campanella/data/site-audit.json",
  "/node-vitepress-edificio-campanella/data/site-discovery.json",
  "/node-vitepress-edificio-campanella/data/site-portfolio.json",
  "/node-vitepress-edificio-campanella/data/site-projects.json",
  "/node-vitepress-edificio-campanella/data/site-capabilities.json",
  "/node-vitepress-edificio-campanella/data/site-stacks.json",
  "/node-vitepress-edificio-campanella/data/site-operations.json",
  "/node-vitepress-edificio-campanella/data/site-journeys.json",
  "/node-vitepress-edificio-campanella/data/site-trust.json",
  "/node-vitepress-edificio-campanella/llms.txt",
  "/node-vitepress-edificio-campanella/robots.txt",
  "/node-vitepress-edificio-campanella/contato",
  "/node-vitepress-edificio-campanella/presenca",
  "/node-vitepress-edificio-campanella/en/",
  "/node-vitepress-edificio-campanella/en/contact",
  "/node-vitepress-edificio-campanella/en/presence"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
