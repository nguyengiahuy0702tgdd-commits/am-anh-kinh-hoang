// ===================== 2. TEXTURE (vẽ bằng code) =====================
const TS = 256; // độ phân giải texture tường/sàn
let seed = 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
// Vẽ trong hệ tọa độ 128 rồi phóng x2 để texture sắc nét
function tex(draw, emit, w = 128, h = 128, sc = 2) {
  const c = document.createElement("canvas"); c.width = w * sc; c.height = h * sc; const g = c.getContext("2d"); g.scale(sc, sc);
  draw(g, w, h); let e = null, c2 = null;
  if (emit) {
    emit(g, w, h);
    c2 = document.createElement("canvas"); c2.width = w * sc; c2.height = h * sc; const g2 = c2.getContext("2d"); g2.scale(sc, sc); emit(g2, w, h);
    const ed = g2.getImageData(0, 0, w * sc, h * sc).data; e = new Uint8Array(w * h * sc * sc); for (let i = 0; i < e.length; i++) e[i] = ed[i * 4 + 3];
  }
  const id = g.getImageData(0, 0, w * sc, h * sc), d = id.data;
  
  g.setTransform(1, 0, 0, 1, 0, 0); g.putImageData(id, 0, 0);
  return { w: w * sc, h: h * sc, d, e, c, ec: c2 };
}
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const E = (g, x, y, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
function grime(g, w, h, n = 1200, a = .3) {
  for (let i = 0; i < n / 18; i++) { const x = rnd() * w, y = rnd() * h, r = 2 + rnd() * 7, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${rnd() * a * .6})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 5; i++) { const x = rnd() * w, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(20,15,5,.35)"); gr.addColorStop(1, "rgba(20,15,5,0)"); g.fillStyle = gr; g.fillRect(x, 0, 1 + rnd() * 5, h * (.3 + rnd() * .7)); }
}
function stain(g, x, y, r, c = "rgba(30,20,5,.45)") { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
function drip(g, x, y, len, c = "#5e0606") { g.fillStyle = c; g.fillRect(x, y, 1.6, len); g.beginPath(); g.arc(x + .8, y + len, 1.6, 0, 7); g.fill(); }
function hand(g, x, y, s = 1, col = "rgba(100,6,6,.85)") {
  E(g, x, y, 7 * s, 9 * s, col); g.lineCap = "round"; g.strokeStyle = col; g.lineWidth = 3 * s;
  [[-6, -6, -9, -16], [-2, -9, -3, -21], [2, -9, 3, -22], [6, -7, 8, -18], [7, 2, 14, -3]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(x + a * s, y + b * s); g.lineTo(x + c * s, y + d * s); g.stroke(); });
  drip(g, x - 2, y + 8 * s, 10 + rnd() * 20, col);
}
const PAPERS = { olive: ["#4b4532", "#3f3a28", "#5a5238", 0], rose: ["#5a3e3e", "#4c3434", "#7a5052", 1], blue: ["#323a46", "#2a313c", "#46526a", 0] };
function wallpaper(g, w, h, kind = "olive") {
  const [base, stripe, motif, flower] = PAPERS[kind];
  R(g, 0, 0, w, h, base); for (let x = 0; x < w; x += 16) R(g, x, 0, 6, h, stripe);
  for (let y = 10; y < h - 40; y += 22) for (let x = (y / 22 % 2) * 16 + 8; x < w; x += 32) {
    if (flower) { for (let k = 0; k < 5; k++) E(g, x + Math.cos(k * 1.26) * 3, y + Math.sin(k * 1.26) * 3, 2, 2, motif); E(g, x, y, 1.3, 1.3, "#2a1a14"); }
    else { g.fillStyle = motif; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 5, y); g.lineTo(x, y + 6); g.lineTo(x - 5, y); g.fill(); E(g, x, y, 1.2, 1.2, stripe); }
  }
  R(g, 0, h - 38, w, 38, "#2e1c10"); R(g, 0, h - 40, w, 4, "#1e120a"); R(g, 0, h - 40, w, 1, "#4a3020");
  for (let x = 0; x < w; x += 32) { R(g, x, h - 36, 1.5, 36, "#1e120a"); R(g, x + 4, h - 32, 24, 26, "rgba(0,0,0,.18)"); }
  grime(g, w, h); for (let i = 0; i < 3; i++) stain(g, rnd() * w, rnd() * (h - 40), 10 + rnd() * 25);
  R(g, rnd() * 90, 20 + rnd() * 40, 20 + rnd() * 20, 1.5, "rgba(0,0,0,.5)");
  g.fillStyle = "rgba(255,240,200,.04)"; g.fillRect(0, 0, w, 3); // gờ trần
}
function tiles(g, w, h, c, grout, s) {
  R(g, 0, 0, w, h, grout);
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { R(g, x + .8, y + .8, s - 1.6, s - 1.6, c); R(g, x + .8, y + .8, s - 1.6, 1, "rgba(255,255,255,.08)"); if (rnd() < .08) R(g, x + 1, y + 1, s - 2, s - 2, "rgba(0,0,0,.4)"); }
}
function concrete(g, w, h, pipes) {
  R(g, 0, 0, w, h, "#3a3835"); grime(g, w, h, 3500, .25);
  g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = .8; for (let i = 0; i < 4; i++) { g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd() - .5) * 30; y += rnd() * 20; g.lineTo(x, y); } g.stroke(); }
  if (pipes) { R(g, 0, 14, w, 7, "#4a3a2a"); R(g, 0, 14, w, 2, "#6a5038"); R(g, 0, 26, w, 4, "#2e2a26"); for (let x = 10; x < w; x += 40) R(g, x, 12, 4, 11, "#2a2018"); stain(g, 60, 30, 16, "rgba(60,40,10,.6)"); }
  R(g, 0, h - 8, w, 8, "rgba(0,0,0,.35)");
}
function writing(g, lines, size, col = "#6e0808") {
  g.font = `bold ${size}px "Times New Roman", serif`; g.fillStyle = col; g.textAlign = "center";
  const lh = size * 1.05, y0 = 58 - (lines.length * lh) / 2 + size * .8;
  lines.forEach((l, i) => { g.save(); g.translate(64, y0 + i * lh); g.rotate((rnd() - .5) * .14); g.fillText(l, 0, 0); g.restore(); });
  for (let i = 0; i < 12; i++) drip(g, 18 + rnd() * 92, y0 + (lines.length - 1) * lh + 3, 8 + rnd() * 35, "#5a0505");
}
function clockFace(g, cx, cy, r, h, m) {
  E(g, cx, cy, r + 4, r + 4, "#3a2a18"); E(g, cx, cy, r, r, "#b8b098"); E(g, cx, cy, r, r * .15, "rgba(0,0,0,0)");
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; R(g, cx + Math.sin(a) * r * .82 - .8, cy - Math.cos(a) * r * .82 - .8, 1.6, 1.6, "#222"); }
  const ha = ((h % 12) + m / 60) / 12 * Math.PI * 2, ma = m / 60 * Math.PI * 2;
  g.strokeStyle = "#111"; g.lineCap = "round";
  g.lineWidth = 2.6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ha) * r * .5, cy - Math.cos(ha) * r * .5); g.stroke();
  g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ma) * r * .82, cy - Math.cos(ma) * r * .82); g.stroke();
  E(g, cx, cy, 1.8, 1.8, "#111");
}
function wood(g, w, h, c = "#3b2a1b") {
  R(g, 0, 0, w, h, c);
  for (let y = 0, r = 0; y < h; y += 16, r++) { R(g, 0, y, w, 1.5, "#1f140b"); R(g, (r * 37) % w, y, 1.5, 16, "#1f140b"); R(g, 0, y + 1.5, w, 1, "rgba(255,220,160,.05)"); }
  for (let i = 0; i < 90; i++) R(g, rnd() * w, rnd() * h, 10 + rnd() * 30, .6, "rgba(0,0,0,.2)");
  grime(g, w, h, 800, .3);
}
function plaque(g, x, y, text) { R(g, x - 24, y - 7, 48, 12, "#6a5838"); R(g, x - 24, y - 7, 48, 1, "#8a7850"); g.fillStyle = "#1a1008"; g.font = "bold 7.5px 'Times New Roman'"; g.textAlign = "center"; g.fillText(text, x, y + 2); }
function stairs(g, w, h, up, label, paper) {
  if (paper === "conc") concrete(g, w, h); else wallpaper(g, w, h, paper);
  R(g, 10, 6, 108, 122, "#1a0e06"); R(g, 16, 12, 96, 116, "#050302");
  for (let i = 0; i < 10; i++) {
    const k = up ? i : 9 - i, inset = k * 4.2, y = up ? 124 - i * 11.5 : 14 + i * 11.5, sh = up ? 1 - i * .085 : .2 + i * .02;
    R(g, 16 + inset, y - 7, 96 - 2 * inset, 7, `rgb(${58 * sh | 0},${38 * sh | 0},${24 * sh | 0})`); R(g, 16 + inset, y - 7, 96 - 2 * inset, 1.2, `rgba(120,90,60,${sh * .6})`);
  }
  const gr = g.createLinearGradient(0, up ? 12 : 128, 0, up ? 128 : 12); gr.addColorStop(0, "rgba(0,0,0,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(16, 12, 96, 116);
  g.strokeStyle = "#2e1c0e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(22, 124); g.lineTo(up ? 46 : 30, up ? 20 : 30); g.stroke();
  for (let i = 0; i < 6; i++) { g.lineWidth = 1.2; g.beginPath(); const yy = 120 - i * 17; g.moveTo(22 + i * 4, yy); g.lineTo(22 + i * 4, yy - 14); g.stroke(); }
  plaque(g, 64, 3.5, label); grime(g, w, h, 400, .3);
}

const T = {}, S = {};
function buildTextures() {
  T.paper = tex((g, w, h) => wallpaper(g, w, h)); T.paperB = tex((g, w, h) => { wallpaper(g, w, h); hand(g, 40, 62); hand(g, 84, 50, .9); hand(g, 64, 86, .8); });
  T.rose = tex((g, w, h) => wallpaper(g, w, h, "rose")); T.roseB = tex((g, w, h) => { wallpaper(g, w, h, "rose"); for (let i = 0; i < 6; i++) hand(g, 20 + rnd() * 90, 40 + rnd() * 50, .5); });
  T.blue = tex((g, w, h) => wallpaper(g, w, h, "blue")); T.blueB = tex((g, w, h) => { wallpaper(g, w, h, "blue"); stain(g, 64, 50, 40, "rgba(90,0,0,.55)"); hand(g, 60, 60); });
  T.bathW = tex((g, w, h) => { tiles(g, w, h, "#78786f", "#33332e", 16); grime(g, w, h, 1500, .35); }); T.bathWB = tex((g, w, h) => { tiles(g, w, h, "#78786f", "#33332e", 16); grime(g, w, h, 1500, .35); stain(g, 60, 80, 30, "rgba(90,0,0,.5)"); hand(g, 74, 66); });
  T.kitW = tex((g, w, h) => { tiles(g, w, h, "#7a6e54", "#2e2a20", 16); grime(g, w, h, 1800, .4); stain(g, 30, 100, 30); });
  T.conc = tex((g, w, h) => concrete(g, w, h)); T.concP = tex((g, w, h) => concrete(g, w, h, 1)); T.concB = tex((g, w, h) => { concrete(g, w, h); hand(g, 50, 60); hand(g, 80, 75, .8); });
  T.w1 = tex((g, w, h) => { wallpaper(g, w, h); writing(g, ["CỨU"], 46); });
  T.w2 = tex((g, w, h) => { wallpaper(g, w, h, "blue"); writing(g, ["NÓ Ở", "ĐÂY"], 32); });
  T.w3 = tex((g, w, h) => { concrete(g, w, h); writing(g, ["ĐỪNG", "QUAY LẠI"], 26); });
  T.w4 = tex((g, w, h) => { wallpaper(g, w, h, "rose"); writing(g, ["MẸ ƠI", "CON LẠNH"], 24); });
  T.w5 = tex((g, w, h) => { concrete(g, w, h); writing(g, ["TRẢ BÉ", "BÔNG", "CHO EM"], 22); });
  // Cầu thang
  T.stUp = tex((g, w, h) => stairs(g, w, h, 1, "LÊN LẦU 1", "olive"));
  T.stDn2 = tex((g, w, h) => stairs(g, w, h, 0, "XUỐNG TẦNG 1", "blue"));
  T.stUpB = tex((g, w, h) => stairs(g, w, h, 1, "LÊN TẦNG 1", "conc"));
  T.stDnB = tex((g, w, h) => stairs(g, w, h, 0, "TẦNG HẦM", "olive"));
  T.baseDoor = tex((g, w, h) => {
    wallpaper(g, w, h); R(g, 16, 4, 96, 124, "#140a04"); R(g, 22, 8, 84, 120, "#3a2614");
    for (let x = 22; x < 106; x += 12) R(g, x, 8, 1.2, 120, "#2a180a");
    [30, 70, 108].forEach(y => { R(g, 22, y, 84, 6, "#2a2a2a"); for (let x = 26; x < 104; x += 14) E(g, x, y + 3, 1.3, 1.3, "#555"); });
    g.strokeStyle = "#5a5a5a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(30, 64); for (let i = 0; i < 9; i++) g.lineTo(34 + i * 7, 64 + (i % 2) * 6); g.stroke();
    R(g, 58, 70, 14, 12, "#6a6a6a"); g.strokeStyle = "#6a6a6a"; g.lineWidth = 2; g.beginPath(); g.arc(65, 70, 5, Math.PI, 0); g.stroke(); R(g, 64, 74, 2, 4, "#111");
    plaque(g, 64, 20, "TẦNG HẦM"); hand(g, 90, 96, .7); grime(g, w, h, 500, .35);
  });
  T.bathDoor = tex((g, w, h) => {
    wallpaper(g, w, h, "blue"); R(g, 16, 0, 96, 128, "#1a0e06"); R(g, 22, 4, 84, 124, "#4a2c18");
    for (let x = 22; x < 106; x += 14) R(g, x, 4, 1.5, 124, "#3a2010"); E(g, 94, 70, 3.5, 3.5, "#b09040");
    plaque(g, 64, 30, "PHÒNG TẮM"); g.strokeStyle = "rgba(0,0,0,.7)"; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(40 + i * 6, 76); g.lineTo(48 + i * 6, 120); g.stroke(); }
  });
  const exitBase = (g, w, h) => {
    wallpaper(g, w, h); R(g, 12, 0, 104, 128, "#120606"); R(g, 18, 4, 92, 124, "#3a0c0c");
    R(g, 26, 14, 76, 46, "#2a0808"); R(g, 26, 68, 76, 52, "#2a0808"); R(g, 26, 14, 76, 1, "#5a1a1a"); R(g, 26, 68, 76, 1, "#5a1a1a");
    g.fillStyle = "#7b2020"; g.font = "bold 18px 'Times New Roman'"; g.textAlign = "center"; g.fillText("13", 64, 42);
    R(g, 84, 58, 22, 32, "#1a1a1a"); R(g, 86, 60, 18, 7, "#0a0a0a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R(g, 87 + c * 6, 70 + r * 6, 4, 4, "#3a3a3a");
    hand(g, 48, 92, .8); grime(g, w, h, 500, .3);
  };
  T.exitOff = tex(exitBase);
  T.exitOn = tex(exitBase, g => { E(g, 101, 63, 2, 2, "#ff2020"); R(g, 86, 60, 15, 7, "rgba(40,255,80,.55)"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) R(g, 87 + c * 6, 70 + r * 6, 4, 4, "rgba(255,160,60,.5)"); });
  // Đồng hồ quả lắc (giờ ngẫu nhiên)
  T.clock = tex((g, w, h) => {
    wallpaper(g, w, h); R(g, 40, 6, 48, 122, "#2e1a0c"); R(g, 44, 10, 40, 118, "#3e2412"); clockFace(g, 64, 32, 17, S.ch, S.cm);
    R(g, 52, 56, 24, 60, "#160c06"); g.strokeStyle = "#8a7040"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(64, 58); g.lineTo(60, 100); g.stroke(); E(g, 60, 102, 5, 5, "#8a7040");
    g.strokeStyle = "rgba(255,255,255,.4)"; g.lineWidth = .8; g.beginPath(); g.moveTo(54, 20); g.lineTo(66, 34); g.lineTo(60, 46); g.stroke(); grime(g, w, h, 300, .4);
  });
  T.portrait = tex((g, w, h) => {
    wallpaper(g, w, h); R(g, 14, 10, 100, 80, "#6a5020"); R(g, 19, 15, 90, 70, "#1e1612");
    [[38, 40, 13, "#2a2a30"], [90, 40, 12, "#3a1a20"], [64, 54, 9, "#5a1010"]].forEach(([x, y, s, c]) => { E(g, x, y, s * .65, s * .8, "#b8a898"); R(g, x - s, y + s * .8, s * 2, 30, c); E(g, x - 2.5, y - 1, 1.2, 1.4, "#111"); E(g, x + 2.5, y - 1, 1.2, 1.4, "#111"); });
    g.strokeStyle = "#0a0505"; g.lineWidth = 1.4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(57 + rnd() * 4, 46 + rnd() * 3); g.lineTo(67 + rnd() * 4, 60 + rnd() * 3); g.stroke(); }
    grime(g, w, h, 400, .3);
  });
  T.fireplace = tex((g, w, h) => {
    wallpaper(g, w, h); for (let y = 30; y < 128; y += 8) for (let x = ((y / 8) % 2) * 8 + 6; x < 122; x += 16) R(g, x, y, 15, 7, rnd() < .5 ? "#4a2a20" : "#3e221a");
    R(g, 2, 24, 124, 8, "#2a1a0e"); R(g, 30, 60, 68, 68, "#050302"); E(g, 64, 124, 30, 6, "#3a3632"); E(g, 60, 121, 12, 3, "#5a5652");
    R(g, 70, 112, 10, 7, "#8a7a60"); R(g, 71, 113, 8, 5, "#2a2018"); stain(g, 64, 70, 30, "rgba(0,0,0,.6)"); grime(g, w, h, 600, .35);
  });
  const tvBase = (g, w, h) => { wallpaper(g, w, h); R(g, 20, 84, 88, 44, "#2a190e"); R(g, 24, 30, 80, 56, "#1a1a18"); R(g, 30, 36, 56, 44, "#151a18"); E(g, 94, 46, 3, 3, "#444"); E(g, 94, 58, 3, 3, "#444"); g.strokeStyle = "#333"; g.lineWidth = 1; g.beginPath(); g.moveTo(60, 30); g.lineTo(46, 8); g.moveTo(64, 30); g.lineTo(80, 10); g.stroke(); };
  T.tvOff = tex(tvBase);
  T.tvOn = tex(tvBase, g => { for (let i = 0; i < 700; i++) { const v = 120 + Math.random() * 135 | 0; g.fillStyle = `rgba(${v},${v},${v},.9)`; g.fillRect(30 + Math.random() * 56, 36 + Math.random() * 44, 1, 1); } g.fillStyle = "rgba(200,0,0,.9)"; g.font = "bold 8px 'Times New Roman'"; g.textAlign = "center"; g.fillText("MẸ ƠI", 58, 60); });
  T.wardrobe = tex((g, w, h) => {
    wallpaper(g, w, h, "rose"); R(g, 14, 4, 100, 124, "#2a190e"); R(g, 20, 12, 42, 110, "#1e1008"); R(g, 66, 12, 42, 110, "#1e1008");
    R(g, 24, 18, 34, 46, "rgba(255,220,160,.04)"); R(g, 70, 18, 34, 46, "rgba(255,220,160,.04)");
    R(g, 62, 12, 4, 110, "#000"); R(g, 55, 62, 3, 8, "#8a7040"); R(g, 70, 62, 3, 8, "#8a7040"); grime(g, w, h, 500, .4);
  }, g => { R(g, 63, 44, 1.6, 1, "rgba(255,255,255,.4)"); R(g, 63, 48, 1.6, 1, "rgba(255,255,255,.4)"); });
  T.tools = tex((g, w, h) => {
    concrete(g, w, h); R(g, 8, 10, 112, 80, "#5a4a30"); for (let y = 16; y < 88; y += 8) for (let x = 14; x < 118; x += 8) E(g, x, y, .9, .9, "#2a2016");
    R(g, 20, 22, 4, 30, "#555"); R(g, 14, 20, 16, 6, "#666"); g.fillStyle = "#777"; g.beginPath(); g.moveTo(40, 20); g.lineTo(70, 20); g.lineTo(70, 30); g.lineTo(40, 26); g.fill(); R(g, 70, 18, 8, 14, "#4a2a10");
    g.strokeStyle = "rgba(0,0,0,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(88, 20); g.lineTo(100, 78); g.stroke(); R(g, 8, 92, 112, 6, "#3a2a1a"); hand(g, 50, 70, .7); grime(g, w, h, 500, .35);
  });
  T.cabinet = tex((g, w, h) => {
    tiles(g, w, h, "#7a6e54", "#2e2a20", 16); grime(g, w, h, 1200, .4);
    R(g, 0, 8, w, 34, "#4a3a2a"); R(g, 63, 8, 2, 34, "#2a1e14"); R(g, 0, 60, w, 68, "#4a3a2a"); R(g, 0, 56, w, 6, "#2a1e14"); R(g, 63, 62, 2, 66, "#2a1e14");
    R(g, 54, 80, 3, 14, "#888"); R(g, 71, 80, 3, 14, "#888"); R(g, 54, 22, 3, 10, "#888"); R(g, 71, 22, 3, 10, "#888"); grime(g, w, h, 400, .4); hand(g, 90, 100, .6);
  });
  T.fridge = tex((g, w, h) => {
    tiles(g, w, h, "#7a6e54", "#2e2a20", 16); R(g, 24, 0, 80, 128, "#a8a498"); R(g, 24, 46, 80, 2, "#555"); R(g, 90, 16, 3, 22, "#555"); R(g, 90, 56, 3, 30, "#555");
    [[40, 20, "#a33"], [50, 30, "#36a"], [36, 70, "#3a3"]].forEach(([x, y, c]) => R(g, x, y, 6, 6, c)); R(g, 52, 60, 22, 28, "#ddd"); g.strokeStyle = "#222"; g.lineWidth = .8; g.strokeRect(56, 66, 6, 8); g.strokeRect(64, 70, 6, 10);
    grime(g, w, h, 1500, .35); stain(g, 40, 110, 18, "rgba(80,40,10,.6)"); hand(g, 70, 96, .9);
  });
  T.shelfStore = tex((g, w, h) => {
    concrete(g, w, h); R(g, 6, 6, 116, 116, "#2a1a0e");
    for (let s = 0; s < 4; s++) { const y = 10 + s * 28; R(g, 6, y + 24, 116, 4, "#1a0e06"); for (let x = 12; x < 116; x += 14) { R(g, x, y + 6, 10, 18, rnd() < .5 ? "rgba(70,90,50,.85)" : "rgba(90,70,40,.85)"); R(g, x, y + 4, 10, 3, "#555"); R(g, x + 2, y + 8, 2, 12, "rgba(255,255,255,.15)"); } }
    grime(g, w, h, 800, .4);
  });
  T.shelf = tex((g, w, h) => {
    R(g, 0, 0, w, h, "#2a1a0e");
    for (let s = 0; s < 4; s++) { const y = 6 + s * 30; let x = 6;
      while (x < w - 8) { const bw = 4 + rnd() * 8, bh = 17 + rnd() * 9; const c = ["#3a2418", "#24301f", "#30202e", "#1f2430", "#4a3a1a", "#5a1010"][Math.floor(rnd() * 6)]; R(g, x, y + 26 - bh, bw, bh, c); R(g, x + 1, y + 28 - bh, bw - 2, 1, "rgba(200,170,90,.35)"); R(g, x, y + 26 - bh, .8, bh, "rgba(255,255,255,.08)"); x += bw + .8; }
      R(g, 0, y + 26, w, 4, "#1a0e06"); R(g, 0, y + 26, w, .8, "#4a3018"); }
    E(g, 96, 76, 6, 6, "#c8beac"); R(g, 93, 74, 1.6, 1.6, "#000"); R(g, 98, 74, 1.6, 1.6, "#000"); grime(g, w, h, 600, .4);
  });
  T.desk = tex((g, w, h) => {
    wallpaper(g, w, h, "blue"); R(g, 4, 66, 120, 8, "#3a2414"); R(g, 4, 66, 120, 1, "#5a3a20"); R(g, 10, 74, 108, 54, "#2e1c10");
    R(g, 18, 80, 92, 20, "#3e2614"); R(g, 18, 104, 92, 20, "#3e2614"); R(g, 61, 88, 6, 4, "#8a7040"); R(g, 61, 112, 6, 4, "#8a7040"); R(g, 62, 93, 2.5, 4, "#111");
    R(g, 90, 40, 2, 26, "#333"); g.fillStyle = "#2a4a2a"; g.beginPath(); g.moveTo(80, 40); g.lineTo(102, 40); g.lineTo(96, 30); g.lineTo(86, 30); g.fill();
    R(g, 22, 52, 26, 14, "#ccc4b0"); R(g, 24, 54, 22, 1, "#555"); R(g, 24, 57, 18, 1, "#555"); R(g, 24, 60, 20, 1, "#555"); grime(g, w, h, 500, .35);
  });
  T.mirror = tex((g, w, h) => {
    tiles(g, w, h, "#78786f", "#33332e", 16); grime(g, w, h, 1000, .35);
    E(g, 64, 58, 36, 48, "#3a2a18"); E(g, 64, 58, 34, 46, "#5a4020");
    const gr = g.createLinearGradient(30, 10, 98, 110); gr.addColorStop(0, "#5a666e"); gr.addColorStop(.5, "#232e36"); gr.addColorStop(1, "#46515c");
    g.fillStyle = gr; g.beginPath(); g.ellipse(64, 58, 30, 42, 0, 0, 7); g.fill();
    g.save(); g.globalAlpha = .6; g.translate(128, 0); g.scale(-1, 1); clockFace(g, 64, 36, 10, S.ch, S.cm); g.restore();  // đồng hồ phản chiếu = giờ thật
    g.globalAlpha = .25; E(g, 80, 74, 7, 9, "#ddd"); R(g, 77, 72, 1.8, 3, "#000"); R(g, 82, 72, 1.8, 3, "#000"); g.globalAlpha = 1;
    g.strokeStyle = "rgba(220,220,220,.35)"; g.lineWidth = .8; g.beginPath(); g.moveTo(50, 30); g.lineTo(62, 58); g.lineTo(54, 90); g.moveTo(62, 58); g.lineTo(84, 70); g.stroke();
    R(g, 40, 100, 48, 10, "#a8a498"); hand(g, 40, 100, .7);
  });
  T.tub = tex((g, w, h) => {
    tiles(g, w, h, "#78786f", "#33332e", 16); grime(g, w, h, 1000, .35);
    R(g, 0, 70, w, 58, "#a8a498"); R(g, 0, 66, w, 8, "#c8c4b8"); R(g, 0, 62, w, 5, "#3a0303");
    for (let i = 0; i < 10; i++) drip(g, 6 + rnd() * 116, 68, 10 + rnd() * 40, "#6a0505"); grime(g, w, h, 300, .3);
    R(g, 100, 40, 3, 24, "#999"); R(g, 94, 40, 14, 3, "#999");
  });
  T.musicbox = tex((g, w, h) => {
    wallpaper(g, w, h, "rose"); R(g, 30, 78, 68, 6, "#3a2414"); R(g, 34, 84, 4, 44, "#2a1a0e"); R(g, 90, 84, 4, 44, "#2a1a0e");
    R(g, 44, 60, 40, 18, "#6a3a40"); R(g, 44, 60, 40, 2, "#8a5a60"); R(g, 46, 40, 36, 20, "#5a2a30"); E(g, 64, 54, 2, 4, "#ddd"); R(g, 63, 48, 2, 6, "#ddd"); E(g, 64, 47, 2, 2, "#ddd");
    R(g, 84, 66, 6, 2, "#8a7040"); grime(g, w, h, 400, .3);
  });
  const drawing = (idx, n) => tex((g, w, h) => {
    wallpaper(g, w, h, "blue"); R(g, 14, 12, 100, 78, "#dcd4c2"); R(g, 54, 8, 20, 8, "rgba(220,210,170,.7)");
    g.fillStyle = "#1a3a8a"; g.font = "bold 10px 'Comic Sans MS', cursive"; g.textAlign = "left"; g.fillText("Tranh " + idx, 18, 24);
    E(g, 100, 24, 7, 7, "#e0a020"); g.strokeStyle = "#e0a020"; g.lineWidth = 1; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(100 + Math.cos(k) * 9, 24 + Math.sin(k) * 9); g.lineTo(100 + Math.cos(k) * 13, 24 + Math.sin(k) * 13); g.stroke(); }
    R(g, 14, 82, 100, 8, "#3a8a3a");
    const cols = ["#c03030", "#3050c0", "#309030", "#a040a0", "#e08020", "#20a0a0", "#804020", "#d04080", "#606060"];
    const per = n > 5 ? Math.ceil(n / 2) : n;
    for (let i = 0; i < n; i++) {
      const row = i < per ? 0 : 1, col = row ? i - per : i, cnt = row ? n - per : per, x = 22 + (col + .5) * (84 / cnt), y = row ? 72 : 48;
      g.strokeStyle = cols[(i + idx * 2) % cols.length]; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y - 9, 3.5, 0, 7);
      g.moveTo(x, y - 5.5); g.lineTo(x, y + 4); g.moveTo(x - 4, y - 2); g.lineTo(x + 4, y - 2); g.moveTo(x, y + 4); g.lineTo(x - 3, y + 9); g.moveTo(x, y + 4); g.lineTo(x + 3, y + 9); g.stroke();
    }
    g.strokeStyle = "rgba(150,0,0,.5)"; g.lineWidth = .8; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(16 + rnd() * 90, 30 + rnd() * 40); g.lineTo(16 + rnd() * 90, 30 + rnd() * 40); g.stroke(); }
    grime(g, w, h, 400, .25);
  });
  T.d1 = drawing(1, S.counts[0]); T.d2 = drawing(2, S.counts[1]); T.d3 = drawing(3, S.counts[2]);
  T.dresser = tex((g, w, h) => {
    wallpaper(g, w, h, "blue"); E(g, 64, 28, 20, 24, "#3a2a18"); E(g, 64, 28, 17, 21, "#1a2026");
    R(g, 14, 62, 100, 66, "#3a2414"); R(g, 14, 60, 100, 4, "#4a3020"); for (let i = 0; i < 3; i++) { R(g, 20, 70 + i * 19, 88, 16, "#2e1c10"); R(g, 60, 76 + i * 19, 8, 3, "#8a7040"); }
    R(g, 46, 48, 36, 12, "#8a6a2a"); R(g, 46, 46, 36, 3, "#aa8a3a"); R(g, 60, 52, 8, 6, "#3a2a10"); g.fillStyle = "#ddd"; g.font = "bold 4px Arial"; g.textAlign = "center"; g.fillText("0 0 0", 64, 56.5);
  });
  const fuseBase = (g, w, h) => {
    concrete(g, w, h, 1); R(g, 28, 34, 72, 80, "#5a5c58"); R(g, 32, 38, 64, 72, "#2a2c2a");
    for (let i = 0; i < 6; i++) R(g, 38 + (i % 3) * 18, 46 + Math.floor(i / 3) * 24, 12, 16, i === 4 ? "#111" : "#8a8a84");
    g.fillStyle = "#d0a020"; g.beginPath(); g.moveTo(64, 92); g.lineTo(72, 106); g.lineTo(56, 106); g.fill(); g.fillStyle = "#000"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText("!", 64, 105);
    g.strokeStyle = "#222"; g.lineWidth = 3; g.beginPath(); g.moveTo(28, 50); g.lineTo(28, 0); g.stroke();
  };
  T.fuseOff = tex(fuseBase); T.fuseOn = tex((g, w, h) => { fuseBase(g, w, h); R(g, 74, 70, 12, 16, "#c9a227"); }, g => { E(g, 92, 42, 2, 2, "#30ff60"); });
  T.boiler = tex((g, w, h) => {
    concrete(g, w, h, 1); E(g, 64, 76, 40, 50, "#4a2e1c"); E(g, 60, 70, 34, 44, "#5a3a24"); for (let i = 0; i < 40; i++) E(g, 30 + rnd() * 70, 40 + rnd() * 80, 1 + rnd() * 4, 1 + rnd() * 3, "rgba(120,60,20,.6)");
    E(g, 64, 60, 9, 9, "#ccc"); E(g, 64, 60, 7, 7, "#eee"); g.strokeStyle = "#a00"; g.lineWidth = 1; g.beginPath(); g.moveTo(64, 60); g.lineTo(69, 56); g.stroke();
    R(g, 54, 94, 20, 14, "#1a0a04"); stain(g, 64, 100, 10, "rgba(255,80,0,.12)"); grime(g, w, h, 500, .35);
  });
  const crateBase = (g, w, h, open) => {
    concrete(g, w, h); R(g, 16, 44, 96, 84, "#5a4420"); for (let y = 44; y < 128; y += 14) { R(g, 16, y, 96, 1.5, "#2a1e0c"); } R(g, 16, 44, 6, 84, "#3a2a12"); R(g, 106, 44, 6, 84, "#3a2a12");
    g.strokeStyle = "#3a2a12"; g.lineWidth = 5; g.beginPath(); g.moveTo(20, 48); g.lineTo(108, 124); g.stroke();
    g.fillStyle = "rgba(20,10,0,.7)"; g.font = "bold 12px 'Times New Roman'"; g.textAlign = "center"; g.fillText("DỄ VỠ", 64, 92);
    if (open) { R(g, 18, 36, 92, 12, "#0a0602"); R(g, 30, 24, 70, 8, "#5a4420"); }
  };
  T.crate = tex((g, w, h) => crateBase(g, w, h, 0)); T.crateOpen = tex((g, w, h) => crateBase(g, w, h, 1));
  const altarBase = (g, w, h, doll) => {
    concrete(g, w, h); R(g, 10, 70, 108, 58, "#3a0808"); R(g, 10, 68, 108, 4, "#5a1010"); for (let x = 14; x < 114; x += 10) R(g, x, 100, 4, 28, "rgba(0,0,0,.25)");
    R(g, 46, 30, 36, 38, "#2a1a0a"); R(g, 50, 34, 28, 30, "#ccc4b0"); E(g, 64, 46, 7, 9, "#b8a898"); R(g, 56, 38, 16, 8, "#1a1008"); R(g, 61, 45, 1.4, 1.4, "#000"); R(g, 66, 45, 1.4, 1.4, "#000"); R(g, 50, 34, 28, 30, "rgba(0,0,0,.15)");
    R(g, 20, 52, 6, 16, "#d8d0b8"); R(g, 102, 52, 6, 16, "#d8d0b8"); R(g, 34, 58, 4, 10, "#d8d0b8"); R(g, 90, 58, 4, 10, "#d8d0b8");
    for (let i = 0; i < 3; i++) R(g, 60 + i * 4, 56, 1, 12, "#5a4a2a");
    if (doll) { E(g, 86, 76, 7, 7, "#d8d0c4"); R(g, 81, 82, 10, 14, "#eee"); E(g, 82, 72, 4, 2.5, "#c02020"); R(g, 83, 75, 1.6, 1.6, "#000"); R(g, 88, 75, 1.6, 1.6, "#000"); }
    grime(g, w, h, 400, .3);
  };
  const altarEmit = g => [[23, 49], [105, 49], [36, 55], [92, 55]].forEach(([x, y]) => E(g, x, y, 1.6, 3.2, "#ffb040"));
  T.altar = tex((g, w, h) => altarBase(g, w, h, 0), altarEmit); T.altarDoll = tex((g, w, h) => altarBase(g, w, h, 1), altarEmit);

  // Sàn & trần
  T.wood = tex((g, w, h) => wood(g, w, h)); T.woodB = tex((g, w, h) => { wood(g, w, h); E(g, 60, 70, 40, 26, "#2a0303"); E(g, 56, 66, 26, 14, "#420606"); for (let i = 0; i < 12; i++) E(g, rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 3, "#3a0404"); });
  T.woodDk = tex((g, w, h) => wood(g, w, h, "#2e2018"));
  T.carpet = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a0e0e"); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = "#2a0808"; g.beginPath(); g.moveTo(x + 16, y + 4); g.lineTo(x + 28, y + 16); g.lineTo(x + 16, y + 28); g.lineTo(x + 4, y + 16); g.fill(); E(g, x + 16, y + 16, 3, 3, "#5a2a10"); } grime(g, w, h, 1800, .4); });
  T.carpetB = tex((g, w, h) => { R(g, 0, 0, w, h, "#1e2838"); for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) if ((x + y) % 32 === 0) R(g, x + 6, y + 6, 4, 4, "#2a3850"); grime(g, w, h, 1800, .45); stain(g, 40, 80, 30, "rgba(40,0,0,.5)"); });
  T.bathF = tex((g, w, h) => { for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) R(g, x, y, 16, 16, ((x + y) / 16) % 2 ? "#56564f" : "#2f2f2b"); grime(g, w, h, 1500, .4); stain(g, 70, 50, 30, "rgba(80,0,0,.55)"); });
  T.kitF = tex((g, w, h) => { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) R(g, x, y, 32, 32, ((x + y) / 32) % 2 ? "#6a6250" : "#25211a"); grime(g, w, h, 2000, .4); });
  T.marble = tex((g, w, h) => { for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) R(g, x, y, 64, 64, ((x + y) / 64) % 2 ? "#6a665e" : "#1e1c1a"); g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = .6; for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.bezierCurveTo(rnd() * w, rnd() * h, rnd() * w, rnd() * h, rnd() * w, rnd() * h); g.stroke(); } grime(g, w, h, 1500, .35); });
  T.concF = tex((g, w, h) => concrete(g, w, h)); T.concFB = tex((g, w, h) => { concrete(g, w, h); E(g, 64, 64, 36, 22, "#2a0303"); for (let i = 0; i < 6; i++) hand(g, 30 + rnd() * 70, 30 + rnd() * 70, .5, "rgba(70,0,0,.7)"); });
  const ritualQ = (qx, qy) => tex((g, w, h) => {
    concrete(g, w, h); const cx = qx ? 0 : 128, cy = qy ? 0 : 128; g.strokeStyle = "#6a0808"; g.lineWidth = 3;
    [110, 96].forEach(r => { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); });
    g.lineWidth = 2.5; g.beginPath(); for (let k = 0; k <= 5; k++) { const a = -Math.PI / 2 + k * 4 * Math.PI / 5; const x = cx + Math.cos(a) * 96, y = cy + Math.sin(a) * 96; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  });
  T.rq = [ritualQ(0, 0), ritualQ(1, 0), ritualQ(0, 1), ritualQ(1, 1)];
  T.ceil = tex((g, w, h) => { R(g, 0, 0, w, h, "#2c2924"); grime(g, w, h, 2000, .3); for (let i = 0; i < 3; i++) { const x = rnd() * w, y = rnd() * h, r = 15 + rnd() * 25; g.strokeStyle = "rgba(80,60,20,.5)"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); stain(g, x, y, r, "rgba(60,45,15,.35)"); } });
  T.ceilBeam = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a2622"); grime(g, w, h, 2000, .3); R(g, 0, 56, w, 16, "#24180e"); R(g, 0, 56, w, 1.5, "#3a2818"); stain(g, 30, 30, 20, "rgba(60,45,15,.35)"); });
  T.ceilB = tex((g, w, h) => { concrete(g, w, h); R(g, 40, 0, 8, h, "#3a3026"); R(g, 40, 0, 2, h, "#5a4836"); R(g, 90, 0, 5, h, "#2a2620"); });

  // Sprite
  T.ghost = tex((g, w, h) => {
    g.fillStyle = "#050505"; g.beginPath(); g.moveTo(18, 22); g.quadraticCurveTo(32, 0, 46, 22); g.lineTo(52, 80); g.lineTo(12, 80); g.closePath(); g.fill();
    g.fillStyle = "#c9c4b8"; g.beginPath(); g.moveTo(21, 44); g.lineTo(43, 44); g.lineTo(52, 118); for (let x = 52; x > 12; x -= 4) g.lineTo(x, 112 + rnd() * 14); g.lineTo(12, 118); g.closePath(); g.fill();
    for (let i = 0; i < 8; i++) R(g, 18 + rnd() * 28, 50 + rnd() * 60, .8, 10 + rnd() * 20, "rgba(0,0,0,.15)");
    grime(g, w, h, 400, .35); stain(g, 32, 66, 12, "rgba(120,0,0,.85)"); drip(g, 30, 72, 30, "#5a0000"); drip(g, 36, 70, 22, "#5a0000");
    g.strokeStyle = "#cfc8bc"; g.lineWidth = 3.2; g.lineCap = "round"; g.beginPath(); g.moveTo(21, 48); g.lineTo(11, 102); g.moveTo(43, 48); g.lineTo(53, 102); g.stroke();
    g.lineWidth = .9; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(11, 102); g.lineTo(9 + i * 2, 113); g.moveTo(53, 102); g.lineTo(55 + i * 2, 113); g.stroke(); }
    E(g, 32, 30, 10, 13, "#ddd5c8"); E(g, 28, 28, 3, 4, "#000"); E(g, 36, 28, 3, 4, "#000"); E(g, 32, 38, 2.5, 5, "#000");
    g.strokeStyle = "#050505"; g.lineWidth = 1.8; [23, 25, 39, 41, 30].forEach((x, i) => { g.beginPath(); g.moveTo(x, 16); g.lineTo(x + (i % 2 ? 1 : -1), 46 + i * 3); g.stroke(); });
    E(g, 32, 18, 12, 6, "#050505");
  }, g => { R(g, 27, 28, 2, 2, "#ff3030"); R(g, 35, 28, 2, 2, "#ff3030"); }, 64, 128);
  T.doll = tex((g, w, h) => { g.fillStyle = "#4a0c0c"; g.beginPath(); g.moveTo(10, 22); g.lineTo(22, 22); g.lineTo(28, 46); g.lineTo(4, 46); g.fill(); E(g, 16, 14, 9, 9, "#d8d0c4"); g.fillStyle = "#2a1a0e"; g.beginPath(); g.arc(16, 9, 9, Math.PI, 0); g.fill(); R(g, 12, 13, 3, 3, "#000"); R(g, 18, 13, 3, 3, "#000"); R(g, 14, 19, 4, 1, "#000"); g.strokeStyle = "#333"; g.lineWidth = .6; g.beginPath(); g.moveTo(20, 7); g.lineTo(17, 13); g.lineTo(19, 20); g.stroke(); drip(g, 13, 16, 6, "#700"); }, null, 32, 48);
  T.dollLinh = tex((g, w, h) => { g.fillStyle = "#e8e4dc"; g.beginPath(); g.moveTo(10, 22); g.lineTo(22, 22); g.lineTo(28, 46); g.lineTo(4, 46); g.fill(); E(g, 16, 14, 9, 9, "#e0d8cc"); g.fillStyle = "#4a2a10"; g.beginPath(); g.arc(16, 10, 9, Math.PI, 0); g.fill(); E(g, 9, 6, 5, 3, "#c02020"); E(g, 23, 6, 5, 3, "#c02020"); R(g, 12, 13, 2.5, 2.5, "#000"); R(g, 18, 13, 2.5, 2.5, "#000"); g.strokeStyle = "#a33"; g.lineWidth = .8; g.beginPath(); g.arc(16, 18, 3, .2, 2.9); g.stroke(); }, g => { g.globalAlpha = .06; E(g, 16, 26, 14, 20, "#fff"); g.globalAlpha = 1; }, 32, 48);
  T.candle = tex((g, w, h) => { R(g, 5, 14, 6, 18, "#d8d0b8"); R(g, 4, 28, 8, 4, "#b8b098"); R(g, 7.5, 11, 1, 3, "#222"); R(g, 6, 16, 1, 6, "#eee8d8"); }, g => E(g, 8, 8, 2.5, 5, "#ffb040"), 16, 32);
  T.battery = tex((g, w, h) => { R(g, 10, 8, 12, 22, "#c9a227"); R(g, 10, 14, 12, 5, "#222"); R(g, 13, 5, 6, 3, "#999"); R(g, 11, 9, 2, 20, "rgba(255,255,255,.3)"); }, g => { g.globalAlpha = .45; R(g, 10, 8, 12, 22, "#c9a227"); g.globalAlpha = 1; }, 32, 32);
  T.bulbOff = tex((g, w, h) => { R(g, 7.5, 0, 1, 34, "#222"); R(g, 6, 34, 4, 4, "#555"); E(g, 8, 41, 4, 5, "#888a80"); }, null, 16, 48);
  T.bulbOn = tex((g, w, h) => { R(g, 7.5, 0, 1, 34, "#222"); R(g, 6, 34, 4, 4, "#555"); }, g => E(g, 8, 41, 4, 5, "#ffe0a0"), 16, 48);
  T.hangDoll = tex((g, w, h) => { R(g, 15.5, 0, 1, 50, "#8a7a5a"); g.fillStyle = "#4a0c0c"; g.beginPath(); g.moveTo(10, 62); g.lineTo(22, 62); g.lineTo(26, 86); g.lineTo(6, 86); g.fill(); E(g, 16, 55, 8, 8, "#d8d0c4"); R(g, 12, 53, 3, 3, "#000"); R(g, 18, 53, 3, 3, "#000"); R(g, 10, 86, 2, 8, "#d8d0c4"); R(g, 20, 86, 2, 8, "#d8d0c4"); drip(g, 13, 57, 8, "#700"); }, null, 32, 96);
  T.sofa = tex((g, w, h) => { R(g, 6, 8, 116, 34, "#2e3a2a"); for (let x = 16; x < 116; x += 16) for (let y = 14; y < 40; y += 12) E(g, x, y, 1.2, 1.2, "#1a2418"); R(g, 0, 22, 16, 34, "#283224"); R(g, 112, 22, 16, 34, "#283224"); R(g, 14, 38, 100, 18, "#34402e"); R(g, 63, 38, 2, 18, "#1a2418"); R(g, 6, 56, 116, 4, "#1a1410"); R(g, 10, 60, 4, 4, "#1a1410"); R(g, 114, 60, 4, 4, "#1a1410"); stain(g, 50, 46, 10, "rgba(60,0,0,.7)"); grime(g, w, h, 600, .3); }, null, 128, 64);
  T.rockChair = tex((g, w, h) => { g.strokeStyle = "#3a2414"; g.lineWidth = 3; g.beginPath(); g.moveTo(14, 4); g.lineTo(14, 66); g.moveTo(50, 4); g.lineTo(50, 66); g.stroke(); for (let y = 8; y < 44; y += 7) R(g, 14, y, 36, 2.5, "#3a2414"); R(g, 10, 50, 44, 5, "#3a2414"); g.lineWidth = 2.5; g.beginPath(); g.moveTo(10, 55); g.lineTo(10, 84); g.moveTo(54, 55); g.lineTo(54, 84); g.stroke(); g.beginPath(); g.arc(32, 50, 40, 1.05, 2.1); g.stroke(); R(g, 16, 20, 30, 30, "rgba(90,60,70,.8)"); for (let i = 0; i < 6; i++) R(g, 18 + i * 5, 48, 1, 8, "rgba(90,60,70,.8)"); }, null, 64, 96);
  T.table = tex((g, w, h) => { R(g, 4, 18, 120, 6, "#2a1a0e"); R(g, 2, 22, 124, 26, "#c8c0ac"); for (let x = 2; x < 126; x += 8) R(g, x, 44, 6, 4 + rnd() * 4, "#b8b09c"); R(g, 10, 48, 4, 16, "#2a1a0e"); R(g, 114, 48, 4, 16, "#2a1a0e"); E(g, 40, 18, 10, 3, "#ddd"); E(g, 88, 18, 10, 3, "#ddd"); R(g, 62, 4, 4, 14, "#8a7040"); stain(g, 70, 32, 12, "rgba(90,0,0,.6)"); grime(g, w, h, 400, .3); }, g => E(g, 64, 2, 2, 3.5, "#ffb040"), 128, 64);
  T.chair = tex((g, w, h) => { R(g, 8, 2, 4, 76, "#2e1c10"); R(g, 36, 2, 4, 76, "#2e1c10"); R(g, 8, 2, 32, 4, "#2e1c10"); for (let x = 14; x < 36; x += 6) R(g, x, 6, 2.5, 36, "#2e1c10"); R(g, 4, 42, 40, 6, "#3a2414"); R(g, 6, 48, 3, 30, "#2e1c10"); R(g, 39, 48, 3, 30, "#2e1c10"); }, null, 48, 80);
  T.car = tex((g, w, h) => { g.fillStyle = "#23282a"; g.beginPath(); g.moveTo(4, 46); g.lineTo(8, 30); g.lineTo(30, 26); g.lineTo(42, 10); g.lineTo(90, 10); g.lineTo(104, 26); g.lineTo(124, 32); g.lineTo(124, 50); g.lineTo(4, 50); g.fill(); R(g, 46, 14, 20, 12, "#0a0c0e"); R(g, 70, 14, 22, 12, "#0a0c0e"); E(g, 28, 52, 10, 10, "#0a0a0a"); E(g, 100, 54, 10, 8, "#0a0a0a"); E(g, 28, 52, 4, 4, "#444"); R(g, 116, 34, 6, 5, "#666"); grime(g, w, h, 900, .4); for (let i = 0; i < 30; i++) E(g, 10 + rnd() * 110, 20 + rnd() * 30, 1 + rnd() * 2, 1, "rgba(90,50,20,.6)"); E(g, 56, 18, 4, 5, "rgba(220,210,200,.25)"); }, null, 128, 64);
  T.boxes = tex((g, w, h) => { [[4, 30, 34, 34], [30, 34, 30, 30], [12, 4, 30, 28]].forEach(([x, y, bw, bh]) => { R(g, x, y, bw, bh, "#5a4420"); R(g, x, y, bw, 2, "#6a5430"); R(g, x + bw / 2 - 2, y, 4, bh, "rgba(200,180,120,.3)"); g.strokeStyle = "#2a1e0c"; g.lineWidth = .8; g.strokeRect(x, y, bw, bh); }); grime(g, w, h, 300, .4); }, null, 64, 64);
  T.bed = tex((g, w, h) => { R(g, 2, 2, 20, 58, "#3a2414"); R(g, 106, 22, 20, 38, "#3a2414"); R(g, 14, 26, 104, 22, "#9a9484"); R(g, 16, 22, 24, 10, "#c8c0b0"); R(g, 40, 28, 76, 20, "#5a3a40"); stain(g, 70, 36, 16, "rgba(80,0,0,.75)"); R(g, 14, 48, 104, 6, "#2a1a0e"); grime(g, w, h, 500, .35); }, null, 128, 64);
  T.horse = tex((g, w, h) => { g.strokeStyle = "#5a1010"; g.lineWidth = 3; g.beginPath(); g.arc(32, 20, 34, 1.15, 2.0); g.stroke(); R(g, 16, 30, 32, 14, "#c8b8a0"); R(g, 40, 14, 10, 22, "#c8b8a0"); E(g, 50, 14, 8, 6, "#c8b8a0"); R(g, 18, 44, 4, 12, "#c8b8a0"); R(g, 42, 44, 4, 12, "#c8b8a0"); E(g, 52, 12, 1.5, 1.5, "#000"); R(g, 38, 8, 6, 18, "#3a1a0a"); R(g, 12, 32, 6, 14, "#3a1a0a"); grime(g, w, h, 300, .4); }, g => E(g, 52, 12, 1, 1, "#ff2020"), 64, 64);
  T.darkwood = tex((g, w, h) => wood(g, w, h, "#2a1c12"));
  T.crateBox = tex((g, w, h) => { R(g, 0, 0, w, h, "#5a4420"); for (let y = 0; y < h; y += 21) { R(g, 0, y, w, 1.5, "#2a1e0c"); R(g, 0, y + 1.5, w, 1, "rgba(255,220,150,.12)"); } R(g, 0, 0, 8, h, "#3e2e14"); R(g, w - 8, 0, 8, h, "#3e2e14"); R(g, 0, 0, w, 8, "#3e2e14"); R(g, 0, h - 8, w, 8, "#3e2e14"); g.strokeStyle = "#3e2e14"; g.lineWidth = 7; g.beginPath(); g.moveTo(6, 6); g.lineTo(122, 122); g.stroke(); for (const [x, y] of [[4, 4], [124, 4], [4, 124], [124, 124]]) E(g, x, y, 1.4, 1.4, "#888"); grime(g, w, h, 900, .4); });
  T.cloth = tex((g, w, h) => { R(g, 0, 0, w, h, "#c4bca6"); for (let x = 0; x < w; x += 10) R(g, x, 0, 3, h, "rgba(0,0,0,.06)"); grime(g, w, h, 1500, .3); stain(g, 70, 60, 26, "rgba(100,0,0,.7)"); stain(g, 30, 90, 14, "rgba(70,40,10,.6)"); for (let i = 0; i < 6; i++) drip(g, 50 + rnd() * 40, 70, 10 + rnd() * 40, "#5a0505"); });
  T.sheet = tex((g, w, h) => { R(g, 0, 0, w, h, "#8a8478"); for (let i = 0; i < 14; i++) { g.strokeStyle = "rgba(0,0,0,.15)"; g.lineWidth = 2; g.beginPath(); g.moveTo(rnd() * w, 0); g.bezierCurveTo(rnd() * w, 40, rnd() * w, 90, rnd() * w, h); g.stroke(); } grime(g, w, h, 1500, .3); stain(g, 64, 64, 40, "rgba(90,0,0,.75)"); stain(g, 80, 50, 18, "rgba(40,0,0,.8)"); });
  // ---- Vật liệu cho mô hình 3D ----
  const mat = (base, n = 1200, a = .3, extra) => tex((g, w, h) => { R(g, 0, 0, w, h, base); grime(g, w, h, n, a); if (extra) extra(g, w, h); });
  T.porcelain = mat("#ddd4c6", 300, .15, (g) => { g.strokeStyle = "rgba(60,40,30,.5)"; g.lineWidth = .6; g.beginPath(); g.moveTo(30, 0); g.lineTo(50, 40); g.lineTo(44, 70); g.stroke(); });
  T.dollFace = tex((g, w, h) => { R(g, 0, 0, w, h, "#e0d8cc"); R(g, 0, 0, w, 22, "#3a2210"); E(g, 42, 58, 13, 15, "#111"); E(g, 86, 58, 13, 15, "#111"); E(g, 45, 54, 3, 3, "#666"); E(g, 89, 54, 3, 3, "#666");
    E(g, 30, 84, 10, 6, "rgba(200,80,90,.4)"); E(g, 98, 84, 10, 6, "rgba(200,80,90,.4)"); R(g, 54, 92, 20, 3, "#6a1010"); g.strokeStyle = "#333"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(90, 20); g.lineTo(80, 50); g.lineTo(96, 80); g.stroke(); drip(g, 40, 72, 30, "#700"); grime(g, w, h, 300, .2); });
  T.hair = mat("#0a0806", 600, .5, g => { for (let x = 0; x < 128; x += 3) R(g, x, 0, 1, 128, "rgba(60,50,40,.35)"); });
  T.redcloth = mat("#5a0a0a", 1500, .35, g => { for (let y = 0; y < 128; y += 6) R(g, 0, y, 128, 1, "rgba(0,0,0,.15)"); });
  T.whiteDress = mat("#d8d2c4", 800, .25, g => { stain(g, 60, 70, 20, "rgba(110,90,60,.5)"); for (let y = 0; y < 128; y += 10) R(g, 0, y, 128, 1, "rgba(0,0,0,.08)"); });
  T.dress = mat("#bdb6aa", 1500, .3, g => { stain(g, 64, 40, 30, "rgba(120,0,0,.85)"); for (let i = 0; i < 14; i++) drip(g, 40 + rnd() * 50, 50, 20 + rnd() * 70, "#5a0000"); for (let x = 0; x < 128; x += 8) R(g, x, 0, 2, 128, "rgba(0,0,0,.1)"); });
  T.skin = mat("#cfc6b8", 600, .2, g => { for (let i = 0; i < 6; i++) R(g, rnd() * 128, 0, 1, 128, "rgba(60,70,110,.25)"); });
  T.ghostFace = tex((g, w, h) => {
    R(g, 0, 0, w, h, "#d6cec2"); R(g, 0, 0, w, 32, "#050403"); R(g, 0, 0, 38, h, "#050403"); R(g, 90, 0, 38, h, "#050403");
    E(g, 56, 60, 6, 8, "#000"); E(g, 72, 60, 6, 8, "#000"); E(g, 64, 84, 4.5, 11, "#000"); drip(g, 55, 66, 18, "#6a0000"); drip(g, 73, 66, 24, "#6a0000");
    g.strokeStyle = "rgba(70,80,120,.4)"; g.lineWidth = .6; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(40 + rnd() * 50, 35 + rnd() * 60); g.lineTo(40 + rnd() * 50, 35 + rnd() * 60); g.stroke(); }
    for (let x = 38; x < 92; x += 4) if (x < 50 || x > 78) R(g, x, 30, 1.5, 30 + rnd() * 60, "#050403");
  }, g => { E(g, 56, 61, 1.6, 1.6, "#ff2020"); E(g, 72, 61, 1.6, 1.6, "#ff2020"); });
  T.wax = mat("#d8d0b8", 200, .1, g => { for (let i = 0; i < 6; i++) R(g, rnd() * 128, 0, 6, 30 + rnd() * 60, "#e8e0cc"); });
  T.flame = tex((g, w, h) => R(g, 0, 0, w, h, "#ffb040"), g => R(g, 0, 0, 128, 128, "#ffc060"));
  T.metal = mat("#5a5c5e", 2000, .3, g => { for (let y = 0; y < 128; y += 2) R(g, 0, y, 128, 1, `rgba(255,255,255,${rnd() * .05})`); for (let i = 0; i < 8; i++) stain(g, rnd() * 128, rnd() * 128, 10 + rnd() * 15, "rgba(110,50,15,.5)"); });
  T.lampShade = mat("#2a4a2a", 800, .3); T.paperSheet = mat("#cfc6ae", 600, .2, g => { for (let y = 20; y < 110; y += 8) R(g, 14, y, 80 + rnd() * 20, 1, "#555"); });
  T.enamel = mat("#b4b0a4", 1500, .3, g => { for (let i = 0; i < 5; i++) stain(g, rnd() * 128, rnd() * 128, 12, "rgba(110,70,20,.45)"); });
  T.sinkTop = mat("#b4b0a4", 800, .3, g => { E(g, 64, 64, 40, 30, "#6a665c"); E(g, 64, 64, 6, 6, "#222"); stain(g, 60, 60, 20, "rgba(90,0,0,.7)"); });
  T.bloodWater = mat("#2a0202", 400, .3, g => { E(g, 64, 64, 60, 50, "#3a0404"); for (let i = 0; i < 5; i++) { g.strokeStyle = "rgba(120,20,20,.4)"; g.lineWidth = 1; g.beginPath(); g.arc(64, 64, 10 + i * 9, 0, 7); g.stroke(); } R(g, 0, 0, 128, 10, "#c8c4b8"); R(g, 0, 118, 128, 10, "#c8c4b8"); R(g, 0, 0, 10, 128, "#c8c4b8"); R(g, 118, 0, 10, 128, "#c8c4b8"); });
  T.brass = mat("#7a5e2a", 800, .3, g => { for (let y = 0; y < 128; y += 3) R(g, 0, y, 128, 1, "rgba(255,220,120,.08)"); });
  T.brick = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a1a14"); for (let y = 0; y < h; y += 8) for (let x = ((y / 8) % 2) * 8 - 8; x < w; x += 16) R(g, x + .8, y + .8, 14.4, 6.4, rnd() < .5 ? "#4a2a20" : "#3e221a"); grime(g, w, h, 1200, .4); stain(g, 64, 20, 40, "rgba(0,0,0,.6)"); });
  T.plastic = mat("#1c1c1a", 600, .3); T.rust = mat("#4a2e1c", 2500, .35, g => { for (let i = 0; i < 40; i++) E(g, rnd() * 128, rnd() * 128, 2 + rnd() * 6, 1 + rnd() * 4, "rgba(130,60,20,.55)"); for (let y = 0; y < 128; y += 32) R(g, 0, y, 128, 3, "#2a1a10"); });
  T.gauge = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3a3a"); E(g, 64, 64, 58, 58, "#ddd"); g.strokeStyle = "#a00"; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 64); g.lineTo(100, 34); g.stroke(); });
  T.doorRed = mat("#3a0c0c", 1200, .35); T.stairTread = tex((g, w, h) => { wood(g, w, h, "#3a281a"); R(g, 0, 0, w, 10, "#1e140c"); R(g, 0, 118, w, 10, "#4a3424"); });
  T.dark = mat("#060505", 400, .5); T.counter = mat("#2a2622", 1500, .35, g => stain(g, 70, 60, 25, "rgba(90,0,0,.6)"));
  T.fabric = mat("#2e3a2a", 2500, .3, g => { for (let x = 0; x < 128; x += 4) R(g, x, 0, 1, 128, "rgba(0,0,0,.12)"); stain(g, 50, 60, 24, "rgba(60,0,0,.75)"); for (let i = 0; i < 4; i++) R(g, rnd() * 100, rnd() * 100, 10, 2, "#1a1208"); });
  T.shawl = mat("#5a3c46", 1200, .3, g => { for (let y = 0; y < 128; y += 8) R(g, 0, y, 128, 2, "rgba(0,0,0,.15)"); });
  T.carPaint = mat("#22282a", 2500, .35, g => { for (let i = 0; i < 40; i++) E(g, rnd() * 128, rnd() * 128, 1 + rnd() * 5, 1 + rnd() * 3, "rgba(110,55,20,.6)"); });
  T.carWindow = tex((g, w, h) => { R(g, 0, 0, w, h, "#22282a"); R(g, 8, 10, 112, 100, "#07090b"); R(g, 62, 10, 4, 100, "#22282a"); stain(g, 40, 40, 30, "rgba(200,200,200,.08)"); E(g, 90, 50, 8, 10, "rgba(220,210,200,.12)"); grime(g, w, h, 800, .3); });
  T.tire = mat("#0e0e0e", 1500, .4, g => { for (let y = 0; y < 128; y += 6) R(g, 0, y, 128, 2, "#1a1a1a"); });
  T.hubcap = tex((g, w, h) => { R(g, 0, 0, w, h, "#0e0e0e"); E(g, 64, 64, 34, 34, "#4a4a48"); E(g, 64, 64, 12, 12, "#2a2a2a"); grime(g, w, h, 500, .4); });
  T.headlight = mat("#8a8470", 200, .3); T.horseWood = mat("#c4b49a", 1500, .35, g => { for (let i = 0; i < 20; i++) E(g, rnd() * 128, rnd() * 128, 2 + rnd() * 5, 2 + rnd() * 3, "#5a3a20"); });
  T.redEye = tex((g, w, h) => R(g, 0, 0, w, h, "#a00"), g => R(g, 0, 0, 128, 128, "#ff2020"));
  T.battMat = tex((g, w, h) => { R(g, 0, 0, w, h, "#c9a227"); R(g, 0, 40, w, 30, "#1a1a1a"); }, g => { g.globalAlpha = .35; R(g, 0, 0, 128, 128, "#c9a227"); });
  T.rope = mat("#6a5a3a", 400, .3);
  T.bulbOn = tex((g, w, h) => R(g, 0, 0, w, h, "#ffe8b0"), g => R(g, 0, 0, 128, 128, "#ffe0a0")); T.bulbOff = mat("#6a6a60", 300, .3);

}
