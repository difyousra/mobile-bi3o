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

export default function LotDiscountsSettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Réductions sur les lots"
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
            Lorsque vous achetez plusieurs articles chez un même vendeur, Bi3oo
            peut proposer une réduction sur le lot. Activez ou désactivez ces
            suggestions selon vos préférences.
          </SettingsIntro>

          <SettingsSectionCard>
            <SettingsSwitchRow
              label="Proposer des réductions sur les lots"
              subtitle="Afficher les offres de remise quand plusieurs articles sont concernés."
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
