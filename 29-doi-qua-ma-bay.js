// =====================================================================
//  28. BẢN 15: dơi & quạ · ma bay lả lướt, chập chờn ẩn hiện · cảnh báo 16+
//      cốt truyện sâu hơn (vì sao họ chết) · đặt tên cho mọi khu vực
// =====================================================================

// ---------- 1. CẢNH BÁO TRƯỚC KHI VÀO GAME ----------
function showWarning() {
  if (/nowarn/.test(location.search) || $("warnScr")) return;
  const st = document.createElement("style"); st.textContent = `
#warnScr{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#1a0204 0%,#060001 70%,#000 100%);color:#d8cfc4;font-family:inherit;transition:opacity .9s;cursor:pointer}
#warnScr.out{opacity:0;pointer-events:none}
#warnScr .wb{max-width:640px;width:88vw;padding:34px 38px;border:1px solid rgba(160,20,20,.55);box-shadow:0 0 60px rgba(120,0,0,.35),inset 0 0 40px rgba(60,0,0,.5);background:rgba(10,0,0,.72);text-align:center}
#warnScr .wt{font-family:var(--hfont,inherit);font-size:clamp(34px,6vw,58px);color:#c21010;letter-spacing:.08em;text-shadow:0 0 18px rgba(255,0,0,.45),2px 2px 0 #000;animation:warnPulse 1.6s ease-in-out infinite}
#warnScr .age{display:inline-block;margin:10px 0 16px;padding:4px 16px;border:2px solid #c21010;color:#fff;font-weight:700;font-size:20px;letter-spacing:.1em;background:rgba(150,0,0,.35)}
#warnScr ul{text-align:left;margin:0 auto 18px;padding-left:22px;line-height:1.7;font-size:15px;max-width:520px}
#warnScr li b{color:#e8b0a0}
#warnScr .rec{display:flex;gap:18px;justify-content:center;margin:6px 0 20px;font-size:14px;color:#c8b8a8}
#warnScr .rec div{flex:1;max-width:220px;padding:10px;border:1px solid rgba(200,160,140,.2);background:rgba(255,255,255,.03)}
#warnScr .rec span{display:block;font-size:26px;margin-bottom:4px}
#warnScr button{font:inherit;font-size:16px;letter-spacing:.12em;padding:12px 30px;background:#5a0606;color:#fff;border:1px solid #c21010;cursor:pointer;box-shadow:0 0 20px rgba(200,0,0,.35)}
#warnScr button:hover{background:#7a0a0a}
#warnScr .sm{margin-top:12px;font-size:12px;color:#8a7a70}
@keyframes warnPulse{0%,100%{opacity:1}50%{opacity:.72}}`;
  document.head.appendChild(st);
  const el = document.createElement("div"); el.id = "warnScr";
  el.innerHTML = `<div class="wb"><div class="wt">⚠ CẢNH BÁO</div><div class="age">GAME KINH DỊ · 16+</div>
<ul><li>Trò chơi có <b>hình ảnh ghê rợn, máu me</b> và <b>những cú hù bất ngờ</b> (jumpscare) với âm thanh lớn.</li>
<li>Có <b>ánh sáng nhấp nháy</b> và hình ảnh chớp nhanh — người có tiền sử <b>động kinh</b> hoặc nhạy cảm với ánh sáng không nên chơi.</li>
<li>Không phù hợp với người dưới 16 tuổi, phụ nữ mang thai, người có bệnh tim hoặc dễ hoảng sợ.</li></ul>
<div class="rec"><div><span>🌑</span>Chơi trong <b>không gian tối</b></div><div><span>🎧</span><b>Đeo tai nghe</b> để nghe rõ tiếng động từ mọi phía</div></div>
<button id="warnOk">TÔI ĐÃ HIỂU — TIẾP TỤC</button><div class="sm">Bấm bất kỳ đâu hoặc phím Enter để tiếp tục</div></div>`;
  document.body.appendChild(el);
  const go = e => { e?.preventDefault?.(); e?.stopPropagation?.(); removeEventListener("keydown", kd, true); try { ensureAudio(); if (!S.started && !Music.cfg) Music.start("menu"); } catch (err) {} el.classList.add("out"); setTimeout(() => el.remove(), 950); };
  const kd = e => { if (["Enter", "Space", "NumpadEnter", "Escape"].includes(e.code)) go(e); };
  el.addEventListener("click", go); addEventListener("keydown", kd, true);
}

