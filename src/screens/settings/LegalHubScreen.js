import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsIntro,
  SettingsSectionCard,
  SettingsListRow,
} from "../../components/settings/SettingsListRows";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function LegalHubScreen({ navigation }) {
  const { t } = useAppLanguage();

  const links = [
    { label: t("legal.infoHub.about"), route: "AboutBi3oo" },
    { label: t("legal.infoHub.privacy"), route: "PrivacyPolicy" },
    { label: t("legal.infoHub.terms"), route: "TermsOfUse" },
    {
      label: t("legal.infoHub.bans"),
      route: "TermsOfUse",
      params: { sectionId: "interdictions" },
    },
    {
      label: t("legal.infoHub.contact"),
      route: "LegalContact",
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.legal.hubTitle")}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.h1}>{t("legal.infoHub.h1")}</Text>
        <SettingsIntro>{t("legal.infoHub.intro")}</SettingsIntro>

        <SettingsSectionCard>
          {links.map((item, index) => (
            <SettingsListRow
              key={item.route + item.label}
              label={item.label}
              onPress={() => navigation.navigate(item.route, item.params)}
              isLast={index === links.length - 1}
            />
          ))}
        </SettingsSectionCard>

        <View style={styles.teaserCard}>
          <Text style={styles.teaserTitle}>
            {t("legal.infoHub.cguSectionTitle")}
          </Text>
          <Text style={styles.teaserMeta}>
            {t("legal.infoHub.cguUpdated", {
              date: t("mobile.legal.cguUpdatedDate"),
            })}
          </Text>
          <Text style={styles.teaserBody}>{t("legal.infoHub.cguTeaser")}</Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("TermsOfUse")}
          >
            {t("legal.infoHub.cguReadFull")}
          </Text>
        </View>

        <View style={styles.teaserCard}>
          <Text style={styles.teaserTitle}>
            {t("legal.infoHub.interdictionsTitle")}
          </Text>
          <Text style={styles.teaserBody}>
            {t("legal.infoHub.interdictionsTeaser")}
          </Text>
          <Text
            style={styles.link}
            onPress={() =>
              navigation.navigate("TermsOfUse", {
                sectionId: "interdictions",
              })
            }
          >
            {t("legal.infoHub.interdictionsReadFull")}
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
