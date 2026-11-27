// =====================================================================
//  63. MỌI MAP: KHÔNG CÓ ĐÈN PIN KHI BẮT ĐẦU — tìm đèn pin là NHIỆM VỤ PHỤ
//  Đèn pin cũ nằm đâu đó quanh chỗ xuất phát (vùng đi tới được mà không cần mở cửa),
//  mắt kính phát ánh xanh mờ. Chơi online: mỗi người một chiếc.
// =====================================================================
const torchN = () => (NET.on && NET.ok) ? Math.max(1, NET.roster.length) : 1;
function torchPlace() {
  if (MAPID === "hospital") return;                     // Bệnh viện đã có chỗ đặt riêng (trên quầy, bàn, xe đẩy...)
  const f = F, n = torchN(), sx = Math.floor(player.x), sy = Math.floor(player.y);
  const W = f.w, H = f.h, seen = new Uint8Array(W * H), q = [[sx, sy]], cand = []; seen[sy * W + sx] = 1;
  while (q.length) { const [x, y] = q.shift(), d = Math.hypot(x + .5 - player.x, y + .5 - player.y);
    if (d >= 4.5 && d <= 15) cand.push([x, y, d]);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= W - 1 || Y >= H - 1 || seen[Y * W + X] || f.grid[Y][X] !== ".") continue; seen[Y * W + X] = 1; q.push([X, Y]); } }
  const okCell = ([x, y]) => { const cx = x + .5, cy = y + .5; if (!canStand(cx, cy)) return false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (f.grid[y + dy]?.[x + dx] !== "." && f.grid[y + dy]?.[x + dx] !== "#") return false;   // không sát cửa, cầu thang
    return !f.sprites.some(s => !s.taken && Math.hypot(s.x - cx, s.y - cy) < (s.solid ? s.solid + .45 : .5)); };
  for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
  const got = [];
  for (const c of cand) { if (got.length >= n) break; if (!okCell(c) || got.some(g => Math.hypot(g[0] - c[0], g[1] - c[1]) < 3.5)) continue; got.push(c); }
  for (const [x, y] of got) { const px = x + .5 + (Math.random() - .5) * .3, py = y + .5 + (Math.random() - .5) * .3, s = { x: px, y: py, k: "r_torchItem", rot: Math.random() * 6.28, base: 0, act: "torch", reach: 1.6, wide: .3 };
    f.sprites.push(s); f.lights.push({ x: px, y: py, h: .1, i: .16, r: .3, g: 1, b: .4, f: 2.2, cond: () => !s.taken }); }
}
for (const def of Object.values(MAPDEFS)) {
  const st = def.start;
  def.start = function (...a) { const r = st.apply(this, a); torchPlace(); P1.torch = 0; P1.lightOn = false; return r; };
  def.SPRITE_ACTS.torch = torchAct; def.SPRITE_NAMES.torch = "Nhặt đèn pin";
}
function torchAct(s) {
  const q = TASKS.find(z => z.id === "torch");
  if (player.torch) {
    const need = players().filter(p => !p.gone && !p.torch).length;
    if (need) { if (player === P1) say("Bạn đã có đèn pin rồi — để chiếc này lại cho đồng đội."); return; }
    if (q && q.got >= q.need) return;
  }
  s.taken = true; buildFloorMesh(F); if (q) q.got++;
  if (!player.torch) { player.torch = 1; player.lightOn = true; player.battery = Math.max(player.battery || 0, 55); }
  noise(.08, 2800, .3); tone(660, 0, .5, .03); tone(990, .12, .6, .02); TUT.light = 1;
  say(player === P1 ? "Bạn nhặt được một chiếc đèn pin cũ. Bấm F để bật/tắt — pin không còn nhiều đâu." : `${pname(player)} đã tìm được đèn pin.`);
  if (q && q.got >= q.need) setTimeout(() => say(`Đã xong nhiệm vụ phụ: ${q.name}.`), 2400);
  try { renderTasks(); } catch (e) {}
}
// nhiệm vụ phụ "Tìm đèn pin" — luôn đứng đầu danh sách nhiệm vụ phụ
setupTasks = (o => function (...a) {
  const r = o.apply(this, a);
  const n = Object.values(FLOORS).reduce((c, f) => c + f.sprites.filter(s => s.act === "torch" && !s.taken).length, 0);
  if (n) TASKS.unshift({ id: "torch", kind: "torch", name: "Tìm đèn pin", need: Math.min(n, torchN()), got: 0 });
  return r;
})(setupTasks);
// không có đèn thì không bật được
toggleLight = (o => function (p) {
  if (p && !p.torch) { TUT.light = 1; if (p === P1 && !REMOTE) say("Bạn không có đèn pin. Hãy tìm một chiếc gần đây — ánh xanh mờ là mắt kính đèn."); return; }
  return o(p);
})(toggleLight);
gameStep = (o => function (dt) {
  if (S.started) for (const p of players()) if (p && !p.torch) p.lightOn = false;
  const r = o(dt);
  const bt = $("st1")?.querySelector(".bt"); if (bt) { const h = S.started && !P1.torch ? "none" : ""; if (bt.style.display !== h) bt.style.display = h; }
  return r;
})(gameStep);
// gợi ý (phím H): chưa có đèn thì chỉ tới đèn pin trước
hintTokens = (o => function () {
  if (!P1.torch && Object.values(FLOORS).some(f => f.sprites.some(s => s.act === "torch" && !s.taken))) return { tk: ["a:torch"], text: "Quá tối! Tìm đèn pin trước đã — ánh xanh mờ trên sàn là mắt kính đèn." };
  return o();
})(hintTokens);
