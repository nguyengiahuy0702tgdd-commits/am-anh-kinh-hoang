// ===================== 5. CON MA =====================
const free = (x, y) => F.grid[Math.floor(y)]?.[Math.floor(x)] === ".";
function randomFloor(minD) {
  for (let i = 0; i < 800; i++) { const x = 1 + Math.floor(Math.random() * (F.w - 2)) + .5, y = 1 + Math.floor(Math.random() * (F.h - 2)) + .5; if (free(x, y) && Math.hypot(x - player.x, y - player.y) > minD) return { x, y }; }
  return { x: player.x + 8, y: player.y };
}
function wakeGhosts() {
  if (S.woke) return; S.woke = true;
  const n = MD.count ? MD.count() : D.ghosts; for (let i = 0; i < n; i++) { if (MAPID === "cemetery") { const tb = F.sprites.filter(s => (s.k === "tomb" || s.k === "cross") && Math.hypot(s.x - player.x, s.y - player.y) > 9); const p = tb[Math.floor(Math.random() * tb.length)]; spawnZombie(p.x, p.y + .6); } else spawnEnemy(); }
  flicker(); noise(1.5, 300, .5, .7); setTimeout(() => say(MD.wakeMsg || "Một tiếng thét xé toạc màn đêm. Bạn không còn ở đây một mình nữa."), 600);
}
function lineClear(x1, y1, x2, y2) { const d = Math.hypot(x2 - x1, y2 - y1), n = Math.ceil(d / .1); for (let i = 1; i < n; i++) if (!free(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n)) return false; return true; }
const flashOn = () => player.lightOn && player.battery > 0 && !player.hidden;
function lit(g) {
  if (!flashOn()) return false; const dx = g.x - player.x, dy = g.y - player.y, d = Math.hypot(dx, dy);
  let da = Math.atan2(dy, dx) - player.a; da = Math.atan2(Math.sin(da), Math.cos(da)); return d < 7 && Math.abs(da) < .3 && lineClear(player.x, player.y, g.x, g.y);
}
let minGhostD = 99;
function updateGhosts(dt) {
  minGhostD = 99; CHASING = 0;
  for (const g of ghosts) {
    if (g.floor !== F.id) { // đi theo bạn sang tầng khác
      if (!g.arrive) g.arrive = t + D.follow + Math.random() * 5;
      if (t > g.arrive) { g.floor = F.id; g.x = F.arriveX; g.y = F.arriveY; g.arrive = 0; noise(.6, 150, .5, .7); say("...Có tiếng bước chân lê trên cầu thang. Nó đã theo bạn tới đây."); }
      continue;
    }
    const d = Math.hypot(g.x - player.x, g.y - player.y); minGhostD = Math.min(minGhostD, d);
    let tx, ty, sp;
    if (!player.hidden && d < D.range) { tx = player.x; ty = player.y; sp = D.chase; CHASING = 1; }
    else { if (Math.hypot(g.tx - g.x, g.ty - g.y) < .3) { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } tx = g.tx; ty = g.ty; sp = D.wander; }
    if (lit(g)) sp *= D.lit;
    sp *= g.mul * (S.altar ? .75 : 1); const a = Math.atan2(ty - g.y, tx - g.x);
    g.x += Math.cos(a) * sp * dt; g.y += Math.sin(a) * sp * dt;
    if (!player.hidden && d < .5 && player.invuln <= 0) {
      player.hp--; player.invuln = 2.5; hurt = 1;
      jumpScare(() => {
        const p = randomFloor(11); g.x = p.x; g.y = p.y;
        if (player.hp <= 0) lose("\"Giờ anh sẽ ở lại chơi với em mãi mãi...\"");
        else say(player.hp === 1 ? "Bạn gần như mất trí. Thêm một lần nữa thôi..." : "Bàn tay lạnh buốt chạm vào gáy bạn. Chạy đi! Trốn vào tủ, hoặc soi đèn thẳng vào nó!");
      });
    }
  }
  heartRate = Math.max(320, Math.min(1400, 250 + minGhostD * 150));
}
