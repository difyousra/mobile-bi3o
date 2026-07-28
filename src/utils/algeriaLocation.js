import communes from "../data/Commune_Of_Algeria.json";
import wilayas from "../data/Wilaya_Of_Algeria.json";

const COMMUNES_LIST = Array.isArray(communes) ? communes : [];
const WILAYAS_LIST = Array.isArray(wilayas) ? wilayas : [];

function normalizeName(value) {
  return String(value || "")
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
  return (
    COMMUNES_LIST.find((item) => normalizePostalCode(item?.post_code) === normalized) ||
    null
  );
}

export function findWilayaById(id) {
  if (id == null || String(id).trim() === "") return null;
  return WILAYAS_LIST.find((item) => String(item?.id) === String(id)) || null;
}

export function getWilayaDisplayName(wilaya) {
  return String(wilaya?.name || wilaya?.ar_name || "").trim();
}

export function getCommuneDisplayName(commune) {
  return String(commune?.name || commune?.ar_name || "").trim();
}

export function formatCommuneSearchLine(commune, wilayaName = "") {
  const postCode = commune?.post_code || "";
  const communeName = getCommuneDisplayName(commune) || commune?.name || "";
  if (!postCode && !communeName) return "";
  if (wilayaName && wilayaName !== communeName) {
    return `${postCode} · ${communeName}, ${wilayaName}`;
  }
  return `${postCode} · ${communeName}`;
}

export function formatAnnonceLocationLine(codePostal, ville) {
  const commune = findCommuneByPostalCode(codePostal);
  const wilaya = commune ? findWilayaById(commune.wilaya_id) : findWilayaById(ville);
  const cp = normalizePostalCode(codePostal) || String(codePostal || "").trim();
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
    for (const commune of COMMUNES_LIST) {
      if (!commune?.post_code) continue;
      if (!String(commune.post_code).startsWith(digits)) continue;
      results.push({
        ...commune,
        wilayaName: wilayaLabelById(commune.wilaya_id),
        score: commune.post_code === digits ? 0 : commune.post_code.length - digits.length,
      });
    }
    return results.sort((a, b) => a.score - b.score).slice(0, max);
  }

  for (const commune of COMMUNES_LIST) {
    const communeName = normalizeName(commune?.name);
    const communeArName = normalizeName(commune?.ar_name);
    const wilaya = findWilayaById(commune?.wilaya_id);
    const wilayaName = normalizeName(wilaya?.name);
    const wilayaArName = normalizeName(wilaya?.ar_name);
    if (
      communeName.includes(normalizedQuery) ||
      communeArName.includes(normalizedQuery) ||
      wilayaName.includes(normalizedQuery) ||
      wilayaArName.includes(normalizedQuery)
    ) {
      let score = 100;
      if (communeName.startsWith(normalizedQuery) || communeArName.startsWith(normalizedQuery)) score = 0;
      else if (wilayaName.startsWith(normalizedQuery) || wilayaArName.startsWith(normalizedQuery)) score = 1;
      else if (communeName.includes(normalizedQuery) || communeArName.includes(normalizedQuery)) score = 2;
      results.push({
        ...commune,
        wilayaName: wilayaLabelById(commune.wilaya_id),
        score,
      });
    }
  }

  return results.sort((a, b) => a.score - b.score).slice(0, max);
}
