/**
 * Chama `onEnter` uma única vez quando cada elemento chega na tela — o mesmo efeito de um
 * ScrollTrigger com `once: true` e `start: 'top 90%'`, mas usando IntersectionObserver:
 * o navegador avisa sozinho, sem o script medir a página (nada de reflow forçado no carregamento).
 *
 * Elementos que chegam juntos vêm no mesmo lote (para animar em cascata).
 * Os que já ficaram para trás (acima da tela) também entram logo na primeira leitura.
 *
 * @param start posição na altura da tela onde o topo do elemento dispara a entrada (0.9 = 90%)
 * @returns função que para de observar
 */
export function onceInView(targets: Element[], onEnter: (batch: HTMLElement[]) => void, start = 0.9): () => void {
  if (!targets.length || typeof IntersectionObserver === 'undefined') {
    if (targets.length) onEnter(targets as HTMLElement[]);
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      const batch: HTMLElement[] = [];
      for (const entry of entries) {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          io.unobserve(entry.target);
          batch.push(entry.target as HTMLElement);
        }
      }
      if (batch.length) onEnter(batch);
    },
    { rootMargin: `0px 0px ${-Math.round((1 - start) * 100)}% 0px` },
  );
  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** Roda `fn` quando o navegador estiver livre (ou depois de `timeout` ms). Devolve a função que cancela. */
export function whenIdle(fn: () => void, timeout = 1000): () => void {
  const w = window as IdleWindow;
  if (w.requestIdleCallback && w.cancelIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 120);
  return () => window.clearTimeout(id);
}
