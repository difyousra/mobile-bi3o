import { useCallback, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "../home/HomeHeader";
import HomeSearchBar from "../home/HomeSearchBar";
import FavoritesTabs from "./FavoritesTabs";
import ExperienceRatingCard from "./ExperienceRatingCard";
import MarketplaceProductCard from "../home/MarketplaceProductCard";
import SavedSellerRow from "./SavedSellerRow";
import SavedSearchRow from "./SavedSearchRow";
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

/** Retire les clés texte de recherche du payload filtres sauvegardé. */
function filtersFromSavedSearch(item) {
  const raw = item?.filters;
  if (!raw || typeof raw !== "object") return undefined;
  const {
    q: _q,
    query: _query,
    search: _search,
    ...rest
  } = raw;
  const merged = { ...DEFAULT_SEARCH_FILTERS, ...rest };
  return merged;
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
    data: savedSearches = [],
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

  const go = (name, params) => {
    // Remonte au stack racine si besoin (onglet Favoris → écrans stack).
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
  };

  const favoritesTabs = useMemo(
    () => [
      { id: "annonces", label: t("mobile.favorites.tabs.listings") },
      { id: "recherches", label: t("mobile.favorites.tabs.searches") },
      { id: "vendeurs", label: t("mobile.favorites.tabs.sellers") },
    ],
    [t]
  );

  const visibleProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.title || "")
          .toLowerCase()
          .includes(q) ||
        String(p.location || "")
          .toLowerCase()
          .includes(q)
    );
  }, [products, searchQuery]);

  const filteredSearches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return savedSearches;
    return savedSearches.filter((s) => {
      const label = String(s.label ?? s.titre ?? s.query ?? "");
      return label.toLowerCase().includes(q);
    });
  }, [savedSearches, searchQuery]);

  const sellers = useMemo(() => {
    const rows = Array.isArray(followedSellersPage)
      ? followedSellersPage
      : followedSellersPage?.content ?? [];
    return rows.filter((s) => sellerIdOf(s) != null);
  }, [followedSellersPage]);

  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter((s) =>
      sellerDisplayName(s, t).toLowerCase().includes(q)
    );
  }, [sellers, searchQuery, t]);

  const onRefresh = useCallback(() => {
    refetch();
    refetchSearches();
    refetchSellers();
  }, [refetch, refetchSearches, refetchSellers]);

  useFocusEffect(
    useCallback(() => {
      refetchSearches();
      refetchSellers();
    }, [refetchSearches, refetchSellers])
  );

  const handleRate = (value) => {
    setRating(value);
    showDevMessage(
      t("mobile.favorites.ratingThanks"),
      t("mobile.favorites.ratingMessage", { value })
    );
  };

  const openSavedSearch = (item) => {
    const query = String(item.query ?? item.label ?? "").trim();
    go("Search", {
      initialQuery: query,
      filters: filtersFromSavedSearch(item),
    });
  };

  const header = (
    <View style={styles.headerBlock}>
      <HomeHeader
        onNotificationPress={() => go("Notifications")}
        onLogoPress={() => {
          const parent = navigation.getParent?.();
          if (parent?.navigate) {
            parent.navigate("MainTabs", { screen: "Home" });
          } else {
            navigation.navigate("Home");
          }
        }}
      />
      {unreadCount > 0 ? (
        <Text style={styles.unreadHint}>
          {t("mobile.favorites.unread", { count: unreadCount })}
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
        onSelect={setActiveTab}
      />
    </View>
  );

  const listPadding = { paddingBottom: tabBarInset };

  if (activeTab === "annonces") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {header}
        <FlatList
          data={visibleProducts}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, listPadding]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {isLoading && products.length === 0 ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginVertical: 24 }}
                />
              ) : null}
              {isError ? (
                <TouchableOpacity onPress={onRefresh}>
                  <Text style={styles.error}>
                    {t("mobile.favorites.loadError")}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {!isLoading && visibleProducts.length === 0 ? (
                <Text style={styles.empty}>{t("favoritesUi.emptyHint")}</Text>
              ) : null}
            </>
          }
          ListFooterComponent={
            <ExperienceRatingCard rating={rating} onRate={handleRate} />
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
      </SafeAreaView>
    );
  }

  if (activeTab === "recherches") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {header}
        <FlatList
          data={filteredSearches}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, listPadding]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={Boolean(searchesLoading || searchesFetching)}
              onRefresh={onRefresh}
            />
          }
          ListHeaderComponent={
            <>
              {searchesLoading && filteredSearches.length === 0 ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginVertical: 24 }}
                />
              ) : null}
              {searchesError ? (
                <TouchableOpacity onPress={() => refetchSearches()}>
                  <Text style={styles.error}>
                    {t("mobile.favorites.searchesLoadError")}
                  </Text>
                  <Text style={styles.retry}>{t("mobile.common.retry")}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          }
          ListEmptyComponent={
            !searchesLoading && !searchesError ? (
              <Text style={styles.empty}>
                {t("mobile.favorites.searchesEmpty")}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const label =
              item.label ??
              item.titre ??
              item.query ??
              t("mobile.favorites.defaultSearch");
            return (
              <SavedSearchRow
                item={{
                  id: item.id,
                  query: label,
                  results: null,
                  date: item.createdAt
                    ? String(item.createdAt).slice(0, 10)
                    : "",
                }}
                onPress={() => openSavedSearch(item)}
                onRemove={(id) => deleteSearch.mutate(id)}
              />
            );
          }}
        />
      </SafeAreaView>
    );
  }

  // vendeurs
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {header}
      <FlatList
        data={filteredSellers}
        keyExtractor={(item) => String(sellerIdOf(item))}
        contentContainerStyle={[styles.list, listPadding]}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {sellersLoading && filteredSellers.length === 0 ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: 24 }}
              />
            ) : null}
            {sellersError ? (
              <TouchableOpacity onPress={() => refetchSellers()}>
                <Text style={styles.error}>
                  {t("mobile.favorites.sellersLoadError")}
                </Text>
                <Text style={styles.retry}>{t("mobile.common.retry")}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !sellersLoading && !sellersError ? (
            <Text style={styles.empty}>
              {t("mobile.favorites.sellersEmpty")}
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={Boolean(sellersLoading || sellersFetching)}
            onRefresh={onRefresh}
          />
        }
        renderItem={({ item }) => {
          const id = sellerIdOf(item);
          const name = sellerDisplayName(item, t);
          const avatar = resolveMediaUrl(item.photoUrl) || "";
          const seller = {
            id,
            name,
            avatar,
            listings: Number(item.adsCount ?? 0),
            rating: 0,
          };

          return (
            <SavedSellerRow
              seller={seller}
              onPress={() =>
                go("SellerProfile", {
                  sellerId: id,
                  sellerName: name,
                  sellerAvatar: avatar,
                })
              }
              onUnfollow={(sellerId) => removeSavedSeller(sellerId)}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    zIndex: 2,
    backgroundColor: colors.white,
  },
  list: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: "space-between",
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
});
