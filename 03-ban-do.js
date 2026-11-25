// ===================== 3. BẢN ĐỒ 3 TẦNG =====================
const FLOORS = {};
function makeFloor(id, name, w, h, ceil, defWall, defFloor, amb) {
  return FLOORS[id] = { id, name, w, h, ceil, defWall, defFloor, amb, grid: [...Array(h)].map(() => Array(w).fill("#")), room: new Array(w * h).fill(null), sprites: [], lights: [], over: {} };
}
function room(f, x1, y1, x2, y2, wall, floor, h, ceil) { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) { f.grid[y][x] = "."; f.room[y * f.w + x] = { wall, floor, h, ceil }; } }
function windowAt(f, x, y) { f.grid[y][x] = "w"; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (f.grid[y + dy]?.[x + dx] === ".") { f.lights.push({ x: x + .5 + dx * .9, y: y + .5 + dy * .9, h: 1, i: .32, r: .45, g: .55, b: .85, f: .5 }); break; } }
const put = (f, list, c) => list.forEach(([x, y]) => f.grid[y][x] = c);
const open = (f, list) => list.forEach(([x, y]) => f.grid[y][x] = ".");
const spr = (f, x, y, t, sh, o = {}) => f.sprites.push({ x, y, t, sh, ...o });
const lamp = (f, x, y, power = true) => { const rh = f.room[Math.floor(y) * f.w + Math.floor(x)]?.h ?? WH; spr(f, x, y, "bulb", .42, { hang: 1 }); f.lights.push({ x, y, h: rh - .5, i: rh > 2 ? 1.3 : .85, r: 1, g: .8, b: .55, power, f: rh > 2 ? .12 : .45 }); };
const candle = (f, x, y, light = true) => { spr(f, x, y, T.candle, .22); if (light) f.lights.push({ x, y, i: .75, r: 1, g: .6, b: .3 }); };

