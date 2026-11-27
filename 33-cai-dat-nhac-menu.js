// =====================================================================
//  11. CÀI ĐẶT · NHẠC NỀN · MENU
// =====================================================================
const SKEY = "dem-am-anh-settings";
const SET = Object.assign({ bri: 30, ao: true, hfov: 100, master: 80, music: 70, sfx: 90, sens: 5, invert: false, fov: 75, bright: 100, quality: "sieu", fx: true, fps: false },
  (() => { try { return JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { return {}; } })());
if (!SET.v24) { if (SET.quality === "net" || SET.quality === "ratnet") SET.quality = "sieu"; SET.v24 = 1; }   // bản 24: mặc định đồ họa 4K
function saveSet() { try { localStorage.setItem(SKEY, JSON.stringify(SET)); } catch (e) { } }
let BUS = null;
function applySet() {
  if (BUS) { BUS.master.gain.value = SET.master / 100; BUS.music.gain.value = SET.music / 100 * .9; BUS.sfx.gain.value = SET.sfx / 100; }
  SCALE = RESO[SET.quality][1]; resize(); if (SET.quality === "sieu") SCALE = Math.max(1, Math.min(2, 3840 / Math.max(1, cv.width))); PERF.base = null; $("fps").classList.toggle("hidden", !SET.fps);
}
const SETTINGS_UI = [
  ["Âm lượng tổng", "master", "range", 0, 100], ["Nhạc nền", "music", "range", 0, 100], ["Hiệu ứng âm thanh", "sfx", "range", 0, 100],
  ["Độ nhạy chuột", "sens", "range", 1, 10], ["Đảo trục chuột dọc", "invert", "check"], ["Góc nhìn ngang (FOV)", "hfov", "range", 80, 120], ["Độ sáng", "bri", "range", 0, 100], ["Bóng tối góc cạnh", "ao", "check"],
  ["Chất lượng đồ họa", "quality", "select", { nhanh: "Nhanh", net: "Nét", ratnet: "Rất nét", sieu: "4K (siêu nét)" }], ["Hiện FPS", "fps", "check"],
];

// ---- Âm thanh: mở khóa ngay khi người chơi nhấp chuột (trình duyệt chặn âm thanh tự phát) ----
function ensureAudio() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    BUS = { master: ac.createGain(), music: ac.createGain(), sfx: ac.createGain() };
    BUS.music.connect(BUS.master); BUS.sfx.connect(BUS.master); BUS.lim = ac.createDynamicsCompressor(); BUS.lim.threshold.value = -8; BUS.lim.knee.value = 4; BUS.lim.ratio.value = 20; BUS.lim.attack.value = .002; BUS.lim.release.value = .2; BUS.master.connect(BUS.lim); BUS.lim.connect(ac.destination);   // giới hạn đỉnh, bảo vệ tai applySet();
  }
  if (ac.state === "suspended") ac.resume();
}
["click", "keydown", "pointerdown"].forEach(ev => addEventListener(ev, () => { if (ac && ac.state === "suspended") ac.resume(); }));

