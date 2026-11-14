import { canonicalUrl, headLang, L, localeMeta, seoLinks } from "@/lib/seo";
import { getPublicCatalogue } from "@/lib/catalogue.functions";
import { HOME_SELECTION, homeFaq } from "@/lib/home-catalogue";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick, Truck, Wand2, Send, BadgeEuro, ClipboardCheck } from "lucide-react";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { HERO_IMAGE } from "@/lib/category-images";
import { responsiveImage } from "@/lib/image";
import { ClientsBand } from "@/components/site/ClientsBand";
import { Button } from "@/components/ui/button";
import { PublicNotFound } from "@/components/site/PublicNotFound";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  loader: () => getPublicCatalogue(),
  notFoundComponent: PublicNotFound,
  errorComponent: () => <div role="alert" className="container-x pt-32">Catalogue indisponible / Catalogue unavailable</div>,
  head: ({ match, loaderData }) => {
    const lang = headLang(match);
    const title = L(lang, "Location et fabrication de mobilier événementiel à Paris | Setup Paris", "Event furniture rental and fabrication in Paris | Setup Paris");
    const description = L(lang, "Prix par événement, personnalisé à vos couleurs, livré et installé en Île-de-France. Réponse sous 24 h ouvrées. Atelier à Vitry-sur-Seine.", "Per-event pricing, customised in your colours, delivered and installed in Île-de-France. Reply within 24 business hours. Workshop in Vitry-sur-Seine.");
    const faq = homeFaq(loaderData?.categories ?? [], lang);
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { name: "twitter:title", content: title }, { name: "twitter:description", content: description },
        { property: "og:url", content: canonicalUrl("/", lang) }, { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" }, ...localeMeta(lang),
      ],
      links: [...seoLinks("/", lang), { rel: "preload", as: "image", href: HERO_IMAGE }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"],
          name: "Setup Paris", url: canonicalUrl("/", lang), telephone: "+33601416111", email: "smart@setup.paris",
          address: { "@type": "PostalAddress", streetAddress: "8 avenue du Président Salvador Allende", addressLocality: "Vitry-sur-Seine", addressCountry: "FR" },
        }) },
        ...(faq.length ? [{ type: "application/ld+json", children: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(f => ({
            "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }) }] : []),
      ],
    };
  },
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useI18n();
  const data = Route.useLoaderData();
  const categories = data.categories;
  const featured = HOME_SELECTION.flatMap(slug => {
    const product = data.products.find(p => p.slug === slug);
    return product ? [product] : [];
  });
  const faq = homeFaq(categories, lang);
  const copy = (fr: string, en: string) => L(lang, fr, en);
  return (
    <>
      <section className="relative flex items-end min-h-[640px] md:min-h-[720px] overflow-hidden text-photo-foreground">
        <img src={HERO_IMAGE} alt={copy("Installation événementielle Setup Paris — rideau bleu Yonex Player Support", "Setup Paris event installation — blue Yonex Player Support curtain")} fetchPriority="high" loading="eager" decoding="async" width={1920} height={900} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-photo-shade" />
        <div className="container-x relative pb-12 pt-28 md:pb-16 md:pt-36">
          <h1 className="max-w-5xl font-display font-semibold text-balance text-4xl md:text-6xl leading-tight tracking-normal">{copy("Location et fabrication de mobilier événementiel à Paris", "Event furniture rental and fabrication in Paris")}</h1>
          <p className="mt-6 max-w-3xl text-lg md:text-xl text-photo-foreground/90">{copy("Prix par événement, personnalisé à vos couleurs, livré et installé en Île-de-France.", "Per-event pricing, customised in your colours, delivered and installed in Île-de-France.")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-auto py-4 px-6 bg-gold text-gold-foreground hover:bg-gold/90 whitespace-normal"><Link to="/catalogue">{copy("Voir le catalogue", "View the catalogue")}<ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-auto py-4 px-6 bg-transparent text-photo-foreground border-photo-edge hover:bg-photo-foreground/10 hover:text-photo-foreground whitespace-normal"><Link to="/sur-mesure">{copy("Faire fabriquer sur mesure", "Have it custom-made")}</Link></Button>
          </div>
          <p className="mt-6 text-sm text-photo-foreground/90">{copy("Réponse sous 24 h ouvrées · Atelier à Vitry-sur-Seine", "Reply within 24 business hours · Workshop in Vitry-sur-Seine")}</p>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="container-x py-9 grid gap-7 md:grid-cols-3">
          {[
            { icon: BadgeEuro, title: copy("Un prix clair par événement", "Clear per-event pricing"), text: copy("Jusqu'à 3 jours, de la livraison à la reprise.", "Up to 3 days, from delivery to collection.") },
            { icon: Wand2, title: copy("Personnalisé par notre atelier", "Customised by our workshop"), text: copy("Peinture, adhésif, impression, à votre charte.", "Paint, vinyl and printing to match your brand.") },
            { icon: Truck, title: copy("Livré, installé, repris", "Delivered, installed, collected"), text: copy("Paris et Île-de-France.", "Paris and Île-de-France.") },
          ].map(p => <div key={p.title} className="flex items-start gap-4"><p.icon className="size-6 shrink-0 text-gold-ink mt-1" /><div><h2 className="font-semibold text-base tracking-normal">{p.title}</h2><p className="mt-2 text-sm text-muted-foreground">{p.text}</p></div></div>)}
        </div>
      </section>

      <section className="container-x py-14 md:py-20" aria-labelledby="home-categories">
        <h2 id="home-categories" className="font-display font-semibold text-3xl md:text-4xl tracking-normal">{copy("Les catégories", "Categories")}</h2>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {categories.map(cat => <Link key={cat.id} to="/categorie/$slug" params={{ slug: cat.slug }} className="group block min-w-0 rounded-lg overflow-hidden border border-border bg-card hover:shadow-soft transition-shadow">
            <div className="aspect-[4/3] bg-secondary overflow-hidden">
              {cat.image_url && <img {...responsiveImage(cat.image_url)} onError={e => { const image = e.currentTarget; if (cat.image_url && image.src !== cat.image_url) { image.removeAttribute("srcset"); image.src = cat.image_url; } }} sizes="(min-width: 1024px) 20vw, 50vw" alt={pickLang(cat, "name", lang)} loading="lazy" width={600} height={450} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />}
            </div>
            <div className="p-4"><h3 className="font-semibold text-base md:text-lg leading-snug tracking-normal">{pickLang(cat, "name", lang)}</h3><p className="mt-2 text-sm text-muted-foreground">{data.products.filter(p => p.category_slug === cat.slug).length} {copy("objets", "items")}</p><ArrowRight className="mt-4 size-4 text-gold-ink" /></div>
          </Link>)}
        </div>
      </section>

      <section className="container-x pb-14 md:pb-20" aria-labelledby="home-selection">
        <div className="flex flex-wrap items-end justify-between gap-4"><h2 id="home-selection" className="font-display font-semibold text-3xl md:text-4xl tracking-normal">{copy("Une sélection", "A selection")}</h2><Button asChild variant="link"><Link to="/catalogue">{copy("Tout le catalogue", "Full catalogue")}<ArrowRight /></Link></Button></div>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featured.map(p => <ProductCard key={p.id} product={p} category={categories.find(c => c.slug === p.category_slug)} lang={lang} fromLabel={t("catalog.from")} perDayLabel={t("catalog.perDay")} />)}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="container-x py-14 md:py-20"><h2 className="font-display font-semibold text-3xl md:text-4xl tracking-normal">{copy("Louer ou faire fabriquer", "Rent or have it made")}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link to="/catalogue" className="group rounded-lg border border-border bg-card p-6 hover:shadow-soft transition-shadow"><h3 className="font-semibold text-xl tracking-normal">{copy("Louer", "Rent")}</h3><p className="mt-3 text-muted-foreground leading-relaxed">{copy("Choisissez dans le catalogue : un prix par événement, pour les objets disponibles en stock, avec personnalisation en option.", "Choose from the catalogue: per-event pricing for in-stock items, with optional customisation.")}</p><ArrowRight className="mt-5 size-4 text-gold-ink" /></Link>
            <Link to="/sur-mesure" className="group rounded-lg border border-gold/40 bg-card p-6 hover:shadow-soft transition-shadow"><h3 className="font-semibold text-xl tracking-normal">{copy("Faire fabriquer", "Have it made")}</h3><p className="mt-3 text-muted-foreground leading-relaxed">{copy("24 pièces sur mesure, fabriquées par notre atelier. Prix et délai confirmés sous 48 h ouvrées.", "24 custom-made pieces, built by our workshop. Price and lead time confirmed within 48 business hours.")}</p><ArrowRight className="mt-5 size-4 text-gold-ink" /></Link>
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-normal">{copy("Comment ça marche", "How it works")}</h2>
        <ol className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MousePointerClick, title: copy("Choisissez vos objets", "Choose your items") },
            { icon: Wand2, title: copy("Personnalisez (option)", "Customise (optional)") },
            { icon: Send, title: copy("Envoyez votre demande", "Send your request") },
            { icon: ClipboardCheck, title: copy("Devis sous 24 h ouvrées, puis livraison et installation.", "Quote within 24 business hours, then delivery and installation.") },
          ].map((step, i) => <li key={step.title} className="border-t border-border pt-5"><div className="flex justify-between text-gold-ink"><span className="text-sm font-mono">0{i + 1}</span><step.icon className="size-5" /></div><h3 className="mt-5 font-semibold text-lg leading-snug tracking-normal">{step.title}</h3></li>)}
        </ol>
      </section>

      <ClientsBand label={t("clients.label")} />

      <section className="container-x py-14 md:py-20">
        <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-normal">{copy("Questions fréquentes", "Frequently asked questions")}</h2>
        <Accordion type="single" collapsible className="mt-8 max-w-4xl">
          {faq.map((f, i) => <AccordionItem key={f.question} value={`faq-${i}`}><AccordionTrigger className="text-left">{f.question}</AccordionTrigger><AccordionContent forceMount className="whitespace-pre-line text-muted-foreground data-[state=closed]:hidden">{f.answer}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="bg-foreground text-background">
        <div className="container-x py-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-7"><h2 className="font-display font-semibold text-3xl tracking-normal">{copy("Parlons de votre événement", "Let's talk about your event")}</h2><div className="flex flex-wrap gap-3"><Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/contact">Contact<ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="bg-transparent text-background border-background/40 hover:bg-background/10 hover:text-background"><Link to="/devis">{copy("Ma demande", "My request")}</Link></Button></div></div>
      </section>
    </>
  );
}
