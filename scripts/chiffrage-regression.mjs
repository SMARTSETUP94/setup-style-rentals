// Non-regression test for the server-only pricing engine (run: node scripts/chiffrage-regression.mjs)
import { chiffrer } from "../src/server/chiffrage.server.js";
const bar = { pk: "bar", qte: 1, tous: { bar: { d: { W: 2000, H: 1150, D: 700 }, z: { corps: { fin: "laque", col: "#0e0e10", nom: "RAL 9005" }, plateau: { fin: "chene", col: "#f1f0ea", nom: "RAL 9016" }, metal: { fin: "acierP", col: "#0e0e10", nom: "RAL 9005" } }, o: { roulettes: false, plinthe: true, repose: false, logo: true } } } };
const cases = [
  ["bar total_ht", chiffrer(bar).total_ht, 2448.35],
  ["stele unite_ht (arrondi)", Math.round(chiffrer({ pk: "stele", qte: 1, tous: {} }).unite_ht), 899],
  ["stele ×10 unite_ht", chiffrer({ pk: "stele", qte: 1, tous: {} }, { quantite: 10 }).unite_ht, 537.78],
  ["comptoir unite_ht (arrondi)", Math.round(chiffrer({ pk: "comptoir", tous: {} }).unite_ht), 1540],
  ["lettres unite_ht", chiffrer({ pk: "lettres", qte: 1, tous: {} }).unite_ht, 1829.19],
  ["lettres SETUP 2026 Hl 1200 unite_ht", chiffrer({ pk: "lettres", qte: 1, tous: { lettres: { d: { Hl: 1200 }, z: {}, o: { texte: "SETUP 2026" } } } }).unite_ht, 4705.34],
  ["lettres incomplet", chiffrer({ pk: "lettres", qte: 1, tous: {} }).incomplet, false],
];
let fail = 0;
for (const [n, got, exp] of cases) { const ok = got === exp; if (!ok) fail++; console.log(`${ok ? "OK  " : "FAIL"} ${n}: ${got} (attendu ${exp})`); }
process.exit(fail ? 1 : 0);
