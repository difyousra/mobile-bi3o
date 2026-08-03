/**
 * Schéma de filtres Animaux — aligné sur le new front
 * (buildAnimauxFilterSchema.js).
 * Sous-catégories 61–62 dérivées de la config dépôt.
 */
import { getAnimauxSubcategoryConfig } from '../annonces/config/animauxSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  ANIMAUX_SUBCATEGORY_IDS,
  getAnimauxAttributeIds,
} from './animauxFilterAttributes';

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

const ANIMAUX_SKIP_FIELD_NAMES = [
  'race',
  'numeroIdentification',
  'quantite',
];

function buildStandardAnimauxSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedAnimauxSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getAnimauxSubcategoryConfig,
    getAttributeIds: getAnimauxAttributeIds,
    skipFieldNames: ANIMAUX_SKIP_FIELD_NAMES,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildAnimauxFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && ANIMAUX_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedAnimauxSchema(id, taxoAttributs);
  }

  return buildStandardAnimauxSchema();
}
