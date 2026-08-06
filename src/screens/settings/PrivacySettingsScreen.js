import { ScrollView, StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsIntro,
  SettingsSectionCard,
  SettingsSwitchRow,
  SettingsListRow,
} from "../../components/settings/SettingsListRows";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function PrivacySettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();
  const { t } = useAppLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.accountSettings.privacy")}
        onBack={() => navigation.goBack()}
      />
      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <SettingsIntro>{t("mobile.settings.privacy.intro")}</SettingsIntro>

          <SettingsSectionCard>
            <SettingsSwitchRow
              label={t("mobile.settings.privacy.profileVisible")}
              subtitle={t("mobile.settings.privacy.profileVisibleHint")}
              value={prefs.profileVisible}
              onValueChange={(v) => setPreference("profileVisible", v)}
            />
            <SettingsSwitchRow
              label={t("mobile.settings.privacy.showPhone")}
              subtitle={t("mobile.settings.privacy.showPhoneHint")}
              value={prefs.showPhoneOnAds}
              onValueChange={(v) => setPreference("showPhoneOnAds", v)}
            />
            <SettingsSwitchRow
              label={t("mobile.settings.privacy.personalization")}
              subtitle={t("mobile.settings.privacy.personalizationHint")}
              value={prefs.allowPersonalizedAds}
              onValueChange={(v) => setPreference("allowPersonalizedAds", v)}
              isLast
            />
          </SettingsSectionCard>

          <SettingsSectionCard style={styles.secondCard}>
            <SettingsListRow
              label={t("mobile.legal.privacy")}
              onPress={() => navigation.navigate("PrivacyPolicy")}
              isLast
            />
          </SettingsSectionCard>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: 120 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  secondCard: { marginTop: 16 },
});
