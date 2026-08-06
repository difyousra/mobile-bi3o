import i18n from '../../../i18n/index';
import { resolveIntlLocale } from '../../../i18n/localeHelpers';

/** Unités de saisie prix — aligné new front (priceUnit.js). */
export const PRICE_UNITS = ['millions', 'centimes', 'da'];

export const PRICE_UNIT_OPTIONS = [
  { value: 'millions', label: 'Millions' },
  { value: 'centimes', label: 'Centimes' },
  { value: 'da', label: 'DA' },
];

export function parsePositivePriceInput(raw) {
  const value = String(raw || '').trim().replace(/\s/g, '').replace(',', '.');
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Prix final en DA pour le backend (don → 0).
 * millions : saisie en millions de DA (ex. 230 → 230×10⁶).
 * centimes : saisie en centimes (ex. 250000 → 2500 DA).
 */
export function getFinalPriceDa(rawStr, unit = 'da', isDonation = false) {
  if (isDonation) return 0;
  const n = parsePositivePriceInput(rawStr);
  if (n === null) return NaN;
  if (unit === 'millions') return n * 1_000_000;
  if (unit === 'centimes') return n / 100;
  return n;
}

export function normalizePriceUnit(unit) {
  return PRICE_UNITS.includes(unit) ? unit : 'da';
}

export function formatPriceDa(value, localeOrLanguage) {
  if (!Number.isFinite(value)) return '';
  const locale = resolveIntlLocale(localeOrLanguage ?? i18n.language);
  return new Intl.NumberFormat(locale).format(value);
}

/** Libellé d’unité affiché à droite du champ saisie. */
export function getPriceUnitSuffix(unit, localeOrLanguage) {
  const lng = localeOrLanguage ?? i18n.language;
  const normalized = normalizePriceUnit(unit);
  if (normalized === 'millions') {
    return i18n.t('forms.deposit.unitMillions', { lng });
  }
  if (normalized === 'centimes') {
    return i18n.t('forms.deposit.unitCentimes', { lng });
  }
  return i18n.t('forms.deposit.unitDa', { lng });
}

/** Aperçu du prix affiché (toujours en DA), ou null si invalide. */
export function getDisplayedPriceLabel(
  rawStr,
  unit = 'da',
  isDonation = false,
  localeOrLanguage
) {
  const lng = localeOrLanguage ?? i18n.language;
  if (isDonation) {
    return i18n.t('forms.deposit.priceDonation', { lng });
  }
  const finalDa = getFinalPriceDa(rawStr, unit, false);
  if (!Number.isFinite(finalDa) || finalDa < 1) return null;
  return i18n.t('forms.deposit.displayPriceDa', {
    n: formatPriceDa(Math.round(finalDa), lng),
    lng,
  });
}

/** Indice de conversion selon l’unité choisie. */
export function getPriceUnitHint(
  rawStr,
  unit = 'da',
  isDonation = false,
  localeOrLanguage
) {
  if (isDonation) return null;
  const lng = localeOrLanguage ?? i18n.language;
  const n = parsePositivePriceInput(rawStr);
  if (n === null) return null;
  const normalized = normalizePriceUnit(unit);
  if (normalized === 'millions') {
    return i18n.t('forms.deposit.displayPriceMillions', {
      n: formatPriceDa(n, lng),
      lng,
    });
  }
  if (normalized === 'centimes') {
    return i18n.t('forms.deposit.displayPriceCentimes', {
      n: formatPriceDa(n, lng),
      lng,
    });
  }
  return null;
}
