// =====================================================================
//  30. BẢN 17: tên khu vực ngay ngắn · nhạc kịch tính tách riêng · mở được tủ/ngăn kéo
//      chơi lại với bố trí mới · thêm thật nhiều đồ vật lặt vặt
// =====================================================================

// ---------- 1. TÊN KHU VỰC: đặt đúng giữa từng khu, không lệch, không trùng ----------
function tidyLabels(f) {
  const W = f.w, A = f.areaOf, labs = f.labels || [];
  const walk = (x, y) => f.grid[y]?.[x] === ".";
  const nearCell = (x, y) => { let best = null, bd = 1e9; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const cx = Math.floor(x) + dx, cy = Math.floor(y) + dy; if (!walk(cx, cy)) continue; const d = Math.hypot(cx + .5 - x, cy + .5 - y); if (d < bd) { bd = d; best = [cx, cy]; } } return best; };
  if (!A || f.outdoor) {   // ngoài trời: chỉ kéo tên ra khỏi bụi cây/tường về chỗ đi được
    f.labels = labs.filter(L => L[0] !== "?").map(L => { const c = walk(Math.floor(L[1]), Math.floor(L[2])) ? null : nearCell(L[1], L[2]); return c ? [L[0], c[0] + .5, c[1] + .5] : L; });
    if (A) f.labels.forEach(L => L[3] = 8); return;
  }
  const groups = new Map();
  for (const L of labs) { let id = A[Math.floor(L[2]) * W + Math.floor(L[1])]; if (!(id >= 0)) { const c = nearCell(L[1], L[2]); id = c ? A[c[1] * W + c[0]] : -1; } if (!(id >= 0)) continue; if (!groups.has(id)) groups.set(id, []); const g = groups.get(id); if (!g.some(o => o[0] === L[0])) g.push(L); }
  const cellsOf = new Map(); for (let i = 0; i < A.length; i++) if (A[i] >= 0 && groups.has(A[i])) { if (!cellsOf.has(A[i])) cellsOf.set(A[i], []); cellsOf.get(A[i]).push(i); }
  const out = [];
  for (const [id, Ls] of groups) {
    const cells = cellsOf.get(id) || []; if (!cells.length) continue;
    const parts = Ls.map(() => []); for (const c of cells) { const x = c % W + .5, y = Math.floor(c / W) + .5; let bi = 0, bd = 1e9; Ls.forEach((L, i) => { const d = Math.hypot(L[1] - x, L[2] - y); if (d < bd) { bd = d; bi = i; } }); parts[bi].push(c); }
    Ls.forEach((L, i) => { const P = parts[i].length ? parts[i] : cells; let mx = 0, my = 0, x0 = 1e9, x1 = -1e9; for (const c of P) { const x = c % W, y = Math.floor(c / W); mx += x + .5; my += y + .5; x0 = Math.min(x0, x); x1 = Math.max(x1, x); } mx /= P.length; my /= P.length;
      let best = P[0], bd = 1e9; for (const c of P) { const d = Math.hypot(c % W + .5 - mx, Math.floor(c / W) + .5 - my); if (d < bd) { bd = d; best = c; } }
      const NL = [L[0], best % W + .5, Math.floor(best / W) + .5, x1 - x0 + 1]; out.push(NL); f.areaNames[id] = (f.areaNames[id] || []).filter(o => o !== L); f.areaNames[id].push(NL); });
    f.areaNames[id] = f.areaNames[id].filter(o => out.includes(o));
  }
  f.labels = out;
}
function drawMapLabels(g, f, k) {
  const base = Math.max(10, k * .95);
  for (const L of f.labels || MD.mapLabels || []) {
    const [n, x, y, w] = L; let fs = base; g.font = `italic 600 ${fs}px "Lora", serif`; const tw = g.measureText(n).width, max = (w || 6) * k * .95;
    if (tw > max) { fs = Math.max(7, fs * max / tw); g.font = `italic 600 ${fs}px "Lora", serif`; }
    g.lineWidth = 3; g.strokeStyle = "rgba(230,215,190,.75)"; g.strokeText(n, x * k, y * k); g.fillStyle = "#2a1208"; g.fillText(n, x * k, y * k);
  }
}

