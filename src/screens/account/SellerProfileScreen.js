import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { queryKeys } from "../../api/queryKeys";
import { fetchPublicSeller } from "../../services/annoncesService";
import { mapPublicSeller } from "../../utils/profileHelpers";
import { formatPrice } from "../../utils/productMapper";
import { useSellerPublicAds } from "../../hooks/useCatalog";
import {
  useFollowStatus,
  useToggleFollow,
} from "../../hooks/useEngagement";
import { useAuth } from "../../context/AuthContext";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_W = (SCREEN_W - H_PAD * 2 - CARD_GAP) / 2;

function SellerAdCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.adCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: item.image }} style={styles.adImage} />
      <Text style={styles.adTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.adPrice}>
        {item.priceDa > 0 ? formatPrice(item.priceDa) : "Sur demande"}
      </Text>
      <View style={styles.adMeta}>
        <Ionicons name="heart-outline" size={12} color={colors.textMuted} />
        <Text style={styles.adMetaText}>{Number(item.favorisCount ?? 0)}</Text>
        {item.location ? (
          <Text style={styles.adLoc} numberOfLines={1}>
            {item.location}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SellerProfileScreen({ route, navigation }) {
  const sellerId = route.params?.sellerId;
  const seedName = route.params?.sellerName;
  const { isAuthenticated, requireAuth } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.sellerPublic(Number(sellerId) || 0),
    queryFn: () => fetchPublicSeller(Number(sellerId)),
    enabled: Boolean(sellerId),
  });

  const seller = useMemo(
    () =>
      mapPublicSeller(data, Number(sellerId) || 0) ?? {
        id: Number(sellerId),
        name: seedName || `Vendeur #${sellerId}`,
      },
    [data, sellerId, seedName]
  );

  const {
    data: sellerAds,
    isLoading: adsLoading,
    isError: adsError,
  } = useSellerPublicAds(sellerId, 50);

  const products = sellerAds?.products ?? [];
  const adsTotal = sellerAds?.totalElements ?? products.length;

  const { data: following = false } = useFollowStatus(
    isAuthenticated ? sellerId : undefined
  );
  const toggleFollow = useToggleFollow();

  if (!sellerId) {
    navigation.goBack();
    return null;
  }

  const handleFollow = () => {
    if (!isAuthenticated) {
      requireAuth({
        name: "SellerProfile",
        params: { sellerId, sellerName: seller.name || seedName },
      });
      return;
    }
    toggleFollow.mutate({
      sellerId,
      currentlyFollowing: following,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {seller.name || seedName || "Vendeur"}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : null}

        {isError ? (
          <Text style={styles.error}>
            Impossible de charger le profil public.
          </Text>
        ) : null}

        <View style={styles.profileCard}>
          {seller.avatar ? (
            <Image source={{ uri: seller.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={40} color={colors.iconMuted} />
            </View>
          )}
          <Text style={styles.name}>{seller.name || seedName}</Text>
          {seller.typeCompte ? (
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.typeBadge,
                  (seller.typeCompte === "PRO" ||
                    seller.typeCompte === "PROFESSIONNEL") &&
                    styles.typeBadgePro,
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    (seller.typeCompte === "PRO" ||
                      seller.typeCompte === "PROFESSIONNEL") &&
                      styles.typeBadgeTextPro,
                  ]}
                >
                  {seller.typeCompte === "PRO" ||
                  seller.typeCompte === "PROFESSIONNEL"
                    ? "Pro"
                    : "Particulier"}
                </Text>
              </View>
            </View>
          ) : null}
          {seller.ville ? (
            <Text style={styles.meta}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />{" "}
              {seller.ville}
            </Text>
          ) : null}
          <Text style={styles.adsCount}>
            {adsTotal} annonce{adsTotal !== 1 ? "s" : ""}
          </Text>
          {seller.bio ? <Text style={styles.bio}>{seller.bio}</Text> : null}

          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnActive]}
            disabled={toggleFollow.isPending}
            onPress={handleFollow}
          >
            <Ionicons
              name={following ? "heart" : "heart-outline"}
              size={16}
              color={following ? colors.white : colors.primary}
            />
            <Text
              style={[styles.followText, following && styles.followTextActive]}
            >
              {following ? "Suivi" : "Suivre"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Annonces</Text>

        {adsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : null}

        {adsError ? (
          <Text style={styles.error}>Impossible de charger les annonces.</Text>
        ) : null}

        {!adsLoading && products.length === 0 ? (
          <Text style={styles.empty}>Aucune annonce publiée.</Text>
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <SellerAdCard
                key={String(item.id)}
                item={item}
                onPress={() =>
                  navigation.push("ProductDetail", {
                    annonceId: item.id,
                    product: item,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: colors.textHeading,
  },
  content: { paddingBottom: 120 },
  error: {
    textAlign: "center",
    color: colors.primary,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  profileCard: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceMuted,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "700",
    color: colors.textHeading,
    textAlign: "center",
  },
  badgeRow: { marginTop: 8 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  typeBadgePro: { backgroundColor: colors.brandLight },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  typeBadgeTextPro: { color: colors.primary },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  adsCount: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  bio: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textHeading,
    textAlign: "center",
  },
  followBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  followTextActive: { color: colors.white },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: H_PAD,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    gap: CARD_GAP,
  },
  adCard: {
    width: CARD_W,
    marginBottom: 8,
  },
  adImage: {
    width: "100%",
    height: CARD_W * 0.85,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  adTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
    lineHeight: 17,
  },
  adPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  adMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  adMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  adLoc: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
});
