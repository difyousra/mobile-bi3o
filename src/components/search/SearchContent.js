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
import SearchFilterBar from "./SearchFilterBar";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchQueryBanner from "./SearchQueryBanner";
import SearchEmptyState from "./SearchEmptyState";
import ListingCard from "./ListingCard";
import SaveSearchButton from "./SaveSearchButton";
import { SORT_OPTIONS, LOCATIONS } from "../../data/mockListingsData";
import {
  DEFAULT_SEARCH_FILTERS,
  countActiveFilters,
} from "../../data/searchFilters";
import { useFavorites } from "../../context/FavoritesContext";
import {
  useSearchAds,
  useExchangeRate,
  useSuggestions,
} from "../../hooks/useCatalog";
import { mapAdCardToListing } from "../../models/adMapper";
import { extractEurToDzd } from "../../services/exchangeService";
import { useCreateSavedSearch } from "../../hooks/useEngagement";
import { normalizeSuggestions } from "../../utils/profileHelpers";
import { showDevMessage } from "../../utils/devFeedback";
import { normalizeListing } from "../../utils/productMapper";
import { colors } from "../../theme/colors";
import { AppApiError, userFacingMessage } from "../../api/errorHandler";

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
}) {
  const navigation = useNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(
    initialFilters ?? DEFAULT_SEARCH_FILTERS
  );
  const [sortId, setSortId] = useState("relevance");
  const [currencies, setCurrencies] = useState({});

  const debouncedQuery = useDebouncedValue(searchQuery, 400);
  const { data: exchange } = useExchangeRate();
  const eurToDzd = extractEurToDzd(exchange);

  const categorieId = filters.categorieId ? Number(filters.categorieId) : null;
  const sousCategorieId = filters.sousCategorieId
    ? Number(filters.sousCategorieId)
    : null;

  const { pageData, isLoading, isError, isFetching } = useSearchAds(
    debouncedQuery,
    0,
    24,
    { categorieId, sousCategorieId }
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
    if (initialFilters) setFilters(initialFilters);
  }, [initialFilters]);

  const activeFilters = countActiveFilters(filters);
  const location = filters.location ?? DEFAULT_SEARCH_FILTERS.location;
  const sortLabel =
    SORT_OPTIONS.find((option) => option.id === sortId)?.label ?? "Pertinence";

  const listings = useMemo(() => {
    let items = (pageData?.content ?? []).map((ad) =>
      mapAdCardToListing(ad, { eurToDzd })
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
      items = [...items].sort((a, b) => a.priceDzd - b.priceDzd);
    } else if (sortId === "price_desc") {
      items = [...items].sort((a, b) => b.priceDzd - a.priceDzd);
    }

    return items;
  }, [pageData, location, sortId, eurToDzd, filters.priceMin, filters.priceMax]);

  const hasActiveSearch =
    searchQuery.trim().length > 0 ||
    Boolean(categorieId) ||
    Boolean(sousCategorieId) ||
    activeFilters > 0;
  const isEmptySearch =
    hasActiveSearch && !isLoading && !isFetching && listings.length === 0;

  const getCurrency = (listingId) => currencies[listingId] ?? "DZD";

  const toggleCurrency = (id) => {
    setCurrencies((prev) => ({
      ...prev,
      [id]: prev[id] === "DZD" ? "EUR" : "DZD",
    }));
  };

  const clearSearch = () => setSearchQuery("");

  const openFilters = () => {
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
    navigation.navigate("MapSearch", {
      searchQuery,
      filters,
      sortId,
    });
  };

  const handleLocationPress = () => {
    Alert.alert("Localisation", "Sélectionnez une région", [
      ...LOCATIONS.map((loc) => ({
        text: loc,
        onPress: () => setFilters((prev) => ({ ...prev, location: loc })),
      })),
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const handleSortPress = () => {
    Alert.alert("Trier par", "Choisissez un critère de tri", [
      ...SORT_OPTIONS.map((option) => ({
        text: option.label,
        onPress: () => setSortId(option.id),
      })),
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const createSavedSearch = useCreateSavedSearch();

  const handleSaveSearch = async () => {
    const q = searchQuery.trim();
    if (!q) {
      showDevMessage("Recherche", "Saisissez un mot-clé avant de sauvegarder.");
      return;
    }
    try {
      await createSavedSearch.mutateAsync({ query: q, label: q });
      showDevMessage("Recherche sauvegardée", "Disponible dans Favoris → Mes recherches.");
    } catch (error) {
      const msg =
        error instanceof AppApiError
          ? userFacingMessage(error)
          : "Échec de la sauvegarde (vérifiez le contrat POST /me/recherches).";
      showDevMessage("Erreur", msg);
    }
  };

  const handleChatPress = () => {
    navigation.navigate("Messages");
  };

  const handleNotificationPress = () => {
    navigation.navigate("Notifications");
  };

  const renderListHeader = () => (
    <>
      <HomeHeader
        onNotificationPress={handleNotificationPress}
      />
      <HomeSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={openFilters}
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

      {isEmptySearch ? (
        <SearchQueryBanner query={searchQuery} onClear={clearSearch} />
      ) : (
        <>
          <SearchFilterBar
            activeFilters={activeFilters}
            location={location}
            onMapPress={handleMapPress}
            onFiltersPress={openFilters}
            onLocationPress={handleLocationPress}
          />
          <SearchResultsHeader
            count={pageData?.totalElements ?? listings.length}
            sortLabel={sortLabel}
            onSortPress={handleSortPress}
          />
          {isError ? (
            <Text style={styles.error}>Erreur de recherche. Réessayez.</Text>
          ) : null}
          {(isLoading || isFetching) && listings.length === 0 ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null}
        </>
      )}
    </>
  );

  if (isEmptySearch) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyHeader}>{renderListHeader()}</View>
          <SearchEmptyState />
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
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={renderListHeader()}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              currency={getCurrency(item.id)}
              isFavorite={isFavorite(item.id)}
              onPress={handleListingPress}
              onToggleFavorite={toggleFavorite}
              onToggleCurrency={toggleCurrency}
            />
          )}
        />

        <SaveSearchButton onPress={handleSaveSearch} />
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
  list: {
    paddingBottom: 160,
  },
  error: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 8,
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
