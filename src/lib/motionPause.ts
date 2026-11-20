import { useEffect, useState } from 'react';

/**
 * "Pausar animações" (acessibilidade, WCAG 2.2.2): para tudo o que se move sozinho e sem parar —
 * faixa de produtos, brasas, fumaça e balanço do espeto 3D, pulso do botão do WhatsApp.
 * O que acompanha a rolagem continua funcionando (só se move quando a pessoa rola a página).
 *
 * A escolha fica guardada só neste navegador (localStorage, chave abaixo) para valer na próxima visita.
 * O index.html lê a mesma chave antes da página aparecer, para não piscar animação.
 */
export const MOTION_PAUSE_KEY = 'cf-motion-paused';

type Listener = (paused: boolean) => void;
const listeners = new Set<Listener>();
let paused: boolean | null = null;

export function isMotionPaused(): boolean {
  if (paused === null) {
    try {
      paused = typeof localStorage !== 'undefined' && localStorage.getItem(MOTION_PAUSE_KEY) === '1';
    } catch {
      paused = false;
    }
  }
  return paused;
}

export function setMotionPaused(next: boolean): void {
  paused = next;
  document.documentElement.classList.toggle('motion-paused', next);
  try {
    if (next) localStorage.setItem(MOTION_PAUSE_KEY, '1');
    else localStorage.removeItem(MOTION_PAUSE_KEY);
  } catch {
    /* navegação privada: vale só enquanto a página estiver aberta */
  }
  listeners.forEach((fn) => fn(next));
}

export function onMotionPause(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** estado para os botões (começa "tocando" no HTML pré-renderizado e se ajusta depois da hidratação) */
export function useMotionPaused(): [boolean, (next: boolean) => void] {
  const [state, setState] = useState(false);
  useEffect(() => {
    setState(isMotionPaused());
    return onMotionPause(setState);
  }, []);
  return [state, setMotionPaused];
}