// ---------- 2. DƠI & QUẠ ----------
const CRIT = [];
const CRIT_CFG = { house: { bat: 10 }, forest: { crow: 16, sky: 5 }, castle: { bat: 18 }, cemetery: { crow: 14, bat: 6, sky: 4 }, factory: { bat: 12 } };
function setupCritters() {
  CRIT.length = 0; const cfg = CRIT_CFG[MAPID] || {};
  for (const f of Object.values(FLOORS)) {
    const cells = []; for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) if (f.grid[y][x] === ".") cells.push([x, y]);
    const pick = ok => { for (let i = 0; i < 60; i++) { const c = cells[Math.floor(Math.random() * cells.length)]; if (c && ok(c[0], c[1])) return c; } return null; };
    const share = Object.keys(FLOORS).length > 1 ? (f.id === Object.keys(FLOORS)[0] ? .6 : .25) : 1;
    // dơi treo ngược dưới trần, thành từng đàn 3–5 con
    for (let n = Math.round((cfg.bat || 0) * share); n > 0;) {
      const c = pick((x, y) => { const r = f.room[y * f.w + x]; return r && (r.h ?? WH) >= 1.6 && !(f.outdoor && !r.roof); }); if (!c) break;
      const k = Math.min(n, 3 + Math.floor(Math.random() * 3)); n -= k; const h = f.room[c[1] * f.w + c[0]].h ?? WH;
      for (let i = 0; i < k; i++) CRIT.push({ kind: "bat", f: f.id, x: c[0] + .2 + Math.random() * .6, y: c[1] + .2 + Math.random() * .6, z: h - .04, hz: h - .04, home: [c[0] + .5, c[1] + .5], st: "roost", ph: Math.random() * 6, a: Math.random() * 6.28, cd: 0 });
    }
    // quạ đậu dưới đất / trên bia mộ, gốc cây
    if (f.outdoor) for (let i = 0; i < (cfg.crow || 0); i++) {
      const c = pick((x, y) => !f.room[y * f.w + x] && !(f.path && f.path.has(y * f.w + x))); if (!c) break;
      const perch = f.sprites.find(s => (s.k === "tomb" || s.k === "stump" || s.k === "cross" || s.k === "log") && Math.hypot(s.x - c[0] - .5, s.y - c[1] - .5) < 1.6);
      const p = perch && Math.random() < .6 ? { x: perch.x, y: perch.y, z: perch.k === "cross" ? .62 : perch.k === "tomb" ? .42 : .25 } : { x: c[0] + Math.random(), y: c[1] + Math.random(), z: 0 };
      CRIT.push({ kind: "crow", f: f.id, x: p.x, y: p.y, z: p.z, gz: p.z, st: "perch", ph: Math.random() * 6, a: Math.random() * 6.28, cd: 2 + Math.random() * 10, peck: 0 });
    }
    // quạ lượn vòng trên trời
    if (f.outdoor) for (let i = 0; i < (cfg.sky || 0); i++) { const c = pick(() => true); if (c) CRIT.push({ kind: "crow", f: f.id, x: c[0], y: c[1], z: 5 + Math.random() * 3, st: "circle", cx: c[0], cy: c[1], R: 3 + Math.random() * 4, ph: Math.random() * 6.28, w: (.25 + Math.random() * .2) * (Math.random() < .5 ? 1 : -1), a: 0, cd: 5 + Math.random() * 10 }); }
  }
}
function caw(vol, pan = 0) {
  if (!ac) return; const n = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) { const d = i * (.32 + Math.random() * .1); tone(560 + Math.random() * 80, d, .18, vol * .5, "sawtooth"); noise(.18, 1300 + Math.random() * 300, vol * .8, 4, d); tone(430, d + .05, .12, vol * .3, "square"); }
}
function squeak(vol) { if (!ac) return; for (let i = 0; i < 4 + Math.floor(Math.random() * 5); i++) tone(4200 + Math.random() * 2600, i * (.05 + Math.random() * .08), .035, vol, "sine"); }
function flapSnd(vol) { if (!ac) return; for (let i = 0; i < 5; i++) noise(.06, 500 + Math.random() * 300, vol, 1.5, i * .09); }
function critTick(dt) {
  if (!S.started || S.paused) return;
  const lit = flashOn(), { fw } = camBasis();
  for (const c of CRIT) {
    if (c.f !== F.id) continue; c.ph += dt; const d = Math.hypot(c.x - P1.x, c.y - P1.y);
    if (d > 26 && c.st !== "circle") continue;
    if (c.kind === "bat") {
      if (c.st === "roost") {
        c.z = c.hz; const toBat = [c.x - P1.x, c.z - EYE, c.y - P1.y], tl = Math.hypot(...toBat) || 1, inBeam = lit && (toBat[0] * fw[0] + toBat[1] * fw[1] + toBat[2] * fw[2]) / tl > .93 && tl < 4.5;
        if (d < 2 || inBeam || (P1.running && d < 4.5)) { for (const o of CRIT) if (o.kind === "bat" && o.f === c.f && o.st === "roost" && Math.hypot(o.x - c.x, o.y - c.y) < 4) { o.st = "fly"; o.t = 0; o.dur = 3 + Math.random() * 4; o.tx = P1.x; o.ty = P1.y; o.a = Math.random() * 6.28; o.sp = 2.2 + Math.random() * 1.2; } squeak(.06); flapSnd(.08); }
      } else {
        c.t += dt; const toward = c.t < 1.3, tx = toward ? P1.x + Math.sin(c.ph * 3) * .6 : c.home[0] + Math.sin(c.ph) * 4, ty = toward ? P1.y + Math.cos(c.ph * 2.6) * .6 : c.home[1] + Math.cos(c.ph * 1.3) * 4;
        const want = Math.atan2(ty - c.y, tx - c.x) + Math.sin(c.ph * 7 + c.x) * .9; c.a += angTo(c.a, want) * Math.min(1, dt * 5);
        const nx = c.x + Math.cos(c.a) * c.sp * dt, ny = c.y + Math.sin(c.a) * c.sp * dt; if (F.grid[Math.floor(ny)]?.[Math.floor(nx)] === ".") { c.x = nx; c.y = ny; } else c.a += 2;
        const rh = F.room[Math.floor(c.y) * F.w + Math.floor(c.x)]?.h ?? WH; c.z = Math.max(.35, Math.min(rh - .1, (toward ? EYE + .15 : rh * .7) + Math.sin(c.ph * 5) * .2));
        if (Math.random() < dt * 1.5) squeak(.03 * Math.max(0, 1 - d / 8));
        if (c.t > c.dur) { const rr2 = F.room[Math.floor(c.y) * F.w + Math.floor(c.x)]; if (rr2 && (rr2.h ?? WH) >= 1.4 && !(F.outdoor && !rr2.roof)) { c.st = "roost"; c.hz = (rr2.h ?? WH) - .04; c.home = [c.x, c.y]; } else c.dur += 1; }
      }
    } else {
      if (c.st === "circle") { c.ph += dt * c.w; c.x = c.cx + Math.cos(c.ph) * c.R; c.y = c.cy + Math.sin(c.ph) * c.R; c.a = c.ph + Math.sign(c.w) * Math.PI / 2; if ((c.cd -= dt) < 0) { c.cd = 8 + Math.random() * 14; if (d < 20) caw(.05); } continue; }
      if (c.st === "perch") {
        c.z = c.gz; if ((c.cd -= dt) < 0) { c.cd = 2 + Math.random() * 6; const r = Math.random(); if (r < .4) c.peck = .5; else if (r < .7) c.a += (Math.random() - .5) * 2; else if (d < 12) caw(.07 * Math.max(.2, 1 - d / 12)); }
        if (c.peck > 0) c.peck -= dt;
        if (d < 2.4 || (P1.running && d < 5)) { c.st = "flee"; c.t = 0; c.a = Math.atan2(c.y - P1.y, c.x - P1.x) + (Math.random() - .5) * .8; c.vz = 2 + Math.random(); caw(.12); flapSnd(.1); for (const o of CRIT) if (o !== c && o.kind === "crow" && o.st === "perch" && Math.hypot(o.x - c.x, o.y - c.y) < 3) { o.st = "flee"; o.t = -Math.random() * .4; o.a = Math.atan2(o.y - P1.y, o.x - P1.x) + (Math.random() - .5); o.vz = 1.8 + Math.random(); } }
      } else if (c.st === "flee") {
        c.t += dt; if (c.t < 0) continue; c.x += Math.cos(c.a) * 3 * dt; c.y += Math.sin(c.a) * 3 * dt; c.z += c.vz * dt; c.vz = Math.max(.4, c.vz - dt * .6); c.a += Math.sin(c.ph * 2) * dt * .5;
        if (c.t > 6) { for (let k = 0; k < 20; k++) { const x = c.x + (Math.random() - .5) * 18, y = c.y + (Math.random() - .5) * 18; if (F.grid[Math.floor(y)]?.[Math.floor(x)] === "." && !F.room[Math.floor(y) * F.w + Math.floor(x)] && Math.hypot(x - P1.x, y - P1.y) > 8) { Object.assign(c, { st: "land", tx: x, ty: y, t: 0 }); break; } } }
      } else if (c.st === "land") {
        const dx = c.tx - c.x, dy = c.ty - c.y, l = Math.hypot(dx, dy); c.a = Math.atan2(dy, dx);
        if (l > .1) { c.x += dx / l * Math.min(l, 3 * dt); c.y += dy / l * Math.min(l, 3 * dt); c.z = Math.max(0, c.z - dt * Math.max(.6, c.z / Math.max(.3, l / 3))); } else { c.z = Math.max(0, c.z - dt * 1.5); if (c.z <= 0) { c.st = "perch"; c.gz = 0; c.cd = 3; } }
      }
    }
  }
}
function drawCritters(v) {
  const flyM = T.batWing || T.dark;
  for (const c of CRIT) {
    if (c.f !== F.id || Math.hypot(c.x - player.x, c.y - player.y) > 22) continue;
    const ff = facing(c.a), X = XF(c.x, c.z, c.y, ff.c, ff.s, M);
    if (c.kind === "bat") {
      if (c.st === "roost") { const Q = XL(X, 0, 0, 0, Math.sin(c.ph * 1.3) * .08, 0); pcyl(v, Q, 0, 0, -.13, -.02, .035, .045, 6, T.batFur || T.dark, T.batFur || T.dark); psphere(v, Q, 0, -.16, 0, .032, 6, T.batFur || T.dark); for (const sx of [-1, 1]) pbox(v, Q, sx * .03, -.13, -.005, sx * .055, -.03, .005, flyM); pcyl(v, Q, 0, 0, -.02, 0, .006, .006, 4, T.dark, T.dark); continue; }
      const fl = Math.sin(c.ph * 28) * .9;
      psphere(v, XSp(X, 0, 0, 0, .8, .8, 1.3), 0, 0, 0, .04, 6, T.batFur || T.dark); psphere(v, X, 0, .01, .055, .026, 6, T.batFur || T.dark);
      for (const sx of [-1, 1]) { pcyl(v, X, sx * .015, .06, .025, .055, .008, 0, 4, T.batFur || T.dark, null); const W = XL(X, 0, 0, 0, 0, sx * fl); const L = flyM ? LAYER.get(flyM) : 0; quad(v, [[0, 0, .04], [sx * .3, .02, -.02], [sx * .26, -.01, -.12], [0, 0, -.06]].map((p, i) => { const q = W.p(p[0], p[1], p[2]); return [q[0], q[1], q[2], i === 0 || i === 3 ? (sx < 0 ? 1 : 0) : (sx < 0 ? 0 : 1), i < 2 ? 0 : 1]; }), [0, 1, 0], L); }
    } else {
      const flying = c.st !== "perch", fl = flying ? Math.sin(c.ph * (c.st === "circle" ? 6 : 16)) * (c.st === "circle" ? .35 : .9) : 0, peck = c.st === "perch" && c.peck > 0 ? Math.abs(Math.sin(c.peck * 18)) * .5 : 0, CR = T.crowT || T.dark;
      const by = flying ? 0 : .13, tilt = flying ? 0 : -.35;
      if (!flying) for (const sx of [-1, 1]) { pcyl(v, X, sx * .025, -.01, 0, by - .02, .006, .005, 4, T.dark, T.dark); pbox(v, X, sx * .025 - .012, 0, -.01, sx * .025 + .012, .004, .04, T.dark); }
      const Bd = XL(X, 0, by, 0, tilt, 0);
      psphere(v, XSp(Bd, 0, by, .02, .85, .8, 1.25), 0, by, .02, .07, 9, CR); psphere(v, XSp(Bd, 0, by - .01, -.07, .7, .65, 1.2), 0, by - .01, -.07, .055, 8, CR);
      const hy = by + (flying ? .02 : .085) - peck * .12, hz = (flying ? .14 : .1) + peck * .05;
      psphere(v, X, 0, hy, hz, .042, 8, CR);
      { const Q = XL(X, 0, hy - .005, hz + .03, Math.PI / 2 + peck * .6, 0); pcyl(v, Q, 0, hz + .03, hy - .005, hy + .065, .017, .002, 6, T.dark, T.dark); }
      for (const sx of [-1, 1]) psphere(v, X, sx * .028, hy + .012, hz + .022, .007, 5, T.glassB || T.dark);
      const LW = LAYER.get(T.crowWing || CR), wingQ = (Q, pts, flip) => quad(v, pts.map((p, i) => { const q = Q.p(p[0], p[1], p[2]); return [q[0], q[1], q[2], flip ? 1 - p[3] : p[3], p[4]]; }), [0, 1, 0], LW);
      { const Q = XL(Bd, 0, by, -.1, flying ? 0 : .25, 0); wingQ(Q, [[-.07, by + .01, -.1, 0, 0], [.07, by + .01, -.1, 1, 0], [.09, by + .01, -.3, 1, 1], [-.09, by + .01, -.3, 0, 1]]); }
      if (flying) for (const sx of [-1, 1]) { const W = XL(X, 0, .03, 0, 0, sx * fl); wingQ(W, [[sx * .03, .03, .07, 0, 0], [sx * .42, .03, .04, 1, 0], [sx * .4, .03, -.1, 1, 1], [sx * .03, .03, -.08, 0, 1]], sx < 0); }
      else for (const sx of [-1, 1]) psphere(v, XSp(Bd, sx * .055, by + .01, -.03, .3, .7, 1.6), sx * .055, by + .01, -.03, .06, 7, CR);
    }
  }
}
function buildV15Textures() {
  if (T.crowT) return;
  T.crowT = tex(g => { R(g, 0, 0, 128, 128, "#0a0b0e"); for (let i = 0; i < 260; i++) E(g, rnd() * 128, rnd() * 128, 3, 1.5, "rgba(50,58,80,.25)"); });
  T.crowWing = tex(g => { g.fillStyle = "#0c0d10"; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 0); for (let i = 0; i < 7; i++) { const y = 18 + i * 15; g.lineTo(128 - i * 4, y - 8); g.lineTo(108 - i * 6, y); } g.lineTo(0, 128); g.fill(); g.strokeStyle = "rgba(70,80,105,.5)"; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(10, 10 + i * 15); g.lineTo(110 - i * 6, 14 + i * 15); g.stroke(); } });
  T.batFur = tex(g => { R(g, 0, 0, 128, 128, "#1a120e"); for (let i = 0; i < 500; i++) R(g, rnd() * 128, rnd() * 128, 1, 3, "rgba(70,50,36,.5)"); });
  T.batWing = tex(g => { g.fillStyle = "#16100e"; g.beginPath(); g.moveTo(0, 0); g.lineTo(128, 6); g.quadraticCurveTo(110, 40, 128, 70); g.quadraticCurveTo(96, 80, 104, 128); g.quadraticCurveTo(60, 100, 40, 128); g.quadraticCurveTo(20, 90, 0, 128); g.fill(); g.strokeStyle = "#2e221c"; g.lineWidth = 2; for (const [x, y] of [[128, 70], [104, 128], [40, 128]]) { g.beginPath(); g.moveTo(0, 2); g.lineTo(x, y); g.stroke(); } });
  T.r_smoke = tex(g => { for (let i = 0; i < 12; i++) E(g, 40 + rnd() * 48, 30 + rnd() * 68, 14 + rnd() * 16, 10 + rnd() * 18, "#0a0a0c"); });
}

