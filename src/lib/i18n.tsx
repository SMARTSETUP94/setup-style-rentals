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

  "trust.delivery": { fr: "Livraison & reprise incluses", en: "Delivery & pickup included" },
  "trust.custom": { fr: "Objets personnalisables", en: "Customizable items" },
  "trust.quote": { fr: "Devis instantané", en: "Instant quote" },
  "trust.bespoke": { fr: "Sur-mesure disponible", en: "Bespoke available" },

  "clients.label": { fr: "Ils nous font confiance", en: "Trusted by" },

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
  "cart.deliveryNote": { fr: "Inclut livraison et reprise sur Paris/IDF", en: "Includes delivery and pickup in Paris/IDF" },
  "cart.exportPdf": { fr: "Exporter en PDF", en: "Export as PDF" },
  "cart.formTitle": { fr: "Vos coordonnées", en: "Your details" },
  "cart.name": { fr: "Nom complet", en: "Full name" },
  "cart.company": { fr: "Entreprise", en: "Company" },
  "cart.email": { fr: "Email", en: "Email" },
  "cart.phone": { fr: "Téléphone", en: "Phone" },
  "cart.eventDate": { fr: "Date de l'événement", en: "Event date" },
  "cart.eventLocation": { fr: "Lieu", en: "Location" },
  "cart.deliveryTime": { fr: "Heure de livraison", en: "Delivery time" },
  "cart.pickupTime": { fr: "Heure de reprise", en: "Pickup time" },
  "cart.timesHint": { fr: "Indiquez vos créneaux souhaités. Notre équipe vous confirmera les horaires définitifs.", en: "Indicate your preferred time slots. Our team will confirm the final times." },
  "cart.message": { fr: "Message", en: "Message" },
  "cart.submit": { fr: "Envoyer ma demande", en: "Send my request" },
  "cart.sent": { fr: "Demande envoyée. Notre équipe vous recontacte sous 24h.", en: "Request sent. Our team will contact you within 24h." },
  "cart.error": { fr: "Erreur lors de l'envoi.", en: "An error occurred." },

  "footer.tagline": { fr: "Création et location d'objets événementiels.", en: "Event object design and rental." },
  "footer.rights": { fr: "Tous droits réservés.", en: "All rights reserved." },
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.cgl": { fr: "Conditions générales de location", en: "General rental terms" },
  "footer.legalNotice": { fr: "Mentions légales", en: "Legal notice" },

  // Catalog extras
  "catalog.results": { fr: "résultats", en: "results" },
  "catalog.result": { fr: "résultat", en: "result" },

  // Product page extras
  "product.pickDate": { fr: "Choisir une date", en: "Pick a date" },
  "product.customize": { fr: "Personnalisation", en: "Customization" },
  "product.required": { fr: "Requis", en: "Required" },
  "product.clear": { fr: "Désélectionner", en: "Clear" },
  "product.included": { fr: "Inclus", en: "Included" },
  "product.rentalRates": { fr: "Tarifs de location", en: "Rental rates" },
  "product.customizeIn3D": { fr: "Personnaliser en 3D", en: "Customize in 3D" },
  "product.showImage": { fr: "Voir l'image", en: "Show image" },
  "product.fullscreen": { fr: "Plein écran", en: "Fullscreen" },
  "product.threeDConfig": { fr: "Configurateur 3D", en: "3D configurator" },
  "product.yourCustomConfig": { fr: "Votre configuration personnalisée", en: "Your custom configuration" },
  "product.threeDConfiguration": { fr: "Configuration 3D", en: "3D configuration" },
  "product.resetConfig": { fr: "Réinitialiser", en: "Reset" },
  "product.resetConfigTitle": { fr: "Réinitialiser la configuration", en: "Reset configuration" },
  "product.configReset": { fr: "Configuration réinitialisée", en: "Configuration reset" },
  "product.configuredPrice": { fr: "Prix configuré", en: "Configured price" },
  "product.configIncludedNote": {
    fr: "Cette configuration sera incluse dans votre devis avec les dates et quantités ci-dessus.",
    en: "This configuration will be included in your quote along with the dates and quantities above.",
  },
  "product.addWithConfig": { fr: "Ajouter au devis avec ma configuration", en: "Add to quote with my configuration" },
  "product.configuredAdded": { fr: "Produit configuré ajouté au devis", en: "Configured product added to quote" },
  "product.autoSelectedHint": { fr: "Sélectionné via le configurateur 3D", en: "Auto-selected from 3D configurator" },
  "product.checkingAvail": { fr: "Vérification de la disponibilité…", en: "Checking availability…" },
  "product.notChecked": { fr: "Disponibilité non vérifiée", en: "Availability not checked" },
  "product.unavailable": { fr: "Indisponible sur cette période", en: "Unavailable for these dates" },
  "product.qtyDecrease": { fr: "Diminuer la quantité", en: "Decrease quantity" },
  "product.qtyIncrease": { fr: "Augmenter la quantité", en: "Increase quantity" },
  "product.daysDecrease": { fr: "Diminuer la durée", en: "Decrease duration" },
  "product.daysIncrease": { fr: "Augmenter la durée", en: "Increase duration" },
  "product.volumeDiscounts": { fr: "Remises quantité", en: "Volume discounts" },
  "product.durationDiscounts": { fr: "Remises durée", en: "Duration discounts" },
  "product.from": { fr: "dès", en: "from" },
  "product.daysShort": { fr: "j", en: "d" },
  "logoUpload.cta": { fr: "Téléverser votre logo", en: "Upload your logo" },
  "logoUpload.hint": { fr: "PNG, JPG, SVG ou PDF — 10 Mo max", en: "PNG, JPG, SVG or PDF — 10 MB max" },
  "logoUpload.uploading": { fr: "Envoi en cours…", en: "Uploading…" },
  "logoUpload.success": { fr: "Logo téléversé", en: "Logo uploaded" },
  "logoUpload.removed": { fr: "Logo retiré", en: "Logo removed" },
  "logoUpload.preview": { fr: "Voir le fichier", en: "View file" },
  "logoUpload.remove": { fr: "Retirer le logo", en: "Remove logo" },
  "logoUpload.errInvalidType": { fr: "Format non supporté. PNG, JPG, SVG ou PDF uniquement.", en: "Unsupported format. PNG, JPG, SVG or PDF only." },
  "logoUpload.errTooLarge": { fr: "Fichier trop volumineux (10 Mo max).", en: "File too large (10 MB max)." },
  "logoUpload.errUpload": { fr: "Échec du téléversement. Réessayez.", en: "Upload failed. Try again." },
  "logoUpload.required": { fr: "Logo requis pour cette option", en: "Logo required for this option" },
  "logoUpload.attachedLabel": { fr: "Logo client", en: "Client logo" },

  // Cart/quote extras
  "cart.setup": { fr: "Installation", en: "Setup" },
  "cart.pickup": { fr: "Reprise", en: "Pickup" },
  "cart.configRecap": { fr: "Configuration 3D", en: "3D configuration" },
  "cart.pickDates": { fr: "Choisir les dates de location", en: "Pick rental dates" },
  "cart.quoteSimulation": { fr: "Simulation de devis", en: "Quote simulation" },
  "cart.col.product": { fr: "Produit", en: "Product" },
  "cart.col.qty": { fr: "Qté", en: "Qty" },
  "cart.col.days": { fr: "Jours", en: "Days" },
  "cart.col.unitDay": { fr: "PU/jour", en: "Unit/day" },
  "cart.col.discount": { fr: "Remise", en: "Discount" },

  // Product page extras (configurator + reset + insufficient stock)
  "product.insufficientStock": {
    fr: "Stock insuffisant pour cette période.",
    en: "Insufficient stock for these dates.",
  },
  "product.selectRequired": {
    fr: "Veuillez sélectionner les options requises.",
    en: "Please select the required options.",
  },
  "product.configResetToast": {
    fr: "Configuration réinitialisée",
    en: "Configuration reset",
  },
  "product.yourConfiguration": { fr: "Votre configuration", en: "Your configuration" },
  "product.summary": { fr: "Récapitulatif", en: "Summary" },
  "product.configHint": {
    fr: "Personnalisez le produit dans le configurateur ci-dessus pour voir le récapitulatif apparaître dans le panneau de droite.",
    en: "Customize the product in the configurator above to see the summary in the right panel.",
  },
  "product.close": { fr: "Fermer", en: "Close" },
  "product.close3D": { fr: "Fermer le configurateur 3D", en: "Close 3D configurator" },
  "product.optionsManagedIn3D": {
    fr: "Options gérées dans le configurateur 3D ci-dessus.",
    en: "Options are managed in the 3D configurator above.",
  },
  "product.add3DToQuote": {
    fr: "Ajouter cette configuration au devis",
    en: "Add this configuration to quote",
  },
  "product.unitsAvailable": {
    fr: "unité(s) disponible(s) sur cette période",
    en: "unit(s) available for these dates",
  },

  // Common
  "common.back": { fr: "Retour", en: "Back" },
  "common.home": { fr: "Accueil", en: "Home" },
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

  // Keep <html lang> in sync with the current language for a11y/SEO.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

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
