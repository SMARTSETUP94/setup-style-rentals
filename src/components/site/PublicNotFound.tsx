import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { applyNotFoundStatus } from "@/lib/ssr-status";
import { Button } from "@/components/ui/button";

export function PublicNotFound() {
  const { lang } = useI18n();
  applyNotFoundStatus();
  return <div className="container-x pt-32 pb-24 text-center">
    <p className="text-muted-foreground">404</p>
    <h1 className="mt-4 font-display text-3xl">{lang === "fr" ? "Page introuvable" : "Page not found"}</h1>
    <p className="mt-4 text-muted-foreground">{lang === "fr" ? "Cette page n'existe pas ou n'est plus disponible." : "This page does not exist or is no longer available."}</p>
    <Button asChild variant="outline" className="mt-6"><Link to="/catalogue">{lang === "fr" ? "Retour au catalogue" : "Back to catalogue"}</Link></Button>
  </div>;
}