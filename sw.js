/* Cap 65 : service worker (hors ligne).
   Stratégie « réseau d'abord » : quand il y a du réseau, on prend toujours la dernière version
   publiée ; sinon on se sert de la copie enregistrée. Incrémente VERSION à chaque mise à jour. */
const VERSION = 'cap65-v10';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'data-plus.js',
  'illus.js',
  'keepawake.js',
  'features.js',
  'features2.js',
  'app.js',
  'manifest.json',
  'fonts/nunito.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' : ignore le cache HTTP du navigateur pour ne jamais enregistrer une ancienne copie.
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(ASSETS.map((u) => fetch(new Request(u, { cache: 'reload' })).then((r) => { if (r.ok) return c.put(u, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('cap65-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // le carnet de recettes (/recettes/) a son propre service worker
  if (new URL(req.url).pathname.includes('/recettes/')) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(isPage ? 'index.html' : req, copy)); }
        return res;
      })
      .catch(() => caches.match(isPage ? 'index.html' : req, { ignoreSearch: true }))
  );
});
