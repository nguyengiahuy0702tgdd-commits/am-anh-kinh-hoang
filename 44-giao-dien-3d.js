// =====================================================================
//  41. BẢN 30: GIAO DIỆN 3D
//  · Nền menu là cảnh 3D thật của map đang chọn (camera lướt chậm qua từng phòng).
//    Cảnh chạy trong một khung riêng (iframe ?preview=<map>) nên KHÔNG đụng tới dữ liệu ván chơi.
//  · Menu nổi khối: ô chọn map nghiêng theo chuột, chữ và nút bấm có chiều sâu.
// =====================================================================
const PV_ID = (location.search.match(/[?&]preview=(\w+)/) || [])[1];

if (PV_ID) {
  // ---------------- BÊN TRONG KHUNG XEM TRƯỚC ----------------
  const st = document.createElement("style");
  st.textContent = "body>*:not(#c):not(#pvFade){display:none!important} #c{display:block!important;opacity:1!important} body{background:#000;cursor:default}";
  document.head.appendChild(st);
  const fade = document.createElement("div"); fade.id = "pvFade"; Object.assign(fade.style, { position: "fixed", inset: 0, background: "#000", opacity: 1, pointerEvents: "none", zIndex: 999 }); document.body.appendChild(fade);
  const post = m => { try { parent.postMessage({ pv: m, map: PV_ID }, "*"); } catch (e) {} };
  SET.quality = "nhanh"; SET.fx = false; try { resize(); } catch (e) {}   // chỉ đổi trong khung này, không lưu
  if (MAPDEFS[PV_ID]) MAPID = PV_ID;
  playStory = () => {}; playCutscene = () => {};
  let shots = null, si = 0, st0 = 0, frames = 0, acc = 0, lastN = 0, muted = false;
  const lerp = (a, b, u) => a.map((q, i) => q + (b[i] - q) * u), ease = u => u * u * (3 - 2 * u), DUR = 11;
  const pickShots = () => {
    const out = [];
    for (const f of Object.values(FLOORS)) for (const L of f.labels || []) { const v = roomView(f, L[0]); if (v) out.push(v); }
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    out.sort((a, b) => (a.f === F ? 0 : 1) - (b.f === F ? 0 : 1));   // bắt đầu ở tầng xuất phát
    return out.slice(0, 10);
  };
  loop = function pvLoop(now) {
    requestAnimationFrame(pvLoop);
    const dt = Math.min(.05, (now - (lastN || now)) / 1000); lastN = now; acc += dt; if (acc < 1 / 30) return;   // 30 khung/giây là đủ cho nền
    const step = acc; acc = 0; t += step;
    if (!muted && typeof BUS !== "undefined" && BUS?.master) { try { BUS.master.gain.value = 0; Music.stop?.(); } catch (e) {} muted = true; }
    if (!shots) { shots = pickShots(); st0 = t; }
    let cam;
    if (shots.length) {
      let u = (t - st0) / DUR; if (u >= 1) { si = (si + 1) % shots.length; st0 = t; u = 0; }
      const s = shots[si]; if (F !== s.f) F = s.f;
      const e = ease(u), eye = lerp(s.c0, s.c1, e), lk = lerp(s.l0, s.l1, e), fw = lk.map((q, i) => q - eye[i]), n = Math.hypot(...fw) || 1;
      cam = { eye, fw: fw.map(q => q / n), red: 0, prox: 0, day: 0, lights: [
        { x: eye[0] - fw[0] / n * .4, y: eye[2] - fw[2] / n * .4, h: eye[1] + .3, i: .3 * (Math.random() < .015 ? .2 : 1), r: .75, g: .8, b: 1, f: .35 },
        { x: lk[0], y: lk[2], h: 1.05, i: .32, r: 1, g: .72, b: .48, f: .6 }] };
      fade.style.opacity = Math.max(0, 1 - Math.min(u, 1 - u) * DUR / .9).toFixed(3);
    } else {   // không tìm được góc máy: đứng tại chỗ xuất phát, xoay chậm
      const a = player.a + t * .08; cam = { eye: [player.x, EYE, player.y], fw: [Math.cos(a), -.05, Math.sin(a)], red: 0, prox: 0, day: 0, lights: [] }; fade.style.opacity = 0;
    }
    if (!Array.isArray(CUT.actors)) CUT.actors = [];
    try { ensureFBO(); renderView(0, 1, step, cam); } catch (e) { window.PV_ERR = String(e && e.stack || e); post("fail"); return; }
    if (++frames === 4) post("ready");
  };
  setTimeout(() => { try { startGame(); } catch (e) { post("fail"); } }, 30);
} else {
  // ---------------- TRANG CHÍNH: nền 3D phía sau menu ----------------
  const PV = { cur: null, next: null, fails: 0, dead: /^https?:$|^file:$/.test(location.protocol) ? false : true };
  const active = () => !PV.dead && SET.menu3d !== false && !S.started && !CUT.on && BG.on !== false && $("bg").style.display !== "none" && $("loading")?.classList.contains("hidden") !== false;
  const kill = fr => { if (fr) { fr.remove(); } };
  const killAll = () => { kill(PV.cur); kill(PV.next); PV.cur = PV.next = null; };
  const spawn = map => {
    kill(PV.next);
    const fr = document.createElement("iframe"); fr.map = map; fr.tabIndex = -1; fr.setAttribute("aria-hidden", "true");
    fr.src = location.href.split("#")[0].split("?")[0] + "?nowarn&preview=" + map;
    Object.assign(fr.style, { position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, zIndex: 28, pointerEvents: "none", opacity: 0, transition: "opacity 1.4s ease", filter: "brightness(.92) contrast(1.05)" });
    $("bg").after(fr); PV.next = fr;
    fr._to = setTimeout(() => { if (PV.next === fr && !fr._ok) { kill(fr); PV.next = null; if (++PV.fails >= 2) PV.dead = true; } }, 20000);
  };
  addEventListener("message", e => {
    const d = e.data; if (!d || !d.pv) return; const fr = [PV.next, PV.cur].find(f => f && f.contentWindow === e.source); if (!fr) return;
    if (d.pv === "fail") { kill(fr); if (fr === PV.next) PV.next = null; else PV.cur = null; if (++PV.fails >= 2) PV.dead = true; return; }
    if (d.pv === "ready" && fr === PV.next) { fr._ok = 1; clearTimeout(fr._to); fr.style.opacity = 1; const old = PV.cur; PV.cur = fr; PV.next = null; setTimeout(() => kill(old), 1500); }
  });
  setInterval(() => {
    if (!active()) { if (PV.cur || PV.next) killAll(); return; }
    const want = MAPID;
    if ((PV.cur?.map === want && !PV.next) || PV.next?.map === want) return;
    if (PV.debMap === want) return; clearTimeout(PV.deb); PV.debMap = want;
    PV.deb = setTimeout(() => { PV.debMap = null; if (active() && MAPID === want) spawn(want); }, PV.cur ? 700 : 100);
  }, 400);
  startGame = (o => function (...a) { killAll(); PV.dead = true; markWarned(); return o.apply(this, a); })(startGame);   // đã vào chơi = đã xem cảnh báo   // vào game: tắt nền 3D để dành sức máy

  // ---------------- MENU NỔI KHỐI 3D ----------------
  const css = document.createElement("style");
  css.textContent = `
  .logo { text-shadow: 0 1px 0 #7a0606, 0 2px 0 #6a0505, 0 3px 0 #5a0404, 0 4px 0 #4a0303, 0 5px 0 #3a0202, 0 6px 1px #200, 0 10px 18px rgba(0,0,0,.85), 0 0 34px rgba(200,0,0,.28) !important; }
  #menu .brand { transform: perspective(900px) rotateX(var(--brx, 0deg)) rotateY(var(--bry, 0deg)); transition: transform .25s ease-out; transform-style: preserve-3d; }
  #menu .mnav a { display: inline-block; transition: transform .18s, text-shadow .18s, color .18s; text-shadow: 0 1px 0 #3a2a22, 0 2px 0 #2a1d17, 0 3px 0 #1a120e, 0 6px 10px rgba(0,0,0,.8); }
  #menu .mnav a:hover { transform: perspective(500px) translateZ(26px) translateX(6px); color: #ff3a2a; text-shadow: 0 1px 0 #8a0808, 0 2px 0 #6a0606, 0 3px 0 #4a0404, 0 4px 0 #2a0202, 0 10px 16px rgba(0,0,0,.85), 0 0 22px rgba(255,20,0,.5); }
  #mapSel #mapCards.tiles { perspective: 900px; }
  #mapSel #mapCards.tiles a { transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) !important; transition: transform .22s ease-out, box-shadow .25s, border-color .2s !important; box-shadow: 0 2px 0 #1a0c0a, 0 4px 0 #120807, 0 6px 0 #0a0403, 0 14px 26px rgba(0,0,0,.75); }
  #mapSel #mapCards.tiles a:hover, #mapSel #mapCards.tiles a.sel { transform: translateY(-8px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(1.03) !important; box-shadow: 0 2px 0 #3a0a08, 0 5px 0 #2a0706, 0 8px 0 #1a0404, 0 26px 40px rgba(0,0,0,.8), 0 0 30px rgba(200,10,0,.35); }
  #mapSel #mapCards.tiles a canvas { transform: scale(1.12) translate(var(--px, 0px), var(--py, 0px)) !important; transition: transform .22s ease-out, filter .2s !important; }
  #mapSel #mapCards.tiles a .glare { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,220,200,.16), transparent 55%); opacity: 0; transition: opacity .2s; }
  #mapSel #mapCards.tiles a:hover .glare { opacity: 1; }
  #mapSel #mapCards.tiles a .tn { text-shadow: 0 1px 0 #000, 0 2px 0 #000, 0 3px 6px rgba(0,0,0,.9) !important; }
  #mapSel .info { transform: perspective(1600px) rotateX(1.5deg); box-shadow: 0 2px 0 rgba(120,10,8,.5), 0 18px 50px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.05) !important; backdrop-filter: blur(3px); }
  #mapSel .mname { text-shadow: 0 1px 0 #6a0505, 0 2px 0 #4a0303, 0 3px 0 #2a0202, 0 8px 14px rgba(0,0,0,.8) !important; }
  #startBtn.go { box-shadow: 0 1px 0 #6a0404, 0 3px 0 #4a0202, 0 5px 0 #2a0101, 0 12px 22px rgba(0,0,0,.75), 0 0 24px rgba(200,0,0,.35) !important; transition: transform .1s, box-shadow .1s !important; }
  #startBtn.go:hover { transform: translateY(-2px); }
  #startBtn.go:active { transform: translateY(4px); box-shadow: 0 1px 0 #4a0202, 0 4px 10px rgba(0,0,0,.75) !important; }
  .sbar a:not(.go), .opts a, .opts span { transition: transform .15s, text-shadow .15s; }
  .sbar a:not(.go):hover, .opts a:hover { transform: translateY(-2px); text-shadow: 0 1px 0 #2a0202, 0 2px 0 #1a0101, 0 5px 8px rgba(0,0,0,.8); }
  @media (prefers-reduced-motion: reduce) { #menu .brand, #mapSel #mapCards.tiles a, #mapSel #mapCards.tiles a canvas { transform: none !important; transition: none !important; } }`;
  document.head.appendChild(css);
  // ô chọn map nghiêng theo chuột + vệt sáng
  const tiltOn = () => {
    for (const a of document.querySelectorAll("#mapCards.tiles a")) {
      if (a._tilt) continue; a._tilt = 1; if (!a.querySelector(".glare")) { const g = document.createElement("span"); g.className = "glare"; a.appendChild(g); }
      a.addEventListener("pointermove", e => { const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        a.style.setProperty("--ry", (x * 16).toFixed(2) + "deg"); a.style.setProperty("--rx", (-y * 16).toFixed(2) + "deg"); a.style.setProperty("--px", (-x * 10).toFixed(1) + "px"); a.style.setProperty("--py", (-y * 10).toFixed(1) + "px");
        a.style.setProperty("--mx", ((x + .5) * 100).toFixed(0) + "%"); a.style.setProperty("--my", ((y + .5) * 100).toFixed(0) + "%"); });
      a.addEventListener("pointerleave", () => { for (const k of ["--rx", "--ry", "--px", "--py"]) a.style.removeProperty(k); });
    }
  };
  setInterval(tiltOn, 1000); tiltOn();
  // logo nghiêng nhẹ theo vị trí chuột trên toàn màn hình
  addEventListener("pointermove", e => { const b = document.querySelector("#menu .brand"); if (!b || $("menu").classList.contains("hidden")) return;
    b.style.setProperty("--bry", ((e.clientX / innerWidth - .5) * 10).toFixed(2) + "deg"); b.style.setProperty("--brx", (-(e.clientY / innerHeight - .5) * 8).toFixed(2) + "deg"); }, { passive: true });
}
