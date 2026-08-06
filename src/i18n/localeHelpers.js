import { normalizeLocale } from "./index";

/** Map app language code to BCP-47 locale for Intl formatters. */
export function intlLocaleFromLanguage(language) {
  const code = normalizeLocale(language);
  if (code === "en") return "en-GB";
  if (code === "ar") return "ar-DZ";
  return "fr-FR";
}

/** Resolve Intl locale from explicit BCP-47 tag or app language code. */
export function resolveIntlLocale(localeOrLanguage) {
  if (!localeOrLanguage) return "fr-FR";
  const raw = String(localeOrLanguage);
  if (raw.includes("-")) return raw;
  return intlLocaleFromLanguage(raw);
}
