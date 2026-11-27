// =====================================================================
//  58. VẬT LÝ ĐỒ VẬT: NGÃ, LĂN, BỊ ĐẨY — DOMINO & BOWLING
//  Mọi đồ vật mà người thật có thể xô đổ / đẩy đi đều phản ứng khi bạn đụng vào:
//   · ĐỔ NGHIÊNG: chai lọ, nến, chân nến, đèn, cây giá treo, cột truyền dịch, bình gas, cọc, ghế, ghế đẩu,
//     chậu cây, gấu bông, xe đạp... (vật cao đổ xuống có thể quật trúng vật khác → domino!)
//   · LĂN: đá, khúc gỗ, cuộn chỉ, sọ người, thùng phuy, xô.
//   · TRƯỢT BÁNH XE: xe lăn, xe đẩy dụng cụ, xe đẩy khay, băng ca, xe cút kít — đẩy là trôi đi xa.
//   · BỊ ĐẨY: hộp, thùng gỗ, bao tải, rương nhỏ, đồ chơi...
//  Vật đang chuyển động va vào vật khác sẽ truyền lực (bowling), vật nhẹ bay xa, vật nặng nhích ít.
//  Vật nặng kẹt vào tường thì chặn đường như thật. Ma đi ngang cũng làm đổ đồ.
//  Tiếng động lớn (thủy tinh vỡ, kim loại, thùng phuy) KÉO MA TỚI. Ngồi (C) đi rón rén thì chỉ đẩy nhẹ, không gây ồn.
// =====================================================================
const KICK_TYPE = {   // [kiểu, hệ số khối lượng]
  d_bottles: ["tip", .3], d_candles: ["tip", .3], d_flowers: ["tip", .35], d_urn: ["tip", .5], lantern: ["tip", .4], d_cone: ["tip", .4], d_teddy: ["tip", .3], d_plant: ["tip", .8],
  d_candelabra: ["tip", .8], d_lamp: ["tip", .8], r_coatrack: ["tip", 1], r_ivStand: ["tip", .8], d_gascyl: ["tip", 1.6], r_bicycle: ["tip", 1.4], chair: ["tip", 1], d_chair: ["tip", 1], d_stool: ["tip", .6],
  d_rock: ["roll", .7], rock: ["roll", .8], d_log: ["roll", 1.2], log: ["roll", 1.4], d_spools: ["roll", .5], r_spool: ["roll", 1.6], d_skulls: ["roll", .4], d_barrel: ["roll", 1.6], barrel: ["roll", 1.8], r_drums: ["roll", 1.8], d_bucket: ["roll", .5],
  r_wheelchair: ["cart", 1.4], r_trayCart: ["cart", 1.2], r_toolCart: ["cart", 1.6], r_gurney: ["cart", 2.2], r_wheelbarrow: ["cart", 1.6],
  d_boxes: ["slide", .7], book: ["slide", .2], d_sack: ["slide", 1], r_toys: ["slide", .4], r_bodyBag: ["slide", 2.2], d_trunk: ["slide", 1.6], r_toybox: ["slide", .9], crate: ["slide", 2], d_crates: ["slide", 2.6], r_pallets: ["slide", 2.4], d_cage: ["tip", 1.8],
};
const KICK_SND = { d_bottles: "glass", d_flowers: "glass", d_urn: "glass", lantern: "glass", d_candles: "soft", d_teddy: "soft", d_sack: "soft", r_bodyBag: "soft", r_toys: "soft", d_plant: "soft", book: "soft",
  d_rock: "stone", rock: "stone", d_skulls: "stone", d_barrel: "metal", barrel: "metal", r_drums: "metal", d_bucket: "metal", d_gascyl: "metal", r_ivStand: "metal", r_coatrack: "wood", d_cage: "metal",
  r_wheelchair: "metal", r_trayCart: "metal", r_toolCart: "metal", r_gurney: "metal", r_bicycle: "metal", r_wheelbarrow: "metal", d_lamp: "metal", d_candelabra: "metal", d_cone: "soft" };
const KICK = { floors: new WeakSet() };
const kName = s => s.k || (typeof T !== "undefined" && s.t === T.chair ? "chair" : s.mesh || "");