// ---------- 3. MỞ TỦ / NGĂN KÉO ----------
const OPENABLE = { r_wardrobe: "tủ quần áo", r_dresser: "ngăn kéo bàn trang điểm", r_nightstand: "ngăn kéo tủ đầu giường", r_fridge: "tủ lạnh", r_filing: "ngăn tủ hồ sơ", r_lockerRow: "tủ đồ công nhân", r_toolCart: "ngăn tủ dụng cụ", r_desk: "ngăn bàn", r_officeDesk: "ngăn bàn", r_counter: "tủ bếp", r_stove: "lò nướng", r_ironMaiden: "quan tài sắt", r_toybox: "rương đồ chơi", r_globeDesk: "ngăn bàn" };
const LOOT_TXT = {
  r_wardrobe: ["Chỉ có mấy bộ quần áo cũ, mốc meo và lạnh ngắt.", "Một chiếc váy trắng của trẻ con, cổ áo dính đất.", "Mặt trong cánh tủ chi chít vết cào. Ai đó từng bị nhốt trong này.", "Trống rỗng. Nhưng trong tủ ấm hơn hẳn bên ngoài... như vừa có người trốn."],
  r_dresser: ["Một chiếc lược gỗ còn vướng mấy sợi tóc dài.", "Một xấp thư tình viết dở, mực đã nhòe.", "Hộp phấn vỡ và một thỏi son đỏ đã khô.", "Một tấm ảnh gia đình. Khuôn mặt một người bị cào nát."],
  r_nightstand: ["Một lọ thuốc ngủ đã hết.", "Một cuốn kinh cũ, gáy sách sờn rách.", "Một chiếc đồng hồ quả quýt dừng ở 3 giờ 13 phút.", "Một con búp bê nhỏ không có mắt."],
  r_fridge: ["Mùi hôi thối xộc ra. Thức ăn đã mục rữa từ lâu.", "Một khay đá chứa... những chiếc răng sữa.", "Trống rỗng. Đèn trong tủ chớp chớp rồi tắt hẳn.", "Một hũ thủy tinh dán nhãn “Đừng mở”."],
  r_filing: ["Hồ sơ nhân viên. Ảnh của ai cũng bị khoanh đỏ.", "Bảng chấm công. 27 cái tên, cùng một ngày cuối cùng.", "Giấy tờ bảo hiểm cháy nổ, ký vội.", "Những tờ giấy cháy sém, chỉ còn đọc được chữ “xích cửa”."],
  r_lockerRow: ["Bộ đồ bảo hộ còn treo, túi áo có tấm ảnh một đứa trẻ.", "Một hộp cơm nhôm còn nguyên — chủ nhân chưa kịp ăn.", "Đôi giày vải cháy xém một bên.", "Mặt trong cửa tủ có dòng chữ khắc: “Cứu tôi”."],
  r_toolCart: ["Cờ lê, tua vít, búa — tất cả rỉ sét.", "Một con dao rọc giấy dính vết đen khô.", "Một cuộn băng keo và mấy sợi xích nhỏ.", "Trống trơn."],
  r_desk: ["Một cây bút máy và lọ mực đã khô.", "Một lá thư chưa gửi, bắt đầu bằng “Xin hãy tha thứ...”.", "Một chùm chìa khóa — không chiếc nào vừa ổ nào ở đây.", "Một cuốn sổ ghi chép, trang cuối bị xé."],
  r_counter: ["Chén đũa phủ đầy bụi.", "Một con dao phay, lưỡi mẻ.", "Mấy hũ gia vị đã đóng cục.", "Một con chuột chết khô."],
  r_stove: ["Bên trong lò có một chiếc khay cháy đen.", "Mùi khét vẫn còn, dù lò đã nguội từ lâu.", "Trống rỗng. Thành lò có dấu tay nhỏ bám muội."],
  r_ironMaiden: ["Bên trong đầy gai sắt rỉ máu. Có một mảnh váy hầu gái mắc lại.", "Một bộ xương nhỏ co quắp vẫn còn bên trong!"],
  r_toybox: ["Mấy khối gỗ, một con gấu bông mất một mắt.", "Một con búp bê tóc đen, mắt nó vừa chớp?", "Một hộp nhạc nhỏ. Nó tự lên dây cót."],
};
LOOT_TXT.r_officeDesk = LOOT_TXT.r_desk; LOOT_TXT.r_globeDesk = LOOT_TXT.r_desk;
function setupOpenables() {
  for (const k in OPENABLE) { const nm = OPENABLE[k]; SPRITE_ACTS["rOpen_" + k] = s => openFurn(s, true); SPRITE_NAMES["rOpen_" + k] = "Mở " + nm; SPRITE_ACTS["rClose_" + k] = s => openFurn(s, false); SPRITE_NAMES["rClose_" + k] = "Đóng " + nm; }
  for (const f of Object.values(FLOORS)) for (const s of f.sprites) if (OPENABLE[s.k] && !s.act) { s.act = "rOpen_" + s.k; s.reach = 1.8; s.wide = .55; }
}
function openFurn(s, open) {
  s.open = open ? 1 : 0; s.act = (open ? "rClose_" : "rOpen_") + s.k; buildFloorMesh(F);
  if (!open) { noise(.12, 600, .18, 1.5); return; }
  tone(120 + Math.random() * 60, 0, .35, .05, "sawtooth"); noise(.3, 900, .15, 1.2);   // tiếng bản lề kẽo kẹt
  if (s.looted) { say("Bên trong không còn gì nữa."); return; } s.looted = 1;
  const r = h32(Math.round(s.x * 100), Math.round(s.y * 100), 7), txt = LOOT_TXT[s.k] || ["Trống rỗng."], flav = txt[Math.floor(h32(Math.round(s.x * 50), Math.round(s.y * 50), 9) * txt.length)];
  if (s.k === "r_ironMaiden" && r < .5) { faceFlash(); say(flav); return; }
  if (r < .3) { player.battery = Math.min(100, player.battery + 40); tone(784, 0, .16, .03, "sine"); tone(1175, .07, .22, .022, "sine"); say("Trong " + OPENABLE[s.k] + " có một cục pin cũ — vẫn còn dùng được! (+pin)"); return; }
  if (r < .38 && player.hp < D.hp) { player.hp = Math.min(D.hp, player.hp + 1); tone(523, 0, .8, .04); say("Bạn tìm thấy một hộp băng gạc. Vết thương đỡ đau hơn. (+1 máu)"); return; }
  if (r < .48) { const sp = { f: F.id, st: "crawl", x: s.x + Math.cos(s.rot || 0) * .4, y: s.y + Math.sin(s.rot || 0) * .4, sp: 1.2, go: true, fled: 1, face: (s.rot || 0) + (Math.random() - .5), t: 0, turn: 1 }; if (typeof SPIDERS !== "undefined") SPIDERS.push(sp); P1.shake = .35; noise(.3, 4000, .3, 2); say("Một con nhện to tướng bò vọt ra từ trong " + OPENABLE[s.k] + "!"); return; }
  say(flav);
}

