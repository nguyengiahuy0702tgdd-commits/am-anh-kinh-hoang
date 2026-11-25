// ===================== 8b. MÔ HÌNH 3D =====================
//  Mọi đồ vật được dựng từ hình khối 3D: hộp, trụ, nón, cầu.
//  XF(...) = phép đặt vị trí + xoay quanh trục đứng. Trục z cục bộ = hướng mặt trước của đồ vật.
let XFK = 1;
const XF = (ox, oy, oz, c = 1, s = 0, k = XFK) => ({ p: (x, y, z) => [ox + (x * c - z * s) * k, oy + y * k, oz + (x * s + z * c) * k], n: (x, y, z) => [x * c - z * s, y, x * s + z * c] });
const facing = phi => ({ c: Math.sin(phi), s: -Math.cos(phi) });               // phi = hướng nhìn trong mặt phẳng (x,z)
const XW = { p: (x, y, z) => [x, y, z], n: (x, y, z) => [x, y, z] };          // hệ tọa độ thế giới
const lay = m => LAYER.get(m) ?? 0;
function lq(v, X, pts, n, m) { const N = X.n(...n), L = lay(m); for (const i of [0, 1, 2, 0, 2, 3]) { const q = pts[i], P = X.p(q[0], q[1], q[2]); v.push(P[0], P[1], P[2], q[3], q[4], N[0], N[1], N[2], L); } }
// Hộp: m = vật liệu, hoặc { all, f (trước), fuv:[u0,v0,u1,v1], k (sau), l, r, t (trên), bt (dưới) }
function pbox(v, X, x0, y0, z0, x1, y1, z1, m) {
  if (!m) m = T.dark; if (m.d) m = { all: m }; const g = k => m[k] ?? m.all, [u0, v0, u1, v1] = m.fuv || [0, 0, 1, 1];
  lq(v, X, [[x0, y1, z1, u0, v0], [x1, y1, z1, u1, v0], [x1, y0, z1, u1, v1], [x0, y0, z1, u0, v1]], [0, 0, 1], g("f"));
  if (!m.noBack) lq(v, X, [[x1, y1, z0, 0, 0], [x0, y1, z0, 1, 0], [x0, y0, z0, 1, 1], [x1, y0, z0, 0, 1]], [0, 0, -1], g("k"));
  lq(v, X, [[x1, y1, z1, 0, 0], [x1, y1, z0, 1, 0], [x1, y0, z0, 1, 1], [x1, y0, z1, 0, 1]], [1, 0, 0], g("r"));
  lq(v, X, [[x0, y1, z0, 0, 0], [x0, y1, z1, 1, 0], [x0, y0, z1, 1, 1], [x0, y0, z0, 0, 1]], [-1, 0, 0], g("l"));
  lq(v, X, [[x0, y1, z0, 0, 0], [x1, y1, z0, 1, 0], [x1, y1, z1, 1, 1], [x0, y1, z1, 0, 1]], [0, 1, 0], g("t"));
  if (y0 > .001) lq(v, X, [[x0, y0, z1, 0, 0], [x1, y0, z1, 1, 0], [x1, y0, z0, 1, 1], [x0, y0, z0, 0, 1]], [0, -1, 0], g("bt"));
}
// Trụ/nón đứng (r0 ở đáy, r1 ở đỉnh), có thể chỉ một cung a0..a1
function pcyl(v, X, cx, cz, y0, y1, r0, r1, seg, m, cap, a0 = 0, a1 = Math.PI * 2) {
  for (let i = 0; i < seg; i++) {
    const A = a0 + (a1 - a0) * i / seg, B = a0 + (a1 - a0) * (i + 1) / seg, sa = Math.sin(A), ca = Math.cos(A), sb = Math.sin(B), cb = Math.cos(B);
    lq(v, X, [[cx + sa * r1, y1, cz + ca * r1, i / seg, 0], [cx + sb * r1, y1, cz + cb * r1, (i + 1) / seg, 0], [cx + sb * r0, y0, cz + cb * r0, (i + 1) / seg, 1], [cx + sa * r0, y0, cz + ca * r0, i / seg, 1]], [Math.sin((A + B) / 2), (r0 - r1) * .5, Math.cos((A + B) / 2)], m);
    if (cap) lq(v, X, [[cx, y1, cz, .5, .5], [cx + sa * r1, y1, cz + ca * r1, .5 + sa * .5, .5 + ca * .5], [cx + sb * r1, y1, cz + cb * r1, .5 + sb * .5, .5 + cb * .5], [cx, y1, cz, .5, .5]], [0, 1, 0], cap);
  }
}
// Trụ nằm ngang theo trục x (bánh xe)
function pcylX(v, X, cy, cz, x0, x1, r, seg, m, cap) {
  for (let i = 0; i < seg; i++) {
    const A = i / seg * Math.PI * 2, B = (i + 1) / seg * Math.PI * 2;
    lq(v, X, [[x1, cy + Math.sin(A) * r, cz + Math.cos(A) * r, 0, i / seg], [x1, cy + Math.sin(B) * r, cz + Math.cos(B) * r, 0, (i + 1) / seg], [x0, cy + Math.sin(B) * r, cz + Math.cos(B) * r, 1, (i + 1) / seg], [x0, cy + Math.sin(A) * r, cz + Math.cos(A) * r, 1, i / seg]], [0, Math.sin((A + B) / 2), Math.cos((A + B) / 2)], m);
    for (const [xx, nx] of [[x0, -1], [x1, 1]]) lq(v, X, [[xx, cy, cz, .5, .5], [xx, cy + Math.sin(A) * r, cz + Math.cos(A) * r, .5 + Math.cos(A) * .5, .5 + Math.sin(A) * .5], [xx, cy + Math.sin(B) * r, cz + Math.cos(B) * r, .5 + Math.cos(B) * .5, .5 + Math.sin(B) * .5], [xx, cy, cz, .5, .5]], [nx, 0, 0], cap);
  }
}
// Cầu (mặt hướng +z ở giữa texture)
function psphere(v, X, cx, cy, cz, r, seg, m, sy = 1) {
  for (let j = 0; j < seg; j++) for (let i = 0; i < seg * 2; i++) {
    const t0 = j / seg * Math.PI, t1 = (j + 1) / seg * Math.PI, p0 = i / (seg * 2) * Math.PI * 2 - Math.PI, p1 = (i + 1) / (seg * 2) * Math.PI * 2 - Math.PI;
    const P = (t, p) => [cx + Math.sin(t) * Math.sin(p) * r, cy + Math.cos(t) * r * sy, cz + Math.sin(t) * Math.cos(p) * r, (p + Math.PI) / (Math.PI * 2), t / Math.PI];
    const tm = (t0 + t1) / 2, pm = (p0 + p1) / 2;
    lq(v, X, [P(t0, p0), P(t0, p1), P(t1, p1), P(t1, p0)], [Math.sin(tm) * Math.sin(pm), Math.cos(tm), Math.sin(tm) * Math.cos(pm)], m);
  }
}
// Hộp khớp đúng một vùng của texture tường (tọa độ 0..128) rồi đắp nổi ra khỏi tường
function tb(v, X, tex, tx0, ty0, tx1, ty1, z0, z1, side, top) {
  pbox(v, X, tx0 / 128 - .5, WH * (1 - ty1 / 128), z0, tx1 / 128 - .5, WH * (1 - ty0 / 128), z1, { all: side, t: top || side, f: tex, fuv: [tx0 / 128, ty0 / 128, tx1 / 128, ty1 / 128] });
}
const PROP_DEPTH = { d: .1, i: .25, h: .08, g: .05, s: .15, k: .1, q: .1, f: .1, K: .58, F: .62, W: .6, B: .36, b: .36, D: .62, M: .48, T: .76, C: .4, P: .06, H: .34, V: .52, J: .52, Y: .45, G: .24, Z: .2, O: .92, R: .74, A: .55, X: .12, L: .1, Q: .1, 7: .02, 8: .02, 9: .02 };
const STAIRS = { U: 1, u: 1, N: -1, n: -1, j: 1, x: 1, r: -1, y: -1 };
function figure(v, X, dress, face, hair, bow) {     // búp bê
  pcyl(v, X, 0, 0, 0, .24, .11, .035, 10, dress, dress);
  pbox(v, X, -.065, .24, -.065, .065, .37, .065, { all: T.porcelain, f: face });
  pbox(v, X, -.07, .33, -.075, .07, .39, .07, hair); pbox(v, X, -.07, .2, -.075, .07, .37, -.05, hair);
  if (bow) { pbox(v, X, -.1, .35, -.02, -.05, .4, .03, T.redcloth); pbox(v, X, .05, .35, -.02, .1, .4, .03, T.redcloth); }
  pbox(v, X, -.12, .14, -.015, -.06, .2, .015, T.porcelain); pbox(v, X, .06, .14, -.015, .12, .2, .015, T.porcelain);
}
function candle3d(v, X, x, y, z, h = .15) { pcyl(v, X, x, z, y, y + h, .028, .026, 8, T.wax, T.wax); pcyl(v, X, x, z, y + h + .005, y + h + .06, .016, 0, 6, T.flame); }
function buildProp(v, c, X, tex, f) {
  if (propReal(v, c, X)) return;
  const D = PROP_DEPTH[c], dw = T.darkwood;
  switch (c) {
    case "K": tb(v, X, tex, 0, 56, 128, 128, 0, .58, dw, T.counter); tb(v, X, tex, 0, 8, 128, 44, 0, .33, dw); break;
    case "F": tb(v, X, tex, 24, 6, 104, 128, 0, .62, T.enamel); break;
    case "W": tb(v, X, tex, 14, 4, 114, 128, 0, .6, dw); break;
    case "B": tb(v, X, tex, 0, 0, 128, 128, 0, .36, dw); break;
    case "b": tb(v, X, tex, 6, 6, 122, 122, 0, .36, dw); break;
    case "D": tb(v, X, tex, 4, 64, 124, 74, 0, .62, dw); tb(v, X, tex, 10, 74, 118, 128, 0, .56, dw);
      { const y = WH * (1 - 64 / 128); pcyl(v, X, .28, .35, y, y + .02, .07, .07, 10, T.metal, T.metal); pcyl(v, X, .28, .35, y + .02, y + .3, .012, .012, 6, T.metal);
        pcyl(v, X, .28, .35, y + .26, y + .36, .12, .05, 12, T.lampShade, T.lampShade); pbox(v, X, -.35, y, .15, -.12, y + .008, .42, T.paperSheet); } break;
    case "M": tb(v, X, tex, 26, 8, 102, 108, 0, .05, dw);
      pbox(v, X, -.22, .62, 0, .22, .72, .44, { all: T.enamel, t: T.sinkTop }); pcyl(v, X, 0, .22, 0, .62, .06, .09, 10, T.enamel); pbox(v, X, -.02, .72, .03, .02, .84, .12, T.metal); break;
    case "T": tb(v, X, tex, 0, 62, 128, 128, 0, .76, T.enamel, T.bloodWater); pbox(v, X, -.04, WH * .52, .02, .04, WH * .72, .1, T.metal); break;
    case "C": tb(v, X, tex, 40, 6, 88, 128, 0, .4, dw); break;
    case "P": tb(v, X, tex, 14, 10, 114, 90, 0, .06, T.brass); break;
    case "H": tb(v, X, tex, 0, 24, 128, 32, 0, .34, dw); tb(v, X, tex, 2, 32, 126, 128, 0, .26, T.brick); candle3d(v, X, -.35, WH * .75, .16); candle3d(v, X, .38, WH * .75, .16, .1); break;
    case "V": tb(v, X, tex, 20, 84, 108, 128, 0, .52, dw); tb(v, X, tex, 24, 30, 104, 84, .04, .46, T.plastic); break;
    case "J": tb(v, X, tex, 14, 60, 114, 128, 0, .52, dw); tb(v, X, tex, 40, 2, 88, 56, 0, .04, dw); tb(v, X, tex, 46, 46, 82, 60, .12, .34, T.brass); break;
    case "Y": { tb(v, X, tex, 30, 78, 98, 84, 0, .45, dw); const yt = WH * (1 - 78 / 128);
      for (const [x, z] of [[-.2, .05], [.24, .05], [-.2, .38], [.24, .38]]) pbox(v, X, x - .02, 0, z - .02, x + .02, yt - .05, z + .02, dw);
      tb(v, X, tex, 44, 40, 84, 78, .1, .34, T.redcloth); figure(v, XF(...X.p(0, yt + WH * (38 / 128), .22), X.n(1, 0, 0)[0], X.n(1, 0, 0)[2], .35), T.whiteDress, T.dollFace, T.hair); break; }
    case "G": tb(v, X, tex, 8, 10, 120, 98, 0, .04, dw); tb(v, X, tex, 8, 92, 120, 98, 0, .24, dw); pbox(v, X, .1, WH * .45, .04, .14, WH * .85, .08, T.rust); break;
    case "Z": tb(v, X, tex, 28, 34, 100, 114, 0, .2, T.metal); pbox(v, X, -.3, .55, 0, -.26, WH, .05, T.metal); break;
    case "O": pcyl(v, X, 0, .48, 0, 1.0, .44, .44, 18, T.rust, T.rust); pcyl(v, X, 0, .48, 1.0, 1.08, .44, .3, 18, T.rust, T.rust);
      pcyl(v, X, .2, .48, 1.05, WH, .06, .06, 8, T.metal); pbox(v, X, -.5, .75, .06, .5, .84, .14, T.metal); pcyl(v, X, 0, .92, .55, .57, .09, .09, 10, T.gauge, T.gauge); break;
    case "R": tb(v, X, tex, 16, 44, 112, 128, 0, .74, T.crateBox, S.crate ? T.dark : T.crateBox); break;
    case "A": { tb(v, X, tex, 10, 68, 118, 128, 0, .55, T.redcloth); tb(v, X, tex, 46, 30, 82, 68, .12, .18, dw); const y = WH * (1 - 68 / 128);
      for (const [x, z, h] of [[-.4, .35, .16], [.4, .35, .16], [-.22, .45, .1], [.22, .45, .1]]) candle3d(v, X, x, y, z, h);
      if (S.altar) figure(v, XF(...X.p(.3, y, .3), X.n(1, 0, 0)[0], X.n(1, 0, 0)[2], .7), T.whiteDress, T.dollFace, T.hair, 1); break; }
    case "X": tb(v, X, tex, 12, 0, 18, 128, 0, .12, dw); tb(v, X, tex, 110, 0, 116, 128, 0, .12, dw); tb(v, X, tex, 12, 0, 116, 4, 0, .12, dw);
      tb(v, X, tex, 18, 4, 110, 128, 0, .06, T.doorRed); tb(v, X, tex, 84, 58, 106, 90, .06, .1, T.metal); pcyl(v, X, .25, .1, .62, .64, .03, .03, 8, T.brass, T.brass); break;
    case "i": pbox(v, X, -.05, .62, 0, .05, .7, .22, T.metal); pcyl(v, X, 0, .2, .68, 1.0, .03, .045, 7, T.darkwood); pcyl(v, X, 0, .2, 1.0, 1.2, .055, 0, 7, T.fire); break;
    case "h": tb(v, X, tex, 34, 20, 94, 96, 0, .08, T.gold); break;
    case "g": tb(v, X, tex, 30, 4, 98, 112, 0, .05, T.redcloth); break;
    case "s": tb(v, X, tex, 16, 2, 112, 128, 0, .15, T.stoneW); break;
    case "q": tb(v, X, tex, 10, 0, 118, 128, 0, .08, T.metal); break;
    case "k": { const opn = MAPID === "castle" ? S.gateOpen : S.freed, lift = opn ? (F.outdoor ? 9 : .95) : 0;
      if (lift < 5) { for (let i = 0; i < 9; i++) { const x = -.44 + i * .11; pbox(v, X, x - .016, lift, .03, x + .016, F.outdoor ? 2.2 : WH, .07, T.metal); if (F.outdoor) pcyl(v, X, x, .05, 2.2, 2.34, .025, 0, 4, T.metal); } for (const y of [.35, .85, 1.3]) pbox(v, X, -.5, y + lift, .02, .5, y + .05 + lift, .08, T.metal); }
      if (F.outdoor) for (const x of [-.62, .5]) pbox(v, X, x, 0, -.06, x + .12, 2.5, .14, T.stone); break; }
    case "L": case "Q": case "d": case "f": { const [a, b] = c === "L" ? [22, 106] : [22, 106]; tb(v, X, tex, a - 6, 0, a, 128, 0, .1, dw); tb(v, X, tex, b, 0, b + 6, 128, 0, .1, dw); tb(v, X, tex, a - 6, 0, b + 6, 5, 0, .1, dw);
      tb(v, X, tex, a, 5, b, 128, 0, .05, dw); pcyl(v, X, .3, .07, .6, .62, .025, .025, 8, T.brass, T.brass);
      if (c !== "L") { pbox(v, X, -.4, .62, .05, .4, .66, .08, T.metal); pbox(v, X, -.05, .5, .06, .05, .62, .1, T.metal); } break; }
    case "7": case "8": case "9": tb(v, X, tex, 14, 12, 114, 90, 0, .015, T.paperSheet); break;
  }
  return D;
}
function buildStairs(v, X, dir, sideL, sideR, wallMat) {
  const n = 9, bottom = dir > 0 ? 0 : -1.8;
  if (sideL) lq(v, X, [[-.5, WH, -1, 0, 0], [-.5, WH, 0, 1, 0], [-.5, bottom, 0, 1, 1], [-.5, bottom, -1, 0, 1]], [1, 0, 0], wallMat);
  if (sideR) lq(v, X, [[.5, WH, 0, 0, 0], [.5, WH, -1, 1, 0], [.5, bottom, -1, 1, 1], [.5, bottom, 0, 0, 1]], [-1, 0, 0], wallMat);
  lq(v, X, [[-.5, WH, -1, 0, 0], [.5, WH, -1, 1, 0], [.5, WH, 0, 1, 1], [-.5, WH, 0, 0, 1]], [0, -1, 0], T.dark);
  lq(v, X, [[-.5, WH, -1, 0, 0], [.5, WH, -1, 1, 0], [.5, bottom, -1, 1, 1], [-.5, bottom, -1, 0, 1]], [0, 0, 1], T.dark);
  for (let i = 0; i < n; i++) {
    const z0 = -(i + 1) / n, z1 = -i / n, top = dir > 0 ? (i + 1) * WH * .1 : -(i + 1) * .19;
    pbox(v, X, -.5, dir > 0 ? 0 : bottom, z0, .5, top, z1, { all: T.darkwood, t: T.stairTread, noBack: 1 });
    if (sideL && i % 2 === 0) pbox(v, X, -.46, top, z0 + .04, -.43, top + .75, z0 + .07, T.darkwood);
    if (sideL) pbox(v, X, -.475, top + .72, z0, -.415, top + .78, z1, T.darkwood);
  }
}
function furniture(v, s) {
  const K = sprK(s); if (K === 1) return furnitureRaw(v, s);
  XFK = K; const ob = s.base; if (ob) s.base = ob * K; try { furnitureRaw(v, s); } finally { XFK = 1; if (ob) s.base = ob; }
}
function furnitureRaw(v, s) {
  if (s.k === "task") return taskModel(v, s);
  if (s.k === "web") return webQuad(v, s);
  if (s.k && s.k.startsWith("r_")) return realModel(v, s);
  if (s.k && s.k.startsWith("d_")) return dressModel2(v, s) || dressModel(v, s);
  if (s.k) { if (!thing2(v, s)) forestThing(v, s); return; }
  const { c, s: sn } = facing(s.rot ?? -Math.PI / 2), X = XF(s.x, s.base || 0, s.y, c, sn), dw = T.darkwood;
  switch (s.t) {
    case T.sofa:
      pbox(v, X, -1, .1, -.42, 1, .42, .42, T.fabric); pbox(v, X, -1, .42, -.45, 1, .95, -.22, T.fabric);
      pbox(v, X, -1.12, .1, -.45, -.95, .65, .45, T.fabric); pbox(v, X, .95, .1, -.45, 1.12, .65, .45, T.fabric);
      pbox(v, X, -.95, .42, -.2, -.02, .5, .4, T.fabric); pbox(v, X, .02, .42, -.2, .95, .5, .4, T.fabric);
      for (const [x, z] of [[-1.05, -.4], [1.05, -.4], [-1.05, .4], [1.05, .4]]) pbox(v, X, x - .03, 0, z - .03, x + .03, .1, z + .03, dw); { const p = X.p(-1.12, 0, -.45), q = X.p(1.12, 0, .45); F.blocks.push([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]); } break;
    case T.rockChair:
      pbox(v, X, -.28, .42, -.25, .28, .48, .25, dw);
      for (const x of [-.27, .23]) { pbox(v, X, x, .48, -.27, x + .04, 1.15, -.22, dw); pbox(v, X, x, .06, .2, x + .04, .48, .24, dw); pbox(v, X, x, .06, -.25, x + .04, .48, -.21, dw); pbox(v, X, x - .01, 0, -.45, x + .05, .06, .45, dw); }
      for (let k = 0; k < 5; k++) pbox(v, X, -.23, .62 + k * .1, -.26, .23, .66 + k * .1, -.23, dw);
      pbox(v, X, -.22, .62, -.22, .22, 1.0, -.2, T.shawl); break;
    case T.chair:
      pbox(v, X, -.22, .42, -.22, .22, .47, .22, dw);
      for (const [x, z] of [[-.2, -.2], [.18, -.2], [-.2, .18], [.18, .18]]) pbox(v, X, x, 0, z, x + .03, .42, z + .03, dw);
      pbox(v, X, -.22, .47, -.24, .22, 1.08, -.2, dw); break;
    case T.car:
      pbox(v, X, -.82, .2, -1.75, .82, .72, 1.75, T.carPaint); pbox(v, X, -.74, .72, -.95, .74, 1.15, .55, { all: T.carWindow, t: T.carPaint });
      pbox(v, X, -.8, .2, 1.75, .8, .45, 1.8, T.metal); pbox(v, X, -.8, .2, -1.8, .8, .45, -1.75, T.metal);
      for (const [x, z, r] of [[-.82, 1.1, .32], [.82, 1.1, .32], [-.82, -1.1, .32], [.82, -1.1, .22]]) pcylX(v, X, r, z, x - .12, x + .12, r, 12, T.tire, T.hubcap);
      pbox(v, X, -.65, .52, 1.75, -.4, .64, 1.78, T.headlight); pbox(v, X, .4, .52, 1.75, .65, .64, 1.78, T.headlight); { const p = X.p(-.85, 0, -1.8), q = X.p(.85, 0, 1.8); F.blocks.push([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]); } break;
    case T.horse:
      for (const x of [-.14, .1]) pbox(v, X, x, 0, -.42, x + .04, .06, .42, T.redcloth);
      for (const [x, z] of [[-.12, -.22], [.08, -.22], [-.12, .2], [.08, .2]]) pbox(v, X, x, .06, z, x + .04, .38, z + .04, T.horseWood);
      pbox(v, X, -.12, .36, -.3, .12, .58, .3, T.horseWood); pbox(v, X, -.08, .55, .18, .08, .86, .32, T.horseWood); pbox(v, X, -.07, .76, .28, .07, .9, .52, T.horseWood);
      pbox(v, X, -.02, .62, .1, .02, .92, .24, T.hair); pbox(v, X, -.075, .84, .44, -.065, .86, .46, T.redEye); pbox(v, X, .065, .84, .44, .075, .86, .46, T.redEye); pbox(v, X, -.03, .4, -.36, .03, .55, -.3, T.hair); break;
    case T.doll: figure(v, X, T.redcloth, T.dollFace, T.hair); break;
    case T.dollLinh: figure(v, X, T.whiteDress, T.dollFace, T.hair, 1); break;
    case T.candle: candle3d(v, X, 0, 0, 0); break;
    case T.battery: pcyl(v, X, 0, 0, 0, .16, .045, .045, 10, T.battMat, T.metal); pcyl(v, X, 0, 0, .16, .18, .015, .015, 6, T.metal, T.metal); break;
    case T.hangDoll: pbox(v, X, -.008, .84, -.008, .008, ceilAt(s.x, s.y), .008, T.rope); figure(v, XF(s.x, .45, s.y, c, sn), T.redcloth, T.dollFace, T.hair); break;
    case "bulb": { const CH = ceilAt(s.x, s.y); pbox(v, XW, s.x - .006, CH - .32, s.y - .006, s.x + .006, CH, s.y + .006, T.rope); pcyl(v, XW, s.x, s.y, CH - .37, CH - .32, .02, .02, 6, T.metal);
      if (CH > 2) pcyl(v, XW, s.x, s.y, CH - .5, CH - .37, .28, .05, 10, T.metal, null); psphere(v, XW, s.x, CH - .42, s.y, .055, 6, S.power ? T.bulbOn : T.bulbOff, 1.2); break; }
  }
  if (s.mesh === "crate") { kbox(v, s, s.x - .36, 0, s.y - .36, s.x + .36, .72, s.y + .36, T.crateBox); kbox(v, s, s.x - .22, .72, s.y - .26, s.x + .24, 1.12, s.y + .2, T.crateBox); }
  if (s.mesh === "table") { kbox(v, s, s.x - .95, .5, s.y - .55, s.x + .95, .76, s.y + .55, T.cloth); for (const [dx, dz] of [[-.85, -.45], [.85, -.45], [-.85, .45], [.85, .45]]) kbox(v, s, s.x + dx - .04, 0, s.y + dz - .04, s.x + dx + .04, .5, s.y + dz + .04, dw); }
  if (s.mesh === "bed") {
    kbox(v, s, s.x - 1, 0, s.y - .55, s.x + 1, .48, s.y + .55, dw, T.sheet); kbox(v, s, s.x - 1.08, 0, s.y - .62, s.x - .98, 1.0, s.y + .62, dw);
    kbox(v, s, s.x + .98, 0, s.y - .62, s.x + 1.06, .65, s.y + .62, dw); kbox(v, s, s.x - .95, .48, s.y - .4, s.x - .62, .6, s.y + .4, T.cloth);
  }
}
// Con ma 3D (dựng lại mỗi khung hình, luôn quay mặt về phía bạn)

