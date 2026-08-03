/**
 * Schéma de filtres Matériel professionnel — aligné sur le new front
 * (buildMaterielProFilterSchema.js).
 * Sous-catégories 45–46 dérivées de la config dépôt.
 */
import { getMaterielProfessionnelSubcategoryConfig } from '../annonces/config/materielProfessionnelSubcategories';
import { buildSubcategoryFilterSchemaFromDeposit } from './filterDepositFieldHelpers';
import {
  MATERIEL_PRO_SUBCATEGORY_IDS,
  getMaterielProAttributeIds,
} from './materielProFilterAttributes';

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

const MATERIEL_PRO_SKIP_FIELD_NAMES = [
  'puissance_ch',
  'heures_h',
  'titre_materiel',
  'annee',
  'contact',
];

function buildStandardMaterielProSchema() {
  return [PRICE_RANGE];
}

function buildDedicatedMaterielProSchema(sousCategorieId, taxoAttributs = []) {
  return buildSubcategoryFilterSchemaFromDeposit({
    sousCategorieId,
    taxoAttributs,
    getSubcategoryConfig: getMaterielProfessionnelSubcategoryConfig,
    getAttributeIds: getMaterielProAttributeIds,
    skipFieldNames: MATERIEL_PRO_SKIP_FIELD_NAMES,
    trailingFields: [PRICE_RANGE],
  });
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildMaterielProFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && MATERIEL_PRO_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedMaterielProSchema(id, taxoAttributs);
  }

  return buildStandardMaterielProSchema();
}
