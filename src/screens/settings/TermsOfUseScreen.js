import { useEffect, useRef } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import LegalDocumentBody from "../../components/settings/LegalDocumentBody";
import { CGU_SECTIONS_FR } from "../../data/legal/cguBundles.fr";
import { CGU_SECTIONS_EN } from "../../data/legal/cguBundles.en";
import { CGU_SECTIONS_AR } from "../../data/legal/cguBundles.ar";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function TermsOfUseScreen({ navigation, route }) {
  const { t, language } = useAppLanguage();
  const sectionId = route?.params?.sectionId;
  const scrollRef = useRef(null);
  const onlyInterdictions = sectionId === "interdictions";

  useEffect(() => {
    if (!onlyInterdictions) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [onlyInterdictions]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={
          onlyInterdictions
            ? t("mobile.legal.bans")
            : t("mobile.legal.terms")
        }
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!onlyInterdictions ? (
          <>
            <Text style={styles.h1}>{t("legal.terms.h1")}</Text>
            <Text style={styles.meta}>
              {t("legal.terms.updated", {
                date: t("mobile.legal.cguUpdatedDate"),
              })}
            </Text>
            <Text style={styles.intro}>{t("legal.terms.cguIntro")}</Text>
          </>
        ) : null}
        {(() => {
          const sections =
            language === "ar"
              ? CGU_SECTIONS_AR
              : language === "en"
                ? CGU_SECTIONS_EN
                : CGU_SECTIONS_FR;

          return (
            <LegalDocumentBody
              sections={sections}
              filterId={onlyInterdictions ? "interdictions" : undefined}
            />
          );
        })()}
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
    fontSize: 20,
    fontWeight: "700",
    color: colors.textHeading,
  },
  meta: {
    paddingHorizontal: 20,
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  intro: {
    paddingHorizontal: 20,
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    color: colors.textHeading,
  },
});
