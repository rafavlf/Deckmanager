// Feature: Minha Coleção.
// Parsing, resolução de cartas, quantidades, backup/restauração e renderização da aba.

function parseInput(text) {
  let invalid = 0;
  const SKIP_PATTERNS = /^(pok[eé]mon|treinador|energia|trainer|energy|total|\/\/).*/i;
  const cards = text.split('\n').map(l=>l.trim()).filter(Boolean).reduce((acc, line) => {
    if (SKIP_PATTERNS.test(line)) return acc;
    const parts = line.split(/\s+/);
    if (parts.length < 3) { invalid++; return acc; }
    let qty = 1;
    if (!isNaN(parseInt(parts[0],10))) qty = Math.max(1, parseInt(parts.shift(),10));
    const number = parts.pop();
    const set = parts.pop();
    const name = parts.join(' ');
    if (!name || !set || !number) { invalid++; return acc; }
    const numPadded = number.padStart(3, '0');
    const rawCard = { id: `${set}_${numPadded}`, qty, name, set, number: numPadded };
    acc.push(resolveCardName(rawCard));
    return acc;
  }, []);
  return { cards, invalidCount: invalid };
}

function resolveCardName(card) {
  if (!card || !card.id) return card;
  for (const s of SET_COLLECTIONS) {
    const found = s.cards.find(c => c.id === card.id);
    if (found && found.name !== card.name) return { ...card, name: found.name };
  }
  if (card.set && card.number) {
    const padded = card.set + '_' + card.number.padStart(3,'0');
    const unpadded = card.set + '_' + (parseInt(card.number,10) || 0).toString();
    for (const s of SET_COLLECTIONS) {
      let found = s.cards.find(c => c.id === padded) || s.cards.find(c => c.id === unpadded);
      if (found) return { ...card, id: found.id, name: found.name, number: found.number };
    }
  }
  return card;
}

function getOwnedQty(card) {
  const exact = state.collection[card.id]?.qty || 0;
  if (exact > 0) return exact;
  if (card.id) {
    const parts = card.id.split('_');
    if (parts.length === 2) {
      const altNum = parts[1].replace(/^0+/, '') || '0';
      const altNumPad = parts[1].padStart(3, '0');
      const alt1 = state.collection[parts[0] + '_' + altNum]?.qty || 0;
      if (alt1 > 0) return alt1;
      const alt2 = state.collection[parts[0] + '_' + altNumPad]?.qty || 0;
      if (alt2 > 0) return alt2;
    }
  }
  if (!card.name) return 0;
  const nameLower = card.name.toLowerCase().trim();
  return Object.values(state.collection).reduce((sum, c) => {
    if (c.name && c.name.toLowerCase().trim() === nameLower) return sum + (c.qty || 0);
    return sum;
  }, 0);
}

function updateCollectionQty(card, delta, exact=null) {
  const cur = state.collection[card.id]?.qty || 0;
  let next = exact !== null ? exact : cur + delta;
  if (next < 0) next = 0;
  if (next === 0) {
    delete state.collection[card.id];
  } else {
    state.collection[card.id] = { ...card, qty: next };
    if (cur === 0) syncCollectionToPokedex(card);
  }
  saveStorage();
  render();
}

function exportCollectionCSV() {
  const cards = Object.values(state.collection);
  if (!cards.length && !Object.keys(state.pokedex151).length) {
    return showToast('Coleção vazia, nada para exportar.', 'error');
  }
  // Export a full backup JSON: collection + all 3 pokédex gens
  const backup = {
    version: 3,
    exportedAt: new Date().toISOString(),
    collection: state.collection,
    decks: state.decks,
    pokedex151:   state.pokedex151   || {},
    pokedexJohto: state.pokedexJohto || {},
    pokedexHoenn:  state.pokedexHoenn  || {},
    pokedexSinnoh: state.pokedexSinnoh || {},
    pokedexUnova:  state.pokedexUnova  || {},
    pokedexKalos:  state.pokedexKalos  || {},
    pokedexAlola:  state.pokedexAlola  || {},
    pokedexGalar:  state.pokedexGalar  || {},
    pokedexPaldea: state.pokedexPaldea || {},
  };
  const data = JSON.stringify(backup, null, 2);
  const filename = 'ptcg-backup-' + new Date().toISOString().slice(0,10) + '.json';
  if (typeof window.AndroidExport !== 'undefined') {
    window.AndroidExport.shareCSV(filename, data);
    showToast(cards.length + ' cartas, ' + state.decks.length + ' decks + Pokédex exportados!');
  } else {
    try {
      const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(cards.length + ' cartas + Pokédex exportadas!');
    } catch(e) { showToast('Erro ao exportar: ' + e.message, 'error'); }
  }
}

