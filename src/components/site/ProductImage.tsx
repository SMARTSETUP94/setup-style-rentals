import { categoryColor, initialsFromName } from "@/lib/format";

interface Props {
  name: string;
  category_slug: string;
  image_url?: string | null;
  className?: string;
}

/**
 * Elegant placeholder when no image is set: large initials over a soft tinted
 * gradient using the category color. Falls back to image_url when provided.
 */
export function ProductImage({ name, category_slug, image_url, className }: Props) {
  if (image_url) {
    return (
      <img
        src={image_url}
        alt={name}
        loading="lazy"
        className={className ?? "w-full h-full object-cover"}
      />
    );
  }

  const color = categoryColor(category_slug);
  const initials = initialsFromName(name);

  return (
    <div
      className={className ?? "w-full h-full"}
      style={{
        background: `radial-gradient(120% 120% at 30% 20%, ${color}33 0%, ${color}10 45%, #ffffff 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={name}
    >
      <span
        className="font-display font-bold tracking-tight"
        style={{
          color: "#1A1A1A",
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          letterSpacing: "-0.04em",
        }}
      >
        {initials}
      </span>
    </div>
  );
}
