// =====================================================================
//  19. BẢN 5: chơi 2 người · nhiệm vụ phụ · ma tăng theo tiến độ
//      cốt truyện mở đầu/kết thúc · hướng dẫn · HUD máu-đèn-thể lực
// =====================================================================
const P1 = player; let P2 = null, COOP = false, MODE = "single", TASKS = [];
const players = () => COOP ? [P1, P2] : [P1];
const pname = p => !COOP || p === P1 ? "Bạn" : "Đồng đội";
const pickR = a => a[Math.floor(Math.random() * a.length)];
const safeG = fn => { try { return !!fn(); } catch (e) { return false; } };
function withPlayer(p, fn) { const prev = player; player = p; try { return fn(); } finally { player = prev; } }

function ctlP2() {
  const k = keys;
  return { f: (k.ArrowUp || k.Numpad8 ? 1 : 0) - (k.ArrowDown || k.Numpad5 || k.Numpad2 ? 1 : 0), s: (k.Numpad9 ? 1 : 0) - (k.Numpad7 ? 1 : 0),
    turn: (k.ArrowRight || k.Numpad6 ? 1 : 0) - (k.ArrowLeft || k.Numpad4 ? 1 : 0), run: !!(k.ShiftRight || k.NumpadAdd) };
}

function toggleLight(p) { if (!p || p.hidden || p.dead) return; p.lightOn = !p.lightOn; TUT.light = 1; noise(.05, 3000, .25); }
function placeBeside(p, q) {
  const a = q.a + Math.PI / 2;
  for (const d of [.7, -.7, 1.1, -1.1, .4, -.4]) { const x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d; if (canStand(x, y)) { Object.assign(p, { x, y, a: q.a }); return; } }
  Object.assign(p, { x: q.x, y: q.y, a: q.a });
}

// ---- Vòng lặp: một hoặc hai người ----

function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
  gameStep(dt); perfTick(dt);
  render(); hud();
  if (ac && (fpsN = (fpsN || 0) + 1) % 6 === 0 && Music.cfg) Music.update(S.paused ? 0 : Math.max(0, 1 - minGhostD / 7), CHASING && !S.paused);
  if (SET.fps) { fpsAcc = (fpsAcc || 0) * .95 + .05 / Math.max(dt, .001); if (fpsN % 15 === 0) $("fps").textContent = Math.round(fpsAcc) + " FPS"; }
  for (const [p, id, key] of [[P1, "prompt", "E"], [P2, "prompt2", "Enter"]]) {
    if (!p) continue;
    const lbl = p.dead ? "" : p.hidden ? "Ra khỏi tủ" : S.paused ? "" : p.aimS ? SPRITE_NAMES[p.aimS.act] : p.aim ? NAMES[p.aim.c] : "";
    const pr = $(id); if (pr._l !== lbl) { pr._l = lbl; pr.innerHTML = lbl ? `<span class="key">${key}</span>${lbl}` : ""; }
  }
  $("lockHint").classList.toggle("hidden", !S.started || S.paused || document.pointerLockElement === cv);
  requestAnimationFrame(loop);
}

// ---- Dựng hình: chia đôi màn hình khi chơi 2 người ----

// Người chơi còn lại (mô hình 3D, cầm đèn pin)

// ---- HUD: máu · đèn pin · thể lực + bảng nhiệm vụ ----

function hud() {
  const g = goalText().replace(/^Mục tiêu: /, ""); $("jObj").textContent = g || "Không có ghi chép.";
  let hr = 1; for (const p of players()) if (!p.dead) hr = Math.min(hr, p.hp / D.hp);
  $("vig").style.opacity = Math.min(1, (1 - hr) * 1.15 + hurt * .7); $("vig").classList.toggle("low", players().some(p => p.hp === 1 && !p.dead) && D.hp > 1);
  statBox($("st1"), P1); if (COOP) statBox($("st2"), P2);
  for (const [p, id] of [[P1, "down1"], [P2, "down2"]]) { const on = COOP && p?.dead; $(id).classList.toggle("hidden", !on); if (on) $(id).querySelector("small").textContent = p.rev > 0 ? `Đang được kéo dậy... ${Math.min(100, Math.round(p.rev / 2.5 * 100))}%` : "Đồng đội hãy tới đứng sát bên để kéo dậy"; }
  if (MAPID === "cemetery" && S.started) { const mm = Math.min(180, Math.floor(S.clockMin)); $("timer").textContent = `0${Math.floor(mm / 60)}:${pad2(mm % 60)}`; if (mm >= 180 && !S.paused) lose("3 giờ sáng. Mọi nấm mộ cùng mở toang... Bạn sẽ ở lại đây mãi mãi."); }
  else if (D.time && S.started) { const left = Math.max(0, D.time - (Date.now() - S.started) / 1000); $("timer").textContent = `${Math.floor(left / 60)}:${pad2(Math.floor(left % 60))}`; if (left <= 0 && !S.paused) lose("Trời đã sáng... nhưng bạn sẽ không bao giờ thấy nó nữa."); }
  if (t > (S.tpT || 0)) { S.tpT = t + .3; renderTasks(); }
}
function renderTasks() {
  const el = $("taskList"); if (!el || !GOALS || !S.started) return;
  const hint = D.hint, last = GOALS.length - 1, cur = GOALS.findIndex(g => !safeG(g[0])), rows = [];
  GOALS.forEach((g, i) => {
    if (i === last) return; const done = safeG(g[0]); let txt = g[2]; if (typeof txt === "function") txt = txt();
    if (!done && ((hint >= 2 && i !== cur) || hint === 3)) { if (!rows.at(-1)?.q) rows.push({ txt: "? ? ?", q: 1, c: "next" }); return; }
    rows.push({ txt, c: done ? "done" : i === cur ? "cur" : "next" });
  });
  rows.push({ sep: 1 });
  for (const q of TASKS) rows.push({ txt: `${q.name} <em>${Math.min(q.got, q.need)}/${q.need}</em>`, c: "side" + (q.got >= q.need ? " done" : "") });
  rows.push({ sep: 1 });
  let ft = GOALS[last][2]; if (typeof ft === "function") ft = ft(); const ready = cur === last && TASKS.every(q => q.got >= q.need);
  rows.push({ txt: (hint === 3 && !ready ? "? ? ?" : ft) + (ready ? "" : " <em>(khóa)</em>"), c: ready ? "cur" : "lock" });
  const html = rows.map(r => r.sep ? '<li class="sep"></li>' : `<li class="${r.c || ""}">${r.txt}</li>`).join("");
  if (html !== el._h) { if (el._h && !$("tasks").classList.contains("show")) { const th = $("taskHint"); th.classList.remove("new"); void th.offsetWidth; th.classList.add("new"); } el._h = html; el.innerHTML = html; }
}

