import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export default function FavoritesTabs({ tabs, activeId, onSelect }) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onSelect?.(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            hitSlop={8}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
            {isActive ? <View style={styles.indicator} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    paddingTop: 4,
    position: "relative",
    minHeight: 44,
    justifyContent: "center",
  },
  tabPressed: {
    opacity: 0.7,
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
