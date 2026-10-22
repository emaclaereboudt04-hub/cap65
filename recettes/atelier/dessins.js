/* Dessins vectoriels de base des illustrations (carré 100 × 100).
   Conventions :
   - fill="…"  : aplat de couleur (passe « aquarelle »)
   - le trait d'encre est ajouté automatiquement autour des formes
   - class="np" : pas de trait d'encre ; class="nf" : trait seulement ; class="fine" : trait fin
   - stroke="couleur" explicite : coup de pinceau (reste dans la passe couleur) */
var DESSINS = [];
(function () {
  const add = (id, name, cat, kw, art, defs = '') => DESSINS.push({ id, name, cat, kw, art, defs });
  const K = {
    red: '#D8483F', red2: '#B23A34', seed: '#F2D58A', leaf: '#76A055', leaf2: '#557D3D',
    cookie: '#D9A35F', cookie2: '#BF8445', choc: '#6E412B', choc2: '#53301F', choc3: '#8A5537',
    egg: '#CF9364', egg2: '#B97A4E', carton: '#D9D3C9', carton2: '#BDB6AA',
    steel: '#B9C0C6', steel2: '#8F989F', wood: '#CF9C66', wood2: '#AA7646',
    sack: '#EFE6D3', burlap: '#D8C29A', burlap2: '#BFA676', butter: '#F3E2A0', butter2: '#E5CD79',
    milk: '#9EC3DE', cream: '#FBF4E4', yolk: '#F2A830', copper: '#D48A4F', copper2: '#B56C38',
    lemon: '#F2D35B', orange: '#EE9A45', peach: '#F2B07E', pink: '#E9A3AE', berry: '#5A5E9C', berry2: '#3F4377',
    honey: '#E5A23A', glass: '#E6EEF0', paper: '#FBF7EE', green: '#8DB06A', olive: '#8E9A55', lav: '#9C8CC9', lav2: '#7C6BB0',
    rasp: '#D2556C', tomato: '#D9503F', wine: '#7E2F44', grey: '#D3D0CB', blue: '#7FA3C4',
  };
  const seeds = (pts, c = K.seed) => pts.map(([x, y, r = 0]) => `<ellipse class="np" cx="${x}" cy="${y}" rx="1.05" ry="1.7" transform="rotate(${r} ${x} ${y})" fill="${c}"/>`).join('');
  const leafP = (x, y, rot, len, w, fill = K.leaf, vein = true) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${len * 0.3} ${-w} ${len * 0.7} ${-w} ${len} 0 C${len * 0.7} ${w} ${len * 0.3} ${w} 0 0Z" fill="${fill}"/>${vein ? `<path class="fine" d="M1 0 L${len - 2} 0" fill="none"/>` : ''}</g>`;

  /* ================= Fruits ================= */
  add('fraise', 'Fraise', 'fruits', ['fraise', 'fraisier', 'strawberry'],
    `<path d="M50 29 C66 25 83 33 83 48 C83 66 65 83 53 92 C50 94 47 93 45 91 C32 80 17 64 18 48 C19 34 35 25 50 29Z" fill="${K.red}"/>
     <path class="np" d="M68 34 C80 42 80 58 66 76 C60 84 56 88 53 91 C62 76 70 60 66 36Z" fill="${K.red2}" opacity=".55"/>
     ${seeds([[34, 44, -20], [46, 41], [58, 41, 10], [70, 45, 20], [28, 56, -25], [40, 54, -10], [53, 53], [65, 55, 15], [75, 58, 25], [34, 67, -20], [46, 66, -5], [58, 66, 10], [69, 68, 20], [41, 78, -15], [52, 78], [62, 79, 15], [48, 87]])}
     <path d="M50 34 C44 37 34 37 27 33 C33 30 39 30 44 31 C38 27 35 22 34 17 C41 20 46 24 49 29 C50 23 53 19 58 16 C57 22 55 26 53 30 C58 27 64 26 71 28 C66 33 58 35 50 34Z" fill="${K.leaf}"/>
     <path d="M51 29 C51 22 53 15 57 9" stroke="${K.leaf2}" stroke-width="3" fill="none"/>`);

  add('framboises', 'Framboises', 'fruits', ['framboise', 'raspberry', 'fruits rouges'],
    `${leafP(50, 32, -160, 26, 9)}${leafP(50, 32, -20, 28, 10, K.leaf2)}
     ${[[38, 36], [44, 36], [50, 36], [56, 36], [62, 36], [34, 43], [40, 43], [46, 43], [52, 43], [58, 43], [64, 43], [35, 50], [41, 50], [47, 50], [53, 50], [59, 50], [65, 50], [37, 57], [43, 57], [49, 57], [55, 57], [61, 57], [40, 64], [46, 64], [52, 64], [58, 64], [43, 71], [49, 71], [55, 71], [47, 77], [53, 77]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4.4" fill="${i % 3 ? K.rasp : '#C2445C'}"/><circle class="np" cx="${x - 1.3}" cy="${y - 1.5}" r="1.1" fill="#fff" opacity=".55"/>`).join('')}
     <path d="M44 31 C46 27 54 27 56 31 L54 34 L46 34Z" fill="${K.leaf2}"/>`);

  add('myrtilles', 'Myrtilles', 'fruits', ['myrtille', 'bleuet', 'blueberr', 'fruits des bois'],
    `${leafP(22, 40, -20, 34, 11)}${leafP(52, 30, 15, 30, 10, K.leaf2)}
     ${[[36, 60, 13], [60, 58, 12], [48, 76, 13], [72, 76, 11], [26, 78, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${K.berry}"/><circle class="np" cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#B9BDE0" opacity=".55"/><path class="fine" d="M${x - 2.5} ${y - r + 3} l2.5 2 l2.5 -2 M${x} ${y - r + 5} l0 -2" fill="none"/><circle class="np" cx="${x}" cy="${y - r + 4}" r="2.4" fill="${K.berry2}"/>`).join('')}`);

  add('cerises', 'Cerises', 'fruits', ['cerise', 'clafoutis', 'griotte', 'cherry'],
    `<path d="M33 62 C36 44 46 28 60 16 M67 64 C66 46 63 30 60 16" stroke="${K.wood2}" stroke-width="2.2" fill="none"/>
     ${leafP(60, 16, -18, 30, 10)}
     <circle cx="31" cy="70" r="16" fill="${K.red}"/><path class="np" d="M40 60 C48 70 44 84 30 86 C40 80 44 70 40 60Z" fill="${K.red2}" opacity=".6"/><ellipse class="np" cx="25" cy="64" rx="4" ry="5.5" fill="#fff" opacity=".45"/>
     <circle cx="68" cy="72" r="16" fill="#C93C3A"/><path class="np" d="M77 62 C85 72 81 86 67 88 C77 82 81 72 77 62Z" fill="${K.red2}" opacity=".6"/><ellipse class="np" cx="62" cy="66" rx="4" ry="5.5" fill="#fff" opacity=".45"/>`);

  add('citron', 'Citron', 'fruits', ['citron', 'lemon', 'agrume', 'zeste'],
    `${leafP(56, 26, -40, 30, 10)}
     <path d="M14 56 C12 40 30 28 50 28 C70 28 86 38 88 52 C90 70 70 82 50 82 C30 82 16 72 14 56Z" fill="${K.lemon}"/>
     <path class="np" d="M60 34 C78 40 86 54 80 68 C74 78 62 82 52 82 C66 74 74 58 60 34Z" fill="#E2B93E" opacity=".55"/>
     <path d="M10 55 C11 52 13 52 15 53 M92 52 C90 50 88 51 87 53" fill="none"/>
     <path class="np" d="M30 44 C34 40 40 38 44 38" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>`);

  add('citron-tranche', 'Citron coupé', 'fruits', ['citron', 'lemon', 'citronnade', 'tarte au citron', 'lime'],
    `<path d="M14 64 C10 44 26 26 48 26 C56 26 62 28 66 31 L48 62Z" fill="${K.lemon}"/>
     <circle cx="62" cy="62" r="27" fill="#F4D96E"/>
     <circle cx="62" cy="62" r="23" fill="#FBEDB0"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const a0 = i / 9 * Math.PI * 2 + 0.1; const a1 = a0 + Math.PI * 2 / 9 - 0.16; const r = 20.5; return `<path class="np" d="M${62 + 2.5 * Math.cos((a0 + a1) / 2)} ${62 + 2.5 * Math.sin((a0 + a1) / 2)} L${62 + r * Math.cos(a0)} ${62 + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${62 + r * Math.cos(a1)} ${62 + r * Math.sin(a1)}Z" fill="#F5D45C"/>`; }).join('')}
     <circle cx="62" cy="62" r="27" fill="none"/>`);

  add('orange', 'Orange', 'fruits', ['orange', 'clementine', 'mandarine', 'agrume', 'pamplemousse'],
    `<circle cx="48" cy="58" r="32" fill="${K.orange}"/>
     <path class="np" d="M66 34 C82 46 82 70 66 84 C56 90 44 91 36 88 C58 84 74 64 66 34Z" fill="#D57B2E" opacity=".5"/>
     ${[[34, 46], [44, 66], [58, 50], [62, 72], [48, 80], [30, 66], [54, 38]].map(([x, y]) => `<circle class="np" cx="${x}" cy="${y}" r=".9" fill="#C46E28"/>`).join('')}
     <path d="M48 27 L49 21" stroke="${K.wood2}" stroke-width="2.4"/>
     ${leafP(50, 23, -30, 30, 10)}`);

  add('pomme', 'Pomme', 'fruits', ['pomme', 'tatin', 'apple', 'compote', 'crumble', 'chausson'],
    `<path d="M50 31 C40 22 15 24 16 51 C17 76 34 92 45 89 C48 88 49 87 50 87 C51 87 53 88 56 89 C67 92 84 76 85 51 C86 24 60 22 50 31Z" fill="#CF4A3C"/>
     <path class="np" d="M66 30 C82 38 86 60 76 78 C70 86 62 90 56 89 C70 76 74 52 66 30Z" fill="#A9352D" opacity=".55"/>
     <path class="np" d="M24 42 C30 34 40 33 44 36 C36 40 30 48 28 58 C24 54 22 48 24 42Z" fill="#E9A06B" opacity=".55"/>
     <path d="M50 31 C50 24 52 17 56 12" stroke="${K.wood2}" stroke-width="2.6" fill="none"/>
     ${leafP(54, 19, -25, 26, 8)}`);

  add('poire', 'Poire', 'fruits', ['poire', 'pear', 'belle-helene', 'belle helene'],
    `<path d="M50 22 C42 22 40 30 39 40 C38 49 25 55 25 70 C25 84 37 92 50 92 C63 92 75 84 75 70 C75 55 62 49 61 40 C60 30 58 22 50 22Z" fill="#C9C65A"/>
     <path class="np" d="M60 40 C64 52 78 58 74 76 C70 88 60 92 52 92 C66 82 68 62 60 40Z" fill="#A9A43E" opacity=".55"/>
     <path class="np" d="M32 62 C30 72 34 80 40 84" stroke="#E7D99A" stroke-width="4" opacity=".7" fill="none"/>
     <path d="M50 23 C50 16 52 11 56 7" stroke="${K.wood2}" stroke-width="2.6" fill="none"/>
     ${leafP(53, 14, -15, 22, 7)}`);

  add('peche', 'Pêche', 'fruits', ['peche', 'abricot', 'nectarine', 'apricot', 'peach'],
    `${leafP(50, 26, -150, 28, 9)}${leafP(52, 26, -40, 30, 10, K.leaf2)}
     <path d="M50 28 C26 28 16 46 18 62 C20 80 36 90 50 90 C64 90 80 80 82 62 C84 46 74 28 50 28Z" fill="${K.peach}"/>
     <path class="np" d="M54 30 C72 34 84 50 80 68 C76 82 64 88 54 90 C66 76 66 50 54 30Z" fill="#E07F5E" opacity=".55"/>
     <path class="fine" d="M50 30 C44 46 44 70 50 88" fill="none"/>`);

  add('figue', 'Figues', 'fruits', ['figue', 'fig'],
    `<path d="M38 18 C33 24 30 32 24 40 C14 54 14 70 24 80 C34 88 50 86 56 76 C62 64 56 50 48 40 C44 32 42 24 38 18Z" fill="#7B4A72"/>
     <path class="np" d="M48 42 C58 54 60 72 50 82 C56 70 54 56 46 44Z" fill="#5A2F54" opacity=".6"/>
     <path d="M38 18 L40 12" stroke="${K.wood2}" stroke-width="2.4"/>
     <path d="M56 56 C68 50 84 58 86 72 C88 86 74 94 62 90 C50 86 46 70 56 56Z" fill="#8A4F7C"/>
     <path d="M60 62 C70 58 80 64 80 73 C80 82 72 86 64 84 C56 82 54 70 60 62Z" fill="#E0727E"/>
     ${[[64, 68], [70, 64], [74, 72], [66, 78], [72, 80], [62, 74]].map(([x, y]) => `<circle class="np" cx="${x}" cy="${y}" r=".9" fill="#F6D7A4"/>`).join('')}`);

  /* ================= Pâtisserie ================= */
  add('cookies', 'Cookies', 'patisserie', ['cookie', 'biscuit', 'sable', 'pepites', 'gouter'],
    `${[[38, 48, 26, -8], [62, 62, 27, 6]].map(([cx, cy, r, rot]) => `
      <path d="M${cx} ${cy - r} C${cx + r * 0.6} ${cy - r * 1.02} ${cx + r * 1.02} ${cy - r * 0.5} ${cx + r} ${cy + 2} C${cx + r * 0.98} ${cy + r * 0.62} ${cx + r * 0.5} ${cy + r} ${cx - 2} ${cy + r} C${cx - r * 0.62} ${cy + r * 0.98} ${cx - r} ${cy + r * 0.5} ${cx - r} ${cy} C${cx - r * 1.02} ${cy - r * 0.6} ${cx - r * 0.55} ${cy - r} ${cx} ${cy - r}Z" fill="${K.cookie}" transform="rotate(${rot} ${cx} ${cy})"/>
      <path class="np" d="M${cx + r * 0.4} ${cy - r * 0.7} C${cx + r * 1.0} ${cy - r * 0.1} ${cx + r * 0.6} ${cy + r * 0.85} ${cx - r * 0.2} ${cy + r * 0.95} C${cx + r * 0.5} ${cy + r * 0.5} ${cx + r * 0.7} ${cy} ${cx + r * 0.4} ${cy - r * 0.7}Z" fill="${K.cookie2}" opacity=".5"/>
      ${[[-0.45, -0.4, 3.2], [0.15, -0.55, 2.6], [0.5, -0.1, 3.4], [-0.1, 0.05, 3.6], [-0.55, 0.3, 2.8], [0.25, 0.5, 3.2], [-0.15, 0.6, 2.4], [0.62, 0.38, 2.2]].map(([dx, dy, s]) => `<path class="np" d="M${cx + dx * r - s} ${cy + dy * r} q${s * 0.3} ${-s * 1.1} ${s * 1.1} ${-s * 0.8} q${s} ${s * 0.3} ${s * 0.8} ${s * 1.2} q${-s * 0.4} ${s * 0.8} ${-s * 1.2} ${s * 0.6} q${-s * 0.9} ${-s * 0.2} ${-s * 0.7} ${-s}Z" fill="${K.choc}"/>`).join('')}`).join('')}`);

  add('tarte-fraises', 'Tarte aux fraises', 'patisserie', ['tarte aux fraises', 'tarte fraise', 'tartelette', 'tarte'],
    `<path d="M8 54 L15 76 C30 84 70 84 85 76 L92 54Z" fill="#DDA764"/>
     <g class="fine">${[16, 26, 37, 50, 63, 74, 84].map((x) => `<path d="M${x} 58 L${x + (x - 50) * 0.08} 79" fill="none" opacity=".6"/>`).join('')}</g>
     <ellipse cx="50" cy="53" rx="42" ry="15" fill="#E3B474"/>
     <ellipse cx="50" cy="52" rx="35" ry="11" fill="#F8E7C2"/>
     ${[[26, 49], [38, 45], [51, 44], [64, 45], [75, 49], [32, 55], [45, 55], [58, 55], [70, 55], [51, 50]].map(([x, y], i) => `<path d="M${x - 5} ${y - 2} C${x - 4} ${y - 6} ${x + 4} ${y - 6} ${x + 5} ${y - 2} C${x + 5} ${y + 3} ${x + 1} ${y + 6} ${x} ${y + 6} C${x - 1} ${y + 6} ${x - 5} ${y + 3} ${x - 5} ${y - 2}Z" fill="${i % 2 ? K.red : '#C93E3A'}"/><path class="np" d="M${x - 3} ${y - 2} L${x + 3} ${y - 2}" stroke="#F7C9B8" stroke-width="1.6" fill="none"/>`).join('')}
     ${leafP(48, 41, -140, 9, 3)}${leafP(52, 41, -40, 9, 3, K.leaf2)}`);

  add('tarte-pommes', 'Tarte aux pommes', 'patisserie', ['tarte aux pommes', 'tarte pomme', 'tatin', 'tourte', 'pie', 'amandine'],
    `<path d="M8 54 L15 76 C30 84 70 84 85 76 L92 54Z" fill="#CF9150"/>
     <ellipse cx="50" cy="53" rx="42" ry="15" fill="#D99E5C"/>
     <ellipse cx="50" cy="52" rx="35" ry="11" fill="#F0CF86"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = i / 12 * Math.PI * 2; const x = 50 + 22 * Math.cos(a); const y = 52 + 7 * Math.sin(a); return `<path d="M50 52 Q${50 + 30 * Math.cos(a + 0.25)} ${52 + 9.5 * Math.sin(a + 0.25)} ${x + 11 * Math.cos(a)} ${y + 3.5 * Math.sin(a)}" stroke="#E6B566" stroke-width="5" fill="none" class="np"/><path class="fine" d="M${50 + 8 * Math.cos(a)} ${52 + 2.6 * Math.sin(a)} Q${50 + 30 * Math.cos(a + 0.25)} ${52 + 9.5 * Math.sin(a + 0.25)} ${x + 11 * Math.cos(a)} ${y + 3.5 * Math.sin(a)}" fill="none"/>`; }).join('')}
     <ellipse class="np" cx="50" cy="52" rx="7" ry="2.5" fill="#E6B566"/>`);

  add('gateau', 'Part de gâteau', 'patisserie', ['gateau', 'cake', 'fraisier', 'genoise', 'layer', 'victoria', 'anniversaire'],
    `<path d="M10 62 L84 50 L84 82 L10 90Z" fill="#F4E2BE"/>
     <path class="np" d="M10 70 L84 59 L84 63 L10 74Z M10 80 L84 70 L84 74 L10 84Z" fill="#E7A1A6"/>
     <path d="M10 70 L84 59 M10 74 L84 63 M10 80 L84 70 M10 84 L84 74" class="fine" fill="none" opacity=".5"/>
     <path d="M84 50 C88 54 90 60 90 64 L90 80 L84 82Z" fill="#E7CFA4"/>
     <path d="M10 62 L74 32 C82 36 88 42 90 50 L84 50Z" fill="#FBF2EA"/>
     <path d="M10 62 L84 50 C86 54 88 56 90 56 C88 58 86 58 84 56 L10 66 C8 64 8 63 10 62Z" fill="#FBF2EA"/>
     <path d="M70 34 C64 30 64 22 70 21 C76 20 80 26 76 33Z" fill="${K.red}"/>
     ${leafP(71, 21, -100, 8, 3)}`);

  add('macarons', 'Macarons', 'patisserie', ['macaron', 'meringue', 'ganache', 'pistache', 'framboise'],
    `${[[32, 68, '#E8A9B1', '#F7EBDD'], [64, 64, '#B9CC94', '#F2E8D6'], [48, 36, '#E9C98A', '#7A4A33']].map(([x, y, c, f]) => `
      <path d="M${x - 19} ${y + 4} C${x - 19} ${y + 13} ${x - 10} ${y + 16} ${x} ${y + 16} C${x + 10} ${y + 16} ${x + 19} ${y + 13} ${x + 19} ${y + 4}Z" fill="${c}"/>
      <path class="fine" d="M${x - 19} ${y + 4} q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.5 -2 3 0 q1.6 -2 2 0" fill="none"/>
      <rect x="${x - 18}" y="${y - 2}" width="36" height="6" rx="3" fill="${f}"/>
      <path d="M${x - 19} ${y - 3} C${x - 19} ${y - 13} ${x - 10} ${y - 16} ${x} ${y - 16} C${x + 10} ${y - 16} ${x + 19} ${y - 13} ${x + 19} ${y - 3}Z" fill="${c}"/>
      <path class="np" d="M${x - 12} ${y - 10} C${x - 6} ${y - 14} ${x + 2} ${y - 14} ${x + 6} ${y - 13}" stroke="#fff" stroke-width="2.4" opacity=".5" fill="none"/>`).join('')}`);

  add('croissant', 'Croissant', 'patisserie', ['croissant', 'viennoiserie', 'petit dejeuner', 'brunch', 'pain au chocolat'],
    `<path d="M6 64 C8 52 16 44 26 42 C34 32 42 28 50 28 C58 28 66 32 74 42 C84 44 92 52 94 64 C90 70 82 70 76 64 C70 58 62 56 50 56 C38 56 30 58 24 64 C18 70 10 70 6 64Z" fill="#DE9E52"/>
     <path class="np" d="M26 42 C34 50 36 56 36 58 L24 64 C18 60 20 50 26 42Z M74 42 C66 50 64 56 64 58 L76 64 C82 60 80 50 74 42Z" fill="#C77F35" opacity=".6"/>
     <path class="np" d="M40 32 C46 30 54 30 60 32 C56 36 44 36 40 32Z" fill="#F2CB8A" opacity=".8"/>
     <path d="M26 42 C33 48 36 54 36 58 M40 31 C45 40 45 48 43 56 M60 31 C55 40 55 48 57 56 M74 42 C67 48 64 54 64 58" fill="none"/>`);

  add('pancakes', 'Pancakes', 'patisserie', ['pancake', 'crepe', 'blini', 'brunch', 'petit dejeuner'],
    `${[76, 66, 56, 46].map((y) => `<path d="M14 ${y - 4} C14 ${y + 4} 30 ${y + 7} 50 ${y + 7} C70 ${y + 7} 86 ${y + 4} 86 ${y - 4}Z" fill="#E7B472"/><ellipse cx="50" cy="${y - 4}" rx="36" ry="7.5" fill="#F6DDA9"/>`).join('')}
     <path d="M18 40 C22 46 22 52 24 56 C26 60 30 58 30 52 C32 48 34 50 36 56 C38 64 42 66 44 60 C46 54 50 52 54 58 C56 62 60 62 62 56 C64 50 68 50 70 54 C72 58 76 58 78 52 C80 46 82 42 82 40Z" fill="#D88A2E" opacity=".9"/>
     <path d="M42 34 L58 34 L59 41 L41 41Z" fill="${K.butter}"/>
     <path class="np" d="M43 35 L57 35" stroke="#fff" stroke-width="1.6" opacity=".7"/>`);

  add('madeleines', 'Madeleines', 'patisserie', ['madeleine', 'financier', 'gouter', 'the'],
    `${[[36, 44, -18], [62, 62, 14]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})">
      <path d="M${x - 26} ${y + 6} C${x - 26} ${y - 14} ${x - 10} ${y - 22} ${x + 4} ${y - 20} C${x + 20} ${y - 18} ${x + 30} ${y - 6} ${x + 26} ${y + 8} C${x + 22} ${y + 18} ${x + 6} ${y + 22} ${x - 8} ${y + 20} C${x - 20} ${y + 18} ${x - 26} ${y + 14} ${x - 26} ${y + 6}Z" fill="#E2A957"/>
      <path class="np" d="M${x + 6} ${y - 16} C${x + 24} ${y - 10} ${x + 26} ${y + 10} ${x + 10} ${y + 18} C${x + 18} ${y + 6} ${x + 16} ${y - 6} ${x + 6} ${y - 16}Z" fill="#C98734" opacity=".6"/>
      ${[-16, -8, 0, 8, 16].map((d) => `<path class="fine" d="M${x - 2 + d * 0.3} ${y + 18} C${x + d * 0.6} ${y + 4} ${x + d} ${y - 8} ${x + d * 1.25} ${y - 17}" fill="none"/>`).join('')}</g>`).join('')}`);

  add('eclair', 'Éclairs', 'patisserie', ['eclair', 'chou', 'profiterole', 'religieuse', 'paris-brest', 'patissier'],
    `${[[50, 40, '#6E412B'], [50, 66, '#E7B7BE']].map(([x, y, g], i) => `<g transform="rotate(${i ? 6 : -6} ${x} ${y})">
      <rect x="${x - 40}" y="${y - 9}" width="80" height="22" rx="11" fill="#DDA058"/>
      <path class="np" d="M${x - 34} ${y + 9} C${x - 10} ${y + 14} ${x + 20} ${y + 14} ${x + 36} ${y + 8}" stroke="#C28038" stroke-width="3" opacity=".6" fill="none"/>
      <path d="M${x - 38} ${y - 2} C${x - 38} ${y - 9} ${x - 32} ${y - 11} ${x - 26} ${y - 11} L${x + 28} ${y - 11} C${x + 34} ${y - 11} ${x + 38} ${y - 8} ${x + 38} ${y - 2} C${x + 30} ${y + 1} ${x + 24} ${y - 1} ${x + 16} ${y + 1} C${x + 6} ${y + 3} ${x - 4} ${y} ${x - 14} ${y + 2} C${x - 24} ${y + 4} ${x - 30} ${y} ${x - 38} ${y - 2}Z" fill="${g}"/>
      <path class="np" d="M${x - 24} ${y - 8} L${x + 18} ${y - 8}" stroke="#fff" stroke-width="1.8" opacity=".45"/></g>`).join('')}`);

  add('chocolat', 'Chocolat', 'patisserie', ['chocolat', 'cacao', 'ganache', 'fondant', 'brownie', 'mousse au chocolat', 'moelleux'],
    `${[[54, 70, 4], [48, 56, -6], [56, 40, 8]].map(([cx, cy, rot]) => `<g transform="rotate(${rot} ${cx} ${cy})">
      <path d="M${cx - 36} ${cy} L${cx + 36} ${cy} L${cx + 36} ${cy + 9} L${cx - 36} ${cy + 9}Z" fill="${K.choc2}"/>
      <path d="M${cx - 36} ${cy} L${cx - 26} ${cy - 14} L${cx + 46} ${cy - 14} L${cx + 36} ${cy}Z" fill="${K.choc}"/>
      <path d="M${cx + 36} ${cy} L${cx + 46} ${cy - 14} L${cx + 46} ${cy - 5} L${cx + 36} ${cy + 9}Z" fill="#45271A"/>
      ${[0, 1, 2, 3].map((i) => [0, 1].map((j) => { const x0 = cx - 33 + i * 18 + j * 5; const y0 = cy - 3 - j * 7; return `<path d="M${x0} ${y0} L${x0 + 15} ${y0} L${x0 + 18.5} ${y0 - 5.5} L${x0 + 3.5} ${y0 - 5.5}Z" fill="${K.choc3}"/>`; }).join('')).join('')}
     </g>`).join('')}`);

  add('baguette', 'Pain', 'patisserie', ['pain', 'baguette', 'boulangerie', 'sandwich', 'tartine', 'levain'],
    `<path d="M10 82 C4 76 8 68 16 62 L66 18 C74 12 84 12 88 18 C92 24 88 32 82 38 L34 84 C26 90 16 88 10 82Z" fill="#D7974C"/>
     <path class="np" d="M82 38 C76 44 50 70 34 84 C26 90 16 88 10 82 C30 74 60 46 82 38Z" fill="#B97733" opacity=".5"/>
     ${[[28, 66], [42, 53], [56, 40], [70, 28]].map(([x, y]) => `<path d="M${x - 6} ${y + 4} C${x - 4} ${y - 3} ${x + 3} ${y - 7} ${x + 8} ${y - 6} C${x + 6} ${y + 1} ${x} ${y + 5} ${x - 6} ${y + 4}Z" fill="#F0CF92"/>`).join('')}
     <path d="M30 26 C24 20 30 12 38 14 C44 16 46 24 40 30" stroke="#D9C49A" stroke-width="0" fill="none"/>`);

  add('pancake-stack', 'Gaufres', 'patisserie', ['gaufre', 'waffle', 'brunch'],
    `<g transform="rotate(-8 50 52)"><rect x="16" y="18" width="68" height="68" rx="12" fill="#E2AE62"/>
      ${[0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `<rect x="${22 + i * 15}" y="${24 + j * 15}" width="11" height="11" rx="2.5" fill="#C98D41"/>`).join('')).join('')}
      <rect x="36" y="38" width="24" height="16" rx="3" fill="${K.butter}"/>
      <path d="M36 50 C34 58 38 62 40 56 C42 64 46 66 48 58 C52 66 58 62 58 54 L60 46Z" fill="#D58A2B" opacity=".85"/></g>`);

  add('brioche', 'Brioche', 'patisserie', ['brioche', 'pain au lait', 'kouglof', 'babka', 'pain perdu'],
    `<path d="M14 58 C30 50 70 50 86 58 L78 86 C62 92 38 92 22 86Z" fill="#CB8540"/>
     <g class="fine">${[24, 34, 44, 56, 66, 76].map((x) => `<path d="M${x} 58 L${x + (x - 50) * 0.08} 88" fill="none" opacity=".6"/>`).join('')}</g>
     <path d="M14 58 C10 46 24 38 34 42 C38 32 62 32 66 42 C76 38 90 46 86 58 C70 64 30 64 14 58Z" fill="#D9984F"/>
     <circle cx="50" cy="30" r="13" fill="#D68F44"/>
     <path class="np" d="M44 22 C48 19 54 19 56 21" stroke="#F3CF92" stroke-width="2.4" opacity=".8" fill="none"/>`);

  add('glace', 'Glace', 'patisserie', ['glace', 'sorbet', 'ice cream', 'gelato', 'coupe'],
    `<path d="M32 50 L50 94 L68 50Z" fill="#DCA45C"/>
     <g class="fine">${[0, 1, 2, 3].map((i) => `<path d="M${35 + i * 8} 50 L${58 - i * 2} ${78 - i * 6}" fill="none" opacity=".6"/><path d="M${65 - i * 8} 50 L${42 + i * 2} ${78 - i * 6}" fill="none" opacity=".6"/>`).join('')}</g>
     <path d="M28 52 C22 42 30 32 40 36 C42 26 58 26 60 36 C70 32 78 42 72 52 C60 56 40 56 28 52Z" fill="#F2C9CF"/>
     <path d="M36 34 C32 22 44 14 52 18 C60 14 70 22 64 34 C56 38 44 38 36 34Z" fill="#F6EEDC"/>
     <circle cx="56" cy="14" r="5.5" fill="${K.red}"/>
     <path d="M57 9 C58 5 61 3 64 3" stroke="${K.leaf2}" stroke-width="1.4" fill="none"/>`);

  add('meringues', 'Meringues', 'patisserie', ['meringue', 'pavlova', 'vacherin', 'blancs en neige'],
    `${[[32, 64, 1], [64, 66, 0.9], [48, 40, 0.85]].map(([x, y, k]) => `<path d="M${x - 18 * k} ${y + 10 * k} C${x - 20 * k} ${y} ${x - 12 * k} ${y - 8 * k} ${x - 6 * k} ${y - 10 * k} C${x - 4 * k} ${y - 18 * k} ${x + 2 * k} ${y - 24 * k} ${x + 4 * k} ${y - 28 * k} C${x + 6 * k} ${y - 20 * k} ${x + 10 * k} ${y - 14 * k} ${x + 10 * k} ${y - 10 * k} C${x + 18 * k} ${y - 6 * k} ${x + 22 * k} ${y + 2 * k} ${x + 18 * k} ${y + 10 * k} C${x + 6 * k} ${y + 14 * k} ${x - 8 * k} ${y + 14 * k} ${x - 18 * k} ${y + 10 * k}Z" fill="#FBF4E8"/>
      <path class="fine" d="M${x - 10 * k} ${y + 8 * k} C${x - 8 * k} ${y - 2 * k} ${x - 2 * k} ${y - 12 * k} ${x + 3 * k} ${y - 24 * k} M${x + 8 * k} ${y + 10 * k} C${x + 8 * k} ${y} ${x + 6 * k} ${y - 8 * k} ${x + 4 * k} ${y - 14 * k}" fill="none" opacity=".6"/>
      <path class="np" d="M${x + 4 * k} ${y - 6 * k} C${x + 14 * k} ${y - 2 * k} ${x + 18 * k} ${y + 4 * k} ${x + 14 * k} ${y + 10 * k}" stroke="#E9D9BE" stroke-width="4" fill="none"/>`).join('')}`);

  /* ================= Ingrédients ================= */
  add('oeufs', "Boîte d'œufs", 'ingredients', ['oeuf', 'oeufs', 'egg', 'omelette'],
    `<path d="M14 54 L22 20 L80 20 L88 54Z" fill="${K.carton}"/>
     <path d="M22 24 L78 24 L84 52 L18 52Z" fill="#E8E3DA"/>
     <path class="np" d="M24 26 L60 26 L44 50 L20 50Z" fill="#F3EFE8" opacity=".7"/>
     ${[[28, 52], [44, 50], [60, 50], [76, 52], [34, 62], [52, 61], [70, 62]].slice(0, 6).map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="8.6" ry="10.5" fill="${i % 3 === 1 ? K.egg2 : K.egg}"/><ellipse class="np" cx="${x - 3}" cy="${y - 4}" rx="2.4" ry="3.4" fill="#fff" opacity=".4"/>`).join('')}
     <path d="M8 58 L14 84 C15 88 18 90 22 90 L78 90 C82 90 85 88 86 84 L92 58 C86 64 80 64 76 60 C70 68 62 68 58 62 C52 70 46 70 42 62 C38 68 30 68 24 60 C20 64 12 64 8 58Z" fill="${K.carton}"/>
     <path class="np" d="M60 66 C70 66 80 64 90 60 L86 84 C85 88 82 90 78 90 L52 90 C64 84 66 74 60 66Z" fill="${K.carton2}" opacity=".6"/>
     <g class="fine"><path d="M24 64 L28 88 M42 66 L44 90 M58 66 L58 90 M76 64 L72 88" fill="none" opacity=".6"/></g>`);

  add('oeuf-casse', 'Œufs', 'ingredients', ['oeuf', 'jaune', 'blanc', 'egg', 'creme anglaise'],
    `<ellipse cx="34" cy="52" rx="22" ry="27" fill="${K.egg}" transform="rotate(-12 34 52)"/>
     <path class="np" d="M44 30 C58 42 58 66 44 78 C40 80 34 80 30 79 C46 70 50 48 44 30Z" fill="${K.egg2}" opacity=".6"/>
     <ellipse class="np" cx="26" cy="40" rx="5" ry="8" fill="#fff" opacity=".35" transform="rotate(-20 26 40)"/>
     <path d="M48 64 L54 58 L58 64 L63 57 L68 63 L73 56 L78 62 L83 57 L90 64 C92 80 82 92 69 92 C56 92 46 82 48 64Z" fill="${K.egg}"/>
     <path d="M52 64 C58 60 82 60 88 64 C86 68 56 68 52 64Z" fill="#F8F1E4"/>
     <circle cx="70" cy="70" r="9" fill="${K.yolk}"/>
     <ellipse class="np" cx="67" cy="67" rx="3" ry="2" fill="#fff" opacity=".6"/>`);

  add('farine', 'Farine', 'ingredients', ['farine', 'pate', 'pain', 'flour', 'ble', 'sarrasin'],
    `<path d="M20 34 C18 52 16 72 18 86 C30 92 70 92 82 86 C84 72 82 52 80 34Z" fill="${K.sack}"/>
     <path class="np" d="M62 36 C70 52 72 72 70 90 C76 90 80 88 82 86 C84 72 82 52 80 34Z" fill="#DCCFB4" opacity=".7"/>
     <path d="M20 34 C14 30 16 22 24 22 C36 26 64 26 76 22 C84 22 86 30 80 34 C66 40 34 40 20 34Z" fill="#E6DCC6"/>
     <path d="M28 30 C34 22 44 18 52 20 C60 18 68 22 72 30 C62 34 38 34 28 30Z" fill="#FCFAF4"/>
     <path d="M54 28 L66 4 L72 7 L60 31Z" fill="${K.wood}"/>
     <path d="M48 30 C46 24 52 20 58 22 C62 24 62 30 58 32Z" fill="#C9965F"/>
     <path class="fine" d="M22 40 C36 44 64 44 78 40" fill="none"/>
     <g class="np">${[[10, 90], [90, 88]].map(([x, y]) => '').join('')}</g>
     <path d="M30 88 C24 80 18 82 12 86 M28 90 C22 88 16 92 12 94 M74 88 C80 82 86 84 92 86" stroke="#C7A86A" stroke-width="1.6" fill="none"/>
     <text x="50" y="66" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="13" fill="#7A6450">Farine</text>`);

  add('sucre', 'Sucre', 'ingredients', ['sucre', 'sugar', 'cassonade', 'vergeoise', 'sucre glace'],
    `<path d="M16 30 C14 52 12 72 16 88 C32 94 68 94 84 88 C88 72 86 52 84 30Z" fill="${K.burlap}"/>
     <path class="np" d="M64 32 C72 50 74 72 72 92 C78 92 82 90 84 88 C88 72 86 52 84 30Z" fill="${K.burlap2}" opacity=".7"/>
     <path d="M16 30 C10 24 14 16 22 18 C36 22 64 22 78 18 C86 16 90 24 84 30 C70 36 30 36 16 30Z" fill="#CDB383"/>
     <path d="M24 26 C30 16 40 12 50 14 C60 12 70 16 76 26 C64 30 36 30 24 26Z" fill="#FCFBF7"/>
     <rect x="28" y="50" width="44" height="24" rx="2" fill="#E9DCC0" stroke-dasharray="2 2"/>
     <text x="50" y="67" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="13" fill="#6B5843">Sucre</text>`);

  add('beurre', 'Beurre', 'ingredients', ['beurre', 'butter', 'demi-sel', 'feuilletage', 'brioche'],
    `<path d="M16 56 L60 34 L88 46 L88 60 L44 84 L16 70Z" fill="${K.butter}"/>
     <path d="M16 56 L60 34 L88 46 L44 68Z" fill="#F8EBBC"/>
     <path d="M44 68 L88 46 L88 60 L44 84Z" fill="${K.butter2}"/>
     <path d="M16 56 L44 68 L44 84 L16 70Z" fill="#EDD889"/>
     <path d="M30 62 C40 54 56 46 72 40 L80 43 C64 50 48 58 38 66Z" fill="#FFFFFF" opacity=".55"/>
     <path class="np" d="M52 66 L84 50" stroke="#C9AF5C" stroke-width="1" opacity=".6"/>
     <text x="52" y="56" text-anchor="middle" font-family="Fraunces" font-weight="600" font-size="7" fill="#8E7A3E" transform="rotate(-26 52 56) skewX(18)">BEURRE</text>`);

  add('lait', 'Lait', 'ingredients', ['lait', 'creme', 'milk', 'yaourt', 'bechamel', 'flan'],
    `<path d="M28 30 L50 16 L72 30 L72 92 L28 92Z" fill="#FAF8F3"/>
     <path d="M50 16 L72 30 L72 92 L56 92 L56 30Z" fill="#E7E4DE"/>
     <path d="M28 30 L50 16 L56 30Z" fill="#F0EEE8"/>
     <path d="M50 16 L52 8 L58 8 L56 16Z" fill="#9EC3DE"/>
     <path d="M28 58 C34 54 40 62 46 58 C50 55 54 60 56 58 L56 92 L28 92Z" fill="${K.milk}"/>
     <path d="M56 58 C62 55 66 60 72 57 L72 92 L56 92Z" fill="#7FA9CA"/>
     <text x="42" y="48" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="10" fill="#5B7C98">lait</text>
     <path class="fine" d="M56 30 L56 92" fill="none"/>`);

  add('vanille', 'Vanille', 'ingredients', ['vanille', 'vanilla', 'extrait', 'creme brulee', 'creme anglaise'],
    `<path d="M10 82 C30 70 56 44 84 12" stroke="#3E2A1F" stroke-width="3" fill="none"/>
     <path d="M14 88 C34 74 60 50 90 22" stroke="#4F3324" stroke-width="2.6" fill="none"/>
     <path class="nf" d="M10 82 C30 70 56 44 84 12 M14 88 C34 74 60 50 90 22" fill="none"/>
     <path d="M52 46 C46 40 46 32 52 30 C54 36 58 40 60 42 C62 36 68 34 72 38 C68 40 64 44 62 46 C68 48 70 54 66 58 C62 54 58 50 56 50 C56 56 52 60 48 58 C50 54 52 50 52 46Z" fill="#F7E7B4"/>
     <circle class="np" cx="57" cy="47" r="2.4" fill="#E8C35E"/>
     ${leafP(36, 64, -150, 18, 6)}`);

  add('vanille-flacon', 'Extrait de vanille', 'ingredients', ['vanille', 'extrait', 'arome'],
    `<rect x="38" y="8" width="24" height="14" rx="3" fill="#3C2C24"/>
     <g class="fine">${[11, 14, 17, 20].map((y) => `<path d="M38 ${y} L62 ${y}" fill="none" opacity=".6"/>`).join('')}</g>
     <path d="M40 22 L60 22 L60 28 C70 30 74 36 74 44 L74 86 C74 90 70 94 66 94 L34 94 C30 94 26 90 26 86 L26 44 C26 36 30 30 40 28Z" fill="#6A3A22"/>
     <path class="np" d="M60 30 C70 34 74 40 74 50 L74 86 C74 90 70 94 66 94 L60 94Z" fill="#4C2716" opacity=".7"/>
     <rect x="29" y="50" width="42" height="30" rx="2" fill="#F5EDCF"/>
     <text x="50" y="65" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="10" fill="#4A3426">Vanille</text>
     <path class="fine" d="M40 72 C46 70 54 70 60 72" fill="none"/>
     <path class="np" d="M32 36 C30 50 30 70 32 88" stroke="#fff" stroke-width="2.2" opacity=".3" fill="none"/>`);

  add('miel', 'Miel', 'ingredients', ['miel', 'honey', 'pain d\'epice'],
    `<path d="M24 34 C24 30 26 28 30 28 L70 28 C74 28 76 30 76 34 L80 82 C80 90 74 94 66 94 L34 94 C26 94 20 90 20 82Z" fill="${K.honey}"/>
     <path class="np" d="M60 30 L70 28 C74 28 76 30 76 34 L80 82 C80 90 74 94 66 94 L58 94 C66 80 66 50 60 30Z" fill="#C9822A" opacity=".6"/>
     <rect x="26" y="20" width="48" height="10" rx="3" fill="#F2E6CF"/>
     <path d="M24 28 C34 34 40 26 50 30 C60 34 66 26 76 30 L76 34 L24 34Z" fill="#F2E6CF"/>
     <rect x="32" y="52" width="36" height="22" rx="2" fill="#FBF3DD"/>
     <text x="50" y="67" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="11" fill="#7A5420">Miel</text>
     <path d="M62 18 L84 2" stroke="${K.wood2}" stroke-width="2.6" fill="none"/>
     <ellipse cx="60" cy="22" rx="7" ry="5" fill="${K.wood}" transform="rotate(-36 60 22)"/>
     <g class="fine"><path d="M55 19 L64 26 M57 17 L66 23" fill="none"/></g>`);

  add('sel', 'Sel', 'ingredients', ['sel', 'poivre', 'fleur de sel', 'assaisonnement', 'salt'],
    `<path d="M28 34 C28 26 38 20 50 20 C62 20 72 26 72 34Z" fill="${K.steel}"/>
     ${[[42, 26], [50, 24], [58, 26], [46, 30], [54, 30]].map(([x, y]) => `<circle class="wfill" cx="${x}" cy="${y}" r=".9" fill="#5D6870"/>`).join('')}
     <path d="M28 34 L72 34 L72 40 L28 40Z" fill="${K.steel2}"/>
     <path d="M26 40 L74 40 C76 56 76 76 72 88 C64 94 36 94 28 88 C24 76 24 56 26 40Z" fill="${K.glass}"/>
     <path class="np" d="M27 64 C40 60 60 60 73 64 C74 74 73 82 72 88 C64 94 36 94 28 88 C27 82 26 74 27 64Z" fill="#FFFFFF"/>
     ${Array.from({ length: 22 }, (_, i) => `<circle class="np" cx="${30 + (i * 37) % 40}" cy="${68 + (i * 13) % 20}" r=".7" fill="#C9CED2"/>`).join('')}
     <path class="np" d="M34 46 C32 58 32 72 34 84" stroke="#fff" stroke-width="2.6" opacity=".8" fill="none"/>
     <path class="np" d="M64 44 C68 58 68 74 66 86" stroke="#CDD5D9" stroke-width="3" opacity=".6" fill="none"/>`);

  add('amandes', 'Amandes & noisettes', 'ingredients', ['amande', 'noisette', 'noix', 'praline', 'frangipane', 'fruits secs', 'financier'],
    `${[[30, 42, -30], [50, 30, 10], [66, 40, 40]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x} ${y - 14} C${x + 9} ${y - 6} ${x + 9} ${y + 8} ${x} ${y + 13} C${x - 9} ${y + 8} ${x - 9} ${y - 6} ${x} ${y - 14}Z" fill="#B97A4A"/><path class="fine" d="M${x - 3} ${y - 6} C${x - 1} ${y} ${x - 2} ${y + 6} ${x - 2} ${y + 8} M${x + 3} ${y - 7} C${x + 4} ${y} ${x + 3} ${y + 5} ${x + 3} ${y + 7}" fill="none" opacity=".6"/></g>`).join('')}
     ${[[36, 70, 14], [62, 72, 13], [82, 62, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#A9693A"/><path d="M${x - r * 0.9} ${y - r * 0.4} C${x - r * 0.5} ${y - r * 1.1} ${x + r * 0.5} ${y - r * 1.1} ${x + r * 0.9} ${y - r * 0.4} C${x + r * 0.4} ${y - r * 0.15} ${x - r * 0.4} ${y - r * 0.15} ${x - r * 0.9} ${y - r * 0.4}Z" fill="#E1C192"/><path class="np" d="M${x + r * 0.2} ${y} C${x + r * 0.9} ${y + r * 0.2} ${x + r * 0.6} ${y + r * 0.8} ${x} ${y + r * 0.95}" stroke="#7F4A26" stroke-width="2.4" opacity=".5" fill="none"/>`).join('')}`);

  add('cannelle', 'Cannelle & badiane', 'ingredients', ['cannelle', 'epices', 'speculoos', 'pain d\'epice', 'noel', 'chai', 'badiane', 'vin chaud'],
    `${[[-12, 0], [0, -3], [12, 2]].map(([dx, dy]) => `<g transform="translate(${dx} ${dy}) rotate(-28 50 50)"><rect x="43" y="10" width="14" height="72" rx="6" fill="#A8643A"/><path class="np" d="M52 12 L52 80" stroke="#7E4524" stroke-width="3" opacity=".6"/><ellipse cx="50" cy="11" rx="7" ry="3" fill="#C98A58"/><path class="fine" d="M48 11 C50 9 53 10 52 12" fill="none"/></g>`).join('')}
     <g transform="translate(74 74)">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M0 0 C-3 -5 -2 -12 0 -15 C2 -12 3 -5 0 0Z" fill="#8A4B2A" transform="rotate(${i * 45})"/>`).join('')}<circle r="3" fill="#6B3720"/></g>`);

  add('huile', "Huile d'olive", 'ingredients', ['huile', 'olive', 'vinaigrette', 'pesto'],
    `<path d="M44 6 L56 6 L56 18 L44 18Z" fill="#C7A271"/>
     <path d="M42 18 L58 18 L58 26 C70 32 74 40 74 50 L74 86 C74 91 70 94 65 94 L35 94 C30 94 26 91 26 86 L26 50 C26 40 30 32 42 26Z" fill="#DCE3B5" opacity=".9"/>
     <path class="np" d="M27 46 L73 46 L74 86 C74 91 70 94 65 94 L35 94 C30 94 26 91 26 86Z" fill="#C9C35B"/>
     <path class="np" d="M60 48 C70 54 72 70 70 92 L65 94 C68 76 66 58 60 48Z" fill="#A9A23A" opacity=".6"/>
     <path class="np" d="M32 50 C30 62 30 76 32 88" stroke="#fff" stroke-width="2.4" opacity=".5" fill="none"/>
     ${leafP(54, 64, -30, 16, 5, K.olive)}<ellipse cx="46" cy="70" rx="5" ry="6.5" fill="#6E7A35"/>`);

  /* ================= Ustensiles ================= */
  add('fouet', 'Fouet', 'ustensiles', ['fouet', 'battre', 'monter', 'whisk', 'blancs'],
    `<g transform="rotate(32 50 50)">
       <path d="M44 62 L56 62 L55 92 C55 95 45 95 45 92Z" fill="${K.wood}"/>
       <path class="np" d="M51 64 L55 64 L55 92 C55 94 52 95 51 95Z" fill="${K.wood2}" opacity=".6"/>
       <rect x="44" y="56" width="12" height="7" rx="2" fill="${K.steel}"/>
       <g fill="none"><path d="M46 57 C30 38 34 6 50 6 C66 6 70 38 54 57"/><path d="M48 57 C38 38 40 8 50 6 C60 8 62 38 52 57"/><path d="M50 57 L50 6"/></g>
       <g class="np" fill="none" stroke="${K.steel2}" stroke-width="1.6" opacity=".7"><path d="M46 57 C30 38 34 6 50 6 C66 6 70 38 54 57"/><path d="M48 57 C38 38 40 8 50 6 C60 8 62 38 52 57"/></g>
     </g>`);

  add('rouleau', 'Rouleau à pâtisserie', 'ustensiles', ['rouleau', 'etaler', 'pate', 'abaisse', 'tarte'],
    `<g transform="rotate(-38 50 50)">
       <rect x="2" y="45" width="15" height="10" rx="5" fill="${K.wood2}"/>
       <rect x="83" y="45" width="15" height="10" rx="5" fill="${K.wood2}"/>
       <rect x="15" y="39" width="70" height="22" rx="8" fill="${K.wood}"/>
       <path class="np" d="M17 55 L83 55" stroke="${K.wood2}" stroke-width="5" opacity=".5"/>
       <path class="np" d="M22 44 L78 44" stroke="#EBC79A" stroke-width="2.6" opacity=".8"/>
     </g>`);

  add('ustensiles', 'Ustensiles en bois', 'ustensiles', ['cuillere', 'spatule', 'bois', 'cuisine', 'melanger'],
    `<g transform="rotate(-8 30 50)"><ellipse cx="30" cy="20" rx="9" ry="13" fill="${K.wood}"/><path class="np" d="M30 9 C36 14 37 26 31 32" stroke="${K.wood2}" stroke-width="3" opacity=".6" fill="none"/><path d="M28 32 L32 32 L33 94 L27 94Z" fill="${K.wood}"/></g>
     <g transform="rotate(4 52 50)"><path d="M46 6 L58 6 L58 30 C58 34 46 34 46 30Z" fill="#E7B7BE"/><path d="M50 32 L54 32 L55 94 L49 94Z" fill="${K.wood}"/></g>
     <g transform="rotate(10 74 50)"><path d="M66 8 C66 4 82 4 82 8 L80 30 C80 34 68 34 68 30Z" fill="${K.wood}"/><g class="fine"><path d="M71 10 L72 28 M77 10 L76 28" fill="none"/></g><path d="M72 32 L76 32 L77 94 L71 94Z" fill="${K.wood2}"/></g>`);

  add('bol-cuivre', 'Bol & fouet', 'ustensiles', ['bol', 'saladier', 'melanger', 'pate', 'creme', 'cuivre'],
    `<path d="M54 50 L78 8" stroke="${K.steel2}" stroke-width="3" fill="none"/>
     <path d="M74 10 L84 -2" stroke="${K.wood2}" stroke-width="5" fill="none"/>
     <path d="M8 48 C10 76 28 90 50 90 C72 90 90 76 92 48Z" fill="${K.copper}"/>
     <path class="np" d="M62 50 L92 48 C90 76 72 90 50 90 C68 80 72 62 62 50Z" fill="${K.copper2}" opacity=".7"/>
     <path class="np" d="M16 56 C18 68 24 76 32 82" stroke="#F2C08E" stroke-width="3.5" opacity=".7" fill="none"/>
     <ellipse cx="50" cy="48" rx="42" ry="10" fill="#E9A66A"/>
     <path d="M14 48 C20 40 34 44 40 40 C48 36 58 42 66 40 C74 38 84 42 86 48 C70 54 30 54 14 48Z" fill="#FBF4E4"/>
     <path class="fine" d="M26 46 C34 42 42 46 48 44 M58 44 C66 42 72 46 78 45" fill="none"/>
     <circle cx="6" cy="62" r="5" fill="none" stroke="${K.copper2}" stroke-width="2.4"/>`);

  add('verre-doseur', 'Verre doseur', 'ustensiles', ['doseur', 'mesure', 'verre', 'liquide'],
    `<path d="M72 34 C88 34 90 48 88 56 C86 66 80 70 72 70" stroke="#DDE6EA" stroke-width="6" fill="none"/>
     <path class="nf" d="M72 30 C92 30 94 50 92 58 C90 70 82 74 72 74 M72 38 C84 38 86 48 84 56 C82 64 78 66 72 66" fill="none"/>
     <path d="M18 18 L76 18 L70 88 C70 92 66 94 62 94 L32 94 C28 94 24 92 24 88 L20 26 L12 22Z" fill="${K.glass}" opacity=".85"/>
     <path class="np" d="M21.5 54 L73 54 L70 88 C70 92 66 94 62 94 L32 94 C28 94 24 92 24 88Z" fill="#F5EBD6"/>
     <g class="fine">${[30, 40, 50, 60, 70, 80].map((y) => `<path d="M30 ${y} L${y % 20 ? 36 : 40} ${y}" fill="none"/>`).join('')}</g>
     <path class="np" d="M62 26 C64 40 64 70 62 86" stroke="#fff" stroke-width="2.6" opacity=".8" fill="none"/>`);

  add('casserole', 'Casserole', 'ustensiles', ['casserole', 'soupe', 'mijoter', 'sauce', 'bouillir', 'caramel'],
    `<path d="M80 50 L98 44" stroke="#3E3530" stroke-width="5" fill="none"/>
     <path d="M12 44 L80 44 L78 82 C77 88 72 92 66 92 L26 92 C20 92 15 88 14 82Z" fill="${K.copper}"/>
     <path class="np" d="M56 46 L80 44 L78 82 C77 88 72 92 66 92 L52 92 C62 80 62 60 56 46Z" fill="${K.copper2}" opacity=".7"/>
     <path class="np" d="M20 50 C20 62 22 76 26 84" stroke="#F2C08E" stroke-width="3.5" opacity=".7" fill="none"/>
     <ellipse cx="46" cy="44" rx="34" ry="7" fill="#B9662F"/>
     <g class="np" opacity=".45" fill="none" stroke="#B9B2AA" stroke-width="2"><path d="M36 34 C32 28 40 24 36 16"/><path d="M48 34 C44 26 52 22 48 12"/><path d="M60 34 C56 28 64 24 60 18"/></g>`);

  add('couteau', 'Couteau & planche', 'ustensiles', ['couteau', 'planche', 'couper', 'emincer', 'decouper'],
    `<path d="M10 40 C10 34 14 30 20 30 L74 30 C80 30 84 34 84 40 L84 80 C84 86 80 90 74 90 L20 90 C14 90 10 86 10 80Z" fill="${K.wood}"/>
     <path class="np" d="M60 32 L74 30 C80 30 84 34 84 40 L84 80 C84 86 80 90 74 90 L56 90 C66 74 66 50 60 32Z" fill="${K.wood2}" opacity=".5"/>
     <circle cx="76" cy="40" r="3.5" fill="#F7F1E6"/>
     <g class="fine">${[44, 56, 68, 78].map((y) => `<path d="M18 ${y} C34 ${y - 2} 50 ${y + 2} 66 ${y}" fill="none" opacity=".5"/>`).join('')}</g>
     <g transform="rotate(-30 50 50)"><path d="M18 46 L66 46 L66 54 L24 54 C20 54 18 50 18 46Z" fill="#D9DEE2"/><path class="np" d="M22 50 L64 50" stroke="#fff" stroke-width="1.6" opacity=".8"/><rect x="66" y="45" width="28" height="10" rx="4" fill="#3E3530"/><circle class="np" cx="74" cy="50" r="1.2" fill="#C9CED2"/><circle class="np" cx="84" cy="50" r="1.2" fill="#C9CED2"/></g>`);

  add('moule', 'Moule à tarte', 'ustensiles', ['moule', 'tarte', 'cuisson', 'four'],
    `<path d="M8 50 L16 70 C30 78 70 78 84 70 L92 50Z" fill="${K.steel}"/>
     <g class="fine">${Array.from({ length: 15 }, (_, i) => { const x = 12 + i * 5.4; return `<path d="M${x} 52 L${x + (x - 50) * 0.1} 73" fill="none" opacity=".7"/>`; }).join('')}</g>
     <ellipse cx="50" cy="50" rx="42" ry="13" fill="#D3D8DC"/>
     <ellipse cx="50" cy="51" rx="36" ry="10" fill="#C3C9CE"/>
     <path class="np" d="M22 48 C34 44 58 44 72 46" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none"/>`);

  add('livre', 'Carnet de recettes', 'ustensiles', ['livre', 'carnet', 'recette', 'grand-mere', 'famille', 'cahier'],
    `<path d="M50 24 C38 16 22 14 8 18 L8 82 C22 78 38 80 50 88Z" fill="#FBF7EE"/>
     <path d="M50 24 C62 16 78 14 92 18 L92 82 C78 78 62 80 50 88Z" fill="#F6F0E3"/>
     <path d="M8 82 C22 78 38 80 50 88 C62 80 78 78 92 82 L92 86 C78 82 62 84 50 92 C38 84 22 82 8 86Z" fill="#B5694A"/>
     <g class="fine" opacity=".55">${[32, 40, 48, 56, 64].map((y) => `<path d="M16 ${y} C26 ${y - 2} 36 ${y - 1} 44 ${y + 2}" fill="none"/>`).join('')}${[32, 40].map((y) => `<path d="M56 ${y + 2} C64 ${y - 1} 74 ${y - 2} 84 ${y}" fill="none"/>`).join('')}</g>
     <path d="M70 12 L70 34 L74 30 L78 34 L78 12" fill="#B5694A"/>
     ${leafP(60, 66, -20, 18, 6, K.leaf)}<circle cx="78" cy="58" r="6" fill="${K.red}"/>`);

  /* ================= Salé ================= */
  add('tomate', 'Tomates', 'cuisine', ['tomate', 'sauce tomate', 'ratatouille', 'bruschetta', 'gaspacho', 'tomates cerises'],
    `<path d="M50 30 C30 30 16 42 16 60 C16 78 32 90 50 90 C68 90 84 78 84 60 C84 42 70 30 50 30Z" fill="${K.tomato}"/>
     <path class="np" d="M64 34 C78 42 84 58 78 74 C72 86 60 90 52 90 C68 80 74 56 64 34Z" fill="#B83A2E" opacity=".55"/>
     <path class="np" d="M28 50 C30 42 38 38 44 38" stroke="#F6B8A6" stroke-width="3.5" opacity=".6" fill="none"/>
     <path d="M50 34 L40 26 L46 32 L32 32 L46 36 L40 44 L50 38 L60 44 L54 36 L68 32 L54 32 L60 26Z" fill="${K.leaf2}"/>
     <path d="M50 32 C50 26 52 20 56 16" stroke="${K.leaf2}" stroke-width="2.6" fill="none"/>`);

  add('avocat', 'Avocat', 'cuisine', ['avocat', 'guacamole', 'avocado', 'toast', 'poke'],
    `<path d="M50 8 C36 8 32 26 26 40 C18 56 18 74 30 86 C40 96 60 96 70 86 C82 74 82 56 74 40 C68 26 64 8 50 8Z" fill="#4C6A2F"/>
     <path d="M50 13 C40 13 37 28 32 42 C25 56 25 72 34 82 C42 90 58 90 66 82 C75 72 75 56 68 42 C63 28 60 13 50 13Z" fill="#C9D98C"/>
     <path class="np" d="M50 20 C42 20 40 32 36 44 C30 56 30 70 38 78 C44 84 56 84 62 78 C70 70 70 56 64 44 C60 32 58 20 50 20Z" fill="#E7EDB7"/>
     <circle cx="50" cy="63" r="14" fill="#9A6239"/>
     <path class="np" d="M44 57 C46 53 50 52 54 53" stroke="#D3A27A" stroke-width="2.6" fill="none"/>`);

  add('carottes', 'Carottes', 'cuisine', ['carotte', 'carrot', 'carrot cake', 'legume', 'potage', 'pot-au-feu'],
    `${[[0, 0], [16, 8]].map(([dx, dy]) => `<g transform="translate(${dx} ${dy})">
      <path d="M58 26 C52 18 48 10 46 4 M62 24 C62 14 64 8 68 2 M66 28 C72 20 78 16 86 14" stroke="${K.leaf}" stroke-width="2.4" fill="none"/>
      <path d="M52 24 C60 20 72 30 70 38 L26 86 C22 90 16 86 18 82 L46 30 C48 26 50 25 52 24Z" fill="#E98B3A"/>
      <path class="np" d="M70 38 L26 86 C22 90 18 88 18 84 C34 66 52 48 66 32Z" fill="#C96A22" opacity=".5"/>
      <g class="fine"><path d="M42 44 L48 47 M34 58 L40 61 M28 70 L33 73" fill="none"/></g></g>`).join('')}`);

  add('champignons', 'Champignons', 'cuisine', ['champignon', 'cepe', 'girolle', 'forestiere', 'risotto', 'mushroom', 'automne'],
    `<path d="M36 50 L32 86 C32 90 46 92 48 88 L46 50Z" fill="#F2E8D6"/>
     <path d="M8 52 C8 32 22 18 40 18 C58 18 72 32 72 52 C52 58 28 58 8 52Z" fill="#A86B3E"/>
     <path class="np" d="M48 20 C62 26 70 38 72 52 C64 54 58 55 52 55 C58 44 56 30 48 20Z" fill="#7F4C28" opacity=".55"/>
     <path class="np" d="M18 36 C22 28 30 24 36 24" stroke="#D9A57A" stroke-width="3" opacity=".6" fill="none"/>
     <path d="M66 70 L64 90 C66 94 78 94 78 90 L76 70Z" fill="#F2E8D6"/>
     <path d="M54 72 C54 60 62 52 72 52 C82 52 90 60 90 72 C78 76 66 76 54 72Z" fill="#C08452"/>`);

  add('ail', 'Ail', 'cuisine', ['ail', 'echalote', 'garlic', 'aioli', 'persillade'],
    `<path d="M50 6 C50 12 48 18 50 22" stroke="#C9B48E" stroke-width="3" fill="none"/>
     <path d="M50 20 C40 30 18 40 18 62 C18 82 34 90 50 90 C66 90 82 82 82 62 C82 40 60 30 50 20Z" fill="#F4EEE2"/>
     <path class="np" d="M60 32 C74 42 82 56 80 72 C78 82 70 88 60 90 C70 76 70 50 60 32Z" fill="#E2D2C8" opacity=".8"/>
     <g fill="none"><path d="M50 26 C40 44 38 70 44 88"/><path d="M50 26 C60 44 62 70 56 88"/><path class="fine" d="M42 32 C28 50 28 72 34 86"/><path class="fine" d="M58 32 C72 50 72 72 66 86"/></g>
     <g class="np" stroke="#C9A4B6" stroke-width="1.6" opacity=".6" fill="none"><path d="M46 40 C44 56 44 70 46 84"/><path d="M58 44 C60 58 60 70 58 82"/></g>`);

  add('basilic', 'Basilic', 'cuisine', ['basilic', 'herbes', 'pesto', 'menthe', 'persil', 'coriandre', 'aromates', 'pistou'],
    `<path d="M50 96 C50 80 50 60 50 34" stroke="#6E8F45" stroke-width="2.4" fill="none"/>
     ${leafP(50, 36, -120, 30, 12)}${leafP(50, 36, -60, 30, 12, K.leaf2)}
     ${leafP(50, 58, -165, 32, 13, K.leaf2)}${leafP(50, 58, -15, 32, 13)}
     ${leafP(50, 78, 160, 26, 10)}${leafP(50, 78, 20, 26, 10, K.leaf2)}
     ${leafP(50, 22, -95, 16, 6)}`);

  add('romarin', 'Romarin', 'cuisine', ['romarin', 'thym', 'herbes de provence', 'agneau', 'roti', 'focaccia'],
    `<path d="M24 92 C40 70 58 42 80 10" stroke="#6B5A3C" stroke-width="2" fill="none"/>
     ${Array.from({ length: 16 }, (_, i) => { const t = i / 16; const x = 24 + 56 * t + 0; const y = 92 - 82 * t; return `${leafP(x, y, -60 - 50 + (i % 2) * 100 - 40, 12 - t * 4, 2.2, i % 3 ? '#6F8E5A' : '#5A7A48', false)}`; }).join('')}
     ${Array.from({ length: 8 }, (_, i) => { const t = (i + 0.5) / 8; const x = 24 + 56 * t; const y = 92 - 82 * t; return `${leafP(x, y, -150 + (i % 2) * 200, 11 - t * 3, 2.2, '#7E9C66', false)}`; }).join('')}`);

  add('fromage', 'Fromage', 'cuisine', ['fromage', 'gruyere', 'emmental', 'comte', 'gratin', 'raclette', 'fondue', 'quiche', 'cheese'],
    `<path d="M10 62 L80 32 L90 46 L90 76 L10 84Z" fill="#F0CB6A"/>
     <path d="M10 62 L80 32 L90 46 Z" fill="#F7DE95"/>
     <path d="M10 62 L90 46 L90 76 L10 84Z" fill="#EDC160"/>
     ${[[28, 70, 4.5], [52, 66, 5.5], [76, 60, 3.5], [40, 78, 2.5], [70, 72, 3]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.85}" fill="#D6A23F"/>`).join('')}
     <ellipse cx="60" cy="46" rx="4" ry="1.8" fill="#E2B556"/>`);

  add('camembert', 'Camembert', 'cuisine', ['camembert', 'normand', 'normandie', 'neufchatel', 'livarot', 'pont-l\'eveque', 'fromage'],
    `<path d="M10 52 L10 66 C10 76 30 82 50 82 C70 82 90 76 90 66 L90 52Z" fill="#E7D9B8"/>
     <ellipse cx="50" cy="52" rx="40" ry="14" fill="#F4ECDC"/>
     <path class="np" d="M60 66 C74 66 86 62 90 56 L90 66 C90 76 70 82 50 82 C62 78 64 72 60 66Z" fill="#CDBB94" opacity=".6"/>
     <path d="M50 52 L88 48 C92 56 90 62 86 66 L54 70Z" fill="#FBF3D6"/>
     <path d="M50 52 L54 70" fill="none"/>
     <path class="np" d="M66 60 C72 62 70 66 76 66 C80 66 84 62 86 62" fill="#F6E7B2" stroke="none"/>
     <g class="np" opacity=".5">${[[24, 48], [36, 44], [30, 56], [44, 58], [60, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#C9BFA4"/>`).join('')}</g>`);

  add('poisson', 'Poisson', 'cuisine', ['poisson', 'saumon', 'cabillaud', 'sole', 'bar', 'dorade', 'maquereau', 'fish', 'fecamp'],
    `<path d="M80 50 L96 34 C94 44 94 56 96 66Z" fill="#7E97AE"/>
     <path d="M6 50 C18 30 46 24 64 32 C72 36 78 44 82 50 C78 56 72 62 64 66 C46 76 18 70 6 50Z" fill="#A9BCCB"/>
     <path class="np" d="M8 52 C22 66 48 72 66 64 C74 60 78 56 82 50 C70 58 40 62 8 52Z" fill="#E9E4D8"/>
     <path class="np" d="M14 44 C30 32 54 30 72 40" stroke="#6E879E" stroke-width="5" opacity=".5" fill="none"/>
     <path d="M42 30 C48 20 58 20 64 30" fill="#7E97AE"/>
     <path d="M28 36 C32 44 32 56 28 64" fill="none"/>
     <circle class="wfill" cx="17" cy="46" r="2.4" fill="#3E3530"/>
     <g class="fine" opacity=".6">${[40, 50, 60].map((x) => `<path d="M${x} 42 C${x + 4} 46 ${x + 4} 52 ${x} 56" fill="none"/>`).join('')}</g>`);

  add('homard', 'Homard bleu', 'cuisine', ['homard', 'langouste', 'crustace', 'bisque', 'fruits de mer', 'lobster'],
    `<g fill="#3E5F8A">
       <path d="M36 44 C24 40 18 32 20 24" fill="none" stroke="#3E5F8A" stroke-width="4"/><path d="M64 44 C76 40 82 32 80 24" fill="none" stroke="#3E5F8A" stroke-width="4"/>
       <path d="M20 26 C8 22 6 6 16 4 C18 10 22 12 26 11 C29 18 26 26 20 26Z"/>
       <path d="M80 26 C92 22 94 6 84 4 C82 10 78 12 74 11 C71 18 74 26 80 26Z"/>
       <path d="M40 30 C40 24 60 24 60 30 L62 54 C62 58 38 58 38 54Z"/>
       <path d="M39 56 L61 56 L59 64 L41 64Z"/><path d="M41 64 L59 64 L57 72 L43 72Z"/><path d="M43 72 L57 72 L55 80 L45 80Z"/>
       <path d="M45 80 L55 80 L66 94 L50 90 L34 94Z"/>
     </g>
     <path class="np" d="M52 28 C58 32 60 44 58 56" stroke="#2C4466" stroke-width="5" opacity=".5" fill="none"/>
     <path d="M44 26 C38 14 30 8 22 4 M56 26 C62 14 70 8 78 4" fill="none" class="fine"/>
     <g class="fine"><path d="M38 44 L28 50 M38 50 L28 58 M62 44 L72 50 M62 50 L72 58" fill="none"/></g>`);

  add('saint-jacques', 'Saint-Jacques', 'cuisine', ['saint-jacques', 'coquille', 'noix de saint-jacques', 'normandie', 'fruits de mer', 'huitre'],
    `<path d="M50 84 C30 84 10 66 10 46 C10 26 28 12 50 12 C72 12 90 26 90 46 C90 66 70 84 50 84Z" fill="#EDB79A"/>
     ${[-36, -24, -12, 0, 12, 24, 36].map((a) => `<path class="np" d="M50 82 L${50 + 40 * Math.sin((a + 6) * Math.PI / 180)} ${50 - 40 * Math.cos((a + 6) * Math.PI / 180)} L${50 + 40 * Math.sin((a - 6) * Math.PI / 180)} ${50 - 40 * Math.cos((a - 6) * Math.PI / 180)}Z" fill="#D9937A" opacity=".6"/><path d="M50 82 L${50 + 39 * Math.sin(a * Math.PI / 180)} ${50 - 39 * Math.cos(a * Math.PI / 180)}" fill="none" class="fine"/>`).join('')}
     <path d="M36 82 L32 94 L68 94 L64 82Z" fill="#E3A588"/>`);

  add('pates', 'Pâtes fraîches', 'cuisine', ['pates', 'spaghetti', 'carbonara', 'bolognaise', 'lasagne', 'pasta', 'tagliatelle', 'linguine', 'ravioli'],
    `<path d="M8 52 C10 78 28 90 50 90 C72 90 90 78 92 52Z" fill="#F4F1EA"/>
     <path class="np" d="M64 54 L92 52 C90 78 72 90 50 90 C66 82 70 66 64 54Z" fill="#DCD8CF" opacity=".7"/>
     <path class="np" d="M8 52 C10 60 12 64 14 68 L86 68 C88 64 90 60 92 52Z" fill="none" stroke="#7FA3C4" stroke-width="2"/>
     <ellipse cx="50" cy="52" rx="42" ry="10" fill="#EDE8DE"/>
     <path d="M18 52 C16 38 32 30 50 32 C68 30 84 38 82 52 C66 58 34 58 18 52Z" fill="#F2D488"/>
     <g fill="none" class="fine">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${22 + i * 3} ${50 - i} C${30 + i * 4} ${36 + i} ${46 + i * 2} ${44 - i * 2} ${54 + i * 2} ${36 + i} C${62 + i} ${30 + i} ${70} ${44} ${78 - i * 2} ${48 - i}"/>`).join('')}</g>
     ${leafP(56, 36, -30, 12, 4)}${leafP(56, 36, -110, 10, 3.5, K.leaf2)}`);

  add('soupe', 'Soupe', 'cuisine', ['soupe', 'potage', 'veloute', 'bouillon', 'ramen', 'bisque', 'gaspacho'],
    `<path d="M8 46 C10 74 28 88 50 88 C72 88 90 74 92 46Z" fill="#F4F1EA"/>
     <path class="np" d="M62 48 L92 46 C90 74 72 88 50 88 C66 80 70 62 62 48Z" fill="#DCD8CF" opacity=".7"/>
     <ellipse cx="50" cy="46" rx="42" ry="10" fill="#EDE8DE"/>
     <ellipse cx="50" cy="46" rx="36" ry="7.5" fill="#E58A3E"/>
     <path class="np" d="M30 46 C38 42 46 48 54 44 C60 42 66 46 70 45" stroke="#F8E9D2" stroke-width="1.8" fill="none"/>
     ${leafP(44, 44, -20, 7, 2.5)}${leafP(56, 46, 160, 7, 2.5)}
     <g class="np" opacity=".4" fill="none" stroke="#B9B2AA" stroke-width="2"><path d="M40 34 C36 28 44 24 40 16"/><path d="M54 34 C50 26 58 22 54 12"/></g>`);

  add('salade', 'Salade', 'cuisine', ['salade', 'healthy', 'bowl', 'cesar', 'crudites', 'poke', 'laitue'],
    `<path d="M14 46 C8 34 20 26 28 32 C28 20 42 16 48 24 C54 14 70 16 70 28 C80 24 90 34 84 44Z" fill="#9DBE6E"/>
     <path class="np" d="M30 34 C34 40 40 42 46 40 M56 30 C60 36 66 38 72 36" stroke="#7A9E4D" stroke-width="2" fill="none"/>
     <circle cx="34" cy="40" r="6" fill="${K.tomato}"/><circle cx="64" cy="38" r="5.5" fill="${K.tomato}"/>
     <path d="M46 34 C50 30 56 32 56 36 C54 40 48 40 46 34Z" fill="#F4EFE2"/>
     <path d="M8 46 C10 74 28 88 50 88 C72 88 90 74 92 46Z" fill="#F4F1EA"/>
     <path class="np" d="M62 48 L92 46 C90 74 72 88 50 88 C66 80 70 62 62 48Z" fill="#DCD8CF" opacity=".7"/>
     <path class="np" d="M14 58 C30 64 70 64 86 58" stroke="#8DA67A" stroke-width="2.4" fill="none"/>`);

  add('pomme-de-terre', 'Pommes de terre', 'cuisine', ['pomme de terre', 'patate', 'frites', 'puree', 'gratin', 'tartiflette', 'raclette'],
    `<path d="M14 50 C12 36 26 28 40 30 C56 32 66 42 64 56 C62 70 48 76 34 74 C20 72 15 62 14 50Z" fill="#D7AE73"/>
     <path d="M48 66 C46 54 58 48 70 50 C84 52 92 62 88 74 C84 86 70 90 58 86 C50 82 48 74 48 66Z" fill="#CFA066"/>
     <path class="np" d="M50 34 C62 40 66 54 58 68 C50 74 42 75 34 74 C50 66 56 52 50 34Z" fill="#B78852" opacity=".5"/>
     ${[[26, 42], [44, 46], [36, 60], [68, 62], [78, 74], [62, 78]].map(([x, y]) => `<circle class="np" cx="${x}" cy="${y}" r="1.1" fill="#8E6A3E"/>`).join('')}`);

  add('oignon', 'Oignon rouge', 'cuisine', ['oignon', 'echalote', 'soupe a l\'oignon', 'onion', 'tarte a l\'oignon'],
    `<path d="M50 22 C48 14 50 8 54 4 M50 22 C54 14 58 12 62 12" stroke="#B49073" stroke-width="2" fill="none"/>
     <path d="M50 22 C40 32 16 40 18 62 C20 82 36 90 50 90 C64 90 80 82 82 62 C84 40 60 32 50 22Z" fill="#9E4A6E"/>
     <path class="np" d="M62 34 C76 44 82 58 80 72 C76 84 66 89 56 90 C68 76 70 54 62 34Z" fill="#7A3352" opacity=".55"/>
     <g fill="none" class="fine"><path d="M50 28 C38 46 36 72 46 88"/><path d="M50 28 C62 46 64 72 54 88"/><path d="M44 30 C28 46 26 72 36 86"/></g>
     <path class="np" d="M28 54 C28 66 32 76 38 82" stroke="#D99AB6" stroke-width="3" opacity=".6" fill="none"/>`);

  /* ================= Boissons ================= */
  add('cafe', 'Café', 'boissons', ['cafe', 'chocolat chaud', 'latte', 'cappuccino', 'tiramisu', 'cafe gourmand', 'expresso'],
    `<ellipse cx="46" cy="84" rx="40" ry="9" fill="#F4F1EA"/>
     <path d="M72 50 C86 50 88 60 86 66 C84 74 76 76 70 74" stroke="#F4F1EA" stroke-width="6" fill="none"/>
     <path class="nf" d="M72 46 C90 46 92 60 90 68 C88 78 78 80 70 78 M72 54 C82 54 84 60 82 66 C80 70 76 72 70 70" fill="none"/>
     <path d="M16 42 L76 42 L72 74 C70 82 62 86 54 86 L38 86 C30 86 22 82 20 74Z" fill="#F7F4EE"/>
     <path class="np" d="M56 44 L76 42 L72 74 C70 82 62 86 54 86 L48 86 C60 78 62 60 56 44Z" fill="#DCD8CF" opacity=".7"/>
     <ellipse cx="46" cy="42" rx="30" ry="7" fill="#EDE8DE"/>
     <ellipse cx="46" cy="42" rx="26" ry="5.2" fill="#8C5A3A"/>
     <path class="np" d="M40 42 C40 38 46 38 46 41 C46 38 52 38 52 42 C50 45 46 46 46 46 C46 46 42 45 40 42Z" fill="#E9D3B5"/>
     <g class="np" opacity=".4" fill="none" stroke="#B9B2AA" stroke-width="2"><path d="M38 32 C34 26 42 22 38 14"/><path d="M52 32 C48 24 56 20 52 10"/></g>`);

  add('the', 'Thé', 'boissons', ['the', 'infusion', 'tea', 'tisane', 'gouter', 'theiere'],
    `<path d="M76 54 C88 50 92 40 94 32" stroke="#E9EFE6" stroke-width="5" fill="none"/>
     <path class="nf" d="M76 50 C86 46 90 38 92 30 L96 32 C94 42 90 52 78 58" fill="none"/>
     <path d="M22 48 C8 46 6 60 12 66 C16 70 22 70 24 68" stroke="#E9EFE6" stroke-width="5" fill="none"/>
     <path d="M20 50 C18 32 34 26 50 26 C66 26 82 32 80 50 C82 76 68 88 50 88 C32 88 18 76 20 50Z" fill="#E9EFE6"/>
     <path class="np" d="M62 30 C76 38 82 52 78 68 C74 80 64 86 54 88 C68 74 70 50 62 30Z" fill="#C9D3C7" opacity=".8"/>
     <path d="M30 30 C38 24 62 24 70 30 C62 34 38 34 30 30Z" fill="#D7E0D2"/>
     <circle cx="50" cy="22" r="4.5" fill="#D7E0D2"/>
     <g class="np">${[[38, 56], [52, 62], [64, 52], [44, 72], [60, 74]].map(([x, y]) => `${leafP(x, y, -30, 9, 3.5, '#9DB98A', false)}<circle cx="${x + 9}" cy="${y - 4}" r="2.2" fill="#E3A3AE"/>`).join('')}</g>`);

  add('vin', 'Verre de vin', 'boissons', ['vin', 'bourguignon', 'sauce au vin', 'accord', 'rouge', 'champagne', 'apero'],
    `<path d="M30 12 L70 12 C74 38 66 54 52 58 L52 84 L66 88 C68 92 64 92 64 92 L36 92 C36 92 32 92 34 88 L48 84 L48 58 C34 54 26 38 30 12Z" fill="#EEF2F2" opacity=".85"/>
     <path class="np" d="M30.6 30 L69.4 30 C70 44 62 54 50 56 C38 54 30 44 30.6 30Z" fill="${K.wine}"/>
     <path class="np" d="M58 32 C66 34 68 44 62 50 C58 54 54 55 50 56 C60 48 62 40 58 32Z" fill="#5A1E30" opacity=".6"/>
     <path class="np" d="M36 18 C34 28 36 40 40 46" stroke="#fff" stroke-width="2.4" opacity=".8" fill="none"/>`);

  add('cidre', 'Cidre', 'boissons', ['cidre', 'calvados', 'pommeau', 'normandie', 'cider', 'bolee'],
    `<path d="M14 40 C12 64 22 82 40 84 C56 84 64 70 64 48 L64 40Z" fill="#F3E3B8"/>
     <path class="np" d="M15 46 L63 46 C63 66 56 80 40 82 C24 80 15 66 15 46Z" fill="#E7B24C"/>
     <path class="np" d="M50 48 L63 46 C63 66 56 80 40 82 C54 72 56 60 50 48Z" fill="#C98A2E" opacity=".6"/>
     <path d="M64 50 C74 50 76 58 74 64 C72 70 66 72 62 72" stroke="#F3E3B8" stroke-width="4" fill="none"/>
     <path class="nf" d="M64 46 C78 46 80 58 78 66 C76 74 68 76 62 76" fill="none"/>
     <ellipse cx="39" cy="40" rx="25" ry="5" fill="#FBF6E8"/>
     <path d="M62 30 C70 22 82 24 84 34 C86 46 76 52 70 50 C66 48 62 40 62 30Z" fill="#CF4A3C"/>
     <path d="M74 26 L76 18" stroke="${K.wood2}" stroke-width="2" fill="none"/>${leafP(76, 20, -30, 12, 4)}`);

  add('citronnade', 'Citronnade', 'boissons', ['citronnade', 'limonade', 'mojito', 'cocktail', 'boisson', 'smoothie', 'spritz', 'ete'],
    `<path d="M22 22 L78 22 L72 88 C72 92 68 94 64 94 L36 94 C32 94 28 92 28 88Z" fill="#EEF4F2" opacity=".8"/>
     <path class="np" d="M24 40 L76 40 L72 88 C72 92 68 94 64 94 L36 94 C32 94 28 92 28 88Z" fill="#F6E6A0" opacity=".9"/>
     <rect class="np" x="34" y="50" width="12" height="12" rx="2" fill="#fff" opacity=".7" transform="rotate(12 40 56)"/><rect class="np" x="52" y="62" width="11" height="11" rx="2" fill="#fff" opacity=".7" transform="rotate(-10 57 67)"/>
     <circle cx="68" cy="24" r="13" fill="#F4D96E"/><circle cx="68" cy="24" r="10" fill="#FBEDB0"/>
     <path class="np" d="M68 15 L68 33 M59 24 L77 24 M62 18 L74 30 M74 18 L62 30" stroke="#F0CF52" stroke-width="1.4"/>
     <path d="M46 6 L56 60" stroke="#E7B7BE" stroke-width="3" fill="none"/>
     ${leafP(30, 24, -150, 16, 6)}${leafP(32, 26, -100, 14, 5, K.leaf2)}
     <path class="np" d="M30 30 C30 50 32 70 34 86" stroke="#fff" stroke-width="2.4" opacity=".7" fill="none"/>`);

  /* ================= Botanique & déco ================= */
  add('lavande', 'Lavande', 'deco', ['lavande', 'provence', 'fleur', 'miel'],
    `${[[40, -10], [50, 0], [60, 10]].map(([x, r]) => `<g transform="rotate(${r} ${x} 92)"><path d="M${x} 92 L${x} 24" stroke="#7E9472" stroke-width="1.6" fill="none"/>${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${x + (i % 2 ? 2.5 : -2.5)}" cy="${18 + i * 4.2}" rx="2.6" ry="3.6" fill="${i % 3 ? K.lav : K.lav2}" class="np"/>`).join('')}</g>`).join('')}
     ${leafP(48, 80, -130, 18, 3, '#8FA382', false)}${leafP(52, 76, -50, 18, 3, '#7E9472', false)}`);

  add('fleurs-fraisier', 'Fleurs de fraisier', 'deco', ['fleur', 'printemps', 'flower', 'fraisier', 'jardin'],
    `<path d="M20 90 C30 70 40 56 54 44 M54 44 C62 34 70 28 80 24" stroke="#7E9472" stroke-width="1.8" fill="none"/>
     ${leafP(30, 76, -120, 18, 7)}${leafP(44, 60, 20, 18, 7, K.leaf2)}
     ${[[56, 40, 11], [80, 22, 9], [32, 52, 8]].map(([x, y, r]) => `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - r * 0.55}" rx="${r * 0.42}" ry="${r * 0.55}" fill="#FBF7EE" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="#E8C35E"/>`).join('')}`);

  add('ble', 'Épis de blé', 'deco', ['ble', 'farine', 'pain', 'campagne', 'cereales', 'avoine'],
    `${[[-14], [0], [14]].map(([r]) => `<g transform="rotate(${r} 50 94)"><path d="M50 94 L50 26" stroke="#C9A866" stroke-width="1.6" fill="none"/>${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${46.5}" cy="${24 + i * 6}" rx="2.6" ry="4.4" fill="#E2C17E" transform="rotate(-24 46.5 ${24 + i * 6})"/><ellipse cx="${53.5}" cy="${24 + i * 6}" rx="2.6" ry="4.4" fill="#D9B46A" transform="rotate(24 53.5 ${24 + i * 6})"/>`).join('')}<path class="fine" d="M46 22 L40 6 M54 22 L60 6 M50 18 L50 4" fill="none"/></g>`).join('')}`);

  add('rameau-olivier', "Rameau d'olivier", 'deco', ['olive', 'olivier', 'mediterraneen', 'tapenade', 'italien', 'grec'],
    `<path d="M10 86 C30 70 54 50 90 16" stroke="#7A6A48" stroke-width="1.8" fill="none"/>
     ${Array.from({ length: 9 }, (_, i) => { const t = (i + 0.6) / 10; const x = 10 + 80 * t; const y = 86 - 70 * t; return leafP(x, y, (i % 2 ? -100 : 20) - 40 * t, 20 - t * 6, 4, i % 3 ? K.olive : '#A3AE70'); }).join('')}
     <ellipse cx="34" cy="76" rx="5" ry="6.5" fill="#4F5A2E" transform="rotate(-30 34 76)"/><ellipse cx="62" cy="54" rx="4.5" ry="6" fill="#6E7A35" transform="rotate(20 62 54)"/>`);

  add('feuilles-menthe', 'Menthe', 'deco', ['menthe', 'mojito', 'frais', 'the a la menthe', 'taboule'],
    `<path d="M50 94 L50 30" stroke="#7E9472" stroke-width="2" fill="none"/>
     ${leafP(50, 34, -120, 26, 13, '#7FB07A')}${leafP(50, 34, -60, 26, 13, '#6A9E66')}
     ${leafP(50, 58, -160, 28, 14, '#6A9E66')}${leafP(50, 58, -20, 28, 14, '#7FB07A')}
     ${leafP(50, 26, -90, 14, 6, '#8DC08A')}`);

  add('fleur-sechee', 'Fleurs séchées', 'deco', ['fleur', 'bouquet', 'champetre', 'joli', 'mariage', 'fete des meres'],
    `<path d="M50 94 C48 70 40 46 24 22 M50 94 C50 66 52 40 58 14 M50 94 C54 72 64 52 82 32" stroke="#9A8A62" stroke-width="1.4" fill="none"/>
     ${[[24, 22, '#D99A8A'], [58, 14, '#E9C9A0'], [82, 32, '#C9A6C2']].map(([x, y, c]) => Array.from({ length: 7 }, (_, i) => `<circle class="np" cx="${x + 5 * Math.cos(i)}" cy="${y + 5 * Math.sin(i * 1.3)}" r="3" fill="${c}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="7" fill="none" class="fine"/>`).join('')}
     ${leafP(44, 60, -150, 14, 4, '#A3AE70')}${leafP(56, 56, -30, 14, 4, '#8E9A55')}${leafP(46, 76, -140, 12, 3.5, '#8E9A55')}`);

  add('etiquette-kraft', 'Étiquette « fait maison »', 'deco', ['fait maison', 'maison', 'etiquette', 'cadeau'],
    `<path d="M20 30 L76 22 L86 46 L80 72 L24 80 Z" fill="#D9BC8C"/>
     <circle cx="76" cy="47" r="4" fill="#F7F1E6"/>
     <path d="M80 47 C90 44 96 36 98 26" stroke="#9A8A62" stroke-width="1.4" fill="none"/>
     <text x="48" y="56" text-anchor="middle" font-family="Apple" font-size="9.5" fill="#4A3426" transform="rotate(-6 48 56)">fait maison</text>`);

  add('etiquette-famille', 'Étiquette « recette de famille »', 'deco', ['famille', 'grand-mere', 'mamie', 'tradition'],
    `<rect x="12" y="34" width="76" height="32" rx="2" fill="#F6EFE0" transform="rotate(-4 50 50)"/>
     <rect x="16" y="38" width="68" height="24" rx="1" fill="none" transform="rotate(-4 50 50)" class="fine"/>
     <text x="50" y="54" text-anchor="middle" font-family="FrauncesI" font-style="italic" font-weight="500" font-size="9" fill="#8A4B2A" transform="rotate(-4 50 50)">Recette de famille</text>`);

  add('ruban', 'Ruban', 'deco', ['ruban', 'noeud', 'cadeau', 'fete', 'noel'],
    `<path d="M50 50 L38 88 L44 84 L48 92 L54 56Z" fill="#B5694A"/>
     <path d="M50 50 L62 88 L56 84 L52 92 L46 56Z" fill="#A35A3E"/>
     <path d="M50 50 C36 30 12 26 14 44 C16 62 38 58 50 50Z" fill="#C97A5A"/>
     <path d="M50 50 C64 30 88 26 86 44 C84 62 62 58 50 50Z" fill="#C97A5A"/>
     <path class="np" d="M48 48 C40 40 28 36 22 40 M52 48 C60 40 72 36 78 40" stroke="#9A4A30" stroke-width="2" opacity=".6" fill="none"/>
     <ellipse cx="50" cy="50" rx="7" ry="6" fill="#B5694A"/>`);
})();
if (typeof module !== 'undefined') module.exports = DESSINS;
