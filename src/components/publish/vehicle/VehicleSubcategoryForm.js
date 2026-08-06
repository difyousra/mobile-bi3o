import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import {
  useReferentielMarquesModeles,
  useSubcategoryAttributs,
} from "../../../hooks/useSubcategoryAttributs";
import {
  getDynamicModeleField,
  getMarquesList,
  getModelesForMarque,
  getValeursByNom,
  getValeursForField,
  resolveFieldAttrId,
  resolveFieldFormType,
  toUniqueOptions,
} from "../../../features/annonces/utils/taxoHelpers";
import {
  isFieldRequiredWithTaxonomy,
  isFieldVisible,
  isTruthyLike,
  resolveFieldControl,
  resolveVariantField,
} from "../../../features/annonces/utils/subcategoryFieldHelpers";
import {
  ChoiceChipsField,
  ClearableNumberField,
  ComboboxField,
  DateMonthField,
  MultiDropdownField,
  RadioField,
  SwitchAttrField,
  TypeCardsField,
} from "../immobilier/ImmobilierFieldControls";
import PublishFormField from "../PublishFormField";
import { colors } from "../../../theme/colors";
import { useAppLanguage } from "../../../i18n/LanguageProvider";
import {
  localizeOptionList,
  translateSubformFieldLabel,
} from "../../../i18n/subformFieldLabels";
import {
  resolveSubformTips,
  resolveSubformTipsTitle,
} from "../../../i18n/subformTips";