function refreshWalls() { WT = WALL_TEX(); WT["Ø"] = T.slamDoor; if (gl && LAYER.size) Object.values(FLOORS).forEach(buildFloorMesh); }
function resize() { let q = "net"; try { q = SET.quality; } catch (e) {} const dpr = Math.min(devicePixelRatio || 1, q === "ratnet" || q === "sieu" ? 2 : q === "net" ? 1.5 : 1); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; }
addEventListener("resize", resize); resize();
function ensureFBO() {
  const w = Math.max(64, Math.round(cv.width * SCALE)), h = Math.max(64, Math.round(cv.height * SCALE));
  if (w === fboW && h === fboH) return; fboW = w; fboH = h;
  if (fbo) { gl.deleteFramebuffer(fbo); gl.deleteTexture(fboTex); gl.deleteTexture(fboDepth); }
  fboTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, fboTex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  fboDepth = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, fboDepth); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, w, h); for (const [p, q] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, p, q);
  fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, fboDepth, 0);
}
function persp(fy, asp, n, f) { const t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
function lookAt(e, fw) {
  const z = [-fw[0], -fw[1], -fw[2]]; let x = [z[2], 0, -z[0]]; const xl = Math.hypot(x[0], x[2]) || 1; x = [x[0] / xl, 0, x[2] / xl];
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
}
function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }

