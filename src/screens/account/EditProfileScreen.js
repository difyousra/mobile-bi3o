import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { useProfileMe } from "../../hooks/useProfile";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import * as profileService from "../../services/profileService";

function Field({ label, value, onChangeText, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

function TextAreaField({ label, value, onChangeText }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
        multiline
      />
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const { t } = useAppLanguage();
  const { user, refreshUser } = useAuth();
  const userId = user?.id;

  const { data: profileMe, isLoading: profileLoading, refetch } =
    useProfileMe();

  const base = useMemo(() => profileMe ?? user, [profileMe, user]);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    biographie: "",
    telephone: "",
    whatsapp: "",
    siteWeb: "",
    facebookUrl: "",
    instagramUrl: "",
  });

  useEffect(() => {
    if (!base) return;
    setForm({
      nom: base?.nom ?? "",
      prenom: base?.prenom ?? "",
      biographie: base?.biographie ?? "",
      telephone: base?.telephone ?? "",
      whatsapp: base?.whatsapp ?? "",
      siteWeb: base?.siteWeb ?? "",
      facebookUrl: base?.facebookUrl ?? "",
      instagramUrl: base?.instagramUrl ?? "",
    });
  }, [base]);

  const patchMutation = useMutation({
    mutationFn: async (payload) => {
      if (!userId) throw new Error("SESSION_INVALIDE");
      return profileService.patchAccountProfile(userId, payload);
    },
    onSuccess: async () => {
      await refreshUser?.();
      await refetch?.();
      Alert.alert(
        t("profilePublicUi.editTitle"),
        t("profilePublicUi.successSaved")
      );
      navigation.goBack();
    },
    onError: (e) => {
      Alert.alert(
        t("mobile.common.error"),
        e?.message ?? t("profilePublicUi.errorSave")
      );
    },
  });

  const handleSave = () => {
    if (!userId) {
      Alert.alert(
        t("profilePublicUi.editTitle"),
        t("mobile.account.sessionInvalid")
      );
      return;
    }
    patchMutation.mutate({
      nom: form.nom.trim() || null,
      prenom: form.prenom.trim() || null,
      biographie: form.biographie.trim() || null,
      telephone: form.telephone.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      siteWeb: form.siteWeb.trim() || null,
      facebookUrl: form.facebookUrl.trim() || null,
      instagramUrl: form.instagramUrl.trim() || null,
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.textHeading}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{t("profilePublicUi.editTitle")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {profileLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : null}

        <TextAreaField
          label={t("profilePublicUi.bio")}
          value={form.biographie}
          onChangeText={(v) => setForm((p) => ({ ...p, biographie: v }))}
        />

        <Field
          label={t("profilePublicUi.firstName")}
          value={form.prenom}
          onChangeText={(v) => setForm((p) => ({ ...p, prenom: v }))}
        />
        <Field
          label={t("profilePublicUi.lastName")}
          value={form.nom}
          onChangeText={(v) => setForm((p) => ({ ...p, nom: v }))}
        />
        <Field
          label={t("profilePublicUi.phone")}
          value={form.telephone}
          keyboardType="phone-pad"
          onChangeText={(v) => setForm((p) => ({ ...p, telephone: v }))}
        />
        <Field
          label={t("profilePublicUi.whatsapp")}
          value={form.whatsapp}
          keyboardType="phone-pad"
          onChangeText={(v) => setForm((p) => ({ ...p, whatsapp: v }))}
        />
        <Field
          label={t("profilePublicUi.website")}
          value={form.siteWeb}
          onChangeText={(v) => setForm((p) => ({ ...p, siteWeb: v }))}
        />
        <Field
          label={t("profilePublicUi.facebook")}
          value={form.facebookUrl}
          onChangeText={(v) =>
            setForm((p) => ({ ...p, facebookUrl: v }))
          }
        />
        <Field
          label={t("profilePublicUi.instagram")}
          value={form.instagramUrl}
          onChangeText={(v) =>
            setForm((p) => ({ ...p, instagramUrl: v }))
          }
        />

        <TouchableOpacity
          style={[
            styles.saveBtn,
            patchMutation.isPending && styles.saveDisabled,
          ]}
          onPress={handleSave}
          disabled={patchMutation.isPending}
        >
          <Text style={styles.saveText}>
            {patchMutation.isPending
              ? t("profilePublicUi.saving")
              : t("profilePublicUi.saveChanges")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: {
    padding: 18,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    gap: 12,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textDark,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: colors.white,
    fontWeight: "700",
  },
});
