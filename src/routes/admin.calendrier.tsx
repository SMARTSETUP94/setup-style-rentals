import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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

const STATUS_DOT: Record<string, string> = {
  confirmed: "bg-green-500",
  completed: "bg-purple-500",
};

const STATUS_BG: Record<string, string> = {
  confirmed: "bg-green-50 border-green-200 text-green-900 hover:bg-green-100",
  completed: "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildGrid(monthStart: Date) {
  // Monday-first grid
  const first = new Date(monthStart);
  const dayOfWeek = (first.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - dayOfWeek);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

function AdminCalendarPage() {
  const { t, lang } = useAdminI18n();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [quotes, setQuotes] = useState<CalendarQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const monthStart = startOfMonth(cursor);
      const monthEnd = addMonths(monthStart, 1);
      // Fetch a wide window so cross-month event_dates visible in the grid still appear
      const fetchStart = new Date(monthStart);
      fetchStart.setDate(monthStart.getDate() - 7);
      const fetchEnd = new Date(monthEnd);
      fetchEnd.setDate(monthEnd.getDate() + 7);

      const { data, error } = await supabase
        .from("quote_requests")
        .select(
          "id,customer_name,company,event_date,event_location,delivery_time,pickup_time,status,total_ttc,delivery_fee,setup_fee,pickup_fee,items",
        )
        .in("status", ["confirmed", "completed"])
        .not("event_date", "is", null)
        .gte("event_date", ymd(fetchStart))
        .lte("event_date", ymd(fetchEnd))
        .order("event_date", { ascending: true });

      if (cancelled) return;
      if (error) {
        console.error(error);
        setQuotes([]);
      } else {
        setQuotes((data || []) as CalendarQuote[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cursor]);

  const days = useMemo(() => buildGrid(cursor), [cursor]);

  const quotesByDay = useMemo(() => {
    const map = new Map<string, CalendarQuote[]>();
    for (const q of quotes) {
      if (!q.event_date) continue;
      const list = map.get(q.event_date) || [];
      list.push(q);
      map.set(q.event_date, list);
    }
    return map;
  }, [quotes]);

  const monthLabel = cursor.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

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

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("cal.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("cal.sub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(addMonths(cursor, -1))}
            aria-label={t("cal.prev")}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(startOfMonth(new Date()))}
          >
            {t("cal.today")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCursor(addMonths(cursor, 1))}
            aria-label={t("cal.next")}
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-3 text-base font-medium capitalize min-w-[160px] text-right">
            {monthLabel}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-green-500" />
          {t("quotes.status.confirmed")}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-purple-500" />
          {t("quotes.status.completed")}
        </div>
        {loading && <span className="ml-2">{t("layout.loading")}</span>}
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Weekday header */}
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

        {/* Days grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const key = ymd(day);
            const inMonth = day.getMonth() === monthIndex;
            const isToday = key === todayKey;
            const dayQuotes = quotesByDay.get(key) || [];
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[110px] border-r border-b border-border p-1.5 flex flex-col gap-1",
                  (idx + 1) % 7 === 0 && "border-r-0",
                  idx >= 35 && "border-b-0",
                  !inMonth && "bg-muted/20",
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
                  {dayQuotes.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {dayQuotes.length}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayQuotes.slice(0, 3).map((q) => (
                    <Popover key={q.id}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "text-left text-[11px] leading-tight px-1.5 py-1 rounded border truncate transition-colors",
                            STATUS_BG[q.status] ||
                              "bg-muted border-border text-foreground",
                          )}
                          title={q.customer_name}
                        >
                          <span className="flex items-center gap-1">
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                STATUS_DOT[q.status] || "bg-muted-foreground",
                              )}
                            />
                            <span className="truncate font-medium">
                              {q.customer_name}
                            </span>
                          </span>
                          {fmtTime(q.delivery_time) && (
                            <span className="block text-[10px] opacity-70 truncate">
                              {fmtTime(q.delivery_time)}
                              {fmtTime(q.pickup_time) &&
                                ` → ${fmtTime(q.pickup_time)}`}
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3 text-sm" align="start">
                        <div className="font-semibold mb-1">
                          {q.customer_name}
                          {q.company && (
                            <span className="text-muted-foreground font-normal">
                              {" "}
                              — {q.company}
                            </span>
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
                                <strong className="text-foreground">
                                  {fmtTime(q.delivery_time)}
                                </strong>
                              </div>
                            )}
                            {fmtTime(q.pickup_time) && (
                              <div>
                                {t("quotes.slot.pickup")} :{" "}
                                <strong className="text-foreground">
                                  {fmtTime(q.pickup_time)}
                                </strong>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mb-2">
                          {Array.isArray(q.items) ? q.items.length : 0}{" "}
                          {t("quotes.products")} ·{" "}
                          <strong className="text-foreground">
                            {formatPrice(finalTotal(q))}
                          </strong>
                        </div>
                        <Link
                          to="/admin/devis"
                          className="text-xs underline text-foreground hover:opacity-70"
                        >
                          {t("cal.openQuote")} →
                        </Link>
                      </PopoverContent>
                    </Popover>
                  ))}
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

      {!loading && quotes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          {t("cal.empty")}
        </p>
      )}
    </div>
  );
}
