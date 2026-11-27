// =====================================================================
//  61. CHỌN MA (kiểu Granny: Granny / Grandpa / cả hai)
//  · Mỗi map có 2 con ma theo bối cảnh. Người chơi chọn 1 con, con kia, hoặc cả hai.
//  · Số ma trên bản đồ KHÔNG BAO GIỜ vượt quá số đã chọn (1 hoặc 2).
//    Khi game muốn "thêm ma" (làm xong nhiệm vụ, sự kiện kịch tính...) → ma hiện có mạnh lên,
//    mức tăng tùy độ khó.
//  · Hai con ma mạnh như nhau; độ khó của map quyết định tốc độ và mức hung dần.
// =====================================================================
const FOE_INFO = {
  house:    { a: "Bé Linh",      b: "Mẹ của Linh" },
  forest:   { a: "Ma Rừng",      b: "Kẻ Cắm Trại" },
  castle:   { a: "Nữ Bá Tước",   b: "Lão Quản Gia" },
  cemetery: { a: "Vong cô Lan",  b: "Ông Gác Mộ" },
  factory:  { a: "Gã Đồ Tể",     b: "Nữ Công Nhân Cháy" },
  hospital: { a: "Bác sĩ Khải",  b: "Y tá Nguyệt" },
};
const FOE = { pick: "a", scareWho: 0 };
try { const s = localStorage.getItem("aakh-foe"); if (s === "a" || s === "b" || s === "ab") FOE.pick = s; } catch (e) {}
const foeN = () => FOE.pick === "ab" ? 2 : 1;
const foeWhoFor = i => FOE.pick === "a" ? 0 : FOE.pick === "b" ? 1 : (i % 2);
// mức mạnh lên mỗi lần game "muốn thêm ma", và mức trần — theo độ khó
const FOE_RAMP = { de: [.04, 1.2], tb: [.06, 1.3], kho: [.08, 1.42], sieu: [.1, 1.55] };
const foeRamp = () => FOE_RAMP[Object.keys(DIFF).find(k => DIFF[k] === D)] || FOE_RAMP.tb;
function foeBuff(msg) {
  const [st, cap] = foeRamp(); let up = 0;
  for (const g of ghosts) { const m = Math.min(cap, (g.mul || 1) * (1 + st)); if (m > (g.mul || 1)) { g.mul = m; up = 1; } }
  if (msg && up) { flicker(); try { say(pickR(ESC_MSG.full)); } catch (e) {} }
}
const foeFull = () => ghosts.length >= foeN();

