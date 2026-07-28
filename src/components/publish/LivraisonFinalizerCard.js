import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MultiDropdownField } from "./immobilier/ImmobilierFieldControls";
import PublishFormField from "./PublishFormField";
import { LIVRAISON_PARTENAIRE_OPTIONS, normalizeLivraisonPartners } from "../../features/annonces/utils/livraisonFinalizer";
import { colors } from "../../theme/colors";

export default function LivraisonFinalizerCard({
  attributs = {},
  onAttributChange,
}) {
  const selected = normalizeLivraisonPartners(attributs.partenaires_de_livraison);
  const value = selected.join(",");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="cube-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Livraison</Text>
          <Text style={styles.subtitle}>
            Précisez vos méthodes de livraison pour cette annonce.
          </Text>
        </View>
      </View>

      <MultiDropdownField
        label="Partenaires de livraison"
        options={LIVRAISON_PARTENAIRE_OPTIONS}
        value={value}
        onChange={(next) =>
          onAttributChange?.("partenaires_de_livraison", normalizeLivraisonPartners(next))
        }
      />

      <PublishFormField
        label="Bureau ou point relais"
        value={attributs.bureau_ou_point_relais ?? ""}
        onChangeText={(next) => onAttributChange?.("bureau_ou_point_relais", next)}
        placeholder="Ex: EMS Kouba, Point relais Yalidine Hydra"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "700", color: colors.textHeading },
  subtitle: { fontSize: 12, color: colors.textMuted },
});
