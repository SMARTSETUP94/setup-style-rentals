import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatEUR } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

type Product = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  category_slug: string;
  dimensions: string | null;
  price_day: number;
  price_week: number | null;
  price_month: number | null;
  deposit: number;
  configurator_url: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type Category = { slug: string; name_fr: string };

const empty: Partial<Product> = {
  slug: "",
  name_fr: "",
  name_en: "",
  description_fr: "",
  description_en: "",
  category_slug: "",
  dimensions: "",
  price_day: 0,
  price_week: null,
  price_month: null,
  deposit: 0,
  configurator_url: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: p, error: e1 }, { data: c, error: e2 }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order").order("name_fr"),
      supabase.from("categories").select("slug, name_fr").order("sort_order"),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);
    setProducts((p as Product[]) ?? []);
    setCategories((c as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name_fr || !editing.name_en || !editing.category_slug) {
      toast.error("Slug, noms FR/EN et catégorie sont requis");
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug!,
      name_fr: editing.name_fr!,
      name_en: editing.name_en!,
      description_fr: editing.description_fr || null,
      description_en: editing.description_en || null,
      category_slug: editing.category_slug!,
      dimensions: editing.dimensions || null,
      price_day: Number(editing.price_day) || 0,
      price_week: editing.price_week ? Number(editing.price_week) : null,
      price_month: editing.price_month ? Number(editing.price_month) : null,
      deposit: Number(editing.deposit) || 0,
      configurator_url: editing.configurator_url || null,
      image_url: editing.image_url || null,
      sort_order: Number(editing.sort_order) || 0,
      is_active: editing.is_active ?? true,
    };
    const res = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? "Produit modifié" : "Produit créé");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Produit supprimé");
    setProducts((p) => p.filter((x) => x.id !== id));
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x)));
  };

  const filtered = products.filter(
    (p) =>
      p.name_fr.toLowerCase().includes(filter.toLowerCase()) ||
      p.slug.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produits</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-56"
          />
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="size-4" /> Nouveau
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nom</th>
              <th className="text-left px-4 py-3 font-medium">Catégorie</th>
              <th className="text-right px-4 py-3 font-medium">Prix/j</th>
              <th className="text-right px-4 py-3 font-medium">Caution</th>
              <th className="text-center px-4 py-3 font-medium">Actif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun produit</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name_fr}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category_slug}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatEUR(p.price_day)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatEUR(p.deposit)}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier" : "Nouveau produit"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <FieldInput label="Slug *" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <FieldSelect
                label="Catégorie *"
                value={editing.category_slug || ""}
                onChange={(v) => setEditing({ ...editing, category_slug: v })}
                options={categories.map((c) => ({ value: c.slug, label: c.name_fr }))}
              />
              <FieldInput label="Nom FR *" value={editing.name_fr || ""} onChange={(v) => setEditing({ ...editing, name_fr: v })} />
              <FieldInput label="Nom EN *" value={editing.name_en || ""} onChange={(v) => setEditing({ ...editing, name_en: v })} />
              <div className="col-span-2">
                <Label>Description FR</Label>
                <Textarea
                  value={editing.description_fr || ""}
                  onChange={(e) => setEditing({ ...editing, description_fr: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Description EN</Label>
                <Textarea
                  value={editing.description_en || ""}
                  onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <FieldInput label="Dimensions" value={editing.dimensions || ""} onChange={(v) => setEditing({ ...editing, dimensions: v })} />
              <FieldInput label="Image URL" value={editing.image_url || ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
              <FieldInput
                label="Prix/jour (€)"
                type="number"
                value={String(editing.price_day ?? 0)}
                onChange={(v) => setEditing({ ...editing, price_day: Number(v) })}
              />
              <FieldInput
                label="Caution (€)"
                type="number"
                value={String(editing.deposit ?? 0)}
                onChange={(v) => setEditing({ ...editing, deposit: Number(v) })}
              />
              <FieldInput
                label="Prix/semaine (€)"
                type="number"
                value={String(editing.price_week ?? "")}
                onChange={(v) => setEditing({ ...editing, price_week: v ? Number(v) : null })}
              />
              <FieldInput
                label="Prix/mois (€)"
                type="number"
                value={String(editing.price_month ?? "")}
                onChange={(v) => setEditing({ ...editing, price_month: v ? Number(v) : null })}
              />
              <FieldInput
                label="URL configurateur 3D"
                value={editing.configurator_url || ""}
                onChange={(v) => setEditing({ ...editing, configurator_url: v })}
              />
              <FieldInput
                label="Ordre"
                type="number"
                value={String(editing.sort_order ?? 0)}
                onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })}
              />
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Label>Produit actif</Label>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldInput({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}

function FieldSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
