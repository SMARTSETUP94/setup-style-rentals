import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/produits")({
  beforeLoad: () => { throw redirect({ to: "/admin/products", replace: true }); },
});