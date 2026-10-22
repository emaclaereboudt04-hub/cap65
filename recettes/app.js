'use strict';
/* =========================================================
   Mon carnet de recettes : application
   Données 100 % locales (IndexedDB), aucune recette importée.
   ========================================================= */

const APP_VERSION = '1.0';

/* ---------------- Stockage ---------------- */
const DB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const rq = indexedDB.open('carnet-recettes', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('recipes', { keyPath: 'id' });
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  }));
  const tx = (mode, fn) => open().then((db) => new Promise((res, rej) => {
    const t = db.transaction('recipes', mode);
    const rq = fn(t.objectStore('recipes'));
    t.oncomplete = () => res(rq ? rq.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  }));
  return {
    all: () => tx('readonly', (s) => s.getAll()),
    put: (r) => tx('readwrite', (s) => s.put(r)),
    del: (id) => tx('readwrite', (s) => s.delete(id)),
  };
})();

const PREFS_KEY = 'carnet-recettes-prefs';
const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (e) { return {}; } })();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* rien */ } };
CARD.setSignature(prefs.signature ?? 'Mon carnet de recettes');

let recipes = [];

/* ---------------- Outils ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const norm = STICKERS.norm;
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'recette';
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  sticker: '<svg viewBox="0 0 24 24"><path d="M20 12.5V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h5.5z"/><path d="M20 12.5c-4 0-7.5 3.5-7.5 7.5"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/><path d="M9 14.5c1.2 1 2.5 1 3.5.4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 11H5v9h14v-9h-1"/></svg>',
  cook: '<svg viewBox="0 0 24 24"><path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-3z"/><path d="M2 11h20M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
  rotl: '<svg viewBox="0 0 24 24"><path d="M5 9a8 8 0 1 1 1 7"/><path d="M4 4v5h5"/></svg>',
  rotr: '<svg viewBox="0 0 24 24"><path d="M19 9a8 8 0 1 0-1 7"/><path d="M20 4v5h-5"/></svg>',
  flip: '<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M8 7L3 17h5zM16 7l5 10h-5z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  front: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  up: '<svg viewBox="0 0 24 24"><path d="M6 14l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24"><path d="M6 10l6 6 6-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>',
};

const CATEGORIES = ['Pâtisserie', 'Dessert', 'Gâteau', 'Biscuits', 'Viennoiserie', 'Petit-déj', 'Entrée', 'Plat', 'Accompagnement', 'Soupe', 'Salade', 'Apéro', 'Boisson', 'Sauce', 'Autre'];
const UNITS = ['', 'g', 'kg', 'mg', 'ml', 'cl', 'dl', 'L', 'c. à s.', 'c. à c.', 'pincée', 'sachet', 'tasse', 'verre', 'tranche', 'gousse', 'botte', 'brin', 'feuille', 'pot', 'boîte', 'noix', 'filet'];

const totalTime = (r) => (+r.prep || 0) + (+r.cook || 0);

/* ---------------- Toast / feuille modale ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastT); toastT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 250); }, 2200);
}

let sheetClose = null;
function openSheet(html, { full = false, onClose = null } = {}) {
  const sh = $('#sheet'); const bd = $('#sheet-backdrop');
  sh.innerHTML = `<div class="sheet-grip"></div>${html}`;
  sh.classList.toggle('full', full);
  sh.hidden = false; bd.hidden = false;
  requestAnimationFrame(() => { sh.classList.add('open'); bd.classList.add('open'); });
  sheetClose = onClose;
  return sh;
}
function closeSheet() {
  const sh = $('#sheet'); const bd = $('#sheet-backdrop');
  if (sh.hidden) return;
  sh.classList.remove('open'); bd.classList.remove('open');
  const cb = sheetClose; sheetClose = null;
  setTimeout(() => { sh.hidden = true; bd.hidden = true; sh.innerHTML = ''; }, 260);
  if (cb) cb();
}

/* ---------------- Routeur ---------------- */
const screen = () => $('#screen');
let leaveGuard = null;   // fonction qui renvoie true si on peut quitter l'écran

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [view, id] = h.split('/');
  closeSheet();
  stopDeco(false);
  window.scrollTo(0, 0);
  if (view === 'r' && id) return viewRecipe(id);
  if (view === 'edit' && id) return viewEdit(id);
  if (view === 'new') return viewEdit(null);
  return viewHome();
}
function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

window.addEventListener('hashchange', (e) => {
  if (leaveGuard && !leaveGuard()) {
    // on reste sur l'écran (annule la navigation)
    const back = new URL(e.oldURL).hash;
    history.replaceState(null, '', back);
    return;
  }
  leaveGuard = null;
  route();
});

/* =========================================================
   Accueil
   ========================================================= */
const homeState = { q: '', cat: 'Tout' };

function stickerHTML(id) { return STICKERS.svg(id); }

function viewHome() {
  const cats = ['Tout', '♥ Favoris', ...CATEGORIES.filter((c) => recipes.some((r) => r.category === c))];
  if (!cats.includes(homeState.cat)) homeState.cat = 'Tout';
  screen().innerHTML = `
    <header class="hero">
      <span class="hero-stk s1">${stickerHTML('fouet')}</span>
      <span class="hero-stk s2">${stickerHTML('cupcake')}</span>
      <span class="hero-stk s3">${stickerHTML('fraise')}</span>
      <button class="icon-btn hero-gear" id="btn-settings" aria-label="Réglages">${ICON.gear}</button>
      <p class="hero-small">Mon carnet de</p>
      <h1 class="hero-title">Recettes</h1>
      <p class="hero-count">${recipes.length ? `${recipes.length} recette${recipes.length > 1 ? 's' : ''} rien qu'à moi` : 'Rien qu\'à moi'}</p>
    </header>
    ${recipes.length ? `
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Une recette, un ingrédient…" value="${esc(homeState.q)}" autocomplete="off"></label>
    <div class="chips" id="cats">${cats.map((c) => `<button class="chip ${c === homeState.cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="grid" id="grid"></div>` : `
    <div class="empty">
      <div class="empty-stk">${stickerHTML('livre')}</div>
      <h2>Ton carnet est tout neuf</h2>
      <p>Ajoute ta première recette : ingrédients, étapes, photo… puis décore la fiche avec des autocollants.</p>
    </div>`}
    <div class="fab-wrap"><a class="fab" href="#/new">${ICON.plus}<span>Nouvelle recette</span></a></div>`;

  $('#btn-settings').onclick = openSettings;
  if (!recipes.length) return;
  const q = $('#q');
  q.oninput = () => { homeState.q = q.value; renderGrid(); };
  $('#cats').onclick = (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    homeState.cat = b.dataset.cat;
    $$('.chip', $('#cats')).forEach((x) => x.classList.toggle('on', x === b));
    renderGrid();
  };
  renderGrid();
}

