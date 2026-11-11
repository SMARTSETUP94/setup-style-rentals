/** Fire-and-forget conversion tracking (no cookie, no personal data). */
export type SiteEventName = "product_view" | "cart_add" | "quote_submit" | "custom_view" | "custom_save" | "contact_submit";

export function trackSiteEvent(name: SiteEventName, ref?: string) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ name, path: window.location.pathname.slice(0, 200), ref: ref ? ref.slice(0, 120) : undefined });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) return;
    void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    /* never block */
  }
}
