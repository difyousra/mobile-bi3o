import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsSectionCard,
  SettingsListRow,
} from "../../components/settings/SettingsListRows";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SecuritySettingsScreen({ navigation }) {
  const { t } = useAppLanguage();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.accountSettings.security")}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionCard>
          <SettingsListRow
            label={t("mobile.settings.security.changePassword")}
            subtitle={t("mobile.settings.security.changePasswordHint")}
            onPress={() => navigation.navigate("ChangePassword")}
            isLast
          />
        </SettingsSectionCard>
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
  },
  content: {
    paddingBottom: 120,
  },
});
