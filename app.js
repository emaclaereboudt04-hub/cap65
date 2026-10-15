'use strict';

/* =========================================================
   Cap 65 : suivi calories, protéines, cardio, défi et poids
   Données 100 % locales (localStorage), export/import JSON.
   ========================================================= */

const STORE_KEY = 'cap65-data-v1';
const MOMENTS = ['Matin', 'Midi', 'En-cas', 'Soir'];
const ACTIVITIES = [
  { n: 'Vélo', e: '🚴‍♀️' },
  { n: 'Elliptique', e: '🏃‍♀️' },
  { n: 'Rameur', e: '🚣‍♀️' },
  { n: 'Marche inclinée', e: '⛰️' },
  { n: 'Circuit machines', e: '🏋️‍♀️' },
  { n: 'Cours collectif', e: '💃' },
];
const ECARTS = { soda: { e: '🥤', l: 'Soda' }, ff: { e: '🍔', l: 'Fast-food' } };
const MIN_KCAL = 1500;
const WEEK1 = '2026-10-19'; // lundi de la semaine 1 du défi

const DEFAULT_FOODS = [
  ['Yaourt grec 0 % citron', '150 g', 130, 15, null],
  ['Yaourt grec entier citron', '150 g', 200, 9, null],
  ['Wrap poulet crudités', '1 wrap', 450, 35, null],
  ['Pâtes tomate poulet', '70 g crues', 550, 38, null],
  ['Riz poulet courgettes', '1 assiette', 500, 38, null],
  ['½ burrata + tomates', '1 assiette', 320, 16, null],
  ['Escalope de poulet grillée', '120 g', 190, 36, null],
  ['Feuilleté boulangerie', '1 pièce', 350, 8, null],
  ['Pomme ou fruit', '1 fruit', 80, 0, null],
  ['Champignons et haricots verts poêlés', '1 portion', 120, 6, null],
  ['Soda', '33 cl', 140, 0, 'soda'],
  ['Soda zéro', '33 cl', 1, 0, null],
  ['Pizza commandée', '½ pizza', 850, 35, 'ff'],
  ['Burger frites commandé', '1 menu', 1100, 40, 'ff'],
  ['Tacos / kebab commandé', '1 portion', 1000, 40, 'ff'],
];

/* ---------------- Utils ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n, d = 0) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const nf1 = (n) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const mondayOf = (k) => { const d = parseKey(k); const wd = (d.getDay() + 6) % 7; return addDays(k, -wd); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
const weekIndex = (k) => Math.floor(daysBetween(WEEK1, mondayOf(k)) / 7) + 1;
const DAY_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const fmtDay = (k, opts) => parseKey(k).toLocaleDateString('fr-FR', opts);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtShort = (k) => fmtDay(k, { day: 'numeric', month: 'short' });
const fmtLong = (k) => fmtDay(k, { day: 'numeric', month: 'long', year: 'numeric' });
const weekRange = (mon) => `${fmtDay(mon, { day: 'numeric' })} – ${fmtShort(addDays(mon, 6))}`;
const defaultMoment = () => { const h = new Date().getHours(); return h < 11 ? 'Matin' : h < 15 ? 'Midi' : h < 18 ? 'En-cas' : 'Soir'; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const norm = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const matches = (q, ...fields) => { const n = norm(q).trim(); return !n || n.split(/\s+/).every((w) => fields.some((f) => norm(f).includes(w))); };

/* ---------------- State ---------------- */
function freshState() {
  return {
    version: 1,
    settings: { kcal: 1750, prot: 110, water: 8, startWeight: 76, targetWeight: 65, startDate: todayKey() },
    foods: DEFAULT_FOODS.map(([name, portion, kcal, prot, ecart]) => ({ id: uid(), name, portion, kcal, prot, ecart, fav: false })),
    days: {},
    weights: [],
    quotas: {},
    celebrated: {},
    recipes: [],
    measures: [],
    plan: {},
    shop: {},
    cycle: { enabled: false, hormonal: false, len: 28, plen: 5, starts: [], sym: {} },
    sport: { adjust: 0, days: {}, hist: {}, live: null },
  };
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    const s = JSON.parse(raw);
    const base = freshState();
    return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) }, sport: { ...base.sport, ...(s.sport || {}) }, recipes: s.recipes || [], measures: s.measures || [], plan: s.plan || {}, shop: s.shop || {}, cycle: { ...base.cycle, ...(s.cycle || {}) } };
  } catch (e) {
    return freshState();
  }
}
let S = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { toast('Impossible d\'enregistrer : stockage plein ?'); }
}
save();

const ui = { tab: 'today', day: todayKey(), foodQuery: '', repas: 'foods', suivi: 'poids', shopWeek: 'this', baseQuery: '', baseCat: '', justDone: new Set() };

/* ---------------- Calculs ---------------- */
function dayOf(k) { return S.days[k] || { meals: [], cardio: [], water: 0 }; }
const GLASS_ML = 250;
function waterGoal(k) { return S.settings.water + (dayOf(k).cardio.length ? 1 : 0); }
function waterOk(k) { return (dayOf(k).water || 0) >= waterGoal(k); }
function waterStreak() {
  let k = todayKey(), n = 0;
  if (!waterOk(k)) k = addDays(k, -1);
  while (waterOk(k)) { n++; k = addDays(k, -1); }
  return n;
}
const liters = (glasses) => ((glasses * GLASS_ML) / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' L';
function ensureDay(k) { if (!S.days[k]) S.days[k] = { meals: [], cardio: [] }; return S.days[k]; }
function totals(k) {
  const d = dayOf(k);
  const eaten = Math.round(d.meals.reduce((a, m) => a + m.kcal * m.qty, 0));
  const prot = Math.round(d.meals.reduce((a, m) => a + m.prot * m.qty, 0));
  const cardio = Math.round(d.cardio.reduce((a, c) => a + c.kcal, 0));
  const bonus = Math.round(cardio / 2);
  const budget = S.settings.kcal + bonus;
  return { eaten, prot, cardio, bonus, budget, remaining: budget - eaten, logged: d.meals.length > 0 };
}
function defaultQuota(w) { return { soda: w >= 3 ? 0 : 1, ff: 1 }; }
function quotaFor(w) { const wq = Math.max(1, w); return { ...defaultQuota(wq), ...(S.quotas[wq] || {}) }; }

function weekStats(mon) {
  const w = weekIndex(mon);
  const q = quotaFor(w);
  const used = { soda: 0, ff: 0 };
  const ecartList = [];
  let cardio = 0, protDays = 0, under = 0, logged = 0, waterDays = 0;
  const dots = [];
  for (let i = 0; i < 7; i++) {
    const k = addDays(mon, i);
    const d = dayOf(k);
    const t = totals(k);
    d.meals.forEach((m) => { if (m.ecart && used[m.ecart] !== undefined) { used[m.ecart]++; ecartList.push({ k, m }); } });
    cardio += d.cardio.filter((c) => c.kind !== 'renfo').length;
    if (t.prot >= S.settings.prot) protDays++;
    if (waterOk(k)) waterDays++;
    if (t.logged) { logged++; if (t.eaten <= t.budget) under++; }
    dots.push({ k, state: !t.logged ? 'none' : t.eaten <= t.budget ? 'under' : 'over', water: waterOk(k), glasses: d.water || 0 });
  }
  const weighIns = S.weights.filter((x) => x.date >= mon && x.date <= addDays(mon, 6)).length;
  const goals = [
    { id: 'cardio', label: '4 séances de cardio', val: cardio, target: 4, done: cardio >= 4 },
    { id: 'pesee', label: '1 pesée', val: weighIns, target: 1, done: weighIns >= 1 },
    { id: 'prot', label: 'Protéines atteintes 4 jours sur 7', val: protDays, target: 4, done: protDays >= 4 },
    { id: 'eau', label: `${liters(S.settings.water)} d'eau 5 jours sur 7`, val: waterDays, target: 5, done: waterDays >= 5 },
  ];
  const ecartsOk = used.soda <= q.soda && used.ff <= q.ff;
  const goalsDone = goals.filter((g) => g.done).length;
  return { w, mon, q, used, ecartList, goals, goalsDone, ecartsOk, success: ecartsOk && goalsDone === goals.length, under, logged, dots, waterDays };
}

/* ---------------- Catalogue (liste, recettes, base) ---------------- */
function catalogItem(key) {
  const [t, id] = [key.slice(0, 1), key.slice(2)];
  if (t === 'f') { const f = S.foods.find((x) => x.id === id); return f && { name: f.name, portion: f.portion, kcal: f.kcal, prot: f.prot, ecart: f.ecart || null }; }
  if (t === 'r') { const r = S.recipes.find((x) => x.id === id); return r && { name: r.name, portion: 'ma part', kcal: r.kcal, prot: r.prot, ecart: null, moment: r.moment }; }
  if (t === 's') { const d = SOLO_RECIPES.find((x) => x.id === id); return d && { name: d.name, portion: 'ma portion', kcal: d.kcal, prot: d.prot, ecart: null, moment: d.moment }; }
  if (t === 'd') { const d = DISHES.find((x) => x.id === id); return d && { name: d.name, portion: 'ma portion', kcal: d.kcal, prot: d.prot, ecart: null, moment: d.moment }; }
  if (t === 'b') { const b = BASE[+id]; return b && { name: b[1], portion: b[2], kcal: b[3], prot: b[4], ecart: b[5] || null }; }
  return null;
}
function searchCatalog(q) {
  return {
    foods: S.foods.filter((f) => matches(q, f.name, f.portion)).map((f) => ['f:' + f.id, f]),
    recipes: S.recipes.filter((r) => matches(q, r.name)).map((r) => ['r:' + r.id, r]),
    dishes: [...SOLO_RECIPES.map((d) => ['s:' + d.id, d]), ...DISHES.map((d) => ['d:' + d.id, d])].filter(([, d]) => matches(q, d.name, d.desc)),
    base: BASE.map((b, i) => [i, b]).filter(([, b]) => matches(q, b[1], b[2], b[0])).map(([i]) => ['b:' + i, catalogItem('b:' + i)]),
  };
}

/* ---------------- Toast & feuille ---------------- */
let toastTimer;
function toast(msg, action) {
  const el = $('#toast');
  el.innerHTML = `<span>${msg}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ''}`;
  el.hidden = false;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  if (action) $('button', el).onclick = () => { action.fn(); el.hidden = true; };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, action ? 5000 : 3200);
}

function openSheet(html, onMount) {
  const sheet = $('#sheet');
  sheet.innerHTML = html;
  sheet.hidden = false;
  $('#sheet-backdrop').hidden = false;
  sheet.scrollTop = 0;
  if (onMount) onMount(sheet);
}
function closeSheet() { $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true; $('#sheet').innerHTML = ''; }
$('#sheet-backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
const sheetHead = (t) => `<div class="sheet-head"><h2>${t}</h2><button class="icon-btn" data-close aria-label="Fermer">✕</button></div>`;
$('#sheet').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });

/* ---------------- Célébrations ---------------- */
function checkCelebrations() {
  const mon = mondayOf(todayKey());
  const st = weekStats(mon);
  const seen = S.celebrated[mon] || (S.celebrated[mon] = {});
  const fresh = [];
  st.goals.forEach((g) => {
    if (g.done && !seen[g.id]) { seen[g.id] = true; fresh.push(g); ui.justDone.add(g.id); }
    if (!g.done && seen[g.id]) delete seen[g.id];
  });
  save();
  return fresh;
}
function celebrateToast(fresh) {
  if (!fresh.length) return false;
  toast(`🎉 Objectif atteint : ${esc(fresh[0].label.toLowerCase())} !`);
  return true;
}
function sparks(el) {
  const colors = ['var(--accent)', 'var(--good)', '#F2B21B'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('i');
    s.className = 'spark';
    const a = (Math.PI * 2 * i) / 10;
    s.style.setProperty('--dx', `${Math.cos(a) * 30}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * 30}px`);
    s.style.background = colors[i % 3];
    el.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

/* ---------------- Navigation ---------------- */
function goTo(target) {
  const [t, sub] = target.split(':');
  if (t === 'suivi') ui.suivi = sub || 'poids';
  if (t === 'repas' && sub) ui.repas = sub;
  go(t);
}
function go(tab) {
  ui.tab = tab;
  $$('.tab').forEach((b) => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
  render();
  window.scrollTo(0, 0);
}
$$('.tab').forEach((b) => b.addEventListener('click', () => go(b.dataset.tab)));

function render() {
  const screen = $('#screen');
  ({ today: renderToday, repas: renderRepas, sport: renderSport, defi: renderDefi, suivi: renderSuivi }[ui.tab])(screen);
}

/* =========================================================
   Écran 1 : Aujourd'hui
   ========================================================= */
function renderToday(el) {
  const k = ui.day;
  const tk = todayKey();
  const t = totals(k);
  const d = dayOf(k);
  const used = t.budget > 0 ? t.eaten / t.budget : 0;
  const cls = used > 1 ? 'over' : used >= 0.85 ? 'warn' : 'ok';
  const C = 2 * Math.PI * 92;
  const off = C * (1 - Math.min(used, 1));
  const protPct = Math.min(100, (t.prot / S.settings.prot) * 100);
  const st = weekStats(mondayOf(k));
  const isToday = k === tk;
  const rel = isToday ? "Aujourd'hui" : k === addDays(tk, -1) ? 'Hier' : k === addDays(tk, 1) ? 'Demain' : '';

  // Bannières (uniquement le jour même)
  let banners = '';
  if (isToday) {
    const now = new Date();
    const wd = now.getDay();
    const mon = mondayOf(tk);
    const weighed = S.weights.some((x) => x.date >= mon && x.date <= addDays(mon, 6));
    if (wd === 0 && now.getHours() >= 18) {
      banners += `<button class="banner" data-go="defi"><span class="b-emoji">✨</span><span>Ton récap de la semaine est prêt</span><span class="b-go">›</span></button>`;
    }
    const wdi = (wd + 6) % 7;
    TONE_SESSIONS.filter((s) => toneDays(s.id).includes(wdi) && !dayOf(tk).cardio.some((c) => c.session === s.id)).forEach((s) => {
      banners += `<button class="banner" data-go="sport"><span class="b-emoji">${s.e}</span><span>Aujourd'hui : séance ${s.title.toLowerCase()} !</span><span class="b-go">›</span></button>`;
    });
    if ((wd === 5 || wd === 6 || wd === 0) && !weighed) {
      banners += `<button class="banner" data-go="suivi:poids"><span class="b-emoji">⚖️</span><span>${wd === 5 ? "C'est vendredi : petite pesée ce matin ?" : 'Pas encore de pesée cette semaine'}</span><span class="b-go">›</span></button>`;
    }
  }

  const tokens = Object.keys(ECARTS).map((type) => {
    const q = st.q[type], u = st.used[type];
    const left = Math.max(q - u, 0);
    const c = u > q ? 'over' : left === 0 ? 'empty' : '';
    return `<span class="token ${c}">${ECARTS[type].e} ${left}/${q}</span>`;
  }).join('');

  const meals = MOMENTS.map((mo) => {
    const items = d.meals.filter((m) => m.moment === mo);
    if (!items.length) return '';
    const sum = Math.round(items.reduce((a, m) => a + m.kcal * m.qty, 0));
    return `<div class="moment"><div class="moment-head"><span>${mo}</span><span>${nf(sum)} kcal</span></div>
      <div class="list">${items.map((m) => `
        <div class="item">
          <div class="item-main">
            <div class="item-name">${esc(m.name)}${m.ecart ? `<span class="badge">${ECARTS[m.ecart].e} écart</span>` : ''}</div>
            <div class="item-sub">${m.qty !== 1 ? `×${nf1(m.qty)} · ` : ''}${m.portion ? esc(m.portion) + ' · ' : ''}${nf(m.prot * m.qty)} g prot.</div>
          </div>
          <div class="item-kcal">${nf(m.kcal * m.qty)} <small>kcal</small></div>
          <button class="icon-btn" data-del-meal="${m.id}" aria-label="Supprimer ${esc(m.name)}">✕</button>
        </div>`).join('')}</div></div>`;
  }).join('');

  const cardio = d.cardio.length ? `<div class="moment"><div class="moment-head"><span>Sport</span><span>+${nf(t.bonus)} kcal au budget</span></div>
    <div class="list">${d.cardio.map((c) => `
      <div class="item">
        <div class="item-main">
          <div class="item-name">${(ACTIVITIES.find((a) => a.n === c.act) || TONE_SESSIONS.find((t) => t.id === c.session) || {}).e || '💪'} ${esc(c.act)}</div>
          <div class="item-sub">${nf(c.min)} min · ${nf(c.kcal)} kcal machine</div>
        </div>
        <div class="item-kcal">+${nf(Math.round(c.kcal / 2))} <small>kcal</small></div>
        <button class="icon-btn" data-del-cardio="${c.id}" aria-label="Supprimer ${esc(c.act)}">✕</button>
      </div>`).join('')}</div>
    <div class="explain">💡 Seule la moitié des calories affichées par la machine est ajoutée à ton budget : les machines surestiment souvent la dépense, et ça protège ta progression.</div></div>` : '';

  const empty = !d.meals.length && !d.cardio.length
    ? `<div class="card empty-state"><span class="big">🍽️</span>Rien de noté pour ${isToday ? "aujourd'hui" : 'ce jour'}.<br>Ajoute ton premier repas en un tap.</div>` : '';

  el.innerHTML = `
    <div class="daynav">
      <button class="icon-btn" data-day="-1" aria-label="Jour précédent">‹</button>
      <div class="day-label">
        <strong>${cap(fmtDay(k, { weekday: 'long', day: 'numeric', month: 'short' }))}</strong>
        ${isToday ? `<button disabled>${rel}</button>` : `<button class="is-link" data-day="0">${rel ? rel + ' · ' : ''}Revenir à aujourd'hui</button>`}
      </div>
      <button class="icon-btn" data-day="1" aria-label="Jour suivant">›</button>
    </div>
    ${banners}${isToday ? cycleChip() : ''}
    <div class="card ring-card">
      <div class="ring-wrap">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <circle class="ring-track" cx="110" cy="110" r="92"/>
          <circle class="ring-val ${cls}" cx="110" cy="110" r="92" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${off}"/>
        </svg>
        <div class="ring-center ${t.remaining < 0 ? 'over' : ''}">
          <div class="ring-num">${nf(Math.abs(t.remaining))}</div>
          <div class="ring-lbl">${t.remaining < 0 ? 'kcal au-dessus' : 'kcal restantes'}</div>
        </div>
      </div>
      <div class="ring-stats">
        <div><b>${nf(S.settings.kcal)}</b><span>Objectif</span></div>
        <div><b>${nf(t.eaten)}</b><span>Mangé</span></div>
        <div><b>+${nf(t.bonus)}</b><span>Cardio (½)</span></div>
      </div>
    </div>
    <div class="card">
      <div class="bar-head"><strong>Protéines</strong><span>${nf(t.prot)} / ${nf(S.settings.prot)} g</span></div>
      <div class="bar"><i class="${t.prot >= S.settings.prot ? 'done' : ''}" data-w="${protPct}"></i></div>
      <div class="bar-head" style="margin:14px 0 0"><strong class="small muted">${st.w >= 1 ? `Écarts semaine ${st.w}` : 'Écarts (rodage)'}</strong><div class="tokens">${tokens}</div></div>
    </div>
    <div class="card" id="water">${waterInner(k)}</div>
    ${isToday && plannedToday().length ? `<div class="card"><h2>🗓️ Prévu aujourd'hui</h2>${plannedToday().map(({ d, key }) => `<div class="plan-today"><span>${esc(d.e || '🍽️')} ${esc(d.name)} <small class="muted">· ${nf(d.kcal)} kcal</small></span><button class="btn btn-sm btn-soft" data-plan-add="${key}">＋ Ajouter</button></div>`).join('')}</div>` : ''}
    <div class="actions">
      <button class="btn btn-primary" data-add="meal">＋ Repas</button>
      <button class="btn btn-soft" data-add="cardio">＋ Cardio</button>
    </div>
    ${empty}${meals}${cardio}`;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    const ring = $('.ring-val', el); if (ring) ring.style.strokeDashoffset = ring.dataset.off;
    $$('[data-w]', el).forEach((b) => { b.style.width = b.dataset.w + '%'; });
  }));

  $$('[data-day]', el).forEach((b) => b.addEventListener('click', () => {
    const n = +b.dataset.day;
    ui.day = n === 0 ? todayKey() : addDays(ui.day, n);
    render();
  }));
  $$('[data-go]', el).forEach((b) => b.addEventListener('click', () => goTo(b.dataset.go)));
  $$('[data-plan-add]', el).forEach((b) => b.onclick = () => openQuickAdd(catalogItem(b.dataset.planAdd)));
  bindWater($('#water', el), k);
  $('[data-add="meal"]', el).addEventListener('click', () => openMealSheet());
  $('[data-add="cardio"]', el).addEventListener('click', openCardioSheet);
  $$('[data-del-meal]', el).forEach((b) => b.addEventListener('click', () => deleteEntry('meals', b.dataset.delMeal)));
  $$('[data-del-cardio]', el).forEach((b) => b.addEventListener('click', () => deleteEntry('cardio', b.dataset.delCardio)));
}

const DROP = '<svg viewBox="0 0 24 24"><path d="M12 3.2s-6.2 6.6-6.2 11.1a6.2 6.2 0 0 0 12.4 0C18.2 9.8 12 3.2 12 3.2z"/></svg>';
function waterInner(k) {
  const goal = waterGoal(k), n = dayOf(k).water || 0;
  const slots = Math.max(goal, n);
  const ok = n >= goal;
  return `<div class="bar-head"><strong>💧 Eau</strong><span>${liters(n)} / ${liters(goal)}${ok ? ' ✓' : ''}</span></div>
    <div class="glasses">${Array.from({ length: slots }, (_, i) => `<button class="glass ${i < n ? 'full' : ''} ${i >= S.settings.water ? 'bonus' : ''}" data-glass="${i}" aria-label="Verre ${i + 1}">${DROP}</button>`).join('')}</div>
    <div class="water-actions">
      <button class="btn btn-sm" data-water="-1" aria-label="Retirer un verre">−</button>
      <button class="btn btn-sm btn-water" data-water="1">＋ 1 verre (25 cl)</button>
    </div>
    <p class="field-hint">${dayOf(k).cardio.length ? '+1 verre bonus aujourd\'hui : jour de sport 💪' : 'Objectif : ' + liters(S.settings.water) + ' par jour, +1 verre les jours de sport.'}${waterStreak() > 1 ? ` · 🔥 ${waterStreak()} jours d'affilée` : ''}</p>`;
}
function bindWater(card, k) {
  const set = (n, tapped) => {
    const before = waterOk(k);
    ensureDay(k).water = Math.max(0, Math.min(20, n));
    save();
    const fresh = checkCelebrations();
    card.innerHTML = waterInner(k);
    bindWater(card, k);
    if (tapped !== undefined) { const g = $(`[data-glass="${tapped}"]`, card); if (g) g.classList.add('pop'); }
    if (!celebrateToast(fresh) && !before && waterOk(k)) toast('💧 Objectif eau atteint, bravo !');
  };
  $$('[data-glass]', card).forEach((b) => b.onclick = () => {
    const i = +b.dataset.glass, n = dayOf(k).water || 0;
    set(i < n ? i : i + 1, i);
  });
  $$('[data-water]', card).forEach((b) => b.onclick = () => { const n = (dayOf(k).water || 0) + +b.dataset.water; set(n, +b.dataset.water > 0 ? n - 1 : undefined); });
}

function deleteEntry(kind, id) {
  const k = ui.day;
  const d = ensureDay(k);
  const idx = d[kind].findIndex((x) => x.id === id);
  if (idx < 0) return;
  const [removed] = d[kind].splice(idx, 1);
  save(); checkCelebrations(); render();
  toast(`${esc(removed.name || removed.act)} supprimé`, {
    label: 'Annuler',
    fn: () => { ensureDay(k)[kind].splice(idx, 0, removed); save(); checkCelebrations(); render(); },
  });
}

function addMeal(k, meal) {
  const before = weekStats(mondayOf(k));
  ensureDay(k).meals.push({ id: uid(), qty: 1, ...meal });
  save();
  const fresh = checkCelebrations();
  render();
  if (meal.ecart) {
    const type = meal.ecart;
    const after = weekStats(mondayOf(k));
    const q = after.q[type], u = after.used[type];
    if (u > q) {
      toast(pick([
        `${ECARTS[type].e} Un écart de plus que prévu, ce n'est pas grave. Une semaine se juge sur la tendance, pas sur un repas 💛`,
        `${ECARTS[type].e} Jeton dépassé, et alors ? Tu continues de noter, c'est ça qui compte. On reprend tranquillement au prochain repas.`,
        `${ECARTS[type].e} Petit dépassement noté. Savoure-le sans culpabiliser : demain est un nouveau jour 🌱`,
      ]));
      return;
    }
    if (before.used[type] < before.q[type]) {
      toast(`${ECARTS[type].e} Jeton ${ECARTS[type].l.toLowerCase()} utilisé : profite bien ! (${q - u}/${q} restant)`);
      return;
    }
  }
  if (!celebrateToast(fresh)) toast(`Ajouté : ${esc(meal.name)} ✓${k !== todayKey() ? ` (${fmtShort(k)})` : ''}`);
}

