// =====================================================================
//  CHƠI ONLINE 2 MÁY: tạo phòng / nhập ID phòng (WebRTC qua PeerJS)
//  Máy chủ phòng giữ toàn bộ thế giới (ma, câu đố); máy khách gửi vị trí & hành động.
// =====================================================================
const NET = { on: false, host: false, ok: false, code: "", conn: null, peer: null, bc: null, me: Math.random().toString(36).slice(2), pt: 0, st: 0 };
let REMOTE = false, REMOTE_LOCK = null;
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; };
function netStatus(html) { $("netStatus").innerHTML = html; }
function loadPeerJS() {
  if (window.Peer) return Promise.resolve(true);
  return new Promise(res => { const s = document.createElement("script"); s.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"; s.onload = () => res(!!window.Peer); s.onerror = () => res(false); document.head.appendChild(s); setTimeout(() => res(!!window.Peer), 9000); });
}
const newCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
function netSend(o) {
  if (!NET.ok) return;
  try { if (NET.conn) NET.conn.send(o); else if (NET.bc) NET.bc.postMessage({ ...o, _f: NET.me }); } catch (e) {}
}
function netConnected() {
  NET.ok = true; tone(660, 0, .4, .05); tone(880, .15, .5, .05);
  if (NET.host) { netStatus(`Phòng <b>${NET.code}</b> · <span class="ok">Đồng đội đã vào phòng.</span> Bấm <b>Vào game</b> để bắt đầu.`); netLobby(); }
  else { netStatus(`<span class="ok">Đã vào phòng ${NET.code}.</span> Chờ chủ phòng chọn map và bắt đầu...`); $("startBtn").classList.add("wait"); $("startBtn").textContent = "Chờ chủ phòng..."; }
}
function netLost() {
  if (!NET.ok) return; NET.ok = false;
  if (S.started && !S.ending) { say("Mất kết nối với đồng đội. Bạn chỉ còn một mình..."); if (P2) { P2.dead = true; P2.f = null; } if (!NET.host) { NET.on = false; COOP = false; } }
  else netStatus("Mất kết nối. Hãy tạo phòng mới hoặc nhập lại ID phòng.");
}
async function netHost() {
  netClose(); NET.on = true; NET.host = true; NET.code = newCode(); netStatus("Đang tạo phòng...");
  const useLocal = location.search.includes("local") || !(await loadPeerJS());
  if (useLocal) { netLocal(); netStatus(`ID phòng: <b class="code">${NET.code}</b> <span class="dim">(chế độ cùng máy — mở thêm một tab để thử)</span><br>Đang chờ người chơi 2...`); return; }
  const peer = NET.peer = new Peer("demamanh-" + NET.code);
  peer.on("open", () => netStatus(`ID phòng: <b class="code">${NET.code}</b> <a class="copy" onclick="navigator.clipboard?.writeText('${NET.code}')">sao chép</a><br>Gửi ID này cho bạn bè. Đang chờ người chơi 2...`));
  peer.on("connection", c => { if (NET.conn) { c.close(); return; } NET.conn = c; c.on("open", netConnected); c.on("data", netRecv); c.on("close", netLost); });
  peer.on("error", e => { if (e.type === "unavailable-id") return netHost(); netStatus("Không tạo được phòng (" + e.type + "). Kiểm tra kết nối mạng rồi thử lại."); });
}
async function netJoin(code) {
  code = (code || "").trim().toUpperCase(); if (code.length < 4) return netStatus("Hãy nhập ID phòng (6 ký tự) mà bạn bè gửi cho bạn.");
  netClose(); NET.on = true; NET.host = false; NET.code = code; netStatus("Đang kết nối tới phòng " + code + "...");
  const useLocal = location.search.includes("local") || !(await loadPeerJS());
  if (useLocal) { netLocal(); NET.bc.postMessage({ t: "join", _f: NET.me }); setTimeout(() => { if (!NET.ok) netStatus("Không tìm thấy phòng " + code + "."); }, 4000); return; }
  const peer = NET.peer = new Peer();
  peer.on("open", () => { const c = NET.conn = peer.connect("demamanh-" + code, { reliable: true, serialization: "json" }); c.on("open", netConnected); c.on("data", netRecv); c.on("close", netLost); });
  peer.on("error", e => netStatus(e.type === "peer-unavailable" ? "Không tìm thấy phòng " + code + ". Kiểm tra lại ID." : "Lỗi kết nối (" + e.type + ")."));
}
function netLocal() {   // dự phòng: 2 tab trên cùng trình duyệt
  NET.bc = new BroadcastChannel("demamanh-" + NET.code);
  NET.bc.onmessage = e => { const m = e.data; if (m._f === NET.me) return;
    if (m.t === "join" && NET.host && !NET.ok) { NET.bc.postMessage({ t: "welcome", _f: NET.me }); netConnected(); return; }
    if (m.t === "welcome" && !NET.host && !NET.ok) { netConnected(); return; }
    netRecv(m); };
}
function netClose() { try { NET.conn?.close(); NET.peer?.destroy(); NET.bc?.close(); } catch (e) {} Object.assign(NET, { on: false, ok: false, conn: null, peer: null, bc: null }); }
function netLobby() { if (NET.host && NET.ok) netSend({ t: "lobby", map: MAPID, diff: Object.keys(DIFF).find(k => DIFF[k] === D) }); }
function netStartHost() {
  const seed = Math.floor(Math.random() * 1e9); netSend({ t: "start", map: MAPID, diff: Object.keys(DIFF).find(k => DIFF[k] === D), seed }); startGame(seed);
}
function netRecv(m) {
  switch (m.t) {
    case "lobby": if (!S.started) { const a = $("mapCards").querySelector(`a[data-id=${m.map}]`); a?.onclick(); const d = [...$("diffBtns").children].find(x => x.textContent === DIFF[m.diff].name); d?.onclick(); } break;
    case "start": MAPID = m.map; D = DIFF[m.diff]; startGame(m.seed); break;
    case "pose": if (P2) { P2.nx = m.x; P2.ny = m.y; P2.na = m.a; Object.assign(P2, { pitch: m.p, lightOn: m.l, hidden: m.h, running: m.r, moving: m.mv, bob: m.b, jy: m.jy, crH: m.cr, battery: m.bat, stamina: m.st, f: m.f });
      if (!NET.host) Object.assign(P2, { hp: m.hp, dead: m.dead }); if (P2.x == null || Math.hypot(P2.x - m.x, P2.y - m.y) > 3) { P2.x = m.x; P2.y = m.y; P2.a = m.a; } } break;
    case "snap": if (!NET.host) netApplySnap(m); break;
    case "act": netRemoteAct(m); break;
    case "lockok": if (REMOTE_LOCK) { const ok = REMOTE_LOCK.ok; REMOTE_LOCK = null; withRemote(() => ok()); } break;
    case "bat": { const s = FLOORS[m.f]?.sprites[m.i]; if (s && !s.taken) { s.taken = true; if (FLOORS[m.f] === F) buildFloorMesh(F); } break; }
    case "scare": if (S.started && !S.ending) jumpScare(null); break;
    case "lose": if (!S.ending) finalLose(m.text); break;
    case "note": say("Đồng đội: " + m.text); break;
  }
}
function withRemote(fn) { withPlayer(P2, () => { REMOTE = true; try { fn(); } finally { REMOTE = false; } }); }
function netRemoteAct(m) {
  if (!S.started || !P2) return; let label = "";
  withRemote(() => {
    if (m.hide) return hide();
    if (m.si != null) { const s = FLOORS[m.f]?.sprites[m.si]; if (s && s.act && !s.taken && SPRITE_ACTS[s.act]) { label = SPRITE_NAMES[s.act] || ""; SPRITE_ACTS[s.act](s); } }
    else if (ACTIONS[m.c]) { label = NAMES[m.c] || ""; const F0 = F, Fr = FLOORS[m.f || P2.f] || F; F = Fr; try { ACTIONS[m.c]({ c: m.c, x: m.x, y: m.y }); } finally { if (F === Fr) F = F0; if (Fr !== F0) Fr._baseDirty = true; } }   // làm trên đúng tầng của đồng đội
  });
  if (label) toast("Đồng đội: " + label);
}
function toast(text) { const el = $("toast"); el.textContent = text; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
function netApplySnap(m) {
  const list = m.g; for (let i = 0; i < list.length; i++) { const src = list[i], g = ghosts[i]; if (!g) ghosts[i] = { ...src, nx: src.x, ny: src.y }; else { const { x, y, ...rest } = src; Object.assign(g, rest); g.nx = x; g.ny = y; } }
  ghosts.length = list.length;
  const y = m.you; if (y.hp < P1.hp) hurt = 1; Object.assign(P1, { hp: y.hp, dead: y.dead, rev: y.rev }); S.clockMin = m.cm ?? S.clockMin; S.woke = m.woke;
}
function netTick(dt) {
  if (!NET.ok) return;
  if ((NET.pt -= dt) <= 0) { NET.pt = .066; const p = P1; netSend({ t: "pose", x: p.x, y: p.y, a: p.a, p: p.pitch, l: p.lightOn, h: p.hidden, r: p.running, mv: p.moving, b: p.bob, jy: p.jy || 0, cr: p.crH || 0, bat: p.battery, st: p.stamina, hp: p.hp, dead: p.dead, f: F.id }); }
  if (NET.host && (NET.st -= dt) <= 0) { NET.st = .1; netSend({ t: "snap", g: ghosts.map(g => ({ ...g })), you: { hp: P2.hp, dead: !!P2.dead, rev: P2.rev || 0 }, cm: S.clockMin, woke: S.woke, fid: F.id }); }
}
function finalLose(text) { S.paused = true; S.ending = true; document.exitPointerLock?.(); $("loseText").textContent = text; bloodify($("lose").querySelector("h1")); $("lose").classList.remove("hidden"); }
function lose(text) {
  if (COOP && player.hp <= 0 && !player.dead) {
    const other = player === P1 ? P2 : P1;
    if (other && !other.dead) { player.dead = true; player.hidden = false; player.lightOn = false; S.lastLose = text; noise(1.2, 100, .6, .5); say(`${pname(player)} đã gục ngã! ${pname(other)} hãy tới đứng sát bên để kéo dậy.`); return; }
  }
  if (NET.ok && NET.host) netSend({ t: "lose", text }); finalLose(text);
}
function jumpScare(after) {
  const who = player;
  if (REMOTE) { if (after) after(); return; }
  if (NET.ok && NET.host && who === P2) { netSend({ t: "scare" }); if (after) withPlayer(P2, after); return; }
  S.scareWho = who; S.paused = true; scareUntil = t + .8; screech(); setTimeout(() => showGhostFace(950), 110);
  setTimeout(() => { scareUntil = 0; flicker(); S.paused = false; if (after) withPlayer(who, after); }, 1080);
}
function act(p) {
  if (!p || p.dead) return;
  withPlayer(p, () => {
    if (player.hidden) { hide(); netSend({ t: "act", hide: 1 }); return; }
    aimed = p.aim; aimedSprite = p.aimS; if (aimed || aimedSprite) TUT.used = 1;
    if (aimedSprite) { const s = aimedSprite, si = F.sprites.indexOf(s), fid = F.id; SPRITE_ACTS[s.act](s); netSend({ t: "act", si, f: fid }); }
    else if (aimed) { const c = aimed, fid = F.id; ACTIONS[c.c](c); netSend({ t: "act", c: c.c, x: c.x, y: c.y, f: fid }); }
  });
}
// ---- Vòng lặp mạng ----
function gameStep(dt) {
  if (S.paused) { netTick(dt); return; }
  S.playT = (S.playT || 0) + dt;
  const ox = P1.x, oy = P1.y; updatePlayer(dt, ctlP1()); P1.moving = Math.hypot(P1.x - ox, P1.y - oy) > .001; P1.f = F.id;
  if (COOP && P2) { const k = Math.min(1, dt * 12); if (P2.nx != null) { P2.x += (P2.nx - P2.x) * k; P2.y += (P2.ny - P2.y) * k; P2.a += angTo(P2.a, P2.na) * k; } }
  if (!NET.on || NET.host || !NET.ok) {
    if (COOP && P2 && NET.ok) {
      const alive = players().filter(p => !p.dead);   // mỗi người có thể ở một tầng khác nhau
      const dm = p => { let m = 99; for (const g of ghosts) if (g.floor === (p.f || F.id)) m = Math.min(m, Math.hypot(g.x - p.x, g.y - p.y)); return m; };
      let tg = S.target && alive.includes(S.target) ? S.target : alive[0] || P1;
      if (alive.length > 1) { const o = tg === P1 ? P2 : P1; if (dm(o) < dm(tg) - 1.5) tg = o; }
      const Fh = F, Ft = FLOORS[tg.f] || F;
      S.target = tg; player = tg; F = Ft; try { MD.update(dt); } finally { player = P1; if (F === Ft) F = Fh; }
      revive(dt);
    } else MD.update(dt);
    tasksTick(dt);
  } else {   // máy khách: ma do chủ phòng điều khiển — chỉ nội suy vị trí
    let md = 99; for (const g of ghosts) { if (g.nx != null) { const k = Math.min(1, dt * 10); g.x += (g.nx - g.x) * k; g.y += (g.ny - g.y) * k; } if (g.floor === F.id && g.rise !== 0 && !(g.gone > t)) md = Math.min(md, Math.hypot(g.x - P1.x, g.y - P1.y)); }
    minGhostD = md; CHASING = md < 6 ? 1 : 0; heartRate = Math.max(320, Math.min(1400, 250 + md * 150));
  }
  tutTick(dt); netTick(dt); spiderTick(dt); scareTick(dt); directorTick(dt); taskAudioTick(dt); cam4dTick(dt); critTick(dt); areaTick(); mapLive(); wxTick(dt); ratTick(dt);
}
function revive(dt) {
  for (const p of [P1, P2]) if (p && p.dead) {
    const o = p === P1 ? P2 : P1; if (!o || o.dead) continue;
    if (Math.hypot(o.x - p.x, o.y - p.y) < 1.3) { p.rev = (p.rev || 0) + dt; if (p.rev > 2.5) { Object.assign(p, { dead: false, hp: 1, invuln: 3, rev: 0, lightOn: true }); tone(523, 0, .8, .05); tone(659, .2, .9, .05); say(`${pname(o)} đã kéo ${pname(p)} dậy! Cẩn thận — chỉ còn 1 máu.`); } }
    else p.rev = Math.max(0, (p.rev || 0) - dt);
  }
}
function ctlP1() { const k = keys; return { f: (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0), s: (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), turn: (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0), run: !!(k.ShiftLeft || k.ShiftRight) }; }
function setupCoop() {
  COOP = NET.on && NET.ok; document.body.classList.remove("coop"); document.body.classList.toggle("online", COOP);
  Object.assign(P1, { dead: false, rev: 0, fl: null, aim: null, aimS: null, f: F.id });
  if (COOP) {
    P2 = { ...P1, fl: null, hp: D.hp, stamina: 100, battery: 75, lightOn: true, hidden: false, invuln: 0, bob: 1.5, nx: null, f: F.id }; placeBeside(P2, P1);
    if (!NET.host) { const [x, y] = [P1.x, P1.y]; P1.x = P2.x; P1.y = P2.y; P2.x = x; P2.y = y; }
  } else P2 = null;
  $("st2").classList.toggle("hidden", !COOP); $("st1").querySelector(".who").textContent = "Bạn"; $("st2").querySelector(".who").textContent = "Đồng đội";
}
function travel(to, x, y, a) {
  if (REMOTE && P2) { Object.assign(P2, { x, y, a, nx: x, ny: y, na: a, f: to, hidden: false }); return; }   // đồng đội đi cầu thang: chỉ đồng đội đổi tầng
  S.paused = true; document.exitPointerLock?.(); $("fade").style.opacity = 1; for (let i = 0; i < 6; i++) noise(.08, 160, .3, .8, i * .18);
  setTimeout(() => {
    F = FLOORS[to]; Object.assign(P1, { x, y, a, pitch: 0, hidden: false, f: to }); if (COOP && P2 && !NET.on) { placeBeside(P1, { x, y, a }); Object.assign(P2, { f: to }); }
    F.arriveX = x; F.arriveY = y; refreshWalls(); $("fade").style.opacity = 0; S.paused = false; showArea(F.name);
  }, 700);
}
function statBox(el, p) {
  if (!p) return; const [h, b, s] = el.querySelectorAll(".sr");
  h.querySelector("i").style.width = Math.max(0, p.hp / D.hp * 100) + "%"; h.classList.toggle("low", p.hp <= 1 && !p.dead);
  b.querySelector("i").style.width = (p.battery || 0) + "%"; b.classList.toggle("low", p.battery < 20); b.classList.toggle("off", !p.lightOn);
  s.querySelector("i").style.width = (p.stamina ?? 100) + "%"; s.classList.toggle("low", p.stamina < 20);
}
TUT_STEPS.forEach((s, i) => { s.t = [() => "Dùng <b>W A S D</b> để di chuyển", () => "Rê <b>chuột</b> để nhìn xung quanh", () => "Bấm <b>F</b> để tắt / bật đèn pin — pin có hạn",
  () => "Giữ <b>Shift</b> để chạy — nhưng tiếng chân sẽ dụ chúng tới", () => "Nhìn vào đồ vật có chữ gợi ý rồi bấm <b>E</b> để tương tác", () => "Bấm <b>M</b> để mở bản đồ, bấm lần nữa để đóng",
  () => "Bảng <b>Nhiệm vụ</b> ở góc phải (phím <b>J</b> để thu gọn). Mỗi việc xong sẽ đánh thức thêm thứ trong bóng tối..."][i] || s.t; });
function buildModeUI() {
  const box = $("modeBtns"); box.innerHTML = "";
  [["single", "Một người"], ["online", "Hai người (online)"]].forEach(([k, n]) => { const a = document.createElement("a"); a.textContent = n; a.classList.toggle("sel", MODE === k); a.onclick = () => { if (MODE === k) return; MODE = k; if (k === "single") { netClose(); $("startBtn").classList.remove("wait"); $("startBtn").textContent = "Vào game"; } buildModeUI(); }; box.appendChild(a); });
  $("modeDesc").innerHTML = MODE === "online" ? "Mỗi người chơi trên một máy riêng. Một người <b>tạo phòng</b> rồi gửi ID cho bạn; người kia <b>nhập ID</b> để vào cùng. Hai người: nhiều nhiệm vụ hơn — và nhiều thứ trong bóng tối hơn." : "Một mình trong bóng tối.";
  $("netBox").classList.toggle("hidden", MODE !== "online");
}

// ---- Nhạc nền du dương: giai điệu ru buồn + dây đàn, vẫn rợn người ----
function songOut(m) { return m.sg; }
function vPiano(m, f, t0, dur, vol) { [1, 2, 3, 4.02].forEach((h, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = i ? "sine" : "triangle"; o.frequency.value = f * h; o.detune.value = (Math.random() - .5) * 5; const v = vol / (1 + i * i * 1.4);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .006); g.gain.exponentialRampToValueAtTime(v * .3, t0 + .3); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur + 1.6 / (1 + i)); o.connect(g); g.connect(songOut(m)); o.start(t0); o.stop(t0 + dur + 1.8); }); }
function vBox(m, f, t0, dur, vol) { [[1, 1], [2.003, .35], [4.01, .14], [5.43, .06]].forEach(([h, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = h === 1 ? "triangle" : "sine"; o.frequency.value = f * h; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * a, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + 2.6 * (h === 1 ? 1 : .5)); o.connect(g); g.connect(songOut(m)); o.start(t0); o.stop(t0 + 2.7); }); }
function vFlute(m, f, t0, dur, vol) { const o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); o.type = "sine"; o.frequency.value = f; l.frequency.value = 5; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f * .009, t0 + dur * .7); l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .18); g.gain.setValueAtTime(vol * .85, t0 + dur * .85); g.gain.linearRampToValueAtTime(0, t0 + dur + .25); o.connect(g); g.connect(songOut(m)); o.start(t0); o.stop(t0 + dur + .3); l.start(t0); l.stop(t0 + dur + .3); }
function vHarp(m, f, t0, dur, vol) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = f; lp.frequency.setValueAtTime(f * 8, t0); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t0 + .6); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1.4); o.connect(lp); lp.connect(g); g.connect(songOut(m)); o.start(t0); o.stop(t0 + 1.5); }
function vErhu(m, f, t0, dur, vol) { const o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter(), l = ac.createOscillator(), lg = ac.createGain(); o.type = "sawtooth"; bp.type = "bandpass"; bp.frequency.value = f * 2.4; bp.Q.value = 1.3;
  o.frequency.setValueAtTime(f * .94, t0); o.frequency.exponentialRampToValueAtTime(f, t0 + .22); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(f * .014, t0 + dur * .6); l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol * 1.6, t0 + .15); g.gain.setValueAtTime(vol * 1.4, t0 + dur * .8); g.gain.linearRampToValueAtTime(0, t0 + dur + .3); o.connect(bp); bp.connect(g); g.connect(songOut(m)); o.start(t0); o.stop(t0 + dur + .35); l.start(t0); l.stop(t0 + dur + .35); }
