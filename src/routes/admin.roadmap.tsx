import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Setup Paris" }] }),
  component: RoadmapPage,
});

type Status = "done" | "in-progress" | "planned";

type Feature = {
  title: string;
  description: string;
  status: Status;
  date?: string;
};

const features: Feature[] = [
  // Done
  { status: "done", date: "Mars 2025", title: "Catalogue produits avec fiches détaillées", description: "Pages produits complètes avec descriptions, dimensions, prix et galeries." },
  { status: "done", date: "Mars 2025", title: "Configurateurs 3D intégrés (17 produits)", description: "Iframes interactives avec postMessage pour personnalisation en temps réel." },
  { status: "done", date: "Mars 2025", title: "Système de devis / panier", description: "Ajout au panier, demande de devis, calcul HT/TTC, caution et frais logistiques." },
  { status: "done", date: "Mars 2025", title: "Page admin avec gestion produits", description: "Création, édition, activation, options et remises par produit." },
  { status: "done", date: "Mars 2025", title: "Gestion des catégories", description: "CRUD complet des catégories avec visuels, ordre et statut actif." },
  { status: "done", date: "Avril 2025", title: "Gestion des configurateurs 3D", description: "Upload HTML ou URL externe, options JSON envoyées via postMessage." },
  { status: "done", date: "Avril 2025", title: "Intégration Netlify pour les configurateurs", description: "Hébergement dédié sur setup-paris-configurators.netlify.app." },

  // In progress
  { status: "in-progress", title: "Notifications email", description: "Système d'emails transactionnels (confirmation, rappel, suivi)." },
  { status: "in-progress", title: "Analytics & dashboard admin", description: "Statistiques détaillées : conversion, top produits, revenus." },

  // Planned
  { status: "planned", title: "Paiement en ligne", description: "Acompte ou règlement complet via Stripe / Paddle." },
  { status: "planned", title: "Espace client", description: "Compte client avec suivi et historique des commandes." },
  { status: "planned", title: "Gestion des disponibilités", description: "Calendrier de stock par produit avec blocage automatique." },
  { status: "planned", title: "Système d'avis clients", description: "Recueil et affichage des avis vérifiés post-événement." },
  { status: "planned", title: "Intégration CRM", description: "Synchronisation des contacts et devis avec un CRM externe." },
];

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; tone: string; dot: string }> = {
  done: {
    label: "Livré",
    icon: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "En cours",
    icon: Loader2,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  planned: {
    label: "Prévu",
    icon: Clock,
    tone: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider border",
        meta.tone,
      )}
    >
      <Icon className={cn("size-3", status === "in-progress" && "animate-spin")} />
      {meta.label}
    </span>
  );
}

function StatCard({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: Status;
}) {
  const meta = STATUS_META[status];
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <span className={cn("size-2.5 rounded-full shrink-0", meta.dot)} aria-hidden />
      <div className="min-w-0">
        <div className="text-2xl font-semibold leading-none">{count}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-sm leading-snug">{feature.title}</h3>
        <StatusBadge status={feature.status} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
      {feature.date && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pt-1">
          Mis en ligne · {feature.date}
        </div>
      )}
    </article>
  );
}

function Section({ status, items }: { status: Status; items: Feature[] }) {
  if (items.length === 0) return null;
  const meta = STATUS_META[status];
  const titleMap: Record<Status, string> = {
    done: "Développées",
    "in-progress": "En cours",
    planned: "À venir",
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="font-semibold text-sm">{titleMap[status]}</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </section>
  );
}

function RoadmapPage() {
  const done = features.filter((f) => f.status === "done");
  const inProgress = features.filter((f) => f.status === "in-progress");
  const planned = features.filter((f) => f.status === "planned");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivi de l'évolution de catalogue.setup.paris.
        </p>
      </header>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="livrées" count={done.length} status="done" />
        <StatCard label="en cours" count={inProgress.length} status="in-progress" />
        <StatCard label="prévues" count={planned.length} status="planned" />
      </div>

      {/* Sections */}
      <Section status="done" items={done} />
      <Section status="in-progress" items={inProgress} />
      <Section status="planned" items={planned} />
    </div>
  );
}
