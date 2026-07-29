/**
 * Convertit les filtres UI (objet plat) en payload API pour POST /annonces/search/all-attributes.
 * Aligné sur le web : buildSchemaSearchPayload.js
 */

function encodeSegmentedNumber(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'Any') return null;
  if (raw === '6+') return { min: '6' };
  return { min: raw, max: raw };
}

function encodeSegmentedList(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'Any') return null;
  return raw === '6+' ? '6' : raw;
}

function buildAttributeFilter(field, value) {
  const api = field?.api;
  if (!api || api.kind !== 'attribute' || !api.attributeId || !api.attributeType) return null;

  const attributeType = String(api.attributeType).toUpperCase();
  const filter = { attributDefiniId: api.attributeId, type: attributeType };

  // range / dateRange
  if ((field.type === 'range' || field.type === 'dateRange') && value && typeof value === 'object') {
    if (attributeType === 'NOMBRE') {
      if (value.min) filter.min = String(value.min);
      if (value.max) filter.max = String(value.max);
      return filter.min || filter.max ? filter : null;
    }
    if (attributeType === 'DATE') {
      if (value.min) filter.dateMin = value.min;
      if (value.max) filter.dateMax = value.max;
      return filter.dateMin || filter.dateMax ? filter : null;
    }
    if (value.min) filter.min = String(value.min);
    if (value.max) filter.max = String(value.max);
    return filter.min || filter.max ? filter : null;
  }

  // segmented-number (rooms)
  if (api.valueMode === 'segmented-number') {
    if (Array.isArray(value)) {
      const encoded = value.map(encodeSegmentedList).filter(Boolean);
      if (!encoded.length) return null;
      filter.equalsText = encoded.join(',');
      return filter;
    }
    const range = encodeSegmentedNumber(value);
    if (!range) return null;
    filter.min = range.min;
    if (range.max) filter.max = range.max;
    return filter;
  }

  // segmented-list (bedrooms)
  if (api.valueMode === 'segmented-list') {
    if (Array.isArray(value)) {
      const encoded = value.map(encodeSegmentedList).filter(Boolean);
      if (!encoded.length) return null;
      filter.equalsText = encoded.join(',');
      return filter;
    }
    const encoded = encodeSegmentedList(value);
    if (!encoded) return null;
    filter.equalsText = encoded;
    return filter;
  }

  // multi (tags, buttons multi)
  if (field.selectionMode === 'multi' && Array.isArray(value)) {
    if (!value.length) return null;
    filter.equalsText = value.join(',');
    return filter;
  }

  // single value
  if (value == null || value === '' || value === 'Any') return null;
  filter.equalsText = String(value);
  return filter;
}

/**
 * @param {object} filters - filtres UI plats (ex: { priceMin, priceMax, propertyType: ['maison'], rooms: ['3', '4'], ... })
 * @param {Array} filterSchema - schéma des champs (buildImmobilierFilterSchema() ou buildGeneralFilterSchema())
 * @returns {{ prixMin?, prixMax?, type?, attributs: Array }}
 */
export function buildSchemaSearchPayload(filters = {}, filterSchema = []) {
  const payload = {};
  const attributs = [];

  for (const field of filterSchema) {
    if (field.type === 'location' || field.type === 'sort') continue;
    // types spéciaux véhicule → traités comme select/tags standards
    const fieldType = (field.type === 'vehicleBrand' || field.type === 'vehicleModel')
      ? 'select'
      : field.type;
    const normalizedField = fieldType !== field.type ? { ...field, type: fieldType } : field;

    if (normalizedField.type === 'range' || normalizedField.type === 'dateRange') {
      const minKey = normalizedField.minParam || 'min';
      const maxKey = normalizedField.maxParam || 'max';
      const min = filters[minKey] || '';
      const max = filters[maxKey] || '';

      if (normalizedField.api?.kind === 'price') {
        const parsedMin = min ? Number(min) : null;
        const parsedMax = max ? Number(max) : null;
        if (Number.isFinite(parsedMin) && parsedMin > 0) payload.prixMin = parsedMin;
        if (Number.isFinite(parsedMax) && parsedMax > 0) payload.prixMax = parsedMax;
        continue;
      }

      if (min || max) {
        const attrFilter = buildAttributeFilter(normalizedField, { min, max });
        if (attrFilter) attributs.push(attrFilter);
      }
      continue;
    }

    const paramKey = normalizedField.param || normalizedField.id;
    const raw = filters[paramKey];
    if (raw == null || raw === '' || (Array.isArray(raw) && !raw.length)) continue;

    // type d'annonce
    if (normalizedField.id === 'annonceType') {
      const resolved = Array.isArray(raw) ? raw[0] : raw;
      if (resolved) payload.type = String(resolved);
      continue;
    }

    const attrFilter = buildAttributeFilter(normalizedField, raw);
    if (attrFilter) attributs.push(attrFilter);
  }

  if (attributs.length) payload.attributs = attributs;
  return payload;
}

/**
 * Compte le nombre de filtres actifs (hors catégorie/localisation).
 */
export function countActiveSchemaFilters(filters = {}, filterSchema = []) {
  let count = 0;
  for (const field of filterSchema) {
    if (field.type === 'location' || field.type === 'sort') continue;
    if (field.type === 'range' || field.type === 'dateRange') {
      const min = filters[field.minParam || 'min'];
      const max = filters[field.maxParam || 'max'];
      if ((min && min !== '') || (max && max !== '')) count++;
      continue;
    }
    const val = filters[field.param || field.id];
    if (val != null && val !== '' && !(Array.isArray(val) && !val.length)) count++;
  }
  return count;
}
