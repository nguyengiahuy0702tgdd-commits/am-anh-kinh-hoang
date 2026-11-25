// =====================================================================
//  14. MAP "NGHĨA TRANG LÚC 0H ĐÊM"
//  Nhiệm vụ: tìm đúng mộ cô Lan, đào lấy chiếc lược ngà, đặt lên am thờ trong lăng → cổng mở. Hạn chót: 3 giờ sáng.
//  Kẻ thù: XÁC SỐNG — chậm nhưng ngày càng đông, trồi lên từ các ngôi mộ.
// =====================================================================
const FOG_CEM = [Math.pow(28 / 255, 2.2), Math.pow(36 / 255, 2.2), Math.pow(33 / 255, 2.2)];
function buildCemeteryTextures() {
  T.sky2 = tex((g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#020304"); gr.addColorStop(.38, "#0a0e0c"); gr.addColorStop(.5, "#1c2421"); gr.addColorStop(1, "#1c2421"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const y = rnd() * h * .42; g.fillStyle = `rgba(220,230,220,${.2 + rnd() * .5})`; g.fillRect(rnd() * w, y, .6, .6); }
    const mx = w * .3, my = h * .28, mg = g.createRadialGradient(mx, my, 0, mx, my, 26); mg.addColorStop(0, "rgba(220,230,210,.45)"); mg.addColorStop(1, "rgba(220,230,210,0)"); g.fillStyle = mg; g.fillRect(mx - 26, my - 26, 52, 52);
    g.fillStyle = "#141c19"; g.beginPath(); g.moveTo(0, 64); for (let x = 0; x <= w; x += 4) g.lineTo(x, 61 - Math.abs(Math.sin(x * .017 + 1)) * 6); g.lineTo(w, 64); g.fill();
    g.fillStyle = "#0e1412"; [30, 90, 170, 220].forEach(x => { g.fillRect(x, 50, 1.5, 14); g.fillRect(x - 3, 54, 7.5, 1.3); }); g.fillRect(120, 44, 6, 20); g.beginPath(); g.moveTo(119, 44); g.lineTo(123, 36); g.lineTo(127, 44); g.fill();
    E(g, mx, my, 6, 8, "#e8ecdc"); E(g, mx - 1.5, my - 2, 1.5, 2, "#c4c8b8"); E(g, mx + 2, my + 2, 1.2, 1.5, "#ccd0c0");
    for (let i = 0; i < 8; i++) { g.fillStyle = "rgba(8,10,9,.6)"; g.beginPath(); g.ellipse(rnd() * w, 25 + rnd() * 30, 25 + rnd() * 30, 3 + rnd() * 3, 0, 0, 7); g.fill(); }
  }, null, 256, 128);
  T.tomb = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a5a56"); for (let i = 0; i < 20; i++) stain(g, rnd() * w, rnd() * h, 8 + rnd() * 14, "rgba(40,60,30,.55)"); g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 1.2; g.strokeRect(14, 16, 100, 96); g.fillStyle = "rgba(20,20,18,.75)"; g.font = "bold 13px 'Times New Roman'"; g.textAlign = "center"; g.fillText("✝", 64, 36); for (let y = 50; y < 100; y += 12) R(g, 28, y, 72 - (y % 24), 3, "rgba(20,20,18,.55)"); grime(g, w, h, 1500, .35); });
  T.tombB = tex((g, w, h) => { R(g, 0, 0, w, h, "#4a4a46"); grime(g, w, h, 1500, .4); hand(g, 64, 60); for (let i = 0; i < 4; i++) drip(g, 40 + rnd() * 50, 20, 30 + rnd() * 40, "#4a0404"); });
  T.mausW = tex((g, w, h) => { R(g, 0, 0, w, h, "#4e4c48"); for (let x = 0; x < w; x += 32) { R(g, x, 0, 6, h, "#5e5c58"); R(g, x + 6, 0, 1, h, "rgba(0,0,0,.4)"); } R(g, 0, 0, w, 10, "#3a3834"); grime(g, w, h, 1800, .35); for (let i = 0; i < 6; i++) stain(g, rnd() * w, rnd() * h, 14, "rgba(30,50,25,.5)"); });
  T.mausDoor = tex((g, w, h) => { R(g, 0, 0, w, h, "#4e4c48"); R(g, 22, 5, 84, 123, "#1e1e1c"); for (let x = 26; x < 104; x += 8) R(g, x, 8, 3, 120, "#3a3a38"); for (const y of [30, 70, 110]) R(g, 22, y, 84, 4, "#3a3a38"); plaque(g, 64, 16, "NHÀ THỜ"); grime(g, w, h, 900, .4); });
  T.stoneRoof = tex((g, w, h) => { R(g, 0, 0, w, h, "#2e2e2c"); for (let y = 0; y < h; y += 12) R(g, 0, y, w, 2, "#1a1a18"); grime(g, w, h, 1500, .4); for (let i = 0; i < 8; i++) stain(g, rnd() * w, rnd() * h, 14, "rgba(30,50,25,.6)"); });
  T.willow = tex((g, w, h) => { R(g, 0, 0, w, h, "rgba(0,0,0,0)"); for (let i = 0; i < 260; i++) { const x = rnd() * w; g.strokeStyle = rnd() < .5 ? "#1c2a16" : "#2a3a1e"; g.lineWidth = .8 + rnd(); g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + (rnd() - .5) * 8, h * .5, x + (rnd() - .5) * 6, h * (.6 + rnd() * .4)); g.stroke(); } });
  T.zombieFace = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a4232"); E(g, 64, 66, 28, 42, "#6a7458"); E(g, 55, 58, 6, 7, "#100804"); E(g, 73, 58, 6, 7, "#100804"); E(g, 64, 86, 10, 6, "#200804"); for (let x = 56; x < 74; x += 3) R(g, x, 82, 2, 4, "#a8a080"); stain(g, 80, 50, 12, "rgba(90,0,0,.8)"); grime(g, w, h, 900, .4); R(g, 0, 0, w, 24, "#1a1a14"); }, g => { E(g, 55, 58, 1.5, 1.5, "rgba(220,255,200,.8)"); E(g, 73, 58, 1.5, 1.5, "rgba(220,255,200,.8)"); });
  T.zombieCloth = tex((g, w, h) => { R(g, 0, 0, w, h, "#2e2a22"); for (let i = 0; i < 12; i++) R(g, rnd() * w, rnd() * h, 6 + rnd() * 20, 2 + rnd() * 10, "#4a5a3a"); grime(g, w, h, 1500, .4); stain(g, 60, 50, 20, "rgba(70,0,0,.8)"); });
  T.mound = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a2016"); for (let i = 0; i < 300; i++) E(g, rnd() * w, rnd() * h, .6 + rnd() * 1.6, .5 + rnd(), rnd() < .5 ? "#3a2c1e" : "#18120c"); });
  T.combMat = tex((g, w, h) => R(g, 0, 0, w, h, "#e8dcc0"), g => { g.globalAlpha = .3; R(g, 0, 0, 128, 128, "#fff"); });
}
const CEM_NAMES = ["Nguyễn Thị Lan|1962 – 1987", "Trần Thị Lan|1959 – 1987", "Nguyễn Thị Lành|1962 – 1988"];
const DECOY_NAMES = ["Phạm Văn Tư|1931 – 1979", "Lê Thị Hoa|1940 – 1993", "Đỗ Văn Minh|1955 – 1987", "Vô danh|? – 1975", "Hoàng Thị Mai|1928 – 1981", "Bé Thảo|1984 – 1990", "Ngô Văn Sáu|1937 – 1987", "Lý Thị Bảy|1946 – 1999"];
function buildCemetery() {
  fseed = 909; const f = makeFloor("g1", "Nghĩa Trang", 64, 48, T.ceilBeam, T.mausW, T.grass, .025);
  Object.assign(f, { outdoor: 1, edge: "fence", roofs: [], path: new Set(), sky: T.sky2, fogC: FOG_CEM, fogD: .0075, moonC: [.07, .085, .08] });
  for (let y = 2; y <= 45; y++) for (let x = 2; x <= f.w - 3; x++) { const R = 7, cx = x + .5, cy = y + .5, qx = Math.max(0, 2 + R - cx, cx - (f.w - 2 - R)), qy = Math.max(0, 2 + R - cy, cy - (46 - R)); if (Math.hypot(qx, qy) <= R) f.grid[y][x] = "."; }
  for (let y = 3; y <= 45; y++) for (const x of [23, 24]) f.path.add(y * f.w + x); for (let x = 3; x <= f.w - 4; x++) for (const y of [23, 24]) f.path.add(y * f.w + x);
  for (let y = 25; y <= 33; y++) for (const x of [38, 39]) f.path.add(y * f.w + x); for (let x = 25; x <= 38; x++) f.path.add(30 * f.w + x);
  for (let y = 13; y <= 22; y++) for (const x of [37, 38]) f.path.add(y * f.w + x);
  f.grid[46][23] = f.grid[46][24] = "k";
  // Nhà người gác mộ
  for (let y = 34; y <= 40; y++) for (let x = 36; x <= 42; x++) { const wall = y === 34 || y === 40 || x === 36 || x === 42; f.grid[y][x] = wall ? "c" : "."; if (!wall) f.room[y * f.w + x] = { wall: T.logWall, floor: T.wood, roof: 1 }; }
  f.grid[34][39] = "."; f.room[34 * f.w + 39] = { wall: T.logWall, floor: T.wood, roof: 1 }; f.roofs.push([36, 34, 43, 41, T.roof, T.logWall]);
  // Nhà xác
  for (let y = 5; y <= 12; y++) for (let x = 50; x <= 58; x++) { const wall = y === 5 || y === 12 || x === 50 || x === 58; f.grid[y][x] = wall ? "c" : "."; if (!wall) f.room[y * f.w + x] = { wall: T.mausW, floor: T.marble, roof: 1 }; }
  f.grid[12][54] = "."; f.room[12 * f.w + 54] = { wall: T.mausW, floor: T.marble, roof: 1 }; f.roofs.push([50, 5, 59, 13, T.stoneRoof, T.mausW]);
  // Nhà thờ lớn kiểu gothic
  for (let y = 3; y <= 14; y++) for (let x = 30; x <= 43; x++) { const wall = y === 3 || y === 14 || x === 30 || x === 43; f.grid[y][x] = wall ? "m" : "."; if (!wall) f.room[y * f.w + x] = { wall: T.mausW, floor: T.marble, roof: 1, h: 4.6, ceil: T.ceilVault }; }
  f.grid[14][37] = "f"; f.roofs.push([30, 3, 44, 15, T.stoneRoof, T.mausW, 4.6, [37, 12.5]]); f.charH = { m: 4.6, v: 4.6, f: 4.6, c: WH };
  for (const [x, y] of [[30, 6], [30, 9], [30, 12], [43, 6], [43, 9], [43, 12]]) f.grid[y][x] = "v";
  for (const [x, y] of [[33, 6], [33, 10], [40, 6], [40, 10]]) f.grid[y][x] = "I"; f.decor = churchDecor; f.colMat = T.mausW;
  f.labels = [["Liễu", 11, 9], ["Nhà gác mộ", 39, 43], ["Nhà thờ", 36.5, 1.5], ["Cổng", 24, 45], ["Thiên thần", 24, 19]];
  f.floorT = []; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const k = y * f.w + x, hh = (x * 73856093 ^ y * 19349663) >>> 0, rm = f.room[k]; f.floorT[k] = rm ? rm.floor : f.path.has(k) ? T.dirt : f.grid[y][x] === "#" ? T.leaves : (hh % 9 < 6 ? T.grass : hh % 9 < 8 ? T.leaves : T.dirtB); }
  const K = (x, y, k, o = {}) => f.sprites.push({ x, y, k, ...o });
  // Cây liễu & 3 ngôi mộ
  K(11, 10.5, "willow", { solid: .45 }); S.cemOrder = [0, 1, 2].sort(() => Math.random() - .5);
  [[9, 13.6], [11.2, 14.1], [13.4, 13.6]].forEach(([x, y], i) => K(x, y, "grave", { act: "grave", idx: i, name: CEM_NAMES[S.cemOrder[i]], rot: -Math.PI / 2, reach: 1.9, wide: .5, solid: .35 }));
  // Các hàng mộ
  let n = 0; const dec = [...DECOY_NAMES].sort(() => Math.random() - .5);
  for (const y of [6, 9, 18, 28, 31, 37, 41]) for (let x = 4.5; x < f.w - 4; x += 2.6) {
    const cx = Math.floor(x), cy = Math.floor(y); if (f.grid[cy][cx] !== "." || f.path.has(cy * f.w + cx) || f.room[cy * f.w + cx] || (x > 6 && x < 16 && y < 16) || (x > 31 && y > 32 && y < 42) || (x > 28 && y < 16)) continue;
    const hh = (cx * 31 + cy * 17) % 7, read = n++ % 4 === 0 && dec.length;
    K(x, y, hh < 4 ? "tomb" : "cross", { rot: -Math.PI / 2, solid: .3, seed: hh, ...(read ? { act: "tomb", name: dec.pop(), reach: 1.7 } : {}) });
  }
  [[20.5, 20.5], [27.5, 27.5], [20.5, 27.5]].forEach(([x, y]) => K(x, y, "angel", { rot: Math.PI / 4, solid: .4 }));
  [[21.6, 42], [25.4, 42], [21.6, 33], [25.4, 33], [21.6, 14], [25.4, 14], [36.4, 22]].forEach(([x, y]) => { K(x, y, "slantern", { solid: .25 }); f.lights.push({ x, y, h: .55, i: .55, r: .9, g: 1, b: .6, f: .9 }); });
  for (let i = 0; i < 14; i++) { const x = 4 + frnd() * (f.w - 8), y = 4 + frnd() * 40; if (f.grid[Math.floor(y)][Math.floor(x)] === "." && !f.room[Math.floor(y) * f.w + Math.floor(x)] && !f.path.has(Math.floor(y) * f.w + Math.floor(x)) && !f.sprites.some(s => Math.hypot(s.x - x, s.y - y) < 1.8)) K(x, y, "dead", { solid: .3, seed: 7 + i }); }
  // Trong nhà gác mộ
  f.sprites.push({ x: 39.5, y: 37.7, mesh: "table", solid: .95 }); K(39.2, 37.6, "book", { base: .76, act: "clog", reach: 1.9 }); K(40.3, 37.8, "lantern", { base: .76 }); f.lights.push({ x: 40.3, y: 37.8, h: 1, i: .8, r: 1, g: .7, b: .35 });
  K(37.6, 39.2, "shovel", { act: "shovel", reach: 1.7 }); K(41.3, 35.9, "mapboard", { act: "cmap", rot: Math.PI, reach: 1.8 });
  [[52.2, 7.5], [56, 7.5], [52.2, 10.2], [56, 10.2]].forEach(([x, y]) => K(x, y, "coffin", { rot: 0, solid: .5 })); f.lights.push({ x: 54, y: 9, h: .9, i: .35, r: .6, g: .9, b: .7, f: .8 });
  f.labels.push(["Nhà xác", 54, 3.6], ["Khu mộ mới", 54, 30]);
  // Trong nhà thờ
  K(36.5, 4.8, "altarStone", { act: "altar2", rot: Math.PI / 2, reach: 2, wide: .5, solid: .7 }); f.lights.push({ x: 36.5, y: 5.4, h: .9, i: .8, r: 1, g: .55, b: .25 });
  for (const y of [8, 9.6, 11.2, 12.6]) for (const x of [35, 38.5]) K(x, y, "pew", { rot: -Math.PI / 2, solid: .6 });
  K(36.5, 9, "chandelier", { hang: 1 }); f.lights.push({ x: 36.5, y: 9, h: 2.2, i: .7, r: 1, g: .6, b: .3, f: .25 }); [[31.5, 7.5], [42, 7.5], [31.5, 11], [42, 11]].forEach(([x, y]) => f.lights.push({ x, y, h: 2, i: .3, r: .55, g: .45, b: .9, f: .3 }));
  [[30, 40], [7, 30], [44, 20], [16, 5], [33, 16]].slice(0, Math.max(3, D.bat - 3)).forEach(([x, y]) => f.sprites.push({ x, y, t: T.battery, sh: .18, kind: "battery" }));
  return f;
}

