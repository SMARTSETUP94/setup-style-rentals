import { expect, test } from "bun:test";
import { seoDescription } from "../../src/lib/seo";
import { SUR_MESURE_SPECS } from "../../src/lib/sur-mesure-specs";

const base = (process.env.SSR_TEST_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const visible = (s: string) => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

test("metadata snippet does not split a word and stays at 155 characters", () => {
  const input = "Présentation ".repeat(20);
  expect(seoDescription(input).length).toBeLessThanOrEqual(155);
  expect(seoDescription(input).endsWith("Présentation")).toBe(true);
});

test("all 24 custom pieces expose the existing configurator bounds", () => {
  expect(Object.keys(SUR_MESURE_SPECS)).toHaveLength(24);
  expect(SUR_MESURE_SPECS.comptoir.dimensions[0]).toEqual({ label: "Largeur", min: 800, max: 2700 });
});

for (const prefix of ["", "/en"]) {
  for (const [path, type] of [["/produit/bar-droit", "Product"], ["/categorie/jeux", "ItemList"], ["/sur-mesure/comptoir", "Service"]]) {
    test(`initial HTML title/meta/H1/JSON-LD ${prefix}${path}`, async () => {
      const response = await fetch(`${base}${prefix}${path}`);
      expect(response.status).toBe(200);
      const html = await response.text();
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(65);
      const meta = html.match(/<meta\b(?=[^>]*name="description")(?=[^>]*content="([^"]*)")[^>]*>/)?.[1] ?? "";
      expect(meta.length).toBeGreaterThanOrEqual(70);
      expect(meta.length).toBeLessThanOrEqual(160);
      expect([...html.matchAll(/<h1\b/g)]).toHaveLength(1);
      const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
      expect(schemas.some(s => s["@type"] === type)).toBe(true);
      expect(schemas.some(s => s["@type"] === "BreadcrumbList")).toBe(true);
      if (type === "Product") {
        const product = schemas.find(s => s["@type"] === "Product");
        expect(product.offers.priceSpecification.unitText).toBe("par événement");
        expect(product.brand.name).toBe("Setup Paris");
        expect(Number(product.offers.price)).toBeGreaterThan(0);
      }
      if (type === "Service") {
        const text = visible(html);
        expect(text).toContain("800");
        expect(text).toContain("2700");
        expect(text).toContain("48");
        expect(text).not.toMatch(/€|\bEUR\b/);
        expect(html).not.toContain('<iframe');
      }
      if (type === "ItemList") {
        const faq = schemas.find(s => s["@type"] === "FAQPage");
        if (faq) {
          expect(faq.mainEntity.length).toBeGreaterThan(0);
          const text = visible(html);
          for (const question of faq.mainEntity) expect(text).toContain(question.acceptedAnswer.text);
        }
      }
    }, 30000);
  }
}

test("sitemap contains exactly the active rental, category, custom and static language pairs", async () => {
  const response = await fetch(`${base}/sitemap.xml`);
  expect(response.status).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.filter(url => url.includes("/produit/"))).toHaveLength(80);
  expect(urls.filter(url => url.includes("/categorie/"))).toHaveLength(10);
  expect(urls.filter(url => url.includes("/sur-mesure/"))).toHaveLength(48);
  expect(urls).toHaveLength(152);
  expect(urls.some(url => url.includes("presentoir-triptyque"))).toBe(false);
});