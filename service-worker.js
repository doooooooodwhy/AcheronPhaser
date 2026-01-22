// Acheron Phaser Service Worker

const CACHE_NAME = 'acheron-phaser-v1';
const urlsToCache = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/images/'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Acheron Phaser cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - proxy requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle proxy requests
  if (url.pathname.startsWith('/proxy/')) {
    event.respondWith(handleProxyRequest(request));
    return;
  }

  // Cache first strategy for static assets
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request);
        })
    );
    return;
  }

  // Network first for other requests
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

async function handleProxyRequest(request) {
  try {
    const url = new URL(request.url);
    const targetUrl = decodeURIComponent(url.pathname.replace('/proxy/', ''));
    
    // Validate target URL
    if (!isValidUrl(targetUrl)) {
      return new Response('Invalid URL', { status: 400 });
    }

    // Create new request with proper headers
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'User-Agent': 'Acheron-Phaser-Proxy/1.0',
        'X-Forwarded-For': 'AcheronPhaser'
      }
    });

    const response = await fetch(proxyRequest);
    
    // Clone response to modify headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });

    return modifiedResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Proxy error occurred', { status: 500 });
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
