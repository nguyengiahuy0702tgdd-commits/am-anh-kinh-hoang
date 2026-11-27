// =====================================================================
//  25. BẢN 12: chỉ hù vào lúc quan trọng / khi người chơi im lặng quá lâu
//      đồ vật đúng kích thước đời thật · phòng đầy đủ đồ đạc theo công năng
// =====================================================================

// ---------- 1. ĐIỀU PHỐI HÙ DỌA ----------
// "Cửa sổ hù" chỉ mở khi: nhặt đồ / xong một bước nhiệm vụ / ma thức dậy / thêm ma / sang tầng mới,
// hoặc khi người chơi đứng yên, rón rén im lặng quá lâu. Mỗi cửa sổ tối đa một cú hù.
const SCARE = { win: 0, kind: "", quiet: 0, need: 30, last: null, faceAt: -1e9, faceN: 0, amb: 40, px: null, py: null, play: 0, delay: null, total: 0 };
const scareOpen = () => t < SCARE.win;
function scareMoment(kind, dur) { if (!S.started) return; if (scareOpen() && SCARE.kind === "moment") return; SCARE.win = t + dur; SCARE.kind = kind; SCARE.delay = (kind === "quiet" ? .3 : 1.5) + Math.random() * (kind === "quiet" ? 2.5 : 7); }
function scareSnap() { return { inv: inv.length, task: TASKS.reduce((a, q) => a + q.got, 0), g: ghosts.length, woke: !!S.woke, f: F.id, goals: (GOALS || []).filter(g => { try { return safeG(g[0]); } catch (e) { return false; } }).length }; }
function scareTick(dt) {
  if (!S.started || S.paused || S.ending || CUT.on || P1.dead) return;
  SCARE.play += dt; SCARE.amb -= dt;
  if ((SCARE.snapT = (SCARE.snapT || 0) - dt) <= 0) {
    SCARE.snapT = .5; const n = scareSnap(), L = SCARE.last; SCARE.last = n;
    if (L && (n.inv > L.inv || n.task > L.task || n.g > L.g || n.woke !== L.woke || n.f !== L.f || n.goals > L.goals)) scareMoment("moment", 14 + Math.random() * 18);
  }
  const sp = SCARE.px == null ? 0 : Math.hypot(P1.x - SCARE.px, P1.y - SCARE.py) / Math.max(dt, .001); SCARE.px = P1.x; SCARE.py = P1.y;
  const calm = danger() < .12 && !P1.hidden && !SPIDERS.some(s => s.st === "face" || s.st === "leap" || s.st === "dangle") && (sp < .25 || (P1.crouch && sp < 1.6));
  SCARE.quiet = calm ? SCARE.quiet + dt : Math.max(0, SCARE.quiet - dt * 3);
  if (SCARE.quiet > SCARE.need && !scareOpen() && SCARE.play > 40) { SCARE.quiet = 0; SCARE.need = 40 + Math.random() * 45; scareMoment("quiet", 9); }
  if (!scareOpen() || SCARE.delay == null) return;
  if ((SCARE.delay -= dt) > 0) return;
  SCARE.delay = null;
  if (Math.random() < .22) { SCARE.win = 0; return; }   // đôi khi chẳng có gì xảy ra — để người chơi không đoán được
  if (fireScare() !== false) { SCARE.win = 0; SCARE.total++; } else SCARE.delay = 1 + Math.random() * 2;
}
function fireScare() {
  const dz = danger(), quiet = SCARE.kind === "quiet", opts = [];
  if (SCARE.play > 70 && t - SCARE.faceAt > 150 && SCARE.faceN < 5 && dz < .45 && !P1.hidden) opts.push(["spider", quiet ? 1.4 : .9]);
  if (FX.cd.behind <= 0 && (quiet || FX.walk > 10)) opts.push(["behind", quiet ? 1.3 : .7]);
  if (FX.cd.shadow <= 0) opts.push(["shadow", .7 + dz]);
  if (FX.cd.slam <= 0 && FX.door && !CHASING) opts.push(["slam", 1.3]);
  if (FX.cd.glitch <= 0) opts.push(["glitch", .45 + dz * .6]);
  if (SCARE.amb <= 0) opts.push(["amb", .8]); if ((FX.cd.face ?? 0) <= 0) opts.push(["face", .6 + dz * .8]);
  while (opts.length) {
    let r = Math.random() * opts.reduce((a, b) => a + b[1], 0), i = 0; for (; i < opts.length - 1; i++) if ((r -= opts[i][1]) <= 0) break;
    const [ev] = opts.splice(i, 1)[0];
    const ok = { spider: spiderAmbush, behind: soundBehind, shadow: peripheralShadow, slam: slamDoor, glitch: uiGlitch, amb: ambientEventRaw, face: faceFlash }[ev]();
    if (ok === false) continue;
    if (ev === "amb") SCARE.amb = 50 + Math.random() * 50;
    else if (ev !== "spider") FX.cd[ev] = { behind: 90, shadow: 45, slam: 110, glitch: 80, face: 100 }[ev] * (.7 + Math.random() * .8);
    return true;
  }
  return false;
}
function ambientEvent() {}   // vòng lặp hù ngẫu nhiên cũ (18–38 giây/lần) đã bỏ: giờ chỉ chạy qua fireScare()

// Nhện úp mặt: chọn một con trên trần ngay trước mặt, nó tuột tơ xuống chậm rãi... rồi bật thẳng vào mặt
function spiderAmbush() {
  const cand = SPIDERS.filter(s => s.f === F.id && s.st === "idle"); if (!cand.length) return false;
  const roofOK = (cx, cy) => F.grid[cy]?.[cx] === "." && (!F.outdoor || F.room[cy * F.w + cx]?.roof || MAPID === "forest");
  let spot = null;
  for (let i = 0; i < 14 && !spot; i++) {
    const a = P1.a + (Math.random() - .5) * .5, d = 1 + Math.random() * .6, x = P1.x + Math.cos(a) * d, y = P1.y + Math.sin(a) * d;
    if (roofOK(Math.floor(x), Math.floor(y)) && lineClear(P1.x, P1.y, x, y) && canStand(x, y)) spot = { x, y };
  }
  if (!spot) return false;
  const s = cand.sort((a, b) => Math.hypot(a.x - P1.x, a.y - P1.y) - Math.hypot(b.x - P1.x, b.y - P1.y))[0], cx = Math.floor(spot.x), cy = Math.floor(spot.y);
  const top = MAPID === "forest" && !F.room[cy * F.w + cx]?.roof ? 2.4 : (F.room[cy * F.w + cx]?.h ?? WH);
  Object.assign(s, { x: spot.x, y: spot.y, top, cy: top - .05, st: "dangle", t: 0 });
  SCARE.faceAt = t; SCARE.faceN++; noise(.6, 2600, .05, 1.5);
}
// Thay thế spiderTick: nhện trên trần không còn tự nhảy vào mặt mỗi khi bạn đi ngang
function spiderTick(dt) {
  for (const s of SPIDERS) {
    if (s.f !== F.id) continue; s.t += dt;
    if (s.st === "crawl") {
      if ((s.turn = (s.turn || 0) - dt) <= 0) { s.turn = .6 + Math.random() * 1.8; s.face += (Math.random() - .5) * 2.4; s.go = Math.random() < .7; }
      if (s.go) { const nx = s.x + Math.cos(s.face) * s.sp * dt, ny = s.y + Math.sin(s.face) * s.sp * dt; if (F.grid[Math.floor(ny)]?.[Math.floor(nx)] === ".") { s.x = nx; s.y = ny; } else s.face += Math.PI * .7; }
      const d = Math.hypot(s.x - P1.x, s.y - P1.y); if (d < .7 && !s.fled) { s.fled = 1; s.face = Math.atan2(s.y - P1.y, s.x - P1.x); s.sp = .9; s.go = true; noise(.25, 5000, .06, 2); }
      if (d > 3) { s.fled = 0; s.sp = Math.min(s.sp, .5); }
      continue;
    }
    if (s.st === "idle") {   // chỉ khẽ thả mình xuống một đoạn rồi leo ngược lên khi bạn đi ngang
      const d = Math.hypot(s.x - P1.x, s.y - P1.y), goal = d < 1.6 ? s.top - .28 : s.top - .05; s.cy += (goal - s.cy) * Math.min(1, dt * (d < 1.6 ? .8 : .4));
    } else if (s.st === "dangle") {   // tuột tơ xuống ngang tầm mắt, ngay trước mặt
      const goal = EYE + .1; s.cy = Math.max(goal, s.cy - dt * .55); s.face = Math.atan2(P1.y - s.y, P1.x - s.x);
      if ((s.sc = (s.sc || 0) - dt) <= 0) { s.sc = .25 + Math.random() * .3; noise(.05, 3200 + Math.random() * 1500, .05, 3); }
      if (s.cy <= goal + .001 && (s.hold = (s.hold || 0) + dt) > .45 + Math.random() * .4) { s.hold = 0; s.st = "leap"; s.t = 0; s.from = [s.x, s.cy, s.y]; s.pos = null; noise(.22, 2600, .4, 1.4); tone(85, 0, .4, .3, "sine"); }
    } else if (s.st === "leap") {
      const { eye, fw } = camBasis(), to = [eye[0] + fw[0] * .12, eye[1] + fw[1] * .12, eye[2] + fw[2] * .12], u = Math.min(1, s.t / .3);
      s.pos = s.pos || [0, 0, 0]; for (let j = 0; j < 3; j++) s.pos[j] = s.from[j] + (to[j] - s.from[j]) * u + (j === 1 ? Math.sin(u * Math.PI) * .15 : 0);
      if (u >= 1) { s.st = "face"; s.t = 0; s.shook = 0; P1.shake = .6; hurt = Math.max(hurt, .45); screech(); noise(.4, 300, .5, .6); faceHint(true); }
    } else if (s.st === "face") {
      s.shook = Math.max(0, s.shook - dt * .35); P1.shake = Math.max(P1.shake || 0, .12); hurt = Math.max(hurt, .08);
      if ((s.sc = (s.sc || 0) - dt) <= 0) { s.sc = .18 + Math.random() * .25; noise(.08, 3000 + Math.random() * 2000, .12, 3); }
      if (s.shook >= 1 || s.t > 6) {
        const late = s.t > 6; s.st = "off"; s.t = 0; faceHint(false); s.vy = 0; const { eye, fw } = camBasis(); s.pos = [eye[0] + fw[0] * .3, eye[1], eye[2] + fw[2] * .3]; noise(.15, 1200, .3, 1);
        if (late && P1.hp > 1 && Math.random() < .4) { P1.hp--; hurt = 1; say("Nó cắn bạn một phát rồi mới chịu buông ra... (-1 máu)"); }
      }
    } else if (s.st === "off") {
      s.vy += 9.8 * dt; s.pos[1] = Math.max(.012, s.pos[1] - s.vy * dt);
      if (s.pos[1] <= .012) Object.assign(s, { st: "crawl", x: s.pos[0], y: s.pos[2], sp: 1.1, go: true, fled: 1, big: 0, face: Math.atan2(s.pos[2] - P1.y, s.pos[0] - P1.x) });
    }
  }
  if (P1.shake > 0) P1.shake -= dt;
}
// Thay thế directorTick: chỉ giữ hiệu ứng nền khi ma ở gần (đèn chập chờn, méo góc nhìn); các cú hù do fireScare() quyết định
function directorTick(dt) {
  if (!S.started || S.paused || S.ending || CUT.on || P1.dead) return;
  const dz = danger(); for (const k in FX.cd) FX.cd[k] -= dt;
  if (FX.lx != null) FX.walk += Math.hypot(P1.x - FX.lx, P1.y - FX.ly); FX.lx = P1.x; FX.ly = P1.y;
  FX.fov += ((dz > .3 ? Math.sin(t * 1.1) * 4 * dz + Math.sin(t * 3.7) * 1.2 * dz : 0) - FX.fov) * Math.min(1, dt * 2);
  if (dz > .4 && FX.cd.flick <= 0 && Math.random() < dt * (.25 + dz * .6)) { flickerUntil = t + .12 + Math.random() * .45; FX.cd.flick = 2 + Math.random() * 5; if (Math.random() < .4) noise(.06, 3500, .08, 3); }
  doorWatch(); watcherTick(dt); if (FX.hallu && t > FX.hallu.until) FX.hallu = null;
  if (FX.slam && t > FX.slam.until) reopenDoor();
}
function watcherTick(dt) {
  for (const w of WATCHERS) {
    if (w.f !== F.id) continue; w.cd -= dt; const d = Math.hypot(w.x - P1.x, w.y - P1.y);
    if (inView(w.x, w.y)) { w.seen = t; continue; }
    if (t - w.seen < 1.5 || w.cd > 0 || d > 16 || Math.random() > dt * .3) continue;
    w.cd = 6 + Math.random() * 12; w.face = Math.atan2(P1.y - w.y, P1.x - w.x);
    if (d > 2.6 && Math.random() < .6) {
      const st = Math.min(d - 2.2, .5 + Math.random() * 1), nx = w.x + Math.cos(w.face) * st, ny = w.y + Math.sin(w.face) * st;
      if (F.grid[Math.floor(ny)]?.[Math.floor(nx)] === "." && canStand(nx, ny) && !inView(nx, ny, .05)) { w.x = nx; w.y = ny; if (scareOpen() && Math.random() < .5) noise(.3, 220, .05, .6); }
    }
  }
}

// ---------- 2. KÍCH THƯỚC THẬT ----------
const M = .47;   // 1 mét = 0,47 đơn vị thế giới (mắt người 1,55 m)
const REAL_H = { car: 1.47, d_shelf: 1.9, armor: 1.85, generator: 1.95, loom: 1.6, d_gascyl: 1.45, d_cone: .7, d_lamp: 1.6, d_candelabra: 1.5, "m:crate": 1.1, d_crates: 1.2, rack: 1.9, d_cage: 1.6 };
function sprK(s) {
  if (s.k && s.k.startsWith("r_")) return 1;
  if (s.hang || NOSCALE.has(s.k) || s.t === T.hangDoll || s.t === "bulb") return 1;
  const key = s.k || (s.mesh ? "m:" + s.mesh : s.t === T.car ? "car" : "t:" + LAYER.get(s.t));
  if (KH[key] == null) {
    const tmp = [], ob = F.blocks; F.blocks = []; XFK = 1; try { furnitureRaw(tmp, { ...s, x: 0, y: 0, base: 0, rot: 0 }); } catch (e) {} F.blocks = ob;
    let h = 0; for (let i = 1; i < tmp.length; i += 9) h = Math.max(h, tmp[i]);
    KH[key] = REAL_H[key] && h > 0 ? REAL_H[key] * M / h : h > 2.1 || h === 0 ? 1 : .52;
  }
  return KH[key];
}
// Cây rừng cao 13–20 m như ngoài đời (trước chỉ 9–13 m)

