function normAttributeToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function isLivraisonAttributeName(nom) {
  if (!nom || !String(nom).trim()) return false;
  const key = normAttributeToken(nom).replace(/\s+/g, "_");
  if (key.includes("partenaires") || key.includes("point_relais") || key.includes("bureau")) {
    return false;
  }
  if (key === "livraison" || key === "livraison_disponible") return true;
  return key.includes("livraison") && key.includes("disponible");
}

export function isLivraisonOuiValue(raw) {
  const v = normAttributeToken(raw);
  return v === "oui" || v === "yes" || v === "o";
}

export function isLivraisonNonValue(raw) {
  const v = normAttributeToken(raw);
  return v === "non" || v === "no" || v === "n";
}

export function isLivraisonDisponibleOui(attributs = {}) {
  const livraisonKey = Object.keys(attributs || {}).find((key) =>
    isLivraisonAttributeName(key)
  );
  if (!livraisonKey) return false;
  const raw = attributs[livraisonKey];
  if (raw === true || isLivraisonOuiValue(raw)) return true;
  if (raw === false || isLivraisonNonValue(raw)) return false;
  return false;
}

/** true | false | null (absent / non renseigné) depuis valeurs API */
export function resolveAttributLivraison(valeurs = []) {
  if (!Array.isArray(valeurs)) return null;

  for (const valeur of valeurs) {
    if (!valeur || !isLivraisonAttributeName(valeur.attributNom)) continue;
    const raw = valeur.valueText ?? valeur.valueNumber;
    if (raw == null || String(raw).trim() === "") return null;
    if (isLivraisonOuiValue(raw)) return true;
    if (isLivraisonNonValue(raw)) return false;
    return null;
  }

  return null;
}

export function isAnnonceLivraisonDisponible(raw) {
  if (typeof raw?.livraisonDisponible === "boolean") return raw.livraisonDisponible;
  if (typeof raw?.attributLivraison === "boolean") return raw.attributLivraison;
  return resolveAttributLivraison(raw?.valeurs) === true;
}
