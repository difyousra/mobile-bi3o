import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function FavoritesTabs({ tabs, activeId, onSelect }) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            activeOpacity={0.8}
            onPress={() => onSelect(tab.id)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive ? <View style={styles.indicator} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    position: "relative",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "center",
  },
  labelActive: {
    fontWeight: "700",
    color: colors.textDark,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: "10%",
    right: "10%",
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textDark,
  },
});
