/**
 * Schéma de filtres Loisirs — aligné sur le new front
 * (buildLoisirsFilterSchema.js).
 * Sous-catégories 20–31, 89 dérivées de la config dépôt.
 */
import { getLoisirsSubcategoryConfig } from '../annonces/config/loisirsSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  LOISIRS_SUBCATEGORY_IDS,
  getLoisirsAttributeIds,
} from './loisirsFilterAttributes';

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

/** Champs dépôt exclus du filtre (contact, quantité, identifiants, etc.). */
const LOISIRS_SKIP_FIELD_NAMES = [
  'quantite',
  'contact',
  'numero_identification_velo',
  'nombre_de_personnes',
];

function buildStandardLoisirsSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedLoisirsSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getLoisirsSubcategoryConfig,
    getAttributeIds: getLoisirsAttributeIds,
    skipFieldNames: LOISIRS_SKIP_FIELD_NAMES,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildLoisirsFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && LOISIRS_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedLoisirsSchema(id, taxoAttributs);
  }

  return buildStandardLoisirsSchema();
}
