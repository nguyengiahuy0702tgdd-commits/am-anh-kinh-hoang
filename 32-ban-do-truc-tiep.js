// =====================================================================
//  31. BẢN 18: bản đồ cập nhật trực tiếp (mũi tên xoay & đi theo người chơi)
//      thời tiết & sự sống chân thật: mưa, sấm chớp, lá rơi, sương bò sát đất, thiêu thân quanh đèn, chuột chạy
// =====================================================================

// ---------- 1. BẢN ĐỒ TRỰC TIẾP ----------
function mapArrow(g, p, k, col, pulse) {
  const px = p.x * k, py = p.y * k, a = p.a, R = Math.max(k * 1.5, 9);
  g.save(); g.translate(px, py);
  g.fillStyle = `rgba(${col === "#b00" ? "180,0,0" : "30,70,180"},${.12 + pulse * .12})`; g.beginPath(); g.arc(0, 0, R * (1.2 + pulse * .5), 0, 7); g.fill();   // vòng sáng nhấp nháy
  const fov = (SET.hfov || 75) * Math.PI / 360; g.fillStyle = "rgba(255,240,200,.18)"; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R * 3.2, a - fov, a + fov); g.closePath(); g.fill();   // hình quạt tầm nhìn
  g.rotate(a); g.fillStyle = col; g.strokeStyle = "#f0e0c0"; g.lineWidth = Math.max(1, k * .12);
  g.beginPath(); g.moveTo(R, 0); g.lineTo(-R * .7, R * .62); g.lineTo(-R * .35, 0); g.lineTo(-R * .7, -R * .62); g.closePath(); g.fill(); g.stroke(); g.restore();
}
function mapLive() {
  const c = $("mapView"); if (!c || c.classList.contains("hidden") || !c._base) return;
  if (c._f !== F) { toggleMap(true); return; }
  const g = c.getContext("2d"), k = c._k; g.drawImage(c._base, 0, 0); const at = $("areaToast"); if (at) at.style.opacity = 0;
  if (D.hint < 3) players().forEach((p, i) => { if (p.f && p.f !== F.id) return; mapArrow(g, p, k, p === P1 ? "#b00" : PCOL[p.slot ?? 1], (Math.sin(t * 5) + 1) / 2); });
}

