// Eventos: decks.
// Handlers movidos do attachEvents original sem alterar sua lógica.

function bindDeckEvents(app) {
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
}
