import { apiClient } from "../api/client";
import type { ExchangeRate } from "../types/catalog";

/** GET /exchange/current */
export async function fetchExchangeCurrent(): Promise<ExchangeRate> {
  const { data } = await apiClient.get<ExchangeRate>("/exchange/current");
  return data;
}

/**
 * En Algérie le marché parallèle est PLUS CHER que la banque :
 * 1 EUR coûte plus de dinars au parallèle qu’au taux officiel.
 * Donc : parallelSell (DZD/EUR) > officialRate (DZD/EUR)
 * et pour un même prix en DA : euros_parallèle < euros_banque.
 */
export const FALLBACK_PARALLEL_DZD_PER_EUR = 260;
export const FALLBACK_OFFICIAL_DZD_PER_EUR = 145;

function asPositiveNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

/**
 * Taux officiel banque uniquement — ne pas retomber sur eurToDzd/rate
 * (souvent = parallèle), sinon on inverse les niveaux de prix.
 */
export function extractOfficialRate(
  rate: ExchangeRate | undefined
): number | undefined {
  if (!rate) return undefined;
  return asPositiveNumber(rate.officialRate);
}

/** Taux marché parallèle (vente, sinon achat, sinon alias legacy). */
export function extractParallelSellRate(
  rate: ExchangeRate | undefined
): number | undefined {
  if (!rate) return undefined;
  return (
    asPositiveNumber(rate.parallelSell) ??
    asPositiveNumber(rate.parallelBuy) ??
    asPositiveNumber(rate.eurToDzd) ??
    asPositiveNumber(rate.rate)
  );
}

/**
 * Alias historique — affichage EUR principal = marché parallèle (plus cher).
 */
export function extractEurToDzd(
  rate: ExchangeRate | undefined
): number | undefined {
  return (
    extractParallelSellRate(rate) ??
    FALLBACK_PARALLEL_DZD_PER_EUR
  );
}

export type ResolvedExchangeRates = {
  /** 1 EUR = X DZD — marché parallèle (plus cher). */
  parallelSell: number;
  /** 1 EUR = X DZD — banque (moins cher). */
  officialRate: number;
  /** Alias pour l’affichage principal (= parallelSell). */
  eurToDzd: number;
};

/**
 * Résout les deux taux et garantit parallèle > banque (DZD/EUR).
 * Si l’API renvoie les champs inversés, on les corrige.
 */
export function resolveExchangeRates(
  rate: ExchangeRate | undefined
): ResolvedExchangeRates {
  let parallel =
    extractParallelSellRate(rate) ?? FALLBACK_PARALLEL_DZD_PER_EUR;
  let official =
    extractOfficialRate(rate) ?? FALLBACK_OFFICIAL_DZD_PER_EUR;

  // Parallèle doit être le plus élevé (plus de DA pour 1 €).
  if (parallel < official) {
    const tmp = parallel;
    parallel = official;
    official = tmp;
  }

  // Écart minimal de sécurité si les deux taux sont identiques / absents.
  if (parallel <= official) {
    parallel = Math.max(parallel, FALLBACK_PARALLEL_DZD_PER_EUR);
    official = Math.min(official, FALLBACK_OFFICIAL_DZD_PER_EUR);
    if (parallel <= official) {
      parallel = FALLBACK_PARALLEL_DZD_PER_EUR;
      official = FALLBACK_OFFICIAL_DZD_PER_EUR;
    }
  }

  return {
    parallelSell: parallel,
    officialRate: official,
    eurToDzd: parallel,
  };
}

/** DA → EUR (arrondi entier, aligné new front). */
export function dzdToEur(
  amountDzd: number | string | null | undefined,
  dzdPerEur: number | undefined
): number | null {
  const value = Number(amountDzd);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (!Number.isFinite(dzdPerEur) || !dzdPerEur || dzdPerEur <= 0) return null;
  return Math.round(value / dzdPerEur);
}

export function formatEurAmount(
  value: number | null,
  locale = "fr-FR"
): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value.toLocaleString(locale);
}
