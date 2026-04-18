import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MousePointerClick, Truck, Wand2, Zap, Ruler, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { ProductCard } from "@/components/site/ProductCard";
import { categoryImage, categoryGradient, HERO_IMAGE } from "@/lib/category-images";
import { useReveal } from "@/hooks/use-reveal";

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  slug: string;
  color: string;
  sort_order: number;
}

interface FeaturedProduct {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  category_slug: string;
  price_day: number;
  image_url: string | null;
  sort_order: number;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Setup Paris — Location d'objets événementiels" },
      { name: "description", content: "Personnalisez, configurez, louez. Catalogue d'objets événementiels avec configurateur 3D : jeux, structures, signalétique, décoration, mobilier." },
      { property: "og:title", content: "Setup Paris — Location d'objets événementiels" },
      { property: "og:description", content: "Personnalisez, configurez, louez." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));

    supabase
      .from("products")
      .select("id, slug, name_fr, name_en, category_slug, price_day, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .limit(8)
      .then(({ data }) => setFeatured((data as FeaturedProduct[]) ?? []));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-end overflow-hidden text-white">
        {/* Background image */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <div className="container-x relative pb-20 pt-32 md:pb-28 md:pt-32 w-full">
          <div className="hero-rise flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-gold">
            <span className="inline-block w-8 h-px bg-gold/70" />
            <span>01 — {t("hero.eyebrow")}</span>
          </div>
          <h1 className="hero-rise hero-rise-delay-1 mt-6 font-display font-medium text-balance text-[clamp(2.75rem,8vw,7rem)] leading-[0.98] tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="hero-rise hero-rise-delay-2 mt-6 max-w-2xl text-lg md:text-2xl text-white/80 font-light">
            {t("hero.sub")}
          </p>
          <div className="hero-rise hero-rise-delay-3 mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-2 bg-gold text-gold-foreground rounded-md px-7 py-4 text-sm font-semibold tracking-wide hover:bg-gold/90 transition-all duration-300 shadow-lg shadow-black/20"
            >
              {t("hero.cta")}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container-x py-6 md:py-7 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { i: Truck, label: t("trust.delivery") },
            { i: Wand2, label: t("trust.custom") },
            { i: Zap, label: t("trust.quote") },
            { i: Ruler, label: t("trust.bespoke") },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-xs md:text-sm font-medium">
              <span className="inline-flex shrink-0 items-center justify-center size-10 rounded-full bg-gold/15 text-gold">
                <b.i className="size-4" strokeWidth={2} />
              </span>
              <span className="leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <RevealSection className="container-x py-20 md:py-28">
        <SectionHeader num="02" title={t("cats.title")} sub={t("cats.sub")} />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              to="/catalogue"
              search={{ category: cat.slug }}
              className="group relative h-64 rounded-xl overflow-hidden border border-border transition-all duration-300 hover:scale-[1.03] hover:shadow-premium"
              style={{
                animation: `hero-rise 700ms cubic-bezier(0.2, 0.8, 0.2, 1) ${idx * 80}ms both`,
                background: categoryGradient(cat.slug),
              }}
            >
              <img
                src={categoryImage(cat.slug)}
                alt={pickLang(cat, "name", lang)}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.85) 100%)",
                }}
              />
              <div className="relative h-full flex flex-col justify-between p-5 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold">
                  0{cat.sort_order}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight">
                    {pickLang(cat, "name", lang)}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold opacity-90 group-hover:gap-2 transition-all duration-300">
                    {lang === "fr" ? "Découvrir" : "Discover"}
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </RevealSection>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <RevealSection className="container-x py-20 md:py-28">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeader num="03" title={t("featured.title")} sub={t("featured.sub")} />
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-gold transition-colors duration-300 shrink-0"
            >
              {t("featured.all")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile: horizontal scroll. md+: grid */}
          <div className="mt-10 -mx-5 md:mx-0 md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-5 snap-x snap-mandatory">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  category={categories.find((c) => c.slug === p.category_slug)}
                  lang={lang}
                  fromLabel={t("catalog.from")}
                  perDayLabel={t("catalog.perDay")}
                  className="w-[70%] shrink-0 snap-start"
                />
              ))}
            </div>
          </div>
          <div className="mt-10 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {featured.map((p) => (
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
        </RevealSection>
      )}

      {/* CONFIGURATOR */}
      <section id="configurator" className="bg-secondary/50 py-20 md:py-28">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <RevealDiv>
            <SectionHeader num="04" title={t("config.title")} />
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              {lang === "fr"
                ? "Visualisez vos produits en 3D — configurateur disponible sur demande pour personnaliser couleurs, dimensions et finitions."
                : "Visualise your products in 3D — configurator available on request to customise colours, dimensions and finishes."}
            </p>
            <Link
              to="/devis"
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background rounded-md px-7 py-4 text-sm font-semibold hover:bg-foreground/90 transition-all duration-300"
            >
              <Sparkles className="size-4" />
              {lang === "fr" ? "Demander une démo" : "Request a demo"}
            </Link>
          </RevealDiv>
          <RevealDiv className="aspect-[4/3] rounded-2xl bg-card shadow-elev border border-border overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(201,169,110,0.18) 0%, rgba(255,255,255,0) 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-gold/15 text-gold mb-5">
                  <Sparkles className="size-9" />
                </div>
                <div className="font-display font-semibold text-2xl">
                  {lang === "fr" ? "Visualisation 3D" : "3D Visualisation"}
                </div>
                <div className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  {lang === "fr"
                    ? "Aperçu temps réel de vos configurations."
                    : "Real-time preview of your configurations."}
                </div>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* HOW */}
      <RevealSection className="container-x py-20 md:py-28">
        <SectionHeader num="05" title={t("how.title")} />
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { i: MousePointerClick, t: t("how.s1.t"), d: t("how.s1.d") },
            { i: Sparkles, t: t("how.s2.t"), d: t("how.s2.d") },
            { i: Truck, t: t("how.s3.t"), d: t("how.s3.d") },
          ].map((s, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border p-7 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gold tracking-widest">0{idx + 1}</span>
                <s.i className="size-5 text-gold" />
              </div>
              <h4 className="mt-6 font-display font-semibold text-xl">{s.t}</h4>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* CTA */}
      <section className="container-x pb-20 md:pb-28">
        <div className="rounded-2xl bg-foreground text-background p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-gold">— Setup Paris</div>
            <h3 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-balance max-w-xl leading-tight">
              {lang === "fr" ? "Prêt à configurer votre événement ?" : "Ready to design your event?"}
            </h3>
          </div>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 bg-gold text-gold-foreground rounded-md px-7 py-4 text-sm font-semibold hover:bg-gold/90 transition-all duration-300"
          >
            {t("hero.cta")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div>
      <div className="section-num">— {num}</div>
      <h2 className="mt-4 font-display font-semibold text-balance text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-tight max-w-3xl">
        {title}
      </h2>
      {sub && <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">{sub}</p>}
    </div>
  );
}

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </section>
  );
}

function RevealDiv({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}
