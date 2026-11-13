/** Default ("version standard") option selection for rental product pages:
 *  in every option category, preselect the included (0 €) option. */
export interface DefaultOptCategory { id: string }
export interface DefaultOpt { id: string; category_id: string; name_fr: string; price: number | string; sort_order?: number }

/** Products whose 3D configurator stays the highlighted customisation path
 *  (branded objects). Other products show a discreet "Voir en 3D" link. */
export const BRAND_3D_SLUGS = new Set([
  "stele", "stele-miroir", "photobooth-balancoire", "lettres-geantes",
  "plinko", "panier-basketball", "cornhole", "puissance-4",
]);

const STANDARD_HINT = /(inclus|origine|original|standard|d[ée]faut|classique|^sans\b|^blanc\b)/i;
const CUSTOM_HINT = /personnalis/i;

export function defaultOptionSelection(
  categories: DefaultOptCategory[],
  options: DefaultOpt[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const cat of categories) {
    const free = options
      .filter((o) => o.category_id === cat.id && (Number(o.price) || 0) === 0)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (free.length === 0) continue;
    const pick =
      free.find((o) => STANDARD_HINT.test(o.name_fr.trim())) ??
      free.find((o) => !CUSTOM_HINT.test(o.name_fr)) ??
      free[0];
    out[cat.id] = pick.id;
  }
  return out;
}
