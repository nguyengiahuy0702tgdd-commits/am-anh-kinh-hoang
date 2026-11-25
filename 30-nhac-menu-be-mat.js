// =====================================================================
//  29. BẢN 16: nhạc menu ngay sau cảnh báo · cảnh báo chỉ hiện 1 lần · bề mặt có chiều sâu thật
//      cỏ/cây/mạng nhện lay theo gió, khói & lửa bốc lên · đèn pin tập trung · cốt truyện mở rộng
// =====================================================================

// ---------- 1. NHẠC MENU NGAY KHI BẤM QUA CẢNH BÁO; CẢNH BÁO CHỈ 1 LẦN MỖI LẦN MỞ GAME ----------
function startMenuMusic() { try { ensureAudio(); if (!S.started && !Music.cfg) Music.start("menu"); } catch (e) {} }
{ const once = () => { if (!$("warnScr")) startMenuMusic(); removeEventListener("pointerdown", once, true); removeEventListener("keydown", once, true); };
  addEventListener("pointerdown", once, true); addEventListener("keydown", once, true); }
// Về menu chính (thoát map / thắng / thua): tải lại trang nhưng đánh dấu để không hiện cảnh báo nữa
function markWarned() { try { window.name = "aakh-warned"; } catch (e) {} try { sessionStorage.setItem("aakh-warned", "1"); } catch (e) {} try { localStorage.setItem("aakh-warned", "1"); } catch (e) {} }
function backToMenu() { markWarned(); try { if (location.hash !== "#menu") location.hash = "menu"; } catch (e) {} location.reload(); }
const _showWarning = showWarning;
showWarning = function () {
  let seen = /replay=/.test(location.search) || location.hash === "#menu" || /aakh-warned/.test(window.name || "");   // quay về menu từ một map: không hiện lại cảnh báo try { seen = seen || sessionStorage.getItem("aakh-warned") === "1" || localStorage.getItem("aakh-warned") === "1"; } catch (e) {}   // chỉ hiện ở lần đầu tiên mở game
  if (seen) return; _showWarning();
  const el = $("warnScr"); if (!el) return;
  const fin = () => { markWarned(); startMenuMusic(); };
  el.addEventListener("click", fin, true); addEventListener("keydown", function k(e) { if (["Enter", "Space", "NumpadEnter", "Escape"].includes(e.code) && $("warnScr")) { fin(); removeEventListener("keydown", k, true); } }, true);
};

// ---------- 2. GIÓ: các lớp vật liệu lay động trong shader ----------
const WIND = [];   // [lớp texture, biên độ, độ cao gốc (-99 = lay đều)]
function windSetup() {
  WIND.length = 0; const add = (tx, a, b) => { const L = tx && LAYER.get(tx); if (L != null && WIND.length < 12) WIND.push([L, a, b]); };
  add(T.r_grassT, .32, 0); add(T.r_grassT2, .28, 0); add(T.r_fern, .25, 0); add(T.needles, F.outdoor ? .018 : 0, 1.4); add(T.leafT, .02, 1); add(T.webCorner, .05, -99); add(T.webFull, .06, -99);
  add(T.r_banner, .012, -99); add(T.bark, F.outdoor ? .007 : 0, .3); add(T.deadwood, F.outdoor ? .006 : 0, .3); add(T.curtain, .01, -99); add(T.flame, .02, -99);
}

// ---------- 3. CỎ MỌC NGOÀI TRỜI ----------
function growGrass(f) {
  if (!f.outdoor || !T.r_grassT) return;
  for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
    if (f.grid[y][x] !== "." || (f.room[y * f.w + x]?.roof)) continue; const path = f.path?.has(y * f.w + x);
    const n = path ? (Math.random() < .25 ? 1 : 0) : 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) f.sprites.push({ k: "r_grass", x: x + .1 + Math.random() * .8, y: y + .1 + Math.random() * .8, rot: Math.random() * 6.28, deco: 1, seed: Math.random(), tall: path ? .5 : .7 + Math.random() * .9, noSolidify: 1 });
  }
  // cỏ mọc sát chân tường rào / gốc cây ở rìa (che mép lưới)
  for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) if (f.grid[y][x] === "#" && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => f.grid[y + dy]?.[x + dx] === ".") && Math.random() < .7)
    f.sprites.push({ k: "r_grass", x: x + .5 + (Math.random() - .5) * .9, y: y + .5 + (Math.random() - .5) * .9, rot: Math.random() * 6.28, deco: 1, seed: Math.random(), tall: 1.3 + Math.random(), noSolidify: 1 });
}
function grassModel(v, s) {
  const L = LAYER.get(s.seed > .5 ? T.r_grassT : (T.r_grassT2 || T.r_grassT)), h = .16 * s.tall, w = .14 * (.7 + s.tall * .4);
  for (let i = 0; i < 3; i++) { const a = s.rot + i * 2.094, c = Math.cos(a) * w, sn = Math.sin(a) * w, lean = (s.seed - .5) * .04;
    quad(v, [[s.x - c, h, s.y - sn, 0, 0], [s.x + c, h, s.y + sn, 1, 0], [s.x + c + lean, 0, s.y + sn, 1, 1], [s.x - c + lean, 0, s.y - sn, 0, 1]].map((p, k) => k < 2 ? [p[0] + lean, p[1], p[2] + lean * .5, p[3], p[4]] : p), [0, 1, 0], L); }
}

