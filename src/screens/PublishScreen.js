import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import PublishStep1Screen from "./publish/PublishStep1Screen";
import { PublishGenericStepScreen } from "./publish/PublishFlowScreens";
import {
  resolvePublishSteps,
  resolvePublishTotalSteps,
} from "../data/publishSteps";
import {
  getFinalPriceDa,
  normalizePriceUnit,
} from "../features/annonces/utils/priceUnit";
import { colors } from "../theme";
import { normalizeProduct } from "../utils/productMapper";
import { usePublishAnnonce } from "../hooks/usePublish";

function photoUri(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.uri ?? null;
}

function notify(title, message, buttons) {
  if (Platform.OS === "web") {
    const ok = window.confirm(`${title}\n\n${message}`);
    const action = buttons?.find((b) =>
      ok ? b.style !== "cancel" : b.style === "cancel"
    );
    action?.onPress?.();
    if (!ok && !buttons?.some((b) => b.style === "cancel")) {
      buttons?.[buttons.length - 1]?.onPress?.();
    }
    return;
  }
  Alert.alert(title, message, buttons);
}

function draftToProduct(draft, annonceId) {
  const cover =
    photoUri(draft.photos?.primary) ||
    photoUri(draft.photos?.front) ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

  const finalDa = draft.isDonation
    ? 0
    : getFinalPriceDa(draft.price, normalizePriceUnit(draft.priceUnit), false);
  const priceDa = Number.isFinite(finalDa) ? Math.round(finalDa) : 0;

  return normalizeProduct({
    id: annonceId ?? `draft-${Date.now()}`,
    title: draft.title || "Mon annonce",
    subtitle: draft.category || "Annonce",
    category: draft.category || "Marketplace",
    image: cover,
    price: priceDa,
    priceDa,
    priceEuro: priceDa,
    description:
      draft.description || `${draft.title || "Annonce"} publiée sur Bi3oo.`,
    location: draft.location || draft.city || "Alger",
    seller: "Moi",
  });
}

export default function PublishScreen() {
  const navigation = useNavigation();
  const publishMutation = usePublishAnnonce();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState({});
  const [createdId, setCreatedId] = useState(null);

  const steps = useMemo(
    () => resolvePublishSteps(draft.sousCategorieId),
    [draft.sousCategorieId]
  );
  const totalSteps = useMemo(
    () => resolvePublishTotalSteps(draft.sousCategorieId),
    [draft.sousCategorieId]
  );
  const currentStep = steps[stepIndex] ?? steps[0];

  const reset = () => {
    setStepIndex(0);
    setDraft({});
    setCreatedId(null);
  };

  const mergeDraft = useCallback((data) => {
    setDraft((prev) => ({ ...prev, ...data }));
  }, []);

  const submitPublish = async (data = {}) => {
    const fullDraft = { ...draft, ...data };
    mergeDraft(data);

    try {
      const result = await publishMutation.mutateAsync(fullDraft);
      setCreatedId(result.id);

      notify("Annonce publiée", `Votre annonce a été publiée (ID ${result.id}).`, [
        {
          text: "Voir l'annonce",
          onPress: () => {
            navigation.navigate("ProductDetail", {
              product: draftToProduct(fullDraft, result.id),
              annonceId: result.id,
            });
            reset();
          },
        },
        { text: "OK", style: "cancel", onPress: reset },
      ]);
    } catch (error) {
      const message =
        error?.message ??
        "Publication impossible. Vérifiez les champs et la connexion.";

      if (error?.code === "MODERATION_REJECTED") {
        const priceStepIndex = steps.findIndex((step) => step.type === "price");
        if (priceStepIndex >= 0) {
          setStepIndex(priceStepIndex);
        }
        notify(
          "Modération refusée",
          `${message}\n\nModifiez le titre ou la description, puis republiez.`,
          [{ text: "Modifier le texte" }]
        );
        return;
      }

      notify("Erreur publication", message, [{ text: "OK" }]);
    }
  };

  const goNext = (data) => {
    mergeDraft(data);
    if (stepIndex >= steps.length - 1 || currentStep?.type === "preview") {
      submitPublish(data);
      return;
    }
    setStepIndex((s) => s + 1);
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    }
  };

  const handleViewListing = () => {
    navigation.navigate("ProductDetail", {
      product: draftToProduct(draft, createdId),
      annonceId: createdId,
    });
  };

  if (publishMutation.isPending) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          Vérification modération & publication…
        </Text>
      </SafeAreaView>
    );
  }

  if (stepIndex === 0 || currentStep?.type === "essentials") {
    return (
      <PublishStep1Screen
        draft={draft}
        onContinue={(data) => {
          const subcategoryChanged =
            Number(data.sousCategorieId) !== Number(draft.sousCategorieId);
          mergeDraft(
            subcategoryChanged
              ? {
                  ...data,
                  attributs: {},
                  attributeAttrIds: {},
                  attributeTypes: {},
                }
              : data
          );
          setStepIndex(1);
        }}
        onBack={goBack}
        onClose={reset}
      />
    );
  }

  if (!currentStep) {
    return (
      <SafeAreaView style={styles.placeholder}>
        <Text style={styles.title}>Étape inconnue</Text>
      </SafeAreaView>
    );
  }

  return (
    <PublishGenericStepScreen
      config={currentStep}
      stepNumber={stepIndex + 1}
      totalSteps={totalSteps}
      draft={draft}
      onChange={mergeDraft}
      onBack={goBack}
      onClose={reset}
      onContinue={goNext}
      onViewListing={handleViewListing}
      onPublishAnother={reset}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 16,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
