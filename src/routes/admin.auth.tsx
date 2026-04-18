import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/auth")({
  head: () => ({ meta: [{ title: "Admin — Setup Paris" }] }),
  component: AdminAuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Mot de passe trop court").max(72),
});

function AdminAuthPage() {
  const { user, isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/admin/auth` },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Compte créé. Demandez l'attribution du rôle admin.");
      return;
    }
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Connexion réussie");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8 font-display font-bold text-lg">
          SETUP <span className="opacity-60 font-normal">PARIS</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h1 className="text-xl font-semibold tracking-tight">Espace administrateur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connectez-vous pour gérer le catalogue et les devis.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "…" : mode === "signup" ? "Créer le compte" : "Se connecter"}
            </Button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signin" ? "Créer un compte admin" : "J'ai déjà un compte"}
            </button>
          </form>
          {user && !isAdmin && !loading && (
            <p className="mt-4 text-sm text-destructive text-center">
              Ce compte n'a pas les droits administrateur.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