// ---- Nhiệm vụ phụ: rải khắp bản đồ, càng làm ma càng đông ----
const TASKDEF = {
  house: [
    { id: "A", kind: "collect", name: "Tìm mảnh ảnh gia đình bị xé", item: "một mảnh ảnh gia đình", verb: "Nhặt mảnh ảnh", tex: "tkPhoto", n: [5, 8] },
    { id: "B", kind: "light", name: "Thắp nến tưởng niệm", verb: "Thắp nến", doneMsg: "Ngọn nến bùng cháy. Bóng tối lùi lại một chút", n: [3, 5] },
    { id: "C", kind: "note", name: "Đọc nhật ký của mẹ", verb: "Đọc trang nhật ký", noteTitle: "Nhật ký của mẹ", tex: "tkPage", n: [3, 5], notes: [
      "Ngày 2: Linh nói có một bạn mới sống trong tủ quần áo. Mình cứ tưởng con bé tưởng tượng.",
      "Ngày 9: Đêm qua mình nghe tiếng hai đứa trẻ cười khúc khích trên lầu. Nhà mình chỉ có một đứa con.",
      "Ngày 14: Đồng hồ quả lắc dừng lúc nửa đêm. Anh Thành lên dây lại, sáng ra nó vẫn chỉ đúng giờ đó.",
      "Ngày 20: Linh không chịu ngủ một mình. Con bé bảo “bạn ấy” muốn đổi chỗ với con.",
      "Ngày 21: Mình tìm khắp nhà. Chỉ thấy bé Bông dưới hầm, úp mặt vào tường. Cửa hầm khóa từ bên trong."] }],
  forest: [
    { id: "A", kind: "collect", name: "Nhặt bùa giấy vàng", item: "một lá bùa giấy vàng", verb: "Nhặt lá bùa", tex: "tkTalis", n: [5, 8] },
    { id: "B", kind: "light", name: "Thắp nến dẫn hồn", verb: "Thắp nến", doneMsg: "Ngọn nến lập lòe giữa rừng thông. Có tiếng thở dài rất khẽ", n: [3, 5] },
    { id: "C", kind: "note", name: "Đọc sổ tay của Minh", verb: "Đọc trang sổ tay", noteTitle: "Sổ tay của Minh", tex: "tkPage", n: [3, 5], notes: [
      "Ngày 1: Dựng lều xong. Hùng thấy một người đứng xa xa giữa rừng, cao bất thường. Bọn mình cười trừ.",
      "Ngày 2: Những hình nhân rơm xuất hiện trên cây quanh lều. Đêm qua chưa hề có.",
      "Ngày 3: Hùng biến mất. Lan bảo nghe tiếng Hùng gọi từ phía giếng cũ.",
      "Ngày 4: Nó không nhúc nhích khi mình nhìn. Nó chỉ tiến lại khi mình quay lưng.",
      "Ngày ?: Ai đọc được thì nhớ — ĐỪNG nhìn nó quá lâu. Và đốt hết lũ hình nhân."] }],
  castle: [
    { id: "A", kind: "collect", name: "Thu hồi huy hiệu bạc gia tộc", item: "một huy hiệu bạc", verb: "Nhặt huy hiệu", tex: "tkBadge", n: [5, 8] },
    { id: "B", kind: "light", name: "Thắp nến trên giá", verb: "Thắp nến", doneMsg: "Ánh nến hắt lên những bức chân dung. Đôi mắt trong tranh nheo lại", n: [3, 5] },
    { id: "C", kind: "note", name: "Đọc biên niên sử bị xé", verb: "Đọc trang biên niên", noteTitle: "Biên niên sử Vạn Lạc", tex: "tkPage", n: [3, 5], notes: [
      "Năm 1861: Nữ Bá Tước Elizabeth về làm dâu gia tộc Vạn Lạc. Bà đẹp đến mức không ai dám nhìn thẳng.",
      "Năm 1870: Các cô hầu gái lần lượt mất tích. Trong làng đồn họ bị đưa xuống hầm mộ.",
      "Năm 1874: Thợ rèn được thuê đúc một chiếc cọc đồng thánh. Ông ta không bao giờ trở về.",
      "Năm 1888: Dân làng phá cổng. Họ chỉ thấy một bồn tắm đầy máu và một chiếc quan tài trống.",
      "Ghi chú cuối, nét chữ run rẩy: “Bà ta sợ ánh sáng thánh... và tiếng chuông bạc.”"] }],
  cemetery: [
    { id: "A", kind: "collect", name: "Nhặt đồng xu âm phủ", item: "một đồng xu âm phủ", verb: "Nhặt đồng xu", tex: "tkCoin", n: [5, 8] },
    { id: "B", kind: "light", name: "Thắp nhang trên mộ vô chủ", verb: "Thắp nhang", doneMsg: "Khói nhang bay thẳng lên rồi bỗng xoáy tròn quanh bạn", n: [3, 5] },
    { id: "C", kind: "note", name: "Đọc thư tay của cô Lan", verb: "Đọc lá thư", noteTitle: "Thư của cô Lan", tex: "tkPage", n: [3, 5], notes: [
      "Anh Tư thương, mai là ngày cưới rồi. Em ngồi chải tóc bằng chiếc lược ngà anh tặng mà cứ cười một mình.",
      "Mẹ dặn đêm trước ngày cưới không được ra bến sông. Nhưng em muốn ngắm trăng lần cuối khi còn là con gái.",
      "Nước lạnh lắm anh ơi. Em gọi mà không ai nghe.",
      "Họ chôn em cùng chiếc lược. Không có lược, em không thể chải tóc để đi lấy chồng.",
      "Ai trả lược về bàn thờ, em sẽ để người đó đi. Đừng để em đợi đến 3 giờ."] }],
  factory: [
    { id: "A", kind: "collect", name: "Thu thẻ chấm công của công nhân", item: "một thẻ chấm công cháy sém", verb: "Nhặt thẻ chấm công", tex: "tkCard", n: [5, 8] },
    { id: "B", kind: "light", name: "Thắp nến cầu siêu", verb: "Thắp nến", doneMsg: "Ngọn nến cháy xanh lét. Đâu đó, một chiếc máy dệt ngừng quay", n: [3, 5] },
    { id: "C", kind: "note", name: "Đọc biên bản tai nạn", verb: "Đọc biên bản", noteTitle: "Biên bản tai nạn lao động", tex: "tkPage", n: [3, 5], notes: [
      "Số 17/1990: Công nhân Lê Văn Bảy bị máy dệt cuốn tay. Quản đốc ghi: do sơ suất.",
      "Số 23/1990: Công nhân Trần Thị Hạnh mất tích sau ca đêm. Tủ đồ khóa từ bên trong.",
      "Số 31/1991: Bảo vệ thấy quản đốc kéo một bao tải nặng vào kho lúc 2 giờ sáng.",
      "Số 40/1991: Đêm cháy xưởng, cửa thoát hiểm bị xích từ bên ngoài. Chìa khóa do quản đốc giữ.",
      "Mảnh giấy kẹp kèm, chữ nguệch ngoạc: “Hắn vẫn đi tuần. Hắn không biết mình đã chết.”"] }],
};
const TASK_FLOORS = { house: ["t1", "t2", "b1"], castle: ["c1", "c3"], forest: ["f1"], cemetery: ["g1"], factory: ["x1"] };
const ESC_MSG = {
  house: ["Một tiếng cười khúc khích vang lên từ tầng trên... Có thêm thứ gì đó vừa thức dậy.", "Những khung ảnh trên tường đồng loạt úp mặt vào trong. Chúng đông hơn rồi.", "Bạn nghe tiếng bước chân trẻ con thứ hai... rồi thứ ba."],
  forest: ["Giữa rừng, thêm một bóng người cao gầy đứng im lặng.", "Những hình nhân rơm trên cây cùng lúc quay đầu về phía bạn.", "Tiếng cành khô gãy vang lên từ cả hai phía."],
  castle: ["Một cỗ quan tài dưới hầm mộ vừa bật nắp.", "Những bức chân dung mở mắt. Có thêm một bóng váy đỏ trong hành lang.", "Tiếng chuông bạc vang lên — lâu đài đang thức giấc."],
  cemetery: ["Một làn khói trắng bốc lên từ nấm mộ khác... rồi thành hình người.", "Tiếng khóc than vọng lại từ nhiều phía. Vong hồn đang tụ về.", "Thêm một bóng trắng lơ lửng giữa những hàng bia mộ."],
  factory: ["Một dây chuyền tự khởi động. Có thêm bước chân nặng nề trong xưởng.", "Tiếng dao phay vang lên từ hai hướng khác nhau.", "Tủ đồ bật mở. Những bộ đồng phục cháy sém... trống rỗng."],
  full: ["Chúng không đông thêm... nhưng đang nhanh hơn.", "Bóng tối như đặc lại. Chúng đã ngửi thấy mùi của bạn."],
};
function findSpot(f, placed, start) {
  let best = null, bd = -1;
  for (let k = 0; k < 60; k++) {
    const x = 1 + Math.floor(Math.random() * (f.w - 2)), y = 1 + Math.floor(Math.random() * (f.h - 2)); if (f.grid[y][x] !== ".") continue;
    const cx = x + .5, cy = y + .5; let bad = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const c = f.grid[y + dy]?.[x + dx]; if (c in STAIRS || (c && c !== "#" && c in NAMES)) bad = true; }
    { const nw = (a, b) => f.grid[b]?.[a] !== "."; if ((nw(x - 1, y) && nw(x + 1, y)) || (nw(x, y - 1) && nw(x, y + 1))) bad = true; }   // không đặt ở ô cửa / hành lang hẹp
    if (f.sprites.some(s => s.k === "r_col" && Math.hypot(s.x - cx, s.y - cy) < s.solid + .6)) bad = true;
    if (bad || f.sprites.some(s => !s.taken && Math.hypot(s.x - cx, s.y - cy) < (s.solid ? s.solid + .8 : .7))) continue;
    if ((f.blocks || []).some(b => cx > b[0] - .5 && cx < b[2] + .5 && cy > b[1] - .5 && cy < b[3] + .5)) continue;
    if (f.id === start.f && Math.hypot(cx - start.x, cy - start.y) < 6) continue;
    let m = 99; for (const q of placed) if (q.f === f) m = Math.min(m, Math.hypot(q.x - cx, q.y - cy));
    if (m > bd) { bd = m; best = { x: cx + (Math.random() - .5) * .3, y: cy + (Math.random() - .5) * .3 }; }
  }
  return best;
}

