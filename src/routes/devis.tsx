import { rangeShort } from "@/lib/custom-pricing";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Trash2, FileDown, ShoppingBag, Plus, Minus, Wand2, CalendarIcon, Pencil, Hammer, Link2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { fr as dfFr, enUS as dfEn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { useCart, lineTotal, isCustom, type CartItem } from "@/lib/cart";
import { computeTotals, logisticsFromSettings, type Totals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { sanitizeAndTranslateRecapHtml } from "@/lib/sanitize-recap";
import { ProductImage } from "@/components/site/ProductImage";
import { configLink } from "@/lib/sur-mesure";
import { SITE_URL } from "@/lib/seo";
import { trackSiteEvent } from "@/lib/track";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { canonicalLink, hreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/devis")({
  head: () => ({
    meta: [
      { title: "Ma demande de devis — Setup Paris" },
      { name: "description", content: "Ma demande de devis : demande de devis en ligne, réponse sous 24 h ouvrées. Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis." },
    ],
    links: [canonicalLink("/devis"), ...hreflangLinks("/devis")],
  }),
  component: QuotePage,
});

function QuotePage() {
  const { t, lang } = useI18n();
  const { items, update, remove, clear } = useCart();

  /** Available stock for a product over a date range; null if unknown/error. */
  const fetchStock = async (productId: string, start: string, end: string): Promise<number | null> => {
    const { data, error } = await supabase.rpc("get_available_stock", {
      _product_id: productId,
      _start_date: start,
      _end_date: end,
    });
    if (error || data == null) return null;
    const n = Number(data);
    return Number.isFinite(n) ? n : null;
  };

  const changeDates = async (item: CartItem, start: string, end: string, days: number) => {
    const stock = await fetchStock(item.productId, start, end);
    if (stock !== null && item.quantity > stock) {
      toast.error(t("product.insufficientStock"));
      return;
    }
    update(item.lineId, { startDate: start, endDate: end, days });
  };

  const increaseQty = async (item: CartItem) => {
    const next = item.quantity + 1;
    if (item.startDate && item.endDate) {
      const stock = await fetchStock(item.productId, item.startDate, item.endDate);
      if (stock !== null && next > stock) {
        toast.error(t("product.insufficientStock"));
        return;
      }
    }
    update(item.lineId, { quantity: next });
  };
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const { token: turnstileToken, containerRef: turnstileRef, reset: resetTurnstile } = useTurnstile(TURNSTILE_SITE_KEY);
  const [logistics, setLogistics] = useState({ base: 0, perItem: 0, setup: 0, pickup: 0 });
  const [form, setForm] = useState({
    customer_name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    event_date: "",
    event_location: "",
    delivery_time: "",
    pickup_time: "",
    custom_delivery_date: "",
    custom_after_event: "",
    wants_samples: false,
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key,value_fr")
        .in("key", [
          "logistics_base_fee",
          "logistics_per_item_fee",
          "logistics_setup_fee",
          "logistics_pickup_fee",
        ]);
      setLogistics(logisticsFromSettings((data ?? []) as Array<{ key: string; value_fr: string | null }>));
    })();
  }, []);

  const rentalItems = items.filter((i) => !isCustom(i));
  const customItems = items.filter((i) => isCustom(i));
  const hasRental = rentalItems.length > 0;
  const hasCustom = customItems.length > 0;
  const lineResults = rentalItems.map((i) => lineTotal(i));
  const computed = computeTotals(lineResults, logistics);
  const totals = {
    gross: computed.subtotal_ht,
    discount: computed.discount_total,
    net: computed.total_ht - computed.delivery_fee - computed.setup_fee - computed.pickup_fee,
    deposit: computed.total_deposit,
  };
  const delivery = computed.delivery_fee;
  const setupFee = computed.setup_fee;
  const pickupFee = computed.pickup_fee;
  const netWithDelivery = computed.total_ht;
  const vat = computed.vat;
  const ttc = computed.total_ttc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || submitting) return;
    setSubmitting(true);

    const payload = {
      customer_name: form.customer_name,
      company: form.company || null,
      email: form.email,
      phone: form.phone || null,
      message: form.message || null,
      event_date: form.event_date || null,
      event_location: form.event_location || null,
      delivery_time: hasRental && form.delivery_time ? form.delivery_time.slice(0, 5) : null,
      pickup_time: hasRental && form.pickup_time ? form.pickup_time.slice(0, 5) : null,
      ...(hasCustom
        ? {
            custom_delivery_date: form.custom_delivery_date || null,
            custom_after_event: (["keep", "pickup", "discuss"] as const).find((v) => v === form.custom_after_event) ?? null,
            wants_samples: form.wants_samples,
          }
        : {}),
      lang,
      website: honeypot,
      turnstile_token: TURNSTILE_SITE_KEY ? turnstileToken || null : null,
      items: [
        ...customItems.map((i) => ({
          kind: "custom" as const,
          line_id: i.lineId.slice(0, 64),
          piece: i.customPiece ?? i.slug,
          quantity: Math.min(50, Math.max(1, i.quantity)),
          reference: (i.customRef ?? "").slice(0, 120),
          configuration: i.customConfig ?? {},
          recap: (i.configuratorRecap ?? "").slice(0, 5000),
          alerts: (i.customAlerts ?? []).slice(0, 12),
          weight_kg: Number(i.customWeightKg) || 0,
          thumbnail: i.customThumbnail ?? null,
        })),
        ...rentalItems.map((i) => ({
        line_id: i.lineId.slice(0, 64),
        productId: i.productId,
        quantity: i.quantity,
        startDate: i.startDate ?? null,
        endDate: i.endDate ?? null,
        days: Math.min(365, Math.max(1, Math.round(i.days || 1))),
        option_ids: (i.selectedOptions ?? []).map((o) => o.optionId).filter((id) => UUID_RE.test(id)),
        configurator_recap: i.configuratorRecap ? i.configuratorRecap.slice(0, 5000) : null,
        configurator_data: i.configuratorData ?? null,
        logo_path: logoPathFromUrl(i.logoUrl),
        logo_filename: i.logoFilename ?? null,
      })),
      ],
    };

    let res: Response;
    let body: any = {};
    try {
      res = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      body = await res.json().catch(() => ({}));
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast.error(t("cart.error"));
      return;
    }
    setSubmitting(false);
    resetTurnstile();

    if (res.status === 409 && body?.error === "stock" && Array.isArray(body.lines)) {
      const parts = (body.lines as Array<{ line_id: string; available: number }>).map((l) => {
        const it = items.find((x) => x.lineId.slice(0, 64) === l.line_id);
        return `${it ? pickLang(it, "name", lang) : "?"} (${l.available} ${t("cart.available")})`;
      });
      toast.error(`${t("cart.stockError")} ${[...new Set(parts)].join(", ")}`);
      return;
    }
    if (res.status === 429) {
      toast.error(t("cart.rateLimited"));
      return;
    }
    if (!res.ok || !body?.ok) {
      toast.error(t("cart.error"));
      return;
    }

    trackSiteEvent("quote_submit");
    setConfirmation({
      number: typeof body.number === "string" ? body.number : "",
      emailClientOk: !!body.email?.client,
      lines: [
        ...rentalItems.map((i, idx) => ({
          lineId: i.lineId,
          name: pickLang(i, "name", lang),
          quantity: i.quantity,
          days: i.days,
          startDate: i.startDate,
          endDate: i.endDate,
          net: lineResults[idx]?.net ?? 0,
        })),
        ...customItems.map((i) => ({
          lineId: i.lineId,
          name: pickLang(i, "name", lang),
          quantity: i.quantity,
          days: 1,
          net: 0,
          custom: true,
          ref: i.customRef,
          resumeUrl: configLink(i.customPiece ?? i.slug, i.customConfig, SITE_URL) ?? undefined,
        })),
      ],
      hasRental,
      totals: computed,
    });
    clear();
    setForm({ customer_name: "", company: "", email: "", phone: "", message: "", event_date: "", event_location: "", delivery_time: "", pickup_time: "", custom_delivery_date: "", custom_after_event: "", wants_samples: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SETUP PARIS", 14, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(t("cart.quoteSimulation"), 14, 27);
    doc.text(new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB"), 196, 20, { align: "right" });

    const body: (string | number)[][] = [];
    customItems.forEach((i) => {
      body.push([
        `${pickLang(i, "name", lang)}${i.customRef ? ` — ${i.customRef}` : ""}`,
        i.quantity,
        "—",
        "—",
        "—",
        t("sm.priceOnQuote"),
      ]);
      (i.configuratorRecap ?? "").split("\n").forEach((line) => {
        if (line.trim()) body.push([`   ✦ ${line.trim()}`, "", "", "", "", ""]);
      });
    });
    rentalItems.forEach((i) => {
      const lt = lineTotal(i);
      body.push([
        pickLang(i, "name", lang),
        i.quantity,
        i.days,
        formatPrice(i.price_day, lang),
        lt.discount > 0 ? `-${formatPrice(lt.discount, lang)}` : "—",
        formatPrice(lt.net, lang),
      ]);
      (i.selectedOptions ?? []).forEach((o) => {
        body.push([
          `   • ${pickLang(o, "categoryName", lang)}: ${pickLang(o, "name", lang)}`,
          "",
          "",
          o.price > 0 ? `+${formatPrice(o.price, lang)}` : "—",
          "",
          "",
        ]);
      });
      if (i.configuratorRecap) {
        i.configuratorRecap.split("\n").forEach((line) => {
          if (line.trim()) body.push([`   ✦ ${line.trim()}`, "", "", "", "", ""]);
        });
      }
    });

    autoTable(doc, {
      startY: 35,
      head: [[
        t("cart.col.product"),
        t("cart.col.qty"),
        t("cart.col.days"),
        t("cart.col.unitDay"),
        t("cart.col.discount"),
        "Total HT",
      ]],
      body,
      headStyles: { fillColor: [26, 26, 26] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    let y = finalY;
    if (!hasRental) {
      doc.text(t("sm.teamWillQuote"), 196, y, { align: "right" });
      doc.save(`estimation-setup-paris-${Date.now()}.pdf`);
      return;
    }
    doc.text(`${t("cart.subtotalHT")}: ${formatPrice(totals.gross, lang)}`, 196, y, { align: "right" }); y += 6;
    if (delivery > 0) { doc.text(`${t("cart.delivery")}: ${formatPrice(delivery, lang)}`, 196, y, { align: "right" }); y += 6; }
    if (setupFee > 0) { doc.text(`${t("cart.setup")}: ${formatPrice(setupFee, lang)}`, 196, y, { align: "right" }); y += 6; }
    if (pickupFee > 0) { doc.text(`${t("cart.pickup")}: ${formatPrice(pickupFee, lang)}`, 196, y, { align: "right" }); y += 6; }
    doc.text(`${t("cart.totalHT")}: ${formatPrice(netWithDelivery, lang)}`, 196, y, { align: "right" }); y += 6;
    doc.text(`${t("cart.vat")}: ${formatPrice(vat, lang)}`, 196, y, { align: "right" }); y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`${t("cart.totalTTC")}: ${formatPrice(ttc, lang)}`, 196, y, { align: "right" }); y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${t("cart.deposits")}: ${formatPrice(totals.deposit, lang)}`, 196, y, { align: "right" });
    if (hasCustom) { y += 6; doc.text(t("sm.plusCustom").replace("{n}", String(customItems.length)), 196, y, { align: "right" }); }

    doc.save(`devis-setup-paris-${Date.now()}.pdf`);
  };

  return (
    <div className="pt-24 md:pt-28 pb-16">
      <div className="container-x">
        <div className="section-num">— 05 — Devis</div>
        <h1 className="mt-3 font-display font-semibold text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight">
          {t("cart.title")}
        </h1>

        {confirmation ? (
          <ConfirmationScreen c={confirmation} />
        ) : items.length === 0 ? (
          <div className="mt-10 text-center py-14 border border-dashed border-border rounded-2xl">
            <ShoppingBag className="size-12 text-muted-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
            <Link to="/catalogue" className="mt-6 inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition-colors">
              {t("cart.continue")}
            </Link>
            <div className="mt-4">
              <Link to="/contact" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                {t("cart.emptyContact")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-10 items-start">
            {/* Items + form (left, 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {hasRental && hasCustom && <h2 className="font-display font-semibold text-xl">{t("sm.blockRental")}</h2>}
              {hasRental && (
              <div className="space-y-4">
                {rentalItems.map((item) => {
                  const lt = lineTotal(item);
                  return (
                    <div key={item.lineId} className="flex gap-4 p-4 rounded-lg border border-border bg-white">
                      <div className="size-20 sm:size-24 rounded-lg overflow-hidden bg-secondary shrink-0">
                        <ProductImage name={pickLang(item, "name", lang)} category_slug={item.category_slug} image_url={item.image_url} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link to="/produit/$slug" params={{ slug: item.slug }} className="font-medium hover:text-accent transition-colors">
                              {pickLang(item, "name", lang)}
                            </Link>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t("catalog.from")} {formatPrice(item.price_day, lang)} {t("catalog.perDay")} • {item.days} {t("product.days")}
                            </div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded px-1.5 py-0.5 -mx-1.5 transition-colors"
                                >
                                  <CalendarIcon className="size-3" />
                                  {item.startDate && item.endDate ? (
                                    <span>
                                      {format(parseISO(item.startDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn })}
                                      {" → "}
                                      {format(parseISO(item.endDate), "PPP", { locale: lang === "fr" ? dfFr : dfEn })}
                                    </span>
                                  ) : (
                                    <span className="italic">{t("cart.pickDates")}</span>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="range"
                                  numberOfMonths={2}
                                  defaultMonth={item.startDate ? parseISO(item.startDate) : undefined}
                                  selected={
                                    item.startDate && item.endDate
                                      ? { from: parseISO(item.startDate), to: parseISO(item.endDate) }
                                      : undefined
                                  }
                                  onSelect={(range) => {
                                    if (!range?.from || !range?.to) return;
                                    const start = format(range.from, "yyyy-MM-dd");
                                    const end = format(range.to, "yyyy-MM-dd");
                                    const days = Math.max(1, differenceInCalendarDays(range.to, range.from) + 1);
                                    void changeDates(item, start, end, days);
                                  }}
                                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                              <ul className="mt-2 space-y-0.5">
                                {item.selectedOptions.map((o) => (
                                  <li
                                    key={o.optionId}
                                    className="text-xs text-muted-foreground flex items-baseline gap-1"
                                  >
                                    <span className="text-foreground/70">
                                      {pickLang(o, "categoryName", lang)}:
                                    </span>
                                    <span className="font-medium text-foreground">
                                      {pickLang(o, "name", lang)}
                                    </span>
                                    {o.price > 0 && (
                                      <span className="text-accent">
                                        +{formatPrice(o.price, lang)}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {(item.configuratorRecapHtml || item.configuratorRecap) && (
                              <div className="mt-2 rounded-md border border-gold/30 bg-gold/5 p-2">
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold font-semibold mb-1">
                                  <Wand2 className="size-3" />
                                  {t("cart.configRecap")}
                                </div>
                                {(() => {
                                  const safe = sanitizeAndTranslateRecapHtml(item.configuratorRecapHtml, lang);
                                  // Detect "sanitized to nothing visible" so
                                  // we never render an empty card.
                                  let visible = !!safe;
                                  if (safe && typeof window !== "undefined") {
                                    const probe = document.createElement("div");
                                    probe.innerHTML = safe;
                                    visible =
                                      (probe.textContent ?? "").trim().length > 0 ||
                                      probe.querySelector("img") !== null;
                                  }
                                  if (visible) {
                                    return (
                                      <div
                                        className="text-[11px] leading-snug text-foreground/80 [&_*]:max-w-full"
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{ __html: safe }}
                                      />
                                    );
                                  }
                                  if (item.configuratorRecap) {
                                    return (
                                      <pre className="whitespace-pre-wrap text-[11px] leading-snug text-foreground/80 font-mono">
                                        {item.configuratorRecap}
                                      </pre>
                                    );
                                  }
                                  return (
                                    <div className="text-[11px] italic text-muted-foreground">
                                      {t("product.configUnrenderable")}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                            {item.logoUrl && (
                              <div className="mt-2 rounded-md border border-accent/30 bg-accent/5 p-2 text-[11px] flex items-center gap-2">
                                <span className="font-semibold text-accent">📎 {t("logoUpload.attachedLabel")} :</span>
                                <a href={item.logoUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline truncate text-foreground/80">
                                  {item.logoFilename || t("logoUpload.preview")}
                                </a>
                              </div>
                            )}
                          </div>
                          <button onClick={() => remove(item.lineId)} className="text-muted-foreground hover:text-destructive p-1" aria-label={t("cart.remove")}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button aria-label={t("product.qtyDecrease")} onClick={() => update(item.lineId, { quantity: Math.max(1, item.quantity - 1) })} className="p-1.5 hover:bg-secondary"><Minus className="size-3.5" /></button>
                            <div className="w-10 text-center text-sm" aria-live="polite">{item.quantity}</div>
                            <button aria-label={t("product.qtyIncrease")} onClick={() => void increaseQty(item)} className="p-1.5 hover:bg-secondary"><Plus className="size-3.5" /></button>
                          </div>
                          <div className="text-right">
                            {lt.qtyRate + lt.durationRate > 0 && (
                              <div className="text-[11px] text-accent">-{Math.round((lt.qtyRate + lt.durationRate) * 100)}%</div>
                            )}
                            <div className="font-semibold">{formatPrice(lt.net, lang)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {hasCustom && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl flex items-center gap-2">
                    <Hammer className="size-5 text-gold" /> {t("sm.blockCustom")}
                  </h2>
                  {customItems.map((item) => (
                    <div key={item.lineId} className="flex gap-4 p-4 rounded-lg border border-border bg-white">
                      <div className="size-20 sm:size-24 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                        {item.customThumbnail && item.customThumbnail.startsWith("data:image/jpeg;base64,") ? (
                          <img src={item.customThumbnail} alt={pickLang(item, "name", lang)} className="w-full h-full object-cover" />
                        ) : (
                          <Hammer className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium">{pickLang(item, "name", lang)}</div>
                            {item.customRef && (
                              <div className="text-xs text-muted-foreground mt-0.5">{t("sm.reference")} : <span className="font-mono">{item.customRef}</span></div>
                            )}
                            {item.kind === "custom" && item.customRange && (
                              <div className="text-xs text-muted-foreground mt-0.5">{rangeShort(item.customRange, lang)}</div>
                            )}
                            <Link
                              to="/sur-mesure/$piece"
                              params={{ piece: item.customPiece ?? item.slug }}
                              search={{ line: item.lineId }}
                              className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                            >
                              <Pencil className="size-3" /> {t("sm.edit")}
                            </Link>
                            {item.customConfig && configLink(item.customPiece ?? item.slug, item.customConfig) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = configLink(item.customPiece ?? item.slug, item.customConfig, window.location.origin)!;
                                  try {
                                    await navigator.clipboard.writeText(url);
                                    toast.success(lang === "fr" ? "Lien copié" : "Link copied");
                                  } catch {
                                    window.prompt("", url);
                                  }
                                }}
                                className="mt-1 ml-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                              >
                                <Link2 className="size-3" /> {lang === "fr" ? "Copier le lien de cette configuration" : "Copy link to this configuration"}
                              </button>
                            )}
                          </div>
                          <button onClick={() => remove(item.lineId)} className="text-muted-foreground hover:text-destructive p-1" aria-label={t("cart.remove")}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        {item.configuratorRecap && (
                          <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-snug text-foreground/80 font-mono rounded-md border border-gold/30 bg-gold/5 p-2">
                            {item.configuratorRecap}
                          </pre>
                        )}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button aria-label={t("product.qtyDecrease")} onClick={() => update(item.lineId, { quantity: Math.max(1, item.quantity - 1) })} className="p-1.5 hover:bg-secondary"><Minus className="size-3.5" /></button>
                            <div className="w-10 text-center text-sm" aria-live="polite">{item.quantity}</div>
                            <button aria-label={t("product.qtyIncrease")} onClick={() => update(item.lineId, { quantity: Math.min(50, item.quantity + 1) })} className="p-1.5 hover:bg-secondary"><Plus className="size-3.5" /></button>
                          </div>
                          <div className="text-right text-xs font-medium text-muted-foreground">{t("sm.priceOnQuote")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative rounded-2xl border border-border p-6 bg-white space-y-3">
                <div className="font-display font-semibold text-lg mb-2">{t("cart.formTitle")}</div>
                <Input label={t("cart.name")} required value={form.customer_name} onChange={(v) => setForm({ ...form, customer_name: v })} maxLength={200} />
                <Input label={t("cart.company")} value={form.company} onChange={(v) => setForm({ ...form, company: v })} maxLength={200} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label={t("cart.email")} type="email" required value={form.email} onChange={(v) => setForm({ ...form, email: v })} maxLength={320} />
                  <Input label={t("cart.phone")} type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} maxLength={50} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label={t("cart.eventDate")} type="date" value={form.event_date} onChange={(v) => setForm({ ...form, event_date: v })} />
                  <Input label={t("cart.eventLocation")} value={form.event_location} onChange={(v) => setForm({ ...form, event_location: v })} maxLength={500} />
                </div>
                {hasRental && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label={t("cart.deliveryTime")} type="time" value={form.delivery_time} onChange={(v) => setForm({ ...form, delivery_time: v })} />
                      <Input label={t("cart.pickupTime")} type="time" value={form.pickup_time} onChange={(v) => setForm({ ...form, pickup_time: v })} />
                    </div>
                    <p className="text-[11px] text-muted-foreground -mt-1">{t("cart.timesHint")}</p>
                  </>
                )}
                {hasCustom && (
                  <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gold">{t("sm.blockCustom")}</div>
                    <Input label={t("sm.deliveryDate")} type="date" value={form.custom_delivery_date} onChange={(v) => setForm({ ...form, custom_delivery_date: v })} />
                    <fieldset>
                      <legend className="text-xs text-muted-foreground">{t("sm.afterEvent")}</legend>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {(["keep", "pickup", "discuss"] as const).map((v) => (
                          <label key={v} className="inline-flex items-center gap-1.5">
                            <input type="radio" name="custom_after_event" value={v} checked={form.custom_after_event === v} onChange={() => setForm({ ...form, custom_after_event: v })} />
                            {t(`sm.after.${v}`)}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-0.5" checked={form.wants_samples} onChange={(e) => setForm({ ...form, wants_samples: e.target.checked })} />
                      {t("sm.samples")}
                    </label>
                  </div>
                )}
                <div>
                  <label htmlFor="quote-message" className="text-xs text-muted-foreground">{t("cart.message")}</label>
                  <textarea
                    id="quote-message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    maxLength={5000}
                    rows={3}
                    className="mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
                  />
                </div>
                <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                  <label>
                    Website
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="min-h-[65px]" />}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-lg px-5 py-3 text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {submitting ? "…" : t("cart.submit")}
                </button>
                <p className="text-xs text-muted-foreground">
                  {lang === "fr" ? "Les informations saisies servent uniquement à traiter votre demande. " : "The information you enter is used solely to process your request. "}
                  <Link to="/mentions-legales" className="underline hover:text-foreground">{lang === "fr" ? "Mentions légales" : "Legal notice"}</Link>
                </p>
              </form>
            </div>

            {/* Summary (right, sticky) */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border p-6 bg-white space-y-2 text-sm">
                <div className="font-display font-semibold text-lg mb-3">{t("cart.totals")}</div>
                {!hasRental ? (
                  <p className="text-sm text-muted-foreground">{t("sm.teamWillQuote")}</p>
                ) : (<>
                <Row label={t("cart.subtotalHT")} value={formatPrice(totals.gross, lang)} />
                {totals.discount > 0 && <Row label={t("product.discount")} value={`-${formatPrice(totals.discount, lang)}`} highlight />}
                {delivery > 0 && (
                  <div>
                    <Row label={t("cart.delivery")} value={formatPrice(delivery, lang)} />
                    <div className="text-[11px] text-muted-foreground">{t("cart.deliveryNote")}</div>
                  </div>
                )}
                {setupFee > 0 && <Row label={t("cart.setup")} value={formatPrice(setupFee, lang)} />}
                {pickupFee > 0 && <Row label={t("cart.pickup")} value={formatPrice(pickupFee, lang)} />}
                <Row label={t("cart.totalHT")} value={formatPrice(netWithDelivery, lang)} />
                <Row label={t("cart.vat")} value={formatPrice(vat, lang)} />
                <div className="border-t border-border pt-3 flex items-baseline justify-between">
                  <div className="font-semibold">{t("cart.totalTTC")}</div>
                  <div className="font-display font-bold text-2xl">{formatPrice(ttc, lang)}</div>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between pt-1">
                  <span>{t("cart.deposits")}</span>
                  <span>{formatPrice(totals.deposit, lang)}</span>
                </div>
                </>)}
                {hasRental && hasCustom && (
                  <div className="text-xs font-medium pt-1">{t("sm.plusCustom").replace("{n}", String(customItems.length))}</div>
                )}
                {hasRental && <p className="text-[11px] text-muted-foreground pt-1">{t("cart.estimateNote")}</p>}
                {hasCustom && <p className="text-[11px] text-muted-foreground">{t("sm.customDeliveryNote")}</p>}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-border hover:bg-secondary transition-colors"
                >
                  <FileDown className="size-4" />
                  {t("cart.exportPdf")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(highlight && "text-accent font-medium")}>{value}</span>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", required, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; maxLength?: number }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs text-muted-foreground">{label}{required && " *"}</label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 text-sm bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
    </div>
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) || "";

/** Extracts the storage path (after `/quote-uploads/`) from a public logo URL. */
function logoPathFromUrl(url?: string): string | null {
  if (!url) return null;
  const marker = "/quote-uploads/";
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  try {
    const path = decodeURIComponent(url.slice(idx + marker.length).split(/[?#]/)[0]!);
    return path.startsWith("client-logos/") && !path.includes("..") && path.length <= 300 ? path : null;
  } catch {
    return null;
  }
}

interface Confirmation {
  number: string;
  emailClientOk: boolean;
  lines: Array<{ lineId: string; name: string; quantity: number; days: number; startDate?: string; endDate?: string; net: number; custom?: boolean; ref?: string; resumeUrl?: string }>;
  totals: Totals;
  hasRental: boolean;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

/** Loads Cloudflare Turnstile only when a site key is configured. */
function useTurnstile(siteKey: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      const id = "cf-turnstile-script";
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  const reset = useCallback(() => {
    if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
    setToken("");
  }, []);

  return { token, containerRef, reset };
}

function ConfirmationScreen({ c }: { c: Confirmation }) {
  const { t, lang } = useI18n();
  const dl = lang === "fr" ? dfFr : dfEn;
  const tt = c.totals;
  return (
    <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-white p-6 md:p-8">
      <h2 className="font-display font-semibold text-2xl">{t("cart.confirm.title")}</h2>
      {c.number && (
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">{t("cart.confirm.number")} : </span>
          <span className="font-mono font-semibold text-lg">{c.number}</span>
        </div>
      )}
      {c.hasRental && <p className="mt-3 text-sm">{t("cart.confirm.reply")}</p>}
      {c.lines.some((l) => l.custom) && <p className="mt-1 text-sm">{t("cart.confirm.replyCustom")}</p>}
      {!c.emailClientOk && (
        <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t("cart.confirm.emailFailed")}
        </div>
      )}
      <div className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">{t("cart.confirm.summary")}</div>
      <div className="mt-2 divide-y divide-border rounded-lg border border-border">
        {c.lines.map((l) => (
          <div key={l.lineId} className="flex justify-between gap-3 p-3 text-sm">
            <div>
              <div className="font-medium">{l.name} × {l.quantity}</div>
              <div className="text-xs text-muted-foreground">
                {l.custom
                  ? `${t("sm.reference")} : ${l.ref ?? "—"}`
                  : l.startDate && l.endDate
                  ? l.startDate === l.endDate
                    ? `${lang === "fr" ? "Le" : "On"} ${format(parseISO(l.startDate), "PPP", { locale: dl })}`
                    : `${format(parseISO(l.startDate), "PPP", { locale: dl })} → ${format(parseISO(l.endDate), "PPP", { locale: dl })}`
                  : `${l.days} ${t("cart.col.days")}`}
              </div>
              {l.resumeUrl && (
                <a href={l.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-accent underline break-all">
                  {lang === "fr" ? "Reprendre / partager cette configuration" : "Resume / share this configuration"}
                </a>
              )}
            </div>
            <div className="font-semibold whitespace-nowrap">{l.custom ? (lang === "fr" ? "Sur devis" : "On quote") : formatPrice(l.net, lang)}</div>
          </div>
        ))}
      </div>
      {!c.hasRental ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("sm.teamWillQuote")}</p>
      ) : (
      <div className="mt-4 space-y-1 text-sm">
        <Row label={t("cart.subtotalHT")} value={formatPrice(tt.subtotal_ht, lang)} />
        {tt.discount_total > 0 && <Row label={t("product.discount")} value={`-${formatPrice(tt.discount_total, lang)}`} highlight />}
        {tt.delivery_fee > 0 && <Row label={t("cart.delivery")} value={formatPrice(tt.delivery_fee, lang)} />}
        {tt.setup_fee > 0 && <Row label={t("cart.setup")} value={formatPrice(tt.setup_fee, lang)} />}
        {tt.pickup_fee > 0 && <Row label={t("cart.pickup")} value={formatPrice(tt.pickup_fee, lang)} />}
        <Row label={t("cart.totalHT")} value={formatPrice(tt.total_ht, lang)} />
        <Row label={t("cart.vat")} value={formatPrice(tt.vat, lang)} />
        <div className="border-t border-border pt-2 flex justify-between font-semibold">
          <span>{t("cart.totalTTC")}</span>
          <span>{formatPrice(tt.total_ttc, lang)}</span>
        </div>
        <Row label={t("cart.deposits")} value={formatPrice(tt.total_deposit, lang)} />
        <p className="pt-1 text-[11px] text-muted-foreground">{t("cart.deliveryNote")}</p>
        <p className="text-[11px] text-muted-foreground">{t("cart.estimateNote")}</p>
      </div>
      )}
      {c.lines.some((l) => l.custom) && <p className="mt-2 text-[11px] text-muted-foreground">{t("sm.customDeliveryNote")}</p>}
      <Link to="/catalogue" className="mt-6 inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition-colors">
        {t("cart.confirm.back")}
      </Link>
    </div>
  );
}