// ---- Nhạc nền kinh dị tự tạo: lớp khám phá + lớp căng thẳng + lớp RƯỢT ĐUỔI ----
let CHASING = 0;
const Music = {
  nodes: [], timers: [], tv: 0, cv: 0, step: 0,
  keep(n) { this.nodes.push(n); return n; },
  start(map) {
    this.stop(); const A = ac, cfg = MUSIC_CFG[map] || MUSIC_CFG.house; this.cfg = cfg; this.map = map;
    this.out = A.createGain(); this.out.gain.value = 1; this.out.connect(BUS.music);
    const rv = A.createConvolver(), len = A.sampleRate * 3.5, ib = A.createBuffer(2, len, A.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ib.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
    rv.buffer = ib; this.wet = A.createGain(); this.wet.gain.value = .8; this.wet.connect(rv); rv.connect(this.out); this.dry = A.createGain(); this.dry.gain.value = .7; this.dry.connect(this.out);
    const osc = (type, f, dest, det = 0) => { const o = this.keep(A.createOscillator()); o.type = type; o.frequency.value = f; o.detune.value = det; o.connect(dest); o.start(); return o; };
    // 1. Nền trầm + lớp giữa nghe rõ trên loa laptop
    const lp = A.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 3;
    const lfo = osc("sine", .045, A.createGain()); const lg = A.createGain(); lg.gain.value = 450; lfo.disconnect(); lfo.connect(lg); lg.connect(lp.frequency);
    const dg = A.createGain(); dg.gain.value = .045; this.dgn = dg; lp.connect(dg); dg.connect(this.dry); dg.connect(this.wet);
    cfg.drone.forEach((f, i) => { osc("sawtooth", f, lp, (Math.random() - .5) * 12); osc(cfg.wave || "sawtooth", f * 4, lp, (i - 1) * 9); });
    // 2. Lớp căng thẳng (vĩ cầm rít) — to dần khi ma lại gần
    this.tg = A.createGain(); this.tg.gain.value = 0; this.tg.connect(this.dry); this.tg.connect(this.wet);
    [cfg.root * 16, cfg.root * 16 * 1.0595, cfg.root * 22.6].forEach(f => {
      const bp = A.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = 1.5; const tr = A.createGain(); tr.gain.value = .5;
      const l = osc("sine", 6 + Math.random() * 3, A.createGain()); const lg2 = A.createGain(); lg2.gain.value = .5; l.disconnect(); l.connect(lg2); lg2.connect(tr.gain);
      osc("sawtooth", f, bp); bp.connect(tr); tr.connect(this.tg);
    });
    // 3. Lớp rượt đuổi: trống dồn + ostinato + vĩ cầm chói (bộ đếm nhịp 136 BPM)
    this.cg = A.createGain(); this.cg.gain.value = 0; this.cg.connect(this.out); this.cgw = A.createGain(); this.cgw.gain.value = .25; this.cg.connect(this.cgw); this.cgw.connect(this.wet);
    this.nextT = A.currentTime + .1; this.step = 0;
    this.seq = setInterval(() => { while (this.nextT < ac.currentTime + .12) { this.tick(this.step++, this.nextT); this.nextT += 60 / (this.cfg.bpm || 136) / 4; } }, 25);
    const EV = { menu: [9, 15], house: [16, 26], forest: [6, 12], castle: [7, 13], cemetery: [8, 14], factory: [6, 11] }[map] || [4, 8];
    this.songStart(map); if (map !== "menu") this.loop(() => this.stinger(), 80, 150);
    if (cfg.amb) cfg.amb();
  },
  stop() { clearInterval(this.sTimer); this.song = null; this.timers.forEach(clearTimeout); this.timers = []; clearInterval(this.seq); this.nodes.forEach(n => { try { n.stop(); } catch (e) { } }); this.nodes = []; if (this.out) { this.out.gain.setTargetAtTime(0, ac.currentTime, .3); } },
  loop(fn, a, b) { const f = () => { if (!S.ending) fn(); this.timers.push(setTimeout(f, (a + Math.random() * (b - a)) * 1000)); }; this.timers.push(setTimeout(f, a * 1000)); },
  note(freq, start, dur, vol, type, att = .01, wet = 1, dest) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = freq; o.detune.value = (Math.random() - .5) * 16;
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(vol, start + att); g.gain.exponentialRampToValueAtTime(.0001, start + dur);
    o.connect(g); if (dest) g.connect(dest); else { g.connect(this.dry); if (wet) g.connect(this.wet); } o.start(start); o.stop(start + dur + .1); return o;
  },
  hit(start, freq, dur, vol, dest, q = 1) {
    const len = ac.sampleRate * dur, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q; const g = ac.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(dest); s.start(start);
  },
  pad() { if (this.cfg.pad) return this.cfg.pad(this); const c = this.cfg, t0 = ac.currentTime, iv = [1, 3, 6, 8, 11, 13]; [0, iv[Math.floor(Math.random() * 6)], iv[Math.floor(Math.random() * 6)] + 12].forEach(i => this.note(c.root * 4 * Math.pow(2, i / 12), t0, 8, .03, c.padWave || "sawtooth", 3)); },
  motif() { if (this.cfg.motif) return this.cfg.motif(this); const c = this.cfg, t0 = ac.currentTime, n = 1 + Math.floor(Math.random() * 4); for (let k = 0; k < n; k++) { const deg = c.scale[Math.floor(Math.random() * c.scale.length)] + 12 * Math.floor(Math.random() * 2); c.voice(this, c.root * 8 * Math.pow(2, deg / 12), t0 + k * (.35 + Math.random() * .5)); } },
  stinger() {   // tiếng "vút" dựng tóc gáy
    const t0 = ac.currentTime, len = ac.sampleRate * 2.5, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(i / len, 3);
    const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(3000, t0 + 2.5); const g = ac.createGain(); g.gain.value = .5;
    s.connect(f); f.connect(g); g.connect(this.dry); g.connect(this.wet); s.start(t0);
    this.note(this.cfg.root, t0 + 2.45, 3, .35, "sine", .005); this.hit(t0 + 2.45, 120, 1.5, .8, this.wet);
    [0, 1, 6].forEach(i => this.note(this.cfg.root * 8 * Math.pow(2, i / 12), t0 + 2.45, 2.5, .05, "sawtooth", .01));
  },
  tick(st, at) {
    const c = this.cv; if (c < .05) return; const D_ = this.cg, root = this.cfg.root; if (this.cfg.tick) return this.cfg.tick(this, st, at, D_);
    if (st % 4 === 0) { this.note(70, at, .35, .9, "sine", .002, 0, D_); this.hit(at, 90, .25, .9, D_); }                          // trống cái
    if (st % 8 === 4) this.hit(at, 1900, .18, .7, D_, .8);                                                                          // trống lẫy
    if (st % 16 === 14 || st % 16 === 15) this.note(70, at, .2, .6, "sine", .002, 0, D_);
    const pat = this.cfg.ostinato || [0, 0, 12, 0, 1, 0, 12, 0, 0, 0, 12, 0, 6, 0, 7, 6];
    this.note(root * 2 * Math.pow(2, pat[st % 16] / 12), at, .14, .22, "sawtooth", .004, 0, D_);                                   // dây trầm staccato
    if (st % 32 === 0) [0, 1, 2].forEach(i => this.note(root * 32 * Math.pow(2, i / 12), at, 1.8, .045, "sawtooth", .3, 0, D_));   // vĩ cầm chói
    if (st % 64 === 32) this.hit(at, 4000, 1.2, .25, D_, .5);
  },
  update(prox, chase) {
    this.tv = prox; if (this.tg) this.tg.gain.setTargetAtTime(prox * .03, ac.currentTime, .5); if (this.sg) this.sg.gain.setTargetAtTime(1 - this.cv * .7, ac.currentTime, .6);
    const target = chase ? Math.max(.55, prox) : prox * .4; this.cv += (target - this.cv) * (target > this.cv ? .2 : .05); if (this.cg) this.cg.gain.setTargetAtTime(this.cv * .85, ac.currentTime, .25);
    if (this.dry) this.dry.gain.setTargetAtTime(.7 * (1 - this.cv * .4), ac.currentTime, .5);
  },
};
function forestAmb() {
  const len = ac.sampleRate * 4, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = Music.keep(ac.createBufferSource()); src.buffer = b; src.loop = true; const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 420; bp.Q.value = .8;
  const g = ac.createGain(); g.gain.value = .35; const l = Music.keep(ac.createOscillator()), lg = ac.createGain(); l.frequency.value = .08; lg.gain.value = .25; l.connect(lg); lg.connect(g.gain); l.start();
  src.connect(bp); bp.connect(g); g.connect(BUS.sfx); src.start();
  Music.loop(() => { const n = ac.currentTime; for (let i = 0; i < 3 + Math.random() * 4; i++) { const o = ac.createOscillator(), gg = ac.createGain(); o.frequency.value = 4300 + Math.random() * 300; gg.gain.setValueAtTime(0, n + i * .09); gg.gain.linearRampToValueAtTime(.006, n + i * .09 + .01); gg.gain.linearRampToValueAtTime(0, n + i * .09 + .05); o.connect(gg); gg.connect(BUS.sfx); o.start(n + i * .09); o.stop(n + i * .09 + .06); } }, .7, 2.5);
  Music.loop(() => { const n = ac.currentTime; [0, .5].forEach((dd, i) => { const o = ac.createOscillator(), gg = ac.createGain(); o.frequency.setValueAtTime(i ? 360 : 400, n + dd); o.frequency.linearRampToValueAtTime(i ? 330 : 370, n + dd + .35); gg.gain.setValueAtTime(0, n + dd); gg.gain.linearRampToValueAtTime(.05, n + dd + .05); gg.gain.exponentialRampToValueAtTime(.0001, n + dd + .45); o.connect(gg); gg.connect(Music.wet); o.start(n + dd); o.stop(n + dd + .5); }); }, 18, 40);
}
function cemAmb() {
  forestAmb();
  Music.loop(() => { const n = ac.currentTime; for (let i = 0; i < 3; i++) { Music.note(98, n + i * 2.6, 4, .12, "sine", .005); Music.note(98 * 2.76, n + i * 2.6, 2.5, .04, "sine", .005); } }, 40, 70);   // chuông chùa xa
  Music.loop(() => { const n = ac.currentTime; for (let i = 0; i < 2 + Math.random() * 3; i++) Music.hit(n + i * .3, 1400, .25, .4, BUS.sfx, 4); }, 15, 35);          // quạ kêu
}
function factoryAmb() {
  const o = Music.keep(ac.createOscillator()), g = ac.createGain(); o.type = "sawtooth"; o.frequency.value = 50; const lp = ac.createBiquadFilter(); lp.frequency.value = 160; g.gain.value = .12; o.connect(lp); lp.connect(g); g.connect(BUS.sfx); o.start();
  Music.loop(() => { const n = ac.currentTime; Music.hit(n, 2500 + Math.random() * 2000, .6, .5, Music.wet, 6); Music.note(180 + Math.random() * 400, n, 1.8, .05, "triangle", .002); }, 6, 16);   // tiếng kim loại va
  Music.loop(() => { const n = ac.currentTime; Music.hit(n, 5000, 1.6, .25, BUS.sfx, .3); }, 20, 40);   // xì hơi nước
}
function castleAmb() {
  Music.loop(() => { const n = ac.currentTime; [0, 3, 7, 10].forEach((i, k) => Music.note(65.4 * Math.pow(2, i / 12) * 2, n + k * .05, 6, .03, "square", 1.5)); }, 25, 45);   // đàn organ
  Music.loop(() => { Music.hit(ac.currentTime, 500, 2, .4, Music.wet, .6); }, 12, 30);   // gió hú qua khe đá
}

