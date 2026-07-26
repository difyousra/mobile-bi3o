import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PublishStepLayout from "../../components/publish/PublishStepLayout";
import PublishFormField from "../../components/publish/PublishFormField";
import PublishPhotoGrid from "../../components/publish/PublishPhotoGrid";
import PublishDropdownField from "../../components/publish/PublishDropdownField";
import {
  BOOST_OPTIONS,
  PREVIEW_IMAGE,
  PUBLISH_TOTAL_STEPS,
} from "../../data/publishSteps";
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
}) {
  const [local, setLocal] = useState({ ...draft });

  const update = (key, value) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  };

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

  const renderFields = () => {
    if (config.type === "photos") {
      return (
        <PublishPhotoGrid
          value={local.photos}
          onChange={(photos) => update("photos", photos)}
        />
      );
    }

    if (config.type === "price") {
      return (
        <View style={styles.priceSection}>
          <PublishFormField
            label="Prix de l'article"
            value={local.price ?? ""}
            onChangeText={(v) => update("price", v)}
            placeholder="450"
            maxLength={10}
            hint="Conseil : Comparez avec des objets similaires pour vendre plus vite."
          />
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
                value={local.securePayment ?? true}
                onValueChange={(v) => update("securePayment", v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
            <Text style={styles.secureSub}>
              Activez le paiement en ligne pour rassurer les acheteurs.
            </Text>
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
                    {local.price ? `${local.price} €` : "—"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => showDevMessage("Modifier", "Retour aux étapes précédentes.")}>
                  <Text style={styles.modifyLink}>Modifier</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{local.category || "Catégorie"}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="location-outline" size={12} color={colors.navy} />
                  <Text style={styles.chipText}>
                    {local.city || "Ville"} {local.postalCode ? `(${local.postalCode})` : ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Détails</Text>
              <TouchableOpacity onPress={() => showDevMessage("Modifier", "Édition des détails.")}>
                <Text style={styles.modifyLink}>Modifier</Text>
              </TouchableOpacity>
            </View>
            <PreviewDetailRow label="Type" value={local.assetType || local.rentType} />
            <PreviewDetailRow label="Surface" value={local.surface ? `${local.surface} m²` : null} />
            <PreviewDetailRow label="État" value={local.condition} />
            <PreviewDetailRow label="Kilométrage" value={local.mileage} />
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
              <Text style={styles.successTitle}>{local.title || "Votre annonce"}</Text>
              <Text style={styles.successPrice}>
                {local.price ? `${local.price} €` : "—"}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{local.category || "Catégorie"}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="location-outline" size={12} color={colors.navy} />
                  <Text style={styles.chipText}>{local.city || "Lyon"}</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.viewListingBtn} onPress={onViewListing}>
            <Ionicons name="eye-outline" size={18} color={colors.navy} />
            <Text style={styles.viewListingText}>Voir mon annonce</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.publishAnotherBtn} onPress={onPublishAnother}>
            <Text style={styles.publishAnotherText}>Publier une autre annonce</Text>
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
      if (!hasPrimary) {
        showDevMessage("Photo requise", "Ajoutez au moins une photo principale.");
        return;
      }
    }
    if (config.type === "price" && !String(local.price ?? "").trim()) {
      showDevMessage("Prix requis", "Indiquez un prix pour votre annonce.");
      return;
    }
    onContinue?.(local);
  };

  return (
    <PublishStepLayout
      step={config.id}
      totalSteps={PUBLISH_TOTAL_STEPS}
      stepLabel={config.stepLabel}
      title={config.title}
      subtitle={config.subtitle}
      onBack={onBack}
      onClose={onClose}
      onContinue={handleContinue}
      continueLabel={
        config.type === "success" ? "Booster mon annonce" : "Continuer"
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
            {draft?.price ? `${draft.price} €` : "—"} · {draft?.city || "Lyon"}
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