// ---------- 3. VẬT LIỆU MỚI ----------
function buildRealTextures() {
  if (T.r_rug) return;
  const noiseOn = (g, n, c) => { for (let i = 0; i < n; i++) R(g, rnd() * 128, rnd() * 128, 1 + rnd() * 2, 1 + rnd() * 2, c); };
  T.r_quilt = tex(g => { const cs = ["#5a2a26", "#3a4a36", "#6a5a44", "#2e3448", "#5c4a3a"]; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { R(g, x * 32, y * 32, 32, 32, cs[(x * 3 + y * 2) % 5]); R(g, x * 32 + 4, y * 32 + 4, 24, 24, cs[(x + y * 3 + 2) % 5]); } g.strokeStyle = "rgba(200,180,150,.35)"; g.setLineDash([2, 2]); for (let i = 0; i <= 4; i++) { g.strokeRect(i * 32, 0, 0, 128); g.strokeRect(0, i * 32, 128, 0); } noiseOn(g, 500, "rgba(0,0,0,.18)"); stain(g, 80, 70, 26, "rgba(60,0,0,.45)"); stain(g, 30, 30, 18, "rgba(70,60,20,.35)"); });
  T.r_rug = tex(g => { R(g, 0, 0, 128, 128, "#4a1210"); R(g, 6, 6, 116, 116, "#1e2a3a"); R(g, 12, 12, 104, 104, "#5a1814"); for (let i = 0; i < 26; i++) { R(g, 8 + i * 4.4, 7, 2, 4, "#c8a060"); R(g, 8 + i * 4.4, 117, 2, 4, "#c8a060"); R(g, 7, 8 + i * 4.4, 4, 2, "#c8a060"); R(g, 117, 8 + i * 4.4, 4, 2, "#c8a060"); }
    g.fillStyle = "#1e2a3a"; g.beginPath(); g.moveTo(64, 26); g.lineTo(100, 64); g.lineTo(64, 102); g.lineTo(28, 64); g.fill(); g.fillStyle = "#b08040"; g.beginPath(); g.moveTo(64, 40); g.lineTo(86, 64); g.lineTo(64, 88); g.lineTo(42, 64); g.fill(); E(g, 64, 64, 10, 10, "#5a1814");
    for (const [x, y] of [[26, 26], [102, 26], [26, 102], [102, 102]]) E(g, x, y, 8, 8, "#1e2a3a"); noiseOn(g, 900, "rgba(0,0,0,.22)"); for (let i = 0; i < 300; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, "rgba(220,190,140,.15)"); stain(g, 40, 80, 22, "rgba(20,0,0,.6)"); });
  T.r_velvet = tex(g => { const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, "#3a0a0c"); gr.addColorStop(.5, "#5e1418"); gr.addColorStop(1, "#2a0608"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); noiseOn(g, 700, "rgba(0,0,0,.2)"); for (let i = 0; i < 6; i++) stain(g, rnd() * 128, rnd() * 128, 14, "rgba(30,20,10,.35)"); });
  T.r_lacquer = tex(g => { R(g, 0, 0, 128, 128, "#0c0a0a"); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,255,255,.08)"); gr.addColorStop(.3, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); noiseOn(g, 40, "rgba(120,110,100,.08)"); });
  T.r_keys = tex(g => { R(g, 0, 0, 128, 128, "#d8d0bc"); for (let i = 0; i <= 26; i++) R(g, i * 4.9, 0, .7, 128, "#4a4438"); for (let i = 0; i < 26; i++) if ([0, 1, 3, 4, 5].includes(i % 7)) R(g, i * 4.9 + 3.2, 0, 3, 76, "#141010"); noiseOn(g, 200, "rgba(90,70,30,.2)"); });
  T.r_greyP = tex(g => { R(g, 0, 0, 128, 128, "#5a5e5c"); for (let i = 0; i < 40; i++) R(g, rnd() * 128, rnd() * 128, rnd() * 18, .6, "rgba(200,200,190,.18)"); for (let i = 0; i < 8; i++) stain(g, rnd() * 128, 90 + rnd() * 38, 10, "rgba(100,50,15,.45)"); noiseOn(g, 300, "rgba(0,0,0,.15)"); });
  T.r_elec = tex(g => { R(g, 0, 0, 128, 128, "#62686a"); R(g, 2, 2, 124, 124, "#585e60"); for (let y = 10; y < 30; y += 4) R(g, 34, y, 60, 2, "#22262a"); for (let y = 100; y < 120; y += 4) R(g, 34, y, 60, 2, "#22262a");
    g.fillStyle = "#e0b020"; g.beginPath(); g.moveTo(64, 42); g.lineTo(84, 76); g.lineTo(44, 76); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 2.5; g.stroke(); g.fillStyle = "#111"; g.beginPath(); g.moveTo(66, 50); g.lineTo(58, 64); g.lineTo(65, 63); g.lineTo(60, 73); g.lineTo(71, 58); g.lineTo(64, 59); g.fill();
    R(g, 46, 82, 36, 9, "#d8d4c8"); g.fillStyle = "#a01010"; g.font = "bold 7px sans-serif"; g.fillText("NGUY HIỂM", 47, 89); R(g, 112, 56, 6, 18, "#2a2a2a"); E(g, 115, 50, 3, 3, "#1a1a1a"); R(g, 12, 36, 10, 10, "#1a1a1a"); R(g, 12, 50, 10, 10, "#1a1a1a");
    for (let i = 0; i < 10; i++) stain(g, rnd() * 128, rnd() * 128, 8, "rgba(110,55,20,.4)"); }, g => { E(g, 17, 41, 3, 3, "#ff2a20"); E(g, 17, 55, 3, 3, "#30ff60"); });
  T.r_panel = tex(g => { R(g, 0, 0, 128, 128, "#3a3e40"); for (let i = 0; i < 3; i++) { E(g, 24 + i * 40, 30, 14, 14, "#d8d4c4"); g.strokeStyle = "#111"; g.lineWidth = 2; g.beginPath(); g.moveTo(24 + i * 40, 30); g.lineTo(24 + i * 40 + 8 - i * 6, 22 + i * 3); g.stroke(); }
    for (let i = 0; i < 8; i++) E(g, 14 + i * 14, 70, 4.5, 4.5, ["#a01010", "#10601a", "#c8a020", "#1a3a8a"][i % 4]); for (let i = 0; i < 4; i++) R(g, 16 + i * 28, 92, 16, 22, "#1a1a1a"); for (let i = 0; i < 4; i++) R(g, 20 + i * 28, 96 + (i * 7) % 14, 8, 4, "#888"); noiseOn(g, 200, "rgba(0,0,0,.2)"); },
    g => { E(g, 14, 70, 2.5, 2.5, "#ff3020"); E(g, 28, 70, 2.5, 2.5, "#30ff50"); E(g, 70, 70, 2.5, 2.5, "#ffd030"); });
  T.r_yellow = tex(g => { R(g, 0, 0, 128, 128, "#b88a14"); for (let i = 0; i < 40; i++) R(g, rnd() * 128, rnd() * 128, rnd() * 14, 1, "rgba(40,30,10,.35)"); for (let i = 0; i < 10; i++) stain(g, rnd() * 128, rnd() * 128, 12, "rgba(30,20,10,.45)"); });
  T.r_orange = tex(g => { R(g, 0, 0, 128, 128, "#b4501a"); for (let i = 0; i < 30; i++) R(g, rnd() * 128, rnd() * 128, rnd() * 10, 1, "rgba(30,10,0,.35)"); noiseOn(g, 200, "rgba(0,0,0,.2)"); });
  T.r_blueUp = tex(g => { R(g, 0, 0, 128, 128, "#203e6a"); for (let y = 4; y < 128; y += 10) { R(g, 30, y, 8, 5, "#081020"); R(g, 90, y, 8, 5, "#081020"); } noiseOn(g, 200, "rgba(0,0,0,.25)"); for (let i = 0; i < 5; i++) stain(g, rnd() * 128, rnd() * 128, 10, "rgba(120,60,20,.35)"); });
  T.r_drumB = tex(g => { R(g, 0, 0, 128, 128, "#1c3a5a"); for (const y of [30, 34, 94, 98]) R(g, 0, y, 128, 3, "#0e2036"); R(g, 46, 50, 36, 26, "#d8d0b0"); g.fillStyle = "#a01010"; g.beginPath(); g.moveTo(64, 54); g.lineTo(74, 70); g.lineTo(54, 70); g.fill(); for (let i = 0; i < 12; i++) stain(g, rnd() * 128, rnd() * 128, 10, "rgba(120,60,20,.45)"); });
  T.r_greenP = tex(g => { R(g, 0, 0, 128, 128, "#3a4a3e"); for (let i = 0; i < 30; i++) R(g, rnd() * 128, rnd() * 128, rnd() * 16, .7, "rgba(200,210,190,.15)"); for (let i = 0; i < 10; i++) stain(g, rnd() * 128, rnd() * 128, 12, "rgba(110,50,15,.4)"); });
  T.r_cloth = tex(g => { R(g, 0, 0, 128, 128, "#b8b0a0"); for (let i = 0; i < 128; i += 8) for (let j = 0; j < 128; j += 8) E(g, i + 4, j + 4, 2, 2, "rgba(255,250,240,.35)"); stain(g, 60, 60, 30, "rgba(90,10,5,.5)"); stain(g, 20, 100, 16, "rgba(80,60,20,.4)"); noiseOn(g, 300, "rgba(0,0,0,.12)"); });
  T.r_food = tex(g => { R(g, 0, 0, 128, 128, "#3a3418"); for (let i = 0; i < 40; i++) E(g, rnd() * 128, rnd() * 128, 3 + rnd() * 8, 2 + rnd() * 6, ["#4a4a1a", "#5a2a14", "#2a3a1a", "#6a5a3a"][i % 4]); for (let i = 0; i < 60; i++) R(g, rnd() * 128, rnd() * 128, 2, 1, "#d8d4b8"); });
  T.r_fern = tex(g => { g.strokeStyle = "#2a3a1a"; g.lineWidth = 2; for (let f = 0; f < 3; f++) { const x0 = 30 + f * 34; g.beginPath(); g.moveTo(x0, 128); g.quadraticCurveTo(x0 + 6, 60, x0 + 14, 6); g.stroke(); for (let i = 0; i < 16; i++) { const tt = i / 16, x = x0 + 14 * tt * tt + 6 * tt, y = 128 - 122 * tt, L = 22 * (1 - tt * .8); g.fillStyle = i % 2 ? "#26381a" : "#30441e"; g.beginPath(); g.ellipse(x - L / 2, y, L / 2, 3, -.3, 0, 7); g.ellipse(x + L / 2, y, L / 2, 3, .3, 0, 7); g.fill(); } } });
  T.r_banner = tex(g => { R(g, 0, 0, 128, 128, "#4a0a0c"); R(g, 6, 0, 4, 128, "#a07830"); R(g, 118, 0, 4, 128, "#a07830"); g.fillStyle = "#a07830"; g.beginPath(); g.moveTo(64, 22); g.lineTo(88, 40); g.lineTo(82, 78); g.lineTo(64, 96); g.lineTo(46, 78); g.lineTo(40, 40); g.fill(); g.fillStyle = "#1a0606"; g.beginPath(); g.moveTo(64, 34); g.lineTo(78, 46); g.lineTo(74, 72); g.lineTo(64, 84); g.lineTo(54, 72); g.lineTo(50, 46); g.fill(); E(g, 64, 56, 6, 8, "#a07830"); noiseOn(g, 500, "rgba(0,0,0,.2)"); for (let i = 0; i < 6; i++) R(g, rnd() * 128, 100 + rnd() * 28, 3, 10, "rgba(0,0,0,.6)"); });
  T.r_mirror = tex(g => { const gr = g.createLinearGradient(0, 0, 128, 128); gr.addColorStop(0, "#3a4246"); gr.addColorStop(.45, "#1a2024"); gr.addColorStop(.55, "#4a5458"); gr.addColorStop(1, "#14181a"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 20; i++) stain(g, rnd() * 128, rnd() * 128, 10, "rgba(60,50,30,.4)"); R(g, 20, 30, 40, 1, "rgba(200,210,210,.4)"); });
  T.r_rustCar = tex(g => { R(g, 0, 0, 128, 128, "#5a3a22"); for (let i = 0; i < 30; i++) stain(g, rnd() * 128, rnd() * 128, 6 + rnd() * 16, ["rgba(140,70,20,.6)", "rgba(40,50,40,.5)", "rgba(20,10,5,.6)"][i % 3]); noiseOn(g, 600, "rgba(0,0,0,.25)"); });
}

// ---------- 4. MÔ HÌNH ĐỒ VẬT (đơn vị mét) ----------
// Đồ áp tường: gốc tọa độ ở chân tường, +z hướng vào phòng. Đồ giữa phòng: gốc ở tâm.
const RMETA = {
  // [rộng (dọc tường), sâu (ra giữa phòng), chiều dài theo số ô nếu nằm giữa phòng]
  r_wardrobe: [1.2, .62], r_bed: [1.65, 2.08], r_bedS: [1, 1.95], r_dresser: [1.2, .5], r_nightstand: [.5, .45], r_piano: [1.5, .72], r_tvset: [1, .5], r_fridge: [.72, .7], r_stove: [.76, .64],
  r_counter: [1.94, .64], r_bathtub: [1.7, .8], r_toilet: [.45, .7], r_sinkP: [.6, .52], r_washer: [.6, .62], r_shelfMetal: [1.1, .45], r_workbench: [1.8, .72], r_bicycle: [1.7, .3], r_bookTall: [1.6, .45],
  r_coatrack: [.5, .5], r_toybox: [.9, .5], r_elecCab: [1.8, .5], r_ctrlPanel: [1.4, .8], r_toolCart: [.75, .5], r_gasRack: [1.2, .45], r_rackWall: [2.0, 1.0], r_weaponRack: [1.3, .4], r_ironMaiden: [.8, .7],
  r_wineRack: [1.9, 1.0], r_fourPoster: [1.8, 2.15], r_drums: [1.85, .66], r_lockerRow: [1.6, .5], r_filing: [.9, .62], r_cooler: [.4, .4], r_desk: [1.4, .7], r_altarSm: [1.4, .6], r_woodpile: [1.8, .8],
  r_dining: [1.8, 1.9], r_round: [1.6, 1.6], r_sofaSet: [2.2, 2.1], r_armchairs: [2, 1.8], r_rug: [0, 0], r_crib: [.75, 1.3], r_kitTable: [1.3, 1.3], r_toys: [0, 0], r_globeDesk: [1.8, 1.6],
  r_banquet: [1.4, 3.6], r_tortureRack: [1, 2.1], r_brazier: [.7, .7], r_cauldron: [1, 1], r_forklift: [1.15, 3.1], r_machine: [1.1, 2.5], r_press: [1.4, 1.6], r_transformer: [1.6, 1.3], r_spool: [1, 1.25], r_rackRow: [2.0, 1.1],
  r_boulder: [1.6, 1.6], r_fallen: [1, 6.2], r_fern: [0, 0], r_oldcar: [1.8, 4.3], r_huntStand: [1.4, 1.4], r_stocks: [1.5, .6], r_obelisk: [.9, .9], r_plot: [1.5, 2.5], r_mound: [1.1, 2.1], r_wheelbarrow: [.7, 1.4], r_wreath: [.6, .5], r_celtic: [.9, .5], r_pews: [2.2, 1.6], r_canteen: [1.9, 1.9], r_officeDesk: [1.8, 1.6], r_boxStack: [1.1, 1.1], r_pallets: [1.2, 1.2],
};
const RSPAN = { r_banquet: 2, r_fallen: 3, r_oldcar: 3, r_forklift: 2 };
const RFLAT = new Set(["r_rug", "r_toys", "r_fern"]);
// Đồ treo tường (không cản đường)
const RMOUNT = new Set(["r_painting", "r_wallShelf", "r_fuse", "r_pipes", "r_bannerW", "r_shieldW", "r_clockW", "r_poster", "r_crossW", "r_mirrorW", "r_tapestry", "r_deer"]);