// ---------- 4. KHÓI & LỬA ĐỘNG ----------
const EMIT_K = { bonfire: [.25, 1.4, 1], r_brazier: [.95 * .47, .9, 1], r_cauldron: [.8 * .47, .6, 0], r_machine: [1.35 * .47, .5, 0], r_press: [1.2, .4, 0] };
function drawSmoke(v, eye, fw) {
  if (!T.r_smokeL || SET.quality === "nhanh") return;
  const rl = Math.hypot(fw[0], fw[2]) || 1, rx = -fw[2] / rl, rz = fw[0] / rl, n = [-fw[0], -fw[1], -fw[2]], LS = LAYER.get(T.r_smokeL), LF = LAYER.get(T.r_flameT || T.flame);
  const bb = (x, y, z, s, L, sy = s) => quad(v, [[x - rx * s, y + sy, z - rz * s, 0, 0], [x + rx * s, y + sy, z + rz * s, 1, 0], [x + rx * s, y - sy, z + rz * s, 1, 1], [x - rx * s, y - sy, z - rz * s, 0, 1]], n, L);
  for (const s of F.sprites) {
    const e = EMIT_K[s.k]; if (!e || s.taken || Math.abs(s.x - eye[0]) + Math.abs(s.y - eye[2]) > 14) continue;
    if (s.k === "r_machine" && !S.power && MAPID === "factory") continue;
    const [y0, size, fire] = e, seed = (s.x * 13 + s.y * 7) % 1;
    for (let i = 0; i < 9; i++) {   // khói cuộn lên, phình ra rồi tan
      const ph = (t * .28 + i / 9 + seed) % 1, sx = Math.sin(t * .9 + i * 2.3) * .08 * ph + ph * .25 * Math.sin(seed * 9), sz = Math.cos(t * .7 + i * 1.7) * .08 * ph;
      bb(s.x + sx, y0 + .05 + ph * size * 1.8, s.y + sz, (.05 + ph * .22) * size * (1 - ph * .35), LS);
    }
    if (fire) for (let i = 0; i < 6; i++) {   // lưỡi lửa nhảy múa
      const ph = (t * 1.6 + i / 6 + seed) % 1, a = i * 1.05 + t * .5, r = .08 * size * (1 - ph);
      bb(s.x + Math.cos(a) * r, y0 + ph * .28 * size, s.y + Math.sin(a) * r, .06 * size * (1 - ph * .7), LF, .1 * size * (1 - ph * .5));
    }
  }
}
function buildV16Textures() {
  if (T.r_grassT) return;
  const grass = (c1, c2) => g => { for (let i = 0; i < 46; i++) { const x = 4 + rnd() * 120, h = 50 + rnd() * 76, bend = (rnd() - .5) * 26; g.strokeStyle = rnd() < .5 ? c1 : c2; g.lineWidth = 2 + rnd() * 2.5; g.beginPath(); g.moveTo(x, 128); g.quadraticCurveTo(x + bend * .3, 128 - h * .6, x + bend, 128 - h); g.stroke(); } };
  T.r_grassT = tex(grass("#1e2a14", "#2c3a1c")); T.r_grassT2 = tex(grass("#2a2a18", "#3a3620"));
  T.r_smokeL = tex(g => { for (let i = 0; i < 14; i++) E(g, 34 + rnd() * 60, 34 + rnd() * 60, 16 + rnd() * 18, 14 + rnd() * 18, i % 2 ? "#6a6866" : "#565452"); const id = g.getImageData(0, 0, g.canvas.width, g.canvas.height), W = g.canvas.width; for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const k = (y * W + x) * 4, r = Math.hypot(x - W / 2, y - W / 2) / (W / 2); if (rnd() < .55 + r * .4) id.data[k + 3] = 0; } g.putImageData(id, 0, 0); });
  T.r_flameT = texE(g => { const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "#ffe080"); gr.addColorStop(.5, "#ff8820"); gr.addColorStop(1, "#a02000"); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 4); g.quadraticCurveTo(110, 70, 96, 110); g.quadraticCurveTo(64, 134, 32, 110); g.quadraticCurveTo(18, 70, 64, 4); g.fill(); },
    g => { const gr = g.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "#ffe080"); gr.addColorStop(1, "#c03000"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
}

