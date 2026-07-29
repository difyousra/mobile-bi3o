import { ScrollView, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { LEGAL_COPY_FR } from "../../data/legal/legalCopy.fr";

export default function LegalContactScreen({ navigation }) {
  const contact = LEGAL_COPY_FR.contact;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Contactez-nous"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{contact.h1}</Text>
        <Text style={styles.paragraph}>{contact.intro}</Text>
        <Text style={styles.label}>{contact.emailLabel}</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${contact.email}`)}
        >
          <Text style={styles.email}>{contact.email}</Text>
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