// ---- Chủ đề âm nhạc riêng của từng map ----
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);   // số MIDI -> tần số
function voiceBox(m, f, t0, vol = .07) { m.note(f, t0, 2.4, vol, "triangle", .003); m.note(f * 2.003, t0, 1.1, vol * .3, "sine", .003); m.note(f * 3.98, t0, .5, vol * .12, "sine", .003); }
function voiceFlute(m, f, t0, dur = 2.6, vol = .07) {
  const o = m.note(f, t0, dur, vol, "sine", .35); const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.2; lg.gain.value = f * .008; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur);
  m.hit(t0, f * 2, .5, .05, m.wet, 6);   // hơi thở
}
function voiceOrgan(m, f, t0, dur = 3, vol = .035) { [1, 2, 3, 4].forEach((h, i) => m.note(f * h, t0, dur, vol / (i + 1), i % 2 ? "sine" : "square", .08)); }
function voiceHarpsi(m, f, t0, vol = .05) { m.note(f, t0, .8, vol, "sawtooth", .002); m.note(f * 2, t0, .4, vol * .4, "square", .002); }
function voiceErhu(m, f0, f1, t0, dur = 2.4, vol = .06) {   // đàn nhị: vuốt nốt + rung
  const o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter(); o.type = "sawtooth"; bp.type = "bandpass"; bp.frequency.value = f1 * 2.5; bp.Q.value = 1.2;
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + .35);
  const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 6; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f1 * .015, t0 + dur * .6); l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .2); g.gain.setValueAtTime(vol, t0 + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(bp); bp.connect(g); g.connect(m.dry); g.connect(m.wet); o.start(t0); o.stop(t0 + dur + .05); l.start(t0); l.stop(t0 + dur);
}
function voiceChoir(m, f, t0, dur = 7, vol = .02) {   // dàn hợp xướng "aaa" (lọc formant)
  [0, 7, 12].forEach(iv => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f * Math.pow(2, iv / 12); o.detune.value = (Math.random() - .5) * 20;
    const g = ac.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 2.5); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    for (const [ff, q] of [[730, 8], [1090, 9]]) { const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = ff; bp.Q.value = q; o.connect(bp); bp.connect(g); }
    g.connect(m.wet); g.connect(m.dry); o.start(t0); o.stop(t0 + dur + .1); });
}
function voiceDist(m, f, t0, dur, vol) {   // bass méo tiếng (nhà máy)
  const o = ac.createOscillator(), ws = ac.createWaveShaper(), g = ac.createGain(), lp = ac.createBiquadFilter(), c = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 6); } ws.curve = c; o.type = "sawtooth"; o.frequency.value = f; lp.frequency.value = 900;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(ws); ws.connect(lp); lp.connect(g); g.connect(m.cg); o.start(t0); o.stop(t0 + dur + .05);
}
const MUSIC_CFG = {
  menu: { root: 41.2, drone: [41.2, 43.7], bpm: 60,
    motif(m) { const t0 = ac.currentTime; [69, 72, 71, 69, 64].forEach((n, i) => Math.random() < .85 && voiceBox(m, NOTE(n - 12) * (1 - i * .003), t0 + i * .6, .05)); },
    pad(m) { voiceChoir(m, NOTE(45), ac.currentTime, 9, .012); } },
  // CĂN NHÀ: bài ru hộp nhạc lệch tông, chập chờn
  house: { root: 55, drone: [55, 58.3, 41.2], bpm: 150,
    motif(m) { const t0 = ac.currentTime, mel = [69, 72, 71, 69, 64, 65, 64, 62, 64, 69, 72, 71, 69, 68, 69]; mel.forEach((n, i) => { if (Math.random() < .9) voiceBox(m, NOTE(n) * (1 - i * .0025), t0 + i * .48 + Math.random() * .04, .06); }); },
    pad(m) { const t0 = ac.currentTime; [57, 60, 64].forEach(n => m.note(NOTE(n - 12), t0, 8, .02, "triangle", 3)); },
    tick(m, st, at, D_) { if (st % 4 === 0) { m.note(62, at, .3, .9, "sine", .002, 0, D_); m.note(58, at + .18, .25, .6, "sine", .002, 0, D_); }
      voiceBoxTo(m, NOTE([81, 84, 83, 81, 76, 77, 76, 74][st % 8]) * (1 + Math.sin(st) * .004), at, D_);
      if (st % 32 === 0) [0, 1].forEach(i => m.note(NOTE(93 + i), at, 2, .05, "sawtooth", .2, 0, D_)); } },
  // TRONG RỪNG: sáo trầm ngũ cung, gió, trống gỗ
  forest: { root: 49, drone: [49, 51.9, 36.7], bpm: 116, amb: forestAmb,
    motif(m) { const t0 = ac.currentTime, sc = [55, 58, 60, 62, 65, 67]; let n = sc[Math.floor(Math.random() * 6)]; for (let i = 0; i < 2 + Math.random() * 3; i++) { voiceFlute(m, NOTE(n), t0 + i * 1.3, 1.6 + Math.random()); n = sc[Math.floor(Math.random() * 6)]; } },
    pad(m) { m.note(NOTE(31), ac.currentTime, 9, .06, "sine", 3); },
    tick(m, st, at, D_) { if ([0, 3, 6, 10, 12].includes(st % 16)) { m.note(st % 16 === 0 ? 55 : 82, at, .4, .9, "sine", .002, 0, D_); m.hit(at, 300, .15, .5, D_); }
      if (st % 2 === 0) m.hit(at, 3200, .04, .15, D_, 3); if (st % 8 === 0) m.note(NOTE(43 + [0, 0, 1, 0][(st / 8) % 4]), at, .9, .25, "sawtooth", .01, 0, D_); } },
  // LÂU ĐÀI: đàn organ nhà thờ, harpsichord, trống định âm
  castle: { root: 43.65, drone: [43.65, 46.25, 65.4], bpm: 132, amb: castleAmb, wave: "square",
    motif(m) { const t0 = ac.currentTime, arp = [62, 65, 69, 74, 69, 65, 61, 64, 69, 73, 69, 64]; arp.forEach((n, i) => voiceHarpsi(m, NOTE(n), t0 + i * .18, .035)); },
    pad(m) { const t0 = ac.currentTime, ch = [[38, 50, 53, 57], [34, 50, 53, 58], [31, 50, 55, 58], [33, 49, 52, 57]][Math.floor(Math.random() * 4)]; ch.forEach(n => voiceOrgan(m, NOTE(n), t0, 6, .022)); },
    tick(m, st, at, D_) { if (st % 8 === 0 || st % 16 === 6) { m.note(NOTE(38), at, .8, .7, "sine", .002, 0, D_); m.hit(at, 140, .6, .7, D_); }
      if (st % 2 === 0) voiceHarpsiTo(m, NOTE([62, 74, 69, 74, 61, 73, 69, 73][(st / 2) % 8]), at, D_);
      if (st % 16 === 0) [50, 53, 57].forEach(n => m.note(NOTE(n), at, 1.2, .06, "square", .01, 0, D_)); } },
  // NGHĨA TRANG: đàn nhị điệu oán, hợp xướng ma quái, chuông chùa, trống chầu
  cemetery: { root: 46.25, drone: [46.25, 49, 34.6], bpm: 104, amb: cemAmb,
    motif(m) { const t0 = ac.currentTime, sc = [57, 60, 62, 63, 67, 69, 72]; let p = sc[Math.floor(Math.random() * 7)]; for (let i = 0; i < 2 + Math.random() * 2; i++) { const q = sc[Math.floor(Math.random() * 7)]; voiceErhu(m, NOTE(p), NOTE(q), t0 + i * 2.2, 2.6); p = q; } },
    pad(m) { voiceChoir(m, NOTE(45 + [0, 3, -2][Math.floor(Math.random() * 3)]), ac.currentTime, 9, .016); },
    tick(m, st, at, D_) { if (st % 4 === 0) { m.note(70, at, .5, .9, "sine", .002, 0, D_); m.hit(at, 200, .3, .6, D_); } if (st % 16 === 12) m.hit(at, 6000, 1.1, .35, D_, .4);
      if (st % 4 === 2) m.hit(at, 900, .1, .4, D_, 2); if (st % 8 === 0) voiceErhuTo(m, NOTE([57, 58, 57, 63][(st / 8) % 4]), at, D_); } },
  // NHÀ MÁY: nhịp máy móc, kim loại va đập, bass méo, còi báo động
  factory: { root: 51.9, drone: [51.9, 55, 38.9], bpm: 158, amb: factoryAmb,
    motif(m) { const t0 = ac.currentTime; for (let i = 0; i < 8; i++) if (Math.random() < .6) { m.hit(t0 + i * .25, 2500 + Math.random() * 3000, .3, .25, m.wet, 8); m.note(NOTE(76 + [0, 1, 6][i % 3]), t0 + i * .25, .3, .02, "triangle", .002); } },
    pad(m) { const t0 = ac.currentTime; [0, 1, 6].forEach(i => m.note(NOTE(43 + i), t0, 7, .03, "sawtooth", 2.5)); },
    tick(m, st, at, D_) { if (st % 4 === 0) { m.note(60, at, .25, 1, "sine", .001, 0, D_); m.hit(at, 80, .2, .9, D_); } if (st % 4 === 2) m.hit(at, 2400, .12, .6, D_, 1.5);
      if (st % 2 === 1) m.hit(at, 7000, .05, .2, D_, 4); voiceDist(m, NOTE([31, 31, 43, 31, 32, 31, 43, 37][st % 8]), at, .12, .18);
      if (st % 64 === 0) { const o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; o.frequency.setValueAtTime(600, at); for (let k = 0; k < 4; k++) { o.frequency.linearRampToValueAtTime(900, at + k * .8 + .4); o.frequency.linearRampToValueAtTime(600, at + k * .8 + .8); } g.gain.value = .03; o.connect(g); g.connect(D_); o.start(at); o.stop(at + 3.2); } } },
};
function voiceBoxTo(m, f, at, D_) { m.note(f, at, .5, .09, "triangle", .002, 0, D_); }
function voiceHarpsiTo(m, f, at, D_) { m.note(f, at, .35, .08, "sawtooth", .002, 0, D_); }
function voiceErhuTo(m, f, at, D_) { const o = m.note(f * .97, at, 1, .1, "sawtooth", .05, 0, D_); o.frequency.exponentialRampToValueAtTime(f, at + .2); }

