// =====================================================================
//  53. GỢI Ý NHIỆM VỤ THEO ĐỘ KHÓ
//  Phím H: hiện gợi ý chi tiết cho bước hiện tại + mũi tên chỉ hướng (kể cả khi
//  mục tiêu ở tầng khác: mũi tên dẫn tới cầu thang đúng).
//   · Dễ:        mũi tên luôn hiện · bấm H thoải mái · kẹt 40 giây là tự nhắc
//   · Trung bình: H còn 6 lần (mũi tên 15 giây) · kẹt 2 phút tự nhắc
//   · Khó:       H còn 3 lần (mũi tên 6 giây) · kẹt 4 phút tự nhắc (chỉ chữ)
//   · Siêu khó:  H đúng 1 lần, chỉ có chữ
//  Danh sách nhiệm vụ (Tab) ở Dễ & Trung bình ghi rõ cách làm bước hiện tại.
// =====================================================================
const HINT_CFG = {
  de:   { always: 1, uses: Infinity, dur: 20, cd: 4,  auto: 40,  autoArrow: 1, full: 1 },
  tb:   { always: 0, uses: 6,        dur: 15, cd: 15, auto: 120, autoArrow: 1, full: 1 },
  kho:  { always: 0, uses: 3,        dur: 6,  cd: 45, auto: 240, autoArrow: 0, full: 0 },
  sieu: { always: 0, uses: 1,        dur: 0,  cd: 0,  auto: 0,   autoArrow: 0, full: 0 },
};
// Mục tiêu của từng bước: "c:X" = ô có ký tự X · "a:ten" = đồ vật có hành động ten · hàm → tự chọn
const HINT_T = {
  house: [["c:J"], ["c:L"], ["c:T"], ["c:Q"], ["c:G"], ["c:R"], ["c:Z"], ["c:B"], ["c:D"], ["c:C", "c:M"], ["c:X"]],
  forest: [["a:tent1", "a:tent2", "a:tent3"], ["a:fire"], () => S.held > 0 ? ["a:fire"] : ["a:effigy"], ["a:well"], () => S.cabinOpen ? ["a:fuel"] : ["c:d"], ["a:car"]],
  castle: [["a:lore"],
    () => [!S.p1 && "c:h", !S.p2 && "a:cand", !S.p3 && (S.towerOpen ? "a:bell" : has("bronzekey") ? "c:L" : "c:B")].filter(Boolean),
    () => S.gotChestKey ? ["a:chest"] : ["a:plate"], ["c:s"], ["a:coffin"], ["c:k"]],
  cemetery: [["a:clog"], ["a:shovel"], () => D === DIFF.de ? ["a:grave#ok"] : ["a:grave"], () => S.mausOpen ? ["a:altar2"] : ["c:f"], ["c:k"]],
  factory: [["c:7"], ["c:X"], ["c:D"], ["a:valve"], ["a:fuel"], () => S.genOpen ? ["a:gen"] : ["c:L"], ["c:q"]],
  hospital: [["c:7"], ["a:drawer"], ["c:Z"], ["c:P"], ["c:G"], ["c:Q"], ["c:L"], ["c:D"], ["a:heart"], ["c:O"], ["c:X"]],
};
const HN = { used: 0, last: -1e9, until: 0, stuckT: 0, sig: "", autoDone: 0, el: null, nav: null, pill: null, cfg: null };
const hintCfg = () => HINT_CFG[Object.keys(DIFF).find(k => DIFF[k] === D) || "tb"] || HINT_CFG.tb;