function kickInit(f) {
  if (KICK.floors.has(f)) return; KICK.floors.add(f);
  const F0 = F; F = f; const list = [];
  try {
    if (!f._obsDone && typeof relaxObstacles === "function") relaxObstacles(f);
    const groups = f._obsGroups || new Map(), onTop = f.sprites.filter(q => (q.base || 0) > .05 && !q.taken);
    for (const s of f.sprites) {
      const ty = KICK_TYPE[kName(s)]; if (!ty || s.taken || s.act || s.kind || s.tk || s.hang || s._kick) continue;
      if (onTop.some(q => q !== s && Math.hypot(q.x - s.x, q.y - s.y) < .45)) continue;       // có đồ đặt trên nó → để yên
      const h = typeof obsHeight === "function" ? obsHeight(s) : .3; if (h < 0 || h > (ty[0] === "tip" ? 1.05 : .62)) continue;
      const tmp = []; try { furniture(tmp, { ...s, x: 0, y: 0, taken: false }); } catch (e) { continue; } if (!tmp.length || tmp.length > 9 * 6000) continue;
      let r = .06; for (let i = 0; i < tmp.length; i += 9) r = Math.max(r, Math.hypot(tmp[i], tmp[i + 2]));
      r = Math.min(.6, r);
      if (!isFinite(h) || !isFinite(r)) continue;
      const m = Math.max(.15, Math.min(4, ty[1] * (.6 + h * 1.2) * (.6 + r * 2)));
      s._kick = { mode: ty[0], m, geo: new Float32Array(tmp), x: s.x, y: s.y, h: Math.max(.04, h), r, vx: 0, vy: 0, yaw: 0, tilt: 0, tv: 0, fx: 1, fy: 0, roll: 0, cd: 0, moving: 0, stuck: 0, snd: KICK_SND[kName(s)] || "wood", world: null, dirty: 1 };
      for (const c of groups.get(s) || []) { if (c !== s) { c._solid0 = c._solid0 ?? c.solid; c.solid = 0; } }
      s._solid0 = s._solid0 ?? s.solid; s.solid = 0; s.taken = true; list.push(s);
    }
  } finally { F = F0; }
  f._kicks = list; f._kMeshDirty = 1; if (list.length) f._baseDirty = true;
}
// ---------- âm thanh ----------
function kickSound(k, hard, sp = 1) {
  const v = Math.min(1.3, (hard ? 1 : .6) * (.5 + sp * .3) * Math.sqrt(k.m));
  if (!isFinite(v) || v <= 0) return;
  if (k.snd === "glass") { noise(.05, 4200, .22 * v, 6); noise(.04, 5200, .16 * v, 8, .06); if (hard) noise(.08, 3600, .2 * v, 5, .12); }
  else if (k.snd === "stone") { noise(.12, 160, .3 * v, .8); noise(.06, 420, .2 * v, 1.5, .05); }
  else if (k.snd === "metal") { noise(.18, 240, .35 * v, 2); noise(.3, 900, .12 * v, 9, .02); }
  else if (k.snd === "soft") noise(.08, 220, .14 * v, .7);
  else { noise(.1, 280, .25 * v, 1); noise(.05, 700, .12 * v, 2, .03); }
}
const kickLoud = (k, sp) => (k.snd === "glass" ? 7 : k.snd === "metal" ? 5 + k.m : k.snd === "soft" ? 0 : 2.5 + k.m) * Math.min(1, .4 + sp * .3);

