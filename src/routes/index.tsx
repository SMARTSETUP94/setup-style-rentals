import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, MousePointerClick, FileCheck2, Headset } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { formatPrice, categoryColor } from "@/lib/format";
import { ProductImage } from "@/components/site/ProductImage";
import { cn } from "@/lib/utils";

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
      <section className="relative min-h-screen flex items-end overflow-hidden bg-foreground text-background">
        {/* gradient backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 75% 30%, rgba(160,140,255,0.35) 0%, rgba(26,26,26,0) 60%), radial-gradient(60% 50% at 20% 80%, rgba(78,205,196,0.22) 0%, rgba(26,26,26,0) 60%), #1A1A1A",
          }}
        />
        {/* fine grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="container-x relative pb-16 pt-32 md:pb-20 md:pt-28 w-full">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
            <span className="inline-block w-8 h-px bg-white/40" />
            <span>01 — {t("hero.eyebrow")}</span>
          </div>
          <h1 className="mt-6 font-display font-semibold text-balance text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-2xl text-white/75 font-light">
            {t("hero.sub")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/catalogue"
              className="group inline-flex items-center gap-2 bg-white text-foreground rounded-lg px-6 py-3.5 text-sm font-semibold hover:bg-white/90 transition-all"
            >
              {t("hero.cta")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#configurator"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              <Sparkles className="size-4" />
              {t("hero.cta2")}
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-x py-14 md:py-20">
        <SectionHeader num="02" title={t("cats.title")} sub={t("cats.sub")} />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/catalogue"
              search={{ category: cat.slug }}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden hover-lift bg-secondary"
            >
              <div
                className="absolute inset-0 transition-opacity"
                style={{
                  background: `linear-gradient(180deg, ${cat.color}40 0%, ${cat.color}10 50%, #ffffff 100%)`,
                }}
              />
              <div className="relative h-full flex flex-col justify-between p-5">
                <span
                  className="text-xs font-mono"
                  style={{ color: cat.color === "#FFE66D" ? "#1A1A1A" : cat.color }}
                >
                  0{cat.sort_order}
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-semibold">{pickLang(cat, "name", lang)}</h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="container-x py-14 md:py-20">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <SectionHeader num="03" title={t("featured.title")} sub={t("featured.sub")} />
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent transition-colors shrink-0"
            >
              {t("featured.all")}
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Mobile: horizontal scroll. md+: grid */}
          <div className="mt-8 -mx-5 md:mx-0 md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-5 snap-x snap-mandatory">
              {featured.map((p) => (
                <FeaturedCard key={p.id} p={p} categories={categories} lang={lang} t={t} className="w-[70%] shrink-0 snap-start" />
              ))}
            </div>
          </div>
          <div className="mt-8 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => (
              <FeaturedCard key={p.id} p={p} categories={categories} lang={lang} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* CONFIGURATOR */}
      <section id="configurator" className="bg-secondary/50 py-14 md:py-20">
        <div className="container-x grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <SectionHeader num="03" title={t("config.title")} />
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">{t("config.desc")}</p>
            <Link
              to="/catalogue"
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-6 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-all"
            >
              <Sparkles className="size-4" />
              {t("hero.cta")}
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-white shadow-elev border border-border overflow-hidden relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(160,140,255,0.18) 0%, rgba(255,255,255,0) 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-accent/15 text-accent mb-4">
                  <Sparkles className="size-9" />
                </div>
                <div className="font-display font-semibold text-2xl">3D — {lang === "fr" ? "Temps réel" : "Real-time"}</div>
                <div className="text-sm text-muted-foreground mt-1">setup-paris-3d.netlify.app</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="container-x py-14 md:py-20">
        <SectionHeader num="04" title={t("how.title")} />
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: MousePointerClick, t: t("how.s1.t"), d: t("how.s1.d") },
            { i: Sparkles, t: t("how.s2.t"), d: t("how.s2.d") },
            { i: FileCheck2, t: t("how.s3.t"), d: t("how.s3.d") },
            { i: Headset, t: t("how.s4.t"), d: t("how.s4.d") },
          ].map((s, idx) => (
            <div key={idx} className="rounded-lg border border-border p-6 bg-white hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">0{idx + 1}</span>
                <s.i className="size-5 text-accent" />
              </div>
              <h4 className="mt-6 font-display font-semibold text-lg">{s.t}</h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-16 md:pb-20">
        <div className="rounded-2xl bg-foreground text-background p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">— Setup Paris</div>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-balance max-w-xl">
              {lang === "fr" ? "Prêt à configurer votre événement ?" : "Ready to design your event?"}
            </h3>
          </div>
          <Link
            to="/catalogue"
            className={cn("inline-flex items-center gap-2 bg-accent text-accent-foreground rounded-lg px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity")}
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
      <h2 className="mt-3 font-display font-semibold text-balance text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-tight max-w-3xl">
        {title}
      </h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{sub}</p>}
    </div>
  );
}
