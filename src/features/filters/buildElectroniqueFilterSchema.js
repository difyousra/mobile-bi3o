/**
 * Schéma de filtres Électronique — aligné sur le new front
 * (buildElectroniqueFilterSchema.js).
 * Sous-catégories 32–39 dérivées de la config dépôt.
 */
import { getElectroniqueSubcategoryConfig } from '../annonces/config/electroniqueSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  ELECTRONIQUE_SUBCATEGORY_IDS,
  getElectroniqueAttributeIds,
} from './electroniqueFilterAttributes';

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

function buildStandardElectroniqueSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedElectroniqueSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getElectroniqueSubcategoryConfig,
    getAttributeIds: getElectroniqueAttributeIds,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildElectroniqueFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && ELECTRONIQUE_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedElectroniqueSchema(id, taxoAttributs);
  }

  return buildStandardElectroniqueSchema();
}
