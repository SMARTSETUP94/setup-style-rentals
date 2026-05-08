import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { Search, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr as dateFr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";
import { canonicalLink, ogImageMeta, hreflangLinks } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Category { id: string; name_fr: string; name_en: string; slug: string; color: string; sort_order: number }
interface Product {
  id: string; slug: string; name_fr: string; name_en: string;
  description_fr: string | null; description_en: string | null;
  category_slug: string; price_day: number; price_week: number | null;
  price_month: number | null; deposit: number; image_url: string | null;
  configurator_url: string | null; sort_order: number;
}

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["featured", "priceAsc", "priceDesc", "name"]), "featured").default("featured"),
  start: fallback(z.string(), "").default(""),
  end: fallback(z.string(), "").default(""),
  pmin: fallback(z.coerce.number().nonnegative().optional(), undefined).default(undefined),
  pmax: fallback(z.coerce.number().nonnegative().optional(), undefined).default(undefined),
});

export const Route = createFileRoute("/catalogue")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Catalogue — Setup Paris" },
      { name: "description", content: "Découvrez notre catalogue de location : jeux, structures, signalétique, décoration et mobilier événementiel." },
      { property: "og:title", content: "Catalogue — Setup Paris" },
      { property: "og:description", content: "Plus de 50 objets événementiels disponibles à la location." },
      ...ogImageMeta(
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80",
        { alt: "Catalogue Setup Paris — jeux, structures, signalétique, décoration, mobilier" },
      ),
    ],
    links: [canonicalLink("/catalogue"), ...hreflangLinks("/catalogue")],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const { t, lang } = useI18n();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").eq("is_active", true).order("sort_order"),
    ]).then(([c, p]) => {
      setCategories((c.data as Category[]) ?? []);
      setProducts((p.data as Product[]) ?? []);
      setLoading(false);
    });
  }, []);

  // Compute price bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map((p) => Number(p.price_day) || 0);
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return { min, max: Math.max(max, min + 1) };
  }, [products]);

  // Bulk availability check when dates change
  useEffect(() => {
    if (!search.start || !search.end || products.length === 0) {
      setAvailability({});
      return;
    }
    setCheckingAvail(true);
    supabase
      .rpc("get_available_stock_bulk", {
        _product_ids: products.map((p) => p.id),
        _start_date: search.start,
        _end_date: search.end,
      })
      .then(({ data }) => {
        const map: Record<string, number> = {};
        ((data as Array<{ product_id: string; available: number }>) ?? []).forEach((r) => {
          map[r.product_id] = r.available;
        });
        setAvailability(map);
        setCheckingAvail(false);
      });
  }, [search.start, search.end, products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.category) list = list.filter((p) => p.category_slug === search.category);
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) =>
        p.name_fr.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q),
      );
    }
    if (typeof search.pmin === "number") list = list.filter((p) => Number(p.price_day) >= search.pmin!);
    if (typeof search.pmax === "number") list = list.filter((p) => Number(p.price_day) <= search.pmax!);
    switch (search.sort) {
      case "priceAsc": list.sort((a, b) => a.price_day - b.price_day); break;
      case "priceDesc": list.sort((a, b) => b.price_day - a.price_day); break;
      case "name": list.sort((a, b) => pickLang(a, "name", lang).localeCompare(pickLang(b, "name", lang))); break;
      default: list.sort((a, b) => a.sort_order - b.sort_order);
    }
    return list;
  }, [products, search, lang]);

  type SearchType = z.infer<typeof searchSchema>;
  const setSearch = (patch: Partial<SearchType>) =>
    navigate({ search: (prev: SearchType) => ({ ...prev, ...patch }) });

  const startDate = search.start ? new Date(search.start) : undefined;
  const endDate = search.end ? new Date(search.end) : undefined;
  const dateLocale = lang === "fr" ? dateFr : undefined;
  const datesActive = !!search.start && !!search.end;
  const priceActive = typeof search.pmin === "number" || typeof search.pmax === "number";
  const currentPmin = typeof search.pmin === "number" ? search.pmin : priceBounds.min;
  const currentPmax = typeof search.pmax === "number" ? search.pmax : priceBounds.max;

  return (
    <div className="pt-24 md:pt-28">
      {/* Header */}
      <div className="container-x">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("catalog.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="section-num">— 02 — Catalogue</div>
        <h1 className="mt-3 font-display font-semibold text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight">
          {t("catalog.title")}
        </h1>

        {/* Filters */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between border-y border-border py-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              value={search.q}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder={t("catalog.search")}
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSearch({ category: "" })}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                !search.category ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40",
              )}
            >
              {t("catalog.all")}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSearch({ category: c.slug })}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                  search.category === c.slug ? "text-background border-transparent" : "border-border hover:border-foreground/40",
                )}
                style={search.category === c.slug ? { background: c.color, color: c.color === "#FFE66D" ? "#1A1A1A" : "#fff" } : undefined}
              >
                {pickLang(c, "name", lang)}
              </button>
            ))}
          </div>

          <select
            value={search.sort}
            onChange={(e) => setSearch({ sort: e.target.value as typeof search.sort })}
            className="text-sm bg-transparent border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="featured">{t("catalog.sort.featured")}</option>
            <option value="priceAsc">{t("catalog.sort.priceAsc")}</option>
            <option value="priceDesc">{t("catalog.sort.priceDesc")}</option>
            <option value="name">{t("catalog.sort.name")}</option>
          </select>
        </div>

        {/* Secondary filters: dates + price */}
        <div className="mt-3 flex flex-col md:flex-row gap-3 md:items-end pb-4 border-b border-border">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("catalog.startDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start font-normal min-w-[160px]", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="size-4 mr-2" />
                    {startDate ? format(startDate, "PPP", { locale: dateLocale }) : t("product.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => setSearch({ start: d ? format(d, "yyyy-MM-dd") : "" })}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("catalog.endDate")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("justify-start font-normal min-w-[160px]", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="size-4 mr-2" />
                    {endDate ? format(endDate, "PPP", { locale: dateLocale }) : t("product.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => setSearch({ end: d ? format(d, "yyyy-MM-dd") : "" })}
                    disabled={(d) => (startDate ? d < startDate : d < new Date(new Date().setHours(0, 0, 0, 0)))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {datesActive && (
              <Button variant="ghost" size="sm" onClick={() => setSearch({ start: "", end: "" })}>
                <X className="size-3.5 mr-1" /> {t("catalog.clearDates")}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-1 max-w-sm md:ml-auto">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {t("catalog.priceRange")} : {currentPmin}€ – {currentPmax}€
            </label>
            <Slider
              min={priceBounds.min}
              max={priceBounds.max}
              step={5}
              value={[currentPmin, currentPmax]}
              onValueChange={(v) => setSearch({ pmin: v[0] === priceBounds.min ? undefined : v[0], pmax: v[1] === priceBounds.max ? undefined : v[1] })}
              className="mt-2"
            />
            {priceActive && (
              <button
                type="button"
                onClick={() => setSearch({ pmin: undefined, pmax: undefined })}
                className="text-[11px] text-muted-foreground hover:text-foreground self-start mt-1"
              >
                {t("product.clear")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {filtered.length} {filtered.length > 1 ? t("catalog.results") : t("catalog.result")}
          {checkingAvail && <span className="ml-2 italic">· {t("catalog.checkingAvailability")}</span>}
        </div>
      </div>

      {/* Grid */}
      <div className="container-x mt-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t("catalog.empty")}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={categories.find((c) => c.slug === p.category_slug)}
                lang={lang}
                fromLabel={t("catalog.from")}
                perDayLabel={t("catalog.perDay")}
                unavailable={datesActive && availability[p.id] !== undefined && availability[p.id] <= 0}
                unavailableLabel={t("catalog.unavailable")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
