/**
 * Pré-renderização: transforma o React em HTML estático dentro de dist/index.html.
 * O conteúdo aparece antes do JavaScript carregar (melhor SEO e Lighthouse);
 * no navegador o React apenas "hidrata" esse HTML.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const entry = (await fs.readdir(ssrDir)).find((f) => /^entry-server\.(m?js)$/.test(f));
if (!entry) throw new Error('entry-server.js não encontrado em dist-ssr');

const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href);
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('Marcador <!--app-html--> não encontrado em dist/index.html');

let html = template.replace('<!--app-html-->', render());

// CSS embutido no HTML: elimina uma requisição que bloqueia a primeira pintura
const cssLink = html.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = await fs.readFile(path.join(dist, cssLink[1]), 'utf8');
  html = html.replace(cssLink[0], `<style>${css.replace(/\/\*# sourceMappingURL=[^*]+\*\//, '')}</style>`);
}

await fs.writeFile(path.join(dist, 'index.html'), html);
await fs.rm(ssrDir, { recursive: true, force: true });

console.log(`✓ index.html pré-renderizado (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, CSS embutido: ${cssLink ? 'sim' : 'não'})`);