function openMealSheet() {
  let mode = 'list', moment = defaultMoment(), qty = 1, query = '';
  const qtys = [0.5, 1, 1.5, 2];
  const momentChips = () => MOMENTS.map((m) => `<button class="chip" data-moment="${m}" aria-pressed="${m === moment}">${m}</button>`).join('');
  const qtyChips = () => qtys.map((q) => `<button class="chip" data-qty="${q}" aria-pressed="${q === qty}">×${nf1(q)}</button>`).join('');
  const row = ([key, f]) => `
      <button class="item pick-item" data-food="${key}">
        <div class="item-main">
          <div class="item-name">${f.fav ? '⭐ ' : f.e ? f.e + ' ' : ''}${esc(f.name)}${f.ecart ? `<span class="badge">${ECARTS[f.ecart].e}</span>` : ''}</div>
          <div class="item-sub">${esc(f.portion || (key[0] === 'b' ? '' : 'ma part'))} · ${nf(f.kcal * qty)} kcal · ${nf(f.prot * qty)} g prot.</div>
        </div>
        <span class="pick-plus">＋</span>
      </button>`;
  const foodsHtml = () => {
    const r = searchCatalog(query);
    if (!query.trim()) {
      return `<div class="list">${r.foods.map(row).join('')}</div>
        <p class="field-hint" style="text-align:center">🔎 Tape un nom pour chercher aussi dans la base de ${BASE.length} plats et dans les recettes.</p>`;
    }
    const sec = (title, arr, max = 40) => arr.length ? `<div class="moment-head" style="padding-top:12px"><span>${title}</span><span>${arr.length}</span></div><div class="list">${arr.slice(0, max).map(row).join('')}</div>` : '';
    const html = sec('Ma liste', r.foods) + sec('Mes recettes', r.recipes) + sec('Idées recettes', r.dishes) + sec('Base de plats', r.base);
    return html || `<div class="empty-state">Rien trouvé pour « ${esc(query)} ».<br><button class="btn btn-sm btn-soft" data-free style="margin-top:10px">Saisie libre</button></div>`;
  };
  const body = () => mode === 'list' ? `
      <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
        <input type="search" id="mq" placeholder="Aliment, plat, recette…" value="${esc(query)}" autocomplete="off" enterkeyhint="search"></div>
      <div class="pick-list" id="plist">${foodsHtml()}</div>` : `
      <label class="field"><span>Nom</span><input id="fn" placeholder="Ex. : Salade composée" autocomplete="off" enterkeyhint="next"></label>
      <div class="grid2">
        <label class="field"><span>Kcal (×1)</span><input id="fk" inputmode="numeric" placeholder="0"></label>
        <label class="field"><span>Protéines (g)</span><input id="fp" inputmode="decimal" placeholder="0"></label>
      </div>
      <label class="field"><span>Écart ?</span><select id="fe"><option value="">Non</option><option value="soda">🥤 Écart soda</option><option value="ff">🍔 Écart fast-food</option></select></label>
      <label class="check-line"><input type="checkbox" id="fs"> Enregistrer aussi dans ma liste d'aliments</label>
      <p class="error hidden" id="ferr"></p>
      <button class="btn btn-primary btn-block" id="fadd">Ajouter</button>`;
  const draw = (sh) => {
    sh.innerHTML = `${sheetHead('Ajouter un repas')}
      <div class="seg"><button data-mode="list" aria-pressed="${mode === 'list'}">Ma liste</button><button data-mode="free" aria-pressed="${mode === 'free'}">Saisie libre</button></div>
      <div class="group"><div class="group-lbl">Moment</div><div class="chips fill">${momentChips()}</div></div>
      <div class="group"><div class="group-lbl">Quantité</div><div class="chips fill">${qtyChips()}</div></div>
      <div id="mbody">${body()}</div>`;
    bind(sh);
  };
  const bind = (sh) => {
    $$('[data-mode]', sh).forEach((b) => b.onclick = () => { mode = b.dataset.mode; draw(sh); });
    $$('[data-moment]', sh).forEach((b) => b.onclick = () => { moment = b.dataset.moment; $$('[data-moment]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-qty]', sh).forEach((b) => b.onclick = () => {
      qty = +b.dataset.qty; $$('[data-qty]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b));
      if (mode === 'list') { $('#plist', sh).innerHTML = foodsHtml(); bindList(sh); }
    });
    if (mode === 'list') {
      $('#mq', sh).addEventListener('input', (e) => { query = e.target.value; $('#plist', sh).innerHTML = foodsHtml(); bindList(sh); });
      bindList(sh);
    } else {
      $('#fadd', sh).onclick = () => {
        const name = $('#fn', sh).value.trim();
        const kcal = num($('#fk', sh).value);
        const prot = num($('#fp', sh).value || '0');
        const err = $('#ferr', sh);
        if (!name || !Number.isFinite(kcal) || kcal < 0 || !Number.isFinite(prot) || prot < 0) {
          err.textContent = 'Indique au moins un nom et des kcal valides.'; err.classList.remove('hidden'); return;
        }
        const ecart = $('#fe', sh).value || null;
        if ($('#fs', sh).checked) S.foods.push({ id: uid(), name, portion: '1 portion', kcal: Math.round(kcal), prot: Math.round(prot), ecart, fav: false });
        closeSheet();
        addMeal(ui.day, { name, portion: '', kcal: Math.round(kcal), prot: Math.round(prot * 10) / 10, moment, qty, ecart });
      };
    }
  };
  const bindList = (sh) => {
    $$('[data-food]', sh).forEach((b) => b.onclick = () => {
      const f = catalogItem(b.dataset.food);
      if (!f) return;
      closeSheet();
      addMeal(ui.day, { name: f.name, portion: f.portion, kcal: f.kcal, prot: f.prot, moment, qty, ecart: f.ecart || null });
    });
    const fr = $('[data-free]', sh);
    if (fr) fr.onclick = () => { mode = 'free'; draw(sh); setTimeout(() => { const n = $('#fn', sh); if (n) n.value = query; }, 0); };
  };
  openSheet('', draw);
}

function openCardioSheet() {
  let act = ACTIVITIES[0].n;
  openSheet(`${sheetHead('Ajouter du cardio')}
    <div class="group"><div class="group-lbl">Activité</div>
      <div class="act-grid">${ACTIVITIES.map((a, i) => `<button class="chip" data-act="${esc(a.n)}" aria-pressed="${i === 0}"><span>${a.e}</span>${a.n}</button>`).join('')}</div></div>
    <div class="grid2">
      <label class="field"><span>Minutes</span><input id="cm" inputmode="numeric" placeholder="30"></label>
      <label class="field"><span>Kcal machine</span><input id="ck" inputmode="numeric" placeholder="300"></label>
    </div>
    <p class="live" id="clive">Seule la moitié des kcal de la machine compte dans ton budget.</p>
    <p class="error hidden" id="cerr"></p>
    <button class="btn btn-primary btn-block" id="cadd">Ajouter la séance</button>`, (sh) => {
    $$('[data-act]', sh).forEach((b) => b.onclick = () => { act = b.dataset.act; $$('[data-act]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    const live = () => {
      const k = num($('#ck', sh).value);
      $('#clive', sh).textContent = Number.isFinite(k) && k > 0
        ? `+${nf(Math.round(k / 2))} kcal ajoutées à ton budget (la moitié de ${nf(k)}), car les machines surestiment souvent la dépense.`
        : 'Seule la moitié des kcal de la machine compte dans ton budget.';
    };
    $('#ck', sh).addEventListener('input', live);
    $('#cadd', sh).onclick = () => {
      const min = num($('#cm', sh).value), kcal = num($('#ck', sh).value);
      if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(kcal) || kcal < 0) {
        const e = $('#cerr', sh); e.textContent = 'Indique les minutes et les kcal affichées.'; e.classList.remove('hidden'); return;
      }
      ensureDay(ui.day).cardio.push({ id: uid(), act, min: Math.round(min), kcal: Math.round(kcal) });
      save(); closeSheet();
      const fresh = checkCelebrations();
      render();
      if (!celebrateToast(fresh)) toast(`💪 Bravo ! +${nf(Math.round(kcal / 2))} kcal dans ton budget`);
    };
  });
}

/* =========================================================
   Écran 2 : Ma liste d'aliments
   ========================================================= */
function sortFoods() {
  // favoris en haut, ordre conservé dans chaque groupe
  S.foods = [...S.foods.filter((f) => f.fav), ...S.foods.filter((f) => !f.fav)];
}
function renderFoods(el) {
  const ql = ui.foodQuery.trim();
  const list = S.foods.filter((f) => matches(ql, f.name, f.portion));
  el.innerHTML = `
    ${repasHead()}
    <p class="subtitle" style="margin:-4px 4px 12px">${S.foods.length} produits · ⭐ favoris en haut</p>
    <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
      <input type="search" id="fq" placeholder="Rechercher…" value="${esc(ui.foodQuery)}" autocomplete="off"></div>
    <button class="btn btn-primary btn-block" id="fnew" style="margin-bottom:14px">＋ Nouveau produit</button>
    <div class="list" id="flist">${list.length ? list.map((f) => {
      const i = S.foods.indexOf(f);
      const canUp = !ql && i > 0 && S.foods[i - 1].fav === f.fav;
      const canDown = !ql && i < S.foods.length - 1 && S.foods[i + 1].fav === f.fav;
      return `<div class="item food-item">
        <button class="icon-btn star ${f.fav ? 'on' : ''}" data-fav="${f.id}" aria-label="${f.fav ? 'Retirer des favoris' : 'Mettre en favori'}">${f.fav ? '★' : '☆'}</button>
        <div class="item-main" data-edit="${f.id}" role="button" tabindex="0">
          <div class="item-name">${esc(f.name)}${f.ecart ? `<span class="badge">${ECARTS[f.ecart].e} écart</span>` : ''}</div>
          <div class="item-sub">${esc(f.portion)} · ${nf(f.kcal)} kcal · ${nf(f.prot)} g prot.</div>
        </div>
        <div class="reorder">
          <button class="icon-btn" data-up="${f.id}" aria-label="Monter" ${canUp ? '' : 'disabled style="opacity:.25"'}>▲</button>
          <button class="icon-btn" data-down="${f.id}" aria-label="Descendre" ${canDown ? '' : 'disabled style="opacity:.25"'}>▼</button>
        </div>
      </div>`;
    }).join('') : '<div class="empty-state">Aucun produit trouvé.</div>'}</div>
    <p class="field-hint" style="text-align:center;margin-top:12px">Touche un produit pour le modifier, le marquer « écart » ou le supprimer.</p>`;

  bindRepasHead(el);
  $('#fq', el).addEventListener('input', (e) => {
    ui.foodQuery = e.target.value;
    const pos = e.target.selectionStart;
    renderFoods(el);
    const inp = $('#fq', el); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  $('#fnew', el).onclick = () => openFoodSheet(null);
  $$('[data-edit]', el).forEach((b) => b.onclick = () => openFoodSheet(b.dataset.edit));
  $$('[data-fav]', el).forEach((b) => b.onclick = () => {
    const f = S.foods.find((x) => x.id === b.dataset.fav);
    f.fav = !f.fav;
    if (f.fav) { S.foods = S.foods.filter((x) => x !== f); const lastFav = S.foods.filter((x) => x.fav).length; S.foods.splice(lastFav, 0, f); }
    sortFoods(); save(); renderFoods(el);
  });
  const move = (id, dir) => {
    const i = S.foods.findIndex((x) => x.id === id), j = i + dir;
    if (j < 0 || j >= S.foods.length || S.foods[j].fav !== S.foods[i].fav) return;
    [S.foods[i], S.foods[j]] = [S.foods[j], S.foods[i]];
    save(); renderFoods(el);
  };
  $$('[data-up]', el).forEach((b) => b.onclick = () => move(b.dataset.up, -1));
  $$('[data-down]', el).forEach((b) => b.onclick = () => move(b.dataset.down, 1));
}

function openFoodSheet(id) {
  const f = id ? S.foods.find((x) => x.id === id) : { name: '', portion: '', kcal: '', prot: '', ecart: null, fav: false };
  openSheet(`${sheetHead(id ? 'Modifier le produit' : 'Nouveau produit')}
    <label class="field"><span>Nom</span><input id="en" value="${esc(f.name)}" placeholder="Ex. : Skyr nature" autocomplete="off"></label>
    <label class="field"><span>Portion</span><input id="eo" value="${esc(f.portion)}" placeholder="Ex. : 150 g" autocomplete="off"></label>
    <div class="grid2">
      <label class="field"><span>Kcal</span><input id="ek" inputmode="numeric" value="${esc(f.kcal)}"></label>
      <label class="field"><span>Protéines (g)</span><input id="ep" inputmode="decimal" value="${esc(f.prot)}"></label>
    </div>
    <div class="group"><div class="group-lbl">Marqué « écart » ?</div>
      <div class="chips fill">
        <button class="chip" data-ec="" aria-pressed="${!f.ecart}">Non</button>
        <button class="chip" data-ec="soda" aria-pressed="${f.ecart === 'soda'}">🥤 Soda</button>
        <button class="chip" data-ec="ff" aria-pressed="${f.ecart === 'ff'}">🍔 Fast-food</button>
      </div></div>
    <p class="error hidden" id="eerr"></p>
    <button class="btn btn-primary btn-block" id="esave">${id ? 'Enregistrer' : 'Ajouter à ma liste'}</button>
    ${id ? '<button class="btn btn-danger btn-block" id="edel" style="margin-top:10px">Supprimer ce produit</button>' : ''}`, (sh) => {
    let ecart = f.ecart || null;
    $$('[data-ec]', sh).forEach((b) => b.onclick = () => { ecart = b.dataset.ec || null; $$('[data-ec]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $('#esave', sh).onclick = () => {
      const name = $('#en', sh).value.trim();
      const kcal = num($('#ek', sh).value), prot = num($('#ep', sh).value || '0');
      if (!name || !Number.isFinite(kcal) || kcal < 0 || !Number.isFinite(prot) || prot < 0) {
        const e = $('#eerr', sh); e.textContent = 'Nom et kcal obligatoires.'; e.classList.remove('hidden'); return;
      }
      const data = { name, portion: $('#eo', sh).value.trim() || '1 portion', kcal: Math.round(kcal), prot: Math.round(prot * 10) / 10, ecart };
      if (id) Object.assign(f, data); else S.foods.push({ id: uid(), fav: false, ...data });
      sortFoods(); save(); closeSheet(); render();
      toast(id ? 'Produit modifié ✓' : 'Produit ajouté à ta liste ✓');
    };
    if (id) $('#edel', sh).onclick = () => {
      const idx = S.foods.indexOf(f);
      S.foods.splice(idx, 1); save(); closeSheet(); render();
      toast(`${esc(f.name)} supprimé`, { label: 'Annuler', fn: () => { S.foods.splice(idx, 0, f); save(); render(); } });
    };
  });
}

/* =========================================================
   Écran 3 : Défi de la semaine
   ========================================================= */
function goalsHtml(st, animate) {
  return st.goals.map((g) => `
    <div class="goal ${g.done ? 'done' : ''} ${animate && g.done && ui.justDone.has(g.id) ? 'pop' : ''}" data-goal="${g.id}">
      <div class="goal-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
      <div class="goal-main"><strong>${g.label}</strong><span>${g.done ? 'Coché automatiquement ✓' : `Encore ${g.target - Math.min(g.val, g.target)}`}</span></div>
      <div class="goal-count">${Math.min(g.val, 7)}/${g.target}</div>
    </div>`).join('');
}
function recapHtml(st, title) {
  const ecartsTxt = Object.keys(ECARTS).map((t) => `${ECARTS[t].e} ${st.used[t]}/${st.q[t]}`).join(' · ');
  const msg = st.success
    ? 'Tous les objectifs sont cochés et les écarts respectés. Tu peux être fière de toi 👏'
    : st.goalsDone >= 2 || st.ecartsOk
      ? `Pas tout à fait, mais ${st.goalsDone} objectif${st.goalsDone > 1 ? "s" : ""} sur ${st.goals.length}${st.ecartsOk ? ' et des écarts maîtrisés' : ''} : c'est une vraie base. La semaine prochaine, on vise juste un petit cran de plus.`
      : 'Semaine plus compliquée : ça arrive à tout le monde. Tu as continué à noter, et c\'est la meilleure chose à faire. On repart lundi, tranquillement 🌱';
  return `<div class="card recap">
    <h2>${title}</h2>
    <div class="recap-big">${st.success ? '🏆 Défi réussi !' : '🌱 Défi pas encore réussi'}</div>
    <p class="muted small" style="margin:0 0 8px">${msg}</p>
    <div class="tokens">
      <span class="token">📅 ${st.under}/7 jours sous l'objectif</span>
      <span class="token">✅ ${st.goalsDone}/${st.goals.length} objectifs</span>
      <span class="token ${st.ecartsOk ? '' : 'over'}">${ecartsTxt}</span>
    </div></div>`;
}
function renderDefi(el) {
  const tk = todayKey();
  const mon = mondayOf(tk);
  const st = weekStats(mon);
  const rodage = st.w < 1;
  const now = new Date();
  const showRecap = now.getDay() === 0 && now.getHours() >= 18;

  const bigTokens = Object.keys(ECARTS).map((type) => {
    const q = st.q[type], u = st.used[type], left = Math.max(q - u, 0);
    const c = u > q ? 'over' : left === 0 ? 'empty' : '';
    const sub = q === 0 ? (type === 'soda' ? 'Version zéro 😉' : 'Aucun cette semaine') : `${ECARTS[type].l} restant${left > 1 ? 's' : ''}`;
    return `<div class="token token-big ${c}"><span class="t-emoji">${ECARTS[type].e}</span><span class="t-count">${left}/${q}</span><span class="t-lbl">${sub}</span></div>`;
  }).join('');
  const over = Object.keys(ECARTS).filter((t) => st.used[t] > st.q[t]);
  const overMsg = over.length ? `<div class="kind">💛 ${over.map((t) => ECARTS[t].e).join(' ')} Un écart de plus que prévu cette semaine : aucun souci. Ce qui compte, c'est que tu continues à noter et à bouger. Le compteur repart à zéro lundi.</div>` : '';
  const ecartList = st.ecartList.length ? `<div class="small muted" style="margin-top:10px">${st.ecartList.map(({ k, m }) => `${ECARTS[m.ecart].e} ${esc(m.name)} · ${fmtDay(k, { weekday: 'short' })}`).join('<br>')}</div>` : '';

  const dots = st.dots.map((d, i) => `<div>${DAY_SHORT[i]}<i class="${d.state} ${d.k === tk ? 'today' : ''}">${d.state === 'under' ? '✓' : d.state === 'over' ? '!' : ''}</i></div>`).join('');

  // Quotas à venir
  const firstEditable = Math.max(1, st.w + 1);
  const quotaRows = [0, 1, 2, 3].map((i) => {
    const w = firstEditable + i;
    const q = quotaFor(w);
    const monW = addDays(WEEK1, (w - 1) * 7);
    const custom = !!S.quotas[w];
    return `<div class="quota-row">
      <div class="q-week">Semaine ${w}<small>${weekRange(monW)}${custom ? ' · perso' : ''}</small></div>
      <div class="q-ctrl">
        <span>🥤</span><span class="stepper"><button data-q="${w}:soda:-1" aria-label="Moins de soda">−</button><b>${q.soda}</b><button data-q="${w}:soda:1" aria-label="Plus de soda">+</button></span>
        <span>🍔</span><span class="stepper"><button data-q="${w}:ff:-1" aria-label="Moins de fast-food">−</button><b>${q.ff}</b><button data-q="${w}:ff:1" aria-label="Plus de fast-food">+</button></span>
      </div></div>`;
  }).join('');

  // Historique
  const firstMon = mondayOf(S.settings.startDate < WEEK1 ? S.settings.startDate : WEEK1);
  const hist = [];
  for (let m = addDays(mon, -7); m >= firstMon; m = addDays(m, -7)) hist.push(weekStats(m));
  const histHtml = hist.length ? `<div class="list">${hist.map((h) => `
    <div class="hist">
      <div class="hist-icon ${h.success ? 'win' : ''}">${h.success ? '🏆' : '🌱'}</div>
      <div class="item-main">
        <div class="item-name">${h.w >= 1 ? `Semaine ${h.w}` : 'Rodage'} · ${weekRange(h.mon)}</div>
        <div class="item-sub">${h.success ? 'Réussi' : 'Pas réussi'} · ${h.goalsDone}/${h.goals.length} objectifs · ${h.under}/7 jours sous l'objectif · 🥤 ${h.used.soda}/${h.q.soda} 🍔 ${h.used.ff}/${h.q.ff}</div>
      </div></div>`).join('')}</div>` : `<div class="card empty-state">Tes semaines terminées apparaîtront ici.</div>`;

  el.innerHTML = `
    <div class="topbar"><div><h1 class="title">Défi de la semaine</h1>
      <p class="subtitle"><span class="week-pill">${rodage ? 'Rodage' : `Semaine ${st.w}`}</span> &nbsp;${weekRange(mon)}</p></div></div>
    ${rodage ? `<div class="banner"><span class="b-emoji">🚀</span><span>Le défi démarre le lundi ${fmtDay(WEEK1, { day: 'numeric', month: 'long' })}. Cette semaine sert d'entraînement : tout est déjà suivi.</span></div>` : ''}
    ${showRecap ? recapHtml(st, 'Récap de ta semaine') : ''}
    <div class="card">
      <h2>Mes jetons d'écart</h2>
      <div class="tokens">${bigTokens}</div>
      ${overMsg}${ecartList}
    </div>
    <div class="card" id="goals">
      <h2>Objectifs de la semaine</h2>
      ${goalsHtml(st, true)}
    </div>
    <div class="card">
      <h2>Jours sous l'objectif calorique <span class="muted small">· ${st.under}/7</span></h2>
      <div class="week-dots">${dots}</div>
    </div>
    <div class="card">
      <h2>Défi eau 💧 <span class="muted small">· ${st.waterDays}/7 jours</span></h2>
      <p class="muted small" style="margin:-6px 0 4px">${liters(S.settings.water)} par jour (+1 verre les jours de sport), au moins 5 jours sur 7.${waterStreak() > 1 ? ` 🔥 Série en cours : ${waterStreak()} jours.` : ''}</p>
      <div class="week-dots">${st.dots.map((d, i) => `<div>${DAY_SHORT[i]}<i class="${d.water ? 'water' : ''} ${d.k === tk ? 'today' : ''}">${d.water ? DROP : d.glasses ? d.glasses : ''}</i></div>`).join('')}</div>
    </div>
    <div class="section-title">Quotas des semaines à venir</div>
    <div class="card">
      ${quotaRows}
      <p class="field-hint">Par défaut : 1 fast-food par semaine, et à partir de la semaine 3 le soda passe en version zéro (0 jeton soda, le soda zéro n'est pas un écart).</p>
      ${Object.keys(S.quotas).length ? '<button class="btn btn-sm btn-block" id="qreset" style="margin-top:10px">Revenir aux quotas par défaut</button>' : ''}
    </div>
    <div class="section-title">Historique <small>${hist.length} semaine${hist.length > 1 ? 's' : ''}</small></div>
    ${histHtml}`;

  // micro-animation pour les objectifs fraîchement cochés
  $$('.goal.pop', el).forEach((g) => setTimeout(() => sparks($('.goal-check', g)), 150));
  ui.justDone.clear();

  $$('[data-q]', el).forEach((b) => b.onclick = () => {
    const [w, type, d] = b.dataset.q.split(':');
    const cur = quotaFor(+w);
    cur[type] = Math.max(0, Math.min(7, cur[type] + +d));
    const def = defaultQuota(+w);
    if (cur.soda === def.soda && cur.ff === def.ff) delete S.quotas[w]; else S.quotas[w] = cur;
    save(); renderDefi(el);
  });
  const qr = $('#qreset', el);
  if (qr) qr.onclick = () => { S.quotas = {}; save(); renderDefi(el); toast('Quotas par défaut rétablis'); };
}

/* =========================================================
   Écran 4 : Poids
   ========================================================= */
function weightSeries() {
  const map = new Map();
  map.set(S.settings.startDate, S.settings.startWeight);
  S.weights.forEach((w) => map.set(w.date, w.kg));
  return [...map.entries()].map(([date, kg]) => ({ date, kg })).sort((a, b) => a.date.localeCompare(b.date));
}
function currentWeight() {
  const ws = [...S.weights].sort((a, b) => a.date.localeCompare(b.date));
  return ws.length ? ws[ws.length - 1].kg : S.settings.startWeight;
}
function realPace() {
  const pts = weightSeries();
  if (pts.length < 2) return null;
  const span = daysBetween(pts[0].date, pts[pts.length - 1].date);
  if (span < 7) return null;
  const xs = pts.map((p) => daysBetween(pts[0].date, p.date));
  const ys = pts.map((p) => p.kg);
  const mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length;
  let sxy = 0, sxx = 0;
  xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
  return { perWeek: (sxy / sxx) * 7, weeks: span / 7 };
}
function etaDate(kgLeft, perWeek) { return addDays(todayKey(), Math.ceil((kgLeft / perWeek) * 7)); }

function renderWeight(el) {
  const s = S.settings;
  const cur = currentWeight();
  const lost = s.startWeight - cur;
  const left = Math.max(0, cur - s.targetWeight);
  const total = s.startWeight - s.targetWeight;
  const pct = total > 0 ? Math.max(0, Math.min(100, (lost / total) * 100)) : 0;
  const pace = realPace();
  const reached = cur <= s.targetWeight;

  let est = '';
  if (reached) {
    est = `<div class="est"><span class="est-emoji">🎯</span><div><strong>Objectif atteint !</strong><span class="muted small">Tu es à ${nf1(cur)} kg. Bravo pour tout ce chemin.</span></div></div>`;
  } else {
    est = `<div class="est"><span class="est-emoji">🗓️</span><div><strong>Vers le ${fmtLong(etaDate(left, 0.5))}</strong><span class="muted small">À 0,5 kg par semaine, il te reste environ ${nf(Math.ceil(left / 0.5))} semaines.</span></div></div>`;
    if (!pace) {
      est += `<div class="est"><span class="est-emoji">📈</span><div><strong>Ton rythme réel</strong><span class="muted small">Disponible dès 2 pesées espacées d'au moins une semaine.</span></div></div>`;
    } else if (pace.perWeek < -0.05) {
      const v = -pace.perWeek;
      const note = v > 1 ? ' C\'est rapide : pense à bien manger tes protéines et à ne pas descendre sous ton objectif kcal.' : v >= 0.3 ? ' Un rythme sain et durable 👌' : ' Doucement mais sûrement 🐢';
      est += `<div class="est"><span class="est-emoji">📉</span><div><strong>Rythme réel : −${nf(v, 2)} kg/semaine</strong><span class="muted small">Sur ${nf1(pace.weeks)} semaines. À ce rythme : arrivée vers le ${fmtLong(etaDate(left, v))}.${note}</span></div></div>`;
    } else {
      est += `<div class="est"><span class="est-emoji">🌱</span><div><strong>Rythme réel : stable (${pace.perWeek > 0 ? '+' : ''}${nf(pace.perWeek, 2)} kg/sem.)</strong><span class="muted small">Le poids fluctue beaucoup (eau, cycle, sel). Regarde la tendance sur 3 à 4 semaines avant de tirer des conclusions.</span></div></div>`;
    }
  }

  const ws = [...S.weights].sort((a, b) => b.date.localeCompare(a.date));
  el.innerHTML = `
    ${suiviHead()}
    <p class="subtitle" style="margin:-4px 4px 12px">Cap sur ${nf1(s.targetWeight)} kg</p>
    <div class="kpis">
      <div class="kpi"><b>${nf1(cur)}<small> kg</small></b><span>Actuel</span></div>
      <div class="kpi accent"><b>${lost >= 0 ? '−' : '+'}${nf1(Math.abs(lost))}<small> kg</small></b><span>${lost >= 0 ? 'Perdus' : 'Pris'}</span></div>
      <div class="kpi"><b>${nf1(left)}<small> kg</small></b><span>Restants</span></div>
    </div>
    <div class="card">
      <div class="bar"><i data-w="${pct}" class="${reached ? 'done' : ''}"></i></div>
      <div class="progress-meta"><span>${nf1(s.startWeight)} kg</span><span>${nf(pct)} %</span><span>${nf1(s.targetWeight)} kg</span></div>
    </div>
    ${weightCycleNote()}
    <div class="card"><h2>Évolution</h2><div class="chart" id="chart"></div>${cycleCfg().enabled && cycleCfg().starts.length ? '<p class="field-hint" style="margin-top:6px">🩸 Les petits traits rouges marquent le début de tes règles.</p>' : ''}</div>
    <div class="card"><h2>Estimation d'arrivée</h2>${est}</div>
    <div class="card">
      <h2>Nouvelle pesée</h2>
      <div class="row">
        <label class="field"><span>Date</span><input type="date" id="wd" value="${todayKey()}" max="${todayKey()}"></label>
        <label class="field"><span>Poids (kg)</span><input id="wk" inputmode="decimal" placeholder="${nf1(cur)}"></label>
      </div>
      <p class="error hidden" id="werr"></p>
      <button class="btn btn-primary btn-block" id="wadd">Enregistrer la pesée</button>
    </div>
    ${ws.length ? `<div class="section-title">Mes pesées <small>${ws.length}</small></div>
    <div class="list">${ws.map((w, i) => {
      const prev = ws[i + 1] ? ws[i + 1].kg : s.startWeight;
      const diff = w.kg - prev;
      return `<div class="item"><div class="item-main"><div class="item-name">${cap(fmtDay(w.date, { weekday: 'long', day: 'numeric', month: 'long' }))}</div>
        <div class="item-sub">${diff === 0 ? '=' : (diff < 0 ? '−' : '+') + nf1(Math.abs(diff)) + ' kg'}</div></div>
        <div class="item-kcal">${nf1(w.kg)} <small>kg</small></div>
        <button class="icon-btn" data-wdel="${w.date}" aria-label="Supprimer la pesée">✕</button></div>`;
    }).join('')}</div>` : ''}
    <div class="section-title">Réglages</div>
    <div class="card">
      <div class="grid2">
        <label class="field"><span>Objectif kcal / jour</span><input id="sk" inputmode="numeric" value="${s.kcal}"></label>
        <label class="field"><span>Protéines (g)</span><input id="sp" inputmode="numeric" value="${s.prot}"></label>
        <label class="field"><span>Eau (verres de 25 cl)</span><input id="sw" inputmode="numeric" value="${s.water}"></label>
        <div></div>
        <label class="field"><span>Poids de départ</span><input id="ss" inputmode="decimal" value="${nf1(s.startWeight)}"></label>
        <label class="field"><span>Poids visé</span><input id="st" inputmode="decimal" value="${nf1(s.targetWeight)}"></label>
      </div>
      <p class="field-hint">L'objectif calorique ne peut pas descendre sous ${nf(MIN_KCAL)} kcal.</p>
      <p class="error hidden" id="serr"></p>
      <button class="btn btn-primary btn-block" id="ssave" style="margin-top:10px">Enregistrer les réglages</button>
    </div>
    <div class="section-title">Sauvegarde</div>
    <div class="card">
      <p class="muted small" style="margin-top:0">Tes données restent sur ce téléphone. Exporte une sauvegarde de temps en temps (par exemple dans Fichiers ou iCloud Drive).</p>
      <div class="grid2">
        <button class="btn btn-soft" id="exp">⬇️ Exporter</button>
        <button class="btn" id="imp">⬆️ Importer</button>
      </div>
      <input type="file" id="impf" accept="application/json,.json" class="hidden">
    </div>
    <p class="field-hint" style="text-align:center">Cap 65 · données stockées localement</p>`;

  requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-w]', el).forEach((b) => { b.style.width = b.dataset.w + '%'; })));
  bindSuiviHead(el);
  drawChart($('#chart', el));

  $('#wadd', el).onclick = () => {
    const date = $('#wd', el).value, kg = num($('#wk', el).value);
    const err = $('#werr', el);
    if (!date || !Number.isFinite(kg) || kg < 30 || kg > 250) { err.textContent = 'Indique une date et un poids valide (ex. : 75,4).'; err.classList.remove('hidden'); return; }
    S.weights = S.weights.filter((w) => w.date !== date);
    S.weights.push({ date, kg: Math.round(kg * 10) / 10 });
    save();
    const fresh = checkCelebrations();
    renderWeight(el);
    if (!celebrateToast(fresh)) toast('Pesée enregistrée ⚖️');
  };
  $$('[data-wdel]', el).forEach((b) => b.onclick = () => {
    const w = S.weights.find((x) => x.date === b.dataset.wdel);
    S.weights = S.weights.filter((x) => x !== w); save(); checkCelebrations(); renderWeight(el);
    toast('Pesée supprimée', { label: 'Annuler', fn: () => { S.weights.push(w); save(); checkCelebrations(); renderWeight(el); } });
  });
  $('#ssave', el).onclick = () => {
    const water = num($('#sw', el).value);
    const kcal = num($('#sk', el).value), prot = num($('#sp', el).value), sw = num($('#ss', el).value), tw = num($('#st', el).value);
    const err = $('#serr', el);
    const fail = (m) => { err.textContent = m; err.classList.remove('hidden'); };
    if (!Number.isFinite(kcal)) return fail('Indique un objectif calorique.');
    if (kcal < MIN_KCAL) { $('#sk', el).value = s.kcal; return fail(`Pour ta santé, l'objectif ne peut pas descendre sous ${nf(MIN_KCAL)} kcal. Réglage refusé.`); }
    if (kcal > 4000) return fail('Objectif calorique trop élevé.');
    if (!Number.isFinite(prot) || prot < 20 || prot > 300) return fail('Objectif de protéines invalide.');
    if (!Number.isFinite(sw) || !Number.isFinite(tw) || sw < 30 || tw < 30 || sw > 250 || tw > 250) return fail('Poids invalides.');
    if (tw >= sw) return fail('Le poids visé doit être inférieur au poids de départ.');
    if (!Number.isFinite(water) || water < 4 || water > 16) return fail('Objectif eau : entre 4 et 16 verres.');
    Object.assign(S.settings, { water: Math.round(water), kcal: Math.round(kcal), prot: Math.round(prot), startWeight: Math.round(sw * 10) / 10, targetWeight: Math.round(tw * 10) / 10 });
    save(); checkCelebrations(); renderWeight(el); toast('Réglages enregistrés ✓');
  };
  $('#exp', el).onclick = exportData;
  $('#imp', el).onclick = () => $('#impf', el).click();
  $('#impf', el).onchange = (e) => importData(e.target.files[0]);
}

function drawChart(box) {
  const pts = weightSeries();
  const W = box.clientWidth || 320, H = box.clientHeight || 220;
  const m = { l: 34, r: 12, t: 26, b: 24 };
  const target = S.settings.targetWeight;
  const kgs = pts.map((p) => p.kg).concat(target);
  let lo = Math.floor(Math.min(...kgs) - 1), hi = Math.ceil(Math.max(...kgs) + 1);
  const x0 = pts[0].date;
  let x1 = pts[pts.length - 1].date;
  if (daysBetween(x0, x1) < 14) x1 = addDays(x0, 14);
  const span = daysBetween(x0, x1);
  const X = (k) => m.l + (daysBetween(x0, k) / span) * (W - m.l - m.r);
  const Y = (kg) => m.t + ((hi - kg) / (hi - lo)) * (H - m.t - m.b);
  const step = hi - lo > 8 ? 4 : 2;
  let grid = '';
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis-lbl" x="${m.l - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.date).toFixed(1)},${Y(p.kg).toFixed(1)}`).join('');
  const area = pts.length > 1 ? `${line}L${X(pts[pts.length - 1].date).toFixed(1)},${H - m.b}L${X(pts[0].date).toFixed(1)},${H - m.b}Z` : '';
  const xl = [x0, addDays(x0, Math.round(span / 2)), x1];
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de poids">
    <g class="grid">${grid}</g>
    <line class="goal-line" x1="${m.l}" x2="${W - m.r}" y1="${Y(target)}" y2="${Y(target)}"/>
    <text class="goal-lbl" x="${W - m.r}" y="${Y(target) - 6}" text-anchor="end">Objectif ${nf1(target)} kg</text>
    ${area ? `<path class="w-area" d="${area}"/>` : ''}
    <path class="w-line" d="${line}"/>
    ${cycleCfg().enabled ? cycleCfg().starts.filter((k) => k >= x0 && k <= x1).map((k) => `<line class="period-tick" x1="${X(k)}" x2="${X(k)}" y1="${H - m.b - 8}" y2="${H - m.b}"/>`).join('') : ''}
    <line class="cross" id="cross" y1="${m.t}" y2="${H - m.b}" x1="-10" x2="-10"/>
    ${pts.map((p, i) => `<circle class="w-dot" data-i="${i}" cx="${X(p.date)}" cy="${Y(p.kg)}" r="4"/>`).join('')}
    ${xl.map((k, i) => `<text class="axis-lbl" x="${X(k)}" y="${H - 6}" text-anchor="${['start', 'middle', 'end'][i]}">${fmtShort(k)}</text>`).join('')}
  </svg><div class="chart-tip hidden" id="tip"></div>`;
  const svg = $('svg', box), tip = $('#tip', box), cross = $('#cross', box);
  const show = (cx) => {
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const d = Math.abs(X(p.date) - cx); if (d < bd) { bd = d; best = i; } });
    const p = pts[best], px = X(p.date);
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.classList.add('on');
    $$('.w-dot', box).forEach((d) => d.classList.toggle('sel', +d.dataset.i === best));
    tip.innerHTML = `${fmtShort(p.date)} · ${nf1(p.kg)} kg${best === 0 && p.date === S.settings.startDate ? ' (départ)' : ''}`;
    tip.classList.remove('hidden');
    tip.style.left = Math.max(50, Math.min(W - 50, px)) + 'px';
    tip.style.top = Math.max(0, Y(p.kg) - 36) + 'px';
  };
  const pos = (e) => { const r = svg.getBoundingClientRect(); return ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) * (W / r.width); };
  svg.addEventListener('pointerdown', (e) => show(pos(e)));
  svg.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) show(pos(e)); });
  svg.addEventListener('pointerleave', () => { tip.classList.add('hidden'); cross.classList.remove('on'); });
}