function renderGrid() {
  const g = $('#grid'); if (!g) return;
  const q = norm(homeState.q).trim();
  let list = recipes.slice();
  if (homeState.cat === '♥ Favoris') list = list.filter((r) => r.fav);
  else if (homeState.cat !== 'Tout') list = list.filter((r) => r.category === homeState.cat);
  if (q) {
    list = list.filter((r) => norm([r.title, r.subtitle, r.category, r.notes, ...(r.ingredients || []).map((i) => i.n || i.sec)].join(' ')).includes(q));
  }
  list.sort((a, b) => (b.fav - a.fav) || (b.updated || 0) - (a.updated || 0));
  if (!list.length) { g.innerHTML = `<p class="grid-empty">Aucune recette ne correspond.</p>`; return; }
  g.innerHTML = list.map((r) => {
    const T = CARD.THEMES[r.theme] || CARD.THEMES.creme;
    const stk = (r.stickers || []).find((s) => !STICKERS.byId[s.id]?.noCut && STICKERS.byId[s.id]?.cat !== 'etiquettes') || null;
    const main = stk ? stk.id : (STICKERS.suggest(r.title)[0] || 'livre');
    const t = totalTime(r);
    return `<a class="rcard" href="#/r/${r.id}" style="--tbg:${T.bg};--tac:${T.accent}">
      <div class="thumb">${r.photo ? `<img src="${r.photo}" alt="" loading="lazy">` : `<span class="thumb-stk">${stickerHTML(main)}</span>`}</div>
      ${r.photo && stk ? `<span class="mini-stk">${stickerHTML(stk.id)}</span>` : ''}
      ${r.fav ? `<span class="fav-dot">${ICON.heart}</span>` : ''}
      <div class="rbody"><h3>${esc(r.title || 'Sans titre')}</h3>
      <p>${t ? `${ICON.clock}${CARD.fmtMin(t)}` : ''}${t && r.category ? ' · ' : ''}${esc(r.category || '')}</p></div>
    </a>`;
  }).join('');
}

/* =========================================================
   Fiche recette (affichage + décoration)
   ========================================================= */
const ficheCache = new Map(); // id -> { key, url, height }
let cur = null;               // recette affichée
let deco = null;              // état du mode décoration

function ficheKey(r) { return `${r.updated}|${r.theme}|${prefs.signature ?? ''}|${r.id}`; }

async function getFiche(r) {
  const key = ficheKey(r);
  const c = ficheCache.get(r.id);
  if (c && c.key === key) return c;
  const out = await CARD.render(r, { scale: Math.min(2, Math.max(1, (window.devicePixelRatio || 1) * 420 / 1080)) });
  const blob = await new Promise((res) => out.canvas.toBlob(res, 'image/png'));
  if (c) URL.revokeObjectURL(c.url);
  const v = { key, url: URL.createObjectURL(blob), height: out.height, anchors: out.anchors };
  ficheCache.set(r.id, v);
  return v;
}

async function viewRecipe(id) {
  const r = recipes.find((x) => x.id === id);
  if (!r) { go('#/'); return; }
  cur = r;
  screen().innerHTML = `
    <div class="topbar">
      <a class="icon-btn" href="#/" aria-label="Retour">${ICON.back}</a>
      <div class="topbar-title">${esc(r.title)}</div>
      <button class="icon-btn ${r.fav ? 'fav-on' : ''}" id="btn-fav" aria-label="Favori">${ICON.heart}</button>
      <a class="icon-btn" href="#/edit/${r.id}" aria-label="Modifier">${ICON.edit}</a>
    </div>
    <div class="stage-wrap"><div class="stage" id="stage">
      <img class="fiche" id="fiche" alt="Fiche ${esc(r.title)}">
      <div class="layer" id="layer"></div>
      <div class="fiche-loading" id="fiche-loading"><span></span></div>
    </div></div>
    <div class="actionbar" id="actionbar">
      <button class="act" id="btn-deco">${ICON.sticker}<span>Décorer</span></button>
      <button class="act primary" id="btn-share">${ICON.share}<span>Partager</span></button>
      <button class="act" id="btn-cook">${ICON.cook}<span>En cuisine</span></button>
    </div>`;

  $('#btn-fav').onclick = async () => {
    r.fav = !r.fav; await DB.put(r);
    $('#btn-fav').classList.toggle('fav-on', r.fav);
    toast(r.fav ? 'Ajoutée aux favoris' : 'Retirée des favoris');
  };
  $('#btn-deco').onclick = () => startDeco();
  $('#btn-share').onclick = () => openShare(r);
  $('#btn-cook').onclick = () => openCook(r);

  const f = await getFiche(r);
  if (cur !== r || !$('#fiche')) return;
  const img = $('#fiche');
  img.src = f.url;
  $('#stage').style.aspectRatio = `${CARD.W} / ${f.height}`;
  img.onload = () => { const l = $('#fiche-loading'); if (l) l.remove(); };
  drawStickers();
  if (r._justCreated) { delete r._justCreated; setTimeout(() => toast('Fiche créée ! Touche « Décorer » ✨'), 300); }
}

