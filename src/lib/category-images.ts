/**
 * Curated Unsplash imagery per category. Used for homepage category cards.
 * Keep URLs stable (Unsplash photo IDs) and request a reasonable size.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  jeux:
    "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1200&q=70",
  structures:
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=70",
  signaletique:
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=70",
  decoration:
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=70",
  mobilier:
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=70",
};

export function categoryImage(slug: string): string {
  return (
    CATEGORY_IMAGES[slug] ??
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70"
  );
}

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=75";
