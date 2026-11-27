// =====================================================================
//  26. BẢN 13: không đi xuyên đồ vật · nhìn ra ngoài cửa sổ · nhiệm vụ theo độ khó
//      nghĩa trang có vong bay · mở rộng bản đồ (khu nhà mới / khu rừng & nghĩa trang mới)
// =====================================================================
const h32 = (a, b, c = 0) => { let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

// ---------- 1. VẬT LIỆU ----------
function texE(draw, emit) {   // phát sáng vẽ riêng, không đè lên màu gốc
  const t0 = tex(draw); const c2 = document.createElement("canvas"); c2.width = c2.height = 256; const g2 = c2.getContext("2d"); g2.scale(2, 2); R(g2, 0, 0, 128, 128, "#000"); emit(g2, 128, 128); t0.ec = c2; return t0;
}
function buildV13Textures() {
  if (T.r_view) return;
  const noiseOn = (g, n, c) => { for (let i = 0; i < n; i++) R(g, rnd() * 128, rnd() * 128, 1 + rnd() * 2, 1 + rnd() * 2, c); };
  const sky = (g, top, bot) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); };
  const pine = (g, x, base, h, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, base - h); for (let i = 0; i <= 6; i++) { const y = base - h + h * i / 6, w = h * .18 * (i / 6) + 1; g.lineTo(x + w, y + 2); g.lineTo(x + w * .45, y + 2); } g.lineTo(x - h * .09, base); for (let i = 6; i >= 0; i--) { const y = base - h + h * i / 6, w = h * .18 * (i / 6) + 1; g.lineTo(x - w * .45, y + 2); g.lineTo(x - w, y + 2); } g.fill(); };
  const bare = (g, x, base, h, c) => { g.strokeStyle = c; g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, base); g.lineTo(x + 1, base - h); g.stroke(); g.lineWidth = 1; for (let i = 0; i < 7; i++) { const y = base - h * (.35 + i * .09), d = (i % 2 ? 1 : -1) * (5 + rnd() * 8); g.beginPath(); g.moveTo(x, y); g.lineTo(x + d, y - 6 - rnd() * 6); g.stroke(); } };
  const moon = (g, x, y, r) => { const gr = g.createRadialGradient(x, y, 0, x, y, r * 3); gr.addColorStop(0, "rgba(220,225,200,.5)"); gr.addColorStop(1, "rgba(220,225,200,0)"); g.fillStyle = gr; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); E(g, x, y, r, r, "#d8dcc8"); E(g, x - r * .3, y - r * .2, r * .25, r * .2, "rgba(150,150,130,.6)"); E(g, x + r * .3, y + r * .3, r * .2, r * .18, "rgba(150,150,130,.5)"); };
  const views = {
    house: [g => { sky(g, "#0c1420", "#1c2632"); moon(g, 92, 26, 8); for (let i = 0; i < 4; i++) E(g, 20 + i * 30, 40 + (i % 2) * 8, 26, 4, "rgba(40,48,60,.7)");
      g.fillStyle = "#06080a"; g.fillRect(70, 64, 34, 30); g.beginPath(); g.moveTo(66, 66); g.lineTo(87, 48); g.lineTo(108, 66); g.fill(); R(g, 80, 72, 6, 7, "#c8a050");
      for (let x = 0; x < 128; x += 7) pine(g, x + rnd() * 4, 100, 26 + rnd() * 22, "#05070a"); bare(g, 30, 102, 50, "#040506"); for (let x = 0; x < 128; x += 5) R(g, x, 96, 2, 14, "#0a0c0e"); R(g, 0, 98, 128, 2, "#0a0c0e"); R(g, 0, 108, 128, 20, "#070908"); },
      g => { sky(g, "#0e1520", "#141a22"); moon(g, 92, 26, 8); R(g, 80, 72, 6, 7, "#e8b860"); g.fillStyle = "#000"; g.fillRect(0, 98, 128, 30); }],
    factory: [g => { sky(g, "#1a1010", "#3a2418"); moon(g, 30, 22, 6); g.fillStyle = "#070504"; for (const [x, w, h] of [[10, 8, 60], [24, 6, 48], [96, 10, 70]]) { g.fillRect(x, 100 - h, w, h); }
      g.fillRect(40, 70, 40, 30); E(g, 60, 70, 20, 8, "#070504"); g.fillRect(84, 78, 30, 22); g.strokeStyle = "#070504"; g.lineWidth = 2; g.beginPath(); g.moveTo(100, 30); g.lineTo(128, 30); g.moveTo(104, 30); g.lineTo(104, 100); g.stroke(); g.lineWidth = .6; for (let x = 0; x < 128; x += 4) { g.beginPath(); g.moveTo(x, 96); g.lineTo(x + 4, 110); g.moveTo(x + 4, 96); g.lineTo(x, 110); g.stroke(); }
      for (let i = 0; i < 6; i++) R(g, 44 + i * 6, 80, 3, 4, i % 3 ? "#1a1008" : "#c87030"); R(g, 0, 110, 128, 18, "#080606"); },
      g => { sky(g, "#1c1008", "#2c1808"); moon(g, 30, 22, 6); for (let i = 0; i < 6; i++) if (!(i % 3)) R(g, 44 + i * 6, 80, 3, 4, "#ff9040"); g.fillStyle = "#000"; g.fillRect(0, 100, 128, 28); }],
    hospital: [g => { sky(g, "#140c0c", "#2a1a1a"); moon(g, 100, 20, 6); g.fillStyle = "#050404"; for (const [x, w2, h2] of [[0, 18, 50], [20, 14, 36], [36, 22, 62], [62, 16, 40], [80, 26, 70], [108, 20, 46]]) g.fillRect(x, 100 - h2, w2, h2);
      for (let i = 0; i < 26; i++) R(g, rnd() * 128, 40 + rnd() * 55, 2, 2, rnd() < .3 ? "#8a6a3a" : "#151210"); R(g, 0, 100, 128, 28, "#070606"); for (let x = 6; x < 128; x += 22) R(g, x, 104, 12, 5, "#101010"); R(g, 56, 70, 3, 10, "#5a0a0a"); R(g, 53, 73.5, 9, 3, "#5a0a0a");
      g.strokeStyle = "rgba(120,130,140,.3)"; g.lineWidth = .6; for (let i = 0; i < 40; i++) { const x = rnd() * 128, y = rnd() * 128; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 7); g.stroke(); } },
      g => { sky(g, "#1a0e0e", "#1e1414"); moon(g, 100, 20, 6); R(g, 56, 70, 3, 10, "#ff3020"); R(g, 53, 73.5, 9, 3, "#ff3020"); for (let i = 0; i < 8; i++) R(g, rnd() * 128, 40 + rnd() * 55, 2, 2, "#c89050"); g.fillStyle = "#000"; g.fillRect(0, 100, 128, 28); }],
    castle: [g => { sky(g, "#0a1018", "#26303a"); moon(g, 40, 22, 9); g.fillStyle = "#151a20"; g.beginPath(); g.moveTo(0, 80); for (let x = 0; x <= 128; x += 8) g.lineTo(x, 60 + Math.sin(x * .08) * 12 + rnd() * 5); g.lineTo(128, 128); g.lineTo(0, 128); g.fill();
      R(g, 0, 78, 128, 10, "rgba(120,130,140,.35)"); for (let x = 0; x < 128; x += 5) pine(g, x + rnd() * 3, 112, 14 + rnd() * 12, "#06080a"); for (let i = 0; i < 7; i++) R(g, 60 + rnd() * 40, 92 + rnd() * 6, 2, 2, "#d8a050"); R(g, 0, 112, 128, 16, "#050607"); },
      g => { sky(g, "#0c121c", "#161c24"); moon(g, 40, 22, 9); g.fillStyle = "#000"; g.fillRect(0, 70, 128, 58); }],
  };
  const vw = views[MAPID] || views.house; T.r_view = texE(vw[0], vw[1]);
  T.r_sky = texE(g => { R(g, 0, 0, 128, 128, "#0a1018"); for (let i = 0; i < 70; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, "#9aa4b0"); }, g => { R(g, 0, 0, 128, 128, "#080c10"); for (let i = 0; i < 40; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, "#c8d0e0"); });
  T.r_ground = texE(g => { const base = { factory: "#1c1a18", castle: "#22241e" }[MAPID] || "#141c12"; R(g, 0, 0, 128, 128, base); noiseOn(g, 900, "rgba(0,0,0,.35)"); for (let i = 0; i < 300; i++) R(g, rnd() * 128, rnd() * 128, 1, 3, MAPID === "factory" ? "rgba(80,70,60,.3)" : "rgba(60,80,40,.35)"); for (let i = 0; i < 6; i++) stain(g, rnd() * 128, rnd() * 128, 16, "rgba(0,0,0,.4)"); },
    g => R(g, 0, 0, 128, 128, "#05080a"));
  T.r_orb = texE(g => R(g, 0, 0, 128, 128, "#a8d8e8"), g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 70); gr.addColorStop(0, "#e8ffff"); gr.addColorStop(1, "#4a8aa0"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  T.r_chalk = texE(g => { g.strokeStyle = "#d8d4c8"; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 44, 0, 7); g.stroke(); g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 5 * Math.PI * 4 - Math.PI / 2; g.lineTo(64 + Math.cos(a) * 42, 64 + Math.sin(a) * 42); } g.stroke(); g.font = "bold 9px serif"; g.fillStyle = "#d8d4c8"; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.fillText("ᚱᛟᛞ"[i % 3] || "x", 61 + Math.cos(a) * 49, 67 + Math.sin(a) * 49); } },
    g => { g.strokeStyle = "#304850"; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.stroke(); });
  if (MAPID === "cemetery") {
    T.vongFace = texE(g => { R(g, 0, 0, 128, 128, "#6a7276"); E(g, 64, 66, 30, 42, "#9ca6a8"); E(g, 52, 56, 9, 11, "#050608"); E(g, 76, 56, 9, 11, "#050608"); E(g, 64, 92, 8, 13, "#080406"); for (let i = 0; i < 3; i++) R(g, 50 + i * 12, 62, 2, 30, "rgba(40,20,20,.5)"); R(g, 30, 0, 68, 18, "#050506"); },
      g => { E(g, 52, 57, 3, 3, "rgba(170,220,230,.9)"); E(g, 76, 57, 3, 3, "rgba(170,220,230,.9)"); E(g, 64, 66, 30, 42, "#0e1416"); E(g, 52, 57, 3, 3, "#a8e0f0"); E(g, 76, 57, 3, 3, "#a8e0f0"); });
    T.vongCloth = texE(g => { R(g, 0, 0, 128, 128, "#6e7678"); for (let i = 0; i < 500; i++) R(g, rnd() * 128, rnd() * 128, 1, 3, "rgba(20,24,26,.35)"); for (let x = 0; x < 128; x += 6) R(g, x, 0, 2, 128, "rgba(80,90,95,.35)"); for (let i = 0; i < 8; i++) stain(g, rnd() * 128, rnd() * 128, 14, "rgba(60,50,40,.4)"); stain(g, 60, 100, 18, "rgba(70,10,10,.5)"); },
      g => R(g, 0, 0, 128, 128, "#0b1012"));
  }
}

