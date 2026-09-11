// Eventos: navigation.
// Handlers movidos do attachEvents original sem alterar sua lógica.

function bindNavigationEvents(app) {
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
}