// ---------- 4. CHƠI LẠI VỚI BỐ TRÍ MỚI ----------
function replaySame() { const k = Object.keys(DIFF).find(k => DIFF[k] === D) || "tb"; location.href = location.pathname + `?replay=${MAPID}&d=${k}`; }
function addReplayButtons() {
  for (const id of ["win", "lose"]) { const el = $(id); if (!el || el.querySelector(".replay")) continue; const b = document.createElement("button"); b.className = "replay"; b.textContent = "Chơi lại (bố trí mới)"; b.style.marginRight = "12px"; b.onclick = () => { if (COOP) location.reload(); else replaySame(); }; const old = el.querySelector("button"); old.parentNode.insertBefore(b, old); }
}
function autoReplay() {
  const q = new URLSearchParams(location.search), m = q.get("replay"); if (!m || !MAPDEFS[m]) return;
  try { sessionStorage.setItem("aakh-warned", "1"); localStorage.setItem("aakh-warned", "1"); } catch (e) {}
  setTimeout(() => { try { $("btnPlay").onclick(); $("mapCards").querySelector(`a[data-id=${m}]`)?.onclick?.(); const dk = q.get("d"); const b = [...$("diffBtns").children].find(x => DIFF[dk] && x.textContent === DIFF[dk].name); b?.onclick?.(); $("startBtn").onclick ? $("startBtn").onclick() : $("startBtn").click(); history.replaceState(null, "", location.pathname); } catch (e) { console.warn(e); } }, 60);
}

