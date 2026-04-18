import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const OptionSchema = z.object({
  categoryName_fr: z.string().max(200),
  categoryName_en: z.string().max(200),
  name_fr: z.string().max(200),
  name_en: z.string().max(200),
  price: z.number().min(0),
  line_total: z.number().min(0),
});

const ItemSchema = z.object({
  name_fr: z.string().max(300),
  name_en: z.string().max(300),
  quantity: z.number().int().min(1).max(10000),
  days: z.number().int().min(1).max(3650),
  price_day: z.number().min(0),
  line_net: z.number().min(0),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  options: z.array(OptionSchema).max(50).optional().default([]),
  options_total: z.number().min(0).optional().default(0),
});

const PayloadSchema = z.object({
  customer_name: z.string().min(1).max(200),
  company: z.string().max(200).optional().nullable(),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  event_date: z.string().nullable().optional(),
  event_location: z.string().max(500).optional().nullable(),
  items: z.array(ItemSchema).min(1).max(100),
  total_ht: z.number().min(0),
  delivery_fee: z.number().min(0).optional().default(0),
  setup_fee: z.number().min(0).optional().default(0),
  pickup_fee: z.number().min(0).optional().default(0),
  vat: z.number().min(0),
  total_ttc: z.number().min(0),
  total_deposit: z.number().min(0),
});

const ADMIN_EMAIL = "smart@setup.paris";
const FROM = "Setup Paris <onboarding@resend.dev>";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function itemsTable(items: z.infer<typeof ItemSchema>[]) {
  const rows = items
    .map((i) => {
      const optionsRows = (i.options ?? [])
        .map(
          (o) => `
        <tr>
          <td colspan="4" style="padding:4px 8px 4px 24px;border-bottom:1px solid #f5f5f5;color:#666;font-size:13px;">
            • <strong style="color:#1a1a1a;">${escapeHtml(o.categoryName_fr)}:</strong> ${escapeHtml(o.name_fr)}
          </td>
          <td style="padding:4px 8px;border-bottom:1px solid #f5f5f5;text-align:right;color:#666;font-size:13px;">
            ${o.price > 0 ? `+${fmt(o.price)}` : "—"}
          </td>
        </tr>`,
        )
        .join("");
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(i.name_fr)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.days}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${fmt(i.price_day)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${fmt(i.line_net)}</td>
        </tr>
        ${optionsRows}`;
    })
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin:12px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">Produit</th>
          <th style="padding:8px;text-align:center;">Qté</th>
          <th style="padding:8px;text-align:center;">Jours</th>
          <th style="padding:8px;text-align:right;">PU/jour</th>
          <th style="padding:8px;text-align:right;">Total HT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(p: z.infer<typeof PayloadSchema>) {
  return `
    <table style="margin-left:auto;font-size:14px;">
      ${p.delivery_fee > 0 ? `<tr><td style="padding:4px 12px;color:#666;">Livraison</td><td style="padding:4px 0;text-align:right;">${fmt(p.delivery_fee)}</td></tr>` : ""}
      ${p.setup_fee > 0 ? `<tr><td style="padding:4px 12px;color:#666;">Installation</td><td style="padding:4px 0;text-align:right;">${fmt(p.setup_fee)}</td></tr>` : ""}
      ${p.pickup_fee > 0 ? `<tr><td style="padding:4px 12px;color:#666;">Reprise</td><td style="padding:4px 0;text-align:right;">${fmt(p.pickup_fee)}</td></tr>` : ""}
      <tr><td style="padding:4px 12px;color:#666;">Total HT</td><td style="padding:4px 0;text-align:right;">${fmt(p.total_ht)}</td></tr>
      <tr><td style="padding:4px 12px;color:#666;">TVA 20%</td><td style="padding:4px 0;text-align:right;">${fmt(p.vat)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:700;border-top:2px solid #1a1a1a;">Total TTC</td><td style="padding:8px 0;text-align:right;font-weight:700;border-top:2px solid #1a1a1a;">${fmt(p.total_ttc)}</td></tr>
      <tr><td style="padding:4px 12px;color:#666;font-size:12px;">Caution</td><td style="padding:4px 0;text-align:right;color:#666;font-size:12px;">${fmt(p.total_deposit)}</td></tr>
    </table>`;
}

function adminEmail(p: z.infer<typeof PayloadSchema>) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a;">
      <h1 style="font-size:20px;margin:0 0 16px;">Nouvelle demande de devis</h1>
      <div style="background:#f9f9f9;padding:16px;border-radius:8px;font-size:14px;line-height:1.6;">
        <strong>${escapeHtml(p.customer_name)}</strong>${p.company ? ` — ${escapeHtml(p.company)}` : ""}<br/>
        Email : <a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a><br/>
        ${p.phone ? `Téléphone : ${escapeHtml(p.phone)}<br/>` : ""}
        ${p.event_date ? `Date événement : ${escapeHtml(p.event_date)}<br/>` : ""}
        ${p.event_location ? `Lieu : ${escapeHtml(p.event_location)}<br/>` : ""}
      </div>
      ${p.message ? `<div style="margin-top:16px;padding:12px;background:#fffbe6;border-left:3px solid #f0c000;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.message)}</div>` : ""}
      <h2 style="font-size:16px;margin:24px 0 8px;">Produits</h2>
      ${itemsTable(p.items)}
      ${totalsBlock(p)}
      <p style="margin-top:24px;font-size:12px;color:#999;">Connectez-vous à l'admin pour répondre à cette demande.</p>
    </div>`;
}

function clientEmail(p: z.infer<typeof PayloadSchema>) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;color:#1a1a1a;">
      <h1 style="font-size:22px;margin:0 0 8px;">Merci ${escapeHtml(p.customer_name)} !</h1>
      <p style="font-size:14px;line-height:1.6;color:#555;">
        Nous avons bien reçu votre demande de devis. Notre équipe revient vers vous sous 24h ouvrées
        avec une proposition personnalisée.
      </p>
      <h2 style="font-size:16px;margin:24px 0 8px;">Récapitulatif de votre demande</h2>
      ${itemsTable(p.items)}
      ${totalsBlock(p)}
      <p style="margin-top:24px;font-size:13px;color:#666;">
        Cette estimation est indicative. Le devis final dépendra des disponibilités et de la logistique.
      </p>
      <p style="margin-top:24px;font-size:14px;">— L'équipe Setup Paris</p>
    </div>`;
}

async function sendEmail(args: { to: string; subject: string; html: string; replyTo?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      reply_to: args.replyTo,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, status: res.status, body };
  }
  return { ok: true, status: res.status, body };
}

export const Route = createFileRoute("/api/send-quote-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = PayloadSchema.safeParse(json);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid payload", issues: parsed.error.issues },
            { status: 400 },
          );
        }
        const p = parsed.data;

        const adminRes = await sendEmail({
          to: ADMIN_EMAIL,
          subject: `Nouvelle demande de devis — ${p.customer_name}`,
          html: adminEmail(p),
          replyTo: p.email,
        });

        const clientRes = await sendEmail({
          to: p.email,
          subject: "Votre demande de devis — Setup Paris",
          html: clientEmail(p),
          replyTo: ADMIN_EMAIL,
        });

        return Response.json({
          admin: { ok: adminRes.ok, status: adminRes.status },
          client: { ok: clientRes.ok, status: clientRes.status },
        });
      },
    },
  },
});
