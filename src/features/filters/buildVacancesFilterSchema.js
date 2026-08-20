/**
 * Schéma de filtres Locations et vacances — aligné sur le new front
 * (buildVacancesFilterSchema.js).
 * Sous-catégories : Locations saisonnières (40), Agences (90), Visas (91).
 */
import { getLocationsVacancesSubcategoryConfig } from '../annonces/config/locationsVacancesSubcategories';
import { normalizeTaxoName } from '../annonces/utils/taxoHelpers';
import { flattenPossibleValues } from '../annonces/utils/maisonJardinTaxonomyHelpers';
import {
  getVacancesAttributeIds,
  VACANCES_SOUS_CATEGORIES,
} from './vacancesFilterAttributes';

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

/** Dates de séjour → payload racine disponibiliteDateArrivee / Depart (sous-cat 40). */
const STAY_DATES_FIELD = {
  id: 'stayDates',
  type: 'dateRange',
  label: 'Dates du séjour',
  hint: 'Biens libres sur la période (réservations confirmées exclues)',
  minParam: 'arrivee',
  maxParam: 'depart',
  payloadRoot: {
    min: 'disponibiliteDateArrivee',
    max: 'disponibiliteDateDepart',
  },
};

const OUI_NON_OPTIONS = ['Oui', 'Non'];

function getTaxoAttr(taxoAttributs = [], aliases = []) {
  return (taxoAttributs || []).find((attr) =>
    aliases.some((alias) => normalizeTaxoName(attr?.nom) === normalizeTaxoName(alias))
  );
}

function resolveOptions(taxoAttributs, aliases, fallback = []) {
  const hasTaxo = Boolean(taxoAttributs?.length);
  const attr = hasTaxo ? getTaxoAttr(taxoAttributs, aliases) : null;
  if (hasTaxo) {
    if (!attr) return [];
    return [...new Set(flattenPossibleValues(attr?.valeursPossibles || []).filter(Boolean))];
  }
  return fallback;
}

function toOptionObjects(values = []) {
  return values.map((value) => ({ value, label: value }));
}

function resolveAttrId(taxoAttributs, aliases, fallbackId = null) {
  const taxoAttr = getTaxoAttr(taxoAttributs, aliases);
  if (taxoAttr?.id != null) return Number(taxoAttr.id);
  return fallbackId != null ? Number(fallbackId) : null;
}

function buildListApi(attrId, taxoAttributs, aliases = [], fallbackType = 'LISTE') {
  if (!attrId) return null;
  const taxoAttr = getTaxoAttr(taxoAttributs, aliases);
  const attrType = String(taxoAttr?.type || fallbackType).toUpperCase();
  const api = {
    kind: 'attribute',
    attributeId: Number(attrId),
    attributeType: attrType,
  };
  if (taxoAttr?.nom) api.attributeNom = taxoAttr.nom;
  return api;
}

function hasResolvedOptions(taxoAttributs, options = []) {
  return Array.isArray(options) && options.length > 0;
}

function buildListField({
  id,
  label,
  param,
  options,
  api,
  fieldType = 'tags',
  selectionMode = 'multi',
  placeholder,
}) {
  if (!options.length || !api) return null;

  const base = { id, label, param, api, options };

  if (fieldType === 'select') {
    return {
      ...base,
      type: 'select',
      placeholder: placeholder || `Tout — ${label}`,
      options: toOptionObjects(options),
    };
  }

  if (fieldType === 'buttons') {
    return {
      ...base,
      type: 'buttons',
      options: toOptionObjects(options),
      selectionMode: selectionMode === 'multi' ? 'multi' : undefined,
    };
  }

  return {
    ...base,
    type: 'tags',
    selectionMode: selectionMode === 'multi' ? 'multi' : undefined,
  };
}

