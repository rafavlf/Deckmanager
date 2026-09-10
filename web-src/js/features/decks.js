// Feature: Decks.
// Regras de progresso, faltantes e operações relacionadas a decks.

function calcProgress(deckCards) {
  if (!deckCards || !deckCards.length) return 0;
  const total = deckCards.reduce((a,c)=>a+c.qty,0);
  const owned = deckCards.reduce((a,c)=>a+Math.min(getOwnedQty(c), c.qty),0);
  return total===0?0:Math.floor((owned/total)*100);
}

function calcMissing(deckCards) {
  if (!deckCards || !deckCards.length) return 0;
  return deckCards.reduce((a,c)=>a+Math.max(0, c.qty-getOwnedQty(c)), 0);
}

function buildDecksTab() {
  let html = `<div class="page-header">
    <h1 class="page-title">Meus Decks</h1>
    <button class="btn-pill btn-primary" id="btn-add-deck">${icon("plus",15)} Novo Deck</button>
  </div>`;

  if (state.showAddDeck) {
    html += `<div class="surface-card mb-16" id="form-deck">
      <h2 class="card-title mb-12">Importar Deck</h2>
      <div class="form-stack">
        <input class="inp" id="inp-deck-name" placeholder="Nome do Deck" value="${esc(state.newDeckName)}">
        <input class="inp" id="inp-deck-desc" placeholder="Descrição (opcional)" value="${esc(state.newDeckDesc)}" maxlength="120">
        <textarea class="inp inp-mono" id="inp-deck-list" rows="6" placeholder="Cole a lista (ex: 4 Torchic DRI 040)\n\nCompatível com exportação do Pokémon TCG Live">${esc(state.newDeckList)}</textarea>
        <div class="btn-row">
          <button class="btn-pill btn-ghost" id="btn-cancel-deck">Cancelar</button>
          <button class="btn-pill btn-primary" id="btn-save-deck">Salvar Deck</button>
        </div>
      </div>
    </div>`;
  }

  if (!state.decks.length) {
    html += `<div class="empty-state">
      <div class="empty-icon">${icon("cards",40)}</div>
      <p class="empty-title">Nenhum deck ainda</p>
      <p class="empty-sub">Clique em "Novo Deck" para importar sua lista</p>
    </div>`;
    return html;
  }

  // ── Search bar ────────────────────────────────
  html += `<input class="inp inp-search mb-8" id="deck-search-inp"
    placeholder="Buscar deck..." value="${esc(state.deckSearch)}"
    oninput="state.deckSearch=this.value;render()">`;

  // ── Sort chips ────────────────────────────────
  const sorts = [['recent','🕐 Recentes'],['name','A–Z'],['progress','% Progresso']];
  html += `<div class="chip-row mb-12">
    ${sorts.map(([val,label])=>`<button class="chip ${state.deckSort===val?'active':''}" onclick="state.deckSort='${val}';render()">${label}</button>`).join('')}
  </div>`;

  // ── Filter + sort ─────────────────────────────
  const search = state.deckSearch.toLowerCase();
  let deckList = [...state.decks];
  if (search) deckList = deckList.filter(d => d.name.toLowerCase().includes(search));

  if (state.deckSort === 'name')     deckList.sort((a,b)=>a.name.localeCompare(b.name,'pt'));
  else if (state.deckSort === 'progress') deckList.sort((a,b)=>calcProgress(b.cards)-calcProgress(a.cards));
  else deckList.sort((a,b)=>b.createdAt-a.createdAt);

  if (!deckList.length) {
    html += `<div class="empty-state compact"><p>Nenhum deck encontrado para "${esc(state.deckSearch)}".</p></div>`;
    return html;
  }

  html += `<div class="deck-grid">`;
  deckList.forEach(deck => {
    const pct = calcProgress(deck.cards);
    const missing = calcMissing(deck.cards);
    const isConfirm = state.confirmDeleteId === deck.id;
    html += `<div class="deck-card" data-open-deck="${deck.id}">
      <div class="deck-card-top">
        <div class="deck-card-name">
          ${esc(deck.name)}
          ${deck.isCustomized ? '<span class="badge badge-amber" style="margin-left:6px;font-size:9px">EDITADO</span>' : ''}
        </div>
        ${isConfirm
          ? `<div class="confirm-row" onclick="event.stopPropagation()">
              <button class="btn-pill btn-danger btn-xs" data-confirm-delete="${deck.id}">Excluir</button>
              <button class="btn-pill btn-ghost btn-xs" data-cancel-delete>Não</button>
             </div>`
          : `<div class="flex-gap" onclick="event.stopPropagation()">
              <button class="icon-btn" data-dupe-deck="${deck.id}" title="Duplicar deck">${icon("copy",14)}</button>
              <button class="icon-btn" data-edit-deck="${deck.id}" title="Editar deck">${icon("edit",14)}</button>
              <button class="icon-btn danger" data-ask-delete="${deck.id}">${icon("trash",14)}</button>
             </div>`
        }
      </div>
      <p class="deck-card-desc">${esc(deck.description||'')}</p>
      <div class="progress-row">
        <div class="progress-track"><div class="progress-fill blue" style="width:${pct}%"></div></div>
        <span class="progress-pct">${pct}%</span>
      </div>
      <div class="deck-card-footer">
        ${missing > 0
          ? `<span class="badge badge-red">Faltam ${missing}</span>`
          : `<span class="badge badge-green">${icon('check',10)} Completo</span>`}
        <span class="badge badge-dim">${deck.cards.reduce((a,c)=>a+c.qty,0)} cartas</span>
      </div>
    </div>`;
  });
  html += `</div>`;
  return html;
}