function taskModel(v, s) {
  if (taskModelX(v, s)) return;
  const { c, s: sn } = facing(s.rot || 0), X = XF(s.x, 0, s.y, c, sn), base = { house: T.darkwood, forest: T.bark, castle: T.stoneW, cemetery: T.mausW, factory: T.steelB, hospital: T.metal }[MAPID] || T.darkwood;
  if (s.tkind === "light") {
    pcyl(v, X, 0, 0, 0, .46, .13, .15, 8, base, base);
    if (MAPID === "cemetery") { pcyl(v, X, 0, 0, .46, .52, .08, .08, 8, T.metal, T.metal); for (const dx of [-.03, 0, .03]) { pbox(v, X, dx - .004, .52, -.004, dx + .004, .72, .004, s.lit ? T.flame : T.darkwood); } }
    else if (s.lit) { candle3d(v, X, -.04, .46, 0, .16); candle3d(v, X, .05, .46, .04, .1); }
    else { pcyl(v, X, -.04, 0, .46, .62, .028, .026, 8, T.wax, T.wax); pcyl(v, X, .05, .04, .46, .56, .028, .026, 8, T.wax, T.wax); }
  } else {
    pbox(v, X, -.15, 0, -.15, .15, .4, .15, base);
    pbox(v, X, -.1, .4, -.075, .1, .414, .075, { all: T[s.ttex] || T.paperSheet });
  }
}
function taskAct(s) {
  const q = TASKS.find(z => z.id === s.tk); if (!q || q.got >= q.need) return;
  q.got++; tone(660, 0, .5, .03); tone(990, .12, .6, .02);
  if (taskActX(q, s)) {} else if (q.kind === "light") { s.lit = 1; s.act = null; F.lights.push({ x: s.x, y: s.y, h: .75, i: .6, r: MAPID === "factory" ? .5 : 1, g: MAPID === "factory" ? .9 : .58, b: MAPID === "factory" ? .8 : .25, f: 1.1 }); say(`${q.doneMsg}. (${q.got}/${q.need})`); }
  else { s.taken = true; if (q.kind === "note") showNote(`<b>${q.noteTitle} — trang ${q.got}/${q.need}</b><br><br>${q.notes[(q.got - 1) % q.notes.length]}`); else say(`${pname(player)} nhặt được ${q.item}. (${q.got}/${q.need})`); }
  buildFloorMesh(F);
  if (q.got >= q.need) setTimeout(() => { say(`Đã xong: ${q.name}. Nhưng có gì đó vừa thay đổi trong bóng tối...`); setTimeout(escalate, 2600); }, q.kind === "note" ? 200 : 2200);
}
function exitReady() {
  const left = TASKS.filter(q => q.got < q.need); if (!left.length) return true;
  say("Chưa thể rời đi. Còn việc dang dở: " + left.map(q => `${q.name.toLowerCase()} (${q.got}/${q.need})`).join(" · ") + ".");
  noise(.6, 160, .4, .6); flicker(.6); return false;
}
function tasksTick(dt) {
  S.tkT = (S.tkT || 0) - dt; if (S.tkT > 0) return; S.tkT = .5;
  const md = GOALS.filter(g => safeG(g[0])).length;
  if (S.mainDone == null) S.mainDone = md;
  if (md > S.mainDone) { const n = md - S.mainDone; S.mainDone = md; for (let i = 0; i < n; i++) setTimeout(escalate, 1800 + i * 5000); }
  if (S.pendSpawn && F.w * F.h >= 300) { S.pendSpawn--; spawnMore(); }
}
function escalate() {
  if (S.ending || !S.started || (NET.ok && !NET.host)) return;
  if (!S.woke) { wakeGhosts(); return; }
  const base = MD.count ? MD.count() : D.ghosts; let extra = [2, 3, 4, 6][Object.values(DIFF).indexOf(D)] ?? 3;
  if (COOP) extra += 2; if (MAPID === "forest") extra = Math.ceil(extra / 2); if (MAPID === "cemetery") extra += D.zmax;
  if (ghosts.length >= base + extra) { for (const g of ghosts) g.mul = Math.min(1.5, (g.mul || 1) * 1.06); say(pickR(ESC_MSG.full)); flicker(); return; }
  if (F.w * F.h < 300) { S.pendSpawn = (S.pendSpawn || 0) + 1; return; }
  spawnMore();
}
function spawnMore() {
  if (MAPID === "cemetery") { const tb = F.sprites.filter(s => (s.k === "tomb" || s.k === "cross") && Math.hypot(s.x - player.x, s.y - player.y) > 9), p = tb[Math.floor(Math.random() * tb.length)]; if (p) spawnZombie(p.x, p.y + .6); else spawnEnemy(); }
  else spawnEnemy();
  flicker(1.2); noise(1.4, 180, .5, .6); setTimeout(() => say(pickR(ESC_MSG[MAPID])), 500);
}

