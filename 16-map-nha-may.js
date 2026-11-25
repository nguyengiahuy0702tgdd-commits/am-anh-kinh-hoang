// =====================================================================
//  15. MAP "NHÀ MÁY XÍ NGHIỆP"
//  Nhiệm vụ: vào phòng quản đốc (mã = năm thành lập), lấy thẻ từ, chỉnh van áp suất, đổ xăng máy phát, gọi thang máy hàng.
//  Kẻ thù: GÃ ĐỒ TỂ — đi tuần, nhìn thấy là lao tới; tiếng máy móc kéo hắn lại. Trốn vào tủ đồ.
// =====================================================================
function buildFactoryTextures() {
  T.indTile = tex((g, w, h) => { tiles(g, w, h, "#4a5a4c", "#232a24", 16); grime(g, w, h, 1800, .4); R(g, 0, 64, w, 4, "#2a1a10"); stain(g, 40, 100, 24, "rgba(70,0,0,.6)"); });
  T.locker = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a4038"); for (const x of [14, 64]) { R(g, x, 4, 50, 124, "#4a5a5e"); R(g, x, 4, 50, 1.5, "#6a7a7e"); for (let y = 14; y < 40; y += 5) R(g, x + 10, y, 30, 2, "#1a2224"); R(g, x + 40, 64, 4, 12, "#888"); R(g, x + 1, 4, 1, 124, "#22282a"); } grime(g, w, h, 1200, .4); stain(g, 40, 90, 14, "rgba(60,0,0,.6)"); });
  T.offDoor = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a36"); R(g, 12, 0, 104, 128, "#1a1a18"); R(g, 18, 4, 92, 124, "#5a5e58"); R(g, 30, 16, 50, 34, "#20282a"); plaque(g, 54, 10, "QUẢN ĐỐC"); R(g, 84, 58, 22, 32, "#1a1a1a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R(g, 87 + c * 6, 70 + r * 6, 4, 4, "#3a3a3a"); grime(g, w, h, 900, .35); }, g => R(g, 86, 60, 15, 7, "rgba(255,60,40,.6)"));
  T.cardDoor = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a36"); R(g, 16, 0, 96, 128, "#1a1a18"); R(g, 22, 4, 84, 124, "#6a5a1a"); for (let y = 8; y < 128; y += 16) { g.fillStyle = "#1a1a10"; g.beginPath(); g.moveTo(22, y); g.lineTo(34, y); g.lineTo(22, y + 12); g.fill(); } plaque(g, 64, 22, "MÁY PHÁT ĐIỆN"); R(g, 92, 60, 10, 16, "#222"); grime(g, w, h, 900, .35); }, g => R(g, 94, 62, 6, 4, "rgba(255,40,40,.8)"));
  T.board = tex((g, w, h) => { R(g, 0, 0, w, h, "#6a4a2a"); for (let i = 0; i < 6; i++) { R(g, 8 + (i % 3) * 38, 10 + Math.floor(i / 3) * 40, 32, 34, ["#ddd4bc", "#e8d890", "#c8d8e8"][i % 3]); for (let l = 0; l < 4; l++) R(g, 12 + (i % 3) * 38, 18 + Math.floor(i / 3) * 40 + l * 6, 24, 1.2, "#444"); E(g, 24 + (i % 3) * 38, 12 + Math.floor(i / 3) * 40, 1.5, 1.5, "#a00"); } g.fillStyle = "#300"; g.font = "bold 7px 'Times New Roman'"; g.textAlign = "center"; g.fillText("BẢNG TIN", 64, 98); grime(g, w, h, 600, .35); });
  T.plaqueF = tex((g, w, h) => { R(g, 0, 0, w, h, "#7a5a20"); R(g, 4, 4, 120, 120, "#5a4010"); g.fillStyle = "#e8c870"; g.textAlign = "center"; g.font = "bold 10px 'Times New Roman'"; g.fillText("NHÀ MÁY DỆT", 64, 34); g.fillText("HỒNG PHÁT", 64, 50); g.font = "bold 9px 'Times New Roman'"; g.fillText("THÀNH LẬP", 64, 76); g.font = "bold 18px 'Times New Roman'"; g.fillText(String(S.year), 64, 100); grime(g, w, h, 500, .35); });
  const gauge = ok => (g, w, h) => { concrete(g, w, h, 1); E(g, 64, 50, 34, 34, "#d8d4c8"); E(g, 64, 50, 31, 31, "#eeeae0"); g.strokeStyle = "#a00"; g.lineWidth = 3; g.beginPath(); g.arc(64, 50, 26, Math.PI * .1, Math.PI * .35); g.stroke(); g.strokeStyle = "#111"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(64, 50); const a = ok ? -1.57 : .6; g.lineTo(64 + Math.cos(a) * 24, 50 + Math.sin(a) * 24); g.stroke(); g.fillStyle = ok ? "#060" : "#900"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText(ok ? "ÁP SUẤT: ĐẠT" : "ÁP SUẤT: SAI", 64, 100); };
  T.gaugeOk = tex(gauge(1)); T.gaugeBad = tex(gauge(0));
  T.schem = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a3a5a"); R(g, 8, 8, 112, 112, "#d8dce8"); g.strokeStyle = "#1a2a6a"; g.lineWidth = 2; g.strokeRect(14, 30, 100, 40); g.fillStyle = "#1a2a6a"; g.font = "bold 8px Arial"; g.textAlign = "center"; g.fillText("SƠ ĐỒ VAN ÁP SUẤT", 64, 22);
    S.valveTarget.forEach((o, i) => { const x = 26 + i * 25; E(g, x, 50, 7, 7, o ? "#1a8a1a" : "#a01a1a"); g.fillStyle = "#111"; g.fillText("V" + (i + 1), x, 82); g.fillText(o ? "MỞ" : "ĐÓNG", x, 94); }); g.fillStyle = "#600"; g.fillText("Sai áp suất = NỔ", 64, 112); grime(g, w, h, 400, .3); });
  T.elevator = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a36"); R(g, 10, 0, 108, 128, "#1a1a18"); R(g, 16, 6, 46, 122, "#6a6e70"); R(g, 66, 6, 46, 122, "#6a6e70"); R(g, 62, 6, 4, 122, "#111"); for (let y = 20; y < 128; y += 24) { R(g, 16, y, 46, 2, "#4a4e50"); R(g, 66, y, 46, 2, "#4a4e50"); } plaque(g, 64, 3, "THANG HÀNG"); hand(g, 40, 70, .8); grime(g, w, h, 900, .4); });
  T.ceilInd = tex((g, w, h) => { concrete(g, w, h); R(g, 0, 20, w, 10, "#3a3a38"); R(g, 0, 20, w, 2, "#5a5a56"); R(g, 80, 0, 6, h, "#4a3a2a"); });
  T.machine = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a4a3e"); R(g, 6, 6, 116, 116, "#4a5a4c"); for (let y = 20; y < 110; y += 22) R(g, 12, y, 104, 3, "#2a3a2e"); R(g, 20, 30, 30, 20, "#1a1a1a"); E(g, 90, 44, 10, 10, "#222"); E(g, 90, 44, 7, 7, "#aaa"); R(g, 0, 110, w, 18, "#2a2a10"); for (let x = 0; x < w; x += 16) { g.fillStyle = "#c8a020"; g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 8, 110); g.lineTo(x + 16, 110); g.lineTo(x + 8, 128); g.fill(); } grime(g, w, h, 1500, .4); stain(g, 60, 70, 20, "rgba(70,0,0,.7)"); });
  T.belt = tex((g, w, h) => { R(g, 0, 0, w, h, "#141414"); for (let x = 0; x < w; x += 10) R(g, x, 0, 2, h, "#262626"); stain(g, 64, 64, 30, "rgba(70,0,0,.7)"); });
  T.meat = tex((g, w, h) => { R(g, 0, 0, w, h, "#6a1a14"); for (let i = 0; i < 20; i++) E(g, rnd() * w, rnd() * h, 4 + rnd() * 10, 2 + rnd() * 5, rnd() < .5 ? "#d8c0a8" : "#4a0a08"); grime(g, w, h, 600, .3); });
  T.apron = tex((g, w, h) => { R(g, 0, 0, w, h, "#8a8270"); stain(g, 64, 50, 40, "rgba(90,0,0,.9)"); stain(g, 40, 100, 26, "rgba(60,0,0,.9)"); for (let i = 0; i < 10; i++) drip(g, 30 + rnd() * 70, 60, 20 + rnd() * 50, "#4a0000"); grime(g, w, h, 1000, .3); });
  T.sack = tex((g, w, h) => { R(g, 0, 0, w, h, "#7a6a4a"); for (let y = 0; y < h; y += 3) R(g, 0, y, w, 1, "rgba(0,0,0,.15)"); for (let x = 0; x < w; x += 3) R(g, x, 0, 1, h, "rgba(0,0,0,.1)"); E(g, 54, 60, 6, 5, "#0a0604"); E(g, 74, 60, 6, 5, "#0a0604"); g.strokeStyle = "#2a1a0a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(50, 84); for (let i = 0; i < 9; i++) g.lineTo(52 + i * 3, 82 + (i % 2) * 5); g.stroke(); stain(g, 64, 90, 16, "rgba(80,0,0,.8)"); });
  T.shirt = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a44"); for (let y = 0; y < h; y += 6) R(g, 0, y, w, 1, "rgba(0,0,0,.2)"); grime(g, w, h, 900, .35); stain(g, 40, 40, 20, "rgba(70,0,0,.8)"); });
  T.hazard = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8a020"); for (let x = -128; x < 128; x += 24) { g.fillStyle = "#151515"; g.beginPath(); g.moveTo(x, 128); g.lineTo(x + 12, 128); g.lineTo(x + 140, 0); g.lineTo(x + 128, 0); g.fill(); } grime(g, w, h, 1200, .4); });
  T.genMat = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a6a2a"); R(g, 10, 10, 108, 60, "#3a4a1a"); for (let y = 16; y < 64; y += 6) R(g, 16, y, 96, 3, "#2a3a10"); R(g, 20, 80, 40, 30, "#222"); E(g, 90, 95, 12, 12, "#1a1a1a"); g.fillStyle = "#e8e0c0"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText("50 kVA", 40, 98); grime(g, w, h, 1500, .4); });
}
function buildFactory() {
  const a = makeFloor("x1", "Xưởng Dệt Hồng Phát", 56, 30, T.ceilInd, [T.concP, T.concB], T.concF, .03);
  room(a, 2, 2, 10, 9, T.indTile, T.kitF, 1.75); room(a, 12, 2, 19, 9, [T.blue, T.blueB], T.carpetB, 1.85); room(a, 21, 2, 28, 9, T.concP, T.concF, 2.4); room(a, 30, 2, 37, 9, T.concP, T.concF, 2.8);
  room(a, 2, 11, 37, 12, [T.concP, T.concB], T.concF, 1.7); room(a, 2, 14, 26, 28, [T.conc, T.concB], [T.concF, T.concFB], 5, T.ceilInd); room(a, 28, 14, 37, 21, T.conc, T.concF, 3.4); room(a, 28, 23, 37, 28, [T.conc, T.concB], [T.concF, T.concFB], 2.4);
  put(a, [[9, 19], [15, 19], [21, 19], [9, 24], [15, 24], [21, 24]], "I"); a.colStyle = "steel"; a.colMat = T.steelB; a.decor = factoryDecor;
  [[1, 16], [1, 18], [1, 23], [1, 25], [1, 27], [38, 16], [38, 19]].forEach(([x, y]) => windowAt(a, x, y)); [[9.5, 16.5], [21.5, 16.5], [9.5, 22.5], [21.5, 22.5]].forEach(([x, y]) => a.lights.push({ x, y, h: 4.5, i: .5, r: .45, g: .55, b: .8, f: .08 }));
  a.labels = [["Thay đồ", 6, 5.5], ["Quản đốc", 15.5, 5.5], ["Phòng bơm", 24.5, 5.5], ["Máy phát", 33.5, 5.5], ["Hành lang", 19.5, 11.6], ["Xưởng sản xuất", 14, 21.5], ["Kho", 32.5, 17.5], ["Thang hàng", 32.5, 25.5]];
  room(a, 41, 13, 54, 28, [T.conc, T.concB], [T.concF, T.concFB], 4.2, T.ceilInd); for (const x of [38, 39, 40]) { a.grid[18][x] = "."; a.room[18 * a.w + x] = { wall: T.conc, floor: T.concF, h: 2.2 }; }
  put(a, [[45, 17], [50, 17], [45, 24], [50, 24]], "I");
  for (let i = 0; i < 12; i++) a.sprites.push({ x: 42.6 + (i % 4) * 3.4, y: 14.6 + Math.floor(i / 4) * 5.6, mesh: "crate", solid: .5 });
  [[53, 27.2], [52.1, 27.2], [53, 26.3]].forEach(([x, y]) => a.sprites.push({ x, y, k: "barrel", solid: .35 }));
  [[47.5, 20], [47.5, 21.6]].forEach(([x, y]) => a.sprites.push({ x, y, k: "meat", hang: 1 }));
  [[55, 15], [55, 21], [55, 26]].forEach(([x, y]) => windowAt(a, x, y)); a.lights.push({ x: 47.5, y: 21, h: 3.6, i: .45, r: .5, g: .6, b: .85, f: .1 });
  a.labels.push(["Kho hàng", 47.5, 19]);
  open(a, [[6, 10], [24, 10], [8, 13], [18, 13], [32, 13], [32, 22]]);
  put(a, [[15, 10]], "X"); put(a, [[33, 10]], "L"); put(a, [[38, 25], [38, 26]], "q");
  put(a, [[3, 1], [4, 1], [5, 1], [7, 1], [8, 1], [1, 4], [1, 7]], "W"); put(a, [[6, 1]], "7"); put(a, [[1, 20]], "8"); put(a, [[16, 1]], "D"); put(a, [[18, 1]], "P"); put(a, [[21, 1]], "9");
  const K = (x, y, k, o = {}) => a.sprites.push({ x, y, k, ...o });
  [22.6, 24.4, 26.2, 28].forEach((x, i) => K(x, 2.35, "valve", { act: "valve", idx: i, rot: Math.PI / 2, reach: 1.6 }));
  K(33.5, 5.5, "generator", { act: "gen", rot: Math.PI / 2, reach: 2.3, wide: .7, solid: 1.1 });
  K(35.5, 19.5, "fuelcan", { act: "fuel", reach: 1.6 }); [[29.5, 15.5], [33, 15.5], [36.5, 15.5]].forEach(([x, y]) => K(x, y, "rack", { rot: Math.PI / 2, solid: .5 }));
  a.sprites.push({ x: 30, y: 19.5, mesh: "crate", solid: .5 }, { x: 34, y: 26.5, mesh: "crate", solid: .5 });
  for (const y of [17, 21.5, 26]) for (const x of [6, 12, 18]) K(x, y, "loom", { rot: 0, solid: .9 });
  K(23.5, 20, "conveyor", { rot: 0, solid: .6 }); [[9, 15.5], [15, 15.5], [21, 15.5], [9, 24], [15, 24], [21, 24.2]].forEach(([x, y]) => K(x, y, "meat", { hang: 1 }));
  [[4, 27], [24.5, 27], [36, 27.5]].forEach(([x, y]) => K(x, y, "barrel", { solid: .35 }));
  [[6, 6], [15.5, 6], [24.5, 6], [33.5, 7.5], [10, 11.5], [28, 11.5], [9, 20], [18, 20], [9, 26], [33, 17], [33, 26]].forEach(([x, y]) => {
    lamp(a, x, y); a.lights.push({ x, y, h: 1.1, i: .55, r: 1, g: .05, b: .03, f: .6, cond: () => !S.power });
  });
  [[9, 6], [29, 11.5], [4, 15], [25, 18], [36, 15], [30, 27]].slice(0, Math.max(3, D.bat - 2)).forEach(([x, y]) => a.sprites.push({ x, y, t: T.battery, sh: .18, kind: "battery" }));
  factoryLayout(a);
  a.floorT = []; for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) { const k = y * a.w + x, rm = a.room[k], fl = rm ? rm.floor : a.defFloor; a.floorT[k] = Array.isArray(fl) ? (((x * 31 + y * 17) % 11 === 0) ? fl[1] : fl[0]) : fl; }
}

