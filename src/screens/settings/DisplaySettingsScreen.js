import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import SettingsScreenHeader from "../../components/settings/SettingsScreenHeader";
import {
  SettingsIntro,
  SettingsSectionCard,
  SettingsSwitchRow,
} from "../../components/settings/SettingsListRows";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const LANGUAGES = [
  { id: "fr", label: "Français" },
  { id: "ar", label: "العربية" },
  { id: "en", label: "English" },
];

export default function DisplaySettingsScreen({ navigation }) {
  const { prefs, ready, setPreference } = useUserPreferences();
  const { t, language, setLanguage } = useAppLanguage();

  const selectedLang = language || prefs.language || "fr";

  const onSelectLanguage = async (id) => {
    await setPreference("language", id);
    await setLanguage(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <SettingsScreenHeader
        title={t("mobile.display.title")}
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
          <SettingsIntro>{t("mobile.display.intro")}</SettingsIntro>

          <Text style={styles.sectionLabel}>{t("mobile.display.language")}</Text>
          <SettingsSectionCard>
            {LANGUAGES.map((lang, index) => {
              const selected = selectedLang === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.langRow,
                    index === LANGUAGES.length - 1 && styles.langRowLast,
                  ]}
                  onPress={() => onSelectLanguage(lang.id)}
                  activeOpacity={0.65}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={lang.label}
                >
                  <Text style={styles.langLabel}>{lang.label}</Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={colors.iconMuted}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </SettingsSectionCard>

          <Text style={styles.sectionLabel}>{t("mobile.display.lists")}</Text>
          <SettingsSectionCard>
            <SettingsSwitchRow
              label={t("mobile.display.compactLists")}
              subtitle={t("mobile.display.compactListsHint")}
              value={prefs.compactLists}
              onValueChange={(v) => setPreference("compactLists", v)}
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
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 20,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  langRowLast: {
    borderBottomWidth: 0,
  },
  langLabel: {
    fontSize: 16,
    color: colors.textHeading,
  },
});
