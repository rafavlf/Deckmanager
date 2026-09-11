// Feature: Dashboard.
// Cálculos e renderização do painel de progresso.

function calcDashboardStats() {
  const allCards    = Object.values(state.collection);
  const totalUnique = allCards.length;
  const totalCopies = allCards.reduce((s,c) => s+(c.qty||0), 0);

  const setStats = SET_COLLECTIONS.map(s => {
    const owned = s.cards.filter(c => (state.collection[c.id]?.qty||0)>0).length;
    const pct   = s.cards.length ? Math.floor(owned/s.cards.length*100) : 0;
    return { sigla:s.sigla, name:s.name, owned, total:s.cards.length, pct,
             series: SET_SERIES[s.sigla] || 'Outros' };
  });
  const mega = setStats.filter(s => s.series==='Mega');
  const sv   = setStats.filter(s => s.series==='Scarlet & Violet');
  const megaOwned = mega.reduce((a,s)=>a+s.owned, 0);
  const megaTotal = mega.reduce((a,s)=>a+s.total, 0);
  const svOwned   = sv.reduce((a,s)=>a+s.owned, 0);
  const svTotal   = sv.reduce((a,s)=>a+s.total, 0);

  const genDefs = [
    {label:'Kanto',  st:state.pokedex151,    total:151, gen:1},
    {label:'Johto',  st:state.pokedexJohto,  total:100, gen:2},
    {label:'Hoenn',  st:state.pokedexHoenn,  total:135, gen:3},
    {label:'Sinnoh', st:state.pokedexSinnoh, total:107, gen:4},
    {label:'Unova',  st:state.pokedexUnova,  total:156, gen:5},
    {label:'Kalos',  st:state.pokedexKalos,  total: 72, gen:6},
    {label:'Alola',  st:state.pokedexAlola,  total: 88, gen:7},
    {label:'Galar',  st:state.pokedexGalar,  total: 96, gen:8},
    {label:'Paldea', st:state.pokedexPaldea, total:120, gen:9},
  ];
  const genStats        = genDefs.map(g => ({...g, linked:Object.keys(g.st).length, pct:Math.floor(Object.keys(g.st).length/g.total*100)}));
  const totalPokedex    = genStats.reduce((a,g)=>a+g.linked, 0);
  const totalPokedexAll = genStats.reduce((a,g)=>a+g.total,  0);

  const deckStats      = state.decks.map(d => ({id:d.id, name:d.name, pct:calcProgress(d.cards), missing:calcMissing(d.cards)}));
  const completedDecks = deckStats.filter(d=>d.pct===100).length;
  const topDeck        = [...deckStats].sort((a,b)=>b.pct-a.pct)[0]||null;
  const bestDeck       = [...deckStats].filter(d=>d.pct<100).sort((a,b)=>b.pct-a.pct)[0]||null;

  return {totalUnique,totalCopies,megaOwned,megaTotal,svOwned,svTotal,
          genStats,totalPokedex,totalPokedexAll,deckStats,completedDecks,topDeck,bestDeck};
}

