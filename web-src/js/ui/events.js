// Eventos globais da aplicação.
// O corpo de attachEvents() foi movido sem alterações internas.

function attachEvents() {
  const app = document.getElementById('app');

  app.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      state.tab = el.dataset.nav;
      state.selectedDeckId = null;
      state.confirmDeleteId = null;
      state.showAddDeck = false;
      state.showMissingOnly = false;
      state.deckSearch = '';
      state.pokedexModal = null;
      state.selectedSet = null;
      render();
    });
  });

  app.querySelectorAll('[data-league-tab]').forEach(el => {
    el.addEventListener('click', () => {
      state.leagueTab = el.dataset.leagueTab || 'sets';
      state.selectedSet = null;
      state.setSearch = '';
      state.seriesFilter = 'Todos';
      state.gridTypeFilter = 'master';
      render();
    });
  });

  app.querySelectorAll('[data-open-deck]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-ask-delete],[data-confirm-delete],[data-cancel-delete]')) return;
      state.selectedDeckId = el.dataset.openDeck;
      render();
    });
  });

  app.querySelectorAll('[data-open-set]').forEach(el => {
    el.addEventListener('click', () => { state.selectedSet = el.dataset.openSet; render(); });
  });

  const backDeck = document.getElementById('btn-back-deck');
  if (backDeck) backDeck.addEventListener('click', () => { state.selectedDeckId = null; state.showMissingOnly = false; render(); });

  const backSets = document.getElementById('btn-back-sets');
  if (backSets) backSets.addEventListener('click', () => { state.selectedSet = null; state.setSearch = ''; state.setStatusFilter = 'all'; state.setTypeFilter = 'master'; render(); });

  const pdOverlay = document.getElementById('pokedex-modal-overlay');
  if (pdOverlay) pdOverlay.addEventListener('click', (e) => {
    if (e.target === pdOverlay) {
      state.pokedexModal = null;
      state.pokedexModalG2 = null;
      state.pokedexModalG3 = null;
      state.pokedexModalSearch = '';
      render();
    }
  });

  const deOverlay = document.getElementById('deck-editor-overlay');
  if (deOverlay) deOverlay.addEventListener('click', (e) => {
    if (e.target === deOverlay) closeDeckEditorModal();
  });

  const btnAddDeck = document.getElementById('btn-add-deck');
  if (btnAddDeck) btnAddDeck.addEventListener('click', () => { state.showAddDeck = !state.showAddDeck; render(); });

  const btnCancelDeck = document.getElementById('btn-cancel-deck');
  if (btnCancelDeck) btnCancelDeck.addEventListener('click', () => {
    state.showAddDeck = false; state.newDeckName=''; state.newDeckDesc=''; state.newDeckList=''; render();
  });

  const btnSaveDeck = document.getElementById('btn-save-deck');
  if (btnSaveDeck) btnSaveDeck.addEventListener('click', () => {
    const name = document.getElementById('inp-deck-name').value.trim();
    const desc = document.getElementById('inp-deck-desc').value.trim();
    const list = document.getElementById('inp-deck-list').value;
    if (!name) return showToast('O deck precisa ter um nome.','error');
    const { cards, invalidCount } = parseInput(list);
    if (invalidCount) showToast(`${invalidCount} linha(s) ignoradas.`,'error');
    if (!cards.length) return showToast('Adicione cartas válidas.','error');
    if (cards.reduce((a,c)=>a+c.qty,0)>60) return showToast('Deck ultrapassa 60 cartas.','error');
    state.decks.push({ id: genId(), name, description: desc, notes: '', cards, createdAt: Date.now() });
    state.showAddDeck = false; state.newDeckName=''; state.newDeckDesc=''; state.newDeckList='';
    saveStorage(); showToast('Deck salvo!'); render();
  });

  ['inp-deck-name','inp-deck-desc','inp-deck-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      if (id==='inp-deck-name') state.newDeckName = el.value;
      if (id==='inp-deck-desc') state.newDeckDesc = el.value;
      if (id==='inp-deck-list') state.newDeckList = el.value;
    });
  });

  // Edit deck button
  // Duplicar deck
  app.querySelectorAll('[data-dupe-deck]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const original = state.decks.find(d => d.id === el.dataset.dupeDeck);
      if (!original) return;
      state.decks.push({
        ...original,
        id: genId(),
        name: original.name + ' (cópia)',
        notes: original.notes || '',
        createdAt: Date.now(),
        isCustomized: false,
      });
      saveStorage(); render();
      showToast('Deck duplicado!');
    });
  });

  app.querySelectorAll('[data-edit-deck]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); openDeckEditorModal(el.dataset.editDeck); });
  });

  app.querySelectorAll('[data-ask-delete]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation(); state.confirmDeleteId = el.dataset.askDelete; render(); });
  });
  app.querySelectorAll('[data-confirm-delete]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation();
      state.decks = state.decks.filter(d=>d.id!==el.dataset.confirmDelete);
      state.confirmDeleteId = null; saveStorage(); showToast('Deck excluído.'); render();
    });
  });
  const btnCancelDel = app.querySelector('[data-cancel-delete]');
  if (btnCancelDel) btnCancelDel.addEventListener('click', (e) => { e.stopPropagation(); state.confirmDeleteId=null; render(); });

  const btnCopy = document.getElementById('btn-copy-deck');
  if (btnCopy) btnCopy.addEventListener('click', () => { const d=selectedDeck(); if(d) copyDeck(d); });

  const btnShare = document.getElementById('btn-share-deck');
  if (btnShare) btnShare.addEventListener('click', () => {
    const d = selectedDeck();
    if (!d) return;
    const txt = d.cards.map(c=>`${c.qty} ${c.name} ${c.set} ${c.number}`).join('\n');
    const filename = d.name.replace(/[^a-z0-9]/gi,'_') + '.txt';
    window.AndroidExport.shareCSV(filename, txt);
    showToast('Abrindo compartilhamento...');
  });

  const btnToggleMissing = document.getElementById('btn-toggle-missing');
  if (btnToggleMissing) btnToggleMissing.addEventListener('click', () => { state.showMissingOnly = !state.showMissingOnly; render(); });

  app.querySelectorAll('[data-toggle-card]').forEach(el => {
    el.addEventListener('click', (e) => { e.stopPropagation();
      const card = JSON.parse(decodeURIComponent(el.dataset.toggleCard));
      updateCollectionQty(card, 0, card._complete ? 0 : card.qty);
    });
  });

  app.querySelectorAll('[data-deck-card]').forEach(el => {
    el.addEventListener('click', () => {
      const card = JSON.parse(decodeURIComponent(el.dataset.deckCard));
      updateCollectionQty(card, parseInt(el.dataset.delta));
    });
  });
  app.querySelectorAll('[data-pool-card]').forEach(el => {
    el.addEventListener('click', () => {
      const card = JSON.parse(decodeURIComponent(el.dataset.poolCard));
      updateCollectionQty(card, parseInt(el.dataset.delta));
    });
  });
  app.querySelectorAll('[data-set-card]').forEach(el => {
    el.addEventListener('click', () => {
      const card = JSON.parse(decodeURIComponent(el.dataset.setCard));
      updateCollectionQty(card, parseInt(el.dataset.delta));
    });
  });
  app.querySelectorAll('[data-coll-card]').forEach(el => {
    el.addEventListener('click', () => {
      const card = JSON.parse(decodeURIComponent(el.dataset.collCard));
      updateCollectionQty(card, parseInt(el.dataset.delta));
    });
  });

  app.querySelectorAll('[data-pool-filter]').forEach(el => {
    el.addEventListener('click', () => { state.poolFilter = el.dataset.poolFilter; render(); });
  });

  const manualEl = document.getElementById('manual-entry');
  if (manualEl) manualEl.addEventListener('input', () => { state.manualEntry = manualEl.value; });

  const btnAddColl = document.getElementById('btn-add-collection');
  if (btnAddColl) btnAddColl.addEventListener('click', () => {
    const text = document.getElementById('manual-entry').value;
    if (!text.trim()) return;
    const { cards, invalidCount } = parseInput(text);
    if (invalidCount) showToast(`${invalidCount} linha(s) ignoradas.`,'error');
    if (!cards.length) return;
    cards.forEach(rawItem => {
      const item = resolveCardName(rawItem);
      const existing = state.collection[item.id];
      const wasZero = !existing || existing.qty === 0;
      state.collection[item.id] = { ...item, qty: (existing?.qty||0) + item.qty };
      if (wasZero) syncCollectionToPokedex(item);
    });
    state.manualEntry = '';
    saveStorage(); showToast('Coleção atualizada!'); render();
  });

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCollectionCSV);

  const btnImport = document.getElementById('btn-import-csv');
  if (btnImport) btnImport.addEventListener('click', () => {
    if (typeof window.AndroidExport !== 'undefined') {
      window.AndroidExport.pickCSV();
    } else {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.csv';
      inp.onchange = (e) => { if (e.target.files[0]) importCollectionCSV(e.target.files[0]); };
      inp.click();
    }
  });

  const btnPT = document.getElementById('btn-update-pt');
  if (btnPT) btnPT.addEventListener('click', () => {
    const ptMap = {};
    allDecks().forEach(deck => deck.cards.forEach(card => {
      if (card.id && card.name && !ptMap[card.id]) ptMap[card.id] = card.name;
    }));
    let count = 0;
    Object.keys(state.collection).forEach(id => {
      if (ptMap[id] && state.collection[id].name !== ptMap[id]) {
        state.collection[id].name = ptMap[id]; count++;
      }
    });
    if (!count) return showToast('Nenhuma carta para atualizar.','error');
    saveStorage(); showToast(`${count} carta(s) atualizada(s)!`); render();
  });

  window.onpopstate = () => {
    if (state.selectedDeckId) { state.selectedDeckId=null; render(); }
    else if (state.selectedSet) { state.selectedSet=null; render(); }
  };
}
