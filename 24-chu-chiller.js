// =====================================================================
//  23. BẢN 10: chữ kinh dị Chiller (của Word) có dấu tiếng Việt · đồ vật đúng tỉ lệ
//      mạng nhện lớn/nhỏ · nhện rơi từ trần xuống hù · thêm đồ vật theo map
// =====================================================================
// ---- Chữ Chiller + dấu tiếng Việt ghép (Chiller chỉ có bảng mã Latin-1, không có đủ dấu) ----
const HZ_FONT = '"Chiller", "Grenze Gotisch", serif';
const HZ_SEL = ".logo, .hdr, .mname, .mnav a, .sbar a, #area, .overlay h1, #story .st, #loading .ln, #tasks .th, .netRow a";
const HZ = { on: false, ctx: document.createElement("canvas").getContext("2d"), cache: {}, busy: false };
HZ.on = false;   // bản 37: mọi máy dùng chung font Texturina (có sẵn dấu tiếng Việt) thay cho Chiller
const HZ_MARK = { "́": "ac", "̀": "gr", "̉": "ho", "̃": "ti", "̣": "db", "̂": "ci", "̆": "br", "̛": "hn" };
const latin1 = c => c.length === 1 && c.charCodeAt(0) <= 0xFF;
function hzMetric(ch) {
  if (HZ.cache[ch]) return HZ.cache[ch]; const g = HZ.ctx; g.font = "100px " + HZ_FONT; const m = g.measureText(ch);
  return HZ.cache[ch] = { w: m.width / 100, asc: (m.actualBoundingBoxAscent || 70) / 100, desc: (m.actualBoundingBoxDescent || 0) / 100, l: (m.actualBoundingBoxLeft || 0) / 100, r: (m.actualBoundingBoxRight || m.width) / 100 };
}
function hzGlyph(ch) {
  if (latin1(ch) || !/[À-ỹ]/.test(ch)) return null;
  if (ch === "Đ") return { base: "Ð", marks: [] };
  if (ch === "đ") return { base: "d", marks: ["st"] };
  const d = ch.normalize("NFD"); let base = d[0], marks = [...d.slice(1)];
  for (let pass = 0; pass < 2; pass++) for (const m of marks) { const c = (base + m).normalize("NFC"); if (latin1(c)) { base = c; marks = marks.filter(x => x !== m); break; } }
  return { base, marks: marks.map(m => HZ_MARK[m]).filter(Boolean) };
}
function horrorize(el) {
  if (!HZ.on || !el || HZ.busy) return; const txt = el.textContent; if (el.dataset.hz === txt) return;
  HZ.busy = true;
  try {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest(".hza, .drip") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }), nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    for (const n of nodes) {
      const s = n.nodeValue; if (![...s].some(hzGlyph)) continue; const frag = document.createDocumentFragment(); let buf = "";
      for (const ch of s) {
        const G = hzGlyph(ch); if (!G) { buf += ch; continue; }
        buf += G.base; frag.appendChild(document.createTextNode(buf)); buf = "";
        const M = hzMetric(G.base), a = document.createElement("span"); a.className = "hza"; let up = 0, upLeft = 0;
        for (const k of G.marks) {
          const i = document.createElement("i"); i.className = "hzm " + k; const cx = -M.w + (M.r - M.l) / 2 + M.l;
          if (k === "db") { i.style.left = cx + "em"; i.style.bottom = -(M.desc + .16) + "em"; }
          else if (k === "hn") { i.style.left = (-M.w + M.r - .05) + "em"; i.style.bottom = (Math.min(M.asc, .55) - .04) + "em"; }
          else if (k === "st") { i.style.left = (cx + .06) + "em"; i.style.bottom = (M.asc * .7) + "em"; }
          else { i.style.left = (cx + upLeft) + "em"; i.style.bottom = (M.asc + .07 + up) + "em"; if (k === "ci") upLeft = .14; else up += k === "br" ? .13 : .1; if (k === "ci") up += .05; }
          a.appendChild(i);
        }
        frag.appendChild(a);
      }
      if (buf) frag.appendChild(document.createTextNode(buf));
      n.parentNode.replaceChild(frag, n);
    }
    el.dataset.hz = el.textContent;
  } finally { HZ.busy = false; }
}
function horrorizeAll(root = document) { if (!HZ.on) return; root.querySelectorAll(HZ_SEL).forEach(horrorize); }
if (HZ.on) {
  document.documentElement.classList.add("hz-on");
  new MutationObserver(ms => { if (HZ.busy) return; const set = new Set(); for (const m of ms) { const e = (m.target.nodeType === 1 ? m.target : m.target.parentElement)?.closest?.(HZ_SEL); if (e) set.add(e); } set.forEach(e => queueMicrotask(() => horrorize(e))); })
    .observe(document.body, { childList: true, characterData: true, subtree: true });
}

