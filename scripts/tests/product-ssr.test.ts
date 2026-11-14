import { expect, test } from "bun:test";

// HTTP integration test: no browser or JavaScript execution. Run against the
// deployed site with SSR_TEST_BASE_URL=https://catalogue.setup.paris bun test scripts/tests/product-ssr.test.ts
const base = (process.env.SSR_TEST_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

function visibleText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;|&#x[aA]0;/g, " ").replace(/\s+/g, " ").trim();
}

for (const prefix of ["", "/en"]) {
  test(`product HTML contains its H1 and visible event price before JavaScript (${prefix || "/fr"})`, async () => {
    const response = await fetch(`${base}${prefix}/produit/bar-droit`);
    expect(response.status).toBe(200);
    const html = await response.text();
    const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match => JSON.parse(match[1]));
    const product = schemas.find(schema => schema["@type"] === "Product");
    expect(product).toBeDefined();
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    expect(heading).not.toBeNull();
    expect(visibleText(heading?.[1] ?? "")).toBe(product.name);
    expect(html).toContain(`<title>${product.name} — Setup Paris</title>`);
    // Inspect the actual visible tariff, not a price hidden in JSON-LD or
    // hydration data. Derive the amount from the same public product DTO.
    const tariff = html.match(/<div\b[^>]*data-testid="event-price"[^>]*>([\s\S]*?)<\/div>/i);
    expect(tariff).not.toBeNull();
    const priceText = visibleText(tariff?.[1] ?? "");
    const amount = new Intl.NumberFormat(prefix ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
      .format(Number(product.offers.price)).replace(/\s+/g, " ");
    expect(priceText).toContain(amount);
    expect(priceText).toMatch(/€\s+(?:HT|excl\. VAT)/);
  }, 30000);
}

test("inactive product has HTTP 404, not an empty 200 product page", async () => {
  const response = await fetch(`${base}/produit/presentoir-triptyque`, { redirect: "manual" });
  expect(response.status).toBe(404);
}, 30000);