function realModel(v, s) {
  if (s.k === "r_col") return true;
  const rot = s.rot ?? 0, f0 = facing(rot), X = XF(s.x, s.base || 0, s.y, f0.c, f0.s, M), sd = s.seed ?? .5, rr = k => (Math.sin(sd * 917 + k * 71.3) + 1) / 2;
  const B = (a, b, c, d, e, g, m) => pbox(v, X, a, b, c, d, e, g, m), C = (x, z, y0, y1, r0, r1, n, m, cap) => pcyl(v, X, x, z, y0, y1, r0, r1, n, m, cap === undefined ? m : cap);
  const CX = (y, z, x0, x1, r, n, m, cap) => pcylX(v, X, y, z, x0, x1, r, n, m, cap === undefined ? m : cap), SP = (x, y, z, r, n, m, sx = 1, sy = 1, sz = 1) => psphere(v, sx === 1 && sy === 1 && sz === 1 ? X : XSp(X, x, y, z, sx, sy, sz), x, y, z, r, n, m);
  const Sub = (x, z, da = 0, y = 0, k = M) => { const p = X.p(x, y, z), q = facing(rot + da); return XF(p[0], p[1], p[2], q.c, q.s, k); };
  const Leg = (x, z, y0, y1, r, m = dw) => C(x, z, y0, y1, r, r * .85, 6, m);
  const H = (s.rh ?? WH) / M, dw = T.darkwood, mt = T.metal, rs = T.rust || mt, wd = T.wood || dw;
  const chair = (x, z, a, m = dw) => { const Q = Sub(x, z, a); pbox(v, Q, -.22, .44, -.22, .22, .48, .22, m); for (const [cx, cz] of [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]]) pcyl(v, Q, cx, cz, 0, .44, .02, .018, 5, m, m); for (const cx of [-.19, .19]) pcyl(v, Q, cx, -.2, .48, .95, .02, .018, 5, m, m); pbox(v, Q, -.2, .72, -.22, .2, .93, -.19, m); };
  const plate = (x, z, y) => { C(x, z, y, y + .015, .1, .12, 10, T.porcelain || T.enamel); };
  const book = (x, y, z, w, h, d, k) => B(x, y, z, x + w, y + h, z + d, T.bk[k % 6]);
  switch (s.k) {
    // ======================= NHÀ Ở =======================
    case "r_wardrobe": {
      for (const [x, z] of [[-.55, .06], [.55, .06], [-.55, .56], [.55, .56]]) Leg(x, z, 0, .1, .035);
      B(-.6, .1, 0, .6, 1.95, .58, dw); B(-.64, 1.95, 0, .64, 2.04, .62, dw); B(-.62, .1, 0, .62, .17, .6, dw);
      const a = s.open ? 1.75 : s.act ? 0 : rr(1) > .55 ? .35 + rr(2) * .5 : 0;
      for (const sx of [-1, 1]) { const Q = Sub(sx * .58, .58, sx < 0 ? a : 0); const x0 = sx < 0 ? 0 : -.56, x1 = sx < 0 ? .56 : 0; pbox(v, Q, x0, .2, 0, x1, 1.9, .03, dw); pbox(v, Q, x0 + .07, .3, .03, x1 - .07, 1.0, .045, dw); pbox(v, Q, x0 + .07, 1.1, .03, x1 - .07, 1.8, .045, dw); psphere(v, Q, sx < 0 ? .5 : -.5, 1.05, .06, .025, 5, T.brass || mt); }
      if (a) { B(-.55, .2, .05, -.02, 1.88, .1, T.dark); for (let i = 0; i < 3; i++) { const Q = Sub(-.42 + i * .14, .3, 0); pbox(v, Q, -.05, .9 + rr(i) * .2, -.2, .05, 1.7, .2, [T.coatT, T.clRed, T.clWhite][i] || T.fabric); } }
      break; }
    case "r_bed": case "r_bedS": case "r_fourPoster": {
      const W = s.k === "r_bedS" ? .48 : .82, L = s.k === "r_bedS" ? 1.92 : 2.05, four = s.k === "r_fourPoster";
      for (const x of [-W, W - .07]) for (const z of [.02, L - .07]) B(x, 0, z, x + .07, four ? 2.25 : .4, z + .07, dw);
      B(-W, .18, 0, W, .36, L, dw); B(-W + .04, .36, .06, W - .04, .56, L - .04, T.sheet || T.cloth);
      B(-W, 0, 0, W, four ? 1.35 : 1.1, .07, dw); B(-W - .02, .95, 0, W + .02, 1.02, .1, dw); B(-W, 0, L - .06, W, .72, L, dw);
      for (const x of (W > .6 ? [-.4, .4] : [0])) SP(x, .63, .3, .26, 8, T.sheet || T.cloth, 1, .35, .7);
      const mess = (rr(3) - .5) * .4; B(-W - .02, .5, .75 + mess * .2, W + .02, .62, L + .01, T.r_quilt); B(-W - .03, .2, .75, -W + .01, .62, L, T.r_quilt); B(W - .01, .2, .75, W + .03, .62, L, T.r_quilt);
      SP(mess, .64, 1.3, .35, 7, T.r_quilt, 1.4, .25, 1);
      if (four) { B(-W, 2.2, 0, W, 2.3, L, dw); B(-W - .01, 1.2, -.01, -W + .02, 2.2, L * .35, T.r_velvet); B(W - .02, 1.2, -.01, W + .01, 2.2, L * .35, T.r_velvet); B(-W, 2.0, L - .02, W, 2.2, L + .01, T.r_velvet); }
      break; }
    case "r_nightstand": B(-.25, .08, 0, .25, .58, .42, dw); B(-.27, .58, 0, .27, .61, .44, dw); for (const [x, z] of [[-.22, .04], [.22, .04], [-.22, .38], [.22, .38]]) Leg(x, z, 0, .08, .02); { const po = s.open ? .25 : 0; if (po) B(-.2, .41, .05 + po, .2, .52, .42 + po, { all: dw, t: T.dark }); B(-.21, .4, .42 + po, .21, .53, .43 + po, dw); SP(0, .465, .44 + po, .015, 4, T.brass || mt); }
      C(0, .2, .61, .63, .07, .07, 8, T.brass || mt); C(0, .2, .63, .9, .012, .012, 5, T.brass || mt); C(0, .2, .85, 1.05, .16, .09, 10, T.lampShade || T.clWhite, null); break;
    case "r_dresser": B(-.6, .06, 0, .6, .84, .48, dw); B(-.62, .84, 0, .62, .87, .5, dw);
      for (let i = 0; i < 3; i++) { const y = .12 + i * .24, po = s.open && i === 2 ? .3 : 0; if (po) B(-.54, y + .01, .2 + po, .54, y + .18, .49 + po, { all: dw, t: T.dark }); B(-.56, y, .48 + po, .56, y + .2, .5 + po, dw); for (const x of [-.3, .3]) SP(x, y + .1, .51 + po, .018, 4, T.brass || mt); }
      B(-.4, .87, .04, .4, 1.62, .07, dw); B(-.34, .93, .07, .34, 1.56, .075, T.r_mirror); for (let i = 0; i < 3; i++) C(-.4 + i * .12, .3, .87, .97 + rr(i) * .08, .025, .02, 6, T.glassB); break;
    case "r_piano": B(-.75, 0, 0, .75, 1.25, .55, T.r_lacquer); B(-.77, 1.25, -.01, .77, 1.28, .57, T.r_lacquer); B(-.74, .66, .55, .74, .75, .72, T.r_lacquer); B(-.7, .75, .56, .7, .77, .71, { all: T.r_lacquer, t: T.r_keys });
      B(-.76, .75, .55, -.7, .85, .72, T.r_lacquer); B(.7, .75, .55, .76, .85, .72, T.r_lacquer); for (const x of [-.7, .7]) Leg(x, .67, 0, .66, .03, T.r_lacquer); B(-.4, .9, .5, .4, 1.15, .53, T.paperSheet || T.clWhite);
      B(-.25, .45, 1.0, .25, .5, 1.3, T.r_lacquer); for (const [x, z] of [[-.22, 1.03], [.22, 1.03], [-.22, 1.27], [.22, 1.27]]) Leg(x, z, 0, .45, .02, T.r_lacquer); candle3d(v, X, -.55, 1.28, .25, .12); candle3d(v, X, .5, 1.28, .3, .06); break;
    case "r_tvset": B(-.5, 0, 0, .5, .55, .45, dw); B(-.46, .05, .45, .46, .5, .46, T.dark); B(-.32, .55, .04, .32, 1.02, .46, T.plastic || T.dark); B(-.26, .6, .46, .2, .96, .47, T.tvOff || T.dark);
      for (let i = 0; i < 2; i++) SP(.26, .7 + i * .1, .465, .02, 4, mt); for (const a of [-.5, .5]) { const Q = XL(X, 0, 1.02, .2, 0, a); pcyl(v, Q, 0, .2, 1.02, 1.5, .006, .004, 4, mt, mt); } break;
    case "r_fridge": B(-.35, 0, 0, .35, 1.7, .66, T.enamel); SP(0, 1.7, .33, .35, 8, T.enamel, 1, .12, .95); if (!s.open) { B(-.34, 1.12, .66, .34, 1.135, .67, T.dark); B(.25, 1.2, .66, .29, 1.55, .71, T.brass || mt); B(.25, .7, .66, .29, 1.0, .71, T.brass || mt); } else { B(-.3, .06, .66, .3, 1.64, .67, T.dark); for (const y of [.5, .9, 1.3]) B(-.3, y, .3, .3, y + .015, .67, mt); pbox(v, Sub(-.35, .67, 1.55), 0, .02, 0, .7, 1.68, .06, T.enamel); }
      if (!s.open) for (let i = 0; i < 3; i++) B(-.26 + i * .12, 1.3 + rr(i) * .2, .665, -.2 + i * .12, 1.4 + rr(i) * .2, .67, [T.paperSheet, T.clRed, T.clWhite][i] || T.enamel); break;
    case "r_stove": B(-.38, 0, 0, .38, .88, .62, T.enamel); B(-.38, .88, 0, .38, .9, .62, T.dark); B(-.38, .9, 0, .38, 1.1, .05, T.enamel); if (s.open) { B(-.3, .2, .6, .3, .62, .61, T.dark); B(-.28, .4, .1, .28, .41, .6, mt); pbox(v, XL(X, 0, .2, .62, 1.45), -.3, .2, .62, .3, .62, .64, T.enamel); } else { B(-.3, .2, .62, .3, .62, .63, T.dark); B(-.22, .3, .63, .22, .55, .635, T.glassB); }
      B(-.25, .66, .62, .25, .68, .66, mt); for (const [x, z] of [[-.18, .18], [.18, .18], [-.18, .44], [.18, .44]]) C(x, z, .9, .915, .1, .1, 10, mt); for (let i = 0; i < 4; i++) SP(-.27 + i * .18, .78, .63, .022, 5, T.dark);
      C(-.18, .44, .915, 1.1, .12, .12, 12, rs, T.dark); B(-.32, 1.07, .43, -.3, 1.08, .45, mt); break;
    case "r_counter": B(-.97, 0, 0, .97, .86, .6, dw); B(-.99, .86, 0, .99, .9, .64, T.counter || dw); B(-.95, 0, .58, .95, .08, .6, T.dark);
      for (let i = 0; i < 4; i++) { const x = -.94 + i * .48; if (s.open && i === 1) { B(x + .01, .12, .58, x + .43, .82, .6, T.dark); pbox(v, Sub(x, .62, 1.35), 0, .12, 0, .44, .82, .02, dw); } else { B(x, .12, .6, x + .44, .82, .62, dw); SP(x + (i % 2 ? .06 : .38), .7, .64, .018, 4, mt); } }
      B(-.45, .86, .12, .1, .905, .5, T.sinkTop || mt); C(-.17, .08, .9, 1.2, .015, .015, 6, mt); B(-.18, 1.16, .07, -.16, 1.18, .24, mt);
      B(-.97, 1.42, 0, .97, 2.12, .34, dw); for (let i = 0; i < 4; i++) { const x = -.94 + i * .48; B(x, 1.46, .34, x + .44, 2.08, .36, dw); }
      for (let i = 0; i < 4; i++) plate(.45, .3, .9 + i * .016); for (let i = 0; i < 3; i++) C(.7 + i * .08, .15, .9, 1.02 + rr(i) * .1, .035, .035, 8, T.glassB || T.enamel); C(.3, .4, .9, .98, .05, .045, 8, T.porcelain || T.enamel); break;
    case "r_bathtub": { const Q = XSp(X, 0, 0, .4, 2.15, 1, 1); pcyl(v, Q, 0, .4, .12, .58, .3, .39, 14, T.porcelain || T.enamel, null); pcyl(v, Q, 0, .4, .56, .6, .39, .4, 14, T.porcelain || T.enamel, T.porcelain || T.enamel);
      pcyl(v, Q, 0, .4, .45, .565, .34, .34, 14, T.bloodWater || T.dark, T.bloodWater || T.dark); for (const [x, z] of [[-.6, .15], [.6, .15], [-.6, .65], [.6, .65]]) SP(x, .07, z, .06, 6, T.brass || mt, 1, 1.2, 1);
      C(-.75, .12, .6, .95, .018, .018, 6, mt); B(-.77, .93, .1, -.73, .95, .3, mt); break; }
    case "r_toilet": C(0, .45, 0, .38, .13, .17, 10, T.porcelain || T.enamel); { const Q = XSp(X, 0, 0, .45, 1, 1, 1.3); pcyl(v, Q, 0, .45, .38, .42, .19, .19, 12, T.porcelain || T.enamel, T.dark); }
      B(-.21, .42, .03, .21, .82, .22, T.porcelain || T.enamel); B(-.22, .82, .02, .22, .85, .23, T.porcelain || T.enamel); B(.1, .74, .22, .16, .76, .25, mt); if (rr(1) > .5) B(-.17, .42, .2, .17, .8, .23, dw); break;
    case "r_sinkP": C(0, .26, 0, .72, .07, .1, 8, T.porcelain || T.enamel); B(-.3, .72, .04, .3, .86, .5, T.porcelain || T.enamel); B(-.24, .855, .1, .24, .865, .44, T.sinkTop || T.dark); C(0, .08, .86, 1.02, .015, .015, 6, mt); B(-.01, 1.0, .06, .01, 1.02, .18, mt);
      B(-.32, 1.15, 0, .32, 1.8, .03, dw); B(-.28, 1.19, .03, .28, 1.76, .035, T.r_mirror); break;
    case "r_washer": B(-.3, 0, 0, .3, .85, .6, T.enamel); B(-.28, .74, .6, .28, .82, .61, T.dark); { const Q = XL(X, 0, .42, .6, Math.PI / 2); pcyl(v, Q, 0, .6, .42, .45, .2, .2, 14, mt, T.glassB || T.dark); } SP(.2, .78, .62, .02, 4, mt); break;
    case "r_shelfMetal": { for (const x of [-.53, .5]) for (const z of [.02, .4]) B(x, 0, z, x + .03, 1.85, z + .03, mt); for (const y of [.08, .62, 1.16, 1.7]) B(-.55, y, 0, .55, y + .025, .45, T.r_greyP || mt);
      for (const y of [.105, .645, 1.185]) { let x = -.5; let i = 0; while (x < .4) { const w = .14 + rr(x * 9 + y) * .2, k = Math.floor(rr(x + y * 7) * 4); if (k === 0) C(x + w / 2, .2, y, y + .18, .08, .08, 8, rs, T.dark); else if (k === 1) B(x, y, .05, x + w, y + .16 + rr(i) * .15, .4, T.cardboard); else if (k === 2) C(x + w / 2, .22, y, y + .12, .05, .05, 8, T.glassB); x += w + .03; i++; } }
      break; }
    case "r_workbench": B(-.9, .85, 0, .9, .92, .72, wd); for (const [x, z] of [[-.85, .05], [.82, .05], [-.85, .64], [.82, .64]]) B(x, 0, z, x + .05, .85, z + .05, dw); B(-.85, .15, .05, .85, .18, .68, dw);
      B(-.9, .95, 0, .9, 1.85, .025, T.board || T.cardboard); for (let i = 0; i < 6; i++) { const x = -.7 + i * .27; B(x, 1.3 + rr(i) * .3, .025, x + .03, 1.6 + rr(i) * .2, .04, i % 2 ? mt : dw); }
      B(.5, .92, .5, .7, 1.02, .66, T.r_greyP || mt); B(.55, 1.02, .55, .65, 1.08, .62, mt); B(-.6, .92, .3, -.2, .95, .4, mt); B(-.65, .92, .25, -.6, .97, .45, dw); C(-.1, .5, .92, .99, .06, .06, 8, rs); break;
    case "r_bicycle": { const Q = Sub(0, .16, Math.PI / 2); const wheel = x => { pcylX(v, Q, .34, x, -.02, .02, .34, 16, T.tire || T.dark, null); pcylX(v, Q, .34, x, -.015, .015, .29, 12, T.dark, mt); };
      wheel(-.52); wheel(.52); const tube = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(x1 - x0, y1 - y0); pcyl(v, XL(Q, 0, y0, x0, a), 0, x0, y0, y0 + L, .015, .015, 5, T.r_orange || rs, null); };
      tube(-.52, .34, -.05, .34); tube(-.05, .34, -.15, .85); tube(-.15, .85, .4, .85); tube(.52, .34, .4, .95); tube(-.05, .34, .4, .85); tube(-.52, .34, -.15, .85); pbox(v, Q, -.2, .87, -.05, -.05, .91, .05, T.dark); pbox(v, Q, .38, .97, -.25, .42, 1.0, .25, mt); break; }
    case "r_bookTall": { const top = Math.min(H - .15, 2.6); B(-.8, 0, 0, -.76, top, .45, dw); B(.76, 0, 0, .8, top, .45, dw); B(-.8, 0, 0, .8, top, .02, dw); B(-.82, top, 0, .82, top + .06, .48, dw);
      const n = Math.max(4, Math.floor(top / .36)), st = (top - .06) / n; for (let r = 0; r <= n; r++) B(-.77, .03 + r * st, .02, .77, .055 + r * st, .45, dw);
      for (let r = 0; r < n; r++) { let x = -.75; const y = .055 + r * st; while (x < .72) { const w = .03 + rr(x * 13 + r) * .04, h = st * (.55 + rr(x * 7 + r * 3) * .35); if (rr(x * 3 + r) > .1) pbox(v, rr(x + r * 9) > .92 ? XL(X, x, y, .2, 0, .25) : X, x, y, .06, x + w, y + h, .43, T.bk[Math.floor(rr(x * 5 + r * 11) * 6) % 6]); x += w + .004; } }
      if (top > 2.1) { const Q = XL(X, .3, 0, .75, -.28, 0); for (const x of [.1, .5]) pbox(v, Q, x, 0, .73, x + .04, top - .1, .77, dw); for (let y = .3; y < top - .2; y += .3) pbox(v, Q, .1, y, .73, .54, y + .03, .77, dw); }
      break; }
    case "r_coatrack": C(0, .25, 0, .04, .22, .22, 10, dw); C(0, .25, .04, 1.82, .025, .022, 6, dw); for (let i = 0; i < 4; i++) { const a = i * 1.57; const Q = XL(X, Math.cos(a) * .05, 1.75, .25 + Math.sin(a) * .05, Math.sin(a) * .7, Math.cos(a) * .7); pcyl(v, Q, Math.cos(a) * .05, .25 + Math.sin(a) * .05, 1.75, 1.88, .01, .01, 4, dw, dw); }
      B(-.18, .9, .17, .18, 1.72, .3, T.clBlack || T.dark); SP(0, 1.85, .25, .16, 7, T.dark, 1, .35, 1); break;
    case "r_toybox": B(-.45, 0, 0, .45, .45, .45, T.r_velvet); B(-.47, .45, 0, .47, .48, .47, dw); { const Q = XL(X, 0, .48, .02, s.open ? -1.7 : s.act ? 0 : -1.1); pbox(v, Q, -.47, .48, .02, .47, .51, .47, dw); }
      if (s.open || !s.act) { SP(-.2, .5, .25, .1, 7, T.clRed || T.fabric); SP(.15, .55, .22, .12, 7, T.furT || T.fabric); } break;
    case "r_dining": {
      B(-.8, .72, -.45, .8, .76, .45, dw); for (const [x, z] of [[-.74, -.39], [.7, -.39], [-.74, .35], [.7, .35]]) B(x, 0, z, x + .05, .72, z + .05, dw);
      B(-.82, .76, -.47, .82, .765, .47, T.r_cloth); B(-.83, .55, -.48, .83, .765, -.47, T.r_cloth); B(-.83, .55, .47, .83, .765, .48, T.r_cloth);
      chair(-.4, -.75, 0); chair(.4, -.75, 0); chair(-.4, .75, Math.PI); chair(.4, .78, Math.PI + .25); if (rr(2) > .5) chair(-1.05, 0, Math.PI / 2); else { const Q = Sub(1.05, .1, -1.2); pbox(v, Q, -.22, .0, -.22, .22, .04, .22, dw); }
      for (const [x, z] of [[-.4, -.28], [.4, -.28], [-.4, .28], [.4, .28]]) plate(x, z, .765); C(0, 0, .765, .78, .08, .08, 8, T.brass || mt); C(0, 0, .78, 1.05, .015, .015, 6, T.brass || mt); for (const x of [-.12, 0, .12]) candle3d(v, X, x, 1.04, 0, .1 + rr(x * 9) * .08);
      for (let i = 0; i < 2; i++) C(-.6 + i * 1.1, .05, .765, .9, .035, .03, 8, T.glassB || mt); break; }
    case "r_round": C(0, 0, .72, .76, .55, .55, 16, dw); C(0, 0, .1, .72, .06, .05, 8, dw); C(0, 0, 0, .1, .3, .25, 10, dw); C(0, 0, .76, .765, .58, .6, 16, T.r_cloth, T.r_cloth);
      chair(0, -.75, 0); chair(.7, .4, Math.PI * 1.25 + .3); C(0, 0, .765, 1.0, .07, .05, 10, T.porcelain || T.enamel); for (let i = 0; i < 5; i++) limb(v, XL(X, 0, 1.0, 0, (rr(i) - .5) * .8, (rr(i + 3) - .5) * .8), 0, 0, 1.35, 1.0, .004, .006, T.darkwood, 4); break;
    case "r_sofaSet": { const Q = Sub(0, -.55, 0); pbox(v, Q, -1, .1, -.42, 1, .42, .42, T.r_velvet); pbox(v, Q, -1, .42, -.45, 1, .92, -.22, T.r_velvet); for (const x of [-1, .8]) pbox(v, Q, x, .1, -.45, x + .2, .62, .45, T.r_velvet);
      for (let i = 0; i < 3; i++) pbox(v, Q, -.78 + i * .53, .42, -.22, -.28 + i * .53, .52, .38, T.r_velvet); for (const [x, z] of [[-.95, -.4], [.95, -.4], [-.95, .4], [.95, .4]]) pcyl(v, Q, x, z, 0, .1, .03, .025, 5, dw, dw);
      B(-.55, .38, .2, .55, .43, .75, dw); for (const [x, z] of [[-.5, .25], [.5, .25], [-.5, .7], [.5, .7]]) B(x - .02, 0, z - .02, x + .02, .38, z + .02, dw); B(-1.25, .003, -1.05, 1.25, .008, 1.05, T.r_rug);
      book(-.3, .43, .4, .2, .03, .26, 2); C(.25, .45, .43, .5, .04, .035, 8, T.porcelain || T.enamel); break; }
    case "r_armchairs": for (const sx of [-1, 1]) { const Q = Sub(sx * .65, 0, sx > 0 ? -Math.PI / 2 - .3 : Math.PI / 2 + .3); pbox(v, Q, -.4, .12, -.38, .4, .45, .38, T.r_velvet); pbox(v, Q, -.4, .45, -.42, .4, 1.05, -.22, T.r_velvet); for (const x of [-.4, .28]) pbox(v, Q, x, .12, -.4, x + .12, .68, .38, T.r_velvet); for (const [x, z] of [[-.35, -.33], [.35, -.33], [-.35, .33], [.35, .33]]) pcyl(v, Q, x, z, 0, .12, .025, .02, 5, dw, dw); }
      C(0, .1, .55, .58, .25, .25, 12, dw); C(0, .1, 0, .55, .03, .03, 6, dw); C(0, .1, 0, .03, .18, .18, 10, dw); C(0, .1, .58, .66, .04, .035, 8, T.glassB || T.enamel); C(.12, .2, .58, .6, .07, .07, 8, T.dark); break;
    case "r_rug": B(-1.3, .003, -.9, 1.3, .008, .9, T.r_rug); break;
    case "r_crib": for (const z of [-.6, .6]) { B(-.37, 0, z - .03, .37, 1.0, z + .03, dw); } for (const x of [-.37, .34]) B(x, .25, -.6, x + .03, .95, .6, dw);
      for (let i = 0; i < 9; i++) for (const x of [-.36, .35]) C(x, -.5 + i * .125, .3, .92, .008, .008, 4, dw); B(-.35, .3, -.57, .35, .42, .57, T.sheet || T.cloth); SP(0, .45, .1, .12, 7, T.furT || T.fabric); break;
    case "r_toys": for (let i = 0; i < 7; i++) { const x = (rr(i) - .5) * 1.4, z = (rr(i + 9) - .5) * 1.2, k = i % 3; if (k === 0) B(x, 0, z, x + .08, .08, z + .08, [T.clRed, T.glassB, T.r_yellow][i % 3] || T.fabric); else if (k === 1) SP(x, .07, z, .07, 7, T.clRed || T.fabric); else { const Q = Sub(x, z, rr(i) * 6); pbox(v, Q, -.12, .02, -.05, .12, .09, .05, T.r_velvet); for (const xx of [-.08, .08]) pcylX(v, Q, .025, xx === -.08 ? -.05 : .05, xx - .02, xx + .02, .025, 6, T.dark); } }
      { const Q = Sub(.2, -.1, rr(8) * 6); pbox(v, Q, -.06, 0, -.03, .06, .05, .03, T.furT || T.fabric); } break;
    case "r_kitTable": B(-.5, .72, -.4, .5, .76, .4, wd); for (const [x, z] of [[-.46, -.36], [.43, -.36], [-.46, .33], [.43, .33]]) B(x, 0, z, x + .04, .72, z + .04, dw); chair(0, -.65, 0); chair(.05, .68, Math.PI + .4);
      C(-.15, 0, .76, .84, .09, .06, 10, T.porcelain || T.enamel); plate(.2, .1, .76); B(.05, .76, -.2, .07, .77, -.02, mt); break;
    case "r_globeDesk": if (s.open) B(.47, .48, -.8, .68, .7, -.3, { all: dw, t: T.dark }); B(-.7, .74, -.35, .7, .78, .35, dw); for (const x of [-.7, .45]) B(x, 0, -.33, x + .25, .74, .33, dw); for (let i = 0; i < 3; i++) B(.47, .08 + i * .22, .33, .68, .26 + i * .22, .35, dw); chair(0, -.6, 0, dw);
      B(-.3, .78, -.1, .1, .8, .15, T.paperSheet || T.clWhite); B(-.32, .78, -.12, -.1, .83, .16, T.bk[1]); candle3d(v, X, .45, .78, .15, .1); C(.3, .2, .78, .86, .03, .03, 6, T.dark);
      C(.95, .5, 0, .05, .2, .2, 10, dw); C(.95, .5, .05, .8, .02, .02, 6, dw); SP(.95, 1.0, .5, .22, 10, T.r_greenP || T.leafT); C(.95, .5, .8, .82, .05, .05, 6, T.brass || mt); break;
    case "r_desk": if (s.open) B(.47, .48, .4, .68, .7, 1.0, { all: dw, t: T.dark }); B(-.7, .74, 0, .7, .78, .68, dw); for (const x of [-.7, .45]) B(x, 0, .02, x + .25, .74, .66, dw); chair(0, 1.0, Math.PI); B(-.35, .78, .2, .05, .8, .45, T.paperSheet || T.clWhite); C(.35, .2, .78, .82, .1, .08, 10, mt); C(.35, .2, .82, 1.1, .012, .012, 5, mt); C(.35, .3, 1.05, 1.15, .06, .1, 10, T.r_greenP || mt, null); break;
    // ======================= LÂU ĐÀI =======================
    case "r_banquet": { const L = 1.7; B(-.5, .76, -L, .5, .82, L, dw); for (const z of [-L + .15, 0, L - .2]) { B(-.42, 0, z - .05, -.32, .76, z + .05, dw); B(.32, 0, z - .05, .42, .76, z + .05, dw); } B(-.36, .15, -L + .1, .36, .2, L - .1, dw);
      for (const x of [-.85, .85]) { B(x - .17, .44, -L + .1, x + .17, .49, L - .1, dw); for (const z of [-L + .3, 0, L - .3]) B(x - .14, 0, z - .04, x + .14, .44, z + .04, dw); }
      B(-.32, .82, -L + .2, .32, .825, L - .2, T.r_velvet); for (let i = 0; i < 6; i++) { const z = -L + .4 + i * .6; for (const x of [-.3, .3]) { plate(x, z, .825); if (rr(i + x) > .4) C(x * .55, z + .15, .825, .99, .035, .03, 8, T.gold || T.brass || mt, T.bloodWater || T.dark); if (rr(i * 3 + x) > .5) SP(x, .87, z, .07, 6, T.r_food, 1.3, .5, 1); } }
      for (const z of [-L * .5, L * .5]) { C(0, z, .825, .85, .1, .1, 10, T.brass || mt); C(0, z, .85, 1.25, .02, .02, 6, T.brass || mt); for (const x of [-.15, 0, .15]) { C(x, z, 1.2, 1.23, .03, .03, 6, T.brass || mt); candle3d(v, X, x, 1.23, z, .08 + rr(x + z) * .12); } B(-.15, 1.19, z - .01, .15, 1.21, z + .01, T.brass || mt); }
      SP(0, .9, 0, .14, 8, T.r_food, 1.6, .55, 1.2); SP(0, .9, .58, .08, 7, T.boneT || T.bone || T.enamel, 1, 1.1, 1.1); break; }
    case "r_tortureRack": B(-.45, .7, -1, .45, .78, 1, dw); for (const [x, z] of [[-.45, -1], [.37, -1], [-.45, .92], [.37, .92]]) B(x, 0, z, x + .08, .9, z + .08, dw); for (const z of [-.95, .95]) CX(.88, z, -.5, .5, .07, 8, dw);
      for (const z of [-1.1, 1.1]) { const Q = Sub(.55, z, 0); for (let i = 0; i < 4; i++) { const a = i * 1.57; pbox(v, XL(Q, 0, .88, 0, a), -.015, .88, 0, .015, 1.1, .02, dw); } } for (const z of [-.6, .5]) CX(.8, z, -.3, .3, .02, 5, T.rope || T.sack || dw); B(-.25, .78, .2, .25, .785, .6, T.bloodWater || T.dark); break;
    case "r_brazier": for (let i = 0; i < 3; i++) { const a = i * 2.09, Q = XL(X, Math.cos(a) * .25, 0, Math.sin(a) * .25, Math.sin(a) * .2, -Math.cos(a) * .2); pcyl(v, Q, Math.cos(a) * .25, Math.sin(a) * .25, 0, .75, .02, .02, 5, T.dark, T.dark); }
      C(0, 0, .7, .95, .15, .35, 12, T.dark, null); C(0, 0, .88, .93, .3, .3, 12, T.ember || T.flame || T.rust, T.ember || T.flame); for (let i = 0; i < 4; i++) C((rr(i) - .5) * .25, (rr(i + 4) - .5) * .25, .92, 1.05 + rr(i) * .15, .06, 0, 6, T.flame); break;
    case "r_cauldron": for (let i = 0; i < 3; i++) { const a = i * 2.09; C(Math.cos(a) * .35, Math.sin(a) * .35, 0, .2, .04, .04, 5, T.dark); } SP(0, .5, 0, .48, 10, T.dark, 1, .75, 1); C(0, 0, .72, .78, .4, .42, 14, T.dark, T.bloodWater || T.dark); C(0, 0, 0, .08, .3, .25, 10, T.charcoal || T.dark, T.ember || T.dark); break;
    case "r_weaponRack": B(-.65, 0, 0, .65, .1, .35, dw); B(-.65, 1.0, 0, .65, 1.08, .3, dw); for (const x of [-.65, .6]) B(x, 0, 0, x + .05, 1.8, .2, dw); B(-.65, 1.75, 0, .65, 1.82, .15, dw);
      for (let i = 0; i < 5; i++) { const x = -.5 + i * .25; C(x, .2, .1, 2.05, .014, .014, 5, dw); C(x, .2, 2.05, 2.25, .035, 0, 4, mt); } for (const x of [-.3, .3]) { B(x - .02, .1, .28, x + .02, 1.15, .3, mt); B(x - .08, 1.15, .27, x + .08, 1.18, .31, T.brass || mt); } if (T.shield) B(-.25, .25, .32, .25, .85, .36, T.shield); break;
    case "r_ironMaiden": B(-.38, 0, 0, .38, 1.95, .5, T.r_rustCar || T.dark); SP(0, 1.95, .25, .38, 8, T.r_rustCar || T.dark, 1, .3, .66); B(-.15, 1.5, .5, .15, 1.8, .52, T.statueFace || mt);
      { const Q = Sub(.38, .5, s.open || !s.act ? -1.4 : 0); pbox(v, Q, -.76, .05, 0, 0, 1.9, .06, T.r_rustCar || T.dark); if (s.open || !s.act) for (let y = .3; y < 1.8; y += .22) for (const x of [-.6, -.38, -.16]) pcyl(v, XL(Q, x, y, .06, Math.PI / 2), x, .06, y, y + .12, .012, 0, 4, mt, null); } break;
    case "r_wineRack": for (const x of [-.48, .48]) { for (const z of [.1, .85]) B(x - .3, 0, z - .05, x + .3, .2, z + .05, dw); const Q = Sub(x, .48, -Math.PI / 2); pcylX(v, Q, .62, 0, -.5, .5, .42, 14, dw, dw); pcylX(v, Q, .62, 0, -.42, -.38, .44, 14, mt, null); pcylX(v, Q, .62, 0, .38, .42, .44, 14, mt, null); C(x, .9, .55, .65, .05, .05, 6, dw); }
      B(-.95, 1.08, .05, .95, 1.12, .9, dw); for (let i = 0; i < 2; i++) { const Q = Sub(-.3 + i * .6, .48, -Math.PI / 2); pcylX(v, Q, 1.38, 0, -.38, .38, .26, 12, dw, dw); } break;
    case "r_stocks": for (const x of [-.7, .65]) B(x, 0, .25, x + .08, 1.5, .35, dw); B(-.75, 1.0, .22, .75, 1.3, .38, dw); for (const x of [-.35, 0, .35]) C(x, .2, 1.13, 1.17, .07, .07, 8, T.dark); B(-.8, 0, 0, .8, .06, .6, dw); break;
    case "r_altarSm": B(-.7, 0, .05, .7, .95, .6, T.stoneW || T.rockT); B(-.75, .95, 0, .75, 1.02, .65, T.stoneW || T.rockT); B(-.7, .9, .6, .7, 1.03, .62, T.r_velvet); for (const x of [-.5, .5]) { C(x, .3, 1.02, 1.08, .06, .05, 8, T.brass || mt); candle3d(v, X, x, 1.08, .3, .2 + rr(x) * .1); }
      SP(0, 1.1, .33, .08, 7, T.boneT || T.bone || T.enamel, 1, 1.1, 1.1); B(-.06, 1.02, .06, .06, 1.6, .1, T.brass || dw); B(-.22, 1.38, .06, .22, 1.44, .1, T.brass || dw); break;
    case "r_pews": for (const z of [-.5, .5]) { const Q = Sub(0, z, 0); pbox(v, Q, -1, .42, -.2, 1, .46, .2, dw); pbox(v, Q, -1, .46, -.22, 1, .95, -.17, dw); for (const x of [-1, .96]) pbox(v, Q, x, 0, -.22, x + .04, .7, .2, dw); } break;
    // ======================= NHÀ MÁY =======================
    case "r_elecCab": { const top = 2.0; for (let i = 0; i < 3; i++) { const x = -.9 + i * .6; B(x + .01, .1, 0, x + .59, top, .5, T.r_greyP || mt); B(x + .03, .14, .5, x + .57, top - .04, .52, { all: T.r_greyP || mt, f: T.r_elec }); B(x + .48, .9, .52, x + .52, 1.15, .55, T.dark); }
      B(-.9, 0, 0, .9, .1, .5, T.dark); B(-.92, top, 0, .92, top + .04, .52, T.r_greyP || mt); for (let i = 0; i < 4; i++) C(-.75 + i * .5, .15, top + .04, Math.max(top + .5, H - .05), .045, .045, 6, mt); if (rr(1) > .5) { const Q = Sub(.3, .52, -1.2); pbox(v, Q, -.56, .14, 0, 0, top - .04, .02, { all: T.r_greyP || mt, f: T.r_elec }); } break; }
    case "r_ctrlPanel": B(-.7, 0, 0, .7, .85, .6, T.r_greyP || mt); { const Q = XL(X, 0, .85, .6, -.6); pbox(v, Q, -.7, .85, .25, .7, .88, .6, { all: T.r_greyP || mt, t: T.r_panel }); } B(-.7, .85, 0, .7, 1.4, .25, T.r_greyP || mt); B(-.6, 1.0, .25, .6, 1.3, .26, T.r_panel);
      C(-.6, .9, 0, .03, .25, .25, 10, T.dark); C(-.6, .9, .03, .45, .025, .025, 6, mt); B(-.8, .45, .78, -.4, .5, 1.05, T.dark); break;
    case "r_toolCart": B(-.36, .1, 0, .36, 1.0, .48, T.clRed || T.r_orange); for (let i = 0; i < 5; i++) { const y = .18 + i * .16; const po = s.open && i === 4 ? .3 : 0; if (po) B(-.31, y + .01, .2 + po, .31, y + .12, .48 + po, { all: T.clRed || T.r_orange, t: T.dark }); B(-.33, y, .48 + po, .33, y + .13, .5 + po, T.clRed || T.r_orange); B(-.1, y + .05, .5 + po, .1, y + .07, .52 + po, mt); } B(-.38, 1.0, -.01, .38, 1.03, .5, mt);
      for (const [x, z] of [[-.3, .06], [.3, .06], [-.3, .42], [.3, .42]]) C(x, z, 0, .1, .04, .04, 6, T.dark); B(-.2, 1.03, .1, .1, 1.1, .3, T.r_greyP || mt); break;
    case "r_gasRack": B(-.6, 0, 0, .6, .05, .45, mt); for (const x of [-.6, .56]) B(x, 0, 0, x + .04, 1.2, .45, mt); B(-.6, 1.0, .4, .6, 1.04, .45, mt); B(-.6, .5, .4, .6, .54, .45, mt);
      for (let i = 0; i < 4; i++) { const x = -.42 + i * .28, m = [T.cylRed, T.cylGreen, T.r_drumB, T.cylRed][i] || mt; C(x, .22, .05, 1.35, .11, .11, 12, m, m); SP(x, 1.35, .22, .11, 8, m, 1, .5, 1); C(x, .22, 1.4, 1.5, .03, .03, 6, T.brass || mt); } break;
    case "r_rackWall": case "r_rackRow": { const top = Math.min(H - .3, 4.2), lv = Math.max(2, Math.floor(top / 1.3)), st = top / lv, z0 = s.k === "r_rackRow" ? -.5 : 0, z1 = z0 + 1.0, W = 1.0;
      for (const x of [-W, W - .08]) for (const z of [z0, z1 - .08]) B(x, 0, z, x + .08, top, z + .08, T.r_blueUp || mt);
      for (let i = 1; i <= lv; i++) { const y = i * st - .12; if (i === lv && top - y < .3) continue; for (const z of [z0, z1 - .1]) B(-W, y, z, W, y + .12, z + .1, T.r_orange || rs); }
      for (let i = 0; i < lv; i++) { const y = i === 0 ? 0 : i * st; for (const x of [-.48, .48]) { if (rr(i * 3 + x) < .25) continue; B(x - .45, y, z0 + .05, x + .45, y + .12, z1 - .05, T.palletT || dw); const h = .5 + rr(i + x * 7) * Math.min(.7, st - .5); B(x - .42, y + .12, z0 + .08, x + .42, y + .12 + h, z1 - .08, rr(i + x) > .5 ? T.cardboard : (T.crateBox || T.cardboard)); } }
      break; }
    case "r_drums": for (let i = 0; i < 3; i++) { const x = -.62 + i * .62, z = .33, m = [T.r_drumB, T.cylRed, T.r_drumB][(i + Math.floor(rr(4) * 3)) % 3] || mt; if (i === 2 && rr(1) > .55) { const Q = Sub(x, .33, .3 + rr(2)); pcylX(v, Q, .29, 0, -.44, .44, .29, 12, m, rs); continue; } C(x, z, 0, .88, .29, .29, 14, m, rs); for (const y of [.3, .58]) C(x, z, y, y + .02, .3, .3, 14, T.dark, null); } break;
    case "r_lockerRow": for (let i = 0; i < 4; i++) { const x = -.8 + i * .4; B(x + .01, .1, 0, x + .39, 1.85, .48, T.lockerM || T.r_greyP); if (s.open && i === 2) B(x + .03, .14, .47, x + .37, 1.8, .48, T.dark); else B(x + .03, .14, .48, x + .37, 1.8, .495, T.lockerM || T.r_greyP); for (let k = 0; k < 4; k++) B(x + .12, 1.6 - k * .05, .495, x + .28, 1.615 - k * .05, .5, T.dark); B(x + .3, .9, .495, x + .32, 1.05, .52, mt); }
      B(-.8, 0, 0, .8, .1, .45, T.dark); if (s.open || (!s.act && rr(2) > .5)) { const Q = Sub(.38, .48, -1.4); pbox(v, Q, -.36, .14, 0, 0, 1.8, .02, T.lockerM || T.r_greyP); } B(-.7, .45, .55, .7, .5, .85, dw); for (const x of [-.6, .6]) B(x - .02, 0, .6, x + .02, .45, .8, mt); break;
    case "r_filing": for (let i = 0; i < 2; i++) { const x = -.45 + i * .46; B(x, 0, 0, x + .44, 1.32, .62, T.r_greyP || mt); for (let k = 0; k < 4; k++) { const po = s.open && i === 0 && k === 3 ? .4 : 0; if (po) B(x + .03, .05 + k * .32, .2 + po, x + .41, .3 + k * .32, .62 + po, { all: T.r_greyP || mt, t: T.dark }); B(x + .02, .04 + k * .32, .62 + po, x + .42, .32 + k * .32, .63 + po, T.r_greyP || mt); B(x + .15, .22 + k * .32, .63 + po, x + .29, .25 + k * .32, .65 + po, mt); } }
      { const Q = Sub(-.23, .62, 0); pbox(v, Q, -.2, .7, 0, .2, .98, .4, T.r_greyP || mt); for (let k = 0; k < 6; k++) pbox(v, Q, -.18, .7, .05 + k * .05, .18, .95, .06 + k * .05, T.paperSheet || T.clWhite); } break;
    case "r_cooler": C(0, .2, 0, .95, .18, .18, 10, T.enamel); C(0, .2, .95, 1.35, .15, .13, 10, T.glassB, T.glassB); B(-.06, .7, .35, .06, .78, .4, mt); break;
    case "r_officeDesk": if (s.open) B(.52, .46, -.8, .78, .68, -.3, { all: T.r_greyP || dw, t: T.dark }); B(-.8, .73, -.4, .8, .76, .4, T.r_greyP || dw); for (const x of [-.8, .5]) B(x, 0, -.38, x + .3, .73, .38, T.r_greyP || dw); chair(0, -.7, .15, T.r_greyP || dw);
      B(-.35, .76, .0, .1, .78, .3, T.paperSheet || T.clWhite); for (let k = 0; k < 6; k++) B(.25, .76 + k * .015, .05, .55, .775 + k * .015, .33, T.paperSheet || T.clWhite); B(-.7, .76, .1, -.45, .99, .3, T.plastic || T.dark); B(-.68, .8, .3, -.47, .96, .305, T.tvOff || T.dark); C(.6, -.25, .76, .86, .04, .035, 8, T.porcelain || T.enamel); break;
    case "r_canteen": B(-.9, .72, -.4, .9, .76, .4, T.r_greyP || dw); for (const x of [-.85, .85]) B(x - .03, 0, -.35, x + .03, .72, .35, mt); for (const z of [-.7, .7]) { B(-.9, .42, z - .15, .9, .46, z + .15, T.r_greyP || dw); for (const x of [-.8, .8]) B(x - .02, 0, z - .1, x + .02, .42, z + .1, mt); }
      for (let i = 0; i < 3; i++) { B(-.6 + i * .55, .76, -.3 + (i % 2) * .3, -.32 + i * .55, .79, -.1 + (i % 2) * .3, mt); SP(-.46 + i * .55, .8, -.2 + (i % 2) * .3, .06, 6, T.r_food, 1.2, .4, 1); } break;
    case "r_forklift": { const Y = T.r_yellow || T.clRed; B(-.55, .15, -1.15, .55, .55, .7, Y); B(-.55, .15, -1.2, .55, 1.0, -.8, T.r_greyP || mt); B(-.5, .55, -.55, .5, .62, .3, Y); B(-.25, .62, -.5, .25, .72, -.05, T.dark); B(-.25, .72, -.5, .25, 1.15, -.42, T.dark);
      C(0, .2, .62, .95, .03, .03, 6, T.dark); { const Q = XL(X, 0, 1.0, .2, -.6); pcyl(v, Q, 0, .2, .95, 1.0, .16, .16, 10, T.dark, T.dark); }
      for (const [x, z] of [[-.52, -.85], [.47, -.85], [-.52, .5], [.47, .5]]) B(x, .6, z, x + .05, 2.1, z + .05, T.dark); B(-.55, 2.08, -.9, .55, 2.15, .55, T.dark); for (let i = 0; i < 5; i++) B(-.52, 2.1, -.8 + i * .3, .52, 2.13, -.77 + i * .3, T.dark);
      for (const [x, z, r] of [[-.58, .45, .3], [.58, .45, .3], [-.58, -.85, .25], [.58, -.85, .25]]) pcylX(v, X, r, z, x - .12, x + .12, r, 12, T.tire || T.dark, T.hubcap || mt);
      for (const x of [-.4, .34]) B(x, .1, .72, x + .06, 2.2, .82, T.dark); B(-.42, 1.5, .74, .42, 1.55, .8, T.dark); B(-.42, .1, .82, .42, .4, .87, T.dark); for (const x of [-.32, .22]) B(x, .1, .87, x + .1, .14, 1.95, T.r_greyP || mt);
      B(-.55, .14, 1.15, .55, .26, 1.9, T.palletT || dw); B(-.5, .26, 1.2, .5, .9, 1.85, T.cardboard); break; }
    case "r_machine": B(-.5, 0, -1.2, .5, .25, 1.2, T.r_greenP || mt); B(-.45, .25, -1.15, .45, .95, -.4, T.r_greenP || mt); B(-.35, .95, -1.0, .35, 1.35, -.5, T.r_greenP || mt); CX(1.12, -.75, -.36, .36, .15, 10, T.dark);
      B(-.3, .25, -.4, .3, .8, 1.15, T.r_greenP || mt); CX(.95, -.2, -.12, .12, .14, 10, mt); { const Q = Sub(0, -.25, -Math.PI / 2); pcylX(v, Q, .95, 0, 0, .3, .1, 10, mt); } B(-.42, .8, -.1, .42, .86, 1.1, mt); B(-.08, .86, .7, .08, .98, .9, T.r_greyP || mt);
      B(.45, .6, -.3, .6, 1.3, .1, T.r_panel); for (const [x, z] of [[-1, -1.6], [-1, 1.55], [.95, -1.6], [.95, 1.55]]) B(x, .002, z, x + .05, .006, z + .05, T.hazard || T.r_yellow); B(-1, .002, -1.6, 1, .006, -1.55, T.hazard || T.r_yellow); B(-1, .002, 1.55, 1, .006, 1.6, T.hazard || T.r_yellow); B(-1, .002, -1.6, -.95, .006, 1.6, T.hazard || T.r_yellow); B(.95, .002, -1.6, 1, .006, 1.6, T.hazard || T.r_yellow); break;
    case "r_press": { const top = Math.min(H - .2, 3.0); for (const x of [-.7, .5]) B(x, 0, -.5, x + .2, top, .5, T.r_greenP || mt); B(-.75, top - .5, -.55, .75, top, .55, T.r_greenP || mt); B(-.7, 0, -.55, .7, .7, .55, T.r_greenP || mt); C(0, 0, top - 1.2, top - .5, .2, .2, 12, mt);
      B(-.45, top - 1.4, -.4, .45, top - 1.2, .4, T.r_greyP || mt); B(-.45, .7, -.4, .45, .78, .4, mt); B(.72, .8, .2, .92, 1.4, .45, T.r_panel); for (let i = 0; i < 3; i++) B(-.5 + i * .4, .02, .56, -.3 + i * .4, .03, .62, T.hazard || T.r_yellow); break; }
    case "r_transformer": B(-.65, 0, -.5, .65, .1, .5, T.dark); B(-.55, .1, -.4, .55, 1.5, .4, T.r_greenP || mt); for (let i = 0; i < 7; i++) { const z = -.36 + i * .12; B(-.8, .2, z, -.55, 1.35, z + .03, T.r_greenP || mt); B(.55, .2, z, .8, 1.35, z + .03, T.r_greenP || mt); }
      for (let i = 0; i < 3; i++) { const z = -.25 + i * .25; for (let k = 0; k < 4; k++) C(0, z, 1.5 + k * .07, 1.56 + k * .07, .07, .05, 8, T.porcelain || T.enamel); C(0, z, 1.78, 1.85, .02, .02, 5, T.brass || mt); }
      B(-.3, .8, .4, .3, 1.15, .41, { all: T.r_elec }); B(-.9, .002, -.8, .9, .006, -.75, T.hazard || T.r_yellow); B(-.9, .002, .75, .9, .006, .8, T.hazard || T.r_yellow); break;
    case "r_spool": { const Q = Sub(0, 0, rr(1) * 3); pcylX(v, Q, .6, 0, -.42, -.36, .6, 16, T.palletT || dw, T.palletT || dw); pcylX(v, Q, .6, 0, .36, .42, .6, 16, T.palletT || dw, T.palletT || dw); pcylX(v, Q, .6, 0, -.36, .36, .4, 14, T.dark, T.dark); pcylX(v, Q, .6, 0, -.43, .43, .06, 8, mt, mt); } break;
    case "r_boxStack": { let y = 0; for (let i = 0; i < 2 + Math.floor(rr(1) * 3); i++) { const w = .35 + rr(i + 2) * .2, d = .3 + rr(i + 5) * .15, h = .3 + rr(i + 7) * .2, a = (rr(i) - .5) * .4, ox = (rr(i + 8) - .5) * .15; pbox(v, XL(X, ox, y, 0, 0, 0), ox - w, y, -d, ox + w, y + h, d, T.cardboard); y += h; if (y > 1.4) break; } const Q = Sub(.5, .3, .6); pbox(v, Q, -.2, 0, -.2, .2, .35, .2, T.cardboard); break; }
    case "r_pallets": for (let i = 0; i < 4 + Math.floor(rr(1) * 4); i++) { const y = i * .145, Q = Sub((rr(i) - .5) * .06, (rr(i + 3) - .5) * .06, (rr(i + 6) - .5) * .1); for (let k = 0; k < 5; k++) pbox(v, Q, -.6, y + .1, -.5 + k * .23, .6, y + .125, -.4 + k * .23, T.palletT || dw); for (const z of [-.5, -.05, .4]) pbox(v, Q, -.6, y, z, .6, y + .1, z + .1, T.palletT || dw); } break;
    // ======================= NGOÀI TRỜI =======================
    case "r_boulder": { const m1 = T.rockT, m2 = T.mossT || T.rockT; SP(0, .2, 0, .7 + rr(1) * .25, 5, m1, 1.15 + rr(3) * .4, .8 + rr(4) * .35, 1); SP(.15, .55 + rr(5) * .2, -.1, .35, 4, m2, 1.3, .5, 1.1); SP(.65, .1, .35, .32, 4, m1, 1, .8, 1.2); SP(-.55, .05, -.4, .26, 4, m2, 1.2, .7, 1); break; }
    case "r_fallen": { const L = 3.1, r = .38 + rr(1) * .1; CX(r * .9, 0, -L, L, r, 10, T.deadwood || T.bark || dw, T.palletT || dw); { const Q = Sub(-L, 0, Math.PI / 2); pcylX(v, Q, r, 0, -.05, .05, r * 2.3, 12, T.dirt || T.rockT, T.dirt || T.rockT); for (let i = 0; i < 8; i++) { const a = i * .8; pcyl(v, XL(Q, 0, r, 0, Math.cos(a) * 1.3, Math.sin(a) * 1.3), 0, 0, r, r + .9, .07, .02, 5, T.deadwood || dw, null); } }
      for (let i = 0; i < 5; i++) { const x = -L + 1 + i * 1.1, a = (i % 2 ? 1 : -1) * (.5 + rr(i) * .6); pcyl(v, XL(X, x, r * 1.6, 0, a, 0), x, 0, r * 1.6, r * 1.6 + .6 + rr(i + 2) * .8, .06, .02, 5, T.deadwood || dw, null); } SP(L * .3, r * 1.75, 0, .3, 6, T.mossT || T.leafT, 2.5, .3, 1.1); break; }
    case "r_fern": for (let i = 0; i < 4; i++) { const a = i * .785 + rr(i), Q = Sub((rr(i + 5) - .5) * .5, (rr(i + 7) - .5) * .5, a); pbox(v, Q, -.4, 0, 0, .4, .55 + rr(i) * .25, .002, { all: T.r_fern, noBack: 0 }); } break;
    case "r_oldcar": { const P = T.r_rustCar || T.rust; B(-.85, .25, -2.1, .85, .85, 2.1, P); B(-.78, .85, -1.05, .78, 1.35, .55, { all: T.carWindow || T.dark, t: P }); B(-.86, .2, 2.1, .86, .45, 2.18, rs); B(-.86, .2, -2.18, .86, .45, -2.1, rs);
      for (const [x, z] of [[-.85, 1.3], [.85, 1.3], [-.85, -1.3]]) pcylX(v, X, .28, z, x - .1, x + .1, .3, 10, T.tire || T.dark, rs); B(.75, .05, -1.5, .95, .35, -1.1, T.dark); { const Q = XL(X, 0, .85, 1.2, -.5); pbox(v, Q, -.8, .85, 1.2, .8, .88, 2.1, P); }
      SP(-.3, .87, 1.6, .35, 6, T.mossT || T.leafT, 1.5, .3, 1); SP(.5, 1.36, -.2, .3, 6, T.leafT || T.mossT, 1.2, .25, 1.4); break; }
    case "r_woodpile": for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const x = -.75 + i * .3 + r * .15, y = .14 + r * .25; const Q = Sub(x, .4, Math.PI / 2 + (rr(i + r * 6) - .5) * .1); pcylX(v, Q, y, 0, -.4, .4, .13, 8, T.bark || dw, T.palletT || dw); } B(-.9, 0, .1, -.86, 1.1, .7, dw); B(.86, 0, .1, .9, 1.1, .7, dw); B(-.9, 1.1, .0, .9, 1.14, .8, dw); break;
    case "r_huntStand": for (const [x, z] of [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]]) B(x - .05, 0, z - .05, x + .05, 3.8, z + .05, T.bark || dw); B(-.7, 3.0, -.7, .7, 3.06, .7, dw); for (const z of [-.68, .68]) B(-.7, 3.06, z - .02, .7, 3.6, z + .02, dw); B(-.7, 3.06, -.7, -.66, 3.6, .7, dw);
      { const Q = XL(X, 0, 0, .9, .25); for (const x of [-.25, .25]) pbox(v, Q, x - .03, 0, .9, x + .03, 3.1, .95, dw); for (let y = .3; y < 3; y += .35) pbox(v, Q, -.25, y, .9, .25, y + .04, .95, dw); } break;
    case "r_obelisk": B(-.45, 0, -.45, .45, .35, .45, T.mausW || T.stoneW || T.rockT); C(0, 0, .35, 3.0, .32, .18, 4, T.mausW || T.stoneW || T.rockT, null, Math.PI / 4, Math.PI * 2 + Math.PI / 4); C(0, 0, 3.0, 3.25, .18, 0, 4, T.mausW || T.stoneW || T.rockT, null, Math.PI / 4, Math.PI * 2 + Math.PI / 4); SP(.2, .4, .3, .15, 6, T.mossT || T.leafT, 1.5, .4, 1); break;
    case "r_plot": { const W = .75, L = 1.25; for (const [x0, z0, x1, z1] of [[-W, -L, W, -L], [-W, L, W, L], [-W, -L, -W, L], [W, -L, W, L]]) { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / .12); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n; if (rr(i + x * 3) < .07) continue; C(x, z, 0, .75, .01, .01, 4, T.dark); C(x, z, .75, .85, .02, 0, 4, T.dark); } }
      for (const z of [-L, L]) B(-W, .6, z - .01, W, .63, z + .01, T.dark); for (const x of [-W, W]) B(x - .01, .6, -L, x + .01, .63, L, T.dark); B(-.5, 0, -.95, .5, .15, .95, T.dirt || T.rockT); B(-.4, 0, -1.1, .4, 1.0, -.95, T.mausW || T.stoneW || T.rockT); SP(0, 1.0, -1.03, .4, 8, T.mausW || T.stoneW || T.rockT, 1, .4, .19); break; }
    case "r_mound": { const Q = XSp(X, 0, 0, 0, 1, .4, 2.1); psphere(v, Q, 0, 0, 0, .55, 9, T.dirt || T.rockT); } B(-.04, 0, -1.05, .04, 1.1, -.98, dw); B(-.3, .75, -1.05, .3, .82, -.98, dw); { const Q = XL(X, .55, 0, .6, .3, .3); pbox(v, Q, .54, .3, .59, .56, 1.2, .61, dw); pbox(v, Q, .5, .05, .55, .6, .32, .65, mt); } for (let i = 0; i < 3; i++) SP(-.2 + i * .2, .2, .3 - i * .25, .05, 5, T.flowerW || T.clWhite); break;
    case "r_wheelbarrow": { const Q = Sub(0, 0, 0); pbox(v, Q, -.3, .35, -.45, .3, .62, .35, rs); C(0, .55, .05, .5, .16, .16, 10, T.tire || T.dark); for (const x of [-.27, .27]) { B(x - .02, .35, -.45, x + .02, .38, .55, mt); B(x - .02, 0, -.35, x + .02, .38, -.32, mt); B(x - .02, .4, -.95, x + .02, .44, -.45, mt); } B(-.25, .58, -.4, .25, .6, .3, T.dirt || T.rockT); break; }
    case "r_wreath": for (const x of [-.25, .25]) B(x - .015, 0, .2, x + .015, 1.3, .23, dw); B(-.28, .5, .2, .28, .52, .23, dw); { const Q = XL(X, 0, 1.1, .2, Math.PI / 2); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; psphere(v, Q, Math.cos(a) * .3, 1.1, Math.sin(a) * .3 + .2, .08, 5, i % 4 === 0 ? (T.clRed || T.flowerW) : (T.leafT || T.mossT)); } } break;
    case "r_celtic": B(-.3, 0, .05, .3, .2, .45, T.mausW || T.stoneW || T.rockT); B(-.12, .2, .18, .12, 2.1, .32, T.mausW || T.stoneW || T.rockT); B(-.5, 1.45, .18, .5, 1.68, .32, T.mausW || T.stoneW || T.rockT); { const Q = XL(X, 0, 1.56, .25, Math.PI / 2); pcyl(v, Q, 0, .25, 1.49, 1.63, .36, .36, 14, T.mausW || T.stoneW || T.rockT, null); } SP(.1, .25, .3, .2, 6, T.mossT || T.leafT, 1.5, .4, 1); break;
    // ======================= ĐỒ TREO TƯỜNG =======================
    case "r_painting": { const y = Math.min(1.55, H - 1.2), w = .5 + rr(1) * .35, h = .4 + rr(2) * .35, Q = XL(X, 0, y, 0, 0, (rr(3) - .5) * .12); pbox(v, Q, -w - .05, y - h - .05, 0, w + .05, y + h + .05, .04, T.brass || dw); pbox(v, Q, -w, y - h, .04, w, y + h, .045, T.frameArt?.[Math.floor(rr(4) * 3)] || T.portrait || T.dark); break; }
    case "r_wallShelf": { const y = 1.45 + rr(1) * .2; B(-.6, y, 0, .6, y + .03, .25, dw); for (const x of [-.45, .45]) B(x - .02, y - .18, 0, x + .02, y, .2, dw); let x = -.55; let i = 0; while (x < .45) { const k = Math.floor(rr(x * 7) * 3), w = .08 + rr(x * 3) * .1; if (k === 0) C(x + w / 2, .12, y + .03, y + .18, .045, .04, 8, T.glassB || T.enamel); else if (k === 1) book(x, y + .03, .03, .04, .2, .18, i); else SP(x + .05, y + .1, .12, .06, 6, T.porcelain || T.enamel, 1, 1.2, 1); x += w + .03; i++; } break; }
    case "r_clockW": { const y = Math.min(1.9, H - .5); const Q = XL(X, 0, y, 0, Math.PI / 2); pcyl(v, Q, 0, 0, y, y + .05, .22, .22, 16, dw, T.clockFace || T.enamel); break; }
    case "r_mirrorW": { const y = 1.45; B(-.32, y - .45, 0, .32, y + .45, .04, T.brass || dw); B(-.27, y - .4, .04, .27, y + .4, .045, T.r_mirror); break; }
    case "r_fuse": B(-.3, 1.2, 0, .3, 1.8, .18, T.r_greyP || mt); B(-.28, 1.22, .18, .28, 1.78, .19, T.r_elec); C(-.15, .08, 1.8, Math.max(2.4, H - .05), .03, .03, 6, mt); C(.15, .08, .2, 1.2, .03, .03, 6, mt); B(.18, 1.4, .19, .24, 1.55, .25, T.dark); break;
    case "r_pipes": { const y0 = Math.min(2.3, H - .9); for (let i = 0; i < 3; i++) { const y = y0 + i * .28, r = .07 - i * .015, m = i === 1 ? rs : mt; CX(y, .15 + i * .02, -1.06, 1.06, r, 8, m, null); for (const x of [-.6, .5]) CX(y, .15 + i * .02, x - .03, x + .03, r + .03, 8, T.dark); }
      if (rr(1) > .4) { C(.3, .15, 0, y0, .07, .07, 8, rs); const Q = XL(X, .3, 1.2, .15, Math.PI / 2); pcyl(v, Q, .3, .15, 1.28, 1.31, .2, .2, 12, T.clRed || rs, null); B(.1, 1.19, .23, .5, 1.21, .25, T.clRed || rs); B(.29, 1.0, .23, .31, 1.4, .25, T.clRed || rs); C(.3, .15, 1.2, 1.25, .03, .03, 6, mt); } break; }
    case "r_poster": { const y = 1.55; B(-.32, y - .42, 0, .32, y + .42, .01, T.paperSheet || T.clWhite); B(-.28, y + .05, .011, .28, y + .35, .012, T.hazard || T.r_yellow); B(-.26, y - .35, .011, .26, y - .05, .012, T.r_elec); break; }
    case "r_bannerW": { const top = Math.min(H - .4, 4.2), L = Math.min(2.6, top - .9); B(-.48, top, 0, .48, top + .05, .08, T.dark); B(-.42, top - L, .04, .42, top, .05, T.r_banner); for (let i = 0; i < 3; i++) B(-.42 + i * .3, top - L - .2, .04, -.3 + i * .3, top - L, .05, T.r_banner); break; }
    case "r_shieldW": { const y = Math.min(1.9, H - .7); if (T.shield) B(-.3, y - .35, 0, .3, y + .35, .05, T.shield); for (const a of [.7, -.7]) { const Q = XL(X, 0, y, .07, 0, a); pbox(v, Q, -.02, y - .7, .06, .02, y + .5, .075, mt); pbox(v, Q, -.1, y - .4, .055, .1, y - .37, .08, T.brass || mt); } break; }
    case "r_tapestry": { const top = Math.min(H - .3, 3.4), L = Math.min(2.2, top - .6); C(0, .06, top, top + .04, .03, .03, 6, T.brass || mt); CX(top, .06, -.9, .9, .025, 6, T.brass || mt); B(-.85, top - L, .04, .85, top, .05, T.curtain || T.r_velvet); break; }
    case "r_crossW": B(-.04, 1.1, 0, .04, 2.0, .05, dw); B(-.25, 1.65, 0, .25, 1.73, .05, dw); break;
    case "r_deer": { const y = Math.min(2.0, H - .6); B(-.18, y - .25, 0, .18, y + .2, .04, dw); SP(0, y, .15, .12, 7, T.furT || dw, .8, 1, 1.4); for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const Q = XL(X, sx * .08, y + .1, .15, -.3, sx * (.5 + i * .35)); pcyl(v, Q, sx * .08, .15, y + .1, y + .45 - i * .08, .015, .008, 4, T.boneT || T.bone || dw, null); } break; }
    default: return false;
  }
  return true;
}

