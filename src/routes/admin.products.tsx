import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
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
import { formatPrice } from "@/lib/format";
import { ProductOptionsManager } from "@/components/admin/ProductOptionsManager";
import {
  DEFAULT_QUANTITY_DISCOUNTS,
  type QuantityDiscountTier,
  type DurationDiscountTier,
} from "@/lib/cart";
import { useAdminI18n } from "@/lib/admin-i18n";

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
  configurator_options: unknown;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  stock_total: number;
  quantity_discounts: QuantityDiscountTier[];
  duration_discounts: DurationDiscountTier[];
};

type Category = { slug: string; name_fr: string; name_en: string };

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
  configurator_options: {},
  image_url: "",
  sort_order: 0,
  is_active: true,
  stock_total: 1,
  quantity_discounts: DEFAULT_QUANTITY_DISCOUNTS,
  duration_discounts: [],
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

function AdminProductsPage() {
  const { t, lang } = useAdminI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [optionCounts, setOptionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: p, error: e1 }, { data: c, error: e2 }, { data: oc, error: e3 }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order").order("name_fr"),
      supabase.from("categories").select("slug, name_fr, name_en").order("sort_order"),
      supabase.from("product_option_categories").select("product_id"),
    ]);
    if (e1) toast.error(e1.message);
    if (e2) toast.error(e2.message);
    if (e3) toast.error(e3.message);
    setProducts((p as unknown as Product[]) ?? []);
    setCategories((c as Category[]) ?? []);
    const counts: Record<string, number> = {};
    ((oc as { product_id: string }[]) ?? []).forEach((row) => {
      counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
    });
    setOptionCounts(counts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (p: Partial<Product> | null) => {
    setSlugManuallyEdited(!!p?.id);
    setEditing(p);
  };

  const onNameFrChange = (v: string) => {
    if (!editing) return;
    const next: Partial<Product> = { ...editing, name_fr: v };
    if (!slugManuallyEdited && !editing.id) {
      next.slug = slugify(v);
    }
    setEditing(next);
  };

  const onSlugChange = (v: string) => {
    if (!editing) return;
    setSlugManuallyEdited(true);
    setEditing({ ...editing, slug: slugify(v) });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name_fr || !editing.name_en || !editing.category_slug) {
      toast.error(t("prods.requiredFields"));
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
      configurator_options: (editing.configurator_options ?? {}) as never,
      image_url: editing.image_url || null,
      sort_order: Number(editing.sort_order) || 0,
      is_active: editing.is_active ?? true,
      stock_total: Math.max(0, Number(editing.stock_total ?? 1) || 0),
      quantity_discounts: (editing.quantity_discounts ?? DEFAULT_QUANTITY_DISCOUNTS) as never,
      duration_discounts: (editing.duration_discounts ?? []) as never,
    };
    const res = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing.id ? t("prods.updated") : t("prods.created"));
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm(t("prods.confirmDelete"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("prods.deleted"));
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

  const filtered = products.filter((p) => {
    const q = filter.toLowerCase();
    const matchQ =
      !q ||
      p.name_fr.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    const matchC = !categoryFilter || p.category_slug === categoryFilter;
    return matchQ && matchC;
  });

  const productName = (p: Product) => (lang === "en" ? p.name_en : p.name_fr);
  const categoryName = (c: Category) => (lang === "en" ? c.name_en : c.name_fr);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("prods.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} / {products.length} {t("prods.countOf")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder={t("prods.searchPlaceholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-56"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t("prods.allCategories")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {categoryName(c)}
              </option>
            ))}
          </select>
          <Button onClick={() => openEdit({ ...empty })}>
            <Plus className="size-4" /> {t("prods.new")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("prods.col.name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("prods.col.category")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("prods.col.priceDay")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("prods.col.deposit")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("common.active")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("layout.loading")}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t("prods.empty")}</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-2 flex-wrap">
                      <span>{productName(p)}</span>
                      {optionCounts[p.id] > 0 && (
                        <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
                          🎨 {optionCounts[p.id]} {optionCounts[p.id] > 1 ? t("prods.options") : t("prods.option")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category_slug}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(p.price_day)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatPrice(p.deposit)}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("prods.editTitle") : t("prods.newTitle")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <FieldInput label={t("prods.field.nameFr")} value={editing.name_fr || ""} onChange={onNameFrChange} />
              <FieldInput label={t("prods.field.nameEn")} value={editing.name_en || ""} onChange={(v) => setEditing({ ...editing, name_en: v })} />
              <FieldInput label={t("prods.field.slug")} value={editing.slug || ""} onChange={onSlugChange} />
              <FieldSelect
                label={t("prods.field.category")}
                value={editing.category_slug || ""}
                onChange={(v) => setEditing({ ...editing, category_slug: v })}
                options={categories.map((c) => ({ value: c.slug, label: categoryName(c) }))}
              />
              <div className="col-span-2">
                <Label>{t("prods.field.descFr")}</Label>
                <Textarea
                  value={editing.description_fr || ""}
                  onChange={(e) => setEditing({ ...editing, description_fr: e.target.value })}
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <div className="col-span-2">
                <Label>{t("prods.field.descEn")}</Label>
                <Textarea
                  value={editing.description_en || ""}
                  onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <FieldInput label={t("prods.field.dimensions")} value={editing.dimensions || ""} onChange={(v) => setEditing({ ...editing, dimensions: v })} />
              <FieldInput
                label={t("common.order")}
                type="number"
                value={String(editing.sort_order ?? 0)}
                onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })}
              />
              <div className="col-span-2">
                <Label>{t("prods.field.image")}</Label>
                <ImageUploader
                  value={editing.image_url || ""}
                  onChange={(url) => setEditing({ ...editing, image_url: url })}
                />
              </div>
              <FieldInput
                label={t("prods.field.priceDay")}
                type="number"
                value={String(editing.price_day ?? 0)}
                onChange={(v) => setEditing({ ...editing, price_day: Number(v) })}
              />
              <FieldInput
                label={t("prods.field.deposit")}
                type="number"
                value={String(editing.deposit ?? 0)}
                onChange={(v) => setEditing({ ...editing, deposit: Number(v) })}
              />
              <FieldInput
                label={t("prods.field.stock")}
                type="number"
                value={String(editing.stock_total ?? 1)}
                onChange={(v) => setEditing({ ...editing, stock_total: Math.max(0, Number(v) || 0) })}
              />
              <FieldInput
                label={t("prods.field.priceWeek")}
                type="number"
                value={String(editing.price_week ?? "")}
                onChange={(v) => setEditing({ ...editing, price_week: v ? Number(v) : null })}
              />
              <FieldInput
                label={t("prods.field.priceMonth")}
                type="number"
                value={String(editing.price_month ?? "")}
                onChange={(v) => setEditing({ ...editing, price_month: v ? Number(v) : null })}
              />
              <div className="col-span-2">
                <Label>{t("prods.field.cfgUrl")}</Label>
                <p className="text-xs text-muted-foreground mt-1">{t("prods.field.cfgUrlHint")}</p>
                <p className="text-[11px] text-destructive mt-1">{t("prods.field.cfgUrlWarn")}</p>
                <ConfiguratorUploader
                  value={editing.configurator_url || ""}
                  onChange={(url) => setEditing({ ...editing, configurator_url: url })}
                />
              </div>
              <div className="col-span-2">
                <Label>{t("prods.field.cfgOpts")}</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("prods.field.cfgOptsHint")}
                  <code className="block mt-1 text-[10px] bg-muted/60 p-1.5 rounded">{`{"plateau":[{"value":"blanc","label":"…","price":0}], "champs":[…], "sacs":[…]}`}</code>
                </p>
                <ConfiguratorOptionsEditor
                  value={editing.configurator_options}
                  onChange={(v) => setEditing({ ...editing, configurator_options: v })}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Label>{t("prods.field.activeLabel")}</Label>
              </div>

              <div className="col-span-2 mt-6 rounded-lg border-2 border-accent/40 bg-accent/5 p-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  {t("prods.discounts.title")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 mb-4">{t("prods.discounts.hint")}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <QuantityDiscountEditor
                    value={editing.quantity_discounts ?? DEFAULT_QUANTITY_DISCOUNTS}
                    onChange={(v) => setEditing({ ...editing, quantity_discounts: v })}
                  />
                  <DurationDiscountEditor
                    value={editing.duration_discounts ?? []}
                    onChange={(v) => setEditing({ ...editing, duration_discounts: v })}
                  />
                </div>
              </div>

              {editing.id ? (
                <div className="col-span-2 mt-6 rounded-lg border-2 border-gold/40 bg-gold/5 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        {t("prods.options.title")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("prods.options.hint")}</p>
                    </div>
                  </div>
                  <ProductOptionsManager productId={editing.id} />
                </div>
              ) : (
                <div className="col-span-2 mt-6 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
                  <h3 className="font-semibold text-sm">{t("prods.options.title")}</h3>
                  <p className="text-xs text-muted-foreground italic mt-1">{t("prods.options.saveFirst")}</p>
                </div>
              )}
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

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { t } = useAdminI18n();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("common.imageMustBe"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("common.imageTooLarge"));
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success(t("common.imageUploaded"));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="mt-1.5 space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={t("common.preview")}
            className="h-32 w-32 rounded-lg object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow"
            aria-label={t("common.remove")}
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
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
      <div className="flex items-center gap-2">
        <Input
          placeholder={t("common.orPasteUrl")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
}

function ConfiguratorUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { t } = useAdminI18n();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploadedFile = value.includes("/storage/v1/object/public/configurators/");

  const upload = async (file: File) => {
    const isHtml =
      file.type === "text/html" ||
      file.name.toLowerCase().endsWith(".html") ||
      file.name.toLowerCase().endsWith(".htm");
    if (!isHtml) {
      toast.error(t("prods.cfg.mustBeHtml"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("prods.cfg.tooLarge"));
      return;
    }
    setUploading(true);
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const { error } = await supabase.storage
      .from("configurators")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "text/html",
      });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("configurators").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success(t("prods.cfg.uploaded"));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div className="mt-1.5 space-y-2">
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground">
              {isUploadedFile ? t("prods.cfgUploaded") : t("prods.cfgExternal")}
            </div>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline truncate block"
            >
              {value}
            </a>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "…" : t("common.replace")}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onChange("")}
            aria-label={t("common.remove")}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {uploading ? t("common.uploading") : t("prods.cfg.dropHtml")}
          </p>
          <p className="text-xs text-muted-foreground">{t("prods.cfg.htmlHint")}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,text/html"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      <Input
        placeholder={t("prods.cfg.urlPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
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

function ConfiguratorOptionsEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const { t } = useAdminI18n();
  const initial = (() => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return "{}";
    }
  })();
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  // Re-sync if the parent swaps to another product
  useEffect(() => {
    setText(initial);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value ?? {})]);

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw.trim() === "") {
      setError(null);
      onChange({});
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("prods.cfgOpts.invalid"));
    }
  };

  const loadCornholePreset = () => {
    const preset = {
      plateau: [
        { value: "blanc", label: "Peinture blanche mate", price: 0 },
        { value: "couleur", label: "Peinture couleur au choix", price: 50 },
        { value: "placage", label: "Placage dibond/tôle/stratifié", price: 100 },
        { value: "adhesif", label: "Adhésif surface", price: 75 },
      ],
      champs: [
        { value: "blanc", label: "Peinture blanche mate", price: 0 },
        { value: "couleur", label: "Peinture couleur au choix", price: 25 },
        { value: "placage", label: "Placage dibond/tôle/stratifié", price: 50 },
      ],
      sacs: [
        { value: "standard", label: "Standard bleu+rouge ×6", price: 0 },
        { value: "couleur", label: "Tissu couleur au choix ×6", price: 100 },
      ],
    };
    handleChange(JSON.stringify(preset, null, 2));
  };

  return (
    <div className="mt-1.5 space-y-2">
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-xs"
        rows={10}
        placeholder='{"plateau":[{"value":"blanc","label":"…","price":0}]}'
      />
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px]">
          {error ? (
            <span className="text-destructive">⚠ {error}</span>
          ) : (
            <span className="text-muted-foreground">{t("prods.cfgOpts.valid")}</span>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={loadCornholePreset}>
          {t("prods.cfgOpts.preset")}
        </Button>
      </div>
    </div>
  );
}

