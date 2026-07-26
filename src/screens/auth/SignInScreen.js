import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "../../components/auth/AuthHeader";
import SignInForm from "../../components/auth/SignInForm";
import { colors } from "../../theme/colors";

export default function SignInScreen({
  onSignUpPress,
  onGooglePress,
  onForgotPasswordPress,
  onBackPress,
}) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title="Sign In"
        promptText="You don't have an account? "
        linkText="Sign up"
        onLinkPress={onSignUpPress}
        onBackPress={onBackPress}
      />
      <SignInForm
        onSignUpPress={onSignUpPress}
        onGooglePress={onGooglePress}
        onForgotPasswordPress={onForgotPasswordPress}
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