function updateButcher(dt) {
  minGhostD = 99; CHASING = 0;
  for (const g of ghosts) {
    const dx = player.x - g.x, dy = player.y - g.y, d = Math.hypot(dx, dy); minGhostD = Math.min(minGhostD, d);
    const sees = !player.hidden && d < (flashOn() ? 13 : 8) && Math.abs(angTo(g.face, Math.atan2(dy, dx))) < .75 && lineClear(g.x, g.y, player.x, player.y);
    if (sees || (d < 1.6 && !player.hidden)) { if (g.state !== "chase") { noise(.7, 140, .8, .5); say("Gã Đồ Tể đã thấy bạn! CHẠY!"); } g.state = "chase"; g.lx = player.x; g.ly = player.y; g.lost = 0; }
    else if (g.hunt > t && g.state !== "chase") { g.state = "search"; g.lx = g.hx; g.ly = g.hy; g.hunt = 0; g.lost = 0; }
    if (g.state === "chase") { CHASING = 1; if (!sees) { g.lost += dt; if (g.lost > 4) { g.state = "search"; g.lost = 0; } } moveWalk(g, g.lx, g.ly, D.chase * 1.12 * g.mul, dt); }
    else if (g.state === "search") { moveWalk(g, g.lx, g.ly, D.wander * 1.3, dt); g.lost += dt; if (g.lost > 7 || Math.hypot(g.lx - g.x, g.ly - g.y) < .4) { g.state = "patrol"; const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } }
    else { if (Math.hypot(g.tx - g.x, g.ty - g.y) < .4) { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } moveWalk(g, g.tx, g.ty, D.wander * .9, dt); }
    g.step = (g.step || 0) - dt; if (g.step <= 0 && d < 12) { g.step = g.state === "chase" ? .32 : .6; noise(.12, 90, Math.max(.05, .7 - d * .05), .7); }
    if (d < .6) touchPlayer(g, ["Lưỡi dao phay sượt qua vai bạn... Thêm một lần nữa thôi.", "Hắn túm được bạn rồi ném bạn vào tường! Trốn vào tủ đồ đi!"], "Gã Đồ Tể kéo bạn về phía dãy móc sắt... Dây chuyền lại bắt đầu chạy.");
  }
  heartRate = Math.max(320, Math.min(1400, 250 + minGhostD * 150));
}
const BOARD = () => `<b>Bảng tin xưởng</b><br>— Cấm vào khu lò mổ cũ sau 22h.<br>— Anh Tư (tổ cắt) nghỉ việc không phép từ 13/11. Ai thấy báo phòng quản đốc.<br>
— <b>Mật khẩu cửa phòng quản đốc vẫn là năm thành lập nhà máy</b> (xem biển đồng ở xưởng sản xuất). — Tổ trưởng<br>— Máy phát dự phòng: chỉnh van áp suất theo sơ đồ trong phòng quản đốc TRƯỚC khi khởi động!`;
const FACTORY = {
  NAMES: { X: "Cửa phòng quản đốc", L: "Cửa phòng máy phát", q: "Thang máy hàng", W: "Tủ đồ (trốn)", 7: "Bảng tin", 8: "Biển đồng", D: "Bàn quản đốc", P: "Sơ đồ van", 9: "Đồng hồ áp suất" },
  ACTIONS: {
    X() { if (S.officeOpen) return; openLock("PHÒNG QUẢN ĐỐC", 4, String(S.year), () => { S.officeOpen = 1; { const [qx, qy] = FLOORS.x1.remap(15.5, 10.5).map(Math.floor); F.grid[qy][qx] = "."; } refreshWalls(); progress(); say("Cạch. Cửa phòng quản đốc mở. Mùi thuốc lá cũ... và mùi máu."); }); },
    L(c) { if (!has("keycard")) return say("Cửa phòng máy phát dùng khóa thẻ từ. Đèn đỏ nhấp nháy."); F.grid[c.y][c.x] = "."; S.genOpen = 1; removeItem("keycard"); refreshWalls(); noise(.3, 1800, .3); say("Bíp! Đèn xanh. Cửa phòng máy phát trượt mở."); },
    q() { if (!S.power) return say("Thang máy hàng chết đứng. Bảng điều khiển tối om — cần khởi động máy phát."); winFactory(); },
    W() { hide(); }, 7() { if (!S.board) { S.board = 1; progress(); } showNote(BOARD()); addItemOnce("board", "Ghi chép bảng tin", () => showNote(BOARD())); },
    8() { say(`Biển đồng: "NHÀ MÁY DỆT HỒNG PHÁT — THÀNH LẬP ${S.year}". Có vết máu khô trên những con số.`); },
    D() { if (S.keycard) return say("Ngăn kéo trống. Trên bàn có tấm ảnh nhân viên — mặt một người bị khoanh đỏ."); S.keycard = 1; addItem("keycard", "Thẻ từ phòng máy"); progress(); say("Trong ngăn kéo bàn quản đốc: một chiếc thẻ từ ghi PHÒNG MÁY PHÁT."); },
    P() { S.schem = 1; say(`Sơ đồ van áp suất: ${S.valveTarget.map((o, i) => `V${i + 1} ${o ? "MỞ" : "ĐÓNG"}`).join(" · ")}.`); addItemOnce("schem", "Ghi nhớ sơ đồ van", () => say(`Sơ đồ: ${S.valveTarget.map((o, i) => `V${i + 1} ${o ? "MỞ" : "ĐÓNG"}`).join(" · ")}`)); },
    9() { say(valvesOK() ? "Kim đồng hồ nằm trong vạch xanh: ÁP SUẤT ĐẠT." : "Kim đồng hồ nằm ngoài vạch: ÁP SUẤT SAI. Kiểm tra lại các van."); },
  },
  SPRITE_ACTS: {
    valve(s) { S.valves[s.idx] = !S.valves[s.idx]; refreshWalls(); noise(.6, 4000, .3, .5); makeNoise(player.x, player.y, 14); say(`Van V${s.idx + 1}: ${S.valves[s.idx] ? "MỞ" : "ĐÓNG"}. Tiếng hơi rít vang khắp xưởng...` + (valvesOK() ? " Đồng hồ áp suất báo ĐẠT!" : "")); },
    fuel(s) { s.taken = true; buildFloorMesh(F); addItem("fuel", "Can dầu"); progress(); say("Can dầu diesel còn gần đầy."); },
    gen() {
      if (S.power) return say("Máy phát gầm rú, rung bần bật cả sàn nhà.");
      if (!has("fuel")) return say("Máy phát cạn dầu. Kho chứa có thể còn một can.");
      if (!valvesOK()) { makeNoise(player.x, player.y, 40); flicker(1.5); return jumpScare(() => say("BÙM! Van xả hơi nổ tung vì sai áp suất! Cả nhà máy nghe thấy... Chỉnh van theo sơ đồ trong phòng quản đốc.")); }
      S.power = 1; removeItem("fuel"); progress(); refreshWalls(); flicker(2); noise(2, 80, .9, .5); makeNoise(player.x, player.y, 60); if (!S.woke) wakeGhosts();
      say("Máy phát nổ máy, đèn huỳnh quang chớp sáng khắp xưởng! Tiếng động vang dội... Hắn đang tới. Chạy tới thang máy hàng!");
    },
  },
  SPRITE_NAMES: { valve: "Van áp suất", fuel: "Can dầu", gen: "Máy phát điện" },
  GOALS: [
    [() => S.board, "Đọc bảng tin trong phòng thay đồ (phía tây bắc).", "Tìm manh mối trong phòng thay đồ."],
    [() => S.officeOpen, "Mã cửa phòng quản đốc = năm thành lập trên biển đồng ở xưởng sản xuất.", "Vào phòng quản đốc."],
    [() => S.keycard, "Lấy thẻ từ trong bàn quản đốc, xem sơ đồ van trên tường.", "Tìm thẻ từ."],
    [() => valvesOK(), () => `Chỉnh 4 van ở phòng bơm theo sơ đồ: ${S.valveTarget.map((o, i) => `V${i + 1} ${o ? "MỞ" : "ĐÓNG"}`).join(" · ")}.`, "Chỉnh áp suất ở phòng bơm."],
    [() => has("fuel") || S.power, "Lấy can dầu trong kho chứa (phía đông).", "Tìm nhiên liệu."],
    [() => S.power, "Mở phòng máy phát bằng thẻ từ và khởi động máy phát.", "Khôi phục điện."],
    [() => false, "Chạy tới thang máy hàng ở sảnh phía đông nam!", "Thoát khỏi nhà máy."],
  ],
  hard: "Mục tiêu: Khôi phục điện và gọi thang máy hàng.",
  intro: "Ca đêm. Bạn quay lại nhà máy lấy đồ để quên thì cửa cuốn sập xuống. Mất điện. Ở cuối xưởng có tiếng dao phay chặt xuống thớt... đều đều.",
  whispers: ["...thịt tươi...", "...ca đêm chưa hết đâu...", "...lại đây...", "...anh Tư đây... cứu...", "...tách... tách..."],
};
const valvesOK = () => S.valves.every((v, i) => v === S.valveTarget[i]);
function winFactory() { endWin("THOÁT KHỎI NHÀ MÁY", "Cửa thang máy đóng sập ngay trước lưỡi dao phay. Thang máy rít lên, đưa bạn lên mặt đất.<br><br><i>Trên sàn thang máy có một thẻ nhân viên dính máu: \"Nguyễn Văn Tư — Tổ cắt\".</i>"); }
function endWin(title, html) {
  if (!exitReady()) return;
  S.paused = true; S.ending = true; document.exitPointerLock?.(); const s = Math.round((Date.now() - S.started) / 1000);
  setTimeout(() => { $("winTitle").textContent = title; bloodify($("winTitle")); $("winText").innerHTML = `Cấp độ: ${D.name}<br><br>` + html; playEnding(() => $("win").classList.remove("hidden")); }, 1200);
}

