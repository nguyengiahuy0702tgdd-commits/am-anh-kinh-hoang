// ===================== 6. CÂU ĐỐ (ACTIONS) =====================
let NAMES = { U: "Cầu thang lên lầu", N: "Cầu thang xuống tầng 1", u: "Cầu thang lên tầng 1", n: "Cầu thang xuống tầng hầm", Q: "Cửa tầng hầm", L: "Cửa phòng tắm", X: "Cửa chính",
  C: "Đồng hồ quả lắc", P: "Ảnh gia đình", H: "Lò sưởi", V: "Chiếc TV cũ", W: "Tủ quần áo (trốn)", G: "Giá dụng cụ", K: "Tủ bếp", F: "Tủ lạnh", b: "Kệ hũ dưa", B: "Kệ sách", D: "Bàn học",
  M: "Tấm gương", T: "Bồn tắm", Y: "Hộp nhạc", 7: "Tranh vẽ số 1", 8: "Tranh vẽ số 2", 9: "Tranh vẽ số 3", J: "Hộp trang sức", Z: "Hộp điện", O: "Nồi hơi", R: "Thùng gỗ", A: "Bàn thờ",
  1: "Chữ viết bằng máu", 2: "Chữ viết bằng máu", 3: "Chữ viết bằng máu", 4: "Chữ viết bằng máu", 5: "Chữ viết bằng máu" };

