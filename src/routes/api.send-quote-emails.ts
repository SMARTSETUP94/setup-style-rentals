import { createFileRoute } from "@tanstack/react-router";

// Retired: quote submission and emails now go through POST /api/quotes/submit.
const gone = () => Response.json({ error: "gone" }, { status: 410 });

export const Route = createFileRoute("/api/send-quote-emails")({
  server: {
    handlers: {
      GET: gone,
      POST: gone,
      PUT: gone,
      PATCH: gone,
      DELETE: gone,
    },
  },
});
