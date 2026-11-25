// =====================================================================
//  10. MAP "TRONG RỪNG" — Rừng Thông lúc nửa đêm
//  Nhiệm vụ: đốt 5 búp bê rơm ở lửa trại, tìm xăng, lái xe thoát khỏi rừng.
//  Kẻ thù: MA RỪNG — chỉ tiến lại gần khi bạn KHÔNG nhìn nó; nhìn quá lâu sẽ mất trí.
// =====================================================================
let fseed = 777; const frnd = () => (fseed = (fseed * 16807) % 2147483647) / 2147483647;
function buildForestTextures() {
  T.grass = tex((g, w, h) => { R(g, 0, 0, w, h, "#1c2214"); for (let i = 0; i < 900; i++) { const x = rnd() * w, y = rnd() * h; g.strokeStyle = `rgba(${40 + rnd() * 30 | 0},${55 + rnd() * 30 | 0},${25 + rnd() * 15 | 0},.8)`; g.lineWidth = .7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 3, y - 2 - rnd() * 4); g.stroke(); } for (let i = 0; i < 12; i++) stain(g, rnd() * w, rnd() * h, 6 + rnd() * 10, "rgba(30,20,10,.5)"); grime(g, w, h, 500, .3); });
  T.leaves = tex((g, w, h) => { R(g, 0, 0, w, h, "#24190f"); for (let i = 0; i < 260; i++) { g.save(); g.translate(rnd() * w, rnd() * h); g.rotate(rnd() * 6.3); E(g, 0, 0, 2 + rnd() * 2.5, 1 + rnd(), ["#3a2414", "#4a2e16", "#2e2412", "#3e3418", "#1e1a10"][Math.floor(rnd() * 5)]); g.restore(); } grime(g, w, h, 800, .35); });
  T.dirt = tex((g, w, h) => { R(g, 0, 0, w, h, "#33281e"); for (let i = 0; i < 160; i++) E(g, rnd() * w, rnd() * h, .6 + rnd() * 1.8, .5 + rnd() * 1.2, rnd() < .5 ? "#4a3c2c" : "#221a12"); grime(g, w, h, 1500, .3); for (let i = 0; i < 3; i++) stain(g, rnd() * w, rnd() * h, 10 + rnd() * 14, "rgba(15,10,5,.5)"); });
  T.dirtB = tex((g, w, h) => { R(g, 0, 0, w, h, "#33281e"); grime(g, w, h, 1500, .3); E(g, 64, 64, 30, 18, "#2a0505"); for (let i = 0; i < 10; i++) E(g, 20 + rnd() * 90, 20 + rnd() * 90, 1 + rnd() * 3, 1 + rnd() * 2, "#3a0606"); });
  T.bark = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a2018"); for (let x = 0; x < w; x += 3 + rnd() * 4) R(g, x, 0, 1 + rnd() * 1.5, h, "rgba(0,0,0,.45)"); for (let i = 0; i < 40; i++) R(g, rnd() * w, rnd() * h, 2 + rnd() * 6, 1, "rgba(90,70,50,.3)"); grime(g, w, h, 900, .3); });
  T.deadwood = tex((g, w, h) => { R(g, 0, 0, w, h, "#3e3a36"); for (let x = 0; x < w; x += 3 + rnd() * 5) R(g, x, 0, 1, h, "rgba(0,0,0,.5)"); grime(g, w, h, 900, .3); });
  T.needles = tex((g, w, h) => { R(g, 0, 0, w, h, "#0e1a10"); for (let i = 0; i < 1500; i++) { const x = rnd() * w, y = rnd() * h; g.strokeStyle = rnd() < .5 ? "rgba(30,55,30,.9)" : "rgba(15,30,18,.9)"; g.lineWidth = .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 5, y + 3 + rnd() * 4); g.stroke(); } });
  T.logWall = tex((g, w, h) => { R(g, 0, 0, w, h, "#1a120a"); for (let y = 0; y < h; y += 16) { const gr = g.createLinearGradient(0, y, 0, y + 15); gr.addColorStop(0, "#3a2818"); gr.addColorStop(.5, "#4a3420"); gr.addColorStop(1, "#24180e"); g.fillStyle = gr; g.fillRect(0, y + .5, w, 14.5); for (let i = 0; i < 6; i++) R(g, rnd() * w, y + 3 + rnd() * 9, 8 + rnd() * 20, .6, "rgba(0,0,0,.35)"); } E(g, 30, 40, 4, 4, "#2a1a0c"); E(g, 90, 88, 3, 3, "#2a1a0c"); grime(g, w, h, 900, .35); });
  T.logWallB = tex((g, w, h) => { R(g, 0, 0, w, h, "#1a120a"); for (let y = 0; y < h; y += 16) R(g, 0, y + .5, w, 14.5, "#3e2c1a"); grime(g, w, h, 900, .35); hand(g, 50, 60); writing(g, ["ĐỪNG", "NHÌN NÓ"], 22); });
  T.cabinDoor = tex((g, w, h) => {
    R(g, 0, 0, w, h, "#1a120a"); for (let y = 0; y < h; y += 16) R(g, 0, y + .5, w, 14.5, "#3e2c1a");
    R(g, 16, 0, 96, 128, "#140c06"); R(g, 22, 5, 84, 123, "#4a3420"); for (let x = 22; x < 106; x += 12) R(g, x, 5, 1.2, 123, "#2a1a0c");
    R(g, 22, 40, 84, 5, "#2a1a0c"); R(g, 22, 96, 84, 5, "#2a1a0c"); plaque(g, 64, 18, "TRẠM KIỂM LÂM");
    R(g, 34, 52, 26, 32, "#cfc6ae"); g.fillStyle = "#6a1010"; g.font = "bold 6px 'Times New Roman'"; g.textAlign = "center"; g.fillText("MẤT TÍCH", 47, 60); E(g, 47, 70, 6, 7, "#888"); R(g, 38, 78, 18, 1, "#555");
    R(g, 86, 64, 8, 10, "#6a6a6a"); g.strokeStyle = "#6a6a6a"; g.lineWidth = 1.5; g.beginPath(); g.arc(90, 64, 3, Math.PI, 0); g.stroke(); grime(g, w, h, 600, .35);
  });
  T.roof = tex((g, w, h) => { R(g, 0, 0, w, h, "#1e1610"); for (let y = 0; y < h; y += 10) for (let x = (y / 10 % 2) * 8; x < w; x += 16) { R(g, x + .5, y + .5, 15, 9, rnd() < .5 ? "#2a2018" : "#241a12"); R(g, x + .5, y + 8, 15, 1.5, "rgba(0,0,0,.5)"); } for (let i = 0; i < 6; i++) stain(g, rnd() * w, rnd() * h, 14, "rgba(30,50,25,.5)"); });
  T.canvasT = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a26"); for (let x = 0; x < w; x += 4) R(g, x, 0, 1, h, "rgba(0,0,0,.12)"); grime(g, w, h, 1500, .3); stain(g, 70, 60, 26, "rgba(80,0,0,.7)"); g.strokeStyle = "#0a0a06"; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 20); g.lineTo(46, 70); g.lineTo(38, 110); g.stroke(); g.beginPath(); g.moveTo(40, 20); g.lineTo(56, 72); g.stroke(); });
  T.stone = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a38"); for (let i = 0; i < 40; i++) E(g, rnd() * w, rnd() * h, 4 + rnd() * 10, 3 + rnd() * 6, rnd() < .5 ? "#444442" : "#2e2e2c"); for (let i = 0; i < 8; i++) stain(g, rnd() * w, rnd() * h, 12, "rgba(30,60,25,.55)"); grime(g, w, h, 1500, .3); });
  T.straw = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a4a24"); for (let i = 0; i < 700; i++) { g.strokeStyle = rnd() < .5 ? "rgba(140,115,60,.8)" : "rgba(60,45,20,.8)"; g.lineWidth = .6; const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 3, y + 6 + rnd() * 8); g.stroke(); } grime(g, w, h, 500, .3); });
  T.strawFace = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a4a24"); for (let i = 0; i < 500; i++) { g.strokeStyle = "rgba(140,115,60,.7)"; g.lineWidth = .6; const x = rnd() * w, y = rnd() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 3, y + 6); g.stroke(); }
    g.strokeStyle = "#1a0a06"; g.lineWidth = 3; for (const cx of [54, 74]) { g.beginPath(); g.moveTo(cx - 5, 54); g.lineTo(cx + 5, 64); g.moveTo(cx + 5, 54); g.lineTo(cx - 5, 64); g.stroke(); }
    g.lineWidth = 2; g.beginPath(); g.moveTo(54, 82); for (let i = 0; i < 6; i++) g.lineTo(56 + i * 3.5, 80 + (i % 2) * 5); g.stroke(); drip(g, 54, 64, 18, "#5a0505"); });
  T.fire = tex((g, w, h) => R(g, 0, 0, w, h, "#ff8a20"), g => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "#ffe080"); gr.addColorStop(1, "#ff5a10"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  T.charcoal = tex((g, w, h) => { R(g, 0, 0, w, h, "#141210"); for (let i = 0; i < 30; i++) R(g, 0, rnd() * h, w, 1, "rgba(60,40,30,.4)"); grime(g, w, h, 800, .4); });
  T.ember = tex((g, w, h) => { R(g, 0, 0, w, h, "#1a1410"); }, g => { for (let i = 0; i < 60; i++) E(g, rnd() * 128, rnd() * 128, 1 + rnd() * 3, 1 + rnd() * 2, "#ff4a10"); });
  T.redCan = tex((g, w, h) => { R(g, 0, 0, w, h, "#7a1410"); R(g, 10, 30, 108, 60, "#c8b8a0"); g.fillStyle = "#7a1410"; g.font = "bold 30px 'Times New Roman'"; g.textAlign = "center"; g.fillText("XĂNG", 64, 72); grime(g, w, h, 900, .35); });
  T.radio = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a2c26"); R(g, 10, 14, 70, 40, "#1a1a16"); for (let y = 18; y < 52; y += 4) R(g, 14, y, 62, 2, "#333"); R(g, 86, 14, 32, 18, "#c8a050"); R(g, 100, 14, 2, 18, "#a00"); E(g, 96, 60, 9, 9, "#444"); E(g, 116, 60, 7, 7, "#444"); grime(g, w, h, 600, .3); }, g => { g.globalAlpha = .5; R(g, 86, 14, 32, 18, "#ffb050"); });
  T.shrineFront = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a1410"); R(g, 20, 14, 88, 80, "#1a0a06"); R(g, 46, 24, 36, 44, "#cfc6ae"); E(g, 64, 42, 9, 11, "#8a7a6a"); R(g, 30, 80, 68, 14, "#8a6a2a"); for (let i = 0; i < 5; i++) R(g, 48 + i * 8, 64, 1.2, 18, "#5a4a2a"); grime(g, w, h, 900, .35); }, g => { for (let i = 0; i < 5; i++) E(g, 48.6 + i * 8, 63, 1, 1, "#ff6020"); });
  T.tileRed = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a0c08"); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 10) { E(g, x + 5, y + 6, 5, 3, "#5a1610"); } grime(g, w, h, 900, .4); });
  T.stalkerSkin = tex((g, w, h) => { R(g, 0, 0, w, h, "#121010"); for (let i = 0; i < 30; i++) { g.strokeStyle = "rgba(60,50,50,.5)"; g.lineWidth = .7; g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.bezierCurveTo(rnd() * w, rnd() * h, rnd() * w, rnd() * h, rnd() * w, rnd() * h); g.stroke(); } grime(g, w, h, 800, .4); });
  T.stalkerFace = tex((g, w, h) => { R(g, 0, 0, w, h, "#121010"); E(g, 64, 66, 30, 46, "#d8d4cc"); E(g, 54, 58, 6, 9, "rgba(0,0,0,.55)"); E(g, 74, 58, 6, 9, "rgba(0,0,0,.55)"); g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = .8; g.beginPath(); g.moveTo(52, 90); g.lineTo(76, 90); g.stroke(); for (let x = 54; x < 76; x += 4) { g.beginPath(); g.moveTo(x, 87); g.lineTo(x + 1, 93); g.stroke(); } },
    g => { g.globalAlpha = .16; E(g, 64, 66, 30, 46, "#ffffff"); });
  const signT = txt => tex((g, w, h) => { wood(g, w, h, "#4a3420"); R(g, 0, 0, w, 6, "#2a1a0c"); R(g, 0, h - 6, w, 6, "#2a1a0c"); g.fillStyle = "#e8dcc0"; g.font = "bold 17px 'Times New Roman'"; g.textAlign = "center"; txt.split("|").forEach((l, i, a) => g.fillText(l, 64, 66 - (a.length - 1) * 10 + i * 22)); grime(g, w, h, 700, .35); });
  T.signCamp = signT("BÃI TRẠI"); T.signCabin = signT("TRẠM|KIỂM LÂM"); T.signWell = signT("GIẾNG CŨ"); T.signShrine = signT("MIẾU THỜ"); T.signRoad = signT("ĐƯỜNG RA|BÌA RỪNG");
  T.sky = tex((g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#010205"); gr.addColorStop(.38, "#070a12"); gr.addColorStop(.5, "#1b2330"); gr.addColorStop(1, "#1b2330"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { const y = rnd() * h * .45; g.fillStyle = `rgba(220,225,255,${.2 + rnd() * .7 * (1 - y / (h * .45))})`; g.fillRect(rnd() * w, y, .5 + rnd() * .5, .5 + rnd() * .5); }
    for (let i = 0; i < 10; i++) { g.fillStyle = "rgba(10,12,18,.55)"; g.beginPath(); g.ellipse(rnd() * w, 20 + rnd() * 35, 20 + rnd() * 30, 3 + rnd() * 4, 0, 0, 7); g.fill(); }
    const mx = w * .3, my = h * .28; const mg = g.createRadialGradient(mx, my, 0, mx, my, 18); mg.addColorStop(0, "rgba(200,210,230,.35)"); mg.addColorStop(1, "rgba(200,210,230,0)"); g.fillStyle = mg; g.fillRect(mx - 18, my - 18, 36, 36);
    g.fillStyle = "#121820"; g.beginPath(); g.moveTo(0, 64); for (let x = 0; x <= w; x += 4) g.lineTo(x, 60 - Math.abs(Math.sin(x * .021)) * 9 - Math.sin(x * .07) * 2); g.lineTo(w, 64); g.fill();
    g.fillStyle = "#0c1016"; for (let x = 0; x < w; x += 3) { const hh = 3 + (Math.sin(x * 1.7) + 1) * 2.5; g.beginPath(); g.moveTo(x - 2, 64); g.lineTo(x, 64 - hh); g.lineTo(x + 2, 64); g.fill(); }
    E(g, mx, my, 4, 5.5, "#e4e2d6"); E(g, mx - 1, my - 1, 1, 1.2, "#b8b6aa"); E(g, mx + 1.4, my + 1.5, .8, .8, "#c4c2b6"); E(g, mx + 2.2, my - .5, 3.6, 5.6, "#9a2a20");   // trăng máu khuyết
  }, null, 256, 128);
}
const FOG_FOREST = [Math.pow(27 / 255, 2.2), Math.pow(35 / 255, 2.2), Math.pow(48 / 255, 2.2)];
function moonDir() { const u = .3, v = .28, t0 = v * Math.PI, p = u * 2 * Math.PI - Math.PI; return [Math.sin(t0) * Math.sin(p), Math.cos(t0), Math.sin(t0) * Math.cos(p)]; }

