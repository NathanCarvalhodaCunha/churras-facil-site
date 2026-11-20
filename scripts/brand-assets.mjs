/**
 * Arquivos de marca gerados a partir do logo (public/brand/logo-churras-facil.png).
 *
 * Como usar: npm run brand   (também roda no fim de `npm run images`)
 *
 * Saídas:
 *   public/brand/logo-240.webp, logo-480.webp     (cabeçalho e rodapé)
 *   public/favicon.ico                            (ícone da aba: 16, 32 e 48 px)
 *   public/apple-touch-icon.png                   (atalho na tela do iPhone, 180 px)
 *   public/icon-192.png, icon-512.png,
 *   public/icon-maskable-512.png                  (atalho no Android, lidos pelo site.webmanifest)
 *   public/og-image.png                           (prévia do link no WhatsApp, Facebook etc.: só o logo, fundo transparente, 1200x630)
 *
 * Para trocar o logo: substitua public/brand/logo-churras-facil.png (PNG com fundo transparente) e rode o comando.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(ROOT, 'public');
const LOGO = path.join(PUB, 'brand', 'logo-churras-facil.png');

/* ---------- logo do cabeçalho e do rodapé ---------- */
for (const w of [240, 480]) {
  await sharp(LOGO).resize({ width: w }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(PUB, 'brand', `logo-${w}.webp`));
}
console.log('✓ logo-240.webp, logo-480.webp');

/* ---------- ícones: o logo sobre o carvão do site, com um brilho de brasa no centro ---------- */
const tile = (size, radius) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
      '<defs><radialGradient id="g" cx="50%" cy="46%" r="68%">' +
      '<stop offset="0" stop-color="#3b1e10"/><stop offset="0.6" stop-color="#1a0f0a"/><stop offset="1" stop-color="#0b0908"/>' +
      '</radialGradient></defs>' +
      `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)"/></svg>`,
  );

/**
 * @param {number} size   lado do ícone em px
 * @param {number} scale  largura do logo em relação ao lado
 * @param {number} radius canto arredondado (0 = quadrado cheio, para iPhone e ícone "maskable")
 */
async function icon(size, scale, radius) {
  let logo = sharp(LOGO).resize({ width: Math.round(size * scale), kernel: 'lanczos3' });
  // nos tamanhos de aba o logo fica com poucos pixels: um leve reforço de nitidez ajuda a ler o desenho
  if (size <= 48) logo = logo.sharpen({ sigma: 0.6 });
  const buf = await logo.png().toBuffer();
  const m = await sharp(buf).metadata();
  return sharp(tile(size, radius))
    .composite([{ input: buf, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** .ico com imagens PNG dentro (aceito por todos os navegadores atuais) */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, png }, i) => {
    const o = 6 + i * 16;
    head.writeUInt8(size >= 256 ? 0 : size, o);
    head.writeUInt8(size >= 256 ? 0 : size, o + 1);
    head.writeUInt16LE(1, o + 4); // planos
    head.writeUInt16LE(32, o + 6); // bits por pixel
    head.writeUInt32LE(png.length, o + 8);
    head.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.png)]);
}

const favicons = [
  { size: 16, png: await icon(16, 0.98, 3) },
  { size: 32, png: await icon(32, 0.96, 6) },
  { size: 48, png: await icon(48, 0.94, 9) },
];
await fs.writeFile(path.join(PUB, 'favicon.ico'), ico(favicons));
await fs.writeFile(path.join(PUB, 'apple-touch-icon.png'), await icon(180, 0.84, 0));
await fs.writeFile(path.join(PUB, 'icon-192.png'), await icon(192, 0.88, 42));
await fs.writeFile(path.join(PUB, 'icon-512.png'), await icon(512, 0.88, 112));
// "maskable": o Android recorta em círculo/gota, então o logo fica dentro da zona segura (80% central)
await fs.writeFile(path.join(PUB, 'icon-maskable-512.png'), await icon(512, 0.7, 0));
console.log('✓ favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png');

/* ---------- prévia do link (WhatsApp, Facebook, Instagram, X): só o logo, fundo transparente ---------- */
// O WhatsApp mostra a imagem inteira (1200x630) ou só um quadrado recortado do centro:
// o logo fica todo dentro do quadrado central de 630x630 para aparecer inteiro nos dois casos.
{
  const W = 1200;
  const H = 630;
  const logo = await sharp(LOGO).resize({ width: 580 }).png().toBuffer();
  const lm = await sharp(logo).metadata();
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, left: Math.round((W - lm.width) / 2), top: Math.round((H - lm.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUB, 'og-image.png'));
  const kb = Math.round((await fs.stat(path.join(PUB, 'og-image.png'))).size / 1024);
  // acima de ~300 KB o WhatsApp pode deixar a prévia sem imagem
  console.log(`✓ og-image.png (${kb} KB)${kb > 290 ? ' — ATENÇÃO: acima de 290 KB' : ''}`);
}
