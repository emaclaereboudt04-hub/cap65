'use strict';
/* =========================================================
   Cap 65 : planning repas & courses, mensurations, cycle
   (chargé avant app.js ; utilise ses fonctions au moment de l'appel)
   ========================================================= */

/* ---------------- Recettes : accès commun ---------------- */
function allRecipeRefs() {
  return [
    ...S.recipes.map((r) => ({ key: 'r:' + r.id, d: r, kind: 'Mes recettes' })),
    ...SOLO_RECIPES.map((r) => ({ key: 's:' + r.id, d: r, kind: 'Petit-déj & en-cas' })),
    ...DISHES.map((r) => ({ key: 'd:' + r.id, d: r, kind: 'À deux' })),
  ];
}
function recipeByKey(key) {
  const [t, id] = [key[0], key.slice(2)];
  if (t === 'r') return S.recipes.find((x) => x.id === id);
  if (t === 's') return SOLO_RECIPES.find((x) => x.id === id);
  if (t === 'd') return DISHES.find((x) => x.id === id);
  return null;
}

/* ---------------- Planning de la semaine ---------------- */
const WD_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
function planOf(mon) { S.plan = S.plan || {}; return S.plan[mon] || (S.plan[mon] = { days: [[], [], [], [], [], [], []] }); }
function plannedToday() {
  const k = todayKey(), mon = mondayOf(k), wd = (parseKey(k).getDay() + 6) % 7;
  const p = S.plan && S.plan[mon];
  return p ? p.days[wd].map(recipeByKey).filter(Boolean).map((d, i) => ({ d, key: p.days[wd][i] })) : [];
}

function openPlanSheet(key) {
  const d = recipeByKey(key);
  const thisMon = mondayOf(todayKey()), nextMon = addDays(thisMon, 7);
  let mon = ui.shopWeek === 'next' ? nextMon : thisMon;
  const draw = (sh) => {
    const p = planOf(mon);
    sh.innerHTML = `${sheetHead('🛒 Prévoir ce plat')}
      <p class="muted" style="margin-top:0"><b>${esc(d.e || '🍽️')} ${esc(d.name)}</b> · ${nf(d.kcal)} kcal ta part</p>
      <div class="seg"><button data-pw="${thisMon}" aria-pressed="${mon === thisMon}">Cette semaine</button><button data-pw="${nextMon}" aria-pressed="${mon === nextMon}">Semaine prochaine</button></div>
      <div class="group-lbl">Quel(s) jour(s) ?</div>
      <div class="chips days" style="margin-bottom:14px">${WEEKDAYS.map((w, i) => `<button class="chip" data-pd="${i}" aria-pressed="${p.days[i].includes(key)}">${w}</button>`).join('')}</div>
      <p class="field-hint">Les ingrédients s'ajoutent automatiquement à ta liste de courses.</p>
      <button class="btn btn-primary btn-block" id="plok" style="margin-top:10px">OK</button>`;
    $('#plok', sh).onclick = () => { closeSheet(); if (ui.tab === 'repas') render(); toast('Planning mis à jour 🛒'); };
    $$('[data-pw]', sh).forEach((b) => b.onclick = () => { mon = b.dataset.pw; draw(sh); });
    $$('[data-pd]', sh).forEach((b) => b.onclick = () => {
      const day = planOf(mon).days[+b.dataset.pd];
      const i = day.indexOf(key);
      if (i >= 0) day.splice(i, 1); else day.push(key);
      b.setAttribute('aria-pressed', i < 0);
      save();
    });
  };
  openSheet('', draw);
}

function openPickRecipe(mon, wd) {
  let q = '';
  const list = () => {
    const refs = allRecipeRefs().filter((r) => matches(q, r.d.name, r.d.desc || ''));
    let lastKind = '';
    return refs.map((r) => {
      const head = r.kind !== lastKind ? `<div class="moment-head" style="padding-top:10px"><span>${r.kind}</span></div>` : '';
      lastKind = r.kind;
      return `${head}<button class="item pick-item card-row" data-pick="${r.key}"><div class="item-main"><div class="item-name">${esc(r.d.e || '🍽️')} ${esc(r.d.name)}</div><div class="item-sub">${nf(r.d.kcal)} kcal · ${nf(r.d.prot)} g prot.</div></div><span class="pick-plus">＋</span></button>`;
    }).join('') || '<div class="empty-state">Aucune recette trouvée.</div>';
  };
  openSheet(`${sheetHead(`${WD_LONG[wd]} : ajouter un plat`)}
    <div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg><input type="search" id="prq" placeholder="Rechercher une recette…" autocomplete="off"></div>
    <div id="prl" class="pick-list">${list()}</div>`, (sh) => {
    const bind = () => $$('[data-pick]', sh).forEach((b) => b.onclick = () => {
      planOf(mon).days[wd].push(b.dataset.pick); save(); closeSheet(); render();
      toast('Ajouté au planning 🛒');
    });
    bind();
    $('#prq', sh).oninput = (e) => { q = e.target.value; $('#prl', sh).innerHTML = list(); bind(); };
  });
}

