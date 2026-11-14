import { expect, test } from "bun:test";
import { categoryRedirect, HOME_SELECTION, homeFaq } from "../../src/lib/home-catalogue";

const base = (process.env.SSR_TEST_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const expected = ["jeux", "scenes-podiums", "decor-signaletique", "accueil-presentation", "mobilier"];

test("only the three explicit legacy category aliases redirect", () => {
  expect(categoryRedirect("structures")).toBe("scenes-podiums");
  expect(categoryRedirect("signaletique")).toBe("decor-signaletique");
  expect(categoryRedirect("decoration")).toBe("decor-signaletique");
  expect(categoryRedirect("inactive-unknown")).toBeUndefined();
});

test("homepage FAQ reuses only the three requested editorial answers verbatim", () => {
  const categories = [{ faq: [
    { q_fr: "Prix ?", a_fr: "Réponse tarif originale", q_en: "Price?", a_en: "Original pricing answer" },
    { q_fr: "Livraison ?", a_fr: "Réponse livraison originale", q_en: "Delivery?", a_en: "Original delivery answer" },
    { q_fr: "Personnalisation ?", a_fr: "Non sélectionnée" },
    { q_fr: "Réservation ?", a_fr: "Réponse réservation originale", q_en: "Booking?", a_en: "Original booking answer" },
  ] }];
  expect(homeFaq(categories, "fr").map(f => f.answer)).toEqual(["Réponse tarif originale", "Réponse livraison originale", "Réponse réservation originale"]);
  expect(homeFaq(categories, "en").map(f => f.answer)).toEqual(["Original pricing answer", "Original delivery answer", "Original booking answer"]);
  expect(homeFaq([{ faq: null }], "fr")).toEqual([]);
});

for (const prefix of ["", "/en"]) {
  for (const [old, target] of [["structures", "scenes-podiums"], ["signaletique", "decor-signaletique"], ["decoration", "decor-signaletique"]]) {
    test(`HTTP 301 ${prefix}/categorie/${old}`, async () => {
      const response = await fetch(`${base}${prefix}/categorie/${old}`, { redirect: "manual" });
      expect(response.status).toBe(301);
      expect(response.headers.get("location")).toBe(`${prefix}/categorie/${target}`);
    }, 30000);
  }
  test(`unknown inactive category returns HTTP 404 ${prefix}`, async () => {
    expect((await fetch(`${base}${prefix}/categorie/inactive-unknown`)).status).toBe(404);
  }, 30000);
  test(`homepage SSR includes five live categories, six event prices and three FAQ answers ${prefix}`, async () => {
    const response = await fetch(`${base}${prefix || "/"}`);
    expect(response.status).toBe(200);
    const html = await response.text();
    const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const categorySection = withoutScripts.match(/<section\b[^>]*aria-labelledby="home-categories"[\s\S]*?<\/section>/)?.[0] ?? "";
    const selection = withoutScripts.match(/<section\b[^>]*aria-labelledby="home-selection"[\s\S]*?<\/section>/)?.[0] ?? "";
    const categorySlugs = [...categorySection.matchAll(/href="[^"?]*\/categorie\/([^"?]+)"/g)].map(m => m[1]);
    expect(categorySlugs).toEqual(expected);
    expect([...selection.matchAll(/href="[^"?]*\/produit\/([^"?]+)"/g)].map(m => m[1])).toEqual([...HOME_SELECTION]);
    expect([...selection.matchAll(prefix ? /excl\. VAT \/ event/g : /HT \/ événement/g)]).toHaveLength(6);
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const faq = schemas.find(s => s["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(3);
    expect(schemas.some(s => Array.isArray(s["@type"]) && s["@type"].includes("LocalBusiness"))).toBe(true);
  }, 30000);
}

test("sitemap lists only the five active category language pairs", async () => {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const slugs = [...xml.matchAll(/<loc>[^<]*\/categorie\/([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(slugs.sort()).toEqual(expected.flatMap(s => [s, s]).sort());
});