// =====================================================================
//  48. BẢO VỆ ĐỒ HỌA 3D
//  Card đồ họa quá tải (WebGL bị mất) → hình sẽ vỡ / trắng xóa. Thay vì để vậy:
//  tự hạ mức "Đồ họa 3D thật" (Siêu nét → Bật → Tắt), quay về menu và báo cho người chơi.
// =====================================================================
(() => {
  if (typeof PV_ID !== "undefined" && PV_ID) return;   // khung nền menu tự xử lý riêng
  const cv = $("c"); if (!cv) return;
  cv.addEventListener("webglcontextlost", () => {
    const from = SET.g3d; if (!from || from === "off") return;
    SET.g3d = from === "hi" ? "on" : "off"; saveSet();
    try { sessionStorage.setItem("aakh-g3dlost", from); } catch (e) {}
    setTimeout(() => { try { backToMenu(); } catch (e) { location.reload(); } }, 300);
  });
  let from = null; try { from = sessionStorage.getItem("aakh-g3dlost"); sessionStorage.removeItem("aakh-g3dlost"); } catch (e) {}
  if (!from) return;
  const el = document.createElement("div");
  el.textContent = from === "hi"
    ? "Card đồ họa bị quá tải ở mức 3D \"Siêu nét\" nên game đã tự chuyển sang mức \"Bật\". Bạn vẫn đổi lại được trong Cài đặt."
    : "Card đồ họa bị quá tải nên game đã tạm tắt \"Đồ họa 3D thật\". Bạn có thể bật lại trong Cài đặt.";
  Object.assign(el.style, { position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", maxWidth: "min(620px, 90vw)", padding: "12px 18px", background: "rgba(20,8,6,.92)",
    border: "1px solid rgba(180,60,40,.6)", color: "#e8d9c0", font: "14px/1.45 sans-serif", textAlign: "center", zIndex: 99, borderRadius: "4px", boxShadow: "0 8px 30px rgba(0,0,0,.7)", transition: "opacity 1s" });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 1100); }, 9000);
})();
