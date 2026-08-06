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

/** Liste des wilayas (ordre fichier JSON). */
export function getAllWilayas() {
  return WILAYAS.slice();
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

export function getWilayaDisplayName(wilaya) {
  if (!wilaya) return "";
  return String(wilaya.name || wilaya.ar_name || wilaya.id || "").trim();
}

export function getCommuneDisplayName(commune) {
  if (!commune) return "";
  return String(commune.name || commune.ar_name || "").trim();
}

export function resolveLocationReference(codePostal, ville) {
  const commune = findCommuneByPostalCode(codePostal);
  const wilaya = commune ? findWilayaById(commune.wilaya_id) : findWilayaByVille(ville);
  const coordinates = getCommuneLatLng(commune) || getWilayaLatLng(wilaya) || {
    lat: 36.7538,
    lng: 3.0588,
  };
  return { commune, wilaya, coordinates };
}

function getCommuneLatLng(commune) {
  if (!commune?.latitude || !commune?.longitude) return null;
  const lat = Number.parseFloat(commune.latitude);
  const lng = Number.parseFloat(commune.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function getWilayaLatLng(wilaya) {
  if (!wilaya?.latitude || !wilaya?.longitude) return null;
  const lat = Number.parseFloat(wilaya.latitude);
  const lng = Number.parseFloat(wilaya.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Ligne affichée sur une annonce : « Commune (Wilaya) · 16000 ». */
export function formatAnnonceLocationLine(codePostal, ville) {
  const { commune, wilaya } = resolveLocationReference(codePostal, ville);
  const normalizedCp = normalizePostalCode(codePostal);
  const cp = normalizedCp || String(codePostal || "").trim();
  const communeLabel = getCommuneDisplayName(commune);
  const wilayaLabel = getWilayaDisplayName(wilaya);

  if (commune && wilaya) {
    const same = normalizeName(commune.name) === normalizeName(wilaya.name);
    const place = same ? communeLabel : `${communeLabel} (${wilayaLabel})`;
    return cp ? `${place} · ${cp}` : place;
  }
  if (commune) return cp ? `${communeLabel} · ${cp}` : communeLabel;
  if (wilaya) return cp ? `${wilayaLabel} · ${cp}` : wilayaLabel;
  return [ville, cp].filter(Boolean).join(" · ");
}

/** Ligne de suggestion recherche : « 16000 · Alger Centre, Alger ». */
export function formatCommuneSearchLine(commune, wilayaName = "") {
  const postCode = commune?.post_code || "";
  const communeName = getCommuneDisplayName(commune) || commune?.name || "";
  const wilayaLabel = wilayaName || getWilayaDisplayName(findWilayaById(commune?.wilaya_id));
  if (!postCode && !communeName) return "";
  if (wilayaLabel && wilayaLabel !== communeName) {
    return `${postCode} · ${communeName}, ${wilayaLabel}`;
  }
  return `${postCode} · ${communeName}`;
}

/** Recherche communes par nom / code postal / wilaya. */
export function searchCommunes(query, limit = 15) {
  const raw = String(query || "").trim();
  if (!raw) return [];

  const normalizedQuery = normalizeName(raw);
  const digits = raw.replace(/\D/g, "");
  const onlyDigits = digits.length > 0 && /^\d[\d\s]*$/.test(raw.replace(/\s/g, ""));
  const max = Math.min(Math.max(limit, 1), 40);
  const results = [];

  const wilayaLabelById = (wilayaId) => getWilayaDisplayName(findWilayaById(wilayaId));

  if (onlyDigits) {
    for (const commune of COMMUNES) {
      const cp = String(commune?.post_code || "");
      if (!cp.startsWith(digits) && normalizePostalCode(cp) !== normalizePostalCode(digits)) {
        continue;
      }
      results.push({ ...commune, wilayaName: wilayaLabelById(commune.wilaya_id) });
      if (results.length >= max) break;
    }
    return results;
  }

  for (const commune of COMMUNES) {
    const name = normalizeName(commune?.name);
    const arName = normalizeName(commune?.ar_name);
    const wilaya = findWilayaById(commune?.wilaya_id);
    const wilayaName = normalizeName(wilaya?.name);
    if (
      name.includes(normalizedQuery) ||
      arName.includes(normalizedQuery) ||
      wilayaName.includes(normalizedQuery)
    ) {
      results.push({ ...commune, wilayaName: getWilayaDisplayName(wilaya) });
      if (results.length >= max) break;
    }
  }
  return results;
}

/**
 * Résout les coordonnées lat/lng depuis codePostal et/ou ville.
 * Même logique de cascade que le web.
 *
 * @returns {{ lat: number, lng: number, label: string | null }}
 */
export function resolveLocationCoords(codePostal, ville) {
  const { commune, wilaya, coordinates } = resolveLocationReference(codePostal, ville);
  const label =
    getCommuneDisplayName(commune) ||
    getWilayaDisplayName(wilaya) ||
    (ville ? String(ville) : null);
  return { lat: coordinates.lat, lng: coordinates.lng, label };
}

/**
 * Regroupe les annonces par commune pour afficher un pin par commune.
 * Aligné sur le new front : buildCommuneMarkersFromListings.
 */
export function buildCommuneMarkersFromListings(listings = []) {
  const communeMap = new Map();

  listings.forEach((listing) => {
    const ref = resolveLocationReference(listing.codePostal, listing.ville);
    const commune = ref.commune;
    const key = commune?.post_code
      ? normalizePostalCode(commune.post_code)
      : `${ref.coordinates.lat.toFixed(4)},${ref.coordinates.lng.toFixed(4)}`;

    if (!communeMap.has(key)) {
      communeMap.set(key, {
        id: `commune-${key}`,
        lat: ref.coordinates.lat,
        lng: ref.coordinates.lng,
        label: getCommuneDisplayName(commune) || listing.location || "Commune",
        commune,
        listings: [],
      });
    }

    communeMap.get(key).listings.push(listing);
  });

  return Array.from(communeMap.values()).map((entry) => ({
    ...entry,
    listing: entry.listings[0],
    listingCount: entry.listings.length,
  }));
}

/** Un pin par annonce (max N) — utilisé si filtre lieu actif. */
export function buildListingMarkers(listings = [], max = 40) {
  return listings.slice(0, max).map((listing) => {
    const ref = resolveLocationReference(listing.codePostal, listing.ville);
    return {
      id: String(listing.id),
      lat: ref.coordinates.lat,
      lng: ref.coordinates.lng,
      label: listing.title,
      listing,
      listings: [listing],
      listingCount: 1,
    };
  });
}

/** Centre Algérie (vue d’ensemble). */
export const ALGERIA_REGION = {
  latitude: 28.0,
  longitude: 2.5,
  latitudeDelta: 14,
  longitudeDelta: 14,
};

export const ALGIERS_REGION = {
  latitude: 36.7538,
  longitude: 3.0588,
  latitudeDelta: 0.45,
  longitudeDelta: 0.45,
};

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