function whisperFx(list) {
  const w = $("whisper"); w.textContent = list[Math.floor(Math.random() * list.length)]; w.style.left = (10 + Math.random() * 65) + "vw"; w.style.top = (12 + Math.random() * 55) + "vh";
  w.style.color = "rgba(170,20,20,.8)"; setTimeout(() => w.style.color = "rgba(170,20,20,0)", 2200); noise(1.2, 600, .08, .5);
}

// ---- Danh sách map ----
const MAPS = {
  house:    { name: "Căn Nhà Số 13", tag: "Nhà hoang 3 tầng", ready: 1, bg: "linear-gradient(160deg,#2a0606,#0a0202 70%)",
              desc: "Bé Linh vẫn còn trong căn nhà. Khôi phục điện dưới hầm, tìm mật mã thật qua tấm gương và thoát ra. Ma: bé gái đuổi theo bạn — trốn vào tủ hoặc soi đèn vào nó." },
  forest:   { name: "Trong Rừng", tag: "Rừng thông lúc nửa đêm", ready: 1, bg: "linear-gradient(160deg,#0c1a10,#020604 70%)",
              desc: "Xe chết máy ở bìa rừng. Đốt 5 búp bê rơm ở lửa trại, tìm xăng ở trạm kiểm lâm rồi lái xe thoát ra. Ma Rừng chỉ tiến lại khi bạn không nhìn nó — nhưng ở gần mà nhìn lâu sẽ mất trí." },
  castle:   { name: "Lâu Đài Bị Bỏ Hoang", tag: "Lâu đài 3 tầng · thế kỷ 19", ready: 1, bg: "linear-gradient(160deg,#1e1428,#050308 70%)",
              desc: "Tìm 3 mảnh huy hiệu (khiên, nến kính màu, chuông tháp) và cọc bạc, mở hầm mộ và kết liễu Nữ Bá Tước. Bà ta mù nhưng nghe được mọi thứ — ĐỪNG CHẠY, trốn sau rèm nhung." },
  cemetery: { name: "Nghĩa Trang Lúc 0h Đêm", tag: "Ngoài trời · hạn chót 3 giờ sáng", ready: 1, bg: "linear-gradient(160deg,#18221e,#030507 70%)",
              desc: "Tìm đúng mộ cô Lan dưới gốc liễu (đọc kỹ tên!), đào lấy chiếc lược ngà và đặt lên bàn thờ trong nhà thờ lớn. Vong hồn bay lơ lửng, xuyên qua bia mộ và ngày càng đông. Phải thoát ra trước 3 giờ sáng." },
  factory:  { name: "Nhà Máy Xí Nghiệp", tag: "Xưởng dệt bỏ hoang · ca đêm", ready: 1, bg: "linear-gradient(160deg,#2a1a0a,#070402 70%)",
              desc: "Giải mã cửa phòng quản đốc, lấy thẻ từ, chỉnh van áp suất, khởi động máy phát và gọi thang máy hàng. Gã Đồ Tể đi tuần — bị hắn nhìn thấy là hắn lao tới. Trốn vào tủ đồ." },
};
MAPS.hospital = { name: "Bệnh Viện Dị Nhân", tag: "Bệnh viện 3 tầng bị niêm phong · map rộng nhất · kinh dị nhất", ready: 1, bg: "linear-gradient(160deg,#16261f,#020404 70%)",
              desc: "Bạn tỉnh dậy trên giường bệnh với một vết khâu mới. Xuống nhà xác tìm cầu chì, khôi phục điện, mở két thuốc, vào khu phẫu thuật tìm trái tim của người em song sinh rồi thiêu nó trong lò. Viện Trưởng Khải — gã bác sĩ tự khâu mình thành quái vật bốn tay — đi tuần khắp 3 tầng và nghe được tiếng bạn chạy. Rọi đèn thẳng vào mắt khiến hắn khựng lại; trốn vào tủ đồ nhân viên." };
