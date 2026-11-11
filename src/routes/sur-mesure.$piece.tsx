import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Check, Link2, X } from "lucide-react";
import { toast } from "sonner";
import { useCustomPublicPricing, priceLines } from "@/lib/custom-pricing";
import { trackSiteEvent } from "@/lib/track";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { canonicalLink, canonicalUrl, hreflangLinks } from "@/lib/seo";
import { getPiece, SurMesureConfigMessage, SUR_MESURE_FAMILIES, decodeConfigParam, configLink } from "@/lib/sur-mesure";

const ALLOWED_TYPES = new Set(["sur-mesure-ready", "sur-mesure-config", "sur-mesure-save"]);
const CONFIGURATOR_TEL = "+33601416111";

export const Route = createFileRoute("/sur-mesure/$piece")({
  validateSearch: zodValidator(z.object({ line: z.string().max(64).optional(), c: z.string().max(6000).optional() })),
  loader: ({ params }) => {
    const piece = getPiece(params.piece);
    if (!piece) throw notFound();
    return { piece };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.piece;
    if (!p) return { meta: [{ title: "Pièce introuvable — Setup Paris" }, { name: "robots", content: "noindex" }] };
    const title = `${p.nom} sur mesure — Setup Paris`;
    const path = `/sur-mesure/${params.piece}`;
    return {
      meta: [
        { title },
        { name: "description", content: `${p.desc} Configurez en 3D, prix et délai confirmés sous 48 h ouvrées.` },
        { property: "og:title", content: title },
        { property: "og:description", content: p.desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl(path) },
        { name: "twitter:card", content: "summary" },
      ],
      links: [canonicalLink(path), ...hreflangLinks(path)],
    };
  },
  component: PiecePage,
  notFoundComponent: () => {
    void import("@/lib/ssr-status").then((m) => m.applyNotFoundStatus());
    return (
      <div className="container-x pt-32 pb-16 text-center">
        <h1 className="font-display text-3xl mb-4">Pièce introuvable / Piece not found</h1>
        <Link to="/sur-mesure" className="underline">Retour au sur-mesure / Back to custom-made</Link>
      </div>
    );
  },
});

const TXT = {
  fr: {
    back: "Tous les modèles sur mesure",
    close: "Fermer",
    copyLink: "Copier le lien de cette configuration",
    copied: "Lien copié",
    frameTitle: "Configurateur 3D sur mesure",
    added: "Pièce ajoutée à votre demande",
    updated: "Pièce mise à jour dans votre demande",
    seeRequest: "Voir ma demande",
    another: "Configurer une autre pièce",
    suffix: "sur mesure",
  },
  en: {
    back: "All custom-made pieces",
    close: "Close",
    copyLink: "Copy link to this configuration",
    copied: "Link copied",
    frameTitle: "Custom-made 3D configurator",
    added: "Piece added to your request",
    updated: "Piece updated in your request",
    seeRequest: "See my request",
    another: "Configure another piece",
    suffix: "custom-made",
  },
};

