import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PublishStepLayout from "../../components/publish/PublishStepLayout";
import PublishFormField from "../../components/publish/PublishFormField";
import PublishPhotoGrid from "../../components/publish/PublishPhotoGrid";
import PublishDropdownField from "../../components/publish/PublishDropdownField";
import ImmobilierSubcategoryForm, {
  validateImmobilierAttributs,
} from "../../components/publish/immobilier/ImmobilierSubcategoryForm";
import VehicleSubcategoryForm, {
  validateVehicleAttributs,
} from "../../components/publish/vehicle/VehicleSubcategoryForm";
import { getVehicleSubcategoryConfig } from "../../features/annonces/config/vehicleSubcategories";
import { getElectroniqueSubcategoryConfig } from "../../features/annonces/config/electroniqueSubcategories";
import { getAnimauxSubcategoryConfig } from "../../features/annonces/config/animauxSubcategories";
import { getMaisonJardinSubcategoryConfig } from "../../features/annonces/config/maisonJardinSubcategories";
import { getLoisirsSubcategoryConfig } from "../../features/annonces/config/loisirsSubcategories";
import { getLocationsVacancesSubcategoryConfig } from "../../features/annonces/config/locationsVacancesSubcategories";
import { getMaterielProfessionnelSubcategoryConfig } from "../../features/annonces/config/materielProfessionnelSubcategories";
import { getModeSubcategoryConfig } from "../../features/annonces/config/modeSubcategories";
import { getServiceSubcategoryConfig } from "../../features/annonces/config/serviceSubcategories";
import { getEmploiSubcategoryConfig } from "../../features/annonces/config/emploiSubcategories";
import { getFamilleSubcategoryConfig } from "../../features/annonces/config/familleSubcategories";
import { getImmobilierSubcategoryConfig } from "../../features/annonces/config/immobilierSubcategories";
import { getSubcategoryFormConfig } from "../../features/annonces/config/subcategoryFormRegistry";
import { generateAnnonceDescription } from "../../features/annonces/utils/generateAnnonceDescription";
import { useSubcategoryAttributs } from "../../hooks/useSubcategoryAttributs";
import {
  BOOST_OPTIONS,
  PREVIEW_IMAGE,
  PUBLISH_TOTAL_STEPS,
} from "../../data/publishSteps";
import MaisonJardinDynamicForm, {
  validateMaisonJardinAttributs,
} from "../../components/publish/maison-jardin/MaisonJardinDynamicForm";
import LocationPickerField from "../../components/publish/LocationPickerField";
import LivraisonFinalizerCard from "../../components/publish/LivraisonFinalizerCard";
import {
  applyLivraisonFinalizerAttrIdsFromTaxo,
  LIVRAISON_FINALIZER_ATTR_KEYS,
} from "../../features/annonces/utils/livraisonFinalizer";
import { isLivraisonDisponibleOui } from "../../features/annonces/utils/livraisonUtils";
import {
  PRICE_UNIT_OPTIONS,
  getFinalPriceDa,
  getDisplayedPriceLabel,
  getPriceUnitHint,
  getPriceUnitSuffix,
  normalizePriceUnit,
  formatPriceDa,
} from "../../features/annonces/utils/priceUnit";
import { useExchangeRate } from "../../hooks/useCatalog";
import {
  dzdToEur,
  extractOfficialRate,
  extractParallelSellRate,
  formatEurAmount,
} from "../../services/exchangeService";
import { colors } from "../../theme/colors";
import { showDevMessage } from "../../utils/devFeedback";

function CounterField({ label, value, onChange, min = 0, max = 99 }) {
  return (
    <View style={styles.counterWrap}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Ionicons name="remove" size={16} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Ionicons name="add" size={16} color={colors.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PreviewDetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "—"}</Text>
    </View>
  );
}

