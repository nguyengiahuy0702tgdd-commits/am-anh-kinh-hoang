// =====================================================================
//  24. BẢN 11: nhện nhảy úp mặt · "đạo diễn" hù dọa ngẫu nhiên
//      (tiếng động sau lưng · vật thể lén di chuyển · ảo giác · cửa tự đóng sầm · giao diện nhiễu)
// =====================================================================
// ---- Nhện: thân & chân dùng chung cho mọi tư thế ----
function spiderBody(v, X, walk, hang) {
  const m = T.spiderT;
  psphere(v, XSp(X, 0, 0, -.55, 1, .85, 1.25), 0, 0, -.55, .42, 9, m); psphere(v, X, 0, .02, .12, .26, 8, m);
  for (const sx of [-1, 1]) { psphere(v, X, sx * .08, .12, .34, .045, 5, T.redEye || T.flame); psphere(v, X, sx * .04, .16, .36, .03, 5, T.redEye || T.flame); }
  for (const sx of [-1, 1]) pcyl(v, XL(X, sx * .06, 0, .36, .6, 0), sx * .06, .36, -.18, 0, .025, .045, 5, m, m);   // răng nanh
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
    const w = Math.sin(walk + i * 1.7 + (sx > 0 ? Math.PI : 0)) * .18, z0 = .2 - i * .14, spread = (i - 1.5) * .55;
    const A = X.p(sx * .2, 0, z0), Kn = X.p(sx * .75, hang ? .25 : .5, z0 + Math.sin(spread) * .9 + w), Ft = X.p(sx * 1.15, hang ? -.45 : -.32, z0 + Math.sin(spread) * 1.4 + w * 1.4);
    const kk = Math.hypot(...[0, 1, 2].map(j => X.p(1, 0, 0)[j] - X.p(0, 0, 0)[j]));
    legSeg(v, A, Kn, .045 * kk, m); legSeg(v, Kn, Ft, .035 * kk, m);
  }
}
function spiderModel(v, x, y, z, k, face, walk, hang) { const f = facing(face); spiderBody(v, XF(x, y, z, f.c, f.s, k), walk, hang); }
function camBasis() {
  const p = P1.pitch, a = P1.a, fw = [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)];
  return { eye: [P1.x, EYE + eyeOff(P1) + Math.sin(P1.bob) * .025, P1.y], fw };
}
// Trạng thái mới: "leap" (bật về phía mặt) → "face" (úp lên mặt) → "off" (bị gỡ ra, rơi xuống, bò đi)

function faceHint(on) { const el = $("faceHint"); el.classList.toggle("hidden", !on); }
function shakeOff(amount) { for (const s of SPIDERS) if (s.st === "face") { s.shook += amount; if (Math.random() < .3) noise(.05, 1800, .15, 2); } }
addEventListener("keydown", e => { if (e.code === "KeyE" || e.code === "Space") shakeOff(.2); }, true);
addEventListener("mousemove", e => { if (document.pointerLockElement === cv) shakeOff(Math.min(.06, Math.hypot(e.movementX, e.movementY) * .0009)); });
addEventListener("mousedown", () => shakeOff(.12));
function drawSpiders(v) {
  for (const s of SPIDERS) {
    if (s.f !== F.id) continue;
    if (s.st === "face" && player === P1) {   // úp ngay lên mặt: bụng nhện quay về phía camera, chân cào quanh khung hình
      const { eye, fw } = camBasis(), f = facing(P1.a + Math.PI), X = XL(XF(eye[0] + fw[0] * .16, eye[1] + fw[1] * .16 - .03, eye[2] + fw[2] * .16, f.c, f.s, .11), 0, 0, 0, -1.05 + P1.pitch + Math.sin(t * 9) * .05, Math.sin(t * 7) * .1);
      spiderBody(v, X, t * 26, 0); continue;
    }
    if ((s.st === "leap" || s.st === "off") && s.pos) { spiderModel(v, s.pos[0], s.pos[1], s.pos[2], .08, Math.atan2(P1.y - s.pos[2], P1.x - s.pos[0]), t * 20, 1); continue; }
    if (Math.abs(s.x - player.x) + Math.abs(s.y - player.y) > 14) continue;
    if (s.st === "crawl") { spiderModel(v, s.x, .012, s.y, s.big === 0 ? .045 : .028, s.face, t * 22 * (s.go ? 1 : 0), 0); continue; }
    pbox(v, XW, s.x - .003, s.cy + .02, s.y - .003, s.x + .003, s.top, s.y + .003, T.webCorner);
    spiderModel(v, s.x, s.cy, s.y, .075, s.face + Math.sin(t * 1.3) * .3, t * 2, 1);
  }
  drawWatchers(v); drawHallu(v);
}

