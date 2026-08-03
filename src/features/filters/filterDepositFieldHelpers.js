/**
 * Helpers pour dériver un schéma de filtres depuis la config dépôt (sous-catégorie).
 * Aligné sur le new front : filterDepositFieldHelpers.js
 */
import { flattenPossibleValues } from '../annonces/utils/maisonJardinTaxonomyHelpers';
import { normalizeTaxoName } from '../annonces/utils/taxoHelpers';
import { isContactFilterKey } from './excludeContactFromFilters';

const FILTER_SKIP_CONTROLS = new Set([
  'number',
  'clearable-number',
  'text',
  'textarea',
  'url',
  'date',
  'date-month',
  'boolean-checkbox',
  'hidden',
]);

const GLOBAL_SKIP_FIELD_NAMES = new Set(['contact']);

function isEtatFilterField(field) {
  const name = normalizeTaxoName(field?.name || field?.taxoKey || '');
  return (
    name === 'etat' ||
    name === 'condition' ||
    name.includes('etat_du_bien') ||
    name.includes('etat_bien') ||
    name === 'etat_du_bien' ||
    name === 'etat_bien'
  );
}

function getTaxoAttr(taxoAttributs = [], aliases = []) {
  return (taxoAttributs || []).find((attr) =>
    aliases.some((alias) => normalizeTaxoName(attr?.nom) === normalizeTaxoName(alias))
  );
}

