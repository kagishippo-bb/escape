
const VERSION = '86c6c4e2d6';
const CACHE = 'kagishippo-escape-' + VERSION;
const FONTS = 'kagishippo-escape-fonts';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'manifest-en.webmanifest', 'icon.png', 'og.png', 'ending.m4a'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONTS && k.startsWith('kagishippo-escape-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(r);
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return res; })
      .catch(() => caches.match('index.html', {ignoreSearch: true}).then(h => h || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});
