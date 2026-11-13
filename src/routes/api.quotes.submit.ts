import { SITE_URL } from "@/lib/seo";
import { splitNonChiffre, stripRecapHeader } from "@/lib/chiffrage-split";
import { createFileRoute } from "@tanstack/react-router";
import {
  computeLine,
  computeTotals,
  DEFAULT_QUANTITY_DISCOUNTS,
  LOGISTICS_KEYS,
  logisticsFromSettings,
  type DurationDiscountTier,
  type LineResult,
  type QuantityDiscountTier,
  type Totals,
} from "@/lib/pricing";
import { getPiece, THUMB_PREFIX, configLink } from "@/lib/sur-mesure";

/* ------------------------------------------------------------------ */
/* Input validation — the browser sends NO prices, totals, HTML or URL */
/* ------------------------------------------------------------------ */

import { PayloadSchema, isCustomItem, type CustomItem, type RentalItem, type Payload } from "@/lib/quote-schema";

const MAX_THUMB_BYTES = 120 * 1024;
/** Decodes a JPEG data URL; returns bytes only if it is a real JPEG under the size cap. */
function decodeThumbnail(dataUrl: string): Uint8Array | null {
  if (!dataUrl.startsWith(THUMB_PREFIX)) return null;
  let bin: string;
  try {
    bin = atob(dataUrl.slice(THUMB_PREFIX.length));
  } catch {
    return null;
  }
  if (bin.length === 0 || bin.length >= MAX_THUMB_BYTES) return null;
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null;
  return bytes;
}


/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const DEFAULT_ADMIN_EMAIL = "devis@setup.paris,smart@setup.paris";
const DEFAULT_FROM = "Setup Paris <devis@setup.paris>";
const CLIENT_REPLY_TO = "devis@setup.paris";

/** Short readable status from a Resend error body: failed:<code>:<message> (≤120 chars). */
function resendFailure(status: number, body: string): string {
  let msg = body;
  try {
    const j = JSON.parse(body) as { message?: unknown; name?: unknown };
    if (typeof j.message === "string") msg = j.message;
    else if (typeof j.name === "string") msg = j.name;
  } catch {
    /* keep raw text */
  }
  msg = msg.replace(/\s+/g, " ").trim() || "unknown";
  return `failed:${status}:${msg}`.slice(0, 120);
}
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const json = (body: unknown, status = 200) => Response.json(body, { status });

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const fmtDate = (s: string) => {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const daysBetweenInclusive = (start: string, end: string) =>
  Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000) + 1;

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(request: Request) {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim() || "unknown";
  return "unknown";
}

const asTiers = <T,>(v: unknown): T[] | undefined => (Array.isArray(v) ? (v as T[]) : undefined);

interface StoredOption {
  categoryName_fr: string;
  categoryName_en: string;
  name_fr: string;
  name_en: string;
  price: number;
  line_total: number;
}

interface StoredItem {
  productId: string;
  line_id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  quantity: number;
  days: number;
  price_day: number;
  deposit: number;
  startDate: string | null;
  endDate: string | null;
  line_gross: number;
  line_discount: number;
  line_net: number;
  line_deposit: number;
  options: StoredOption[];
  option_ids: string[];
  options_per_unit_per_day: number;
  options_total: number;
  configurator_recap: string | null;
  configurator_data: Record<string, unknown> | null;
  configurator_recap_html: null;
  logo_url: string | null;
  logo_filename: string | null;
  /** Event pricing breakdown (products with price_event). */
  pricing_model?: "event";
  price_event?: number;
  event_days_included?: number;
  extra_days?: number;
  price_extra_day?: number;
  extra_total?: number;
  custom_label_fr?: string | null;
  custom_label_en?: string | null;
  custom_unit?: number;
  custom_total?: number;
}

interface StoredCustom {
  kind: "custom";
  line_id: string;
  productId: null;
  slug: string;
  name_fr: string;
  name_en: string;
  quantity: number;
  custom_ref: string;
  custom_config_id: string;
  configurator_recap: string;
  custom_alerts: string[];
  custom_weight_kg: number | null;
  resume_url: string | null;
  line_net: 0;
  line_gross: 0;
  line_discount: 0;
  line_deposit: 0;
  price_day: 0;
  days: 1;
}

type MailLang = "fr" | "en";
/** FR/EN pick for client-facing blocks; the internal mail is always French. */
const tr = (lang: MailLang, fr: string, en: string) => (lang === "en" ? en : fr);
/** French puts a space before ":"; English does not. */
const colon = (lang: MailLang) => (lang === "en" ? ":" : " :");

const AFTER_EVENT_EN: Record<string, string> = {
  keep: "You keep the piece",
  pickup: "Collected by Setup Paris",
  discuss: "To be discussed",
};

const AFTER_EVENT_FR: Record<string, string> = {
  keep: "Le client garde la pièce",
  pickup: "Reprise par Setup Paris",
  discuss: "À discuter",
};

type InternalEstimate =
  | { ok: true; unite_ht: number; total_ht: number; incomplet: boolean; lignes: Array<{ poste: string; detail: string; montant: number }>; non_chiffre: string[] }
  | { ok: false };

