// =====================================================================
//  34. BẢN 21: ma GÀO HÉT thành lời (có giới hạn âm lượng bảo vệ tai) · Bệnh viện: phải tự đi tìm đèn pin · map đặc biệt (khó)
// =====================================================================
// Giọng gào: cao độ vút lên rồi gãy xuống, rung giọng, khàn rè (méo tiếng) — đi qua dải cộng hưởng nguyên âm nên vẫn nghe ra nhịp lời nói
const GV_SCREAM = { child: { f0: 620, fk: 1.35 }, woman: { f0: 470, fk: 1.12 }, wet: { f0: 420, fk: 1.05 }, deep: { f0: 150, fk: .82 } };
GV.curve = null;
function ghostSpeak(text, o = {}) {
  if (!ac || !BUS || S.ending) return 0;
  const kind = o.kind || GV_MAPKIND[MAPID] || "woman", P = GV_KIND[kind], SC = GV_SCREAM[kind] || GV_SCREAM.woman, now = ac.currentTime;
  if (!GV.buf) { const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; GV.buf = b; }
  if (!GV.curve) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 3.2); } GV.curve = c; }
  const rel = o.rel ?? (Math.random() < .55 ? Math.PI * (.8 + Math.random() * .4) : (Math.random() < .5 ? -1 : 1) * Math.PI * (.42 + Math.random() * .16)), dist = o.dist ?? (.6 + Math.random() * .7);
  const pn = ac.createPanner(); pn.panningModel = "HRTF"; pn.distanceModel = "inverse"; pn.refDistance = .8; pn.rolloffFactor = 1;
  const px = Math.sin(rel) * dist, pz = -Math.cos(rel) * dist; if (pn.positionX) { pn.positionX.value = px; pn.positionY.value = .05; pn.positionZ.value = pz; } else pn.setPosition(px, .05, pz);
  // Chuỗi bảo vệ tai: nén mạnh + trần âm lượng cố định, không phụ thuộc khoảng cách
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -26; comp.knee.value = 4; comp.ratio.value = 14; comp.attack.value = .003; comp.release.value = .2;
  const out = ac.createGain(), cap = ac.createGain(); out.gain.value = 1; cap.gain.value = .32 * Math.min(1, o.vol ?? 1);
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5200;   // cắt tần số chói gắt
  out.connect(comp); comp.connect(lp); lp.connect(cap); cap.connect(pn); pn.connect(BUS.sfx);
  const dl = ac.createDelay(); dl.delayTime.value = .21; const fb = ac.createGain(); fb.gain.value = .3; const dlp = ac.createBiquadFilter(); dlp.frequency.value = 1400; const ds = ac.createGain(); ds.gain.value = .22;   // vọng hành lang
  cap.connect(ds); ds.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(BUS.sfx);
  const words = text.replace(/[“”"]/g, "").split(/\s+/).filter(w => /[\p{L}\d]/u.test(w)); let at = now + .06;
  const noiseAt = (t0, dur, dest) => { const s = ac.createBufferSource(); s.buffer = GV.buf; s.connect(dest); s.start(t0, Math.random() * 1.5, dur + .1); };
  words.forEach((w, wi) => {
    const last = wi === words.length - 1, dur = (.24 + Math.random() * .12) * (last ? 2.4 : 1), f0 = SC.f0 * (.9 + Math.random() * .25) * (1 + wi * .03), v1 = gvPick(GV_VOW), v2 = gvPick(GV_VOW);
    const env = ac.createGain(), pk = .55 + Math.random() * .25; env.gain.setValueAtTime(0, at); env.gain.linearRampToValueAtTime(pk, at + .04); env.gain.setValueAtTime(pk * .9, at + dur * .7); env.gain.linearRampToValueAtTime(0, at + dur + .08); env.connect(out);
    const sh = ac.createWaveShaper(); sh.curve = GV.curve; sh.oversample = "2x"; const pre = ac.createGain(); pre.gain.value = 1.6; pre.connect(sh);
    const mk = (type, mul, g) => { const o2 = ac.createOscillator(), gg = ac.createGain(); o2.type = type; o2.frequency.setValueAtTime(f0 * mul, at); o2.frequency.linearRampToValueAtTime(f0 * mul * (last ? 1.45 : 1.25), at + dur * .3); o2.frequency.linearRampToValueAtTime(f0 * mul * (last ? .62 : .85), at + dur);
      const lf = ac.createOscillator(), lg = ac.createGain(); lf.frequency.value = 6 + Math.random() * 5; lg.gain.value = f0 * mul * .05; lf.connect(lg); lg.connect(o2.frequency); gg.gain.value = g; o2.connect(gg); gg.connect(pre); o2.start(at); lf.start(at); o2.stop(at + dur + .1); lf.stop(at + dur + .1); };
    mk("sawtooth", 1, .55); mk("square", 1.007, .22); if (kind === "deep") mk("sawtooth", .5, .4);   // giọng trầm có thêm quãng tám dưới gầm gừ
    const rasp = ac.createBiquadFilter(); rasp.type = "bandpass"; rasp.frequency.value = 2200; rasp.Q.value = .8; const rg = ac.createGain(); rg.gain.value = .5; rasp.connect(rg); rg.connect(pre); noiseAt(at, dur, rasp);   // tiếng khàn rè của cổ họng
    [[0, 1], [1, .75], [2, .4]].forEach(([i, g]) => { const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 5; bp.frequency.setValueAtTime(v1[i] * SC.fk * 1.15, at); bp.frequency.linearRampToValueAtTime(v2[i] * SC.fk * 1.15, at + dur); const gg = ac.createGain(); gg.gain.value = g * 1.8; sh.connect(bp); bp.connect(gg); gg.connect(env); });
    const dry = ac.createGain(); dry.gain.value = .12; sh.connect(dry); dry.connect(env);
    if (Math.random() < .5) { const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000 + Math.random() * 2500; const cg = ac.createGain(); cg.gain.setValueAtTime(.25, at); cg.gain.linearRampToValueAtTime(0, at + .07); hp.connect(cg); cg.connect(out); noiseAt(at, .08, hp); }
    at += dur + .05 + (/[.,…!?]$/.test(w) ? .25 : 0);
  });
  { const bl = ac.createBiquadFilter(); bl.type = "bandpass"; bl.frequency.value = 700; const bg = ac.createGain(); bg.gain.setValueAtTime(0, at); bg.gain.linearRampToValueAtTime(.5, at + .1); bg.gain.linearRampToValueAtTime(0, at + .9); bl.connect(bg); bg.connect(out); noiseAt(at, .95, bl); }   // tiếng thở dốc sau khi gào
  const total = at + 1 - now;
  BUS.music.gain.setTargetAtTime(SET.music / 100 * .9 * .4, now, .12); clearTimeout(GV.duck); GV.duck = setTimeout(() => BUS && BUS.music.gain.setTargetAtTime(SET.music / 100 * .9, ac.currentTime, .8), total * 1000);
  try { if (window.speechSynthesis && SET.ghostTTS !== false) { const vs = speechSynthesis.getVoices().filter(v => /^vi/i.test(v.lang)); if (vs.length) { const u = new SpeechSynthesisUtterance(text.replace(/\.\.\./g, "! ")); u.voice = vs[0]; u.lang = vs[0].lang; u.pitch = Math.min(2, P.pitch + .5); u.rate = Math.max(.5, P.rate + .15); u.volume = Math.min(.45, .35 * (o.vol ?? 1) * SET.master / 100 * SET.sfx / 100 * 1.6); speechSynthesis.cancel(); speechSynthesis.speak(u); } } } catch (e) {}
  const side = Math.cos(rel) < -.35 ? "behind" : Math.sin(rel) > .3 ? "right" : Math.sin(rel) < -.3 ? "left" : "front";
  setTimeout(() => { gvSub(text.toUpperCase().replace(/\.\.\.$/, "!!"), side); const el = $("gvoice"); if (el) { el.style.fontStyle = "normal"; el.style.fontWeight = "700"; el.style.textShadow = "0 0 6px #000,0 0 16px rgba(220,0,0,1)"; el.style.animation = "gvShake .09s infinite"; setTimeout(() => el.style.animation = "", total * 1000); } }, 80);
  return total;
}
(() => { const st = document.createElement("style"); st.textContent = "@keyframes gvShake{0%{translate:0 0}25%{translate:2px -1px}50%{translate:-2px 1px}75%{translate:1px 2px}100%{translate:0 0}} #mapCards a.hardMap{color:#ff4a3a!important;text-shadow:0 0 10px rgba(255,0,0,.7)!important;animation:hardPulse 2.4s infinite} #mapCards a.hardMap .hb{display:inline-block;margin-left:8px;padding:1px 6px;font-size:.62em;letter-spacing:.08em;border:1px solid #ff3a2a;border-radius:3px;color:#ffd0c8;background:rgba(140,0,0,.55);vertical-align:middle} @keyframes hardPulse{50%{text-shadow:0 0 18px rgba(255,0,0,1)}} #hardWarn{margin:6px 0 10px;padding:7px 10px;border:1px solid rgba(255,40,30,.7);background:rgba(90,0,0,.45);color:#ffb8b0;font-size:13px;line-height:1.45;border-radius:4px}"; document.head.appendChild(st); })();

// ---- Bệnh viện: đèn pin là đồ vật phải tự đi tìm ----
const TORCH_SPOTS = [[8.0, 5.4, 1.14], [31.5, 12, .76], [7.8, 28.2, .93], [19.52, 11, .46], [41, 6, .95], [52, 23.5, 0], [18.5, 24.5, 0], [24, 13.5, 0], [43.5, 13.5, .95], [12.5, 14.5, 0]];
const _buildHosp = buildHospital;
buildHospital = function () {
  _buildHosp(); const a = FLOORS.h1, spots = TORCH_SPOTS.slice().sort(() => Math.random() - .5), n = (typeof COOP !== "undefined" && COOP) ? 2 : 1;
  for (let i = 0; i < n; i++) { const [x, y, h] = spots[i], s = { x, y, k: "r_torchItem", rot: Math.random() * 6.28, base: h * M, act: "torch", reach: 1.6, wide: .3 }; a.sprites.push(s); a.lights.push({ x, y, h: h * M + .08, i: .16, r: .3, g: 1, b: .4, f: 2.2, cond: () => !s.taken }); }
};
HOSPITAL.build = buildHospital;
RMETA.r_torchItem = [.3, .3]; hospModel.keys.add("r_torchItem");
{ const _hm = hospModel; hospModel = function (v, s) { if (s.k !== "r_torchItem") return _hm(v, s); if (s.taken) return true;
    const f0 = facing(s.rot || 0), X = XF(s.x, s.base || 0, s.y, f0.c, f0.s, M);
    pcylX(v, X, .025, 0, -.1, .07, .019, 10, T.dark, T.dark); pcylX(v, X, .03, 0, .07, .13, .03, 12, T.metal, T.glassG || T.bulbOn); pbox(v, X, -.02, .045, -.008, .01, .05, .008, T.hBloodM);   // đèn pin cũ, mắt kính phát quang mờ
    return true; }; hospModel.keys = _hm.keys; }
HOSPITAL.SPRITE_ACTS.torch = s => { s.taken = true; buildFloorMesh(FLOORS.h1); player.torch = 1; player.lightOn = true; player.battery = Math.max(player.battery, 55); noise(.08, 2800, .3); TUT.light = 1;
  say("Bạn nhặt được một chiếc đèn pin cũ, thân dính máu khô. Bấm F để bật/tắt — pin không còn nhiều đâu."); renderTasks?.(); };
HOSPITAL.SPRITE_NAMES.torch = "Nhặt đèn pin";
toggleLight = (o => function (p) { if (MAPID === "hospital" && p && !p.torch) { if (p === P1 && !REMOTE) say("Bạn không có đèn pin. Phải tìm một chiếc trong bóng tối — thử ở quầy, bàn làm việc, xe đẩy dụng cụ..."); return; } return o(p); })(toggleLight);
hospLive = (o => function (dt) { for (const p of [P1, P2]) if (p && !p.torch) p.lightOn = false; return o(dt); })(hospLive);
HOSPITAL.GOALS.unshift([() => P1.torch, "Quá tối! Mò tìm một chiếc đèn pin trong khu tiếp nhận tầng 1 (quầy, bàn làm việc, xe đẩy, sàn nhà...). Ánh xanh mờ là mắt kính đèn.", "Tìm đèn pin."]);
// ---- Map đặc biệt: độ khó cao hơn mọi cấp ----
MAPS.hospital.hard = 1; MAPS.hospital.tag = "☠ MAP ĐẶC BIỆT · KHÓ NHẤT · 3 tầng · không có đèn pin khi bắt đầu";
const _hospStart = HOSPITAL.start;
HOSPITAL.start = function () { _hospStart(); P1.torch = 0; P1.lightOn = false; };
HOSPITAL.count = () => D.ghosts + 1;   // luôn thêm một kẻ săn đuổi
buildMenus = (o => function () { o();
  for (const a of $("mapCards").children) if (MAPS[a.dataset.id]?.hard) { a.classList.add("hardMap"); const b = document.createElement("span"); b.className = "hb"; b.textContent = "☠ KHÓ"; a.appendChild(b); }
  const info = $("mapInfo"); let w = $("hardWarn"); if (!w) { w = document.createElement("div"); w.id = "hardWarn"; info.parentNode.insertBefore(w, info); }
  const upd = () => { const h = MAPS[MAPID]?.hard; w.style.display = h ? "block" : "none"; w.innerHTML = "☠ <b>MAP ĐẶC BIỆT — ĐỘ KHÓ CAO NHẤT</b><br>Ở mọi cấp độ: Viện trưởng nhanh hơn, thêm một kẻ săn đuổi, ít pin hơn — và bạn bắt đầu <b>không có đèn pin</b>."; };
  for (const a of $("mapCards").children) a.addEventListener("click", upd); upd();
})(buildMenus);
buildMenus();
