import { dashboardAmount } from "@/lib/admin-display";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, TrendingUp, TrendingDown, Package, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useAdminI18n } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

type Quote = {
  id: string;
  customer_name: string;
  status: string;
  total_ttc: number;
  delivery_fee: number;
  setup_fee: number;
  pickup_fee: number;
  created_at: string;
  items: any;
  has_custom: boolean | null;
};

// total_ttc already includes delivery/setup/pickup fees.
const finalTotal = (q: Quote) => Number(q.total_ttc) || 0;

const PIPELINE_STATUSES = new Set(["pending", "contacted", "confirmed", "completed"]);
const ENGAGED_STATUSES = new Set(["confirmed", "completed"]);

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function AdminDashboardPage() {
  const { t, lang } = useAdminI18n();
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [estimates, setEstimates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quote_requests")
        .select("id, customer_name, status, total_ttc, delivery_fee, setup_fee, pickup_fee, created_at, items, has_custom")
        .order("created_at", { ascending: false });
      if (!error) setQuotes((data as Quote[]) ?? []);
      const { data: rows } = await supabase.from("custom_configs").select("quote_id,estimate_total_ht").not("estimate_total_ht", "is", null);
      const sums: Record<string, number> = {};
      for (const row of rows ?? []) if (row.quote_id) sums[row.quote_id] = (sums[row.quote_id] ?? 0) + Number(row.estimate_total_ht);
      setEstimates(sums);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const curStart = startOfMonth(now);
    const curEnd = endOfMonth(now);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const prevStart = startOfMonth(prev);
    const prevEnd = endOfMonth(prev);

    const inRange = (d: Date, s: Date, e: Date) => d >= s && d <= e;

    let curCount = 0, prevCount = 0;
    let curPipeline = 0, prevPipeline = 0;
    let curEngaged = 0, prevEngaged = 0;
    let curPricedSum = 0, curPricedCount = 0, prevPricedSum = 0, prevPricedCount = 0;
    let curCustom = 0;
    const productCounts = new Map<string, { name: string; qty: number }>();

    for (const q of quotes) {
      const created = new Date(q.created_at);
      const total = dashboardAmount(q.items, q.total_ttc, estimates[q.id]);
      const inCur = inRange(created, curStart, curEnd);
      const inPrev = inRange(created, prevStart, prevEnd);
      if (inCur) {
        curCount++;
        if (total != null && total > 0) { curPricedSum += total; curPricedCount++; }
        if (q.has_custom) curCustom++;
        if (PIPELINE_STATUSES.has(q.status)) curPipeline += total ?? 0;
        if (ENGAGED_STATUSES.has(q.status)) curEngaged += total ?? 0;
        const items = Array.isArray(q.items) ? q.items : [];
        for (const it of items) {
          const slug = String(it.slug || "");
          if (!slug) continue;
          const name = (lang === "en" ? it.name_en : it.name_fr) || it.name_fr || it.name_en || slug;
          const qty = Number(it.quantity) || 0;
          const prevEntry = productCounts.get(slug);
          if (prevEntry) prevEntry.qty += qty;
          else productCounts.set(slug, { name, qty });
        }
      }
      if (inPrev) {
        prevCount++;
        if (total != null && total > 0) { prevPricedSum += total; prevPricedCount++; }
        if (PIPELINE_STATUSES.has(q.status)) prevPipeline += total ?? 0;
        if (ENGAGED_STATUSES.has(q.status)) prevEngaged += total ?? 0;
      }
    }

    const topProducts = Array.from(productCounts.entries())
      .map(([slug, v]) => ({ slug, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      curCount, prevCount,
      curPipeline, prevPipeline,
      curEngaged, prevEngaged,
      topProducts,
      curAvg: curPricedCount ? curPricedSum / curPricedCount : 0,
      prevAvg: prevPricedCount ? prevPricedSum / prevPricedCount : 0,
      curCustom,
    };
  }, [quotes, lang, estimates]);

  const monthLabel = new Date().toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">{t("layout.loading")}</div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dash.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{monthLabel}</p>
      </div>

      <ConversionBlock />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="size-5" />}
          label={t("dash.quotesMonth")}
          value={String(stats.curCount)}
          previousLabel={t("dash.vsLastMonth")}
          change={pctChange(stats.curCount, stats.prevCount)}
          previousValue={String(stats.prevCount)}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label={t("dash.pipeline")}
          value={formatPrice(stats.curPipeline)}
          subLabel={t("dash.pipelineHint")}
          previousLabel={t("dash.vsLastMonth")}
          change={pctChange(stats.curPipeline, stats.prevPipeline)}
          previousValue={formatPrice(stats.prevPipeline)}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          label={t("dash.engaged")}
          value={formatPrice(stats.curEngaged)}
          subLabel={t("dash.engagedHint")}
          previousLabel={t("dash.vsLastMonth")}
          change={pctChange(stats.curEngaged, stats.prevEngaged)}
          previousValue={formatPrice(stats.prevEngaged)}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label={lang === "fr" ? "Panier moyen TTC" : "Average basket incl. VAT"}
          value={formatPrice(stats.curAvg)}
          subLabel={lang === "fr"
            ? `Montants TTC, estimations internes incluses · ${stats.curCustom} avec sur-mesure`
            : `Incl. VAT, internal estimates included · ${stats.curCustom} with custom-made`}
          previousLabel={t("dash.vsLastMonth")}
          change={pctChange(stats.curAvg, stats.prevAvg)}
          previousValue={formatPrice(stats.prevAvg)}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">{t("dash.topProducts")}</h2>
          <span className="text-xs text-muted-foreground">— {monthLabel}</span>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t("dash.noProducts")}</p>
        ) : (
          <ul className="space-y-2">
            {stats.topProducts.map((p, i) => {
              const max = stats.topProducts[0].qty || 1;
              const pct = (p.qty / max) * 100;
              return (
                <li key={p.slug} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {p.qty} {lang === "fr" ? (p.qty === 1 ? "unité" : "unités") : (p.qty === 1 ? "unit" : "units")}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="size-4 text-muted-foreground" />
          <h2 className="font-semibold">{t("dash.recent")}</h2>
        </div>
        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">{t("quotes.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {quotes.slice(0, 5).map((q) => (
              <li key={q.id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{q.customer_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString(dateLocale)} • {t(`quotes.status.${q.status}`)}
                  </div>
                </div>
                <div className="font-semibold shrink-0">{dashboardAmount(q.items, q.total_ttc, estimates[q.id]) == null ? (lang === "fr" ? "Sur devis" : "On quote") : formatPrice(dashboardAmount(q.items, q.total_ttc, estimates[q.id]) ?? 0)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, subLabel, change, previousLabel, previousValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  change: number | null;
  previousLabel: string;
  previousValue: string;
}) {
  const positive = change !== null && change >= 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {subLabel && <div className="text-[11px] text-muted-foreground mt-1">{subLabel}</div>}
      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {change === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium",
              positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(change).toFixed(0)}%
          </span>
        )}
        <span className="text-muted-foreground">
          {previousLabel} ({previousValue})
        </span>
      </div>
    </div>
  );
}

const EVENT_NAMES = ["product_view", "cart_add", "quote_submit", "custom_view", "custom_save", "contact_submit"] as const;
const EVENT_LABELS: Record<(typeof EVENT_NAMES)[number], { fr: string; en: string }> = {
  product_view: { fr: "Vues fiche produit", en: "Product views" },
  cart_add: { fr: "Ajouts au panier", en: "Cart adds" },
  quote_submit: { fr: "Demandes envoyées", en: "Requests sent" },
  custom_view: { fr: "Vues sur mesure", en: "Custom-made views" },
  custom_save: { fr: "Pièces sur mesure ajoutées", en: "Custom pieces added" },
  contact_submit: { fr: "Messages de contact", en: "Contact messages" },
};

function ConversionBlock() {
  const { lang } = useAdminI18n();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    void Promise.all(
      EVENT_NAMES.map(async (n) => {
        const { count } = await supabase.from("site_events").select("id", { count: "exact", head: true }).eq("name", n).gte("created_at", since);
        return [n, count ?? 0] as const;
      }),
    ).then((pairs) => setCounts(Object.fromEntries(pairs)));
  }, []);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm font-semibold">{lang === "fr" ? "30 derniers jours" : "Last 30 days"}</div>
      <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {EVENT_NAMES.map((n) => (
          <div key={n}>
            <div className="text-[11px] text-muted-foreground">{EVENT_LABELS[n][lang]}</div>
            <div className="text-xl font-semibold">{counts ? counts[n] : "…"}</div>
          </div>
        ))}

      </div>
    </div>
  );
}
