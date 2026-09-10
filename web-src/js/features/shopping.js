// Feature: Shopping.
// Lista de compras, formatação e exportação.

function buildShoppingList() {
  var source = state.shoppingSource || 'decks';

  if (source === 'decks') {
    // Consolidate missing cards across selected decks
    var deckFilter = state.shoppingDeckFilter || 'all';
    var decksToCheck = allDecks().filter(function(d){ return deckFilter === 'all' || d.id === deckFilter; });
    var cardMap = {};
    decksToCheck.forEach(function(deck) {
      deck.cards.forEach(function(card) {
        var owned = getOwnedQty(card);
        var missing = Math.max(0, card.qty - owned);
        if (missing <= 0) return;
        if (!cardMap[card.id]) cardMap[card.id] = { card: Object.assign({}, card), needed: 0, have: owned, missing: 0 };
        cardMap[card.id].missing += missing;
        cardMap[card.id].needed  += card.qty;
      });
    });
    return Object.values(cardMap).sort(function(a,b){ return a.card.name.localeCompare(b.card.name); });

  } else {
    // Set missing cards
    var setFilter = state.shoppingSetFilter || 'all';
    var typeFilter = state.shoppingSetTypeFilter || 'master';
    var setsToCheck = SET_COLLECTIONS.filter(function(s){ return setFilter === 'all' || s.sigla === setFilter; });
    var items = [];
    setsToCheck.forEach(function(s) {
      var thresh = SET_THRESHOLDS[s.sigla] || { basic: s.cards.length, complete: s.cards.length };
      var limit = typeFilter === 'basic' ? thresh.basic : s.cards.length;
      s.cards.forEach(function(card) {
        if (parseInt(card.number, 10) > limit) return;
        var qty = (state.collection[card.id] && state.collection[card.id].qty) || 0;
        if (qty > 0) return; // already have it
        items.push({ card: Object.assign({}, card), needed: 1, have: 0, missing: 1 });
      });
    });
    return items.sort(function(a,b){ return a.card.set.localeCompare(b.card.set) || parseInt(a.card.number,10) - parseInt(b.card.number,10); });
  }
}

function formatLigaPokemon(items, quality, lang) {
  var q = quality || 'nm';
  var l = lang    || 'pt';
  return items.map(function(item) {
    var c = item.card;
    // Number: always zero-padded to 3 digits
    var numPad = String(parseInt(c.number,10) || 0).padStart(3,'0');
    // Total: use basic threshold (the canonical set size for Liga Pokémon)
    var thresh = SET_THRESHOLDS[c.set];
    var setTotal = thresh ? String(thresh.basic) : String((SET_COLLECTIONS.find(function(s){ return s.sigla===c.set; })||{cards:[]}).cards.length);
    return item.missing + ' ' + c.name.toLowerCase()
      + ' (' + numPad + '/' + setTotal + ')'
      + ' [qualidade=' + q + '] [idioma=' + l + ']';
  }).join('\n');
}

function copyShoppingList() {
  const items = buildShoppingList();
  if (!items.length) return showToast('Nenhuma carta faltando!', 'error');
  const text = formatLigaPokemon(items, state.shoppingQuality, state.shoppingLang);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(items.length + ' itens copiados!'))
      .catch(() => fallbackCopyText(text));
  } else { fallbackCopyText(text); }
}

function exportShoppingList() {
  const items = buildShoppingList();
  if (!items.length) return showToast('Nenhuma carta faltando!', 'error');
  const text = formatLigaPokemon(items, state.shoppingQuality, state.shoppingLang);
  const filename = 'lista-compras-' + new Date().toISOString().slice(0,10) + '.txt';
  if (typeof window.AndroidExport !== 'undefined') {
    window.AndroidExport.shareCSV(filename, text);
    showToast(items.length + ' itens exportados!');
  } else {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(items.length + ' itens exportados!');
  }
}

