import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthInput from "./AuthInput";
import SocialButton from "./SocialButton";
import { useAuth } from "../../context/AuthContext";
import { getApiHostLabel } from "../../config/api";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

function OrSeparator({ label }) {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>{label}</Text>
      <View style={styles.orLine} />
    </View>
  );
}

export default function SignInForm({
  onSignUpPress,
  onGooglePress,
  onForgotPasswordPress,
  googleLoading = false,
}) {
  const { login, isSubmitting } = useAuth();
  const { t } = useAppLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(
        `${t("authLogin.email")} / ${t("authLogin.passwordRequired")}`
      );
      return;
    }

    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message || t("authLogin.wrongCredentials"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <SocialButton
            label={t("mobile.auth.continueWithGoogle")}
            onPress={onGooglePress}
            loading={googleLoading}
            disabled={isSubmitting}
          />

          <OrSeparator label={t("mobile.auth.orLoginWith")} />

          <AuthInput
            placeholder={t("authLogin.emailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AuthInput
            placeholder={t("authLogin.passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
                accessibilityLabel={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21 * scaleX}
                  color={colors.iconMuted}
                />
              </TouchableOpacity>
            }
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {__DEV__ ? (
            <Text style={styles.apiHint}>API : {getApiHostLabel()}</Text>
          ) : null}

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              activeOpacity={0.7}
              onPress={() => setRememberMe((prev) => !prev)}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={18 * scaleX}
                color={rememberMe ? colors.primary : colors.iconMuted}
              />
              <Text style={styles.rememberText}>{t("authLogin.rememberMe")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onForgotPasswordPress}
            >
              <Text style={styles.forgotText}>
                {t("authLogin.forgotPasswordLink")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.disabled]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>{t("authLogin.submit")}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t("authLogin.noAccount")} </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onSignUpPress}>
              <Text style={styles.footerLink}>{t("authLogin.signUp")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    position: "absolute",
    top: -132 * scaleY,
    left: 24 * scaleX,
    right: 24 * scaleX,
    minHeight: 486 * scaleY,
    borderRadius: 10 * scaleX,
    backgroundColor: colors.white,
    paddingTop: 24 * scaleY,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 24 * scaleX,
    paddingBottom: 24 * scaleY,
    gap: 17 * scaleY,
  },
  error: {
    fontSize: 13 * scaleX,
    color: "#D32F2F",
    marginTop: -8 * scaleY,
    lineHeight: 18 * scaleX,
  },
  apiHint: {
    fontSize: 11 * scaleX,
    color: colors.textMuted,
    textAlign: "center",
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -4 * scaleY,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8 * scaleX,
  },
  rememberText: {
    fontSize: 13 * scaleX,
    color: colors.textMuted,
    fontWeight: "400",
  },
  forgotText: {
    fontSize: 13 * scaleX,
    color: colors.primary,
    fontWeight: "700",
  },
  primaryButton: {
    height: 50 * scaleY,
    borderRadius: 25 * scaleX,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4 * scaleY,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15 * scaleX,
    fontWeight: "600",
    color: colors.white,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8 * scaleY,
  },
  footerText: {
    fontSize: 13.5 * scaleX,
    color: colors.textMuted,
    fontWeight: "400",
  },
  footerLink: {
    fontSize: 13.5 * scaleX,
    color: colors.primary,
    fontWeight: "700",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16 * scaleX,
    marginTop: 2 * scaleY,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8EDF2",
  },
  orText: {
    fontSize: 14 * scaleX,
    fontWeight: "400",
    color: "#6F747B",
  },
});
