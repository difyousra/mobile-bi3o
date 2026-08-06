/**
 * Resolve numbered tips from forms.deposit.subforms.* (tips1, tips2, …).
 * @param {import('i18next').TFunction} t
 * @param {string | undefined | null} tipsI18nKey e.g. "forms.deposit.subforms.vetements"
 * @param {number} [max=5]
 * @returns {string[]}
 */
export function resolveSubformTips(t, tipsI18nKey, max = 5) {
  if (!tipsI18nKey) return [];
  const tips = [];
  for (let i = 1; i <= max; i += 1) {
    const key = `${tipsI18nKey}.tips${i}`;
    const value = t(key, { defaultValue: "" });
    if (value && value !== key) tips.push(value);
  }
  return tips;
}

export function resolveSubformTipsTitle(t, tipsI18nKey) {
  if (!tipsI18nKey) return "";
  return t(`${tipsI18nKey}.tipsTitle`, {
    defaultValue: t("forms.deposit.photoGuide.tipsHeading"),
  });
}
