import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from "react-native";
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
        const iconName = category.icon || "grid-outline";

        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.chip, isActive && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => onSelect(category.id)}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={iconName}
                size={18}
                color={isActive ? colors.white : colors.primary}
              />
            </View>
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
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandLight,
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
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
