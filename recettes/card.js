'use strict';
/* =========================================================
   Mon carnet de recettes : dessin de la fiche recette (canvas)
   La même image sert à l'affichage et à l'export PNG.
   Largeur fixe 1080 px ; la hauteur dépend du contenu.
   ========================================================= */

const CARD = (() => {
  const W = 1080;
  const THEMES = {
    creme:  { name: 'Crème',  bg: '#F6EADB', dot: '#EBD9C3', paper: '#FFFCF6', accent: '#E58C9A', soft: '#FBE3E6', ink: '#5B4438', muted: '#9A8172', note: '#FCEFC0' },
    rose:   { name: 'Rose',   bg: '#F8DDE2', dot: '#F1C9D0', paper: '#FFFAFB', accent: '#E07A8E', soft: '#FCE6EA', ink: '#5B4040', muted: '#A07E84', note: '#FFF0C4' },
    sauge:  { name: 'Sauge',  bg: '#DFE8D5', dot: '#CEDCC2', paper: '#FCFDF8', accent: '#7FA36B', soft: '#E8F0DF', ink: '#46503C', muted: '#879178', note: '#FBEFC4' },
    ciel:   { name: 'Ciel',   bg: '#DCE7F2', dot: '#C9D9EA', paper: '#FBFDFF', accent: '#6F9BC8', soft: '#E3EDF7', ink: '#3F4B5B', muted: '#7F8D9E', note: '#FDF0C8' },
    beurre: { name: 'Beurre', bg: '#F8EDC6', dot: '#EFE0AB', paper: '#FFFDF4', accent: '#E0A43E', soft: '#FBF0CC', ink: '#5A4A33', muted: '#9C8A69', note: '#FBDDE2' },
    lilas:  { name: 'Lilas',  bg: '#E8E0F3', dot: '#DACEEC', paper: '#FDFBFF', accent: '#9C82C9', soft: '#EEE7F8', ink: '#4D4360', muted: '#8C80A0', note: '#FCEFC0' },
  };

  const FONT_T = 'Fredoka, "Nunito", system-ui, sans-serif';
  const FONT_B = 'Nunito, system-ui, sans-serif';
  const FONT_H = 'Caveat, "Fredoka", cursive';

  /* ---------- polices ---------- */
  let fontsReady = null;
  function loadFonts() {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load('600 40px Fredoka'), document.fonts.load('700 40px Caveat'),
        document.fonts.load('600 30px Nunito'), document.fonts.load('800 30px Nunito'),
      ]).catch(() => {});
    }
    return fontsReady;
  }

  // police intégrée (base64) pour les autocollants qui contiennent du texte, à l'export
  let fontCss = null;
  async function embeddedFonts() {
    if (fontCss !== null) return fontCss;
    const toData = (url) => fetch(url).then((r) => r.blob()).then((b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }));
    try {
      const [fr, cv] = await Promise.all([toData('fonts/fredoka.woff2'), toData('fonts/caveat.woff2')]);
      fontCss = `@font-face{font-family:Fredoka;src:url(${fr}) format("woff2");font-weight:300 700}@font-face{font-family:Caveat;src:url(${cv}) format("woff2");font-weight:400 700}`;
    } catch (e) { fontCss = ''; }
    return fontCss;
  }

  /* ---------- images ---------- */
  const imgCache = new Map();
  function loadImg(src) {
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    if (imgCache.size > 60) imgCache.clear();
    imgCache.set(src, p);
    return p;
  }
  const stickerImg = (id, px, fonts = '') => loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(STICKERS.svg(id, { size: Math.round(px), fonts })));

  /* ---------- texte ---------- */
  function wrap(ctx, text, maxW) {
    const out = [];
    String(text || '').split('\n').forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW || !line) {
          // mot plus long que la ligne : on le coupe
          if (!line && ctx.measureText(w).width > maxW) {
            let part = '';
            for (const ch of w) { if (ctx.measureText(part + ch).width > maxW) { out.push(part); part = ch; } else part += ch; }
            line = part;
          } else line = test;
        } else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function squiggle(ctx, cx, y, w, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
    const x0 = cx - w / 2; const n = Math.max(3, Math.round(w / 26));
    ctx.moveTo(x0, y);
    for (let i = 0; i < n; i++) { const a = x0 + (w / n) * i; ctx.quadraticCurveTo(a + w / n / 4, y - 7, a + w / n / 2, y); ctx.quadraticCurveTo(a + (3 * w) / n / 4, y + 7, a + w / n, y); }
    ctx.stroke(); ctx.restore();
  }

  /* ---------- format ---------- */
  const fmtMin = (m) => {
    m = Math.round(+m || 0); if (!m) return '';
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60); const r = m % 60;
    return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
  };
  const fmtQty = (q) => {
    if (q === '' || q === null || q === undefined) return '';
    const n = typeof q === 'number' ? q : parseFloat(String(q).replace(',', '.'));
    if (!isFinite(n)) return String(q);
    const fr = { 0.25: '¼', 0.5: '½', 0.75: '¾', 0.33: '⅓', 0.67: '⅔' };
    const whole = Math.floor(n); const dec = Math.round((n - whole) * 100) / 100;
    if (fr[dec] && n < 10) return (whole ? whole : '') + fr[dec];
    return (Math.round(n * 100) / 100).toString().replace('.', ',');
  };
  const ingText = (it, mult = 1) => {
    const n = parseFloat(String(it.q ?? '').replace(',', '.'));
    const q = isFinite(n) ? fmtQty(mult === 1 ? n : niceRound(n * mult, it.u || '')) : (it.q || '');
    const u = it.u || '';
    let qty = [q, u].filter(Boolean).join(u && /^[a-zA-Z]{1,2}$/.test(u) ? ' ' : ' ');
    return { qty, name: it.n || '' };
  };
  // arrondi agréable quand on change le nombre de parts
  const niceRound = (v, u) => {
    if (['g', 'ml', 'mg'].includes(u)) return v >= 100 ? Math.round(v / 5) * 5 : v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    if (['kg', 'L', 'cl', 'dl'].includes(u)) return v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    if (['c. à s.', 'c. à c.', 'pincée', 'tasse', 'verre'].includes(u)) return Math.max(0.25, Math.round(v * 4) / 4);
    return Math.max(0.5, Math.round(v * 2) / 2);
  };
  const DIFF = ['', 'Facile', 'Moyen', 'Difficile'];

  /* ---------- mise en page ---------- */
  async function render(recipe, opts = {}) {
    await loadFonts();
    const scale = opts.scale || 1;
    const T = THEMES[recipe.theme] || THEMES.creme;
    const photo = recipe.photo ? await loadImg(recipe.photo) : null;
    const chipIcons = {};
    await Promise.all(['fouet', 'minuteur', 'gant', 'the', 'coeur', 'toque'].map(async (id) => { chipIcons[id] = await stickerImg(id, 64 * scale); }));

    const measure = document.createElement('canvas').getContext('2d');
    const anchors = {};
    const H = Math.ceil(layout(measure, recipe, T, photo, chipIcons, anchors, false));
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale);
    ctx.imageSmoothingQuality = 'high';
    layout(ctx, recipe, T, photo, chipIcons, anchors, true, H);

    if (opts.withStickers && recipe.stickers && recipe.stickers.length) {
      const fonts = await embeddedFonts();
      for (const st of recipe.stickers) {
        const px = st.s * W;
        const img = await stickerImg(st.id, px * scale, fonts);
        if (!img) continue;
        ctx.save();
        ctx.translate(st.x * W, st.y * W);
        ctx.rotate((st.r || 0) * Math.PI / 180);
        if (st.f) ctx.scale(-1, 1);
        ctx.drawImage(img, -px / 2, -px / 2, px, px);
        ctx.restore();
      }
    }
    return { canvas: cv, width: W, height: H, anchors };
  }

  function layout(ctx, r, T, photo, chipIcons, A, draw, totalH) {
    const M = 34;             // marge extérieure
    const P = 74;             // marge intérieure
    const X = M + P;          // début du contenu
    const CW = W - 2 * X;     // largeur du contenu
    const CX = W / 2;
    let y = M + 76;

    if (draw) {
      // fond à pois
      ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, totalH);
      ctx.fillStyle = T.dot;
      for (let yy = 18; yy < totalH; yy += 36) for (let xx = (yy / 36) % 2 ? 18 : 36; xx < W; xx += 36) { ctx.beginPath(); ctx.arc(xx, yy, 3.2, 0, 7); ctx.fill(); }
      // feuille
      ctx.save(); ctx.shadowColor = 'rgba(110,84,70,.16)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
      rr(ctx, M, M, W - 2 * M, totalH - 2 * M, 46); ctx.fillStyle = T.paper; ctx.fill(); ctx.restore();
      // petite couture pointillée
      ctx.save(); ctx.setLineDash([2, 14]); ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = T.dot;
      rr(ctx, M + 18, M + 18, W - 2 * M - 36, totalH - 2 * M - 36, 32); ctx.stroke(); ctx.restore();
    }

    // catégorie
    if (r.category) {
      ctx.font = `600 25px ${FONT_T}`;
      const txt = r.category.toUpperCase();
      const tw = ctx.measureText(txt).width + txt.length * 2.5 + 48;
      if (draw) {
        rr(ctx, CX - tw / 2, y - 6, tw, 46, 23); ctx.fillStyle = T.soft; ctx.fill();
        ctx.fillStyle = T.accent; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '2.5px';
        ctx.fillText(txt, CX, y + 18);
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      }
      y += 70;
    }

    // titre
    A.titleTop = y;
    const title = r.title || 'Ma recette';
    let fs = 78;
    ctx.font = `600 ${fs}px ${FONT_T}`;
    let lines = wrap(ctx, title, CW - 40);
    if (lines.length > 2) { fs = 64; ctx.font = `600 ${fs}px ${FONT_T}`; lines = wrap(ctx, title, CW - 20); }
    // lignes équilibrées (évite un mot tout seul sur la dernière ligne)
    if (lines.length > 1) {
      let w = CW - 40; const n = lines.length;
      while (w > 200) { const t = wrap(ctx, title, w - 20); if (t.length > n) break; lines = t; w -= 20; }
    }
    lines.forEach((l) => {
      if (draw) { ctx.fillStyle = T.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(l, CX, y + fs * 0.82); }
      y += fs * 1.08;
    });
    A.titleBottom = y;

    if (r.subtitle) {
      ctx.font = `700 44px ${FONT_H}`;
      wrap(ctx, r.subtitle, CW - 60).forEach((l) => {
        if (draw) { ctx.fillStyle = T.accent; ctx.textAlign = 'center'; ctx.fillText(l, CX, y + 38); }
        y += 48;
      });
    }
    y += 10;
    if (draw) squiggle(ctx, CX, y + 8, 150, T.accent);
    y += 46;

    // photo façon polaroid
    if (photo) {
      const pw = 800; const ph = Math.round(pw * 0.75);
      const fw = pw + 44; const fh = ph + 44 + 54;
      const fx = CX - fw / 2;
      A.photoTop = y; A.photoBottom = y + fh; A.photoLeft = fx; A.photoRight = fx + fw;
      if (draw) {
        ctx.save();
        ctx.translate(CX, y + fh / 2); ctx.rotate(-1.6 * Math.PI / 180); ctx.translate(-CX, -(y + fh / 2));
        ctx.shadowColor = 'rgba(110,84,70,.22)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
        rr(ctx, fx, y, fw, fh, 10); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.shadowColor = 'transparent';
        // recadrage « cover »
        const ir = photo.width / photo.height; const tr = pw / ph;
        let sw = photo.width, sh = photo.height, sx = 0, sy = 0;
        if (ir > tr) { sw = photo.height * tr; sx = (photo.width - sw) / 2; } else { sh = photo.width / tr; sy = (photo.height - sh) / 2; }
        ctx.save(); rr(ctx, fx + 22, y + 22, pw, ph, 6); ctx.clip();
        ctx.drawImage(photo, sx, sy, sw, sh, fx + 22, y + 22, pw, ph); ctx.restore();
        ctx.restore();
      }
      y += fh + 50;
    }

    // infos (temps, four, portions, difficulté)
    const chips = [];
    if (+r.prep) chips.push(['fouet', 'Préparation', fmtMin(r.prep)]);
    if (+r.cook) chips.push(['minuteur', 'Cuisson', fmtMin(r.cook)]);
    if (+r.temp) chips.push(['gant', 'Four', `${r.temp} °C`]);
    if (+r.rest) chips.push(['the', 'Repos', fmtMin(r.rest)]);
    if (+r.servings) chips.push(['coeur', 'Pour', `${r.servings} ${r.servingsUnit || (+r.servings > 1 ? 'pers.' : 'pers.')}`]);
    if (+r.difficulty) chips.push(['toque', 'Niveau', DIFF[r.difficulty]]);
    if (chips.length) {
      const sized = chips.map(([ic, lab, val]) => {
        ctx.font = `800 21px ${FONT_B}`; const lw = ctx.measureText(lab.toUpperCase()).width;
        ctx.font = `600 33px ${FONT_T}`; const vw = ctx.measureText(val).width;
        return { ic, lab, val, w: Math.max(lw, vw) + 64 + 30 + 20 };
      });
      const rows = []; let row = []; let rw = 0;
      sized.forEach((c) => { if (row.length && rw + c.w + 16 > CW + 40) { rows.push(row); row = []; rw = 0; } row.push(c); rw += c.w + (row.length > 1 ? 16 : 0); });
      if (row.length) rows.push(row);
      rows.forEach((rowc) => {
        const tot = rowc.reduce((s, c) => s + c.w, 0) + 16 * (rowc.length - 1);
        let x = CX - tot / 2;
        rowc.forEach((c) => {
          if (draw) {
            rr(ctx, x, y, c.w, 88, 26); ctx.fillStyle = T.soft; ctx.fill();
            const ic = chipIcons[c.ic]; if (ic) ctx.drawImage(ic, x + 12, y + 12, 64, 64);
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = T.muted; ctx.font = `800 21px ${FONT_B}`; ctx.fillText(c.lab.toUpperCase(), x + 84, y + 36);
            ctx.fillStyle = T.ink; ctx.font = `600 33px ${FONT_T}`; ctx.fillText(c.val, x + 84, y + 72);
          }
          x += c.w + 16;
        });
        y += 88 + 16;
      });
      y += 34;
    }

    // titre de section
    const section = (label, key) => {
      A[key] = y;
      ctx.font = `600 50px ${FONT_T}`;
      const tw = ctx.measureText(label).width;
      if (draw) {
        ctx.save(); ctx.globalAlpha = 0.55; rr(ctx, CX - tw / 2 - 14, y + 30, tw + 28, 22, 11); ctx.fillStyle = T.soft; ctx.fill(); ctx.restore();
        ctx.fillStyle = T.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(label, CX, y + 46);
      }
      y += 84;
    };

    // ingrédients
    const ings = (r.ingredients || []).filter((it) => it.sec || it.n || it.q);
    if (ings.length) {
      section('Ingrédients', 'ingTop');
      const twoCols = ings.length > 6;
      const gap = 48;
      const colW = twoCols ? (CW - gap) / 2 : CW - 80;
      const items = ings.map((it) => {
        if (it.sec) {
          ctx.font = `700 40px ${FONT_H}`;
          const ls = wrap(ctx, it.sec, colW);
          return { sec: true, lines: ls, h: ls.length * 42 + 14 };
        }
        const { qty, name } = ingText(it);
        ctx.font = `600 31px ${FONT_B}`;
        const full = qty ? `${qty}  ${name}` : name;
        const ls = wrap(ctx, full, colW - 34);
        return { qty, name, lines: ls, h: ls.length * 41 + 14 };
      });
      // découpe en deux colonnes équilibrées
      let split = items.length;
      if (twoCols) {
        let best = Infinity;
        for (let i = 1; i < items.length; i++) {
          const a = items.slice(0, i).reduce((s, it) => s + it.h, 0); const b = items.slice(i).reduce((s, it) => s + it.h, 0);
          const m = Math.max(a, b); if (m < best && !items[i - 1].sec) { best = m; split = i; }
        }
      }
      const cols = twoCols ? [items.slice(0, split), items.slice(split)] : [items];
      const startY = y; let maxY = y;
      cols.forEach((col, ci) => {
        let yy = startY;
        const x0 = twoCols ? X + ci * (colW + gap) : X + 40;
        col.forEach((it) => {
          if (it.sec) {
            if (draw) { ctx.font = `700 40px ${FONT_H}`; ctx.fillStyle = T.accent; ctx.textAlign = 'left'; it.lines.forEach((l, i) => ctx.fillText(l, x0, yy + 34 + i * 42)); }
            yy += it.h; return;
          }
          if (draw) {
            ctx.fillStyle = T.accent; ctx.beginPath(); ctx.arc(x0 + 9, yy + 20, 7, 0, 7); ctx.fill();
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            it.lines.forEach((l, i) => {
              const lx = x0 + 34; const ly = yy + 31 + i * 41;
              if (i === 0 && it.qty && l.startsWith(it.qty)) {
                ctx.font = `800 31px ${FONT_B}`; ctx.fillStyle = T.ink; ctx.fillText(it.qty, lx, ly);
                const qw = ctx.measureText(it.qty + '  ').width;
                ctx.font = `600 31px ${FONT_B}`; ctx.fillStyle = T.ink; ctx.fillText(l.slice(it.qty.length).trimStart(), lx + qw, ly);
              } else { ctx.font = `600 31px ${FONT_B}`; ctx.fillStyle = T.ink; ctx.fillText(l, lx, ly); }
            });
          }
          yy += it.h;
        });
        maxY = Math.max(maxY, yy);
      });
      y = maxY + 40;
    }

    // étapes
    const steps = (r.steps || []).map((s) => (s || '').trim()).filter(Boolean);
    if (steps.length) {
      section('Préparation', 'stepsTop');
      steps.forEach((s, i) => {
        ctx.font = `600 31px ${FONT_B}`;
        const ls = wrap(ctx, s, CW - 84);
        if (draw) {
          ctx.fillStyle = T.accent; ctx.beginPath(); ctx.arc(X + 26, y + 22, 26, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = `600 30px ${FONT_T}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), X + 26, y + 23);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = T.ink; ctx.font = `600 31px ${FONT_B}`;
          ls.forEach((l, j) => ctx.fillText(l, X + 84, y + 33 + j * 43));
        }
        y += Math.max(52, ls.length * 43) + 26;
      });
      y += 20;
    }

    // astuce façon post-it
    if ((r.notes || '').trim()) {
      A.notesTop = y;
      ctx.font = `700 40px ${FONT_H}`;
      const nw = CW - 40;
      const ls = wrap(ctx, r.notes.trim(), nw - 70);
      const nh = 92 + ls.length * 44 + 30;
      if (draw) {
        ctx.save(); ctx.translate(CX, y + nh / 2); ctx.rotate(0.9 * Math.PI / 180); ctx.translate(-CX, -(y + nh / 2));
        ctx.shadowColor = 'rgba(110,84,70,.14)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
        rr(ctx, CX - nw / 2, y, nw, nh, 14); ctx.fillStyle = T.note; ctx.fill(); ctx.shadowColor = 'transparent';
        ctx.fillStyle = T.ink; ctx.textAlign = 'left'; ctx.font = `600 34px ${FONT_T}`; ctx.fillText('Mes astuces', CX - nw / 2 + 36, y + 62);
        ctx.font = `700 40px ${FONT_H}`; ls.forEach((l, j) => ctx.fillText(l, CX - nw / 2 + 36, y + 112 + j * 44));
        ctx.restore();
      }
      y += nh + 40;
    }

    // signature
    const sign = (opts_sign()).trim();
    y += 6;
    if (sign) {
      if (draw) { ctx.font = `700 40px ${FONT_H}`; ctx.fillStyle = T.muted; ctx.textAlign = 'center'; ctx.fillText(sign, CX, y + 30); }
      y += 54;
    }
    y += M + 40;
    A.height = y;
    return y;
  }

  // signature affichée en bas des fiches (réglage)
  let signature = '';
  const opts_sign = () => signature || '';
  const setSignature = (s) => { signature = s || ''; };

  return { W, THEMES, render, fmtMin, fmtQty, ingText, setSignature, embeddedFonts, loadFonts };
})();