// ---------- 1. Giới hạn số ma ----------
spawnEnemy = (o => function (...a) {
  if (!(NET.ok && !NET.host) && foeFull()) { foeBuff(); return; }
  const n = ghosts.length, r = o.apply(this, a);
  for (let i = n; i < ghosts.length; i++) foeTag(ghosts[i], i);
  return r;
})(spawnEnemy);
spawnZombie = (o => function (...a) {
  if (!(NET.ok && !NET.host) && foeFull()) { foeBuff(); return; }
  return o.apply(this, a);
})(spawnZombie);
function foeTag(g, i) {
  if (g.who != null) return;
  g.who = foeWhoFor(i);
}
wakeGhosts = (o => function (...a) {
  const r = o.apply(this, a);
  if (!S.woke || (NET.ok && !NET.host)) return r;
  if (ghosts.length > foeN()) ghosts.length = foeN();
  ghosts.forEach(foeTag);
  // chọn "cả hai" → bổ sung con còn lại, xuất hiện ở xa con thứ nhất
  for (let k = 0; ghosts.length < foeN() && k < 3; k++) {
    if (MAPID === "cemetery") { const tb = F.sprites.filter(s => (s.k === "tomb" || s.k === "cross") && Math.hypot(s.x - player.x, s.y - player.y) > 9), p = tb[Math.floor(Math.random() * tb.length)]; if (p) spawnZombie(p.x, p.y + .6); else spawnEnemy(); }
    else spawnEnemy();
    const g = ghosts[ghosts.length - 1], g0 = ghosts[0];
    if (g && g0 && g !== g0 && MAPID !== "cemetery" && Math.hypot(g.x - g0.x, g.y - g0.y) < 10) { const p = randomFloor(12); g.x = p.x; g.y = p.y; }
  }
  return r;
})(wakeGhosts);
// game muốn thêm ma → không thêm nữa, ma hiện có mạnh lên theo độ khó
escalate = (o => function () {
  if (S.ending || !S.started || (NET.ok && !NET.host)) return;
  if (!S.woke) return o();
  if (foeFull()) { foeBuff(true); return; }
  return o();
})(escalate);
gameStep = (o => function (dt) {
  o(dt);
  if (!S.started) return;
  ghosts.forEach((g, i) => { if (g.who == null && !(NET.ok && !NET.host)) foeTag(g, i); });
  if (!(NET.ok && !NET.host) && ghosts.length > foeN() && !S.ending) ghosts.length = foeN();
})(gameStep);
// jumpscare hiện đúng con ma vừa tóm bạn
jumpScare = (o => function (...a) {
  let best = null, bd = 1e9;
  for (const g of ghosts) if (g.floor === F.id) { const d = Math.hypot(g.x - player.x, g.y - player.y); if (d < bd) { bd = d; best = g; } }
  FOE.scareWho = best && best.who != null ? best.who : (FOE.pick === "b" ? 1 : 0);
  return o.apply(this, a);
})(jumpScare);

