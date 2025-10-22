// Le Truc Docs Service Worker
const CACHE_NAME = 'le-truc-docs-v1761122059041';

// Assets to cache on install
const STATIC_ASSETS = [
	'/',
	'/index.html',
	'/assets/main.0adb5bf2.css',
	'/assets/main.e36ac8b7.js',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(STATIC_ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames
						.filter(cacheName => cacheName !== CACHE_NAME)
						.map(cacheName => caches.delete(cacheName))
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only handle GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (!request.url.startsWith(self.location.origin)) return;

	event.respondWith(
		caches.match(request)
			.then(cachedResponse => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(request)
					.then(response => {
						// Don't cache non-successful responses
						if (!response.ok) return response;

						// Clone the response
						const responseToCache = response.clone();

						// Cache static assets
						if (request.url.includes('/assets/') || request.url.endsWith('.html')) {
							caches.open(CACHE_NAME)
								.then(cache => cache.put(request, responseToCache));
						}

						return response;
					});
			})
	);
});