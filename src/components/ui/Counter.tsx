import { useRef } from 'react';
import { gsap, useGSAP, MOTION_OK } from '../../lib/gsap';
import { onceInView } from '../../lib/inView';
import { formatDecimal } from '../../lib/format';

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/** Número que conta de 0 até o valor quando entra na tela */
export function Counter({ value, decimals = 0, prefix = '', suffix = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = `${prefix}${formatDecimal(value, decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const state = { v: 0 };
        const render = () => {
          el.textContent = `${prefix}${formatDecimal(state.v, decimals)}${suffix}`;
        };
        render();
        const stop = onceInView([el], () => gsap.to(state, { v: value, duration: 1.8, ease: 'power3.out', onUpdate: render }));
        return () => {
          stop();
          el.textContent = final;
        };
      });
      return () => mm.revert();
    },
    { dependencies: [value, decimals, prefix, suffix] },
  );

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </>
  );
}
