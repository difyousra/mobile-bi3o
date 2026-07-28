import { isFieldVisible, isMultiListeFieldName } from "./subcategoryFieldHelpers";

function isModeleLikeKey(key) {
  const normalized = String(key || "").toLowerCase();
  return normalized === "modele" || normalized.endsWith("_modele");
}

function resolveDynamicModeleRaw(attributs = {}, attrIdOverrides = {}, fieldName = "modele") {
  const direct = attributs[fieldName];
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
    return { raw: direct, key: fieldName };
  }

  const fromOverride = Object.entries(attrIdOverrides).find(
    ([key, attrId]) =>
      key !== fieldName &&
      isModeleLikeKey(key) &&
      attrId != null &&
      attrId !== "" &&
      attributs[key] !== undefined &&
      attributs[key] !== null &&
      String(attributs[key]).trim() !== ""
  );
  if (fromOverride) {
    return { raw: attributs[fromOverride[0]], key: fromOverride[0] };
  }

  const fromAttributs = Object.entries(attributs).find(
    ([key, value]) =>
      key !== fieldName &&
      isModeleLikeKey(key) &&
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );
  if (fromAttributs) {
    return { raw: fromAttributs[1], key: fromAttributs[0] };
  }

  return { raw: undefined, key: fieldName };
}

/**
 * Transforme l'état `attributs` (clé UI → valeur) en tableau `valeurs`
 * attendu par l'API annonces.
 *
 * Chaque entrée : { attributDefiniId, valueText | valueNumber | valueDate }
 */
export function buildValeursFromAttributs(
  attributs = {},
  config,
  attrIdOverrides = {},
  typeOverrides = {}
) {
  if (!config?.fields?.length) return [];

  const valeurs = [];

  config.fields.forEach((field) => {
    if (!isFieldVisible(field, attributs)) return;

    let resolvedAttrId = attrIdOverrides[field.name] ?? field.attrId;
    let raw = attributs[field.name];
    let valueKey = field.name;

    if (field.useDynamicAttrId || field.dependsOnBrand) {
      const dynamic = resolveDynamicModeleRaw(attributs, attrIdOverrides, field.name);
      if (dynamic.raw !== undefined) {
        raw = dynamic.raw;
        valueKey = dynamic.key;
      }
      resolvedAttrId = field.attrId ?? attrIdOverrides[field.name] ?? resolvedAttrId;
    } else if (
      (raw === undefined || raw === null || String(raw).trim() === "") &&
      field.useDynamicAttrId
    ) {
      const dynamicEntry = Object.entries(attrIdOverrides).find(
        ([key, attrId]) =>
          key !== field.name &&
          Number(attrId) === Number(resolvedAttrId) &&
          attributs[key] !== undefined &&
          attributs[key] !== null &&
          String(attributs[key]).trim() !== ""
      );
      if (dynamicEntry) {
        raw = attributs[dynamicEntry[0]];
        valueKey = dynamicEntry[0];
      }
    }

    if (resolvedAttrId == null || resolvedAttrId === "") return;
    if (raw === undefined || raw === null || String(raw).trim() === "") return;

    const entry = { attributDefiniId: Number(resolvedAttrId) };
    const formType =
      typeOverrides[valueKey] || typeOverrides[field.name] || field.type;

    if (formType === "NUMBER") {
      const num = Number(String(raw).replace(/\s/g, "").replace(",", "."));
      if (!Number.isFinite(num)) return;
      entry.valueNumber = num;
    } else if (formType === "DATE") {
      let valueDate = String(raw).trim();
      if (/^\d{4}-\d{2}$/.test(valueDate)) valueDate = `${valueDate}-01`;
      entry.valueDate = valueDate;
    } else {
      let valueText;
      if (Array.isArray(raw)) {
        valueText = raw
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(",");
      } else {
        valueText = String(raw);
        if (
          field.control === "multi-select" ||
          field.control === "multi-dropdown" ||
          field.multi === true ||
          field.multiSelect === true ||
          isMultiListeFieldName(field.name) ||
          isMultiListeFieldName(valueKey)
        ) {
          valueText = valueText
            .split(/,\s*/)
            .map((part) => part.trim())
            .filter(Boolean)
            .join(",");
        }
      }
      if (field.control === "date-month" && /^\d{4}-\d{2}$/.test(valueText.trim())) {
        valueText = `${valueText.trim()}-01`;
      }
      if (!valueText.trim()) return;
      entry.valueText = valueText;
    }

    valeurs.push(entry);
  });

  return valeurs;
}
