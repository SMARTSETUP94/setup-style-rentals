import { expect, test } from "bun:test";
import { rentalDates } from "@/lib/rental-dates";

test("one start date is retained with the same end date and one day", () => {
  expect(rentalDates("2026-12-13")).toEqual({ startDate: "2026-12-13", endDate: "2026-12-13", days: 1 });
});
test("one end date is also a one-day rental", () => {
  expect(rentalDates(undefined, "2026-12-13")).toEqual({ startDate: "2026-12-13", endDate: "2026-12-13", days: 1 });
});
test("range retains both dates and inclusive duration; no date retains manual duration", () => {
  expect(rentalDates("2026-12-13", "2026-12-15").days).toBe(3);
  expect(rentalDates().days).toBeUndefined();
});