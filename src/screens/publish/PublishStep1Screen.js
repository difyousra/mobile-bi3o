import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PublishTopBar from "../../components/publish/PublishTopBar";
import PublishStepIndicator from "../../components/publish/PublishStepIndicator";
import PublishFormField from "../../components/publish/PublishFormField";
import CategoryPicker from "../../components/publish/CategoryPicker";
import AdTypeSelector from "../../components/publish/AdTypeSelector";
import { colors } from "../../theme/colors";
import { resolvePublishTotalSteps } from "../../data/publishSteps";
import { showDevMessage } from "../../utils/devFeedback";

const CAR_IMAGE =
  "https://www.figma.com/api/mcp/asset/af51f4b0-37c0-4e0c-980e-4549d59dcf9b";

export default function PublishStep1Screen({
  draft,
  totalSteps: totalStepsProp,
  onContinue,
  onBack,
  onClose,
}) {
  const [title, setTitle] = useState(draft?.title ?? "");
  const [category, setCategory] = useState(draft?.category ?? "");
  const [sousCategorieId, setSousCategorieId] = useState(
    draft?.sousCategorieId ?? null
  );
  const [categorieId, setCategorieId] = useState(draft?.categorieId ?? null);
  const [adType, setAdType] = useState(draft?.adType ?? "offer");

  const totalSteps =
    totalStepsProp ?? resolvePublishTotalSteps(sousCategorieId);
  const handleContinue = () => {
    if (!title.trim()) {
      showDevMessage("Titre requis", "Ajoutez un titre pour votre annonce.");
      return;
    }
    if (!sousCategorieId) {
      showDevMessage(
        "Catégorie requise",
        "Sélectionnez une sous-catégorie (API taxonomie)."
      );
      return;
    }

    // Emploi : sous-catégorie "offre de candidature" (id 12) => DEMANDE forcée.
    const forcedAdType =
      Number(sousCategorieId) === 12 ? "request" : adType;

    onContinue?.({
      title,
      category,
      sousCategorieId,
      categorieId,
      adType: forcedAdType,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <PublishTopBar
        title="Déposer une annonce"
        onBack={onBack ?? onClose}
        onClose={onClose}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>Poser une annonce</Text>

        <PublishStepIndicator
          currentStep={1}
          totalSteps={totalSteps}
          stepLabel="L'essentiel"
        />

        <Text style={styles.heading}>
          Commençons par{"\n"}l&apos;essentiel !
        </Text>

        <PublishFormField
          label="Quel est le titre de l'annonce ?"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Canapé scandinave velours vert"
          hint="Un bon titre attire plus d'acheteurs. Évitez les majuscules inutiles."
        />

        <CategoryPicker
          value={category}
          sousCategorieId={sousCategorieId}
          categorieId={categorieId}
          onChange={({
            category: nom,
            sousCategorieId: id,
            categorieId: catId,
          }) => {
            setCategory(nom);
            setSousCategorieId(id);
            setCategorieId(catId ?? null);
          }}
        />

        <AdTypeSelector value={adType} onChange={setAdType} />

        <ImageBackground
          source={{ uri: CAR_IMAGE }}
          style={styles.tipImage}
          imageStyle={styles.tipImageInner}
        >
          <View style={styles.tipOverlay}>
            <Text style={styles.tipText}>
              &quot;Vendez plus vite en ajoutant une catégorie précise comme
              &apos;Voitures&apos;.&quot;
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#F3F0EF" />
          <Text style={styles.infoText}>
            N&apos;oubliez pas d&apos;indiquer l&apos;état du véhicule à
            l&apos;étape suivante.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
          <Text style={styles.primaryBtnText}>Continuer</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => showDevMessage("Brouillon", "Annonce enregistrée en brouillon.")}
        >
          <Text style={styles.secondaryBtnText}>Enregistrer le brouillon</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.navy,
    marginTop: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textHeading,
    lineHeight: 32,
    letterSpacing: -0.24,
  },
  tipImage: {
    height: 126,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  tipImageInner: {
    borderRadius: 12,
  },
  tipOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  tipText: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.white,
    lineHeight: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#303030",
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#F3F0EF",
    lineHeight: 16,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
  },
  secondaryBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(18, 25, 38, 0.2)",
  },
});
