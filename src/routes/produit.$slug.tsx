import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Sparkles, Plus, Minus, X, Check, ShoppingBag, Wand2, CalendarIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { fr as dfFr, enUS as dfEn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { useCart, volumeDiscount, durationDiscount, DEFAULT_QUANTITY_DISCOUNTS, type SelectedOption, type QuantityDiscountTier, type DurationDiscountTier } from "@/lib/cart";
import { ProductImage } from "@/components/site/ProductImage";
import { LogoUpload } from "@/components/site/LogoUpload";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface OptionCategory {
  id: string;
  name_fr: string;
  name_en: string;
  is_required: boolean;
  sort_order: number;
}

interface ProductOptionRow {
  id: string;
  category_id: string;
  name_fr: string;
  name_en: string;
  price: number;
  sort_order: number;
  is_active: boolean;
}

interface ConfiguratorOption {
  value: string;
  label: string;
  price: number;
}
type ConfiguratorOptionsMap = Record<string, ConfiguratorOption[]>;

interface ConfiguratorConfigData {
  // Free-shape payload from the iframe — typed loosely to support multiple configurators
  [k: string]: unknown;
  price?: number;
}
interface ConfiguratorMessage {
  type: string;
  data?: ConfiguratorConfigData;
  recap?: string;
  recap_html?: string;
  configuration?: ConfiguratorConfigData;
  share_url?: string;
  height?: number;
}

interface Product {
  id: string; slug: string; name_fr: string; name_en: string;
  description_fr: string | null; description_en: string | null;
  category_slug: string; dimensions: string | null;
  price_day: number; price_week: number | null; price_month: number | null;
  deposit: number; image_url: string | null;
  configurator_url: string | null;
  configurator_options: ConfiguratorOptionsMap | null;
  stock_total: number;
  quantity_discounts: QuantityDiscountTier[] | null;
  duration_discounts: DurationDiscountTier[] | null;
}

interface Category { id: string; name_fr: string; name_en: string; slug: string; color: string }

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("slug,name_fr,name_en,description_fr,description_en,image_url,price_day,stock_total,category_slug")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    return { meta: data as { slug: string; name_fr: string; name_en: string; description_fr: string | null; description_en: string | null; image_url: string | null; price_day: number; stock_total: number; category_slug: string } | null };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.meta;
    if (!m) {
      return {
        meta: [
          { title: "Produit — Setup Paris" },
          { name: "description", content: "Location d'objets événementiels à Paris." },
        ],
      };
    }
    const title = `${m.name_fr} — Setup Paris`;
    const description = m.description_fr?.slice(0, 160) || `Louez ${m.name_fr} chez Setup Paris : configurateur 3D, livraison et reprise incluses.`;
    const siteUrl = "https://setup-style-rentals.lovable.app";
    const productUrl = `${siteUrl}/produit/${m.slug}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "product" },
      { property: "og:url", content: productUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (m.image_url) {
      meta.push({ property: "og:image", content: m.image_url });
      meta.push({ name: "twitter:image", content: m.image_url });
    }
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: m.name_fr,
      description,
      sku: m.slug,
      category: m.category_slug,
      url: productUrl,
      brand: { "@type": "Brand", name: "Setup Paris" },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "EUR",
        price: m.price_day.toFixed(2),
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: m.price_day.toFixed(2),
          priceCurrency: "EUR",
          unitCode: "DAY",
          referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" },
        },
        availability: m.stock_total > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        businessFunction: "https://schema.org/LeaseOut",
        seller: { "@type": "Organization", name: "Setup Paris" },
      },
    };
    if (m.image_url) jsonLd.image = m.image_url;
    return {
      meta,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [is3DMode, setIs3DMode] = useState(false);
  const [optionCategories, setOptionCategories] = useState<OptionCategory[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionRow[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});
  /** Category IDs whose option was auto-selected by the 3D configurator (for visual hint). */
  const [autoSelectedCatIds, setAutoSelectedCatIds] = useState<Set<string>>(new Set());
  /** Uploaded client logo (when an option containing "logo" with a price > 0 is selected). */
  const [clientLogo, setClientLogo] = useState<{ url: string; filename: string } | null>(null);

  // 3D configurator integration
  const inlineIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorConfigData | null>(null);
  const [configuratorRecap, setConfiguratorRecap] = useState<string>("");
  const [configuratorRecapHtml, setConfiguratorRecapHtml] = useState<string>("");
  const [iframeHeight, setIframeHeight] = useState<number>(900);
  const configToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownInitialConfigRef = useRef<boolean>(false);
  /** Set when at least one *-config message has been received in the current
   *  immersive session — drives the visibility of the "saved" sticky bar. */
  const [hasSavedConfig, setHasSavedConfig] = useState(false);

  // Availability
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  // Lock body scroll while immersive 3D mode is active
  useEffect(() => {
    if (!is3DMode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [is3DMode]);

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
          const [{ data: cat }, { data: cats }] = await Promise.all([
            supabase.from("categories").select("*").eq("slug", prod.category_slug).maybeSingle(),
            supabase
              .from("product_option_categories")
              .select("*")
              .eq("product_id", prod.id)
              .order("sort_order"),
          ]);
          setCategory(cat as Category | null);
          const catList = (cats as OptionCategory[]) ?? [];
          setOptionCategories(catList);

          if (catList.length > 0) {
            const { data: opts } = await supabase
              .from("product_options")
              .select("*")
              .in("category_id", catList.map((c) => c.id))
              .eq("is_active", true)
              .order("sort_order");
            setProductOptions((opts as ProductOptionRow[]) ?? []);
          } else {
            setProductOptions([]);
          }
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

  // Check availability whenever dates or product change
  useEffect(() => {
    if (!product || !startDate || !endDate) {
      setAvailableStock(null);
      return;
    }
    let cancelled = false;
    setCheckingStock(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("get_available_stock", {
        _product_id: product.id,
        _start_date: startDate,
        _end_date: endDate,
      });
      if (cancelled) return;
      setCheckingStock(false);
      if (error) {
        console.error("availability check failed", error);
        setAvailableStock(null);
        return;
      }
      setAvailableStock(typeof data === "number" ? data : null);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [product, startDate, endDate]);

  // Send dynamic prices to the configurator iframe(s) whenever data is ready
  const sendPricesToIframe = (frame: HTMLIFrameElement | null) => {
    if (!frame || !product) return;
    const opts = product.configurator_options;
    if (!opts || Object.keys(opts).length === 0) return;
    try {
      frame.contentWindow?.postMessage(
        { type: "set-prices", options: opts, basePrice: Number(product.price_day) || 0 },
        "*",
      );
    } catch {
      // ignore cross-origin failures
    }
  };

  // Listen for configurator messages
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as ConfiguratorMessage | undefined;
      if (!d || typeof d !== "object") return;
      if (d.type === "cornhole-ready") {
        // Iframe just signalled it's ready: push prices to whichever iframe sent it
        const src = e.source as Window | null;
        if (inlineIframeRef.current?.contentWindow === src) sendPricesToIframe(inlineIframeRef.current);
      }
      // Accept any "<slug>-config" message from configurator iframes (e.g.
      // cornhole-config, lettres-geantes-config, photobooth-config, …).
      if (typeof d.type === "string" && d.type.endsWith("-config") && d.type !== "configurator-resize") {
        // Newer Pro configurators send `configuration` (preferred) alongside
        // `recap_html` (styled HTML) and `recap` (plain text fallback).
        const cfg = d.configuration ?? d.data;
        if (cfg) setConfiguratorData(cfg);
        if (typeof d.recap === "string") setConfiguratorRecap(d.recap);
        if (typeof d.recap_html === "string") setConfiguratorRecapHtml(d.recap_html);
        setHasSavedConfig(true);
        // Debounced "saved" toast — confirms the recap was captured.
        // Skip the very first auto-fire on iframe load so we don't pop a
        // toast just for opening the configurator.
        if (!hasShownInitialConfigRef.current) {
          hasShownInitialConfigRef.current = true;
        } else {
          if (configToastTimer.current) clearTimeout(configToastTimer.current);
          configToastTimer.current = setTimeout(() => {
            toast.success(t("product.configSavedToast"), {
              icon: <Check className="size-4" />,
              duration: 2200,
            });
          }, 300);
          // Auto-close the immersive 3D mode so the user lands back on the
          // product page where they can pick dates & quantity. The recap is
          // already preserved in state and will render under the CTA.
          setIs3DMode(false);
        }
      }
      if (d.type === "configurator-resize" && typeof d.height === "number" && d.height > 0) {
        setIframeHeight(Math.max(400, Math.min(3000, d.height)));
      }
    };
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("message", onMsg);
      if (configToastTimer.current) clearTimeout(configToastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const selectedOptionsList: SelectedOption[] = useMemo(() => {
    return optionCategories
      .map((c) => {
        const id = selectedOptionIds[c.id];
        if (!id) return null;
        const opt = productOptions.find((o) => o.id === id);
        if (!opt) return null;
        return {
          categoryId: c.id,
          categoryName_fr: c.name_fr,
          categoryName_en: c.name_en,
          optionId: opt.id,
          name_fr: opt.name_fr,
          name_en: opt.name_en,
          price: Number(opt.price) || 0,
        };
      })
      .filter((x): x is SelectedOption => x !== null);
  }, [optionCategories, productOptions, selectedOptionIds]);

  /** Synthetic SelectedOption[] derived from the 3D-configurator iframe payload.
   * NOTE: prices are intentionally forced to 0. The 3D configurator is purely
   * descriptive — its choices appear as a recap/comment on the quote, but never
   * affect the price. Real paid options are managed via the DB option categories
   * (product_option_categories) shown as checkboxes/radios under the configurator. */
  const configuratorOptionsList: SelectedOption[] = useMemo(() => {
    if (!product || !configuratorData) return [];
    const opts = product.configurator_options || {};
    const synthetic: SelectedOption[] = [];
    for (const [groupKey, choices] of Object.entries(opts)) {
      const selectedValue =
        configuratorData[`${groupKey}Finition`] ??
        configuratorData[`${groupKey}Option`] ??
        configuratorData[groupKey];
      if (typeof selectedValue !== "string") continue;
      const match = (choices as ConfiguratorOption[]).find((o) => o.value === selectedValue);
      if (!match) continue;
      synthetic.push({
        categoryId: `cfg-${groupKey}`,
        categoryName_fr: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
        categoryName_en: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
        optionId: `cfg-${groupKey}-${match.value}`,
        name_fr: match.label,
        name_en: match.label,
        price: 0,
      });
    }
    return synthetic;
  }, [product, configuratorData]);

  /** Inverse mapping: given a DB category + option (or null to clear), find the
   * matching configurator group key + value, and post a sync message to both iframes. */
  const syncSelectionToIframe = (catId: string, optId: string | null) => {
    if (!product?.configurator_options) return;
    const cat = optionCategories.find((c) => c.id === catId);
    if (!cat) return;
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const catNames = [norm(cat.name_fr), norm(cat.name_en)];
    const groupKey = Object.keys(product.configurator_options).find((k) => {
      const kn = norm(k);
      return catNames.some((cn) => cn.includes(kn) || kn.includes(cn));
    });
    if (!groupKey) return;
    let value: string | null = null;
    if (optId) {
      const opt = productOptions.find((o) => o.id === optId);
      if (!opt) return;
      const optNames = [norm(opt.name_fr), norm(opt.name_en)];
      const choices = (product.configurator_options[groupKey] || []) as ConfiguratorOption[];
      const match = choices.find((c) => optNames.some((on) => norm(c.label) === on));
      if (!match) return;
      value = match.value;
    }
    const msg = { type: "parent-set-config", group: groupKey, value };
    [inlineIframeRef.current].forEach((frame) => {
      try {
        frame?.contentWindow?.postMessage(msg, "*");
      } catch {
        // ignore cross-origin failures
      }
    });
  };

  // When the 3D configurator selection changes, try to auto-preselect any
  // DB-stored product option whose label matches the configurator choice
  // (e.g., picking "Rouge" in the iframe selects the matching "Rouge" button).
  useEffect(() => {
    if (is3DMode) return;
    setAutoSelectedCatIds(new Set());
    hasShownInitialConfigRef.current = false;
    setHasSavedConfig(false);
  }, [is3DMode]);

  // DB-stored paid options always apply (even in 3D mode the client must still
  // pick them — the 3D recap is informational and attached as a comment).
  const activeSelectedOptionsList = selectedOptionsList;
  const activeConfiguratorOptionsList = is3DMode ? configuratorOptionsList : [];

  /** True if a paid "logo" option is selected (e.g. "Avec logo personnalisé"). */
  const optionRequiresLogo = (opt: { name_fr: string; name_en: string; price: number | string } | null | undefined) => {
    if (!opt) return false;
    const price = Number(opt.price) || 0;
    if (price <= 0) return false;
    const text = `${opt.name_fr} ${opt.name_en}`.toLowerCase();
    return text.includes("logo");
  };

  /** Does any currently-selected option require a logo upload? */
  const logoRequired = useMemo(() => {
    return activeSelectedOptionsList.some((o) =>
      optionRequiresLogo({ name_fr: o.name_fr, name_en: o.name_en, price: o.price }),
    );
  }, [activeSelectedOptionsList]);

  // Clear uploaded logo when no logo-requiring option is selected anymore
  useEffect(() => {
    if (!logoRequired && clientLogo) setClientLogo(null);
  }, [logoRequired, clientLogo]);

  const optionsUnitPrice = useMemo(
    () =>
      activeSelectedOptionsList.reduce((s, o) => s + o.price, 0) +
      activeConfiguratorOptionsList.reduce((s, o) => s + o.price, 0),
    [activeSelectedOptionsList, activeConfiguratorOptionsList],
  );

  const calc = useMemo(() => {
    if (!product) return null;
    const rentalGross = product.price_day * days * qty;
    const optionsGross = optionsUnitPrice * qty; // fixed price, not per day
    const gross = rentalGross + optionsGross;
    const qtyTiers = product.quantity_discounts ?? undefined;
    const durTiers = product.duration_discounts ?? undefined;
    const qtyRate = volumeDiscount(qty, qtyTiers);
    const durRate = durationDiscount(days, durTiers);
    const discountRate = Math.min(0.5, qtyRate + durRate);
    // Discount applies only to rental, not to fixed options
    const discount = rentalGross * discountRate;
    const net = gross - discount;
    const deposit = product.deposit * qty;
    return { gross, discountRate, qtyRate, durRate, discount, net, deposit, optionsUnitPrice };
  }, [product, days, qty, optionsUnitPrice]);

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

  // configuratorOptionsList is computed above (memoized) and reused everywhere.

  /** Reset the 3D configurator: clear local state and reload the iframe(s) to default. */
  const handleResetConfigurator = () => {
    setConfiguratorData(null);
    setConfiguratorRecap("");
    setConfiguratorRecapHtml("");
    [inlineIframeRef.current].forEach((frame) => {
      if (!frame) return;
      try {
        frame.contentWindow?.postMessage({ type: "reset-config" }, "*");
      } catch {
        // ignore cross-origin
      }
      // Force reload to guarantee defaults
      const src = frame.src;
      frame.src = "about:blank";
      setTimeout(() => {
        if (frame) frame.src = src;
      }, 50);
    });
    toast.success(t("product.configResetToast"), { icon: <RotateCcw className="size-4" /> });
  };

  const handleAdd = () => {
    if (!calc) return;
    const missing = optionCategories.filter((c) => c.is_required && !selectedOptionIds[c.id]);
    if (missing.length > 0) {
      const labels = missing.map((c) => pickLang(c, "name", lang)).join(", ");
      toast.error(`${t("product.selectRequired")} ${labels}`);
      return;
    }
    if (logoRequired && !clientLogo) {
      toast.error(t("logoUpload.required"));
      return;
    }
    if (availableStock !== null && qty > availableStock) {
      toast.error(t("product.insufficientStock"));
      return;
    }
    // Always include the DB-stored paid options. In 3D mode, append the
    // configurator's synthetic 0€ options so they appear in the quote recap too.
    const mergedOptions: SelectedOption[] = [
      ...activeSelectedOptionsList,
      ...activeConfiguratorOptionsList,
    ];
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
      selectedOptions: mergedOptions.length > 0 ? mergedOptions : undefined,
      quantityDiscounts: product.quantity_discounts ?? DEFAULT_QUANTITY_DISCOUNTS,
      durationDiscounts: product.duration_discounts ?? [],
      configuratorRecap: is3DMode ? configuratorRecap || undefined : undefined,
      configuratorRecapHtml: is3DMode ? configuratorRecapHtml || undefined : undefined,
      logoUrl: logoRequired && clientLogo ? clientLogo.url : undefined,
      logoFilename: logoRequired && clientLogo ? clientLogo.filename : undefined,
    });
    toast.success(
      is3DMode && (configuratorRecap || configuratorRecapHtml)
        ? t("product.configuredAdded")
        : t("product.added"),
      { icon: <Check className="size-4" /> },
    );
  };

  return (
    <div className="pt-20 md:pt-24">
      {/* Immersive 3D mode — covers the page body, hides title/breadcrumbs/pricing */}
      {product.configurator_url && is3DMode && (
        <div className="fixed inset-0 z-[60] bg-background animate-fade-in md:top-24">
          <div className="relative w-full h-[100dvh] md:h-[calc(100dvh-6rem)]">
            <iframe
              ref={inlineIframeRef}
              src={product.configurator_url}
              title={`${t("product.threeDConfig")} — ${pickLang(product, "name", lang)}`}
              className="block w-full h-full border-0"
              allow="clipboard-write; fullscreen"
              onLoad={() => sendPricesToIframe(inlineIframeRef.current)}
            />
            <button
              type="button"
              onClick={() => setIs3DMode(false)}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-background/90 backdrop-blur border border-border hover:bg-background transition-colors shadow-lg"
              aria-label={t("product.close3D")}
            >
              <X className="size-4" />
              <span className="hidden sm:inline">{t("product.close3D")}</span>
            </button>
            <button
              type="button"
              onClick={handleResetConfigurator}
              className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-background/90 backdrop-blur border border-border hover:bg-background transition-colors shadow-lg"
              aria-label={t("product.configResetToast")}
            >
              <RotateCcw className="size-4" />
            </button>

            {/* Sticky bottom action bar — visible after the user clicks
                "Enregistrer ma configuration" inside the iframe. Lets them
                add to the quote (or close 3D) without leaving immersive. */}
            {hasSavedConfig && (
              <div className="absolute bottom-0 inset-x-0 z-10 bg-background/95 backdrop-blur border-t border-gold/40 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] animate-fade-in">
                <div className="container-x py-3 flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium min-w-0">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-gold/20 text-gold shrink-0">
                      <Check className="size-4" />
                    </span>
                    <span className="truncate">
                      {t("product.configSavedToast").replace(/^✓\s*/, "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIs3DMode(false)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary transition-colors"
                    >
                      {t("product.close3D")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleAdd();
                        setIs3DMode(false);
                      }}
                      disabled={
                        !!(startDate && endDate && availableStock !== null && (availableStock === 0 || qty > availableStock))
                      }
                      className="inline-flex items-center gap-1.5 rounded-md bg-gold text-gold-foreground px-4 py-2 text-sm font-semibold hover:bg-gold/90 shadow-md shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ShoppingBag className="size-4" />
                      {t("product.addToQuote")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container-x py-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/catalogue">{t("nav.catalog")}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/catalogue" search={{ category: category.slug, q: "", sort: "featured" }}>
                      {pickLang(category, "name", lang)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pickLang(product, "name", lang)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Link
          to="/catalogue"
          className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-4" /> {t("product.back")}
        </Link>
      </div>

      <div className="container-x grid lg:grid-cols-5 gap-8 lg:gap-12 pb-20">
        {/* Visual — configurator if available, otherwise product image */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden bg-secondary border border-border lg:sticky lg:top-24 self-start relative">
          <div key="visual-image" className="aspect-[4/3] relative animate-fade-in">
            <ProductImage
              name={pickLang(product, "name", lang)}
              category_slug={product.category_slug}
              image_url={product.image_url}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details — 40% on desktop */}
        <div className="lg:col-span-2">
          {category && (
            <div className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/20">
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

          {product.configurator_url && (
            <button
              type="button"
              onClick={() => setIs3DMode((prev) => !prev)}
              className={cn(
                "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold transition-all duration-300",
                is3DMode
                  ? "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                  : "bg-gold text-gold-foreground hover:bg-gold/90 shadow-md shadow-gold/20 hover:shadow-lg hover:shadow-gold/30",
              )}
            >
              {is3DMode ? <X className="size-4" /> : <Sparkles className="size-4" />}
              {is3DMode ? `✕ ${t("product.close3D")}` : t("product.config3d")}
            </button>
          )}

          {/* Price grid */}
          <div className="mt-8 rounded-xl bg-secondary/60 border border-border p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {t("product.rentalRates")}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("product.day"), value: product.price_day },
                { label: t("product.week"), value: product.price_week },
                { label: t("product.month"), value: product.price_month },
              ].map((p, i) => (
                <div key={i} className="rounded-lg bg-background border border-border p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.label}</div>
                  {p.value != null ? (
                    <div className="mt-2 font-display font-semibold text-xl text-gold">
                      {formatPrice(p.value, lang)}
                    </div>
                  ) : (
                    <div className="mt-2 font-display font-semibold text-xl text-muted-foreground">—</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm pt-3 border-t border-border">
              <span className="text-muted-foreground">{t("product.deposit")}</span>
              <span className="font-semibold">{formatPrice(product.deposit, lang)}</span>
            </div>
          </div>

          {/* 3D configurator recap (informational, sent as comment with the quote) */}
          {is3DMode && (configuratorRecapHtml || configuratorRecap) && (
            <div className="mt-8 rounded-xl border border-gold/40 bg-gold/5 p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-4 text-gold" />
                <div className="text-sm font-semibold">{t("product.configRecapTitle")}</div>
              </div>
              {configuratorRecapHtml ? (
                <div
                  className="text-xs text-muted-foreground leading-relaxed [&_*]:max-w-full"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: configuratorRecapHtml }}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-sans leading-relaxed">
                  {configuratorRecap}
                </pre>
              )}
              <div className="mt-3 pt-3 border-t border-gold/30 text-xs text-foreground/80">
                ⚠️ {t("product.configRecapNotice")}
              </div>
            </div>
          )}

          {/* Customization options — always visible (also in 3D mode, with notice) */}
          {optionCategories.length > 0 && (
            <div className="mt-8 space-y-5 animate-fade-in">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {is3DMode ? t("product.optionsStillRequired") : t("product.customize")}
              </div>
              {optionCategories.map((cat) => {
                const opts = productOptions
                  .filter((o) => o.category_id === cat.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                if (opts.length === 0) return null;
                const selected = selectedOptionIds[cat.id];
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium">{pickLang(cat, "name", lang)}</label>
                      {cat.is_required ? (
                        <span className="text-[10px] uppercase tracking-wider text-destructive">
                          {t("product.required")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOptionIds((prev) => {
                              const next = { ...prev };
                              delete next[cat.id];
                              return next;
                            });
                            setAutoSelectedCatIds((prev) => {
                              if (!prev.has(cat.id)) return prev;
                              const next = new Set(prev);
                              next.delete(cat.id);
                              return next;
                            });
                            syncSelectionToIframe(cat.id, null);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-auto"
                        >
                          {t("product.clear")}
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {opts.map((o) => {
                        const active = selected === o.id;
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setSelectedOptionIds((prev) => ({ ...prev, [cat.id]: o.id }));
                              setAutoSelectedCatIds((prev) => {
                                if (!prev.has(cat.id)) return prev;
                                const next = new Set(prev);
                                next.delete(cat.id);
                                return next;
                              });
                              syncSelectionToIframe(cat.id, o.id);
                            }}
                            className={cn(
                              "text-left rounded-lg border p-3 transition-all",
                              active
                                ? "border-gold bg-gold/5 ring-1 ring-gold"
                                : "border-border hover:border-foreground/30",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-medium inline-flex items-center gap-1.5">
                                {pickLang(o, "name", lang)}
                                {active && autoSelectedCatIds.has(cat.id) && (
                                  <span
                                    title={t("product.autoSelectedHint")}
                                    className="inline-flex items-center text-gold/80"
                                  >
                                    <Wand2 className="size-3.5" />
                                  </span>
                                )}
                              </span>
                              {active && <Check className="size-4 text-gold shrink-0" />}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {o.price > 0
                                ? `+${formatPrice(o.price, lang)}`
                                : t("product.included")}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {(() => {
                      const selectedOpt = opts.find((o) => o.id === selected) ?? null;
                      if (!optionRequiresLogo(selectedOpt)) return null;
                      return (
                        <LogoUpload
                          value={clientLogo}
                          onChange={setClientLogo}
                        />
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity & dates */}
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="product-start-date" className="text-xs text-muted-foreground">{t("product.startDate")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      id="product-start-date"
                      data-testid="start-date-trigger"
                      className={cn(
                        "mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg text-left flex items-center gap-2 hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="size-4 shrink-0 opacity-60" />
                      {startDate
                        ? format(parseISO(startDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn })
                        : t("product.pickDate")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate ? parseISO(startDate) : undefined}
                      onSelect={(d) => {
                        if (!d) return;
                        setStartDate(format(d, "yyyy-MM-dd"));
                        if (endDate && parseISO(endDate) < d) {
                          setEndDate(format(d, "yyyy-MM-dd"));
                        }
                      }}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      locale={lang === "fr" ? dfFr : dfEn}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label htmlFor="product-end-date" className="text-xs text-muted-foreground">{t("product.endDate")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      id="product-end-date"
                      data-testid="end-date-trigger"
                      className={cn(
                        "mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg text-left flex items-center gap-2 hover:bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="size-4 shrink-0 opacity-60" />
                      {endDate
                        ? format(parseISO(endDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn })
                        : t("product.pickDate")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate ? parseISO(endDate) : undefined}
                      onSelect={(d) => {
                        if (!d) return;
                        setEndDate(format(d, "yyyy-MM-dd"));
                      }}
                      disabled={(d) => {
                        const min = startDate ? parseISO(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
                        return d < min;
                      }}
                      locale={lang === "fr" ? dfFr : dfEn}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="product-qty" className="text-xs text-muted-foreground">{t("product.qty")}</label>
                <div className="mt-1 flex items-center border border-border rounded-lg">
                  <button type="button" aria-label={t("product.qtyDecrease")} onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-secondary"><Minus className="size-4" /></button>
                  <input
                    id="product-qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center bg-transparent text-sm focus:outline-none"
                    aria-label={t("product.qty")}
                  />
                  <button type="button" aria-label={t("product.qtyIncrease")} onClick={() => setQty((q) => q + 1)} className="p-2.5 hover:bg-secondary"><Plus className="size-4" /></button>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t("product.duration")}</span>
                <div className="mt-1 flex items-center border border-border rounded-lg" role="group" aria-label={t("product.duration")}>
                  <button type="button" aria-label={t("product.daysDecrease")} onClick={() => setDays((d) => Math.max(1, d - 1))} className="p-2.5 hover:bg-secondary"><Minus className="size-4" /></button>
                  <div className="flex-1 text-center text-sm">{days} {t("product.days")}</div>
                  <button type="button" aria-label={t("product.daysIncrease")} onClick={() => setDays((d) => d + 1)} className="p-2.5 hover:bg-secondary"><Plus className="size-4" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Calc */}
          {calc && (
            <div className="mt-6 rounded-lg border border-border p-4 space-y-2 text-sm">
              <Row
                label={`${t("product.subtotal")} (${formatPrice(product.price_day, lang)} ${t("catalog.perDay")})`}
                value={formatPrice(product.price_day * days * qty, lang)}
              />
              {activeSelectedOptionsList.map((o) => (
                <Row
                  key={o.optionId}
                  label={`+ ${pickLang(o, "name", lang)}`}
                  value={`+${formatPrice(o.price * qty, lang)}`}
                />
              ))}
              {activeConfiguratorOptionsList.length > 0 && (
                <div className="pt-1 border-t border-dashed border-border/60 mt-1">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gold/80 font-semibold mb-1 flex items-center gap-1">
                    <Wand2 className="size-3" />
                    {t("product.threeDConfiguration")}
                  </div>
                  {activeConfiguratorOptionsList.map((o) => (
                    <Row
                      key={o.optionId}
                      label={`+ ${o.categoryName_fr ? `${pickLang(o, "categoryName", lang)} : ` : ""}${pickLang(o, "name", lang)}`}
                      value={o.price > 0 ? `+${formatPrice(o.price * qty, lang)}` : t("product.included")}
                    />
                  ))}
                </div>
              )}
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

          {/* Availability indicator (visible once dates are picked) */}
          {startDate && endDate && (
            <div
              className={cn(
                "mt-6 rounded-lg border p-3 text-sm flex items-start gap-2",
                checkingStock
                  ? "border-border bg-secondary/40 text-muted-foreground"
                  : availableStock === null
                    ? "border-border bg-secondary/40 text-muted-foreground"
                    : availableStock === 0
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : qty > availableStock
                        ? "border-destructive/40 bg-destructive/5 text-destructive"
                        : availableStock <= 2
                          ? "border-gold/40 bg-gold/5 text-gold"
                          : "border-accent/40 bg-accent/5 text-accent",
              )}
            >
              <span className="mt-0.5 size-2 rounded-full shrink-0 bg-current" />
              <span>
                {checkingStock
                  ? t("product.checkingAvail")
                  : availableStock === null
                    ? t("product.notChecked")
                    : availableStock === 0
                      ? t("product.unavailable")
                      : qty > availableStock
                        ? `${t("product.insufficientStock")} (${availableStock} / ${qty})`
                        : (() => {
                            const sd = format(parseISO(startDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn });
                            const ed = format(parseISO(endDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn });
                            return lang === "fr"
                              ? `${availableStock} ${t("product.unitsAvailable")} : ${sd} → ${ed}`
                              : `${availableStock} ${t("product.unitsAvailable")}: ${sd} → ${ed}`;
                          })()}
              </span>
            </div>
          )}

          {/* Unified add-to-quote button (always visible — the 3D recap card above
              already shows the configuration summary as a comment). */}
          <button
            onClick={handleAdd}
            disabled={
              !!(startDate && endDate && availableStock !== null && (availableStock === 0 || qty > availableStock))
            }
            className="mt-6 w-full inline-flex items-center justify-center gap-2.5 bg-gold text-gold-foreground rounded-md px-6 py-5 text-base font-semibold tracking-wide hover:bg-gold/90 transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold animate-fade-in"
          >
            <ShoppingBag className="size-5" />
            {t("product.addToQuote")}
          </button>


          {(() => {
            const qTiers = [...(product.quantity_discounts ?? [])].sort((a, b) => a.min_qty - b.min_qty);
            const dTiers = [...(product.duration_discounts ?? [])].sort((a, b) => a.min_days - b.min_days);
            if (qTiers.length === 0 && dTiers.length === 0) return null;
            const fmtQ = qTiers
              .map((tier) => `-${Math.round(tier.rate * 100)}% ${t("product.from")} ${tier.min_qty}`)
              .join(", ");
            const fmtD = dTiers
              .map((tier) => `-${Math.round(tier.rate * 100)}% ${t("product.from")} ${tier.min_days} ${t("product.daysShort")}`)
              .join(", ");
            return (
              <div className="mt-4 text-xs text-muted-foreground space-y-0.5">
                {qTiers.length > 0 && (
                  <div>
                    {t("product.volumeDiscounts")} : {fmtQ}.
                  </div>
                )}
                {dTiers.length > 0 && (
                  <div>
                    {t("product.durationDiscounts")} : {fmtD}.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Configuration recap (full width) — only shown as hint when nothing has been configured yet */}
      {product.configurator_url && is3DMode && !configuratorData && !configuratorRecap && !configuratorRecapHtml && (
        <section id="configurator-preview" className="container-x pb-20 scroll-mt-24">
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("product.yourConfiguration")}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {t("product.summary")}
            </h2>
          </div>
          <aside className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col">
            <div className="text-xs text-muted-foreground text-center py-8 px-4">
              {t("product.configHint")}
            </div>
          </aside>
        </section>
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