/* --- calque d'autocollants --- */
let stageRO = null;
function drawStickers() {
  const layer = $('#layer'); if (!layer || !cur) return;
  const list = cur.stickers || [];
  layer.innerHTML = list.map((s, i) => `<div class="stk" data-i="${i}">${STICKERS.svg(s.id)}</div>`).join('');
  placeStickers();
  if (!stageRO) {
    stageRO = new ResizeObserver(() => placeStickers());
  }
  stageRO.disconnect();
  stageRO.observe($('#stage'));
}
function placeSticker(el, s) {
  const W = $('#stage').clientWidth;
  el.style.left = (s.x * 100) + '%';
  el.style.top = (s.y * W) + 'px';
  el.style.width = (s.s * 100) + '%';
  el.style.transform = `translate(-50%, -50%) rotate(${s.r || 0}deg) scaleX(${s.f ? -1 : 1})`;
}
function placeStickers() {
  const layer = $('#layer'); if (!layer || !cur) return;
  $$('.stk', layer).forEach((el) => { const s = cur.stickers[+el.dataset.i]; if (s) placeSticker(el, s); });
  if (deco) markSelected();
}

const saveStickers = debounce(() => { if (cur) DB.put(cur); }, 400);

/* --- mode décoration --- */
function startDeco() {
  if (!cur) return;
  cur.stickers = cur.stickers || [];
  deco = { sel: -1, tab: null, ptrs: new Map(), g: null };
  $('#stage').classList.add('deco');
  const sugg = STICKERS.suggest(cur.title, (cur.ingredients || []).map((i) => i.n || '').join(' '));
  deco.sugg = sugg;
  deco.tab = sugg.length ? 'sugg' : 'fruits';
  const tabs = [...(sugg.length ? [['sugg', 'Pour toi']] : []), ...STICKERS.CATS];
  $('#actionbar').outerHTML = `
    <div class="deco-panel" id="deco-panel">
      <div class="deco-tools" id="deco-tools">
        <button data-a="smaller" aria-label="Plus petit">${ICON.minus}</button>
        <button data-a="bigger" aria-label="Plus grand">${ICON.plus}</button>
        <button data-a="rotl" aria-label="Tourner à gauche">${ICON.rotl}</button>
        <button data-a="rotr" aria-label="Tourner à droite">${ICON.rotr}</button>
        <button data-a="flip" aria-label="Retourner">${ICON.flip}</button>
        <button data-a="dup" aria-label="Dupliquer">${ICON.copy}</button>
        <button data-a="front" aria-label="Mettre devant">${ICON.front}</button>
        <button data-a="del" class="danger" aria-label="Supprimer">${ICON.trash}</button>
      </div>
      <div class="deco-head">
        <div class="deco-tabs" id="deco-tabs">${tabs.map(([k, l]) => `<button data-t="${k}" class="${k === deco.tab ? 'on' : ''}">${l}</button>`).join('')}</div>
        <button class="deco-done" id="deco-done">${ICON.check}<span>Terminé</span></button>
      </div>
      <div class="deco-grid" id="deco-grid"></div>
      <p class="deco-hint">Touche un autocollant pour l'ajouter, puis fais-le glisser. Deux doigts pour l'agrandir ou le tourner.</p>
    </div>`;
  renderDecoGrid();
  $('#deco-tabs').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    deco.tab = b.dataset.t;
    $$('button', $('#deco-tabs')).forEach((x) => x.classList.toggle('on', x === b));
    renderDecoGrid();
  };
  $('#deco-grid').onclick = (e) => { const b = e.target.closest('[data-id]'); if (b) addSticker(b.dataset.id); };
  $('#deco-done').onclick = () => stopDeco(true);
  $('#deco-tools').onclick = (e) => { const b = e.target.closest('button'); if (b) toolAction(b.dataset.a); };
  const layer = $('#layer');
  layer.addEventListener('pointerdown', onPtrDown);
  layer.addEventListener('pointermove', onPtrMove);
  layer.addEventListener('pointerup', onPtrUp);
  layer.addEventListener('pointercancel', onPtrUp);
  markSelected();
}

function stopDeco(save) {
  if (!deco) return;
  deco = null;
  const st = $('#stage'); if (st) st.classList.remove('deco');
  const layer = $('#layer');
  if (layer) {
    layer.removeEventListener('pointerdown', onPtrDown); layer.removeEventListener('pointermove', onPtrMove);
    layer.removeEventListener('pointerup', onPtrUp); layer.removeEventListener('pointercancel', onPtrUp);
    $$('.stk', layer).forEach((el) => el.classList.remove('sel'));
  }
  const p = $('#deco-panel');
  if (p) {
    p.outerHTML = `<div class="actionbar" id="actionbar">
      <button class="act" id="btn-deco">${ICON.sticker}<span>Décorer</span></button>
      <button class="act primary" id="btn-share">${ICON.share}<span>Partager</span></button>
      <button class="act" id="btn-cook">${ICON.cook}<span>En cuisine</span></button></div>`;
    $('#btn-deco').onclick = () => startDeco();
    $('#btn-share').onclick = () => openShare(cur);
    $('#btn-cook').onclick = () => openCook(cur);
  }
  if (save && cur) { DB.put(cur); toast('Décoration enregistrée'); }
}

function renderDecoGrid() {
  const ids = deco.tab === 'sugg' ? deco.sugg : STICKERS.list.filter((s) => s.cat === deco.tab).map((s) => s.id);
  $('#deco-grid').innerHTML = ids.map((id) => `<button data-id="${id}" aria-label="${esc(STICKERS.byId[id].name)}">${STICKERS.svg(id)}</button>`).join('');
  $('#deco-grid').scrollTop = 0;
}

function addSticker(id) {
  const stage = $('#stage'); const rect = stage.getBoundingClientRect();
  const W = rect.width;
  // au centre de la partie visible de la fiche (au-dessus du panneau)
  const panel = $('#deco-panel').getBoundingClientRect();
  const visTop = Math.max(rect.top, 60); const visBot = Math.min(rect.bottom, panel.top);
  const cy = (visTop + visBot) / 2 - rect.top;
  const big = STICKERS.byId[id].cat === 'etiquettes' || STICKERS.byId[id].noCut;
  const s = { id, x: 0.5 + (Math.random() - 0.5) * 0.2, y: Math.max(0.05, cy / W), s: big ? 0.3 : 0.2, r: Math.round((Math.random() - 0.5) * 20) };
  cur.stickers.push(s);
  drawStickers();
  deco.sel = cur.stickers.length - 1;
  markSelected();
  saveStickers();
  if (navigator.vibrate) navigator.vibrate(8);
}