function buildDashboardTab() {
  const s = calcDashboardStats();
  const pdxPct    = s.totalPokedexAll ? Math.floor(s.totalPokedex/s.totalPokedexAll*100) : 0;
  const megaPct   = s.megaTotal ? Math.floor(s.megaOwned/s.megaTotal*100) : 0;
  const svPct     = s.svTotal   ? Math.floor(s.svOwned/s.svTotal*100)     : 0;
  const genColors = ['red','gold','blue','purple','green','blue','red','green','gold'];

  let html = `<div class="dash-grid-2 mb-12">
    <div class="stat-card">
      <span class="stat-label">${icon('package',14)} Cartas únicas</span>
      <span class="stat-value">${s.totalUnique.toLocaleString('pt-BR')}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">${icon('archive',14)} Cópias totais</span>
      <span class="stat-value">${s.totalCopies.toLocaleString('pt-BR')}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">${icon('circle',14)} Pokédex</span>
      <span class="stat-value">${s.totalPokedex}<span class="stat-sub">/${s.totalPokedexAll}</span></span>
    </div>
    <div class="stat-card">
      <span class="stat-label">${icon('check-sq',14)} Decks prontos</span>
      <span class="stat-value">${s.completedDecks}<span class="stat-sub">/${s.deckStats.length}</span></span>
    </div>
  </div>

  <div class="surface-card mb-12">
    <div class="dash-section-header mb-10">
      <span class="dash-section-title">${icon('list',14)} Pokédex por Geração</span>
      <span class="text-sm text-muted">${s.totalPokedex}/${s.totalPokedexAll} · ${pdxPct}%</span>
    </div>
    ${s.genStats.map((g,i) => `<div class="gen-bar-row" onclick="state.tab='league';state.leagueTab='sets';state.selectedSet='__pokedex__';state.pokedexGen=${g.gen};render()">
      <span class="gen-bar-label">${g.label}</span>
      <div class="gen-bar-track"><div class="gen-bar-fill ${genColors[i]}" style="width:${g.pct}%"></div></div>
      <span class="gen-bar-count">${g.linked}/${g.total}</span>
    </div>`).join('')}
  </div>

  <div class="surface-card mb-12">
    <div class="dash-section-header mb-10">
      <span class="dash-section-title">${icon('layers',14)} Progresso por Série</span>
    </div>
    <div class="series-bar-row mb-8">
      <span class="series-bar-label">Mega</span>
      <div class="gen-bar-track"><div class="gen-bar-fill gold" style="width:${megaPct}%"></div></div>
      <span class="gen-bar-count">${s.megaOwned}/${s.megaTotal}</span>
    </div>
    <div class="series-bar-row">
      <span class="series-bar-label">Scarlet &amp; Violet</span>
      <div class="gen-bar-track"><div class="gen-bar-fill red" style="width:${svPct}%"></div></div>
      <span class="gen-bar-count">${s.svOwned}/${s.svTotal}</span>
    </div>
  </div>

  ${s.deckStats.length ? `<div class="surface-card mb-12">
    <div class="dash-section-header mb-10">
      <span class="dash-section-title">${icon('cards',14)} Destaques de Deck</span>
    </div>
    ${s.topDeck ? `<div class="deck-highlight" onclick="state.tab='decks';state.selectedDeckId='${s.topDeck.id}';render()">
      <div class="flex-between"><span class="deck-highlight-name">${esc(s.topDeck.name)}</span><span class="badge badge-blue">${s.topDeck.pct}%</span></div>
      <div class="progress-track mt-6"><div class="progress-fill blue" style="width:${s.topDeck.pct}%"></div></div>
      <span class="text-xs text-muted">Mais completo</span>
    </div>` : ''}
    ${s.bestDeck && s.bestDeck.id !== s.topDeck?.id ? `<div class="deck-highlight mt-8" onclick="state.tab='decks';state.selectedDeckId='${s.bestDeck.id}';render()">
      <div class="flex-between"><span class="deck-highlight-name">${esc(s.bestDeck.name)}</span><span class="badge badge-red">Faltam ${s.bestDeck.missing}</span></div>
      <div class="progress-track mt-6"><div class="progress-fill blue" style="width:${s.bestDeck.pct}%"></div></div>
      <span class="text-xs text-muted">Mais próximo de completar</span>
    </div>` : ''}
  </div>` : ''}

  <details class="dash-shopping" ${state.dashShoppingOpen?'open':''}>
    <summary class="dash-shopping-summary" onclick="state.dashShoppingOpen=!state.dashShoppingOpen">
      <span>${icon('upload',15)} Lista de Compras</span>
      <span class="text-xs text-muted">Liga Pokémon BR</span>
    </summary>
    <div class="dash-shopping-body">${buildShoppingTab()}</div>
  </details>`;

  return html;
}
