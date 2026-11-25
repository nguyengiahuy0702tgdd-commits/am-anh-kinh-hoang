// =====================================================================
//  20. BẢN 6: nhân vật 3D dáng người thật · phim mở đầu · chơi online 2 máy
// =====================================================================
const XSp = (X, px, py, pz, sx, sy, sz) => ({ p: (x, y, z) => X.p(px + (x - px) * sx, py + (y - py) * sy, pz + (z - pz) * sz), n: (x, y, z) => X.n(x / sx, y / sy, z / sz) });
function limb(v, J, x, z, yTop, yBot, rTop, rBot, m, seg = 9) { pcyl(v, J, x, z, yBot, yTop, rBot, rTop, seg, m, m); }
// Cơ thể người theo tỉ lệ thật (đơn vị mét, cao ~1,78) — thu nhỏ bằng tham số k của XF
function humanoid(v, X, o, a = {}) {
  const w = o.slim ?? 1, sk = o.skin || T.skinA, top = o.top || T.coatT, bot = o.bottom || T.jeansT, shoe = o.shoe || T.dark, sw = a.sw || 0, sit = a.sit || 0;
  for (const sx of [-1, 1]) {   // chân: đùi – gối – cẳng – bàn chân
    const hx = sx * .095, L = XL(X, hx, .92, 0, sit ? -1.45 : -sw * sx, sx * .015);
    limb(v, L, hx, 0, .95, .5, .08 * w, .053 * w, bot);
    const kb = sit ? 1.45 : Math.max(0, Math.sin((a.ph || 0) + (sx > 0 ? 0 : Math.PI) + 1.3)) * Math.min(.85, Math.abs(sw) * 1.5) + (a.knee || 0);
    const Kn = XL(L, hx, .5, 0, kb); psphere(v, Kn, hx, .5, .004, .053 * w, 7, bot);
    limb(v, Kn, hx, 0, .5, .085, .05 * w, .036 * w, o.legs || bot);
    psphere(v, XSp(Kn, hx, .05, .045, .72, .55, 1.75), hx, .05, .045, .062, 8, shoe);
  }
  psphere(v, XSp(X, 0, .93, 0, 1.22, .78, .86), 0, .93, 0, .14 * w, 9, bot);   // hông
  if (o.skirt) pcyl(v, X, 0, 0, o.skirt.y0, .98, o.skirt.r + Math.sin(t * 2.3 + (a.ph || 0)) * .012, .165 * w, 18, o.skirt.m, o.skirt.m);
  const B = XL(X, 0, .92, 0, a.hunch || 0, a.lean || 0);
  pcyl(v, XSp(B, 0, 0, 0, 1, 1, .64), 0, 0, .9, 1.4, (.152 + (o.belly || 0) * .05) * w, .19 * w, 14, top, top);   // thân
  psphere(v, XSp(B, 0, 1.4, 0, 1.13, .48, .64), 0, 1.4, 0, .19 * w, 12, top);                                      // vai
  if (o.belly) psphere(v, XSp(B, 0, 1.1, .05, 1.05, 1, .95), 0, 1.1, .07, .22, 12, top);
  if (o.apron) pbox(v, B, -.2, .55, .13 + (o.belly ? .13 : 0), .2, 1.36, .15 + (o.belly ? .13 : 0), o.apron);
  if (o.collar) pcyl(v, B, 0, 0, 1.4, 1.47, .09, .075, 10, o.collar, o.collar);
  limb(v, B, 0, 0, 1.58, 1.42, .046 * w, .054 * w, o.neck || sk);
  const H = XL(B, 0, 1.52, 0, a.headAx || 0, a.headAz || 0);
  if (o.mask) { psphere(v, H, 0, 1.67, .01, .135, 12, o.mask, 1.12); pcyl(v, H, 0, .01, 1.53, 1.6, .1, .095, 10, T.rope || T.dark, T.rope || T.dark); }
  else {
    psphere(v, H, 0, 1.64, .012, .112, 14, o.face, 1.18);
    if (o.hair) {
      psphere(v, H, 0, 1.69, -.024, .118, 12, o.hair, 1.02);
      if (o.hairLen === "long") pcyl(v, H, 0, -.035, 1.18, 1.71, .175, .118, 14, o.hair, o.hair, Math.PI * .6, Math.PI * 1.4);
      if (o.hairLen === "bun") psphere(v, H, 0, 1.76, -.1, .066, 9, o.hair);
      if (o.faceHair) for (const x of [-.075, -.04, -.01, .025, .06]) pbox(v, XL(H, x, 1.74, .12, Math.sin(t * 1.6 + x * 30) * .04), x - .016, 1.34 + Math.abs(x) * 1.6, .108, x + .016, 1.74, .126, o.hair);
    }
  }
  if (o.horns) for (const sx of [-1, 1]) { limb(v, H, sx * .07, 0, 2.05, 1.72, .012, .02, o.horns, 5); limb(v, XL(H, sx * .07, 1.9, 0, 0, sx * -.9), sx * .07, 0, 2.08, 1.9, .008, .013, o.horns, 5); limb(v, XL(H, sx * .07, 1.98, 0, 0, sx * .7), sx * .07, 0, 2.18, 1.98, .007, .011, o.horns, 5); }
  for (const sx of [-1, 1]) {   // tay: vai – khuỷu – cẳng – bàn tay
    const ax = sx < 0 ? (a.armL ?? sw * .8) : (a.armR ?? -sw * .8), A = XL(B, sx * .215, 1.4, 0, ax, sx * (a.armZ ?? .07));
    limb(v, A, sx * .215, 0, 1.43, 1.14, .05 * w, .04 * w, o.sleeve || top); psphere(v, A, sx * .215, 1.13, 0, .04 * w, 7, o.sleeve || top);
    const E = XL(A, sx * .215, 1.13, 0, sx < 0 ? (a.elL ?? -.18) : (a.elR ?? -.18));
    limb(v, E, sx * .215, 0, 1.13, .9, .04 * w, .031 * w, o.fore || sk);
    psphere(v, XSp(E, sx * .215, .86, 0, .72, 1.3, 1), sx * .215, .86, 0, .042, 7, o.hand || sk);
    if (o.claws) for (let k = -1; k <= 1; k++) limb(v, XL(E, sx * .215, .83, 0, Math.sin(t * 6 + k + sx) * .18), sx * .215 + k * .014, 0, .84, .68, .009, .004, o.hand || sk, 4);
    if (sx > 0 && o.prop) propAt(v, E, sx * .215, .84, o.prop);
    if (sx < 0 && o.propL) propAt(v, E, sx * .215, .84, o.propL);
  }
}
function propAt(v, E, x, y, kind) {
  if (kind === "cleaver") { pbox(v, E, x - .016, y - .13, -.016, x + .016, y + .02, .016, T.darkwood); pbox(v, E, x - .006, y - .44, -.01, x + .006, y - .12, .15, T.metal); }
  else if (kind === "doll") { psphere(v, E, x, y - .07, .07, .05, 7, T.skinA); pcyl(v, E, x, .07, y - .26, y - .1, .07, .03, 9, T.clPink, T.clPink); }
  else if (kind === "candle") { pcyl(v, E, x, .04, y - .02, y + .12, .022, .022, 7, T.wax, T.wax); psphere(v, E, x, y + .15, .04, .02, 5, T.flame); }
  else if (kind === "torch") { pbox(v, E, x - .012, y - .12, .02, x + .012, y + .03, .05, T.metal); pcyl(v, E, x, .035, y - .14, y - .12, .03, .02, 7, T.bulbOn, T.bulbOn); }
  else if (kind === "comb") pbox(v, E, x - .05, y - .03, .02, x + .05, y + .01, .03, T.bone || T.paperSheet);
}
const walkAnim = (g, k = .45) => { const sp = gait(g); return { sw: Math.sin(g.ph) * Math.min(.55, sp * k), ph: g.ph, sp }; };
const HUM_K = { house: .37, forest: .5, castle: .48, cemetery: .47, factory: .52 };
Object.assign(FACE_H, { house: 1.64 * .37 + .05, forest: 1.64 * 1.16 * .5, castle: 1.64 * .48 + .06, cemetery: 1.5 * .47, factory: 1.67 * .52 });
// Bé gái ma: lơ lửng, tóc che mặt, tay vươn ra khi đuổi
function ghostModel(v, g) {
  const lk = facing(Math.atan2(player.y - g.y, player.x - g.x)), chase = g.scare || (CHASING && Math.hypot(g.x - player.x, g.y - player.y) < D.range);
  const X = XF(g.x + (Math.random() - .5) * .006, (g.yo || 0) + .05 + Math.sin(t * 2.2 + g.x) * .03, g.y, lk.c, lk.s, HUM_K.house);
  humanoid(v, X, { skin: T.skin, face: T.ghostFace, top: T.dress, bottom: T.skin, shoe: T.skin, hair: T.hair, hairLen: "long", faceHair: true, skirt: { m: T.dress, y0: .3, r: .34 }, slim: .85, claws: true },
    { armL: chase ? -1.4 + Math.sin(t * 9) * .12 : Math.sin(t * 1.4) * .08, armR: chase ? -1.35 + Math.sin(t * 9 + 1) * .12 : Math.sin(t * 1.4 + 2) * .08, knee: .25, headAx: chase ? .3 : .15, headAz: twitch(g), hunch: chase ? .12 : .03 });
}
// Ma Rừng: gầy, cao vừa người, tay dài, gạc cây trên đầu
function stalkerModel(v, g) {
  const an = walkAnim(g, .35), lk = facing(Math.atan2(player.y - g.y, player.x - g.x)), seen = g.stare > .1;
  const X = XSp(XF(g.x, g.yo || 0, g.y, lk.c, lk.s, HUM_K.forest), 0, 0, 0, 1, 1.16, 1), M = T.stalkerSkin;
  humanoid(v, X, { skin: M, face: T.stalkerFace, top: M, bottom: M, shoe: M, slim: .62, claws: true, horns: T.deadwood },
    { sw: seen ? 0 : an.sw, ph: an.ph, armL: g.scare ? -1.4 : (seen ? .05 : an.sw * 1.1) + Math.sin(t * 1.7) * .05, armR: g.scare ? -1.4 : (seen ? .05 : -an.sw * 1.1), elL: -.05, elR: -.05, hunch: .1, headAz: seen ? Math.sin(t * .5) * .55 : twitch(g, 4) * .5, headAx: .08 });
}
// Nữ Bá Tước: váy dài chạm đất, tóc búi, móng xương
function countessModel(v, g) {
  const lk = facing(Math.atan2(player.y - g.y, player.x - g.x)), hunt = g.scare || g.hunt > t;
  const X = XF(g.x, (g.yo || 0) + .05 + Math.sin(t * 1.8) * .03, g.y, lk.c, lk.s, HUM_K.castle);
  humanoid(v, X, { skin: T.skin, face: T.countessFace, top: T.gown, bottom: T.gown, shoe: T.gown, hair: T.hair, hairLen: "bun", skirt: { m: T.gown, y0: 0, r: .48 }, collar: T.gown, slim: .85, claws: true, hand: T.bone },
    { armL: hunt ? -1.45 + Math.sin(t * 5) * .1 : Math.sin(t * 1.2) * .06, armR: hunt ? -1.4 + Math.sin(t * 5 + 2) * .1 : Math.sin(t * 1.2 + 2) * .06, headAx: hunt ? .15 : -.05, headAz: hunt ? 0 : Math.sin(t * .7) * .35 + twitch(g, 5) * .3, lean: Math.sin(t * .8) * .04 });
}
// Xác sống: lê bước, lưng còng, tay giơ phía trước
function zombieModel(v, g) {   // tên cũ giữ nguyên để mọi nơi gọi tới đều vẽ "vong"
  const r = Math.min(1, g.rise ?? 1), lk = facing(Math.atan2(player.y - g.y, player.x - g.x)), hunt = g.scare || g.st2 === "hunt";
  if (!g.scare && g.blink > t) return;
  const lift = (.32 + Math.sin(t * 1.7 + g.x * 3) * .07) * r - (1 - r) * 1.6, X = XF(g.x, (g.yo || 0) + lift * HUM_K.cemetery, g.y, lk.c, lk.s, HUM_K.cemetery);
  const cloth = T.vongCloth || T.whiteDress || T.clWhite;
  humanoid(v, X, { skin: T.vongFace || T.skin, face: T.vongFace || T.zombieFace, top: cloth, bottom: cloth, shoe: cloth, hair: T.hair, hairLen: "long", skirt: { m: cloth, y0: 0, r: .34 }, slim: .78, claws: true, hand: T.vongFace || T.skin },
    { armL: hunt ? -1.35 + Math.sin(t * 4) * .12 : -.15 + Math.sin(t * 1.1) * .1, armR: hunt ? -1.3 + Math.sin(t * 4 + 1.5) * .12 : -.1 + Math.sin(t * 1.1 + 2) * .1, headAx: hunt ? .1 : .35, headAz: Math.sin(t * .9 + g.y) * .3 + twitch(g, 4) * .35, lean: hunt ? .18 : .05 });
  for (let i = 0; i < 9; i++) {   // vạt áo rách tả tơi bay phất phơ bên dưới
    const a = i / 9 * 6.283, sw = Math.sin(t * 3 + i * 1.7) * .25, Q = XL(X, Math.cos(a) * .3, .02, Math.sin(a) * .3, sw + (hunt ? -.4 : 0), Math.cos(t * 2.3 + i) * .2);
    pbox(v, Q, Math.cos(a) * .3 - .05, -.35 - (i % 3) * .12, Math.sin(a) * .3 - .01, Math.cos(a) * .3 + .05, .04, Math.sin(a) * .3 + .01, cloth);
  }
}
// Gã Đồ Tể: bụng phệ, tạp dề da, đầu trùm bao tải, dao phay
function butcherModel(v, g) {
  const an = walkAnim(g, .3), fd = g.scare ? facing(Math.atan2(player.y - g.y, player.x - g.x)) : faceDir(g), chase = g.scare || g.state === "chase";
  const X = XF(g.x, (g.yo || 0) + Math.abs(Math.sin(g.ph || 0)) * .02, g.y, fd.c, fd.s, HUM_K.factory);
  humanoid(v, X, { skin: T.skin, top: T.shirt, bottom: T.shirt, shoe: T.dark, mask: T.sack, belly: 1, apron: T.apron, slim: 1.25, prop: "cleaver" },
    { sw: an.sw, ph: an.ph, armL: -an.sw * 1.1 + (chase ? -.5 : 0), armR: chase ? -2.6 + Math.max(0, Math.sin(t * 9)) * 2.2 : an.sw * 1.1, hunch: chase ? .14 : .05, headAz: twitch(g, 6) * .25 });
}
// Người chơi còn lại
function survivorModel(v, p) {
  const { c, s } = facing(p.a), base = XF(p.x, (p.jy || 0) - (p.crH || 0) * .14, p.y, c, s, .46), X = p.dead ? XL(base, 0, .05, 0, -1.45, 0) : base, sw = Math.sin(p.bob * .5) * (p.running ? .55 : .35) * (p.moving ? 1 : 0);
  humanoid(v, X, { skin: T.skinA, face: T.faceA, top: T.coatT, bottom: T.jeansT, hair: T.hairT, prop: p.lightOn && !p.dead ? "torch" : null }, { sw, ph: p.bob * .5, armR: -1.3, elR: -.1, knee: (p.crH || 0) * 1.1, hunch: (p.crH || 0) * .3 });
}

