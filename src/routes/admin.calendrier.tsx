import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, AlertTriangle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminI18n } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/calendrier")({
  head: () => ({ meta: [{ title: "Calendrier — Admin Setup Paris" }] }),
  component: AdminCalendarPage,
});

type CalendarQuote = {
  id: string;
  customer_name: string;
  company: string | null;
  event_date: string;
  event_location: string | null;
  delivery_time: string | null;
  pickup_time: string | null;
  status: string;
  total_ttc: number;
  delivery_fee: number;
  setup_fee: number;
  pickup_fee: number;
  items: any;
};

const ALL_STATUSES = ["pending", "contacted", "confirmed", "completed", "rejected"] as const;
type Status = (typeof ALL_STATUSES)[number];
const DEFAULT_STATUSES: Status[] = ["pending", "contacted", "confirmed", "completed"];

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-500",
  contacted: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-purple-500",
  rejected: "bg-red-500",
};

const STATUS_BG: Record<string, string> = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-900 hover:bg-yellow-100",
  contacted: "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100",
  confirmed: "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
  completed: "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100",
  rejected: "bg-red-50 border-red-200 text-red-900 hover:bg-red-100",
};

type ViewMode = "month" | "week" | "list";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}
function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7;
  return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -day);
}
function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function buildGrid(monthStart: Date) {
  const first = new Date(monthStart);
  const dayOfWeek = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -dayOfWeek);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// Detect stock conflicts: for items reserved on overlapping dates,
// sum quantities per productId on each day in the date range and flag
// any day where total reservations exceed product stock_total.
function computeConflicts(
  quotes: CalendarQuote[],
  stockMap: Map<string, number>,
): Map<string, Set<string>> {
  // dateKey -> Set of productIds in conflict
  const conflicts = new Map<string, Set<string>>();
  // Only count blocking statuses (confirmed/completed) like the SQL function does.
  const blocking = quotes.filter((q) => q.status === "confirmed" || q.status === "completed");
  // dateKey -> Map<productId, qty>
  const usage = new Map<string, Map<string, number>>();
  for (const q of blocking) {
    const items = Array.isArray(q.items) ? q.items : [];
    for (const it of items) {
      const pid = it?.productId as string | undefined;
      const start = it?.startDate as string | undefined;
      const end = it?.endDate as string | undefined;
      const qty = Number(it?.quantity || 0);
      if (!pid || !start || !end || !qty) continue;
      const s = new Date(start);
      const e = new Date(end);
      for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
        const k = ymd(d);
        const m = usage.get(k) || new Map<string, number>();
        m.set(pid, (m.get(pid) || 0) + qty);
        usage.set(k, m);
      }
    }
  }
  for (const [day, m] of usage) {
    for (const [pid, qty] of m) {
      const stock = stockMap.get(pid);
      if (stock != null && qty > stock) {
        const set = conflicts.get(day) || new Set<string>();
        set.add(pid);
        conflicts.set(day, set);
      }
    }
  }
  return conflicts;
}

