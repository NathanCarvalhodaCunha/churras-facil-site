/**
 * Mensagens enviadas para o WhatsApp — uma para cada tipo de botão.
 * Use {chaves} para os trechos que o site preenche automaticamente.
 */
export const whatsappMessages = {
  /** Botões gerais: "Faça seu pedido", "Pedir agora", botão flutuante */
  general: 'Olá! Gostaria de conhecer os produtos e fazer um pedido.',
  /** Botão de cada produto — {produto} = nome do produto */
  product: 'Olá! Tenho interesse no produto {produto}. Poderia me passar mais informações?',
  /** Botão geral da seção de pacotes */
  packages: 'Olá! Gostaria de saber quais pacotes de 1 kg e 2 kg vocês têm disponíveis.',
  /** Calculadora "Quantas pessoas?" — {pessoas} = número escolhido */
  planner: 'Olá! Vou fazer um churrasco para {pessoas} pessoas. Podem me ajudar a calcular a quantidade de espetos e de carvão?',
  /** Faixa "carvão, gelo e bebidas" */
  extras: 'Olá! Vocês têm carvão, gelo e bebidas disponíveis hoje?',
} as const;

export type MessageKey = keyof typeof whatsappMessages;
