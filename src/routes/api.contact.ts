import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ContactSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    company: z.string().trim().max(200).optional().nullable(),
    email: z.string().trim().email().max(320),
    phone: z.string().trim().max(50).optional().nullable(),
    message: z.string().trim().min(1).max(5000),
    lang: z.enum(["fr", "en"]).default("fr"),
    website: z.string().max(500).optional().nullable(),
  })
  .strict();

const DEFAULT_ADMIN_EMAIL = "smart@setup.paris";
const DEFAULT_FROM = "Setup Paris <onboarding@resend.dev>";
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const json = (body: unknown, status = 200) => Response.json(body, { status });
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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

export const Route = createFileRoute("/api/contact")({
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
          const parsed = ContactSchema.safeParse(raw);
          if (!parsed.success) {
            return json({ error: "invalid_payload", fields: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
          }
          const p = parsed.data;
          if (p.website && p.website.trim() !== "") return json({ ok: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          // Same rate limit / table / hashing as /api/quotes/submit (shared budget).
          const ipHash = await sha256Hex(`${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}:${clientIp(request)}`);
          const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
          const { count, error: rlErr } = await supabaseAdmin
            .from("submit_attempts")
            .select("id", { count: "exact", head: true })
            .eq("ip_hash", ipHash)
            .gte("created_at", since);
          if (rlErr) console.error("[contact] rate-limit read failed", rlErr);
          if ((count ?? 0) >= RATE_LIMIT_MAX) return json({ error: "rate_limited" }, 429);
          const { error: attErr } = await supabaseAdmin.from("submit_attempts").insert({ ip_hash: ipHash });
          if (attErr) console.error("[contact] rate-limit insert failed", attErr);

          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey) return json({ error: "email_unavailable" }, 503);
          const notifyTo = (process.env.QUOTE_NOTIFY_TO || DEFAULT_ADMIN_EMAIL)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const html = `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a1a;">
              <h1 style="font-size:20px;margin:0 0 16px;">Nouveau message de contact</h1>
              <div style="background:#f9f9f9;padding:16px;border-radius:8px;font-size:14px;line-height:1.6;">
                <strong>${escapeHtml(p.name)}</strong>${p.company ? ` — ${escapeHtml(p.company)}` : ""}<br/>
                Email : ${escapeHtml(p.email)}<br/>
                ${p.phone ? `Téléphone : ${escapeHtml(p.phone)}<br/>` : ""}
                Langue : ${escapeHtml(p.lang)}
              </div>
              <div style="margin-top:16px;padding:12px;background:#fffbe6;border-left:3px solid #f0c000;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.message)}</div>
            </div>`;
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: process.env.RESEND_FROM || DEFAULT_FROM,
              to: notifyTo,
              subject: `Contact — ${p.name.replace(/[\r\n]+/g, " ").slice(0, 120)}`,
              html,
              reply_to: p.email,
            }),
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error(`[contact] Resend failed [${res.status}]: ${body}`);
            return json({ error: "email_failed" }, 502);
          }
          return json({ ok: true });
        } catch (err) {
          console.error("[contact] unexpected error", err);
          return json({ error: "server_error" }, 500);
        }
      },
    },
  },
});
