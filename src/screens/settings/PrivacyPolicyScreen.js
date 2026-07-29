import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { LEGAL_COPY_FR } from "../../data/legal/legalCopy.fr";

export default function PrivacyPolicyScreen({ navigation }) {
  const { h1, paragraphs } = LEGAL_COPY_FR.privacy;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Confidentialité"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{h1}</Text>
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