const CLOG = `<b>Sổ ghi chép của người gác mộ</b><br>— Đêm nào cũng nghe tiếng con gái khóc dưới gốc liễu phía tây bắc. Đó là mộ cô <b>Nguyễn Thị Lan</b>, mất năm <b>1987</b>, chôn cùng chiếc lược ngà mẹ cô tặng.<br>
— Hai ngôi mộ bên cạnh tên na ná, coi chừng đào nhầm. Đào nhầm mộ là đánh thức người khác dậy.<br>— Thầy cúng dặn: đặt chiếc lược lên bàn thờ trong <b>nhà thờ lớn</b> thì cô ấy mới yên. Cổng nghĩa trang chỉ mở khi cô ấy được siêu thoát.<br>— Qua 3 giờ sáng, đừng ai ở lại đây.`;
const CEMETERY = {
  NAMES: { k: "Cổng nghĩa trang", f: "Cửa nhà thờ" },
  ACTIONS: {
    k() { if (S.freed) return winCem(); say("Cổng sắt bị xích chặt. Trên ổ khóa treo một lá bùa vàng đã ố máu."); },
    f(c) { if (!has("comb")) return say("Cửa nhà thờ khóa chặt. Từ bên trong vọng ra tiếng đàn organ... dù không có ai chơi."); F.grid[c.y][c.x] = "."; S.mausOpen = 1; refreshWalls(); noise(1, 200, .5, .6); say("Chiếc lược ngà trong túi bạn nóng ran... Cánh cửa nhà thờ tự mở ra."); },
  },
  SPRITE_ACTS: {
    clog() { if (!S.clog) { S.clog = 1; progress(); } showNote(CLOG); addItemOnce("clog", "Sổ gác mộ", () => showNote(CLOG)); },
    shovel(s) { s.taken = true; buildFloorMesh(F); addItem("shovel", "Xẻng"); progress(); say("Bạn cầm lấy chiếc xẻng. Lưỡi xẻng còn dính đất ẩm... và tóc người."); },
    cmap(s) { if (has("map")) return say("Tấm bản đồ khu mộ đã ở trong túi bạn."); addItem("map", "Bản đồ nghĩa trang", () => toggleMap()); say("Bạn gỡ tấm bản đồ khu mộ trên vách. Bấm M để xem."); },
    tomb(s) { say(`Bia mộ: ${s.name.replace("|", " · ")}`); },
    grave(s) {
      const nm = s.name.replace("|", " · ");
      if (S.dug[s.idx]) return say(`Huyệt mộ ${nm} đã bị đào tung.`);
      if (!has("shovel")) return say(`Bia mộ dưới gốc liễu: ${nm}. Cần xẻng để đào.`);
      S.dug[s.idx] = 1; buildFloorMesh(F); for (let i = 0; i < 6; i++) noise(.12, 300, .4, .8, i * .3);
      if (S.cemOrder[s.idx] === 0) { addItem("comb", "Lược ngà"); progress(); return say("Nắp quan tài bật ra. Bộ hài cốt mặc áo dài trắng, đôi tay ôm chặt chiếc lược ngà. Bạn khẽ gỡ nó ra... Có tiếng thở dài sau lưng."); }
      S.clockMin += 15; spawnZombie(s.x + .8, s.y + 1.2); if (!S.woke) wakeGhosts();
      jumpScare(() => say(`Đào nhầm mộ! Bàn tay thối rữa thò lên từ huyệt... Mất thêm 15 phút. Đọc kỹ tên và năm mất!`));
    },
    altar2() {
      if (S.freed) return say("Chiếc lược nằm yên trên am thờ. Nén nhang cháy thẳng, không còn lập lòe.");
      if (!has("comb")) return say("Am thờ phủ bụi, có di ảnh một cô gái trẻ mặc áo dài trắng. Bát nhang trống trơn.");
      S.freed = 1; removeItem("comb"); progress(); tone(523, 0, 1.6, .05); tone(659, .4, 1.6, .05); tone(784, .8, 2, .05);
      for (const g of ghosts) g.mul *= .7; say("Bạn đặt chiếc lược lên am thờ. Một giọng con gái thì thầm: \"Cảm ơn...\" Từ xa vọng lại tiếng xích sắt rơi — cổng nghĩa trang đã mở!");
    },
  },
  SPRITE_NAMES: { clog: "Sổ gác mộ", shovel: "Xẻng", cmap: "Bản đồ khu mộ", tomb: "Bia mộ", grave: "Mộ dưới gốc liễu", altar2: "Am thờ" },
  GOALS: [
    [() => S.clog, "Vào nhà người gác mộ (phía đông nam) đọc sổ ghi chép.", "Tìm nhà người gác mộ."],
    [() => has("shovel") || has("comb") || S.freed, "Lấy chiếc xẻng trong nhà gác mộ.", "Tìm dụng cụ đào."],
    [() => has("comb") || S.freed, "Tìm mộ cô Nguyễn Thị Lan (mất 1987) dưới gốc liễu phía tây bắc và đào lên. Đọc kỹ tên!", "Tìm đúng ngôi mộ và đào lên."],
    [() => S.freed, "Mang chiếc lược ngà vào nhà thờ lớn (phía đông bắc) và đặt lên bàn thờ.", "Giúp cô ấy siêu thoát."],
    [() => false, "Chạy ra cổng nghĩa trang ở phía nam!", "Thoát khỏi nghĩa trang."],
  ],
  hard: "Mục tiêu: Giúp vong hồn siêu thoát và thoát ra trước 3 giờ sáng.",
  intro: "0 giờ đêm. Bạn trèo qua cổng nghĩa trang vì một lời thách đố... và cánh cổng tự khóa lại sau lưng. Phải ra khỏi đây trước 3 giờ sáng.",
  whispers: ["...trả lược cho em...", "...đừng đào mộ tôi...", "...lạnh quá...", "...ở lại đây với chúng tôi...", "...3 giờ rồi..."],
};
function winCem() { endWin("THOÁT KHỎI NGHĨA TRANG", "Bạn lao qua cổng nghĩa trang đúng lúc chuông chùa xa điểm 3 tiếng.<br><br><i>Sáng hôm sau, người ta thấy trên mộ cô Lan có một bó hoa trắng còn đọng sương. Không ai biết ai đã đặt nó.</i>"); }
