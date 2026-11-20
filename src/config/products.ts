/**
 * ============================================================================
 *  CARDÁPIO — categorias, produtos e preços
 * ============================================================================
 *  Fonte: catálogo da loja no WhatsApp (prints de 12/11/2026). A ordem dos
 *  produtos é a mesma do catálogo.
 *
 *  • name: nome exibido no site.
 *  • catalogName: nome exatamente como está no catálogo do WhatsApp — vai na
 *    mensagem do botão "Pedir pelo WhatsApp", para a loja achar o item.
 *  • brand / grams: marca e peso do pacote (só quando o catálogo informa).
 *    Produtos com 1 kg ou mais aparecem também na seção "Pacotes".
 *  • price: valor em reais (ex.: 31.9 → "R$ 31,90"). Use `null` para
 *    mostrar "Consulte o valor".
 *  • image: foto em /photos (sem extensão). Fotos "kp-…" são do site da Kispeto
 *    (kispeto.com.br, linha de espetinhos), do próprio espeto; fotos "st-…" são
 *    de banco de imagens (Unsplash e Wikimedia Commons) para os itens que a
 *    Kispeto não tem. Para trocar, salve a foto nova com o mesmo nome e rode
 *    `npm run images`. Créditos em photos/credits.json.
 *  • illustrative: true → a foto representa o tipo de produto, não o produto
 *    exato (ex.: pão de alho de banco de imagens no lugar do Santa Massa). O card
 *    mostra "Foto ilustrativa". Ao trocar pela foto real, apague essa linha.
 * ============================================================================
 */
import { formatWeight } from '../lib/format.ts';

export type CategoryId = 'bovinos' | 'frango' | 'suinos' | 'especiais' | 'queijos' | 'acompanhamentos';

export type CategoryIcon = 'beef' | 'drumstick' | 'ham' | 'sparkles' | 'cheese' | 'salad';

export interface Category {
  id: CategoryId;
  label: string;
  icon: CategoryIcon;
}

export interface Product {
  id: string;
  name: string;
  /** nome como está no catálogo do WhatsApp */
  catalogName: string;
  /** marca, quando o catálogo informa */
  brand?: string;
  /** peso do pacote em gramas, quando o catálogo informa */
  grams?: number;
  /** texto extra opcional (aparece abaixo da marca e do peso) */
  description?: string;
  /** preço em reais; null = "Consulte o valor" */
  price: number | null;
  /** a primeira categoria é a que aparece no card */
  categories: CategoryId[];
  /** chave da foto (arquivo em /photos) */
  image: string;
  /** true = foto de um espeto parecido, não do produto exato (mostra "Foto ilustrativa") */
  illustrative?: boolean;
  /** true = item demonstrativo (etiqueta "Exemplo" e preço "R$ --,--") */
  demo?: boolean;
}

export const categories: Category[] = [
  { id: 'bovinos', label: 'Bovinos', icon: 'beef' },
  { id: 'frango', label: 'Frango', icon: 'drumstick' },
  { id: 'suinos', label: 'Suínos', icon: 'ham' },
  { id: 'especiais', label: 'Especiais', icon: 'sparkles' },
  { id: 'queijos', label: 'Queijos', icon: 'cheese' },
  { id: 'acompanhamentos', label: 'Acompanhamentos', icon: 'salad' },
];

const KISPETO = 'Kispeto';

