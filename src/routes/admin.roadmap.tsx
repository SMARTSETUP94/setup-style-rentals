import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/admin/roadmap")({
  head: () => ({ meta: [{ title: "Roadmap — Setup Paris" }] }),
  component: RoadmapPage,
});

type Status = "done" | "in-progress" | "planned";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: Status;
  date: string | null;
  sort_order: number;
};

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

const SECTION_TITLE: Record<Status, string> = {
  done: "Développées",
  "in-progress": "En cours",
  planned: "À venir",
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

function StatCard({ label, count, status }: { label: string; count: number; status: Status }) {
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

function FeatureCard({
  item,
  onEdit,
  onDelete,
}: {
  item: RoadmapItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-2 transition-colors hover:bg-muted/30 relative">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-sm leading-snug pr-16">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
      {item.date && (
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pt-1">
          {item.status === "done" ? "Mis en ligne · " : "Échéance · "}
          {item.date}
        </div>
      )}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur hover:bg-muted border border-border"
          aria-label="Modifier"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-md bg-background/80 backdrop-blur hover:bg-destructive hover:text-destructive-foreground border border-border"
          aria-label="Supprimer"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

function Section({
  status,
  items,
  onEdit,
  onDelete,
}: {
  status: Status;
  items: RoadmapItem[];
  onEdit: (i: RoadmapItem) => void;
  onDelete: (i: RoadmapItem) => void;
}) {
  if (items.length === 0) return null;
  const meta = STATUS_META[status];
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
        <h2 className="font-semibold text-sm">{SECTION_TITLE[status]}</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <FeatureCard
            key={it.id}
            item={it}
            onEdit={() => onEdit(it)}
            onDelete={() => onDelete(it)}
          />
        ))}
      </div>
    </section>
  );
}

type EditorState =
  | { open: false }
  | { open: true; mode: "create" | "edit"; item: Partial<RoadmapItem> };

function RoadmapPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("roadmap_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast.error("Erreur de chargement");
    } else {
      setItems((data || []) as RoadmapItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditor({
      open: true,
      mode: "create",
      item: { title: "", description: "", status: "planned", date: "", sort_order: 100 },
    });
  }

  function openEdit(item: RoadmapItem) {
    setEditor({ open: true, mode: "edit", item: { ...item } });
  }

  async function handleSave() {
    if (!editor.open) return;
    const it = editor.item;
    if (!it.title?.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    setSaving(true);
    const payload = {
      title: it.title.trim(),
      description: (it.description || "").trim(),
      status: (it.status as Status) || "planned",
      date: it.date && it.date.trim() ? it.date.trim() : null,
      sort_order: typeof it.sort_order === "number" ? it.sort_order : 100,
    };
    const { error } =
      editor.mode === "create"
        ? await supabase.from("roadmap_items").insert(payload)
        : await supabase.from("roadmap_items").update(payload).eq("id", it.id!);
    setSaving(false);
    if (error) {
      toast.error("Erreur d'enregistrement");
      return;
    }
    toast.success(editor.mode === "create" ? "Item ajouté" : "Item modifié");
    setEditor({ open: false });
    load();
  }

  async function handleDelete(item: RoadmapItem) {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    const { error } = await supabase.from("roadmap_items").delete().eq("id", item.id);
    if (error) {
      toast.error("Erreur de suppression");
      return;
    }
    toast.success("Item supprimé");
    load();
  }

  const done = items.filter((f) => f.status === "done");
  const inProgress = items.filter((f) => f.status === "in-progress");
  const planned = items.filter((f) => f.status === "planned");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi de l'évolution de catalogue.setup.paris.
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          Ajouter un item
        </Button>
      </header>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="livrées" count={done.length} status="done" />
        <StatCard label="en cours" count={inProgress.length} status="in-progress" />
        <StatCard label="prévues" count={planned.length} status="planned" />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground py-12 text-center">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center border border-dashed border-border rounded-xl">
          Aucun item pour le moment.
        </div>
      ) : (
        <>
          <Section status="done" items={done} onEdit={openEdit} onDelete={handleDelete} />
          <Section status="in-progress" items={inProgress} onEdit={openEdit} onDelete={handleDelete} />
          <Section status="planned" items={planned} onEdit={openEdit} onDelete={handleDelete} />
        </>
      )}

      {/* Editor dialog */}
      <Dialog open={editor.open} onOpenChange={(o) => !o && setEditor({ open: false })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editor.open && editor.mode === "create" ? "Nouvel item" : "Modifier l'item"}
            </DialogTitle>
          </DialogHeader>

          {editor.open && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="rm-title">Titre *</Label>
                <Input
                  id="rm-title"
                  value={editor.item.title || ""}
                  onChange={(e) =>
                    setEditor({ ...editor, item: { ...editor.item, title: e.target.value } })
                  }
                  placeholder="ex: Paiement en ligne"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rm-desc">Description</Label>
                <Textarea
                  id="rm-desc"
                  value={editor.item.description || ""}
                  onChange={(e) =>
                    setEditor({ ...editor, item: { ...editor.item, description: e.target.value } })
                  }
                  rows={3}
                  placeholder="ex: Acompte ou règlement complet via Stripe."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rm-status">Statut</Label>
                  <Select
                    value={(editor.item.status as Status) || "planned"}
                    onValueChange={(v) =>
                      setEditor({ ...editor, item: { ...editor.item, status: v as Status } })
                    }
                  >
                    <SelectTrigger id="rm-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="done">Livré</SelectItem>
                      <SelectItem value="in-progress">En cours</SelectItem>
                      <SelectItem value="planned">Prévu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rm-date">Date (texte libre)</Label>
                  <Input
                    id="rm-date"
                    value={editor.item.date || ""}
                    onChange={(e) =>
                      setEditor({ ...editor, item: { ...editor.item, date: e.target.value } })
                    }
                    placeholder="ex: Mars 2025 ou Q3 2025"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rm-sort">Ordre d'affichage</Label>
                <Input
                  id="rm-sort"
                  type="number"
                  value={editor.item.sort_order ?? 100}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: { ...editor.item, sort_order: parseInt(e.target.value) || 0 },
                    })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Plus petit = affiché en premier dans sa section.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditor({ open: false })} disabled={saving}>
              <X className="size-4" />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
