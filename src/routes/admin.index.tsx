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
};

const finalTotal = (q: Quote) =>
  Number(q.total_ttc) +
  Number(q.delivery_fee || 0) +
  Number(q.setup_fee || 0) +
  Number(q.pickup_fee || 0);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quote_requests")
        .select("id, customer_name, status, total_ttc, delivery_fee, setup_fee, pickup_fee, created_at, items")
        .order("created_at", { ascending: false });
      if (!error) setQuotes((data as Quote[]) ?? []);
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
    const productCounts = new Map<string, { name: string; qty: number }>();

    for (const q of quotes) {
      const created = new Date(q.created_at);
      const total = finalTotal(q);
      const inCur = inRange(created, curStart, curEnd);
      const inPrev = inRange(created, prevStart, prevEnd);
      if (inCur) {
        curCount++;
        if (PIPELINE_STATUSES.has(q.status)) curPipeline += total;
        if (ENGAGED_STATUSES.has(q.status)) curEngaged += total;
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
        if (PIPELINE_STATUSES.has(q.status)) prevPipeline += total;
        if (ENGAGED_STATUSES.has(q.status)) prevEngaged += total;
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
    };
  }, [quotes, lang]);

  const monthLabel = new Date().toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">{t("layout.loading")}</div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dash.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1 capitalize">{monthLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        {p.qty} {t("dash.units")}
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
                <div className="font-semibold shrink-0">{formatPrice(finalTotal(q))}</div>
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