// ---------- 2. Texture cho các con ma thứ hai ----------
buildPeopleTextures = (o => function () {
  o();
  const grain = (g, n, a) => { for (let i = 0; i < n; i++) R(g, rnd() * 128, rnd() * 128, 1 + rnd() * 2, 1 + rnd() * 3, `rgba(0,0,0,${a * rnd()})`); };
  const blood = (g, n) => { for (let i = 0; i < n; i++) { const x = rnd() * 128, y = rnd() * 128; stain(g, x, y, 6 + rnd() * 16, "rgba(90,0,0,.8)"); R(g, x, y, 1.5, 6 + rnd() * 22, "rgba(70,0,0,.75)"); } };
  const eyes = (col, r = 3) => g => { E(g, 54, 60, r, r * .9, col); E(g, 74, 60, r, r * .9, col); };
  const face = (bg, skin, extra, eye) => tex(g => { R(g, 0, 0, 128, 128, bg); E(g, 64, 64, 28, 42, skin); grain(g, 260, .35); extra(g); }, eye);
  // Mẹ của Linh: trắng bệch, hốc mắt đen sâu, miệng há
  T.foeMomFace = face("#0a0806", "#cfc9bf", g => { E(g, 54, 60, 9, 11, "#120808"); E(g, 74, 60, 9, 11, "#120808"); E(g, 64, 92, 7, 11, "#1a0000"); R(g, 51, 70, 2, 26, "rgba(40,0,0,.7)"); R(g, 76, 70, 2, 30, "rgba(40,0,0,.7)"); }, eyes("#ff2a10", 2));
  T.foeMomSkin = tex(g => { R(g, 0, 0, 128, 128, "#c4beb4"); grain(g, 300, .3); });
  T.foeMomDress = tex(g => { R(g, 0, 0, 128, 128, "#c9c0a8"); for (let x = 0; x < 128; x += 16) R(g, x, 0, 1, 128, "rgba(0,0,0,.1)"); grain(g, 500, .25); blood(g, 6); });
  // Kẻ Cắm Trại: da thối xanh xám, một mắt trắng dã phát sáng
  T.foeRot = tex(g => { R(g, 0, 0, 128, 128, "#6c7262"); grain(g, 500, .4); for (let i = 0; i < 12; i++) stain(g, rnd() * 128, rnd() * 128, 8 + rnd() * 12, "rgba(40,50,20,.6)"); });
  T.foeCampFace = face("#2a2620", "#7a806c", g => { E(g, 54, 60, 8, 9, "#1a1a12"); E(g, 74, 60, 9, 10, "#0a0a06"); R(g, 52, 86, 24, 4, "#1a0a06"); for (let x = 54; x < 76; x += 4) R(g, x, 84, 2, 8, "#b8a88a"); stain(g, 80, 44, 14, "rgba(70,0,0,.8)"); }, g => E(g, 54, 60, 4, 4, "#e8f0ff"));
  T.foeCampCoat = tex(g => { R(g, 0, 0, 128, 128, "#7a3c18"); for (let y = 0; y < 128; y += 10) R(g, 0, y, 128, 1, "rgba(0,0,0,.18)"); grain(g, 700, .35); for (let i = 0; i < 9; i++) R(g, rnd() * 128, rnd() * 128, 8 + rnd() * 10, 2, "#1a0e06"); blood(g, 4); });
  T.foePants = tex(g => { R(g, 0, 0, 128, 128, "#2a2c26"); grain(g, 600, .35); blood(g, 2); });
  // Lão Quản Gia: da sáp, mắt khâu chỉ, nụ cười kéo tới mang tai
  T.foeWax = tex(g => { R(g, 0, 0, 128, 128, "#d8cfb8"); grain(g, 220, .22); });
  T.foeButlerFace = face("#d0c6ae", "#ddd3bb", g => {
    g.strokeStyle = "#2a1010"; g.lineWidth = 1.6; for (const ex of [54, 74]) { g.beginPath(); g.moveTo(ex - 8, 60); g.lineTo(ex + 8, 60); g.stroke(); for (let k = -6; k <= 6; k += 3) { g.beginPath(); g.moveTo(ex + k, 56); g.lineTo(ex + k, 64); g.stroke(); } }
    g.strokeStyle = "#3a0000"; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 82); g.quadraticCurveTo(64, 100, 88, 82); g.stroke(); for (let x = 46; x < 84; x += 5) R(g, x, 86 + Math.sin((x - 46) / 38 * Math.PI) * 6, 3, 4, "#e8e0c8");
  });
  T.foeTail = tex(g => { R(g, 0, 0, 128, 128, "#121016"); for (let x = 0; x < 128; x += 6) R(g, x, 0, 1, 128, "rgba(80,70,90,.12)"); grain(g, 400, .3); });
  T.foeGlove = tex(g => { R(g, 0, 0, 128, 128, "#dcd6c8"); grain(g, 200, .2); stain(g, 60, 60, 20, "rgba(80,0,0,.6)"); });
  // Ông Gác Mộ: già nhăn nheo, mắt vàng đục phát sáng
  T.foeOldSkin = tex(g => { R(g, 0, 0, 128, 128, "#8a7a64"); grain(g, 500, .35); });
  T.foeKeeperFace = face("#5a4c3a", "#8e7e66", g => { for (let i = 0; i < 9; i++) R(g, 40, 40 + i * 3 + (i > 4 ? 30 : 0), 48, 1, "rgba(30,20,10,.45)"); E(g, 54, 60, 7, 6, "#1a1408"); E(g, 74, 60, 7, 6, "#1a1408"); E(g, 64, 98, 22, 12, "#cfcfc4"); R(g, 54, 88, 20, 3, "#1a0a06"); }, eyes("#ffd24a", 2.4));
  T.foeRain = tex(g => { R(g, 0, 0, 128, 128, "#3a3424"); for (let y = 0; y < 128; y += 7) R(g, 0, y, 128, 1, "rgba(0,0,0,.2)"); grain(g, 700, .35); for (let i = 0; i < 8; i++) stain(g, rnd() * 128, rnd() * 128, 14, "rgba(60,40,20,.6)"); });
  T.foeGrey = tex(g => { R(g, 0, 0, 128, 128, "#9a9890"); for (let x = 0; x < 128; x += 2) R(g, x, 0, 1, 128, `rgba(0,0,0,${.1 + rnd() * .2})`); });
  // Nữ Công Nhân Cháy: da cháy đen, vết nứt than hồng phát sáng
  const ember = g => { g.strokeStyle = "#ff5a10"; g.lineWidth = 1.2; for (let i = 0; i < 16; i++) { let x = rnd() * 128, y = rnd() * 128; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - .5) * 18; y += (rnd() - .5) * 18; g.lineTo(x, y); } g.stroke(); } };
  T.foeBurn = tex(g => { R(g, 0, 0, 128, 128, "#1a1410"); grain(g, 700, .5); for (let i = 0; i < 10; i++) stain(g, rnd() * 128, rnd() * 128, 10, "rgba(90,50,30,.5)"); }, ember);
  T.foeBurnFace = tex(g => { R(g, 0, 0, 128, 128, "#140e0a"); E(g, 64, 64, 28, 42, "#241a14"); grain(g, 400, .5); E(g, 64, 92, 10, 8, "#000"); for (let x = 56; x < 74; x += 3) R(g, x, 88, 2, 5, "#d8cbb0"); },
    g => { E(g, 54, 60, 4, 4, "#ff7a1a"); E(g, 74, 60, 4, 4, "#ff7a1a"); ember(g); });
  T.foeOveralls = tex(g => { R(g, 0, 0, 128, 128, "#2c3a4a"); for (let y = 0; y < 128; y += 4) R(g, 0, y, 128, 1, "rgba(0,0,0,.15)"); grain(g, 600, .4); for (let i = 0; i < 14; i++) stain(g, rnd() * 128, rnd() * 128, 6 + rnd() * 14, "rgba(0,0,0,.85)"); });
  // Y tá Nguyệt: mặt quấn băng, hai hốc mắt đỏ rực
  T.foeNurseFace = tex(g => { R(g, 0, 0, 128, 128, "#0a0806"); E(g, 64, 64, 28, 42, "#cfc8b4"); g.strokeStyle = "rgba(90,80,60,.55)"; g.lineWidth = 1.4; for (let y = 24; y < 110; y += 6) { g.beginPath(); g.moveTo(34, y); g.lineTo(94, y + 5); g.stroke(); } grain(g, 200, .2); stain(g, 64, 94, 14, "rgba(120,0,0,.85)"); E(g, 54, 60, 6, 5, "#0a0000"); E(g, 74, 60, 6, 5, "#0a0000"); R(g, 54, 92, 20, 2, "#200"); }, eyes("#ff1a0a", 2.4));
  T.foeNurseSkin = tex(g => { R(g, 0, 0, 128, 128, "#b8b0a2"); grain(g, 300, .3); });
  T.foeNurseDress = tex(g => { R(g, 0, 0, 128, 128, "#d6d2c8"); for (let x = 0; x < 128; x += 12) R(g, x, 0, 1, 128, "rgba(0,0,0,.08)"); grain(g, 400, .2); blood(g, 9); });
  T.foeRedCross = tex(g => { R(g, 0, 0, 128, 128, "#e0dcd2"); R(g, 54, 30, 20, 68, "#a00000"); R(g, 30, 54, 68, 20, "#a00000"); });
})(buildPeopleTextures);