// ---------- 3. MA BAY LẢ LƯỚT, LÚC ẨN LÚC HIỆN ----------
function ghostDraw(v, g) {
  if (g.rise != null && g.rise < 1) return MD.model(v, g);
  const d = Math.hypot(g.x - player.x, g.y - player.y), near = d < 6 || g.scare;
  const fx = g.fx || (g.fx = { next: t + 1 + Math.random() * 3, hide: 0, glitch: 0 });
  if (!g.scare && t > fx.next) { fx.hide = t + (near ? .05 + Math.random() * .14 : .3 + Math.random() * 1.2); fx.next = fx.hide + (near ? .7 + Math.random() * 1.8 : 1.5 + Math.random() * 3.5); fx.glitch = fx.hide + .14; }
  if (!g.scare && t < fx.hide) return;   // biến mất trong thoáng chốc
  const ph = g.ph; g.ph = Math.PI;       // không bước chân: bay lơ lửng
  const tmp = []; MD.model(tmp, g); g.ph = ph;
  const hover = MAPID === "cemetery" ? 0 : .1 + Math.sin(t * 1.5 + g.x * 2) * .045, lk = Math.atan2(player.y - g.y, player.x - g.x), weave = Math.sin(t * 1.1 + g.y) * .07;
  const ox = -Math.sin(lk) * weave, oz = Math.cos(lk) * weave;
  let top = 0; for (let i = 1; i < tmp.length; i += 9) top = Math.max(top, tmp[i]);
  const H = Math.max(.3, top - (g.yo || 0)), amp = g.scare ? .004 : .014;
  for (let i = 0; i < tmp.length; i += 9) {   // thân hình gợn sóng như khói, phần dưới bay phất phơ mạnh hơn
    const y = tmp[i + 1], low = 1 - Math.max(0, Math.min(1, (y - (g.yo || 0)) / H)), a = amp * (.4 + low * 1.6);
    tmp[i] += ox + Math.sin(y * 16 + t * 6 + g.y) * a; tmp[i + 2] += oz + Math.cos(y * 13 + t * 5 + g.x) * a; tmp[i + 1] += hover;
  }
  for (let i = 0; i < tmp.length; i++) v.push(tmp[i]);
  if (t < fx.glitch && !g.scare) {   // vừa hiện lại: bóng nhân đôi lệch sang một bên
    const sh = (Math.random() < .5 ? -1 : 1) * (.05 + Math.random() * .05), sx = -Math.sin(lk) * sh, sz = Math.cos(lk) * sh;
    for (let i = 0; i < tmp.length; i += 9) v.push(tmp[i] + sx, tmp[i + 1] + (Math.random() - .5) * .01, tmp[i + 2] + sz, tmp[i + 3], tmp[i + 4], tmp[i + 5], tmp[i + 6], tmp[i + 7], tmp[i + 8]);
  }
  // làn khói đen tỏa ra quanh chân, bay ngược lên rồi tan
  if (T.r_smoke) { const L = LAYER.get(T.r_smoke), { fw } = camBasis(), rl = Math.hypot(fw[0], fw[2]) || 1, rx = -fw[2] / rl, rz = fw[0] / rl;
    for (let k = 0; k < 6; k++) { const ph2 = (t * .5 + k / 6 + h32(k, g.x * 5 | 0)) % 1, s = (.05 + ph2 * .08) * (1 - ph2 * .6), a = k * 1.05 + t * .3, cx = g.x + Math.cos(a) * .12 + ox, cz = g.y + Math.sin(a) * .12 + oz, cy = (g.yo || 0) + hover + ph2 * H * .55;
      quad(v, [[cx - rx * s, cy + s, cz - rz * s, 0, 0], [cx + rx * s, cy + s, cz + rz * s, 1, 0], [cx + rx * s, cy - s, cz + rz * s, 1, 1], [cx - rx * s, cy - s, cz - rz * s, 0, 1]], [-fw[0], -fw[1], -fw[2]], L); } }
}

