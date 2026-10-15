'use strict';
/* =========================================================
   Cap 65 : « Mes besoins » (recalcul kcal/protéines) et sommeil
   (chargé avant app.js ; utilise ses fonctions au moment de l'appel)
   ========================================================= */

/* ---------------- Mes besoins ---------------- */
const ACTIVITY = {
  sit: { f: 1.2, l: 'Plutôt assise', d: 'Cours, bureau, peu de marche (moins de 5 000 pas/jour).' },
  light: { f: 1.375, l: 'Un peu active', d: 'Trajets à pied, souvent debout (5 000 à 8 000 pas/jour).' },
  active: { f: 1.55, l: 'Active', d: 'Travail debout ou beaucoup de marche (plus de 10 000 pas/jour).' },
};
const DEFICIT = 400; // kcal/jour visés, soit ≈ 0,35-0,4 kg/semaine hors sport
const round50 = (n) => Math.round(n / 50) * 50;
function bodyCfg() {
  const s = S.settings;
  if (!s.height) s.height = 174;
  if (!s.age) s.age = 22;
  if (!s.activity) s.activity = 'light';
  return s;
}
function needs(weight = currentWeight()) {
  const s = bodyCfg();
  const bmr = 10 * weight + 6.25 * s.height - 5 * s.age - 161; // Mifflin-St Jeor (femme)
  const tdee = bmr * ACTIVITY[s.activity].f;
  const kcal = Math.max(MIN_KCAL, round50(tdee - DEFICIT));
  const prot = Math.round((1.7 * s.targetWeight) / 5) * 5;
  const deficitNow = tdee - s.kcal;
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, prot, deficitNow: Math.round(deficitNow), lossWeek: (deficitNow * 7) / 7700 };
}
function needsProposal() {
  const s = S.settings, n = needs();
  const dk = n.kcal - s.kcal, dp = n.prot - s.prot;
  if (Math.abs(dk) < 100 && Math.abs(dp) < 10) return null;
  const d = S.needsDismissed;
  if (d && d.kcal === n.kcal && d.prot === n.prot) return null;
  return n;
}
function needsCardHtml() {
  const s = bodyCfg(), n = needs(), prop = needsProposal();
  const w = currentWeight();
  const lossTxt = n.deficitNow > 50 ? `≈ −${nf(n.lossWeek, 2)} kg/semaine, sans compter ton sport` : n.deficitNow < -50 ? 'au-dessus de ta dépense : pas de perte prévue' : 'à l\'équilibre : poids stable';
  return `<div class="card" id="needs">
    <h2>⚡ Mes besoins</h2>
    <p class="small muted" style="margin:-6px 0 10px">Recalculés pour ton poids actuel (${nf1(w)} kg) à chaque pesée.</p>
    <div class="need-row"><span>Métabolisme de base</span><b>${nf(n.bmr)} kcal</b></div>
    <div class="need-row"><span>Dépense du quotidien (hors sport)</span><b>${nf(n.tdee)} kcal</b></div>
    <div class="need-row"><span>Ton objectif actuel</span><b>${nf(s.kcal)} kcal · ${nf(s.prot)} g</b></div>
    <div class="need-row"><span>Déficit estimé</span><b class="${n.deficitNow > 700 ? 'warn-txt' : ''}">${n.deficitNow > 0 ? '−' : '+'}${nf(Math.abs(n.deficitNow))} kcal/jour</b></div>
    <p class="field-hint" style="margin:4px 0 0">${lossTxt}.</p>
    ${n.deficitNow > 700 ? '<div class="kind">Ton déficit est important : risque de fatigue, de fringales et de perte de muscle. Pense à remonter un peu ton objectif.</div>' : ''}
    ${prop ? `<div class="need-prop">
      <strong>💡 Je te propose : ${nf(prop.kcal)} kcal · ${nf(prop.prot)} g de protéines</strong>
      <p class="small" style="margin:6px 0 10px">${prop.kcal < s.kcal ? `En perdant du poids, ton corps dépense un peu moins. Pour garder un déficit d'environ ${DEFICIT} kcal/jour, l'objectif peut baisser légèrement.` : prop.kcal > s.kcal ? 'Ton objectif actuel crée un déficit plus grand que nécessaire : tu peux manger un peu plus et perdre quand même, de façon plus confortable.' : 'Les protéines conseillées (1,7 g par kg de ton poids visé) ont changé.'}${prop.kcal === MIN_KCAL ? ' (Jamais sous 1 500 kcal.)' : ''}</p>
      <div class="grid2"><button class="btn btn-primary btn-sm" id="napply">Appliquer</button><button class="btn btn-sm" id="nkeep">Garder les miens</button></div>
    </div>` : '<p class="small" style="color:var(--good);font-weight:800;margin:10px 0 0">✓ Tes objectifs sont bien adaptés à ton poids actuel.</p>'}
    <div class="group" style="margin:14px 0 8px"><div class="group-lbl">Mon quotidien (hors séances de sport)</div>
      <div class="chips fill">${Object.entries(ACTIVITY).map(([k, a]) => `<button class="chip" data-act-lvl="${k}" aria-pressed="${s.activity === k}">${a.l}</button>`).join('')}</div>
      <p class="field-hint">${ACTIVITY[s.activity].d}</p></div>
    <div class="grid2">
      <label class="field"><span>Taille (cm)</span><input id="nh" inputmode="numeric" value="${s.height}"></label>
      <label class="field"><span>Âge</span><input id="na" inputmode="numeric" value="${s.age}"></label>
    </div>
    <details class="pl-how"><summary>Comment c'est calculé ?</summary>
      <p><b>Métabolisme de base</b> (formule de Mifflin-St Jeor, femme) : 10 × poids + 6,25 × taille − 5 × âge − 161 = ${nf(n.bmr)} kcal.</p>
      <p><b>Dépense du quotidien</b> = métabolisme × ${String(ACTIVITY[s.activity].f).replace('.', ',')} (${ACTIVITY[s.activity].l.toLowerCase()}) = ${nf(n.tdee)} kcal. Tes séances sont comptées à part : la moitié des kcal du cardio s'ajoute à ton budget du jour.</p>
      <p><b>Objectif conseillé</b> = dépense − ${DEFICIT} kcal, arrondi, jamais sous ${nf(MIN_KCAL)} kcal. <b>Protéines</b> = 1,7 g × poids visé (${nf1(s.targetWeight)} kg).</p>
      <p>Ce sont des estimations (± 10 %). Ta courbe de poids sur 3-4 semaines reste le meilleur juge.</p>
    </details>
  </div>`;
}
function bindNeeds(el, rerender) {
  const s = bodyCfg();
  const a = $('#napply', el);
  if (a) a.onclick = () => {
    const n = needs();
    Object.assign(s, { kcal: n.kcal, prot: n.prot });
    save(); checkCelebrations(); rerender(); toast(`Objectifs mis à jour : ${nf(n.kcal)} kcal · ${nf(n.prot)} g ✓`);
  };
  const k = $('#nkeep', el);
  if (k) k.onclick = () => { const n = needs(); S.needsDismissed = { kcal: n.kcal, prot: n.prot }; save(); rerender(); toast('Ok, on garde tes objectifs'); };
  $$('[data-act-lvl]', el).forEach((b) => b.onclick = () => { s.activity = b.dataset.actLvl; save(); rerender(); });
  const upd = (id, key, lo, hi) => { $(id, el).onchange = (e) => { const v = num(e.target.value); if (v >= lo && v <= hi) { s[key] = Math.round(v); save(); rerender(); } else toast('Valeur à vérifier'); }; };
  upd('#nh', 'height', 130, 210);
  upd('#na', 'age', 14, 90);
}

