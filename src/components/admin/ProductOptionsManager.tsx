import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/format";
import { useAdminI18n } from "@/lib/admin-i18n";

type OptionCategory = {
  id: string;
  product_id: string;
  name_fr: string;
  name_en: string;
  is_required: boolean;
  sort_order: number;
};

type ProductOption = {
  id: string;
  category_id: string;
  name_fr: string;
  name_en: string;
  price: number;
  sort_order: number;
  is_active: boolean;
};

export function ProductOptionsManager({ productId }: { productId: string }) {
  const { t, lang } = useAdminI18n();
  const displayName = (o: { name_fr: string; name_en: string }) => (lang === "en" ? o.name_en : o.name_fr);
  const altName = (o: { name_fr: string; name_en: string }) => (lang === "en" ? o.name_fr : o.name_en);

  const [categories, setCategories] = useState<OptionCategory[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catDraft, setCatDraft] = useState<Partial<OptionCategory>>({});
  const [editingOptId, setEditingOptId] = useState<string | null>(null);
  const [optDraft, setOptDraft] = useState<Partial<ProductOption>>({});
  const [addingOptionFor, setAddingOptionFor] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: cats, error: e1 } = await supabase
      .from("product_option_categories")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order");
    if (e1) toast.error(e1.message);
    const catList = (cats as OptionCategory[]) ?? [];
    setCategories(catList);

    if (catList.length > 0) {
      const { data: opts, error: e2 } = await supabase
        .from("product_options")
        .select("*")
        .in("category_id", catList.map((c) => c.id))
        .order("sort_order");
      if (e2) toast.error(e2.message);
      setOptions((opts as ProductOption[]) ?? []);
    } else {
      setOptions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [productId]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---------- Category CRUD ----------
  const startAddCategory = () => {
    setAddingCategory(true);
    setCatDraft({ name_fr: "", name_en: "", is_required: false });
  };

  const saveNewCategory = async () => {
    if (!catDraft.name_fr || !catDraft.name_en) {
      toast.error(t("pom.namesRequired"));
      return;
    }
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) + 1 : 0;
    const { error } = await supabase.from("product_option_categories").insert({
      product_id: productId,
      name_fr: catDraft.name_fr,
      name_en: catDraft.name_en,
      is_required: catDraft.is_required ?? false,
      sort_order: nextOrder,
    });
    if (error) return toast.error(error.message);
    toast.success(t("pom.cat.added"));
    setAddingCategory(false);
    setCatDraft({});
    load();
  };

  const startEditCategory = (cat: OptionCategory) => {
    setEditingCatId(cat.id);
    setCatDraft({ ...cat });
  };

  const saveEditCategory = async () => {
    if (!editingCatId) return;
    if (!catDraft.name_fr || !catDraft.name_en) {
      toast.error(t("pom.namesRequired"));
      return;
    }
    const { error } = await supabase
      .from("product_option_categories")
      .update({
        name_fr: catDraft.name_fr,
        name_en: catDraft.name_en,
        is_required: catDraft.is_required ?? false,
      })
      .eq("id", editingCatId);
    if (error) return toast.error(error.message);
    toast.success(t("pom.cat.updated"));
    setEditingCatId(null);
    setCatDraft({});
    load();
  };

  const removeCategory = async (id: string) => {
    if (!confirm(t("pom.cat.confirmDelete"))) return;
    const { error } = await supabase.from("product_option_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("pom.cat.deleted"));
    load();
  };

  const moveCategory = async (cat: OptionCategory, dir: -1 | 1) => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    const { error } = await supabase.from("product_option_categories").upsert([
      { ...cat, sort_order: other.sort_order },
      { ...other, sort_order: cat.sort_order },
    ]);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleRequired = async (cat: OptionCategory) => {
    const { error } = await supabase
      .from("product_option_categories")
      .update({ is_required: !cat.is_required })
      .eq("id", cat.id);
    if (error) return toast.error(error.message);
    setCategories((list) => list.map((c) => (c.id === cat.id ? { ...c, is_required: !cat.is_required } : c)));
  };

  // ---------- Option CRUD ----------
  const startAddOption = (categoryId: string) => {
    setAddingOptionFor(categoryId);
    setOptDraft({ name_fr: "", name_en: "", price: 0, is_active: true });
  };

  const saveNewOption = async () => {
    if (!addingOptionFor) return;
    if (!optDraft.name_fr || !optDraft.name_en) {
      toast.error(t("pom.namesRequired"));
      return;
    }
    const catOpts = options.filter((o) => o.category_id === addingOptionFor);
    const nextOrder = catOpts.length > 0 ? Math.max(...catOpts.map((o) => o.sort_order)) + 1 : 0;
    const { error } = await supabase.from("product_options").insert({
      category_id: addingOptionFor,
      name_fr: optDraft.name_fr,
      name_en: optDraft.name_en,
      price: Number(optDraft.price) || 0,
      sort_order: nextOrder,
      is_active: optDraft.is_active ?? true,
    });
    if (error) return toast.error(error.message);
    toast.success(t("pom.opt.added"));
    setAddingOptionFor(null);
    setOptDraft({});
    load();
  };

  const startEditOption = (opt: ProductOption) => {
    setEditingOptId(opt.id);
    setOptDraft({ ...opt });
  };

  const saveEditOption = async () => {
    if (!editingOptId) return;
    if (!optDraft.name_fr || !optDraft.name_en) {
      toast.error(t("pom.namesRequired"));
      return;
    }
    const { error } = await supabase
      .from("product_options")
      .update({
        name_fr: optDraft.name_fr,
        name_en: optDraft.name_en,
        price: Number(optDraft.price) || 0,
        is_active: optDraft.is_active ?? true,
      })
      .eq("id", editingOptId);
    if (error) return toast.error(error.message);
    toast.success(t("pom.opt.updated"));
    setEditingOptId(null);
    setOptDraft({});
    load();
  };

  const removeOption = async (id: string) => {
    if (!confirm(t("pom.opt.confirmDelete"))) return;
    const { error } = await supabase.from("product_options").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("pom.opt.deleted"));
    load();
  };

  const moveOption = async (opt: ProductOption, dir: -1 | 1) => {
    const sibs = options
      .filter((o) => o.category_id === opt.category_id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const idx = sibs.findIndex((o) => o.id === opt.id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sibs.length) return;
    const other = sibs[swapIdx];
    const { error } = await supabase.from("product_options").upsert([
      { ...opt, sort_order: other.sort_order },
      { ...other, sort_order: opt.sort_order },
    ]);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("pom.loading")}</p>;
  }

  return (
    <div className="space-y-3">
      {categories.length === 0 && !addingCategory && (
        <p className="text-sm text-muted-foreground italic">{t("pom.empty")}</p>
      )}

      {categories.map((cat) => {
        const catOptions = options
          .filter((o) => o.category_id === cat.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        const isOpen = openIds.has(cat.id);
        const isEditing = editingCatId === cat.id;

        return (
          <div key={cat.id} className="rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 p-3">
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveCategory(cat, -1)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={t("pom.up")}
                >
                  <ArrowUp className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(cat, 1)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={t("pom.down")}
                >
                  <ArrowDown className="size-3" />
                </button>
              </div>

              {isEditing ? (
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder={t("pom.nameFr")}
                    value={catDraft.name_fr || ""}
                    onChange={(e) => setCatDraft({ ...catDraft, name_fr: e.target.value })}
                  />
                  <Input
                    placeholder={t("pom.nameEn")}
                    value={catDraft.name_en || ""}
                    onChange={(e) => setCatDraft({ ...catDraft, name_en: e.target.value })}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleOpen(cat.id)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  <span className="font-medium">{displayName(cat)}</span>
                  <span className="text-xs text-muted-foreground">/ {altName(cat)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({catOptions.length} {t("pom.optionsCount")})
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={isEditing ? (catDraft.is_required ?? false) : cat.is_required}
                    onCheckedChange={(v) => {
                      if (isEditing) setCatDraft({ ...catDraft, is_required: v });
                      else toggleRequired(cat);
                    }}
                  />
                  <Label className="text-xs">{t("common.required")}</Label>
                </div>

                {isEditing ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={saveEditCategory}>
                      <Check className="size-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingCatId(null); setCatDraft({}); }}>
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => startEditCategory(cat)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeCategory(cat.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="border-t border-border p-3 space-y-2 bg-muted/20">
                {catOptions.length === 0 && addingOptionFor !== cat.id && (
                  <p className="text-xs text-muted-foreground italic">{t("pom.opt.empty")}</p>
                )}

                {catOptions.map((opt) => {
                  const isOptEditing = editingOptId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className="flex items-center gap-2 rounded-md bg-background p-2 border border-border"
                    >
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => moveOption(opt, -1)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={t("pom.up")}
                        >
                          <ArrowUp className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveOption(opt, 1)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={t("pom.down")}
                        >
                          <ArrowDown className="size-3" />
                        </button>
                      </div>

                      {isOptEditing ? (
                        <>
                          <Input
                            placeholder={t("pom.nameFr")}
                            value={optDraft.name_fr || ""}
                            onChange={(e) => setOptDraft({ ...optDraft, name_fr: e.target.value })}
                            className="flex-1"
                          />
                          <Input
                            placeholder={t("pom.nameEn")}
                            value={optDraft.name_en || ""}
                            onChange={(e) => setOptDraft({ ...optDraft, name_en: e.target.value })}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder={t("pom.price")}
                            value={String(optDraft.price ?? 0)}
                            onChange={(e) => setOptDraft({ ...optDraft, price: Number(e.target.value) })}
                            className="w-24"
                          />
                          <Switch
                            checked={optDraft.is_active ?? true}
                            onCheckedChange={(v) => setOptDraft({ ...optDraft, is_active: v })}
                          />
                          <Button size="icon" variant="ghost" onClick={saveEditOption}>
                            <Check className="size-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditingOptId(null); setOptDraft({}); }}>
                            <X className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${!opt.is_active ? "opacity-50 line-through" : ""}`}>
                              {displayName(opt)}
                            </div>
                            <div className="text-xs text-muted-foreground">{altName(opt)}</div>
                          </div>
                          <div className="text-sm font-medium tabular-nums">
                            {opt.price > 0 ? `+${formatPrice(opt.price)}` : t("pom.included")}
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => startEditOption(opt)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => removeOption(opt.id)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}

                {addingOptionFor === cat.id ? (
                  <div className="flex items-center gap-2 rounded-md bg-background p-2 border border-dashed border-primary">
                    <Input
                      placeholder={t("pom.nameFr")}
                      value={optDraft.name_fr || ""}
                      onChange={(e) => setOptDraft({ ...optDraft, name_fr: e.target.value })}
                      className="flex-1"
                      autoFocus
                    />
                    <Input
                      placeholder={t("pom.nameEn")}
                      value={optDraft.name_en || ""}
                      onChange={(e) => setOptDraft({ ...optDraft, name_en: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder={t("pom.price")}
                      value={String(optDraft.price ?? 0)}
                      onChange={(e) => setOptDraft({ ...optDraft, price: Number(e.target.value) })}
                      className="w-24"
                    />
                    <Button size="icon" variant="ghost" onClick={saveNewOption}>
                      <Check className="size-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setAddingOptionFor(null); setOptDraft({}); }}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startAddOption(cat.id)}>
                    <Plus className="size-3" /> {t("pom.addOption")}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {addingCategory ? (
        <div className="rounded-lg border-2 border-dashed border-primary p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder={t("pom.catFrPlaceholder")}
              value={catDraft.name_fr || ""}
              onChange={(e) => setCatDraft({ ...catDraft, name_fr: e.target.value })}
              autoFocus
            />
            <Input
              placeholder={t("pom.catEnPlaceholder")}
              value={catDraft.name_en || ""}
              onChange={(e) => setCatDraft({ ...catDraft, name_en: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={catDraft.is_required ?? false}
                onCheckedChange={(v) => setCatDraft({ ...catDraft, is_required: v })}
              />
              <Label className="text-sm">{t("pom.requiredSelection")}</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setAddingCategory(false); setCatDraft({}); }}>
                {t("common.cancel")}
              </Button>
              <Button size="sm" onClick={saveNewCategory}>
                {t("common.create")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={startAddCategory}>
          <Plus className="size-4" /> {t("pom.addCategory")}
        </Button>
      )}
    </div>
  );
}
