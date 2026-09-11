// Agregador de eventos da aplicação.

function attachEvents() {
  const app = document.getElementById('app');
  bindNavigationEvents(app);
  bindInteractionEvents(app);
  bindDeckEvents(app);
  bindCollectionEvents(app);
  bindHistoryEvents();
}
