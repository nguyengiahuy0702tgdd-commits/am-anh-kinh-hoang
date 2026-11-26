// =====================================================================
//  39. BẢN 26: mượt hơn (không khựng khi nhặt đồ, cắt bớt vẽ thứ ngoài tầm nhìn, tự hạ/tăng độ phân giải nhanh) · nhân vật trong phim hết chói
// =====================================================================
// Chỉ vẽ thứ nằm trong góc nhìn của camera (không cần nhìn xuyên tường)
function inFrustum(x, y, r = .6) {
  const p = player, dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy); if (d < r + .8) return true;
  const half = (SET.hfov + FX.fov) * Math.PI / 360 + Math.atan(r / d) + .12;
  return Math.abs(angTo(p.a, Math.atan2(dy, dx))) < Math.min(Math.PI, half);
}
ghostDraw = (o => function (v, g) { if (!g.scare && !CUT.on && !inFrustum(g.x, g.y, .9)) return; return o(v, g); })(ghostDraw);
drawSpiders = (o => function (v) {
  if (!SPIDERS.length) return o(v); const all = SPIDERS.slice();
  const vis = all.filter(s => s.st === "face" || s.st === "leap" || s.st === "off" || (s.f === F.id && Math.abs(s.x - player.x) + Math.abs(s.y - player.y) < (s.st === "crawl" ? 6 : 9) && inFrustum(s.x, s.y, .4)));
  SPIDERS.length = 0; SPIDERS.push(...vis); try { o(v); } finally { SPIDERS.length = 0; SPIDERS.push(...all); }
})(drawSpiders);
drawWatchers = (o => function (v) {
  if (CUT.on || !WATCHERS.length) return o(v); const all = WATCHERS.slice();
  const vis = all.filter(w => w.f === F.id && Math.abs(w.x - player.x) + Math.abs(w.y - player.y) <= 22 && inFrustum(w.x, w.y, .6));
  WATCHERS.length = 0; WATCHERS.push(...vis); try { o(v); } finally { WATCHERS.length = 0; WATCHERS.push(...all); }
})(drawWatchers);
// Lưới tĩnh chia 2 phần: phần nền (tường, sàn, đồ cố định) chỉ dựng lại khi bản đồ thay đổi; phần đồ tương tác (đồ nhặt, tủ mở, nến...) dựng lại rất nhanh
const isDynSpr = s => !!(s.act || s.kind || s.tk || s.tkind || s.k === "task" || s.open || s.broke || s.lit || s.off || OPENABLE[s.k]);
function baseKey(f) { let h = 7; for (let y = 0; y < f.h; y++) { const r = f.grid[y]; for (let x = 0; x < f.w; x++) h = (h * 31 + r[x].charCodeAt(0)) | 0; } if (f.floorT) for (const tx of f.floorT) h = (h * 31 + (LAYER.get(tx) || 0)) | 0; return h; }
const _buildFloorMeshFull = buildFloorMesh;
function buildDyn(f) {
  const v = [], prevF = F; F = f; for (const s of f.sprites) if (!s._inBase && !s.taken && !isSway(s)) furniture(v, s); F = prevF;
  if (f.mesh2) { gl.deleteBuffer(f.mesh2.b); gl.deleteVertexArray(f.mesh2.vao); } f.mesh2 = v.length ? makeMesh(new Float32Array(v)) : null;
}
buildFloorMesh = function (f) {
  const key = baseKey(f); let ok = f.mesh && !f._baseDirty && f._baseKey === key;
  if (ok) { let n = 0; for (const s of f.sprites) { if (s._inBase) { n++; if (s.taken || isDynSpr(s)) { ok = false; break; } } else if (!isDynSpr(s)) { ok = false; break; } } if (n !== f._baseN) ok = false; }
  if (ok) return buildDyn(f);
  const keep = f.sprites; f.sprites = keep.filter(s => { const d = isDynSpr(s); s._inBase = !d; return !d; });
  try { _buildFloorMeshFull(f); } finally { f.sprites = keep; }
  f._baseDirty = false; f._baseKey = key; f._baseN = keep.filter(s => s._inBase).length; buildDyn(f);
};
refreshWalls = function () { WT = WALL_TEX(); WT["Ø"] = T.slamDoor; if (gl && LAYER.size) { for (const f of Object.values(FLOORS)) f._baseDirty = true; buildFloorMesh(F); } };   // các tầng khác dựng lại khi bước tới
// Tự điều chỉnh độ phân giải nhanh, mục tiêu 60 khung hình/giây ổn định
// Bản 36: vừa vào game (kể cả lúc chiếu phim mở đầu) bắt đầu ở độ phân giải vừa phải rồi mới nâng dần → hết giật lúc mới vào
perfTick = function (dt) {
  const live = (S.started && !S.paused) || CUT.on; if (!live) return;
  if (PERF.base == null) { PERF.base = SCALE; SCALE = Math.min(SCALE, 1); PERF.warm = performance.now(); PERF.acc = PERF.n = PERF.t = 0; }
  const warm = performance.now() - PERF.warm < 8000, lo = SET.quality === "nhanh" ? .4 : .5;
  PERF.acc += dt; PERF.n++; PERF.t += dt; if (PERF.t < (warm ? .3 : .75)) return;
  const avg = PERF.acc / PERF.n; PERF.acc = PERF.n = PERF.t = 0;
  if (avg > .0185 && SCALE > lo) SCALE = Math.max(lo, SCALE * (avg > .03 ? (warm ? .7 : .8) : .9));
  else if (avg < .0135 && SCALE < PERF.base) SCALE = Math.min(PERF.base, SCALE * (warm ? 1.03 : 1.05));
};
