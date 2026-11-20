/**
 * ============================================================================
 *  TEXTOS DO SITE — títulos e parágrafos de cada seção
 * ============================================================================
 *  Edite à vontade. Os diferenciais abaixo vêm do que a própria loja e os
 *  clientes informaram (Instagram e avaliações do Google).
 *  Números marcados com `value: null` são PLACEHOLDERS: troque pelo número real.
 * ============================================================================
 */

export const nav = [
  { id: 'inicio', label: 'Início' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'pacotes', label: 'Pacotes' },
  { id: 'sobre', label: 'Sobre nós' },
  { id: 'contato', label: 'Contato' },
] as const;

export const hero = {
  eyebrow: 'Distribuidora oficial Kispeto em Atibaia',
  titleTop: 'Churrasco fácil,',
  titleHighlight: 'sabor',
  titleBottom: 'de verdade.',
  lead: 'Espetos prontos para a brasa e tudo o que o seu churrasco pede, num só lugar. Escolha os seus e faça o pedido direto pelo WhatsApp.',
  primaryCta: 'Faça seu pedido',
  secondaryCta: 'Conheça nossos produtos',
  scrollHint: 'Role para girar o espeto',
  /** frases que aparecem enquanto o espeto gira (a última fica na tela) */
  beats: ['Escolha o espeto.', 'Acenda a brasa.', 'O resto é fácil.'],
  /** texto acima do botão que aparece com o espeto parado no centro */
  finalText: 'Escolha os seus espetos e chame a gente no WhatsApp.',
};

export interface Stat {
  /** número exibido; null = PLACEHOLDER (aparece como "00" com a etiqueta "a definir") */
  value: number | null;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note?: string;
}

export const about = {
  eyebrow: 'Sobre a Churras Fácil',
  title: 'Tudo pro seu churrasco, num só lugar.',
  lead: 'Somos distribuidora oficial Kispeto em Atibaia. Aqui você encontra espetos prontos para assar, do bovino ao cordeiro, de frango, suínos, medalhões, queijos e legumes, e ainda leva carvão, gelo e bebidas na mesma parada.',
  /** os itens com `value` real usam dados da configuração da loja e do cardápio (ver About.tsx) */
  stats: {
    years: { value: null, label: 'anos de experiência' } as Stat, // PLACEHOLDER
  },
  pillars: [
    {
      icon: 'badge',
      title: 'Distribuidora oficial',
      text: 'Trabalhamos com a linha de espetos Kispeto, prontos para ir direto à churrasqueira.',
    },
    {
      icon: 'leaf',
      title: 'Opções para todos',
      text: 'Bovino, frango, suíno, cordeiro, medalhões, queijos e espetos de legumes e de abacaxi com canela.',
    },
    {
      icon: 'calculator',
      title: 'Quantidade certa',
      text: 'Diga quantas pessoas vêm e a gente ajuda a calcular espetos e carvão.',
    },
  ],
};

export const productsSection = {
  eyebrow: 'Cardápio',
  title: 'Escolha seus espetos',
  lead: 'Os produtos e preços do nosso catálogo no WhatsApp. Filtre por categoria e peça direto por lá; a disponibilidade é confirmada no atendimento.',
  demoNotice: 'Itens marcados como “Exemplo” e valores “R$ --,--” são ilustrativos. Confirme pelo WhatsApp.',
  packagesLink: 'Pacotes de 1 e 2 kg',
  /** botão que mostra o restante dos produtos em "Todos" */
  moreCta: 'Ver todos os produtos',
  /** quantos produtos aparecem em "Todos" antes do botão acima */
  initialCount: 12,
  extrasTitle: 'Carvão, gelo e bebidas também',
  extrasText: 'Aproveite a parada e leve tudo para o churrasco de uma vez.',
  extrasCta: 'Consultar disponibilidade',
  /** faixa animada no topo do cardápio */
  marquee: ['Bovino', 'Kafta', 'Coração', 'Coxa de frango', 'Costela suína', 'Linguiça apimentada', 'Medalhões', 'Cordeiro', 'Queijo coalho', 'Pão de alho', 'Abacaxi com canela'],
};

export const packagesSection = {
  eyebrow: 'Para reunir a galera',
  title: 'Pacotes de 1 kg e 2 kg para o seu churrasco',
  lead: 'Vai receber a família, os amigos ou a empresa? Os espetos Kispeto também vêm em pacotes de 1 kg e 2 kg, para o churrasco render do começo ao fim.',
  packsTitle: 'Escolha o pacote',
  packagesCta: 'Perguntar sobre pacotes',
  planner: {
    title: 'Quantas pessoas vêm?',
    text: 'Conte o tamanho da festa e a gente ajuda a calcular espetos e carvão.',
    cta: 'Pedir sugestão pelo WhatsApp',
    /** versão curta do botão para celular */
    ctaShort: 'Pedir sugestão',
    min: 2,
    /** limite do contador: até 4 dígitos */
    max: 9999,
    initial: 15,
    /** atalhos fixos abaixo do contador */
    quick: [50, 100, 200, 400, 800],
  },
};

export const craft = {
  eyebrow: 'Por que Churras Fácil',
  title: 'Do balcão à brasa, sem complicação',
  blocks: [
    {
      title: 'Procedência que dá confiança',
      text: 'Como distribuidora oficial Kispeto, trabalhamos com uma linha de espetos feita para churrasco. Você leva para casa e é só acender a brasa.',
      image: 'churrasqueiro',
    },
    {
      title: 'Variedade para a mesa inteira',
      text: 'Da kafta ao cordeiro, do coração ao medalhão Romeu e Julieta, com queijo coalho, legumes e abacaxi com canela. Cada convidado escolhe o seu.',
      image: 'pimentoes',
    },
    {
      title: 'Carvão, gelo e bebidas na mesma parada',
      text: 'Nada de rodar a cidade antes do churrasco. Os espetos e o que vai em volta deles estão aqui.',
      image: 'carvao',
    },
    {
      title: 'Atendimento que entende de churrasco',
      text: 'Conte quantas pessoas vêm e a gente sugere a quantidade de espetos e de carvão para não faltar nem sobrar.',
      image: 'grelha-pinca',
    },
  ],
};

export const callToAction = {
  title: 'Seu churrasco começa com a escolha certa.',
  text: 'Escolha seus espetos, chame a gente no WhatsApp e deixe o resto com a brasa.',
  cta: 'Faça seu pedido agora',
};

export const contact = {
  eyebrow: 'Contato',
  title: 'Venha até a loja',
  text: 'Estamos dentro do Posto Shell da Av. Dona Gertrudes, em Atibaia. Passe para escolher seus espetos ou peça pelo WhatsApp.',
  mapButton: 'Carregar mapa',
  mapNote: 'O mapa é exibido pelo Google Maps.',
};

export const footer = {
  description:
    'Distribuidora oficial Kispeto em Atibaia/SP. Espetos prontos para a brasa, carvão, gelo e bebidas para o seu churrasco.',
};
