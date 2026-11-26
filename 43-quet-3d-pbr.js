// =====================================================================
//  40. BẢN 27: ĐỒ VẬT QUÉT 3D THẬT + VẬT LIỆU PBR (Poly Haven, CC0)
// =====================================================================
//  · Tường, sàn, trần dùng ảnh quét thật (màu + pháp tuyến + độ nhám).
//  · Đồ đạc trong nhà thay bằng mô hình quét 3D (glTF) đúng hình dáng, đúng kích thước mét ngoài đời.
//  · Tài nguyên nằm trong thư mục assets/ (tải bằng TAI-TAI-NGUYEN.bat). Thiếu tài nguyên → game tự dùng đồ vẽ bằng code như cũ.
//  · Muốn thêm đồ: thêm id Poly Haven vào assets/danh-sach.json, tải lại, rồi khai báo trong SCAN_MODELS / SCAN_LAYOUT bên dưới.

// ---------- 1. BẢNG ĐỒ VẬT: tên gọn → id mô hình Poly Haven ----------
const SCAN_MODELS = {
  armchair: "ArmChair_01", sofa: "Sofa_01", coffeeT: "CoffeeTable_01", sideT: "WoodenTable_02", rocking: "Rockingchair_01",
  bed: "GothicBed_01", daybed: "vintage_day_bed", night: "ClassicNightstand_01", commode: "GothicCommode_01", cabinet: "GothicCabinet_01",
  bookcase: "wooden_bookshelf_worn", console: "ClassicConsole_01", roundT: "round_wooden_table_02", diningT: "dining_table", woodT: "WoodenTable_01",
  chair: "painted_wooden_chair_02", chair2: "painted_wooden_chair_01", stool: "wooden_stool_02", tv: "Television_01", tvStand: "painted_wooden_cabinet_02",
  frameA: "hanging_picture_frame_02", frameB: "fancy_picture_frame_01", frameC: "hanging_picture_frame_03", mirror: "ornate_mirror_01",
  wclock: "wall_clock", gclock: "vintage_grandfather_clock_01", rack: "worn_metal_rack", barrel: "Barrel_01", box: "cardboard_box_01",
  pcab: "painted_wooden_cabinet", pshelves: "painted_wooden_shelves", tallShelf: "Shelf_01", stove: "electric_stove", oilLamp: "vintage_oil_lamp",
  metalDesk: "metal_office_desk", toolChest: "metal_tool_chest", boulder: "boulder_01", pnight: "painted_wooden_nightstand", drawers: "vintage_wooden_drawer_01",
  steelShelf: "steel_frame_shelves_01", medBox: "medical_box", gasMask: "old_gas_mask", crate: "old_military_crate", lantern: "Lantern_01",
};
// ---------- 2. CÁCH ĐẶT: mã đồ vật của game → các mô hình ----------
//  a: "wall" (lưng sát tường), "center" (giữa phòng), "mount" (treo tường, y = độ cao tâm tính bằng mét)
//  p: [[mô hình, x, z, góc xoay thêm, y]]  (đơn vị mét, hệ tọa độ của đồ vật: x dọc tường, z hướng vào phòng)
//  pick: chọn ngẫu nhiên (theo hạt giống của đồ vật) một trong các phương án
const SCAN_LAYOUT = {
  r_armchairs: { a: "center", p: [["armchair", -.68, 0, Math.PI / 2 + .3], ["armchair", .68, 0, -Math.PI / 2 - .3], ["sideT", 0, .1, .2]] },
  r_sofaSet: { a: "center", p: [["sofa", 0, -.55, 0], ["coffeeT", 0, .5, 0]] },
  r_dining: { a: "center", p: [["diningT", 0, 0, 0], ["chair", -.4, -.78, 0], ["chair", .42, -.8, .15], ["chair", -.4, .78, Math.PI], ["chair", .4, .82, Math.PI + .25]] },
  r_round: { a: "center", p: [["roundT", 0, 0, 0], ["chair", 0, -.78, 0], ["chair2", .72, .42, Math.PI * 1.25 + .3], ["oilLamp", .1, .05, .4, "top0"]] },
  r_kitTable: { a: "center", p: [["woodT", 0, 0, 0], ["chair", 0, -.68, 0], ["chair2", .05, .7, Math.PI + .4]] },
  r_bed: { a: "wall", fit: 1, p: [["bed", 0, 0, 0]] },
  r_bedS: { a: "wall", fit: 1, p: [["daybed", 0, 0, 0]] },
  r_nightstand: { a: "wall", fit: 1, p: [["night", 0, 0, 0]] },
  r_dresser: { a: "wall", fit: 1, pick: [[["commode", 0, 0, 0]], [["pcab", 0, 0, 0]]] },
  r_wardrobe: { a: "wall", fit: 1, p: [["cabinet", 0, 0, 0]] },
  r_bookTall: { a: "wall", fit: 1, pick: [[["bookcase", 0, 0, 0]], [["tallShelf", 0, 0, 0]]] },
  r_desk: { a: "wall", p: [["console", 0, 0, 0], ["chair", 0, .95, Math.PI], ["oilLamp", .45, .2, 0, "top0"]] },
  r_tvset: { a: "wall", p: [["tvStand", 0, 0, 0], ["tv", 0, .04, 0, "top0"]] },
  r_painting: { a: "mount", y: H => Math.min(1.55, H - 1.2), pick: [[["frameA", 0, 0, 0]], [["frameB", 0, 0, 0]], [["frameC", 0, 0, 0]]] },
  r_mirrorW: { a: "mount", y: () => 1.45, p: [["mirror", 0, 0, 0]] },
  r_clockW: { a: "mount", y: H => Math.min(1.9, H - .5), p: [["wclock", 0, 0, 0]] },
  r_shelfMetal: { a: "wall", fit: 1, p: [["rack", 0, 0, 0]] },
  r_drums: { a: "wall", p: [["barrel", -.62, .33, .3], ["barrel", 0, .33, 1.9], ["barrel", .62, .36, 4.1]] },
  r_boxStack: { a: "center", p: [["box", 0, 0, .1], ["box", .04, -.02, .5, "top0"], ["box", .55, .5, 1.2]] },
  r_stove: { a: "wall", fit: 1, p: [["stove", 0, 0, 0]] },
  d_clock: { a: "center", p: [["gclock", 0, 0, 0]] },
  d_chair: { a: "center", pick: [[["chair", 0, 0, 0]], [["chair2", 0, 0, 0]], [["rocking", 0, 0, 0]]] },
  d_stool: { a: "center", p: [["stool", 0, 0, 0]] },
  d_cabinet: { a: "center", p: [["pcab", 0, 0, 0]] },
  d_shelf: { a: "center", p: [["pshelves", 0, 0, 0]] },
  d_boxes: { a: "center", p: [["box", 0, 0, .2], ["box", .35, .1, -.4], ["box", .1, .05, .9, "top0"]] },
};
// Riêng từng map: ghi đè cách đặt ở trên (null = giữ đồ vẽ bằng code cho hợp bối cảnh)
const SCAN_MAP_LAYOUT = {
  factory: { r_officeDesk: { a: "wall", fit: 1, p: [["metalDesk", 0, 0, 0], ["chair2", 0, .9, Math.PI + .3]] }, r_toolCart: { a: "wall", fit: 1, p: [["toolChest", 0, 0, 0]] },
    r_filing: { a: "wall", fit: 1, p: [["drawers", 0, 0, 0]] }, r_rackRow: { a: "center", p: [["steelShelf", 0, -.28, 0], ["steelShelf", 0, .28, Math.PI], ["box", .3, .7, .4]] } },
  hospital: { r_bedS: null, r_dresser: null, r_nightstand: { a: "wall", fit: 1, p: [["pnight", 0, 0, 0], ["medBox", .05, .05, .3, "top0"]] },
    r_officeDesk: { a: "wall", fit: 1, p: [["metalDesk", 0, 0, 0]] }, r_filing: { a: "wall", fit: 1, p: [["drawers", 0, 0, 0]] },
    r_boxStack: { a: "center", p: [["crate", 0, 0, .1], ["box", .05, 0, .6, "top0"], ["gasMask", .5, .4, 1.3]] } },
  castle: { r_fourPoster: { a: "wall", fit: 1, p: [["bed", 0, 0, 0]] }, r_boxStack: { a: "center", p: [["crate", 0, 0, .2], ["lantern", 0, 0, .5, "top0"]] } },
  cemetery: { r_boulder: { a: "center", fit: 1, p: [["boulder", 0, 0, 0]] }, r_bed: null },
  forest: { r_boulder: { a: "center", fit: 1, p: [["boulder", 0, 0, 0]] }, r_bed: null },
};
// ---------- 3. VẬT LIỆU TƯỜNG / SÀN / TRẦN: texture cũ → vật liệu Poly Haven ----------
//  text: chữ máu viết đè lên tường (giữ nguyên các dòng chữ của game)
const SCAN_SURF = {
  paper: "decrepit_wallpaper", paperB: "decrepit_wallpaper", blue: "blue_plaster_weathered", blueB: "blue_plaster_weathered",
  rose: "painted_plaster_wall", roseB: "painted_plaster_wall", kitW: "long_white_tiles", kitF: "dirty_tiles",
  bathW: "long_white_tiles", bathWB: "long_white_tiles", bathF: "floor_tiles_08",
  wood: "old_wood_floor", woodB: "old_wood_floor", woodDk: "dark_wooden_planks", carpet: "dirty_carpet", carpetB: "dirty_carpet", marble: "marble_tiles",
  concF: "concrete_floor_worn_001", concFB: "concrete_floor_worn_001", concP: "concrete_wall_004", concB: "concrete_wall_004", conc: "concrete",
  ceil: "plastered_wall_02", ceilB: "plastered_wall_02", ceilWood: "brown_planks_03",
  w1: { base: "decrepit_wallpaper", text: [["CỨU"], 46] }, w2: { base: "blue_plaster_weathered", text: [["NÓ Ở", "ĐÂY"], 32] },
  w3: { base: "concrete_wall_004", text: [["ĐỪNG", "QUAY LẠI"], 26] }, w4: { base: "painted_plaster_wall", text: [["MẸ ƠI", "CON LẠNH"], 24] },
  w5: { base: "concrete_wall_004", text: [["TRẢ BÉ", "BÔNG", "CHO EM"], 22] },
  // Lâu Đài
  stoneW: "castle_brick_07", stoneWB: "castle_brick_07", flag: "floor_pattern_01", stoneCeil: "medieval_blocks_03",
  // Rừng & Nghĩa Trang (ngoài trời)
  logWall: "beam_wall_01", leaves: "forest_leaves_02", grass: "forrest_ground_01", dirt: "forest_ground_04", dirtB: "forest_ground_04", mausW: "castle_brick_01",
  // Nhà Máy
  indTile: "concrete_tiles", ceilInd: "corrugated_iron_03",
  // Bệnh Viện Dị Nhân
  hWall: "concrete_wall_001", hWallB: "concrete_wall_001", hWard: "beige_wall_002", hWardB: "beige_wall_002", hTileW: "long_white_tiles", hTileWB: "long_white_tiles",
  hLino: "old_linoleum_flooring_01", hLinoB: "old_linoleum_flooring_01", hLinoC: "old_linoleum_flooring_01", hTileF: "dirty_tiles", hTileFB: "dirty_tiles", hBathF: "dirty_tiles",
  hMorF: "marble_tiles", hORF: "interior_tiles", hConcF: "damaged_concrete_floor_02", hBase: "concrete_wall_009", hBaseB: "concrete_wall_009", hCeil: "white_plaster_02", hCeilB: "white_plaster_02", hKidF: "linoleum_brown",
};