function markSelected() {
  $$('#layer .stk').forEach((el) => el.classList.toggle('sel', deco && +el.dataset.i === deco.sel));
  const tools = $('#deco-tools'); if (tools) tools.classList.toggle('show', !!deco && deco.sel >= 0);
}

function toolAction(a) {
  if (!deco || deco.sel < 0) return;
  const s = cur.stickers[deco.sel]; if (!s) return;
  if (a === 'smaller') s.s = Math.max(0.06, s.s / 1.15);
  if (a === 'bigger') s.s = Math.min(0.9, s.s * 1.15);
  if (a === 'rotl') s.r = (s.r || 0) - 12;
  if (a === 'rotr') s.r = (s.r || 0) + 12;
  if (a === 'flip') s.f = !s.f;
  if (a === 'dup') { cur.stickers.push({ ...s, x: Math.min(0.95, s.x + 0.06), y: s.y + 0.06 }); deco.sel = cur.stickers.length - 1; drawStickers(); }
  if (a === 'front') { cur.stickers.splice(deco.sel, 1); cur.stickers.push(s); deco.sel = cur.stickers.length - 1; drawStickers(); }
  if (a === 'del') { cur.stickers.splice(deco.sel, 1); deco.sel = -1; drawStickers(); }
  placeStickers();
  saveStickers();
}

/* --- gestes : glisser, pincer, tourner --- */
function onPtrDown(e) {
  if (!deco) return;
  const el = e.target.closest('.stk');
  if (el) {
    if (deco.ptrs.size === 0) { deco.sel = +el.dataset.i; markSelected(); }
  } else if (deco.ptrs.size === 0) {
    deco.sel = -1; markSelected(); return;   // touche à vide : on désélectionne et on laisse défiler
  }
  if (deco.sel < 0) return;
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
  deco.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  beginGesture();
}
function beginGesture() {
  const s = cur.stickers[deco.sel]; if (!s) return;
  const pts = [...deco.ptrs.values()];
  deco.g = { s0: { ...s }, pts0: pts.map((p) => ({ ...p })) };
  if (pts.length >= 2) {
    const [a, b] = pts;
    deco.g.d0 = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    deco.g.a0 = Math.atan2(b.y - a.y, b.x - a.x);
    deco.g.m0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
}
function onPtrMove(e) {
  if (!deco || !deco.ptrs.has(e.pointerId) || !deco.g) return;
  e.preventDefault();
  deco.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const s = cur.stickers[deco.sel]; if (!s) return;
  const W = $('#stage').clientWidth;
  const pts = [...deco.ptrs.values()]; const g = deco.g;
  if (pts.length >= 2 && g.d0) {
    const [a, b] = pts;
    const d = Math.hypot(b.x - a.x, b.y - a.y); const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    s.s = Math.min(0.9, Math.max(0.06, g.s0.s * d / g.d0));
    s.r = g.s0.r + (ang - g.a0) * 180 / Math.PI;
    s.x = g.s0.x + (m.x - g.m0.x) / W; s.y = g.s0.y + (m.y - g.m0.y) / W;
  } else {
    const p0 = g.pts0[0];
    s.x = g.s0.x + (e.clientX - p0.x) / W; s.y = g.s0.y + (e.clientY - p0.y) / W;
  }
  const H = $('#stage').clientHeight;
  s.x = Math.min(1.02, Math.max(-0.02, s.x)); s.y = Math.min(H / W + 0.02, Math.max(-0.02, s.y));
  const el = $(`#layer .stk[data-i="${deco.sel}"]`); if (el) placeSticker(el, s);
}
function onPtrUp(e) {
  if (!deco || !deco.ptrs.has(e.pointerId)) return;
  deco.ptrs.delete(e.pointerId);
  if (deco.ptrs.size) beginGesture(); else { deco.g = null; saveStickers(); }
}
document.addEventListener('gesturestart', (e) => e.preventDefault());

/* =========================================================
   Partage / export PNG
   ========================================================= */
async function openShare(r) {
  const sh = openSheet(`
    <h2 class="sheet-title">Partager ma fiche</h2>
    <div class="share-preview" id="share-prev"><div class="spinner"></div><p>Préparation de l'image…</p></div>
    <div class="share-btns">
      <button class="btn primary" id="sh-send" disabled>${ICON.share}<span>Envoyer (Snap, Messages, Photos…)</span></button>
      <button class="btn" id="sh-dl" disabled>${ICON.download}<span>Télécharger le PNG</span></button>
    </div>
    <p class="hint">Pour la garder dans Photos : « Envoyer » puis « Enregistrer l'image ». Tu peux aussi appuyer longtemps sur l'aperçu.</p>`);
  let file = null; let url = null;
  try {
    const out = await CARD.render(r, { withStickers: true, scale: 1 });
    const blob = await new Promise((res, rej) => { try { out.canvas.toBlob((b) => (b ? res(b) : rej(new Error('vide'))), 'image/png'); } catch (err) { rej(err); } });
    file = new File([blob], `${slug(r.title)}.png`, { type: 'image/png' });
    url = URL.createObjectURL(blob);
  } catch (err) {
    console.error(err);
    if (!sh.isConnected || sh.hidden) return;
    $('#share-prev', sh).innerHTML = `<p>Oups, l'image n'a pas pu être créée.</p>`;
    return;
  }
  if (sh.hidden || !$('#share-prev', sh)) { URL.revokeObjectURL(url); return; }
  $('#share-prev', sh).innerHTML = `<img src="${url}" alt="Fiche ${esc(r.title)}">`;
  const send = $('#sh-send', sh); const dl = $('#sh-dl', sh);
  send.disabled = false; dl.disabled = false;
  const canShareFile = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  if (!canShareFile) send.querySelector('span').textContent = 'Envoyer (non disponible ici)';
  send.onclick = async () => {
    if (!canShareFile) { download(url, file.name); return; }
    try { await navigator.share({ files: [file] }); } catch (err) { if (err && err.name !== 'AbortError') download(url, file.name); }
  };
  dl.onclick = () => download(url, file.name);
  sheetClose = () => setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function download(url, name) {
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}

/* =========================================================
   Mode « En cuisine »
   ========================================================= */
let wakeLock = null;
async function openCook(r) {
  const base = +r.servings || 0;
  let n = base || 1;
  const done = new Set(); const got = new Set();
  const sh = openSheet(`<div id="cook"></div>`, {
    full: true,
    onClose: () => { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } },
  });
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* rien */ }
  const draw = () => {
    const mult = base ? n / base : 1;
    $('#cook', sh).innerHTML = `
      <div class="cook-head"><h2>${esc(r.title)}</h2><button class="icon-btn" id="cook-close" aria-label="Fermer">${ICON.close}</button></div>
      ${wakeLock ? '<p class="cook-awake">L\'écran reste allumé pendant que tu cuisines</p>' : ''}
      ${base ? `<div class="cook-serv"><span>Pour</span><button class="round" id="sv-m">${ICON.minus}</button><b>${n}</b><button class="round" id="sv-p">${ICON.plus}</button><span>${esc(r.servingsUnit || 'pers.')}</span></div>` : ''}
      <h3>Ingrédients</h3>
      <ul class="cook-ings">${(r.ingredients || []).map((it, i) => {
        if (it.sec) return `<li class="sec">${esc(it.sec)}</li>`;
        if (!it.n && !it.q) return '';
        const t = CARD.ingText(it, mult);
        return `<li class="${got.has(i) ? 'ok' : ''}" data-i="${i}"><span class="box">${ICON.check}</span><span><b>${esc(t.qty)}</b> ${esc(t.name)}</span></li>`;
      }).join('')}</ul>
      <h3>Étapes</h3>
      <ol class="cook-steps">${(r.steps || []).filter((s) => s && s.trim()).map((s, i) => `<li class="${done.has(i) ? 'ok' : ''}" data-i="${i}"><span class="num">${done.has(i) ? ICON.check : i + 1}</span><p>${esc(s)}</p></li>`).join('')}</ol>
      ${r.notes ? `<div class="cook-note"><b>Mes astuces</b><p>${esc(r.notes)}</p></div>` : ''}`;
    $('#cook-close', sh).onclick = closeSheet;
    if (base) {
      $('#sv-m', sh).onclick = () => { if (n > 1) { n--; draw(); } };
      $('#sv-p', sh).onclick = () => { n++; draw(); };
    }
    $('.cook-ings', sh).onclick = (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; const i = +li.dataset.i; got.has(i) ? got.delete(i) : got.add(i); li.classList.toggle('ok'); };
    $('.cook-steps', sh).onclick = (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; const i = +li.dataset.i; done.has(i) ? done.delete(i) : done.add(i); draw(); };
  };
  draw();
}

