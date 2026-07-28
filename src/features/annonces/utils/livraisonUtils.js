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
