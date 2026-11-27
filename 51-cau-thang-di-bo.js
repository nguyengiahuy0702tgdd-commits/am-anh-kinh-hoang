// =====================================================================
//  51. CẦU THANG THẬT — đi bộ từ tầng dưới lên tầng trên như ngoài đời
//  Mỗi cầu thang giờ là một dãy 13 bậc dài 3 ô, nối thẳng tầng dưới với tầng trên.
//  · Đi bộ lên từng bậc (camera lên dần, gỗ kẽo kẹt dưới chân), không có màn hình đen.
//  · Lên tới đầu cầu thang là bước thẳng ra hành lang tầng trên; đi xuống cũng vậy.
//  · Giữa dãy bậc, game lặng lẽ chuyển sang tầng kia — hình không đổi nên không thấy.
//  · Bấm E vào cầu thang vẫn dùng được như cũ.
// =====================================================================
const WELL_L = 3.0, WELL_N = 13;
const STW = { on: 0, F: null, step: -1, gen: 0, wells: null, wellsGen: -1, floorsRef: null };

// ---------- 1. Tìm cầu thang & ghép cặp tầng dưới ↔ tầng trên ----------
function stairCells(f) {
  if (f._stairs && f._stairsGen === STW.gen) return f._stairs;
  const m = new Map();
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const c = f.grid[y][x]; if (!(c in STAIRS)) continue;
    let best = null;
    for (const [ex, ey] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      if (f.grid[y + ey]?.[x + ex] !== ".") continue;
      const sc = f.grid[y - ey]?.[x - ex] === "." ? 1 : 3;
      if (!best || sc > best.sc) best = { ex, ey, sc };
    }
    if (best) m.set(y * f.w + x, { c, x, y, ex: best.ex, ey: best.ey, dir: STAIRS[c], f });
  }
  for (const st of m.values()) {
    const lat = st.ex === 0 ? [1, 0] : [0, 1], same = k => { const o = m.get((st.y + lat[1] * k) * f.w + st.x + lat[0] * k); return o && o.ex === st.ex && o.ey === st.ey && o.c === st.c; };
    let a = 0, b = 0; while (same(a - 1)) a--; while (same(b + 1)) b++;
    const L0 = st.ex === 0 ? st.x : st.y; st.lane = [L0 + a, L0 + b + 1]; st.lk = f.id + ":" + st.lane.join("-") + ":" + st.ex + "," + st.ey;
  }
  f._stairsGen = STW.gen; return f._stairs = m;
}
travel = (o => function (to, x, y, a) { if (STW.probe) { STW.probe.cap = { to, x, y, a }; return; } return o.apply(this, arguments); })(travel);
function stairTarget(st) {                     // cầu thang này dẫn tới đâu? (hỏi chính hành động của nó, không đi thật)
  const F0 = F; STW.probe = {};
  try { F = st.f; ACTIONS[st.c]?.({ c: st.c, x: st.x, y: st.y }); } catch (e) {} finally { F = F0; }
  const cap = STW.probe.cap; STW.probe = null;
  return cap && FLOORS[cap.to] ? cap : null;
}
function wellFrame(st) {
  const ox = st.ex === 0 ? (st.lane[0] + st.lane[1]) / 2 : st.x + .5 + st.ex * .5, oy = st.ex === 0 ? st.y + .5 + st.ey * .5 : (st.lane[0] + st.lane[1]) / 2;
  return { ox, oy, c: st.ey, s: -st.ex, lhw: (st.lane[1] - st.lane[0]) / 2 };
}
function allWells() {
  if (STW.wells && STW.wellsGen === STW.gen && STW.floorsRef === FLOORS) return STW.wells;
  const lanes = new Map();
  for (const f of Object.values(FLOORS)) for (const st of stairCells(f).values()) if (!lanes.has(st.lk)) lanes.set(st.lk, st);
  const info = new Map();
  for (const st of lanes.values()) {
    const tg = stairTarget(st); if (!tg) continue;
    let best = null, bd = 4.5;
    for (const o of lanes.values()) if (o.f.id === tg.to && o.dir === -st.dir) { const fr = wellFrame(o), d = Math.hypot(fr.ox - tg.x, fr.oy - tg.y); if (d < bd) { bd = d; best = o; } }
    if (best) info.set(st.lk, { st, tg, partner: best });
  }
  const wells = new Map();
  for (const [lk, w] of info) {
    const back = info.get(w.partner.lk); if (!back || back.partner.lk !== lk) continue;   // phải ghép được cả hai chiều
    const fr = wellFrame(w.st), fp = wellFrame(w.partner);
    wells.set(lk, { lk, st: w.st, f: w.st.f, dir: w.st.dir, ...fr, hw: Math.min(fr.lhw, fp.lhw), pk: w.partner.lk, arr: w.tg });
  }
  for (const w of wells.values()) { w.p = wells.get(w.pk); if (!w.p) wells.delete(w.lk); }
  STW.wellsGen = STW.gen; STW.floorsRef = FLOORS; return STW.wells = wells;
}
const wellOfCell = (f, x, y) => { const st = stairCells(f).get(y * f.w + x); return st ? allWells().get(st.lk) : null; };
const wLocal = (w, px, py) => { const dx = px - w.ox, dy = py - w.oy; return [dx * w.c + dy * w.s, -dx * w.s + dy * w.c]; };
const wWorld = (w, lx, lz) => [w.ox + lx * w.c - lz * w.s, w.oy + lx * w.s + lz * w.c];
refreshWalls = (o => function (...a) { STW.gen++; return o.apply(this, a); })(refreshWalls);

