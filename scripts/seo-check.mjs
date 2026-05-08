#!/usr/bin/env node
/**
 * SEO check — verifies that every public page returns:
 *   1. exactly one <link rel="canonical"> with the expected absolute URL
 *      (no `?lang=` parameter, no trailing slash)
 *   2. <link rel="alternate" hreflang="fr"> pointing at the canonical URL
 *   3. <link rel="alternate" hreflang="x-default"> pointing at the canonical URL
 *   4. canonical/hreflang are stable across `?lang=fr` and `?lang=en`
 *      (the language toggle must NOT change the canonical signal)
 *
 * Usage:
 *   node scripts/seo-check.mjs                       # default: production URL
 *   node scripts/seo-check.mjs https://other.host    # custom base URL
 *
 * Exits with code 0 if all checks pass, 1 otherwise.
 */

const BASE = (process.argv[2] ?? "https://catalogue.setup.paris").replace(/\/+$/, "");
const SITEMAP_URL = `${BASE}/sitemap.xml`;

// Public routes to verify. Dynamic routes use a representative slug — adjust
// the slugs below if these no longer exist in the catalogue.
const ROUTES = [
  "/",
  "/catalogue",
  "/devis",
  "/cgl",
  "/mentions-legales",
  // Representative dynamic pages — update slugs to match real content.
  "/categorie/mobilier",
  "/produit/mange-debout-noir",
];

const LANGS = ["fr", "en"];

function expectedCanonical(path) {
  const clean = path.split("?")[0].split("#")[0];
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  const normalized = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
  return `${BASE}${normalized}`;
}

function extractLinks(html) {
  // Capture every <link ...> tag in <head>.
  const links = [];
  const re = /<link\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = {};
    const attrRe = /(\w[\w-]*)\s*=\s*"([^"]*)"/g;
    let a;
    while ((a = attrRe.exec(m[1])) !== null) {
      attrs[a[1].toLowerCase()] = a[2];
    }
    links.push(attrs);
  }
  return links;
}

async function checkRoute(path, lang) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;
  const expected = expectedCanonical(path);

  const res = await fetch(url, { redirect: "manual" });
  const html = await res.text();
  const links = extractLinks(html);

  const canonicals = links.filter((l) => l.rel === "canonical");
  const hreflangs = links.filter((l) => l.rel === "alternate" && l.hreflang);

  const errors = [];
  if (res.status !== 200) errors.push(`HTTP ${res.status}`);
  if (canonicals.length !== 1) {
    errors.push(`expected 1 canonical, got ${canonicals.length}`);
  } else if (canonicals[0].href !== expected) {
    errors.push(`canonical=${canonicals[0].href} (expected ${expected})`);
  }

  const fr = hreflangs.find((l) => l.hreflang === "fr");
  const xd = hreflangs.find((l) => l.hreflang === "x-default");
  if (!fr) errors.push("missing hreflang=fr");
  else if (fr.href !== expected) errors.push(`hreflang fr=${fr.href} (expected ${expected})`);
  if (!xd) errors.push("missing hreflang=x-default");
  else if (xd.href !== expected) errors.push(`hreflang x-default=${xd.href} (expected ${expected})`);

  // No hreflang/canonical should ever contain `?lang=`.
  for (const l of [...canonicals, ...hreflangs]) {
    if (l.href && l.href.includes("?lang=")) {
      errors.push(`${l.rel}/${l.hreflang ?? ""} contains ?lang=: ${l.href}`);
    }
  }

  return { url, errors };
}

let failed = 0;
let passed = 0;
console.log(`SEO check against ${BASE}\n`);

// ---------------------------------------------------------------------------
// Coverage step — diff sitemap.xml against the ROUTES we plan to test.
// Goal: make sure we don't ship a new public URL without adding it to this
// script, and that we don't keep stale routes after they're removed from
// the sitemap.
// ---------------------------------------------------------------------------
console.log(`Fetching sitemap: ${SITEMAP_URL}`);
let sitemapPaths = [];
try {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  sitemapPaths = [
    ...new Set(
      locs.map((u) => {
        try {
          return new URL(u).pathname.replace(/\/+$/, "") || "/";
        } catch {
          return u;
        }
      }),
    ),
  ];
  console.log(`  found ${sitemapPaths.length} unique URLs in sitemap`);
} catch (err) {
  console.log(`  ✗ failed to fetch sitemap: ${err.message}`);
  failed++;
}

const tested = new Set(ROUTES.map((p) => p.replace(/\/+$/, "") || "/"));
const inSitemap = new Set(sitemapPaths);

const missingFromScript = [...inSitemap].filter((p) => !tested.has(p));
const staleInScript = [...tested].filter((p) => !inSitemap.has(p));

if (missingFromScript.length) {
  console.log(`\n  ✗ ${missingFromScript.length} sitemap URL(s) not covered by this script:`);
  for (const p of missingFromScript) console.log(`      ${p}`);
  failed++;
} else if (sitemapPaths.length) {
  console.log(`  ✓ every sitemap URL is covered by this script`);
  passed++;
}
if (staleInScript.length) {
  console.log(`  ⚠ ${staleInScript.length} script route(s) not present in sitemap (stale or dynamic):`);
  for (const p of staleInScript) console.log(`      ${p}`);
}
console.log("");

// Run head-tag checks against the union of declared ROUTES and sitemap URLs
// so dynamic pages added on the server are validated automatically.
const allRoutes = [...new Set([...ROUTES, ...sitemapPaths])];

for (const path of allRoutes) {
  for (const lang of LANGS) {
    const { url, errors } = await checkRoute(path, lang);
    if (errors.length === 0) {
      console.log(`  ✓ ${url}`);
      passed++;
    } else {
      console.log(`  ✗ ${url}`);
      for (const e of errors) console.log(`      ${e}`);
      failed++;
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);