// ---- Texture cho người sống (phim mở đầu & người chơi) ----
function buildPeopleTextures() {
  const face = (skin, lip, kid) => tex(g => { R(g, 0, 0, 128, 128, skin); const sh = g.createRadialGradient(64, 58, 10, 64, 64, 70); sh.addColorStop(0, "rgba(255,230,210,.18)"); sh.addColorStop(1, "rgba(40,20,10,.35)"); g.fillStyle = sh; g.fillRect(0, 0, 128, 128);
    for (const x of [54, 74]) { E(g, x, 58, 5, kid ? 4 : 3, "#f2ece6"); E(g, x, 58, 2.4, 2.4, "#24160e"); R(g, x - 6, 51, 12, 2, "#3a2418"); }
    R(g, 63, 60, 2, 12, "rgba(90,50,35,.35)"); E(g, 64, 80, kid ? 5 : 7, 2.2, lip); }, null);
  T.skinA = tex(g => { R(g, 0, 0, 128, 128, "#c49c84"); for (let i = 0; i < 300; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, "rgba(120,70,50,.18)"); }); T.faceA = face("#c4a08a", "#8a4a44"); T.faceKid = face("#d8b6a0", "#b45a5a", 1);
  const cloth = (c, k = 0) => tex(g => { R(g, 0, 0, 128, 128, c); for (let i = 0; i < 70; i++) R(g, rnd() * 128, rnd() * 128, 1, 3 + rnd() * 8, "rgba(0,0,0,.18)"); if (k) for (let y = 0; y < 128; y += 16) R(g, 0, y, 128, 2, "rgba(255,255,255,.12)"); });
  T.clPink = cloth("#b0707e", 1); T.clWhite = cloth("#d8d4cc"); T.clBlack = cloth("#16141a"); T.clGreen = cloth("#3a4a32"); T.clBlue = cloth("#34465a"); T.clRed = cloth("#6a1c1c");
}

