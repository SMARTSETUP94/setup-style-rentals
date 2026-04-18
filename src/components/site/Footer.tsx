import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-24">
      <div className="container-x py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display font-bold text-xl tracking-tight">SETUP <span className="opacity-60 font-normal">PARIS</span></div>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">{t("footer.tagline")}</p>
        </div>
        <div>
          <div className="section-num mb-3">— Nav</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-accent transition-colors">{t("nav.home")}</Link></li>
            <li><Link to="/catalogue" className="hover:text-accent transition-colors">{t("nav.catalog")}</Link></li>
            <li><Link to="/devis" className="hover:text-accent transition-colors">{t("nav.quote")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="section-num mb-3">— Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>setup.paris</li>
            <li>contact@setup.paris</li>
            <li>Paris, France</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {year} Setup Paris. {t("footer.rights")}</div>
          <div className="flex items-center gap-4">
            <span>setup.paris</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
