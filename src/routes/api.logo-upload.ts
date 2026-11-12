import { createFileRoute } from "@tanstack/react-router";

const MAX_BYTES = 10 * 1024 * 1024;
const MIME_EXT: Record<string, string[]> = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/svg+xml": ["svg"],
  "application/pdf": ["pdf"],
};

const json = (body: unknown, status = 200) => Response.json(body, { status });

// Anonymous visitors upload their logo here; the server writes to storage so
// no public INSERT policy is needed on storage.objects.
export const Route = createFileRoute("/api/logo-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const len = Number(request.headers.get("content-length") || 0);
          if (len > MAX_BYTES + 64 * 1024) return json({ error: "too_large" }, 413);
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) return json({ error: "invalid" }, 400);
          if (file.size === 0 || file.size > MAX_BYTES) return json({ error: "too_large" }, 413);
          const exts = MIME_EXT[file.type];
          const ext = (file.name.split(".").pop() || "").toLowerCase();
          if (!exts || !exts.includes(ext)) return json({ error: "invalid_type" }, 400);
          const safeBase =
            file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 60) || "logo";
          const path = `client-logos/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeBase}.${ext}`;
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.storage
            .from("quote-uploads")
            .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
          if (error) {
            console.error("logo upload failed", error.message);
            return json({ error: "upload_failed" }, 500);
          }
          const { data } = supabaseAdmin.storage.from("quote-uploads").getPublicUrl(path);
          return json({ url: data.publicUrl });
        } catch (e) {
          console.error("logo upload error", e);
          return json({ error: "upload_failed" }, 500);
        }
      },
    },
  },
});
