import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { normalizeProduct, formatPrice } from "../../utils/productMapper";
import { enrichProduct } from "../../data/mockProductDetails";
import { useCart } from "../../context/CartContext";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductReviewCard from "../../components/product/ProductReviewCard";

export default function ProductReviewsScreen({ route, navigation }) {
  const raw = route.params?.product;
  const product = raw ? enrichProduct(normalizeProduct(raw)) : null;
  const { addItem } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.id);
  const [selectedStorage, setSelectedStorage] = useState(
    product?.storageOptions?.[0]
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.error}>Produit introuvable</Text>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    addItem({ ...product, selectedColor, selectedStorage }, quantity);
    navigation.navigate("Checkout");
  };

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Ratings</Text>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProductImageGallery
          images={product.images}
          activeIndex={imageIndex}
          onSelect={setImageIndex}
          layout="side"
        />

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.colorRow}>
            {product.colors.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c.hex },
                  selectedColor === c.id && styles.colorSwatchActive,
                ]}
                onPress={() => setSelectedColor(c.id)}
              />
            ))}
          </View>

          <View style={styles.storageRow}>
            {product.storageOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  selectedStorage === opt && styles.chipActive,
                ]}
                onPress={() => setSelectedStorage(opt)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedStorage === opt && styles.chipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.reviewsCount}>
            {product.reviews} reviews · {product.sold} sold
          </Text>

          {product.reviewsList.map((review) => (
            <ProductReviewCard key={review.id} review={review} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove" size={18} color={colors.textHeading} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Ionicons name="add" size={18} color={colors.textHeading} />
          </TouchableOpacity>
        </View>
        <View style={styles.footerPrice}>
          <Text style={styles.subtotalLabel}>Total Price</Text>
          <Text style={styles.subtotalValue}>
            {formatPrice(product.priceDa * quantity)}
          </Text>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: colors.textHeading,
  },
  headerSpacer: { width: 40 },
  error: {
    padding: 24,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  ratingBadge: {
    position: "absolute",
    top: 260,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textHeading,
  },
  panel: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchActive: {
    borderColor: colors.navy,
  },
  storageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  chipText: {
    fontSize: 13,
    color: colors.textHeading,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.white,
  },
  reviewsCount: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
    color: colors.textHeading,
  },
  footerPrice: { flex: 1 },
  subtotalLabel: {
    fontSize: 11,
    color: "#4F5663",
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  continueText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
});
