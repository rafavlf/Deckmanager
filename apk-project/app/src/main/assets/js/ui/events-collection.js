// Eventos: collection.
// Handlers movidos do attachEvents original sem alterar sua lógica.

function bindCollectionEvents(app) {
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
}
