import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PublishFormField from "./PublishFormField";
import {
  LIVRAISON_PARTENAIRE_OPTIONS,
  normalizeLivraisonPartners,
} from "../../features/annonces/utils/livraisonFinalizer";
import { LivraisonPartnersGrid } from "../product/AdDetailLivraisonCard";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function LivraisonFinalizerCard({
  attributs = {},
  onAttributChange,
}) {
  const { t } = useAppLanguage();
  const selected = normalizeLivraisonPartners(attributs.partenaires_de_livraison);

  const togglePartner = (label) => {
    const set = new Set(selected);
    if (set.has(label)) set.delete(label);
    else set.add(label);
    const next = LIVRAISON_PARTENAIRE_OPTIONS.filter((name) => set.has(name));
    onAttributChange?.("partenaires_de_livraison", next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="car-outline" size={16} color="#475569" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("forms.deposit.livraison.title")}</Text>
            <Text style={styles.subtitle}>{t("forms.deposit.livraison.subtitle")}</Text>
          </View>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>{t("forms.deposit.livraison.active")}</Text>
        </View>
      </View>

      <LivraisonPartnersGrid
        selected={selected}
        readOnly={false}
        onToggle={togglePartner}
      />

      <View style={styles.fields}>
        <PublishFormField
          label={t("forms.deposit.livraison.bureauLabel")}
          value={attributs.bureau_ou_point_relais ?? ""}
          onChangeText={(next) => onAttributChange?.("bureau_ou_point_relais", next)}
          placeholder={t("forms.deposit.livraison.bureauPlaceholder")}
        />
        <Text style={styles.hint}>{t("forms.deposit.livraison.bureauHint")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 12, color: "#64748B", lineHeight: 16 },
  activeBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  activeBadgeText: { fontSize: 11, fontWeight: "700", color: "#047857" },
  fields: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 6,
  },
  hint: { fontSize: 12, color: "#64748B", lineHeight: 17 },
});
