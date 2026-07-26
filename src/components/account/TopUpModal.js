import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { TOP_UP_PRESETS } from "../../data/mockProfile";

export default function TopUpModal({ visible, amount, onChangeAmount, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Top Up</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textHeading} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Top Up Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={String(amount)}
            onChangeText={onChangeAmount}
            keyboardType="number-pad"
            placeholder="1000"
            placeholderTextColor={colors.placeholder}
          />

          <View style={styles.presets}>
            {TOP_UP_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  Number(amount) === preset && styles.presetChipActive,
                ]}
                onPress={() => onChangeAmount(String(preset))}
              >
                <Text
                  style={[
                    styles.presetText,
                    Number(amount) === preset && styles.presetTextActive,
                  ]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmText}>Confirm Top Up</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textHeading,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
    marginBottom: 12,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.textHeading,
    textAlign: "center",
    marginBottom: 24,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  presetChip: {
    width: "23%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  presetChipActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  presetText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  presetTextActive: {
    color: colors.white,
  },
  confirmBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
