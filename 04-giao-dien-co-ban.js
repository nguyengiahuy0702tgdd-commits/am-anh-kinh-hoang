// ===================== GIAO DIỆN =====================
let typing;
function say(text) { if (REMOTE) return; clearInterval(typing); const box = $("msg"); box.textContent = ""; let i = 0; typing = setInterval(() => { box.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typing); }, 18); }
function addItem(key, name, read) { inv.push({ key, name, read }); renderInv(); }
function removeItem(key) { const i = inv.findIndex(x => x.key === key); if (i >= 0) inv.splice(i, 1); renderInv(); }
function renderInv() {
  const ul = $("invList"); ul.innerHTML = inv.length ? "" : '<li style="color:#555">(trống)</li>';
  inv.forEach(it => { const li = document.createElement("li"); li.textContent = "• " + it.name; if (it.read) { li.className = "read"; li.onclick = it.read; } ul.appendChild(li); });
}
function progress() { S.progress++; if (!S.woke && S.progress >= D.wake) wakeGhosts(); }
let GOALS = [
  [() => has("bathkey") || S.bathOpen, "Phòng tắm trên lầu bị khóa. Hộp trang sức trong phòng bố mẹ (lầu 1) cần mã 3 số: đếm số người trong 3 bức tranh ở phòng chơi.", "Tìm chìa khóa phòng tắm trên lầu."],
  [() => S.bathOpen, "Mở cửa phòng tắm ở hành lang lầu 1.", "Mở phòng tắm."],
  [() => has("basekey") || S.baseOpen, "Lục soát bồn tắm trong phòng tắm.", "Tìm chìa khóa tầng hầm."],
  [() => S.baseOpen, "Mở cửa tầng hầm trong phòng kho ở tầng 1.", "Mở cửa tầng hầm."],
  [() => has("crowbar") || has("fuse") || S.power, "Lấy xà beng trên giá dụng cụ ở nhà xe (tầng 1).", "Tìm dụng cụ để cạy thùng gỗ."],
  [() => has("fuse") || S.power, "Cạy thùng gỗ trong kho tầng hầm.", "Tìm cầu chì."],
  [() => S.power, "Lắp cầu chì vào hộp điện ở phòng nồi hơi (tầng hầm).", "Khôi phục nguồn điện."],
  [() => has("smallkey") || S.diary, "Tìm chìa khóa nhỏ trên kệ sách ở thư viện (lầu 1).", "Tìm chìa khóa nhỏ."],
  [() => S.diary, "Mở ngăn kéo bàn học trong thư viện và đọc nhật ký.", "Tìm nhật ký của Linh."],
  [() => S.mirrorDone, "Xem đồng hồ quả lắc ở phòng ăn (tầng 1), rồi soi gương trong phòng tắm (lầu 1).", "Giải mã lời nhắn trong nhật ký."],
  [() => false, "Nhập mã 4 số vào cửa chính ở sảnh. (Muốn kết thúc tốt: đặt búp bê của Linh lên bàn thờ dưới hầm trước.)", "Thoát khỏi căn nhà."],
];
function goalText() {
  if (D.hint === 3) return ""; if (D.hint === 2) return MD.hard;
  const g = GOALS.find(s => !s[0]()); let txt = g[D.hint === 0 ? 1 : 2]; if (typeof txt === "function") txt = txt(); return "Mục tiêu: " + txt;
}
function showNote(html, after) {
  if (REMOTE) { if (typeof after === "function") after(); return; }
  S.paused = true; document.exitPointerLock?.(); const n = $("note"); n.innerHTML = html + "<small>(nhấp hoặc bấm E để đóng)</small>"; n.classList.remove("hidden");
  n.onclick = () => { n.classList.add("hidden"); S.paused = false; if (typeof after === "function") after(); };
}
const DIARY = () => `<b>Nhật ký của Linh — ngày 13</b><br>Nó lại đến đúng giờ ấy. Chiếc đồng hồ quả lắc ở phòng ăn cũng chết từ lúc đó.<br>
Mẹ dặn: trong căn nhà này, muốn thấy sự thật thì phải nhìn qua <b>gương</b>.<br>Mã cửa chính là giờ <b>thật</b> nó xuất hiện — 4 số, giờ trước phút sau.<br><br>
Con nhớ bé Bông quá. Ai đó đã mang di ảnh của con xuống hầm...`;
const noteOpen = () => !$("note").classList.contains("hidden"), padOpen = () => !$("pad").classList.contains("hidden");