// ---------- tác động ----------
function kickHit(s, ux, uy, sp, by) {           // by: "p" người chơi, "g" ma, "o" vật khác
  const k = s._kick; if (k.cd > 0 && by !== "o") return;
  k.cd = .25; const dv = sp / Math.sqrt(k.m);
  if (k.mode === "tip" && k.tilt === 0 && (dv > .55 || by === "o")) { k.fx = ux; k.fy = uy; k.tv = .4 + dv * .4; k.vx = ux * dv * .25; k.vy = uy * dv * .25; }
  else { const f = k.mode === "cart" ? 1.1 : k.mode === "roll" ? 1 : k.mode === "tip" ? .5 : .55; k.vx = k.vx * .3 + ux * dv * f; k.vy = k.vy * .3 + uy * dv * f; k.spin = (Math.random() - .5) * (k.mode === "cart" ? 2 : 6); }
  if (!k.moving) { k.moving = 1; F._kMeshDirty = 1; }
  if (dv > .25) kickSound(k, 0, dv);
  if (by === "p") { const L = kickLoud(k, dv); if (L > .5 && !(P1.crH > .05)) makeNoise(k.x, k.y, L); }
}
function kickStep(dt) {
  const list = F._kicks; if (!list || !list.length) return;
  const p = P1, crouch = p.crH > .05, spd = p.moving ? (p.running ? 3.4 : crouch ? .8 : 2) : 0, pa = p.a;
  const movers = [];
  for (const s of list) {
    const k = s._kick; k.cd = Math.max(0, k.cd - dt); k.stuck = Math.max(0, k.stuck - dt);
    // người chơi đụng vào
    if (spd > 0) { const dx = k.x - p.x, dy = k.y - p.y, d = Math.hypot(dx, dy);
      if (d < k.r * .85 + .22) { let ux = dx / (d || 1) + Math.cos(pa) * .9, uy = dy / (d || 1) + Math.sin(pa) * .9; const n = Math.hypot(ux, uy) || 1; kickHit(s, ux / n, uy / n, spd, "p"); } }
    if (k.moving) movers.push(s);
  }
  // ma đi ngang cũng xô đổ đồ
  for (const g of ghosts) if (g.floor === F.id && !(g.ko > t) && g.rise !== 0) for (const s of list) { const k = s._kick, dx = k.x - g.x, dy = k.y - g.y, d = Math.hypot(dx, dy); if (d < k.r * .8 + .25 && k.cd <= 0) kickHit(s, dx / (d || 1), dy / (d || 1), 1.6, "g"); }
  for (const s of movers) {
    const k = s._kick;
    // đổ xuống
    if (k.mode === "tip" && k.tv > 0 && k.tilt < Math.PI / 2) {
      const a0 = k.tilt; k.tv += dt * (14 / Math.sqrt(k.h + .3)); k.tilt = Math.min(Math.PI / 2, k.tilt + k.tv * dt); k.dirty = 1;
      if (a0 < .8 && k.tilt >= .8) {                                   // ngọn của vật đang đổ quét trúng vật khác → domino
        const tx = k.x + k.fx * k.h * .85, ty = k.y + k.fy * k.h * .85;
        for (const o of list) if (o !== s) { const q = o._kick, d = Math.hypot(q.x - tx, q.y - ty); if (d < q.r + .12 + k.h * .25) kickHit(o, k.fx, k.fy, 1.2 + k.m * .4, "o"); }
      }
      if (k.tilt >= Math.PI / 2) { k.tv = 0; kickSound(k, 1, 1.5); const L = kickLoud(k, 1.5); if (L > .5) makeNoise(k.x, k.y, L * .8); }
    }
    // trượt / lăn
    const v = Math.hypot(k.vx, k.vy);
    if (v > .02) {
      let nx = k.x + k.vx * dt, ny = k.y + k.vy * dt; const pad = Math.min(.25, k.r * .7);
      if (!free(nx + Math.sign(k.vx) * pad, k.y)) { k.vx *= -.35; nx = k.x; k.stuck = .4; if (v > .5) kickSound(k, 0, v); }
      if (!free(k.x, ny + Math.sign(k.vy) * pad)) { k.vy *= -.35; ny = k.y; k.stuck = .4; if (v > .5) kickSound(k, 0, v); }
      k.x = nx; k.y = ny;
      if (k.mode === "roll") { k.roll += v * dt / Math.max(.05, Math.min(k.h, k.r) * .6); k.fx = k.vx / (v || 1); k.fy = k.vy / (v || 1); }
      else if (k.mode === "cart") k.yaw += (k.spin || 0) * dt * Math.min(1, v * .5);
      else k.yaw += (k.spin || 0) * dt * Math.min(1, v);
      const fr = k.mode === "cart" ? .9 : k.mode === "roll" ? 1.3 : k.tilt > 0 ? 6 : 4.5; k.vx *= Math.exp(-fr * dt); k.vy *= Math.exp(-fr * dt);
      // va vào vật khác: bowling
      for (const o of list) if (o !== s) {
        const q = o._kick, dx = q.x - k.x, dy = q.y - k.y, d = Math.hypot(dx, dy), rr = (k.r + q.r) * .75;
        if (d < rr && d > 1e-4) {
          const nx2 = dx / d, ny2 = dy / d, vn = k.vx * nx2 + k.vy * ny2; if (vn <= .05) continue;
          const tr = vn * 2 * k.m / (k.m + q.m);
          kickHit(o, nx2, ny2, tr * Math.sqrt(q.m) * 1.1, "o");
          k.vx -= nx2 * vn * (q.m / (k.m + q.m)) * 1.6; k.vy -= ny2 * vn * (q.m / (k.m + q.m)) * 1.6;
          const push = (rr - d) * .5; k.x -= nx2 * push; k.y -= ny2 * push;
          if (vn > .6) { kickSound(o, 0, vn); const L = kickLoud(o, vn); if (L > .5) makeNoise(o.x, o.y, L * .7); }
        }
      }
      k.dirty = 1;
    }
    if (Math.hypot(k.vx, k.vy) <= .02 && !(k.mode === "tip" && k.tv > 0)) { k.vx = k.vy = 0; k.moving = 0; F._kMeshDirty = 1; }
  }
}
// Vật nặng bị kẹt vào tường thì chặn người như thật
canStand = (o => function (x, y) {
  if (!o(x, y)) return false;
  const list = F._kicks; if (!list || typeof STW === "undefined" || !STW.on) return true;
  for (const s of list) { const k = s._kick; if (k.m >= 1 && k.stuck > 0 && k.tilt === 0 && Math.hypot(k.x - x, k.y - y) < k.r * .7 + .2) return false; }
  return true;
})(canStand);

