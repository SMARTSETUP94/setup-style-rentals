import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X, Save, Mail, Phone, Building2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdminI18n } from "@/lib/admin-i18n";
import { ScrollableTable } from "@/components/admin/ScrollableTable";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/clients")({
  component: AdminClientsPage,
});

type Client = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

type QuoteRow = {
  id: string;
  email: string;
  customer_name: string;
  company: string | null;
  phone: string | null;
  status: string;
  event_date: string | null;
  total_ttc: number;
  delivery_fee: number;
  setup_fee: number;
  pickup_fee: number;
  created_at: string;
};

type ClientStats = {
  count: number;
  revenue: number;
  lastContact: string | null;
};

function AdminClientsPage() {
  const { t, lang } = useAdminI18n();
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: c, error: ec }, { data: q, error: eq }] = await Promise.all([
      supabase.from("clients").select("*").order("updated_at", { ascending: false }),
      supabase
        .from("quote_requests")
        .select(
          "id,email,customer_name,company,phone,status,event_date,total_ttc,delivery_fee,setup_fee,pickup_fee,created_at",
        )
        .order("created_at", { ascending: false }),
    ]);
    if (ec) toast.error(ec.message);
    if (eq) toast.error(eq.message);
    setClients((c as Client[]) || []);
    setQuotes((q as QuoteRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const statsByEmail = useMemo(() => {
    const map = new Map<string, ClientStats>();
    for (const q of quotes) {
      const k = (q.email || "").toLowerCase().trim();
      if (!k) continue;
      const cur = map.get(k) || { count: 0, revenue: 0, lastContact: null };
      cur.count += 1;
      cur.revenue +=
        Number(q.total_ttc || 0) +
        Number(q.delivery_fee || 0) +
        Number(q.setup_fee || 0) +
        Number(q.pickup_fee || 0);
      if (!cur.lastContact || q.created_at > cur.lastContact) cur.lastContact = q.created_at;
      map.set(k, cur);
    }
    return map;
  }, [quotes]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter((c) => {
      const hay = [
        c.name,
        c.email,
        c.company,
        c.phone,
        ...(c.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [clients, search]);

  const openClient = (c: Client) => {
    setSelected(c);
    setEditNotes(c.notes || "");
    setEditTags(c.tags || []);
    setTagInput("");
  };

  const closeClient = () => setSelected(null);

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (editTags.includes(v)) {
      setTagInput("");
      return;
    }
    setEditTags([...editTags, v]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setEditTags(editTags.filter((t) => t !== tag));

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({ notes: editNotes || null, tags: editTags })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast.error(t("clients.saveError"));
      return;
    }
    toast.success(t("clients.saved"));
    setClients((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, notes: editNotes || null, tags: editTags } : c)),
    );
    setSelected({ ...selected, notes: editNotes || null, tags: editTags });
  };

  const selectedHistory = useMemo(() => {
    if (!selected) return [];
    const k = selected.email.toLowerCase();
    return quotes.filter((q) => (q.email || "").toLowerCase().trim() === k);
  }, [selected, quotes]);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{t("clients.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("clients.sub")}</p>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("clients.search")}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">{t("layout.loading")}</div>
      ) : clients.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center border border-dashed rounded-xl">
          {t("clients.empty")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground py-12 text-center border border-dashed rounded-xl">
          {t("clients.noResults")}
        </div>
      ) : (
        <ScrollableTable minWidth={900}>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-medium">{t("clients.col.name")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("clients.col.email")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("clients.col.company")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("clients.col.tags")}</th>
                <th className="text-right px-3 py-2 font-medium">{t("clients.col.quotes")}</th>
                <th className="text-right px-3 py-2 font-medium">{t("clients.col.revenue")}</th>
                <th className="text-left px-3 py-2 font-medium">{t("clients.col.last")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = statsByEmail.get(c.email) || { count: 0, revenue: 0, lastContact: null };
                return (
                  <tr
                    key={c.id}
                    onClick={() => openClient(c)}
                    className="border-t border-border cursor-pointer hover:bg-muted/30"
                  >
                    <td className="px-3 py-2 font-medium">{c.name || "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.email}</td>
                    <td className="px-3 py-2 text-muted-foreground">{c.company || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 border border-border"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.count}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatPrice(s.revenue)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{fmtDate(s.lastContact)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollableTable>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && closeClient()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name || selected.email}</DialogTitle>
                <DialogDescription>{t("clients.fiche")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <a href={`mailto:${selected.email}`} className="hover:underline truncate">
                      {selected.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    {selected.phone ? (
                      <a href={`tel:${selected.phone}`} className="hover:underline">
                        {selected.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span>{selected.company || "—"}</span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 mb-2">
                    <Tag className="size-3.5" /> {t("clients.tagsLabel")}
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-foreground/5 border border-border"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                          aria-label="remove"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder={t("clients.addTag")}
                      className="max-w-xs"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addTag}>
                      +
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">{t("clients.notes")}</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={t("clients.notesPh")}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={save} disabled={saving}>
                    <Save className="size-4" />
                    {saving ? t("common.saving") : t("common.save")}
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    {t("clients.history")}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({selectedHistory.length} {t("clients.totalQuotes")})
                    </span>
                  </h3>
                  {selectedHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("clients.noHistory")}</p>
                  ) : (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/40 text-muted-foreground">
                          <tr>
                            <th className="text-left px-2 py-1.5 font-medium">Date</th>
                            <th className="text-left px-2 py-1.5 font-medium">Statut</th>
                            <th className="text-left px-2 py-1.5 font-medium">Événement</th>
                            <th className="text-right px-2 py-1.5 font-medium">Total TTC</th>
                            <th className="px-2 py-1.5"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedHistory.map((q) => {
                            const total =
                              Number(q.total_ttc || 0) +
                              Number(q.delivery_fee || 0) +
                              Number(q.setup_fee || 0) +
                              Number(q.pickup_fee || 0);
                            return (
                              <tr key={q.id} className="border-t border-border">
                                <td className="px-2 py-1.5">{fmtDate(q.created_at)}</td>
                                <td className="px-2 py-1.5">{q.status}</td>
                                <td className="px-2 py-1.5">{fmtDate(q.event_date)}</td>
                                <td className="px-2 py-1.5 text-right tabular-nums">
                                  {formatPrice(total)}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <Link
                                    to="/admin/devis"
                                    className="text-xs underline text-muted-foreground hover:text-foreground"
                                    onClick={closeClient}
                                  >
                                    {t("clients.openQuote")}
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}