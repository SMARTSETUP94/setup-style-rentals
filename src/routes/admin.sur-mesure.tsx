import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminI18n } from "@/lib/admin-i18n";
import { getPiece, SUR_MESURE_PIECES } from "@/lib/sur-mesure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/sur-mesure")({
  head: () => ({ meta: [{ title: "Sur mesure — Admin Setup Paris" }, { name: "robots", content: "noindex" }] }),
  component: AdminCustomPricingPage,
});

type Row = {
  piece: string;
  from_price_ht: number;
  lead_time_days: number | null;
  enabled: boolean;
  validated_by: string | null;
  validated_at: string | null;
};
type Draft = { price: string; lead: string; enabled: boolean; validatedBy: string };

const L = {
  fr: {
    title: "Sur mesure — prix « à partir de »",
    warn: "Ces montants sont des estimations internes. N'activez l'affichage d'un prix qu'après validation par l'atelier.",
    piece: "Pièce", price: "À partir de (€ HT)", lead: "Délai indicatif (jours ouvrés)", show: "Afficher sur le site",
    by: "Validé par", save: "Enregistrer", saved: "Enregistré", invalid: "Valeurs invalides", on: "validé le",
  },
  en: {
    title: "Custom-made — “from” prices",
    warn: "These amounts are internal estimates. Only enable a price once the workshop has validated it.",
    piece: "Piece", price: "From (€ excl. VAT)", lead: "Indicative lead time (business days)", show: "Show on site",
    by: "Validated by", save: "Save", saved: "Saved", invalid: "Invalid values", on: "validated on",
  },
};

function AdminCustomPricingPage() {
  const { lang } = useAdminI18n();
  const tx = L[lang];
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("custom_pricing").select("piece,from_price_ht,lead_time_days,enabled,validated_by,validated_at");
    if (error) return toast.error(error.message);
    const order = new Map(SUR_MESURE_PIECES.map((p, i) => [p.k, i]));
    const list = ((data ?? []) as Row[]).sort((a, b) => (order.get(a.piece) ?? 99) - (order.get(b.piece) ?? 99));
    setRows(list);
    setDrafts(Object.fromEntries(list.map((r) => [r.piece, {
      price: String(r.from_price_ht ?? 0),
      lead: r.lead_time_days != null ? String(r.lead_time_days) : "",
      enabled: r.enabled,
      validatedBy: r.validated_by ?? "",
    }])));
  };
  useEffect(() => { void load(); }, []);

  const setD = (k: string, patch: Partial<Draft>) => setDrafts((d) => ({ ...d, [k]: { ...d[k]!, ...patch } }));

  const save = async (r: Row) => {
    const d = drafts[r.piece]!;
    const price = Number(d.price.replace(",", "."));
    const lead = d.lead.trim() === "" ? null : Number(d.lead);
    if (!Number.isFinite(price) || price < 0 || (lead !== null && (!Number.isInteger(lead) || lead < 0 || lead > 365))) {
      return toast.error(tx.invalid);
    }
    const by = d.validatedBy.trim().slice(0, 120) || null;
    setSaving(r.piece);
    const { error } = await supabase.from("custom_pricing").update({
      from_price_ht: Math.round(price * 100) / 100,
      lead_time_days: lead,
      enabled: d.enabled,
      validated_by: by,
      validated_at: by !== r.validated_by ? (by ? new Date().toISOString() : null) : r.validated_at,
      updated_at: new Date().toISOString(),
    }).eq("piece", r.piece);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(tx.saved);
    void load();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-semibold">{tx.title}</h1>
      <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertTriangle className="size-4 mt-0.5 shrink-0" /> {tx.warn}
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">{tx.piece}</th><th className="p-3">{tx.price}</th><th className="p-3">{tx.lead}</th>
              <th className="p-3">{tx.show}</th><th className="p-3">{tx.by}</th><th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const d = drafts[r.piece];
              if (!d) return null;
              const p = getPiece(r.piece);
              return (
                <tr key={r.piece}>
                  <td className="p-3 font-medium">{p ? (lang === "fr" ? p.nom : p.name_en) : r.piece}<div className="text-[11px] text-muted-foreground font-mono">{r.piece}</div></td>
                  <td className="p-3"><Input inputMode="decimal" value={d.price} onChange={(e) => setD(r.piece, { price: e.target.value })} className="w-28" aria-label={`${tx.price} ${r.piece}`} /></td>
                  <td className="p-3"><Input inputMode="numeric" value={d.lead} onChange={(e) => setD(r.piece, { lead: e.target.value })} className="w-20" aria-label={`${tx.lead} ${r.piece}`} /></td>
                  <td className="p-3"><Checkbox checked={d.enabled} onCheckedChange={(v) => setD(r.piece, { enabled: v === true })} aria-label={`${tx.show} ${r.piece}`} /></td>
                  <td className="p-3">
                    <Input value={d.validatedBy} onChange={(e) => setD(r.piece, { validatedBy: e.target.value })} className="w-40" aria-label={`${tx.by} ${r.piece}`} />
                    {r.validated_at && <div className="mt-1 text-[11px] text-muted-foreground">{tx.on} {new Date(r.validated_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}</div>}
                  </td>
                  <td className="p-3"><Button size="sm" onClick={() => save(r)} disabled={saving === r.piece}><Save className="size-3.5" /> {tx.save}</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