// ---- Mô hình 3D cho đồ vật của 3 map mới ----
function thing2(v, s) {
  const { c, s: sn } = facing(s.rot ?? -Math.PI / 2), X = XF(s.x, s.base || 0, s.y, c, sn), dw = T.darkwood;
  switch (s.k) {
    case "lorebook": pbox(v, X, -.5, .7, -.3, .5, .76, .3, dw); for (const [x, z] of [[-.45, -.25], [.42, -.25], [-.45, .22], [.42, .22]]) pbox(v, X, x, 0, z, x + .04, .7, z + .04, dw); pbox(v, X, -.15, .76, -.1, .15, .82, .12, { all: T.redcloth, t: T.paperSheet }); candle3d(v, X, .32, .76, .05); break;
    case "throne": pbox(v, X, -.4, 0, -.35, .4, .45, .35, T.redcloth); pbox(v, X, -.45, 0, -.4, .45, 1.6, -.3, { all: T.gold, f: T.redcloth }); pbox(v, X, -.5, 0, -.4, -.4, .75, .35, T.gold); pbox(v, X, .4, 0, -.4, .5, .75, .35, T.gold); psphere(v, X, 0, 1.68, -.35, .08, 5, T.gold); break;
    case "chandelier": { const CH = ceilAt(s.x, s.y), y0 = Math.min(CH - .55, 2.4); pbox(v, X, -.01, y0, -.01, .01, CH, .01, T.metal); pcyl(v, X, 0, 0, y0 - .03, y0, .45, .45, 12, T.metal, T.metal); for (let i = 0; i < 6; i++) { const a = i * 1.047; candle3d(v, X, Math.cos(a) * .42, y0, Math.sin(a) * .42, .1); } break; }
    case "chest": pbox(v, X, -.4, 0, -.25, .4, .45, .25, { all: T.darkwood, t: T.metal }); pbox(v, X, -.41, .1, -.26, .41, .16, .26, T.metal); pbox(v, X, -.05, .28, .25, .05, .38, .27, T.gold); break;
    case "armor": pbox(v, X, -.12, 0, -.08, -.03, .85, .08, T.metal); pbox(v, X, .03, 0, -.08, .12, .85, .08, T.metal); pbox(v, X, -.22, .85, -.13, .22, 1.45, .13, T.metal);
      for (const sx of [-1, 1]) pbox(v, X, sx * .28 - .06, .8, -.06, sx * .28 + .06, 1.45, .06, T.metal); psphere(v, X, 0, 1.6, 0, .14, 6, T.metal, 1.2); pbox(v, X, -.08, 1.57, .1, .08, 1.6, .14, T.dark); pbox(v, X, .33, 0, .1, .36, 1.9, .13, T.metal); break;
    case "cand": { const col = { R: T.glassR, B: T.glassB, G: T.glassG }[s.col], on = S.lit?.includes(s.col) || S.p2;
      pcyl(v, X, 0, 0, 0, .05, .22, .2, 10, T.gold, T.gold); pcyl(v, X, 0, 0, .05, 1.05, .03, .03, 8, T.gold); pbox(v, X, -.3, .95, -.02, .3, 1, .02, T.gold);
      for (const x of [-.28, 0, .28]) { pcyl(v, X, x, 0, 1, 1.18, .06, .07, 8, on ? col : T.glassOff, null); if (on) pcyl(v, X, x, 0, 1.05, 1.15, .02, 0, 6, T.flame); } break; }
    case "altarC": pbox(v, X, -.8, 0, -.35, .8, .95, .35, { all: T.stoneW, f: T.redcloth, t: T.redcloth }); pbox(v, X, -.05, .95, -.2, .05, 1.6, -.1, T.gold); pbox(v, X, -.25, 1.35, -.2, .25, 1.43, -.1, T.gold); break;
    case "pew": pbox(v, X, -.9, .4, -.2, .9, .46, .2, dw); pbox(v, X, -.9, .46, -.22, .9, .95, -.17, dw); for (const x of [-.88, .84]) pbox(v, X, x, 0, -.2, x + .04, .46, .2, dw); break;
    case "cloche": pcyl(v, X, 0, 0, 0, .02, .2, .2, 12, T.metal, T.metal); if (!S.gotChestKey) psphere(v, X, 0, 0, 0, .17, 7, T.metal, .9); else psphere(v, X, 0, .1, 0, .1, 6, T.zombieFace || T.skin); break;
    case "bones": for (let i = 0; i < 5; i++) { const a = i * 1.3; pbox(v, XF(s.x + Math.cos(a) * .2, 0, s.y + Math.sin(a) * .2, Math.cos(a * 2), Math.sin(a * 2)), -.18, 0, -.02, .18, .04, .02, T.bone); } psphere(v, X, .1, .07, .05, .08, 6, T.skull, .9); break;
    case "bell": pbox(v, X, -.7, 0, -.05, -.62, 2.2, .05, dw); pbox(v, X, .62, 0, -.05, .7, 2.2, .05, dw); pbox(v, X, -.75, 2.15, -.06, .75, 2.25, .06, dw); pcyl(v, X, 0, 0, 1.2, 2.1, .55, .22, 14, T.gold, T.gold); pcyl(v, X, 0, 0, 1.2, 1.24, .56, .56, 14, T.gold, T.dark); break;
    case "coffin": pbox(v, X, -.32, 0, -.95, .32, .42, .95, { all: T.darkwood, t: T.darkwood }); pbox(v, X, -.05, .42, -.6, .05, .44, .3, T.gold); pbox(v, X, -.2, .42, -.1, .2, .44, 0, T.gold); break;
    case "coffinBig": pbox(v, X, -.5, 0, -1.2, .5, .5, 1.2, { all: T.redcloth, t: S.dead ? T.dark : T.gold }); pbox(v, X, -.52, .5, -1.22, .52, .58, 1.22, S.dead ? T.dark : T.darkwood); if (S.dead) psphere(v, X, 0, .55, .9, .12, 6, T.skull, .8); break;
    case "chains": for (const x of [-.15, .15]) for (let i = 0; i < 8; i++) pbox(v, X, x - .012, ceilAt(s.x, s.y) - .1 - i * .09, -.012, x + .012, ceilAt(s.x, s.y) - .02 - i * .09, .012, T.metal); break;
    case "willow": pcyl(v, X, 0, 0, 0, 3.2, .38, .2, 9, T.bark); for (let i = 0; i < 18; i++) { const a = i * .35, r = 1.1 + (i % 3) * .35; pcyl(v, X, Math.cos(a) * r * .5, Math.sin(a) * r * .5, 3, 3.6, r, .4, 10, T.willow); pcyl(v, X, 0, 0, .4 + (i % 4) * .2, 3.2, r + .15, r * .7, 12, T.willow); if (i > 6) break; } break;
    case "grave": { const dug = S.dug?.[s.idx]; pbox(v, X, -.32, 0, -.1, .32, .85, .06, { all: T.stone, f: T.tomb }); psphere(v, X, 0, .85, -.02, .32, 6, T.stone, .3);
      if (!dug) pbox(v, X, -.35, 0, .1, .35, .14, 1.6, T.mound); else { pbox(v, X, -.35, 0, .1, .35, .02, 1.6, T.dark); pbox(v, X, .4, 0, .2, .85, .35, 1.4, T.mound); pbox(v, X, -.28, .01, .2, .28, .1, 1.5, T.darkwood); } break; }
    case "tomb": { const B = s.seed % 2 ? T.tombB : T.tomb; pbox(v, X, -.3, 0, -.08, .3, .7 + s.seed * .05, .06, { all: T.stone, f: B }); if (s.seed % 3 === 0) psphere(v, X, 0, .72 + s.seed * .05, -.01, .3, 6, T.stone, .3); pbox(v, X, -.33, 0, .08, .33, .1, 1.5, T.mound); break; }
    case "cross": pbox(v, X, -.05, 0, -.05, .05, 1.1, .05, T.stone); pbox(v, X, -.3, .72, -.05, .3, .82, .05, T.stone); pbox(v, X, -.3, 0, .08, .3, .08, 1.4, T.mound); break;
    case "angel": pbox(v, X, -.35, 0, -.35, .35, .6, .35, T.stone); pcyl(v, X, 0, 0, .6, 1.6, .28, .12, 10, T.stone); psphere(v, X, 0, 1.75, 0, .14, 6, T.stone); for (const sx of [-1, 1]) pbox(v, XF(s.x, 0, s.y, Math.cos(sx * .5 + (s.rot || 0)), Math.sin(sx * .5 + (s.rot || 0))), sx > 0 ? .05 : -.75, 1.0, -.25, sx > 0 ? .75 : -.05, 1.85, -.18, T.stone); break;
    case "slantern": pbox(v, X, -.1, 0, -.1, .1, .4, .1, T.stone); pbox(v, X, -.15, .4, -.15, .15, .44, .15, T.stone); pbox(v, X, -.07, .44, -.07, .07, .58, .07, T.bulbOn); for (const [x, z] of [[-.15, -.15], [.11, -.15], [-.15, .11], [.11, .11]]) pbox(v, X, x, .44, z, x + .04, .62, z + .04, T.stone); pcyl(v, X, 0, 0, .62, .82, .26, 0, 4, T.stoneRoof); break;
    case "shovel": pbox(v, X, -.015, .25, -.015, .015, 1.1, .015, T.wood); pbox(v, X, -.1, 0, -.02, .1, .28, .01, T.metal); break;
    case "mapboard": pbox(v, X, -.4, .8, -.03, .4, 1.25, .01, { all: T.darkwood, f: T.cloth }); break;
    case "altarStone": pbox(v, X, -.7, 0, -.35, .7, .85, .35, { all: T.mausW, f: T.shrineFront || T.redcloth }); candle3d(v, X, -.45, .85, .1); candle3d(v, X, .45, .85, .1); pbox(v, X, -.15, .85, -.25, .15, 1.25, -.2, { all: T.darkwood, f: T.portrait }); if (S.freed) pbox(v, X, -.1, .85, .05, .1, .87, .12, T.combMat); break;
    case "valve": { const on = S.valves?.[s.idx]; pcyl(v, X, 0, 0, 0, WH, .06, .06, 8, T.metal); pcylX(v, XF(s.x, 0, s.y, c, sn), .9, .1, -.18, .18, .07, 8, T.metal, T.metal);
      pcyl(v, XF(s.x, .9, s.y + 0, c, sn), 0, .28, 0, .03, .2, .2, 12, on ? T.glassG : T.glassR, on ? T.glassG : T.glassR); pbox(v, X, -.02, .9, .2, .02, .95, .3, T.metal);
      pbox(v, X, -.08, 1.15, .02, .08, 1.25, .06, { all: T.metal, f: on ? T.glassG : T.glassR }); break; }
    case "generator": pbox(v, X, -.9, 0, -.55, .9, 1.05, .55, { all: T.genMat, t: T.metal }); pcyl(v, X, .6, -.2, 1.05, WH, .07, .07, 8, T.metal); pbox(v, X, -.95, 0, -.6, .95, .08, .6, T.hazard); if (S.power) pbox(v, X, -.5, .8, .55, -.4, .88, .57, T.glassG); break;
    case "rack": for (const y of [0, .45, .9, 1.25]) pbox(v, X, -.8, y, -.25, .8, y + .04, .25, T.metal); for (const x of [-.8, .76]) for (const z of [-.25, .21]) pbox(v, X, x, 0, z, x + .04, 1.3, z + .04, T.metal); pbox(v, X, -.6, .49, -.2, -.1, .8, .2, T.crateBox); pbox(v, X, .1, .04, -.18, .6, .35, .18, T.crateBox); break;
    case "loom": pbox(v, X, -1.1, 0, -.6, 1.1, .3, .6, T.hazard); pbox(v, X, -1, .3, -.5, 1, 1.1, .5, { all: T.machine, t: T.metal }); for (let i = 0; i < 4; i++) pcylX(v, X, 1.2, -.3 + i * .2, -1, 1, .05, 6, T.metal, T.metal); pbox(v, X, -.8, 1.1, -.3, .8, 1.12, .3, T.cloth); break;
    case "conveyor": pbox(v, X, -.4, .55, -2.5, .4, .65, 2.5, { all: T.metal, t: T.belt }); for (const z of [-2.3, 0, 2.3]) for (const x of [-.38, .34]) pbox(v, X, x, 0, z, x + .04, .55, z + .04, T.metal); break;
    case "meat": { const CH = ceilAt(s.x, s.y), y0 = Math.min(CH - .25, 2.4); pbox(v, X, -.01, y0, -.01, .01, CH, .01, T.metal); pbox(v, X, -.03, y0 - .1, -.01, .03, y0, .01, T.metal); pcyl(v, X, 0, 0, y0 - .95, y0 - .1, .12, .2, 8, T.meat, T.meat); break; }
    case "barrel": pcyl(v, X, 0, 0, 0, .9, .3, .3, 12, T.rust, T.rust); pcyl(v, X, 0, 0, .3, .36, .31, .31, 12, T.hazard); break;
    default: return false;
  }
  return true;
}
