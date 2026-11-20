import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Beef, ChevronDown, Drumstick, Ham, Info, LayoutGrid, Package, Salad, Snowflake, Sparkles } from 'lucide-react';
import { categories, extras, productMeta, products, type CategoryId, type Product } from '../../config/products';
import { productsSection } from '../../config/content';
import { whatsappFor } from '../../lib/whatsapp';
import { cx } from '../../lib/format';
import { Flip, gsap, ScrollTrigger, useGSAP, MOTION_OK, prefersReducedMotion } from '../../lib/gsap';
import { onceInView } from '../../lib/inView';
import { Picture } from '../ui/Picture';
import { Price } from '../ui/Price';
import { SectionHeading } from '../ui/SectionHeading';
import { TornEdge } from '../ui/TornEdge';
import { Marquee } from '../ui/Marquee';
import { CheeseIcon, WhatsAppIcon } from '../ui/Icons';

const categoryIcons = {
  beef: Beef,
  drumstick: Drumstick,
  ham: Ham,
  sparkles: Sparkles,
  cheese: CheeseIcon,
  salad: Salad,
} as const;

type Filter = 'todos' | CategoryId;

function ProductCard({ product, hidden }: { product: Product; hidden: boolean }) {
  const category = categories.find((c) => c.id === product.categories[0]);
  const meta = productMeta(product);
  return (
    // o invólucro não tem classes de display: assim .is-filtered (display: none) funciona e o Flip anima a saída
    <div data-card="" data-flip-id={product.id} className={cx(hidden && 'is-filtered')}>
      {/* card compacto: foto 4:3 à esquerda (fotos da Kispeto e do catálogo) e botão embaixo */}
      <article className="group relative grid h-full grid-cols-[6rem_minmax(0,1fr)] gap-x-3.5 overflow-hidden rounded-[18px] border border-white/[0.07] bg-char-850 p-3 transition-[translate,border-color,box-shadow] duration-500 ease-[var(--ease-out-quart)] hover:-translate-y-[4px] hover:border-ember-500/40 hover:shadow-[0_26px_60px_-32px_rgba(226,98,31,0.6)] min-[360px]:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-4 sm:p-3.5 md:grid-cols-[7.5rem_minmax(0,1fr)] xl:grid-cols-[9rem_minmax(0,1fr)]">
        <div className="photo-frame aspect-[4/3] self-start rounded-[12px] bg-white/[0.04]">
          <Picture
            image={product.image}
            alt={meta ? `${product.name}, ${meta}` : product.name}
            sizes="(min-width: 1280px) 144px, (min-width: 768px) 120px, 112px"
            className="block h-full w-full"
          />
          {product.demo && (
            <span className="absolute top-1.5 left-1.5 rounded-full border border-dashed border-smoke-300/70 bg-char-950/80 px-1.5 py-0.5 text-[0.56rem] font-bold tracking-[0.12em] text-smoke-100 uppercase backdrop-blur-sm">
              Exemplo
            </span>
          )}
          {product.illustrative && (
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-char-950/85 to-transparent px-1.5 pt-3 pb-1 text-[0.66rem] leading-none font-semibold text-smoke-100">
              Foto ilustrativa
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col py-0.5">
          {category && <span className="mb-1.5 text-[0.66rem] font-bold tracking-[0.16em] text-ember-300 uppercase">{category.label}</span>}
          <h3 className="display text-[1.4rem] leading-[0.95] text-smoke-100 sm:text-[1.5rem]">{product.name}</h3>
          {meta && <p className="mt-1.5 text-[0.86rem] font-semibold text-smoke-300">{meta}</p>}
          {product.description && <p className="mt-1 text-[0.86rem] leading-snug text-smoke-400">{product.description}</p>}
          <div className="mt-auto pt-2.5">
            <Price value={product.price} demo={product.demo} size="sm" />
          </div>
        </div>
        <a
          className="btn btn-wa btn-sm col-span-2 mt-3 w-full"
          href={whatsappFor('product', { produto: product.catalogName })}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} />
          Pedir pelo WhatsApp
          <span className="sr-only">
            : {product.name}
            {meta ? ` (${meta})` : ''} — abre em nova aba
          </span>
        </a>
      </article>
    </div>
  );
}

export function Products() {
  const [filter, setFilter] = useState<Filter>('todos');
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  /** para de observar a entrada em cascata (chamada antes do Flip) */
  const stopReveal = useRef<(() => void) | null>(null);
  const focusAfterExpand = useRef(false);

  // em "Todos" aparecem os primeiros produtos e um botão mostra o restante
  const limit = productsSection.initialCount;
  const matching = products.filter((p) => filter === 'todos' || p.categories.includes(filter));
  const shown = filter === 'todos' && !expanded ? matching.slice(0, limit) : matching;
  const shownIds = new Set(shown.map((p) => p.id));
  const hiddenCount = matching.length - shown.length;
  const hasDemo = shown.some((p) => p.demo);
  const counts = useMemo(() => {
    const map = new Map<Filter, number>([['todos', products.length]]);
    categories.forEach((c) => map.set(c.id, products.filter((p) => p.categories.includes(c.id)).length));
    return map;
  }, []);

  const chips: { id: Filter; label: string; Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }> }[] = [
    { id: 'todos', label: 'Todos', Icon: LayoutGrid },
    ...categories.map((c) => ({ id: c.id as Filter, label: c.label, Icon: categoryIcons[c.icon] })),
  ];

  /** antes de mudar a grade: termina a entrada em cascata e guarda as posições para o Flip */
  const prepareFlip = () => {
    const grid = gridRef.current;
    if (!grid) return;
    stopReveal.current?.();
    stopReveal.current = null;
    const cards = grid.querySelectorAll('[data-card]');
    gsap.killTweensOf(cards);
    gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
    if (!prefersReducedMotion()) flipState.current = Flip.getState(cards);
  };

  const changeFilter = (id: Filter) => {
    if (id === filter) return;
    prepareFlip();
    setFilter(id);
  };

  const showAll = () => {
    prepareFlip();
    focusAfterExpand.current = true;
    setExpanded(true);
  };

  // o botão "Ver todos" some: o foco vai para o primeiro produto que apareceu
  // (com animação, os cards novos só ficam visíveis — e focáveis — no fim do Flip)
  const focusFirstNew = () => {
    if (!focusAfterExpand.current) return;
    const link = gridRef.current?.querySelectorAll<HTMLElement>('[data-card]:not(.is-filtered)')[limit]?.querySelector<HTMLElement>('a');
    if (!link) return;
    link.focus({ preventScroll: true });
    if (document.activeElement === link) focusAfterExpand.current = false;
  };

  useEffect(() => {
    if (expanded) focusFirstNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  // entrada dos cards em cascata (uma vez, ao chegar na seção)
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>('[data-card]:not(.is-filtered)', gridRef.current);
        gsap.set(cards, { autoAlpha: 0, y: 60, scale: 0.96 });
        stopReveal.current = onceInView(
          cards,
          (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
          0.92,
        );
      });
      return () => {
        stopReveal.current?.();
        stopReveal.current = null;
        mm.revert();
      };
    },
    { scope: sectionRef },
  );

  // troca de categoria ou "Ver todos": os cards deslizam para as novas posições (GSAP Flip)
  useGSAP(
    () => {
      const state = flipState.current;
      if (!state || !gridRef.current) return;
      flipState.current = null;
      Flip.from(state, {
        targets: gridRef.current.querySelectorAll('[data-card]'),
        duration: 0.7,
        ease: 'power3.inOut',
        absolute: true,
        scale: true,
        onEnter: (els) =>
          gsap.fromTo(els, { autoAlpha: 0, scale: 0.88, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04, delay: 0.12 }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.88, duration: 0.32, ease: 'power2.in' }),
        onComplete: () => {
          ScrollTrigger.refresh();
          focusFirstNew();
        },
      });
    },
    { dependencies: [filter, expanded], scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="produtos" className="grain relative z-10 bg-char-900" aria-labelledby="produtos-title">
      <TornEdge color="var(--color-char-900)" seed={42} />
      <Marquee items={productsSection.marquee} className="border-b border-white/[0.06]" />
      <div className="container-site relative pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col gap-7 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="produtos-title" eyebrow={productsSection.eyebrow} title={productsSection.title} lead={productsSection.lead} />
          <div className="flex flex-wrap gap-3 lg:shrink-0 lg:justify-end" data-reveal>
            <a href="#pacotes" className="btn btn-ghost max-[379px]:px-5 max-[379px]:text-[1.05rem]">
              <Package size={18} aria-hidden="true" />
              {productsSection.packagesLink}
            </a>
          </div>
        </div>

        {/* celular: filtros em duas colunas, todos à vista · a partir de 640px: uma linha que quebra quando precisa */}
        <div
          className="mt-10 grid grid-cols-2 gap-2 sm:mt-12 sm:flex sm:flex-wrap sm:gap-2.5"
          role="toolbar"
          aria-label="Filtrar produtos por categoria"
          data-reveal
        >
          {chips.map(({ id, label, Icon }, index) => {
            const active = filter === id;
            // número ímpar de filtros: o último ocupa a linha inteira no celular
            const lastAlone = chips.length % 2 === 1 && index === chips.length - 1;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => changeFilter(id)}
                className={cx(
                  'inline-flex min-h-11 min-w-0 items-center gap-2 rounded-full border py-1.5 pr-4 pl-3.5 text-left text-[0.88rem] leading-tight font-semibold transition-[background-color,border-color,color,translate,scale] duration-300 active:scale-[0.96] sm:shrink-0 sm:px-4 sm:py-0 sm:text-[0.92rem]',
                  lastAlone && 'col-span-2',
                  active
                    ? 'border-ember-500 bg-ember-600 text-white'
                    : 'border-white/12 bg-white/[0.03] text-smoke-300 hover:-translate-y-px hover:border-ember-400/60 hover:text-white',
                )}
              >
                {/* em telas muito estreitas (< 360px) o ícone sai para o nome caber */}
                <span className="grid shrink-0 place-items-center max-[359px]:hidden">
                  <Icon size={17} aria-hidden={true} />
                </span>
                <span className="min-w-0 flex-1 sm:flex-none">{label}</span>
                <span className={cx('text-xs tabular-nums', active ? 'text-white/80' : 'text-smoke-500')}>{counts.get(id)}</span>
              </button>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {shown.length} produtos exibidos
        </p>

        {/* só aparece se algum produto estiver marcado como exemplo (demo: true) */}
        {hasDemo && (
          <p className="mt-6 flex items-start gap-2 text-sm text-smoke-400">
            <Info size={16} className="mt-0.5 shrink-0 text-ember-400" aria-hidden="true" />
            {productsSection.demoNotice}
          </p>
        )}

        <div ref={gridRef} className="relative mt-6 grid gap-3 sm:mt-8 md:grid-cols-2 md:gap-4 xl:grid-cols-3 xl:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} hidden={!shownIds.has(product.id)} />
          ))}
        </div>

        {hiddenCount > 0 && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={showAll} className="btn btn-ghost max-[379px]:px-5 max-[379px]:text-[1.05rem]">
              {productsSection.moreCta} ({matching.length})
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        <div
          className="mt-14 flex flex-col gap-6 rounded-[22px] border border-white/[0.08] bg-[linear-gradient(120deg,rgba(201,74,28,0.16),rgba(29,24,20,0.6)_55%)] p-6 sm:p-8 md:flex-row md:items-center md:justify-between"
          data-reveal
        >
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-char-950/70 text-ember-300">
              <Snowflake size={22} aria-hidden="true" />
            </span>
            <div>
              <h3 className="display text-[1.9rem] leading-none text-smoke-100">{productsSection.extrasTitle}</h3>
              <p className="mt-2 text-smoke-300">{productsSection.extrasText}</p>
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Itens disponíveis">
                {extras.map((item) => (
                  <li key={item} className="rounded-full border border-white/12 px-3 py-1 text-sm text-smoke-200">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a className="btn btn-primary shrink-0" href={whatsappFor('extras')} target="_blank" rel="noopener noreferrer" data-magnetic>
            <WhatsAppIcon size={20} />
            {productsSection.extrasCta}
            <span className="sr-only">(abre o WhatsApp em nova aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
