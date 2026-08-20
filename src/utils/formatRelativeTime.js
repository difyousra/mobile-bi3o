/**
 * Date relative courte sans Intl.RelativeTimeFormat
 * (absent sur certains runtimes RN / Hermes).
 */
export function formatRelativeTime(value, locale = "fr") {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absMs = Math.abs(diffMs);
  const past = diffMs <= 0;
  const lang = String(locale || "fr").toLowerCase().startsWith("ar")
    ? "ar"
    : String(locale || "fr").toLowerCase().startsWith("en")
      ? "en"
      : "fr";

  const sec = Math.round(absMs / 1000);
  const min = Math.round(sec / 60);
  const hour = Math.round(min / 60);
  const day = Math.round(hour / 24);
  const month = Math.round(day / 30);
  const year = Math.round(day / 365);

  const labels = {
    fr: {
      justNow: "à l'instant",
      s: (n) => (past ? `il y a ${n} s` : `dans ${n} s`),
      m: (n) => (past ? `il y a ${n} min` : `dans ${n} min`),
      h: (n) => (past ? `il y a ${n} h` : `dans ${n} h`),
      d: (n) => (past ? `il y a ${n} j` : `dans ${n} j`),
      mo: (n) => (past ? `il y a ${n} mois` : `dans ${n} mois`),
      y: (n) => (past ? `il y a ${n} an${n > 1 ? "s" : ""}` : `dans ${n} an${n > 1 ? "s" : ""}`),
    },
    en: {
      justNow: "just now",
      s: (n) => (past ? `${n}s ago` : `in ${n}s`),
      m: (n) => (past ? `${n}m ago` : `in ${n}m`),
      h: (n) => (past ? `${n}h ago` : `in ${n}h`),
      d: (n) => (past ? `${n}d ago` : `in ${n}d`),
      mo: (n) => (past ? `${n}mo ago` : `in ${n}mo`),
      y: (n) => (past ? `${n}y ago` : `in ${n}y`),
    },
    ar: {
      justNow: "الآن",
      s: (n) => (past ? `منذ ${n} ث` : `خلال ${n} ث`),
      m: (n) => (past ? `منذ ${n} د` : `خلال ${n} د`),
      h: (n) => (past ? `منذ ${n} س` : `خلال ${n} س`),
      d: (n) => (past ? `منذ ${n} ي` : `خلال ${n} ي`),
      mo: (n) => (past ? `منذ ${n} شهر` : `خلال ${n} شهر`),
      y: (n) => (past ? `منذ ${n} سنة` : `خلال ${n} سنة`),
    },
  };

  const t = labels[lang] || labels.fr;

  if (sec < 10) return t.justNow;
  if (sec < 60) return t.s(sec);
  if (min < 60) return t.m(min);
  if (hour < 24) return t.h(hour);
  if (day < 30) return t.d(day);
  if (month < 12) return t.mo(Math.max(1, month));
  return t.y(Math.max(1, year));
}
