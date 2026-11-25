// =====================================================================
//  36. BẢN 23: phim cốt truyện dựng theo kịch bản (mỗi đoạn một bối cảnh đúng nội dung, không lộ mặt ma) · menu chọn map dạng ô vuông
// =====================================================================
// Kịch bản phim từng map: p = đoạn cốt truyện (theo STORY.intro), room = [tầng, tên khu vực], cut = dùng lại cảnh dựng sẵn (CUTS), card = màn chữ đen
// actors: at = [độ xa tính từ tâm khu vực về phía máy quay, lệch ngang]; walk = đi từ điểm a tới điểm b
const FILM = {
  house: [
    { p: 0, room: ["t1", "Phòng khách"], stamp: "1968", actors: [{ st: "hang", at: [.6, .5], face: "cam" }, { st: "camper2", at: [-.4, -.9], face: "girl" }] },
    { p: 1, room: ["t1", "Hành lang"], actors: [{ st: "hang", walk: [[1.5, .2], [-2.5, .2]] }, { st: "camper2", walk: [[2.6, -.3], [-1.2, -.3]] }], sfx: "steps" },
    { p: 2, room: ["b1", "Phòng chứa đồ"], fx: "flicker", sfx: "whisper" },
    { cut: 0, p: 3 }, { cut: 1 }, { cut: 2 }, { cut: 3 },
    { p: 4, room: ["b1", "Phòng thờ"], fx: "flicker", sfx: "chain" },
    { p: 5, room: ["t2", "Phòng bố mẹ"], sfx: "wind" },
    { p: 6, room: ["t2", "Phòng chơi"], sfx: "giggle" },
    { cut: 4 },
    { p: 7, room: ["t1", "Sảnh phụ"], sfx: "steps" },
    { p: 8, room: ["t1", "Sảnh chính"], fx: "red", sfx: "whisper" }],
  forest: [
    { p: 0, room: ["f1", "Trạm kiểm lâm"], stamp: "1979", actors: [{ st: "worker", at: [.4, .3], face: "away" }] },
    { p: 1, room: ["f1", "Cây cổ thụ"], fx: "red", sfx: "fire" },
    { p: 2, room: ["f1", "Bãi quạ"], sfx: "wind" },
    { p: 3, room: ["f1", "Giếng"], sfx: "water" },
    { p: 4, room: ["f1", "Miếu"], sfx: "wind" },
    { cut: 0, p: 6 }, { cut: 1 }, { cut: 2 },
    { p: 7, room: ["f1", "Lửa trại"], fx: "flicker", sfx: "wind" },
    { card: 5 },
    { p: 8, room: ["f1", "Xe"], sfx: "wind" },
    { cut: 5 }],
  castle: [
    { p: 3, room: ["c1", "Phòng ăn"], stamp: "1861" },
    { p: 0, room: ["c1", "Ngai vàng"] },
    { p: 4, room: ["c1", "Thư viện"], sfx: "whisper" },
    { p: 1, room: ["c1", "Hành lang chân dung"], actors: [{ st: "maid", at: [.3, .4], face: "away" }] },
    { p: 2, room: ["c1", "Ngục tối"], fx: "flicker", sfx: "chain" },
    { cut: 0 }, { cut: 2 },
    { cut: 3, p: 6 },
    { p: 5, room: ["c1", "Kho vũ khí"], stamp: "1874" },
    { p: 7, room: ["c1", "Hành lang chính"], sfx: "chain" },
    { p: 8, room: ["c1", "Đại sảnh"], sfx: "wind" }],
  cemetery: [
    { p: 0, room: ["g1", "Nhà thờ"], actors: [{ st: "bride", at: [.5, .5], face: "cam" }, { st: "camper2", at: [.2, -.7], face: "girl" }] },
    { cut: 0 }, { cut: 1, p: 1 }, { cut: 2 },
    { p: 2, room: ["g1", "Khu mộ cũ"], sfx: "wind" },
    { p: 3, room: ["g1", "Nhà gác mộ"], sfx: "chain" },
    { p: 4, room: ["g1", "Khu mộ vô danh"], stamp: "1975", sfx: "water" },
    { p: 5, room: ["g1", "Khu mộ trẻ em"], sfx: "whisper" },
    { cut: 3, p: 7 },
    { p: 6, room: ["g1", "Khu mộ mới"], sfx: "wind" },
    { p: 8, room: ["g1", "Cổng"], stamp: "0:00", sfx: "chain" }],
  factory: [
    { p: 0, room: ["x1", "Xưởng sản xuất"], stamp: "1991", actors: [{ st: "worker", at: [.4, .6], face: "away" }, { st: "worker", at: [-.8, -.7], face: "away" }] },
    { cut: 0 },
    { p: 1, room: ["x1", "Thay đồ"], sfx: "steps" },
    { cut: 1, p: 2 }, { cut: 2 },
    { p: 3, room: ["x1", "Quản đốc"], fx: "red", sfx: "fire" },
    { p: 4, room: ["x1", "Hành lang kỹ thuật"], fx: "flicker", sfx: "chain" },
    { p: 5, room: ["x1", "Nhà ăn công nhân"], sfx: "whisper" },
    { cut: 4 },
    { p: 6, room: ["x1", "Thang hàng"], sfx: "steps" },
    { p: 7, room: ["x1", "Phòng kế toán"] },
    { p: 8, room: ["x1", "Phòng sửa chữa"], fx: "flicker", sfx: "chain" }],
  hospital: [
    { p: 0, room: ["h1", "Sảnh chính"], stamp: "1979", actors: [{ st: "patient", at: [.2, .7], face: "cam" }, { st: "patient", at: [-.6, -.8], face: "away" }] },
    { p: 1, room: ["h1", "Phòng chờ"], actors: [{ st: "camper2", at: [.5, -.4], face: "cam" }, { st: "doctorK", at: [-.2, .5], face: "girl" }] },
    { cut: 0, p: 2 },
    { cut: 1, p: 3 },
    { p: 4, room: ["h2", "Phòng tiêu bản"], fx: "flicker", sfx: "whisper" },
    { cut: 3, p: 5 },
    { p: 6, room: ["h1", "Phòng hồ sơ"], sfx: "wind" },
    { card: 7 },
    { p: 8, room: ["h1", "Hành lang chính"], fx: "flicker", sfx: "steps" },
    { card: "Khi bạn mở mắt ra, bạn đang nằm trên một chiếc giường bệnh." }],
};
ACTOR.hang = { k: .35, o: () => ({ skin: T.skinA, face: T.faceKid, top: T.clWhite, bottom: T.skinA, shoe: T.clBlack, hair: T.hairT, hairLen: "long", skirt: { m: T.clWhite, y0: .45, r: .27 } }) };   // bé Hằng năm 1968 (khác bé Linh)
const isFoe = st => !!ACTOR[st]?.enemy || st === "brideghost";
function noFoes(sh) {   // không cho lộ hình dạng ma trước khi vào game
  if (sh.card || !sh.actors) return sh; const a = sh.actors.filter(x => !isFoe(x.st)); const o = { ...sh, actors: a };
  if (o.fx && o.fx.scare != null) { o.fx = { ...o.fx }; delete o.fx.scare; }
  return o;
}
// Khung hình thiết lập: máy quay đặt ở mép khu vực, nhìn vào giữa, từ từ tiến vào
function roomView(f, name) {
  const L = (f.labels || []).find(l => l[0] === name); if (!L) return null;
  const cols = f.sprites.filter(s => s.solid), lx = L[1], ly = L[2];
  const ok = (x, y) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 1 || cy < 1 || cx >= f.w - 1 || cy >= f.h - 1 || f.grid[cy]?.[cx] !== ".") return false; for (const s of cols) if (Math.abs(s.x - x) < .8 && Math.abs(s.y - y) < .8 && Math.hypot(s.x - x, s.y - y) < (s.solid || .3) + .3) return false; return true; };
  const clear = (x0, y0, x1, y1) => { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .3); for (let i = 1; i < n; i++) { const u = i / n; if (!ok(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)) return false; } return true; };
  let tx = lx, ty = ly; if (!ok(tx, ty)) { let bd = 9; for (let dy = -3; dy <= 3; dy += .5) for (let dx = -3; dx <= 3; dx += .5) if (ok(lx + dx, ly + dy) && Math.hypot(dx, dy) < bd) { bd = Math.hypot(dx, dy); tx = lx + dx; ty = ly + dy; } }
  let best = null;
  for (let k = 0; k < 32; k++) for (const r of [6, 5, 4, 3.2, 2.5]) {
    const a = k / 32 * Math.PI * 2, x = tx + Math.cos(a) * r, y = ty + Math.sin(a) * r;
    if (!ok(x, y) || !clear(x, y, tx, ty)) continue; let side = 0; const px = -Math.sin(a), py = Math.cos(a); if (ok(x + px * .7, y + py * .7)) side++; if (ok(x - px * .7, y - py * .7)) side++;
    const sc = r + side * .8 + Math.random() * .6; if (!best || sc > best.sc) best = { sc, x, y, r }; break;
  }
  if (!best) return null;
  const dx = (tx - best.x) / best.r, dy = (ty - best.y) / best.r, push = Math.min(1.3, best.r * .3), far = Math.max(2, Math.min(9, best.r + 3));
  let fx = tx + dx * (far - best.r), fy = ty + dy * (far - best.r); if (!clear(tx, ty, fx, fy)) { fx = tx; fy = ty; }
  return { f, cx: tx, cy: ty, dx, dy, c0: [best.x, .76, best.y], c1: [best.x + dx * push, .7, best.y + dy * push], l0: [tx + (fx - tx) * .4 - dy * .25, .5, ty + (fy - ty) * .4 + dx * .25], l1: [tx + (fx - tx) * .4 + dy * .25, .45, ty + (fy - ty) * .4 - dx * .25], ok };
}
const FSFX = { steps: "steps", whisper: "whisper", wind: "wind", chain: "chain", water: "water", fire: "fire", giggle: "giggle" };
function buildFilm(map) {
  const paras = (STORY[map]?.intro || []).map(p => p.replace(/<[^>]+>/g, "")), base = CUTS[map] || [], plan = FILM[map], out = [], used = new Set();
  if (!plan) return base.map(noFoes);
  const rd = txt => Math.min(15, Math.max(5, txt.length * .066));
  for (const b of plan) {
    if (b.card != null) { const txt = typeof b.card === "number" ? paras[b.card] : b.card; if (txt) out.push({ card: txt, dur: Math.max(3.4, rd(txt) * .85) }); continue; }
    if (b.cut != null) { const c = base[b.cut]; if (!c) continue; const sh = noFoes({ ...c }); if (b.p != null && paras[b.p]) { sh.sub = paras[b.p]; sh.typ = 15; sh.dur = Math.max(c.dur || 6, rd(sh.sub)); if (sh.card) sh.card = sh.sub; } out.push(sh); continue; }
    const txt = paras[b.p]; if (!txt) continue; const f = FLOORS[b.room[0]], v = f && !used.has(b.room.join()) && roomView(f, b.room[1]); used.add(b.room.join());
    if (!v) { out.push({ card: txt, dur: rd(txt) }); continue; }
    const dur = rd(txt), P = ([al, la]) => { const x = v.cx - v.dx * al - v.dy * la, y = v.cy - v.dy * al + v.dx * la; return v.ok(x, y) ? [x, y] : [v.cx, v.cy]; };
    const actors = (b.actors || []).map(a => { const p = a.walk ? a.walk.map(P) : [P(a.at)]; const face = a.face === "cam" ? "cam" : a.face === "away" ? [p[0][0] + v.dx * 3, p[0][1] + v.dy * 3] : a.face === "girl" && b.actors[0] ? P(b.actors[0].at || b.actors[0].walk[0]) : undefined; return { st: a.st, p, face, light: a.light }; });
    const fx = b.fx === "flicker" ? { flicker: [dur * .45, dur] } : b.fx === "red" ? { red: [dur * .3, dur], flicker: [dur * .6, dur * .8] } : {};
    out.push({ raw: 1, typ: 15, f: f.id, dur, stamp: b.stamp || "", sub: txt, cam: [v.c0, v.c1], look: [v.l0, v.l1], actors, fx,
      lights: [{ x: v.cx, y: v.cy, h: 1.3, i: .32, r: 1, g: .8, b: .6, f: .9 }, { x: v.cx + v.dx * 3, y: v.cy + v.dy * 3, h: 1, i: .3, r: .6, g: .7, b: 1, f: .6 }], sfx: b.sfx ? [[.6, FSFX[b.sfx]]] : [] });
  }
  return out;
}
playCutscene = (o => function (list, done) {
  if (list === CUTS[MAPID]) list = (/replay=/.test(location.search) ? CUTS[MAPID].map(noFoes) : buildFilm(MAPID)).filter(s => s.card || s.sub || (s.actors && s.actors.length) || s.raw);
  return o(list, done);
})(playCutscene);
// Bản 22 đã chèn phim tự động — tắt để chỉ dùng kịch bản ở trên
storyFilm = () => [];