/* ---------------- Liste de courses ---------------- */
function fmtQty(q, u) {
  if (!q) return '';
  if (u === 'g' && q >= 1000) return `${nf1(q / 1000)} kg`;
  if (u === 'ml' && q >= 1000) return `${nf1(q / 1000)} L`;
  if (u === 'cl' && q >= 100) return `${nf1(q / 100)} L`;
  const n = Math.round(q * 10) / 10;
  const plural = n > 1 && u && !['g', 'ml', 'cl'].includes(u) ? u.split(' ').map((w) => (/[sx]$/.test(w) ? w : w + 's')).join(' ') : u;
  return `${nf1(n)}${plural ? ' ' + plural : ''}`;
}
function shoppingFor(mon) {
  const p = planOf(mon);
  const items = new Map();
  const add = (name, qty, unit, rayon) => {
    const k = norm(name) + '|' + unit;
    const it = items.get(k) || { key: k, name, qty: 0, unit, rayon, n: 0 };
    it.qty += qty || 0; it.n++;
    items.set(k, it);
  };
  p.days.flat().forEach((key) => {
    const d = recipeByKey(key);
    if (!d) return;
    if (d.ings2) d.ings2.forEach(([n, q, u, r]) => add(n, q, u, r));
    else if (d.ings) d.ings.forEach((i) => add(i.n, i.g, 'g', 'Autres'));
  });
  return [...items.values()];
}
function shopState(mon) { S.shop = S.shop || {}; return S.shop[mon] || (S.shop[mon] = { checked: {}, extra: [] }); }