// ---------- 4. TÊN CHO MỌI KHU VỰC ----------
const AREA_NAMES = {
  house: { kitchen: ["Bếp phụ", "Phòng giặt ủi"], bath: ["Phòng tắm nhỏ", "Nhà vệ sinh cũ"], hall: ["Sảnh phụ", "Phòng tiếp khách"], kid: ["Phòng của Hằng", "Phòng trẻ em cũ"], bed: ["Phòng ngủ khách", "Phòng bà nội", "Phòng người làm"], library: ["Phòng đọc sách", "Phòng làm việc của bố"], living: ["Phòng khách nhỏ", "Phòng sinh hoạt"], play: ["Phòng đồ chơi", "Phòng học"], store: ["Phòng chứa đồ", "Kho đồ cũ", "Phòng dụng cụ"], corr: ["Hành lang sau", "Lối đi hẹp", "Hành lang tối"] },
  factory: { hall: ["Xưởng lắp ráp", "Xưởng nhuộm vải", "Kho thành phẩm", "Xưởng cắt may"], workshop: ["Phòng sửa chữa", "Kho vật tư", "Phòng nồi hơi", "Phòng điện"], office: ["Phòng kế toán", "Phòng nhân sự"], canteen: ["Nhà ăn công nhân", "Phòng nghỉ ca"], corr: ["Hành lang kho", "Lối thoát hiểm", "Hành lang sau"] },
  castle: { greathall: ["Phòng yến tiệc", "Sảnh khiêu vũ", "Phòng tranh gia tộc"], keep: ["Ngục tối", "Kho rượu", "Phòng lính gác", "Phòng giặt máu"], study: ["Phòng làm việc của Bá Tước", "Phòng ngủ của Nữ Bá Tước", "Phòng của thầy giả kim"], throne: ["Phòng thiết triều"], gallery: ["Hành lang chân dung", "Hành lang hầu gái"], crypt: ["Hầm chôn hầu gái", "Hầm quan tài"] },
  cemetery: { chapel: ["Nhà nguyện nhỏ", "Nhà quàn"] }, forest: { cabin: ["Chòi thợ săn", "Lán gỗ"] },
};
function nameAreas(f) {
  const W = f.w, N = W * f.h, area = new Int32Array(N).fill(-1), names = [], used = {};
  f.areaOf = area; f.areaNames = names;
  if (f.outdoor && !f.room.some(r => r && r.roof)) return;
  const sig = r => r ? `${LAYER.get(firstOf(r.floor)) ?? 0}|${LAYER.get(firstOf(r.wall)) ?? 0}|${r.h ?? 0}` : "";
  for (let i = 0; i < N; i++) {
    const x0 = i % W, y0 = (i - x0) / W; if (area[i] >= 0 || f.grid[y0][x0] !== "." || !f.room[i] || (f.outdoor && !f.room[i].roof)) continue;
    const id = names.length, s0 = sig(f.room[i]), st = [i], cells = []; area[i] = id;
    while (st.length) { const c = st.pop(), cx = c % W, cy = (c - cx) / W; cells.push(c); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, j = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= f.h || area[j] >= 0 || f.grid[ny][nx] !== "." || sig(f.room[j]) !== s0) continue; area[j] = id; st.push(j); } }
    const inside = (f.labels || []).filter(([n, lx, ly]) => { const j = Math.floor(ly) * W + Math.floor(lx); return area[j] === id || cells.some(c => Math.hypot(c % W + .5 - lx, Math.floor(c / W) + .5 - ly) < 1.2); });
    if (inside.length) { names.push(inside); continue; }
    if (cells.length < 6) { names.push([]); continue; }
    let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9; for (const c of cells) { const cx = c % W, cy = Math.floor(c / W); bx0 = Math.min(bx0, cx); bx1 = Math.max(bx1, cx); by0 = Math.min(by0, cy); by1 = Math.max(by1, cy); }
    const thin = Math.min(bx1 - bx0, by1 - by0) <= 1 || cells.length / (Math.max(bx1 - bx0, by1 - by0) + 1) <= 2.7, rk = thin ? (MAPID === "castle" ? "gallery" : "corr") : roomKind(f, x0, y0), pool = AREA_NAMES[MAPID]?.[rk] || ["Căn phòng không tên"], k = used[rk] = (used[rk] ?? -1) + 1;
    let nm = pool[k % pool.length]; if (k >= pool.length) nm += " " + (Math.floor(k / pool.length) + 1);
    let mx = 0, my = 0; for (const c of cells) { mx += c % W + .5; my += Math.floor(c / W) + .5; } mx /= cells.length; my /= cells.length;
    let best = cells[0], bd = 1e9; for (const c of cells) { const dd = Math.hypot(c % W + .5 - mx, Math.floor(c / W) + .5 - my); if (dd < bd) { bd = dd; best = c; } }
    const L = [nm, best % W + .5, Math.floor(best / W) + .5]; (f.labels = f.labels || []).push(L); names.push([L]);
  }
}
function areaTick() {
  if (!S.started || S.paused || (S.areaT = (S.areaT || 0) - 1 / 30) > 0) return; S.areaT = .35;
  const f = F, cx = Math.floor(P1.x), cy = Math.floor(P1.y); let nm = null;
  const id = f.areaOf?.[cy * f.w + cx] ?? -1;
  if (id >= 0 && f.areaNames[id]?.length) { let bd = 1e9; for (const L of f.areaNames[id]) { const d = Math.hypot(L[1] - P1.x, L[2] - P1.y); if (d < bd) { bd = d; nm = L[0]; } } }
  else if (f.outdoor) { let bd = 7; for (const L of f.labels || []) { const d = Math.hypot(L[1] - P1.x, L[2] - P1.y); if (d < bd && L[0] !== "?") { bd = d; nm = L[0]; } } }
  if (!nm) return; const key = f.id + nm; if (key === S.areaNow) return; S.areaNow = key;
  let el = $("areaToast"); if (!el) { el = document.createElement("div"); el.id = "areaToast"; el.style.cssText = "position:fixed;left:50%;top:25%;transform:translateX(-50%);z-index:30;pointer-events:none;font-family:var(--hfont,inherit);font-size:clamp(20px,2.6vw,30px);letter-spacing:.12em;color:#d8c8b8;text-shadow:0 0 14px rgba(160,0,0,.7),2px 2px 0 #000;opacity:0;transition:opacity .8s;white-space:nowrap"; document.body.appendChild(el); }
  el.textContent = "— " + nm + " —"; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 2600);
}

