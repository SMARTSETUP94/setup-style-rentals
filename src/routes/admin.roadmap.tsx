import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Setup Paris" }] }),
  component: RoadmapPage,
});

type Status = "done" | "in-progress" | "planned";

const done: { title: string; description: string }[] = [
  { title: "Catalogue produit complet", description: "Catégories, fiches produits, options, recherche et filtres." },
  { title: "Configurateur 3D", description: "Iframe interactive avec postMessage (Cornhole, Stèle Miroir, etc.)." },
  { title: "Système de devis", description: "Panier, demande de devis, calcul HT/TTC, caution, frais logistiques." },
  { title: "Espace administrateur", description: "Authentification, gestion produits, catégories, options et paramètres." },
  { title: "Suivi des demandes", description: "Liste des devis, statuts, détails client et logistique." },
  { title: "Calendrier événements", description: "Vue mensuelle des devis confirmés et livrés." },
  { title: "Bilingue FR / EN", description: "Site public et back-office traduits." },
  { title: "SEO & sitemap", description: "Métadonnées par route, robots.txt et sitemap.xml dynamiques." },
  { title: "Domaine personnalisé", description: "catalogue.setup.paris en production." },
];

const upcoming: { title: string; description: string; status: Exclude<Status, "done"> }[] = [
  { title: "Paiement en ligne", description: "Acompte ou règlement complet via Stripe / Paddle.", status: "planned" },
  { title: "Espace client", description: "Compte client avec suivi et historique des commandes.", status: "planned" },
  { title: "Notifications email", description: "Système d'emails transactionnels (confirmation, rappel, suivi).", status: "in-progress" },
  { title: "Analytics & dashboard admin", description: "Statistiques détaillées : conversion, top produits, revenus.", status: "in-progress" },
  { title: "Gestion des disponibilités", description: "Calendrier de stock par produit avec blocage automatique.", status: "planned" },
  { title: "Système d'avis clients", description: "Recueil et affichage des avis vérifiés post-événement.", status: "planned" },
  { title: "Intégration CRM", description: "Synchronisation des contacts et devis avec un CRM externe.", status: "planned" },
];

function StatusBadge({ status }: { status: Exclude<Status, "done"> }) {
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
        <Loader2 className="size-3 animate-spin" />
        En cours
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground border border-border">
      <Clock className="size-3" />
      Prévu
    </span>
  );
}

function RoadmapPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi de l'évolution de catalogue.setup.paris.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Done column */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
              <h2 className="font-semibold text-sm">Fait</h2>
            </div>
            <span className="text-xs text-muted-foreground">{done.length} fonctionnalités</span>
          </div>
          <ul className="divide-y divide-border">
            {done.map((item) => (
              <li key={item.title} className="px-4 py-3 flex gap-3">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Upcoming column */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-amber-600 dark:text-amber-500" />
              <h2 className="font-semibold text-sm">À venir</h2>
            </div>
            <span className="text-xs text-muted-foreground">{upcoming.length} fonctionnalités</span>
          </div>
          <ul className="divide-y divide-border">
            {upcoming.map((item) => (
              <li key={item.title} className="px-4 py-3 flex gap-3">
                <Clock
                  className={cn(
                    "size-4 shrink-0 mt-0.5",
                    item.status === "in-progress"
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-medium text-sm">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
