import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import SellerTypeBadge from "../common/SellerTypeBadge";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

function formatDa(value) {
  return `${value.toLocaleString("fr-DZ")} Da`;
}

export default function MarketplaceProductCard({
  product,
  isFavorite,
  onPress,
  onToggleFavorite,
  compact = false,
}) {
  const isPro = Boolean(product?.isPro ?? product?.vendeurEstPro);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.9}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <SellerTypeBadge isPro={isPro} variant="overlay" />
        {Number(product.favorisCount) > 0 ? (
          <View style={styles.favCountBadge}>
            <Ionicons name="heart" size={11} color={colors.primary} />
            <Text style={styles.favCountText}>
              {Number(product.favorisCount)}
            </Text>
          </View>
        ) : null}
        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite(product.id)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={16}
            color={isFavorite ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceDa}>{formatDa(product.priceDa)}</Text>
        <Text style={styles.priceArrow}>{">>>"}</Text>
        <Text style={styles.priceEuro}>{product.priceEuro} €</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      {product.model ? (
        <Text style={styles.model} numberOfLines={1}>
          {product.model}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export function getMarketplaceCardWidth(compact = false) {
  return compact ? CARD_WIDTH * 0.92 : CARD_WIDTH;
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 14,
  },
  cardCompact: {
    width: CARD_WIDTH * 0.92,
  },
  imageWrap: {
    position: "relative",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 0.95,
    borderRadius: 14,
    backgroundColor: "#F4F6F8",
  },
  heartButton: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  favCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  favCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textHeading,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  priceDa: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDark,
  },
  priceArrow: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primary,
  },
  priceEuro: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textDark,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textDark,
    lineHeight: 16,
  },
  model: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