let MAPID = "house";
const show = (id, on = true) => $(id).classList.toggle("hidden", !on);
let settingsFrom = "menu";
$("btnPlay").onclick = () => { ensureAudio(); if (!Music.cfg) Music.start("menu"); show("menu", false); show("mapSel"); };
$("btnHow").onclick = () => { show("menu", false); show("howto"); };
$("btnRec").onclick = () => { show("menu", false); renderRecords(); show("records"); };
$("recBack").onclick = () => { show("records", false); show("menu"); };
$("recClear").onclick = () => { if ($("recClear").dataset.ok) { try { localStorage.removeItem(REC_KEY); } catch (e) {} $("recClear").textContent = "Xóa kỷ lục"; delete $("recClear").dataset.ok; renderRecords(); } else { $("recClear").dataset.ok = 1; $("recClear").textContent = "Bấm lần nữa để xóa"; } };
$("howBack").onclick = () => { show("howto", false); show("menu"); };
$("btnSettings").onclick = () => { settingsFrom = "menu"; show("menu", false); show("settings"); };
$("mapBack").onclick = () => { show("mapSel", false); show("menu"); };
$("setBack").onclick = () => { show("settings", false); show(settingsFrom); };
$("pResume").onclick = () => resumeGame();
$("pSettings").onclick = () => { settingsFrom = "pause"; show("pause", false); show("settings"); };
$("pMenu").onclick = () => backToMenu();
function pauseGame() { if (!S.started || S.ending || S.paused) return; S.paused = true; S.menuPause = true; show("pause"); document.exitPointerLock?.(); }
function resumeGame() { show("pause", false); show("settings", false); S.menuPause = false; S.paused = false; cv.requestPointerLock?.(); }
document.addEventListener("pointerlockchange", () => { if (document.pointerLockElement !== cv && S.started && !S.paused && !S.ending) pauseGame(); });
buildMenus(); buildModeUI(); horrorizeAll(); drawMenuFx(); applySet(); $("loading").classList.add("hidden"); bloodify(document.querySelector(".logo"), 9); bloodify(document.querySelector("#pause .hdr"), 3);