// ---- "Đạo diễn" hù dọa: chọn sự kiện ngẫu nhiên, có thời gian hồi để không lặp lại lộ liễu ----
const FX = { fov: 0, gap: 25, walk: 0, lx: null, ly: null, cd: { behind: 40, shadow: 15, slam: 50, glitch: 30, flick: 5 }, door: null, slam: null, hallu: null, roll: 1 };
const danger = () => Math.max(0, Math.min(1, (7 - minGhostD) / 5)) * (S.woke ? 1 : .3);

// 1) Tiếng bước chân / hơi thở ngay sau lưng
function soundBehind() {
  if (!ac) return false; FX.walk = 0; const t0 = ac.currentTime + .1, pan = (Math.random() - .5) * .5, n = 2 + Math.floor(Math.random() * 3), breath = Math.random() < .55;
  const out = ac.createStereoPanner(); out.pan.value = pan; const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.connect(out); out.connect(BUS.sfx);
  const burst = (at, dur, f, g) => { const len = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const s = ac.createBufferSource(); s.buffer = b; const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; const gg = ac.createGain(); gg.gain.value = g; s.connect(bp); bp.connect(gg); gg.connect(lp); s.start(at); };
  if (breath) { for (let i = 0; i < 2; i++) { const len = Math.floor(ac.sampleRate * 1.3), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.sin(k / len * Math.PI) * .6;
    const s = ac.createBufferSource(); s.buffer = b; const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900 + i * 300; bp.Q.value = .7; const g = ac.createGain(); g.gain.value = .5; s.connect(bp); bp.connect(g); g.connect(lp); s.start(t0 + i * 1.6); } }
  else for (let i = 0; i < n; i++) burst(t0 + i * (.42 + Math.random() * .1), .09, 150 + Math.random() * 40, .55 - i * .06);
}
// 2) Vật thể chỉ di chuyển / quay mặt khi bạn KHÔNG nhìn nó (ma-nơ-canh, tượng, bóng đen)
const WATCHERS = [];
function setupWatchers() {
  WATCHERS.length = 0; const kind = { house: "mannequin", factory: "mannequin", castle: "statue", cemetery: "shadow", forest: "shadow", hospital: "patient" }[MAPID];
  for (const f of Object.values(FLOORS)) {
    const cells = []; for (let y = 2; y < f.h - 2; y++) for (let x = 2; x < f.w - 2; x++) if (f.grid[y][x] === "." && (!f.outdoor || MAPID === "forest" || f.room[y * f.w + x]) && !f.sprites.some(s => !s.taken && s.solid && Math.hypot(s.x - x - .5, s.y - y - .5) < 1)) cells.push([x + .5, y + .5]);
    const n = Math.min(4, Math.max(1, Math.round(cells.length / 220)));
    for (let i = 0; i < n && cells.length; i++) { const [x, y] = cells[Math.floor(Math.random() * cells.length)]; if (f === F && Math.hypot(x - P1.x, y - P1.y) < 8) continue; WATCHERS.push({ f: f.id, x, y, face: Math.random() * 6.28, kind, seen: 0, cd: 5 }); }
  }
}
function inView(x, y, margin = .14) {
  const ang = Math.atan2(y - P1.y, x - P1.x), d = Math.hypot(x - P1.x, y - P1.y), half = Math.atan(Math.tan((SET.hfov + FX.fov) * Math.PI / 360)) + margin;
  return Math.abs(angTo(P1.a, ang)) < half && d < 20 && lineClear(P1.x, P1.y, x, y);
}

