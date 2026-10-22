'use strict';
/* =========================================================
   Carnet de recettes : la fiche à partager (canvas, 1080 px de large)
   Mise en page éditoriale : titre serif, photo, infos, deux colonnes
   (ingrédients / préparation), astuce, signature.
   ========================================================= */

const CARD = (() => {
  const W = 1080;
  const THEMES = {
    ivoire: { name: 'Ivoire', bg: '#F7F2EA', ink: '#2B2420', soft: '#6F625A', line: '#DDD1C0', accent: '#A4553A', tint: '#EFE6D8' },
    lin:    { name: 'Lin',    bg: '#EDE4D5', ink: '#2E2620', soft: '#6E6052', line: '#D2C4AE', accent: '#8A5A3A', tint: '#E3D7C3' },
    sauge:  { name: 'Sauge',  bg: '#E8EBE1', ink: '#27302A', soft: '#5F6A5E', line: '#CBD2C1', accent: '#5F7352', tint: '#DCE2D3' },
    poudre: { name: 'Poudré', bg: '#F5E9E4', ink: '#30252A', soft: '#76626A', line: '#E2CFC7', accent: '#A85663', tint: '#EEDCD5' },
    ardoise:{ name: 'Ardoise',bg: '#E7EAEC', ink: '#262C31', soft: '#5E6870', line: '#CDD3D8', accent: '#4F6475', tint: '#DCE1E5' },
  };
  const SERIF = 'Fraunces, Georgia, serif';
  const SERIF_I = '"Fraunces Italic", Fraunces, Georgia, serif';
  const SANS = 'Inter, system-ui, sans-serif';

  /* ---------- ressources ---------- */
  let fontsReady = null;
  function loadFonts() {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load(`400 40px Fraunces`), document.fonts.load(`500 40px Fraunces`),
        document.fonts.load(`italic 400 40px "Fraunces Italic"`),
        document.fonts.load(`400 30px Inter`), document.fonts.load(`600 30px Inter`),
      ]).catch(() => {});
    }
    return fontsReady;
  }
  const imgCache = new Map();
  function loadImg(src) {
    if (!src) return Promise.resolve(null);
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    if (imgCache.size > 120) imgCache.clear();
    imgCache.set(src, p);
    return p;
  }

  // grain de papier (généré une fois)
  let grain = null;
  function paperGrain() {
    if (grain) return grain;
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d'); const d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random();
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v > 0.5 ? 255 : 60;
      d.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 22);
    }
    x.putImageData(d, 0, 0);
    grain = c; return c;
  }

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
  function balanced(ctx, text, maxW) {
    let lines = wrap(ctx, text, maxW);
    if (lines.length < 2) return lines;
    let w = maxW; const n = lines.length;
    while (w > 240) { const t = wrap(ctx, text, w - 16); if (t.length > n) break; lines = t; w -= 16; }
    return lines;
  }
  const spaced = (ctx, px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; };
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- formats ---------- */
  const fmtMin = (m) => {
    m = Math.round(+m || 0); if (!m) return '';
    if (m < 60) return m + ' min';
    const h = Math.floor(m / 60); const r = m % 60;
    return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
  };
  const fmtQty = (n) => {
    const fr = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
    const whole = Math.floor(n); const dec = Math.round((n - whole) * 100) / 100;
    if (fr[dec] && n < 10) return (whole ? whole + ' ' : '') + fr[dec];
    return (Math.round(n * 100) / 100).toString().replace('.', ',');
  };
  const niceRound = (v, u) => {
    if (['g', 'ml', 'mg'].includes(u)) return v >= 100 ? Math.round(v / 5) * 5 : v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    if (['kg', 'L', 'cl', 'dl'].includes(u)) return v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    if (['c. à s.', 'c. à c.', 'pincée', 'tasse', 'verre'].includes(u)) return Math.max(0.25, Math.round(v * 4) / 4);
    return Math.max(0.5, Math.round(v * 2) / 2);
  };
  const ingText = (it, mult = 1) => {
    const n = parseFloat(String(it.q ?? '').replace(',', '.'));
    const q = isFinite(n) ? fmtQty(mult === 1 ? n : niceRound(n * mult, it.u || '')) : (it.q || '');
    return { qty: [q, it.u || ''].filter(Boolean).join(' '), name: it.n || '' };
  };
  const DIFF = ['', 'Facile', 'Moyen', 'Exigeant'];

  /* ---------- rendu ---------- */
  async function render(recipe, opts = {}) {
    await loadFonts();
    const scale = opts.scale || 1;
    const T = THEMES[recipe.theme] || THEMES.ivoire;
    const photo = await loadImg(recipe.photo);
    const anchors = {};
    const measure = document.createElement('canvas').getContext('2d');
    const H = Math.ceil(layout(measure, recipe, T, photo, anchors, false, 0, opts));
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const ctx = cv.getContext('2d');
    ctx.scale(scale, scale); ctx.imageSmoothingQuality = 'high';
    layout(ctx, recipe, T, photo, anchors, true, H, opts);
    if (opts.withIllus && recipe.stickers && recipe.stickers.length) {
      for (const st of recipe.stickers) {
        const img = await loadImg(ILLUS.src(st.id));
        if (!img) continue;
        const px = st.s * W;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.translate(st.x * W, st.y * W);
        ctx.rotate((st.r || 0) * Math.PI / 180);
        if (st.f) ctx.scale(-1, 1);
        ctx.drawImage(img, -px / 2, -px / 2, px, px);
        ctx.restore();
      }
    }
    return { canvas: cv, width: W, height: H, anchors };
  }

  function layout(ctx, r, T, photo, A, draw, totalH, opts) {
    const M = 84; const CW = W - 2 * M;
    let y = 96;
    const txt = (s, x, yy, font, color, align = 'left') => { if (!draw) return; ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, yy); };
    const rule = (yy, x0 = M, x1 = W - M) => { if (!draw) return; ctx.fillStyle = T.line; ctx.fillRect(x0, yy, x1 - x0, 2); };

    if (draw) {
      ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, totalH);
      const pat = ctx.createPattern(paperGrain(), 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W, totalH);
      // léger vignettage
      const g = ctx.createRadialGradient(W / 2, totalH / 2, W * 0.4, W / 2, totalH / 2, Math.max(W, totalH) * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,60,40,0.06)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, totalH);
    }

    // en-tête : catégorie + numéro
    ctx.font = `600 22px ${SANS}`; spaced(ctx, 4);
    if (draw) {
      txt((r.category || 'Recette').toUpperCase(), M, y, `600 22px ${SANS}`, T.accent);
      if (opts.number) txt(`N° ${String(opts.number).padStart(3, '0')}`, W - M, y, `600 22px ${SANS}`, T.soft, 'right');
    }
    spaced(ctx, 0);
    y += 34;
    rule(y); y += 52;

    // titre
    A.titleTop = y;
    let fs = 92;
    ctx.font = `400 ${fs}px ${SERIF}`;
    let lines = balanced(ctx, r.title || 'Ma recette', CW - 150);
    if (lines.length > 2) { fs = 76; ctx.font = `400 ${fs}px ${SERIF}`; lines = balanced(ctx, r.title, CW - 100); }
    lines.forEach((l) => { y += fs * 0.98; txt(l, M - 4, y, `400 ${fs}px ${SERIF}`, T.ink); });
    y += 18;
    if (r.subtitle) {
      ctx.font = `italic 400 40px ${SERIF_I}`;
      wrap(ctx, r.subtitle, CW - 120).forEach((l) => { y += 48; txt(l, M, y, `italic 400 40px ${SERIF_I}`, T.soft); });
      y += 10;
    }
    A.titleBottom = y;
    y += 40;

    // photo
    if (photo) {
      const pw = CW; const ph = Math.round(pw * 0.7);
      A.photoTop = y; A.photoBottom = y + ph;
      if (draw) {
        const ir = photo.width / photo.height; const tr = pw / ph;
        let sw = photo.width, sh = photo.height, sx = 0, sy = 0;
        if (ir > tr) { sw = photo.height * tr; sx = (photo.width - sw) / 2; } else { sh = photo.width / tr; sy = (photo.height - sh) / 2; }
        ctx.save(); rr(ctx, M, y, pw, ph, 10); ctx.clip();
        ctx.drawImage(photo, sx, sy, sw, sh, M, y, pw, ph); ctx.restore();
      }
      y += ph + 44;
    }

    // infos
    const info = [];
    if (+r.prep) info.push(['Préparation', fmtMin(r.prep)]);
    if (+r.cook) info.push(['Cuisson', fmtMin(r.cook)]);
    if (+r.temp) info.push(['Four', `${r.temp} °C`]);
    if (+r.rest) info.push(['Repos', fmtMin(r.rest)]);
    if (+r.servings) info.push(['Pour', `${r.servings} ${r.servingsUnit || 'pers.'}`]);
    if (+r.difficulty) info.push(['Niveau', DIFF[r.difficulty]]);
    if (info.length) {
      const items = info.slice(0, 5);
      const cw = CW / items.length;
      rule(y); y += 36;
      items.forEach(([lab, val], i) => {
        const cx = M + cw * i + cw / 2;
        ctx.font = `600 19px ${SANS}`; spaced(ctx, 3);
        txt(lab.toUpperCase(), cx, y + 18, `600 19px ${SANS}`, T.soft, 'center');
        spaced(ctx, 0);
        txt(val, cx, y + 70, `400 40px ${SERIF}`, T.ink, 'center');
        if (i && draw) { ctx.fillStyle = T.line; ctx.fillRect(M + cw * i, y - 6, 2, 92); }
      });
      y += 104; rule(y); y += 64;
    }

    // deux colonnes
    const ings = (r.ingredients || []).filter((it) => it.sec || it.n || it.q);
    const steps = (r.steps || []).map((s) => (s || '').trim()).filter(Boolean);
    const twoCols = ings.length && steps.length;
    const LW = twoCols ? 330 : CW; const GAP = 64; const RX = M + LW + GAP; const RW = W - M - RX;
    const startY = y;
    let ly = y; let ry = y;

    if (ings.length) {
      A.ingTop = ly;
      txt('Ingrédients', M, ly + 40, `italic 400 46px ${SERIF_I}`, T.ink);
      ly += 74;
      if (+r.servings) { txt(`pour ${r.servings} ${r.servingsUnit || 'pers.'}`, M, ly + 2, `italic 400 26px ${SERIF_I}`, T.soft); ly += 30; }
      ings.forEach((it) => {
        if (it.sec) {
          ly += 18;
          ctx.font = `600 20px ${SANS}`; spaced(ctx, 3);
          wrap(ctx, it.sec.toUpperCase(), LW).forEach((l) => { ly += 30; txt(l, M, ly, `600 20px ${SANS}`, T.accent); });
          spaced(ctx, 0); ly += 14; return;
        }
        const { qty, name } = ingText(it);
        ctx.font = `400 29px ${SANS}`;
        const full = qty ? `${qty} ${name}` : name;
        const ls = wrap(ctx, full, LW - 6);
        ls.forEach((l, i) => {
          ly += 40;
          if (!draw) return;
          if (i === 0 && qty && l.startsWith(qty)) {
            txt(qty, M, ly, `600 29px ${SANS}`, T.ink);
            ctx.font = `600 29px ${SANS}`; const qw = ctx.measureText(qty + ' ').width;
            txt(l.slice(qty.length).trimStart(), M + qw, ly, `400 29px ${SANS}`, T.ink);
          } else txt(l, M, ly, `400 29px ${SANS}`, T.ink);
        });
        ly += 12;
        if (draw) { ctx.fillStyle = T.line; ctx.globalAlpha = 0.6; ctx.fillRect(M, ly, LW, 1.5); ctx.globalAlpha = 1; }
      });
    }

    if (steps.length) {
      const sx = twoCols ? RX : M; const sw = twoCols ? RW : CW;
      if (!twoCols && ings.length) { ry = ly + 60; }
      A.stepsTop = ry;
      txt('Préparation', sx, ry + 40, `italic 400 46px ${SERIF_I}`, T.ink);
      ry += 84;
      steps.forEach((s, i) => {
        txt(String(i + 1).padStart(2, '0'), sx, ry + 34, `400 38px ${SERIF}`, T.accent);
        ctx.font = `400 29px ${SANS}`;
        const ls = wrap(ctx, s, sw - 76);
        ls.forEach((l, j) => txt(l, sx + 76, ry + 30 + j * 42, `400 29px ${SANS}`, T.ink));
        ry += Math.max(48, ls.length * 42) + 26;
      });
    }
    if (twoCols && draw) { ctx.fillStyle = T.line; ctx.fillRect(M + LW + GAP / 2, startY + 8, 2, Math.max(ly, ry) - startY - 20); }
    y = Math.max(ly, ry) + 44;

    // astuce
    if ((r.notes || '').trim()) {
      A.notesTop = y;
      ctx.font = `italic 400 34px ${SERIF_I}`;
      const ls = wrap(ctx, r.notes.trim(), CW - 120);
      const nh = 96 + ls.length * 46 + 26;
      if (draw) {
        ctx.fillStyle = T.tint; rr(ctx, M, y, CW, nh, 8); ctx.fill();
        ctx.fillStyle = T.accent; ctx.fillRect(M, y, 5, nh);
        ctx.font = `600 20px ${SANS}`; spaced(ctx, 3); txt('LE PETIT PLUS', M + 54, y + 58, `600 20px ${SANS}`, T.accent); spaced(ctx, 0);
        ls.forEach((l, j) => txt(l, M + 54, y + 112 + j * 46, `italic 400 34px ${SERIF_I}`, T.ink));
      }
      y += nh + 50;
    }

    // signature
    rule(y); y += 60;
    const sign = signature.trim();
    if (sign) {
      ctx.font = `500 20px ${SANS}`; spaced(ctx, 5);
      txt(sign.toUpperCase(), W / 2, y, `500 20px ${SANS}`, T.soft, 'center');
      spaced(ctx, 0);
      y += 20;
    }
    y += 70;
    A.height = y;
    return y;
  }

  let signature = '';
  const setSignature = (s) => { signature = s || ''; };

  return { W, THEMES, render, fmtMin, ingText, setSignature, loadFonts, loadImg };
})();