export default function VehicleSubcategoryForm({
  config,
  attributs = {},
  attributeAttrIds = {},
  attributeTypes = {},
  onAttributsChange,
  onMetaChange,
}) {
  const { t } = useAppLanguage();
  const { data: taxoAttributs = [], isLoading: taxoLoading } =
    useSubcategoryAttributs(config?.id);
  const { data: referentiel } = useReferentielMarquesModeles(
    Boolean(config?.loadReferentielMarques)
  );

  const brandField = useMemo(
    () => config?.fields?.find((field) => field.isBrand),
    [config]
  );
  const selectedBrand = brandField ? attributs[brandField.name] : "";
  const modelField = useMemo(
    () => config?.fields?.find((field) => field.dependsOnBrand),
    [config]
  );
  const dynamicModel = useMemo(
    () => getDynamicModeleField(taxoAttributs, selectedBrand, modelField?.attrId ?? null),
    [taxoAttributs, selectedBrand, modelField?.attrId]
  );
  const modelFieldName = dynamicModel.fieldKey || modelField?.name || "modele";
  const currentModeleValue =
    attributs[modelFieldName] || attributs.modele || "";

  const prevTriggerValuesRef = useRef({});
  const prevBrandRef = useRef(undefined);
  const onMetaChangeRef = useRef(onMetaChange);
  const onAttributsChangeRef = useRef(onAttributsChange);
  onMetaChangeRef.current = onMetaChange;
  onAttributsChangeRef.current = onAttributsChange;

  const setAttrValue = (fieldName, nextValue) => {
    const next = { ...attributs, [fieldName]: nextValue };
    onAttributsChangeRef.current?.(next);
  };

  useEffect(() => {
    if (!config?.fields?.length) return;
    const nextIds = { ...attributeAttrIds };
    const nextTypes = { ...attributeTypes };
    let changed = false;

    config.fields.forEach((field) => {
      const activeField = resolveVariantField(field, attributs);
      if (!isFieldVisible(activeField, attributs) && !field.dependsOnBrand) return;
      if (field.dependsOnBrand || field.useDynamicAttrId) {
        const formType = resolveFieldFormType(
          taxoAttributs,
          activeField,
          activeField.type || "TEXT"
        );
        if (nextTypes[field.name] !== formType) {
          nextTypes[field.name] = formType;
          changed = true;
        }
        return;
      }
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

    if (modelField) {
      const genericAttrId = modelField.attrId ?? "";
      const formType = resolveFieldFormType(
        taxoAttributs,
        modelField,
        modelField.type || "TEXT"
      );
      if (nextIds[modelField.name] !== genericAttrId) {
        nextIds[modelField.name] = genericAttrId;
        changed = true;
      }
      if (nextTypes[modelField.name] !== formType) {
        nextTypes[modelField.name] = formType;
        changed = true;
      }
      if (modelFieldName !== modelField.name) {
        if (nextIds[modelFieldName] !== genericAttrId) {
          nextIds[modelFieldName] = genericAttrId;
          changed = true;
        }
        if (nextTypes[modelFieldName] !== formType) {
          nextTypes[modelFieldName] = formType;
          changed = true;
        }
      }
    }

    if (changed) {
      onMetaChangeRef.current?.({
        attributeAttrIds: nextIds,
        attributeTypes: nextTypes,
      });
    }
  }, [
    attributeAttrIds,
    attributeTypes,
    attributs,
    config,
    modelField,
    modelFieldName,
    taxoAttributs,
  ]);

  useEffect(() => {
    if (!modelField) return;
    const previousBrand = prevBrandRef.current;
    const brandChanged = previousBrand !== undefined && previousBrand !== selectedBrand;
    prevBrandRef.current = selectedBrand;
    if (!brandChanged) return;

    const next = { ...attributs, [modelField.name]: "" };
    if (modelFieldName !== modelField.name) {
      next[modelFieldName] = "";
    }
    taxoAttributs.forEach((row) => {
      const normalized = String(row?.nom || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (normalized.includes("_modele")) {
        next[normalized] = "";
      }
    });
    onAttributsChangeRef.current?.(next);
  }, [attributs, modelField, modelFieldName, selectedBrand, taxoAttributs]);

  useEffect(() => {
    if (!config?.equipementVariant) return;
    if (attributs.categorie_equipement === config.equipementVariant) return;
    onAttributsChangeRef.current?.({
      ...attributs,
      categorie_equipement: config.equipementVariant,
    });
  }, [attributs, config?.equipementVariant]);

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

  const marquesFromReferentiel = useMemo(
    () => getMarquesList(referentiel),
    [referentiel]
  );

  const resolveOptions = (field) => {
    const activeField = resolveVariantField(field, attributs);
    if (field.isBrand) {
      const taxoBrands = getValeursByNom(taxoAttributs, field.taxoKey || "marque");
      return toUniqueOptions(
        marquesFromReferentiel.length
          ? marquesFromReferentiel
          : taxoBrands.length
            ? taxoBrands
            : field.staticOptions
      );
    }
    if (field.dependsOnBrand) {
      const referentielModeles = getModelesForMarque(referentiel, selectedBrand);
      if (Number(config?.id) === 1 && referentielModeles.length) {
        return toUniqueOptions(referentielModeles);
      }
      return toUniqueOptions(
        dynamicModel.options.length ? dynamicModel.options : referentielModeles
      );
    }
    if (activeField.staticOptions?.length) {
      if (activeField.preferStaticOptions) {
        return toUniqueOptions(activeField.staticOptions);
      }
      return toUniqueOptions(
        getValeursForField(taxoAttributs, activeField).length
          ? getValeursForField(taxoAttributs, activeField)
          : activeField.staticOptions
      );
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

  if (!config || config.noDetails) return null;

  const tips = resolveSubformTips(t, config.tipsI18nKey);
  const tipsTitle = resolveSubformTipsTitle(t, config.tipsI18nKey);

  return (
    <View style={styles.wrap}>
      {tips.length ? (
        <View style={styles.tipsBanner}>
          {tipsTitle ? <Text style={styles.tipsTitle}>{tipsTitle}</Text> : null}
          {tips.map((tip) => (
            <Text key={tip} style={styles.tipLine}>
              • {tip}
            </Text>
          ))}
        </View>
      ) : null}

      {taxoLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>
            {t("createAdWizard.details.loadingAttributes")}
          </Text>
        </View>
      ) : null}

      {!taxoLoading && hasRequiredFields ? (
        <Text style={styles.requiredHint}>
          {t("createAdWizard.details.requiredFieldsHint")}
        </Text>
      ) : null}

      {(config.fields || []).map((field) => {
        const activeField = resolveVariantField(field, attributs);
        if (!isFieldVisible(field, attributs)) return null;

        const resolvedFieldName = field.dependsOnBrand ? modelFieldName : field.name;
        const isDependentModel = field.dependsOnBrand;
        const isDependentField = Boolean(activeField.dependsOnField);
        const parentDependentValue = isDependentField
          ? attributs[activeField.dependsOnField]
          : "";
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
        const isMultiSelect = control === "multi-select";
        const options =
          isCombobox ||
          control === "type-cards" ||
          control === "choice-chips" ||
          control === "radio" ||
          isMultiDropdown ||
          isMultiSelect
            ? localizeOptionList(
                t,
                config.tipsI18nKey,
                field.name,
                resolveOptions(field)
              )
            : [];
        const disabled =
          (isDependentModel && !selectedBrand) ||
          (isDependentField && !String(parentDependentValue || "").trim());
        const currentValue = field.dependsOnBrand
          ? currentModeleValue
          : attributs[resolvedFieldName];
        const required = isFieldRequiredWithTaxonomy(
          field,
          attributs,
          taxoAttributs
        );
        const fieldLabel = translateSubformFieldLabel(
          t,
          config.tipsI18nKey,
          field.name,
          activeField.label
        );
        const radioLabel = activeField.radioPrompt
          ? translateSubformFieldLabel(
              t,
              config.tipsI18nKey,
              `${field.name}_prompt`,
              activeField.radioPrompt
            )
          : fieldLabel;

        if (control === "hidden") return null;

        if (control === "type-cards") {
          return (
            <TypeCardsField
              key={field.name}
              label={fieldLabel}
              required={required}
              options={options}
              value={currentValue}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
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
              variant={activeField.chipVariant === "filled" ? "filled" : "outline"}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
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
                  : localizeOptionList(
                      t,
                      config.tipsI18nKey,
                      field.name,
                      activeField.staticOptions || []
                    )
              }
              value={currentValue}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
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
                  ? t("createAdWizard.details.chooseBrandFirst")
                  : t("createAdWizard.selectOption")
              }
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
            />
          );
        }

        if (control === "switch") {
          const boolOptions = resolveOptions(field);
          const checkedValue =
            boolOptions.find((option) => isTruthyLike(option)) ||
            activeField.checkedValue ||
            "Oui";
          const uncheckedValue =
            boolOptions.find((option) => option !== checkedValue) ||
            activeField.uncheckedValue ||
            "Non";
          return (
            <SwitchAttrField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue}
              checkedValue={checkedValue}
              uncheckedValue={uncheckedValue}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
            />
          );
        }

        if (isCombobox) {
          return (
            <ComboboxField
              key={`${field.name}-${resolvedFieldName}`}
              label={fieldLabel}
              required={required}
              value={currentValue || ""}
              disabled={disabled}
              placeholder={
                disabled
                  ? t("createAdWizard.details.chooseBrandFirst")
                  : t("createAdWizard.selectOption")
              }
              options={options}
              onChange={(next) => {
                if (isDependentModel) {
                  const nextAttrs = {
                    ...attributs,
                    [resolvedFieldName]: next,
                  };
                  if (resolvedFieldName !== "modele") {
                    nextAttrs.modele = next;
                  }
                  onAttributsChangeRef.current?.(nextAttrs);
                  return;
                }
                setAttrValue(resolvedFieldName, next);
              }}
            />
          );
        }

        if (control === "date-month" || control === "date") {
          return (
            <DateMonthField
              key={field.name}
              label={fieldLabel}
              required={required}
              value={currentValue || ""}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
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
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
            />
          );
        }

        if (isMultiSelect) {
          return (
            <MultiDropdownField
              key={field.name}
              label={fieldLabel}
              required={required}
              options={options}
              value={currentValue}
              disabled={disabled}
              placeholder={t("createAdWizard.selectOption")}
              onChange={(next) => setAttrValue(resolvedFieldName, next)}
            />
          );
        }

        const placeholder = activeField.placeholder || fieldLabel;
        const multiline = control === "textarea";
        return (
          <PublishFormField
            key={field.name}
            label={fieldLabel}
            value={currentValue ?? ""}
            onChangeText={(next) => setAttrValue(resolvedFieldName, next)}
            placeholder={placeholder}
            maxLength={multiline ? 800 : 120}
            multiline={multiline}
          />
        );
      })}
    </View>
  );
}

export function validateVehicleAttributs(config, attributs = {}, taxoAttributs = []) {
  if (!config?.fields?.length || config.noDetails) return { ok: true, missing: [] };
  const missing = [];
  config.fields.forEach((field) => {
    if (!isFieldVisible(field, attributs)) return;
    if (!isFieldRequiredWithTaxonomy(field, attributs, taxoAttributs)) return;
    const key = field.dependsOnBrand ? "modele" : field.name;
    const raw = attributs[key] ?? attributs[field.name];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      const active = resolveVariantField(field, attributs);
      missing.push(active.label || field.label || field.name);
    }
  });
  return { ok: missing.length === 0, missing };
}

const styles = StyleSheet.create({
  wrap: { gap: 18 },
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
  tipsBanner: {
    gap: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(201, 0, 23, 0.06)",
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textHeading,
  },
  tipLine: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
