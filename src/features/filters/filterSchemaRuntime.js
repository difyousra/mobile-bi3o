/**
 * Visibilité runtime des champs de filtre (showWhen / dependsOn / linkage).
 * Aligné sur le new front : filterSchemaRuntime.js
 */
import { isTruthyLike } from '../annonces/utils/subcategoryFieldHelpers';
import { normalizeTaxoName } from '../annonces/utils/taxoHelpers';
import { isImmobilierSectionVisible } from './immobilierFilterAttributes';
import { isMaisonJardinLinkedProductVisible } from './buildMaisonJardinFilterSchema';

function toArray(value) {
  if (Array.isArray(value)) return value.filter((item) => item != null && item !== '');
  if (value == null || value === '') return [];
  return [value];
}

function matchesWhenRule(rule, values = {}) {
  if (!rule) return false;
  const currentValue = values[rule.field];
  if (rule.truthy) return isTruthyLike(currentValue);
  if (Array.isArray(rule.values)) {
    const currentValues = toArray(currentValue).map((item) => normalizeTaxoName(item));
    return rule.values.some((value) => currentValues.includes(normalizeTaxoName(value)));
  }
  return false;
}

export function isFilterFieldVisible(field, values = {}, options = {}) {
  if (!field) return false;

  if (field.linkageSection && options.linkageProfile) {
    const sourceField = options.linkageSourceField || 'propertyType';
    const selectedTypes = toArray(values[sourceField]);
    if (!isImmobilierSectionVisible(options.linkageProfile, field.linkageSection, selectedTypes)) {
      return false;
    }
  }

  if (field?.linkage?.maisonJardinLinkedProduct) {
    return isMaisonJardinLinkedProductVisible(field, values);
  }

  if (field.hideWhen && matchesWhenRule(field.hideWhen, values)) return false;
  if (field.showWhen && !matchesWhenRule(field.showWhen, values)) return false;

  if (!field.dependsOn) return true;

  const { fieldId, includes, equals, notEmpty } = field.dependsOn;
  const currentValue = values[fieldId];
  const currentValues = toArray(currentValue).map((item) => String(item));

  if (includes != null) return currentValues.includes(String(includes));
  if (equals != null) return String(currentValue || '') === String(equals);
  if (notEmpty) return currentValues.length > 0;

  return true;
}
