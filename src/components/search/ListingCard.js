import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../data/mockListingsData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;
const CARD_WIDTH = SCREEN_WIDTH - H_PAD * 2;

export default function ListingCard({
  listing,
  currency,
  isFavorite,
  onPress,
  onToggleFavorite,
  onToggleCurrency,
}) {
  const price =
    currency === "EUR" ? listing.priceEur : listing.priceDzd;
  const currencySymbol = currency === "EUR" ? "€" : "DZD";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => onPress(listing)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: listing.image }} style={styles.image} />

        {listing.tag ? (
          <View
            style={[
              styles.tag,
              listing.tag.type === "pro" ? styles.tagPro : styles.tagFeatured,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                listing.tag.type === "featured" && styles.tagTextFeatured,
              ]}
            >
              {listing.tag.label}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite(listing.id)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? colors.primary : colors.textDark}
          />
        </TouchableOpacity>
        {Number(listing.favorisCount) > 0 ? (
          <View style={styles.favCountBadge}>
            <Ionicons name="heart" size={11} color={colors.primary} />
            <Text style={styles.favCountText}>
              {Number(listing.favorisCount)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price, currency)}</Text>
          <TouchableOpacity
            style={styles.currencyButton}
            activeOpacity={0.8}
            onPress={() => onToggleCurrency(listing.id)}
          >
            <Text style={styles.currencyText}>{currencySymbol}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.textDark} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.location}>{listing.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F4F6F8",
  },
  tag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPro: {
    backgroundColor: colors.primary,
  },
  tagFeatured: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
  },
  tagTextFeatured: {
    color: colors.textDark,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  favCountBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  favCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textHeading,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textDark,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
