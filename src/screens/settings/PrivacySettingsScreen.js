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

export default function PrivacySettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Confidentialité"
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
          <SettingsIntro>
            Gérez la visibilité de votre profil et le traitement de vos données
            personnelles. Pour en savoir plus, consultez la politique de
            confidentialité Bi3oo.
          </SettingsIntro>

          <SettingsSectionCard>
            <SettingsSwitchRow
              label="Profil visible"
              subtitle="Les autres utilisateurs peuvent voir votre profil public."
              value={prefs.profileVisible}
              onValueChange={(v) => setPreference("profileVisible", v)}
            />
            <SettingsSwitchRow
              label="Afficher mon téléphone"
              subtitle="Sur vos annonces, si vous avez renseigné un numéro."
              value={prefs.showPhoneOnAds}
              onValueChange={(v) => setPreference("showPhoneOnAds", v)}
            />
            <SettingsSwitchRow
              label="Personnalisation"
              subtitle="Autoriser Bi3oo à adapter l’expérience à partir de votre activité."
              value={prefs.allowPersonalizedAds}
              onValueChange={(v) => setPreference("allowPersonalizedAds", v)}
              isLast
            />
          </SettingsSectionCard>

          <SettingsSectionCard style={styles.secondCard}>
            <SettingsListRow
              label="Politique de confidentialité"
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
