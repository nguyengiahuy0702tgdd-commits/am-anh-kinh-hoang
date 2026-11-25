// =====================================================================
//  33. BẢN 20: tiếng ma nói chuyện (thì thầm bên tai / sau lưng, âm thanh 3D) · đèn pin dịu hơn
// =====================================================================
const GV = { next: 30, ghostCd: 8, hideCd: 0, buf: null, busy: 0 };
// Giọng theo kiểu ma: dải cộng hưởng (fk), cao độ (f0), độ "có tiếng" (voiced) và giọng đọc của máy
const GV_KIND = {
  child: { fk: 1.32, f0: 330, voiced: .2, pitch: 1.7, rate: .78 },
  woman: { fk: 1.1, f0: 205, voiced: .16, pitch: .75, rate: .68 },
  deep: { fk: .8, f0: 78, voiced: .38, pitch: .1, rate: .58 },
  wet: { fk: 1.04, f0: 190, voiced: .1, pitch: .55, rate: .62 },
};
const GV_MAPKIND = { house: "child", forest: "deep", castle: "woman", cemetery: "wet", factory: "deep", hospital: "deep" };
const GV_LINES = {
  house: { amb: ["Chơi trốn tìm với em đi...", "Em đếm đến mười rồi đó...", "Mẹ ơi... con lạnh quá...", "Sao không ai tìm em hết vậy...", "Trong tủ tối lắm..."],
    near: ["Em thấy anh rồi...", "Sau lưng anh nè...", "Đừng quay lại nha...", "Hì hì... bắt được rồi..."], hidden: ["Anh trốn trong tủ hả... em cũng từng trốn ở đó...", "Cạch... cạch... mở cửa ra đi..."],
    convo: [["Linh ơi... ra chơi với chị đi...", "Em sợ lắm... có người lạ trong nhà..."], ["Chị Hằng ơi, anh ấy là ai vậy?", "Suỵt... anh ấy sẽ ở lại chơi với chị em mình mãi mãi..."]] },
  forest: { amb: ["Ai cho mày vào rừng...", "Cây đau lắm...", "Trả cành cây lại đây...", "Ba đứa... giờ là bốn..."],
    near: ["Tao thấy mày rồi...", "Đừng nhìn tao...", "Quay lại đi... quay lại nhìn tao đi..."], hidden: ["Mày trốn không được đâu..."],
    convo: [[["Minh đây... cứu tao với...", "woman"], "Đừng tin nó... đó không phải Minh..."], [["Lan ơi... mày ở đâu...", "woman"], ["Tao ở trên cây... nhìn lên đi...", "woman"]]] },
  castle: { amb: ["Máu của ngươi... thơm quá...", "Lại gần đây... ta muốn nhìn kỹ ngươi...", "Ta sẽ đẹp mãi mãi...", "Mai ơi... lên phòng ta..."],
    near: ["Ta nghe thấy tim ngươi đập...", "Ngay sau lưng ngươi đây...", "Đừng chạy... ta ghét tiếng ồn..."], hidden: ["Ta ngửi thấy ngươi sau tấm rèm..."],
    convo: [["Thưa phu nhân... xin tha cho con...", "Im lặng. Bồn tắm đã đầy chưa?"]] },
  cemetery: { amb: ["Lạnh quá... nước lạnh quá...", "Anh Tư ơi... anh ở đâu...", "Trả lược cho em...", "Ai chải tóc cho em bây giờ..."],
    near: ["Ấm quá... cho em ôm một chút...", "Đừng đi... ở lại với em...", "Em ở ngay sau anh..."], hidden: ["Em biết anh ở đây mà..."],
    convo: [[["Lan ơi... tha cho chị...", "woman"], "Chị đẩy em xuống sông... chị Huệ..."], [["Lạnh quá... cho tôi ké hơi ấm...", "deep"], "Người sống... người sống kìa..."]] },
  factory: { amb: ["Ca đêm chưa hết đâu...", "Lương của tao đâu...", "Nóng quá... mở cửa ra...", "27 người..."],
    near: ["Thịt tươi...", "Lại đây... lại đây...", "Mày nghe thấy tiếng dao chưa..."], hidden: ["Tủ đồ... tao nhớ hết từng cái tủ..."],
    convo: [[["Anh Tư ơi, cửa bị xích rồi!", "woman"], ["Đừng la... hắn nghe thấy đó...", "woman"]], [["Ai đốt xưởng vậy...", "woman"], "Tao... tao chỉ làm theo lệnh..."]] },
  hospital: { amb: [["Chị ơi... chị về rồi hả...", "child"], "Bệnh nhân số 47... về phòng mổ...", ["Đau quá... trả tay cho em...", "child"], "Nằm yên... sẽ không đau đâu...", ["Mẹ ơi... sao mẹ không tới...", "child"]],
    near: ["Ta thấy ngươi rồi... 47...", "Ghép lại... ghép lại...", ["Chị ơi... đừng bỏ em...", "child"], "Nằm xuống... ca mổ bắt đầu..."], hidden: ["Ta nghe thấy tim ngươi đập trong tủ...", ["Chị trốn ở đâu vậy...", "child"]],
    convo: [[["Chị ơi... em lạnh...", "child"], "Suỵt... chị con sắp về rồi..."], [["Bác sĩ ơi... đừng mổ nữa...", "woman"], "Ngươi sẽ hoàn hảo... như ta..."]] },
};
const GV_VOW = [[300, 870, 2240], [270, 2290, 3010], [530, 1840, 2480], [660, 1720, 2410], [730, 1090, 2440], [570, 840, 2410], [440, 1020, 2240], [400, 1600, 2600]];
const gvPick = a => a[Math.floor(Math.random() * a.length)];
function gvSub(text, side) {
  let el = $("gvoice"); if (!el) { el = document.createElement("div"); el.id = "gvoice"; el.style.cssText = "position:fixed;z-index:31;pointer-events:none;font-style:italic;font-size:clamp(15px,1.4vw,21px);color:rgba(215,205,200,.92);opacity:0;text-shadow:0 0 8px #000,0 0 14px rgba(150,0,0,.9);transition:opacity .5s;max-width:32vw;letter-spacing:.03em"; document.body.appendChild(el); }
  const pos = { left: "left:5vw;top:48vh;text-align:left", right: "right:5vw;top:48vh;text-align:right", behind: "left:50%;bottom:17vh;transform:translateX(-50%);text-align:center", front: "left:50%;top:30vh;transform:translateX(-50%);text-align:center" }[side];
  el.style.left = el.style.right = el.style.top = el.style.bottom = el.style.transform = ""; el.style.cssText += ";" + pos;
  el.textContent = (side === "left" ? "◂ " : "") + "“" + text + "”" + (side === "right" ? " ▸" : side === "behind" ? "  (sau lưng)" : "");
  el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 1400 + text.length * 70);   // ẩn cả chữ lẫn quầng đỏ (trước đây chỉ ẩn màu chữ → còn sót vệt chữ đỏ mờ)
}
// Tổng hợp tiếng thì thầm: tiếng hơi đi qua các dải cộng hưởng nguyên âm, có phụ âm gió, phát từ một vị trí 3D quanh đầu người chơi