function buildForest() {
  fseed = 777;
  const f = makeFloor("f1", "Rừng Thông", 70, 70, T.ceilBeam, T.logWall, T.leaves, .02);
  f.outdoor = 1; f.roofs = []; f.path = new Set();
  const open1 = (x, y) => { if (x > 1 && y > 1 && x < f.w - 2 && y < f.h - 2 && f.grid[y][x] === "#") f.grid[y][x] = "."; };
  const blob = (cx, cy, r) => { for (let y = Math.floor(cy - r - 2); y <= cy + r + 2; y++) for (let x = Math.floor(cx - r - 2); x <= cx + r + 2; x++) { const a = Math.atan2(y - cy, x - cx); if (Math.hypot(x + .5 - cx, y + .5 - cy) < r * (1 + .16 * Math.sin(a * 3 + cx) + .1 * Math.sin(a * 7 + cy))) open1(x, y); } };
  const path = pts => { for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) / .25);
    for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n, py = ay + (by - ay) * k / n, w = .9 + Math.sin(k * .3 + i) * .25;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = Math.floor(px + dx * .5), y = Math.floor(py + dy * .5); if (Math.hypot(dx * .5, dy * .5) <= w) { open1(x, y); f.path.add(y * f.w + x); } } } } };
  // Bãi đất trống & lối mòn
  for (let y = 49; y <= 53; y++) for (let x = 21; x <= 35; x++) { open1(x, y); f.path.add(y * f.w + x); }
  blob(28, 28, 5.5); blob(12, 13, 5); blob(42, 12, 6.8); blob(9, 37, 3.3); blob(46, 40, 3.4); blob(20, 44, 2.6); blob(40, 26, 2.6);
  path([[28, 50], [27, 42], [29, 36], [28, 31]]); path([[26, 26], [20, 21], [15, 16]]); path([[30, 25], [36, 20], [41, 17]]);
  path([[24, 30], [17, 33], [11, 36]]); path([[32, 31], [39, 35], [45, 39]]); path([[46, 42], [41, 47], [33, 50]]);
  path([[11, 18], [8, 25], [9, 34]]); path([[27, 42], [21, 44]]); path([[36, 20], [40, 26]]);
  blob(60, 30, 5.2); blob(58, 58, 5.5); blob(17, 61, 4.2); blob(46, 63, 3.2); blob(62, 12, 3.6);
  path([[46, 40], [53, 35], [59, 31]]); path([[45, 41], [52, 50], [57, 57]]); path([[24, 52], [19, 57], [17, 60]]); path([[34, 52], [42, 60], [46, 62]]);
  path([[46, 12], [55, 12], [61, 12]]); path([[60, 26], [61, 17], [62, 13]]); path([[52, 58], [47, 62]]);
  // Trạm kiểm lâm (nhà gỗ)
  for (let y = 7; y <= 14; y++) for (let x = 38; x <= 46; x++) { f.grid[y][x] = (y === 7 || y === 14 || x === 38 || x === 46) ? "c" : "."; if (f.grid[y][x] === ".") f.room[y * f.w + x] = { wall: T.logWall, floor: T.wood, roof: 1 }; }
  f.grid[14][42] = "d"; f.grid[10][38] = "e"; f.roofs.push([38, 7, 47, 15]);
  // Kết cấu nền
  f.floorT = [];
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const k = y * f.w + x, h = (x * 73856093 ^ y * 19349663) >>> 0, rm = f.room[k];
    f.floorT[k] = rm ? rm.floor : f.path.has(k) ? (h % 17 === 0 ? T.dirtB : T.dirt) : f.grid[y][x] === "#" ? T.leaves : (h % 10 < 6 ? T.grass : T.leaves);
  }
  const S_ = (x, y, k, o = {}) => f.sprites.push({ x, y, k, ...o });
  // Xe ở bìa rừng (lối thoát)
  f.sprites.push({ x: 28, y: 52, t: T.car, rot: -Math.PI / 2, act: "car", reach: 3, wide: .7 });
  S_(23.5, 49.4, "sign", { tex: T.signRoad, rot: -Math.PI / 2, act: "sign", text: "ĐƯỜNG RA BÌA RỪNG — XE KHÔNG ĐƯỢC VÀO SAU 0 GIỜ" });
  // Lửa trại trung tâm & biển chỉ đường
  S_(28, 28, "bonfire", { act: "fire", reach: 2.2, wide: .5, solid: .8 });
  f.lights.push({ x: 28, y: 28, h: .55, i: 2.2, r: 1, g: .55, b: .2, f: .22, cond: () => S.fireLit });
  S_(24.6, 24.8, "sign", { tex: T.signCamp, rot: Math.PI * .25, act: "sign", text: "BÃI TRẠI — lối Tây Bắc" }); S_(31.4, 24.8, "sign", { tex: T.signCabin, rot: Math.PI * .75, act: "sign", text: "TRẠM KIỂM LÂM — lối Đông Bắc" });
  S_(24.4, 31.2, "sign", { tex: T.signWell, rot: -Math.PI * .25, act: "sign", text: "GIẾNG CŨ — lối Tây" }); S_(31.6, 31.2, "sign", { tex: T.signShrine, rot: -Math.PI * .75, act: "sign", text: "MIẾU THỜ — lối Đông Nam" });
  // Khu cắm trại bỏ hoang
  S_(10, 10.5, "tent", { act: "tent1", rot: Math.PI / 2, reach: 2.2, wide: .5, solid: 1 }); S_(15, 11, "tent", { act: "tent2", rot: Math.PI * .7, reach: 2.2, wide: .5, solid: 1 }); S_(13.5, 16.5, "tent", { act: "tent3", rot: -Math.PI * .6, reach: 2.2, wide: .5, solid: 1 });
  S_(12, 13.5, "ashes", { solid: .5 }); S_(9, 15, "log"); S_(16.5, 14, "log", { rot: 1.2 });
  // Giếng, miếu, cây treo cổ
  S_(9, 37, "well", { act: "well", reach: 2, wide: .5, solid: .9 });
  S_(46.8, 40.5, "shrine", { act: "shrine", rot: Math.PI, reach: 2, wide: .5, solid: .8 }); f.lights.push({ x: 46, y: 40.5, h: .5, i: .5, r: 1, g: .45, b: .2 });
  S_(20, 44, "noose"); S_(19.3, 43.4, "stump", { solid: .4 });
  // Trong trạm kiểm lâm
  f.sprites.push({ x: 40.6, y: 9.3, mesh: "bed", solid: .8 }); f.sprites.push({ x: 43.6, y: 11.6, mesh: "table", solid: .95 });
  S_(43.2, 11.5, "radio", { base: .76, act: "radio", reach: 1.9 }); S_(44.2, 11.7, "lantern", { base: .76 }); f.lights.push({ x: 44.2, y: 11.7, h: 1, i: .8, r: 1, g: .7, b: .35 });
  S_(43.4, 11.9, "book", { base: .76, act: "log", reach: 1.9 }); S_(45.2, 8.6, "fuelcan", { act: "fuel", reach: 1.6 }); f.sprites.push({ x: 41.5, y: 12.3, t: T.chair, rot: 0, solid: .3 });
  // Búp bê rơm treo trên cây (chọn ngẫu nhiên 5 trên 9 vị trí)
  const spots = [[26.2, 44], [29.8, 38.5], [19, 21.5], [36.8, 21.2], [16.5, 33.8], [40.5, 34.4], [42, 46.6], [8.4, 26], [38.8, 25]];
  spots.sort(() => Math.random() - .5).slice(0, 5).forEach(([x, y]) => S_(x, y, "effigy", { act: "effigy", reach: 2, wide: .4 }));
  // Cây rải rác, đá, gốc cây, khúc gỗ
  for (let i = 0; i < 400 && f.sprites.filter(s => s.k === "tree").length < 74; i++) {
    const x = 3 + frnd() * (f.w - 6), y = 3 + frnd() * (f.w - 6), cx = Math.floor(x), cy = Math.floor(y);
    if (f.grid[cy][cx] !== "." || f.path.has(cy * f.w + cx) || f.room[cy * f.w + cx]) continue;
    if (f.sprites.some(s => Math.hypot(s.x - x, s.y - y) < 2.4) || Math.hypot(x - 28, y - 50) < 6) continue;
    S_(x, y, frnd() < .7 ? "tree" : "dead", { solid: .32, seed: i });
  }
  for (let i = 0; i < 30; i++) { const x = 3 + frnd() * (f.w - 6), y = 3 + frnd() * (f.w - 6); if (f.grid[Math.floor(y)][Math.floor(x)] === "." && !f.room[Math.floor(y) * f.w + Math.floor(x)] && !f.sprites.some(s => Math.hypot(s.x - x, s.y - y) < 1.5)) S_(x, y, ["rock", "stump", "log"][i % 3], { rot: frnd() * 6, solid: i % 3 === 1 ? .3 : 0 }); }
  // Pin
  [[13, 9], [44, 9.5], [27, 36], [9.5, 34], [47.5, 38], [20.5, 45.5], [33, 50.5], [39.5, 27]].sort(() => Math.random() - .5).slice(0, Math.max(3, D.bat - 2))
    .forEach(([x, y]) => f.sprites.push({ x, y, t: T.battery, sh: .18, kind: "battery" }));
  f.labels = [["Bãi trại", 12, 13], ["Lửa trại", 28, 28], ["Trạm kiểm lâm", 42, 17.5], ["Giếng", 9, 37], ["Miếu", 46, 43.5], ["Xe", 28, 51], ["?", 20, 44], ["Hồ nước đen", 60, 30], ["Làng bỏ hoang", 58, 58], ["Cây cổ thụ", 17, 61], ["Đồi đá", 62, 12]];
  S_(17.5, 60.4, "noose"); S_(16.6, 61.2, "stump", { solid: .4 }); S_(56.5, 57, "tent", { rot: .6, solid: 1 }); S_(59.8, 59.2, "ashes", { solid: .5 }); S_(58, 30, "rock", { rot: 1, solid: .3 }); S_(61.5, 31.5, "rock", { rot: 2 });
  return f;
}
// ---- Mô hình 3D của khu rừng ----