// ---------- 3. Đạo cụ mới ----------
propAt = (o => function (v, E, x, y, kind) {
  if (kind === "scissors") { for (const s of [-1, 1]) { pbox(v, E, x - .008 + s * .01, y - .04, -.01, x + .008 + s * .01, y + .01, .01, T.metal); pbox(v, E, x - .004 + s * .006, y - .3, -.006, x + .004 + s * .006, y - .04, .006, T.metal); } }
  else if (kind === "syringe") { pbox(v, E, x - .014, y - .05, -.014, x + .014, y + .02, .014, T.metal); pbox(v, E, x - .02, y - .2, -.02, x + .02, y - .05, .02, T.foeNurseDress || T.wax); pbox(v, E, x - .003, y - .3, -.003, x + .003, y - .2, .003, T.metal); }
  else if (kind === "shovel") { pcyl(v, E, x, 0, y - .55, y + .5, .014, .014, 6, T.darkwood, T.darkwood); pbox(v, E, x - .07, y - .78, -.008, x + .07, y - .55, .008, T.metal); }
  else if (kind === "lantern") { pbox(v, E, x - .05, y - .2, -.05, x + .05, y - .08, .05, T.metal); psphere(v, E, x, y - .14, 0, .035, 6, T.flame); pcyl(v, E, x, 0, y - .08, y, .006, .006, 4, T.metal, T.metal); }
  else return o(v, E, x, y, kind);
})(propAt);

