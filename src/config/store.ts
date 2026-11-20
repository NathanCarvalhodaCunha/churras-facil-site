/**
 * ============================================================================
 *  CONFIGURAÇÃO DA LOJA — dados comerciais centralizados
 * ============================================================================
 *  Altere aqui e o site inteiro é atualizado (cabeçalho, rodapé, contato,
 *  botões de WhatsApp, SEO e dados estruturados do Google).
 *
 *  Origem dos dados já preenchidos: perfil da Churras Fácil no Google e no
 *  Instagram (@churrasfaciloficial_), enviados pelo cliente.
 *
 *  Procure por "CONFIRMAR" e "PLACEHOLDER" antes de publicar o site.
 * ============================================================================
 */

export interface DayHours {
  /** 0 = domingo, 1 = segunda ... 6 = sábado */
  day: number;
  label: string;
  short: string;
  /** "HH:MM" — deixe sem `open`/`close` para dias fechados */
  open?: string;
  close?: string;
}

export interface StoreConfig {
  name: string;
  fullName: string;
  slogan: string;
  distributorOf: string;
  siteUrl: string;
  whatsapp: { number: string; display: string; catalogUrl: string };
  phone: { display: string; href: string };
  instagram: { handle: string; url: string };
  address: {
    street: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    landmark: string;
  };
  mapsQuery: string;
  timezone: string;
  hours: DayHours[];
  hoursNote: string;
  google: { rating: number; reviews: number; checkedAt: string; url: string };
}

export const store: StoreConfig = {
  name: 'Churras Fácil',
  fullName: 'Churras Fácil — Churrasco & Cia',
  slogan: 'Agora está fácil fazer seu churrasco!',
  /** Bio do Instagram: "Distribuidora Oficial Kispeto" */
  distributorOf: 'Kispeto',

  /**
   * Endereço do site publicado, sem barra no final (ativa link canônico, sitemap.xml e a imagem de compartilhamento).
   * Ao ligar um domínio próprio na Vercel, troque aqui. Ex.: 'https://www.churrasfacil.com.br'
   */
  siteUrl: 'https://churras-facil.vercel.app',

  whatsapp: {
    /**
     * Somente dígitos: 55 (Brasil) + DDD + número.
     * Confirmado: o link wa.me/c/551144122447 abre "o catálogo de CHURRAS FÁCIL no WhatsApp".
     */
    number: '551144122447',
    display: '(11) 4412-2447',
    /** catálogo da loja no WhatsApp (pelo número funciona no celular e no computador) */
    catalogUrl: 'https://wa.me/c/551144122447',
  },

  phone: {
    display: '(11) 4412-2447',
    href: 'tel:+551144122447',
  },

  instagram: {
    handle: '@churrasfaciloficial_',
    url: 'https://www.instagram.com/churrasfaciloficial_/',
  },

  address: {
    street: 'Av. Dona Gertrudes, 915 B',
    district: 'Alvinópolis',
    city: 'Atibaia',
    state: 'SP',
    postalCode: '12942-540',
    country: 'BR',
    landmark: 'Dentro do Posto Shell',
  },

  /** Texto usado nos links do Google Maps ("Como chegar" e mapa) */
  mapsQuery: 'Churras Fácil, Av. Dona Gertrudes, 915 B - Alvinópolis, Atibaia - SP, 12942-540',

  timezone: 'America/Sao_Paulo',

  /** Horário de funcionamento (Google, nov/2026) */
  hours: [
    { day: 1, label: 'Segunda-feira', short: 'Seg' },
    { day: 2, label: 'Terça-feira', short: 'Ter', open: '09:00', close: '21:00' },
    { day: 3, label: 'Quarta-feira', short: 'Qua', open: '09:00', close: '21:00' },
    { day: 4, label: 'Quinta-feira', short: 'Qui', open: '09:00', close: '21:00' },
    { day: 5, label: 'Sexta-feira', short: 'Sex', open: '09:00', close: '21:00' },
    { day: 6, label: 'Sábado', short: 'Sáb', open: '09:00', close: '21:00' },
    /** CONFIRMAR — o Google exibiu 09:00–15:00 na semana do feriado de 15/11 ("os horários podem ser diferentes") */
    { day: 0, label: 'Domingo', short: 'Dom', open: '09:00', close: '15:00' },
  ],
  hoursNote: 'Horários podem variar em feriados.',

  /** Nota pública no Google (nov/2026). Atualize quando mudar. */
  google: {
    rating: 5.0,
    reviews: 7,
    /** mês em que a nota foi conferida (aparece ao lado da nota na seção Sobre) */
    checkedAt: 'nov/2026',
    url: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Churras Fácil Atibaia'),
  },
};

/** Rua para exibir no site: o complemento fica grudado no número ("915 B" nunca quebra a linha entre o 915 e o B) */
export const streetDisplay = store.address.street.replace(/(\d+) (?=\S+$)/, '$1\u00A0');

/** Endereço em uma linha */
export const addressLine = `${store.address.street} — ${store.address.district}, ${store.address.city}/${store.address.state}`;

/** Link "Como chegar" */
export const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(store.mapsQuery);

/** Mapa incorporado (carregado somente quando o visitante clica em "Carregar mapa") */
export const mapEmbedUrl = 'https://www.google.com/maps?q=' + encodeURIComponent(store.mapsQuery) + '&output=embed';
