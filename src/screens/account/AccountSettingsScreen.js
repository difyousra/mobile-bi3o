import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { showDevMessage } from "../../utils/devFeedback";
import { useAuth } from "../../context/AuthContext";

const ACCOUNT_ITEMS = [
  {
    id: "password",
    label: "Change Password",
    icon: "key-outline",
    route: "ChangePassword",
  },
  {
    id: "notifications",
    label: "Notification Setting",
    icon: "notifications-outline",
    route: "Notifications",
  },
  {
    id: "shipping",
    label: "Shipping Address",
    icon: "location-outline",
    route: "BuyAddress",
  },
  {
    id: "payment",
    label: "Payment Info",
    icon: "card-outline",
    route: "BuyPayment",
  },
  {
    id: "delete",
    label: "Delete Account",
    icon: "trash-outline",
    destructive: true,
  },
];

const APP_TOGGLES = [
  { id: "faceId", label: "Eneble Face ID For Log In" },
  { id: "push", label: "Eneble Push Notifications" },
  { id: "location", label: "Eneble Location Services" },
  { id: "darkMode", label: "Dark Mode" },
];

function SettingsRow({ icon, label, onPress, destructive, children }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={children ? 1 : 0.7}
      disabled={Boolean(children)}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={destructive ? colors.primary : colors.navy}
        />
        <Text style={[styles.rowLabel, destructive && styles.destructive]}>
          {label}
        </Text>
      </View>
      {children ?? (
        <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function AccountSettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const [toggles, setToggles] = useState({
    faceId: false,
    push: true,
    location: true,
    darkMode: false,
  });

  const setToggle = (id, value) => {
    setToggles((prev) => ({ ...prev, [id]: value }));
  };

  const handleAccountItem = (item) => {
    if (item.id === "delete") {
      Alert.alert(
        "Supprimer le compte",
        "Cette action est irréversible. Continuer ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () =>
              showDevMessage("Compte", "Suppression simulée."),
          },
        ]
      );
      return;
    }
    if (item.route) {
      navigation.navigate(item.route);
      return;
    }
    showDevMessage(item.label, "Paramètre à connecter avec l'API.");
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>Account & Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          {ACCOUNT_ITEMS.map((item) => (
            <SettingsRow
              key={item.id}
              icon={item.icon}
              label={item.label}
              destructive={item.destructive}
              onPress={() => handleAccountItem(item)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>App Settings</Text>
        <View style={styles.section}>
          {APP_TOGGLES.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Switch
                value={toggles[item.id]}
                onValueChange={(v) => setToggle(item.id, v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
          <Ionicons name="power-outline" size={22} color={colors.primary} />
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textHeading,
  },
  destructive: {
    color: colors.primary,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
});
