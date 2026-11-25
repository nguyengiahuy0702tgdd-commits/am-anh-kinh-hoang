// =====================================================================
//  13. MAP "LÂU ĐÀI BỊ BỎ HOANG"
//  Nhiệm vụ: 3 mảnh gia huy + cọc bạc → hầm mộ → giết Nữ Bá Tước → cổng thành mở.
//  Kẻ thù: NỮ BÁ TƯỚC — mù nhưng thính tai: chạy là bị nghe thấy, soi đèn vào là bị phát hiện.
// =====================================================================
function stoneWall(g, w, h, base = "#3c3a36") {
  R(g, 0, 0, w, h, "#1e1c1a");
  for (let y = 0, r = 0; y < h; y += 16, r++) for (let x = (r % 2) * -16; x < w; x += 32) { const c = 50 + rnd() * 14 | 0; R(g, x + 1, y + 1, 30, 14, `rgb(${c},${c - 2},${c - 6})`); R(g, x + 1, y + 1, 30, 1.5, "rgba(255,255,255,.06)"); R(g, x + 1, y + 13.5, 30, 1.5, "rgba(0,0,0,.3)"); }
  grime(g, w, h, 1500, .35); for (let i = 0; i < 5; i++) stain(g, rnd() * w, rnd() * h, 10 + rnd() * 16, "rgba(30,50,20,.45)");
}
function buildCastleTextures() {
  T.stoneW = tex((g, w, h) => stoneWall(g, w, h)); T.stoneWB = tex((g, w, h) => { stoneWall(g, w, h); hand(g, 40, 70); for (let i = 0; i < 8; i++) drip(g, 20 + rnd() * 90, 10, 20 + rnd() * 60, "#4a0404"); });
  T.flag = tex((g, w, h) => { R(g, 0, 0, w, h, "#1c1a18"); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const c = 42 + rnd() * 16 | 0; R(g, x + 1, y + 1, 30, 30, `rgb(${c},${c - 2},${c - 4})`); } grime(g, w, h, 2000, .35); stain(g, 60, 60, 20, "rgba(60,0,0,.5)"); });
  T.stoneCeil = tex((g, w, h) => { stoneWall(g, w, h); R(g, 56, 0, 16, h, "#1a1612"); R(g, 0, 56, w, 16, "#1a1612"); });
  T.torch = tex((g, w, h) => { stoneWall(g, w, h); R(g, 58, 60, 12, 6, "#2a2a2a"); R(g, 61, 34, 6, 30, "#3a2412"); stain(g, 64, 20, 30, "rgba(0,0,0,.6)"); });
  T.shield = tex((g, w, h) => { stoneWall(g, w, h); g.fillStyle = "#5a1010"; g.beginPath(); g.moveTo(36, 22); g.lineTo(92, 22); g.lineTo(92, 60); g.quadraticCurveTo(92, 86, 64, 96); g.quadraticCurveTo(36, 86, 36, 60); g.fill(); g.strokeStyle = "#a08040"; g.lineWidth = 3; g.stroke(); R(g, 60, 30, 8, 52, "#a08040"); R(g, 44, 46, 40, 8, "#a08040"); E(g, 64, 50, 7, 7, "#2a0606"); });
  T.banner = tex((g, w, h) => { stoneWall(g, w, h); R(g, 30, 4, 68, 100, "#4a0808"); g.fillStyle = "#4a0808"; g.beginPath(); g.moveTo(30, 104); g.lineTo(64, 120); g.lineTo(98, 104); g.fill(); g.strokeStyle = "#a08040"; g.lineWidth = 2; g.strokeRect(34, 8, 60, 92); g.fillStyle = "#a08040"; g.beginPath(); g.moveTo(64, 30); g.lineTo(78, 60); g.lineTo(64, 84); g.lineTo(50, 60); g.fill(); E(g, 64, 58, 6, 6, "#4a0808"); R(g, 26, 2, 76, 4, "#2a2018"); grime(g, w, h, 400, .3); });
  const glass = (g, w, h) => { stoneWall(g, w, h); g.fillStyle = "#0a0808"; g.beginPath(); g.moveTo(34, 120); g.lineTo(34, 40); g.quadraticCurveTo(64, 0, 94, 40); g.lineTo(94, 120); g.fill(); };
  T.glass = tex(glass, g => { const cols = ["#7a1010", "#103a7a", "#1a5a20", "#7a6010", "#5a1060"]; for (let y = 24; y < 118; y += 12) for (let x = 38; x < 92; x += 11) { g.fillStyle = cols[Math.floor(rnd() * 5)]; g.globalAlpha = .7; if (!(y < 40 && Math.abs(x + 5 - 64) > (y - 14))) g.fillRect(x, y, 10, 11); } g.globalAlpha = 1; E(g, 64, 60, 10, 13, "rgba(220,210,190,.9)"); E(g, 60, 58, 2, 3, "#000"); E(g, 68, 58, 2, 3, "#000"); });
  T.seal = tex((g, w, h) => { stoneWall(g, w, h); R(g, 20, 6, 88, 122, "#2a2824"); R(g, 24, 10, 80, 118, "#3e3a34"); E(g, 64, 40, 18, 22, "#2a2824"); E(g, 58, 36, 4, 5, "#a01010"); E(g, 70, 36, 4, 5, "#a01010"); R(g, 56, 50, 16, 3, "#1a1814");
    [[40, 84], [64, 96], [88, 84]].forEach(([x, y]) => { E(g, x, y, 9, 9, "#141210"); E(g, x, y, 6, 6, "#0a0908"); }); grime(g, w, h, 800, .4); });
  T.gate = tex((g, w, h) => stoneWall(g, w, h));
  T.towerDoor = tex((g, w, h) => { stoneWall(g, w, h); R(g, 16, 0, 96, 128, "#140a04"); R(g, 22, 4, 84, 124, "#3a2412"); for (let x = 22; x < 106; x += 12) R(g, x, 4, 1.2, 124, "#24160a"); [24, 64, 104].forEach(y => R(g, 22, y, 84, 5, "#2a2a2a")); E(g, 92, 70, 3.5, 3.5, "#8a7040"); plaque(g, 64, 14, "THÁP CANH"); grime(g, w, h, 600, .35); });
  T.curtain = tex((g, w, h) => { stoneWall(g, w, h); for (let x = 14; x < 114; x += 6) { const gr = g.createLinearGradient(x, 0, x + 6, 0); gr.addColorStop(0, "#2a0404"); gr.addColorStop(.5, "#5a0a0a"); gr.addColorStop(1, "#2a0404"); g.fillStyle = gr; g.fillRect(x, 4, 6, 124); } R(g, 10, 2, 108, 6, "#8a6a2a"); grime(g, w, h, 600, .3); });
  T.portraitC = tex((g, w, h) => { stoneWall(g, w, h); R(g, 22, 10, 84, 100, "#7a5a20"); R(g, 28, 16, 72, 88, "#120808"); g.fillStyle = "#1a0a10"; g.beginPath(); g.moveTo(36, 104); g.quadraticCurveTo(64, 50, 92, 104); g.fill(); E(g, 64, 50, 13, 17, "#d8cfc4"); E(g, 64, 36, 16, 10, "#0a0606"); E(g, 59, 49, 2.5, 2, "#a00"); E(g, 69, 49, 2.5, 2, "#a00"); R(g, 60, 60, 8, 2, "#5a0010"); g.fillStyle = "#3a0a0a"; g.beginPath(); g.moveTo(44, 66); g.lineTo(64, 74); g.lineTo(84, 66); g.lineTo(84, 74); g.lineTo(44, 74); g.fill(); grime(g, w, h, 600, .3); });
  T.gown = tex((g, w, h) => { R(g, 0, 0, w, h, "#0c0608"); for (let x = 0; x < w; x += 8) R(g, x, 0, 3, h, "rgba(60,10,20,.5)"); R(g, 0, 0, w, 6, "#5a0a10"); R(g, 0, h - 8, w, 8, "#5a0a10"); grime(g, w, h, 800, .3); });
  T.countessFace = tex((g, w, h) => { R(g, 0, 0, w, h, "#0a0606"); E(g, 64, 64, 28, 44, "#d6cec6"); E(g, 55, 58, 5, 4, "#200"); E(g, 73, 58, 5, 4, "#200"); R(g, 56, 84, 16, 3, "#4a0010"); R(g, 58, 87, 2, 5, "#eee"); R(g, 68, 87, 2, 5, "#eee"); drip(g, 59, 90, 10, "#600"); }, g => { E(g, 55, 58, 2.4, 2, "#ff1010"); E(g, 73, 58, 2.4, 2, "#ff1010"); });
  T.gold = tex((g, w, h) => { R(g, 0, 0, w, h, "#7a5a1e"); for (let y = 0; y < h; y += 3) R(g, 0, y, w, 1, "rgba(255,220,120,.12)"); grime(g, w, h, 500, .3); });
  T.glassR = tex((g, w, h) => R(g, 0, 0, w, h, "#600"), g => R(g, 0, 0, 128, 128, "#ff2a20")); T.glassB = tex((g, w, h) => R(g, 0, 0, w, h, "#036"), g => R(g, 0, 0, 128, 128, "#3060ff")); T.glassG = tex((g, w, h) => R(g, 0, 0, w, h, "#030"), g => R(g, 0, 0, 128, 128, "#20e040"));
  T.glassOff = tex((g, w, h) => R(g, 0, 0, w, h, "#2a2622"));
  T.bone = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8bea6"); grime(g, w, h, 900, .35); });
  T.skull = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8bea6"); E(g, 54, 58, 9, 10, "#120c08"); E(g, 74, 58, 9, 10, "#120c08"); g.fillStyle = "#120c08"; g.beginPath(); g.moveTo(64, 70); g.lineTo(60, 80); g.lineTo(68, 80); g.fill(); for (let x = 52; x < 78; x += 4) R(g, x, 88, 3, 6, "#eee"); grime(g, w, h, 600, .35); });
}
function torchAt(f, x, y) {
  f.grid[y][x] = "i";
  for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (f.grid[y + dy]?.[x + dx] === ".") { f.lights.push({ x: x + .5 + dx * .78, y: y + .5 + dy * .78, h: 1.05, i: .9, r: 1, g: .55, b: .22, f: .5 }); break; }
}
function buildCastle() {
  const a = makeFloor("c1", "Đại Sảnh", 54, 31, T.stoneCeil, [T.stoneW, T.stoneWB], T.flag, .035);
  room(a, 2, 2, 11, 10, [T.stoneW, T.stoneWB], T.woodDk, 2.4, T.ceilWood); room(a, 13, 2, 18, 10, T.stoneW, T.flag, 2.2); room(a, 20, 2, 26, 10, [T.stoneW, T.stoneWB], T.carpet, 3.4, T.ceilVault);
  room(a, 28, 2, 37, 10, T.stoneW, T.flag, 2.4); room(a, 2, 12, 37, 13, [T.stoneW, T.stoneWB], T.carpet, 2.3, T.ceilVault); room(a, 2, 15, 11, 29, T.stoneW, T.flag, 3.8, T.ceilVault);
  room(a, 13, 15, 26, 29, [T.stoneW, T.stoneWB], T.flag, 4.6, T.ceilVault); room(a, 28, 15, 37, 29, T.stoneW, T.woodDk, 2.8, T.ceilWood);
  put(a, [[15, 17], [15, 21], [15, 25], [24, 17], [24, 21], [24, 25]], "I"); a.decor = castleDecor; a.colMat = T.stoneW;
  a.labels = [["Thư viện", 6.5, 6], ["Cầu thang tháp", 15.5, 6], ["Ngai vàng", 23, 6], ["Kho vũ khí", 32.5, 6], ["Hành lang", 19.5, 12.6], ["Nhà nguyện", 6.5, 22], ["Đại sảnh", 19.5, 22], ["Phòng ăn", 32.5, 22]];
  room(a, 41, 16, 52, 28, [T.stoneW, T.stoneWB], T.flag, 2.8, T.ceilVault); for (const x of [38, 39, 40]) { a.grid[22][x] = "."; a.room[22 * a.w + x] = { wall: T.stoneW, floor: T.flag, h: 1.9 }; }
  put(a, [[46, 22]], "I");
  [[43, 18.6], [50, 18.6]].forEach(([x, y]) => a.sprites.push({ x, y, k: "coffin", rot: 0, solid: .5 }));
  [[44, 24.5], [49, 24.5], [46.5, 26.6]].forEach(([x, y]) => a.sprites.push({ x, y, k: "chains", hang: 1 }));
  [[42.5, 27.2], [51, 27.2]].forEach(([x, y]) => a.sprites.push({ x, y, k: "bones" }));
  a.sprites.push({ x: 46.5, y: 16.7, k: "armor", rot: Math.PI / 2, solid: .4 }); a.lights.push({ x: 46.5, y: 20, h: 1.6, i: .5, r: 1, g: .42, b: .18, f: .5 });
  a.labels.push(["Phòng tra tấn", 46.5, 22.6]);
  open(a, [[7, 11], [23, 11], [32, 11], [7, 14], [19, 14], [20, 14], [32, 14]]);
  put(a, [[16, 11]], "L"); put(a, [[15, 1], [16, 1]], "j"); put(a, [[23, 1]], "s"); put(a, [[21, 1], [25, 1]], "g"); put(a, [[19, 30]], "k"); put(a, [[21, 30]], "P");
  for (let x = 3; x <= 10; x++) put(a, [[x, 1]], "B");
  put(a, [[38, 4], [38, 7]], "h"); put(a, [[1, 18], [1, 20], [1, 22], [1, 24], [6, 30], [4, 30], [8, 30]], "v"); [[2.5, 21], [2.5, 25]].forEach(([x, y]) => a.lights.push({ x, y, h: 2, i: .35, r: .55, g: .45, b: .9, f: .3 })); put(a, [[1, 27], [38, 26], [16, 30], [23, 30]], "W");
  [[1, 4], [1, 12], [38, 13], [14, 30], [25, 30], [1, 17], [38, 17], [29, 1], [36, 1], [38, 22], [13, 1], [18, 1]].forEach(([x, y]) => torchAt(a, x, y));
  const K = (f, x, y, k, o = {}) => f.sprites.push({ x, y, k, ...o });
  K(a, 6, 6, "lorebook", { act: "lore", reach: 1.9, wide: .5, solid: .6 }); K(a, 23, 4, "throne", { rot: Math.PI / 2, solid: .6 });
  K(a, 19.5, 18.5, "chandelier", { hang: 1 }); K(a, 19.5, 24.5, "chandelier", { hang: 1 }); a.lights.push({ x: 19.5, y: 18.5, h: 1.1, i: .9, r: 1, g: .6, b: .3, f: .35 }, { x: 19.5, y: 24.5, h: 1.1, i: .9, r: 1, g: .6, b: .3, f: .35 });
  K(a, 33, 8, "chest", { act: "chest", rot: -Math.PI / 2, reach: 1.8, wide: .5, solid: .5 }); [[30, 3.5], [35.5, 3.5], [30, 8], [16, 22], [23, 22]].forEach(([x, y]) => K(a, x, y, "armor", { rot: Math.PI / 2, solid: .35 }));
  ["R", "B", "G"].forEach((c, i) => K(a, 4 + i * 2.5, 21.5, "cand", { act: "cand", idx: i, col: c, reach: 1.8, solid: .3 }));
  K(a, 6.5, 16.6, "altarC", { rot: Math.PI / 2, solid: .7 }); [[4, 25], [9, 25], [4, 27.5], [9, 27.5]].forEach(([x, y]) => K(a, x, y, "pew", { rot: -Math.PI / 2, solid: .6 }));
  a.sprites.push({ x: 31, y: 18.5, mesh: "table", solid: .95 }, { x: 31, y: 25, mesh: "table", solid: .95 }); K(a, 31.4, 18.6, "cloche", { base: .76, act: "plate", reach: 1.9 });
  [[29.6, 18.5, 0], [32.4, 18.5, Math.PI], [29.6, 25, 0], [32.4, 25, Math.PI]].forEach(([x, y, r]) => a.sprites.push({ x, y, t: T.chair, rot: r, solid: .3 }));
  [[15, 27], [24, 17], [10, 3], [36, 27]].forEach(([x, y]) => K(a, x, y, "bones"));
  const b = makeFloor("c2", "Tháp Canh", 12, 12, T.ceilBeam, T.stoneW, T.flag, .04);
  room(b, 2, 2, 9, 9, [T.stoneW, T.stoneWB], T.flag, 3.2, T.ceilWood); b.labels = [["Đỉnh tháp", 6, 4]]; put(b, [[5, 1], [6, 1]], "r"); put(b, [[10, 5], [1, 6]], "v"); torchAt(b, 10, 8); torchAt(b, 1, 3);
  K(b, 6, 6, "bell", { act: "bell", reach: 2, wide: .5, solid: .7 }); K(b, 3, 8.5, "bones"); K(b, 8.5, 3, "bones");
  const c = makeFloor("c3", "Hầm Mộ", 26, 18, T.stoneCeil, [T.stoneW, T.stoneWB], T.flag, .025);
  room(c, 2, 2, 23, 15, [T.stoneW, T.stoneWB], T.flag, 2.2, T.ceilVault); put(c, [[6, 6], [6, 11], [19, 6], [19, 11]], "I"); c.decor = castleDecor; c.colMat = T.stoneW; c.labels = [["Hầm mộ", 12.5, 8]]; put(c, [[12, 1], [13, 1]], "x");
  torchAt(c, 1, 8); torchAt(c, 24, 8);
  [[4, 4.5], [4, 8.5], [4, 13], [21.5, 4.5], [21.5, 8.5], [21.5, 13]].forEach(([x, y]) => K(c, x, y, "coffin", { rot: 0, solid: .5 }));
  K(c, 12.5, 12.6, "coffinBig", { act: "coffin", rot: -Math.PI / 2, reach: 2.2, wide: .6, solid: .8 }); for (let i = 0; i < 5; i++) candle(c, 10.5 + i, 14.6);
  [[9, 5], [16, 5], [9, 10], [16, 10]].forEach(([x, y]) => K(c, x, y, "chains", { hang: 1 })); K(c, 12, 4, "bones"); K(c, 17, 13, "bones");
  [[a, [[8, 8], [33, 4], [5, 28], [36, 20], [24, 27]]], [b, [[8, 8]]], [c, [[3, 3], [22, 15]]]].forEach(([f, l]) => l.slice(0, Math.max(2, D.bat - 3)).forEach(([x, y]) => f.sprites.push({ x, y, t: T.battery, sh: .18, kind: "battery" })));
  castleLayout(a);
  for (const f of [a, b, c]) { f.floorT = []; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const rm = f.room[y * f.w + x], fl = rm ? rm.floor : f.defFloor; f.floorT[y * f.w + x] = Array.isArray(fl) ? fl[0] : fl; } }
}
const LORE_C = () => `<b>Biên niên sử dòng họ Lê Văn</b><br>Năm 1847, Nữ Bá Tước Lê Thị Huyền bị phát hiện uống máu gia nhân. Bà bị đóng cọc bạc và chôn dưới hầm mộ, sau cánh cửa đá mang <b>gia huy ba mảnh</b>.<br><br>
Mảnh thứ nhất treo trên khiên ở <b>kho vũ khí</b>. Mảnh thứ hai giấu trong bệ thờ <b>nhà nguyện</b> — chỉ lộ ra khi thắp nến theo thứ tự: <b>${S.order.map(c => ({ R: "ĐỎ", B: "LAM", G: "LỤC" })[c]).join(" → ")}</b>. Mảnh thứ ba nằm trong quả chuông trên <b>tháp canh</b>.<br><br>
Bà không có mắt, nhưng nghe được cả tiếng tim đập. <i>Đừng chạy trong lâu đài.</i>`;

