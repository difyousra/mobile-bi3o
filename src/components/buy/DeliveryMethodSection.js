import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";

export default function DeliveryMethodSection({
  methods,
  selectedId,
  onSelect,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Delivery Method</Text>
      <View style={styles.list}>
        {methods.map((method) => {
          const active = method.id === selectedId;
          return (
            <TouchableOpacity
              key={method.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => onSelect(method.id)}
            >
              <Ionicons name="cube-outline" size={28} color={colors.navy} />
              <View style={styles.body}>
                <Text style={styles.label}>{method.label}</Text>
                <Text style={styles.eta}>{method.eta}</Text>
              </View>
              <Text style={styles.fee}>
                {method.fee === 0 ? "Free" : `+${formatPrice(method.fee)}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
  },
  list: { gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardActive: {
    borderColor: colors.navy,
    backgroundColor: "rgba(18, 25, 38, 0.03)",
  },
  body: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  eta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  fee: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
});
