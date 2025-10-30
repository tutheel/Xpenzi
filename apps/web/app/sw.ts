/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'xpenzi-shell-v1';
const PRECACHE_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          void cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          return (await caches.match('/')) ?? new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        }
      })(),
    );
    return;
  }

  if (
    request.method !== 'GET' ||
    request.headers.get('accept')?.includes('text/event-stream')
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(request);

        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        void cache.put(request, responseClone);

        return networkResponse;
      } catch {
        const fallback = await caches.match(request);
        return fallback ?? new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })(),
  );
});

export {};
