// =====================================================================
//  64. SÚNG KIM GÂY MÊ 3D TRÊN TAY (thay cho hình vẽ phẳng)
//  Dựng bằng chính engine 3D của game → được đèn pin / đèn phòng chiếu sáng thật,
//  lắc theo bước chân, giật khi bắn, có chớp lửa đầu nòng, bàn tay + tay áo cầm súng.
// =====================================================================
const WVM = { kick: -9, draw: -9, last: "", c: { k: .6, x: .21, y: -.2, z: .52, yaw: -.08, pitch: .04, roll: -.06 } };
W_SVG.gun = "";                                   // bỏ hình SVG cũ của súng (gậy vẫn giữ)
wAnim = (o => function (k) { if (k === "shoot") WVM.kick = t; if (k === "draw") WVM.draw = t; return o(k); })(wAnim);

buildPeopleTextures = (o => function () {
  o();
  const n = (g, c, a, k = 900) => { for (let i = 0; i < k; i++) R(g, rnd() * 128, rnd() * 128, 1, 1, `rgba(${c},${a * rnd()})`); };
  // thép đen nhám (phủ phosphate), viền mòn sáng nhẹ
  T.gunSteel = tex(g => { R(g, 0, 0, 128, 128, "#3a3e45"); n(g, "0,0,0", .45, 1400); n(g, "150,156,166", .2, 700); for (let i = 0; i < 10; i++) R(g, rnd() * 128, rnd() * 128, 6 + rnd() * 20, 1, "rgba(150,156,166,.18)"); });
  T.gunSlide = tex(g => { R(g, 0, 0, 128, 128, "#454a52"); n(g, "0,0,0", .4, 1200); n(g, "170,176,186", .18, 600); R(g, 0, 0, 128, 3, "rgba(170,176,186,.35)"); R(g, 0, 125, 128, 3, "rgba(0,0,0,.5)"); for (let i = 0; i < 6; i++) R(g, rnd() * 128, rnd() * 128, 4 + rnd() * 14, 1, "rgba(170,176,186,.22)"); });
  // nhựa báng súng có vân nhám
  T.gunGrip = tex(g => { R(g, 0, 0, 128, 128, "#26292d"); for (let y = 0; y < 128; y += 4) for (let x = (y / 4) % 2 * 2; x < 128; x += 4) { R(g, x, y, 2, 2, "#3c4046"); R(g, x + 1, y + 1, 1, 1, "#0b0c0d"); } n(g, "0,0,0", .3, 500); });
  // nhôm xước của ống CO2
  T.gunAlu = tex(g => { R(g, 0, 0, 128, 128, "#7d838c"); for (let y = 0; y < 128; y++) R(g, 0, y, 128, 1, `rgba(${rnd() < .5 ? "255,255,255" : "0,0,0"},${.05 + rnd() * .09})`); n(g, "0,0,0", .3, 300); });
  T.gunDart = tex(g => { R(g, 0, 0, 128, 128, "#d8dadc"); R(g, 0, 0, 128, 18, "#e85a2a"); n(g, "0,0,0", .15, 200); });
  T.gunTuft = tex(g => { R(g, 0, 0, 128, 128, "#ff6a2a"); for (let i = 0; i < 60; i++) R(g, rnd() * 128, 0, 1, 128, "rgba(255,200,120,.5)"); });
  T.gunDot = tex(g => R(g, 0, 0, 128, 128, "#58ff7c"), g => R(g, 0, 0, 128, 128, "#58ff7c"));
  T.gunFlash = tex(g => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, "#fffbe8"); r.addColorStop(.5, "#ffc060"); r.addColorStop(1, "#ff6010"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }, g => { g.fillStyle = "#ffd890"; g.fillRect(0, 0, 128, 128); });
  T.gunSkin = tex(g => { R(g, 0, 0, 128, 128, "#c99478"); n(g, "90,40,20", .25, 900); n(g, "240,200,170", .12, 400); for (let i = 0; i < 6; i++) R(g, rnd() * 128, rnd() * 128, 8 + rnd() * 10, 1, "rgba(80,40,25,.35)"); stain(g, 90, 40, 6, "rgba(70,15,8,.5)"); });
  T.gunSleeve = tex(g => { R(g, 0, 0, 128, 128, "#2e2a24"); for (let y = 0; y < 128; y += 3) R(g, 0, y, 128, 1, "rgba(0,0,0,.25)"); n(g, "90,80,66", .25, 900); });
})(buildPeopleTextures);

