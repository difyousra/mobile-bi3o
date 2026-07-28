import { apiClient } from "../../../api/client";
import { getAccessToken } from "../../../api/tokenManager";
import { getMe } from "../../../services/authService";
import { fetchAttributs } from "../../../services/taxoService";

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isGenericModeleNom(nom) {
  return normalizeKey(nom) === "modele";
}

function isBrandSpecificModeleNom(nom) {
  const raw = String(nom || "").trim();
  const key = normalizeKey(raw);
  if (!key || key === "modele") return false;
  if (key === "annee_modele" || key.startsWith("annee_")) return false;
  if (/^[A-Z0-9][A-Z0-9_]*(?:_modele|_modèle)$/.test(raw)) return true;
  return key.endsWith("_modele");
}

function isModeleLikeAttributKey(key) {
  const k = normalizeKey(key);
  if (k === "modele") return true;
  if (k === "annee_modele" || k.startsWith("annee_")) return false;
  return k.endsWith("_modele");
}

function findModeleValueInAttributs(attributs = {}) {
  const direct = attributs.modele ?? attributs.Modele ?? attributs["Modèle"];
  if (direct != null && String(direct).trim() !== "") return String(direct).trim();

  for (const [key, value] of Object.entries(attributs)) {
    if (!isModeleLikeAttributKey(key)) continue;
    if (value == null || String(value).trim() === "") continue;
    return String(value).trim();
  }
  return "";
}

function buildAttributeMapping(subcategoryConfig, attributeAttrIds = {}) {
  const mapping = { ...(attributeAttrIds || {}) };
  (subcategoryConfig?.fields || []).forEach((field) => {
    if (field?.name && field?.attrId != null) {
      mapping[field.name] = field.attrId;
    }
  });
  return mapping;
}

function resolveAttributValeur(def, attributs, mapping, contactAttrId, fallbackContact) {
  const nom = String(def.nom || "").trim();
  if (!nom) return "";

  const keyFromId = Object.keys(mapping).find(
    (key) => Number(mapping[key]) === Number(def.id)
  );
  let value = "";

  if (
    keyFromId != null &&
    attributs[keyFromId] != null &&
    String(attributs[keyFromId]).trim() !== ""
  ) {
    value = String(attributs[keyFromId]).trim();
  } else if (attributs[nom] != null && String(attributs[nom]).trim() !== "") {
    value = String(attributs[nom]).trim();
  } else {
    const nomKey = normalizeKey(nom);
    const byNormalized = Object.entries(attributs || {}).find(
      ([key, raw]) =>
        normalizeKey(key) === nomKey && raw != null && String(raw).trim() !== ""
    );
    if (byNormalized) value = String(byNormalized[1]).trim();
  }

  if (!value && (isGenericModeleNom(nom) || isBrandSpecificModeleNom(nom))) {
    value = findModeleValueInAttributs(attributs);
  }

  if (
    !value &&
    contactAttrId != null &&
    Number(contactAttrId) === Number(def.id) &&
    String(fallbackContact || "").trim()
  ) {
    value = String(fallbackContact).trim();
  }

  return value;
}

/**
 * POST /taxo/annonces/generate-description
 * @returns {Promise<string>}
 */
export async function generateAnnonceDescription({
  sousCategorieId,
  sousCategorieNom,
  titre,
  type,
  prix,
  ville,
  codePostal,
  attributs,
  subcategoryConfig,
  attributeAttrIds,
}) {
  const token = await getAccessToken();
  if (!String(token || "").trim()) {
    throw new Error("Connectez-vous pour générer une description.");
  }
  if (!sousCategorieId) {
    throw new Error("Choisissez ou chargez une sous-catégorie.");
  }

  const manquants = [];
  if (!titre?.trim()) manquants.push("titre");
  if (!ville?.trim()) manquants.push("ville");
  if (!codePostal?.trim()) manquants.push("code postal");
  if (manquants.length) {
    throw new Error(
      `Renseignez d'abord : ${manquants.join(", ")}. Le prix peut être complété après ; s'il est vide, il ne sera pas mentionné dans le texte généré.`
    );
  }

  const defs = await fetchAttributs(Number(sousCategorieId));
  const meResult = await getMe();
  if (!meResult.ok || !meResult.data) {
    throw new Error("Session invalide — reconnectez-vous.");
  }
  const me = meResult.data;
  const fallbackContact =
    me?.telephone || me?.phone || me?.phoneNumber || me?.email || me?.username || "";

  const mapping = buildAttributeMapping(subcategoryConfig, attributeAttrIds);
  const contactField = (subcategoryConfig?.fields || []).find(
    (field) => field.name === "contact"
  );
  const contactAttrId = contactField?.attrId ?? mapping.contact;

  const orderedPieces = [];
  const seenNom = new Set();

  for (const def of Array.isArray(defs) ? defs : []) {
    const nom = String(def?.nom || "").trim();
    if (!nom || nom.toLowerCase() === "description") continue;
    if (isBrandSpecificModeleNom(nom)) continue;

    const valeur = resolveAttributValeur(
      def,
      attributs || {},
      mapping,
      contactAttrId,
      fallbackContact
    );

    if (def.obligatoire && !valeur) {
      throw new Error(
        `Complétez d'abord le champ obligatoire « ${nom} » (détails de la sous-catégorie). La génération n'ajoute aucune information non saisie.`
      );
    }

    if (valeur && !seenNom.has(nom)) {
      seenNom.add(nom);
      orderedPieces.push({ nom, valeur });
    }
  }

  const prixStr = prix != null && String(prix).trim() ? String(prix).trim() : null;
  const payload = {
    sousCategorieId: Number(sousCategorieId),
    sousCategorieNom: sousCategorieNom?.trim() || undefined,
    titre: titre.trim(),
    type,
    ...(prixStr ? { prix: prixStr } : {}),
    ville: ville.trim(),
    codePostal: codePostal.trim(),
    attributsObligatoires: orderedPieces,
  };

  const { data } = await apiClient.post(
    "/taxo/annonces/generate-description",
    payload
  );
  const description =
    typeof data?.description === "string" ? data.description : "";
  if (!description.trim()) throw new Error("Réponse vide du serveur.");
  return description.trim();
}
