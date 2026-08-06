/**
 * Libellés / options des sous-formulaires dépôt (forms.deposit.subforms.*).
 * Les configs gardent des labels FR ; EN/AR viennent des dictionnaires web.
 */

export function snakeToCamel(name) {
  return String(name || "").replace(/_([a-z0-9])/gi, (_, c) =>
    String(c).toUpperCase()
  );
}

/** Alias field.name → clé i18n quand le nom ne matche pas 1:1. */
const FIELD_KEY_ALIASES = {
  annee: "anneeModele",
  boite_vitesse: "boiteVitesse",
  type_vehicule: "typeVehicule",
  nombre_portes: "nombrePortes",
  nombre_places: "nombrePlaces",
  puissance_fiscale: "puissanceFiscale",
  puissance_din: "puissanceDin",
  premiere_circulation: "premiereCirculation",
  controle_technique: "controleTechnique",
  historique_entretien: "historiqueEntretien",
  etat_vehicule: "etatVehicule",
  etat: "state",
  taille_ecran: "tailleEcran",
};

/**
 * @param {import('i18next').TFunction} t
 * @param {string | undefined | null} tipsI18nKey
 * @param {string} fieldName
 * @param {string} [fallback]
 */
export function translateSubformFieldLabel(t, tipsI18nKey, fieldName, fallback) {
  const raw = String(fallback ?? fieldName ?? "").trim();
  if (!t || !fieldName) return raw;

  const camel = snakeToCamel(fieldName);
  const alias = FIELD_KEY_ALIASES[fieldName];
  const candidates = [];

  if (tipsI18nKey) {
    candidates.push(
      `${tipsI18nKey}.${camel}`,
      `${tipsI18nKey}.${fieldName}`,
      `${tipsI18nKey}.fields.${fieldName}`,
      `${tipsI18nKey}.fields.${camel}`
    );
    if (alias) {
      candidates.push(`${tipsI18nKey}.${alias}`, `${tipsI18nKey}.fields.${alias}`);
    }
  }

  candidates.push(`mobile.publish.attrLabels.${fieldName}`);
  if (alias) candidates.push(`mobile.publish.attrLabels.${alias}`);

  for (const key of candidates) {
    const value = t(key, { defaultValue: "" });
    if (value && value !== key) return value;
  }
  return raw;
}

/**
 * @param {import('i18next').TFunction} t
 * @param {string | undefined | null} tipsI18nKey
 * @param {string} fieldName
 * @param {unknown} value — valeur stockée (souvent FR taxo)
 * @param {string} [fallback]
 */
export function translateSubformOptionValue(
  t,
  tipsI18nKey,
  fieldName,
  value,
  fallback
) {
  const raw = String(fallback ?? value ?? "").trim();
  if (!raw || !t) return raw;

  const lower = raw.toLowerCase();
  if (lower === "oui" || lower === "yes") {
    return t("createAdWizard.yes", { defaultValue: raw });
  }
  if (lower === "non" || lower === "no") {
    return t("createAdWizard.no", { defaultValue: raw });
  }

  if (tipsI18nKey && fieldName) {
    const camel = snakeToCamel(fieldName);
    const candidates = [
      `${tipsI18nKey}.options.${fieldName}.${raw}`,
      `${tipsI18nKey}.options.${fieldName}.${lower}`,
      `${tipsI18nKey}.options.${camel}.${raw}`,
      `${tipsI18nKey}.options.${camel}.${lower}`,
      `${tipsI18nKey}.boolLabels.${raw}`,
      `${tipsI18nKey}.boolLabels.${lower}`,
    ];
    for (const key of candidates) {
      const localized = t(key, { defaultValue: "" });
      if (localized && localized !== key) return localized;
    }
  }

  const mobileKey = `mobile.publish.optionLabels.${lower}`;
  const mobileVal = t(mobileKey, { defaultValue: "" });
  if (mobileVal && mobileVal !== mobileKey) return mobileVal;

  return raw;
}

/**
 * Transforme une liste d’options (strings ou {value,label}) pour l’affichage i18n
 * tout en conservant la valeur API/taxo.
 *
 * @returns {{ value: string, label: string }[]}
 */
export function localizeOptionList(t, tipsI18nKey, fieldName, options = []) {
  return (options || []).map((opt) => {
    if (opt && typeof opt === "object" && ("value" in opt || "label" in opt)) {
      const value = String(opt.value ?? opt.label ?? "");
      return {
        value,
        label: translateSubformOptionValue(
          t,
          tipsI18nKey,
          fieldName,
          value,
          opt.label
        ),
      };
    }
    const value = String(opt ?? "");
    return {
      value,
      label: translateSubformOptionValue(t, tipsI18nKey, fieldName, value),
    };
  });
}

/** Normalise une option pour les contrôles UI (string | {value,label}). */
export function optionValue(opt) {
  if (opt && typeof opt === "object" && "value" in opt) return String(opt.value);
  return String(opt ?? "");
}

export function optionLabel(opt) {
  if (opt && typeof opt === "object" && "label" in opt) return String(opt.label);
  return String(opt ?? "");
}
