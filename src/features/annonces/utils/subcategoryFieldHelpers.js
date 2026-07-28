import {
  normalizeTaxoName,
  resolveTaxoAttributeForField,
  isTaxoAttributeObligatoire,
} from "./taxoHelpers";

export function isTruthyLike(value) {
  const normalized = normalizeTaxoName(value);
  if (!normalized) return false;
  return ["oui", "yes", "true", "actif", "active", "checked", "on", "1"].includes(
    normalized
  );
}

const MULTI_LISTE_FIELD_KEYS = new Set([
  "caracteristiques",
  "caracteristique",
  "exterieur",
  "exterieurs",
  "pieces_annexes",
  "piece_annexe",
  "equipements",
  "services_accessibilite",
  "services_proposes",
  "destinations_principales",
  "documents_requis",
  "type_service",
  "partenaires_de_livraison",
  "service_propose",
  "occasion",
  "historique_entretien",
]);

export function isMultiListeFieldName(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!key) return false;
  if (MULTI_LISTE_FIELD_KEYS.has(key)) return true;
  if (key.startsWith("caracteristique")) return true;
  if (key.startsWith("exterieur")) return true;
  if (key.includes("piece") && key.includes("annexe")) return true;
  return false;
}

export function resolveFieldControl(field) {
  const control = field?.control || "text";
  if (control === "multi-select" || control === "multi-dropdown") return control;
  if (field?.multi === true || field?.multiSelect === true) return "multi-dropdown";
  if (
    (control === "combobox" || control === "select") &&
    (isMultiListeFieldName(field?.name) ||
      isMultiListeFieldName(field?.taxoKey) ||
      (field?.taxoAliases || []).some(isMultiListeFieldName))
  ) {
    return "multi-dropdown";
  }
  return control;
}

export function isSubcategoryContactField(field) {
  const candidates = [field?.name, field?.key, field?.taxoKey, field?.label];
  return candidates.some(
    (value) => String(value || "").toLowerCase().trim() === "contact"
  );
}

export function resolveVariantField(field, attributs = {}) {
  if (!field?.variantByValue || !field?.dependsOnField) return field;
  const parentValue = String(attributs[field.dependsOnField] || "").trim();
  const variant =
    field.variantByValue[parentValue] ||
    Object.entries(field.variantByValue).find(
      ([key]) => normalizeTaxoName(key) === normalizeTaxoName(parentValue)
    )?.[1];
  if (!variant)
    return field.hideUntilDependency ? { ...field, hidden: true } : field;
  return {
    ...field,
    ...variant,
    taxoAliases: [...(field.taxoAliases || []), ...(variant.taxoAliases || [])],
  };
}

function matchesWhenRule(rule, attributs = {}) {
  if (!rule) return false;
  const currentValue = attributs[rule.field];
  if (rule.truthy) return isTruthyLike(currentValue);
  if (Array.isArray(rule.values)) {
    const normalizedCurrent = normalizeTaxoName(currentValue);
    return rule.values.some(
      (value) => normalizeTaxoName(value) === normalizedCurrent
    );
  }
  return false;
}

export function isFieldVisible(field, attributs = {}) {
  if (isSubcategoryContactField(field)) return false;
  const resolved = resolveVariantField(field, attributs);
  if (resolved?.hidden || resolved?.hide) return false;
  if (matchesWhenRule(resolved?.hideWhen, attributs)) return false;
  if (!resolved?.showWhen) return true;
  return matchesWhenRule(resolved.showWhen, attributs);
}

function matchesRequiredWhen(field, attributs = {}) {
  if (!field?.requiredWhen) return false;
  return matchesWhenRule(field.requiredWhen, attributs);
}

export function isFieldRequired(field, attributs = {}) {
  const resolved = resolveVariantField(field, attributs);
  if (!isFieldVisible(field, attributs)) return false;
  if (matchesRequiredWhen(resolved, attributs)) return true;
  return Boolean(resolved?.required);
}

export function isFieldRequiredWithTaxonomy(
  field,
  attributs = {},
  taxoAttributs = []
) {
  if (!isFieldVisible(field, attributs)) return false;
  const activeField = resolveVariantField(field, attributs);
  if (matchesRequiredWhen(activeField, attributs)) return true;
  const row = resolveTaxoAttributeForField(taxoAttributs, activeField);
  return isTaxoAttributeObligatoire(row);
}
