import { apiClient } from "../api/client";
import type { ExchangeRate } from "../types/catalog";

/** GET /exchange/current */
export async function fetchExchangeCurrent(): Promise<ExchangeRate> {
  const { data } = await apiClient.get<ExchangeRate>("/exchange/current");
  return data;
}

function asPositiveNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

/** Taux officiel : 1 EUR = X DZD. */
export function extractOfficialRate(
  rate: ExchangeRate | undefined
): number | undefined {
  if (!rate) return undefined;
  return (
    asPositiveNumber(rate.officialRate) ??
    asPositiveNumber(rate.eurToDzd) ??
    asPositiveNumber(rate.rate)
  );
}

/** Taux marché parallèle (vente) : 1 EUR = X DZD. */
export function extractParallelSellRate(
  rate: ExchangeRate | undefined
): number | undefined {
  if (!rate) return undefined;
  return (
    asPositiveNumber(rate.parallelSell) ??
    asPositiveNumber(rate.eurToDzd) ??
    asPositiveNumber(rate.rate)
  );
}

/**
 * Alias historique — préférer extractParallelSellRate / extractOfficialRate.
 * Conservé pour les listings (affichage EUR principal).
 */
export function extractEurToDzd(rate: ExchangeRate | undefined): number | undefined {
  return extractParallelSellRate(rate) ?? extractOfficialRate(rate);
}

/** DA → EUR (arrondi entier, aligné new front PaymentStep). */
export function dzdToEur(
  amountDzd: number | string | null | undefined,
  dzdPerEur: number | undefined
): number | null {
  const value = Number(amountDzd);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (!Number.isFinite(dzdPerEur) || !dzdPerEur || dzdPerEur <= 0) return null;
  return Math.round(value / dzdPerEur);
}

export function formatEurAmount(value: number | null, locale = "fr-FR"): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  return value.toLocaleString(locale);
}
