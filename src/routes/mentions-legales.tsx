import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useI18n } from "@/lib/i18n";
import { canonicalLink, hreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  component: LegalPage,
  head: () => ({
    meta: [
      { title: "Mentions légales — Setup Paris" },
      {
        name: "description",
        content:
          "Mentions légales et conditions générales de Smart Restructuring (Setup Paris) : commandes, paiement, livraison, responsabilité, RGPD.",
      },
      { property: "og:title", content: "Mentions légales — Setup Paris" },
      {
        property: "og:description",
        content:
          "Mentions légales et conditions générales de Smart Restructuring (Setup Paris).",
      },
    ],
    links: [canonicalLink("/mentions-legales"), ...hreflangLinks("/mentions-legales")],
  }),
});

function LegalPage() {
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
            © 2024 Smart Restructuring — Setup Paris.{" "}
            {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">
      {children}
    </h1>
  );
}
function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-10">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl md:text-2xl font-semibold mt-10 mb-3 text-gold">
      {children}
    </h2>
  );
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold mt-5 mb-2 text-foreground">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm md:text-base leading-relaxed text-foreground/85 mb-3">
      {children}
    </p>
  );
}
function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 text-sm md:text-base text-foreground/85 mb-3">
      {children}
    </ul>
  );
}
function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 mb-6 space-y-2 text-sm md:text-base text-foreground/85">
      {children}
    </div>
  );
}

