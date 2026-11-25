// =====================================================================
//  32. BẢN 19: MAP THỨ 6 — BỆNH VIỆN DỊ NHÂN (3 tầng · map rộng nhất · chuỗi nhiệm vụ 11 bước)
// =====================================================================

// ---------- 1. TEXTURE ----------
function buildHospitalTextures() {
  const tilesH = (g, c, gr, s, y0 = 0, y1 = 128) => { R(g, 0, y0, 128, y1 - y0, gr); for (let y = y0; y < y1; y += s) for (let x = 0; x < 128; x += s) { R(g, x + .7, y + .7, s - 1.4, s - 1.4, c); R(g, x + .7, y + .7, s - 1.4, .8, "rgba(255,255,255,.08)"); if (rnd() < .1) R(g, x + 1, y + 1, s - 2, s - 2, "rgba(0,0,0,.25)"); if (rnd() < .05) { g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = .6; g.beginPath(); g.moveTo(x + rnd() * s, y); g.lineTo(x + rnd() * s, y + s); g.stroke(); } } };
  const peel = (g, n, col) => { for (let i = 0; i < n; i++) { const x = rnd() * 128, y = rnd() * 58, w = 4 + rnd() * 14, h = 3 + rnd() * 9; E(g, x, y, w, h, col); E(g, x + 1, y + 1.5, w * .8, h * .6, "rgba(0,0,0,.22)"); } };
  const blood = (g, n, a = .85) => { for (let i = 0; i < n; i++) { const x = rnd() * 128, y = rnd() * 100; stain(g, x, y, 6 + rnd() * 16, `rgba(${80 + rnd() * 40 | 0},0,0,${a})`); for (let k = 0; k < 3; k++) drip(g, x + (rnd() - .5) * 10, y, 10 + rnd() * 30, "#4a0202"); } };
  const smear = (g, x, y, w, h) => { for (let i = 0; i < 6; i++) R(g, x + rnd() * 6, y + i * h / 6 + rnd() * 2, w * (.5 + rnd() * .5), h / 8, `rgba(${90 + rnd() * 30 | 0},4,4,${.35 + rnd() * .35})`); };
  const scrawl = (g, txt, x, y, sz = 13) => { g.save(); g.translate(x, y); g.rotate((rnd() - .5) * .3); g.fillStyle = "rgba(110,6,6,.85)"; g.font = `bold ${sz}px Arial`; g.textAlign = "center"; g.fillText(txt, 0, 0); g.restore(); drip(g, x - 10, y + 2, 10 + rnd() * 14, "#5a0404"); drip(g, x + 6, y + 2, 8 + rnd() * 18, "#5a0404"); };
  const sign = (g, x, y, w2, txt, bg = "#1a5a3a", fg = "#e8f0e0", sz = 7.5) => { R(g, x - w2 / 2, y - 7, w2, 13, bg); R(g, x - w2 / 2, y - 7, w2, 1, "rgba(255,255,255,.3)"); g.fillStyle = fg; g.font = `bold ${sz}px Arial`; g.textAlign = "center"; g.fillText(txt, x, y + 2.5); };
  const hwall = (base, top, bad) => (g, w, h) => {
    R(g, 0, 0, w, h, top); for (let i = 0; i < 300; i++) R(g, rnd() * w, rnd() * 64, 1 + rnd() * 3, 1 + rnd() * 3, "rgba(0,0,0,.07)");
    peel(g, 6, "rgba(120,110,90,.55)"); tilesH(g, base, "#3a4440", 12, 66, 128); R(g, 0, 62, w, 5, "#4a5a50"); R(g, 0, 62, w, 1, "rgba(255,255,255,.15)");
    grime(g, w, h, 1500, .38); stain(g, rnd() * w, 120, 30, "rgba(30,25,10,.55)");
    if (bad) { blood(g, 2); hand(g, 30 + rnd() * 60, 40 + rnd() * 30, 1.1); smear(g, 10 + rnd() * 50, 70 + rnd() * 30, 60, 14); if (rnd() < .7) scrawl(g, ["CỨU", "ĐAU", "47", "TRẢ TAY ĐÂY", "MẸ ƠI"][Math.floor(rnd() * 5)], 64, 40); }
  };
  T.hWall = tex(hwall("#8a9a88", "#b8b098")); T.hWallB = tex(hwall("#7a8a78", "#a8a088", 1));
  T.hWard = tex(hwall("#8aa8a0", "#a8c0b8")); T.hWardB = tex(hwall("#7a988f", "#98b0a8", 1));
  T.hTileW = tex((g, w, h) => { tilesH(g, "#c8ccc4", "#7a807a", 16); grime(g, w, h, 1400, .35); R(g, 0, 120, w, 8, "rgba(30,30,20,.4)"); });
  T.hTileWB = tex((g, w, h) => { tilesH(g, "#bcc0b6", "#6a706a", 16); grime(g, w, h, 1500, .4); blood(g, 3); hand(g, 40 + rnd() * 50, 50, 1); smear(g, 0, 80, 110, 18); });
  T.hPad = tex((g, w, h) => { R(g, 0, 0, w, h, "#b8b2a2"); for (let y = 0; y <= h; y += 32) for (let x = (y / 32 % 2) * 16; x < w + 16; x += 32) { stain(g, x, y + 16, 18, "rgba(255,250,230,.35)"); E(g, x, y, 2, 2, "#5a5448"); } grime(g, w, h, 1600, .35);
    g.strokeStyle = "rgba(60,20,10,.6)"; g.lineWidth = 1; for (let i = 0; i < 10; i++) { const x = 20 + rnd() * 90, y = 30 + rnd() * 60; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x + k * 3, y); g.lineTo(x + k * 3 + 4, y + 20 + rnd() * 10); g.stroke(); } } blood(g, 1, .5); });
  T.hPadF = tex((g, w, h) => { R(g, 0, 0, w, h, "#9a9484"); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) stain(g, x + 16, y + 16, 15, "rgba(255,250,230,.25)"); grime(g, w, h, 2400, .45); stain(g, 64, 70, 24, "rgba(80,60,10,.5)"); });
  T.hKidW = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8a8a8"); for (let y = 8; y < 60; y += 18) for (let x = (y / 18 % 2) * 12 + 6; x < w; x += 24) { E(g, x, y, 5, 4, "#d8c070"); E(g, x + 4, y - 3, 2.5, 2.5, "#d8c070"); R(g, x + 6, y - 3, 3, 1, "#c07020"); }
    R(g, 0, 64, w, 64, "#9a7a80"); R(g, 0, 62, w, 3, "#e8d8d0"); grime(g, w, h, 1800, .4); peel(g, 5, "rgba(160,140,120,.6)");
    g.strokeStyle = "rgba(20,10,10,.7)"; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { const x = 15 + rnd() * 90, y = 84 + rnd() * 22; g.beginPath(); g.arc(x, y - 12, 5, 0, 7); g.moveTo(x, y - 7); g.lineTo(x, y + 6); g.moveTo(x - 6, y - 2); g.lineTo(x + 6, y - 2); g.moveTo(x, y + 6); g.lineTo(x - 4, y + 14); g.moveTo(x, y + 6); g.lineTo(x + 4, y + 14); g.stroke(); g.beginPath(); g.arc(x + 9, y - 12, 4, 0, 7); g.stroke(); }
    blood(g, 1, .6); });
  T.hBase = tex((g, w, h) => { concrete(g, w, h, 1); for (let i = 0; i < 6; i++) stain(g, rnd() * w, 40 + rnd() * 80, 10 + rnd() * 20, "rgba(40,50,20,.4)"); });
  T.hBaseB = tex((g, w, h) => { concrete(g, w, h, 1); blood(g, 2, .7); smear(g, 10, 90, 100, 20); });
  T.hDocW = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a2216"); for (let x = 0; x < w; x += 32) { R(g, x + 3, 6, 26, 52, "#4a2c1c"); R(g, x + 3, 68, 26, 54, "#4a2c1c"); R(g, x + 3, 6, 26, 1, "#6a4430"); } R(g, 0, 60, w, 6, "#2a160c"); grime(g, w, h, 900, .3); });
  // ---- sàn & trần ----
  const lino = bad => (g, w, h) => { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) R(g, x, y, 32, 32, (x + y) / 32 % 2 ? "#5a6a66" : "#7a8682"); grime(g, w, h, 2400, .42); for (let i = 0; i < 6; i++) stain(g, rnd() * w, rnd() * h, 10 + rnd() * 18, "rgba(30,25,10,.45)");
    if (bad) { for (let i = 0; i < 26; i++) E(g, 50 + Math.sin(i * .4) * 10, i * 5, 13 + rnd() * 5, 4, `rgba(${80 + rnd() * 30 | 0},2,2,${.55 + rnd() * .3})`); for (let k = 0; k < 4; k++) R(g, 40 + k * 6 + Math.sin(k) * 3, 0, 1.5, h, "rgba(60,0,0,.5)"); } };
  T.hLino = tex(lino(0)); T.hLinoB = tex(lino(1));
  T.hLinoC = tex((g, w, h) => { lino(0)(g, w, h); R(g, 0, 58, w, 10, "rgba(200,180,40,.22)"); });
  T.hTileF = tex((g, w, h) => { tilesH(g, "#a8aca4", "#5a5e58", 10); grime(g, w, h, 2200, .4); E(g, 64, 64, 8, 8, "#2a2a28"); for (let i = 0; i < 6; i++) R(g, 58 + i * 2, 60, 1, 8, "#111"); });
  T.hTileFB = tex((g, w, h) => { tilesH(g, "#9ca098", "#50544e", 10); grime(g, w, h, 2200, .45); stain(g, 64, 64, 46, "rgba(90,0,0,.85)"); stain(g, 40, 90, 22, "rgba(70,0,0,.8)"); E(g, 64, 64, 8, 8, "#1a0404"); });
  T.hORF = tex((g, w, h) => { tilesH(g, "#4a7a6a", "#2a3a34", 16); grime(g, w, h, 1800, .35); stain(g, 40 + rnd() * 50, 40 + rnd() * 50, 30, "rgba(70,0,0,.75)"); });
  T.hORC = tex((g, w, h) => { tilesH(g, "#5a8070", "#2a3a34", 16); grime(g, w, h, 1800, .4); R(g, 0, 58, w, 10, "rgba(220,220,200,.16)"); });
  T.hKidF = tex((g, w, h) => { for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) R(g, x, y, 32, 32, ["#a88a90", "#8a9ab0", "#b0a080", "#90a890"][(x / 32 + y / 32 * 3) % 4]); grime(g, w, h, 2600, .5); stain(g, 70, 50, 26, "rgba(70,0,0,.5)"); });
  T.hBathF = tex((g, w, h) => { tilesH(g, "#8a948e", "#3a403c", 8); grime(g, w, h, 2600, .5); for (let i = 0; i < 4; i++) stain(g, rnd() * w, rnd() * h, 16, "rgba(40,60,40,.4)"); });
  T.hMorF = tex((g, w, h) => { tilesH(g, "#7e8480", "#3c403e", 12); grime(g, w, h, 2400, .45); E(g, 64, 64, 10, 10, "#1a1a18"); g.strokeStyle = "#333"; g.lineWidth = .8; for (let r = 2; r < 10; r += 3) { g.beginPath(); g.arc(64, 64, r, 0, 7); g.stroke(); } stain(g, 60, 70, 30, "rgba(60,0,0,.6)"); });
  T.hConcF = tex((g, w, h) => { concrete(g, w, h); for (let i = 0; i < 5; i++) stain(g, rnd() * w, rnd() * h, 14 + rnd() * 20, "rgba(10,20,25,.55)"); });
  T.hCeil = tex((g, w, h) => { R(g, 0, 0, w, h, "#6a6a62"); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { R(g, x + 1, y + 1, 30, 30, "#7a786e"); for (let i = 0; i < 30; i++) R(g, x + 2 + rnd() * 27, y + 2 + rnd() * 27, 1, 1, "rgba(0,0,0,.25)"); } R(g, 33, 65, 30, 30, "#0a0a0a"); R(g, 40, 95, 2, 22, "#1a1a1a"); grime(g, w, h, 1600, .4); stain(g, 90, 30, 22, "rgba(70,50,10,.55)"); stain(g, 20, 100, 14, "rgba(60,0,0,.5)"); });
  T.hCeilB = tex((g, w, h) => { concrete(g, w, h, 1); stain(g, 60, 60, 30, "rgba(20,30,10,.5)"); });
  // ---- cửa & vật gắn tường ----
  T.hExit = texE((g, w, h) => { hwall("#8a9a88", "#b8b098")(g, w, h); R(g, 10, 16, 108, 112, "#2a2e2c"); for (const x of [14, 66]) { R(g, x, 20, 48, 108, "#4a5250"); R(g, x + 5, 26, 38, 58, "#0c1416"); R(g, x + 5, 26, 38, 58, "rgba(80,120,130,.22)"); g.strokeStyle = "rgba(200,220,230,.25)"; g.lineWidth = .7; g.beginPath(); g.moveTo(x + 8, 30); g.lineTo(x + 30, 70); g.moveTo(x + 22, 28); g.lineTo(x + 12, 60); g.stroke(); }
    R(g, 62, 20, 4, 108, "#1a1a1a"); g.strokeStyle = "#7a7a72"; g.lineWidth = 3.2; for (let i = 0; i < 2; i++) { g.beginPath(); g.moveTo(18, 74 + i * 12); for (let x = 18; x < 110; x += 8) g.lineTo(x + 4, 77 + i * 12 + (x % 16 ? 3 : -3)); g.stroke(); }
    R(g, 55, 76, 18, 20, "#8a7a3a"); R(g, 58, 70, 12, 8, "rgba(0,0,0,0)"); g.strokeStyle = "#8a7a3a"; g.lineWidth = 3; g.beginPath(); g.arc(64, 76, 6, Math.PI, 0); g.stroke(); E(g, 64, 84, 2.5, 3.5, "#2a1a0a");
    R(g, 38, 2, 52, 12, "#0a2a10"); g.fillStyle = "#3a8a4a"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText("LỐI RA", 64, 11); stain(g, 64, 112, 30, "rgba(40,0,0,.5)"); },
    g => { g.fillStyle = "rgba(60,255,100,1)"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText("LỐI RA", 64, 11); });
  T.hShutter = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a3c3a"); for (let y = 6; y < 128; y += 7) { R(g, 6, y, 116, 6, "#6a6e6a"); R(g, 6, y, 116, 1, "#8a8e8a"); R(g, 6, y + 5, 116, 1, "#2a2c2a"); } for (let i = 0; i < 18; i++) stain(g, rnd() * w, rnd() * h, 6 + rnd() * 10, "rgba(120,55,20,.5)"); R(g, 0, 0, w, 6, "#2a2c2a");
    sign(g, 64, 30, 76, "KHU B · CẦU THANG", "#7a1a1a", "#f0e0d0"); hand(g, 30, 80, 1.2); hand(g, 50, 96, 1); smear(g, 20, 70, 80, 30); R(g, 108, 60, 10, 16, "#222"); E(g, 113, 66, 2.5, 2.5, "#a01010"); });
  const surg = on => (g, w, h) => { hwall("#c8ccc4", "#c8ccc4")(g, w, h); R(g, 12, 12, 104, 116, "#2a2e2c"); for (const x of [16, 66]) { R(g, x, 16, 46, 112, "#7a8a84"); R(g, x, 16, 46, 2, "#9aa8a2"); E(g, x + 23, 46, 11, 11, "#1a2224"); E(g, x + 23, 46, 9, 9, "#0a1214"); R(g, x + 6, 90, 34, 6, "#4a5652"); }
    R(g, 63, 16, 2, 112, "#1a1a1a"); R(g, 24, 2, 80, 11, "#8a1010"); g.fillStyle = "#f0e8e0"; g.font = "bold 7px Arial"; g.textAlign = "center"; g.fillText("KHU PHẪU THUẬT · CẤM VÀO", 64, 10);
    R(g, 118, 56, 8, 18, "#1a1a1a"); R(g, 119, 58, 6, 4, on ? "#1aa01a" : "#a01010"); stain(g, 40, 100, 26, "rgba(80,0,0,.7)"); hand(g, 90, 70, 1); };
  T.hSurgOff = tex(surg(0)); T.hSurgOn = texE(surg(1), g => { R(g, 119, 58, 6, 4, "#30ff40"); });
  T.hSafe = tex((g, w, h) => { tilesH(g, "#c8ccc4", "#7a807a", 16); R(g, 18, 14, 92, 100, "#2a2e30"); R(g, 22, 18, 84, 92, "#5a6064"); R(g, 22, 18, 84, 2, "#7a8084"); E(g, 50, 64, 16, 16, "#3a4044"); E(g, 50, 64, 12, 12, "#22282a"); R(g, 49, 50, 2, 8, "#aaa");
    R(g, 76, 44, 22, 36, "#1a1a1a"); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) R(g, 79 + c * 6.5, 48 + r * 7.5, 5, 5, "#6a6a6a"); sign(g, 64, 100, 60, "KÉT THUỐC ĐỘC · A", "#8a1010"); E(g, 92, 30, 6, 6, "#e8d040"); g.fillStyle = "#111"; g.font = "bold 8px Arial"; g.fillText("☠", 92, 33); grime(g, w, h, 800, .3); });
  const xray = on => (g, w, h) => { tilesH(g, "#c8ccc4", "#7a807a", 16); R(g, 8, 12, 112, 104, "#d8d8d0"); R(g, 12, 16, 104, 96, on ? "#0e1a24" : "#0a0c0e");
    if (on) { g.strokeStyle = "#c8dce8"; g.fillStyle = "#c8dce8"; g.lineWidth = 3; for (const sx of [44, 84]) { for (let i = 0; i < 9; i++) E(g, sx, 28 + i * 7, 3.5, 2.6, "#b8ccd8"); g.lineWidth = 1.6; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(sx + (sx < 64 ? -10 : 10), 34 + i * 7, 11, 3, sx < 64 ? -.3 : .3, 0, Math.PI); g.stroke(); } }
      g.lineWidth = 3; g.beginPath(); g.ellipse(64, 92, 34, 12, 0, Math.PI, 0); g.stroke(); E(g, 64, 90, 8, 5, "#0e1a24");   // hai cột sống chung một khung chậu
      for (let i = 0; i < 4; i++) { const x = 30 + i * 22, y = 100; R(g, x - 1, y - 14, 2, 14, "#f0f0f0"); E(g, x, y - 15, 3, 3, "#f0f0f0"); g.fillStyle = "#ff4040"; g.font = "bold 11px Arial"; g.textAlign = "center"; g.fillText(S.code[i], x, y + 10); }
      g.fillStyle = "#c8dce8"; g.font = "bold 6px Arial"; g.textAlign = "left"; g.fillText("BN 47-B · 14/7/1996 · NGÀ", 16, 22); }
    else { E(g, 64, 64, 30, 40, "rgba(40,50,60,.25)"); } R(g, 8, 116, 112, 4, "#9a9a92"); };
  T.hXrayOff = tex(xray(0)); T.hXrayOn = texE(xray(1), g => { R(g, 12, 16, 104, 96, "rgba(40,70,100,.55)"); for (const sx of [44, 84]) for (let i = 0; i < 9; i++) E(g, sx, 28 + i * 7, 3.5, 2.6, "#9ab8d0"); for (let i = 0; i < 4; i++) { g.fillStyle = "#ff3030"; g.font = "bold 11px Arial"; g.textAlign = "center"; g.fillText(S.code[i], 30 + i * 22, 110); } });
  const fuse = on => (g, w, h) => { concrete(g, w, h, 1); R(g, 20, 10, 88, 108, "#4a5048"); R(g, 24, 14, 80, 100, "#6a706a"); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 30 + c * 18, y = 22 + r * 20; R(g, x, y, 12, 14, "#2a2e2a"); if (!(r === 1 && c === 2) || on) { R(g, x + 2, y + 2, 8, 10, "#d8d0b8"); R(g, x + 4, y + (on ? 3 : 7), 4, 4, "#1a1a1a"); } else { R(g, x + 2, y + 2, 8, 10, "#0a0a0a"); g.strokeStyle = "#c01010"; g.lineWidth = 1.5; g.strokeRect(x - 1, y - 1, 14, 16); } }
    sign(g, 64, 104, 70, "CẦU DAO TỔNG", "#8a6a10", "#111"); for (let i = 0; i < 4; i++) R(g, 30 + i * 18, 18, 12, 2, on ? "#1a8a1a" : "#5a1010"); };
  T.hFuseOff = tex(fuse(0)); T.hFuseOn = texE(fuse(1), g => { for (let i = 0; i < 4; i++) R(g, 30 + i * 18, 18, 12, 2, "#40ff60"); });
  const incin = on => (g, w, h) => { R(g, 0, 0, w, h, "#3a2a24"); for (let y = 0; y < h; y += 10) for (let x = (y / 10 % 2) * 12; x < w; x += 24) { R(g, x + 1, y + 1, 22, 8, "#5a3a2e"); R(g, x + 1, y + 1, 22, 1, "#6a4a3a"); } stain(g, 64, 60, 60, "rgba(0,0,0,.75)");
    E(g, 64, 66, 40, 40, "#1a1a1a"); E(g, 64, 66, 34, 34, on ? "#6a2a08" : "#262422"); for (let i = -3; i <= 3; i++) R(g, 62 + i * 9, 36, 3, 60, "#111"); R(g, 94, 60, 14, 6, "#555"); sign(g, 64, 12, 56, "LÒ THIÊU", "#2a2a2a", "#c8a070"); for (let i = 0; i < 8; i++) R(g, 30 + rnd() * 70, 104 + rnd() * 18, 3, 2, "#c8c0b0"); };
  T.hIncinOff = tex(incin(0)); T.hIncinOn = texE(incin(1), g => { const gr = g.createRadialGradient(64, 66, 4, 64, 66, 34); gr.addColorStop(0, "#ffd060"); gr.addColorStop(.6, "#ff6010"); gr.addColorStop(1, "#401000"); g.fillStyle = gr; g.beginPath(); g.arc(64, 66, 34, 0, 7); g.fill(); g.fillStyle = "#000"; for (let i = -3; i <= 3; i++) g.fillRect(62 + i * 9, 36, 3, 60); });
  T.hDesk = tex((g, w, h) => { R(g, 0, 0, w, h, "#2a160c"); R(g, 4, 70, 120, 58, "#4a2414"); for (let x = 8; x < 120; x += 38) { R(g, x, 84, 34, 40, "#5a2e1a"); R(g, x + 3, 87, 28, 34, "#4a2414"); E(g, x + 17, 104, 2.5, 2.5, "#a8883a"); } R(g, 46, 74, 36, 8, "#a8883a"); g.fillStyle = "#2a1a08"; g.font = "bold 5.5px Arial"; g.textAlign = "center"; g.fillText("VIỆN TRƯỞNG", 64, 80); stain(g, 90, 100, 18, "rgba(60,0,0,.6)"); hand(g, 30, 110, .8); grime(g, w, h, 800, .3); });
  T.hLog = tex((g, w, h) => { hwall("#8a9a88", "#b8b098")(g, w, h); R(g, 28, 10, 72, 96, "#6a4a2a"); R(g, 32, 16, 64, 86, "#d8d0b8"); R(g, 54, 6, 20, 10, "#8a8a8a"); g.fillStyle = "#1a1a3a"; g.font = "bold 7px Arial"; g.textAlign = "center"; g.fillText("SỔ TRỰC", 64, 28); for (let i = 0; i < 9; i++) R(g, 38, 36 + i * 7, 40 + rnd() * 12, 1.2, "#3a3a5a"); E(g, 80, 88, 5, 6, "rgba(120,0,0,.8)"); drip(g, 80, 92, 18, "#6a0404"); });
  T.hChart = tex((g, w, h) => { hwall("#8aa8a0", "#a8c0b8")(g, w, h); R(g, 10, 12, 108, 80, "#e8e8e0"); R(g, 10, 12, 108, 3, "#8a8a8a"); g.fillStyle = "#1a2a6a"; g.font = "bold 7px Arial"; g.textAlign = "center"; g.fillText("LỊCH MỔ · THÁNG 7/1996", 64, 24);
    for (let i = 0; i < 7; i++) { R(g, 16, 30 + i * 8, 96, .8, "#9a9aaa"); R(g, 18, 33 + i * 8, 30 + rnd() * 40, 1.6, "#2a2a4a"); g.strokeStyle = "#c01010"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(16, 34 + i * 8); g.lineTo(100, 32 + i * 8); g.stroke(); } scrawl(g, "47", 96, 86, 16); });
  T.hFiles = tex((g, w, h) => { R(g, 0, 0, w, h, "#6a4a2a"); for (let i = 0; i < 300; i++) R(g, rnd() * w, rnd() * h, 1, 1, "rgba(0,0,0,.3)"); for (let i = 0; i < 8; i++) { const x = 10 + (i % 4) * 29, y = 14 + Math.floor(i / 4) * 52; R(g, x, y, 24, 32, "#d8d0c0"); R(g, x + 3, y + 3, 18, 20, "#3a3a38");
      g.fillStyle = "#8a8a84"; E(g, x + 12, y + 10, 4, 4.5, "#8a8a84"); if (i % 3 === 0) E(g, x + 17, y + 9, 3, 3.5, "#8a8a84"); g.fillRect(x + 7, y + 15, 10, 8); if (i % 2) { g.fillRect(x + 3, y + 15, 3, 7); g.fillRect(x + 18, y + 15, 3, 7); }
      g.strokeStyle = "#c01010"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 2, y + 2); g.lineTo(x + 22, y + 24); g.moveTo(x + 22, y + 2); g.lineTo(x + 2, y + 24); g.stroke(); R(g, x + 4, y + 26, 16, 1.2, "#333"); E(g, x + 12, y + 1, 2, 2, "#c01010"); }
    g.strokeStyle = "rgba(180,10,10,.8)"; g.lineWidth = .8; g.beginPath(); g.moveTo(22, 15); g.lineTo(80, 67); g.lineTo(109, 15); g.lineTo(51, 67); g.stroke(); });
  T.winHosp = texE((g, w, h) => { hwall("#8a9a88", "#b8b098")(g, w, h); R(g, 22, 10, 84, 84, "#3a3e3c"); R(g, 27, 15, 74, 74, "#1a2420"); for (let x = 30; x < 100; x += 10) R(g, x, 15, 2.5, 74, "#2a2c2a"); R(g, 27, 50, 74, 3, "#3a3e3c"); R(g, 18, 92, 92, 5, "#5a5e5a"); },
    g => { g.fillStyle = "rgba(70,90,110,.45)"; g.fillRect(27, 15, 74, 74); g.fillStyle = "#000"; for (let x = 30; x < 100; x += 10) g.fillRect(x, 15, 2.5, 74); });
  // ---- vật liệu đồ vật & nhân vật ----
  T.hSheet = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8c4b8"); for (let i = 0; i < 14; i++) R(g, 0, rnd() * h, w, 1, "rgba(0,0,0,.08)"); grime(g, w, h, 900, .25); stain(g, 60, 50, 26, "rgba(120,10,10,.75)"); stain(g, 84, 74, 14, "rgba(90,40,10,.6)"); stain(g, 30, 96, 10, "rgba(110,10,10,.6)"); });
  T.hMatt = tex((g, w, h) => { R(g, 0, 0, w, h, "#b8bcc0"); for (let x = 0; x < w; x += 12) R(g, x, 0, 5, h, "#7a8aa0"); grime(g, w, h, 1500, .35); stain(g, 64, 60, 40, "rgba(110,80,20,.55)"); stain(g, 50, 70, 20, "rgba(90,0,0,.6)"); });
  T.hScreen = tex((g, w, h) => { R(g, 0, 0, w, h, "#8aa898"); for (let x = 0; x < w; x += 8) R(g, x, 0, 3, h, "rgba(0,0,0,.12)"); grime(g, w, h, 1200, .35); for (let i = 0; i < 24; i++) E(g, 40 + rnd() * 50, 30 + rnd() * 40, 1 + rnd() * 3, 1 + rnd() * 3, "rgba(120,0,0,.8)"); });
  const jar = (liq, thing) => texE((g, w, h) => { R(g, 0, 0, w, h, liq); for (let i = 0; i < 40; i++) E(g, rnd() * w, rnd() * h, 1, 1, "rgba(255,255,255,.25)"); thing(g); R(g, 0, 0, 10, h, "rgba(255,255,255,.12)"); },
    g => { g.fillStyle = liq; g.globalAlpha = .45; g.fillRect(0, 0, 128, 128); g.globalAlpha = 1; });
  T.hJar = jar("#24402a", g => { for (let i = 0; i < 5; i++) stain(g, rnd() * 128, rnd() * 128, 20 + rnd() * 20, "rgba(90,110,40,.35)"); g.fillStyle = "rgba(150,110,95,.55)"; g.beginPath(); g.ellipse(70, 76, 20, 28, .5, 0, 7); g.fill(); g.beginPath(); g.ellipse(52, 48, 13, 12, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(120,80,70,.6)"; g.lineWidth = 4; g.beginPath(); g.moveTo(80, 96); g.quadraticCurveTo(98, 110, 86, 120); g.stroke(); E(g, 48, 47, 2, 1.5, "rgba(10,5,5,.7)"); for (let i = 0; i < 60; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, "rgba(200,220,160,.3)"); });
  T.hJarB = jar("#7a6020", g => { E(g, 64, 64, 18, 22, "#8a2a2a"); for (let i = 0; i < 5; i++) E(g, 50 + rnd() * 28, 50 + rnd() * 28, 4, 4, "#e8e0d0"); E(g, 60, 60, 3, 3, "#1a1a1a"); });
  T.hMon = texE((g, w, h) => { R(g, 0, 0, w, h, "#1a1e1c"); R(g, 10, 14, 108, 80, "#020604"); g.strokeStyle = "#20c040"; g.lineWidth = 2; g.beginPath(); for (let x = 12; x < 116; x++) { const p = (x - 12) % 36, y = 54 - (p === 14 ? 26 : p === 16 ? -14 : p > 10 && p < 13 ? 4 : 0); x === 12 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.fillStyle = "#30e050"; g.font = "bold 14px Arial"; g.fillText("47", 86, 86); R(g, 20, 104, 10, 6, "#a01010"); },
    g => { g.strokeStyle = "#30ff50"; g.lineWidth = 2.5; g.beginPath(); for (let x = 12; x < 116; x++) { const p = (x - 12) % 36, y = 54 - (p === 14 ? 26 : p === 16 ? -14 : 0); x === 12 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.fillStyle = "#30ff50"; g.font = "bold 14px Arial"; g.fillText("47", 86, 86); });
  T.hMonOff = tex((g, w, h) => { R(g, 0, 0, w, h, "#1a1e1c"); R(g, 10, 14, 108, 80, "#060808"); R(g, 14, 18, 20, 30, "rgba(255,255,255,.05)"); });
  T.hBag = tex((g, w, h) => { R(g, 0, 0, w, h, "#121414"); for (let i = 0; i < 20; i++) R(g, 0, rnd() * h, w, 1, "rgba(255,255,255,.05)"); R(g, 62, 0, 4, h, "#3a3a3a"); for (let y = 0; y < h; y += 4) R(g, 61, y, 6, 1.5, "#5a5a5a"); stain(g, 40, 80, 20, "rgba(80,0,0,.5)"); });
  T.hCorpse = tex((g, w, h) => { R(g, 0, 0, w, h, "#a8a49c"); for (let i = 0; i < 20; i++) stain(g, rnd() * w, rnd() * h, 8 + rnd() * 16, `rgba(${80 + rnd() * 40 | 0},${70 + rnd() * 30 | 0},${100 + rnd() * 30 | 0},.25)`); g.strokeStyle = "#3a1a1a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(20, 20); g.lineTo(64, 60); g.lineTo(108, 20); g.moveTo(64, 60); g.lineTo(64, 120); g.stroke(); g.lineWidth = .8; for (let y = 64; y < 120; y += 5) { g.beginPath(); g.moveTo(60, y); g.lineTo(68, y + 2); g.stroke(); } });
  T.hGown = tex((g, w, h) => { R(g, 0, 0, w, h, "#8aa0b0"); for (let y = 4; y < h; y += 10) for (let x = (y / 10 % 2) * 5; x < w; x += 10) E(g, x, y, 1.4, 1.4, "#5a7088"); grime(g, w, h, 1400, .4); stain(g, 50, 60, 22, "rgba(110,10,10,.8)"); stain(g, 90, 100, 14, "rgba(100,70,10,.6)"); });
  T.hGownDoc = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a5a4a"); for (let x = 0; x < w; x += 6) R(g, x, 0, 1, h, "rgba(0,0,0,.18)"); grime(g, w, h, 1500, .4); for (let i = 0; i < 5; i++) stain(g, rnd() * w, rnd() * h, 16 + rnd() * 20, "rgba(80,0,0,.9)"); for (let i = 0; i < 14; i++) drip(g, rnd() * w, rnd() * 60, 20 + rnd() * 50, "#3a0000"); });
  T.hCoat = tex((g, w, h) => { R(g, 0, 0, w, h, "#d8d8d0"); for (let x = 0; x < w; x += 8) R(g, x, 0, 1, h, "rgba(0,0,0,.08)"); R(g, 62, 0, 4, h, "#b8b8b0"); for (let y = 20; y < h; y += 26) E(g, 70, y, 2, 2, "#8a8a80"); R(g, 20, 30, 16, 12, "#c8c8c0"); grime(g, w, h, 600, .2); stain(g, 90, 90, 10, "rgba(110,10,10,.5)"); });
  T.hCap = tex((g, w, h) => { R(g, 0, 0, w, h, "#3a6a5a"); for (let i = 0; i < 400; i++) R(g, rnd() * w, rnd() * h, 1, 1, "rgba(0,0,0,.2)"); stain(g, 64, 100, 30, "rgba(90,0,0,.8)"); });
  T.hSkinDoc = tex((g, w, h) => { R(g, 0, 0, w, h, "#8a8e82"); for (let i = 0; i < 25; i++) stain(g, rnd() * w, rnd() * h, 6 + rnd() * 16, `rgba(${60 + rnd() * 60 | 0},${40 + rnd() * 30 | 0},${60 + rnd() * 30 | 0},.35)`); g.strokeStyle = "#1a0a0a"; g.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) { const y = 10 + rnd() * 108, x0 = rnd() * 40; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 90, y + (rnd() - .5) * 20); g.stroke(); for (let x = x0; x < x0 + 90; x += 6) { g.beginPath(); g.moveTo(x, y - 3); g.lineTo(x + 2, y + 3); g.stroke(); } } });
  T.hFaceDoc = tex((g, w, h) => { R(g, 0, 0, w, h, "#7e8276"); const sh = g.createRadialGradient(64, 58, 10, 64, 64, 70); sh.addColorStop(0, "rgba(220,230,210,.15)"); sh.addColorStop(1, "rgba(20,10,10,.55)"); g.fillStyle = sh; g.fillRect(0, 0, w, h);
    for (const x of [50, 78]) { E(g, x, 56, 8, 5, "#200808"); g.strokeStyle = "#0a0505"; g.lineWidth = 1.4; for (let k = -6; k <= 6; k += 3) { g.beginPath(); g.moveTo(x + k, 50); g.lineTo(x + k, 62); g.stroke(); } }
    E(g, 64, 34, 5, 4, "#e8e0d0"); E(g, 64, 34, 2.4, 2.4, "#a00000"); E(g, 64, 34, 1, 1, "#000");   // con mắt thứ ba ghép trên trán
    E(g, 64, 88, 5, 16, "#0a0000"); g.strokeStyle = "#1a0a0a"; g.lineWidth = 1.2; for (let y = 74; y < 104; y += 4) { g.beginPath(); g.moveTo(56, y); g.lineTo(72, y + 1); g.stroke(); }
    g.strokeStyle = "#2a0a0a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(20, 30); g.quadraticCurveTo(64, 46, 108, 30); g.moveTo(26, 96); g.lineTo(52, 82); g.moveTo(102, 96); g.lineTo(76, 82); g.stroke();
    for (let x = 22; x < 108; x += 6) R(g, x, 32 + Math.sin((x - 20) / 88 * Math.PI) * 7, 1.5, 5, "#9a9a9a"); drip(g, 64, 104, 18, "#3a0000"); });
  T.hFacePat = tex((g, w, h) => { R(g, 0, 0, w, h, "#c8bca8"); g.strokeStyle = "rgba(90,70,50,.6)"; g.lineWidth = 1; for (let y = 0; y < h; y += 7) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 6); g.stroke(); } E(g, 50, 56, 7, 6, "#0a0404"); stain(g, 80, 58, 18, "rgba(120,10,10,.85)"); stain(g, 64, 92, 14, "rgba(100,10,10,.7)"); drip(g, 50, 62, 22, "#3a0000"); grime(g, w, h, 900, .3); });
  T.hGlove = tex(g => { R(g, 0, 0, 128, 128, "#c8b890"); stain(g, 64, 64, 50, "rgba(110,10,10,.8)"); });
  T.hIVBag = texE(g => { R(g, 0, 0, 128, 128, "#c8b8a0"); R(g, 10, 50, 108, 78, "#8a1010"); R(g, 20, 14, 88, 20, "#e8e8e0"); g.fillStyle = "#222"; g.font = "bold 9px Arial"; g.textAlign = "center"; g.fillText("O−", 64, 28); }, g => { g.fillStyle = "rgba(120,10,10,.5)"; g.fillRect(10, 50, 108, 78); });
  T.hTubeR = tex(g => { R(g, 0, 0, 128, 128, "#7a0a0a"); for (let i = 0; i < 20; i++) R(g, 0, rnd() * 128, 128, 2, "rgba(255,255,255,.15)"); });
  T.hBloodM = tex(g => { R(g, 0, 0, 128, 128, "#4a0404"); for (let i = 0; i < 18; i++) stain(g, rnd() * 128, rnd() * 128, 8 + rnd() * 20, "rgba(120,10,10,.8)"); for (let i = 0; i < 30; i++) E(g, rnd() * 128, rnd() * 128, 1.5, 1, "rgba(255,200,200,.35)"); });
  T.hHeart = tex(g => { R(g, 0, 0, 128, 128, "#6a0a0e"); for (let i = 0; i < 10; i++) stain(g, rnd() * 128, rnd() * 128, 14, "rgba(160,20,30,.7)"); g.strokeStyle = "#2a0408"; g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { g.beginPath(); let x = rnd() * 128, y = 0; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rnd() - .5) * 30; y += 22; g.lineTo(x, y); } g.stroke(); } });
  T.hTubeOn = texE(g => { R(g, 0, 0, 128, 128, "#d8e8e8"); R(g, 0, 0, 128, 10, "#8a9090"); R(g, 0, 118, 128, 10, "#8a9090"); }, g => { R(g, 0, 10, 128, 108, "#e8f4ff"); });
  T.hTubeOff = tex(g => { R(g, 0, 0, 128, 128, "#5a605e"); R(g, 0, 0, 128, 10, "#3a3e3e"); R(g, 0, 118, 128, 10, "#3a3e3e"); for (let i = 0; i < 6; i++) stain(g, rnd() * 128, 64, 12, "rgba(30,20,10,.5)"); });
  T.hXrayM = texE(g => { R(g, 0, 0, 128, 128, "#c8c8c0"); R(g, 8, 8, 112, 112, "#0c141a"); g.strokeStyle = "#a8c0d0"; g.lineWidth = 3; g.beginPath(); g.ellipse(64, 56, 30, 36, 0, 0, 7); g.stroke(); E(g, 52, 54, 8, 9, "#0c141a"); E(g, 76, 54, 8, 9, "#0c141a"); g.beginPath(); g.ellipse(96, 50, 20, 26, 0, 0, 7); g.stroke(); for (let i = 0; i < 6; i++) R(g, 50 + i * 5, 92, 3, 8, "#a8c0d0"); },
    g => { g.fillStyle = "rgba(50,80,110,.6)"; g.fillRect(8, 8, 112, 112); g.strokeStyle = "#c8e0f0"; g.lineWidth = 3; g.beginPath(); g.ellipse(64, 56, 30, 36, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(96, 50, 20, 26, 0, 0, 7); g.stroke(); });
  T.hSignM = tex(g => { R(g, 0, 0, 128, 128, "#1a4a32"); R(g, 4, 4, 120, 120, "#2a6a48"); g.fillStyle = "#e8f0e0"; g.font = "bold 16px Arial"; g.textAlign = "center"; g.fillText("KHOA", 64, 50); g.fillText("DỊ NHÂN", 64, 76); grime(g, 128, 128, 1400, .5); stain(g, 90, 90, 20, "rgba(90,0,0,.7)"); });
  T.hTray = tex(g => { R(g, 0, 0, 128, 128, "#9aa0a0"); for (let i = 0; i < 6; i++) { R(g, 14 + i * 18, 20, 3, 70, "#d8dcdc"); R(g, 13 + i * 18, 14, 5, 10, "#6a7070"); } stain(g, 70, 90, 26, "rgba(100,0,0,.8)"); E(g, 40, 104, 10, 6, "#e8e0d8"); });
  T.tkBand = tex(g => { R(g, 0, 0, 128, 128, "#e8e4dc"); R(g, 0, 44, 128, 40, "#f8f4ec"); g.fillStyle = "#1a1a2a"; g.font = "bold 18px Arial"; g.textAlign = "center"; g.fillText("BN " + (11 + Math.floor(rnd() * 60)), 64, 72); stain(g, 100, 60, 14, "rgba(110,10,10,.7)"); });
  T.hDeskR = tex(g => { R(g, 0, 0, 128, 128, "#5a4a3a"); R(g, 0, 0, 128, 10, "#8a7a6a"); for (let x = 0; x < 128; x += 32) R(g, x, 10, 2, 118, "#3a2a1a"); g.fillStyle = "#d8d0b0"; g.font = "bold 12px Arial"; g.textAlign = "center"; g.fillText("TIẾP NHẬN", 64, 50); grime(g, 128, 128, 1400, .45); hand(g, 90, 80, 1); });
}

// ---------- 2. DỰNG 3 TẦNG BỆNH VIỆN ----------
// Đèn tuýp huỳnh quang treo xích: chỉ sáng khi có điện, vài bóng chập chờn
const tubeOn = s => S.power && !(s.seed < .3 && (Math.sin(t * (9 + s.seed * 30) + s.seed * 70) + Math.sin(t * 23 + s.seed * 11)) < -.6);
function hTube(f, x, y, emerg = true) {
  const rh = f.room[Math.floor(y) * f.w + Math.floor(x)]?.h ?? WH, s = { x, y, k: "hTube", hang: 1, seed: Math.random(), rot: Math.random() < .5 ? 0 : Math.PI / 2 };
  f.sprites.push(s); f.lights.push({ x, y, h: rh - .35, i: rh > 2 ? 1.25 : .9, r: .82, g: .95, b: 1, power: true, f: rh > 2 ? .12 : .4, cond: () => tubeOn(s) });
  if (emerg) f.lights.push({ x, y, h: rh - .2, i: .42, r: 1, g: .05, b: .04, f: .6, cond: () => !S.power });
}
function hospFloorT(f) {
  f.floorT = []; for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { const k = y * f.w + x, rm = f.room[k], fl = f.over[k] || (rm ? rm.floor : f.defFloor); f.floorT[k] = Array.isArray(fl) ? (((x * 31 + y * 17) % 7 === 0) ? fl[1] : fl[0]) : fl; }
}
// Đặt đồ thật (đơn vị mét) kèm khối va chạm như hệ thống bày đồ tự động
function RP(f, x, y, k, rot, o = {}) {
  const s = { x, y, k, rot, seed: o.seed ?? Math.random(), ...o }; f.sprites.push(s);
  if (o.noCol) return s; const md = RMETA[k] || [1, 1], fw = facing(rot), ax = [Math.cos(rot), Math.sin(rot)], side = [fw.c, fw.s];
  const wid = md[0] * M, dep = md[1] * M, along = wid >= dep, long = Math.max(wid, dep), short = Math.min(wid, dep), r = short / 2 + .12, n = Math.max(1, Math.ceil(long / (short * 1.1 + .05))), cz = o.wall ? dep / 2 : 0;
  for (let i = 0; i < n; i++) { const q = n === 1 ? 0 : -long / 2 + short / 2 + (long - short) * i / (n - 1); f.sprites.push({ k: "r_col", x: x + ax[0] * cz + (along ? side[0] * q : ax[0] * q), y: y + ax[1] * cz + (along ? side[1] * q : ax[1] * q), solid: r, deco: 1 }); }
  return s;
}
const NN_ = Math.PI / 2, SS_ = -Math.PI / 2;   // đồ áp tường bắc (+z hướng nam) / áp tường nam
const keepFree = (f, x, y) => f.sprites.push({ k: "r_col", x, y });   // giữ trống chỗ đứng (cầu thang, điểm xuất phát)

function buildHospital() {
  LOOT_TXT.r_filing = ["Hồ sơ bệnh nhân. Ảnh của ai cũng bị đóng dấu đỏ: “ĐÃ SỬ DỤNG”.", "Một xấp giấy đồng ý phẫu thuật — chữ ký của cha mẹ đều được viết bằng cùng một nét bút.", "Bảng kê “vật liệu”: 14 bàn tay, 9 cặp mắt, 3 trái tim. Ngày nhập: 1995.", "Một chiếc răng sữa được kẹp ghim vào bìa hồ sơ."];
  LOOT_TXT.r_officeDesk = LOOT_TXT.r_desk = ["Một con dao mổ gỉ sét, lưỡi còn dính thứ gì đen sì.", "Một cuốn sổ ghi chép: “Ngày 112 — đối tượng vẫn còn tỉnh khi khâu. Rất thú vị.”", "Một bức ảnh chụp chung cả khoa. Mặt bác sĩ Khải bị ai đó cào nát.", "Ngăn kéo đầy găng tay cao su đã dùng."];
  const WALL = [T.hWall, T.hWallB], WARD = [T.hWard, T.hWardB], TILE = [T.hTileW, T.hTileWB], LINO = [T.hLino, T.hLinoB], TF = [T.hTileF, T.hTileFB], BASE = [T.hBase, T.hBaseB];
  const wallR = (f, x0, x1, y) => { for (let x = x0; x <= x1; x++) { f.grid[y][x] = "#"; f.room[y * f.w + x] = null; } }, wallC = (f, x, y0, y1) => { for (let y = y0; y <= y1; y++) { f.grid[y][x] = "#"; f.room[y * f.w + x] = null; } };
  const red = (f, x, y) => f.lights.push({ x, y, h: 1.1, i: .5, r: 1, g: .06, b: .04, f: .6, cond: () => !S.power });

  // =============== TẦNG 1 · KHU TIẾP NHẬN ===============
  const a = makeFloor("h1", "Tầng 1 · Khu Tiếp Nhận", 64, 40, T.hCeil, WALL, LINO, .026);
  room(a, 2, 18, 61, 20, WALL, T.hLinoC, 1.45);                      // hành lang chính
  room(a, 2, 2, 15, 16, WALL, T.marble, 2.6);                         // sảnh chính (thông tầng)
  room(a, 17, 2, 26, 7, TILE, TF, 1.45);                              // nhà thuốc
  room(a, 17, 9, 26, 16, WALL, LINO, 1.5);                            // phòng chờ
  room(a, 28, 2, 35, 16, WALL, T.woodDk, 1.45);                       // phòng hồ sơ
  room(a, 37, 2, 45, 16, TILE, TF, 1.5);                              // phòng X-quang
  room(a, 47, 2, 61, 16, WARD, LINO, 1.55);                           // khoa Nội
  room(a, 2, 22, 14, 37, TILE, TF, 1.5);                              // cấp cứu
  room(a, 16, 22, 21, 28, TILE, T.hBathF, 1.35);                      // nhà vệ sinh
  room(a, 16, 30, 21, 37, TILE, T.hBathF, 1.4);                       // phòng tắm trị liệu
  room(a, 23, 22, 30, 30, WALL, T.hLinoC, 1.6);                       // cầu thang khu B
  room(a, 32, 22, 45, 37, T.hKidW, T.hKidF, 1.5);                     // khoa Nhi
  room(a, 47, 22, 61, 25, WALL, T.hLinoC, 1.4);                       // hành lang khoa Tâm thần
  room(a, 47, 27, 50, 37, T.hPad, T.hPadF, 1.3); room(a, 52, 27, 55, 37, T.hPad, T.hPadF, 1.3); room(a, 57, 27, 61, 37, T.hPad, T.hPadF, 1.3);
  wallR(a, 37, 45, 9); wallC(a, 54, 2, 16); wallR(a, 2, 14, 30); wallR(a, 32, 45, 30);   // vách ngăn: X-quang/siêu âm, Nội A/B, cấp cứu/hồi sức, nhi/sinh non
  open(a, [[41, 9], [54, 9], [8, 30], [38, 30], [7, 17], [8, 17], [9, 17], [10, 17], [21, 8], [21, 17], [22, 17], [31, 17], [41, 17], [51, 17], [58, 17], [7, 21], [8, 21], [18, 21], [18, 29], [38, 21], [39, 21], [54, 21], [48, 26], [53, 26], [59, 26]]);
  put(a, [[1, 8], [1, 9]], "X"); put(a, [[8, 1]], "7"); put(a, [[21, 1]], "G"); put(a, [[31, 1]], "9"); put(a, [[41, 1]], "P");
  put(a, [[26, 21], [27, 21]], "Q"); put(a, [[26, 31], [27, 31]], "U"); put(a, [[5, 38], [6, 38]], "n");
  put(a, [[1, 25], [1, 33], [62, 9], [44, 38], [62, 23], [20, 38]], "W");
  [[4, 1], [12, 1], [1, 4], [1, 13], [18, 1], [33, 1], [38, 1], [44, 1], [50, 1], [57, 1], [62, 5], [62, 13], [1, 29], [35, 38], [41, 38], [62, 31], [62, 35]].forEach(([x, y]) => windowAt(a, x, y));
  a.labels = [["Sảnh chính", 8.5, 9.5], ["Nhà thuốc", 21.5, 4.5], ["Phòng chờ", 21.5, 12.5], ["Phòng hồ sơ", 31.5, 9.5], ["Phòng X-quang", 41, 5], ["Phòng siêu âm", 41, 13], ["Khoa Nội A", 50.5, 9.5], ["Khoa Nội B", 58, 9.5], ["Hành lang chính", 32, 19.5],
    ["Phòng Cấp cứu", 8, 26], ["Phòng hồi sức cấp cứu", 8, 34], ["Nhà vệ sinh", 18.5, 25.5], ["Phòng tắm trị liệu", 18.5, 34], ["Cầu thang khu B", 26.5, 26.5], ["Khoa Nhi", 38.5, 26], ["Phòng trẻ sinh non", 38.5, 34], ["Khoa Tâm thần", 54, 23.5], ["Buồng giam 1", 48.5, 32.5], ["Buồng giam 2", 53.5, 32.5], ["Buồng giam 3", 59, 32.5]];
  // sảnh: quầy tiếp nhận, ghế chờ, xe lăn bỏ lại
  RP(a, 8.5, 5.4, "r_recDesk", NN_); [[5, 11], [5, 13.4], [11.6, 11], [11.6, 13.4]].forEach(([x, y]) => RP(a, x, y, "r_benchRow", 0)); RP(a, 13.2, 6, "r_wheelchair", 2.4); RP(a, 3.6, 15.2, "r_gurney", .3);
  RP(a, 2.0 + .01, 3.4, "r_hSign", 0, { noCol: 1 }); spr(a, 7.4, 5.4, T.doll, .3, { base: .5 });
  // khoa Nội: hai dãy giường bệnh, rèm che, cọc truyền
  [47.9, 49.5, 51.1, 52.7, 55.9, 57.5, 59.1, 60.7].forEach((x, i) => { RP(a, x, 2.0, "r_hBed", NN_, { wall: 1, empty: i === 2 ? 1 : 0 }); if (i % 2) RP(a, x + .62, 2.5, "r_ivStand", 0); });
  for (const x of [47.9, 49.5, 52.7, 55.9, 60.3]) RP(a, x, 17.0, "r_hBed", SS_, { wall: 1 });
  RP(a, 50.3, 9.5, "r_screen", 0); RP(a, 50.8, 12.6, "r_gurney", NN_); RP(a, 57.4, 9.4, "r_wheelchair", -.6); RP(a, 60.6, 6.8, "r_monitor", Math.PI); RP(a, 58.4, 13, "r_screen", .3);
  keepFree(a, 51.9, 4.1);
  // phòng chờ, X-quang, hồ sơ, nhà thuốc
  [[19.4, 11], [23.6, 11], [19.4, 14], [23.6, 14]].forEach(([x, y]) => RP(a, x, y, "r_benchRow", 0));
  RP(a, 41, 6, "r_gurney", 0); RP(a, 43.5, 13.5, "r_gurney", NN_); RP(a, 38.4, 15.4, "r_monitor", .5); RP(a, 39, 12.5, "r_wheelchair", .8); RP(a, 44.4, 4.2, "r_monitor", -1.2);
  for (const y of [4, 5.1, 11, 12.1]) RP(a, 28.0, y, "r_filing", 0, { wall: 1 }); RP(a, 31.5, 12, "r_officeDesk", 0);
  RP(a, 17.0, 4.5, "r_medCab", 0, { wall: 1 }); RP(a, 26.0 + .99, 4.5, "r_medCab", Math.PI, { wall: 1 }); RP(a, 24.2, 2.0, "r_medCab", NN_, { wall: 1 });
  // cấp cứu: băng ca, bàn mổ khẩn cấp, máy đo nhịp tim
  RP(a, 6, 26, "r_surgTable", 0); RP(a, 10.6, 26, "r_gurney", 0); RP(a, 10.6, 32.5, "r_gurney", .2); RP(a, 4, 33, "r_monitor", 1.2); RP(a, 7.8, 28.2, "r_trayCart", 0); RP(a, 12.6, 28.6, "r_ivStand", 0); RP(a, 4, 35.5, "r_hBed", 0, { wall: 1 }); RP(a, 11.5, 36.2, "r_ivStand", 0);
  keepFree(a, 6, 36.4);
  // khoa Nhi: nôi trẻ em, búp bê
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 34.5 + c * 3, y = [24.6, 27.8, 32.6, 35.6][r]; RP(a, x, y, "r_crib", 0); if ((r + c) % 2) spr(a, x, y, T.doll, .28, { base: .26 }); }
  // tâm thần: ghế sốc điện, giường gắn đai
  RP(a, 48.5, 33, "r_strapChair", NN_); RP(a, 53.5, 35.5, "r_bedS", SS_, { wall: 1 }); RP(a, 59, 31, "r_strapChair", SS_); RP(a, 60.0, 37.0, "r_hBed", SS_, { wall: 1 });
  keepFree(a, 27, 29.4);
  // ánh sáng
  [[5, 6], [12, 6], [5, 13], [12, 13], [21.5, 4.5], [21.5, 12.5], [31.5, 5], [31.5, 13], [41, 5], [41, 13], [50, 5.5], [58, 5.5], [50, 13], [58, 13], [51, 9.5], [58, 9.5],
    [6, 19.5], [14, 19.5], [22, 19.5], [30, 19.5], [38, 19.5], [46, 19.5], [54, 19.5], [60, 19.5], [5, 26], [11, 26], [5, 33], [11, 33], [18.5, 25], [18.5, 33.5], [26.5, 25], [35, 26], [42, 26], [35, 34], [42, 34], [51, 23.5], [58, 23.5], [48.5, 32], [53.5, 32], [59, 32]].forEach(([x, y]) => hTube(a, x, y, Math.random() < .55));
  [[8.5, 9.5], [32, 19.5], [8, 26], [50.5, 9.5], [38.5, 26], [26.5, 26], [58, 9.5], [8, 34]].forEach(([x, y]) => red(a, x, y));
  a.lights.push({ x: 1.6, y: 9, h: 1.6, i: .5, r: .2, g: 1, b: .35, f: .4 });   // biển LỐI RA
  a.bats = [[3, 3], [25, 3], [34, 15], [44, 15], [60, 3], [13, 36], [20, 23], [44, 36], [49, 36], [58, 36], [14, 3]];

  // =============== TẦNG 2 · KHU PHẪU THUẬT ===============
  const b = makeFloor("h2", "Tầng 2 · Khu Phẫu Thuật", 64, 40, T.hCeil, WALL, LINO, .022);
  room(b, 2, 18, 61, 20, WALL, T.hLinoC, 1.45);
  room(b, 2, 2, 13, 16, T.hKidW, T.hKidF, 1.45);                       // phòng sơ sinh
  room(b, 15, 11, 30, 16, WALL, T.hLinoC, 1.4);                        // hành lang cách ly
  room(b, 15, 2, 18, 9, T.hPad, T.hPadF, 1.3); room(b, 20, 2, 24, 9, T.hPad, T.hPadF, 1.3); room(b, 26, 2, 30, 9, T.hPad, T.hPadF, 1.3);
  room(b, 32, 2, 45, 16, TILE, TF, 1.55);                              // phòng tiêu bản
  room(b, 47, 2, 61, 16, TILE, T.hTileF, 1.5);                         // ngân hàng máu
  room(b, 2, 22, 14, 37, TILE, TF, 1.5);                               // phòng thí nghiệm gen
  room(b, 16, 22, 21, 37, WARD, LINO, 1.4);                            // phòng y tá trực
  room(b, 23, 22, 30, 30, WALL, T.hLinoC, 1.6);                        // cầu thang khu B
  room(b, 32, 22, 61, 24, TILE, T.hORC, 1.45);                         // hành lang phẫu thuật
  room(b, 32, 26, 41, 37, TILE, T.hORF, 1.7);                          // phòng mổ 1
  room(b, 43, 26, 52, 37, TILE, T.hORF, 1.8);                          // phòng mổ số 3
  room(b, 54, 26, 61, 37, T.hDocW, T.carpetB, 1.5);                    // văn phòng viện trưởng
  wallR(b, 32, 45, 10); wallC(b, 54, 2, 16); wallR(b, 2, 14, 30); wallR(b, 32, 41, 31); wallR(b, 43, 52, 28);
  open(b, [[38, 10], [54, 9], [8, 30], [36, 31], [47, 28], [48, 28], [7, 17], [8, 17], [16, 10], [22, 10], [28, 10], [22, 17], [23, 17], [38, 17], [39, 17], [51, 17], [58, 17], [8, 21], [18, 21], [26, 21], [27, 21], [36, 25], [47, 25], [48, 25], [57, 25]]);
  put(b, [[26, 31], [27, 31]], "N"); put(b, [[38, 21], [39, 21]], "L"); put(b, [[57, 38]], "D"); put(b, [[18, 38]], "8");
  put(b, [[1, 33], [62, 9], [20, 38], [62, 22], [1, 12]], "W");
  [[4, 1], [10, 1], [1, 6], [50, 1], [58, 1], [62, 5], [62, 13], [1, 25], [1, 35], [62, 27], [62, 36], [34, 38], [39, 38], [46, 38], [50, 38]].forEach(([x, y]) => windowAt(b, x, y));
  b.labels = [["Phòng sơ sinh", 7.5, 9.5], ["Khu cách ly", 22.5, 13.5], ["Phòng cách ly 1", 16.5, 5.5], ["Phòng cách ly 2", 22, 5.5], ["Phòng cách ly 3", 28, 5.5], ["Phòng tiêu bản", 38.5, 6], ["Kho tiêu bản", 38.5, 13.5], ["Ngân hàng máu", 50.5, 9.5], ["Phòng truyền máu", 58, 9.5], ["Hành lang tầng 2", 32, 19.5],
    ["Phòng thí nghiệm gen", 8, 26], ["Phòng ghép mô", 8, 34], ["Phòng y tá trực", 18.5, 30], ["Cầu thang khu B", 26.5, 26.5], ["Khu phẫu thuật", 46.5, 23], ["Phòng mổ số 1", 36.5, 28.5], ["Phòng mổ số 2", 36.5, 34.5], ["Phòng rửa tay", 47.5, 26.6], ["Phòng mổ số 3", 47.5, 33], ["Văn phòng Viện trưởng", 57.5, 32]];
  // phòng sơ sinh: 3×3 nôi, mỗi nôi một con búp bê
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = 4 + c * 3.5, y = 4.6 + r * 3.8; RP(b, x, y, "r_crib", 0); spr(b, x + (c - 1) * .05, y, T.doll, .28, { base: .26 }); }
  // tiêu bản: kệ hũ dọc tường, bể ngâm giữa phòng
  for (const x of [33.6, 35.6, 37.6, 39.6, 41.6, 43.6]) RP(b, x, 2.0, "r_jarShelf", NN_, { wall: 1 });
  for (const x of [34, 38.5, 43]) RP(b, x, 6.5, "r_specTank", 0); for (const x of [34.6, 42.6]) { RP(b, x, 17.0, "r_jarShelf", SS_, { wall: 1 }); RP(b, x, 11.0, "r_jarShelf", NN_, { wall: 1 }); } RP(b, 36.5, 14, "r_bodyBag", .4); RP(b, 40.6, 13.8, "r_specTank", 0);
  // ngân hàng máu: túi máu treo, giường truyền máu
  for (const x of [48.4, 50.4, 52.4, 55.8, 57.8, 59.8]) { RP(b, x, 2.0, "r_hBed", NN_, { wall: 1 }); RP(b, x + .8, 3.4, "r_ivStand", 0); } RP(b, 62.0, 11, "r_medCab", Math.PI, { wall: 1 });
  for (const x of [50, 57.5]) RP(b, x, 12.2, "r_trayCart", 0); RP(b, 52, 14.5, "r_gurney", 0); RP(b, 59, 14, "r_monitor", 2);
  // thí nghiệm gen: chuồng, bể ngâm
  RP(b, 4.4, 25, "r_cage", 0); RP(b, 4.4, 28.4, "r_cage", .1); RP(b, 4, 34, "r_surgTable", 0); RP(b, 12.2, 36, "r_bodyBag", 1.4); RP(b, 10, 34.5, "r_specTank", 0); RP(b, 10, 25.5, "r_autopsy", 0); RP(b, 6.5, 34, "r_trayCart", 0);
  // phòng mổ 1 & 3
  RP(b, 36.5, 28.6, "r_surgTable", 0); RP(b, 33.6, 27.4, "r_monitor", .8); RP(b, 36.5, 34.6, "r_surgTable", 0); RP(b, 39, 35.2, "r_trayCart", 0); RP(b, 33.2, 35.6, "r_ivStand", 0);
  RP(b, 47.5, 32.4, "r_surgTable", 0); RP(b, 45, 30.2, "r_monitor", .7); RP(b, 50.4, 30.4, "r_ivStand", 0); RP(b, 43.0, 34.6, "r_jarShelf", 0, { wall: 1 }); RP(b, 44.6, 26.0, "r_sinkP", NN_, { wall: 1 }); RP(b, 50.4, 26.0, "r_sinkP", NN_, { wall: 1 });
  b.sprites.push({ x: 49.4, y: 34.3, k: "r_heartJar", rot: 0, act: "heart", reach: 1.6, wide: .4, solid: .25 });
  keepFree(b, 47.5, 36.2); keepFree(b, 47.5, 35.2);
  // văn phòng viện trưởng
  RP(b, 57.5, 30, "r_officeDesk", 0); RP(b, 54.0, 33, "r_bookTall", 0, { wall: 1 }); RP(b, 62.0, 31.5, "r_jarShelf", Math.PI, { wall: 1 }); RP(b, 62.0, 33.6, "r_filing", Math.PI, { wall: 1 });
  // phòng y tá & khu cách ly
  RP(b, 18.5, 26, "r_officeDesk", 0); RP(b, 16.0, 31, "r_medCab", 0, { wall: 1 }); RP(b, 17, 2.0, "r_bedS", NN_, { wall: 1 }); RP(b, 22, 6, "r_strapChair", SS_); RP(b, 28, 2.0, "r_bedS", NN_, { wall: 1 });
  keepFree(b, 27, 29.4);
  [[4.5, 5], [10.5, 5], [4.5, 12], [10.5, 12], [16.5, 5.5], [22, 5.5], [28, 5.5], [19, 13.5], [26, 13.5], [35, 5], [42, 5], [35, 13], [42, 13], [50, 6], [57, 6], [50, 13], [57, 13],
    [6, 19.5], [14, 19.5], [22, 19.5], [30, 19.5], [38, 19.5], [46, 19.5], [54, 19.5], [60, 19.5], [5, 26], [11, 26], [5, 33], [11, 33], [18.5, 25], [18.5, 33], [26.5, 25], [36, 23], [46, 23], [56, 23], [36.5, 27], [36.5, 35.6], [47.5, 26.6], [57.5, 29], [57.5, 35]].forEach(([x, y]) => hTube(b, x, y, Math.random() < .5));
  b.lights.push({ x: 47.5, y: 32.4, h: 1.45, i: 1.1, r: .8, g: 1, b: .95, f: .35, power: true }, { x: 36.5, y: 28.6, h: 1.4, i: .9, r: .8, g: 1, b: .95, f: .35, power: true }, { x: 36.5, y: 34.6, h: 1.4, i: .8, r: .8, g: 1, b: .95, f: .35, power: true });   // đèn mổ
  b.lights.push({ x: 47.5, y: 32.4, h: 1.2, i: .55, r: 1, g: .1, b: .08, f: .5, cond: () => !S.power }, { x: 38.5, y: 6.5, h: .9, i: .5, r: .3, g: 1, b: .45, f: .45 }, { x: 7.5, y: 9.5, h: 1, i: .32, r: 1, g: .6, b: .3, f: .5 });
  [[32, 19.5], [8, 30], [22.5, 13.5], [56, 23]].forEach(([x, y]) => red(b, x, y));
  b.bats = [[3, 15], [29, 3], [44, 15], [60, 15], [13, 36], [20, 36], [40, 36], [60, 36], [17, 15], [3, 23]];

  // =============== TẦNG HẦM · NHÀ XÁC ===============
  const c = makeFloor("b1", "Tầng hầm · Nhà Xác", 50, 30, T.hCeilB, BASE, T.hConcF, .016);
  room(c, 2, 2, 17, 12, TILE, T.hMorF, 1.35);                          // nhà xác
  room(c, 2, 14, 47, 16, BASE, T.hLinoC, 1.3);                         // hành lang hầm
  room(c, 19, 2, 30, 12, TILE, T.hMorF, 1.4);                          // khám nghiệm tử thi
  room(c, 32, 2, 39, 12, BASE, T.hConcF, 1.4);                         // phòng kỹ thuật điện
  room(c, 41, 2, 47, 12, BASE, T.hConcF, 1.35);                        // chuồng nhốt
  room(c, 2, 18, 15, 27, BASE, T.hConcF, 1.6);                         // lò thiêu
  room(c, 17, 18, 30, 27, BASE, T.hConcF, 1.35);                       // kho hóa chất
  room(c, 32, 18, 47, 27, TILE, T.hMorF, 1.5);                         // bể ngâm xác
  open(c, [[9, 13], [10, 13], [24, 13], [35, 13], [44, 13], [8, 17], [9, 17], [23, 17], [39, 17], [40, 17]]);
  put(c, [[5, 1], [6, 1]], "u"); put(c, [[35, 1]], "Z"); put(c, [[1, 22], [1, 23]], "O"); put(c, [[1, 8], [48, 8], [48, 15], [1, 26], [23, 28], [43, 28]], "W");
  c.labels = [["Nhà xác", 9.5, 7.5], ["Hành lang hầm", 25, 15], ["Phòng khám nghiệm", 24.5, 7.5], ["Phòng kỹ thuật điện", 35.5, 7.5], ["Chuồng nhốt", 44, 7.5], ["Lò thiêu xác", 8.5, 22.5], ["Kho hóa chất", 23.5, 22.5], ["Bể ngâm xác", 39.5, 22.5]];
  // 6 ngăn tủ lạnh nhà xác (một ngăn có cầu chì)
  for (let i = 0; i < 6; i++) RP(c, 8.7 + i * .95, 2.0, "r_drawer", NN_, { wall: 1, act: "drawer", idx: i, reach: 1.5, wide: .28 });
  RP(c, 17.99, 6.5, "r_morgueWall", Math.PI, { wall: 1 }); RP(c, 2.0, 5.5, "r_morgueWall", 0, { wall: 1 });
  RP(c, 6, 8.5, "r_gurney", 0); RP(c, 12, 9.5, "r_bodyBag", .2); RP(c, 14.6, 9, "r_gurney", .4); keepFree(c, 6, 2.8);
  RP(c, 22.5, 7, "r_autopsy", 0); RP(c, 27, 7, "r_autopsy", 0); RP(c, 24.8, 10.5, "r_trayCart", 0); RP(c, 31.0, 3.6, "r_morgueWall", Math.PI, { wall: 1 });
  c.sprites.push({ x: 37.6, y: 8.6, k: "generator", rot: Math.PI / 2, solid: 1.05 }); RP(c, 32.0, 9.5, "r_elecCab", 0, { wall: 1 });
  for (const [x, y] of [[43, 4.4], [46, 4.4], [43, 9], [46, 9]]) RP(c, x, y, "r_cage", 0);
  RP(c, 6, 21, "r_gurney", NN_); RP(c, 10, 25, "r_bodyBag", 1.2); RP(c, 12, 20.5, "r_bodyBag", .3); RP(c, 5.5, 25.5, "r_bodyBag", -.3);
  for (const x of [35, 39.5, 44]) { RP(c, x, 20.6, "r_specTank", 0); RP(c, x, 25, "r_bodyBag", 0); }
  [[5, 5], [12, 5], [5, 10], [12, 10], [8, 15], [18, 15], [28, 15], [38, 15], [46, 15], [22, 5], [27, 5], [24.5, 10], [35.5, 5], [44, 6], [5, 20], [11, 24], [20, 20], [27, 25], [35, 22], [44, 22]].forEach(([x, y]) => hTube(c, x, y, Math.random() < .6));
  c.lights.push({ x: 2.2, y: 22.5, h: .5, i: .7, r: 1, g: .45, b: .15, f: .5, cond: () => S.burned }, { x: 39.5, y: 22.5, h: .8, i: .45, r: .3, g: 1, b: .45, f: .45 }, { x: 36, y: 2.8, h: 1, i: .35, r: 1, g: .1, b: .05, f: .5, cond: () => !S.power });
  [[9.5, 7.5], [25, 15], [8.5, 22.5], [44, 7.5]].forEach(([x, y]) => red(c, x, y));
  c.bats = [[3, 11], [16, 3], [29, 11], [38, 3], [46, 11], [3, 26], [29, 19], [46, 26]];

  // pin theo cấp độ, rải đều 3 tầng
  const all = []; for (const f of [a, b, c]) for (const p of f.bats) all.push([f, p]);
  all.sort(() => Math.random() - .5).slice(0, Math.max(2, D.bat - 1)).forEach(([f, [x, y]]) => spr(f, x + .5, y + .5, T.battery, .18, { kind: "battery" }));
  [a, b, c].forEach(hospFloorT);
}