/* =========================================================
   Formulaire (création / modification)
   ========================================================= */
function blankRecipe() {
  return {
    id: uid(), title: '', subtitle: '', category: 'Pâtisserie', servings: '', servingsUnit: 'pers.', prep: '', cook: '', rest: '', temp: '',
    difficulty: 0, photo: null, ingredients: [{ q: '', u: 'g', n: '' }], steps: [''], notes: '', theme: 'creme', stickers: [], fav: false,
    created: Date.now(), updated: Date.now(),
  };
}

function viewEdit(id) {
  const orig = id ? recipes.find((r) => r.id === id) : null;
  if (id && !orig) { go('#/'); return; }
  const r = orig ? clone(orig) : blankRecipe();
  if (!r.ingredients || !r.ingredients.length) r.ingredients = [{ q: '', u: 'g', n: '' }];
  if (!r.steps || !r.steps.length) r.steps = [''];
  const startJSON = JSON.stringify(r);
  let saving = false;
  leaveGuard = () => saving || JSON.stringify(r) === startJSON || confirm('Quitter sans enregistrer tes modifications ?');

  screen().innerHTML = `
    <div class="topbar">
      <a class="icon-btn" href="${orig ? `#/r/${r.id}` : '#/'}" aria-label="Retour">${ICON.back}</a>
      <div class="topbar-title">${orig ? 'Modifier la recette' : 'Nouvelle recette'}</div>
      <span class="icon-btn ghost"></span>
    </div>
    <form class="form" id="form" autocomplete="off">
      <section class="card photo-card">
        <label class="photo-drop" id="photo-drop">
          <input type="file" accept="image/*" id="photo-in" hidden>
          <div id="photo-view"></div>
        </label>
      </section>

      <section class="card">
        <label class="field"><span>Nom de la recette</span><input id="f-title" placeholder="Tarte aux fraises" value="${esc(r.title)}" required></label>
        <label class="field"><span>Petit mot <i>(facultatif)</i></span><input id="f-sub" placeholder="la recette de Mamie" value="${esc(r.subtitle)}"></label>
        <label class="field"><span>Catégorie</span><select id="f-cat">${CATEGORIES.map((c) => `<option ${c === r.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      </section>

      <section class="card">
        <h2 class="card-title">Temps & infos</h2>
        <div class="row2">
          <label class="field"><span>Préparation</span><div class="suffix"><input type="number" inputmode="numeric" min="0" id="f-prep" value="${esc(r.prep)}" placeholder="0"><em>min</em></div></label>
          <label class="field"><span>Cuisson</span><div class="suffix"><input type="number" inputmode="numeric" min="0" id="f-cook" value="${esc(r.cook)}" placeholder="0"><em>min</em></div></label>
          <label class="field"><span>Repos</span><div class="suffix"><input type="number" inputmode="numeric" min="0" id="f-rest" value="${esc(r.rest)}" placeholder="0"><em>min</em></div></label>
          <label class="field"><span>Four</span><div class="suffix"><input type="number" inputmode="numeric" min="0" id="f-temp" value="${esc(r.temp)}" placeholder="180"><em>°C</em></div></label>
          <label class="field"><span>Quantité</span><div class="suffix"><input type="number" inputmode="numeric" min="0" id="f-serv" value="${esc(r.servings)}" placeholder="6"><select id="f-servu">${['pers.', 'parts', 'pièces', 'pots', 'verrines'].map((u) => `<option ${u === r.servingsUnit ? 'selected' : ''}>${u}</option>`).join('')}</select></div></label>
          <div class="field"><span>Niveau</span><div class="seg" id="f-diff">${['—', 'Facile', 'Moyen', 'Difficile'].map((l, i) => `<button type="button" data-v="${i}" class="${+r.difficulty === i ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        </div>
        <p class="hint" id="time-hint"></p>
      </section>

      <section class="card">
        <h2 class="card-title">Ingrédients</h2>
        <div id="ings"></div>
        <div class="add-row">
          <button type="button" class="btn small" id="add-ing">${ICON.plus}<span>Ingrédient</span></button>
          <button type="button" class="btn small" id="add-sec">${ICON.plus}<span>Sous-titre</span></button>
          <button type="button" class="btn small ghost" id="paste-ings">Coller une liste</button>
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">Étapes</h2>
        <div id="steps"></div>
        <div class="add-row"><button type="button" class="btn small" id="add-step">${ICON.plus}<span>Étape</span></button></div>
      </section>

      <section class="card">
        <h2 class="card-title">Mes astuces</h2>
        <textarea id="f-notes" rows="3" placeholder="Ajouter un zeste de citron vert…">${esc(r.notes)}</textarea>
      </section>

      <section class="card">
        <h2 class="card-title">Couleur de la fiche</h2>
        <div class="themes" id="themes">${Object.entries(CARD.THEMES).map(([k, t]) => `<button type="button" data-t="${k}" class="${k === r.theme ? 'on' : ''}" style="--a:${t.bg};--b:${t.accent}"><span></span>${t.name}</button>`).join('')}</div>
      </section>

      ${orig ? `<button type="button" class="btn danger-ghost" id="del">${ICON.trash}<span>Supprimer cette recette</span></button>` : ''}
      <div class="save-bar"><button type="submit" class="btn primary big" id="save">${ICON.check}<span>Enregistrer</span></button></div>
    </form>`;

  // --- photo
  const drawPhoto = () => {
    $('#photo-view').innerHTML = r.photo
      ? `<img src="${r.photo}" alt=""><div class="photo-actions"><span class="pill">${ICON.camera}Changer</span><button type="button" class="pill" id="photo-del">${ICON.trash}Retirer</button></div>`
      : `<div class="photo-empty">${STICKERS.svg('livre')}<b>Ajouter une photo</b><span>Appareil photo ou galerie</span></div>`;
    const d = $('#photo-del'); if (d) d.onclick = (e) => { e.preventDefault(); e.stopPropagation(); r.photo = null; drawPhoto(); };
  };
  drawPhoto();
  $('#photo-in').onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    $('#photo-view').innerHTML = `<div class="photo-empty"><div class="spinner"></div><span>Chargement…</span></div>`;
    try { r.photo = await processPhoto(f); } catch (err) { toast('Impossible de lire cette photo'); }
    e.target.value = '';
    drawPhoto();
  };

  // --- champs simples
  const bind = (sel, key, num) => { const el = $(sel); el.oninput = () => { r[key] = num ? (el.value === '' ? '' : +el.value) : el.value; if (num) timeHint(); }; };
  bind('#f-title', 'title'); bind('#f-sub', 'subtitle'); bind('#f-prep', 'prep', 1); bind('#f-cook', 'cook', 1);
  bind('#f-rest', 'rest', 1); bind('#f-temp', 'temp', 1); bind('#f-serv', 'servings', 1); bind('#f-notes', 'notes');
  $('#f-cat').onchange = (e) => { r.category = e.target.value; };
  $('#f-servu').onchange = (e) => { r.servingsUnit = e.target.value; };
  $('#f-diff').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; r.difficulty = +b.dataset.v; $$('button', $('#f-diff')).forEach((x) => x.classList.toggle('on', x === b)); };
  $('#themes').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; r.theme = b.dataset.t; $$('button', $('#themes')).forEach((x) => x.classList.toggle('on', x === b)); };
  const timeHint = () => {
    const parts = [['Préparation', r.prep], ['Cuisson', r.cook], ['Repos', r.rest]].filter(([, v]) => +v >= 60).map(([l, v]) => `${l} : ${CARD.fmtMin(v)}`);
    $('#time-hint').textContent = parts.join(' · ');
  };
  timeHint();

  // --- ingrédients
  const drawIngs = () => {
    $('#ings').innerHTML = r.ingredients.map((it, i) => it.sec !== undefined
      ? `<div class="ing sec" data-i="${i}"><input class="ing-sec" value="${esc(it.sec)}" placeholder="Pour la pâte…" data-k="sec">${rowBtns(i, r.ingredients.length)}</div>`
      : `<div class="ing" data-i="${i}">
          <input class="ing-q" type="text" inputmode="decimal" value="${esc(it.q)}" placeholder="250" data-k="q">
          <select class="ing-u" data-k="u">${UNITS.map((u) => `<option value="${u}" ${u === (it.u || '') ? 'selected' : ''}>${u || '—'}</option>`).join('')}</select>
          <input class="ing-n" value="${esc(it.n)}" placeholder="farine" data-k="n">
          ${rowBtns(i, r.ingredients.length)}
        </div>`).join('');
  };
  const rowBtns = (i, len) => `<div class="row-btns"><button type="button" data-m="up" ${i === 0 ? 'disabled' : ''} aria-label="Monter">${ICON.up}</button><button type="button" data-m="down" ${i === len - 1 ? 'disabled' : ''} aria-label="Descendre">${ICON.down}</button><button type="button" data-m="del" aria-label="Supprimer">${ICON.close}</button></div>`;
  const listHandlers = (wrap, arr, redraw) => {
    wrap.oninput = (e) => {
      const row = e.target.closest('[data-i]'); if (!row) return;
      const i = +row.dataset.i; const k = e.target.dataset.k;
      if (k === undefined) return;
      if (typeof arr()[i] === 'string') arr()[i] = e.target.value; else arr()[i][k] = e.target.value;
    };
    wrap.onchange = wrap.oninput;
    wrap.onclick = (e) => {
      const b = e.target.closest('button[data-m]'); if (!b) return;
      const i = +b.closest('[data-i]').dataset.i; const a = arr();
      if (b.dataset.m === 'up' && i > 0) [a[i - 1], a[i]] = [a[i], a[i - 1]];
      if (b.dataset.m === 'down' && i < a.length - 1) [a[i + 1], a[i]] = [a[i], a[i + 1]];
      if (b.dataset.m === 'del') a.splice(i, 1);
      redraw();
    };
  };
  listHandlers($('#ings'), () => r.ingredients, drawIngs);
  drawIngs();
  $('#add-ing').onclick = () => { r.ingredients.push({ q: '', u: 'g', n: '' }); drawIngs(); focusLast('#ings .ing-q'); };
  $('#add-sec').onclick = () => { r.ingredients.push({ sec: '' }); drawIngs(); focusLast('#ings .ing-sec'); };
  $('#paste-ings').onclick = () => {
    const sh = openSheet(`
      <h2 class="sheet-title">Coller une liste d'ingrédients</h2>
      <p class="hint">Un ingrédient par ligne, par exemple « 250 g de farine » ou « 2 œufs ». Une ligne qui finit par « : » devient un sous-titre.</p>
      <textarea id="paste-txt" rows="8" placeholder="Pour la pâte :&#10;250 g de farine&#10;125 g de beurre&#10;2 œufs"></textarea>
      <button class="btn primary big" id="paste-ok">${ICON.check}<span>Ajouter</span></button>`);
    $('#paste-ok', sh).onclick = () => {
      const items = parseIngredients($('#paste-txt', sh).value);
      if (!items.length) { closeSheet(); return; }
      r.ingredients = r.ingredients.filter((it) => (it.sec !== undefined ? it.sec : (it.n || it.q)));
      r.ingredients.push(...items);
      drawIngs(); closeSheet(); toast(`${items.length} ligne${items.length > 1 ? 's' : ''} ajoutée${items.length > 1 ? 's' : ''}`);
    };
  };

  // --- étapes
  const drawSteps = () => {
    $('#steps').innerHTML = r.steps.map((s, i) => `<div class="step" data-i="${i}"><span class="step-n">${i + 1}</span><textarea rows="2" data-k="t" placeholder="${i === 0 ? 'Préchauffer le four à 180 °C…' : 'Étape suivante…'}">${esc(s)}</textarea>${rowBtns(i, r.steps.length)}</div>`).join('');
    $$('#steps textarea').forEach(autoGrow);
  };
  listHandlers($('#steps'), () => r.steps, drawSteps);
  $('#steps').addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') autoGrow(e.target); });
  drawSteps();
  $('#add-step').onclick = () => { r.steps.push(''); drawSteps(); focusLast('#steps textarea'); };

  // --- suppression
  const del = $('#del');
  if (del) del.onclick = async () => {
    if (!confirm(`Supprimer « ${r.title || 'cette recette'} » ? C'est définitif.`)) return;
    saving = true;
    await DB.del(r.id);
    recipes = recipes.filter((x) => x.id !== r.id);
    toast('Recette supprimée');
    go('#/');
  };

  // --- enregistrement
  $('#form').onsubmit = async (e) => {
    e.preventDefault();
    if (!r.title.trim()) { toast('Donne un nom à ta recette'); $('#f-title').focus(); return; }
    r.title = r.title.trim();
    r.ingredients = r.ingredients.filter((it) => (it.sec !== undefined ? String(it.sec).trim() : String(it.n || '').trim() || String(it.q || '').trim()));
    r.steps = r.steps.map((s) => s.trim()).filter(Boolean);
    r.updated = Date.now();
    const isNew = !orig;
    $('#save').disabled = true;
    if (isNew && !r.stickers.length) {
      try { r.stickers = await autoStickers(r); } catch (err) { r.stickers = []; }
    }
    saving = true;
    await DB.put(r);
    const i = recipes.findIndex((x) => x.id === r.id);
    if (i >= 0) recipes[i] = r; else recipes.push(r);
    if (isNew) r._justCreated = true;
    leaveGuard = null;
    history.replaceState(null, '', '#/');
    go(`#/r/${r.id}`);
  };
}

function focusLast(sel) { const all = $$(sel); const el = all[all.length - 1]; if (el) el.focus(); }
function autoGrow(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }

/* Analyse d'une liste collée : « 250 g de farine », « 1/2 c. à c. de sel », « 2 œufs » */
function parseIngredients(text) {
  const unitMap = [
    [/^(kg|kilos?)\b/i, 'kg'], [/^(mg)\b/i, 'mg'], [/^(g|gr|grammes?)\b/i, 'g'], [/^(ml)\b/i, 'ml'], [/^(cl)\b/i, 'cl'], [/^(dl)\b/i, 'dl'], [/^(l|litres?)\b/i, 'L'],
    [/^(c\.?\s?à\s?s\.?|cuill?\.?\s?à\s?soupe|cuillères?\s?à\s?soupe|cs|càs|cas)(?=\s|$)/i, 'c. à s.'],
    [/^(c\.?\s?à\s?c\.?|cuill?\.?\s?à\s?café|cuillères?\s?à\s?café|cc|càc|cac)(?=\s|$)/i, 'c. à c.'],
    [/^(pincées?)\b/i, 'pincée'], [/^(sachets?)\b/i, 'sachet'], [/^(tasses?)\b/i, 'tasse'], [/^(verres?)\b/i, 'verre'], [/^(tranches?)\b/i, 'tranche'],
    [/^(gousses?)\b/i, 'gousse'], [/^(bottes?)\b/i, 'botte'], [/^(brins?)\b/i, 'brin'], [/^(feuilles?)\b/i, 'feuille'], [/^(pots?)\b/i, 'pot'], [/^(boîtes?|boites?)\b/i, 'boîte'], [/^(noix)\b/i, 'noix'],
  ];
  return text.split('\n').map((l) => l.replace(/^[\s\-•*·–]+/, '').trim()).filter(Boolean).map((l) => {
    if (/:$/.test(l)) return { sec: l.replace(/:$/, '').trim() };
    let q = ''; let u = ''; let rest = l;
    const m = rest.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?|½|¼|¾)\s*/);
    if (m) {
      let v = m[1].replace(/\s/g, '');
      if (v === '½') v = '0.5'; else if (v === '¼') v = '0.25'; else if (v === '¾') v = '0.75';
      else if (v.includes('/')) { const [a, b] = v.split('/'); v = String(Math.round((+a / +b) * 100) / 100); }
      q = v.replace(',', '.'); rest = rest.slice(m[0].length);
      for (const [re, unit] of unitMap) { const um = rest.match(re); if (um) { u = unit; rest = rest.slice(um[0].length).trim(); break; } }
      rest = rest.replace(/^(de |d'|d’)/i, '');
    }
    return { q, u, n: rest.trim() };
  });
}

async function processPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const max = 1400; const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.86);
  } finally { URL.revokeObjectURL(url); }
}

