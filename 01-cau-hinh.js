// =====================================================================
//  ÁM ẢNH KINH HOÀNG — game kinh dị giải đố 3D góc nhìn thứ nhất (WebGL2), nhiều map
//  3 tầng · 4 cấp độ · 2 kết thúc · mọi hình ảnh vẽ bằng code
//
//  Mục lục:  1. CẤU HÌNH (cấp độ, đồ họa)    2. TEXTURE    3. BẢN ĐỒ 3 TẦNG
//            4. ÂM THANH & HIỆU ỨNG         5. CON MA      6. CÂU ĐỐ (ACTIONS)
//            7. ĐIỀU KHIỂN                  8. ĐỒ HỌA      9. VÒNG LẶP
// =====================================================================
const $ = id => document.getElementById(id);

// ===================== 1. CẤU HÌNH =====================
const DIFF = {
  de:   { name: "Dễ",         desc: "5 mạng · ma chậm, xuất hiện muộn · nhiều pin · gợi ý chi tiết", stalk: 0.45, stalkCd: 70, hear: 8, zomb: 0.45, zmax: 3, zstart: 1, cem: 1200, stare: 6, hp: 5, chase: 1.4, wander: .6, range: 5, drain: .35, lit: .15, wake: 5, follow: 30, ghosts: 1, hint: 0, time: 0, bat: 10 },
  tb:   { name: "Trung bình", desc: "3 mạng · ma bám theo khi bạn tiến triển · gợi ý vừa phải",       stalk: 0.7, stalkCd: 45, hear: 11, zomb: 0.65, zmax: 5, zstart: 2, cem: 900, stare: 4, hp: 3, chase: 1.9, wander: .9, range: 7, drain: .6,  lit: .3,  wake: 3, follow: 15, ghosts: 1, hint: 1, time: 0, bat: 8 },
  kho:  { name: "Khó",        desc: "2 mạng · ma nhanh, đi theo bạn lên xuống tầng · gợi ý mơ hồ",     stalk: 0.95, stalkCd: 30, hear: 13, zomb: 0.85, zmax: 7, zstart: 3, cem: 720, stare: 3, hp: 2, chase: 2.3, wander: 1.1, range: 9, drain: .9, lit: .45, wake: 1, follow: 8,  ghosts: 1, hint: 2, time: 0, bat: 6 },
  sieu: { name: "Siêu khó",   desc: "1 mạng · HAI con ma từ đầu · giới hạn 25 phút · không gợi ý",     stalk: 1.2, stalkCd: 18, hear: 15, zomb: 1.05, zmax: 9, zstart: 4, cem: 540, stare: 2.2, hp: 1, chase: 2.6, wander: 1.3, range: 11, drain: 1.2, lit: .6, wake: 0, follow: 4,  ghosts: 2, hint: 3, time: 1500, bat: 5 },
};
const RESO = { nhanh: ["Nhanh", .6], net: ["Nét", 1], ratnet: ["Rất nét", 1], sieu: ["4K", 2] };  // tỉ lệ độ phân giải khung hình
let SCALE = 1;
let D = DIFF.tb;
