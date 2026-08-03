/**
 * Schéma de filtres Mode — aligné sur le new front
 * (buildModeFilterSchema.js).
 * Sous-catégories 16–19 dérivées de la config dépôt.
 */
import { getModeSubcategoryConfig } from '../annonces/config/modeSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  MODE_SUBCATEGORY_IDS,
  getModeAttributeIds,
} from './modeFilterAttributes';

const PRICE_RANGE = {
  id: 'price',
  type: 'range',
  label: 'Fourchette de prix',
  hint: 'Définissez un prix minimum et maximum',
  minParam: 'priceMin',
  maxParam: 'priceMax',
  currency: 'Da',
  api: { kind: 'price' },
};

function buildStandardModeSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedModeSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getModeSubcategoryConfig,
    getAttributeIds: getModeAttributeIds,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildModeFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && MODE_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedModeSchema(id, taxoAttributs);
  }

  return buildStandardModeSchema();
}
