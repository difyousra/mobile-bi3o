/**
 * Résolution géographique Algérie — aligné sur le web
 * (bi3oo_front_new_design/src/shared/utils/algeriaLocation.js).
 *
 * Utilise les mêmes fichiers JSON présents dans src/data/.
 */
import communes from "../data/Commune_Of_Algeria.json";
import wilayas from "../data/Wilaya_Of_Algeria.json";

const COMMUNES = Array.isArray(communes) ? communes : [];
const WILAYAS = Array.isArray(wilayas) ? wilayas : [];

function normalizeName(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizePostalCode(raw) {
  if (raw == null || raw === "") return "";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 5) return digits.padStart(5, "0");
  return digits.slice(-5).padStart(5, "0");
}

export function findCommuneByPostalCode(postCode) {
  const normalized = normalizePostalCode(postCode);
  if (!normalized) return null;
  return COMMUNES.find((c) => normalizePostalCode(c?.post_code) === normalized) ?? null;
}

export function findWilayaById(id) {
  if (id == null) return null;
  return WILAYAS.find((w) => String(w?.id) === String(id)) ?? null;
}

export function findWilayaByVille(ville) {
  if (!ville) return null;
  const n = normalizeName(ville);
  return (
    WILAYAS.find((w) => String(w?.id) === String(ville).trim()) ||
    WILAYAS.find((w) => normalizeName(w?.name) === n) ||
    WILAYAS.find((w) => normalizeName(w?.ar_name) === n) ||
    null
  );
}

/**
 * Résout les coordonnées lat/lng depuis codePostal et/ou ville.
 * Même logique de cascade que le web.
 *
 * @returns {{ lat: number, lng: number, label: string | null }}
 */
export function resolveLocationCoords(codePostal, ville) {
  const commune = findCommuneByPostalCode(codePostal);
  const wilaya = commune
    ? findWilayaById(commune.wilaya_id)
    : findWilayaByVille(ville);

  if (commune?.latitude && commune?.longitude) {
    const lat = parseFloat(commune.latitude);
    const lng = parseFloat(commune.longitude);
    if (isFinite(lat) && isFinite(lng)) {
      return { lat, lng, label: commune.name ?? ville ?? null };
    }
  }

  if (wilaya?.latitude && wilaya?.longitude) {
    const lat = parseFloat(wilaya.latitude);
    const lng = parseFloat(wilaya.longitude);
    if (isFinite(lat) && isFinite(lng)) {
      return { lat, lng, label: wilaya.name ?? ville ?? null };
    }
  }

  // Fallback : Alger centre
  return { lat: 36.7538, lng: 3.0588, label: ville ?? null };
}

/**
 * Normalise un numéro algérien pour WhatsApp (wa.me/213XXXXXXXXX).
 * Aligné sur whatsapp.js du web.
 */
export function normalizePhoneForWhatsApp(raw) {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;

  let digits = value.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00213")) digits = digits.slice(2);
  if (digits.startsWith("213")) return digits;

  if (digits.startsWith("0") && digits.length >= 10 && /^0[567]/.test(digits)) {
    return `213${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^[567]\d{8}$/.test(digits)) {
    return `213${digits}`;
  }

  return digits.length >= 8 ? digits : null;
}

/**
 * Génère l'URL wa.me avec texte pré-rempli optionnel.
 */
export function whatsappUrl(rawPhone, prefillText) {
  const digits = normalizePhoneForWhatsApp(rawPhone);
  if (!digits) return null;
  let url = `https://wa.me/${digits}`;
  if (prefillText) url += `?text=${encodeURIComponent(String(prefillText).trim())}`;
  return url;
}

/**
 * Extrait le téléphone public d'un profil vendeur.
 * Priorité : profil pro → telephone racine → phone.
 */
export function getSellerPhone(pub) {
  if (!pub) return null;
  const isPro = pub.typeCompte === "PRO" || Boolean(pub.pro);
  const phone = (isPro ? pub.pro?.telephone : null) || pub.telephone || pub.phone || "";
  return String(phone).trim() || null;
}
