/**
 * Schéma de filtres Services — aligné sur le new front
 * (buildServicesFilterSchema.js).
 * Sous-catégorie 50 dérivée de la config dépôt.
 */
import { getServiceSubcategoryConfig } from '../annonces/config/serviceSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  SERVICES_SUBCATEGORY_IDS,
  getServicesAttributeIds,
} from './servicesFilterAttributes';

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

const SERVICES_SKIP_FIELD_NAMES = [
  'informations_supplementaires',
  'echanges_prets',
  'contact',
];

function buildStandardServicesSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedServicesSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getServiceSubcategoryConfig,
    getAttributeIds: getServicesAttributeIds,
    skipFieldNames: SERVICES_SKIP_FIELD_NAMES,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildServicesFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && SERVICES_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedServicesSchema(id, taxoAttributs);
  }

  return buildStandardServicesSchema();
}
