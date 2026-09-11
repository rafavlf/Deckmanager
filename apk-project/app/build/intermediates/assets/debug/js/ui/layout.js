// UI compartilhada: tema, feedback, ícones, layout e renderização principal.

function initTheme() {
  const saved = localStorage.getItem('ptcg_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('ptcg_theme', next);
  render();
}

function showToast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = (type==='success'?'✓ ':'✗ ') + msg;
  el.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}

function openCardPage(set, number) {
  // Strip any stray leading non-alphanumeric chars from both params
  const cleanSet = String(set).replace(/^[^A-Za-z0-9]+/, '');
  const cleanNum = String(number).replace(/^[^0-9]+/, '');
  const num = parseInt(cleanNum, 10) || cleanNum;
  const url = 'https://limitlesstcg.com/cards/pt/' + cleanSet + '/' + num;
  if (window.AndroidBrowser) {
    window.AndroidBrowser.open(url);
  } else {
    window.open(url, '_blank');
  }
}

function fallbackCopy(txt, name) {
  const el = document.createElement('textarea');
  el.value = txt; el.style.position='fixed'; el.style.opacity='0';
  document.body.appendChild(el); el.focus(); el.select();
  try { document.execCommand('copy'); showToast(`Deck "${name}" copiado!`); }
  catch { showToast('Erro ao copiar.','error'); }
  document.body.removeChild(el);
}

function fallbackCopyText(text) {
  const el = document.createElement('textarea');
  el.value = text; el.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(el); el.focus(); el.select();
  try { document.execCommand('copy'); showToast('Copiado!'); }
  catch { showToast('Erro ao copiar.','error'); }
  document.body.removeChild(el);
}

function pngIcon(name, size=24) {
  if (!window.feather || !PNG_ICONS[name]) {
    return `<span style="display:inline-block;width:${size}px;height:${size}px;background:#e5e7eb;border-radius:4px;"></span>`;
  }
  const featherName = PNG_ICONS[name];
  const svg = feather.icons[featherName].toSvg({
    width: size,
    height: size,
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none'
  });
  return svg;
}

function icon(name, size=18, extra='') {
  const icons = {
    zap:         '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    cards:       '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    swords:      '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><polyline points="9.5 6.5 5 2 2 5 6.5 9.5"/><line x1="3" y1="21" x2="9" y2="15"/>',
    plus:        '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    trash:       '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>',
    copy:        '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    back:        '<polyline points="15 18 9 12 15 6"/>',
    search:      '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    eye:         '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off':   '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    check:       '<polyline points="20 6 9 17 4 12"/>',
    'check-sq':  '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    x:           '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    refresh:     '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    upload:      '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    download:    '<polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>',
    edit:        '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    external:    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    list:        '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    sun:         '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon:        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    circle:      '<circle cx="12" cy="12" r="10"/>',
    diamond:     '<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0L2.7 10.3z"/>',
    crown:       '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><line x1="5" y1="20" x2="19" y2="20"/>',
    archive:     '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  };
  const paths = icons[name] || icons['circle'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0" ${extra}>${paths}</svg>`;
}

function render() {
  const activeId    = document.activeElement?.id || null;
  const activeStart = document.activeElement?.selectionStart ?? null;
  const activeEnd   = document.activeElement?.selectionEnd   ?? null;
  document.getElementById('app').innerHTML = buildApp();
  attachEvents();
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      if (activeStart !== null && el.setSelectionRange) {
        try { el.setSelectionRange(activeStart, activeEnd); } catch(e) {}
      }
    }
  }
}

function buildApp() {
  return `${buildHeader()}<main id="main-content">${buildMain()}</main>${buildBottomNav()}${buildPokedexModal()}${buildDeckEditorModal()}`;
}

function buildHeader() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  return `<header class="app-header">
    <div class="header-inner">
      <div class="header-logo">
        <span class="logo-bolt">${icon("zap",16)}</span>
        <span class="logo-text">PTCG<span class="logo-accent">Collector</span></span>
      </div>
      <nav class="header-nav">
        ${[['decks','Decks','cards'],['league','Sets','layers'],['collection','Coleção','archive'],['dashboard','Início','home']].map(([id,label,ic]) =>
          `<button class="hnav-btn ${state.tab===id?'active':''}" data-nav="${id}">${['decks','league','collection','dashboard'].includes(id)?pngIcon({decks:'decks',league:'sets',collection:'collection',dashboard:'shopping'}[id],18)+' ':icon(ic,15)+' '}${label}</button>`
        ).join('')}
      </nav>
      <button class="theme-toggle" onclick="toggleTheme()" title="Alternar tema">
        ${isDark ? icon('sun',17) : icon('moon',17)}
      </button>
    </div>
  </header>`;
}

function buildBottomNav() {
  const pngNavIcons = { decks:'decks', league:'sets', collection:'collection', dashboard:'shopping' };
  const tabs = [
    { id:'decks',      label:'DECKS'   },
    { id:'league',     label:'SETS'    },
    { id:'collection', label:'COLEÇÃO'  },
    { id:'dashboard',  label:'INÍCIO'   },
  ];
  return `<nav class="bottom-nav">
    ${tabs.map(t => `
      <button class="bnav-btn ${state.tab===t.id?'active':''}" data-nav="${t.id}">
        <span class="bnav-icon">${pngIcon(pngNavIcons[t.id],26)}</span>
        <span class="bnav-label">${t.label}</span>
      </button>`).join('')}
  </nav>`;
}

function buildMain() {
  const deck = selectedDeck();
  if (deck) return buildDeckDetail(deck);
  if (state.tab === 'decks')      return buildDecksTab();
  if (state.tab === 'league')     return buildLeagueTab();
  if (state.tab === 'collection') return buildCollectionTab();
  if (state.tab === 'dashboard')  return buildDashboardTab();
  return '';
}
