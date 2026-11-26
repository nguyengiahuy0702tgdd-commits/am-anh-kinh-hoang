// =====================================================================
//  43. BẢN 42: MÀU GIAO DIỆN (Cài đặt → Màu giao diện)
//  · Xương & máu khô (mặc định): chữ màu xương cũ, điểm nhấn đỏ gỉ máu khô, nền nâu đen như ảnh phim cũ.
//  · Nhà xác lạnh: xanh lam lạnh như đèn huỳnh quang nhà xác, điểm nhấn xanh bệnh hoạn.
//  · Máu tươi: màu đỏ như các bản trước.
//  Tên game (chữ máu) giữ màu máu ở mọi kiểu để luôn nổi bật.
// =====================================================================
if (SET.uiTheme == null) { SET.uiTheme = "xuong"; saveSet(); }
{
  const st = document.createElement("style");
  const T = (k, v) => `body.th-${k} { ${v.vars} }
  body.th-${k} .hdr { color: var(--blood2) !important; text-shadow: 0 2px 0 #000, 0 0 18px ${v.glow} !important; }
  body.th-${k} .hdr2 { color: var(--blood2) !important; }
  body.th-${k} .mnav a, body.th-${k} .sbar a:not(.go), body.th-${k} .opts a, body.th-${k} .setRow .tg, body.th-${k} .setRow .sl { color: var(--ash) !important; }
  body.th-${k} #menu .mnav a, body.th-${k} #pause .mnav a { color: var(--bone) !important; }
  body.th-${k} .mnav a:hover, body.th-${k} .mnav a.sel, body.th-${k} .opts a:hover, body.th-${k} .opts a.sel, body.th-${k} .sbar a:not(.go):hover, body.th-${k} .setRow .tg.on, body.th-${k} .setRow .sl.on { color: var(--hi) !important; }
  body.th-${k} .opts a.sel, body.th-${k} .setRow .tg.on, body.th-${k} .setRow .sl.on { border-bottom-color: var(--blood) !important; }
  body.th-${k} #menu .mnav a:hover { color: var(--blood2) !important; text-shadow: 0 1px 0 #000, 0 4px 10px rgba(0,0,0,.85), 0 0 22px ${v.glow} !important; }
  body.th-${k} .setRow span, body.th-${k} #mapInfo, body.th-${k} #diffDesc, body.th-${k} .mdesc, body.th-${k} .mtag, body.th-${k} .mrec, body.th-${k} #recBox, body.th-${k} #howto .keys span { color: var(--bone) !important; }
  body.th-${k} .setRow b, body.th-${k} .keys b, body.th-${k} .k { color: var(--hi) !important; }
  body.th-${k} #mapSel .info, body.th-${k} #setList, body.th-${k} #howto .keys, body.th-${k} #recBox { background: ${v.panel} !important; border-color: var(--blood) !important; }
  body.th-${k} #mapSel .info .colB { border-left-color: ${v.line} !important; }
  body.th-${k} #mapCards.tiles a { border-color: ${v.line} !important; }
  body.th-${k} #mapCards.tiles a:hover { border-color: var(--blood2) !important; }
  body.th-${k} #mapCards.tiles a.sel { border-color: var(--blood) !important; box-shadow: 0 0 0 2px ${v.glow}, 0 0 30px ${v.glow}, 0 12px 30px rgba(0,0,0,.7) !important; }
  body.th-${k} .setRow input[type=range] { background: ${v.line} !important; accent-color: var(--blood); }
  body.th-${k} .setRow input[type=range]::-webkit-slider-thumb { background: var(--hi) !important; }
  body.th-${k} #startBtn.go { color: var(--hi) !important; background: ${v.btn} !important; border-color: var(--blood) !important; }
  body.th-${k} .tagline { color: var(--bone) !important; } body.th-${k} .foot { color: var(--ash) !important; }
  body.th-${k} #bg, body.th-${k} iframe[src*="preview="] { filter: ${v.tint} !important; }
  body.th-${k} #warnScr .wt { color: var(--blood2) !important; }`;
  st.textContent = [
    T("xuong", { vars: "--blood: #9c3420; --blood2: #c8553a; --bone: #d9ccb2; --ash: #9d8f78; --hi: #f3e7cf;", glow: "rgba(170,60,30,.45)", panel: "linear-gradient(160deg, rgba(24,17,10,.8), rgba(14,10,6,.6))", line: "rgba(200,170,125,.2)", btn: "linear-gradient(#4a1a10, #2a0d07)", tint: "sepia(.45) saturate(.8) brightness(.96) contrast(1.05)" }),
    T("lanh", { vars: "--blood: #2f8f78; --blood2: #5fd1b0; --bone: #c6d6d1; --ash: #7c918b; --hi: #eef8f5;", glow: "rgba(70,200,165,.38)", panel: "linear-gradient(160deg, rgba(6,16,17,.82), rgba(4,10,12,.6))", line: "rgba(120,210,190,.2)", btn: "linear-gradient(#123a33, #0a201c)", tint: "saturate(.55) hue-rotate(165deg) brightness(.92) contrast(1.08)" }),
  ].join("\n");
  document.head.appendChild(st);
}
function applyTheme() { for (const k of ["xuong", "lanh", "mau"]) document.body.classList.toggle("th-" + k, SET.uiTheme === k); }
applySet = (o => function () { o(); try { applyTheme(); } catch (e) {} })(applySet);
SETTINGS_UI.push(["Màu giao diện", "uiTheme", "select", { xuong: "Xương & máu khô", lanh: "Nhà xác lạnh", mau: "Máu tươi" }]);
try { buildSettingsUI(); } catch (e) {}
applyTheme();