// ---------- dựng hình ----------
function kickWorld(k) {
  const g = k.geo, out = new Float32Array(g.length), cy = Math.cos(k.yaw), sy = Math.sin(k.yaw), ax = -k.fy, az = k.fx;
  const ang = k.mode === "roll" ? k.roll : k.tilt, ca = Math.cos(ang), sa = Math.sin(ang);
  const piv = k.mode === "roll" ? [0, Math.min(k.h, k.r) / 2, 0] : [k.fx * k.r * .6, 0, k.fy * k.r * .6];
  const rot = (x, y, z) => { const dot = x * ax + z * az; return [x * ca + (-az * y) * sa + ax * dot * (1 - ca), y * ca + (az * x - ax * z) * sa, z * ca + (ax * y) * sa + az * dot * (1 - ca)]; };
  for (let i = 0; i < g.length; i += 9) {
    let x = g[i] * cy - g[i + 2] * sy, y = g[i + 1], z = g[i] * sy + g[i + 2] * cy, nx = g[i + 5] * cy - g[i + 7] * sy, ny = g[i + 6], nz = g[i + 5] * sy + g[i + 7] * cy;
    if (ang && k.mode !== "cart") { const q = rot(x - piv[0], y - piv[1], z - piv[2]); x = q[0] + piv[0]; y = q[1] + piv[1]; z = q[2] + piv[2]; [nx, ny, nz] = rot(nx, ny, nz); }
    if (k.tilt) y = Math.max(y, 0);
    out[i] = x + k.x; out[i + 1] = y; out[i + 2] = z + k.y; out[i + 3] = g[i + 3]; out[i + 4] = g[i + 4]; out[i + 5] = nx; out[i + 6] = ny; out[i + 7] = nz; out[i + 8] = g[i + 8];
  }
  return out;
}
// Vật đang đứng yên: gộp vào một lưới riêng (dựng lại chỉ khi có vật bắt đầu/dừng chuyển động) → nhẹ máy
function kickMesh(f) {
  if (!f._kMeshDirty) return f._kMesh; f._kMeshDirty = 0;
  const parts = []; let n = 0;
  for (const s of f._kicks || []) { const k = s._kick; if (k.moving) continue; if (k.dirty || !k.world) { k.world = kickWorld(k); k.dirty = 0; } parts.push(k.world); n += k.world.length; }
  const all = new Float32Array(n); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; }
  if (f._kMesh) { gl.deleteBuffer(f._kMesh.b); gl.deleteVertexArray(f._kMesh.vao); }
  f._kMesh = n ? makeMesh(all) : null; return f._kMesh;
}
if (typeof scanDraw === "function") scanDraw = (o => function (f, eye, fw) {
  const m = f._kicks && kickMesh(f); if (m) { gl.bindVertexArray(m.vao); gl.drawArrays(gl.TRIANGLES, 0, m.n); }
  return o(f, eye, fw);
})(scanDraw);
swayMeshes = (o => function (v) {
  o(v);
  if (typeof scanDraw !== "function" && F._kicks) { const m = kickMesh(F); }           // (dự phòng)
  for (const s of F._kicks || []) {
    const k = s._kick; if (!k.moving) continue;
    if (k.dirty || !k.world) { k.world = kickWorld(k); k.dirty = 0; }
    const w = k.world; for (let i = 0; i < w.length; i++) v.push(w[i]);
  }
})(swayMeshes);
gameStep = (o => function (dt) {
  o(dt);
  if (!S.started || !FLOORS) return;
  if (!KICK.floors.has(F)) { kickInit(F); if (F._baseDirty) buildFloorMesh(F); }
  if (!S.paused) kickStep(dt);
})(gameStep);