async function exportData() {
  const payload = JSON.stringify({ app: 'cap65', exportedAt: new Date().toISOString(), data: S }, null, 2);
  const name = `cap65-sauvegarde-${todayKey()}.json`;
  const file = new File([payload], name, { type: 'application/json' });
  // Sur iPhone (app installée), la feuille de partage permet « Enregistrer dans Fichiers ».
  if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) {
    try { await navigator.share({ files: [file], title: 'Sauvegarde Cap 65' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('Sauvegarde exportée ✓');
}
function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed.data || parsed;
      if (!data || !Array.isArray(data.foods) || typeof data.days !== 'object' || !data.settings) throw new Error('format');
      if (!confirm('Remplacer toutes tes données actuelles par cette sauvegarde ?')) return;
      const base = freshState();
      S = { ...base, ...data, settings: { ...base.settings, ...data.settings }, weights: data.weights || [], quotas: data.quotas || {}, celebrated: data.celebrated || {} };
      save(); render(); toast('Sauvegarde importée ✓');
    } catch (e) {
      toast('Ce fichier n\'est pas une sauvegarde Cap 65 valide.');
    }
  };
  reader.readAsText(file);
}

/* =========================================================
   Écran 2 : Repas (mes aliments · base de plats · recettes)
   ========================================================= */
