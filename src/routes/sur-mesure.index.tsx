import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ConciergeBell, Boxes, Signpost, Armchair, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCustomPublicPricing, priceLines } from "@/lib/custom-pricing";
import { canonicalUrl, headLang, L, localeMeta, seoLinks, serviceJsonLd } from "@/lib/seo";
import { SUR_MESURE_FAMILIES, SUR_MESURE_PIECES, type SurMesureFamily } from "@/lib/sur-mesure";

export const Route = createFileRoute("/sur-mesure/")({
  head: ({ match }) => {
    const lang = headLang(match);
    const title = L(lang, "Mobilier événementiel sur mesure — Setup Paris", "Custom-made event furniture — Setup Paris");
    return {
      meta: [
        { title },
        {
          name: "description",
          content: L(lang,
            "Faites fabriquer votre mobilier événementiel sur mesure : comptoirs, stèles, podiums, totems, arches… Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.",
            "Have your event furniture custom-made: counters, plinths, podiums, totems, arches… Configure in 3D; price and production time confirmed within two business days."),
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: L(lang, "24 pièces à vos cotes et finitions, configurées en 3D. Prix et délai confirmés sous 48 h ouvrées.", "24 pieces to your dimensions and finishes, configured in 3D. Price and production time confirmed within two business days."),
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl("/sur-mesure", lang) },
        ...localeMeta(lang),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: seoLinks("/sur-mesure", lang),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            serviceJsonLd(
              L(lang, "Fabrication de mobilier événementiel sur mesure", "Custom-made event furniture production"),
              L(lang, "Comptoirs, stèles, podiums, totems, arches et assises fabriqués à vos cotes et finitions, configurés en 3D.", "Counters, plinths, podiums, totems, arches and seating made to your dimensions and finishes, configured in 3D."),
              canonicalUrl("/sur-mesure", lang),
              lang,
            ),
          ),
        },
      ],
    };
  },
  component: SurMesurePage,
});

export const FAMILY_ICONS: Record<SurMesureFamily, LucideIcon> = {
  accueil: ConciergeBell,
  presentation: Boxes,
  decor: Signpost,
  assises: Armchair,
};

const TXT = {
  fr: {
    eyebrow: "— Sur mesure",
    title: "Mobilier événementiel sur mesure",
    intro: "Choisissez une pièce, réglez ses cotes et ses finitions en 3D, envoyez votre demande : prix et délai confirmés sous 48 h ouvrées.",
    choiceTitle: "Louer ou faire fabriquer ?",
    rentTitle: "Louer",
    rentText: "Les objets du catalogue, selon stock, à la journée.",
    rentCta: "Voir le catalogue",
    makeTitle: "Faire fabriquer",
    makeText: "À vos cotes et finitions : la pièce vous appartient.",
    stepsTitle: "Comment ça marche",
    steps: [
      ["Choisir", "Sélectionnez la pièce qui correspond à votre besoin."],
      ["Configurer", "Réglez cotes, matières et finitions dans le configurateur 3D."],
      ["Envoyer la demande", "Ajoutez la pièce à votre demande et envoyez-la."],
      ["Validation puis fabrication", "Notre bureau d'études valide le projet, puis un échantillon, avant fabrication."],
    ],
    piecesTitle: "Les pièces",
    configure: "Configurer",
    missingTitle: "Votre pièce n'est pas dans la liste ?",
    missingText: "Décrivez-nous votre projet, nous étudions toutes les demandes.",
    missingCta: "Nous contacter",
  },
  en: {
    eyebrow: "— Custom-made",
    title: "Custom-made event furniture",
    intro: "Pick a piece, set its dimensions and finishes in 3D, send your request: price and lead time confirmed within two business days.",
    choiceTitle: "Rent or have it made?",
    rentTitle: "Rent",
    rentText: "Items from our catalogue, subject to stock, by the day.",
    rentCta: "See the catalogue",
    makeTitle: "Have it made",
    makeText: "To your dimensions and finishes: the piece is yours to keep.",
    stepsTitle: "How it works",
    steps: [
      ["Choose", "Select the piece that fits your need."],
      ["Configure", "Set dimensions, materials and finishes in the 3D configurator."],
      ["Send your request", "Add the piece to your request and send it."],
      ["Approval, then production", "Our design office approves the project, then a sample, before production."],
    ],
    piecesTitle: "The pieces",
    configure: "Configure",
    missingTitle: "Can't find your piece?",
    missingText: "Tell us about your project — we look at every request.",
    missingCta: "Contact us",
  },
};

function SurMesurePage() {
  const { lang } = useI18n();
  const tx = TXT[lang];
  const prices = useCustomPublicPricing();
  return (
    <div className="pt-24 md:pt-28 pb-16">
      <div className="container-x">
        <div className="section-num">{tx.eyebrow}</div>
        <h1 className="mt-3 font-display font-semibold text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight">{tx.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{tx.intro}</p>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-2xl">{tx.choiceTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="font-semibold text-lg">{tx.rentTitle}</div>
              <p className="mt-2 text-sm text-muted-foreground">{tx.rentText}</p>
              <Link to="/catalogue" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                {tx.rentCta} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-gold/40 bg-gold/5 p-6">
              <div className="font-semibold text-lg">{tx.makeTitle}</div>
              <p className="mt-2 text-sm text-muted-foreground">{tx.makeText}</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display font-semibold text-2xl">{tx.stepsTitle}</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tx.steps.map(([title, text], i) => (
              <li key={title} className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-semibold text-gold-ink">0{i + 1}</div>
                <div className="mt-2 font-semibold">{title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14">
          <h2 className="font-display font-semibold text-2xl">{tx.piecesTitle}</h2>
          {SUR_MESURE_FAMILIES.map((f) => {
            const Icon = FAMILY_ICONS[f.key];
            const pieces = SUR_MESURE_PIECES.filter((p) => p.fam === f.key);
            return (
              <div key={f.key} className="mt-8">
                <h3 className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-muted-foreground font-medium">
                  <Icon className="size-4 text-gold-ink" /> {lang === "fr" ? f.fr : f.en}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pieces.map((p) => (
                    <Link
                      key={p.k}
                      to="/sur-mesure/$piece"
                      params={{ piece: p.k }}
                      search={{ line: undefined, c: undefined }}
                      className="group rounded-2xl border border-border bg-card p-5 hover:border-foreground/30 hover:shadow-soft transition-all"
                    >
                      <span className="inline-flex items-center justify-center size-10 rounded-full bg-gold/15 text-gold-ink">
                        <Icon className="size-4" />
                      </span>
                      <div className="mt-3 font-semibold">{lang === "fr" ? p.nom : p.name_en}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{lang === "fr" ? p.desc : p.desc_en}</p>
                      {priceLines(prices[p.k], lang).map((l) => (
                        <p key={l} className="mt-2 text-xs font-medium text-foreground">{l}</p>
                      ))}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {tx.configure} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-14 rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 className="font-display font-semibold text-xl">{tx.missingTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{tx.missingText}</p>
          <Link to="/contact" className="mt-5 inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition-colors">
            {tx.missingCta}
          </Link>
        </section>
      </div>
    </div>
  );
}