// ---------- 4. NẠP TÀI NGUYÊN: tự động khi vào game, chỉ tải những thứ map đang chơi cần ----------
//  Nguồn: thư mục assets/ (nếu đã chạy TAI-TAI-NGUYEN.bat) → nếu không có thì tải thẳng từ máy chủ Poly Haven.
//  Tải xong được lưu lại trong trình duyệt (Cache Storage) → lần sau vào game gần như tức thì, không cần mạng.
const PH = "https://dl.polyhaven.org/file/ph-assets";
if (SET.g3d == null) {   // lần đầu: tự chọn theo sức máy
  const strong = (navigator.hardwareConcurrency || 4) >= 4 && (navigator.deviceMemory || 8) >= 4 && !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  SET.g3d = strong ? "on" : "off"; if (SET.menu3d == null) SET.menu3d = strong; saveSet();
}
if (SET.menu3d == null) { SET.menu3d = SET.g3d !== "off"; saveSet(); }
const SCAN = { gen: 0, mode: null, started: false, ready: false, done: false, gpu: false, building: false, failed: "", models: {}, sLayers: [], mLayers: [], surfIdx: {}, rem: null, stat: { models: 0, surf: 0 }, prog: [0, 0], tex: null };
const NETQ = (() => { let a = 0; const q = []; return f => new Promise((res, rej) => { const go = () => { a++; f().then(res, rej).finally(() => { a--; if (q.length) q.shift()(); }); }; a < (SET.g3d === "hi" ? 3 : 6) ? go() : q.push(go); }); })();   // tối đa 6 file cùng lúc (Siêu nét: 3 cho nhẹ bộ nhớ)
async function fetchC(url) {
  let c = null; try { c = await caches.open("aakh-quet3d-v1"); const hit = await c.match(url); if (hit) return hit; } catch (e) { c = null; }
  const r = await fetch(url, { mode: "cors" }); if (!r.ok) throw new Error(r.status + " " + url);
  if (c && /^https?:/.test(url)) try { await c.put(url, r.clone()); } catch (e) {}
  return r;
}
async function fetchAny(urls) { let err; for (const u of urls) { try { return await fetchC(u); } catch (e) { err = e; } } throw err; }
async function scanBitmap(urls, N) {
  const r = await NETQ(() => fetchAny([].concat(urls)));
  return createImageBitmap(await r.blob(), { resizeWidth: N, resizeHeight: N, resizeQuality: "high", premultiplyAlpha: "none", colorSpaceConversion: "none" });
}
// Mỗi vật liệu = 3 ảnh đưa thẳng lên GPU (không xử lý từng điểm ảnh trên CPU → không giật):
//  màu · pháp tuyến · ARM [bóng AO, độ nhám, kim loại]. Thiếu ảnh nào thì dùng ô màu trơn thay thế.
const SOLID = {};
function solid(N, rgba) { const k = N + ":" + rgba; if (SOLID[k]) return SOLID[k]; const c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"); g.fillStyle = rgba; g.fillRect(0, 0, N, N); return SOLID[k] = c; }
function scanPack(N, d, nr, arm, fac = {}, Nr = N) {
  const bc = fac.color; let a = d;
  if (!d) { const c = bc || [.5, .45, .4, 1]; a = solid(N, `rgba(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0},1)`); }
  let r = arm; if (!arm) r = solid(Nr, `rgb(255,${Math.round(255 * Math.min(1, fac.rough ?? .78))},${Math.round(255 * Math.min(1, fac.metal === 1 ? 0 : fac.metal ?? 0))})`);
  return { a, n: nr || solid(N, "rgb(128,128,255)"), r };
}
// Chữ máu viết đè lên vật liệu tường (vẽ trên canvas, không làm lệch chuỗi ngẫu nhiên của game)
function scanWriteOn(src, N, lines, size) {
  const c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"); g.drawImage(src, 0, 0, N, N); g.scale(N / 128, N / 128);
  const sv = seed; seed = 4242 + size; try { writing(g, lines, size); } finally { seed = sv; }
  return c;
}

// glTF 2.0 tối giản: lưới tam giác + vật liệu PBR (đủ cho mô hình Poly Haven)
const M4 = {
  mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
  trs(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]) { const [x, y, z, w] = q, o = new Float32Array(16);
    o[0] = (1 - 2 * (y * y + z * z)) * s[0]; o[1] = 2 * (x * y + z * w) * s[0]; o[2] = 2 * (x * z - y * w) * s[0];
    o[4] = 2 * (x * y - z * w) * s[1]; o[5] = (1 - 2 * (x * x + z * z)) * s[1]; o[6] = 2 * (y * z + x * w) * s[1];
    o[8] = 2 * (x * z + y * w) * s[2]; o[9] = 2 * (y * z - x * w) * s[2]; o[10] = (1 - 2 * (x * x + y * y)) * s[2];
    o[12] = t[0]; o[13] = t[1]; o[14] = t[2]; o[15] = 1; return o; },
};
async function scanGLTF(url, N, id, layers) {
  const base = new URL(url, location.href), j = await (await NETQ(() => fetchC(base.href))).json();
  if ((j.extensionsRequired || []).some(e => e !== "KHR_texture_transform" && e !== "KHR_materials_emissive_strength")) throw new Error("định dạng nén chưa hỗ trợ: " + j.extensionsRequired);
  const bufs = await Promise.all((j.buffers || []).map(b => NETQ(() => fetchAny([new URL(b.uri, base).href, ...["4k", "2k", "1k", "8k"].map(r => `${PH}/Models/gltf/${r}/${id}/${b.uri}`)])).then(r => r.arrayBuffer())));
  const CT = { 5120: [Int8Array, 1, 127], 5121: [Uint8Array, 1, 255], 5122: [Int16Array, 2, 32767], 5123: [Uint16Array, 2, 65535], 5125: [Uint32Array, 4, 0], 5126: [Float32Array, 4, 0] }, NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const acc = i => { const a = j.accessors[i], bv = j.bufferViews[a.bufferView], [Ty, sz, nrm] = CT[a.componentType], nc = NC[a.type], st = bv.byteStride || nc * sz;
    const dv = new DataView(bufs[bv.buffer], (bv.byteOffset || 0) + (a.byteOffset || 0)), out = new Float32Array(a.count * nc);
    const rd = { 5120: o => dv.getInt8(o), 5121: o => dv.getUint8(o), 5122: o => dv.getInt16(o, true), 5123: o => dv.getUint16(o, true), 5125: o => dv.getUint32(o, true), 5126: o => dv.getFloat32(o, true) }[a.componentType];
    for (let e = 0; e < a.count; e++) for (let k = 0; k < nc; k++) { let v = rd(e * st + k * sz); if (a.normalized && nrm) v = Math.max(v / nrm, -1); out[e * nc + k] = v; } return out; };
  // ảnh & vật liệu
  const Nr = Math.max(128, N >> 1), imgCache = {}, img = (ti, n = N) => { if (ti == null) return null; const t = j.textures[ti.index], src = t?.source; if (src == null) return null; const u = j.images[src].uri; return imgCache[u + "@" + n] ??= scanBitmap(base.host === "dl.polyhaven.org" ? [`${PH}/Models/jpg/1k/${id}/${u.split("/").pop()}`, new URL(u, base).href] : [new URL(u, base).href, `${PH}/Models/jpg/1k/${id}/${u.split("/").pop()}`], n).catch(() => null); };
  const mats = [];
  for (const m of j.materials || []) { const p = m.pbrMetallicRoughness || {};
    const [d, nr, mr] = await Promise.all([img(p.baseColorTexture), img(m.normalTexture), img(p.metallicRoughnessTexture, Nr)]), oc = mr ? null : await img(m.occlusionTexture, Nr);
    const pk = scanPack(N, d, nr, mr || oc, { color: p.baseColorFactor, rough: p.roughnessFactor, metal: p.metallicFactor }, Nr);
    mats.push(layers.push(pk) - 1);
  }
  const defMat = () => mats.defMat ??= layers.push(scanPack(N, null, null, null, { color: [.5, .45, .4, 1], rough: .7, metal: 0 }, Nr)) - 1;
  // cây nút → lưới trong hệ tọa độ mô hình (mét)
  const prims = {}, bb = [1e9, 1e9, 1e9, -1e9, -1e9, -1e9];
  const walk = (ni, P) => { const n = j.nodes[ni], L = n.matrix ? Float32Array.from(n.matrix) : M4.trs(n.translation, n.rotation, n.scale), W = M4.mul(P, L);
    if (n.mesh != null) for (const pr of j.meshes[n.mesh].primitives) { if ((pr.mode ?? 4) !== 4) continue;
      const P0 = acc(pr.attributes.POSITION), Nn = pr.attributes.NORMAL != null ? acc(pr.attributes.NORMAL) : null, U = pr.attributes.TEXCOORD_0 != null ? acc(pr.attributes.TEXCOORD_0) : null;
      const idx = pr.indices != null ? acc(pr.indices) : Float32Array.from({ length: P0.length / 3 }, (_, i) => i);
      const mi = pr.material != null ? mats[pr.material] : defMat(), mt = j.materials?.[pr.material], tt = mt?.pbrMetallicRoughness?.baseColorTexture?.extensions?.KHR_texture_transform;
      const k = prims[mi] ??= { v: [], i: [] }, b0 = k.v.length / 9, cnt = P0.length / 3;
      for (let e = 0; e < cnt; e++) { const x = P0[e * 3], y = P0[e * 3 + 1], z = P0[e * 3 + 2];
        const X = W[0] * x + W[4] * y + W[8] * z + W[12], Y = W[1] * x + W[5] * y + W[9] * z + W[13], Z = W[2] * x + W[6] * y + W[10] * z + W[14];
        let nx = 0, ny = 1, nz = 0; if (Nn) { const a = Nn[e * 3], b = Nn[e * 3 + 1], c = Nn[e * 3 + 2]; nx = W[0] * a + W[4] * b + W[8] * c; ny = W[1] * a + W[5] * b + W[9] * c; nz = W[2] * a + W[6] * b + W[10] * c; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; }
        let u = U ? U[e * 2] : 0, v = U ? U[e * 2 + 1] : 0; if (tt) { const s = tt.scale || [1, 1], o = tt.offset || [0, 0]; u = u * s[0] + o[0]; v = v * s[1] + o[1]; }
        k.v.push(X, Y, Z, u, v, nx, ny, nz, 1000 + mi); bb[0] = Math.min(bb[0], X); bb[1] = Math.min(bb[1], Y); bb[2] = Math.min(bb[2], Z); bb[3] = Math.max(bb[3], X); bb[4] = Math.max(bb[4], Y); bb[5] = Math.max(bb[5], Z); }
      for (const q of idx) k.i.push(b0 + q);
    }
    for (const c of n.children || []) walk(c, W); };
  for (const ni of (j.scenes?.[j.scene ?? 0]?.nodes || j.nodes.map((_, i) => i))) walk(ni, M4.trs());
  const list = Object.values(prims).filter(p => p.i.length); if (!list.length) throw new Error("mô hình rỗng");
  return { prims: list.map(p => ({ v: new Float32Array(p.v), i: p.v.length / 9 > 65535 ? new Uint32Array(p.i) : new Uint16Array(p.i) })), bb, tris: list.reduce((a, p) => a + p.i.length / 3, 0) };
}
function scanLayoutOf(s) {
  if (!s.k) return null; const ov = SCAN_MAP_LAYOUT[typeof MAPID === "string" ? MAPID : ""], L = ov && s.k in ov ? ov[s.k] : SCAN_LAYOUT[s.k]; if (!L) return null;
  const sd = s.seed ?? .5, p = L.pick ? L.pick[Math.floor(((Math.sin(sd * 917 + 3.1) + 1) / 2) * L.pick.length) % L.pick.length] : L.p;
  return { L, p };
}
// Map này cần những vật liệu & mô hình nào
function scanNeeds() {
  const used = new Set(), add = t => { if (Array.isArray(t)) t.forEach(add); else if (t) used.add(t); };
  for (const f of Object.values(FLOORS)) { add(f.ceil); add(f.defWall); add(f.defFloor); (f.floorT || []).forEach(add); for (const r of f.room || []) if (r) { add(r.wall); add(r.floor); add(r.ceil); } }
  try { Object.values(WALL_TEX()).forEach(add); } catch (e) {}
  const models = new Set(); for (const f of Object.values(FLOORS)) for (const s of f.sprites) { const pl = scanLayoutOf(s); if (pl) for (const q of pl.p) models.add(SCAN_MODELS[q[0]]); }
  return { surf: Object.keys(SCAN_SURF).filter(k => T[k] && used.has(T[k])), models: [...models] };
}
async function scanStart() {
  if (SCAN.started || SET.g3d === "off" || !Object.keys(FLOORS).length) return;
  SCAN.started = true; SCAN.mode = SET.g3d; const gen = SCAN.gen, sL = SCAN.sLayers, mL = SCAN.mLayers, live = () => gen === SCAN.gen;
  try {
    let man = null; if (location.protocol !== "file:") try { const r = await fetch("assets/manifest.json", { cache: "no-cache" }); if (r.ok) man = await r.json(); } catch (e) {}
    const need = scanNeeds(), hi = SET.g3d === "hi" && SET.quality !== "nhanh", RES = hi ? "2k" : "1k";
    const NS = SET.quality === "nhanh" ? 256 : hi ? 1024 : 512, NM = SET.quality === "nhanh" ? 256 : 512; SCAN.NS = NS; SCAN.NM = NM; SCAN.NSr = Math.max(128, NS >> 1); SCAN.NMr = Math.max(128, NM >> 1);
    const ids = [...new Set(need.surf.map(k => typeof SCAN_SURF[k] === "string" ? SCAN_SURF[k] : SCAN_SURF[k].base))];
    SCAN.prog = [0, ids.length + need.models.length];
    const surfUrl = (id, k, ph) => { const loc = man?.textures?.[id]?.[k]; const r = [RES, "1k"].filter((x, i, a) => a.indexOf(x) === i).map(R => `${PH}/Textures/jpg/${R}/${id}/${id}_${ph}_${R}.jpg`); return loc ? ["assets/" + loc, ...r] : r; };
    const packs = {};
    await Promise.all(ids.map(async id => { try { const [d, n, a] = await Promise.all([["diff", "diff", NS], ["nor", "nor_gl", NS], ["arm", "arm", SCAN.NSr]].map(([k, ph, n]) => scanBitmap(surfUrl(id, k, ph), n).catch(() => null)));
      if (d) packs[id] = scanPack(NS, d, n, a, {}, SCAN.NSr); } finally { SCAN.prog[0]++; } }));
    if (!live()) return;
    for (const key of need.surf) { const def = SCAN_SURF[key], pk = packs[typeof def === "string" ? def : def.base]; if (!pk) continue;
      let use = pk; if (def.text) use = { ...pk, a: scanWriteOn(pk.a, NS, def.text[0], def.text[1]) };
      SCAN.surfIdx[key] = sL.push(use) - 1; SCAN.stat.surf++; }
    await Promise.all(need.models.map(async id => { try { const loc = man?.models?.[id];
        const m = await scanGLTF(loc ? "assets/" + loc : `${PH}/Models/gltf/1k/${id}/${id}_1k.gltf`, NM, id, mL); if (live()) { SCAN.models[id] = { ...m, id }; SCAN.stat.models++; } }
      catch (e) { console.warn("[3D] bỏ qua", id, e.message); } finally { SCAN.prog[0]++; } }));
    if (!live()) return;
    SCAN.ready = SCAN.stat.models > 0 || SCAN.stat.surf > 0;
    if (!SCAN.ready) SCAN.failed = navigator.onLine === false ? "chưa có mạng để tải lần đầu" : "không tải được từ Poly Haven";
    console.info(`[3D] ${SCAN.stat.models} mô hình, ${SCAN.stat.surf} vật liệu (${man ? "thư mục assets" : "Poly Haven"})`);
  } catch (e) { if (live()) SCAN.failed = e.message; }
  if (live()) SCAN.done = true;
}
// Tắt / đổi mức 3D giữa chừng: giải phóng bộ nhớ đồ họa, quay về đồ họa vẽ bằng code
function scanReset() {
  SCAN.gen++;
  if (gl && SCAN.tex) SCAN.tex.forEach(t => gl.deleteTexture(t));
  for (const l of [...SCAN.sLayers, ...SCAN.mLayers]) for (const k of ["a", "n", "r"]) try { l[k]?.close?.(); } catch (e) {}
  if (gl) for (const m of Object.values(SCAN.models)) { if (m.ib) gl.deleteBuffer(m.ib); for (const p of m.gp || []) { gl.deleteVertexArray(p.vao); gl.deleteBuffer(p.vb); gl.deleteBuffer(p.eb); } }
  Object.assign(SCAN, { up: null, started: false, ready: false, done: false, gpu: false, failed: "", models: {}, sLayers: [], mLayers: [], surfIdx: {}, rem: null, stat: { models: 0, surf: 0 }, prog: [0, 0], tex: null, mode: null });
  scanRefresh();
}
function scanApply() {
  if (SET.g3d === "off") { if (SCAN.started || SCAN.gpu) scanReset(); return; }
  if (SCAN.started && SCAN.mode !== SET.g3d) scanReset();
  if (!SCAN.started && Object.keys(FLOORS).length && LAYER.size) scanStart();
}
applySet = (o => function () { o(); try { scanApply(); } catch (e) {} })(applySet);
SETTINGS_UI.push(["Đồ họa 3D thật", "g3d", "select", { off: "Tắt", on: "Bật", hi: "Siêu nét" }], ["Nền menu 3D", "menu3d", "check"]);
try { buildSettingsUI(); } catch (e) {}
// ---------- 5. ĐƯA LÊN GPU: chia nhỏ qua nhiều khung hình để không khựng ----------
function scanArr(N, n) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, Math.log2(N) + 1, gl.RGBA8, N, N, Math.max(1, n));
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
  const an = gl.getExtension("EXT_texture_filter_anisotropic"); if (an) gl.texParameterf(gl.TEXTURE_2D_ARRAY, an.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  return t;
}
function scanGPU() {
  if (SCAN.gpu || !gl || !LAYER.size || !SCAN.ready) return;
  const U = SCAN.up ??= { i: 0, list: [...SCAN.sLayers.map((l, i) => [0, l, i]), ...SCAN.mLayers.map((l, i) => [1, l, i])], models: Object.values(SCAN.models), mi: 0 };
  const SZ = [SCAN.NS, SCAN.NS, SCAN.NSr, SCAN.NM, SCAN.NM, SCAN.NMr];   // ảnh ARM (bóng/độ nhám/kim loại) chỉ cần nửa độ phân giải → tiết kiệm bộ nhớ đồ họa
  if (!SCAN.tex) SCAN.tex = SZ.map((n, i) => scanArr(n, i < 3 ? SCAN.sLayers.length : SCAN.mLayers.length));
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.activeTexture(gl.TEXTURE9);   // tải lên ở ô texture riêng, không đụng texture đang dùng để vẽ
  const t0 = performance.now();
  while (U.i < U.list.length && performance.now() - t0 < 6) {   // tối đa ~6 ms mỗi khung hình
    const [m, l, idx] = U.list[U.i++];
    ["a", "n", "r"].forEach((k, j) => { const N = SZ[m * 3 + j]; gl.bindTexture(gl.TEXTURE_2D_ARRAY, SCAN.tex[m * 3 + j]); try { gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, idx, N, N, 1, gl.RGBA, gl.UNSIGNED_BYTE, l[k]); } catch (e) {} if (l[k]?.close && !Object.values(SOLID).includes(l[k])) try { l[k].close(); } catch (e) {} l[k] = null; });
  }
  while (U.i >= U.list.length && U.mi < U.models.length && performance.now() - t0 < 6) {
    const m = U.models[U.mi++]; m.ib = gl.createBuffer();
    m.gp = m.prims.map(p => { const vao = gl.createVertexArray(), vb = gl.createBuffer(), eb = gl.createBuffer(); gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, p.v, gl.STATIC_DRAW);
      [[0, 3, 0], [1, 2, 12], [2, 3, 20], [3, 1, 32]].forEach(([l, n, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 36, o); });
      gl.bindBuffer(gl.ARRAY_BUFFER, m.ib); for (let k = 0; k < 3; k++) { gl.enableVertexAttribArray(4 + k); gl.vertexAttribPointer(4 + k, 4, gl.FLOAT, false, 48, k * 16); gl.vertexAttribDivisor(4 + k, 1); }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eb); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, p.i, gl.STATIC_DRAW);
      gl.bindVertexArray(null); return { vao, vb, eb, n: p.i.length, type: p.i instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT }; });
    m.prims = null;
  }
  if (U.i < U.list.length || U.mi < U.models.length) return;   // khung hình sau làm tiếp
  U.mm = U.mm || 0; if (U.mm < SCAN.tex.length) { gl.bindTexture(gl.TEXTURE_2D_ARRAY, SCAN.tex[U.mm++]); gl.generateMipmap(gl.TEXTURE_2D_ARRAY); gl.activeTexture(gl.TEXTURE0); if (U.mm < SCAN.tex.length) return; }   // mỗi khung hình một mảng → card đồ họa không bị treo
  SCAN.gpu = true; SCAN.up = null;
  // bảng đổi lớp texture cũ → vật liệu thật (áp vào mọi lưới dựng sau đó)
  SCAN.rem = new Float32Array(LAYER.size + 1).fill(-1);
  for (const [key, i] of Object.entries(SCAN.surfIdx)) { const L = LAYER.get(T[key]); if (L != null) SCAN.rem[L] = 2000 + i; }
  scanRefresh();
}
// Dựng lại các tầng sau khi có tài nguyên (giữ nguyên chuỗi ngẫu nhiên của trận đấu → chơi online không lệch)
function scanRefresh() {
  for (const f of Object.values(FLOORS)) f._baseDirty = true;
  if (!F || !F.mesh) return; const sv = seed, mr = Math.random; let z = 99; Math.random = () => (z = (z * 16807) % 2147483647) / 2147483647;
  try { buildFloorMesh(F); } finally { Math.random = mr; seed = sv; }
}
makeMesh = (o => function (data, usage) {
  const R = SCAN.rem; if (R && data && data.length > 9) for (let i = 8; i < data.length; i += 9) { const L = data[i]; if (L >= 0 && L < R.length) { const r = R[L]; if (r >= 0) data[i] = r; } }
  return o(data, usage);
})(makeMesh);
let SCAN_U = null;
function scanBind() {
  if (!SCAN_U) SCAN_U = ["uSA", "uSN", "uSR", "uMA", "uMN", "uMR", "uInst"].map(n => gl.getUniformLocation(P3, n));
  if (!SCAN.gpu && SCAN.ready) { scanGPU(); gl.activeTexture(gl.TEXTURE0); }
  if (!SCAN.gpu) { for (let i = 0; i < 6; i++) gl.uniform1i(SCAN_U[i], 0); gl.uniform1i(SCAN_U[6], 0); return; }
  SCAN.tex.forEach((t, i) => { gl.activeTexture(gl.TEXTURE3 + i); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t); gl.uniform1i(SCAN_U[i], 3 + i); });
  gl.activeTexture(gl.TEXTURE0); gl.uniform1i(SCAN_U[6], 0);
}