const gvLine = x => Array.isArray(x) ? { text: x[0], kind: x[1] } : { text: x };
function ghostConvo() {
  const L = GV_LINES[MAPID]; if (!L?.convo) return; const [a, b] = gvPick(L.convo).map(gvLine), side = Math.random() < .5 ? 1 : -1;
  const d1 = ghostSpeak(a.text, { kind: a.kind, rel: side * Math.PI * .55, dist: 1.6, vol: .85 });
  setTimeout(() => { if (!S.paused && !S.ending) ghostSpeak(b.text, { kind: b.kind, rel: -side * Math.PI * .62, dist: 1.4, vol: .9 }); }, (d1 + .5) * 1000);
}
function voiceTick(dt) {
  if (!S.started || S.paused || S.ending || CUT.on || !ac || !GV_LINES[MAPID]) return;
  GV.next -= dt; GV.ghostCd -= dt; GV.hideCd -= dt; const L = GV_LINES[MAPID];
  for (const g of ghosts) {   // ma ở gần mà ngoài tầm nhìn: thì thầm từ đúng hướng của nó
    if (g.floor !== F.id || g.rise === 0) continue; const d = Math.hypot(g.x - player.x, g.y - player.y);
    if (player.hidden && d < 5 && GV.hideCd <= 0 && L.hidden) { const l = gvLine(gvPick(L.hidden)); ghostSpeak(l.text, { kind: l.kind, rel: angTo(player.a, Math.atan2(g.y - player.y, g.x - player.x)), dist: Math.max(.6, d * .4) }); GV.hideCd = 14 + Math.random() * 8; GV.ghostCd = 10; break; }
    if (GV.ghostCd <= 0 && !player.hidden && d > 1.8 && d < 8 && !inView(g.x, g.y)) { const l = gvLine(gvPick(L.near)); ghostSpeak(l.text, { kind: l.kind, rel: angTo(player.a, Math.atan2(g.y - player.y, g.x - player.x)), dist: Math.max(.7, d * .35) }); GV.ghostCd = 15 + Math.random() * 12; break; }
  }
  if (GV.next <= 0) { GV.next = (CHASING ? 30 : 38) + Math.random() * 40; if (Math.random() < .3) ghostConvo(); else { const l = gvLine(gvPick(L.amb)); ghostSpeak(l.text, { kind: l.kind }); } }
}
taskAudioTick = (o => function (dt) { o(dt); voiceTick(dt); })(taskAudioTick);
// Tiếng động sau lưng của bộ điều khiển hù dọa đôi khi đi kèm một câu thì thầm sát gáy
soundBehind = (o => function () { const r = o(); if (r !== false && Math.random() < .55 && GV_LINES[MAPID]) setTimeout(() => { if (!S.paused) { const l = gvLine(gvPick(GV_LINES[MAPID].near)); ghostSpeak(l.text, { kind: l.kind, rel: Math.PI + (Math.random() - .5) * .5, dist: .3 }); } }, 1400); return r; })(soundBehind);
if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } catch (e) {} }
