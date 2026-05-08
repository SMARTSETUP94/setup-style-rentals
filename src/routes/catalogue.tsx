import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";
import { canonicalLink, ogImageMeta } from "@/lib/seo";
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
    links: [canonicalLink("/catalogue")],
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

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.category) list = list.filter((p) => p.category_slug === search.category);
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) =>
        p.name_fr.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q),
      );
    }
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

        <div className="mt-4 text-xs text-muted-foreground">
          {filtered.length} {filtered.length > 1 ? t("catalog.results") : t("catalog.result")}
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
