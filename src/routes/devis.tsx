import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, FileDown, ShoppingBag, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, pickLang } from "@/lib/i18n";
import { useCart, lineTotal, volumeDiscount } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/site/ProductImage";
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
  const [form, setForm] = useState({
    customer_name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
    event_date: "",
    event_location: "",
  });

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
  const delivery = items.length > 0 ? 100 + items.length * 50 : 0;
  const netWithDelivery = totals.net + delivery;
  const vat = netWithDelivery * 0.2;
  const ttc = netWithDelivery + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    const payload = {
      ...form,
      event_date: form.event_date || null,
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
        };
      }),
      subtotal_ht: totals.gross,
      total_ht: netWithDelivery,
      delivery_fee: delivery,
      vat,
      total_ttc: ttc,
      total_deposit: totals.deposit,
      status: "pending",
    };

    const { delivery_fee: _df, ...dbPayload } = payload;
    const { error } = await supabase.from("quote_requests").insert(dbPayload);
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
    setForm({ customer_name: "", company: "", email: "", phone: "", message: "", event_date: "", event_location: "" });
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
    doc.text(lang === "fr" ? "Simulation de devis" : "Quote simulation", 14, 27);
    doc.text(new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB"), 196, 20, { align: "right" });

    autoTable(doc, {
      startY: 35,
      head: [[
        lang === "fr" ? "Produit" : "Product",
        lang === "fr" ? "Qté" : "Qty",
        lang === "fr" ? "Jours" : "Days",
        lang === "fr" ? "PU/jour" : "Unit/day",
        lang === "fr" ? "Remise" : "Discount",
        "Total HT",
      ]],
      body: items.map((i) => {
        const lt = lineTotal(i);
        return [
          pickLang(i, "name", lang),
          i.quantity,
          i.days,
          formatPrice(i.price_day, lang),
          lt.discount > 0 ? `-${formatPrice(lt.discount, lang)}` : "—",
          formatPrice(lt.net, lang),
        ];
      }),
      headStyles: { fillColor: [26, 26, 26] },
      styles: { fontSize: 9 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`${t("cart.subtotalHT")}: ${formatPrice(totals.gross, lang)}`, 196, finalY, { align: "right" });
    doc.text(`${t("cart.delivery")}: ${formatPrice(delivery, lang)}`, 196, finalY + 6, { align: "right" });
    doc.text(`${t("cart.totalHT")}: ${formatPrice(netWithDelivery, lang)}`, 196, finalY + 12, { align: "right" });
    doc.text(`${t("cart.vat")}: ${formatPrice(vat, lang)}`, 196, finalY + 18, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`${t("cart.totalTTC")}: ${formatPrice(ttc, lang)}`, 196, finalY + 26, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${t("cart.deposits")}: ${formatPrice(totals.deposit, lang)}`, 196, finalY + 34, { align: "right" });

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
          <div className="mt-8 grid lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const lt = lineTotal(item);
                return (
                  <div key={item.productId} className="flex gap-4 p-4 rounded-lg border border-border bg-white">
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
                          {item.startDate && item.endDate && (
                            <div className="text-xs text-muted-foreground">{item.startDate} → {item.endDate}</div>
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
                          {volumeDiscount(item.quantity) > 0 && (
                            <div className="text-[11px] text-accent">-{Math.round(volumeDiscount(item.quantity) * 100)}%</div>
                          )}
                          <div className="font-semibold">{formatPrice(lt.net, lang)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary + form */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border p-6 bg-white space-y-2 text-sm">
                <div className="font-display font-semibold text-lg mb-3">{t("cart.totals")}</div>
                <Row label={t("cart.subtotalHT")} value={formatPrice(totals.gross, lang)} />
                {totals.discount > 0 && <Row label={t("product.discount")} value={`-${formatPrice(totals.discount, lang)}`} highlight />}
                <div>
                  <Row label={t("cart.delivery")} value={formatPrice(delivery, lang)} />
                  <div className="text-[11px] text-muted-foreground">{t("cart.deliveryNote")}</div>
                </div>
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
                <div>
                  <label className="text-xs text-muted-foreground">{t("cart.message")}</label>
                  <textarea
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
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}{required && " *"}</label>
      <input
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
