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
