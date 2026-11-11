import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicPrice = { from_price_ht: number | null; lead_time_days: number | null; range_enabled: boolean };
export type PublicRange = { low: number; high: number } ;

/** Public "from" prices — only pieces enabled by an admin are returned. */
export function useCustomPublicPricing() {
  const [prices, setPrices] = useState<Record<string, PublicPrice>>({});
  useEffect(() => {
    let alive = true;
    void supabase.rpc("get_custom_public_pricing").then(({ data }) => {
      if (!alive || !Array.isArray(data)) return;
      const map: Record<string, PublicPrice> = {};
      for (const r of data as Array<{ piece: string; from_price_ht: number | null; lead_time_days: number | null; enabled: boolean; range_enabled: boolean }>) {
        map[r.piece] = {
          from_price_ht: r.enabled && r.from_price_ht != null ? Number(r.from_price_ht) : null,
          lead_time_days: r.enabled ? (r.lead_time_days ?? null) : null,
          range_enabled: r.range_enabled === true,
        };
      }
      setPrices(map);
    });
    return () => {
      alive = false;
    };
  }, []);
  return prices;
}

export function priceLines(p: PublicPrice | undefined, lang: "fr" | "en"): string[] {
  if (!p || p.from_price_ht == null) return [lang === "fr" ? "Prix et délai de fabrication confirmés sous 48 h ouvrées" : "Price and production time confirmed within two business days"];
  const amount = new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 0 }).format(p.from_price_ht);
  const out = [
    lang === "fr"
      ? `À partir de ${amount} € HT, hors livraison et pose — prix ferme confirmé par devis`
      : `From €${amount} excl. VAT, delivery and installation not included — firm price confirmed by quote`,
  ];
  if (p.lead_time_days != null && p.lead_time_days > 0) {
    out.push(lang === "fr" ? `Délai indicatif de fabrication : ${p.lead_time_days} jours ouvrés` : `Indicative production time: ${p.lead_time_days} business days`);
  }
  return out;
}

const fmt = (n: number, lang: "fr" | "en") => new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 0 }).format(n);

export function rangeLine(r: PublicRange, lang: "fr" | "en") {
  return lang === "fr"
    ? `Budget indicatif : entre ${fmt(r.low, lang)} et ${fmt(r.high, lang)} € HT l'unité, hors livraison et pose — prix ferme confirmé par devis`
    : `Indicative budget: between €${fmt(r.low, lang)} and €${fmt(r.high, lang)} excl. VAT per unit, delivery and installation not included — firm price confirmed by quote`;
}
export function rangeShort(r: PublicRange, lang: "fr" | "en") {
  return lang === "fr"
    ? `Budget indicatif : entre ${fmt(r.low, lang)} et ${fmt(r.high, lang)} € HT l'unité (estimation, confirmée par devis)`
    : `Indicative budget: between €${fmt(r.low, lang)} and €${fmt(r.high, lang)} excl. VAT per unit (estimate, confirmed by quote)`;
}
export function studyLine(lang: "fr" | "en") {
  return lang === "fr"
    ? "Cette configuration demande une étude : prix sur devis sous 48 h ouvrées"
    : "This configuration requires a study: price quoted within two business days";
}