// ---------- 5. CỐT TRUYỆN SÂU HƠN: vì sao họ chết ----------
Object.assign(STORY.house, {
  intro: ["Năm 1968, căn nhà số 13 thuộc về một gia đình khá giả. Bé Hằng, tám tuổi, là con riêng của người chồng — và là cái gai trong mắt người mẹ kế.",
    "Một buổi chiều, bà ta rủ Hằng chơi trốn tìm. Hằng chui vào chiếc tủ gỗ dưới tầng hầm. Bà ta cài then tủ lại — <i>“cho nó một bài học”</i> — rồi về quê dự đám cưới ba ngày.",
    "Khi bà ta trở về, mặt trong cánh tủ chi chít vết móng tay. Bà chôn Hằng dưới nền hầm, xây phòng thờ đè lên, rồi nói với mọi người rằng con bé đi lạc.",
    "50 năm sau, gia đình ông Thành dọn đến. Bé Linh, cũng tám tuổi, bắt đầu kể về <i>“một bạn sống trong tủ”</i>. Ba tháng sau, Linh biến mất.",
    "Bạn là thợ chụp ảnh nhà hoang. Đêm nay, bạn lẻn vào căn nhà số 13 để làm phóng sự. Cánh cửa đóng sập sau lưng. Ổ khóa điện tắt ngóm.",
    "Trên tường sảnh, ai đó vừa viết bằng máu, nét chữ còn ướt: <i>“Chơi trốn tìm với em nhé. Lần này đến lượt anh trốn.”</i>"],
  end: ["Con búp bê nằm yên trên bàn thờ. Ngọn nến tự bùng lên. Dưới nền hầm, tiếng cào cấu cuối cùng cũng ngừng.",
    "Sự thật nằm trong chiếc tủ gỗ: Linh đã nghe tiếng Hằng gọi, chui vào trốn — và cánh tủ chỉ mở được từ bên ngoài. Hai đứa trẻ chết cách nhau 50 năm, trong cùng một trò chơi chưa bao giờ kết thúc.",
    "Cánh cửa chính mở ra. Bạn bước ra con hẻm, nơi trời đã hửng sáng.",
    "Từ ô cửa sổ lầu một, hai bé gái mặc váy trắng nắm tay nhau vẫy chào bạn — rồi tan vào ánh bình minh. Cuối cùng, đã có người tìm thấy các em."],
  endBad: ["Cánh cửa chính mở ra. Bạn chạy một mạch ra đầu hẻm, không dám ngoái lại.", "Về đến nhà, bạn mở máy ảnh xem lại. Tấm nào cũng có một bé gái đứng ngay sau lưng bạn.",
    "Bạn chưa thắp nến trên bàn thờ. Trò trốn tìm vẫn chưa kết thúc — và giờ, đến lượt bạn đi tìm.", "Tấm cuối cùng được chụp khi bạn đã ra khỏi căn nhà. Bé đang nắm tay bạn."] });
