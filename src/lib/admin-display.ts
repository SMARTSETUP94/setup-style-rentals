export function isCustomOnly(items: unknown): boolean {
  return Array.isArray(items) && items.length > 0 && items.every(item => item?.kind === "custom");
}

/** Estimates are stored excl. VAT; dashboard amounts are consistently incl. VAT. */
export function dashboardAmount(items: unknown, totalTtc: number, estimateHt?: number): number | null {
  if (!isCustomOnly(items)) return Number(totalTtc) || 0;
  return estimateHt == null ? null : Math.round(estimateHt * 1.2 * 100) / 100;
}

export function importedProductImage(slug: string, url: string | null): boolean {
  if (!url) return false;
  try {
    const filename = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
    if (!filename.startsWith(`${slug}-`)) return false;
    return /^\d{13}\.[a-z0-9]+$/i.test(filename.slice(slug.length + 1));
  } catch { return false; }
}

export function pendingApplicants<T extends { email: string; status: string }>(quotes: T[]): Array<{ email: string; quotes: T[] }> {
  const grouped = new Map<string, T[]>();
  for (const quote of quotes) {
    const email = quote.email.trim().toLowerCase();
    if (!email || quote.status !== "pending") continue;
    grouped.set(email, [...(grouped.get(email) ?? []), quote]);
  }
  return Array.from(grouped, ([email, quotes]) => ({ email, quotes }));
}