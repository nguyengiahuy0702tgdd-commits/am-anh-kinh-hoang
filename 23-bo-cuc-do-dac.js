// =====================================================================
//  21. BẢN 7: bố cục map riêng · đồ đạc 3D thật · ngồi/nhảy · nhạc theo mức căng thẳng · chống giật
// =====================================================================
// ---- Sắp xếp lại bố cục: di chuyển (và xoay) từng khối phòng sang chỗ mới ----
function relayout(f, W, H, blocks) {
  const og = f.grid, orm = f.room, oover = f.over || {}, ow = f.w, grid = [...Array(H)].map(() => Array(W).fill("#")), room = new Array(W * H).fill(null), over = {};
  const BS = blocks.map(b => {
    const [x0, y0, x1, y1] = b.r, w = x1 - x0 + 1, h = y1 - y0 + 1, r = b.rot || 0;
    const loc = (u, v) => r === 0 ? [u, v] : r === 90 ? [h - 1 - v, u] : r === 180 ? [w - 1 - u, h - 1 - v] : [v, w - 1 - u];
    const M = (x, y) => { const u = x - x0, v = y - y0, q = r === 0 ? [u, v] : r === 90 ? [h - v, u] : r === 180 ? [w - u, h - v] : [v, w - u]; return [b.to[0] + q[0], b.to[1] + q[1]]; };
    return { x0, y0, x1, y1, w, h, loc, M, ang: r * Math.PI / 180, to: b.to };
  });
  for (const b of BS) for (let v = 0; v < b.h; v++) for (let u = 0; u < b.w; u++) {
    const [nu, nv] = b.loc(u, v), nx = b.to[0] + nu, ny = b.to[1] + nv, ok = (b.y0 + v) * ow + b.x0 + u; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    grid[ny][nx] = og[b.y0 + v][b.x0 + u]; room[ny * W + nx] = orm[ok]; if (oover[ok]) over[ny * W + nx] = oover[ok];
  }
  const find = (x, y) => BS.find(b => x >= b.x0 && x < b.x1 + 1 && y >= b.y0 && y < b.y1 + 1);
  f.remap = (x, y) => { const b = find(x, y) || BS.find(b => x >= b.x0 - 1 && x < b.x1 + 2 && y >= b.y0 - 1 && y < b.y1 + 2); return b ? b.M(x, y) : [x, y]; };
  f.sprites = f.sprites.filter(s => { const b = find(s.x, s.y); if (!b) return false; [s.x, s.y] = b.M(s.x, s.y); if (b.ang) s.rot = (s.rot ?? -Math.PI / 2) + b.ang; return true; });
  f.lights = f.lights.filter(L => { const b = find(L.x, L.y); if (!b) return false; [L.x, L.y] = b.M(L.x, L.y); return true; });
  f.labels = (f.labels || []).filter(l => find(l[1], l[2])).map(([n, x, y]) => [n, ...f.remap(x, y)]);
  Object.assign(f, { w: W, h: H, grid, room, over });
}
const shut = (f, list) => list.forEach(([x, y]) => f.grid[y][x] = "#");
// Lâu đài: hành lang trục dọc ở giữa, phòng hai bên, đại sảnh nằm cuối trục (kiểu chữ T)
function castleLayout(a) {
  relayout(a, 42, 49, [   // (đã bỏ phòng tra tấn & khu mở rộng → lâu đài gọn hơn ~40%)
    { r: [12, 14, 27, 30], to: [20, 31] },   // đại sảnh
    { r: [1, 1, 12, 11], to: [15, 2] },      // thư viện
    { r: [12, 1, 19, 11], to: [7, 2] },      // cầu thang tháp
    { r: [1, 14, 12, 30], to: [15, 13] },    // nhà nguyện
    { r: [19, 1, 27, 11], to: [29, 2] },     // phòng ngai vàng
    { r: [27, 1, 38, 11], to: [37, 2] },     // kho vũ khí
    { r: [27, 14, 38, 30], to: [29, 14] },   // phòng ăn
  ]);
  room(a, 27, 3, 28, 30, [T.stoneW, T.stoneWB], T.carpet, 2.3, T.ceilVault);
  room(a, 9, 13, 14, 14, [T.stoneW, T.stoneWB], T.flag, 1.8);
  shut(a, [[21, 12], [21, 13], [33, 12], [42, 12], [34, 14]]);
  open(a, [[26, 7], [26, 21], [29, 7], [29, 21], [37, 7], [15, 14]]);
  a.labels.push(["Hành lang chính", 27.5, 18], ["Lối lên tháp", 11.5, 13.5]);
  [[26, 11], [26, 27], [29, 11], [29, 27], [26, 4], [29, 4]].forEach(([x, y]) => torchAt(a, x, y));
  [[27.5, 9], [27.5, 17], [27.5, 25]].forEach(([x, y]) => a.lights.push({ x, y, h: 1.6, i: .45, r: 1, g: .5, b: .22, f: .5 }));
  a.decorOff = [8, 17];
}
// Nhà máy: dãy phòng chức năng xếp dọc bên trái + hành lang kỹ thuật, xưởng lớn ở giữa, kho & thang hàng bên phải
function factoryLayout(a) {
  relayout(a, 69, 40, [
    { r: [1, 13, 27, 29], to: [13, 8] },              // xưởng sản xuất
    { r: [27, 13, 38, 22], to: [39, 8] },             // kho
    { r: [27, 22, 38, 29], to: [39, 17] },            // thang hàng
    { r: [39, 12, 55, 29], to: [51, 7] },             // kho hàng phụ
    { r: [1, 1, 11, 10], to: [1, 1], rot: 270 },      // phòng thay đồ
    { r: [11, 1, 20, 10], to: [1, 11], rot: 270 },    // phòng quản đốc
    { r: [20, 1, 29, 10], to: [1, 20], rot: 270 },    // phòng bơm
    { r: [29, 1, 38, 10], to: [1, 29], rot: 270 },    // phòng máy phát
  ]);
  room(a, 11, 2, 12, 37, [T.concP, T.concB], T.concF, 2.1);
  shut(a, [[20, 8], [30, 8], [44, 8], [13, 11], [13, 13], [13, 18], [13, 20], [13, 22]]);
  open(a, [[13, 12], [13, 19], [39, 12]]);
  [16, 22, 28, 34].forEach(x => windowAt(a, x, 8));
  a.labels.push(["Hành lang kỹ thuật", 11.8, 30]);
  [[11.5, 5], [11.5, 14], [11.5, 23], [11.5, 32]].forEach(([x, y]) => { lamp(a, x, y); a.lights.push({ x, y, h: 1.1, i: .5, r: 1, g: .05, b: .03, f: .6, cond: () => !S.power }); });
  a.decorOff = [12, -5];
}
// Phim mở đầu dùng tọa độ cũ → đổi sang bố cục mới
function remapShot(sh) {
  const f = FLOORS[sh.f]; if (!f || !f.remap || sh.card || sh.raw) return sh;
  const P = (x, y) => f.remap(x, y), o = { ...sh };
  o.cam = sh.cam.map(([x, y, z]) => { const [a, b] = P(x, z); return [a, y, b]; }); o.look = sh.look.map(([x, y, z]) => { const [a, b] = P(x, z); return [a, y, b]; });
  o.actors = (sh.actors || []).map(a => ({ ...a, p: a.p.map(([x, y]) => P(x, y)), face: Array.isArray(a.face) ? P(...a.face) : a.face }));
  o.lights = (sh.lights || []).map(L => { const [x, y] = P(L.x, L.y); return { ...L, x, y }; });
  return o;
}

