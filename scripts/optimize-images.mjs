/**
 * Otimização de imagens — gera AVIF + WebP responsivos a partir da pasta /photos.
 *
 * Como usar (troca de fotos):
 *   1. Coloque a nova foto em /photos com o MESMO nome da chave (ex.: photos/carne.jpg).
 *   2. (Opcional) Ajuste textos alternativos e créditos em photos/credits.json.
 *   3. Rode: npm run images
 *
 * Saídas:
 *   public/images/<chave>-<largura>.avif|webp   (várias larguras)
 *   src/data/images.json                         (dimensões, larguras e cor média — usado pelo <Picture />)
 *   logo, ícones e public/og-image.png           (no fim, via scripts/brand-assets.mjs)
 *   public/creditos.html                         (créditos das fotografias)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'photos');
const OUT = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'src', 'data', 'images.json');
const FORCE = process.argv.includes('--force');

/** larguras geradas por papel da imagem */
const WIDTHS = {
  bg: [768, 1280, 1920, 2400],
  feature: [480, 800, 1200, 1600],
  card: [400, 640, 960],
  /** miniaturas dos produtos (fotos do catálogo do WhatsApp) */
  thumb: [160, 320],
};

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.dirname(MANIFEST), { recursive: true });

const credits = JSON.parse(await fs.readFile(path.join(SRC, 'credits.json'), 'utf8').catch(() => '[]'));
const creditByKey = new Map(credits.map((c) => [c.key, c]));

const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
const manifest = {};

async function isFresh(src, out) {
  if (FORCE) return false;
  try {
    const [a, b] = await Promise.all([fs.stat(src), fs.stat(out)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

for (const file of files) {
  const key = file.replace(/\.[^.]+$/, '');
  const srcPath = path.join(SRC, file);
  const credit = creditByKey.get(key) ?? {};
  const role = credit.role ?? 'card';
  const meta = await sharp(srcPath).rotate().metadata();
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  const widths = WIDTHS[role].filter((w) => w <= width);
  if (!widths.length) widths.push(width);

  for (const w of widths) {
    const base = path.join(OUT, `${key}-${w}`);
    if ((await isFresh(srcPath, `${base}.avif`)) && (await isFresh(srcPath, `${base}.webp`))) continue;
    const pipeline = sharp(srcPath).rotate().resize({ width: w, withoutEnlargement: true });
    await pipeline.clone().avif({ quality: role === 'bg' ? 46 : 52, effort: 5 }).toFile(`${base}.avif`);
    await pipeline.clone().webp({ quality: role === 'bg' ? 68 : 74, effort: 5 }).toFile(`${base}.webp`);
  }

  const { dominant } = await sharp(srcPath).stats();
  const hex = '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  manifest[key] = { width, height, widths, color: hex, alt: credit.alt ?? '' };
  console.log(`✓ ${key.padEnd(16)} ${width}x${height}  [${widths.join(', ')}]`);
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

/* ---------- página de créditos ---------- */
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// fotos da própria loja ("own": true, ex.: as do catálogo do WhatsApp) não precisam de crédito
const rows = credits
  .filter((c) => manifest[c.key] && !c.own)
  .map(
    (c) =>
      `<li><strong>${esc(c.alt)}</strong><span>Foto: ${esc(c.author || 'autor desconhecido')} — <a href="${esc(c.page)}" rel="noopener noreferrer" target="_blank">${esc(c.source || 'fonte')}</a> · <a href="${esc(c.licenseUrl)}" rel="noopener noreferrer" target="_blank">${esc(c.license)}</a></span></li>`,
  )
  .join('\n      ');
const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Créditos das imagens | Churras Fácil</title>
  <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; background: #0d0a08; color: #e9e1d7; font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    main { max-width: 760px; margin: 0 auto; padding: 56px 20px 80px; }
    h1 { font-size: 28px; line-height: 1.2; margin: 0 0 8px; }
    p { color: #b3a89c; margin: 0 0 32px; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
    li { display: grid; gap: 2px; padding: 14px 16px; border: 1px solid #2a221c; border-radius: 12px; background: #15110e; }
    li span { color: #b3a89c; font-size: 14px; }
    a { color: #f08a3e; }
    .back { display: inline-block; margin-top: 32px; }
  </style>
</head>
<body>
  <main>
    <h1>Créditos das imagens</h1>
    <p>Fotos dos produtos: os espetos Kispeto usam as fotos do site da própria marca; os demais itens usam fotos ilustrativas de banco de imagens. Todas estão listadas abaixo, com a licença indicada.</p>
    <ul>
      ${rows}
    </ul>
    <p style="margin-top: 24px">Imagens adaptadas de obras sob CC BY-SA 4.0 (indicadas como “foto recortada”) são distribuídas sob a mesma licença, CC BY-SA 4.0.</p>
    <a class="back" href="/">← Voltar para o site</a> · <a class="back" href="/privacidade.html">Aviso de privacidade</a>
  </main>
</body>
</html>
`;
await fs.writeFile(path.join(ROOT, 'public', 'creditos.html'), html);
console.log('✓ creditos.html');

/* ---------- logo, ícones e imagem de compartilhamento ---------- */
await import('./brand-assets.mjs');
