// =====================================================================
//  49. GIỚI HẠN KHUNG HÌNH — máy mát hơn, quạt êm hơn, đỡ tốn pin
//  Trước đây game vẽ nhiều khung hình nhất có thể (60–144/giây) → card đồ họa chạy 100%.
//  · 30 = tiết kiệm (laptop, chạy pin)   · 60 = mượt (mặc định)   · 0 = không giới hạn
//  · Khi đang tạm dừng / đọc giấy / mở sổ tay: tự hạ xuống tối đa 30 khung hình.
// =====================================================================
if (!["f30", "f60", "max"].includes(SET.fpsCap)) { SET.fpsCap = "f60"; saveSet(); }
SETTINGS_UI.push(["Giới hạn khung hình", "fpsCap", "select", { f30: "30 — tiết kiệm, máy mát", f60: "60 — mượt", max: "Không giới hạn" }]);
try { buildSettingsUI(); } catch (e) {}
{
  let lastR = -1e9;
  loop = (o => function (now) {
    let cap = SET.fpsCap === "f30" ? 30 : SET.fpsCap === "max" ? 0 : 60;
    if (S.paused && S.started && !S.ending && !(typeof CUT !== "undefined" && CUT.on) && !(typeof GR !== "undefined" && GR.on)) cap = cap ? Math.min(cap, 30) : 30;
    if (cap && now - lastR < 1000 / cap - 2) { requestAnimationFrame(loop); return; }   // chưa tới lượt vẽ khung hình kế
    lastR = now; return o(now);
  })(loop);
}
