import { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { normalizeProduct, formatPrice } from "../../utils/productMapper";
import { enrichProduct } from "../../data/mockProductDetails";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { usePublicAd } from "../../hooks/useCatalog";
import {
  useFollowStatus,
  useToggleFollow,
} from "../../hooks/useEngagement";
import {
  useStartConversation,
  useReservationCalendar,
} from "../../hooks/useMessaging";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductReviewCard from "../../components/product/ProductReviewCard";
import { extractCalendarBusyDates } from "../../utils/profileHelpers";

function FollowSellerButton({ sellerId }) {
  const { data: following = false, isLoading } = useFollowStatus(sellerId);
  const toggle = useToggleFollow();

  return (
    <TouchableOpacity
      style={styles.followBtn}
      disabled={isLoading || toggle.isPending}
      onPress={() =>
        toggle.mutate({
          sellerId,
          currentlyFollowing: following,
        })
      }
    >
      <Ionicons
        name={following ? "heart" : "heart-outline"}
        size={16}
        color={colors.primary}
      />
      <Text style={styles.followText}>
        {following ? "Suivi" : "Suivre"}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProductDetailScreen({ route, navigation }) {
  const raw = route.params?.product;
  const annonceId = route.params?.annonceId ?? raw?.id;
  const { product: apiProduct, isLoading, isError } = usePublicAd(annonceId);

  const product = useMemo(() => {
    const base = apiProduct
      ? apiProduct
      : raw
        ? normalizeProduct(raw)
        : null;
    if (!base) return null;
    return enrichProduct({
      ...base,
      images: base.photos?.length ? base.photos : base.images,
    });
  }, [apiProduct, raw]);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const startConversation = useStartConversation();
  const { data: calendarData } = useReservationCalendar(annonceId);
  const busyDates = useMemo(
    () => extractCalendarBusyDates(calendarData).slice(0, 12),
    [calendarData]
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(undefined);
  const [selectedStorage, setSelectedStorage] = useState(undefined);
  const [detailTab, setDetailTab] = useState("description");
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  if (isLoading && !product) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 80 }}
        />
      </SafeAreaView>
    );
  }

  if (!product || (isError && !raw)) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.errorBack} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.error}>Annonce introuvable</Text>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    addItem(
      {
        ...product,
        selectedColor,
        selectedStorage,
      },
      1
    );
    navigation.navigate("Checkout");
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      Alert.alert("Connexion requise", "Connectez-vous pour contacter le vendeur.");
      return;
    }
    const id = annonceId ?? product.id;
    if (!id) {
      Alert.alert("Erreur", "Identifiant d'annonce manquant.");
      return;
    }

    const defaultMessage = "Bonjour, est-ce disponible ?";
    Alert.alert(
      "Contacter le vendeur",
      `Envoyer : « ${defaultMessage} »`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Envoyer",
          onPress: async () => {
            try {
              const conv = await startConversation.mutateAsync({
                annonceId: id,
                message: defaultMessage,
              });
              navigation.navigate("Messages", {
                screen: "Chat",
                params: {
                  conversationId: conv.id,
                  annonceId: id,
                  productTitle: product.title,
                  productImage: product.image,
                  seedConversation: {
                    id: conv.id,
                    sellerName: product.seller || "Vendeur",
                    sellerAvatar:
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
                    lastSeen: "Messagerie Bi3oo",
                    product: {
                      id,
                      title: product.title,
                      status: "Annonce",
                      price: formatPrice(product.priceDa),
                      image: product.image,
                    },
                    headerVariant: "seller",
                    annonceId: id,
                    messages: [],
                  },
                },
              });
            } catch (error) {
              Alert.alert(
                "Messagerie",
                error?.message ?? "Impossible de démarrer la conversation."
              );
            }
          },
        },
      ]
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e) => {
        const y = e.nativeEvent.contentOffset.y;
        setShowSwipeHint(y < 40);
      },
    }
  );

  const isExpanded = !showSwipeHint;
  const favorited = isFavorite(product.id);

  return (
    <View style={styles.safe}>
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons
              name={favorited ? "heart" : "heart-outline"}
              size={22}
              color={favorited ? colors.primary : colors.textHeading}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundBtnDark}
            onPress={() => {
              addItem(product, 1);
              navigation.navigate("MainTabs", { screen: "Cart" });
            }}
          >
            <Ionicons name="bag-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          {!isExpanded ? (
            <>
              <ProductImageGallery
                images={product.images}
                activeIndex={imageIndex}
                onSelect={setImageIndex}
                layout="hero"
              />
              <View style={styles.promoBanner}>
                <Text style={styles.promoTitle}>{product.promo.title}</Text>
                <Text style={styles.promoSub}>{product.promo.subtitle}</Text>
              </View>
            </>
          ) : (
            <ProductImageGallery
              images={product.images}
              activeIndex={imageIndex}
              onSelect={setImageIndex}
              layout="side"
            />
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.title}>{product.title}</Text>
              <Text style={styles.category}>{product.subtitle}</Text>
            </View>
            <Text style={styles.priceSide}>{formatPrice(product.priceDa)}</Text>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate("ProductReviews", { product })
              }
            >
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>
                {product.rating}{" "}
                <Text style={styles.statMuted}>({product.reviews} Review)</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.statText}>
              {product.sold}{" "}
              <Text style={styles.statMuted}>(Item Sold)</Text>
            </Text>
            <Text style={styles.statText}>
              {product.stock}{" "}
              <Text style={styles.statMuted}>(Stock)</Text>
            </Text>
          </View>
        </View>

        {showSwipeHint ? (
          <View style={styles.swipeHint}>
            <Ionicons name="chevron-up" size={20} color={colors.textMuted} />
            <Text style={styles.swipeText}>Swipe up for details</Text>
          </View>
        ) : null}

        <View style={styles.expandedPanel}>
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

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, detailTab === "description" && styles.tabActive]}
              onPress={() => setDetailTab("description")}
            >
              <Text
                style={[
                  styles.tabText,
                  detailTab === "description" && styles.tabTextActive,
                ]}
              >
                Description
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, detailTab === "specs" && styles.tabActive]}
              onPress={() => setDetailTab("specs")}
            >
              <Text
                style={[
                  styles.tabText,
                  detailTab === "specs" && styles.tabTextActive,
                ]}
              >
                Specification
              </Text>
            </TouchableOpacity>
          </View>

          {detailTab === "description" ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specification</Text>
              <View style={styles.specGrid}>
                {product.specs.map((spec) => (
                  <View key={spec.id} style={styles.specItem}>
                    <View style={styles.specIcon}>
                      <Ionicons
                        name={spec.icon}
                        size={20}
                        color={colors.navy}
                      />
                    </View>
                    <View style={styles.specBody}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Storage</Text>
            <View style={styles.chipRow}>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Shipment</Text>
            <View style={styles.shipmentCard}>
              <Ionicons name="cube-outline" size={28} color={colors.navy} />
              <View style={styles.shipmentBody}>
                <Text style={styles.shipmentTitle}>Shipment Guarantee</Text>
                <Text style={styles.shipmentText}>
                  Fast, insured & trusted delivery in 2–4 days via Express
                  Shipping.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ProductReviews", { product })
                }
              >
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {product.reviewsList.slice(0, 1).map((review) => (
              <ProductReviewCard key={review.id} review={review} />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Vendeur</Text>
              {product.sellerId ? (
                <FollowSellerButton sellerId={product.sellerId} />
              ) : null}
            </View>
            <TouchableOpacity
              disabled={!product.sellerId}
              onPress={() => {
                if (!product.sellerId) return;
                navigation.navigate("SellerProfile", {
                  sellerId: product.sellerId,
                  sellerName: product.seller,
                });
              }}
            >
              <Text style={styles.description}>
                {product.seller} · {product.location}
                {product.sellerId ? " ›" : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={handleContactSeller}
              disabled={startConversation.isPending}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={colors.white}
              />
              <Text style={styles.contactBtnText}>
                {startConversation.isPending
                  ? "Ouverture…"
                  : "Contacter le vendeur"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Réservation</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("MyReservations", {
                    annonceId: annonceId ?? product.id,
                  })
                }
              >
                <Text style={styles.seeAll}>Demander</Text>
              </TouchableOpacity>
            </View>
            {busyDates.length > 0 ? (
              <Text style={styles.description}>
                Dates occupées (calendrier public) : {busyDates.join(", ")}
              </Text>
            ) : (
              <Text style={styles.description}>
                Calendrier public disponible — aucune date extraite ou libre.
              </Text>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.subtotalLabel}>Total Price</Text>
          <Text style={styles.subtotalValue}>{formatPrice(product.priceDa)}</Text>
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
  errorBack: {
    margin: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: {
    paddingHorizontal: 24,
    color: colors.textPrimary,
    fontSize: 16,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },
  roundBtnDark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    position: "relative",
  },
  promoBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: "rgba(18, 25, 38, 0.84)",
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  promoSub: {
    fontSize: 12,
    color: "#CCE4FD",
  },
  infoCard: {
    marginTop: -48,
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleCol: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#252627",
  },
  category: {
    fontSize: 12,
    color: "#999A9A",
    marginTop: 4,
  },
  priceSide: {
    fontSize: 20,
    fontWeight: "500",
    color: "#252627",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#252627",
  },
  statMuted: {
    fontSize: 10,
    fontWeight: "300",
    color: "#999A9A",
  },
  swipeHint: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    gap: 4,
  },
  swipeText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  expandedPanel: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
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
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.textHeading,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    width: "47%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  specIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  specBody: { flex: 1 },
  specLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  specValue: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
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
  shipmentCard: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: "flex-start",
  },
  shipmentBody: { flex: 1 },
  shipmentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textHeading,
    marginBottom: 4,
  },
  shipmentText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  contactBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingVertical: 12,
  },
  contactBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subtotalLabel: {
    fontSize: 12,
    color: "#4F5663",
  },
  subtotalValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.primary,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 140,
    justifyContent: "center",
  },
  continueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FAFBFC",
  },
});
