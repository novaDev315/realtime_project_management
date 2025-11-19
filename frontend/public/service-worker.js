const CACHE_NAME = 'realtime-pm-v1'
const RUNTIME_CACHE = 'realtime-pm-runtime-v1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching assets')
      return cache.addAll(PRECACHE_ASSETS)
    })
  )

  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Cache-first strategy for static assets
  event.respondWith(cacheFirst(request))
})

// Cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)

    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }

    throw error
  }
}

// Network-first strategy with offline fallback
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)

  try {
    const response = await fetch(request)

    // Cache successful GET requests
    if (request.method === 'GET' && response.status === 200) {
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Try to serve from cache
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    // If POST/PUT/DELETE request failed, queue it for sync
    if (request.method !== 'GET') {
      await queueRequestForSync(request)
    }

    throw error
  }
}

// Queue failed requests for background sync
async function queueRequestForSync(request) {
  const data = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now(),
  }

  // Store in IndexedDB (will be implemented in offline service)
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'QUEUE_SYNC',
        data,
      })
    })
  })
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag)

  if (event.tag === 'sync-data') {
    event.waitUntil(syncQueuedRequests())
  }
})

// Sync queued requests when online
async function syncQueuedRequests() {
  // This will communicate with the app to process queued requests
  const clients = await self.clients.matchAll()

  clients.forEach((client) => {
    client.postMessage({
      type: 'PROCESS_SYNC_QUEUE',
    })
  })
}

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})
