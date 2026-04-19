import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { formatPrice } from "@/lib/format";
import { useAdminI18n } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin/")({
  component: AdminQuotesPage,
});

type Quote = {
  id: string;
  customer_name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  event_date: string | null;
  event_location: string | null;
  items: any;
  subtotal_ht: number;
  total_ht: number;
  vat: number;
  total_ttc: number;
  total_deposit: number;
  status: string;
  created_at: string;
  delivery_fee: number;
  setup_fee: number;
  pickup_fee: number;
  logistics_notes: string | null;
};

const finalTotal = (q: Quote) =>
  Number(q.total_ttc) +
  Number(q.delivery_fee || 0) +
  Number(q.setup_fee || 0) +
  Number(q.pickup_fee || 0);

const STATUSES = ["pending", "contacted", "confirmed", "completed", "rejected"] as const;
const BLOCKING_STATUSES = new Set(["confirmed", "completed"]);
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-purple-100 text-purple-800 border-purple-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

function AdminQuotesPage() {
  const { t, lang } = useAdminI18n();
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const statusLabel = (s: string) => t(`quotes.status.${s}`);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [logistics, setLogistics] = useState({
    delivery_fee: 0,
    setup_fee: 0,
    pickup_fee: 0,
    logistics_notes: "",
  });
  const [savingLogistics, setSavingLogistics] = useState(false);

  const openDetail = (q: Quote) => {
    setSelected(q);
    setLogistics({
      delivery_fee: Number(q.delivery_fee || 0),
      setup_fee: Number(q.setup_fee || 0),
      pickup_fee: Number(q.pickup_fee || 0),
      logistics_notes: q.logistics_notes || "",
    });
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setQuotes((data as Quote[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("quotes.statusUpdated"));
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, status } : x)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const saveLogistics = async () => {
    if (!selected) return;
    setSavingLogistics(true);
    const payload = {
      delivery_fee: Number(logistics.delivery_fee) || 0,
      setup_fee: Number(logistics.setup_fee) || 0,
      pickup_fee: Number(logistics.pickup_fee) || 0,
      logistics_notes: logistics.logistics_notes || null,
    };
    const { error } = await supabase.from("quote_requests").update(payload).eq("id", selected.id);
    setSavingLogistics(false);
    if (error) return toast.error(error.message);
    toast.success(t("quotes.logistics.saved"));
    setQuotes((qs) => qs.map((x) => (x.id === selected.id ? { ...x, ...payload } : x)));
    setSelected({ ...selected, ...payload });
  };

  const remove = async (id: string) => {
    if (!confirm(t("quotes.confirmDelete"))) return;
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("quotes.deleted"));
    setQuotes((q) => q.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("quotes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {quotes.length} {t("quotes.count")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.date")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.client")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.email")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.event")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("quotes.col.totalTtc")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.status")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("layout.loading")}</td></tr>
            ) : quotes.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t("quotes.empty")}</td></tr>
            ) : (
              quotes.map((q) => (
                <tr key={q.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {q.customer_name}
                    {q.company && <span className="block text-xs text-muted-foreground">{q.company}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{q.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {q.event_date ? new Date(q.event_date).toLocaleDateString(dateLocale) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-semibold">{formatPrice(finalTotal(q))}</div>
                    {(q.delivery_fee || q.setup_fee || q.pickup_fee) ? (
                      <div className="text-xs text-muted-foreground">
                        {t("quotes.products")} {formatPrice(q.total_ttc)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`h-8 rounded-md border px-2 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                        STATUS_COLORS[q.status] || "border-input bg-transparent"
                      }`}
                      title={
                        BLOCKING_STATUSES.has(q.status)
                          ? t("quotes.blocking")
                          : t("quotes.notBlocking")
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                      ))}
                    </select>
                    {BLOCKING_STATUSES.has(q.status) && (
                      <div className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="inline-block size-1.5 rounded-full bg-green-500" />
                        {t("quotes.stockReserved")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openDetail(q)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(q.id)}>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{t("layout.quotes")} — {selected.customer_name}</DialogTitle>
                <DialogDescription>
                  {t("quotes.detail.received")} {new Date(selected.created_at).toLocaleString(dateLocale)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label={t("auth.email")} value={selected.email} />
                  <Field label={t("quotes.detail.phone")} value={selected.phone || "—"} />
                  <Field label={t("quotes.detail.company")} value={selected.company || "—"} />
                  <Field label={t("quotes.detail.eventDate")} value={selected.event_date ? new Date(selected.event_date).toLocaleDateString(dateLocale) : "—"} />
                  <Field label={t("quotes.detail.location")} value={selected.event_location || "—"} className="col-span-2" />
                </div>
                {selected.message && (
                  <div className="text-sm">
                    <p className="text-xs uppercase text-muted-foreground mb-1">{t("quotes.detail.message")}</p>
                    <p className="rounded-lg bg-muted/50 p-3 whitespace-pre-wrap">{selected.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">{t("quotes.detail.items")}</p>
                  <div className="rounded-lg border border-border divide-y divide-border">
                    {(selected.items as any[]).map((it, i) => (
                      <div key={i} className="px-3 py-2 flex justify-between text-sm">
                        <span>
                          {(lang === "en" ? it.name_en : it.name_fr) || it.name_fr || it.name_en || it.slug} × {it.quantity} ({it.days}{lang === "fr" ? "j" : "d"})
                        </span>
                        <span className="font-medium">{formatPrice(it.line_total ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t("quotes.logistics.title")}</p>
                    <Button size="sm" onClick={saveLogistics} disabled={savingLogistics}>
                      <Save className="size-3.5" /> {savingLogistics ? "…" : t("common.save")}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">{t("quotes.logistics.delivery")}</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        value={String(logistics.delivery_fee)}
                        onChange={(e) => setLogistics({ ...logistics, delivery_fee: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t("quotes.logistics.setup")}</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        value={String(logistics.setup_fee)}
                        onChange={(e) => setLogistics({ ...logistics, setup_fee: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t("quotes.logistics.pickup")}</Label>
                      <Input
                        type="number"
                        className="mt-1"
                        value={String(logistics.pickup_fee)}
                        onChange={(e) => setLogistics({ ...logistics, pickup_fee: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t("quotes.logistics.notes")}</Label>
                    <Textarea
                      rows={2}
                      className="mt-1"
                      value={logistics.logistics_notes}
                      onChange={(e) => setLogistics({ ...logistics, logistics_notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 space-y-1 text-sm">
                  <Row label={t("quotes.totals.subHt")} value={formatPrice(selected.subtotal_ht)} />
                  <Row label={t("quotes.totals.ht")} value={formatPrice(selected.total_ht)} />
                  <Row label={t("quotes.totals.vat")} value={formatPrice(selected.vat)} />
                  <Row label={t("quotes.totals.productsTtc")} value={formatPrice(selected.total_ttc)} />
                  {Number(selected.delivery_fee) > 0 && (
                    <Row label={t("quotes.totals.delivery")} value={formatPrice(selected.delivery_fee)} />
                  )}
                  {Number(selected.setup_fee) > 0 && (
                    <Row label={t("quotes.totals.setup")} value={formatPrice(selected.setup_fee)} />
                  )}
                  {Number(selected.pickup_fee) > 0 && (
                    <Row label={t("quotes.totals.pickup")} value={formatPrice(selected.pickup_fee)} />
                  )}
                  <Row label={t("quotes.totals.finalTtc")} value={formatPrice(finalTotal(selected))} bold />
                  <Row label={t("quotes.totals.deposit")} value={formatPrice(selected.total_deposit)} />
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-2">{t("quotes.col.status")}</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
                          selected.status === s
                            ? STATUS_COLORS[s] || "bg-foreground text-background border-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{t("quotes.statusNote")}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
