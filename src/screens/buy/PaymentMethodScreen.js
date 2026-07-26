import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BuyFlowHeader from "../../components/buy/BuyFlowHeader";
import { useCart } from "../../context/CartContext";
import { useCheckout } from "../../context/CheckoutContext";
import { formatPrice } from "../../utils/productMapper";
import { colors } from "../../theme/colors";

export default function PaymentMethodScreen({ navigation }) {
  const { paymentMethodId, setPaymentMethodId, paymentMethods } = useCheckout();

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <ScrollView contentContainerStyle={styles.content}>
          <BuyFlowHeader navigation={navigation} />

          <View style={styles.panel}>
            {paymentMethods.map((method) => {
              const active = paymentMethodId === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => setPaymentMethodId(method.id)}
                >
                  <Ionicons name={method.icon} size={24} color={colors.navy} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardLabel}>{method.label}</Text>
                    <Text style={styles.cardDetail}>{method.detail}</Text>
                  </View>
                  <View style={styles.radio}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={[styles.confirmBtn, !paymentMethodId && styles.confirmDisabled]}
        onPress={() => navigation.goBack()}
        disabled={!paymentMethodId}
      >
        <Text style={styles.confirmText}>Confirm Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
}

export function FinishPaymentScreen({ navigation }) {
  const { clearCart } = useCart();
  const { lastOrder, resetCheckout } = useCheckout();
  const order = lastOrder;

  const handleDone = () => {
    clearCart();
    resetCheckout();
    navigation.navigate("MainTabs", { screen: "Home" });
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.fallback}>Aucune commande récente</Text>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleDone}>
          <Text style={styles.confirmText}>Retour à l&apos;accueil</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { totals, address, paymentMethod, deliveryMethod } = order;

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <ScrollView contentContainerStyle={styles.finishContent}>
          <BuyFlowHeader navigation={navigation} />

          <View style={styles.promoCard}>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Update About Popular Product</Text>
              <Text style={styles.promoSub}>
                Stay update with out popular & high quality product
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="home-outline" size={24} color={colors.navy} />
              <View style={styles.addressBody}>
                <Text style={styles.addressLabel}>{address?.label}</Text>
                <Text style={styles.addressLine}>{address?.line}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <Text style={styles.methodBadge}>{paymentMethod?.label}</Text>
            </View>
            <View style={styles.methodCard}>
              <Ionicons
                name={paymentMethod?.icon ?? "cash-outline"}
                size={24}
                color={colors.navy}
              />
              <View style={styles.methodBody}>
                <Text style={styles.methodLabel}>{paymentMethod?.label}</Text>
                <Text style={styles.methodDetail}>{paymentMethod?.detail}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Detail</Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Bills</Text>
                <Text style={styles.detailValue}>
                  {formatPrice(totals.subtotal)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Shipment Fee</Text>
                <Text style={styles.detailValue}>
                  {totals.shipping === 0
                    ? "Free"
                    : formatPrice(totals.shipping)}
                </Text>
              </View>
              {totals.discount > 0 ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Voucher Discount ({totals.voucherLabel})
                  </Text>
                  <Text style={[styles.detailValue, styles.discount]}>
                    -{formatPrice(totals.discount)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.totalLabel}>Total Payment</Text>
                <Text style={styles.totalValue}>{formatPrice(totals.total)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Pay Attention :</Text>
            <Text style={styles.noticeText}>
              Please prepare the exact amount cash for smoother delivery. Our
              courier will contact you before delivery ({deliveryMethod?.label}).
              Need help? +213 555 123 456
            </Text>
          </View>

          <View style={styles.secureCard}>
            <Ionicons name="shield-checkmark" size={28} color="#16A34A" />
            <View style={styles.secureBody}>
              <Text style={styles.secureTitle}>Your payment is secure</Text>
              <Text style={styles.secureSub}>
                only collected once items delivered.
              </Text>
            </View>
          </View>

          <Text style={styles.orderId}>Commande #{order.id}</Text>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Messages")}
          >
            <Text style={styles.secondaryText}>Contacter le vendeur</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleDone}>
        <Text style={styles.confirmText}>Track Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topSafe: { flex: 1 },
  content: {
    paddingHorizontal: 19,
    paddingBottom: 100,
  },
  finishContent: {
    paddingHorizontal: 19,
    paddingBottom: 140,
  },
  panel: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.white,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(201, 0, 23, 0.04)",
  },
  cardBody: { flex: 1 },
  cardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  cardDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  confirmBtn: {
    marginHorizontal: 20,
    marginBottom: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDisabled: { opacity: 0.5 },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  fallback: {
    padding: 24,
    fontSize: 16,
    color: colors.textMuted,
  },
  promoCard: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: "center",
  },
  promoText: { maxWidth: "70%" },
  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 6,
  },
  promoSub: {
    fontSize: 12,
    color: "#CCE4FD",
    lineHeight: 18,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressBody: { flex: 1 },
  addressLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  addressLine: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  methodBadge: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  methodCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  methodBody: { flex: 1 },
  methodLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  methodDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  detailCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  discount: { color: colors.primary },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  noticeCard: {
    backgroundColor: "#FFF8E6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  secureCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    marginBottom: 12,
  },
  secureBody: { flex: 1 },
  secureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  secureSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderId: {
    textAlign: "center",
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 16,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
});