// ---------- 3. ĐỒ VẬT BỆNH VIỆN (đơn vị mét) ----------
Object.assign(RMETA, { r_hBed: [1.0, 2.1], r_gurney: [.7, 2.0], r_ivStand: [.5, .5], r_wheelchair: [.7, .9], r_surgTable: [1.1, 2.3], r_trayCart: [.6, .5], r_monitor: [.55, .55], r_medCab: [1.0, .42],
  r_jarShelf: [1.6, .45], r_specTank: [.95, .95], r_morgueWall: [1.9, .9], r_drawer: [.8, .9], r_bodyBag: [.6, 1.9], r_autopsy: [.9, 2.1], r_cage: [1.3, 1.3], r_strapChair: [.8, .8], r_screen: [1.8, .4],
  r_benchRow: [2.2, .6], r_recDesk: [3.0, .9], r_heartJar: [.5, .5], r_xrayBox: [.8, .1], r_hSign: [.6, .1] });
RMOUNT.add("r_xrayBox"); RMOUNT.add("r_hSign");
Object.assign(OPENABLE, { r_medCab: "tủ thuốc", r_morgueWall: "ngăn tủ nhà xác" });
LOOT_TXT.r_medCab = ["Những lọ thuốc mê dán nhãn tay: “Liều cho người lớn × 3”.", "Một hộp kim khâu phẫu thuật đã dùng hết. Chỉ khâu màu đen, loại dùng cho da dày.", "Một lọ thủy tinh đựng... những móng tay.", "Những ống tiêm đầy một thứ dịch xanh lét, vẫn còn ấm."];
LOOT_TXT.r_morgueWall = ["Một túi đựng xác. Khóa kéo đang mở hé — bên trong có hai bàn tay, nhưng chỉ một cánh tay.", "Ngăn trống. Mặt trong cánh cửa chi chít vết cào — từ bên trong.", "Thẻ ở ngón chân ghi: “BN 31 — CHƯA CHẾT HẲN. ĐỂ THEO DÕI.”", "Một thi thể nhỏ quấn vải trắng. Trên ngực đặt một con gấu bông."];
function hospModel(v, s) {
  const rot = s.rot ?? 0, f0 = facing(rot), X = XF(s.x, s.base || 0, s.y, f0.c, f0.s, M), sd = s.seed ?? .5, rr = k => (Math.sin(sd * 917 + k * 71.3) + 1) / 2;
  const B = (a, b, c, d, e, g, m) => pbox(v, X, a, b, c, d, e, g, m), C = (x, z, y0, y1, r0, r1, n, m, cap) => pcyl(v, X, x, z, y0, y1, r0, r1, n, m, cap === undefined ? m : cap);
  const CX = (y, z, x0, x1, r, n, m, cap) => pcylX(v, X, y, z, x0, x1, r, n, m, cap === undefined ? m : cap), SP = (x, y, z, r, n, m, sx = 1, sy = 1, sz = 1) => psphere(v, sx === 1 && sy === 1 && sz === 1 ? X : XSp(X, x, y, z, sx, sy, sz), x, y, z, r, n, m);
  const Sub = (x, z, da = 0, y = 0, k = M) => { const p = X.p(x, y, z), q = facing(rot + da); return XF(p[0], p[1], p[2], q.c, q.s, k); };
  const H = (s.rh ?? ceilAt(s.x, s.y)) / M, mt = T.metal, dw = T.darkwood, sh = T.hSheet, cp = T.hCorpse, grey = T.r_greyP || mt;
  const wheel = (x, z) => { C(x, z, .02, .1, .012, .012, 5, mt); SP(x, .045, z, .045, 6, T.dark); };
  switch (s.k) {
    case "r_hBed": { const L = 2.0, W = .48; B(-W, .3, .05, W, .36, L, mt); B(-W + .02, .36, .07, W - .02, .5, L - .02, T.hMatt);
      for (const [x, z] of [[-W + .05, .12], [W - .05, .12], [-W + .05, L - .08], [W - .05, L - .08]]) { C(x, z, .08, .3, .02, .02, 6, mt); wheel(x, z); }
      B(-W, .3, 0, W, 1.05, .05, mt); B(-W + .05, .55, .01, W - .05, .98, .045, grey); B(-W, .3, L - .04, W, .78, L, mt);
      for (const sx of [-1, 1]) { B(sx * W - .015, .66, .45, sx * W + .015, .68, 1.5, mt); for (let z = .5; z < 1.5; z += .24) B(sx * W - .01, .5, z, sx * W + .01, .66, z + .02, mt); }
      if (!s.empty && rr(1) < .42) { SP(0, .58, .3, .13, 8, sh, 1, .75, 1.2); B(-.25, .5, .48, .25, .68, 1.75, sh); SP(-.09, .62, 1.86, .06, 6, sh, 1, 1, 1.5); SP(.09, .62, 1.86, .06, 6, sh, 1, 1, 1.5);
        if (rr(2) < .5) { C(W + .05, 1.0, .14, .58, .035, .03, 6, cp); SP(W + .05, .12, 1.0, .045, 6, cp, 1, 1.4, 1); } }
      else { B(-W + .03, .5, .3, W - .03, .54, L - .06, sh); SP(0, .58, .24, .14, 8, T.hSheet, 1.4, .45, .9); }
      if (rr(4) < .55) for (const z of [.75, 1.35]) B(-W - .012, .5, z, W + .012, .57, z + .06, T.r_velvet || dw);
      break; }
    case "r_gurney": { B(-.32, .78, -.95, .32, .84, .95, mt); for (const x of [-.27, .27]) for (const z of [-.88, .88]) { C(x, z, .08, .78, .016, .016, 5, mt); wheel(x, z); } B(-.3, .3, -.85, .3, .32, .85, mt);
      if (rr(1) < .6) { B(-.28, .84, -.9, .28, .9, .9, sh); SP(0, .97, -.68, .12, 8, sh, 1, .7, 1.15); B(-.21, .89, -.52, .21, 1.03, .72, sh); if (rr(2) < .65) B(-.18, 1.031, -.25, .16, 1.036, .25, T.hBloodM);
        if (rr(3) < .55) { C(.34, .35, .32, .86, .03, .026, 6, cp); SP(.34, .3, .35, .04, 6, cp, 1, 1.4, 1); } }
      else { B(-.28, .84, -.9, .28, .87, .9, T.hMatt); if (rr(4) < .5) { B(-.31, .86, .2, .31, .9, .28, T.r_velvet || dw); B(-.31, .86, -.4, .31, .9, -.32, T.r_velvet || dw); } }
      break; }
    case "r_ivStand": { for (let i = 0; i < 5; i++) { const Q = Sub(0, 0, i * 1.2566); pbox(v, Q, -.014, .05, 0, .014, .075, .28, mt); psphere(v, Q, 0, .035, .28, .035, 5, T.dark); }
      C(0, 0, .06, 1.95, .012, .012, 6, mt); B(-.2, 1.9, -.008, .2, 1.92, .008, mt); B(-.15, 1.55, -.04, -.02, 1.86, .03, T.hIVBag); C(-.085, 0, .9, 1.55, .005, .005, 4, T.hTubeR);
      if (rr(1) < .5) { B(.04, 1.6, -.03, .17, 1.86, .03, T.hIVBag); C(.1, 0, 1.05, 1.6, .005, .005, 4, T.hTubeR); } break; }
    case "r_wheelchair": { const seat = T.r_velvet || T.dark; B(-.23, .48, -.22, .23, .53, .22, seat); B(-.23, .53, -.25, .23, 1.0, -.21, seat);
      for (const sx of [-1, 1]) { CX(.3, -.02, sx * .27 - .015, sx * .27 + .015, .3, 14, mt, null); CX(.3, -.02, sx * .28 - .012, sx * .28 + .012, .27, 12, T.dark, null); C(sx * .2, .3, .05, .48, .012, .012, 5, mt); wheel(sx * .2, .3);
        B(sx * .25 - .02, .7, -.2, sx * .25 + .02, .73, .2, mt); C(sx * .21, -.24, .53, 1.12, .012, .012, 5, mt); }
      B(-.18, .12, .33, .18, .14, .46, mt);
      if (rr(1) < .3) { SP(0, .74, -.06, .15, 8, T.hGown, 1, 1.5, .8); SP(0, 1.02, .02, .1, 8, T.hFacePat, 1, 1.15, 1); for (const sx of [-1, 1]) C(sx * .14, .18, .2, .5, .04, .035, 6, T.hCorpse); }
      break; }
    case "r_surgTable": { C(0, 0, 0, .06, .35, .38, 12, mt); C(0, 0, .06, .8, .1, .12, 10, mt); B(-.3, .8, -1.0, .3, .9, 1.0, mt); B(-.28, .9, -.98, .28, .94, .98, T.dark);
      for (const sx of [-1, 1]) B(sx * .3 - .01, .78, -.6, sx * .3 + .01, .9, .6, mt);
      if (rr(1) < .75) { B(-.24, .94, -.72, .24, 1.08, .82, sh); SP(0, 1.02, -.85, .11, 8, cp, 1, .8, 1.15); B(-.13, 1.08, -.25, .13, 1.09, .32, T.hBloodM); C(.31, .1, .5, .95, .03, .028, 6, cp); SP(.31, .45, .1, .04, 6, cp, 1, 1.4, 1);
        for (let i = 0; i < 5; i++) B(-.1 + i * .05, 1.09, -.2, -.095 + i * .05, 1.1, .3, T.dark); }
      const top = Math.min(H - .02, 3.2); C(0, 0, top - .85, top, .015, .015, 5, mt); C(0, 0, top - .98, top - .85, .42, .18, 16, mt, T.bulbOn); C(.65, -.3, top - .7, top, .012, .012, 5, mt); C(.65, -.3, top - .8, top - .7, .25, .12, 12, mt, T.bulbOn);
      B(.42, .92, -.35, .78, .935, .15, T.hTray); C(.6, -.1, 0, .92, .015, .015, 5, mt); C(.6, -.1, 0, .03, .2, .2, 8, mt);
      if (rr(5) < .6) for (let i = 0; i < 9; i++) B(-.6 + h32(i, 3) * 1.2, .002, -1 + h32(i, 7) * 2, -.5 + h32(i, 3) * 1.2, .006, -.9 + h32(i, 7) * 2, T.hBloodM);
      break; }
    case "r_trayCart": { for (const y of [.15, .55, .9]) B(-.28, y, -.22, .28, y + .02, .22, mt); for (const x of [-.27, .25]) for (const z of [-.21, .19]) { C(x + .01, z + .01, .06, .92, .01, .01, 5, mt); wheel(x + .01, z + .01); }
      B(-.25, .92, -.2, .25, .925, .2, T.hTray); B(-.2, .57, -.15, .05, .67, .1, T.hSheet); if (rr(1) < .6) B(.02, .57, -.1, .22, .6, .12, T.hBloodM); if (rr(2) < .5) { SP(.1, .97, .05, .05, 7, T.hHeart || T.hBloodM, 1.2, .8, 1); } break; }
    case "r_monitor": { for (let i = 0; i < 5; i++) { const Q = Sub(0, 0, i * 1.2566); pbox(v, Q, -.014, .05, 0, .014, .075, .25, mt); psphere(v, Q, 0, .035, .25, .035, 5, T.dark); }
      C(0, 0, .06, 1.25, .018, .018, 6, mt); B(-.24, 1.2, -.1, .24, 1.55, .12, T.plastic || T.dark); B(-.2, 1.24, .12, .2, 1.51, .125, s.off ? T.hMonOff : (rr(1) < .65 ? T.hMon : T.hMonOff));
      C(.2, 0, .7, 1.22, .006, .006, 4, T.dark); break; }
    case "r_medCab": { const top = 1.9; B(-.5, 0, 0, .5, .85, .4, grey); B(-.5, .85, 0, .5, top, .3, grey); B(-.52, top, 0, .52, top + .04, .32, grey);
      for (const y of [1.15, 1.45, 1.72]) B(-.47, y, .02, .47, y + .02, .28, mt);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) { if (rr(r * 6 + i) < .25) continue; const x = -.4 + i * .16, y = [.87, 1.17, 1.47][r], hh = .1 + rr(i + 9 * r) * .12; C(x, .15, y, y + hh, .035, .03, 7, [T.glassG, T.glassB, T.r_amber || T.glassR, T.hJarB][Math.floor(rr(i * 2 + r) * 4)], T.metal); }
      if (!s.open) { for (const x of [-.48, -.02, .02, .46]) B(x, .87, .3, x + .02, top - .02, .32, grey); B(-.48, .87, .3, .48, .89, .32, grey); B(-.48, top - .04, .3, .48, top - .02, .32, grey); }
      else { const Q = Sub(-.48, .32, -1.35); pbox(v, Q, -.01, .87, 0, .01, top - .02, .02, grey); pbox(v, Q, -.01, .87, .44, .01, top - .02, .46, grey); pbox(v, Q, -.01, .87, 0, .01, .89, .46, grey); pbox(v, Q, -.01, top - .04, 0, .01, top - .02, .46, grey); }
      B(-.48, .05, .4, -.01, .82, .41, grey); B(.01, .05, .4, .48, .82, .41, grey); for (const x of [-.06, .06]) B(x - .01, .4, .41, x + .01, .5, .43, mt);
      break; }
    case "r_jarShelf": { for (const x of [-.78, .75]) for (const z of [.02, .4]) B(x, 0, z, x + .03, 1.9, z + .03, mt); for (const y of [.1, .7, 1.3, 1.88]) B(-.8, y, 0, .8, y + .025, .45, mt);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { if (rr(r * 4 + i) < .15) continue; const x = -.6 + i * .4 + (rr(i + 20) - .5) * .08, y = [.125, .725, 1.325][r], h2 = .22 + rr(i + r * 7) * .2, rad = .08 + rr(i * 3 + r) * .05;
        C(x, .22, y, y + h2, rad, rad, 10, rr(i + r) < .6 ? T.hJar : T.hJarB, T.metal); C(x, .22, y + h2, y + h2 + .03, rad * .92, rad * .92, 10, T.metal); }
      break; }
    case "r_specTank": { C(0, 0, 0, .25, .5, .52, 16, mt); C(0, 0, 2.15, 2.35, .5, .48, 16, mt); pcyl(v, X, 0, 0, .25, 2.15, .44, .44, 18, T.hJar, null, Math.PI * .72, Math.PI * 2.28); for (const a of [-.5, 0, .5]) C(Math.sin(a) * .45, Math.cos(a) * .45, .25, 2.15, .018, .018, 5, mt);
      C(0, 0, 2.35, H, .03, .03, 5, mt); const Q = Sub(0, -.05, 0, .35 + Math.sin(sd * 9) * .08, M * .78);
      humanoid(v, Q, { skin: cp, face: rr(3) < .5 ? T.hFacePat : T.hFaceDoc, top: cp, bottom: cp, shoe: cp, slim: .85 }, { armL: -.3 - rr(4) * .4, armR: .2 + rr(5) * .3, elL: -.4, elR: -.6, headAx: .5, headAz: (rr(6) - .5) * .8, knee: .3, hunch: .2 });
      if (rr(7) < .6) psphere(v, Q, .16, 1.58, 0, .1, 9, T.hFacePat, 1.15);   // đầu thứ hai mọc trên vai
      break; }
    case "r_morgueWall": { const top = 1.95, dz = .9; B(-.95, 0, 0, .95, top, dz, mt); for (let c2 = 0; c2 < 3; c2++) for (let r = 0; r < 2; r++) { const x0 = -.92 + c2 * .62, y0 = .12 + r * .92, op = s.open && c2 === 1 && r === 0;
        if (op) { B(x0 + .04, y0 + .08, dz, x0 + .54, y0 + .22, dz + 1.5, mt); B(x0 + .08, y0 + .22, dz + .1, x0 + .5, y0 + .38, dz + 1.4, T.hBag); SP(x0 + .29, y0 + .34, dz + .25, .12, 8, T.hBag, 1, .8, 1.2); B(x0 + .02, y0 + .02, dz + 1.5, x0 + .56, y0 + .8, dz + 1.53, mt); }
        else { B(x0 + .02, y0 + .02, dz, x0 + .58, y0 + .82, dz + .02, mt); B(x0 + .45, y0 + .38, dz + .02, x0 + .5, y0 + .5, dz + .07, T.dark); B(x0 + .1, y0 + .62, dz + .02, x0 + .3, y0 + .72, dz + .025, T.paperSheet); } } break; }
    case "r_drawer": { const top = 1.95, dz = .9; B(-.4, 0, 0, .4, top, dz, mt); for (let r = 0; r < 3; r++) { const y0 = .08 + r * .62, op = s.open && r === 1;
        if (op) { B(-.34, y0 + .06, dz, .34, y0 + .2, dz + 1.55, mt); B(-.27, y0 + .2, dz + .12, .27, y0 + .32, dz + 1.42, s.idx === S.drawer ? T.hSheet : T.hBag); SP(0, y0 + .3, dz + .28, .1, 8, s.idx === S.drawer ? cp : T.hBag, 1, .9, 1.1);
          if (s.idx === S.drawer && !S.fuse) B(-.05, y0 + .32, dz + .7, .05, y0 + .38, dz + .82, T.r_porc || T.porcelain || T.enamel); B(-.37, y0, dz + 1.55, .37, y0 + .56, dz + 1.58, mt); }
        else { B(-.37, y0, dz, .37, y0 + .56, dz + .02, mt); B(-.06, y0 + .24, dz + .02, .06, y0 + .31, dz + .07, T.dark); } B(-.1, y0 + .44, dz + .021, .1, y0 + .52, dz + .024, T.paperSheet); }
      for (let i = 0; i <= s.idx; i++) B(-.3 + i * .1, top - .12, dz + .002, -.25 + i * .1, top - .04, dz + .006, T.hBloodM);   // số ngăn vạch bằng sơn đỏ
      break; }
    case "r_bodyBag": { SP(0, .13, 0, .3, 10, T.hBag, 1, .45, 3.0); SP(0, .14, -.78, .16, 8, T.hBag, 1, .8, 1.1); if (rr(1) < .4) { C(.3, .3, .02, .08, .035, .03, 6, cp); SP(.33, .05, .42, .05, 6, cp, 1.3, .6, 1); } break; }
    case "r_autopsy": { C(0, -.6, 0, .82, .08, .1, 8, mt); C(0, .6, 0, .82, .08, .1, 8, mt); B(-.4, .82, -1.0, .4, .86, 1.0, mt); for (const sx of [-1, 1]) B(sx * .4 - .02, .86, -1.0, sx * .4 + .02, .92, 1.0, mt); B(-.4, .86, .98, .4, .92, 1.0, mt);
      C(0, .95, .3, .82, .03, .03, 6, mt); B(-.1, .86, -.9, .1, .96, -.78, mt);
      if (rr(1) < .7) { SP(0, .97, -.76, .11, 8, cp, 1, .8, 1.15); B(-.17, .87, -.6, .17, 1.0, .25, cp); B(-.16, .87, .25, -.02, .95, .85, cp); B(.02, .87, .25, .16, .95, .85, cp); for (const sx of [-1, 1]) B(sx * .22 - .04, .87, -.55, sx * .22 + .04, .93, .1, cp); B(-.09, 1.0, -.5, .09, 1.003, .2, T.hBloodM); }
      break; }
    case "r_cage": { const h = 1.5, w = .6; for (let i = 0; i <= 8; i++) { const q = -w + i * w / 4; C(q, -w, 0, h, .012, .012, 5, T.rust || mt); C(q, w, 0, h, .012, .012, 5, T.rust || mt); C(-w, q, 0, h, .012, .012, 5, T.rust || mt); C(w, q, 0, h, .012, .012, 5, T.rust || mt); }
      B(-w, h, -w, w, h + .04, w, T.rust || mt); B(-w, 0, -w, w, .04, w, T.rust || mt);
      if (rr(1) < .45) { const Q = Sub(0, 0, rr(2) * 6, -.35, M * .62); humanoid(v, Q, { skin: T.hSkinDoc, face: T.hFacePat, top: T.hGown, bottom: T.hGown, shoe: T.hSkinDoc, slim: .7 }, { sit: 1, hunch: .55, headAx: .6, armL: -.9, armR: -.9, elL: -1.5, elR: -1.5 }); }
      else if (rr(3) < .6) { SP(.2, .08, .1, .09, 7, T.skull || T.bone); for (let i = 0; i < 4; i++) B(-.3 + i * .15, .04, -.2 + h32(i, 5) * .3, -.1 + i * .15, .07, -.18 + h32(i, 5) * .3, T.bone || T.paperSheet); }
      break; }
    case "r_strapChair": { B(-.3, .45, -.28, .3, .52, .28, dw); B(-.3, .52, -.3, .3, 1.35, -.24, dw); for (const [x, z] of [[-.27, -.25], [.25, -.25], [-.27, .24], [.25, .24]]) C(x + .01, z + .01, 0, .45, .025, .025, 6, dw);
      for (const sx of [-1, 1]) { B(sx * .3 - .04, .65, -.25, sx * .3 + .04, .7, .28, dw); B(sx * .3 - .05, .7, .05, sx * .3 + .05, .74, .12, T.r_velvet || T.dark); B(sx * .12 - .04, .1, .26, sx * .12 + .04, .16, .32, T.r_velvet || T.dark); }
      C(0, -.2, 1.35, 1.5, .14, .16, 10, mt); C(0, -.2, 1.5, 1.52, .16, .16, 10, mt); C(.3, -.4, 0, .9, .1, .1, 4, T.dark); B(.22, .9, -.5, .38, 1.15, -.3, T.r_greyP || mt); for (let i = 0; i < 3; i++) B(.24 + i * .05, 1.05, -.3, .27 + i * .05, 1.08, -.29, T.glassR);
      C(0, -.2, 1.15, 1.35, .004, .004, 4, T.dark); break; }
    case "r_screen": for (let i = -1; i <= 1; i++) { const Q = Sub(i * .6, 0, i * .35); pbox(v, Q, -.29, .12, -.01, .29, 1.75, .01, T.hScreen); for (const x of [-.3, .29]) pbox(v, Q, x, 0, -.015, x + .015, 1.8, .015, mt); pbox(v, Q, -.3, 1.75, -.015, .3, 1.8, .015, mt); } break;
    case "r_benchRow": { B(-1.05, .38, -.03, 1.05, .42, .03, mt); for (const x of [-.95, .95]) { B(x - .03, 0, -.25, x + .03, .4, -.2, mt); B(x - .03, 0, .2, x + .03, .4, .25, mt); }
      for (let i = 0; i < 4; i++) { const x = -.78 + i * .52; if (rr(i) < .12) continue; B(x - .22, .42, -.22, x + .22, .46, .22, T.r_amber || T.plastic || T.dark); pbox(v, XL(X, x, .46, -.22, -.12), x - .22, .46, -.26, x + .22, .88, -.22, T.r_amber || T.plastic || T.dark); }
      if (rr(9) < .3) { const Q = Sub(.26, .02, 0, .02, M * .95); humanoid(v, Q, { skin: T.hCorpse, face: T.hFacePat, top: T.hGown, bottom: T.hGown, shoe: T.dark, slim: .8 }, { sit: 1, hunch: .4, headAx: .8, headAz: .4, armL: .1, armR: .2 }); }
      break; }
    case "r_recDesk": { B(-1.5, 0, -.2, 1.5, 1.1, .2, { all: dw, f: T.hDeskR }); B(-1.55, 1.1, -.25, 1.55, 1.14, .25, T.darkwood); B(-1.5, .72, -.45, 1.5, .76, -.2, dw); B(-1.5, 0, -.45, -1.46, .72, -.2, dw);
      B(-1.0, 1.14, -.1, -.6, 1.15, .15, T.paperSheet); B(-.2, 1.14, -.15, .1, 1.24, .05, T.dark); C(.6, .05, 1.14, 1.2, .05, .06, 8, T.brass || mt); for (let i = 0; i < 5; i++) B(.9 + i * .08, 1.14, -.2 + h32(i, 2) * .1, .96 + i * .08, 1.15, .02, T.paperSheet); B(-.4, .76, -.42, .4, .78, -.25, T.hBloodM); break; }
    case "r_heartJar": { C(0, 0, 0, .04, .18, .2, 10, mt); C(0, 0, .04, .86, .02, .02, 6, mt); C(0, 0, .86, .9, .2, .2, 12, mt); pcyl(v, X, 0, 0, .9, 1.2, .14, .14, 14, T.hJar, null, Math.PI * .75, Math.PI * 2.25); C(0, 0, 1.2, 1.24, .15, .15, 12, mt);
      for (const a of [-.6, .6]) C(Math.sin(a) * .14, Math.cos(a) * .14, .9, 1.2, .006, .006, 4, mt); break; }
    case "r_xrayBox": { const y = Math.min(1.6, H - 1); B(-.38, y - .26, 0, .38, y + .26, .06, T.r_greyP || mt); B(-.34, y - .22, .06, .34, y + .22, .065, T.hXrayM); break; }
    case "r_hSign": { const y = Math.min(1.75, H - .8); B(-.3, y - .3, 0, .3, y + .3, .03, T.hSignM); break; }
    default: return false;
  }
  return true;
}
realModel = (o => function (v, s) { if (hospModel.keys.has(s.k) && hospModel(v, s)) return true; return o(v, s); })(realModel);
hospModel.keys = new Set(["r_hBed", "r_gurney", "r_ivStand", "r_wheelchair", "r_surgTable", "r_trayCart", "r_monitor", "r_medCab", "r_jarShelf", "r_specTank", "r_morgueWall", "r_drawer", "r_bodyBag", "r_autopsy", "r_cage", "r_strapChair", "r_screen", "r_benchRow", "r_recDesk", "r_heartJar", "r_xrayBox", "r_hSign"]);