function buildDeckEditorModal() {
  if (!state.deckEditorId) return '';
  const deckId = state.deckEditorId;
  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return '';

  const search = (state.deckEditorSearch || '').toLowerCase();
  const addSearch = (state.deckEditorAddSearch || '').toLowerCase();

  // Filtered current cards
  const filteredCards = deck.cards.filter(c =>
    !search || c.name.toLowerCase().includes(search) || c.set.toLowerCase().includes(search)
  );

  // Total qty
  const totalQty = deck.cards.reduce((a, c) => a + c.qty, 0);
  const overLimit = totalQty > 60;

  // Search for cards to add from collection + pool
  let addResults = [];
  if (addSearch.length >= 2) {
    const seen = new Set(deck.cards.map(c => c.id));
    // Search collection
    Object.values(state.collection).forEach(c => {
      if (!c.name) return;
      if (c.name.toLowerCase().includes(addSearch) && !seen.has(c.id)) {
        addResults.push(c);
        seen.add(c.id);
      }
    });
    // Search all set collections
    for (const s of SET_COLLECTIONS) {
      for (const c of s.cards) {
        if (c.name.toLowerCase().includes(addSearch) && !seen.has(c.id)) {
          addResults.push(c);
          seen.add(c.id);
          if (addResults.length >= 20) break;
        }
      }
      if (addResults.length >= 20) break;
    }
    addResults = addResults.slice(0, 20);
  }

  let html = '<div class="modal-overlay" id="deck-editor-overlay">'
    + '<div class="modal-sheet" style="max-height:92vh">'
    + '<div class="modal-header">'
    + '<div>'
    + '<span class="modal-title">' + esc(deck.name) + '</span>'
    + (deck.isCustomized ? '<span class="badge badge-amber" style="margin-left:8px;font-size:9px">EDITADO</span>' : '')
    + '</div>'
    + '<div class="modal-actions">'
    + '<span class="badge ' + (overLimit ? 'badge-red' : 'badge-green') + '" style="font-size:11px">' + totalQty + '/60</span>'
    + '<button class="btn-pill btn-primary btn-xs" onclick="saveDeckEditorModal(\'' + deckId + '\')">' + icon('check',13) + ' Salvar</button>'
    + '<button class="btn-pill btn-ghost btn-xs" onclick="closeDeckEditorModal()">Fechar</button>'
    + '</div></div>'

    // Add card search
    + '<div class="modal-search" style="border-bottom:1px solid var(--border)">'
    + '<p class="count-label mb-6">Adicionar carta</p>'
    + '<input class="inp inp-search" id="deck-editor-add-search" placeholder="Buscar carta para adicionar..." value="' + esc(state.deckEditorAddSearch) + '" oninput="state.deckEditorAddSearch=this.value;render()">'
    + (addResults.length ? '<div style="max-height:140px;overflow-y:auto;margin-top:6px;border:1px solid var(--border);border-radius:var(--radius-sm)">'
      + addResults.map(c => {
          const inColl = (state.collection[c.id] && state.collection[c.id].qty > 0);
          return '<div onclick="deckEditorAddCard(\'' + deckId + '\',' + JSON.stringify({id:c.id,name:c.name,set:c.set,number:c.number}).replace(/"/g,'&quot;') + ')" class="modal-card">'
            + '<div class="modal-card-info">'
            + '<span class="modal-card-name">' + esc(c.name) + '</span>'
            + '<span class="mono-sm text-muted">' + c.set + ' #' + c.number + '</span>'
            + '</div>'
            + (inColl ? '<span class="badge badge-blue">Coleção</span>' : '')
            + icon('plus',14)
            + '</div>';
        }).join('')
      + '</div>' : '')
    + '</div>'

    // Search existing cards
    + '<div class="modal-search">'
    + '<input class="inp inp-search" id="deck-editor-search" placeholder="Filtrar cartas do deck..." value="' + esc(state.deckEditorSearch) + '" oninput="state.deckEditorSearch=this.value;render()">'
    + '<span class="count-label mt-6">' + filteredCards.length + ' carta' + (filteredCards.length!==1?'s':'') + ' · ' + filteredCards.reduce((a,c)=>a+c.qty,0) + ' cópias</span>'
    + '</div>'

    // Card list
    + '<div class="modal-list">';

  filteredCards.forEach(card => {
    const owned = getOwnedQty(card);
    const complete = owned >= card.qty;
    html += '<div class="modal-card" style="justify-content:space-between">'
      + '<div class="flex-gap" style="min-width:0;flex:1">'
      + '<div class="checkbox sm ' + (complete?'checked':'') + '">' + (complete?icon('check',11):'') + '</div>'
      + '<div style="min-width:0">'
      + '<span class="modal-card-name">' + esc(card.name) + '</span>'
      + '<span class="mono-sm text-muted"> ' + card.set + ' #' + card.number
      + ' <span onclick="openCardPage(\'' + card.set.replace(/[^A-Za-z0-9]/g,'') + '\',\'' + (parseInt(card.number,10)||card.number) + '\')" class="ver-link">' + icon('external',11) + '</span>'
      + '</span></div></div>'
      + '<div class="flex-gap">'
      + '<span class="mono-sm" style="color:var(--text-3)">possuí ' + owned + '</span>'
      + '<div class="counter-group">'
      + '<button class="counter-btn" ' + (card.qty<=1?'disabled':'') + ' onclick="deckEditorChangeQty(\'' + deckId + '\',\'' + card.id + '\',-1)">−</button>'
      + '<span class="counter-val ' + (complete?'green':card.qty>0?'amber':'dim') + '">' + card.qty + '</span>'
      + '<button class="counter-btn" onclick="deckEditorChangeQty(\'' + deckId + '\',\'' + card.id + '\',1)">+</button>'
      + '</div>'
      + '<button class="icon-btn danger" onclick="deckEditorRemoveCard(\'' + deckId + '\',\'' + card.id + '\')" title="Remover">' + icon('x',12) + '</button>'
      + '</div>'
      + '</div>';
  });

  if (!filteredCards.length) {
    html += '<div class="empty-state compact"><p class="empty-sub">Nenhuma carta encontrada.</p></div>';
  }

  html += '</div></div></div>';
  return html;
}

function allDecks() { return [...state.decks, ...PRESET_DECKS]; }

function selectedDeck() {
  if (!state.selectedDeckId) return null;
  return allDecks().find(d => d.id === state.selectedDeckId) || null;
}

function copyDeck(deck) {
  const txt = deck.cards.map(c=>`${c.qty} ${c.name} ${c.set} ${c.number}`).join('\n');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(()=>showToast(`Deck "${deck.name}" copiado!`)).catch(()=>fallbackCopy(txt,deck.name));
  } else { fallbackCopy(txt, deck.name); }
}