function QuantityDiscountEditor({
  value,
  onChange,
}: {
  value: QuantityDiscountTier[];
  onChange: (v: QuantityDiscountTier[]) => void;
}) {
  const { t } = useAdminI18n();
  const sorted = [...(value ?? [])].sort((a, b) => a.min_qty - b.min_qty);
  const update = (i: number, patch: Partial<QuantityDiscountTier>) => {
    const next = sorted.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange(next);
  };
  const add = () => {
    const lastQty = sorted.length ? sorted[sorted.length - 1].min_qty + 1 : 2;
    onChange([...sorted, { min_qty: lastQty, rate: 0.1 }]);
  };
  const remove = (i: number) => onChange(sorted.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t("prods.qtyDiscounts")}</Label>
        <Button type="button" size="sm" variant="ghost" onClick={add} className="h-7 px-2">
          <Plus className="size-3.5" /> {t("common.tier")}
        </Button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic py-2">{t("prods.qtyDiscounts.empty")}</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">{t("prods.discounts.fromQty")}</span>
              <Input
                type="number"
                min={1}
                value={tier.min_qty}
                onChange={(e) => update(i, { min_qty: Math.max(1, Number(e.target.value) || 1) })}
                className="h-8 w-16 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">{t("prods.discounts.units")}</span>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round((tier.rate || 0) * 100)}
                onChange={(e) =>
                  update(i, {
                    rate: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100,
                  })
                }
                className="h-8 w-16 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">%</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                className="h-7 w-7 ml-auto"
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DurationDiscountEditor({
  value,
  onChange,
}: {
  value: DurationDiscountTier[];
  onChange: (v: DurationDiscountTier[]) => void;
}) {
  const { t } = useAdminI18n();
  const sorted = [...(value ?? [])].sort((a, b) => a.min_days - b.min_days);
  const update = (i: number, patch: Partial<DurationDiscountTier>) => {
    const next = sorted.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    onChange(next);
  };
  const add = () => {
    const lastDays = sorted.length ? sorted[sorted.length - 1].min_days + 1 : 3;
    onChange([...sorted, { min_days: lastDays, rate: 0.05 }]);
  };
  const remove = (i: number) => onChange(sorted.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t("prods.durationDiscounts")}</Label>
        <Button type="button" size="sm" variant="ghost" onClick={add} className="h-7 px-2">
          <Plus className="size-3.5" /> {t("common.tier")}
        </Button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic py-2">{t("prods.durationDiscounts.empty")}</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">{t("prods.discounts.fromQty")}</span>
              <Input
                type="number"
                min={1}
                value={tier.min_days}
                onChange={(e) => update(i, { min_days: Math.max(1, Number(e.target.value) || 1) })}
                className="h-8 w-16 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">{t("prods.discounts.days")}</span>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round((tier.rate || 0) * 100)}
                onChange={(e) =>
                  update(i, {
                    rate: Math.max(0, Math.min(100, Number(e.target.value) || 0)) / 100,
                  })
                }
                className="h-8 w-16 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">%</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(i)}
                className="h-7 w-7 ml-auto"
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