function drawingAct(i) { say(`Tranh vẽ bằng bút sáp, góc ghi "Tranh ${i}". Bé Linh vẽ những người bạn của mình nắm tay nhau.` + (D.hint === 0 ? ` Bạn đếm được ${S.counts[i - 1]} người.` : "")); }
let ACTIONS = {
  U: () => travel("t2", 20, 2.6, Math.PI / 2), N: () => travel("t1", 18, 2.6, Math.PI / 2), n: () => travel("b1", 15, 2.6, Math.PI / 2), u: () => travel("t1", 25.5, 2.6, Math.PI / 2),
  Q(c) {
    if (!has("basekey")) return say("Cửa tầng hầm bị xích và khóa bằng ổ khóa sắt. Từ khe cửa vọng lên tiếng gõ... cộc... cộc... cộc...");
    F.grid[c.y][c.x] = "n"; S.baseOpen = true; removeItem("basekey"); refreshWalls(); noise(.6, 300, .5); say("Ổ khóa rơi xuống sàn. Một luồng hơi lạnh và mùi ẩm mốc bốc lên từ bóng tối bên dưới.");
  },
  L(c) {
    if (!has("bathkey")) return say("Cửa phòng tắm bị khóa. Có những vết cào sâu trên mặt gỗ... từ phía bên trong.");
    F.grid[c.y][c.x] = "."; S.bathOpen = true; refreshWalls(); removeItem("bathkey"); noise(.3, 900, .3); say("Cạch. Cánh cửa phòng tắm kẽo kẹt mở ra. Có tiếng nước nhỏ giọt... tách... tách...");
  },
  X() {
    if (!S.power) return say("Bàn phím số tối om. Cửa chính dùng khóa điện... phải khôi phục nguồn điện trước đã.");
    openLock("CỬA CHÍNH", 4, S.code4, win);
  },
  C() { say(`Chiếc đồng hồ quả lắc đã chết. Mặt kính nứt. Kim dừng ở ${S.ch} giờ ${S.cm} phút.`); },
  P() { say("Ảnh gia đình: bố, mẹ, và một bé gái mặc váy đỏ. Khuôn mặt bé gái bị ai đó cào nát bằng móng tay."); },
  H() {
    if (!S.burnt) { S.burnt = true; addItem("photo", "Ảnh cháy dở", () => say("Bé Linh ôm con búp bê thắt nơ đỏ. Mặt sau: 'Linh và bé Bông — con không bao giờ rời nó.'")); }
    say("Trong đống tro có một bức ảnh cháy dở: bé gái ôm con búp bê thắt nơ đỏ. Mặt sau ghi: 'Linh và bé Bông — con không bao giờ rời nó.'");
  },
  V() {
    if (!S.power) return say("Chiếc TV cũ, màn hình phủ bụi. Không có điện.");
    if (!S.tvSeen) { S.tvSeen = true; return jumpScare(() => say("Màn hình nhiễu hạt... rồi hiện lên dòng chữ: MẸ ƠI, CON LẠNH LẮM.")); }
    say("Màn hình vẫn nhiễu. Thỉnh thoảng có một khuôn mặt thoáng qua trong lớp nhiễu.");
  },
  W() { hide(); },
  G() {
    if (has("crowbar") || S.crate) return say("Giá dụng cụ gỉ sét. Chỗ treo xà beng giờ trống trơn.");
    addItem("crowbar", "Xà beng"); progress(); say("Bạn gỡ chiếc xà beng gỉ sét khỏi giá. Nặng tay, nhưng chắc chắn.");
  },
  K() { say("Bát đĩa vỡ, một con chuột chết khô. Trên cánh tủ có dấu tay nhỏ xíu."); },
  F() { flicker(); noise(.4, 200, .4); say("Bên trong bốc mùi hôi thối kinh khủng. Bạn đóng sập lại ngay."); },
  b() { say("Những hũ dưa muối mốc đen. Trong một hũ có thứ gì đó... trông giống ngón tay."); },
  B() {
    if (has("smallkey") || S.diary) return say("Những cuốn sách mục nát. Đầu con búp bê trên kệ... vừa quay sang phía bạn?");
    addItem("smallkey", "Chìa khóa nhỏ"); progress(); say("Một cuốn sách đỏ lồi ra. Bạn kéo nó... một chiếc chìa khóa nhỏ rơi xuống sàn.");
  },
  D() {
    if (S.diary) return showNote(DIARY());
    if (!has("smallkey")) return say("Ngăn kéo bàn học bị khóa. Có một lỗ khóa rất nhỏ.");
    S.diary = true; removeItem("smallkey"); addItem("diary", "Nhật ký của Linh", () => showNote(DIARY())); progress();
    say("Chìa khóa vừa khít. Trong ngăn kéo là cuốn nhật ký bìa hồng..."); setTimeout(() => showNote(DIARY()), 600);
  },
  M() {
    if (!S.diary) return say("Tấm gương nứt vỡ. Bạn thấy bóng mình... và một khuôn mặt mờ nhạt sau vai.");
    if (!S.mirrorDone) { S.mirrorDone = true; return jumpScare(() => say("...Nó vừa đứng ngay sau lưng bạn trong gương. Khi bình tĩnh lại, bạn để ý chiếc đồng hồ phản chiếu trong gương.")); }
    say("Trong gương, mọi thứ đều bị lật ngược. Kể cả chiếc đồng hồ.");
  },
  T() {
    if (has("basekey") || S.baseOpen) return say("Nước đỏ vẫn gợn sóng dù không có gì chạm vào.");
    jumpScare(() => { addItem("basekey", "Chìa khóa tầng hầm"); progress(); say("Một bàn tay trắng bệch vừa trồi lên rồi biến mất! Run rẩy, bạn thò tay xuống thứ nước đặc quánh... và chạm phải một chiếc chìa khóa. Thẻ treo ghi: TẦNG HẦM."); });
  },
  Y() { musicBox(); say("Hộp nhạc tự quay. Một giai điệu ru ngủ cũ kỹ vang lên... rồi một giọng trẻ con hát theo, từ ngay sau lưng bạn."); },
  7: () => drawingAct(1), 8: () => drawingAct(2), 9: () => drawingAct(3),
  J() {
    if (has("bathkey") || S.bathOpen) return say("Hộp trang sức trống rỗng.");
    say("Hộp trang sức khóa bằng mã 3 số. Nắp hộp khắc: \"Những người bạn của Linh — tranh 1, 2, 3\".");
    openLock("HỘP TRANG SỨC", 3, S.code3, () => { addItem("bathkey", "Chìa khóa phòng tắm"); progress(); say("Tách! Nắp hộp bật mở. Bên trong là chiếc chìa khóa có buộc nơ: PHÒNG TẮM."); });
  },
  Z() {
    if (S.power) return say("Hộp điện kêu rè rè.");
    if (!has("fuse")) return say("Hộp điện thiếu một cầu chì. Ô trống vẫn còn vết cháy xém.");
    S.power = true; removeItem("fuse"); progress(); refreshWalls(); noise(.4, 80, .8, .5); tone(50, 0, 3, .05, "sawtooth");
    flicker(1.5); say("Bạn đẩy cầu chì vào và gạt cầu dao. ĐOÀNG! Đèn trong nhà chập chờn sáng lên... Ở tầng trên, có tiếng TV tự bật."); if (!S.woke) wakeGhosts();
  },
  O() { noise(.8, 300, .2); say("Nồi hơi gỉ sét. Bên trong vọng ra tiếng cào... như móng tay trên kim loại."); },
  R() {
    if (S.crate) return say("Thùng gỗ trống rỗng.");
    if (!has("crowbar")) return say("Thùng gỗ đóng đinh chặt. Cần thứ gì đó để cạy.");
    S.crate = true; removeItem("crowbar"); addItem("fuse", "Cầu chì"); progress(); refreshWalls(); noise(.5, 600, .5);
    say("Bạn cạy tung nắp thùng. Bên trong, giữa đống rơm mục, có một chiếc cầu chì cũ.");
  },
  A() {
    if (S.altar) return say("Bé Bông đã về bên Linh. Ngọn nến trên bàn thờ cháy đều, không còn lập lòe nữa.");
    if (!has("doll")) return say("Bàn thờ với di ảnh bé Linh. Có một chỗ trống bên cạnh... như thiếu thứ gì đó cô bé yêu quý.");
    S.altar = true; removeItem("doll"); refreshWalls(); tone(523, 0, 1.2, .05); tone(659, .3, 1.2, .05); tone(784, .6, 1.6, .05);
    say("Bạn đặt bé Bông cạnh di ảnh. Một giọng trẻ con thì thầm: \"Cảm ơn anh...\" Không khí bỗng bớt lạnh hơn.");
  },
  1() { say("Ai đó đã viết lên tường bằng máu... bằng ngón tay của một đứa trẻ."); }, 2() { flicker(); say("Máu vẫn còn ướt."); },
  3() { noise(1, 400, .15, .5); say("Bạn nghe thấy tiếng thở ngay sau gáy."); }, 4() { say("Nét chữ run rẩy, như được viết trong đêm."); }, 5() { giggle(); say("Có tiếng cười khúc khích sau lưng bạn."); },
};
let SPRITE_ACTS = {
  doll(s) {
    s.taken = true; buildFloorMesh(F); addItem("doll", "Búp bê bé Bông"); progress(); flicker(1.5); noise(1.5, 500, .3, .5);
    for (const g of ghosts) g.mul *= 1.1;
    say("Bạn nhặt con búp bê thắt nơ đỏ. Mọi bóng đèn chớp tắt. Một giọng the thé rít lên: \"TRẢ LẠI ĐÂY!\"");
  },
};
let SPRITE_NAMES = { doll: "Búp bê thắt nơ đỏ" };
function hide() { player.hidden = !player.hidden; noise(.25, 400, .3); say(player.hidden ? "Bạn chui vào tủ và nín thở. Nó sẽ không thấy bạn ở đây... hy vọng vậy. (Bấm E để ra)" : "Bạn rón rén bước ra khỏi tủ."); }
function win() {
  if (!exitReady()) return;
  S.paused = true; S.ending = true; document.exitPointerLock?.(); const s = Math.round((Date.now() - S.started) / 1000);
  say("Cạch. Cánh cửa chính từ từ mở ra...");
  setTimeout(() => {
    $("winTitle").textContent = S.altar ? "KẾT THÚC TỐT" : "KẾT THÚC XẤU"; bloodify($("winTitle"));
    $("winText").innerHTML = `Cấp độ: ${D.name} · Thời gian: ${Math.floor(s / 60)} phút ${s % 60} giây<br><br>` + (S.altar
      ? `Bạn bước ra ngoài. Phía sau, một giọng trẻ con thì thầm: <i>"Cảm ơn anh đã mang bé Bông về cho em..."</i><br>Căn nhà chìm vào im lặng. Lần đầu tiên sau nhiều năm.`
      : `Bạn bước ra ngoài. Nhưng một giọng trẻ con thì thầm sau lưng: <i>"Anh quên dắt em theo rồi..."</i><br><br><small>Còn một kết thúc khác. Bé Linh vẫn đang tìm một thứ...</small>`);
    playEnding(() => $("win").classList.remove("hidden"));
  }, 1600);
}