function drawWatchers(v) {
  for (const w of WATCHERS) {
    if (w.f !== F.id || Math.abs(w.x - player.x) + Math.abs(w.y - player.y) > 22) continue; const { c, s } = facing(w.face);
    if (w.kind === "mannequin") { const X = XF(w.x, 0, w.y, c, s, .46); pcyl(v, X, 0, 0, 0, .04, .2, .2, 12, T.metal, T.metal); pcyl(v, X, 0, 0, .04, .88, .02, .02, 6, T.metal);
      humanoid(v, X, { skin: T.mannequinT, face: T.mannequinFace, top: T.mannequinT, bottom: T.mannequinT, shoe: T.mannequinT, legs: T.mannequinT, slim: .9 }, { armL: .05, armR: .05, headAz: 0 }); }
    else if (w.kind === "statue") humanoid(v, XF(w.x, 0, w.y, c, s, .47), { skin: T.stoneW, face: T.statueFace, top: T.stoneW, bottom: T.stoneW, shoe: T.stoneW, skirt: { m: T.stoneW, y0: 0, r: .38 }, hair: T.stoneW, hairLen: "long" }, { armL: -.4, armR: -.4, elL: -1.2, elR: -1.2 });
    else if (w.kind === "patient") hospPatient(v, w, c, s);
    else humanoid(v, XF(w.x, 0, w.y, c, s, .5), { skin: T.shadowT, face: T.shadowFace, top: T.shadowT, bottom: T.shadowT, shoe: T.shadowT, slim: .8 }, { armL: .05, armR: .05, headAx: .15 });
  }
}
// 3) Ảo giác: bóng người thoáng hiện ở rìa khung hình 0,2 giây
function peripheralShadow() {
  const side = Math.random() < .5 ? -1 : 1, half = Math.atan(Math.tan(SET.hfov * Math.PI / 360)) / 1.0, ang = P1.a + side * (half * .82), dist = 2.5 + Math.random() * 2.5;
  const x = P1.x + Math.cos(ang) * dist, y = P1.y + Math.sin(ang) * dist; if (F.grid[Math.floor(y)]?.[Math.floor(x)] !== "." || !lineClear(P1.x, P1.y, x, y)) return false;
  FX.hallu = { x, y, face: Math.atan2(P1.y - y, P1.x - x), until: t + .2 }; if (Math.random() < .5) noise(.15, 4000, .05, 4);
}
function drawHallu(v) { const h = FX.hallu; if (!h) return; const { c, s } = facing(h.face); humanoid(v, XF(h.x, 0, h.y, c, s, .5), { skin: T.shadowT, face: T.shadowFace, top: T.shadowT, bottom: T.shadowT, shoe: T.shadowT, slim: .75 }, { armL: .05, armR: .05 }); }
// 4) Cửa tự đóng sầm sau lưng (rồi khóa trái vài giây)
function isDoorway(f, x, y) {
  if (f.grid[y]?.[x] !== "." || (f.outdoor && !f.room[y * f.w + x]?.roof)) return false; const W = (a, b) => f.grid[b]?.[a] === "#", O = (a, b) => f.grid[b]?.[a] === ".";
  return (W(x - 1, y) && W(x + 1, y) && O(x, y - 1) && O(x, y + 1)) || (W(x, y - 1) && W(x, y + 1) && O(x - 1, y) && O(x + 1, y));
}
function doorWatch() {
  const cx = Math.floor(P1.x), cy = Math.floor(P1.y);
  if (isDoorway(F, cx, cy)) { FX.door = null; FX.inDoor = { x: cx, y: cy, f: F.id }; return; }
  if (FX.inDoor && FX.inDoor.f === F.id) { const d = Math.hypot(FX.inDoor.x + .5 - P1.x, FX.inDoor.y + .5 - P1.y); if (d > 1.6 && d < 4) FX.door = FX.inDoor; else if (d >= 4) { FX.door = FX.inDoor = null; } }
}
function slamDoor() {
  const D = FX.door; if (!D || D.f !== F.id || FX.slam) return false;
  if (inView(D.x + .5, D.y + .5, -.1) || ghosts.some(g => g.floor === F.id && Math.hypot(g.x - D.x - .5, g.y - D.y - .5) < 1.5) || players().some(p => Math.hypot(p.x - D.x - .5, p.y - D.y - .5) < .9) || F.sprites.some(s => !s.taken && Math.hypot(s.x - D.x - .5, s.y - D.y - .5) < .6)) return false;
  F.grid[D.y][D.x] = "Ø"; buildFloorMesh(F); FX.slam = { ...D, until: t + 7 + Math.random() * 6 }; FX.door = FX.inDoor = null;
  noise(.5, 90, .9, .4); noise(.15, 600, .5, 1.2); for (let i = 0; i < 2; i++) noise(.05, 3500, .3, 4, .55 + i * .12); P1.shake = .35; flickerUntil = t + .3;
  if (Math.random() < .5) setTimeout(() => say(["Cánh cửa sau lưng bạn đóng sầm lại... rồi tiếng chốt khóa lách cách.", "RẦM! Có ai đó vừa đóng cửa. Không phải bạn.", "Cạch. Cửa đã bị khóa từ phía bên kia."][Math.floor(Math.random() * 3)]), 600);
}
function reopenDoor() { const D = FX.slam; FX.slam = null; const f = FLOORS[D.f]; if (f.grid[D.y][D.x] === "Ø") { f.grid[D.y][D.x] = "."; if (f === F) { buildFloorMesh(F); noise(1.4, 400, .2, .4); tone(180, 0, 1.2, .04, "sawtooth"); } } }
// 5) Giao diện nhiễu: thanh chỉ số nhảy loạn, chữ bị xáo trộn
function uiGlitch() {
  const hx = $("hudx"); hx.classList.add("glitch"); const saved = [], scr = s => [...s].map(ch => ch === " " ? " " : Math.random() < .5 ? "▓▒░#@%&?"[Math.floor(Math.random() * 8)] : ch).join("");
  for (const el of hx.querySelectorAll("#taskHint, #playClock, .sr b, #tasks .th")) { saved.push([el, el.innerHTML]); el.textContent = scr(el.textContent); }
  noise(.5, 6000, .12, 2); noise(.3, 120, .2, .6);
  if (Math.random() < .35) { $("playClock").textContent = "Thời gian 66:66"; setTimeout(() => say(["ĐỪNG QUAY LẠI.", "NÓ ĐANG Ở ĐÂY.", "BẠN KHÔNG MỘT MÌNH.", "Chơi với em đi..."][Math.floor(Math.random() * 4)]), 200); }
  setTimeout(() => { hx.classList.remove("glitch"); saved.forEach(([el, h]) => { if (el.isConnected) el.innerHTML = h; }); }, 650 + Math.random() * 600);
}
function buildFxTextures() {
  T.mannequinT = tex(g => { R(g, 0, 0, 128, 128, "#d8ccb8"); for (let i = 0; i < 40; i++) R(g, rnd() * 128, rnd() * 128, 2, 2, "rgba(120,100,80,.25)"); stain(g, 90, 40, 14, "rgba(90,0,0,.35)"); });
  T.mannequinFace = tex(g => { R(g, 0, 0, 128, 128, "#d8ccb8"); E(g, 54, 58, 5, 2.5, "rgba(80,60,50,.35)"); E(g, 74, 58, 5, 2.5, "rgba(80,60,50,.35)"); R(g, 62, 60, 3, 12, "rgba(120,100,80,.3)"); });
  T.statueFace = tex(g => { R(g, 0, 0, 128, 128, "#6a6862"); E(g, 54, 58, 5, 4, "#2a2826"); E(g, 74, 58, 5, 4, "#2a2826"); R(g, 56, 64, 2, 30, "rgba(30,10,10,.6)"); R(g, 74, 64, 2, 26, "rgba(30,10,10,.6)"); });
  T.shadowT = tex(g => { R(g, 0, 0, 128, 128, "#040303"); for (let i = 0; i < 60; i++) R(g, rnd() * 128, rnd() * 128, 1, 6, "rgba(30,20,20,.4)"); });
  T.shadowFace = tex(g => { R(g, 0, 0, 128, 128, "#040303"); E(g, 54, 56, 3, 2, "#e8e0d0"); E(g, 74, 56, 3, 2, "#e8e0d0"); }, g => { E(g, 54, 56, 3, 2, "rgba(255,240,220,1)"); E(g, 74, 56, 3, 2, "rgba(255,240,220,1)"); });
  T.slamDoor = tex(g => { R(g, 0, 0, 128, 128, "#3a2618"); R(g, 30, 0, 68, 128, "#4a3020"); for (const y of [12, 70]) R(g, 38, y, 52, 44, "#3a2418"); E(g, 86, 74, 4, 4, "#b8a070"); for (let i = 0; i < 6; i++) R(g, 34 + rnd() * 60, rnd() * 128, 3, 30, "rgba(60,0,0,.5)"); });
}
