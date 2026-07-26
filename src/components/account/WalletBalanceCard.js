import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function WalletBalanceCard({
  balance,
  balanceVisible,
  onToggleVisibility,
  updatedAt,
  onTransfer,
  onTopUp,
  onPressCard,
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPressCard ? 0.9 : 1}
      onPress={onPressCard}
      style={styles.card}
    >
      <Text style={styles.label}>My Balance</Text>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>
          {balanceVisible ? formatPrice(balance) : "••••••"}
        </Text>
        <TouchableOpacity onPress={onToggleVisibility} hitSlop={8}>
          <Ionicons
            name={balanceVisible ? "eye-outline" : "eye-off-outline"}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.updated}>Updated : {updatedAt}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.transferBtn} onPress={onTransfer}>
          <Text style={styles.transferText}>Transfer</Text>
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topUpBtn} onPress={onTopUp}>
          <Text style={styles.topUpText}>Top Up</Text>
          <Ionicons name="add" size={20} color={colors.textHeading} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 28,
    overflow: "hidden",
  },
  label: {
    fontSize: 16,
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  amount: {
    fontSize: 33,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.66,
  },
  updated: {
    fontSize: 13,
    color: colors.brandMuted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  transferBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  transferText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
  },
  topUpBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topUpText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textHeading,
  },
});
