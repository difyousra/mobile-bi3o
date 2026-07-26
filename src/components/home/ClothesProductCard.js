import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;

export default function ClothesProductCard({
  product,
  isFavorite,
  onPress,
  onToggleFavorite,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPress(product)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => onToggleFavorite(product.id)}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? colors.primary : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {product.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {product.subtitle}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.price}>
          {product.currency}
          {product.price.toFixed(2)}
        </Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#F5A623" />
          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  imageWrap: {
    position: "relative",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.15,
    borderRadius: 16,
    backgroundColor: "#F4F6F8",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textDark,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
  },
});
