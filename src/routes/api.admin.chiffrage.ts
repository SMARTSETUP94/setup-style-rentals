import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const Body = z
  .object({
    configuration: z
      .record(z.string(), z.unknown())
      .refine((v) => JSON.stringify(v).length <= 20000, "configuration too large")
      .optional(),
    config_id: z.string().uuid().optional(),
    quantite: z.number().int().min(1).max(50).optional(),
    hyp: z
      .record(z.string().max(64), z.number().finite().min(0))
      .refine((v) => Object.keys(v).length <= 60, "too many hypotheses")
      .optional(),
    t0: z.number().finite().min(0).optional(),
  })
  .strict()
  .refine((b) => !!b.configuration !== !!b.config_id, "configuration or config_id required");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/admin/chiffrage")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
        if (!token) return json({ error: "unauthorized" }, 401);

        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const userClient = createClient<Database>(url, key, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", key);
              h.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: u, error: uErr } = await userClient.auth.getUser(token);
        if (uErr || !u?.user) return json({ error: "unauthorized" }, 401);
        const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
        if (!isAdmin) return json({ error: "forbidden" }, 403);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "invalid_json" }, 400);
        }
        const parsed = Body.safeParse(raw);
        if (!parsed.success) return json({ error: "invalid_input", issues: parsed.error.issues.map((i) => i.path.join(".")) }, 400);
        const b = parsed.data;

        let configuration: unknown = b.configuration;
        if (b.config_id) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: row, error } = await supabaseAdmin.from("custom_configs").select("config").eq("id", b.config_id).maybeSingle();
          if (error) return json({ error: "server_error" }, 500);
          if (!row) return json({ error: "not_found" }, 404);
          configuration = row.config;
        }
        try {
          const { chiffrer } = await import("@/server/chiffrage.server.js");
          const opts: { quantite?: number; hyp?: Record<string, number>; t0?: number } = {};
          if (b.quantite != null) opts.quantite = b.quantite;
          if (b.hyp) opts.hyp = b.hyp;
          if (b.t0 != null) opts.t0 = b.t0;
          return json(chiffrer(configuration, opts));
        } catch (e) {
          console.error("[admin/chiffrage] engine error", e);
          return json({ ok: false, erreur: "Erreur interne du moteur de chiffrage" });
        }
      },
    },
  },
});
