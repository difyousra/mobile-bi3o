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

export function formatPriceDa(value, locale = 'fr-DZ') {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat(locale).format(value);
}

/** Libellé d’unité affiché à droite du champ saisie. */
export function getPriceUnitSuffix(unit) {
  const normalized = normalizePriceUnit(unit);
  if (normalized === 'millions') return 'Millions';
  if (normalized === 'centimes') return 'Centimes';
  return 'DA';
}

/** Aperçu du prix affiché (toujours en DA), ou null si invalide. */
export function getDisplayedPriceLabel(rawStr, unit = 'da', isDonation = false) {
  if (isDonation) return 'Annonce en don';
  const finalDa = getFinalPriceDa(rawStr, unit, false);
  if (!Number.isFinite(finalDa) || finalDa < 1) return null;
  return `${formatPriceDa(Math.round(finalDa))} DA`;
}

/** Indice de conversion selon l’unité choisie. */
export function getPriceUnitHint(rawStr, unit = 'da', isDonation = false) {
  if (isDonation) return null;
  const n = parsePositivePriceInput(rawStr);
  if (n === null) return null;
  const normalized = normalizePriceUnit(unit);
  if (normalized === 'millions') {
    return `${formatPriceDa(n)} millions DA`;
  }
  if (normalized === 'centimes') {
    return `${formatPriceDa(n)} centimes`;
  }
  return null;
}