// ---------- 5. THÊM THẬT NHIỀU ĐỒ LẶT VẶT ----------
const CLUTTER = { house: ["paper", "book", "bottle", "rag", "toy", "plank", "shoe", "cup"], factory: ["paper", "can", "rag", "bolt", "plank", "box", "bottle", "glove"], castle: ["bone", "straw", "pot", "book", "rag", "candle", "plank", "goblet"], cemetery: ["leaf", "bone", "rock", "candle", "flower", "branch"], forest: ["leaf", "branch", "rock", "bone", "can", "mush"] };
function addClutter(f) {
  const kinds = CLUTTER[MAPID]; if (!kinds) return; const near = (x, y, r) => f.sprites.some(s => (s.solid || s.act) && Math.hypot(s.x - x, s.y - y) < r);
  for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
    if (f.grid[y][x] !== ".") continue; const indoor = !!f.room[y * f.w + x] && (!f.outdoor || f.room[y * f.w + x].roof);
    if (Math.random() > (indoor ? .22 : .1)) continue;
    let sp = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = f.grid[y + dy][x + dx]; if (c !== "." && c !== "#") sp = true; } if (sp) continue;
    const cx = x + .15 + Math.random() * .7, cy = y + .15 + Math.random() * .7; if (near(cx, cy, .45)) continue;
    const pool = indoor ? kinds.filter(k => !["leaf", "branch", "rock", "mush"].includes(k)) : kinds.filter(k => ["leaf", "branch", "rock", "bone", "can", "mush", "flower", "candle"].includes(k));
    (f.clutter || (f.clutter = [])).push({ k: "r_clutter", v: pool[Math.floor(Math.random() * pool.length)], x: cx, y: cy, rot: Math.random() * 6.28, deco: 1, seed: Math.random(), noSolidify: 1 });
  }
}
function clutterModel(v, s) {
  const f0 = facing(s.rot), X = XF(s.x, 0, s.y, f0.c, f0.s, M), rr = k => h32(Math.round(s.seed * 1e4), k, 3), B = (a, b, c, d, e, g, m) => pbox(v, X, a, b, c, d, e, g, m), dw = T.darkwood;
  switch (s.v) {
    case "paper": for (let i = 0; i < 3 + rr(1) * 4; i++) { const Q = XL(X, 0, 0, 0, 0, 0), x = (rr(i) - .5) * .5, z = (rr(i + 5) - .5) * .5; pbox(v, Sub3(X, s, x, z, rr(i + 9) * 6), -.1, .002 + i * .001, -.14, .1, .004 + i * .001, .14, T.paperSheet || T.clWhite); } break;
    case "book": for (let i = 0; i < 1 + rr(2) * 3; i++) pbox(v, Sub3(X, s, (rr(i) - .5) * .1, (rr(i + 3) - .5) * .1, rr(i + 6) * 1.2), -.1, i * .04, -.14, .1, i * .04 + .035, .14, T.bk[Math.floor(rr(i + 7) * 6) % 6]); break;
    case "bottle": for (let i = 0; i < 1 + rr(1) * 3; i++) { const x = (rr(i) - .5) * .3, z = (rr(i + 4) - .5) * .3; if (rr(i + 8) > .5) pcylX(v, Sub3(X, s, x, z, rr(i + 2) * 6), .04, 0, -.12, .12, .04, 7, T.glassB || T.dark); else pcyl(v, X, x, z, 0, .26, .04, .03, 7, T.glassB || T.dark, T.dark); } break;
    case "can": for (let i = 0; i < 2 + rr(1) * 3; i++) pcylX(v, Sub3(X, s, (rr(i) - .5) * .5, (rr(i + 4) - .5) * .5, rr(i + 9) * 6), .035, 0, -.06, .06, .035, 7, rr(i) > .5 ? T.metal : T.rust || T.metal); break;
    case "rag": case "glove": psphere(v, XSp(X, 0, 0, 0, 1.6, .18, 1.1), 0, 0, 0, .13, 7, [T.fabric, T.sack, T.coatT, T.r_quilt][Math.floor(rr(1) * 4)] || T.fabric); break;
    case "toy": pbox(v, X, -.05, 0, -.05, .05, .1, .05, T.clRed || T.fabric); psphere(v, X, .15, .06, .08, .06, 7, T.r_yellow || T.fabric); break;
    case "plank": for (let i = 0; i < 1 + rr(1) * 2; i++) pbox(v, Sub3(X, s, (rr(i) - .5) * .3, (rr(i + 2) - .5) * .3, rr(i + 5) * 3), -.6, i * .03, -.06, .6, i * .03 + .025, .06, dw); break;
    case "shoe": pbox(v, X, -.05, 0, -.13, .05, .07, .13, T.dark); pbox(v, Sub3(X, s, .18, .1, 1.2), -.05, 0, -.13, .05, .07, .13, T.dark); break;
    case "cup": case "goblet": case "pot": pcyl(v, X, 0, 0, 0, s.v === "pot" ? .22 : .1, s.v === "pot" ? .12 : .04, s.v === "pot" ? .09 : .045, 8, s.v === "goblet" ? (T.gold || T.brass || T.metal) : (T.potT || T.porcelain || T.enamel), T.dark); if (s.v === "pot") for (let i = 0; i < 4; i++) pbox(v, Sub3(X, s, .2 + rr(i) * .2, (rr(i + 3) - .5) * .4, rr(i) * 6), -.04, 0, -.03, .04, .01, .03, T.potT || T.porcelain); break;
    case "bolt": for (let i = 0; i < 6; i++) pcyl(v, X, (rr(i) - .5) * .4, (rr(i + 6) - .5) * .4, 0, .02, .018, .018, 6, T.metal, T.metal); break;
    case "box": pbox(v, Sub3(X, s, 0, 0, .3), -.18, 0, -.15, .18, .25, .15, T.cardboard); break;
    case "bone": for (let i = 0; i < 2 + rr(1) * 3; i++) pcylX(v, Sub3(X, s, (rr(i) - .5) * .4, (rr(i + 3) - .5) * .4, rr(i + 7) * 6), .018, 0, -.12, .12, .016, 5, T.boneT || T.bone || T.enamel); if (rr(9) > .6) psphere(v, X, .1, .06, -.1, .06, 7, T.boneT || T.bone || T.enamel, 1.2); break;
    case "straw": for (let i = 0; i < 14; i++) pbox(v, Sub3(X, s, (rr(i) - .5) * .5, (rr(i + 3) - .5) * .5, rr(i + 6) * 6), -.15, 0, -.004, .15, .006, .004, T.straw || T.r_yellow || T.sack); break;
    case "candle": for (let i = 0; i < 1 + rr(1) * 3; i++) pcyl(v, X, (rr(i) - .5) * .2, (rr(i + 4) - .5) * .2, 0, .06 + rr(i) * .12, .025, .025, 6, T.wax || T.enamel, T.wax || T.enamel); break;
    case "leaf": for (let i = 0; i < 10; i++) pbox(v, Sub3(X, s, (rr(i) - .5) * .7, (rr(i + 3) - .5) * .7, rr(i + 6) * 6), -.05, .002, -.03, .05, .006, .03, T.leaves || T.leafT || T.dirt); break;
    case "branch": pcylX(v, X, .03, 0, -.5, .5, .025, 5, T.bark || dw, T.bark || dw); pcylX(v, Sub3(X, s, .2, .05, .6), .03, 0, 0, .3, .015, 5, T.bark || dw, null); break;
    case "rock": psphere(v, XSp(X, 0, 0, 0, 1.3, .6, 1), 0, 0, 0, .1 + rr(1) * .1, 5, T.rockT); break;
    case "flower": for (let i = 0; i < 5; i++) { const x = (rr(i) - .5) * .25, z = (rr(i + 3) - .5) * .25; pcyl(v, X, x, z, 0, .12, .004, .004, 3, T.leafT || T.dark, null); psphere(v, X, x, .13, z, .025, 5, T.flowerW || T.clWhite); } break;
    case "mush": for (let i = 0; i < 4; i++) { const x = (rr(i) - .5) * .3, z = (rr(i + 3) - .5) * .3; pcyl(v, X, x, z, 0, .05, .012, .012, 5, T.clWhite || T.enamel, null); pcyl(v, X, x, z, .05, .075, .045, .005, 7, T.clRed || T.fabric, null); } break;
  }
}
function Sub3(X, s, x, z, da) { const p = X.p(x, 0, z), q = facing((s.rot || 0) + da); return XF(p[0], p[1], p[2], q.c, q.s, M); }

setTimeout(() => { addReplayButtons(); autoReplay(); }, 0);
