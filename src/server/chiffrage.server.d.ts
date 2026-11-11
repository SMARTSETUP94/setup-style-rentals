// Types for the server-only pricing engine. Never import from browser code.
export interface ChiffrageConfiguration {
  pk: string;
  qte?: number;
  tous: Record<string, { d?: Record<string, number>; z?: Record<string, unknown>; o?: Record<string, unknown> }>;
}
export interface ChiffrageOptions {
  quantite?: number;
  hyp?: Record<string, number>;
  t0?: number;
}
export interface ChiffrageLigne { poste: string; detail: string; montant: number }
export interface ChiffrageDebit { nom: string; mat: string; L: number; l: number; ep: number }
export interface ChiffrageHypothese { cle: string; libelle: string; valeur: number }
export interface ChiffrageOk {
  ok: true;
  piece: string;
  nom: string;
  quantite: number;
  total_ht: number;
  unite_ht: number;
  matieres_ht: number;
  main_oeuvre_ht: number;
  poids_kg: number;
  t0: number;
  lignes: ChiffrageLigne[];
  alertes: string[];
  non_chiffre: string[];
  debit: ChiffrageDebit[];
  hypotheses: ChiffrageHypothese[];
  incomplet: boolean;
}
export interface ChiffrageErr { ok: false; erreur: string }
export type ChiffrageResult = ChiffrageOk | ChiffrageErr;
export function chiffrer(configuration: unknown, options?: ChiffrageOptions): ChiffrageResult;
export function hypothesesParDefaut(): ChiffrageHypothese[];
