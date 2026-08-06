import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatRecordingDuration } from "../../hooks/useVoiceRecorder";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const EMOJI_LIST = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😉", "😇", "🙂",
  "🤩", "😎", "🤔", "😮", "😢", "😭", "😡", "👍", "👎", "👏",
  "🙏", "💪", "❤️", "🔥", "✨", "🎉", "🏠", "🚗", "💰", "✅",
];

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  onAttachPress,
  onMicPress,
  onStopRecording,
  onCancelRecording,
  isRecording = false,
  recordingMs = 0,
  sendingMedia = false,
}) {
  const { t } = useAppLanguage();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const canSend = value.trim().length > 0;
  const showMic = !canSend && !isRecording;

  const insertEmoji = (emoji) => {
    onChangeText(`${value || ""}${emoji}`);
  };

  if (isRecording) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancelRecording}
          style={styles.sideButton}
          accessibilityLabel={t("messagesUi.voiceCancel")}
        >
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
        </TouchableOpacity>

        <View style={styles.recordingWrap}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>
            {formatRecordingDuration(recordingMs)}
          </Text>
          <Text style={styles.recordingHint}>{t("messagesUi.voiceRecording")}</Text>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.85}
          onPress={onStopRecording}
          accessibilityLabel={t("mobile.messages.sendVoice")}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      {emojiOpen ? (
        <View style={styles.emojiPanel}>
          <ScrollView
            horizontal={false}
            contentContainerStyle={styles.emojiGrid}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.emojiRow}>
              {EMOJI_LIST.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiBtn}
                  onPress={() => insertEmoji(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.container}>
        <View style={styles.inputWrap}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={() => setEmojiOpen((v) => !v)}
            accessibilityLabel={t("messagesUi.emoji")}
          >
            <Ionicons
              name={emojiOpen ? "happy" : "happy-outline"}
              size={22}
              color={emojiOpen ? colors.primary : colors.iconMuted}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={t("mobile.messages.inputPlaceholder")}
            placeholderTextColor={colors.placeholder}
            value={value}
            onChangeText={(text) => {
              onChangeText(text);
              if (emojiOpen) setEmojiOpen(false);
            }}
            multiline
            onFocus={() => setEmojiOpen(false)}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setEmojiOpen(false);
              onAttachPress?.();
            }}
            style={styles.iconButton}
            disabled={sendingMedia}
            accessibilityLabel={t("mobile.messages.attachPhoto")}
          >
            {sendingMedia ? (
              <ActivityIndicator size="small" color={colors.iconMuted} />
            ) : (
              <Ionicons name="image-outline" size={22} color={colors.iconMuted} />
            )}
          </TouchableOpacity>
        </View>

        {showMic ? (
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.85}
            onPress={onMicPress}
            accessibilityLabel={t("mobile.messages.voiceMessage")}
          >
            <Ionicons name="mic" size={22} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            activeOpacity={0.85}
            onPress={() => {
              setEmojiOpen(false);
              onSend?.();
            }}
            disabled={!canSend}
            accessibilityLabel={t("mobile.messages.send")}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
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
  iconButton: {
    paddingBottom: 4,
    paddingHorizontal: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 4,
    maxHeight: 100,
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
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },
  recordingWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAFAFA",
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#DC2626",
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
    fontVariant: ["tabular-nums"],
  },
  recordingHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emojiPanel: {
    maxHeight: 160,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emojiGrid: {
    paddingBottom: 4,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emojiBtn: {
    width: "12.5%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiText: {
    fontSize: 24,
  },
});
