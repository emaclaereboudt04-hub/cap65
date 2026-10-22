'use strict';
/* =========================================================
   Carnet de recettes : application
   Données 100 % locales (IndexedDB). Aucune recette importée.
   ========================================================= */

const APP_VERSION = '2.0';

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
    t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  }));
  return { all: () => tx('readonly', (s) => s.getAll()), put: (r) => tx('readwrite', (s) => s.put(r)), del: (id) => tx('readwrite', (s) => s.delete(id)) };
})();

const PREFS_KEY = 'carnet-recettes-prefs';
const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch (e) { return {}; } })();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* rien */ } };
if (!prefs.signature || prefs.signature === 'Mon carnet de recettes') prefs.signature = prefs.signature || 'Carnet de cuisine';
CARD.setSignature(prefs.signature);

let recipes = [];

/* ---------------- Outils ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = (o) => JSON.parse(JSON.stringify(o));
const norm = ILLUS.norm;
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'recette';
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const totalTime = (r) => (+r.prep || 0) + (+r.cook || 0) + (+r.rest || 0);
const themeOf = (r) => CARD.THEMES[r.theme] || CARD.THEMES.ivoire;
const recipeNumber = (r) => recipes.slice().sort((a, b) => (a.created || 0) - (b.created || 0)).indexOf(r) + 1;

const I = (d, extra = '') => `<svg viewBox="0 0 24 24" ${extra}>${d}</svg>`;
const ICON = {
  back: I('<path d="M15 5l-7 7 7 7"/>'),
  heart: I('<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'),
  edit: I('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
  share: I('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 11H5v9h14v-9h-1"/>'),
  brush: I('<path d="M14.5 4.5l5 5L11 18H6v-5z"/><path d="M12.5 6.5l5 5"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  minus: I('<path d="M5 12h14"/>'),
  trash: I('<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'),
  rotl: I('<path d="M5 9a8 8 0 1 1 1 7"/><path d="M4 4v5h5"/>'),
  rotr: I('<path d="M19 9a8 8 0 1 0-1 7"/><path d="M20 4v5h-5"/>'),
  flip: I('<path d="M12 3v18"/><path d="M8 7L3 17h5zM16 7l5 10h-5z"/>'),
  copy: I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  front: I('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  camera: I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  settings: I('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  search: I('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  up: I('<path d="M6 14l6-6 6 6"/>'),
  down: I('<path d="M6 10l6 6 6-6"/>'),
  download: I('<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 19h14"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  grip: I('<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>'),
};

const CATEGORIES = ['Pâtisserie', 'Dessert', 'Gâteau', 'Biscuits', 'Viennoiserie', 'Petit-déjeuner', 'Entrée', 'Plat', 'Accompagnement', 'Soupe', 'Salade', 'Apéritif', 'Boisson', 'Sauce', 'Autre'];
const UNITS = ['', 'g', 'kg', 'mg', 'ml', 'cl', 'dl', 'L', 'c. à s.', 'c. à c.', 'pincée', 'sachet', 'tasse', 'verre', 'tranche', 'gousse', 'botte', 'brin', 'feuille', 'pot', 'boîte', 'noix', 'filet'];

/* illustration HTML */
const illus = (id, cls = '') => ILLUS.byId[id] ? `<img class="ill ${cls}" src="${ILLUS.src(id)}" alt="" draggable="false" loading="lazy">` : '';

/* ---------------- Toast / feuilles ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastT); toastT = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 250); }, 2300);
}
let sheetClose = null;
function openSheet(html, { onClose = null, cls = '' } = {}) {
  const sh = $('#sheet'); const bd = $('#sheet-backdrop');
  sh.className = `sheet ${cls}`;
  sh.innerHTML = `<div class="sheet-grip"></div>${html}`;
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
  setTimeout(() => { sh.hidden = true; bd.hidden = true; sh.innerHTML = ''; }, 280);
  if (cb) cb();
}

/* ---------------- Routeur ---------------- */
const screen = () => $('#screen');
let leaveGuard = null;
let cleanup = null;

