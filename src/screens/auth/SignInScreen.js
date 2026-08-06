import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "../../components/auth/AuthHeader";
import SignInForm from "../../components/auth/SignInForm";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function SignInScreen({
  onSignUpPress,
  onGooglePress,
  onForgotPasswordPress,
  onBackPress,
  googleLoading = false,
}) {
  const { t } = useAppLanguage();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title={t("mobile.auth.signInTitle")}
        promptText={t("mobile.auth.signInPrompt")}
        linkText={t("mobile.auth.signUpLink")}
        onLinkPress={onSignUpPress}
        onBackPress={onBackPress}
      />
      <SignInForm
        onSignUpPress={onSignUpPress}
        onGooglePress={onGooglePress}
        onForgotPasswordPress={onForgotPasswordPress}
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
