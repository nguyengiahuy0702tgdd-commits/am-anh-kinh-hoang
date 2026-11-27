// =====================================================================
//  56. VẬT CẢN HỢP LÝ + SỬA NHIỆM VỤ CUỐI LÂU ĐÀI
//  A. Đồ nhỏ, thấp (sách, chai lọ, nến, đá, gấu bông, xô, hộp nhỏ, đồ nhiệm vụ...) → đi xuyên qua.
//     Đồ to, cao (bàn ghế, giường, tủ, sofa, thùng phuy, bia mộ, quan tài, lửa trại...) → vẫn chặn.
//     Chiều cao đo từ chính hình 3D của đồ vật (1 đơn vị ≈ 1,9 m).
//  B. Lâu Đài: quan tài nhỏ trong hầm mộ cũng hiện nút tương tác (chỉ tới quan tài lớn);
//     cầm cọc bạc đứng sát trước mặt Nữ Bá Tước → bấm E đóng cọc thẳng vào tim bà ta.
// =====================================================================
const OBS_KEEP = new Set(["bonfire", "fire", "chest", "coffin", "coffinBig", "tomb", "cross", "grave", "angel", "willow", "tree", "dead", "pew", "throne", "bell", "well", "tent", "shrine",
  "generator", "loom", "conveyor", "d_bench", "r_benchRow", "r_pews", "slantern", "armor", "altarC", "altarStone", "car"]);
const OBS_PASS = new Set(["task", "d_bottles", "d_candles", "d_flowers", "d_skulls", "book", "ashes", "r_rug", "r_toys", "r_bodyBag", "d_rock", "rock", "d_log", "log", "cloche", "lantern", "d_bush", "r_torchItem"]);
const OBS_H = new Map();
function obsHeight(s) {
  const key = (s.k || s.mesh || "") + "@" + (s.sc || 1) + (s.t ? "t" : "");
  if (OBS_H.has(key)) return OBS_H.get(key);
  const ob = F.blocks, nb = ob ? ob.length : 0, tmp = []; let h = -1;
  try { furniture(tmp, { ...s, x: 0, y: 0, base: 0 }); let mx = -1e9, mn = 1e9; for (let i = 0; i < tmp.length; i += 9) { mx = Math.max(mx, tmp[i + 1]); mn = Math.min(mn, tmp[i + 1]); } if (tmp.length) h = mx - Math.max(0, mn); }
  catch (e) {} finally { if (F.blocks && F.blocks.length > nb) F.blocks.length = nb; }
  OBS_H.set(key, h); return h;
}
function obsPassable(s, fp) {
  const k = s.k || s.mesh || "";
  if (OBS_KEEP.has(k)) return false;
  if (OBS_PASS.has(k) || s.k === "task") return true;
  const h = obsHeight(s); if (h < 0) return false;
  return h <= .27 && fp <= .5 || h <= .37 && fp <= .25;                     // thấp ngang gối, hoặc nhỏ gọn thấp hơn hông
}
function relaxObstacles(f) {
  if (f._obsDone) return; f._obsDone = 1;
  const F0 = F; F = f; let n = 0;
  try {
    const sp = f.sprites, group = new Map();                                // vật thể → các vòng va chạm của nó
    let last = null;
    for (const s of sp) {
      if (s.k !== "r_col") { last = s; if (s.solid && !s.taken && !s.hang) group.set(s, [s]); continue; }
      if (!s.solid) continue;
      let par = null;
      if (s.sol) { let bd = 1.3; for (const q of sp) if (q.k !== "r_col" && (q.k || q.mesh || "t") === s.sol) { const d = Math.hypot(q.x - s.x, q.y - s.y); if (d < bd) { bd = d; par = q; } } }
      else if (last && Math.hypot(last.x - s.x, last.y - s.y) < 2.2) par = last;
      if (!par) continue;
      if (!group.has(par)) group.set(par, []);
      group.get(par).push(s);
    }
    f._obsGroups = group;                                              // để file 58 biết vòng va chạm nào thuộc đồ vật nào
    for (const [par, cols] of group) {
      const fp = Math.max(...cols.map(c => c.solid || 0)), extent = cols.reduce((m, c) => Math.max(m, Math.hypot(c.x - par.x, c.y - par.y) + (c.solid || 0)), 0);
      if (!obsPassable(par, Math.max(fp, extent))) continue;
      for (const c of cols) { c._solid0 = c.solid; c.solid = 0; n++; }
    }
  } finally { F = F0; }
  return n;
}
gameStep = (o => function (dt) {
  if (S.started && FLOORS) for (const f of Object.values(FLOORS)) if (!f._obsDone) relaxObstacles(f);
  return o(dt);
})(gameStep);

// ---------- Lâu Đài ----------
CASTLE.SPRITE_ACTS.coffinS = () => say(S.dead ? "Một cỗ quan tài đá trống rỗng." : "Không phải cỗ này — quan tài của Nữ Bá Tước là cỗ lớn khảm vàng ở giữa hầm mộ. Mang cọc bạc tới đó.");
CASTLE.SPRITE_NAMES.coffinS = "Quan tài đá";
CASTLE.SPRITE_NAMES.coffin = "Quan tài Nữ Bá Tước (đóng cọc bạc)";
buildCastle = (o => function (...a) {
  const r = o.apply(this, a);
  for (const f of Object.values(FLOORS || {})) for (const s of f.sprites) if (s.k === "coffin" && !s.act && f.id === "c3") Object.assign(s, { act: "coffinS", reach: 1.6, wide: .4 });
  return r;
})(buildCastle);
if (CASTLE.build) CASTLE.build = buildCastle;
const COUNTESS_STAKE = { act: "coffin", label: "Đóng cọc bạc vào tim Nữ Bá Tước", x: 0, y: 0, reach: 1.9 };
computeAim = (o => function () {
  o();
  if (MAPID !== "castle" || S.dead || !has("stake")) return;
  for (const g of ghosts) {
    if (g.floor !== F.id) continue;
    const dx = g.x - player.x, dy = g.y - player.y, d = Math.hypot(dx, dy); let da = Math.atan2(dy, dx) - player.a; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (d < 1.9 && Math.abs(da) < .55) { COUNTESS_STAKE.x = g.x; COUNTESS_STAKE.y = g.y; aimedSprite = COUNTESS_STAKE; return; }
  }
})(computeAim);