function buildFieldFromDepositConfig(field, taxoAttributs, attrs = {}, { multi = true, fieldType } = {}) {
  if (!field?.name) return null;

  const aliases = [field.name];
  const fallbackOptions = field.staticOptions || [];
  const options = resolveOptions(taxoAttributs, aliases, fallbackOptions);
  if (!hasResolvedOptions(taxoAttributs, options) && !fallbackOptions.length) return null;

  const attrId = resolveAttrId(taxoAttributs, aliases, attrs[field.name] ?? field.attrId);
  const api = buildListApi(attrId, taxoAttributs, aliases);
  if (!api) return null;

  const resolvedFieldType =
    fieldType || (multi ? 'tags' : field.control === 'select' ? 'select' : 'tags');

  return buildListField({
    id: field.name,
    label: field.label || field.name,
    param: field.name,
    options: options.length ? options : fallbackOptions,
    api,
    fieldType: resolvedFieldType,
    selectionMode: multi ? 'multi' : 'single',
    placeholder: field.label ? `Tout — ${field.label}` : undefined,
  });
}

function buildLocationsSaisonnieresSchema(taxoAttributs = []) {
  const attrs = getVacancesAttributeIds(VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES);
  const config = getLocationsVacancesSubcategoryConfig(VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES);
  const staticByName = Object.fromEntries(
    (config?.fields || []).map((field) => [field.name, field.staticOptions || []])
  );

  const typeResidenceOptions = resolveOptions(
    taxoAttributs,
    ['type_residence'],
    staticByName.type_residence || []
  );
  const natureOptions = resolveOptions(
    taxoAttributs,
    ['nature_logement'],
    staticByName.nature_logement || []
  );
  const typeLogementOptions = resolveOptions(
    taxoAttributs,
    ['type_logement'],
    staticByName.type_logement || []
  );
  const etoilesOptions = resolveOptions(
    taxoAttributs,
    ['nombre_etoiles'],
    staticByName.nombre_etoiles || []
  );
  const capaciteOptions = resolveOptions(taxoAttributs, ['capacite'], staticByName.capacite || []);
  const chambresOptions = resolveOptions(
    taxoAttributs,
    ['nombre_chambres'],
    staticByName.nombre_chambres || []
  );
  const horaireArriveeOptions = resolveOptions(
    taxoAttributs,
    ['horaire_arrivee'],
    staticByName.horaire_arrivee || []
  );
  const horaireDepartOptions = resolveOptions(
    taxoAttributs,
    ['horaire_depart'],
    staticByName.horaire_depart || []
  );
  const equipementsOptions = resolveOptions(
    taxoAttributs,
    ['equipements'],
    staticByName.equipements || []
  );
  const exterieurOptions = resolveOptions(taxoAttributs, ['exterieur'], staticByName.exterieur || []);
  const servicesOptions = resolveOptions(
    taxoAttributs,
    ['services_accessibilite'],
    staticByName.services_accessibilite || []
  );

  const fields = [
    PRICE_RANGE,
    STAY_DATES_FIELD,
    buildListField({
      id: 'type_residence',
      label: 'Type de résidence',
      param: 'type_residence',
      options: typeResidenceOptions,
      api: buildListApi(attrs.type_residence, taxoAttributs, ['type_residence']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'nature_logement',
      label: 'Nature du logement',
      param: 'nature_logement',
      options: natureOptions,
      api: buildListApi(attrs.nature_logement, taxoAttributs, ['nature_logement']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'type_logement',
      label: 'Type de logement',
      param: 'type_logement',
      options: typeLogementOptions,
      api: buildListApi(attrs.type_logement, taxoAttributs, ['type_logement']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'nombre_etoiles',
      label: "Nombre d'étoiles",
      param: 'nombre_etoiles',
      options: etoilesOptions,
      api: buildListApi(attrs.nombre_etoiles, taxoAttributs, ['nombre_etoiles']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'capacite',
      label: 'Capacité (voyageurs)',
      param: 'capacite',
      options: capaciteOptions,
      api: buildListApi(attrs.capacite, taxoAttributs, ['capacite']),
      fieldType: 'select',
      selectionMode: 'single',
      placeholder: 'Tous les voyageurs',
    }),
    buildListField({
      id: 'nombre_chambres',
      label: 'Nombre de chambres',
      param: 'nombre_chambres',
      options: chambresOptions,
      api: buildListApi(attrs.nombre_chambres, taxoAttributs, ['nombre_chambres']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'horaire_arrivee',
      label: "Horaire d'arrivée",
      param: 'horaire_arrivee',
      options: horaireArriveeOptions,
      api: buildListApi(attrs.horaire_arrivee, taxoAttributs, ['horaire_arrivee']),
      fieldType: 'select',
      selectionMode: 'single',
      placeholder: "Toutes les heures d'arrivée",
    }),
    buildListField({
      id: 'horaire_depart',
      label: 'Horaire de départ',
      param: 'horaire_depart',
      options: horaireDepartOptions,
      api: buildListApi(attrs.horaire_depart, taxoAttributs, ['horaire_depart']),
      fieldType: 'select',
      selectionMode: 'single',
      placeholder: 'Toutes les heures de départ',
    }),
    buildListField({
      id: 'equipements',
      label: 'Équipements',
      param: 'equipements',
      options: equipementsOptions,
      api: buildListApi(attrs.equipements, taxoAttributs, ['equipements']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'exterieur',
      label: 'Extérieur',
      param: 'exterieur',
      options: exterieurOptions,
      api: buildListApi(attrs.exterieur, taxoAttributs, ['exterieur']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'services_accessibilite',
      label: 'Services et accessibilité',
      param: 'services_accessibilite',
      options: servicesOptions,
      api: buildListApi(attrs.services_accessibilite, taxoAttributs, ['services_accessibilite']),
      fieldType: 'tags',
      selectionMode: 'multi',
    }),
    buildListField({
      id: 'location_avec_piscine',
      label: 'Location avec piscine',
      param: 'location_avec_piscine',
      options: OUI_NON_OPTIONS,
      api: buildListApi(attrs.location_avec_piscine, taxoAttributs, ['location_avec_piscine']),
      fieldType: 'buttons',
      selectionMode: 'single',
    }),
    buildListField({
      id: 'animaux_acceptes',
      label: 'Animaux acceptés',
      param: 'animaux_acceptes',
      options: OUI_NON_OPTIONS,
      api: buildListApi(attrs.animaux_acceptes, taxoAttributs, ['animaux_acceptes']),
      fieldType: 'buttons',
      selectionMode: 'single',
    }),
    buildListField({
      id: 'fumeurs_acceptes',
      label: 'Fumeurs acceptés',
      param: 'fumeurs_acceptes',
      options: OUI_NON_OPTIONS,
      api: buildListApi(attrs.fumeurs_acceptes, taxoAttributs, ['fumeurs_acceptes']),
      fieldType: 'buttons',
      selectionMode: 'single',
    }),
  ];

  return fields.filter(Boolean);
}

function buildSubcategorySchemaFromDeposit(sousCategorieId, taxoAttributs = []) {
  const config = getLocationsVacancesSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return [PRICE_RANGE];

  const attrs = getVacancesAttributeIds(sousCategorieId);
  const middle = config.fields
    .filter((field) => field.name !== 'wilaya')
    .map((field) => buildFieldFromDepositConfig(field, taxoAttributs, attrs))
    .filter(Boolean);

  return [PRICE_RANGE, ...middle];
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildVacancesFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id === VACANCES_SOUS_CATEGORIES.LOCATIONS_SAISONNIERES) {
    return buildLocationsSaisonnieresSchema(taxoAttributs);
  }
  if (id === VACANCES_SOUS_CATEGORIES.AGENCES || id === VACANCES_SOUS_CATEGORIES.VISAS) {
    return buildSubcategorySchemaFromDeposit(id, taxoAttributs);
  }

  return [PRICE_RANGE, STAY_DATES_FIELD];
}