// ---------- 2. Dựng hình cầu thang ----------
const WELL_DRAWN = new WeakMap();
buildStairs = (o => function (v, X, dir, sideL, sideR, wallMat, f, nx, ny) {
  const w = f && wellOfCell(f, nx, ny); if (!w) return o(v, X, dir, sideL, sideR, wallMat);
  let set = WELL_DRAWN.get(v); if (!set) WELL_DRAWN.set(v, set = new Set()); if (set.has(w.lk)) return; set.add(w.lk);
  drawWell(v, w, wallMat);
})(buildStairs);
function drawWell(v, w, wallMat) {
  const L = WELL_L, H2 = WH * 2, hw = w.hw, X0 = XF(w.ox, 0, w.oy, w.c, w.s);
  const Xc = w.dir > 0 ? X0 : { p: (x, y, z) => X0.p(-x, y - WH, -L - z), n: (x, y, z) => X0.n(-x, y, -z) };   // tầng trên: cùng một cầu thang, xoay ngược & hạ 1 tầng
  for (let i = 0; i < WELL_N; i++) {                                            // 13 bậc gỗ
    const z0 = -(i + 1) * L / WELL_N, z1 = -i * L / WELL_N, top = (i + 1) * WH / WELL_N;
    const segs = Math.max(1, Math.round(hw * 2)); for (let k = 0; k < segs; k++) { const xa = -hw + 2 * hw * k / segs, xb = -hw + 2 * hw * (k + 1) / segs; pbox(v, Xc, k ? xa : xa + .004, 0, z0, k === segs - 1 ? xb - .004 : xb, top, z1, { all: T.darkwood, t: T.stairTread, noBack: 1 }); }   // chia đôi bậc rộng → vân gỗ không bị kéo giãn   // hụt vào 4 mm: không chồng hình với tường
    pbox(v, Xc, -hw + .02, top, z0 + .02, -hw + .045, top + .5, z0 + .045, T.darkwood);   // song tay vịn
    pbox(v, Xc, hw - .045, top, z0 + .02, hw - .02, top + .5, z0 + .045, T.darkwood);
  }
  const Xs = { p: (x, y, z) => Xc.p(x, y + (-z / L) * WH, z), n: Xc.n };      // tay vịn chạy dọc theo dốc
  pbox(v, Xs, -hw + .01, .5, -L, -hw + .055, .545, 0, T.darkwood); pbox(v, Xs, hw - .055, .5, -L, hw - .01, .545, 0, T.darkwood);
  const uL = L / 1.3, uH = H2 / 1.3;
  lq(v, Xc, [[-hw, H2, 0, 0, 0], [-hw, H2, -L, uL, 0], [-hw, 0, -L, uL, uH], [-hw, 0, 0, 0, uH]], [1, 0, 0], wallMat);      // tường trái
  lq(v, Xc, [[hw, H2, -L, 0, 0], [hw, H2, 0, uL, 0], [hw, 0, 0, uL, uH], [hw, 0, -L, 0, uH]], [-1, 0, 0], wallMat);       // tường phải
  lq(v, Xc, [[-hw, H2, -L, 0, 0], [hw, H2, -L, 1, 0], [hw, H2, 0, 1, 1], [-hw, H2, 0, 0, 1]], [0, -1, 0], w.f.ceil || T.ceil);   // trần giếng thang
  lq(v, Xc, [[hw, H2, -.012, 0, 0], [-hw, H2, -.012, 1, 0], [-hw, WH, -.012, 1, 1], [hw, WH, -.012, 0, 1]], [0, 0, -1], wallMat);   // tường trên cửa dưới (lùi vào 1 cm: không trùng mặt tường phòng → hết sọc chéo)
  // Đầu/chân thang bên kia: một khoảng chiếu nghỉ ngắn chìm vào bóng tối (tầng kia chỉ hiện ra khi bạn đi quá nửa thang)
  const E = 1.4, land = (zA, zB, y0) => {                       // sàn, trần, hai vách và vách cuối của khoảng chiếu nghỉ
    const zf = Math.min(zA, zB), zn = Math.max(zA, zB), far = zA < zB ? zf : zn, fs = far === zf ? 1 : -1;
    lq(v, Xc, [[-hw, y0, zn, 0, 0], [hw, y0, zn, 1, 0], [hw, y0, zf, 1, E], [-hw, y0, zf, 0, E]], [0, 1, 0], T.darkwood);
    lq(v, Xc, [[-hw, y0 + WH, zf, 0, 0], [hw, y0 + WH, zf, 1, 0], [hw, y0 + WH, zn, 1, 1], [-hw, y0 + WH, zn, 0, 1]], [0, -1, 0], w.f.ceil || T.ceil);
    lq(v, Xc, [[-hw, y0 + WH, zn, 0, 0], [-hw, y0 + WH, zf, E / 1.3, 0], [-hw, y0, zf, E / 1.3, 1], [-hw, y0, zn, 0, 1]], [1, 0, 0], wallMat);
    lq(v, Xc, [[hw, y0 + WH, zf, 0, 0], [hw, y0 + WH, zn, E / 1.3, 0], [hw, y0, zn, E / 1.3, 1], [hw, y0, zf, 0, 1]], [-1, 0, 0], wallMat);
    if (fs > 0) lq(v, Xc, [[-hw, y0 + WH, far, 0, 0], [hw, y0 + WH, far, 1, 0], [hw, y0, far, 1, 1], [-hw, y0, far, 0, 1]], [0, 0, 1], wallMat);
    else lq(v, Xc, [[hw, y0 + WH, far, 0, 0], [-hw, y0 + WH, far, 1, 0], [-hw, y0, far, 1, 1], [hw, y0, far, 0, 1]], [0, 0, -1], wallMat);
  };
  if (w.dir > 0) land(-L - E, -L, WH); else land(E, 0, 0);
  if (w.lhw > hw + .01) for (const sg of [-1, 1]) {                             // cầu thang hẹp hơn ô cửa → bít phần thừa
    const a = sg * hw, b = sg * w.lhw, [x0, x1] = sg < 0 ? [b, a] : [a, b];
    lq(v, X0, [[x0, WH, 0, 0, 0], [x1, WH, 0, 1, 0], [x1, 0, 0, 1, 1], [x0, 0, 0, 0, 1]], [0, 0, 1], wallMat);
  }
}

