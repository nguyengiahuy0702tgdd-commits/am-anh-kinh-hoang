// ===================== 8. ĐỒ HỌA 3D (WebGL2) =====================
//  Tường/sàn/trần là khối 3D thật · đèn pin chiếu sáng theo từng điểm ảnh
//  bề mặt sần (bump) · đèn trần & nến tỏa sáng · hậu kỳ kiểu phim kinh dị
const WH = 1.3, EYE = .72;           // chiều cao tường, tầm mắt
let skyMesh, gl, P3, PP, fbo, fboTex, fboDepth, fboW = 0, fboH = 0, texArr, emArr, emptyVAO, sprMesh, LAYER = new Map(), U3 = {}, UP = {};
const flDir = [0, 0, -1];
const VS3 = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec2 aUV; layout(location=2) in vec3 aN; layout(location=3) in float aL; layout(location=4) in vec4 aI0; layout(location=5) in vec4 aI1; layout(location=6) in vec4 aI2;
uniform int uInst; uniform mat4 uVP; uniform float uT; uniform vec3 uWL[12]; uniform int uNW; out vec3 vPos; out vec2 vUV; out vec3 vN; flat out float vL;
void main(){ vec3 p = aPos, nn = aN;
  if (uInst == 1) { vec4 q = vec4(aPos, 1.); p = vec3(dot(aI0, q), dot(aI1, q), dot(aI2, q)); nn = vec3(dot(aI0.xyz, aN), dot(aI1.xyz, aN), dot(aI2.xyz, aN)); }   // mô hình quét 3D vẽ theo lô (instancing)
  for (int i = 0; i < 12; i++) { if (i >= uNW) break; if (abs(aL - uWL[i].x) < .5) { float hh = uWL[i].z < -50. ? 1. : max(p.y - uWL[i].z, 0.), k = uWL[i].y * hh, g = sin(uT * .55 + p.x * .21 + p.z * .17) * .6 + .4;
    p.x += (sin(uT * 1.9 + p.z * 1.7 + p.x * .9) * .7 + g * .5) * k; p.z += cos(uT * 1.5 + p.x * 1.3 + p.y * 2.) * k * .6; } }
  vPos=p; vUV=aUV; vN=nn; vL=aL; gl_Position=uVP*vec4(p,1.); }`;
const FS3 = `#version 300 es
precision highp float; precision highp sampler2DArray;
uniform sampler2DArray uTex, uEm, uSA, uSN, uMA, uMN; uniform vec3 uCam, uFlDir, uFogC, uMoonDir, uMoonC; uniform float uFl, uAmb, uFog, uSky, uPOM, uDay; uniform int uNL;
uniform vec4 uLP[10]; uniform vec4 uLC[10];
in vec3 vPos; in vec2 vUV; in vec3 vN; flat in float vL; out vec4 o;
// Phản xạ ánh sáng kiểu vật lý (GGX): độ nhám quyết định bề mặt bóng hay mờ, kim loại phản chiếu màu của chính nó
vec3 ggx(vec3 N, vec3 V, vec3 L, vec3 F0, float r) {
  vec3 H = normalize(V + L); float a = r * r, a2 = a * a, nh = max(dot(N, H), 0.), nv = max(dot(N, V), 1e-3), nl = max(dot(N, L), 0.);
  float dd = nh * nh * (a2 - 1.) + 1., D = a2 / (3.14159 * dd * dd), k = (r + 1.) * (r + 1.) / 8., G = nv / (nv * (1. - k) + k) * nl / (nl * (1. - k) + k);
  vec3 Fr = F0 + (1. - F0) * pow(1. - max(dot(H, V), 0.), 5.); return D * G * Fr / (4. * nv * max(nl, 1e-3) + 1e-4) * nl * 3.14159; }