// ---------- 2. THỜI TIẾT ----------
const WX = { rain: 0, flash: 0, next: 0, drops: [], leaves: [], mist: [], src: null, rg: null };
const WX_CFG = { forest: { rain: 1, leaves: 1, mist: 1, storm: 1 }, cemetery: { rain: .8, leaves: 1, mist: 1, storm: 1 }, house: { rain: .6, storm: .7 }, castle: { storm: 1, mist: .5 }, factory: { rain: .5, storm: .6 } };
function wxStart() {
  const cfg = WX_CFG[MAPID] || {}; WX.cfg = cfg; WX.next = t + 15 + Math.random() * 20; WX.flash = 0;
  if (cfg.rain && ac && !WX.src) {   // tiếng mưa rơi đều (nghe nhỏ hơn khi ở trong nhà)
    const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b; s.loop = true; const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600; bp.Q.value = .4; const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5000;
    const g = ac.createGain(); g.gain.value = 0; s.connect(bp); bp.connect(lp); lp.connect(g); g.connect(BUS.sfx); s.start(); WX.src = s; WX.rg = g; WX.lp = lp;
  }
}
function thunder(delay, vol) {
  if (!ac) return; const t0 = ac.currentTime + delay, len = ac.sampleRate * 4, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) { const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 1.6) * (x < .03 ? x / .03 : 1) * (1 + .6 * Math.sin(x * 40) * Math.random()); }
  const s = ac.createBufferSource(); s.buffer = b; const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220; const g = ac.createGain(); g.gain.value = vol; s.connect(lp); lp.connect(g); g.connect(BUS.sfx); s.start(t0);
}
function wxTick(dt) {
  if (!S.started || S.paused || !WX.cfg) return; const cfg = WX.cfg, under = !F.outdoor || F.room[Math.floor(P1.y) * F.w + Math.floor(P1.x)]?.roof;
  if (WX.rg) { WX.rg.gain.setTargetAtTime((under ? .018 : .07) * cfg.rain, ac.currentTime, .5); WX.lp.frequency.setTargetAtTime(under ? 900 : 5000, ac.currentTime, .5); }
  if (cfg.storm && t > WX.next) {   // tia chớp: lóe 2–3 lần rồi sấm rền theo sau
    WX.next = t + (F.outdoor ? 25 : 40) + Math.random() * 45; const n = 2 + Math.floor(Math.random() * 2), dist = .5 + Math.random() * 3;
    WX.seq = []; let tt = t; for (let i = 0; i < n; i++) { WX.seq.push([tt, .5 + Math.random() * .5]); tt += .06 + Math.random() * .14; }
    thunder(dist, (F.outdoor ? .55 : .3) * (1.2 - dist / 4) * cfg.storm);
  }
  let fl = 0; if (WX.seq) for (const [st, a] of WX.seq) { const k = t - st; if (k >= 0 && k < .25) fl = Math.max(fl, a * (1 - k / .25)); }
  WX.flash = fl;
}
function wxDraw(v, eye, fw, dt) {
  if (!WX.cfg || SET.quality === "nhanh") return; const cfg = WX.cfg, rl = Math.hypot(fw[0], fw[2]) || 1, rx = -fw[2] / rl, rz = fw[0] / rl, nrm = [-fw[0], -fw[1], -fw[2]], d = dt || .016;
  const wind = Math.sin(t * .3) * .6 + .4, roofAt = (x, y) => !F.outdoor || F.room[Math.floor(y) * F.w + Math.floor(x)]?.roof || F.grid[Math.floor(y)]?.[Math.floor(x)] === undefined;
  const wrap = (a, c, B) => c + ((((a - c + B / 2) % B) + B) % B) - B / 2;
  // mưa: những vệt nước xiên theo gió
  if (cfg.rain && F.outdoor && T.r_rain) {
    const L = LAYER.get(T.r_rain); if (!WX.drops.length) for (let i = 0; i < 260; i++) WX.drops.push({ x: Math.random() * 6, y: Math.random() * 3.2, z: Math.random() * 6 });
    for (const p of WX.drops) {
      p.y -= d * 7.5; p.x += d * wind * 1.2; if (p.y < 0) { p.y += 3.2; p.x = eye[0] + (Math.random() - .5) * 6; p.z = eye[2] + (Math.random() - .5) * 6; }
      const x = wrap(p.x, eye[0], 6), z = wrap(p.z, eye[2], 6), y = p.y; if (roofAt(x, z)) continue;
      const w = .004, h = .16, sx = wind * .03;
      quad(v, [[x - rx * w + sx, y + h, z - rz * w, 0, 0], [x + rx * w + sx, y + h, z + rz * w, 1, 0], [x + rx * w, y, z + rz * w, 1, 1], [x - rx * w, y, z - rz * w, 0, 1]], nrm, L);
    }
  }
  // lá khô rơi chao nghiêng
  if (cfg.leaves && F.outdoor && T.r_leafP) {
    const L = LAYER.get(T.r_leafP); if (!WX.leaves.length) for (let i = 0; i < 45; i++) WX.leaves.push({ x: Math.random() * 8, y: Math.random() * 4, z: Math.random() * 8, ph: Math.random() * 6, s: .03 + Math.random() * .025 });
    for (const p of WX.leaves) {
      p.ph += d * 2.2; p.y -= d * (.35 + Math.sin(p.ph) * .15); p.x += d * (wind * .5 + Math.sin(p.ph * .7) * .4); p.z += d * Math.cos(p.ph * .9) * .3;
      if (p.y < .01) { p.y = 3 + Math.random() * 2; p.x = eye[0] + (Math.random() - .5) * 8; p.z = eye[2] + (Math.random() - .5) * 8; }
      const x = wrap(p.x, eye[0], 8), z = wrap(p.z, eye[2], 8), y = p.y, s = p.s, ca = Math.cos(p.ph), sa = Math.sin(p.ph) * .6;
      quad(v, [[x - s * ca, y + s * sa, z - s * .4, 0, 0], [x + s * ca, y - s * sa, z - s * .4, 1, 0], [x + s * ca, y - s * sa + s * .2, z + s * .6, 1, 1], [x - s * ca, y + s * sa + s * .2, z + s * .6, 0, 1]], [0, 1, 0], L);
    }
  }
  // sương mù bò sát mặt đất, trôi chậm
  if ((cfg.mist && F.outdoor) || F.id === "c3" || F.id === "b1") if (T.r_mist) {
    const L = LAYER.get(T.r_mist); if (!WX.mist.length) for (let i = 0; i < 16; i++) WX.mist.push({ x: Math.random() * 12, z: Math.random() * 12, s: .7 + Math.random() * .9, ph: Math.random() * 6 });
    for (const p of WX.mist) {
      p.ph += d * .15; p.x += d * (.12 + wind * .1); const x = wrap(p.x, eye[0], 12), z = wrap(p.z + Math.sin(p.ph) * .5, eye[2], 12), dd = Math.hypot(x - eye[0], z - eye[2]); if (dd < .6) continue;
      if (F.grid[Math.floor(z)]?.[Math.floor(x)] !== ".") continue; const s = p.s, y = .12 + Math.sin(p.ph * 2) * .04;
      quad(v, [[x - rx * s, y + s * .35, z - rz * s, 0, 0], [x + rx * s, y + s * .35, z + rz * s, 1, 0], [x + rx * s, 0, z + rz * s, 1, 1], [x - rx * s, 0, z - rz * s, 0, 1]], nrm, L);
    }
  }
  // thiêu thân bay loạn quanh bóng đèn, ngọn đuốc
  if (T.r_moth) { const L = LAYER.get(T.r_moth); let n = 0;
    for (const l of F.lights || []) { if (n > 6 || Math.abs(l.x - eye[0]) + Math.abs(l.y - eye[2]) > 7 || (l.power && !S.power)) continue; n++;
      for (let i = 0; i < 3; i++) { const ph = t * (3 + i) + i * 2.1 + l.x * 3, r = .12 + .08 * Math.sin(ph * 1.7), x = l.x + Math.cos(ph) * r, z = l.y + Math.sin(ph * 1.3) * r, y = (l.h || 1) - .05 + Math.sin(ph * 2.3) * .08, s = .012, fl = Math.sin(t * 60 + i) * s;
        quad(v, [[x - rx * s, y + fl, z - rz * s, 0, 0], [x + rx * s, y + fl, z + rz * s, 1, 0], [x + rx * s, y - s, z + rz * s, 1, 1], [x - rx * s, y - s, z - rz * s, 0, 1]], nrm, L); } } }
}

