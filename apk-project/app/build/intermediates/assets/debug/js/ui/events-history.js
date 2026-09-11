// Eventos: history.
// Handlers movidos do attachEvents original sem alterar sua lógica.

function bindHistoryEvents() {
  window.onpopstate = () => {
    if (state.selectedDeckId) { state.selectedDeckId=null; render(); }
    else if (state.selectedSet) { state.selectedSet=null; render(); }
  };
}
