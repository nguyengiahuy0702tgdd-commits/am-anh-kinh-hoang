// =====================================================================
//  57. VŨ KHÍ: SÚNG BẮN KIM GÂY MÊ + GẬY SẮT ĐÁNH CHOÁNG
//  · Chuột trái (hoặc G): dùng vũ khí đang cầm · Q: đổi vũ khí · 1 súng · 2 gậy · 3 tay không
//  · Súng kim gây mê: bắn xa, trúng là ma ngủ gục — lâu nhất 85 giây (Dễ) … 40 giây (Siêu khó).
//    Mỗi phát tốn 1 kim; nhặt thêm hộp kim gây mê rải trong map.
//  · Gậy sắt: phải đứng sát (≈1,7 m), đánh choáng 25 giây (Dễ) … 8 giây (Siêu khó). Gậy có độ bền.
//  · Ma bất tỉnh: đứng im tại chỗ, không đuổi, không bắt được bạn. Tỉnh dậy là lại đi săn.
//  · Lâu Đài: đánh gục Nữ Bá Tước rồi lại gần bấm E để đóng cọc bạc.
//  · Vũ khí KHÔNG có sẵn trên tay ở bất kỳ độ khó nào — phải tìm ở khu cất vũ khí của map.
// =====================================================================
const WPN_CFG = {
  de:   { dart: 85, club: 25, dur: 8, start: { gun: 0, club: 0, darts: 3 }, ammo: 4, per: 2 },
  tb:   { dart: 70, club: 18, dur: 5, start: { gun: 0, club: 0, darts: 2 }, ammo: 3, per: 2 },
  kho:  { dart: 55, club: 12, dur: 4, start: { gun: 0, club: 0, darts: 2 }, ammo: 2, per: 1 },
  sieu: { dart: 40, club: 8,  dur: 3, start: { gun: 0, club: 0, darts: 1 }, ammo: 1, per: 1 },
};
const wCfg = () => WPN_CFG[Object.keys(DIFF).find(k => DIFF[k] === D) || "tb"] || WPN_CFG.tb;
const WPN = { gun: 0, club: 0, darts: 0, clubHP: 0, cur: "none", cd: 0, placed: null, ui: null };

// ---------- Hình 3D của đồ nhặt ----------
furniture = (o => function (v, s) {
  if (!s.k || !s.k.startsWith("w_")) return o(v, s);
  const fc = facing(s.rot || 0), X = XF(s.x, s.base || 0, s.y, fc.c, fc.s), m = T.metal || T.darkwood;
  if (s.k === "w_gun") {                                         // súng kim: thân, nòng dài, báng, ống kim đỏ
    pbox(v, X, -.05, 0, -.03, .09, .06, .03, m); pbox(v, X, .09, .02, -.012, .3, .045, .012, m);
    pbox(v, X, -.13, 0, -.025, -.05, .045, .025, T.darkwood); pbox(v, X, 0, .06, -.01, .05, .085, .01, T.glassR || m);
  } else if (s.k === "w_club") {                                 // gậy sắt dài, đầu bọc dây
    pbox(v, X, -.32, 0, -.018, .2, .036, .018, m); pbox(v, X, .2, 0, -.03, .34, .06, .03, T.darkwood);
  } else if (s.k === "w_darts") {                                // hộp kim gây mê
    pbox(v, X, -.07, 0, -.05, .07, .045, .05, T.glassR || m); pbox(v, X, -.06, .045, -.04, .06, .055, .04, m);
  }
})(furniture);

