import { useEffect, useMemo, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "../home/HomeHeader";
import HomeSearchBar from "../home/HomeSearchBar";
import CategoryResultsToolbar from "./CategoryResultsToolbar";
import CategoriesListSheet from "./CategoriesListSheet";
import CategorySubSheet from "../home/CategorySubSheet";
import LocationFilterSheet from "./LocationFilterSheet";
import SearchQueryBanner from "./SearchQueryBanner";
import SearchEmptyState from "./SearchEmptyState";
import ListingCard from "./ListingCard";
import SaveSearchButton from "./SaveSearchButton";
import { SORT_OPTIONS } from "../../data/mockListingsData";
import {
  DEFAULT_SEARCH_FILTERS,
  countActiveFilters,
} from "../../data/searchFilters";
import { useFavorites } from "../../context/FavoritesContext";
import {
  useSearchAds,
  useExchangeRate,
  useSuggestions,
  useCategoryChips,
  useSousCategories,
} from "../../hooks/useCatalog";
import { mapAdCardToListing } from "../../models/adMapper";
import { resolveExchangeRates } from "../../services/exchangeService";
import { useCreateSavedSearch } from "../../hooks/useEngagement";
import { normalizeSuggestions } from "../../utils/profileHelpers";
import { showDevMessage } from "../../utils/devFeedback";
import { normalizeListing } from "../../utils/productMapper";
import { colors } from "../../theme/colors";
import { AppApiError, userFacingMessage } from "../../api/errorHandler";
import { useTabBarInset } from "../../hooks/useTabBarInset";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import { subcategoryNodeLabel } from "../../i18n/taxonomyLabels";

const SORT_LABEL_KEYS = {
  relevance: "filters.sortRelevance",
  price_asc: "filters.sortPriceAsc",
  price_desc: "filters.sortPriceDesc",
  recent: "filters.sortRecent",
};

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function SearchContent({
  initialQuery = "",
  initialFilters,
  categoryLabel: initialCategoryLabel,
}) {
  const { t } = useAppLanguage();
  const navigation = useNavigation();
  const tabBarInset = useTabBarInset();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(() =>
    initialFilters
      ? { ...DEFAULT_SEARCH_FILTERS, ...initialFilters }
      : DEFAULT_SEARCH_FILTERS
  );
  const [sortId, setSortId] = useState("relevance");
  const [activeMode, setActiveMode] = useState(null);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [categoriesSheetVisible, setCategoriesSheetVisible] = useState(false);
  const [subSheetVisible, setSubSheetVisible] = useState(false);
  const [sheetCategory, setSheetCategory] = useState(null);
  const [pageSize, setPageSize] = useState(24);

  // Pour les résultats “catégorie-only” on veut réagir instantanément.
  const debouncedQuery = useDebouncedValue(
    searchQuery,
    filters.categorieId ? 0 : 400
  );
  const { data: exchange } = useExchangeRate();
  const priceRates = useMemo(
    () => resolveExchangeRates(exchange),
    [exchange]
  );
  const { eurToDzd, officialRate } = priceRates;
  const { chips, data: tree } = useCategoryChips();
  const { data: allSous = [] } = useSousCategories();

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

  const categorieId = filters.categorieId ? Number(filters.categorieId) : null;
  const sousCategorieId = filters.sousCategorieId
    ? Number(filters.sousCategorieId)
    : null;
  const attributs = filters.attributs ?? [];
  const prixMin = filters.prixMin ? Number(filters.prixMin) : null;
  const prixMax = filters.prixMax ? Number(filters.prixMax) : null;
  const annonceType = filters.type ?? null;
  const disponibiliteDateArrivee = filters.disponibiliteDateArrivee ?? null;
  const disponibiliteDateDepart = filters.disponibiliteDateDepart ?? null;

  const { pageData, isLoading, isError, isFetching } = useSearchAds(
    debouncedQuery,
    0,
    pageSize,
    {
      categorieId,
      sousCategorieId,
      attributs,
      prixMin,
      prixMax,
      type: annonceType,
      disponibiliteDateArrivee,
      disponibiliteDateDepart,
    }
  );

  const { data: suggestionsRaw } = useSuggestions(debouncedQuery, 6);
  const suggestions = useMemo(
    () => normalizeSuggestions(suggestionsRaw),
    [suggestionsRaw]
  );

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialFilters) {
      setFilters({ ...DEFAULT_SEARCH_FILTERS, ...initialFilters });
    }
  }, [initialFilters]);

  // “Pagination” mobile : quand les critères changent, on repart de 24.
  useEffect(() => {
    setPageSize(24);
  }, [
    debouncedQuery,
    filters.categorieId,
    filters.sousCategorieId,
    filters.location,
    filters.prixMin,
    filters.prixMax,
    filters.type,
    filters.disponibiliteDateArrivee,
    filters.disponibiliteDateDepart,
  ]);

  const activeFilters =
    countActiveFilters(filters) + (attributs.length > 0 ? 1 : 0);
  const location = filters.location ?? DEFAULT_SEARCH_FILTERS.location;
  const sortLabel = t(SORT_LABEL_KEYS[sortId] ?? SORT_LABEL_KEYS.relevance);

  const categoryChipLabel = useMemo(() => {
    if (initialCategoryLabel) return initialCategoryLabel;
    if (categorieId) {
      const chip = chips.find((c) => Number(c.rawId) === Number(categorieId));
      if (chip?.label) return chip.label;
    }
    return "";
  }, [initialCategoryLabel, categorieId, chips]);

  const resultsTitle = useMemo(() => {
    if (categoryChipLabel) {
      return t("categoryUi.adsTitleWithLabel", { label: categoryChipLabel });
    }
    if (searchQuery.trim()) return t("mobile.search.results");
    return t("categoryUi.adsTitle");
  }, [categoryChipLabel, searchQuery, t]);

  const listings = useMemo(() => {
    let items = (pageData?.content ?? []).map((ad) =>
      mapAdCardToListing(ad, { eurToDzd, officialRate })
    );

    if (location && location !== "Toute l'Algérie") {
      const loc = location.toLowerCase();
      items = items.filter((l) => l.location.toLowerCase().includes(loc));
    }

    const min = Number(String(filters.priceMin ?? "").replace(/\s/g, ""));
    const max = Number(String(filters.priceMax ?? "").replace(/\s/g, ""));
    if (Number.isFinite(min) && filters.priceMin?.trim()) {
      items = items.filter((l) => l.priceDzd >= min);
    }
    if (Number.isFinite(max) && filters.priceMax?.trim()) {
      items = items.filter((l) => l.priceDzd <= max);
    }

    if (sortId === "price_asc") {
      items = [...items].sort(
        (a, b) => Number(a.priceDzd ?? 0) - Number(b.priceDzd ?? 0)
      );
    } else if (sortId === "price_desc") {
      items = [...items].sort(
        (a, b) => Number(b.priceDzd ?? 0) - Number(a.priceDzd ?? 0)
      );
    } else {
      // Pertinence / Plus récent : plus récent d'abord
      items = [...items].sort((a, b) => {
        const ad = a.createdAt ? Date.parse(String(a.createdAt)) : NaN;
        const bd = b.createdAt ? Date.parse(String(b.createdAt)) : NaN;
        if (Number.isFinite(ad) && Number.isFinite(bd) && ad !== bd) {
          return bd - ad;
        }
        const ai = Number.parseInt(String(a.id ?? "0"), 10) || 0;
        const bi = Number.parseInt(String(b.id ?? "0"), 10) || 0;
        return bi - ai;
      });
    }

    return items;
  }, [
    pageData,
    location,
    sortId,
    eurToDzd,
    officialRate,
    filters.priceMin,
    filters.priceMax,
  ]);

  const hasActiveSearch =
    searchQuery.trim().length > 0 ||
    Boolean(categorieId) ||
    Boolean(sousCategorieId) ||
    activeFilters > 0;
  const isEmptySearch =
    hasActiveSearch && !isLoading && !isFetching && listings.length === 0;

  const clearSearch = () => setSearchQuery("");

  const openFilters = () => {
    setActiveMode("filters");
    navigation.navigate("SearchFilters", {
      searchQuery,
      filters,
    });
  };

  const handleListingPress = (listing) => {
    navigation.navigate("ProductDetail", {
      product: normalizeListing(listing),
      annonceId: listing.id,
    });
  };

  const handleMapPress = () => {
    setActiveMode("map");
    navigation.navigate("MapSearch", {
      searchQuery,
      filters,
      sortId,
    });
  };

  const handleLocationPress = () => {
    setActiveMode("location");
    setLocationSheetVisible(true);
  };

  const clearCategory = () => {
    setFilters((prev) => ({
      ...prev,
      categorieId: null,
      sousCategorieId: null,
    }));
  };

  const applyCategory = (categorieIdValue, sousCategorieIdValue = null) => {
    setFilters((prev) => ({
      ...prev,
      categorieId: categorieIdValue != null ? Number(categorieIdValue) : null,
      sousCategorieId:
        sousCategorieIdValue != null ? Number(sousCategorieIdValue) : null,
    }));
  };

  const openCategoriesSheet = () => {
    setActiveMode(null);
    setCategoriesSheetVisible(true);
  };

  const handleCategoriesSelectAll = () => {
    setCategoriesSheetVisible(false);
    clearCategory();
  };

  const handleCategoriesSelect = (category) => {
    const catId = category?.rawId ?? category?.id;
    const sous = resolveSousForCategory(catId);
    setCategoriesSheetVisible(false);

    if (sous.length === 0) {
      applyCategory(catId, null);
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
    applyCategory(catId, null);
  };

  const handleSheetSousSelect = (sous) => {
    const catId = sheetCategory?.rawId ?? sheetCategory?.id;
    closeSubSheet();
    applyCategory(catId, sous.id);
  };

  const handleSortPress = () => {
    Alert.alert(t("mobile.search.sortByTitle"), t("mobile.search.sortByPrompt"), [
      ...SORT_OPTIONS.map((option) => ({
        text: t(SORT_LABEL_KEYS[option.id] ?? option.id),
        onPress: () => setSortId(option.id),
      })),
      { text: t("mobile.common.cancel"), style: "cancel" },
    ]);
  };

  const createSavedSearch = useCreateSavedSearch();

  const handleSaveSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      showDevMessage(t("common.search"), t("mobile.search.saveKeywordRequired"));
      return;
    }
    try {
      await createSavedSearch.mutateAsync({
        query: q,
        label: q,
        filters: {
          categorieId: filters.categorieId ?? null,
          sousCategorieId: filters.sousCategorieId ?? null,
          location: filters.location,
          prixMin: filters.prixMin ?? filters.priceMin ?? null,
          prixMax: filters.prixMax ?? filters.priceMax ?? null,
          type: filters.type ?? null,
          attributs: filters.attributs ?? [],
        },
      });
      showDevMessage(
        t("mobile.search.saveSuccessTitle"),
        t("mobile.search.saveSuccessBody")
      );
    } catch (error) {
      const msg =
        error instanceof AppApiError
          ? userFacingMessage(error)
          : t("mobile.search.saveError");
      showDevMessage(t("mobile.common.error"), msg);
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  /** Compteur filtres hors catégorie (comme le badge web Filtres (N)). */
  const toolbarFilterCount = Math.max(
    0,
    activeFilters -
      (filters.categorieId ? 1 : 0) -
      (filters.sousCategorieId ? 1 : 0)
  );

  const showResultsToolbar = true;

  const renderListHeader = () => (
    <>
      <HomeHeader
        onNotificationPress={handleNotificationPress}
        onLogoPress={() =>
          navigation.navigate("MainTabs", { screen: "Home" })
        }
      />
      <HomeSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        showFilterButton={false}
      />

      {suggestions.length > 0 && searchQuery.trim().length >= 2 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsRow}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((label) => (
            <TouchableOpacity
              key={label}
              style={styles.suggestionChip}
              onPress={() => setSearchQuery(label)}
            >
              <Text style={styles.suggestionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {showResultsToolbar ? (
        <CategoryResultsToolbar
          title={resultsTitle}
          count={pageData?.totalElements ?? listings.length}
          sortLabel={sortLabel}
          onSortPress={handleSortPress}
          activeFilters={toolbarFilterCount}
          location={location}
          activeMode={activeMode}
          onMapPress={handleMapPress}
          onFiltersPress={openFilters}
          onLocationPress={handleLocationPress}
          categoryLabel={categoryChipLabel}
          onCategoryPress={openCategoriesSheet}
          onClearCategory={clearCategory}
        />
      ) : null}

      {isEmptySearch ? (
        <SearchQueryBanner query={searchQuery} onClear={clearSearch} />
      ) : null}

      {isError ? (
        <Text style={styles.error}>{t("mobile.search.loadError")}</Text>
      ) : null}
      {(isLoading || isFetching) && listings.length === 0 ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginVertical: 16 }}
        />
      ) : null}
    </>
  );

  if (isEmptySearch) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyHeader}>{renderListHeader()}</View>
          <SearchEmptyState />
          <CategoriesListSheet
            visible={categoriesSheetVisible}
            categories={chips}
            onSelectAll={handleCategoriesSelectAll}
            onSelectCategory={handleCategoriesSelect}
            onClose={() => setCategoriesSheetVisible(false)}
          />
          <CategorySubSheet
            visible={subSheetVisible}
            category={sheetCategory}
            sousCategories={sheetSousCategories}
            onSelectParent={handleSheetParentSelect}
            onSelectSous={handleSheetSousSelect}
            onClose={closeSubSheet}
          />
          <LocationFilterSheet
            visible={locationSheetVisible}
            selected={location}
            onSelect={(label) =>
              setFilters((prev) => ({ ...prev, location: label }))
            }
            onClose={() => {
              setLocationSheetVisible(false);
              setActiveMode(null);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarInset }]}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (isLoading || isFetching) return;
            if (!pageData) return;
            const total = pageData.totalElements ?? 0;
            if (listings.length >= total) return;
            setPageSize((s) => s + 24);
          }}
          onEndReachedThreshold={0.7}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={
            !isLoading && !isFetching && !hasActiveSearch ? (
              <Text style={styles.hint}>{t("mobile.search.emptyHint")}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              isFavorite={isFavorite(item.id)}
              onPress={handleListingPress}
              onToggleFavorite={toggleFavorite}
              rates={priceRates}
            />
          )}
          ListFooterComponent={
            isFetching && listings.length > 0 ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />

        <SaveSearchButton onPress={handleSaveSearch} />
        <CategoriesListSheet
          visible={categoriesSheetVisible}
          categories={chips}
          onSelectAll={handleCategoriesSelectAll}
          onSelectCategory={handleCategoriesSelect}
          onClose={() => setCategoriesSheetVisible(false)}
        />
        <CategorySubSheet
          visible={subSheetVisible}
          category={sheetCategory}
          sousCategories={sheetSousCategories}
          onSelectParent={handleSheetParentSelect}
          onSelectSous={handleSheetSousSelect}
          onClose={closeSubSheet}
        />
        <LocationFilterSheet
          visible={locationSheetVisible}
          selected={location}
          onSelect={(label) =>
            setFilters((prev) => ({ ...prev, location: label }))
          }
          onClose={() => {
            setLocationSheetVisible(false);
            setActiveMode(null);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyHeader: {
    paddingTop: 0,
  },
  list: {},
  error: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 8,
  },
  hint: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  suggestionsRow: {
    gap: 8,
    paddingVertical: 8,
    paddingRight: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.navy,
    fontWeight: "500",
  },
});