// ---------- 6. ĐẶT MÔ HÌNH VÀO MAP ----------
function scanPlan(s) {
  if (!SCAN.gpu || !s.k || s.taken || s.open || s.broke) return null;
  const pl = scanLayoutOf(s); if (!pl) return null; const { L, p } = pl;
  for (const q of p) if (!SCAN.models[SCAN_MODELS[q[0]]]) return null;   // thiếu một phần → dùng đồ vẽ bằng code
  return { L, p };
}
function scanInstances(f) {
  const out = new Map(), TOP = {}, ck = s => Math.round(s.x * 2) + "," + Math.round(s.y * 2);
  const list = f.sprites.map(s => [s, scanPlan(s)]).filter(q => q[1]).sort((a, b) => (a[1].L.a === "mount") - (b[1].L.a === "mount"));   // đồ đứng trước, đồ treo tường sau
  for (const [s, pl] of list) { const { L, p } = pl;
    const d_ = s.k.startsWith("d_"), rot = s.rot ?? 0, H = (s.rh ?? f.room?.[Math.floor(s.y) * f.w + Math.floor(s.x)]?.h ?? WH) / M;
    const f0 = facing(rot), X = XF(s.x, d_ ? 0 : (s.base || 0), s.y, f0.c, f0.s, M), meta = RMETA[s.k];
    const tops = [];
    p.forEach(([key, px, pz, da = 0, py = 0], idx) => {
      const m = SCAN.models[SCAN_MODELS[key]], b = m.bb, bw = b[3] - b[0], bh = b[4] - b[1], bd = b[5] - b[2];
      let sc = 1; if (L.fit && meta && meta[0] > 0) sc = Math.min(1, meta[0] * 1.15 / bw, meta[1] * 1.25 / bd);
      if (bh * sc > H - .05) sc = (H - .05) / bh;
      const y0 = typeof py === "string" ? (tops[+py.slice(3)] ?? 0) : py, a = L.a, cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2;
      let yc = a === "mount" ? L.y(H) : 0;
      if (a === "mount") { const hh = bh * sc / 2, tall = TOP[ck(s)]; if (tall && tall > yc - hh - .03) { yc = tall + hh + .06; if (yc + hh > H - .04) return; } }   // không treo lồng vào tủ cao
      else if (a === "wall") TOP[ck(s)] = Math.max(TOP[ck(s)] || 0, y0 + bh * sc);
      const off = [-cx * sc, a === "mount" ? yc - (b[1] + b[4]) / 2 * sc : -b[1] * sc, a === "center" ? -cz * sc : -b[2] * sc];
      tops[idx] = y0 + (a === "mount" ? 0 : bh * sc);
      const P = X.p(px, y0, pz), g = facing(rot + da), c = g.c, sn = g.s, k = sc * M;
      const row = [c * k, 0, -sn * k, P[0] + (off[0] * c - off[2] * sn) * M, 0, k, 0, P[1] + off[1] * M, sn * k, 0, c * k, P[2] + (off[0] * sn + off[2] * c) * M];
      let e = out.get(m); if (!e) out.set(m, e = { rows: [], pos: [] }); e.rows.push(...row); e.pos.push(row[3], row[11], Math.hypot(bw, bh, bd) * k * .5 + .1);
    });
  }
  for (const e of out.values()) { e.rows = new Float32Array(e.rows); e.pos = new Float32Array(e.pos); e.buf = new Float32Array(e.rows.length); }
  f._scan = out;
}
furniture = (o => function (v, s) { if (SCAN.building && scanPlan(s)) return; return o(v, s); })(furniture);
buildFloorMesh = (o => function (f) {
  if (!SCAN.started && !SCAN.pend && SET.g3d !== "off" && Object.keys(FLOORS).length && LAYER.size) { SCAN.pend = 1; setTimeout(() => { SCAN.pend = 0; scanStart(); }, 60); }   // vào game là tự bật 3D (đợi map bày đồ xong)
  if (SCAN.ready && !SCAN.gpu) scanGPU();
  const on = SCAN.ready && SCAN.gpu; SCAN.building = on; try { o(f); } finally { SCAN.building = false; }
  if (on) scanInstances(f); else f._scan = null;
})(buildFloorMesh);
function scanDraw(f, eye, fw) {
  const S0 = f._scan; if (!S0 || !S0.size) return;
  gl.uniform1i(SCAN_U[6], 1);
  for (const [m, e] of S0) {
    let n = 0; const P = e.pos, R = e.rows, B = e.buf;
    for (let i = 0; i < P.length / 3; i++) { const dx = P[i * 3] - eye[0], dz = P[i * 3 + 1] - eye[2], r = P[i * 3 + 2], d = Math.hypot(dx, dz);
      if (d > 34 + r) continue; if (d > r + 1 && (dx * fw[0] + dz * fw[2]) / d < Math.cos(1.25) - r / d) continue;   // ngoài tầm nhìn
      B.set(R.subarray(i * 12, i * 12 + 12), n * 12); n++; }
    if (!n) continue;
    gl.bindBuffer(gl.ARRAY_BUFFER, m.ib); gl.bufferData(gl.ARRAY_BUFFER, B.subarray(0, n * 12), gl.DYNAMIC_DRAW);
    for (const p of m.gp) { gl.bindVertexArray(p.vao); gl.drawElementsInstanced(gl.TRIANGLES, p.n, p.type, 0, n); }
  }
  gl.bindVertexArray(null); gl.uniform1i(SCAN_U[6], 0);
}

