import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Plus, Minus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { formatPrice, categoryColor } from "@/lib/format";
import { useCart, volumeDiscount } from "@/lib/cart";
import { ProductImage } from "@/components/site/ProductImage";
import { cn } from "@/lib/utils";

interface Product {
  id: string; slug: string; name_fr: string; name_en: string;
  description_fr: string | null; description_en: string | null;
  category_slug: string; dimensions: string | null;
  price_day: number; price_week: number | null; price_month: number | null;
  deposit: number; image_url: string | null;
  configurator_url: string | null;
}

interface Category { id: string; name_fr: string; name_en: string; slug: string; color: string }

export const Route = createFileRoute("/produit/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const { add } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(async ({ data }) => {
        const prod = data as Product | null;
        setProduct(prod);
        if (prod) {
          const { data: cat } = await supabase
            .from("categories")
            .select("*")
            .eq("slug", prod.category_slug)
            .maybeSingle();
          setCategory(cat as Category | null);
        }
        setLoading(false);
      });
  }, [slug]);

  // auto-compute days from dates
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const d = Math.max(1, Math.ceil((e - s) / 86400000) + 1);
      setDays(d);
    }
  }, [startDate, endDate]);

  const calc = useMemo(() => {
    if (!product) return null;
    const gross = product.price_day * days * qty;
    const discountRate = volumeDiscount(qty);
    const discount = gross * discountRate;
    const net = gross - discount;
    const deposit = product.deposit * qty;
    return { gross, discountRate, discount, net, deposit };
  }, [product, days, qty]);

  if (loading) {
    return (
      <div className="container-x pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-secondary rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-secondary rounded animate-pulse w-3/4" />
            <div className="h-4 bg-secondary rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-x pt-32 pb-24 text-center">
        <h1 className="font-display text-3xl">{t("product.notFound")}</h1>
        <Link to="/catalogue" className="mt-6 inline-flex items-center gap-2 text-accent">
          <ArrowLeft className="size-4" /> {t("product.back")}
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    if (!calc) return;
    add({
      productId: product.id,
      slug: product.slug,
      name_fr: product.name_fr,
      name_en: product.name_en,
      category_slug: product.category_slug,
      image_url: product.image_url,
      price_day: product.price_day,
      deposit: product.deposit,
      quantity: qty,
      days,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    toast.success(t("product.added"), { icon: <Check className="size-4" /> });
  };

  return (
    <div className="pt-20 md:pt-24">
      <div className="container-x py-5">
        <button
          onClick={() => router.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> {t("product.back")}
        </button>
      </div>

      <div className="container-x grid lg:grid-cols-2 gap-8 lg:gap-12 pb-16">
        {/* Image */}
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border sticky top-24 self-start">
          <ProductImage
            name={pickLang(product, "name", lang)}
            category_slug={product.category_slug}
            image_url={product.image_url}
          />
        </div>

        {/* Details */}
        <div>
          {category && (
            <div
              className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                background: `${categoryColor(product.category_slug)}22`,
                color: product.category_slug === "signaletique" ? "#1A1A1A" : categoryColor(product.category_slug),
              }}
            >
              {pickLang(category, "name", lang)}
            </div>
          )}
          <h1 className="mt-4 font-display font-semibold text-[clamp(2rem,4vw,3.25rem)] leading-tight tracking-tight">
            {pickLang(product, "name", lang)}
          </h1>
          {pickLang(product, "description", lang) && (
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {pickLang(product, "description", lang)}
            </p>
          )}
          {product.dimensions && (
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground">Dimensions :</span> <span>{product.dimensions}</span>
            </div>
          )}

          {/* Configurator */}
          {product.configurator_url && (
            <button
              onClick={() => setShow3D(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <Sparkles className="size-4" />
              {t("product.config3d")}
            </button>
          )}

          {/* Price grid */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: t("product.day"), value: product.price_day },
              { label: t("product.week"), value: product.price_week },
              { label: t("product.month"), value: product.price_month },
            ].map((p, i) => (
              <div key={i} className="rounded-lg border border-border p-4 bg-white">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.label}</div>
                {p.value != null ? (
                  <>
                    <div className="text-[10px] text-muted-foreground mt-1">{t("catalog.from")}</div>
                    <div className="font-display font-semibold text-xl">
                      {formatPrice(p.value, lang)}
                    </div>
                  </>
                ) : (
                  <div className="mt-2 font-display font-semibold text-xl">—</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm rounded-lg bg-secondary/60 px-4 py-2.5">
            <span className="text-muted-foreground">{t("product.deposit")}</span>
            <span className="font-semibold">{formatPrice(product.deposit, lang)}</span>
          </div>

          {/* Quantity & dates */}
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">{t("product.startDate")}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("product.endDate")}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">{t("product.qty")}</label>
                <div className="mt-1 flex items-center border border-border rounded-lg">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-secondary"><Minus className="size-4" /></button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center bg-transparent text-sm focus:outline-none"
                  />
                  <button onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:bg-secondary"><Plus className="size-4" /></button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("product.duration")}</label>
                <div className="mt-1 flex items-center border border-border rounded-lg">
                  <button onClick={() => setDays((d) => Math.max(1, d - 1))} className="p-2.5 hover:bg-secondary"><Minus className="size-4" /></button>
                  <div className="flex-1 text-center text-sm">{days} {t("product.days")}</div>
                  <button onClick={() => setDays((d) => d + 1)} className="p-2.5 hover:bg-secondary"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Calc */}
          {calc && (
            <div className="mt-6 rounded-lg border border-border p-4 space-y-2 text-sm">
              <Row label={t("product.subtotal")} value={formatPrice(calc.gross, lang)} />
              {calc.discountRate > 0 && (
                <Row
                  label={`${t("product.discount")} (-${Math.round(calc.discountRate * 100)}%)`}
                  value={`-${formatPrice(calc.discount, lang)}`}
                  highlight
                />
              )}
              <div className="border-t border-border pt-2 flex items-baseline justify-between">
                <div className="font-semibold">Total HT</div>
                <div className="font-display font-bold text-2xl">{formatPrice(calc.net, lang)}</div>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>+ {t("product.deposit")}</span>
                <span>{formatPrice(calc.deposit, lang)}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-lg px-6 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            {t("product.addToQuote")}
          </button>

          <div className="mt-4 text-xs text-muted-foreground">
            {lang === "fr"
              ? "Remises : -10% dès 2, -15% dès 6, -20% dès 10."
              : "Volume discounts: -10% from 2, -15% from 6, -20% from 10."}
          </div>
        </div>
      </div>

      {/* 3D Modal */}
      {show3D && product.configurator_url && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShow3D(false)}
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-6xl h-[85vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShow3D(false)}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white shadow-elev flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
            <iframe
              src={product.configurator_url}
              title={`Configurateur 3D — ${pickLang(product, "name", lang)}`}
              className="w-full h-full border-0"
              allow="fullscreen; xr-spatial-tracking"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(highlight && "text-accent font-medium")}>{value}</span>
    </div>
  );
}
