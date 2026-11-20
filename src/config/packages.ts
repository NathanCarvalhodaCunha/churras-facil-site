/**
 * ============================================================================
 *  PACOTES — seção "Para reunir a galera"
 * ============================================================================
 *  Os cards de pacotes são montados sozinhos a partir do cardápio
 *  (src/config/products.ts): todo produto com 1 kg ou mais aparece ali, com o
 *  mesmo preço e a mesma foto. Para incluir ou tirar um pacote, edite o
 *  produto no cardápio.
 *
 *  Aqui ficam só as ocasiões exibidas acima da calculadora de pessoas.
 * ============================================================================
 */

/** Ocasiões exibidas na seção de pacotes */
export const occasions = [
  { label: 'Reunião de família', icon: 'home' },
  { label: 'Aniversários e festas', icon: 'party' },
  { label: 'Futebol com os amigos', icon: 'trophy' },
  { label: 'Eventos de empresa', icon: 'briefcase' },
] as const;
