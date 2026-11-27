// =====================================================================
//  50. MA XUẤT HIỆN SAU 3 PHÚT
//  · 3 phút chơi đầu tiên (không tính lúc tạm dừng / xem phim): chưa có con ma nào.
//    Mọi thứ có thể đánh thức ma sớm (làm nhiệm vụ, đào nhầm mộ, gạt cầu dao...) được dời lại.
//  · Đúng 3:00 → ma thức giấc ở mọi độ khó. Phút 2:30 có điềm báo trước.
//  · Hù khi giải đố, nhện, chuột, tiếng động... vẫn giữ nguyên.
// =====================================================================
const GHOST_DELAY = 180;
const ghostGrace = () => (S.playT || 0) < GHOST_DELAY;
wakeGhosts = (o => function (...a) {
  if (S.woke) return;
  if (ghostGrace()) { S.wakePend = 1; return; }       // chưa đủ 3 phút → để dành
  return o.apply(this, a);
})(wakeGhosts);
spawnEnemy = (o => function (...a) {
  if (ghostGrace()) { S.spawnPend = Math.min(2, (S.spawnPend || 0) + 1); return; }
  return o.apply(this, a);
})(spawnEnemy);
spawnZombie = (o => function (...a) {
  if (ghostGrace()) { S.spawnPend = Math.min(2, (S.spawnPend || 0) + 1); return; }
  return o.apply(this, a);
})(spawnZombie);
gameStep = (o => function (dt) {
  o(dt);
  if (!S.started || S.ending || S.paused) return;
  if (NET.ok && !NET.host) return;                     // chơi online: chủ phòng quyết định
  const pt = S.playT || 0;
  if (!S.woke && !S.omen && pt >= GHOST_DELAY - 30) {  // điềm báo 30 giây trước
    S.omen = 1; flicker(.8); noise(1.2, 90, .35, .5);
    say("...Có tiếng thở dài rất khẽ ở đâu đó trong bóng tối. Thứ gì đó sắp thức giấc. Hãy cẩn thận.");
  }
  if (pt >= GHOST_DELAY && !S.ghostTimed) {
    S.ghostTimed = 1;
    if ((MAPID === "castle" && S.dead) || S.ending) return;          // đã diệt Nữ Bá Tước thì thôi
    if (!S.woke) wakeGhosts();
    let n = S.spawnPend || 0; S.spawnPend = 0;
    for (let i = 0; i < n; i++) setTimeout(() => { if (!S.ending) try { spawnMore(); } catch (e) {} }, 4000 + i * 6000);
    if (MAPID !== "cemetery") for (const g of ghosts) if (g.floor === F.id && Math.hypot(g.x - player.x, g.y - player.y) < 9) { const p = randomFloor(12); g.x = p.x; g.y = p.y; }   // không hiện ngay sát mặt
  }
})(gameStep);
