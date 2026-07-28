import { isLivraisonDisponibleOui } from "./livraisonUtils";

export const LIVRAISON_PARTENAIRE_OPTIONS = [
  "Yassir",
  "EMS",
  "Algérie Poste",
  "Yalidine",
  "Autre",
];

export const LIVRAISON_FINALIZER_ATTR_KEYS = [
  "partenaires_de_livraison",
  "bureau_ou_point_relais",
];

function normalizeTaxoKey(nom) {
  return String(nom ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

export function taxoNomToLivraisonFinalizerKey(nom) {
  const key = normalizeTaxoKey(nom);
  if (!key) return null;
  if (key.includes("partenaires") && key.includes("livraison")) {
    return "partenaires_de_livraison";
  }
  if (key.includes("bureau") && (key.includes("relais") || key.includes("point"))) {
    return "bureau_ou_point_relais";
  }
  return null;
}

export function normalizeLivraisonPartners(raw) {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const text = String(raw ?? "").trim();
  if (!text) return [];
  return text
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function applyLivraisonFinalizerAttrIdsFromTaxo(taxoRows = []) {
  const attributeAttrIds = {};
  const attributeTypes = {};
  if (!Array.isArray(taxoRows)) return { attributeAttrIds, attributeTypes };

  taxoRows.forEach((row) => {
    const formKey = taxoNomToLivraisonFinalizerKey(row?.nom);
    if (!formKey || row?.id == null) return;
    attributeAttrIds[formKey] = Number(row.id);
    attributeTypes[formKey] = "TEXT";
  });

  return { attributeAttrIds, attributeTypes };
}

function rawToValueText(raw, key) {
  if (key === "partenaires_de_livraison") {
    const parts = normalizeLivraisonPartners(raw);
    return parts.length ? parts.join(",") : "";
  }
  return String(raw ?? "").trim();
}

export function appendLivraisonFinalizerValeurs(
  valeurs,
  attributs,
  attributeAttrIds = {},
  attributeTypes = {}
) {
  if (!isLivraisonDisponibleOui(attributs)) return valeurs;

  const existing = new Set((valeurs || []).map((entry) => Number(entry.attributDefiniId)));
  const next = [...(valeurs || [])];

  for (const key of LIVRAISON_FINALIZER_ATTR_KEYS) {
    const attrId = attributeAttrIds?.[key];
    if (attrId == null || attrId === "") continue;
    const numericId = Number(attrId);
    if (existing.has(numericId)) continue;

    const raw = attributs?.[key];
    const valueText = rawToValueText(raw, key);
    if (!valueText) continue;

    if (attributeTypes?.[key] === "NUMBER") {
      const num = Number(String(raw).replace(/\s/g, "").replace(",", "."));
      if (!Number.isFinite(num)) continue;
      next.push({ attributDefiniId: numericId, valueNumber: num });
      existing.add(numericId);
      continue;
    }

    next.push({ attributDefiniId: numericId, valueText });
    existing.add(numericId);
  }

  return next;
}