// ---------- 2. KHÔNG ĐI XUYÊN ĐỒ VẬT ----------
// Đo hình dáng thật của từng món (phần thân từ sàn tới ngang ngực) rồi đặt vùng va chạm phủ kín nó
const NOSOLID = new Set(["web", "task", "r_col", "d_frame", "d_bottles", "d_candles", "d_flowers", "d_mush", "d_trap", "ashes", "bones", "effigy", "noose", "chains", "meat", "chandelier", "lantern", "valve", "bell"]);
function localPassOK(f, cx, cy, cols) {
  if (!cols.length) return true; const R = 3.4, st = .25, n = Math.ceil(2 * R / st), x0 = cx - R, y0 = cy - R, gfree = (x, y) => f.grid[Math.floor(y)]?.[Math.floor(x)] === ".";
  const sol = f.sprites.filter(s => s.solid && !s.taken && Math.abs(s.x - cx) < R + 1.5 && Math.abs(s.y - cy) < R + 1.5), blk = (f.blocks || []).filter(b => b[2] > x0 - 1 && b[0] < x0 + 2 * R + 1 && b[3] > y0 - 1 && b[1] < y0 + 2 * R + 1);
  const ok = (x, y, extra) => { const r = .22; if (!(gfree(x - r, y - r) && gfree(x + r, y - r) && gfree(x - r, y + r) && gfree(x + r, y + r))) return false; for (const s of sol) if (Math.hypot(s.x - x, s.y - y) < s.solid) return false; if (extra) for (const s of cols) if (Math.hypot(s.x - x, s.y - y) < s.solid) return false;
    for (const b of blk) { const qx = Math.max(b[0], Math.min(x, b[2])), qy = Math.max(b[1], Math.min(y, b[3])); if (Math.hypot(x - qx, y - qy) < .2) return false; } return true; };
  const A = new Uint8Array(n * n), B = new Uint8Array(n * n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * st, y = y0 + (j + .5) * st; if (ok(x, y, false)) { A[j * n + i] = 1; B[j * n + i] = ok(x, y, true) ? 1 : 0; } }
  const lab = G => { const L = new Int32Array(n * n).fill(-1); let c = 0; const q = []; for (let i = 0; i < n * n; i++) { if (!G[i] || L[i] >= 0) continue; L[i] = c; q.push(i); while (q.length) { const p = q.pop(), x = p % n, y = (p - x) / n; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue; const k = ny * n + nx; if (G[k] && L[k] < 0) { L[k] = c; q.push(k); } } } c++; } return [L, c]; };
  const [LA, ca] = lab(A), [LB] = lab(B), seen = Array.from({ length: ca }, () => new Set()), edge = new Uint8Array(ca);
  for (let i = 0; i < n * n; i++) { if (LA[i] < 0) continue; const x = i % n, y = (i - x) / n; if (x === 0 || y === 0 || x === n - 1 || y === n - 1) edge[LA[i]] = 1; if (LB[i] >= 0) seen[LA[i]].add(LB[i]); }
  for (let c = 0; c < ca; c++) if (seen[c].size > 1 || (edge[c] && seen[c].size === 0)) return false;
  return true;
}
function solidifyFloor(f) {
  const _F = F; F = f; let added = 0;
  const list = f.sprites.filter(s => !s.taken && !s.hang && !s.noSolidify && !(s.k && (s.k.startsWith("r_") || NOSOLID.has(s.k))) && s.t !== "bulb" && s.kind !== "battery" && s.t !== T.car && !isSway(s) && s.t !== T.hangDoll);
  for (const s of list) {
    const tmp = [], ob = f.blocks, nb = f.blocks ? f.blocks.length : 0; try { furniture(tmp, s); } catch (e) { continue; } if (f.blocks && f.blocks.length > nb) f.blocks.length = nb; f.blocks = ob;
    const pts = []; for (let i = 0; i < tmp.length; i += 9) { const y = tmp[i + 1]; if (y > .03 && y < .95) pts.push([tmp[i], tmp[i + 2]]); }
    if (pts.length < 6) continue;
    let best = null; for (let k = 0; k < 6; k++) { const a = (s.rot ?? 0) + k * Math.PI / 12, ca = Math.cos(a), sa = Math.sin(a); let u0 = 1e9, u1 = -1e9, w0 = 1e9, w1 = -1e9; for (const [x, z] of pts) { const u = x * ca + z * sa, w = -x * sa + z * ca; u0 = Math.min(u0, u); u1 = Math.max(u1, u); w0 = Math.min(w0, w); w1 = Math.max(w1, w); } const ar = (u1 - u0) * (w1 - w0); if (!best || ar < best.ar) best = { ar, a, u0, u1, w0, w1 }; }
    const { a, u0, u1, w0, w1 } = best, hu = (u1 - u0) / 2, hw = (w1 - w0) / 2; if (Math.max(hu, hw) < .09) continue;
    if (s.act && Math.max(hu, hw) < .16) continue;
    const ca = Math.cos(a), sa = Math.sin(a), cu = (u0 + u1) / 2, cw = (w0 + w1) / 2, cx = cu * ca - cw * sa, cy = cu * sa + cw * ca;
    const along = hu >= hw, L = Math.max(hu, hw), Sh = Math.min(hu, hw), dir = along ? [ca, sa] : [-sa, ca];
    // đã có vùng va chạm đủ lớn thì thôi
    if (s.solid && s.solid >= Math.hypot(hu, hw) + .12 && Math.hypot(s.x - cx, s.y - cy) < .1) continue;
    let made = false;
    for (const shrink of [1, .8, .62]) {
      const r = Sh * shrink + .17, n = Math.max(1, Math.ceil((L - Sh) * 2 / Math.max(.12, r * 1.2)) + 1), cols = [];
      for (let i = 0; i < n; i++) { const o = n === 1 ? 0 : -(L - Sh) + 2 * (L - Sh) * i / (n - 1); cols.push({ k: "r_col", x: cx + dir[0] * o * shrink, y: cy + dir[1] * o * shrink, solid: r, deco: 1, sol: s.k || s.mesh || "t" }); }
      if (localPassOK(f, cx, cy, cols)) { cols.forEach(c => f.sprites.push(c)); added += cols.length; made = true; break; }
    }
  }
  F = _F; return added;
}
// Cây (vẽ thẳng vào lưới) có thân to hơn: thu gọn lại cho khỏi lấn lối đi
function treeAt(v, x, z, h, seed) {
  h *= 1.45; const X = XF(x, 0, z), r = (.15 + (seed % 7) * .012);
  if (seed % 10 < 7) {
    pcyl(v, X, 0, 0, 0, h, r * 1.4, r * .4, 7, T.bark || T.darkwood);
    const n = 5, base = 1.5 + (seed % 3) * .25;
    for (let i = 0; i < n; i++) { const y0 = base + i * (h - base - 1.2) / n, rr = 1.7 - i * .27, hh = 2.4 - i * .2; pcyl(v, X, 0, 0, y0, y0 + hh, rr, 0, 8, T.needles || T.leafT, null); pcyl(v, X, 0, 0, y0, y0 + .02, rr, rr, 8, T.needles || T.leafT, T.needles || T.leafT); }
  } else {
    pcyl(v, X, 0, 0, 0, h, r * 1.25, r * .3, 7, T.deadwood || T.darkwood);
    for (let i = 0; i < 7; i++) { const y = 1.6 + i * (h - 2.4) / 7 + (seed % 3) * .1, a = seed * 1.7 + i * 2.1, L = 1.6 - i * .17; const B = XF(x, 0, z, Math.cos(a), Math.sin(a)); pbox(v, B, 0, y, -.035, L, y + .07, .035, T.deadwood || T.darkwood); pbox(v, B, L * .6, y, -.03, L * .62 + .06, y + .6, .03, T.deadwood || T.darkwood); }
  }
}

