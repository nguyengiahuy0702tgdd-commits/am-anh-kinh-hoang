// =====================================================================
//  55. ĐẠO DIỄN KỊCH TÍNH — mỗi ván một khác, càng chơi càng căng
//  Sau khi ma thức giấc (phút 3), cứ một quãng ngẫu nhiên lại xảy ra MỘT biến cố,
//  không lặp lại liền nhau; nhịp nhanh dần theo thời gian và theo độ khó:
//   · CÚP ĐIỆN: đèn pin tắt phụt, bật lại không được vài giây.
//   · PHỤC KÍCH: ma biến mất rồi hiện ra ở phía trước, chặn đường bạn.
//   · CUỒNG NỘ: ma lao nhanh hơn hẳn trong ~12 giây, tim đập dồn dập.
//   · TIẾNG ĐỘNG LẠ: thứ gì rơi vỡ ở xa — ma bỏ đi tìm (có lợi cho bạn!).
//   · NÓ BIẾT BẠN Ở ĐÂU: lời thì thầm, ma lần theo đúng chỗ bạn đứng.
//   · BƯỚC CHÂN SAU LƯNG: tiếng bước chân dồn tới sau lưng... quay lại thì không có gì.
//  Ngoài ra ma nhanh dần theo thời gian (có giới hạn), độ khó càng cao càng tăng.
// =====================================================================
const DIR_CFG = {
  de:   { gap: [150, 210], ramp: .006, cap: .12, w: { dark: 1, ambush: 0, rage: 0, decoy: 3, know: 1, steps: 3 } },
  tb:   { gap: [95, 140],  ramp: .02,  cap: .25, w: { dark: 2, ambush: 1, rage: 1, decoy: 2, know: 2, steps: 2 } },
  kho:  { gap: [65, 100],  ramp: .035, cap: .35, w: { dark: 2, ambush: 2, rage: 2, decoy: 1, know: 2, steps: 2 } },
  sieu: { gap: [45, 75],   ramp: .05,  cap: .45, w: { dark: 3, ambush: 3, rage: 3, decoy: 1, know: 3, steps: 1 } },
};
const DIR = { next: 0, last: "", noLight: 0, rageEnd: 0, ramp: 0 };
const dirCfg = () => DIR_CFG[Object.keys(DIFF).find(k => DIFF[k] === D) || "tb"] || DIR_CFG.tb;

toggleLight = (o => function (p) {
  if (p === P1 && t < DIR.noLight && !p.lightOn) { noise(.04, 1800, .2); return say("Đèn pin chỉ lóe lên rồi tắt ngấm... Chờ chút đã."); }
  return o(p);
})(toggleLight);

