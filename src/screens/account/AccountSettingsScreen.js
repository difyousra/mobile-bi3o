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
import { useAppLanguage } from "../../i18n/LanguageProvider";

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
  const { t } = useAppLanguage();

  const settingsItems = [
    {
      id: "security",
      label: t("mobile.accountSettings.security"),
      route: "SecuritySettings",
    },
    {
      id: "privacy",
      label: t("mobile.accountSettings.privacy"),
      route: "PrivacySettings",
    },
    {
      id: "notifications",
      label: t("mobile.accountSettings.notifications"),
      route: "NotificationSettings",
    },
    {
      id: "lotDiscounts",
      label: t("mobile.accountSettings.lotDiscounts"),
      route: "LotDiscountsSettings",
    },
    {
      id: "display",
      label: t("mobile.accountSettings.display"),
      route: "DisplaySettings",
    },
    {
      id: "legal",
      label: t("mobile.accountSettings.legal"),
      route: "LegalHub",
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.accountSettings.title")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {settingsItems.map((item, index) => (
            <SettingsRow
              key={item.id}
              label={item.label}
              isLast={index === settingsItems.length - 1}
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
