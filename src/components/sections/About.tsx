import { BadgeCheck, Calculator, Leaf, Star } from 'lucide-react';
import { about, type Stat } from '../../config/content';
import { store } from '../../config/store';
import { bigPacks, products } from '../../config/products';
import { openDaysPerWeek } from '../../lib/hours';
import { cx, formatDecimal } from '../../lib/format';
import { Counter } from '../ui/Counter';
import { Picture } from '../ui/Picture';
import { SectionHeading } from '../ui/SectionHeading';

const pillarIcons = { badge: BadgeCheck, leaf: Leaf, calculator: Calculator } as const;

/**
 * Estatísticas: vêm da configuração da loja e do cardápio. "Anos de experiência" só aparece quando tiver
 * o número real em content.ts (sem número, o item fica fora do site — nada de "00" publicado).
 */
const stats: (Stat & { icon?: 'star' })[] = [
  {
    value: store.google.rating,
    decimals: 1,
    label: 'nota no Google',
    // mês em que a nota foi conferida: a nota muda com o tempo
    note: `${store.google.reviews} avaliações · ${store.google.checkedAt}`,
    icon: 'star',
  },
  { value: products.length, label: 'produtos no catálogo' },
  {
    value: openDaysPerWeek(store.hours),
    label: 'dias por semana de portas abertas',
  },
  ...packStat(),
  ...(about.stats.years.value === null ? [] : [about.stats.years]),
];

/**
 * Maior pacote do cardápio e quantos pacotes grandes existem (1 kg ou mais), calculados dos próprios
 * produtos (products.ts): muda sozinho quando o cardápio muda.
 */
function packStat(): Stat[] {
  const largest = Math.max(0, ...products.map((p) => p.grams ?? 0));
  if (largest < 1000 || !bigPacks.length) return [];
  const kg = (grams: number) => formatDecimal(grams / 1000, grams % 1000 === 0 ? 0 : 1);
  const sizes = [...new Set(bigPacks.map((p) => p.grams ?? 0))].sort((a, b) => a - b).map(kg);
  const sizesText = sizes.length > 1 ? `${sizes.slice(0, -1).join(', ')} e ${sizes[sizes.length - 1]} kg` : `${sizes[0]} kg`;
  return [
    {
      value: largest / 1000,
      decimals: largest % 1000 === 0 ? 0 : 1,
      suffix: ' kg',
      label: 'o maior pacote, para festas e eventos',
      note: `${bigPacks.length} pacotes de ${sizesText} no cardápio`,
    },
  ];
}

function StatItem({ stat }: { stat: Stat & { icon?: 'star' } }) {
  const placeholder = stat.value === null;
  return (
    <div className="relative flex flex-col gap-3 pt-5" data-reveal>
      <span className="absolute inset-x-0 top-0 h-px bg-ink-900/20" data-line aria-hidden="true" />
      <p className={cx('display flex items-start gap-2 text-[clamp(3.4rem,2.4rem+3vw,5.4rem)] leading-[0.82] font-light', placeholder ? 'text-ink-900/30' : 'text-ink-900')}>
        {placeholder ? (
          <span aria-hidden="true">
            00{stat.suffix}
          </span>
        ) : (
          <Counter value={stat.value!} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} />
        )}
        {stat.icon === 'star' && <Star className="mt-2 fill-ember-600 text-ember-600" size={26} aria-hidden="true" />}
      </p>
      <p className="max-w-[12rem] text-[0.95rem] leading-snug font-semibold text-ink-700">
        {stat.label}
        {stat.note && <span className="block text-sm font-normal text-ink-500">{stat.note}</span>}
        {placeholder && (
          <span className="mt-2 inline-block rounded-full border border-dashed border-ink-500/60 px-2.5 py-0.5 text-[0.7rem] font-bold tracking-[0.14em] text-ink-500 uppercase">
            a definir
          </span>
        )}
      </p>
    </div>
  );
}

export function About() {
  return (
    <section id="sobre" className="paper on-paper relative z-10" aria-labelledby="sobre-title">
      {/* a borda rasgada desta divisa é desenhada no fim do Hero */}
      <div className="container-site relative pt-24 pb-24 md:pt-32 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <SectionHeading id="sobre-title" eyebrow={about.eyebrow} title={about.title} lead={about.lead} tone="paper" />

            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:mt-16 lg:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatItem key={stat.label} stat={stat} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div
              className="photo-frame aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-40px_rgba(40,22,10,0.55)] sm:aspect-[16/11] lg:aspect-[4/5]"
              data-reveal-img
            >
              <Picture
                image="espetos-mesa"
                alt="Espetinhos grelhados servidos com molhos e legumes"
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="block h-full w-full"
                imgClassName="h-full w-full scale-[1.12] object-cover"
                parallax
              />
            </div>
          </div>
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-20">
          {about.pillars.map((pillar) => {
            const Icon = pillarIcons[pillar.icon as keyof typeof pillarIcons];
            return (
              <li key={pillar.title} className="flex gap-4 rounded-[20px] border border-ink-900/10 bg-paper-50/70 p-6" data-reveal>
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-900 text-ember-400">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="display text-[1.55rem] leading-none text-ink-900">{pillar.title}</h3>
                  <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-700">{pillar.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
