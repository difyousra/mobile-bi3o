/**
 * Formatage d’affichage des cartes annonces — aligné sur
 * bi3oo_front_new_design/src/shared/utils/formatListingDisplay.js
 *
 * EUR affiché = marché parallèle (plus cher → moins d’euros).
 * Banque = secondaire / tooltip (taux plus bas → plus d’euros).
 */
import { formatAnnonceLocationLine } from "./algeriaLocation";
import { dzdToEur } from "../services/exchangeService";
import i18n, { normalizeLocale } from "../i18n/index";
import { resolveIntlLocale } from "../i18n/localeHelpers";

/** Catégorie API Emploi */
export const EMPLOI_CATEGORIE_ID = 7;
/** Sous-catégories Emploi */
export const EMPLOI_SOUS_CATEGORIE_IDS = new Set([10, 11, 12]);

export function shouldHideEurConversion(ad = {}) {
  if (ad.hideEurConversion === true) return true;
  if (ad.cardVariant === "job") return true;
  if (Number(ad.categorieId) === EMPLOI_CATEGORIE_ID) return true;
  if (EMPLOI_SOUS_CATEGORIE_IDS.has(Number(ad.sousCategorieId))) return true;
  const name = String(ad.categorieNom || ad.categoryName || "").toLowerCase();
  if (name.includes("emploi") || name.includes("job")) return true;
  return false;
}

export function formatListingPriceDZD(amount, localeOrLanguage) {
  if (amount == null || amount === "") return "";
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) return "";
  const locale = resolveIntlLocale(localeOrLanguage ?? i18n.language);
  return `${value.toLocaleString(locale)} Da`;
}

export function formatListingPriceEUR(amountDzd, dzdPerEur, localeOrLanguage) {
  const euros = dzdToEur(amountDzd, dzdPerEur);
  if (euros == null) return "";
  const locale = resolveIntlLocale(localeOrLanguage ?? i18n.language);
  return `${euros.toLocaleString(locale)} €`;
}

export function resolveListingCardPrices(
  listing = {},
  rates = {},
  localeOrLanguage
) {
  const locale = localeOrLanguage ?? i18n.language;
  const prix =
    listing.prix != null
      ? Number(listing.prix)
      : listing.priceDzd != null
        ? Number(listing.priceDzd)
        : listing.priceDa != null
          ? Number(listing.priceDa)
          : null;
  const hideEur = shouldHideEurConversion(listing);

  const parallel =
    rates.parallelSell ?? rates.eurToDzd ?? rates.parallel;
  const official = rates.officialRate ?? rates.official;

  if (prix != null && Number.isFinite(prix) && prix > 0) {
    return {
      price: formatListingPriceDZD(prix, locale),
      eurPrice: hideEur ? "" : formatListingPriceEUR(prix, parallel, locale),
      eurPriceOfficial: hideEur
        ? ""
        : formatListingPriceEUR(prix, official, locale),
    };
  }

  return {
    price: listing.priceLabel || "",
    eurPrice: hideEur ? "" : listing.eurLabel || "",
    eurPriceOfficial: hideEur ? "" : listing.eurOfficialLabel || "",
  };
}

export function buildEurRatesTooltip(eurPrice, eurPriceOfficial, localeOrLanguage) {
  if (!eurPrice) return undefined;
  const lng = localeOrLanguage ?? i18n.language;
  const parts = [
    i18n.t("mobile.format.parallelRate", { price: eurPrice, lng }),
  ];
  if (eurPriceOfficial) {
    parts.push(
      i18n.t("mobile.format.officialRate", { price: eurPriceOfficial, lng })
    );
  }
  return parts.join(" — ");
}

export function formatListingLocation(ville, codePostal) {
  const mapped = formatAnnonceLocationLine(codePostal, ville);
  if (mapped) return mapped;
  const city = String(ville || "").trim();
  const postal = String(codePostal || "").trim();
  if (/^\d{1,2}$/.test(city)) return postal || "";
  if (city && postal) return `${city} ${postal}`;
  return city || postal || "";
}

export function formatListingPostedAt(date, localeOrLanguage) {
  if (!date) return "";

  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const locale = resolveIntlLocale(localeOrLanguage ?? i18n.language);
  const lng = normalizeLocale(localeOrLanguage ?? i18n.language);

  const now = new Date();
  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

  if (value.toDateString() === now.toDateString()) {
    return i18n.t("mobile.format.todayAt", { time, lng });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (value.toDateString() === yesterday.toDateString()) {
    return i18n.t("mobile.format.yesterdayAt", { time, lng });
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function sellerInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return "U";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "U";
}