// Đèn tuýp treo xích (vẽ mỗi khung hình để nhấp nháy theo nguồn điện)
SWAY_K.add("hTube");
thing2 = (o => function (v, s) {
  if (s.k !== "hTube") return o(v, s);
  const CH = ceilAt(s.x, s.y), y0 = CH - .3, { c, s: sn } = facing(s.rot || 0), X = XF(s.x, 0, s.y, c, sn, 1), on = tubeOn(s);
  for (const x of [-.18, .18]) pbox(v, X, x - .004, y0 + .03, -.004, x + .004, CH, .004, T.metal);
  pbox(v, X, -.27, y0, -.05, .27, y0 + .035, .05, T.r_greyP || T.metal); pbox(v, X, -.25, y0 - .03, -.025, .25, y0, .025, on ? T.hTubeOn : T.hTubeOff);
  return true;
})(thing2);
// Hũ tiêu bản có trái tim vẫn đang đập (vẽ động)
function hospDyn(v) {
  if (MAPID !== "hospital") return;
  for (const s of F.sprites) if (s.k === "r_heartJar" && !s.taken && Math.abs(s.x - player.x) + Math.abs(s.y - player.y) < 14) {
    const ph = (t * 1.25) % 1, beat = 1 + (ph < .12 ? Math.sin(ph / .12 * Math.PI) * .18 : ph > .22 && ph < .32 ? Math.sin((ph - .22) / .1 * Math.PI) * .1 : 0), X = XF(s.x, 0, s.y, 1, 0, M);
    psphere(v, XSp(X, 0, 1.04, 0, beat * 1.05, beat * 1.2, beat), 0, 1.04, 0, .075, 10, T.hHeart); psphere(v, XSp(X, .03, 1.12, 0, beat, beat, beat), .03, 1.12, 0, .03, 6, T.hHeart);
    pcyl(v, X, -.02, 0, 1.1, 1.18, .015, .012, 5, T.hHeart, T.hHeart);
  }
}
drawCritters = (o => function (v) { o(v); hospDyn(v); })(drawCritters);
// Cưa xương cho Viện trưởng
propAt = (o => function (v, E, x, y, kind) {
  if (kind !== "saw") return o(v, E, x, y, kind);
  pbox(v, E, x - .018, y - .1, -.018, x + .018, y + .03, .018, T.darkwood); pbox(v, E, x - .004, y - .17, .01, x + .004, y - .05, .36, T.metal);
  for (let i = 0; i < 9; i++) pbox(v, E, x - .003, y - .19, .03 + i * .035, x + .003, y - .165, .048 + i * .035, T.metal); pbox(v, E, x - .005, y - .16, .2, x + .005, y - .08, .32, T.hBloodM);
})(propAt);