Object.assign(STORY.forest, {
  intro: ["Năm 1979, kiểm lâm Sáu Cao một mình giữ khu rừng thông Đá Đen — nơi có ngôi miếu thờ thần rừng mà dân bản không ai dám chặt một cành cây.",
    "Một đêm, ông bắt gặp nhóm lâm tặc cưa cây thông cổ thụ bên miếu. Chúng trói ông, treo cổ ông lên chính thân cây ấy, rồi đốt trụi trạm kiểm lâm để phi tang.",
    "Ông chết với đôi mắt mở trừng. Từ đó, người đi rừng kể về một bóng người cao lêu nghêu, cổ dài bất thường, đứng im giữa những thân thông. Ai phá rừng thiêng, linh hồn sẽ bị nhốt vào một hình nhân rơm.",
    "Tháng 11 vừa rồi, ba người bạn của bạn — Minh, Hùng và Lan — vào rừng cắm trại. Để nhóm lửa trại, Hùng đã chặt cành cây thông già cạnh ngôi miếu.",
    "Một tuần sau, đội tìm kiếm chỉ thấy một chiếc lều rách và ba hình nhân rơm treo lủng lẳng trên cây.",
    "Bạn quyết định tự đi tìm. Gần nửa đêm, chiếc xe chết máy ở bìa rừng. Giữa những thân thông, có một bóng người cao, gầy, đứng im... nhìn bạn."],
  end: ["Hình nhân rơm cuối cùng cháy rụi. Gió rít qua rừng thông như tiếng thở phào của ba người bạn.",
    "Bạn hiểu ra: Kẻ Đứng Im không giết vì thù hận — ông vẫn đang làm công việc của một người gác rừng. Hùng chặt cây thiêng; Lan đi theo tiếng gọi của Hùng xuống giếng; Minh ở lại tìm bạn cho đến hơi thở cuối cùng.",
    "Bánh xe nghiến lên sỏi đá. Đèn pha quét qua những thân cây, nơi hàng chục bóng người cao gầy đứng im lặng nhìn theo.",
    "Trên ghế sau, chiếc ba lô của Minh nằm đó. Bạn không nhớ mình đã mang nó theo. Trong túi ba lô là một cành thông khô — bạn sẽ mang nó trả lại ngôi miếu, khi trời sáng."] });
