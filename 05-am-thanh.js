// ===================== 4. ÂM THANH & HIỆU ỨNG =====================
let ac, heartRate = 1400;
let beatOn = false;
function startAudio() {
  ensureAudio(); Music.start(MAPID);
  if (!beatOn) { beatOn = true; (function beat() { const n = ac.currentTime; thump(n, .45); thump(n + .22, .3); setTimeout(beat, heartRate); })(); }
}
function thump(at, vol) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(70, at); o.frequency.exponentialRampToValueAtTime(35, at + .15); g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(.001, at + .2); o.connect(g); g.connect(BUS.sfx); o.start(at); o.stop(at + .25); }
function noise(dur, freq, vol, q = 1, delay = 0) {
  if (!ac) return; const len = ac.sampleRate * dur, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = Math.min(freq, 4200); f.Q.value = q;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4800;   // cắt dải tần chói tai
  const v = Math.min(.6, vol) * (freq >= 2500 ? .45 : freq >= 1500 ? .7 : 1), t0 = ac.currentTime + delay, g = ac.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .008);   // vào tiếng êm, không "tách"
  s.connect(f); f.connect(lp); lp.connect(g); g.connect(BUS.sfx); s.start(t0);
}
function tone(freq, start, dur, vol = .08, type = "triangle") { if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = freq; if ((type === "square" || type === "sawtooth") && freq > 900) vol *= .45; else if (freq > 1600) vol *= .6; g.gain.setValueAtTime(0, ac.currentTime + start); g.gain.linearRampToValueAtTime(vol, ac.currentTime + start + .006); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + start + dur); o.connect(g); g.connect(BUS.sfx); o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + .05); }
function screech() {
  noise(.8, 2200, 1, 3); noise(.8, 500, .6, 1);
  const o = ac.createOscillator(), g = ac.createGain(); o.type = "square"; o.frequency.setValueAtTime(950, ac.currentTime); o.frequency.linearRampToValueAtTime(350, ac.currentTime + .7);
  g.gain.setValueAtTime(.18, ac.currentTime); g.gain.linearRampToValueAtTime(0, ac.currentTime + .7); o.connect(g); g.connect(BUS.sfx); o.start(); o.stop(ac.currentTime + .75);
}
function musicBox() { [659, 587, 523, 587, 659, 659, 659, 587, 587, 587, 659, 784, 784].forEach((f, i) => tone(f * (1 - i * .004), i * .38, .5, .07)); }
function giggle() { for (let i = 0; i < 5; i++) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(900 + Math.random() * 300, ac.currentTime + i * .13); o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + i * .13 + .1); g.gain.setValueAtTime(.04, ac.currentTime + i * .13); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + i * .13 + .11); o.connect(g); g.connect(BUS.sfx); o.start(ac.currentTime + i * .13); o.stop(ac.currentTime + i * .13 + .12); } }
let flickerUntil = 0; const flicker = (d = .9) => flickerUntil = t + d;

const whispers = ["...đằng sau...", "...em ở đây...", "...đừng quay lại...", "...chơi với em đi...", "...anh thấy em không?...", "...bé Bông đâu rồi?...", "...lạnh quá..."];
function ambientEventRaw() {
  if (S.paused || !S.started) return;
  if (MD.ambient) return MD.ambient();
  const r = Math.random();
  if (r < .35) { const w = $("whisper"); w.textContent = whispers[Math.floor(Math.random() * whispers.length)]; w.style.left = (10 + Math.random() * 65) + "vw"; w.style.top = (12 + Math.random() * 55) + "vh"; w.style.color = "rgba(170,20,20,.75)"; setTimeout(() => w.style.color = "rgba(170,20,20,0)", 2200); noise(1.2, 600, .08, .5); }
  else if (r < .55 && F.id !== "t2") { for (let i = 0; i < 8; i++) noise(.08, 120, .35, .8, i * .22); say("Có tiếng chân ai đó chạy rầm rập ở tầng trên..."); }
  else if (r < .7) { noise(.5, 200, .7, .6); flicker(); say("RẦM! Một cánh cửa đóng sập ở đâu đó."); }
  else if (r < .85) giggle(); else flicker(1.4);
}
