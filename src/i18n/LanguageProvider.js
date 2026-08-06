import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  I18nManager,
  Platform,
  View,
} from "react-native";
import { I18nextProvider, useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n, { DEFAULT_LOCALE, normalizeLocale } from "./index";

const STORAGE_KEY = "@bi3oo/user_preferences_v1";

function applyDocumentDir(lng) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const code = normalizeLocale(lng);
  document.documentElement.setAttribute("lang", code);
  document.documentElement.setAttribute("dir", code === "ar" ? "rtl" : "ltr");
}

/**
 * Applique RTL natif. Un redémarrage peut être nécessaire hors web.
 * @returns {boolean} true si un redémarrage est recommandé
 */
export function applyNativeRtl(lng) {
  const wantRtl = normalizeLocale(lng) === "ar";
  applyDocumentDir(lng);

  if (Platform.OS === "web") return false;

  const needsFlip = I18nManager.isRTL !== wantRtl;
  if (!needsFlip) return false;

  try {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
  } catch {
    // ignore
  }
  return true;
}

export async function changeAppLanguage(lng, { announceRestart = true } = {}) {
  const code = normalizeLocale(lng);
  await i18n.changeLanguage(code);
  const needsRestart = applyNativeRtl(code);

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...prefs, language: code })
    );
  } catch {
    // ignore
  }

  if (needsRestart && announceRestart && Platform.OS !== "web") {
    Alert.alert(
      i18n.t("mobile.display.restartTitle"),
      i18n.t("mobile.display.restartBody")
    );
  }

  return { code, needsRestart };
}

async function loadStoredLanguage() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const prefs = JSON.parse(raw);
    return prefs?.language ? normalizeLocale(prefs.language) : null;
  } catch {
    return null;
  }
}

function LanguageBootstrap({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredLanguage();
      if (cancelled) return;
      const lng = stored || normalizeLocale(i18n.language) || DEFAULT_LOCALE;
      if (i18n.language !== lng) {
        await i18n.changeLanguage(lng);
      }
      applyNativeRtl(lng);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1 }} />;
  }

  return children;
}

export function LanguageProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageBootstrap>{children}</LanguageBootstrap>
    </I18nextProvider>
  );
}

/** Hook pratique : t() + langue + changeLanguage. */
export function useAppLanguage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const language = normalizeLocale(i18nInstance.language);
  const isRtl = language === "ar";

  const setLanguage = useCallback(async (lng) => {
    return changeAppLanguage(lng);
  }, []);

  return useMemo(
    () => ({ t, language, isRtl, setLanguage, i18n: i18nInstance }),
    [t, language, isRtl, setLanguage, i18nInstance]
  );
}
