// =====================================================================
//  12. KẺ THÙ DÙNG CHUNG + CÂN BẰNG LẠI MA RỪNG
// =====================================================================
function makeNoise(x, y, r) { for (const g of ghosts) if (g.floor === F.id && Math.hypot(g.x - x, g.y - y) < r) { g.hx = x; g.hy = y; g.hunt = t + 8; } }
function spawnEnemy(x, y) {
  const p = x != null ? { x, y } : randomFloor(14), w = randomFloor(0);
  ghosts.push({ x: p.x, y: p.y, floor: F.id, tx: w.x, ty: w.y, mul: 1, arrive: 0, rise: MAPID === "cemetery" ? 0 : 1, face: 0, state: "patrol", stare: 0, gone: 0 });
}
function touchPlayer(g, msgs, loseMsg, away = 12) {
  if (player.hidden || player.invuln > 0) return;
  player.hp--; player.invuln = 2.5; hurt = 1;
  jumpScare(() => { const p = randomFloor(away); g.x = p.x; g.y = p.y; g.state = "patrol"; g.hunt = 0;
    if (player.hp <= 0) lose(loseMsg); else say(msgs[Math.min(msgs.length - 1, Math.max(0, player.hp - 1))]); });
}
function followFloor(g) {   // ma đi theo bạn sang tầng khác
  if (g.floor === F.id) return false;
  if (!g.arrive) g.arrive = t + D.follow + Math.random() * 5;
  if (t > g.arrive) { g.floor = F.id; g.x = F.arriveX; g.y = F.arriveY; g.arrive = 0; noise(.6, 150, .5, .7); say("...Có tiếng bước chân trên cầu thang. Nó đã theo bạn tới đây."); }
  return true;
}
const angTo = (a, b) => { let d = b - a; return Math.atan2(Math.sin(d), Math.cos(d)); };
function moveToward(g, tx, ty, sp, dt) { const a = Math.atan2(ty - g.y, tx - g.x); g.face = a; g.x += Math.cos(a) * sp * dt; g.y += Math.sin(a) * sp * dt; }
function moveWalk(g, tx, ty, sp, dt) {   // đi bộ không xuyên tường
  const a = Math.atan2(ty - g.y, tx - g.x); g.face = a; const nx = g.x + Math.cos(a) * sp * dt, ny = g.y + Math.sin(a) * sp * dt;
  if (free(nx, g.y)) g.x = nx; else if (free(g.x, ny)) { g.y = ny; return; } else { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; }
  if (free(g.x, ny)) g.y = ny;
}

// Ma Rừng (đã cân bằng): chậm hơn, ở xa bị nhìn thấy thì biến mất một lúc, chỉ nguy hiểm khi ở gần
function updateStalker(dt) {
  minGhostD = 99; CHASING = 0;
  for (const g of ghosts) {
    if (g.gone > t) continue;
    if (g.gone && g.gone <= t) {   // xuất hiện lại phía sau, khá xa
      g.gone = 0; for (let i = 0; i < 60; i++) { const ang = player.a + Math.PI + (Math.random() - .5) * 1.8, r = 15 + Math.random() * 6, x = player.x + Math.cos(ang) * r, y = player.y + Math.sin(ang) * r; if (free(x, y)) { g.x = x; g.y = y; break; } }
    }
    const dx = g.x - player.x, dy = g.y - player.y, d = Math.hypot(dx, dy); minGhostD = Math.min(minGhostD, d * .7);
    const seen = Math.abs(angTo(player.a, Math.atan2(dy, dx))) < .55 && d < 24 && lineClear(player.x, player.y, g.x, g.y);
    g.tp = g.tp ?? t + D.stalkCd;
    if (seen) {
      g.stare += dt * (flashOn() ? 1.2 : 1);
      if (d > 6 && g.stare > 1.4) { g.stare = 0; g.gone = t + D.stalkCd * (.8 + Math.random() * .4); noise(.4, 80, .4, .6); say("Nó biến vào bóng tối giữa những thân cây... nhưng nó vẫn ở đâu đó."); continue; }
      if (d <= 6 && g.stare > D.stare && player.invuln <= 0) {
        g.stare = 0; player.hp--; player.invuln = 2; hurt = 1;
        jumpScare(() => { g.gone = t + D.stalkCd; if (player.hp <= 0) lose("Bạn đã nhìn vào nó quá lâu. Giờ bạn là một phần của khu rừng."); else say("Đầu bạn như muốn nổ tung... Ở gần thì ĐỪNG NHÌN NÓ LÂU. Hãy lùi xa rồi mới nhìn."); });
      }
    } else {
      g.stare = Math.max(0, g.stare - dt * .8);
      if (d < 16) { CHASING = 1; moveToward(g, player.x, player.y, D.stalk * g.mul * (S.burned >= 5 ? .6 : 1), dt); }
      if (d > 22 && t > g.tp) { g.tp = t + D.stalkCd + Math.random() * 15; for (let i = 0; i < 40; i++) { const ang = player.a + Math.PI + (Math.random() - .5) * 1.6, r = 13 + Math.random() * 5, x = player.x + Math.cos(ang) * r, y = player.y + Math.sin(ang) * r; if (free(x, y)) { g.x = x; g.y = y; break; } } }
    }
    if (d < .7) touchPlayer(g, ["Bạn gần như mất trí. Thêm một lần nữa thôi...", "Nó tóm được bạn rồi buông ra... như đang chơi đùa. Đừng quay lưng quá lâu!"], "Những ngón tay dài ngoằng siết lấy bạn. Khu rừng lại có thêm một người mất tích.", 18), g.gone = t + D.stalkCd;
  }
  heartRate = Math.max(320, Math.min(1400, 250 + minGhostD * 140));
}