const HOUSE = { NAMES, ACTIONS, SPRITE_ACTS, SPRITE_NAMES, GOALS, wallTex: WALL_TEX, update: updateGhosts, model: ghostModel, build: buildMap, tex: [],
  hard: "Mục tiêu: Khôi phục điện và tìm ra mật mã cửa chính.", intro: "Bạn tỉnh dậy ở sảnh chính. Cửa ra vào ngay sau lưng, nhưng bàn phím khóa điện đã tắt ngóm. Căn nhà im lặng... quá im lặng.",
  start() { F = FLOORS.t1; F.arriveX = 19.5; F.arriveY = 26; } };
function genericAmbient() {
  const r = Math.random();
  if (r < .4) whisperFx(MD.whispers); else if (r < .6) { noise(.5, 200, .7, .6); flicker(); say("Một tiếng động lớn vang lên ở đâu đó trong bóng tối."); } else if (r < .8) giggle(); else flicker(1.4);
}
Object.assign(FOREST, { update: updateStalker, model: stalkerModel, build: buildForest, ambient: forestAmbient, tex: [buildForestTextures],
  wallTex: () => ({ c: T.logWall, d: T.cabinDoor, e: T.logWallB }), state: () => ({ pack: 0, fireLit: 0, burned: 0, held: 0, cabinOpen: 0, fueled: 0, prayed: 0, tent2: 0 }),
  start() { F = FLOORS.f1; Object.assign(player, { x: 26.2, y: 49.4, a: -Math.PI / 2 }); },
  mapLabels: [["Bãi trại", 12, 13], ["Lửa trại", 28, 28], ["Trạm kiểm lâm", 42, 17.5], ["Giếng", 9, 37], ["Miếu", 46, 43.5], ["Xe", 28, 51], ["?", 20, 44]] });
