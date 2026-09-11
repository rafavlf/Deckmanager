// Feature: Coleções / Sets.
// Renderização da área de coleções principais e detalhe dos sets.

function buildLeagueTab() {
  return `<div class="page-header mb-4">
    <h1 class="page-title">Coleções Principais</h1>
  </div>
  ${buildLeagueSets()}`;
}

function buildLeaguePool() {
  const typeColor = { Item:'badge-blue', Ferramenta:'badge-purple', Estádio:'badge-green', Energia:'badge-amber', 'Básicos EX':'badge-red' };
  const filters = ['todos','Básicos EX','Item','Ferramenta','Estádio','Energia'];
  const filtered = LEAGUE_POOL.filter(c => {
    const ft = state.poolFilter==='todos' || c.type===state.poolFilter;
    const fs = !state.poolSearch || c.name.toLowerCase().includes(state.poolSearch.toLowerCase());
    return ft && fs;
  });
  let html = `<div class="search-row mb-8">
    <input class="inp inp-search" id="pool-search" placeholder="Buscar carta..." value="${esc(state.poolSearch)}" oninput="state.poolSearch=this.value;render()">
  </div>
  <div class="chip-row mb-12">
    ${filters.map(f=>`<button class="chip ${state.poolFilter===f?'active':''}" data-pool-filter="${f}">${f==='todos'?'Todos':f}</button>`).join('')}
  </div>
  <p class="count-label mb-8">${filtered.length} carta${filtered.length!==1?'s':''}</p>
  <div class="card-list">`;
  filtered.forEach(card => {
    const owned = getOwnedQty(card);
    const collCard = { id: card.id, name: card.name, set: card.id.split('_')[0], number: card.id.split('_')[1] };
    html += `<div class="list-card ${owned>0?'owned':''}">
      <div class="list-card-header">
        <div class="list-card-meta">
          <span class="list-card-name">${esc(card.name)}</span>
          <span class="badge ${typeColor[card.type]||'badge-dim'}">${esc(card.type)}</span>
          ${card.hp?`<span class="badge badge-dim">${card.hp}PS · ${esc(card.pokemonType)}</span>`:''}
        </div>
        <div class="counter-group">
          <button class="counter-btn" ${owned<=0?'disabled':''} data-pool-card="${encodeURIComponent(JSON.stringify(collCard))}" data-delta="-1">−</button>
          <span class="counter-val ${owned>0?'active':''}">${owned}</span>
          <button class="counter-btn" data-pool-card="${encodeURIComponent(JSON.stringify(collCard))}" data-delta="1">+</button>
        </div>
      </div>
      <div class="print-chips">
        ${card.prints.map(p=>{ const pts=p.split(' '); const s=pts[0]; const n=(pts[1]||'').replace('#','');
          return `<span class="print-chip" onclick="openCardPage('${s.replace(/[^A-Za-z0-9]/g,"")}','${parseInt(n,10)||n}')">${esc(p)}</span>`;
        }).join('')}
      </div>
      <p class="list-card-desc">${esc(card.desc)}</p>
    </div>`;
  });
  if (!filtered.length) html += `<div class="empty-state compact"><p>Nenhuma carta encontrada.</p></div>`;
  html += `</div>`;
  return html;
}

