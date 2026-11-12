import { describe, expect, test } from "bun:test";
import { rewriteInput, rewriteOutput, localizedPath } from "../../src/lib/lang-url";
import { canonicalUrl, hreflangLinks } from "../../src/lib/seo";

const u = (s: string) => new URL(s, "https://catalogue.setup.paris");
const roundTrip = (s: string) => {
  const out = rewriteOutput(rewriteInput(u(s)));
  return out.pathname + out.search;
};

describe("language-prefixed URLs", () => {
  test("/en/... is English internally, French URLs are untouched", () => {
    expect(rewriteInput(u("/en/produit/stele")).search).toBe("?lang=en");
    expect(rewriteInput(u("/en")).pathname).toBe("/");
    expect(rewriteInput(u("/produit/stele")).search).toBe("");
    expect(rewriteInput(u("/entreprise")).pathname).toBe("/entreprise");
  });
  test("public URLs survive the round trip, query kept", () => {
    expect(roundTrip("/en/sur-mesure/comptoir?c=abc")).toBe("/en/sur-mesure/comptoir?c=abc");
    expect(roundTrip("/en")).toBe("/en");
    expect(roundTrip("/catalogue?q=x")).toBe("/catalogue?q=x");
  });
  test("admin and API never get the /en prefix", () => {
    expect(rewriteOutput(u("/admin/devis?lang=en")).pathname).toBe("/admin/devis");
    expect(rewriteOutput(u("/api/quotes/submit?lang=en")).pathname).toBe("/api/quotes/submit");
  });
  test("legacy ?lang= maps to the clean URL", () => {
    expect(roundTrip("/catalogue?lang=en&q=x")).toBe("/en/catalogue?q=x");
    expect(roundTrip("/contact?lang=fr")).toBe("/contact");
  });
  test("canonical and hreflang: x-default is French", () => {
    expect(localizedPath("/", "en")).toBe("/en");
    expect(canonicalUrl("/cgl", "en")).toBe("https://catalogue.setup.paris/en/cgl");
    const links = hreflangLinks("/cgl");
    expect(links.find((l) => l.hrefLang === "x-default")?.href).toBe("https://catalogue.setup.paris/cgl");
    expect(links.find((l) => l.hrefLang === "en")?.href).toBe("https://catalogue.setup.paris/en/cgl");
  });
});
