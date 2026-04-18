import type { Lang } from "./i18n";

export function formatPrice(value: number, lang: Lang = "fr"): string {
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function categoryColor(slug: string): string {
  switch (slug) {
    case "jeux": return "#FF6B6B";
    case "structures": return "#4ECDC4";
    case "signaletique": return "#FFE66D";
    case "decoration": return "#A08CFF";
    case "mobilier": return "#95E1D3";
    default: return "#A08CFF";
  }
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
