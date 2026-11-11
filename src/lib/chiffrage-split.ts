/** Split engine `non_chiffre` notes into true "not priced" items and plain remarks. */
export function splitNonChiffre(list: string[]): { postes: string[]; notes: string[] } {
  const isPoste = (s: string) => /non chiffr|hors estimation/i.test(s);
  return { postes: list.filter(isPoste), notes: list.filter((s) => !isPoste(s)) };
}

/** Remove "Référence :" / "Poids estimé :" lines from a custom recap (already shown in the piece header). */
export function stripRecapHeader(recap: string): string {
  return recap
    .split(/\r?\n/)
    .filter((l) => !/^\s*(Référence|Poids estimé)\s*:/i.test(l))
    .join("\n")
    .trim();
}