function repasHead() {
  const tabs = [['foods', 'Aliments'], ['base', 'Base'], ['recettes', 'Recettes'], ['courses', 'Courses']];
  return `<div class="topbar"><div><h1 class="title">Repas</h1></div></div>
    <div class="seg seg4">${tabs.map(([id, l]) => `<button data-rv="${id}" aria-pressed="${ui.repas === id}">${l}</button>`).join('')}</div>`;
}
function bindRepasHead(el) {
  $$('[data-rv]', el).forEach((b) => b.onclick = () => { ui.repas = b.dataset.rv; render(); window.scrollTo(0, 0); });
}
function renderRepas(el) {
  ({ foods: renderFoods, base: renderBase, recettes: renderRecettes, courses: renderCourses }[ui.repas])(el);
}

function openQuickAdd(item) {
  let qty = 1;
  const dm = defaultMoment();
  let moment = item.moment && dm === 'Matin' ? item.moment : dm;
  const isToday = ui.day === todayKey();
  openSheet(`${sheetHead('Ajouter à ma journée')}
    <p class="muted" style="margin-top:0"><b>${esc(item.name)}</b>${item.portion ? ` · ${esc(item.portion)}` : ''}<br><span id="qa-k">${nf(item.kcal)} kcal · ${nf(item.prot)} g prot.</span>${isToday ? '' : ` · ${fmtDay(ui.day, { weekday: 'long', day: 'numeric', month: 'long' })}`}</p>
    <div class="group"><div class="group-lbl">Moment</div><div class="chips fill">${MOMENTS.map((m) => `<button class="chip" data-m="${m}" aria-pressed="${m === moment}">${m}</button>`).join('')}</div></div>
    <div class="group"><div class="group-lbl">Quantité</div><div class="chips fill">${[0.5, 1, 1.5, 2].map((q) => `<button class="chip" data-q="${q}" aria-pressed="${q === 1}">×${nf1(q)}</button>`).join('')}</div></div>
    <button class="btn btn-primary btn-block" id="qa-add">Ajouter</button>`, (sh) => {
    $$('[data-m]', sh).forEach((x) => x.onclick = () => { moment = x.dataset.m; $$('[data-m]', sh).forEach((y) => y.setAttribute('aria-pressed', y === x)); });
    $$('[data-q]', sh).forEach((x) => x.onclick = () => {
      qty = +x.dataset.q; $$('[data-q]', sh).forEach((y) => y.setAttribute('aria-pressed', y === x));
      $('#qa-k', sh).textContent = `${nf(item.kcal * qty)} kcal · ${nf(item.prot * qty)} g prot.`;
    });
    $('#qa-add', sh).onclick = () => {
      closeSheet();
      addMeal(ui.day, { name: item.name, portion: item.portion || '', kcal: item.kcal, prot: item.prot, moment, qty, ecart: item.ecart || null });
    };
  });
}

/* ---------- Base de plats ---------- */
function renderBase(el) {
  const items = BASE.map((b, i) => [i, b]).filter(([, b]) => (!ui.baseCat || b[0] === ui.baseCat) && matches(ui.baseQuery, b[1], b[2], b[0]));
  const inList = (b) => S.foods.some((f) => f.name === b[1] && f.portion === b[2]);
  el.innerHTML = `
    ${repasHead()}
    <p class="subtitle" style="margin:-4px 4px 12px">${BASE.length} plats et aliments courants, calories déjà calculées.</p>
    <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
      <input type="search" id="bq" placeholder="Ex. : quiche, kebab, risotto…" value="${esc(ui.baseQuery)}" autocomplete="off"></div>
    <div class="chips scroll-x" style="margin-bottom:12px">
      <button class="chip" data-cat="" aria-pressed="${!ui.baseCat}">Tout</button>
      ${BASE_CATS.map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${ui.baseCat === c}">${c}</button>`).join('')}
    </div>
    <div class="list">${items.length ? items.map(([i, b]) => `
      <div class="item">
        <div class="item-main">
          <div class="item-name">${esc(b[1])}${b[5] ? `<span class="badge">${ECARTS[b[5]].e} écart</span>` : ''}</div>
          <div class="item-sub">${esc(b[2])} · ${nf(b[4])} g prot.</div>
        </div>
        <div class="item-kcal">${nf(b[3])} <small>kcal</small></div>
        <button class="icon-btn star ${inList(b) ? 'on' : ''}" data-tolist="${i}" aria-label="Ajouter à ma liste">${inList(b) ? '★' : '☆'}</button>
        <button class="pick-plus" data-badd="${i}" aria-label="Ajouter à ma journée">＋</button>
      </div>`).join('') : '<div class="empty-state">Rien trouvé. Essaie un autre mot, ou ajoute-le dans « Mes aliments ».</div>'}</div>
    <p class="field-hint" style="text-align:center;margin-top:12px">Valeurs moyennes indicatives (portions standards). ☆ = copier dans ta liste pour l'ajuster.</p>`;
  bindRepasHead(el);
  $('#bq', el).addEventListener('input', (e) => {
    ui.baseQuery = e.target.value; const pos = e.target.selectionStart;
    renderBase(el); const inp = $('#bq', el); inp.focus(); inp.setSelectionRange(pos, pos);
  });
  $$('[data-cat]', el).forEach((b) => b.onclick = () => { ui.baseCat = b.dataset.cat; renderBase(el); });
  $$('[data-badd]', el).forEach((b) => b.onclick = () => openQuickAdd(catalogItem('b:' + b.dataset.badd)));
  $$('[data-tolist]', el).forEach((btn) => btn.onclick = () => {
    const b = BASE[+btn.dataset.tolist];
    if (inList(b)) { toast('Déjà dans ta liste ⭐'); return; }
    S.foods.push({ id: uid(), name: b[1], portion: b[2], kcal: b[3], prot: b[4], ecart: b[5] || null, fav: false });
    save(); renderBase(el); toast(`${esc(b[1])} ajouté à ta liste ✓`);
  });
}

