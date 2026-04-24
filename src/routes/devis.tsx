import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { Trash2, FileDown, ShoppingBag, Plus, Minus, Wand2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { fr as dfFr, enUS as dfEn } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { useCart, lineTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/site/ProductImage";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/devis")({
  head: () => ({
    meta: [
      { title: "Mon devis — Setup Paris" },
      { name: "description", content: "Constituez votre devis et envoyez votre demande à notre équipe commerciale." },
    ],
  }),
  component: QuotePage,
});

function QuotePage() {
  const { t, lang } = useI18n();
  const { items, update, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
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
      const map: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        map[r.key] = Number(r.value_fr) || 0;
      });
      setLogistics({
        base: map["logistics_base_fee"] ?? 0,
        perItem: map["logistics_per_item_fee"] ?? 0,
        setup: map["logistics_setup_fee"] ?? 0,
        pickup: map["logistics_pickup_fee"] ?? 0,
      });
    })();
  }, []);

  const totals = items.reduce(
    (acc, item) => {
      const lt = lineTotal(item);
      acc.gross += lt.gross;
      acc.discount += lt.discount;
      acc.net += lt.net;
      acc.deposit += lt.deposit;
      return acc;
    },
    { gross: 0, discount: 0, net: 0, deposit: 0 },
  );
  const delivery = items.length > 0 ? logistics.base + items.length * logistics.perItem : 0;
  const setupFee = items.length > 0 ? logistics.setup : 0;
  const pickupFee = items.length > 0 ? logistics.pickup : 0;
  const netWithDelivery = totals.net + delivery + setupFee + pickupFee;
  const vat = netWithDelivery * 0.2;
  const ttc = netWithDelivery + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    const payload = {
      ...form,
      event_date: form.event_date || null,
      delivery_time: form.delivery_time || null,
      pickup_time: form.pickup_time || null,
      items: items.map((i) => {
        const lt = lineTotal(i);
        return {
          slug: i.slug,
          name_fr: i.name_fr,
          name_en: i.name_en,
          quantity: i.quantity,
          days: i.days,
          price_day: i.price_day,
          deposit: i.deposit,
          startDate: i.startDate ?? null,
          endDate: i.endDate ?? null,
          line_gross: lt.gross,
          line_discount: lt.discount,
          line_net: lt.net,
          line_deposit: lt.deposit,
          options: (i.selectedOptions ?? []).map((o) => ({
            categoryName_fr: o.categoryName_fr,
            categoryName_en: o.categoryName_en,
            name_fr: o.name_fr,
            name_en: o.name_en,
            price: o.price,
            line_total: o.price * i.quantity,
          })),
          options_per_unit_per_day: lt.optionsPerUnit,
          options_total: lt.optionsTotal,
          configurator_recap: i.configuratorRecap ?? null,
          logo_url: i.logoUrl ?? null,
          logo_filename: i.logoFilename ?? null,
        };
      }),
      subtotal_ht: totals.gross,
      total_ht: netWithDelivery,
      delivery_fee: delivery,
      setup_fee: setupFee,
      pickup_fee: pickupFee,
      vat,
      total_ttc: ttc,
      total_deposit: totals.deposit,
      status: "pending",
    };

    const { error } = await supabase.from("quote_requests").insert(payload);
    if (error) {
      console.error(error);
      setSubmitting(false);
      toast.error(t("cart.error"));
      return;
    }

    // Fire-and-forget email notifications (don't block UX on email failure)
    fetch("/api/send-quote-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Email notification failed:", err));

    setSubmitting(false);
    toast.success(t("cart.sent"));
    clear();
    setForm({ customer_name: "", company: "", email: "", phone: "", message: "", event_date: "", event_location: "", delivery_time: "", pickup_time: "" });
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
    items.forEach((i) => {
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

    doc.save(`devis-setup-paris-${Date.now()}.pdf`);
  };

  return (
    <div className="pt-24 md:pt-28 pb-16">
      <div className="container-x">
        <div className="section-num">— 05 — Devis</div>
        <h1 className="mt-3 font-display font-semibold text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight">
          {t("cart.title")}
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 text-center py-14 border border-dashed border-border rounded-2xl">
            <ShoppingBag className="size-12 text-muted-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">{t("cart.empty")}</p>
            <Link to="/catalogue" className="mt-6 inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition-colors">
              {t("cart.continue")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-10 items-start">
            {/* Items + form (left, 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const lt = lineTotal(item);
                  // Composite key: same productId can appear multiple times with
                  // different options/dates (cart deduplicates on a composite key).
                  const optsKey = (item.selectedOptions ?? []).map((o) => o.optionId).sort().join("|");
                  const lineKey = `${item.productId}¦${optsKey}¦${item.startDate ?? ""}¦${item.endDate ?? ""}¦${idx}`;
                  return (
                    <div key={lineKey} className="flex gap-4 p-4 rounded-lg border border-border bg-white">
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
                                    update(item.productId, { startDate: start, endDate: end, days });
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
                                {item.configuratorRecapHtml ? (
                                  <div
                                    className="text-[11px] leading-snug text-foreground/80 [&_*]:max-w-full"
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{ __html: item.configuratorRecapHtml }}
                                  />
                                ) : (
                                  <pre className="whitespace-pre-wrap text-[11px] leading-snug text-foreground/80 font-mono">
                                    {item.configuratorRecap}
                                  </pre>
                                )}
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
                          <button onClick={() => remove(item.productId)} className="text-muted-foreground hover:text-destructive p-1" aria-label={t("cart.remove")}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button onClick={() => update(item.productId, { quantity: Math.max(1, item.quantity - 1) })} className="p-1.5 hover:bg-secondary"><Minus className="size-3.5" /></button>
                            <div className="w-10 text-center text-sm">{item.quantity}</div>
                            <button onClick={() => update(item.productId, { quantity: item.quantity + 1 })} className="p-1.5 hover:bg-secondary"><Plus className="size-3.5" /></button>
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

              <form onSubmit={handleSubmit} className="rounded-2xl border border-border p-6 bg-white space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
                  <Input label={t("cart.deliveryTime")} type="time" value={form.delivery_time} onChange={(v) => setForm({ ...form, delivery_time: v })} />
                  <Input label={t("cart.pickupTime")} type="time" value={form.pickup_time} onChange={(v) => setForm({ ...form, pickup_time: v })} />
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">{t("cart.timesHint")}</p>
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-lg px-5 py-3 text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {submitting ? "…" : t("cart.submit")}
                </button>
              </form>
            </div>

            {/* Summary (right, sticky) */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border p-6 bg-white space-y-2 text-sm">
                <div className="font-display font-semibold text-lg mb-3">{t("cart.totals")}</div>
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