// ---------------- MENU CHỌN MAP DẠNG Ô VUÔNG ----------------
(() => { const st = document.createElement("style"); st.textContent = `
  #mapSel { display: flex !important; flex-direction: column; align-items: center !important; justify-content: flex-start !important; gap: 2.2vh; padding: 6vh 4vw 4vh !important; overflow-y: auto; }
  #mapSel.hidden { display: none !important; }
  #mapSel .hdr { align-self: center; text-align: center; margin: 0 !important; }
  #mapCards.tiles { align-self: center !important; display: flex !important; flex-direction: row !important; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: clamp(10px, 1.3vw, 22px); width: min(1240px, 94vw); margin: 0 !important; padding: 6px 0 !important; }
  #mapCards.tiles a { position: relative; display: block; width: clamp(128px, 13vw, 188px); aspect-ratio: 1 / 1; padding: 0 !important; margin: 0 !important; border: 2px solid rgba(255,255,255,.12); border-radius: 14px; overflow: hidden; background: #070505;
    box-shadow: 0 10px 26px rgba(0,0,0,.6); transition: transform .18s, border-color .18s, box-shadow .18s; cursor: pointer; font-size: 0 !important; animation: none !important; transform: none !important; text-shadow: none !important; }
  #mapCards.tiles a::before { display: none !important; content: none !important; }
  #mapCards.tiles a canvas { position: absolute; inset: 0; width: 100%; height: 100%; filter: saturate(.85) brightness(.75); transition: filter .2s, transform .4s; }
  #mapCards.tiles a:hover { transform: translateY(-5px) !important; border-color: rgba(255,90,70,.55); }
  #mapCards.tiles a:hover canvas { filter: saturate(1) brightness(.95); transform: scale(1.05); }
  #mapCards.tiles a.sel { border-color: var(--blood, #b01010); box-shadow: 0 0 0 2px rgba(190,20,10,.35), 0 0 30px rgba(200,10,0,.45), 0 12px 30px rgba(0,0,0,.7); transform: translateY(-5px) !important; }
  #mapCards.tiles a.sel canvas { filter: saturate(1.05) brightness(1); }
  #mapCards.tiles a .tn { position: absolute; left: 0; right: 0; bottom: 0; padding: 26px 10px 10px; background: linear-gradient(transparent, rgba(0,0,0,.92)); color: #eadfd6; font-size: clamp(13px, 1.05vw, 16px); font-weight: 700; line-height: 1.25; text-align: left; letter-spacing: .02em; text-shadow: 0 1px 3px #000; }
  #mapCards.tiles a .ti { position: absolute; left: 10px; top: 8px; color: rgba(255,255,255,.55); font-size: 11px; letter-spacing: .15em; }
  #mapCards.tiles a.hardMap { border-color: rgba(255,40,30,.7); animation: hardTile 2.4s infinite !important; }
  #mapCards.tiles a.hardMap .tn { color: #ff6a5a; }
  #mapCards.tiles a .hb { position: absolute !important; right: 8px; top: 7px; margin: 0 !important; font-size: 11px !important; }
  @keyframes hardTile { 50% { box-shadow: 0 0 26px rgba(255,0,0,.55), 0 12px 30px rgba(0,0,0,.7); } }
  #mapCards.tiles a[data-id=forest] canvas { filter: brightness(1.9) saturate(1.1); } #mapCards.tiles a[data-id=forest]:hover canvas, #mapCards.tiles a[data-id=forest].sel canvas { filter: brightness(2.3) saturate(1.15); }
  #mapSel .info { position: static !important; width: min(1100px, 92vw) !important; max-height: none !important; display: flex !important; gap: 40px; align-items: flex-start; border-left: none !important; border-top: 3px solid var(--blood, #b01010); border-radius: 0 0 16px 16px !important; }
  #mapSel .info .colA { flex: 1.3; min-width: 0; } #mapSel .info .colB { flex: 1; min-width: 0; border-left: 1px solid rgba(255,60,40,.18); padding-left: 32px; } #mapSel .info .colB .hdr2:first-child { margin-top: 4px; }
  #mapSel .sbar { position: static !important; width: min(1100px, 92vw); max-width: none !important; display: flex; justify-content: space-between; align-items: center; }
  @media (max-width: 760px) { #mapSel .info { flex-direction: column; } #mapSel .info .colB { border-left: none; padding-left: 0; } }`; document.head.appendChild(st); })();
