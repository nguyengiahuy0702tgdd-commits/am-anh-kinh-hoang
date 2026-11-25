// =====================================================================
//  38. BẢN 25: phim mở đầu đi từ ngày đẹp trời → đêm ám ảnh · bày đồ tự nhiên, ít trùng lặp, nhiều đồ hơn · hết bóng nhòe chạy theo
// =====================================================================
// ---- Phim: cảnh đầu là ngày đẹp trời, nơi chốn còn nguyên vẹn; càng kể càng tối dần và ghê rợn ----
const FILM_DAY = [1, .9, .6, .32, .12];
buildFilm = (o => function (map) {
  const list = o(map); let j = 0;
  for (const sh of list) { if (sh.card) continue; if (!sh.raw) { sh.day = 0; j = Math.max(j, 3); continue; } sh.day = FILM_DAY[j++] ?? 0;
    if (sh.day > .5) { sh.fx = {}; sh.sfx = (sh.sfx || []).filter(([, k]) => k !== "whisper" && k !== "scream" && k !== "chain"); if (!sh.sfx.length) sh.sfx = [[.4, "birds"]]; } }
  return list;
})(buildFilm);
cutFrame = (o => function (dt) { const r = o(dt); if (r && CUT.sh) r.day = CUT.sh.day || 0; return r; })(cutFrame);
cutSfx = (o => function (k) { if (k !== "birds") return o(k); if (!ac) return; for (let i = 0; i < 7; i++) { const f0 = 2600 + Math.random() * 1400, d = i * .35 + Math.random() * .2; tone(f0, d, .09, .012, "sine"); tone(f0 * 1.18, d + .08, .08, .01, "sine"); } noise(3, 600, .05, .3); })(cutSfx);

// ---- Bày đồ: mỗi phòng không lặp một món quá 2 lần (đồ treo tường chỉ 1), món trùng ở gần nhau được đổi sang món khác cùng cỡ ----
const DUP_OK = /bed|crib|bench|pew|loom|machine|shelf|drum|box|crate|tomb|grave|cage|bag|pallet|barrel|grass|tree|stump|rock|log|fern|bush|cross|seat|stall|morgue|jar|locker|spool|rack/i;
for (const m in RCAT) for (const rk in RCAT[m]) { const C = RCAT[m][rk]; if (C[3] < 30) C[3] = Math.max(3, Math.round(C[3] * .78)); }   // nhiều đồ hơn
furnishRooms = (o => function (f) {
  o(f); const cat = RCAT[MAPID]; if (!cat) return;
  const roomKey = s => { const a = s.rot ?? 0, x = Math.floor(s.x + Math.cos(a) * .35), y = Math.floor(s.y + Math.sin(a) * .35), r = f.room[y * f.w + x]; return r || `${x >> 3},${y >> 3}`; };
  const slot = s => RMOUNT.has(s.k) ? 2 : s.wall ? 0 : 1;
  const pool = [[], [], []]; for (const rk in cat) for (let i = 0; i < 3; i++) for (const [k] of cat[rk][i]) if (k.startsWith("r_") && RMETA[k] && !pool[i].includes(k)) pool[i].push(k);
  const fits = (a, b) => { const A = RMETA[a], Bm = RMETA[b]; return A && Bm && Bm[0] <= A[0] + .05 && Bm[1] <= A[1] + .05; };
  const counts = new Map(), kept = [], drop = new Set();
  for (let i = 0; i < f.sprites.length; i++) {
    const s = f.sprites[i]; if (!s.deco || !s.k || s.k === "r_col" || s.k === "r_grass" || !(s.k.startsWith("r_") || s.k.startsWith("d_"))) continue;
    const key = roomKey(s); if (!counts.has(key)) counts.set(key, new Map()); const C = counts.get(key);
    const ok = k => { const lim = RMOUNT.has(k) ? 1 : DUP_OK.test(k) ? 99 : 2; if ((C.get(k) || 0) >= lim) return false; if (!DUP_OK.test(k) && kept.some(q => q.k === k && Math.hypot(q.x - s.x, q.y - s.y) < (RMOUNT.has(k) ? 6 : 3.2))) return false; return true; };
    if (!ok(s.k)) {
      const alt = s.k.startsWith("r_") ? pool[slot(s)].filter(k => k !== s.k && ok(k) && fits(s.k, k)).sort(() => Math.random() - .5)[0] : null;
      if (alt) s.k = alt; else { drop.add(i); for (let j = i + 1; j < f.sprites.length && f.sprites[j].k === "r_col" && f.sprites[j].deco; j++) drop.add(j); continue; }
    }
    C.set(s.k, (C.get(s.k) || 0) + 1); kept.push(s);
  }
  if (drop.size) f.sprites = f.sprites.filter((_, i) => !drop.has(i));
})(furnishRooms);