function renderCourses(el) {
  const thisMon = mondayOf(todayKey()), nextMon = addDays(thisMon, 7);
  const mon = ui.shopWeek === 'next' ? nextMon : thisMon;
  const p = planOf(mon), st = shopState(mon);
  const items = shoppingFor(mon);
  const nPlanned = p.days.flat().length;
  const byRayon = {};
  items.forEach((it) => { const r = it.qty ? it.rayon : 'Placard'; (byRayon[r] = byRayon[r] || []).push(it); });
  const order = [...RAYONS, 'Autres'];
  const extra = st.extra || [];
  const total = items.length + extra.length;
  const done = items.filter((i) => st.checked[i.key]).length + extra.filter((x) => x.checked).length;
  const tk = todayKey();

  el.innerHTML = `
    ${repasHead()}
    <div class="seg"><button data-sw="this" aria-pressed="${mon === thisMon}">Cette semaine</button><button data-sw="next" aria-pressed="${mon === nextMon}">Semaine prochaine</button></div>
    <div class="section-title">Mon planning <small>${weekRange(mon)} · ${nPlanned} plat${nPlanned > 1 ? 's' : ''}</small></div>
    <div class="list plan">${p.days.map((day, i) => {
      const k = addDays(mon, i);
      return `<div class="plan-day ${k === tk ? 'is-today' : ''}">
        <div class="plan-wd"><b>${WEEKDAYS[i]}</b><span>${fmtDay(k, { day: 'numeric' })}</span></div>
        <div class="plan-items">${day.map((key, j) => { const d = recipeByKey(key); return d ? `<span class="plan-chip">${esc(d.e || '🍽️')} ${esc(d.name)}<button data-prm="${i}:${j}" aria-label="Retirer">✕</button></span>` : ''; }).join('')}
          <button class="plan-add" data-padd="${i}" aria-label="Ajouter un plat le ${WD_LONG[i]}">＋</button></div>
      </div>`;
    }).join('')}</div>
    <p class="field-hint">Astuce : dans « Recettes », le bouton 🛒 permet aussi de prévoir un plat.</p>

    <div class="section-title">Liste de courses <small>${done}/${total}</small></div>
    ${total ? '' : '<div class="card empty-state"><span class="big">🛒</span>Prévois des plats ci-dessus : leurs ingrédients (pour toi et lui) apparaîtront ici, rangés par rayon.</div>'}
    ${order.filter((r) => byRayon[r]).map((r) => `
      <div class="moment-head" style="padding-top:12px"><span>${r === 'Placard' ? 'À vérifier dans le placard' : r}</span></div>
      <div class="list">${byRayon[r].sort((a, b) => a.name.localeCompare(b.name)).map((it) => `
        <label class="item shop-item ${st.checked[it.key] ? 'checked' : ''}">
          <input type="checkbox" data-chk="${esc(it.key)}" ${st.checked[it.key] ? 'checked' : ''}>
          <div class="item-main"><div class="item-name">${esc(it.name)}</div></div>
          <div class="item-kcal">${it.qty ? fmtQty(it.qty, it.unit) : ''}</div>
        </label>`).join('')}</div>`).join('')}
    <div class="moment-head" style="padding-top:12px"><span>Autres articles</span></div>
    <div class="list">${extra.map((x) => `
      <label class="item shop-item ${x.checked ? 'checked' : ''}">
        <input type="checkbox" data-xchk="${x.id}" ${x.checked ? 'checked' : ''}>
        <div class="item-main"><div class="item-name">${esc(x.name)}</div></div>
        <button class="icon-btn" data-xdel="${x.id}" aria-label="Supprimer">✕</button>
      </label>`).join('')}
      <div class="item"><input id="xnew" placeholder="Ajouter (ex. : lessive, café…)" autocomplete="off" enterkeyhint="done" style="border:0;padding:0"><button class="pick-plus" id="xadd" aria-label="Ajouter">＋</button></div>
    </div>
    ${total ? `<div class="grid2" style="margin-top:14px">
      <button class="btn btn-soft" id="shshare">📤 Partager</button>
      <button class="btn" id="shclear">Tout décocher</button>
    </div>` : ''}
    <p class="field-hint" style="text-align:center;margin-top:10px">Quantités pour vous deux. Tes propres recettes sont comptées pour le plat entier.</p>`;

  bindRepasHead(el);
  $$('[data-sw]', el).forEach((b) => b.onclick = () => { ui.shopWeek = b.dataset.sw; renderCourses(el); });
  $$('[data-padd]', el).forEach((b) => b.onclick = () => openPickRecipe(mon, +b.dataset.padd));
  $$('[data-prm]', el).forEach((b) => b.onclick = (e) => {
    e.stopPropagation();
    const [i, j] = b.dataset.prm.split(':').map(Number);
    p.days[i].splice(j, 1); save(); renderCourses(el);
  });
  $$('[data-chk]', el).forEach((c) => c.onchange = () => {
    if (c.checked) st.checked[c.dataset.chk] = true; else delete st.checked[c.dataset.chk];
    c.closest('.shop-item').classList.toggle('checked', c.checked); save();
  });
  $$('[data-xchk]', el).forEach((c) => c.onchange = () => {
    const x = extra.find((y) => y.id === c.dataset.xchk); x.checked = c.checked;
    c.closest('.shop-item').classList.toggle('checked', c.checked); save();
  });
  $$('[data-xdel]', el).forEach((b) => b.onclick = (e) => { e.preventDefault(); st.extra = extra.filter((x) => x.id !== b.dataset.xdel); save(); renderCourses(el); });
  const addX = () => { const v = $('#xnew', el).value.trim(); if (!v) return; st.extra.push({ id: uid(), name: v, checked: false }); save(); renderCourses(el); $('#xnew', el).focus(); };
  $('#xadd', el).onclick = addX;
  $('#xnew', el).onkeydown = (e) => { if (e.key === 'Enter') addX(); };
  const clr = $('#shclear', el);
  if (clr) clr.onclick = () => { st.checked = {}; extra.forEach((x) => { x.checked = false; }); save(); renderCourses(el); };
  const sh = $('#shshare', el);
  if (sh) sh.onclick = async () => {
    const lines = [`🛒 Courses ${weekRange(mon)}`];
    order.filter((r) => byRayon[r]).forEach((r) => {
      lines.push('', `— ${r === 'Placard' ? 'Placard (à vérifier)' : r} —`);
      byRayon[r].forEach((it) => { if (!st.checked[it.key]) lines.push(`• ${it.name}${it.qty ? ' : ' + fmtQty(it.qty, it.unit) : ''}`); });
    });
    const ex = extra.filter((x) => !x.checked);
    if (ex.length) { lines.push('', '— Autres —'); ex.forEach((x) => lines.push(`• ${x.name}`)); }
    const text = lines.join('\n');
    try {
      if (navigator.share) { await navigator.share({ title: 'Liste de courses', text }); return; }
      await navigator.clipboard.writeText(text); toast('Liste copiée 📋');
    } catch (e) { if (e.name !== 'AbortError') toast('Partage impossible sur cet appareil'); }
  };
}