// Vật gắn tường riêng của bệnh viện: lò thiêu, hộp đèn phim, cầu dao, két thuốc, bàn viện trưởng, cổng chính
function hospProp(v, c, X, tex) {
  const mt = T.metal, grey = T.r_greyP || mt;
  switch (c) {
    case "O": tb(v, X, tex, 0, 6, 128, 128, 0, .62, T.brick || T.darkwood, T.dark); pcyl(v, X, 0, .3, WH * .95, WH * 2, .1, .1, 10, T.rust || mt); pbox(v, X, -.5, 0, .62, .5, .02, 1.0, T.dark); return .62;
    case "P": tb(v, X, tex, 8, 10, 120, 118, 0, .07, grey); return .07;
    case "Z": tb(v, X, tex, 20, 8, 108, 120, 0, .2, mt); pbox(v, X, -.3, .5, 0, -.26, WH, .05, mt); return .2;
    case "G": tb(v, X, tex, 16, 12, 112, 116, 0, .34, mt); return .34;
    case "D": tb(v, X, tex, 2, 70, 126, 128, 0, .6, T.darkwood); pbox(v, X, -.5, WH * (1 - 70 / 128), 0, .5, WH * (1 - 70 / 128) + .025, .64, T.darkwood);
      { const y = WH * (1 - 70 / 128) + .025; pbox(v, X, -.3, y, .2, -.05, y + .006, .45, T.paperSheet); pcyl(v, X, .25, .35, y, y + .14, .05, .05, 10, T.hJar, mt); pcyl(v, X, .25, .35, y + .14, y + .16, .045, .045, 10, mt); pbox(v, X, .02, y, .1, .14, y + .01, .3, T.hBloodM); }
      return .64;
    case "X": tb(v, X, tex, 10, 16, 118, 128, 0, .05, mt); tb(v, X, tex, 10, 16, 14, 128, 0, .12, mt); tb(v, X, tex, 114, 16, 118, 128, 0, .12, mt);
      for (const y of [.42, .5]) pcylX(v, X, y, .07, -.4, .4, .018, 6, T.rust || mt, T.rust || mt); pbox(v, X, -.05, .36, .06, .05, .46, .1, T.brass || mt); return .12;
  }
  return null;
}
buildProp = (o => function (v, c, X, tex, f) { if (MAPID === "hospital") { const d = hospProp(v, c, X, tex); if (d != null) return d; } return o(v, c, X, tex, f); })(buildProp);

