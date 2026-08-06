import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

function AudioBubble({ uri, isMe }) {
  const { t } = useAppLanguage();
  const soundRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [positionMs, setPositionMs] = useState(0);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      soundRef.current = null;
    };
  }, [uri]);

  const formatMs = (ms) => {
    const totalSec = Math.max(0, Math.floor(Number(ms) / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = async () => {
    try {
      if (playing && soundRef.current) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.playAsync();
        setPlaying(true);
        return;
      }

      setLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPositionMs(status.positionMillis || 0);
          setDurationMs(status.durationMillis || 0);
          if (status.didJustFinish) {
            setPlaying(false);
            setPositionMs(0);
            sound.setPositionAsync(0).catch(() => {});
          } else {
            setPlaying(status.isPlaying);
          }
        }
      );
      soundRef.current = sound;
      setPlaying(true);
    } catch {
      setPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const label =
    durationMs > 0
      ? formatMs(playing || positionMs > 0 ? positionMs : durationMs)
      : t("mobile.messages.voiceTitle");

  return (
    <TouchableOpacity
      style={styles.audioRow}
      onPress={togglePlay}
      activeOpacity={0.8}
      accessibilityLabel={playing ? t("mobile.messages.pauseA11y") : t("mobile.messages.playA11y")}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isMe ? colors.white : colors.textDark}
        />
      ) : (
        <Ionicons
          name={playing ? "pause" : "play"}
          size={22}
          color={isMe ? colors.white : colors.textDark}
        />
      )}
      <View style={styles.audioBars}>
        {[0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.65, 0.9, 0.5, 0.75].map(
          (h, i) => (
            <View
              key={i}
              style={[
                styles.audioBar,
                {
                  height: 8 + h * 14,
                  backgroundColor: isMe
                    ? "rgba(255,255,255,0.85)"
                    : "#1A1C1E",
                  opacity: playing ? 1 : 0.55,
                },
              ]}
            />
          )
        )}
      </View>
      <Text style={[styles.audioTime, isMe ? styles.textMe : styles.textThem]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MessageBubble({ message }) {
  const isMe = message.sender === "me";

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        {message.type === "image" && message.image ? (
          <View>
            <Image source={{ uri: message.image }} style={styles.image} />
            {message.text ? (
              <Text
                style={[
                  styles.text,
                  isMe ? styles.textMe : styles.textThem,
                  { marginTop: 8 },
                ]}
              >
                {message.text}
              </Text>
            ) : null}
          </View>
        ) : message.type === "audio" && message.audio ? (
          <AudioBubble uri={message.audio} isMe={isMe} />
        ) : (
          <Text style={[styles.text, isMe ? styles.textMe : styles.textThem]}>
            {message.text}
          </Text>
        )}
      </View>
      <View style={[styles.meta, isMe ? styles.metaMe : styles.metaThem]}>
        <Text style={styles.time}>{message.time}</Text>
        {isMe && message.read ? (
          <Ionicons name="checkmark-done" size={14} color="#3B82F6" />
        ) : null}
      </View>
    </View>
  );
}

export function DateSeparator({ label }) {
  const { t } = useAppLanguage();
  const displayLabel = label ?? t("mobile.messages.today");

  return (
    <View style={styles.dateWrap}>
      <Text style={styles.dateText}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
    maxWidth: "82%",
  },
  rowMe: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  rowThem: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    overflow: "hidden",
    padding: 12,
  },
  bubbleMe: {
    backgroundColor: "#1A1C1E",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMe: {
    color: colors.white,
  },
  textThem: {
    color: colors.textDark,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#F0F2F5",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 160,
  },
  audioBars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flex: 1,
    height: 28,
  },
  audioBar: {
    width: 3,
    borderRadius: 2,
  },
  audioTime: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    minWidth: 36,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaMe: {
    justifyContent: "flex-end",
  },
  metaThem: {
    justifyContent: "flex-start",
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  dateWrap: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
