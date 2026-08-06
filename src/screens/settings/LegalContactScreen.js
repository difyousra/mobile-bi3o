import { ScrollView, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const CONTACT_EMAIL = "contact@bi3oo.com";

export default function LegalContactScreen({ navigation }) {
  const { t } = useAppLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.legal.contact")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{t("legal.contact.h1")}</Text>
        <Text style={styles.paragraph}>{t("legal.contact.intro")}</Text>
        <Text style={styles.label}>{t("legal.contact.email")}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        >
          <Text style={styles.email}>{CONTACT_EMAIL}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  h1: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});
