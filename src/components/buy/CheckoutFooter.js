import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function CheckoutFooter({
  total,
  buttonLabel = "Pay Now",
  onPress,
  disabled,
}) {
  return (
    <View style={styles.footer}>
      <View style={styles.priceCol}>
        <Text style={styles.label}>Total Charge</Text>
        <Text style={styles.value}>{formatPrice(total)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, disabled && styles.btnDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.btnText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  priceCol: { flex: 1 },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  btn: {
    minWidth: 140,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});
