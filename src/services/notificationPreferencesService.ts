import { apiClient } from "../api/client";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "../types/notificationPreferences";

type ApiNotificationPrefs = Partial<Record<keyof NotificationPreferences, boolean>>;

let cached: NotificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };

function pickBool(
  raw: ApiNotificationPrefs | null | undefined,
  key: keyof NotificationPreferences,
  fallback: boolean
): boolean {
  const v = raw?.[key];
  return typeof v === "boolean" ? v : fallback;
}

function normalize(raw: ApiNotificationPrefs | null | undefined): NotificationPreferences {
  const base = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  if (!raw || typeof raw !== "object") return base;

  const merged: NotificationPreferences = {
    pushEnabled: pickBool(raw, "pushEnabled", base.pushEnabled),
    msgPush: pickBool(raw, "msgPush", base.msgPush),
    favoritePush: pickBool(raw, "favoritePush", base.favoritePush),
    publishedPush: pickBool(raw, "publishedPush", base.publishedPush),
    expiryPush: pickBool(raw, "expiryPush", base.expiryPush),
    newsletterPush: pickBool(raw, "newsletterPush", base.newsletterPush),
    personalizedPush: pickBool(raw, "personalizedPush", base.personalizedPush),
    activityPush: pickBool(raw, "activityPush", base.activityPush),
  };

  merged.pushEnabled = computePushEnabled(merged);
  return merged;
}

/** pushEnabled = au moins un canal mobile actif (comme le backend). */
export function computePushEnabled(prefs: NotificationPreferences): boolean {
  return Boolean(
    prefs.msgPush ||
      prefs.favoritePush ||
      prefs.publishedPush ||
      prefs.expiryPush ||
      prefs.newsletterPush ||
      prefs.personalizedPush ||
      prefs.activityPush
  );
}

export function getCachedNotificationPreferences(): NotificationPreferences {
  return cached;
}

export function setCachedNotificationPreferences(prefs: NotificationPreferences) {
  cached = normalize(prefs);
}

/** GET /me/notification-preferences */
export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<ApiNotificationPrefs>(
    "/me/notification-preferences"
  );
  const prefs = normalize(data);
  cached = prefs;
  return prefs;
}

/** PUT /me/notification-preferences */
export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<NotificationPreferences> {
  const payload = {
    msgPush: !!prefs.msgPush,
    favoritePush: !!prefs.favoritePush,
    publishedPush: !!prefs.publishedPush,
    expiryPush: !!prefs.expiryPush,
    newsletterPush: !!prefs.newsletterPush,
    personalizedPush: !!prefs.personalizedPush,
    activityPush: !!prefs.activityPush,
    pushEnabled: computePushEnabled(prefs),
  };
  const { data } = await apiClient.put<ApiNotificationPrefs>(
    "/me/notification-preferences",
    payload
  );
  const saved = normalize(data);
  cached = saved;
  return saved;
}

/** Respecte les préférences API pour l'affichage push / bannières. */
export function isNotificationTypeAllowed(
  type: string | undefined | null,
  prefs: NotificationPreferences = cached
): boolean {
  if (!prefs.pushEnabled) return false;
  const key = String(type || "").toUpperCase();
  if (key === "MESSAGE") return prefs.msgPush;
  if (key === "FAVORITE") return prefs.favoritePush;
  if (key === "AD_PUBLISHED") return prefs.publishedPush;
  if (key === "AD_FROM_FOLLOWED") {
    return prefs.publishedPush || prefs.personalizedPush;
  }
  if (key === "REMINDER") return prefs.expiryPush;
  if (
    key === "FOLLOW" ||
    key === "AD_VIEW" ||
    key === "WHATSAPP_CLICK" ||
    key === "RESERVATION_REQUEST" ||
    key === "RESERVATION_STATUS" ||
    key === "REPORT" ||
    key === "REPORT_RESOLVED" ||
    key === "FILE" ||
    key === "SYSTEM"
  ) {
    return prefs.activityPush;
  }
  return prefs.activityPush;
}
