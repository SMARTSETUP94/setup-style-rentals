import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminI18n } from "@/lib/admin-i18n";
import { ScrollableTable } from "@/components/admin/ScrollableTable";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

type Category = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  color: string;
  icon: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const empty: Partial<Category> = {
  slug: "",
  name_fr: "",
  name_en: "",
  color: "#A08CFF",
  icon: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminCategoriesPage() {
  const { t, lang } = useAdminI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: cats, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("category_slug"),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);
    setCategories((cats as Category[]) ?? []);
    const map: Record<string, number> = {};
    (prods ?? []).forEach((p: any) => {
      map[p.category_slug] = (map[p.category_slug] || 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (c: Partial<Category> | null) => {
    setSlugManuallyEdited(!!c?.id);
    setEditing(c);
  };

  const onNameFrChange = (v: string) => {
    if (!editing) return;
    const next: Partial<Category> = { ...editing, name_fr: v };
    if (!slugManuallyEdited && !editing.id) next.slug = slugify(v);
    setEditing(next);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name_fr || !editing.name_en) {
      toast.error(t("cats.requiredFields"));
      return;
    }
    setSaving(true);
    const payload = {
      slug: editing.slug!,
      name_fr: editing.name_fr!,
      name_en: editing.name_en!,
      color: editing.color || "#A08CFF",
      icon: editing.icon || null,
      image_url: editing.image_url || null,
      is_active: editing.is_active ?? true,
      sort_order: Number(editing.sort_order) || 0,
    };
    const res = editing.id
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? t("cats.updated") : t("cats.created"));
    setEditing(null);
    load();
  };

  const remove = async (c: Category) => {
    const count = counts[c.slug] || 0;
    if (count > 0) {
      toast.error(t("cats.cantDelete", { n: count }));
      return;
    }
    const name = lang === "en" ? c.name_en : c.name_fr;
    if (!confirm(t("cats.confirmDelete", { name }))) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(t("cats.deleted"));
    load();
  };

  const toggleActive = async (c: Category) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)));
  };

  const displayName = (c: Category) => (lang === "en" ? c.name_en : c.name_fr);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("cats.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} {t("cats.count")}
          </p>
        </div>
        <Button onClick={() => openEdit({ ...empty })}>
          <Plus className="size-4" /> {t("cats.add")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium w-16">{t("cats.col.order")}</th>
              <th className="text-left px-4 py-3 font-medium w-20">{t("cats.col.visual")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("cats.col.nameFr")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("cats.col.slug")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("cats.col.products")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("common.active")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("layout.loading")}</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("cats.empty")}</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    {c.image_url ? (
                      <img src={c.image_url} alt="" className="h-10 w-10 rounded object-cover border border-border" />
                    ) : (
                      <div
                        className="h-10 w-10 rounded flex items-center justify-center text-xs font-medium text-white"
                        style={{ background: c.color }}
                      >
                        {c.icon || displayName(c).slice(0, 1)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{displayName(c)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{counts[c.slug] || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(c)}>
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
            <DialogTitle>{editing?.id ? t("cats.editTitle") : t("cats.newTitle")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Field label={t("cats.field.nameFr")} value={editing.name_fr || ""} onChange={onNameFrChange} />
              <Field label={t("cats.field.nameEn")} value={editing.name_en || ""} onChange={(v) => setEditing({ ...editing, name_en: v })} />
              <Field
                label={t("cats.field.slug")}
                value={editing.slug || ""}
                onChange={(v) => { setSlugManuallyEdited(true); setEditing({ ...editing, slug: slugify(v) }); }}
              />
              <Field
                label={t("cats.field.icon")}
                value={editing.icon || ""}
                onChange={(v) => setEditing({ ...editing, icon: v })}
              />
              <Field
                label={t("cats.field.color")}
                value={editing.color || "#A08CFF"}
                onChange={(v) => setEditing({ ...editing, color: v })}
              />
              <Field
                label={t("common.order")}
                type="number"
                value={String(editing.sort_order ?? 0)}
                onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })}
              />
              <div className="col-span-2">
                <Label>{t("cats.field.image")}</Label>
                <CategoryImageUploader
                  value={editing.image_url || ""}
                  onChange={(url) => setEditing({ ...editing, image_url: url })}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Label>{t("cats.field.activeLabel")}</Label>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>{t("common.cancel")}</Button>
            <Button onClick={save} disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}

function CategoryImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { t } = useAdminI18n();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error(t("common.imageMustBe"));
    if (file.size > 5 * 1024 * 1024) return toast.error(t("common.imageTooLarge"));
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("category-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("category-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success(t("common.imageUploaded"));
  };

  return (
    <div className="mt-1.5 space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={t("common.preview")} className="h-32 w-32 rounded-lg object-cover border border-border" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {uploading ? t("common.uploading") : t("common.dragImage")}
          </p>
          <p className="text-xs text-muted-foreground">{t("common.imageHint")}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      <Input
        placeholder={t("common.orPasteUrl")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
