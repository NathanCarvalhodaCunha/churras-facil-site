import type { DayHours } from '../config/store';

/** "09:00" → "9h", "21:30" → "21h30" */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export interface HoursGroup {
  days: string;
  time: string;
  closed: boolean;
  dayNumbers: number[];
}

/** Agrupa dias seguidos com o mesmo horário: "Ter a Sáb · 9h às 21h" */
export function groupHours(hours: DayHours[]): HoursGroup[] {
  const groups: { items: DayHours[]; key: string }[] = [];
  for (const h of hours) {
    const key = h.open && h.close ? `${h.open}-${h.close}` : 'closed';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(h);
    else groups.push({ items: [h], key });
  }
  return groups.map(({ items, key }) => {
    const first = items[0];
    const lastItem = items[items.length - 1];
    const days = items.length > 2 ? `${first.short} a ${lastItem.short}` : items.map((i) => i.short).join(' e ');
    return {
      days,
      closed: key === 'closed',
      time: key === 'closed' ? 'Fechado' : `${formatTime(first.open!)} às ${formatTime(first.close!)}`,
      dayNumbers: items.map((i) => i.day),
    };
  });
}

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Dia da semana e minutos do dia no fuso da loja */
export function nowInTimezone(timezone: string, date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  return { day: WEEKDAY[get('weekday')] ?? 0, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export interface OpenStatus {
  open: boolean;
  label: string;
}

/** "Aberto agora · fecha às 21h" / "Fechado agora · abre terça às 9h" */
export function getOpenStatus(hours: DayHours[], timezone: string, date = new Date()): OpenStatus {
  const { day, minutes } = nowInTimezone(timezone, date);
  const today = hours.find((h) => h.day === day);
  if (today?.open && today.close && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: `Aberto agora · fecha às ${formatTime(today.close)}` };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = hours.find((x) => x.day === d);
    if (!h?.open) continue;
    if (i === 0 && minutes >= toMinutes(h.open)) continue;
    const when = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : h.label.toLowerCase().replace('-feira', '');
    return { open: false, label: `Fechado agora · abre ${when} às ${formatTime(h.open)}` };
  }
  return { open: false, label: 'Fechado agora' };
}

/** Quantos dias por semana a loja abre (derivado dos horários) */
export function openDaysPerWeek(hours: DayHours[]): number {
  return hours.filter((h) => h.open && h.close).length;
}