function AdminCalendarPage() {
  const { t, lang } = useAdminI18n();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const today = new Date();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [quotes, setQuotes] = useState<CalendarQuote[]>([]);
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Status[]>(DEFAULT_STATUSES);

  // Compute the visible window depending on view
  const window = useMemo(() => {
    if (view === "week") {
      const ws = startOfWeek(cursor);
      return { start: ws, end: addDays(ws, 6) };
    }
    if (view === "list") {
      const s = startOfMonth(cursor);
      return { start: s, end: addDays(addMonths(s, 1), -1) };
    }
    const s = startOfMonth(cursor);
    return { start: s, end: addDays(addMonths(s, 1), -1) };
  }, [view, cursor]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const fetchStart = addDays(window.start, -7);
      const fetchEnd = addDays(window.end, 7);

      const [quotesRes, productsRes] = await Promise.all([
        supabase
          .from("quote_requests")
          .select(
            "id,customer_name,company,event_date,event_location,delivery_time,pickup_time,status,total_ttc,delivery_fee,setup_fee,pickup_fee,items",
          )
          .not("event_date", "is", null)
          .gte("event_date", ymd(fetchStart))
          .lte("event_date", ymd(fetchEnd))
          .order("event_date", { ascending: true }),
        supabase.from("products").select("id,stock_total"),
      ]);

      if (cancelled) return;
      if (quotesRes.error) {
        console.error(quotesRes.error);
        setQuotes([]);
      } else {
        setQuotes((quotesRes.data || []) as CalendarQuote[]);
      }
      if (!productsRes.error && productsRes.data) {
        const m = new Map<string, number>();
        for (const p of productsRes.data as Array<{ id: string; stock_total: number }>) {
          m.set(p.id, Number(p.stock_total || 0));
        }
        setStockMap(m);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [window.start.getTime(), window.end.getTime()]);

  // Apply filters (status + search)
  const filteredQuotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotes.filter((it) => {
      if (!statuses.includes(it.status as Status)) return false;
      if (!q) return true;
      const hay = `${it.customer_name} ${it.company || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [quotes, statuses, search]);

  // Conflicts use ALL quotes (unfiltered) so toggling filters doesn't hide them
  const conflicts = useMemo(
    () => computeConflicts(quotes, stockMap),
    [quotes, stockMap],
  );

  const quotesByDay = useMemo(() => {
    const map = new Map<string, CalendarQuote[]>();
    for (const q of filteredQuotes) {
      if (!q.event_date) continue;
      const list = map.get(q.event_date) || [];
      list.push(q);
      map.set(q.event_date, list);
    }
    return map;
  }, [filteredQuotes]);

  const navLabel =
    view === "week"
      ? `${window.start.toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${window.end.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`
      : cursor.toLocaleDateString(locale, { month: "long", year: "numeric" });

  const weekdayLabels =
    lang === "fr"
      ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const todayKey = ymd(today);
  const monthIndex = cursor.getMonth();

  const finalTotal = (q: CalendarQuote) =>
    Number(q.total_ttc) +
    Number(q.delivery_fee || 0) +
    Number(q.setup_fee || 0) +
    Number(q.pickup_fee || 0);

  const fmtTime = (s: string | null) => (s ? s.slice(0, 5) : null);

  function navigate(dir: -1 | 0 | 1) {
    if (dir === 0) {
      setCursor(view === "week" ? new Date() : startOfMonth(new Date()));
      return;
    }
    if (view === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(addMonths(cursor, dir));
  }

  function toggleStatus(s: Status) {
    setStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  const renderQuotePill = (q: CalendarQuote) => {
    const isConflict = conflicts.has(q.event_date) &&
      (q.status === "confirmed" || q.status === "completed");
    return (
      <Popover key={q.id}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "text-left text-[11px] leading-tight px-1.5 py-1 rounded border truncate transition-colors w-full",
              STATUS_BG[q.status] || "bg-muted border-border text-foreground",
              isConflict && "ring-1 ring-red-500",
            )}
            title={q.customer_name}
          >
            <span className="flex items-center gap-1">
              {isConflict && <AlertTriangle className="size-3 text-red-600 shrink-0" />}
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  STATUS_DOT[q.status] || "bg-muted-foreground",
                )}
              />
              <span className="truncate font-medium">{q.customer_name}</span>
            </span>
            {fmtTime(q.delivery_time) && (
              <span className="block text-[10px] opacity-70 truncate">
                {fmtTime(q.delivery_time)}
                {fmtTime(q.pickup_time) && ` → ${fmtTime(q.pickup_time)}`}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 text-sm" align="start">
          <div className="font-semibold mb-1">
            {q.customer_name}
            {q.company && (
              <span className="text-muted-foreground font-normal"> — {q.company}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-block size-2 rounded-full",
                STATUS_DOT[q.status] || "bg-muted-foreground",
              )}
            />
            <span className="text-xs text-muted-foreground">
              {t(`quotes.status.${q.status}`)}
            </span>
          </div>
          {isConflict && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mb-2">
              <AlertTriangle className="size-3 shrink-0" />
              <span>{t("cal.conflictDetail")}</span>
            </div>
          )}
          {q.event_location && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1.5">
              <MapPin className="size-3 mt-0.5 shrink-0" />
              <span>{q.event_location}</span>
            </div>
          )}
          {(fmtTime(q.delivery_time) || fmtTime(q.pickup_time)) && (
            <div className="text-xs text-muted-foreground mb-1.5">
              {fmtTime(q.delivery_time) && (
                <div>
                  {t("quotes.slot.delivery")} :{" "}
                  <strong className="text-foreground">{fmtTime(q.delivery_time)}</strong>
                </div>
              )}
              {fmtTime(q.pickup_time) && (
                <div>
                  {t("quotes.slot.pickup")} :{" "}
                  <strong className="text-foreground">{fmtTime(q.pickup_time)}</strong>
                </div>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground mb-2">
            {Array.isArray(q.items) ? q.items.length : 0} {t("quotes.products")} ·{" "}
            <strong className="text-foreground">{formatPrice(finalTotal(q))}</strong>
          </div>
          <Link
            to="/admin/devis"
            className="text-xs underline text-foreground hover:opacity-70"
          >
            {t("cal.openQuote")} →
          </Link>
        </PopoverContent>
      </Popover>
    );
  };

  // List view: flatten quotes across the visible month
  const listDays = useMemo(() => {
    if (view !== "list") return [];
    const out: { day: Date; key: string; quotes: CalendarQuote[] }[] = [];
    let d = new Date(window.start);
    while (d <= window.end) {
      const k = ymd(d);
      const list = quotesByDay.get(k);
      if (list && list.length) out.push({ day: new Date(d), key: k, quotes: list });
      d = addDays(d, 1);
    }
    return out;
  }, [view, window.start, window.end, quotesByDay]);

  // Week view days
  const weekDays = useMemo(() => {
    if (view !== "week") return [];
    return Array.from({ length: 7 }, (_, i) => addDays(window.start, i));
  }, [view, window.start]);

  const monthDays = useMemo(() => buildGrid(cursor), [cursor]);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("cal.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("cal.sub")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View switch */}
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {(["month", "week", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "px-3 h-9 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-foreground text-background"
                    : "bg-background text-foreground hover:bg-muted",
                )}
              >
                {t(`cal.view.${v}`)}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} aria-label={t("cal.prev")}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(0)}>
            {t("cal.today")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(1)} aria-label={t("cal.next")}>
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-2 text-base font-medium capitalize min-w-[180px] text-right">
            {navLabel}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("cal.search")}
            className="h-9 pl-8 w-[220px]"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_STATUSES.map((s) => {
            const active = statuses.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStatus(s)}
                className={cn(
                  "text-xs px-2 h-7 rounded-full border inline-flex items-center gap-1.5 transition-colors",
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:text-foreground",
                )}
              >
                <span className={cn("size-2 rounded-full", STATUS_DOT[s])} />
                {t(`quotes.status.${s}`)}
              </button>
            );
          })}
        </div>
        {loading && (
          <span className="text-xs text-muted-foreground ml-auto">{t("layout.loading")}</span>
        )}
      </div>

      {/* MONTH VIEW */}
      {view === "month" && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {weekdayLabels.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-[11px] uppercase tracking-wider font-medium text-muted-foreground text-center"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {monthDays.map((day, idx) => {
              const key = ymd(day);
              const inMonth = day.getMonth() === monthIndex;
              const isToday = key === todayKey;
              const dayQuotes = quotesByDay.get(key) || [];
              const hasConflict = conflicts.has(key);
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[110px] border-r border-b border-border p-1.5 flex flex-col gap-1",
                    (idx + 1) % 7 === 0 && "border-r-0",
                    idx >= 35 && "border-b-0",
                    !inMonth && "bg-muted/20",
                    hasConflict && "bg-red-50/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-xs h-6 min-w-6 px-1.5 rounded-full",
                        isToday
                          ? "bg-foreground text-background font-semibold"
                          : inMonth
                            ? "text-foreground"
                            : "text-muted-foreground/60",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasConflict && (
                        <span title={t("cal.conflict")}>
                          <AlertTriangle className="size-3 text-red-600" />
                        </span>
                      )}
                      {dayQuotes.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {dayQuotes.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayQuotes.slice(0, 3).map(renderQuotePill)}
                    {dayQuotes.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1.5">
                        +{dayQuotes.length - 3} {t("cal.more")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {view === "week" && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40">
            {weekDays.map((d, i) => (
              <div key={i} className="px-2 py-2 text-center">
                <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
                  {weekdayLabels[i]}
                </div>
                <div
                  className={cn(
                    "text-sm mt-0.5",
                    ymd(d) === todayKey ? "font-bold text-foreground" : "text-foreground",
                  )}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((d, i) => {
              const key = ymd(d);
              const dayQuotes = quotesByDay.get(key) || [];
              const hasConflict = conflicts.has(key);
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[400px] border-r border-border p-2 flex flex-col gap-1.5",
                    i === 6 && "border-r-0",
                    hasConflict && "bg-red-50/40",
                  )}
                >
                  {hasConflict && (
                    <div className="flex items-center gap-1 text-[10px] text-red-700 mb-1">
                      <AlertTriangle className="size-3" />
                      {t("cal.conflict")}
                    </div>
                  )}
                  {dayQuotes.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground/60">—</span>
                  ) : (
                    dayQuotes.map(renderQuotePill)
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="border border-border rounded-lg overflow-hidden bg-card divide-y divide-border">
          {listDays.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("cal.noResults")}
            </div>
          ) : (
            listDays.map(({ day, key, quotes: dayQuotes }) => {
              const hasConflict = conflicts.has(key);
              return (
                <div key={key} className="p-3 flex gap-4">
                  <div className="w-28 shrink-0">
                    <div className="text-xs text-muted-foreground uppercase">
                      {day.toLocaleDateString(locale, { weekday: "short" })}
                    </div>
                    <div className="text-lg font-semibold">
                      {day.toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    </div>
                    {hasConflict && (
                      <div className="flex items-center gap-1 text-[10px] text-red-700 mt-1">
                        <AlertTriangle className="size-3" />
                        {t("cal.conflict")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {dayQuotes.map(renderQuotePill)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!loading && filteredQuotes.length === 0 && view !== "list" && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          {t("cal.noResults")}
        </p>
      )}
    </div>
  );
}
