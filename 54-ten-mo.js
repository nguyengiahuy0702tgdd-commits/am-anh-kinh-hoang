// =====================================================================
//  54. TÊN TRÊN BIA MỘ (Nghĩa Trang)
//  Nhìn vào ngôi mộ nào cũng thấy tên người nằm dưới đó + năm sinh/mất.
//  Mỗi ngôi mộ một tên riêng, không trùng nhau. Bấm E để đọc bia (kèm câu khắc).
//  Tên được sinh theo hạt giống cố định → hai người chơi online thấy giống nhau.
// =====================================================================
const GRAVE_SUR = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Mai", "Trịnh", "Lương", "Tạ", "Châu", "Lâm", "Quách", "Cao", "Tô", "La", "Kiều"];
const GRAVE_MID = { m: ["Văn", "Hữu", "Đức", "Minh", "Quang", "Công", "Thành", "Bá"], f: ["Thị", "Ngọc", "Thu", "Kim", "Mỹ", "Bích", "Thanh", "Diệu"] };
const GRAVE_GIV = {
  m: ["Tư", "Sáu", "Hùng", "Dũng", "Phúc", "Lộc", "Tài", "Bảy", "Hải", "Long", "Sơn", "Tâm", "Nghĩa", "Hòa", "Thắng", "Toàn", "Quý", "Trung", "Khang", "Lợi", "Bình", "Cường", "Đạt", "Tín", "Khải", "Nhân", "Vinh", "Thọ"],
  f: ["Hoa", "Mai", "Cúc", "Hồng", "Hạnh", "Loan", "Nga", "Thủy", "Yến", "Phượng", "Tuyết", "Sen", "Liên", "Vân", "Hằng", "Diệp", "Nhung", "Xuân", "Oanh", "Trinh", "Huệ", "Đào", "Lụa", "Gấm"],
};
const GRAVE_EPI = ["Con cháu muôn đời ghi nhớ.", "Yên nghỉ nơi đất mẹ.", "Mẹ ơi, con nhớ mẹ.", "Đi xa không hẹn ngày về.", "Một đời lam lũ, nay được nghỉ ngơi.", "Hương hồn phù hộ cho con cháu.", "Ra đi khi tuổi còn xanh.",
  "Chết trong trận lụt năm ấy.", "Không ai đến thắp nhang.", "Đừng đánh thức tôi.", "Vẫn chờ người trở về.", "Mộ được dời về từ bãi sông cũ.", "Ngày giỗ: rằm tháng Bảy.", "Nét chữ đã mờ, chỉ còn đọc được tên."];

function nameGraves(f) {
  let sd = 1979; const rnd2 = () => { sd = (sd * 1103515245 + 12345) >>> 0; return (sd >>> 8) / 16777216; }, pick = a => a[Math.floor(rnd2() * a.length)];
  const used = new Set(); for (const s of f.sprites) if (s.name) used.add(s.name.split("|")[0]);
  const ban = /(^| )(Lan|Lành|Gia Huy)$/;                                     // tránh nhầm với mộ cô Lan trong câu đố
  const make = () => {
    for (let k = 0; k < 60; k++) {
      const g = rnd2() < .5 ? "m" : "f", child = rnd2() < .1;
      const nm = child ? `Bé ${pick(GRAVE_GIV[g])}` : `${pick(GRAVE_SUR)} ${pick(GRAVE_MID[g])} ${pick(GRAVE_GIV[g])}`;
      if (used.has(nm) || ban.test(nm)) continue; used.add(nm);
      const b = 1885 + Math.floor(rnd2() * 95), age = child ? 2 + Math.floor(rnd2() * 9) : 16 + Math.floor(rnd2() * 70), d = Math.min(1999, b + age);
      return `${nm}|${b} – ${d}`;
    }
    return `Vô danh ${used.size}|? – ?`;
  };
  for (const s of f.sprites) {
    if (s.k !== "tomb" && s.k !== "cross" && s.act !== "grave") continue;
    if (!s.act) Object.assign(s, { act: "tomb", reach: 1.8, name: make() });
    if (!s.name) continue;
    if (s.act === "tomb" && s.epi == null) s.epi = pick(GRAVE_EPI);
    const [nm, yr] = s.name.split("|");
    s.label = (s.act === "grave" ? "Mộ dưới gốc liễu: " : "Mộ: ") + nm + (yr ? ` (${yr})` : "");
  }
}
buildCemetery = (o => function (...a) { const f = o.apply(this, a); try { nameGraves(f); } catch (e) {} return f; })(buildCemetery);
CEMETERY.build = buildCemetery;
CEMETERY.SPRITE_ACTS.tomb = s => say(`Bia mộ: ${s.name.replace("|", " · ")}${s.epi ? ` — “${s.epi}”` : ""}`);
