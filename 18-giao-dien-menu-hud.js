// =====================================================================
//  17. GIAO DIỆN: phông nền động theo từng map, menu chữ, HUD tối giản, sổ tay
// =====================================================================
function menuEyes(g, W, H, tt) {
  for (let i = 0; i < 3; i++) {
    const cyc = tt * .11 + i * .37, ph = cyc % 1, id = Math.floor(cyc); if (ph > .2) continue;
    const x = W * (.06 + sr(i * 13 + id) * .88), y = H * (.5 + sr(i * 7 + id * 3) * .32), a = Math.sin(ph / .2 * Math.PI), bl = Math.sin(tt * 7 + i * 4) > .93 ? .05 : 1, s = 1.4 + sr(id + i) * 1.6;
    g.save(); g.shadowColor = "rgba(255,0,0,.9)"; g.shadowBlur = 8; g.fillStyle = `rgba(235,25,12,${.9 * a * bl})`;
    g.beginPath(); g.ellipse(x - 3.2 * s, y, 1.6 * s, .75 * s, .12, 0, 7); g.ellipse(x + 3.2 * s, y, 1.6 * s, .75 * s, -.12, 0, 7); g.fill(); g.restore();
  }
}

const BG = { on: true, map: "house", c: $("bg") };
function bgSize() { BG.c.width = Math.ceil(innerWidth / 2); BG.c.height = Math.ceil(innerHeight / 2); }
addEventListener("resize", bgSize); bgSize();
const PAL = {
  house: ["#06070a", "#14171c", "#2a2224", [.75, .22]], forest: ["#020403", "#0b1510", "#1a2a20", [.3, .2]], castle: ["#050409", "#120e1a", "#24182a", [.62, .18]],
  cemetery: ["#030505", "#0e1614", "#1e2a26", [.28, .16]], factory: ["#070504", "#18120c", "#2e2016", [.7, .25]],
};
function sr(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function pine(g, x, y, h, c) { g.fillStyle = c; g.beginPath(); for (let i = 0; i < 5; i++) { const yy = y - h * (i / 5), w = h * .32 * (1 - i / 6); g.moveTo(x - w, yy); g.lineTo(x, yy - h * .32); g.lineTo(x + w, yy); } g.fill(); g.fillRect(x - h * .02, y - h * .05, h * .04, h * .1); }
function deadTree(g, x, y, len, ang, w, d) { if (d === 0 || len < 2) return; const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); for (let i = 0; i < 2; i++) deadTree(g, x2, y2, len * (.62 + sr(x2 + i) * .15), ang + (i ? .45 : -.5) + (sr(y2 + i) - .5) * .3, w * .65, d - 1); }
function figSil(g, x, y, h, glow) {
  g.fillStyle = "#000"; g.beginPath(); g.ellipse(x, y - h * .9, h * .08, h * .1, 0, 0, 7); g.fill(); g.fillRect(x - h * .1, y - h * .82, h * .2, h * .5); g.fillRect(x - h * .09, y - h * .34, h * .07, h * .34); g.fillRect(x + h * .02, y - h * .34, h * .07, h * .34);
  if (glow) { g.fillStyle = glow; g.fillRect(x - h * .04, y - h * .92, h * .025, h * .015); g.fillRect(x + h * .018, y - h * .92, h * .025, h * .015); }
}
function drawBackdrop(tt) {
  const c = BG.c, g = c.getContext("2d"), W = c.width, H = c.height, m = BG.map, [top, mid, hor, [mx, my]] = PAL[m];
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, top); sky.addColorStop(.6, mid); sky.addColorStop(1, hor); g.fillStyle = sky; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(220,220,230,${.15 + sr(i) * .5 * (.6 + .4 * Math.sin(tt * (1 + sr(i + 9)) + i))})`; g.fillRect(sr(i + 1) * W, sr(i + 2) * H * .55, 1, 1); }
  const MX = W * mx, MY = H * my, R0 = H * .06, mg = g.createRadialGradient(MX, MY, R0 * .5, MX, MY, R0 * 5); mg.addColorStop(0, m === "forest" ? "rgba(160,40,30,.28)" : "rgba(200,205,215,.22)"); mg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = mg; g.fillRect(0, 0, W, H);
  g.fillStyle = m === "forest" ? "#b84a38" : "#d8d8cc"; g.beginPath(); g.arc(MX, MY, R0, 0, 7); g.fill(); g.fillStyle = mid; g.beginPath(); g.arc(MX + R0 * .45, MY - R0 * .15, R0 * .95, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { const cx = ((sr(i + 40) * W + tt * (6 + i * 3)) % (W * 1.6)) - W * .3; g.fillStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.ellipse(cx, H * (.12 + sr(i + 50) * .25), W * .22, H * .025, 0, 0, 7); g.fill(); }
  const ground = H * .78, sil = "#030303", sil2 = "#0a0a0c";
  if (m === "forest") {
    for (let L = 0; L < 3; L++) { const col = ["#0d1611", "#070c09", "#020302"][L], n = 14 + L * 6, s = 1 + L * .45; for (let i = 0; i < n; i++) pine(g, ((sr(i * 7 + L) * 1.2 - .1) * W + tt * L * .8) % (W * 1.1), ground + L * H * .06, H * (.32 + sr(i + L * 3) * .2) * s, col); }
    if (Math.sin(tt * .37) > .9) figSil(g, W * .58, ground + H * .02, H * .36, "#fff");
  } else if (m === "house") {
    g.fillStyle = sil; g.fillRect(0, ground, W, H); const hx = W * .52, hw = W * .3, hh = H * .26;
    g.fillStyle = sil2; g.fillRect(hx - hw / 2, ground - hh, hw, hh); g.beginPath(); g.moveTo(hx - hw * .58, ground - hh); g.lineTo(hx, ground - hh * 1.75); g.lineTo(hx + hw * .58, ground - hh); g.fill(); g.fillRect(hx + hw * .2, ground - hh * 1.75, hw * .07, hh * .5);
    const fl = .7 + .3 * Math.sin(tt * 13) * Math.sin(tt * 7); [[-.3, .55], [.25, .55], [-.3, .22], [.25, .22], [0, 1.25]].forEach(([dx, dy], i) => { g.fillStyle = i === 3 ? `rgba(200,140,60,${.75 * fl})` : "#050506"; g.fillRect(hx + dx * hw - hw * .06, ground - hh * dy - hh * .14, hw * .12, hh * .16); });
    if (Math.sin(tt * .41) > .82) figSil(g, hx + .25 * hw, ground - hh * .22 + hh * .02, hh * .16, null);
    g.strokeStyle = sil; deadTree(g, W * .14, ground, H * .22, -1.57, 6, 7); deadTree(g, W * .9, ground, H * .18, -1.62, 5, 6);
  } else if (m === "castle") {
    g.fillStyle = sil; g.beginPath(); g.moveTo(0, H); g.lineTo(0, ground - H * .05); g.lineTo(W * .3, ground - H * .12); g.lineTo(W * .75, ground - H * .1); g.lineTo(W, ground); g.lineTo(W, H); g.fill();
    g.fillStyle = sil2; const base = ground - H * .1; g.fillRect(W * .3, base - H * .22, W * .42, H * .22); for (let x = W * .3; x < W * .72; x += W * .02) g.fillRect(x, base - H * .25, W * .012, H * .03);
    [[.3, .38], [.45, .5], [.6, .44], [.72, .34]].forEach(([x, h]) => { g.fillRect(W * x - W * .03, base - H * h, W * .06, H * h); g.beginPath(); g.moveTo(W * x - W * .04, base - H * h); g.lineTo(W * x, base - H * (h + .12)); g.lineTo(W * x + W * .04, base - H * h); g.fill(); });
    g.fillStyle = `rgba(210,120,50,${.6 + .3 * Math.sin(tt * 9)})`; g.fillRect(W * .445, base - H * .42, W * .01, H * .025);
    if (sr(Math.floor(tt * 2)) > .985) { g.fillStyle = "rgba(200,200,255,.25)"; g.fillRect(0, 0, W, H); }
    for (let i = 0; i < 6; i++) { const bx = (sr(i) * W + tt * 30 * (1 + sr(i + 3))) % W, by = H * (.2 + sr(i + 7) * .2) + Math.sin(tt * 3 + i) * 6; g.strokeStyle = "#000"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx - 5, by - 2); g.lineTo(bx, by + Math.sin(tt * 20 + i) * 2); g.lineTo(bx + 5, by - 2); g.stroke(); }
  } else if (m === "cemetery") {
    g.fillStyle = sil; g.fillRect(0, ground, W, H); g.strokeStyle = sil; deadTree(g, W * .78, ground, H * .25, -1.5, 8, 8);
    for (let i = 0; i < 22; i++) { const x = sr(i + 70) * W, y = ground + sr(i + 80) * H * .08, s = H * (.04 + sr(i) * .04); g.fillStyle = "#050606"; if (i % 3) { g.fillRect(x - s * .3, y - s, s * .6, s); g.beginPath(); g.arc(x, y - s, s * .3, Math.PI, 0); g.fill(); } else { g.fillRect(x - s * .06, y - s * 1.4, s * .12, s * 1.4); g.fillRect(x - s * .35, y - s * 1.05, s * .7, s * .12); } }
    g.fillStyle = sil2; g.fillRect(W * .14, ground - H * .16, W * .14, H * .16); g.beginPath(); g.moveTo(W * .12, ground - H * .16); g.lineTo(W * .21, ground - H * .25); g.lineTo(W * .3, ground - H * .16); g.fill();
    g.strokeStyle = "#020202"; g.lineWidth = 1; for (let x = 0; x < W; x += 6) { g.beginPath(); g.moveTo(x, ground + H * .1); g.lineTo(x, ground + H * .03); g.stroke(); }
    for (let i = 0; i < 4; i++) { const wx = W * (.3 + sr(i) * .5) + Math.sin(tt * .5 + i) * 20, wy = ground - H * .03 + Math.sin(tt * 1.3 + i * 2) * 5, wg = g.createRadialGradient(wx, wy, 0, wx, wy, 9); wg.addColorStop(0, "rgba(170,255,190,.55)"); wg.addColorStop(1, "rgba(170,255,190,0)"); g.fillStyle = wg; g.fillRect(wx - 9, wy - 9, 18, 18); }
  } else if (m === "hospital") {
    g.fillStyle = sil; g.fillRect(0, ground, W, H); const b = ground, x0 = W * .16, x1 = W * .84, top = b - H * .34;
    g.fillStyle = sil2; g.fillRect(x0, top, x1 - x0, b - top); g.fillRect(W * .42, top - H * .08, W * .16, H * .08); g.fillRect(W * .2, top - H * .05, W * .05, H * .05);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) { const wx = x0 + W * .02 + c * (x1 - x0 - W * .04) / 14, wy = top + H * .04 + r * H * .07, on = sr(r * 31 + c) < .2 && Math.sin(tt * (3 + sr(c) * 9) + c) > -.5;
      g.fillStyle = on ? "rgba(150,205,175,.5)" : "rgba(0,0,0,.7)"; g.fillRect(wx, wy, W * .022, H * .04); if (r === 2 && c === 9 && Math.sin(tt * .4) > .55) figSil(g, wx + W * .011, wy + H * .04, H * .035, "#a00"); }
    const cf = Math.sin(tt * 7) * Math.sin(tt * 2.3) > -.3 ? .9 : .12, cx = W * .5, cy = top - H * .13, s2 = H * .032; g.fillStyle = `rgba(220,20,20,${cf})`; g.fillRect(cx - s2 / 3, cy - s2, s2 * 2 / 3, s2 * 2); g.fillRect(cx - s2, cy - s2 / 3, s2 * 2, s2 * 2 / 3);
    const rg = g.createRadialGradient(cx, cy, 0, cx, cy, H * .16); rg.addColorStop(0, `rgba(200,0,0,${cf * .28})`); rg.addColorStop(1, "rgba(200,0,0,0)"); g.fillStyle = rg; g.fillRect(cx - H * .16, cy - H * .16, H * .32, H * .32);
    g.fillStyle = "#020303"; g.fillRect(W * .62, b - H * .05, W * .09, H * .04); g.beginPath(); g.arc(W * .64, b - H * .008, H * .01, 0, 7); g.arc(W * .69, b - H * .008, H * .01, 0, 7); g.fill();
    g.strokeStyle = "rgba(140,160,170,.16)"; g.lineWidth = 1; for (let i = 0; i < 70; i++) { const rx = (sr(i) * W + tt * 40) % W, ry = (sr(i + 9) * H + tt * 380) % H; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3, ry + 12); g.stroke(); }
  } else {
    g.fillStyle = sil; g.fillRect(0, ground, W, H); g.fillStyle = sil2; const b = ground;
    for (let i = 0; i < 6; i++) { const x = W * (.12 + i * .1); g.beginPath(); g.moveTo(x, b - H * .12); g.lineTo(x + W * .08, b - H * .2); g.lineTo(x + W * .08, b - H * .12); g.fill(); } g.fillRect(W * .12, b - H * .12, W * .6, H * .12);
    [[.2, .38], [.32, .45], [.62, .3]].forEach(([x, h], i) => { g.fillRect(W * x, b - H * h, W * .025, H * h); for (let k = 0; k < 10; k++) { const p = (tt * .08 + k / 10 + i * .3) % 1; g.fillStyle = `rgba(40,36,34,${.5 * (1 - p)})`; g.beginPath(); g.arc(W * x + W * .012 + p * W * .08, b - H * h - p * H * .25, 6 + p * 26, 0, 7); g.fill(); } g.fillStyle = sil2; });
    g.fillRect(W * .8, b - H * .28, W * .07, H * .06); g.fillRect(W * .82, b - H * .22, W * .01, H * .22); g.fillRect(W * .85, b - H * .22, W * .01, H * .22);
    if (Math.sin(tt * 2.3) > 0) { g.fillStyle = "rgba(255,40,30,.8)"; g.fillRect(W * .5, b - H * .1, 3, 3); }
    if (Math.sin(tt * .33) > .85) figSil(g, W * .43, b, H * .2, "#a00");
  }
  for (let i = 0; i < 4; i++) { const fx = ((tt * (12 + i * 5) + sr(i + 20) * W) % (W * 1.5)) - W * .25, fy = ground - H * .02 + i * H * .03, fg = g.createRadialGradient(fx, fy, 0, fx, fy, W * .35);
    fg.addColorStop(0, "rgba(120,130,140,.09)"); fg.addColorStop(1, "rgba(120,130,140,0)"); g.fillStyle = fg; g.fillRect(fx - W * .35, fy - W * .35, W * .7, W * .7); }
  menuEyes(g, W, H, tt);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.75)"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
(function bgLoop(now) { if (!BG.on) return; drawBackdrop(now / 1000); requestAnimationFrame(bgLoop); })(0);

// ---- Menu ----
function buildMenus() {
  const list = $("mapCards"); list.innerHTML = "";
  const pick = id => { MAPID = id; BG.map = id; const m = MAPS[id]; $("mapName").textContent = m.name; bloodify($("mapName"), 5); $("mapTag").textContent = m.tag; $("mapInfo").textContent = m.desc; [...list.children].forEach(x => x.classList.toggle("sel", x.dataset.id === id)); };
  for (const [id, m] of Object.entries(MAPS)) { const a = document.createElement("a"); a.textContent = m.name; a.dataset.id = id; a.onclick = () => pick(id); a.onmouseenter = () => { BG.map = id; }; list.appendChild(a); }
  list.onmouseleave = () => { BG.map = MAPID; }; pick(MAPID);
  const db = $("diffBtns"); db.innerHTML = "";
  Object.values(DIFF).forEach(d => { const a = document.createElement("a"); a.textContent = d.name; a.onclick = () => { D = d; [...db.children].forEach(x => x.classList.remove("sel")); a.classList.add("sel"); $("diffDesc").textContent = d.desc; }; if (d === D) { a.classList.add("sel"); $("diffDesc").textContent = d.desc; } db.appendChild(a); });
  buildSettingsUI();
}
function buildSettingsUI() {
  const box = $("setList"); box.innerHTML = "";
  for (const [label, key, type, a, b] of SETTINGS_UI) {
    const row = document.createElement("div"); row.className = "setRow"; const sp = document.createElement("span"); sp.textContent = label; const ctl = document.createElement("div"); ctl.className = "ctl"; row.append(sp, ctl);
    if (type === "range") { const inp = document.createElement("input"); inp.type = "range"; inp.min = a; inp.max = b; inp.value = SET[key]; const val = document.createElement("b"); val.textContent = SET[key]; inp.oninput = () => { SET[key] = +inp.value; val.textContent = inp.value; applySet(); saveSet(); }; ctl.append(inp, val); }
    else if (type === "check") { for (const [txt, on] of [["Bật", true], ["Tắt", false]]) { const o = document.createElement("a"); o.className = "tg" + (SET[key] === on ? " on" : ""); o.textContent = txt; o.onclick = () => { SET[key] = on; applySet(); saveSet(); buildSettingsUI(); }; ctl.appendChild(o); } }
    else for (const [k, n] of Object.entries(a)) { const o = document.createElement("a"); o.className = "sl" + (SET[key] === k ? " on" : ""); o.textContent = n; o.onclick = () => { SET[key] = k; applySet(); saveSet(); buildSettingsUI(); }; ctl.appendChild(o); }
    box.appendChild(row);
  }
}

// ---- HUD ----
let lastGoal = "", goalShow = 0, batShow = 0, lastLight = true, journalOpen = false;
function showArea(name) { const a = $("area"); a.textContent = name; bloodify(a, 6); a.classList.add("show"); clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove("show"), 2600); }

function toggleJournal(force) {
  journalOpen = force ?? !journalOpen; $("journal").classList.toggle("hidden", !journalOpen);
  if (journalOpen) { S.paused = true; document.exitPointerLock?.(); } else { S.paused = false; cv.requestPointerLock?.(); }
}
const TIPS = ["Chạy gây tiếng động. Có những thứ nghe rõ hơn bạn tưởng.", "Đọc kỹ mọi mảnh giấy — câu trả lời thường nằm ở đó.", "Tắt đèn pin để tiết kiệm pin, nhưng bóng tối không đứng về phía bạn.", "Khi nghe tiếng tim đập nhanh, nó đang ở rất gần.", "Bấm Tab để mở sổ tay."];
