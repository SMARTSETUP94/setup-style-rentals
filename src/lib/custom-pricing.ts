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
    ? `Estimation indicative : ${fmt(r.low, lang)} € – ${fmt(r.high, lang)} € HT`
    : `Indicative estimate: €${fmt(r.low, lang)} – €${fmt(r.high, lang)} excl. VAT`;
}
export function rangeTotalLine(r: PublicRange, qty: number, lang: "fr" | "en") {
  const lo = fmt(r.low * qty, lang), hi = fmt(r.high * qty, lang);
  return lang === "fr"
    ? `Par unité · total pour ${qty} unité${qty > 1 ? "s" : ""} : ${lo} € – ${hi} € HT`
    : `Per unit · total for ${qty} unit${qty > 1 ? "s" : ""}: €${lo} – €${hi} excl. VAT`;
}
/** Short form for the request line and client e-mail (always says "indicative"). */
export function rangeShort(r: PublicRange, lang: "fr" | "en") {
  return lang === "fr"
    ? `Estimation indicative : ${fmt(r.low, lang)} € – ${fmt(r.high, lang)} € HT par unité`
    : `Indicative estimate: €${fmt(r.low, lang)} – €${fmt(r.high, lang)} excl. VAT per unit`;
}
export function studyLine(lang: "fr" | "en") {
  return lang === "fr"
    ? "Cette configuration nécessite une étude : prix et délai confirmés sous 48 h ouvrées."
    : "This configuration requires a design study: price and lead time confirmed within 48 working hours.";
}
export function rangeReserves(lang: "fr" | "en") {
  return lang === "fr"
    ? "Fourchette indicative hors taxes, calculée automatiquement à partir de votre configuration (± 20 %). Elle ne constitue ni un devis ni une offre de prix. Le prix définitif et le délai sont confirmés par notre bureau d'études sous 48 h ouvrées, après vérification des cotes, des finitions et de la faisabilité. Hors livraison, installation, conception graphique et fichiers d'impression. Teintes validées sur échantillon. TVA en sus."
    : "Indicative range excluding VAT, calculated automatically from your configuration (± 20%). It is neither a quotation nor a price offer. The final price and lead time are confirmed by our design office within 48 working hours, after checking dimensions, finishes and feasibility. Excludes delivery, installation, graphic design and print files. Colours approved on sample. VAT extra.";
}

/** Text-only message sent to the configurator iframe; the iframe never computes prices. `null` text = restore its default. */
export function iframePriceMessage(
  est: { range: PublicRange | null; study: boolean } | null,
  lang: "fr" | "en",
): { type: "price-range"; text: string; sub: string } {
  if (!est) return { type: "price-range", text: "", sub: "" };
  if (est.study || !est.range)
    return { type: "price-range", text: lang === "fr" ? "Étude nécessaire : prix sous 48 h ouvrées" : "Design study required: price within 48 business hours", sub: "" };
  const { low, high } = est.range;
  return lang === "fr"
    ? { type: "price-range", text: `Estimation indicative : ${fmt(low, lang)} – ${fmt(high, lang)} € HT / unité`, sub: "Prix confirmé sous 48 h ouvrées" }
    : { type: "price-range", text: `Indicative estimate: €${fmt(low, lang)} – €${fmt(high, lang)} excl. VAT / unit`, sub: "Price confirmed within 48 business hours" };
}
