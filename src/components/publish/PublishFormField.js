import { View, Text, TextInput, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function PublishFormField({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength = 200,
  hint,
  multiline = false,
  editable = true,
}) {
  const count = value?.length ?? 0;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {maxLength ? (
            <Text style={styles.counter}>
              {count} / {maxLength}
            </Text>
          ) : null}
        </View>
      ) : maxLength ? (
        <View style={styles.labelRow}>
          <View />
          <Text style={styles.counter}>
            {count} / {maxLength}
          </Text>
        </View>
      ) : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.19)"
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
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
  counter: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.navy,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textHeading,
    backgroundColor: colors.white,
  },
  inputMultiline: {
    height: 140,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(18, 25, 38, 0.5)",
    lineHeight: 14,
  },
});
