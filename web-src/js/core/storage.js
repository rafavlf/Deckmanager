// Persistencia da aplicacao.
// Mantem exatamente as chaves legadas tcg_* nesta etapa.

function loadStorage() {
  try {
    if (hasNativeBridge()) {
      const d = nativeGet('tcg_decks');
      const c = nativeGet('tcg_collection');
      const p = nativeGet('tcg_pokedex');
      if (d) state.decks = JSON.parse(d);
      if (c) state.collection = JSON.parse(c);
      if (p) state.pokedex151 = JSON.parse(p);
      const j2 = nativeGet('tcg_pokedex_johto'); if (j2) state.pokedexJohto = JSON.parse(j2);
      const h3 = nativeGet('tcg_pokedex_hoenn');  if (h3) state.pokedexHoenn  = JSON.parse(h3);
      const g4 = nativeGet('tcg_pokedex_sinnoh'); if (g4) state.pokedexSinnoh = JSON.parse(g4);
      const g5 = nativeGet('tcg_pokedex_unova');  if (g5) state.pokedexUnova  = JSON.parse(g5);
      const g6 = nativeGet('tcg_pokedex_kalos');  if (g6) state.pokedexKalos  = JSON.parse(g6);
      const g7 = nativeGet('tcg_pokedex_alola');  if (g7) state.pokedexAlola  = JSON.parse(g7);
      const g8 = nativeGet('tcg_pokedex_galar');  if (g8) state.pokedexGalar  = JSON.parse(g8);
      const g9 = nativeGet('tcg_pokedex_paldea'); if (g9) state.pokedexPaldea = JSON.parse(g9);
      if (!d && !c) {
        const ld = localStorage.getItem('tcg_decks');
        const lc = localStorage.getItem('tcg_collection');
        const lp = localStorage.getItem('tcg_pokedex');
        if (ld) { state.decks = JSON.parse(ld); nativeSet('tcg_decks', ld); }
        if (lc) { state.collection = JSON.parse(lc); nativeSet('tcg_collection', lc); }
        if (lp) { state.pokedex151 = JSON.parse(lp); nativeSet('tcg_pokedex', lp); }
      }
    } else {
      const d = localStorage.getItem('tcg_decks');
      const c = localStorage.getItem('tcg_collection');
      const p = localStorage.getItem('tcg_pokedex');
      if (d) state.decks = JSON.parse(d);
      if (c) state.collection = JSON.parse(c);
      if (p) state.pokedex151 = JSON.parse(p);
      const j2ls = localStorage.getItem('tcg_pokedex_johto'); if (j2ls) state.pokedexJohto = JSON.parse(j2ls);
      const h3ls = localStorage.getItem('tcg_pokedex_hoenn');  if (h3ls) state.pokedexHoenn  = JSON.parse(h3ls);
      const g4ls = localStorage.getItem('tcg_pokedex_sinnoh'); if (g4ls) state.pokedexSinnoh = JSON.parse(g4ls);
      const g5ls = localStorage.getItem('tcg_pokedex_unova');  if (g5ls) state.pokedexUnova  = JSON.parse(g5ls);
      const g6ls = localStorage.getItem('tcg_pokedex_kalos');  if (g6ls) state.pokedexKalos  = JSON.parse(g6ls);
      const g7ls = localStorage.getItem('tcg_pokedex_alola');  if (g7ls) state.pokedexAlola  = JSON.parse(g7ls);
      const g8ls = localStorage.getItem('tcg_pokedex_galar');  if (g8ls) state.pokedexGalar  = JSON.parse(g8ls);
      const g9ls = localStorage.getItem('tcg_pokedex_paldea'); if (g9ls) state.pokedexPaldea = JSON.parse(g9ls);
    }
  } catch(e) { console.error('loadStorage error:', e); }

  Object.values(state.collection).forEach(card => {
    if (card && card.id && !card.id.startsWith('MANUAL_')) {
      syncCollectionToPokedex(card);
    }
  });
}

function saveStorage() {
  try {
    const decksJson   = JSON.stringify(state.decks);
    const collJson    = JSON.stringify(state.collection);
    const pokedexJson = JSON.stringify(state.pokedex151);
    const johtoJson   = JSON.stringify(state.pokedexJohto || {});
    const hoennJson   = JSON.stringify(state.pokedexHoenn  || {});
    const sinnohJson  = JSON.stringify(state.pokedexSinnoh || {});
    const unovaJson   = JSON.stringify(state.pokedexUnova  || {});
    const kalosJson   = JSON.stringify(state.pokedexKalos  || {});
    const alolaJson   = JSON.stringify(state.pokedexAlola  || {});
    const galarJson   = JSON.stringify(state.pokedexGalar  || {});
    const paldeaJson  = JSON.stringify(state.pokedexPaldea || {});
    if (hasNativeBridge()) {
      nativeSet('tcg_decks', decksJson);
      nativeSet('tcg_collection', collJson);
      nativeSet('tcg_pokedex', pokedexJson);
      nativeSet('tcg_pokedex_johto', johtoJson);
      nativeSet('tcg_pokedex_hoenn',  hoennJson);
      nativeSet('tcg_pokedex_sinnoh', sinnohJson);
      nativeSet('tcg_pokedex_unova',  unovaJson);
      nativeSet('tcg_pokedex_kalos',  kalosJson);
      nativeSet('tcg_pokedex_alola',  alolaJson);
      nativeSet('tcg_pokedex_galar',  galarJson);
      nativeSet('tcg_pokedex_paldea', paldeaJson);
    } else {
      localStorage.setItem('tcg_decks', decksJson);
      localStorage.setItem('tcg_collection', collJson);
      localStorage.setItem('tcg_pokedex', pokedexJson);
      localStorage.setItem('tcg_pokedex_johto', johtoJson);
      localStorage.setItem('tcg_pokedex_hoenn',  hoennJson);
      localStorage.setItem('tcg_pokedex_sinnoh', sinnohJson);
      localStorage.setItem('tcg_pokedex_unova',  unovaJson);
      localStorage.setItem('tcg_pokedex_kalos',  kalosJson);
      localStorage.setItem('tcg_pokedex_alola',  alolaJson);
      localStorage.setItem('tcg_pokedex_galar',  galarJson);
      localStorage.setItem('tcg_pokedex_paldea', paldeaJson);
    }
  } catch(e) { showToast('Falha ao salvar dados.', 'error'); }
}
