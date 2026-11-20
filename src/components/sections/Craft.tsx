import { craft } from '../../config/content';
import { cx } from '../../lib/format';
import { Picture } from '../ui/Picture';
import { SectionHeading } from '../ui/SectionHeading';
import { SplitWords } from '../ui/SplitWords';
import { TornEdge } from '../ui/TornEdge';

const alts: Record<string, string> = {
  churrasqueiro: 'Carne grelhando sobre as chamas da churrasqueira',
  pimentoes: 'Pimentões vermelho, amarelo e verde sobre fundo escuro',
  carvao: 'Pedaços de carvão vegetal',
  'grelha-pinca': 'Pinça virando carne sobre o carvão em brasa',
};

/** Seção de diferenciais: madeira escura, fotos com profundidade e texto intercalado */
export function Craft() {
  return (
    <section id="diferenciais" className="relative z-10 overflow-hidden bg-[#160f0b]" aria-labelledby="diferenciais-title">
      <TornEdge color="#160f0b" seed={93} />

      {/* madeira escura ao fundo */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Picture image="madeira" alt="" sizes="100vw" className="absolute inset-0 block h-full w-full" imgClassName="h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,rgba(22,15,11,0.35),rgba(13,9,7,0.92))]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#160f0b] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0d0a08] to-transparent" />
      </div>

      {/* cebolas como elemento de composição */}
      <div className="pointer-events-none absolute -right-24 bottom-[18%] hidden w-[26rem] opacity-70 xl:block" aria-hidden="true">
        <Picture image="cebolas" alt="" sizes="420px" className="fade-mask-soft block" imgClassName="h-auto w-full" />
      </div>

      <div className="container-site relative py-24 md:py-32">
        <SectionHeading id="diferenciais-title" eyebrow={craft.eyebrow} title={craft.title} align="center" />

        <div className="relative mt-16 md:mt-24">
          {/* palito vertical que costura a narrativa */}
          <div
            className="absolute top-0 bottom-0 left-1/2 hidden w-[3px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,transparent,#c9a46c_8%,#9c7440_50%,#c9a46c_92%,transparent)] opacity-60 lg:block"
            aria-hidden="true"
            data-draw-y
          />
          <ol className="flex flex-col gap-16 md:gap-24">
            {craft.blocks.map((block, i) => {
              const flip = i % 2 === 1;
              return (
                <li key={block.title} className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-24">
                  <div className={cx('relative', flip && 'lg:order-2')}>
                    <div
                      className="photo-frame aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06] md:aspect-[16/10] lg:aspect-[4/3]"
                      data-reveal-img
                    >
                      <Picture
                        image={block.image}
                        alt={alts[block.image] ?? ''}
                        sizes="(min-width: 1024px) 44vw, 92vw"
                        className="block h-full w-full"
                        imgClassName="h-full w-full scale-[1.14] object-cover"
                        parallax
                      />
                    </div>
                  </div>
                  <div className={cx('relative', flip && 'lg:order-1 lg:text-right')} data-reveal-x={flip ? -1 : 1}>
                    <span
                      className="display block text-[clamp(4.5rem,3rem+5vw,8rem)] leading-[0.8] font-black text-transparent [-webkit-text-stroke:1.5px_rgba(240,138,62,0.55)]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="display mt-4 text-[clamp(2.1rem,1.6rem+1.8vw,3.3rem)] leading-[0.95] text-smoke-100 text-balance">
                      <SplitWords text={block.title} />
                    </h3>
                    <p className={cx('mt-4 max-w-md text-[1.05rem] leading-relaxed text-smoke-300', flip && 'lg:ml-auto')}>{block.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