function processCSVText(csvText) {
  try {
    // ── Try JSON backup first (v2 format with Pokédex) ────────────
    const trimmed = csvText.trim();
    if (trimmed.startsWith('{')) {
      const backup = JSON.parse(trimmed);
      // Restore collection
      if (backup.collection && typeof backup.collection === 'object') {
        const newColl = { ...state.collection };
        let count = 0;
        Object.values(backup.collection).forEach(c => {
          if (c.id && c.qty > 0) { newColl[c.id] = c; count++; }
        });
        state.collection = newColl;
      }
      // Restore decks (merge by name, avoid duplicates)
      if (backup.decks && Array.isArray(backup.decks)) {
        backup.decks.forEach(deck => {
          if (!deck.name || !Array.isArray(deck.cards)) return;
          if (!state.decks.some(d => d.name === deck.name)) {
            state.decks.push({ id: genId(), name: deck.name,
              description: deck.description || '',
              notes: deck.notes || '',
              cards: deck.cards, createdAt: deck.createdAt || Date.now() });
          }
        });
      }
      // Restore Pokédex Gen 1
      if (backup.pokedex151 && typeof backup.pokedex151 === 'object') {
        Object.assign(state.pokedex151, backup.pokedex151);
      }
      // Restore Pokédex Gen 2
      if (backup.pokedexJohto && typeof backup.pokedexJohto === 'object') {
        if (!state.pokedexJohto) state.pokedexJohto = {};
        Object.assign(state.pokedexJohto, backup.pokedexJohto);
      }
      // Restore Pokédex Gen 3
      if (backup.pokedexHoenn  && typeof backup.pokedexHoenn  === 'object') { if (!state.pokedexHoenn)  state.pokedexHoenn  = {}; Object.assign(state.pokedexHoenn,  backup.pokedexHoenn);  }
      if (backup.pokedexSinnoh && typeof backup.pokedexSinnoh === 'object') { if (!state.pokedexSinnoh) state.pokedexSinnoh = {}; Object.assign(state.pokedexSinnoh, backup.pokedexSinnoh); }
      if (backup.pokedexUnova  && typeof backup.pokedexUnova  === 'object') { if (!state.pokedexUnova)  state.pokedexUnova  = {}; Object.assign(state.pokedexUnova,  backup.pokedexUnova);  }
      if (backup.pokedexKalos  && typeof backup.pokedexKalos  === 'object') { if (!state.pokedexKalos)  state.pokedexKalos  = {}; Object.assign(state.pokedexKalos,  backup.pokedexKalos);  }
      if (backup.pokedexAlola  && typeof backup.pokedexAlola  === 'object') { if (!state.pokedexAlola)  state.pokedexAlola  = {}; Object.assign(state.pokedexAlola,  backup.pokedexAlola);  }
      if (backup.pokedexGalar  && typeof backup.pokedexGalar  === 'object') { if (!state.pokedexGalar)  state.pokedexGalar  = {}; Object.assign(state.pokedexGalar,  backup.pokedexGalar);  }
      if (backup.pokedexPaldea && typeof backup.pokedexPaldea === 'object') { if (!state.pokedexPaldea) state.pokedexPaldea = {}; Object.assign(state.pokedexPaldea, backup.pokedexPaldea); }
      saveStorage();
      const cardCount = Object.keys(state.collection).length;
      const pdCount = Object.keys(state.pokedex151).length +
                      Object.keys(state.pokedexJohto||{}).length +
                      Object.keys(state.pokedexHoenn||{}).length;
      const deckCount = state.decks.length;
      showToast(`${cardCount} cartas, ${deckCount} decks + ${pdCount} Pokédex restaurados!`);
      render();
      return;
    }

    // ── Legacy CSV format (collection only) ───────────────────────
    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (!lines.length) return showToast('Arquivo vazio.', 'error');
    const start = lines[0].toLowerCase().startsWith('id,') ? 1 : 0;
    let imported = 0, skipped = 0;
    const newCollection = { ...state.collection };
    lines.slice(start).forEach(line => {
      const cols = [];
      let cur = '', inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { cols.push(cur); cur = ''; }
        else { cur += ch; }
      }
      cols.push(cur);
      if (cols.length < 5) { skipped++; return; }
      const id = cols[0].trim(), name = cols[1].trim(), set = cols[2].trim(), number = cols[3].trim();
      const qty = parseInt(cols[4], 10);
      if (!id || !name || !set || !number || isNaN(qty) || qty < 1) { skipped++; return; }
      const rawImported = { id: id.trim(), name: name.trim(), set: set.trim(), number: number.trim(), qty };
      const resolved = resolveCardName(rawImported);
      const existing = newCollection[resolved.id];
      newCollection[resolved.id] = { ...resolved, qty: existing ? Math.max(existing.qty, qty) : qty };
      imported++;
    });
    if (!imported) return showToast('Nenhuma carta válida encontrada.', 'error');
    state.collection = newCollection;
    saveStorage();
    const msg = imported + ' carta' + (imported!==1?'s':'') + ' importada' +
                (imported!==1?'s':'') + (skipped>0?' ('+skipped+' ignoradas)':'') + '!';
    showToast(msg);
    render();
  } catch(err) {
    showToast('Erro ao processar arquivo.', 'error');
  }
}

