import type { ReactNode } from 'react';
import { cx } from '../../lib/format';
import { SplitWords } from './SplitWords';

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  tone?: 'dark' | 'paper';
  align?: 'left' | 'center';
  className?: string;
}

/** Selo + título (entra palavra por palavra) + texto de apoio */
export function SectionHeading({ id, eyebrow, title, lead, tone = 'dark', align = 'left', className }: SectionHeadingProps) {
  return (
    <div className={cx('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p className="eyebrow" data-reveal>
        {eyebrow}
      </p>
      <h2 id={id} className="display mt-5 text-[clamp(2.5rem,1.4rem+3.9vw,5.25rem)] text-balance">
        <SplitWords text={title} />
      </h2>
      {lead && (
        <p
          className={cx(
            'mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-pretty md:text-lg',
            align === 'center' && 'mx-auto',
            tone === 'dark' ? 'text-smoke-300' : 'text-ink-700',
          )}
          data-reveal
        >
          {lead}
        </p>
      )}
    </div>
  );
}