const DIR_EV = {
  dark() {                                    // cúp điện
    if (!P1.lightOn) return false;
    P1.lightOn = false; DIR.noLight = t + 3.5 + Math.random() * 3; flicker(1.2); noise(.3, 120, .5, .6);
    say("Đèn pin tắt phụt! Bóng tối ập xuống... có tiếng thở rất gần."); return true;
  },
  ambush() {                                  // ma chặn đầu
    const g = ghosts.find(q => q.floor === F.id && q.rise !== 0 && Math.hypot(q.x - player.x, q.y - player.y) > 7); if (!g) return false;
    for (let k = 0; k < 30; k++) {
      const d = 7 + Math.random() * 4, a = player.a + (Math.random() - .5) * 1.2, x = player.x + Math.cos(a) * d, y = player.y + Math.sin(a) * d;
      if (!canStand(x, y)) continue;
      g.x = x; g.y = y; g.state = "patrol"; g.hunt = 0; noise(.6, 60, .45, .5); flicker(.6);
      say("Một tiếng rầm ở phía trước... Có thứ gì đó vừa chặn lối đi."); return true;
    }
    return false;
  },
  rage() {                                    // cuồng nộ
    const gs = ghosts.filter(q => q.floor === F.id); if (!gs.length) return false;
    for (const g of gs) { g._rage = 1.35; g.mul = (g.mul || 1) * 1.35; }
    DIR.rageEnd = t + 12; for (let i = 0; i < 10; i++) tone(55, i * .55, .25, .12, "sine");
    try { gvSub("...TA ĐANG ĐẾN...", "behind"); } catch (e) {}
    say("Tiếng gào xé tai! Nó đang điên cuồng — chạy hoặc trốn ngay!"); return true;
  },
  decoy() {                                   // tiếng động lạ dụ ma đi
    if (!ghosts.some(q => q.floor === F.id)) return false;
    for (let k = 0; k < 20; k++) {
      const p = randomFloor(10); if (!p) break;
      makeNoise(p.x, p.y, 60); noise(.25, 700, .35, .9); noise(.4, 180, .3, .6, .15);
      say("Choang! Có thứ gì rơi vỡ ở đâu đó rất xa... Nó đã bỏ đi tìm."); return true;
    }
    return false;
  },
  know() {                                    // nó biết bạn ở đâu
    if (!ghosts.some(q => q.floor === F.id) || player.hidden) return false;
    makeNoise(player.x, player.y, 99);
    try { gvSub(["...ta thấy ngươi rồi...", "...đừng trốn nữa...", "...ta biết ngươi ở đâu..."][Math.floor(Math.random() * 3)], "behind"); } catch (e) {}
    say("Một giọng thì thầm sát tai... Nó biết bạn đang ở đâu."); return true;
  },
  steps() {                                   // bước chân sau lưng
    for (let i = 0; i < 6; i++) noise(.07, 140 + i * 8, .18 + i * .05, .7, i * .32);
    setTimeout(() => { if (!S.ending) say("...Bạn quay phắt lại. Không có ai cả."); }, 2300); return true;
  },
};

gameStep = (o => function (dt) {
  o(dt);
  if (!S.started || S.ending || S.paused || !S.woke) return;
  if (NET.ok && !NET.host) return;
  const c = dirCfg();
  if (DIR.rageEnd && t > DIR.rageEnd) { DIR.rageEnd = 0; for (const g of ghosts) if (g._rage) { g.mul /= g._rage; g._rage = 0; } }
  // ma nhanh dần theo thời gian (sau khi thức giấc)
  const want = Math.min(c.cap, Math.max(0, ((S.playT || 0) - 180) / 60 * c.ramp));
  if (Math.abs(want - DIR.ramp) > .005) { for (const g of ghosts) g.mul = (g.mul || 1) * (1 + want) / (1 + DIR.ramp); DIR.ramp = want; }
  if (!DIR.next) DIR.next = t + c.gap[0] * .6 + Math.random() * 20;
  if (t < DIR.next || player.dead || GR?.on) return;
  const pool = Object.entries(c.w).filter(([k, w]) => w > 0 && k !== DIR.last).flatMap(([k, w]) => Array(w).fill(k));
  for (let tries = 0; tries < 4 && pool.length; tries++) {
    const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (DIR_EV[k]()) { DIR.last = k; break; }
  }
  const late = Math.min(1, Math.max(0, ((S.playT || 0) - 180) / 900));          // càng về sau càng dồn dập
  DIR.next = t + (c.gap[0] + Math.random() * (c.gap[1] - c.gap[0])) * (1 - late * .35);
})(gameStep);
// Ma mới sinh ra cũng nhanh theo mức hiện tại
spawnEnemy = (o => function (...a) { const n = ghosts.length, r = o.apply(this, a); for (let i = n; i < ghosts.length; i++) ghosts[i].mul = (ghosts[i].mul || 1) * (1 + DIR.ramp); return r; })(spawnEnemy);
startGame = (o => function (...a) { Object.assign(DIR, { next: 0, last: "", noLight: 0, rageEnd: 0, ramp: 0 }); return o.apply(this, a); })(startGame);
