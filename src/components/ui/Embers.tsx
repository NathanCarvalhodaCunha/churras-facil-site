import type { CSSProperties } from 'react';
import { cx } from '../../lib/format';

/** posições determinísticas (iguais no servidor e no navegador) */
function makeEmbers(count: number, seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    x: Math.round(rnd() * 100),
    delay: +(rnd() * 9).toFixed(2),
    duration: +(6 + rnd() * 7).toFixed(2),
    size: +(2 + rnd() * 4).toFixed(1),
    drift: Math.round((rnd() - 0.5) * 160),
  }));
}

const EMBERS = makeEmbers(22, 1337);

/** Fagulhas subindo (CSS puro, leve). Desligadas com movimento reduzido. */
export function Embers({ className }: { className?: string }) {
  return (
    <div className={cx('embers pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      {EMBERS.map((e, i) => (
        <span
          key={i}
          style={
            {
              '--x': `${e.x}%`,
              '--delay': `${e.delay}s`,
              '--dur': `${e.duration}s`,
              '--size': `${e.size}px`,
              '--drift': `${e.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
