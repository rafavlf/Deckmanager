// Eventos: interactions.
// Handlers movidos do attachEvents original sem alterar sua lógica.

function bindInteractionEvents(app) {
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
}