export const products: Product[] = [
  {
    id: 'kafta-queijo-bacon',
    name: 'Kafta com queijo e bacon',
    catalogName: 'Kafta com queijo e bacon 500 gramas kispeto',
    brand: KISPETO,
    grams: 500,
    price: 31.9,
    categories: ['especiais', 'bovinos'],
    image: 'st-kafta-queijo-bacon',
    illustrative: true,
  },
  {
    id: 'yaki-bovino',
    name: 'Yaki bovino',
    catalogName: 'Yaki bovino kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 33.9,
    categories: ['bovinos'],
    image: 'kp-yakitori-bovino',
  },
  {
    id: 'costela-suina',
    name: 'Costela suína',
    catalogName: 'Costela suina kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 31.9,
    categories: ['suinos'],
    image: 'kp-costelinha',
  },
  {
    id: 'linguica-apimentada',
    name: 'Linguiça apimentada',
    catalogName: 'Linguiça apimentada kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 20.9,
    categories: ['suinos'],
    image: 'kp-linguica-apimentada',
  },
  {
    id: 'abobrinha-queijo-coalho',
    name: 'Abobrinha com queijo coalho',
    catalogName: 'Abobrinha com queijo coalho',
    price: 31.9,
    categories: ['acompanhamentos', 'queijos'],
    image: 'st-abobrinha-queijo-coalho',
    illustrative: true,
  },
  {
    id: 'medalhao-romeu-julieta',
    name: 'Medalhão Romeu e Julieta',
    catalogName: 'Medalhão Romeu e Julieta',
    price: 33.9,
    categories: ['especiais'],
    image: 'st-medalhao-romeu-julieta',
    illustrative: true,
  },
  {
    id: 'pao-de-alho',
    name: 'Pão de alho',
    catalogName: 'Pao de alho Santa massa',
    brand: 'Santa Massa',
    price: 18.9,
    categories: ['acompanhamentos'],
    image: 'st-pao-de-alho',
    illustrative: true,
  },
  {
    id: 'mussarela-defumada',
    name: 'Mussarela defumada',
    catalogName: 'Mussarela defumada',
    price: 31.9,
    categories: ['queijos'],
    image: 'st-mussarela-defumada',
    illustrative: true,
  },
  {
    id: 'queijo-coalho',
    name: 'Queijo coalho',
    catalogName: 'Queijo coalho quata',
    brand: 'Quatá',
    price: 26.9,
    categories: ['queijos'],
    image: 'st-queijo-coalho',
    illustrative: true,
  },
  {
    id: 'abacaxi-canela',
    name: 'Espeto de abacaxi com canela',
    catalogName: 'Espeto de abacaxi com canela 700grs',
    grams: 700,
    price: 32.9,
    categories: ['acompanhamentos'],
    image: 'st-abacaxi-canela',
    illustrative: true,
  },
  {
    id: 'espeto-legumes',
    name: 'Espeto de legumes',
    catalogName: 'Espeto de legumes 600grs',
    grams: 600,
    price: 32.9,
    categories: ['acompanhamentos'],
    image: 'st-espeto-legumes',
    illustrative: true,
  },
  {
    id: 'medalhao-mandioca',
    name: 'Medalhão de mandioca',
    catalogName: 'Medalhão mandioca 350grs',
    grams: 350,
    price: 20.9,
    categories: ['especiais'],
    image: 'st-medalhao-mandioca',
    illustrative: true,
  },
  {
    id: 'medalhao-provolone',
    name: 'Medalhão de provolone',
    catalogName: 'Medalhão de provolone 350grs',
    grams: 350,
    price: 29.9,
    categories: ['especiais', 'queijos'],
    image: 'st-medalhao-provolone',
    illustrative: true,
  },
  {
    id: 'tulipa-frango-1kg',
    name: 'Tulipa de frango',
    catalogName: 'Tulipa de frango kispeto 1 kilo',
    brand: KISPETO,
    grams: 1000,
    price: 47.9,
    categories: ['frango'],
    image: 'kp-tulipa',
  },
  {
    id: 'coxa-frango-2kg',
    name: 'Coxa de frango',
    catalogName: 'Frango coxa 2 kilos kispeto',
    brand: KISPETO,
    grams: 2000,
    price: 77.9,
    categories: ['frango'],
    image: 'kp-coxa',
  },
  {
    id: 'coxa-frango-500g',
    name: 'Coxa de frango',
    catalogName: 'Frango coxa kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 20.9,
    categories: ['frango'],
    image: 'kp-coxa',
  },
  {
    id: 'coracao-1kg',
    name: 'Coração',
    catalogName: 'Coração 1 kilo kispeto',
    brand: KISPETO,
    grams: 1000,
    price: 63.9,
    categories: ['frango'],
    image: 'kp-coracao',
  },
  {
    id: 'coracao-500g',
    name: 'Coração',
    catalogName: 'Coração kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 32.9,
    categories: ['frango'],
    image: 'kp-coracao',
  },
  {
    id: 'kafta-500g',
    name: 'Kafta',
    catalogName: 'Kafta 500 gramas kispeto',
    brand: KISPETO,
    grams: 500,
    price: 23.9,
    categories: ['bovinos'],
    image: 'kp-kafta',
  },
  {
    id: 'kafta-1kg',
    name: 'Kafta',
    catalogName: 'Kafta 1 kilo kispeto',
    brand: KISPETO,
    grams: 1000,
    price: 45.9,
    categories: ['bovinos'],
    image: 'kp-kafta',
  },
  {
    id: 'bovino-alcatra-500g',
    name: 'Bovino (alcatra)',
    catalogName: 'Bovino 500 gramas kispeto (alcatra )',
    brand: KISPETO,
    grams: 500,
    price: 31.9,
    categories: ['bovinos'],
    image: 'kp-bovino',
  },
  {
    id: 'bovino-fraldinha-2kg',
    name: 'Bovino (fraldinha)',
    catalogName: 'Bovino 2 kilos kispeto ( fraldinha )',
    brand: KISPETO,
    grams: 2000,
    price: 117.9,
    categories: ['bovinos'],
    image: 'kp-bovino',
  },
  {
    id: 'bovino-1kg',
    name: 'Bovino',
    catalogName: 'Bovino 1 kilo kispeto',
    brand: KISPETO,
    grams: 1000,
    price: 62.9,
    categories: ['bovinos'],
    image: 'kp-bovino',
  },
  {
    id: 'costela-bovina',
    name: 'Costela bovina',
    catalogName: 'Costela bovina kispeto',
    brand: KISPETO,
    price: 31.9,
    categories: ['bovinos'],
    image: 'kp-costela-bovina',
  },
  {
    id: 'peito-frango-500g',
    name: 'Peito de frango',
    catalogName: 'Frango peito 500 gramas kispeto',
    brand: KISPETO,
    grams: 500,
    price: 20.9,
    categories: ['frango'],
    image: 'kp-peito',
  },
  {
    id: 'yaki-frango-500g',
    name: 'Yaki de frango',
    catalogName: 'Yaki de frango kispeto 500 gramas',
    brand: KISPETO,
    grams: 500,
    price: 25.9,
    categories: ['frango'],
    image: 'kp-yakitori-frango',
  },
  {
    id: 'cordeiro',
    name: 'Cordeiro',
    catalogName: 'Cordeiro',
    price: 45.9,
    categories: ['especiais'],
    image: 'kp-cordeiro',
  },
  {
    id: 'salsichao-alho-500g',
    name: 'Salsichão com alho',
    catalogName: 'Salsichao com alho 500 gramas kispeto',
    brand: KISPETO,
    grams: 500,
    price: 29.9,
    categories: ['suinos'],
    image: 'kp-salsichao',
  },
];

/** "Kispeto · 500 g" — marca e peso, quando houver */
export function productMeta(product: Product): string {
  return [product.brand, product.grams ? formatWeight(product.grams) : null].filter(Boolean).join(' · ');
}

/** Pacotes grandes (1 kg ou mais), do maior para o menor — usados na seção "Pacotes" */
export const bigPacks = products
  .filter((p) => (p.grams ?? 0) >= 1000)
  .sort((a, b) => (b.grams ?? 0) - (a.grams ?? 0));

/** Itens vendidos na loja além dos espetos (citados nas avaliações do Google) */
export const extras = ['Carvão', 'Gelo', 'Bebidas'];