/* =========================================================
   Suivi : en-tête commun (Poids · Mesures · Cycle)
   ========================================================= */
function suiviHead() {
  const tabs = [['poids', 'Poids'], ['mesures', 'Mesures'], ['cycle', 'Cycle']];
  return `<div class="topbar"><div><h1 class="title">Suivi</h1></div></div>
    <div class="seg seg3">${tabs.map(([id, l]) => `<button data-sv="${id}" aria-pressed="${ui.suivi === id}">${l}</button>`).join('')}</div>`;
}
function bindSuiviHead(el) {
  $$('[data-sv]', el).forEach((b) => b.onclick = () => { ui.suivi = b.dataset.sv; render(); window.scrollTo(0, 0); });
}
function renderSuivi(el) {
  ({ poids: renderWeight, mesures: renderMesures, cycle: renderCycle }[ui.suivi || 'poids'])(el);
}

/* =========================================================
   Mensurations
   ========================================================= */
function bodySvg(highlight) {
  const m = MEASURES.map((x) => {
    const cx = x.x || 100;
    const on = !highlight || highlight === x.id;
    return `<g class="mz ${on ? 'on' : ''}"><ellipse cx="${cx}" cy="${x.y}" rx="${x.w}" ry="${Math.max(3, x.w / 6)}"/>${highlight ? '' : `<text x="150" y="${x.y + 4}">${x.l}</text><line class="mz-lead" x1="${cx + x.w}" y1="${x.y}" x2="147" y2="${x.y}"/>`}</g>`;
  }).join('');
  return `<svg class="body-svg" viewBox="0 0 220 200" aria-hidden="true">
    <path class="silh" d="M100 18a11 11 0 1 1 0.1 0zM89 36h22l8 4 14 4 6 30 -4 30 -6 -2 2 -24 -6 -16 -2 22 6 26 0 4 -4 36 -2 34h-12l-3 -38 -3 -10 -3 10 -3 38h-12l-2 -34 -4 -36 0 -4 6 -26 -2 -22 -6 16 2 24 -6 2 -4 -30 6 -30 14 -4z"/>
    ${m}</svg>`;
}
function openMeasureGuide() {
  openSheet(`${sheetHead('📏 Bien prendre ses mesures')}
    <div class="card" style="padding:10px">${bodySvg()}</div>
    <div class="card">${MEASURE_RULES.map(([e, t, d]) => `<div class="est"><span class="est-emoji">${e}</span><div><strong>${t}</strong><span class="muted small">${d}</span></div></div>`).join('')}</div>
    <div class="section-title" style="margin-top:6px">Où mesurer exactement</div>
    ${MEASURES.map((x) => `<div class="card mguide"><div class="mguide-svg">${bodySvg(x.id)}</div><div><strong>${x.l}</strong><p class="small muted" style="margin:4px 0 0">${x.how}</p></div></div>`).join('')}
    <button class="btn btn-primary btn-block" data-close>J'ai compris</button>`);
}
function measureSeries(id) {
  return (S.measures || []).filter((m) => Number.isFinite(m.v[id])).sort((a, b) => a.date.localeCompare(b.date));
}
function renderMesures(el) {
  S.measures = S.measures || [];
  const list = [...S.measures].sort((a, b) => b.date.localeCompare(a.date));
  const last = list[0];
  const nextDate = last ? addDays(last.date, 14) : null;
  let totalLost = 0;
  const cards = MEASURES.map((x) => {
    const s = measureSeries(x.id);
    if (!s.length) return `<div class="mcard"><span>${x.l}</span><b>—</b><small>pas encore mesuré</small></div>`;
    const first = s[0].v[x.id], cur = s[s.length - 1].v[x.id], d = cur - first;
    totalLost += Math.min(0, d);
    const spark = s.length > 1 ? sparkline(s.map((m) => m.v[x.id])) : '';
    return `<div class="mcard"><span>${x.l}</span><b>${nf1(cur)} <small>cm</small></b><small class="${d < 0 ? 'down' : d > 0 ? 'up' : ''}">${s.length > 1 ? `${d < 0 ? '−' : d > 0 ? '+' : '±'}${nf1(Math.abs(d))} cm depuis le début` : 'première mesure'}</small>${spark}</div>`;
  }).join('');
  el.innerHTML = `
    ${suiviHead()}
    <button class="banner" id="mguide"><span class="b-emoji">📏</span><span>Comment bien prendre mes mesures ?</span><span class="b-go">›</span></button>
    ${totalLost < 0 ? `<div class="card recap"><div class="recap-big">−${nf1(-totalLost)} cm au total 🎉</div><p class="muted small" style="margin:0">Tous tours confondus depuis ta première mesure. Les centimètres bougent souvent même quand la balance stagne !</p></div>` : ''}
    <div class="mgrid">${cards}</div>
    <div class="card">
      <h2>Nouvelle mesure</h2>
      ${nextDate && nextDate > todayKey() ? `<p class="field-hint" style="margin:-6px 0 10px">Prochaine mesure conseillée : ${fmtDay(nextDate, { weekday: 'long', day: 'numeric', month: 'long' })}.</p>` : ''}
      <label class="field"><span>Date</span><input type="date" id="md" value="${todayKey()}" max="${todayKey()}"></label>
      <div class="grid2">${MEASURES.map((x) => {
        const prev = measureSeries(x.id).slice(-1)[0];
        return `<label class="field"><span>${x.l} (cm)</span><input data-mv="${x.id}" inputmode="decimal" placeholder="${prev ? nf1(prev.v[x.id]) : ''}"></label>`;
      }).join('')}</div>
      <p class="error hidden" id="merr"></p>
      <button class="btn btn-primary btn-block" id="madd">Enregistrer</button>
    </div>
    ${list.length ? `<div class="section-title">Historique <small>${list.length}</small></div>
    <div class="list">${list.map((m) => `<div class="item"><div class="item-main"><div class="item-name">${cap(fmtDay(m.date, { weekday: 'long', day: 'numeric', month: 'long' }))}</div>
      <div class="item-sub">${MEASURES.filter((x) => Number.isFinite(m.v[x.id])).map((x) => `${x.l.split(' ')[0]} ${nf1(m.v[x.id])}`).join(' · ')}</div></div>
      <button class="icon-btn" data-mdel="${m.id}" aria-label="Supprimer">✕</button></div>`).join('')}</div>` : ''}`;
  bindSuiviHead(el);
  $('#mguide', el).onclick = openMeasureGuide;
  $('#madd', el).onclick = () => {
    const date = $('#md', el).value, v = {};
    let bad = false;
    $$('[data-mv]', el).forEach((i) => { if (!i.value.trim()) return; const n = num(i.value); if (!Number.isFinite(n) || n < 10 || n > 250) bad = true; else v[i.dataset.mv] = Math.round(n * 10) / 10; });
    const err = $('#merr', el);
    if (bad || !Object.keys(v).length || !date) { err.textContent = 'Indique au moins une mesure valide en cm (ex. : 72,5).'; err.classList.remove('hidden'); return; }
    const same = S.measures.find((m) => m.date === date);
    if (same) Object.assign(same.v, v); else S.measures.push({ id: uid(), date, v });
    save(); renderMesures(el); toast('Mesures enregistrées 📏');
  };
  $$('[data-mdel]', el).forEach((b) => b.onclick = () => {
    const m = S.measures.find((x) => x.id === b.dataset.mdel);
    S.measures = S.measures.filter((x) => x !== m); save(); renderMesures(el);
    toast('Mesure supprimée', { label: 'Annuler', fn: () => { S.measures.push(m); save(); renderMesures(el); } });
  });
}
function sparkline(vals) {
  const w = 120, h = 28, lo = Math.min(...vals), hi = Math.max(...vals), r = hi - lo || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * (w - 4) + 2},${h - 3 - ((v - lo) / r) * (h - 6)}`).join(' ');
  const [lx, ly] = pts.split(' ').pop().split(',');
  return `<svg class="msparkline" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}"/><circle cx="${lx}" cy="${ly}" r="3"/></svg>`;
}

