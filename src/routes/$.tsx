import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicNotFound } from "@/components/site/PublicNotFound";
import { applyNotFoundStatus } from "@/lib/ssr-status";
import { headLang, L } from "@/lib/seo";

export const Route = createFileRoute("/$")({
  loader: () => { throw notFound(); },
  head: ({ match }) => {
    const lang = headLang(match);
    const title = L(lang, "Page introuvable — Setup Paris", "Page not found — Setup Paris");
    const description = L(lang, "Cette page n'est pas disponible. Retrouvez le catalogue Setup Paris.", "This page is unavailable. Browse the Setup Paris catalogue.");
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] };
  },
  component: PublicNotFound,
  notFoundComponent: PublicNotFound,
  errorComponent: PublicNotFound,
});