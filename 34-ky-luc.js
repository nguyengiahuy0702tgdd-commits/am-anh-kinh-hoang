// =====================================================================
//  22. BẢN 8: kỷ lục thời gian hoàn thành · font Morta
// =====================================================================
const REC_KEY = "am-anh-kinh-hoang-records";
function loadRec() { try { return JSON.parse(localStorage.getItem(REC_KEY)) || { best: {}, runs: [] }; } catch (e) { return { best: {}, runs: [] }; } }
const fmtT = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + pad2(m) : m) + ":" + pad2(x); };
const diffKey = () => Object.keys(DIFF).find(k => DIFF[k] === D);
function saveRun() {
  const r = loadRec(), mode = COOP ? "online" : "single", key = `${MAPID}|${diffKey()}|${mode}`, sec = S.playT || 0, prev = r.best[key], isBest = !prev || sec < prev.t;
  if (isBest) r.best[key] = { t: sec, d: Date.now() };
  r.runs.unshift({ map: MAPID, diff: diffKey(), mode, t: sec, d: Date.now(), end: MAPID === "house" ? (S.altar ? "Kết thúc tốt" : "Kết thúc xấu") : "" }); r.runs = r.runs.slice(0, 30);
  try { localStorage.setItem(REC_KEY, JSON.stringify(r)); } catch (e) {}
  return { sec, isBest, prev: prev?.t };
}
function renderRecords() {
  const r = loadRec(), dks = Object.keys(DIFF), maps = Object.keys(MAPS);
  let h = '<table class="rtab"><tr><th>Map</th>' + dks.map(k => `<th>${DIFF[k].name}</th>`).join("") + '<th>Hai người</th></tr>';
  for (const m of maps) {
    h += `<tr><td class="rm">${MAPS[m].name}</td>` + dks.map(k => { const b = r.best[`${m}|${k}|single`]; return `<td>${b ? fmtT(b.t) : '<span class="nd">—</span>'}</td>`; }).join("");
    const co = dks.map(k => r.best[`${m}|${k}|online`]).filter(Boolean).sort((a, b) => a.t - b.t)[0]; h += `<td>${co ? fmtT(co.t) : '<span class="nd">—</span>'}</td></tr>`;
  }
  h += "</table>";
  h += '<div class="hdr2">Những lần thoát gần đây</div>' + (r.runs.length ? '<ul class="rruns">' + r.runs.slice(0, 8).map(x => `<li><b>${fmtT(x.t)}</b> · ${MAPS[x.map]?.name || x.map} · ${DIFF[x.diff]?.name || ""}${x.mode === "online" ? " · hai người" : ""}${x.end ? " · " + x.end : ""} <span class="nd">${new Date(x.d).toLocaleDateString("vi-VN")}</span></li>`).join("") + "</ul>" : '<p class="nd">Chưa có ai thoát ra được... Bạn sẽ là người đầu tiên?</p>');
  $("recBox").innerHTML = h;
}
setInterval(() => {
  if ($("mapSel").classList.contains("hidden")) return;
  const r = loadRec(), b = r.best[`${MAPID}|${diffKey()}|${MODE === "online" ? "online" : "single"}`];
  const t = b ? `Kỷ lục (${D.name}): <b>${fmtT(b.t)}</b>` : `Chưa có kỷ lục ở độ khó ${D.name}.`; if ($("mapRec").innerHTML !== t) $("mapRec").innerHTML = t;
}, 400);
setInterval(() => { if (S.started && !S.ending) $("playClock").textContent = "Thời gian " + fmtT(S.playT); }, 500);

// ---------- 2. NHẠC KỊCH TÍNH: thay hẳn nhạc thường khi gây cấn, không trộn lẫn ----------
const _tick0 = Music.tick;
Object.assign(Music, {
  tick(st, at) {
    if (this.cv < .05) return; _tick0.call(this, st, at); const D_ = this.cg, r = this.cfg.root;
    if (st % 16 === 0 || st % 16 === 6 || st % 16 === 11) [0, 1, 6].forEach(i => this.note(r * 2 * Math.pow(2, i / 12), at, .5, .11, "sawtooth", .01, 0, D_));   // kèn đồng dằn giật
    if (st % 4 === 2) this.hit(at, 140, .12, .35, D_, 2);                                                                   // trống trầm phụ
    if (st % 64 === 0) [0, 3, 7].forEach(i => this.note(r * 8 * Math.pow(2, i / 12), at, 3.6, .05, "triangle", .6, 0, D_)); // dàn hợp xướng ma quái
    if (st % 32 === 28) for (let k = 0; k < 4; k++) this.hit(at + k * .055, 300 + k * 120, .08, .45, D_, 3);                // dồn trống trước khi sang khuông
    if (st % 64 === 48) { const o = this.note(r * 16, at, 1.6, .06, "sawtooth", .05, 0, D_); o.frequency.setValueAtTime(r * 16, at); o.frequency.exponentialRampToValueAtTime(r * 48, at + 1.5); }   // vĩ cầm rít vút lên
  },
  update(prox, chase) {
    if (!ac) return; const now = ac.currentTime; this.tv = prox;
    const tense = Math.max(0, Math.min(1, (prox - .12) / .7)); this.ten = (this.ten || 0) + (tense - (this.ten || 0)) * .15;
    const hot = !S.paused && (chase || this.ten > .5 || (typeof SPIDERS !== "undefined" && SPIDERS.some(s => s.st === "face")));
    if (hot) this.dramUntil = now + 3.5;   // giữ nhạc kịch tính thêm vài giây sau khi thoát
    const dram = now < (this.dramUntil || 0) && this.map !== "menu";
    if (dram && !this.dramOn) { this.dramOn = true; if ((!this.stT || now > this.stT)) { this.stT = now + 20; this.hit(now, 80, 1.2, 1, this.cg); this.note(this.cfg.root, now, 2, .5, "sine", .005, 0, this.cg); } }
    if (!dram) this.dramOn = false;
    this.cv += ((dram ? 1 : 0) - this.cv) * (dram ? .35 : .05);
    if (this.tg) this.tg.gain.setTargetAtTime(0, now, .3);                                   // không trộn lớp căng thẳng vào nhạc thường
    if (this.dgn) this.dgn.gain.setTargetAtTime(dram ? 0 : .02, now, .4);
    if (this.sg) this.sg.gain.setTargetAtTime(dram ? 0 : 1, now, dram ? .25 : 1.2);            // nhạc thường tắt hẳn khi gây cấn, trở lại từ từ
    if (this.cg) this.cg.gain.setTargetAtTime(this.cv * 1.15, now, .2);
    if (this.dry) this.dry.gain.setTargetAtTime(.75, now, .5);
    if (dram && !S.paused) { if (!this.hb || now > this.hb) { const g = .5 + this.ten * .4, iv = Math.max(.35, heartRate / 1000); this.note(52, now + .02, .22, g, "sine", .002, 0, this.cg); this.hit(now + .02, 60, .18, g * .8, this.cg, 1.4); this.note(48, now + .21, .2, g * .65, "sine", .002, 0, this.cg); this.hb = now + iv; } }
    this.lastTen = this.ten;
  },
});
