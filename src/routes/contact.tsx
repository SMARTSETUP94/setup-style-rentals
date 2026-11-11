import { trackSiteEvent } from "@/lib/track";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { canonicalLink, hreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Setup Paris, location d'objets événementiels" },
      {
        name: "description",
        content: "Contactez Setup Paris pour vos locations d'objets et jeux événementiels à Paris et en Île-de-France : téléphone, mail et formulaire.",
      },
      { property: "og:title", content: "Contact — Setup Paris" },
      { property: "og:description", content: "Une question sur une location événementielle ? Écrivez-nous ou appelez-nous." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [canonicalLink("/contact"), ...hreflangLinks("/contact")],
  }),
});

const TXT = {
  fr: {
    eyebrow: "— Contact",
    title: "Parlons de votre événement",
    intro: "Une question sur un objet, une date ou une personnalisation ? Écrivez-nous, l'équipe vous répond.",
    name: "Nom",
    company: "Société",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    send: "Envoyer",
    sending: "Envoi…",
    doneTitle: "Message envoyé",
    doneText: "Merci, nous revenons vers vous rapidement.",
    again: "Envoyer un autre message",
    rate: "Trop de demandes, réessayez dans quelques minutes",
    error: "L'envoi a échoué. Écrivez-nous directement à smart@setup.paris.",
    invalid: "Vérifiez les champs du formulaire.",
  },
  en: {
    eyebrow: "— Contact",
    title: "Let's talk about your event",
    intro: "A question about an item, a date or a customisation? Write to us and the team will reply.",
    name: "Name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    message: "Message",
    send: "Send",
    sending: "Sending…",
    doneTitle: "Message sent",
    doneText: "Thank you, we'll get back to you shortly.",
    again: "Send another message",
    rate: "Too many requests, please try again in a few minutes",
    error: "Sending failed. Email us directly at smart@setup.paris.",
    invalid: "Please check the form fields.",
  },
};

const empty = { name: "", company: "", email: "", phone: "", message: "", website: "" };

function ContactPage() {
  const { lang } = useI18n();
  const tx = TXT[lang];
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company || null,
          email: form.email,
          phone: form.phone || null,
          message: form.message,
          lang,
          website: form.website || null,
        }),
      });
      if (res.ok) {
        setDone(true);
        trackSiteEvent("contact_submit");
        setForm(empty);
      } else if (res.status === 429) toast.error(tx.rate);
      else if (res.status === 400) toast.error(tx.invalid);
      else toast.error(tx.error);
    } catch {
      toast.error(tx.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container-x pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-5xl mx-auto grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium">{tx.eyebrow}</div>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{tx.title}</h1>
            <p className="mt-4 text-muted-foreground">{tx.intro}</p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="size-4 mt-0.5 text-gold shrink-0" />
                <a href="tel:+33601416111" className="hover:underline">06 01 41 61 11</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="size-4 mt-0.5 text-gold shrink-0" />
                <a href="mailto:smart@setup.paris" className="hover:underline">smart@setup.paris</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 text-gold shrink-0" />
                <span>8 avenue du Président Salvador Allende<br />Vitry-sur-Seine</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {done ? (
              <div className="text-center py-10">
                <div className="mx-auto size-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <Check className="size-6" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">{tx.doneTitle}</h2>
                <p className="mt-2 text-muted-foreground">{tx.doneText}</p>
                <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>{tx.again}</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="c-name">{tx.name} *</Label>
                    <Input id="c-name" required maxLength={200} className="mt-1" value={form.name} onChange={set("name")} />
                  </div>
                  <div>
                    <Label htmlFor="c-company">{tx.company}</Label>
                    <Input id="c-company" maxLength={200} className="mt-1" value={form.company} onChange={set("company")} />
                  </div>
                  <div>
                    <Label htmlFor="c-email">{tx.email} *</Label>
                    <Input id="c-email" type="email" required maxLength={320} className="mt-1" value={form.email} onChange={set("email")} />
                  </div>
                  <div>
                    <Label htmlFor="c-phone">{tx.phone}</Label>
                    <Input id="c-phone" type="tel" maxLength={50} className="mt-1" value={form.phone} onChange={set("phone")} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="c-message">{tx.message} *</Label>
                  <Textarea id="c-message" required rows={6} maxLength={5000} className="mt-1" value={form.message} onChange={set("message")} />
                  <div className="mt-1 text-right text-[11px] text-muted-foreground">{form.message.length}/5000</div>
                </div>
                {/* Honeypot — hidden from humans */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="c-website">Website</label>
                  <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                </div>
                <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                  {sending ? tx.sending : tx.send}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {lang === "fr" ? "Les informations saisies servent uniquement à traiter votre demande. " : "The information you enter is used solely to process your request. "}
                  <Link to="/mentions-legales" className="underline hover:text-foreground">{lang === "fr" ? "Mentions légales" : "Legal notice"}</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