// ---------- 3. CHUỘT CHẠY LẮT XẮT ----------
const RATS = [];
function setupRats() {
  RATS.length = 0; const n = { house: 8, castle: 10, factory: 10, cemetery: 0, forest: 0, hospital: 14 }[MAPID] || 0; if (!n) return;
  for (const f of Object.values(FLOORS)) { if (f.outdoor) continue; for (let i = 0; i < Math.ceil(n * (f.w * f.h) / 2000); i++) {
    for (let k = 0; k < 40; k++) { const x = 1 + Math.floor(Math.random() * (f.w - 2)), y = 1 + Math.floor(Math.random() * (f.h - 2)); if (f.grid[y][x] !== "." || ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => f.grid[y + dy][x + dx] === "#")) continue;
      RATS.push({ f: f.id, x: x + .5, y: y + .5, a: Math.random() * 6.28, st: "idle", t: Math.random() * 3, sp: 0 }); break; } } }
}
function ratTick(dt) {
  if (!S.started || S.paused) return;
  for (const r of RATS) {
    if (r.f !== F.id) continue; const d = Math.hypot(r.x - P1.x, r.y - P1.y); if (d > 18) continue; r.t -= dt;
    if (d < 2.3 && r.st !== "flee") { r.st = "flee"; r.t = 1.5 + Math.random(); r.a = Math.atan2(r.y - P1.y, r.x - P1.x) + (Math.random() - .5) * .8; if (d < 8) for (let i = 0; i < 3; i++) tone(3800 + Math.random() * 1500, i * .07, .04, .04 * (1 - d / 8), "sine"); }
    if (r.t <= 0) { if (r.st === "flee" || Math.random() < .5) { r.st = "idle"; r.t = 1 + Math.random() * 4; } else { r.st = "walk"; r.t = .6 + Math.random() * 1.6; r.a += (Math.random() - .5) * 2.5; } }
    const sp = r.st === "flee" ? 2.6 : r.st === "walk" ? .5 : 0; r.sp += (sp - r.sp) * Math.min(1, dt * 8);
    if (r.sp > .01) { const nx = r.x + Math.cos(r.a) * r.sp * dt, ny = r.y + Math.sin(r.a) * r.sp * dt; if (F.grid[Math.floor(ny)]?.[Math.floor(nx)] === "." && canStand(nx, ny)) { r.x = nx; r.y = ny; } else r.a += 1.6 + Math.random(); }
  }
}
function drawRats(v) {
  for (const r of RATS) {
    if (r.f !== F.id || Math.abs(r.x - player.x) + Math.abs(r.y - player.y) > 12) continue; const ff = facing(r.a), X = XF(r.x, 0, r.y, ff.c, ff.s, M), run = r.sp > .3, bob = run ? Math.abs(Math.sin(t * 30)) * .02 : 0, sniff = r.st === "idle" ? Math.sin(t * 14) * .01 : 0;
    psphere(v, XSp(X, 0, .05 + bob, 0, .75, .65, 1.35), 0, .05 + bob, 0, .065, 7, T.batFur || T.dark);
    psphere(v, XSp(X, 0, .055 + bob, .09, .75, .8, 1.25), 0, .055 + bob, .09 + sniff, .035, 6, T.batFur || T.dark);
    for (const sx of [-1, 1]) psphere(v, X, sx * .022, .085 + bob, .085, .014, 4, T.skin || T.batFur || T.dark);
    { const Q = XL(X, 0, .04, -.08, -.15 + Math.sin(t * (run ? 16 : 3)) * .2, Math.sin(t * (run ? 20 : 2)) * .5); pcyl(v, XL(Q, 0, .04, -.08, -1.35, 0), 0, -.08, .04, .2, .008, .003, 4, T.skin || T.dark, null); }
  }
}