// ---------- 3. NHÌN RA NGOÀI CỬA SỔ ----------
// Cửa sổ trên tường ngoài được khoét thủng: khung, bậu, rèm rách, và cảnh đêm phía sau (đất, cây, hàng rào, trời trăng)
const VIEW_Y = { t2: -2.3, b1: 1.1, c2: -6 };
function winView(v, f, X, x, y, nx, ny, fh, roomWall) {
  if (f.outdoor || fh < .95 || !T.r_view) return false;
  const dx = nx - x, dy = ny - y, sx = -dy, sy = dx, out = (cx, cy) => { const c = f.grid[cy]?.[cx]; return c === undefined || c === "#" || c === "w"; };
  for (let l = -2; l <= 2; l++) if (l && !out(nx + sx * l, ny + sy * l)) return false;
  let D = 0; for (let k = 1; k <= 7; k++) { let ok = true; for (let l = -2; l <= 2; l++) if (!out(nx + dx * k + sx * l, ny + dy * k + sy * l)) ok = false; if (!ok) break; D = k; }
  if (D < 2) return false;
  const y0 = .4, y1 = Math.min(fh - .12, 1.12), hw = .3, e = .2, gy = VIEW_Y[f.id] ?? 0, Dd = D + .9, L = 2.45, Hs = gy + 7, hs = h32(nx, ny, 3);
  const wq = (a, b, c, d) => lq(v, X, [[a, d, 0, a + .5, 1 - d / WH], [b, d, 0, b + .5, 1 - d / WH], [b, c, 0, b + .5, 1 - c / WH], [a, c, 0, a + .5, 1 - c / WH]], [0, 0, 1], roomWall);
  wq(-.5, -hw, 0, fh); wq(hw, .5, 0, fh); wq(-hw, hw, 0, y0); wq(-hw, hw, y1, fh);
  lq(v, X, [[-hw, y1, 0, 0, 0], [-hw, y1, -e, .2, 0], [-hw, y0, -e, .2, 1], [-hw, y0, 0, 0, 1]], [1, 0, 0], roomWall);
  lq(v, X, [[hw, y1, -e, 0, 0], [hw, y1, 0, .2, 0], [hw, y0, 0, .2, 1], [hw, y0, -e, 0, 1]], [-1, 0, 0], roomWall);
  lq(v, X, [[-hw, y1, 0, 0, 0], [hw, y1, 0, 1, 0], [hw, y1, -e, 1, .2], [-hw, y1, -e, 0, .2]], [0, -1, 0], roomWall);
  pbox(v, X, -hw - .04, y0 - .035, -e, hw + .04, y0, .07, T.darkwood);
  const fr = MAPID === "factory" || MAPID === "hospital" ? T.metal : T.darkwood, zf = -e + .04;
  pbox(v, X, -hw, y0, zf, -hw + .03, y1, zf + .025, fr); pbox(v, X, hw - .03, y0, zf, hw, y1, zf + .025, fr); pbox(v, X, -hw, y1 - .03, zf, hw, y1, zf + .025, fr); pbox(v, X, -hw, y0, zf, hw, y0 + .03, zf + .025, fr);
  if (MAPID === "factory" || MAPID === "hospital") { for (let i = 1; i < 4; i++) pbox(v, X, -hw + i * hw / 2 - .006, y0, zf, -hw + i * hw / 2 + .006, y1, zf + .02, fr); for (let i = 1; i < 4; i++) pbox(v, X, -hw, y0 + i * (y1 - y0) / 4 - .006, zf, hw, y0 + i * (y1 - y0) / 4 + .006, zf + .02, fr); }
  else { pbox(v, X, -.012, y0, zf, .012, y1, zf + .02, fr); pbox(v, X, -hw, (y0 + y1) / 2 - .012, zf, hw, (y0 + y1) / 2 + .012, zf + .02, fr); }
  // mảnh kính vỡ còn sót ở góc khung
  for (let i = 0; i < 2; i++) { const cx = (h32(nx, ny, i) - .5) * .45, top = h32(nx, ny, i + 9) > .5, cy = top ? y1 - .03 : y0 + .03, s = .015 + h32(nx, ny, i + 4) * .025; lq(v, X, [[cx - s, cy, zf + .012, 0, 0], [cx + s, cy, zf + .012, 1, 0], [cx, cy + (top ? -1 : 1) * s * 2.5, zf + .012, .5, 1], [cx, cy + (top ? -1 : 1) * s * 2.5, zf + .012, .5, 1]], [0, 0, 1], T.r_mirror || T.dark); }
  if (MAPID !== "factory") {   // rèm rách hai bên
    const cur = T.curtain || T.r_velvet; pcylX(v, X, y1 + .1, .05, -hw - .14, hw + .14, .012, 5, T.brass || T.metal);
    for (const sd of [-1, 1]) { const len = .45 + h32(nx, ny, sd + 5) * (y1 - y0 + .1); for (let i = 0; i < 3; i++) { const xa = sd * (hw + .1) - sd * i * .05, xb = xa - sd * .05, b = y1 + .1 - len * (1 - i * .15); pbox(v, X, Math.min(xa, xb), b, .03 + i * .008, Math.max(xa, xb), y1 + .1, .04 + i * .008, cur); } }
  }
  // khung cảnh bên ngoài (một hộp cảnh đêm phía sau tường)
  const Lq = (pts, n, m) => lq(v, X, pts, n, m);
  Lq([[-L, gy, -e, 0, 0], [L, gy, -e, L, 0], [L, gy, -Dd, L, Dd], [-L, gy, -Dd, 0, Dd]], [0, 1, 0], T.r_ground);
  Lq([[-L, Hs, -Dd, 0, 0], [L, Hs, -Dd, 1, 0], [L, gy, -Dd, 1, 1], [-L, gy, -Dd, 0, 1]], [0, 0, 1], T.r_view);
  Lq([[-L, Hs, -e, .8, 0], [-L, Hs, -Dd, 0, 0], [-L, gy, -Dd, 0, 1], [-L, gy, -e, .8, 1]], [1, 0, 0], T.r_view);
  Lq([[L, Hs, -Dd, 1, 0], [L, Hs, -e, .2, 0], [L, gy, -e, .2, 1], [L, gy, -Dd, 1, 1]], [-1, 0, 0], T.r_view);
  Lq([[-L, Hs, -e, 0, 0], [L, Hs, -e, 1, 0], [L, Hs, -Dd, 1, 1], [-L, Hs, -Dd, 0, 1]], [0, -1, 0], T.r_sky);
  // vài vật thể thật ngoài sân cho có chiều sâu
  for (let i = 0; i < 3; i++) { const px = (h32(nx, ny, 20 + i) - .5) * 3.6, pz = -1.4 - h32(nx, ny, 30 + i) * (Dd - 2); if (Math.abs(px) < .5 && pz > -2) continue; if (MAPID === "factory") { pcyl(v, X, px, pz, gy, gy + 2.5, .05, .05, 6, T.metal, T.metal); } else pcyl(v, X, px, pz, gy, Hs, .14 + h32(nx, ny, i) * .1, .08, 7, T.bark || T.darkwood, null); }
  if (MAPID === "house") for (let i = -10; i <= 10; i++) pbox(v, X, i * .23 - .025, gy, -1.6, i * .23 + .025, gy + .55, -1.57, T.darkwood);
  if (MAPID === "factory" || MAPID === "hospital") { for (let i = -5; i <= 5; i++) pbox(v, X, i * .5 - .02, gy, -1.8, i * .5 + .02, gy + 1, -1.78, T.metal); pbox(v, X, -L, gy + .95, -1.8, L, gy + .98, -1.78, T.metal); }
  if (MAPID === "castle") for (let i = -5; i <= 5; i++) pbox(v, X, i * .5 - .18, gy, -1.2, i * .5 + .18, gy + (i % 2 ? .55 : .75), -.9, T.stoneW);
  if (hs < .1 && T.shadowT) { const P = X.p((hs - .05) * 20, gy, -Dd + 1.2), C0 = X.p(0, gy, 0), ff = facing(Math.atan2(C0[2] - P[2], C0[0] - P[0])); humanoid(v, XF(P[0], P[1], P[2], ff.c, ff.s, .48), { skin: T.shadowT, face: T.shadowFace, top: T.shadowT, bottom: T.shadowT, shoe: T.shadowT, slim: .8 }, { armL: .05, armR: .05 }); }
  return true;
}

