import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { count } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent border-transparent text-white"
          : "bg-white/90 backdrop-blur-md border-b border-border text-foreground shadow-soft",
      )}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className={cn("inline-block size-2 rounded-full transition-colors", transparent ? "bg-white" : "bg-accent")} />
          <span className="flex flex-col leading-none">
            <span className="font-display font-bold tracking-tight text-lg">
              SETUP <span className="opacity-60 font-normal">PARIS</span>
            </span>
            <a
              href="https://www.setup.paris"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "text-[10px] font-medium tracking-wider uppercase mt-0.5 transition-opacity hover:opacity-100",
                transparent ? "text-white/70" : "text-muted-foreground",
              )}
            >
              by setup.paris ↗
            </a>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="hover:opacity-70 transition-opacity" activeProps={{ className: "opacity-100" }}>
            {t("nav.home")}
          </Link>
          <Link to="/catalogue" className="hover:opacity-70 transition-opacity">
            {t("nav.catalog")}
          </Link>
          <Link to="/devis" className="hover:opacity-70 transition-opacity inline-flex items-center gap-1.5">
            <ShoppingBag className="size-4" />
            {t("nav.quote")}
            {count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full bg-accent text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch lang={lang} setLang={setLang} transparent={transparent} />
          <button
            type="button"
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-border text-foreground">
          <nav className="container-x py-4 flex flex-col gap-3 text-sm font-medium">
            <Link to="/" className="py-2">{t("nav.home")}</Link>
            <Link to="/catalogue" className="py-2">{t("nav.catalog")}</Link>
            <Link to="/devis" className="py-2 inline-flex items-center gap-2">
              <ShoppingBag className="size-4" />
              {t("nav.quote")} {count > 0 && <span className="text-accent">({count})</span>}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function LangSwitch({ lang, setLang, transparent }: { lang: Lang; setLang: (l: Lang) => void; transparent: boolean }) {
  return (
    <div className={cn(
      "flex items-center text-xs font-semibold rounded-full p-0.5 border",
      transparent ? "border-white/30 text-white" : "border-border",
    )}>
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2.5 py-1 rounded-full transition-colors",
            lang === l
              ? (transparent ? "bg-white text-foreground" : "bg-foreground text-background")
              : "opacity-70 hover:opacity-100",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