// ---------- Rải vũ khí lên bản đồ ----------
function wSpot(f, minD, maxD, sx, sy) {
  const F0 = F; F = f;
  try {
    for (let k = 0; k < 600; k++) {
      const x = 1.5 + Math.random() * (f.w - 3), y = 1.5 + Math.random() * (f.h - 3), d = Math.hypot(x - sx, y - sy);
      if (d < minD || d > maxD || !free(x, y) || !canStand(x, y)) continue;
      if (f.sprites.some(s => !s.taken && Math.hypot(s.x - x, s.y - y) < (s.solid || .25) + .45)) continue;
      return { x, y };
    }
  } finally { F = F0; }
  return null;
}
// Mỗi map một khu cất vũ khí cố định (theo tên phòng trên bản đồ)
const W_ZONE = { house: ["Nhà xe"], forest: ["Chòi thợ săn", "Lửa trại"], castle: ["Kho vũ khí"], cemetery: ["Nhà gác mộ", "Nhà quàn"], factory: ["Phòng sửa chữa", "Kho"], hospital: ["Nhà thuốc", "Phòng chờ"] };
function wZone() {
  const names = W_ZONE[MAPID] || [];
  for (let i = 0; i < names.length; i++) { const nm = names[i]; for (const f of Object.values(FLOORS)) { const l = (f.labels || []).find(q => String(q[0]).normalize("NFC") === nm.normalize("NFC")); if (l) return { f, x: +l[1], y: +l[2], name: nm, pref: i }; } }
  return { f: F, x: player.x, y: player.y, name: "gần chỗ bạn đứng" };
}
function wPlace() {
  if (WPN.placed === FLOORS) return;
  if (wZone().pref !== 0 && (S.playT || 0) < 2.5) return;           // chờ tên phòng được đặt xong
  WPN.placed = FLOORS;
  const c = wCfg(); Object.assign(WPN, { gun: c.start.gun, club: c.start.club, darts: c.start.gun ? c.start.darts : 0, clubHP: c.start.club ? c.dur : 0, cur: c.start.gun ? "gun" : c.start.club ? "club" : "none", cd: 0 });
  const z = wZone(), zf = z.f;
  const put = (k, p, act) => { if (!p) return; zf.sprites.push({ x: p.x, y: p.y, k, rot: Math.random() * 6.28, act, reach: 1.6, wide: .3 }); zf.lights.push({ x: p.x, y: p.y, h: .25, i: .22, r: .5, g: .9, b: 1, f: .9, w: 1 }); };
  const near = () => wSpot(zf, 0, 3.2, z.x, z.y) || wSpot(zf, 0, 5.5, z.x, z.y) || wSpot(zf, 0, 9, z.x, z.y);
  if (!c.start.gun) put("w_gun", near(), "w_gun");
  if (!c.start.club) put("w_club", near(), "w_club");
  // hộp kim gây mê để RIÊNG, rải rác ở các phòng khác (không nằm cạnh súng)
  const rooms = [];
  for (const f of Object.values(FLOORS)) for (const l of (f.labels || [])) { const x = +l[1], y = +l[2]; if (!isFinite(x) || !isFinite(y)) continue; if (f === zf && Math.hypot(x - z.x, y - z.y) < 8) continue; rooms.push({ f, x, y }); }
  for (let i = rooms.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rooms[i], rooms[j]] = [rooms[j], rooms[i]]; }
  let placedD = 0;
  for (const r of rooms) { if (placedD >= c.ammo) break; if (r.f.hasDarts >= 1 && rooms.length > c.ammo * 2) continue; const p = wSpot(r.f, 0, 3, r.x, r.y) || wSpot(r.f, 0, 5, r.x, r.y); if (!p) continue;
    r.f.sprites.push({ x: p.x, y: p.y, k: "w_darts", rot: Math.random() * 6.28, act: "w_darts", reach: 1.6, wide: .3 }); r.f.lights.push({ x: p.x, y: p.y, h: .25, i: .22, r: .5, g: .9, b: 1, f: .9, w: 1 }); r.f.hasDarts = (r.f.hasDarts || 0) + 1; placedD++; }
  for (; placedD < c.ammo; placedD++) { const p = wSpot(zf, 9, 99, z.x, z.y) || near(); if (!p) break; zf.sprites.push({ x: p.x, y: p.y, k: "w_darts", rot: Math.random() * 6.28, act: "w_darts", reach: 1.6, wide: .3 }); zf.lights.push({ x: p.x, y: p.y, h: .25, i: .22, r: .5, g: .9, b: 1, f: .9, w: 1 }); }
  WPN.zone = z;
  setTimeout(() => { if (!S.ending) say(`Súng kim gây mê và gậy sắt được cất ở khu: ${z.name}${zf !== F ? ` — ${zf.name}` : ""}. Súng không có sẵn kim — các hộp kim gây mê nằm rải rác ở những phòng khác. Tìm ánh xanh mờ trên sàn.`); }, 6000);
  Object.assign(SPRITE_ACTS, {
    w_gun(s) { s.taken = true; buildFloorMesh(F); WPN.gun = 1; WPN.cur = "gun"; wBeep(); say(WPN.darts ? `Bạn nhặt được SÚNG BẮN KIM GÂY MÊ (${WPN.darts} kim). Chuột trái để bắn — trúng ma là nó ngủ gục ${c.dart} giây.` : `Bạn nhặt được SÚNG BẮN KIM GÂY MÊ — nhưng súng chưa có kim! Đi tìm hộp kim gây mê ở các phòng khác (ánh xanh mờ trên sàn).`); },
    w_club(s) { s.taken = true; buildFloorMesh(F); WPN.club = 1; WPN.clubHP = c.dur; if (WPN.cur === "none") WPN.cur = "club"; wBeep(); say(`Bạn nhặt được GẬY SẮT (đánh được ${c.dur} lần). Đứng thật sát rồi chuột trái — ma choáng ${c.club} giây. Bấm Q để đổi vũ khí.`); },
    w_darts(s) { s.taken = true; buildFloorMesh(F); WPN.darts += c.per; wBeep(); say(WPN.gun ? `Hộp kim gây mê: +${c.per} kim (đang có ${WPN.darts}).` : `Hộp kim gây mê: +${c.per} kim. Cần tìm súng bắn kim ở khu ${WPN.zone?.name || "cất vũ khí"} mới bắn được.`); },
  });
  Object.assign(SPRITE_NAMES, { w_gun: "Nhặt súng bắn kim gây mê", w_club: "Nhặt gậy sắt", w_darts: "Nhặt hộp kim gây mê" });
  try { refreshWalls(); } catch (e) {}
}
const wBeep = () => { try { tone(520, 0, .12, .05); tone(780, .08, .18, .04); } catch (e) {} };

