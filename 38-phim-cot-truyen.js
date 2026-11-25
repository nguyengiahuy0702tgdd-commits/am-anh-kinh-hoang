// =====================================================================
//  35. BẢN 22: cốt truyện thành PHIM NGẮN (không còn màn chữ) · ẩn thanh đèn pin khi chưa nhặt · hình ảnh nét hơn
// =====================================================================
// ---- Ẩn thanh "Đèn pin" ở Bệnh viện cho tới khi nhặt được đèn ----
hospLive = (o => function (dt) {
  const hide = p => MAPID === "hospital" && p && !p.torch;
  for (const [id, p] of [["st1", P1], ["st2", P2]]) { const r = $(id)?.querySelector(".bt"); if (r) r.style.display = hide(p) ? "none" : ""; }
  return o(dt);
})(hospLive);

// ---- Phim cốt truyện: mỗi đoạn truyện là một cảnh quay lướt qua chính các khu vực của map ----
for (const m of Object.keys(ENEMY_MODEL)) ACTOR["_foe_" + m] = { enemy: m };
function filmViews(f, n) {
  const cols = f.sprites.filter(s => s.solid);
  const ok = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 1 || cy < 1 || cx >= f.w - 1 || cy >= f.h - 1 || f.grid[cy]?.[cx] !== ".") return false; for (const s of cols) if (Math.abs(s.x - x) < .75 && Math.abs(s.y - y) < .75 && Math.hypot(s.x - x, s.y - y) < (s.solid || .3) + .35) return false; return true; };
  const ray = (x, y, a, max = 16) => { const dx = Math.cos(a), dy = Math.sin(a); let r = 0; while (r < max && ok(x + dx * (r + .35), y + dy * (r + .35))) r += .35; return r; };
  const cand = []; for (const L of (f.labels || [])) cand.push([L[1], L[2]]); for (let i = 0; i < 80; i++) cand.push([1.5 + Math.random() * (f.w - 3), 1.5 + Math.random() * (f.h - 3)]);
  const out = [];
  for (const [x, y] of cand.sort(() => Math.random() - .5)) {
    if (!ok(x, y)) continue; let best = null;
    for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = ray(x, y, a); if (r < 5 || ray(x, y, a + Math.PI / 2, 2) < 1.1 || ray(x, y, a - Math.PI / 2, 2) < 1.1) continue; if (!best || r > best.r) best = { a, r }; }
    if (!best) continue;
    const mv = Math.min(1.4, best.r * .2), x1 = x + Math.cos(best.a) * mv, y1 = y + Math.sin(best.a) * mv; if (ray(x1, y1, best.a + Math.PI / 2, 1.5) < .8 || ray(x1, y1, best.a - Math.PI / 2, 1.5) < .8) continue;
    let sw = (Math.random() - .5) * .45; if (ray(x, y, best.a - sw) < best.r * .7 || ray(x, y, best.a + sw) < best.r * .7) sw = 0;
    const lr = Math.min(best.r, 9);
    out.push({ c0: [x, .78, y], c1: [x1, .7, y1], l0: [x + Math.cos(best.a - sw) * lr, .5, y + Math.sin(best.a - sw) * lr], l1: [x + Math.cos(best.a + sw) * lr, .46, y + Math.sin(best.a + sw) * lr], far: [x + Math.cos(best.a) * (Math.min(best.r, 8) - .9), y + Math.sin(best.a) * (Math.min(best.r, 8) - .9)] });
    if (out.length >= n) break;
  }
  return out;
}
function storyFilm(map) {
  const paras = (STORY[map]?.intro || []).map(p => p.replace(/<[^>]+>/g, "")); if (!paras.length) return [];
  const fl = Object.values(FLOORS).filter(f => f.w * f.h >= 150), shots = [], sfxs = ["wind", "whisper", "steps", "chain", "water"];
  const views = fl.map(f => ({ f, v: filmViews(f, Math.ceil(paras.length / fl.length) + 2) }));
  paras.forEach((p, i) => {
    const slot = views[i % views.length], v = slot.v[Math.floor(i / views.length) % Math.max(1, slot.v.length)]; const dur = Math.min(15, Math.max(6, p.length * .068));
    if (!v) { shots.push({ card: p, dur }); return; }
    const sh = { raw: 1, typ: 15, f: slot.f.id, dur, stamp: i === 0 ? MAPS[map].name.toUpperCase() : "", sub: p, cam: [v.c0, v.c1], look: [v.l0, v.l1], actors: [], lights: [{ x: v.far[0], y: v.far[1], h: .9, i: .35, r: .7, g: .75, b: 1, f: .6 }], sfx: [[.5, sfxs[i % sfxs.length]]], fx: {} };
    if (i === Math.floor(paras.length / 2) || i === paras.length - 2) { sh.actors.push({ st: "_foe_" + map, p: [v.far], face: "cam", t0: dur * .55, t1: dur * .8 }); sh.fx = { flicker: [dur * .5, dur * .85] }; sh.sfx.push([dur * .55, "whisper"]); }   // thoáng thấy bóng ma ở cuối khung hình
    shots.push(sh);
  });
  return shots;
}
// Thay màn chữ "Cốt truyện ..." bằng phim: cảnh truyện → cảnh dựng sẵn của map → vào game
playStory = (o => function (title, paras, done) {
  if (typeof title === "string" && title.startsWith("Cốt truyện")) { done(); return; }   // phần truyện đã được đưa vào phim
  return o(title, paras, done);
})(playStory);
playCutscene = (o => function (list, done) {
  if (list === CUTS[MAPID] && !CUT.film && !/replay=/.test(location.search)) { CUT.film = 1; list = storyFilm(MAPID).concat(list); }
  return o(list, done);
})(playCutscene);
