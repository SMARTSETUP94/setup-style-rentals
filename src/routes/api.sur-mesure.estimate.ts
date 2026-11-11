import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SUR_MESURE_KEYS } from "@/lib/sur-mesure";
import { publicRange } from "@/lib/price-range";

const Body = z
  .object({
    piece: z.enum(SUR_MESURE_KEYS),
    configuration: z
      .record(z.string(), z.unknown())
      .refine((v) => JSON.stringify(v).length <= 20000, "configuration too large"),
    quantity: z.number().int().min(1).max(50),
  })
  .strict();

const LIMIT = 40;
const WINDOW_MS = 10 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const off = () => json({ enabled: false });

async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/sur-mesure/estimate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          const text = await request.text();
          if (text.length > 25000) return json({ error: "too_large" }, 413);
          raw = JSON.parse(text);
        } catch {
          return json({ error: "invalid_json" }, 400);
        }
        const parsed = Body.safeParse(raw);
        if (!parsed.success) return json({ error: "invalid_input" }, 400);
        const b = parsed.data;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          const ipHash = await sha256Hex(`estimate:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}:${ip}`);
          const since = new Date(Date.now() - WINDOW_MS).toISOString();
          const { count } = await supabaseAdmin
            .from("estimate_attempts")
            .select("id", { count: "exact", head: true })
            .eq("ip_hash", ipHash)
            .gte("created_at", since);
          if ((count ?? 0) >= LIMIT) return json({ error: "rate_limited" }, 429);
          await supabaseAdmin.from("estimate_attempts").insert({ ip_hash: ipHash });

          const { data: row } = await supabaseAdmin
            .from("custom_pricing")
            .select("range_enabled,range_low_pct,range_high_pct,floor_ht")
            .eq("piece", b.piece)
            .maybeSingle();
          if (!row?.range_enabled) return off();

          const { chiffrer } = await import("@/server/chiffrage.server.js");
          const r = chiffrer(b.configuration, { quantite: b.quantity });
          if (!r.ok) return off();
          if (r.incomplet || (r.alertes?.length ?? 0) > 0) return json({ enabled: true, per: "unit", study: true });
          const { low, high } = publicRange(r.unite_ht, Number(row.range_low_pct), Number(row.range_high_pct), Number(row.floor_ht));
          return json({ enabled: true, low, high, per: "unit", study: false });
        } catch (e) {
          console.error("[sur-mesure/estimate] error", e instanceof Error ? e.message : "unknown");
          return off();
        }
      },
    },
  },
});
