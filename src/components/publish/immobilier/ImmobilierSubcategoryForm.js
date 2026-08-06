import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSubcategoryAttributs } from "../../../hooks/useSubcategoryAttributs";
import { useAppLanguage } from "../../../i18n/LanguageProvider";
import {
  localizeOptionList,
  translateSubformFieldLabel,
} from "../../../i18n/subformFieldLabels";
import {
  getValeursForField,
  resolveFieldAttrId,
  resolveFieldFormType,
  toUniqueOptions,
} from "../../../features/annonces/utils/taxoHelpers";
import {
  resolveVariantField,
  isFieldVisible,
  isFieldRequiredWithTaxonomy,
  isTruthyLike,
  resolveFieldControl,
} from "../../../features/annonces/utils/subcategoryFieldHelpers";
import {
  TypeCardsField,
  ChoiceChipsField,
  RadioField,
  SwitchAttrField,
  ClearableNumberField,
  DateMonthField,
  ComboboxField,
  MultiDropdownField,
} from "./ImmobilierFieldControls";
import { colors } from "../../../theme/colors";

/**
 * Formulaire dynamique Immobilier (sous-catégories 41–44).
 * Aligné sur VehicleSubcategoryForm du nouveau design web.
 */
export default function ImmobilierSubcategoryForm({
  config,
  attributs = {},
  attributeAttrIds = {},
  attributeTypes = {},
  onAttributsChange,
  onMetaChange,
}) {
  const { t } = useAppLanguage();
  const {
    data: taxoAttributs = [],
    isLoading: taxoLoading,
  } = useSubcategoryAttributs(config?.id);

  const prevTriggerValuesRef = useRef({});

  const setAttrValue = (fieldName, nextValue) => {
    const next = { ...attributs, [fieldName]: nextValue };
    onAttributsChange?.(next);
  };

  const onMetaChangeRef = useRef(onMetaChange);
  const onAttributsChangeRef = useRef(onAttributsChange);
  onMetaChangeRef.current = onMetaChange;
  onAttributsChangeRef.current = onAttributsChange;

  // Résolution attrId + types depuis la taxo
  useEffect(() => {
    if (!config?.fields?.length) return;
    const nextIds = { ...attributeAttrIds };
    const nextTypes = { ...attributeTypes };
    let changed = false;

    config.fields.forEach((field) => {
      const activeField = resolveVariantField(field, attributs);
      if (!isFieldVisible(activeField, attributs)) return;

      const resolvedAttrId = resolveFieldAttrId(taxoAttributs, activeField);
      if (resolvedAttrId != null && nextIds[field.name] !== Number(resolvedAttrId)) {
        nextIds[field.name] = Number(resolvedAttrId);
        changed = true;
      }
      const formType = resolveFieldFormType(
        taxoAttributs,
        activeField,
        activeField.type || "TEXT"
      );
      if (nextTypes[field.name] !== formType) {
        nextTypes[field.name] = formType;
        changed = true;
      }
    });

    if (changed) {
      onMetaChangeRef.current?.({
        attributeAttrIds: nextIds,
        attributeTypes: nextTypes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync taxo only
  }, [attributs, config, taxoAttributs]);

  // clearAttributsOnChange (ex. type_bien)
  useEffect(() => {
    if (!config?.clearAttributsOnChange) return;
    let next = null;
    Object.entries(config.clearAttributsOnChange).forEach(
      ([triggerField, fieldsToClear]) => {
        const current = attributs[triggerField];
        const previous = prevTriggerValuesRef.current[triggerField];
        if (previous !== undefined && previous !== current) {
          next = next || { ...attributs };
          fieldsToClear.forEach((fieldName) => {
            next[fieldName] = "";
          });
        }
        prevTriggerValuesRef.current[triggerField] = current;
      }
    );
    if (next) onAttributsChangeRef.current?.(next);
  }, [attributs, config?.clearAttributsOnChange]);

  // Champs showWhen devenus invisibles : vider la valeur
  useEffect(() => {
    if (!config?.fields?.length) return;
    let next = null;
    config.fields.forEach((field) => {
      if (!field?.name || !field.showWhen) return;
      if (isFieldVisible(field, attributs)) return;
      const raw = attributs[field.name];
      if (raw === undefined || raw === null || String(raw).trim() === "") return;
      next = next || { ...attributs };
      next[field.name] = Array.isArray(raw) ? [] : "";
    });
    if (next) onAttributsChangeRef.current?.(next);
  }, [attributs, config?.fields]);

  const resolveOptions = (field) => {
    const activeField = resolveVariantField(field, attributs);
    if (activeField.staticOptions?.length) {
      if (activeField.preferStaticOptions) {
        return toUniqueOptions(activeField.staticOptions);
      }
      const taxoOpts = getValeursForField(taxoAttributs, activeField);
      return toUniqueOptions(taxoOpts.length ? taxoOpts : activeField.staticOptions);
    }
    return getValeursForField(taxoAttributs, activeField);
  };

  const hasRequiredFields = useMemo(
    () =>
      Boolean(
        config?.fields?.some((field) =>
          isFieldRequiredWithTaxonomy(field, attributs, taxoAttributs)
        )
      ),
    [attributs, config, taxoAttributs]
  );

  if (!config) return null;

  return (
    <View style={styles.wrap}>
      {taxoLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>{t("mobile.publish.loadingAttributes")}</Text>
        </View>
      ) : null}

      {!taxoLoading && hasRequiredFields ? (
        <Text style={styles.requiredHint}>
          {t("mobile.publish.requiredFieldsMarked")}
        </Text>
      ) : null}

      {(config.fields || []).map((field) => {
        const activeField = resolveVariantField(field, attributs);
        if (!isFieldVisible(field, attributs)) return null;

        const control = resolveFieldControl(activeField);
        const taxoListeOptions =
          control === "number" || control === "clearable-number"
            ? getValeursForField(taxoAttributs, activeField)
            : [];
        const forceComboboxFromTaxo =
          (control === "number" || control === "clearable-number") &&
          resolveFieldFormType(taxoAttributs, activeField, activeField.type) ===
            "TEXT" &&
          taxoListeOptions.length > 0;
        const isCombobox =
          control === "combobox" || control === "select" || forceComboboxFromTaxo;
        const isMultiDropdown = control === "multi-dropdown";
        const tipsKey =
          config.tipsI18nKey ||
          (config.slug === "vente-immobiliere"
            ? "forms.deposit.subforms.venteImmobiliere"
            : config.slug === "locations"
              ? "forms.deposit.subforms.locationsImmobilier"
              : config.slug === "colocations"
                ? "forms.deposit.subforms.colocations"
                : config.slug === "bureau-commercial"
                  ? "forms.deposit.subforms.bureauCommercial"
                  : null);
        const options =
          isCombobox ||
          control === "type-cards" ||
          control === "choice-chips" ||
          control === "radio" ||
          isMultiDropdown
            ? localizeOptionList(t, tipsKey, field.name, resolveOptions(field))
            : [];

        const isDependentField = Boolean(activeField.dependsOnField);
        const parentDependentValue = isDependentField
          ? attributs[activeField.dependsOnField]
          : "";
        const disabled =
          isDependentField && !String(parentDependentValue || "").trim();
        const currentValue = attributs[field.name];
        const required = isFieldRequiredWithTaxonomy(
          field,
          attributs,
          taxoAttributs
        );
        const fieldLabel = translateSubformFieldLabel(
          t,
          tipsKey,
          field.name,
          activeField.label
        );
        const radioLabel = activeField.radioPrompt
          ? translateSubformFieldLabel(
              t,
              tipsKey,
              `${field.name}_prompt`,
              activeField.radioPrompt
            )
          : fieldLabel;

        if (control === "type-cards") {
          return (
            <TypeCardsField
              key={field.name}
              label={fieldLabel}
              required={required}
              options={options}
              value={currentValue}
              onChange={(next) => {
                // Stocke la valeur taxo telle quelle ; matching showWhen via normalizeTaxoName
                setAttrValue(field.name, next);
              }}
            />
          );
        }

        if (control === "choice-chips") {
          return (
            <ChoiceChipsField
              key={field.name}
              label={fieldLabel}
              required={required}
              options={options}
              value={currentValue}
              variant={
                activeField.chipVariant === "filled" ? "filled" : "outline"
              }
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (control === "radio") {
          return (
            <RadioField
              key={field.name}
              label={radioLabel}
              required={required}
              options={
                options.length
                  ? options
                  : localizeOptionList(t, tipsKey, field.name, activeField.staticOptions || [])
              }
              value={currentValue}
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (isMultiDropdown) {
          return (
            <MultiDropdownField
              key={field.name}
              label={fieldLabel}
              required={required}
              options={options}
              value={currentValue}
              disabled={disabled}
              placeholder={
                disabled
                  ? t("mobile.publish.selectParentField")
                  : t("createAdWizard.selectOption")
              }
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (control === "switch") {
          const boolOptions = resolveOptions(field);
          const checkedValue =
            boolOptions.find((option) => isTruthyLike(option)) ||
            activeField.checkedValue ||
            t("createAdWizard.yes");
          const uncheckedValue =
            boolOptions.find((option) => option !== checkedValue) ||
            activeField.uncheckedValue ||
            t("createAdWizard.no");
          return (
            <SwitchAttrField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue}
              checkedValue={checkedValue}
              uncheckedValue={uncheckedValue}
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (isCombobox) {
          return (
            <ComboboxField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue || ""}
              disabled={disabled}
              placeholder={
                disabled
                  ? t("mobile.publish.selectParentField")
                  : t("createAdWizard.selectOption")
              }
              options={options}
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (control === "date-month") {
          return (
            <DateMonthField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue || ""}
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        if (control === "clearable-number" || control === "number") {
          return (
            <ClearableNumberField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue ?? ""}
              unit={activeField.unit}
              onChange={(next) => setAttrValue(field.name, next)}
            />
          );
        }

        // Fallback texte
        return (
          <ClearableNumberField
            key={field.name}
            label={fieldLabel}
            required={required}
            value={currentValue ?? ""}
            unit={activeField.unit}
            onChange={(next) => setAttrValue(field.name, next)}
          />
        );
      })}
    </View>
  );
}

/** Vérifie les champs obligatoires visibles. */
export function validateImmobilierAttributs(
  config,
  attributs = {},
  taxoAttributs = []
) {
  if (!config?.fields?.length) return { ok: true, missing: [] };
  const missing = [];
  config.fields.forEach((field) => {
    if (!isFieldVisible(field, attributs)) return;
    if (!isFieldRequiredWithTaxonomy(field, attributs, taxoAttributs)) return;
    const raw = attributs[field.name];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      const active = resolveVariantField(field, attributs);
      missing.push(active.label || field.label || field.name);
    }
  });
  return { ok: missing.length === 0, missing };
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  requiredHint: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
