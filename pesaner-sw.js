/* Pesaner — Service Worker
 * - Cache ringan agar aplikasi bisa dibuka cepat/offline (network-first untuk halaman, stale-while-revalidate untuk aset)
 * - Menampilkan notifikasi lewat registration.showNotification (wajib di Android) + menangani klik notifikasi
 * - Handler "push" menerima pesan Firebase Cloud Messaging (FCM) dari Apps Script (code.gs) walau aplikasi DITUTUP.
 *   Backend mengirim data-message murni (tanpa blok "notification"), jadi SW inilah yang menampilkan notifikasinya
 *   -> tidak ada notifikasi ganda, dan klik notifikasi langsung membuka chat yang tepat.
 * Panggilan API (Google Apps Script) dan semua non-GET TIDAK pernah di-cache. */
const VERSION = 'pesaner-v2';
const APP_PATHS = ['/pesaner', '/pesaner.html', '/pesaner/'];  // hanya halaman Pesaner yang disentuh SW; blog & halaman lain andu.my.id lewat normal
const CORE = ['/pesaner', '/pesaner.webmanifest', '/pesaner-icons/icon-192.png', '/pesaner-icons/icon-512.png', '/pesaner-icons/badge-96.png'];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(CORE.map(u => cache.add(u).catch(() => {}))); // satu gagal tidak membatalkan yang lain
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('pesaner-') && k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.indexOf('script.google.com') !== -1 || url.hostname.indexOf('googleusercontent.com') !== -1) return;

  const isApp = APP_PATHS.indexOf(url.pathname) !== -1;
  const isOwnAsset = url.origin === self.location.origin && (url.pathname.indexOf('/pesaner-icons/') === 0 || url.pathname === '/pesaner.webmanifest');
  const isCdn = CDN_HOSTS.indexOf(url.hostname) !== -1;
  if (!(isApp || isOwnAsset || isCdn)) return; // bukan urusan Pesaner: biarkan browser

  // Halaman utama: network-first, fallback ke cache saat offline
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(VERSION);
        cache.put(req, res.clone()).catch(() => {});
        return res;
      } catch (e) {
        const cache = await caches.open(VERSION);
        return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('/pesaner')) || Response.error();
      }
    })());
    return;
  }

  // Aset statis Pesaner & CDN: stale-while-revalidate
  {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const cached = await cache.match(req);
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()).catch(() => {}); return res; }).catch(() => null);
      return cached || (await net) || Response.error();
    })());
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if ('focus' in c) {
        await c.focus();
        c.postMessage({ type: 'pesaner-open', data });
        return;
      }
    }
    // Aplikasi benar-benar tertutup: buka jendela baru (halaman akan membuka tab yang sesuai)
    const tab = data.tab ? ('?pwa=' + encodeURIComponent(data.tab)) : '';
    const w = await self.clients.openWindow('/pesaner' + tab);
    if (w) setTimeout(() => { try { w.postMessage({ type: 'pesaner-open', data }); } catch (e) {} }, 3500);
  })());
});

// ===== PUSH (FCM) =====
// Format payload yang diterima dari FCM: { data: {...}, ... } (data-message dari code.gs).
// Field yang dipakai: title, body, tag, tab, chatKey, chatType, chatName.
self.addEventListener('push', (event) => {
  let p = {};
  try { p = event.data ? event.data.json() : {}; } catch (e) { p = { title: 'Pesaner', body: event.data ? event.data.text() : '' }; }
  const d = (p.data && typeof p.data === 'object') ? p.data : p;
  const n = (p.notification && typeof p.notification === 'object') ? p.notification : {};

  const title = d.title || n.title || d.senderName || 'Pesaner';
  const body = d.body || n.body || d.message || '';
  const tag = d.tag || n.tag || 'pesaner-push';

  event.waitUntil((async () => {
    // Kalau jendela Pesaner sedang terlihat & fokus, aplikasi sudah menampilkan pesan sendiri -> jangan dobel.
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.some(c => c.visibilityState === 'visible' && c.focused)) return;

    await self.registration.showNotification(title, {
      body,
      tag,
      renotify: true,
      icon: '/pesaner-icons/icon-192.png',
      badge: '/pesaner-icons/badge-96.png',
      vibrate: [120, 60, 120],
      data: {
        tab: d.tab || 'chat',
        chatKey: d.chatKey || '',
        chatType: d.chatType || 'personal',
        chatName: d.chatName || ''
      }
    });
  })());
});
