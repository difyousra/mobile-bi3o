/**
 * Notifications système (bannière + push Expo).
 * - Foreground / background (JS vivant) : bannière via scheduleNotificationAsync
 * - App tuée : Expo Push Token → backend → exp.host
 */
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiClient } from "../api/client";
import {
  getCachedNotificationPreferences,
  isNotificationTypeAllowed,
  fetchNotificationPreferences,
} from "./notificationPreferencesService";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

if (isNative) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const ANDROID_CHANNEL = "bi3oo-default";

export async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: "Bi3oo",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#C90017",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function getNotificationPermissionStatus() {
  if (!isNative) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/** Demande la permission OS. Retourne true si accordée. */
export async function requestNotificationPermission() {
  if (!isNative) return false;
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status === "granted";
}

function resolveProjectId() {
  return (
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

/** Enregistre le token Expo auprès du backend (si disponible). */
export async function registerPushTokenWithBackend() {
  if (!isNative) return null;

  if (!Device.isDevice && Platform.OS !== "web") {
    // Simulateurs : pas de push distant, les bannières locales restent OK.
  }

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  await ensureAndroidChannel();

  const projectId = resolveProjectId();
  let token = null;
  try {
    const opts = projectId ? { projectId } : undefined;
    const res = await Notifications.getExpoPushTokenAsync(opts);
    token = res?.data ?? null;
  } catch {
    // Expo Go sans projectId / build sans credentials → pas de push distant.
    token = null;
  }

  if (!token) return null;

  try {
    await apiClient.post("/me/push-tokens", {
      token,
      platform: Platform.OS,
    });
  } catch {
    // ignore network
  }
  return token;
}

export async function unregisterPushToken(token) {
  if (!token) return;
  try {
    await apiClient.delete("/me/push-tokens", { data: { token } });
  } catch {
    // ignore
  }
}

function typeAllowedByPrefs(type) {
  return isNotificationTypeAllowed(type, getCachedNotificationPreferences());
}

/** Précharge les prefs API (bannières / push). */
export async function ensureNotificationPrefsLoaded() {
  try {
    await fetchNotificationPreferences();
  } catch {
    // ignore — cache défaut
  }
}

/**
 * Affiche une bannière système immédiate (haut d'écran).
 * Fonctionne app ouverte / en arrière-plan (processus JS vivant).
 */
export async function presentLocalBanner(notification) {
  if (!isNative || !notification) return;
  if (!typeAllowedByPrefs(notification.type)) return;

  const status = await getNotificationPermissionStatus();
  if (status !== "granted") return;

  await ensureAndroidChannel();

  const title =
    notification.title ||
    notification.titre ||
    "Bi3oo";
  const body =
    notification.excerpt ||
    notification.body ||
    notification.message ||
    "";

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: {
        notificationId: notification.id,
        type: notification.type,
        conversationId: notification.conversationId,
        annonceId: notification.annonceId,
        reservationId: notification.reservationId,
      },
      ...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL } : {}),
    },
    trigger: null,
  });
}
