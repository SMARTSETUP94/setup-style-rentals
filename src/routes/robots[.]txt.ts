import { createFileRoute } from "@tanstack/react-router";

/**
 * /robots.txt — allows all crawlers and points to the dynamic sitemap.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;

        const body =
          `User-agent: *\n` +
          `Allow: /\n` +
          `Disallow: /admin\n` +
          `Disallow: /admin/\n\n` +
          `Sitemap: ${origin}/sitemap.xml\n`;

        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
