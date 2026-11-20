import { Clock, Phone } from 'lucide-react';
import { callToAction } from '../../config/content';
import { store } from '../../config/store';
import { whatsappFor } from '../../lib/whatsapp';
import { groupHours } from '../../lib/hours';
import { Picture } from '../ui/Picture';
import { Embers } from '../ui/Embers';
import { SplitWords } from '../ui/SplitWords';
import { WhatsAppIcon } from '../ui/Icons';

const openGroups = groupHours(store.hours).filter((g) => !g.closed);

export function CallToAction() {
  return (
    <section id="pedido" className="relative z-10 isolate overflow-hidden bg-char-950" aria-labelledby="pedido-title">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <Picture
          image="cta-brasa"
          alt=""
          sizes="100vw"
          className="absolute inset-0 block h-full w-full"
          imgClassName="h-full w-full scale-[1.15] object-cover"
          position="50% 60%"
          parallax
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0d0a08_0%,rgba(13,10,8,0.55)_30%,rgba(13,10,8,0.62)_70%,#0b0908_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(11,9,8,0.55),rgba(11,9,8,0.1))]" />
      </div>
      <Embers className="-z-[5]" />

      <div className="container-site flex min-h-[88svh] flex-col items-center justify-center py-28 text-center md:min-h-[92vh]">
        <h2
          id="pedido-title"
          className="display max-w-5xl text-[clamp(2.9rem,1.5rem+6vw,8rem)] leading-[0.9] text-white text-balance [text-shadow:0_4px_40px_rgba(0,0,0,0.55)]"
        >
          <SplitWords text={callToAction.title} />
        </h2>
        <p className="mt-7 max-w-xl text-lg text-smoke-200 text-pretty md:text-xl" data-reveal>
          {callToAction.text}
        </p>
        <div className="mt-10" data-reveal>
          <a
            className="btn btn-primary btn-lg max-[379px]:min-h-14 max-[379px]:px-6 max-[379px]:text-[1.2rem]"
            href={whatsappFor('general')}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
          >
            <WhatsAppIcon size={24} />
            {callToAction.cta}
            <span className="sr-only">(abre o WhatsApp em nova aba)</span>
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-smoke-300" data-reveal>
          <li>
            <a href={store.phone.href} className="link-draw inline-flex items-center gap-2 py-2 hover:text-white">
              <Phone size={16} aria-hidden="true" />
              {store.phone.display}
            </a>
          </li>
          {openGroups.map((g) => (
            <li key={g.days} className="inline-flex items-center gap-2">
              <Clock size={16} aria-hidden="true" />
              {g.days}, {g.time}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