// khung tọa độ gắn với camera: x phải, y lên, z trước (đơn vị mét, đã thu nhỏ k để không chọc vào tường)
function camFrame(eye, fw, k, ox, oy, oz, yaw, pitch, roll) {
  const up0 = [0, 1, 0];
  let Rt = [fw[1] * up0[2] - fw[2] * up0[1], fw[2] * up0[0] - fw[0] * up0[2], fw[0] * up0[1] - fw[1] * up0[0]];
  const rl = Math.hypot(...Rt) || 1; Rt = Rt.map(q => q / rl);                     // phải
  const Up = [Rt[1] * fw[2] - Rt[2] * fw[1], Rt[2] * fw[0] - Rt[0] * fw[2], Rt[0] * fw[1] - Rt[1] * fw[0]];
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  const rot = (x, y, z) => { let X = x * cr - y * sr, Y = x * sr + y * cr, Z = z;              // lăn
    const Y2 = Y * cp + Z * sp, Z2 = -Y * sp + Z * cp; Y = Y2; Z = Z2;                            // ngẩng
    const X2 = X * cy + Z * sy, Z3 = -X * sy + Z * cy; return [X2, Y, Z3]; };                     // quay ngang
  const W = (x, y, z) => [Rt[0] * x + Up[0] * y + fw[0] * z, Rt[1] * x + Up[1] * y + fw[1] * z, Rt[2] * x + Up[2] * y + fw[2] * z];
  return { p: (x, y, z) => { const r = rot(x, y, z), w = W(r[0] + ox, r[1] + oy, r[2] + oz); return [eye[0] + w[0] * k, eye[1] + w[1] * k, eye[2] + w[2] * k]; },
    n: (x, y, z) => W(...rot(x, y, z)) };
}
const cylZ = (v, X, x, y, z0, z1, r0, r1, seg, m, cap) => pcyl(v, XL(X, 0, 0, 0, Math.PI / 2), x, -y, z0, z1, r0, r1, seg, m, cap);