Object.assign(CASTLE, { update: updateCountess, model: countessModel, build: buildCastle, ambient: genericAmbient, tex: [buildForestTextures, buildCastleTextures],
  wakeMsg: "Tiếng váy lụa sột soạt trên sàn đá... Nữ Bá Tước đã thức giấc. Đi thật khẽ.",
  wallTex: () => ({ w: T.glass, B: T.shelf, L: T.towerDoor, j: T.stoneW, r: T.stoneW, x: T.stoneW, y: T.stoneW, s: T.seal, k: T.gate, h: T.shield, g: T.banner, v: T.glass, P: T.portraitC, W: T.curtain, i: T.torch }),
  state: () => ({ order: ["R", "B", "G"].sort(() => Math.random() - .5), lit: [], crest: 0, p1: 0, p2: 0, p3: 0, lore: 0, gotBronze: 0, towerOpen: 0, gotChestKey: 0, gotStake: 0, sealOpen: 0, dead: 0, gateOpen: 0 }),
  start() { F = FLOORS.c1; [F.arriveX, F.arriveY] = F.remap(19.5, 27); const [x, y] = F.remap(19.5, 27.6); Object.assign(player, { x, y, a: -Math.PI / 2 }); } });
Object.assign(CEMETERY, { update: updateZombies, model: zombieModel, build: buildCemetery, ambient: genericAmbient, tex: [buildForestTextures, buildCastleTextures, buildCemeteryTextures], count: () => D.zstart,
  wakeMsg: "Một làn sương trắng bốc lên từ nấm mộ gần đó, rồi thành hình người... Vong đã thức giấc.",
  wallTex: () => ({ c: T.logWall, m: T.mausW, f: T.mausDoor, k: T.gate, v: T.glass }), state: () => ({ dug: [0, 0, 0], clockMin: 0, clog: 0, mausOpen: 0, freed: 0, nextZ: 0 }),
  start() { F = FLOORS.g1; Object.assign(player, { x: 23.5, y: 44, a: -Math.PI / 2 }); },
  mapLabels: [["Liễu", 11, 9], ["Nhà gác mộ", 39, 43], ["Nhà thờ", 36.5, 1.5], ["Cổng", 24, 45], ["Thiên thần", 24, 19]] });
Object.assign(FACTORY, { update: updateButcher, model: butcherModel, build: buildFactory, ambient: genericAmbient, tex: [buildForestTextures, buildCastleTextures, buildFactoryTextures],
  wakeMsg: "Tiếng dao phay ngừng hẳn. Rồi những bước chân nặng nề bắt đầu đi về phía bạn...",
  wallTex: () => ({ w: T.winFactory, X: T.offDoor, L: T.cardDoor, q: T.elevator, W: T.locker, 7: T.board, 8: T.plaqueF, D: T.desk, P: T.schem, 9: valvesOK() ? T.gaugeOk : T.gaugeBad }),
  state: () => { const vt = [0, 1, 2, 3].map(() => Math.random() < .5); if (vt.every(v => v === vt[0])) vt[2] = !vt[2]; return { year: 1965 + Math.floor(Math.random() * 25), valveTarget: vt, valves: [false, false, false, false], board: 0, officeOpen: 0, keycard: 0, genOpen: 0, power: 0, schem: 0 }; },
  start() { F = FLOORS.x1; const [x, y] = F.remap(9, 28); Object.assign(player, { x, y, a: -Math.PI / 2 }); } });
