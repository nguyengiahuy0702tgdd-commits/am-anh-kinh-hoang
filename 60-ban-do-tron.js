// =====================================================================
//  60. BẢN ĐỒ TRÒN NHỎ (map Bệnh Viện Dị Nhân)
//  Góc trên bên trái: bản đồ tròn xoay theo hướng nhìn (phía trước luôn ở trên),
//  mũi tên trắng là bạn, chấm vàng là mục tiêu gợi ý (nếu đang bật mũi tên H),
//  ▲▼ là cầu thang. Dưới bản đồ ghi tầng + tên khu vực bạn đang đứng.
// =====================================================================
const MM = { el: null, cv: null, ctx: null, base: null, baseF: null, baseT: 0, S: 7, R: 86, on: 0 };
const MM_MAPS = new Set(["house", "forest", "castle", "cemetery", "factory", "hospital"]);
function mmUI() {
  if (MM.el) return;
  const st = document.createElement("style");
  st.textContent = `#miniMap{position:fixed;left:22px;top:20px;z-index:24;width:${MM.R * 2 + 8}px;pointer-events:none;opacity:0;transition:opacity .4s;font-family:var(--body)}#miniMap.on{opacity:1}
#miniMap canvas{display:block;width:${MM.R * 2 + 8}px;height:${MM.R * 2 + 8}px;border-radius:50%;box-shadow:0 0 0 2px rgba(217,204,178,.28),0 0 0 5px rgba(10,8,8,.7),0 10px 26px rgba(0,0,0,.7)}
#miniMap .cap{margin-top:9px;text-align:center;font-size:12.5px;line-height:1.3;color:#e8dcc4;text-shadow:0 1px 3px #000;letter-spacing:.04em}#miniMap .cap b{display:block;font-size:11px;color:var(--blood2,#c8553a);letter-spacing:.12em;font-weight:600}
#miniMap .n{position:absolute;left:50%;top:-2px;transform:translateX(-50%);font:700 11px/1 sans-serif;color:#d9ccb2;opacity:.0}`;
  document.head.appendChild(st);
  MM.el = Object.assign(document.createElement("div"), { id: "miniMap" });
  MM.cv = document.createElement("canvas"); MM.cv.width = MM.cv.height = (MM.R * 2 + 8) * 2;
  MM.cap = Object.assign(document.createElement("div"), { className: "cap" });
  MM.el.append(MM.cv, MM.cap); document.body.appendChild(MM.el); MM.ctx = MM.cv.getContext("2d");
}
function mmBase(f) {
  const S = MM.S, c = document.createElement("canvas"); c.width = f.w * S; c.height = f.h * S; const g = c.getContext("2d");
  g.fillStyle = "#0b0908"; g.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    const ch = f.grid[y][x];
    if (ch === ".") g.fillStyle = f.room[y * f.w + x] ? "#4a4038" : "#3a3a30";
    else if (ch in STAIRS) g.fillStyle = "#3f6a48";
    else if (ch in NAMES) g.fillStyle = "#7a4a30";
    else continue;
    g.fillRect(x * S, y * S, S + .5, S + .5);
  }
  g.strokeStyle = "rgba(230,215,190,.35)"; g.lineWidth = 1.2;                    // viền tường
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    if (f.grid[y][x] !== ".") continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = f.grid[y + dy]?.[x + dx]; if (q === undefined || q === "#") { g.beginPath(); if (dx) { const X = (x + (dx > 0 ? 1 : 0)) * S; g.moveTo(X, y * S); g.lineTo(X, (y + 1) * S); } else { const Y = (y + (dy > 0 ? 1 : 0)) * S; g.moveTo(x * S, Y); g.lineTo((x + 1) * S, Y); } g.stroke(); } }
  }
  g.font = `bold ${S * 1.6}px sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#bfe6c6";
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const ch = f.grid[y][x]; if (ch in STAIRS) g.fillText(STAIRS[ch] > 0 ? "▲" : "▼", (x + .5) * S, (y + .5) * S); }
  return c;
}
function mmRoomName() {
  let best = null, bd = 9; for (const l of F.labels || []) { const d = Math.hypot(l[1] - player.x, l[2] - player.y); if (d < bd) { bd = d; best = l[0]; } }
  return best;
}
function mmDraw() {
  const show = MM_MAPS.has(MAPID) && S.started && !S.ending && !S.paused && !(typeof CUT !== "undefined" && CUT.on);
  if (!show) { if (MM.el && MM.on) { MM.el.classList.remove("on"); MM.on = 0; } return; }
  mmUI(); if (!MM.on) { MM.el.classList.add("on"); MM.on = 1; }
  if (MM.baseF !== F || t - MM.baseT > 3) { MM.base = mmBase(F); MM.baseF = F; MM.baseT = t; }
  const g = MM.ctx, W = MM.cv.width, R = W / 2, SC = MM.S, z = 2;                       // z: phóng to cho nét (canvas gấp đôi)
  g.clearRect(0, 0, W, W); g.save(); g.beginPath(); g.arc(R, R, R - 2, 0, 7); g.clip();
  g.fillStyle = "#070605"; g.fillRect(0, 0, W, W);
  g.translate(R, R); g.rotate(-player.a - Math.PI / 2); g.scale(z, z);
  g.drawImage(MM.base, -player.x * SC, -player.y * SC);
  // mục tiêu gợi ý
  try { if (typeof HN !== "undefined" && (hintCfg().always || t < HN.until)) { const h = hintTarget(), tg = h?.tg; if (tg && !tg.lost) { g.fillStyle = "#ffd24a"; g.shadowColor = "#ffb000"; g.shadowBlur = 8; g.beginPath(); g.arc((tg.x - player.x) * SC, (tg.y - player.y) * SC, 3.2, 0, 7); g.fill(); g.shadowBlur = 0; } } } catch (e) {}
  g.restore();
  // người chơi
  g.save(); g.translate(R, R); g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, -11); g.lineTo(8, 9); g.lineTo(0, 4); g.lineTo(-8, 9); g.closePath(); g.stroke(); g.fill();
  const fov = g.createRadialGradient(0, 0, 0, 0, 0, 70); fov.addColorStop(0, "rgba(255,240,200,.22)"); fov.addColorStop(1, "rgba(255,240,200,0)");
  g.fillStyle = fov; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 70, -Math.PI / 2 - .5, -Math.PI / 2 + .5); g.closePath(); g.fill();
  g.restore();
  g.fillStyle = "rgba(217,204,178,.85)"; g.font = "bold 18px sans-serif"; g.textAlign = "center";             // chữ B (bắc) xoay theo bản đồ
  const na = -player.a - Math.PI / 2 - Math.PI / 2; g.fillText("B", R + Math.cos(na) * (R - 16), R + Math.sin(na) * (R - 16) + 6);
  const rn = mmRoomName(), cap = `<b>${(F.name || "").toUpperCase()}</b>${rn || ""}`;
  if (MM.cap._t !== cap) { MM.cap._t = cap; MM.cap.innerHTML = cap; }
}
gameStep = (o => function (dt) { o(dt); try { mmDraw(); } catch (e) {} })(gameStep);