Object.assign(STORY.castle, {
  intro: ["Năm 1861, Elizabeth về làm dâu gia tộc Vạn Lạc. 10 năm sau, một căn bệnh lạ khiến da bà nhăn nheo, nứt nẻ như sứ cũ. Bá Tước ruồng bỏ bà để đi tìm người đẹp hơn.",
    "Một thầy giả kim nói với bà rằng máu của thiếu nữ có thể trả lại tuổi xuân. Lần đầu tiên, một cô hầu gái làm vỡ chiếc gương trong phòng bà — và bà thấy vết nứt trên mặt mình mờ đi.",
    "Từ năm 1870 đến 1888, 40 cô hầu gái lần lượt biến mất. Xác họ bị giấu dưới hầm mộ. Người thợ rèn được thuê đúc cọc đồng thánh để trừ bà cũng bị giết.",
    "Đêm dân làng phá cổng, Elizabeth tự nhốt mình trong quan tài cùng chiếc gương phù thủy, tin rằng mình sẽ sống lại trẻ đẹp. Bà chết đói trong bóng tối — nhưng linh hồn bà bị trói vào tấm gương ấy.",
    "Bạn là nhà sử học, đến tìm cuốn biên niên sử của gia tộc. Vừa bước qua cổng, song sắt sập xuống sau lưng.",
    "Trong đại sảnh, ngọn nến trên giá vẫn còn ấm... như thể vừa có người thắp."],
  end: ["Chiếc chuông bạc ngân lên trong hầm mộ. Tiếng thét của Nữ Bá Tước xé toạc màn đêm, rồi lịm dần.",
    "40 cái tên trong biên niên sử — bạn đã đọc thầm từng cái một. Những linh hồn hầu gái cuối cùng cũng được gọi đúng tên mình.",
    "Song sắt kéo lên kẽo kẹt. Bạn lao xuống con dốc sương mù. Sau lưng bạn, từng ô cửa sổ của lâu đài lần lượt tắt lịm.",
    "Chỉ còn ô cửa cao nhất sáng mờ. Một người phụ nữ trong bộ váy đỏ thẫm đứng đó, khuôn mặt nứt như sứ vỡ, nhìn theo bạn — không còn mỉm cười nữa."] });
Object.assign(STORY.cemetery, {
  intro: ["30 năm trước, làng Bình An có hai chị em nổi tiếng xinh đẹp: Lan và Huệ. Cả hai cùng thầm thương anh Tư lái đò — nhưng anh chỉ chọn Lan.",
    "Đêm trước ngày cưới, Huệ rủ chị ra bến sông ngắm trăng. Khi Lan cúi xuống soi mặt, Huệ đẩy chị xuống dòng nước xiết. Lan vùng vẫy, gọi tên em gái cho đến khi chìm hẳn.",
    "Ngày chôn Lan, Huệ lén nhét chiếc lược ngà — sính lễ của anh Tư — vào quan tài, vì người làng tin rằng chôn theo vật hẹn ước, hồn người chết sẽ không bao giờ siêu thoát để đi lấy chồng.",
    "Một năm sau, Huệ cưới anh Tư. Đêm tân hôn, cô treo cổ trong buồng, trên tay nắm một nắm tóc ướt sũng. Anh Tư bỏ nghề đò, xin làm người gác nghĩa trang cho đến cuối đời.",
    "Từ đó, mỗi đêm rằm, những vong hồn chết oan quanh nghĩa trang lại bay lên theo tiếng khóc của Lan. Bạn thua một vụ cá cược và phải ở lại đến 3 giờ sáng.",
    "0 giờ. Chuông nhà thờ đổ từng hồi, dù nhà thờ đã đóng cửa từ lâu. Cánh cổng sắt khóa lại sau lưng bạn."],
  end: ["Chiếc lược nằm trên bàn thờ. Tiếng khóc trong nhà thờ ngừng hẳn. Những bóng trắng lơ lửng quanh nghĩa trang lần lượt tan vào sương.",
    "Trong nhà gác mộ, bạn thấy cuốn sổ cũ của ông Tư. Trang cuối viết: <i>“Huệ đã thú nhận trước khi chết. Tôi ở đây 30 năm, chỉ để xin lỗi Lan mỗi đêm.”</i>",
    "Ổ khóa cổng rơi xuống. Bạn chạy qua những nấm mộ đang lún dần trở lại.",
    "Ở cổng, một giọng con gái thì thầm bên tai: <i>“Cảm ơn... giờ em đi lấy chồng được rồi. Anh Tư đang đợi em ở bến sông.”</i>"] });