// ---- Đồ đạc 3D thật (thay cho các mặt phẳng vẽ sẵn) ----
function buildPropTextures() {
  const flat = (c, n = 40, d = "rgba(0,0,0,.2)") => tex(g => { R(g, 0, 0, 128, 128, c); for (let i = 0; i < n; i++) R(g, rnd() * 128, rnd() * 128, 1 + rnd() * 3, 1 + rnd() * 6, d); });
  T.bk = ["#5a1c18", "#1e3a2a", "#2a2a44", "#6a5a3a", "#3a2418", "#4a3a5a"].map(c => tex(g => { R(g, 0, 0, 128, 128, c); for (const y of [14, 22, 104, 112]) R(g, 0, y, 128, 3, "rgba(210,170,90,.5)"); R(g, 30, 50, 68, 20, "rgba(0,0,0,.25)"); }));
  T.cardboard = tex(g => { R(g, 0, 0, 128, 128, "#8a6a44"); R(g, 0, 60, 128, 8, "#a8885a"); for (let i = 0; i < 30; i++) R(g, rnd() * 128, rnd() * 128, 2, 2, "rgba(60,30,10,.3)"); stain(g, 90, 30, 18, "rgba(40,20,5,.35)"); });
  T.lockerM = tex(g => { R(g, 0, 0, 128, 128, "#4a5652"); for (let y = 10; y < 40; y += 6) R(g, 30, y, 68, 2, "#1a2220"); R(g, 0, 0, 3, 128, "#2a3230"); for (let i = 0; i < 25; i++) stain(g, rnd() * 128, rnd() * 128, 4 + rnd() * 8, "rgba(110,50,20,.35)"); });
  T.potT = flat("#7a3c24"); T.leafT = flat("#121a0e", 160, "rgba(60,80,30,.35)"); T.glassB = tex(g => { R(g, 0, 0, 128, 128, "#18301e"); R(g, 20, 0, 14, 128, "rgba(180,220,190,.25)"); }, g => { g.fillStyle = "rgba(60,90,60,.15)"; g.fillRect(0, 0, 128, 128); });
  T.coneT = tex(g => { R(g, 0, 0, 128, 128, "#c4521a"); R(g, 0, 40, 128, 22, "#d8d4c8"); R(g, 0, 84, 128, 18, "#d8d4c8"); });
  T.cylRed = flat("#7a1612", 30, "rgba(30,0,0,.3)"); T.cylGreen = flat("#1e4a2e", 30, "rgba(0,20,0,.3)"); T.palletT = flat("#8c7450", 60, "rgba(50,30,10,.3)");
  T.rockT = flat("#4a4c48", 120, "rgba(20,22,20,.35)"); T.mossT = flat("#2c3a22", 120, "rgba(70,90,40,.3)"); T.mushT = tex(g => { R(g, 0, 0, 128, 128, "#8a2a1c"); for (let i = 0; i < 14; i++) E(g, rnd() * 128, rnd() * 128, 5, 4, "#e8dcc8"); });
  T.flowerW = flat("#d8d2c4", 30, "rgba(120,110,90,.3)"); T.clockFace = tex(g => { R(g, 0, 0, 128, 128, "#d8ccae"); g.strokeStyle = "#2a1a10"; g.lineWidth = 4; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); for (let i = 0; i < 12; i++) { const a = i / 6 * Math.PI; R(g, 62 + Math.cos(a) * 44, 62 + Math.sin(a) * 44, 4, 4, "#2a1a10"); } g.lineWidth = 5; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 24); g.moveTo(64, 64); g.lineTo(92, 70); g.stroke(); });
  T.frameArt = [0, 1, 2].map(k => tex(g => { R(g, 0, 0, 128, 128, ["#2a2420", "#1e2228", "#2a1e1e"][k]); if (k === 0) { E(g, 64, 50, 22, 28, "#8a7a68"); R(g, 30, 78, 68, 50, "#3a2a22"); R(g, 54, 44, 6, 4, "#000"); R(g, 68, 44, 6, 4, "#000"); }
    else if (k === 1) { R(g, 0, 80, 128, 48, "#20281e"); for (let i = 0; i < 5; i++) R(g, 10 + i * 24, 40 + (i % 2) * 10, 8, 40, "#0c0e0c"); E(g, 96, 24, 10, 10, "#bcb8a8"); } else { E(g, 64, 60, 30, 36, "#7a6a5a"); R(g, 44, 52, 40, 6, "#000"); stain(g, 64, 70, 20, "rgba(110,0,0,.7)"); } }));
}
const PROPTHEME = {
  house: ["d_chair", "d_shelf", "d_cabinet", "d_clock", "d_plant", "d_boxes", "d_bottles", "d_stool", "d_bucket", "d_shelf", "d_chair", "d_boxes"],
  castle: ["d_barrel", "d_candelabra", "d_bench", "d_shelf", "d_sack", "d_barrel", "d_cabinet", "d_bottles", "d_candelabra"],
  factory: ["d_crates", "d_barrel", "d_pallet", "d_gascyl", "d_cone", "d_sack", "d_bucket", "d_boxes", "d_bench", "d_crates", "d_gascyl"],
  forest: ["d_rock", "d_log", "d_mush", "d_bush", "d_rock", "d_bush", "d_mush"],
  cemetery: ["d_urn", "d_flowers", "d_rock", "d_bush", "d_urn", "d_bench", "d_flowers"],
};
const PROP_SOLID = { d_chair: .3, d_shelf: .42, d_cabinet: .4, d_clock: .28, d_plant: .22, d_boxes: .36, d_bottles: 0, d_stool: .2, d_bucket: .16, d_barrel: .3, d_candelabra: .16, d_bench: .38, d_sack: .25, d_crates: .48, d_pallet: .45, d_gascyl: .22, d_cone: .14, d_rock: .35, d_log: .4, d_mush: 0, d_bush: .3, d_urn: .2, d_flowers: 0 };
function dressFloor(f) {
  const theme = PROPTHEME[MAPID]; if (!theme) return; const placed = [], near = (x, y, r) => placed.some(p => Math.hypot(p[0] - x, p[1] - y) < r) || f.sprites.some(s => !s.taken && Math.hypot(s.x - x, s.y - y) < (s.solid ? s.solid + .9 : .8));
  const isW = c => c === "#", free = (x, y) => f.grid[y]?.[x] === ".";
  const special = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = f.grid[y + dy]?.[x + dx]; if (c && c !== "#" && c !== "." && c !== "I") return true; } return false; };
  const inBlock = (x, y) => (f.blocks || []).some(b => x > b[0] - .6 && x < b[2] + .6 && y > b[1] - .6 && y < b[3] + .6);
  if (!f.outdoor) {
    for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
      if (!free(x, y) || special(x, y)) continue;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isW(f.grid[y + dy][x + dx])); if (dirs.length !== 1) continue;
      const [wx, wy] = dirs[0]; if (!free(x - wx, y - wy) || !free(x - 2 * wx, y - 2 * wy) || !free(x - 3 * wx, y - 3 * wy)) continue;   // còn lối đi phía trước
      if (Math.random() > .3) continue;
      const cx = x + .5 + wx * .2, cy = y + .5 + wy * .2; if (near(cx, cy, 1.5) || inBlock(cx, cy)) continue;
      const k = theme[Math.floor(Math.random() * theme.length)], rot = Math.atan2(-wy, -wx);
      f.sprites.push({ x: cx, y: cy, k, rot, solid: PROP_SOLID[k] || 0, deco: 1, seed: Math.random() }); placed.push([cx, cy]);
      if (Math.random() < .25 && !f.outdoor) f.sprites.push({ x: x + .5 + wx * .47, y: y + .5 + wy * .47, k: "d_frame", rot, art: Math.floor(Math.random() * 3), deco: 1 });
    }
  } else {
    for (let y = 2; y < f.h - 2; y++) for (let x = 2; x < f.w - 2; x++) {
      if (!free(x, y) || f.path?.has(y * f.w + x) || f.room[y * f.w + x] || special(x, y) || Math.random() > .06) continue;
      const cx = x + .2 + Math.random() * .6, cy = y + .2 + Math.random() * .6; if (near(cx, cy, 2.2)) continue;
      const k = theme[Math.floor(Math.random() * theme.length)]; f.sprites.push({ x: cx, y: cy, k, rot: Math.random() * 6.28, solid: PROP_SOLID[k] || 0, deco: 1, seed: Math.random() }); placed.push([cx, cy]);
    }
  }
}
function dressModel(v, s) {
  const { c, s: sn } = facing(s.rot ?? 0), X = XF(s.x, 0, s.y, c, sn), dw = T.darkwood, sd = s.seed || .5, rr = k => ((Math.sin(sd * 999 + k * 77.7) + 1) / 2);
  switch (s.k) {
    case "d_chair": { const Y = XL(X, 0, 0, 0, 0, (rr(1) - .5) * .1); pbox(v, Y, -.2, .4, -.2, .2, .45, .2, dw); for (const [x, z] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) pcyl(v, Y, x, z, 0, .4, .018, .022, 6, dw, dw);
      for (const x of [-.17, .17]) pcyl(v, Y, x, -.18, .45, 1, .016, .016, 6, dw, dw); for (const y of [.6, .76, .92]) pbox(v, Y, -.17, y, -.2, .17, y + .05, -.16, dw); break; }
    case "d_stool": pcyl(v, X, 0, 0, .42, .46, .17, .17, 12, dw, dw); for (let i = 0; i < 3; i++) { const a = i * 2.09; limb(v, XL(X, Math.cos(a) * .1, .44, Math.sin(a) * .1, Math.sin(a) * .18, -Math.cos(a) * .18), Math.cos(a) * .1, Math.sin(a) * .1, .44, 0, .016, .018, dw, 6); } break;
    case "d_shelf": {
      pbox(v, X, -.45, 0, -.18, -.42, 1.25, .18, dw); pbox(v, X, .42, 0, -.18, .45, 1.25, .18, dw); pbox(v, X, -.45, 0, -.18, .45, 1.25, -.16, dw);
      for (const y of [.02, .32, .62, .92, 1.22]) pbox(v, X, -.43, y, -.17, .43, y + .03, .17, dw);
      for (const y of [.05, .35, .65, .95]) { let x = -.41; while (x < .38) { const w = .03 + rr(x * 13 + y) * .035, h = .16 + rr(x * 7 + y * 3) * .1, lean = rr(x + y * 9) > .88; if (rr(x * 3 + y) > .12) pbox(v, lean ? XL(X, x, y, 0, 0, .3) : X, x, y, -.12, x + w, y + h, .12, T.bk[Math.floor(rr(x * 5 + y * 11) * 6)]); x += w + .004; } }
      break; }
    case "d_cabinet": pbox(v, X, -.4, .06, -.22, .4, .85, .22, dw); pbox(v, X, -.42, .85, -.24, .42, .88, .24, dw);
      for (const y of [.12, .36, .6]) { pbox(v, X, -.36, y, .22, .36, y + .2, .24, dw); psphere(v, X, 0, y + .1, .25, .018, 5, T.brass || T.metal); }
      for (const [x, z] of [[-.36, -.18], [.36, -.18], [-.36, .18], [.36, .18]]) pcyl(v, X, x, z, 0, .06, .025, .02, 6, dw, dw); pcyl(v, X, -.2, 0, .88, 1.1, .05, .04, 8, T.glassB, T.glassB); break;
    case "d_clock": pbox(v, X, -.2, 0, -.14, .2, 1.85, .14, dw); pbox(v, X, -.23, 1.55, -.16, .23, 1.62, .16, dw); pbox(v, X, -.14, 1.16, .14, .14, 1.44, .15, T.clockFace);
      pbox(v, X, -.12, .3, .14, .12, 1.1, .15, T.glassB); { const P = XL(X, 0, 1.05, .1, 0, Math.sin(t * 2.6) * .25); pbox(v, P, -.006, .55, .1, .006, 1.05, .11, T.brass || T.metal); psphere(v, P, 0, .55, .105, .05, 8, T.brass || T.metal); } break;
    case "d_plant": pcyl(v, X, 0, 0, 0, .3, .12, .16, 12, T.potT, T.dirt || T.potT); for (let i = 0; i < 6; i++) { const a = i * 1.05 + sd; limb(v, XL(X, 0, .3, 0, Math.cos(a) * .5, Math.sin(a) * .5), Math.cos(a) * .02, Math.sin(a) * .02, .9 + rr(i) * .3, .3, .006, .012, T.darkwood, 5); } break;
    case "d_boxes": { const sz = [.46, .38, .3]; let y = 0; for (let i = 0; i < 2 + (rr(3) > .5); i++) { const w = sz[i] / 2, Y = XL(X, 0, y, 0, 0, (rr(i) - .5) * .15); pbox(v, Y, -w, y, -w, w, y + sz[i] * .8, w, T.cardboard); y += sz[i] * .8; } break; }
    case "d_crates": { const B = (x, z, y, w, rot) => { const Y = XL(X, x, y, z, 0, rot); pbox(v, Y, x - w, y, z - w, x + w, y + w * 2, z + w, T.crateBox); }; B(-.15, 0, 0, .3, 0); B(.38, .05, 0, .22, .3); B(-.1, 0, .6, .22, -.2); break; }
    case "d_barrel": pcyl(v, X, 0, 0, 0, .35, .25, .29, 14, dw, dw); pcyl(v, X, 0, 0, .35, .7, .29, .25, 14, dw, dw); for (const y of [.08, .35, .62]) pcyl(v, X, 0, 0, y, y + .04, .275 + (y === .35 ? .025 : 0), .275 + (y === .35 ? .025 : 0), 14, T.metal, null); break;
    case "d_bucket": pcyl(v, X, 0, 0, 0, .28, .12, .16, 12, T.metal, T.rust || T.metal); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI; pbox(v, X, Math.cos(a) * .15 - .006, .28 + Math.sin(a) * .14, -.006, Math.cos(a) * .15 + .006, .3 + Math.sin(a) * .14, .006, T.metal); } break;
    case "d_bottles": for (let i = 0; i < 5; i++) { const x = (rr(i) - .5) * .5, z = (rr(i + 9) - .5) * .3, h = .2 + rr(i + 4) * .12; if (rr(i + 2) > .75) { pcylX(v, X, .045, z, x - h / 2, x + h / 2, .045, 8, T.glassB, T.glassB); continue; } pcyl(v, X, x, z, 0, h, .045, .045, 8, T.glassB, T.glassB); pcyl(v, X, x, z, h, h + .1, .02, .016, 6, T.glassB, T.glassB); } break;
    case "d_candelabra": pcyl(v, X, 0, 0, 0, .05, .14, .14, 10, T.metal, T.metal); pcyl(v, X, 0, 0, .05, 1.05, .022, .02, 8, T.metal, T.metal);
      for (const x of [-.18, 0, .18]) { pcyl(v, X, x, 0, 1.05, 1.08, .035, .035, 8, T.metal, T.metal); candle3d(v, X, x, 1.08, 0, .12 + rr(x * 9) * .08); } pbox(v, X, -.18, 1.04, -.01, .18, 1.06, .01, T.metal); break;
    case "d_bench": pbox(v, X, -.6, .42, -.18, .6, .48, .18, dw); for (const x of [-.5, .5]) pbox(v, X, x - .04, 0, -.15, x + .04, .42, .15, dw); break;
    case "d_sack": for (let i = 0; i < 1 + (rr(2) > .4); i++) { const x = i * .32 - .1; psphere(v, XSp(X, x, .22, 0, 1, .8, .85), x, .22, 0, .24, 10, T.sack || T.cardboard); pcyl(v, X, x, 0, .38, .48, .06, .09, 8, T.rope || T.dark, T.rope || T.dark); } break;
    case "d_pallet": for (let i = 0; i < 5; i++) pbox(v, X, -.5, .1, -.42 + i * .2, .5, .14, -.32 + i * .2, T.palletT); for (const z of [-.4, 0, .38]) pbox(v, X, -.5, 0, z, .5, .1, z + .06, T.palletT); pbox(v, X, -.36, .14, -.3, .3, .62, .3, T.cardboard); break;
    case "d_gascyl": for (const [x, m] of [[-.12, T.cylRed], [.16, T.cylGreen]]) { pcyl(v, X, x, 0, 0, .9, .11, .11, 14, m, m); psphere(v, XSp(X, x, .9, 0, 1, .6, 1), x, .9, 0, .11, 10, m); pcyl(v, X, x, 0, .96, 1.04, .03, .03, 8, T.metal, T.metal); } break;
    case "d_cone": pcyl(v, X, 0, 0, 0, .03, .2, .2, 4, T.coneT, T.coneT, Math.PI / 4, Math.PI * 2 + Math.PI / 4); pcyl(v, X, 0, 0, .03, .55, .15, .02, 12, T.coneT, T.coneT); break;
    case "d_rock": psphere(v, XSp(X, 0, 0, 0, 1 + rr(1) * .6, .5 + rr(2) * .4, 1), 0, 0, 0, .35 + rr(3) * .25, 9, rr(4) > .5 ? T.mossT : T.rockT); break;
    case "d_log": pcylX(v, XL(X, 0, .16, 0, 0, 0), .16, 0, -.7, .7, .16, 10, T.bark || T.darkwood, T.darkwood); break;
    case "d_mush": for (let i = 0; i < 4; i++) { const x = (rr(i) - .5) * .4, z = (rr(i + 5) - .5) * .4, h = .06 + rr(i + 2) * .08; pcyl(v, X, x, z, 0, h, .012, .015, 6, T.flowerW, T.flowerW); psphere(v, XSp(X, x, h, z, 1, .45, 1), x, h, z, .045 + rr(i) * .03, 8, T.mushT); } break;
    case "d_bush": for (let i = 0; i < 9; i++) { const x = (rr(i) - .5) * .7, z = (rr(i + 7) - .5) * .7, y = .1 + rr(i + 3) * .28, r = .1 + rr(i + 1) * .1; psphere(v, XSp(X, x, y, z, 1 + rr(i + 4) * .5, .7, 1 + rr(i + 5) * .4), x, y, z, r, 6, T.leafT); } for (let i = 0; i < 4; i++) limb(v, XL(X, 0, 0, 0, (rr(i) - .5) * 1.2, (rr(i + 2) - .5) * 1.2), 0, 0, .55, 0, .006, .015, T.darkwood, 4); break;
    case "d_urn": pcyl(v, X, 0, 0, 0, .06, .16, .16, 10, T.mausW || T.rockT, T.mausW || T.rockT); pcyl(v, X, 0, 0, .06, .3, .1, .14, 12, T.mausW || T.rockT, null); pcyl(v, X, 0, 0, .3, .38, .14, .1, 12, T.mausW || T.rockT, T.dark);
      for (let i = 0; i < 3; i++) limb(v, XL(X, 0, .32, 0, (i - 1) * .15, .1), (i - 1) * .02, 0, .52, .32, .004, .006, T.darkwood, 4); break;
    case "d_flowers": for (let i = 0; i < 6; i++) { const x = (rr(i) - .5) * .4, z = (rr(i + 3) - .5) * .3, h = .18 + rr(i + 6) * .15; limb(v, XL(X, x, 0, z, (rr(i) - .5) * .4, 0), x, z, h, 0, .005, .006, T.leafT, 4); psphere(v, X, x, h, z, .03, 6, T.flowerW); } break;
    case "d_frame": { const art = T.frameArt[s.art || 0]; pbox(v, X, -.24, .72, -.03, .24, 1.14, .0, T.brass || dw); pbox(v, XL(X, 0, .93, 0, 0, (sd - .5) * .2), -.2, .76, .0, .2, 1.1, .008, art); break; }
  }
}
// Kệ sách / tủ đồ / tủ quần áo áp tường: dựng hình khối thật thay cho mặt vẽ phẳng
function propReal(v, c, X) {
  const dw = T.darkwood, D = PROP_DEPTH[c];
  if (c === "B" || c === "b") {
    const top = WH - .04; pbox(v, X, -.5, 0, 0, -.46, top, D, dw); pbox(v, X, .46, 0, 0, .5, top, D, dw); pbox(v, X, -.5, 0, 0, .5, top, .02, dw);
    const rows = 4, step = (top - .06) / rows;
    for (let r = 0; r <= rows; r++) pbox(v, X, -.47, .03 + r * step, .02, .47, .06 + r * step, D, dw);
    for (let r = 0; r < rows; r++) { let x = -.45; const y = .06 + r * step, seed = r * 7.3 + X.p(0, 0, 0)[0] * 3.1 + X.p(0, 0, 0)[2] * 1.7;
      while (x < .42) { const q = k => (Math.sin(seed + x * 41 + k) + 1) / 2, w = .03 + q(1) * .04, h = step * (.55 + q(2) * .35); if (q(3) > .08) pbox(v, q(4) > .9 ? XL(X, x, y, D / 2, 0, -.25) : X, x, y, .05, x + w, y + h, D - .02, T.bk[Math.floor(q(5) * 6) % 6]); x += w + .005; } }
    return true;
  }
  if (c === "W" && (MAPID === "house" || MAPID === "factory" || MAPID === "hospital")) {
    const fac = MAPID === "factory" || MAPID === "hospital", m = fac ? T.lockerM : dw, top = fac ? 1.25 : WH - .1;
    pbox(v, X, -.48, .04, .02, .48, top, D, m);
    if (fac) for (const x of [-.24, .24]) { pbox(v, X, x - .22, .08, D, x + .22, top - .04, D + .015, T.lockerM); for (let i = 0; i < 4; i++) pbox(v, X, x - .1, top - .2 - i * .05, D + .015, x + .1, top - .18 - i * .05, D + .02, T.dark); pbox(v, X, x + .14, .55, D + .015, x + .17, .7, D + .04, T.metal); }
    else { for (const x of [-.24, .24]) { pbox(v, X, x - .22, .1, D, x + .22, top - .08, D + .02, dw); pbox(v, X, x - .17, .2, D + .02, x + .17, top - .2, D + .03, dw); psphere(v, X, x + (x < 0 ? .17 : -.17), .62, D + .05, .02, 5, T.brass || T.metal); } pbox(v, X, -.5, top, 0, .5, top + .06, D + .04, dw); }
    return true;
  }
  return false;
}

