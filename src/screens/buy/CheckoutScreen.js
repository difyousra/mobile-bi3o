import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../context/CartContext";
import { useCheckout } from "../../context/CheckoutContext";
import { showDevMessage } from "../../utils/devFeedback";
import BuyFlowHeader from "../../components/buy/BuyFlowHeader";
import CartLineItem from "../../components/buy/CartLineItem";
import RemoveProductModal from "../../components/buy/RemoveProductModal";
import DeliveryMethodSection from "../../components/buy/DeliveryMethodSection";
import CheckoutSectionCard from "../../components/buy/CheckoutSectionCard";
import DiscountVoucherSection from "../../components/buy/DiscountVoucherSection";
import CheckoutFooter from "../../components/buy/CheckoutFooter";
import { colors } from "../../theme/colors";

export default function CheckoutScreen({ navigation }) {
  const { items, updateQuantity, removeItem } = useCart();
  const {
    deliveryMethodId,
    setDeliveryMethodId,
    deliveryMethods,
    selectedAddress,
    paymentMethod,
    checkoutTotals,
    applyVoucher,
    clearVoucher,
    voucher,
    placeOrder,
  } = useCheckout();
  const [removeTarget, setRemoveTarget] = useState(null);

  const handlePay = () => {
    if (!selectedAddress) {
      Alert.alert(
        "Adresse requise",
        "Sélectionnez une adresse de livraison avant de payer.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Choisir",
            onPress: () => navigation.navigate("BuyAddress"),
          },
        ]
      );
      return;
    }
    if (!paymentMethod) {
      Alert.alert(
        "Paiement requis",
        "Sélectionnez une méthode de paiement avant de payer.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Choisir",
            onPress: () => navigation.navigate("BuyPayment"),
          },
        ]
      );
      return;
    }
    placeOrder();
    navigation.navigate("BuyFinish");
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <BuyFlowHeader navigation={navigation} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySub}>
            Parcourez l&apos;accueil pour ajouter des articles.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
          >
            <Text style={styles.ctaText}>Découvrir les produits</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <BuyFlowHeader navigation={navigation} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Item</Text>
            <Text style={styles.totalCount}>({checkoutTotals.count} Items)</Text>
          </View>

          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
              onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
              onRemovePress={() => setRemoveTarget(item)}
            />
          ))}

          <DeliveryMethodSection
            methods={deliveryMethods}
            selectedId={deliveryMethodId}
            onSelect={setDeliveryMethodId}
          />

          <CheckoutSectionCard
            title="Delivery Address"
            changeLabel="Change Address"
            onChangePress={() => navigation.navigate("BuyAddress")}
            emptyTitle="Select Address"
            emptySubtitle="Oops it looks like you haven't selected your address yet, you can also set it as default"
            filledTitle={selectedAddress?.label}
            filledSubtitle={selectedAddress?.line}
          />

          <CheckoutSectionCard
            title="Payment Method"
            changeLabel="Change Method"
            onChangePress={() => navigation.navigate("BuyPayment")}
            emptyTitle="Select Method"
            emptySubtitle="Oops it looks like you haven't selected your payment method yet, you can also set it as default."
            filledTitle={paymentMethod?.label}
            filledSubtitle={paymentMethod?.detail}
          />

          <DiscountVoucherSection
            appliedLabel={voucher?.label}
            onApply={(code) => {
              const result = applyVoucher(code);
              if (!result.ok) {
                showDevMessage("Code invalide", result.message);
              }
              return result;
            }}
            onClear={clearVoucher}
          />
        </ScrollView>
      </SafeAreaView>

      <CheckoutFooter
        total={checkoutTotals.total}
        buttonLabel="Pay Now"
        onPress={handlePay}
      />

      <RemoveProductModal
        visible={Boolean(removeTarget)}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) removeItem(removeTarget.id);
          setRemoveTarget(null);
        }}
      />
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
    paddingBottom: 130,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    color: colors.textMuted,
  },
  totalCount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  emptyWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
  },
  cta: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: colors.white,
    fontWeight: "600",
  },
});
