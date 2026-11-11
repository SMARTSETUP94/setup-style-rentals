import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z
  .object({
    name: z.enum(["product_view", "cart_add", "quote_submit", "custom_view", "custom_save", "contact_submit"]),
    path: z.string().max(200).optional().nullable(),
    ref: z.string().max(120).optional().nullable(),
  })
  .strict();

const LIMIT = 60;
const WINDOW_MS = 10 * 60 * 1000;
// In-memory, per-isolate limiter keyed by hashed IP (IP itself is never stored).
const hits = new Map<string, number[]>();

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const noContent = () => new Response(null, { status: 204 });

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          if (raw.length > 2000) return noContent();
          const parsed = Schema.safeParse(JSON.parse(raw));
          if (!parsed.success) return noContent();
          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          const key = await sha256Hex(`track:${ip}`);
          const now = Date.now();
          const list = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
          if (list.length >= LIMIT) {
            hits.set(key, list);
            return noContent();
          }
          list.push(now);
          hits.set(key, list);
          if (hits.size > 5000) for (const k of hits.keys()) { hits.delete(k); if (hits.size < 2500) break; }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("site_events").insert({
            name: parsed.data.name,
            path: parsed.data.path ?? null,
            ref: parsed.data.ref ?? null,
          });
          if (error) console.error("[track] insert failed", error.message);
        } catch {
          /* always 204 */
        }
        return noContent();
      },
    },
  },
});