function forestThing(v, s) {
  const { c, s: sn } = facing(s.rot ?? -Math.PI / 2), X = XF(s.x, s.base || 0, s.y, c, sn), dw = T.darkwood;
  switch (s.k) {
    case "tree": case "dead": treeAt(v, s.x, s.y, 4.2 + (s.seed % 5) * .5, s.k === "tree" ? (s.seed % 7) : 7 + s.seed % 3); break;
    case "sign": pbox(v, X, -.04, 0, -.04, .04, 1.25, .04, dw); pbox(v, X, -.5, .95, .04, .5, 1.3, .1, { all: dw, f: s.tex, k: s.tex }); break;
    case "bonfire":
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; psphere(v, XF(s.x + Math.cos(a) * .7, 0, s.y + Math.sin(a) * .7), 0, .05, 0, .14, 4, T.stone, .7); }
      for (let i = 0; i < 6; i++) { const a = i * 1.05; const B = XF(s.x, .08, s.y, Math.cos(a), Math.sin(a)); pcylX(v, B, .08 + (i % 2) * .1, 0, -.55, .55, .07, 7, S.fireLit ? T.charcoal : T.bark, T.bark); }
      if (S.fireLit) { pcyl(v, X, 0, 0, .1, .2, .5, .45, 10, T.ember, T.ember); for (let i = 0; i < 7; i++) { const a = i * .9, r = i ? .22 : 0; pcyl(v, X, Math.cos(a) * r, Math.sin(a) * r, .15, .75 + (i ? .3 : .8) * (1 - i * .07), .22 - i * .015, 0, 7, T.fire); } }
      break;
    case "tent": {
      const L = 1.1, W = .95, H = 1.15, tx = T.canvasT;
      lq(v, X, [[0, H, -L, 0, 0], [0, H, L, 1, 0], [-W, 0, L, 1, 1], [-W, 0, -L, 0, 1]], [-.75, .66, 0], tx); lq(v, X, [[0, H, L, 0, 0], [0, H, -L, 1, 0], [W, 0, -L, 1, 1], [W, 0, L, 0, 1]], [.75, .66, 0], tx);
      lq(v, X, [[0, H, -L, .5, 0], [0, H, -L, .5, 0], [W, 0, -L, 1, 1], [-W, 0, -L, 0, 1]], [0, 0, -1], tx);
      lq(v, X, [[0, H, L, .5, 0], [0, H, L, .5, 0], [-W * .5, 0, L, 0, 1], [W * .5, 0, L, 1, 1]], [0, 0, 1], T.dark);
      lq(v, X, [[0, H, L, .5, 0], [-W * .5, 0, L, 0, 1], [-W, 0, L, 0, 1], [0, H, L, .5, 0]], [0, 0, 1], tx); lq(v, X, [[0, H, L, .5, 0], [W, 0, L, 1, 1], [W * .5, 0, L, 1, 1], [0, H, L, .5, 0]], [0, 0, 1], tx);
      pbox(v, X, -.02, 0, L - .02, .02, H + .1, L + .02, dw); break; }
    case "ashes": for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; psphere(v, XF(s.x + Math.cos(a) * .5, 0, s.y + Math.sin(a) * .5), 0, .04, 0, .11, 4, T.stone, .7); } pcyl(v, X, 0, 0, 0, .05, .4, .35, 8, T.charcoal, T.charcoal); break;
    case "log": pcylX(v, XF(s.x, 0, s.y, Math.cos(s.rot || 0), Math.sin(s.rot || 0)), .17, 0, -1, 1, .17, 8, T.bark, T.bark); break;
    case "rock": psphere(v, XF(s.x, 0, s.y), 0, .1, 0, .32, 5, T.stone, .7); break;
    case "stump": pcyl(v, X, 0, 0, 0, .45, .3, .26, 9, T.bark, T.bark); break;
    case "well":
      pcyl(v, X, 0, 0, 0, .75, .8, .8, 14, T.stone, null); pcyl(v, X, 0, 0, 0, .75, .62, .62, 14, T.stone, null); pcyl(v, X, 0, 0, .74, .76, .8, .8, 14, T.stone, T.stone);
      pcyl(v, X, 0, 0, .3, .32, .62, .62, 14, T.dark, T.dark);
      for (const x of [-.75, .7]) pbox(v, X, x, 0, -.05, x + .07, 1.85, .05, dw); pbox(v, X, -.85, 1.8, -.06, .85, 1.88, .06, dw);
      pbox(v, X, -.006, .9, -.006, .006, 1.8, .006, T.rope); pcyl(v, X, 0, 0, .78, .98, .13, .15, 8, dw, dw);
      lq(v, X, [[-1, 1.95, -.6, 0, 0], [1, 1.95, -.6, 1, 0], [1, 2.35, 0, 1, 1], [-1, 2.35, 0, 0, 1]], [0, .8, -.6], T.roof); lq(v, X, [[1, 1.95, .6, 0, 0], [-1, 1.95, .6, 1, 0], [-1, 2.35, 0, 1, 1], [1, 2.35, 0, 0, 1]], [0, .8, .6], T.roof); break;
    case "shrine":
      pbox(v, X, -.55, 0, -.45, .55, .5, .45, T.stone); pbox(v, X, -.42, .5, -.32, .42, 1.25, .32, { all: T.redcloth, f: T.shrineFront });
      lq(v, X, [[-.62, 1.2, .5, 0, 0], [.62, 1.2, .5, 1, 0], [.62, 1.55, 0, 1, 1], [-.62, 1.55, 0, 0, 1]], [0, .8, .6], T.tileRed); lq(v, X, [[.62, 1.2, -.5, 0, 0], [-.62, 1.2, -.5, 1, 0], [-.62, 1.55, 0, 1, 1], [.62, 1.55, 0, 0, 1]], [0, .8, -.6], T.tileRed);
      candle3d(v, X, -.3, .5, .38, .1); candle3d(v, X, .3, .5, .38, .1); break;
    case "noose": pbox(v, X, -.006, 1.55, -.006, .006, 3.3, .006, T.rope); pcyl(v, X, 0, 0, 1.4, 1.42, .1, .1, 8, T.rope); pcyl(v, X, 0, 0, 1.28, 1.42, .1, .1, 8, T.rope); pbox(v, X, -1.5, 3.25, -.05, .5, 3.35, .05, T.deadwood); treeAt(v, s.x - 1.6, s.y, 4.5, 8); break;
    case "effigy": {
      const top = 2.45; pbox(v, X, -.008, top, -.008, .008, 3.6, .008, T.rope); pbox(v, X, -.9, 3.55, -.05, .3, 3.65, .05, T.deadwood);
      psphere(v, X, 0, top - .12, 0, .13, 7, T.strawFace, 1.1); pcyl(v, X, 0, 0, top - 1.0, top - .24, .1, .14, 8, T.straw, T.straw);
      pbox(v, X, -.42, top - .45, -.035, .42, top - .38, .035, T.straw); pbox(v, X, -.12, top - 1.55, -.035, -.05, top - 1.0, .035, T.straw); pbox(v, X, .05, top - 1.55, -.035, .12, top - 1.0, .035, T.straw);
      pcyl(v, X, 0, 0, top - .62, top - .56, .15, .15, 8, T.redEye); break; }
    case "radio": pbox(v, X, -.13, 0, -.06, .13, .16, .06, { all: T.plastic, f: T.radio }); pbox(v, X, .08, .16, -.01, .09, .42, .01, T.metal); break;
    case "lantern": pcyl(v, X, 0, 0, 0, .04, .07, .07, 8, T.metal, T.metal); pcyl(v, X, 0, 0, .04, .2, .055, .055, 8, T.bulbOn, null); pcyl(v, X, 0, 0, .2, .25, .07, .03, 8, T.metal, T.metal); break;
    case "book": pbox(v, X, -.12, 0, -.09, .12, .035, .09, { all: T.redcloth, t: T.paperSheet }); break;
    case "fuelcan": pbox(v, X, -.15, 0, -.1, .15, .4, .1, { all: T.redCan, t: T.redCan }); pbox(v, X, -.1, .4, -.015, .1, .46, .015, T.redCan); pcyl(v, X, .1, 0, .4, .5, .025, .02, 6, T.metal, T.metal); break;
  }
}
// Ma Rừng: cao gầy, không mặt, gạc hươu trên đầu

