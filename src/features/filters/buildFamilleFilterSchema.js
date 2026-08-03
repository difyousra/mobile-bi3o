/**
 * Schéma de filtres Famille — aligné sur le new front
 * (buildFamilleFilterSchema.js).
 * Sous-catégories 13–15 dérivées de la config dépôt.
 */
import { getFamilleSubcategoryConfig } from '../annonces/config/familleSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  FAMILLE_SUBCATEGORY_IDS,
  getFamilleAttributeIds,
} from './familleFilterAttributes';

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

function buildStandardFamilleSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedFamilleSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getFamilleSubcategoryConfig,
    getAttributeIds: getFamilleAttributeIds,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildFamilleFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && FAMILLE_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedFamilleSchema(id, taxoAttributs);
  }

  return buildStandardFamilleSchema();
}
