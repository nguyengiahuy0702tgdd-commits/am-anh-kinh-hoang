// =====================================================================
//  47. HÙ KIỂU "GRANNY"
//  - Bị bắt: camera bị giật quay thẳng vào con ma 3D thật, nó lao sát mặt,
//    gào thét, màn hình rung — rồi BỐP! tối sầm, ù tai, hiện số mạng còn lại.
//  - Ma vừa phát hiện bạn: tiếng "đùng" chói tai + màn hình giật nhẹ.
//  Chỉ thay phần trình diễn, logic mất mạng / thua giữ nguyên (gọi after()).
// =====================================================================
const GR = { on: false, t0: 0, who: null, g: null, gf: null, prevChase: 0, spotCd: 0, el: null };
const GR_LUNGE = .34, GR_HIT = 1.25, GR_END = 2.75;

function grEl() {
  if (GR.el) return GR.el;
  const st = document.createElement("style");
  st.textContent = `
#grBlack{position:fixed;inset:0;z-index:60;background:#000;opacity:0;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transition:opacity .9s ease}
#grBlack.on{opacity:1;transition:none}
#grBlack.flash{background:#fff}
#grBlack .t1{font-family:var(--title,serif);font-size:clamp(26px,3.6vw,52px);letter-spacing:.14em;color:#b0201a;text-shadow:0 0 18px #600,0 3px 0 #200;opacity:0;transform:scale(1.15)}
#grBlack .t2{font-size:clamp(14px,1.5vw,20px);letter-spacing:.3em;color:#bfae96;opacity:0}
#grBlack.txt .t1{opacity:1;transform:none;transition:opacity .5s ease,transform 1.2s ease}
#grBlack.txt .t2{opacity:.9;transition:opacity .8s ease .4s}
#c.grShake{animation:grShake .09s linear infinite}
#c.grSpot{animation:grSpot .45s cubic-bezier(.2,1.6,.4,1)}
@keyframes grShake{0%{transform:translate(0,0) scale(1.05)}25%{transform:translate(-9px,6px) scale(1.06) rotate(-.6deg)}50%{transform:translate(8px,-7px) scale(1.05) rotate(.5deg)}75%{transform:translate(-6px,-5px) scale(1.07)}100%{transform:translate(7px,8px) scale(1.05) rotate(-.4deg)}}
@keyframes grSpot{0%{transform:scale(1)}30%{transform:scale(1.08) translate(3px,-2px)}100%{transform:scale(1)}}`;
  document.head.appendChild(st);
  const el = document.createElement("div"); el.id = "grBlack"; el.innerHTML = `<div class="t1"></div><div class="t2"></div>`;
  document.body.appendChild(el); return GR.el = el;
}

// ---------- Âm thanh ----------
function grOsc(type, f0, f1, start, dur, vol) {
  const o = ac.createOscillator(), g = ac.createGain(), n = ac.currentTime + start;
  o.type = type; o.frequency.setValueAtTime(f0, n); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, n + dur);
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(vol, n + .008); g.gain.exponentialRampToValueAtTime(.001, n + dur);
  o.connect(g); g.connect(BUS.sfx); o.start(n); o.stop(n + dur + .05);
}
function grSting(big) {           // hợp âm nghịch "ĐÙNG!" như dàn dây giật mình
  if (!ac || !BUS) return;
  const v = big ? 1 : .55;
  [55, 58.3, 82.4, 116.5, 123.5].forEach((f, i) => grOsc("sawtooth", f, f * .97, 0, big ? 1.6 : .9, .11 * v / (1 + i * .25)));
  [880, 932, 1245].forEach(f => grOsc("sawtooth", f, f * (big ? 1.5 : 1.2), 0, big ? 1.1 : .6, .035 * v));
  grOsc("sine", 90, 32, 0, .5, .55 * v);          // cú đấm trầm
  noise(.35, 900, .7 * v, .8);
}
function grScream() {             // tiếng gào: rung giọng + nhiễu
  if (!ac || !BUS) return;
  const n = ac.currentTime, o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), bp = ac.createBiquadFilter();
  o.type = "sawtooth"; o2.type = "square"; o.frequency.setValueAtTime(420, n); o.frequency.linearRampToValueAtTime(780, n + .25); o.frequency.linearRampToValueAtTime(520, n + .9);
  o2.frequency.setValueAtTime(433, n); o2.frequency.linearRampToValueAtTime(805, n + .25); o2.frequency.linearRampToValueAtTime(500, n + .9);
  lfo.frequency.value = 23; lg.gain.value = 45; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = .9;
  g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.32, n + .04); g.gain.setValueAtTime(.32, n + .75); g.gain.exponentialRampToValueAtTime(.001, n + .95);
  o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(BUS.sfx);
  [o, o2, lfo].forEach(x => { x.start(n); x.stop(n + 1); });
  noise(.9, 2600, .45, 2.5);
}
function grHit() {                // BỐP! + ù tai
  if (!ac || !BUS) return;
  grOsc("sine", 120, 28, 0, .7, .9); grOsc("triangle", 60, 30, 0, .5, .5);
  noise(.12, 1800, 1, .6); noise(.4, 220, .8, .7);
  grOsc("sine", 3900, 3700, .05, 2.4, .045);      // ù tai
}

