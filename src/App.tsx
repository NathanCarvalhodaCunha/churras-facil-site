import { Suspense, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Products } from './components/sections/Products';
import { Packages } from './components/sections/Packages';
import { Craft } from './components/sections/Craft';
import { CallToAction } from './components/sections/CallToAction';
import { Contact } from './components/sections/Contact';
import { IconSprite } from './components/ui/Icons';
import { gsap, ScrollTrigger, MOTION_OK } from './lib/gsap';
import { onceInView, whenIdle } from './lib/inView';
import { initSmoothScroll } from './lib/smoothScroll';

/**
 * Animações globais ligadas à rolagem (todas desligadas com "movimento reduzido"):
 *  [data-split]       título que entra palavra por palavra
 *  [data-reveal]      bloco que sobe e aparece
 *  [data-reveal-x]    bloco que entra pela lateral (valor 1 = direita, -1 = esquerda)
 *  [data-reveal-img]  foto revelada por uma "cortina" + zoom
 *  [data-parallax]    foto com parallax dentro da moldura
 *  [data-line]        linha que se desenha
 *  [data-draw-y]      linha vertical que cresce com a rolagem
 *  [data-magnetic]    botão que acompanha o cursor (só com mouse)
 */
function useScrollAnimations() {
  useEffect(() => {
    let mm: ReturnType<typeof gsap.matchMedia> | null = null;

    // Montado quando o navegador fica livre, depois da hidratação: o primeiro paint e o toque nos
    // botões não esperam por isso. As entradas usam IntersectionObserver (sem medir a página);
    // só os efeitos que acompanham a rolagem (parallax, linha vertical) usam ScrollTrigger.
    const setup = () => {
      mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const stops: Array<() => void> = [];

        const splits = gsap.utils.toArray<HTMLElement>('[data-split]');
        // y: 0 explícito + clearProps no fim: nenhum deslocamento antigo (ex.: de uma recarga do código) deixa o título escondido
        // 150%: a palavra desce o bastante para nem o acento (Á, Ê, Ó) aparecer antes da animação
        splits.forEach((el) => gsap.set(el.querySelectorAll('.split-word'), { y: 0, yPercent: 150 }));
        stops.push(
          onceInView(splits, (batch) =>
            batch.forEach((el) =>
              gsap.to(el.querySelectorAll('.split-word'), {
                y: 0,
                yPercent: 0,
                duration: 1.05,
                ease: 'power4.out',
                stagger: 0.055,
                overwrite: 'auto',
                clearProps: 'transform',
              }),
            ),
          ),
        );

        const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
        gsap.set(reveals, { autoAlpha: 0, y: 36 });
        stops.push(
          // 'auto' (e não true): só interrompe animações das mesmas propriedades — o traço do selo (.eyebrow) continua
          onceInView(reveals, (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, overwrite: 'auto' })),
        );

        const fromSide = gsap.utils.toArray<HTMLElement>('[data-reveal-x]');
        fromSide.forEach((el) => gsap.set(el, { x: 70 * Number(el.dataset.revealX || 1), autoAlpha: 0 }));
        stops.push(onceInView(fromSide, (batch) => gsap.to(batch, { x: 0, autoAlpha: 1, duration: 1.15, ease: 'power3.out' }), 0.86));

        const frames = gsap.utils.toArray<HTMLElement>('[data-reveal-img]');
        gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0%)' });
        stops.push(
          onceInView(
            frames,
            (batch) =>
              batch.forEach((frame) => {
                gsap.to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'power4.inOut' });
                const img = frame.querySelector('img');
                if (img) gsap.fromTo(img, { scale: 1.32 }, { scale: 1, duration: 1.8, ease: 'power3.out' });
              }),
            0.88,
          ),
        );

        // o selo do hero já desenha o traço em CSS (.eyebrow.hero-in)
        const eyebrows = gsap.utils.toArray<HTMLElement>('.eyebrow:not(.hero-in)');
        gsap.set(eyebrows, { '--dash': 0 });
        stops.push(onceInView(eyebrows, (batch) => gsap.to(batch, { '--dash': 1, duration: 1, ease: 'power3.out', delay: 0.15 }), 0.92));

        const lines = gsap.utils.toArray<HTMLElement>('[data-line]');
        gsap.set(lines, { scaleX: 0, transformOrigin: 'left center' });
        stops.push(onceInView(lines, (batch) => gsap.to(batch, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }), 0.92));

        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((img) => {
          const frame = img.closest('.photo-frame') ?? img.parentElement ?? img;
          gsap.fromTo(
            img,
            { yPercent: -6 },
            { yPercent: 6, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-draw-y]').forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0 },
            { scaleY: 1, transformOrigin: 'top center', ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 55%', scrub: true } },
          );
        });

        // botões magnéticos: só com mouse
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((btn) => {
            const xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3' });
            const yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3' });
            const move = (e: PointerEvent) => {
              const r = btn.getBoundingClientRect();
              xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
              yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
            };
            const leave = () => {
              xTo(0);
              yTo(0);
            };
            btn.addEventListener('pointermove', move);
            btn.addEventListener('pointerleave', leave);
            stops.push(() => {
              btn.removeEventListener('pointermove', move);
              btn.removeEventListener('pointerleave', leave);
            });
          });
        }

        return () => stops.forEach((fn) => fn());
      });
    };

    const cancelSetup = whenIdle(setup, 1200);
    // fotos e fontes mudam a altura das seções: recalcula as posições dos efeitos de rolagem quando terminam
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => {
      cancelSetup();
      window.removeEventListener('load', refresh);
      mm?.revert();
    };
  }, []);
}

export function App() {
  useScrollAnimations();
  useEffect(() => initSmoothScroll(), []);

  return (
    <div className="overflow-x-clip">
      <IconSprite />
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Hero />
        {/* cada seção é hidratada em uma tarefa separada (menos travamento no carregamento) */}
        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Products />
        </Suspense>
        <Suspense fallback={null}>
          <Packages />
        </Suspense>
        <Suspense fallback={null}>
          <Craft />
        </Suspense>
        <Suspense fallback={null}>
          <CallToAction />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <FloatingWhatsApp />
    </div>
  );
}
