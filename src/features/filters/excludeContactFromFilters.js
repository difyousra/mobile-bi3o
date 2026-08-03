import { normalizeTaxoName } from '../annonces/utils/taxoHelpers';

/** Noms d’attributs / champs filtre à exclure partout (contact vendeur, etc.). */
const CONTACT_FILTER_KEYS = new Set(['contact', 'telephone_de_contact', 'tel_contact']);

export function isContactFilterKey(value) {
  const name = normalizeTaxoName(value);
  if (!name) return false;
  if (CONTACT_FILTER_KEYS.has(name)) return true;
  return name === 'contact' || name.endsWith('_contact') || name.startsWith('contact_');
}

export function isContactFilterField(field) {
  if (!field) return false;
  return [
    field.id,
    field.param,
    field.name,
    field.key,
    field.label,
    field.api?.attributeNom,
  ].some((value) => isContactFilterKey(value));
}

/** Retire l’attribut contact de tout schéma de filtres. */
export function excludeContactFromFilterSchema(schema = []) {
  return (Array.isArray(schema) ? schema : []).filter((field) => !isContactFilterField(field));
}
