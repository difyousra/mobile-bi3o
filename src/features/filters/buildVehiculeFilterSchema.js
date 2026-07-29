/**
 * Construit le schéma de filtres véhicule selon la sous-catégorie.
 * Aligné sur le web : buildVehiculesFilterSchema (buildLegacyCategoryFilterSchema.js)
 */
import {
  getVehiculeAttributeIds,
  getMarquesBySubCat,
  VEHICULE_ENERGIE_OPTIONS,
  VEHICULE_BOITE_OPTIONS,
  VEHICULE_ETAT_OPTIONS,
  VEHICULE_DOCUMENTS_OPTIONS,
  VEHICULES_SOUS_CATEGORIES,
} from './vehiculeFilterAttributes';

const PRICE_RANGE = {
  id: 'price',
  type: 'range',
  label: 'Fourchette de prix',
  minParam: 'priceMin',
  maxParam: 'priceMax',
  currency: 'Da',
  api: { kind: 'price' },
};

/**
 * @param {number|string|null} sousCategorieId
 * @returns {Array}
 */
export function buildVehiculeFilterSchema(sousCategorieId = null) {
  const subId = Number(sousCategorieId);
  const attrs = getVehiculeAttributeIds(sousCategorieId);

  const isMoto = subId === VEHICULES_SOUS_CATEGORIES.MOTOS;

  const fields = [
    PRICE_RANGE,
    {
      id: 'brand',
      type: 'vehicleBrand',        // type spécial → chargement dynamique depuis référentiel
      label: 'Marque',
      param: 'brand',
      placeholder: 'Toutes les marques',
      sousCategorieId,
      options: getMarquesBySubCat(sousCategorieId), // fallback statique
      api: attrs.marque
        ? { kind: 'attribute', attributeId: attrs.marque, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'model',
      type: 'vehicleModel',        // type spécial → dépend de la marque sélectionnée
      label: 'Modèle',
      param: 'model',
      placeholder: 'Tous les modèles',
      dependsOn: 'brand',
      sousCategorieId,
      api: attrs.modele
        ? { kind: 'attribute', attributeId: attrs.modele, attributeType: 'LISTE' }
        : null,
    },
    attrs.energie
      ? {
          id: 'fuel',
          type: 'tags',
          label: 'Carburant',
          param: 'fuel',
          selectionMode: 'multi',
          options: VEHICULE_ENERGIE_OPTIONS,
          api: { kind: 'attribute', attributeId: attrs.energie, attributeType: 'LISTE' },
        }
      : null,
    attrs.etat
      ? {
          id: 'etat',
          type: 'tags',
          label: 'État',
          param: 'etat',
          selectionMode: 'multi',
          options: VEHICULE_ETAT_OPTIONS,
          api: { kind: 'attribute', attributeId: attrs.etat, attributeType: 'LISTE' },
        }
      : null,
    !isMoto && attrs.boite
      ? {
          id: 'gearbox',
          type: 'buttons',
          label: 'Boîte de vitesses',
          param: 'gearbox',
          options: VEHICULE_BOITE_OPTIONS.map((v) => ({ value: v, label: v })),
          api: { kind: 'attribute', attributeId: attrs.boite, attributeType: 'LISTE' },
        }
      : null,
    {
      id: 'year',
      type: 'range',
      label: 'Année',
      minParam: 'yearMin',
      maxParam: 'yearMax',
      api: attrs.annee_modele
        ? { kind: 'attribute', attributeId: attrs.annee_modele, attributeType: 'NOMBRE' }
        : null,
    },
    {
      id: 'mileage',
      type: 'range',
      label: 'Kilométrage (km)',
      minParam: 'kmMin',
      maxParam: 'kmMax',
      api: attrs.kilometrage
        ? { kind: 'attribute', attributeId: attrs.kilometrage, attributeType: 'NOMBRE' }
        : null,
    },
    attrs.documents
      ? {
          id: 'documents',
          type: 'tags',
          label: 'Documents',
          param: 'documents',
          selectionMode: 'multi',
          options: VEHICULE_DOCUMENTS_OPTIONS,
          api: { kind: 'attribute', attributeId: attrs.documents, attributeType: 'LISTE' },
        }
      : null,
  ];

  return fields.filter(Boolean);
}