function exportDecks() {
  if (!state.decks.length) return showToast('Nenhum deck para exportar.', 'error');
  const data = JSON.stringify({ version: 1, decks: state.decks }, null, 2);
  const filename = 'ptcg-decks-' + new Date().toISOString().slice(0,10) + '.json';
  if (typeof window.AndroidExport !== 'undefined') {
    window.AndroidExport.shareCSV(filename, data); // reuses same bridge
    showToast(state.decks.length + ' deck(s) exportado(s)!');
  } else {
    try {
      const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(state.decks.length + ' deck(s) exportado(s)!');
    } catch(e) { showToast('Erro ao exportar: ' + e.message, 'error'); }
  }
}

function processDeckImportText(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    const imported = Array.isArray(data) ? data : (data.decks || []);
    if (!imported.length) return showToast('Nenhum deck encontrado no arquivo.', 'error');
    let added = 0, skipped = 0;
    imported.forEach(deck => {
      if (!deck.name || !Array.isArray(deck.cards)) { skipped++; return; }
      // Avoid duplicates by name
      if (state.decks.some(d => d.name === deck.name)) { skipped++; return; }
      state.decks.push({
        id: genId(),
        name: deck.name,
        description: deck.description || '',
        cards: deck.cards,
        createdAt: deck.createdAt || Date.now()
      });
      added++;
    });
    if (!added) return showToast('Todos os decks já existem (mesmo nome).', 'error');
    saveStorage();
    showToast(added + ' deck(s) importado(s)!' + (skipped > 0 ? ' (' + skipped + ' ignorado(s))' : ''));
    render();
  } catch(e) {
    showToast('Arquivo inválido. Use um JSON exportado pelo app.', 'error');
  }
}

