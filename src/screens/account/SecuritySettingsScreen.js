import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsSectionCard,
  SettingsListRow,
} from "../../components/settings/SettingsListRows";

export default function SecuritySettingsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Connexion et sécurité"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSectionCard>
          <SettingsListRow
            label="Changer le mot de passe"
            subtitle="Mettez à jour le mot de passe de votre compte Bi3oo."
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