// ---------- 5. CHI TIẾT TƯỜNG: phào chân tường & phào trần ----------
function wallTrim(v, X, fh, f) {
  if (f.outdoor) return;
  if (MAPID === "factory" || MAPID === "hospital") { pbox(v, X, -.5, 0, 0, .5, .09, .025, T.r_greyP || T.metal); return; }
  const m = T.darkwood; pbox(v, X, -.5, 0, 0, .5, .075, .016, m); pbox(v, X, -.5, .075, 0, .5, .085, .01, m);
  if (fh < 3) { pbox(v, X, -.5, fh - .045, 0, .5, fh, .028, m); pbox(v, X, -.5, fh - .07, 0, .5, fh - .045, .014, m); }
}

// ---------- 6. CỐT TRUYỆN MỞ RỘNG ----------
const STORY_MORE = {
  house: { at: 4, add: ["Cảnh sát lục soát căn nhà ba lần. Không ai để ý chiếc tủ gỗ dưới hầm — nó bị đóng đinh kín, khuất sau bàn thờ, như một phần của bức tường.",
    "Bà Thành suy sụp, được đưa vào viện tâm thần. Suốt 10 năm, bà chỉ lặp lại một câu: <i>“Tủ... cái tủ... nó chỉ mở được từ bên ngoài.”</i> Ông Thành bỏ đi biệt tích.",
    "Người trong hẻm đồn: hồn Hằng không biết mình đã chết. Bé vẫn đang trốn, chờ có người tìm thấy. Ai bước vào nhà sẽ bị kéo vào trò chơi — và chỉ được ra khi gom đủ những gì gia đình này đã đánh mất: tấm ảnh, ngọn nến, và sự thật."] },
  forest: { at: 3, add: ["Bọn lâm tặc không sống được bao lâu. Kẻ treo cổ trong lán, kẻ chết đuối dưới giếng cạn, kẻ cuối cùng được tìm thấy ngồi dựa gốc thông, mắt mở trừng. Bên cạnh mỗi xác là một hình nhân rơm.",
    "Dân bản dựng lại miếu, cắm biển cấm chặt cây. Họ dặn nhau: vào rừng phải xin phép, không bẻ cành, không đốt lửa bằng gỗ sống. Kẻ Đứng Im chỉ đứng nhìn người biết giữ lời.",
    "Minh là bạn thân nhất của bạn từ thời đại học. Cậu đã rủ bạn đi cùng chuyến này — và bạn từ chối vì bận việc. Cảm giác tội lỗi ấy kéo bạn quay lại khu rừng, một mình."] },
  castle: { at: 3, add: ["Elizabeth vốn là con gái một người thợ dệt nghèo, bị gả bán cho Bá Tước để trừ nợ. Bà chưa từng được yêu thương — chỉ được ngắm nhìn như một món đồ đẹp.",
    "Khi nhan sắc tàn phai, bà hiểu rằng mình sẽ bị vứt bỏ như những món đồ cũ. Thầy giả kim Morvan biết điều đó. Hắn bán cho bà một hy vọng — để đổi lấy kho vàng của gia tộc.",
    "Cụ cố của bạn chính là người thợ rèn mất tích năm 1874. Gia đình bạn giữ một lá thư cuối cùng của cụ: <i>“Cọc đã đúc xong. Nếu tôi không về, hãy nhớ — bà ta sợ tiếng chuông bạc.”</i>"] },
  cemetery: { at: 4, add: ["Năm 1975, trận lụt lớn cuốn trôi khu mộ cũ bên sông. Hàng trăm hài cốt không ai nhận, được chôn chung một chỗ không bia không tên. Những vong không người thờ cúng ấy lang thang, đi theo tiếng khóc của Lan mỗi đêm rằm.",
    "Người ta nói vong không ác — chúng chỉ lạnh và cô độc. Chúng bám theo hơi ấm của người sống, và kẻ bị chúng ôm lấy sẽ không bao giờ ấm lại được nữa.",
    "Ông Tư gác mộ vừa qua đời tuần trước. Ông là ông ngoại của bạn. Vụ cá cược đêm nay do chính đám bạn bày ra, khi biết bạn chưa từng dám đặt chân vào nghĩa trang nơi ông làm việc suốt 30 năm."] },
  factory: { at: 4, add: ["Từ đó, mỗi đêm đúng 2 giờ, máy chấm công trong xưởng tự kêu lạch cạch, in ra 27 tấm thẻ cháy sém. Những người bảo vệ trước bạn không ai trụ quá một tuần.",
    "Người ta kể: hồn công nhân vẫn đi làm ca đêm, vì chưa ai trả lương cho họ, chưa ai nói ra sự thật. Còn gã quản đốc vẫn đi tuần, tay cầm dao phay, tìm chiếc chìa khóa cửa thoát hiểm.",
    "Bạn nhận việc vì cần tiền chữa bệnh cho mẹ — lương gấp ba bình thường, không cần kinh nghiệm. Người quản lý chỉ dặn một câu: <i>“Đừng bao giờ đi qua cửa thoát hiểm phía tây.”</i>"] },
};
for (const m in STORY_MORE) { const st = STORY[m], { at, add } = STORY_MORE[m]; st.intro = [...st.intro.slice(0, at), ...add, ...st.intro.slice(at)]; }
