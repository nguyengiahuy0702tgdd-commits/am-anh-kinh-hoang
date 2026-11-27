// =====================================================================
//  62. CHƠI TỐI ĐA 4 NGƯỜI — đồng bộ bố cục bản đồ
//  Cùng một seed nhưng trình duyệt tối ưu code (JIT) có thể làm vài phép tính số thực lệch ở chữ số cuối,
//  nên mỗi máy có thể bày đồ / đặt nhiệm vụ hơi khác nhau. Khi chơi online, CHỦ PHÒNG gửi bố cục của mình
//  (đồ vật, đèn, tên khu vực, số lượng nhiệm vụ, vũ khí) cho mọi khách để ai cũng thấy cùng một thế giới.
// =====================================================================
const LAY = { buf: {}, pend: null, wpend: null, ready: false };
// Dựng thế giới xong (wxStart là bước dựng cuối cùng) mới đưa từng người về chỗ đứng của mình
wxStart = (o => function (...a) {
  const r = o.apply(this, a);
  if (COOP) { LAY.ready = true; if (NET.host) laySend(); else if (LAY.pend) layApply(LAY.pend); }
  coopPlace(); return r;
})(wxStart);
startGame = (o => function (...a) { LAY.ready = false; LAY.pend = null; LAY.wpend = null; LAY.wlast = null; LAY.buf = {}; return o.apply(this, a); })(startGame);

function laySer(v, TK) {
  if (v == null || typeof v === "function") return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "object") return v;
  if (TK.has(v)) return { $T: TK.get(v) };
  if (Array.isArray(v)) return v.map(q => laySer(q, TK) ?? null);
  if (Object.getPrototypeOf(v) !== Object.prototype) return undefined;
  const o = {}; for (const [k, q] of Object.entries(v)) { if (k[0] === "_") continue; const z = laySer(q, TK); if (z !== undefined) o[k] = z; } return o;
}
function layDe(v) {
  if (v == null || typeof v !== "object") return v;
  if (Array.isArray(v)) return v.map(layDe);
  if (v.$T) return T[v.$T];
  const o = {}; for (const k in v) o[k] = layDe(v[k]); return o;
}
const layTK = () => { const m = new Map(); for (const [k, v] of Object.entries(T)) if (v && typeof v === "object" && !m.has(v)) m.set(v, k); return m; };
function layChunks(t, obj) {
  const str = JSON.stringify(obj), id = Math.random().toString(36).slice(2, 8), N = 48000, n = Math.ceil(str.length / N);
  for (let i = 0; i < n; i++) netSend({ t, id, i, n, d: str.slice(i * N, (i + 1) * N) });
}
function layJoin(m) {
  const b = LAY.buf[m.id] || (LAY.buf[m.id] = []); b[m.i] = m.d;
  if (b.filter(x => x != null).length < m.n) return null; delete LAY.buf[m.id];
  try { return JSON.parse(b.join("")); } catch (e) { return null; }
}
function laySend() {
  if (!NET.ok || !NET.host) return; const TK = layTK();
  const floors = {}; for (const [id, f] of Object.entries(FLOORS)) floors[id] = { sp: f.sprites.map(s => laySer(s, TK)), li: laySer(f.lights || [], TK), lb: laySer(f.labels || [], TK), an: laySer(f.areaNames || [], TK), bl: laySer(f.blocks || [], TK) };
  layChunks("lay", { map: MAPID, floors, tasks: TASKS.map(q => q.need) });
}
function layReset(f) {
  try { KICK.floors.delete(f); } catch (e) {}
  f._kicks = null; f._kMesh = null; f._kMeshDirty = 1; f._obsDone = false; f._obsGroups = null; f._baseDirty = true; f.hasDarts = 0;
}
function layApply(L) {
  if (!L || L.map !== MAPID) return;
  for (const [id, d] of Object.entries(L.floors)) {
    const f = FLOORS[id]; if (!f) continue;
    const old = f.sprites, nu = [];
    d.sp.forEach((q, i) => { const s = layDe(q) || {}; const o = old[i];
      if (o && o.k === s.k && o.act === s.act) { for (const k of Object.keys(o)) if (k[0] !== "_" && !(k in s) && typeof o[k] !== "object" && typeof o[k] !== "function") delete o[k]; Object.assign(o, s); nu.push(o); }   // giữ nguyên đồ vật cốt truyện (có thể đang được tham chiếu)
      else nu.push(s); });
    f.sprites = nu; f.lights = layDe(d.li) || f.lights; f.labels = layDe(d.lb) || f.labels; if (d.an) f.areaNames = layDe(d.an); if (d.bl) f.blocks = layDe(d.bl);
    layReset(f);
  }
  if (Array.isArray(L.tasks)) L.tasks.forEach((n, i) => { if (TASKS[i]) TASKS[i].need = n; });
  const F0 = F; for (const f of Object.values(FLOORS)) { F = f; try { buildFloorMesh(f); } catch (e) {} } F = F0;
  try { refreshWalls(); } catch (e) {}
  LAY.pend = null; if (LAY.wlast) wApply(LAY.wlast);   // vũ khí đã nhận trước đó: đặt lại lên bố cục mới
}
// ---- Vũ khí: chủ phòng đặt, khách nhận đúng vị trí ----
wPlace = (o => function (...a) {
  const was = WPN.placed === FLOORS; const r = o.apply(this, a);
  if (was || WPN.placed !== FLOORS || !COOP || !NET.ok) return r;
  if (NET.host) {
    const TK = layTK(), items = [];
    for (const [id, f] of Object.entries(FLOORS)) { f.sprites.forEach((s, i) => { if (/^w_/.test(s.act || "")) items.push({ f: id, s: laySer(s, TK) }); }); (f.lights || []).forEach(l => { if (l.w) items.push({ f: id, l: laySer(l, TK) }); }); }
    netSend({ t: "wlay", items, zone: WPN.zone ? { name: WPN.zone.name, f: WPN.zone.f?.id, x: WPN.zone.x, y: WPN.zone.y } : null });
  } else { wStrip(); if (LAY.wpend) wApply(LAY.wpend); }
  return r;
})(wPlace);
function wStrip() { for (const f of Object.values(FLOORS)) { f.sprites = f.sprites.filter(s => !/^w_/.test(s.act || "")); f.lights = (f.lights || []).filter(l => !l.w); f._baseDirty = true; } }
function wApply(m) {
  wStrip();
  for (const it of m.items) { const f = FLOORS[it.f]; if (!f) continue; if (it.s) f.sprites.push(layDe(it.s)); if (it.l) f.lights.push(layDe(it.l)); f._baseDirty = true; }
  if (m.zone) WPN.zone = { name: m.zone.name, f: FLOORS[m.zone.f] || F, x: m.zone.x, y: m.zone.y };
  LAY.wpend = null; LAY.wlast = m; try { buildFloorMesh(F); } catch (e) {}
}
netRecv = (o => function (m) {
  if (m && m.t === "lay") { if (NET.host) return; const L = layJoin(m); if (L) { if (LAY.ready) layApply(L); else LAY.pend = L; } return; }
  if (m && m.t === "wlay") { if (NET.host) return; if (WPN.placed === FLOORS) wApply(m); else LAY.wpend = m; return; }
  return o(m);
})(netRecv);
