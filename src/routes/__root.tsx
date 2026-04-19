import { Outlet, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Retour à l'accueil
          </a>
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
      { name: "twitter:title", content: "Setup Paris — Location d'objets événementiels" },
      { name: "twitter:description", content: "Personnalisez, configurez, louez. Setup Paris : location d'objets événementiels avec configurateur 3D pour Paris et l'Île-de-France." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b2e6bdb0-ea86-4a8e-b066-12994325d5fb/id-preview-a5ab9426--d2f52a27-1cab-4bee-9166-44f0884a2d40.lovable.app-1776512582671.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
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
