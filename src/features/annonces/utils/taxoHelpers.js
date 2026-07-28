/** Normalise un nom d'attribut taxonomie en clé stable. */
export function normalizeTaxoName(nom) {
  if (nom == null || nom === "") return "";
  return String(nom)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''\u2019`\u00B4]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function toUniqueOptions(values = []) {
  return [
    ...new Set(
      (values || []).map((value) => String(value).trim()).filter(Boolean)
    ),
  ];
}

export function getValeursByNom(taxoAttributs, nom) {
  if (!Array.isArray(taxoAttributs) || !nom) return [];
  const target = normalizeTaxoName(nom);
  const row = taxoAttributs.find(
    (attr) => normalizeTaxoName(attr?.nom) === target
  );
  const values = row?.valeursPossibles;
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value).trim()).filter(Boolean);
}

export function getValeursById(taxoAttributs, attrId) {
  if (!Array.isArray(taxoAttributs) || attrId == null) return [];
  const row = taxoAttributs.find(
    (attr) => Number(attr?.id) === Number(attrId)
  );
  const values = row?.valeursPossibles;
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value).trim()).filter(Boolean);
}

export function getTaxoAttrByNom(taxoAttributs, nom) {
  if (!Array.isArray(taxoAttributs) || !nom) return null;
  const target = normalizeTaxoName(nom);
  return (
    taxoAttributs.find((attr) => normalizeTaxoName(attr?.nom) === target) ||
    null
  );
}

export function getTaxoAttrIdByNom(taxoAttributs, nom, fallback = null) {
  const row = getTaxoAttrByNom(taxoAttributs, nom);
  if (row?.id != null) return Number(row.id);
  return fallback;
}

/** Clé du champ modèle dépendant de la marque (ex. "MERCEDES-BENZ" → "mercedes_benz_modele"). */
export function marqueToModeleFormKey(marque) {
  const slug = normalizeTaxoName(marque);
  return slug ? `${slug}_modele` : "modele";
}

export function getDynamicModeleField(taxoAttributs, marque, fallbackAttrId = null) {
  const fieldKey = marqueToModeleFormKey(marque);
  const row = getTaxoAttrByNom(taxoAttributs, fieldKey);
  return {
    fieldKey: row?.id != null ? fieldKey : "modele",
    attrId: row?.id != null ? Number(row.id) : fallbackAttrId,
    options:
      row?.id != null
        ? getValeursById(taxoAttributs, row.id)
        : getValeursByNom(taxoAttributs, "modele"),
  };
}

export function getModelesForMarque(referentiel, marque) {
  if (!referentiel || !marque) return [];
  if (Array.isArray(referentiel[marque])) return referentiel[marque];

  const target = normalizeTaxoName(marque);
  const entry = Object.entries(referentiel).find(
    ([key]) => normalizeTaxoName(key) === target
  );
  const list = entry?.[1];
  return Array.isArray(list)
    ? list.map((value) => String(value)).filter(Boolean)
    : [];
}

export function getMarquesList(referentiel) {
  if (!referentiel || typeof referentiel !== "object") return [];
  return Object.keys(referentiel).sort((a, b) => a.localeCompare(b, "fr"));
}

export function getFieldTaxoCandidates(field) {
  const candidates = [];
  const push = (value) => {
    const key = String(value || "").trim();
    if (key && !candidates.includes(key)) candidates.push(key);
  };
  push(field?.taxoKey);
  const aliasesFirst = Boolean(field?.preferTaxoAliases || field?.variantByValue);
  if (aliasesFirst) {
    (field?.taxoAliases || []).forEach(push);
    push(field?.name);
  } else {
    push(field?.name);
    (field?.taxoAliases || []).forEach(push);
  }
  return candidates;
}

export function resolveTaxoAttributeForField(taxoAttributs, field) {
  if (!Array.isArray(taxoAttributs) || !taxoAttributs.length || !field)
    return null;

  for (const key of getFieldTaxoCandidates(field)) {
    const row = getTaxoAttrByNom(taxoAttributs, key);
    if (row) return row;
  }

  if (field.attrId != null) {
    const byId = taxoAttributs.find(
      (attr) => Number(attr?.id) === Number(field.attrId)
    );
    if (byId) return byId;
  }

  return null;
}

export function isTaxoAttributeObligatoire(row) {
  if (!row) return false;
  const value = row.obligatoire ?? row.required ?? row.isObligatoire;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "oui", "yes"].includes(normalized);
  }
  return Boolean(value);
}

export function resolveFieldAttrId(taxoAttributs, field) {
  const fromTaxo = resolveTaxoAttributeForField(taxoAttributs, field);
  if (fromTaxo?.id != null) return Number(fromTaxo.id);

  if (field?.preferTaxoAttrId || field?.attrId == null) {
    for (const key of getFieldTaxoCandidates(field)) {
      const id = getTaxoAttrIdByNom(taxoAttributs, key, null);
      if (id != null) return id;
    }
  }
  return field?.attrId ?? null;
}

export function getValeursForField(taxoAttributs, field) {
  for (const key of getFieldTaxoCandidates(field)) {
    const values = getValeursByNom(taxoAttributs, key);
    if (values.length) return toUniqueOptions(values);
  }
  if (field?.attrId != null) {
    return toUniqueOptions(getValeursById(taxoAttributs, field.attrId));
  }
  return [];
}

export function mapTaxoApiTypeToFormType(apiType) {
  const upper = String(apiType || "").toUpperCase();
  if (upper.includes("NOMBRE") || upper === "NUMBER") return "NUMBER";
  if (upper.includes("DATE")) return "DATE";
  return "TEXT";
}

export function resolveFieldFormType(taxoAttributs, field, fallbackType = "TEXT") {
  const row = resolveTaxoAttributeForField(taxoAttributs, field);
  if (row?.type != null && String(row.type).trim() !== "") {
    return mapTaxoApiTypeToFormType(row.type);
  }
  return field?.type || fallbackType;
}

/** Normalise la réponse API attributs (array | { content } | { attributs }). */
export function normalizeTaxoAttributsResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.attributs)) return data.attributs;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}