function vStrings(m, f, t0, dur, vol) { const lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = "lowpass"; lp.frequency.value = 950; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * .4); g.gain.linearRampToValueAtTime(vol * .7, t0 + dur * .85); g.gain.linearRampToValueAtTime(0, t0 + dur + .8); lp.connect(g); g.connect(songOut(m));
  [-8, 0, 8].forEach(d => { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = d; o.connect(lp); o.start(t0); o.stop(t0 + dur + .9); }); }
const SONGS = {   // nhịp 3/4, mỗi ô nhịp: hợp âm (nốt trầm + 3 nốt) và giai điệu [nốt MIDI, số phách]
  menu: { bpm: 66, voice: vPiano, vol: .07, bars: [
    { ch: [45, 57, 60, 64], m: [[76, 2], [81, 1]] }, { ch: [45, 57, 60, 64], m: [[84, 1], [83, 1], [81, 1]] }, { ch: [50, 57, 62, 65], m: [[77, 2], [81, 1]] }, { ch: [50, 57, 62, 65], m: [[79, 1], [77, 1], [76, 1]] },
    { ch: [40, 56, 59, 64], m: [[80, 2], [83, 1]] }, { ch: [40, 56, 59, 64], m: [[76, 3]] }, { ch: [45, 57, 60, 64], m: [[81, 1], [76, 1], [72, 1]] }, { ch: [45, 57, 60, 64], m: [[69, 3]] }] },
  house: { bpm: 80, voice: vBox, vol: .085, bars: [
    { ch: [45, 57, 60, 64], m: [[76, 2], [81, 1]] }, { ch: [45, 57, 60, 64], m: [[84, 1], [83, 1], [81, 1]] }, { ch: [45, 57, 60, 64], m: [[76, 3]] },
    { ch: [50, 57, 62, 65], m: [[77, 2], [81, 1]] }, { ch: [50, 57, 62, 65], m: [[79, 1], [77, 1], [76, 1]] }, { ch: [50, 57, 62, 65], m: [[74, 3]] },
    { ch: [45, 57, 60, 64], m: [[76, 2], [81, 1]] }, { ch: [45, 57, 60, 64], m: [[84, 1], [83, 1], [81, 1]] }, { ch: [40, 56, 59, 64], m: [[80, 2], [83, 1]] },
    { ch: [40, 56, 59, 64], m: [[76, 3]] }, { ch: [45, 57, 60, 64], m: [[81, 1], [76, 1], [72, 1]] }, { ch: [45, 57, 60, 64], m: [[69, 3]] }] },
  forest: { bpm: 60, voice: vFlute, vol: .06, bars: [
    { ch: [38, 57, 62, 65], m: [[74, 2], [72, 1]] }, { ch: [38, 57, 62, 65], m: [[69, 3]] }, { ch: [36, 55, 60, 64], m: [[67, 1], [69, 1], [72, 1]] }, { ch: [36, 55, 60, 64], m: [[74, 3]] },
    { ch: [34, 58, 62, 65], m: [[70, 2], [69, 1]] }, { ch: [34, 58, 62, 65], m: [[67, 3]] }, { ch: [33, 57, 60, 64], m: [[69, 1], [67, 1], [65, 1]] }, { ch: [33, 57, 60, 64], m: [[62, 3]] }] },
  castle: { bpm: 88, voice: vHarp, vol: .06, bars: [
    { ch: [38, 62, 65, 69], m: [[62, 1], [65, 1], [69, 1]] }, { ch: [38, 62, 65, 69], m: [[74, 2], [73, 1]] }, { ch: [43, 62, 67, 70], m: [[70, 1], [74, 1], [79, 1]] }, { ch: [43, 62, 67, 70], m: [[77, 2], [76, 1]] },
    { ch: [45, 61, 64, 69], m: [[73, 1], [76, 1], [79, 1]] }, { ch: [45, 61, 64, 69], m: [[81, 2], [79, 1]] }, { ch: [38, 62, 65, 69], m: [[77, 1], [76, 1], [74, 1]] }, { ch: [38, 62, 65, 69], m: [[74, 3]] }] },
  cemetery: { bpm: 56, voice: vErhu, vol: .05, bars: [
    { ch: [40, 59, 64, 67], m: [[64, 2], [67, 1]] }, { ch: [40, 59, 64, 67], m: [[69, 1], [67, 1], [64, 1]] }, { ch: [40, 59, 64, 67], m: [[62, 3]] },
    { ch: [45, 60, 64, 69], m: [[64, 2], [69, 1]] }, { ch: [45, 60, 64, 69], m: [[71, 1], [69, 1], [67, 1]] }, { ch: [45, 60, 64, 69], m: [[64, 3]] },
    { ch: [40, 59, 64, 67], m: [[67, 1], [64, 1], [62, 1]] }, { ch: [40, 59, 64, 67], m: [[64, 3]] }] },
  factory: { bpm: 64, voice: vPiano, vol: .07, bars: [
    { ch: [36, 60, 63, 67], m: [[72, 1], [75, 1], [79, 1]] }, { ch: [36, 60, 63, 67], m: [[78, 3]] }, { ch: [44, 60, 63, 68], m: [[80, 1], [79, 1], [75, 1]] }, { ch: [44, 60, 63, 68], m: [[72, 3]] },
    { ch: [41, 60, 65, 68], m: [[77, 1], [75, 1], [72, 1]] }, { ch: [43, 59, 62, 67], m: [[71, 2], [74, 1]] }, { ch: [36, 60, 63, 67], m: [[75, 1], [74, 1], [72, 1]] }, { ch: [36, 60, 63, 67], m: [[72, 3]] }] },
};
