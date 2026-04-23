import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, FileText, Layers, Settings, Globe, Menu, X, LayoutDashboard, CalendarDays, Map } from "lucide-react";
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

function LangToggle({ size = "sm" }: { size?: "sm" | "xs" }) {
  const { lang, setLang } = useAdminI18n();
  const padding = size === "xs" ? "px-2 py-1 text-[11px]" : "px-2 py-1 text-xs";
  return (
    <div className="flex rounded-md border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setLang("fr")}
        className={cn(
          "font-medium transition-colors",
          padding,
          lang === "fr" ? "bg-foreground text-background" : "bg-transparent hover:bg-muted",
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "font-medium transition-colors border-l border-border",
          padding,
          lang === "en" ? "bg-foreground text-background" : "bg-transparent hover:bg-muted",
        )}
      >
        EN
      </button>
    </div>
  );
}

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { t } = useAdminI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const onAuthPage = location.pathname === "/admin/auth";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user && !onAuthPage) {
      navigate({ to: "/admin/auth" });
    } else if (user && !isAdmin && !onAuthPage) {
      navigate({ to: "/admin/auth" });
    }
  }, [user, isAdmin, loading, onAuthPage, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (onAuthPage) return <Outlet />;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        {t("layout.loading")}
      </div>
    );
  }

  const sidebarContent = (
    <>
      <Link to="/" className="font-display font-bold text-lg mb-8 px-2">
        SETUP <span className="opacity-60 font-normal">PARIS</span>
      </Link>
      <nav className="flex-1 space-y-1 text-sm">
        <NavItem to="/admin" icon={<LayoutDashboard className="size-4" />} label={t("dash.title")} exact />
        <NavItem to="/admin/devis" icon={<FileText className="size-4" />} label={t("layout.quotes")} />
        <NavItem to="/admin/calendrier" icon={<CalendarDays className="size-4" />} label={t("layout.calendar")} />
        <NavItem to="/admin/categories" icon={<Layers className="size-4" />} label={t("layout.categories")} />
        <NavItem to="/admin/products" icon={<Package className="size-4" />} label={t("layout.products")} />
        <NavItem to="/admin/roadmap" icon={<Map className="size-4" />} label="Roadmap" />
        <NavItem to="/admin/settings" icon={<Settings className="size-4" />} label={t("layout.settings")} />
      </nav>
      <div className="border-t border-border pt-4 space-y-3">
        <div className="px-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
            <Globe className="size-3" />
            {t("layout.lang")}
          </div>
          <LangToggle />
        </div>
        <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
        <Button variant="ghost" size="sm" onClick={() => signOut()} className="w-full justify-start">
          <LogOut className="size-4" />
          {t("layout.signOut")}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 h-14 border-b border-border bg-card">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Link to="/" className="font-display font-bold text-sm">
          SETUP <span className="opacity-60 font-normal">PARIS</span>
        </Link>
        <LangToggle size="xs" />
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative w-64 max-w-[85vw] bg-card p-4 flex flex-col border-r border-border">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-card p-4 flex-col">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
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
