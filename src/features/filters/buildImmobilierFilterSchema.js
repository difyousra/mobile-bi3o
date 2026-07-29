/**
 * Construit le schéma de filtres immobilier selon la sous-catégorie.
 * Aligné sur le web : buildImmobilierFilterSchema.js
 */
import {
  getImmobilierAttributeIds,
  resolveImmobilierLinkageProfile,
  IMMOBILIER_SOUS_CATEGORIES,
  IMMOBILIER_PROPERTY_TYPES,
  IMMOBILIER_PROPERTY_TYPES_COLOCATION,
  IMMOBILIER_CARACTERISTIQUES,
  IMMOBILIER_NATURE_OPTIONS,
  IMMOBILIER_EXTERIEUR_OPTIONS,
  IMMOBILIER_EXPOSITION_OPTIONS,
  IMMOBILIER_ETAT_OPTIONS,
  IMMOBILIER_CLASSE_OPTIONS,
  IMMOBILIER_GES_OPTIONS,
  IMMOBILIER_CHAUFFAGE_OPTIONS,
  IMMOBILIER_BEDROOMS_OPTIONS,
  FURNISHED_OPTIONS,
  ROOM_OPTIONS,
} from './immobilierFilterAttributes';

/** Champ prix commun à tous les schémas immobilier. */
const PRICE_RANGE = {
  id: 'price',
  type: 'range',
  label: 'Fourchette de prix',
  minParam: 'priceMin',
  maxParam: 'priceMax',
  currency: 'Da',
  api: { kind: 'price' },
};

function pickFields(fields, ids) {
  return ids.map((id) => fields.find((f) => f?.id === id)).filter(Boolean);
}

