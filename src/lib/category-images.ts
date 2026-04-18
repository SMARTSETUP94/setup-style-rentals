/**
 * Curated Unsplash imagery per category. Used for homepage category cards.
 * Keep URLs stable (Unsplash photo IDs) and request a reasonable size.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  jeux:
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=70",
  structures:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=70",
  signaletique:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=70",
  decoration:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=70",
  mobilier:
    "https://images.unsplash.com/photo-1519302959554-a75be0afc82a?auto=format&fit=crop&w=1200&q=70",
};

/** Fallback gradient palette per category (used if Unsplash image fails). */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  jeux: "linear-gradient(135deg, #1a1a2e 0%, #c9a96e 100%)",
  structures: "linear-gradient(135deg, #0f172a 0%, #475569 100%)",
  signaletique: "linear-gradient(135deg, #1f2937 0%, #c9a96e 100%)",
  decoration: "linear-gradient(135deg, #2d1b2e 0%, #8b6f47 100%)",
  mobilier: "linear-gradient(135deg, #1c1917 0%, #c9a96e 100%)",
};

export function categoryImage(slug: string): string {
  return (
    CATEGORY_IMAGES[slug] ??
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=70"
  );
}

export function categoryGradient(slug: string): string {
  return CATEGORY_GRADIENTS[slug] ?? "linear-gradient(135deg, #1a1a1a 0%, #c9a96e 100%)";
}

/** Luxury corporate evening event — lounge furniture, ambient lighting. */
export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=2000&q=75";
