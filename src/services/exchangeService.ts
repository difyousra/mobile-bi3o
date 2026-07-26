import { apiClient } from "../api/client";
import type { ExchangeRate } from "../types/catalog";

/** GET /exchange/current */
export async function fetchExchangeCurrent(): Promise<ExchangeRate> {
  const { data } = await apiClient.get<ExchangeRate>("/exchange/current");
  return data;
}

export function extractEurToDzd(rate: ExchangeRate | undefined): number | undefined {
  if (!rate) return undefined;
  if (typeof rate.eurToDzd === "number") return rate.eurToDzd;
  if (typeof rate.rate === "number") return rate.rate;
  const values = Object.values(rate).filter(
    (v): v is number => typeof v === "number" && v > 1
  );
  return values[0];
}
