import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
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
import { useInfiniteSellerPublicAds } from "../../hooks/useCatalog";
import {
  useFollowStatus,
  useToggleFollow,
} from "../../hooks/useEngagement";
import { useAuth } from "../../context/AuthContext";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_W = (SCREEN_W - H_PAD * 2 - CARD_GAP) / 2;
const PAGE_SIZE = 24;

function SellerAdCard({ item, onPress, priceOnRequestLabel }) {
  return (
    <TouchableOpacity style={styles.adCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: item.image }} style={styles.adImage} />
      <Text style={styles.adTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.adPrice}>
        {item.priceDa > 0 ? formatPrice(item.priceDa) : priceOnRequestLabel}
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
  const { t } = useAppLanguage();
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
        name: seedName || t("mobile.favorites.sellerFallback", { id: sellerId }),
      },
    [data, sellerId, seedName, t]
  );

  const {
    products,
    pageData,
    isLoading: adsLoading,
    isError: adsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSellerPublicAds(sellerId, PAGE_SIZE);

  const adsTotal = pageData?.totalElements ?? products.length;

  const { data: following = false } = useFollowStatus(
    isAuthenticated ? sellerId : undefined
  );
  const toggleFollow = useToggleFollow();

  const onEndReached = useCallback(() => {
    if (adsLoading || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [adsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

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

  const listHeader = (
    <View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : null}

      {isError ? (
        <Text style={styles.error}>{t("mobile.profilePublicUi.loadError")}</Text>
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
                  ? t("profileUi.accountTypePro")
                  : t("profileUi.accountTypeParticulier")}
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
          {t("profilePublicUi.adsOnline", { count: adsTotal })}
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
            {following ? t("profilePublicUi.following") : t("profilePublicUi.follow")}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t("profilePublicUi.adsTab")}</Text>

      {adsLoading && products.length === 0 ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : null}

      {adsError ? (
        <Text style={styles.error}>{t("categoryUi.loadListingsError")}</Text>
      ) : null}

      {!adsLoading && products.length === 0 ? (
        <Text style={styles.empty}>{t("mobile.profilePublicUi.emptyAds")}</Text>
      ) : null}
    </View>
  );

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
          {seller.name || seedName || t("mobile.profilePublicUi.sellerDefault")}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <SellerAdCard
            item={item}
            priceOnRequestLabel={t("adDetailV2.priceOnRequest")}
            onPress={() =>
              navigation.push("ProductDetail", {
                annonceId: item.id,
                product: item,
              })
            }
          />
        )}
      />
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
  content: {
    paddingHorizontal: H_PAD,
    paddingBottom: 40,
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 24,
    fontSize: 14,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F0F2F5",
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textHeading,
    marginTop: 8,
  },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  typeBadgePro: { backgroundColor: colors.navy },
  typeBadgeText: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  typeBadgeTextPro: { color: colors.white },
  meta: { fontSize: 13, color: colors.textMuted },
  adsCount: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  bio: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  followBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  followText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  followTextActive: { color: colors.white },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 12,
    marginTop: 8,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  adCard: {
    width: CARD_W,
    marginBottom: 4,
  },
  adImage: {
    width: "100%",
    height: CARD_W * 0.85,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
    marginTop: 8,
  },
  adPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },
  adMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  adMetaText: { fontSize: 11, color: colors.textMuted },
  adLoc: { flex: 1, fontSize: 11, color: colors.textMuted },
});