// ---------- 5. BÀY ĐỒ THEO CÔNG NĂNG TỪNG PHÒNG ----------
const firstOf = m => Array.isArray(m) ? m[0] : m;
function roomKind(f, x, y) {
  const r = f.room[y * f.w + x]; if (!r) return f.outdoor ? "out" : null; const fl = firstOf(r.floor), wl = firstOf(r.wall), h = r.h ?? WH;
  if (MAPID === "house") { if (fl === T.kitF) return "kitchen"; if (fl === T.bathF) return "bath"; if (fl === T.marble) return "hall"; if (fl === T.carpet) return "corr"; if (wl === T.rose) return "kid";
    if (fl === T.carpetB) return "bed"; if (fl === T.woodDk) return "library"; if (fl === T.wood) return wl === T.paper ? "living" : "play"; return "store"; }
  if (MAPID === "factory") { if (fl === T.kitF) return "canteen"; if (fl === T.carpetB) return "office"; if (h >= 3.3) return "hall"; if (h <= 2.15 && wl === T.concP) return "corr"; return "workshop"; }
  if (MAPID === "castle") { if (f.id === "c3") return "crypt"; if (fl === T.woodDk) return "study"; if (fl === T.carpet) return h >= 3 ? "throne" : "gallery"; if (h >= 3.5) return "greathall"; return "keep"; }
  if (MAPID === "cemetery") return r.roof ? "chapel" : "out";
  if (MAPID === "forest") return r.roof ? "cabin" : "out";
  return null;
}
// [đồ áp tường], [đồ giữa phòng], [đồ treo tường], mật độ giữa phòng (ô trống / món)
const RCAT = {
  house: {
    kitchen: [[["r_counter", 3], ["r_fridge", 2], ["r_stove", 2], ["d_cabinet", 1], ["r_washer", 1]], [["r_kitTable", 3], ["r_dining", 1]], [["r_wallShelf", 3], ["r_clockW", 1], ["r_painting", 1]], 8],
    bath: [[["r_bathtub", 2], ["r_toilet", 2], ["r_sinkP", 2], ["r_washer", 1]], [], [["r_mirrorW", 2], ["r_wallShelf", 1]], 99],
    hall: [[["d_clock", 1], ["r_coatrack", 2], ["r_dresser", 1], ["r_piano", 1]], [["r_round", 3], ["r_rug", 2], ["r_armchairs", 1]], [["r_painting", 4], ["r_deer", 1], ["r_mirrorW", 1]], 7],
    kid: [[["r_bedS", 3], ["r_toybox", 2], ["r_wardrobe", 1], ["r_dresser", 1], ["r_nightstand", 1]], [["r_crib", 2], ["r_toys", 3], ["r_rug", 2]], [["r_painting", 2], ["r_wallShelf", 2], ["r_clockW", 1]], 6],
    bed: [[["r_bed", 3], ["r_wardrobe", 2], ["r_dresser", 2], ["r_nightstand", 2], ["r_tvset", 1]], [["r_armchairs", 2], ["r_rug", 3]], [["r_painting", 3], ["r_mirrorW", 1], ["r_clockW", 1]], 8],
    library: [[["r_bookTall", 5], ["r_desk", 1], ["d_clock", 1]], [["r_globeDesk", 2], ["r_armchairs", 2], ["r_rug", 2]], [["r_painting", 2], ["r_deer", 1]], 7],
    living: [[["r_piano", 2], ["r_tvset", 2], ["r_bookTall", 1], ["r_dresser", 1], ["d_clock", 1]], [["r_sofaSet", 3], ["r_armchairs", 2], ["r_rug", 1]], [["r_painting", 3], ["r_clockW", 1], ["r_deer", 1], ["r_wallShelf", 1]], 7],
    play: [[["r_toybox", 2], ["r_bookTall", 1], ["r_tvset", 1], ["r_piano", 1]], [["r_toys", 3], ["r_rug", 2], ["r_kitTable", 1]], [["r_painting", 2], ["r_wallShelf", 2]], 6],
    store: [[["r_shelfMetal", 3], ["r_workbench", 2], ["r_bicycle", 1], ["r_washer", 1], ["d_boxes", 2], ["r_drums", 1]], [["r_boxStack", 3], ["r_pallets", 1]], [["r_wallShelf", 2], ["r_fuse", 1], ["r_pipes", 1]], 6],
    corr: [[], [], [["r_painting", 3], ["r_mirrorW", 1], ["r_clockW", 1]], 99],
  },
  factory: {
    hall: [[["r_elecCab", 3], ["r_rackWall", 3], ["r_gasRack", 1], ["r_lockerRow", 1], ["r_drums", 2], ["r_ctrlPanel", 1]], [["r_rackRow", 3], ["r_forklift", 1], ["r_machine", 2], ["r_press", 1], ["r_transformer", 1], ["r_spool", 2], ["r_pallets", 2], ["r_drums", 1]], [["r_pipes", 3], ["r_fuse", 2], ["r_poster", 2]], 5],
    workshop: [[["r_workbench", 3], ["r_toolCart", 2], ["r_elecCab", 2], ["r_shelfMetal", 2], ["r_drums", 1], ["r_gasRack", 1]], [["r_machine", 2], ["r_spool", 1], ["r_boxStack", 2]], [["r_pipes", 2], ["r_fuse", 2], ["r_poster", 2]], 6],
    office: [[["r_filing", 3], ["r_cooler", 1], ["r_bookTall", 1], ["r_ctrlPanel", 1]], [["r_officeDesk", 3]], [["r_poster", 2], ["r_clockW", 2], ["r_painting", 1]], 5],
    canteen: [[["r_counter", 2], ["r_fridge", 1], ["r_stove", 1], ["r_lockerRow", 1]], [["r_canteen", 4]], [["r_poster", 2], ["r_clockW", 1]], 5],
    corr: [[], [], [["r_pipes", 3], ["r_fuse", 2], ["r_poster", 1]], 99],
  },
  castle: {
    greathall: [[["r_weaponRack", 2], ["r_wineRack", 1], ["r_ironMaiden", 1]], [["r_banquet", 3], ["r_brazier", 2], ["r_rug", 1]], [["r_bannerW", 4], ["r_tapestry", 3], ["r_shieldW", 2], ["r_deer", 1]], 7],
    keep: [[["r_wineRack", 2], ["r_weaponRack", 1], ["r_ironMaiden", 2], ["r_stocks", 1], ["r_bookTall", 1]], [["r_tortureRack", 2], ["r_cauldron", 2], ["r_brazier", 2], ["r_boxStack", 1]], [["r_shieldW", 2], ["r_bannerW", 2], ["r_tapestry", 1]], 6],
    study: [[["r_bookTall", 4], ["r_fourPoster", 2], ["r_dresser", 1], ["r_desk", 1]], [["r_globeDesk", 2], ["r_armchairs", 2], ["r_rug", 2]], [["r_painting", 3], ["r_tapestry", 2], ["r_deer", 1]], 6],
    throne: [[["r_weaponRack", 1], ["r_altarSm", 1]], [["r_brazier", 2], ["r_pews", 1]], [["r_bannerW", 4], ["r_tapestry", 2], ["r_shieldW", 2]], 8],
    gallery: [[["r_bookTall", 1]], [], [["r_painting", 3], ["r_bannerW", 2], ["r_shieldW", 1], ["r_tapestry", 1]], 99],
    crypt: [[["r_altarSm", 1], ["r_ironMaiden", 1]], [["r_cauldron", 1], ["r_brazier", 2]], [["r_crossW", 1], ["r_tapestry", 1]], 10],
  },
  cemetery: { chapel: [[["r_altarSm", 1], ["r_bookTall", 1]], [["r_pews", 3], ["r_brazier", 1]], [["r_crossW", 3], ["r_painting", 1], ["r_tapestry", 1]], 6],
    out: [[], [["r_obelisk", 2], ["r_plot", 3], ["r_mound", 2], ["r_wheelbarrow", 1], ["r_wreath", 2], ["r_celtic", 2], ["r_boulder", 1]], [], 30] },
  forest: { cabin: [[["r_bed", 1], ["r_shelfMetal", 1], ["r_woodpile", 1]], [["r_kitTable", 1]], [["r_deer", 2], ["r_wallShelf", 1]], 7],
    out: [[], [["r_boulder", 3], ["r_fallen", 2], ["r_fern", 5], ["r_woodpile", 1], ["r_huntStand", 1], ["r_oldcar", 1], ["r_spool", 0]], [], 26] },
};
const pickW = list => { const tot = list.reduce((a, b) => a + b[1], 0); if (!tot) return null; let r = Math.random() * tot; for (const [k, w] of list) if ((r -= w) <= 0) return k; return list[list.length - 1][0]; };

