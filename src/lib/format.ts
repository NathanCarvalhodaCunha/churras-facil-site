const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 12.9 → "R$ 12,90" */
export function formatPrice(value: number): string {
  return brl.format(value).replace(/ /g, ' ');
}

/** 500 → "500 g" · 1000 → "1 kg" · 1500 → "1,5 kg" */
export function formatWeight(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg` : `${grams} g`;
}

/** 5 → "5,0" */
export function formatDecimal(value: number, decimals = 0): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
