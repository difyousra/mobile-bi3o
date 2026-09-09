import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

/**
 * Menu ⋮ conversation — Bloquer / Signaler / Supprimer / Données personnelles.
 */
export default function ChatOverflowMenu({
  visible,
  onClose,
  onBlock,
  onReport,
  onDelete,
  onPersonalData,
}) {
  const { t } = useAppLanguage();

  const items = [
    {
      key: "block",
      label: t("mobile.messages.blockUser"),
      onPress: onBlock,
      danger: true,
    },
    {
      key: "report",
      label: t("mobile.messages.reportUser"),
      onPress: onReport,
      danger: false,
    },
    {
      key: "delete",
      label: t("mobile.messages.deleteConversation"),
      onPress: onDelete,
      danger: true,
    },
    {
      key: "personal",
      label: t("mobile.messages.personalData"),
      onPress: onPersonalData,
      danger: false,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.anchor}>
          <Pressable style={styles.menu} onPress={(e) => e.stopPropagation?.()}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.item,
                  index < items.length - 1 && styles.itemBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  // Laisse le modal se fermer avant l’action (Alert / autre modal).
                  setTimeout(() => item.onPress?.(), 80);
                }}
              >
                <Text
                  style={[styles.itemText, item.danger && styles.itemDanger]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  anchor: {
    position: "absolute",
    top: 56,
    right: 12,
    minWidth: 220,
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  itemText: {
    fontSize: 15,
    color: colors.textHeading,
  },
  itemDanger: {
    color: "#B91C1C",
  },
});