function importDecks() {
  if (typeof window.AndroidExport !== 'undefined') {
    // Android: reutiliza o picker nativo (o callback onCSVImported receberá o JSON)
    window._deckImportMode = true;
    window.AndroidExport.pickCSV();
  } else {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json';
    inp.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => processDeckImportText(ev.target.result);
      reader.readAsText(file, 'utf-8');
    };
    inp.click();
  }
}

// Override onCSVImported to route to deck import if flagged
const _origOnCSVImported = window.onCSVImported;

function openDeckEditorModal(deckId) {
  state.deckEditorId = deckId;
  state.deckEditorSearch = '';
  state.deckEditorAddSearch = '';
  render();
}

function closeDeckEditorModal() {
  state.deckEditorId = null;
  state.deckEditorSearch = '';
  state.deckEditorAddSearch = '';
  render();
}

function saveDeckEditorModal(deckId) {
  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return;
  // Remove cards with qty 0
  deck.cards = deck.cards.filter(c => c.qty > 0);
  deck.isCustomized = true;
  saveStorage();
  closeDeckEditorModal();
  showToast('Deck salvo com as alterações!');
}

function deckEditorChangeQty(deckId, cardId, delta) {
  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return;
  const card = deck.cards.find(c => c.id === cardId);
  if (!card) return;
  card.qty = Math.max(0, card.qty + delta);
  render();
}

function deckEditorAddCard(deckId, cardObj) {
  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return;
  const existing = deck.cards.find(c => c.id === cardObj.id);
  if (existing) {
    existing.qty += 1;
  } else {
    deck.cards.push({ id: cardObj.id, name: cardObj.name, set: cardObj.set, number: cardObj.number, qty: 1 });
  }
  state.deckEditorAddSearch = '';
  render();
}

function deckEditorRemoveCard(deckId, cardId) {
  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return;
  deck.cards = deck.cards.filter(c => c.id !== cardId);
  render();
}

