import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const OPTIONS = [
  {
    id: "offer",
    label: "Offre",
    icon: "pricetag-outline",
    recommended: true,
  },
  {
    id: "request",
    label: "Demande",
    icon: "search-outline",
    recommended: false,
  },
];

export default function AdTypeSelector({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Type d&apos;annonce</Text>
      <View style={styles.list}>
        {OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => onChange(option.id)}
              activeOpacity={0.8}
            >
              {option.recommended && selected ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>RECOMMANDÉ</Text>
                </View>
              ) : null}
              <Ionicons
                name={option.icon}
                size={18}
                color={colors.textHeading}
                style={styles.optionIcon}
              />
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  list: {
    gap: 16,
  },
  option: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(18, 25, 38, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    position: "relative",
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },
});