// ---- Đồ vật đúng kích thước: thế giới ~0,47 đơn vị/mét (mắt người cao 1,55 m = 0,72) ----
const NOSCALE = new Set(["task", "web", "chandelier", "chains", "meat", "valve", "bell", "noose", "effigy", "tree", "dead", "willow", "lantern", "slantern", "angel"]);
const KH = {};

function kbox(v, s, x0, y0, z0, x1, y1, z1, side, top) { const k = XFK; box(v, s.x + (x0 - s.x) * k, y0 * k, s.y + (z0 - s.y) * k, s.x + (x1 - s.x) * k, y1 * k, s.y + (z1 - s.y) * k, side, top); }
function scaleSolids() {
  for (const f of Object.values(FLOORS)) { const _F = F; F = f; for (const s of f.sprites) if (s.solid && !s._ks) { s._ks = 1; const k = sprK(s); if (k !== 1) s.solid = Math.max(.15, s.solid * .62); } F = _F; }
}

// ---- Mạng nhện lớn & nhỏ ----
function buildWebTextures() {
  T.webCorner = tex(g => { g.strokeStyle = "rgba(225,225,215,1)"; g.lineWidth = 1.3; g.lineCap = "round";
    const rays = 9; for (let i = 0; i <= rays; i++) { const a = i / rays * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 180, Math.sin(a) * 180); g.stroke(); }
    for (let r = 10; r < 170; r += 9 + r * .06) { g.beginPath(); for (let i = 0; i <= rays; i++) { const a = i / rays * Math.PI / 2, rr = r * (1 + Math.sin(i * 2.3 + r) * .06) - (i % 2) * 2; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); }
    g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(rnd() * 128, rnd() * 128); g.quadraticCurveTo(rnd() * 128, rnd() * 128, rnd() * 128, rnd() * 128); g.stroke(); } });
  T.webFull = tex(g => { g.strokeStyle = "rgba(225,225,215,1)"; g.lineWidth = 1.2; const cx = 64, cy = 60, rays = 14;
    for (let i = 0; i < rays; i++) { const a = i / rays * 6.283; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 90, cy + Math.sin(a) * 90); g.stroke(); }
    for (let r = 6; r < 62; r += 4.2 + r * .05) { g.beginPath(); for (let i = 0; i <= rays; i++) { const a = i / rays * 6.283, rr = r - (i % 2) * 1.4; i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.stroke(); }
    g.clearRect(cx + 10, cy + 6, 30, 26); g.beginPath(); g.moveTo(cx + 12, cy + 30); g.lineTo(cx + 40, cy + 8); g.stroke(); });
  T.spiderT = tex(g => { R(g, 0, 0, 128, 128, "#120d0b"); for (let i = 0; i < 400; i++) R(g, rnd() * 128, rnd() * 128, 1, 2 + rnd() * 3, "rgba(90,70,55,.4)"); for (let i = 0; i < 4; i++) E(g, 40 + i * 14, 50 + (i % 2) * 8, 4, 6, "rgba(140,20,10,.8)"); });
  T.boneT = tex(g => { R(g, 0, 0, 128, 128, "#cfc4a8"); for (let i = 0; i < 60; i++) R(g, rnd() * 128, rnd() * 128, 2, 4, "rgba(90,70,40,.3)"); });
  T.furT = tex(g => { R(g, 0, 0, 128, 128, "#5a3e28"); for (let i = 0; i < 500; i++) R(g, rnd() * 128, rnd() * 128, 1, 3, "rgba(30,15,5,.35)"); });
  T.spoolT = ["#7a1c1c", "#2a4a6a", "#c8b48a", "#3a5a3a"].map(c => tex(g => { R(g, 0, 0, 128, 128, c); for (let y = 0; y < 128; y += 3) R(g, 0, y, 128, 1, "rgba(0,0,0,.25)"); }));
}
function webQuad(v, s) {
  const L = LAYER.get(s.full ? T.webFull : T.webCorner);
  if (s.full) { const [ax, az, bx, bz, y0, y1] = s.q; quad(v, [[ax, y1, az, 0, 0], [bx, y1, bz, 1, 0], [bx, y0, bz, 1, 1], [ax, y0, az, 0, 1]], [bz - az, 0, ax - bx], L); return; }
  const { cx, cz, sx, sy, h, L: len } = s, C = [cx, h - len * 1.1, cz], P1 = [cx, h, cz - sy * len], P2 = [cx - sx * len, h, cz], M = [cx - sx * len * .9, h, cz - sy * len * .9];
  quad(v, [[...C, 0, 0], [...P1, 1, 0], [...M, 1, 1], [...P2, 0, 1]], [-sx, -.5, -sy], L);
}
function addWebs(f) {
  const rng = Math.random;
  for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
    if (f.grid[y][x] !== "." || (f.outdoor && !f.room[y * f.w + x]?.roof)) continue;
    const h = f.room[y * f.w + x]?.h ?? WH;
    for (const [sx, sy] of cornerList(f, x, y)) {
      if (rng() < .45) f.sprites.push({ k: "web", x: x + .5, y: y + .5, cx: x + (sx > 0 ? 1 : 0), cz: y + (sy > 0 ? 1 : 0), sx, sy, h: h - .01, L: .45 + rng() * .5 });   // mạng nhện lớn góc trần
      else if (rng() < .35) f.sprites.push({ k: "web", x: x + .5, y: y + .5, cx: x + (sx > 0 ? 1 : 0), cz: y + (sy > 0 ? 1 : 0), sx, sy, h: .32 + rng() * .2, L: .16 + rng() * .12 });   // mạng nhỏ góc sàn
    }
  }
  if (f.outdoor && MAPID === "forest") {   // mạng nhện lớn giăng giữa hai thân cây
    const trees = f.sprites.filter(s => s.k === "tree" || s.k === "dead"); let n = 0;
    for (let i = 0; i < trees.length && n < 40; i++) { const a = trees[i], b = trees.find(t => t !== a && Math.hypot(t.x - a.x, t.y - a.y) > 1 && Math.hypot(t.x - a.x, t.y - a.y) < 2.1); if (!b || rng() > .35) continue;
      const y0 = .25 + rng() * .3; f.sprites.push({ k: "web", full: 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, q: [a.x, a.y, b.x, b.y, y0, y0 + .9 + rng() * .4] }); n++; }
  }
}