/* =========================================================
   Cycle
   ========================================================= */
function cycleCfg() {
  S.cycle = S.cycle || {};
  return Object.assign(S.cycle, { enabled: false, hormonal: false, len: 28, plen: 5, starts: [], sym: {}, ...S.cycle });
}
function cycleLen() {
  const c = cycleCfg(), st = [...c.starts].sort();
  const gaps = [];
  for (let i = 1; i < st.length; i++) { const g = daysBetween(st[i - 1], st[i]); if (g >= 18 && g <= 45) gaps.push(g); }
  const recent = gaps.slice(-6);
  return recent.length ? Math.round(recent.reduce((a, b) => a + b) / recent.length) : c.len;
}
function cycleInfo(k = todayKey()) {
  const c = cycleCfg();
  if (!c.enabled) return null;
  const st = [...c.starts].filter((s) => s <= k).sort();
  if (!st.length) return { none: true };
  const last = st[st.length - 1], L = cycleLen(), day = daysBetween(last, k) + 1;
  const next = addDays(last, L);
  if (c.hormonal) return { day, L, next, last, phase: day <= c.plen ? 'regles' : null, hormonal: true };
  const ovu = L - 14;
  let phase;
  if (day <= c.plen) phase = 'regles';
  else if (day > L) phase = 'premens';
  else if (Math.abs(day - ovu) <= 1) phase = 'ovulation';
  else if (day < ovu) phase = 'folliculaire';
  else if (day > L - 6) phase = 'premens';
  else phase = 'luteale';
  return { day, L, next, last, phase, ovu, late: day > L ? day - L : 0 };
}
function cycleChip() {
  const ci = cycleInfo();
  if (!ci || ci.none || !ci.phase) return '';
  const ph = CYCLE_PHASES[ci.phase];
  return `<button class="banner cycle-banner" data-go="suivi:cycle"><span class="b-emoji">${ph.e}</span><span>J${ci.day} · ${ph.l}<small>${esc(ph.sport)}</small></span><span class="b-go">›</span></button>`;
}
function weightCycleNote() {
  const ci = cycleInfo();
  if (!ci || ci.none || !['regles', 'premens'].includes(ci.phase)) return '';
  return `<div class="kind" style="margin:0 0 14px">${CYCLE_PHASES[ci.phase].e} ${ci.phase === 'regles' ? 'Règles en cours' : 'Fin de cycle'} : la balance peut afficher 0,5 à 2 kg de plus à cause de l'eau. Ce n'est pas du gras, ça repart dans quelques jours 💛</div>`;
}

