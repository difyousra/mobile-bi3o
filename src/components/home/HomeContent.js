import { useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "./HomeHeader";
import HomeSearchBar from "./HomeSearchBar";
import CategoryChips from "./CategoryChips";
import CategorySubSheet from "./CategorySubSheet";
import PromoBanner from "./PromoBanner";
import SectionHeader from "./SectionHeader";
import MarketplaceProductCard from "./MarketplaceProductCard";
import { PROMO_BANNERS } from "../../data/mockHomeData";
import {
  useCategoryChips,
  useInfinitePublicAds,
  useSousCategories,
  useExchangeRate,
} from "../../hooks/useCatalog";
import { useFavorites } from "../../context/FavoritesContext";
import { normalizeProduct } from "../../utils/productMapper";
import { resolveExchangeRates } from "../../services/exchangeService";
import { colors } from "../../theme/colors";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { subcategoryNodeLabel } from "../../i18n/taxonomyLabels";

export default function HomeContent() {
  const { t } = useAppLanguage();
  const navigation = useNavigation();
  const tabBarInset = useTabBarInset();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSousCategorie, setActiveSousCategorie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subSheetVisible, setSubSheetVisible] = useState(false);
  const [sheetCategory, setSheetCategory] = useState(null);

  const { data: exchange } = useExchangeRate();
  const priceRates = useMemo(
    () => resolveExchangeRates(exchange),
    [exchange]
  );

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

  const resolveSousForCategory = (catId) => {
    if (catId == null || Number.isNaN(Number(catId))) return [];
    const id = Number(catId);
    const fromFlat = allSous.filter((s) => Number(s.categorieId) === id);
    if (fromFlat.length > 0) {
      return fromFlat.map((s) => ({
        ...s,
        nom: subcategoryNodeLabel(s, t),
      }));
    }

    const node = (tree ?? []).find((n) => Number(n.id) === id);
    const nested = node?.sousCategories ?? node?.children ?? [];
    return nested.map((s) => ({
      id: s.id,
      nom: subcategoryNodeLabel(s, t),
      categorieId: id,
    }));
  };

  const sheetSousCategories = useMemo(() => {
    const catId = sheetCategory?.rawId ?? sheetCategory?.id;
    return resolveSousForCategory(catId);
  }, [sheetCategory, allSous, tree, t]);

  const {
    products,
    isLoading: adsLoading,
    isError: adsError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchAds,
  } = useInfinitePublicAds({
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

  const goToCategoryResults = (categorieId, sousCategorieId, categoryLabel) => {
    navigation.navigate("Search", {
      initialQuery: searchQuery,
      filters: {
        location: t("categoryUi.allAlgeria"),
        categorieId: Number(categorieId),
        sousCategorieId: sousCategorieId != null ? Number(sousCategorieId) : null,
        priceMin: "",
        priceMax: "",
      },
      categoryLabel: categoryLabel ?? t("mobile.home.listingsSection"),
    });
  };

  const handleCategorySelect = (id) => {
    setActiveCategory(id);
    setActiveSousCategorie(null);

    if (id === "all") return;

    const chip = chips.find((c) => String(c.id) === String(id));
    const category = chip ?? { id, rawId: Number(id), label: t("mobile.home.defaultCategory") };
    const sous = resolveSousForCategory(id);

    // Pas de sous-catégorie → résultats catégorie directement
    if (sous.length === 0) {
      goToCategoryResults(id, null, category.label);
      return;
    }

    setSheetCategory(category);
    setSubSheetVisible(true);
  };

  const closeSubSheet = () => {
    setSubSheetVisible(false);
    setSheetCategory(null);
  };

  const handleSheetParentSelect = (category) => {
    const catId = category?.rawId ?? category?.id;
    closeSubSheet();
    setActiveCategory(String(catId));
    setActiveSousCategorie(null);
    goToCategoryResults(catId, null, category?.label);
  };

  const handleSheetSousSelect = (sous) => {
    const catId = sheetCategory?.rawId ?? sheetCategory?.id;
    closeSubSheet();
    setActiveCategory(String(catId));
    setActiveSousCategorie(sous.id);
    goToCategoryResults(catId, sous.id, sheetCategory?.label);
  };

  const buildSearchFilters = () => ({
    location: t("categoryUi.allAlgeria"),
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

  const listHeader = (
    <View>
      <HomeHeader
        onNotificationPress={handleNotificationPress}
        onLogoPress={() =>
          navigation.navigate("MainTabs", { screen: "Home" })
        }
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
        onVoiceFinalResult={(text) =>
          navigation.navigate("Search", {
            initialQuery: text,
            filters: buildSearchFilters(),
          })
        }
      />

      <CategoryChips
        categories={chips}
        activeId={activeCategory}
        onSelect={handleCategorySelect}
      />

      <PromoBanner banners={PROMO_BANNERS} onCtaPress={handleBannerCta} />

      <SectionHeader
        title={t("mobile.home.listingsSection")}
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
        <Text style={styles.error}>{t("mobile.home.loadCatalogError")}</Text>
      ) : null}

      {!loading && filteredProducts.length === 0 ? (
        <Text style={styles.empty}>{t("mobile.home.emptyListings")}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={loading ? [] : filteredProducts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        ListHeaderComponent={listHeader}
        onEndReached={() => {
          if (loading || isFetchingNextPage || !hasNextPage) return;
          fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <MarketplaceProductCard
            product={item}
            isFavorite={isFavorite(item.id)}
            onPress={handleProductPress}
            onToggleFavorite={toggleFavorite}
            rates={priceRates}
          />
        )}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
      />

      <CategorySubSheet
        visible={subSheetVisible}
        category={sheetCategory}
        sousCategories={sheetSousCategories}
        onClose={closeSubSheet}
        onSelectParent={handleSheetParentSelect}
        onSelectSous={handleSheetSousSelect}
        onMortgagePress={() => {
          closeSubSheet();
          navigation.navigate("MortgageSimulator", {});
        }}
        onVehicleSimPress={() => {
          closeSubSheet();
          navigation.navigate("VehicleSimulator", {});
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
  scroll: {
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
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
});
