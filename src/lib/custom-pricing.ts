import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicPrice = { from_price_ht: number; lead_time_days: number | null };

/** Public "from" prices — only pieces enabled by an admin are returned. */
export function useCustomPublicPricing() {
  const [prices, setPrices] = useState<Record<string, PublicPrice>>({});
  useEffect(() => {
    let alive = true;
    void supabase.rpc("get_custom_public_pricing").then(({ data }) => {
      if (!alive || !Array.isArray(data)) return;
      const map: Record<string, PublicPrice> = {};
      for (const r of data as Array<{ piece: string; from_price_ht: number; lead_time_days: number | null }>) {
        map[r.piece] = { from_price_ht: Number(r.from_price_ht), lead_time_days: r.lead_time_days ?? null };
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
  if (!p) return [lang === "fr" ? "Prix et délai de fabrication confirmés sous 48 h ouvrées" : "Price and production time confirmed within two business days"];
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