function PiecePage() {
  const { piece } = Route.useLoaderData();
  const { line, c } = Route.useSearch();
  const { lang } = useI18n();
  const tx = TXT[lang];
  const prices = useCustomPublicPricing();
  const lines = priceLines(prices[piece.k], lang);
  const sharedConfigRef = useRef<Record<string, unknown> | null>(decodeConfigParam(c, piece.k));
  const [lastConfig, setLastConfig] = useState<Record<string, unknown> | null>(sharedConfigRef.current);
  useEffect(() => {
    trackSiteEvent("custom_view", piece.k);
  }, [piece.k]);
  const copyLink = async () => {
    const url = configLink(piece.k, lastConfig ?? undefined, window.location.origin);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(tx.copied);
    } catch {
      window.prompt(tx.copyLink, url);
    }
  };

  const navigate = useNavigate();
  const { items, add, update } = useCart();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [banner, setBanner] = useState<null | "added" | "updated">(null);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const editLineRef = useRef<string | undefined>(line);
  editLineRef.current = line;

  const family = SUR_MESURE_FAMILIES.find((f) => f.key === piece.fam);
  const src = `/configurators/sur-mesure.html?piece=${encodeURIComponent(piece.k)}&tel=${encodeURIComponent(CONFIGURATOR_TEL)}`;

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const win = frameRef.current?.contentWindow;
      if (!win || e.source !== win) return;
      const d = e.data as { type?: unknown } | null;
      if (!d || typeof d !== "object" || typeof d.type !== "string" || !ALLOWED_TYPES.has(d.type)) return;

      if (d.type === "sur-mesure-ready") {
        const editing = editLineRef.current
          ? itemsRef.current.find((i) => i.lineId === editLineRef.current && i.kind === "custom")
          : undefined;
        const restore = editing?.customConfig ?? sharedConfigRef.current;
        if (restore) {
          // Sandboxed iframe has an opaque origin → "*" is required; content is non-sensitive.
          win.postMessage({ type: "restore-config", configuration: restore }, "*");
        }
        return;
      }
      if (d.type !== "sur-mesure-config") return;
      const parsed = SurMesureConfigMessage.safeParse(d);
      if (!parsed.success) {
        console.warn("[sur-mesure] invalid message", parsed.error.issues.map((i) => i.path.join(".")));
        return;
      }
      const m = parsed.data;
      if (m.piece === piece.k) setLastConfig(m.configuration);
      if (m.action !== "save") return;
      const p = getPiece(m.piece);
      if (!p) return;
      const fields = {
        kind: "custom" as const,
        productId: `custom:${p.k}`,
        slug: p.k,
        name_fr: `${p.nom} sur mesure`,
        name_en: `${p.name_en} (custom-made)`,
        category_slug: "sur-mesure",
        image_url: null,
        price_day: 0,
        deposit: 0,
        days: 1,
        quantity: m.quantity,
        customRef: m.reference,
        customPiece: p.k,
        customConfig: m.configuration,
        configuratorRecap: m.recap,
        customAlerts: m.alerts,
        customWeightKg: m.weight_kg,
        customThumbnail: m.thumbnail,
      };
      const editId = editLineRef.current;
      if (editId && itemsRef.current.some((i) => i.lineId === editId)) {
        update(editId, fields);
        setBanner("updated");
      } else {
        add(fields);
        setBanner("added");
        trackSiteEvent("custom_save", p.k);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [add, update, piece.k]);

  return (
    <div className="pt-24 md:pt-28 pb-16">
      {/* Immersive configurator */}
      <div className="fixed inset-0 z-[60] bg-background md:top-24">
        <div className="relative w-full h-[100dvh] md:h-[calc(100dvh-6rem)]">
          <iframe
            ref={frameRef}
            src={src}
            title={`${tx.frameTitle} — ${lang === "fr" ? piece.nom : piece.name_en}`}
            sandbox="allow-scripts allow-downloads"
            className="block w-full h-full border-0"
          />
          <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 z-10 flex items-center gap-2">
          {lastConfig && (
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-background/90 backdrop-blur border border-border hover:bg-background transition-colors shadow-lg"
              aria-label={tx.copyLink}
            >
              <Link2 className="size-4" />
              <span className="hidden md:inline">{tx.copyLink}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/sur-mesure" })}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-background/90 backdrop-blur border border-border hover:bg-background transition-colors shadow-lg"
            aria-label={tx.close}
          >
            <X className="size-4" />
            <span className="hidden sm:inline">{tx.close}</span>
          </button>
          </div>
          {banner && (
            <div
              role="status"
              className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 mx-auto max-w-xl rounded-2xl border border-border bg-background/95 backdrop-blur p-4 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-2 font-medium text-sm flex-1">
                <Check className="size-4 text-accent" />
                {banner === "added" ? tx.added : tx.updated}
              </div>
              <div className="flex gap-2">
                <Link to="/devis" className="inline-flex items-center rounded-lg bg-foreground text-background px-4 py-2 text-sm font-semibold hover:bg-foreground/90">
                  {tx.seeRequest}
                </Link>
                <Link to="/sur-mesure" className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                  {tx.another}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indexable text (behind the immersive layer) */}
      <div className="container-x">
        <Link to="/sur-mesure" className="text-xs uppercase tracking-[0.22em] text-gold hover:underline">← {tx.back}</Link>
        {family && <div className="mt-4 text-sm text-muted-foreground">{lang === "fr" ? family.fr : family.en}</div>}
        <h1 className="mt-2 font-display font-semibold text-4xl tracking-tight">
          {lang === "fr" ? piece.nom : piece.name_en} {tx.suffix}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{lang === "fr" ? piece.desc : piece.desc_en}</p>
        {lines.map((l) => (
          <p key={l} className="mt-3 text-sm font-medium">{l}</p>
        ))}
      </div>
    </div>
  );
}