const TILE = { cv: [], t0: performance.now() };
function tileArt() {
  if (!$("mapSel") || $("mapSel").classList.contains("hidden") || !TILE.cv.length) return;
  const c0 = BG.c, m0 = BG.map, tt = (performance.now() - TILE.t0) / 1000;
  try { for (const [id, c] of TILE.cv) { BG.c = c; BG.map = id; drawBackdrop(tt + id.length); } } catch (e) {} finally { BG.c = c0; BG.map = m0; }
}
setInterval(tileArt, 90);
buildMenus = (o => function () { o();
  const list = $("mapCards"); list.classList.add("tiles"); TILE.cv = [];
  const info = document.querySelector("#mapSel .info"); if (info && !info.querySelector(".colA")) { const A = document.createElement("div"), Bc = document.createElement("div"); A.className = "colA"; Bc.className = "colB"; let toB = false; for (const n of [...info.childNodes]) { if (n.nodeType === 1 && n.classList.contains("hdr2")) toB = true; (toB ? Bc : A).appendChild(n); } info.append(A, Bc); }
  [...list.children].forEach((a, i) => { const id = a.dataset.id, badge = a.querySelector(".hb"); a.textContent = ""; const c = document.createElement("canvas"); c.width = 220; c.height = 220; a.appendChild(c); TILE.cv.push([id, c]);
    const n = document.createElement("span"); n.className = "ti"; n.textContent = String(i + 1).padStart(2, "0"); const tn = document.createElement("span"); tn.className = "tn"; tn.textContent = MAPS[id].name; a.append(n, tn); if (badge) a.appendChild(badge); a.title = MAPS[id].tag || ""; });
  tileArt();
})(buildMenus);
buildMenus();
