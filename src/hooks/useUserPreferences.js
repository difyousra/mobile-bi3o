import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@bi3oo/user_preferences_v1";

export const DEFAULT_PREFERENCES = {
  /** Confidentialité */
  profileVisible: true,
  showPhoneOnAds: false,
  allowPersonalizedAds: true,

  /** Notifications — aligné UI paramètres (mobile / e-mail) */
  notifPromoBannerVisible: true,
  notifMsgPush: true,
  notifMsgEmail: true,
  notifFavoritePush: true,
  notifPublishedPush: true,
  notifExpiryPush: true,
  notifNewsletterPush: false,
  notifNewsletterEmail: false,
  notifNewsPersonalizedPush: true,
  notifNewsPersonalizedEmail: true,

  /** Lots */
  lotDiscountsEnabled: true,
  /** Affichage */
  language: "fr",
  compactLists: false,
};

async function readPrefs() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

async function writePrefs(next) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await readPrefs();
      if (!cancelled) {
        setPrefs(loaded);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      writePrefs(next).catch(() => {});
      return next;
    });
  }, []);

  return { prefs, ready, setPreference };
}
