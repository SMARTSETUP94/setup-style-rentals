import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Package, FileText, Layers, Settings, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminI18nProvider, useAdminI18n } from "@/lib/admin-i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Setup Paris" }] }),
  component: AdminLayoutWrapper,
});

function AdminLayoutWrapper() {
  return (
    <AdminI18nProvider>
      <AdminLayout />
    </AdminI18nProvider>
  );
}

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t, lang, setLang } = useAdminI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const onAuthPage = location.pathname === "/admin/auth";

  useEffect(() => {
    if (loading) return;
    if (!user && !onAuthPage) {
      navigate({ to: "/admin/auth" });
    } else if (user && !isAdmin && !onAuthPage) {
      navigate({ to: "/admin/auth" });
    }
  }, [user, isAdmin, loading, onAuthPage, navigate]);

  if (onAuthPage) return <Outlet />;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        {t("layout.loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r border-border bg-card p-4 flex flex-col">
        <Link to="/" className="font-display font-bold text-lg mb-8 px-2">
          SETUP <span className="opacity-60 font-normal">PARIS</span>
        </Link>
        <nav className="flex-1 space-y-1 text-sm">
          <NavItem to="/admin" icon={<FileText className="size-4" />} label={t("layout.quotes")} exact />
          <NavItem to="/admin/categories" icon={<Layers className="size-4" />} label={t("layout.categories")} />
          <NavItem to="/admin/products" icon={<Package className="size-4" />} label={t("layout.products")} />
          <NavItem to="/admin/settings" icon={<Settings className="size-4" />} label={t("layout.settings")} />
        </nav>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="px-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              <Globe className="size-3" />
              {t("layout.lang")}
            </div>
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={cn(
                  "flex-1 px-2 py-1 text-xs font-medium transition-colors",
                  lang === "fr" ? "bg-foreground text-background" : "bg-transparent hover:bg-muted",
                )}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "flex-1 px-2 py-1 text-xs font-medium transition-colors border-l border-border",
                  lang === "en" ? "bg-foreground text-background" : "bg-transparent hover:bg-muted",
                )}
              >
                EN
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
          <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full justify-start">
            <LogOut className="size-4" />
            {t("layout.signOut")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, exact }: { to: string; icon: React.ReactNode; label: string; exact?: boolean }) {
  const location = useLocation();
  const active = exact ? location.pathname === to : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
        active ? "bg-foreground text-background" : "hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