// ---------- Jumpscare chính ----------
// Bị ma bắt (vừa mất mạng): lao vào mặt → BỐP → tối sầm + số mạng.
// Hù khi giải đố: chỉ lao vào mặt + thét, rồi trả lại đúng nhịp cũ (~1,1 giây).
jumpScare = (orig => function (after) {
  const who = player;
  if (REMOTE || (NET.ok && NET.host && who === P2) || GR.on) return orig(after);
  const caught = who.invuln >= 1.9 && hurt === 1;
  let g = null, gd = 99;
  for (const q of ghosts) if (q.floor === F.id && q.rise !== 0) { const d = Math.hypot(q.x - who.x, q.y - who.y); if (d < gd) { gd = d; g = q; } }
  if (caught && g && gd < 10) who.a = Math.atan2(g.y - who.y, g.x - who.x);   // bị giật quay mặt về phía nó
  if (caught) who.pitch = 0; else who.pitch *= .3;
  if (!(caught && g && gd < 3)) g = null;
  if (g) { GR.gf = g.floor; g.floor = "__gr"; }                      // giấu con ma thật — bản 3D lao vào mặt sẽ thay nó
  const HIT = caught ? GR_HIT : .95, END = caught ? GR_END : 1.08;
  Object.assign(GR, { on: true, t0: t, w0: performance.now(), who, g, hit: HIT });
  S.scareWho = who; S.paused = true; scareUntil = t + HIT;
  const el = grEl(), cv = $("c"); el.className = ""; el.querySelector(".t1").textContent = ""; el.querySelector(".t2").textContent = "";
  grSting(caught); setTimeout(grScream, 60);
  setTimeout(() => cv.classList.add("grShake"), GR_LUNGE * 1000);
  rumble([80, 30, 200, 30, 400], 1);
  setTimeout(() => {
    cv.classList.remove("grShake");
    if (!caught) { flicker(); return; }
    grHit(); rumble([350], 1);                                       // BỐP
    el.classList.add("on", "flash"); setTimeout(() => el.classList.remove("flash"), 55);
    const hp = who.hp, max = (D && D.hp) || 3;
    if (hp > 0) {
      el.querySelector(".t1").textContent = "BẠN ĐÃ BỊ TÓM";
      el.querySelector(".t2").textContent = "Mạng còn lại  " + "♥".repeat(Math.max(0, hp)) + "♡".repeat(Math.max(0, max - hp));
      setTimeout(() => el.classList.add("txt"), 300);
    }
  }, HIT * 1000);
  setTimeout(() => {
    scareUntil = 0; GR.on = false;
    if (g && g.floor === "__gr") g.floor = GR.gf;
    S.paused = false;
    if (after) withPlayer(who, after);
    el.classList.remove("on", "txt");                               // mở mắt dần
  }, END * 1000);
})(jumpScare);

// Con ma 3D: lao từ 1,4 m vào sát mặt rồi giữ, giật giật
scareModel = (orig => function (v, eye) {
  if (!GR.on) return orig(v, eye);
  const e = (performance.now() - GR.w0) / 1000; if (e > GR.hit) return;   // theo đồng hồ thật để máy yếu vẫn đúng nhịp
  let dist;
  if (e < GR_LUNGE) { const k = e / GR_LUNGE; dist = 1.5 - 1.22 * (1 - Math.pow(1 - k, 3)); }
  else dist = .28 + Math.sin(e * 37) * .015 - Math.min(.07, (e - GR_LUNGE) * .09);
  const a = player.a, jit = e < GR_LUNGE ? .01 : .05;
  const g = { x: player.x + Math.cos(a) * dist, y: player.y + Math.sin(a) * dist, yo: eye[1] - (FACE_H[MAPID] || 1) + (Math.random() - .5) * jit,
    scare: 1, rise: 1, face: a + Math.PI + (Math.random() - .5) * jit, state: "chase", hunt: 1e9, stare: 0, twA: (Math.random() - .5) * .35, twT: 1e9, twN: 1e9 };
  MD.model(v, g);
})(scareModel);

// Ma vừa phát hiện bạn: "ĐÙNG!" (giới hạn 1 lần / 14 giây)
gameStep = (orig => function (dt) {
  orig(dt);
  const ch = CHASING && !S.paused && S.started && !player.dead;
  if (ch && !GR.prevChase && t > GR.spotCd) {
    GR.spotCd = t + 14; grSting(false);
    const cv = $("c"); cv.classList.remove("grSpot"); void cv.offsetWidth; cv.classList.add("grSpot"); rumble([90], .6);
  }
  GR.prevChase = ch ? 1 : 0;
})(gameStep);
