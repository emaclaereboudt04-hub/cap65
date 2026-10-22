// Génère ../illus.js à partir de _meta.json (liste des illustrations).
const fs = require('fs');
const meta = JSON.parse(fs.readFileSync(__dirname + '/_meta.json', 'utf8'));
const CATS = [['fruits', 'Fruits'], ['patisserie', 'Pâtisserie'], ['ingredients', 'Ingrédients'], ['ustensiles', 'Ustensiles'], ['cuisine', 'Cuisine'], ['boissons', 'Boissons'], ['deco', 'Botanique & déco']];
const out = `'use strict';
/* Illustrations aquarelle (générées par atelier/ : dessins.js → rendu.js → aquarelle.py → manifeste.js) */
const ILLUS = (() => {
  const list = ${JSON.stringify(meta)};
  const CATS = ${JSON.stringify(CATS)};
  const byId = Object.fromEntries(list.map((s) => [s.id, s]));
  const src = (id) => 'illus/' + id + '.webp?v=2';
  const norm = (t) => (t || '').toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  function suggest(title, extra = '') {
    const t = ' ' + norm(title) + ' '; const e = ' ' + norm(extra) + ' ';
    const score = new Map();
    list.forEach((s) => s.kw.forEach((k) => {
      const kk = norm(k);
      if (t.includes(kk)) score.set(s.id, Math.max(score.get(s.id) || 0, 10 + kk.length));
      else if (e.includes(kk)) score.set(s.id, Math.max(score.get(s.id) || 0, 1 + kk.length / 10));
    }));
    return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }
  return { list, CATS, byId, src, norm, suggest };
})();
`;
fs.writeFileSync(__dirname + '/../illus.js', out);
console.log('illus.js', meta.length);
