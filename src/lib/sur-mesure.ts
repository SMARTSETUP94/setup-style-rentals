import { z } from "zod";

export type SurMesureFamily = "accueil" | "presentation" | "decor" | "assises";

export interface SurMesurePiece {
  k: string;
  fam: SurMesureFamily;
  nom: string;
  name_en: string;
  desc: string;
  desc_en: string;
}

export const SUR_MESURE_FAMILIES: Array<{ key: SurMesureFamily; fr: string; en: string }> = [
  { key: "accueil", fr: "Accueil et service", en: "Reception and service" },
  { key: "presentation", fr: "Présentation de produits", en: "Product display" },
  { key: "decor", fr: "Décor et signalétique", en: "Decor and signage" },
  { key: "assises", fr: "Assises et végétal", en: "Seating and planters" },
];

export const SUR_MESURE_PIECES: SurMesurePiece[] = [
  { k: "comptoir", fam: "accueil", nom: "Comptoir", name_en: "Counter", desc: "Comptoir d'accueil droit, ouvert côté service ou fermé sur quatre faces.", desc_en: "Straight reception counter, open on the service side or closed on all four sides." },
  { k: "comptoirL", fam: "accueil", nom: "Comptoir d'angle", name_en: "Corner counter", desc: "Comptoir en L : une façade principale et un retour, pour tenir un angle ou fermer un espace d'accueil.", desc_en: "L-shaped counter: a main front and a return, to hold a corner or close off a reception area." },
  { k: "bar", fam: "accueil", nom: "Bar ou desk DJ", name_en: "Bar or DJ booth", desc: "Meuble à deux niveaux : une tablette haute côté public, un plan de travail plus bas côté service. Sert de bar comme de desk DJ.", desc_en: "Two-level unit: a high shelf on the guest side and a lower worktop on the service side. Works as a bar or a DJ booth." },
  { k: "pupitre", fam: "accueil", nom: "Pupitre", name_en: "Lectern", desc: "Pupitre de conférencier, tablette inclinée avec rebord, façade pleine côté salle.", desc_en: "Speaker's lectern with a sloped, lipped top and a solid front facing the audience." },
  { k: "table", fam: "accueil", nom: "Table", name_en: "Table", desc: "Table sur mesure, du plan de travail à la table de présentation, sur jouées, sur caisson ou sur piètement en tube acier.", desc_en: "Made-to-measure table, from worktop to display table, on side panels, a cabinet base or a steel-tube frame." },
  { k: "mangeDebout", fam: "accueil", nom: "Mange-debout", name_en: "Poseur table", desc: "Table haute, plateau rond ou carré, sur colonne en bois ou sur fût acier avec platine.", desc_en: "High table with a round or square top, on a wooden column or a steel post with base plate." },
  { k: "stele", fam: "presentation", nom: "Stèle", name_en: "Plinth", desc: "Socle de présentation à quatre faces, avec capot plexi en option pour protéger l'objet exposé.", desc_en: "Four-sided display plinth, with an optional acrylic cover to protect the item on show." },
  { k: "podium", fam: "presentation", nom: "Podium", name_en: "Podium", desc: "Podium bas rectangulaire, dessus peint, plaqué ou habillé de moquette.", desc_en: "Low rectangular podium with a painted, veneered or carpeted top." },
  { k: "socleRond", fam: "presentation", nom: "Socle rond", name_en: "Round plinth", desc: "Socle ou podium cylindrique, jupe cintrée, dessus en disque.", desc_en: "Cylindrical plinth or podium with a curved skirt and a disc top." },
  { k: "cubes", fam: "presentation", nom: "Cubes gigognes", name_en: "Nesting cubes", desc: "Série de cubes à cinq faces, de taille décroissante, qui s'emboîtent pour le transport.", desc_en: "Set of five-sided cubes in decreasing sizes that nest inside each other for transport." },
  { k: "gradin", fam: "presentation", nom: "Gradin", name_en: "Tiered stand", desc: "Présentoir à marches pour étager des produits, ou petit gradin d'assise.", desc_en: "Stepped display to tier products, or a small bleacher-style seat." },
  { k: "etagere", fam: "presentation", nom: "Étagère à casiers", name_en: "Cubby shelving", desc: "Bibliothèque de présentation à casiers réguliers, avec ou sans fond.", desc_en: "Display bookcase with regular cubbies, with or without a back panel." },
  { k: "urne", fam: "presentation", nom: "Urne", name_en: "Ballot box", desc: "Urne en plexi avec fente, pour jeu-concours, votes ou collecte, sur socle en option.", desc_en: "Acrylic box with a slot for prize draws, votes or collections, with an optional stand." },
  { k: "portant", fam: "presentation", nom: "Portant", name_en: "Clothing rail", desc: "Portant à vêtements en tube acier, avec tablette basse en option, pour un pop-up ou une loge.", desc_en: "Steel-tube clothing rail with an optional lower shelf, for a pop-up store or a dressing room." },
  { k: "totem", fam: "decor", nom: "Totem", name_en: "Totem sign", desc: "Totem signalétique en caisson, une ou deux faces imprimées, sur socle débordant.", desc_en: "Box-built signage totem, printed on one or two sides, on an oversized base." },
  { k: "mur", fam: "decor", nom: "Mur d'image", name_en: "Image wall", desc: "Fond de scène ou photocall autoportant.", desc_en: "Free-standing stage backdrop or photo wall." },
  { k: "cacheRegie", fam: "decor", nom: "Cache-régie", name_en: "Tech-desk screen", desc: "Écran bas en U qui masque une régie technique ou un poste de travail.", desc_en: "Low U-shaped screen that hides a technical control desk or a workstation." },
  { k: "arche", fam: "decor", nom: "Arche d'entrée", name_en: "Entrance arch", desc: "Portique d'entrée en caissons, linteau droit ou cintré, avec logo sur le linteau.", desc_en: "Box-built entrance gateway with a straight or curved lintel carrying your logo." },
  { k: "lettres", fam: "decor", nom: "Lettres géantes", name_en: "Giant letters", desc: "Mot ou sigle en lettres volume, à poser au sol ou sur un socle commun.", desc_en: "A word or initials in 3D letters, standing on the floor or on a shared base." },
  { k: "cadre", fam: "decor", nom: "Cadre photo géant", name_en: "Giant photo frame", desc: "Cadre à selfie léger, peint ou imprimé.", desc_en: "Lightweight selfie frame, painted or printed." },
  { k: "claustra", fam: "decor", nom: "Claustra", name_en: "Slatted screen", desc: "Cloison ajourée en tasseaux verticaux, pour séparer sans fermer.", desc_en: "Open partition made of vertical battens, to divide a space without closing it off." },
  { k: "banc", fam: "assises", nom: "Banc", name_en: "Bench", desc: "Banc ou banquette en caisson, assise en bois ou garnie de mousse et de tissu.", desc_en: "Box-built bench or banquette with a wooden seat or a foam-and-fabric cushion." },
  { k: "pouf", fam: "assises", nom: "Pouf", name_en: "Pouf", desc: "Pouf cube ou cylindre, entièrement garni de tissu.", desc_en: "Cube or cylinder pouf, fully upholstered in fabric." },
  { k: "jardiniere", fam: "assises", nom: "Jardinière", name_en: "Planter", desc: "Bac à plantes en caisson, avec double fond.", desc_en: "Box-built planter with a false bottom." },
];