function ContentFR() {
  return (
    <article>
      <H1>Mentions légales</H1>
      <Sub>Smart Restructuring — exploitant la marque commerciale Setup Paris</Sub>

      <H2>Éditeur du site</H2>
      <InfoCard>
        <p>
          <strong>Smart Restructuring</strong> (nom commercial :{" "}
          <strong>Setup Paris</strong>), entreprise du groupe Smart, spécialisée
          dans l'aménagement d'espaces éphémères, la construction de décors,
          l'habillage de structures, la pose et le montage.
        </p>
        <p>
          <strong>Adresse :</strong> 8 avenue du Président Salvador Allende,
          Vitry-sur-Seine
        </p>
        <p>
          <strong>Téléphone :</strong>{" "}
          <a href="tel:+33143911045" className="text-gold hover:underline">
            01 43 91 10 45
          </a>{" "}
          ·{" "}
          <a href="tel:+33601416111" className="text-gold hover:underline">
            +33 6 01 41 61 11
          </a>
        </p>
        <p>
          <strong>Email :</strong>{" "}
          <a href="mailto:contact@setup.paris" className="text-gold hover:underline">
            contact@setup.paris
          </a>{" "}
          ·{" "}
          <a href="mailto:smart@setup.paris" className="text-gold hover:underline">
            smart@setup.paris
          </a>
        </p>
        <p>
          <strong>Site web :</strong>{" "}
          <a
            href="https://www.setup.paris"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            www.setup.paris
          </a>
        </p>
      </InfoCard>

      <H2>Conditions générales de vente et de prestation</H2>

      <H3>Article 1 — Préambule</H3>
      <P>
        <strong>1.1. Objet :</strong> Smart Restructuring (nom commercial : Setup
        Paris), entreprise du groupe Smart, est spécialisée dans l'aménagement
        d'espaces éphémères, la construction de décors, l'habillage de
        structures, la pose et le montage.
      </P>
      <P>
        <strong>1.2. Champ d'application :</strong> Les présentes conditions
        générales (ci-après « CGV ») régissent la vente ou la location de
        produits (ci-après « Produits ») et les prestations de services associées
        (ci-après « Services »).
      </P>
      <P>
        <strong>1.3. Acceptation :</strong> Toute commande implique l'adhésion
        pleine et entière aux présentes CGV.
      </P>

      <H3>Article 2 — Commandes</H3>
      <P>
        <strong>2.1. Formation :</strong> Toute commande est définitive après
        acceptation écrite par Smart Restructuring. Elle doit être validée par un
        devis ou un bon de commande signé.
      </P>
      <P>
        <strong>2.2. Modification :</strong> Les commandes sont fermes et non
        modifiables sauf accord écrit. Toute modification peut entraîner des
        délais supplémentaires.
      </P>
      <P>
        <strong>2.3. Annulation :</strong> En cas d'annulation acceptée par Smart
        Restructuring, les frais engagés seront facturés au Client.
      </P>

      <H3>Article 3 — Livraison et installation</H3>
      <P>
        <strong>3.1. Délais :</strong> Les délais de livraison sont indicatifs et
        liés à la charge de production au moment de la commande.
      </P>
      <P>
        <strong>3.2. Responsabilité :</strong> Smart Restructuring ne pourra être
        tenue responsable des retards causés par des événements hors de son
        contrôle (force majeure, retard client, etc.).
      </P>
      <P>
        <strong>3.3. Transfert des risques :</strong> Les risques liés aux
        Produits sont transférés au Client à la livraison. En cas de non-paiement,
        Smart Restructuring conserve la propriété des Produits.
      </P>
      <P>
        <strong>3.4. Installation :</strong> Smart Restructuring fournit le
        personnel nécessaire à l'installation. Les frais correspondants sont
        inclus dans le devis.
      </P>

      <H3>Article 4 — Tarifs et conditions de paiement</H3>
      <P>
        <strong>4.1. Prix :</strong> Les tarifs applicables sont ceux en vigueur
        au jour de la commande. Les prix sont exprimés hors taxes.
      </P>
      <P>
        <strong>4.2. Paiement :</strong>
      </P>
      <UL>
        <li>Acompte de 50 % à la commande.</li>
        <li>Solde à la fin des prestations, au maximum 60 jours après facturation.</li>
      </UL>
      <P>
        <strong>4.3. Retard de paiement :</strong> Tout retard entraînera des
        pénalités de retard au taux légal, ainsi qu'une indemnité forfaitaire de
        40 € pour frais de recouvrement.
      </P>

      <H3>Article 5 — Responsabilité</H3>
      <P>
        <strong>5.1. Limitation :</strong> Smart Restructuring n'est pas
        responsable des dommages indirects ou consécutifs liés à l'utilisation
        des Produits ou Services.
      </P>
      <P>
        <strong>5.2. Garantie :</strong> En cas de défaut non imputable à une
        mauvaise utilisation, Smart Restructuring procédera à la réparation ou au
        remplacement des Produits dans les meilleurs délais.
      </P>

      <H3>Article 6 — Données personnelles</H3>
      <P>
        <strong>6.1. Confidentialité :</strong> Les données collectées sont
        strictement confidentielles et utilisées uniquement dans le cadre de la
        commande. Smart Restructuring s'engage à respecter la réglementation
        RGPD.
      </P>

      <H3>Article 7 — Propriété intellectuelle</H3>
      <P>
        <strong>7.1.</strong> Les plans, documents techniques et photos restent
        la propriété exclusive de Smart Restructuring et ne peuvent être utilisés
        ou reproduits sans autorisation.
      </P>

      <H3>Article 8 — Force majeure</H3>
      <P>
        <strong>8.1. Suspension des obligations :</strong> En cas de force
        majeure (grèves, pandémies, catastrophes naturelles, etc.), l'exécution
        des obligations est suspendue.
      </P>

      <H3>Article 9 — Résolution des litiges</H3>
      <P>
        <strong>9.1. Règlement amiable :</strong> Tout litige fera l'objet d'une
        tentative de règlement amiable avant toute action en justice.
      </P>
      <P>
        <strong>9.2. Tribunal compétent :</strong> En cas de litige, les
        tribunaux de Paris seront seuls compétents.
      </P>

      <H2>Hébergement</H2>
      <P>
        Le site est hébergé par <strong>Lovable</strong>. Pour toute information
        relative à l'hébergement, contactez-nous à{" "}
        <a href="mailto:contact@setup.paris" className="text-gold hover:underline">
          contact@setup.paris
        </a>
        .
      </P>

      <H2>Propriété intellectuelle du site</H2>
      <P>
        L'ensemble des contenus présents sur ce site (textes, images, vidéos,
        logos, graphismes, mises en scène) est la propriété exclusive de Smart
        Restructuring — Setup Paris. Toute reproduction, représentation ou
        diffusion, totale ou partielle, est interdite sans autorisation préalable
        écrite.
      </P>

      <H2>Voir aussi</H2>
      <P>
        Pour les conditions spécifiques à la location de mobilier et d'objets
        événementiels, consultez nos{" "}
        <Link to="/cgl" className="text-gold hover:underline font-medium">
          Conditions générales de location
        </Link>
        .
      </P>
    </article>
  );
}

