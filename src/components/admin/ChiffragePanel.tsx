import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy, Download, RefreshCw, RotateCcw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ChiffrageResult, ChiffrageOk } from "@/lib/chiffrage-types";

export type SavedEstimate = {
  estimate_unit_ht: number | null;
  estimate_total_ht: number | null;
  estimate_at: string | null;
  estimate_by: string | null;
  estimate_note: string | null;
  estimate_options: unknown;
};

const eur = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const num = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

function downloadCsv(name: string, rows: Array<Array<string | number>>) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "\ufeff" + rows.map((r) => r.map(esc).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function callChiffrage(body: Record<string, unknown>): Promise<ChiffrageResult> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, erreur: "Session expirée" };
  const res = await fetch("/api/admin/chiffrage", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, erreur: `Erreur ${res.status}` };
  return (await res.json()) as ChiffrageResult;
}

/**
 * Internal pricing panel. Either `configuration` (live) or `configId` (stored row) is the source.
 * `configId` also enables saving the estimate on that custom_configs row.
 */
export function ChiffragePanel({
  configuration,
  configId,
  saveId,
  initialQty = 1,
  saved,
  onSaved,
  debounceMs = 400,
}: {
  configuration?: Record<string, unknown> | null;
  configId?: string | null;
  saveId?: string | null;
  initialQty?: number;
  saved?: SavedEstimate | null;
  onSaved?: () => void;
  debounceMs?: number;
}) {
  const savedOpts = (saved?.estimate_options ?? {}) as { quantite?: number; hyp?: Record<string, number>; t0?: number };
  const [qty, setQty] = useState<number>(savedOpts.quantite ?? initialQty);
  const [hyp, setHyp] = useState<Record<string, number>>(savedOpts.hyp ?? {});
  const [t0, setT0] = useState<number | null>(saved?.estimate_by && saved.estimate_by !== "auto" ? savedOpts.t0 ?? null : null);
  const [note, setNote] = useState(saved?.estimate_note ?? "");
  const [result, setResult] = useState<ChiffrageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHyp, setShowHyp] = useState(false);
  const [showDebit, setShowDebit] = useState(false);
  const [tick, setTick] = useState(0);
  const reqId = useRef(0);

  const confKey = configuration ? JSON.stringify(configuration) : null;
  useEffect(() => {
    if (!confKey && !configId) return;
    const id = ++reqId.current;
    const t = window.setTimeout(async () => {
      setLoading(true);
      const body: Record<string, unknown> = configId ? { config_id: configId } : { configuration: JSON.parse(confKey!) };
      body.quantite = Math.min(50, Math.max(1, Math.round(qty || 1)));
      if (Object.keys(hyp).length) body.hyp = hyp;
      if (t0 != null) body.t0 = t0;
      try {
        const r = await callChiffrage(body);
        if (id === reqId.current) setResult(r);
      } catch (e) {
        if (id === reqId.current) setResult({ ok: false, erreur: String(e) });
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [confKey, configId, qty, hyp, t0, tick, debounceMs]);

  const ok: ChiffrageOk | null = result && result.ok ? result : null;

  const save = async () => {
    if (!ok || !saveId) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("custom_configs")
      .update({
        estimate_unit_ht: ok.unite_ht,
        estimate_total_ht: ok.total_ht,
        estimate_breakdown: ok as never,
        estimate_options: { quantite: ok.quantite, hyp, t0: ok.t0 } as never,
        estimate_at: new Date().toISOString(),
        estimate_by: u.user?.email ?? "admin",
        estimate_note: note.trim() || null,
      })
      .eq("id", saveId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Estimation enregistrée");
    onSaved?.();
  };

  const copyForQuote = async () => {
    if (!ok) return;
    const txt = [
      ["Poste", "Base de calcul", "Montant HT"].join("\t"),
      ...ok.lignes.map((l) => [l.poste, l.detail, l.montant.toFixed(2)].join("\t")),
      ["Total", `${ok.quantite} u. × ${ok.unite_ht.toFixed(2)}`, ok.total_ht.toFixed(2)].join("\t"),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(txt);
      toast.success("Copié");
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 space-y-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Chiffrage interne <span className="text-xs font-normal text-muted-foreground">(confidentiel)</span></p>
        <Button size="sm" variant="outline" onClick={() => setTick((n) => n + 1)} disabled={loading}>
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} /> Recalculer
        </Button>
      </div>

      {saved?.estimate_total_ht != null && (
        <div className="text-xs text-muted-foreground">
          Enregistrée : {eur(Number(saved.estimate_unit_ht ?? 0))} HT l'unité · {eur(Number(saved.estimate_total_ht))} HT au total
          {saved.estimate_at ? ` · ${new Date(saved.estimate_at).toLocaleString("fr-FR")}` : ""}
          {saved.estimate_by ? ` · ${saved.estimate_by}` : ""}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs space-y-1">
          <span className="block text-muted-foreground">Quantité</span>
          <Input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} className="h-8 w-20" />
        </label>
        {loading && <span className="text-xs text-muted-foreground">Calcul…</span>}
      </div>

      {result && !result.ok && <p className="text-xs text-destructive">Chiffrage indisponible : {result.erreur}</p>}

      {ok && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr><th className="text-left py-1 pr-2 font-medium">Poste</th><th className="text-left py-1 pr-2 font-medium">Base de calcul</th><th className="text-right py-1 font-medium">Montant HT</th></tr>
              </thead>
              <tbody>
                {ok.lignes.map((l, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="py-1 pr-2">{l.poste}</td>
                    <td className="py-1 pr-2 text-muted-foreground">{l.detail}</td>
                    <td className="py-1 text-right whitespace-nowrap">{eur(l.montant)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border"><td colSpan={2} className="py-1">Matières</td><td className="py-1 text-right">{eur(ok.matieres_ht)}</td></tr>
                <tr><td colSpan={2} className="py-1">Main-d'œuvre</td><td className="py-1 text-right">{eur(ok.main_oeuvre_ht)}</td></tr>
                <tr className="font-semibold border-t border-border"><td colSpan={2} className="py-1">Total ({ok.quantite} u. × {eur(ok.unite_ht)})</td><td className="py-1 text-right">{eur(ok.total_ht)}</td></tr>
                <tr className="text-muted-foreground"><td colSpan={2} className="py-1">Poids</td><td className="py-1 text-right">{num(ok.poids_kg)} kg</td></tr>
              </tfoot>
            </table>
          </div>
          {ok.incomplet && <p className="text-xs font-medium">Chiffrage partiel : certains postes ne sont pas chiffrés.</p>}
          {ok.alertes.length > 0 && (
            <div className="text-xs"><div className="font-medium">À vérifier par le bureau d'études</div><ul className="list-disc pl-5">{ok.alertes.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
          )}
          {ok.non_chiffre.length > 0 && (
            <div className="text-xs"><div className="font-medium">Non chiffré</div><ul className="list-disc pl-5">{ok.non_chiffre.map((a, i) => <li key={i}>{a}</li>)}</ul></div>
          )}

          <div>
            <button type="button" className="flex items-center gap-1 text-xs font-medium" onClick={() => setShowHyp((v) => !v)}>
              <ChevronDown className={`size-3.5 transition-transform ${showHyp ? "rotate-180" : ""}`} /> Hypothèses
            </button>
            {showHyp && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ok.hypotheses.map((h) => (
                    <label key={h.cle} className="text-xs space-y-1">
                      <span className="block text-muted-foreground">{h.libelle}</span>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={hyp[h.cle] ?? h.valeur}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isFinite(v) || v < 0) return;
                          setHyp((prev) => ({ ...prev, [h.cle]: v }));
                        }}
                        className="h-8"
                      />
                    </label>
                  ))}
                  <label className="text-xs space-y-1">
                    <span className="block text-muted-foreground">Assemblage de base de cette pièce (h)</span>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={t0 ?? ok.t0}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (Number.isFinite(v) && v >= 0) setT0(v);
                      }}
                      className="h-8"
                    />
                  </label>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setHyp({}); setT0(null); }}>
                  <RotateCcw className="size-3.5" /> Rétablir les valeurs par défaut
                </Button>
              </div>
            )}
          </div>

          <div>
            <button type="button" className="flex items-center gap-1 text-xs font-medium" onClick={() => setShowDebit((v) => !v)}>
              <ChevronDown className={`size-3.5 transition-transform ${showDebit ? "rotate-180" : ""}`} /> Débit
            </button>
            {showDebit && (
              <div className="mt-2 space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground"><tr><th className="text-left py-1 pr-2 font-medium">Élément</th><th className="text-left py-1 pr-2 font-medium">Matière</th><th className="text-right py-1 pr-2 font-medium">L</th><th className="text-right py-1 pr-2 font-medium">l</th><th className="text-right py-1 font-medium">Ép.</th></tr></thead>
                    <tbody>
                      {ok.debit.map((d, i) => (
                        <tr key={i} className="border-t border-border/60"><td className="py-1 pr-2">{d.nom}</td><td className="py-1 pr-2">{d.mat}</td><td className="py-1 pr-2 text-right">{d.L}</td><td className="py-1 pr-2 text-right">{d.l}</td><td className="py-1 text-right">{d.ep}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="sm" variant="outline" onClick={() => downloadCsv(`debit-${ok.piece}.csv`, [["Élément", "Matière", "L", "l", "Épaisseur"], ...ok.debit.map((d) => [d.nom, d.mat, d.L, d.l, d.ep])])}>
                  <Download className="size-3.5" /> Exporter le débit (CSV)
                </Button>
              </div>
            )}
          </div>

          {saveId && (
            <label className="block text-xs space-y-1">
              <span className="block text-muted-foreground">Note</span>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={2000} />
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            {saveId && (
              <Button size="sm" onClick={save} disabled={saving}><Save className="size-3.5" /> Enregistrer l'estimation</Button>
            )}
            <Button size="sm" variant="outline" onClick={copyForQuote}><Copy className="size-3.5" /> Copier pour le devis</Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadCsv(`chiffrage-${ok.piece}.csv`, [
                  ["Poste", "Base de calcul", "Montant HT"],
                  ...ok.lignes.map((l) => [l.poste, l.detail, l.montant.toFixed(2)]),
                  ["Matières", "", ok.matieres_ht.toFixed(2)],
                  ["Main-d'œuvre", "", ok.main_oeuvre_ht.toFixed(2)],
                  ["Total", `${ok.quantite} u. × ${ok.unite_ht.toFixed(2)}`, ok.total_ht.toFixed(2)],
                ])
              }
            >
              <Download className="size-3.5" /> Exporter le chiffrage (CSV)
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