// ---- Cốt truyện mở đầu & kết thúc ----
const STORY = {
  house: {
    intro: ["10 năm trước, gia đình ông Thành chuyển đến căn nhà số 13 cuối con hẻm. Ba tháng sau, bé Linh — đứa con gái tám tuổi — biến mất không một dấu vết.",
      "Cảnh sát lục soát khắp nơi. Không tìm thấy gì, ngoài con búp bê của bé nằm úp mặt trên sàn tầng hầm. Ông bà Thành bỏ đi ngay trong đêm, đồ đạc vẫn để nguyên.",
      "Bạn là thợ chụp ảnh nhà hoang. Đêm nay, bạn lẻn vào căn nhà số 13 để làm phóng sự. Cánh cửa đóng sập sau lưng. Ổ khóa điện tắt ngóm.",
      "Trên tường sảnh, ai đó vừa viết bằng máu, nét chữ còn ướt: <i>“Chơi trốn tìm với em nhé.”</i>"],
    end: ["Con búp bê nằm yên trên bàn thờ. Ngọn nến tự bùng lên, rồi tắt lịm.", "Cánh cửa chính mở ra. Bạn bước ra con hẻm, nơi trời đã hửng sáng.",
      "Từ ô cửa sổ lầu một, một bé gái mặc váy trắng vẫy tay chào bạn — rồi tan vào ánh bình minh."],
    endBad: ["Cánh cửa chính mở ra. Bạn chạy một mạch ra đầu hẻm, không dám ngoái lại.", "Về đến nhà, bạn mở máy ảnh xem lại. Tấm nào cũng có một bé gái đứng ngay sau lưng bạn.",
      "Tấm cuối cùng được chụp khi bạn đã ra khỏi căn nhà. Bé đang nắm tay bạn."] },
  forest: {
    intro: ["Rừng thông Đá Đen, tháng 11. Ba người bạn của bạn vào rừng cắm trại và không bao giờ trở ra.",
      "Một tuần sau, đội tìm kiếm chỉ thấy một chiếc lều rách và những hình nhân rơm treo lủng lẳng trên cây.",
      "Bạn quyết định tự đi tìm. Gần nửa đêm, chiếc xe chết máy ở bìa rừng. Điện thoại mất sóng.",
      "Giữa những thân thông, có một bóng người cao, gầy, đứng im... nhìn bạn."],
    end: ["Bánh xe nghiến lên sỏi đá. Đèn pha quét qua những thân cây, nơi hàng chục bóng người cao gầy đứng im lặng nhìn theo.",
      "Bạn không dừng lại cho đến khi thấy ánh đèn của thị trấn.", "Trên ghế sau, chiếc ba lô của Minh nằm đó. Bạn không nhớ mình đã mang nó theo."] },
  castle: {
    intro: ["Lâu đài Vạn Lạc nằm trên đỉnh đồi sương mù, bỏ hoang từ năm 1888 — năm Nữ Bá Tước Elizabeth biến mất.",
      "Dân làng kể rằng bà ta tắm trong máu của những cô hầu gái để giữ mãi tuổi xuân.",
      "Bạn là nhà sử học, đến tìm cuốn biên niên sử của gia tộc. Vừa bước qua cổng, song sắt sập xuống sau lưng.",
      "Trong đại sảnh, ngọn nến trên giá vẫn còn ấm... như thể vừa có người thắp."],
    end: ["Song sắt kéo lên kẽo kẹt. Bạn lao xuống con dốc sương mù.", "Sau lưng bạn, từng ô cửa sổ của lâu đài lần lượt sáng lên.",
      "Ở ô cửa cao nhất, một người phụ nữ trong bộ váy đỏ thẫm đứng nhìn theo, mỉm cười."] },
  cemetery: {
    intro: ["Nghĩa trang Bình An — nơi không ai dám đi ngang sau 0 giờ. 30 năm trước, cô Lan chết đuối vào đêm trước ngày cưới.",
      "Chiếc lược ngà — sính lễ của người chồng sắp cưới — bị chôn nhầm theo cô. Từ đó, mỗi đêm rằm, đất trong nghĩa trang lại chuyển động.",
      "Bạn thua một vụ cá cược và phải ở lại nghĩa trang tới 3 giờ sáng. Cánh cổng sắt khóa lại sau lưng bạn.",
      "0 giờ. Chuông nhà thờ đổ từng hồi, dù nhà thờ đã đóng cửa từ lâu."],
    end: ["Chiếc lược nằm trên bàn thờ. Tiếng khóc trong nhà thờ ngừng hẳn.", "Ổ khóa cổng rơi xuống. Bạn chạy qua những nấm mộ đang lún dần trở lại.",
      "Ở cổng, một giọng con gái thì thầm bên tai: <i>“Cảm ơn... giờ em đi lấy chồng được rồi.”</i>"] },
  factory: {
    intro: ["Xưởng dệt Hồng Phát đóng cửa sau vụ hỏa hoạn năm 1991. 27 công nhân ca đêm không ai thoát ra.",
      "Hồ sơ ghi: chập điện. Nhưng người sống sót kể về một gã quản đốc to béo, đeo tạp dề da, tay cầm con dao phay...",
      "Bạn là bảo vệ mới, nhận ca đêm đầu tiên. Đêm nay, máy móc trong xưởng tự khởi động.",
      "Từ cuối xưởng vọng lại tiếng dao chặt xuống thớt. Cạch. Cạch. Cạch."],
    end: ["Thang máy hàng rít lên, kéo bạn lên mặt đất. Qua khe cửa, gã Đồ Tể đứng dưới, ngẩng đầu nhìn theo.",
      "Sáng hôm sau, bạn nộp đơn nghỉ việc. Ông chủ chỉ gật đầu, như đã quá quen.", "Trong túi áo bạn có một tấm thẻ chấm công. Tên trên thẻ là tên bạn. Ngày vào làm: 1991."] },
};
function playStory(title, paras, done) {
  const el = $("story"), p = el.querySelector(".sp"), sk = el.querySelector(".sk"); el.classList.remove("hidden"); S.paused = true; document.exitPointerLock?.();
  el.querySelector(".st").textContent = title; bloodify(el.querySelector(".st"), 7);
  let i = -1;
  const finish = () => { removeEventListener("keydown", kd, true); el.onclick = null; el.classList.add("hidden"); done(); };
  const next = () => {
    i++; if (i >= paras.length) return finish(); p.classList.remove("in"); p.innerHTML = paras[i]; void p.offsetWidth; p.classList.add("in");
    if (ac) { tone(110, 0, 2.2, .05, "sine"); tone(164.8, .05, 2, .025, "sine"); }
    sk.textContent = `${i + 1} / ${paras.length}  ·  Nhấp chuột hoặc Space để tiếp  ·  Esc để bỏ qua`;
  };
  const kd = e => { if (["Space", "Enter", "NumpadEnter"].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); next(); } else if (e.code === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); finish(); } };
  addEventListener("keydown", kd, true); el.onclick = next; next();
}
function playEnding(showPanel) { if (!S.recDone) { S.recDone = 1; const rr = saveRun(); $("winText").insertAdjacentHTML("beforeend", `<div class="runTime">Thời gian hoàn thành: <b>${fmtT(rr.sec)}</b>${rr.isBest ? ' <span class="nb">KỶ LỤC MỚI!</span>' : ` · Kỷ lục: <b>${fmtT(rr.prev)}</b>`}</div>`); } const st = STORY[MAPID]; playStory("Hồi kết", MAPID === "house" && !S.altar ? st.endBad : st.end, showPanel); }