function furnishRooms(f) {
  const cat = RCAT[MAPID]; if (!cat) return; const W = f.w, Hh = f.h, N = W * Hh, idx = (x, y) => y * W + x;
  const walk = new Uint8Array(N); for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (f.grid[y][x] === ".") walk[idx(x, y)] = 1;
  const blocked = new Uint8Array(N);
  const _F = F; F = f;
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (walk[idx(x, y)]) { const cx = x + .5, cy = y + .5; if (f.sprites.some(s => s.solid && !s.taken && Math.hypot(s.x - cx, s.y - cy) < s.solid) || (f.blocks || []).some(b => cx > b[0] - .2 && cx < b[2] + .2 && cy > b[1] - .2 && cy < b[3] + .2)) blocked[idx(x, y)] = 1; }
  F = _F;
  const comps = () => { const seen = new Uint8Array(N); let n = 0; const st = []; for (let i = 0; i < N; i++) { if (!walk[i] || blocked[i] || seen[i]) continue; n++; seen[i] = 1; st.push(i); while (st.length) { const c = st.pop(), x = c % W, y = (c - x) / W; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= Hh) continue; const j = idx(nx, ny); if (walk[j] && !blocked[j] && !seen[j]) { seen[j] = 1; st.push(j); } } } } return n; };
  let C0 = comps();
  const tryBlock = cells => { const fresh = cells.filter(i => !blocked[i]); fresh.forEach(i => blocked[i] = 1); const c = comps(); if (c > C0) { fresh.forEach(i => blocked[i] = 0); return false; } C0 = c; return true; };
  const special = (x, y, r = 1) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const c = f.grid[y + dy]?.[x + dx]; if (c && c !== "#" && c !== "." && c !== "I") return true; } return false; };
  const BIG = new Set(["web", "tree", "dead", "tomb", "cross", "willow", "slantern", "rock", "log", "stump", "sign"]);
  const keySpr = f.sprites.filter(s => !s.taken && (s.act || s.kind || s.k === "task" || s.tk || s.t === T.battery || (s.k && !s.deco && !BIG.has(s.k))));
  const starts = f === F ? (COOP && S.spawnPos ? S.spawnPos : players()).map(p => [p.x, p.y]) : [[f.arriveX ?? -99, f.arriveY ?? -99]];   // cùng kết quả trên cả hai máy khi chơi online
  const nearKey = (x, y, r) => keySpr.some(s => Math.hypot(s.x - x, s.y - y) < r) || starts.some(st => Math.hypot(st[0] - x, st[1] - y) < 1.8);
  const placed = [], nearPlaced = (x, y, r) => placed.some(p => Math.hypot(p[0] - x, p[1] - y) < r);
  const roofH = (x, y) => { const r = f.room[idx(x, y)]; return r?.h ?? (f.outdoor ? 6 : WH); };
  const makeCols = (k, x, y, rot, extra = {}) => {
    if (RFLAT.has(k) || RMOUNT.has(k) || extra.noCol) return [];
    const md = RMETA[k] || [1, 1], out = [], fw = facing(rot), ax = [Math.cos(rot), Math.sin(rot)], side = [fw.c, fw.s];   // ax: hướng +z cục bộ, side: hướng +x cục bộ
    const wid = md[0] * M, dep = md[1] * M, along = wid >= dep, long = Math.max(wid, dep), short = Math.min(wid, dep), r = short / 2 + .16, n = Math.max(1, Math.ceil(long / (short * 1.1 + .05)));
    const cz = extra.wall ? dep / 2 : 0;
    for (let i = 0; i < n; i++) { const o = n === 1 ? 0 : -long / 2 + short / 2 + (long - short) * i / (n - 1); out.push({ k: "r_col", x: x + ax[0] * cz + (along ? side[0] * o : ax[0] * o), y: y + ax[1] * cz + (along ? side[1] * o : ax[1] * o), solid: r, deco: 1 }); }
    return out;
  };
  const add = (k, x, y, rot, rx, ry, extra = {}, cols) => {
    f.sprites.push({ k, x, y, rot, deco: 1, seed: Math.random(), rh: roofH(rx, ry), ...extra });
    for (const c of cols || makeCols(k, x, y, rot, extra)) f.sprites.push(c);
  };
  // Kiểm tra cục bộ (lưới 0,25 ô quanh món đồ): không được chia cắt lối đi người chơi vốn đi qua được
  const gfree = (x, y) => f.grid[Math.floor(y)]?.[Math.floor(x)] === ".";
  const localOK = (cx, cy, cols) => {
    if (!cols.length) return true; const R = 3.2, st = .25, n = Math.ceil(2 * R / st), x0 = cx - R, y0 = cy - R;
    const sol = f.sprites.filter(s => s.solid && !s.taken && Math.abs(s.x - cx) < R + 1.2 && Math.abs(s.y - cy) < R + 1.2), blk = (f.blocks || []).filter(b => b[2] > x0 - 1 && b[0] < x0 + 2 * R + 1 && b[3] > y0 - 1 && b[1] < y0 + 2 * R + 1);
    const ok = (x, y, extra) => { const r = .22; if (!(gfree(x - r, y - r) && gfree(x + r, y - r) && gfree(x - r, y + r) && gfree(x + r, y + r))) return false; for (const s of sol) if (Math.hypot(s.x - x, s.y - y) < s.solid) return false; if (extra) for (const s of cols) if (Math.hypot(s.x - x, s.y - y) < s.solid) return false;
      for (const b of blk) { const qx = Math.max(b[0], Math.min(x, b[2])), qy = Math.max(b[1], Math.min(y, b[3])); if (Math.hypot(x - qx, y - qy) < .2) return false; } return true; };
    const A = new Uint8Array(n * n), B = new Uint8Array(n * n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * st, y = y0 + (j + .5) * st; if (ok(x, y, false)) { A[j * n + i] = 1; B[j * n + i] = ok(x, y, true) ? 1 : 0; } }
    const lab = (G) => { const L = new Int32Array(n * n).fill(-1); let c = 0; const q = []; for (let i = 0; i < n * n; i++) { if (!G[i] || L[i] >= 0) continue; L[i] = c; q.push(i); while (q.length) { const p = q.pop(), x = p % n, y = (p - x) / n; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue; const k = ny * n + nx; if (G[k] && L[k] < 0) { L[k] = c; q.push(k); } } } c++; } return [L, c]; };
    const [LA, ca] = lab(A), [LB] = lab(B), seen = Array.from({ length: ca }, () => new Set()), edge = new Uint8Array(ca);
    for (let i = 0; i < n * n; i++) { if (LA[i] < 0) continue; const x = i % n, y = (i - x) / n; if (x === 0 || y === 0 || x === n - 1 || y === n - 1) edge[LA[i]] = 1; if (LB[i] >= 0) seen[LA[i]].add(LB[i]); }
    for (let c = 0; c < ca; c++) if (seen[c].size > 1 || (edge[c] && seen[c].size === 0)) return false;
    return true;
  };
  const isW = (x, y) => { const c = f.grid[y]?.[x]; return c === "#" || c === undefined; };
  const kindAt = (x, y) => roomKind(f, x, y);
  // --- (a) đồ áp tường ---
  if (!f.outdoor || MAPID === "cemetery" || MAPID === "forest") {
    const cells = []; for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) cells.push([x, y]);
    cells.sort(() => Math.random() - .5);
    for (const [x, y] of cells) {
      if (!walk[idx(x, y)] || blocked[idx(x, y)]) continue; const rk = kindAt(x, y); if (!rk || rk === "out") continue; const C = cat[rk]; if (!C) continue;
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isW(x + dx, y + dy)); if (!dirs.length || dirs.length > 2) continue;
      const [wx, wy] = dirs[Math.floor(Math.random() * dirs.length)]; if (special(x, y)) continue;
      const wxp = x + .5 + wx * .5, wyp = y + .5 + wy * .5, rot = Math.atan2(-wy, -wx);
      // đồ treo tường (không cản đường) — tranh, kệ, ống, cầu dao, cờ...
      if (C[2].length && Math.random() < .3 && !f.sprites.some(s => s.deco && (s.k === "d_frame" || RMOUNT.has(s.k)) && Math.hypot(s.x - wxp, s.y - wyp) < .9)) { const k = pickW(C[2]); if (k) add(k, wxp - wx * .005, wyp - wy * .005, rot, x, y); }
      if (!C[0].length || Math.random() > .7) continue;
      if (!walk[idx(x - wx, y - wy)] || !walk[idx(x - 2 * wx, y - 2 * wy)] || blocked[idx(x - wx, y - wy)]) continue;
      if (nearKey(x + .5, y + .5, 1.15) || nearPlaced(x + .5, y + .5, 1.05) || f.sprites.some(s => s.deco && s.solid && s.k !== "r_col" && Math.hypot(s.x - x - .5, s.y - y - .5) < .85)) continue;
      // hai bên dọc tường cũng phải là tường thật (không đặt chắn ngang ô cửa)
      const sx = -wy, sy = wx; if ([1, -1].some(k => walk[idx(x + sx * k, y + sy * k)] && !isW(x + sx * k + wx, y + sy * k + wy))) continue;
      const k = pickW(C[0]); if (!k) continue;
      if (k.startsWith("d_")) { const cx = x + .5 + wx * .2, cy = y + .5 + wy * .2, so = (PROP_SOLID[k] || .3) * .62; if (!localOK(cx, cy, [{ x: cx, y: cy, solid: so }]) || !tryBlock([idx(x, y)])) continue; f.sprites.push({ x: cx, y: cy, k, rot, solid: PROP_SOLID[k] || .3, deco: 1, seed: Math.random() }); placed.push([cx, cy]); continue; }
      const md = RMETA[k]; if (md[1] * M > .75 && (!walk[idx(x - 2 * wx, y - 2 * wy)] || blocked[idx(x - 2 * wx, y - 2 * wy)])) continue;
      const cl = makeCols(k, wxp, wyp, rot, { wall: 1 }); if (!localOK(x + .5, y + .5, cl) || !tryBlock([idx(x, y)])) continue;
      add(k, wxp, wyp, rot, x, y, { wall: 1 }, cl); placed.push([x + .5, y + .5]);
    }
  }
  // --- (b) đồ giữa phòng ---
  const interior = []; for (let y = 2; y < Hh - 2; y++) for (let x = 2; x < W - 2; x++) {
    if (!walk[idx(x, y)] || blocked[idx(x, y)]) continue; let ok = true; for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) if (!walk[idx(x + dx, y + dy)]) { ok = false; break; }
    if (!ok || special(x, y, 2) || (f.path && f.path.has(idx(x, y)))) continue; interior.push([x, y]);
  }
  interior.sort(() => Math.random() - .5);
  const quota = {}; for (const [x, y] of interior) { const rk = kindAt(x, y); quota[rk] = (quota[rk] || 0) + 1; }
  for (const rk in quota) { const C = cat[rk]; quota[rk] = C ? Math.ceil(quota[rk] / C[3]) : 0; }
  const outdoor = f.outdoor;
  for (const [x, y] of interior) {
    const rk = kindAt(x, y); if (!quota[rk]) continue; const C = cat[rk]; if (!C || !C[1].length) continue;
    const cx = x + .5, cy = y + .5; if (blocked[idx(x, y)]) continue;
    if (nearKey(cx, cy, outdoor ? 1.6 : 1.35) || nearPlaced(cx, cy, outdoor ? 2.4 : 1.8) || f.sprites.some(s => s.solid && !s.taken && s.k !== "r_col" && Math.hypot(s.x - cx, s.y - cy) < (outdoor ? 1.5 : 1.25)) || f.sprites.some(s => s.k === "r_col" && Math.hypot(s.x - cx, s.y - cy) < 1)) continue;
    const k = pickW(C[1]); if (!k) continue; const span = RSPAN[k] || 1;
    let rot = Math.floor(Math.random() * 4) * Math.PI / 2; if ((outdoor && span === 1) || k === "r_toys" || k === "r_fern") rot += (Math.random() - .5) * (outdoor ? 6 : .4);
    else rot += (Math.random() - .5) * .16;
    const cells = [idx(x, y)];
    if (span > 1) {   // vật dài (bàn tiệc, xe nâng, thân cây đổ...) chiếm thêm ô dọc theo chiều dài
      const ax = Math.round(Math.cos(rot)), ay = Math.round(Math.sin(rot)); let ok = true;
      for (let i = -Math.floor((span - 1) / 2); i <= Math.ceil((span - 1) / 2); i++) { if (!i) continue; const nx = x + ax * i, ny = y + ay * i; if (!walk[idx(nx, ny)] || blocked[idx(nx, ny)] || special(nx, ny, 1) || (f.path && f.path.has(idx(nx, ny)))) { ok = false; break; } for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!walk[idx(nx + dx, ny + dy)]) ok = false; cells.push(idx(nx, ny)); }
      if (!ok) continue; if (span === 2) { const o = .5; add._off = [ax * o, ay * o]; } else add._off = [0, 0];
    } else add._off = [0, 0];
    const px = cx + add._off[0], py = cy + add._off[1];
    if (outdoor && !RFLAT.has(k) && f.room[idx(x, y)]?.roof) continue;
    const cl = makeCols(k, px, py, rot); if (!localOK(px, py, cl)) continue;
    if (!RFLAT.has(k) && !tryBlock(cells)) continue;
    add(k, px, py, rot, x, y, {}, cl); placed.push([px, py]); quota[rk]--;
  }
  // --- (c) rừng & nghĩa trang: thêm dương xỉ, đá rải rác dọc lối đi cho đỡ trống ---
  if (outdoor) for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!walk[idx(x, y)] || f.room[idx(x, y)] || special(x, y) || Math.random() > (MAPID === "forest" ? .07 : .035)) continue; const cx = x + .2 + Math.random() * .6, cy = y + .2 + Math.random() * .6;
    if (nearKey(cx, cy, 1) || nearPlaced(cx, cy, 1.2)) continue; add(MAPID === "forest" ? "r_fern" : (Math.random() < .5 ? "r_fern" : "d_flowers"), cx, cy, Math.random() * 6.28, x, y, { noCol: 1 }); placed.push([cx, cy]);
  }
}
