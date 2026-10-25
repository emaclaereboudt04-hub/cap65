'use strict';
/* =========================================================
   Carnet de recettes : la fiche à partager (canvas, 1080 px de large)
   - Une page : ingrédients à gauche, préparation à droite ; quand les
     ingrédients s'arrêtent, la préparation reprend toute la largeur.
   - Recto-verso : ingrédients au recto, préparation au verso (même format).
   - Le texte entre **astérisques** s'affiche en gras.
   ========================================================= */

const CARD = (() => {
  const W = 1080;
  const M = 84; const CW = W - 2 * M;
  const AUTO_MAX = 3000;          // au-delà, « Auto » passe en recto-verso
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
  const F = {
    body: `400 29px ${SANS}`, bodyB: `600 29px ${SANS}`,
    note: `italic 400 34px ${SERIF_I}`, noteB: `italic 600 34px ${SERIF_I}`,
  };

  /* ---------- ressources ---------- */
  let fontsReady = null;
  function loadFonts() {
    if (!fontsReady) {
      fontsReady = Promise.all([
        document.fonts.load(`400 40px Fraunces`), document.fonts.load(`500 40px Fraunces`),
        document.fonts.load(`italic 400 40px "Fraunces Italic"`), document.fonts.load(`italic 600 40px "Fraunces Italic"`),
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
  const plain = (s) => String(s ?? '').replace(/\*\*/g, '');
  function runs(text) {
    const out = []; let b = false;
    String(text ?? '').split('**').forEach((part, i) => { if (i > 0) b = !b; if (part) out.push({ t: part, b }); });
    return out;
  }
  function wrap(ctx, text, maxW) {
    const out = [];
    String(text || '').split('\n').forEach((para) => {
      const words = para.split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW || !line) line = test; else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }
  /* texte riche : renvoie des lignes, chaque ligne = liste de morceaux { t, b, sp } */
  function wrapRich(ctx, text, maxW, fR, fB) {
    const lines = [];
    String(text ?? '').split('\n').forEach((para) => {
      const toks = []; let space = false;
      runs(para).forEach((r) => r.t.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { space = true; return; }
        toks.push({ t: p, b: r.b, sp: space && toks.length > 0 }); space = false;
      }));
      if (!toks.length) { lines.push([]); return; }
      ctx.font = fR; const spW = ctx.measureText(' ').width;
      let cur = []; let w = 0;
      toks.forEach((tk) => {
        ctx.font = tk.b ? fB : fR;
        const tw = ctx.measureText(tk.t).width;
        const add = (tk.sp ? spW : 0) + tw;
        if (cur.length && w + add > maxW && tk.sp) { lines.push(cur); cur = [{ ...tk, sp: false }]; w = tw; } else { cur.push(tk); w += add; }
      });
      lines.push(cur);
    });
    return lines;
  }
  function drawRich(ctx, line, x, y, fR, fB, color) {
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = fR; const spW = ctx.measureText(' ').width;
    line.forEach((tk) => {
      if (tk.sp) x += spW;
      ctx.font = tk.b ? fB : fR; ctx.fillText(tk.t, x, y); x += ctx.measureText(tk.t).width;
    });
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
  // « 1 pièce », « 6 pièces »
  const servLabel = (n, unit) => {
    const u = unit || 'pers.';
    return `${n} ${+n <= 1 && /s$/.test(u) ? u.slice(0, -1) : u}`;
  };

  /* =========================================================
     Mise en page : un « crayon » qui sait mesurer ou dessiner
     ========================================================= */
  function pen(ctx, draw, T, r, opts) {
    const P = { ctx, draw, T, r, opts, A: {} };
    P.txt = (s, x, y, font, color, align = 'left') => { if (!draw) return; ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); };
    P.rule = (y, x0 = M, x1 = W - M) => { if (draw) { ctx.fillStyle = T.line; ctx.fillRect(x0, y, x1 - x0, 2); } };
    P.vrule = (x, y0, y1) => { if (draw && y1 > y0) { ctx.fillStyle = T.line; ctx.fillRect(x, y0, 2, y1 - y0); } };
    P.small = (s, x, y, color, align = 'left', size = 20) => { ctx.font = `600 ${size}px ${SANS}`; spaced(ctx, 3.5); P.txt(s.toUpperCase(), x, y, `600 ${size}px ${SANS}`, color, align); spaced(ctx, 0); };
    return P;
  }

  function paper(P, H) {
    if (!P.draw) return;
    const { ctx, T } = P;
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = ctx.createPattern(paperGrain(), 'repeat'); ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,60,40,0.06)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function header(P, y, right) {
    P.small(plain(P.r.category || 'Recette'), M, y, P.T.accent, 'left', 22);
    if (right) P.small(right, W - M, y, P.T.soft, 'right', 22);
    y += 34; P.rule(y); return y + 52;
  }

  function title(P, y, size = 92) {
    const { ctx, r, T } = P;
    P.A.titleTop = y;
    let fs = size;
    ctx.font = `400 ${fs}px ${SERIF}`;
    let lines = balanced(ctx, plain(r.title) || 'Ma recette', CW - 150);
    if (lines.length > 2) { fs = Math.round(size * 0.82); ctx.font = `400 ${fs}px ${SERIF}`; lines = balanced(ctx, plain(r.title), CW - 100); }
    lines.forEach((l) => { y += fs * 0.98; P.txt(l, M - 4, y, `400 ${fs}px ${SERIF}`, T.ink); });
    y += 18;
    if (r.subtitle && size >= 80) {
      ctx.font = `italic 400 40px ${SERIF_I}`;
      wrap(ctx, plain(r.subtitle), CW - 120).forEach((l) => { y += 48; P.txt(l, M, y, `italic 400 40px ${SERIF_I}`, T.soft); });
      y += 10;
    }
    P.A.titleBottom = y;
    return y + 40;
  }

  function photoBlock(P, y, photo) {
    if (!photo) return y;
    const { ctx } = P;
    const pw = CW; const ph = Math.round(pw * 0.7);
    P.A.photoTop = y; P.A.photoBottom = y + ph;
    if (P.draw) {
      const ir = photo.width / photo.height; const tr = pw / ph;
      let sw = photo.width, sh = photo.height, sx = 0, sy = 0;
      if (ir > tr) { sw = photo.height * tr; sx = (photo.width - sw) / 2; } else { sh = photo.width / tr; sy = (photo.height - sh) / 2; }
      ctx.save(); rr(ctx, M, y, pw, ph, 10); ctx.clip();
      ctx.drawImage(photo, sx, sy, sw, sh, M, y, pw, ph); ctx.restore();
    }
    return y + ph + 44;
  }

  function infoBar(P, y) {
    const { r, T, ctx } = P;
    const info = [];
    if (+r.prep) info.push(['Préparation', fmtMin(r.prep)]);
    if (+r.cook) info.push(['Cuisson', fmtMin(r.cook)]);
    if (+r.temp) info.push(['Four', `${r.temp} °C`]);
    if (+r.rest) info.push(['Repos', fmtMin(r.rest)]);
    if (+r.servings) info.push(['Pour', servLabel(r.servings, r.servingsUnit)]);
    if (+r.difficulty) info.push(['Niveau', DIFF[r.difficulty]]);
    if (!info.length) return y;
    const items = info.slice(0, 5); const cw = CW / items.length;
    P.rule(y); y += 36;
    items.forEach(([lab, val], i) => {
      const cx = M + cw * i + cw / 2;
      ctx.font = `600 19px ${SANS}`; spaced(ctx, 3);
      P.txt(lab.toUpperCase(), cx, y + 18, `600 19px ${SANS}`, T.soft, 'center');
      spaced(ctx, 0);
      P.txt(val, cx, y + 70, `400 40px ${SERIF}`, T.ink, 'center');
      if (i) P.vrule(M + cw * i, y - 6, y + 86);
    });
    y += 104; P.rule(y); return y + 64;
  }

  function sectionTitle(P, label, x, y, extra) {
    P.txt(label, x, y + 40, `italic 400 46px ${SERIF_I}`, P.T.ink);
    y += 74;
    if (extra) { P.txt(extra, x, y + 2, `italic 400 26px ${SERIF_I}`, P.T.soft); y += 30; }
    return y;
  }

  /* ingrédients, sur 1 ou 2 colonnes */
  function ingredients(P, x, w, y, cols = 1) {
    const { ctx, r, T } = P;
    const ings = (r.ingredients || []).filter((it) => it.sec || it.n || it.q);
    if (!ings.length) return y;
    P.A.ingTop = y;
    y = sectionTitle(P, 'Ingrédients', x, y, +r.servings ? `pour ${servLabel(r.servings, r.servingsUnit)}` : '');
    const GAP = 56; const colW = cols === 2 ? (w - GAP) / 2 : w;
    const items = ings.map((it) => {
      if (it.sec) {
        ctx.font = `600 20px ${SANS}`; spaced(ctx, 3);
        const ls = wrap(ctx, plain(it.sec).toUpperCase(), colW); spaced(ctx, 0);
        return { sec: true, ls, h: 18 + ls.length * 30 + 14 };
      }
      const { qty, name } = ingText(it);
      const ls = wrapRich(ctx, qty ? `**${qty}** ${name}` : name, colW - 6, F.body, F.bodyB);
      return { ls, h: ls.length * 40 + 12 };
    });
    let split = items.length;
    if (cols === 2) {
      let best = Infinity;
      for (let i = 1; i < items.length; i++) {
        const a = items.slice(0, i).reduce((s, it) => s + it.h, 0); const b = items.slice(i).reduce((s, it) => s + it.h, 0);
        if (Math.max(a, b) < best && !items[i - 1].sec) { best = Math.max(a, b); split = i; }
      }
    }
    const groups = cols === 2 ? [items.slice(0, split), items.slice(split)] : [items];
    let bottom = y;
    groups.forEach((g, gi) => {
      let yy = y; const x0 = x + gi * (colW + GAP);
      g.forEach((it) => {
        if (it.sec) {
          yy += 18;
          it.ls.forEach((l) => { yy += 30; P.small(l, x0, yy, T.accent); });
          yy += 14; return;
        }
        it.ls.forEach((l) => { yy += 40; if (P.draw) drawRich(ctx, l, x0, yy, F.body, F.bodyB, T.ink); });
        yy += 12;
        if (P.draw) { ctx.globalAlpha = 0.6; ctx.fillStyle = T.line; ctx.fillRect(x0, yy, colW, 1.5); ctx.globalAlpha = 1; }
      });
      bottom = Math.max(bottom, yy);
    });
    return bottom;
  }

  /* étapes ; si flowAt est donné, on passe en pleine largeur une fois ce niveau dépassé */
  function steps(P, x, w, y, flowAt = null, label = 'Préparation') {
    const { ctx, r, T } = P;
    const list = (r.steps || []).map((s) => (s || '').trim()).filter(Boolean);
    if (!list.length) return { y, switchY: null };
    P.A.stepsTop = y;
    y = sectionTitle(P, label, x, y) + 10;
    let switchY = null;
    list.forEach((s, i) => {
      if (flowAt !== null && switchY === null && y > flowAt + 6) { switchY = y; y += 10; x = M; w = CW; }
      const ls = wrapRich(ctx, s, w - 76, F.body, F.bodyB);
      P.txt(String(i + 1).padStart(2, '0'), x, y + 34, `400 38px ${SERIF}`, T.accent);
      if (P.draw) ls.forEach((l, j) => drawRich(ctx, l, x + 76, y + 30 + j * 42, F.body, F.bodyB, T.ink));
      y += Math.max(48, ls.length * 42) + 26;
    });
    return { y, switchY };
  }

  function notes(P, y) {
    const { ctx, r, T } = P;
    if (!(r.notes || '').trim()) return y;
    P.A.notesTop = y;
    const ls = wrapRich(ctx, r.notes.trim(), CW - 120, F.note, F.noteB);
    const nh = 96 + ls.length * 46 + 26;
    if (P.draw) {
      ctx.fillStyle = T.tint; rr(ctx, M, y, CW, nh, 8); ctx.fill();
      ctx.fillStyle = T.accent; ctx.fillRect(M, y, 5, nh);
      P.small('Le petit plus', M + 54, y + 58, T.accent);
      ls.forEach((l, j) => drawRich(ctx, l, M + 54, y + 112 + j * 46, F.note, F.noteB, T.ink));
    }
    return y + nh + 50;
  }

  const FOOT = 170;
  function footer(P, H, left) {
    const y = H - FOOT + 40;
    P.rule(y);
    const sign = signature.trim();
    if (sign) P.small(sign, W / 2, y + 60, P.T.soft, 'center', 20);
    if (left) P.txt(left, W - M, y + 60, `italic 400 26px ${SERIF_I}`, P.T.soft, 'right');
  }

  /* --- les trois mises en page --- */
  function single(P, photo, H) {
    paper(P, H);
    let y = header(P, 96, P.opts.number ? `N° ${String(P.opts.number).padStart(3, '0')}` : '');
    y = title(P, y); y = photoBlock(P, y, photo); y = infoBar(P, y);
    const hasIng = (P.r.ingredients || []).some((it) => it.sec || it.n || it.q);
    const hasSteps = (P.r.steps || []).some((s) => (s || '').trim());
    if (hasIng && hasSteps) {
      const LW = 330; const GAP = 64; const RX = M + LW + GAP;
      const top = y;
      const ly = ingredients(P, M, LW, y);
      const st = steps(P, RX, W - M - RX, y, ly);
      P.vrule(M + LW + GAP / 2, top + 8, (st.switchY ?? Math.max(ly, st.y)) - 20);
      if (st.switchY !== null) P.rule(st.switchY - 4, M, W - M);
      y = Math.max(ly, st.y) + 44;
    } else if (hasIng) y = ingredients(P, M, CW, y, (P.r.ingredients || []).length > 6 ? 2 : 1) + 44;
    else if (hasSteps) y = steps(P, M, CW, y).y + 44;
    y = notes(P, y);
    if (H) footer(P, H);
    return y + FOOT;
  }
  function recto(P, photo, H) {
    paper(P, H);
    let y = header(P, 96, 'Recto');
    y = title(P, y); y = photoBlock(P, y, photo); y = infoBar(P, y);
    const n = (P.r.ingredients || []).filter((it) => it.sec || it.n || it.q).length;
    y = ingredients(P, M, CW, y, n > 5 ? 2 : 1) + 44;
    if (H) footer(P, H, 'Préparation au verso →');
    return y + FOOT;
  }
  function verso(P, H) {
    paper(P, H);
    let y = header(P, 96, 'Verso');
    P.A.titleTop = y;
    P.ctx.font = `400 60px ${SERIF}`;
    wrap(P.ctx, plain(P.r.title), CW - 160).forEach((l) => { y += 62; P.txt(l, M - 2, y, `400 60px ${SERIF}`, P.T.ink); });
    y += 56;
    y = steps(P, M, CW, y).y + 30;
    y = notes(P, y);
    if (H) footer(P, H);
    return y + FOOT;
  }

  /* ---------- rendu ---------- */
  function mode(r, singleH) {
    if (r.layout === 'double') return 'double';
    if (r.layout === 'single') return 'single';
    return singleH > AUTO_MAX ? 'double' : 'single';
  }

  async function render(recipe, opts = {}) {
    await loadFonts();
    const scale = opts.scale || 1;
    const T = THEMES[recipe.theme] || THEMES.ivoire;
    const photo = await loadImg(recipe.photo);
    const m = document.createElement('canvas').getContext('2d');
    const singleH = Math.ceil(single(pen(m, false, T, recipe, opts), photo, 0));
    const md = mode(recipe, singleH);
    const specs = md === 'single'
      ? [{ H: singleH, fn: (P, H) => single(P, photo, H) }]
      : (() => {
        const h1 = Math.ceil(recto(pen(m, false, T, recipe, opts), photo, 0));
        const h2 = Math.ceil(verso(pen(m, false, T, recipe, opts), 0));
        const H = Math.max(h1, h2, 1350);
        return [{ H, fn: (P, HH) => recto(P, photo, HH) }, { H, fn: (P, HH) => verso(P, HH) }];
      })();
    const pages = [];
    for (let i = 0; i < specs.length; i++) {
      const { H, fn } = specs[i];
      const cv = document.createElement('canvas');
      cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
      const ctx = cv.getContext('2d');
      ctx.scale(scale, scale); ctx.imageSmoothingQuality = 'high';
      const P = pen(ctx, true, T, recipe, opts);
      fn(P, H);
      if (opts.withIllus) {
        for (const st of (recipe.stickers || [])) {
          if ((st.p || 0) !== i) continue;
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
      pages.push({ canvas: cv, height: H, anchors: P.A });
    }
    return { pages, mode: md, width: W };
  }

  let signature = '';
  const setSignature = (s) => { signature = s || ''; };

  return { W, THEMES, render, fmtMin, ingText, servLabel, setSignature, loadFonts, loadImg, plain, runs };
})();
