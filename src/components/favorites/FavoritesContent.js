import { useCallback, useMemo, useState } from "react";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import HomeHeader from "../home/HomeHeader";
import HomeSearchBar from "../home/HomeSearchBar";
import FavoritesTabs from "./FavoritesTabs";
import ExperienceRatingCard from "./ExperienceRatingCard";
import MarketplaceProductCard from "../home/MarketplaceProductCard";
import { useFavorites } from "../../context/FavoritesContext";
import {
  useFollowedSellers,
  useSavedSearches,
  useDeleteSavedSearch,
  useUnreadNotificationsCount,
} from "../../hooks/useEngagement";
import { normalizeProduct } from "../../utils/productMapper";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import { showDevMessage } from "../../utils/devFeedback";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { navigate as rootNavigate } from "../../navigation/navigationRef";
import { DEFAULT_SEARCH_FILTERS } from "../../data/searchFilters";

function sellerIdOf(row) {
  const id = row?.id ?? row?.userId ?? row?.sellerId ?? row?.user?.id;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function sellerDisplayName(row, t) {
  const name =
    row?.displayName ||
    [row?.prenom, row?.nom].filter(Boolean).join(" ").trim() ||
    row?.name ||
    "";
  if (name) return name;
  const id = sellerIdOf(row);
  return id
    ? t("mobile.favorites.sellerFallback", { id })
    : t("annonceDetail.memberBi3oo");
}

function filtersFromSavedSearch(item) {
  const raw = item?.filters;
  if (!raw || typeof raw !== "object") return undefined;
  const { q: _q, query: _query, search: _search, ...rest } = raw;
  return { ...DEFAULT_SEARCH_FILTERS, ...rest };
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.content)) return value.content;
  return [];
}

