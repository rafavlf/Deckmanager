// ─────────────────────────────────────────────
//  PRESET DECKS (Liga)
// ─────────────────────────────────────────────
    const PRESET_DECKS = [];;


// ─────────────────────────────────────────────
//  POKÉDEX 151
// ─────────────────────────────────────────────



















// Dados de colecoes carregados por data/sets.generated.js

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
let toastTimer;
// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
//  ICON HELPER
// ─────────────────────────────────────────────

const PNG_ICONS = {
  decks: 'layers',
  sets: 'package',
  collection: 'book',
  shopping: 'shopping-cart'
};

// ─────────────────────────────────────────────
//  POKÉDEX HELPERS
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  CSV IMPORT / EXPORT
// ─────────────────────────────────────────────
window.onCSVImported = function(base64) {
  try {
    const csvText = decodeURIComponent(escape(atob(base64)));
    processCSVText(csvText);
  } catch(e) { processCSVText(base64); }
};


// ─────────────────────────────────────────────
//  DECK EXPORT / IMPORT
// ─────────────────────────────────────────────
window.onCSVImported = function(base64) {
  try {
    const text = decodeURIComponent(escape(atob(base64)));
    if (window._deckImportMode) {
      window._deckImportMode = false;
      processDeckImportText(text);
    } else {
      processCSVText(text);
    }
  } catch(e) {
    window._deckImportMode = false;
    processCSVText(base64);
  }
};


// ─────────────────────────────────────────────
//  SHOPPING LIST
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  DECK EDITOR MODAL
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
// ── DECKS TAB ──────────────────────────────────
// ── DECK DETAIL ────────────────────────────────
// ── POKÉDEX ─────────────────────────────────────
// ─────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
initTheme();
loadStorage();
render();

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