// ---------- 4. NHÂN VẬT ----------
HUM_K.hospital = .5; FACE_H.hospital = 1.64 * .5 * 1.12;
// Viện trưởng Khải: cao lêu nghêu, bốn cánh tay (hai cánh ghép), mặt khâu chằng chịt, mắt thứ ba trên trán, cưa xương
function surgeonModel(v, g) {
  const an = walkAnim(g, .3), fd = g.scare ? facing(Math.atan2(player.y - g.y, player.x - g.x)) : faceDir(g), chase = g.scare || g.state === "chase", stun = g.stun > 0;
  const X = XSp(XF(g.x, (g.yo || 0), g.y, fd.c, fd.s, HUM_K.hospital), 0, 0, 0, 1, 1.12, 1), hunch = stun ? .05 : chase ? .24 : .12;
  humanoid(v, X, { skin: T.hSkinDoc, face: T.hFaceDoc, top: T.hGownDoc, bottom: T.hGownDoc, shoe: T.dark, skirt: { m: T.hGownDoc, y0: .36, r: .25 }, slim: .78, claws: true, hand: T.hGlove, fore: T.hSkinDoc, prop: "saw" },
    { sw: an.sw, ph: an.ph, armL: stun ? -2.7 : chase ? -1.5 + Math.sin(t * 8) * .15 : -an.sw * .9, armR: stun ? -2.6 : chase ? -2.4 + Math.max(0, Math.sin(t * 10)) * 1.7 : an.sw * .9, elL: stun ? -1.7 : -.3, elR: stun ? -1.6 : -.25,
      hunch, headAz: stun ? Math.sin(t * 20) * .3 : twitch(g, 3) * .55 + Math.sin(t * .9) * .15, headAx: stun ? -.3 : .22 });
  const B = XL(X, 0, .92, 0, hunch, 0);
  for (const sx of [-1, 1]) {   // cặp tay ghép mọc ra từ mạn sườn
    const A = XL(B, sx * .16, 1.2, .05, (chase ? -1.25 : -.45) + Math.sin(t * 7 + sx) * .35, sx * .55); limb(v, A, sx * .16, .05, 1.22, .97, .034, .028, T.hSkinDoc);
    const E2 = XL(A, sx * .16, .97, .05, -.7 + Math.sin(t * 9 + sx) * .35); limb(v, E2, sx * .16, .05, .97, .76, .028, .02, T.hSkinDoc); psphere(v, E2, sx * .16, .74, .05, .03, 6, T.hGlove);
    for (let k = -1; k <= 1; k++) limb(v, XL(E2, sx * .16, .73, .05, Math.sin(t * 12 + k) * .3), sx * .16 + k * .012, .05, .74, .6, .007, .003, T.bone || T.hSkinDoc, 4);
    for (let i = 0; i < 4; i++) pbox(v, B, sx * .17 - .02, 1.15 + i * .025, -.02, sx * .17 + .02, 1.16 + i * .025, .1, T.dark);   // đường khâu nối
  }
  const Hd = XL(B, 0, 1.52, 0, stun ? -.3 : .22, 0); psphere(v, Hd, 0, 1.71, -.015, .118, 10, T.hCap, .78);
  pbox(v, B, -.1, 1.15, -.25, .09, 1.45, -.18, T.hIVBag); limb(v, B, .05, -.21, 1.18, .9, .007, .007, T.hTubeR, 4);
  for (let i = 0; i < 7; i++) pbox(v, B, -.035, .98 + i * .07, -.19, .035, 1.0 + i * .07, -.14, T.metal);   // ghim kim loại dọc sống lưng
}
// Bệnh nhân đứng bất động (ảo giác): áo bệnh nhân, mặt quấn băng, đầu nghẹo
function hospPatient(v, w, c, s) {
  const X = XF(w.x, 0, w.y, c, s, .47);
  humanoid(v, X, { skin: T.hCorpse, face: T.hFacePat, top: T.hGown, bottom: T.hGown, shoe: T.hCorpse, legs: T.hCorpse, slim: .72, skirt: { m: T.hGown, y0: .5, r: .2 } }, { armL: .06, armR: -.1, elR: -.4, headAz: .75, headAx: .35, hunch: .22 });
  if (h32(w.x * 9 | 0, w.y * 9 | 0) < .5) { pcyl(v, X, .4, .1, 0, 1.95, .012, .012, 6, T.metal, T.metal); pbox(v, X, .3, 1.55, .08, .42, 1.85, .14, T.hIVBag); }
}
paintFace = (o => function (map) {
  if (map !== "hospital") return o(map);
  const c = o("forest"), g = c.getContext("2d"), cx = 256, rr = (a, b) => a + Math.random() * (b - a);
  const line = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.stroke(); };
  g.fillStyle = "rgba(60,90,70,.22)"; g.fillRect(0, 0, 512, 512);
  // đường khâu chéo khắp mặt
  for (const [x0, y0, x1, y1] of [[90, 120, 420, 330], [420, 110, 120, 360], [256, 40, 256, 470], [80, 260, 430, 250]]) { line([[x0, y0], [x1, y1]], 5, "rgba(40,0,0,.8)"); const n = 18; for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2; line([[x - Math.cos(a) * 12, y - Math.sin(a) * 12], [x + Math.cos(a) * 12, y + Math.sin(a) * 12]], 3, "#0a0505"); } }
  // con mắt thứ ba ghép trên trán
  g.fillStyle = "#e8e0d0"; g.beginPath(); g.ellipse(cx, 118, 34, 24, 0, 0, 7); g.fill(); g.fillStyle = "#9a0000"; g.beginPath(); g.arc(cx + rr(-6, 6), 118, 15, 0, 7); g.fill(); g.fillStyle = "#000"; g.beginPath(); g.arc(cx, 118, 6, 0, 7); g.fill();
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; line([[cx + Math.cos(a) * 36, 118 + Math.sin(a) * 26], [cx + Math.cos(a) * 50, 118 + Math.sin(a) * 36]], 3, "#1a0a06"); }
  // khóe miệng bị rạch tới mang tai, ghim kim loại trên đỉnh đầu
  line([[150, 400], [70, 330]], 9, "#2a0000"); line([[362, 400], [442, 330]], 9, "#2a0000"); for (let x = 120; x < 400; x += 22) { g.fillStyle = "#b8b8b8"; g.fillRect(x, 58 + Math.abs(x - 256) * .12, 6, 18); }
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${rr(80, 130) | 0},0,0,${rr(.4, .85)})`; g.beginPath(); g.ellipse(rr(60, 450), rr(60, 480), rr(3, 16), rr(3, 12), 0, 0, 7); g.fill(); }
  const gr = g.createRadialGradient(256, 256, 170, 256, 256, 360); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.9)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  return c;
})(paintFace);

// ---------- 5. VIỆN TRƯỞNG KHẢI: đi tuần cả 3 tầng, nghe tiếng chạy, sợ đèn rọi thẳng vào mắt ----------
function updateSurgeon(dt) {
  hospLive(dt);
  minGhostD = 99; CHASING = 0;
  for (const g of ghosts) {
    if (followFloor(g)) continue;
    const dx = player.x - g.x, dy = player.y - g.y, d = Math.hypot(dx, dy); minGhostD = Math.min(minGhostD, d);
    g.stun = Math.max(0, (g.stun || 0) - dt); g.stunCd = Math.max(0, (g.stunCd || 0) - dt); g.lost = g.lost || 0;
    if (flashOn() && d < 4.3 && g.stunCd <= 0 && lit(g)) { g.stun = 1.4; g.stunCd = 8; noise(.6, 240, .55, .5); flicker(.4); if (!g.stunSaid) { g.stunSaid = 1; say("Hắn rú lên, bốn cánh tay vội che lấy khuôn mặt khâu chằng chịt — hắn không chịu được ánh đèn rọi thẳng vào mắt! CHẠY!"); } }
    if (g.stun > 0) { g.face += dt * 6; continue; }
    const fr = (S.burned ? 1.3 : S.heart ? 1.2 : 1) * 1.1;   // map đặc biệt: nhanh hơn 10% ở mọi cấp
    const sees = !player.hidden && d < (flashOn() ? 14 : 8.5) && Math.abs(angTo(g.face, Math.atan2(dy, dx))) < .8 && lineClear(g.x, g.y, player.x, player.y);
    const smell = S.heart && !S.burned && !player.hidden && d < 18 && Math.random() < dt * .5;   // ngửi thấy trái tim bạn đang mang
    if (sees || (d < 1.6 && !player.hidden)) { if (g.state !== "chase") { noise(.8, 160, .8, .5); noise(.4, 2400, .3, 5, .1); say(S.heart ? "Hắn gào lên đòi lại trái tim! CHẠY!" : "Viện Trưởng đã thấy bạn! Tiếng cưa xương rít lên — CHẠY!"); } g.state = "chase"; g.lx = player.x; g.ly = player.y; g.lost = 0; }
    else if ((g.hunt > t || smell) && g.state !== "chase") { g.state = "search"; g.lx = smell ? player.x : g.hx; g.ly = smell ? player.y : g.hy; g.hunt = 0; g.lost = 0; }
    if (g.state === "chase") { CHASING = 1; if (!sees) { g.lost += dt; if (g.lost > (S.heart ? 6 : 4)) { g.state = "search"; g.lost = 0; } } moveWalk(g, g.lx, g.ly, D.chase * 1.1 * fr * g.mul, dt); }
    else if (g.state === "search") { moveWalk(g, g.lx, g.ly, D.wander * 1.35 * fr, dt); g.lost += dt; if (g.lost > 8 || Math.hypot(g.lx - g.x, g.ly - g.y) < .4) { g.state = "patrol"; const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } }
    else { if (Math.hypot(g.tx - g.x, g.ty - g.y) < .4) { const w = randomFloor(0); g.tx = w.x; g.ty = w.y; } moveWalk(g, g.tx, g.ty, D.wander * .85 * fr, dt); }
    g.step = (g.step || 0) - dt; if (g.step <= 0 && d < 13) { g.step = g.state === "chase" ? .3 : .62; noise(.1, 110, Math.max(.04, .6 - d * .045), .7); if (g.state === "chase" && Math.random() < .5) noise(.25, 2600 + Math.random() * 900, Math.max(.03, .35 - d * .025), 6); }
    if (d < .6) touchPlayer(g, ["Lưỡi cưa xương xé toạc vai bạn... Thêm một lần nữa thôi.", "Bốn bàn tay lạnh ngắt ghì chặt lấy bạn rồi quật xuống sàn! Trốn vào tủ đồ, hoặc rọi đèn vào mắt hắn!"],
      "Bạn tỉnh dậy trên bàn mổ số 3. Đèn mổ bật sáng. Một giọng khàn đặc thì thầm: “Giờ thì hai chị em sẽ không bao giờ phải xa nhau nữa...”");
  }
  heartRate = Math.max(300, Math.min(1400, 250 + minGhostD * 150));
}
const PA_LINES = ["Loa: “Mời bác sĩ Khải đến phòng mổ số 3...”", "Loa: “Bệnh nhân số 47 vui lòng quay về giường.”", "Loa: “Giờ thăm bệnh đã kết thúc... mãi mãi.”", "Loa: “Mã xanh... mã xanh... khoa sơ sinh...”", "Loa: “Ca mổ sẽ bắt đầu sau năm phút. Xin đừng chạy.”", "Loa: “Người nhà bệnh nhân Ngà... xin mời vào nhận xác.”"];
function paVoice() { if (!ac) return; tone(659, 0, .5, .05, "sine"); tone(523, .45, .8, .05, "sine"); noise(2.4, 1400, .05, .4, .3); setTimeout(() => whisperFx(PA_LINES), 900); }
function babyCry(vol = .045) { if (!ac) return; const n = ac.currentTime; for (let k = 0; k < 2; k++) { const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(), l = ac.createOscillator(), lg = ac.createGain(); o.type = "sawtooth"; f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 2.5; l.frequency.value = 7; lg.gain.value = 18; l.connect(lg); lg.connect(o.frequency);
  const t0 = n + k * 1.3; o.frequency.setValueAtTime(430, t0); o.frequency.linearRampToValueAtTime(590, t0 + .35); o.frequency.linearRampToValueAtTime(360, t0 + 1.1); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .08); g.gain.linearRampToValueAtTime(0, t0 + 1.15);
  o.connect(f); f.connect(g); g.connect(BUS.sfx); o.start(t0); l.start(t0); o.stop(t0 + 1.2); l.stop(t0 + 1.2); } }
function hospLive(dt) {
  if (!S.started || S.paused || !ac) return;
  if (!S.paT) S.paT = t + 40; if (t > S.paT) { S.paT = t + 55 + Math.random() * 60; paVoice(); }
  const nursery = (F.id === "h2" && player.x < 14.5 && player.y < 17) || (F.id === "h1" && player.x > 31 && player.x < 46 && player.y > 21);
  S.cryT = (S.cryT || 6) - dt; if (S.cryT <= 0) { S.cryT = nursery ? 6 + Math.random() * 8 : 40 + Math.random() * 50; babyCry(nursery ? .05 : .015); }
  if (has("heart") && !S.burned) { S.hbT = (S.hbT || 0) - dt; if (S.hbT <= 0) { S.hbT = .78; tone(58, 0, .14, .22, "sine"); tone(50, .17, .16, .17, "sine"); } }
}
function hospAmbient() {
  const r = Math.random();
  if (r < .25) whisperFx(MD.whispers);
  else if (r < .4) { paVoice(); }
  else if (r < .55) { babyCry(.03); }
  else if (r < .68) { tone(1000, 0, 2.6, .03, "sine"); setTimeout(() => say("Đâu đó trong bóng tối, một chiếc máy đo nhịp tim kêu một tràng dài... rồi tắt lịm."), 400); }
  else if (r < .8) { noise(.5, 3000, .3, 2); noise(.3, 800, .25, 1, .1); say("Loảng xoảng! Một khay dụng cụ mổ rơi xuống sàn ở phòng bên cạnh."); makeNoise(player.x + (Math.random() - .5) * 10, player.y + (Math.random() - .5) * 10, 10); }
  else genericAmbient();
}

// ---------- 6. CHUỖI NHIỆM VỤ ----------
const H_DIARY = () => `<b>Sổ trực của y tá Nguyệt</b><br><br>— <i>14/7/1996.</i> Cặp song sinh dính liền ở hông được đưa vào. Viện trưởng tự mổ tách. Đứa chị khỏe mạnh, đã trả về cho mẹ. Đứa em, bé Ngà, bị ghi “tử vong”. Nhưng tôi vẫn nghe tiếng con bé khóc dưới nhà xác.<br><br>
— <i>2/9/1997.</i> Tôi giấu cầu chì dự phòng của cầu dao tổng trong <b>ngăn số ${S.drawer + 1}</b> tủ lạnh nhà xác, cạnh con bé. Không có điện, ông ta không mổ được nữa. Phòng kỹ thuật điện ở cuối hành lang hầm.<br><br>
— Mã két thuốc độc ở Nhà thuốc là <b>bốn con số trên phim X-quang</b> của bé Ngà. Phải có điện thì hộp đèn đọc phim mới sáng.<br><br>— <i>Dòng cuối, nét chữ run rẩy:</i> “Viện trưởng giữ trái tim con bé trong phòng mổ số 3. Nó vẫn đập. Phải thiêu nó trong lò thì con bé mới được đi. Xin lỗi con.”`;
const H_FILES9 = () => `<b>Hồ sơ bệnh án — Khoa Dị Nhân (1979–1997)</b><br><br>63 hồ sơ. Mỗi tấm ảnh đều bị gạch chéo bằng mực đỏ.<br>— BN 03: bé trai hai khuôn mặt. “Tách thành công.” Không ghi khuôn mặt nào được giữ lại.<br>— BN 19: thiếu nữ không có tay. Sáu tháng sau: “đã ghép đủ bốn tay”.<br>— BN 47-A và 47-B: song sinh dính liền. 47-A: <i>xuất viện</i>. 47-B: <i>lưu giữ nghiên cứu</i>.<br><br>Ở góc tờ cuối có ai viết thêm bằng bút chì: “47-A rồi sẽ quay về. Chúng luôn quay về.”`;
const H_CHART8 = () => `<b>Lịch mổ tháng 7/1996</b><br><br>Mọi ca đều bị gạch bỏ, trừ một dòng viết lại bằng mực mới tinh, như vừa được ghi đêm nay:<br><br><i>“Ca 47 — GHÉP LẠI. Phòng mổ số 3. Bác sĩ: Khải. Gây mê: không cần.”</i>`;
const H_FILE_D = () => `<b>HỒ SƠ MẬT — CA SỐ 47</b><br><br>Cặp song sinh dính liền ở hông, sinh ngày 14/7/1996. Tách thành công.<br>— 47-A: khỏe mạnh, trả về gia đình. Mẹ được báo đứa em đã chết.<br>— 47-B (Ngà): <b>lưu giữ</b>. Trái tim của B có khả năng tự đập ngoài cơ thể. Bảo quản trong hũ formalin tại <b>Phòng mổ số 3</b>.<br><br>
<i>Ghi chú cuối của Viện trưởng:</i> “Hai nửa của một con người hoàn hảo. Khi ghép lại, tôi sẽ không bao giờ chết. 47-A sẽ quay về — tôi đã gửi thư mời. Chúng luôn quay về.”<br><br>Kẹp trong hồ sơ là một chiếc chìa khóa đồng nặng trịch: <b>“CỔNG CHÍNH”</b>.`;
const HOSPITAL = {
  NAMES: { X: "Cổng chính", Q: "Cửa cuốn khu cầu thang", L: "Cửa khu phẫu thuật", W: "Tủ đồ nhân viên (trốn)", G: "Két thuốc độc", P: "Hộp đèn đọc phim X-quang", Z: "Hộp cầu dao tổng", O: "Lò thiêu xác", D: "Bàn làm việc của Viện trưởng",
    7: "Sổ trực y tá", 8: "Lịch mổ", 9: "Tường hồ sơ bệnh án", U: "Cầu thang lên tầng 2", N: "Cầu thang xuống tầng 1", n: "Cầu thang xuống nhà xác", u: "Cầu thang lên tầng 1" },
  ACTIONS: {
    U: () => travel("h2", 27, 29.5, -Math.PI / 2), N: () => travel("h1", 27, 29.5, -Math.PI / 2), n: () => travel("b1", 6, 2.7, Math.PI / 2), u: () => travel("h1", 6, 36.4, -Math.PI / 2),
    W() { hide(); },
    7() { if (!S.diary) { S.diary = 1; progress(); } showNote(H_DIARY()); addItemOnce("diary", "Sổ trực y tá Nguyệt", () => showNote(H_DIARY())); },
    9() { showNote(H_FILES9()); addItemOnce("files9", "Ghi chép hồ sơ bệnh án", () => showNote(H_FILES9())); },
    8() { showNote(H_CHART8()); noise(.4, 300, .1, .6); },
    Z() {
      if (S.power) return say("Cầu dao tổng đã bật. Cả bệnh viện ù ù tiếng điện.");
      if (!has("fuse")) return say("Hộp cầu dao tổng: một ô cầu chì sứ bị rút mất. Ô trống bị khoanh bằng sơn đỏ.");
      S.power = 1; removeItem("fuse"); progress(); refreshWalls(); flicker(2.8); noise(2.2, 70, .9, .5); noise(.6, 4000, .3, 3, .3); makeNoise(player.x, player.y, 60); if (!S.woke) wakeGhosts();
      setTimeout(() => say("CẠCH! Đèn tuýp chớp nháy rồi bật sáng khắp ba tầng. Loa phóng thanh rè rè... và trên đầu bạn, tiếng cưa xương bắt đầu rít lên. Hắn biết bạn đang ở đây."), 400);
    },
    P() { if (!S.power) return say("Hộp đèn đọc phim tắt ngấm. Trên phim lờ mờ một bộ xương nhỏ có hai cột sống... nhưng không đọc được gì. Cần có điện.");
      if (!S.xray) { S.xray = 1; progress(); } say(`Hộp đèn bật sáng: phim X-quang của BN 47-B — hai cột sống chung một khung chậu. Bốn chiếc đinh nẹp khắc số: ${S.code.split("").join(" · ")}.`); addItemOnce("xray", "Mã két (phim X-quang): " + S.code, () => say("Bốn con số trên phim X-quang: " + S.code)); },
    G() { if (S.pharm) return say("Két đã mở. Bên trong chỉ còn mùi thuốc mê ngòn ngọt.");
      if (!S.power) return say("Bàn phím của két thuốc độc tối om — két khóa điện.");
      openLock("KÉT THUỐC ĐỘC · A", 4, S.code, () => { S.pharm = 1; addItem("keycard", "Thẻ từ khu phẫu thuật"); progress(); noise(.3, 1800, .25); say("Cạch. Trong két: những lọ thuốc mê... và một chiếc thẻ từ dính máu ghi KHU PHẪU THUẬT — TẦNG 2."); }); },
    Q() { if (S.shutter) return; if (!S.power) return say("Cửa cuốn sắt khóa điện. Có vết móng tay cào dọc từ trên xuống dưới. Cần khôi phục điện.");
      S.shutter = 1; for (const x of [26, 27]) FLOORS.h1.grid[21][x] = "."; refreshWalls(); progress(); noise(2.2, 300, .6, .8); makeNoise(player.x, player.y, 25); say("Cửa cuốn rít lên ken két rồi cuộn dần lên. Phía sau là cầu thang lên khu phẫu thuật."); },
    L() { if (S.surg) return; if (!S.power) return say("Đầu đọc thẻ tắt ngấm. Cửa khu phẫu thuật khóa chặt."); if (!has("keycard")) return say("Cửa khu phẫu thuật dùng thẻ từ. Đèn đỏ nhấp nháy. Thẻ có thể nằm trong két thuốc ở Nhà thuốc tầng 1.");
      S.surg = 1; removeItem("keycard"); for (const x of [38, 39]) FLOORS.h2.grid[21][x] = "."; refreshWalls(); progress(); noise(.3, 1800, .3); say("Bíp! Đèn xanh. Hai cánh cửa bật mở. Mùi formalin và thịt sống ùa ra."); },
    D() { if (S.file) return showNote(H_FILE_D()); S.file = 1; addItem("gatekey", "Chìa khóa cổng chính"); progress(); showNote(H_FILE_D()); addItemOnce("fileD", "Hồ sơ mật ca số 47", () => showNote(H_FILE_D())); },
    O() { if (S.burned) return say("Lửa trong lò vẫn cháy đỏ rực. Bạn nghe như có tiếng một bé gái đang hát rất khẽ.");
      if (!has("heart")) return say("Lò thiêu xác. Cửa lò nguội ngắt, đầy tro và những mảnh xương nhỏ. Có lẽ phải mang thứ gì đó xuống đây để thiêu.");
      S.burned = 1; removeItem("heart"); refreshWalls(); progress(); flicker(3); noise(3, 120, .8, .4); noise(1.5, 900, .4, .7, .3); WATCHERS.length = 0;
      for (const g of ghosts) { g.state = "search"; g.lx = player.x; g.ly = player.y; g.lost = 0; }
      setTimeout(() => say("Lửa bùng lên. Trái tim co giật lần cuối rồi im bặt. Một tiếng thở dài nhẹ như gió... và từ trên cao, Viện Trưởng gào lên như bị xé làm đôi. Hắn đang lao xuống. CHẠY RA CỔNG CHÍNH!"), 600); },
    X() { if (!has("gatekey")) return say("Cổng chính bị xích bằng một ổ khóa to bằng nắm tay. Ổ khóa có khắc chữ: “VIỆN TRƯỞNG”.");
      if (!S.burned) return say("Bạn tra chìa vào ổ khóa... nhưng tiếng khóc của một bé gái giữ chân bạn lại. Trái tim của Ngà vẫn còn đập. Bạn không thể bỏ em lại lần nữa.");
      winHospital(); },
  },
  SPRITE_ACTS: {
    drawer(s) {
      if (s.open) return say(`Ngăn số ${s.idx + 1} đã mở.`);
      s.open = 1; buildFloorMesh(F); noise(.5, 500, .35, 1.2); tone(90, 0, .5, .05, "sawtooth");
      if (s.idx === S.drawer) { S.fuse = 1; addItem("fuse", "Cầu chì sứ dự phòng"); progress(); return say(`Ngăn số ${s.idx + 1}: một thi thể bé gái rất nhỏ, quấn khăn trắng — ngực mở toang, trống rỗng. Trên tấm khăn đặt một cầu chì sứ. Thẻ ở ngón chân ghi: “BN 47-B — NGÀ”.`); }
      if (s.idx === S.trap) { makeNoise(player.x, player.y, 18); return jumpScare(() => say("Một bàn tay xám ngoét thò ra chộp lấy cổ tay bạn! Bạn giật mạnh — nó rơi xuống sàn và... vẫn còn co giật.")); }
      say(["Một túi xác đen. Khóa kéo bị kéo từ bên trong ra.", "Một thi thể có bốn bàn tay khâu vào hai cánh tay.", "Trống rỗng. Mặt trong ngăn chi chít vết cào.", "Một đứa trẻ có hai cái đầu, cả hai đều đang mở mắt.", "Chỉ có một chiếc vòng tay bệnh nhân: “BN 31”.", "Một bộ xương nhỏ được khâu lại bằng chỉ đen."][s.idx]);
    },
    heart(s) {
      s.taken = true; buildFloorMesh(F); S.heart = 1; addItem("heart", "Hũ tiêu bản: trái tim của Ngà"); progress(); flicker(3); if (!S.woke) wakeGhosts();
      for (const g of ghosts) { g.mul = Math.max(g.mul || 1, 1.1); g.state = "search"; g.lx = player.x; g.ly = player.y; g.lost = 0; if (g.floor !== F.id) g.arrive = t + 6; }
      for (let i = 0; i < 4; i++) { tone(620, i * .9, .45, .05, "sawtooth"); tone(880, i * .9 + .45, .45, .05, "sawtooth"); }
      say("Trái tim trong hũ... vẫn đang đập. Nó đập cùng nhịp với tim bạn. Còi báo động rú lên khắp bệnh viện — và tiếng cưa xương đang lao về phía bạn. Mang nó xuống LÒ THIÊU ở tầng hầm!");
    },
  },
  SPRITE_NAMES: { drawer: "Mở ngăn tủ nhà xác", heart: "Lấy hũ tiêu bản" },
  GOALS: [
    [() => S.diary, "Đọc sổ trực của y tá Nguyệt treo sau quầy tiếp nhận (sảnh chính, phía tây bắc tầng 1).", "Tìm manh mối ở sảnh chính."],
    [() => S.fuse, () => `Xuống nhà xác (cầu thang cuối Phòng hồi sức cấp cứu, góc tây nam tầng 1). Cầu chì ở ngăn tủ số ${S.drawer + 1}.`, "Tìm cầu chì dưới nhà xác."],
    [() => S.power, "Lắp cầu chì vào hộp cầu dao tổng trong Phòng kỹ thuật điện (cuối hành lang hầm).", "Khôi phục điện cho bệnh viện."],
    [() => S.xray, "Lên Phòng X-quang (tầng 1): đọc bốn con số trên phim của bé Ngà.", "Tìm mã két thuốc."],
    [() => S.pharm, () => `Mở két thuốc độc ở Nhà thuốc (tầng 1). Mã: ${S.code}.`, "Mở két ở Nhà thuốc."],
    [() => S.shutter, "Mở cửa cuốn khu cầu thang B (hành lang chính tầng 1) rồi lên tầng 2.", "Lên khu phẫu thuật."],
    [() => S.surg, "Quẹt thẻ từ ở cửa Khu Phẫu Thuật (hành lang tầng 2).", "Vào khu phẫu thuật."],
    [() => S.file, "Lục bàn làm việc trong Văn phòng Viện trưởng (cuối khu phẫu thuật).", "Tìm hồ sơ mật."],
    [() => S.heart, "Lấy hũ tiêu bản trong Phòng mổ số 3.", "Tìm trái tim của Ngà."],
    [() => S.burned, "Mang hũ tiêu bản xuống Lò thiêu xác ở tầng hầm và thiêu nó. Hắn ngửi thấy nhịp tim — đừng dừng lại!", "Giải thoát linh hồn bé Ngà."],
    [() => false, "Chạy ra cổng chính ở sảnh tầng 1, mở bằng chìa khóa của Viện trưởng!", "Thoát khỏi bệnh viện."],
  ],
  hard: "Mục tiêu: Khôi phục điện, vào khu phẫu thuật, thiêu trái tim của Ngà và thoát qua cổng chính.",
  intro: "Bạn tỉnh dậy trên giường bệnh, cổ tay đeo vòng ghi “BỆNH NHÂN SỐ 47”. Bên hông có một vết khâu mới, còn rỉ máu. Ai đó đã mổ bạn... đêm nay.",
  whispers: ["...chị ơi...", "...về phòng mổ đi...", "...đau quá...", "...trả tay cho em...", "...ngủ đi con...", "...bíp... bíp... bíp...", "...số 47...", "...ghép lại... ghép lại..."],
};
function winHospital() { endWin("THOÁT KHỎI BỆNH VIỆN DỊ NHÂN", "Ổ khóa rơi xuống bậc thềm. Bạn lao ra ngoài trời mưa đúng lúc bốn bàn tay chộp hụt sau gáy.<br><br><i>Dưới ánh đèn đường, bạn nhìn xuống vòng tay bệnh nhân. Dòng chữ đã đổi: “BN 47 — GHÉP LẠI THÀNH CÔNG”.</i>"); }
Object.assign(HOSPITAL, { update: updateSurgeon, model: surgeonModel, build: buildHospital, ambient: hospAmbient, tex: [buildForestTextures, buildCastleTextures, buildFactoryTextures, buildHospitalTextures],
  wakeMsg: "Loa phóng thanh rè rè: “Mời bệnh nhân số 47... về phòng mổ số 3.” Rồi đâu đó trong bệnh viện, tiếng cưa xương bắt đầu rít lên.",
  wallTex: () => ({ w: T.winHosp, X: T.hExit, Q: T.hShutter, L: S.power ? T.hSurgOn : T.hSurgOff, W: T.locker, G: T.hSafe, P: S.power ? T.hXrayOn : T.hXrayOff, Z: S.power ? T.hFuseOn : T.hFuseOff, O: S.burned ? T.hIncinOn : T.hIncinOff, D: T.hDesk, 7: T.hLog, 8: T.hChart, 9: T.hFiles, U: T.stUp, N: T.stDn2, u: T.stUpB, n: T.stDnB }),
  state: () => { const drawer = Math.floor(Math.random() * 6); let trap = Math.floor(Math.random() * 5); if (trap >= drawer) trap++; return { valveTarget: [0, 0, 0, 0], valves: [0, 0, 0, 0], code: String(1000 + Math.floor(Math.random() * 9000)), drawer, trap, diary: 0, fuse: 0, power: 0, xray: 0, pharm: 0, shutter: 0, surg: 0, file: 0, heart: 0, burned: 0, paT: 0 }; },
  start() { F = FLOORS.h1; Object.assign(player, { x: 51.9, y: 4.1, a: Math.PI / 2 }); F.arriveX = 51.9; F.arriveY = 4.1; } });
MAPDEFS.hospital = HOSPITAL; ENEMY_MODEL.hospital = surgeonModel;

// ---------- 7. NHIỆM VỤ PHỤ ----------
TASKDEF.hospital = [
  { id: "A", kind: "collect", name: "Thu nhặt vòng tay bệnh nhân", item: "một vòng tay bệnh nhân khắc số", verb: "Nhặt vòng tay", tex: "tkBand", n: [5, 8] },
  { id: "B", kind: "light", name: "Thắp nến cho những đứa trẻ không tên", verb: "Thắp nến", doneMsg: "Ngọn nến lóe lên. Từ chiếc nôi trống gần đó vang lên một tiếng cười khúc khích rất khẽ", n: [3, 5] },
  { id: "C", kind: "note", name: "Đọc hồ sơ bệnh án Khoa Dị Nhân", verb: "Đọc hồ sơ", noteTitle: "Hồ sơ bệnh án — Khoa Dị Nhân", tex: "tkPage", n: [3, 5], notes: [
    "BN 03 — bé trai sinh ra với hai khuôn mặt. Viện trưởng ghi: “Đã tách. Giữ lại khuôn mặt biết cười.” Khuôn mặt còn lại được tìm thấy trong một hũ thủy tinh ở phòng tiêu bản.",
    "BN 11 — người khổng lồ cao 2 mét 3, bị gia đình xích trong chuồng trâu suốt 20 năm. Ông được đưa đến đây vì “được chữa miễn phí”. Hai tháng sau, đôi chân ông được ghép cho BN 19.",
    "BN 19 — thiếu nữ sinh ra không có tay. Viện trưởng hứa sẽ cho cô “bốn bàn tay”. Ông ta đã giữ lời.",
    "BN 26 — cặp sinh đôi dính liền ở đầu. Ghi chú: “Ca tách thất bại. Một đứa chết, đứa kia không chịu buông tay chị. Đã khâu cả hai vào nhau vĩnh viễn.”",
    "Biên bản họp khoa, 1993: “Đề nghị đổi tên Khoa Dị Nhân thành Khoa Chỉnh Hình để tránh dư luận.” Bên dưới, Viện trưởng ghi: “Không. Chúng phải nhớ mình là gì.”",
    "Nhật ký của y tá Nguyệt: “Hôm nay ông ấy mổ cho chính mình. Ông ta khâu thêm hai cánh tay của BN 19 vào mạn sườn. Ông ta cười suốt ca mổ.”",
    "Đơn của một người mẹ, 1995: “Xin cho tôi được nhìn mặt con lần cuối.” Phía dưới đóng dấu đỏ: “KHÔNG CÒN MẶT ĐỂ NHÌN.”",
    "Ghi chép của Viện trưởng: “Con người chết vì một bộ phận hỏng. Nếu có đủ bộ phận dự trữ, con người sẽ không bao giờ phải chết.”",
    "Danh sách “nguyên liệu” đánh máy: 14 bàn tay, 9 cặp mắt, 3 trái tim. Trái tim thứ ba được khoanh đỏ: “BN 47-B. TỰ ĐẬP. KHÔNG ĐƯỢC THIÊU.”",
    "Mảnh giấy nhét dưới gối, nét chữ trẻ con: “Chị ơi, ông bác sĩ bảo chị sẽ quay lại đón em. Em đợi lâu lắm rồi.”"] }];
TASKX.hospital = [
  { id: "D", kind: "break", model: "specimen", name: "Đập vỡ những hũ tiêu bản", verb: "Đập vỡ hũ", doneMsg: "Thủy tinh vỡ tung, formalin tràn ra sàn. Thứ bên trong cựa quậy một lần cuối rồi nằm im" },
  { id: "E", kind: "switch", model: "monitor", name: "Tắt những máy đo nhịp tim còn chạy", verb: "Rút điện máy đo", doneMsg: "Màn hình tắt phụt. Nhưng tiếng bíp... bíp... vẫn còn vang trong đầu bạn" },
  { id: "F", kind: "photo", name: "Chụp ảnh hồn ma bệnh nhân", verb: "Chụp ảnh", doneMsg: "Đèn flash lóe lên. Trong ảnh là một đứa trẻ có hai cái đầu, đang vẫy tay chào bạn" }];
TASK_FLOORS.hospital = ["h1", "h2", "b1"]; TASK_FLOORS2.hospital = ["h1", "h2", "b1"];
ESC_MSG.hospital = ["Loa phóng thanh rè rè: “Phòng mổ số 3 đã sẵn sàng.” Có thêm tiếng cưa xương vọng lại từ hướng khác.", "Những chiếc giường bệnh cùng lúc rung lên. Có thứ gì đó vừa bò ra khỏi nhà xác.", "Tiếng khóc của trẻ sơ sinh... vọng lại từ cả hai đầu hành lang."];
taskModelX = (o => function (v, s) {
  if (MAPID !== "hospital" || (s.tmodel !== "specimen" && s.tmodel !== "monitor")) return o(v, s);
  const f0 = facing(s.rot || 0), X = XF(s.x, 0, s.y, f0.c, f0.s, M), mt = T.metal, B = (a, b, c, d, e, g, m) => pbox(v, X, a, b, c, d, e, g, m), C = (x, z, y0, y1, r0, r1, n, m, cap) => pcyl(v, X, x, z, y0, y1, r0, r1, n, m, cap === undefined ? m : cap);
  if (s.tmodel === "specimen") {
    C(0, 0, 0, .04, .2, .22, 10, mt); C(0, 0, .04, .7, .025, .025, 6, mt); B(-.2, .7, -.2, .2, .73, .2, mt);
    if (!s.broke) { C(0, 0, .73, 1.12, .14, .14, 14, T.hJar, mt); C(0, 0, 1.12, 1.15, .13, .13, 12, mt); B(-.06, .82, .139, .06, .92, .142, T.paperSheet); }
    else { C(0, 0, .73, .8, .14, .13, 14, T.hJar, T.dark); for (let i = 0; i < 9; i++) { const a = h32(i, s.x * 10 | 0) * 6.28, d = .15 + h32(i, 3) * .35; B(Math.cos(a) * d - .03, 0, Math.sin(a) * d - .02, Math.cos(a) * d + .03, .01, Math.sin(a) * d + .02, T.hJar); }
      B(-.4, .001, -.3, .45, .004, .4, T.hJar); psphere(v, XSp(X, .15, .05, .1, 1.3, .6, 1), .15, .05, .1, .07, 8, T.hCorpse); }
  } else {
    for (let i = 0; i < 4; i++) { const q = facing((s.rot || 0) + i * 1.5708), Q = XF(s.x, 0, s.y, q.c, q.s, M); pbox(v, Q, -.014, .04, 0, .014, .07, .24, mt); }
    C(0, 0, .05, 1.2, .018, .018, 6, mt); B(-.24, 1.15, -.1, .24, 1.5, .12, T.plastic || T.dark); B(-.2, 1.19, .12, .2, 1.46, .125, s.off ? T.hMonOff : T.hMon);
    B(-.12, .95, -.04, .12, 1.15, .04, T.r_greyP || mt); C(.2, 0, .6, 1.17, .006, .006, 4, T.dark);
  }
  return true;
})(taskModelX);
taskAudioTick = (o => function (dt) {
  if (MAPID !== "hospital" || !S.started || S.paused || !ac) return o(dt);
  if ((S.tauT = (S.tauT || 0) - dt) > 0) return; S.tauT = .8;
  let bd = 10; for (const s of F.sprites) if (s.k === "task" && s.tkind === "switch" && !s.off) bd = Math.min(bd, Math.hypot(s.x - P1.x, s.y - P1.y));
  if (bd < 10) tone(1000, 0, .1, Math.max(0, 1 - bd / 10) * .14 + .008, "sine");
})(taskAudioTick);

// ---------- 8. CỐT TRUYỆN & PHIM MỞ ĐẦU ----------
STORY.hospital = {
  intro: ["Năm 1979, Bệnh viện Từ Tâm mở thêm một khoa không có trong bất kỳ sổ sách nào của Sở Y tế: Khoa Dị Nhân. Nơi đây nhận những người mang dị tật bẩm sinh — những đứa trẻ hai đầu, những cặp song sinh dính liền, những người bị chính gia đình xích trong chuồng trâu.",
    "Viện trưởng Lý Văn Khải hứa “chữa miễn phí”. Các gia đình nghèo ký giấy cam kết mà không đọc. Họ không biết mình vừa bán con.",
    "Trong 18 năm, Khải mổ xẻ, cắt ghép không cần gây mê. Bàn tay người này khâu vào người kia, mắt trẻ sơ sinh ghép lên trán người lớn. Ông ta tin rằng nếu có đủ “bộ phận dự trữ”, con người sẽ không bao giờ phải chết.",
    "Đêm 14/7/1996, một cặp song sinh dính liền ở hông được đưa vào. Khải tự tay tách hai đứa. Đứa chị được trả về cho mẹ. Đứa em — bé Ngà — bị ghi là “tử vong”. Nhưng y tá Nguyệt vẫn nghe tiếng con bé khóc dưới nhà xác mỗi đêm.",
    "Ngà không chết. Trái tim của con bé có thể tự đập bên ngoài cơ thể. Khải giữ nó trong một hũ formalin ở phòng mổ số 3, và bắt đầu tự ghép những bộ phận “hoàn hảo nhất” vào chính mình: hai cánh tay của BN 19, con mắt của BN 03...",
    "Đêm 3/9/1997, y tá Nguyệt mở cửa các phòng cách ly rồi rút cầu chì cầu dao tổng. Trong bóng tối, 63 bệnh nhân bắt được Khải. Sáng hôm sau người ta chỉ thấy bàn mổ đẫm máu, 63 chiếc giường trống — và không một thi thể nào.",
    "Bệnh viện bị niêm phong, hồ sơ bị đốt. 29 năm trôi qua. Tuần trước, mẹ bạn mất. Trước lúc đi, bà nắm tay bạn thì thầm: “Con có một đứa em... nó tên là Ngà... mẹ chưa từng được nhìn mặt nó.”",
    "Ba ngày sau, bạn nhận được một lá thư không tem, viết bằng mực đỏ: <i>“Mời bệnh nhân số 47 quay lại tái khám. — Viện trưởng.”</i>",
    "Bạn đến bệnh viện lúc nửa đêm để tìm sự thật. Bạn chỉ nhớ một mùi thuốc mê ngòn ngọt... rồi tất cả tối sầm lại."],
  end: ["Lửa trong lò thiêu nuốt lấy trái tim nhỏ. Khắp bệnh viện, những chiếc nôi trống đồng loạt ngừng đung đưa.",
    "Bạn lao qua cổng chính đúng lúc Viện trưởng Khải đổ sụp xuống sau lưng — những đường khâu trên người hắn bục ra từng sợi, các bộ phận ghép rơi xuống sàn như những món đồ mượn bị trả lại.",
    "Sáng hôm sau, cảnh sát đào được 63 bộ hài cốt dưới nền nhà xác. Hồ sơ Khoa Dị Nhân bạn mang ra được đăng trên mọi mặt báo. Lần đầu tiên sau 29 năm, những người mẹ được nhận lại con mình.",
    "Bạn mang tro của Ngà về đặt cạnh mộ mẹ. Đêm ấy bạn mơ thấy một bé gái giống hệt mình, nắm tay bạn và cười.",
    "Nhưng mỗi khi đêm xuống, đặt tay lên ngực, bạn vẫn nghe thấy <i>hai</i> nhịp tim. Vết khâu bên hông bạn chưa bao giờ lành hẳn."] };
Object.assign(ACTOR, {
  doctorK: { k: .47, o: () => ({ skin: T.skinA, face: T.faceA, top: T.hCoat, bottom: T.clBlack, hair: T.hairT, prop: "saw" }) },
  nurse: { k: .44, o: () => ({ skin: T.skinA, face: T.faceA, top: T.clWhite, bottom: T.clWhite, shoe: T.clWhite, hair: T.hairT, hairLen: "bun", skirt: { m: T.clWhite, y0: .3, r: .26 } }) },
  patient: { k: .44, o: () => ({ skin: T.hCorpse, face: T.hFacePat, top: T.hGown, bottom: T.hGown, shoe: T.hCorpse, slim: .78 }) },
  surgeon: { enemy: "hospital" } });
CUTS.hospital = [
  { f: "h2", dur: 7, stamp: "BỆNH VIỆN TỪ TÂM · KHOA DỊ NHÂN · 1996", sub: "Viện trưởng Khải gọi căn phòng này là “phòng chữa lành”. Chưa từng có bệnh nhân nào được chữa lành.", cam: [[47.5, 1.05, 36.7], [47.5, .95, 35.8]], look: [[47.5, .45, 32.4], [47.5, .42, 32.4]],
    actors: [{ st: "doctorK", p: [[46.75, 32.4]], pose: "work", face: [47.5, 32.4] }, { st: "nurse", p: [[48.5, 33.5]], face: [47.5, 32.4] }], lights: [{ x: 47.5, y: 32.4, h: 1.4, i: 1.3, r: .85, g: 1, b: .95, f: .4 }], sfx: [[4.5, "scream"]] },
  { f: "h2", dur: 7, stamp: "ĐÊM 14/7/1996", sub: "Một cặp song sinh dính liền được đưa vào. Người mẹ ký giấy cho bệnh viện tách hai đứa — miễn phí.", cam: [[7.5, .8, 16.4], [7.5, .75, 15.2]], look: [[7.5, .35, 6], [7.5, .35, 6]],
    actors: [{ st: "nurse", p: [[3.2, 10.4], [11.6, 10.4]], prop: "candle", light: 1 }], lights: [{ x: 7.5, y: 9, h: 1, i: .55, r: 1, g: .6, b: .3, f: .5 }], sfx: [[.3, "steps"], [3.4, "giggle"]] },
  { card: "Đứa chị được trả về cho mẹ. Đứa em bị ghi là đã chết. Y tá Nguyệt ghi lại tất cả vào sổ trực — nhưng bà không dám kể với ai.", dur: 5 },
  { f: "h1", dur: 6.5, stamp: "ĐÊM 3/9/1997", sub: "Bệnh nhân phá cửa phòng cách ly. Sáng hôm sau, bệnh viện bị niêm phong. 63 người không bao giờ được tìm thấy.", cam: [[12, .72, 19.4], [14.5, .7, 19.4]], look: [[40, .6, 19.4], [40, .6, 19.4]],
    actors: [{ st: "patient", p: [[34, 18.8], [17, 18.8]], run: 1 }, { st: "patient", p: [[38, 20], [21, 20]], run: 1, t0: .6 }, { st: "patient", p: [[42, 19.4], [26, 19.4]], run: 1, t0: 1.2 }], lights: [{ x: 22, y: 19.4, h: 1.1, i: .7, r: 1, g: .08, b: .05, f: .5 }, { x: 34, y: 19.4, h: 1.1, i: .6, r: 1, g: .08, b: .05, f: .5 }],
    fx: { flicker: [0, 6.5] }, sfx: [[.3, "scream"], [1.8, "steps"]] },
  { f: "h2", dur: 4.2, stamp: "", sub: "Nhưng Viện trưởng... chưa bao giờ rời khỏi đây.", cam: [[47.5, .76, 36.7], [47.5, .75, 36.0]], look: [[47.5, .8, 32], [47.5, .82, 32]],
    actors: [{ st: "surgeon", p: [[47.5, 34.4]], face: "cam", t0: 1.3 }], lights: [{ x: 47.5, y: 34.3, h: 1.3, i: 1, r: 1, g: .2, b: .15, f: .5 }], fx: { scare: 1.3, red: [1.3, 4.2], flicker: [1.3, 4.2] } },
  { card: "29 năm sau. Bạn tỉnh dậy trên một chiếc giường bệnh.", dur: 3.6 }];

// ---------- 9. BẢNG THEO MAP ----------
PAL.hospital = ["#030505", "#0c1412", "#1a2420", [.24, .18]];
CRIT_CFG.hospital = { bat: 9 }; WX_CFG.hospital = { rain: .8, storm: .9 };
CLUTTER.hospital = ["paper", "bottle", "rag", "glove", "cup", "box", "paper", "shoe", "rag", "toy"];
PROPTHEME.hospital = ["d_cabinet", "d_boxes", "d_bucket", "d_bench", "d_chair", "d_bottles", "d_stool", "d_shelf", "d_teddy", "d_cage", "d_candles", "d_boxes", "d_teddy"];
RCAT.hospital = {
  ward: [[["r_hBed", 6], ["r_medCab", 1], ["r_sinkP", 1], ["r_nightstand", 2]], [["r_gurney", 2], ["r_ivStand", 3], ["r_wheelchair", 2], ["r_monitor", 1], ["r_screen", 1]], [["r_xrayBox", 1], ["r_clockW", 1], ["r_hSign", 1], ["r_poster", 1]], 4],
  surgery: [[["r_medCab", 2], ["r_jarShelf", 2], ["r_sinkP", 1]], [["r_surgTable", 1], ["r_ivStand", 2], ["r_trayCart", 3], ["r_monitor", 2]], [["r_xrayBox", 2], ["r_clockW", 1]], 5],
  lab: [[["r_jarShelf", 4], ["r_medCab", 2], ["r_shelfMetal", 1], ["r_workbench", 1]], [["r_cage", 1], ["r_trayCart", 2], ["r_specTank", 2], ["r_gurney", 1]], [["r_xrayBox", 1], ["r_hSign", 1]], 4],
  morgue: [[["r_morgueWall", 4], ["r_sinkP", 1], ["r_shelfMetal", 1]], [["r_gurney", 3], ["r_bodyBag", 3], ["r_autopsy", 2]], [["r_pipes", 2], ["r_fuse", 1]], 4],
  basement: [[["r_shelfMetal", 3], ["r_drums", 2], ["r_elecCab", 1], ["r_gasRack", 1]], [["r_cage", 2], ["r_boxStack", 2], ["r_bodyBag", 2], ["r_gurney", 1], ["r_wheelchair", 1]], [["r_pipes", 3], ["r_fuse", 2]], 4],
  office: [[["r_filing", 3], ["r_bookTall", 2], ["r_cooler", 1], ["r_jarShelf", 1]], [["r_officeDesk", 2], ["r_rug", 1]], [["r_painting", 2], ["r_clockW", 1], ["r_xrayBox", 1]], 4],
  nursery: [[["r_medCab", 1], ["r_toybox", 1]], [["r_crib", 5], ["r_ivStand", 1], ["r_toys", 1]], [["r_painting", 1], ["r_clockW", 1], ["r_hSign", 1]], 4],
  lobby: [[["r_filing", 1], ["r_cooler", 1], ["r_coatrack", 1]], [["r_benchRow", 4], ["r_wheelchair", 2], ["r_gurney", 1]], [["r_poster", 2], ["r_clockW", 1], ["r_hSign", 2]], 5],
  cell: [[["r_bedS", 2], ["r_toilet", 1]], [["r_strapChair", 1]], [], 14],
  bath: [[["r_toilet", 3], ["r_sinkP", 2], ["r_bathtub", 2]], [], [["r_mirrorW", 2]], 99],
  corr: [[], [], [["r_hSign", 2], ["r_poster", 1], ["r_clockW", 1], ["r_xrayBox", 1]], 99],
};
AREA_NAMES.hospital = { ward: ["Phòng bệnh 104", "Khoa Lây nhiễm", "Phòng bệnh 112", "Phòng hậu phẫu", "Khoa Nội C"], surgery: ["Phòng mổ số 4", "Phòng tiểu phẫu", "Phòng gây mê"], lab: ["Phòng xét nghiệm", "Phòng ngâm mẫu", "Phòng giải phẫu bệnh", "Kho tiêu bản"],
  morgue: ["Phòng ướp xác", "Phòng liệm"], basement: ["Kho vật tư y tế", "Phòng giặt đồ vấy máu", "Kho đồ phế thải", "Phòng máy bơm"], office: ["Phòng trưởng khoa", "Phòng lưu trữ", "Phòng giao ban"], nursery: ["Phòng trẻ bị bỏ rơi", "Phòng ấp trứng"],
  lobby: ["Sảnh phụ", "Khu chờ khám"], cell: ["Buồng giam đặc biệt", "Phòng cách ly đỏ"], bath: ["Phòng vệ sinh nhân viên", "Phòng tắm bệnh nhân"], corr: ["Hành lang phụ", "Lối thoát hiểm", "Hành lang khoa"] };
roomKind = (o => function (f, x, y) {
  if (MAPID !== "hospital") return o(f, x, y);
  const r = f.room[y * f.w + x]; if (!r) return null; const fl = firstOf(r.floor), wl = firstOf(r.wall);
  if (fl === T.hLinoC || fl === T.hORC) return "corr"; if (wl === T.hPad) return "cell"; if (fl === T.hKidF) return "nursery"; if (fl === T.marble) return "lobby"; if (fl === T.hBathF) return "bath";
  if (fl === T.hORF) return "surgery"; if (fl === T.hMorF) return "morgue"; if (fl === T.woodDk || fl === T.carpetB) return "office"; if (fl === T.hConcF) return "basement"; if (fl === T.hTileF) return "lab"; return "ward";
})(roomKind);
extendMaps = (o => function () { o(); if (MAPID !== "hospital") return;
  const pick = (f, i) => { const seen = new Map(); for (const r of f.room) if (r && (r.h ?? WH) > 1.3 && (r.h ?? WH) < 2 && firstOf(r.floor) !== T.hLinoC) seen.set(firstOf(r.floor), r); const arr = [...seen.values()]; const r = arr[(i * 7 + Math.floor(Math.random() * arr.length)) % arr.length]; return { ...r, h: Math.max(1.35, Math.min(1.8, (r.h ?? WH) + (Math.random() - .5) * .3)) }; };
  const L = (f, x, y) => hTube(f, x, y, true);
  annexIndoor(FLOORS.h1, 20, i => pick(FLOORS.h1, i), L); annexIndoor(FLOORS.h2, 18, i => pick(FLOORS.h2, i), L);
  for (const f of [FLOORS.h1, FLOORS.h2]) hospFloorT(f);
})(extendMaps);
MUSIC_CFG.hospital = { root: 49, drone: [49, 51.9, 36.7], bpm: 144, amb: hospAmb,
  motif(m) { const t0 = ac.currentTime, mel = [76, 72, 69, 71, 68, 69, 64, 63]; for (let i = 0; i < mel.length; i++) if (Math.random() < .8) voiceBox(m, NOTE(mel[i]) * (1 + (Math.random() - .5) * .025), t0 + i * .6, .04); },
  pad(m) { voiceChoir(m, NOTE(45 + [0, 1, -2][Math.floor(Math.random() * 3)]), ac.currentTime, 9, .016); },
  tick(m, st, at, D_) { if (st % 8 === 0) { m.note(56, at, .16, .9, "sine", .002, 0, D_); m.hit(at, 90, .15, .8, D_); } if (st % 8 === 2) { m.note(48, at, .18, .7, "sine", .002, 0, D_); m.hit(at, 80, .15, .6, D_); }
    if (st % 16 === 8) m.note(1000, at, .09, .05, "sine", .001, 0, D_); if (st % 4 === 3) m.hit(at, 6000, .05, .16, D_, 4);
    if (st % 32 === 16) { m.note(NOTE(63), at, .6, .035, "sawtooth", .01, 0, D_); m.note(NOTE(69), at, .6, .035, "sawtooth", .01, 0, D_); } if (st % 64 === 48) m.hit(at, 2600, .9, .3, D_, 5); } };
function hospAmb() {
  const o = Music.keep(ac.createOscillator()), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = 100; lp.type = "lowpass"; lp.frequency.value = 260; g.gain.value = .018; o.connect(lp); lp.connect(g); g.connect(BUS.sfx); o.start();   // đèn huỳnh quang ù ù
  Music.loop(() => { const n = ac.currentTime; for (let i = 0; i < 3; i++) Music.note(1000, n + i * .9, .1, .016, "sine", .002); }, 14, 30);   // máy đo nhịp tim xa xa
  Music.loop(() => { const n = ac.currentTime; Music.note(700 + Math.random() * 300, n, .5, .01, "square", .05); Music.hit(n, 3000, .4, .2, Music.wet, 3); }, 18, 40);   // bánh xe băng ca kẽo kẹt
  Music.loop(() => { Music.hit(ac.currentTime, 4500, .05, .3, Music.wet, 6); }, 3, 7);   // nước nhỏ giọt
}
SONGS.hospital = { bpm: 54, voice: vBox, vol: .055, bars: [
  { ch: [45, 60, 64, 69], m: [[76, 1], [72, 1], [69, 1]] }, { ch: [45, 60, 64, 69], m: [[71, 2], [69, 1]] }, { ch: [41, 60, 65, 69], m: [[72, 1], [71, 1], [69, 1]] }, { ch: [40, 59, 64, 68], m: [[68, 3]] },
  { ch: [45, 60, 64, 69], m: [[76, 1], [77, 1], [76, 1]] }, { ch: [38, 57, 62, 65], m: [[74, 1], [72, 1], [70, 1]] }, { ch: [40, 59, 63, 68], m: [[71, 1], [68, 1], [63, 1]] }, { ch: [45, 57, 60, 64], m: [[69, 3]] }] };
