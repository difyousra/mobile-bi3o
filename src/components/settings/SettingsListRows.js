import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export function SettingsListRow({ label, onPress, isLast, subtitle }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.textWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
    </TouchableOpacity>
  );
}

export function SettingsSwitchRow({
  label,
  subtitle,
  value,
  onValueChange,
  isLast,
}) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.textWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.greyChip, true: colors.brandMuted }}
        thumbColor={value ? colors.primary : colors.white}
        ios_backgroundColor={colors.greyChip}
      />
    </View>
  );
}

export function SettingsSectionCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SettingsIntro({ children }) {
  return <Text style={styles.intro}>{children}</Text>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.textHeading,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  intro: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
