/**
 * Localise step title / subtitle / label from web i18n keys (createAdWizard, forms.deposit).
 * Falls back to hardcoded config values when no mapping exists.
 */
import { translateSubcategoryDisplayName } from "./taxonomyLabels";

export function localizePublishStepCopy(stepConfig, t, subcategoryConfig) {
  if (!stepConfig) {
    return { title: "", subtitle: "", stepLabel: "" };
  }

  const tipsKey = subcategoryConfig?.tipsI18nKey;
  let { title, subtitle, stepLabel } = stepConfig;

  switch (stepConfig.type) {
    case "essentials":
      title = t("forms.deposit.step1Title");
      stepLabel = t("createAdWizard.steps.general");
      break;
    case "photos":
      title = tipsKey
        ? t(`${tipsKey}.step2Title`, {
            defaultValue: t("forms.deposit.photosLabel"),
          })
        : t("forms.deposit.photosLabel");
      stepLabel = t("forms.deposit.photosLabel");
      subtitle = t("mobile.publish.photosHint", {
        max: 10,
        defaultValue: "Ajoutez jusqu'à {{max}} photos pour mieux vendre.",
      });
      break;
    case "immobilierFields":
    case "vehicleFields":
    case "electroniqueFields":
    case "animauxFields":
    case "maisonJardinFields":
    case "loisirsFields":
    case "locationsVacancesFields":
    case "materielProfessionnelFields":
    case "modeFields":
    case "serviceFields":
    case "emploiFields":
    case "familleFields":
    case "jobFields":
    case "propertyFields":
    case "assetFields":
      title = t("createAdWizard.details.title");
      stepLabel = t("createAdWizard.steps.details");
      subtitle = t("createAdWizard.details.subtitle");
      if (subcategoryConfig?.label) {
        const subLabel = translateSubcategoryDisplayName(
          t,
          subcategoryConfig.id,
          subcategoryConfig.label
        );
        title = t("createAdWizard.details.titleWithSub", {
          label: subLabel,
        });
      }
      break;
    case "location":
      title = t("createAdWizard.location.title");
      subtitle = t("createAdWizard.location.subtitle");
      stepLabel = t("createAdWizard.steps.location");
      break;
    case "price":
      title = t("createAdWizard.payment.title");
      subtitle = t("createAdWizard.payment.subtitle");
      stepLabel = t("createAdWizard.steps.payment");
      break;
    case "preview":
      title = t("createAdWizard.summary.title");
      subtitle = t("createAdWizard.summary.subtitle");
      stepLabel = t("createAdWizard.steps.summary");
      break;
    case "success":
      title = t("mobile.publish.successTitle");
      subtitle = t("mobile.publish.successSubtitle");
      stepLabel = t("forms.deposit.publish");
      break;
    default:
      break;
  }

  return { title, subtitle, stepLabel };
}
