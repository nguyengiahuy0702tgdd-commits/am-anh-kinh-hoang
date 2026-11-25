// =====================================================================
//  27. BẢN 14: mặt ma hiện kín màn hình khi hù · đồ họa "4D"
//      (luồng sáng đèn pin có bụi bay, ống kính cong, nhòe chuyển động, chiều sâu, máy quay nghiêng/thở, rung tay cầm)
// =====================================================================
// ---------- 1. VẼ MẶT MA (mỗi map một gương mặt riêng) ----------
const FACE_IMG = {};
function paintFace(map) {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d"), rr = (a, b) => a + Math.random() * (b - a);
  const E2 = (x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
  const rad = (x, y, r0, r1, c0, c1) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
  const line = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.stroke(); };
  const veins = (x, y, n, len, col) => { for (let i = 0; i < n; i++) { let px = x, py = y, a = rr(0, 6.28); const pts = [[px, py]]; for (let k = 0; k < 6; k++) { a += rr(-.6, .6); px += Math.cos(a) * len / 6; py += Math.sin(a) * len / 6; pts.push([px, py]); } line(pts, rr(.8, 2), col); } };
  const drips = (x, y, n, w, col, len = 90) => { for (let i = 0; i < n; i++) { const xx = x + rr(-w, w), l = rr(len * .3, len); g.fillStyle = col; g.fillRect(xx - 1.5, y, 3, l); E2(xx, y + l, 3.2, 4.5, col); } };
  g.fillStyle = "#000"; g.fillRect(0, 0, 512, 512);
  const P = {
    house: { skin: ["#d6d2c8", "#7a746a"], hair: "#040303", eyes: "black", mouth: "scream", long: 1, tears: 1, cover: 1 },
    forest: { skin: ["#8e8e84", "#2e2e2a"], eyes: "huge", mouth: "needle", long: 1.3, bald: 1 },
    castle: { skin: ["#ece4dc", "#8c7c72"], hair: "#1a0a06", eyes: "red", mouth: "blood", long: 1, cracks: 1, bun: 1 },
    cemetery: { skin: ["#a2b0b4", "#3e4c50"], hair: "#030405", eyes: "white", mouth: "scream", long: 1.05, cover: 1, wet: 1 },
    factory: { sack: 1 },
  }[map] || { skin: ["#ccc", "#555"], eyes: "black", mouth: "scream", long: 1 };
  const cx = 256, cy = 268, rx = 150, ry = 190 * (P.long || 1);
  if (P.sack) {
    g.fillStyle = rad(cx, cy - 20, 30, 260, "#8a6e48", "#2a1c0e"); g.beginPath(); g.moveTo(cx - 150, 512); g.bezierCurveTo(cx - 200, 300, cx - 170, 40, cx, 30); g.bezierCurveTo(cx + 170, 40, cx + 200, 300, cx + 150, 512); g.fill();
    for (let y = 30; y < 512; y += 4) { g.strokeStyle = `rgba(30,18,8,${rr(.15, .35)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(60, y + rr(-2, 2)); g.lineTo(452, y + rr(-2, 2)); g.stroke(); }
    for (let x = 60; x < 452; x += 4) { g.strokeStyle = `rgba(160,130,90,${rr(.05, .15)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 30); g.lineTo(x + rr(-3, 3), 512); g.stroke(); }
    for (const sx of [-1, 1]) { const ex = cx + sx * 62, ey = 230; g.fillStyle = "#050302"; g.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * 6.283, r = (i % 2 ? 40 : 52) + rr(-4, 4); g.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r * .8); } g.fill();
      E2(ex, ey + 4, 24, 17, "#d8d0c0"); veins(ex, ey + 4, 9, 26, "rgba(170,10,10,.8)"); E2(ex + sx * 3, ey + 4, 9, 9, "#2a1408"); E2(ex + sx * 3, ey + 4, 4, 4, "#000"); E2(ex - 5, ey - 1, 2.5, 2, "#fff");
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; line([[ex + Math.cos(a) * 46, ey + Math.sin(a) * 38], [ex + Math.cos(a) * 62, ey + Math.sin(a) * 50]], 3, "#1a0e06"); } }
    line([[cx - 90, 380], [cx + 90, 384]], 6, "#1a0804"); for (let x = cx - 85; x < cx + 90; x += 14) line([[x, 366], [x + 6, 398]], 3.5, "#3a2a1a");
    drips(cx, 386, 9, 80, "#5a0404", 120); for (let i = 0; i < 30; i++) E2(rr(80, 430), rr(60, 500), rr(2, 14), rr(2, 10), `rgba(${rr(70, 110) | 0},0,0,${rr(.5, .9)})`);
    g.fillStyle = "#3a2a14"; g.fillRect(cx - 160, 470, 320, 22); for (let x = cx - 160; x < cx + 160; x += 12) line([[x, 470], [x + 10, 492]], 2, "#1a1008");
  } else {
    if (P.hair) { g.fillStyle = P.hair; g.beginPath(); g.ellipse(cx, cy - 40, rx + 40, ry + 30, 0, 0, 7); g.fill(); g.fillRect(cx - rx - 50, cy - 40, 2 * rx + 100, 512); }
    const face = () => { g.beginPath(); g.moveTo(cx, cy - ry); for (const sx of [1, -1]) { if (sx < 0) g.moveTo(cx, cy - ry); g.bezierCurveTo(cx + sx * rx * 1.02, cy - ry * 1.02, cx + sx * rx * 1.1, cy - ry * .15, cx + sx * rx * .93, cy + ry * .22); g.bezierCurveTo(cx + sx * rx * .82, cy + ry * .62, cx + sx * rx * .42, cy + ry * 1.0, cx, cy + ry * 1.03); } };
    g.fillStyle = rad(cx - 15, cy - 30, 20, ry * 1.1, P.skin[0], P.skin[1]); face(); g.fill();
    g.save(); face(); g.clip();
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "0,0,0" : "255,255,255"},${rr(.02, .08)})`; g.fillRect(cx + rr(-rx, rx), cy + rr(-ry, ry), rr(1, 3), rr(1, 3)); }
    for (let i = 0; i < 14; i++) E2(cx + rr(-rx, rx) * .8, cy + rr(-ry, ry) * .8, rr(8, 30), rr(6, 22), `rgba(${rr(40, 90) | 0},${rr(30, 60) | 0},${rr(40, 70) | 0},${rr(.05, .14)})`, rr(0, 3));
    for (const sx of [-1, 1]) { g.fillStyle = rad(cx + sx * rx * .6, cy + ry * .28, 5, rx * .55, "rgba(0,0,0,.5)", "rgba(0,0,0,0)"); g.fillRect(0, 0, 512, 512); g.fillStyle = rad(cx + sx * rx * 1.05, cy, 10, rx * .7, "rgba(0,0,0,.65)", "rgba(0,0,0,0)"); g.fillRect(0, 0, 512, 512); }
    { const gr = g.createLinearGradient(0, cy - ry, 0, cy + ry); gr.addColorStop(0, "rgba(0,0,0,.45)"); gr.addColorStop(.55, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(255,230,200,.12)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }
    g.fillStyle = rad(cx, cy - ry * .32, 10, rx * .9, "rgba(0,0,0,.0)", "rgba(0,0,0,0)"); g.restore();
    const ey = cy - ry * .2, ex = 64;
    for (const sx of [-1, 1]) {
      const x = cx + sx * ex; g.fillStyle = rad(x, ey, 10, 78, "rgba(0,0,0,.95)", "rgba(20,0,0,0)"); g.fillRect(x - 90, ey - 90, 180, 180);
      if (P.eyes === "black") { E2(x, ey, 36, 30, "#000"); E2(x - 10, ey - 9, 4, 3, "rgba(255,255,255,.85)"); }
      else if (P.eyes === "huge") { g.fillStyle = "#000"; g.beginPath(); g.ellipse(x, ey + 4, 48, 34, sx * .35, 0, 7); g.fill(); E2(x + sx * 6, ey + 6, 4, 4, "#e8e8d8"); }
      else if (P.eyes === "red") { E2(x, ey, 34, 22, "#e8d0c8"); veins(x, ey, 8, 30, "rgba(150,0,0,.8)"); E2(x, ey, 17, 17, "#b00808"); E2(x, ey, 4, 13, "#000"); E2(x - 6, ey - 6, 3, 3, "#fff"); }
      else { E2(x, ey, 34, 24, "#dfe6e6"); veins(x, ey, 7, 26, "rgba(90,100,110,.6)"); E2(x, ey, 13, 13, "rgba(200,210,210,.9)"); }
      if (P.tears) drips(x, ey + 22, 3, 14, "#050202", 150);
      line([[x - 40, ey - 44], [x, ey - 52 - (P.eyes === "red" ? 6 : 0)], [x + 40, ey - 40]], 4, "rgba(0,0,0,.45)");
    }
    if (!P.bald) { line([[cx - 8, cy + 20], [cx - 16, cy + 70], [cx, cy + 78]], 3, "rgba(0,0,0,.35)"); } else { E2(cx - 10, cy + 60, 4, 9, "#000"); E2(cx + 10, cy + 60, 4, 9, "#000"); }
    const my = cy + ry * .58;
    if (P.mouth === "scream") { g.fillStyle = rad(cx, my, 5, 70, "#000", "#1a0404"); g.beginPath(); g.ellipse(cx, my, 46, 72, 0, 0, 7); g.fill(); g.strokeStyle = "rgba(60,0,0,.8)"; g.lineWidth = 6; g.stroke();
      for (let i = 0; i < 7; i++) { const x = cx - 36 + i * 12; g.fillStyle = "#c8c0a8"; g.fillRect(x, my - 66 + Math.abs(i - 3) * 6, 9, rr(10, 18)); g.fillRect(x + 2, my + 52 - Math.abs(i - 3) * 6, 8, rr(-16, -8)); } }
    else if (P.mouth === "needle") { g.fillStyle = "#000"; g.beginPath(); g.moveTo(cx - 120, my - 20); g.quadraticCurveTo(cx, my + 60, cx + 120, my - 20); g.quadraticCurveTo(cx, my + 10, cx - 120, my - 20); g.fill();
      g.fillStyle = "#d8d4c0"; for (let i = 0; i < 26; i++) { const tt = i / 25, x = cx - 115 + tt * 230, y = my - 18 + Math.sin(tt * Math.PI) * 30; g.beginPath(); g.moveTo(x - 3, y - 6); g.lineTo(x + 3, y - 6); g.lineTo(x, y + rr(14, 26)); g.fill(); g.beginPath(); g.moveTo(x - 3, y + 30 + Math.sin(tt * Math.PI) * 8); g.lineTo(x + 3, y + 30 + Math.sin(tt * Math.PI) * 8); g.lineTo(x, y + 8); g.fill(); } }
    else { g.fillStyle = "#200"; g.beginPath(); g.ellipse(cx, my, 52, 30, 0, 0, 7); g.fill(); g.strokeStyle = "#8a0606"; g.lineWidth = 12; g.stroke(); for (let i = 0; i < 8; i++) { g.fillStyle = "#e8e0cc"; g.fillRect(cx - 40 + i * 10, my - 24, 7, i === 2 || i === 5 ? 26 : 10); } drips(cx, my + 26, 7, 46, "#6a0202", 150); E2(cx + 30, my - 10, 30, 16, "rgba(140,0,0,.6)", .3); }
    if (P.cracks) for (let i = 0; i < 6; i++) { let x = cx + rr(-rx * .8, rx * .8), y = cy + rr(-ry * .8, ry * .6); const pts = [[x, y]]; for (let k = 0; k < 6; k++) { x += rr(-22, 22); y += rr(4, 24); pts.push([x, y]); } line(pts, 2, "rgba(30,10,10,.75)"); }
    veins(cx - ex, ey + 40, 4, 60, "rgba(70,30,70,.35)"); veins(cx + ex, ey + 40, 4, 60, "rgba(70,30,70,.35)");
    if (P.hair && P.cover) for (let i = 0; i < 26; i++) { const x0 = cx + rr(-rx * 1.1, rx * 1.1), side = x0 < cx ? -1 : 1; g.strokeStyle = `rgba(3,3,4,${rr(.55, .95)})`; g.lineWidth = rr(2, 7); g.beginPath(); g.moveTo(x0 - side * rr(0, 40), cy - ry * .9); g.bezierCurveTo(x0 + rr(-30, 30), cy - 40, x0 + side * rr(-20, 50), cy + 80, x0 + side * rr(-30, 60), 512); g.stroke(); }
    if (P.bun) E2(cx, cy - ry - 20, 70, 50, P.hair);
    if (P.wet) for (let i = 0; i < 40; i++) { const x = rr(cx - rx, cx + rx), y = rr(cy - ry, cy + ry); E2(x, y, rr(1.5, 4), rr(2, 6), "rgba(220,235,240,.5)"); }
  }
  g.fillStyle = rad(256, 256, 150, 360, "rgba(0,0,0,0)", "rgba(0,0,0,.92)"); g.fillRect(0, 0, 512, 512);
  g.fillStyle = "rgba(90,0,0,.12)"; g.fillRect(0, 0, 512, 512);
  return c;
}
function faceEl() {
  let el = $("faceScare"); if (el) return el;
  const st = document.createElement("style"); st.textContent = `
