import { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import {
  LISTINGS,
  filterListings,
  sortListings,
} from "../../data/mockListingsData";
import { DEFAULT_SEARCH_FILTERS } from "../../data/searchFilters";
import { normalizeListing } from "../../utils/productMapper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MAP_IMAGE =
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80";

const MAP_MARKERS = [
  { id: "m1", top: "28%", left: "52%" },
  { id: "m2", top: "42%", left: "28%" },
  { id: "m3", top: "55%", left: "68%" },
  { id: "m4", top: "38%", left: "78%" },
  { id: "m5", top: "62%", left: "40%" },
];

export default function MapSearchScreen({ navigation, route }) {
  const searchQuery = route.params?.searchQuery ?? "";
  const filters = route.params?.filters ?? DEFAULT_SEARCH_FILTERS;
  const sortId = route.params?.sortId ?? "relevance";
  const [selectedId, setSelectedId] = useState(null);

  const listings = useMemo(() => {
    const filtered = filterListings(
      LISTINGS,
      searchQuery,
      filters.location,
      filters
    );
    return sortListings(filtered, sortId);
  }, [searchQuery, filters, sortId]);

  const handleListingPress = (listing) => {
    navigation.navigate("ProductDetail", {
      product: normalizeListing(listing),
    });
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: MAP_IMAGE }} style={styles.mapImage} />

      {MAP_MARKERS.map((marker, index) => (
        <TouchableOpacity
          key={marker.id}
          style={[
            styles.marker,
            { top: marker.top, left: marker.left },
            selectedId === marker.id && styles.markerActive,
          ]}
          onPress={() => setSelectedId(marker.id)}
        >
          <Ionicons name="location" size={22} color={colors.white} />
        </TouchableOpacity>
      ))}

      <SafeAreaView style={styles.topBar} edges={["top"]}>
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
        <Text style={styles.sheetTitle}>
          {listings.length} annonce{listings.length > 1 ? "s" : ""} sur la carte
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {listings.map((listing) => (
            <TouchableOpacity
              key={listing.id}
              style={styles.miniCard}
              onPress={() => handleListingPress(listing)}
            >
              <Image source={{ uri: listing.image }} style={styles.miniImage} />
              <View style={styles.miniBody}>
                <Text style={styles.miniPrice}>
                  {listing.priceEur.toLocaleString("fr-FR")} €
                </Text>
                <Text style={styles.miniTitle} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={styles.miniLocation}>{listing.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: "100%",
    opacity: 0.92,
  },
  marker: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerActive: {
    backgroundColor: colors.navy,
    transform: [{ scale: 1.15 }],
  },
  topBar: {
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
  },
  listToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
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
  sheetTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cardsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  miniCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  miniImage: {
    width: "100%",
    height: 100,
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
});
