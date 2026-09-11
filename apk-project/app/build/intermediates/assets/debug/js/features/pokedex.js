// Feature: Pokédex.
// Lógica e renderização do Pokédex. Dados das gerações permanecem no index nesta etapa.

function buildPokedexModal() {
  if (state.pokedexModal !== null) {
    const pk = POKEDEX_151.find(p=>p.no===state.pokedexModal);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, state.pokedex151[pk.no]||null, 'linkPokedexSlot', 'unlinkPokedexSlot', 'Gen I');
  }
  if (state.pokedexModalG2 !== null && state.pokedexModalG2 !== undefined) {
    const pk = POKEDEX_JOHTO.find(p=>p.no===state.pokedexModalG2);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexJohto||{})[pk.no]||null, 'linkPokedexSlotG2', 'unlinkPokedexSlotG2', 'Gen II');
  }
  if (state.pokedexModalG3 !== null && state.pokedexModalG3 !== undefined) {
    const pk = POKEDEX_HOENN.find(p=>p.no===state.pokedexModalG3);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexHoenn||{})[pk.no]||null, 'linkPokedexSlotG3', 'unlinkPokedexSlotG3', 'Gen III');
  }
  if (state.pokedexModalG4 !== null && state.pokedexModalG4 !== undefined) {
    const pk = POKEDEX_SINNOH.find(p=>p.no===state.pokedexModalG4);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexSinnoh||{})[pk.no]||null, 'linkPokedexSlotG4', 'unlinkPokedexSlotG4', 'Gen IV');
  }
  if (state.pokedexModalG5 !== null && state.pokedexModalG5 !== undefined) {
    const pk = POKEDEX_UNOVA.find(p=>p.no===state.pokedexModalG5);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexUnova||{})[pk.no]||null, 'linkPokedexSlotG5', 'unlinkPokedexSlotG5', 'Gen V');
  }
  if (state.pokedexModalG6 !== null && state.pokedexModalG6 !== undefined) {
    const pk = POKEDEX_KALOS.find(p=>p.no===state.pokedexModalG6);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexKalos||{})[pk.no]||null, 'linkPokedexSlotG6', 'unlinkPokedexSlotG6', 'Gen VI');
  }
  if (state.pokedexModalG7 !== null && state.pokedexModalG7 !== undefined) {
    const pk = POKEDEX_ALOLA.find(p=>p.no===state.pokedexModalG7);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexAlola||{})[pk.no]||null, 'linkPokedexSlotG7', 'unlinkPokedexSlotG7', 'Gen VII');
  }
  if (state.pokedexModalG8 !== null && state.pokedexModalG8 !== undefined) {
    const pk = POKEDEX_GALAR.find(p=>p.no===state.pokedexModalG8);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexGalar||{})[pk.no]||null, 'linkPokedexSlotG8', 'unlinkPokedexSlotG8', 'Gen VIII');
  }
  if (state.pokedexModalG9 !== null && state.pokedexModalG9 !== undefined) {
    const pk = POKEDEX_PALDEA.find(p=>p.no===state.pokedexModalG9);
    if (!pk) return '';
    return _buildPokedexModalInner(pk, (state.pokedexPaldea||{})[pk.no]||null, 'linkPokedexSlotG9', 'unlinkPokedexSlotG9', 'Gen IX');
  }
  return '';
}

