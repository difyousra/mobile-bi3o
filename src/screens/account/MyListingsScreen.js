import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { LISTING_TABS } from "../../data/mockProfile";
import { formatPrice } from "../../utils/productMapper";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import {
  useMyManagedAds,
  usePauseAnnonce,
  useReactivateAnnonce,
  useDeleteAnnonce,
} from "../../hooks/usePublish";

function normalizeStatus(item) {
  const raw = String(item.status ?? item.statut ?? "ACTIVE").toUpperCase();
  if (raw.includes("PAUSE") || raw.includes("SUSPEND")) return "paused";
  if (raw.includes("VEND") || raw.includes("SOLD") || raw.includes("ARCHIVE")) {
    return "sold";
  }
  return "active";
}

function mapManagedItem(item) {
  return {
    id: item.id,
    title: item.titre ?? item.title ?? "Annonce",
    price: Number(item.prix ?? item.price ?? 0),
    image:
      resolveMediaUrl(item.coverUrl ?? item.image) ??
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    views: item.views ?? item.vues ?? 0,
    messages: item.messages ?? 0,
    status: normalizeStatus(item),
  };
}

export default function MyListingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("active");
  const { data, isLoading, isError, refetch, isRefetching } = useMyManagedAds(
    0,
    50
  );
  const pauseMutation = usePauseAnnonce();
  const reactivateMutation = useReactivateAnnonce();
  const deleteMutation = useDeleteAnnonce();

  const listings = useMemo(() => {
    const all = (data?.content ?? []).map(mapManagedItem);
    return all.filter((item) => item.status === activeTab);
  }, [data, activeTab]);

  const confirmAction = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", style: "destructive", onPress: onConfirm },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes annonces</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Publier une nouvelle annonce</Text>
          <Text style={styles.ctaSub}>
            Vendez rapidement vos articles sur Bi3oo.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "Publish" })
            }
          >
            <Text style={styles.ctaBtnText}>Créer une annonce</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          {LISTING_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : null}

        {isError ? (
          <Text style={styles.empty}>
            Impossible de charger vos annonces (JWT requis).
          </Text>
        ) : null}

        {!isLoading && listings.length === 0 ? (
          <Text style={styles.empty}>Aucune annonce dans cette catégorie.</Text>
        ) : (
          listings.map((item) => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductDetail", {
                    annonceId: item.id,
                    product: {
                      id: item.id,
                      title: item.title,
                      image: item.image,
                      priceDa: item.price,
                      priceEuro: item.price,
                    },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.image} />
              </TouchableOpacity>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                <View style={styles.stats}>
                  <Text style={styles.stat}>{item.views} vues</Text>
                  <Text style={styles.stat}>{item.messages} messages</Text>
                </View>
                <View style={styles.actions}>
                  {item.status === "active" ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() =>
                        confirmAction(
                          "Suspendre",
                          "Mettre cette annonce en pause ?",
                          () => pauseMutation.mutate(item.id)
                        )
                      }
                    >
                      <Text style={styles.actionText}>Pause</Text>
                    </TouchableOpacity>
                  ) : item.status === "paused" ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => reactivateMutation.mutate(item.id)}
                    >
                      <Text style={styles.actionText}>Réactiver</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      confirmAction(
                        "Supprimer",
                        "Supprimer définitivement cette annonce ?",
                        () => deleteMutation.mutate(item.id)
                      )
                    }
                  >
                    <Text style={[styles.actionText, styles.danger]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  ctaCard: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 6,
  },
  ctaSub: {
    fontSize: 13,
    color: "#CCE4FD",
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: colors.navy,
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    paddingVertical: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textHeading,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  stat: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  danger: {
    color: colors.primary,
  },
});
