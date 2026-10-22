/* Mon carnet de recettes : service worker (hors ligne).
   « Réseau d'abord » : avec du réseau on prend la dernière version, sinon la copie enregistrée.
   Incrémente VERSION à chaque mise à jour. */
importScripts('illus.js');
const VERSION = 'recettes-v2';
const ASSETS = [
  './', 'index.html', 'styles.css', 'illus.js', 'card.js', 'app.js', 'manifest.json',
  'fonts/fraunces.woff2', 'fonts/fraunces-italic.woff2', 'fonts/inter.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
  ...ILLUS.list.map((s) => ILLUS.src(s.id)),
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(ASSETS.map((u) => fetch(new Request(u, { cache: 'reload' })).then((r) => { if (r.ok) return c.put(u, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('recettes-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
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
