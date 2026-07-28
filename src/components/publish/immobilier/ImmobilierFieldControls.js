import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { isTruthyLike } from "../../../features/annonces/utils/subcategoryFieldHelpers";

function FieldLabel({ label, required, unit }) {
  return (
    <View style={styles.labelRow}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {unit ? <Text style={styles.unit}>{unit}</Text> : null}
    </View>
  );
}

export function TypeCardsField({ label, required, options = [], value, onChange }) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <View style={styles.cardsRow}>
        {options.map((opt) => {
          const active = String(value || "").toLowerCase() === String(opt).toLowerCase();
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => onChange?.(opt)}
              activeOpacity={0.85}
            >
              <Text style={[styles.cardText, active && styles.cardTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function ChoiceChipsField({
  label,
  required,
  options = [],
  value,
  onChange,
  variant = "outline",
}) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <View style={styles.chipsRow}>
        {options.map((opt) => {
          const active = String(value || "") === String(opt);
          const filled = variant === "filled";
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                filled && styles.chipFilled,
                active && (filled ? styles.chipFilledActive : styles.chipActive),
              ]}
              onPress={() => onChange?.(opt)}
            >
              <Text
                style={[
                  styles.chipText,
                  active && (filled ? styles.chipTextFilledActive : styles.chipTextActive),
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function RadioField({ label, required, options = [], value, onChange }) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <View style={styles.radioCol}>
        {options.map((opt) => {
          const active = String(value || "") === String(opt);
          return (
            <TouchableOpacity
              key={opt}
              style={styles.radioRow}
              onPress={() => onChange?.(opt)}
            >
              <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                {active ? <View style={styles.radioInner} /> : null}
              </View>
              <Text style={styles.radioLabel}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function SwitchAttrField({
  label,
  required,
  value,
  checkedValue = "Oui",
  uncheckedValue = "Non",
  onChange,
}) {
  const checked = isTruthyLike(value) || String(value) === String(checkedValue);
  return (
    <View style={styles.switchRow}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Switch
        value={checked}
        onValueChange={(next) =>
          onChange?.(next ? checkedValue : uncheckedValue)
        }
        trackColor={{ true: colors.primary, false: colors.greyChip }}
      />
    </View>
  );
}

export function ClearableNumberField({
  label,
  required,
  value,
  onChange,
  unit,
  placeholder = "0",
}) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} unit={unit} />
      <View style={styles.numberRow}>
        <TextInput
          style={styles.numberInput}
          value={value != null ? String(value) : ""}
          onChangeText={(text) => onChange?.(text.replace(/[^\d.,]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="decimal-pad"
        />
        {value ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onChange?.("")}
          >
            <Ionicons name="close-circle" size={20} color={colors.iconMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function DateMonthField({ label, required, value, onChange }) {
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <TextInput
        style={styles.textInput}
        value={value != null ? String(value) : ""}
        onChangeText={onChange}
        placeholder="AAAA-MM"
        placeholderTextColor={colors.placeholder}
        maxLength={7}
        keyboardType="numbers-and-punctuation"
      />
      <Text style={styles.hint}>Format : AAAA-MM (ex. 2026-08)</Text>
    </View>
  );
}

function OptionsModal({
  visible,
  title,
  options,
  selected,
  multi,
  onClose,
  onSelect,
}) {
  const selectedSet = useMemo(() => {
    if (multi) {
      const list = Array.isArray(selected)
        ? selected
        : String(selected || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      return new Set(list);
    }
    return new Set(selected ? [String(selected)] : []);
  }, [multi, selected]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.navy} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {options.length === 0 ? (
              <Text style={styles.emptyOptions}>Aucune option disponible</Text>
            ) : (
              options.map((opt) => {
                const active = selectedSet.has(String(opt));
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => onSelect?.(opt, active)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
          {multi ? (
            <TouchableOpacity style={styles.modalDone} onPress={onClose}>
              <Text style={styles.modalDoneText}>Valider</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ComboboxField({
  label,
  required,
  value,
  options = [],
  onChange,
  placeholder = "Sélectionner",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text style={[styles.dropdownValue, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.iconMuted} />
      </TouchableOpacity>
      <OptionsModal
        visible={open}
        title={label}
        options={options}
        selected={value}
        multi={false}
        onClose={() => setOpen(false)}
        onSelect={(opt) => {
          onChange?.(opt);
          setOpen(false);
        }}
      />
    </View>
  );
}

export function MultiDropdownField({
  label,
  required,
  value,
  options = [],
  onChange,
  placeholder = "Sélectionner",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const selectedList = useMemo(() => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    return String(value || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const display =
    selectedList.length > 0 ? selectedList.join(", ") : placeholder;

  const toggle = (opt, wasActive) => {
    const next = wasActive
      ? selectedList.filter((item) => item !== String(opt))
      : [...selectedList, String(opt)];
    onChange?.(next.join(","));
  };

  return (
    <View style={styles.wrap}>
      <FieldLabel label={label} required={required} />
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Text
          style={[
            styles.dropdownValue,
            selectedList.length === 0 && styles.placeholder,
          ]}
          numberOfLines={2}
        >
          {display}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.iconMuted} />
      </TouchableOpacity>
      <OptionsModal
        visible={open}
        title={label}
        options={options}
        selected={selectedList}
        multi
        onClose={() => setOpen(false)}
        onSelect={toggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
    flex: 1,
  },
  required: { color: colors.primary },
  unit: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    minWidth: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  cardActive: {
    borderColor: colors.navy,
    backgroundColor: colors.brandLight,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
    textAlign: "center",
  },
  cardTextActive: { color: colors.navy },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  chipFilled: {
    backgroundColor: colors.surfaceMuted,
  },
  chipActive: {
    borderColor: colors.navy,
    backgroundColor: colors.brandLight,
  },
  chipFilledActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  chipTextActive: {
    color: colors.navy,
  },
  chipTextFilledActive: {
    color: colors.white,
  },
  radioCol: { gap: 10 },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 15,
    color: colors.textHeading,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingRight: 8,
  },
  numberInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textHeading,
  },
  clearBtn: { padding: 4 },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textHeading,
    backgroundColor: colors.white,
  },
  hint: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(18, 25, 38, 0.5)",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    gap: 8,
  },
  dropdownDisabled: { opacity: 0.5 },
  dropdownValue: {
    fontSize: 15,
    color: colors.textHeading,
    flex: 1,
  },
  placeholder: { color: colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  modalList: {
    paddingHorizontal: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
  },
  optionRowActive: {
    backgroundColor: colors.brandLight,
  },
  optionText: {
    fontSize: 15,
    color: colors.textHeading,
    flex: 1,
  },
  optionTextActive: {
    fontWeight: "700",
    color: colors.navy,
  },
  emptyOptions: {
    padding: 24,
    textAlign: "center",
    color: colors.textMuted,
  },
  modalDone: {
    marginHorizontal: 18,
    marginTop: 8,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
