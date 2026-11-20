import { formatPrice, cx } from '../../lib/format';

interface PriceProps {
  value: number | null;
  demo?: boolean;
  tone?: 'dark' | 'paper';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { price: 'text-[1.6rem]', ask: 'text-[1.25rem]' },
  md: { price: 'text-[1.9rem]', ask: 'text-[1.55rem]' },
  lg: { price: 'text-[2.4rem]', ask: 'text-[1.9rem]' },
} as const;

/** Preço: valor real, placeholder "R$ --,--" (item de exemplo) ou "Consulte o valor" */
export function Price({ value, demo, tone = 'dark', size = 'md' }: PriceProps) {
  const big = sizes[size].price;
  if (value !== null) {
    return <p className={cx('display leading-none', big, tone === 'dark' ? 'text-ember-300' : 'text-ember-700')}>{formatPrice(value)}</p>;
  }
  if (demo) {
    return (
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1" title="Preço ainda não definido">
        <span className={cx('display leading-none', big, tone === 'dark' ? 'text-smoke-500' : 'text-ink-500/70')}>R$ --,--</span>
        <span className={cx('text-xs', tone === 'dark' ? 'text-smoke-400' : 'text-ink-500')}>valor a definir</span>
      </p>
    );
  }
  return <p className={cx('display leading-none', sizes[size].ask, tone === 'dark' ? 'text-smoke-200' : 'text-ink-800')}>Consulte o valor</p>;
}
