import { createMiddleware, createStart } from "@tanstack/react-start";
import { legacyLangRedirect } from "./lib/lang-url";

/** Legacy `?lang=en` / `?lang=fr` → permanent redirect to the clean localized URL. */
const legacyLangMiddleware = createMiddleware({ type: "request" }).server(async ({ request, next }) => {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const target = legacyLangRedirect(url);
    if (target) {
      return new Response(null, { status: 301, headers: { Location: target } }) as never;
    }
  }
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [legacyLangMiddleware],
}));