/* Autocollants posés automatiquement sur une nouvelle fiche */
async function autoStickers(r) {
  const sugg = STICKERS.suggest(r.title, (r.ingredients || []).map((i) => i.n || '').join(' '))
    .filter((id) => STICKERS.byId[id].cat !== 'etiquettes' && !STICKERS.byId[id].noCut);
  const pool = sugg.length ? sugg : ({ 'Pâtisserie': ['cupcake', 'fouet'], 'Dessert': ['glace', 'coeur'], 'Gâteau': ['gateau', 'fouet'], 'Biscuits': ['cookie', 'rouleau'], 'Viennoiserie': ['croissant', 'baguette'], 'Petit-déj': ['pancakes', 'cafe'], 'Boisson': ['cocktail', 'citron-tranche'], 'Soupe': ['soupe', 'carotte'], 'Salade': ['salade', 'tomate'], 'Apéro': ['cocktail', 'fromage'], 'Sauce': ['casserole', 'basilic'] }[r.category] || ['toque', 'casserole']);
  const out = await CARD.render(r, {});
  const A = out.anchors; const W = CARD.W;
  const st = [];
  if (pool[0]) st.push({ id: pool[0], x: 0.86, y: (A.titleTop + 10) / W, s: 0.19, r: 12 });
  if (pool[1]) {
    if (A.photoBottom) st.push({ id: pool[1], x: 0.15, y: (A.photoBottom - 40) / W, s: 0.17, r: -12 });
    else if (A.ingTop) st.push({ id: pool[1], x: 0.85, y: (A.ingTop + 30) / W, s: 0.15, r: 10 });
  }
  if (A.photoTop) st.push({ id: 'scotch-rose', x: 0.5, y: (A.photoTop + 4) / W, s: 0.24, r: 0 });
  if (A.stepsTop) st.push({ id: 'tag-maison', x: 0.82, y: (A.stepsTop + 34) / W, s: 0.24, r: 7 });
  return st;
}

