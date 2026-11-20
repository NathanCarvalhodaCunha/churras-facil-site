import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { buildHeadTags } from './src/config/seo.ts';
import { store } from './src/config/store.ts';
import images from './src/data/images.json' with { type: 'json' };

/**
 * Injeta no index.html as tags de SEO geradas a partir de src/config,
 * pré-carrega a fonte de títulos e a imagem do topo, e gera robots.txt / sitemap.xml.
 */
function siteHead(): Plugin {
  return {
    name: 'churras-site-head',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let head = buildHeadTags();

        // Pré-carrega a imagem de fundo do topo (AVIF responsivo)
        const hero = images['hero-brasas'];
        if (hero) {
          const base = '/images/hero-brasas';
          const srcset = hero.widths.map((w) => `${base}-${w}.avif ${w}w`).join(', ');
          head += `\n    <link rel="preload" as="image" type="image/avif" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high" />`;
        }

        // Pré-carrega as fontes (só no build, quando os arquivos têm hash)
        if (ctx.bundle) {
          const fonts = Object.keys(ctx.bundle).filter((f) => /(big-shoulders-display|manrope)-latin-wght-normal.*\.woff2$/.test(f));
          for (const f of fonts) {
            head += `\n    <link rel="preload" as="font" type="font/woff2" href="/${f}" crossorigin />`;
          }
        }
        return html.replace('<!--site-head-->', head);
      },
    },
    generateBundle() {
      const base = store.siteUrl.replace(/\/$/, '');
      const robots = ['User-agent: *', 'Allow: /', 'Disallow: /creditos.html'];
      if (base) robots.push(`Sitemap: ${base}/sitemap.xml`);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' });
      if (base) {
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n</urlset>\n`,
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteHead()],
  ssr: {
    noExternal: ['gsap', '@gsap/react'],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    strictPort: true,
    // pastas sincronizadas (OneDrive, Google Drive) nem sempre avisam quando um arquivo muda:
    // a verificação periódica garante que o navegador recarregue a cada alteração salva
    watch: { usePolling: true, interval: 300 },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
