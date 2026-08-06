import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "../../components/auth/AuthHeader";
import SignUpForm from "../../components/auth/SignUpForm";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SignUpScreen({
  onSignInPress,
  onRegisterSuccess,
  onGooglePress,
  onBackPress,
  googleLoading = false,
}) {
  const { t } = useAppLanguage();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title={t("mobile.auth.signUpTitle")}
        promptText={t("mobile.auth.signUpPrompt")}
        linkText={t("mobile.auth.signInLink")}
        onLinkPress={onSignInPress}
        onBackPress={onBackPress}
      />
      <SignUpForm
        onRegisterSuccess={onRegisterSuccess}
        onGooglePress={onGooglePress}
        googleLoading={googleLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