// ---------- 4. Mô hình 3D ----------
function foePose(g, k, ysc = 1) {
  const an = walkAnim(g, .35), chase = !!(g.scare || g.state === "chase" || g.st2 === "hunt" || (g.hunt || 0) > t || (CHASING && Math.hypot(g.x - player.x, g.y - player.y) < D.range));
  const fd = g.scare ? facing(Math.atan2(player.y - g.y, player.x - g.x)) : faceDir(g), r = Math.min(1, g.rise ?? 1), stun = (g.stun || 0) > 0;
  const X = XSp(XF(g.x, (g.yo || 0) - (1 - r) * 1.6 * k, g.y, fd.c, fd.s, k), 0, 0, 0, 1, ysc, 1);
  return { an, chase, stun, X };
}
const reach = (P, ph = 0) => P.stun ? -2.6 : P.chase ? -1.4 + Math.sin(t * 8 + ph) * .14 : P.an.sw * (ph ? -.9 : .9);
const FOE_B = {
  house: { k: .44, ys: 1, draw(v, g) {    // Mẹ của Linh: tóc dài phủ mặt, áo bà ba ố máu, tay cầm kéo
    const P = foePose(g, this.k, this.ys), d = T.foeMomDress;
    humanoid(v, P.X, { skin: T.foeMomSkin, face: T.foeMomFace, top: d, bottom: d, shoe: T.foeMomSkin, hair: T.hair, hairLen: "long", faceHair: true, skirt: { m: d, y0: .12, r: .3 }, slim: .8, claws: true, prop: "scissors" },
      { sw: P.an.sw * .6, ph: P.an.ph, armL: reach(P), armR: P.chase ? -2.2 + Math.max(0, Math.sin(t * 9)) * 1.4 : reach(P, 1), hunch: P.chase ? .16 : .06, headAx: .22, headAz: twitch(g, 2.2) * .6 + Math.sin(t * .8) * .2 });
  } },
  forest: { k: .5, ys: 1, draw(v, g) {    // Kẻ Cắm Trại: người bạn mất tích, áo khoác rách, mũ trùm, đèn pin chập chờn
    const P = foePose(g, this.k, this.ys), c = T.foeCampCoat;
    const hunch = P.chase ? .22 : .14, headAz = twitch(g, 3) * .6, headAx = .28;
    humanoid(v, P.X, { skin: T.foeRot, face: T.foeCampFace, top: c, bottom: T.foePants, shoe: T.dark, slim: .82, prop: Math.sin(t * 13) > -.6 ? "torch" : null, hand: T.foeRot, fore: c },
      { sw: P.an.sw, ph: P.an.ph, armL: reach(P), armR: P.chase ? -1.2 : -.5, elR: -.6, hunch, headAx, headAz, lean: Math.sin(t * 1.3) * .05 });
    const B = XL(P.X, 0, .92, 0, hunch, Math.sin(t * 1.3) * .05), H = XL(B, 0, 1.52, 0, headAx, headAz);
    psphere(v, H, 0, 1.665, -.03, .132, 10, c, 1.08);                    // mũ trùm đầu
  } },
  castle: { k: .5, ys: 1.02, draw(v, g) {  // Lão Quản Gia: áo đuôi tôm, găng trắng, gù lưng, cầm nến
    const P = foePose(g, this.k, this.ys), c = T.foeTail, hunch = P.chase ? .3 : .22;
    humanoid(v, P.X, { skin: T.foeWax, face: T.foeButlerFace, top: c, bottom: c, shoe: T.dark, collar: T.foeGlove, slim: .8, hand: T.foeGlove, prop: "candle", claws: P.chase },
      { sw: P.an.sw * .7, ph: P.an.ph, armL: reach(P), armR: P.chase ? -1.1 : -.7, elR: -.9, hunch, headAx: .1, headAz: twitch(g, 4) * .4 });
    const B = XL(P.X, 0, .92, 0, hunch, 0);
    for (const sx of [-1, 1]) pbox(v, XL(B, 0, .9, -.1, -.12 + Math.sin(t * 2 + sx) * .04), sx * .02, .38, -.2, sx * .14, .92, -.15, c);   // đuôi áo
  } },
  cemetery: { k: .47, ys: 1, draw(v, g) {  // Ông Gác Mộ: áo mưa, mũ rộng vành, đèn bão và xẻng
    if (!g.scare && g.blink > t) return;
    const P = foePose(g, this.k, this.ys), c = T.foeRain, hunch = P.chase ? .2 : .14;
    humanoid(v, P.X, { skin: T.foeOldSkin, face: T.foeKeeperFace, top: c, bottom: c, shoe: T.dark, skirt: { m: c, y0: .45, r: .26 }, slim: .9, hand: T.foeOldSkin, prop: "lantern", propL: "shovel" },
      { sw: P.an.sw * .8, ph: P.an.ph, armL: P.chase ? -1.9 + Math.max(0, Math.sin(t * 7)) * 1.2 : -.25, armR: P.chase ? -.9 : -.35, elR: -.4, hunch, headAx: .12, headAz: twitch(g, 4) * .35 });
    const B = XL(P.X, 0, .92, 0, hunch, 0), H = XL(B, 0, 1.52, 0, .12, 0);
    psphere(v, H, 0, 1.7, -.02, .118, 10, T.foeGrey, .9);
    pcyl(v, H, 0, .01, 1.76, 1.78, .26, .26, 16, c, c); pcyl(v, H, 0, .01, 1.77, 1.9, .13, .12, 12, c, c);   // mũ rộng vành
  } },
  factory: { k: .47, ys: 1, draw(v, g) {   // Nữ Công Nhân Cháy: da cháy đen nứt than hồng, quần áo bảo hộ cháy xém
    const P = foePose(g, this.k, this.ys), b = T.foeBurn, c = T.foeOveralls;
    humanoid(v, P.X, { skin: b, face: T.foeBurnFace, top: c, bottom: c, legs: b, shoe: b, hand: b, fore: b, hair: b, slim: .76, claws: true },
      { sw: P.an.sw * 1.1, ph: P.an.ph, armL: reach(P), armR: reach(P, 1.6), elL: -.5, elR: -.4, hunch: P.chase ? .25 : .18, headAx: .3, headAz: twitch(g, 1.6) * .8, lean: Math.sin(t * 2.1) * .07 });
  } },
  hospital: { k: .5, ys: 1.06, draw(v, g) { // Y tá Nguyệt: đồng phục trắng đẫm máu, mặt quấn băng, mũ y tá, ống tiêm
    const P = foePose(g, this.k, this.ys), d = T.foeNurseDress, headAx = P.stun ? -.3 : .2, headAz = P.stun ? Math.sin(t * 20) * .3 : twitch(g, 1.8) * .7, hunch = P.stun ? .05 : P.chase ? .2 : .08;
    humanoid(v, P.X, { skin: T.foeNurseSkin, face: T.foeNurseFace, top: d, bottom: d, shoe: d, legs: T.foeNurseSkin, hair: T.hair, hairLen: "bun", skirt: { m: d, y0: .44, r: .24 }, slim: .76, claws: true, prop: "syringe" },
      { sw: P.an.sw, ph: P.an.ph, armL: reach(P), armR: P.stun ? -2.6 : P.chase ? -2.3 + Math.max(0, Math.sin(t * 11)) * 1.6 : reach(P, 1), hunch, headAx, headAz });
    const B = XL(P.X, 0, .92, 0, hunch, 0), H = XL(B, 0, 1.52, 0, headAx, headAz);
    pbox(v, H, -.075, 1.75, -.03, .075, 1.81, .07, T.foeRedCross);   // mũ y tá
  } },
};
for (const id of Object.keys(FOE_B)) FOE_B[id].faceH = 1.64 * FOE_B[id].k * FOE_B[id].ys;
function foeWrapModel(def, id) {
  if (!def || def._foeWrap) return; const o = def.model, B = FOE_B[id]; if (!o || !B) return;
  def.model = function (v, g) {
    const who = g.who != null ? g.who : g.scare ? FOE.scareWho : 0;
    if (who !== 1) return o(v, g);
    if (g.scare) { const g2 = Object.assign({}, g, { yo: (g.yo || 0) + (FACE_H[id] || 1) - B.faceH }); return B.draw(v, g2); }
    return B.draw(v, g);
  };
  def._foeWrap = 1;
}
for (const [id, def] of Object.entries(MAPDEFS)) foeWrapModel(def, id);
startGame = (o => function (...a) { for (const [id, def] of Object.entries(MAPDEFS)) foeWrapModel(def, id); FOE.scareWho = FOE.pick === "b" ? 1 : 0; return o.apply(this, a); })(startGame);