function buildDeckDetail(deck) {
  const pct = calcProgress(deck.cards);
  const missing = calcMissing(deck.cards);
  const isPreset = PRESET_DECKS.some(p=>p.id===deck.id);
  const cardsToShow = state.showMissingOnly
    ? deck.cards.filter(c=>getOwnedQty(c)<c.qty)
    : deck.cards;

  let html = `<div class="detail-header">
    <button class="btn-back" id="btn-back-deck">${icon("back",16)} Voltar</button>
    <div class="detail-title-row">
      <input class="detail-title-input" id="deck-title-input" value="${esc(deck.name)}" maxlength="60" placeholder="Nome do deck" oninput="const d=state.decks.find(x=>x.id==='${deck.id}');if(d){d.name=this.value;saveStorage();}">  
      ${isPreset?'<span class="badge badge-amber">Liga</span>':''}
    </div>
    <button class="btn-pill btn-ghost btn-xs" id="btn-copy-deck">${icon("copy",14)} Copiar</button>
    ${hasNativeBridge() ? `<button class="btn-pill btn-ghost btn-xs" id="btn-share-deck">${icon("upload",13)} Compartilhar</button>` : ""}
  </div>
  <textarea class="inp deck-desc-input" id="deck-desc-input" rows="2" maxlength="120" placeholder="Descrição (opcional)..." oninput="const d=state.decks.find(x=>x.id==='${deck.id}');if(d){d.description=this.value;saveStorage();}">${esc(deck.description||'')} </textarea>
  <details class="deck-notes-block mb-10" ${deck.notes?'open':''}>
    <summary class="deck-notes-summary">${icon('edit',13)} Notas do deck</summary>
    <textarea
      class="inp inp-mono deck-notes-input"
      id="deck-notes-input"
      rows="3"
      placeholder="Estratégia, torneio, observações..."
      data-deck-notes-id="${deck.id}"
      oninput="const d=state.decks.find(x=>x.id==='${deck.id}');if(d){d.notes=this.value;saveStorage();}"
    >${esc(deck.notes||'')}</textarea>
  </details>
  <div class="deck-stats mb-12">
    <div class="progress-track"><div class="progress-fill blue glow" style="width:${pct}%"></div></div>
    <div class="deck-stats-row">
      <span class="text-muted text-sm">${pct}% completo</span>
      <div class="flex-gap">
        ${missing>0?`<span class="badge badge-red">Faltam ${missing}</span>`:`<span class="badge badge-green">${icon('check',10)} Completo</span>`}
        <span class="badge badge-dim">${deck.cards.reduce((a,c)=>a+c.qty,0)} cartas</span>
      </div>
    </div>
  </div>
  <button id="btn-toggle-missing" class="toggle-missing-btn ${state.showMissingOnly?'active':''}">
    ${state.showMissingOnly?icon('eye',15)+' Mostrar todas':icon('eye-off',15)+' Mostrar apenas o que falta'}
  </button>
  <div class="deck-cards-list">`;

  if (state.showMissingOnly && cardsToShow.length===0) {
    html += `<div class="empty-state compact"><div class="empty-icon">${icon("check-sq",40)}</div><p>Você tem todas as cartas!</p></div>`;
  }

  cardsToShow.forEach(card => {
    const owned = getOwnedQty(card);
    const complete = owned >= card.qty;
    html += `<div class="deck-row ${complete?'complete':''}">
      <div class="deck-row-check" data-toggle-card="${encodeURIComponent(JSON.stringify({...card, _complete: complete}))}">
        <div class="checkbox ${complete?'checked':''}">${complete?icon('check',13):''}</div>
      </div>
      <div class="deck-row-info">
        <span class="deck-row-name ${complete?'owned-text':''}">${card.qty}× ${esc(card.name)}</span>
        <span class="mono-sm text-muted">
          ${card.set} #${card.number}
          <span onclick="openCardPage('${card.set.replace(/[^A-Za-z0-9]/g,"")}','${parseInt(card.number,10)||card.number}')" class="ver-link">${icon("external",12)}</span>
        </span>
      </div>
      <div class="counter-group">
        <button class="counter-btn" ${owned<=0?'disabled':''} data-deck-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="-1">−</button>
        <span class="counter-val ${owned>=card.qty?'green':owned>0?'amber':'dim'}">${owned}/${card.qty}</span>
        <button class="counter-btn" data-deck-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="1">+</button>
      </div>
    </div>`;
  });
  html += `</div>`;
  return html;
}
