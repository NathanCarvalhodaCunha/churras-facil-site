import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

let lenis: Lenis | null = null;

/** instância ativa (só existe em computador, com movimento liberado) */
export function getLenis(): Lenis | null {
  return lenis;
}

/**
 * Rolagem suave (Lenis) sincronizada com o GSAP/ScrollTrigger.
 * Fica desligada em telas de toque (a rolagem nativa do celular já é suave)
 * e para quem pediu movimento reduzido.
 */
export function initSmoothScroll(): () => void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => undefined;
  if (window.matchMedia('(pointer: coarse)').matches) return () => undefined;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: { offset: -84 },
    autoRaf: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
