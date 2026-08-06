import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useChangePassword } from "../../hooks/useProfile";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function ChangePasswordScreen({ navigation }) {
  const { t } = useAppLanguage();
  const mutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async () => {
    if (!currentPassword.trim()) {
      Alert.alert(
        t("accountSettingsPage.sectionPassword"),
        t("authLogin.passwordRequired")
      );
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(
        t("accountSettingsPage.sectionPassword"),
        t("accountSettingsPage.errPwdLen")
      );
      return;
    }
    if (newPassword !== confirm) {
      Alert.alert(
        t("accountSettingsPage.sectionPassword"),
        t("accountSettingsPage.errPwdMatch")
      );
      return;
    }
    try {
      await mutation.mutateAsync({
        currentPassword: currentPassword.trim(),
        newPassword,
      });
      Alert.alert(t("mobile.common.success"), t("accountSettingsPage.toastPassword"), [
        { text: t("mobile.common.ok"), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        t("mobile.common.error"),
        error?.message ?? t("accountSettingsPage.errPwdChange")
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("settings.security.changePassword")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>{t("accountSettingsPage.currentPassword")}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t("accountSettingsPage.newPassword")}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("authRegister.minPassword")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t("accountSettingsPage.confirmPassword")}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t("accountSettingsPage.confirmPasswordPh")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnText}>
                {t("accountSettingsPage.updatePassword")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: { padding: 20, gap: 8 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textHeading,
  },
  btn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
});
