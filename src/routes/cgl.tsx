import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/cgl")({
  component: CGLPage,
  head: () => ({
    meta: [
      { title: "Conditions générales de location — Setup Paris" },
      {
        name: "description",
        content:
          "Conditions générales de location de mobilier et d'objets événementiels Setup Paris (Smart Restructuring).",
      },
      { property: "og:title", content: "Conditions générales de location — Setup Paris" },
      {
        property: "og:description",
        content:
          "Conditions générales de location de mobilier et d'objets événementiels Setup Paris.",
      },
    ],
    links: [canonicalLink("/cgl")],
  }),
});

function CGLPage() {
  const { lang } = useI18n();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-x py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.22em] text-gold hover:underline"
            >
              ← {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
            </Link>
          </div>
          {lang === "fr" ? <ContentFR /> : <ContentEN />}
          <p className="mt-12 text-sm text-muted-foreground italic">
            {lang === "fr"
              ? "Dernière mise à jour : Avril 2026"
              : "Last updated: April 2026"}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">{children}</h1>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-10">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl md:text-2xl font-semibold mt-10 mb-3 text-gold">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm md:text-base leading-relaxed text-foreground/85 mb-3">{children}</p>;
}
function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 space-y-1.5 text-sm md:text-base text-foreground/85 mb-3">{children}</ul>;
}

