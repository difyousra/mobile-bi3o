import { useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "../home/HomeHeader";
import HomeSearchBar from "../home/HomeSearchBar";
import FavoritesTabs from "./FavoritesTabs";
import ExperienceRatingCard from "./ExperienceRatingCard";
import MarketplaceProductCard from "../home/MarketplaceProductCard";
import SavedSellerRow from "./SavedSellerRow";
import { FAVORITES_TABS } from "../../data/mockFavoritesData";
import { useFavorites } from "../../context/FavoritesContext";
import {
  useFollowedSellers,
  useSavedSearches,
  useDeleteSavedSearch,
  useUnreadNotificationsCount,
} from "../../hooks/useEngagement";
import { normalizeProduct } from "../../utils/productMapper";
import { showDevMessage } from "../../utils/devFeedback";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";

export default function FavoritesContent() {
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
  const { data: savedSearches = [], refetch: refetchSearches } =
    useSavedSearches();
  const deleteSearch = useDeleteSavedSearch();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const {
    data: followedSellersPage,
    isLoading: sellersLoading,
    isError: sellersError,
    refetch: refetchSellers,
  } = useFollowedSellers();

  const [activeTab, setActiveTab] = useState("annonces");
  const [searchQuery, setSearchQuery] = useState("");
  const [rating, setRating] = useState(0);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
  };

  const visibleProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
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

  const handleChatPress = () => {
    navigation.navigate("Messages");
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const handleFilterPress = () => {
    navigation.navigate("Search");
  };

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", {
      product: normalizeProduct(product),
      annonceId: product.id,
    });
  };

  const handleRate = (value) => {
    setRating(value);
    showDevMessage("Merci !", `Vous avez noté ${value}/5 étoiles.`);
  };

  const onRefresh = () => {
    refetch();
    refetchSearches();
    refetchSellers();
  };

  const renderHeader = () => (
    <>
      <HomeHeader
        onNotificationPress={handleNotificationPress}
      />
      {unreadCount > 0 ? (
        <Text style={styles.unreadHint}>
          {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
          {unreadCount > 1 ? "s" : ""}
        </Text>
      ) : null}
      <HomeSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={handleFilterPress}
      />
      <FavoritesTabs
        tabs={FAVORITES_TABS}
        activeId={activeTab}
        onSelect={handleTabSelect}
      />
    </>
  );

  if (activeTab === "annonces") {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <FlatList
          data={visibleProducts}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {renderHeader()}
              {isLoading && products.length === 0 ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginVertical: 24 }}
                />
              ) : null}
              {isError ? (
                <Text style={styles.error}>
                  Impossible de charger les favoris (JWT requis).
                </Text>
              ) : null}
              {!isLoading && visibleProducts.length === 0 ? (
                <Text style={styles.empty}>Aucun favori pour le moment.</Text>
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
              onPress={handleProductPress}
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
        <FlatList
          data={filteredSearches}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Aucune recherche sauvegardée. Utilisez « Save Search » dans
              Recherche.
            </Text>
          }
          renderItem={({ item }) => {
            const label = item.label ?? item.titre ?? item.query ?? "Recherche";
            return (
              <View style={styles.searchRow}>
                <TouchableOpacity
                  style={styles.searchMain}
                  onPress={() =>
                    navigation.navigate("Search", {
                      initialQuery: item.query ?? item.titre ?? "",
                    })
                  }
                >
                  <Text style={styles.searchLabel}>{label}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteSearch.mutate(item.id)}
                >
                  <Text style={styles.delete}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  if (activeTab === "vendeurs") {
    const sellers = Array.isArray(followedSellersPage)
      ? followedSellersPage
      : followedSellersPage?.content ?? [];

    const filteredSellers = (() => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return sellers;
      return sellers.filter((s) =>
        String(s?.displayName ?? s?.nom ?? s?.prenom ?? "")
          .toLowerCase()
          .includes(q)
      );
    })();

    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <FlatList
          data={filteredSellers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            !sellersLoading && !sellersError ? (
              <Text style={styles.empty}>Aucun vendeur suivi.</Text>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={Boolean(isLoading || sellersLoading)}
              onRefresh={onRefresh}
            />
          }
          renderItem={({ item }) => {
            const seller = {
              id: item.id,
              name:
                item.displayName ??
                [item.prenom, item.nom].filter(Boolean).join(" ") ??
                `Vendeur #${item.id}`,
              avatar: item.photoUrl ?? "",
              listings: Number(item.adsCount ?? 0),
              rating: 0,
            };

            return (
              <SavedSellerRow
                seller={seller}
                onPress={() =>
                  navigation.navigate("SellerProfile", {
                    sellerId: item.id,
                    sellerName: seller.name,
                    sellerAvatar: seller.avatar,
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

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginVertical: 12,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 24,
    fontSize: 14,
    lineHeight: 20,
  },
  unreadHint: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  searchMain: {
    flex: 1,
  },
  searchLabel: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: "500",
  },
  delete: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