// ---- Nhện: con lớn rơi từ trần xuống ngay trước mặt, con nhỏ bò lổm ngổm ----
const SPIDERS = [];
function setupSpiders() {
  SPIDERS.length = 0; const start = { f: F.id, x: P1.x, y: P1.y };
  for (const f of Object.values(FLOORS)) {
    const cells = []; for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) if (f.grid[y][x] === "." && (!f.outdoor || f.room[y * f.w + x]?.roof || MAPID === "forest")) cells.push([x, y]);
    if (!cells.length) continue;
    const nDrop = Math.max(3, Math.min(12, Math.round(cells.length / (f.outdoor ? 260 : 90)))), nCrawl = Math.max(3, Math.min(14, Math.round(cells.length / 70)));
    for (let i = 0; i < nDrop + nCrawl; i++) {
      const [x, y] = cells[Math.floor(Math.random() * cells.length)]; if (f.id === start.f && Math.hypot(x - start.x, y - start.y) < 7) continue;
      const top = f.outdoor && !f.room[y * f.w + x] ? 2.4 : (f.room[y * f.w + x]?.h ?? WH) - .02;
      SPIDERS.push(i < nDrop ? { f: f.id, x: x + .5, y: y + .5, top, cy: top - .05, st: "idle", t: 0, cd: 0, big: 1, face: Math.random() * 6.28 } : { f: f.id, x: x + .5, y: y + .5, cy: 0, st: "crawl", face: Math.random() * 6.28, sp: .25 + Math.random() * .3, t: Math.random() * 9 });
    }
  }
}

