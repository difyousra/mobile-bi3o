import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import PublishStep1Screen from "./publish/PublishStep1Screen";
import {
  PublishGenericStepScreen,
  PublishBoostScreen,
} from "./publish/PublishFlowScreens";
import { PUBLISH_STEPS } from "../data/publishSteps";
import { colors } from "../theme";
import { normalizeProduct } from "../utils/productMapper";
import { usePublishAnnonce } from "../hooks/usePublish";

function photoUri(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.uri ?? null;
}

function draftToProduct(draft, annonceId) {
  const cover =
    photoUri(draft.photos?.primary) ||
    photoUri(draft.photos?.front) ||
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80";

  return normalizeProduct({
    id: annonceId ?? `draft-${Date.now()}`,
    title: draft.title || "Mon annonce",
    subtitle: draft.category || "Annonce",
    category: draft.category || "Marketplace",
    image: cover,
    price: Number(draft.price) || 0,
    priceDa: Number(draft.price) || 0,
    priceEuro: Number(draft.price) || 0,
    description: draft.description || `${draft.title || "Annonce"} publiée sur Bi3oo.`,
    location: draft.city || "Alger",
    seller: "Moi",
  });
}

export default function PublishScreen() {
  const navigation = useNavigation();
  const publishMutation = usePublishAnnonce();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({});
  const [phase, setPhase] = useState("form");
  const [createdId, setCreatedId] = useState(null);

  const reset = () => {
    setStep(1);
    setDraft({});
    setPhase("form");
    setCreatedId(null);
  };

  const mergeDraft = (data) => {
    setDraft((prev) => ({ ...prev, ...data }));
  };

  const goNext = (data) => {
    mergeDraft(data);
    // Après aperçu (8) → boost UI puis API — pas d’écran « publiée » avant création réelle
    if (step >= 8) {
      setPhase("boost");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (phase === "boost") {
      setPhase("form");
      setStep(8); // retour à l’aperçu
      return;
    }
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleViewListing = () => {
    navigation.navigate("ProductDetail", {
      product: draftToProduct(draft, createdId),
      annonceId: createdId,
    });
  };

  const submitPublish = async (boostData) => {
    const fullDraft = { ...draft, ...boostData };
    mergeDraft(boostData);

    try {
      const result = await publishMutation.mutateAsync(fullDraft);
      setCreatedId(result.id);

      const boostLabel =
        boostData.boost === "none"
          ? ""
          : boostData.boost === "performance"
            ? " (boost Performance — UI seule, pas d’API boost)"
            : boostData.boost === "highlight"
              ? " (Mise en avant — UI seule)"
              : " (Logo Urgent — UI seule)";

      Alert.alert(
        "Annonce publiée",
        `ID ${result.id}${boostLabel}.`,
        [
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
          { text: "OK", onPress: reset },
        ]
      );
    } catch (error) {
      const message =
        error?.message ??
        "Publication impossible. Vérifiez les champs et la connexion.";
      Alert.alert(
        error?.code === "MODERATION_REJECTED"
          ? "Modération refusée"
          : "Erreur publication",
        message
      );
    }
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

  if (step === 1) {
    return (
      <PublishStep1Screen
        draft={draft}
        onContinue={(data) => goNext(data)}
        onBack={goBack}
        onClose={reset}
      />
    );
  }

  if (phase === "boost") {
    return (
      <PublishBoostScreen
        draft={draft}
        onBack={goBack}
        onClose={reset}
        onFinish={(data) => {
          submitPublish(data);
        }}
      />
    );
  }

  const config = PUBLISH_STEPS.find((s) => s.id === step);

  if (!config) {
    return (
      <SafeAreaView style={styles.placeholder}>
        <Text style={styles.title}>Étape inconnue</Text>
      </SafeAreaView>
    );
  }

  return (
    <PublishGenericStepScreen
      config={config}
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
