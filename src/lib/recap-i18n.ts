import type { Lang } from "@/lib/i18n";

/**
 * Bidirectional FR<->EN dictionary used to harmonize the configurator
 * `recap_html` payload across languages.
 *
 * The 3D configurators are external (Netlify) and currently emit their
 * recap in a single language (their internal default). Until they accept
 * a `?lang=` parameter, we translate the recap on the fly so the labels
 * shown on the product page, the quote page and any export stay coherent
 * with the active site language.
 *
 * Strategy: text-node only replacement. We never touch attributes, tag
 * names, classes or styles — only the visible text contents. Matches are
 * case-insensitive but preserve the original casing pattern (UPPER, Title,
 * lower) for the replacement.
 *
 * Add new entries here when you spot a missing label coming from a
 * configurator iframe. Keep entries scoped to **option / category / value
 * names** — never translate prices, dimensions or proper nouns.
 */
const PAIRS: Array<[string, string]> = [
  // Generic configurator headings
  ["Récapitulatif", "Summary"],
  ["Configuration", "Configuration"],
  ["Votre configuration", "Your configuration"],
  ["Choix", "Choice"],
  ["Personnalisation", "Customization"],
  ["Options", "Options"],
  ["Inclus", "Included"],
  ["Sans", "None"],
  ["Sans personnalisation", "No customization"],
  ["Avec personnalisation", "With customization"],

  // Common option groups across the 5 configurators
  ["Couleur", "Color"],
  ["Couleurs", "Colors"],
  ["Couleur personnalisée", "Custom color"],
  ["Couleur de la structure", "Structure color"],
  ["Couleur du panneau", "Panel color"],
  ["Couleur des picots", "Peg color"],
  ["Couleur des cibles", "Target color"],
  ["Finition", "Finish"],
  ["Finition structure", "Structure finish"],
  ["Structure", "Structure"],
  ["Cadre", "Frame"],
  ["Cadre extérieur", "Outer frame"],
  ["Habillage", "Wrap"],
  ["Habillage panneaux", "Panel wrap"],
  ["Décor", "Decor"],
  ["Décor du fond", "Background decor"],
  ["Fond", "Background"],
  ["Fond de décor", "Backdrop"],
  ["Personnalisation fond de décor", "Backdrop customization"],
  ["Panneau arrière", "Back panel"],
  ["Adhésif personnalisé", "Custom sticker"],
  ["Adhésif", "Sticker"],
  ["Visuel", "Visual"],
  ["Visuel adhésif", "Adhesive visual"],

  // Chamboule-tout
  ["Boîtes", "Cans"],
  ["Personnalisation graphique des boîtes", "Custom can graphics"],
  ["Habillage base brandé", "Branded base wrap"],
  ["Animateur dédié", "Dedicated host"],
  ["par jour", "per day"],

  // Plinko / Basketball / Stand de tir / Mini-golf shared vocabulary
  ["Plateau", "Board"],
  ["Cibles", "Targets"],
  ["Cible", "Target"],
  ["Panier", "Hoop"],
  ["Filet", "Net"],
  ["Balles", "Balls"],
  ["Balle", "Ball"],
  ["Trous", "Holes"],
  ["Parcours", "Course"],
  ["Module", "Module"],
  ["Modules", "Modules"],

  // Common values
  ["Standard", "Standard"],
  ["Mat", "Matte"],
  ["Brillant", "Glossy"],
  ["Bois", "Wood"],
  ["Métal", "Metal"],
  ["Noir", "Black"],
  ["Blanc", "White"],
  ["Rouge", "Red"],
  ["Bleu", "Blue"],
  ["Vert", "Green"],
  ["Jaune", "Yellow"],
  ["Orange", "Orange"],
  ["Rose", "Pink"],
  ["Violet", "Purple"],
  ["Gris", "Gray"],
  ["Marron", "Brown"],
  ["Doré", "Gold"],
  ["Argenté", "Silver"],

  // Misc
  ["Quantité", "Quantity"],
  ["Dimensions", "Dimensions"],
  ["Taille", "Size"],
  ["Hauteur", "Height"],
  ["Largeur", "Width"],
  ["Profondeur", "Depth"],
];

type Direction = "fr-to-en" | "en-to-fr";

/**
 * Build a sorted list of [pattern, replacement] pairs for a given direction.
 * Sorted by source length DESC so that "Personnalisation fond de décor" is
 * matched before the shorter "Personnalisation" / "Décor".
 */
function buildMap(direction: Direction): Array<[string, string]> {
  const list = PAIRS.map(([fr, en]) =>
    direction === "fr-to-en" ? ([fr, en] as [string, string]) : ([en, fr] as [string, string]),
  );
  // Drop self-mapping pairs (e.g. "Configuration"/"Configuration") to avoid
  // wasted regex passes that can't change anything.
  return list
    .filter(([from, to]) => from.toLowerCase() !== to.toLowerCase())
    .sort((a, b) => b[0].length - a[0].length);
}

const FR_TO_EN = buildMap("fr-to-en");
const EN_TO_FR = buildMap("en-to-fr");

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Preserve original casing pattern (UPPER, Title, lower) of `match` on `repl`. */
function preserveCase(match: string, repl: string): string {
  if (match === match.toUpperCase() && match !== match.toLowerCase()) {
    return repl.toUpperCase();
  }
  if (match[0] === match[0]?.toUpperCase()) {
    return repl.charAt(0).toUpperCase() + repl.slice(1);
  }
  return repl.toLowerCase();
}

/**
 * Translate the visible text inside an HTML string using the FR<->EN
 * dictionary, leaving tags, attributes and structure untouched. Safe to
 * call on already-sanitized HTML.
 *
 * Heuristic to detect the source language: if the HTML contains more
 * unique FR-only keys than EN-only ones, we treat it as FR. Otherwise EN.
 * Already-correct languages are returned unchanged.
 */
export function translateRecapHtml(html: string, target: Lang): string {
  if (!html) return "";

  // Quick language detection on visible text only (strip tags).
  const text = html.replace(/<[^>]*>/g, " ");
  const lower = text.toLowerCase();
  let frHits = 0;
  let enHits = 0;
  for (const [fr, en] of PAIRS) {
    if (fr.toLowerCase() === en.toLowerCase()) continue;
    if (lower.includes(fr.toLowerCase())) frHits++;
    if (lower.includes(en.toLowerCase())) enHits++;
  }
  const sourceLang: Lang = frHits >= enHits ? "fr" : "en";
  if (sourceLang === target) return html;

  const map = target === "en" ? FR_TO_EN : EN_TO_FR;

  // Replace inside text nodes only — split on tags, transform text chunks.
  return html
    .split(/(<[^>]+>)/g)
    .map((chunk) => {
      if (chunk.startsWith("<")) return chunk;
      let out = chunk;
      for (const [from, to] of map) {
        const re = new RegExp(`\\b${escapeRegex(from)}\\b`, "gi");
        out = out.replace(re, (m) => preserveCase(m, to));
      }
      return out;
    })
    .join("");
}