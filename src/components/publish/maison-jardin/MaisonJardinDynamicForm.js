import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSubcategoryAttributs } from "../../../hooks/useSubcategoryAttributs";
import {
  buildMaisonJardinFieldPlan,
  mapApiTypeToForm,
  normalizeMaisonJardinAttributes,
  resolveOuiNonPair,
  shouldUseMaisonJardinChips,
  isTypedProductKey,
} from "../../../features/annonces/utils/maisonJardinTaxonomyHelpers";
import { isMultiListeFieldName } from "../../../features/annonces/utils/subcategoryFieldHelpers";
import {
  ChoiceChipsField,
  ClearableNumberField,
  ComboboxField,
  DateMonthField,
  MultiDropdownField,
  SwitchAttrField,
} from "../immobilier/ImmobilierFieldControls";
import PublishFormField from "../PublishFormField";
import { colors } from "../../../theme/colors";

export default function MaisonJardinDynamicForm({
  config,
  attributs = {},
  attributeAttrIds = {},
  attributeTypes = {},
  onAttributsChange,
  onMetaChange,
}) {
  const { data: taxoAttributs = [], isLoading: taxoLoading } =
    useSubcategoryAttributs(config?.id);
  const onMetaChangeRef = useRef(onMetaChange);
  const onAttributsChangeRef = useRef(onAttributsChange);
  onMetaChangeRef.current = onMetaChange;
  onAttributsChangeRef.current = onAttributsChange;

  const normalizedAttributes = useMemo(
    () => normalizeMaisonJardinAttributes(taxoAttributs),
    [taxoAttributs]
  );

  const fieldPlan = useMemo(
    () =>
      buildMaisonJardinFieldPlan({
        normalizedAttributes,
        primaryKey: config?.primaryKey,
        linkedProductMode: config?.linkedProductMode || "none",
        attributs,
      }),
    [normalizedAttributes, config?.primaryKey, config?.linkedProductMode, attributs]
  );

  const {
    primaryAttr,
    activeLinkedProductKey,
    activeLinkedProductAttr,
    visibleAttributes,
    validationFields,
    hasTypedProductAttrs,
  } = fieldPlan;

  useEffect(() => {
    const nextIds = {};
    const nextTypes = {};
    normalizedAttributes.forEach((attr) => {
      if (!attr?.id || !attr?.key) return;
      nextIds[attr.key] = Number(attr.id);
      nextTypes[attr.key] = mapApiTypeToForm(attr.type);
    });

    const sameIds = JSON.stringify(nextIds) === JSON.stringify(attributeAttrIds || {});
    const sameTypes = JSON.stringify(nextTypes) === JSON.stringify(attributeTypes || {});
    if (sameIds && sameTypes) return;

    onMetaChangeRef.current?.({
      attributeAttrIds: nextIds,
      attributeTypes: nextTypes,
      taxonomyValidationFields: validationFields,
      taxonomyAttributesResolved: true,
    });
  }, [attributeAttrIds, attributeTypes, normalizedAttributes, validationFields]);

  useEffect(() => {
    if (!hasTypedProductAttrs) return;
    const next = { ...attributs };
    let changed = false;
    normalizedAttributes.forEach((attr) => {
      if (!isTypedProductKey(attr.key)) return;
      if (!activeLinkedProductKey || attr.key !== activeLinkedProductKey) {
        if (next[attr.key]) {
          next[attr.key] = "";
          changed = true;
        }
      }
    });
    if (changed) onAttributsChangeRef.current?.(next);
  }, [activeLinkedProductKey, attributs, hasTypedProductAttrs, normalizedAttributes]);

  const setAttrValue = (key, nextValue) => {
    onAttributsChangeRef.current?.({ ...attributs, [key]: nextValue });
  };

  const renderAttr = (attr, { labelOverride, disabled, isPrimary = false } = {}) => {
    if (!attr) return null;
    const label = labelOverride || attr.name || attr.key;
    const currentValue = attributs?.[attr.key] || "";
    const formType = mapApiTypeToForm(attr.type);
    const isList = attr.type === "LISTE" || attr.values.length > 0;

    if (isList) {
      const livraisonPair = !disabled ? resolveOuiNonPair(attr.values) : null;
      if (livraisonPair) {
        return (
          <SwitchAttrField
            key={attr.id}
            label={label}
            required={attr.required}
            value={currentValue}
            checkedValue={livraisonPair.oui}
            uncheckedValue={livraisonPair.non}
            onChange={(next) => setAttrValue(attr.key, next)}
          />
        );
      }

      if (shouldUseMaisonJardinChips(attr, { isPrimary })) {
        return (
          <ChoiceChipsField
            key={attr.id}
            label={label}
            required={attr.required}
            options={attr.values}
            value={currentValue}
            variant={isPrimary ? "filled" : "outline"}
            onChange={(next) => setAttrValue(attr.key, next)}
          />
        );
      }

      if (isMultiListeFieldName(attr.key) || isMultiListeFieldName(attr.name)) {
        return (
          <MultiDropdownField
            key={attr.id}
            label={label}
            required={attr.required}
            options={attr.values}
            value={currentValue}
            disabled={disabled}
            placeholder={disabled ? "Sélectionnez d'abord le type" : "Sélectionner"}
            onChange={(next) => setAttrValue(attr.key, next)}
          />
        );
      }

      return (
        <ComboboxField
          key={attr.id}
          label={label}
          required={attr.required}
          value={currentValue}
          disabled={disabled}
          placeholder={disabled ? "Sélectionnez d'abord le type" : "Sélectionner"}
          options={attr.values}
          onChange={(next) => setAttrValue(attr.key, next)}
        />
      );
    }

    if (formType === "NUMBER") {
      return (
        <ClearableNumberField
          key={attr.id}
          label={label}
          required={attr.required}
          value={currentValue}
          placeholder={label}
          onChange={(next) => setAttrValue(attr.key, next)}
        />
      );
    }

    if (formType === "DATE") {
      return (
        <DateMonthField
          key={attr.id}
          label={label}
          required={attr.required}
          value={currentValue}
          onChange={(next) => setAttrValue(attr.key, next)}
        />
      );
    }

    return (
      <PublishFormField
        key={attr.id}
        label={label}
        value={currentValue}
        onChangeText={(next) => setAttrValue(attr.key, next)}
        placeholder={label}
      />
    );
  };

  if (!config) return null;

  return (
    <View style={styles.wrap}>
      {taxoLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des attributs…</Text>
        </View>
      ) : null}

      {!taxoLoading ? (
        <Text style={styles.requiredHint}>
          Les champs marqués * sont obligatoires.
        </Text>
      ) : null}

      {renderAttr(primaryAttr, { isPrimary: true })}
      {primaryAttr && activeLinkedProductAttr
        ? renderAttr(activeLinkedProductAttr, {
            labelOverride: activeLinkedProductAttr.name || "Produit",
          })
        : null}
      {visibleAttributes.map((attr) => renderAttr(attr))}
    </View>
  );
}

export { validateMaisonJardinAttributs } from "../../../features/annonces/utils/maisonJardinTaxonomyHelpers";

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
});