// ---------- Bắn / đánh ----------
function wLOS(x0, y0, x1, y1) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .1); for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (!free(x, y)) return false; } return true; }
function wTarget(range, cone) {
  let best = null, bd = 1e9;
  ghosts.forEach((g, i) => {
    if (g.floor !== F.id || g.rise === 0) return;
    const dx = g.x - P1.x, dy = g.y - P1.y, d = Math.hypot(dx, dy); if (d > range) return;
    let da = Math.atan2(dy, dx) - P1.a; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) > (cone ?? Math.atan2(.34, d) + .03)) return;
    if (!wLOS(P1.x, P1.y, g.x, g.y)) return;
    if (d < bd) { bd = d; best = { g, i, d }; }
  });
  return best;
}
function knockOut(i, secs, how) {
  const g = ghosts[i]; if (!g) return;
  g.ko = Math.max(g.ko || 0, t + Math.min(89, secs)); g.koHow = how; g.koSaid = 0;
  if (NET.ok && !NET.host) try { netSend({ t: "wko", i, s: secs, h: how }); } catch (e) {}
}
netRecv = (o => function (m) { if (m && m.t === "wko") { const g = ghosts[m.i]; if (g) { g.ko = Math.max(g.ko || 0, t + Math.min(89, m.s)); g.koHow = m.h; } return; } return o(m); })(netRecv);