/* ---------------- Sommeil ---------------- */
function sleepCfg() {
  S.sleep = S.sleep || {};
  return Object.assign(S.sleep, { wake: '07:00', fall: 15, cycle: 90, log: [], ...S.sleep });
}
const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const fmtH = (min) => { const t = ((Math.round(min) % 1440) + 1440) % 1440; return `${Math.floor(t / 60)}h${pad(t % 60)}`; };
const fmtDur = (min) => `${Math.floor(min / 60)} h ${pad(Math.round(min % 60))}`;
function bedtimesFor(wake) {
  const c = sleepCfg();
  return [6, 5, 4].map((n) => ({ n, at: toMin(wake) - c.fall - n * c.cycle, dur: n * c.cycle }));
}
function sleepAnalysis(bed, wake) {
  const c = sleepCfg();
  let dur = toMin(wake) - toMin(bed); if (dur <= 0) dur += 1440;
  const asleep = Math.max(0, dur - c.fall);
  const cycles = asleep / c.cycle;
  const rest = asleep % c.cycle;
  const endOfCycle = rest <= 20 || rest >= c.cycle - 10;
  return { dur, asleep, cycles, endOfCycle };
}
function sleepBanner() {
  const c = sleepCfg(), now = new Date(), h = now.getHours();
  if (h >= 20) {
    const best = bedtimesFor(c.wake).find((b) => b.n === 5);
    return `<button class="banner sleep-banner" data-go="suivi:sommeil"><span class="b-emoji">🌙</span><span>Réveil à ${fmtH(toMin(c.wake))} ? Couche-toi vers <b>${fmtH(best.at)}</b> (5 cycles) ou ${fmtH(best.at - c.cycle)} (6 cycles)</span><span class="b-go">›</span></button>`;
  }
  const y = addDays(todayKey(), -1);
  if (h >= 5 && h < 11 && !c.log.some((x) => x.date === y)) {
    return `<button class="banner sleep-banner" data-go="suivi:sommeil"><span class="b-emoji">😴</span><span>Comment as-tu dormi cette nuit ?</span><span class="b-go">›</span></button>`;
  }
  return '';
}
const SLEEP_FEELS = { tired: '😩 Fatiguée', ok: '🙂 Correct', great: '⚡ En forme' };

