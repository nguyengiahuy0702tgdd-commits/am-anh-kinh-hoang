// =====================================================================
//  18. KIẾN TRÚC: mỗi phòng có chiều cao riêng, cột, cửa sổ, kèo mái
// =====================================================================
const STRETCH = new Set(["v", "w"]);   // cửa sổ cao: kéo giãn texture theo chiều cao tường
function hOf(f, x, y) { const r = f.room[y * f.w + x]; return r?.h ?? f.doorH ?? WH; }
function ceilAt(x, y) { return F.room[Math.floor(y) * F.w + Math.floor(x)]?.h ?? WH; }
function wallFace(v, X, h0, h1, tex, stretch) {
  const v0 = stretch ? 0 : 1 - h1 / WH, v1 = stretch ? 1 : 1 - h0 / WH;
  lq(v, X, [[-.5, h1, 0, 0, v0], [.5, h1, 0, 1, v0], [.5, h0, 0, 1, v1], [-.5, h0, 0, 0, v1]], [0, 0, 1], tex);
}
function buildColumn(v, f, x, y) {
  let h = WH; for (const [nx, ny] of [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]) if (f.grid[ny]?.[nx] === ".") h = Math.max(h, hOf(f, nx, ny));
  const X = XF(x + .5, 0, y + .5), m = f.colMat || T.stoneW;
  if (f.colStyle === "steel") {   // cột thép chữ I
    pbox(v, X, -.22, 0, -.06, .22, h, .06, m); pbox(v, X, -.22, 0, -.22, -.16, h, .22, m); pbox(v, X, .16, 0, -.22, .22, h, .22, m);
    pbox(v, X, -.3, 0, -.3, .3, .12, .3, T.concF); for (let yy = 1.2; yy < h; yy += 1.4) pbox(v, X, -.24, yy, -.24, .24, yy + .08, .24, T.hazard);
  } else {                       // cột đá tròn kiểu gothic
    pbox(v, X, -.42, 0, -.42, .42, .3, .42, m); pcyl(v, X, 0, 0, .3, h - .4, .3, .26, 14, m); pbox(v, X, -.4, h - .4, -.4, .4, h, .4, m);
    for (let a = 0; a < 4; a++) { const c = Math.cos(a * Math.PI / 2), s = Math.sin(a * Math.PI / 2); pcyl(v, X, c * .27, s * .27, .3, h - .4, .07, .07, 6, m); }
  }
}
function buildFloorMesh(f) {
  const v = [], prevF = F; F = f; f.blocks = []; const done = new Set();
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const cell = f.grid[y][x];
    if (f.outdoor && cell === "#") {
      quad(v, [[x, 0, y, 0, 0], [x + 1, 0, y, 1, 0], [x + 1, 0, y + 1, 1, 1], [x, 0, y + 1, 0, 1]], [0, 1, 0], LAYER.get(f.floorT[y * f.w + x]));
      if (f.edge === "fence") {
        let adj = false;
        for (const [nx, ny] of [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]) if (f.grid[ny]?.[nx] === ".") {
          adj = true; const fx = nx - x, fz = ny - y, X = XF(x + .5 + fx * .5, 0, y + .5 + fz * .5, fz, -fx);
          for (let i = 0; i < 8; i++) { const bx = -.47 + i * .125; pbox(v, X, bx - .012, 0, -.012, bx + .012, 2.0, .012, T.metal); pcyl(v, X, bx, 0, 2.0, 2.13, .022, 0, 4, T.metal); }
          pbox(v, X, -.5, .35, -.015, .5, .39, .015, T.metal); pbox(v, X, -.5, 1.75, -.015, .5, 1.79, .015, T.metal);
        }
        const hs = ((x * 73856093) ^ (y * 19349663)) >>> 0; if (!adj && hs % 100 < 14) treeAt(v, x + .5, y + .5, 4 + hs % 3, 8);
        continue;
      }
      let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (f.grid[y + dy]?.[x + dx] === ".") { near = true; break; }
      const hsh = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      if ((hsh % 100) < (near ? 88 : 20)) treeAt(v, x + .2 + (hsh % 13) / 22, y + .2 + (hsh % 7) / 12, 3.8 + (hsh % 9) * .35, hsh % 11);
      continue;
    }
    if (cell === "I") { buildColumn(v, f, x, y); continue; }
    if (cell !== ".") continue;
    const h = hOf(f, x, y), rm = f.room[y * f.w + x];
    quad(v, [[x, 0, y, 0, 0], [x + 1, 0, y, 1, 0], [x + 1, 0, y + 1, 1, 1], [x, 0, y + 1, 0, 1]], [0, 1, 0], LAYER.get(f.floorT[y * f.w + x]));
    if (!f.outdoor || rm?.roof) quad(v, [[x, h, y, 0, 0], [x + 1, h, y, 1, 0], [x + 1, h, y + 1, 1, 1], [x, h, y + 1, 0, 1]], [0, -1, 0], LAYER.get(rm?.ceil || f.ceil));
    for (const [nx, ny] of [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]]) {
      const c = f.grid[ny]?.[nx] ?? "#"; if (c === "I" || (f.outdoor && c === "#")) continue;
      const fx = x - nx, fz = y - ny, X = XF(nx + .5 + fx * .5, 0, ny + .5 + fz * .5, fz, -fx), key = ny * f.w + nx;
      const roomWall = wallTexAt("#", x, y, nx, ny);
      if (c === ".") {   // chênh lệch chiều cao trần giữa hai ô (khung trên cửa, vòm)
        const hn = hOf(f, nx, ny); if (!(f.outdoor && !rm?.roof) && hn < h - .01) wallFace(v, X, hn, h, roomWall); continue;
      }
      const fh = f.outdoor && !rm?.roof ? (f.charH?.[c] ?? WH) : h;
      if (c in STAIRS) {
        if (fh > WH + .01) wallFace(v, X, WH, fh, roomWall);
        if (done.has(key)) continue; done.add(key);
        const rt = [fz, -fx], same = (k) => f.grid[ny + rt[1] * k]?.[nx + rt[0] * k] in STAIRS;
        buildStairs(v, X, STAIRS[c], !same(-1), !same(1), roomWall); continue;
      }
      const isProp = c in PROP_DEPTH, faceTex = isProp ? roomWall : wallTexAt(c, x, y, nx, ny);
      if (c === "w" && winView(v, f, X, x, y, nx, ny, fh, roomWall)) {} else if (!(f.outdoor && c === "k")) wallFace(v, X, 0, fh, faceTex, STRETCH.has(c));
      if (c === "#" || c === "w") wallTrim(v, X, fh, f);
      if (isProp && !done.has(key)) {
        done.add(key); const d = buildProp(v, c, X, WT[c] || T.paper, f);
        const a = X.p(-.5, 0, 0), b = X.p(.5, 0, d); f.blocks.push([Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]);
      }
    }
    filletCorners(v, f, x, y, h, rm);
  }
  for (const s of f.sprites) if (!s.taken && !isSway(s)) furniture(v, s);
  if (f.grass) for (const g of f.grass) grassModel(v, g);
  if (f.clutter) for (const c of f.clutter) clutterModel(v, c);
  if (f.roofs) buildRoof(v, f);
  if (f.decor) { const st = v.length; f.decor(v, f); if (f.decorOff) for (let i = st; i < v.length; i += 9) { v[i] += f.decorOff[0]; v[i + 2] += f.decorOff[1]; } }
  F = prevF;
  if (f.mesh) { gl.deleteBuffer(f.mesh.b); gl.deleteVertexArray(f.mesh.vao); }
  f.mesh = makeMesh(new Float32Array(v));
}
function buildRoof(v, f) {
  for (const [x0, z0, x1, z1, rT, gT, wh, spire] of f.roofs) {
    const W0 = wh ?? WH, ox = x0 - .3, ox1 = x1 + .3, zm = (z0 + z1) / 2, H = W0 + (z1 - z0) * .45, oz0 = z0 - .3, oz1 = z1 + .3, Lx = (x1 - x0) / 2;
    lq(v, XW, [[ox, W0 - .05, oz0, 0, 0], [ox1, W0 - .05, oz0, Lx, 0], [ox1, H, zm, Lx, 3], [ox, H, zm, 0, 3]], [0, .7, -.7], rT || T.roof);
    lq(v, XW, [[ox1, W0 - .05, oz1, 0, 0], [ox, W0 - .05, oz1, Lx, 0], [ox, H, zm, Lx, 3], [ox1, H, zm, 0, 3]], [0, .7, .7], rT || T.roof);
    for (const [xx, n] of [[x0, -1], [x1, 1]]) lq(v, XW, [[xx, W0, z0, 0, 1], [xx, H, zm, .5, 0], [xx, H, zm, .5, 0], [xx, W0, z1, 1, 1]], [n, 0, 0], gT || T.logWall);
    if (spire) {   // tháp chuông nhọn của nhà thờ
      const [sx, sz] = spire, X = XF(sx, 0, sz); pbox(v, X, -1, H - 1, -1, 1, H + 2.6, 1, gT || T.stoneW);
      pcyl(v, X, 0, 0, H + 2.6, H + 7.2, 1.45, 0, 4, rT || T.roof, null, Math.PI / 4, Math.PI * 2 + Math.PI / 4);
      pbox(v, X, -.04, H + 7, -.04, .04, H + 8, .04, T.metal); pbox(v, X, -.3, H + 7.6, -.04, .3, H + 7.68, .04, T.metal);
    }
  }
}
// ---- Kết cấu riêng cho từng loại công trình ----
function castleDecor(v, f) {
  if (f.id === "c1") {   // vòm đá + xà gỗ trên đại sảnh cao
    for (let y = 16; y <= 28; y += 2) box(v, 13, 4.25, y, 27, 4.45, y + .35, T.darkwood);
    for (const x of [15.5, 24.5]) for (const [y0, y1] of [[17.5, 21.5], [21.5, 25.5]]) box(v, x - .3, 3.0, y0, x + .3, 3.5, y1, T.stoneW);
    box(v, 13, 3.0, 15, 27, 3.3, 15.4, T.stoneW);
    for (let y = 16; y <= 28; y += 3) { box(v, 13, 2.2, y, 13.35, 2.4, y + 1, T.stoneW); box(v, 26.65, 2.2, y, 27, 2.4, y + 1, T.stoneW); }
  }
  if (f.id === "c3") for (const x of [6.5, 19.5]) box(v, x - .25, 1.8, 3, x + .25, 2.0, 15, T.stoneW);
}
function factoryDecor(v, f) {
  const H = 5;
  for (let y = 15; y <= 28; y += 3) {   // dàn kèo thép mái xưởng
    box(v, 2, H - .35, y - .08, 27, H - .2, y + .08, T.steelB); box(v, 2, H - 1.3, y - .06, 27, H - 1.2, y + .06, T.steelB);
    for (let x = 3; x < 27; x += 2) { const B = XL(XW, x + 1, H - .75, y, 0, (x % 4 ? 1 : -1) * .78); pbox(v, B, x + .5, H - 1.2, y - .04, x + 1.5, H - 1.15, y + .04, T.steelB); }
  }
  for (const x of [8, 20]) for (let y = 15; y < 28; y += 6) quad(v, [[x, H - .01, y, 0, 0], [x + 3, H - .01, y, 1, 0], [x + 3, H - .01, y + 2, 1, 1], [x, H - .01, y + 2, 0, 1]], [0, -1, 0], LAYER.get(T.skylight));
  box(v, 2, 3.7, 20.5, 27, 4.0, 21.1, T.hazard); box(v, 15, 3.4, 20.4, 16.2, 3.7, 21.2, T.hazard);   // cầu trục
  for (let i = 0; i < 9; i++) box(v, 15.58, 1.8 + i * .18, 20.78, 15.62, 1.95 + i * .18, 20.82, T.metal); box(v, 15.4, 1.6, 20.6, 15.8, 1.8, 21, T.metal);
  box(v, 2, 2.6, 14, 27, 2.68, 15.1, T.grate); for (let x = 2.5; x < 27; x += 1.5) box(v, x, 2.68, 15.05, x + .05, 3.5, 15.1, T.metal); box(v, 2, 3.45, 15.05, 27, 3.5, 15.1, T.metal);   // sàn thao tác
  box(v, 2, 2.6, 15, 3.1, 2.68, 28, T.grate); for (let y = 15.5; y < 28; y += 1.5) box(v, 3.05, 2.68, y, 3.1, 3.5, y + .05, T.metal); box(v, 3.05, 3.45, 15, 3.1, 3.5, 28, T.metal);
  for (const [z, r] of [[14.2, .16], [14.55, .1]]) pcylX(v, XW, 4.3 + r, z, 2, 27, r, 8, T.rust, T.rust);
}
function churchDecor(v, f) {
  const H = 4.6;
  for (let x = 31; x <= 42; x += 2) box(v, x, H - .3, 4, x + .3, H - .1, 14, T.darkwood);
  for (const x of [33.5, 40.5]) box(v, x - .25, 3.2, 4, x + .25, 3.6, 13.5, T.stoneW);
}
function buildArchTextures() {
  const win = (frame, glass, extra) => tex((g, w, h) => { R(g, 0, 0, w, h, frame); extra(g, w, h, glass); }, (g, w, h) => { g.globalAlpha = .55; extra(g, w, h, glass, 1); g.globalAlpha = 1; });
  T.winHouse = tex((g, w, h) => {
    wallpaper(g, w, h); R(g, 26, 14, 76, 78, "#2a1a0e"); const gr = g.createLinearGradient(0, 18, 0, 90); gr.addColorStop(0, "#1a2a44"); gr.addColorStop(1, "#0a1220"); g.fillStyle = gr; g.fillRect(31, 19, 66, 68);
    g.strokeStyle = "#05070a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(40, 87); g.lineTo(52, 50); g.lineTo(46, 30); g.moveTo(52, 50); g.lineTo(70, 38); g.lineTo(88, 24); g.moveTo(70, 38); g.lineTo(80, 52); g.stroke();
    R(g, 62, 19, 4, 68, "#2a1a0e"); R(g, 31, 50, 66, 4, "#2a1a0e"); R(g, 22, 90, 84, 5, "#3a2414"); g.strokeStyle = "rgba(220,230,255,.35)"; g.lineWidth = .6; g.beginPath(); g.moveTo(34, 22); g.lineTo(60, 48); g.stroke();
    R(g, 18, 10, 12, 86, "#3a0a0a"); R(g, 98, 10, 12, 86, "#3a0a0a");
  }, g => { const gr = g.createLinearGradient(0, 18, 0, 90); gr.addColorStop(0, "rgba(80,110,170,.55)"); gr.addColorStop(1, "rgba(30,45,80,.3)"); g.fillStyle = gr; g.fillRect(31, 19, 31, 31); g.fillRect(66, 19, 31, 31); g.fillRect(31, 54, 31, 33); g.fillRect(66, 54, 31, 33); });
  T.winFactory = tex((g, w, h) => {
    concrete(g, w, h); R(g, 8, 8, 112, 112, "#2a2e30");
    for (let y = 12; y < 116; y += 15) for (let x = 12; x < 116; x += 13) { const broken = rnd() < .22; R(g, x, y, 11, 13, broken ? "#030405" : "#1a2a34"); if (!broken && rnd() < .5) R(g, x, y, 11, 13, "rgba(60,70,60,.6)"); }
  }, g => { for (let y = 12; y < 116; y += 15) for (let x = 12; x < 116; x += 13) { g.fillStyle = `rgba(70,95,130,${.25 + rnd() * .3})`; g.fillRect(x, y, 11, 13); } });
  T.skylight = tex((g, w, h) => { R(g, 0, 0, w, h, "#222628"); for (let y = 4; y < 128; y += 31) for (let x = 4; x < 128; x += 31) R(g, x, y, 28, 28, "#101820"); },
    g => { for (let y = 4; y < 128; y += 31) for (let x = 4; x < 128; x += 31) { g.fillStyle = `rgba(80,100,140,${.35 + rnd() * .3})`; g.fillRect(x, y, 28, 28); } });
  T.steelB = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3c3a"); for (let i = 0; i < 30; i++) stain(g, rnd() * w, rnd() * h, 6 + rnd() * 14, "rgba(120,55,20,.55)"); R(g, 0, 0, w, 6, "#4a4c4a"); R(g, 0, 122, w, 6, "#2a2c2a"); });
  T.grate = tex((g, w, h) => { R(g, 0, 0, w, h, "#121212"); g.strokeStyle = "#4a4a46"; g.lineWidth = 3; for (let i = -128; i < 256; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); g.beginPath(); g.moveTo(i + 128, 0); g.lineTo(i, 128); g.stroke(); } });
  T.ceilVault = tex((g, w, h) => { stoneWall(g, w, h); g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 128); g.moveTo(128, 0); g.lineTo(0, 128); g.stroke(); });
  T.ceilWood = tex((g, w, h) => { wood(g, w, h, "#1e140c"); });
}
// ---- Bản đồ (phím M) cho mọi map ----

// ---- Chữ máu chảy ----
function bloodify(el, n) {
  if (!el) return; horrorize(el); el.classList.add("blood"); el.querySelectorAll(".drip").forEach(d => d.remove());
  const cnt = n ?? Math.max(3, Math.round(el.textContent.length / 2.2));
  for (let i = 0; i < cnt; i++) { const d = document.createElement("i"); d.className = "drip"; d.style.left = (4 + Math.random() * 92) + "%"; d.style.setProperty("--h", (.25 + Math.random() * .9).toFixed(2) + "em"); d.style.setProperty("--w", (2 + Math.random() * 4).toFixed(1) + "px"); d.style.animationDelay = (Math.random() * 3).toFixed(2) + "s"; d.style.animationDuration = (2.5 + Math.random() * 5).toFixed(2) + "s"; el.appendChild(d); }
}