function buildMap() {
  // ---------- TẦNG 1 ----------
  const a = makeFloor("t1", "Tầng 1", 54, 30, T.ceil, [T.paper, T.paperB], T.wood, .05);
  room(a, 2, 2, 12, 10, T.kitW, T.kitF, 1.75);                 // bếp
  room(a, 14, 2, 21, 10, [T.paper, T.paperB], T.woodDk, 2.5, T.ceilWood); // sảnh cầu thang
  room(a, 23, 2, 28, 10, T.concP, T.concF, 1.55);              // phòng kho
  room(a, 30, 2, 37, 10, T.conc, [T.concF, T.concFB], 1.95);   // nhà xe
  room(a, 2, 12, 37, 13, [T.paper, T.paperB], T.carpet, 1.6); // hành lang
  room(a, 2, 15, 14, 28, [T.paper, T.paperB], [T.wood, T.woodB], 2.05); // phòng khách
  room(a, 16, 15, 23, 28, [T.paper, T.paperB], T.marble, 2.7, T.ceilVault);         // sảnh chính
  room(a, 25, 15, 37, 28, [T.paper, T.paperB], [T.wood, T.woodB], 1.9, T.ceilWood); // phòng ăn
  open(a, [[7, 11], [16, 11], [17, 11], [18, 11], [19, 11], [25, 11], [33, 11], [8, 14], [19, 14], [20, 14], [31, 14], [15, 22], [24, 22]]);
  put(a, [[17, 1], [18, 1]], "U"); put(a, [[25, 1]], "Q"); put(a, [[19, 29]], "X"); put(a, [[38, 20]], "C"); put(a, [[31, 29]], "P");
  [[8, 1], [10, 1], [31, 1], [36, 1], [1, 17], [1, 24], [4, 29], [12, 29], [17, 29], [22, 29], [38, 16], [38, 24], [38, 27], [28, 29], [35, 29]].forEach(([x, y]) => windowAt(a, x, y));
  a.labels = [["Bếp", 7, 6], ["Cầu thang", 17.5, 6], ["Kho", 25.5, 6], ["Nhà xe", 33.5, 6], ["Hành lang", 19.5, 12.5], ["Phòng khách", 8, 22], ["Sảnh chính", 19.5, 22], ["Phòng ăn", 31, 22]];
  room(a, 41, 15, 52, 27, [T.concP, T.concB], T.concF, 1.75); for (const x of [38, 39, 40]) { a.grid[21][x] = "."; a.room[21 * a.w + x] = { wall: T.concP, floor: T.concF }; }
  [[42.3, 16.3], [43.6, 16.3], [51.6, 26.4], [51.6, 25], [42.3, 26.4], [47, 26.5]].forEach(([x, y]) => a.sprites.push({ x, y, mesh: "crate", solid: .5 }));
  a.sprites.push({ x: 48, y: 18.6, mesh: "table", solid: .95 }); a.sprites.push({ x: 50.6, y: 17.2, mesh: "bed", solid: .8 });
  [[53, 18], [53, 24], [46, 28]].forEach(([x, y]) => windowAt(a, x, y)); a.lights.push({ x: 46.5, y: 21, h: 1.3, i: .22, r: 1, g: .55, b: .3, f: .5 });
  a.labels.push(["Nhà kho sau", 46.5, 21.5]);
  put(a, [[1, 21]], "H"); put(a, [[8, 29]], "V"); put(a, [[1, 26]], "W"); put(a, [[38, 5]], "G"); put(a, [[3, 1], [4, 1], [5, 1]], "K"); put(a, [[1, 5]], "F");
  put(a, [[23, 1], [24, 1], [27, 1], [28, 1]], "b"); put(a, [[1, 8]], "1"); put(a, [[38, 12]], "2"); put(a, [[29, 6]], "3");
  spr(a, 8, 20, T.sofa, .45, { rot: Math.PI / 2 }); spr(a, 4, 25, T.rockChair, .6, { solid: .4, rot: -2.3 }); spr(a, 31, 21, null, 0, { mesh: "table", solid: .95 }); spr(a, 31.3, 21.1, T.candle, .22, { base: .76 });
  spr(a, 29.6, 21, T.chair, .55, { solid: .3, rot: 0 }); spr(a, 32.4, 21, T.chair, .55, { solid: .3, rot: Math.PI }); spr(a, 34, 6, T.car, .85, { rot: Math.PI / 2 });
  spr(a, 24, 8.5, null, 0, { mesh: "crate", solid: .5 }); spr(a, 27.5, 8.5, null, 0, { mesh: "crate", solid: .5 }); spr(a, 20, 18, T.hangDoll, .7, { hang: 1 }); spr(a, 13.5, 27.5, T.doll, .34);
  candle(a, 16.6, 27.4); candle(a, 7, 6); a.lights.push({ x: 31.3, y: 21.1, h: .95, i: .8, r: 1, g: .6, b: .3 });
  [[10, 12.5], [28, 12.5], [19.5, 20], [8, 21], [31, 18], [7, 4], [34, 4], [25.5, 5], [18, 6]].forEach(([x, y]) => lamp(a, x, y));
  a.lights.push({ x: 19.5, y: 28.7, h: .6, i: .5, r: 1, g: .1, b: .1, power: true });
  a.bats = [[11, 9], [36, 27], [22, 3], [3, 13.5]];

  // ---------- LẦU 1 ----------
  const b = makeFloor("t2", "Lầu 1", 40, 30, T.ceilBeam, [T.blue, T.blueB], T.wood, .045);
  room(b, 2, 2, 14, 8, [T.blue, T.blueB], T.woodDk, 2.1, T.ceilWood);       // thư viện
  room(b, 16, 2, 23, 8, [T.blue, T.blueB], T.wood, 1.85);        // chiếu nghỉ
  room(b, 25, 2, 37, 8, [T.bathW, T.bathWB], T.bathF, 1.55);     // phòng tắm
  room(b, 2, 10, 37, 11, [T.blue, T.blueB], T.carpetB, 1.55);    // hành lang
  room(b, 2, 13, 11, 28, [T.rose, T.roseB], [T.wood, T.woodB], 1.7); // phòng Linh
  room(b, 13, 13, 22, 28, [T.blue, T.blueB], T.wood, 1.8);      // phòng chơi
  room(b, 24, 13, 37, 28, [T.blue, T.blueB], T.carpetB, 1.95, T.ceilWood);   // phòng bố mẹ
  open(b, [[8, 9], [19, 9], [20, 9], [6, 12], [17, 12], [30, 12]]);
  put(b, [[19, 1], [20, 1]], "N"); for (let x = 3; x <= 13; x++) put(b, [[x, 1]], "B"); put(b, [[1, 5]], "D"); put(b, [[31, 1]], "M"); put(b, [[38, 3], [38, 4]], "T");
  [[1, 7], [38, 7], [1, 15], [1, 25], [3, 29], [10, 29], [22, 29], [38, 14], [38, 21], [38, 28]].forEach(([x, y]) => windowAt(b, x, y));
  b.labels = [["Thư viện", 8, 5], ["Chiếu nghỉ", 19.5, 5], ["Phòng tắm", 31, 5], ["Hành lang", 19.5, 10.5], ["Phòng Linh", 6.5, 20], ["Phòng chơi", 17.5, 20], ["Phòng bố mẹ", 30.5, 20]];
  put(b, [[30, 9]], "L"); put(b, [[1, 20], [38, 25]], "W"); put(b, [[6, 29]], "Y"); put(b, [[20, 29]], "7"); put(b, [[17, 29]], "8"); put(b, [[14, 29]], "9"); put(b, [[38, 18]], "J");
  put(b, [[38, 10]], "4"); put(b, [[12, 20]], "1"); put(b, [[23, 24]], "2");
  spr(b, 4.1, 15.4, null, 0, { mesh: "bed", solid: .75 }); spr(b, 6.2, 17.2, T.dollLinh, .34, { act: "doll" }); spr(b, 18, 22, T.horse, .45, { solid: .4, rot: Math.PI / 2 }); spr(b, 17, 16, T.hangDoll, .7, { hang: 1 });
  spr(b, 30, 16, null, 0, { mesh: "bed", solid: .8 }); spr(b, 21, 14, T.doll, .34); spr(b, 36.5, 27.5, T.doll, .34); spr(b, 15, 27, T.doll, .34);
  candle(b, 19.5, 4.5); candle(b, 9.5, 26.5); candle(b, 20.5, 26.5); candle(b, 35, 27);
  [[10, 10.5], [28, 10.5], [20, 5.5], [8, 5], [31, 5], [7, 20], [17, 20], [31, 22]].forEach(([x, y]) => lamp(b, x, y));
  b.bats = [[13, 7], [36, 7], [3, 27], [36, 14]];

  // ---------- TẦNG HẦM ----------
  const c = makeFloor("b1", "Tầng hầm", 30, 20, T.ceilB, [T.concP, T.concB], T.concF, .03);
  room(c, 2, 2, 11, 8, [T.concP, T.concB], [T.concF, T.concFB], 1.6); // phòng nồi hơi
  room(c, 13, 2, 16, 8, T.conc, T.concF, 1.4); room(c, 18, 2, 27, 8, [T.conc, T.concB], T.concF, 1.5);
  room(c, 2, 10, 27, 11, [T.concP, T.concB], [T.concF, T.concFB], 1.4); room(c, 6, 13, 23, 18, [T.conc, T.concB], [T.concF, T.concFB], 1.8);
  open(c, [[7, 9], [14, 9], [15, 9], [22, 9], [14, 12], [15, 12]]);
  c.labels = [["Phòng nồi hơi", 6.5, 5], ["Kho", 22.5, 5], ["Hành lang", 14.5, 10.5], ["Phòng thờ", 14.5, 16]];
  put(c, [[14, 1], [15, 1]], "u"); put(c, [[6, 1]], "Z"); put(c, [[1, 4], [1, 5]], "O"); put(c, [[28, 5]], "R"); put(c, [[14, 19], [15, 19]], "A");
  put(c, [[5, 15]], "3"); put(c, [[24, 15]], "5"); put(c, [[10, 19]], "3");
  c.over[15 * 30 + 14] = T.rq[0]; c.over[15 * 30 + 15] = T.rq[1]; c.over[16 * 30 + 14] = T.rq[2]; c.over[16 * 30 + 15] = T.rq[3];
  for (let k = 0; k < 6; k++) candle(c, 15 + Math.cos(k * 1.047) * 1.8, 16 + Math.sin(k * 1.047) * 1.8, false);
  c.lights.push({ x: 15, y: 14.6, i: .8, r: 1, g: .55, b: .25 }, { x: 15, y: 17.4, i: .8, r: 1, g: .55, b: .25 }, { x: 14.5, y: 18.6, i: .5, r: 1, g: .55, b: .25 });
  [[10, 15], [20, 15], [8, 17.5], [21, 17.5], [12, 14]].forEach(([x, y]) => spr(c, x, y, T.hangDoll, .7, { hang: 1 }));
  spr(c, 20, 4, null, 0, { mesh: "crate", solid: .5 }); spr(c, 26, 3.5, null, 0, { mesh: "crate", solid: .5 });
  [[7, 5], [14.5, 10.5], [22, 5], [5, 10.5], [24, 10.5]].forEach(([x, y]) => lamp(c, x, y));
  c.bats = [[26, 7.5], [3, 11], [22, 17.5]];

  // Phân bổ pin theo cấp độ
  const all = []; for (const f of Object.values(FLOORS)) for (const p of f.bats) all.push([f, p]);
  all.sort(() => Math.random() - .5).slice(0, D.bat).forEach(([f, [x, y]]) => spr(f, x, y, T.battery, .18, { kind: "battery" }));
  // Texture sàn từng ô
  for (const f of Object.values(FLOORS)) {
    f.floorT = []; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      const k = y * f.w + x, rm = f.room[k], fl = f.over[k] || (rm ? rm.floor : f.defFloor);
      f.floorT[k] = Array.isArray(fl) ? (((x * 31 + y * 17) % 11 === 0) ? fl[1] : fl[0]) : fl;
    }
  }
}
let WALL_TEX = () => ({
  w: T.winHouse, U: T.stUp, N: T.stDn2, u: T.stUpB, n: T.stDnB, Q: T.baseDoor, L: T.bathDoor, X: S.power ? T.exitOn : T.exitOff, C: T.clock, P: T.portrait, H: T.fireplace,
  V: S.power ? T.tvOn : T.tvOff, W: T.wardrobe, G: T.tools, K: T.cabinet, F: T.fridge, b: T.shelfStore, B: T.shelf, D: T.desk, M: T.mirror, T: T.tub, Y: T.musicbox,
  7: T.d1, 8: T.d2, 9: T.d3, J: T.dresser, Z: S.power ? T.fuseOn : T.fuseOff, O: T.boiler, R: S.crate ? T.crateOpen : T.crate, A: S.altar ? T.altarDoll : T.altar,
  1: T.w1, 2: T.w2, 3: T.w3, 4: T.w4, 5: T.w5,
});
let WT = {};

// ===================== TRẠNG THÁI =====================
let F; // tầng hiện tại
let player = { x: 19.5, y: 26.5, a: -Math.PI / 2, pitch: 0, hp: 3, stamina: 100, battery: 75, lightOn: true, hidden: false, invuln: 0, bob: 0 };
const ghosts = [];
const inv = []; const has = k => inv.some(i => i.key === k);
const keys = {}; let t = 0, hurt = 0;
const pad2 = n => String(n).padStart(2, "0");
function setupPuzzles() {
  S.ch = ri(1, 11); S.cm = ri(1, 59);                       // giờ trên đồng hồ quả lắc
  const tot = 720 - (S.ch * 60 + S.cm); S.mh = Math.floor(tot / 60) || 12; S.mm = tot % 60; // giờ khi nhìn qua gương
  S.code4 = pad2(S.mh) + pad2(S.mm);
  S.counts = [ri(2, 9), ri(2, 9), ri(2, 9)]; S.code3 = S.counts.join("");
  Object.assign(S, { started: 0, paused: true, power: false, diary: false, bathOpen: false, baseOpen: false, mirrorDone: false, crate: false, altar: false, progress: 0, wrong: 0, woke: false, burnt: false, tvSeen: false, ending: false });
}
