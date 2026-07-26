import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ChatInput({ value, onChangeText, onSend, onAttachPress }) {
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrap}>
        <TouchableOpacity activeOpacity={0.7} style={styles.emojiButton}>
          <Ionicons name="happy-outline" size={22} color={colors.iconMuted} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Write your message here"
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAttachPress}
          style={styles.attachButton}
        >
          <Ionicons name="attach" size={22} color={colors.iconMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        activeOpacity={0.85}
        onPress={onSend}
        disabled={!canSend}
      >
        <Ionicons name="send" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: 4,
  },
  emojiButton: {
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 4,
    maxHeight: 100,
  },
  attachButton: {
    paddingBottom: 4,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1A1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