function renderSommeil(el) {
  const c = sleepCfg();
  const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
  const beds = bedtimesFor(c.wake);
  const wakes = [4, 5, 6].map((n) => ({ n, at: nowMin + c.fall + n * c.cycle, dur: n * c.cycle }));
  const log = [...c.log].sort((a, b) => b.date.localeCompare(a.date));
  const last7 = log.slice(0, 7);
  const avg = last7.length ? last7.reduce((a, x) => a + sleepAnalysis(x.bed, x.wake).asleep, 0) / last7.length : 0;
  const fin = last7.filter((x) => sleepAnalysis(x.bed, x.wake).endOfCycle).length;
  const y = addDays(todayKey(), -1);
  const optRow = (o, label) => `<div class="sleep-opt ${o.n === 5 ? 'best' : ''}"><b>${fmtH(o.at)}</b><span>${o.n} cycles · ${fmtDur(o.dur)}${o.n === 5 ? ' · ⭐ idéal' : o.n === 6 ? ' · ⭐ idéal' : ' · nuit courte'}</span>${label ? `<small>${label}</small>` : ''}</div>`;

  el.innerHTML = `${suiviHead()}
    <div class="card">
      <h2>⏰ Je dois me réveiller à…</h2>
      <input type="time" id="swake" value="${c.wake}" class="time-big">
      <p class="small muted" style="margin:10px 0 6px">Couche-toi à l'une de ces heures pour te réveiller <b>en fin de cycle</b> :</p>
      ${beds.map((o) => optRow(o)).join('')}
      <p class="field-hint">Déjà compté : ${c.fall} min pour t'endormir. Programme ensuite ton réveil dans l'app Horloge.</p>
    </div>
    <div class="card">
      <h2>🛏️ Si je me couche maintenant (${fmtH(nowMin)})</h2>
      ${wakes.map((o) => optRow(o)).join('')}
    </div>

    <div class="card">
      <h2>📓 Ma nuit</h2>
      <div class="grid2">
        <label class="field"><span>Couchée à</span><input type="time" id="sbed" value="${(log.find((x) => x.date === y) || {}).bed || fmtTime(toMin(c.wake) - c.fall - 5 * c.cycle)}"></label>
        <label class="field"><span>Réveillée à</span><input type="time" id="swk" value="${(log.find((x) => x.date === y) || {}).wake || c.wake}"></label>
      </div>
      <div class="group"><div class="group-lbl">Au réveil, je me sentais…</div>
        <div class="chips fill">${Object.entries(SLEEP_FEELS).map(([k, l]) => `<button class="chip" data-sfeel="${k}" aria-pressed="${k === 'ok'}">${l}</button>`).join('')}</div></div>
      <p class="live" id="slive"></p>
      <button class="btn btn-primary btn-block" id="ssave">Enregistrer la nuit dernière</button>
    </div>

    ${log.length ? `<div class="card">
      <h2>Mes 7 dernières nuits</h2>
      <div class="tokens" style="margin-bottom:10px">
        <span class="token">⏱️ ${fmtDur(avg)} en moyenne</span>
        <span class="token">🔄 ${fin}/${last7.length} réveils en fin de cycle</span>
      </div>
      ${avg && avg < 7 * 60 ? '<div class="kind">Moins de 7 h de sommeil en moyenne : la récupération musculaire et la gestion de la faim en pâtissent (le manque de sommeil augmente les fringales). Vise 5 cycles.</div>' : ''}
      ${log.slice(0, 14).map((x) => { const a = sleepAnalysis(x.bed, x.wake); return `<div class="hist" style="padding:10px 0"><div class="hist-icon ${a.endOfCycle ? 'win' : ''}">${a.endOfCycle ? '🔄' : '⚠️'}</div><div class="item-main"><div class="item-name">${cap(fmtDay(x.date, { weekday: 'long', day: 'numeric', month: 'short' }))} · ${fmtDur(a.asleep)}</div><div class="item-sub">${x.bed} → ${x.wake} · ${nf1(a.cycles)} cycles · ${a.endOfCycle ? 'fin de cycle' : 'milieu de cycle'}${x.feel ? ' · ' + SLEEP_FEELS[x.feel] : ''}</div></div><button class="icon-btn" data-sdel="${x.date}" aria-label="Supprimer">✕</button></div>`; }).join('')}
    </div>` : ''}

    <div class="card">
      <h2>⚙️ Mes réglages</h2>
      <div class="quota-row" style="border:0"><div class="q-week">Temps pour m'endormir<small>Moyenne habituelle</small></div>
        <span class="stepper"><button data-sf="-5" aria-label="Moins">−</button><b>${c.fall} min</b><button data-sf="5" aria-label="Plus">+</button></span></div>
      <div class="quota-row"><div class="q-week">Durée d'un cycle<small>90 min en moyenne (entre 80 et 110 selon les personnes)</small></div>
        <span class="stepper"><button data-sc="-5" aria-label="Moins">−</button><b>${c.cycle} min</b><button data-sc="5" aria-label="Plus">+</button></span></div>
      <p class="field-hint">Astuce : si tu te réveilles souvent naturellement juste avant ton réveil, tu as trouvé ton rythme. Si tu te sens groggy alors que l'app dit « fin de cycle », essaie 85 ou 95 min.</p>
    </div>

    <div class="card">
      <h2>💡 Mieux récupérer</h2>
      ${[
        ['🕙', 'Des horaires réguliers', 'Même heure de lever tous les jours, week-end compris (± 1 h) : c\'est ce qui règle le mieux ton horloge interne.'],
        ['☕', 'Pas de café après 14 h', 'La caféine agit encore 6 à 8 h après.'],
        ['📱', 'Écrans coupés 30 min avant', 'Ou mode nuit + luminosité au minimum.'],
        ['🏋️‍♀️', 'Sport intense pas trop tard', 'Finis tes séances intenses au moins 2-3 h avant de dormir.'],
        ['🍽️', 'Dîner 2 h avant le coucher', 'Un dîner avec des protéines aide la récupération musculaire pendant la nuit.'],
        ['🌡️', 'Chambre fraîche et sombre', 'Autour de 18-19 °C.'],
        ['😴', 'Le sommeil fait maigrir… vraiment', 'Moins de 7 h de sommeil augmente l\'hormone de la faim et les envies de sucré.'],
      ].map(([e, t, d]) => `<div class="est"><span class="est-emoji">${e}</span><div><strong>${t}</strong><span class="muted small">${d}</span></div></div>`).join('')}
      <p class="field-hint">Les cycles de 90 min sont une moyenne : c'est un repère utile, pas une science exacte. Écoute aussi tes sensations.</p>
    </div>`;

  bindSuiviHead(el);
  let feel = 'ok';
  const live = () => {
    const a = sleepAnalysis($('#sbed', el).value || '23:00', $('#swk', el).value || '07:00');
    $('#slive', el).textContent = `${fmtDur(a.asleep)} de sommeil · ${nf1(a.cycles)} cycles · ${a.endOfCycle ? '🔄 réveil en fin de cycle' : '⚠️ réveil en plein cycle'}`;
  };
  live();
  $('#sbed', el).oninput = live; $('#swk', el).oninput = live;
  $('#swake', el).onchange = (e) => { if (e.target.value) { c.wake = e.target.value; save(); renderSommeil(el); } };
  $$('[data-sfeel]', el).forEach((b) => b.onclick = () => { feel = b.dataset.sfeel; $$('[data-sfeel]', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
  $('#ssave', el).onclick = () => {
    const bed = $('#sbed', el).value, wake = $('#swk', el).value;
    if (!bed || !wake) { toast('Indique tes heures de coucher et de réveil'); return; }
    c.log = c.log.filter((x) => x.date !== y);
    c.log.push({ date: y, bed, wake, feel });
    if (c.log.length > 60) c.log = c.log.sort((a, b) => a.date.localeCompare(b.date)).slice(-60);
    save(); renderSommeil(el);
    const a = sleepAnalysis(bed, wake);
    toast(a.endOfCycle ? '🔄 Nuit enregistrée : réveil en fin de cycle, bravo !' : '😴 Nuit enregistrée');
  };
  $$('[data-sdel]', el).forEach((b) => b.onclick = () => { c.log = c.log.filter((x) => x.date !== b.dataset.sdel); save(); renderSommeil(el); });
  $$('[data-sf]', el).forEach((b) => b.onclick = () => { c.fall = Math.max(5, Math.min(45, c.fall + +b.dataset.sf)); save(); renderSommeil(el); });
  $$('[data-sc]', el).forEach((b) => b.onclick = () => { c.cycle = Math.max(80, Math.min(110, c.cycle + +b.dataset.sc)); save(); renderSommeil(el); });
}
function fmtTime(min) { const t = ((Math.round(min) % 1440) + 1440) % 1440; return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; }
