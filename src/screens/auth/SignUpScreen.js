import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "../../components/auth/AuthHeader";
import SignUpForm from "../../components/auth/SignUpForm";
import { colors } from "../../theme/colors";

export default function SignUpScreen({
  onSignInPress,
  onRegisterSuccess,
  onGooglePress,
  onBackPress,
}) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title="Sign Up"
        promptText="Already have an account? "
        linkText="Log In"
        onLinkPress={onSignInPress}
        onBackPress={onBackPress}
      />
      <SignUpForm
        onRegisterSuccess={onRegisterSuccess}
        onGooglePress={onGooglePress}
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
