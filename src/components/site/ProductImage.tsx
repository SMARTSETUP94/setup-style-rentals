import { Package } from "lucide-react";

interface Props {
  name: string;
  category_slug: string;
  image_url?: string | null;
  className?: string;
  /** First visible image (LCP): eager + high priority. */
  priority?: boolean;
}

/**
 * Elegant placeholder when no image is set: light gray background with a
 * centered Package icon. Falls back to image_url when provided.
 */
export function ProductImage({ name, category_slug: _category_slug, image_url, className, priority = false }: Props) {
  if (image_url) {
    return (
      <img
        src={image_url}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        width={800}
        height={600}
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
      aria-label={name}
    >
      <Package className="size-14 text-muted-foreground/50" strokeWidth={1.25} />
    </div>
  );
}