void main(){
  vec3 Nn = normalize(vN); vec3 q1 = dFdx(vPos), q2 = dFdy(vPos); vec2 t1 = dFdx(vUV), t2 = dFdy(vUV);
  vec2 uv = vUV; float dc = length(uCam - vPos);
  float uvs = length(t1) / max(length(q1), 1e-5);
  bool pb = vL > 999.5, sf = vL > 1999.5; float pl = vL - (sf ? 2000. : 1000.); vec4 tn = vec4(.5, .5, .7, 0.);   // pb: vật liệu PBR (ảnh quét thật)
  if (!pb && uPOM > 0. && dc < 5.5 && uvs < 2.2) {   // bề mặt có chiều sâu thật (parallax): mạch gạch, khe ván lõm xuống
    vec3 q2p = cross(q2, Nn), q1p = cross(Nn, q1); vec3 Tg = q2p * t1.x + q1p * t2.x, Bt = q2p * t1.y + q1p * t2.y; float im = inversesqrt(max(max(dot(Tg, Tg), dot(Bt, Bt)), 1e-12));
    vec3 Vw = normalize(uCam - vPos); vec3 Vt = vec3(dot(Vw, Tg * im), dot(Vw, Bt * im), dot(Vw, Nn));
    if (Vt.z > .05) { float fade = 1. - smoothstep(3.5, 5.5, dc); vec2 stp = -Vt.xy / max(Vt.z, .25) * .022 * uPOM * fade / 10.; float lay = 0., dl = .1, hcur = 0.;
      for (int i = 0; i < 10; i++) { hcur = 1. - dot(textureLod(uTex, vec3(uv, vL), 2.).rgb, vec3(.3, .59, .11)) * 1.6; if (lay >= hcur) break; uv += stp; lay += dl; } }
  }
  vec4 tc;
  if (pb) { if (sf) { tc = textureGrad(uSA, vec3(uv, pl), t1, t2); tn = textureGrad(uSN, vec3(uv, pl), t1, t2); } else { tc = textureGrad(uMA, vec3(uv, pl), t1, t2); tn = textureGrad(uMN, vec3(uv, pl), t1, t2); } }
  else tc = texture(uTex, vec3(uv, vL));
  if (tc.a < .5) discard;
  if (abs(vL - uSky) < .5) { vec3 dsk = mix(vec3(.82, .86, .9), vec3(.4, .6, .88), clamp((vPos.y - uCam.y) / 22., 0., 1.)); o = vec4(mix(tc.rgb, dsk, uDay), 1.); return; }   // bầu trời (ban ngày trong phim)
  vec3 base = pow(tc.rgb, vec3(2.2));
  if (uDay > 0.) { float bl = step(base.g * 2.4, base.r) * step(base.b * 2.4, base.r) * step(base.r, .5); vec3 cl = vec3(dot(base, vec3(.3, .59, .11))) * vec3(1.2, 1.1, .95) + .02; base = mix(base, cl, bl * uDay); }   // ngày xưa: chưa có vết máu
  float hgt = dot(texture(uTex, vec3(uv, vL), 2.5).rgb, vec3(.3,.59,.11));
  vec3 N = normalize(vN); if (pb && dot(N, uCam - vPos) < 0.) N = -N;
  vec3 dpx = q1, dpy = q2; float dhx = dFdx(hgt), dhy = dFdy(hgt);
  if (pb) {   // bản đồ pháp tuyến thật: vân gỗ, mạch gạch, nếp vải nổi khối theo ánh đèn
    vec3 nt = vec3(tn.xy * 2. - 1., 0.); nt.z = sqrt(max(1. - dot(nt.xy, nt.xy), 0.));
    vec3 a2p = cross(dpy, N), a1p = cross(N, dpx); vec3 Tg = a2p * t1.x + a1p * t2.x, Bt = a2p * t1.y + a1p * t2.y; float im = inversesqrt(max(max(dot(Tg, Tg), dot(Bt, Bt)), 1e-12));
    N = normalize(Tg * im * nt.x - Bt * im * nt.y + N * nt.z);
  } else {
  vec3 r1 = cross(dpy, N), r2 = cross(N, dpx); float det = dot(dpx, r1);
  N = normalize(abs(det) * N - sign(det) * (dhx * r1 + dhy * r2) * .5);        // bề mặt sần
  }
  float rgh = pb ? clamp(tn.z, .06, 1.) : .55, mtl = pb ? tn.w : 0.; vec3 F0 = mix(vec3(.04), base, mtl), dif = pb ? base * (1. - mtl) : base;
  vec3 Ld = uCam - vPos; float d = length(Ld); vec3 L = Ld / d, V = L;
  float cosA = dot(-L, uFlDir), foc = uFl > 0. ? mix(.3, 1., smoothstep(.66, .93, cosA)) : 1.;   // bật đèn pin: xung quanh tối đi, chỉ vùng đèn sáng rõ
  vec3 col = (dif * mix(uAmb, .6, uDay) * mix(vec3(1.), vec3(1.12, 1.02, .88), uDay) + dif * uMoonC * (max(dot(N, uMoonDir), 0.) * .8 + .2) * (1. + uDay * 1.6) + (pb ? F0 * (uAmb + dot(uMoonC, vec3(.33))) * (1. - rgh * .7) : vec3(0.))) * foc;
  float spot = smoothstep(.83, .975, cosA) * (.78 + .22 * sin(cosA * 90.)) + smoothstep(.55, .88, cosA) * .08;
  float ndl = max(dot(N, L), 0.);
  float spec = pow(max(dot(N, normalize(L + V)), 0.), 40.) * .18 * (1. - hgt * .6);
  col += (pb ? dif * ndl + ggx(N, V, L, F0, rgh) : base * ndl + spec) * vec3(1., .9, .74) * uFl * spot * 1.85 / (1. + .16 * d * d);
  for (int i = 0; i < 10; i++) { if (i >= uNL) break;
    vec3 lv = uLP[i].xyz - vPos; float dd = length(lv); vec3 l = lv / dd;
    col += (dif * (max(dot(N, l), 0.) * .85 + .15) + (pb ? ggx(N, V, l, F0, rgh) : vec3(0.))) * uLC[i].rgb * (uLP[i].w / (1. + uLC[i].a * dd * dd)) * foc; }
  if (!pb) col += pow(texture(uEm, vec3(uv, vL)).rgb, vec3(2.2)) * 1.8 * mix(1., foc, .5);
  col = mix(uFogC, col, exp(-d * d * uFog));
  col = col / (1. + col * mix(.55, 1.15, uDay));   // ban ngày: nén vùng sáng, không cháy trắng
  o = vec4(pow(col, vec3(1. / 2.2)), 1.);
}`;
const VSP = `#version 300 es
out vec2 vUV; void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); vUV = p; gl_Position = vec4(p * 2. - 1., 0., 1.); }`;
const FSP = `#version 300 es
precision highp float; uniform sampler2D uScene, uDepth; uniform vec2 uRes, uRect, uNF; uniform float uTime, uProx, uHurt, uHide, uBright, uFx, uDead, uAO, uFl, uSS, uDay; uniform vec2 uMB;
in vec2 vUV; out vec4 o;
float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hs(i), hs(i + vec2(1., 0.)), f.x), mix(hs(i + vec2(0., 1.)), hs(i + 1.), f.x), f.y); }
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime * 43.) * 43758.5453); }
vec2 SV(vec2 uv){ return vec2(uRect.x + clamp(uv.x, .002, .998) * uRect.y, clamp(uv.y, .002, .998)); }
float LD(vec2 uv){ float z = texture(uDepth, SV(uv)).r * 2. - 1.; return 2. * uNF.x * uNF.y / (uNF.y + uNF.x - z * (uNF.y - uNF.x)); }
void main(){
  vec2 uv = vUV; float asp = uRes.x / uRes.y;
  vec2 cq = uv - .5; float r2 = dot(cq, cq) * 2.;
  uv = .5 + cq * (.988 + .024 * r2) * (1. - .014 * uProx * pow(abs(sin(uTime * 3.6)), 12.));   // ống kính hơi cong + nhịp tim dồn khi ma ở gần
  uv.x += sin(uv.y * 38. + uTime * 18.) * .003 * uProx;
  if (uProx > .6 && h(vec2(floor(uv.y * 45.), floor(uTime * 14.))) > 1. - uProx * .3) uv.x += (h(vec2(floor(uv.y * 45.), uTime)) - .5) * .09 * uProx;
  float ca = uProx * .01 + uHurt * .014;
  vec2 rd = (uv - .5) * (.0006 + .0025 * r2) + vec2(ca, 0.);
  vec3 c = vec3(texture(uScene, SV(uv + rd)).r, texture(uScene, SV(uv)).g, texture(uScene, SV(uv - rd)).b);
  if (uSS > 1.15) { vec2 e = .25 / uRes; vec3 s4 = texture(uScene, SV(uv + e)).rgb + texture(uScene, SV(uv + vec2(-e.x, e.y))).rgb + texture(uScene, SV(uv + vec2(e.x, -e.y))).rgb + texture(uScene, SV(uv - e)).rgb; c = mix(c, s4 * .25, .8); }   // siêu lấy mẫu 4K: mịn cạnh, hết răng cưa nhấp nháy
  if (dot(uMB, uMB) > 1e-7) { vec3 m = c; for (int i = 1; i <= 4; i++) m += texture(uScene, SV(uv + uMB * (float(i) / 4. - .5) * 2.)).rgb; c = m / 5.; }   // nhòe khi xoay nhanh
  { vec2 px = vec2(1.) / uRes; vec3 nb = texture(uScene, SV(uv + vec2(px.x, 0.))).rgb + texture(uScene, SV(uv - vec2(px.x, 0.))).rgb + texture(uScene, SV(uv + vec2(0., px.y))).rgb + texture(uScene, SV(uv - vec2(0., px.y))).rgb;
    c = max(c + (c - nb * .25) * (uSS > 1.15 ? .42 : .28), 0.); }   // làm nét chi tiết (unsharp mask)
  float dz0 = LD(uv);
  if (uAO > 0.) {   // bóng tối góc cạnh (SSAO): chân tường, góc phòng, gầm đồ vật tối sâu hơn
    // chỉ tính bóng từ vật ở rất gần (≤ 0,6 m) + xoay mẫu theo từng điểm ảnh: hết "bóng ma" khối vuông chạy theo đồ vật/người
    float d0 = dz0, ao = 0., rad = clamp(.07 / d0, .0015, .014), jit = .0;
    for (int i = 0; i < 8; i++) { float fi = float(i), a = fi * 2.39996 + jit, r = rad * (fi + 1.) / 8.;
      float dz = d0 - LD(uv + vec2(cos(a), sin(a) * asp) * r); ao += smoothstep(.006 * d0, .03 * d0 + .01, dz) * (1. - smoothstep(.12, .28, dz)); }
    c *= 1. - clamp(ao / 8. * 1.5, 0., .55) * uAO;
  }
  vec3 bl = vec3(0.), db = vec3(0.); for (int i = 0; i < 12; i++) { float a = float(i) * .5236; vec3 s0 = texture(uScene, SV(uv + vec2(cos(a), sin(a) * asp) * .0022)).rgb; bl += max(s0 - .55, 0.); db += s0; }
  c += bl * .08;
  c = mix(c, db / 12., smoothstep(16., 36., dz0) * .2 + (1. - smoothstep(.04, .1, dz0)) * .2);   // chiều sâu: xa mờ, sát mặt mờ
  vec2 q = vUV - .5;
  float beam = uFl * smoothstep(.55, .0, length(q * vec2(asp, 1.))) * (1. - exp(-min(dz0, 14.) * .22));
  float mote = vn(vUV * vec2(9., 6.) + vec2(uTime * .07, -uTime * .05)) * vn(vUV * vec2(23., 17.) - vec2(uTime * .11, uTime * .04));
  c += vec3(1., .9, .72) * beam * (.012 + .04 * mote);   // luồng sáng đèn pin xuyên màn bụi
  float l = dot(c, vec3(.3, .59, .11)); c = mix(vec3(l), c, mix(.8, 1.08, uDay)) * mix(vec3(1., .965, .92), vec3(1.04, 1., .95), uDay);
  c += vec3(.25, 0., 0.) * uProx * l + vec3(.3, 0., 0.) * uHurt;
  c *= 1. - dot(q, q) * mix(.8, .3, uDay);
  c *= 1. + uDay * .08;
  c += (h(vUV * uRes) - .5) * .016;
  c = pow(max(c, 0.), vec3(1. / uBright)) * (.9 + .2 * uBright);
  c += (h(vUV * uRes) - .5) * uProx * .12;
  if (uHide > 0. && abs(q.x) > .055) c *= .04;
  if (uDead > 0.) { float g = dot(c, vec3(.3, .59, .11)); c = vec3(g * .95, g * .22, g * .2) * .75; }
  o = vec4(c, 1.);
}`;
function compile(vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); gl.attachShader(p, s); }
  gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
}
function initGL() {
  gl = cv.getContext("webgl2", { antialias: false, powerPreference: "high-performance" });
  if (!gl) { alert("Trình duyệt không hỗ trợ WebGL2. Hãy dùng Chrome/Edge/Firefox bản mới."); throw new Error("no webgl2"); }
  P3 = compile(VS3, FS3); PP = compile(VSP, FSP);
  ["uVP", "uTex", "uEm", "uCam", "uFlDir", "uFl", "uAmb", "uFog", "uNL", "uLP", "uLC", "uFogC", "uMoonDir", "uMoonC", "uSky", "uPOM", "uT", "uWL", "uNW", "uDay"].forEach(n => U3[n] = gl.getUniformLocation(P3, n));
  ["uScene", "uRes", "uTime", "uProx", "uHurt", "uHide", "uBright", "uFx", "uDepth", "uRect", "uNF", "uDead", "uAO", "uFl", "uMB", "uSS", "uDay"].forEach(n => UP[n] = gl.getUniformLocation(PP, n));
  emptyVAO = gl.createVertexArray(); sprMesh = makeMesh(new Float32Array(9), gl.DYNAMIC_DRAW); skyMesh = makeMesh(new Float32Array(9), gl.DYNAMIC_DRAW);
}
function uploadTextures() {
  const list = []; const add = t => { if (t && t.c && !LAYER.has(t)) { LAYER.set(t, list.length); list.push(t); } };
  for (const v of Object.values(T)) Array.isArray(v) ? v.forEach(add) : add(v);
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  const make = (pick, N) => {   // N = kích thước mỗi lớp texture
    const c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d", { willReadFrequently: true });
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t); gl.texStorage3D(gl.TEXTURE_2D_ARRAY, Math.log2(N) + 1, gl.RGBA8, N, N, list.length);
    list.forEach((tx, i) => { g.clearRect(0, 0, N, N); const src = pick(tx); if (src) g.drawImage(src, 0, 0, N, N); else { g.fillStyle = "#000"; g.fillRect(0, 0, N, N); }
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, N, N, 1, gl.RGBA, gl.UNSIGNED_BYTE, g.getImageData(0, 0, N, N)); });
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (aniso) gl.texParameterf(gl.TEXTURE_2D_ARRAY, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    return t;
  };
  texArr = make(t => t.c, 256); emArr = make(t => t.ec, 128);
}
function makeMesh(data, usage = gl.STATIC_DRAW) {
  const vao = gl.createVertexArray(), b = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  [[0, 3, 0], [1, 2, 12], [2, 3, 20], [3, 1, 32]].forEach(([l, n, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 36, o); });
  gl.bindVertexArray(null); return { vao, b, n: data.length / 9 };
}
// Thêm một mặt tứ giác: 4 đỉnh [x,y,z,u,v], pháp tuyến n, lớp texture L
function quad(v, p, n, L) { for (const i of [0, 1, 2, 0, 2, 3]) v.push(p[i][0], p[i][1], p[i][2], p[i][3], p[i][4], n[0], n[1], n[2], L); }
function box(v, x0, y0, z0, x1, y1, z1, side, top) {
  const S = LAYER.get(side), Tp = LAYER.get(top || side);
  quad(v, [[x0, y1, z0, 0, 0], [x1, y1, z0, 1, 0], [x1, y1, z1, 1, 1], [x0, y1, z1, 0, 1]], [0, 1, 0], Tp);
  quad(v, [[x0, y1, z1, 0, 0], [x1, y1, z1, 1, 0], [x1, y0, z1, 1, 1], [x0, y0, z1, 0, 1]], [0, 0, 1], S);
  quad(v, [[x1, y1, z0, 0, 0], [x0, y1, z0, 1, 0], [x0, y0, z0, 1, 1], [x1, y0, z0, 0, 1]], [0, 0, -1], S);
  quad(v, [[x1, y1, z1, 0, 0], [x1, y1, z0, 1, 0], [x1, y0, z0, 1, 1], [x1, y0, z1, 0, 1]], [1, 0, 0], S);
  quad(v, [[x0, y1, z0, 0, 0], [x0, y1, z1, 1, 0], [x0, y0, z1, 1, 1], [x0, y0, z0, 0, 1]], [-1, 0, 0], S);
}
