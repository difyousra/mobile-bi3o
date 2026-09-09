import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { useSignalAnnonce } from "../../hooks/useCatalog";

function getReportReasons(t) {
  return [
    t("mobile.product.reportReasonFraud"),
    t("mobile.product.reportReasonForbidden"),
    t("mobile.product.reportReasonPrice"),
    t("mobile.product.reportReasonPhotos"),
    t("mobile.product.reportReasonDuplicate"),
    t("mobile.product.reportReasonOther"),
  ];
}

/**
 * Signalement via l’annonce liée à la conversation (même API que la fiche produit).
 */
export default function ChatReportModal({ annonceId, visible, onClose }) {
  const { t } = useAppLanguage();
  const signal = useSignalAnnonce();
  const [selected, setSelected] = useState(null);
  const reasons = useMemo(() => getReportReasons(t), [t]);

  const handleSend = () => {
    if (!selected || !annonceId) return;
    signal.mutate(
      { id: annonceId, reason: selected },
      {
        onSuccess: () => {
          Alert.alert(
            t("mobile.product.reportSentTitle"),
            t("mobile.product.reportSentBody")
          );
          setSelected(null);
          onClose();
        },
        onError: () =>
          Alert.alert(t("mobile.common.error"), t("mobile.product.reportError")),
      }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("mobile.messages.reportModalTitle")}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={22} color={colors.textHeading} />
            </TouchableOpacity>
          </View>
          {reasons.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reason, selected === r && styles.reasonSelected]}
              onPress={() => setSelected(r)}
            >
              <Ionicons
                name={selected === r ? "radio-button-on" : "radio-button-off"}
                size={18}
                color={selected === r ? colors.primary : colors.textMuted}
              />
              <Text style={styles.reasonText}>{r}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.sendBtn, !selected && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!selected || signal.isPending || !annonceId}
          >
            <Text style={styles.sendBtnText}>
              {signal.isPending
                ? t("annonceDetail.sending", { defaultValue: "Envoi…" })
                : t("mobile.product.sendReport")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700", color: colors.textHeading },
  reason: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonSelected: { backgroundColor: "#FFF7ED" },
  reasonText: { flex: 1, fontSize: 14, color: colors.textHeading },
  sendBtn: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});
