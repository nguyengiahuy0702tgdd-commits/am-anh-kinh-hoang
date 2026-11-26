// =====================================================================
//  42. BẢN 37: KIỂU CHỮ TEXTURINA + MÁU CHẢY RA TỪ CHÍNH NÉT CHỮ
//  · Mọi máy hiện giống nhau (font miễn phí từ Google Fonts, đủ dấu tiếng Việt).
//  · Máu rỉ ra từ chân từng con chữ: đọng thành giọt ở chân nét → chảy dài → nhỏ giọt rơi xuống.
// =====================================================================
{
  const ln = document.createElement("link"); ln.rel = "stylesheet";
  ln.href = "https://fonts.googleapis.com/css2?family=Texturina:opsz,wght@12..72,400..900&display=swap"; document.head.appendChild(ln);
  const st = document.createElement("style");
  st.textContent = `
  :root { --title: "Texturina", "Grenze Gotisch", "Times New Roman", serif !important; }
  .logo, .hdr, .mname, .mnav a, .sbar a, #area, .overlay h1, #story .st, #loading .ln, #tasks .th, .netRow a { font-family: var(--title) !important; }
  /* bản 38: mọi tiêu đề dùng chung một dáng chữ Texturina (cỡ quang học nhỏ: nét chân to, tròn, đậm) giống tên map */
  .logo, .hdr, .mname, .mnav a, .sbar a, #area, .overlay h1, #story .st, #loading .ln, #tasks .th, .netRow a { font-variation-settings: "opsz" 28 !important; font-optical-sizing: none !important; }
  .logo { font-weight: 800 !important; letter-spacing: .01em !important; }
  .mnav a, .sbar a { font-weight: 700 !important; }
  .hdr, .mname, .overlay h1, #loading .ln { font-weight: 800 !important; }
  /* chữ máu: đỏ tươi ở đỉnh, sẫm dần xuống chân nét như máu đang dồn xuống */
  .blood.blood { position: relative !important; display: inline-block; background: linear-gradient(180deg, #ff3b2b 0%, #d4170d 40%, #8e0605 76%, #4a0000 100%) !important;
    -webkit-background-clip: text !important; background-clip: text !important; -webkit-text-fill-color: transparent !important; color: transparent !important;
    filter: drop-shadow(0 2px 0 #1e0000) drop-shadow(0 0 18px rgba(190,0,0,.33)) !important; -webkit-text-stroke: 0 !important; text-shadow: none !important; }
  .blood .drip { display: none !important; }
  .blood .ch { position: relative; }
  .blood .bd { position: absolute; z-index: 1; width: var(--w); height: 0; margin-left: calc(var(--w) / -2); pointer-events: none;
    background: linear-gradient(90deg, #4a0000 0%, #8e0a06 45%, #b8140c 55%, #5a0101 100%); border-radius: 0 0 var(--w) var(--w);
    -webkit-text-fill-color: initial; animation: bdGrow var(--d) cubic-bezier(.45, 0, .65, 1) var(--dl) infinite; }
  .blood .bd::before { content: ""; position: absolute; left: 50%; top: calc(var(--w) * -.9); width: calc(var(--w) * 2.4); height: calc(var(--w) * 1.9); transform: translateX(-50%);
    background: radial-gradient(ellipse at 50% 30%, #a80e08 0%, #6a0302 70%, transparent 72%); border-radius: 50%; }
  .blood .bd::after { content: ""; position: absolute; left: 50%; bottom: calc(var(--w) * -1.1); width: calc(var(--w) * 1.75); height: calc(var(--w) * 2.2); transform: translateX(-50%);
    background: radial-gradient(circle at 38% 62%, #d0291e 0 12%, #8a0806 30%, #4a0000 100%); border-radius: 50% 50% 50% 50% / 38% 38% 62% 62%;
    animation: bdDrop var(--d) cubic-bezier(.5, 0, 1, .5) var(--dl) infinite; }
  @keyframes bdGrow { 0% { height: 0; } 62% { height: var(--h); } 100% { height: var(--h); } }
  @keyframes bdDrop { 0%, 64% { transform: translate(-50%, 0) scale(1); opacity: 1; } 70% { transform: translate(-50%, 2px) scale(1.08, 1.15); opacity: 1; }
    100% { transform: translate(-50%, var(--fall)) scale(.8, 1.3); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .blood .bd, .blood .bd::after { animation: none; height: var(--h); } }
  /* ===== bản 39: TIÊU ĐỀ "WOW" — chữ khắc tay méo lệch, máu ướt bóng loáng, sần sùi, nổi khối, tim đập, chớp nhiễu ===== */
  .logo.blood { background: none !important; isolation: isolate; font-weight: 800 !important; font-size: clamp(38px, 4.6vw, 78px) !important; letter-spacing: .08em !important; word-spacing: .18em !important;
    filter: drop-shadow(0 1px 0 #4a0000) drop-shadow(0 2px 0 #320000) drop-shadow(0 3px 0 #200000) drop-shadow(0 4px 0 #120000) drop-shadow(0 10px 14px rgba(0,0,0,.9)) drop-shadow(0 0 26px rgba(220,0,0,.38)) !important; }
  .logo .ch { display: inline-block; transform: rotate(var(--r, 0deg)) translateY(var(--y, 0px)) scale(var(--s, 1)); transform-origin: 50% 80%;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' seed='4'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -1.05'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>"),
      linear-gradient(180deg, #ff5a42 0%, #e8200f 18%, #ff7a5e 27%, #c4120a 33%, #a80a05 62%, #6e0302 86%, #4a0000 100%);
    background-size: 160px 160px, 100% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
    animation: chIn 1.1s cubic-bezier(.2, .7, .2, 1) var(--i) both, chTwitch 9s steps(1) calc(var(--i) * 3) infinite; }
  .logo::before { content: ""; position: absolute; inset: -30% -6% -40%; z-index: -1; pointer-events: none; background: radial-gradient(ellipse 60% 55% at 50% 55%, rgba(190,0,0,.5), rgba(90,0,0,.18) 45%, transparent 70%); animation: hb 1.4s ease-in-out infinite; }
  .logo::after { content: attr(data-t); position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; color: rgba(255,30,10,.55); -webkit-text-fill-color: rgba(255,30,10,.55); mix-blend-mode: screen; opacity: 0; animation: glitch 7s steps(1) infinite; }
  @keyframes chIn { 0% { opacity: 0; filter: blur(8px); transform: rotate(var(--r)) translateY(calc(var(--y) - .35em)) scale(1.25); } 60% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(var(--y, 0px)) scale(var(--s, 1)); } }
  @keyframes chTwitch { 0%, 96.5%, 100% { transform: rotate(var(--r, 0deg)) translateY(var(--y, 0px)) scale(var(--s, 1)); } 97% { transform: rotate(calc(var(--r) * -2.5)) translateY(calc(var(--y) + .03em)) scale(var(--s, 1)); } 97.6% { transform: rotate(var(--r)) translate(.02em, var(--y)) scale(var(--s, 1)); } }
  @keyframes hb { 0%, 100% { opacity: .55; transform: scale(1); } 12% { opacity: 1; transform: scale(1.05); } 24% { opacity: .65; transform: scale(1); } 36% { opacity: .95; transform: scale(1.035); } 55% { opacity: .55; } }
  @keyframes glitch { 0%, 88%, 100% { opacity: 0; transform: none; clip-path: inset(0); } 89% { opacity: 1; transform: translate(6px, -2px); clip-path: inset(10% 0 55% 0); } 90% { opacity: 1; transform: translate(-5px, 1px); clip-path: inset(52% 0 12% 0); } 91% { opacity: .6; transform: translate(3px, 0); clip-path: inset(30% 0 40% 0); } 92% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .logo .ch, .logo::before, .logo::after { animation: none !important; } }`;
  document.head.appendChild(st);
}
// Máu chảy từ chữ: tách từng ký tự, đo vị trí chân chữ rồi đặt dòng máu ngay dưới nét
function bloodPlace(el) {
  if (!el || !el.isConnected) return; el.querySelectorAll(".bd").forEach(d => d.remove());
  const chars = [...el.querySelectorAll(".ch")].filter(c => c.textContent.trim()); if (!chars.length || !el.offsetWidth) return;
  const mk = document.createElement("i"); mk.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline"; chars[0].after(mk);
  const base = mk.offsetTop - chars[0].offsetTop; mk.remove();   // khoảng từ đỉnh dòng tới đường chân chữ
  const fs = parseFloat(getComputedStyle(el).fontSize) || 40, n = Math.min(chars.length, el._bn ?? Math.max(3, Math.round(chars.length / 2.2)));
  const pool = chars.slice().sort(() => Math.random() - .5).slice(0, n);
  for (const c of pool) {
    const d = document.createElement("i"); d.className = "bd"; const w = Math.max(2, fs * (.035 + Math.random() * .04));
    d.style.left = (c.offsetLeft + c.offsetWidth * (.25 + Math.random() * .5)).toFixed(1) + "px";
    d.style.top = (c.offsetTop + base - fs * .06 + (c._y || 0) * fs).toFixed(1) + "px";
    d.style.setProperty("--w", w.toFixed(1) + "px"); d.style.setProperty("--h", (fs * (.18 + Math.random() * .55)).toFixed(1) + "px");
    d.style.setProperty("--fall", (fs * (.9 + Math.random() * 1.2)).toFixed(0) + "px");
    d.style.setProperty("--d", (3.2 + Math.random() * 3.5).toFixed(2) + "s"); d.style.setProperty("--dl", (-Math.random() * 4).toFixed(2) + "s");
    el.appendChild(d);
  }
}
bloodify = function (el, n) {
  if (!el) return; el.classList.add("blood"); el.querySelectorAll(".drip, .bd").forEach(d => d.remove());
  if (n != null) el._bn = n;
  if (!el.querySelector(".ch")) {   // tách từng ký tự (giữ nguyên chữ để đọc)
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
    for (const t of nodes) { const f = document.createDocumentFragment(); for (const ch of t.nodeValue) { if (/\s/.test(ch)) { f.appendChild(document.createTextNode(ch)); continue; } const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; f.appendChild(s); } t.replaceWith(f); }
  }
  if (el.classList.contains("logo")) {   // chữ khắc tay: mỗi chữ lệch, nghiêng, to nhỏ khác nhau một chút
    el.dataset.t = el.textContent; let i = 0;
    for (const c of el.querySelectorAll(".ch")) { const y = (Math.random() - .45) * .06, r = (Math.random() - .5) * 5;
      c.style.setProperty("--r", r.toFixed(1) + "deg"); c.style.setProperty("--y", y.toFixed(3) + "em"); c.style.setProperty("--s", (.97 + Math.random() * .04).toFixed(3)); c.style.setProperty("--i", (.08 + i++ * .055).toFixed(2) + "s"); c._y = y; }
  }
  bloodPlace(el); (document.fonts?.ready || Promise.resolve()).then(() => bloodPlace(el));
  try { document.fonts?.load('900 60px "Texturina"').then(() => bloodPlace(el)); } catch (e) {}
};
// Vẽ lại cho các chữ máu đang có trên màn hình và khi đổi cỡ cửa sổ
document.querySelectorAll(".blood").forEach(el => { el.querySelectorAll(".drip").forEach(d => d.remove()); bloodify(el, el.classList.contains("logo") ? 9 : undefined); });
{ let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => document.querySelectorAll(".blood").forEach(bloodPlace), 200); }); }