export const SUR_MESURE_KEYS = SUR_MESURE_PIECES.map((p) => p.k) as [string, ...string[]];
export const getPiece = (k: string | undefined | null) => SUR_MESURE_PIECES.find((p) => p.k === k);

/** Rental product slug → closest made-to-measure piece. */
export const PRODUCT_TO_PIECE: Record<string, string> = {
  stele: "stele",
  "stele-miroir": "stele",
  "bar-arrondi": "bar",
  bar: "bar",
  "bar-led": "bar",
  "mange-debout": "mangeDebout",
  podium: "podium",
  pouf: "pouf",
  "lettres-geantes": "lettres",
  "cache-regie": "cacheRegie",
  comptoir: "comptoir",
  table: "table",
};

export const THUMB_PREFIX = "data:image/jpeg;base64,";

export const SurMesureConfigMessage = z.object({
  type: z.literal("sur-mesure-config"),
  action: z.enum(["change", "save"]),
  configuration: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length <= 20000, "configuration too large"),
  reference: z.string().max(120),
  piece: z.enum(SUR_MESURE_KEYS),
  piece_name: z.string().max(80),
  quantity: z.number().int().min(1).max(50),
  weight_kg: z.number().min(0).max(5000),
  alerts: z.array(z.string().max(400)).max(12),
  recap: z.string().max(5000),
  thumbnail: z
    .string()
    .max(160000)
    .refine((s) => s.startsWith(THUMB_PREFIX), "thumbnail must be a JPEG data URL")
    .nullable(),
});
export type SurMesureConfig = z.infer<typeof SurMesureConfigMessage>;

// ---- Shareable resume link (?c=base64url(JSON {piece, configuration})) ----
export const CONFIG_LINK_MAX = 6000;

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Encoded `c` param, or null if too long. Never contains prices. */
export function encodeConfigParam(piece: string, configuration: Record<string, unknown>): string | null {
  try {
    const c = b64urlEncode(JSON.stringify({ piece, configuration }));
    return c.length <= CONFIG_LINK_MAX ? c : null;
  } catch {
    return null;
  }
}

/** Decodes and validates a `c` param for the given piece. */
export function decodeConfigParam(c: string | undefined, piece: string): Record<string, unknown> | null {
  if (!c || c.length > CONFIG_LINK_MAX || !/^[A-Za-z0-9_-]+$/.test(c)) return null;
  try {
    const v = JSON.parse(b64urlDecode(c)) as unknown;
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const o = v as { piece?: unknown; configuration?: unknown };
    if (o.piece !== piece) return null;
    const conf = o.configuration;
    if (!conf || typeof conf !== "object" || Array.isArray(conf)) return null;
    return conf as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Absolute or relative resume URL for a configuration. */
export function configLink(piece: string, configuration: Record<string, unknown> | undefined, base = ""): string | null {
  if (!configuration) return null;
  const c = encodeConfigParam(piece, configuration);
  return c ? `${base}/sur-mesure/${encodeURIComponent(piece)}?c=${c}` : null;
}