// Khóa số dùng chung
let padInput = "", lock = null;
function openLock(title, len, code, ok) { if (REMOTE) { REMOTE_LOCK = { ok }; return; } lock = { len, code, ok }; padInput = ""; $("padTitle").textContent = title; updatePad(); $("pad").classList.remove("hidden"); S.paused = true; document.exitPointerLock?.(); }
function updatePad() { $("padDisplay").textContent = padInput.padEnd(lock.len, "_"); }
function padPress(k) {
  if (k === "Xóa") padInput = padInput.slice(0, -1);
  else if (k === "OK") return checkCode();
  else if (k === "Thoát") { $("pad").classList.add("hidden"); S.paused = false; return; }
  else if (padInput.length < lock.len) padInput += k;
  updatePad();
}
["1","2","3","4","5","6","7","8","9","Xóa","0","OK","Thoát"].forEach(k => { const b = document.createElement("button"); b.textContent = k; if (k === "Thoát") b.style.gridColumn = "1 / 4"; b.onclick = () => padPress(k); $("padKeys").appendChild(b); });
function checkCode() {
  if (padInput === lock.code) { $("pad").classList.add("hidden"); S.paused = false; noise(.15, 1500, .3); lock.ok(); netSend({ t: "lockok" }); return; }
  S.wrong++; padInput = ""; updatePad(); noise(.2, 300, .3);
  if (D.hint > 0 && S.wrong % 3 === 0) { $("pad").classList.add("hidden"); jumpScare(() => say("Đừng đoán bừa nữa. Nó không thích bị chọc giận.")); }
  else say(S.wrong % 2 ? "Sai mã. Đèn đỏ nháy nhanh hơn." : "Sai. Có tiếng cười khúc khích sau lưng bạn.");
}