// ---------- 3. Đi lại trong cầu thang ----------
function wellAt(px, py, pad = .3) {
  for (const w of allWells().values()) {
    if (w.f !== F) continue; const [lx, lz] = wLocal(w, px, py);
    if (lz <= pad && lz >= -WELL_L - .1 && Math.abs(lx) <= w.hw + .05) return [w, lx, lz];
  }
  return null;
}
canStand = (o => function (x, y) {
  if (o(x, y)) return true;
  if (!STW.on) return false;
  const r = .22, q = wellAt(x, y, r + .02); if (!q) return false;
  const [w, lx, lz] = q; if (Math.abs(lx) > w.hw - r || lz < -WELL_L + .05) return false;
  for (const s of F.sprites) if (s.solid && !s.taken && Math.hypot(s.x - x, s.y - y) < s.solid) return false;
  for (const b of F.blocks || []) { const cx = Math.max(b[0], Math.min(x, b[2])), cz = Math.max(b[1], Math.min(y, b[3])); if (Math.hypot(x - cx, y - cz) < .2) return false; }
  return true;
})(canStand);
updatePlayer = (o => function (...a) { STW.on = player === P1 ? 1 : 0; try { return o.apply(this, a); } finally { STW.on = 0; } })(updatePlayer);

function wellSwitch(w, p) {                     // sang tầng kia ở giữa dãy bậc — hình y hệt nên không thấy giật
  const [lx, lz] = wLocal(w, p.x, p.y), t2 = w.p, [nx, ny] = wWorld(t2, -lx, -WELL_L - lz);
  const vx = Math.cos(p.a), vy = Math.sin(p.a), dlx = vx * w.c + vy * w.s, dlz = -vx * w.s + vy * w.c;
  const wx = -dlx * t2.c + dlz * t2.s, wy = -dlx * t2.s - dlz * t2.c;
  F = t2.f; Object.assign(p, { x: nx, y: ny, a: Math.atan2(wy, wx), f: F.id });
  if (w.arr) { F.arriveX = w.arr.x; F.arriveY = w.arr.y; }               // ma đuổi theo sẽ lên/xuống tới đây
  STW.F = F; try { showArea(F.name); } catch (e) {}
}

