import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function RemoveProductModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconRow}>
            <TouchableOpacity onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.trashCircle}>
              <Ionicons name="trash-outline" size={28} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={24} color="transparent" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Remove Product</Text>
          <Text style={styles.sub}>
            Are you sure to remove the product from cart?
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={onConfirm}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trashCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(201, 0, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textHeading,
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 49,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  removeBtn: {
    flex: 1,
    height: 49,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
});