// ---- Hướng dẫn trong game ----
const TUT = { on: false };
const TUT_STEPS = [
  { t: () => COOP ? "Người 1: <b>W A S D</b> để đi · Người 2: <b>↑ ↓</b> để đi, <b>← →</b> để quay" : "Dùng <b>W A S D</b> để di chuyển", ok: () => TUT.moved > 2.5 },
  { t: () => COOP ? "Người 1 rê <b>chuột</b> để nhìn · Người 2 dùng <b>← →</b> để quay người" : "Rê <b>chuột</b> để nhìn xung quanh", ok: () => TUT.turned > 1.6 },
  { t: () => COOP ? "Đèn pin: Người 1 bấm <b>F</b> · Người 2 bấm <b>/</b> — pin có hạn" : "Bấm <b>F</b> để tắt / bật đèn pin — pin có hạn", ok: () => TUT.light },
  { t: () => COOP ? "Chạy: Người 1 giữ <b>Shift trái</b> · Người 2 giữ <b>Shift phải</b> — tiếng chân sẽ dụ chúng tới" : "Giữ <b>Shift</b> để chạy — nhưng tiếng chân sẽ dụ chúng tới", ok: () => TUT.ran > .8 },
  { t: () => COOP ? "Nhìn vào đồ vật: Người 1 bấm <b>E</b> · Người 2 bấm <b>Enter</b> để tương tác" : "Nhìn vào đồ vật có chữ gợi ý rồi bấm <b>E</b> để tương tác", ok: () => TUT.used },
  { t: () => "Bấm <b>M</b> để mở bản đồ, bấm lần nữa để đóng", ok: () => TUT.map },
  { t: () => "Bảng <b>Nhiệm vụ</b> ở góc trên (phím <b>J</b> để thu gọn). Mỗi việc xong sẽ đánh thức thêm thứ trong bóng tối...", ok: () => TUT.age > 7 },
];
function startTutorial() { Object.assign(TUT, { on: true, i: 0, age: 0, moved: 0, turned: 0, light: 0, ran: 0, used: 0, map: 0, okT: 0, lx: P1.x, ly: P1.y, la: P1.a, la2: P2?.a }); showTut(); }
function showTut() { const el = $("tut"); el.classList.remove("hidden", "ok"); el.innerHTML = `<span class="tn">${TUT.i + 1}/${TUT_STEPS.length}</span>${TUT_STEPS[TUT.i].t()}`; }
function tutTick(dt) {
  if (!TUT.on) return; TUT.age += dt;
  for (const p of players()) if (p.running) TUT.ran += dt;
  TUT.moved += Math.hypot(P1.x - TUT.lx, P1.y - TUT.ly); TUT.lx = P1.x; TUT.ly = P1.y; TUT.turned += Math.abs(P1.a - TUT.la); TUT.la = P1.a;
  if (COOP) { TUT.turned += Math.abs(P2.a - TUT.la2); TUT.la2 = P2.a; }
  if (TUT.okT > 0) {
    TUT.okT -= dt; if (TUT.okT > 0) return; TUT.i++; TUT.age = 0;
    if (TUT.i >= TUT_STEPS.length) { TUT.on = false; const el = $("tut"); el.classList.remove("ok"); el.innerHTML = '<span class="tn">—</span>Hướng dẫn xong. Giờ thì... cố mà sống sót.'; setTimeout(() => el.classList.add("hidden"), 3800); return; }
    return showTut();
  }
  if (TUT_STEPS[TUT.i].ok() || TUT.age > 16) { TUT.okT = 1; $("tut").classList.add("ok"); }
}

