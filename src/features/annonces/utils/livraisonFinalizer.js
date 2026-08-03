import { isLivraisonDisponibleOui } from "./livraisonUtils";

export const LIVRAISON_PARTENAIRE_OPTIONS = [
  "Yassir",
  "EMS",
  "Algérie Poste",
  "Yalidine",
  "Autre",
];

/** Sites officiels des partenaires (tap logo → ouvrir). */
export const LIVRAISON_PARTNER_WEBSITES = {
  Yassir: "https://yassir.com/",
  EMS: "https://www.ems.dz/",
  "Algérie Poste": "https://www.poste.dz/",
  Yalidine: "https://yalidine.com/",
};

/** Chemins assets (miroir web public/images/livraison). */
export const LIVRAISON_PARTNER_LOGO_KEYS = [
  "Yassir",
  "EMS",
  "Algérie Poste",
  "Yalidine",
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

/** Partenaires + bureau depuis les valeurs API (détail annonce). */
export function resolveLivraisonFinalizerFromValeurs(valeurs = []) {
  let partenaires_de_livraison = [];
  let bureau_ou_point_relais = "";

  for (const valeur of valeurs) {
    const key = taxoNomToLivraisonFinalizerKey(valeur?.attributNom);
    if (!key) continue;
    const text =
      valeur?.valueText != null && String(valeur.valueText).trim() !== ""
        ? String(valeur.valueText).trim()
        : "";
    if (key === "partenaires_de_livraison" && text) {
      partenaires_de_livraison = normalizeLivraisonPartners(text);
    }
    if (key === "bureau_ou_point_relais" && text) {
      bureau_ou_point_relais = text;
    }
  }

  return { partenaires_de_livraison, bureau_ou_point_relais };
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