function updateCountess(dt) {
  minGhostD = 99; CHASING = 0;
  for (const g of ghosts) {
    if (followFloor(g)) continue;
    const d = Math.hypot(g.x - player.x, g.y - player.y); minGhostD = Math.min(minGhostD, d);
    if (!player.hidden && lit(g) && d < 8) { g.hx = player.x; g.hy = player.y; g.hunt = t + 6; }
    if (!player.hidden && d < 2.2) { g.hx = player.x; g.hy = player.y; g.hunt = t + 4; }
    if (g.hunt > t) { CHASING = 1; moveToward(g, g.hx, g.hy, D.chase * .95 * g.mul, dt); if (Math.hypot(g.hx - g.x, g.hy - g.y) < .4) g.hunt = Math.min(g.hunt, t + 2.5); }
    else { if (Math.hypot(g.tx - g.x, g.ty - g.y) < .4) { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } moveToward(g, g.tx, g.ty, D.wander * .8, dt); }
    if (d < .55) touchPlayer(g, ["Móng tay sắc lẹm cào qua cổ bạn... Thêm một lần nữa thôi.", "Bà ta rít lên ngay bên tai bạn! Đi thật khẽ, trốn sau rèm cửa."], "Nữ Bá Tước cúi xuống cổ bạn... Lâu đài lại có thêm một gia nhân vĩnh viễn.");
  }
  heartRate = Math.max(320, Math.min(1400, 250 + minGhostD * 150));
}
const CASTLE = {
  NAMES: { L: "Cửa tháp canh", j: "Cầu thang lên tháp", r: "Cầu thang xuống đại sảnh", y: "Cầu thang xuống hầm mộ", x: "Cầu thang lên đại sảnh", s: "Cửa đá gia huy", k: "Cổng thành", B: "Kệ sách",
    h: "Tấm khiên", g: "Lá cờ dòng họ", v: "Cửa sổ kính màu", P: "Chân dung Nữ Bá Tước", W: "Rèm nhung (trốn)", i: "Ngọn đuốc" },
  ACTIONS: {
    j: () => travel("c2", 6, 2.6, Math.PI / 2), r: () => travel("c1", ...FLOORS.c1.remap(16, 2.6), Math.PI / 2), y: () => travel("c3", 13, 2.6, Math.PI / 2), x: () => travel("c1", ...FLOORS.c1.remap(23.5, 2.6), Math.PI / 2),
    L(c) { if (!has("bronzekey")) return say("Cửa lên tháp canh khóa bằng ổ khóa đồng."); F.grid[c.y][c.x] = "."; removeItem("bronzekey"); S.towerOpen = 1; refreshWalls(); noise(.5, 400, .4); say("Cánh cửa đồng rít lên khi mở. Gió lạnh thổi xuống từ đỉnh tháp."); },
    B() { if (S.gotBronze) return say("Những cuốn sách da người... bạn không muốn biết chúng viết gì."); S.gotBronze = 1; addItem("bronzekey", "Chìa khóa đồng"); progress(); say("Sau dãy sách mục, bạn tìm thấy một chiếc chìa khóa đồng. Thẻ treo khắc: THÁP."); },
    h() { if (S.p1) return say("Chỉ còn lại tấm khiên trống trơn."); S.p1 = 1; S.crest++; addCrest(); progress(); makeNoise(player.x, player.y, 10); noise(.4, 900, .4); say("Bạn gỡ mảnh gia huy khỏi tấm khiên. Tiếng kim loại vang khắp hành lang..."); },
    s(c) { if (S.crest < 3) return say(`Cửa đá có 3 hốc tròn, đôi mắt đá đỏ ngầu nhìn bạn. (Đã có ${S.crest}/3 mảnh gia huy)`); F.grid[c.y][c.x] = "y"; S.sealOpen = 1; removeItem("crest"); refreshWalls(); noise(1.5, 120, .8, .5); flicker(1.5); say("Ba mảnh gia huy khớp vào cửa đá. Cánh cửa trượt xuống, để lộ cầu thang dẫn vào hầm mộ..."); },
    k() { if (S.gateOpen) return winCastle(); say("Song sắt cổng thành hạ xuống chặn lối. Xích kéo cổng nằm sâu dưới lòng đất..."); },
    g() { say("Lá cờ đỏ thêu gia huy dòng họ Lê Văn: một giọt máu giữa hình thoi vàng."); }, v() { say("Ánh trăng xuyên qua kính màu vẽ một khuôn mặt phụ nữ... đôi mắt kính màu như đang chuyển động."); },
    P() { flicker(); say("Chân dung Nữ Bá Tước Lê Thị Huyền, 1847. Bạn chắc chắn lúc nãy bà ta không mỉm cười."); }, W() { hide(); }, i() { say("Ngọn đuốc cháy lép bép, nhưng nó không hề tỏa hơi ấm."); },
  },
  SPRITE_ACTS: {
    lore() { if (!S.lore) { S.lore = 1; progress(); } showNote(LORE_C()); addItemOnce("lore", "Biên niên sử", () => showNote(LORE_C())); },
    plate() { if (S.gotChestKey) return say("Chiếc đĩa bạc trống không, chỉ còn vũng máu khô."); S.gotChestKey = 1; jumpScare(() => { addItem("chestkey", "Chìa khóa rương"); progress(); say("Dưới nắp chuông bạc là... một cái đầu người! Ngậm trong miệng nó là chiếc chìa khóa rương nhỏ."); }); },
    chest() { if (S.gotStake) return say("Chiếc rương đã trống."); if (!has("chestkey")) return say("Chiếc rương sắt khóa chặt. Cần chìa khóa."); S.gotStake = 1; removeItem("chestkey"); addItem("stake", "Cọc bạc"); progress(); say("Trong rương, giữa lớp nhung đỏ, là một chiếc cọc bạc khắc kinh văn."); },
    cand(s) {
      if (S.p2) return say("Ba ngọn nến cháy đều, ánh sáng màu nhuộm cả nhà nguyện.");
      if (S.lit.includes(s.col)) return say("Ngọn nến này đã cháy.");
      S.lit.push(s.col); buildFloorMesh(F); noise(.2, 2000, .2);
      if (S.lit.join("") !== S.order.slice(0, S.lit.length).join("")) { S.lit = []; setTimeout(() => buildFloorMesh(F), 400); makeNoise(player.x, player.y, 30); return jumpScare(() => say("Cả ba ngọn nến phụt tắt cùng lúc! Một tiếng thét vang lên... Sai thứ tự rồi. Nó đã nghe thấy bạn.")); }
      if (S.lit.length === 3) { S.p2 = 1; S.crest++; addCrest(); progress(); return say("Ba ngọn nến bùng sáng rực. Bệ thờ trượt mở — bên trong là mảnh gia huy thứ hai!"); }
      say("Ngọn nến bùng lên một màu kỳ lạ...");
    },
    bell() { if (S.p3) return say("Quả chuông im lặng... nhưng bạn vẫn nghe thấy dư âm của nó."); S.p3 = 1; S.crest++; addCrest(); progress(); for (let i = 0; i < 4; i++) { tone(110, i * 1.6, 3, .2, "sine"); tone(110 * 2.76, i * 1.6, 2, .06, "sine"); }
      for (const g of ghosts) { g.arrive = t + 5; if (g.floor === F.id) { g.hx = player.x; g.hy = player.y; g.hunt = t + 12; } } if (!S.woke) wakeGhosts();
      say("Bạn gỡ mảnh gia huy treo trong lòng chuông — quả chuông đổ hồi vang dội khắp lâu đài! NÓ ĐANG ĐẾN. Trốn ngay!"); },
    coffin() {
      if (S.dead) return say("Thân xác Nữ Bá Tước đã hóa tro.");
      if (!has("stake")) return say("Quan tài khảm vàng, nặng trịch. Bên trong có tiếng thở... và tiếng móng tay cào. Bạn cần thứ gì đó để kết liễu bà ta.");
      S.dead = 1; S.gateOpen = 1; removeItem("stake"); ghosts.length = 0; refreshWalls(); screech(); flicker(2);
      say("Bạn đẩy nắp quan tài và đóng cọc bạc xuống! Một tiếng thét xé toạc màn đêm... Xa trên kia, tiếng xích sắt kéo cổng thành vang lên.");
    },
  },
  SPRITE_NAMES: { lore: "Biên niên sử", plate: "Nắp chuông bạc", chest: "Rương sắt", cand: "Chân nến kính màu", bell: "Chuông đồng", coffin: "Quan tài Nữ Bá Tước" },
  GOALS: [
    [() => S.lore, "Đọc cuốn biên niên sử trên bàn trong thư viện (phía tây bắc).", "Tìm hiểu lịch sử lâu đài."],
    [() => S.crest >= 3 || S.sealOpen, () => `Thu thập 3 mảnh gia huy (${S.crest}/3): khiên ở kho vũ khí · nến nhà nguyện theo thứ tự ${S.order.map(c => ({ R: "Đỏ", B: "Lam", G: "Lục" })[c]).join("→")} · chuông trên tháp (chìa khóa đồng ở thư viện).`, () => `Thu thập 3 mảnh gia huy (${S.crest}/3).`],
    [() => has("stake") || S.dead, "Tìm chìa khóa rương dưới nắp chuông bạc ở phòng ăn, rồi mở rương ở kho vũ khí.", "Tìm vũ khí để kết liễu Nữ Bá Tước."],
    [() => S.sealOpen, "Đặt 3 mảnh gia huy vào cửa đá ở phòng ngai vàng.", "Mở cửa đá gia huy."],
    [() => S.dead, "Xuống hầm mộ, đóng cọc bạc vào quan tài lớn.", "Kết liễu Nữ Bá Tước."],
    [() => false, "Ra cổng thành ở cuối đại sảnh.", "Thoát khỏi lâu đài."],
  ],
  hard: "Mục tiêu: Kết liễu Nữ Bá Tước và thoát ra. Đừng chạy.",
  intro: "Cánh cổng lâu đài sập xuống sau lưng bạn. Trong bóng tối, có tiếng váy lụa sột soạt trên sàn đá... Đừng chạy. Bà ta nghe được mọi thứ.",
  whispers: ["...ta nghe thấy ngươi...", "...máu... ấm quá...", "...lại gần đây...", "...gia nhân của ta...", "...đừng thở mạnh thế..."],
};
function addCrest() { removeItem("crest"); addItem("crest", `Mảnh gia huy ×${S.crest}`); }
function addItemOnce(k, n, r) { if (!has(k)) addItem(k, n, r); }
function winCastle() { endWin("THOÁT KHỎI LÂU ĐÀI", "Bạn bước qua cổng thành. Phía sau, ngọn đuốc cuối cùng trong lâu đài phụt tắt.<br><br><i>Trên cổ bạn... có hai vết châm nhỏ mà bạn không nhớ đã có từ lúc nào.</i>"); }
