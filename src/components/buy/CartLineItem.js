import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function CartLineItem({
  item,
  onDecrease,
  onIncrease,
  onRemovePress,
}) {
  const variantParts = [
    item.selectedStorage,
    item.selectedColor,
    item.subtitle,
  ].filter(Boolean);

  return (
    <View style={styles.lineItem}>
      <View style={styles.thumbWrap}>
        <Image source={{ uri: item.image }} style={styles.thumb} />
      </View>
      <View style={styles.lineBody}>
        <Text style={styles.lineTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {variantParts.length > 0 ? (
          <View style={styles.metaRow}>
            {variantParts.slice(0, 2).map((part, index) => (
              <Text key={`${part}-${index}`} style={styles.metaText}>
                {part}
                {index < Math.min(variantParts.length, 2) - 1 ? " · " : ""}
              </Text>
            ))}
          </View>
        ) : null}
        <View style={styles.qtyRow}>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
              <Ionicons name="remove" size={12} color={colors.navy} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
              <Ionicons name="add" size={12} color={colors.navy} />
            </TouchableOpacity>
          </View>
          <Text style={styles.lineTotal}>
            {formatPrice((item.price ?? item.priceDa ?? 0) * item.quantity)}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onRemovePress} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  lineItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },
  thumb: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  lineBody: { flex: 1 },
  lineTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
});