function ContentFR() {
  return (
    <article>
      <H1>Conditions générales de location</H1>
      <Sub>Setup Paris — Smart Restructuring · Location d'objets et mobilier événementiels</Sub>

      <H2>Préambule</H2>
      <P>
        Les présentes Conditions Générales de Location (ci-après « CGL ») régissent l'ensemble
        des relations contractuelles entre la société Smart Restructuring, exploitant la marque
        commerciale Setup Paris (ci-après « Setup Paris ») et toute personne physique ou morale
        passant commande de matériel en location (ci-après « le Client »). Toute commande implique
        l'acceptation sans réserve des présentes CGL, qui prévalent sur tout autre document du Client.
      </P>

      <H2>Article 1 — Objet</H2>
      <P>
        Les présentes CGL ont pour objet de définir les droits et obligations des parties dans
        le cadre de la location de mobilier, objets de décoration, jeux, structures et accessoires
        événementiels proposés par Setup Paris pour des événements privés ou professionnels en
        Île-de-France et dans toute la France métropolitaine.
      </P>

      <H2>Article 2 — Commande et réservation</H2>
      <P>
        Toute réservation est confirmée par la signature du devis et le règlement de l'intégralité
        du montant TTC. Le devis signé vaut bon de commande et engage les deux parties.
      </P>
      <P>
        Setup Paris se réserve le droit de refuser une commande en cas d'indisponibilité du matériel,
        de défaut de paiement antérieur ou de dossier incomplet.
      </P>

      <H2>Article 3 — Tarifs et paiement</H2>
      <P>
        Les prix figurant sur le devis sont exprimés en euros hors taxes (HT). La TVA en vigueur
        s'applique au taux légal. La location est due pour la totalité de la durée prévue, que le
        matériel soit utilisé ou non.
      </P>
      <P>
        Le règlement de l'intégralité du montant est exigible à la commande, avant toute mise à
        disposition du matériel. Les moyens de paiement acceptés sont le virement bancaire et le
        paiement par carte bancaire.
      </P>
      <P>
        En cas de retard de paiement, des pénalités de retard seront appliquées de plein droit, au
        taux annuel de trois fois le taux d'intérêt légal en vigueur, conformément à l'article
        L.441-10 du Code de commerce. Une indemnité forfaitaire de 40 euros pour frais de recouvrement
        sera également due.
      </P>

      <H2>Article 4 — Dépôt de garantie (caution)</H2>
      <P>
        Un dépôt de garantie pourra être demandé au Client préalablement à la mise à disposition du
        matériel. Son montant est indiqué sur le devis. Ce dépôt sera restitué dans un délai de
        quinze (15) jours après restitution du matériel, sous réserve de vérification de son état
        et déduction éventuelle des sommes dues au titre de dégradations, pertes ou manquants.
      </P>
      <P>
        En cas de dégradation ou de perte du matériel, Setup Paris se réserve le droit de prélever
        sur le dépôt de garantie les sommes correspondant au coût de réparation ou de remplacement
        à neuf.
      </P>

      <H2>Article 5 — Durée de la location</H2>
      <P>
        La durée de la location est celle indiquée sur le devis. Elle débute à la mise à disposition
        ou à la livraison du matériel et se termine à sa restitution effective. Toute journée
        supplémentaire entamée sera facturée au tarif journalier en vigueur.
      </P>
      <P>
        Le Client peut demander une prolongation sous réserve d'accord préalable écrit de Setup
        Paris et de disponibilité du matériel, au minimum 24 heures avant la date de restitution
        prévue.
      </P>

      <H2>Article 6 — Livraison, installation et restitution</H2>
      <P>
        <strong>Livraison :</strong> Setup Paris assure la livraison du matériel à l'adresse
        convenue, aux dates et créneaux horaires mentionnés sur le devis. Les frais de livraison,
        d'installation et de reprise sont facturés en sus selon le barème en vigueur. Le Client
        doit s'assurer que le lieu de livraison est accessible (voie carrossable, ascenseur,
        distance de portage raisonnable). Toute difficulté d'accès non signalée pourra entraîner
        des frais supplémentaires.
      </P>
      <P>
        <strong>Présence obligatoire :</strong> Le Client ou son représentant doit être présent lors
        de la livraison et de la restitution pour signer le bon de livraison et le bon de retour.
        En l'absence de réservation, le matériel est réputé livré en bon état.
      </P>
      <P>
        <strong>Installation :</strong> Si une prestation d'installation est prévue au devis, elle
        est réalisée par les équipes de Setup Paris. L'installation par le Client lui-même se fait
        sous sa seule responsabilité.
      </P>
      <P>
        <strong>Restitution :</strong> Le matériel doit être restitué dans son état d'origine, propre
        et complet, dans les emballages d'origine le cas échéant. Tout retard de restitution sera
        facturé au tarif journalier par jour de retard.
      </P>

      <H2>Article 7 — État du matériel et obligations du Client</H2>
      <P>
        Le matériel est fourni en parfait état de fonctionnement et de propreté, vérifié avant chaque
        location. Le Client doit en faire un usage conforme à sa destination et s'engage à :
      </P>
      <UL>
        <li>Protéger le matériel contre toute dégradation, vol, intempérie ou vandalisme ;</li>
        <li>Ne pas modifier, peindre, percer, coller ou altérer le matériel de quelque manière que ce soit ;</li>
        <li>Ne pas sous-louer, prêter ou céder le matériel à un tiers ;</li>
        <li>Signaler immédiatement tout incident, panne ou dommage à Setup Paris par téléphone et confirmer par écrit (email) dans les 24 heures ;</li>
        <li>Veiller à la sécurité du matériel pendant toute la durée de la location.</li>
      </UL>
      <P>
        Le matériel reste la propriété exclusive de Setup Paris. Le Client en est le gardien
        juridique de la mise à disposition jusqu'à la restitution.
      </P>

      <H2>Article 8 — Responsabilité du Client</H2>
      <P>
        La responsabilité et la garde juridique du matériel loué sont transférées au Client dès sa
        mise à disposition. Le Client est responsable de toute perte, vol, dégradation ou destruction
        du matériel, quelle qu'en soit la cause (y compris les intempéries, actes de tiers ou
        événements survenant sur le lieu de l'événement).
      </P>
      <P>
        En cas de matériel détérioré ou perdu, le Client sera facturé du coût de réparation ou de
        remplacement à valeur neuve, sur la base du tarif catalogue de Setup Paris.
      </P>

      <H2>Article 9 — Responsabilité de Setup Paris</H2>
      <P>
        Setup Paris s'engage à fournir le matériel en bon état de fonctionnement, conforme au devis.
        En cas de défaut constaté à la livraison, Setup Paris procède au remplacement du matériel
        défectueux dans la limite de son stock disponible.
      </P>
      <P>
        La responsabilité de Setup Paris est limitée au montant de la commande concernée. En aucun
        cas, Setup Paris ne pourra être tenu responsable de dommages indirects tels que perte de
        chiffre d'affaires, préjudice commercial, perte de clientèle ou atteinte à l'image.
      </P>
      <P>
        Setup Paris ne saurait être tenu responsable des dommages liés à une utilisation non conforme
        du matériel, à des conditions météorologiques défavorables ou à des contraintes du lieu de
        l'événement (sol instable, accès difficile, etc.).
      </P>

      <H2>Article 10 — Force majeure</H2>
      <P>
        Aucune des parties ne pourra être tenue responsable de l'inexécution ou du retard dans
        l'exécution de ses obligations en cas de force majeure au sens de l'article 1218 du Code
        civil (notamment : catastrophe naturelle, épidémie, grève générale, décision gouvernementale,
        panne de transport généralisée).
      </P>
      <P>
        En cas de force majeure, les obligations des parties sont suspendues. Si la situation persiste
        au-delà de trente (30) jours, chacune des parties pourra résilier le contrat sans indemnité.
        Les sommes versées seront restituées au Client, déduction faite des frais déjà engagés par
        Setup Paris.
      </P>

      <H2>Article 11 — Réclamations</H2>
      <P>
        Toute réclamation relative à l'état du matériel doit être formulée par écrit dans les 24
        heures suivant la livraison. Passé ce délai, le matériel est réputé avoir été reçu en bon
        état et conforme au devis.
      </P>
      <P>
        Toute réclamation relative à la facturation doit être adressée par écrit dans un délai de
        quinze (15) jours à compter de la réception de la facture.
      </P>

      <H2>Article 12 — Propriété intellectuelle</H2>
      <P>
        L'ensemble des éléments visuels, photographiques et créatifs du catalogue Setup Paris (site
        internet, documents commerciaux, mises en scène) est protégé par le droit d'auteur. Toute
        reproduction, même partielle, est interdite sans autorisation préalable écrite de Setup Paris.
      </P>

      <H2>Article 13 — Données personnelles</H2>
      <P>
        Les données personnelles collectées dans le cadre de la relation commerciale sont traitées
        conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
        Informatique et Libertés. Elles sont utilisées exclusivement pour le traitement des commandes,
        la facturation et la communication commerciale. Le Client dispose d'un droit d'accès, de
        rectification, de suppression et d'opposition en contactant Setup Paris à l'adresse email :{" "}
        <a href="mailto:contact@setup.paris" className="text-gold hover:underline">contact@setup.paris</a>.
      </P>

      <H2>Article 14 — Droit applicable et litiges</H2>
      <P>
        Les présentes CGL sont soumises au droit français. En cas de litige, les parties s'engagent
        à rechercher une solution amiable avant toute action judiciaire. À défaut d'accord amiable
        dans un délai de trente (30) jours, le litige sera porté devant les tribunaux compétents de
        Paris.
      </P>

      <H2>Article 15 — Dispositions diverses</H2>
      <P>
        Si l'une des clauses des présentes CGL venait à être déclarée nulle ou inapplicable, les
        autres clauses conserveraient leur pleine validité. Le fait pour Setup Paris de ne pas se
        prévaloir à un moment donné de l'une des clauses des présentes ne saurait être interprété
        comme une renonciation à s'en prévaloir ultérieurement.
      </P>

      <P>
        <strong>Smart Restructuring — Setup Paris</strong>
      </P>
    </article>
  );
}

