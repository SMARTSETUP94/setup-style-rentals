/** Matches 3D configurator choices to the product page's option categories. */
export const normLabel = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

export interface MatchCategory { id: string; name_fr: string; name_en: string }
export interface MatchOption { id: string; category_id: string; name_fr: string; name_en: string }
export type ConfigChoices = Record<string, Array<{ value: string; label: string }>>;

/** Returns { categoryId: optionId } for categories with exactly one matching option. */
export function matchConfigToOptions(
  data: Record<string, unknown> | null | undefined,
  categories: MatchCategory[],
  options: MatchOption[],
  choices: ConfigChoices | null | undefined = {},
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!data || typeof data !== "object") return out;
  // Candidate (groupKey, label) pairs coming from the configuration.
  const pairs: Array<{ key: string; label: string }> = [];
  for (const [rawKey, v] of Object.entries(data)) {
    if (typeof v !== "string" || !v.trim()) continue;
    const key = rawKey.trim().replace(/(Finition|Option)$/, "");
    const list = choices?.[key] ?? [];
    const hit = list.find((c) => c.value === v);
    pairs.push({ key, label: hit ? hit.label : v });
  }
  for (const cat of categories) {
    const catNames = [normLabel(cat.name_fr || ""), normLabel(cat.name_en || "")].filter(Boolean);
    const catPairs = pairs.filter((p) => {
      const kn = normLabel(p.key);
      return kn.length > 1 && catNames.some((cn) => cn === kn || cn.includes(kn) || kn.includes(cn));
    });
    if (catPairs.length === 0) continue;
    const opts = options.filter((o) => o.category_id === cat.id);
    const matched = new Set<string>();
    for (const p of catPairs) {
      const ln = normLabel(p.label);
      for (const o of opts) if (normLabel(o.name_fr || "") === ln || normLabel(o.name_en || "") === ln) matched.add(o.id);
    }
    if (matched.size === 1) out[cat.id] = [...matched][0];
  }
  return out;
}

/** Parses "Label : Valeur" lines of a plain-text 3D recap into { label: value }
 *  (used by the hosted configurators that only send a text recap). */
export function recapPairs(recap: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of String(recap ?? "").split(/\n/)) {
    const m = line.match(/^\s*([^:]{2,40}?)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
    const noParen = m[2].replace(/\s*\([^)]*\)\s*$/, "");
    if (noParen !== m[2] && !out[`${m[1]} `]) out[`${m[1]} `] = noParen;
  }
  return out;
}