// ---------- 4. NGHĨA TRANG: VONG BAY thay cho xác sống ----------
function wail(vol = .22) {
  if (!ac) return; const t0 = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(), lfo = ac.createOscillator(), lg = ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(430 + Math.random() * 140, t0); o.frequency.linearRampToValueAtTime(280 + Math.random() * 80, t0 + 2); lfo.frequency.value = 4.5 + Math.random() * 2; lg.gain.value = 14; lfo.connect(lg); lg.connect(o.frequency);
  lp.type = "lowpass"; lp.frequency.value = 1500; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .5); g.gain.linearRampToValueAtTime(0, t0 + 2.2); o.connect(lp); lp.connect(g); g.connect(BUS.sfx); o.start(t0); lfo.start(t0); o.stop(t0 + 2.3); lfo.stop(t0 + 2.3);
}

function updateZombies(dt) {   // vong bay: lướt xuyên qua mộ, chập chờn ẩn hiện
  minGhostD = 99; CHASING = 0;
  S.clockMin += dt * 180 / D.cem;
  if (S.woke && ghosts.length < D.zmax && t > (S.nextZ || 0)) { S.nextZ = t + 70; const tb = F.sprites.filter(s => (s.k === "tomb" || s.k === "cross") && Math.hypot(s.x - player.x, s.y - player.y) > 9); const p = tb[Math.floor(Math.random() * tb.length)]; if (p) spawnZombie(p.x, p.y + .6); }
  for (const g of ghosts) {
    if (g.rise < 1) { g.rise += dt * .5; if (Math.random() < dt * .8) noise(.4, 3000, .03, 3); continue; }
    const d = Math.hypot(g.x - player.x, g.y - player.y); minGhostD = Math.min(minGhostD, d);
    const run = (keys.ShiftLeft || keys.ShiftRight) && player.stamina > 0, sense = player.hidden ? 0 : D.range * .85 + (flashOn() ? 2 : 0) + (run ? 3 : 0);
    if (!g.blinkT || t > g.blinkT) { g.blinkT = t + 2 + Math.random() * 5; if (d > 3 && Math.random() < .5) g.blink = t + .08 + Math.random() * .25; }
    if (g.stun > t) continue;
    if (d < sense) { CHASING = 1; g.st2 = "hunt"; moveToward(g, player.x, player.y, D.zomb * 1.1 * g.mul, dt); if ((g.wT = (g.wT || 0) - dt) <= 0) { g.wT = 3 + Math.random() * 4; wail(.12 + Math.max(0, 1 - d / 10) * .2); } }
    else { g.st2 = "drift"; if (Math.hypot(g.tx - g.x, g.ty - g.y) < .4) { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } moveToward(g, g.tx, g.ty, .35, dt); if (d < 9 && Math.random() < dt * .08) wail(.06); }
    if (d < .6 && !player.hidden && player.invuln <= 0) { g.stun = t + 3; touchPlayer(g, ["Bàn tay lạnh buốt của vong xuyên qua ngực bạn... Thêm một lần nữa thôi.", "Vong lướt xuyên qua người bạn, hơi lạnh thấm tận xương! Chạy đi!"], "Vong ôm chặt lấy bạn rồi kéo bạn chìm xuống nấm mộ lạnh lẽo.", 10); }
  }
  heartRate = Math.max(320, Math.min(1400, 250 + minGhostD * 150));
}
function spawnZombie(x, y) { spawnEnemy(x, y); const g = ghosts[ghosts.length - 1]; g.rise = 0; wail(.25); noise(.8, 2400, .08, 2); }

