import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsIntro,
  SettingsSectionCard,
  SettingsListRow,
} from "../../components/settings/SettingsListRows";
import { LEGAL_COPY_FR } from "../../data/legal/legalCopy.fr";

const hub = LEGAL_COPY_FR.infoHub;

export default function LegalHubScreen({ navigation }) {
  const links = [
    { label: hub.about, route: "AboutBi3oo" },
    { label: hub.privacy, route: "PrivacyPolicy" },
    { label: hub.terms, route: "TermsOfUse" },
    {
      label: hub.bans,
      route: "TermsOfUse",
      params: { sectionId: "interdictions" },
    },
    {
      label: hub.contact,
      route: "LegalContact",
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title="Information légales"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{hub.h1}</Text>
        <SettingsIntro>{hub.intro}</SettingsIntro>

        <SettingsSectionCard>
          {links.map((item, index) => (
            <SettingsListRow
              key={item.label}
              label={item.label}
              onPress={() => navigation.navigate(item.route, item.params)}
              isLast={index === links.length - 1}
            />
          ))}
        </SettingsSectionCard>

        <View style={styles.teaserCard}>
          <Text style={styles.teaserTitle}>{hub.cguSectionTitle}</Text>
          <Text style={styles.teaserMeta}>{hub.cguUpdated}</Text>
          <Text style={styles.teaserBody}>{hub.cguTeaser}</Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("TermsOfUse")}
          >
            {hub.cguReadFull}
          </Text>
        </View>

        <View style={styles.teaserCard}>
          <Text style={styles.teaserTitle}>{hub.interdictionsTitle}</Text>
          <Text style={styles.teaserBody}>{hub.interdictionsTeaser}</Text>
          <Text
            style={styles.link}
            onPress={() =>
              navigation.navigate("TermsOfUse", {
                sectionId: "interdictions",
              })
            }
          >
            {hub.interdictionsReadFull}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: 120 },
  h1: {
    paddingHorizontal: 20,
    paddingTop: 20,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
  },
  teaserCard: {
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  teaserTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 6,
  },
  teaserMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  teaserBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
  },
  link: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
});