/* ---------- Recettes ---------- */
function dishCard(d, mine, pref) {
  const key = (pref || (mine ? 'r' : 'd')) + ':' + d.id;
  return `<article class="card">
    <div class="dish-head"><div class="dish-emoji">${esc(d.e || '🍽️')}</div><div><h2>${esc(d.name)}</h2>${d.desc ? `<p>${esc(d.desc)}</p>` : ''}</div></div>
    ${d.solo ? `<div class="portions solo"><div class="portion me"><strong>Ma portion</strong>${esc(d.me)}</div></div>` : d.me || d.him ? `<div class="portions">
      <div class="portion me"><strong>Ma portion</strong>${esc(d.me || '1 part')}</div>
      <div class="portion"><strong>Sa portion</strong>${esc(d.him || '—')}</div>
    </div>` : ''}
    ${mine && d.ings && d.ings.length && !d.manual ? `<p class="small muted" style="margin:0 0 10px">🧾 ${d.ings.map((i) => `${esc(i.n)} ${nf(i.g)} g`).join(' · ')} → ${d.parts} part${d.parts > 1 ? 's' : ''}</p>` : ''}
    <div class="dish-foot">
      <div class="kc">${nf(d.kcal)} kcal<small>${nf(d.prot)} g de protéines · ma part</small></div>
      ${mine ? `<button class="icon-btn" data-redit="${d.id}" aria-label="Modifier">✎</button>` : ''}
      <button class="icon-btn plan-btn" data-rplan="${key}" aria-label="Prévoir dans la semaine">🛒</button>
      <button class="btn btn-primary btn-sm" data-radd="${key}">＋ Ma journée</button>
    </div>
    ${d.tip ? `<p class="tip">💡 ${esc(d.tip)}</p>` : ''}
    ${mine && d.steps ? `<p class="tip" style="white-space:pre-line">📝 ${esc(d.steps)}</p>` : ''}
  </article>`;
}
function renderRecettes(el) {
  el.innerHTML = `
    ${repasHead()}
    <button class="btn btn-primary btn-block" id="rnew" style="margin-bottom:6px">＋ Créer ma recette</button>
    <p class="field-hint" style="text-align:center;margin-bottom:8px">Ajoute tes ingrédients et leurs grammes : l'app calcule les calories de ta part.</p>
    <div class="section-title">Mes recettes <small>${S.recipes.length}</small></div>
    ${S.recipes.length ? S.recipes.map((r) => dishCard(r, true)).join('') : '<div class="card empty-state"><span class="big">👩‍🍳</span>Tes recettes apparaîtront ici.</div>'}
    <div class="section-title">Petit-déj & en-cas protéinés <small>${SOLO_RECIPES.length}</small></div>
    ${SOLO_RECIPES.map((d) => dishCard(d, false, 's')).join('')}
    <div class="section-title">Idées repas à deux <small>${DISHES.length}</small></div>
    <p class="subtitle" style="margin:-4px 4px 12px">Sans avocat ni poisson pour toi, sans champignons ni haricots pour lui.</p>
    ${DISHES.map((d) => dishCard(d, false)).join('')}`;
  bindRepasHead(el);
  $('#rnew', el).onclick = () => openRecipeSheet(null);
  $$('[data-redit]', el).forEach((b) => b.onclick = () => openRecipeSheet(b.dataset.redit));
  $$('[data-radd]', el).forEach((b) => b.onclick = () => openQuickAdd(catalogItem(b.dataset.radd)));
  $$('[data-rplan]', el).forEach((b) => b.onclick = () => openPlanSheet(b.dataset.rplan));
}