function renderCycle(el) {
  const c = cycleCfg();
  if (!c.enabled) {
    el.innerHTML = `${suiviHead()}
      <div class="card" style="text-align:center">
        <div style="font-size:48px">🌙</div>
        <h2 style="margin:6px 0">Suivi du cycle</h2>
        <p class="muted small">Ton cycle influence ton énergie, ta faim, ta force à la salle et ta rétention d'eau. Le suivre permet de comprendre les variations de la balance et d'adapter tes séances.</p>
        <div class="explain" style="text-align:left">🔒 Tes données restent uniquement sur ton téléphone. C'est une estimation indicative : ce n'est ni un moyen de contraception, ni un avis médical.</div>
      </div>
      <div class="card">
        <label class="check-line"><input type="checkbox" id="chorm"> Je prends une contraception hormonale (pilule, implant, stérilet hormonal…)</label>
        <label class="field"><span>Date du début de tes dernières règles</span><input type="date" id="cstart" max="${todayKey()}"></label>
        <div class="grid2">
          <label class="field"><span>Durée habituelle du cycle (jours)</span><input id="clen" inputmode="numeric" value="28"></label>
          <label class="field"><span>Durée des règles (jours)</span><input id="cplen" inputmode="numeric" value="5"></label>
        </div>
        <p class="field-hint">Pas sûre ? Laisse 28 et 5 : l'app ajustera toute seule au fil de tes cycles.</p>
        <p class="error hidden" id="cerr"></p>
        <button class="btn btn-primary btn-block" id="con">Activer le suivi</button>
      </div>`;
    bindSuiviHead(el);
    $('#con', el).onclick = () => {
      const start = $('#cstart', el).value, L = num($('#clen', el).value), P = num($('#cplen', el).value);
      const err = $('#cerr', el);
      if (!start) { err.textContent = 'Indique la date de début de tes dernières règles.'; err.classList.remove('hidden'); return; }
      if (!(L >= 20 && L <= 45) || !(P >= 2 && P <= 10)) { err.textContent = 'Durées à vérifier (cycle entre 20 et 45 jours, règles entre 2 et 10).'; err.classList.remove('hidden'); return; }
      Object.assign(c, { enabled: true, hormonal: $('#chorm', el).checked, len: Math.round(L), plen: Math.round(P), starts: [...new Set([...(c.starts || []), start])] });
      save(); renderCycle(el); toast('Suivi du cycle activé 🌙');
    };
    return;
  }

  const ci = cycleInfo();
  const tk = todayKey();
  const ph = ci && ci.phase ? CYCLE_PHASES[ci.phase] : null;
  const symToday = c.sym[tk] || [];
  // calendrier : 5 semaines à partir du lundi d'il y a 2 semaines
  const startCal = addDays(mondayOf(tk), -14);
  const dayClass = (k) => {
    const info = cycleInfo(k);
    const cls = [];
    if (k === tk) cls.push('today');
    if (k > tk) cls.push('future');
    if (info && !info.none) {
      if (info.phase === 'regles') cls.push('regles');
      else if (!c.hormonal && info.phase === 'ovulation') cls.push('ovu');
    }
    // règles prévues (après aujourd'hui)
    if (k > tk && ci && !ci.none) {
      const d = daysBetween(ci.next, k);
      if (d >= 0 && d < c.plen) cls.push('regles', 'predicted');
    }
    return cls.join(' ');
  };
  const cal = Array.from({ length: 35 }, (_, i) => { const k = addDays(startCal, i); return `<div class="cal-d ${dayClass(k)}"><span>${parseKey(k).getDate()}</span>${(c.sym[k] || []).length ? '<i></i>' : ''}</div>`; }).join('');
  const starts = [...c.starts].sort().reverse();

  el.innerHTML = `${suiviHead()}
    ${ci && !ci.none ? `<div class="card cycle-now" style="--ph:${ph ? ph.color : 'var(--accent)'}">
      <div class="cycle-head"><span class="cycle-e">${ph ? ph.e : '🌙'}</span><div><span class="small muted">Jour ${ci.day}${c.hormonal ? '' : ` sur ~${ci.L}`}</span><h2 style="margin:0">${ph ? ph.l : 'Cycle sous contraception'}</h2></div></div>
      <p class="small" style="margin:10px 0 0">${ph ? ph.tip : 'Avec une contraception hormonale, il n\'y a pas d\'ovulation : les phases ne s\'appliquent pas. Une rétention d\'eau autour des saignements reste possible.'}</p>
      ${ph ? `<p class="small muted" style="margin:8px 0 0">🏋️ ${ph.sport}</p>` : ''}
      <div class="tokens" style="margin-top:12px">
        <span class="token">🩸 Prochaines règles : ${ci.late ? `retard de ${ci.late} j` : fmtDay(ci.next, { day: 'numeric', month: 'short' })}</span>
        ${!c.hormonal && ci.ovu && ci.day < ci.ovu ? `<span class="token">✨ Ovulation ~${fmtDay(addDays(ci.last, ci.ovu - 1), { day: 'numeric', month: 'short' })}</span>` : ''}
      </div>
      ${ci.late >= 7 ? '<p class="field-hint">Un retard arrive souvent (stress, sport, changement de rythme). S\'il se prolonge ou t\'inquiète, parles-en à ton médecin ou ta gynéco.</p>' : ''}
    </div>` : ''}
    <div class="grid2" style="margin-bottom:14px">
      <button class="btn btn-primary" id="cnew">🩸 Mes règles ont commencé</button>
      <button class="btn btn-soft" id="cpast">Autre date…</button>
    </div>
    <div class="card">
      <h2>Comment je me sens aujourd'hui</h2>
      <div class="chips">${SYMPTOMS.map(([id, l]) => `<button class="chip" data-sym="${id}" aria-pressed="${symToday.includes(id)}">${l}</button>`).join('')}</div>
    </div>
    <div class="card">
      <h2>Calendrier</h2>
      <div class="cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<div class="cal-h">${d}</div>`).join('')}${cal}</div>
      <div class="cal-legend"><span><i class="lg regles"></i>Règles</span><span><i class="lg regles predicted"></i>Prévues</span>${c.hormonal ? '' : '<span><i class="lg ovu"></i>Ovulation</span>'}<span><i class="lg sym"></i>Ressenti noté</span></div>
    </div>
    <div class="card">
      <h2>Mes cycles</h2>
      <p class="small muted" style="margin:-6px 0 8px">Durée moyenne : <b>${cycleLen()} jours</b>${c.starts.length < 2 ? ' (valeur indiquée, elle s\'affinera)' : ''}</p>
      ${starts.map((s, i) => `<div class="hist" style="padding:10px 0"><div class="hist-icon">🩸</div><div class="item-main"><div class="item-name">${cap(fmtDay(s, { weekday: 'long', day: 'numeric', month: 'long' }))}</div><div class="item-sub">${starts[i + 1] ? `Cycle de ${daysBetween(starts[i + 1], s)} jours` : 'Premier cycle noté'}</div></div><button class="icon-btn" data-cdel="${s}" aria-label="Supprimer">✕</button></div>`).join('')}
    </div>
    <div class="card">
      <h2>Réglages</h2>
      <label class="check-line"><input type="checkbox" id="chorm" ${c.hormonal ? 'checked' : ''}> Contraception hormonale</label>
      <div class="grid2">
        <label class="field"><span>Cycle (jours)</span><input id="clen" inputmode="numeric" value="${c.len}"></label>
        <label class="field"><span>Règles (jours)</span><input id="cplen" inputmode="numeric" value="${c.plen}"></label>
      </div>
      <button class="btn btn-block" id="csave">Enregistrer</button>
      <button class="btn btn-block" id="coff" style="margin-top:8px;color:var(--ink-3)">Désactiver le suivi du cycle</button>
      <p class="field-hint">🔒 Données uniquement sur ton téléphone. Estimation indicative : ni contraception, ni avis médical.</p>
    </div>`;
  bindSuiviHead(el);
  const addStart = (date) => {
    if (!date) return;
    if (!c.starts.includes(date)) c.starts.push(date);
    save(); renderCycle(el); toast('Noté 🩸 Prends soin de toi');
  };
  $('#cnew', el).onclick = () => addStart(tk);
  $('#cpast', el).onclick = () => openSheet(`${sheetHead('Début des règles')}
    <label class="field"><span>Date</span><input type="date" id="cpd" max="${tk}" value="${tk}"></label>
    <button class="btn btn-primary btn-block" id="cpok">Enregistrer</button>`, (sh) => { $('#cpok', sh).onclick = () => { const v = $('#cpd', sh).value; closeSheet(); addStart(v); }; });
  $$('[data-sym]', el).forEach((b) => b.onclick = () => {
    const arr = c.sym[tk] || (c.sym[tk] = []);
    const i = arr.indexOf(b.dataset.sym);
    if (i >= 0) arr.splice(i, 1); else arr.push(b.dataset.sym);
    if (!arr.length) delete c.sym[tk];
    b.setAttribute('aria-pressed', i < 0); save();
  });
  $$('[data-cdel]', el).forEach((b) => b.onclick = () => {
    if (!confirm('Supprimer ce début de règles ?')) return;
    c.starts = c.starts.filter((s) => s !== b.dataset.cdel); save(); renderCycle(el);
  });
  $('#csave', el).onclick = () => {
    const L = num($('#clen', el).value), P = num($('#cplen', el).value);
    if (!(L >= 20 && L <= 45) || !(P >= 2 && P <= 10)) { toast('Durées à vérifier (cycle 20-45 j, règles 2-10 j)'); return; }
    Object.assign(c, { hormonal: $('#chorm', el).checked, len: Math.round(L), plen: Math.round(P) });
    save(); renderCycle(el); toast('Réglages enregistrés ✓');
  };
  $('#coff', el).onclick = () => { if (!confirm('Désactiver le suivi ? Tes dates sont conservées si tu le réactives.')) return; c.enabled = false; save(); renderCycle(el); };
}
