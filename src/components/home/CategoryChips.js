import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function CategoryChips({ categories, activeId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((category) => {
        const isActive = category.id === activeId;

        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => onSelect(category.id)}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={isActive ? colors.white : colors.textMuted}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingBottom: 18,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: "#1A1C1E",
    borderColor: "#1A1C1E",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.white,
    fontWeight: "600",
  },
});