export default function FavoritesContent() {
  const { t } = useAppLanguage();
  const navigation = useNavigation();
  const tabBarInset = useTabBarInset();
  const {
    products,
    isFavorite,
    toggleFavorite,
    removeSavedSeller,
    isLoading,
    isError,
    refetch,
  } = useFavorites();
  const {
    data: savedSearchesData,
    isLoading: searchesLoading,
    isError: searchesError,
    refetch: refetchSearches,
    isFetching: searchesFetching,
  } = useSavedSearches();
  const deleteSearch = useDeleteSavedSearch();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const {
    data: followedSellersPage,
    isLoading: sellersLoading,
    isError: sellersError,
    refetch: refetchSellers,
    isFetching: sellersFetching,
  } = useFollowedSellers();

  const [activeTab, setActiveTab] = useState("annonces");
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState(0);

  const handleTabSelect = useCallback((id) => {
    setActiveTab(id);
    // Ne pas filtrer les autres onglets avec le texte saisi sur Favoris annonces.
    setSearchQuery("");
  }, []);

  const savedSearches = asArray(savedSearchesData);
  const sellers = useMemo(
    () => asArray(followedSellersPage).filter((s) => sellerIdOf(s) != null),
    [followedSellersPage]
  );

  const go = useCallback(
    (name, params) => {
      try {
        const parent = navigation.getParent?.();
        if (parent?.navigate) {
          parent.navigate(name, params);
          return;
        }
        if (navigation.navigate) {
          navigation.navigate(name, params);
          return;
        }
        rootNavigate(name, params);
      } catch {
        rootNavigate(name, params);
      }
    },
    [navigation]
  );

  const favoritesTabs = useMemo(
    () => [
      {
        id: "annonces",
        label: t("mobile.favorites.tabs.listings"),
        count: asArray(products).length,
      },
      {
        id: "recherches",
        label: t("mobile.favorites.tabs.searches"),
        count: savedSearches.length,
      },
      {
        id: "vendeurs",
        label: t("mobile.favorites.tabs.sellers"),
        count: sellers.length,
      },
    ],
    [t, products, savedSearches.length, sellers.length]
  );

  const visibleProducts = useMemo(() => {
    const list = asArray(products);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        String(p?.title || "")
          .toLowerCase()
          .includes(q) ||
        String(p?.location || "")
          .toLowerCase()
          .includes(q)
    );
  }, [products, searchQuery]);

  const filteredSearches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return savedSearches;
    return savedSearches.filter((s) => {
      const label = String(s?.label ?? s?.titre ?? s?.query ?? "");
      return label.toLowerCase().includes(q);
    });
  }, [savedSearches, searchQuery]);

  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) =>
      sellerDisplayName(s, t).toLowerCase().includes(q)
    );
  }, [sellers, searchQuery, t]);

  const onRefresh = useCallback(() => {
    refetch?.();
    refetchSearches?.();
    refetchSellers?.();
  }, [refetch, refetchSearches, refetchSellers]);

  useFocusEffect(
    useCallback(() => {
      refetchSearches?.();
      refetchSellers?.();
    }, [refetchSearches, refetchSellers])
  );

  const openSavedSearch = (item) => {
    const query = String(item?.query ?? item?.label ?? "").trim();
    go("Search", {
      initialQuery: query,
      filters: filtersFromSavedSearch(item),
    });
  };

  const refreshing =
    activeTab === "annonces"
      ? Boolean(isLoading)
      : activeTab === "recherches"
        ? Boolean(searchesLoading || searchesFetching)
        : Boolean(sellersLoading || sellersFetching);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerBlock}>
        <HomeHeader
          onNotificationPress={() => go("Notifications")}
          onLogoPress={() => {
            try {
              navigation.navigate("Home");
            } catch {
              go("MainTabs", { screen: "Home" });
            }
          }}
        />
        {Number(unreadCount) > 0 ? (
          <Text style={styles.unreadHint}>
            {t("mobile.favorites.unread", { count: Number(unreadCount) || 0 })}
          </Text>
        ) : null}
        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => go("Search")}
          placeholder={
            activeTab === "vendeurs"
              ? t("mobile.favorites.searchSellersPlaceholder")
              : activeTab === "recherches"
                ? t("mobile.favorites.searchSearchesPlaceholder")
                : undefined
          }
        />
        <FavoritesTabs
          tabs={favoritesTabs}
          activeId={activeTab}
          onSelect={handleTabSelect}
        />
      </View>

      {activeTab === "annonces" ? (
        <FlatList
          style={styles.flex}
          data={visibleProducts}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarInset },
            visibleProducts.length === 0 && styles.listEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {isLoading && visibleProducts.length === 0 ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loader}
                />
              ) : null}
              {isError ? (
                <TouchableOpacity onPress={onRefresh}>
                  <Text style={styles.error}>
                    {t("mobile.favorites.loadError")}
                  </Text>
                  <Text style={styles.retry}>{t("mobile.common.retry")}</Text>
                </TouchableOpacity>
              ) : null}
              {!isLoading && !isError && visibleProducts.length === 0 ? (
                <Text style={styles.empty}>
                  {t("favoritesUi.emptyHint", {
                    defaultValue: t("mobile.favorites.searchesEmpty"),
                  })}
                </Text>
              ) : null}
            </>
          }
          ListFooterComponent={
            visibleProducts.length > 0 ? (
              <ExperienceRatingCard
                rating={rating}
                onRate={(value) => {
                  setRating(value);
                  showDevMessage(
                    t("mobile.favorites.ratingThanks"),
                    t("mobile.favorites.ratingMessage", { value })
                  );
                }}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <MarketplaceProductCard
              product={item}
              isFavorite={isFavorite(item.id)}
              onPress={() =>
                go("ProductDetail", {
                  product: normalizeProduct(item),
                  annonceId: item.id,
                })
              }
              onToggleFavorite={toggleFavorite}
            />
          )}
        />
      ) : null}

      {activeTab === "recherches" ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarInset },
            filteredSearches.length === 0 && styles.listEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {searchesLoading && filteredSearches.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}
          {searchesError ? (
            <TouchableOpacity onPress={() => refetchSearches?.()}>
              <Text style={styles.error}>
                {t("mobile.favorites.searchesLoadError")}
              </Text>
              <Text style={styles.retry}>{t("mobile.common.retry")}</Text>
            </TouchableOpacity>
          ) : null}
          {!searchesLoading && !searchesError && filteredSearches.length === 0 ? (
            <Text style={styles.empty}>
              {t("mobile.favorites.searchesEmpty")}
            </Text>
          ) : null}
          {filteredSearches.length > 0 ? (
            <Text style={styles.sectionCount}>
              {t("mobile.favorites.resultsCount", {
                count: filteredSearches.length,
              })}
            </Text>
          ) : null}
          {filteredSearches.map((item) => {
            const label =
              item?.label ??
              item?.titre ??
              item?.query ??
              t("mobile.favorites.defaultSearch");
            return (
              <View key={String(item?.id)} style={styles.row}>
                <TouchableOpacity
                  style={styles.rowMain}
                  activeOpacity={0.85}
                  onPress={() => openSavedSearch(item)}
                >
                  <View style={styles.searchIcon}>
                    <Ionicons
                      name="search-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {String(label)}
                    </Text>
                    {item?.createdAt ? (
                      <Text style={styles.rowMeta}>
                        {String(item.createdAt).slice(0, 10)}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteSearch.mutate(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.delete}>{t("mobile.common.delete")}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : null}

      {activeTab === "vendeurs" ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: tabBarInset },
            filteredSellers.length === 0 && styles.listEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {sellersLoading && filteredSellers.length === 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : null}
          {sellersError ? (
            <TouchableOpacity onPress={() => refetchSellers?.()}>
              <Text style={styles.error}>
                {t("mobile.favorites.sellersLoadError")}
              </Text>
              <Text style={styles.retry}>{t("mobile.common.retry")}</Text>
            </TouchableOpacity>
          ) : null}
          {!sellersLoading && !sellersError && filteredSellers.length === 0 ? (
            <Text style={styles.empty}>
              {t("mobile.favorites.sellersEmpty")}
            </Text>
          ) : null}
          {filteredSellers.length > 0 ? (
            <Text style={styles.sectionCount}>
              {t("mobile.favorites.resultsCount", {
                count: filteredSellers.length,
              })}
            </Text>
          ) : null}
          {filteredSellers.map((item) => {
            const id = sellerIdOf(item);
            const name = sellerDisplayName(item, t);
            const avatar = resolveMediaUrl(item?.photoUrl) || "";
            const listings = Number(item?.adsCount ?? 0) || 0;
            return (
              <View key={String(id)} style={styles.row}>
                <TouchableOpacity
                  style={styles.rowMain}
                  activeOpacity={0.85}
                  onPress={() =>
                    go("SellerProfile", {
                      sellerId: id,
                      sellerName: name,
                      sellerAvatar: avatar,
                    })
                  }
                >
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons
                        name="person"
                        size={22}
                        color={colors.iconMuted}
                      />
                    </View>
                  )}
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {t("mobile.favorites.listingsCount", {
                        count: listings,
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => removeSavedSeller?.(id)}
                  accessibilityLabel={t("profileUi.unfollow")}
                >
                  <Ionicons name="heart" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    zIndex: 2,
    backgroundColor: colors.white,
  },
  list: {
    paddingHorizontal: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
  },
  retry: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 24,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  unreadHint: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(201, 0, 23, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallback: {},
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textDark,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  delete: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
