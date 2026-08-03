/**
 * Schéma de filtres Maison & Jardin — aligné sur le new front
 * (buildMaisonJardinFilterSchema.js).
 * Sous-catégories 53–60 : attributs taxo + produits liés conditionnels.
 */
import { getMaisonJardinSubcategoryConfig } from '../annonces/config/maisonJardinSubcategories';
import {
  isTypedProductKey,
  mapApiTypeToForm,
  normalizeMaisonJardinAttributes,
  resolveLinkedProductKey,
} from '../annonces/utils/maisonJardinTaxonomyHelpers';
import {
  MAISON_JARDIN_SUBCATEGORY_IDS,
  getMaisonJardinSubcategoryMeta,
} from './maisonJardinFilterAttributes';

const PRICE_RANGE = {
  id: 'price',
  type: 'range',
  label: 'Fourchette de prix',
  hint: 'Définissez un prix minimum et maximum',
  minParam: 'priceMin',
  maxParam: 'priceMax',
  currency: 'Da',
  api: { kind: 'price' },
};

function buildTaxoMaisonJardinFilterField(attr, extras = {}) {
  if (!attr?.id || !attr?.key) return null;

  const options = Array.isArray(attr.values) ? attr.values.filter(Boolean) : [];
  const attrType = String(attr.type || 'LISTE').toUpperCase();
  const isNumber = attrType.includes('NOMBRE') || mapApiTypeToForm(attr.type) === 'NUMBER';

  const base = {
    id: attr.key,
    param: attr.key,
    label: attr.name || attr.key,
    api: {
      kind: 'attribute',
      attributeId: Number(attr.id),
      attributeType: isNumber ? 'NOMBRE' : 'LISTE',
    },
    ...extras,
  };

  if (isNumber) {
    return {
      ...base,
      type: 'range',
      minParam: `${attr.key}_min`,
      maxParam: `${attr.key}_max`,
    };
  }

  if (!options.length) return null;

  // État : tags multi inline (comme les autres catégories)
  const keyNorm = String(attr.key || '').toLowerCase();
  if (keyNorm === 'etat' || keyNorm === 'condition') {
    return {
      ...base,
      type: 'tags',
      selectionMode: 'multi',
      options,
      forceInline: true,
    };
  }

  if (options.length <= 8) {
    return {
      ...base,
      type: 'select',
      placeholder: `Tout — ${base.label}`,
      options: options.map((value) => ({ value, label: value })),
    };
  }

  return {
    ...base,
    type: 'tags',
    selectionMode: 'multi',
    options,
  };
}

function buildAttrsByKey(normalizedAttributes = []) {
  const attrsByKey = {};
  normalizedAttributes.forEach((attr) => {
    if (attr?.key) attrsByKey[attr.key] = attr;
  });
  return attrsByKey;
}

function buildDedicatedMaisonJardinSchema(sousCategorieId, taxoAttributs = []) {
  const config = getMaisonJardinSubcategoryConfig(sousCategorieId);
  const meta = getMaisonJardinSubcategoryMeta(sousCategorieId);
  const normalized = normalizeMaisonJardinAttributes(taxoAttributs);
  const attrsByKey = buildAttrsByKey(normalized);

  if (!normalized.length) {
    return [PRICE_RANGE];
  }

  const fields = [];
  const primaryKey = meta?.primaryKey || config?.primaryKey || null;
  const linkedProductMode = meta?.linkedProductMode || config?.linkedProductMode || 'none';

  const typedProductKeys = normalized
    .filter((attr) => isTypedProductKey(attr.key))
    .map((attr) => attr.key);
  const clearsOnPrimary = [...typedProductKeys, 'produit'];

  if (primaryKey && attrsByKey[primaryKey]) {
    fields.push(
      buildTaxoMaisonJardinFilterField(attrsByKey[primaryKey], {
        clearsOnChange: clearsOnPrimary,
      })
    );
  }

  if (linkedProductMode !== 'none') {
    normalized.forEach((attr) => {
      if (!isTypedProductKey(attr.key) && attr.key !== 'produit') return;
      fields.push(
        buildTaxoMaisonJardinFilterField(attr, {
          linkage: {
            maisonJardinLinkedProduct: true,
            primaryKey,
            linkedProductMode,
            productKey: attr.key,
            attrsByKey,
          },
        })
      );
    });
  }

  normalized.forEach((attr) => {
    if (primaryKey && attr.key === primaryKey) return;
    if (linkedProductMode !== 'none' && (isTypedProductKey(attr.key) || attr.key === 'produit')) {
      return;
    }
    fields.push(buildTaxoMaisonJardinFilterField(attr));
  });

  return [...fields.filter(Boolean), PRICE_RANGE];
}

function buildStandardMaisonJardinSchema() {
  return [PRICE_RANGE];
}

/**
 * @param {number|string|null} sousCategorieId
 * @param {Array} taxoAttributs
 * @returns {Array}
 */
export function buildMaisonJardinFilterSchema(sousCategorieId = null, taxoAttributs = []) {
  const id = sousCategorieId != null && sousCategorieId !== '' ? Number(sousCategorieId) : null;

  if (id && MAISON_JARDIN_SUBCATEGORY_IDS.has(id)) {
    return buildDedicatedMaisonJardinSchema(id, taxoAttributs);
  }

  return buildStandardMaisonJardinSchema();
}

/** Visibilité du champ produit lié selon la valeur du champ primaire (type / univers). */
export function isMaisonJardinLinkedProductVisible(field, values = {}) {
  const linkage = field?.linkage;
  if (!linkage?.maisonJardinLinkedProduct) return true;

  const { primaryKey, linkedProductMode, productKey, attrsByKey } = linkage;
  const primaryValue = values[primaryKey];
  if (!primaryValue) return false;

  const resolvedKey = resolveLinkedProductKey(linkedProductMode, primaryValue, attrsByKey || {});
  return productKey === resolvedKey;
}