#faceScare{position:fixed;inset:0;z-index:70;display:none;align-items:center;justify-content:center;background:#000;pointer-events:none;overflow:hidden}
#faceScare.on{display:flex}
#faceScare canvas{height:122vh;width:122vh;max-width:none;filter:contrast(1.35) brightness(1.08) drop-shadow(12px 0 0 rgba(255,0,0,.55)) drop-shadow(-12px 0 0 rgba(0,210,255,.35))}
#faceScare.on canvas{animation:fsZoom var(--fsd,.9s) cubic-bezier(.15,1.5,.35,1) forwards}
#faceScare.glitch canvas{filter:invert(1) contrast(2) hue-rotate(160deg)}
#faceScare.flash{background:#fff}
#faceScare .sl{position:absolute;left:0;right:0;background:inherit;mix-blend-mode:difference;background:#fff;opacity:.0}
@keyframes fsZoom{0%{transform:scale(.45) rotate(-6deg);opacity:0}7%{opacity:1;transform:scale(1.06) rotate(3deg)}18%{transform:scale(1) translate(10px,-8px) rotate(-2deg)}30%{transform:scale(1.12) translate(-12px,6px) rotate(1deg)}45%{transform:scale(1.08) translate(8px,10px)}60%{transform:scale(1.2) translate(-6px,-8px) rotate(-1deg)}80%{transform:scale(1.28) translate(4px,4px)}100%{transform:scale(1.4)}}`;
  document.head.appendChild(st); el = document.createElement("div"); el.id = "faceScare"; el.appendChild(document.createElement("canvas")); document.body.appendChild(el); return el;
}
function showGhostFace(ms = 900) {
  const el = faceEl(), cnv = el.querySelector("canvas"); if (!FACE_IMG[MAPID]) FACE_IMG[MAPID] = paintFace(MAPID);
  cnv.width = cnv.height = 512; cnv.getContext("2d").drawImage(FACE_IMG[MAPID], 0, 0);
  el.style.setProperty("--fsd", ms / 1000 + "s"); el.classList.remove("on", "glitch", "flash"); void el.offsetWidth; el.classList.add("on", "flash"); setTimeout(() => el.classList.remove("flash"), 45);
  const gl1 = setTimeout(() => el.classList.add("glitch"), ms * .22), gl2 = setTimeout(() => el.classList.remove("glitch"), ms * .22 + 55), gl3 = setTimeout(() => el.classList.add("glitch"), ms * .62), gl4 = setTimeout(() => el.classList.remove("glitch"), ms * .62 + 40);
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on", "glitch"), ms);
  rumble(ms > 400 ? [120, 40, 220, 40, 300] : [60], ms > 400 ? 1 : .5);
}
// Hù nhanh: mặt ma lóe lên 0,2 giây rồi biến mất (dùng trong các cú hù ngẫu nhiên lúc quan trọng)
function faceFlash() { showGhostFace(200); noise(.25, 3000, .25, 1.5); tone(70, 0, .3, .25, "sawtooth"); }
function rumble(pat, mag = 1) {
  try { navigator.vibrate?.(pat); } catch (e) {}
  try { for (const gp of navigator.getGamepads?.() || []) gp?.vibrationActuator?.playEffect?.("dual-rumble", { duration: pat.reduce((a, b) => a + b, 0), strongMagnitude: mag, weakMagnitude: mag * .8 }); } catch (e) {}
}

// ---------- 2. MÁY QUAY "4D": nghiêng khi xoay/đi ngang, nhún khi tiếp đất, thở, nhòe chuyển động ----------
const CAM4D = { roll: 0, ey: 0, dip: 0, mbx: 0, mby: 0, pa: null, pp: null, px: null, py: null, land: true };
function cam4dTick(dt) {
  if (!S.started || !dt) return; const P = P1;
  if (CAM4D.pa == null) { CAM4D.pa = P.a; CAM4D.pp = P.pitch; CAM4D.px = P.x; CAM4D.py = P.y; }
  const da = angTo(CAM4D.pa, P.a) / dt, dp = (P.pitch - CAM4D.pp) / dt, vx = (P.x - CAM4D.px) / dt, vy = (P.y - CAM4D.py) / dt; CAM4D.pa = P.a; CAM4D.pp = P.pitch; CAM4D.px = P.x; CAM4D.py = P.y;
  const strafe = vx * Math.sin(P.a) * -1 + vy * Math.cos(P.a), fear = Math.max(0, 1 - minGhostD / 6), k = 1 - Math.exp(-dt * 6);
  const rollT = Math.max(-.07, Math.min(.07, -da * .012 + strafe * .012)) + Math.sin(t * .8) * .004 * (1 + fear * 2);
  CAM4D.roll += (rollT - CAM4D.roll) * k;
  if (P.landed === true && CAM4D.land === false) CAM4D.dip = .07; CAM4D.land = P.landed !== false; CAM4D.dip *= Math.exp(-dt * 7);
  const breath = Math.sin(t * (1.4 + fear * 2.2 + (P.stamina < 30 ? 1.5 : 0))) * (.004 + fear * .006 + (P.stamina < 30 ? .006 : 0));
  CAM4D.ey = breath - CAM4D.dip;
  const mbT = S.paused ? 0 : Math.max(-.025, Math.min(.025, da * .0035)), mbP = S.paused ? 0 : Math.max(-.02, Math.min(.02, dp * .003));
  CAM4D.mbx += (mbT - CAM4D.mbx) * Math.min(1, dt * 20); CAM4D.mby += (mbP - CAM4D.mby) * Math.min(1, dt * 20);
}
function lookAtR(e, fw, r) { const m = lookAt(e, fw); if (!r) return m; const c = Math.cos(r), s = Math.sin(r); for (const k of [0, 4, 8, 12]) { const x = m[k], y = m[k + 1]; m[k] = x * c + y * s; m[k + 1] = -x * s + y * c; } return m; }

// ---------- 3. BỤI LƠ LỬNG trong không khí — chỉ thấy rõ khi lọt vào luồng đèn pin ----------
const DUST = [];
function drawDust(v, eye, fw, dt) {
  if (!T.r_dust || SET.quality === "nhanh") return;
  if (!DUST.length) for (let i = 0; i < 110; i++) DUST.push({ x: Math.random() * 5, y: Math.random() * 2.4, z: Math.random() * 5, ph: Math.random() * 6.28, s: .0025 + Math.random() * .004 });
  const L = LAYER.get(T.r_dust), rl = Math.hypot(fw[0], fw[2]) || 1, rx = -fw[2] / rl, rz = fw[0] / rl, n = [-fw[0], -fw[1], -fw[2]], wrap = (a, c, B) => c + ((((a - c + B / 2) % B) + B) % B) - B / 2;
  for (const d of DUST) {
    d.ph += (dt || .016) * .6; d.x += Math.sin(d.ph) * .0015; d.y += Math.cos(d.ph * .7) * .0008 - .0002; d.z += Math.cos(d.ph * 1.3) * .0015;
    const x = wrap(d.x, eye[0], 5), y = Math.max(.05, wrap(d.y, eye[1], 2.4)), z = wrap(d.z, eye[2], 5), ddx = x - eye[0], ddy = y - eye[1], ddz = z - eye[2], dist = Math.hypot(ddx, ddy, ddz);
    if (dist < .25 || dist > 2.2 || (ddx * fw[0] + ddy * fw[1] + ddz * fw[2]) / dist < .82 || !flashOn()) continue;
    const s = d.s * (1 + dist * .4);
    quad(v, [[x - rx * s, y + s, z - rz * s, 0, 0], [x + rx * s, y + s, z + rz * s, 1, 0], [x + rx * s, y - s, z + rz * s, 1, 1], [x - rx * s, y - s, z - rz * s, 0, 1]], n, L);
  }
}
function buildV14Textures() {
  if (T.r_dust) return;
  T.r_dust = tex(g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 60); gr.addColorStop(0, "rgba(200,190,170,1)"); gr.addColorStop(.6, "rgba(150,140,125,1)"); gr.addColorStop(.61, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
}
