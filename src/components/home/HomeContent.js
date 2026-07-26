import { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "./HomeHeader";
import HomeSearchBar from "./HomeSearchBar";
import CategoryChips from "./CategoryChips";
import PromoBanner from "./PromoBanner";
import SectionHeader from "./SectionHeader";
import MarketplaceProductCard from "./MarketplaceProductCard";
import { PROMO_BANNERS } from "../../data/mockHomeData";
import {
  useCategoryChips,
  usePublicAds,
  useSousCategories,
} from "../../hooks/useCatalog";
import { useFavorites } from "../../context/FavoritesContext";
import { normalizeProduct } from "../../utils/productMapper";
import { colors } from "../../theme/colors";

function ProductGrid({ children }) {
  return <View style={styles.grid}>{children}</View>;
}

export default function HomeContent() {
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSousCategorie, setActiveSousCategorie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    chips,
    data: tree,
    isLoading: taxoLoading,
    isError: taxoError,
    refetch: refetchTaxo,
  } = useCategoryChips();

  const { data: allSous = [] } = useSousCategories();

  const categorieId =
    activeCategory === "all" ? "all" : Number(activeCategory);

  const sousForCategory = useMemo(() => {
    if (activeCategory === "all" || Number.isNaN(Number(activeCategory))) {
      return [];
    }
    const catId = Number(activeCategory);
    const fromFlat = allSous.filter((s) => Number(s.categorieId) === catId);
    if (fromFlat.length > 0) return fromFlat;

    const node = (tree ?? []).find((n) => Number(n.id) === catId);
    const nested = node?.sousCategories ?? node?.children ?? [];
    return nested.map((s) => ({
      id: s.id,
      nom: s.nom ?? s.name ?? `Sous ${s.id}`,
      categorieId: catId,
    }));
  }, [activeCategory, allSous, tree]);

  const {
    products,
    isLoading: adsLoading,
    isError: adsError,
    isRefetching,
    refetch: refetchAds,
    pageData,
  } = usePublicAds({
    page: 0,
    size: 24,
    categorieId,
    sousCategorieId: activeSousCategorie,
  });

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleProductPress = (product) => {
    navigation.navigate("ProductDetail", {
      product: normalizeProduct(product),
      annonceId: product.id,
    });
  };

  const handleCategorySelect = (id) => {
    setActiveCategory(id);
    setActiveSousCategorie(null);
  };

  const buildSearchFilters = () => ({
    location: "Toute l'Algérie",
    categorieId: activeCategory === "all" ? null : Number(activeCategory),
    sousCategorieId: activeSousCategorie,
    priceMin: "",
    priceMax: "",
  });

  const handleFilterPress = () => {
    navigation.navigate("Search", {
      initialQuery: searchQuery,
      filters: buildSearchFilters(),
    });
  };

  const handleChatPress = () => {
    navigation.navigate("Messages");
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const handleBannerCta = () => {
    navigation.navigate("Search");
  };

  const onRefresh = () => {
    refetchTaxo();
    refetchAds();
  };

  const loading = taxoLoading || adsLoading;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      >
        <HomeHeader
          onChatPress={handleChatPress}
          onNotificationPress={handleNotificationPress}
        />

        <HomeSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={handleFilterPress}
          onSubmitEditing={() =>
            navigation.navigate("Search", {
              initialQuery: searchQuery,
              filters: buildSearchFilters(),
            })
          }
        />

        <CategoryChips
          categories={chips}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
        />

        {sousForCategory.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sousRow}
          >
            <TouchableOpacity
              style={[
                styles.sousChip,
                activeSousCategorie == null && styles.sousChipActive,
              ]}
              onPress={() => setActiveSousCategorie(null)}
            >
              <Text
                style={[
                  styles.sousText,
                  activeSousCategorie == null && styles.sousTextActive,
                ]}
              >
                Toutes
              </Text>
            </TouchableOpacity>
            {sousForCategory.map((sc) => {
              const active = Number(activeSousCategorie) === Number(sc.id);
              return (
                <TouchableOpacity
                  key={sc.id}
                  style={[styles.sousChip, active && styles.sousChipActive]}
                  onPress={() => setActiveSousCategorie(sc.id)}
                >
                  <Text
                    style={[styles.sousText, active && styles.sousTextActive]}
                  >
                    {sc.nom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        <PromoBanner banners={PROMO_BANNERS} onCtaPress={handleBannerCta} />

        <SectionHeader
          title="Annonces"
          icon="pricetag"
          iconColor={colors.primary}
        />

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            color={colors.primary}
            size="large"
          />
        ) : null}

        {(taxoError || adsError) && !loading ? (
          <Text style={styles.error}>
            Impossible de charger le catalogue. Tirez pour réessayer.
          </Text>
        ) : null}

        {!loading && filteredProducts.length === 0 ? (
          <Text style={styles.empty}>Aucune annonce pour le moment.</Text>
        ) : null}

        <ProductGrid>
          {filteredProducts.map((product) => (
            <MarketplaceProductCard
              key={product.id}
              product={product}
              isFavorite={isFavorite(product.id)}
              onPress={handleProductPress}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </ProductGrid>

        {pageData && !pageData.last ? (
          <Text style={styles.hint}>
            {pageData.totalElements} annonces — page {pageData.number + 1}/
            {pageData.totalPages}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sousRow: {
    gap: 8,
    paddingBottom: 14,
  },
  sousChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  sousChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(201, 0, 23, 0.08)",
  },
  sousText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sousTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    color: "#D32F2F",
    textAlign: "center",
    marginVertical: 16,
    fontSize: 14,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginVertical: 24,
    fontSize: 14,
  },
  hint: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
  },
});