function importCollectionCSV(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => processCSVText(e.target.result);
  reader.readAsText(file, 'utf-8');
}

function buildCollectionTab() {
  let html = `<div class="surface-card mb-16">
    <h2 class="card-title mb-10">Adicionar à Coleção</h2>
    <textarea class="inp inp-mono" id="manual-entry" rows="4" placeholder="Formato: Nome Sigla Número\nex: Torchic DRI 040\n\nCompatível com TCG Live">${esc(state.manualEntry)}</textarea>
    <button class="btn-pill btn-primary w-full mt-8" id="btn-add-collection">${icon("plus",15)} Adicionar Cartas</button>
  </div>`;
  const allCards = Object.values(state.collection).sort((a,b)=>a.name.localeCompare(b.name));
  const knownSets = [...new Set(allCards.map(c=>c.set).filter(Boolean))].sort();
  const filtered = allCards.filter(card => {
    const ms = !state.collSearch || card.name.toLowerCase().includes(state.collSearch.toLowerCase());
    const mset = state.collSetFilter==='todos' || card.set===state.collSetFilter;
    return ms && mset;
  });
  const grouped = {};
  filtered.forEach(card => {
    const key = card.name?.toLowerCase().trim() || card.id;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(card);
  });
  const groupKeys = Object.keys(grouped).sort();

  html += `<div class="surface-card">
    <div class="coll-header">
      <span class="card-title">Minha Coleção</span>
      <div class="coll-actions">
        <button class="btn-pill btn-ghost btn-xs" id="btn-update-pt">${icon("refresh",13)} PT</button>
        <button class="btn-pill btn-ghost btn-xs" id="btn-export-csv">${icon("upload",13)} Backup</button>
        <button class="btn-pill btn-ghost btn-xs" id="btn-import-csv">${icon("download",13)} Restaurar</button>
        <span class="badge badge-dim">${filtered.length}/${allCards.length}</span>
      </div>
    </div>
    <div class="search-filters mt-10">
      <input class="inp inp-search" id="coll-search" placeholder="Buscar por nome..." value="${esc(state.collSearch)}" oninput="state.collSearch=this.value;render()">
      <select class="inp select-inp mt-8" id="coll-set-filter" onchange="state.collSetFilter=this.value;render()">
        <option value="todos" ${state.collSetFilter==='todos'?'selected':''}>Todos os sets</option>
        ${knownSets.map(s=>`<option value="${s}" ${state.collSetFilter===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="coll-list mt-12">`;

  if (!allCards.length) {
    html += `<div class="empty-state compact"><div class="empty-icon">${icon("archive",40)}</div><p>Nenhuma carta ainda.</p></div>`;
  } else if (!groupKeys.length) {
    html += `<div class="empty-state compact"><p>Nenhuma carta encontrada.</p></div>`;
  } else {
    groupKeys.forEach(key => {
      const group = grouped[key];
      const totalQty = group.reduce((s,c)=>s+c.qty,0);
      const isMulti = group.length > 1;
      if (isMulti) {
        html += `<div class="coll-group-header">
          <div>
            <span class="coll-group-name">${esc(group[0].name)}</span>
            <span class="badge badge-dim ml-6">${group.length} versões · ${totalQty}x</span>
          </div>
        </div>`;
        group.forEach(card => {
          html += `<div class="coll-row sub-row">
            <span class="set-code-pill">${esc(card.set)} #${esc(card.number)}</span>
            <span onclick="openCardPage('${card.set.replace(/[^A-Za-z0-9]/g,"")}','${parseInt(card.number,10)||card.number}')" class="ver-link ml-4">${icon('external',12)}</span>
            <div class="counter-group ml-auto">
              <button class="counter-btn" ${card.qty<=0?'disabled':''} data-coll-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="-1">−</button>
              <span class="counter-val ${card.qty>0?'active':''}">${card.qty}</span>
              <button class="counter-btn" data-coll-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="1">+</button>
            </div>
          </div>`;
        });
      } else {
        const card = group[0];
        html += `<div class="coll-row">
          <div class="coll-row-info">
            <span class="coll-row-name">${esc(card.name)}</span>
            <span class="mono-sm text-muted">${esc(card.set)} #${esc(card.number)}
              <span onclick="openCardPage('${card.set.replace(/[^A-Za-z0-9]/g,"")}','${parseInt(card.number,10)||card.number}')" class="ver-link">${icon("external",12)}</span>
            </span>
          </div>
          <div class="counter-group">
            <button class="counter-btn" ${card.qty<=0?'disabled':''} data-coll-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="-1">−</button>
            <span class="counter-val ${card.qty>0?'active':''}">${card.qty}</span>
            <button class="counter-btn" data-coll-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="1">+</button>
          </div>
        </div>`;
      }
    });
  }
  html += `</div></div>`;
  return html;
}
