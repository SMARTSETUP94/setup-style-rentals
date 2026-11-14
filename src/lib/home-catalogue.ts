import type { SeoLang } from "./seo";

/** Legacy URLs only; never use these aliases to label current catalogue items. */
export function categoryRedirect(slug: string): string | undefined {
  const redirects: Record<string, string> = {
    structures: "scenes-podiums",
    signaletique: "decor-signaletique",
    decoration: "decor-signaletique",
  };
  return redirects[slug];
}

export const HOME_SELECTION = ["stele", "panier-basketball", "photobooth-balancoire", "bar-arrondi", "samias", "pouf"] as const;

type FaqEntry = { q_fr?: string; q_en?: string; a_fr?: string; a_en?: string };

/** Reuse editorial answers verbatim; do not invent content for a missing topic. */
export function homeFaq(categories: Array<{ faq: unknown }>, lang: SeoLang) {
  const entries = categories.flatMap(c => Array.isArray(c.faq) ? c.faq as FaqEntry[] : []);
  return [/prix|price|cost/i, /livraison|delivery/i, /réserv|reser|book/i].flatMap(topic => {
    const entry = entries.find(f => topic.test(f.q_fr ?? "") || topic.test(f.q_en ?? ""));
    if (!entry) return [];
    const question = lang === "en" ? entry.q_en || entry.q_fr : entry.q_fr || entry.q_en;
    const answer = lang === "en" ? entry.a_en || entry.a_fr : entry.a_fr || entry.a_en;
    return question && answer ? [{ question, answer }] : [];
  });
}