function gunModel(v, X, fire) {
  const S_ = T.gunSlide, M = T.gunSteel;
  // thân trượt (slide) + rãnh kéo
  pbox(v, X, -.0145, .004, -.085, .0145, .036, .128, { all: S_, f: M, k: M });
  pbox(v, X, -.0125, .036, -.08, .0125, .039, .12, M);                                     // gờ trên
  for (let i = 0; i < 7; i++) { const z = -.078 + i * .0075; pbox(v, X, -.0152, .009, z, .0152, .032, z + .003, M); }
  // cửa sổ buồng kim (bên phải) + kim gây mê lộ ra
  pbox(v, X, .0146, .012, .012, .0156, .03, .07, T.dark);
  cylZ(v, X, .0152, .021, .016, .058, .0045, .0045, 8, T.gunDart, T.gunDart);
  cylZ(v, X, .0152, .021, .058, .068, .0055, .002, 8, T.gunTuft, T.gunTuft);
  // thước ngắm sau (2 cột) và đầu ngắm trước, có chấm dạ quang
  for (const sx of [-1, 1]) pbox(v, X, sx * .0035, .039, -.078, sx * .0105, .047, -.07, M);
  psphere(v, X, -.0065, .044, -.069, .0013, 4, T.gunDot); psphere(v, X, .0065, .044, -.069, .0013, 4, T.gunDot);
  pbox(v, X, -.0022, .039, .112, .0022, .049, .122, M); psphere(v, X, 0, .0465, .1105, .0014, 4, T.gunDot);
  // nòng dài + đầu nòng
  cylZ(v, X, 0, .02, .128, .205, .0095, .0095, 14, M, M);
  cylZ(v, X, 0, .02, .198, .212, .0115, .0115, 14, M, T.dark);
  cylZ(v, X, 0, .02, .2115, .2125, .0055, .0055, 10, T.dark, T.dark);
  // ống CO2 dưới nòng
  cylZ(v, X, 0, -.009, -.03, .17, .0105, .0105, 14, T.gunAlu, M);
  cylZ(v, X, 0, -.009, .17, .182, .0105, .007, 14, M, T.dark);
  // khung dưới, vòng cò, cò
  pbox(v, X, -.0135, -.022, -.07, .0135, .004, .05, M);
  pbox(v, X, -.004, -.052, -.034, .004, -.047, .03, M);
  pbox(v, X, -.004, -.052, .025, .004, -.022, .03, M);
  pbox(v, XL(X, 0, -.03, -.01, -.35), -.0028, -.046, -.014, .0028, -.022, -.008, T.gunAlu);
  // báng nghiêng ra sau, vân nhám
  const G = XL(X, 0, -.022, -.045, -.28);
  pbox(v, G, -.0155, -.125, -.078, .0155, -.02, -.03, { all: T.gunGrip, t: M, bt: M });
  pbox(v, G, -.0165, -.128, -.08, .0165, -.12, -.028, M);
  // ốc vít, bóng sáng viền
  for (const z of [-.05, .02]) psphere(v, X, .0146, -.008, z, .0022, 4, T.gunAlu);
  // chớp lửa đầu nòng
  if (fire > 0) { const r = .022 + fire * .03; psphere(v, X, 0, .02, .225 + fire * .02, r, 6, T.gunFlash, .7); }
}
function handModel(v, X) {
  const sk = T.gunSkin, G = XL(X, 0, -.022, -.045, -.28);
  // mu bàn tay + lòng bàn tay ôm báng
  pbox(v, G, .0155, -.118, -.098, .03, -.028, -.034, sk);
  psphere(v, G, -.019, -.088, -.072, .014, 8, sk, 2.3);
  psphere(v, G, .022, -.07, -.1, .021, 8, sk, 1.9);
  // 3 ngón quấn phía trước báng
  for (let i = 0; i < 3; i++) { const y = -.06 - i * .021; pcylX(v, G, y, -.025, -.024, .028, .0092, 10, sk, sk); psphere(v, G, -.024, y, -.025, .0092, 6, sk); }
  // ngón trỏ duỗi trên vòng cò
  cylZ(v, X, .016, -.03, -.04, .026, .0085, .0075, 10, sk, sk); psphere(v, X, .016, -.03, .027, .0076, 6, sk);
  // ngón cái dọc thân bên trái
  cylZ(v, X, -.019, -.008, -.07, -.005, .0095, .008, 10, sk, sk); psphere(v, X, -.019, -.008, -.004, .0081, 6, sk);
  // cổ tay + tay áo (kéo về góc dưới phải)
  const Wr = XL(XL(X, .03, -.125, -.1, .95), .03, -.125, -.1, 0, -.35);
  pcyl(v, Wr, .03, -.1, -.33, -.115, .034, .024, 12, sk, sk);
  pcyl(v, Wr, .03, -.1, -.7, -.2, .052, .044, 14, T.gunSleeve, T.gunSleeve);
  pcyl(v, Wr, .03, -.1, -.21, -.19, .046, .046, 14, T.gunSleeve, T.gunSleeve);
}
function gunView(v) {
  const u = WPN.ui; if (!u || u.cur !== "gun" || !S.started || player !== P1 || P1.dead) return;
  const p = P1.pitch, a = P1.a, fw = [Math.cos(p) * Math.cos(a), Math.sin(p), Math.cos(p) * Math.sin(a)];
  const eye = [P1.x, EYE + Math.sin(P1.bob) * .025 - (P1.hidden ? .05 : 0) + eyeOff(P1) + (P1.climb || 0) + CAM4D.ey, P1.y];
  const kt = t - WVM.kick, dt0 = t - WVM.draw;
  const rec = kt < .28 ? Math.sin(Math.min(1, kt / .28) * Math.PI) * (1 - kt / .28 * .5) : 0;          // giật
  const draw = dt0 < .35 ? (1 - dt0 / .35) : 0;                                                        // rút súng
  const bx = Math.sin(P1.bob * .5) * .006, by = -Math.abs(Math.cos(P1.bob * .5)) * .005 + Math.sin(t * 1.7) * .0012;
  const C = WVM.c, X = camFrame(eye, fw, C.k, C.x + bx, C.y + by - draw * .12, C.z - rec * .03, C.yaw, C.pitch + rec * .22 - draw * .5, C.roll);
  gunModel(v, X, kt < .07 ? 1 - kt / .07 : 0); handModel(v, X);
}
swayMeshes = (o => function (v) { o(v); try { gunView(v); } catch (e) {} })(swayMeshes);
