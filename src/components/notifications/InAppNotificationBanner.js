import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const AUTO_HIDE_MS = 5000;

/**
 * Bannière haut d'écran in-app (Expo Go + web).
 * Overlay non bloquante (pointerEvents box-none).
 */
export default function InAppNotificationBanner({
  notification,
  onPress,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef(null);

  useEffect(() => {
    if (!notification) return undefined;

    if (hideTimer.current) clearTimeout(hideTimer.current);
    translateY.setValue(-140);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -140,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDismiss?.();
      });
    }, AUTO_HIDE_MS);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification?._toastId ?? notification?.id]);

  if (!notification) return null;

  const title = notification.title || notification.titre || "Bi3oo";
  const body =
    notification.excerpt ||
    notification.body ||
    notification.message ||
    "";

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        Platform.OS === "web" ? styles.overlayWeb : null,
      ]}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrap,
          {
            paddingTop: Math.max(insets.top, 12),
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            onPress?.(notification);
            onDismiss?.();
          }}
          style={styles.card}
          accessibilityRole="button"
        >
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={18} color={colors.white} />
          </View>
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {body ? (
              <Text style={styles.body} numberOfLines={2}>
                {body}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  overlayWeb: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  wrap: {
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2B4B",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  body: {
    marginTop: 2,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 18,
  },
});
