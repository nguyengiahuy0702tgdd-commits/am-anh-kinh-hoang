// =====================================================================
//  CHƠI ONLINE 2 MÁY: tạo phòng / nhập ID phòng (WebRTC qua PeerJS)
//  Máy chủ phòng giữ toàn bộ thế giới (ma, câu đố); máy khách gửi vị trí & hành động.
// =====================================================================
const MAXP = 4, PCOL = ["#c8302a", "#3a78e0", "#38b060", "#e0b030"];
const NET = { on: false, host: false, ok: false, code: "", peer: null, bc: null, me: Math.random().toString(36).slice(2), pt: 0, st: 0,
  links: {}, link: null, hostId: null, slot: 0, roster: [0] };
let REMOTE = false, REMOTE_LOCK = null, MATES = [];
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; };
function netStatus(html) { $("netStatus").innerHTML = html; }
function loadPeerJS() {
  if (window.Peer) return Promise.resolve(true);
  return new Promise(res => { const s = document.createElement("script"); s.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"; s.onload = () => res(!!window.Peer); s.onerror = () => res(false); document.head.appendChild(s); setTimeout(() => res(!!window.Peer), 9000); });
}
const newCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
const mateOf = s => MATES.find(m => m.slot === s) || null;
function withMate(s, fn) { const prev = P2, m = mateOf(s); P2 = m; try { return fn(); } finally { P2 = prev; } }
// Gửi: chủ phòng phát cho mọi khách (hoặc riêng một người: m.to); khách chỉ gửi cho chủ phòng
function netSend(o) {
  if (!NET.ok) return;
  try {
    if (NET.host) { for (const k in NET.links) { const s = +k; if (o.to != null && o.to !== s) continue; if (o._x === s) continue; NET.links[k].send({ ...o, _s: o._s ?? 0 }); } }
    else NET.link?.send(o);
  } catch (e) {}
}
// Chủ phòng nhận từ khách: chuyển tiếp cho các khách còn lại rồi tự xử lý như hành động của người đó
function netFromGuest(s, m) {
  if (!m || !m.t) return;
  if (!["lobby", "start", "snap", "roster", "full", "scare", "lose"].includes(m.t)) for (const k in NET.links) if (+k !== s) try { NET.links[k].send({ ...m, _s: s }); } catch (e) {}
  withMate(s, () => netRecv(m));
}
function netFromHost(m) {
  if (!m || !m.t) return;
  if (m.to != null && m.to !== NET.slot) return;
  if (m.t === "roster") { NET.roster = m.r; NET.slot = m.you; if (!NET.ok) { NET.ok = true; tone(660, 0, .4, .05); tone(880, .15, .5, .05); } netGuestUI(); return; }
  if (m.t === "full") { netStatus(m.why === "started" ? "Phòng này đang chơi dở — chờ ván sau hoặc tạo phòng mới." : `Phòng đã đủ ${MAXP} người.`); netClose(); return; }
  withMate(m._s ?? 0, () => netRecv(m));
}
const freeSlot = () => { for (let s = 1; s < MAXP; s++) if (!NET.links[s]) return s; return -1; };
function netRoster() {
  NET.roster = [0, ...Object.keys(NET.links).map(Number).sort((a, b) => a - b)];
  for (const k in NET.links) try { NET.links[k].send({ t: "roster", r: NET.roster, you: +k, _s: 0 }); } catch (e) {}
  netHostUI();
}
function netHostUI() {
  const n = NET.roster.length;
  netStatus(`ID phòng: <b class="code">${NET.code}</b> <a class="copy" onclick="navigator.clipboard?.writeText('${NET.code}')">sao chép</a> · <b>${n}/${MAXP}</b> người<br>` +
    (n > 1 ? `<span class="ok">${n - 1} đồng đội đã vào phòng.</span> Bấm <b>Vào game</b> khi đủ người — đông người thì nhiệm vụ nhiều hơn.` : "Gửi ID này cho bạn bè (tối đa 3 người nữa). Đang chờ..."));
}
function netGuestUI() {
  netStatus(`<span class="ok">Đã vào phòng ${NET.code}</span> · bạn là <b style="color:${PCOL[NET.slot]}">Người ${NET.slot + 1}</b> · <b>${NET.roster.length}/${MAXP}</b> người.<br>Chờ chủ phòng chọn map và bắt đầu...`);
  $("startBtn").classList.add("wait"); $("startBtn").textContent = "Chờ chủ phòng...";
}
function hostJoined(s) {
  NET.ok = true; tone(660, 0, .4, .05); tone(880, .15, .5, .05); netRoster(); netLobby();
}
function hostLeft(s) {
  if (!NET.links[s]) return; delete NET.links[s];
  const m = mateOf(s);
  if (S.started && !S.ending && m) { m.dead = true; m.f = null; m.gone = true; say(`Người ${s + 1} đã mất kết nối...`); }
  if (!Object.keys(NET.links).length) { NET.ok = false; if (!S.started) netStatus("Đồng đội đã rời phòng. Gửi lại ID phòng cho bạn bè."); }
  NET.roster = [0, ...Object.keys(NET.links).map(Number).sort((a, b) => a - b)];
  for (const k in NET.links) try { NET.links[k].send({ t: "roster", r: NET.roster, you: +k, _s: 0 }); } catch (e) {}
  if (!S.started && NET.ok) netHostUI();
}
function netConnected() { if (NET.host) netHostUI(); else netGuestUI(); }
function netLost() {
  if (!NET.ok) return; NET.ok = false;
  if (S.started && !S.ending) { say("Mất kết nối với chủ phòng. Bạn chỉ còn một mình..."); for (const m of MATES) { m.dead = true; m.f = null; } NET.on = false; COOP = false; MATES = []; P2 = null; }
  else netStatus("Mất kết nối. Hãy tạo phòng mới hoặc nhập lại ID phòng.");
}
async function netHost() {
  netClose(); NET.on = true; NET.host = true; NET.code = newCode(); NET.slot = 0; NET.roster = [0]; netStatus("Đang tạo phòng...");
  const useLocal = location.search.includes("local") || !(await loadPeerJS());
  if (useLocal) { netLocal(); netHostUI(); return; }
  const peer = NET.peer = new Peer("demamanh-" + NET.code);
  peer.on("open", () => netHostUI());
  peer.on("connection", c => {
    const s = S.started ? -1 : freeSlot();
    if (s < 0) { c.on("open", () => { try { c.send({ t: "full", why: S.started ? "started" : "full" }); } catch (e) {} setTimeout(() => c.close(), 600); }); return; }
    NET.links[s] = { send: m => c.send(m), close: () => c.close() };
    c.on("open", () => hostJoined(s)); c.on("data", m => netFromGuest(s, m)); c.on("close", () => hostLeft(s));
  });
  peer.on("error", e => { if (e.type === "unavailable-id") return netHost(); netStatus("Không tạo được phòng (" + e.type + "). Kiểm tra kết nối mạng rồi thử lại."); });
}
async function netJoin(code) {
  code = (code || "").trim().toUpperCase(); if (code.length < 4) return netStatus("Hãy nhập ID phòng (6 ký tự) mà bạn bè gửi cho bạn.");
  netClose(); NET.on = true; NET.host = false; NET.code = code; netStatus("Đang kết nối tới phòng " + code + "...");
  const useLocal = location.search.includes("local") || !(await loadPeerJS());
  if (useLocal) { netLocal(); NET.bc.postMessage({ j: 1, _f: NET.me }); setTimeout(() => { if (!NET.ok && NET.on) netStatus("Không tìm thấy phòng " + code + "."); }, 4000); return; }
  const peer = NET.peer = new Peer();
  peer.on("open", () => { const c = peer.connect("demamanh-" + code, { reliable: true, serialization: "json" }); NET.link = { send: m => c.send(m), close: () => c.close() }; c.on("data", netFromHost); c.on("close", netLost); });
  peer.on("error", e => netStatus(e.type === "peer-unavailable" ? "Không tìm thấy phòng " + code + ". Kiểm tra lại ID." : "Lỗi kết nối (" + e.type + ")."));
}
function netLocal() {   // dự phòng: nhiều tab trên cùng trình duyệt
  const bc = NET.bc = new BroadcastChannel("demamanh-" + NET.code);
  bc.onmessage = e => { const m = e.data; if (!m || m._f === NET.me) return;
    if (NET.host) {
      if (m.j) { const s = S.started ? -1 : freeSlot(); if (s < 0) { bc.postMessage({ _f: NET.me, _to: m._f, d: { t: "full", why: S.started ? "started" : "full" } }); return; }
        const gid = m._f; NET.links[s] = { id: gid, send: d => bc.postMessage({ _f: NET.me, _to: gid, d }), close() {} }; hostJoined(s); return; }
      if (m.bye) { for (const k in NET.links) if (NET.links[k].id === m._f) hostLeft(+k); return; }
      if (m._to !== NET.me) return; for (const k in NET.links) if (NET.links[k].id === m._f) return netFromGuest(+k, m.d);
    } else {
      if (m._to !== NET.me) return;
      if (!NET.hostId) { NET.hostId = m._f; NET.link = { send: d => bc.postMessage({ _f: NET.me, _to: NET.hostId, d }), close() {} }; }
      netFromHost(m.d);
    }
  };
}
addEventListener("beforeunload", () => { try { NET.bc?.postMessage({ bye: 1, _f: NET.me }); } catch (e) {} });
function netClose() { try { NET.link?.close(); for (const k in NET.links) NET.links[k].close?.(); NET.peer?.destroy(); if (NET.bc && !NET.host) NET.bc.postMessage({ bye: 1, _f: NET.me }); NET.bc?.close(); } catch (e) {} Object.assign(NET, { on: false, ok: false, link: null, links: {}, hostId: null, peer: null, bc: null, slot: 0, roster: [0] }); }
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
    case "note": say(pname(P2) + ": " + m.text); break;
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
  if (label) toast(pname(P2) + ": " + label);
}
function toast(text) { const el = $("toast"); el.textContent = text; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
function netApplySnap(m) {
  const list = m.g; for (let i = 0; i < list.length; i++) { const src = list[i], g = ghosts[i]; if (!g) ghosts[i] = { ...src, nx: src.x, ny: src.y }; else { const { x, y, ...rest } = src; Object.assign(g, rest); g.nx = x; g.ny = y; } }
  ghosts.length = list.length;
  for (const q of (m.pl || [])) { const o = mateOf(q.s); if (o) Object.assign(o, { hp: q.hp, dead: q.dead, rev: q.rev }); }
  const y = m.you; if (y.hp < P1.hp) hurt = 1; Object.assign(P1, { hp: y.hp, dead: y.dead, rev: y.rev }); S.clockMin = m.cm ?? S.clockMin; S.woke = m.woke;
}
function netTick(dt) {
  if (!NET.ok) return;
  if ((NET.pt -= dt) <= 0) { NET.pt = .066; const p = P1; netSend({ t: "pose", x: p.x, y: p.y, a: p.a, p: p.pitch, l: p.lightOn, h: p.hidden, r: p.running, mv: p.moving, b: p.bob, jy: p.jy || 0, cr: p.crH || 0, bat: p.battery, st: p.stamina, hp: p.hp, dead: p.dead, f: F.id }); }
  if (NET.host && (NET.st -= dt) <= 0) { NET.st = .1; const pl = players().map(p => ({ s: p.slot ?? 0, hp: p.hp, dead: !!p.dead, rev: p.rev || 0 }));
    for (const q of MATES) if (NET.links[q.slot]) netSend({ t: "snap", to: q.slot, g: ghosts.map(g => ({ ...g })), you: { hp: q.hp, dead: !!q.dead, rev: q.rev || 0 }, pl, cm: S.clockMin, woke: S.woke, fid: F.id }); }
}
function finalLose(text) { S.paused = true; S.ending = true; document.exitPointerLock?.(); $("loseText").textContent = text; bloodify($("lose").querySelector("h1")); $("lose").classList.remove("hidden"); }
function lose(text) {
  if (COOP && player.hp <= 0 && !player.dead) {
    const others = players().filter(q => q !== player && !q.dead && !q.gone);
    if (others.length) { player.dead = true; player.hidden = false; player.lightOn = false; S.lastLose = text; noise(1.2, 100, .6, .5); say(player === P1 ? "Bạn đã gục ngã! Đồng đội hãy tới đứng sát bên để kéo bạn dậy." : `${pname(player)} đã gục ngã! Hãy tới đứng sát bên để kéo dậy.`); return; }
  }
  if (NET.ok && NET.host) netSend({ t: "lose", text }); finalLose(text);
}
function jumpScare(after) {
  const who = player;
  if (REMOTE) { if (after) after(); return; }
  if (NET.ok && NET.host && who !== P1 && MATES.includes(who)) { netSend({ t: "scare", to: who.slot }); if (after) withPlayer(who, after); return; }
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
  if (COOP) { const k = Math.min(1, dt * 12); for (const q of MATES) if (q.nx != null) { q.x += (q.nx - q.x) * k; q.y += (q.ny - q.y) * k; q.a += angTo(q.a, q.na) * k; } }
  if (!NET.on || NET.host || !NET.ok) {
    if (COOP && MATES.length && NET.ok) {
      const alive = players().filter(p => !p.dead && !p.gone && p.f);   // mỗi người có thể ở một tầng khác nhau
      const dm = p => { let m = 99; for (const g of ghosts) if (g.floor === (p.f || F.id)) m = Math.min(m, Math.hypot(g.x - p.x, g.y - p.y)); return m; };
      let tg = S.target && alive.includes(S.target) ? S.target : alive[0] || P1;
      for (const o of alive) if (o !== tg && dm(o) < dm(tg) - 1.5) tg = o;
      const Fh = F, Ft = FLOORS[tg.f] || F, P2h = P2;
      S.target = tg; player = tg; if (tg !== P1) P2 = tg; F = Ft; try { MD.update(dt); } finally { player = P1; P2 = P2h; if (F === Ft) F = Fh; }
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
  for (const p of players()) if (p && p.dead && !p.gone) {
    const o = players().find(q => q !== p && !q.dead && !q.gone && q.f === p.f && Math.hypot(q.x - p.x, q.y - p.y) < 1.3);
    if (o) { p.rev = (p.rev || 0) + dt; if (p.rev > 2.5) { Object.assign(p, { dead: false, hp: 1, invuln: 3, rev: 0, lightOn: true }); tone(523, 0, .8, .05); tone(659, .2, .9, .05); say(`${pname(o)} đã kéo ${pname(p)} dậy! Cẩn thận — chỉ còn 1 máu.`); } }
    else p.rev = Math.max(0, (p.rev || 0) - dt);
  }
}
function ctlP1() { const k = keys; return { f: (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0), s: (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), turn: (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0), run: !!(k.ShiftLeft || k.ShiftRight) }; }
function spawnSpots(q) {   // chỗ đứng ban đầu của 4 người — giống nhau trên mọi máy
  const out = [{ x: q.x, y: q.y, a: q.a }], a = q.a + Math.PI / 2;
  for (const [d, b] of [[.7, 0], [-.7, 0], [0, -.8], [.7, -.8], [-.7, -.8], [1.2, 0], [-1.2, 0], [0, -1.5], [1.2, -1.2], [-1.2, -1.2]]) {
    if (out.length >= MAXP) break; const x = q.x + Math.cos(a) * d + Math.cos(q.a) * b, y = q.y + Math.sin(a) * d + Math.sin(q.a) * b;
    if (canStand(x, y) && out.every(p => Math.hypot(p.x - x, p.y - y) > .5)) out.push({ x, y, a: q.a });
  }
  while (out.length < MAXP) out.push({ x: q.x, y: q.y, a: q.a }); return out;
}
function setupCoop() {
  COOP = NET.on && NET.ok && NET.roster.length > 1; document.body.classList.remove("coop"); document.body.classList.toggle("online", COOP);
  Object.assign(P1, { dead: false, rev: 0, fl: null, aim: null, aimS: null, f: F.id, slot: COOP ? NET.slot : 0, gone: false });
  S.spawn0 = { f: F.id, x: P1.x, y: P1.y, a: P1.a }; MATES = []; S.coopPend = null; S.spawnPos = null;
  if (COOP) {
    // Trong lúc dựng thế giới (nhiệm vụ, đồ đạc...) mọi máy phải thấy CÙNG một bộ vị trí, nên P1 tạm đứng ở chỗ xuất phát
    // và chưa có đồng đội; dựng xong (coopPlace) mới đưa mỗi người về chỗ của mình.
    const pos = spawnSpots(S.spawn0), mates = [];
    S.spawnPos = NET.roster.map(s => pos[s]);
    for (const s of NET.roster) if (s !== NET.slot) { const m = { ...P1, slot: s, fl: null, aim: null, aimS: null, hp: D.hp, stamina: 100, battery: 75, lightOn: true, hidden: false, invuln: 0, bob: 1.5, nx: null, f: F.id, dead: false, gone: false, rev: 0 }; Object.assign(m, pos[s]); mates.push(m); }
    S.coopPend = { mates, me: pos[NET.slot] };
  }
  P2 = null;
  teamHUD();
}
function coopPlace() {
  const c = S.coopPend; if (!c) return; S.coopPend = null;
  MATES = c.mates; Object.assign(P1, c.me); P2 = MATES[0] || null; teamHUD();
}
function teamHUD() {
  const base = $("st2"), down = $("down2");
  for (let i = 3; i <= MAXP; i++) if (!$("st" + i)) { const c = base.cloneNode(true); c.id = "st" + i; base.parentNode.appendChild(c); }
  const ms = MATES.length ? MATES : (S.coopPend?.mates || []);
  for (let i = 2; i <= MAXP; i++) { const el = $("st" + i), m = ms[i - 2]; el.classList.toggle("hidden", !m); el.classList.add("mate"); el.style.setProperty("--mi", i - 2); if (m) { el.querySelector(".who").textContent = "Người " + (m.slot + 1); el.style.setProperty("--pc", PCOL[m.slot]); } }
  const w1 = $("st1").querySelector(".who"); w1.textContent = COOP ? `Bạn · Người ${NET.slot + 1}` : "Bạn"; $("st1").style.setProperty("--pc", PCOL[COOP ? NET.slot : 0]);
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
  [["single", "Một người"], ["online", "Nhiều người (online)"]].forEach(([k, n]) => { const a = document.createElement("a"); a.textContent = n; a.classList.toggle("sel", MODE === k); a.onclick = () => { if (MODE === k) return; MODE = k; if (k === "single") { netClose(); $("startBtn").classList.remove("wait"); $("startBtn").textContent = "Vào game"; } buildModeUI(); }; box.appendChild(a); });
  $("modeDesc").innerHTML = MODE === "online" ? "Từ 2 đến 4 người, mỗi người một máy. Một người <b>tạo phòng</b> rồi gửi ID; những người khác <b>nhập ID</b> để vào cùng. Càng đông người, nhiệm vụ càng nhiều — hãy chia nhau ra làm." : "Một mình trong bóng tối.";
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

// ---- Áo mỗi người một màu (khớp màu tên trên HUD và mũi tên trên bản đồ) ----
buildPeopleTextures = (o => function () {
  o();
  PCOL.forEach((c, i) => { T["coatS" + i] = tex(g => { R(g, 0, 0, 128, 128, c); R(g, 0, 0, 128, 128, "rgba(0,0,0,.45)"); for (let k = 0; k < 90; k++) R(g, rnd() * 128, rnd() * 128, 1, 3 + rnd() * 8, "rgba(0,0,0,.2)"); R(g, 0, 60, 128, 8, "rgba(230,230,210,.5)"); }); });
})(buildPeopleTextures);
(function () {
  const st = document.createElement("style");
  st.textContent = `body.online .stats .who{color:var(--pc,#c4362a)}
body.online .stats.mate{left:1.4vw !important;right:auto !important;width:200px;padding:6px 12px;gap:4px;bottom:calc(4vh + 150px + var(--mi,0) * 74px);background:linear-gradient(90deg,rgba(8,2,2,.55),rgba(8,2,2,0))}
body.online .stats.mate .who{font-size:15px} body.online .stats.mate .sr.sm{display:none} body.online .stats.mate .sr b{font-size:11px}
body.online .stats.mate.dead{opacity:.6} body.online .stats.mate.dead .who{color:#ff5040}
body.online .stats.mate{display:none !important}
body.online #st1{width:auto !important;left:1.4vw !important;padding:7px 12px;gap:4px;border-radius:10px}
body.online #st1 .who{font-size:15px} body.online #st1 .sr{grid-template-columns:58px 96px;gap:8px} body.online #st1 .sr b{font-size:10.5px;letter-spacing:.12em} body.online #st1 .sr span{height:6px}`;
  document.head.appendChild(st);
})();
