import { whatsappFor } from '../../lib/whatsapp';
import { WhatsAppIcon } from '../ui/Icons';

/** Botão flutuante do WhatsApp — visível em toda a navegação */
export function FloatingWhatsApp() {
  return (
    <div
      id="wa-float"
      className="fixed right-4 bottom-4 z-40 transition-opacity duration-300 sm:right-6 sm:bottom-6 [html[data-menu=open]_&]:pointer-events-none [html[data-menu=open]_&]:opacity-0"
      style={{ marginBottom: 'env(safe-area-inset-bottom)', marginRight: 'env(safe-area-inset-right)' }}
    >
      <a
        href={whatsappFor('general')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir pelo WhatsApp (abre em nova aba)"
        className="wa-float group relative isolate flex h-14 items-center rounded-full bg-[#17a24f] text-white shadow-[0_14px_34px_-10px_rgba(18,140,75,0.75)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#128c4b] active:scale-95"
      >
        <span className="grid size-14 place-items-center">
          <WhatsAppIcon size={28} />
        </span>
        <span className="max-w-0 overflow-hidden pr-0 font-display text-[1.1rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-[max-width,padding] duration-500 ease-[var(--ease-out-quart)] group-hover:max-w-[14rem] group-hover:pr-5 group-focus-visible:max-w-[14rem] group-focus-visible:pr-5">
          Pedir pelo WhatsApp
        </span>
      </a>
    </div>
  );
}
