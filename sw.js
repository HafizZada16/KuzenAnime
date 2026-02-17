const CACHE_NAME = "kuzen-cache-v1";

// Saat di-install, Service Worker langsung aktif tanpa menunggu
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Bersihkan cache lama jika ada versi baru
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Strategi: Jaringan selalu yang utama, kalau internet mati, baru cari di cache
self.addEventListener("fetch", (event) => {
  // Kita lewati request yang berasal dari API eksternal atau video agar tidak membebani storage HP
  if (
    event.request.url.includes("api.kanata") ||
    event.request.url.includes("mp4")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
