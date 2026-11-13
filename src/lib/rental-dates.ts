/** One selected date is a one-day rental; no dates leaves the duration choice intact. */
export function rentalDates(start?: string, end?: string) {
  const from = start || end || undefined;
  const to = end || start || undefined;
  return { startDate: from, endDate: to,
    days: from && to ? Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1) : undefined };
}