/* =========================================================
   Réglages : signature, sauvegarde, installation
   ========================================================= */
function openSettings() {
  const sh = openSheet(`
    <h2 class="sheet-title">Réglages</h2>
    <label class="field"><span>Signature en bas des fiches</span><input id="set-sign" value="${esc(prefs.signature ?? 'Mon carnet de recettes')}" placeholder="Le carnet de …"></label>
    <div class="set-block">
      <h3>Sauvegarde</h3>
      <p class="hint">Tes recettes sont enregistrées uniquement sur ce téléphone. Fais une sauvegarde de temps en temps (dans Fichiers, iCloud ou par mail).</p>
      <div class="add-row">
        <button class="btn" id="set-export">${ICON.download}<span>Sauvegarder</span></button>
        <label class="btn">${ICON.plus}<span>Restaurer</span><input type="file" id="set-import" accept="application/json,.json" hidden></label>
      </div>
    </div>
    <div class="set-block">
      <h3>Sur l'écran d'accueil</h3>
      <p class="hint">Dans Safari : bouton Partager puis « Sur l'écran d'accueil ». L'appli s'ouvre alors en plein écran et marche même sans réseau.</p>
    </div>
    <p class="version">Mon carnet de recettes · v${APP_VERSION}</p>`);
  const sign = $('#set-sign', sh);
  sign.oninput = debounce(() => { prefs.signature = sign.value; savePrefs(); CARD.setSignature(sign.value); }, 300);
  $('#set-export', sh).onclick = exportBackup;
  $('#set-import', sh).onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const list = Array.isArray(data) ? data : data.recipes;
      if (!Array.isArray(list)) throw new Error('format');
      let n = 0;
      for (const r of list) { if (r && r.id && r.title !== undefined) { await DB.put(r); n++; } }
      recipes = await DB.all();
      closeSheet(); toast(`${n} recette${n > 1 ? 's' : ''} restaurée${n > 1 ? 's' : ''}`); route();
    } catch (err) { toast('Ce fichier ne ressemble pas à une sauvegarde'); }
  };
}

async function exportBackup() {
  const data = JSON.stringify({ app: 'carnet-recettes', version: 1, date: new Date().toISOString(), recipes }, null, 0);
  const d = new Date();
  const name = `recettes-sauvegarde-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
  const file = new File([data], name, { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (err) { if (err && err.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file); download(url, name); setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* =========================================================
   Démarrage
   ========================================================= */
$('#sheet-backdrop').onclick = closeSheet;

(async function init() {
  try { recipes = await DB.all(); } catch (e) { recipes = []; toast('Stockage indisponible (navigation privée ?)'); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  CARD.loadFonts();
  route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
