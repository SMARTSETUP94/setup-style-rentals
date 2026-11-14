import { expect, test } from "bun:test";
import { dashboardAmount, importedProductImage, isCustomOnly, pendingApplicants } from "@/lib/admin-display";

test("all custom requests are on quote when no internal estimate exists", () => {
  expect(isCustomOnly([{ kind: "custom" }])).toBe(true);
  expect(dashboardAmount([{ kind: "custom" }], 0)).toBeNull();
});
test("custom internal estimates become incl. VAT, rental and mixed totals stay unchanged", () => {
  expect(dashboardAmount([{ kind: "custom" }], 0, 100)).toBe(120);
  expect(dashboardAmount([{ kind: "custom" }, { kind: "rental" }], 324, 100)).toBe(324);
  expect(dashboardAmount([{ kind: "rental" }], 50)).toBe(50);
});
test("only imported slug-timestamp filenames receive the image badge", () => {
  expect(importedProductImage("stele", "https://example.org/stele-1794600000000.jpg")).toBe(true);
  expect(importedProductImage("stele", "https://example.org/pouf-1794600000000.jpg")).toBe(false);
  expect(importedProductImage("stele", "https://example.org/stele.jpg")).toBe(false);
});
test("pending applicants are distinct case-insensitive emails, with all pending request links", () => {
  const rows = [{ email: " A@example.org ", status: "pending" }, { email: "a@example.org", status: "pending" }, { email: "b@example.org", status: "confirmed" }];
  expect(pendingApplicants(rows)).toEqual([{ email: "a@example.org", quotes: rows.slice(0, 2) }]);
});