function route() {
  const [view, id] = location.hash.replace(/^#\/?/, '').split('/');
  closeSheet();
  if (cleanup) { cleanup(); cleanup = null; }
  document.body.dataset.view = view || 'home';
  window.scrollTo(0, 0);
  if (view === 'r' && id) return viewRecipe(id);
  if (view === 'fiche' && id) return viewStudio(id);
  if (view === 'edit' && id) return viewEdit(id);
  if (view === 'new') return viewEdit(null);
  return viewHome();
}
function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
window.addEventListener('hashchange', (e) => {
  if (leaveGuard && !leaveGuard()) { history.replaceState(null, '', new URL(e.oldURL).hash); return; }
  leaveGuard = null;
  route();
});

/* =========================================================
   Accueil
   ========================================================= */
const homeState = { q: '', cat: 'Tout' };

function cardVisual(r, big = false) {
  if (r.photo) return `<img class="cover" src="${r.photo}" alt="" loading="lazy">`;
  const id = (r.stickers || []).map((s) => s.id).find((i) => ILLUS.byId[i] && ILLUS.byId[i].cat !== 'deco') || ILLUS.suggest(r.title)[0] || 'livre';
  return `<div class="cover cover-ill" style="--tint:${themeOf(r).tint}">${illus(id, big ? 'big' : '')}</div>`;
}

function viewHome() {
  const cats = ['Tout', 'Favoris', ...CATEGORIES.filter((c) => recipes.some((r) => r.category === c))];
  if (!cats.includes(homeState.cat)) homeState.cat = 'Tout';
  const d = new Date();
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  screen().innerHTML = `
    <header class="home-head">
      <div class="home-top">
        <span class="overline">${esc(dateStr)}</span>
        <button class="icon-btn plain" id="btn-settings" aria-label="Réglages">${ICON.settings}</button>
      </div>
      <h1 class="display">Mes<br><em>recettes</em></h1>
      <p class="lede">${recipes.length ? `${recipes.length} recette${recipes.length > 1 ? 's' : ''} dans le carnet` : 'Un carnet rien qu\'à moi'}</p>
      <div class="home-art">${illus('fouet', 'a1')}${illus('oeufs', 'a2')}${illus('farine', 'a3')}</div>
    </header>
    ${recipes.length ? `
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Rechercher une recette, un ingrédient" value="${esc(homeState.q)}" autocomplete="off"></label>
    <nav class="tabs" id="cats">${cats.map((c) => `<button class="tab ${c === homeState.cat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</nav>
    <div id="list"></div>` : `
    <section class="empty">
      <div class="empty-art">${illus('livre')}</div>
      <h2>La première page est blanche</h2>
      <p>Note tes recettes avec leurs grammages, leurs étapes et une photo, puis compose une jolie fiche illustrée à partager.</p>
      <a class="btn primary" href="#/new">${ICON.plus}<span>Écrire ma première recette</span></a>
    </section>`}
    ${recipes.length ? `<a class="fab" href="#/new" aria-label="Nouvelle recette">${ICON.plus}</a>` : ''}`;
  $('#btn-settings').onclick = openSettings;
  if (!recipes.length) return;
  $('#q').oninput = (e) => { homeState.q = e.target.value; renderList(); };
  $('#cats').onclick = (e) => {
    const b = e.target.closest('.tab'); if (!b) return;
    homeState.cat = b.dataset.cat;
    $$('.tab', $('#cats')).forEach((x) => x.classList.toggle('on', x === b));
    renderList();
  };
  renderList();
}

function renderList() {
  const box = $('#list'); if (!box) return;
  const q = norm(homeState.q).trim();
  let list = recipes.slice();
  if (homeState.cat === 'Favoris') list = list.filter((r) => r.fav);
  else if (homeState.cat !== 'Tout') list = list.filter((r) => r.category === homeState.cat);
  if (q) list = list.filter((r) => norm([r.title, r.subtitle, r.category, r.notes, ...(r.ingredients || []).map((i) => i.n || i.sec)].join(' ')).includes(q));
  list.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  if (!list.length) { box.innerHTML = `<p class="none">${homeState.cat === 'Favoris' && !q ? 'Aucun favori pour l\'instant. Touche le cœur sur une recette pour la garder ici.' : 'Aucune recette ne correspond.'}</p>`; return; }
  const meta = (r) => [r.category, totalTime(r) ? CARD.fmtMin(totalTime(r)) : ''].filter(Boolean).map(esc).join(' · ');
  const feat = !q && homeState.cat === 'Tout' && list.length > 2 ? list.shift() : null;
  box.innerHTML = `
    ${feat ? `<a class="feature" href="#/r/${feat.id}">
      <div class="feature-img">${cardVisual(feat, true)}</div>
      <div class="feature-txt"><span class="overline">Dernière recette</span><h2>${esc(feat.title)}</h2>${feat.subtitle ? `<p class="sub">${esc(feat.subtitle)}</p>` : ''}<p class="meta">${meta(feat)}</p></div>
    </a>` : ''}
    <div class="grid">${list.map((r) => `
      <a class="rcard" href="#/r/${r.id}">
        <div class="rcard-img">${cardVisual(r)}${r.fav ? `<span class="fav-badge">${ICON.heart}</span>` : ''}</div>
        <h3>${esc(r.title || 'Sans titre')}</h3>
        <p class="meta">${meta(r)}</p>
      </a>`).join('')}</div>`;
}

/* =========================================================
   Recette (lecture & cuisine)
   ========================================================= */
let wakeLock = null;
function releaseWake() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }

function viewRecipe(id) {
  const r = recipes.find((x) => x.id === id);
  if (!r) { go('#/'); return; }
  const base = +r.servings || 0;
  let n = base;
  const got = new Set(); const done = new Set();
  const T = themeOf(r);
  const info = [['Préparation', CARD.fmtMin(r.prep)], ['Cuisson', CARD.fmtMin(r.cook)], ['Repos', CARD.fmtMin(r.rest)], ['Four', +r.temp ? `${r.temp} °C` : '']].filter(([, v]) => v);
  const firstIll = (r.stickers || []).map((s) => s.id).find((i) => ILLUS.byId[i] && ILLUS.byId[i].cat !== 'deco');

  screen().innerHTML = `
    <div class="r-hero ${r.photo ? '' : 'no-photo'}" style="--tint:${T.tint}">
      ${r.photo ? `<img src="${r.photo}" alt="">` : illus(firstIll || ILLUS.suggest(r.title)[0] || 'livre', 'hero-ill')}
      <div class="r-hero-bar">
        <a class="icon-btn glass" href="#/" aria-label="Retour">${ICON.back}</a>
        <span class="grow"></span>
        <button class="icon-btn glass ${r.fav ? 'fav-on' : ''}" id="btn-fav" aria-label="Favori">${ICON.heart}</button>
        <a class="icon-btn glass" href="#/edit/${r.id}" aria-label="Modifier">${ICON.edit}</a>
      </div>
    </div>
    <article class="r-body">
      <span class="overline accent">${esc(r.category || 'Recette')}</span>
      <h1 class="r-title">${esc(r.title)}</h1>
      ${r.subtitle ? `<p class="r-sub">${esc(r.subtitle)}</p>` : ''}
      ${info.length ? `<dl class="r-info">${info.map(([l, v]) => `<div><dt>${l}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}

      ${(r.ingredients || []).some((i) => i.n || i.q) ? `
      <section class="r-sec">
        <div class="r-sec-head"><h2>Ingrédients</h2>
          ${base ? `<div class="stepper"><button id="sv-m" aria-label="Moins">${ICON.minus}</button><span id="sv-n"></span><button id="sv-p" aria-label="Plus">${ICON.plus}</button></div>` : ''}
        </div>
        <ul class="ings" id="ings"></ul>
      </section>` : ''}

      ${(r.steps || []).length ? `
      <section class="r-sec">
        <div class="r-sec-head"><h2>Préparation</h2></div>
        <ol class="steps" id="steps">${r.steps.map((s, i) => `<li data-i="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><p>${esc(s)}</p></li>`).join('')}</ol>
      </section>` : ''}

      ${r.notes ? `<aside class="r-note"><span class="overline accent">Le petit plus</span><p>${esc(r.notes)}</p></aside>` : ''}
      <p class="r-foot">Touche un ingrédient ou une étape pour le cocher pendant que tu cuisines.</p>
    </article>
    <div class="dock">
      <button class="dock-btn" id="btn-wake" aria-pressed="false">${ICON.sun}<span>Écran allumé</span></button>
      <a class="dock-btn primary" href="#/fiche/${r.id}">${ICON.brush}<span>Fiche illustrée</span></a>
    </div>`;

  const drawIngs = () => {
    const ul = $('#ings'); if (!ul) return;
    const mult = base ? n / base : 1;
    ul.innerHTML = (r.ingredients || []).map((it, i) => {
      if (it.sec) return `<li class="sec">${esc(it.sec)}</li>`;
      if (!it.n && !it.q) return '';
      const t = CARD.ingText(it, mult);
      return `<li data-i="${i}" class="${got.has(i) ? 'ok' : ''}"><span class="box">${ICON.check}</span><span class="q">${esc(t.qty)}</span><span class="n">${esc(t.name)}</span></li>`;
    }).join('');
    const sn = $('#sv-n'); if (sn) sn.textContent = `${n} ${r.servingsUnit || 'pers.'}`;
  };
  drawIngs();
  if (base) {
    $('#sv-m').onclick = () => { if (n > 1) { n--; drawIngs(); } };
    $('#sv-p').onclick = () => { n++; drawIngs(); };
  }
  const ings = $('#ings');
  if (ings) ings.onclick = (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; const i = +li.dataset.i; got.has(i) ? got.delete(i) : got.add(i); li.classList.toggle('ok'); };
  const steps = $('#steps');
  if (steps) steps.onclick = (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; const i = +li.dataset.i; done.has(i) ? done.delete(i) : done.add(i); li.classList.toggle('ok'); };

  $('#btn-fav').onclick = async () => {
    r.fav = !r.fav; await DB.put(r);
    $('#btn-fav').classList.toggle('fav-on', r.fav);
    toast(r.fav ? 'Ajoutée aux favoris' : 'Retirée des favoris');
  };
  const wb = $('#btn-wake');
  if (!('wakeLock' in navigator)) wb.hidden = true;
  wb.onclick = async () => {
    if (wakeLock) { releaseWake(); wb.setAttribute('aria-pressed', 'false'); toast('L\'écran peut de nouveau se mettre en veille'); return; }
    try { wakeLock = await navigator.wakeLock.request('screen'); wb.setAttribute('aria-pressed', 'true'); toast('L\'écran reste allumé pendant que tu cuisines'); } catch (err) { toast('Impossible de garder l\'écran allumé'); }
  };
  cleanup = releaseWake;
}

/* =========================================================
   Atelier : fiche illustrée (décoration + export)
   ========================================================= */
const ficheCache = new Map();
let cur = null;
let deco = null;
const ficheKey = (r) => `${r.updated}|${r.theme}|${prefs.signature}|${recipeNumber(r)}`;

async function getFiche(r) {
  const key = ficheKey(r);
  const c = ficheCache.get(r.id);
  if (c && c.key === key) return c;
  const out = await CARD.render(r, { scale: Math.min(2, Math.max(1, (window.devicePixelRatio || 1) * 420 / 1080)), number: recipeNumber(r) });
  const blob = await new Promise((res) => out.canvas.toBlob(res, 'image/jpeg', 0.92));
  if (c) URL.revokeObjectURL(c.url);
  const v = { key, url: URL.createObjectURL(blob), height: out.height, anchors: out.anchors };
  ficheCache.set(r.id, v);
  return v;
}

async function viewStudio(id) {
  const r = recipes.find((x) => x.id === id);
  if (!r) { go('#/'); return; }
  cur = r;
  r.stickers = (r.stickers || []).filter((s) => ILLUS.byId[s.id]);
  deco = { sel: -1, ptrs: new Map(), g: null, tab: null, panel: 'ill' };
  const sugg = ILLUS.suggest(r.title, (r.ingredients || []).map((i) => i.n || '').join(' '));
  deco.sugg = sugg;
  deco.tab = sugg.length ? 'sugg' : ILLUS.CATS[0][0];
  const tabs = [...(sugg.length ? [['sugg', 'Suggestions']] : []), ...ILLUS.CATS];

  screen().innerHTML = `
    <div class="studio-bar">
      <a class="icon-btn plain" href="#/r/${r.id}" aria-label="Retour">${ICON.back}</a>
      <div class="studio-title"><span class="overline">Fiche illustrée</span><b>${esc(r.title)}</b></div>
      <button class="btn small dark" id="btn-export">${ICON.share}<span>Partager</span></button>
    </div>
    <div class="stage-wrap"><div class="stage deco" id="stage">
      <img class="fiche" id="fiche" alt="">
      <div class="layer" id="layer"></div>
      <div class="fiche-loading" id="fiche-loading"><span class="spinner"></span></div>
    </div></div>
    <div class="panel" id="panel">
      <div class="tools" id="tools">
        <button data-a="smaller" aria-label="Plus petit">${ICON.minus}</button>
        <button data-a="bigger" aria-label="Plus grand">${ICON.plus}</button>
        <button data-a="rotl" aria-label="Tourner à gauche">${ICON.rotl}</button>
        <button data-a="rotr" aria-label="Tourner à droite">${ICON.rotr}</button>
        <button data-a="flip" aria-label="Retourner">${ICON.flip}</button>
        <button data-a="dup" aria-label="Dupliquer">${ICON.copy}</button>
        <button data-a="front" aria-label="Au premier plan">${ICON.front}</button>
        <button data-a="del" class="danger" aria-label="Supprimer">${ICON.trash}</button>
      </div>
      <div class="panel-switch" id="panel-switch">
        <button data-p="ill" class="on">Illustrations</button>
        <button data-p="style">Papier</button>
      </div>
      <div id="panel-ill">
        <nav class="tabs small" id="ill-tabs">${tabs.map(([k, l]) => `<button class="tab ${k === deco.tab ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</nav>
        <div class="ill-grid" id="ill-grid"></div>
      </div>
      <div id="panel-style" hidden>
        <div class="papers" id="papers">${Object.entries(CARD.THEMES).map(([k, t]) => `<button data-t="${k}" class="${themeOf(r) === t ? 'on' : ''}"><span style="background:${t.bg};--ac:${t.accent}"></span>${t.name}</button>`).join('')}</div>
        <button class="btn ghost small" id="clear-ill">${ICON.trash}<span>Retirer toutes les illustrations</span></button>
      </div>
      <p class="panel-hint">Touche une illustration pour la poser, fais-la glisser, pince à deux doigts pour l'agrandir ou la tourner.</p>
    </div>`;

  const drawGrid = () => {
    const ids = deco.tab === 'sugg' ? deco.sugg : ILLUS.list.filter((s) => s.cat === deco.tab).map((s) => s.id);
    $('#ill-grid').innerHTML = ids.map((i) => `<button data-id="${i}" aria-label="${esc(ILLUS.byId[i].name)}">${illus(i)}</button>`).join('');
    $('#ill-grid').scrollLeft = 0;
  };
  drawGrid();
  $('#ill-tabs').onclick = (e) => { const b = e.target.closest('.tab'); if (!b) return; deco.tab = b.dataset.t; $$('.tab', $('#ill-tabs')).forEach((x) => x.classList.toggle('on', x === b)); drawGrid(); };
  $('#ill-grid').onclick = (e) => { const b = e.target.closest('[data-id]'); if (b) addIllus(b.dataset.id); };
  $('#panel-switch').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', $('#panel-switch')).forEach((x) => x.classList.toggle('on', x === b));
    $('#panel-ill').hidden = b.dataset.p !== 'ill'; $('#panel-style').hidden = b.dataset.p !== 'style';
  };
  $('#papers').onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    r.theme = b.dataset.t; r.updated = Date.now();
    $$('button', $('#papers')).forEach((x) => x.classList.toggle('on', x === b));
    await DB.put(r); refreshFiche();
  };
  $('#clear-ill').onclick = () => { if (!r.stickers.length || !confirm('Retirer toutes les illustrations de la fiche ?')) return; r.stickers = []; deco.sel = -1; drawLayer(); saveIllus(); };
  $('#tools').onclick = (e) => { const b = e.target.closest('button'); if (b) toolAction(b.dataset.a); };
  $('#btn-export').onclick = () => { selectIll(-1); openShare(r); };
  const layer = $('#layer');
  layer.addEventListener('pointerdown', onPtrDown);
  layer.addEventListener('pointermove', onPtrMove);
  layer.addEventListener('pointerup', onPtrUp);
  layer.addEventListener('pointercancel', onPtrUp);
  const ro = new ResizeObserver(() => placeAll());
  ro.observe($('#stage'));
  cleanup = () => { ro.disconnect(); deco = null; cur = null; };
  await refreshFiche();
  drawLayer();
}

async function refreshFiche() {
  const r = cur; if (!r) return;
  const f = await getFiche(r);
  if (cur !== r || !$('#fiche')) return;
  const img = $('#fiche');
  img.onload = () => { const l = $('#fiche-loading'); if (l) l.remove(); };
  img.src = f.url;
  $('#stage').style.aspectRatio = `${CARD.W} / ${f.height}`;
}

function drawLayer() {
  const layer = $('#layer'); if (!layer || !cur) return;
  layer.innerHTML = cur.stickers.map((s, i) => `<div class="stk" data-i="${i}">${illus(s.id)}</div>`).join('');
  placeAll();
}
function place(el, s) {
  const W = $('#stage').clientWidth;
  el.style.left = (s.x * 100) + '%';
  el.style.top = (s.y * W) + 'px';
  el.style.width = (s.s * 100) + '%';
  el.style.transform = `translate(-50%, -50%) rotate(${s.r || 0}deg) scaleX(${s.f ? -1 : 1})`;
}
function placeAll() {
  if (!cur || !$('#layer')) return;
  $$('#layer .stk').forEach((el) => { const s = cur.stickers[+el.dataset.i]; if (s) place(el, s); });
  markSel();
}
function markSel() {
  $$('#layer .stk').forEach((el) => el.classList.toggle('sel', !!deco && +el.dataset.i === deco.sel));
  const t = $('#tools'); if (t) t.classList.toggle('show', !!deco && deco.sel >= 0);
}
function selectIll(i) { if (deco) { deco.sel = i; markSel(); } }
const saveIllus = debounce(() => { if (cur) DB.put(cur); }, 400);

function addIllus(id) {
  const stage = $('#stage'); const rect = stage.getBoundingClientRect(); const W = rect.width;
  const panel = $('#panel').getBoundingClientRect();
  const top = Math.max(rect.top, 70); const bot = Math.min(rect.bottom, panel.top);
  const cy = (top + bot) / 2 - rect.top;
  const s = { id, x: 0.5 + (Math.random() - 0.5) * 0.3, y: Math.max(0.08, cy / W), s: ILLUS.byId[id].cat === 'deco' ? 0.24 : 0.22, r: Math.round((Math.random() - 0.5) * 16) };
  cur.stickers.push(s);
  drawLayer();
  selectIll(cur.stickers.length - 1);
  saveIllus();
  if (navigator.vibrate) navigator.vibrate(6);
}

function toolAction(a) {
  if (!deco || deco.sel < 0) return;
  const s = cur.stickers[deco.sel]; if (!s) return;
  if (a === 'smaller') s.s = Math.max(0.06, s.s / 1.15);
  if (a === 'bigger') s.s = Math.min(0.95, s.s * 1.15);
  if (a === 'rotl') s.r = (s.r || 0) - 10;
  if (a === 'rotr') s.r = (s.r || 0) + 10;
  if (a === 'flip') s.f = !s.f;
  if (a === 'dup') { cur.stickers.push({ ...s, x: Math.min(0.95, s.x + 0.06), y: s.y + 0.06 }); deco.sel = cur.stickers.length - 1; drawLayer(); }
  if (a === 'front') { cur.stickers.splice(deco.sel, 1); cur.stickers.push(s); deco.sel = cur.stickers.length - 1; drawLayer(); }
  if (a === 'del') { cur.stickers.splice(deco.sel, 1); deco.sel = -1; drawLayer(); }
  placeAll(); saveIllus();
}

function onPtrDown(e) {
  if (!deco) return;
  const el = e.target.closest('.stk');
  if (el) { if (deco.ptrs.size === 0) selectIll(+el.dataset.i); }
  else if (deco.ptrs.size === 0) { selectIll(-1); return; }
  if (deco.sel < 0) return;
  e.preventDefault();
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
  deco.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  beginGesture();
}
function beginGesture() {
  const s = cur.stickers[deco.sel]; if (!s) return;
  const pts = [...deco.ptrs.values()];
  deco.g = { s0: { ...s }, p0: { ...pts[0] } };
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
  const st = $('#stage'); const W = st.clientWidth; const H = st.clientHeight;
  const pts = [...deco.ptrs.values()]; const g = deco.g;
  if (pts.length >= 2 && g.d0) {
    const [a, b] = pts;
    const d = Math.hypot(b.x - a.x, b.y - a.y); const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    s.s = Math.min(0.95, Math.max(0.06, g.s0.s * d / g.d0));
    s.r = g.s0.r + (ang - g.a0) * 180 / Math.PI;
    s.x = g.s0.x + (m.x - g.m0.x) / W; s.y = g.s0.y + (m.y - g.m0.y) / W;
  } else {
    s.x = g.s0.x + (e.clientX - g.p0.x) / W; s.y = g.s0.y + (e.clientY - g.p0.y) / W;
  }
  s.x = Math.min(1.02, Math.max(-0.02, s.x)); s.y = Math.min(H / W + 0.02, Math.max(-0.02, s.y));
  const el = $(`#layer .stk[data-i="${deco.sel}"]`); if (el) place(el, s);
}
function onPtrUp(e) {
  if (!deco || !deco.ptrs.has(e.pointerId)) return;
  deco.ptrs.delete(e.pointerId);
  if (deco.ptrs.size) beginGesture(); else { deco.g = null; saveIllus(); }
}
document.addEventListener('gesturestart', (e) => e.preventDefault());

/* --- partage --- */
async function openShare(r) {
  const sh = openSheet(`
    <h2 class="sheet-title">Partager la fiche</h2>
    <div class="share-preview" id="share-prev"><span class="spinner"></span><p>Préparation de l'image…</p></div>
    <div class="share-btns">
      <button class="btn primary" id="sh-send" disabled>${ICON.share}<span>Envoyer</span></button>
      <button class="btn" id="sh-dl" disabled>${ICON.download}<span>Télécharger</span></button>
    </div>
    <p class="hint">« Envoyer » ouvre le menu de partage : Snapchat, Messages, WhatsApp, ou « Enregistrer l'image » pour la garder dans Photos.</p>`);
  let file; let url;
  try {
    const out = await CARD.render(r, { withIllus: true, scale: 1, number: recipeNumber(r) });
    const blob = await new Promise((res, rej) => { try { out.canvas.toBlob((b) => (b ? res(b) : rej(new Error('vide'))), 'image/png'); } catch (err) { rej(err); } });
    file = new File([blob], `${slug(r.title)}.png`, { type: 'image/png' });
    url = URL.createObjectURL(blob);
  } catch (err) {
    console.error(err);
    const p = $('#share-prev', sh); if (p) p.innerHTML = '<p>L\'image n\'a pas pu être créée.</p>';
    return;
  }
  const prev = $('#share-prev', sh);
  if (!prev || sh.hidden) { URL.revokeObjectURL(url); return; }
  prev.innerHTML = `<img src="${url}" alt="">`;
  const send = $('#sh-send', sh); const dl = $('#sh-dl', sh);
  send.disabled = false; dl.disabled = false;
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  if (!canShare) send.hidden = true;
  send.onclick = async () => { try { await navigator.share({ files: [file] }); } catch (err) { if (err && err.name !== 'AbortError') download(url, file.name); } };
  dl.onclick = () => download(url, file.name);
  sheetClose = () => setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function download(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

/* =========================================================
   Formulaire
   ========================================================= */
function blankRecipe() {
  return {
    id: uid(), title: '', subtitle: '', category: 'Pâtisserie', servings: '', servingsUnit: 'pers.', prep: '', cook: '', rest: '', temp: '',
    difficulty: 0, photo: null, ingredients: [{ q: '', u: 'g', n: '' }], steps: [''], notes: '', theme: 'ivoire', stickers: [], fav: false,
    created: Date.now(), updated: Date.now(),
  };
}

function viewEdit(id) {
  const orig = id ? recipes.find((r) => r.id === id) : null;
  if (id && !orig) { go('#/'); return; }
  const r = orig ? clone(orig) : blankRecipe();
  if (!CATEGORIES.includes(r.category)) r.category = r.category || 'Autre';
  if (!r.ingredients || !r.ingredients.length) r.ingredients = [{ q: '', u: 'g', n: '' }];
  if (!r.steps || !r.steps.length) r.steps = [''];
  const startJSON = JSON.stringify(r);
  let saving = false;
  leaveGuard = () => saving || JSON.stringify(r) === startJSON || confirm('Quitter sans enregistrer tes modifications ?');
  const cats = CATEGORIES.includes(r.category) ? CATEGORIES : [...CATEGORIES, r.category];

  screen().innerHTML = `
    <div class="edit-bar">
      <a class="link" href="${orig ? `#/r/${r.id}` : '#/'}">Annuler</a>
      <b>${orig ? 'Modifier' : 'Nouvelle recette'}</b>
      <button class="link strong" id="save-top">Enregistrer</button>
    </div>
    <form class="form" id="form" autocomplete="off">
      <label class="photo" id="photo">
        <input type="file" accept="image/*" id="photo-in" hidden>
        <div id="photo-view"></div>
      </label>

      <div class="group">
        <input class="title-in" id="f-title" placeholder="Nom de la recette" value="${esc(r.title)}">
        <input class="sub-in" id="f-sub" placeholder="Un petit mot (facultatif)" value="${esc(r.subtitle)}">
      </div>

      <div class="group">
        <label class="row"><span>Catégorie</span><select id="f-cat">${cats.map((c) => `<option ${c === r.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="row"><span>Préparation</span><span class="unit-in"><input type="number" inputmode="numeric" min="0" id="f-prep" value="${esc(r.prep)}" placeholder="0">min</span></label>
        <label class="row"><span>Cuisson</span><span class="unit-in"><input type="number" inputmode="numeric" min="0" id="f-cook" value="${esc(r.cook)}" placeholder="0">min</span></label>
        <label class="row"><span>Repos</span><span class="unit-in"><input type="number" inputmode="numeric" min="0" id="f-rest" value="${esc(r.rest)}" placeholder="0">min</span></label>
        <label class="row"><span>Four</span><span class="unit-in"><input type="number" inputmode="numeric" min="0" id="f-temp" value="${esc(r.temp)}" placeholder="—">°C</span></label>
        <label class="row"><span>Quantité</span><span class="unit-in"><input type="number" inputmode="numeric" min="0" id="f-serv" value="${esc(r.servings)}" placeholder="—"><select id="f-servu">${['pers.', 'parts', 'pièces', 'pots', 'verrines'].map((u) => `<option ${u === r.servingsUnit ? 'selected' : ''}>${u}</option>`).join('')}</select></span></label>
        <div class="row"><span>Niveau</span><div class="seg" id="f-diff">${['—', 'Facile', 'Moyen', 'Exigeant'].map((l, i) => `<button type="button" data-v="${i}" class="${+r.difficulty === i ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      </div>

      <h2 class="group-title">Ingrédients</h2>
      <div class="group">
        <div id="ings"></div>
        <div class="add-row">
          <button type="button" class="chip-btn" id="add-ing">${ICON.plus}Ingrédient</button>
          <button type="button" class="chip-btn" id="add-sec">${ICON.plus}Sous-partie</button>
          <button type="button" class="chip-btn ghost" id="paste-ings">Coller une liste</button>
        </div>
      </div>

      <h2 class="group-title">Préparation</h2>
      <div class="group">
        <div id="steps"></div>
        <div class="add-row"><button type="button" class="chip-btn" id="add-step">${ICON.plus}Étape</button></div>
      </div>

      <h2 class="group-title">Le petit plus</h2>
      <div class="group"><textarea id="f-notes" rows="3" placeholder="Une astuce, une variante, un souvenir…">${esc(r.notes)}</textarea></div>

      ${orig ? `<button type="button" class="btn danger-ghost" id="del">${ICON.trash}<span>Supprimer la recette</span></button>` : ''}
    </form>`;

  // photo
  const drawPhoto = () => {
    $('#photo-view').innerHTML = r.photo
      ? `<img src="${r.photo}" alt=""><div class="photo-actions"><span class="pill">${ICON.camera}Changer</span><button type="button" class="pill" id="photo-del">${ICON.trash}</button></div>`
      : `<div class="photo-empty">${illus('ustensiles')}<b>Ajouter une photo</b><span>Appareil photo ou photothèque</span></div>`;
    const d = $('#photo-del'); if (d) d.onclick = (e) => { e.preventDefault(); e.stopPropagation(); r.photo = null; drawPhoto(); };
  };
  drawPhoto();
  $('#photo-in').onchange = async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    $('#photo-view').innerHTML = `<div class="photo-empty"><span class="spinner"></span></div>`;
    try { r.photo = await processPhoto(f); } catch (err) { toast('Impossible de lire cette photo'); }
    e.target.value = ''; drawPhoto();
  };

  const bind = (sel, key, num) => { const el = $(sel); el.oninput = () => { r[key] = num ? (el.value === '' ? '' : +el.value) : el.value; }; };
  bind('#f-title', 'title'); bind('#f-sub', 'subtitle'); bind('#f-prep', 'prep', 1); bind('#f-cook', 'cook', 1);
  bind('#f-rest', 'rest', 1); bind('#f-temp', 'temp', 1); bind('#f-serv', 'servings', 1); bind('#f-notes', 'notes');
  $('#f-cat').onchange = (e) => { r.category = e.target.value; };
  $('#f-servu').onchange = (e) => { r.servingsUnit = e.target.value; };
  $('#f-diff').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; r.difficulty = +b.dataset.v; $$('button', $('#f-diff')).forEach((x) => x.classList.toggle('on', x === b)); };

  const rowBtns = (i, len) => `<div class="row-btns"><button type="button" data-m="up" ${i === 0 ? 'disabled' : ''} aria-label="Monter">${ICON.up}</button><button type="button" data-m="down" ${i === len - 1 ? 'disabled' : ''} aria-label="Descendre">${ICON.down}</button><button type="button" data-m="del" aria-label="Supprimer">${ICON.close}</button></div>`;
  const drawIngs = () => {
    $('#ings').innerHTML = r.ingredients.map((it, i) => it.sec !== undefined
      ? `<div class="ing sec" data-i="${i}"><input value="${esc(it.sec)}" placeholder="Pour la pâte" data-k="sec">${rowBtns(i, r.ingredients.length)}</div>`
      : `<div class="ing" data-i="${i}">
          <input class="q" type="text" inputmode="decimal" value="${esc(it.q)}" placeholder="250" data-k="q">
          <select class="u" data-k="u">${UNITS.map((u) => `<option value="${u}" ${u === (it.u || '') ? 'selected' : ''}>${u || '—'}</option>`).join('')}</select>
          <input class="n" value="${esc(it.n)}" placeholder="farine" data-k="n">
          ${rowBtns(i, r.ingredients.length)}
        </div>`).join('');
  };
  const listHandlers = (wrap, arr, redraw) => {
    wrap.oninput = (e) => {
      const row = e.target.closest('[data-i]'); if (!row) return;
      const i = +row.dataset.i; const k = e.target.dataset.k; if (k === undefined) return;
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
  $('#add-ing').onclick = () => { r.ingredients.push({ q: '', u: 'g', n: '' }); drawIngs(); focusLast('#ings .q'); };
  $('#add-sec').onclick = () => { r.ingredients.push({ sec: '' }); drawIngs(); focusLast('#ings .sec input'); };
  $('#paste-ings').onclick = () => {
    const sh = openSheet(`
      <h2 class="sheet-title">Coller une liste</h2>
      <p class="hint">Un ingrédient par ligne : « 250 g de farine », « 2 œufs »… Une ligne qui se termine par « : » devient une sous-partie.</p>
      <textarea id="paste-txt" rows="8" placeholder="Pour la pâte :&#10;250 g de farine&#10;125 g de beurre&#10;2 œufs"></textarea>
      <button class="btn primary wide" id="paste-ok">${ICON.check}<span>Ajouter</span></button>`);
    $('#paste-ok', sh).onclick = () => {
      const items = parseIngredients($('#paste-txt', sh).value);
      if (!items.length) { closeSheet(); return; }
      r.ingredients = r.ingredients.filter((it) => (it.sec !== undefined ? it.sec : (it.n || it.q)));
      r.ingredients.push(...items);
      drawIngs(); closeSheet(); toast(`${items.length} ligne${items.length > 1 ? 's' : ''} ajoutée${items.length > 1 ? 's' : ''}`);
    };
  };

  const drawSteps = () => {
    $('#steps').innerHTML = r.steps.map((s, i) => `<div class="step" data-i="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><textarea rows="2" data-k="t" placeholder="${i === 0 ? 'Préchauffer le four à 180 °C…' : 'Étape suivante…'}">${esc(s)}</textarea>${rowBtns(i, r.steps.length)}</div>`).join('');
    $$('#steps textarea').forEach(autoGrow);
  };
  listHandlers($('#steps'), () => r.steps, drawSteps);
  $('#steps').addEventListener('input', (e) => { if (e.target.tagName === 'TEXTAREA') autoGrow(e.target); });
  drawSteps();
  $('#add-step').onclick = () => { r.steps.push(''); drawSteps(); focusLast('#steps textarea'); };
  autoGrow($('#f-notes'));
  $('#f-notes').addEventListener('input', (e) => autoGrow(e.target));

  const del = $('#del');
  if (del) del.onclick = async () => {
    if (!confirm(`Supprimer « ${r.title || 'cette recette'} » ? C'est définitif.`)) return;
    saving = true;
    await DB.del(r.id);
    recipes = recipes.filter((x) => x.id !== r.id);
    toast('Recette supprimée'); go('#/');
  };

  const save = async (e) => {
    if (e) e.preventDefault();
    if (!r.title.trim()) { toast('Donne un nom à ta recette'); $('#f-title').focus(); return; }
    r.title = r.title.trim();
    r.ingredients = r.ingredients.filter((it) => (it.sec !== undefined ? String(it.sec).trim() : String(it.n || '').trim() || String(it.q || '').trim()));
    r.steps = r.steps.map((s) => s.trim()).filter(Boolean);
    r.updated = Date.now();
    const isNew = !orig;
    $('#save-top').disabled = true;
    if (isNew && !(r.stickers || []).length) { try { r.stickers = await autoIllus(r); } catch (err) { r.stickers = []; } }
    saving = true;
    await DB.put(r);
    const i = recipes.findIndex((x) => x.id === r.id);
    if (i >= 0) recipes[i] = r; else recipes.push(r);
    leaveGuard = null;
    if (isNew) history.replaceState(null, '', '#/');
    go(`#/r/${r.id}`);
    toast(isNew ? 'Recette ajoutée au carnet' : 'Modifications enregistrées');
  };
  $('#form').onsubmit = save;
  $('#save-top').onclick = save;
}

function focusLast(sel) { const all = $$(sel); const el = all[all.length - 1]; if (el) el.focus(); }
function autoGrow(t) { if (!t) return; t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }

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
    const max = 1600; const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.86);
  } finally { URL.revokeObjectURL(url); }
}

/* Illustrations posées automatiquement sur une nouvelle fiche */
async function autoIllus(r) {
  const sugg = ILLUS.suggest(r.title, (r.ingredients || []).map((i) => i.n || '').join(' ')).filter((id) => ILLUS.byId[id].cat !== 'deco');
  const fallback = { 'Pâtisserie': ['fouet', 'farine'], 'Dessert': ['cerises', 'fouet'], 'Gâteau': ['gateau', 'fouet'], 'Biscuits': ['cookies', 'rouleau'], 'Viennoiserie': ['croissant', 'beurre'], 'Petit-déjeuner': ['pancakes', 'cafe'], 'Boisson': ['citronnade', 'citron-tranche'], 'Soupe': ['soupe', 'carottes'], 'Salade': ['salade', 'tomate'], 'Apéritif': ['vin', 'fromage'], 'Sauce': ['casserole', 'basilic'] }[r.category] || ['ustensiles', 'basilic'];
  const pool = [...new Set([...sugg, ...fallback])];
  const out = await CARD.render(r, {});
  const A = out.anchors; const W = CARD.W;
  const st = [];
  if (pool[0]) st.push({ id: pool[0], x: 0.83, y: (A.titleTop + 30) / W, s: 0.24, r: 8 });
  if (pool[1]) {
    if (A.photoBottom) st.push({ id: pool[1], x: 0.13, y: (A.photoBottom - 10) / W, s: 0.2, r: -10 });
    else if (A.stepsTop) st.push({ id: pool[1], x: 0.86, y: (A.height - 200) / W, s: 0.2, r: -6 });
  }
  return st;
}

/* =========================================================
   Réglages
   ========================================================= */
function openSettings() {
  const sh = openSheet(`
    <h2 class="sheet-title">Réglages</h2>
    <label class="field"><span class="overline">Signature en bas des fiches</span><input id="set-sign" value="${esc(prefs.signature)}" placeholder="Le carnet de …"></label>
    <div class="set-block">
      <span class="overline">Sauvegarde</span>
      <p class="hint">Tes recettes sont enregistrées uniquement sur ce téléphone. Pense à faire une sauvegarde de temps en temps (Fichiers, iCloud Drive, mail…).</p>
      <div class="add-row">
        <button class="btn small" id="set-export">${ICON.download}<span>Sauvegarder</span></button>
        <label class="btn small">${ICON.plus}<span>Restaurer</span><input type="file" id="set-import" accept="application/json,.json" hidden></label>
      </div>
    </div>
    <div class="set-block">
      <span class="overline">Sur l'écran d'accueil</span>
      <p class="hint">Dans Safari : Partager puis « Sur l'écran d'accueil ». L'appli s'ouvre en plein écran et fonctionne sans réseau.</p>
    </div>
    <p class="version">Carnet de recettes · v${APP_VERSION}</p>`);
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
  const data = JSON.stringify({ app: 'carnet-recettes', version: 2, date: new Date().toISOString(), recipes });
  const d = new Date();
  const name = `recettes-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
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
  // anciennes fiches (v1) : on remet le papier par défaut
  recipes.forEach((r) => { if (!CARD.THEMES[r.theme]) r.theme = 'ivoire'; });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  CARD.loadFonts();
  route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
