// Rasteriza public/maps/beleriand-base.svg em PNG (2x) para virar WebP.
// O SVG tem filtros pesados (turbulência, relevo) que travavam o zoom quando
// desenhados ao vivo; a imagem pronta deixa a câmera leve.
// Uso: node scripts/raster_map.cjs <svg> <png> <largura> <altura> <escala>
// Requer o Playwright com Chromium instalado.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [src, out, W, H, dpr] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +dpr });
  const svg = fs.readFileSync(src, 'utf8');
  await p.setContent(`<html><body style="margin:0;background:#000"><img id=m style="display:block;width:${W}px;height:${H}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
  await p.waitForFunction(() => document.getElementById('m').complete);
  await p.waitForTimeout(500);
  await p.screenshot({ path: out, fullPage: false, omitBackground: true });
  await b.close();
})();
