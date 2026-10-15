'use strict';
/* =========================================================
   Cap 65 : illustrations animées des exercices (SVG)
   Un personnage en traits, 2 positions (A ⇄ B) animées en boucle.
   ========================================================= */

const ILLUS = (() => {
  const L = (x1, y1, x2, y2) => [x1, y1, x2, y2];
  // os du corps : [articulation 1, articulation 2]
  const SIDE = [['n', 'p'], ['n', 'e'], ['e', 'w'], ['p', 'k'], ['k', 'a']];
  const SIDE2 = [['n', 'e2'], ['e2', 'w2'], ['p', 'k2'], ['k2', 'a2']];
  const FRONT = [['n', 'p'], ['s', 's2'], ['s', 'e'], ['e', 'w'], ['s2', 'e2'], ['e2', 'w2'], ['p', 'k'], ['k', 'a'], ['p', 'k2'], ['k2', 'a2']];
  const mirror = (o) => { const r = {}; Object.entries(o).forEach(([k, [x, y]]) => { r[k] = [200 - x, y]; }); return r; };
  const both = (pose, left) => { const m = mirror(left); const r = { ...pose }; Object.entries(left).forEach(([k, v]) => { r[k] = v; r[k + '2'] = m[k]; }); return r; };
  const dumbbell = (j) => ({ t: 'line', cls: 'acc thick', a: (P) => L(P[j][0] - 7, P[j][1], P[j][0] + 7, P[j][1]) });
  const bench = (x, y, w) => `<rect class="eq-fill" x="${x}" y="${y}" width="${w}" height="7" rx="3"/><line class="eq" x1="${x + 6}" y1="${y + 7}" x2="${x + 6}" y2="150"/><line class="eq" x1="${x + w - 6}" y1="${y + 7}" x2="${x + w - 6}" y2="150"/>`;
  const floor = '<line class="ground" x1="10" y1="150" x2="190" y2="150"/>';

  const P = {
    'tirage-vertical': {
      bg: floor + bench(66, 100, 52) + '<line class="eq" x1="150" y1="4" x2="150" y2="150"/><line class="eq" x1="108" y1="4" x2="150" y2="4"/><rect class="eq-fill" x="118" y="88" width="14" height="8" rx="4"/>',
      A: { h: [86, 40], n: [91, 56], p: [96, 98], e: [99, 34], w: [104, 14], k: [126, 96], a: [128, 132] },
      B: { h: [84, 41], n: [89, 57], p: [96, 98], e: [80, 80], w: [101, 60], k: [126, 96], a: [128, 132] },
      bones: SIDE,
      props: [
        { t: 'line', cls: 'eq', a: (Q) => L(108, 4, Q.w[0], Q.w[1]) },
        { t: 'line', cls: 'acc thick', a: (Q) => L(Q.w[0] - 22, Q.w[1], Q.w[0] + 22, Q.w[1]) },
      ],
    },
    'rowing-poulie': {
      bg: floor + '<rect class="eq-fill" x="40" y="112" width="56" height="7" rx="3"/><line class="eq" x1="20" y1="126" x2="180" y2="126"/><line class="eq" x1="132" y1="98" x2="136" y2="126"/><rect class="eq-fill" x="168" y="92" width="14" height="34" rx="3"/>',
      A: { h: [72, 56], n: [74, 70], p: [70, 110], e: [96, 82], w: [118, 92], k: [100, 94], a: [128, 112] },
      B: { h: [64, 54], n: [66, 69], p: [70, 110], e: [46, 90], w: [76, 98], k: [100, 94], a: [128, 112] },
      bones: SIDE,
      props: [{ t: 'line', cls: 'eq', a: (Q) => L(Q.w[0], Q.w[1], 170, 112) }, { t: 'circle', cls: 'acc-fill', a: (Q) => [Q.w[0], Q.w[1], 4] }],
    },
    'developpe-epaules': {
      bg: floor + '<rect class="eq-fill" x="84" y="40" width="32" height="64" rx="6"/>' + bench(70, 100, 60),
      A: both({ n: [100, 54], h: [100, 38], p: [100, 98] }, { s: [86, 58], e: [64, 62], w: [66, 38], k: [86, 112], a: [86, 146] }),
      B: both({ n: [100, 54], h: [100, 38], p: [100, 98] }, { s: [86, 58], e: [77, 35], w: [84, 12], k: [86, 112], a: [86, 146] }),
      bones: FRONT, front: true,
      props: [dumbbell('w'), dumbbell('w2')],
    },
    'elevations-laterales': {
      bg: floor,
      A: both({ n: [100, 48], h: [100, 32], p: [100, 95] }, { s: [87, 52], e: [83, 74], w: [81, 96], k: [93, 120], a: [92, 148] }),
      B: both({ n: [100, 48], h: [100, 32], p: [100, 95] }, { s: [87, 52], e: [65, 54], w: [43, 57], k: [93, 120], a: [92, 148] }),
      bones: FRONT, front: true,
      props: [dumbbell('w'), dumbbell('w2')],
    },
    'curl-biceps': {
      bg: floor,
      A: { h: [100, 28], n: [100, 45], p: [100, 95], e: [101, 70], w: [103, 96], k: [102, 120], a: [100, 148] },
      B: { h: [100, 28], n: [100, 45], p: [100, 95], e: [101, 70], w: [115, 50], k: [102, 120], a: [100, 148] },
      bones: SIDE,
      props: [{ t: 'line', cls: 'acc thick', a: (Q) => L(Q.w[0] - 2, Q.w[1] - 7, Q.w[0] + 2, Q.w[1] + 7) }],
    },
    'triceps-corde': {
      bg: floor + '<line class="eq" x1="50" y1="4" x2="50" y2="150"/><circle class="eq" cx="56" cy="14" r="5"/>',
      A: { h: [102, 30], n: [102, 46], p: [108, 95], e: [100, 72], w: [76, 68], k: [106, 120], a: [108, 148] },
      B: { h: [102, 30], n: [102, 46], p: [108, 95], e: [100, 72], w: [94, 98], k: [106, 120], a: [108, 148] },
      bones: SIDE,
      props: [{ t: 'line', cls: 'eq', a: (Q) => L(58, 18, Q.w[0], Q.w[1]) }, { t: 'circle', cls: 'acc-fill', a: (Q) => [Q.w[0], Q.w[1], 4] }],
    },
    'pompes-inclinees': {
      bg: floor + bench(26, 96, 46),
      A: { w: [52, 96], e: [58, 82], n: [64, 68], h: [52, 60], p: [114, 104], k: [142, 124], a: [170, 146] },
      B: { w: [52, 96], e: [82, 78], n: [74, 88], h: [61, 83], p: [118, 114], k: [144, 130], a: [170, 146] },
      bones: SIDE,
    },
    'planche': {
      bg: floor,
      A: { h: [48, 116], n: [60, 122], e: [62, 148], w: [84, 148], p: [112, 126], k: [142, 135], a: [172, 146] },
      B: { h: [48, 115], n: [60, 121], e: [62, 148], w: [84, 148], p: [112, 124], k: [142, 134], a: [172, 146] },
      bones: SIDE, dur: 3.6,
    },
    'presse': {
      bg: floor + '<line class="eq thick" x1="36" y1="72" x2="62" y2="126"/><line class="eq thick" x1="62" y1="126" x2="96" y2="126"/><line class="eq" x1="80" y1="126" x2="80" y2="150"/><line class="eq" x1="120" y1="150" x2="176" y2="40"/>',
      A: { h: [40, 64], n: [48, 80], p: [70, 120], e: [62, 104], w: [76, 120], k: [82, 84], a: [110, 98] },
      B: { h: [40, 64], n: [48, 80], p: [70, 120], e: [62, 104], w: [76, 120], k: [100, 96], a: [124, 70] },
      bones: SIDE,
      props: [{ t: 'line', cls: 'acc thick', a: (Q) => L(Q.a[0] - 10, Q.a[1] - 14, Q.a[0] + 14, Q.a[1] + 10) }],
    },
    'hip-thrust': {
      bg: floor + '<rect class="eq-fill" x="18" y="100" width="44" height="50" rx="4"/>',
      A: { h: [46, 92], n: [60, 100], p: [88, 130], e: [74, 118], w: [88, 116], k: [114, 110], a: [120, 148] },
      B: { h: [46, 92], n: [60, 100], p: [92, 102], e: [76, 100], w: [92, 90], k: [120, 102], a: [120, 148] },
      bones: SIDE,
      props: [{ t: 'circle', cls: 'acc-fill', a: (Q) => [Q.p[0], Q.p[1] - 13, 9] }],
    },
    'fentes-arriere': {
      bg: floor,
      A: { h: [100, 28], n: [100, 45], p: [100, 95], e: [101, 70], w: [102, 95], k: [102, 120], a: [100, 148], k2: [98, 120], a2: [100, 148] },
      B: { h: [104, 46], n: [103, 62], p: [100, 108], e: [104, 86], w: [105, 110], k: [124, 116], a: [122, 148], k2: [84, 140], a2: [58, 146] },
      bones: SIDE, far: [['p', 'k2'], ['k2', 'a2']],
      props: [{ t: 'line', cls: 'acc thick', a: (Q) => L(Q.w[0] - 7, Q.w[1], Q.w[0] + 7, Q.w[1]) }],
    },
    'leg-curl': {
      bg: floor + bench(28, 104, 120),
      A: { h: [36, 90], n: [50, 98], e: [44, 112], w: [36, 104], p: [100, 98], k: [134, 99], a: [166, 100] },
      B: { h: [36, 90], n: [50, 98], e: [44, 112], w: [36, 104], p: [100, 98], k: [134, 99], a: [128, 68] },
      bones: SIDE,
      props: [{ t: 'circle', cls: 'acc-fill', a: (Q) => [Q.a[0] + 3, Q.a[1] - 7, 6] }],
    },
    'abducteurs': {
      bg: floor + '<rect class="eq-fill" x="84" y="44" width="32" height="58" rx="6"/>' + bench(66, 100, 68),
      A: both({ n: [100, 52], h: [100, 36], p: [100, 98] }, { s: [88, 56], e: [80, 80], w: [80, 100], k: [92, 112], a: [92, 146] }),
      B: both({ n: [100, 52], h: [100, 36], p: [100, 98] }, { s: [88, 56], e: [80, 80], w: [80, 100], k: [70, 110], a: [76, 146] }),
      bones: FRONT, front: true,
      props: [
        { t: 'line', cls: 'acc thick', a: (Q) => L(Q.k[0] - 7, Q.k[1] - 10, Q.k[0] - 7, Q.k[1] + 10) },
        { t: 'line', cls: 'acc thick', a: (Q) => L(Q.k2[0] + 7, Q.k2[1] - 10, Q.k2[0] + 7, Q.k2[1] + 10) },
      ],
    },
    'kickback': {
      bg: floor + '<line class="eq" x1="34" y1="40" x2="34" y2="150"/><circle class="eq" cx="40" cy="144" r="4"/>',
      A: { h: [56, 64], n: [68, 72], e: [54, 76], w: [38, 74], p: [102, 92], k: [100, 120], a: [98, 148], k2: [104, 118], a2: [108, 144] },
      B: { h: [56, 64], n: [68, 72], e: [54, 76], w: [38, 74], p: [102, 92], k: [100, 120], a: [98, 148], k2: [130, 98], a2: [158, 92] },
      bones: [['n', 'p'], ['n', 'e'], ['e', 'w'], ['p', 'k'], ['k', 'a'], ['p', 'k2'], ['k2', 'a2']],
      props: [{ t: 'line', cls: 'eq', a: (Q) => L(44, 144, Q.a2[0], Q.a2[1]) }, { t: 'circle', cls: 'acc-fill', a: (Q) => [Q.a2[0], Q.a2[1], 4] }],
    },
    'squat': {
      bg: floor,
      A: { h: [100, 28], n: [100, 45], p: [100, 95], e: [104, 70], w: [106, 95], k: [102, 120], a: [100, 148] },
      B: { h: [112, 54], n: [108, 70], p: [86, 112], e: [124, 80], w: [140, 76], k: [114, 120], a: [100, 148] },
      bones: SIDE,
    },
    'mobilite': {
      bg: floor,
      A: both({ n: [100, 48], h: [100, 32], p: [100, 95] }, { s: [87, 52], e: [70, 40], w: [62, 20], k: [93, 120], a: [92, 148] }),
      B: both({ n: [100, 48], h: [100, 32], p: [100, 95] }, { s: [87, 52], e: [66, 66], w: [56, 86], k: [93, 120], a: [92, 148] }),
      bones: FRONT, front: true,
    },
    'stretch': {
      bg: floor,
      A: { h: [100, 28], n: [100, 45], p: [100, 95], e: [96, 72], w: [90, 96], k: [101, 120], a: [100, 148], k2: [98, 122], a2: [88, 104] },
      B: { h: [100, 28], n: [100, 45], p: [100, 95], e: [96, 72], w: [88, 100], k: [101, 120], a: [100, 148], k2: [96, 124], a2: [86, 100] },
      bones: SIDE, far: [['p', 'k2'], ['k2', 'a2']], dur: 4,
    },
    'velo': {
      bg: floor + '<line class="eq thick" x1="84" y1="84" x2="106" y2="84"/><line class="eq" x1="96" y1="86" x2="118" y2="124"/><line class="eq" x1="118" y1="124" x2="146" y2="72"/><line class="eq thick" x1="140" y1="70" x2="154" y2="70"/><line class="eq" x1="70" y1="150" x2="150" y2="150"/><line class="eq" x1="118" y1="124" x2="100" y2="150"/><line class="eq" x1="118" y1="124" x2="136" y2="150"/><circle class="eq" cx="118" cy="124" r="12"/>',
      A: { h: [126, 40], n: [116, 54], p: [94, 82], e: [130, 64], w: [146, 70], k: [122, 92], a: [126, 118] },
      B: { h: [126, 40], n: [116, 54], p: [94, 82], e: [130, 64], w: [146, 70], k: [114, 102], a: [108, 132] },
      bones: SIDE, dur: 1.2,
    },
    'elliptique': {
      bg: floor + '<line class="eq" x1="40" y1="146" x2="160" y2="146"/><line class="eq thick" x1="150" y1="146" x2="150" y2="40"/>',
      A: { h: [100, 30], n: [100, 46], p: [98, 94], e: [118, 68], w: [140, 60], k: [112, 116], a: [104, 140], e2: [116, 74], w2: [140, 78], k2: [94, 120], a2: [80, 134] },
      B: { h: [100, 30], n: [100, 46], p: [98, 94], e: [116, 74], w: [140, 78], k: [96, 120], a: [82, 134], e2: [118, 68], w2: [140, 60], k2: [112, 116], a2: [104, 140] },
      bones: SIDE, far: SIDE2.slice(0, 2).concat(SIDE2.slice(2)), dur: 1.4,
    },
    'rameur': {
      bg: '<line class="eq" x1="16" y1="128" x2="176" y2="128"/><line class="eq" x1="30" y1="128" x2="30" y2="150"/><line class="eq" x1="160" y1="128" x2="160" y2="150"/><circle class="eq" cx="168" cy="110" r="14"/><line class="eq" x1="130" y1="104" x2="134" y2="128"/>' + floor,
      A: { h: [102, 66], n: [94, 80], p: [80, 120], e: [112, 96], w: [128, 102], k: [104, 96], a: [128, 122] },
      B: { h: [36, 66], n: [44, 80], p: [56, 120], e: [36, 104], w: [62, 104], k: [92, 112], a: [128, 122] },
      bones: SIDE, dur: 2,
      props: [{ t: 'line', cls: 'eq', a: (Q) => L(Q.w[0], Q.w[1], 162, 108) }, { t: 'rect', cls: 'acc-fill', a: (Q) => [Q.p[0] - 12, 120, 24, 6] }],
    },
    'tapis': {
      bg: floor + '<line class="eq thick" x1="30" y1="142" x2="168" y2="122"/><line class="eq" x1="160" y1="124" x2="164" y2="40"/><line class="eq thick" x1="150" y1="40" x2="170" y2="40"/>',
      A: { h: [104, 26], n: [102, 42], p: [98, 90], e: [112, 64], w: [122, 82], k: [114, 112], a: [118, 132], e2: [92, 66], w2: [84, 86], k2: [94, 114], a2: [80, 138] },
      B: { h: [104, 26], n: [102, 42], p: [98, 90], e: [92, 66], w: [84, 86], k: [94, 114], a: [80, 138], e2: [112, 64], w2: [122, 82], k2: [114, 112], a2: [118, 132] },
      bones: SIDE, far: SIDE2, dur: 1.4,
    },
  };

  const KS = 'keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"';
  const anim = (name, a, b, dur) => (a === b ? '' : `<animate attributeName="${name}" values="${a};${b};${a}" dur="${dur}s" repeatCount="indefinite" ${KS}/>`);
  const r1 = (v) => Math.round(v * 10) / 10;

  function render(key) {
    const s = P[key];
    if (!s) return '';
    const A = s.A, B = s.B || s.A, dur = s.dur || 2.8;
    const out = [];
    const line = (a, b, cls) => {
      const names = ['x1', 'y1', 'x2', 'y2'];
      return `<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}">${names.map((n, i) => anim(n, r1(a[i]), r1(b[i]), dur)).join('')}</line>`;
    };
    const bone = ([j1, j2], cls) => (A[j1] && A[j2] ? line([...A[j1], ...A[j2]], [...B[j1], ...B[j2]], cls) : '');
    const prop = (p) => {
      const a = p.a(A), b = p.a(B);
      if (p.t === 'line') return line(a, b, p.cls);
      if (p.t === 'circle') return `<circle class="${p.cls}" cx="${a[0]}" cy="${a[1]}" r="${a[2]}">${anim('cx', r1(a[0]), r1(b[0]), dur)}${anim('cy', r1(a[1]), r1(b[1]), dur)}</circle>`;
      if (p.t === 'rect') return `<rect class="${p.cls}" x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" rx="3">${anim('x', r1(a[0]), r1(b[0]), dur)}${anim('y', r1(a[1]), r1(b[1]), dur)}</rect>`;
      return '';
    };
    out.push(s.bg || '');
    const far = s.far || [];
    // membres « de l'autre côté » en premier, plus clairs
    far.forEach((b) => out.push(bone(b, 'limb far')));
    if (!s.front) {
      // vue de profil : bras/jambe opposés implicites
    }
    s.bones.filter((b) => !far.some((f) => f[0] === b[0] && f[1] === b[1])).forEach((b) => out.push(bone(b, 'limb')));
    (s.props || []).forEach((p) => out.push(prop(p)));
    const h = A.h, hb = B.h;
    out.push(`<circle class="head" cx="${h[0]}" cy="${h[1]}" r="9">${anim('cx', h[0], hb[0], dur)}${anim('cy', h[1], hb[1], dur)}</circle>`);
    return `<svg class="illus" viewBox="0 0 200 160" role="img" aria-hidden="true">${out.join('')}</svg>`;
  }

  function forBlock(title, txt) {
    const t = `${title} ${txt}`.toLowerCase();
    if (/vélo/.test(title.toLowerCase())) return 'velo';
    if (/elliptique/.test(t)) return 'elliptique';
    if (/rameur/.test(title.toLowerCase())) return 'rameur';
    if (/tapis|marche/.test(title.toLowerCase())) return 'tapis';
    if (/mobilité/.test(t)) return 'mobilite';
    if (/étirement|retour au calme/.test(t)) return 'stretch';
    if (/presse/.test(t)) return 'presse';
    if (/tirage/.test(t)) return 'tirage-vertical';
    if (/squat|activation|circuit/.test(t)) return 'squat';
    return 'stretch';
  }
  return { render, forBlock, has: (k) => !!P[k] };
})();
