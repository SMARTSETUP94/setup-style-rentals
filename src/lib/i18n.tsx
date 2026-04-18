import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

const DICT: Dict = {
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.catalog": { fr: "Catalogue", en: "Catalog" },
  "nav.quote": { fr: "Mon devis", en: "My quote" },
  "nav.admin": { fr: "Admin", en: "Admin" },

  "hero.eyebrow": { fr: "Setup Paris — Location événementielle", en: "Setup Paris — Event Rental" },
  "hero.title": { fr: "Location d'objets événementiels", en: "Event object rentals" },
  "hero.sub": { fr: "Personnalisez, configurez, louez.", en: "Customize, configure, rent." },
  "hero.cta": { fr: "Découvrir le catalogue", en: "Explore the catalog" },
  "hero.cta2": { fr: "Configurateur 3D", en: "3D Configurator" },

  "cats.title": { fr: "Univers", en: "Categories" },
  "cats.sub": { fr: "Cinq univers pour composer votre événement", en: "Five worlds to compose your event" },

  "featured.title": { fr: "Sélection", en: "Featured" },
  "featured.sub": { fr: "Une sélection d'objets prêts à louer", en: "A handpicked selection ready to rent" },
  "featured.all": { fr: "Voir tout le catalogue", en: "Browse all products" },

  "config.title": { fr: "Configurateur 3D", en: "3D Configurator" },
  "config.desc": { fr: "Personnalisez chaque produit en temps réel : dimensions, couleurs, marquage. Visualisez le rendu final avant de louer.", en: "Customize each product in real time: dimensions, colors, branding. Preview the final result before renting." },

  "how.title": { fr: "Comment ça marche", en: "How it works" },
  "how.s1.t": { fr: "Choisissez vos objets", en: "Pick your items" },
  "how.s1.d": { fr: "Parcourez le catalogue et ajoutez vos coups de cœur à votre devis.", en: "Browse the catalog and add your favorites to your quote." },
  "how.s2.t": { fr: "Configurez & personnalisez", en: "Configure & customize" },
  "how.s2.d": { fr: "Ajustez dimensions, couleurs et marquage dans le configurateur 3D.", en: "Adjust dimensions, colors and branding in the 3D configurator." },
  "how.s3.t": { fr: "On livre, vous profitez", en: "We deliver, you enjoy" },
  "how.s3.d": { fr: "Notre équipe livre, installe et reprend. Vous n'avez plus qu'à profiter.", en: "Our team delivers, sets up and picks up. All you do is enjoy." },

  "catalog.title": { fr: "Catalogue", en: "Catalog" },
  "catalog.search": { fr: "Rechercher un produit…", en: "Search a product…" },
  "catalog.all": { fr: "Toutes les catégories", en: "All categories" },
  "catalog.sort.featured": { fr: "Mise en avant", en: "Featured" },
  "catalog.sort.priceAsc": { fr: "Prix croissant", en: "Price ascending" },
  "catalog.sort.priceDesc": { fr: "Prix décroissant", en: "Price descending" },
  "catalog.sort.name": { fr: "Nom", en: "Name" },
  "catalog.empty": { fr: "Aucun produit ne correspond.", en: "No matching products." },
  "catalog.viewDetails": { fr: "Voir détails", en: "View details" },
  "catalog.from": { fr: "À partir de", en: "From" },
  "catalog.perDay": { fr: "/ jour", en: "/ day" },
  "catalog.fromPerDay": { fr: "À partir de", en: "From" },
  "catalog.perDayShort": { fr: "€/jour", en: "€/day" },

  "product.day": { fr: "Jour", en: "Day" },
  "product.week": { fr: "Semaine", en: "Week" },
  "product.month": { fr: "Mois", en: "Month" },
  "product.deposit": { fr: "Caution", en: "Deposit" },
  "product.qty": { fr: "Quantité", en: "Quantity" },
  "product.startDate": { fr: "Date de début", en: "Start date" },
  "product.endDate": { fr: "Date de fin", en: "End date" },
  "product.duration": { fr: "Durée", en: "Duration" },
  "product.days": { fr: "jour(s)", en: "day(s)" },
  "product.subtotal": { fr: "Sous-total HT", en: "Subtotal excl. tax" },
  "product.discount": { fr: "Remise volume", en: "Volume discount" },
  "product.addToQuote": { fr: "Ajouter au devis", en: "Add to quote" },
  "product.added": { fr: "Ajouté à votre devis", en: "Added to your quote" },
  "product.config3d": { fr: "Configurer en 3D", en: "Configure in 3D" },
  "product.options": { fr: "Options", en: "Options" },
  "product.back": { fr: "Retour au catalogue", en: "Back to catalog" },
  "product.notFound": { fr: "Produit introuvable", en: "Product not found" },

  "cart.title": { fr: "Demande de devis", en: "Quote request" },
  "cart.empty": { fr: "Votre devis est vide.", en: "Your quote is empty." },
  "cart.continue": { fr: "Parcourir le catalogue", en: "Browse the catalog" },
  "cart.remove": { fr: "Retirer", en: "Remove" },
  "cart.totals": { fr: "Récapitulatif", en: "Summary" },
  "cart.subtotalHT": { fr: "Sous-total HT", en: "Subtotal excl. tax" },
  "cart.totalHT": { fr: "Total HT", en: "Total excl. tax" },
  "cart.vat": { fr: "TVA 20%", en: "VAT 20%" },
  "cart.totalTTC": { fr: "Total TTC", en: "Total incl. tax" },
  "cart.deposits": { fr: "Cautions (remboursables)", en: "Deposits (refundable)" },
  "cart.delivery": { fr: "Livraison & Reprise", en: "Delivery & Pickup" },
  "cart.deliveryNote": { fr: "Forfait : 100 € + 50 € par article", en: "Flat fee: €100 + €50 per item" },
  "cart.exportPdf": { fr: "Exporter en PDF", en: "Export as PDF" },
  "cart.formTitle": { fr: "Vos coordonnées", en: "Your details" },
  "cart.name": { fr: "Nom complet", en: "Full name" },
  "cart.company": { fr: "Entreprise", en: "Company" },
  "cart.email": { fr: "Email", en: "Email" },
  "cart.phone": { fr: "Téléphone", en: "Phone" },
  "cart.eventDate": { fr: "Date de l'événement", en: "Event date" },
  "cart.eventLocation": { fr: "Lieu", en: "Location" },
  "cart.message": { fr: "Message", en: "Message" },
  "cart.submit": { fr: "Envoyer ma demande", en: "Send my request" },
  "cart.sent": { fr: "Demande envoyée. Notre équipe vous recontacte sous 24h.", en: "Request sent. Our team will contact you within 24h." },
  "cart.error": { fr: "Erreur lors de l'envoi.", en: "An error occurred." },

  "footer.tagline": { fr: "Création et location d'objets événementiels.", en: "Event object design and rental." },
  "footer.rights": { fr: "Tous droits réservés.", en: "All rights reserved." },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "setup-paris-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  };

  const t = (key: string) => {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[lang];
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function pickLang(obj: unknown, base: string, lang: Lang): string {
  if (!obj || typeof obj !== "object") return "";
  const value = (obj as Record<string, unknown>)[`${base}_${lang}`];
  return typeof value === "string" ? value : "";
}
