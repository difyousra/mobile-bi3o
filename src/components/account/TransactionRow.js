import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function TransactionRow({ transaction }) {
  const isCredit = transaction.amount > 0;
  const amountText = `${isCredit ? "+" : ""}${formatPrice(Math.abs(transaction.amount))}`;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.type}>{transaction.type}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {transaction.label}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.date}>{transaction.date}</Text>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          {amountText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  left: { flex: 1 },
  type: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  right: { alignItems: "flex-end" },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  credit: { color: "#16A34A" },
  debit: { color: colors.primary },
});