const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const listBlock = (title: string, items: string[]) =>
  items.length ? `<div style="margin-top:6px;">${title} :<ul style="margin:2px 0 0 18px;padding:0;">${items.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul></div>` : "";

/** INTERNAL ONLY — rendered in the admin mail, never in the client mail or any response. */
function estimateBlock(e: InternalEstimate | undefined) {
  if (!e) return "";
  if (!e.ok || e.incomplet) {
    return `<div style="margin-top:8px;font-size:12px;color:#7a5b00;background:#f4f4f5;padding:8px;border-radius:6px;">Chiffrage automatique partiel ou indisponible</div>`;
  }
  const split = splitNonChiffre(e.non_chiffre);
  const rows = e.lignes
    .map((l) => `<tr><td style="padding:2px 6px 2px 0;">${escapeHtml(l.poste)}</td><td style="padding:2px 6px;color:#666;">${escapeHtml(l.detail)}</td><td style="padding:2px 0;text-align:right;white-space:nowrap;">${eur(l.montant)}</td></tr>`)
    .join("");
  return `<div style="margin-top:8px;font-size:12px;background:#f4f4f5;padding:8px;border-radius:6px;">
    <strong>Estimation interne automatique : ${eur(e.unite_ht)} HT l'unité, ${eur(e.total_ht)} HT au total — temps non validés par l'atelier, hors postes non chiffrés</strong>
    <table style="width:100%;border-collapse:collapse;margin-top:6px;font-size:11px;">${rows}</table>
    ${listBlock("Postes non chiffrés", split.postes)}
    ${listBlock("À noter", split.notes)}
  </div>`;
}

