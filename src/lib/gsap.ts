import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * Classe .force-motion no <html> (index.html): as animações rodam mesmo com "movimento reduzido" ligado no
 * sistema (Efeitos de animação desligados no Windows) — pedido da loja. Sem a classe, o site volta a respeitar
 * essa preferência (tudo parado e visível).
 */
const forcedMotion = typeof document !== 'undefined' && document.documentElement.classList.contains('force-motion');

/** media query usada em todas as animações: só anima quem não pediu movimento reduzido */
export const MOTION_OK = forcedMotion ? 'all' : '(prefers-reduced-motion: no-preference)';

export function prefersReducedMotion(): boolean {
  if (forcedMotion || typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger, Flip, useGSAP };
