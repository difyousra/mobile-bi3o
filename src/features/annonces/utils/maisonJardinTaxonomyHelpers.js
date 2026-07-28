import { isTaxoAttributeObligatoire, normalizeTaxoName } from "./taxoHelpers";
import { isMultiListeFieldName } from "./subcategoryFieldHelpers";

export function sanitizeTaxoKey(name, fallbackId) {
  const base = normalizeTaxoName(name);
  return base || `attribut_${fallbackId}`;
}

export function flattenPossibleValues(values) {
  if (!Array.isArray(values)) return [];
  return values
    .flatMap((item) => String(item ?? "").split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

export function mapApiTypeToForm(typeUpper) {
  const upper = String(typeUpper || "TEXTE").toUpperCase();
  if (upper.includes("NOMBRE") || upper === "NUMBER") return "NUMBER";
  if (upper.includes("DATE")) return "DATE";
  return "TEXT";
}

export function isTypedProductKey(key) {
  const normalized = String(key || "").toLowerCase();
  return (
    (normalized.endsWith("_produit") || normalized.startsWith("produit_")) &&
    normalized !== "produit"
  );
}

const PRODUCT_STOP_WORDS = new Set([
  "et",
  "a",
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "un",
  "une",
  "d",
  "l",
  "l'",
]);

function productStem(candidateKey) {
  let candidate = String(candidateKey || "").toLowerCase();
  candidate = candidate.startsWith("produit_")
    ? candidate.slice("produit_".length)
    : candidate;
  candidate = candidate.endsWith("_produit")
    ? candidate.slice(0, -"_produit".length)
    : candidate;
  return candidate;
}

function primaryKeyVariants(normalized) {
  const primaryTokens = String(normalized || "")
    .split("_")
    .map((token) => String(token || "").trim())
    .filter(Boolean)
    .filter((token) => !PRODUCT_STOP_WORDS.has(token));
  const primaryToken = primaryTokens[0] || normalized;
  const withoutStop = primaryTokens.join("_");

  return {
    primaryTokens,
    primaryToken,
    withoutStop,
    variants: Array.from(
      new Set(
        [
          normalized,
          withoutStop,
          normalized.replaceAll("_et_", "_e_").replaceAll("_et_", "_"),
          normalized.split("_et_")[0] || normalized,
          normalized.split("_a_")[0] || normalized,
          primaryToken,
        ].filter(Boolean)
      )
    ),
  };
}

function scoreProductCandidate(primaryVariants, primaryTokens, primaryToken, candidateKey) {
  const candidate = productStem(candidateKey);
  const candidateVariants = Array.from(
    new Set([candidate, candidate.replaceAll("_et_", "_e_")])
  );
  const exactMatch = primaryVariants.some((value) =>
    candidateVariants.includes(value)
  );
  const includeMatch = primaryVariants.some((value) =>
    candidateVariants.some((variant) => value.includes(variant) || variant.includes(value))
  );
  const startsMatch = primaryVariants.some((value) =>
    candidateVariants.some(
      (variant) => variant.startsWith(value) || value.startsWith(variant)
    )
  );

  let score = 0;
  if (exactMatch) score = 100;
  else if (startsMatch) score = 70;
  else if (includeMatch) score = 45;

  for (const token of [primaryToken, ...(primaryTokens.slice(0, 3) || [])]) {
    if (token && candidate.includes(token)) score = Math.max(score, 55);
  }

  return { score, candidateLen: candidate.length };
}

function pickBestTypedProductKey(attrsByKey, normalized, minScore = 45) {
  const typedProductKeys = Object.keys(attrsByKey || {}).filter((key) =>
    isTypedProductKey(key)
  );
  if (typedProductKeys.length === 0) return null;

  const { primaryTokens, primaryToken, variants } = primaryKeyVariants(normalized);
  let bestKey = null;
  let bestScore = 0;
  let bestLen = 0;

  for (const candidateKey of typedProductKeys) {
    const { score, candidateLen } = scoreProductCandidate(
      variants,
      primaryTokens,
      primaryToken,
      candidateKey
    );
    if (score > bestScore || (score === bestScore && score > 0 && candidateLen > bestLen)) {
      bestScore = score;
      bestLen = candidateLen;
      bestKey = candidateKey;
    }
  }

  return bestScore >= minScore ? bestKey : null;
}

export function resolveLinkedProductKey(mode, primaryValue, attrsByKey) {
  if (!primaryValue || !attrsByKey) return null;
  const raw = String(primaryValue).trim();
  const normalized = sanitizeTaxoKey(raw, "primary");

  if (mode === "ameublement_type_map") {
    return pickBestTypedProductKey(attrsByKey, normalized, 45);
  }

  if (mode === "prefix_from_primary") {
    const { withoutStop } = primaryKeyVariants(normalized);
    const keysToTry = [
      `produit_${normalized}`,
      `${normalized}_produit`,
      withoutStop && withoutStop !== normalized ? `produit_${withoutStop}` : null,
      withoutStop && withoutStop !== normalized ? `${withoutStop}_produit` : null,
      `produit_${raw}`,
      `${raw}_produit`,
    ].filter(Boolean);
    for (const key of keysToTry) {
      if (attrsByKey[key]) return key;
    }
    return pickBestTypedProductKey(attrsByKey, normalized, 55);
  }

  return null;
}

function sortAttrIndex(key, primaryKey) {
  const normalized = String(key || "").toLowerCase();
  if (primaryKey && normalized === String(primaryKey).toLowerCase()) return 0;
  const order = [
    "produit",
    "livraison",
    "piece",
    "marque",
    "matiere",
    "couleur",
    "style",
    "etat",
    "poids",
  ];
  const index = order.indexOf(normalized);
  if (index >= 0) return 10 + index;
  return 100;
}

export function normalizeMaisonJardinAttributes(sourceAttrs = []) {
  return (sourceAttrs || [])
    .map((attr) => ({
      id: attr?.id,
      name: String(attr?.nom || "").trim(),
      key: sanitizeTaxoKey(attr?.nom, attr?.id),
      type: String(attr?.type || "TEXTE").toUpperCase(),
      required: isTaxoAttributeObligatoire(attr),
      values: flattenPossibleValues(attr?.valeursPossibles),
    }))
    .filter((attr) => String(attr.key || "").toLowerCase() !== "contact");
}

export function buildMaisonJardinFieldPlan({
  normalizedAttributes,
  primaryKey = null,
  linkedProductMode = "none",
  attributs = {},
}) {
  const attrsByKey = {};
  normalizedAttributes.forEach((attr) => {
    if (attr.key) attrsByKey[attr.key] = attr;
  });

  const primaryAttr = primaryKey
    ? normalizedAttributes.find((attr) => attr.key === String(primaryKey).toLowerCase()) ||
      null
    : null;

  const activeLinkedProductKey = resolveLinkedProductKey(
    linkedProductMode,
    primaryAttr ? attributs?.[primaryAttr.key] : null,
    attrsByKey
  );
  const activeLinkedProductAttr = activeLinkedProductKey
    ? attrsByKey[activeLinkedProductKey]
    : null;

  const visibleAttributes = normalizedAttributes
    .filter((attr) => {
      if (primaryAttr && attr.key === primaryAttr.key) return false;
      if (linkedProductMode !== "none" && isTypedProductKey(attr.key)) return false;
      if (linkedProductMode !== "none" && attr.key === "produit") return false;
      return true;
    })
    .sort((a, b) => {
      const delta =
        sortAttrIndex(a.key, primaryAttr?.key) - sortAttrIndex(b.key, primaryAttr?.key);
      if (delta !== 0) return delta;
      return String(a.name || "").localeCompare(String(b.name || ""), "fr");
    });

  const validationFields = [];
  if (primaryAttr) validationFields.push(primaryAttr);
  if (activeLinkedProductAttr) validationFields.push(activeLinkedProductAttr);
  validationFields.push(...visibleAttributes);

  return {
    attrsByKey,
    primaryAttr,
    activeLinkedProductKey,
    activeLinkedProductAttr,
    visibleAttributes,
    validationFields,
    hasTypedProductAttrs: normalizedAttributes.some((attr) => isTypedProductKey(attr.key)),
  };
}

export function shouldUseMaisonJardinChips(attr, { isPrimary = false } = {}) {
  const count = Array.isArray(attr?.values) ? attr.values.length : 0;
  if (count < 2 || count > 8) return false;
  const key = String(attr?.key || "").toLowerCase();
  if (isPrimary) return true;
  if (["etat", "piece", "taille", "univers", "type"].includes(key)) return true;
  return count <= 6;
}

export function resolveOuiNonPair(values = []) {
  const normalized = (values || []).map((value) => ({
    raw: String(value),
    key: normalizeTaxoName(value),
  }));
  const oui = normalized.find((entry) => ["oui", "yes", "true"].includes(entry.key));
  const non = normalized.find((entry) => ["non", "no", "false"].includes(entry.key));
  if (!oui || !non) return null;
  return { oui: oui.raw, non: non.raw };
}

export function validateMaisonJardinAttributs(attributs = {}, validationFields = []) {
  const missing = validationFields.find((attr) => {
    if (!attr?.required) return false;
    const raw = attributs?.[attr.key];
    if (Array.isArray(raw)) return raw.length === 0;
    return raw === undefined || raw === null || String(raw).trim() === "";
  });
  return missing ? missing.name || missing.label || missing.key : null;
}

export function buildValeursFromTaxonomyDynamic(
  attributs = {},
  attributeAttrIds = {},
  attributeTypes = {}
) {
  const valeurs = [];

  Object.entries(attributeAttrIds || {}).forEach(([key, attrId]) => {
    if (attrId == null || attrId === "") return;
    const raw = attributs[key];
    if (raw === undefined || raw === null || String(raw).trim() === "") return;

    const entry = { attributDefiniId: Number(attrId) };
    const formType = attributeTypes[key];

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
      } else if (isMultiListeFieldName(key)) {
        valueText = String(raw)
          .split(/,\s*/)
          .map((part) => part.trim())
          .filter(Boolean)
          .join(",");
      } else {
        valueText = String(raw);
      }
      if (!valueText.trim()) return;
      entry.valueText = valueText;
    }

    valeurs.push(entry);
  });

  return valeurs;
}
