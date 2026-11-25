// =====================================================================
//  37. BẢN 24: menu chọn map dọc (không thanh cuộn) · âm thanh êm · đồ họa 4K
// =====================================================================
(() => { const st = document.createElement("style"); st.textContent = `
  html, body { overflow: hidden !important; } ::-webkit-scrollbar { width: 0 !important; height: 0 !important; } * { scrollbar-width: none; }
  #mapSel { --ts: min(24vh, 15vw, 250px); display: grid !important; grid-template-columns: calc(var(--ts) * 2 + 2.2vh) minmax(380px, 720px) !important; grid-template-rows: auto 1fr auto; column-gap: 4.5vw; row-gap: 2.4vh;
    justify-content: center !important; align-content: center !important; align-items: start !important; height: 100vh; box-sizing: border-box; padding: 4vh 4vw 4vh !important; overflow: hidden !important; }
  #mapSel .hdr { grid-column: 1; grid-row: 1; text-align: left !important; align-self: end; }
  #mapCards.tiles { grid-column: 1; grid-row: 2; display: grid !important; grid-template-columns: repeat(2, var(--ts)); gap: 2.2vh; width: auto !important; align-self: start !important; justify-content: start !important; padding: 4px 0 !important; }
  #mapCards.tiles a { width: var(--ts) !important; }
  #mapCards.tiles a .tn { font-size: clamp(12px, min(1.9vh, 1.05vw), 17px) !important; }
  #mapSel .info { grid-column: 2; grid-row: 1 / 3; width: auto !important; flex-direction: column !important; gap: 0 !important; align-self: start; max-height: calc(100vh - 8vh - 70px); overflow-y: auto !important;
    border-top: none !important; border-left: 3px solid var(--blood, #b01010) !important; border-radius: 0 16px 16px 0 !important; }
  #mapSel .info .colA, #mapSel .info .colB { flex: none !important; width: 100%; }
  #mapSel .info .colB { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(255,60,40,.18); margin-top: 12px; padding-top: 4px; }
  #mapSel .sbar { grid-column: 1 / 3; grid-row: 3; width: 100% !important; }
  @media (max-width: 900px), (max-aspect-ratio: 1/1) {
    #mapSel { --ts: min(17vh, 26vw, 170px); grid-template-columns: 1fr; grid-template-rows: auto auto 1fr auto; overflow-y: auto !important; align-content: start; }
    #mapCards.tiles { grid-column: 1; grid-row: 2; grid-template-columns: repeat(3, var(--ts)); justify-self: center; }
    #mapSel .info { grid-column: 1; grid-row: 3; max-height: none; } #mapSel .sbar { grid-column: 1; grid-row: 4; } #mapSel .hdr { text-align: center !important; } }`;
  document.head.appendChild(st); })();