function buildCommonImmobilierSchema(attrs, linkageProfile, propertyTypeOptions = IMMOBILIER_PROPERTY_TYPES) {
  return [
    {
      id: 'propertyType',
      type: 'buttons',
      label: 'Type de bien',
      param: 'propertyType',
      selectionMode: 'multi',
      options: propertyTypeOptions,
      api: attrs.type_bien
        ? { kind: 'attribute', attributeId: attrs.type_bien, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'nature',
      type: 'select',
      label: 'Nature du bien',
      param: 'nature',
      placeholder: 'Toutes les natures',
      options: IMMOBILIER_NATURE_OPTIONS.map((v) => ({ value: v, label: v })),
      linkageSection: 'nature',
      api: attrs.nature_bien
        ? { kind: 'attribute', attributeId: attrs.nature_bien, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'surfaceHabitable',
      type: 'range',
      label: 'Surface habitable (m²)',
      minParam: 'surfaceMin',
      maxParam: 'surfaceMax',
      linkageSection: 'surface_habitable',
      api: attrs.surface_habitable
        ? { kind: 'attribute', attributeId: attrs.surface_habitable, attributeType: 'NOMBRE' }
        : null,
    },
    {
      id: 'terrainSurface',
      type: 'range',
      label: 'Surface terrain (m²)',
      minParam: 'terrainMin',
      maxParam: 'terrainMax',
      linkageSection: 'terrain_surface',
      api: attrs.surface_totale_terrain
        ? { kind: 'attribute', attributeId: attrs.surface_totale_terrain, attributeType: 'NOMBRE' }
        : null,
    },
    {
      id: 'rooms',
      type: 'segmented',
      label: 'Pièces',
      param: 'rooms',
      selectionMode: 'multi',
      options: ROOM_OPTIONS,
      linkageSection: 'pieces',
      api: {
        kind: 'attribute',
        attributeId: attrs.nombre_pieces,
        attributeType: 'NOMBRE',
        valueMode: 'segmented-number',
      },
    },
    {
      id: 'bedrooms',
      type: 'segmented',
      label: 'Chambres',
      param: 'bedrooms',
      selectionMode: 'multi',
      options: ['Any', ...IMMOBILIER_BEDROOMS_OPTIONS],
      linkageSection: 'chambres',
      api: {
        kind: 'attribute',
        attributeId: attrs.nombre_chambres,
        attributeType: 'LISTE',
        valueMode: 'segmented-list',
      },
    },
    {
      id: 'amenities',
      type: 'tags',
      label: 'Caractéristiques',
      param: 'amenities',
      selectionMode: 'multi',
      options: IMMOBILIER_CARACTERISTIQUES,
      linkageSection: 'caracteristiques',
      api: attrs.caracteristique
        ? { kind: 'attribute', attributeId: attrs.caracteristique, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'outside',
      type: 'tags',
      label: 'Extérieur',
      param: 'outside',
      selectionMode: 'multi',
      options: IMMOBILIER_EXTERIEUR_OPTIONS,
      linkageSection: 'exterieur',
      api: attrs.exterieur
        ? { kind: 'attribute', attributeId: attrs.exterieur, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'exposure',
      type: 'tags',
      label: 'Exposition',
      param: 'exposure',
      selectionMode: 'multi',
      options: IMMOBILIER_EXPOSITION_OPTIONS,
      linkageSection: 'exposition',
      api: attrs.exposition
        ? { kind: 'attribute', attributeId: attrs.exposition, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'propertyState',
      type: 'tags',
      label: 'État du bien',
      param: 'propertyState',
      selectionMode: 'multi',
      options: IMMOBILIER_ETAT_OPTIONS,
      linkageSection: 'etat',
      api: attrs.etat_bien
        ? { kind: 'attribute', attributeId: attrs.etat_bien, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'parkingSpaces',
      type: 'range',
      label: 'Places de parking',
      minParam: 'parkingMin',
      maxParam: 'parkingMax',
      linkageSection: 'parking',
      api: attrs.places_parking
        ? { kind: 'attribute', attributeId: attrs.places_parking, attributeType: 'NOMBRE' }
        : null,
    },
    {
      id: 'availableFrom',
      type: 'dateRange',
      label: 'Disponible à partir',
      minParam: 'availableFromMin',
      maxParam: 'availableFromMax',
      linkageSection: 'disponible',
      api: attrs.disponible_a_partir
        ? { kind: 'attribute', attributeId: attrs.disponible_a_partir, attributeType: 'DATE' }
        : null,
    },
    {
      id: 'heatingMode',
      type: 'tags',
      label: 'Mode de chauffage',
      param: 'heatingMode',
      selectionMode: 'multi',
      options: IMMOBILIER_CHAUFFAGE_OPTIONS,
      linkageSection: 'chauffage',
      api: attrs.mode_chauffage
        ? { kind: 'attribute', attributeId: attrs.mode_chauffage, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'energyClass',
      type: 'tags',
      label: 'Classe énergie',
      param: 'energyClass',
      selectionMode: 'multi',
      options: IMMOBILIER_CLASSE_OPTIONS,
      linkageSection: 'classe',
      api: attrs.classe_energie
        ? { kind: 'attribute', attributeId: attrs.classe_energie, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'gesClass',
      type: 'tags',
      label: 'GES',
      param: 'gesClass',
      selectionMode: 'multi',
      options: IMMOBILIER_GES_OPTIONS,
      linkageSection: 'ges',
      api: attrs.ges
        ? { kind: 'attribute', attributeId: attrs.ges, attributeType: 'LISTE' }
        : null,
    },
    {
      id: 'charges',
      type: 'range',
      label: 'Charges',
      minParam: 'chargesMin',
      maxParam: 'chargesMax',
      currency: 'Da',
      linkageSection: 'charges',
      api: attrs.charges
        ? { kind: 'attribute', attributeId: attrs.charges, attributeType: 'NOMBRE' }
        : null,
    },
  ];
}

/**
 * Construit le schéma de filtres immobilier pour une sous-catégorie donnée.
 * Retourne un tableau de champs (field descriptors) à afficher dans le panneau de filtres.
 *
 * @param {number|string|null} sousCategorieId
 * @returns {Array}
 */
export function buildImmobilierFilterSchema(sousCategorieId = null) {
  const subId = Number(sousCategorieId);
  const attrs = getImmobilierAttributeIds(sousCategorieId);
  const linkageProfile = resolveImmobilierLinkageProfile(sousCategorieId);

  const common = buildCommonImmobilierSchema(attrs, linkageProfile);

  const furnished = {
    id: 'furnished',
    type: 'buttons',
    label: 'Meublé',
    param: 'furnished',
    options: FURNISHED_OPTIONS.map((v) => ({ value: v, label: v })),
    linkageSection: 'meuble',
    api: attrs.meuble
      ? { kind: 'attribute', attributeId: attrs.meuble, attributeType: 'LISTE' }
      : null,
  };

  const monthlyRent = {
    id: 'monthlyRent',
    type: 'range',
    label: 'Loyer mensuel',
    minParam: 'rentMonthMin',
    maxParam: 'rentMonthMax',
    currency: 'Da',
    linkageSection: 'loyer_mensuel',
    api: attrs.loyer_mensuel
      ? { kind: 'attribute', attributeId: attrs.loyer_mensuel, attributeType: 'NOMBRE' }
      : null,
  };

  const deposit = {
    id: 'deposit',
    type: 'range',
    label: 'Caution',
    minParam: 'depositMin',
    maxParam: 'depositMax',
    currency: 'Da',
    linkageSection: 'caution',
    api: attrs.caution
      ? { kind: 'attribute', attributeId: attrs.caution, attributeType: 'NOMBRE' }
      : null,
  };

  const annualRent = {
    id: 'annualRent',
    type: 'range',
    label: 'Loyer annuel',
    minParam: 'rentYearMin',
    maxParam: 'rentYearMax',
    currency: 'Da',
    linkageSection: 'loyer_annuel',
    api: attrs.loyer_annuel
      ? { kind: 'attribute', attributeId: attrs.loyer_annuel, attributeType: 'NOMBRE' }
      : null,
  };

  const saleType = {
    id: 'saleType',
    type: 'buttons',
    label: 'Type de vente',
    param: 'saleType',
    options: [{ value: 'Ancien', label: 'Ancien' }, { value: 'Viager', label: 'Viager' }],
    linkageSection: 'type_vente',
    api: attrs.type_vente
      ? { kind: 'attribute', attributeId: attrs.type_vente, attributeType: 'LISTE' }
      : null,
  };

  // Bureaux & commerces (44)
  if (subId === IMMOBILIER_SOUS_CATEGORIES.BUREAUX) {
    return [
      PRICE_RANGE,
      {
        id: 'transactionType',
        type: 'buttons',
        label: 'Type de transaction',
        param: 'transactionType',
        options: [{ value: 'vente', label: 'Vente' }, { value: 'location', label: 'Location' }],
        api: attrs.type_vente
          ? { kind: 'attribute', attributeId: attrs.type_vente, attributeType: 'LISTE' }
          : null,
      },
      ...pickFields(common, ['surfaceHabitable', 'outside', 'parkingSpaces', 'availableFrom', 'energyClass', 'gesClass', 'heatingMode']),
    ];
  }

  // Colocations (43)
  if (subId === IMMOBILIER_SOUS_CATEGORIES.COLOCATIONS) {
    const commonColoc = buildCommonImmobilierSchema(attrs, linkageProfile, IMMOBILIER_PROPERTY_TYPES_COLOCATION);
    return [
      PRICE_RANGE,
      ...pickFields(commonColoc, ['propertyType']),
      furnished,
      ...pickFields(commonColoc, ['surfaceHabitable', 'rooms', 'bedrooms', 'amenities', 'outside', 'parkingSpaces', 'availableFrom', 'heatingMode', 'energyClass', 'gesClass']),
      monthlyRent,
      deposit,
    ];
  }

  // Locations (42)
  if (subId === IMMOBILIER_SOUS_CATEGORIES.LOCATIONS) {
    return [
      PRICE_RANGE,
      ...pickFields(common, ['propertyType']),
      furnished,
      ...pickFields(common, ['nature', 'surfaceHabitable', 'terrainSurface', 'rooms', 'bedrooms', 'amenities', 'outside', 'parkingSpaces', 'exposure', 'availableFrom', 'charges', 'heatingMode', 'energyClass', 'gesClass']),
      monthlyRent,
      deposit,
      annualRent,
    ];
  }

  // Ventes (41) — default
  return [
    PRICE_RANGE,
    ...pickFields(common, ['propertyType']),
    saleType,
    ...pickFields(common, ['nature', 'surfaceHabitable', 'terrainSurface', 'rooms', 'bedrooms', 'amenities', 'outside', 'parkingSpaces', 'exposure', 'propertyState', 'availableFrom', 'heatingMode', 'energyClass', 'gesClass']),
  ];
}
