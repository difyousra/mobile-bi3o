import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

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

export function DateSeparator({ label = "Today" }) {
  return (
    <View style={styles.dateWrap}>
      <Text style={styles.dateText}>{label}</Text>
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