// ---- Phím riêng: người chơi 2, thu gọn bảng nhiệm vụ ----
addEventListener("keydown", e => {
  if (!S.started || S.ending) return;
  if (noteOpen() && (e.code === "Enter" || e.code === "NumpadEnter")) { $("note").onclick(); return; }
  if (S.paused) return;
  if (e.code === "KeyM") TUT.map = 1;
  return;
  if (e.code === "Enter" || e.code === "NumpadEnter" || e.code === "Numpad0") { e.preventDefault(); act(P2); }
  if (e.code === "Slash" || e.code === "NumpadDecimal") { e.preventDefault(); toggleLight(P2); }
});

// ---- Góc phòng bo tròn ----
const FILLET_R = .42;
function solidWall(f, x, y) { const c = f.grid[y]?.[x] ?? "#"; return c !== "." && c !== "I" && !(c in STAIRS) && !(c in PROP_DEPTH) && !STRETCH.has(c) && !(c !== "#" && c in NAMES); }
function cornerList(f, x, y) {
  const out = [];
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) if (solidWall(f, x + sx, y) && solidWall(f, x, y + sy) && solidWall(f, x + sx, y + sy)) out.push([sx, sy]);
  return out;
}
function filletCorners(v, f, x, y, h, rm) {
  if (f.outdoor && !rm?.roof) return;
  for (const [sx, sy] of cornerList(f, x, y)) {
    const r = FILLET_R, ox = x + (sx > 0 ? 1 : 0) - sx * r, oz = y + (sy > 0 ? 1 : 0) - sy * r, a0 = sx > 0 ? 0 : Math.PI, a1 = a0 + (sx * sy > 0 ? Math.PI / 2 : -Math.PI / 2);
    const L = LAYER.get(wallTexAt("#", x, y, x + sx, y)), v0 = 1 - h / WH, N = 6;
    for (let i = 0; i < N; i++) {
      const A = a0 + (a1 - a0) * i / N, B = a0 + (a1 - a0) * (i + 1) / N, M = (A + B) / 2;
      quad(v, [[ox + Math.cos(A) * r, h, oz + Math.sin(A) * r, i / N * .66, v0], [ox + Math.cos(B) * r, h, oz + Math.sin(B) * r, (i + 1) / N * .66, v0], [ox + Math.cos(B) * r, 0, oz + Math.sin(B) * r, (i + 1) / N * .66, 1], [ox + Math.cos(A) * r, 0, oz + Math.sin(A) * r, i / N * .66, 1]], [-Math.cos(M), 0, -Math.sin(M)], L);
    }
  }
}
// ---- Bản đồ (M): góc bo tròn, hiện cả hai người chơi ----
function toggleMap(force) {
  const c = $("mapView"), show = force ?? c.classList.contains("hidden");
  if (!show || !S.started) { c.classList.add("hidden"); return; }
  c.classList.remove("hidden"); const g = c.getContext("2d"), f = F, k = Math.floor(Math.min(innerWidth * .8 / f.w, innerHeight * .8 / f.h));
  c.width = k * f.w; c.height = k * f.h; g.fillStyle = "#c9b48a"; g.fillRect(0, 0, c.width, c.height);
  const colAt = (x, y) => { const ch = f.grid[y][x];
    if (ch === ".") return f.path?.has(y * f.w + x) ? "#a88a5c" : f.room[y * f.w + x] ? "#d8c49a" : "#bba57a";
    if (ch === "#") return f.outdoor ? (f.edge === "fence" ? "#2a2a28" : (x + y) % 2 ? "#56664a" : "#4a5a38") : "#3a2a1c";
    return ch in STAIRS ? "#2a5a8a" : ch === "I" ? "#6a5a4a" : "#5a2a1a"; };
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) { g.fillStyle = colAt(x, y); g.fillRect(x * k, y * k, k + .5, k + .5); }
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.grid[y][x] === "." && !(f.outdoor && !f.room[y * f.w + x]?.roof))
    for (const [sx, sy] of cornerList(f, x, y)) { const r = k * .8, cx = (x + (sx > 0 ? 1 : 0)) * k, cy = (y + (sy > 0 ? 1 : 0)) * k;
      g.fillStyle = colAt(x + sx, y); g.fillRect(Math.min(cx, cx - sx * r), Math.min(cy, cy - sy * r), r, r); g.fillStyle = colAt(x, y); g.beginPath(); g.arc(cx - sx * r, cy - sy * r, r, 0, 7); g.fill(); }
  g.fillStyle = "#2a1208"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `italic ${Math.max(11, k * 1.05)}px "Lora", serif`;
  drawMapLabels(g, f, k);
  g.fillStyle = "#3a1a0a"; g.font = `${Math.max(15, k * 1.7)}px "Charm", serif`; g.textAlign = "left"; g.fillText(f.name, k * 1.2, k * 1.4);
  c._k = k; c._f = f; c._base = (() => { const o = document.createElement("canvas"); o.width = c.width; o.height = c.height; const og = o.getContext("2d"); og.drawImage(c, 0, 0); og.fillStyle = "rgba(60,30,10,.16)"; for (let i = 0; i < 300; i++) og.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); return o; })(); mapLive(); return;
  if (D.hint < 3) players().forEach((p, i) => { const px = p.x * k, py = p.y * k, a = p.a; g.fillStyle = i ? "#1a4ab0" : "#b00"; g.beginPath(); g.moveTo(px + Math.cos(a) * k, py + Math.sin(a) * k); g.lineTo(px + Math.cos(a + 2.5) * k * .7, py + Math.sin(a + 2.5) * k * .7); g.lineTo(px + Math.cos(a - 2.5) * k * .7, py + Math.sin(a - 2.5) * k * .7); g.fill(); });
  g.fillStyle = "rgba(60,30,10,.16)"; for (let i = 0; i < 300; i++) g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2);
}