function ContentEN() {
  return (
    <article>
      <H1>Legal notice</H1>
      <Sub>Smart Restructuring — operating under the trade name Setup Paris</Sub>

      <H2>Site publisher</H2>
      <InfoCard>
        <p>
          <strong>Smart Restructuring</strong> (trade name:{" "}
          <strong>Setup Paris</strong>), part of the Smart group, specializing in
          the design of ephemeral spaces, the construction of sets, structure
          dressing, installation and assembly.
        </p>
        <p>
          <strong>Address:</strong> 8 avenue du Président Salvador Allende,
          Vitry-sur-Seine, France
        </p>
        <p>
          <strong>Phone:</strong>{" "}
          <a href="tel:+33143911045" className="text-gold hover:underline">
            +33 1 43 91 10 45
          </a>{" "}
          ·{" "}
          <a href="tel:+33601416111" className="text-gold hover:underline">
            +33 6 01 41 61 11
          </a>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:contact@setup.paris" className="text-gold hover:underline">
            contact@setup.paris
          </a>{" "}
          ·{" "}
          <a href="mailto:smart@setup.paris" className="text-gold hover:underline">
            smart@setup.paris
          </a>
        </p>
        <p>
          <strong>Website:</strong>{" "}
          <a
            href="https://www.setup.paris"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            www.setup.paris
          </a>
        </p>
      </InfoCard>

      <H2>General terms of sale and service</H2>

      <H3>Article 1 — Preamble</H3>
      <P>
        <strong>1.1. Purpose:</strong> Smart Restructuring (trade name: Setup
        Paris), part of the Smart group, specializes in the design of ephemeral
        spaces, the construction of sets, structure dressing, installation and
        assembly.
      </P>
      <P>
        <strong>1.2. Scope:</strong> These general terms (hereinafter "GTC")
        govern the sale or rental of products (hereinafter "Products") and the
        associated service offerings (hereinafter "Services").
      </P>
      <P>
        <strong>1.3. Acceptance:</strong> Any order implies full and unreserved
        acceptance of these GTC.
      </P>

      <H3>Article 2 — Orders</H3>
      <P>
        <strong>2.1. Formation:</strong> Any order is final after written
        acceptance by Smart Restructuring. It must be validated by a signed
        quotation or purchase order.
      </P>
      <P>
        <strong>2.2. Modification:</strong> Orders are firm and non-modifiable
        unless agreed in writing. Any modification may result in additional
        lead time.
      </P>
      <P>
        <strong>2.3. Cancellation:</strong> In the event of cancellation
        accepted by Smart Restructuring, the costs already incurred will be
        invoiced to the Client.
      </P>

      <H3>Article 3 — Delivery and installation</H3>
      <P>
        <strong>3.1. Lead times:</strong> Delivery times are indicative and
        depend on the production workload at the time of the order.
      </P>
      <P>
        <strong>3.2. Liability:</strong> Smart Restructuring cannot be held
        liable for delays caused by events beyond its control (force majeure,
        client delay, etc.).
      </P>
      <P>
        <strong>3.3. Transfer of risk:</strong> Risks relating to the Products
        are transferred to the Client upon delivery. In the event of
        non-payment, Smart Restructuring retains ownership of the Products.
      </P>
      <P>
        <strong>3.4. Installation:</strong> Smart Restructuring provides the
        personnel required for installation. The corresponding fees are included
        in the quotation.
      </P>

      <H3>Article 4 — Pricing and payment terms</H3>
      <P>
        <strong>4.1. Prices:</strong> The applicable prices are those in force on
        the day of the order. Prices are expressed excluding taxes.
      </P>
      <P>
        <strong>4.2. Payment:</strong>
      </P>
      <UL>
        <li>50% deposit upon order.</li>
        <li>Balance at the end of the services, at the latest 60 days after invoicing.</li>
      </UL>
      <P>
        <strong>4.3. Late payment:</strong> Any delay will result in late
        payment penalties at the legal rate, as well as a fixed compensation of
        €40 for recovery costs.
      </P>

      <H3>Article 5 — Liability</H3>
      <P>
        <strong>5.1. Limitation:</strong> Smart Restructuring is not liable for
        any indirect or consequential damages relating to the use of the
        Products or Services.
      </P>
      <P>
        <strong>5.2. Warranty:</strong> In the event of a defect not attributable
        to misuse, Smart Restructuring will repair or replace the Products as
        soon as possible.
      </P>

      <H3>Article 6 — Personal data</H3>
      <P>
        <strong>6.1. Confidentiality:</strong> The data collected is strictly
        confidential and used solely in the context of the order. Smart
        Restructuring undertakes to comply with GDPR regulations.
      </P>

      <H3>Article 7 — Intellectual property</H3>
      <P>
        <strong>7.1.</strong> Plans, technical documents and photographs remain
        the exclusive property of Smart Restructuring and may not be used or
        reproduced without authorization.
      </P>

      <H3>Article 8 — Force majeure</H3>
      <P>
        <strong>8.1. Suspension of obligations:</strong> In the event of force
        majeure (strikes, pandemics, natural disasters, etc.), the performance
        of obligations is suspended.
      </P>

      <H3>Article 9 — Dispute resolution</H3>
      <P>
        <strong>9.1. Amicable settlement:</strong> Any dispute will be subject to
        an attempt at amicable settlement before any legal action.
      </P>
      <P>
        <strong>9.2. Competent court:</strong> In the event of a dispute, the
        courts of Paris shall have sole jurisdiction.
      </P>

      <H2>Hosting</H2>
      <P>
        The site is hosted by <strong>Lovable</strong>. For any information
        regarding hosting, please contact us at{" "}
        <a href="mailto:contact@setup.paris" className="text-gold hover:underline">
          contact@setup.paris
        </a>
        .
      </P>

      <H2>Site intellectual property</H2>
      <P>
        All content on this site (texts, images, videos, logos, graphics,
        staging) is the exclusive property of Smart Restructuring — Setup Paris.
        Any reproduction, representation or distribution, in whole or in part,
        is prohibited without prior written authorization.
      </P>

      <H2>See also</H2>
      <P>
        For terms specific to the rental of event furniture and objects, see our{" "}
        <Link to="/cgl" className="text-gold hover:underline font-medium">
          General rental terms and conditions
        </Link>
        .
      </P>
    </article>
  );
}