function ContentEN() {
  return (
    <article>
      <H1>General rental terms and conditions</H1>
      <Sub>Setup Paris — Smart Restructuring · Event furniture and object rental</Sub>

      <H2>Preamble</H2>
      <P>
        These General Rental Terms and Conditions (hereinafter "GRT") govern all contractual
        relationships between Smart Restructuring, operating under the trade name Setup Paris
        (hereinafter "Setup Paris"), and any individual or legal entity placing an order for rental
        equipment (hereinafter "the Client"). Any order implies unreserved acceptance of these GRT,
        which shall prevail over any document issued by the Client.
      </P>

      <H2>Article 1 — Purpose</H2>
      <P>
        The purpose of these GRT is to define the rights and obligations of the parties in the
        context of the rental of furniture, decorative objects, games, structures and event
        accessories offered by Setup Paris for private or professional events in the Île-de-France
        region and throughout metropolitan France.
      </P>

      <H2>Article 2 — Orders and reservations</H2>
      <P>
        Any reservation is confirmed by signing the quotation and payment of the full amount including
        VAT. The signed quotation constitutes a purchase order and is binding on both parties.
      </P>
      <P>
        Setup Paris reserves the right to refuse an order in the event of equipment unavailability,
        previous payment default or incomplete documentation.
      </P>

      <H2>Article 3 — Pricing and payment</H2>
      <P>
        Prices shown on the quotation are expressed in euros excluding VAT. The applicable VAT rate
        is added at the legal rate. The rental fee is due for the entire planned duration, whether
        or not the equipment is used.
      </P>
      <P>
        Full payment is required at the time of order, prior to any equipment being made available.
        Accepted payment methods are bank transfer and credit card payment.
      </P>
      <P>
        In the event of late payment, late payment penalties shall automatically apply at an annual
        rate of three times the legal interest rate, in accordance with Article L.441-10 of the
        French Commercial Code. A fixed compensation of 40 euros for recovery costs shall also be
        due.
      </P>

      <H2>Article 4 — Security deposit</H2>
      <P>
        A security deposit may be required from the Client prior to making the equipment available.
        The amount is indicated on the quotation. This deposit shall be returned within fifteen (15)
        days after the equipment is returned, subject to verification of its condition and any
        deductions for damage, loss or missing items.
      </P>
      <P>
        In the event of damage to or loss of equipment, Setup Paris reserves the right to deduct
        from the security deposit the amounts corresponding to the cost of repair or replacement at
        new value.
      </P>

      <H2>Article 5 — Rental duration</H2>
      <P>
        The rental duration is that indicated on the quotation. It begins when the equipment is
        made available or delivered and ends upon its effective return. Any additional day started
        shall be invoiced at the applicable daily rate.
      </P>
      <P>
        The Client may request an extension subject to prior written agreement from Setup Paris and
        equipment availability, at least 24 hours before the scheduled return date.
      </P>

      <H2>Article 6 — Delivery, installation and return</H2>
      <P>
        <strong>Delivery:</strong> Setup Paris delivers the equipment to the agreed address, on the
        dates and time slots specified on the quotation. Delivery, installation and collection fees
        are charged separately according to the current price schedule. The Client must ensure that
        the delivery location is accessible (suitable road access, elevator, reasonable carrying
        distance). Any unreported access difficulties may result in additional charges.
      </P>
      <P>
        <strong>Mandatory attendance:</strong> The Client or their representative must be present
        during delivery and collection to sign the delivery note and the return note. In the absence
        of any remarks, the equipment is deemed to have been delivered in good condition.
      </P>
      <P>
        <strong>Installation:</strong> If an installation service is included in the quotation, it
        is carried out by Setup Paris teams. Installation by the Client is done at their sole
        responsibility.
      </P>
      <P>
        <strong>Return:</strong> The equipment must be returned in its original condition, clean
        and complete, in the original packaging where applicable. Any delay in return shall be
        invoiced at the daily rate per day of delay.
      </P>

      <H2>Article 7 — Equipment condition and Client obligations</H2>
      <P>
        The equipment is provided in perfect working order and cleanliness, inspected before each
        rental. The Client must use it in accordance with its intended purpose and undertakes to:
      </P>
      <UL>
        <li>Protect the equipment against any damage, theft, weather conditions or vandalism;</li>
        <li>Not modify, paint, drill, glue or alter the equipment in any way;</li>
        <li>Not sublease, lend or transfer the equipment to any third party;</li>
        <li>Immediately report any incident, malfunction or damage to Setup Paris by phone and confirm in writing (email) within 24 hours;</li>
        <li>Ensure the safety of the equipment throughout the rental period.</li>
      </UL>
      <P>
        The equipment remains the exclusive property of Setup Paris. The Client is the legal
        custodian from the time of delivery until its return.
      </P>

      <H2>Article 8 — Client liability</H2>
      <P>
        Liability and legal custody of the rented equipment are transferred to the Client from the
        moment it is made available. The Client is liable for any loss, theft, damage or destruction
        of the equipment, regardless of the cause (including adverse weather, acts of third parties
        or events occurring at the event venue).
      </P>
      <P>
        In the event of damaged or lost equipment, the Client shall be invoiced for the cost of
        repair or replacement at new value, based on the Setup Paris catalogue price.
      </P>

      <H2>Article 9 — Setup Paris liability</H2>
      <P>
        Setup Paris undertakes to provide the equipment in good working order, in conformity with
        the quotation. In the event of a defect identified upon delivery, Setup Paris shall replace
        the defective equipment within the limits of available stock.
      </P>
      <P>
        The liability of Setup Paris is limited to the amount of the order concerned. Under no
        circumstances shall Setup Paris be held liable for indirect damages such as loss of revenue,
        commercial prejudice, loss of customers or reputational damage.
      </P>
      <P>
        Setup Paris shall not be held liable for damage resulting from non-compliant use of the
        equipment, adverse weather conditions or constraints of the event venue (unstable ground,
        difficult access, etc.).
      </P>

      <H2>Article 10 — Force majeure</H2>
      <P>
        Neither party shall be held liable for failure to perform or delay in performing its
        obligations in the event of force majeure within the meaning of Article 1218 of the French
        Civil Code (including but not limited to: natural disaster, epidemic, general strike,
        government decision, widespread transport disruption).
      </P>
      <P>
        In the event of force majeure, the obligations of the parties are suspended. If the
        situation persists beyond thirty (30) days, either party may terminate the contract without
        compensation. Amounts paid shall be refunded to the Client, less any costs already incurred
        by Setup Paris.
      </P>

      <H2>Article 11 — Complaints</H2>
      <P>
        Any complaint regarding the condition of the equipment must be made in writing within 24
        hours of delivery. After this period, the equipment is deemed to have been received in good
        condition and in conformity with the quotation.
      </P>
      <P>
        Any complaint regarding invoicing must be made in writing within fifteen (15) days of
        receipt of the invoice.
      </P>

      <H2>Article 12 — Intellectual property</H2>
      <P>
        All visual, photographic and creative elements of the Setup Paris catalogue (website,
        commercial documents, staging) are protected by copyright. Any reproduction, even partial,
        is prohibited without prior written authorization from Setup Paris.
      </P>

      <H2>Article 13 — Personal data</H2>
      <P>
        Personal data collected in the context of the commercial relationship is processed in
        accordance with the General Data Protection Regulation (GDPR) and the French Data Protection
        Act. It is used exclusively for order processing, invoicing and commercial communication.
        The Client has the right to access, rectify, delete and object to their data by contacting
        Setup Paris at the email address:{" "}
        <a href="mailto:contact@setup.paris" className="text-gold hover:underline">contact@setup.paris</a>.
      </P>

      <H2>Article 14 — Applicable law and disputes</H2>
      <P>
        These GRT are governed by French law. In the event of a dispute, the parties undertake to
        seek an amicable solution before any legal proceedings. Failing amicable agreement within
        thirty (30) days, the dispute shall be referred to the competent courts of Paris.
      </P>

      <H2>Article 15 — Miscellaneous provisions</H2>
      <P>
        Should any clause of these GRT be declared null or unenforceable, the remaining clauses
        shall retain their full validity. The failure of Setup Paris to invoke any clause of these
        GRT at any given time shall not be construed as a waiver of the right to invoke it
        subsequently.
      </P>

      <P>
        <strong>Smart Restructuring — Setup Paris</strong>
      </P>
    </article>
  );
}