// ---------- 5. NHIỆM VỤ: thêm loại mới, số lượng theo độ khó ----------
const TASKX = {
  house: [
    { id: "D", kind: "break", model: "mirror", name: "Đập vỡ những tấm gương bị ám", verb: "Đập vỡ gương", doneMsg: "Tấm gương vỡ toang. Trong khoảnh khắc, bạn thấy một bé gái đứng sau lưng mình trong mảnh kính" },
    { id: "E", kind: "switch", model: "gramo", name: "Tắt những chiếc máy hát tự chạy", verb: "Tắt máy hát", doneMsg: "Tiếng nhạc tắt lịm. Căn nhà im phăng phắc... quá im" },
    { id: "F", kind: "photo", name: "Chụp ảnh những điểm lạnh", verb: "Chụp ảnh", doneMsg: "Đèn flash lóe lên. Đốm sáng lạnh lẽo tan biến" }],
  forest: [
    { id: "D", kind: "break", model: "jar", name: "Đập vỡ hũ sành yểm bùa", verb: "Đập vỡ hũ sành", doneMsg: "Hũ sành vỡ tan, bên trong chỉ có tóc người rối bết" },
    { id: "E", kind: "switch", model: "radio", name: "Tắt những chiếc bộ đàm rè rè", verb: "Tắt bộ đàm", doneMsg: "Bộ đàm tắt. Tiếng thì thầm cuối cùng gọi đúng tên bạn" },
    { id: "F", kind: "photo", name: "Chụp ảnh những dấu vết lạ", verb: "Chụp ảnh", doneMsg: "Ánh flash lóe lên. Trên màn hình máy ảnh, có ai đó đứng sau thân cây" }],
  castle: [
    { id: "D", kind: "break", model: "mirror", name: "Đập vỡ gương phù thủy", verb: "Đập vỡ gương", doneMsg: "Gương vỡ. Tiếng thét của Nữ Bá Tước vọng khắp hành lang" },
    { id: "E", kind: "switch", model: "musicbox", name: "Dừng những hộp nhạc tự quay", verb: "Đóng hộp nhạc", doneMsg: "Hộp nhạc ngừng. Vũ công nhỏ bên trong vẫn quay mặt nhìn bạn" },
    { id: "F", kind: "photo", name: "Chụp ảnh linh hồn hầu gái", verb: "Chụp ảnh", doneMsg: "Ánh flash lóe lên. Một cô hầu gái mờ nhạt cúi đầu cảm ơn rồi tan biến" }],
  cemetery: [
    { id: "D", kind: "break", model: "jar", name: "Đập vỡ hũ tro bị yểm", verb: "Đập vỡ hũ tro", doneMsg: "Hũ tro vỡ. Tro bay lên thành hình một khuôn mặt rồi tan vào gió" },
    { id: "E", kind: "switch", model: "radio", name: "Tắt radio của người gác mộ", verb: "Tắt radio", doneMsg: "Radio tắt. Bài vọng cổ dở dang vẫn còn văng vẳng trong đầu bạn" },
    { id: "F", kind: "photo", name: "Chụp ảnh ánh lửa ma trơi", verb: "Chụp ảnh", doneMsg: "Đèn flash lóe lên. Đốm ma trơi vụt tắt" }],
  factory: [
    { id: "D", kind: "break", model: "bust", name: "Đập vỡ ma-nơ-canh bị ám", verb: "Đập vỡ ma-nơ-canh", doneMsg: "Đầu ma-nơ-canh lăn lông lốc. Bên trong lớp nhựa là... tóc thật" },
    { id: "E", kind: "switch", model: "siren", name: "Tắt còi báo động", verb: "Tắt còi", doneMsg: "Còi tắt. Nhưng ánh đèn đỏ vẫn chớp trong mắt bạn rất lâu" },
    { id: "F", kind: "photo", name: "Chụp ảnh vệt cháy hình người", verb: "Chụp ảnh", doneMsg: "Đèn flash lóe lên. Vệt cháy trên sàn hình như vừa cựa quậy" }],
};
const TASK_BASE = { collect: 5, light: 3, note: 3, break: 3, switch: 2, photo: 3 };
const DIFF_TASK = { de: [4, 1], tb: [5, 1.2], kho: [6, 1.5], sieu: [6, 1.8] };
const TASK_FLOORS2 = { house: ["t1", "t2", "b1"], castle: ["c1", "c3"], forest: ["f1"], cemetery: ["g1"], factory: ["x1"] };
function setupTasks() {
  TASKS = []; S.mainDone = null; S.pendSpawn = 0; Object.values(FLOORS).forEach(f => { if (!f.dressed) { f.dressed = 1; dressFloor(f); furnishRooms(f); addWebs(f); f.grass = []; const sp = f.sprites; f.sprites = f.grass; growGrass(f); f.sprites = sp; addClutter(f); } }); scaleSolids();
  const floors = TASK_FLOORS2[MAPID].map(id => FLOORS[id]).filter(f => f && f.w * f.h >= 300), start = (o => ({ f: F.id, x: o.x, y: o.y }))(COOP && S.spawn0 ? S.spawn0 : P1), placed = [];
  const dk = Object.keys(DIFF).find(k => DIFF[k] === D) || "tb", [nTypes, mul] = DIFF_TASK[dk] || [5, 1];
  const defs = [...TASKDEF[MAPID], ...(TASKX[MAPID] || [])].slice(0, nTypes);
  defs.forEach((d, di) => {
    const need = Math.max(2, Math.round((TASK_BASE[d.kind] || 3) * mul * (1 + .6 * ((COOP ? NET.roster.length : 1) - 1)))), q = { ...d, need, got: 0 }; TASKS.push(q);
    SPRITE_ACTS["task_" + d.id] = s => taskAct(s); SPRITE_NAMES["task_" + d.id] = d.verb;
    for (let i = 0; i < need; i++) {
      const f = floors[(i + di) % floors.length], sp = findSpot(f, placed, start); if (!sp) { q.need--; continue; }
      placed.push({ f, ...sp });
      f.sprites.push({ x: sp.x, y: sp.y, k: "task", tk: d.id, tkind: d.kind, tmodel: d.model, ttex: d.tex, act: "task_" + d.id, reach: 1.8, wide: .45, solid: .22, rot: Math.random() * 6.28 });
    }
  });
  Object.values(FLOORS).forEach(f => solidifyFloor(f)); Object.values(FLOORS).forEach(f => { nameAreas(f); tidyLabels(f); }); setupOpenables();
  const _F = F; Object.values(FLOORS).forEach(f => { F = f; buildFloorMesh(f); }); F = _F;
}
function taskModelX(v, s) {
  if (!["break", "switch", "photo"].includes(s.tkind)) return false;
  const f0 = facing(s.rot || 0), X = XF(s.x, 0, s.y, f0.c, f0.s, M), mt = T.metal, dw = T.darkwood;
  const B = (a, b, c, d, e, g, m) => pbox(v, X, a, b, c, d, e, g, m), C = (x, z, y0, y1, r0, r1, n, m, cap) => pcyl(v, X, x, z, y0, y1, r0, r1, n, m, cap === undefined ? m : cap);
  const shards = (m, n = 7) => { for (let i = 0; i < n; i++) { const a = h32(i, s.x * 10 | 0) * 6.28, d = .1 + h32(i, 3) * .35, x = Math.cos(a) * d, z = Math.sin(a) * d, w = .03 + h32(i, 7) * .06; B(x - w, 0, z - w * .7, x + w, .012, z + w * .7, m); } };
  if (s.tkind === "break") {
    if (s.tmodel === "mirror") { for (const x of [-.32, .3]) B(x, 0, -.2, x + .02, .06, .2, dw); B(-.03, 0, -.03, .03, 1.75, .03, dw); B(-.3, .5, -.02, .3, 1.72, .02, { all: dw, f: T.brass || dw });
      if (!s.broke) B(-.25, .55, .02, .25, 1.67, .03, T.r_mirror || T.glassB); else { B(-.25, .55, .02, .25, 1.67, .025, T.dark); shards(T.r_mirror || T.glassB, 10); } }
    else if (s.tmodel === "bust") { C(0, 0, 0, .05, .2, .2, 10, mt); C(0, 0, .05, .9, .02, .02, 6, mt); { const Q = XSp(X, 0, 1.15, 0, 1, 1.4, .75); psphere(v, Q, 0, 1.15, 0, .2, 9, T.mannequinT || T.enamel); }
      if (!s.broke) { psphere(v, X, 0, 1.55, 0, .11, 9, T.mannequinFace || T.mannequinT || T.enamel, 1.25); C(0, 0, 1.38, 1.45, .045, .045, 6, T.mannequinT || T.enamel); } else { psphere(v, X, .35, .11, .2, .11, 9, T.mannequinFace || T.mannequinT || T.enamel, 1.25); shards(T.mannequinT || T.enamel, 6); } }
    else { const m = T.potT || dw; if (!s.broke) { psphere(v, XSp(X, 0, .25, 0, 1, 1.25, 1), 0, .25, 0, .2, 10, m); C(0, 0, .45, .55, .09, .11, 10, m, T.dark); B(-.05, .2, .19, .05, .45, .2, T.tkTalis || T.paperSheet || T.clWhite); }
      else { C(0, 0, 0, .08, .18, .2, 10, m, T.dark); shards(m, 8); for (let i = 0; i < 6; i++) B(-.25 + i * .09, 0, .1 + h32(i, 5) * .1, -.24 + i * .09, .004, .3, T.hair || T.dark); } }
    return true;
  }
  if (s.tkind === "switch") {
    const on = !s.off;
    if (s.tmodel === "gramo") { B(-.25, 0, -.25, .25, .7, .25, dw); B(-.22, .7, -.22, .22, .85, .22, dw); C(0, 0, .85, .87, .16, .16, 14, T.dark, T.dark); C(0, 0, .87, .9, .015, .015, 5, mt);
      { const Q = XL(X, .12, .9, .05, -.5, .2); pcyl(v, Q, .12, .05, .9, 1.3, .04, .3, 12, T.brass || mt, null); } B(.12, .87, -.15, .14, .9, .05, mt); }
    else if (s.tmodel === "musicbox") { B(-.3, 0, -.3, .3, .72, .3, dw); B(-.2, .72, -.12, .2, .88, .12, T.r_velvet || dw); { const Q = XL(X, 0, .88, -.12, on ? -1.9 : 0); pbox(v, Q, -.2, .88, -.12, .2, .9, .12, T.r_velvet || dw); } if (on) { C(0, 0, .88, .9, .05, .05, 8, T.brass || mt); humanoid(v, XF(...X.p(0, .9, 0), Math.cos(t * 2), Math.sin(t * 2), .05), { skin: T.mannequinT || T.enamel, top: T.clWhite || T.enamel, bottom: T.clWhite || T.enamel, skirt: { m: T.clWhite || T.enamel, y0: .6, r: .4 }, slim: .7 }, { armL: -2.6, armR: -2.6 }); } }
    else if (s.tmodel === "siren") { C(0, 0, 0, 1.4, .04, .04, 6, mt); C(0, 0, 0, .05, .25, .25, 10, mt); B(-.2, 1.0, .03, .2, 1.4, .25, T.r_greyP || mt); B(-.17, 1.05, .25, .17, 1.35, .26, T.r_panel || T.dark); { const Q = XSp(X, 0, 1.5, .14, 1, 1, 1); psphere(v, Q, 0, 1.5, .14, .11, 9, on ? (T.glassR || T.clRed) : T.dark); } }
    else { B(-.25, 0, -.2, .25, .55, .2, dw); B(-.18, .55, -.12, .18, .75, .12, T.plastic || T.dark); B(-.16, .58, .12, .04, .72, .125, T.dark); C(.1, .06, .62, .66, .035, .035, 8, T.metal); C(.1, .06, .69, .73, .03, .03, 8, T.metal); { const Q = XL(X, .14, .75, -.05, 0, -.3); pcyl(v, Q, .14, -.05, .75, 1.15, .006, .004, 4, mt, mt); } if (on) B(-.14, .7, .126, -.1, .715, .13, T.glassR || T.clRed); }
    return true;
  }
  B(-.55, .003, -.55, .55, .007, .55, { all: T.r_chalk || T.paperSheet }); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; candle3d(v, X, Math.cos(a) * .5, 0, Math.sin(a) * .5, .05 + h32(i, 2) * .05); }
  if (!s.shot) psphere(v, X, 0, 1.0, 0, .07, 8, T.r_orb || T.glassB);
  return true;
}
function taskActX(q, s) {
  if (q.kind === "break") { s.broke = 1; s.act = null; noise(.45, 700, .38, .7); noise(.3, 2200, .1, .9, .02); tone(1046, .04, .5, .014, "sine"); tone(1568, .1, .45, .01, "sine"); noise(.6, 900, .5, .8); P1.shake = Math.max(P1.shake || 0, .3); say(`${q.doneMsg}. (${q.got}/${q.need})`); return true; }
  if (q.kind === "switch") { s.off = 1; s.act = null; noise(.05, 1200, .3, 2); tone(140, 0, .3, .05, "square"); say(`${q.doneMsg}. (${q.got}/${q.need})`); return true; }
  if (q.kind === "photo") { s.shot = 1; s.act = null; camFlash(); noise(.06, 5000, .3, 3); tone(1800, 0, .08, .03, "square"); say(`${q.doneMsg}. (${q.got}/${q.need})`);
    if (h32(s.x * 7 | 0, s.y * 7 | 0, 5) < .15) setTimeout(() => jumpScare(), 250); return true; }
  return false;
}
function camFlash() { let el = $("camFlash"); if (!el) { el = document.createElement("div"); el.id = "camFlash"; el.style.cssText = "position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:40;transition:opacity .6s ease-out"; document.body.appendChild(el); } el.style.transition = "none"; el.style.opacity = .9; void el.offsetWidth; el.style.transition = "opacity .7s ease-out"; el.style.opacity = 0; }
// Âm thanh của các máy đang chạy (máy hát, bộ đàm, hộp nhạc, còi) — giúp lần theo tiếng để tìm
function taskAudioTick(dt) {
  if (!S.started || S.paused || !ac) return; if ((S.tauT = (S.tauT || 0) - dt) > 0) return; S.tauT = .9 + Math.random() * .8;
  let best = null, bd = 9; for (const s of F.sprites) if (s.k === "task" && s.tkind === "switch" && !s.off) { const d = Math.hypot(s.x - P1.x, s.y - P1.y); if (d < bd) { bd = d; best = s; } }
  if (!best) return; const vol = Math.max(0, 1 - bd / 9) * .22 + .01, m = best.tmodel;
  if (m === "gramo" || m === "musicbox") { const notes = m === "gramo" ? [220, 262, 247, 196] : [880, 1047, 988, 784, 659], i = (S.tauN = ((S.tauN || 0) + 1) % notes.length); tone(notes[i] * (m === "gramo" ? 1 : 1), 0, m === "gramo" ? .8 : .35, vol * (m === "gramo" ? .7 : .5), m === "gramo" ? "triangle" : "sine"); if (m === "gramo" && Math.random() < .5) noise(.3, 3000, vol * .15, .5); }
  else if (m === "siren") { tone(620, 0, .45, vol * .6, "sawtooth"); tone(880, .45, .45, vol * .6, "sawtooth"); S.tauT = .9; }
  else { noise(.35, 2000 + Math.random() * 1500, vol * .6, .7); if (Math.random() < .4) tone(300 + Math.random() * 200, .1, .25, vol * .3, "square"); }
}