function useWeapon() {
  if (!S.started || S.ending || S.paused || P1.dead || P1.hidden || t < WPN.cd) return;
  const c = wCfg();
  if (WPN.cur === "gun") {
    if (!WPN.gun) return;
    if (WPN.darts <= 0) { WPN.cd = t + .5; noise(.05, 900, .15); return say("Hết kim gây mê! Tìm thêm hộp kim (ánh xanh mờ trên sàn)."); }
    WPN.darts--; WPN.cd = t + 1.1; wAnim("shoot"); noise(.08, 2400, .35, .9); noise(.15, 300, .25, .6);
    const h = wTarget(16);
    if (h) { knockOut(h.i, c.dart, "dart"); noise(.2, 160, .5, .5, .15); say(`Trúng! Kim gây mê cắm phập vào người nó... Nó lảo đảo rồi gục xuống — bất tỉnh ${c.dart} giây. Đi ngay!`); }
    else say(`Trượt! (còn ${WPN.darts} kim)`);
  } else if (WPN.cur === "club") {
    if (!WPN.club || WPN.clubHP <= 0) return;
    WPN.cd = t + .8; wAnim("swing"); noise(.12, 500, .2, .5);
    const h = wTarget(1.75, .6);
    if (h) {
      knockOut(h.i, c.club, "club"); WPN.clubHP--; noise(.1, 90, .9, .6); noise(.25, 1400, .4, .8, .02); rumble?.([120], .8);
      if (WPN.clubHP <= 0) { WPN.club = 0; WPN.cur = WPN.gun ? "gun" : "none"; say(`BỐP! Nó choáng váng ${c.club} giây... nhưng cây gậy cũng gãy đôi rồi.`); }
      else say(`BỐP! Nó choáng váng ${c.club} giây — chạy đi! (gậy còn ${WPN.clubHP} lần)`);
    }
  }
}
addEventListener("mousedown", e => { if (e.button === 0 && document.pointerLockElement) useWeapon(); });
addEventListener("keydown", e => {
  if (!S.started || S.ending || e.repeat || document.activeElement?.tagName === "INPUT") return;
  if (e.code === "KeyG") useWeapon();
  else if (e.code === "KeyQ") { const own = ["none", WPN.gun && "gun", WPN.club && "club"].filter(Boolean); WPN.cur = own[(own.indexOf(WPN.cur) + 1) % own.length]; wAnim("draw"); }
  else if (e.code === "Digit1" && WPN.gun) { WPN.cur = "gun"; wAnim("draw"); }
  else if (e.code === "Digit2" && WPN.club) { WPN.cur = "club"; wAnim("draw"); }
  else if (e.code === "Digit3") WPN.cur = "none";
});

// ---------- Ma bất tỉnh: đứng im, không làm gì được ----------
gameStep = (o => function (dt) {
  if (S.started && !S.paused && FLOORS) wPlace();
  const ko = [];                                                  // thay ma bất tỉnh bằng "bóng thế" ở rất xa → không map nào đụng tới được
  ghosts.forEach((g, i) => { if (g.ko > t) { const ph = { x: -999, y: -999, floor: "__ko", rise: 1, mul: 0, state: "patrol", _koOf: g, gone: 1e12 }; ghosts[i] = ph; ko.push([g, ph]); } });
  try { o(dt); }
  finally { for (const [g, ph] of ko) { const j = ghosts.indexOf(ph); if (j >= 0) ghosts[j] = g; } }
  for (const g of ghosts) if (g.ko && g.ko <= t) { g.ko = 0; if (g.floor === F.id && Math.hypot(g.x - P1.x, g.y - P1.y) < 16) { say("...Nó đã tỉnh lại. Và nó đang rất giận dữ."); noise(.5, 110, .4, .5); } g.hunt = t + 6; g.hx = P1.x; g.hy = P1.y; }
  wHud();
})(gameStep);

