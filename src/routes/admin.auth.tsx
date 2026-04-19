import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminI18nProvider, useAdminI18n } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin/auth")({
  head: () => ({ meta: [{ title: "Admin — Setup Paris" }] }),
  component: () => (
    <AdminI18nProvider>
      <AdminAuthPage />
    </AdminI18nProvider>
  ),
});

function AdminAuthPage() {
  const { user, isAdmin, loading, signIn } = useAuth();
  const { t, lang, setLang } = useAdminI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t("auth.invalidEmail")).max(255),
    password: z.string().min(6, t("auth.passwordTooShort")).max(72),
  });

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
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(t("auth.success"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8 font-display font-bold text-lg">
          SETUP <span className="opacity-60 font-normal">PARIS</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{t("auth.title")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("auth.sub")}</p>
            </div>
            <div className="flex rounded-md border border-border overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-2 py-1 font-medium transition-colors ${lang === "fr" ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-1 font-medium border-l border-border transition-colors ${lang === "en" ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                EN
              </button>
            </div>
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
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
              <Label htmlFor="password">{t("auth.password")}</Label>
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
              {busy ? "…" : t("auth.signIn")}
            </Button>
          </form>
          {user && !isAdmin && !loading && (
            <p className="mt-4 text-sm text-destructive text-center">{t("auth.notAdmin")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