// ---- Texture cho vật phẩm nhiệm vụ & người chơi ----
function buildTaskTextures() {
  const glow = c => g => { g.fillStyle = c; g.fillRect(0, 0, 128, 128); };
  T.tkPhoto = tex(g => { R(g, 0, 0, 128, 128, "#d6cdb6"); R(g, 10, 10, 108, 80, "#2a2622"); for (const x of [36, 64, 92]) { g.fillStyle = "#0c0a09"; g.beginPath(); g.arc(x, 44, 9, 0, 7); g.fill(); R(g, x - 12, 54, 24, 36, "#0c0a09"); }
    g.fillStyle = "#6a0606"; g.beginPath(); g.moveTo(80, 0); g.lineTo(128, 0); g.lineTo(128, 128); g.lineTo(96, 128); g.lineTo(104, 90); g.lineTo(88, 60); g.lineTo(100, 30); g.fill(); R(g, 60, 40, 10, 14, "#000"); }, glow("rgba(200,170,120,.25)"));
  T.tkTalis = tex(g => { R(g, 0, 0, 128, 128, "#c9a22a"); R(g, 6, 6, 116, 116, "#d8b43a"); g.strokeStyle = "#8a0e08"; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(30 + i * 13, 18); g.bezierCurveTo(10 + i * 18, 50, 90 - i * 9, 80, 40 + i * 12, 110); } g.stroke(); }, glow("rgba(220,180,60,.3)"));
  T.tkBadge = tex(g => { R(g, 0, 0, 128, 128, "#3a3a40"); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 56); gr.addColorStop(0, "#e8e8f0"); gr.addColorStop(1, "#6a6a76"); g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 54, 0, 7); g.fill(); g.strokeStyle = "#2a2a30"; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 24); g.lineTo(64, 104); g.moveTo(34, 52); g.lineTo(94, 52); g.stroke(); }, glow("rgba(170,180,220,.3)"));
  T.tkCoin = tex(g => { R(g, 0, 0, 128, 128, "#2a2010"); const gr = g.createRadialGradient(54, 54, 4, 64, 64, 58); gr.addColorStop(0, "#e6c070"); gr.addColorStop(1, "#7a5418"); g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); R(g, 52, 52, 24, 24, "#2a1a08"); }, glow("rgba(230,180,80,.3)"));
  T.tkCard = tex(g => { R(g, 0, 0, 128, 128, "#d2ccb8"); R(g, 0, 0, 128, 26, "#7a1a12"); R(g, 12, 38, 40, 50, "#3a3430"); for (let y = 42; y < 100; y += 12) R(g, 62, y, 54, 5, "#4a4440"); g.fillStyle = "rgba(20,10,5,.75)"; g.beginPath(); g.arc(110, 110, 34, 0, 7); g.fill(); }, glow("rgba(200,190,160,.25)"));
  T.tkPage = tex(g => { R(g, 0, 0, 128, 128, "#d8ccae"); for (let y = 16; y < 120; y += 9) R(g, 12, y, 90 + rnd() * 20, 1.5, "#4a3a2a"); stain(g, 90, 96, 22, "rgba(110,0,0,.6)"); }, glow("rgba(220,200,160,.25)"));
  T.coatT = tex(g => { R(g, 0, 0, 128, 128, "#23262a"); for (let i = 0; i < 40; i++) R(g, rnd() * 128, rnd() * 128, 2, 10, "rgba(0,0,0,.25)"); R(g, 60, 0, 6, 128, "#15171a"); });
  T.jeansT = tex(g => { R(g, 0, 0, 128, 128, "#1e2633"); for (let i = 0; i < 60; i++) R(g, rnd() * 128, rnd() * 128, 1, 6, "rgba(120,140,170,.15)"); });
  T.faceT = tex(g => { R(g, 0, 0, 128, 128, "#b08a72"); R(g, 40, 50, 12, 6, "#2a1a12"); R(g, 76, 50, 12, 6, "#2a1a12"); R(g, 52, 88, 24, 4, "#6a3a2a"); });
  T.hairT = tex(g => { R(g, 0, 0, 128, 128, "#120d0a"); for (let i = 0; i < 50; i++) R(g, rnd() * 128, rnd() * 128, 1, 14, "rgba(60,40,30,.4)"); });
}

