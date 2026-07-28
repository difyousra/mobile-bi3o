const T = { TEXT: "TEXT", NUMBER: "NUMBER", DATE: "DATE" };

const select = (name, label, options = {}) => ({
  name,
  label,
  type: T.TEXT,
  control: "combobox",
  preferTaxoAttrId: true,
  taxoKey: name,
  ...options,
});

const chips = (name, label, options = {}) =>
  select(name, label, {
    control: "choice-chips",
    chipVariant: "outline",
    ...options,
  });

const livraisonField = {
  name: "livraison",
  label: "Livraison",
  type: T.TEXT,
  control: "switch",
  preferTaxoAttrId: true,
  taxoKey: "livraison",
  checkedValue: "oui",
  uncheckedValue: "non",
};

const equipementsBebe = {
  id: 13,
  slug: "equipements-bebe",
  label: "Équipements bébé",
  fields: [
    select("type", "Type", { attrId: 428 }),
    select("marque", "Marque", { attrId: 96 }),
    select("couleur", "Couleur", { attrId: 97 }),
    chips("etat", "État", { attrId: 98 }),
    livraisonField,
  ],
};

const mobiliersEnfant = {
  id: 14,
  slug: "mobiliers-enfant",
  label: "Mobiliers enfant",
  fields: [
    select("produit", "Produit", { attrId: 100 }),
    select("marque", "Marque", { attrId: 101 }),
    select("couleur", "Couleur", { attrId: 103 }),
    chips("etat", "État", { attrId: 104 }),
    livraisonField,
  ],
};

const vetementsBebe = {
  id: 15,
  slug: "vetements-bebe",
  label: "Vêtements bébé",
  fields: [
    select("type", "Type", { attrId: 429 }),
    select("taille", "Taille", { attrId: 106 }),
    select("marque", "Marque", { attrId: 107 }),
    select("couleur", "Couleur", { attrId: 108 }),
    chips("etat", "État", { attrId: 109 }),
    livraisonField,
  ],
};

export const FAMILLE_SUBCATEGORIES = {
  13: equipementsBebe,
  14: mobiliersEnfant,
  15: vetementsBebe,
};

export function getFamilleSubcategoryConfig(sousCategorieId) {
  if (sousCategorieId == null || sousCategorieId === "") return null;
  return FAMILLE_SUBCATEGORIES[Number(sousCategorieId)] || null;
}

export function isFamilleSubcategory(sousCategorieId) {
  return Boolean(getFamilleSubcategoryConfig(sousCategorieId));
}
