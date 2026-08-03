import { View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  LIVRAISON_PARTENAIRE_OPTIONS,
  LIVRAISON_PARTNER_WEBSITES,
  normalizeLivraisonPartners,
} from "../../features/annonces/utils/livraisonFinalizer";
import { colors } from "../../theme/colors";

/** Logos partenaires — mêmes fichiers que bi3oo_front_new_design/public/images/livraison */
export const LIVRAISON_PARTNER_LOGOS = {
  Yassir: require("../../../assets/livraison/yassir.png"),
  EMS: require("../../../assets/livraison/ems-champion-post-algeria.png"),
  "Algérie Poste": require("../../../assets/livraison/algerie-poste.png"),
  Yalidine: require("../../../assets/livraison/yalidine.png"),
};

async function openPartnerWebsite(name) {
  const url = LIVRAISON_PARTNER_WEBSITES[name];
  if (!url) return;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("Lien", `Impossible d'ouvrir ${name}.`);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Lien", `Impossible d'ouvrir le site de ${name}.`);
  }
}

/**
 * Grille partenaires (Yassir, EMS, Algérie Poste, Yalidine, Autre) — comme le web.
 * En lecture seule : tap logo → site web. En édition : tap → sélection, appui long → site.
 */
export function LivraisonPartnersGrid({
  selected = [],
  readOnly = true,
  onToggle,
}) {
  const selectedSet = new Set(normalizeLivraisonPartners(selected));

  return (
    <View style={styles.partners}>
      <Text style={styles.partnersLabel}>Partenaires</Text>
      <View style={styles.partnerGrid}>
        {LIVRAISON_PARTENAIRE_OPTIONS.map((name) => {
          const on = selectedSet.has(name);
          const logo = LIVRAISON_PARTNER_LOGOS[name];
          const website = LIVRAISON_PARTNER_WEBSITES[name];
          const content = (
            <>
              {logo ? (
                <Image source={logo} style={styles.partnerLogo} resizeMode="contain" />
              ) : (
                <Text style={styles.partnerText}>{name}</Text>
              )}
              {on ? (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : null}
            </>
          );

          if (readOnly) {
            return (
              <TouchableOpacity
                key={name}
                style={[styles.partner, on && styles.partnerOn]}
                activeOpacity={website ? 0.75 : 1}
                disabled={!website}
                onPress={() => openPartnerWebsite(name)}
                accessibilityRole="link"
                accessibilityLabel={
                  website ? `${name}, ouvrir le site` : name
                }
              >
                {content}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={name}
              style={[styles.partner, on && styles.partnerOn]}
              activeOpacity={0.85}
              onPress={() => onToggle?.(name)}
              onLongPress={
                website ? () => openPartnerWebsite(name) : undefined
              }
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={name}
              accessibilityHint={
                website ? "Appui long pour ouvrir le site" : undefined
              }
            >
              {content}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Carte « En livraison » — alignée web AdDetailLivraisonCard + LivraisonFinaliserCard.
 * Affiche toujours les 5 sociétés ; celles sélectionnées sont marquées ✓.
 */
export default function AdDetailLivraisonCard({
  livraisonDisponible,
  partenaires = [],
  bureau = "",
}) {
  if (!livraisonDisponible) return null;

  const selected = normalizeLivraisonPartners(partenaires);
  const bureauText = String(bureau || "").trim();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="car-outline" size={16} color="#475569" />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>En livraison</Text>
            <Text style={styles.subtitle}>
              Les frais de livraison sont à la charge de l'acheteur
            </Text>
          </View>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Activé</Text>
        </View>
      </View>

      <LivraisonPartnersGrid selected={selected} readOnly />

      {bureauText ? (
        <View style={styles.bureau}>
          <Text style={styles.bureauLabel}>Bureau ou point relais</Text>
          <Text style={styles.bureauValue}>{bureauText}</Text>
        </View>
      ) : null}
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
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
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
    minWidth: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },
  activeBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  partners: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  partnersLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#64748B",
  },
  partnerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  partner: {
    position: "relative",
    minWidth: 92,
    height: 52,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerOn: {
    borderColor: "#10B981",
    shadowColor: "#10B981",
    shadowOpacity: 0.35,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
    transform: [{ scale: 1.02 }],
  },
  partnerLogo: {
    width: 88,
    height: 36,
  },
  partnerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  check: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 11,
  },
  bureau: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 4,
  },
  bureauLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  bureauValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 22,
  },
});
