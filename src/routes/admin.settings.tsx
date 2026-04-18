import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

type Setting = { key: string; value_fr: string | null; value_en: string | null };

const KEYS = {
  TERMS: "terms_of_rental",
  LEGAL: "legal_notice",
  CONTACT_EMAIL: "contact_email",
  CONTACT_PHONE: "contact_phone",
  CONTACT_ADDRESS: "contact_address",
  CONTACT_CITY: "contact_city",
  CONTACT_POSTAL: "contact_postal",
  LOG_BASE: "logistics_base_fee",
  LOG_PER_ITEM: "logistics_per_item_fee",
  LOG_SETUP: "logistics_setup_fee",
  LOG_PICKUP: "logistics_pickup_fee",
};

function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) toast.error(error.message);
    const map: Record<string, Setting> = {};
    (data ?? []).forEach((s: any) => { map[s.key] = s; });
    setSettings(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const get = (key: string, lang: "fr" | "en" = "fr") =>
    (lang === "fr" ? settings[key]?.value_fr : settings[key]?.value_en) || "";

  const set = (key: string, lang: "fr" | "en", value: string) => {
    setSettings((s) => ({
      ...s,
      [key]: {
        key,
        value_fr: lang === "fr" ? value : s[key]?.value_fr ?? null,
        value_en: lang === "en" ? value : s[key]?.value_en ?? null,
      },
    }));
  };

  const saveSection = async (keys: string[], label: string) => {
    setSavingKey(label);
    const rows = keys.map((k) => ({
      key: k,
      value_fr: settings[k]?.value_fr ?? null,
      value_en: settings[k]?.value_en ?? null,
    }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    setSavingKey(null);
    if (error) return toast.error(error.message);
    toast.success(`${label} enregistré`);
  };

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Contenus éditables affichés sur le site public
        </p>
      </div>

      <div className="space-y-8">
        <Section
          title="Frais logistiques (appliqués automatiquement aux devis clients)"
          onSave={() =>
            saveSection(
              [KEYS.LOG_BASE, KEYS.LOG_PER_ITEM, KEYS.LOG_SETUP, KEYS.LOG_PICKUP],
              "Frais logistiques",
            )
          }
          saving={savingKey === "Frais logistiques"}
        >
          <p className="text-xs text-muted-foreground mb-4">
            Ces montants HT seront automatiquement ajoutés au devis affiché au client. Le total livraison = forfait de base + (frais par produit × nombre de lignes).
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Forfait livraison de base (€ HT)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={get(KEYS.LOG_BASE, "fr")}
                onChange={(e) => set(KEYS.LOG_BASE, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Frais par produit dans le devis (€ HT)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={get(KEYS.LOG_PER_ITEM, "fr")}
                onChange={(e) => set(KEYS.LOG_PER_ITEM, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Forfait installation / montage (€ HT)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={get(KEYS.LOG_SETUP, "fr")}
                onChange={(e) => set(KEYS.LOG_SETUP, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Forfait reprise / démontage (€ HT)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                className="mt-1.5"
                value={get(KEYS.LOG_PICKUP, "fr")}
                onChange={(e) => set(KEYS.LOG_PICKUP, "fr", e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Conditions générales de location"
          onSave={() => saveSection([KEYS.TERMS], "CGV")}
          saving={savingKey === "CGV"}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Texte FR</Label>
              <Textarea
                rows={10}
                className="mt-1.5"
                value={get(KEYS.TERMS, "fr")}
                onChange={(e) => set(KEYS.TERMS, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Texte EN</Label>
              <Textarea
                rows={10}
                className="mt-1.5"
                value={get(KEYS.TERMS, "en")}
                onChange={(e) => set(KEYS.TERMS, "en", e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Mentions légales"
          onSave={() => saveSection([KEYS.LEGAL], "Mentions légales")}
          saving={savingKey === "Mentions légales"}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Texte FR</Label>
              <Textarea
                rows={10}
                className="mt-1.5"
                value={get(KEYS.LEGAL, "fr")}
                onChange={(e) => set(KEYS.LEGAL, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Texte EN</Label>
              <Textarea
                rows={10}
                className="mt-1.5"
                value={get(KEYS.LEGAL, "en")}
                onChange={(e) => set(KEYS.LEGAL, "en", e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Informations de contact"
          onSave={() =>
            saveSection(
              [KEYS.CONTACT_EMAIL, KEYS.CONTACT_PHONE, KEYS.CONTACT_ADDRESS, KEYS.CONTACT_CITY, KEYS.CONTACT_POSTAL],
              "Contact",
            )
          }
          saving={savingKey === "Contact"}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                value={get(KEYS.CONTACT_EMAIL, "fr")}
                onChange={(e) => set(KEYS.CONTACT_EMAIL, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input
                className="mt-1.5"
                value={get(KEYS.CONTACT_PHONE, "fr")}
                onChange={(e) => set(KEYS.CONTACT_PHONE, "fr", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Adresse</Label>
              <Input
                className="mt-1.5"
                value={get(KEYS.CONTACT_ADDRESS, "fr")}
                onChange={(e) => set(KEYS.CONTACT_ADDRESS, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Code postal</Label>
              <Input
                className="mt-1.5"
                value={get(KEYS.CONTACT_POSTAL, "fr")}
                onChange={(e) => set(KEYS.CONTACT_POSTAL, "fr", e.target.value)}
              />
            </div>
            <div>
              <Label>Ville</Label>
              <Input
                className="mt-1.5"
                value={get(KEYS.CONTACT_CITY, "fr")}
                onChange={(e) => set(KEYS.CONTACT_CITY, "fr", e.target.value)}
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  onSave,
  saving,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button onClick={onSave} disabled={saving} size="sm">
          <Save className="size-4" /> {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
      {children}
    </div>
  );
}