function hintUI() {
  if (HN.el) return;
  const st = document.createElement("style");
  st.textContent = `
#hintBox{position:fixed;left:50%;top:178px;transform:translateX(-50%);max-width:min(640px,86vw);padding:10px 18px 11px;background:rgba(14,10,8,.86);border:1px solid rgba(217,204,178,.25);border-left:3px solid var(--blood2,#c8553a);color:#e9dcc4;font:15px/1.45 var(--body);z-index:30;opacity:0;transition:opacity .5s;pointer-events:none;border-radius:3px;box-shadow:0 10px 30px rgba(0,0,0,.6)}
#hintBox.on{opacity:1}#hintBox b{color:var(--blood2,#c8553a);font-weight:600;letter-spacing:.08em;margin-right:6px}
#hintNav{position:fixed;left:50%;top:132px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;z-index:29;opacity:0;transition:opacity .4s;pointer-events:none;color:#e9dcc4;font:13px/1 var(--body);letter-spacing:.06em;text-shadow:0 1px 3px #000}
#hintNav.on{opacity:.92}#hintNav svg{width:34px;height:34px;filter:drop-shadow(0 2px 3px #000);transition:transform .12s linear}
#hintNav .fl{color:var(--blood2,#c8553a);font-weight:600}
#hintPill{position:fixed;right:28px;top:142px;z-index:25;font:13px/1 var(--body);color:#cdbfa6;opacity:.8;pointer-events:none;letter-spacing:.05em}
#hintPill kbd{display:inline-block;border:1px solid rgba(217,204,178,.5);border-radius:4px;padding:2px 6px;margin-right:6px;font:600 12px/1 sans-serif;color:#efe2c8}`;
  document.head.appendChild(st);
  HN.el = Object.assign(document.createElement("div"), { id: "hintBox" });
  HN.nav = Object.assign(document.createElement("div"), { id: "hintNav", innerHTML: `<svg viewBox="0 0 40 40"><path d="M20 3 L33 31 L20 24 L7 31 Z" fill="#d9ccb2" stroke="#3a0a06" stroke-width="1.6"/></svg><span class="d"></span><span class="fl"></span>` });
  HN.pill = Object.assign(document.createElement("div"), { id: "hintPill" });
  document.body.append(HN.el, HN.nav, HN.pill);
}

// ---------- Tìm vị trí mục tiêu ----------
function hintTokens() {
  const tb = HINT_T[MAPID]; if (!tb || !GOALS) return null;
  const cur = GOALS.findIndex(g => !safeG(g[0])), last = GOALS.length - 1;
  if (cur === last || cur < 0) {
    const left = TASKS.filter(q => q.got < q.need);
    if (left.length) return { tk: ["task"], text: `Còn nhiệm vụ phụ: ${left.map(q => q.name).join(" · ")}. Làm xong mới mở được lối thoát.` };
  }
  let tk = tb[cur]; if (typeof tk === "function") tk = tk();
  let tx = GOALS[cur]?.[1]; if (typeof tx === "function") tx = tx();
  return { tk: tk || [], text: tx || "" };
}
function hintFind(tk) {
  const res = [];
  for (const f of Object.values(FLOORS)) for (const t of tk) {
    if (t === "task") { for (const s of f.sprites) if (s.k === "task" && s.act && !s.taken) res.push({ f, x: s.x, y: s.y }); continue; }
    const [kind, name0] = t.split(":"), [name, flag] = name0.split("#");
    if (kind === "a") { for (const s of f.sprites) if (s.act === name && !s.taken && (flag !== "ok" || S.cemOrder?.[s.idx] === 0)) res.push({ f, x: s.x, y: s.y }); }
    else for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.grid[y][x] === name) res.push({ f, x: x + .5, y: y + .5 });
  }
  if (!res.length) return null;
  const here = res.filter(r => r.f === F);
  if (here.length) return here.reduce((a, b) => Math.hypot(a.x - player.x, a.y - player.y) < Math.hypot(b.x - player.x, b.y - player.y) ? a : b);
  return res[0];
}
function hintRoute(tg) {                         // mục tiêu ở tầng khác → chỉ tới cầu thang dẫn về hướng đó
  if (!tg || tg.f === F) return tg;
  let ws = []; try { ws = [...allWells().values()]; } catch (e) {}
  const prev = new Map([[F.id, null]]), q = [F.id];
  while (q.length) { const id = q.shift(); if (id === tg.f.id) break; for (const w of ws) if (w.f.id === id && !prev.has(w.p.f.id)) { prev.set(w.p.f.id, w); q.push(w.p.f.id); } }
  if (!prev.has(tg.f.id)) return { ...tg, f: F, far: 1, x: player.x, y: player.y, lost: 1 };
  let w = prev.get(tg.f.id); while (w && w.f !== F) w = prev.get(w.f.id);
  return w ? { f: F, x: w.ox - w.s * .3, y: w.oy + w.c * .3, stair: w.dir > 0 ? "up" : "down", final: tg } : tg;
}
function hintTarget() { const h = hintTokens(); if (!h) return null; const tg = hintFind(h.tk); return { ...h, tg: hintRoute(tg) }; }

