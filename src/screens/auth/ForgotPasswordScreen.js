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

export default function ForgotPasswordScreen({ onBackPress, onSuccess }) {
  const { forgotPassword, isSubmitting } = useAuth();
  const { t } = useAppLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError(t("mobile.auth.emailRequired"));
      return;
    }

    const result = await forgotPassword(email);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    Alert.alert(t("mobile.auth.emailSentTitle"), result.message, [
      { text: t("mobile.common.ok"), onPress: onSuccess },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AuthHeader
        title={t("auth.forgotPassword.title")}
        promptText={t("mobile.auth.backToPrefix")}
        linkText={t("mobile.auth.signInTitle")}
        onLinkPress={onBackPress}
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
            <Text style={styles.hint}>{t("auth.forgotPassword.subtitle")}</Text>

            <AuthInput
              placeholder={t("auth.forgotPassword.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabled]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t("auth.forgotPassword.submit")}
                </Text>
              )}
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
});