export function PublishGenericStepScreen({
  config,
  draft,
  onChange,
  onBack,
  onClose,
  onContinue,
  onViewListing,
  onPublishAnother,
  stepNumber,
  totalSteps = PUBLISH_TOTAL_STEPS,
}) {
  const [local, setLocal] = useState({ ...draft });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generateDescriptionError, setGenerateDescriptionError] = useState("");
  const { data: exchangeRate } = useExchangeRate();
  const parallelRate = extractParallelSellRate(exchangeRate);
  const officialRate = extractOfficialRate(exchangeRate);
  const activeSubcategoryId = draft?.sousCategorieId ?? local?.sousCategorieId;
  const subcategoryFormConfig = getSubcategoryFormConfig(activeSubcategoryId);
  const immobilierConfig = getImmobilierSubcategoryConfig(
    activeSubcategoryId
  );
  const vehicleConfig = getVehicleSubcategoryConfig(
    activeSubcategoryId
  );
  const electroniqueConfig = getElectroniqueSubcategoryConfig(
    activeSubcategoryId
  );
  const animauxConfig = getAnimauxSubcategoryConfig(
    activeSubcategoryId
  );
  const maisonJardinConfig = getMaisonJardinSubcategoryConfig(
    activeSubcategoryId
  );
  const loisirsConfig = getLoisirsSubcategoryConfig(
    activeSubcategoryId
  );
  const locationsVacancesConfig = getLocationsVacancesSubcategoryConfig(
    activeSubcategoryId
  );
  const materielProfessionnelConfig = getMaterielProfessionnelSubcategoryConfig(
    activeSubcategoryId
  );
  const modeConfig = getModeSubcategoryConfig(
    activeSubcategoryId
  );
  const serviceConfig = getServiceSubcategoryConfig(
    activeSubcategoryId
  );
  const emploiConfig = getEmploiSubcategoryConfig(
    activeSubcategoryId
  );
  const familleConfig = getFamilleSubcategoryConfig(
    activeSubcategoryId
  );
  const { data: taxoAttributs = [] } = useSubcategoryAttributs(
    config.type === "immobilierFields"
      ? immobilierConfig?.id
      : config.type === "vehicleFields"
        ? vehicleConfig?.id
        : config.type === "electroniqueFields"
          ? electroniqueConfig?.id
        : config.type === "animauxFields"
          ? animauxConfig?.id
        : config.type === "maisonJardinFields"
          ? maisonJardinConfig?.id
        : config.type === "loisirsFields"
          ? loisirsConfig?.id
        : config.type === "locationsVacancesFields"
          ? locationsVacancesConfig?.id
        : config.type === "materielProfessionnelFields"
          ? materielProfessionnelConfig?.id
        : config.type === "modeFields"
          ? modeConfig?.id
        : config.type === "serviceFields"
          ? serviceConfig?.id
        : config.type === "emploiFields"
          ? emploiConfig?.id
          : config.type === "familleFields" || config.type === "price"
            ? activeSubcategoryId
            : null
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const update = (key, value) => {
    setLocal((prev) => {
      const next = { ...prev, [key]: value };
      // Différer l’update parent : ne jamais appeler setState parent dans un updater
      queueMicrotask(() => onChangeRef.current?.(next));
      return next;
    });
  };

  const mergeLocal = useCallback((patch) => {
    setLocal((prev) => {
      const next = { ...prev, ...patch };
      queueMicrotask(() => onChangeRef.current?.(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (config.type !== "price") return;
    const { attributeAttrIds, attributeTypes } =
      applyLivraisonFinalizerAttrIdsFromTaxo(taxoAttributs);
    if (
      Object.keys(attributeAttrIds).length === 0 &&
      Object.keys(attributeTypes).length === 0
    ) {
      return;
    }
    const nextAttrIds = {
      ...(local.attributeAttrIds || {}),
      ...attributeAttrIds,
    };
    const nextTypes = {
      ...(local.attributeTypes || {}),
      ...attributeTypes,
    };
    const attrIdsChanged =
      JSON.stringify(nextAttrIds) !== JSON.stringify(local.attributeAttrIds || {});
    const typesChanged =
      JSON.stringify(nextTypes) !== JSON.stringify(local.attributeTypes || {});
    if (!attrIdsChanged && !typesChanged) return;
    mergeLocal({
      attributeAttrIds: nextAttrIds,
      attributeTypes: nextTypes,
    });
  }, [config.type, local.attributeAttrIds, local.attributeTypes, mergeLocal, taxoAttributs]);

  useEffect(() => {
    if (config.type !== "price") return;
    if (isLivraisonDisponibleOui(local.attributs || {})) return;
    const nextAttributs = { ...(local.attributs || {}) };
    let changed = false;
    LIVRAISON_FINALIZER_ATTR_KEYS.forEach((key) => {
      const raw = nextAttributs[key];
      const hasValue = Array.isArray(raw)
        ? raw.length > 0
        : String(raw ?? "").trim().length > 0;
      if (!hasValue) return;
      nextAttributs[key] = Array.isArray(raw) ? [] : "";
      changed = true;
    });
    if (changed) mergeLocal({ attributs: nextAttributs });
  }, [config.type, local.attributs, mergeLocal]);

  const pickValue = (field) => {
    const options = [field.placeholder, "Autre"];
    Alert.alert(field.label, "Sélectionnez une option", [
      ...options.map((opt) => ({
        text: opt,
        onPress: () => update(field.key, opt),
      })),
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleGenerateDescription = async () => {
    setGenerateDescriptionError("");
    setIsGeneratingDescription(true);
    try {
      const priceOptional = Boolean(emploiConfig?.priceOptional);
      const isDonation = !priceOptional && Boolean(local.isDonation);
      const priceUnit = normalizePriceUnit(local.priceUnit);
      const computed = getFinalPriceDa(local.price, priceUnit, isDonation);
      const prix =
        !isDonation && Number.isFinite(computed) && computed >= 1
          ? String(Math.round(computed))
          : "";

      const text = await generateAnnonceDescription({
        sousCategorieId: activeSubcategoryId,
        sousCategorieNom: subcategoryFormConfig?.label,
        titre: local.title,
        type:
          local.adType === "request" || local.adType === "DEMANDE"
            ? "DEMANDE"
            : "OFFRE",
        prix,
        ville: local.city,
        codePostal: local.postalCode,
        attributs: local.attributs || {},
        subcategoryConfig: subcategoryFormConfig,
        attributeAttrIds: local.attributeAttrIds || {},
      });
      mergeLocal({ description: text });
    } catch (error) {
      const message =
        error?.message || "Erreur lors de la génération de la description.";
      setGenerateDescriptionError(message);
      showDevMessage("Génération", message);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const renderFields = () => {
    if (config.type === "photos") {
      return (
        <PublishPhotoGrid
          value={local.photos}
          onChange={(photos) => update("photos", photos)}
        />
      );
    }

    if (config.type === "immobilierFields") {
      if (!immobilierConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie immobilier introuvable.
          </Text>
        );
      }
      return (
        <ImmobilierSubcategoryForm
          config={immobilierConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "vehicleFields") {
      if (!vehicleConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie véhicule introuvable.
          </Text>
        );
      }
      if (vehicleConfig.noDetails) {
        return (
          <Text style={styles.tipText}>
            Aucun détail supplémentaire requis pour cette sous-catégorie.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={vehicleConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "electroniqueFields") {
      if (!electroniqueConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie électronique introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={electroniqueConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "animauxFields") {
      if (!animauxConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie animaux introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={animauxConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "maisonJardinFields") {
      if (!maisonJardinConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie maison et jardin introuvable.
          </Text>
        );
      }
      return (
        <MaisonJardinDynamicForm
          config={maisonJardinConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "loisirsFields") {
      if (!loisirsConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie loisirs introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={loisirsConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "locationsVacancesFields") {
      if (!locationsVacancesConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie locations de vacances introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={locationsVacancesConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "materielProfessionnelFields") {
      if (!materielProfessionnelConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie matériel professionnel introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={materielProfessionnelConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "location") {
      return (
        <View style={styles.fields}>
          <LocationPickerField
            city={local.city ?? ""}
            postalCode={local.postalCode ?? ""}
            onChange={(patch) => mergeLocal(patch)}
          />
          <PublishFormField
            label="Adresse (privée)"
            value={local.address ?? ""}
            onChangeText={(v) => update("address", v)}
            placeholder="Rue, quartier, repère..."
            hint="Votre adresse exacte reste privée. Seuls la wilaya et le code postal sont utilisés pour publier."
          />
        </View>
      );
    }

    if (config.type === "modeFields") {
      if (!modeConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie mode introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={modeConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "serviceFields") {
      if (!serviceConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie service introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={serviceConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "emploiFields") {
      if (!emploiConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie emploi introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={emploiConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "familleFields") {
      if (!familleConfig) {
        return (
          <Text style={styles.tipText}>
            Sous-catégorie famille introuvable.
          </Text>
        );
      }
      return (
        <VehicleSubcategoryForm
          config={familleConfig}
          attributs={local.attributs || {}}
          attributeAttrIds={local.attributeAttrIds || {}}
          attributeTypes={local.attributeTypes || {}}
          onAttributsChange={(attributs) => mergeLocal({ attributs })}
          onMetaChange={(meta) => mergeLocal(meta)}
        />
      );
    }

    if (config.type === "price") {
      const livraisonActive = isLivraisonDisponibleOui(local.attributs || {});
      const priceOptional = Boolean(emploiConfig?.priceOptional);
      const isDonation = !priceOptional && Boolean(local.isDonation);
      const priceUnit = normalizePriceUnit(local.priceUnit);
      const displayedPrice = getDisplayedPriceLabel(local.price, priceUnit, isDonation);
      const unitHint = getPriceUnitHint(local.price, priceUnit, isDonation);
      const unitSuffix = getPriceUnitSuffix(priceUnit);
      const finalPriceDa = getFinalPriceDa(local.price, priceUnit, isDonation);
      const eurParallel =
        !isDonation && Number.isFinite(finalPriceDa) && finalPriceDa >= 1
          ? dzdToEur(finalPriceDa, parallelRate)
          : null;
      const eurOfficial =
        !isDonation && Number.isFinite(finalPriceDa) && finalPriceDa >= 1
          ? dzdToEur(finalPriceDa, officialRate)
          : null;

      return (
        <View style={styles.priceSection}>
          {!priceOptional ? (
            <TouchableOpacity
              style={styles.donationRow}
              onPress={() =>
                mergeLocal({
                  isDonation: !isDonation,
                  price: !isDonation ? "" : local.price,
                })
              }
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isDonation && styles.checkboxActive]}>
                {isDonation ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : null}
              </View>
              <Text style={styles.donationText}>Je fais un don</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.priceFieldWrap}>
            <Text style={styles.priceFieldLabel}>
              {priceOptional ? "Prix de l'article (optionnel)" : "Prix de l'article"}
              {!isDonation && !priceOptional ? (
                <Text style={styles.priceRequired}> *</Text>
              ) : null}
            </Text>
            <View
              style={[
                styles.priceInputWrap,
                isDonation && styles.priceInputWrapDisabled,
              ]}
            >
              <TextInput
                style={styles.priceInput}
                value={local.price ?? ""}
                onChangeText={(v) => update("price", v)}
                placeholder={
                  isDonation
                    ? ""
                    : priceOptional
                      ? "Laisser vide si non applicable"
                      : "Ex. 450"
                }
                placeholderTextColor="rgba(0, 0, 0, 0.19)"
                keyboardType="decimal-pad"
                editable={!isDonation}
                maxLength={16}
              />
              <Text style={styles.priceUnitSuffix}>{unitSuffix}</Text>
            </View>
          </View>

          <View style={[styles.priceUnitBlock, isDonation && styles.priceUnitBlockDisabled]}>
            <Text style={styles.priceUnitLegend}>Comment saisir le montant</Text>
            <View style={styles.priceUnitOptions}>
              {PRICE_UNIT_OPTIONS.map(({ value, label }) => {
                const active = priceUnit === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.priceUnitOption, active && styles.priceUnitOptionActive]}
                    onPress={() => !isDonation && update("priceUnit", value)}
                    disabled={isDonation}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                      {active ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.priceUnitOptionText,
                        active && styles.priceUnitOptionTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {displayedPrice ? (
            <View
              style={[
                styles.pricePreview,
                isDonation ? styles.pricePreviewDonation : styles.pricePreviewSale,
              ]}
            >
              <Text style={styles.pricePreviewText}>
                Prix affiché : {displayedPrice}
              </Text>
              {unitHint ? (
                <Text style={styles.pricePreviewHint}>
                  Saisie : {unitHint}
                </Text>
              ) : null}
            </View>
          ) : null}

          {eurParallel != null ? (
            <View style={styles.eurConversionBox}>
              <Text style={styles.eurConversionBasis}>
                Conversion sur {formatPriceDa(Math.round(finalPriceDa))} DA
              </Text>
              <Text style={styles.eurConversionLine}>
                ≈ {formatEurAmount(eurParallel)} €{" "}
                <Text style={styles.eurConversionLabel}>(Marché parallèle)</Text>
              </Text>
              {eurOfficial != null ? (
                <Text style={styles.eurConversionLine}>
                  ≈ {formatEurAmount(eurOfficial)} €{" "}
                  <Text style={styles.eurConversionLabel}>(Banque)</Text>
                </Text>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.priceHint}>
            {isDonation
              ? "Annonce en don : aucun prix ne sera envoyé."
              : priceOptional
                ? "Le prix n'est pas obligatoire pour cette sous-catégorie."
                : "Conseil : Comparez avec des objets similaires pour vendre plus vite. Millions = ×1 000 000 DA, Centimes = ÷100."}
          </Text>

          {isDonation ? (
            <View style={styles.donationBanner}>
              <Text style={styles.donationBannerText}>
                Annonce en don. Publiez gratuitement sans renseigner de prix.
              </Text>
            </View>
          ) : null}
          <View style={styles.secureCard}>
            <View style={styles.secureHeader}>
              <View style={styles.secureIcon}>
                <Ionicons name="shield-checkmark" size={18} color={colors.navy} />
              </View>
              <View style={styles.secureTexts}>
                <Text style={styles.secureTitle}>Paiement sécurisé</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              </View>
              <Switch
                value={isDonation ? false : local.securePayment ?? true}
                onValueChange={(v) => update("securePayment", v)}
                trackColor={{ true: colors.primary }}
                disabled={isDonation}
              />
            </View>
            <Text style={styles.secureSub}>
              Activez le paiement en ligne pour rassurer les acheteurs.
            </Text>
          </View>
          {livraisonActive ? (
            <LivraisonFinalizerCard
              attributs={local.attributs || {}}
              onAttributChange={(key, value) =>
                mergeLocal({
                  attributs: {
                    ...(local.attributs || {}),
                    [key]: value,
                  },
                })
              }
            />
          ) : null}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionLabel}>Description *</Text>
              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  isGeneratingDescription && styles.generateBtnDisabled,
                ]}
                onPress={handleGenerateDescription}
                disabled={isGeneratingDescription}
                activeOpacity={0.8}
              >
                {isGeneratingDescription ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                )}
                <Text style={styles.generateBtnText}>
                  {isGeneratingDescription ? "Génération…" : "Générer"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.descriptionHint}>
              Le texte proposé reprend le titre, le prix, le lieu et ce que vous avez déjà indiqué. Si vous n'avez pas mis de prix, il ne sera pas inventé.
            </Text>
            <PublishFormField
              label=""
              value={local.description ?? ""}
              onChangeText={(v) => update("description", v)}
              placeholder="État, dimensions, caractéristiques utiles, modalités de retrait ou de livraison…"
              maxLength={2000}
              multiline
            />
            {generateDescriptionError ? (
              <Text style={styles.generateError}>{generateDescriptionError}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.estimateBtn}
            onPress={() =>
              showDevMessage("Estimation", "Estimation de prix simulée : 420–480 €.")
            }
          >
            <Text style={styles.estimateText}>Estimer ma proposition</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (config.type === "preview") {
      const raw =
        local.photos?.primary || local.photos?.front || PREVIEW_IMAGE;
      const imageUri =
        typeof raw === "string" ? raw : raw?.uri || PREVIEW_IMAGE;
      const attrs = local.attributs || {};
      const typeBien =
        attrs.type_bien ||
        attrs.type_transaction ||
        attrs.type_vehicule ||
        attrs.type ||
        local.assetType ||
        local.rentType;
      const surface = attrs.surface_habitable || local.surface;
      const marque = attrs.marque;
      const modele =
        attrs.modele ||
        Object.entries(attrs).find(([key, value]) => key.endsWith("_modele") && value)?.[1];
      return (
        <View style={styles.previewWrap}>
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>
                {(local.photos ? Object.keys(local.photos).length : 0) || 1}
              </Text>
            </View>
            <View style={styles.previewBody}>
              <View style={styles.previewTitleRow}>
                <View style={styles.previewTitleCol}>
                  <Text style={styles.previewTitle}>
                    {local.title || "Titre de l'annonce"}
                  </Text>
                  <Text style={styles.previewPrice}>
                    {local.isDonation
                      ? "Don"
                      : getDisplayedPriceLabel(
                          local.price,
                          local.priceUnit,
                          false
                        ) || "—"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    showDevMessage("Modifier", "Retour aux étapes précédentes.")
                  }
                >
                  <Text style={styles.modifyLink}>Modifier</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {local.category || "Catégorie"}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={colors.navy}
                  />
                  <Text style={styles.chipText}>
                    {local.location ||
                      `${local.city || "Ville"}${local.postalCode ? ` (${local.postalCode})` : ""}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Détails</Text>
              <TouchableOpacity
                onPress={() => showDevMessage("Modifier", "Édition des détails.")}
              >
                <Text style={styles.modifyLink}>Modifier</Text>
              </TouchableOpacity>
            </View>
            <PreviewDetailRow label="Type" value={typeBien} />
            {marque ? <PreviewDetailRow label="Marque" value={marque} /> : null}
            {modele ? <PreviewDetailRow label="Modèle" value={String(modele)} /> : null}
            <PreviewDetailRow
              label="Surface"
              value={surface ? `${surface} m²` : null}
            />
            {attrs.nombre_pieces ? (
              <PreviewDetailRow
                label="Pièces"
                value={String(attrs.nombre_pieces)}
              />
            ) : null}
            {attrs.meuble ? (
              <PreviewDetailRow label="Meublé" value={attrs.meuble} />
            ) : null}
            <PreviewDetailRow
              label="État"
              value={attrs.etat_du_bien || attrs.etat || local.condition}
            />
            <PreviewDetailRow
              label="Kilométrage"
              value={attrs.kilometrage || local.mileage}
            />
          </View>
        </View>
      );
    }

    if (config.type === "success") {
      const raw =
        local.photos?.primary || local.photos?.front || PREVIEW_IMAGE;
      const imageUri =
        typeof raw === "string" ? raw : raw?.uri || PREVIEW_IMAGE;
      return (
        <View style={styles.successWrap}>
          <View style={styles.successCard}>
            <Image source={{ uri: imageUri }} style={styles.successImage} />
            <View style={styles.successBody}>
              <Text style={styles.successTitle}>
                {local.title || "Votre annonce"}
              </Text>
              <Text style={styles.successPrice}>
                {local.isDonation
                  ? "Don"
                  : getDisplayedPriceLabel(
                      local.price,
                      local.priceUnit,
                      false
                    ) || "—"}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    {local.category || "Catégorie"}
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={colors.navy}
                  />
                  <Text style={styles.chipText}>
                    {local.location || local.city || "Localisation"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewListingBtn}
            onPress={onViewListing}
          >
            <Ionicons name="eye-outline" size={18} color={colors.navy} />
            <Text style={styles.viewListingText}>Voir mon annonce</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.publishAnotherBtn}
            onPress={onPublishAnother}
          >
            <Text style={styles.publishAnotherText}>
              Publier une autre annonce
            </Text>
          </TouchableOpacity>

          <Text style={styles.shareLabel}>Partager votre annonce</Text>
          <View style={styles.shareRow}>
            {[
              { icon: "logo-whatsapp", label: "WhatsApp" },
              { icon: "logo-facebook", label: "Facebook" },
              { icon: "share-social-outline", label: "Partager" },
            ].map((item) => (
              <TouchableOpacity
                key={item.icon}
                style={styles.shareBtn}
                onPress={() => showDevMessage(item.label, "Partage simulé.")}
              >
                <Ionicons name={item.icon} size={22} color={colors.navy} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.fields}>
        {config.tip ? (
          <View style={styles.tipBanner}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={styles.tipText}>{config.tip}</Text>
          </View>
        ) : null}
        {(config.fields ?? []).map((field) =>
          field.counter ? (
            <CounterField
              key={field.key}
              label={field.label}
              value={Number(local[field.key] ?? field.placeholder) || 0}
              onChange={(v) => update(field.key, String(v))}
            />
          ) : field.picker ? (
            <PublishDropdownField
              key={field.key}
              label={field.label}
              value={local[field.key]}
              placeholder={field.placeholder}
              onPress={() => pickValue(field)}
            />
          ) : (
            <PublishFormField
              key={field.key}
              label={field.label}
              value={local[field.key] ?? ""}
              onChangeText={(v) => update(field.key, v)}
              placeholder={field.placeholder}
              maxLength={field.maxLength ?? 80}
            />
          )
        )}
      </View>
    );
  };

  const handleContinue = () => {
    if (config.type === "photos") {
      const primary = local.photos?.primary;
      const hasPrimary =
        typeof primary === "string"
          ? Boolean(primary)
          : Boolean(primary?.uri);
      const photosOptional = Boolean(
        emploiConfig?.photosOptional ||
          familleConfig?.photosOptional ||
          vehicleConfig?.photosOptional ||
          electroniqueConfig?.photosOptional ||
          animauxConfig?.photosOptional ||
          maisonJardinConfig?.photosOptional ||
          loisirsConfig?.photosOptional ||
          locationsVacancesConfig?.photosOptional ||
          materielProfessionnelConfig?.photosOptional ||
          modeConfig?.photosOptional ||
          serviceConfig?.photosOptional
      );
      if (!hasPrimary && !photosOptional) {
        showDevMessage(
          "Photo requise",
          "Ajoutez au moins une photo principale."
        );
        return;
      }
    }
    if (config.type === "immobilierFields") {
      if (!immobilierConfig) {
        showDevMessage("Erreur", "Configuration immobilier manquante.");
        return;
      }
      const { ok, missing } = validateImmobilierAttributs(
        immobilierConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
      const pilotKey =
        immobilierConfig.id === 44 ? "type_transaction" : "type_bien";
      if (!String(local.attributs?.[pilotKey] || "").trim()) {
        showDevMessage(
          "Champ requis",
          immobilierConfig.id === 44
            ? "Sélectionnez un type de transaction."
            : "Sélectionnez un type de bien."
        );
        return;
      }
    }
    if (config.type === "vehicleFields") {
      if (!vehicleConfig) {
        showDevMessage("Erreur", "Configuration véhicule manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        vehicleConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "electroniqueFields") {
      if (!electroniqueConfig) {
        showDevMessage("Erreur", "Configuration électronique manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        electroniqueConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "animauxFields") {
      if (!animauxConfig) {
        showDevMessage("Erreur", "Configuration animaux manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        animauxConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "maisonJardinFields") {
      if (!maisonJardinConfig) {
        showDevMessage("Erreur", "Configuration maison et jardin manquante.");
        return;
      }
      const missing = validateMaisonJardinAttributs(
        local.attributs || {},
        local.taxonomyValidationFields || []
      );
      if (missing) {
        showDevMessage("Champs requis", `Complétez : ${missing}`);
        return;
      }
    }

    if (config.type === "loisirsFields") {
      if (!loisirsConfig) {
        showDevMessage("Erreur", "Configuration loisirs manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        loisirsConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "locationsVacancesFields") {
      if (!locationsVacancesConfig) {
        showDevMessage(
          "Erreur",
          "Configuration locations de vacances manquante."
        );
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        locationsVacancesConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "materielProfessionnelFields") {
      if (!materielProfessionnelConfig) {
        showDevMessage(
          "Erreur",
          "Configuration matériel professionnel manquante."
        );
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        materielProfessionnelConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "modeFields") {
      if (!modeConfig) {
        showDevMessage("Erreur", "Configuration mode manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        modeConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "serviceFields") {
      if (!serviceConfig) {
        showDevMessage("Erreur", "Configuration service manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        serviceConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }

    if (config.type === "emploiFields") {
      if (!emploiConfig) {
        showDevMessage("Erreur", "Configuration emploi manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        emploiConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }
    if (config.type === "familleFields") {
      if (!familleConfig) {
        showDevMessage("Erreur", "Configuration famille manquante.");
        return;
      }
      const { ok, missing } = validateVehicleAttributs(
        familleConfig,
        local.attributs || {},
        taxoAttributs
      );
      if (!ok) {
        showDevMessage(
          "Champs requis",
          `Complétez : ${missing.slice(0, 4).join(", ")}${
            missing.length > 4 ? "…" : ""
          }`
        );
        return;
      }
    }
    if (config.type === "location") {
      if (
        !String(local.city ?? "").trim() ||
        !String(local.postalCode ?? "").trim()
      ) {
        showDevMessage(
          "Localisation requise",
          "Sélectionnez une commune ou un code postal depuis la liste."
        );
        return;
      }
    }
    if (config.type === "price") {
      const priceOptional = Boolean(emploiConfig?.priceOptional);
      const isDonation = !priceOptional && Boolean(local.isDonation);
      const priceUnit = normalizePriceUnit(local.priceUnit);
      if (!priceOptional && !isDonation) {
        const finalDa = getFinalPriceDa(local.price, priceUnit, false);
        if (!Number.isFinite(finalDa) || finalDa < 1) {
          showDevMessage(
            "Prix requis",
            "Indiquez un prix d'au moins 1 DA (selon l'unité choisie)."
          );
          return;
        }
      }
      if (isDonation) {
        mergeLocal({ price: "" });
      }
      if (!String(local.description ?? "").trim()) {
        showDevMessage(
          "Description requise",
          "Rédigez une description ou générez-en une automatiquement."
        );
        return;
      }
    }
    onContinue?.(local);
  };

  return (
    <PublishStepLayout
      step={stepNumber ?? config.id}
      totalSteps={totalSteps}
      stepLabel={config.stepLabel}
      title={config.title}
      subtitle={config.subtitle}
      onBack={onBack}
      onClose={onClose}
      onContinue={handleContinue}
      continueLabel={
        config.type === "preview"
          ? "Publier l'annonce"
          : config.type === "success"
            ? "Terminer"
            : "Continuer"
      }
      showDraft={config.type !== "success" && config.type !== "preview"}
      onDraft={() => showDevMessage("Brouillon", "Annonce enregistrée.")}
    >
      {renderFields()}
    </PublishStepLayout>
  );
}

export function PublishBoostScreen({ draft, onBack, onClose, onFinish }) {
  const [selected, setSelected] = useState("performance");
  const [skipBoost, setSkipBoost] = useState(false);

  const imageUriRaw =
    draft?.photos?.primary || draft?.photos?.front || PREVIEW_IMAGE;
  const imageUri =
    typeof imageUriRaw === "string"
      ? imageUriRaw
      : imageUriRaw?.uri || PREVIEW_IMAGE;

  return (
    <PublishStepLayout
      step={PUBLISH_TOTAL_STEPS}
      totalSteps={PUBLISH_TOTAL_STEPS}
      stepLabel="Boost"
      title="Booster mon annonce"
      subtitle="Choisissez une option pour augmenter la visibilité."
      onBack={onBack}
      onClose={onClose}
      onContinue={() => onFinish({ boost: skipBoost ? "none" : selected })}
      continueLabel={skipBoost ? "Publier sans boost" : "Activer le boost"}
      showDraft={false}
    >
      <Text style={styles.previewSectionLabel}>APERÇU DE VOTRE ANNONCE</Text>
      <View style={styles.boostPreviewCard}>
        <Image source={{ uri: imageUri }} style={styles.boostThumb} />
        <View style={styles.boostPreviewBody}>
          <Text style={styles.boostPreviewTitle} numberOfLines={2}>
            {draft?.title || "Votre annonce"}
          </Text>
          <Text style={styles.boostPreviewMeta}>
            {draft?.isDonation
              ? "Don"
              : getDisplayedPriceLabel(draft?.price, draft?.priceUnit, false) ||
                "—"}{" "}
            · {draft?.city || "Lyon"}
            {draft?.postalCode ? ` (${draft.postalCode})` : ""}
          </Text>
          <View style={styles.boostStatusRow}>
            <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
            <Text style={styles.boostStatus}>En ligne</Text>
          </View>
        </View>
      </View>

      <Text style={styles.previewSectionLabel}>CHOISISSEZ VOTRE OPTION</Text>

      {BOOST_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={[
            styles.boostCard,
            !skipBoost && selected === opt.id && styles.boostCardActive,
          ]}
          onPress={() => {
            setSkipBoost(false);
            setSelected(opt.id);
          }}
        >
          {opt.popular ? (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Populaire</Text>
            </View>
          ) : null}
          <View style={styles.boostRow}>
            <View style={styles.boostIconWrap}>
              <Ionicons name={opt.icon} size={20} color={colors.navy} />
            </View>
            <View style={styles.boostBody}>
              <Text style={styles.boostTitle}>{opt.title}</Text>
              <Text style={styles.boostDesc}>{opt.description}</Text>
            </View>
            <Text style={styles.boostPrice}>{opt.price}</Text>
          </View>
          <View style={styles.radio}>
            {!skipBoost && selected === opt.id ? (
              <View style={styles.radioDot} />
            ) : null}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.skipBoostBtn}
        onPress={() => setSkipBoost(true)}
      >
        <Text style={[styles.skipBoostText, skipBoost && styles.skipBoostActive]}>
          Continuer sans boost
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#F3F0EF" />
        <Text style={styles.infoText}>
          Le boost sera activé immédiatement après validation du paiement.
        </Text>
      </View>
    </PublishStepLayout>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 16 },
  tipBanner: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(201, 0, 23, 0.06)",
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  counterWrap: { gap: 8 },
  counterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  priceSection: { gap: 16 },
  priceFieldWrap: { gap: 8 },
  priceFieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  priceRequired: { color: colors.primary },
  priceInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  priceInputWrapDisabled: {
    opacity: 0.55,
    backgroundColor: "#F5F5F5",
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textHeading,
    paddingVertical: 0,
  },
  priceUnitSuffix: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    marginLeft: 8,
  },
  priceUnitBlock: { gap: 10 },
  priceUnitBlockDisabled: { opacity: 0.5 },
  priceUnitLegend: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  priceUnitOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceUnitOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  priceUnitOptionActive: {
    borderColor: colors.primary,
    backgroundColor: "#FFF0F2",
  },
  priceUnitOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  priceUnitOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  pricePreview: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pricePreviewSale: {
    backgroundColor: "#F0F7F4",
  },
  pricePreviewDonation: {
    backgroundColor: colors.brandLight,
  },
  pricePreviewText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  pricePreviewHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  eurConversionBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  eurConversionBasis: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 2,
  },
  eurConversionLine: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  eurConversionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },
  priceHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  donationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  donationText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  donationBanner: {
    borderRadius: 12,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  donationBannerText: {
    fontSize: 13,
    color: colors.navy,
    fontWeight: "600",
  },
  descriptionSection: { gap: 10 },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textHeading,
  },
  descriptionHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.brandMuted,
    backgroundColor: colors.brandLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  generateError: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  secureCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  secureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  secureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  secureTexts: { flex: 1 },
  secureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.navy,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.white,
  },
  secureSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  estimateBtn: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  estimateText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
  },
  previewWrap: { gap: 16 },
  previewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F5F5F5",
  },
  photoCount: {
    position: "absolute",
    top: 168,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  previewBody: { padding: 16 },
  previewTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  previewTitleCol: { flex: 1 },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  previewPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  modifyLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    color: colors.navy,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  successWrap: { gap: 16 },
  successCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  successImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F5F5F5",
  },
  successBody: { padding: 16 },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textHeading,
  },
  successPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  viewListingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  viewListingText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
  },
  publishAnotherBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  publishAnotherText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  shareLabel: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  shareRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  previewSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  boostPreviewCard: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  boostThumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  boostPreviewBody: { flex: 1, justifyContent: "center" },
  boostPreviewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
  },
  boostPreviewMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  boostStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  boostStatus: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
  boostCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    position: "relative",
    marginBottom: 12,
  },
  boostCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(201, 0, 23, 0.04)",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: 16,
    backgroundColor: colors.navy,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    zIndex: 1,
  },
  popularText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.white,
  },
  boostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 28,
  },
  boostIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  boostBody: { flex: 1 },
  boostTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  boostDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  boostPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  radio: {
    position: "absolute",
    top: 18,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  skipBoostBtn: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  skipBoostText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  skipBoostActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#303030",
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#F3F0EF",
    lineHeight: 16,
  },
});