function buildLeagueSets() {
  if (state.selectedSet === '__pokedex__') return buildPokedexView();

  if (!state.selectedSet) {
    const seriesFilter = state.seriesFilter || 'Todos';
    const pdLinked = Object.keys(state.pokedex151).length;
    const pdPct = Math.floor((pdLinked/151)*100);

    // Filter + sort sets
    const allSeries = ['Todos','Pokédex','Mega','Scarlet & Violet'];
    const sortedSets = [...SET_COLLECTIONS].sort((a,b)=>{
      const da = SET_RELEASE_DATES[a.sigla]||'0000';
      const db = SET_RELEASE_DATES[b.sigla]||'0000';
      return db.localeCompare(da);
    });

    // Group by series for display
    const seriesGroups = {};
    sortedSets.forEach(s => {
      const ser = SET_SERIES[s.sigla] || 'Outros';
      if (!seriesGroups[ser]) seriesGroups[ser] = [];
      seriesGroups[ser].push(s);
    });

    const showSeries = seriesFilter === 'Todos'
      ? ['Mega','Scarlet & Violet']
      : seriesFilter === 'Pokédex' ? [] : [seriesFilter];

    // Pokédex tracker always visible
    const showPokedex = seriesFilter === 'Todos' || seriesFilter === 'Pokédex';

    const gridType = state.gridTypeFilter || 'master';

    let html = `<div class="chip-row mb-8">
      ${allSeries.map(s=>`<button class="chip ${seriesFilter===s?'active':''}" onclick="state.seriesFilter='${s}';render()">${s}</button>`).join('')}
    </div>
    <div class="type-filter-row mb-12">
      <button onclick="state.gridTypeFilter='basic';render()" class="type-btn ${gridType==='basic'?'active-purple':''}">
        ${icon("circle",13)} Completo<br><span class="type-sub">cartas numeradas</span>
      </button>
      <button onclick="state.gridTypeFilter='master';render()" class="type-btn ${gridType==='master'?'active-gold':''}">
        ${icon("crown",13)} Master Set<br><span class="type-sub">todas as Full Arts</span>
      </button>
    </div>`;

    if (showPokedex) {
      // Gen2 stats
      if (!state.pokedexJohto) state.pokedexJohto = {};
      const pdJohtoLinked = Object.keys(state.pokedexJohto).length;
      const pdJohtoPct = Math.floor((pdJohtoLinked/100)*100);

      if (!state.pokedexHoenn)  state.pokedexHoenn  = {};
      if (!state.pokedexSinnoh) state.pokedexSinnoh = {};
      if (!state.pokedexUnova)  state.pokedexUnova  = {};
      const pdHoennLinked  = Object.keys(state.pokedexHoenn).length;
      const pdHoennPct     = Math.floor((pdHoennLinked/135)*100);
      const pdSinnohLinked = Object.keys(state.pokedexSinnoh).length;
      const pdSinnohPct    = Math.floor((pdSinnohLinked/107)*100);
      const pdUnovaLinked  = Object.keys(state.pokedexUnova).length;
      const pdUnovaPct     = Math.floor((pdUnovaLinked/156)*100);
      if (!state.pokedexKalos) state.pokedexKalos = {};
      const pdKalosLinked  = Object.keys(state.pokedexKalos).length;
      const pdKalosPct     = Math.floor((pdKalosLinked/72)*100);
      if (!state.pokedexAlola)  state.pokedexAlola  = {};
      if (!state.pokedexGalar)  state.pokedexGalar  = {};
      if (!state.pokedexPaldea) state.pokedexPaldea = {};
      const pdAlolaLinked  = Object.keys(state.pokedexAlola).length;
      const pdAlolaPct     = Math.floor((pdAlolaLinked/88)*100);
      const pdGalarLinked  = Object.keys(state.pokedexGalar).length;
      const pdGalarPct     = Math.floor((pdGalarLinked/96)*100);
      const pdPaldeaLinked = Object.keys(state.pokedexPaldea).length;
      const pdPaldeaPct    = Math.floor((pdPaldeaLinked/120)*100);

      html += `<div class="sets-series-label">Pokédex</div>
        <div class="sets-grid mb-12">
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=1;render()" style="border-color:rgba(239,68,68,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Kanto — Gen I</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-red mono-sm">#001–151</span>
                </div>
              </div>
              <span class="set-card-count">${pdLinked}/151</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill red" style="width:${pdPct}%"></div></div>
            <div class="set-card-pct">${pdPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=2;render()" style="border-color:rgba(245,158,11,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Johto — Gen II</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-amber mono-sm">#152–251</span>
                </div>
              </div>
              <span class="set-card-count">${pdJohtoLinked}/100</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill gold" style="width:${pdJohtoPct}%"></div></div>
            <div class="set-card-pct">${pdJohtoPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=3;render()" style="border-color:rgba(59,130,246,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Hoenn — Gen III</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-blue mono-sm">#252–386</span>
                </div>
              </div>
              <span class="set-card-count">${pdHoennLinked}/135</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill blue" style="width:${pdHoennPct}%"></div></div>
            <div class="set-card-pct">${pdHoennPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=4;render()" style="border-color:rgba(16,185,129,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Sinnoh — Gen IV</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-green mono-sm">#387–493</span>
                </div>
              </div>
              <span class="set-card-count">${pdSinnohLinked}/107</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill green" style="width:${pdSinnohPct}%"></div></div>
            <div class="set-card-pct">${pdSinnohPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=5;render()" style="border-color:rgba(139,92,246,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Unova — Gen V</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-purple mono-sm">#494–649</span>
                </div>
              </div>
              <span class="set-card-count">${pdUnovaLinked}/156</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill" style="background:var(--purple);width:${pdUnovaPct}%"></div></div>
            <div class="set-card-pct">${pdUnovaPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=6;render()" style="border-color:rgba(59,130,246,.3)">
            <div class="set-card-header">
              <div>
                <div class="set-card-name">Kalos — Gen VI</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                  <span class="badge badge-blue mono-sm">#650–721</span>
                </div>
              </div>
              <span class="set-card-count">${pdKalosLinked}/72</span>
            </div>
            <div class="progress-track mt-8"><div class="progress-fill blue" style="width:${pdKalosPct}%"></div></div>
            <div class="set-card-pct">${pdKalosPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=7;render()" style="border-color:rgba(245,158,11,.3)">
            <div class="set-card-header"><div><div class="set-card-name">Alola — Gen VII</div><div style="display:flex;gap:4px;align-items:center;margin-top:2px;"><span class="badge badge-amber mono-sm">#722–809</span></div></div><span class="set-card-count">${pdAlolaLinked}/88</span></div>
            <div class="progress-track mt-8"><div class="progress-fill gold" style="width:${pdAlolaPct}%"></div></div>
            <div class="set-card-pct">${pdAlolaPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=8;render()" style="border-color:rgba(239,68,68,.3)">
            <div class="set-card-header"><div><div class="set-card-name">Galar — Gen VIII</div><div style="display:flex;gap:4px;align-items:center;margin-top:2px;"><span class="badge badge-red mono-sm">#810–905</span></div></div><span class="set-card-count">${pdGalarLinked}/96</span></div>
            <div class="progress-track mt-8"><div class="progress-fill red" style="width:${pdGalarPct}%"></div></div>
            <div class="set-card-pct">${pdGalarPct}%</div>
          </div>
          <div class="set-card pokedex-card" onclick="state.selectedSet='__pokedex__';state.pokedexGen=9;render()" style="border-color:rgba(16,185,129,.3)">
            <div class="set-card-header"><div><div class="set-card-name">Paldea - Gen IX</div><div style="display:flex;gap:4px;align-items:center;margin-top:2px;"><span class="badge badge-green mono-sm">#906–1025</span></div></div><span class="set-card-count">${pdPaldeaLinked}/120</span></div>
            <div class="progress-track mt-8"><div class="progress-fill green" style="width:${pdPaldeaPct}%"></div></div>
            <div class="set-card-pct">${pdPaldeaPct}%</div>
          </div>
        </div>`;
    }

    showSeries.forEach(serName => {
      const sets = seriesGroups[serName] || [];
      if (!sets.length) return;

      html += `<div class="sets-series-label">${serName}</div>
        <div class="sets-grid mb-12">`;

      sets.forEach(s => {
        const thresh = SET_THRESHOLDS[s.sigla] || {basic: s.cards.length, complete: s.cards.length};
        const typeLimit = gridType==='basic' ? thresh.basic
                        : s.cards.length;
        const scopeCards = s.cards.filter(c => parseInt(c.number,10) <= typeLimit);
        const total = scopeCards.length;
        const owned = scopeCards.filter(c=>(state.collection[c.id]?.qty||0)>0).length;
        const pct = total?Math.floor((owned/total)*100):0;
        const relDate = fmtDate(SET_RELEASE_DATES[s.sigla]);
        html += `<div class="set-card" data-open-set="${s.sigla}">
          <div class="set-card-header">
            <div>
              <div class="set-card-name">${esc(s.name)}</div>
              <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:2px;">
                <span class="badge badge-dim mono-sm">${s.sigla}</span>
                ${relDate?`<span class="mono-sm" style="color:var(--text-3)">${relDate}</span>`:''}
              </div>
            </div>
            <span class="set-card-count">${owned}/${total}</span>
          </div>
          <div class="progress-track mt-8"><div class="progress-fill green" style="width:${pct}%"></div></div>
          <div class="set-card-pct">${pct}%</div>
        </div>`;
      });
      html += `</div>`;
    });

    return html;
  }

  const s = SET_COLLECTIONS.find(x=>x.sigla===state.selectedSet);
  if (!s) return `<div class="empty-state"><p>Set não encontrado.</p></div>`;

  const thresh = SET_THRESHOLDS[s.sigla] || { basic: s.cards.length, complete: s.cards.length };
  const getCardNum = c => parseInt(c.number,10)||0;
  const typeLimit = state.setTypeFilter==='basic'?thresh.basic : s.cards.length;
  const filteredByType = s.cards.filter(c=>getCardNum(c)<=typeLimit);
  const typeOwnedCount = filteredByType.filter(c=>(state.collection[c.id]?.qty||0)>0).length;
  const typeMissingCount = filteredByType.length - typeOwnedCount;
  const typePct = filteredByType.length?Math.floor((typeOwnedCount/filteredByType.length)*100):0;

  const filtered = filteredByType.filter(c => {
    const ms = !state.setSearch || c.name.toLowerCase().includes(state.setSearch.toLowerCase());
    const has = (state.collection[c.id]?.qty||0)>0;
    const mst = state.setStatusFilter==='all'||(state.setStatusFilter==='owned'&&has)||(state.setStatusFilter==='missing'&&!has);
    return ms && mst;
  });

  const exportSetCSV = (mode) => {
    const scope = mode==='owned'?filteredByType.filter(c=>(state.collection[c.id]?.qty||0)>0)
                : mode==='missing'?filteredByType.filter(c=>(state.collection[c.id]?.qty||0)===0)
                : filteredByType;
    const csv = ['number,set,name,qty,status',...scope.map(c=>{
      const qty=state.collection[c.id]?.qty||0;
      return [c.number,c.set,'"'+c.name.replace(/"/g,'""')+'"',qty,qty>0?'possui':'faltando'].join(',');
    })].join('\n');
    const filename = s.sigla+'-'+mode+'-'+new Date().toISOString().slice(0,10)+'.csv';
    if (typeof window.AndroidExport!=='undefined') { window.AndroidExport.shareCSV(filename,csv); }
    else { const b=new Blob([csv],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u); }
    showToast(scope.length+' cartas exportadas!');
  };
  window._exportSetCSV = exportSetCSV;

  const relDate = fmtDate(SET_RELEASE_DATES[s.sigla]);
  let html = `<div class="detail-header">
    <button class="btn-back" id="btn-back-sets">${icon("back",16)} Voltar</button>
    <div class="detail-title-row">
      <span class="detail-title">${esc(s.name)}</span>
      <span class="badge badge-dim mono-sm">${s.sigla}</span>
      ${relDate?`<span class="mono-sm" style="color:var(--text-3);font-size:10px">${relDate}</span>`:''}
    </div>
    <span class="detail-count">${typeOwnedCount}/${filteredByType.length}</span>
  </div>
  <div class="type-filter-row mb-8">
    <button onclick="state.setTypeFilter='basic';render()" class="type-btn ${state.setTypeFilter==='basic'?'active-purple':''}">
      ${icon("circle",13)} Completo<br><span class="type-sub">cartas numeradas</span>
    </button>
    <button onclick="state.setTypeFilter='master';render()" class="type-btn ${state.setTypeFilter==='master'?'active-gold':''}">
      ${icon("crown",13)} Master Set<br><span class="type-sub">todas as Full Arts</span>
    </button>
  </div>
  <div class="progress-track mb-8"><div class="progress-fill green glow" style="width:${typePct}%"></div></div>
  <div class="status-filter-row mb-12">
    <button onclick="state.setStatusFilter='all';render()" class="status-btn ${state.setStatusFilter==='all'?'active':''}">Todas (${filteredByType.length})</button>
    <button onclick="state.setStatusFilter='owned';render()" class="status-btn green ${state.setStatusFilter==='owned'?'active':''}">${icon("check",11)} Possui (${typeOwnedCount})</button>
    <button onclick="state.setStatusFilter='missing';render()" class="status-btn red ${state.setStatusFilter==='missing'?'active':''}">${icon("x",11)} Falta (${typeMissingCount})</button>
  </div>
  <div class="export-row mb-12">
    <button onclick="window._exportSetCSV('all')" class="btn-pill btn-ghost btn-xs">${icon("upload",13)} Todas</button>
    <button onclick="window._exportSetCSV('owned')" class="btn-pill btn-ghost btn-xs green-txt">${icon("upload",13)} Possui</button>
    <button onclick="window._exportSetCSV('missing')" class="btn-pill btn-ghost btn-xs red-txt">${icon("upload",13)} Faltantes</button>
  </div>
  <input class="inp inp-search mb-12" id="set-search" placeholder="Buscar carta no set..." value="${esc(state.setSearch)}" oninput="state.setSearch=this.value;render()">
  <div class="set-card-list">`;

  filtered.forEach(card => {
    const qty = state.collection[card.id]?.qty||0;
    html += `<div class="set-row ${qty>0?'owned':''}">
      <div class="set-row-check">
        <div class="checkbox ${qty>0?'checked':''}">${qty>0?icon('check',13):''}</div>
      </div>
      <div class="set-row-info">
        <span class="set-row-name ${qty>0?'owned-text':''}">${esc(card.name)}</span>
        <span class="set-row-code mono-sm">
          ${card.set} #${card.number}
          <span onclick="openCardPage('${card.set.replace(/[^A-Za-z0-9]/g,"")}','${parseInt(card.number,10)||card.number}')" class="ver-link">${icon("external",12)}</span>
        </span>
      </div>
      <div class="counter-group">
        <button class="counter-btn" ${qty<=0?'disabled':''} data-set-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="-1">−</button>
        <span class="counter-val ${qty>0?'active':''}">${qty}</span>
        <button class="counter-btn" data-set-card="${encodeURIComponent(JSON.stringify(card))}" data-delta="1">+</button>
      </div>
    </div>`;
  });
  if (!filtered.length) html += `<div class="empty-state compact"><p>Nenhuma carta encontrada.</p></div>`;
  html += `</div>`;
  return html;
}
