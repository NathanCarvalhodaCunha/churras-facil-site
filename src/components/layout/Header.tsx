import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { MotionToggle } from '../ui/MotionToggle';
import { Clock, MapPin, Menu, X } from 'lucide-react';
import { nav } from '../../config/content';
import { store, streetDisplay } from '../../config/store';
import { whatsappFor } from '../../lib/whatsapp';
import { groupHours } from '../../lib/hours';
import { cx } from '../../lib/format';
import { prefersReducedMotion } from '../../lib/gsap';
import { getLenis } from '../../lib/smoothScroll';
import { InstagramIcon, WhatsAppIcon } from '../ui/Icons';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const hoursSummary = groupHours(store.hours)
  .filter((g) => !g.closed)
  .map((g) => `${g.days}, ${g.time}`)
  .join(' · ');

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('inicio');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // fundo escuro ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // link ativo conforme a seção visível
  useEffect(() => {
    const sections = nav.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // menu mobile: trava a rolagem, isola o resto da página, Esc fecha
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    getLenis()?.stop();
    root.dataset.menu = 'open';
    const outside = [document.getElementById('conteudo'), document.querySelector('footer'), document.getElementById('wa-float')];
    outside.forEach((el) => el?.setAttribute('inert', ''));
    menuRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      getLenis()?.start();
      delete root.dataset.menu;
      outside.forEach((el) => el?.removeAttribute('inert'));
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!open) return;
    event.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(`#${id}`, { offset: -84 });
      else document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#conteudo"
        className="btn btn-primary btn-sm absolute top-3 left-3 z-[60] -translate-y-24 focus-visible:translate-y-0"
      >
        Pular para o conteúdo
      </a>

      <div
        className={cx(
          'relative z-10 transition-[background-color,box-shadow,border-color] duration-500',
          scrolled || open
            ? 'border-b border-white/[0.06] bg-char-950/85 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className={cx('container-site flex items-center justify-between gap-4 transition-[height] duration-500', scrolled ? 'h-[4.25rem]' : 'h-[4.75rem] lg:h-[5.5rem]')}>
          <a href="#inicio" className="relative shrink-0" aria-label={`${store.name} — voltar ao início`} onClick={(e) => goTo(e, 'inicio')}>
            <img
              src={`${BASE}/brand/logo-240.webp`}
              srcSet={`${BASE}/brand/logo-240.webp 240w, ${BASE}/brand/logo-480.webp 480w`}
              sizes="(min-width: 1024px) 120px, 92px"
              width={627}
              height={304}
              alt={store.fullName}
              className={cx('w-auto transition-[height] duration-500', scrolled ? 'h-10 lg:h-11' : 'h-11 lg:h-[3.6rem]')}
              decoding="async"
              fetchPriority="high"
            />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    className={cx(
                      'link-draw font-display py-2 text-[1.12rem] font-bold tracking-[0.08em] uppercase transition-colors',
                      active === item.id ? 'text-white' : 'text-smoke-300 hover:text-white',
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a className="btn btn-primary btn-sm max-[359px]:hidden" href={whatsappFor('general')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              Pedir agora
              <span className="sr-only">(abre o WhatsApp em nova aba)</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-full border border-white/15 text-smoke-100 transition hover:border-ember-400 active:scale-95 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {/* ☰ gira e vira X */}
              <span className={cx('menu-icon col-start-1 row-start-1', open && 'is-hidden')}>
                <Menu size={20} aria-hidden="true" />
              </span>
              <span className={cx('menu-icon menu-icon--close col-start-1 row-start-1', !open && 'is-hidden')}>
                <X size={20} aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* menu do celular e tablet: painel que desliza da direita para a esquerda (animação em index.css: .menu-drawer) */}
      <div id="menu-mobile" ref={menuRef} className="menu-drawer fixed inset-0 z-0 lg:hidden" data-open={open} inert={!open}>
        <div
          className="menu-drawer__backdrop absolute inset-0 bg-char-950/70 backdrop-blur-[2px]"
          onClick={() => {
            setOpen(false);
            toggleRef.current?.focus({ preventScroll: true });
          }}
          aria-hidden="true"
        />
        <div className="menu-drawer__panel grain absolute inset-y-0 right-0 flex w-[min(88vw,26rem)] flex-col overflow-y-auto border-l border-white/[0.08] bg-char-950 px-6 pt-24 pb-10 shadow-[-40px_0_80px_-30px_rgba(0,0,0,0.85)]">
          <nav aria-label="Menu">
            <ul className="flex flex-col">
              {nav.map((item, i) => {
                const current = active === item.id;
                return (
                  <li key={item.id} className="menu-drawer__item border-b border-white/[0.07]" style={{ '--i': i } as CSSProperties}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => goTo(e, item.id)}
                      aria-current={current ? 'true' : undefined}
                      className="group flex items-center justify-between gap-4 py-4 outline-none"
                    >
                      {/* mesmo efeito dos links do rodapé: o sublinhado se desenha e o texto clareia */}
                      <span
                        className={cx(
                          'link-draw display pb-1 text-[2.4rem] leading-none group-hover:text-white group-hover:[background-size:100%_2px] group-focus-visible:text-white group-focus-visible:[background-size:100%_2px] group-active:text-ember-300',
                          current ? 'text-white [background-size:100%_2px]' : 'text-smoke-300',
                        )}
                      >
                        {item.label}
                      </span>
                      <span
                        className={cx(
                          'text-sm font-semibold tabular-nums transition-[color,translate] duration-300 group-hover:-translate-x-1.5 group-hover:text-ember-400 group-focus-visible:text-ember-400',
                          current ? 'text-ember-400' : 'text-smoke-500',
                        )}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="menu-drawer__item mt-8" style={{ '--i': nav.length } as CSSProperties}>
            <a className="btn btn-primary w-full" href={whatsappFor('general')} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={20} />
              Faça seu pedido
              <span className="sr-only">(abre o WhatsApp em nova aba)</span>
            </a>
          </div>
          <div className="menu-drawer__item mt-8 space-y-3 text-sm text-smoke-400" style={{ '--i': nav.length + 1 } as CSSProperties}>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {streetDisplay} — {store.address.district}, {store.address.city}/{store.address.state} ({store.address.landmark})
            </p>
            <p className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {hoursSummary}
            </p>
            <a href={store.instagram.url} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-11 items-center gap-2 text-smoke-200 hover:text-white">
              <InstagramIcon size={16} />
              {store.instagram.handle}
            </a>
            <MotionToggle className="flex text-smoke-200" />
          </div>
        </div>
      </div>
    </header>
  );
}