const CAMPER_NOTE = `<b>Mảnh giấy nhàu trong ba lô</b><br>Ngày thứ 3. Minh và Tú mất tích rồi. Nó cao lắm, gầy, không có mặt, trên đầu mọc gạc như hươu.<br>
Nó <b>chỉ tiến lại khi mình không nhìn nó</b>... nhưng <b>nhìn nó lâu</b> thì đầu óc như muốn nổ tung.<br><br>
Ông cụ ở miếu nói: nó sống nhờ những <b>hình nhân bằng rơm</b> treo trong rừng. Đốt hết chúng trong <b>lửa trại</b> thì nó không giữ được ai nữa.<br>
Chìa khóa trạm kiểm lâm bị rơi xuống <b>giếng cũ</b>. Trong trạm có xăng.`;
const RANGER_LOG = `<b>Sổ trực trạm kiểm lâm</b><br>23/11 — Thêm 2 người mất tích ở khu cắm trại phía tây bắc.<br>24/11 — Lại thấy búp bê rơm treo dọc các lối mòn. Ai treo? Tôi đã gỡ một con, sáng ra nó lại ở đó.<br>
25/11 — Có thứ gì đứng ở bìa rừng nhìn vào trạm suốt đêm. Tôi không dám nhìn lâu.<br>26/11 — Tôi làm rơi chìa khóa xuống giếng khi chạy. Nếu ai đọc được: đốt hết bọn búp bê, rồi đi đi. Đừng quay lại.`;
const FOREST = {
  NAMES: { d: "Cửa trạm kiểm lâm", e: "Chữ trên vách gỗ" },
  ACTIONS: {
    d(c) {
      if (!has("cabinkey")) return say("Cửa trạm kiểm lâm khóa chặt. Trên cửa dán tờ thông báo đã phai màu: MẤT TÍCH.");
      F.grid[c.y][c.x] = "."; S.cabinOpen = true; removeItem("cabinkey"); refreshWalls(); noise(.4, 700, .4); say("Ổ khóa gỉ bật ra. Bên trong tối om, mùi dầu hỏa và thứ gì đó tanh tưởi.");
    },
    e() { flicker(); say("Ai đó đã khắc lên vách bằng móng tay: ĐỪNG NHÌN NÓ."); },
  },
  SPRITE_ACTS: {
    tent1() {
      if (S.pack) return say("Chiếc ba lô đã trống rỗng.");
      S.pack = 1; addItem("lighter", "Bật lửa"); addItem("map", "Bản đồ vẽ tay", () => toggleMap()); addItem("note", "Mảnh giấy nhàu", () => showNote(CAMPER_NOTE)); progress();
      say("Trong lều có một chiếc ba lô: bật lửa, một tấm bản đồ vẽ tay và một mảnh giấy nhàu..."); setTimeout(() => showNote(CAMPER_NOTE), 600);
    },
    tent2() { if (!S.tent2) { S.tent2 = 1; return jumpScare(() => say("Thứ gì đó lao ra khỏi lều rồi biến mất vào bóng tối! Vải lều rách toạc bởi những vết cào dài.")); } say("Vải lều đầy vết cào. Bên trong chỉ còn một chiếc giày trẻ con."); },
    tent3() { say("Một chiếc túi ngủ đẫm máu khô. Bên trong... trống rỗng."); },
    fire(s) {
      if (!has("lighter")) return say("Đống củi khô xếp sẵn giữa vòng đá. Bạn cần thứ gì đó để nhóm lửa.");
      if (!S.fireLit) { S.fireLit = 1; buildFloorMesh(F); progress(); flicker(1.2); noise(1.5, 300, .5, .4); return say("Ngọn lửa bùng lên! Trong khoảnh khắc, bạn thấy hàng chục cái bóng đứng quanh bìa rừng... rồi biến mất."); }
      if (!S.held) return say(S.burned >= 5 ? "Lửa trại cháy đều. Khu rừng im lặng lạ thường." : `Lửa trại cháy đều. Vẫn còn ${5 - S.burned} búp bê rơm treo đâu đó trong rừng.`);
      S.burned += S.held; S.held = 0; removeItem("effigy"); screech(); flicker(1.2);
      if (S.burned >= 5) { for (const g of ghosts) g.mul *= .7; say("Con búp bê cuối cùng bốc cháy. Một tiếng thét xé toạc khu rừng... Thứ đó vừa yếu đi. Giờ hãy tìm cách rời khỏi đây!"); }
      else say(`Búp bê rơm quằn quại trong lửa, phát ra tiếng thét như người. (Đã đốt ${S.burned}/5)`);
    },
    effigy(s) {
      s.taken = true; buildFloorMesh(F); S.held++; removeItem("effigy"); addItem("effigy", `Búp bê rơm ×${S.held}`); progress(); giggle(); flicker();
      for (const g of ghosts) g.mul *= 1.06;
      say(S.held + S.burned >= 5 ? "Bạn gỡ con búp bê rơm cuối cùng. Mang hết về lửa trại mà đốt!" : `Bạn gỡ con búp bê rơm khỏi cành cây. Nó ấm... như vừa có người ôm. (Đang cầm ${S.held}, đã đốt ${S.burned}/5)`);
    },
    well() {
      if (has("cabinkey") || S.cabinOpen) return say("Đáy giếng tối om. Có tiếng thở dốc vọng lên.");
      jumpScare(() => { addItem("cabinkey", "Chìa khóa trạm kiểm lâm"); progress(); say("Bạn kéo chiếc gàu lên... bên trong là một bàn tay người đã thối rữa, vẫn nắm chặt chiếc chìa khóa có thẻ: TRẠM KIỂM LÂM."); });
    },
    shrine() {
      if (S.prayed) return say("Bia đá khắc: \"Ma rừng sợ lửa. Ai đốt hết hình nhân của nó sẽ được ra đi.\"");
      S.prayed = 1; player.hp = Math.min(D.hp, player.hp + 1); tone(523, 0, 1.4, .04); tone(784, .3, 1.6, .04);
      say("Bạn thắp hai ngọn nến còn sót. Một làn gió ấm lướt qua (hồi 1 tinh thần). Bia đá khắc: \"Ma rừng sợ lửa. Ai đốt hết hình nhân của nó sẽ được ra đi.\"");
    },
    sign(s) { say(`Tấm biển gỗ mục: "${s.text}"`); },
    radio() { noise(1.5, 1200, .25, .3); say("...rè rè... \"Tất cả các đơn vị... không vào khu rừng phía bắc sau nửa đêm... nếu thấy một người cao, gầy... ĐỪNG NHÌN VÀO NÓ QUÁ LÂU... và đừng bao giờ quay lưng...\" ...rè rè..."); },
    log() { showNote(RANGER_LOG); },
    fuel(s) { s.taken = true; buildFloorMesh(F); addItem("fuel", "Can xăng"); progress(); say("Can xăng còn gần đầy. Giờ quay về xe ở bìa rừng phía nam."); },
    car() {
      if (!S.fueled && !has("fuel")) return say("Xe hết xăng, kim chỉ vạch đỏ. Trạm kiểm lâm ở phía đông bắc có thể còn xăng.");
      if (has("fuel")) { S.fueled = 1; removeItem("fuel"); noise(1.2, 500, .3, .5); }
      if (S.burned < 5) { noise(.8, 90, .7, .6); giggle(); return say(`Bạn vặn chìa khóa... máy xe khục khặc rồi tắt lịm. Từ trong rừng vọng ra tiếng cười. Nó chưa chịu buông bạn. (Đã đốt ${S.burned}/5 búp bê rơm)`); }
      winForest();
    },
  },
  SPRITE_NAMES: { tent1: "Lều trại", tent2: "Lều trại", tent3: "Lều trại", fire: "Đống lửa trại", effigy: "Búp bê rơm", well: "Giếng cũ", shrine: "Miếu thờ", sign: "Biển gỗ", radio: "Bộ đàm", log: "Sổ trực kiểm lâm", fuel: "Can xăng", car: "Xe của bạn" },
  GOALS: [
    [() => S.pack, "Lục soát khu cắm trại bỏ hoang (theo biển BÃI TRẠI, phía tây bắc).", "Tìm khu cắm trại bỏ hoang."],
    [() => S.fireLit, "Nhóm lửa trại ở bãi đất trống giữa rừng.", "Nhóm lửa trại."],
    [() => S.burned >= 5, () => `Tìm búp bê rơm treo trên cây dọc các lối mòn, mang về đốt ở lửa trại (${S.burned}/5 · đang cầm ${S.held}).`, () => `Đốt búp bê rơm (${S.burned}/5).`],
    [() => has("cabinkey") || S.cabinOpen || has("fuel") || S.fueled, "Kéo gàu ở giếng cũ (phía tây) để lấy chìa khóa trạm kiểm lâm.", "Tìm chìa khóa trạm kiểm lâm."],
    [() => has("fuel") || S.fueled, "Lấy can xăng trong trạm kiểm lâm (phía đông bắc).", "Tìm xăng."],
    [() => false, "Quay về xe ở bìa rừng phía nam, đổ xăng và nổ máy.", "Rời khỏi khu rừng."],
  ],
  hard: "Mục tiêu: Thoát khỏi khu rừng. Đừng nhìn nó quá lâu.",
  intro: "Xe bạn chết máy ở bìa rừng lúc 0 giờ. Điện thoại mất sóng. Trong rừng, có thứ gì đó đang đứng nhìn bạn...",
  whispers: ["...quay lại đây...", "...nhìn ta đi...", "...ở lại với rừng...", "...Minh đây... cứu tôi...", "...sau lưng mày...", "...lạnh lắm..."],
};
function winForest() {
  if (!exitReady()) return;
  S.paused = true; S.ending = true; document.exitPointerLock?.(); const s = Math.round((Date.now() - S.started) / 1000);
  noise(2, 120, .6, .5); say("Máy nổ! Bạn đạp ga...");
  setTimeout(() => {
    $("winTitle").textContent = "THOÁT KHỎI KHU RỪNG"; bloodify($("winTitle"));
    $("winText").innerHTML = `Cấp độ: ${D.name} · Thời gian: ${Math.floor(s / 60)} phút ${s % 60} giây<br><br>Chiếc xe lao ra khỏi bìa rừng. Trong gương chiếu hậu, một bóng người cao gầy đứng giữa đường, nhìn theo bạn cho tới khi khuất hẳn.<br><br><i>Trên ghế sau... có một con búp bê rơm.</i>`;
    playEnding(() => $("win").classList.remove("hidden"));
  }, 1800);
}
function forestAmbient() {
  const r = Math.random();
  if (r < .3) whisperFx(FOREST.whispers);
  else if (r < .5) { noise(.08, 1800, .4, 2); setTimeout(() => noise(.06, 1500, .3, 2), 180); say("Rắc... tiếng cành khô gãy ngay gần đây."); }
  else if (r < .65) { for (let i = 0; i < 10; i++) noise(.06, 200, .25, .8, i * .12); say("Có tiếng chân chạy rất nhanh giữa những thân cây..."); }
  else if (r < .8) { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(700, ac.currentTime); o.frequency.exponentialRampToValueAtTime(240, ac.currentTime + 2); g.gain.setValueAtTime(.0001, ac.currentTime); g.gain.linearRampToValueAtTime(.05, ac.currentTime + .4); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + 2.2); const lp = ac.createBiquadFilter(); lp.frequency.value = 1200; o.connect(lp); lp.connect(g); g.connect(BUS.sfx); o.start(); o.stop(ac.currentTime + 2.3); say("Một tiếng thét xa xăm vọng lại từ sâu trong rừng."); }
  else flicker(1.4);
}