// ---------- 4. VẬT LIỆU ----------
function buildV18Textures() {
  if (T.r_rain) return;
  T.r_rain = tex(g => { R(g, 56, 0, 16, 128, "#8a96a4"); R(g, 60, 0, 8, 128, "#b4c0cc"); });
  T.r_leafP = tex(g => { g.fillStyle = "#4a3418"; g.beginPath(); g.moveTo(64, 6); g.quadraticCurveTo(120, 50, 64, 122); g.quadraticCurveTo(8, 50, 64, 6); g.fill(); g.strokeStyle = "#2a1c0c"; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 10); g.lineTo(64, 120); g.stroke(); });
  T.r_mist = tex(g => { const W = g.canvas.width; for (let i = 0; i < 9; i++) E(g, 20 + rnd() * 88, 40 + rnd() * 70, 26 + rnd() * 20, 14 + rnd() * 16, "#8a9094"); const id = g.getImageData(0, 0, W, W); for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4, r = Math.hypot((x - W / 2) / (W / 2), (y - W * .62) / (W * .4)); if (rnd() < .72 + r * .3) id.data[k + 3] = 0; } g.putImageData(id, 0, 0); });
  T.r_moth = texE(g => { E(g, 64, 64, 50, 34, "#c8bca0"); }, g => E(g, 64, 64, 50, 34, "#4a4030"));
}