let minGhostDraw = 99, lastR = 0;
function computeAim() {
  aimed = null; aimedSprite = null; const rx = Math.cos(player.a), ry = Math.sin(player.a);
  let mx = Math.floor(player.x), my = Math.floor(player.y);
  const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry), stx = rx < 0 ? -1 : 1, sty = ry < 0 ? -1 : 1;
  let sdx = rx < 0 ? (player.x - mx) * ddx : (mx + 1 - player.x) * ddx, sdy = ry < 0 ? (player.y - my) * ddy : (my + 1 - player.y) * ddy, side = 0, c = ".";
  for (let i = 0; i < 40; i++) { if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; } c = F.grid[my]?.[mx] ?? "#"; if (c !== ".") break; }
  const pd = side === 0 ? sdx - ddx : sdy - ddy;
  if (c in NAMES && pd < 1.7) aimed = { c, x: mx, y: my };
  for (const s of F.sprites) if (s.act && !s.taken) {
    const dx = s.x - player.x, dy = s.y - player.y, d = Math.hypot(dx, dy); let da = Math.atan2(dy, dx) - player.a; da = Math.atan2(Math.sin(da), Math.cos(da));
    const reach = s.reach || 1.7, tol = Math.max(.3, s.wide ? Math.atan2(s.wide * 2, d) : .3);
    if (d < reach && d < pd + .6 && Math.abs(da) < tol && (!aimedSprite || d < aimedSprite._d)) { aimedSprite = s; s._d = d; }
  }
}

function wallTexAt(c, fx, fy, hx, hy) {
  if (c !== "#") return WT[c] || T.paper;
  const rm = F.room[fy * F.w + fx], wt = rm ? rm.wall : F.defWall;
  return Array.isArray(wt) ? (((hx * 7 + hy * 13) % 9 === 0) ? wt[1] : wt[0]) : wt;
}