function customBlock(p: Payload, customs: StoredCustom[], estimates?: Map<string, InternalEstimate>, lang: MailLang = "fr") {
  if (!customs.length) return "";
  const rows = customs
    .map(
      (c) => `
      <div style="border:1px solid #eee;border-radius:8px;padding:12px;margin:8px 0;">
        <div style="font-weight:600;">${escapeHtml(lang === "en" ? c.name_en : c.name_fr)} × ${c.quantity}</div>
        <div style="font-size:12px;color:#666;">${tr(lang, "Référence", "Reference")}${colon(lang)} ${escapeHtml(c.custom_ref)}${c.custom_weight_kg != null ? ` — ${tr(lang, "Poids estimé", "Estimated weight")}${colon(lang)} ${escapeHtml(String(c.custom_weight_kg))} kg` : ""}</div>
        ${stripRecapHeader(c.configurator_recap || "") ? `<pre style="margin:8px 0 0;font-family:ui-monospace,Menlo,Monaco,monospace;font-size:12px;color:#444;white-space:pre-wrap;background:#fffbe6;padding:8px;border-radius:6px;">${escapeHtml(stripRecapHeader(c.configurator_recap))}</pre>` : ""}
        ${c.resume_url ? `<div style="margin-top:8px;font-size:12px;"><a href="${escapeHtml(c.resume_url)}" style="color:#1d4ed8;">${tr(lang, "Reprendre / partager cette configuration", "Resume / share this configuration")}</a></div>` : ""}
        ${c.custom_alerts.length ? `<div style="margin-top:8px;font-size:12px;"><strong>Points à vérifier par le bureau d'études :</strong><ul style="margin:4px 0 0 18px;padding:0;">${c.custom_alerts.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul></div>` : ""}
        ${estimates ? estimateBlock(estimates.get(c.custom_config_id)) : ""}
        ${estimates ? `<div style="margin-top:8px;font-size:12px;"><a href="${escapeHtml(`${SITE_URL}/admin/chiffrage?config_id=${encodeURIComponent(c.custom_config_id)}`)}" style="color:#1d4ed8;">Ouvrir dans le chiffrage</a></div>` : ""}
      </div>`,
    )
    .join("");
  return `
    <h2 style="font-size:16px;margin:24px 0 8px;">${tr(lang, "Fabrication sur mesure", "Custom-made production")}</h2>
    ${rows}
    <div style="font-size:13px;line-height:1.7;margin-top:8px;">
      ${p.custom_delivery_date ? `${tr(lang, "Date de livraison souhaitée", "Preferred delivery date")}${colon(lang)} <strong>${escapeHtml(fmtDate(p.custom_delivery_date))}</strong><br/>` : ""}
      ${p.custom_after_event ? `${tr(lang, "Après l'événement", "After the event")}${colon(lang)} <strong>${escapeHtml((lang === "en" ? AFTER_EVENT_EN : AFTER_EVENT_FR)[p.custom_after_event] ?? p.custom_after_event)}</strong><br/>` : ""}
      ${p.wants_samples ? `${tr(lang, "Échantillons / nuancier demandés", "Samples / colour chart requested")}${colon(lang)} <strong>${tr(lang, "Oui", "Yes")}</strong>` : ""}
    </div>
    ${estimates ? `<p style="font-size:13px;color:#a07c00;font-weight:600;">Prix et délai de fabrication confirmés sous 48 h ouvrées.</p>` : ""}`;
}

function rentalBlock(items: StoredItem[], t: Totals, lang: MailLang = "fr") {
  if (!items.length) return `<p style="font-size:14px;color:#555;">${tr(lang, "Votre demande sera chiffrée par notre équipe.", "Our team will price your request.")}</p>`;
  return `<h2 style="font-size:16px;margin:24px 0 8px;">${tr(lang, "Location", "Rental")}</h2>${itemsTable(items, lang)}${totalsBlock(t, lang)}`;
}

/* ------------------------------------------------------------------ */
/* Emails — built ONLY from server-recomputed data, everything escaped */
/* ------------------------------------------------------------------ */

function itemsTable(items: StoredItem[], lang: MailLang = "fr") {
  const rows = items
    .map((i) => {
      const datesRow =
        i.startDate && i.endDate
          ? `<tr><td colspan="5" style="padding:2px 8px 6px 24px;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${i.startDate === i.endDate ? `${tr(lang, "Le", "On")} ${escapeHtml(fmtDate(i.startDate))}` : `${tr(lang, "Du", "From")} ${escapeHtml(fmtDate(i.startDate))} ${tr(lang, "au", "to")} ${escapeHtml(fmtDate(i.endDate))}`}</td></tr>`
          : "";
      const optionsRows = i.options
        .map(
          (o) => `
        <tr>
          <td colspan="4" style="padding:4px 8px 4px 24px;border-bottom:1px solid #f5f5f5;color:#666;font-size:13px;">
            • <strong style="color:#1a1a1a;">${escapeHtml(lang === "en" ? o.categoryName_en || o.categoryName_fr : o.categoryName_fr)}${colon(lang)}</strong> ${escapeHtml(lang === "en" ? o.name_en || o.name_fr : o.name_fr)}
          </td>
          <td style="padding:4px 8px;border-bottom:1px solid #f5f5f5;text-align:right;color:#666;font-size:13px;">
            ${o.price > 0 ? `+${fmt(o.price)}` : tr(lang, "inclus", "included")}
          </td>
        </tr>`,
        )
        .join("");
      const evRows =
        i.pricing_model === "event"
          ? `<tr><td colspan="4" style="padding:2px 8px 4px 24px;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${tr(lang, "Prix événement", "Event price")} (${tr(lang, "jusqu'à", "up to")} ${i.event_days_included} ${tr(lang, "jours", "days")})${colon(lang)} ${fmt(i.price_event ?? 0)} × ${i.quantity}</td><td style="padding:2px 8px;text-align:right;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${fmt((i.price_event ?? 0) * i.quantity)}</td></tr>`
            + ((i.extra_days ?? 0) > 0 ? `<tr><td colspan="4" style="padding:2px 8px 4px 24px;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${tr(lang, "Jours supplémentaires", "Extra days")}${colon(lang)} ${i.extra_days} × ${fmt(i.price_extra_day ?? 0)} × ${i.quantity}</td><td style="padding:2px 8px;text-align:right;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${fmt(i.extra_total ?? 0)}</td></tr>` : "")
            + ((i.custom_unit ?? 0) > 0 ? `<tr><td colspan="4" style="padding:2px 8px 4px 24px;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${tr(lang, "Personnalisation", "Customisation")}${colon(lang)} ${escapeHtml((lang === "en" ? i.custom_label_en || i.custom_label_fr : i.custom_label_fr) || "")} — ${fmt(i.custom_unit ?? 0)} × ${i.quantity}</td><td style="padding:2px 8px;text-align:right;color:#666;font-size:12px;border-bottom:1px solid #f5f5f5;">${fmt(i.custom_total ?? 0)}</td></tr>` : "")
          : "";
      const discountRow =
        i.line_discount > 0
          ? `<tr><td colspan="4" style="padding:2px 8px 4px 24px;color:#a07c00;font-size:12px;border-bottom:1px solid #f5f5f5;">${tr(lang, "Remise", "Discount")}</td><td style="padding:2px 8px;text-align:right;color:#a07c00;font-size:12px;border-bottom:1px solid #f5f5f5;">−${fmt(i.line_discount)}</td></tr>`
          : "";
      const recapRow = i.configurator_recap
        ? `
        <tr>
          <td colspan="5" style="padding:8px 12px 12px 24px;border-bottom:1px solid #f5f5f5;background:#fffbe6;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#a07c00;font-weight:600;margin-bottom:4px;">✦ Configuration 3D</div>
            <pre style="margin:0;font-family:ui-monospace,Menlo,Monaco,monospace;font-size:12px;color:#444;white-space:pre-wrap;">${escapeHtml(i.configurator_recap)}</pre>
          </td>
        </tr>`
        : "";
      const logoRow = i.logo_url
        ? `
        <tr>
          <td colspan="5" style="padding:8px 12px 12px 24px;border-bottom:1px solid #f5f5f5;background:#eef6ff;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#1d4ed8;font-weight:600;margin-bottom:4px;">📎 ${tr(lang, "Logo client", "Client logo")}</div>
            <a href="${escapeHtml(i.logo_url)}" target="_blank" rel="noreferrer" style="font-size:13px;color:#1d4ed8;word-break:break-all;">
              ${escapeHtml(i.logo_filename || tr(lang, "Télécharger le logo", "Download the logo"))}
            </a>
          </td>
        </tr>`
        : "";
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(lang === "en" ? i.name_en || i.name_fr : i.name_fr)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.days}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${i.pricing_model === "event" ? `${fmt(i.price_event ?? 0)} ${tr(lang, "/ évén.", "/ event")}` : fmt(i.price_day)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${fmt(i.line_net)}</td>
        </tr>
        ${datesRow}${evRows}${optionsRows}${discountRow}${recapRow}${logoRow}`;
    })
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">${tr(lang, "Produit", "Product")}</th>
          <th style="padding:8px;text-align:center;">${tr(lang, "Qté", "Qty")}</th>
          <th style="padding:8px;text-align:center;">${tr(lang, "Jours", "Days")}</th>
          <th style="padding:8px;text-align:right;">${tr(lang, "PU/jour", "Unit/day")}</th>
          <th style="padding:8px;text-align:right;">${tr(lang, "Total HT", "Total excl. VAT")}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(t: Totals, lang: MailLang = "fr") {
  const r = (label: string, v: string, extra = "") =>
    `<tr><td style="padding:4px 12px;color:#666;${extra}">${label}</td><td style="padding:4px 0;text-align:right;${extra}">${v}</td></tr>`;
  return `
    <table style="margin-left:auto;font-size:14px;">
      ${r(tr(lang, "Sous-total produits HT", "Products subtotal excl. VAT"), fmt(t.subtotal_ht))}
      ${t.discount_total > 0 ? r(tr(lang, "Remise", "Discount"), `−${fmt(t.discount_total)}`) : ""}
      ${t.delivery_fee > 0 ? r(tr(lang, "Livraison", "Delivery"), fmt(t.delivery_fee)) : ""}
      ${t.setup_fee > 0 ? r(tr(lang, "Installation", "Setup"), fmt(t.setup_fee)) : ""}
      ${t.pickup_fee > 0 ? r(tr(lang, "Reprise", "Pickup"), fmt(t.pickup_fee)) : ""}
      ${r(tr(lang, "Total HT", "Total excl. VAT"), fmt(t.total_ht))}
      ${r(tr(lang, "TVA 20%", "VAT 20%"), fmt(t.vat))}
      <tr><td style="padding:8px 12px;font-weight:700;border-top:2px solid #1a1a1a;">${tr(lang, "Total TTC", "Total incl. VAT")}</td><td style="padding:8px 0;text-align:right;font-weight:700;border-top:2px solid #1a1a1a;">${fmt(t.total_ttc)}</td></tr>
      ${r(tr(lang, "Caution, non incluse dans le total", "Deposit, not included in the total"), fmt(t.total_deposit), "font-size:12px;")}
    </table>`;
}

function adminEmail(p: Payload, number: string, items: StoredItem[], t: Totals, customs: StoredCustom[], estimates: Map<string, InternalEstimate>) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a;">
      <h1 style="font-size:20px;margin:0 0 16px;">Nouvelle demande de devis ${escapeHtml(number)} <span style="font-size:13px;font-weight:600;background:#eef2ff;color:#1d4ed8;padding:2px 8px;border-radius:999px;vertical-align:middle;">${items.length && customs.length ? "Mixte" : customs.length ? "Sur mesure" : "Location"}</span></h1>
      <div style="background:#f9f9f9;padding:16px;border-radius:8px;font-size:14px;line-height:1.6;">
        <strong>${escapeHtml(p.customer_name)}</strong>${p.company ? ` — ${escapeHtml(p.company)}` : ""}<br/>
        Email : <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a><br/>
        ${p.phone ? `Téléphone : <a href="tel:${escapeHtml(p.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(p.phone)}</a><br/>` : ""}
        ${customs.length && p.custom_delivery_date ? `Livraison souhaitée : <strong>${escapeHtml(fmtDate(p.custom_delivery_date))}</strong><br/>` : ""}
        ${customs.length && p.custom_after_event ? `Après l'événement : <strong>${escapeHtml(AFTER_EVENT_FR[p.custom_after_event] ?? p.custom_after_event)}</strong><br/>` : ""}
        ${p.event_date ? `Date événement : ${escapeHtml(fmtDate(p.event_date))}<br/>` : ""}
        ${p.event_location ? `Lieu : ${escapeHtml(p.event_location)}<br/>` : ""}
        ${p.delivery_time ? `Créneau livraison : <strong>${escapeHtml(p.delivery_time)}</strong><br/>` : ""}
        ${p.pickup_time ? `Créneau reprise : <strong>${escapeHtml(p.pickup_time)}</strong><br/>` : ""}
      </div>
      ${p.message ? `<div style="margin-top:16px;padding:12px;background:#fffbe6;border-left:3px solid #f0c000;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.message)}</div>` : ""}
      ${rentalBlock(items, t)}
      ${customBlock(p, customs, estimates)}
      <p style="margin-top:24px;font-size:12px;color:#999;"><a href="${SITE_URL}/admin/devis" style="color:#1d4ed8;">Connectez-vous à l'admin pour répondre à cette demande.</a></p>
    </div>`;
}

/** « Bonjour Prénom, » when the first word looks like a first name, else « Bonjour, ». */
function greeting(name: string, lang: MailLang = "fr"): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const hello = tr(lang, "Bonjour", "Hello");
  return /^\p{L}{2,20}$/u.test(first) ? `${hello} ${escapeHtml(first)},` : `${hello},`;
}

function clientEmail(p: Payload, number: string, items: StoredItem[], t: Totals, customs: StoredCustom[]) {
  const lang: MailLang = p.lang === "en" ? "en" : "fr";
  const c = colon(lang);
  return `
    <div lang="${lang}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a;">
      <h1 style="font-size:22px;margin:0 0 8px;">${greeting(p.customer_name, lang)}</h1>
      <p style="font-size:14px;line-height:1.6;color:#555;margin:0;">${tr(lang, "Merci pour votre demande.", "Thank you for your request.")}</p>
      <p style="font-size:14px;line-height:1.6;color:#555;">
        ${tr(lang, "Nous avons bien reçu votre demande de devis", "We have received your quote request")} <strong>${escapeHtml(number)}</strong>. ${items.length ? tr(lang, "Notre équipe revient vers vous sous 24 h ouvrées avec une proposition personnalisée.", "Our team will get back to you within one business day with a tailored proposal.") : ""}
        ${customs.length ? tr(lang, "Pour le sur-mesure : prix et délai de fabrication confirmés sous 48 h ouvrées.", "Custom-made: price and production time confirmed within two business days.") : ""}
      </p>
      ${(p.delivery_time || p.pickup_time || p.event_date || p.event_location) ? `
      <div style="margin-top:16px;padding:14px 16px;background:#f9f9f9;border-radius:8px;font-size:14px;line-height:1.7;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#666;font-weight:600;margin-bottom:6px;">${tr(lang, "Logistique", "Logistics")}</div>
        ${p.event_date ? `${tr(lang, "Date événement", "Event date")}${c} <strong>${escapeHtml(fmtDate(p.event_date))}</strong><br/>` : ""}
        ${p.event_location ? `${tr(lang, "Lieu", "Venue")}${c} <strong>${escapeHtml(p.event_location)}</strong><br/>` : ""}
        ${p.delivery_time ? `${tr(lang, "Créneau livraison souhaité", "Preferred delivery slot")}${c} <strong>${escapeHtml(p.delivery_time)}</strong><br/>` : ""}
        ${p.pickup_time ? `${tr(lang, "Créneau reprise souhaité", "Preferred pickup slot")}${c} <strong>${escapeHtml(p.pickup_time)}</strong><br/>` : ""}
      </div>` : ""}
      <h2 style="font-size:16px;margin:24px 0 8px;">${tr(lang, "Récapitulatif de votre demande", "Summary of your request")} ${escapeHtml(number)}</h2>
      ${rentalBlock(items, t, lang)}
      ${customBlock(p, customs, undefined, lang)}
      ${items.length ? `<p style="margin-top:24px;font-size:13px;color:#666;">${tr(lang, "Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis.<br/>Estimation indicative. Le devis final dépend des disponibilités et de la logistique.", "Delivery, setup and pickup: indicative flat fee for Paris & Île-de-France, confirmed in the quote.<br/>Indicative estimate. The final quote depends on availability and logistics.")}</p>` : ""}
      ${customs.length ? `<p style="margin-top:8px;font-size:13px;color:#666;">${tr(lang, "Livraison et pose du sur-mesure : sur devis.", "Delivery and installation of custom pieces: on quote.")}</p>` : ""}
      <p style="margin-top:24px;font-size:14px;">${tr(lang, "— L'équipe Setup Paris", "— The Setup Paris team")}</p>
    </div>`;
}

async function sendEmail(args: { to: string[]; subject: string; html: string; replyTo?: string }): Promise<string> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return "failed:no_key";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || DEFAULT_FROM,
        to: args.to,
        subject: args.subject,
        html: args.html,
        reply_to: args.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[quotes/submit] Resend failed [${res.status}]: ${body}`);
      return resendFailure(res.status, body);
    }
    return "sent";
  } catch (err) {
    console.error("[quotes/submit] Resend network error", err);
    return "failed:network";
  }
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/api/quotes/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          let raw: unknown;
          try {
            raw = await request.json();
          } catch {
            return json({ error: "invalid_json" }, 400);
          }
          const parsed = PayloadSchema.safeParse(raw);
          if (!parsed.success) {
            return json({ error: "invalid_payload", fields: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
          }
          const p = parsed.data;
          const rentalItems = p.items.filter((i): i is RentalItem => !isCustomItem(i));
          const customItems = p.items.filter(isCustomItem);
          const thumbs = new Map<string, Uint8Array>();
          const badThumbs: string[] = [];
          for (const c of customItems) {
            if (!c.thumbnail) continue;
            const bytes = decodeThumbnail(c.thumbnail);
            if (bytes) thumbs.set(c.line_id, bytes);
            else badThumbs.push(c.line_id);
          }
          if (badThumbs.length) return json({ error: "invalid_thumbnail", lines: badThumbs }, 400);
          if (new Set(customItems.map((c) => c.line_id)).size !== customItems.length) {
            return json({ error: "invalid_payload", fields: ["items.line_id"] }, 400);
          }

          // 2. Honeypot
          if (p.website && p.website.trim() !== "") return json({ ok: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // 3. Rate limit
          const ipHash = await sha256Hex(`${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}:${clientIp(request)}`);
          const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
          const { count, error: rlErr } = await supabaseAdmin
            .from("submit_attempts")
            .select("id", { count: "exact", head: true })
            .eq("ip_hash", ipHash)
            .gte("created_at", since);
          if (rlErr) console.error("[quotes/submit] rate-limit read failed", rlErr);
          if ((count ?? 0) >= RATE_LIMIT_MAX) return json({ error: "rate_limited" }, 429);
          const { error: attErr } = await supabaseAdmin.from("submit_attempts").insert({ ip_hash: ipHash });
          if (attErr) console.error("[quotes/submit] rate-limit insert failed", attErr);

          // 4. Turnstile (only when configured)
          const tsSecret = process.env.TURNSTILE_SECRET_KEY;
          if (tsSecret) {
            if (!p.turnstile_token) return json({ error: "captcha" }, 400);
            const form = new FormData();
            form.append("secret", tsSecret);
            form.append("response", p.turnstile_token);
            const ip = clientIp(request);
            if (ip !== "unknown") form.append("remoteip", ip);
            const tsRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
            const tsBody = (await tsRes.json().catch(() => ({}))) as { success?: boolean };
            if (!tsBody.success) return json({ error: "captcha" }, 400);
          }

          // 5. Read products, options and logistics from DB
          const productIds = [...new Set(rentalItems.map((i) => i.productId))];
          const { data: products, error: prodErr } = productIds.length
            ? await supabaseAdmin
                .from("products")
                .select("id,slug,name_fr,name_en,price_day,deposit,quantity_discounts,duration_discounts,is_active,price_event,event_days_included,price_extra_day,custom_label_fr,custom_label_en,custom_price")
                .in("id", productIds)
                .eq("is_active", true)
            : { data: [], error: null };
          if (prodErr) throw prodErr;
          const productMap = new Map((products ?? []).map((pr) => [pr.id, pr]));
          const unknownLines = rentalItems.filter((i) => !productMap.has(i.productId)).map((i) => i.line_id);
          if (unknownLines.length) return json({ error: "unknown_product", lines: unknownLines }, 400);

          const optionIds = [...new Set(rentalItems.flatMap((i) => i.option_ids))];
          const optionMap = new Map<string, { id: string; name_fr: string; name_en: string; price: number; product_id: string; cat_fr: string; cat_en: string }>();
          if (optionIds.length) {
            const { data: opts, error: optErr } = await supabaseAdmin
              .from("product_options")
              .select("id,name_fr,name_en,price,is_active,product_option_categories!inner(product_id,name_fr,name_en)")
              .in("id", optionIds)
              .eq("is_active", true);
            if (optErr) throw optErr;
            for (const o of opts ?? []) {
              const cat = (Array.isArray(o.product_option_categories) ? o.product_option_categories[0] : o.product_option_categories) as
                | { product_id: string; name_fr: string; name_en: string }
                | undefined;
              if (!cat) continue;
              optionMap.set(o.id, {
                id: o.id,
                name_fr: o.name_fr,
                name_en: o.name_en,
                price: Number(o.price) || 0,
                product_id: cat.product_id,
                cat_fr: cat.name_fr,
                cat_en: cat.name_en,
              });
            }
          }
          const badOptionLines = rentalItems
            .filter((i) => i.option_ids.some((id) => optionMap.get(id)?.product_id !== i.productId))
            .map((i) => i.line_id);
          if (badOptionLines.length) return json({ error: "invalid_option", lines: badOptionLines }, 400);

          const { data: settings, error: setErr } = await supabaseAdmin
            .from("site_settings")
            .select("key,value_fr")
            .in("key", Object.values(LOGISTICS_KEYS));
          if (setErr) throw setErr;
          const logistics = logisticsFromSettings(settings ?? []);

          // 6. Compute lines from DB prices
          const storageBase = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || process.env.SUPABASE_URL || "";
          const lineResults: LineResult[] = [];
          const storedItems: StoredItem[] = rentalItems.map((i) => {
            const pr = productMap.get(i.productId)!;
            const days = i.startDate && i.endDate ? daysBetweenInclusive(i.startDate, i.endDate) : i.days ?? 1;
            const opts = i.option_ids.map((id) => optionMap.get(id)!);
            const lr = computeLine({
              price_day: Number(pr.price_day) || 0,
              deposit: Number(pr.deposit) || 0,
              quantity: i.quantity,
              days,
              optionPrices: opts.map((o) => o.price),
              quantityDiscounts: asTiers<QuantityDiscountTier>(pr.quantity_discounts) ?? DEFAULT_QUANTITY_DISCOUNTS,
              durationDiscounts: asTiers<DurationDiscountTier>(pr.duration_discounts) ?? [],
              priceEvent: pr.price_event == null ? null : Number(pr.price_event),
              eventDaysIncluded: pr.event_days_included,
              priceExtraDay: pr.price_extra_day == null ? null : Number(pr.price_extra_day),
              customPrice: pr.custom_price == null ? null : Number(pr.custom_price),
              customChosen: !!i.custom_chosen,
            });
            const ev = lr.event;
            lineResults.push(lr);
            const logo_url =
              i.logo_path && storageBase
                ? `${storageBase}/storage/v1/object/public/quote-uploads/${i.logo_path.split("/").map(encodeURIComponent).join("/")}`
                : null;
            return {
              productId: pr.id,
              line_id: i.line_id,
              slug: pr.slug,
              name_fr: pr.name_fr,
              name_en: pr.name_en,
              quantity: i.quantity,
              days,
              price_day: Number(pr.price_day) || 0,
              deposit: Number(pr.deposit) || 0,
              startDate: i.startDate ?? null,
              endDate: i.endDate ?? null,
              line_gross: lr.gross,
              line_discount: lr.discount,
              line_net: lr.net,
              line_deposit: lr.deposit,
              options: opts.map((o) => ({
                categoryName_fr: o.cat_fr,
                categoryName_en: o.cat_en,
                name_fr: o.name_fr,
                name_en: o.name_en,
                price: o.price,
                line_total: o.price * i.quantity,
              })),
              option_ids: i.option_ids,
              options_per_unit_per_day: lr.optionsPerUnit,
              options_total: lr.optionsTotal,
              configurator_recap: i.configurator_recap?.trim() || null,
              configurator_data: (i.configurator_data as Record<string, unknown> | null | undefined) ?? null,
              configurator_recap_html: null,
              logo_url,
              logo_filename: i.logo_filename ?? null,
              ...(ev
                ? {
                    pricing_model: "event" as const,
                    price_event: ev.priceEvent,
                    event_days_included: ev.daysIncluded,
                    extra_days: ev.extraDays,
                    price_extra_day: ev.priceExtraDay,
                    extra_total: ev.extraTotal,
                    custom_label_fr: ev.customUnit > 0 ? pr.custom_label_fr : null,
                    custom_label_en: ev.customUnit > 0 ? pr.custom_label_en : null,
                    custom_unit: ev.customUnit,
                    custom_total: ev.customTotal,
                  }
                : {}),
            };
          });
          const totals = computeTotals(lineResults, logistics);

          // 7. Stock check (sum per product + date range)
          const groups = new Map<string, { productId: string; start: string; end: string; qty: number; lines: string[] }>();
          for (const i of rentalItems) {
            if (!i.startDate || !i.endDate) continue;
            const k = `${i.productId}|${i.startDate}|${i.endDate}`;
            const g = groups.get(k) ?? { productId: i.productId, start: i.startDate, end: i.endDate, qty: 0, lines: [] };
            g.qty += i.quantity;
            g.lines.push(i.line_id);
            groups.set(k, g);
          }
          // Lines of the same product on overlapping ranges also compete for stock.
          const stockIssues: Array<{ line_id: string; available: number }> = [];
          for (const g of groups.values()) {
            const { data, error } = await supabaseAdmin.rpc("get_available_stock", {
              _product_id: g.productId,
              _start_date: g.start,
              _end_date: g.end,
            });
            if (error) throw error;
            const available = Number(data) || 0;
            const overlapQty = rentalItems
              .filter((i) => i.productId === g.productId && i.startDate && i.endDate && i.startDate <= g.end && i.endDate >= g.start)
              .reduce((s, i) => s + i.quantity, 0);
            if (Math.max(g.qty, overlapQty) > available) g.lines.forEach((line_id) => stockIssues.push({ line_id, available }));
          }
          if (stockIssues.length) return json({ error: "stock", lines: stockIssues }, 409);

          // 8. Insert (custom lines carry no price and never enter totals)
          const quoteId = crypto.randomUUID();
          const storedCustoms: StoredCustom[] = customItems.map((c) => {
            const piece = getPiece(c.piece)!;
            return {
              kind: "custom",
              line_id: c.line_id,
              productId: null,
              slug: piece.k,
              name_fr: `${piece.nom} sur mesure`,
              name_en: `${piece.name_en} (custom-made)`,
              quantity: c.quantity,
              custom_ref: c.reference,
              custom_config_id: crypto.randomUUID(),
              configurator_recap: c.recap,
              custom_alerts: c.alerts,
              custom_weight_kg: c.weight_kg ?? null,
              resume_url: configLink(piece.k, c.configuration as Record<string, unknown>, SITE_URL, p.lang),
              line_net: 0,
              line_gross: 0,
              line_discount: 0,
              line_deposit: 0,
              price_day: 0,
              days: 1,
            };
          });
          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("quote_requests")
            .insert({
              id: quoteId,
              has_custom: storedCustoms.length > 0,
              custom_delivery_date: storedCustoms.length ? p.custom_delivery_date || null : null,
              custom_after_event: storedCustoms.length ? p.custom_after_event || null : null,
              wants_samples: storedCustoms.length ? !!p.wants_samples : false,
              customer_name: p.customer_name,
              company: p.company || null,
              email: p.email,
              phone: p.phone || null,
              message: p.message || null,
              event_date: p.event_date || null,
              event_location: p.event_location || null,
              delivery_time: p.delivery_time || null,
              pickup_time: p.pickup_time || null,
              items: [...storedItems, ...storedCustoms] as unknown as never,
              subtotal_ht: totals.subtotal_ht,
              discount_total: totals.discount_total,
              total_ht: totals.total_ht,
              delivery_fee: totals.delivery_fee,
              setup_fee: totals.setup_fee,
              pickup_fee: totals.pickup_fee,
              vat: totals.vat,
              total_ttc: totals.total_ttc,
              total_deposit: totals.total_deposit,
              status: "pending",
              source: "web",
            })
            .select("id,request_no")
            .single();
          if (insErr || !inserted) throw insErr ?? new Error("insert failed");
          const number = `W-${String(inserted.request_no).padStart(5, "0")}`;

          // 8b. Custom configs + private previews
          for (const [idx, c] of customItems.entries()) {
            const sc = storedCustoms[idx]!;
            let preview_path: string | null = null;
            const bytes = thumbs.get(c.line_id);
            if (bytes) {
              const path = `${inserted.id}/${c.line_id}.jpg`;
              const { error: upErr } = await supabaseAdmin.storage
                .from("custom-previews")
                .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
              if (upErr) console.error("[quotes/submit] preview upload failed", upErr);
              else preview_path = path;
            }
            const { error: ccErr } = await supabaseAdmin.from("custom_configs").insert({
              id: sc.custom_config_id,
              quote_id: inserted.id,
              line_id: c.line_id,
              ref: c.reference,
              piece: c.piece,
              config: c.configuration as never,
              quantity: c.quantity,
              weight_kg: c.weight_kg ?? null,
              alerts: c.alerts as never,
              recap: c.recap || null,
              preview_path,
            });
            if (ccErr) console.error("[quotes/submit] custom_configs insert failed", ccErr);
          }

          // 8c. Internal automatic estimate (server only; failures never block the request)
          const estimates = new Map<string, InternalEstimate>();
          if (customItems.length) {
            try {
              const { chiffrer } = await import("@/server/chiffrage.server.js");
              for (const [idx, c] of customItems.entries()) {
                const sc = storedCustoms[idx]!;
                try {
                  const r = chiffrer(c.configuration, { quantite: c.quantity });
                  if (!r.ok) {
                    estimates.set(sc.custom_config_id, { ok: false });
                    continue;
                  }
                  estimates.set(sc.custom_config_id, r);
                  const { error: eErr } = await supabaseAdmin
                    .from("custom_configs")
                    .update({
                      estimate_unit_ht: r.unite_ht,
                      estimate_total_ht: r.total_ht,
                      estimate_breakdown: r as never,
                      estimate_options: { quantite: c.quantity, hyp: {}, t0: r.t0 } as never,
                      estimate_at: new Date().toISOString(),
                      estimate_by: "auto",
                    })
                    .eq("id", sc.custom_config_id);
                  if (eErr) console.error("[quotes/submit] estimate save failed", eErr);
                } catch (e) {
                  console.error("[quotes/submit] estimate failed", e);
                  estimates.set(sc.custom_config_id, { ok: false });
                }
              }
            } catch (e) {
              console.error("[quotes/submit] estimate engine unavailable", e);
              for (const sc of storedCustoms) estimates.set(sc.custom_config_id, { ok: false });
            }
          }

          // 9. Emails (awaited, failures recorded but never fatal)
          const notifyTo = (process.env.QUOTE_NOTIFY_TO || DEFAULT_ADMIN_EMAIL)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const [adminStatus, clientStatus] = await Promise.all([
            sendEmail({
              to: notifyTo,
              subject: `${storedCustoms.length ? "[Sur mesure] " : ""}Nouvelle demande de devis ${number} — ${p.customer_name.replace(/[\r\n]+/g, " ")}`,
              html: adminEmail(p, number, storedItems, totals, storedCustoms, estimates),
              replyTo: p.email,
            }),
            sendEmail({
              to: [p.email],
              subject: p.lang === "en" ? `Your quote request ${number} — Setup Paris` : `Votre demande de devis ${number} — Setup Paris`,
              html: clientEmail(p, number, storedItems, totals, storedCustoms),
              replyTo: CLIENT_REPLY_TO,
            }),
          ]);
          const { error: updErr } = await supabaseAdmin
            .from("quote_requests")
            .update({ email_admin_status: adminStatus, email_client_status: clientStatus })
            .eq("id", inserted.id);
          if (updErr) console.error("[quotes/submit] email status update failed", updErr);

          return json({ ok: true, number, email: { admin: adminStatus === "sent", client: clientStatus === "sent" } });
        } catch (err) {
          console.error("[quotes/submit] unexpected error", err);
          return json({ error: "server_error" }, 500);
        }
      },
    },
  },
});
