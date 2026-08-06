import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function PrivacyPolicyScreen({ navigation }) {
  const { t } = useAppLanguage();
  const paragraphs = [
    t("legal.privacy.p1"),
    t("legal.privacy.p2"),
    t("legal.privacy.p3"),
    t("legal.privacy.p4"),
    t("legal.privacy.p5"),
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.legal.privacy")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{t("legal.privacy.h1")}</Text>
        {paragraphs.map((p) => (
          <Text key={p.slice(0, 40)} style={styles.paragraph}>
            {p}
          </Text>
        ))}
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
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
    marginBottom: 14,
  },
});