gameStep = (o => function (dt) {
  o(dt);
  const p = P1; if (!p || !S.started) return;
  if (STW.F !== F) { STW.F = F; STW.step = -1; }
  if (S.paused) return;
  const q = wellAt(p.x, p.y, .3);
  if (!q) { p.climb = 0; STW.step = -1; return; }
  let [w, lx, lz] = q;
  if (lz < -WELL_L / 2 - .05 && w.p) { wellSwitch(w, p); const q2 = wellAt(p.x, p.y, .3); if (!q2) { p.climb = 0; return; } [w, lx, lz] = q2; }
  const zc = w.dir > 0 ? lz : -WELL_L - lz, k = Math.max(0, Math.min(1, -zc / WELL_L));   // 0 = chân thang, 1 = đầu thang
  const h = k * WH; p.climb = w.dir > 0 ? h : h - WH;
  const si = Math.floor(k * WELL_N);
  if (si !== STW.step) { if (STW.step >= 0 && lz < 0) noise(.05, 230 + si * 4, .1, .7); STW.step = si; }   // kẽo kẹt mỗi bậc
})(gameStep);

// Cầu thang đi bộ được → không hiện gợi ý "E  Cầu thang..." nữa
computeAim = (o => function () { o(); if (aimed && aimed.c in STAIRS && wellOfCell(F, aimed.x, aimed.y)) aimed = null; })(computeAim);
