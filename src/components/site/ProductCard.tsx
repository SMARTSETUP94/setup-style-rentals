import { Link } from "@tanstack/react-router";
import { ProductImage } from "@/components/site/ProductImage";
import { pickLang, type Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardData {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  category_slug: string;
  price_day: number;
  image_url: string | null;
}

interface CategoryData {
  slug: string;
  name_fr: string;
  name_en: string;
}

interface Props {
  product: ProductCardData;
  category?: CategoryData;
  lang: Lang;
  fromLabel: string;
  perDayLabel: string;
  className?: string;
  unavailable?: boolean;
  unavailableLabel?: string;
}

/**
 * Premium product card used on the homepage and catalogue.
 * - Category badge in top-left corner over the image
 * - Soft hover scale + shadow
 * - Bold gold price at the bottom
 */
export function ProductCard({
  product,
  category,
  lang,
  fromLabel,
  perDayLabel,
  className,
  unavailable = false,
  unavailableLabel,
}: Props) {
  const categoryLabel = category ? pickLang(category, "name", lang) : product.category_slug;

  return (
    <Link
      to="/produit/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group block bg-card rounded-xl overflow-hidden border border-border transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-18px_rgb(0_0_0_/_0.18)]",
        unavailable && "opacity-60 grayscale",
        className,
      )}
      aria-disabled={unavailable || undefined}
    >
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        <ProductImage
          name={pickLang(product, "name", lang)}
          category_slug={product.category_slug}
          image_url={product.image_url}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm text-foreground border border-white/40 shadow-sm">
          {categoryLabel}
        </span>
        {unavailable && unavailableLabel ? (
          <span className="absolute top-3 right-3 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-destructive text-destructive-foreground shadow-sm">
            {unavailableLabel}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-base leading-snug text-foreground line-clamp-2">
          {pickLang(product, "name", lang)}
        </h3>
        <div className="mt-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {fromLabel}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-display font-semibold text-lg text-gold">
              {formatPrice(product.price_day, lang)}
            </span>
            <span className="text-xs text-muted-foreground">{perDayLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
