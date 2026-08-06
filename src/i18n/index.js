import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import mobileFr from "./mobile.fr.json";
import mobileEn from "./mobile.en.json";
import mobileAr from "./mobile.ar.json";

export const SUPPORTED_LOCALES = ["fr", "en", "ar"];
export const DEFAULT_LOCALE = "fr";

export function normalizeLocale(raw) {
  if (raw == null) return DEFAULT_LOCALE;
  const s = String(raw).toLowerCase().split("-")[0];
  if (s === "ar" || s === "en" || s === "fr") return s;
  return DEFAULT_LOCALE;
}

function mergeMobile(webBundle, mobileBundle) {
  return {
    ...webBundle,
    mobile: mobileBundle,
  };
}

function deviceLocale() {
  try {
    const locales = Localization?.getLocales?.();
    const code = locales?.[0]?.languageCode;
    return normalizeLocale(code);
  } catch {
    return DEFAULT_LOCALE;
  }
}

const resources = {
  fr: { translation: mergeMobile(fr, mobileFr) },
  en: { translation: mergeMobile(en, mobileEn) },
  ar: { translation: mergeMobile(ar, mobileAr) },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    supportedLngs: SUPPORTED_LOCALES,
    lng: deviceLocale(),
    fallbackLng: {
      en: ["fr"],
      ar: ["fr"],
      default: [DEFAULT_LOCALE],
    },
    interpolation: { escapeValue: false },
    compatibilityJSON: "v4",
    returnNull: false,
  });
}

export default i18n;
