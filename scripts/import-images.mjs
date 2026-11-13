#!/usr/bin/env node
/**
 * Import product images listed in public.image_imports (status 'pending').
 * Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service role, server-side only).
 * Rules: https only, Content-Type image/*, ≤ 15 MB. Stored in bucket product-images
 * as <slug>-<timestamp>.<ext>. is_main → products.image_url (no gallery table exists).
 */
import { createClient } from "@supabase/supabase-js";

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) { console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants"); process.exit(1); }
const sb = createClient(URL_, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const MAX = 15 * 1024 * 1024;
const EXT = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg" };

async function fetchImage(url) {
  let u;
  try { u = new URL(url); } catch { throw new Error("URL invalide"); }
  if (u.protocol !== "https:") throw new Error("https uniquement");
  const res = await fetch(u, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (new URL(res.url).protocol !== "https:") throw new Error("redirection non https");
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!type.startsWith("image/")) throw new Error(`type non image : ${type || "inconnu"}`);
  const len = Number(res.headers.get("content-length") || 0);
  if (len > MAX) throw new Error(`trop lourd (${len} o > 15 Mo)`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength > MAX) throw new Error(`trop lourd (${buf.byteLength} o > 15 Mo)`);
  const ext = EXT[type] || (u.pathname.split(".").pop() || "img").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "img";
  return { buf, type, ext };
}

const { data: rows, error } = await sb.from("image_imports").select("*").eq("status", "pending").order("created_at");
if (error) { console.error(error.message); process.exit(1); }
let ok = 0, ko = 0;
for (const r of rows ?? []) {
  try {
    const { data: prod, error: pe } = await sb.from("products").select("id").eq("slug", r.slug).maybeSingle();
    if (pe) throw new Error(pe.message);
    if (!prod) throw new Error(`produit introuvable : ${r.slug}`);
    const { buf, type, ext } = await fetchImage(r.url);
    const path = `${r.slug}-${Date.now()}.${ext}`;
    const { error: ue } = await sb.storage.from("product-images").upload(path, buf, { contentType: type, upsert: false });
    if (ue) throw new Error(`upload : ${ue.message}`);
    const publicUrl = sb.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    if (r.is_main !== false) {
      const { error: up } = await sb.from("products").update({ image_url: publicUrl }).eq("id", prod.id);
      if (up) throw new Error(`mise à jour produit : ${up.message}`);
    }
    // No gallery table/column exists: non-main images are stored only.
    await sb.from("image_imports").update({ status: "done", error: r.is_main === false ? `stockée sans galerie : ${publicUrl}` : null }).eq("id", r.id);
    ok++; console.log(`✓ ${r.slug} → ${publicUrl}`);
  } catch (e) {
    const msg = String(e?.message || e).slice(0, 300);
    await sb.from("image_imports").update({ status: "error", error: msg }).eq("id", r.id);
    ko++; console.log(`✗ ${r.slug} : ${msg}`);
  }
}
console.log(`Terminé : ${ok} ok, ${ko} en erreur, ${(rows ?? []).length} traitées.`);
