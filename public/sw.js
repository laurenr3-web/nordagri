
const CACHE_NAME = 'nordagri-v2'; // Nouvelle version pour forcer la mise à jour
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Ressources essentielles à mettre en cache
const cacheEssentials = [
  '/auth',
  '/dashboard',
  '/equipment',
  '/maintenance',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation en cours');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll([...urlsToCache, ...cacheEssentials]);
      })
      .catch(err => console.error('Service Worker: Erreur d\'installation', err))
  );
  // Forcer l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// Interception des requêtes fetch
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes Supabase ou d'autres API
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('api.') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Stratégie "stale-while-revalidate": répondre avec le cache pendant la mise à jour
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Ne mettre en cache que les réponses réussies (statut 200)
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log('Service Worker: Requête réseau échouée, utilisation du cache');
            // Si la requête réseau échoue, on essaie de servir une page HTML depuis le cache
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            return null;
          });

        return response || fetchPromise;
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activé');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // S'assurer que le service worker prend le contrôle immédiatement
  return self.clients.claim();
});

// Gérer les messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
