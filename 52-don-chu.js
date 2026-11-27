// =====================================================================
//  52. DỌN CHỮ TRÊN MÀN HÌNH
//  · Bỏ dòng chữ đỏ tên tầng ("Tầng 1 · Khu Tiếp Nhận"...) ở góc màn hình.
//  · Lời thoại của ma: sau khi mờ dần thì xóa hẳn chữ, không để lại vệt mờ.
// =====================================================================
(() => { const st = document.createElement("style"); st.textContent = "#area{display:none!important}"; document.head.appendChild(st); })();
showArea = function () {};
gvSub = (o => function (text, side) {
  o(text, side);
  const el = $("gvoice"); if (!el) return;
  el.style.visibility = "visible"; clearTimeout(el._clr);
  const wait = 1400 + String(text).length * 70 + 700;                 // = lúc bắt đầu mờ + thời gian mờ
  el._clr = setTimeout(() => { el.style.opacity = 0; el.style.visibility = "hidden"; el.textContent = ""; el.style.animation = ""; el.style.textShadow = ""; }, wait);
})(gvSub);
