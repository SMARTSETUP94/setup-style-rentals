/** Pure helpers for the admin calendar: which days a quote occupies. */
export type DayKind = "rental" | "event" | "custom";
export interface QuoteLike {
  event_date?: string | null;
  custom_delivery_date?: string | null;
  items?: unknown;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Every YYYY-MM-DD from start to end inclusive (UTC arithmetic, capped at 366 days). */
export function eachDay(start: string, end: string): string[] {
  if (!DATE_RE.test(start) || !DATE_RE.test(end) || end < start) return [];
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  for (let i = 0; i < 366; i++) {
    const k = d.toISOString().slice(0, 10);
    if (k > end) break;
    out.push(k);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const isCustom = (it: any) => it?.kind === "custom";

/** Map day -> kind for a quote. Rental lines' dates first; custom pieces at the
 *  requested delivery date; event date only as a fallback when nothing else. */
export function quoteDays(q: QuoteLike): Map<string, DayKind> {
  const days = new Map<string, DayKind>();
  const items: any[] = Array.isArray(q.items) ? q.items : [];
  for (const it of items) {
    if (isCustom(it) || !it?.startDate || !it?.endDate) continue;
    for (const k of eachDay(String(it.startDate), String(it.endDate))) days.set(k, "rental");
  }
  const hasCustom = items.some(isCustom);
  if (hasCustom && q.custom_delivery_date && DATE_RE.test(q.custom_delivery_date) && !days.has(q.custom_delivery_date)) {
    days.set(q.custom_delivery_date, "custom");
  }
  if (days.size === 0 && q.event_date && DATE_RE.test(q.event_date)) days.set(q.event_date, "event");
  return days;
}

/** Rental reservations per day and product (custom lines ignored). */
export function rentalUsage(items: unknown): Map<string, Map<string, number>> {
  const usage = new Map<string, Map<string, number>>();
  for (const it of (Array.isArray(items) ? items : []) as any[]) {
    if (isCustom(it)) continue;
    const pid = it?.productId;
    const qty = Number(it?.quantity || 0);
    if (!pid || !qty || !it?.startDate || !it?.endDate) continue;
    for (const k of eachDay(String(it.startDate), String(it.endDate))) {
      const m = usage.get(k) || new Map<string, number>();
      m.set(pid, (m.get(pid) || 0) + qty);
      usage.set(k, m);
    }
  }
  return usage;
}
