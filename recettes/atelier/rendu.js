// Rend chaque dessin en deux passes (aplats de couleur / traits d'encre) en PNG transparents.
// Usage : node rendu.js <dessins.js> <dossier_sortie> [ids...]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const [src, out, ...only] = process.argv.slice(2);
const INK = '#4A3426';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const code = fs.readFileSync(src, 'utf8');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 600, height: 600 } });
  const fontDir = 'file://' + path.resolve(__dirname, '../fonts');
  await p.setContent(`<html><head><style>
    @font-face{font-family:Fraunces;src:url(${fontDir}/fraunces.woff2);font-weight:100 900}
    @font-face{font-family:FrauncesI;src:url(${fontDir}/fraunces-italic.woff2);font-weight:100 900}
    @font-face{font-family:Apple;src:url(file://${path.resolve(__dirname)}/homemade-apple.woff2)}
    html,body{margin:0;background:transparent} svg{width:600px;height:600px;display:block}
    .fill .nf{display:none}
    .line .np, .line [stroke=none]{display:none}
    .line *{fill:none!important;stroke:${INK}!important;stroke-width:1.05!important}
    .line .fine, .line .fine *{stroke-width:.6!important}
    .line text, .line text *{fill:${INK}!important;stroke:none!important}
    .line .wfill{fill:${INK}!important;stroke:none!important}
  </style></head><body><div id="h"></div><script>${code}</script></body></html>`, { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const ids = await p.evaluate((only) => DESSINS.filter((d) => !only.length || only.includes(d.id)).map((d) => d.id), only);
  for (const id of ids) {
    for (const pass of ['fill', 'line']) {
      await p.evaluate(([id, pass]) => {
        const d = DESSINS.find((x) => x.id === id);
        document.getElementById('h').innerHTML = `<svg class="${pass}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${d.defs || ''}</defs><g ${pass === 'fill' ? 'stroke="none"' : ''} stroke-linejoin="round" stroke-linecap="round">${d.art}</g></svg>`;
      }, [id, pass]);
      await p.locator('svg').screenshot({ path: `${out}/${id}.${pass}.png`, omitBackground: true });
    }
  }
  fs.writeFileSync(`${out}/_meta.json`, JSON.stringify(await p.evaluate(() => DESSINS.map(({ id, name, cat, kw }) => ({ id, name, cat, kw })))));
  await b.close();
  console.log('rendu', ids.length);
})();