// ---------- Hiện gợi ý ----------
function showHint(auto) {
  hintUI(); const c = hintCfg(), h = hintTarget(); if (!h) return;
  HN.el.innerHTML = `<b>GỢI Ý</b>${h.text}${h.tg?.stair ? ` <i style="opacity:.75">— đi theo mũi tên tới cầu thang ${h.tg.stair === "up" ? "lên" : "xuống"}.</i>` : ""}`;
  HN.el.classList.add("on"); clearTimeout(HN.elT); HN.elT = setTimeout(() => HN.el.classList.remove("on"), 9000);
  if (!auto || c.autoArrow) HN.until = t + c.dur;
}
function hintKey() {
  if (!S.started || S.ending || S.paused) return;
  const c = hintCfg(); hintUI();
  if (HN.used >= c.uses) { HN.el.innerHTML = "<b>GỢI Ý</b>Bạn đã dùng hết lượt gợi ý ở độ khó này."; HN.el.classList.add("on"); clearTimeout(HN.elT); HN.elT = setTimeout(() => HN.el.classList.remove("on"), 3000); return; }
  if (t - HN.last < c.cd) return;
  HN.used++; HN.last = t; showHint(0); try { tone(660, 0, .25, .04); tone(880, .12, .3, .03); } catch (e) {}
}
addEventListener("keydown", e => { if (e.code === "KeyH" && !e.repeat && document.activeElement?.tagName !== "INPUT") hintKey(); });

gameStep = (o => function (dt) {
  o(dt);
  if (!S.started || !GOALS || !HINT_T[MAPID]) return; hintUI();
  const c = hintCfg(), left = c.uses === Infinity ? "" : ` (còn ${Math.max(0, c.uses - HN.used)})`;
  HN.pill.innerHTML = S.ending ? "" : `<kbd>H</kbd>Gợi ý${left}`;
  // kẹt bao lâu rồi?
  const sig = GOALS.map(g => safeG(g[0]) ? 1 : 0).join("") + "|" + TASKS.map(q => q.got).join(",");
  if (sig !== HN.sig) { HN.sig = sig; HN.stuckT = 0; HN.autoDone = 0; }
  else if (!S.paused) HN.stuckT += dt;
  if (c.auto && !HN.autoDone && HN.stuckT > c.auto && !S.paused) { HN.autoDone = 1; showHint(1); }
  // mũi tên
  const show = !S.paused && !S.ending && (c.always || t < HN.until);
  if (!show) { HN.nav.classList.remove("on"); return; }
  const h = hintTarget(), tg = h?.tg; if (!tg || tg.lost) { HN.nav.classList.remove("on"); return; }
  const dx = tg.x - player.x, dy = tg.y - player.y, d = Math.hypot(dx, dy);
  let da = Math.atan2(dy, dx) - player.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  HN.nav.querySelector("svg").style.transform = `rotate(${da}rad)`;
  HN.nav.querySelector(".d").textContent = d < 1.6 && !tg.stair ? "ngay đây" : `${Math.round(d * 2)} m`;
  HN.nav.querySelector(".fl").textContent = tg.stair ? (tg.stair === "up" ? "▲ lên tầng trên" : "▼ xuống tầng dưới") : "";
  HN.nav.classList.add("on");
})(gameStep);

// Tab nhiệm vụ: Dễ & Trung bình ghi rõ cách làm bước hiện tại
renderTasks = (o => function () {
  if (!GOALS || !hintCfg().full) return o();
  const G0 = GOALS, cur = G0.findIndex(g => !safeG(g[0]));
  GOALS = G0.map((g, i) => i === cur && i !== G0.length - 1 ? [g[0], g[1], g[1]] : g);
  try { return o(); } finally { GOALS = G0; }
})(renderTasks);

// Ván mới: đặt lại lượt gợi ý
startGame = (o => function (...a) { Object.assign(HN, { used: 0, last: -1e9, until: 0, stuckT: 0, sig: "", autoDone: 0 }); return o.apply(this, a); })(startGame);