// ---------- 5. Chọn ma ở màn hình chọn map ----------
(function foeUI() {
  const st = document.createElement("style");
  st.textContent = `#foeBtns a{min-width:0} #foeDesc{margin:.2em 0 0;opacity:.85;font-size:.92em}`;
  document.head.appendChild(st);
  const diff = $("diffDesc"); if (!diff) return;
  const h = document.createElement("div"); h.className = "hdr2"; h.textContent = "Con ma";
  const box = document.createElement("div"); box.id = "foeBtns"; box.className = "opts";
  diff.after(h, box);
})();
function renderFoe() {
  const box = $("foeBtns"); if (!box) return; box.innerHTML = "";
  const n = FOE_INFO[MAPID] || FOE_INFO.house, guest = NET.ok && !NET.host;
  for (const [k, txt] of [["a", n.a], ["b", n.b], ["ab", "Cả hai"]]) {
    const a = document.createElement("a"); a.textContent = txt; a.classList.toggle("sel", FOE.pick === k);
    a.onclick = () => { if (guest) return; FOE.pick = k; try { localStorage.setItem("aakh-foe", k); } catch (e) {} renderFoe(); try { netLobby(); } catch (e) {} };
    box.appendChild(a);
  }
}
function foeHookCards() { const list = $("mapCards"); if (!list) return; [...list.children].forEach(a => { if (a._foe) return; const o = a.onclick; a.onclick = function (...x) { const r = o && o.apply(this, x); renderFoe(); return r; }; a._foe = 1; }); }
buildMenus = (o => function (...a) { const r = o.apply(this, a); foeHookCards(); renderFoe(); return r; })(buildMenus);
foeHookCards(); renderFoe();

// ---------- 6. Chơi online: chủ phòng quyết định ----------
netSend = (o => function (m) { if (m && (m.t === "lobby" || m.t === "start")) m.foe = FOE.pick; return o(m); })(netSend);
netRecv = (o => function (m) { if (m && (m.t === "lobby" || m.t === "start") && (m.foe === "a" || m.foe === "b" || m.foe === "ab")) { FOE.pick = m.foe; renderFoe(); } return o(m); })(netRecv);

// Siêu khó không còn "hai con ma từ đầu" — số ma do người chơi chọn
if (DIFF.sieu) DIFF.sieu.desc = DIFF.sieu.desc.replace("HAI con ma từ đầu", "ma cực nhanh, càng chơi càng hung");