Object.assign(STORY.factory, {
  intro: ["Xưởng dệt Hồng Phát, năm 1991. Quản đốc Hoàng — một gã đồ tể cũ của lò mổ — giữ chìa khóa mọi cửa, và giữ cả sổ lương của 27 công nhân ca đêm.",
    "Hắn ăn chặn tiền lương suốt hai năm. Ai thắc mắc thì gặp tai nạn: Bảy bị máy dệt cuốn tay, Hạnh biến mất sau ca đêm với chiếc tủ đồ khóa từ bên trong.",
    "Khi công nhân viết đơn tố cáo, ông chủ và Hoàng bàn nhau một kế: đốt xưởng lấy tiền bảo hiểm, đổ cho chập điện. Đêm ấy, Hoàng xích cửa thoát hiểm từ bên ngoài.",
    "Nhưng gió đổi chiều. Lửa lan về phía văn phòng, nơi Hoàng đang đếm tiền. Người ta tìm thấy xác hắn trước cánh cửa thoát hiểm, chiếc chìa khóa chảy nhão trong lòng bàn tay.",
    "Hồ sơ ghi: chập điện. Ông chủ nhận tiền bảo hiểm rồi biến mất. Bạn là bảo vệ mới, nhận ca đêm đầu tiên. Đêm nay, máy móc trong xưởng tự khởi động.",
    "Từ cuối xưởng vọng lại tiếng dao chặt xuống thớt. Cạch. Cạch. Cạch."],
  end: ["Thang máy hàng rít lên, kéo bạn lên mặt đất. Qua khe cửa, gã Đồ Tể đứng dưới, ngẩng đầu nhìn theo — vẫn đang tìm chiếc chìa khóa mở cánh cửa hắn tự tay xích lại.",
    "27 tấm thẻ chấm công bạn gom được, bạn mang đến đồn công an cùng biên bản tai nạn. Vụ cháy năm 1991 được mở lại điều tra. Ông chủ xưởng bị bắt ở một thành phố khác.",
    "Sáng hôm sau, bạn nộp đơn nghỉ việc. Người bảo vệ già ở cổng chỉ gật đầu, như đã quá quen.",
    "Trong túi áo bạn còn một tấm thẻ chấm công cuối cùng. Tên trên thẻ là tên bạn. Ngày vào làm: 1991. Ca trực: đêm xảy ra vụ cháy."] });
const NOTES_MORE = {
  house: ["Ngày 25: Bà hàng xóm kể năm 1968 nhà này có một bé gái tên Hằng “đi lạc”. Không ai thấy đám tang.",
    "Ngày 27: Linh vẽ hai bé gái nắm tay nhau trong một cái tủ. Mình hỏi bạn kia tên gì. Con bé nói: “Bạn ấy không nhớ tên, chỉ nhớ là đang trốn.”",
    "Ngày 30: Mình khóa cửa hầm, giấu chìa. Sáng nay chiếc chìa nằm trên gối của Linh. Ướt và lạnh.",
    "Trang cuối, nét chữ nhòe nước mắt: “Cái tủ dưới hầm... nó chỉ mở được từ bên ngoài. Mình đã không nghe thấy con gọi.”"],
  forest: ["Ngày 5: Mình tìm thấy trạm kiểm lâm cháy. Có một cuốn sổ trực đề năm 1979, dòng cuối: “Đêm nay sẽ bắt quả tang bọn chặt cây.”",
    "Ngày 6: Ba hình nhân rơm. Một cái mặc áo khoác của Hùng, một cái đeo vòng tay của Lan. Cái thứ ba... chưa có gì.",
    "Ngày 7: Mình hiểu rồi. Nó không phải quỷ. Nó là người gác rừng. Hùng đã chặt cây thiêng.", "Dòng cuối, nét chữ xiêu vẹo: “Nếu ai đọc được — hãy đốt hình nhân, trả lại cành cây cho miếu. Đừng để bọn mình đứng trong rừng mãi.”"],
  castle: ["Năm 1871: Thầy giả kim Morvan dâng lên phu nhân một tấm gương bạc. “Mỗi giọt máu trinh nữ sẽ xóa đi một vết nứt.”",
    "Năm 1880: Hầu gái Marie trốn thoát, kể với cha xứ về căn phòng có bồn tắm đá. Ba ngày sau, cô được tìm thấy dưới chân tháp.",
    "Năm 1887: Bá Tước trở về sau 10 năm. Ông chỉ ở lại một đêm. Sáng hôm sau, người ta thấy ông trong hầm rượu — trắng bệch, không còn một giọt máu.",
    "Danh sách viết bằng máu: 40 cái tên. Dòng cuối chỉ có một chữ: “Tiếp theo?”"],
  cemetery: ["Thư không gửi của Huệ: “Chị ơi, em chỉ muốn đẩy chị một cái cho chị ướt áo, cho chị không đẹp trong ngày cưới. Em không biết nước lại chảy xiết như vậy.”",
    "Huệ viết tiếp: “Em giấu chiếc lược vì em sợ. Sợ chị về đòi anh Tư. Giờ đêm nào em cũng nghe tiếng chải tóc ngoài cửa sổ.”",
    "Sổ trực của ông Tư: “Đêm rằm. Lại thấy cô ấy ngồi trên mộ, tay chải mái tóc ướt. Tôi không dám lại gần. Tôi là người đã chọn cô ấy.”",
    "Mảnh giấy nhét trong khe mộ: “Ai trả lược về bàn thờ, em sẽ để người đó đi. Đừng để em đợi đến 3 giờ.”"],
  factory: ["Sổ lương bị đốt dở: 27 chữ ký giống hệt nhau. Bên cạnh là tên quản đốc Hoàng, nét bút đè lên nhiều lần.",
    "Đơn tố cáo viết tay, ký tên tập thể: “Chúng tôi bị ăn chặn lương hai năm. Chị Hạnh mất tích vì đòi tiền. Xin cấp trên về kiểm tra.” Ngày gửi: 3 ngày trước vụ cháy.",
    "Biên lai bảo hiểm cháy nổ, mua đúng một tuần trước vụ cháy. Số tiền bằng 10 năm lương của cả xưởng.",
    "Nhật ký bảo vệ ca đêm, dòng cuối: “2 giờ sáng. Thấy quản đốc xích cửa thoát hiểm. Tôi định hỏi thì ngửi thấy mùi xăng...” — chữ ký mờ, nhưng nhìn kỹ thì giống chữ ký của bạn."],
};
for (const m in NOTES_MORE) { const c = TASKDEF[m].find(d => d.kind === "note"); if (c) c.notes = [...c.notes, ...NOTES_MORE[m]]; }

setTimeout(() => showWarning(), 0);
