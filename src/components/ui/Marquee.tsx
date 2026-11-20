import { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from '../../lib/gsap';
import { cx } from '../../lib/format';
import { isMotionPaused, onMotionPause } from '../../lib/motionPause';
import { SkewerIcon } from './Icons';

/**
 * Faixa de texto em movimento contínuo. A velocidade acompanha a rolagem
 * (e inverte o sentido quando a página sobe). Decorativa: aria-hidden.
 */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tween = gsap.to(trackRef.current, { xPercent: -50, ease: 'none', duration: 42, repeat: -1 });
        tween.pause();
        let onScreen = false;
        // só anda com a faixa na tela e com as animações liberadas ("Pausar animações" no rodapé)
        const sync = () => (onScreen && !isMotionPaused() ? tween.play() : tween.pause());
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            onScreen = self.isActive;
            sync();
          },
          onUpdate: (self) => {
            if (isMotionPaused()) return;
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 260, 5);
            gsap.to(tween, { timeScale: self.direction * boost, duration: 0.25, overwrite: true });
            gsap.to(tween, { timeScale: self.direction, duration: 1.4, delay: 0.3 });
          },
        });
        return onMotionPause(sync);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const row = (copy: number) => (
    <div className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12" key={copy}>
      {items.map((item, i) => (
        <Fragment key={`${copy}-${item}`}>
          <span
            className={cx(
              'display text-[clamp(2.6rem,1.6rem+4.2vw,6.4rem)] leading-none whitespace-nowrap',
              i % 2 === 0 ? 'text-smoke-100' : 'text-transparent [-webkit-text-stroke:1.5px_rgba(240,138,62,0.75)]',
            )}
          >
            {item}
          </span>
          <SkewerIcon size={34} className="shrink-0 text-ember-500" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div ref={rootRef} className={cx('relative overflow-hidden py-6 select-none md:py-8', className)} aria-hidden="true">
      <div ref={trackRef} className="flex w-max will-change-transform">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
