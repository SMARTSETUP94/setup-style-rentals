import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { canonicalLink, ogImageMeta, SITE_URL, hreflangLinks } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  slug: string;
  color: string;
  image_url: string | null;
  sort_order: number;
  description_long_fr: string | null;
  description_long_en: string | null;
  faq: Array<{ q_fr?: string; q_en?: string; a_fr?: string; a_en?: string }> | null;
}
interface Product {
  id: string; slug: string; name_fr: string; name_en: string;
  description_fr: string | null; description_en: string | null;
  category_slug: string; price_day: number; price_week: number | null;
  price_month: number | null; deposit: number; image_url: string | null;
  configurator_url: string | null; sort_order: number;
}

export const Route = createFileRoute("/categorie/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) throw notFound();
    return { category: data as unknown as Category };
  },
  head: ({ loaderData, params }) => {
    const cat = loaderData?.category;
    const nameFr = cat?.name_fr ?? params.slug;
    const title = `${nameFr} — Location événementielle | Setup Paris`;
    const description = `Location de ${nameFr.toLowerCase()} à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...ogImageMeta(
          cat?.image_url ??
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&h=630&q=80",
          { alt: `Catégorie ${nameFr} — Setup Paris` },
        ),
      ],
      links: [canonicalLink(`/categorie/${params.slug}`), ...hreflangLinks(`/categorie/${params.slug}`)],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => {
    if (typeof window === "undefined") {
      void import("@/lib/ssr-status.server").then((m) => m.applyNotFoundStatus());
    }
    return (
      <div className="container-x pt-32 pb-16 text-center">
        <h1 className="font-display text-3xl mb-4">Catégorie introuvable</h1>
        <Link to="/catalogue" className="underline">Retour au catalogue</Link>
      </div>
    );
  },
  errorComponent: ({ error }) => (
    <div className="container-x pt-32 pb-16 text-center">
      <h1 className="font-display text-2xl mb-4">Une erreur est survenue</h1>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Link to="/catalogue" className="underline">Retour au catalogue</Link>
    </div>
  ),
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_slug", category.slug)
      .order("sort_order")
      .then(({ data }) => {
        setProducts((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [category.slug]);

  const name = pickLang(category, "name", lang);

  const itemListJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/produit/${p.slug}`,
        name: pickLang(p, "name", lang),
      })),
    }),
    [products, name, lang],
  );

  const faqList = (category.faq ?? []).filter((f) => {
    const q = lang === "en" ? f.q_en || f.q_fr : f.q_fr || f.q_en;
    return !!q;
  });
  const longDesc = lang === "en"
    ? category.description_long_en || category.description_long_fr
    : category.description_long_fr || category.description_long_en;

  const faqJsonLd = useMemo(() => {
    if (faqList.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqList.map((f) => ({
        "@type": "Question",
        name: lang === "en" ? f.q_en || f.q_fr : f.q_fr || f.q_en,
        acceptedAnswer: {
          "@type": "Answer",
          text: lang === "en" ? f.a_en || f.a_fr : f.a_fr || f.a_en,
        },
      })),
    };
  }, [faqList, lang]);

  return (
    <div className="pt-24 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <div className="container-x">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/catalogue">{t("catalog.title")}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="section-num">— Catégorie</div>
        <h1 className="mt-3 font-display font-semibold text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight">
          {name}
        </h1>
        {longDesc ? (
          <div className="mt-4 max-w-2xl text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            {longDesc}
          </div>
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
          {products.length} {products.length > 1 ? t("catalog.results") : t("catalog.result")}
        </p>
      </div>

      <div className="container-x mt-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t("catalog.empty")}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                category={category}
                lang={lang}
                fromLabel={t("catalog.from")}
                perDayLabel={t("catalog.perDay")}
              />
            ))}
          </div>
        )}
      </div>

      {faqList.length > 0 ? (
        <section className="container-x pb-20">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            {t("catalog.faq")}
          </h2>
          <Accordion type="single" collapsible className="max-w-3xl">
            {faqList.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {lang === "en" ? f.q_en || f.q_fr : f.q_fr || f.q_en}
                </AccordionTrigger>
                <AccordionContent className="whitespace-pre-line text-muted-foreground">
                  {lang === "en" ? f.a_en || f.a_fr : f.a_fr || f.a_en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}
    </div>
  );
}