function openPokedexSlot(no) {
  const pk = POKEDEX_151.find(p => p.no === no);
  state.pokedexModal = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function closePokedexModal() {
  state.pokedexModal = null;
  state.pokedexModalG2 = null;
  state.pokedexModalG3 = null;
  state.pokedexModalG4 = null;
  state.pokedexModalG5 = null;
  state.pokedexModalG6 = null;
  state.pokedexModalG7 = null;
  state.pokedexModalG8 = null;
  state.pokedexModalG9 = null;
  state.pokedexModalSearch = '';
  render();
}

function openPokedexSlotG2(no) {
  const pk = POKEDEX_JOHTO.find(p => p.no === no);
  state.pokedexModalG2 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG2(no, cardId) {
  if (!state.pokedexJohto) state.pokedexJohto = {};
  state.pokedexJohto[no] = cardId;
  state.pokedexModalG2 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG2(no) {
  if (state.pokedexJohto) delete state.pokedexJohto[no];
  state.pokedexModalG2 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG3(no) {
  const pk = POKEDEX_HOENN.find(p => p.no === no);
  state.pokedexModalG3 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG3(no, cardId) {
  if (!state.pokedexHoenn) state.pokedexHoenn = {};
  state.pokedexHoenn[no] = cardId;
  state.pokedexModalG3 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG3(no) {
  if (state.pokedexHoenn) delete state.pokedexHoenn[no];
  state.pokedexModalG3 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG4(no) {
  const pk = POKEDEX_SINNOH.find(p => p.no === no);
  state.pokedexModalG4 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG4(no, cardId) {
  if (!state.pokedexSinnoh) state.pokedexSinnoh = {};
  state.pokedexSinnoh[no] = cardId;
  state.pokedexModalG4 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG4(no) {
  if (state.pokedexSinnoh) delete state.pokedexSinnoh[no];
  state.pokedexModalG4 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG5(no) {
  const pk = POKEDEX_UNOVA.find(p => p.no === no);
  state.pokedexModalG5 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG5(no, cardId) {
  if (!state.pokedexUnova) state.pokedexUnova = {};
  state.pokedexUnova[no] = cardId;
  state.pokedexModalG5 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG5(no) {
  if (state.pokedexUnova) delete state.pokedexUnova[no];
  state.pokedexModalG5 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG6(no) {
  const pk = POKEDEX_KALOS.find(p => p.no === no);
  state.pokedexModalG6 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG6(no, cardId) {
  if (!state.pokedexKalos) state.pokedexKalos = {};
  state.pokedexKalos[no] = cardId;
  state.pokedexModalG6 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG6(no) {
  if (state.pokedexKalos) delete state.pokedexKalos[no];
  state.pokedexModalG6 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG7(no) {
  const pk = POKEDEX_ALOLA.find(p => p.no === no);
  state.pokedexModalG7 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG7(no, cardId) {
  if (!state.pokedexAlola) state.pokedexAlola = {};
  state.pokedexAlola[no] = cardId;
  state.pokedexModalG7 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG7(no) {
  if (state.pokedexAlola) delete state.pokedexAlola[no];
  state.pokedexModalG7 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG8(no) {
  const pk = POKEDEX_GALAR.find(p => p.no === no);
  state.pokedexModalG8 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG8(no, cardId) {
  if (!state.pokedexGalar) state.pokedexGalar = {};
  state.pokedexGalar[no] = cardId;
  state.pokedexModalG8 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG8(no) {
  if (state.pokedexGalar) delete state.pokedexGalar[no];
  state.pokedexModalG8 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function openPokedexSlotG9(no) {
  const pk = POKEDEX_PALDEA.find(p => p.no === no);
  state.pokedexModalG9 = no;
  state.pokedexModalSearch = pk ? pk.search : '';
  render();
}

function linkPokedexSlotG9(no, cardId) {
  if (!state.pokedexPaldea) state.pokedexPaldea = {};
  state.pokedexPaldea[no] = cardId;
  state.pokedexModalG9 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function unlinkPokedexSlotG9(no) {
  if (state.pokedexPaldea) delete state.pokedexPaldea[no];
  state.pokedexModalG9 = null;
  state.pokedexModalSearch = '';
  saveStorage(); render();
}

function findPokedexSlotForCard(card) {
  if (!card || !card.name) return null;
  const nameLower = card.name.toLowerCase();
  for (const pk of POKEDEX_151) {
    const searchLower = pk.search.toLowerCase();
    if (nameLower.includes(searchLower) || searchLower.includes(nameLower)) return pk.no;
  }
  return null;
}

function syncPokedexToCollection(cardId) {
  if (!cardId || cardId.startsWith('MANUAL_')) return;
  for (const s of SET_COLLECTIONS) {
    const found = s.cards.find(c=>c.id===cardId);
    if (found) {
      if (!state.collection[cardId] || state.collection[cardId].qty < 1)
        state.collection[cardId] = { ...found, qty: 1 };
      return;
    }
  }
}

function syncCollectionToPokedex(card) {
  // Pokédex is manual-only — user clicks to link cards
  // This function is intentionally a no-op
}

function linkPokedexSlot(no, cardId) {
  state.pokedex151[no] = cardId;
  state.pokedexModal = null;
  state.pokedexModalSearch = '';
  syncPokedexToCollection(cardId);
  saveStorage();
  render();
}

function unlinkPokedexSlot(no) {
  delete state.pokedex151[no];
  state.pokedexModal = null;
  state.pokedexModalSearch = '';
  saveStorage();
  render();
}

function autoLinkGen1FromMEW() { /* manual only - user links via UI */ }

function autoLinkGen2FromJohto() { /* manual only - user links via UI */ }

function buildPokedexSlotHTML(pk, cardId, gen) {
  const done = !!cardId;
  const isManual = cardId?.startsWith('MANUAL_');
  let linkedName = '';
  if (cardId && !isManual) {
    for (const s of SET_COLLECTIONS) {
      const f = s.cards.find(c=>c.id===cardId);
      if (f) { linkedName = f.name; break; }
    }
  } else if (isManual) { linkedName = 'Manual'; }
  const onClick = gen === 1 ? `openPokedexSlot(${pk.no})`
                : gen === 2 ? `openPokedexSlotG2(${pk.no})`
                : gen === 3 ? `openPokedexSlotG3(${pk.no})`
                : gen === 4 ? `openPokedexSlotG4(${pk.no})`
                : gen === 5 ? `openPokedexSlotG5(${pk.no})`
                : gen === 6 ? `openPokedexSlotG6(${pk.no})`
                : gen === 7 ? `openPokedexSlotG7(${pk.no})`
                : gen === 8 ? `openPokedexSlotG8(${pk.no})`
                :             `openPokedexSlotG9(${pk.no})`;
  return `<div class="pokedex-slot ${done?(isManual?'manual':'done'):''}" onclick="${onClick}">
    <div class="pdex-check"><div class="checkbox sm ${done?'checked':''} ${isManual?'amber':''}">${done?icon('check',11):''}</div></div>
    <div class="pdex-info">
      <span class="pdex-no">#${String(pk.no).padStart(3,'0')}</span>
      <span class="pdex-name">${pk.name}</span>
      ${linkedName?`<span class="pdex-linked">${linkedName}</span>`:''}
    </div>
  </div>`;
}

// Verifica se o usuário POSSUI (na Coleção Global, qty > 0) alguma carta
// cujo nome corresponda a este Pokémon — usado para identificar slots vazios
// da Pokédex que já têm uma carta candidata na coleção real do usuário.

function pokedexHasCandidate(pk) {
  const sl = pk.search.toLowerCase();
  for (const id in state.collection) {
    const card = state.collection[id];
    if ((card.qty || 0) > 0 && card.name && card.name.toLowerCase().includes(sl)) return true;
  }
  return false;
}

// Verifica se o slot está possuído na Pokédex: basta ter qualquer vínculo (manual ou carta real).
// Deve ser consistente com buildPokedexSlotHTML que usa !!cardId para exibir checkmark verde.

function pokedexSlotOwned(cardId) {
  return !!cardId;
}

function buildPokedexView() {
  const gen = state.pokedexGen || 1;

  if (!state.pokedexJohto) state.pokedexJohto = {};
  if (!state.pokedexHoenn) state.pokedexHoenn = {};

  const linked1 = Object.keys(state.pokedex151).length;
  const linked2 = Object.keys(state.pokedexJohto).length;
  const linked3 = Object.keys(state.pokedexHoenn).length;

  if (!state.pokedexSinnoh) state.pokedexSinnoh = {};
  if (!state.pokedexUnova)  state.pokedexUnova  = {};
  if (!state.pokedexKalos)  state.pokedexKalos  = {};
  if (!state.pokedexAlola)  state.pokedexAlola  = {};
  if (!state.pokedexGalar)  state.pokedexGalar  = {};
  if (!state.pokedexPaldea) state.pokedexPaldea = {};
  const linked4 = Object.keys(state.pokedexSinnoh).length;
  const linked5 = Object.keys(state.pokedexUnova).length;
  const linked6 = Object.keys(state.pokedexKalos).length;
  const linked7 = Object.keys(state.pokedexAlola).length;
  const linked8 = Object.keys(state.pokedexGalar).length;
  const linked9 = Object.keys(state.pokedexPaldea).length;
  const configs = {
    1: { list: POKEDEX_151,    st: state.pokedex151,    linked: linked1, total: 151, color: 'red',    label: 'Kanto — Gen I'    },
    2: { list: POKEDEX_JOHTO,  st: state.pokedexJohto,  linked: linked2, total: 100, color: 'gold',   label: 'Johto — Gen II'   },
    3: { list: POKEDEX_HOENN,  st: state.pokedexHoenn,  linked: linked3, total: 135, color: 'blue',   label: 'Hoenn — Gen III'  },
    4: { list: POKEDEX_SINNOH, st: state.pokedexSinnoh, linked: linked4, total: 107, color: 'green',  label: 'Sinnoh — Gen IV'  },
    5: { list: POKEDEX_UNOVA,  st: state.pokedexUnova,  linked: linked5, total: 156, color: 'purple', label: 'Unova — Gen V'    },
    6: { list: POKEDEX_KALOS,  st: state.pokedexKalos,  linked: linked6, total: 72,  color: 'blue',   label: 'Kalos — Gen VI'    },
    7: { list: POKEDEX_ALOLA,  st: state.pokedexAlola,  linked: linked7, total: 88,  color: 'gold',   label: 'Alola — Gen VII'   },
    8: { list: POKEDEX_GALAR,  st: state.pokedexGalar,  linked: linked8, total: 96,  color: 'red',    label: 'Galar — Gen VIII'  },
    9: { list: POKEDEX_PALDEA, st: state.pokedexPaldea, linked: linked9, total: 120, color: 'green',  label: 'Paldea — Gen IX'   },
  };
  const cfg = configs[gen];

  let html = `<div class="detail-header">
    <button class="btn-back" id="btn-back-sets">${icon("back",16)} Voltar</button>
    <div class="detail-title-row">
      <span class="detail-title">Pokédex</span>
      <span class="badge ${gen===1?'badge-red':gen===2?'badge-amber':gen===3?'badge-blue':gen===4?'badge-green':gen===5?'badge-purple':gen===6?'badge-blue':gen===7?'badge-amber':gen===8?'badge-red':'badge-green'}">${cfg.label}</span>
    </div>
    <span class="detail-count">${cfg.linked}/${cfg.total}</span>
  </div>

  <div class="sub-tabs mb-12" style="flex-wrap:wrap">
    <button class="sub-tab ${gen===1?'active':''}" onclick="state.pokedexGen=1;render()">Kanto 151</button>
    <button class="sub-tab ${gen===2?'active':''}" onclick="state.pokedexGen=2;render()">Johto 100</button>
    <button class="sub-tab ${gen===3?'active':''}" onclick="state.pokedexGen=3;render()">Hoenn 135</button>
    <button class="sub-tab ${gen===4?'active':''}" onclick="state.pokedexGen=4;render()">Sinnoh 107</button>
    <button class="sub-tab ${gen===5?'active':''}" onclick="state.pokedexGen=5;render()">Unova 156</button>
    <button class="sub-tab ${gen===6?'active':''}" onclick="state.pokedexGen=6;render()">Kalos 72</button>
    <button class="sub-tab ${gen===7?'active':''}" onclick="state.pokedexGen=7;render()">Alola 88</button>
    <button class="sub-tab ${gen===8?'active':''}" onclick="state.pokedexGen=8;render()">Galar 96</button>
    <button class="sub-tab ${gen===9?'active':''}" onclick="state.pokedexGen=9;render()">Paldea 120</button>
  </div>

  <div class="progress-row mb-8">
    <div class="progress-track" style="flex:1">
      <div class="progress-fill ${cfg.color} glow" style="width:${Math.floor(cfg.linked/cfg.total*100)}%"></div>
    </div>
    <span class="progress-pct">${cfg.linked}/${cfg.total}</span>
  </div>`;

  // Classifica cada slot: possui / falta / disponível em coleções (mas não vinculado)
  let ownedCount = 0, missingCount = 0, availableCount = 0;
  const classified = cfg.list.map(pk => {
    const cardId = cfg.st[pk.no];
    const owned = pokedexSlotOwned(cardId);
    const hasCandidate = !owned && pokedexHasCandidate(pk);
    if (owned) ownedCount++;
    else if (hasCandidate) availableCount++;
    else missingCount++;
    return { pk, owned, hasCandidate };
  });

  const filtered = classified.filter(({owned, hasCandidate}) => {
    if (state.pokedexStatusFilter === 'owned')     return owned;
    if (state.pokedexStatusFilter === 'missing')   return !owned;
    if (state.pokedexStatusFilter === 'available') return !owned && hasCandidate;
    return true; // 'all'
  });

  html += `<div class="status-filter-row mb-12">
    <button onclick="state.pokedexStatusFilter='all';render()" class="status-btn ${state.pokedexStatusFilter==='all'?'active':''}">Todas (${cfg.list.length})</button>
    <button onclick="state.pokedexStatusFilter='owned';render()" class="status-btn green ${state.pokedexStatusFilter==='owned'?'active':''}">${icon('check',11)} Possui (${ownedCount})</button>
    <button onclick="state.pokedexStatusFilter='missing';render()" class="status-btn red ${state.pokedexStatusFilter==='missing'?'active':''}">${icon('x',11)} Falta (${missingCount})</button>
  </div>
  <div class="status-filter-row mb-12">
    <button onclick="state.pokedexStatusFilter='available';render()" class="status-btn ${state.pokedexStatusFilter==='available'?'active':''}" style="flex:1" title="Não vinculado na Pokédex, mas existe carta cadastrada em alguma coleção">${icon('link',11)} Tem em coleções, falta na Pokédex (${availableCount})</button>
  </div>

  <div class="pokedex-grid">`;

  filtered.forEach(({pk}) => {
    html += buildPokedexSlotHTML(pk, cfg.st[pk.no], gen);
  });

  if (!filtered.length) html += `<div class="empty-state compact"><p>Nenhum Pokémon encontrado com esse filtro.</p></div>`;

  html += `</div>`;
  return html;
}

function _buildPokedexModalInner(pk, linkedId, linkFn, unlinkFn, genLabel) {
  const search = state.pokedexModalSearch || pk.search;
  const matches = [];
  for (const s of SET_COLLECTIONS) {
    for (const card of s.cards) {
      if (card.name.toLowerCase().includes(search.toLowerCase())) {
        matches.push({...card, setName: s.name});
      }
    }
  }
  return `<div class="modal-overlay" id="pokedex-modal-overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div>
          <span class="modal-title">#${String(pk.no).padStart(3,'0')} ${pk.name}</span>
          ${genLabel!=='Gen I'?`<span class="badge ${genLabel==='Gen II'?'badge-amber':genLabel==='Gen III'?'badge-blue':genLabel==='Gen IV'?'badge-green':'badge-purple'} ml-6">${genLabel}</span>`:''}
        </div>
        <div class="modal-actions">
          ${linkedId?`<button onclick="${unlinkFn}(${pk.no})" class="btn-pill btn-danger btn-xs">${icon("x",12)} Desvincular</button>`:''}
          <button onclick="closePokedexModal()" class="btn-pill btn-ghost btn-xs">Fechar</button>
        </div>
      </div>
      <div class="modal-search">
        <input class="inp inp-search" id="pokedex-modal-search" value="${esc(search)}" placeholder="Buscar carta..." oninput="state.pokedexModalSearch=this.value;render()">
        <span class="count-label mt-6">${matches.length} carta${matches.length!==1?'s':''}</span>
      </div>
      <div class="modal-list">
        ${matches.length===0
          ? `<div class="empty-state compact">
              <p class="mb-8" style="color:var(--text-2);font-size:13px">Nenhuma carta encontrada nos sets do app.</p>
            </div>`
          : matches.map(card => {
              const isLinked = card.id===linkedId;
              const inColl = (state.collection[card.id]?.qty||0)>0;
              return `<div onclick="${linkFn}(${pk.no},'${card.id}')" class="modal-card ${isLinked?'linked':''}">
                <div class="checkbox sm ${isLinked?'checked':''}">${isLinked?icon('check',11):''}</div>
                <div class="modal-card-info">
                  <span class="modal-card-name">${esc(card.name)}</span>
                  <span class="mono-sm text-muted">${card.set} #${card.number}</span>
                </div>
                ${inColl?'<span class="badge badge-blue">Na coleção</span>':''}
              </div>`;
            }).join('')
        }
        <div style="padding:12px 0 4px;border-top:1px solid var(--border);margin-top:8px;">
          <button onclick="${linkFn}(${pk.no},'MANUAL_${pk.no}')" class="btn-pill btn-amber w-full" style="justify-content:center">
            ${icon("edit",13)} Marcar como possuído manualmente
          </button>
          ${linkedId && linkedId.startsWith('MANUAL_')
            ? `<p style="text-align:center;font-size:11px;color:var(--gold);margin-top:6px">${icon("check",11)} Já marcado manualmente</p>`
            : ''}
        </div>
      </div>
    </div>
  </div>`;
}
