import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChiffragePanel, type SavedEstimate } from "@/components/admin/ChiffragePanel";
import { SUR_MESURE_PIECES, SurMesureConfigMessage, getPiece } from "@/lib/sur-mesure";

const ALLOWED_TYPES = new Set(["sur-mesure-ready", "sur-mesure-config", "sur-mesure-save"]);

export const Route = createFileRoute("/admin/chiffrage")({
  validateSearch: zodValidator(z.object({ piece: z.string().max(40).optional(), config_id: z.string().uuid().optional() })),
  head: () => ({ meta: [{ title: "Chiffrage — Admin Setup Paris" }, { name: "robots", content: "noindex" }] }),
  component: ChiffragePage,
});

type Row = SavedEstimate & { id: string; piece: string; config: unknown; quantity: number; ref: string };

function ChiffragePage() {
  const { piece: pieceParam, config_id } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin/chiffrage" });
  const [row, setRow] = useState<Row | null>(null);
  const [rowLoaded, setRowLoaded] = useState(!config_id);
  const pieceKey = row?.piece ?? (getPiece(pieceParam) ? pieceParam! : "comptoir");
  const [liveConfig, setLiveConfig] = useState<Record<string, unknown> | null>(null);
  const [qty, setQty] = useState(1);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const restoreRef = useRef<Record<string, unknown> | null>(null);

  const loadRow = async () => {
    if (!config_id) return;
    const { data, error } = await supabase
      .from("custom_configs")
      .select("id,piece,config,quantity,ref,estimate_unit_ht,estimate_total_ht,estimate_at,estimate_by,estimate_note,estimate_options")
      .eq("id", config_id)
      .maybeSingle();
    if (error) toast.error(error.message);
    setRow((data as Row) ?? null);
    restoreRef.current = (data?.config as Record<string, unknown>) ?? null;
    if (data) setQty(data.quantity || 1);
    setRowLoaded(true);
  };
  useEffect(() => {
    setRowLoaded(!config_id);
    void loadRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config_id]);

  useEffect(() => {
    setLiveConfig(null);
  }, [pieceKey]);

  useEffect(() => {
    let timer: number | undefined;
    const onMsg = (e: MessageEvent) => {
      const win = frameRef.current?.contentWindow;
      if (!win || e.source !== win) return;
      const d = e.data as { type?: unknown } | null;
      if (!d || typeof d !== "object" || typeof d.type !== "string" || !ALLOWED_TYPES.has(d.type)) return;
      if (d.type === "sur-mesure-ready") {
        if (restoreRef.current) win.postMessage({ type: "restore-config", configuration: restoreRef.current }, "*");
        return;
      }
      if (d.type !== "sur-mesure-config") return;
      const parsed = SurMesureConfigMessage.safeParse(d);
      if (!parsed.success) return;
      const m = parsed.data;
      if (m.piece !== pieceKey) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setLiveConfig(m.configuration);
        setQty(m.quantity);
      }, 500);
    };
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("message", onMsg);
      window.clearTimeout(timer);
    };
  }, [pieceKey]);

  const src = `/configurators/sur-mesure.html?piece=${encodeURIComponent(pieceKey)}`;
  // Panel source: live config from the 3D once received; otherwise the stored row; otherwise piece defaults.
  const panelConfig = liveConfig ?? (row ? null : { pk: pieceKey, qte: 1, tous: {} });
  const usesStored = !liveConfig && !!row;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Chiffrage interne</h1>
          {row && <p className="text-xs text-muted-foreground">Configuration enregistrée : <span className="font-mono">{row.ref}</span></p>}
        </div>
        <label className="text-sm flex items-center gap-2">
          Pièce
          <select
            value={pieceKey}
            onChange={(e) => navigate({ search: { piece: e.target.value } })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            {SUR_MESURE_PIECES.map((p) => (
              <option key={p.k} value={p.k}>{p.nom}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="rounded-lg border border-border overflow-hidden h-[60vh] lg:h-[calc(100vh-10rem)]">
          {rowLoaded && (
            <iframe
              key={`${pieceKey}-${config_id ?? ""}`}
              ref={frameRef}
              src={src}
              title="Configurateur 3D sur mesure"
              sandbox="allow-scripts allow-downloads"
              className="block w-full h-full border-0"
            />
          )}
        </div>
        <div className="lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto">
          {rowLoaded && (
            <ChiffragePanel
              key={`${pieceKey}-${row?.id ?? "new"}`}
              configuration={usesStored ? null : panelConfig}
              configId={usesStored ? row!.id : null}
              saveId={row && row.piece === pieceKey ? row.id : null}
              initialQty={qty}
              saved={row}
              onSaved={loadRow}
              debounceMs={0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