function buildShoppingTab() {
  var quality  = state.shoppingQuality  || 'nm';
  var lang     = state.shoppingLang     || 'pt';
  var source   = state.shoppingSource   || 'decks';
  var deckFilter    = state.shoppingDeckFilter    || 'all';
  var setFilter     = state.shoppingSetFilter     || 'all';
  var setTypeFilter = state.shoppingSetTypeFilter || 'master';
  var items = buildShoppingList();
  var allDecksList = allDecks();

  var qualityOpts = [
    { v:'nm', label:'NM — Near Mint' },
    { v:'sp', label:'SP — Slightly Played' },
    { v:'mp', label:'MP — Moderately Played' },
    { v:'hp', label:'HP — Heavily Played' },
    { v:'dm', label:'DM — Damaged' },
  ];
  var langOpts = [
    { v:'pt', label:'PT — Português' },
    { v:'en', label:'EN — Inglês' },
    { v:'jp', label:'JP — Japonês' },
  ];

  // Header
  var html = '<div class="page-header">'
    + '<h1 class="page-title">Lista de Compras</h1>'
    + '<div style="display:flex;gap:6px">'
    + '<button class="btn-pill btn-ghost btn-xs" onclick="copyShoppingList()">' + icon('copy',13) + ' Copiar</button>'
    + '<button class="btn-pill btn-primary btn-xs" onclick="exportShoppingList()">' + icon('upload',13) + ' Exportar</button>'
    + '</div></div>';

  // Liga notice
  html += '<div class="surface-card mb-12" style="border-color:rgba(245,158,11,.3);background:var(--gold-dim)">'
    + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
    + icon('external',15)
    + '<span style="font-size:13px;font-weight:800;color:var(--gold)">Compatível com Liga Pokémon BR</span>'
    + '</div>'
    + '<p style="font-size:11px;color:var(--text-2);line-height:1.6">'
    + 'Formato aceito por <b>www.ligapokemon.com.br</b><br>'
    + '<code style="font-family:var(--font-mono);font-size:10px;background:var(--surface-3);padding:1px 5px;border-radius:4px">'
    + 'N nome (nº/total) [qualidade=X] [idioma=X]</code>'
    + '</p></div>';

  // Source tabs
  html += '<div class="sub-tabs mb-12">'
    + '<button class="sub-tab ' + (source==='decks'?'active':'') + '" onclick="state.shoppingSource=\'decks\';render()">Decks</button>'
    + '<button class="sub-tab ' + (source==='sets'?'active':'') + '" onclick="state.shoppingSource=\'sets\';render()">Coleções</button>'
    + '</div>';

  // Filters card
  var qualityOptions = qualityOpts.map(function(o){
    return '<option value="' + o.v + '" ' + (quality===o.v?'selected':'') + '>' + o.label + '</option>';
  }).join('');
  var langOptions = langOpts.map(function(o){
    return '<option value="' + o.v + '" ' + (lang===o.v?'selected':'') + '>' + o.label + '</option>';
  }).join('');

  html += '<div class="surface-card mb-12"><h2 class="card-title mb-10">Configurações</h2><div class="form-stack">';

  if (source === 'decks') {
    var deckOptions = '<option value="all" ' + (deckFilter==='all'?'selected':'') + '>Todos os decks</option>'
      + allDecksList.map(function(d){
          return '<option value="' + d.id + '" ' + (deckFilter===d.id?'selected':'') + '>' + esc(d.name) + '</option>';
        }).join('');
    html += '<div><p class="count-label mb-6">Deck(s)</p>'
      + '<select class="inp select-inp" onchange="state.shoppingDeckFilter=this.value;render()">'
      + deckOptions + '</select></div>';
  } else {
    var sortedForShop = [...SET_COLLECTIONS].sort(function(a,b){
      var da = SET_RELEASE_DATES[a.sigla]||'0000';
      var db = SET_RELEASE_DATES[b.sigla]||'0000';
      return db.localeCompare(da);
    });
    var setOptions = '<option value="all" ' + (setFilter==='all'?'selected':'') + '>Todos os sets</option>'
      + sortedForShop.map(function(s){
          var relDate = fmtDate(SET_RELEASE_DATES[s.sigla]);
          return '<option value="' + s.sigla + '" ' + (setFilter===s.sigla?'selected':'') + '>' + esc(s.name) + (relDate?' ('+relDate+')':'') + '</option>';
        }).join('');
    html += '<div><p class="count-label mb-6">Set(s)</p>'
      + '<select class="inp select-inp" onchange="state.shoppingSetFilter=this.value;render()">'
      + setOptions + '</select></div>';
    html += '<div class="type-filter-row mt-8">'
      + '<button onclick="state.shoppingSetTypeFilter=\'basic\';render()" class="type-btn ' + (setTypeFilter==='basic'?'active-purple':'') + '">'
      + icon('circle',13) + ' Completo<br><span class="type-sub">cartas numeradas</span></button>'
      + '<button onclick="state.shoppingSetTypeFilter=\'master\';render()" class="type-btn ' + (setTypeFilter==='master'?'active-gold':'') + '">'
      + icon('crown',13) + ' Master Set<br><span class="type-sub">todas as Full Arts</span></button>'
      + '</div>';
  }

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
    + '<div><p class="count-label mb-6">Qualidade mínima</p>'
    + '<select class="inp select-inp" onchange="state.shoppingQuality=this.value;render()">' + qualityOptions + '</select></div>'
    + '<div><p class="count-label mb-6">Idioma</p>'
    + '<select class="inp select-inp" onchange="state.shoppingLang=this.value;render()">' + langOptions + '</select></div>'
    + '</div></div></div>';

  if (!items.length) {
    html += '<div class="empty-state">'
      + '<div class="empty-icon">' + icon('check-sq',40) + '</div>'
      + '<p class="empty-title">' + (source==='decks'?'Coleção completa!':'Tudo completo!') + '</p>'
      + '<p class="empty-sub">Nenhuma carta faltando.</p>'
      + '</div>';
    return html;
  }

  var totalCopies = items.reduce(function(a,i){ return a+i.missing; }, 0);
  var listRows = '';
  items.forEach(function(item) {
    var c = item.card;
    var setData = SET_COLLECTIONS.find(function(s){ return s.sigla === c.set; });
    var thresh2 = SET_THRESHOLDS[c.set];
    var setTotal = thresh2 ? String(thresh2.basic) : (setData ? String(setData.cards.length) : '?');
    var numClean = String(parseInt(c.number,10)||0).padStart(3,'0');
    var previewLine = item.missing + ' ' + c.name.toLowerCase()
      + ' (' + numClean + '/' + setTotal + ')'
      + ' [qualidade=' + quality + '] [idioma=' + lang + ']';
    listRows += '<div class="set-row" style="flex-direction:column;align-items:flex-start;gap:4px;padding:10px 12px">'
      + '<div style="display:flex;align-items:center;gap:8px;width:100%">'
      + '<span class="badge badge-red" style="min-width:28px;justify-content:center">' + item.missing + '×</span>'
      + '<div style="flex:1;min-width:0">'
      + '<span class="set-row-name">' + esc(c.name) + '</span>'
      + '<span class="set-row-code mono-sm"> ' + c.set + ' #' + c.number
      + ' <span onclick="openCardPage(\'' + c.set.replace(/[^A-Za-z0-9]/g,'') + '\',\'' + String(parseInt(c.number,10)||0) + '\')" class="ver-link">' + icon('external',11) + '</span>'
      + '</span></div>'
      + (source==='decks' ? '<span class="badge badge-dim">possuí ' + item.have + '</span>' : '')
      + '</div>'
      + '<code style="font-family:var(--font-mono);font-size:9px;color:var(--text-3);word-break:break-all;padding-left:36px">' + esc(previewLine) + '</code>'
      + '</div>';
  });

  var previewText = esc(formatLigaPokemon(items, quality, lang));
  html += '<div class="surface-card">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
    + '<span class="card-title">' + items.length + ' carta' + (items.length!==1?'s':'') + ' faltando</span>'
    + '<span class="badge badge-red">' + totalCopies + ' cop.</span>'
    + '</div>'
    + '<div class="set-card-list">' + listRows + '</div>'
    + '<div style="margin-top:16px;padding:12px;background:var(--surface-3);border-radius:var(--radius-sm);border:1px solid var(--border-2)">'
    + '<p class="count-label mb-6">Preview — formato Liga Pokémon</p>'
    + '<pre style="font-family:var(--font-mono);font-size:10px;color:var(--text-2);white-space:pre-wrap;line-height:1.6;max-height:140px;overflow-y:auto">'
    + previewText + '</pre>'
    + '</div></div>';

  return html;
}
