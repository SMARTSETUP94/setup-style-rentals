import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="container-x py-16 md:py-20 grid gap-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="font-display font-semibold text-2xl tracking-tight">
            SETUP <span className="text-gold font-normal">PARIS</span>
          </div>
          <p className="mt-4 text-sm text-background/70 max-w-md leading-relaxed">
            {t("footer.tagline")}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex items-center justify-center size-10 rounded-full border border-background/20 text-background/80 hover:bg-gold hover:text-gold-foreground hover:border-gold transition-all duration-300"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center size-10 rounded-full border border-background/20 text-background/80 hover:bg-gold hover:text-gold-foreground hover:border-gold transition-all duration-300"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>

        {/* Nav */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-5 font-medium">
            — Navigation
          </div>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="text-background/80 hover:text-gold transition-colors duration-300">{t("nav.home")}</Link></li>
            <li><Link to="/catalogue" className="text-background/80 hover:text-gold transition-colors duration-300">{t("nav.catalog")}</Link></li>
            <li><Link to="/devis" className="text-background/80 hover:text-gold transition-colors duration-300">{t("nav.quote")}</Link></li>
            <li><Link to="/cgl" className="text-background/80 hover:text-gold transition-colors duration-300">{t("footer.cgl")}</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-5 font-medium">
            — Contact
          </div>
          <ul className="space-y-3 text-sm text-background/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="size-4 mt-0.5 text-gold shrink-0" />
              <span>8 avenue du Président Salvador Allende<br />Vitry-sur-Seine</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="size-4 mt-0.5 text-gold shrink-0" />
              <a href="mailto:smart@setup.paris" className="hover:text-gold transition-colors">smart@setup.paris</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="size-4 mt-0.5 text-gold shrink-0" />
              <a href="tel:+33601416111" className="hover:text-gold transition-colors">06 01 41 61 11</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-background/60">
          <div>© {year} Setup Paris. {t("footer.rights")}</div>
          <div>setup.paris</div>
        </div>
      </div>
    </footer>
  );
}