// ---- Giao diện: chọn số người chơi, hiệu ứng menu ----

function drawMenuFx() {
  const c = $("menuFx"); if (!c) return; c.width = innerWidth; c.height = innerHeight; const g = c.getContext("2d"), W = c.width, H = c.height;
  let sd = 11; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const blood = (x, y, Rr) => {
    g.fillStyle = "rgba(85,0,0,.55)"; g.beginPath(); g.arc(x, y, Rr * .5, 0, 7); g.fill();
    for (let i = 0; i < 34; i++) { const a = r() * 6.28, d = Rr * (.4 + r() * 1.4), rr = Rr * (.03 + r() * .12) * (1.6 - d / Rr * .7); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(1, rr), 0, 7); g.fill(); }
    for (let i = 0; i < 6; i++) { const dx = x + (r() - .5) * Rr * .9, L = Rr * (.6 + r() * 2.2), w = 2 + r() * 4; g.fillRect(dx - w / 2, y, w, L); g.beginPath(); g.arc(dx, y + L, w * .9, 0, 7); g.fill(); }
  };
  const hand = (x, y, sc, rot, al) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.fillStyle = `rgba(105,3,2,${al})`; g.beginPath(); g.ellipse(0, 0, 25, 30, 0, 0, 7); g.fill();
    [[-21, -40, -.32, 26], [-7, -50, -.1, 34], [8, -52, .06, 36], [22, -44, .24, 30], [33, -6, .95, 24]].forEach(([fx, fy, fr, L]) => { g.save(); g.translate(fx, fy + L / 2); g.rotate(fr); g.beginPath(); g.roundRect(-6, -L / 2 - 6, 12, L + 6, 6); g.fill(); g.restore(); });
    for (let i = 0; i < 4; i++) { const w = 3 + r() * 3, L = 18 + r() * 60; g.fillRect(-18 + i * 11, 22, w, L); g.beginPath(); g.arc(-18 + i * 11 + w / 2, 22 + L, w * .8, 0, 7); g.fill(); }
    g.restore();
  };
  blood(W * .97, H * .04, 70); blood(W * .015, H * .97, 80); blood(W * .55, H * -.02, 40);
  hand(W * .93, H * .62, 1.25, -.35, .42); hand(W * .86, H * .74, 1.05, .25, .3); hand(W * .04, H * .3, .9, 1.4, .25);
  g.strokeStyle = "rgba(0,0,0,.55)"; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(W * .66 + k * 16, H * .8); g.quadraticCurveTo(W * .67 + k * 18, H * .88, W * .655 + k * 22, H * .99); g.stroke(); }
}
addEventListener("resize", drawMenuFx);
const MENU_WHISPERS = ["đừng quay lại", "nó thấy bạn rồi", "ở lại với chúng tôi", "sau lưng bạn", "tắt đèn đi", "chơi với em nhé", "đã quá nửa đêm", "không ai trở về"];
setInterval(() => {
  if (!BG.on) return; const w = $("mwhisp"); if (!w) return;
  w.textContent = pickR(MENU_WHISPERS); w.style.left = (30 + Math.random() * 22) + "vw"; w.style.top = (82 + Math.random() * 8) + "vh"; w.style.transform = `rotate(${(Math.random() - .5) * 14}deg)`;
  w.classList.remove("on"); void w.offsetWidth; w.classList.add("on");
}, 5200);
