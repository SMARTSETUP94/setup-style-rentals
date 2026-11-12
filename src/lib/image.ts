/**
 * Responsive image helpers.
 *
 * Product / category photos stored in Lovable Cloud storage are served through
 * the storage image-transform endpoint (render/image) in 400/800/1200 widths.
 * `resize=contain` keeps the original aspect ratio (without it the service
 * crops to the original height). Stored files are never modified.
 */
const OBJECT_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";
export const RESPONSIVE_WIDTHS = [400, 800, 1200] as const;

export function isStorageImage(url: string | null | undefined): url is string {
  return !!url && url.includes(OBJECT_SEGMENT) && !url.includes("?");
}

export function storageImageAt(url: string, width: number, quality = 75): string {
  return `${url.replace(OBJECT_SEGMENT, RENDER_SEGMENT)}?width=${width}&quality=${quality}&resize=contain`;
}

const isUnsplash = (url: string) => url.startsWith("https://images.unsplash.com/");

function unsplashAt(url: string, width: number): string {
  const u = new URL(url);
  u.searchParams.set("w", String(width));
  return u.toString();
}

/** `{ src, srcSet }` for a remote image, or just `{ src }` when not resizable. */
export function responsiveImage(url: string): { src: string; srcSet?: string } {
  if (isStorageImage(url)) {
    return {
      src: storageImageAt(url, 800),
      srcSet: RESPONSIVE_WIDTHS.map((w) => `${storageImageAt(url, w)} ${w}w`).join(", "),
    };
  }
  if (isUnsplash(url)) {
    return {
      src: unsplashAt(url, 800),
      srcSet: RESPONSIVE_WIDTHS.map((w) => `${unsplashAt(url, w)} ${w}w`).join(", "),
    };
  }
  return { src: url };
}

/** Sizes for the main product photo (3/5 of the container on desktop). */
export const PRODUCT_HERO_SIZES = "(min-width: 1024px) 60vw, 100vw";
/** Sizes for product cards in grids. */
export const CARD_SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";
