import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AdminLang = "fr" | "en";

type Dict = Record<string, { fr: string; en: string }>;

const DICT: Dict = {
  // Layout / sidebar
  "layout.loading": { fr: "Chargement…", en: "Loading…" },
  "layout.quotes": { fr: "Devis", en: "Quotes" },
  "layout.calendar": { fr: "Calendrier", en: "Calendar" },
  "layout.categories": { fr: "Catégories", en: "Categories" },
  "layout.clients": { fr: "Clients", en: "Clients" },

  // Clients (CRM)
  "clients.title": { fr: "Clients", en: "Clients" },
  "clients.sub": { fr: "Base de contacts unifiée, alimentée automatiquement par les devis.", en: "Unified contact base, automatically fed from quotes." },
  "clients.search": { fr: "Rechercher (nom, email, société, tag…)", en: "Search (name, email, company, tag…)" },
  "clients.empty": { fr: "Aucun client.", en: "No client." },
  "clients.noResults": { fr: "Aucun client ne correspond à la recherche.", en: "No client matches the search." },
  "clients.col.name": { fr: "Nom", en: "Name" },
  "clients.col.email": { fr: "Email", en: "Email" },
  "clients.col.company": { fr: "Société", en: "Company" },
  "clients.col.phone": { fr: "Téléphone", en: "Phone" },
  "clients.col.quotes": { fr: "Devis", en: "Quotes" },
  "clients.col.revenue": { fr: "CA total TTC", en: "Total revenue" },
  "clients.col.last": { fr: "Dernier contact", en: "Last contact" },
  "clients.col.tags": { fr: "Tags", en: "Tags" },
  "clients.fiche": { fr: "Fiche client", en: "Client profile" },
  "clients.notes": { fr: "Notes internes", en: "Internal notes" },
  "clients.notesPh": { fr: "Notes privées sur ce client…", en: "Private notes on this client…" },
  "clients.tagsLabel": { fr: "Tags", en: "Tags" },
  "clients.addTag": { fr: "Ajouter un tag…", en: "Add a tag…" },
  "clients.history": { fr: "Historique des devis", en: "Quote history" },
  "clients.noHistory": { fr: "Aucun devis pour ce client.", en: "No quote for this client." },
  "clients.totalQuotes": { fr: "devis", en: "quotes" },
  "clients.saved": { fr: "Client mis à jour", en: "Client updated" },
  "clients.saveError": { fr: "Erreur lors de la mise à jour", en: "Update failed" },
  "clients.openQuote": { fr: "Voir", en: "View" },

  // Calendar
  "cal.title": { fr: "Calendrier des événements", en: "Events calendar" },
  "cal.sub": { fr: "Devis confirmés et livrés positionnés sur leurs dates d'événement.", en: "Confirmed and delivered quotes placed on their event dates." },
  "cal.prev": { fr: "Mois précédent", en: "Previous month" },
  "cal.next": { fr: "Mois suivant", en: "Next month" },
  "cal.today": { fr: "Aujourd'hui", en: "Today" },
  "cal.empty": { fr: "Aucun événement ce mois-ci.", en: "No events this month." },
  "cal.more": { fr: "de plus", en: "more" },
  "cal.openQuote": { fr: "Voir le devis", en: "View quote" },
  "cal.view.month": { fr: "Mois", en: "Month" },
  "cal.view.week": { fr: "Semaine", en: "Week" },
  "cal.view.list": { fr: "Liste", en: "List" },
  "cal.search": { fr: "Rechercher un client…", en: "Search a client…" },
  "cal.filters.status": { fr: "Statuts", en: "Statuses" },
  "cal.conflict": { fr: "Conflit de stock", en: "Stock conflict" },
  "cal.conflictDetail": { fr: "Sur-réservation", en: "Overbooked" },
  "cal.noResults": { fr: "Aucun devis ne correspond aux filtres.", en: "No quote matches the filters." },
  "layout.products": { fr: "Produits", en: "Products" },
  "layout.settings": { fr: "Paramètres", en: "Settings" },
  "layout.signOut": { fr: "Déconnexion", en: "Sign out" },
  "layout.lang": { fr: "Langue", en: "Language" },

  // Auth
  "auth.title": { fr: "Espace administrateur", en: "Admin area" },
  "auth.sub": { fr: "Connectez-vous pour gérer le catalogue et les devis.", en: "Sign in to manage the catalog and quotes." },
  "auth.email": { fr: "Email", en: "Email" },
  "auth.password": { fr: "Mot de passe", en: "Password" },
  "auth.signIn": { fr: "Se connecter", en: "Sign in" },
  "auth.invalidEmail": { fr: "Email invalide", en: "Invalid email" },
  "auth.passwordTooShort": { fr: "Mot de passe trop court", en: "Password too short" },
  "auth.success": { fr: "Connexion réussie", en: "Signed in" },
  "auth.notAdmin": { fr: "Ce compte n'a pas les droits administrateur.", en: "This account does not have admin rights." },

  // Common
  "common.cancel": { fr: "Annuler", en: "Cancel" },
  "common.save": { fr: "Enregistrer", en: "Save" },
  "common.saving": { fr: "Enregistrement…", en: "Saving…" },
  "common.create": { fr: "Créer", en: "Create" },
  "common.edit": { fr: "Modifier", en: "Edit" },
  "common.delete": { fr: "Supprimer", en: "Delete" },
  "common.add": { fr: "Ajouter", en: "Add" },
  "common.required": { fr: "Requis", en: "Required" },
  "common.active": { fr: "Actif", en: "Active" },
  "common.order": { fr: "Ordre", en: "Order" },
  "common.image": { fr: "Image", en: "Image" },
  "common.replace": { fr: "Remplacer", en: "Replace" },
  "common.remove": { fr: "Retirer", en: "Remove" },
  "common.uploading": { fr: "Téléversement…", en: "Uploading…" },
  "common.dragImage": { fr: "Glissez une image ou cliquez pour choisir", en: "Drag an image or click to choose" },
  "common.imageHint": { fr: "PNG, JPG, WEBP — max 5 Mo", en: "PNG, JPG, WEBP — max 5 MB" },
  "common.orPasteUrl": { fr: "ou collez une URL d'image", en: "or paste an image URL" },
  "common.imageMustBe": { fr: "Le fichier doit être une image", en: "File must be an image" },
  "common.imageTooLarge": { fr: "Image trop lourde (max 5 Mo)", en: "Image too large (max 5 MB)" },
  "common.imageUploaded": { fr: "Image téléversée", en: "Image uploaded" },
  "common.preview": { fr: "Aperçu", en: "Preview" },
  "common.tier": { fr: "Palier", en: "Tier" },

  // Quotes (admin.index)
  "quotes.title": { fr: "Demandes de devis", en: "Quote requests" },
  "quotes.count": { fr: "demande(s)", en: "request(s)" },
  "quotes.col.date": { fr: "Date", en: "Date" },
  "quotes.col.client": { fr: "Client", en: "Customer" },
  "quotes.col.email": { fr: "Email", en: "Email" },
  "quotes.col.event": { fr: "Événement", en: "Event" },
  "quotes.col.totalTtc": { fr: "Total TTC", en: "Total incl. VAT" },
  "quotes.col.status": { fr: "Statut", en: "Status" },
  "quotes.empty": { fr: "Aucun devis", en: "No quotes" },
  "quotes.products": { fr: "produits", en: "products" },
  "quotes.stockReserved": { fr: "Stock réservé", en: "Stock reserved" },
  "quotes.blocking": { fr: "Ce devis bloque le stock sur les dates demandées", en: "This quote blocks stock on the requested dates" },
  "quotes.notBlocking": { fr: "Ce devis ne bloque pas le stock", en: "This quote does not block stock" },
  "quotes.statusUpdated": { fr: "Statut mis à jour", en: "Status updated" },
  "quotes.confirmDelete": { fr: "Supprimer ce devis ?", en: "Delete this quote?" },
  "quotes.deleted": { fr: "Devis supprimé", en: "Quote deleted" },
  "quotes.detail.received": { fr: "Reçu le", en: "Received on" },
  "quotes.detail.phone": { fr: "Téléphone", en: "Phone" },
  "quotes.detail.company": { fr: "Société", en: "Company" },
  "quotes.detail.eventDate": { fr: "Date événement", en: "Event date" },
  "quotes.detail.location": { fr: "Lieu", en: "Location" },
  "quotes.detail.message": { fr: "Message", en: "Message" },
  "quotes.detail.items": { fr: "Articles", en: "Items" },
  "quotes.logistics.title": { fr: "Frais logistiques", en: "Logistics fees" },
  "quotes.logistics.delivery": { fr: "Livraison (€)", en: "Delivery (€)" },
  "quotes.logistics.setup": { fr: "Installation (€)", en: "Setup (€)" },
  "quotes.logistics.pickup": { fr: "Reprise (€)", en: "Pickup (€)" },
  "quotes.logistics.notes": { fr: "Notes logistiques", en: "Logistics notes" },
  "quotes.logistics.saved": { fr: "Frais logistiques enregistrés", en: "Logistics fees saved" },
  "quotes.totals.subHt": { fr: "Sous-total HT", en: "Subtotal excl. VAT" },
  "quotes.totals.ht": { fr: "Total HT", en: "Total excl. VAT" },
  "quotes.totals.vat": { fr: "TVA 20%", en: "VAT 20%" },
  "quotes.totals.productsTtc": { fr: "Total produits TTC", en: "Products total incl. VAT" },
  "quotes.totals.delivery": { fr: "Livraison", en: "Delivery" },
  "quotes.totals.setup": { fr: "Installation", en: "Setup" },
  "quotes.totals.pickup": { fr: "Reprise", en: "Pickup" },
  "quotes.totals.finalTtc": { fr: "TOTAL FINAL TTC", en: "FINAL TOTAL INCL. VAT" },
  "quotes.totals.deposit": { fr: "Caution", en: "Deposit" },
  "quotes.statusNote": { fr: "Les statuts Confirmé et Livré bloquent le stock sur les dates de l'événement.", en: "Confirmed and Delivered statuses block stock on the event dates." },
  "quotes.status.pending": { fr: "Nouveau", en: "New" },
  "quotes.status.contacted": { fr: "En cours", en: "In progress" },
  "quotes.status.confirmed": { fr: "Confirmé", en: "Confirmed" },
  "quotes.status.completed": { fr: "Livré", en: "Delivered" },
  "quotes.status.rejected": { fr: "Retourné", en: "Returned" },

  // Dashboard
  "dash.title": { fr: "Tableau de bord", en: "Dashboard" },
  "dash.quotesMonth": { fr: "Devis ce mois", en: "Quotes this month" },
  "dash.pipeline": { fr: "CA Pipeline", en: "Pipeline revenue" },
  "dash.pipelineHint": { fr: "Tous devis hors retournés", en: "All quotes excl. returned" },
  "dash.engaged": { fr: "CA Engagé", en: "Engaged revenue" },
  "dash.engagedHint": { fr: "Confirmés + Livrés", en: "Confirmed + Delivered" },
  "dash.vsLastMonth": { fr: "vs mois dernier", en: "vs last month" },
  "dash.topProducts": { fr: "Produits les plus demandés", en: "Top requested products" },
  "dash.noProducts": { fr: "Aucun produit demandé ce mois", en: "No products requested this month" },
  "dash.units": { fr: "unités", en: "units" },
  "dash.recent": { fr: "Devis récents", en: "Recent quotes" },

  // Cart slot times (used in admin detail)
  "quotes.slot.delivery": { fr: "Créneau livraison", en: "Delivery slot" },
  "quotes.slot.pickup": { fr: "Créneau reprise", en: "Pickup slot" },

  // Categories
  "cats.title": { fr: "Catégories", en: "Categories" },
  "cats.count": { fr: "catégorie(s)", en: "category(ies)" },
  "cats.add": { fr: "Ajouter une catégorie", en: "Add a category" },
  "cats.col.order": { fr: "Ordre", en: "Order" },
  "cats.col.visual": { fr: "Visuel", en: "Visual" },
  "cats.col.nameFr": { fr: "Nom FR", en: "FR Name" },
  "cats.col.slug": { fr: "Slug", en: "Slug" },
  "cats.col.products": { fr: "Produits", en: "Products" },
  "cats.empty": { fr: "Aucune catégorie", en: "No categories" },
  "cats.editTitle": { fr: "Modifier la catégorie", en: "Edit category" },
  "cats.newTitle": { fr: "Nouvelle catégorie", en: "New category" },
  "cats.field.nameFr": { fr: "Nom FR *", en: "FR Name *" },
  "cats.field.nameEn": { fr: "Nom EN *", en: "EN Name *" },
  "cats.field.slug": { fr: "Slug *", en: "Slug *" },
  "cats.field.icon": { fr: "Icône Lucide (ex: Package)", en: "Lucide icon (e.g. Package)" },
  "cats.field.color": { fr: "Couleur (hex)", en: "Color (hex)" },
  "cats.field.image": { fr: "Image de catégorie", en: "Category image" },
  "cats.field.activeLabel": { fr: "Catégorie active", en: "Category active" },
  "cats.requiredFields": { fr: "Slug, nom FR et nom EN sont requis", en: "Slug, FR name and EN name are required" },
  "cats.created": { fr: "Catégorie créée", en: "Category created" },
  "cats.updated": { fr: "Catégorie modifiée", en: "Category updated" },
  "cats.cantDelete": { fr: "Impossible de supprimer : {n} produit(s) associé(s)", en: "Cannot delete: {n} associated product(s)" },
  "cats.confirmDelete": { fr: "Supprimer la catégorie \"{name}\" ?", en: "Delete category \"{name}\"?" },
  "cats.deleted": { fr: "Catégorie supprimée", en: "Category deleted" },

  // Products
  "prods.title": { fr: "Produits", en: "Products" },
  "prods.countOf": { fr: "produits", en: "products" },
  "prods.searchPlaceholder": { fr: "Rechercher nom, slug…", en: "Search name, slug…" },
  "prods.allCategories": { fr: "Toutes catégories", en: "All categories" },
  "prods.new": { fr: "Nouveau", en: "New" },
  "prods.col.name": { fr: "Nom", en: "Name" },
  "prods.col.category": { fr: "Catégorie", en: "Category" },
  "prods.col.priceDay": { fr: "Prix/j", en: "Price/d" },
  "prods.col.deposit": { fr: "Caution", en: "Deposit" },
  "prods.empty": { fr: "Aucun produit", en: "No products" },
  "prods.option": { fr: "option", en: "option" },
  "prods.options": { fr: "options", en: "options" },
  "prods.editTitle": { fr: "Modifier", en: "Edit" },
  "prods.newTitle": { fr: "Nouveau produit", en: "New product" },
  "prods.field.nameFr": { fr: "Nom FR *", en: "FR Name *" },
  "prods.field.nameEn": { fr: "Nom EN *", en: "EN Name *" },
  "prods.field.slug": { fr: "Slug *", en: "Slug *" },
  "prods.field.category": { fr: "Catégorie *", en: "Category *" },
  "prods.field.descFr": { fr: "Description FR", en: "FR Description" },
  "prods.field.descEn": { fr: "Description EN", en: "EN Description" },
  "prods.field.dimensions": { fr: "Dimensions", en: "Dimensions" },
  "prods.field.image": { fr: "Image produit", en: "Product image" },
  "prods.field.priceDay": { fr: "Prix/jour (€)", en: "Price/day (€)" },
  "prods.field.deposit": { fr: "Caution (€)", en: "Deposit (€)" },
  "prods.field.stock": { fr: "Stock total (unités disponibles)", en: "Total stock (available units)" },
  "prods.field.priceWeek": { fr: "Prix/semaine (€)", en: "Price/week (€)" },
  "prods.field.priceMonth": { fr: "Prix/mois (€)", en: "Price/month (€)" },
  "prods.field.cfgUrl": { fr: "Configurateur 3D (HTML)", en: "3D configurator (HTML)" },
  "prods.field.cfgUrlHint": { fr: "Téléversez un fichier .html simple, ou collez l'URL d'un configurateur externe (ex: Spline, page hébergée).", en: "Upload a simple .html file, or paste the URL of an external configurator (e.g. Spline, hosted page)." },
  "prods.field.cfgUrlWarn": { fr: "⚠️ Les fichiers téléversés ici sont servis avec une politique de sécurité restrictive et ne peuvent pas exécuter de JavaScript (Three.js, WebGL…). Pour un configurateur interactif, hébergez-le sur un service externe et collez son URL.", en: "⚠️ Files uploaded here are served with a restrictive security policy and cannot execute JavaScript (Three.js, WebGL…). For an interactive configurator, host it on an external service and paste its URL." },
  "prods.field.cfgOpts": { fr: "Options du configurateur 3D (JSON)", en: "3D configurator options (JSON)" },
  "prods.field.cfgOptsHint": { fr: "Définit les choix proposés dans l'iframe 3D et leur prix. Envoyé automatiquement au configurateur via postMessage. Exemple Cornhole :", en: "Defines the choices offered in the 3D iframe and their price. Automatically sent to the configurator via postMessage. Cornhole example:" },
  "prods.field.activeLabel": { fr: "Produit actif", en: "Product active" },
  "prods.requiredFields": { fr: "Slug, noms FR/EN et catégorie sont requis", en: "Slug, FR/EN names and category are required" },
  "prods.created": { fr: "Produit créé", en: "Product created" },
  "prods.updated": { fr: "Produit modifié", en: "Product updated" },
  "prods.confirmDelete": { fr: "Supprimer ce produit ?", en: "Delete this product?" },
  "prods.deleted": { fr: "Produit supprimé", en: "Product deleted" },
  "prods.discounts.title": { fr: "💸 Remises personnalisées", en: "💸 Custom discounts" },
  "prods.discounts.hint": { fr: "Définissez les paliers de remise pour ce produit. Pour un produit unique, videz les paliers quantité pour désactiver toute remise.", en: "Define discount tiers for this product. For a single-unit product, clear quantity tiers to disable any discount." },
  "prods.qtyDiscounts": { fr: "Remises sur quantité", en: "Quantity discounts" },
  "prods.qtyDiscounts.empty": { fr: "Aucune remise quantité (idéal pour produit unique).", en: "No quantity discount (ideal for unique products)." },
  "prods.durationDiscounts": { fr: "Remises sur durée", en: "Duration discounts" },
  "prods.durationDiscounts.empty": { fr: "Aucune remise selon la durée de location.", en: "No discount based on rental duration." },
  "prods.discounts.fromQty": { fr: "À partir de", en: "From" },
  "prods.discounts.units": { fr: "unité(s) :", en: "unit(s):" },
  "prods.discounts.days": { fr: "jour(s) :", en: "day(s):" },
  "prods.cfgUploaded": { fr: "📎 Fichier hébergé", en: "📎 Hosted file" },
  "prods.cfgExternal": { fr: "🔗 URL externe", en: "🔗 External URL" },
  "prods.cfg.dropHtml": { fr: "Glissez un fichier .html ou cliquez pour choisir", en: "Drag a .html file or click to choose" },
  "prods.cfg.htmlHint": { fr: "HTML autonome — max 10 Mo", en: "Standalone HTML — max 10 MB" },
  "prods.cfg.mustBeHtml": { fr: "Le fichier doit être un .html", en: "File must be .html" },
  "prods.cfg.tooLarge": { fr: "Fichier trop lourd (max 10 Mo)", en: "File too large (max 10 MB)" },
  "prods.cfg.uploaded": { fr: "Configurateur téléversé", en: "Configurator uploaded" },
  "prods.cfg.urlPlaceholder": { fr: "ou collez une URL (ex: /configurators/cornhole.html ou https://…)", en: "or paste a URL (e.g. /configurators/cornhole.html or https://…)" },
  "prods.cfg.urlUnreachable": { fr: "⚠ L'URL du configurateur semble injoignable", en: "⚠ Configurator URL appears unreachable" },
  "prods.cfgOpts.invalid": { fr: "JSON invalide", en: "Invalid JSON" },
  "prods.cfgOpts.valid": { fr: "JSON valide ✓", en: "Valid JSON ✓" },
  "prods.cfgOpts.preset": { fr: "Charger preset Cornhole", en: "Load Cornhole preset" },
  "prods.options.title": { fr: "🎨 Options de personnalisation", en: "🎨 Customization options" },
  "prods.options.hint": { fr: "Catégories et options proposées au client sur la page produit (ex: Finition, Couleur, Taille…)", en: "Categories and options offered to the customer on the product page (e.g. Finish, Color, Size…)" },
  "prods.options.saveFirst": { fr: "Enregistrez d'abord le produit, puis rouvrez-le pour ajouter des catégories d'options (Finition, Couleur, etc.).", en: "Save the product first, then reopen it to add option categories (Finish, Color, etc.)." },

  // ProductOptionsManager
  "pom.loading": { fr: "Chargement des options…", en: "Loading options…" },
  "pom.empty": { fr: "Aucune catégorie d'options. Ajoutez-en une pour permettre aux clients de personnaliser ce produit.", en: "No option categories. Add one to let customers customize this product." },
  "pom.up": { fr: "Monter", en: "Move up" },
  "pom.down": { fr: "Descendre", en: "Move down" },
  "pom.namesRequired": { fr: "Noms FR et EN requis", en: "FR and EN names required" },
  "pom.cat.added": { fr: "Catégorie ajoutée", en: "Category added" },
  "pom.cat.updated": { fr: "Catégorie modifiée", en: "Category updated" },
  "pom.cat.deleted": { fr: "Catégorie supprimée", en: "Category deleted" },
  "pom.cat.confirmDelete": { fr: "Supprimer cette catégorie et toutes ses options ?", en: "Delete this category and all its options?" },
  "pom.opt.added": { fr: "Option ajoutée", en: "Option added" },
  "pom.opt.updated": { fr: "Option modifiée", en: "Option updated" },
  "pom.opt.deleted": { fr: "Option supprimée", en: "Option deleted" },
  "pom.opt.confirmDelete": { fr: "Supprimer cette option ?", en: "Delete this option?" },
  "pom.opt.empty": { fr: "Aucune option pour le moment.", en: "No options yet." },
  "pom.nameFr": { fr: "Nom FR", en: "FR Name" },
  "pom.nameEn": { fr: "Nom EN", en: "EN Name" },
  "pom.price": { fr: "Prix €", en: "Price €" },
  "pom.included": { fr: "Inclus", en: "Included" },
  "pom.addOption": { fr: "Ajouter une option", en: "Add an option" },
  "pom.addCategory": { fr: "Ajouter une catégorie d'options", en: "Add an option category" },
  "pom.catFrPlaceholder": { fr: "Nom FR (ex: Finition)", en: "FR Name (e.g. Finish)" },
  "pom.catEnPlaceholder": { fr: "Nom EN (ex: Finish)", en: "EN Name (e.g. Finish)" },
  "pom.requiredSelection": { fr: "Sélection obligatoire", en: "Mandatory selection" },
  "pom.optionsCount": { fr: "option(s)", en: "option(s)" },

  // Settings
  "set.title": { fr: "Paramètres", en: "Settings" },
  "set.sub": { fr: "Contenus éditables affichés sur le site public", en: "Editable content displayed on the public site" },
  "set.saved": { fr: "{name} enregistré", en: "{name} saved" },
  "set.logistics.title": { fr: "Frais logistiques (appliqués automatiquement aux devis clients)", en: "Logistics fees (automatically applied to customer quotes)" },
  "set.logistics.label": { fr: "Frais logistiques", en: "Logistics fees" },
  "set.logistics.hint": { fr: "Ces montants HT seront automatiquement ajoutés au devis affiché au client. Le total livraison = forfait de base + (frais par produit × nombre de lignes).", en: "These amounts (excl. VAT) will be added automatically to the quote shown to the customer. Total delivery = base fee + (per-item fee × number of lines)." },
  "set.logistics.base": { fr: "Forfait livraison de base (€ HT)", en: "Base delivery fee (€ excl. VAT)" },
  "set.logistics.perItem": { fr: "Frais par produit dans le devis (€ HT)", en: "Per-item fee in quote (€ excl. VAT)" },
  "set.logistics.setup": { fr: "Forfait installation / montage (€ HT)", en: "Setup fee (€ excl. VAT)" },
  "set.logistics.pickup": { fr: "Forfait reprise / démontage (€ HT)", en: "Pickup / dismantling fee (€ excl. VAT)" },
  "set.terms.title": { fr: "Conditions générales de location", en: "General rental terms" },
  "set.terms.label": { fr: "CGV", en: "Terms" },
  "set.legal.title": { fr: "Mentions légales", en: "Legal notice" },
  "set.contact.title": { fr: "Informations de contact", en: "Contact information" },
  "set.contact.label": { fr: "Contact", en: "Contact" },
  "set.field.textFr": { fr: "Texte FR", en: "FR text" },
  "set.field.textEn": { fr: "Texte EN", en: "EN text" },
  "set.field.email": { fr: "Email", en: "Email" },
  "set.field.phone": { fr: "Téléphone", en: "Phone" },
  "set.field.address": { fr: "Adresse", en: "Address" },
  "set.field.postal": { fr: "Code postal", en: "Postal code" },
  "set.field.city": { fr: "Ville", en: "City" },
};

interface AdminI18nContextValue {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const AdminI18nContext = createContext<AdminI18nContextValue | undefined>(undefined);

const STORAGE_KEY = "setup-paris-admin-lang";

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as AdminLang | null;
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (next: AdminLang) => {
    setLangState(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    const entry = DICT[key];
    let str = entry ? entry[lang] : key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return str;
  };

  return <AdminI18nContext.Provider value={{ lang, setLang, t }}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) throw new Error("useAdminI18n must be used within AdminI18nProvider");
  return ctx;
}