// ---------- 6. MỞ RỘNG BẢN ĐỒ ----------
function growRows(f, n) {
  const oh = f.h; for (let i = 0; i < n; i++) f.grid.push(Array(f.w).fill("#"));
  f.room.length = f.w * (oh + n); f.room.fill(null, f.w * oh); f.h = oh + n; return oh;
}
function setFloorT(f, y0) {
  if (!f.floorT) return; for (let y = y0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const k = y * f.w + x, rm = f.room[k], hh = h32(x, y, 1) * 100 | 0;
    let fl = f.over?.[k] || (rm ? rm.floor : null);
    if (!fl) fl = f.outdoor ? (f.path?.has(k) ? (T.dirt || f.defFloor) : f.grid[y][x] === "#" ? (T.leaves || f.defFloor) : (hh % 10 < 6 ? (T.grass || f.defFloor) : (T.leaves || f.defFloor))) : f.defFloor;
    f.floorT[k] = Array.isArray(fl) ? (((x * 31 + y * 17) % 11 === 0) ? fl[1] : fl[0]) : fl; }
}
// Khu nhà mới phía sau: một hành lang dài + 3–4 phòng kích thước khác nhau, có cửa sổ nhìn ra ngoài
function annexIndoor(f, rows, styleFn, lightFn) {
  const W = f.w, oh = f.h, low = []; let best = null;
  const comp = new Int32Array(W * oh).fill(-1), sizes = []; for (let i = 0; i < W * oh; i++) { const x0 = i % W, y0_ = (i - x0) / W; if (comp[i] >= 0 || f.grid[y0_][x0] !== ".") continue; const id = sizes.length, st = [i]; comp[i] = id; let n = 0; while (st.length) { const c = st.pop(), cx = c % W, cy = (c - cx) / W; n++; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= oh) continue; const j = ny * W + nx; if (comp[j] < 0 && f.grid[ny][nx] === ".") { comp[j] = id; st.push(j); } } } sizes.push(n); }
  const mainC = sizes.indexOf(Math.max(...sizes));
  for (let x = 4; x < W - 4; x++) {
    let yl = -1; for (let y = oh - 2; y > 0; y--) if (f.grid[y][x] === ".") { yl = y; break; } else if (f.grid[y][x] !== "#") break;
    if (yl < 0 || !f.room[yl * W + x] || f.grid[yl][x - 1] !== "." || f.grid[yl][x + 1] !== "." || comp[yl * W + x] !== mainC) continue;
    let ok = true; for (let y = yl + 1; y < oh && ok; y++) for (const dx of [-1, 0, 1]) if (f.grid[y][x + dx] !== "#") ok = false;
    if (!ok || oh - yl > 22) continue; low.push({ x, yl, sc: yl * 3 - Math.abs(x - W / 2) * .3 + Math.random() * 4 });
  }
  if (!low.length) return false; low.sort((a, b) => b.sc - a.sc); best = low[0];
  const src = f.room[best.yl * W + best.x], y0 = growRows(f, rows), cx = best.x;
  const corr = { wall: src.wall, floor: src.floor, h: Math.min(src.h ?? WH, 1.9) - .03, ceil: src.ceil };
  const setR = (x, y, r) => { f.grid[y][x] = "."; f.room[y * W + x] = r; };
  for (let y = best.yl + 1; y <= y0 + 1; y++) setR(cx, y, corr);
  const xa = Math.max(2, cx - 14 - Math.floor(Math.random() * 6)), xb = Math.min(W - 3, cx + 14 + Math.floor(Math.random() * 6));
  for (let y = y0 + 2; y <= y0 + 3; y++) for (let x = xa; x <= xb; x++) setR(x, y, corr);
  let x = xa, rooms = []; while (x < xb - 4) { const w = Math.min(xb - x, 6 + Math.floor(Math.random() * 6)); if (w < 5) break; const hh = 6 + Math.floor(Math.random() * Math.max(1, rows - 11)); rooms.push([x, x + w - 1, y0 + 5, Math.min(y0 + 5 + hh, f.h - 3)]); x += w + 1; }
  rooms.forEach(([a, b, c, d], i) => { const st = styleFn(i); for (let y = c; y <= d; y++) for (let xx = a; xx <= b; xx++) setR(xx, y, st); const dxp = a + 1 + Math.floor(Math.random() * (b - a - 1)); setR(dxp, y0 + 4, { ...st, h: Math.min(st.h ?? WH, corr.h) });
    lightFn(f, (a + b) / 2 + .5, (c + d) / 2 + .5, st); for (let k = 0; k < 2; k++) { const wx = a + 1 + Math.floor(Math.random() * (b - a - 1)); if (f.grid[d + 1][wx] === "#" && f.grid[d + 2]?.[wx] === "#") windowAt(f, wx, d + 1); }
    if (Math.random() < .7) spr(f, a + 1 + Math.random() * (b - a - 1), c + 1 + Math.random() * (d - c - 1), T.battery, .18, { kind: "battery" }); });
  for (let k = 0; k < 3; k++) lightFn(f, xa + (xb - xa) * (k + .5) / 3 + .5, y0 + 3, corr);
  setFloorT(f, best.yl); return true;
}
// Khu ngoài trời mới (rừng / nghĩa trang): các bãi trống nối với nhau bằng lối mòn
function annexOutdoor(f, rows, fill) {
  const W = f.w, oh = f.h; let best = null;
  for (let y = oh - 3; y > oh * .6 && !best; y--) { let bx = -1; for (let x = 6; x < W - 6; x++) if (f.grid[y][x] === "." && !f.room[y * W + x] && (bx < 0 || Math.abs(x - W * .72) < Math.abs(bx - W * .72))) bx = x; if (bx >= 0) best = { x: bx, y }; }
  if (!best) return false;
  const y0 = growRows(f, rows), open1 = (x, y) => { if (x > 1 && y > 1 && x < W - 2 && y < f.h - 2 && f.grid[y][x] === "#") f.grid[y][x] = "."; }, P = f.path || (f.path = new Set());
  const path = pts => { for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) / .25); for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n, py = ay + (by - ay) * k / n; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = Math.floor(px + dx * .5), y = Math.floor(py + dy * .5); if (Math.hypot(dx * .5, dy * .5) <= 1) { open1(x, y); if (x > 1 && y > 1 && x < W - 2 && y < f.h - 2) P.add(y * W + x); } } } } };
  const blob = (cx, cy, r) => { for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++) for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) { const a = Math.atan2(y - cy, x - cx); if (Math.hypot(x + .5 - cx, y + .5 - cy) < r * (1 + .14 * Math.sin(a * 3 + cx) + .08 * Math.sin(a * 7 + cy))) open1(x, y); } };
  const c1 = [Math.max(10, Math.min(W - 10, best.x + (Math.random() - .5) * 10)), y0 + rows * .35], c2 = [Math.max(10, Math.min(W - 10, c1[0] - 16 - Math.random() * 8)), y0 + rows * .62], c3 = [Math.max(10, Math.min(W - 10, c1[0] + 14 + Math.random() * 8)), y0 + rows * .7];
  blob(...c1, 7); blob(...c2, 5.5); blob(...c3, 5);
  path([[best.x, best.y], [best.x, oh], c1]); path([c1, c2]); path([c1, c3]); path([c2, [c2[0] + 2, f.h - 5]]);
  setFloorT(f, oh - 6); fill(f, y0, [c1, c2, c3]); return true;
}
function extendMaps() {
  const pick = (f, i) => { const seen = new Map(); for (const r of f.room) if (r && !r.roof && (r.h ?? WH) > 1.5) seen.set(firstOf(r.floor), r); const arr = [...seen.values()]; const r = arr[(i * 7 + Math.floor(Math.random() * arr.length)) % arr.length]; return { ...r, h: Math.max(1.6, Math.min(2.6, (r.h ?? WH) + (Math.random() - .5) * .6)) }; };
  const lampL = (f, x, y) => lamp(f, x, y, true);
  if (MAPID === "house") { for (const id of ["t1", "t2"]) annexIndoor(FLOORS[id], 18, i => pick(FLOORS[id], i), lampL); }
  if (MAPID === "factory") annexIndoor(FLOORS.x1, 20, i => { const r = pick(FLOORS.x1, i); return i % 2 ? { ...r, h: 3.6 + Math.random(), ceil: T.ceilInd || r.ceil } : r; }, lampL);
  if (MAPID === "castle" && 0) annexIndoor(FLOORS.c1, 18, i => pick(FLOORS.c1, i), (f, x, y, st) => { f.lights.push({ x, y, h: Math.min(1.2, (st.h ?? WH) - .3), i: .8, r: 1, g: .55, b: .22, f: .55 }); f.sprites.push({ x, y, k: "d_candelabra", rot: 0, solid: .2, deco: 1, seed: Math.random() }); });
  if (MAPID === "forest") annexOutdoor(FLOORS.f1, 26, (f, y0, cs) => {
    for (const [x, y] of cs) { f.sprites.push({ x: x + 2.2, y: y - 1.5, k: "stump", solid: .3, rot: Math.random() * 6 }); if (Math.random() < .7) spr(f, x - 1.5, y + 1, T.battery, .18, { kind: "battery" }); }
    for (let i = 0; i < 30; i++) { const x = 3 + Math.random() * (f.w - 6), y = y0 + Math.random() * 24, cx = Math.floor(x), cy = Math.floor(y); if (f.grid[cy]?.[cx] === "." && !f.path.has(cy * f.w + cx) && !f.sprites.some(s => Math.hypot(s.x - x, s.y - y) < 2)) f.sprites.push({ x, y, k: Math.random() < .75 ? "tree" : "dead", solid: .32, seed: Math.floor(Math.random() * 20) }); }
    f.labels = [...(f.labels || []), ["Bãi chặt cây cũ", cs[0][0], cs[0][1]], ["Khe đá", cs[1][0], cs[1][1]], ["Bãi quạ", cs[2][0], cs[2][1]]];
    f.sprites.push({ x: cs[0][0], y: cs[0][1], k: "bonfire", solid: .5, rot: 0, noSolidify: 1 }); f.lights.push({ x: cs[0][0], y: cs[0][1], h: .4, i: .5, r: 1, g: .5, b: .2, f: .7 });
  });
  if (MAPID === "cemetery" && 0) annexOutdoor(FLOORS.g1, 22, (f, y0, cs) => {
    let n = 0; for (let y = y0 + 3; y < f.h - 3; y += 3) for (let x = 4.5; x < f.w - 4; x += 2.6) { const cx = Math.floor(x), cy = Math.floor(y); if (f.grid[cy]?.[cx] !== "." || f.path.has(cy * f.w + cx) || cs.some(c => Math.hypot(c[0] - x, c[1] - y) < 2.5)) continue; const hh = (cx * 31 + cy * 17) % 7; f.sprites.push({ x, y, k: hh < 4 ? "tomb" : "cross", rot: -Math.PI / 2, solid: .3, seed: hh }); n++; }
    for (const [x, y] of cs) { f.sprites.push({ x: x + 1.2, y, k: "slantern", solid: .25 }); f.lights.push({ x: x + 1.2, y, h: .55, i: .55, r: .9, g: 1, b: .6, f: .9 }); if (Math.random() < .7) spr(f, x - 1.4, y + .8, T.battery, .18, { kind: "battery" }); }
    for (let i = 0; i < 8; i++) { const x = 4 + Math.random() * (f.w - 8), y = y0 + 2 + Math.random() * 18, cx = Math.floor(x), cy = Math.floor(y); if (f.grid[cy]?.[cx] === "." && !f.path.has(cy * f.w + cx) && !f.sprites.some(s => Math.hypot(s.x - x, s.y - y) < 1.8)) f.sprites.push({ x, y, k: "dead", solid: .3, seed: 7 + i }); }
    f.labels = [...(f.labels || []), ["Khu mộ cũ", cs[0][0], cs[0][1]], ["Khu mộ vô danh", cs[1][0], cs[1][1]], ["Khu mộ trẻ em", cs[2][0], cs[2][1]]];
  });
}
