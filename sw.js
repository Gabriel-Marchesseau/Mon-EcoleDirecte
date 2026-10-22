// Service worker minimal : requis par Chrome pour proposer l'installation de
// l'appli (PWA). Aucun cache ici — le cache de données est géré par IndexedDB
// (edCache) et les fichiers statiques sont servis en no-cache par le proxy.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
