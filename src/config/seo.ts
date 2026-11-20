/**
 * SEO — título, descrição, imagem de compartilhamento e dados estruturados.
 * Este arquivo é lido no build (vite.config.ts) e injetado no <head> do index.html.
 */
import { store } from './store.ts';
import { products } from './products.ts';

const rating = store.google.rating.toFixed(1).replace('.', ',');
const street = store.address.street.split(',')[0];

export const seo = {
  /** aba do navegador e resultado do Google */
  title: 'Churras Fácil | Espetinhos Kispeto e pacotes de espetos em Atibaia/SP',
  /** resultado do Google (até ~155 caracteres) */
  description: `Distribuidora oficial Kispeto em Atibaia: ${products.length} tipos de espetinho (bovino, frango, suíno, cordeiro e queijos) e pacotes de 1 e 2 kg. Peça pelo WhatsApp.`,
  /**
   * Prévia do link no WhatsApp, Facebook, Instagram e X.
   * O WhatsApp mostra o título em negrito e cerca de duas linhas da descrição: o mais importante vem primeiro.
   */
  shareTitle: 'Churras Fácil — Espetinhos Kispeto em Atibaia/SP',
  shareDescription: `Distribuidora oficial Kispeto: ${products.length} tipos de espetinho e pacotes de 1 e 2 kg. ★ ${rating} no Google · ${street}, ${store.address.city} · Peça pelo WhatsApp!`,
  /** gerada por `npm run brand`. Troque o ?v= ao mudar a imagem: o WhatsApp guarda a prévia antiga pelo endereço */
  ogImage: '/og-image.png?v=3',
  ogImageAlt: 'Logo da Churras Fácil — Churrasco & Cia',
  themeColor: '#0d0a08',
  locale: 'pt_BR',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Dados estruturados (schema.org) para o Google */
export function buildJsonLd() {
  const base = store.siteUrl.replace(/\/$/, '');
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    alternateName: store.fullName,
    description: seo.description,
    telephone: store.phone.href.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address.street,
      addressLocality: store.address.city,
      addressRegion: store.address.state,
      postalCode: store.address.postalCode,
      addressCountry: store.address.country,
    },
    openingHoursSpecification: store.hours
      .filter((h) => h.open && h.close)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayNames[h.day]}`,
        opens: h.open,
        closes: h.close,
      })),
    sameAs: [store.instagram.url],
  };
  if (base) {
    data.url = base + '/';
    data.image = base + seo.ogImage;
    data.logo = base + '/icon-512.png';
  }
  return data;
}

/** Tags do <head> geradas a partir da configuração */
export function buildHeadTags(): string {
  const base = store.siteUrl.replace(/\/$/, '');
  const image = base ? base + seo.ogImage : seo.ogImage;
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="theme-color" content="${seo.themeColor}" />`,
    `<meta name="format-detection" content="telephone=no" />`,
    `<meta name="application-name" content="${esc(store.name)}" />`,
    `<meta name="apple-mobile-web-app-title" content="${esc(store.name)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${seo.locale}" />`,
    `<meta property="og:site_name" content="${esc(store.name)}" />`,
    `<meta property="og:title" content="${esc(seo.shareTitle)}" />`,
    `<meta property="og:description" content="${esc(seo.shareDescription)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    ...(image.startsWith('https://') ? [`<meta property="og:image:secure_url" content="${esc(image)}" />`] : []),
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.shareTitle)}" />`,
    `<meta name="twitter:description" content="${esc(seo.shareDescription)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(seo.ogImageAlt)}" />`,
  ];
  if (base) {
    tags.push(`<link rel="canonical" href="${esc(base)}/" />`, `<meta property="og:url" content="${esc(base)}/" />`);
  }
  tags.push(`<script type="application/ld+json">${JSON.stringify(buildJsonLd()).replace(/</g, '\\u003c')}</script>`);
  return tags.join('\n    ');
}
