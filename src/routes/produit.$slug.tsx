import { defaultOptionSelection, BRAND_3D_SLUGS } from "@/lib/default-options";
import { matchConfigToOptions, recapPairs, type ConfigChoices } from "@/lib/config-match";
import { trackSiteEvent } from "@/lib/track";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { ArrowLeft, Sparkles, Plus, Minus, X, Check, ShoppingBag, Wand2, CalendarIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { fr as dfFr, enUS as dfEn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { computeLine } from "@/lib/pricing";
import { useCart, DEFAULT_QUANTITY_DISCOUNTS, type SelectedOption, type QuantityDiscountTier, type DurationDiscountTier } from "@/lib/cart";
import { ProductImage } from "@/components/site/ProductImage";
import { PRODUCT_HERO_SIZES, responsiveImage } from "@/lib/image";

/** Preload the main product photo with the same srcset the page renders. */
function preloadFor(url: string) {
  const r = responsiveImage(url);
  return r.srcSet
    ? { rel: "preload", as: "image", href: r.src, imageSrcSet: r.srcSet, imageSizes: PRODUCT_HERO_SIZES, fetchpriority: "high" }
    : { rel: "preload", as: "image", href: url, fetchpriority: "high" };
}
import { LogoUpload } from "@/components/site/LogoUpload";
import { sanitizeAndTranslateRecapHtml } from "@/lib/sanitize-recap";
import { canonicalUrl, headLang, L, localeMeta, seoLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/site/LazyCalendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRODUCT_TO_PIECE } from "@/lib/sur-mesure";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  /** Optional explicit signal flags some configurators send alongside a
   *  `*-config` payload to mark a deliberate user "Save" click. */
  action?: string;
  event?: string;
  trigger?: string;
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
  price_event: number | null;
  event_days_included: number;
  price_extra_day: number | null;
  custom_label_fr: string | null;
  custom_label_en: string | null;
  custom_price: number | null;
}

interface Category { id: string; name_fr: string; name_en: string; slug: string; color: string }

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("slug,name_fr,name_en,description_fr,description_en,image_url,price_day,price_event,stock_total,category_slug")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    return { meta: data as { slug: string; name_fr: string; name_en: string; description_fr: string | null; description_en: string | null; image_url: string | null; price_day: number; price_event: number | null; stock_total: number; category_slug: string } | null };
  },
  head: ({ loaderData, match }) => {
    const lang = headLang(match);
    const m = loaderData?.meta;
    if (!m) {
      return {
        meta: [
          { title: L(lang, "Produit — Setup Paris", "Product — Setup Paris") },
          { name: "description", content: L(lang, "Location d'objets événementiels à Paris.", "Event object rentals in Paris.") },
        ],
      };
    }
    const name = lang === "en" ? m.name_en || m.name_fr : m.name_fr;
    const desc = lang === "en" ? m.description_en || m.description_fr : m.description_fr;
    const title = `${name} — Setup Paris`;
    const description = desc?.slice(0, 160) || L(lang, `Louez ${name} chez Setup Paris : configurateur 3D. Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis.`, `Rent ${name} from Setup Paris with a 3D configurator. Delivery, setup and pickup: indicative flat fee for Paris & Île-de-France, confirmed in the quote.`);
    const productUrl = canonicalUrl(`/produit/${m.slug}`, lang);
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
      ...localeMeta(lang),
    ];
    if (m.image_url) {
      meta.push({ property: "og:image", content: m.image_url });
      meta.push({ name: "twitter:image", content: m.image_url });
    }
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name,
      description,
      inLanguage: lang,
      sku: m.slug,
      category: m.category_slug,
      url: productUrl,
      brand: { "@type": "Brand", name: "Setup Paris" },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "EUR",
        price: Number(m.price_event ?? m.price_day).toFixed(2),
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: Number(m.price_event ?? m.price_day).toFixed(2),
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
    const breadcrumbsLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: L(lang, "Accueil", "Home"), item: canonicalUrl("/", lang) },
        { "@type": "ListItem", position: 2, name: "Catalogue", item: canonicalUrl("/catalogue", lang) },
        {
          "@type": "ListItem",
          position: 3,
          name: m.category_slug,
          item: canonicalUrl(`/categorie/${encodeURIComponent(m.category_slug)}`, lang),
        },
        { "@type": "ListItem", position: 4, name, item: productUrl },
      ],
    };
    return {
      meta,
      links: [
        ...seoLinks(`/produit/${m.slug}`, lang),
        ...(m.image_url ? [preloadFor(m.image_url)] : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbsLd),
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
  const viewedSlug = product?.slug;
  useEffect(() => {
    if (viewedSlug) trackSiteEvent("product_view", viewedSlug);
  }, [viewedSlug]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [customChosen, setCustomChosen] = useState(false);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [is3DMode, setIs3DMode] = useState(false);
  const [optionCategories, setOptionCategories] = useState<OptionCategory[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOptionRow[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});
  /** Category IDs whose option was auto-selected by the 3D configurator (for visual hint). */
  const [autoSelectedCatIds, setAutoSelectedCatIds] = useState<Set<string>>(new Set());
  /** Categories the visitor picked/cleared by hand — never overridden by the 3D preselection. */
  const manualCatIdsRef = useRef<Set<string>>(new Set());
  /** Required categories left empty on the last add attempt (inline error). */
  const [missingCatIds, setMissingCatIds] = useState<Set<string>>(new Set());
  /** Uploaded client logo (when an option containing "logo" with a price > 0 is selected). */
  const [clientLogo, setClientLogo] = useState<{ url: string; filename: string } | null>(null);

  // 3D configurator integration
  const inlineIframeRef = useRef<HTMLIFrameElement | null>(null);
  const close3DButtonRef = useRef<HTMLButtonElement | null>(null);
  /** Origin of the configurator iframe — target for outgoing postMessage. */
  const configuratorOrigin = (() => {
    try {
      return product?.configurator_url
        ? new URL(product.configurator_url, typeof window !== "undefined" ? window.location.href : "https://catalogue.setup.paris").origin
        : null;
    } catch {
      return null;
    }
  })();
  const configuratorOriginRef = useRef<string | null>(configuratorOrigin);
  configuratorOriginRef.current = configuratorOrigin;
  const [configuratorData, setConfiguratorData] = useState<ConfiguratorConfigData | null>(null);
  const [configuratorRecap, setConfiguratorRecap] = useState<string>("");
  const [configuratorRecapHtml, setConfiguratorRecapHtml] = useState<string>("");
  const [iframeHeight, setIframeHeight] = useState<number>(900);
  const configToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownInitialConfigRef = useRef<boolean>(false);
  /** Controls the "are you sure you want to close?" dialog shown when the
   *  user clicks Close on the immersive 3D iframe before sending an
   *  explicit save signal from the configurator. */
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  /** Timestamp (ms) when the immersive 3D iframe was last opened. Used to
   *  ignore the burst of auto-emitted `*-config` messages that some
   *  configurators fire on initial mount/render — only messages arriving
   *  meaningfully after the open are treated as user "Save" clicks. */
  const iframeOpenedAtRef = useRef<number>(0);
  /** Always-fresh mirror of `configuratorData` so the long-lived `message`
   *  listener (whose closure is captured once per product) can read the
   *  latest saved configuration when the user clicks "Modifier". */
  const configuratorDataRef = useRef<ConfiguratorConfigData | null>(null);
  useEffect(() => {
    configuratorDataRef.current = configuratorData;
  }, [configuratorData]);
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
      // Public visitors only get active products (RLS); admins can preview inactive ones.
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
            const optRows = (opts as ProductOptionRow[]) ?? [];
            setProductOptions(optRows);
            setSelectedOptionIds((prev) => ({ ...defaultOptionSelection(catList, optRows), ...prev }));
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
        configuratorOriginRef.current ?? window.location.origin,
      );
    } catch {
      // ignore cross-origin failures
    }
  };

  /** Replay the previously-saved configuration into a freshly-loaded iframe.
   * Sends both a generic `restore-config` payload (newer Pro configurators)
   * and per-group `parent-set-config` messages (legacy support) so the user
   * lands back on the exact options they had picked before clicking Modifier. */
  const restoreConfigToIframe = (frame: HTMLIFrameElement | null) => {
    if (!frame || !configuratorData) return;
    const win = frame.contentWindow;
    if (!win) return;
    try {
      // Newer Pro configurators (Basketball, Chamboule-tout, Mini-Golf, …)
      // accept the full payload back.
      win.postMessage({ type: "restore-config", configuration: configuratorData }, configuratorOriginRef.current ?? window.location.origin);
      // Legacy fallback: per-field messages keyed by the configurator group.
      const opts = product?.configurator_options ?? {};
      for (const groupKey of Object.keys(opts)) {
        const value =
          configuratorData[`${groupKey}Finition`] ??
          configuratorData[`${groupKey}Option`] ??
          configuratorData[groupKey];
        if (typeof value === "string") {
          win.postMessage({ type: "parent-set-config", group: groupKey, value }, configuratorOriginRef.current ?? window.location.origin);
        }
      }
    } catch {
      // ignore cross-origin failures
    }
  };

  // Listen for configurator messages
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      // Whitelist: configurator origin + this site's own origin, and the
      // sender must be one of our configurator iframes.
      const allowed = [configuratorOriginRef.current, window.location.origin].filter(Boolean);
      if (!allowed.includes(e.origin)) return;
      const frames = [inlineIframeRef.current].filter(Boolean) as HTMLIFrameElement[];
      if (!e.source || !frames.some((f) => f.contentWindow === e.source)) return;
      const d = e.data as ConfiguratorMessage | undefined;
      if (!d || typeof d !== "object") return;
      // Generic "ready" handshake — accept legacy `cornhole-ready` and any
      // newer `*-ready` / `configurator-ready` signal so we know the iframe
      // is mounted and listening for `set-prices` / `restore-config`.
      if (
        typeof d.type === "string" &&
        (d.type === "configurator-ready" || d.type.endsWith("-ready"))
      ) {
        const src = e.source as Window | null;
        if (inlineIframeRef.current?.contentWindow === src) {
          sendPricesToIframe(inlineIframeRef.current);
          if (configuratorDataRef.current) restoreConfigToIframe(inlineIframeRef.current);
        }
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
        // Auto-close ONLY on an explicit save signal. Configurators emit
        // `*-config` continuously (initial mount, every interactive change),
        // so a time-based heuristic is unreliable. We accept any of the
        // following as an explicit "Save" intent:
        //   • `d.type` ending in `-save` / `-saved` (e.g. `cornhole-save`)
        //   • `d.action`/`d.event`/`d.trigger` flags piggy-backed onto
        //     `*-config` with values like "save", "saved", "submit", "confirm"
        // Otherwise we silently persist the recap and keep the iframe open;
        // the user closes manually via the "Fermer" button (with confirm).
        const flag = (d.action ?? d.event ?? d.trigger ?? "").toLowerCase();
        const typeStr = d.type.toLowerCase();
        const isExplicitSave =
          flag === "save" ||
          flag === "saved" ||
          flag === "submit" ||
          flag === "confirm" ||
          typeStr.endsWith("-save") ||
          typeStr.endsWith("-saved");
        if (!isExplicitSave) {
          hasShownInitialConfigRef.current = true;
          return;
        }
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
      // Standalone explicit "save" message types (no `-config` suffix).
      if (
        typeof d.type === "string" &&
        (d.type.endsWith("-save") || d.type.endsWith("-saved") || d.type === "configurator-save")
      ) {
        const cfg = d.configuration ?? d.data;
        if (cfg) setConfiguratorData(cfg);
        if (typeof d.recap === "string") setConfiguratorRecap(d.recap);
        if (typeof d.recap_html === "string") setConfiguratorRecapHtml(d.recap_html);
        setHasSavedConfig(true);
        if (configToastTimer.current) clearTimeout(configToastTimer.current);
        configToastTimer.current = setTimeout(() => {
          toast.success(t("product.configSavedToast"), {
            icon: <Check className="size-4" />,
            duration: 2200,
          });
        }, 300);
        setIs3DMode(false);
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
        frame?.contentWindow?.postMessage(msg, configuratorOriginRef.current ?? window.location.origin);
      } catch {
        // ignore cross-origin failures
      }
    });
  };

  // When the 3D configurator selection changes, try to auto-preselect any
  // DB-stored product option whose label matches the configurator choice
  // (e.g., picking "Rouge" in the iframe selects the matching "Rouge" button).
  useEffect(() => {
    // Each time the user (re)opens the 3D configurator, reset the
    // "first message" guard so the next save still triggers the toast.
    if (is3DMode) {
      hasShownInitialConfigRef.current = false;
      setHasSavedConfig(false);
      iframeOpenedAtRef.current = Date.now();
      return;
    }
  }, [is3DMode]);

  // Preselect DB options matching the 3D configuration (unique match only,
  // never over a manual choice). Prices stay those of the DB options.
  useEffect(() => {
    if ((!configuratorData && !configuratorRecap) || optionCategories.length === 0) return;
    const matches = matchConfigToOptions(
      { ...recapPairs(configuratorRecap), ...((configuratorData ?? {}) as Record<string, unknown>) },
      optionCategories,
      productOptions,
      (product?.configurator_options ?? {}) as ConfigChoices,
    );
    const ids = Object.keys(matches).filter((c) => !manualCatIdsRef.current.has(c));
    if (ids.length === 0) return;
    setSelectedOptionIds((prev) => {
      const next = { ...prev };
      for (const c of ids) next[c] = matches[c];
      return next;
    });
    setAutoSelectedCatIds((prev) => new Set([...prev, ...ids]));
  }, [configuratorData, configuratorRecap, optionCategories, productOptions, product?.configurator_options]);

  // DB-stored paid options always apply (even in 3D mode the client must still
  // pick them — the 3D recap is informational and attached as a comment).
  const activeSelectedOptionsList = selectedOptionsList;
  // Synthetic options derived from the iframe payload — kept active as long
  // as we have a saved configuration (even after the immersive view is
  // closed) so the price recap & quote item include the 3D choices.
  const hasPendingConfig = Boolean(
    configuratorRecap || configuratorRecapHtml || configuratorData,
  );
  const activeConfiguratorOptionsList = hasPendingConfig ? configuratorOptionsList : [];

  /** Sanitized version of the iframe-provided recap HTML. `recap_html`
   * arrives via cross-origin postMessage and MUST be sanitized before
   * rendering via `dangerouslySetInnerHTML`. We also translate any known
   * FR/EN labels (e.g. "Décor du fond" ↔ "Background decor") so the recap
   * stays coherent with the active site language. */
  const safeRecapHtml = useMemo(
    () => sanitizeAndTranslateRecapHtml(configuratorRecapHtml, lang),
    [configuratorRecapHtml, lang],
  );

  /** True when the configurator provided some `recap_html` but, after
   * sanitization, nothing visible would render (every tag was stripped, or
   * the surviving tags carry no text/image). Drives the fallback message
   * so the "Configuration choisie" block never looks empty. */
  const recapHtmlIsEmpty = useMemo(() => {
    if (!configuratorRecapHtml) return false; // nothing to render at all
    if (!safeRecapHtml) return true; // 100% stripped
    if (typeof window === "undefined") return false;
    const probe = document.createElement("div");
    probe.innerHTML = safeRecapHtml;
    const hasText = (probe.textContent ?? "").trim().length > 0;
    const hasMedia = probe.querySelector("img") !== null;
    return !hasText && !hasMedia;
  }, [configuratorRecapHtml, safeRecapHtml]);

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
    // Same pure function as the server (/api/quotes/submit) → identical price.
    const l = computeLine({
      price_day: product.price_day, deposit: product.deposit, quantity: qty, days,
      optionPrices: [optionsUnitPrice],
      quantityDiscounts: product.quantity_discounts ?? undefined,
      durationDiscounts: product.duration_discounts ?? undefined,
      priceEvent: product.price_event,
      eventDaysIncluded: product.event_days_included,
      priceExtraDay: product.price_extra_day,
      customPrice: product.custom_price,
      customChosen,
    });
    const ev = l.event;
    const { gross, discount, net, deposit, qtyRate } = l;
    const durRate = l.durationRate;
    const discountRate = Math.min(0.5, qtyRate + durRate);
    return { gross, discountRate, qtyRate, durRate, discount, net, deposit, optionsUnitPrice, ev };
  }, [product, days, qty, optionsUnitPrice, customChosen]);

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
        frame.contentWindow?.postMessage({ type: "reset-config" }, configuratorOriginRef.current ?? window.location.origin);
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

  const hasCustomOffer = Number(product.custom_price) > 0;

  const handleAdd = () => {
    if (!calc) return;
    const missing = optionCategories.filter((c) => c.is_required && !selectedOptionIds[c.id]);
    if (missing.length > 0) {
      setMissingCatIds(new Set(missing.map((c) => c.id)));
      requestAnimationFrame(() =>
        document.getElementById(`optcat-${missing[0].id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
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
      configuratorRecap: configuratorRecap || undefined,
      configuratorRecapHtml: configuratorRecapHtml || undefined,
      logoUrl: logoRequired && clientLogo ? clientLogo.url : undefined,
      logoFilename: logoRequired && clientLogo ? clientLogo.filename : undefined,
      configuratorData: configuratorData ?? undefined,
      standardVersion: product.configurator_url && !hasPendingConfig ? true : undefined,
      priceEvent: product.price_event,
      eventDaysIncluded: product.event_days_included,
      priceExtraDay: product.price_extra_day,
      customPrice: product.custom_price,
      customLabel_fr: product.custom_label_fr,
      customLabel_en: product.custom_label_en,
      customChosen: hasCustomOffer && customChosen ? true : undefined,
    });
    trackSiteEvent("cart_add", product.slug);
    toast.success(
      hasPendingConfig
        ? t("product.configuredAdded")
        : t("product.added"),
      { icon: <Check className="size-4" /> },
    );
  };

  return (
    <div className="pt-20 md:pt-24">
      <ConfiguratorFocus open={!!product.configurator_url && is3DMode} closeRef={close3DButtonRef} onEscape={() => close3DButtonRef.current?.click()} />
      {/* Immersive 3D mode — covers the page body, hides title/breadcrumbs/pricing */}
      {product.configurator_url && is3DMode && (
        <div
          className="fixed inset-0 z-[60] bg-background animate-fade-in md:top-24"
          role="dialog"
          aria-modal="true"
          aria-label={`${t("product.threeDConfig")} — ${pickLang(product, "name", lang)}`}
        >
          <div className="relative w-full h-[100dvh] md:h-[calc(100dvh-6rem)]">
            <iframe
              ref={inlineIframeRef}
              src={product.configurator_url}
              title={`${t("product.threeDConfig")} — ${pickLang(product, "name", lang)}`}
              className="block w-full h-full border-0"
              allow="clipboard-write; fullscreen"
              onLoad={() => {
                sendPricesToIframe(inlineIframeRef.current);
                // Give the configurator a beat to mount its scene before
                // replaying the saved selection.
                if (configuratorData) {
                  setTimeout(() => restoreConfigToIframe(inlineIframeRef.current), 250);
                }
              }}
            />
            <button
              ref={close3DButtonRef}
              type="button"
              onClick={() => {
                // If the user has interacted with the configurator (we
                // received at least one silent `*-config` update) but never
                // sent an explicit "Save" signal, confirm before leaving
                // immersive mode so they can finish saving in the iframe.
                if (hasShownInitialConfigRef.current) {
                  setConfirmCloseOpen(true);
                  return;
                }
                setIs3DMode(false);
              }}
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
              aria-label={t("product.resetConfigTitle")}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm before closing the 3D iframe when the user has touched the
          configurator but not yet sent an explicit save signal. The recap is
          already preserved in state, so closing is safe — we just want to
          give them a chance to save inside the iframe first.

          IMPORTANT: the immersive 3D block above uses `z-[60]`, so the Radix
          AlertDialog overlay/content (default `z-50`) would render BEHIND
          the iframe and clicks on dialog buttons would be swallowed by the
          configurator. We force both the overlay and the content to `z-[80]`
          so the dialog sits above the immersive block. */}
      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent className="z-[80]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("product.confirmClose3DTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("product.confirmClose3DDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("product.confirmClose3DKeepOpen")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmCloseOpen(false);
                setIs3DMode(false);
              }}
            >
              {t("product.confirmClose3DLeave")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              priority
              sizes={PRODUCT_HERO_SIZES}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details — 40% on desktop */}
        <div className="lg:col-span-2">
          {category && (
            <div className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/15 text-gold-ink border border-gold/20">
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
          {product.dimensions && product.dimensions.trim() !== "" && product.dimensions.trim().toLowerCase() !== "a voir" && product.dimensions.trim().toLowerCase() !== "à voir" && (
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground">Dimensions :</span> <span>{product.dimensions}</span>
            </div>
          )}
          {PRODUCT_TO_PIECE[product.slug] && (
            <Link
              to="/sur-mesure/$piece"
              params={{ piece: PRODUCT_TO_PIECE[product.slug]! }}
              search={{ line: undefined }}
              className="mt-3 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {t("sm.productLink")}
            </Link>
          )}

          {product.configurator_url && (BRAND_3D_SLUGS.has(product.slug) ? (
            <button
              type="button"
              onClick={() => setIs3DMode((prev) => !prev)}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold border border-gold/60 text-gold-ink hover:bg-gold/10 transition-colors"
            >
              <Sparkles className="size-4" />
              {t("product.customize3d")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIs3DMode(true)}
              className="mt-3 flex w-fit items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <Sparkles className="size-3.5" />
              {t("product.view3d")}
            </button>
          ))}

          {/* "Configuration choisie" — shown right under the 3D CTA once the
              user has clicked "Enregistrer ma configuration" inside the iframe.
              Persists after immersive mode closes so the user can pick dates
              & quantity before adding to the quote. */}
          {product.configurator_url && hasPendingConfig && !is3DMode && (
            <div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-4 animate-fade-in">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-gold/20 text-gold-ink">
                    <Check className="size-4" />
                  </span>
                  <div className="text-sm font-semibold">
                    {t("product.configChosenTitle")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIs3DMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <Wand2 className="size-3.5" />
                  {t("product.modifyConfig")}
                </button>
              </div>
              {safeRecapHtml && !recapHtmlIsEmpty ? (
                <div
                  className="text-xs text-muted-foreground leading-relaxed [&_*]:max-w-full"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: safeRecapHtml }}
                />
              ) : configuratorRecap ? (
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-sans leading-relaxed">
                  {configuratorRecap}
                </pre>
              ) : recapHtmlIsEmpty ? (
                <div className="text-xs italic text-muted-foreground">
                  {t("product.configUnrenderable")}
                </div>
              ) : null}
            </div>
          )}

          {/* Price grid */}
          <div className="mt-8 rounded-xl bg-secondary/60 border border-border p-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
              {t("product.rentalRates")}
            </div>
            {product.price_event != null ? (
              <div className="rounded-lg bg-background border border-border p-4" data-testid="event-price">
                <div className="font-display font-semibold text-xl text-gold-ink">
                  {formatPrice(Number(product.price_event), lang)}{" "}
                  <span className="text-sm font-normal text-foreground">
                    {t("product.perEventUpTo").replace("{n}", String(product.event_days_included))}
                  </span>
                </div>
                {Number(product.price_extra_day) > 0 && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    + {formatPrice(Number(product.price_extra_day), lang)} {t("product.perExtraDay")}
                  </div>
                )}
                <div className="mt-2 text-[11px] leading-snug text-muted-foreground">{t("product.stockNote")}</div>
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-3 max-w-[200px]">
              {[
                { label: t("product.day"), value: product.price_day },
              ].map((p, i) => (
                <div key={i} className="rounded-lg bg-background border border-border p-4 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.label}</div>
                  {p.value != null ? (
                    <div className="mt-2 font-display font-semibold text-xl text-gold-ink">
                      {formatPrice(p.value, lang)}
                    </div>
                  ) : (
                    <div className="mt-2 font-display font-semibold text-xl text-muted-foreground">—</div>
                  )}
                </div>
              ))}
            </div>
            )}
            {hasCustomOffer && (
              <label className="mt-4 flex items-start gap-3 rounded-lg bg-background border border-border p-4 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[var(--gold)]"
                  checked={customChosen}
                  onChange={(e) => setCustomChosen(e.target.checked)}
                  data-testid="custom-checkbox"
                />
                <span className="text-sm">
                  <span className="font-medium">
                    {t("product.customise")} : {pickLang(product, "custom_label", lang) || product.custom_label_fr || ""} (+ {formatPrice(Number(product.custom_price), lang)} {t("product.perUnit")})
                  </span>
                  <span className="block mt-1 text-xs text-muted-foreground">{t("product.customNote")}</span>
                </span>
              </label>
            )}
            <div className="mt-3 flex items-center justify-between text-sm pt-3 border-t border-border">
              <span className="text-muted-foreground">{t("product.deposit")}</span>
              <span className="font-semibold">{formatPrice(product.deposit, lang)}</span>
            </div>
          </div>

          {/* 3D configurator recap (informational, sent as comment with the quote) */}
          {/* Customization options — always visible (also in 3D mode, with notice) */}
          {optionCategories.length > 0 && (
            <div className="mt-8 space-y-5 animate-fade-in">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {is3DMode ? t("product.optionsStillRequired") : t("product.customize")}
              </div>
              {autoSelectedCatIds.size > 0 && (
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 -mt-2">
                  <Wand2 className="size-3.5 text-gold-ink/80" />
                  {t("product.optionsFrom3D")}
                </p>
              )}
              {optionCategories.map((cat) => {
                const opts = productOptions
                  .filter((o) => o.category_id === cat.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                if (opts.length === 0) return null;
                const selected = selectedOptionIds[cat.id];
                return (
                  <div key={cat.id} id={`optcat-${cat.id}`} className="scroll-mt-28">
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
                            manualCatIdsRef.current.add(cat.id);
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
                              manualCatIdsRef.current.add(cat.id);
                              setSelectedOptionIds((prev) => ({ ...prev, [cat.id]: o.id }));
                              setMissingCatIds((prev) => {
                                if (!prev.has(cat.id)) return prev;
                                const next = new Set(prev);
                                next.delete(cat.id);
                                return next;
                              });
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
                                    className="inline-flex items-center text-gold-ink/80"
                                  >
                                    <Wand2 className="size-3.5" />
                                  </span>
                                )}
                              </span>
                              {active && <Check className="size-4 text-gold-ink shrink-0" />}
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
                    {missingCatIds.has(cat.id) && !selected && (
                      <p role="alert" className="mt-1.5 text-xs text-destructive">
                        {t("product.requiredFieldError")}
                      </p>
                    )}
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
              {calc.ev ? (
                <>
                  <Row
                    label={`${t("product.eventPrice")} (${formatPrice(calc.ev.priceEvent, lang)} × ${qty})`}
                    value={formatPrice(calc.ev.priceEvent * qty, lang)}
                  />
                  {calc.ev.extraDays > 0 && (
                    <Row
                      label={`${t("product.extraDays")} (${calc.ev.extraDays} × ${formatPrice(calc.ev.priceExtraDay, lang)} × ${qty})`}
                      value={`+${formatPrice(calc.ev.extraTotal, lang)}`}
                    />
                  )}
                  {calc.ev.customTotal > 0 && (
                    <Row
                      label={`${t("product.customisation")} (${formatPrice(calc.ev.customUnit, lang)} × ${qty})`}
                      value={`+${formatPrice(calc.ev.customTotal, lang)}`}
                    />
                  )}
                </>
              ) : (
              <Row
                label={`${t("product.subtotal")} (${formatPrice(product.price_day, lang)} ${t("catalog.perDay")})`}
                value={formatPrice(product.price_day * days * qty, lang)}
              />
              )}
              {activeSelectedOptionsList.map((o) => (
                <Row
                  key={o.optionId}
                  label={`+ ${pickLang(o, "name", lang)}`}
                  value={o.price > 0 ? `+${formatPrice(o.price * qty, lang)}` : t("product.included")}
                />
              ))}
              {activeConfiguratorOptionsList.length > 0 && (
                <div className="pt-1 border-t border-dashed border-border/60 mt-1">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-gold-ink/80 font-semibold mb-1 flex items-center gap-1">
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
                          ? "border-gold/40 bg-gold/5 text-gold-ink"
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
            if (product.price_event != null) return null;
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

/**
 * Keyboard support for the full-screen 3D configurator: moves focus to the
 * Close button when it opens, closes on Escape (when focus is outside the
 * iframe), and returns focus to the element that opened it.
 */
function ConfiguratorFocus({ open, closeRef, onEscape }: { open: boolean; closeRef: RefObject<HTMLButtonElement | null>; onEscape: () => void }) {
  const openerRef = useRef<HTMLElement | null>(null);
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="alertdialog"]')) escRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      const opener = openerRef.current;
      if (opener && document.contains(opener)) requestAnimationFrame(() => opener.focus());
    };
  }, [open, closeRef]);
  return null;
}
