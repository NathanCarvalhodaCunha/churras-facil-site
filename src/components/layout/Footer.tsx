import { Clock, MapPin, Phone } from 'lucide-react';
import { MotionToggle } from '../ui/MotionToggle';
import { footer, nav } from '../../config/content';
import { directionsUrl, store, streetDisplay } from '../../config/store';
import { whatsappFor } from '../../lib/whatsapp';
import { groupHours } from '../../lib/hours';
import { InstagramIcon, WhatsAppIcon } from '../ui/Icons';
import { TornEdge } from '../ui/TornEdge';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const hours = groupHours(store.hours);

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="grain relative z-10 bg-char-950 pt-20 pb-28 md:pb-12">
      <TornEdge color="var(--color-char-950)" seed={155} />
      <div className="container-site grid gap-12 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4" data-reveal>
          <a href="#inicio" className="inline-block" aria-label={`${store.name} — voltar ao início`}>
            <img
              src={`${BASE}/brand/logo-240.webp`}
              srcSet={`${BASE}/brand/logo-240.webp 240w, ${BASE}/brand/logo-480.webp 480w`}
              sizes="190px"
              width={627}
              height={304}
              alt={store.fullName}
              loading="lazy"
              decoding="async"
              className="h-auto w-[190px]"
            />
          </a>
          <p className="mt-6 max-w-sm text-smoke-400">{footer.description}</p>
          <div className="mt-6 flex gap-3">
            <a
              href={whatsappFor('general')}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp da Churras Fácil (abre em nova aba)"
              className="grid size-11 place-items-center rounded-full border border-white/12 text-smoke-200 transition hover:-translate-y-0.5 hover:border-ember-400 hover:text-white"
            >
              <WhatsAppIcon size={19} />
            </a>
            <a
              href={store.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${store.instagram.handle} (abre em nova aba)`}
              className="grid size-11 place-items-center rounded-full border border-white/12 text-smoke-200 transition hover:-translate-y-0.5 hover:border-ember-400 hover:text-white"
            >
              <InstagramIcon size={19} />
            </a>
          </div>
        </div>

        <nav aria-label="Rodapé" className="xl:col-span-2" data-reveal>
          <h2 className="text-xs font-bold tracking-[0.2em] text-smoke-500 uppercase">Navegação</h2>
          <ul className="mt-5 space-y-1">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="link-draw inline-flex min-h-10 items-center text-smoke-300 hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="xl:col-span-3" data-reveal>
          <h2 className="text-xs font-bold tracking-[0.2em] text-smoke-500 uppercase">Contato</h2>
          <ul className="mt-5 space-y-1 text-smoke-300">
            <li>
              <a href={whatsappFor('general')} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-10 items-center gap-2.5 hover:text-white">
                <WhatsAppIcon size={17} />
                WhatsApp {store.whatsapp.display}
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
            <li>
              <a href={store.phone.href} className="link-draw inline-flex min-h-10 items-center gap-2.5 hover:text-white">
                <Phone size={17} aria-hidden="true" />
                {store.phone.display}
              </a>
            </li>
            <li>
              <a href={store.instagram.url} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-10 items-center gap-2.5 hover:text-white">
                <InstagramIcon size={17} />
                {store.instagram.handle}
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="xl:col-span-3" data-reveal>
          <h2 className="text-xs font-bold tracking-[0.2em] text-smoke-500 uppercase">Endereço</h2>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex gap-2.5 text-smoke-300 hover:text-white">
            <MapPin size={17} className="mt-1 shrink-0" aria-hidden="true" />
            <span>
              {streetDisplay}
              <br />
              {store.address.district}, {store.address.city} – {store.address.state}
              <br />
              <span className="text-smoke-500">{store.address.landmark}</span>
              <span className="sr-only">(abre o Google Maps em nova aba)</span>
            </span>
          </a>
          <h2 className="mt-8 text-xs font-bold tracking-[0.2em] text-smoke-500 uppercase">Horário</h2>
          <ul className="mt-4 space-y-1.5 text-smoke-300">
            {hours.map((g) => (
              <li key={g.days} className="flex gap-2.5">
                <Clock size={17} className="mt-1 shrink-0 text-smoke-500" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-smoke-200">{g.days}</span> · {g.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-site mt-16">
        <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-8 text-sm text-smoke-500 md:flex-row md:items-center md:justify-between">
          <p>
            © <span suppressHydrationWarning>{year}</span> {store.fullName}. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={`${BASE}/privacidade.html`} className="link-draw inline-flex min-h-11 items-center hover:text-smoke-200">
              Privacidade
            </a>
            <a href={`${BASE}/creditos.html`} className="link-draw inline-flex min-h-11 items-center hover:text-smoke-200">
              Créditos das imagens
            </a>
            <MotionToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