function legSeg(v, A, B, r, m) {
  const dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2], hz = Math.hypot(dx, dz), len = Math.hypot(hz, dy); if (len < 1e-5) return;
  const f = facing(Math.atan2(dz, dx)), X = XL(XF(A[0], A[1], A[2], f.c, f.s), 0, 0, 0, -Math.atan2(dy, hz), 0); pbox(v, X, -r, -r, 0, r, r, len, m);
}

// ---- Thêm đồ vật theo chủ đề từng map ----
Object.assign(PROPTHEME, {
  house: [...PROPTHEME.house, "d_teddy", "d_lamp", "d_trunk", "d_teddy", "d_candles"],
  castle: [...PROPTHEME.castle, "d_skulls", "d_cage", "d_candles", "d_skulls", "d_trunk"],
  factory: [...PROPTHEME.factory, "d_spools", "d_sewing", "d_spools", "d_sewing"],
  forest: [...PROPTHEME.forest, "d_trap", "d_skulls"],
  cemetery: [...PROPTHEME.cemetery, "d_candles", "d_skulls", "d_candles"],
});
Object.assign(PROP_SOLID, { d_teddy: .2, d_lamp: .18, d_trunk: .38, d_candles: 0, d_skulls: .2, d_cage: .4, d_spools: .3, d_sewing: .42, d_trap: 0 });
function dressModel2(v, s) {
  const { c, s: sn } = facing(s.rot ?? 0), X = XF(s.x, 0, s.y, c, sn), sd = s.seed || .5, rr = k => (Math.sin(sd * 999 + k * 77.7) + 1) / 2, dw = T.darkwood;
  switch (s.k) {
    case "d_teddy": { const Y = XL(X, 0, .2, 0, .25, (rr(1) - .5) * .5); psphere(v, XSp(Y, 0, .2, 0, 1, 1.1, .9), 0, .2, 0, .16, 9, T.furT); psphere(v, Y, 0, .46, .02, .12, 9, T.furT);
      for (const sx of [-1, 1]) { psphere(v, Y, sx * .09, .56, 0, .045, 6, T.furT); psphere(v, Y, sx * .14, .2, .1, .065, 6, T.furT); psphere(v, Y, sx * .1, .04, .14, .07, 6, T.furT); psphere(v, Y, sx * .04, .48, .12, .014, 4, T.dark); }
      psphere(v, Y, 0, .43, .12, .03, 5, T.dark); pbox(v, Y, -.06, .25, .13, .06, .27, .15, T.redcloth); break; }
    case "d_lamp": pcyl(v, X, 0, 0, 0, .04, .16, .16, 12, T.metal, T.metal); pcyl(v, X, 0, 0, .04, 1.45, .015, .015, 6, T.metal); pcyl(v, X, 0, 0, 1.3, 1.6, .26, .14, 14, T.lampShade || T.clWhite, null); break;
    case "d_trunk": pbox(v, X, -.42, 0, -.25, .42, .42, .25, dw); pcylX(v, X, .42, 0, -.42, .42, .25, 10, dw, dw); for (const x of [-.3, .3]) { pbox(v, X, x - .03, 0, -.26, x + .03, .44, .26, T.metal); } pbox(v, X, -.05, .3, .25, .05, .4, .28, T.brass || T.metal); break;
    case "d_candles": for (let i = 0; i < 5; i++) { const x = (rr(i) - .5) * .4, z = (rr(i + 4) - .5) * .3, h = .06 + rr(i + 9) * .16; pcyl(v, X, x, z, 0, .012, .05, .06, 8, T.wax, T.wax); candle3d(v, X, x, .01, z, h); } break;
    case "d_skulls": for (let i = 0; i < 3 + Math.floor(rr(2) * 3); i++) { const x = (rr(i) - .5) * .5, z = (rr(i + 3) - .5) * .4, y = i > 3 ? .16 : 0, a = rr(i + 7) * 6, S = XL(XF(...X.p(x, y, z), Math.cos(a), Math.sin(a)), 0, 0, 0, (rr(i) - .5) * .4, 0);
      psphere(v, XSp(S, 0, .1, 0, .9, 1, 1.1), 0, .1, 0, .1, 8, T.boneT); pbox(v, S, -.05, 0, .02, .05, .05, .1, T.boneT); for (const sx of [-1, 1]) psphere(v, S, sx * .038, .11, .085, .026, 5, T.dark); } break;
    case "d_cage": { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; pcyl(v, X, Math.cos(a) * .32, Math.sin(a) * .32, 0, 1.1, .012, .012, 4, T.metal); } pcyl(v, X, 0, 0, 0, .04, .34, .34, 14, T.metal, T.metal); pcyl(v, X, 0, 0, 1.1, 1.3, .34, .05, 14, T.metal, T.metal);
      psphere(v, XSp(X, 0, .1, 0, .9, 1, 1.1), 0, .1, 0, .1, 8, T.boneT); for (let i = 0; i < 4; i++) pcylX(v, XL(X, 0, .03, 0, 0, 0), .02, (i - 1.5) * .08, -.18, .18, .018, 5, T.boneT, T.boneT); break; }
    case "d_spools": for (let i = 0; i < 6; i++) { const x = (i % 3 - 1) * .2, z = (Math.floor(i / 3) - .5) * .2, y = 0; pcyl(v, X, x, z, y, y + .26, .085, .085, 10, T.spoolT[Math.floor(rr(i) * 4) % 4], T.palletT || dw); pcyl(v, X, x, z, y + .26, y + .28, .095, .095, 10, T.palletT || dw, T.palletT || dw); } break;
    case "d_sewing": pbox(v, X, -.5, .7, -.28, .5, .76, .28, dw); for (const [x, z] of [[-.45, -.24], [.45, -.24], [-.45, .24], [.45, .24]]) pbox(v, X, x - .025, 0, z - .025, x + .025, .7, z + .025, T.metal);
      pbox(v, X, -.28, .76, -.08, .26, .86, .1, T.dark); pbox(v, X, .14, .86, -.08, .26, 1.12, .08, T.dark); pbox(v, X, -.3, 1.04, -.06, .26, 1.14, .07, T.dark); pbox(v, X, -.27, .86, -.02, -.23, 1.04, .02, T.metal); pcylX(v, X, 1.06, 0, .26, .3, .07, 10, T.metal, T.metal); pbox(v, X, -.2, .765, -.2, .1, .77, .02, T.clRed || T.redcloth); break;
    case "d_trap": for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; pbox(v, XF(...X.p(Math.cos(a) * .18, 0, Math.sin(a) * .18), Math.cos(a), Math.sin(a)), -.03, 0, -.01, .03, .05 + (i % 2) * .03, .01, T.rust || T.metal); } pcyl(v, X, 0, 0, 0, .015, .2, .2, 16, T.rust || T.metal, null); pbox(v, X, -.04, 0, -.04, .04, .02, .04, T.metal); break;
    default: return false;
  }
  return true;
}
