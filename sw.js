// Bộ nhớ đệm cho ứng dụng "Ám Ảnh Kinh Hoàng"
// - File của game: lấy bản MỚI từ mạng trước (để lần nào cập nhật GitHub cũng thấy ngay), mất mạng thì dùng bản đã lưu.
// - Font chữ, thư viện chơi online: lưu lại để lần sau mở nhanh.
const CACHE = "aakh-app-v1";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
  } else if (/fonts\.(googleapis|gstatic)\.com|unpkg\.com/.test(u.host)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); return res; })));
  }
});
