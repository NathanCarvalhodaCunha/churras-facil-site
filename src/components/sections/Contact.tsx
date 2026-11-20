import { useEffect, useState } from 'react';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { contact } from '../../config/content';
import { directionsUrl, mapEmbedUrl, store, streetDisplay } from '../../config/store';
import { whatsappFor } from '../../lib/whatsapp';
import { getOpenStatus, nowInTimezone, type OpenStatus } from '../../lib/hours';
import { cx } from '../../lib/format';
import { SectionHeading } from '../ui/SectionHeading';
import { TornEdge } from '../ui/TornEdge';
import { InstagramIcon, WhatsAppIcon } from '../ui/Icons';
import { formatTime } from '../../lib/hours';

/** Status "Aberto agora" calculado no navegador (fuso de Atibaia), atualizado a cada minuto */
function useOpenStatus() {
  const [state, setState] = useState<{ status: OpenStatus; today: number } | null>(null);
  useEffect(() => {
    const update = () =>
      setState({ status: getOpenStatus(store.hours, store.timezone), today: nowInTimezone(store.timezone).day });
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return state;
}

function MapCard() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-full min-h-[22rem] overflow-hidden rounded-[22px] bg-char-900 text-smoke-100 lg:min-h-full" data-reveal>
      {loaded ? (
        <iframe
          title={`Mapa: ${store.name}, ${streetDisplay}, ${store.address.city}`}
          src={mapEmbedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="grain absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(233,225,215,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(233,225,215,0.5)_1px,transparent_1px)] [background-size:44px_44px]"
            aria-hidden="true"
          />
          <span className="relative grid size-16 place-items-center rounded-full bg-ember-600 text-white shadow-[0_0_0_10px_rgba(201,74,28,0.18)]">
            <MapPin size={28} aria-hidden="true" />
          </span>
          {/* @container: o tamanho da rua acompanha a largura do cartão, para caber sempre em uma linha */}
          <div className="relative w-full @container">
            <p className="display text-[clamp(1.1rem,9.4cqi,1.9rem)] leading-none whitespace-nowrap">{streetDisplay}</p>
            <p className="mt-2 text-smoke-300">
              <span className="whitespace-nowrap">
                {store.address.district}, {store.address.city}/{store.address.state}
              </span>
              <span className="max-sm:hidden" aria-hidden="true">
                {' · '}
              </span>
              <span className="block whitespace-nowrap sm:inline">{store.address.landmark}</span>
            </p>
          </div>
          <div className="relative flex flex-col gap-3 sm:flex-row">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLoaded(true)}>
              {contact.mapButton}
            </button>
            <a className="btn btn-primary btn-sm" href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation size={17} aria-hidden="true" />
              Como chegar
              <span className="sr-only">(abre o Google Maps em nova aba)</span>
            </a>
          </div>
          <p className="relative text-xs text-smoke-500">{contact.mapNote}</p>
        </div>
      )}
    </div>
  );
}

export function Contact() {
  const open = useOpenStatus();
  // lista começando na segunda-feira
  const week = [...store.hours].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

  return (
    <section id="contato" className="paper on-paper relative z-10" aria-labelledby="contato-title">
      <TornEdge color="var(--color-paper-100)" fiber="var(--color-paper-300)" seed={128} />
      <div className="container-site relative py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <SectionHeading id="contato-title" eyebrow={contact.eyebrow} title={contact.title} lead={contact.text} tone="paper" />

            <address className="mt-10 flex items-start gap-3 text-[1.05rem] text-ink-800 not-italic" data-reveal>
              <MapPin size={20} className="mt-1 shrink-0 text-ember-700" aria-hidden="true" />
              <span>
                <strong className="font-bold text-ink-900">{streetDisplay}</strong>
                <br />
                {store.address.district}, {store.address.city} – {store.address.state}, {store.address.postalCode}
                <br />
                <span className="text-ink-500">{store.address.landmark}</span>
              </span>
            </address>

            <div className="mt-8 grid gap-3 sm:grid-cols-2" data-reveal>
              <a className="btn btn-ink" href={whatsappFor('general')} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={20} />
                WhatsApp
                <span className="sr-only">(abre em nova aba)</span>
              </a>
              <a className="btn btn-outline-ink" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation size={18} aria-hidden="true" />
                Como chegar
                <span className="sr-only">(abre o Google Maps em nova aba)</span>
              </a>
              <a className="btn btn-outline-ink" href={store.phone.href}>
                <Phone size={18} aria-hidden="true" />
                {store.phone.display}
              </a>
              <a className="btn btn-outline-ink" href={store.instagram.url} target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={18} />
                Instagram
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </div>

            <div className="mt-10 rounded-[22px] border border-ink-900/12 bg-paper-50/80 p-6" data-reveal>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="display flex items-center gap-2 text-[1.7rem] leading-none text-ink-900">
                  <Clock size={20} className="text-ember-700" aria-hidden="true" />
                  Horário de funcionamento
                </h3>
                <p
                  className={cx(
                    'inline-flex min-h-7 items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase',
                    !open && 'invisible',
                    open?.status.open ? 'bg-[#1f7a43]/12 text-[#17653a]' : 'bg-ink-900/[0.07] text-ink-700',
                  )}
                  aria-live="polite"
                >
                  <span className={cx('size-2 rounded-full', open?.status.open ? 'bg-[#1f9a50]' : 'bg-ink-500')} aria-hidden="true" />
                  {open?.status.label ?? '—'}
                </p>
              </div>
              <dl className="mt-5 divide-y divide-ink-900/10">
                {week.map((h) => {
                  const isToday = open?.today === h.day;
                  return (
                    <div key={h.day} className={cx('flex items-center justify-between py-2.5 text-[0.98rem]', isToday ? 'font-bold text-ink-900' : 'text-ink-700')}>
                      <dt>
                        {h.label}
                        {isToday && <span className="ml-2 text-xs font-bold tracking-wide text-ember-700 uppercase">hoje</span>}
                      </dt>
                      <dd className="tabular-nums">{h.open && h.close ? `${formatTime(h.open)} às ${formatTime(h.close)}` : 'Fechado'}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-4 text-sm text-ink-500">{store.hoursNote}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <MapCard />
          </div>
        </div>
      </div>
    </section>
  );
}
