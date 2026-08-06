import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { useAppLanguage } from "../i18n/LanguageProvider";

export default function MessagesScreen() {
  const { t } = useAppLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>{t("mobile.messages.title")}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  text: {
    color: colors.textPrimary,
  },
});
