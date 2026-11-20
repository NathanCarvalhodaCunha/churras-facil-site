import { useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Clock, MapPin, Star } from 'lucide-react';
import { hero } from '../../config/content';
import { store } from '../../config/store';
import { whatsappFor } from '../../lib/whatsapp';
import { groupHours } from '../../lib/hours';
import { formatDecimal } from '../../lib/format';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap';
import { Picture } from '../ui/Picture';
import { BrushStroke, WhatsAppIcon } from '../ui/Icons';
import { SkewerStage, type StageStatus } from '../three/SkewerStage';
import { TornEdge } from '../ui/TornEdge';

const mainHours = groupHours(store.hours).find((g) => !g.closed);
/** atraso da animação de entrada (variável CSS --d) */
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [stage, setStage] = useState<StageStatus>('idle');

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const mm = gsap.matchMedia();

      // A entrada do Hero (textos e botões) é feita em CSS (.hero-in / .hero-line): aparece no primeiro paint.
      // 'all': o espeto 3D e as frases acompanham a rolagem mesmo com "movimento reduzido" no sistema
      // (Efeitos de animação desligados no Windows) — a loja quer o 3D funcionando em qualquer computador
      mm.add('all', () => {
        // ——— rolagem: progresso do espeto 3D ———
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
        progressRef.current = trigger.progress;

        // ——— rolagem: texto sai, frases aparecem enquanto o espeto gira ———
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        });
        tl.to(q('[data-hero="copy"]'), { autoAlpha: 0, y: -70, duration: 0.16 }, 0.03)
          .to(q('[data-hero="scroll-wrap"]'), { autoAlpha: 0, duration: 0.05 }, 0)
          .to(q('.hero-bg-photo'), { autoAlpha: 0.45, duration: 0.4 }, 0.3);

        // frases que acompanham o giro; a última fica na tela junto com o espeto centralizado
        const beats = q('[data-beat]');
        beats.forEach((beat, i) => {
          const at = 0.13 + i * 0.2;
          tl.fromTo(beat, { autoAlpha: 0, y: 34, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.07 }, at);
          if (i < beats.length - 1) tl.to(beat, { autoAlpha: 0, y: -34, duration: 0.06 }, at + 0.13);
        });

        // chamada final abaixo do espeto parado no centro
        tl.fromTo(q('[data-hero="final"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.63);
        tl.set({}, {}, 1);
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="inicio" className="hero-section bg-char-950" aria-labelledby="hero-title">
      {/* borda rasgada (carvão sobre o papel da seção "Sobre"): o espeto pousa sobre ela no fim da rolagem */}
      <TornEdge color="var(--color-char-950)" seed={21} position="bottom" />
      <div ref={stickyRef} className="hero-sticky">
        {/* fundo: brasas e vinheta */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-bg-photo absolute inset-x-0 bottom-0 h-[64%] lg:h-[74%]">
            <Picture
              image="hero-brasas"
              alt=""
              sizes="100vw"
              priority
              className="block h-full w-full"
              imgClassName="h-full w-full object-cover opacity-80"
              position="50% 62%"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0908_0%,rgba(11,9,8,0.94)_34%,rgba(11,9,8,0.6)_62%,rgba(11,9,8,0.42)_82%,#0b0908_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,9,8,0.85)_0%,rgba(11,9,8,0.3)_45%,transparent_70%)] max-lg:hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_70%_64%,rgba(226,98,31,0.2),transparent_70%)]" />
          <div className="grain absolute inset-0" />
        </div>

        <SkewerStage progressRef={progressRef} anchorRef={anchorRef} stickyRef={stickyRef} onStatus={setStage} />

        <div className="container-site relative z-20 h-full pt-[5.75rem] pb-[6.5rem] lg:pt-28 lg:pb-16">
          <div className="hero-grid">
            <div className="hero-copy max-w-[40rem] self-start lg:self-end" data-hero="copy">
              <p className="eyebrow hero-in" style={delay(0.1)} data-hero="eyebrow">
                {hero.eyebrow}
              </p>
              <h1 id="hero-title" className="display hero-title mt-5 text-smoke-100 lg:mt-6">
                <span className="line-mask">
                  <span data-hero="line" className="hero-line" style={delay(0.18)}>
                    {hero.titleTop}
                  </span>
                </span>
                <span className="line-mask">
                  <span data-hero="line" className="hero-line" style={delay(0.3)}>
                    <span className="highlight">
                      {hero.titleHighlight}
                      <BrushStroke />
                    </span>{' '}
                    {hero.titleBottom}
                  </span>
                </span>
              </h1>
              <p
                className="hero-in mt-6 max-w-[33rem] text-[1.0625rem] leading-relaxed text-smoke-300 text-pretty md:text-lg"
                style={delay(0.5)}
                data-hero="lead"
              >
                {hero.lead}
              </p>
            </div>

            <div ref={anchorRef} className="hero-stage relative" aria-hidden="true">
              {stage === 'fallback' && (
                <Picture
                  image="carne"
                  alt=""
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="photo-frame fade-mask-soft absolute inset-0 block"
                  imgClassName="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="hero-actions lg:pt-9" data-hero="copy">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap" data-hero="cta">
                <a
                  className="btn btn-primary hero-in max-[379px]:px-5 max-[379px]:text-[1.05rem]"
                  style={delay(0.62)}
                  href={whatsappFor('general')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic
                >
                  <WhatsAppIcon size={20} />
                  {hero.primaryCta}
                  <span className="sr-only">(abre o WhatsApp em nova aba)</span>
                </a>
                <a className="btn btn-ghost hero-in max-[379px]:px-5 max-[379px]:text-[1.05rem]" style={delay(0.7)} href="#produtos">
                  {hero.secondaryCta}
                  <ArrowRight className="btn-arrow" size={18} aria-hidden="true" />
                </a>
              </div>
              <ul className="hero-in mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-smoke-400" style={delay(0.82)} data-hero="meta">
                <li>
                  <a
                    href={store.google.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw inline-flex items-center gap-1.5 py-1 text-smoke-300 hover:text-white"
                  >
                    <Star size={15} className="fill-ember-400 text-ember-400" aria-hidden="true" />
                    <strong className="font-semibold text-smoke-100">{formatDecimal(store.google.rating, 1)}</strong> no Google
                    <span className="text-smoke-400">({store.google.reviews} avaliações)</span>
                  </a>
                </li>
                {mainHours && (
                  <li className="inline-flex items-center gap-1.5">
                    <Clock size={15} aria-hidden="true" />
                    {mainHours.days}, {mainHours.time}
                  </li>
                )}
                <li className="inline-flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" />
                  {store.address.landmark} · {store.address.city}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* frases que acompanham o giro do espeto */}
        <div className="beats pointer-events-none absolute inset-x-0 top-[15%] z-20 text-center lg:top-[13%]" aria-hidden="true">
          {hero.beats.map((beat, i) => (
            <p
              key={beat}
              data-beat={i}
              className={`beat display absolute inset-x-0 mx-auto px-5 text-[clamp(2.4rem,1.2rem+5vw,6rem)] ${i === hero.beats.length - 1 ? 'text-ember-400' : 'text-smoke-100'}`}
            >
              {beat}
            </p>
          ))}
        </div>

        {/* chamada final: aparece quando o espeto termina de girar e fica parado no centro */}
        <div data-hero="final" className="hero-final absolute inset-x-0 bottom-[10%] z-20 flex flex-col items-center gap-5 px-5 text-center md:bottom-[9%]">
          <p className="max-w-md text-[1rem] text-smoke-200 text-balance md:text-lg">{hero.finalText}</p>
          <a className="btn btn-primary btn-lg" href={whatsappFor('general')} target="_blank" rel="noopener noreferrer" data-magnetic>
            <WhatsAppIcon size={22} />
            {hero.primaryCta}
            <span className="sr-only">(abre o WhatsApp em nova aba)</span>
          </a>
        </div>

        <div data-hero="scroll-wrap" className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:block">
          <div
            data-hero="scroll"
            className="hero-in flex flex-col items-center gap-3 text-[0.7rem] font-semibold tracking-[0.22em] text-smoke-400 uppercase"
            style={delay(1.2)}
          >
            <span>{hero.scrollHint}</span>
            <span className="scroll-cue-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
