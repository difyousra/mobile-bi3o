import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "../../components/auth/AuthHeader";
import AuthInput from "../../components/auth/AuthInput";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function VerifyEmailScreen({ email, onSuccess, onBackPress }) {
  const { verifyEmail, resendOtp, isSubmitting } = useAuth();
  const { t } = useAppLanguage();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    if (!code.trim()) {
      setError(t("authVerify.codeRequired"));
      return;
    }

    const result = await verifyEmail(email, code);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    Alert.alert(
      t("mobile.auth.emailVerifiedTitle"),
      result.message ?? t("authVerify.verified"),
      [{ text: t("mobile.common.ok"), onPress: onSuccess }]
    );
  };

  const handleResend = async () => {
    setError("");
    const result = await resendOtp(email);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    Alert.alert(
      t("mobile.auth.codeResentTitle"),
      result.message ?? t("authVerify.resent")
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title={t("authVerify.title")}
        promptText={t("authVerify.subtitle")}
        linkText={email}
        onBackPress={onBackPress}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.hint}>{t("mobile.auth.verifyHint")}</Text>

            <AuthInput
              placeholder={t("authVerify.otpPlaceholder")}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabled]}
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t("authVerify.submit")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleResend}
              disabled={isSubmitting}
            >
              <Text style={styles.linkText}>{t("authVerify.resend")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  card: {
    marginTop: -132,
    marginHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.white,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scrollContent: {
    gap: 16,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  error: {
    fontSize: 13,
    color: "#D32F2F",
  },
  primaryButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
});