// ---- Ngồi (C) / Nhảy (Space) ----
function updatePlayer(dt, C) {
  C = C || ctlP1();
  player.invuln -= dt; if (player === P1) hurt = Math.max(0, hurt - dt);
  player.a += C.turn * 2.2 * dt; player.running = false;
  if (player.vy || player.jy > 0) { player.jy = Math.max(0, (player.jy || 0) + (player.vy || 0) * dt); player.vy = player.jy > 0 ? (player.vy || 0) - 9.5 * dt : 0; if (!player.jy && !player.vy && player.landed !== true) { player.landed = true; noise(.08, 120, .35, .8); } }
  player.crH = (player.crH || 0) + ((player.crouch ? 1 : 0) - (player.crH || 0)) * Math.min(1, dt * 10);
  if (player.dead) return;
  if (player.hidden) { player.stamina = Math.min(100, player.stamina + 25 * dt); return; }
  const dx = Math.cos(player.a), dy = Math.sin(player.a); let mx = dx * C.f - dy * C.s, my = dy * C.f + dx * C.s; const len = Math.hypot(mx, my);
  const run = C.run && !player.crouch && player.stamina > 0 && len > 0; player.running = run;
  player.stamina = run ? Math.max(0, player.stamina - 30 * dt) : Math.min(100, player.stamina + 18 * dt);
  if (len) {
    const sp = (run ? 4 : player.crouch ? 1.25 : 2.3) * dt / len; mx *= sp; my *= sp;
    if (canStand(player.x + mx, player.y + my)) { player.x += mx; player.y += my; }
    else { if (canStand(player.x + mx, player.y)) player.x += mx; else if (canStand(player.x, player.y + my)) player.y += my;
      else for (const k of [.7, -.7]) { const ax = Math.cos(player.a + k * Math.sign(C.f || 1)) * sp * len * .7, ay = Math.sin(player.a + k * Math.sign(C.f || 1)) * sp * len * .7; if (canStand(player.x + ax, player.y + ay)) { player.x += ax; player.y += ay; break; } } }   // trượt nhẹ khi kẹt góc
    if (!player.jy) player.bob += dt * (run ? 13 : player.crouch ? 5 : 8);
    player.noiseT = (player.noiseT || 0) - dt; if (player.noiseT <= 0) { player.noiseT = .5; makeNoise(player.x, player.y, run ? D.hear : player.crouch ? 1 : 3); }
    player.stepT = (player.stepT || 0) - dt; if (player.stepT <= 0 && !player.jy) { noise(.07, 140, run ? .4 : player.crouch ? .1 : .25, .8); player.stepT = run ? .3 : player.crouch ? .7 : .45; }
  }
  if (player.lightOn) player.battery = Math.max(0, player.battery - D.drain * dt);
  for (const b of F.sprites) if (b.kind === "battery" && !b.taken && Math.hypot(b.x - player.x, b.y - player.y) < .5) { b.taken = true; netSend({ t: "bat", f: F.id, i: F.sprites.indexOf(b) }); buildFloorMesh(F); player.battery = Math.min(100, player.battery + 40); tone(784, 0, .16, .03, "sine"); tone(1175, .07, .22, .022, "sine"); say(`${pname(player)} nhặt được một cục pin. Đèn pin sáng hơn hẳn.`); }
}
const eyeOff = p => (p.jy || 0) - (p.crH || 0) * .3 + (p.shake > 0 ? (Math.random() - .5) * .05 * p.shake : 0);
addEventListener("keydown", e => {
  if (!S.started || S.paused || S.ending || CUT.on) return;
  if (e.code === "Space") { e.preventDefault(); if (!P1.jy && !P1.hidden && !P1.dead && !P1.crouch && P1.stamina > 8) { P1.vy = 2.6; P1.jy = .001; P1.landed = false; P1.stamina -= 8; noise(.06, 300, .2, .8); } }
  if (e.code === "KeyC") { P1.crouch = !P1.crouch;  }
  if (e.code === "Tab") TUT.tab = 1;
});
// Danh sách nhiệm vụ: ẩn sẵn, bấm Tab để xem
function toggleTasks(force) { const el = $("tasks"), on = force ?? !el.classList.contains("show"); el.classList.toggle("show", on); $("taskHint").classList.toggle("on", on); if (on) renderTasks(); }

// ---- Chống giật: tự hạ độ phân giải khi khung hình chậm ----
const PERF = { acc: 0, n: 0, t: 0, base: null };
function perfTick(dt) {
  if (!S.started || S.paused) return; PERF.base ??= SCALE; PERF.acc += dt; PERF.n++; PERF.t += dt; if (PERF.t < 2) return;
  const avg = PERF.acc / PERF.n; PERF.acc = PERF.n = PERF.t = 0;
  const lo = SET.quality === "nhanh" ? .45 : SET.quality === "sieu" ? .8 : .7; if (avg > .036 && SCALE > lo) SCALE = Math.max(lo, SCALE - .06); else if (avg < .018 && SCALE < PERF.base) SCALE = Math.min(PERF.base, SCALE + .05);
}
let F32 = new Float32Array(1 << 16);
function f32(v) { if (F32.length < v.length) F32 = new Float32Array(Math.ceil(v.length * 1.5)); F32.set(v); return F32.subarray(0, v.length); }
