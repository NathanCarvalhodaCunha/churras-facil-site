import { store } from '../config/store';
import { whatsappMessages, type MessageKey } from '../config/messages';

/** Preenche {chaves} de um modelo de mensagem */
export function fillTemplate(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

/** Link wa.me com mensagem pronta — funciona no celular (app) e no computador (WhatsApp Web) */
export function whatsappLink(message: string): string {
  const number = store.whatsapp.number.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Atalho: link a partir de uma mensagem configurada */
export function whatsappFor(key: MessageKey, vars?: Record<string, string | number>): string {
  return whatsappLink(fillTemplate(whatsappMessages[key], vars));
}
