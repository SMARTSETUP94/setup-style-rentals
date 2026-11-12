import { useState } from "react";
import { Package } from "lucide-react";
import { CARD_SIZES, responsiveImage } from "@/lib/image";

interface Props {
  name: string;
  category_slug: string;
  image_url?: string | null;
  className?: string;
  /** First visible image (LCP): eager + high priority. */
  priority?: boolean;
  /** `sizes` attribute for the responsive srcset. */
  sizes?: string;
}

/**
 * Product photo served in 400/800/1200 widths (storage image transform).
 * Falls back to the original file if the resized version fails to load,
 * and to a neutral placeholder when no image is set.
 */
export function ProductImage({ name, category_slug: _category_slug, image_url, className, priority = false, sizes = CARD_SIZES }: Props) {
  const [failed, setFailed] = useState(false);
  if (image_url) {
    const r = failed ? { src: image_url } : responsiveImage(image_url);
    return (
      <img
        src={r.src}
        srcSet={r.srcSet}
        sizes={r.srcSet ? sizes : undefined}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        width={800}
        height={600}
        onError={() => {
          if (!failed && r.src !== image_url) setFailed(true);
        }}
        className={className ?? "w-full h-full object-cover"}
      />
    );
  }

  return (
    <div
      className={
        (className ?? "w-full h-full") +
        " bg-secondary flex items-center justify-center"
      }
      role="img"
      aria-label={name}
    >
      <Package className="size-14 text-muted-foreground" strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