function openRecipeSheet(id) {
  const src = id ? S.recipes.find((r) => r.id === id) : null;
  const r = src ? JSON.parse(JSON.stringify(src)) : { e: '🍽️', name: '', desc: '', me: '', him: '', steps: '', moment: 'Soir', parts: 3, ings: [], manual: false, kcal: 0, prot: 0 };
  let iq = '';
  const totals = () => {
    const k = r.ings.reduce((a, i) => a + (i.k100 * i.g) / 100, 0), p = r.ings.reduce((a, i) => a + (i.p100 * i.g) / 100, 0);
    return { k: Math.round(k), p: Math.round(p), mk: Math.round(k / r.parts), mp: Math.round(p / r.parts) };
  };
  const totalsHtml = () => { const t = totals(); return `Plat entier : ${nf(t.k)} kcal · ${nf(t.p)} g prot.<br><b>Ma part (1/${r.parts}) : ${nf(t.mk)} kcal · ${nf(t.mp)} g de protéines</b>`; };
  const ingRows = () => r.ings.length ? `<div class="list" style="margin-bottom:10px">${r.ings.map((i, n) => `
    <div class="item ing-row">
      <div class="item-main"><div class="item-name">${esc(i.n)}</div><div class="item-sub" data-ik="${n}">${nf((i.k100 * i.g) / 100)} kcal · ${nf1((i.p100 * i.g) / 100)} g prot.</div></div>
      <input class="grams" data-ig="${n}" inputmode="numeric" value="${i.g}" aria-label="Grammes de ${esc(i.n)}"><span class="small muted">g</span>
      <button class="icon-btn" data-idel="${n}" aria-label="Retirer">✕</button>
    </div>`).join('')}</div>` : '<p class="field-hint">Aucun ingrédient pour l\'instant.</p>';
  const results = () => {
    if (!iq.trim()) return '';
    const res = INGREDIENTS.filter((x) => matches(iq, x[0])).slice(0, 6);
    return `<div class="list" style="margin-top:6px">${res.map((x) => `<button class="item pick-item" data-ipick="${esc(x[0])}"><div class="item-main"><div class="item-name">${esc(x[0])}</div><div class="item-sub">${x[1]} kcal · ${x[2]} g prot. / 100 g</div></div><span class="pick-plus">＋</span></button>`).join('')}
      <button class="item pick-item" data-icustom><div class="item-main"><div class="item-name">Autre : « ${esc(iq)} »</div><div class="item-sub">Je saisis ses kcal pour 100 g (voir l'étiquette)</div></div><span class="pick-plus">＋</span></button></div>`;
  };
  openSheet('', (sh) => {
    const draw = () => {
      sh.innerHTML = `${sheetHead(id ? 'Modifier ma recette' : 'Nouvelle recette')}
        <div class="row" style="align-items:flex-end">
          <label class="field" style="flex:0 0 72px"><span>Emoji</span><input id="re" value="${esc(r.e)}" maxlength="4" style="text-align:center;font-size:24px"></label>
          <label class="field"><span>Nom</span><input id="rn" value="${esc(r.name)}" placeholder="Ex. : Gratin de Maman" autocomplete="off"></label>
        </div>
        <div class="seg"><button data-rm="0" aria-pressed="${!r.manual}">Avec mes ingrédients</button><button data-rm="1" aria-pressed="${r.manual}">Je connais les kcal</button></div>
        ${r.manual ? `
          <div class="grid2">
            <label class="field"><span>Kcal de ma part</span><input id="rk" inputmode="numeric" value="${r.kcal || ''}"></label>
            <label class="field"><span>Protéines (g)</span><input id="rp" inputmode="decimal" value="${r.prot || ''}"></label>
          </div>` : `
          <div class="group"><div class="group-lbl">Ingrédients du plat entier</div>
            <div id="ings">${ingRows()}</div>
            <div class="search" style="margin-bottom:0"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
              <input type="search" id="iq" placeholder="Ajouter un ingrédient (poulet, pâtes…)" value="${esc(iq)}" autocomplete="off"></div>
            <div id="ires">${results()}</div>
          </div>
          <div class="quota-row" style="border:0">
            <div class="q-week">Nombre de parts<small>Ma part = 1 part. Lui en mange souvent 2.</small></div>
            <span class="stepper"><button data-parts="-1" aria-label="Moins de parts">−</button><b id="rparts">${r.parts}</b><button data-parts="1" aria-label="Plus de parts">+</button></span>
          </div>
          <div class="explain" id="rtot">${totalsHtml()}</div>`}
        <div class="group" style="margin-top:14px"><div class="group-lbl">Moment habituel</div><div class="chips fill">${MOMENTS.map((m) => `<button class="chip" data-rmo="${m}" aria-pressed="${m === r.moment}">${m}</button>`).join('')}</div></div>
        <label class="field"><span>Ma portion (facultatif)</span><input id="rme" value="${esc(r.me)}" placeholder="Ex. : 1 part + salade"></label>
        <label class="field"><span>Sa portion (facultatif)</span><input id="rhim" value="${esc(r.him)}" placeholder="Ex. : 2 parts"></label>
        <label class="field"><span>Notes / étapes (facultatif)</span><textarea id="rst" rows="3" placeholder="Ex. : 25 min à 200 °C">${esc(r.steps)}</textarea></label>
        <p class="error hidden" id="rerr"></p>
        <button class="btn btn-primary btn-block" id="rsave">${id ? 'Enregistrer' : 'Créer la recette'}</button>
        ${id ? '<button class="btn btn-danger btn-block" id="rdel" style="margin-top:10px">Supprimer la recette</button>' : ''}`;
      bind();
    };
    const keep = () => {
      r.e = $('#re', sh).value.trim() || '🍽️'; r.name = $('#rn', sh).value.trim();
      r.me = $('#rme', sh).value.trim(); r.him = $('#rhim', sh).value.trim(); r.steps = $('#rst', sh).value.trim();
      if (r.manual) { r.kcal = num($('#rk', sh).value); r.prot = num($('#rp', sh).value || '0'); }
    };
    const refreshIngs = () => { $('#ings', sh).innerHTML = ingRows(); $('#rtot', sh).innerHTML = totalsHtml(); bindIngs(); };
    const bindIngs = () => {
      $$('[data-ig]', sh).forEach((inp) => inp.oninput = () => {
        const n = +inp.dataset.ig, g = num(inp.value); r.ings[n].g = Number.isFinite(g) && g > 0 ? Math.round(g) : 0;
        const i = r.ings[n]; $(`[data-ik="${n}"]`, sh).textContent = `${nf((i.k100 * i.g) / 100)} kcal · ${nf1((i.p100 * i.g) / 100)} g prot.`;
        $('#rtot', sh).innerHTML = totalsHtml();
      });
      $$('[data-idel]', sh).forEach((b) => b.onclick = () => { r.ings.splice(+b.dataset.idel, 1); refreshIngs(); });
    };
    const bindRes = () => {
      $$('[data-ipick]', sh).forEach((b) => b.onclick = () => {
        const x = INGREDIENTS.find((y) => y[0] === b.dataset.ipick);
        r.ings.push({ n: x[0], g: 100, k100: x[1], p100: x[2] });
        iq = ''; $('#iq', sh).value = ''; $('#ires', sh).innerHTML = ''; refreshIngs();
        const last = $$('[data-ig]', sh).pop(); if (last) { last.focus(); last.select(); }
      });
      const c = $('[data-icustom]', sh);
      if (c) c.onclick = () => {
        const k = num(prompt(`Kcal pour 100 g de « ${iq} » ?`) || '');
        if (!Number.isFinite(k) || k < 0) return;
        const p = num(prompt('Protéines pour 100 g ? (0 si tu ne sais pas)') || '0');
        r.ings.push({ n: iq.trim(), g: 100, k100: k, p100: Number.isFinite(p) ? p : 0 });
        iq = ''; $('#iq', sh).value = ''; $('#ires', sh).innerHTML = ''; refreshIngs();
      };
    };
    const bind = () => {
      $$('[data-rm]', sh).forEach((b) => b.onclick = () => { keep(); r.manual = b.dataset.rm === '1'; draw(); });
      $$('[data-rmo]', sh).forEach((b) => b.onclick = () => { r.moment = b.dataset.rmo; $$('[data-rmo]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
      if (!r.manual) {
        bindIngs();
        $('#iq', sh).oninput = (e) => { iq = e.target.value; $('#ires', sh).innerHTML = results(); bindRes(); };
        $$('[data-parts]', sh).forEach((b) => b.onclick = () => { r.parts = Math.max(1, Math.min(12, r.parts + +b.dataset.parts)); $('#rparts', sh).textContent = r.parts; $('#rtot', sh).innerHTML = totalsHtml(); });
      }
      $('#rsave', sh).onclick = () => {
        keep();
        const err = $('#rerr', sh);
        const fail = (m) => { err.textContent = m; err.classList.remove('hidden'); };
        if (!r.name) return fail('Donne un nom à ta recette.');
        if (r.manual) {
          if (!Number.isFinite(r.kcal) || r.kcal <= 0) return fail('Indique les kcal de ta part.');
          r.kcal = Math.round(r.kcal); r.prot = Number.isFinite(r.prot) ? Math.round(r.prot) : 0;
        } else {
          if (!r.ings.length) return fail('Ajoute au moins un ingrédient (ou choisis « Je connais les kcal »).');
          const t = totals(); r.kcal = t.mk; r.prot = t.mp;
        }
        if (src) Object.assign(src, r); else S.recipes.unshift({ ...r, id: uid() });
        save(); closeSheet(); render();
        toast(src ? 'Recette mise à jour ✓' : `Recette créée : ${nf(r.kcal)} kcal ta part ✓`);
      };
      if (id) $('#rdel', sh).onclick = () => {
        const idx = S.recipes.indexOf(src);
        S.recipes.splice(idx, 1); save(); closeSheet(); render();
        toast('Recette supprimée', { label: 'Annuler', fn: () => { S.recipes.splice(idx, 0, src); save(); render(); } });
      };
    };
    draw();
  });
}

/* =========================================================
   Écran 3 : Sport
   ========================================================= */
function sportLevel(w) {
  const base = w <= 2 ? 1 : w <= 5 ? 2 : 3;
  return Math.max(1, Math.min(3, base + (S.sport.adjust || 0)));
}
function sessionsDone(mon) {
  const done = {};
  for (let i = 0; i < 7; i++) {
    const k = addDays(mon, i);
    dayOf(k).cardio.forEach((c) => { if (c.session) done[c.session] = { k, ...c }; });
  }
  return done;
}
const FEELS = { easy: '😌 Trop facile', ok: '👌 Parfait', hard: '🥵 Trop dur' };
const lv = (x, lvl) => (Array.isArray(x) ? x[lvl - 1] : x);
const fmtRest = (s) => (s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ' ' + pad(s % 60) : ''}` : `${s} s`);
const toneDays = (id) => (S.sport.days && S.sport.days[id]) || [];
const todayWd = () => (new Date().getDay() + 6) % 7; // 0 = lundi

function exerciseHtml(x, lvl, n) {
  const reps = lv(x.reps, lvl), rec = x.kg ? recommend(x, lvl) : null, load = rec ? loadLabel(x, rec.kg) : null;
  return `<li class="ex">
    <div class="ex-head"><span class="ex-num">${n}</span><div style="flex:1"><strong>${esc(x.name)}</strong><span>${esc(lv(x.where, lvl))}</span></div><div class="ex-thumb">${ILLUS.render(x.id)}</div></div>
    <div class="ex-meta">
      <span>🔁 ${x.sets} × ${esc(reps)}</span>
      ${load ? `<span>🏋️ ${esc(load)}</span>` : ''}
      <span>⏱️ ${x.rest ? 'repos ' + fmtRest(x.rest) : 'sans pause'}</span>
    </div>
    <details class="ex-more"><summary>Comment faire</summary>
      <p><b>Réglage :</b> ${esc(x.setup)}</p>
      <ol>${x.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol>
      <p class="avoid">⚠️ ${esc(x.avoid)}</p>
    </details>
    ${rec ? `<p class="ex-rec">🎯 Conseillé : ${esc(load)} · ${esc(rec.why)}</p>` : ''}
  </li>`;
}
function blockHtml(b, lvl) {
  return `<li class="ex ex-block"><div class="ex-head"><span class="ex-num b-min">${b.d}′</span><div><strong>${esc(b.t)}</strong><span>${esc(b.txt[lvl - 1])}</span></div></div></li>`;
}
function toneListHtml(s, lvl) {
  let n = 0;
  return `<ol class="ex-list">${s.items.map((it) => (it.block ? blockHtml(it, lvl) : exerciseHtml(it, lvl, ++n))).join('')}</ol>`;
}

function renderSport(el) {
  const tk = todayKey(), mon = mondayOf(tk), w = weekIndex(tk);
  const lvl = sportLevel(w);
  const done = sessionsDone(mon);
  const nDone = SESSIONS.filter((s) => done[s.id]).length;
  const feels = Object.values(done).map((d) => d.feel).filter(Boolean);
  const easy = feels.filter((f) => f === 'easy').length, hard = feels.filter((f) => f === 'hard').length;
  let advice = '';
  if (easy >= 2 && lvl < 3) advice = `<div class="explain">😌 ${easy} séances « trop faciles » cette semaine : tu es prête à monter d'un cran ! <button class="btn btn-sm btn-primary" data-adj="1" style="margin-top:8px;width:100%">Passer au niveau ${LEVELS[lvl]}</button></div>`;
  else if (hard >= 2 && lvl > 1) advice = `<div class="kind">🥵 ${hard} séances « trop dures » : aucun souci, on adapte. <button class="btn btn-sm" data-adj="-1" style="margin-top:8px;width:100%">Revenir au niveau ${LEVELS[lvl - 2]}</button></div>`;

  const doneHead = (d) => d ? '<div class="goal done" style="border:0;padding:0"><div class="goal-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div></div>' : '';
  const doneLine = (d) => `Faite ${fmtDay(d.k, { weekday: 'long' })}${d.feel ? ' · ' + FEELS[d.feel] : ''}${d.kcal ? ` · ${nf(d.kcal)} kcal` : ''}`;

  const cardioCard = (s) => {
    const d = done[s.id];
    const total = s.blocks.reduce((a, b) => a + b.d, 0);
    return `<article class="card session ${d ? 'is-done' : ''}">
      <div class="dish-head">
        <div class="dish-emoji">${s.e}</div>
        <div style="flex:1"><h2>Séance ${s.id} · ${s.title}</h2><p>${total} min${s.blocks.some((b) => b.renfo) ? ' · cardio + renfo' : ' · 100 % cardio'}</p></div>
        ${doneHead(d)}
      </div>
      <details><summary>${d ? doneLine(d) : 'Voir le déroulé'}</summary>
        <ol class="blocks">${s.blocks.map((b) => `<li class="${b.renfo ? 'renfo' : ''}"><span class="b-min">${b.d}′</span><div><strong>${b.t}</strong><span>${b.txt[lvl - 1]}</span></div></li>`).join('')}</ol>
        ${s.alt ? `<p class="tip">🔄 ${s.alt}</p>` : ''}
      </details>
      ${d ? '' : `<div class="grid2" style="margin-top:12px">
        <button class="btn btn-primary" data-cgo="${s.id}">${S.sport.live && S.sport.live.v === 2 && S.sport.live.sid === s.id && S.sport.live.date === tk ? '▶︎ Reprendre' : 'Let\'s go 🚀'}</button>
        <button class="btn btn-soft" data-sdo="${s.id}">✓ C'est fait</button></div>`}
    </article>`;
  };

  const toneCard = (s) => {
    const d = done[s.id];
    const days = toneDays(s.id);
    const nEx = s.items.filter((i) => !i.block).length;
    const live = S.sport.live && S.sport.live.v === 2 && S.sport.live.sid === s.id && S.sport.live.date === tk;
    return `<article class="card session tone ${d ? 'is-done' : ''}">
      <div class="dish-head">
        <div class="dish-emoji">${s.e}</div>
        <div style="flex:1"><h2>${s.title}</h2><p>${s.focus} · ≈ ${s.dur} min · ${nEx} exercices</p></div>
        ${doneHead(d)}
      </div>
      <div class="group-lbl" style="margin:4px 0 6px">Mes jours</div>
      <div class="chips days">${WEEKDAYS.map((wd, i) => `<button class="chip" data-tday="${s.id}:${i}" aria-pressed="${days.includes(i)}">${wd}</button>`).join('')}</div>
      ${d ? `<p class="small" style="color:var(--good);font-weight:800;margin:10px 0 0">✓ ${doneLine(d)}</p>` : ''}
      <details class="ex-details"><summary>Voir tous les exercices en détail</summary>${toneListHtml(s, lvl)}</details>
      <div class="grid2" style="margin-top:12px">
        <button class="btn btn-primary" data-tstart="${s.id}">${live ? '▶︎ Reprendre' : 'Let\'s go 🚀'}</button>
        <button class="btn btn-soft" data-tdone="${s.id}">✓ C'est fait</button>
      </div>
    </article>`;
  };

  el.innerHTML = `
    <div class="topbar"><div><h1 class="title">Mon programme</h1>
      <p class="subtitle"><span class="week-pill">${w >= 1 ? `Semaine ${w}` : 'Rodage'}</span> &nbsp;Cardio + tonification</p></div></div>
    <div class="card">
      <div class="bar-head"><strong>Cardio cette semaine</strong><span>${nDone}/4 séances</span></div>
      <div class="bar"><i class="${nDone >= 4 ? 'done' : ''}" data-w="${Math.min(100, nDone * 25)}"></i></div>
      <div class="level">
        <div><span class="small muted">Niveau</span><strong>${LEVELS[lvl - 1]}</strong></div>
        <div class="level-dots">${[1, 2, 3].map((n) => `<i class="${n <= lvl ? 'on' : ''}"></i>`).join('')}</div>
        <span class="stepper"><button data-adj="-1" aria-label="Plus doux" ${lvl <= 1 ? 'disabled' : ''}>−</button><button data-adj="1" aria-label="Plus intense" ${lvl >= 3 ? 'disabled' : ''}>+</button></span>
      </div>
      <p class="field-hint">Le niveau change toutes les vitesses, inclinaisons et charges du programme. Il monte tout seul (semaines 1-2 doux, 3-5 intermédiaire, 6+ intense) et s'ajuste avec ton ressenti.</p>
      ${advice}
    </div>

    <div class="section-title">Tonification <small>jours au choix</small></div>
    <p class="subtitle" style="margin:-4px 4px 12px">Choisis tes jours : l'app te le rappelle le matin. « Let's go » enchaîne la séance étape par étape, avec chrono de repos silencieux et charge conseillée.</p>
    ${TONE_SESSIONS.map(toneCard).join('')}

    <div class="section-title">Cardio <small>4 séances de 45 min</small></div>
    ${SESSIONS.map(cardioCard).join('')}
    <button class="btn btn-soft btn-block" id="sfree">＋ Séance libre (autre cardio)</button>

    <div class="card" style="margin-top:14px">
      <h2>Les règles d'or</h2>
      <p class="small muted" style="margin:0 0 8px"><b>Les charges indiquées sont un point de départ.</b> La bonne charge : les 2 dernières répétitions sont dures, mais le mouvement reste propre. Note ta charge dans « Ma charge », l'app s'en souvient.</p>
      <p class="small muted" style="margin:0 0 8px"><b>Pour progresser :</b> si tu réussis toutes les répétitions facilement 2 séances de suite, ajoute +1 kg par haltère, ou +2,5 kg (haut du corps) / +5 kg (jambes) sur les machines.</p>
      <p class="small muted" style="margin:0 0 8px"><b>Les niveaux de résistance</b> varient d'une marque de machine à l'autre : si c'est trop dur ou trop facile, ajuste de 1 ou 2 niveaux.</p>
      <p class="small muted" style="margin:0">💧 Un verre d'eau avant et après chaque séance : il compte dans ton défi eau. Évite de faire « Bas du corps » deux jours de suite : 48 h de récupération pour les muscles.</p>
    </div>`;

  requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-w]', el).forEach((b) => { b.style.width = b.dataset.w + '%'; })));
  $$('[data-adj]', el).forEach((b) => b.onclick = () => {
    const d = +b.dataset.adj;
    const next = sportLevel(w) + d;
    if (next < 1 || next > 3) return;
    S.sport.adjust = (S.sport.adjust || 0) + d; save(); renderSport(el);
    toast(d > 0 ? `💪 Niveau ${LEVELS[next - 1]} activé` : `🌿 Niveau ${LEVELS[next - 1]} : on y va en douceur`);
  });
  $$('[data-tday]', el).forEach((b) => b.onclick = () => {
    const [id, i] = b.dataset.tday.split(':');
    S.sport.days = S.sport.days || {};
    const set = new Set(toneDays(id));
    set.has(+i) ? set.delete(+i) : set.add(+i);
    S.sport.days[id] = [...set].sort();
    b.setAttribute('aria-pressed', set.has(+i));
    save();
  });
  $$('[data-sdo]', el).forEach((b) => b.onclick = () => openSessionSheet(SESSIONS.find((s) => s.id === b.dataset.sdo)));
  $$('[data-tstart]', el).forEach((b) => b.onclick = () => openPlayer(TONE_SESSIONS.find((s) => s.id === b.dataset.tstart)));
  $$('[data-cgo]', el).forEach((b) => b.onclick = () => openPlayer(SESSIONS.find((s) => s.id === b.dataset.cgo)));
  $$('[data-tdone]', el).forEach((b) => b.onclick = () => openToneDone(TONE_SESSIONS.find((s) => s.id === b.dataset.tdone)));
  $('#sfree', el).onclick = () => { ui.day = todayKey(); openCardioSheet(); };
}

/* ---------- Charges : conseil + ajustement selon le ressenti ---------- */
const LOAD_FEELS = { light: '🪶 Trop léger', ok: '👌 Parfait', heavy: '🧱 Trop lourd' };
const loadLabel = (x, kg) => `${x.db ? '2 × ' : ''}${nf1(kg)} kg${x.id === 'hip-thrust' && kg <= 20 ? ' (barre seule)' : ''}`;
function loadHist(id) { return (S.sport.hist && S.sport.hist[id]) || []; }
function recommend(x, lvl) {
  const h = loadHist(x.id);
  if (!h.length) return { kg: x.kg[lvl - 1], why: 'Charge de départ pour ton niveau' };
  const last = h[h.length - 1], prev = h[h.length - 2];
  if (last.feel === 'light') return { kg: last.kg + x.step, why: `${loadLabel(x, last.kg)} était trop léger → on monte` };
  if (last.feel === 'heavy') return { kg: Math.max(x.step, last.kg - x.step), why: `${loadLabel(x, last.kg)} était trop lourd → on baisse un peu` };
  if (prev && prev.feel === 'ok' && prev.kg === last.kg) return { kg: last.kg + x.step, why: `2 séances parfaites à ${loadLabel(x, last.kg)} → on progresse !` };
  return { kg: last.kg, why: `${loadLabel(x, last.kg)} était parfait → on garde` };
}

/* ---------- Lecteur de séance « Let's go » ---------- */
function buildSteps(s) {
  const lvl = sportLevel(weekIndex(todayKey()));
  const steps = [];
  if (s.items) {
    s.items.forEach((it) => steps.push(it.block
      ? { kind: 'block', t: it.t, d: it.d, txt: it.txt[lvl - 1], illus: ILLUS.forBlock(it.t, it.txt[lvl - 1]) }
      : { kind: 'ex', x: it, illus: it.id }));
  } else {
    s.blocks.forEach((b) => steps.push({ kind: 'block', t: b.t, d: b.d, txt: b.txt[lvl - 1], illus: ILLUS.forBlock(b.t, b.txt[lvl - 1]) }));
  }
  steps.push({ kind: 'end' });
  return { steps, lvl };
}
const repsTxt = (r) => (/s$/.test(r) ? r : r.replace(/^(\d+)/, '$1 rép.'));
const fmtClock = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(t / 60)}:${pad(t % 60)}`; };
let playerTick = null, wakeLock = null;

function openPlayer(s) {
  const tk = todayKey();
  if (!S.sport.live || S.sport.live.sid !== s.id || S.sport.live.date !== tk || S.sport.live.v !== 2) {
    S.sport.live = { v: 2, sid: s.id, date: tk, step: 0, set: 1, phase: 'work', kgs: {}, start: Date.now() };
    save();
  }
  const L = S.sport.live;
  const { steps, lvl } = buildSteps(s);
  let pl = $('#player');
  if (!pl) { pl = document.createElement('div'); pl.id = 'player'; pl.className = 'player'; document.body.appendChild(pl); }
  pl.hidden = false;
  document.body.classList.add('no-scroll');
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => { wakeLock = w; }).catch(() => {}); } catch (e) { /* pas de wake lock */ }

  const close = () => {
    clearInterval(playerTick); playerTick = null;
    pl.hidden = true; pl.innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    save(); render();
  };
  const go = (i) => {
    L.step = Math.max(0, Math.min(steps.length - 1, i));
    L.set = 1; L.phase = steps[L.step].kind === 'block' ? 'block' : 'work';
    L.blockEnd = null; L.blockLeft = null; L.restEnd = null;
    save(); draw();
  };
  const ring = (frac, cls) => {
    const C = 2 * Math.PI * 70;
    return `<svg class="pring" viewBox="0 0 160 160"><circle class="pring-track" cx="80" cy="80" r="70"/><circle class="pring-val ${cls}" cx="80" cy="80" r="70" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.max(0, Math.min(1, frac)))}"/></svg>`;
  };

  function draw() {
    clearInterval(playerTick); playerTick = null;
    const st = steps[L.step];
    const n = steps.length - 1;
    const head = `<div class="pl-top">
        <button class="icon-btn" data-pclose aria-label="Quitter">✕</button>
        <div class="pl-title"><strong>${s.e} ${esc(s.title)}</strong><span>${st.kind === 'end' ? 'Terminé !' : `Étape ${L.step + 1}/${n}`}</span></div>
        <span style="width:44px"></span>
      </div>
      <div class="pl-steps">${steps.slice(0, n).map((_, i) => `<i class="${i < L.step ? 'done' : i === L.step ? 'now' : ''}"></i>`).join('')}</div>`;
    let body = '', foot = '';
    const prevBtn = L.step > 0 ? `<button class="pl-prev" data-prev>‹ Étape précédente</button>` : '<span></span>';

    if (st.kind === 'end') {
      const mins = Math.max(1, Math.round((Date.now() - (L.start || Date.now())) / 60000));
      body = `<div class="pl-illus pl-end">🎉</div>
        <h1 class="pl-h">Séance terminée !</h1>
        <p class="pl-sub">${mins} min · ${steps.filter((x) => x.kind === 'ex').length || steps.length - 1} ${s.items ? 'exercices' : 'étapes'} · tu peux être fière de toi 💪</p>`;
      foot = `<button class="btn btn-primary btn-block pl-main" data-finish>Valider ma séance</button>${prevBtn}`;
    } else if (st.kind === 'block') {
      const total = st.d * 60000;
      const left = L.blockEnd ? L.blockEnd - Date.now() : (L.blockLeft != null ? L.blockLeft : total);
      const running = !!L.blockEnd, doneB = left <= 0;
      body = `<div class="pl-illus">${ILLUS.render(st.illus)}</div>
        <h1 class="pl-h">${esc(st.t)}</h1>
        <p class="pl-txt">${esc(st.txt)}</p>
        <div class="pl-timer">${ring(1 - left / total, doneB ? 'ok' : '')}<div class="pl-clock"><b id="pclock">${doneB ? '✓' : fmtClock(left)}</b><span>${doneB ? 'Terminé' : running ? 'en cours' : `${st.d} min`}</span></div></div>`;
      foot = `${doneB
        ? '<button class="btn btn-primary btn-block pl-main" data-next>Étape suivante →</button>'
        : `<div class="grid2"><button class="btn ${running ? '' : 'btn-primary'} pl-main" data-btimer>${running ? '⏸ Pause' : (L.blockLeft != null ? '▶︎ Reprendre' : '▶︎ Chrono')}</button><button class="btn ${running ? 'btn-primary' : 'btn-soft'} pl-main" data-next>Suivant →</button></div>`}${prevBtn}`;
    } else {
      const x = st.x;
      const reps = lv(x.reps, lvl);
      const rec = x.kg ? recommend(x, lvl) : null;
      const kg = x.kg ? (L.kgs[x.id] != null ? L.kgs[x.id] : rec.kg) : null;
      const hist = loadHist(x.id);
      const last = hist[hist.length - 1];
      const howHtml = `<details class="pl-how"><summary>Comment faire</summary>
          <p><b>Réglage :</b> ${esc(x.setup)}</p><ol>${x.how.map((h) => `<li>${esc(h)}</li>`).join('')}</ol><p class="avoid">⚠️ ${esc(x.avoid)}</p></details>`;
      const top = `<div class="pl-illus">${ILLUS.render(st.illus)}</div>
        <h1 class="pl-h">${esc(x.name)}</h1>
        <p class="pl-sub">${esc(lv(x.where, lvl))}</p>`;
      if (L.phase === 'rest') {
        const total = x.rest * 1000, left = L.restEnd - Date.now();
        body = `${top}<div class="pl-timer is-rest">${ring(left / total, 'is-rest')}<div class="pl-clock"><b id="pclock">${fmtClock(left)}</b><span>Repos</span></div></div>
          <p class="pl-next">Ensuite : série ${L.set}/${x.sets} · ${esc(repsTxt(reps))}${kg != null ? ` à ${loadLabel(x, kg)}` : ''}</p>`;
        foot = `<div class="grid2"><button class="btn pl-main" data-plus>+15 s</button><button class="btn btn-primary pl-main" data-skip>C'est reparti →</button></div>${prevBtn}`;
      } else if (L.phase === 'feel') {
        body = `${top}<div class="pl-feel"><p class="pl-q">Comment était la charge de <b>${loadLabel(x, kg)}</b> ?</p>
          ${Object.entries(LOAD_FEELS).map(([k, l]) => `<button class="btn btn-block pl-feel-btn" data-lfeel="${k}">${l}</button>`).join('')}
          <p class="field-hint" style="text-align:center">L'app ajustera la charge de ta prochaine séance.</p></div>`;
        foot = prevBtn;
      } else {
        body = `${top}
          <div class="pl-set"><span class="pl-badge">Série ${L.set}/${x.sets}</span>${/s$/.test(reps) ? `<b>${esc(reps)}</b><span>à tenir</span>` : `<b>${esc(reps.split(' ')[0])}</b><span>répétitions${esc(reps.slice(reps.split(' ')[0].length))}</span>`}</div>
          <div class="pl-bubbles">${Array.from({ length: x.sets }, (_, i) => `<i class="${i + 1 < L.set ? 'done' : i + 1 === L.set ? 'now' : ''}"></i>`).join('')}</div>
          ${x.kg ? `<div class="pl-load">
            <div><span class="small muted">Charge conseillée</span><p class="pl-why">${esc(rec.why)}</p></div>
            <div class="pl-kg"><button data-kg="-1" aria-label="Moins lourd">−</button><b>${loadLabel(x, kg)}</b><button data-kg="1" aria-label="Plus lourd">+</button></div>
            ${last ? `<p class="field-hint" style="margin:6px 0 0">Dernière fois : ${loadLabel(x, last.kg)} · ${LOAD_FEELS[last.feel]}</p>` : ''}
          </div>` : ''}
          ${howHtml}`;
        const lastSet = L.set >= x.sets;
        foot = `<button class="btn btn-primary btn-block pl-main" data-setdone>${lastSet ? '✓ Dernière série faite' : `✓ Série faite → Repos ${fmtRest(x.rest)}`}</button>${prevBtn}`;
      }
    }
    pl.innerHTML = `<div class="pl-wrap">${head}<div class="pl-body">${body}</div><div class="pl-foot">${foot}</div></div>`;
    bind();
    if ((st.kind === 'block' && L.blockEnd) || (st.kind === 'ex' && L.phase === 'rest')) playerTick = setInterval(tick, 250);
  }

  function tick() {
    const st = steps[L.step];
    const clock = $('#pclock', pl), val = $('.pring-val', pl);
    if (!clock || !val) return;
    const C = 2 * Math.PI * 70;
    if (st.kind === 'block') {
      const total = st.d * 60000, left = L.blockEnd - Date.now();
      if (left <= 0) { L.blockEnd = null; L.blockLeft = 0; save(); draw(); return; }
      clock.textContent = fmtClock(left);
      val.style.strokeDashoffset = C * (left / total);
    } else {
      const total = st.x.rest * 1000, left = L.restEnd - Date.now();
      if (left <= 0) { L.phase = 'work'; L.restEnd = null; save(); draw(); flash(); return; }
      clock.textContent = fmtClock(left);
      val.style.strokeDashoffset = C * (1 - left / total);
    }
  }
  function flash() {
    const b = $('.pl-set', pl);
    if (b) { b.classList.add('go'); const t = document.createElement('div'); t.className = 'pl-go'; t.textContent = 'C\'est reparti 💪'; pl.appendChild(t); setTimeout(() => t.remove(), 1600); }
  }

  function bind() {
    const q = (sel) => $(sel, pl);
    q('[data-pclose]').onclick = close;
    const prev = q('[data-prev]');
    if (prev) prev.onclick = () => go(L.step - 1);
    const next = $$('[data-next]', pl);
    next.forEach((b) => b.onclick = () => go(L.step + 1));
    const bt = q('[data-btimer]');
    if (bt) bt.onclick = () => {
      const st = steps[L.step];
      if (L.blockEnd) { L.blockLeft = L.blockEnd - Date.now(); L.blockEnd = null; }
      else { L.blockEnd = Date.now() + (L.blockLeft != null && L.blockLeft > 0 ? L.blockLeft : st.d * 60000); }
      save(); draw();
    };
    $$('[data-kg]', pl).forEach((b) => b.onclick = () => {
      const x = steps[L.step].x;
      const cur = L.kgs[x.id] != null ? L.kgs[x.id] : recommend(x, lvl).kg;
      L.kgs[x.id] = Math.max(x.step, Math.round((cur + +b.dataset.kg * x.step) * 10) / 10);
      save(); draw();
    });
    const sd = q('[data-setdone]');
    if (sd) sd.onclick = () => {
      const x = steps[L.step].x;
      if (L.set < x.sets) {
        L.set++; L.phase = 'rest'; L.restEnd = Date.now() + x.rest * 1000;
        save(); draw();
      } else if (x.kg) { L.phase = 'feel'; save(); draw(); }
      else go(L.step + 1);
    };
    const pls = q('[data-plus]');
    if (pls) pls.onclick = () => { L.restEnd += 15000; save(); };
    const sk = q('[data-skip]');
    if (sk) sk.onclick = () => { L.phase = 'work'; L.restEnd = null; save(); draw(); };
    $$('[data-lfeel]', pl).forEach((b) => b.onclick = () => {
      const x = steps[L.step].x;
      const kg = L.kgs[x.id] != null ? L.kgs[x.id] : recommend(x, lvl).kg;
      S.sport.hist = S.sport.hist || {};
      const h = S.sport.hist[x.id] || (S.sport.hist[x.id] = []);
      h.push({ date: todayKey(), kg, feel: b.dataset.lfeel });
      if (h.length > 30) h.shift();
      const nxt = recommend(x, lvl);
      toast(b.dataset.lfeel === 'ok' ? `👌 Noté ! Prochaine fois : ${loadLabel(x, nxt.kg)}` : `Noté ! Prochaine fois : ${loadLabel(x, nxt.kg)}`);
      go(L.step + 1);
    });
    const fin = q('[data-finish]');
    if (fin) fin.onclick = () => { close(); s.items ? openToneDone(s) : openSessionSheet(s); };
  }
  draw();
}

function openToneDone(s) {
  let feel = 'ok';
  openSheet(`${sheetHead(`${s.title} terminée 🎉`)}
    <div class="grid2">
      <label class="field"><span>Minutes</span><input id="tm" inputmode="numeric" value="${s.dur}"></label>
      <label class="field"><span>Kcal estimées</span><input id="tk" inputmode="numeric" value="${s.kcal}"></label>
    </div>
    <p class="field-hint" style="margin-top:-6px">Estimation pour ${s.dur} min de renfo + cardio. Comme pour le cardio, seule la moitié compte dans ton budget.</p>
    <div class="group" style="margin-top:12px"><div class="group-lbl">Comment tu l'as vécue ?</div>
      <div class="chips fill">${Object.entries(FEELS).map(([k, l]) => `<button class="chip" data-feel="${k}" aria-pressed="${k === feel}">${l}</button>`).join('')}</div></div>
    <p class="error hidden" id="terr"></p>
    <button class="btn btn-primary btn-block" id="tok">Valider la séance</button>`, (sh) => {
    $$('[data-feel]', sh).forEach((b) => b.onclick = () => { feel = b.dataset.feel; $$('[data-feel]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $('#tok', sh).onclick = () => {
      const min = num($('#tm', sh).value), kcal = num($('#tk', sh).value || '0');
      if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(kcal) || kcal < 0) {
        const e = $('#terr', sh); e.textContent = 'Vérifie les minutes et les kcal.'; e.classList.remove('hidden'); return;
      }
      ensureDay(todayKey()).cardio.push({ id: uid(), act: s.act, min: Math.round(min), kcal: Math.round(kcal), session: s.id, kind: 'renfo', feel });
      S.sport.live = null;
      save(); closeSheet();
      checkCelebrations();
      render();
      toast(feel === 'hard' ? '🥵 Tu es allée au bout, bravo ! Étire-toi bien.' : feel === 'easy' ? '😌 Trop facile ? Augmente un peu tes charges la prochaine fois !' : `${s.e} Séance tonification validée, bravo !`);
    };
  });
}

function openSessionSheet(s) {
  let act = s.act, feel = 'ok';
  const total = s.blocks.reduce((a, b) => a + b.d, 0);
  openSheet(`${sheetHead(`Séance ${s.id} terminée 🎉`)}
    <div class="group"><div class="group-lbl">Machine principale</div>
      <div class="act-grid">${ACTIVITIES.map((a) => `<button class="chip" data-act="${esc(a.n)}" aria-pressed="${a.n === act}"><span>${a.e}</span>${a.n}</button>`).join('')}</div></div>
    <div class="grid2">
      <label class="field"><span>Minutes</span><input id="sm" inputmode="numeric" value="${total}"></label>
      <label class="field"><span>Kcal machine</span><input id="sk" inputmode="numeric" placeholder="350"></label>
    </div>
    <p class="live" id="slive">Seule la moitié des kcal de la machine compte dans ton budget.</p>
    <div class="group"><div class="group-lbl">Comment tu l'as vécue ?</div>
      <div class="chips fill">${Object.entries(FEELS).map(([k, l]) => `<button class="chip" data-feel="${k}" aria-pressed="${k === feel}">${l}</button>`).join('')}</div></div>
    <p class="error hidden" id="serr2"></p>
    <button class="btn btn-primary btn-block" id="sok">Valider la séance</button>`, (sh) => {
    $$('[data-act]', sh).forEach((b) => b.onclick = () => { act = b.dataset.act; $$('[data-act]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-feel]', sh).forEach((b) => b.onclick = () => { feel = b.dataset.feel; $$('[data-feel]', sh).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $('#sk', sh).oninput = () => {
      const k = num($('#sk', sh).value);
      $('#slive', sh).textContent = Number.isFinite(k) && k > 0 ? `+${nf(Math.round(k / 2))} kcal ajoutées à ton budget (la moitié de ${nf(k)}).` : 'Seule la moitié des kcal de la machine compte dans ton budget.';
    };
    $('#sok', sh).onclick = () => {
      const min = num($('#sm', sh).value), kcal = num($('#sk', sh).value || '0');
      if (!Number.isFinite(min) || min <= 0 || !Number.isFinite(kcal) || kcal < 0) {
        const e = $('#serr2', sh); e.textContent = 'Vérifie les minutes et les kcal.'; e.classList.remove('hidden'); return;
      }
      ensureDay(todayKey()).cardio.push({ id: uid(), act, min: Math.round(min), kcal: Math.round(kcal), session: s.id, feel });
      if (S.sport.live && S.sport.live.sid === s.id) S.sport.live = null;
      save(); closeSheet();
      const fresh = checkCelebrations();
      render();
      if (!celebrateToast(fresh)) toast(feel === 'hard' ? '🥵 Bravo d\'être allée au bout ! Récupère bien.' : feel === 'easy' ? '😌 Facile ? On pourra monter d\'un cran !' : '👌 Séance validée, bravo !');
    };
  });
}

/* ---------------- Démarrage ---------------- */
checkCelebrations();
ui.justDone.clear();
go('today');

// Rafraîchit la date si l'app reste ouverte après minuit.
let lastToday = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && todayKey() !== lastToday) {
    if (ui.day === lastToday) ui.day = todayKey();
    lastToday = todayKey(); render();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
