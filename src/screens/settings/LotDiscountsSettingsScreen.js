import { ScrollView, StyleSheet, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsIntro,
  SettingsSectionCard,
  SettingsSwitchRow,
} from "../../components/settings/SettingsListRows";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function LotDiscountsSettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();
  const { t } = useAppLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.accountSettings.lotDiscounts")}
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
          <SettingsIntro>{t("mobile.settings.lotDiscounts.intro")}</SettingsIntro>

          <SettingsSectionCard>
            <SettingsSwitchRow
              label={t("mobile.settings.lotDiscounts.enableLabel")}
              subtitle={t("mobile.settings.lotDiscounts.enableHint")}
              value={prefs.lotDiscountsEnabled}
              onValueChange={(v) => setPreference("lotDiscountsEnabled", v)}
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
});
