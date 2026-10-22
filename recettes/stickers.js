'use strict';
/* =========================================================
   Mon carnet de recettes : planche d'autocollants (SVG)
   Style « stickers pastel » : contour brun doux, bord blanc découpé, petite ombre.
   Chaque autocollant est dessiné dans un carré 100 × 100.
   ========================================================= */

const STICKERS = (() => {
  const O = '#6E5446';
  const C = {
    red: '#EF6B6B', red2: '#DA5656', pink: '#F6B8C2', pink2: '#EE97A6', rose: '#FBDDE2',
    cream: '#FDF4E4', beige: '#F1DFC2', crust: '#E9B874', crust2: '#D9994F', cookie: '#DDA766',
    brown: '#A86F45', choco: '#7A4A33', choco2: '#5E3726', butter: '#F9E08E', yellow: '#F9D867',
    lemon: '#F8E27C', orange: '#F5AE5F', peach: '#F8C49A', green: '#8DC07A', green2: '#6FA35E',
    sage: '#B8CDA6', mint: '#BFE3D0', blue: '#A8C8E2', blue2: '#7FA9CF', berry: '#7B84C6',
    berry2: '#5D66A8', lilac: '#C7B3E3', white: '#FFFFFF', grey: '#E4DFDA', steel: '#CDD2D8',
    cheese: '#F8D569', wood: '#E3B784', wood2: '#C99560',
  };

  // petits outils de dessin
  const sh = (cx, cy, rx, ry, rot = 0, op = 0.6) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#fff" opacity="${op}" stroke="none"/>`;
  const leaf = (x, y, rot, len = 18, w = 7, fill = C.green) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 Q${len / 2} ${-w} ${len} 0 Q${len / 2} ${w} 0 0Z" fill="${fill}"/><path d="M2 0 L${len - 4} 0" stroke-width="1.4" opacity=".6"/></g>`;
  const dots = (pts, r, fill) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="none"/>`).join('');
  const seeds = (pts, fill = '#FBE6A2') => pts.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.5" ry="2.3" fill="${fill}" stroke="none"/>`).join('');
  const label = (x, y, w, h, txt, fs, bg = '#fff', fg = O, rx = 4) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${bg}" stroke-width="1.6"/>` +
    `<text x="${x + w / 2}" y="${y + h / 2 + fs * 0.36}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${fs}" fill="${fg}" stroke="none">${txt}</text>`;
  const steam = (x, y) => `<g stroke-width="2.2" opacity=".55"><path d="M${x} ${y} q-4 -5 0 -10 q4 -5 0 -10"/><path d="M${x + 10} ${y + 2} q-4 -5 0 -10 q4 -5 0 -10"/><path d="M${x - 10} ${y + 2} q-4 -5 0 -10 q4 -5 0 -10"/></g>`;

  const L = [];
  const add = (id, name, cat, kw, art, opts = {}) => L.push({ id, name, cat, kw, art, ...opts });

  /* ---------------- Fruits ---------------- */
  add('fraise', 'Fraise', 'fruits', ['fraise', 'fraisier', 'strawberry'],
    `<path d="M50 22 Q51 14 56 9" stroke-width="3"/>
     <path d="M50 90 C30 82 15 62 19 45 C22 33 35 29 50 33 C65 29 78 33 81 45 C85 62 70 82 50 90Z" fill="${C.red}"/>
     ${seeds([[36, 47], [50, 45], [64, 47], [29, 58], [43, 58], [57, 58], [71, 58], [37, 69], [50, 70], [63, 69], [44, 80], [56, 80]])}
     ${sh(30, 50, 3.5, 8, 20)}
     <path d="M50 37 C44 37 35 35 29 28 C37 25 44 27 48 30 C45 24 46 19 50 14 C54 19 55 24 52 30 C56 27 63 25 71 28 C65 35 56 37 50 37Z" fill="${C.green}"/>`);

  add('framboise', 'Framboise', 'fruits', ['framboise', 'raspberry'],
    `${[[38, 42], [50, 40], [62, 42], [32, 53], [44, 52], [56, 52], [68, 53], [38, 64], [50, 63], [62, 64], [43, 75], [57, 75], [50, 85]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.4" fill="#EC6F86"/><circle cx="${x - 2.2}" cy="${y - 2.4}" r="1.6" fill="#fff" opacity=".7" stroke="none"/>`).join('')}
     <path d="M50 36 C42 36 35 33 30 27 C38 26 44 28 47 30 C46 24 47 20 50 15 C53 20 54 24 53 30 C56 28 62 26 70 27 C65 33 58 36 50 36Z" fill="${C.green}"/>`);

  add('myrtille', 'Myrtilles', 'fruits', ['myrtille', 'bleuet', 'blueberr', 'fruits rouges', 'fruits des bois'],
    `${leaf(52, 30, -40, 26, 9)}
     ${[[34, 58, 17], [66, 56, 16], [50, 76, 17]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.berry}"/>
       <path d="M${x - 4} ${y - r + 6} l4 3 l4 -3 l-1 5 l-3 2 l-3 -2z" fill="${C.berry2}" stroke-width="1.5"/>
       ${sh(x - r * 0.45, y + r * 0.1, 3, 5.5, 20, .45)}`).join('')}`);

  add('cerise', 'Cerises', 'fruits', ['cerise', 'clafoutis', 'griotte', 'cherry'],
    `<path d="M34 64 Q38 36 58 16" stroke-width="2.8" fill="none"/>
     <path d="M66 64 Q64 38 58 16" stroke-width="2.8" fill="none"/>
     ${leaf(58, 17, 10, 26, 9)}
     <circle cx="33" cy="70" r="17" fill="${C.red}"/>${sh(26, 66, 4, 6, 30)}
     <circle cx="68" cy="70" r="17" fill="${C.red2}"/>${sh(61, 66, 4, 6, 30)}`);

  add('citron', 'Citron', 'fruits', ['citron', 'lemon', 'lime', 'agrume'],
    `${leaf(60, 22, -30, 24, 9)}
     <path d="M16 54 C16 36 32 26 50 26 C68 26 84 36 84 54 C84 72 68 82 50 82 C32 82 16 72 16 54Z" fill="${C.lemon}"/>
     <path d="M12 54 q2 -4 5 -3 M88 54 q-2 -4 -5 -3" stroke-width="2.4"/>
     ${dots([[34, 48], [44, 66], [62, 44], [68, 64], [52, 54]], 1.1, '#E2C24F')}
     ${sh(32, 42, 5, 9, 50)}`);

  add('citron-tranche', 'Rondelle de citron', 'fruits', ['citron', 'lemon', 'citronnade', 'mojito'],
    `<circle cx="50" cy="50" r="38" fill="${C.lemon}"/>
     <circle cx="50" cy="50" r="31" fill="#FFF6C8" stroke-width="1.6"/>
     ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M50 50 L${50 + 28 * Math.cos((a - 18) * Math.PI / 180)} ${50 + 28 * Math.sin((a - 18) * Math.PI / 180)} A28 28 0 0 1 ${50 + 28 * Math.cos((a + 18) * Math.PI / 180)} ${50 + 28 * Math.sin((a + 18) * Math.PI / 180)}Z" fill="#F9E27A" stroke="none" transform="rotate(4 50 50) translate(${3 * Math.cos(a * Math.PI / 180)} ${3 * Math.sin(a * Math.PI / 180)})"/>`).join('')}
     <circle cx="50" cy="50" r="3" fill="#fff" stroke="none"/>`);

  add('orange', 'Orange', 'fruits', ['orange', 'clementine', 'mandarine', 'agrume'],
    `<circle cx="50" cy="56" r="33" fill="${C.orange}"/>
     ${dots([[36, 50], [46, 66], [62, 50], [66, 70], [54, 78], [38, 74], [56, 60]], 1.2, '#E08E3C')}
     ${sh(36, 44, 5, 9, 40)}
     <path d="M50 24 L50 16" stroke-width="3"/>
     ${leaf(51, 20, -25, 24, 9)}`);

  add('pomme', 'Pomme', 'fruits', ['pomme', 'tatin', 'apple', 'compote', 'crumble'],
    `<path d="M50 30 Q49 20 54 12" stroke-width="3"/>
     ${leaf(54, 20, -20, 22, 8)}
     <path d="M50 32 C40 24 16 25 17 52 C18 76 34 91 44 88 C47 87 49 86 50 86 C51 86 53 87 56 88 C66 91 82 76 83 52 C84 25 60 24 50 32Z" fill="${C.red}"/>
     ${sh(30, 50, 5, 10, 15)}`);

  add('poire', 'Poire', 'fruits', ['poire', 'pear', 'belle-helene', 'belle helene'],
    `<path d="M50 24 Q50 14 56 9" stroke-width="3"/>
     ${leaf(53, 17, -15, 20, 7)}
     <path d="M50 22 C42 22 39 30 39 40 C39 48 26 54 26 68 C26 82 38 90 50 90 C62 90 74 82 74 68 C74 54 61 48 61 40 C61 30 58 22 50 22Z" fill="#D8DE80"/>
     ${dots([[42, 64], [56, 72], [60, 58], [46, 80]], 1.1, '#B9BE5C')}
     ${sh(36, 66, 4, 9, 10)}`);

  add('peche', 'Pêche / abricot', 'fruits', ['peche', 'abricot', 'nectarine', 'apricot', 'peach'],
    `${leaf(52, 22, -35, 24, 9)}
     <path d="M50 26 C26 26 16 44 18 60 C20 78 36 88 50 88 C64 88 80 78 82 60 C84 44 74 26 50 26Z" fill="${C.peach}"/>
     <path d="M50 28 C42 42 42 70 50 86" stroke-width="2" fill="none" opacity=".6"/>
     <path d="M60 34 C72 40 78 54 74 68 C70 78 62 82 56 84 C64 70 64 48 60 34Z" fill="#F2A27A" stroke="none" opacity=".7"/>
     ${sh(32, 50, 5, 10, 20)}`);

  add('banane', 'Banane', 'fruits', ['banane', 'banana'],
    `<path d="M18 30 C14 60 34 84 66 82 C78 81 86 76 88 70 C70 76 48 70 38 54 C32 44 30 34 30 26 Z" fill="${C.yellow}"/>
     <path d="M30 28 C34 52 52 70 80 72" stroke-width="1.6" fill="none" opacity=".5"/>
     <path d="M18 30 L16 22 L28 20 L30 26Z" fill="${C.brown}"/>
     <path d="M86 70 l4 2 l-2 4z" fill="${C.choco}"/>
     ${sh(26, 50, 3, 9, -20)}`);

  add('ananas', 'Ananas', 'fruits', ['ananas', 'pineapple', 'pina colada'],
    `<path d="M50 34 L40 8 L48 18 L50 4 L52 18 L60 8 Z" fill="${C.green2}"/>
     <path d="M50 36 L30 18 L44 26Z M50 36 L70 18 L56 26Z" fill="${C.green}"/>
     <ellipse cx="50" cy="63" rx="25" ry="30" fill="${C.yellow}"/>
     <g stroke-width="1.6" opacity=".55"><path d="M30 48 L64 88 M27 64 L52 93 M36 38 L72 78 M48 34 L75 64"/><path d="M70 48 L36 88 M73 64 L48 93 M64 38 L28 78 M52 34 L25 64"/></g>
     ${sh(38, 52, 4, 9, 20)}`);

  add('kiwi', 'Kiwi', 'fruits', ['kiwi'],
    `<circle cx="50" cy="50" r="38" fill="#A57B52"/>
     <circle cx="50" cy="50" r="32" fill="#9CCB6A" stroke-width="1.5"/>
     <ellipse cx="50" cy="50" rx="12" ry="11" fill="#EEF6D2" stroke="none"/>
     ${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return `<ellipse cx="${50 + 17 * Math.cos(a)}" cy="${50 + 17 * Math.sin(a)}" rx="1.4" ry="2.6" transform="rotate(${a * 180 / Math.PI + 90} ${50 + 17 * Math.cos(a)} ${50 + 17 * Math.sin(a)})" fill="#3B2A20" stroke="none"/>`; }).join('')}`);

  add('pasteque', 'Pastèque', 'fruits', ['pasteque', 'melon', 'watermelon', 'ete'],
    `<path d="M10 36 A40 40 0 0 0 90 36 Z" fill="#7DB36A"/>
     <path d="M16 36 A34 34 0 0 0 84 36 Z" fill="#F1F7E6" stroke="none"/>
     <path d="M20 36 A30 30 0 0 0 80 36 Z" fill="#F27A7A" stroke="none"/>
     <path d="M10 36 L90 36" stroke-width="2.4"/>
     ${[[34, 46], [50, 52], [66, 46], [42, 58], [58, 58]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.8" fill="#3B2A20" stroke="none"/>`).join('')}`);

  add('figue', 'Figue', 'fruits', ['figue', 'fig'],
    `<path d="M50 18 L50 10" stroke-width="3"/>
     <path d="M50 18 C44 18 42 28 36 38 C26 52 22 64 28 76 C34 88 66 88 72 76 C78 64 74 52 64 38 C58 28 56 18 50 18Z" fill="#9C72AE"/>
     ${sh(38, 58, 4, 10, 15, .45)}
     <path d="M70 60 C80 62 86 72 80 82 C74 90 60 88 58 80Z" fill="#E7738B" stroke-width="1.8"/>`);

  add('coco', 'Noix de coco', 'fruits', ['coco', 'noix de coco', 'coconut'],
    `<circle cx="50" cy="52" r="34" fill="#8C5D3E"/>
     <path d="M20 46 A32 18 0 0 0 80 46 Z" fill="#fff" stroke-width="1.8"/>
     <path d="M18 46 A32 34 0 0 1 82 46" fill="none"/>
     <ellipse cx="50" cy="46" rx="31" ry="9" fill="#FBF7EF"/>
     <g stroke-width="1.4" opacity=".5"><path d="M30 64 l4 -2 M44 74 l4 -2 M62 70 l4 -2 M68 60 l3 -2"/></g>`);

  /* ---------------- Pâtisseries ---------------- */
  add('tarte-fraises', 'Tarte aux fraises', 'patisserie', ['tarte aux fraises', 'tarte fraise', 'tartelette', 'tarte'],
    `<path d="M10 52 L18 76 Q50 86 82 76 L90 52Z" fill="${C.crust}"/>
     <g stroke-width="1.6" opacity=".55"><path d="M24 60 L26 76 M36 62 L37 80 M50 63 L50 81 M64 62 L63 80 M76 60 L74 76"/></g>
     <ellipse cx="50" cy="51" rx="41" ry="15" fill="${C.crust}"/>
     <ellipse cx="50" cy="50" rx="34" ry="11" fill="#FFF3D8"/>
     ${[[30, 46], [44, 43], [58, 43], [72, 46], [38, 53], [52, 52], [66, 53]].map(([x, y]) => `<path d="M${x} ${y + 7} C${x - 7} ${y + 3} ${x - 7} ${y - 5} ${x} ${y - 3} C${x + 7} ${y - 5} ${x + 7} ${y + 3} ${x} ${y + 7}Z" fill="${C.red}" stroke-width="1.8"/><circle cx="${x - 2}" cy="${y}" r="1.2" fill="#fff" stroke="none" opacity=".8"/>`).join('')}
     ${leaf(52, 36, -70, 10, 5)}`);

  add('tarte-pommes', 'Tarte aux pommes', 'patisserie', ['tarte aux pommes', 'tarte pomme', 'tatin', 'tourte', 'pie'],
    `<path d="M10 52 L18 76 Q50 86 82 76 L90 52Z" fill="${C.crust2}"/>
     <ellipse cx="50" cy="51" rx="41" ry="15" fill="${C.crust2}"/>
     <ellipse cx="50" cy="50" rx="35" ry="11.5" fill="#F7D98A"/>
     <g fill="${C.crust}" stroke-width="1.6">
       <path d="M20 46 L84 49 L82 53 L18 50Z"/><path d="M24 54 L80 56 L76 60 L28 58Z"/>
       <path d="M34 40 L40 62 L35 62 L29 41Z"/><path d="M52 38 L54 62 L49 62 L47 38Z"/><path d="M70 40 L68 61 L63 61 L65 40Z"/>
     </g>
     ${sh(28, 66, 3, 6, 10, .4)}`);

  add('gateau', 'Part de gâteau', 'patisserie', ['gateau', 'cake', 'fraisier', 'genoise', 'layer', 'victoria'],
    `<path d="M12 60 L90 50 L90 80 L12 86Z" fill="#FBE7C2"/>
     <path d="M12 68 L90 60 L90 64 L12 72Z M12 77 L90 70 L90 74 L12 81Z" fill="${C.pink2}" stroke="none"/>
     <path d="M12 60 L78 34 Q88 40 90 50Z" fill="${C.rose}"/>
     <path d="M90 50 Q88 40 78 34 L78 62 Q87 68 90 80Z" fill="#F3D7A8"/>
     <path d="M12 60 L90 50 L90 80 L12 86Z" fill="none"/>
     <path d="M22 59 q4 6 8 0 q4 7 8 0 q4 6 8 0 q4 7 8 0 q4 6 8 0 q4 7 8 0 q4 5 8 -1" fill="${C.rose}" stroke-width="1.8"/>
     <path d="M74 40 C68 36 68 28 74 28 C80 26 84 32 80 38 Z" fill="${C.red}" stroke-width="1.8"/>
     ${leaf(75, 28, -80, 8, 4)}
     ${sh(40, 50, 6, 2, -18)}`);

  add('anniversaire', "Gâteau d'anniversaire", 'patisserie', ['anniversaire', 'birthday', 'fete', 'layer cake', 'number cake'],
    `<g stroke-width="2"><path d="M36 30 L36 16 M50 28 L50 12 M64 30 L64 16"/></g>
     ${[[36, 12], [50, 8], [64, 12]].map(([x, y]) => `<path d="M${x} ${y + 4} C${x - 4} ${y} ${x} ${y - 6} ${x} ${y - 6} C${x} ${y - 6} ${x + 4} ${y} ${x} ${y + 4}Z" fill="${C.yellow}" stroke-width="1.6"/>`).join('')}
     <path d="M16 40 L16 80 Q50 92 84 80 L84 40Z" fill="#FDF0F2"/>
     <path d="M16 58 Q50 68 84 58 L84 64 Q50 74 16 64Z" fill="${C.pink}" stroke-width="1.6"/>
     <ellipse cx="50" cy="40" rx="34" ry="10" fill="${C.pink}"/>
     <path d="M16 40 q0 10 4 10 q4 0 4 -6 q2 10 6 10 q4 0 4 -8 q3 8 7 8 q4 0 4 -6 q3 8 7 8 q4 0 4 -8 q3 10 7 10 q4 0 4 -8 q2 6 5 6 q3 0 3 -10" fill="${C.pink}" stroke-width="1.8"/>
     ${dots([[30, 74], [44, 78], [58, 78], [72, 74], [38, 70]], 1.6, C.blue2)}
     ${sh(24, 64, 3, 8, 0, .5)}`);

  add('cupcake', 'Cupcake', 'patisserie', ['cupcake', 'muffin', 'cake'],
    `<path d="M24 56 L32 90 L68 90 L76 56Z" fill="${C.pink}"/>
     <g stroke-width="1.6" opacity=".55"><path d="M34 58 L39 89 M44 58 L46 89 M56 58 L54 89 M66 58 L61 89"/></g>
     <path d="M20 58 C14 48 24 40 30 42 C28 32 40 26 48 32 C50 22 64 22 66 32 C76 30 84 40 78 48 C86 52 82 62 74 60 L26 60 C20 62 16 60 20 58Z" fill="#FFF4E8"/>
     <path d="M34 42 C40 38 50 40 54 44 M58 36 C64 34 70 36 72 40" stroke-width="1.8" opacity=".6"/>
     <circle cx="52" cy="22" r="8" fill="${C.red}"/>${sh(49, 19, 2, 3, 30)}
     <path d="M52 14 Q54 6 60 4" stroke-width="2"/>
     ${dots([[30, 52], [44, 52], [62, 50], [70, 54], [38, 46]], 1.4, C.blue2)}`);

  add('macaron', 'Macarons', 'patisserie', ['macaron', 'meringue', 'ganache'],
    `${[[50, 66, C.mint, '#FFF6EA'], [50, 34, C.pink, '#FFFFFF']].map(([x, y, col, fill]) => `
      <path d="M${x - 32} ${y + 4} Q${x - 32} ${y + 18} ${x} ${y + 18} Q${x + 32} ${y + 18} ${x + 32} ${y + 4}Z" fill="${col}"/>
      <path d="M${x - 32} ${y + 4} q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0 q2 -3 4 0" fill="none" stroke-width="1.4"/>
      <rect x="${x - 30}" y="${y - 3}" width="60" height="7" rx="3" fill="${fill}"/>
      <path d="M${x - 32} ${y - 4} Q${x - 32} ${y - 20} ${x} ${y - 20} Q${x + 32} ${y - 20} ${x + 32} ${y - 4}Z" fill="${col}"/>
      ${sh(x - 16, y - 12, 7, 3, -10)}`).join('')}`);

  add('croissant', 'Croissant', 'patisserie', ['croissant', 'viennoiserie', 'petit dejeuner', 'brunch', 'pain au chocolat'],
    `<path d="M8 62 Q12 44 26 40 Q38 28 50 28 Q62 28 74 40 Q88 44 92 62 Q86 70 76 64 Q70 58 64 56 Q58 54 50 54 Q42 54 36 56 Q30 58 24 64 Q14 70 8 62Z" fill="#EDB566"/>
     <g fill="none" stroke-width="2"><path d="M26 40 Q34 48 36 56"/><path d="M40 31 Q46 42 44 54"/><path d="M60 31 Q54 42 56 54"/><path d="M74 40 Q66 48 64 56"/></g>
     ${sh(48, 36, 7, 2.5, 0, .55)}${sh(30, 46, 3, 2, -30, .5)}${sh(66, 40, 3, 2, 30, .5)}`);

  add('cookie', 'Cookie', 'patisserie', ['cookie', 'biscuit', 'sable', 'pepites'],
    `<path d="M50 12 C70 12 88 28 88 50 C88 72 72 88 50 88 C28 88 12 72 12 50 C12 28 30 12 50 12Z" fill="${C.cookie}"/>
     ${[[34, 32, 5], [58, 26, 4], [72, 46, 5], [40, 54, 6], [60, 64, 5], [30, 70, 4], [52, 44, 3.5], [72, 70, 3.5]].map(([x, y, r]) => `<path d="M${x - r} ${y} Q${x - r} ${y - r} ${x} ${y - r} Q${x + r + 1} ${y - r} ${x + r} ${y + 1} Q${x + r} ${y + r} ${x - 1} ${y + r} Q${x - r} ${y + r} ${x - r} ${y}Z" fill="${C.choco}" stroke-width="1.4"/>`).join('')}
     ${dots([[46, 30], [26, 52], [64, 80], [80, 58], [46, 74]], 1.1, '#B98549')}
     ${sh(28, 30, 5, 3, -40, .4)}`);

  add('donut', 'Donut', 'patisserie', ['donut', 'beignet', 'doughnut', 'berliner'],
    `<path fill-rule="evenodd" d="M50 12 C72 12 88 28 88 50 C88 72 72 88 50 88 C28 88 12 72 12 50 C12 28 28 12 50 12Z M50 40 C44 40 40 44 40 50 C40 56 44 60 50 60 C56 60 60 56 60 50 C60 44 56 40 50 40Z" fill="${C.crust}"/>
     <path fill-rule="evenodd" d="M50 18 C64 16 82 26 82 44 C84 52 78 52 78 58 C78 66 70 64 66 72 C60 80 52 76 44 80 C36 82 34 74 28 72 C20 70 22 62 18 56 C14 48 20 42 20 36 C24 24 38 18 50 18Z M50 40 C44 40 40 44 40 50 C40 56 44 60 50 60 C56 60 60 56 60 50 C60 44 56 40 50 40Z" fill="${C.pink}"/>
     <g stroke-width="2.6">${[[30, 34, C.yellow, 30], [44, 26, C.blue2, -20], [64, 30, C.white, 60], [72, 44, C.mint, 10], [70, 60, C.yellow, -40], [32, 58, C.blue2, 50], [42, 68, C.white, 0], [56, 70, C.mint, 70], [26, 46, C.white, -60]]
      .map(([x, y, c, r]) => `<path d="M${x - 3} ${y} L${x + 3} ${y}" stroke="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>
     ${sh(30, 26, 6, 2.5, -30)}`);

  add('pancakes', 'Pancakes', 'patisserie', ['pancake', 'crepe', 'blini', 'brunch', 'petit dejeuner'],
    `<ellipse cx="50" cy="82" rx="42" ry="10" fill="#fff"/>
     ${[74, 64, 54, 44].map((y) => `<path d="M16 ${y - 4} Q16 ${y + 6} 50 ${y + 6} Q84 ${y + 6} 84 ${y - 4}Z" fill="#F2C47E"/><ellipse cx="50" cy="${y - 4}" rx="34" ry="8" fill="#FCE3B4"/>`).join('')}
     <path d="M20 38 Q22 46 24 50 Q28 54 30 46 Q34 44 36 44 Q40 56 44 62 Q48 64 48 54 Q56 46 62 46 Q66 50 66 58 Q70 62 72 54 Q76 46 80 40Z" fill="#E59A3C" stroke-width="1.8"/>
     <rect x="42" y="30" width="16" height="9" rx="2.5" fill="${C.butter}"/>
     <circle cx="30" cy="36" r="5" fill="${C.berry}"/><circle cx="70" cy="34" r="5" fill="${C.berry}"/>
     ${sh(26, 68, 4, 2, 0, .5)}`);

  add('gaufre', 'Gaufre', 'patisserie', ['gaufre', 'waffle'],
    `<rect x="14" y="14" width="72" height="72" rx="14" fill="#F0C277" transform="rotate(-8 50 50)"/>
     <g transform="rotate(-8 50 50)">
       ${[0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => `<rect x="${21 + i * 15.5}" y="${21 + j * 15.5}" width="11" height="11" rx="2.5" fill="#DDA055" stroke-width="1.4"/>`).join('')).join('')}
       <path d="M34 30 Q36 44 42 48 Q46 58 52 50 Q58 60 62 48 Q68 44 66 30Z" fill="#E59A3C" stroke-width="1.8"/>
       <rect x="40" y="26" width="20" height="13" rx="3" fill="${C.butter}" stroke-width="1.8"/>
     </g>`);

  add('baguette', 'Baguette', 'patisserie', ['pain', 'baguette', 'boulangerie', 'sandwich', 'tartine'],
    `<path d="M14 80 C8 74 12 66 20 60 L64 18 C72 12 82 12 86 18 C90 24 86 32 80 38 L36 82 C28 88 20 86 14 80Z" fill="#E7AE62"/>
     <g fill="#F7D79C" stroke-width="1.8"><path d="M30 66 Q34 58 42 56 Q38 64 30 66Z"/><path d="M44 52 Q48 44 56 42 Q52 50 44 52Z"/><path d="M58 38 Q62 30 70 28 Q66 36 58 38Z"/></g>
     ${sh(24, 70, 3, 6, 45, .5)}`);

  add('brioche', 'Brioche', 'patisserie', ['brioche', 'pain au lait', 'kouglof', 'babka'],
    `<path d="M16 58 Q50 50 84 58 L76 86 Q50 92 24 86Z" fill="#E7A858"/>
     <g stroke-width="1.6" opacity=".5"><path d="M30 60 L32 86 M42 58 L43 88 M54 58 L54 88 M66 60 L65 87"/></g>
     <ellipse cx="50" cy="56" rx="36" ry="12" fill="#F1BA6A"/>
     <circle cx="50" cy="36" r="14" fill="#EDB25F"/>
     ${sh(44, 31, 4, 3, -30)}${sh(34, 52, 6, 2.5, -10)}`);

  add('madeleine', 'Madeleine', 'patisserie', ['madeleine', 'financier', 'gouter'],
    `<path d="M10 56 C10 30 34 16 54 18 C76 20 92 36 90 56 C88 72 70 84 50 84 C30 84 10 76 10 56Z" fill="#F1BD6C"/>
     <g fill="none" stroke-width="1.8" opacity=".7"><path d="M22 70 Q40 50 50 26"/><path d="M34 76 Q48 54 58 28"/><path d="M48 80 Q58 58 68 32"/><path d="M62 78 Q70 60 78 42"/><path d="M16 60 Q30 46 42 28"/></g>
     <path d="M76 66 Q86 54 88 46" stroke-width="4" stroke="#D99545" opacity=".8"/>`);

  add('eclair', 'Éclair', 'patisserie', ['eclair', 'chou', 'profiterole', 'religieuse', 'paris-brest'],
    `<rect x="10" y="40" width="80" height="34" rx="17" fill="#EDB566"/>
     <path d="M14 50 C14 40 22 36 30 36 L70 36 C80 36 86 42 86 50 C80 54 76 50 72 54 C66 58 62 50 56 54 C50 58 46 52 40 55 C34 58 30 50 24 54 C18 56 14 54 14 50Z" fill="${C.choco}"/>
     ${sh(36, 42, 12, 2, 0, .4)}
     <path d="M24 66 Q50 72 76 66" stroke-width="1.6" opacity=".5" fill="none"/>`);

  add('glace', 'Glace', 'patisserie', ['glace', 'sorbet', 'ice cream', 'gelato', 'esquimau'],
    `<path d="M32 52 L50 92 L68 52Z" fill="#EDB566"/>
     <g stroke-width="1.4" opacity=".6"><path d="M36 60 L58 74 M40 70 L54 80 M44 54 L64 64 M52 54 L42 76 M62 56 L50 84"/></g>
     <circle cx="38" cy="46" r="14" fill="${C.mint}"/>
     <circle cx="62" cy="46" r="14" fill="${C.pink}"/>
     <circle cx="50" cy="30" r="14" fill="#FFF3DE"/>
     <path d="M26 52 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" fill="none" stroke-width="1.8"/>
     <circle cx="52" cy="13" r="6" fill="${C.red}"/>${sh(46, 25, 4, 2.5, -30)}`);

  add('muffin', 'Muffin chocolat', 'patisserie', ['muffin', 'chocolat', 'brownie', 'fondant'],
    `<path d="M26 52 L32 88 L68 88 L74 52Z" fill="${C.blue}"/>
     <g stroke-width="1.6" opacity=".55"><path d="M36 54 L39 87 M46 54 L47 88 M56 54 L55 88 M66 54 L62 87"/></g>
     <path d="M18 54 C14 40 26 24 50 22 C74 24 86 40 82 54 Q50 60 18 54Z" fill="#8E5A3C"/>
     ${[[34, 36], [50, 30], [64, 38], [42, 46], [58, 48], [28, 48], [72, 50]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" rx="1.5" fill="${C.choco2}" stroke-width="1.2" transform="rotate(${x} ${x} ${y})"/>`).join('')}
     ${sh(32, 30, 6, 2.5, -30, .4)}`);

  add('chocolat', 'Tablette de chocolat', 'patisserie', ['chocolat', 'cacao', 'ganache', 'fondant', 'brownie', 'mousse au chocolat'],
    `<g transform="rotate(-12 50 50)">
       <rect x="20" y="10" width="60" height="80" rx="6" fill="${C.choco}"/>
       ${[0, 1].map((i) => [0, 1, 2, 3].map((j) => `<rect x="${25 + i * 26}" y="${15 + j * 18.5}" width="22" height="15" rx="2.5" fill="#8C5940" stroke-width="1.6"/>`).join('')).join('')}
       <path d="M18 56 L82 50 L82 92 Q50 96 18 92Z" fill="${C.rose}"/>
       <path d="M18 64 L82 58 M18 84 L82 80" stroke-width="1.6" opacity=".6"/>
       <text x="50" y="76" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="11" fill="${O}" stroke="none" transform="rotate(-4 50 72)">Choco</text>
     </g>`);

  add('pepites', 'Bocal de pépites', 'patisserie', ['pepites', 'chocolat', 'cookie', 'chips'],
    `<rect x="32" y="8" width="36" height="10" rx="3" fill="${C.wood}"/>
     <path d="M24 22 Q24 16 30 16 L70 16 Q76 16 76 22 L76 84 Q76 92 68 92 L32 92 Q24 92 24 84Z" fill="#EEF2F3"/>
     ${Array.from({ length: 22 }, (_, i) => { const x = 30 + (i * 37) % 40; const y = 46 + Math.floor(i / 5) * 9 + (i % 2) * 3; return `<path d="M${x - 3} ${y + 3} L${x} ${y - 3} L${x + 3} ${y + 3}Z" fill="${C.choco}" stroke-width="1.2"/>`; }).join('')}
     ${label(29, 54, 42, 18, 'Pépites', 10)}
     ${sh(30, 30, 2.5, 9, 0, .7)}`);

  add('crepe', 'Crêpe', 'patisserie', ['crepe', 'galette', 'chandeleur', 'nutella', 'pate a tartiner'],
    `<path d="M14 84 L84 84 A70 70 0 0 0 14 14Z" fill="#F4CF8D"/>
     <path d="M14 84 L64 84 A50 50 0 0 0 14 34Z" fill="#F8DCA6" stroke-width="1.8"/>
     ${dots([[24, 30], [52, 40], [70, 62], [30, 56], [46, 70], [24, 74], [62, 76]], 2, '#D9A55B')}
     <path d="M20 46 L34 40 L28 56 L46 50 L38 66 L58 60 L50 76 L70 72" fill="none" stroke="${C.choco}" stroke-width="3.4"/>
     <path d="M70 40 C62 34 62 24 70 24 C78 22 82 30 78 38Z" fill="${C.red}" stroke-width="1.8"/>
     ${leaf(71, 24, -80, 9, 4)}`);

  add('verrine', 'Verrine', 'patisserie', ['verrine', 'tiramisu', 'mousse', 'panna cotta', 'trifle', 'cheesecake', 'creme'],
    `<path d="M24 26 L28 84 Q30 92 40 92 L60 92 Q70 92 72 84 L76 26Z" fill="#F7F4F1"/>
     <path d="M27 68 L73 68 L72 84 Q70 90 60 90 L40 90 Q30 90 28 84Z" fill="#B88460" stroke="none"/>
     <path d="M26.5 54 L73.5 54 L73 68 L27 68Z" fill="#FFF3DB" stroke="none"/>
     <path d="M26 42 L74 42 L73.5 54 L26.5 54Z" fill="${C.pink}" stroke="none"/>
     <path d="M26 36 Q34 30 42 36 Q50 28 58 36 Q66 30 74 36 L74 42 L26 42Z" fill="#FFFDF8" stroke-width="1.6"/>
     <path d="M24 26 L28 84 Q30 92 40 92 L60 92 Q70 92 72 84 L76 26" fill="none"/>
     <path d="M52 30 C46 26 46 18 52 18 C58 16 62 22 58 28Z" fill="${C.red}" stroke-width="1.8"/>
     ${leaf(40, 24, -30, 12, 5)}
     ${sh(32, 60, 2, 16, 0, .7)}`);

  add('flan', 'Flan', 'patisserie', ['flan', 'creme caramel', 'pudding', 'caramel', 'creme brulee', 'teurgoule'],
    `<ellipse cx="50" cy="82" rx="40" ry="9" fill="#fff"/>
     <path d="M22 44 L16 78 Q50 88 84 78 L78 44Z" fill="${C.yellow}"/>
     <ellipse cx="50" cy="44" rx="28" ry="9" fill="#C77B2E"/>
     <path d="M22 44 Q24 54 28 50 Q30 60 34 52 Q40 58 44 52 Q50 60 56 52 Q62 58 66 52 Q70 60 72 50 Q76 54 78 44" fill="#C77B2E" stroke-width="1.8"/>
     ${sh(28, 66, 3, 8, 8, .5)}`);

  /* ---------------- Ingrédients ---------------- */
  add('oeufs', "Boîte d'œufs", 'ingredients', ['oeuf', 'oeufs', 'egg'],
    `${[[30, 46], [50, 44], [70, 46], [32, 60], [52, 58], [72, 60]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="11" fill="#F3C9A0"/>${sh(x - 3, y - 4, 2, 3.5, 20, .7)}`).join('')}
     <path d="M12 58 L18 84 Q20 88 26 88 L74 88 Q80 88 82 84 L88 58 Q80 66 74 62 Q68 70 60 64 Q50 72 40 64 Q32 70 26 62 Q20 66 12 58Z" fill="#EADFD2"/>
     <g stroke-width="1.6" opacity=".55"><path d="M30 70 L32 86 M50 72 L50 88 M70 70 L68 86"/></g>`);

  add('oeuf', 'Œuf cassé', 'ingredients', ['oeuf', 'jaune', 'blanc', 'meringue', 'egg'],
    `<path d="M14 46 L22 40 L28 48 L36 38 L44 46 L52 38 L60 46 L68 38 L76 46 L82 40 L88 46 C90 70 74 88 50 88 C26 88 10 70 14 46Z" fill="#F3C9A0"/>
     <ellipse cx="50" cy="54" rx="30" ry="9" fill="#FFF6E8" stroke-width="1.6"/>
     <circle cx="50" cy="52" r="12" fill="#F9B934"/>${sh(46, 48, 3.5, 2.5, -30, .8)}
     ${sh(24, 66, 3, 8, 30, .5)}`);

  add('farine', 'Farine', 'ingredients', ['farine', 'pate', 'pain', 'flour', 'ble'],
    `<path d="M20 26 L80 26 L84 88 Q84 92 80 92 L20 92 Q16 92 16 88Z" fill="#F7EEDF"/>
     <path d="M20 26 L24 14 L76 14 L80 26Z" fill="#EFE2CC"/>
     <path d="M24 14 Q50 22 76 14" fill="none" stroke-width="1.6"/>
     <rect x="26" y="40" width="48" height="36" rx="5" fill="${C.blue}"/>
     <text x="50" y="58" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="#fff" stroke="${O}" stroke-width=".6">FARINE</text>
     <g stroke-width="1.6"><path d="M50 72 L50 62"/><path d="M50 66 q-4 -1 -5 -4 q4 0 5 4 q1 -3 5 -4 q-1 3 -5 4"/></g>`);

  add('sucre', 'Sucre', 'ingredients', ['sucre', 'sugar', 'cassonade', 'sirop', 'caramel'],
    `<rect x="24" y="12" width="52" height="14" rx="5" fill="${C.wood}"/>
     <path d="M20 30 Q20 24 28 24 L72 24 Q80 24 80 30 L80 82 Q80 92 70 92 L30 92 Q20 92 20 82Z" fill="${C.sage}"/>
     ${label(28, 48, 44, 18, 'SUCRE', 11, '#FFF8EC')}
     ${sh(28, 40, 3, 8, 0, .5)}`);

  add('beurre', 'Beurre', 'ingredients', ['beurre', 'butter', 'demi-sel', 'feuilletage'],
    `<path d="M8 66 L18 80 L82 80 L92 66Z" fill="#F4F0EA"/>
     <path d="M8 66 Q50 62 92 66" fill="none"/>
     <path d="M26 42 L62 34 L80 46 L80 66 L44 74 L26 62Z" fill="${C.butter}"/>
     <path d="M26 42 L62 34 L80 46 L44 54Z" fill="#FCEAB0"/>
     <path d="M44 54 L44 74" fill="none"/>
     ${sh(40, 46, 6, 2, -12, .7)}`);

  add('lait', 'Lait', 'ingredients', ['lait', 'creme', 'milk', 'yaourt', 'bechamel'],
    `<rect x="38" y="6" width="24" height="10" rx="3" fill="${C.blue}"/>
     <path d="M40 16 L60 16 L60 24 Q74 30 74 44 L74 86 Q74 94 66 94 L34 94 Q26 94 26 86 L26 44 Q26 30 40 24Z" fill="#FBFAF7"/>
     ${label(31, 50, 38, 28, '', 0, '#FFF')}
     <text x="50" y="64" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="11" fill="${C.blue2}" stroke="none">LAIT</text>
     <path d="M38 68 h20 a2 2 0 0 1 0 6 h-20 a2 2 0 0 1 0 -6z" fill="#fff" stroke-width="1.2"/>
     ${dots([[42, 71], [52, 70]], 1.6, O)}
     ${sh(32, 38, 2.5, 9, 0, .8)}`);

  add('vanille', 'Vanille', 'ingredients', ['vanille', 'vanilla', 'extrait'],
    `<rect x="38" y="10" width="24" height="12" rx="3" fill="${C.choco}"/>
     <path d="M36 24 L64 24 L64 32 Q72 36 72 46 L72 88 Q72 94 66 94 L34 94 Q28 94 28 88 L28 46 Q28 36 36 32Z" fill="#9A6136"/>
     ${label(30, 52, 40, 26, '', 0, '#FFF6D8')}
     <text x="50" y="65" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="13" fill="${O}" stroke="none">Vanille</text>
     <path d="M44 72 Q50 68 56 72" stroke-width="1.6" fill="none"/>
     ${sh(34, 42, 2.5, 8, 0, .5)}`);

  add('miel', 'Miel', 'ingredients', ['miel', 'honey'],
    `<rect x="26" y="20" width="48" height="12" rx="4" fill="${C.wood}"/>
     <path d="M22 36 Q22 32 26 32 L74 32 Q78 32 78 36 L80 82 Q80 92 70 92 L30 92 Q20 92 20 82Z" fill="#F4B53F"/>
     <path d="M22 36 Q30 46 36 40 Q40 50 46 40 Q54 48 60 40 Q66 46 72 38 L78 36" fill="#FFF3D6" stroke-width="1.6"/>
     ${label(32, 56, 36, 18, 'MIEL', 11, '#FFF6E2')}
     <path d="M64 30 L80 6" stroke-width="3.5"/><ellipse cx="62" cy="34" rx="6" ry="5" fill="${C.wood2}"/>
     ${sh(28, 66, 2.5, 9, 0, .5)}`);

  add('sel', 'Sel & poivre', 'ingredients', ['sel', 'poivre', 'epice', 'assaisonnement', 'salt'],
    `${[[32, '#FBFAF7'], [68, '#5B4A42']].map(([x, col]) => `
      <path d="M${x - 10} 30 Q${x - 10} 18 ${x} 18 Q${x + 10} 18 ${x + 10} 30Z" fill="${C.steel}"/>
      ${dots([[x - 4, 24], [x, 22], [x + 4, 24]], 1.3, O)}
      <path d="M${x - 12} 30 L${x + 12} 30 L${x + 14} 84 Q${x + 14} 90 ${x + 8} 90 L${x - 8} 90 Q${x - 14} 90 ${x - 14} 84Z" fill="#F0F4F6"/>
      <path d="M${x - 12} 52 L${x + 12} 52 L${x + 13.4} 84 Q${x + 13} 89 ${x + 8} 89 L${x - 8} 89 Q${x - 13} 89 ${x - 13.4} 84Z" fill="${col}" stroke="none"/>
      ${sh(x - 7, 46, 1.8, 8, 0, .8)}`).join('')}
     <text x="32" y="74" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="${O}" stroke="none">S</text>
     <text x="68" y="74" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="12" fill="#fff" stroke="none">P</text>`);

  add('amandes', 'Amandes & noisettes', 'ingredients', ['amande', 'noisette', 'noix', 'praline', 'frangipane', 'pistache', 'fruits secs'],
    `${[[34, 40, -30], [62, 34, 20]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x} ${y - 18} C${x + 12} ${y - 8} ${x + 12} ${y + 10} ${x} ${y + 16} C${x - 12} ${y + 10} ${x - 12} ${y - 8} ${x} ${y - 18}Z" fill="#C98B55"/><path d="M${x - 4} ${y - 6} Q${x} ${y + 2} ${x - 2} ${y + 10} M${x + 4} ${y - 8} Q${x + 6} ${y} ${x + 4} ${y + 8}" stroke-width="1.3" opacity=".55"/></g>`).join('')}
     <circle cx="48" cy="68" r="17" fill="#B9773F"/><path d="M34 60 Q48 50 62 60 Q58 50 48 49 Q38 50 34 60Z" fill="#E4C08F" stroke-width="1.6"/>${sh(40, 70, 3, 5, 30, .5)}
     <circle cx="76" cy="70" r="12" fill="#B9773F"/><path d="M66 64 Q76 56 86 64 Q82 57 76 56 Q70 57 66 64Z" fill="#E4C08F" stroke-width="1.6"/>`);

  add('cannelle', 'Cannelle', 'ingredients', ['cannelle', 'epices', 'speculoos', 'pain d\'epice', 'noel', 'chai'],
    `${[[-14, 0], [0, -4], [14, 0]].map(([dx, dy]) => `<g transform="translate(${dx} ${dy}) rotate(-12 50 50)"><rect x="42" y="12" width="16" height="76" rx="7" fill="#B9703F"/><path d="M46 14 L46 86" stroke-width="1.4" opacity=".5"/><ellipse cx="50" cy="13" rx="8" ry="3.5" fill="#D4935C"/></g>`).join('')}
     <path d="M20 52 Q50 62 80 50 L80 60 Q50 72 20 62Z" fill="${C.pink2}"/>
     <path d="M50 58 C40 46 30 50 36 58 C30 66 40 70 50 60 C60 70 70 66 64 58 C70 50 60 46 50 58Z" fill="${C.pink}"/>
     <circle cx="50" cy="59" r="4" fill="${C.pink2}"/>`);

  add('levure', 'Levure', 'ingredients', ['levure', 'bicarbonate', 'sachet'],
    `<path d="M22 14 L78 14 L78 86 L22 86Z" fill="${C.rose}" transform="rotate(6 50 50)"/>
     <g transform="rotate(6 50 50)"><path d="M22 22 L78 22" stroke-dasharray="3 3" stroke-width="1.6"/>
     ${label(28, 40, 44, 20, 'Levure', 11, '#fff')}
     <circle cx="50" cy="72" r="6" fill="${C.butter}" stroke-width="1.6"/></g>`);

  add('creme-chantilly', 'Chantilly', 'ingredients', ['chantilly', 'creme fouettee', 'creme', 'mascarpone'],
    `<path d="M22 56 L28 88 Q50 94 72 88 L78 56Z" fill="${C.blue}"/>
     <path d="M16 56 C10 46 22 40 28 42 C26 30 40 26 46 32 C48 18 66 22 64 32 C76 30 82 42 76 48 C86 52 84 60 76 60 L24 60 C16 62 12 58 16 56Z" fill="#FFFDF7"/>
     <path d="M36 44 Q44 38 52 44 M58 38 Q64 36 68 40" stroke-width="1.6" opacity=".55"/>
     <ellipse cx="50" cy="74" rx="16" ry="6" fill="#fff" stroke-width="1.4" opacity=".9"/>`);

  /* ---------------- Ustensiles ---------------- */
  add('fouet', 'Fouet', 'ustensiles', ['fouet', 'battre', 'monter', 'whisk'],
    `<g transform="rotate(35 50 50)">
       <rect x="44" y="58" width="12" height="34" rx="6" fill="${C.wood}"/>
       <g fill="none" stroke="#8FA39A" stroke-width="2.4"><path d="M47 60 C30 40 36 8 50 8 C64 8 70 40 53 60"/><path d="M48 60 C40 40 42 10 50 8 C58 10 60 40 52 60"/><path d="M50 60 L50 8"/></g>
       <rect x="45" y="56" width="10" height="6" rx="2" fill="${C.steel}"/>
       ${sh(48, 76, 1.5, 7, 0, .6)}
     </g>`);

  add('rouleau', 'Rouleau à pâtisserie', 'ustensiles', ['rouleau', 'etaler', 'pate', 'abaisse'],
    `<g transform="rotate(-35 50 50)">
       <rect x="4" y="44" width="14" height="12" rx="6" fill="${C.wood2}"/>
       <rect x="82" y="44" width="14" height="12" rx="6" fill="${C.wood2}"/>
       <rect x="16" y="38" width="68" height="24" rx="10" fill="${C.wood}"/>
       ${sh(40, 44, 16, 2.5, 0, .55)}
     </g>`);

  add('spatule', 'Spatule', 'ustensiles', ['spatule', 'maryse', 'melanger'],
    `<g transform="rotate(-35 50 50)">
       <rect x="46" y="38" width="8" height="56" rx="4" fill="${C.wood}"/>
       <path d="M36 12 Q36 6 42 6 L58 6 Q64 6 64 12 L64 30 Q64 42 50 42 Q36 42 36 30Z" fill="${C.pink}"/>
       <circle cx="50" cy="86" r="2" fill="#fff" stroke-width="1.2"/>
       ${sh(42, 18, 2, 6, 0, .7)}
     </g>`);

  add('bol', 'Saladier', 'ustensiles', ['bol', 'saladier', 'melanger', 'pate'],
    `<path d="M10 40 Q12 86 50 86 Q88 86 90 40Z" fill="${C.pink}"/>
     <g stroke-width="1.6" opacity=".5">${[20, 30, 40, 50, 60, 70, 80].map((x) => `<path d="M${x} 44 Q${x + (50 - x) * 0.15} 66 ${x + (50 - x) * 0.3} 82"/>`).join('')}</g>
     <ellipse cx="50" cy="40" rx="40" ry="10" fill="#FFF6EA"/>
     <ellipse cx="50" cy="42" rx="32" ry="6" fill="#F7E3C6" stroke="none"/>
     <rect x="38" y="84" width="24" height="5" rx="2" fill="${C.pink2}"/>`);

  add('verre-doseur', 'Verre doseur', 'ustensiles', ['doseur', 'mesure', 'verre', 'liquide'],
    `<path d="M72 34 Q90 34 90 52 Q90 70 72 70" fill="none" stroke-width="6" stroke="${O}"/>
     <path d="M72 34 Q90 34 90 52 Q90 70 72 70" fill="none" stroke-width="2.6" stroke="#EDF3F5"/>
     <path d="M16 22 L78 22 L72 88 Q72 92 66 92 L28 92 Q22 92 22 88 L18 30 L10 26Z" fill="#EEF5F7" opacity=".95"/>
     <path d="M21 58 L75 58 L72 88 Q72 92 66 92 L28 92 Q22 92 22 88Z" fill="${C.blue}" stroke="none" opacity=".7"/>
     <g stroke="${C.red2}" stroke-width="1.6"><path d="M30 34 L30 84"/>${[36, 46, 56, 66, 76].map((y) => `<path d="M30 ${y} L38 ${y}"/>`).join('')}</g>
     ${sh(62, 50, 2, 12, 0, .8)}`);

  add('cuilleres', 'Cuillères doseuses', 'ustensiles', ['cuillere', 'doseuse', 'mesure', 'cuillere a soupe'],
    `<circle cx="70" cy="18" r="9" fill="none" stroke-width="3" stroke="${C.steel}"/><circle cx="70" cy="18" r="9" fill="none" stroke-width="1"/>
     ${[[C.pink, 18, 64, 12], [C.yellow, 34, 74, 11], [C.sage, 52, 80, 10], [C.blue, 70, 80, 9]].map(([col, x, y, r]) => `<path d="M70 22 L${x + r * 0.6} ${y - r * 0.8}" stroke-width="6" stroke="${O}"/><path d="M70 22 L${x + r * 0.6} ${y - r * 0.8}" stroke-width="3" stroke="${col}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.6}" ry="${r * 0.45}" fill="#fff" opacity=".5" stroke="none"/>`).join('')}`);

  add('gant', 'Gant de cuisine', 'ustensiles', ['gant', 'four', 'cuisson', 'manique'],
    `<g transform="rotate(-10 50 50)">
       <path d="M28 82 L28 40 C28 24 38 14 52 14 C66 14 74 24 74 40 L74 82Z" fill="${C.pink}"/>
       <path d="M28 52 C18 48 12 40 16 32 C20 26 28 30 30 38Z" fill="${C.pink}"/>
       <rect x="24" y="78" width="54" height="12" rx="5" fill="#FBDDE2"/>
       <path d="M48 90 Q48 98 54 98 Q60 98 58 90" fill="none" stroke-width="2"/>
       ${dots([[40, 30], [56, 26], [64, 40], [44, 46], [58, 56], [38, 64], [64, 70], [50, 70], [22, 40]], 2.4, '#fff')}
     </g>`);

  add('robot', 'Robot pâtissier', 'ustensiles', ['robot', 'kitchenaid', 'petrir', 'batteur', 'brioche'],
    `<path d="M20 90 L20 30 Q20 12 40 12 L76 12 Q88 12 88 24 L88 38 Q88 44 82 44 L44 44 L44 90Z" fill="${C.pink}"/>
     <rect x="14" y="86" width="74" height="8" rx="4" fill="${C.pink2}"/>
     <path d="M46 56 L88 56 Q86 84 67 84 Q48 84 46 56Z" fill="${C.steel}"/>
     <path d="M66 44 L66 60" stroke-width="3"/>
     <circle cx="80" cy="26" r="3" fill="#fff" stroke-width="1.4"/>
     <path d="M28 70 c-3 -3 0 -7 3 -4 c3 -3 6 1 3 4 l-3 3z" fill="${C.pink2}" stroke-width="1.4"/>
     ${sh(28, 30, 3, 9, 0, .55)}${sh(54, 64, 2, 7, 0, .7)}`);

  add('minuteur', 'Minuteur', 'ustensiles', ['minuteur', 'temps', 'cuisson', 'timer', 'repos'],
    `<rect x="44" y="6" width="12" height="10" rx="3" fill="${C.steel}"/>
     <circle cx="50" cy="56" r="36" fill="${C.mint}"/>
     <circle cx="50" cy="56" r="27" fill="#FFFDF7"/>
     <g stroke-width="2">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<path d="M${50 + 22 * Math.cos(a * Math.PI / 180)} ${56 + 22 * Math.sin(a * Math.PI / 180)} L${50 + 25 * Math.cos(a * Math.PI / 180)} ${56 + 25 * Math.sin(a * Math.PI / 180)}"/>`).join('')}</g>
     <path d="M50 56 L50 38 M50 56 L62 62" stroke-width="3"/>
     <circle cx="50" cy="56" r="3" fill="${C.red}" stroke-width="1.4"/>
     ${sh(28, 40, 4, 8, 40, .55)}`);

  add('toque', 'Toque de chef', 'ustensiles', ['toque', 'chef', 'cuisine', 'gastronomie'],
    `<path d="M24 60 C10 58 8 36 24 32 C24 16 42 10 50 20 C58 10 76 16 76 32 C92 36 90 58 76 60Z" fill="#FFFFFF"/>
     <path d="M26 58 L28 86 L72 86 L74 58Z" fill="#FFFFFF"/>
     <path d="M28 76 L72 76" stroke-width="1.6"/>
     <g stroke-width="1.6" opacity=".45"><path d="M40 46 L42 74 M50 40 L50 74 M60 46 L58 74"/></g>
     <path d="M28 78 L72 78 L72 86 L28 86Z" fill="${C.blue}" stroke-width="1.6"/>`);

  add('casserole', 'Casserole', 'ustensiles', ['casserole', 'soupe', 'mijoter', 'sauce', 'bouillir', 'cuisson'],
    `${steam(50, 30)}
     <path d="M10 46 L4 44 M90 46 L96 44" stroke-width="5"/>
     <path d="M12 42 L88 42 L84 82 Q82 90 72 90 L28 90 Q18 90 16 82Z" fill="${C.sage}"/>
     <ellipse cx="50" cy="42" rx="38" ry="7" fill="#9CB78A"/>
     <path d="M14 52 Q50 58 86 52" stroke-width="1.6" opacity=".5" fill="none"/>
     ${sh(24, 66, 3, 10, 0, .5)}`);

  add('poele', 'Poêle', 'ustensiles', ['poele', 'sauter', 'omelette', 'oeuf au plat', 'frire'],
    `<path d="M70 58 L96 78" stroke-width="10" stroke="${O}"/><path d="M70 58 L95 77" stroke-width="5.5" stroke="${C.wood2}"/>
     <ellipse cx="40" cy="50" rx="36" ry="30" fill="#6E6A68"/>
     <ellipse cx="40" cy="50" rx="29" ry="23" fill="#8C8885" stroke-width="1.6"/>
     <path d="M24 50 C20 38 34 30 42 34 C52 30 60 40 56 50 C60 60 48 66 40 62 C30 66 22 60 24 50Z" fill="#fff" stroke-width="1.6"/>
     <circle cx="40" cy="48" r="7.5" fill="#F9B934"/>${sh(38, 46, 2, 1.5, -30, .9)}`);

  add('livre', 'Livre de recettes', 'ustensiles', ['livre', 'carnet', 'recette', 'grand-mere', 'famille'],
    `<path d="M50 24 Q30 14 10 20 L10 82 Q30 76 50 86Z" fill="#FFFAF0"/>
     <path d="M50 24 Q70 14 90 20 L90 82 Q70 76 50 86Z" fill="#FFFAF0"/>
     <path d="M50 24 L50 86" stroke-width="1.6"/>
     <g stroke-width="1.6" opacity=".5"><path d="M18 34 Q30 30 42 36 M18 44 Q30 40 42 46 M18 54 Q30 50 42 56 M58 36 Q70 30 82 34 M58 46 Q70 40 82 44"/></g>
     <path d="M62 52 c-4 -4 1 -10 6 -5 c5 -5 10 1 6 5 l-6 6z" fill="${C.pink2}" stroke-width="1.4"/>
     <path d="M70 14 L70 34 L74 30 L78 34 L78 14" fill="${C.red}" stroke-width="1.6"/>`);

  /* ---------------- Cuisine salée ---------------- */
  add('tomate', 'Tomate', 'cuisine', ['tomate', 'sauce tomate', 'ratatouille', 'bruschetta', 'gaspacho'],
    `<circle cx="50" cy="56" r="34" fill="${C.red}"/>
     <path d="M30 44 Q40 52 50 48 Q60 52 70 44" fill="none" stroke-width="1.6" opacity=".5"/>
     <path d="M50 30 L38 22 L46 28 L34 30 L46 32 L42 40 L50 34 L58 40 L54 32 L66 30 L54 28 L62 22Z" fill="${C.green}" stroke-width="1.8"/>
     <path d="M50 26 Q50 18 54 14" stroke-width="3"/>
     ${sh(34, 56, 5, 10, 20)}`);

  add('avocat', 'Avocat', 'cuisine', ['avocat', 'guacamole', 'avocado', 'toast'],
    `<path d="M50 8 C36 8 32 26 26 40 C18 56 18 74 30 86 C40 96 60 96 70 86 C82 74 82 56 74 40 C68 26 64 8 50 8Z" fill="#4E7B3C"/>
     <path d="M50 14 C40 14 37 28 32 42 C25 56 25 72 34 82 C42 90 58 90 66 82 C75 72 75 56 68 42 C63 28 60 14 50 14Z" fill="#CFE39A" stroke="none"/>
     <path d="M50 20 C42 20 40 32 36 44 C30 56 30 70 38 78 C44 84 56 84 62 78 C70 70 70 56 64 44 C60 32 58 20 50 20Z" fill="#E6F1BC" stroke="none"/>
     <circle cx="50" cy="64" r="14" fill="#A0673E"/>${sh(45, 59, 4, 3, -30, .6)}`);

  add('carotte', 'Carotte', 'cuisine', ['carotte', 'carrot', 'carrot cake', 'legume', 'potage'],
    `<path d="M58 30 L52 10 M62 28 L66 6 M66 32 L84 16" stroke="${O}" stroke-width="6"/>
     <path d="M58 30 L52 10 M62 28 L66 6 M66 32 L84 16" stroke="${C.green}" stroke-width="3"/>
     <path d="M54 26 C62 22 74 32 72 40 L28 88 C24 92 18 88 20 84 L48 32 C50 28 52 27 54 26Z" fill="${C.orange}"/>
     <g stroke-width="1.6" opacity=".55"><path d="M46 44 L52 47 M38 58 L44 61 M32 70 L37 73 M56 40 L61 44"/></g>`);

  add('champignon', 'Champignon', 'cuisine', ['champignon', 'cepe', 'girolle', 'forestiere', 'risotto', 'mushroom'],
    `<path d="M38 52 L34 84 Q34 90 42 90 L58 90 Q66 90 66 84 L62 52Z" fill="#FBF3E4"/>
     <path d="M10 54 C10 28 30 12 50 12 C70 12 90 28 90 54 Q50 62 10 54Z" fill="#C98A5A"/>
     ${dots([[30, 34], [50, 24], [68, 36], [40, 44], [60, 48]], 3.4, '#F4DCC0')}
     ${sh(26, 40, 4, 8, 30, .4)}`);

  add('ail', 'Ail', 'cuisine', ['ail', 'echalote', 'oignon', 'garlic', 'aioli'],
    `<path d="M50 8 L50 22" stroke-width="3"/>
     <path d="M50 20 C40 30 18 40 18 62 C18 82 34 90 50 90 C66 90 82 82 82 62 C82 40 60 30 50 20Z" fill="#FBF6EE"/>
     <g stroke-width="1.6" opacity=".55" fill="none"><path d="M50 26 C40 44 38 70 44 88"/><path d="M50 26 C60 44 62 70 56 88"/><path d="M42 32 C28 50 28 72 34 86"/><path d="M58 32 C72 50 72 72 66 86"/></g>
     <path d="M40 90 L38 96 M50 90 L50 97 M60 90 L62 96" stroke-width="1.6"/>`);

  add('basilic', 'Basilic', 'cuisine', ['basilic', 'herbes', 'pesto', 'menthe', 'persil', 'coriandre', 'aromates'],
    `<path d="M50 94 L50 30" stroke-width="3"/>
     <path d="M50 34 C36 34 26 22 28 8 C42 10 50 20 50 34Z" fill="${C.green}"/>
     <path d="M50 34 C64 34 74 22 72 8 C58 10 50 20 50 34Z" fill="${C.green2}"/>
     <path d="M50 60 C34 62 18 52 16 38 C32 36 46 44 50 60Z" fill="${C.green2}"/>
     <path d="M50 60 C66 62 82 52 84 38 C68 36 54 44 50 60Z" fill="${C.green}"/>
     <g stroke-width="1.4" opacity=".55" fill="none"><path d="M50 34 L34 14 M50 34 L66 14 M50 60 L22 42 M50 60 L78 42"/></g>`);

  add('brocoli', 'Brocoli', 'cuisine', ['brocoli', 'legume', 'vert', 'chou', 'healthy'],
    `<path d="M42 56 L38 90 Q50 94 62 90 L58 56Z" fill="#B7D58E"/>
     <path d="M44 66 L36 60 M56 66 L64 60" stroke-width="3"/>
     ${[[34, 40, 14], [50, 30, 16], [66, 40, 14], [42, 54, 12], [58, 54, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.green2}"/>`).join('')}
     ${dots([[30, 36], [46, 26], [56, 30], [70, 38], [40, 50], [60, 52], [50, 42]], 2, '#5A8C4A')}`);

  add('fromage', 'Fromage', 'cuisine', ['fromage', 'gruyere', 'emmental', 'comte', 'gratin', 'raclette', 'fondue', 'quiche', 'cheese'],
    `<path d="M10 64 L82 30 L90 44 L90 74 L10 82Z" fill="${C.cheese}"/>
     <path d="M10 64 L82 30 L90 44 Z" fill="#FBE498"/>
     <path d="M10 64 L90 44" fill="none"/>
     ${[[30, 70, 5], [58, 64, 6], [78, 60, 3.5], [44, 76, 3], [74, 72, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#EDBC3E" stroke-width="1.6"/>`).join('')}
     <ellipse cx="60" cy="46" rx="5" ry="2.5" fill="#EDBC3E" stroke-width="1.6"/>`);

  add('camembert', 'Camembert', 'cuisine', ['camembert', 'normand', 'normandie', 'neufchatel', 'livarot', 'pont-l\'eveque', 'fromage'],
    `<ellipse cx="50" cy="66" rx="40" ry="16" fill="#E2B56E"/>
     <path d="M10 52 L10 66 Q50 92 90 66 L90 52Z" fill="#E2B56E"/>
     <ellipse cx="50" cy="52" rx="40" ry="16" fill="#F2D6A0"/>
     <path d="M50 52 L84 44 Q92 52 88 60 Q86 74 54 74Z" fill="#FFF7E8" stroke-width="1.8"/>
     <path d="M50 52 L50 74" stroke-width="1.8"/>
     <path d="M66 58 Q74 60 70 66 Q78 70 86 64" fill="#FFF0C8" stroke="none"/>
     <text x="34" y="56" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="11" fill="${O}" stroke="none" transform="rotate(-6 34 56)">Camembert</text>`);

  add('pates', 'Pâtes', 'cuisine', ['pates', 'spaghetti', 'carbonara', 'bolognaise', 'lasagne', 'pasta', 'tagliatelle', 'linguine'],
    `<path d="M12 50 Q14 84 50 86 Q86 84 88 50Z" fill="${C.blue}"/>
     <path d="M20 50 C20 30 40 22 50 26 C62 20 82 30 80 50Z" fill="#F7D98A"/>
     <g fill="none" stroke-width="1.8" stroke="#D9AE52"><path d="M26 46 Q36 30 48 40 Q58 30 70 44"/><path d="M30 50 Q42 38 52 48 Q62 40 74 50"/><path d="M36 38 Q46 28 58 34"/></g>
     <circle cx="42" cy="40" r="7" fill="${C.red2}"/><circle cx="60" cy="38" r="6" fill="${C.red2}"/>
     ${leaf(48, 30, -30, 12, 5)}
     <ellipse cx="50" cy="50" rx="38" ry="5" fill="none"/>
     ${sh(24, 64, 3, 7, -20, .5)}`);

  add('pizza', 'Part de pizza', 'cuisine', ['pizza', 'calzone', 'focaccia', 'tarte flambee'],
    `<path d="M14 26 Q50 10 86 26 L52 92Z" fill="${C.cheese}"/>
     <path d="M12 24 Q50 4 88 24 Q86 32 82 32 Q50 18 18 32 Q14 32 12 24Z" fill="${C.crust2}"/>
     ${[[40, 40], [62, 44], [50, 62], [36, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${C.red}" stroke-width="1.8"/>`).join('')}
     ${leaf(54, 52, -20, 10, 4)}${leaf(46, 32, 20, 10, 4)}
     <path d="M54 74 Q56 82 54 86" stroke-width="2" stroke="#EDBC3E"/>`);

  add('poisson', 'Poisson', 'cuisine', ['poisson', 'saumon', 'cabillaud', 'sole', 'bar', 'dorade', 'maquereau', 'fish', 'fecamp'],
    `<path d="M78 50 L94 34 L94 66Z" fill="${C.blue2}"/>
     <path d="M8 50 C20 28 48 22 64 32 C72 38 76 44 80 50 C76 56 72 62 64 68 C48 78 20 72 8 50Z" fill="${C.blue}"/>
     <path d="M44 28 Q52 18 62 30" fill="${C.blue2}"/>
     <path d="M30 34 Q36 50 30 66" fill="none" stroke-width="1.8"/>
     <g stroke-width="1.4" opacity=".5"><path d="M44 42 l4 4 l4 -4 M52 52 l4 4 l4 -4 M42 56 l4 4 l4 -4"/></g>
     <circle cx="20" cy="46" r="3.5" fill="${O}" stroke="none"/><circle cx="19" cy="45" r="1" fill="#fff" stroke="none"/>
     <path d="M12 56 Q16 58 18 56" stroke-width="1.6"/>`);

  add('homard', 'Homard bleu', 'cuisine', ['homard', 'langouste', 'crustace', 'bisque', 'fruits de mer', 'lobster'],
    `<g fill="${C.blue2}">
       <path d="M40 30 Q28 18 22 8 M60 30 Q72 18 78 8" fill="none" stroke-width="1.8"/>
       <path d="M36 44 Q22 40 20 28" fill="none" stroke-width="4"/><path d="M64 44 Q78 40 80 28" fill="none" stroke-width="4"/>
       <path d="M20 30 C8 26 8 10 18 8 C20 14 24 16 28 14 C30 22 26 30 20 30Z"/>
       <path d="M80 30 C92 26 92 10 82 8 C80 14 76 16 72 14 C70 22 74 30 80 30Z"/>
       <ellipse cx="50" cy="44" rx="14" ry="16"/>
       <path d="M38 56 L62 56 L60 64 L40 64Z"/><path d="M40 64 L60 64 L58 72 L42 72Z"/><path d="M42 72 L58 72 L56 80 L44 80Z"/>
       <path d="M44 80 L56 80 L66 94 L50 90 L34 94Z"/>
     </g>
     <g stroke-width="1.6"><path d="M38 52 L28 58 M38 58 L28 66 M62 52 L72 58 M62 58 L72 66"/></g>
     <circle cx="44" cy="36" r="2.6" fill="${O}" stroke="none"/><circle cx="56" cy="36" r="2.6" fill="${O}" stroke="none"/>
     <path d="M46 44 Q50 47 54 44" stroke-width="1.6" fill="none"/>
     <ellipse cx="40" cy="44" rx="3" ry="2" fill="${C.pink}" stroke="none" opacity=".8"/><ellipse cx="60" cy="44" rx="3" ry="2" fill="${C.pink}" stroke="none" opacity=".8"/>
     ${sh(44, 30, 3, 2, -20, .6)}`);

  add('crevette', 'Crevette', 'cuisine', ['crevette', 'gambas', 'scampi', 'langoustine', 'fruits de mer'],
    `<path d="M70 24 C50 10 20 22 18 46 C16 66 34 82 54 76 L58 66 C44 70 32 62 34 48 C36 36 52 30 64 38Z" fill="#F7A58A"/>
     <g stroke-width="1.6" opacity=".6"><path d="M44 18 L48 32 M30 26 L38 38 M20 42 L34 46 M22 60 L36 56 M36 72 L42 62"/></g>
     <path d="M54 76 L64 88 L58 78 L70 82 L58 66Z" fill="#F38B70"/>
     <circle cx="66" cy="28" r="2.4" fill="${O}" stroke="none"/>
     <path d="M70 24 Q86 14 94 18 M70 26 Q84 24 92 30" fill="none" stroke-width="1.6"/>`);

  add('coquille', 'Saint-Jacques', 'cuisine', ['saint-jacques', 'coquille', 'noix de saint-jacques', 'normandie', 'fruits de mer', 'huitre'],
    `<path d="M50 84 C30 84 10 66 10 46 C10 26 28 12 50 12 C72 12 90 26 90 46 C90 66 70 84 50 84Z" fill="#F7C6A9"/>
     <g fill="none" stroke-width="1.8">${[-36, -24, -12, 0, 12, 24, 36].map((a) => `<path d="M50 82 L${50 + 40 * Math.sin(a * Math.PI / 180)} ${50 - 40 * Math.cos(a * Math.PI / 180)}"/>`).join('')}</g>
     <path d="M36 82 L32 94 L68 94 L64 82Z" fill="#EFA88A"/>
     ${sh(32, 32, 4, 9, -30, .5)}`);

  add('poulet', 'Poulet rôti', 'cuisine', ['poulet', 'volaille', 'dinde', 'chicken', 'roti', 'pilon'],
    `<path d="M64 36 L84 16" stroke-width="10" stroke="${O}"/><path d="M64 36 L84 16" stroke-width="6" stroke="#FFF8EE"/>
     <circle cx="86" cy="12" r="6" fill="#FFF8EE"/><circle cx="90" cy="18" r="6" fill="#FFF8EE"/>
     <path d="M66 34 C80 50 70 84 40 88 C18 90 6 70 16 50 C24 34 50 20 66 34Z" fill="#D98E48"/>
     <path d="M24 56 Q34 44 48 42" fill="none" stroke-width="1.6" opacity=".5"/>
     ${sh(30, 62, 5, 9, 30, .35)}`);

  add('soupe', 'Soupe', 'cuisine', ['soupe', 'potage', 'veloute', 'bouillon', 'ramen', 'pho', 'bisque'],
    `${steam(50, 34)}
     <path d="M10 46 Q12 84 50 86 Q88 84 90 46Z" fill="${C.sage}"/>
     <ellipse cx="50" cy="46" rx="40" ry="9" fill="${C.orange}"/>
     <ellipse cx="50" cy="45" rx="30" ry="5" fill="#F8C37A" stroke="none"/>
     ${leaf(44, 44, -10, 8, 3)}${leaf(56, 46, 170, 8, 3)}
     <path d="M66 42 L92 20" stroke-width="5"/><path d="M66 42 L92 20" stroke-width="2.4" stroke="${C.wood}"/>
     ${sh(22, 62, 3, 8, -20, .5)}`);

  add('salade', 'Salade', 'cuisine', ['salade', 'healthy', 'bowl', 'cesar', 'crudites', 'poke'],
    `<path d="M24 34 C18 22 30 14 36 22 C38 12 52 10 54 20 C62 10 76 16 72 28 C82 26 86 38 78 44 L20 44 C12 42 14 32 24 34Z" fill="${C.green}"/>
     <circle cx="34" cy="38" r="7" fill="${C.red}"/><circle cx="62" cy="36" r="6" fill="${C.red}"/>
     <path d="M44 30 l10 2 l-4 8z" fill="${C.yellow}" stroke-width="1.6"/>
     <path d="M10 44 Q12 84 50 86 Q88 84 90 44Z" fill="#FFFFFF"/>
     <path d="M16 54 Q50 62 84 54" fill="none" stroke="${C.blue2}" stroke-width="2.4"/>
     ${dots([[30, 68], [50, 74], [70, 68]], 2.4, C.blue)}`);

  add('burger', 'Burger', 'cuisine', ['burger', 'hamburger', 'sandwich', 'street food'],
    `<path d="M16 44 C16 22 34 14 50 14 C66 14 84 22 84 44Z" fill="#E7A858"/>
     ${dots([[34, 26], [46, 22], [58, 26], [68, 32], [40, 34]], 1.4, '#FFF2D6')}
     <path d="M12 46 Q20 54 28 46 Q36 54 44 46 Q52 54 60 46 Q68 54 76 46 Q84 54 88 46 L88 48 L12 48Z" fill="${C.green}" stroke-width="1.8"/>
     <rect x="14" y="48" width="72" height="8" rx="3" fill="${C.cheese}"/>
     <path d="M30 56 L34 62 L38 56" fill="${C.cheese}" stroke-width="1.6"/>
     <rect x="12" y="56" width="76" height="12" rx="6" fill="#8A5236"/>
     <path d="M16 70 L84 70 Q84 86 50 86 Q16 86 16 70Z" fill="#E7A858"/>`);

  add('sushi', 'Sushi', 'cuisine', ['sushi', 'maki', 'japonais', 'riz', 'california'],
    `${[[32, 54], [68, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 12}" rx="17" ry="8" fill="#3E4B42"/>
       <path d="M${x - 17} ${y} L${x - 17} ${y + 12} M${x + 17} ${y} L${x + 17} ${y + 12}" />
       <rect x="${x - 17}" y="${y}" width="34" height="12" fill="#3E4B42" stroke="none"/>
       <ellipse cx="${x}" cy="${y}" rx="17" ry="8" fill="#3E4B42"/>
       <ellipse cx="${x}" cy="${y}" rx="13.5" ry="6" fill="#FFFDF8" stroke-width="1.4"/>
       <ellipse cx="${x}" cy="${y}" rx="5.5" ry="3" fill="${x < 50 ? '#F49B7A' : '#9CCB6A'}" stroke-width="1.4"/>`).join('')}
     <path d="M24 24 L80 34 M26 18 L82 28" stroke-width="3"/><path d="M24 24 L80 34 M26 18 L82 28" stroke-width="1.4" stroke="${C.wood}"/>`);

  add('pomme-de-terre', 'Pomme de terre', 'cuisine', ['pomme de terre', 'patate', 'frites', 'puree', 'gratin', 'tartiflette', 'raclette'],
    `<path d="M20 48 C18 30 36 20 52 22 C72 24 86 36 84 54 C82 72 66 82 48 80 C30 78 22 66 20 48Z" fill="#DDB27C"/>
     ${dots([[36, 40], [60, 34], [68, 58], [44, 66], [54, 50]], 1.8, '#B78852')}
     ${sh(34, 34, 6, 3, -25, .5)}`);

  add('oignon', 'Oignon', 'cuisine', ['oignon', 'echalote', 'soupe a l\'oignon', 'onion'],
    `<path d="M50 24 Q48 12 52 6 M50 24 Q56 14 60 12" stroke-width="2.4" fill="none"/>
     <path d="M50 22 C40 32 16 40 18 62 C20 82 36 90 50 90 C64 90 80 82 82 62 C84 40 60 32 50 22Z" fill="#E4A3C0"/>
     <g fill="none" stroke-width="1.6" opacity=".55"><path d="M50 28 C38 46 36 72 46 88"/><path d="M50 28 C62 46 64 72 54 88"/></g>
     ${sh(32, 58, 4, 10, 15, .5)}`);

  /* ---------------- Boissons ---------------- */
  add('cafe', 'Tasse de café', 'boissons', ['cafe', 'the', 'chocolat chaud', 'latte', 'cappuccino', 'tiramisu', 'cafe gourmand'],
    `${steam(42, 30)}
     <path d="M72 50 Q90 50 88 62 Q86 74 70 72" fill="none" stroke-width="6" stroke="${O}"/>
     <path d="M72 50 Q90 50 88 62 Q86 74 70 72" fill="none" stroke-width="2.6" stroke="${C.pink}"/>
     <ellipse cx="44" cy="88" rx="38" ry="7" fill="#fff"/>
     <path d="M14 40 L74 40 L70 76 Q68 88 56 88 L32 88 Q20 88 18 76Z" fill="${C.pink}"/>
     <ellipse cx="44" cy="40" rx="30" ry="6" fill="#B07E5A"/>
     <path d="M38 40 c-3 -3 0 -6 3 -3 c3 -3 6 0 3 3 l-3 2.5z" fill="#F5E6D3" stroke="none"/>
     ${sh(24, 58, 3, 9, 0, .55)}`);

  add('cocktail', 'Cocktail', 'boissons', ['cocktail', 'mojito', 'spritz', 'boisson', 'limonade', 'smoothie', 'apero', 'sangria'],
    `<path d="M66 20 L56 52" stroke-width="3"/><path d="M66 20 L72 8" stroke-width="3" stroke="${C.red}"/>
     <path d="M22 26 L78 26 L66 82 Q64 90 56 90 L44 90 Q36 90 34 82Z" fill="#F7F4F1"/>
     <path d="M25 40 L75 40 L66 82 Q64 88 56 88 L44 88 Q36 88 34 82Z" fill="${C.peach}" stroke="none"/>
     <path d="M24 32 L76 32" stroke-width="1.4" opacity=".4"/>
     <path d="M22 26 L78 26 L66 82 Q64 90 56 90 L44 90 Q36 90 34 82Z" fill="none"/>
     <rect x="38" y="50" width="12" height="12" rx="2" fill="#fff" opacity=".7" stroke-width="1.4"/><rect x="52" y="60" width="10" height="10" rx="2" fill="#fff" opacity=".7" stroke-width="1.4"/>
     <circle cx="26" cy="26" r="13" fill="${C.lemon}"/><circle cx="26" cy="26" r="9" fill="#FFF6C8" stroke-width="1.4"/>
     <path d="M26 17 L26 35 M17 26 L35 26 M20 20 L32 32 M32 20 L20 32" stroke-width="1" stroke="#F0D45A"/>
     ${leaf(64, 22, -40, 14, 5)}`);

  add('vin', 'Verre de vin', 'boissons', ['vin', 'bourguignon', 'sauce au vin', 'accord', 'rouge', 'blanc', 'champagne'],
    `<path d="M30 14 L70 14 Q74 40 62 52 Q56 58 52 58 L52 82 L66 86 Q68 90 64 90 L36 90 Q32 90 34 86 L48 82 L48 58 Q44 58 38 52 Q26 40 30 14Z" fill="#F7F4F1"/>
     <path d="M30.5 30 L69.5 30 Q70 44 62 52 Q56 57 50 57 Q44 57 38 52 Q30 44 30.5 30Z" fill="#B5466A" stroke="none"/>
     <path d="M30 14 L70 14 Q74 40 62 52 Q56 58 52 58 L52 82 L66 86 Q68 90 64 90 L36 90 Q32 90 34 86 L48 82 L48 58 Q44 58 38 52 Q26 40 30 14Z" fill="none"/>
     ${sh(38, 26, 2.5, 8, 0, .8)}`);

  add('cidre', 'Cidre', 'boissons', ['cidre', 'calvados', 'pommeau', 'normandie', 'poire', 'cider'],
    `<rect x="40" y="6" width="20" height="10" rx="3" fill="${C.red}"/>
     <path d="M42 16 L58 16 L58 30 Q74 38 74 54 L74 86 Q74 94 66 94 L34 94 Q26 94 26 86 L26 54 Q26 38 42 30Z" fill="#C9D77A"/>
     ${label(30, 54, 40, 26, '', 0, '#FFF8EA')}
     <text x="50" y="66" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="13" fill="${O}" stroke="none">Cidre</text>
     <path d="M46 72 c-1 -4 8 -4 7 0 c0 3 -3 4 -3.5 4 c-0.5 0 -3.5 -1 -3.5 -4z" fill="${C.red}" stroke-width="1.2"/>
     ${sh(32, 46, 2.5, 8, 0, .6)}`);

  add('the', 'Théière', 'boissons', ['the', 'infusion', 'tea', 'tisane', 'gouter'],
    `<path d="M76 52 Q92 44 94 32" fill="none" stroke-width="6" stroke="${O}"/><path d="M76 52 Q92 44 94 32" fill="none" stroke-width="2.6" stroke="${C.mint}"/>
     <path d="M22 48 Q6 48 8 62 Q10 72 24 70" fill="none" stroke-width="6" stroke="${O}"/><path d="M22 48 Q6 48 8 62 Q10 72 24 70" fill="none" stroke-width="2.6" stroke="${C.mint}"/>
     <path d="M20 50 C18 32 34 26 50 26 C66 26 82 32 80 50 C82 76 68 88 50 88 C32 88 18 76 20 50Z" fill="${C.mint}"/>
     <path d="M30 30 Q50 20 70 30 Q50 34 30 30Z" fill="#9CCDB5"/>
     <circle cx="50" cy="20" r="5" fill="#9CCDB5"/>
     <path d="M22 56 Q50 64 78 56" fill="none" stroke-width="1.6"/>
     ${dots([[34, 68], [50, 72], [66, 68]], 2.6, '#fff')}
     ${sh(28, 44, 3, 6, 20, .6)}`);

  /* ---------------- Déco ---------------- */
  add('coeur', 'Cœur', 'deco', ['coeur', 'amour', 'saint-valentin', 'love', 'prefere'],
    `<path d="M50 86 C30 72 10 58 10 36 C10 22 20 14 32 14 C40 14 46 18 50 26 C54 18 60 14 68 14 C80 14 90 22 90 36 C90 58 70 72 50 86Z" fill="${C.pink2}"/>
     ${sh(28, 32, 6, 9, 30, .6)}`);

  add('etoile', 'Étoile', 'deco', ['etoile', 'star', 'top', 'noel'],
    `<path d="M50 8 L61 34 L89 36 L67 54 L74 82 L50 66 L26 82 L33 54 L11 36 L39 34Z" fill="${C.yellow}" stroke-width="2.6"/>
     ${sh(40, 40, 4, 7, 30, .6)}`);

  add('etincelles', 'Étincelles', 'deco', ['etincelle', 'magie', 'brillant', 'nouveau'],
    `<path d="M40 14 Q44 40 66 44 Q44 48 40 76 Q36 48 14 44 Q36 40 40 14Z" fill="${C.lilac}"/>
     <path d="M74 52 Q76 64 88 66 Q76 68 74 82 Q72 68 60 66 Q72 64 74 52Z" fill="${C.pink}"/>
     <path d="M76 12 Q77 20 86 22 Q77 24 76 32 Q75 24 66 22 Q75 20 76 12Z" fill="${C.yellow}"/>`);

  add('fleur', 'Fleur', 'deco', ['fleur', 'printemps', 'flower', 'fleur d\'oranger', 'rose'],
    `${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="28" rx="14" ry="20" fill="${C.pink}" transform="rotate(${a} 50 50)"/>`).join('')}
     <circle cx="50" cy="50" r="12" fill="${C.yellow}"/>
     ${dots([[46, 46], [54, 48], [48, 54]], 1.6, '#E0A93A')}`);

  add('noeud', 'Nœud', 'deco', ['noeud', 'ruban', 'cadeau', 'bow', 'joli'],
    `<path d="M50 50 L36 86 L44 82 L48 92 L52 56Z" fill="${C.pink2}"/>
     <path d="M50 50 L64 86 L56 82 L52 92 L48 56Z" fill="${C.pink2}"/>
     <path d="M50 50 C36 30 10 24 12 44 C14 64 38 58 50 50Z" fill="${C.pink}"/>
     <path d="M50 50 C64 30 90 24 88 44 C86 64 62 58 50 50Z" fill="${C.pink}"/>
     <rect x="42" y="42" width="16" height="16" rx="5" fill="${C.pink2}"/>
     ${sh(24, 40, 4, 6, 30, .6)}`);

  add('arc-en-ciel', 'Arc-en-ciel', 'deco', ['arc-en-ciel', 'rainbow', 'couleurs', 'licorne'],
    `${[[C.pink2, 40], [C.yellow, 32], [C.mint, 24], [C.blue, 16]].map(([c, r]) => `<path d="M${50 - r} 70 A${r} ${r} 0 0 1 ${50 + r} 70 L${50 + r - 8} 70 A${r - 8} ${r - 8} 0 0 0 ${50 - r + 8} 70Z" fill="${c}"/>`).join('')}
     <path d="M4 72 C2 62 14 58 18 64 C22 56 34 60 32 70 C36 74 32 80 26 80 L10 80 C4 80 2 76 4 72Z" fill="#fff"/>
     <path d="M68 72 C66 62 78 58 82 64 C86 56 98 60 96 70 C100 74 96 80 90 80 L74 80 C68 80 66 76 68 72Z" fill="#fff"/>`);

  add('soleil', 'Soleil', 'deco', ['soleil', 'ete', 'summer', 'plancha', 'barbecue'],
    `${Array.from({ length: 10 }, (_, i) => `<path d="M50 6 L56 20 L44 20Z" fill="${C.orange}" stroke-width="1.8" transform="rotate(${i * 36} 50 50)"/>`).join('')}
     <circle cx="50" cy="50" r="26" fill="${C.yellow}"/>
     <circle cx="42" cy="48" r="2.6" fill="${O}" stroke="none"/><circle cx="58" cy="48" r="2.6" fill="${O}" stroke="none"/>
     <path d="M43 57 Q50 63 57 57" fill="none" stroke-width="2"/>
     <ellipse cx="37" cy="56" rx="3.5" ry="2" fill="${C.pink2}" stroke="none" opacity=".8"/><ellipse cx="63" cy="56" rx="3.5" ry="2" fill="${C.pink2}" stroke="none" opacity=".8"/>`);

  add('flocon', 'Flocon', 'deco', ['hiver', 'noel', 'neige', 'flocon', 'buche'],
    `<g stroke-width="5.5">${[0, 60, 120].map((a) => `<path d="M50 10 L50 90" transform="rotate(${a} 50 50)"/>`).join('')}</g>
     <g stroke-width="2.6" stroke="${C.blue}">${[0, 60, 120].map((a) => `<path d="M50 10 L50 90" transform="rotate(${a} 50 50)"/>`).join('')}</g>
     <g fill="none" stroke-width="3">${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M42 22 L50 30 L58 22" transform="rotate(${a} 50 50)"/>`).join('')}</g>
     <circle cx="50" cy="50" r="7" fill="#fff"/>`);

  add('citrouille', 'Citrouille', 'deco', ['citrouille', 'potiron', 'courge', 'butternut', 'halloween', 'automne', 'potimarron'],
    `<path d="M50 24 Q50 12 58 8" stroke-width="4"/>
     ${leaf(52, 18, -10, 18, 7)}
     <ellipse cx="32" cy="58" rx="20" ry="28" fill="${C.orange}"/>
     <ellipse cx="68" cy="58" rx="20" ry="28" fill="${C.orange}"/>
     <ellipse cx="50" cy="58" rx="16" ry="30" fill="#F7BC72"/>
     ${sh(26, 50, 3, 9, 10, .45)}`);

  add('feuille-automne', "Feuille d'automne", 'deco', ['automne', 'feuille', 'erable', 'saison'],
    `<path d="M50 92 L50 60" stroke-width="3"/>
     <path d="M50 62 L36 70 L38 60 L18 62 L26 52 L12 40 L28 38 L22 22 L38 30 L42 14 L50 26 L58 14 L62 30 L78 22 L72 38 L88 40 L74 52 L82 62 L62 60 L64 70Z" fill="#EE9A57"/>
     <g fill="none" stroke-width="1.4" opacity=".6"><path d="M50 62 L50 26 M50 50 L30 36 M50 50 L70 36 M50 58 L28 54 M50 58 L72 54"/></g>`);

  add('scotch-rose', 'Masking tape rose', 'deco', ['tape', 'scotch', 'washi'],
    `<g transform="rotate(-8 50 50)">
       <path d="M6 38 L10 40 L6 44 L10 48 L6 52 L10 56 L6 62 L94 62 L90 58 L94 54 L90 50 L94 46 L90 42 L94 38Z" fill="${C.pink}" opacity=".85" stroke="none"/>
       ${Array.from({ length: 8 }, (_, i) => `<circle cx="${16 + i * 11}" cy="${44 + (i % 2) * 12}" r="2.4" fill="#fff" opacity=".8" stroke="none"/>`).join('')}
     </g>`, { noCut: true });

  add('scotch-sauge', 'Masking tape sauge', 'deco', ['tape', 'scotch', 'washi'],
    `<g transform="rotate(10 50 50)">
       <path d="M6 38 L10 40 L6 44 L10 48 L6 52 L10 56 L6 62 L94 62 L90 58 L94 54 L90 50 L94 46 L90 42 L94 38Z" fill="${C.sage}" opacity=".85" stroke="none"/>
       ${Array.from({ length: 9 }, (_, i) => `<path d="M${12 + i * 10} 38 L${20 + i * 10} 62" stroke="#fff" stroke-width="2.6" opacity=".55"/>`).join('')}
     </g>`, { noCut: true });

  add('scotch-bleu', 'Masking tape vichy', 'deco', ['tape', 'scotch', 'washi', 'vichy'],
    `<g transform="rotate(-4 50 50)">
       <path d="M6 38 L10 40 L6 44 L10 48 L6 52 L10 56 L6 62 L94 62 L90 58 L94 54 L90 50 L94 46 L90 42 L94 38Z" fill="${C.blue}" opacity=".85" stroke="none"/>
       ${Array.from({ length: 8 }, (_, i) => `<rect x="${10 + i * 11}" y="38" width="5.5" height="24" fill="#fff" opacity=".35" stroke="none"/>`).join('')}
       <rect x="6" y="46" width="88" height="7" fill="#fff" opacity=".35" stroke="none"/>
     </g>`, { noCut: true });

  /* ---------------- Étiquettes ---------------- */
  const heartIcon = (x, y, c = C.pink2) => `<path d="M${x} ${y + 5} c-6 -4.5 -7 -7 -7 -9 a3.5 3.5 0 0 1 7 -1.2 a3.5 3.5 0 0 1 7 1.2 c0 2 -1 4.5 -7 9z" fill="${c}" stroke-width="1.4"/>`;
  const tag = (id, txt, bg, kw, fs = 17, w = 84, heart = null) =>
    add(id, txt, 'etiquettes', kw,
      `<rect x="${50 - w / 2}" y="34" width="${w}" height="32" rx="16" fill="${bg}"/>
       <text x="${50 + (heart ? 6 : 0)}" y="${50 + fs * 0.35}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="${fs}" fill="${O}" stroke="none">${txt}</text>${heart ? heartIcon(50 - w / 2 + 13, 49, heart) : ''}`);
  tag('tag-miam', 'Miam !', C.pink, ['miam', 'gourmand'], 17, 80, C.pink2);
  tag('tag-maison', 'Fait maison', C.butter, ['fait maison', 'maison'], 13.5, 90);
  tag('tag-top', 'Top !', C.mint, ['top', 'reussi'], 18, 64);
  tag('tag-facile', 'Facile', C.sage, ['facile', 'rapide', 'simple'], 17, 72);
  tag('tag-gourmand', 'Gourmand', '#F6C7A5', ['gourmand'], 14.5, 86);
  tag('tag-healthy', 'Healthy', C.mint, ['healthy', 'leger', 'sain'], 16, 76);
  tag('tag-famille', 'Recette de famille', C.rose, ['famille', 'grand-mere', 'mamie'], 9.5, 94);
  tag('tag-prefere', 'Ma préférée', C.lilac, ['prefere', 'favori'], 11, 94, '#fff');
  tag('tag-rapide', 'Express', C.blue, ['express', 'rapide', 'minute'], 16, 76);
  tag('tag-vege', 'Végé', C.green, ['vegetarien', 'vege', 'vegan', 'legumes'], 17, 64);

  add('bulle-miam', 'Bulle « Yummy »', 'etiquettes', ['yummy', 'miam'],
    `<path d="M14 40 C14 24 30 16 50 16 C70 16 86 24 86 40 C86 56 70 64 50 64 L40 64 L28 80 L30 62 C20 58 14 50 14 40Z" fill="#fff"/>
     <text x="50" y="47" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="22" fill="${C.pink2}" stroke="none">Yummy!</text>`);

  const byId = Object.fromEntries(L.map((s) => [s.id, s]));

  const CATS = [
    ['fruits', 'Fruits'], ['patisserie', 'Pâtisserie'], ['ingredients', 'Ingrédients'], ['ustensiles', 'Ustensiles'],
    ['cuisine', 'Cuisine'], ['boissons', 'Boissons'], ['deco', 'Déco'], ['etiquettes', 'Étiquettes'],
  ];

  let uid = 0;
  /* SVG complet d'un autocollant. opts.size : taille en px (pour l'export), opts.fonts : CSS @font-face à intégrer. */
  function svg(id, opts = {}) {
    const s = byId[id];
    if (!s) return '';
    const f = 'die' + (++uid);
    const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
    const style = opts.fonts && s.art.includes('<text') ? `<style>${opts.fonts}</style>` : '';
    const filter = s.noCut
      ? `<filter id="${f}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="#6E5446" flood-opacity=".18"/></filter>`
      : `<filter id="${f}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
           <feMorphology in="SourceAlpha" operator="dilate" radius="3.6" result="d"/>
           <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="w"/>
           <feGaussianBlur in="d" stdDeviation="1.6" result="b"/><feOffset in="b" dy="1.8" result="o"/>
           <feFlood flood-color="#6E5446" flood-opacity=".22"/><feComposite in2="o" operator="in" result="s"/>
           <feMerge><feMergeNode in="s"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge>
         </filter>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${size}>${style}<defs>${filter}</defs>` +
      `<g filter="url(#${f})"><g stroke="${O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" fill="none">${s.art}</g></g></svg>`;
  }

  const norm = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe');

  /* Autocollants suggérés à partir d'un texte (titre de la recette, ingrédients). */
  function suggest(title, extra = '') {
    const t = ' ' + norm(title) + ' ';
    const e = ' ' + norm(extra) + ' ';
    const score = new Map();
    L.forEach((s) => {
      s.kw.forEach((k) => {
        const kk = norm(k);
        if (t.includes(kk)) score.set(s.id, Math.max(score.get(s.id) || 0, 10 + kk.length));
        else if (e.includes(kk)) score.set(s.id, Math.max(score.get(s.id) || 0, 1 + kk.length / 10));
      });
    });
    return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id).filter((id) => byId[id].cat !== 'etiquettes' || score.get(id) >= 10);
  }

  return { list: L, byId, CATS, svg, suggest, norm, C };
})();
