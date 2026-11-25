// =====================================================================
//  16. HOẠT ẢNH NHÂN VẬT — khớp xoay (vai, hông, cổ) + chu kỳ bước đi
// =====================================================================
// XL: xoay một bộ phận quanh khớp (px,py,pz): ax = gập trước/sau, az = nghiêng sang bên
function XL(X, px, py, pz, ax, az = 0) {
  const ca = Math.cos(ax), sa = Math.sin(ax), cz = Math.cos(az), sz = Math.sin(az);
  const rot = (x, y, z) => { const y1 = y * ca - z * sa, z1 = y * sa + z * ca; return [x * cz - y1 * sz, x * sz + y1 * cz, z1]; };
  return { p: (x, y, z) => { const r = rot(x - px, y - py, z - pz); return X.p(r[0] + px, r[1] + py, r[2] + pz); }, n: (x, y, z) => { const r = rot(x, y, z); return X.n(r[0], r[1], r[2]); } };
}
function gait(g) {   // tốc độ & pha bước chân suy ra từ quãng đường di chuyển
  const dx = g.x - (g._ax ?? g.x), dy = g.y - (g._ay ?? g.y), step = Math.hypot(dx, dy); g._ax = g.x; g._ay = g.y;
  g.spd = (g.spd || 0) * .85 + Math.min(step * 60, 4) * .15; g.ph = (g.ph || 0) + step * 6.5; return g.spd;
}
function twitch(g, every = 2.5) {   // giật đầu bất chợt
  if (!g.twN || t > g.twN) { g.twN = t + every * (.4 + Math.random()); g.twT = t + .12; g.twA = (Math.random() - .5) * 1.1; }
  return t < g.twT ? g.twA : g.twA * .35;
}
const faceDir = g => facing(g.face ?? Math.atan2(player.y - g.y, player.x - g.x));

// Bé gái (Căn Nhà): lơ lửng, đầu nghiêng giật cục, tay vươn ra khi đuổi

// Ma Rừng: bước đi chậm, tay dài đung đưa; bị nhìn thì đứng sững và nghiêng đầu từ từ

// Nữ Bá Tước: lướt đi, váy đung đưa, tay vươn ra khi săn mồi, đầu nghiêng lắng nghe

// Xác sống: lê bước, một chân kéo lê, đầu ngoẹo, tay giơ ra phía trước

// Gã Đồ Tể: bước nặng nề; khi đuổi thì giơ cao dao phay và chém liên hồi

// Jumpscare 3D: đặt chính con ma sát mặt bạn
const FACE_H = { house: .98, forest: 2.08, castle: 1.66, cemetery: 1.6, factory: 1.88 };
let scareUntil = 0;

function scareModel(v, eye) {
  const k = Math.max(0, Math.min(1, (scareUntil - t) / .8)), dist = .5 + k * .3, a = player.a;
  const g = { x: player.x + Math.cos(a) * dist, y: player.y + Math.sin(a) * dist, yo: eye[1] - FACE_H[MAPID] + (Math.random() - .5) * .03, scare: 1, rise: 1, face: a + Math.PI, state: "chase", hunt: 1e9, stare: 0, twA: (Math.random() - .5), twT: 1e9, twN: 1e9 };
  MD.model(v, g);
}
// Đồ treo đung đưa / xoay chậm (hình nhân rơm, búp bê treo, móc thịt, xích, đèn chùm)
const SWAY_K = new Set(["effigy", "meat", "chains", "chandelier"]);
const isSway = s => SWAY_K.has(s.k) || s.t === T.hangDoll;
function swayMeshes(v) {
  for (const s of F.sprites) if (!s.taken && isSway(s) && Math.abs(s.x - player.x) + Math.abs(s.y - player.y) < 22) {
    const sd = s.x * 3.1 + s.y * 1.7, ox = s.x, oy = s.y, orot = s.rot;
    s.x += Math.sin(t * .8 + sd) * .025; s.y += Math.cos(t * .63 + sd) * .025; s.rot = (orot ?? -Math.PI / 2) + Math.sin(t * .35 + sd) * .6;
    furniture(v, s); s.x = ox; s.y = oy; s.rot = orot;
  }
}
