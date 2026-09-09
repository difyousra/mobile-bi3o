import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { useVoiceSearch } from "../../hooks/useVoiceSearch";
import { colors } from "../../theme/colors";

function errorMessageFor(t, code) {
  switch (code) {
    case "insecure-context":
      return t("voiceSearch.errors.insecureContext");
    case "not-supported":
      return t("voiceSearch.errors.notSupported");
    case "not-allowed":
      return t("voiceSearch.errors.notAllowed");
    case "not-found":
      return t("voiceSearch.errors.notFound");
    case "not-readable":
      return t("voiceSearch.errors.notReadable");
    case "security-error":
      return t("voiceSearch.errors.securityError");
    case "no-speech":
      return t("voiceSearch.errors.noSpeech");
    case "audio-capture":
      return t("voiceSearch.errors.audioCapture");
    case "network":
      return t("voiceSearch.errors.network");
    case "start-failed":
      return t("voiceSearch.errors.startFailed");
    default:
      return t("voiceSearch.errors.generic");
  }
}

/**
 * Bouton micro + overlays permission / écoute — aligné sur le VoiceSearch web.
 */
export default function VoiceSearchButton({
  onTranscript,
  onFinalResult,
  size = 20,
}) {
  const { t, language } = useAppLanguage();

  const {
    isSupported,
    isSecureContext,
    isListening,
    isRequestingPermission,
    showPermissionModal,
    interimTranscript,
    error,
    requestStart,
    confirmPermissionAndStart,
    dismissPermissionModal,
    cancel,
    clearError,
    retry,
  } = useVoiceSearch({
    language,
    onResult: onTranscript,
    onFinalResult,
  });

  const errorMessage = error ? errorMessageFor(t, error) : null;
  const canRetry = error && !["insecure-context", "not-supported"].includes(error);

  const handlePress = () => {
    if (isListening) {
      cancel();
      return;
    }
    if (isRequestingPermission) return;
    clearError();
    requestStart();
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[
          styles.micBtn,
          isListening && styles.micBtnActive,
          !isSupported && !isListening && styles.micBtnDisabled,
        ]}
        onPress={handlePress}
        disabled={isRequestingPermission}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={
          isListening
            ? t("voiceSearch.stop")
            : isRequestingPermission
              ? t("voiceSearch.requestingPermission")
              : t("voiceSearch.start")
        }
        accessibilityState={{ disabled: isRequestingPermission, busy: isRequestingPermission }}
      >
        {isRequestingPermission ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={size}
            color={
              !isSupported
                ? colors.iconMuted
                : isListening
                  ? colors.primary
                  : !isSecureContext
                    ? colors.iconMuted
                    : colors.textMuted
            }
          />
        )}
      </TouchableOpacity>

      {errorMessage && !isListening && !showPermissionModal ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Ionicons name="alert-circle-outline" size={14} color={colors.primary} />
          <Text style={styles.errorText} numberOfLines={3}>
            {errorMessage}
          </Text>
          {canRetry ? (
            <TouchableOpacity onPress={retry} hitSlop={8}>
              <Text style={styles.retryText}>{t("voiceSearch.retry")}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={clearError} hitSlop={8}>
            <Ionicons name="close" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={dismissPermissionModal}
      >
        <Pressable style={styles.overlay} onPress={dismissPermissionModal}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.panelClose}
              onPress={dismissPermissionModal}
              accessibilityLabel={t("voiceSearch.close")}
            >
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>

            <View style={styles.permissionIcon}>
              <Ionicons name="shield-checkmark-outline" size={36} color={colors.primary} />
            </View>

            <Text style={styles.panelTitle}>{t("voiceSearch.permission.title")}</Text>
            <Text style={styles.panelBody}>{t("voiceSearch.permission.description")}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={confirmPermissionAndStart}
              disabled={isRequestingPermission}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {isRequestingPermission
                  ? t("voiceSearch.requestingPermission")
                  : t("voiceSearch.permission.allow")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={dismissPermissionModal}>
              <Text style={styles.secondaryBtnText}>{t("voiceSearch.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isListening}
        transparent
        animationType="fade"
        onRequestClose={cancel}
      >
        <Pressable style={styles.overlay} onPress={cancel}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.panelClose}
              onPress={cancel}
              accessibilityLabel={t("voiceSearch.cancel")}
            >
              <Ionicons name="close" size={22} color={colors.textDark} />
            </TouchableOpacity>

            <View style={styles.pulseWrap}>
              <View style={[styles.pulseRing, styles.pulseRingOuter]} />
              <View style={[styles.pulseRing, styles.pulseRingInner]} />
              <View style={styles.micCircle}>
                <Ionicons name="mic" size={32} color={colors.white} />
              </View>
            </View>

            <Text style={styles.panelTitle}>{t("voiceSearch.listening")}</Text>
            <Text style={styles.transcript} accessibilityLiveRegion="polite">
              {interimTranscript || t("voiceSearch.hint")}
            </Text>

            <TouchableOpacity style={styles.secondaryBtn} onPress={cancel}>
              <Text style={styles.secondaryBtnText}>{t("voiceSearch.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    justifyContent: "center",
  },
  micBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  micBtnActive: {
    backgroundColor: colors.brandLight,
  },
  micBtnDisabled: {
    opacity: 0.45,
  },
  errorBanner: {
    position: "absolute",
    top: 36,
    right: 0,
    zIndex: 20,
    width: 260,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textDark,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18, 25, 38, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
  },
  panelClose: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 2,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  panelBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 18,
  },
  transcript: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    minHeight: 44,
    marginBottom: 16,
  },
  primaryBtn: {
    alignSelf: "stretch",
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    alignSelf: "stretch",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  pulseWrap: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  pulseRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.brandMuted,
  },
  pulseRingOuter: {
    width: 120,
    height: 120,
    opacity: 0.35,
  },
  pulseRingInner: {
    width: 92,
    height: 92,
    opacity: 0.55,
  },
  micCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
