import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";

const SETTINGS_ITEMS = [
  {
    id: "security",
    label: "Connexion et sécurité",
    route: "SecuritySettings",
  },
  {
    id: "privacy",
    label: "Confidentialité",
    route: "PrivacySettings",
  },
  {
    id: "notifications",
    label: "Notifications",
    route: "NotificationSettings",
  },
  {
    id: "lotDiscounts",
    label: "Réductions sur les lots",
    route: "LotDiscountsSettings",
  },
  {
    id: "display",
    label: "Affichage",
    route: "DisplaySettings",
  },
  {
    id: "legal",
    label: "Information légales",
    route: "LegalHub",
  },
];

function SettingsRow({ label, onPress, isLast }) {
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
    </TouchableOpacity>
  );
}

export default function AccountSettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Mes paramètres"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {SETTINGS_ITEMS.map((item, index) => (
            <SettingsRow
              key={item.id}
              label={item.label}
              isLast={index === SETTINGS_ITEMS.length - 1}
              onPress={() => navigation.navigate(item.route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: 120,
  },
  list: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: colors.textHeading,
    paddingRight: 12,
  },
});
