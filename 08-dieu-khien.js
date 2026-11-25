// ===================== 7. ĐIỀU KHIỂN =====================
const cv = $("c");
addEventListener("keydown", e => {
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
  if (padOpen()) { if (/^[0-9]$/.test(e.key)) padPress(e.key); else if (e.key === "Backspace") padPress("Xóa"); else if (e.key === "Enter") padPress("OK"); else if (e.key === "Escape") padPress("Thoát"); return; }
  if (noteOpen() && (e.code === "KeyE" || e.key === "Escape")) { $("note").onclick(); return; }
  if (e.code === "Tab") { e.preventDefault(); if (journalOpen) toggleJournal(); else if (S.started && !S.ending && !S.paused) toggleTasks(); return; }
  if (e.code === "KeyN") { if (S.started && !S.ending && (journalOpen || !S.paused)) toggleJournal(); return; }
  if (journalOpen) { if (e.key === "Escape") toggleJournal(false); return; }
  if (e.code === "KeyP" && S.started && !S.ending) { if (S.menuPause) resumeGame(); else pauseGame(); return; }
  if (e.code === "KeyM" && !S.paused) { toggleMap(); return; }
  keys[e.code] = true; if (S.paused) return;
  if (e.code === "KeyE") act(P1);
  if (e.code === "KeyF") toggleLight(P1);
});
addEventListener("keyup", e => keys[e.code] = false);
cv.addEventListener("click", () => { if (!S.paused && S.started) cv.requestPointerLock?.(); });
addEventListener("mousemove", e => { if (document.pointerLockElement !== cv || S.paused) return; const k = SET.sens / 5; P1.a += e.movementX * .0025 * k; P1.pitch = Math.max(-1.1, Math.min(1.1, P1.pitch - e.movementY * .0022 * k * (SET.invert ? -1 : 1))); });
let noiseT = 0, stepTimer = 0, aimed = null, aimedSprite = null;
function canStand(x, y) {
  const r = .22; if (!(free(x - r, y - r) && free(x + r, y - r) && free(x - r, y + r) && free(x + r, y + r))) return false;
  for (const s of F.sprites) if (s.solid && !s.taken && Math.hypot(s.x - x, s.y - y) < s.solid) return false;
  for (const b of F.blocks || []) { const cx = Math.max(b[0], Math.min(x, b[2])), cz = Math.max(b[1], Math.min(y, b[3])); if (Math.hypot(x - cx, y - cz) < .2) return false; }
  return true;
}