// ---- PHIM MỞ ĐẦU: dựng bằng chính bối cảnh 3D của map ----
const ACTOR = {
  linh: { k: .36, o: () => ({ skin: T.skinA, face: T.faceKid, top: T.clPink, bottom: T.skinA, shoe: T.clRed, hair: T.hairT, hairLen: "long", skirt: { m: T.clPink, y0: .48, r: .28 }, propL: "doll" }) },
  ghostgirl: { enemy: "house" },
  camper: { k: .46, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clGreen, bottom: T.jeansT, hair: T.hairT }) },
  camper2: { k: .45, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clRed, bottom: T.jeansT, hair: T.hairT, hairLen: "long" }) },
  maid: { k: .44, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clBlack, bottom: T.clBlack, hair: T.hairT, hairLen: "bun", skirt: { m: T.clBlack, y0: .04, r: .34 }, apron: T.clWhite, prop: "candle" }) },
  bride: { k: .45, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clWhite, bottom: T.clWhite, shoe: T.clWhite, hair: T.hairT, hairLen: "long", skirt: { m: T.clWhite, y0: .12, r: .24 }, prop: "comb" }) },
  brideghost: { k: .45, o: () => ({ skin: T.skin, face: T.ghostFace, top: T.clWhite, bottom: T.clWhite, shoe: T.clWhite, hair: T.hair, hairLen: "long", faceHair: true, skirt: { m: T.clWhite, y0: .05, r: .3 }, claws: true }) },
  worker: { k: .46, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clBlue, bottom: T.clBlue, hair: T.hairT }) },
  stalker: { enemy: "forest" }, countess: { enemy: "castle" }, butcher: { enemy: "factory" }, zombie: { enemy: "cemetery" },
};
const ENEMY_MODEL = { house: ghostModel, forest: stalkerModel, castle: countessModel, cemetery: zombieModel, factory: butcherModel };
const CUTS = {
  house: [
    { f: "t1", dur: 6.5, stamp: "13/10/2016 · 23:47", sub: "Căn nhà số 13. Đêm hôm ấy, cả nhà đã ngủ say... trừ bé Linh.", cam: [[19.5, .76, 25], [19.5, .7, 22.6]], look: [[19.5, .5, 18], [19.5, .45, 18]],
      actors: [{ st: "linh", p: [[19.5, 20.2]], face: "cam" }], lights: [{ x: 19.5, y: 21, h: 1.1, i: .8, r: 1, g: .75, b: .5, f: .6 }] },
    { f: "t2", dur: 7, stamp: "23:52", sub: "Có ai đó gọi tên bé từ cuối hành lang. Một giọng trẻ con, rất khẽ...", cam: [[11, .72, 10.6], [13, .7, 10.6]], look: [[30, .55, 10.6], [30, .55, 10.6]],
      actors: [{ st: "linh", p: [[14.5, 10.6], [22.5, 10.6]] }], lights: [{ x: 24, y: 10.6, h: 1, i: .6, r: .6, g: .7, b: 1, f: .5 }, { x: 15, y: 10.6, h: 1, i: .4, r: 1, g: .75, b: .5, f: .6 }], sfx: [[.3, "steps"], [3.5, "giggle"]] },
    { f: "t2", dur: 6.5, stamp: "23:53", sub: "“Chơi trốn tìm với tớ nhé...”", cam: [[29.5, .72, 10.6], [28.8, .7, 10.6]], look: [[18, .5, 10.6], [18, .5, 10.6]],
      actors: [{ st: "linh", p: [[25, 10.6], [26.8, 10.6]] }, { st: "ghostgirl", p: [[21.5, 10.6], [24.4, 10.6]], t0: 2.6, face: "cam" }],
      lights: [{ x: 27, y: 10.6, h: 1, i: .6, r: .6, g: .7, b: 1, f: .5 }, { x: 23, y: 10.6, h: .9, i: .45, r: .6, g: .7, b: 1, f: .6 }], fx: { flicker: [2.4, 6.5], red: [5, 6.5] }, sfx: [[2.6, "whisper"], [5.6, "scream"]] },
    { card: "Sáng hôm sau, người ta chỉ tìm thấy con búp bê của bé — úp mặt vào tường dưới tầng hầm.", dur: 4.5 },
    { card: "10 năm sau.", dur: 2.8 }],
  forest: [
    { f: "f1", dur: 7, stamp: "RỪNG THÔNG ĐÁ ĐEN · 3 NGÀY TRƯỚC", sub: "Ba người bạn của bạn — Minh, Hùng và Lan — dựng trại giữa rừng.", cam: [[15.4, .9, 12.2], [14.7, .8, 13]], look: [[11.5, .3, 14], [11.5, .3, 14]],
      actors: [{ st: "camper", p: [[10.6, 13.7]], pose: "sit", face: [12, 14] }, { st: "camper2", p: [[13.3, 14.6]], pose: "sit", face: [12, 14] }, { st: "camper", p: [[11.6, 15.3]], pose: "sit", face: [12, 14] }],
      lights: [{ x: 12, y: 14, h: .3, i: 2, r: 1, g: .5, b: .2, f: .5, flick: 1 }], sfx: [[.2, "fire"]] },
    { f: "f1", dur: 6, stamp: "00:14", sub: "Hùng thấy một người đứng ở bìa rừng. Cao. Gầy. Bất động.", cam: [[12.9, .72, 14.3], [12.6, .72, 14.4]], look: [[6.6, .75, 14.5], [6.6, .8, 14.5]],
      actors: [{ st: "stalker", p: [[6.7, 14.5]], face: "cam" }], lights: [{ x: 8, y: 14.3, h: 1.2, i: .55, r: .55, g: .65, b: .9, f: .5 }, { x: 12, y: 14, h: .3, i: 1.6, r: 1, g: .5, b: .2, f: .5, flick: 1 }], sfx: [[1, "wind"]] },
    { f: "f1", dur: 6, stamp: "00:15", sub: "Cậu ấy cầm đèn pin, đi lại gần để xem đó là ai...", cam: [[14.6, .75, 14.1], [13.6, .75, 14.2]], look: [[7, .5, 14.5], [7, .5, 14.5]],
      actors: [{ st: "camper", p: [[11.6, 14.3], [8.2, 14.5]], prop: "torch" }], lights: [{ x: 12, y: 14, h: .3, i: 1.4, r: 1, g: .5, b: .2, f: .5, flick: 1 }], sfx: [[.2, "steps"]] },
    { f: "f1", dur: 3.4, stamp: "00:16", sub: "", cam: [[9, .72, 14.4], [8.9, .72, 14.4]], look: [[6.6, .7, 14.5], [6.6, .72, 14.5]],
      actors: [{ st: "stalker", p: [[7.5, 14.5]], face: "cam", t0: 1.1 }], lights: [{ x: 8.4, y: 14.4, h: .75, i: 1.1, r: 1, g: .9, b: .7, f: .8 }], fx: { scare: 1.1, red: [1.1, 3.4], flicker: [1.1, 3.4] } },
    { card: "Không ai trong ba người trở về.", dur: 3.5 }, { card: "Đêm nay, đến lượt bạn.", dur: 2.6 }],
  castle: [
    { f: "c1", dur: 7, stamp: "LÂU ĐÀI VẠN LẠC · NĂM 1888", sub: "Đêm đông. Những cô hầu gái lặng lẽ đi thắp nến khắp đại sảnh.", cam: [[19.5, 1, 27.5], [19.5, .9, 24]], look: [[19.5, .8, 16], [19.5, .7, 16]],
      actors: [{ st: "maid", p: [[18.4, 23.5], [18.4, 18.5]], light: 1 }, { st: "maid", p: [[20.8, 24.5], [20.8, 19.5]], light: 1 }] },
    { f: "c1", dur: 6.5, stamp: "23:40", sub: "Nữ Bá Tước Elizabeth cho gọi cô hầu Mai lên phòng ngai vàng.", cam: [[23, .78, 8], [23, .75, 7]], look: [[23, .68, 4], [23, .66, 4]],
      actors: [{ st: "countess", p: [[23, 4.6]], face: "cam" }], lights: [{ x: 23, y: 6, h: 1.4, i: .8, r: 1, g: .5, b: .25, f: .5 }] },
    { f: "c1", dur: 7, stamp: "23:41", sub: "Bà ta mỉm cười, bảo cô lại gần hơn...", cam: [[21.2, .74, 7], [21.4, .73, 6.6]], look: [[23.3, .6, 4.8], [23.3, .6, 4.8]],
      actors: [{ st: "countess", p: [[23, 4.6]], face: [23, 9], pose: "reach" }, { st: "maid", p: [[23, 8.8], [23, 5.6]], light: 1 }], lights: [{ x: 22, y: 6, h: 1.4, i: .8, r: 1, g: .5, b: .25, f: .5 }], fx: { red: [5, 7], flicker: [5.2, 7] }, sfx: [[5.4, "scream"]] },
    { f: "c3", dur: 5.5, stamp: "NHIỀU NĂM SAU", sub: "Dân làng phá cổng xông vào. Họ chỉ thấy một bồn tắm đầy máu... và một chiếc quan tài trống.", cam: [[12.5, .7, 13.5], [12.5, .7, 11.5]], look: [[12.5, .3, 6], [12.5, .3, 6]], lights: [{ x: 12.5, y: 8, h: 1.2, i: .6, r: 1, g: .6, b: .3, f: .5, flick: 1 }] },
    { card: "Không ai biết bà ta đã đi đâu.", dur: 3 }],
  cemetery: [
    { f: "g1", dur: 7, stamp: "30 NĂM TRƯỚC · ĐÊM TRƯỚC NGÀY CƯỚI", sub: "Cô Lan, cô dâu của làng, lén ra ngoài lúc nửa đêm.", cam: [[23.5, .8, 37.5], [23.5, .76, 34]], look: [[23.5, .62, 27], [23.5, .6, 27]],
      actors: [{ st: "bride", p: [[23.5, 31.5], [23.5, 28]] }], lights: [{ x: 23.5, y: 31, h: 1, i: .5, r: .7, g: .8, b: 1, f: .5 }] },
    { f: "g1", dur: 7, stamp: "00:05", sub: "Cô ngồi chải tóc bằng chiếc lược ngà — sính lễ của người chồng sắp cưới — dưới gốc liễu bên bờ sông.", cam: [[15.4, .75, 12.3], [14.6, .74, 12]], look: [[11.5, .65, 11.2], [11.5, .65, 11.2]],
      actors: [{ st: "bride", p: [[12.6, 11.6]], pose: "comb", face: [11, 10.5] }], lights: [{ x: 13.5, y: 12, h: 1, i: .45, r: .7, g: .8, b: 1, f: .5 }], sfx: [[.3, "water"]] },
    { card: "Nước sông đêm ấy lạnh lắm. Cô gọi mà không ai nghe.", dur: 4, sfx: "splash" },
    { f: "g1", dur: 6.5, stamp: "30 NĂM SAU", sub: "Người ta chôn nhầm chiếc lược theo cô. Từ đó, mỗi đêm rằm, đất trong nghĩa trang lại chuyển động...", cam: [[11.2, .72, 17.5], [11.2, .7, 16]], look: [[11.2, .5, 13], [11.2, .55, 13]],
      actors: [{ st: "brideghost", p: [[11.2, 13.1]], face: "cam", t0: 3 }], lights: [{ x: 11.2, y: 14.6, h: 1, i: 1, r: .6, g: .8, b: .9, f: .5 }], fx: { flicker: [3, 6.5] }, sfx: [[3, "whisper"]] },
    { card: "0 giờ đêm nay.", dur: 2.6 }],
  factory: [
    { f: "x1", dur: 7, stamp: "XƯỞNG DỆT HỒNG PHÁT · 12/3/1991", sub: "Ca đêm. 27 công nhân vẫn đứng máy, như mọi đêm.", cam: [[25, 1.9, 14.4], [23.5, 1.8, 14.5]], look: [[10, .35, 16], [10, .35, 16]],
      actors: [{ st: "worker", p: [[9.2, 15.7]], pose: "work", face: [9.2, 14] }, { st: "worker", p: [[14.6, 15.7]], pose: "work", face: [14.6, 14] }, { st: "worker", p: [[20.6, 15.7]], pose: "work", face: [20.6, 14] }],
      lights: [{ x: 10, y: 15, h: 1.6, i: .6, r: .7, g: .8, b: 1, f: .3 }, { x: 17, y: 15, h: 1.6, i: .6, r: .7, g: .8, b: 1, f: .3 }] },
    { f: "x1", dur: 7, stamp: "02:10", sub: "Quản đốc đi tuần một vòng... rồi lặng lẽ xích cửa thoát hiểm lại.", cam: [[13.2, 1.5, 18.4], [14, 1.4, 18.4]], look: [[24, .4, 18.4], [24, .4, 18.4]],
      actors: [{ st: "butcher", p: [[24.5, 18.4], [18.6, 18.4]] }], lights: [{ x: 18, y: 18.5, h: 1.6, i: .6, r: .7, g: .8, b: 1, f: .3 }], sfx: [[.4, "steps"], [5.6, "chain"]] },
    { f: "x1", dur: 6.5, stamp: "02:31", sub: "Lửa bùng lên từ kho vải. Không một ai thoát ra được.", cam: [[21.5, 1.5, 23.2], [21, 1.4, 23.2]], look: [[8, .35, 23], [8, .35, 23]], fire: 1,
      actors: [{ st: "worker", p: [[7, 23], [16.5, 23]], run: 1 }, { st: "worker", p: [[5, 23.5], [14.5, 23.5]], run: 1 }], fx: { flicker: [0, 6.5] }, sfx: [[.2, "fire"], [2.5, "scream"]] },
    { f: "x1", dur: 5, stamp: "", sub: "Nhưng hắn... vẫn còn đi tuần.", cam: [[7, .74, 23], [9.3, .74, 23]], look: [[12, .78, 23], [12, .8, 23]], fire: 1,
      actors: [{ st: "butcher", p: [[11.6, 23]], face: "cam" }], fx: { red: [0, 5] } },
    { card: "35 năm sau. Ca đêm đầu tiên của bạn.", dur: 3.4 }],
};
const CUT = { on: false };
function playCutscene(list, done) {
  list = list.map(remapShot); Object.assign(CUT, { on: true, list, i: -1, done, prevF: F, actors: [] });
  ["hudx", "msg"].forEach(id => $(id).style.visibility = "hidden"); $("cine").classList.remove("hidden");
  CUT.kd = e => { if (e.code === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); cutEnd(); } else if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); cutNext(); } };
  addEventListener("keydown", CUT.kd, true); cutNext();
}
function cutNext() {
  CUT.i++; if (CUT.i >= CUT.list.length) return cutEnd();
  const sh = CUT.sh = CUT.list[CUT.i]; CUT.t0 = t; CUT.fired = new Set();
  const el = $("cine"), sub = el.querySelector(".csub"), st = el.querySelector(".cstamp"), card = el.querySelector(".ccard");
  card.classList.toggle("on", !!sh.card); card.textContent = sh.card || ""; st.textContent = sh.stamp || ""; sub.textContent = "";
  el.querySelector(".cfade").classList.add("on"); setTimeout(() => el.querySelector(".cfade").classList.remove("on"), 60);
  if (sh.card) { if (sh.sfx) cutSfx(sh.sfx); return; }
  if (sh.f) { F = FLOORS[sh.f]; refreshWallsOnly(); }
  CUT.actors = (sh.actors || []).map(a => ({ ...a, x: a.p[0][0], y: a.p[0][1], face: typeof a.face === "number" ? a.face : 0 }));
  clearInterval(CUT.typ); let k = 0; const txt = sh.sub || ""; CUT.typ = setInterval(() => { sub.textContent = txt.slice(0, ++k); if (k >= txt.length) clearInterval(CUT.typ); }, sh.typ || 34);
}
function refreshWallsOnly() { WT = WALL_TEX(); WT["Ø"] = T.slamDoor; }
function cutEnd() {
  if (!CUT.on) return; CUT.on = false; clearInterval(CUT.typ); removeEventListener("keydown", CUT.kd, true);
  F = CUT.prevF; $("cine").classList.add("hidden"); ["hudx", "msg"].forEach(id => $(id).style.visibility = "");
  const d = CUT.done; CUT.done = null; if (d) d();
}
function cutSfx(k) {
  if (!ac) return;
  if (k === "steps") for (let i = 0; i < 8; i++) noise(.07, 140, .22, .8, i * .5);
  else if (k === "giggle") giggle(); else if (k === "scream") screech(); else if (k === "whisper") noise(1.4, 700, .12, .5);
  else if (k === "fire") { noise(3, 300, .25, .4); noise(3, 1200, .08, .6, .5); } else if (k === "wind") noise(3, 500, .2, .3);
  else if (k === "water") noise(3, 900, .08, .4); else if (k === "splash") { noise(.9, 400, .7, .5); noise(2.5, 200, .3, .4, .5); }
  else if (k === "chain") for (let i = 0; i < 5; i++) noise(.12, 3000 + i * 300, .3, 3, i * .14);
}
const ease = u => u * u * (3 - 2 * u), lerp3 = (a, b, u) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * u);
function cutFrame(dt) {
  const sh = CUT.sh, el = $("cine"); if (!sh) return null;
  const lt = t - CUT.t0; if (lt >= sh.dur) { cutNext(); return CUT.on ? cutFrame(dt) : null; }
  if (sh.card) return null;
  for (const [tt, k] of sh.sfx || []) if (lt >= tt && !CUT.fired.has(tt)) { CUT.fired.add(tt); cutSfx(k); }
  const fx = sh.fx || {}, inR = r => r && lt >= r[0] && lt < r[1];
  if (fx.scare != null && lt >= fx.scare && !CUT.fired.has("sc")) { CUT.fired.add("sc"); if (ac) screech(); el.querySelector(".cfade").classList.add("flash"); setTimeout(() => el.querySelector(".cfade").classList.remove("flash"), 120); }
  const u = ease(Math.min(1, lt / sh.dur)), eye = lerp3(sh.cam[0], sh.cam[1], u), lk = lerp3(sh.look[0], sh.look[1], u);
  const fw = [lk[0] - eye[0], lk[1] - eye[1], lk[2] - eye[2]], n = Math.hypot(...fw); fw.forEach((q, i) => fw[i] = q / n);
  const flick = inR(fx.flicker) && Math.random() < .45;
  const lights = (sh.lights || []).map(L => ({ ...L, i: L.i * (flick ? .15 : 1) * (L.flick ? .8 + Math.random() * .35 : 1) }));
  lights.push({ x: eye[0] - fw[0] * .4, y: eye[2] - fw[2] * .4, h: eye[1] + .3, i: (flick ? .05 : .32) * (1 - .7 * (sh.day || 0)), r: .75, g: .8, b: 1, f: .35 });   // đèn phụ trợ kiểu quay phim
  if (sh.fire) for (let k = 0; k < 3; k++) lights.push({ x: 6 + k * 5, y: 21 + (k % 2) * 3, h: .5, i: 1.6 + Math.random() * .8, r: 1, g: .42, b: .12, f: .25 });
  for (const a of CUT.actors) {
    const vis = lt >= (a.t0 || 0) && lt < (a.t1 ?? 1e9); a.vis = vis; if (!vis) continue;
    if (a.p.length > 1) { const st = a.t0 || 0, du = (a.t1 ?? sh.dur) - st, uu = Math.min(1, Math.max(0, (lt - st) / (du * .92))); a.x = a.p[0][0] + (a.p[1][0] - a.p[0][0]) * uu; a.y = a.p[0][1] + (a.p[1][1] - a.p[0][1]) * uu; }
    if (a.light) lights.push({ x: a.x, y: a.y, h: .75, i: .7 + Math.random() * .08, r: 1, g: .62, b: .3, f: 1.4 });
  }
  return { eye, fw, lights, red: inR(fx.red) ? .2 : (sh.fire ? .1 : 0), prox: 0 };
}
function drawActor(v, a, eye) {
  const def = ACTOR[a.st]; if (!def) return;
  const toCam = Math.atan2(eye[2] - a.y, eye[0] - a.x), moving = a.p.length > 1;
  let face = a.face === "cam" ? toCam : Array.isArray(a.face) ? Math.atan2(a.face[1] - a.y, a.face[0] - a.x) : moving ? Math.atan2(a.p[1][1] - a.p[0][1], a.p[1][0] - a.p[0][0]) : toCam;
  if (def.enemy) {
    const g = a.g || (a.g = { x: a.x, y: a.y, rise: 1, state: moving ? "patrol" : "chase", stare: 0, hunt: a.pose === "reach" ? 1e9 : 0, gone: 0 });
    g.x = a.x; g.y = a.y; g.face = face; const prev = player; player = { x: a.x + Math.cos(face) * 3, y: a.y + Math.sin(face) * 3, a: 0 }; CHASING = a.pose === "reach" ? 1 : 0;
    try { ENEMY_MODEL[def.enemy](v, g); } finally { player = prev; } return;
  }
  const { c, s } = facing(face), sit = a.pose === "sit", X = XF(a.x, sit ? -.42 * def.k * 1.0 : 0, a.y, c, s, def.k), o = def.o(); if (a.prop) o.prop = a.prop;
  a.ph = (a.ph || 0) + (moving && !sit ? Math.hypot(a.x - (a.lx ?? a.x), a.y - (a.ly ?? a.y)) * (a.run ? 9 : 14) / def.k * .45 : 0); a.lx = a.x; a.ly = a.y;
  const sw = moving ? Math.sin(a.ph) * (a.run ? .7 : .45) : 0, an = { sw, ph: a.ph, sit };
  if (a.pose === "comb") Object.assign(an, { armR: -2.4, elR: -1.2, headAz: .15, headAx: .1 });
  if (a.pose === "work") Object.assign(an, { armL: -1 + Math.sin(t * 4) * .2, armR: -1.1 + Math.sin(t * 4 + 1.5) * .2, elL: -.6, elR: -.6, hunch: .12 });
  if (a.prop === "torch") an.armR = -1.3;
  if (a.run) Object.assign(an, { armL: sw * 1.4, armR: -sw * 1.4, elL: -1, elR: -1, hunch: .2 });
  humanoid(v, X, o, an);
}

