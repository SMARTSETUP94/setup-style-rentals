import { SITE_URL } from "@/lib/seo";
import { configLink } from "@/lib/sur-mesure";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChiffragePanel } from "@/components/admin/ChiffragePanel";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Eye, Save, Copy, ExternalLink, Download } from "lucide-react";
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
import { ScrollableTable } from "@/components/admin/ScrollableTable";

export const Route = createFileRoute("/admin/devis")({
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
  delivery_time: string | null;
  pickup_time: string | null;
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
  request_no: number | null;
  email_admin_status: string | null;
  email_client_status: string | null;
  source: string | null;
  has_custom: boolean | null;
  custom_delivery_date: string | null;
  custom_after_event: string | null;
  wants_samples: boolean | null;
};

type CustomConfigRow = {
  id: string;
  line_id: string | null;
  ref: string;
  piece: string;
  config: unknown;
  quantity: number;
  weight_kg: number | null;
  alerts: unknown;
  recap: string | null;
  preview_path: string | null;
  previewUrl?: string | null;
  estimate_unit_ht: number | null;
  estimate_total_ht: number | null;
  estimate_at: string | null;
  estimate_by: string | null;
  estimate_note: string | null;
  estimate_options: unknown;
};

type QuoteKind = "rental" | "custom" | "mixed";
const quoteKind = (q: Quote): QuoteKind => {
  const lines = Array.isArray(q.items) ? (q.items as any[]) : [];
  const custom = lines.some((l) => l?.kind === "custom");
  const rental = lines.some((l) => l?.kind !== "custom");
  return custom && rental ? "mixed" : custom ? "custom" : "rental";
};
const KIND_COLORS: Record<QuoteKind, string> = {
  rental: "bg-muted text-muted-foreground border-border",
  custom: "bg-gold/15 text-foreground border-gold/40",
  mixed: "bg-accent/10 text-accent border-accent/30",
};

const quoteNumber = (q: Pick<Quote, "request_no">) =>
  q.request_no != null ? `W-${String(q.request_no).padStart(5, "0")}` : "—";
const isFailed = (s: string | null | undefined) => typeof s === "string" && s.startsWith("failed");
const hasEmailFailure = (q: Quote) => isFailed(q.email_admin_status) || isFailed(q.email_client_status);

// total_ttc already includes delivery/setup/pickup fees.
const finalTotal = (q: Quote) => Number(q.total_ttc) || 0;
const feesOf = (q: Pick<Quote, "delivery_fee" | "setup_fee" | "pickup_fee">) =>
  Number(q.delivery_fee || 0) + Number(q.setup_fee || 0) + Number(q.pickup_fee || 0);
const productsNetHt = (q: Quote) => Number(q.total_ht || 0) - feesOf(q);
const round2 = (n: number) => Math.round(n * 100) / 100;

const STORAGE_PUBLIC_PREFIX = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/storage/v1/object/public/`;
const isTrustedStorageUrl = (url: unknown): url is string =>
  typeof url === "string" && !!import.meta.env.VITE_SUPABASE_URL && url.startsWith(STORAGE_PUBLIC_PREFIX);

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [customRows, setCustomRows] = useState<CustomConfigRow[]>([]);
  const [estimateByQuote, setEstimateByQuote] = useState<Record<string, number>>({});
  const visible = quotes.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (kindFilter !== "all" && quoteKind(q) !== kindFilter) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [q.customer_name, q.company, q.email, quoteNumber(q), q.request_no != null ? String(q.request_no) : ""]
      .some((v) => (v ?? "").toLowerCase().includes(needle));
  });

  const exportCsv = () => {
    const esc = (v: unknown) => {
      const str = v == null ? "" : String(v);
      return /[",;\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const kindLabel = { rental: "location", custom: "sur mesure", mixed: "mixte" } as Record<string, string>;
    const headers = ["numero", "date", "client", "societe", "email", "telephone", "type", "statut", "total_ht", "total_ttc", "date_evenement", "source"];
    const rows = visible.map((q) =>
      [quoteNumber(q), q.created_at.slice(0, 10), q.customer_name, q.company, q.email, q.phone, kindLabel[quoteKind(q)] ?? quoteKind(q), q.status,
        Number(q.total_ht ?? 0).toFixed(2), Number(q.total_ttc ?? 0).toFixed(2), q.event_date, q.source].map(esc).join(","),
    );
    const blob = new Blob(["\uFEFF" + [headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDetail = (q: Quote) => {
    setSelected(q);
    setCustomRows([]);
    if (quoteKind(q) !== "rental") {
      void (async () => {
        const { data, error } = await supabase
          .from("custom_configs")
          .select("id,line_id,ref,piece,config,quantity,weight_kg,alerts,recap,preview_path,estimate_unit_ht,estimate_total_ht,estimate_at,estimate_by,estimate_note,estimate_options")
          .eq("quote_id", q.id)
          .order("created_at");
        if (error) return toast.error(error.message);
        const rows: CustomConfigRow[] = await Promise.all(
          ((data ?? []) as CustomConfigRow[]).map(async (r) => {
            if (!r.preview_path) return r;
            const { data: signed } = await supabase.storage.from("custom-previews").createSignedUrl(r.preview_path, 600);
            return { ...r, previewUrl: signed?.signedUrl ?? null };
          }),
        );
        setCustomRows(rows);
      })();
    }
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
    const { data: est } = await supabase.from("custom_configs").select("quote_id,estimate_total_ht").not("estimate_total_ht", "is", null);
    const sums: Record<string, number> = {};
    for (const r of est ?? []) if (r.quote_id) sums[r.quote_id] = (sums[r.quote_id] ?? 0) + Number(r.estimate_total_ht || 0);
    setEstimateByQuote(sums);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    if (status === "confirmed") {
      const q = quotes.find((x) => x.id === id);
      const lines = Array.isArray(q?.items) ? (q!.items as any[]) : [];
      for (const it of lines) {
        if (!it?.productId || !it?.startDate || !it?.endDate) continue;
        const { data, error } = await supabase.rpc("get_available_stock", {
          _product_id: it.productId,
          _start_date: it.startDate,
          _end_date: it.endDate,
        });
        if (error || data == null) continue;
        const avail = Number(data);
        const req = Number(it.quantity) || 0;
        if (Number.isFinite(avail) && req > avail) {
          const name = (lang === "en" ? it.name_en : it.name_fr) || it.name_fr || it.slug || "";
          const msg = t("quotes.stockConfirm")
            .replace("{name}", String(name))
            .replace("{req}", String(req))
            .replace("{avail}", String(avail));
          if (!confirm(msg)) return;
        }
      }
    }
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("quotes.statusUpdated"));
    setQuotes((q) => q.map((x) => (x.id === id ? { ...x, status } : x)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const saveLogistics = async () => {
    if (!selected) return;
    const d = Number(logistics.delivery_fee);
    const s = Number(logistics.setup_fee);
    const p = Number(logistics.pickup_fee);
    if (![d, s, p].every((n) => Number.isFinite(n) && n >= 0)) {
      toast.error(t("quotes.logistics.invalid"));
      return;
    }
    setSavingLogistics(true);
    const netHt = productsNetHt(selected);
    const total_ht = round2(netHt + d + s + p);
    const vat = round2(total_ht * 0.2);
    const total_ttc = round2(total_ht + vat);
    const payload = {
      delivery_fee: d,
      setup_fee: s,
      pickup_fee: p,
      logistics_notes: logistics.logistics_notes || null,
      total_ht,
      vat,
      total_ttc,
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
            {visible.length} / {quotes.length} {t("quotes.count")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          aria-label={t("quotes.search")}
          placeholder={t("quotes.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="button" variant="outline" onClick={exportCsv} disabled={visible.length === 0}>
          <Download className="size-4" /> {t("quotes.exportCsv")}
        </Button>
        <select
          aria-label={t("quotes.col.status")}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">{t("quotes.filter.all")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select
          aria-label={t("quotes.filter.allKinds")}
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">{t("quotes.filter.allKinds")}</option>
          {(["rental", "custom", "mixed"] as const).map((k) => (
            <option key={k} value={k}>{t(`quotes.kind.${k}`)}</option>
          ))}
        </select>
      </div>

      <ScrollableTable minWidth={1000}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.number")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.date")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.client")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.email")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.event")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("quotes.col.totalTtc")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.emails")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("quotes.col.status")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">{t("layout.loading")}</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">{t("quotes.empty")}</td></tr>
            ) : (
              visible.map((q) => (
                <tr key={q.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {quoteNumber(q)}
                    {q.source && <span className="block text-[10px] text-muted-foreground">{q.source}</span>}
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-sans font-medium ${KIND_COLORS[quoteKind(q)]}`}>
                      {t(`quotes.kind.${quoteKind(q)}`)}
                    </span>
                  </td>
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
                    {estimateByQuote[q.id] != null && (
                      <div className="text-[11px] text-muted-foreground whitespace-nowrap" title="Estimation sur-mesure (interne)">
                        Estimation sur-mesure : {formatPrice(estimateByQuote[q.id]!)} HT · interne
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <EmailStatusBadge q={q} title={t("quotes.emails.failed")} />
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
                      <Button size="icon" variant="ghost" onClick={() => openDetail(q)} aria-label={`Voir la demande ${quoteNumber(q)}`}>
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
      </ScrollableTable>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl w-[calc(100vw-1rem)] sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 [&>*]:min-w-0">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{t("layout.quotes")} {quoteNumber(selected)} — {selected.customer_name}</DialogTitle>
                <DialogDescription>
                  {t("quotes.detail.received")} {new Date(selected.created_at).toLocaleString(dateLocale)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm [&>*]:min-w-0 [&>*]:break-words">
                  <Field label={t("auth.email")} value={selected.email} />
                  <Field label={t("quotes.detail.phone")} value={selected.phone || "—"} />
                  <Field label={t("quotes.detail.company")} value={selected.company || "—"} />
                  <Field label={t("quotes.detail.eventDate")} value={selected.event_date ? new Date(selected.event_date).toLocaleDateString(dateLocale) : "—"} />
                  <Field label={t("quotes.detail.location")} value={selected.event_location || "—"} />
                  <Field label={t("quotes.slot.delivery")} value={selected.delivery_time ? selected.delivery_time.slice(0, 5) : "—"} />
                  <Field label={t("quotes.slot.pickup")} value={selected.pickup_time ? selected.pickup_time.slice(0, 5) : "—"} />
                  <Field label={t("quotes.col.number")} value={quoteNumber(selected)} />
                  <Field label={t("quotes.detail.source")} value={selected.source || "—"} />
                  <Field label={t("quotes.emails.admin")} value={selected.email_admin_status || "—"} className={isFailed(selected.email_admin_status) ? "text-destructive" : ""} />
                  <Field label={t("quotes.emails.client")} value={selected.email_client_status || "—"} className={isFailed(selected.email_client_status) ? "text-destructive" : ""} />
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
                    {(Array.isArray(selected.items) ? (selected.items as any[]) : []).filter((it) => it?.kind !== "custom").map((it, i) => {
                      const opts: any[] = Array.isArray(it.options) ? it.options : Array.isArray(it.selected_options) ? it.selected_options : [];
                      return (
                      <div key={it.line_id ?? i} className="px-3 py-2 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>
                            {(lang === "en" ? it.name_en : it.name_fr) || it.name_fr || it.name_en || it.slug} × {it.quantity} ({it.days}{lang === "fr" ? "j" : "d"})
                          </span>
                          <span className="font-medium">{formatPrice(it.line_total ?? it.line_net ?? 0)}</span>
                        </div>
                        {it.startDate && it.endDate && (
                          <div className="text-xs text-muted-foreground">
                            {t("quotes.item.dates")} : {new Date(it.startDate).toLocaleDateString(dateLocale)} → {new Date(it.endDate).toLocaleDateString(dateLocale)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                          {it.price_day != null && <span>{t("quotes.item.perDay")} : {formatPrice(Number(it.price_day))}</span>}
                          {Number(it.line_discount) > 0 && <span>{t("quotes.item.lineDiscount")} : −{formatPrice(Number(it.line_discount))}</span>}
                          {it.line_net != null && <span>{t("quotes.item.net")} : {formatPrice(Number(it.line_net))}</span>}
                        </div>
                        {opts.length > 0 && (
                          <div className="text-xs">
                            <div className="text-muted-foreground">{t("quotes.item.options")} :</div>
                            <ul className="pl-3 list-disc">
                              {opts.map((o, j) => (
                                <li key={j}>
                                  {String((lang === "en" ? o.categoryName_en : o.categoryName_fr) ?? o.categoryName_fr ?? "")}
                                  {" — "}
                                  {String((lang === "en" ? o.name_en : o.name_fr) ?? o.name_fr ?? "")}
                                  {" : "}
                                  {formatPrice(Number(o.price) || 0)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {typeof it.configurator_recap === "string" && it.configurator_recap.trim() ? (
                          <div className="text-xs">
                            <div className="text-muted-foreground">{t("quotes.item.config")} :</div>
                            <pre className="whitespace-pre-wrap break-words font-sans bg-muted/40 rounded p-2">{it.configurator_recap}</pre>
                          </div>
                        ) : it.configurator_recap_html ? (
                          <div className="text-xs text-muted-foreground">{t("quotes.item.configHtmlOnly")}</div>
                        ) : null}
                        {it.logo_url && (isTrustedStorageUrl(it.logo_url) ? (
                          <a
                            href={it.logo_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            📎 {String(it.logo_filename || t("quotes.item.logo"))}
                          </a>
                        ) : (
                          <div className="text-[11px] text-muted-foreground break-all">
                            📎 {String(it.logo_url)} ({t("quotes.item.externalLink")})
                          </div>
                        ))}
                      </div>
                      );
                    })}
                  </div>
                </div>
                {quoteKind(selected) !== "rental" && (
                  <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-3">
                    <p className="text-sm font-semibold">{t("quotes.custom.title")}</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <Field label={t("quotes.custom.deliveryDate")} value={selected.custom_delivery_date ? new Date(selected.custom_delivery_date).toLocaleDateString(dateLocale) : "—"} />
                      <Field label={t("quotes.custom.afterEvent")} value={selected.custom_after_event ? t(`quotes.custom.after.${selected.custom_after_event}`) : "—"} />
                      <Field label={t("quotes.custom.samples")} value={selected.wants_samples ? t("common.yes") : t("common.no")} />
                    </div>
                    {(() => {
                      const lines = (Array.isArray(selected.items) ? (selected.items as any[]) : []).filter((it) => it?.kind === "custom");
                      return lines.map((it, i) => {
                        const row = customRows.find((r) => r.id === it.custom_config_id || (r.line_id && r.line_id === it.line_id));
                        const alerts: string[] = Array.isArray(row?.alerts) ? (row!.alerts as string[]) : Array.isArray(it.custom_alerts) ? it.custom_alerts : [];
                        const recap: string = row?.recap ?? it.configurator_recap ?? "";
                        return (
                          <div key={it.line_id ?? i} className="rounded-md border border-border bg-background p-3 text-sm flex gap-3">
                            {row?.previewUrl ? (
                              <img src={row.previewUrl} alt={String(it.name_fr ?? "")} className="size-24 rounded object-cover shrink-0 border border-border" />
                            ) : null}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="font-medium">{String((lang === "en" ? it.name_en : it.name_fr) ?? it.slug)}</div>
                              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                                <span>{t("quotes.custom.ref")} : <span className="font-mono">{String(it.custom_ref ?? row?.ref ?? "—")}</span></span>
                                <span>{t("quotes.custom.qty")} : {it.quantity}</span>
                                <span>{t("quotes.custom.weight")} : {it.custom_weight_kg != null ? `${it.custom_weight_kg} kg` : "—"}</span>
                              </div>
                              {recap && <pre className="whitespace-pre-wrap break-words font-sans text-xs bg-muted/40 rounded p-2">{recap}</pre>}
                              {alerts.length > 0 && (
                                <div className="text-xs">
                                  <div className="text-muted-foreground">{t("quotes.custom.alerts")} :</div>
                                  <ul className="pl-4 list-disc">{alerts.map((a, j) => <li key={j}>{String(a)}</li>)}</ul>
                                </div>
                              )}
                              {(() => {
                                const url = (typeof it.resume_url === "string" && it.resume_url.startsWith(SITE_URL) ? it.resume_url : null)
                                  ?? (row ? configLink(row.piece, row.config as Record<string, unknown>, SITE_URL) : null);
                                return url ? (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="size-3.5" /> {lang === "fr" ? "Ouvrir la configuration" : "Open configuration"}
                                    </a>
                                  </Button>
                                ) : null;
                              })()}
                              {row && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(JSON.stringify(row.config, null, 2));
                                      toast.success(t("quotes.custom.copied"));
                                    } catch (e) {
                                      toast.error(String(e));
                                    }
                                  }}
                                >
                                  <Copy className="size-3.5" /> {t("quotes.custom.copy")}
                                </Button>
                              )}
                              {row && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to="/admin/chiffrage" search={{ config_id: row.id }}>
                                    {lang === "fr" ? "Ouvrir dans le chiffrage" : "Open in pricing"}
                                  </Link>
                                </Button>
                              )}
                              {row && (
                                <div className="pt-2">
                                  <ChiffragePanel
                                    key={row.id}
                                    configId={row.id}
                                    saveId={row.id}
                                    initialQty={Number(it.quantity) || row.quantity || 1}
                                    saved={row}
                                    onSaved={() => { openDetail(selected); void load(); }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
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
                  <Row label={t("quotes.totals.productsSubHt")} value={formatPrice(selected.subtotal_ht)} />
                  {(() => {
                    const disc = round2(Number(selected.subtotal_ht || 0) - productsNetHt(selected));
                    return disc > 0 ? <Row label={t("quotes.totals.discount")} value={`−${formatPrice(disc)}`} /> : null;
                  })()}
                  {Number(selected.delivery_fee) > 0 && (
                    <Row label={t("quotes.totals.delivery")} value={formatPrice(selected.delivery_fee)} />
                  )}
                  {Number(selected.setup_fee) > 0 && (
                    <Row label={t("quotes.totals.setup")} value={formatPrice(selected.setup_fee)} />
                  )}
                  {Number(selected.pickup_fee) > 0 && (
                    <Row label={t("quotes.totals.pickup")} value={formatPrice(selected.pickup_fee)} />
                  )}
                  <Row label={t("quotes.totals.ht")} value={formatPrice(selected.total_ht)} />
                  <Row label={t("quotes.totals.vat")} value={formatPrice(selected.vat)} />
                  <Row label={t("quotes.totals.ttc")} value={formatPrice(finalTotal(selected))} bold />
                  <Row label={`${t("quotes.totals.deposit")} (${t("quotes.totals.depositNote")})`} value={formatPrice(selected.total_deposit)} />
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

function EmailStatusBadge({ q, title }: { q: Quote; title: string }) {
  const failed = hasEmailFailure(q);
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" title={failed ? title : undefined}>
      <span className={`inline-block size-2 rounded-full ${failed ? "bg-destructive" : "bg-muted-foreground/40"}`} />
      <span>A: {q.email_admin_status || "—"}</span>
      <span>C: {q.email_client_status || "—"}</span>
    </div>
  );
}
