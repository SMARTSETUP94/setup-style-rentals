import { getPublicCatalogue } from "@/lib/catalogue.functions";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { canonicalUrl, headLang, L, localeMeta, SITE_URL, seoLinks, seoDescription, rentalTitle, breadcrumbJsonLd } from "@/lib/seo";
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
    const data = await getPublicCatalogue();
    const category = data.categories.find(c => c.slug === params.slug);
    if (!category) throw notFound();
    return { category: category as unknown as Category, products: data.products.filter(p => p.category_slug === category.slug) };
  },
  head: ({ loaderData, params, match }) => {
    const lang = headLang(match);
    const cat = loaderData?.category;
    const name = (lang === "en" ? cat?.name_en || cat?.name_fr : cat?.name_fr) ?? params.slug;
    const title = rentalTitle(name, lang);
    const longDescription = lang === "en" ? cat?.description_long_en || cat?.description_long_fr : cat?.description_long_fr || cat?.description_long_en;
    const description = seoDescription(longDescription || L(lang, `Location de ${name.toLowerCase()} à Paris et en Île-de-France. Découvrez notre sélection Setup Paris.`, `${name} for hire in Paris and Île-de-France. Discover the Setup Paris selection.`));
    const path = `/categorie/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl(path, lang) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...localeMeta(lang),
      ],
      links: seoLinks(path, lang),
      scripts: [{ type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd([
        { name: L(lang, "Accueil", "Home"), path: "/" }, { name: "Catalogue", path: "/catalogue" }, { name, path },
      ], lang)) }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => {
    void import("@/lib/ssr-status").then((m) => m.applyNotFoundStatus());
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
      <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : String(error)}</p>
      <Link to="/catalogue" className="underline">Retour au catalogue</Link>
    </div>
  ),
});

function CategoryPage() {
  const data = Route.useLoaderData();
  const category = data.category;
  const products = data.products as Product[];
  const loading = false;
  const { t, lang } = useI18n();

  const name = pickLang(category, "name", lang);

  const itemListJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: canonicalUrl(`/produit/${p.slug}`, lang),
        name: pickLang(p, "name", lang),
      })),
    }),
    [products, name, lang],
  );

  type FaqEntry = { q_fr?: string; q_en?: string; a_fr?: string; a_en?: string };
  const faqList: FaqEntry[] = ((category.faq ?? []) as FaqEntry[]).filter((f) => {
    const q = lang === "en" ? f.q_en || f.q_fr : f.q_fr || f.q_en;
    const a = lang === "en" ? f.a_en || f.a_fr : f.a_fr || f.a_en;
    return !!q && !!a;
  });
  const longDesc = lang === "en"
    ? category.description_long_en || category.description_long_fr
    : category.description_long_fr || category.description_long_en;

  const faqJsonLd = useMemo(() => {
    if (faqList.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqList.map((f: FaqEntry) => ({
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
            {longDesc.split(/\n\s*\n|\n/).filter(p => p.trim()).map((p, i) => <p key={i} className="mb-3">{p}</p>)}
          </div>
        ) : null}
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
          {products.length} {products.length > 1 ? t("catalog.results") : t("catalog.result")}
        </p>
      </div>

      <div className="container-x mt-6 pb-16">
        <h2 className="sr-only">{lang === "en" ? "Products" : "Produits"}</h2>
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
            {faqList.map((f: FaqEntry, i: number) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  {lang === "en" ? f.q_en || f.q_fr : f.q_fr || f.q_en}
                </AccordionTrigger>
                <AccordionContent forceMount className="whitespace-pre-line text-muted-foreground data-[state=closed]:hidden">
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