function resolveOptions(taxoAttributs, aliases, fallback = [], preferStatic = false) {
  if (preferStatic && fallback.length) {
    return [...new Set(fallback.filter(Boolean))];
  }

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

function buildListField({
  id,
  label,
  param,
  options,
  api,
  fieldType = 'select',
  selectionMode = 'single',
  placeholder,
  showWhen,
  hideWhen,
  clearsOnChange,
  dependsOn,
}) {
  if (!options.length || !api) return null;

  const base = {
    id,
    label,
    param,
    api,
    options,
    ...(showWhen ? { showWhen } : {}),
    ...(hideWhen ? { hideWhen } : {}),
    ...(clearsOnChange?.length ? { clearsOnChange } : {}),
    ...(dependsOn ? { dependsOn } : {}),
  };

  if (fieldType === 'tags') {
    return {
      ...base,
      type: 'tags',
      selectionMode: selectionMode === 'multi' ? 'multi' : undefined,
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

  if (fieldType === 'segmented') {
    return {
      ...base,
      type: 'segmented',
      options,
      selectionMode: selectionMode === 'multi' ? 'multi' : undefined,
    };
  }

  return {
    ...base,
    type: 'select',
    placeholder: placeholder || `Tout — ${label}`,
    options: toOptionObjects(options),
    ...(selectionMode === 'multi' ? { selectionMode: 'multi' } : {}),
  };
}

function buildClearsOnChangeMap(fields = []) {
  const map = {};

  fields.forEach((field) => {
    if (field.dependsOnField && field.name) {
      const parent = field.dependsOnField;
      if (!map[parent]) map[parent] = [];
      if (!map[parent].includes(field.name)) map[parent].push(field.name);
    }
    if (field.clearsFields?.length) {
      if (!map[field.name]) map[field.name] = [];
      field.clearsFields.forEach((child) => {
        if (!map[field.name].includes(child)) map[field.name].push(child);
      });
    }
  });

  return map;
}

function mergeClearsOnChange(base = [], extra = []) {
  return [...new Set([...(base || []), ...(extra || [])])];
}

export function buildFieldFromDepositConfig(
  field,
  taxoAttributs,
  attrs = {},
  depositConfig = null,
  { multi = false, fieldType, staticFallbacks = {}, clearsOnChangeMap = {} } = {}
) {
  if (!field?.name || FILTER_SKIP_CONTROLS.has(field.control)) {
    return null;
  }
  if (
    GLOBAL_SKIP_FIELD_NAMES.has(field.name) ||
    isContactFilterKey(field.name) ||
    isContactFilterKey(field.taxoKey)
  ) {
    return null;
  }

  const aliases = [field.name, field.taxoKey, ...(field.taxoAliases || [])].filter(Boolean);
  const fallbackOptions = field.staticOptions || staticFallbacks[field.name] || [];
  const preferStatic = Boolean(field.preferStaticOptions && fallbackOptions.length);
  const options = resolveOptions(taxoAttributs, aliases, fallbackOptions, preferStatic);
  if (!options.length && !fallbackOptions.length) return null;

  const attrId = resolveAttrId(taxoAttributs, aliases, attrs[field.name] ?? field.attrId);
  const api = buildListApi(attrId, taxoAttributs, aliases);
  if (!api) return null;

  const isEtat = isEtatFilterField(field);
  const isSwitch = field.control === 'switch';
  const resolvedFieldType =
    fieldType ||
    (isEtat
      ? 'tags'
      : isSwitch
        ? 'buttons'
        : field.control === 'multi-select' ||
            field.control === 'tags' ||
            field.control === 'multi-dropdown'
          ? 'tags'
          : 'select');
  const resolvedMulti = isEtat ? true : multi;

  const clearsOnChange = mergeClearsOnChange(
    depositConfig?.clearAttributsOnChange?.[field.name],
    clearsOnChangeMap[field.name]
  );

  const built = buildListField({
    id: field.name,
    label: field.label || field.name,
    param: field.name,
    options: options.length ? options : fallbackOptions,
    api,
    fieldType: resolvedFieldType,
    selectionMode: resolvedMulti ? 'multi' : 'single',
    placeholder: field.label ? `Tout — ${field.label}` : undefined,
    showWhen: field.showWhen,
    hideWhen: field.hideWhen,
    clearsOnChange: clearsOnChange.length ? clearsOnChange : undefined,
    dependsOn:
      field.dependsOnField && !field.variantByValue
        ? { fieldId: field.dependsOnField, notEmpty: true }
        : undefined,
  });

  if (!built || !isEtat) return built;
  return { ...built, forceInline: true };
}

function buildVariantFilterFields(
  field,
  taxoAttributs,
  attrs,
  depositConfig,
  { clearsOnChangeMap = {}, staticFallbacks = {} } = {}
) {
  if (!field?.variantByValue || !field.dependsOnField) return [];

  return Object.entries(field.variantByValue)
    .filter(([, variant]) => !variant?.hidden)
    .map(([variantValue, variant]) => {
      const virtualField = {
        name: field.name,
        label: field.label || field.name,
        taxoAliases: [...(field.taxoAliases || []), ...(variant.taxoAliases || [])],
        attrId: variant.attrId ?? field.attrId,
        control: 'select',
        staticOptions: variant.staticOptions || field.staticOptions,
        preferStaticOptions: variant.preferStaticOptions ?? field.preferStaticOptions,
      };

      const built = buildFieldFromDepositConfig(virtualField, taxoAttributs, attrs, depositConfig, {
        staticFallbacks,
        clearsOnChangeMap,
      });
      if (!built) return null;

      const variantKey = normalizeTaxoName(variantValue) || String(variantValue);

      return {
        ...built,
        // id unique pour React / clé, param partagé pour la valeur filtre
        id: `${field.name}__${variantKey}`,
        param: field.name,
        showWhen: { field: field.dependsOnField, values: [variantValue] },
        dependsOn: field.hideUntilDependency
          ? { fieldId: field.dependsOnField, notEmpty: true }
          : built.dependsOn,
      };
    })
    .filter(Boolean);
}

/**
 * Construit le schéma de filtres à partir de la config dépôt d'une sous-catégorie.
 */
export function buildSubcategoryFilterSchemaFromDeposit({
  sousCategorieId,
  taxoAttributs = [],
  getSubcategoryConfig,
  getAttributeIds,
  skipFieldNames = [],
  trailingFields = [],
  staticFallbacks = {},
}) {
  const config = getSubcategoryConfig(sousCategorieId);
  if (!config?.fields?.length) return trailingFields;

  const skip = new Set([...GLOBAL_SKIP_FIELD_NAMES, ...skipFieldNames]);
  const attrs = typeof getAttributeIds === 'function' ? getAttributeIds(sousCategorieId) : {};
  const clearsOnChangeMap = buildClearsOnChangeMap(config.fields);
  const middle = [];

  config.fields.forEach((field) => {
    if (skip.has(field.name) || isContactFilterKey(field.name)) return;

    if (field.variantByValue) {
      middle.push(
        ...buildVariantFilterFields(field, taxoAttributs, attrs, config, {
          clearsOnChangeMap,
          staticFallbacks,
        })
      );
      return;
    }

    const multi = field.control === 'multi-select' || field.control === 'tags' || field.control === 'multi-dropdown';
    const built = buildFieldFromDepositConfig(field, taxoAttributs, attrs, config, {
      multi,
      staticFallbacks,
      clearsOnChangeMap,
    });
    if (built) middle.push(built);
  });

  return [...middle.filter(Boolean), ...trailingFields];
}
