import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export type Lang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

const DICT: Dict = {
  "nav.home": { fr: "Accueil", en: "Home" },
  "nav.catalog": { fr: "Catalogue", en: "Catalog" },
  "nav.quote": { fr: "Ma demande", en: "My request" },
  "nav.admin": { fr: "Admin", en: "Admin" },
  "nav.contact": { fr: "Contact", en: "Contact" },
  "nav.custom": { fr: "Sur mesure", en: "Custom-made" },
  "sm.blockRental": { fr: "Location", en: "Rental" },
  "sm.blockCustom": { fr: "Fabrication sur mesure", en: "Custom-made production" },
  "sm.reference": { fr: "Référence", en: "Reference" },
  "sm.edit": { fr: "Modifier", en: "Edit" },
  "sm.priceOnQuote": { fr: "Prix et délai de fabrication confirmés sous 48 h ouvrées", en: "Price and production time confirmed within two business days" },
  "sm.customDeliveryNote": { fr: "Livraison et pose du sur-mesure : sur devis", en: "Delivery and installation of custom pieces: on quote" },
  "cart.estimateNote": { fr: "Estimation indicative. Le devis final dépend des disponibilités et de la logistique.", en: "Indicative estimate. The final quote depends on availability and logistics." },
  "cart.confirm.replyCustom": { fr: "Pour le sur-mesure : prix et délai de fabrication confirmés sous 48 h ouvrées.", en: "Custom-made: price and production time confirmed within two business days." },
  "sm.plusCustom": { fr: "+ {n} pièce(s) sur mesure : prix sur devis", en: "+ {n} custom-made piece(s): price on quote" },
  "sm.teamWillQuote": { fr: "Votre demande sera chiffrée par notre équipe", en: "Our team will price your request" },
  "sm.deliveryDate": { fr: "Date de livraison souhaitée", en: "Preferred delivery date" },
  "sm.afterEvent": { fr: "Après l'événement", en: "After the event" },
  "sm.after.keep": { fr: "Je garde la pièce", en: "I keep the piece" },
  "sm.after.pickup": { fr: "Reprise par Setup Paris", en: "Collected by Setup Paris" },
  "sm.after.discuss": { fr: "À discuter", en: "To be discussed" },
  "sm.samples": { fr: "Je souhaite recevoir un nuancier ou un échantillon de finition", en: "I'd like to receive a colour chart or a finish sample" },
  "sm.heroCta": { fr: "Faire fabriquer sur mesure", en: "Have it custom-made" },
  "sm.twoWaysTitle": { fr: "Deux façons de faire : louer ou faire fabriquer", en: "Two ways to go: rent or have it made" },
  "sm.rentTitle": { fr: "Louer", en: "Rent" },
  "sm.rentText": { fr: "Les objets du catalogue, selon stock, à la journée.", en: "Items from our catalogue, subject to stock, by the day." },
  "sm.makeTitle": { fr: "Faire fabriquer", en: "Have it made" },
  "sm.makeText": { fr: "À vos cotes et finitions, configuré en 3D : la pièce vous appartient.", en: "To your dimensions and finishes, configured in 3D: the piece is yours." },
  "sm.productLink": { fr: "Besoin d'autres dimensions ? Le faire fabriquer sur mesure", en: "Need other dimensions? Have it custom-made" },
  "cart.logistics": { fr: "Logistique", en: "Logistics" },
  "cart.emptyHint": { fr: "Choisissez vos objets dans le catalogue pour composer votre demande, sans engagement.", en: "Choose items from the catalogue to put together your request, with no obligation." },
  "cart.emptyContact": { fr: "Une question ? Contactez-nous", en: "A question? Contact us" },

  "hero.eyebrow": { fr: "Setup Paris — Location événementielle", en: "Setup Paris — Event Rental" },
  "hero.title": { fr: "Location d'objets événementiels", en: "Event object rentals" },
  "hero.sub": { fr: "Personnalisez, configurez, louez.", en: "Customize, configure, rent." },
  "hero.cta": { fr: "Découvrir le catalogue", en: "Explore the catalog" },
  "hero.cta2": { fr: "Configurateur 3D", en: "3D Configurator" },

  "trust.delivery": { fr: "Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis", en: "Delivery, setup and pickup: indicative flat fee for Paris & Île-de-France, confirmed in the quote" },
  "trust.custom": { fr: "Objets personnalisables", en: "Customizable items" },
  "trust.quote": { fr: "Demande de devis en ligne, réponse sous 24 h ouvrées", en: "Online quote request, reply within one business day" },
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
  "how.s1.d": { fr: "Parcourez le catalogue et ajoutez vos coups de cœur à votre demande.", en: "Browse the catalog and add your favorites to your request." },
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
  "product.addToQuote": { fr: "Ajouter à ma demande", en: "Add to my request" },
  "product.customize3d": { fr: "Personnaliser en 3D", en: "Customise in 3D" },
  "product.view3d": { fr: "Voir en 3D", en: "View in 3D" },
  "catalog.perEvent": { fr: "HT / événement", en: "excl. VAT / event" },
  "product.perEventUpTo": { fr: "HT par événement (jusqu'à {n} jours)", en: "excl. VAT per event (up to {n} days)" },
  "product.perExtraDay": { fr: "HT par jour supplémentaire", en: "excl. VAT per extra day" },
  "product.stockNote": {
    fr: "Objet tel qu'en stock. Finitions et personnalisation en supplément ; livraison, installation et reprise en sus.",
    en: "Item as in stock. Finishes and customisation extra; delivery, setup and pickup extra.",
  },
  "product.customise": { fr: "Personnaliser", en: "Customise" },
  "product.perUnit": { fr: "HT / unité", en: "excl. VAT / unit" },
  "product.customNote": { fr: "Couleur ou visuel à préciser dans votre demande ; délai confirmé dans le devis.", en: "Colour or artwork to be specified in your request; lead time confirmed in the quote." },
  "product.eventPrice": { fr: "Prix événement", en: "Event price" },
  "product.extraDays": { fr: "Jours supplémentaires", en: "Extra days" },
  "product.customisation": { fr: "Personnalisation", en: "Customisation" },
  "product.standardVersion": { fr: "Version standard", en: "Standard version" },
  "product.requiredFieldError": { fr: "Choisissez une option.", en: "Please choose an option." },
  "product.added": { fr: "Ajouté à votre demande", en: "Added to your request" },
  "product.config3d": { fr: "Configurer en 3D", en: "Configure in 3D" },
  "product.options": { fr: "Options", en: "Options" },
  "product.back": { fr: "Retour au catalogue", en: "Back to catalog" },
  "product.notFound": { fr: "Produit introuvable", en: "Product not found" },

  "cart.title": { fr: "Ma demande", en: "My request" },
  "cart.empty": { fr: "Votre demande est vide.", en: "Your request is empty." },
  "cart.continue": { fr: "Parcourir le catalogue", en: "Browse the catalog" },
  "cart.remove": { fr: "Retirer", en: "Remove" },
  "cart.totals": { fr: "Récapitulatif", en: "Summary" },
  "cart.subtotalHT": { fr: "Sous-total HT", en: "Subtotal excl. tax" },
  "cart.totalHT": { fr: "Total HT", en: "Total excl. tax" },
  "cart.vat": { fr: "TVA 20%", en: "VAT 20%" },
  "cart.totalTTC": { fr: "Total TTC", en: "Total incl. tax" },
  "cart.deposits": { fr: "Cautions (remboursables)", en: "Deposits (refundable)" },
  "cart.delivery": { fr: "Livraison", en: "Delivery" },
  "cart.deliveryNote": { fr: "Livraison, installation et reprise : forfait indicatif pour Paris et l'Île-de-France, confirmé par devis", en: "Delivery, setup and pickup: indicative flat fee for Paris & Île-de-France, confirmed in the quote" },
  "cart.exportPdf": { fr: "Télécharger l'estimation (PDF)", en: "Download estimate (PDF)" },
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
  "cart.sent": { fr: "Demande envoyée. Notre équipe vous répond sous 24 h ouvrées.", en: "Request sent. Our team will reply within one business day." },
  "cart.error": { fr: "L'envoi n'a pas abouti. Réessayez dans un instant ou écrivez à devis@setup.paris.", en: "Your request could not be sent. Try again in a moment or email devis@setup.paris." },
  "cart.rateLimited": { fr: "Trop de demandes, réessayez dans quelques minutes.", en: "Too many requests, please try again in a few minutes." },
  "cart.stockError": { fr: "Stock insuffisant :", en: "Insufficient stock:" },
  "cart.available": { fr: "disponible(s)", en: "available" },
  "cart.confirm.title": { fr: "Demande envoyée", en: "Request sent" },
  "cart.confirm.number": { fr: "Numéro de demande", en: "Request number" },
  "cart.confirm.reply": { fr: "Notre équipe vous répond sous 24 h ouvrées.", en: "Our team will reply within one business day." },
  "cart.confirm.emailFailed": { fr: "Nous avons bien enregistré votre demande, mais le mail de confirmation n'a pas pu partir : notez votre numéro.", en: "Your request has been saved, but the confirmation email could not be sent: please note your number." },
  "cart.confirm.summary": { fr: "Récapitulatif soumis", en: "Submitted summary" },
  "cart.confirm.back": { fr: "Retour au catalogue", en: "Back to the catalogue" },

  "footer.tagline": { fr: "Création et location d'objets événementiels.", en: "Event object design and rental." },
  "footer.rights": { fr: "Tous droits réservés.", en: "All rights reserved." },
  "footer.legal": { fr: "Légal", en: "Legal" },
  "footer.cgl": { fr: "Conditions générales de location", en: "General rental terms" },
  "footer.legalNotice": { fr: "Mentions légales", en: "Legal notice" },

  // Catalog extras
  "catalog.results": { fr: "résultats", en: "results" },
  "catalog.result": { fr: "résultat", en: "result" },

  // Catalog availability + price filter
  "catalog.dates": { fr: "Disponibilité", en: "Availability" },
  "catalog.startDate": { fr: "Date de début", en: "Start date" },
  "catalog.endDate": { fr: "Date de fin", en: "End date" },
  "catalog.clearDates": { fr: "Effacer les dates", en: "Clear dates" },
  "catalog.priceRange": { fr: "Prix / événement", en: "Price / event" },
  "catalog.unavailable": { fr: "Indisponible", en: "Unavailable" },
  "catalog.checkingAvailability": { fr: "Vérification de la disponibilité…", en: "Checking availability…" },
  "catalog.faq": { fr: "Questions fréquentes", en: "Frequently asked questions" },
  "catalog.aboutCategory": { fr: "À propos", en: "About" },

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
    fr: "Cette configuration sera incluse dans votre demande avec les dates et quantités ci-dessus.",
    en: "This configuration will be included in your request along with the dates and quantities above.",
  },
  "product.addWithConfig": { fr: "Ajouter à ma demande", en: "Add to my request" },
  "product.configuredAdded": { fr: "Produit configuré ajouté à votre demande", en: "Configured product added to request" },
  "product.configSavedToast": { fr: "✓ Configuration enregistrée pour votre demande", en: "✓ Configuration saved for your request" },
  "product.optionsFrom3D": { fr: "Options reprises de votre configuration 3D", en: "Options taken from your 3D configuration" },
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
  "cart.quoteSimulation": { fr: "Ma demande", en: "My request" },
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
  "product.configRecapTitle": {
    fr: "Récapitulatif de votre configuration 3D",
    en: "Your 3D configuration summary",
  },
  "product.configRecapNotice": {
    fr: "Important : ce récapitulatif sera joint à votre devis comme commentaire. Vous devez tout de même sélectionner les options de personnalisation tarifées ci-dessous pour valider votre choix.",
    en: "Important: this summary will be attached to your quote as a comment. You still need to select the priced customization options below to confirm your choice.",
  },
  "product.optionsStillRequired": {
    fr: "Sélectionnez vos options de personnalisation",
    en: "Select your customization options",
  },
  "product.add3DToQuote": {
    fr: "Ajouter à ma demande",
    en: "Add to my request",
  },
  "product.unitsAvailable": {
    fr: "unité(s) disponible(s) sur cette période",
    en: "unit(s) available for these dates",
  },
  "product.configChosenTitle": {
    fr: "Configuration choisie",
    en: "Chosen configuration",
  },
  "product.modifyConfig": {
    fr: "Modifier",
    en: "Edit",
  },
  "product.configRequiredFirst": {
    fr: "Configurez d'abord votre produit en 3D",
    en: "Configure your product in 3D first",
  },
  "product.configUnrenderable": {
    fr: "Configuration disponible, mais contenu non affichable",
    en: "Configuration available, but content cannot be displayed",
  },
  "product.confirmClose3DTitle": {
    fr: "Fermer le configurateur ?",
    en: "Close the configurator?",
  },
  "product.confirmClose3DDesc": {
    fr: "Vous avez modifié votre configuration mais ne l'avez pas enregistrée dans le configurateur. Si vous fermez maintenant, votre dernière sélection sera tout de même conservée pour votre devis.",
    en: "You changed your configuration but didn't save it in the configurator. If you close now, your latest selection will still be kept for your quote.",
  },
  "product.confirmClose3DKeepOpen": {
    fr: "Continuer à configurer",
    en: "Keep configuring",
  },
  "product.confirmClose3DLeave": {
    fr: "Fermer et garder ma configuration",
    en: "Close and keep my configuration",
  },

  // Common
  "a11y.skip": { fr: "Aller au contenu", en: "Skip to content" },
  "common.back": { fr: "Retour", en: "Back" },
  "common.home": { fr: "Accueil", en: "Home" },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

/**
 * Language is derived from the URL: /en/... = English, everything else = French.
 * (Internally the router sees ?lang=en, see src/lib/lang-url.ts.)
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const lang: Lang = useRouterState({
    select: (st) => ((st.location.search as { lang?: string }).lang === "en" ? "en" : "fr"),
  });
  const navigate = useNavigate();

  // Keep <html lang> in sync on client navigations (SSR sets it in the shell).
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    if (next === lang) return;
    void navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({ ...prev, lang: next === "en" ? "en" : undefined }),
      hash: (h: string | undefined) => h ?? "",
    } as never);
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
