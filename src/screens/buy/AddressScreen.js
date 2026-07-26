import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PublishFormField from "../../components/publish/PublishFormField";
import BuyFlowHeader from "../../components/buy/BuyFlowHeader";
import CheckoutFooter from "../../components/buy/CheckoutFooter";
import { useCheckout } from "../../context/CheckoutContext";
import { colors } from "../../theme/colors";

export default function AddressScreen({ navigation }) {
  const {
    addresses,
    addressId,
    setAddressId,
    checkoutTotals,
  } = useCheckout();

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <ScrollView contentContainerStyle={styles.content}>
          <BuyFlowHeader navigation={navigation} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Item</Text>
            <Text style={styles.totalCount}>({checkoutTotals.count} Items)</Text>
          </View>

          <View style={styles.sheet}>
            <TouchableOpacity
              style={styles.addTopBtn}
              onPress={() => navigation.navigate("BuyAddAddress")}
            >
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.addTopText}>Add New Address</Text>
            </TouchableOpacity>

            {addresses.map((addr) => {
              const active = addressId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.card, active && styles.cardActive]}
                  onPress={() => setAddressId(addr.id)}
                >
                  <Ionicons
                    name={addr.icon ?? "location-outline"}
                    size={24}
                    color={colors.navy}
                  />
                  <View style={styles.cardBody}>
                    {addr.isDefault ? (
                      <Text style={styles.defaultBadge}>Default</Text>
                    ) : null}
                    <Text style={styles.cardLabel}>{addr.label}</Text>
                    <Text style={styles.cardLine}>{addr.line}</Text>
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

      <CheckoutFooter
        total={checkoutTotals.total}
        buttonLabel="Continue"
        onPress={() => navigation.goBack()}
        disabled={!addressId}
      />
    </View>
  );
}

export function AddAddressScreen({ navigation }) {
  const { addAddress } = useCheckout();
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!label.trim() || !line1.trim()) return;
    const line = [line1, city, postal].filter(Boolean).join(", ");
    addAddress({
      label: label.trim(),
      line,
      isDefault,
      icon: "home-outline",
    });
    navigation.goBack();
  };

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.topSafe}>
        <ScrollView contentContainerStyle={styles.formContent}>
          <BuyFlowHeader navigation={navigation} />

          <PublishFormField
            label="Address Label"
            value={label}
            onChangeText={setLabel}
            placeholder="My Home"
            maxLength={40}
          />
          <PublishFormField
            label="Street Address"
            value={line1}
            onChangeText={setLine1}
            placeholder="12 rue de la République"
            maxLength={120}
          />
          <PublishFormField
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="Alger"
            maxLength={60}
          />
          <PublishFormField
            label="Postal Code"
            value={postal}
            onChangeText={setPostal}
            placeholder="16000"
            maxLength={10}
          />

          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <View>
                <Text style={styles.mapTitle}>Pin Map Location</Text>
                <Text style={styles.mapSub}>
                  You haven&apos;t set your pin location yet
                </Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.changePin}>Change Pin</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={40} color={colors.textMuted} />
              <Text style={styles.mapPlaceholderText}>Carte à intégrer</Text>
            </View>
          </View>

          <View style={styles.defaultRow}>
            <Text style={styles.defaultLabel}>Set as default address</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity
        style={[styles.saveBtn, (!label || !line1) && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!label || !line1}
      >
        <Text style={styles.saveBtnText}>Save Address</Text>
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
    paddingBottom: 130,
  },
  formContent: {
    paddingHorizontal: 19,
    paddingBottom: 100,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "center",
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
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  addTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.navy,
    marginBottom: 4,
  },
  addTopText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(201, 0, 23, 0.04)",
  },
  cardBody: { flex: 1 },
  defaultBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  cardLine: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  mapCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.surfaceMuted,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  mapSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    maxWidth: 200,
  },
  changePin: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
  },
  defaultLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textHeading,
  },
  saveBtn: {
    margin: 20,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
