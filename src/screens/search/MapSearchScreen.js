/**
 * Vue carte des annonces — alignée sur CategoryMapView du new front.
 * Pins par commune (sans filtre lieu) ou par annonce (filtre lieu actif).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { DEFAULT_SEARCH_FILTERS } from "../../data/searchFilters";
import { normalizeListing, formatPrice } from "../../utils/productMapper";
import {
  buildCommuneMarkersFromListings,
  buildListingMarkers,
} from "../../utils/algeriaLocation";
import { useSearchAds, useExchangeRate } from "../../hooks/useCatalog";
import { mapAdCardToListing } from "../../models/adMapper";
import { extractEurToDzd } from "../../services/exchangeService";
import ListingsMapView from "../../components/map/ListingsMapView";

export default function MapSearchScreen({ navigation, route }) {
  const searchQuery = route.params?.searchQuery ?? "";
  const filters = route.params?.filters ?? DEFAULT_SEARCH_FILTERS;
  const sortId = route.params?.sortId ?? "relevance";

  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const cardsRef = useRef(null);

  const { data: exchange } = useExchangeRate();
  const eurToDzd = extractEurToDzd(exchange);

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
  const location = filters.location ?? DEFAULT_SEARCH_FILTERS.location;
  const hasLocationFilter =
    Boolean(location) && location !== "Toute l'Algérie";

  const { pageData, isLoading, isError, isFetching } = useSearchAds(
    searchQuery,
    0,
    48,
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

  const listings = useMemo(() => {
    let items = (pageData?.content ?? []).map((ad) =>
      mapAdCardToListing(ad, { eurToDzd })
    );

    if (hasLocationFilter) {
      const loc = location.toLowerCase();
      items = items.filter((l) =>
        (l.location || "").toLowerCase().includes(loc)
      );
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
  }, [
    pageData,
    location,
    hasLocationFilter,
    sortId,
    eurToDzd,
    filters.priceMin,
    filters.priceMax,
  ]);

  const markers = useMemo(() => {
    if (!listings.length) return [];
    if (hasLocationFilter) {
      return buildListingMarkers(listings, 40);
    }
    return buildCommuneMarkersFromListings(listings);
  }, [listings, hasLocationFilter]);

  useEffect(() => {
    if (!markers.length) {
      setSelectedMarkerId(null);
      return;
    }
    if (!markers.some((m) => String(m.id) === String(selectedMarkerId))) {
      setSelectedMarkerId(markers[0].id);
    }
  }, [markers, selectedMarkerId]);

  const sheetListings = useMemo(() => {
    if (!selectedMarkerId) return listings;
    const marker = markers.find(
      (m) => String(m.id) === String(selectedMarkerId)
    );
    if (marker?.listings?.length) return marker.listings;
    return listings;
  }, [listings, markers, selectedMarkerId]);

  const handleMarkerPress = (marker) => {
    setSelectedMarkerId(marker.id);
    const first = marker.listings?.[0] ?? marker.listing;
    if (first) setSelectedListingId(String(first.id));
  };

  const handleCardPress = (listing) => {
    setSelectedListingId(String(listing.id));
    const communeMarker = markers.find((marker) =>
      marker.listings?.some((item) => String(item.id) === String(listing.id))
    );
    setSelectedMarkerId(communeMarker?.id ?? String(listing.id));
  };

  const handleOpenListing = (listing) => {
    navigation.navigate("ProductDetail", {
      product: normalizeListing(listing),
      annonceId: listing.id,
    });
  };

  const loading = isLoading || isFetching;

  return (
    <View style={styles.root}>
      <ListingsMapView
        markers={markers}
        selectedMarkerId={selectedMarkerId}
        onMarkerPress={handleMarkerPress}
        style={styles.map}
      />

      <SafeAreaView style={styles.topBar} edges={["top"]} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.roundBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textHeading} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listToggle}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="list-outline" size={16} color={colors.textHeading} />
          <Text style={styles.listToggleText}>Liste</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {listings.length} annonce{listings.length > 1 ? "s" : ""} sur la carte
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>

        {isError ? (
          <Text style={styles.status}>Impossible de charger les annonces.</Text>
        ) : null}

        {!loading && !listings.length ? (
          <Text style={styles.status}>Aucune annonce à afficher sur la carte.</Text>
        ) : null}

        <ScrollView
          ref={cardsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {sheetListings.map((listing) => {
            const selected = String(listing.id) === String(selectedListingId);
            return (
              <TouchableOpacity
                key={listing.id}
                style={[styles.miniCard, selected && styles.miniCardSelected]}
                onPress={() => {
                  if (selected) {
                    handleOpenListing(listing);
                    return;
                  }
                  handleCardPress(listing);
                }}
              >
                <Image
                  source={{ uri: listing.image }}
                  style={styles.miniImage}
                />
                <View style={styles.miniBody}>
                  <Text style={styles.miniPrice}>
                    {formatPrice(listing.priceDzd, "Da")}
                  </Text>
                  <Text style={styles.miniTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <Text style={styles.miniLocation} numberOfLines={1}>
                    {listing.location}
                  </Text>
                  {selected ? (
                    <Text style={styles.miniCta}>Voir l'annonce →</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#E8EDF2",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  listToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  listToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "42%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
    flex: 1,
  },
  status: {
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardsRow: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  miniCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  miniCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  miniImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F0F2F5",
  },
  miniBody: {
    padding: 10,
  },
  miniPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
    marginBottom: 2,
  },
  miniLocation: {
    fontSize: 12,
    color: colors.textMuted,
  },
  miniCta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
});
