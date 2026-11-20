import { useState } from 'react';
import { Briefcase, House, Minus, PartyPopper, Plus, Trophy } from 'lucide-react';
import { occasions } from '../../config/packages';
import { bigPacks } from '../../config/products';
import { packagesSection } from '../../config/content';
import { whatsappFor } from '../../lib/whatsapp';
import { cx } from '../../lib/format';
import { Picture } from '../ui/Picture';
import { Price } from '../ui/Price';
import { SectionHeading } from '../ui/SectionHeading';
import { TornEdge } from '../ui/TornEdge';
import { WhatsAppIcon } from '../ui/Icons';

const occasionIcons = { home: House, party: PartyPopper, trophy: Trophy, briefcase: Briefcase } as const;

/** "Quantas pessoas vêm?" — monta a mensagem do WhatsApp com o número escolhido */
function PartyPlanner() {
  const { planner } = packagesSection;
  const [raw, setRaw] = useState(String(planner.initial));
  const clamp = (n: number) => Math.min(planner.max, Math.max(planner.min, Math.round(n)));
  const people = clamp(Number.parseInt(raw, 10) || planner.min);
  const set = (n: number) => setRaw(String(clamp(n)));
  /** quantos dígitos o campo aceita (max 9999 → 4) */
  const maxDigits = String(planner.max).length;
  const stepButton =
    'grid size-12 shrink-0 place-items-center rounded-full border border-white/15 text-smoke-100 transition hover:border-ember-400 hover:text-ember-300 active:scale-95 disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className="rounded-[22px] bg-ink-900 p-5 text-smoke-100 shadow-[0_30px_60px_-36px_rgba(29,22,18,0.8)] sm:p-7" data-reveal>
      <h3 className="display text-[2rem] leading-none">{planner.title}</h3>
      <p className="mt-2.5 text-[0.97rem] text-smoke-400">{planner.text}</p>

      <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <button type="button" onClick={() => set(people - 1)} disabled={people <= planner.min} className={stepButton} aria-label="Diminuir número de pessoas">
          <Minus size={18} aria-hidden="true" />
        </button>
        <label htmlFor="planner-people" className="sr-only">
          Número de pessoas (até {planner.max.toLocaleString('pt-BR')})
        </label>
        <input
          id="planner-people"
          type="number"
          inputMode="numeric"
          min={planner.min}
          max={planner.max}
          value={raw}
          onChange={(e) => setRaw(e.target.value.replace(/[^\d]/g, '').slice(0, maxDigits))}
          onBlur={() => setRaw(String(people))}
          className="display h-14 w-[6.5rem] rounded-xl border border-white/10 bg-char-950/60 text-center text-[2.2rem] text-white tabular-nums [appearance:textfield] focus:border-ember-400 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button type="button" onClick={() => set(people + 1)} disabled={people >= planner.max} className={stepButton} aria-label="Aumentar número de pessoas">
          <Plus size={18} aria-hidden="true" />
        </button>
        <span className="text-smoke-300">pessoas</span>
      </div>

      {/* atalhos fixos: um botão por valor, todos na mesma linha */}
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${planner.quick.length}, minmax(0, 1fr))` }}
        role="group"
        aria-label="Escolhas rápidas de número de pessoas"
      >
        {planner.quick.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={people === n}
            onClick={() => set(n)}
            className={cx(
              'min-h-11 rounded-full border px-1 text-sm font-semibold tabular-nums transition active:scale-95',
              people === n ? 'border-ember-500 bg-ember-600 text-white' : 'border-white/15 text-smoke-300 hover:-translate-y-px hover:border-ember-400 hover:text-white',
            )}
          >
            {n.toLocaleString('pt-BR')}
            <span className="sr-only"> pessoas</span>
          </button>
        ))}
      </div>

      <a
        className="btn btn-primary mt-6 w-full"
        href={whatsappFor('planner', { pessoas: people.toLocaleString('pt-BR') })}
        target="_blank"
        rel="noopener noreferrer"
        data-magnetic
      >
        <WhatsAppIcon size={20} />
        {/* no celular o texto longo não cabe numa linha: versão curta (o ícone já indica o WhatsApp) */}
        <span className="sm:hidden">{planner.ctaShort}</span>
        <span className="hidden sm:inline">{planner.cta}</span>
        <span className="sr-only">(abre o WhatsApp em nova aba)</span>
      </a>
    </div>
  );
}

export function Packages() {
  return (
    <section id="pacotes" className="paper on-paper relative z-10" aria-labelledby="pacotes-title">
      <TornEdge color="var(--color-paper-100)" fiber="var(--color-paper-300)" seed={77} />
      <div className="container-site relative py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-x-14">
          <div className="lg:col-span-7">
            <SectionHeading id="pacotes-title" eyebrow={packagesSection.eyebrow} title={packagesSection.title} lead={packagesSection.lead} tone="paper" />
            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Ocasiões" data-reveal>
              {occasions.map(({ label, icon }) => {
                const Icon = occasionIcons[icon];
                return (
                  <li key={label} className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 bg-paper-50/70 px-4 py-2 text-sm font-semibold text-ink-800">
                    <Icon size={16} className="text-ember-700" aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <PartyPlanner />
          </div>
        </div>

        {/* faixa larga com a foto: mostra a quantidade de espetos na grelha */}
        <div
          className="photo-frame relative mt-14 aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-40px_rgba(40,22,10,0.6)] sm:aspect-[16/9] lg:mt-20 lg:aspect-[21/8]"
          data-reveal-img
        >
          <Picture
            image="pacotes"
            alt="Dezenas de espetinhos assando lado a lado na churrasqueira"
            sizes="(min-width: 1320px) 1320px, 100vw"
            className="absolute inset-0 block h-full w-full"
            imgClassName="h-full w-full scale-[1.12] object-cover"
            position="50% 55%"
            parallax
          />
        </div>

        {/* pacotes de 1 kg e 2 kg — vêm do cardápio (todo produto com 1 kg ou mais) */}
        <div className="mt-20 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="display text-[clamp(2rem,1.5rem+1.6vw,3rem)] leading-none text-ink-900" data-reveal>
            {packagesSection.packsTitle}
          </h3>
          <a
            className="btn btn-outline-ink self-start max-[379px]:px-5 max-[379px]:text-[1.05rem] sm:self-auto"
            href={whatsappFor('packages')}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
          >
            <WhatsAppIcon size={18} />
            {packagesSection.packagesCta}
            <span className="sr-only">(abre o WhatsApp em nova aba)</span>
          </a>
        </div>
        <ul className="mt-8 grid gap-3 min-[360px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {bigPacks.map((pack) => {
            const kg = (pack.grams ?? 0) / 1000;
            const label = `${pack.name}${pack.brand ? ` ${pack.brand}` : ''} ${kg.toLocaleString('pt-BR')} kg`;
            return (
              <li
                key={pack.id}
                className="group relative flex flex-col overflow-hidden rounded-[22px] bg-char-900 p-4 text-smoke-100 transition-[translate,box-shadow] duration-500 hover:-translate-y-[4px] hover:shadow-[0_30px_60px_-30px_rgba(166,58,21,0.55)] sm:p-6"
                data-reveal
              >
                <div className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-ember-600/25 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-60" />
                <div className="relative flex items-start justify-between gap-2">
                  <p className="display leading-[0.8] font-semibold text-ember-400" aria-hidden="true">
                    <span className="text-[3.4rem] sm:text-[5rem]">{kg.toLocaleString('pt-BR')}</span>
                    <span className="ml-1 text-[1.15rem] text-smoke-300 sm:text-[1.6rem]">kg</span>
                  </p>
                  <div className="photo-frame h-12 w-16 shrink-0 rounded-[12px] bg-white/5 sm:h-[4.5rem] sm:w-24 sm:rounded-[14px]">
                    <Picture image={pack.image} alt={label} sizes="96px" className="block h-full w-full" />
                  </div>
                </div>
                <h4 className="relative mt-4 text-[0.98rem] leading-snug font-bold text-smoke-100 sm:mt-6 sm:text-lg">
                  {pack.name}
                  <span className="sr-only"> — pacote de {kg.toLocaleString('pt-BR')} kg</span>
                </h4>
                {pack.brand && <p className="relative mt-1 text-sm text-smoke-400">{pack.brand}</p>}
                <div className="relative mt-auto pt-4 sm:pt-6">
                  <Price value={pack.price} demo={pack.demo} size="sm" />
                  <a
                    className="btn btn-wa btn-sm mt-4 w-full"
                    href={whatsappFor('product', { produto: pack.catalogName })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon size={18} />
                    {/* dois cards por linha no celular: texto curto até 768px */}
                    <span className="md:hidden">Pedir</span>
                    <span className="hidden md:inline">Pedir pelo WhatsApp</span>
                    <span className="sr-only">: {label} (abre o WhatsApp em nova aba)</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