const MAPDEFS = { house: HOUSE, forest: FOREST, castle: CASTLE, cemetery: CEMETERY, factory: FACTORY };
let MD = HOUSE;
function startGame(seed) {
  ensureAudio(); Music.stop();
  show("loading"); $("loading").innerHTML = `<div class="ln">${MAPS[MAPID].name}</div><div class="lt">${TIPS[Math.floor(Math.random() * TIPS.length)]}</div>`; bloodify($("loading").querySelector(".ln"), 6);
  setTimeout(() => {
    const _rnd = Math.random; if (seed != null) Math.random = mulberry(seed);
    MD = MAPDEFS[MAPID]; setupPuzzles(); Object.assign(S, MD.state ? MD.state() : {});
    buildTextures(); MD.tex.forEach(fn => fn()); if (!T.stoneW) buildCastleTextures(); buildArchTextures(); buildTaskTextures(); buildPeopleTextures(); buildPropTextures(); buildWebTextures(); buildFxTextures(); buildRealTextures(); buildV13Textures(); buildV14Textures(); buildV15Textures(); buildV16Textures(); buildV18Textures();
    MD.build(); extendMaps(); ({ NAMES, ACTIONS, SPRITE_ACTS, SPRITE_NAMES, GOALS } = MD); WALL_TEX = MD.wallTex;
    SCALE = RESO[SET.quality][1]; if (SET.quality === "sieu") SCALE = Math.max(1, Math.min(2, 3840 / Math.max(1, cv.width))); initGL(); uploadTextures();
    MD.start(); refreshWalls(); player.hp = D.hp;
    ["mapSel", "loading"].forEach(id => show(id, false)); ["hudx", "msg"].forEach(id => show(id)); BG.on = false; $("bg").style.display = "none"; $("menuFx").style.display = "none";
    setupCoop(); setupTasks(); setupSpiders(); setupWatchers(); setupCritters(); windSetup(); setupRats(); wxStart(); Math.random = _rnd; S.paused = true; startAudio(); requestAnimationFrame(loop);
    const goCut = () => playCutscene(CUTS[MAPID], () => {
      S.started = Date.now(); S.paused = false; try { cv.requestPointerLock?.()?.catch?.(() => {}); } catch (e) {} flicker(); showArea(F.name); say(MD.intro); startTutorial(); renderTasks();
      if (D.wake === 0) setTimeout(wakeGhosts, 20000); setTimeout(ambientEvent, 15000);
    });
    if (STORY[MAPID]?.intro && !/replay=/.test(location.search)) playStory("Cốt truyện · " + MAPS[MAPID].name, STORY[MAPID].intro, goCut); else goCut();
  }, 40);
}
$("startBtn").onclick = () => { if (MODE === "online") { if (!NET.ok) return netStatus(NET.on ? "Chưa có đồng đội trong phòng. Gửi ID phòng cho bạn bè nhé." : "Hãy <b>Tạo phòng</b> hoặc nhập <b>ID phòng</b> trước."); if (!NET.host) return; return netStartHost(); } startGame(); };
Object.assign(Music, {
  songStart(map) {
    const s = SONGS[map]; if (!s || !ac) return; this.song = s; this.sg = ac.createGain(); this.sg.gain.value = 1; this.sg.connect(this.dry); this.sg.connect(this.wet);
    this.sBar = 0; this.sRest = 0; this.oct = 0; this.sT = ac.currentTime + 1.2; clearInterval(this.sTimer);
    this.sTimer = setInterval(() => { if (!this.song) return; while (this.sT < ac.currentTime + .5) this.songBar(); }, 120);
  },
  songBar() {
    const s = this.song, beat = 60 / s.bpm, barDur = beat * 3, t0 = this.sT;
    if (this.sRest > 0) { this.sRest--; const ch = s.bars[0].ch; ch.slice(1).forEach(n => vStrings(this, NOTE(n), t0, barDur, .012)); this.sT += barDur; return; }
    const bar = s.bars[this.sBar % s.bars.length];
    if (this.sBar % 1 === 0) { bar.ch.slice(1).forEach(n => vStrings(this, NOTE(n), t0, barDur, .011)); vPiano(this, NOTE(bar.ch[0]), t0, barDur, .05); }
    let tb = 0; for (const [n, b] of bar.m) { s.voice(this, NOTE(n + this.oct) * ((MAPID === "factory" || MAPID === "hospital") && Math.random() < .2 ? (MAPID === "hospital" ? .985 : 1.012) : 1), t0 + tb * beat + (Math.random() - .5) * .02, b * beat, s.vol); tb += b; }
    this.sT += barDur; this.sBar++;
    if (this.sBar % s.bars.length === 0) { this.sRest = Math.random() < .55 ? 2 : 0; this.oct = Math.random() < .3 ? -12 : 0; }
  },
});

// ---- Gắn giao diện phòng online ----
$("netHostBtn").onclick = () => netHost();
$("netJoinBtn").onclick = () => netJoin($("netCode").value);
$("netCode").addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") netJoin($("netCode").value); });
setInterval(() => { if (NET.host && NET.ok && !S.started) netLobby(); }, 1500);

// ---- Nhạc theo mức căng thẳng: yên bình khi xa ma, dồn dập khi ma đến gần ----
Object.assign(Music, {
  update(prox, chase) {
    if (!ac) return; const now = ac.currentTime; this.tv = prox;
    const target = chase ? Math.max(.6, prox) : prox * .35; this.cv += (target - this.cv) * (target > this.cv ? .25 : .04);
    const tense = Math.max(0, Math.min(1, (prox - .12) / .7)); this.ten = (this.ten || 0) + (tense - (this.ten || 0)) * .15;
    if (this.tg) this.tg.gain.setTargetAtTime(this.ten * .14 + this.cv * .05, now, .4);
    if (this.dgn) this.dgn.gain.setTargetAtTime(.012 + this.ten * .1, now, .6);
    if (this.sg) this.sg.gain.setTargetAtTime(Math.max(.12, 1 - this.ten * .55 - this.cv * .5), now, .5);
    if (this.cg) this.cg.gain.setTargetAtTime(this.cv * 1.05, now, .2);
    if (this.dry) this.dry.gain.setTargetAtTime(.75, now, .5);
    if (this.ten > .2 && !S.paused) { if (!this.hb || now > this.hb) { const g = this.ten * .75, iv = Math.max(.4, heartRate / 1000);
      this.note(52, now + .02, .22, g, "sine", .002, 0, this.dry); this.hit(now + .02, 60, .18, g * .8, this.dry, 1.4); this.note(48, now + .21, .2, g * .65, "sine", .002, 0, this.dry); this.hb = now + iv; } }
    if (this.ten > .55 && (this.lastTen || 0) <= .55 && (!this.stT || now > this.stT) && !S.paused) { this.stT = now + 25; this.stinger(); }
    this.lastTen = this.ten;
  },
});
TUT_STEPS.splice(4, 0, { t: () => "Bấm <b>C</b> để ngồi — đi rón rén, chúng khó nghe thấy bạn hơn", ok: () => TUT.crouch }, { t: () => "Bấm <b>Space</b> để nhảy", ok: () => TUT.jump });
TUT_STEPS[TUT_STEPS.length - 1] = { t: () => "Bấm <b>Tab</b> để xem danh sách nhiệm vụ. Mỗi việc xong sẽ đánh thức thêm thứ trong bóng tối...", ok: () => TUT.tab };
addEventListener("keydown", e => { if (e.code === "KeyC") TUT.crouch = 1; if (e.code === "Space") TUT.jump = 1; });