// ---- Dựng hình (thêm camera phim) ----
function render() {
  const now = performance.now(), dt = Math.min(.05, (now - lastR) / 1000 || .016); lastR = now;
  ensureFBO();
  if (CUT.on) { const cam = cutFrame(dt); if (cam) { player = P1; renderView(0, 1, dt, cam); return; } gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
  player = P1; renderView(0, 1, dt);
}
function renderView(vx, vw, dt, cam) {
  if (!cam) { computeAim(); player.aim = aimed; player.aimS = aimedSprite; }
  const flick = !cam && t < flickerUntil && Math.random() < .6, low = player.battery < 15 && Math.random() < .12;
  const FLi = cam ? 0 : (flashOn() && !flick && !low && !player.dead) ? .3 + .8 * player.battery / 100 : 0;
  const pool = cam ? cam.lights.slice() : F.lights.filter(L => (!L.power || S.power) && (!L.cond || L.cond()));
  if (cam) for (const L of F.lights) if ((!L.power || S.power) && (!L.cond || L.cond())) pool.push(L);
  if (!cam && COOP) for (const o of players()) if (o !== player && !o.dead && o.lightOn && o.battery > 0 && !o.hidden) pool.push({ x: o.x + Math.cos(o.a) * 1.1, y: o.y + Math.sin(o.a) * 1.1, h: .7, i: .55 + o.battery / 250, r: 1, g: .9, b: .74, f: .9, _p: 1 });
  const ex = cam ? cam.eye[0] : player.x, ez = cam ? cam.eye[2] : player.y;
  const lights = pool.map((L, k) => ({ L, d: Math.hypot(L.x - ex, L.y - ez) - (L.i > 1 ? 1.5 : 0),
    q: L._p || cam ? L.i : (flick && L.power ? .15 : 1) * L.i * (L.power ? .95 + Math.random() * .05 : .8 + .2 * Math.sin(t * 11 + k * 3) + Math.random() * .08) }))
    .sort((a, b) => a.d - b.d).slice(0, 10);
  const LP = new Float32Array(40), LC = new Float32Array(40);
  lights.forEach(({ L, q }, i) => { LP.set([L.x, L.h ?? .3, L.y, q * 1.3], i * 4); LC.set([L.r, L.g, L.b, (L.f || 1.8) * .9], i * 4); });
  let md = minGhostD; if (COOP && !cam) { md = 99; for (const g of ghosts) if (g.floor === F.id && !(g.gone > t) && g.rise !== 0) md = Math.min(md, Math.hypot(g.x - player.x, g.y - player.y)); }
  const myScare = !cam && t < scareUntil && S.scareWho === player;
  const prox = cam ? cam.prox : Math.max(0, 1 - md / 5) * (S.paused && !S.ending ? 0 : 1) * (player.dead ? 0 : 1);
  const asp = vw * cv.width / cv.height, far = F.outdoor ? 90 : 60;
  let eye, fw;
  if (cam) { eye = cam.eye; fw = cam.fw; }
  else {
    const p = player.pitch, a = player.a; fw = [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)];
    eye = [player.x, (player.dead ? .18 : EYE) + Math.sin(player.bob) * .025 - (player.hidden ? .05 : 0) + eyeOff(player) + (player === P1 ? CAM4D.ey : 0), player.y];
    if (myScare) { eye[0] += (Math.random() - .5) * .03; eye[1] += (Math.random() - .5) * .03; eye[2] += (Math.random() - .5) * .03; }
  }
  const VP = mul(persp(2 * Math.atan(Math.tan((cam ? 66 : SET.hfov + FX.fov) * Math.PI / 360) / asp), asp, .03, far), lookAtR(eye, fw, cam ? 0 : CAM4D.roll));
  const fl0 = player.fl || (player.fl = fw.slice()), kk = 1 - Math.exp(-dt * 14), sway = [Math.sin(player.bob * .5) * .025, Math.abs(Math.cos(player.bob * .5)) * .02 - .03, 0];
  if (!cam) for (let i = 0; i < 3; i++) fl0[i] += (fw[i] + sway[i] - fl0[i]) * kk;
  const fll = Math.hypot(...fl0), fd = fl0.map(q => q / fll);
  const X0 = Math.round(vx * fboW), W0 = Math.round(vw * fboW);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(X0, 0, W0, fboH); gl.enable(gl.SCISSOR_TEST); gl.scissor(X0, 0, W0, fboH);
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.useProgram(P3);
  gl.uniformMatrix4fv(U3.uVP, false, VP); gl.uniform3fv(U3.uCam, eye); gl.uniform3fv(U3.uFlDir, fd); gl.uniform1f(U3.uFl, FLi);
  gl.uniform1f(U3.uAmb, F.amb * (S.power && F.id !== "b1" ? 1.4 : 1) * .55 * (cam ? 1.6 : 1) + (cam ? 0 : WX.flash * (F.outdoor ? 1.4 : .3))); gl.uniform1f(U3.uFog, F.outdoor ? (F.fogD || .0042) : .012); gl.uniform3fv(U3.uFogC, F.outdoor ? (F.fogC || FOG_FOREST) : [0, 0, 0]);
  gl.uniform3fv(U3.uMoonDir, moonDir()); gl.uniform3fv(U3.uMoonC, F.outdoor ? (F.moonC || [.05, .06, .09]).map(q => q * (cam ? 1.5 : 1) * (1 + (cam ? 0 : WX.flash * 22))) : [0, 0, 0]); gl.uniform1f(U3.uSky, LAYER.get(F.sky || T.sky) ?? -9); gl.uniform1i(U3.uNL, lights.length);
  gl.uniform4fv(U3.uLP, LP); gl.uniform4fv(U3.uLC, LC); gl.uniform1f(U3.uPOM, SET.quality === "nhanh" ? 0 : 1); gl.uniform1f(U3.uT, t % 1000); gl.uniform1i(U3.uNW, WIND.length); if (WIND.length) gl.uniform3fv(U3.uWL, new Float32Array(WIND.flat().concat(Array(36 - WIND.length * 3).fill(0))));
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, texArr); gl.uniform1i(U3.uTex, 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D_ARRAY, emArr); gl.uniform1i(U3.uEm, 1);
   { const dy = cam ? (cam.day || 0) : 0; gl.uniform1f(U3.uDay, dy); if (dy > 0) { gl.uniform1f(U3.uFog, (F.outdoor ? (F.fogD || .0042) : .012) * (1 - .8 * dy)); const fc = F.outdoor ? (F.fogC || FOG_FOREST) : [0, 0, 0], to = F.outdoor ? [.5, .6, .74] : [.2, .18, .14]; gl.uniform3fv(U3.uFogC, fc.map((q, k) => q + (to[k] - q) * dy)); gl.uniform3fv(U3.uMoonC, F.outdoor ? [.9 * dy, .85 * dy, .72 * dy] : [.3 * dy, .27 * dy, .22 * dy]); } }
  if (F.outdoor) {
    const sv = []; psphere(sv, XW, eye[0], eye[1], eye[2], 40, 14, F.sky || T.sky); gl.depthMask(false);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyMesh.b); gl.bufferData(gl.ARRAY_BUFFER, f32(sv), gl.DYNAMIC_DRAW); gl.bindVertexArray(skyMesh.vao); gl.drawArrays(gl.TRIANGLES, 0, sv.length / 9); gl.depthMask(true);
  }
  if (typeof scanBind === "function") scanBind(); if (F._baseDirty && typeof buildDyn === "function") buildFloorMesh(F); gl.bindVertexArray(F.mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, F.mesh.n); if (F.mesh2) { gl.bindVertexArray(F.mesh2.vao); gl.drawArrays(gl.TRIANGLES, 0, F.mesh2.n); }
  if (typeof scanDraw === "function") scanDraw(F, eye, fw);   // đồ vật quét 3D thật (Poly Haven)
  const v = [];
  if (cam) { swayMeshes(v); for (const a of CUT.actors) if (a.vis) drawActor(v, a, eye); }
  else { for (const g of ghosts) if (g.floor === F.id) ghostDraw(v, g); swayMeshes(v); if (myScare) scareModel(v, eye); drawSpiders(v); drawDust(v, eye, fw, dt); drawCritters(v); drawSmoke(v, eye, fw); wxDraw(v, eye, fw, dt); drawRats(v); if (COOP) for (const o of players()) if (o !== player && o.f === F.id) survivorModel(v, o); }
  if (v.length) { gl.bindBuffer(gl.ARRAY_BUFFER, sprMesh.b); gl.bufferData(gl.ARRAY_BUFFER, f32(v), gl.DYNAMIC_DRAW); gl.bindVertexArray(sprMesh.vao); gl.drawArrays(gl.TRIANGLES, 0, v.length / 9); }
  const cx0 = Math.round(vx * cv.width), cw = Math.round(vw * cv.width);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(cx0, 0, cw, cv.height); gl.scissor(cx0, 0, cw, cv.height); gl.disable(gl.DEPTH_TEST); gl.useProgram(PP);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboTex); gl.uniform1i(UP.uScene, 0);
  gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fboDepth); gl.uniform1i(UP.uDepth, 2); gl.activeTexture(gl.TEXTURE0);
  gl.uniform2f(UP.uRes, cw, cv.height); gl.uniform2f(UP.uRect, vx, vw); gl.uniform2f(UP.uNF, .03, far);
  gl.uniform1f(UP.uTime, t % 100); gl.uniform1f(UP.uProx, myScare ? .4 : prox); gl.uniform1f(UP.uHurt, cam ? cam.red : Math.max(hurt * .6, myScare ? .35 : 0)); gl.uniform1f(UP.uHide, !cam && player.hidden ? 1 : 0);
  gl.uniform1f(UP.uBright, .7 + SET.bri / 100 * .95 + (cam ? .12 : 0)); gl.uniform1f(UP.uFx, 1); gl.uniform1f(UP.uDead, !cam && player.dead ? 1 : 0); gl.uniform1f(UP.uAO, SET.ao && SET.quality !== "nhanh" ? .62 : 0); gl.uniform1f(UP.uFl, FLi > 0 ? 1 : 0); if (UP.uMB) gl.uniform2f(UP.uMB, 0, 0); if (UP.uDay) gl.uniform1f(UP.uDay, cam ? (cam.day || 0) : 0); if (UP.uSS) gl.uniform1f(UP.uSS, SCALE);
  gl.bindVertexArray(emptyVAO); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disable(gl.SCISSOR_TEST);
}
