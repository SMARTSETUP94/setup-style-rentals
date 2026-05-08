import { Link, Outlet, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { canonicalLink, ogImageMeta, SITE_URL, DEFAULT_OG_IMAGE, hreflangLinks } from "@/lib/seo";
import { applyNotFoundStatus } from "@/lib/ssr-status";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  // Set the real HTTP 404 status during SSR so crawlers and clients
  // receive a proper not-found response (not 200) for unknown routes.
  applyNotFoundStatus();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Setup Paris — Location d'objets événementiels" },
      { name: "description", content: "Personnalisez, configurez, louez. Setup Paris : location d'objets événementiels avec configurateur 3D pour Paris et l'Île-de-France." },
      { name: "author", content: "Setup Paris" },
      { property: "og:title", content: "Setup Paris — Location d'objets événementiels" },
      { property: "og:description", content: "Personnalisez, configurez, louez. Setup Paris : location d'objets événementiels avec configurateur 3D pour Paris et l'Île-de-France." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SetupParis" },
      { name: "twitter:title", content: "Setup Paris — Location d'objets événementiels" },
      { name: "twitter:description", content: "Personnalisez, configurez, louez. Setup Paris : location d'objets événementiels avec configurateur 3D pour Paris et l'Île-de-France." },
      { property: "og:site_name", content: "Setup Paris" },
      { property: "og:locale", content: "fr_FR" },
      ...ogImageMeta(),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      canonicalLink("/"),
      ...hreflangLinks("/"),
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Setup Paris",
          legalName: "Smart Restructuring",
          url: SITE_URL,
          logo: DEFAULT_OG_IMAGE,
          image: DEFAULT_OG_IMAGE,
          description:
            "Location d'objets événementiels personnalisables avec configurateur 3D à Paris et en Île-de-France.",
          areaServed: { "@type": "Place", name: "Paris et Île-de-France" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Paris",
            addressCountry: "FR",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <I18nProvider>
        <CartProvider>
          <SiteShell />
          <Toaster position="top-center" />
        </CartProvider>
      </I18nProvider>
    </AuthProvider>
  );
}

function SiteShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "" : "min-h-screen"}>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