// ---------- 7. BÁO TRẠNG THÁI (góc phải dưới) ----------
{
  const el = document.createElement("div"); el.id = "scanInfo"; document.body.appendChild(el);
  Object.assign(el.style, { position: "fixed", right: "10px", bottom: "8px", font: "12px sans-serif", color: "#b8a890", opacity: ".6", zIndex: 50, pointerEvents: "none", textShadow: "0 0 4px #000" });
  let doneAt = 0;
  setInterval(() => {
    let txt = "";
    if (!S.started) txt = "";   // menu: không hiện dòng trạng thái (bật/tắt 3D trong Cài đặt)
    else if (SCAN.started && !SCAN.done) txt = `Đang tải đồ họa 3D… ${Math.round(100 * SCAN.prog[0] / Math.max(1, SCAN.prog[1]))}%`;
    else if (SCAN.done && !doneAt) { doneAt = Date.now(); }
    if (S.started && SCAN.done && Date.now() - doneAt < 4000) txt = SCAN.ready ? "Đồ họa 3D thật: đã bật" : `Đồ họa 3D: ${SCAN.failed || "không tải được"} — đang dùng đồ họa thường`;
    if (!SCAN.started) doneAt = 0;
    el.textContent = txt; el.style.display = txt && !CUT.on ? "block" : "none";
  }, 500);
}