// ---------- Giao diện ----------
// Biểu tượng: game-icons.net — "dart", "lead-pipe", "knocked-out-stars" (Delapouite), "syringe" (Lorc) · giấy phép CC BY 3.0
const W_ICON = {"dart": "M134.745 22.098c-4.538-.146-9.08 1.43-14.893 7.243-5.586 5.586-11.841 21.725-15.248 35.992-.234.979-.444 1.907-.654 2.836l114.254 105.338c-7.18-28.538-17.555-59.985-29.848-86.75-11.673-25.418-25.249-46.657-37.514-57.024-6.132-5.183-11.56-7.488-16.097-7.635zM92.528 82.122L82.124 92.526 243.58 267.651l24.072-24.072L92.528 82.122zm-24.357 21.826c-.929.21-1.857.42-2.836.654-14.267 3.407-30.406 9.662-35.993 15.248-5.813 5.813-7.39 10.355-7.244 14.893.147 4.538 2.452 9.965 7.635 16.098 10.367 12.265 31.608 25.842 57.025 37.515 26.766 12.293 58.211 22.669 86.749 29.848L68.17 103.948zM280.899 255.79l-25.107 25.107 73.265 79.469 31.31-31.31L280.9 255.79zm92.715 85.476l-32.346 32.344 2.07 2.246c.061.058 4.419 4.224 10.585 6.28 6.208 2.069 12.71 2.88 21.902-6.313 9.192-9.192 8.38-15.694 6.31-21.902-2.057-6.174-6.235-10.54-6.283-10.59l-2.238-2.065zm20.172 41.059a46.23 46.23 0 0 1-5.233 6.226 46.241 46.241 0 0 1-6.226 5.235L489.91 489.91l-96.125-107.586z", "pipe": "M440.783 22.424c-2.382.04-4.63.42-6.646 1.178l-148.725 93.875-125.28 165.15c.972 7.275 1.65 13.713 1.65 13.713L145.435 302 52.56 424.432a38.188 26.876 37.184 0 1 30.288 9.912 38.188 26.876 37.184 0 1 18.03 28.566l219.278-289.056-1.943-31.5 12.213 23.632 140.47-88.664c7.383-9.426 8.96-18.574 7.038-26.62l-15.998 5.54L472.48 39.27c-2.533-3.414-5.665-6.433-9.13-8.93-7.054-5.082-15.42-8.035-22.567-7.916zM52.705 438.676a30.876 21.73 37.184 0 0-1.857.023 30.876 21.73 37.184 0 0-14.244 6.763 30.876 21.73 37.184 0 0 11.464 35.974 30.876 21.73 37.184 0 0 37.735 1.348 30.876 21.73 37.184 0 0-11.47-35.973 30.876 21.73 37.184 0 0-21.628-8.136zm1.762 15.146a14.803 10.418 37.184 0 1 .004 0 14.803 10.418 37.184 0 1 11.26 3.89 14.803 10.418 37.184 0 1 5.497 17.247 14.803 10.418 37.184 0 1-18.09-.647 14.803 10.418 37.184 0 1-5.498-17.247 14.803 10.418 37.184 0 1 6.827-3.244z", "syringe": "M112.182 18.393c-.37-.007-.77 0-1.205.023-3.172.16-8.473 2.174-14.688 7.078-9.654 32.85-35.603 60.926-71.335 72.012-3.3 6.59-4.446 11.897-4.215 15.156.268 3.77 1.223 5.062 3.895 6.502 5.342 2.88 21.9 2.56 44.19-10.31l4.843-2.795 4.752 2.944c35.087 21.744 53.66 39.973 72.885 69.553l23.517-23.518c-31.97-18.754-48.732-38.902-68.935-73.91l-2.696-4.67 2.7-4.673c15.082-26.124 14.602-44.643 11.354-50.133-1.42-2.4-2.482-3.214-5.062-3.26zM275.8 87.45c-28.745 0-52.638 21.59-56.323 49.36l-84.444 84.448c-27.773 3.684-49.36 27.58-49.36 56.322 0 31.276 25.553 56.832 56.83 56.832 30.934 0 56.253-25 56.808-55.805l96.89 96.89 13.214-13.216L185.88 238.747l25.31-25.312 93.576 93.574 13.214-13.215-93.574-93.574 12.614-12.613 123.535 123.536 13.215-13.215-96.842-96.842c30.76-.608 55.703-25.906 55.703-56.803 0-31.276-25.553-56.832-56.83-56.832zm0 18.69c21.176 0 38.143 16.968 38.143 38.143 0 21.176-16.967 38.143-38.144 38.143-21.18 0-38.144-16.967-38.144-38.143 0-21.175 16.965-38.144 38.143-38.144zM142.503 239.437c21.177 0 38.142 16.966 38.142 38.142 0 21.176-16.965 38.145-38.142 38.145-21.178 0-38.145-16.97-38.145-38.145 0-21.176 16.966-38.142 38.144-38.142zm263.168 61.544c-5.287 0-10.573 2.044-14.66 6.13l-29.858 29.86-27.183-27.19-13.214 13.214 27.183 27.19-42.594 42.593h-.002c-8.18 8.186-8.176 21.15 0 29.33 8.172 8.175 21.147 8.175 29.326-.005l85.664-85.668c8.18-8.177 8.18-21.147.002-29.322-4.09-4.09-9.378-6.133-14.664-6.133zm-8.352 84.9L384.105 399.1l97.885 97.884 13.215-13.214-97.885-97.885z", "ko": "M116.2 175l5.6 22.8-15.6 17.6 23.4 1.6 11.9 20.3 9-21.8 22.8-5.1-17.9-15.1 2.1-23.4-19.9 12.4zm255.4-91.73l7.6 15.22-7.9 15.01 16.7-2.8 11.6 12.5 2.9-16.8 15.2-7.37-15.1-7.74-2.2-16.88-12 11.95zm-59.4 48.13l-6.9 18.8-18.9 5.1 15.7 12.1-.4 7.9a67.17 246.4 64.14 0 0-68.4 29.6 67.17 246.4 64.14 0 0-.3.1 67.17 246.4 64.14 0 0-148.86 94.5l-12.28-7.2L70 268.5l-17.92 15.9-23.3-5.5 9.75 22-12.61 20.4 23.9-2.5 7.05 8.3a67.17 246.4 64.14 0 0-15.94 45.6 67.17 246.4 64.14 0 0 82.27 12L119 396l-21.49 5.8 17.69 13.5-1.2 22.3 18.4-12.5 20.9 8-6.4-21.4 14.1-17.4-22.3-.7-7-10.7a67.17 246.4 64.14 0 0 72.3-20.4l6.9 18.6 14.6-22.9 27.2-.8-8.3-10.2a67.17 246.4 64.14 0 0 47.5-21.5 67.17 246.4 64.14 0 0 120.4-71.5l8.5 18-13.9 23.5 27.1-3.5 17.9 20.5 5.3-26.7 25-10.8-24-13.2-2.4-27.1-20 18.6-17.4-3.9a67.17 246.4 64.14 0 0 65.7-91.7 67.17 246.4 64.14 0 0-153.7 7l-.2-.9 12.4-15.4-19.8-.5zm-75.4 82.7a51.33 188.2 64.14 0 1 .7-.5 51.33 188.2 64.14 0 1 63.6-26.7v.2l.6-.4a51.33 188.2 64.14 0 1 23.3-7.9l10.9 4.2-2.1-6.7a51.33 188.2 64.14 0 1 95.4 1.5 51.33 188.2 64.14 0 1-58.4 76.2l-2-10.9 10-10.3-14.4-1.6-6.5-12.9-6.1 13.1-14.4 2.4 10.7 9.8-2.1 14.2 12.5-6.8 9.9 4.8a51.33 188.2 64.14 0 1-86.1 50.3 51.33 188.2 64.14 0 1-43.6 19.2l4.3-15-25.3 9.7-22.5-15.1 1.6 27-17 13.3a51.33 188.2 64.14 0 1-89.19-3.3A51.33 188.2 64.14 0 1 236.8 214.1z"};
const wIco = (k, cls = "") => `<svg class="${cls}" viewBox="0 0 512 512"><path d="${W_ICON[k]}"/></svg>`;
function wUI() {
  if (WPN.ui) return WPN.ui;
  const st = document.createElement("style");
  st.textContent = `
#wpn{position:fixed;right:26px;bottom:24px;z-index:24;display:flex;gap:10px;align-items:flex-end;pointer-events:none;font-family:var(--body)}
#wpn .slot{position:relative;width:74px;height:74px;border-radius:10px;background:linear-gradient(160deg,rgba(40,30,26,.82),rgba(10,8,8,.88));border:1px solid rgba(217,204,178,.22);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 8px 22px rgba(0,0,0,.6);transition:transform .2s,border-color .2s,box-shadow .2s;opacity:.55}
#wpn .slot.own{opacity:.92}#wpn .slot.sel{opacity:1;transform:translateY(-6px) scale(1.06);border-color:var(--blood2,#c8553a);box-shadow:0 0 0 1px rgba(200,85,58,.4),0 0 18px rgba(200,85,58,.35),0 10px 24px rgba(0,0,0,.7)}
#wpn .slot svg.ic{position:absolute;inset:11px;width:52px;height:52px;fill:#e9dcc4;filter:drop-shadow(0 2px 2px #000)}#wpn .slot.sel svg.ic{fill:#fff3dc}
#wpn .slot:not(.own) svg.ic{fill:#5a5048}
#wpn .key{position:absolute;left:6px;top:4px;font:600 11px/1 sans-serif;color:#bfae96;opacity:.85}
#wpn .cnt{position:absolute;right:5px;bottom:4px;display:flex;align-items:center;gap:2px;font:700 14px/1 sans-serif;color:#ffd9c8;text-shadow:0 1px 2px #000}
#wpn .cnt svg{width:15px;height:15px;fill:#e06a50}
#wpn .pips{position:absolute;left:7px;right:7px;bottom:6px;display:flex;gap:2px}#wpn .pips i{flex:1;height:4px;border-radius:2px;background:#c8553a;box-shadow:0 0 4px rgba(200,85,58,.6)}#wpn .pips i.off{background:#3a2c26;box-shadow:none}
#wpn .help{position:absolute;right:0;bottom:84px;white-space:nowrap;font-size:11.5px;color:#cdbfa6;opacity:.7;text-shadow:0 1px 3px #000;letter-spacing:.03em}
#wpn .name{position:absolute;right:0;bottom:100px;white-space:nowrap;font-size:15px;color:#f1e4ca;letter-spacing:.07em;text-shadow:0 1px 4px #000}
#wpnView{position:fixed;right:7vw;bottom:-3vh;width:min(36vw,460px);z-index:23;pointer-events:none;transform-origin:85% 100%;filter:drop-shadow(0 10px 14px rgba(0,0,0,.75))}
#wpnView.shoot{animation:wShoot .28s ease-out}#wpnView.swing{animation:wSwing .42s ease-in-out}#wpnView.draw{animation:wDraw .32s ease-out}
@keyframes wShoot{0%{transform:none}20%{transform:translate(14px,22px) rotate(5deg)}100%{transform:none}}
@keyframes wSwing{0%{transform:none}35%{transform:rotate(-40deg) translate(-50px,-14px)}62%{transform:rotate(20deg) translate(34px,12px)}100%{transform:none}}
@keyframes wDraw{0%{transform:translateY(65%)}100%{transform:none}}
#wpnView .flash{opacity:0}#wpnView.shoot .flash{animation:wFl .16s ease-out}@keyframes wFl{0%{opacity:1}100%{opacity:0}}
#koTag{position:fixed;left:50%;top:60px;transform:translateX(-50%);z-index:24;display:flex;align-items:center;gap:8px;padding:5px 12px 5px 8px;border-radius:20px;background:rgba(10,20,30,.55);border:1px solid rgba(120,180,240,.3);font:13px/1 var(--body);letter-spacing:.06em;color:#bfe2ff;text-shadow:0 1px 3px #000;opacity:0;transition:opacity .4s;pointer-events:none}
#koTag.on{opacity:1}#koTag svg{width:20px;height:20px;fill:#8fd0ff;animation:koSpin 2.4s linear infinite}@keyframes koSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(st);
  const box = Object.assign(document.createElement("div"), { id: "wpn" }), view = Object.assign(document.createElement("div"), { id: "wpnView" }), tag = Object.assign(document.createElement("div"), { id: "koTag" });
  document.body.append(box, view, tag); return WPN.ui = { box, view, tag, cur: "", h: "" };
}
// Hình vũ khí cầm tay (vẽ vector, có đổ bóng kim loại)
const W_SVG = {
  gun: `<svg viewBox="0 0 460 300"><defs><linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6f78"/><stop offset=".45" stop-color="#2c2f35"/><stop offset="1" stop-color="#121316"/></linearGradient><linearGradient id="gw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#2a170c"/></linearGradient><radialGradient id="gf"><stop offset="0" stop-color="#fff6d0"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".7"/><stop offset="1" stop-color="#ff6020" stop-opacity="0"/></radialGradient></defs>
<g transform="scale(-1,1) translate(-460,0)"><circle class="flash" cx="440" cy="120" r="34" fill="url(#gf)"/>
<path d="M120 158 L360 120 L392 118 L398 140 L370 150 L180 186 Z" fill="url(#gm)" stroke="#08090a" stroke-width="3"/>
<rect x="330" y="108" width="100" height="18" rx="4" fill="url(#gm)" stroke="#08090a" stroke-width="2.5"/><rect x="426" y="110" width="10" height="14" rx="2" fill="#1a1b1e"/>
<rect x="210" y="128" width="96" height="20" rx="9" fill="#cfe6f2" fill-opacity=".25" stroke="#9cc6dc" stroke-width="2"/><rect x="218" y="133" width="56" height="10" rx="5" fill="#d23a2a"/><path d="M274 138 L300 138" stroke="#e8e8e8" stroke-width="3"/>
<path d="M150 112 L170 108 L176 124 L156 128 Z" fill="#7cff9a" opacity=".85"/><path d="M182 172 L230 164 L262 270 L208 282 Z" fill="url(#gw)" stroke="#120a06" stroke-width="3"/>
<path d="M196 196 L238 189 M202 214 L244 207 M208 232 L250 225" stroke="#1a0f08" stroke-width="2.5" opacity=".7"/><path d="M228 166 Q246 190 238 206" fill="none" stroke="#2c2f35" stroke-width="7"/></g></svg>`,
  club: `<svg viewBox="0 0 460 300"><defs><linearGradient id="cm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a8f96"/><stop offset=".5" stop-color="#3a3d42"/><stop offset="1" stop-color="#16171a"/></linearGradient></defs>
<g transform="rotate(-30 300 230)"><rect x="40" y="208" width="350" height="26" rx="12" fill="url(#cm)" stroke="#0a0a0c" stroke-width="3"/><rect x="40" y="203" width="30" height="36" rx="6" fill="url(#cm)" stroke="#0a0a0c" stroke-width="3"/>
<path d="M90 210 l6 22 M150 210 l-4 22 M210 212 l5 20" stroke="#5a2a14" stroke-width="3" opacity=".7"/><rect x="300" y="200" width="104" height="42" rx="10" fill="#2a1a10" stroke="#0a0604" stroke-width="3"/>
<path d="M308 204 L396 236 M322 202 L404 228 M306 222 L360 240" stroke="#5a3a22" stroke-width="4"/><path d="M60 214 L380 214" stroke="#c8ccd2" stroke-width="2" opacity=".35"/></g></svg>`,
};
function wAnim(k) { const u = wUI(); u.view.classList.remove("shoot", "swing", "draw"); void u.view.offsetWidth; u.view.classList.add(k); }
function wHud() {
  const u = wUI(), on = S.started && !S.ending, c = wCfg();
  const show = on && !P1.dead && WPN.cur !== "none" && !S.paused;
  if (u.cur !== (show ? WPN.cur : "")) { u.cur = show ? WPN.cur : ""; u.view.innerHTML = show ? W_SVG[WPN.cur] : ""; }
  let h = "";
  if (on && (WPN.gun || WPN.club)) {
    const nm = WPN.cur === "gun" ? "Súng kim gây mê" : WPN.cur === "club" ? "Gậy sắt" : "Tay không";
    const pips = Array.from({ length: c.dur }, (_, i) => `<i class="${i < WPN.clubHP ? "" : "off"}"></i>`).join("");
    h = `<div class="name">${nm}</div><div class="help">Chuột trái / G: dùng · Q: đổi · 1 2 3</div>
<div class="slot ${WPN.gun ? "own" : ""} ${WPN.cur === "gun" ? "sel" : ""}"><span class="key">1</span>${wIco("dart", "ic")}<span class="cnt">${wIco("syringe")}${WPN.darts}</span></div>
<div class="slot ${WPN.club ? "own" : ""} ${WPN.cur === "club" ? "sel" : ""}"><span class="key">2</span>${wIco("pipe", "ic")}<div class="pips">${WPN.club ? pips : ""}</div></div>`;
  }
  if (h !== u.h) { u.h = h; u.box.innerHTML = h; }
  const ko = ghosts.filter(g => g.ko > t && g.floor === F.id).map(g => Math.ceil(g.ko - t));
  const kt = ko.length ? `${wIco("ko")}Ma đang bất tỉnh — còn ${Math.max(...ko)} giây` : "";
  if (u.tag._t !== kt) { u.tag._t = kt; u.tag.innerHTML = kt; } u.tag.classList.toggle("on", on && ko.length > 0);
}
startGame = (o => function (...a) { WPN.placed = null; return o.apply(this, a); })(startGame);
// gói dữ liệu gửi máy bạn: thay "bóng thế" bằng con ma thật đang ngủ
netSend = (o => function (m) { if (m && m.t === "snap" && Array.isArray(m.g)) m.g = m.g.map(q => q && q._koOf ? { ...q._koOf } : q); return o(m); })(netSend);
