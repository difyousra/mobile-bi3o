import { ScrollView, Text, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import { LEGAL_COPY_FR } from "../../data/legal/legalCopy.fr";

export default function AboutBi3ooScreen({ navigation }) {
  const about = LEGAL_COPY_FR.about;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Qui sommes-nous ?"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{about.heroTitle}</Text>
        <Text style={styles.lead}>{about.heroLead}</Text>

        <Text style={styles.h2}>{about.missionTitle}</Text>
        <Text style={styles.paragraph}>{about.missionP1}</Text>

        <Text style={styles.h2}>{about.pillarsTitle}</Text>
        {about.pillars.map((pillar) => (
          <View key={pillar.title} style={styles.pillar}>
            <Text style={styles.pillarTitle}>{pillar.title}</Text>
            <Text style={styles.paragraph}>{pillar.text}</Text>
          </View>
        ))}

        <Text style={styles.h2}>{about.wordsTitle}</Text>
        <Text style={styles.paragraph}>{about.wordsP1}</Text>
        <Text style={styles.paragraph}>{about.wordsP2}</Text>
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
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 24,
  },
  h2: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
    marginTop: 8,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textHeading,
    marginBottom: 12,
  },
  pillar: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textHeading,
    marginBottom: 4,
  },
});
