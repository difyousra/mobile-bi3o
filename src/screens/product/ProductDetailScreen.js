import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import EmbeddedMap from "../../components/map/EmbeddedMap";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import {
  usePublicAd,
  usePublicAdStats,
  useSellerPublicAds,
  useSignalAnnonce,
  useSimilarAds,
  useExchangeRate,
} from "../../hooks/useCatalog";
import { resolveExchangeRates } from "../../services/exchangeService";
import { useFollowStatus, useToggleFollow } from "../../hooks/useEngagement";
import { useStartConversation, useReservationCalendar } from "../../hooks/useMessaging";
import { mapPublicSeller } from "../../utils/profileHelpers";
import {
  resolveLocationCoords,
  whatsappUrl,
  getSellerPhone,
} from "../../utils/algeriaLocation";
import { recordWhatsappClick } from "../../services/annoncesService";
import { fetchPublicSeller } from "../../services/annoncesService";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../api/queryKeys";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import SellerTypeBadge from "../../components/common/SellerTypeBadge";
import PriceConversionRow from "../../components/common/PriceConversionRow";
import AdDetailLivraisonCard from "../../components/product/AdDetailLivraisonCard";
import AdDetailReservationCard from "../../components/product/AdDetailReservationCard";
import MortgageLoanSimulator from "../../features/immobilier/components/MortgageLoanSimulator";
import VehicleFinancingSimulator from "../../features/vehicules/components/VehicleFinancingSimulator";
import { isImmobilierAd } from "../../features/immobilier/utils/isImmobilierAd";
import { isVehicleAd } from "../../features/vehicules/utils/isVehicleAd";
import { isLocationsSaisonnieresAd } from "../../features/vacances/utils/isVacancesAd";
import { confirmDialog, alertDialog } from "../../utils/confirmDialog";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import {
  translateCategoryDisplayName,
  translateSubcategoryDisplayName,
} from "../../i18n/taxonomyLabels";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function relativeDate(iso, t, language) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return t("mobile.product.relativeJustNow");
  if (diff < 3600) return t("mobile.product.relativeMinutes", { count: Math.floor(diff / 60) });
  if (diff < 86400) return t("mobile.product.relativeHours", { count: Math.floor(diff / 3600) });
  if (diff < 2592000) return t("mobile.product.relativeDays", { count: Math.floor(diff / 86400) });
  const locale = language === "ar" ? "ar-DZ" : language === "en" ? "en-GB" : "fr-DZ";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function getReportReasons(t) {
  return [
    t("mobile.product.reportReasonFraud"),
    t("mobile.product.reportReasonForbidden"),
    t("mobile.product.reportReasonPrice"),
    t("mobile.product.reportReasonPhotos"),
    t("mobile.product.reportReasonDuplicate"),
    t("mobile.product.reportReasonOther"),
  ];
}

/* ─── Galerie photos ───────────────────────────────────────────────────────── */

function PhotoGallery({ photos, activeIndex, onSelect }) {
  const imgs = photos?.length ? photos : [null];
  return (
    <View>
      <View style={gStyles.hero}>
        {imgs[activeIndex] ? (
          <Image source={{ uri: imgs[activeIndex] }} style={gStyles.heroImg} resizeMode="cover" />
        ) : (
          <View style={[gStyles.heroImg, gStyles.placeholder]}>
            <Ionicons name="image-outline" size={48} color={colors.border} />
          </View>
        )}
        {imgs.length > 1 && (
          <View style={gStyles.counter}>
            <Text style={gStyles.counterText}>{activeIndex + 1}/{imgs.length}</Text>
          </View>
        )}
      </View>
      {imgs.length > 1 && (
        <FlatList
          horizontal
          data={imgs}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={gStyles.thumbRow}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => onSelect(index)}
              style={[gStyles.thumb, index === activeIndex && gStyles.thumbActive]}
            >
              {item ? (
                <Image source={{ uri: item }} style={gStyles.thumbImg} resizeMode="cover" />
              ) : (
                <View style={[gStyles.thumbImg, gStyles.placeholder]} />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const gStyles = StyleSheet.create({
  hero: {
    width: "100%",
    height: 300,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
  },
  heroImg: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center" },
  counter: {
    position: "absolute", bottom: 12, right: 12,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  thumbRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  thumb: {
    width: 64, height: 64, borderRadius: 8,
    borderWidth: 2, borderColor: "transparent", overflow: "hidden",
  },
  thumbActive: { borderColor: colors.primary },
  thumbImg: { width: "100%", height: "100%" },
});

/* ─── Badge type ───────────────────────────────────────────────────────────── */

function TypeBadge({ type }) {
  const { t } = useAppLanguage();
  if (!type) return null;
  const isDemande = String(type).toUpperCase() === "DEMANDE";
  return (
    <View style={[bStyles.badge, isDemande ? bStyles.demande : bStyles.offre]}>
      <Text style={bStyles.text}>
        {isDemande
          ? t("forms.deposit.annonceTypeDemandeTitle")
          : t("forms.deposit.annonceTypeOffreTitle")}
      </Text>
    </View>
  );
}
const bStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  offre: { backgroundColor: "#EEF9F0" }, demande: { backgroundColor: "#FFF3E0" },
  text: { fontSize: 11, fontWeight: "700", color: colors.textHeading },
});

const DESCRIPTION_MAX_LINES = 4;
const DESCRIPTION_CHAR_THRESHOLD = 120;

function estimateDescriptionTruncated(text) {
  if (!text) return false;
  if ((text.match(/\n/g)?.length ?? 0) >= DESCRIPTION_MAX_LINES) return true;
  return text.length > DESCRIPTION_CHAR_THRESHOLD;
}

function DescriptionSection({ description }) {
  const { t } = useAppLanguage();
  const [expanded, setExpanded] = useState(false);
  const [measuredTruncated, setMeasuredTruncated] = useState(false);
  const content = description || t("mobile.product.noDescription");
  const needsTruncate =
    Boolean(description) &&
    (measuredTruncated || estimateDescriptionTruncated(description));

  return (
    <View style={styles.section}>
      {description ? (
        <View style={styles.descriptionMeasureWrap} pointerEvents="none">
          <Text
            style={styles.description}
            onTextLayout={(e) =>
              setMeasuredTruncated(e.nativeEvent.lines.length > DESCRIPTION_MAX_LINES)
            }
          >
            {content}
          </Text>
        </View>
      ) : null}
      <Text
        style={styles.description}
        numberOfLines={expanded ? undefined : DESCRIPTION_MAX_LINES}
        ellipsizeMode="tail"
      >
        {content}
      </Text>
      {needsTruncate ? (
        <TouchableOpacity
          style={styles.descriptionToggle}
          activeOpacity={0.85}
          onPress={() => setExpanded((v) => !v)}
        >
          <Text style={styles.descriptionToggleText}>
            {expanded
              ? t("annonceDetail.descriptionSeeLess")
              : t("annonceDetail.descriptionSeeMore")}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/* ─── Attributs ────────────────────────────────────────────────────────────── */

function AttributsSection({ attributs }) {
  const { t } = useAppLanguage();
  if (!attributs?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("adDetailV2.characteristics")}</Text>
      <View style={styles.attrGrid}>
        {attributs.map((a, i) => (
          <View key={a.id ?? i} style={styles.attrItem}>
            <Text style={styles.attrLabel}>{a.label}</Text>
            <Text style={styles.attrValue}>{a.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── Carte localisation embarquée (MapView) ───────────────────────────────── */

function LocationMapCard({ codePostal, ville }) {
  const { t } = useAppLanguage();
  const coords = useMemo(() => resolveLocationCoords(codePostal, ville), [codePostal, ville]);
  if (!coords) return null;

  const label = coords.label ?? ville ?? t("mobile.product.locationFallback");

  const openMap = () => {
    const query = encodeURIComponent(label);
    const url = Platform.OS === "ios"
      ? `maps://?q=${query}&ll=${coords.lat},${coords.lng}`
      : `geo:${coords.lat},${coords.lng}?q=${query}`;

    Linking.canOpenURL(url).then((supported) => {
      Linking.openURL(
        supported
          ? url
          : `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
      );
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{t("adDetailV2.locationTitle")}</Text>
        <TouchableOpacity onPress={openMap}>
          <Text style={styles.seeAll}>{t("mobile.product.openInMaps")}</Text>
        </TouchableOpacity>
      </View>
      <EmbeddedMap
        lat={coords.lat}
        lng={coords.lng}
        label={label}
        onOpenMap={openMap}
      />
    </View>
  );
}

/* ─── Vendeur + WhatsApp ───────────────────────────────────────────────────── */

function SellerSection({ annonceId, sellerId, sellerName, vendeurEstPro, navigation, onContact, isPending }) {
  const { t } = useAppLanguage();
  const { isAuthenticated, requireAuth } = useAuth();
  const { data: followData = false, isLoading: followLoading } = useFollowStatus(sellerId);
  const toggleFollow = useToggleFollow();

  const { data: pubRaw } = useQuery({
    queryKey: queryKeys.sellerPublic(Number(sellerId) || 0),
    queryFn: () => fetchPublicSeller(Number(sellerId)),
    enabled: Boolean(sellerId),
    staleTime: 60_000,
  });

  const seller = pubRaw ? mapPublicSeller(pubRaw, Number(sellerId)) : null;
  const displayName = seller?.name || sellerName || t("annonceDetail.memberBi3oo");
  const avatar = seller?.avatar;
  const isPro = vendeurEstPro || seller?.typeCompte === "PRO";

  const { data: sellerAds } = useSellerPublicAds(sellerId, 3);
  const adsCount = sellerAds?.totalElements ?? sellerAds?.products?.length ?? 0;

  const phone = getSellerPhone(pubRaw);
  const waUrl = phone
    ? whatsappUrl(phone, t("mobile.product.whatsappInterest"))
    : null;

  const handleWhatsApp = () => {
    if (!waUrl) return;
    recordWhatsappClick(annonceId);
    Linking.openURL(waUrl);
  };

  const handleCall = () => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\D/g, "")}`);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("mobile.product.sellerSection")}</Text>
      <View style={styles.sellerCard}>
        <TouchableOpacity
          style={styles.sellerInfo}
          disabled={!sellerId}
          onPress={() =>
            sellerId && navigation.navigate("SellerProfile", { sellerId, sellerName: displayName })
          }
        >
          <View style={styles.sellerAvatarWrap}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.sellerAvatarImg} />
            ) : (
              <View style={[styles.sellerAvatarImg, styles.sellerAvatarFallback]}>
                <Ionicons name="person" size={22} color={colors.textMuted} />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Text style={styles.sellerName}>{displayName}</Text>
              <SellerTypeBadge isPro={isPro} variant="detail" />
            </View>
            {seller?.ville ? <Text style={styles.sellerMeta}>{seller.ville}</Text> : null}
            {adsCount > 0 ? (
              <Text style={styles.sellerMeta}>
                {t("mobile.product.adsCount", { count: adsCount })}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {sellerId ? (
          <TouchableOpacity
            style={[styles.followBtn, followData && styles.followBtnActive]}
            disabled={followLoading || toggleFollow.isPending}
            onPress={() => {
              if (!isAuthenticated) { requireAuth(); return; }
              toggleFollow.mutate({ sellerId, currentlyFollowing: followData });
            }}
          >
            <Ionicons
              name={followData ? "heart" : "heart-outline"}
              size={15}
              color={followData ? colors.white : colors.primary}
            />
            <Text style={[styles.followBtnText, followData && styles.followBtnTextActive]}>
              {followData ? t("mobile.product.following") : t("annonceDetail.followSeller")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Actions contact */}
      <View style={styles.contactRow}>
        <TouchableOpacity
          style={[styles.contactBtn, { flex: 1 }]}
          onPress={onContact}
          disabled={isPending}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.white} />
          <Text style={styles.contactBtnText}>
            {isPending ? "…" : t("annonceDetail.messageShort")}
          </Text>
        </TouchableOpacity>

        {waUrl ? (
          <TouchableOpacity style={[styles.contactBtnWa]} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
            <Text style={styles.contactBtnText}>{t("annonceDetail.whatsappShort")}</Text>
          </TouchableOpacity>
        ) : null}

        {phone ? (
          <TouchableOpacity style={[styles.contactBtnCall]} onPress={handleCall}>
            <Ionicons name="call-outline" size={18} color={colors.navy} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

/* ─── Annonces similaires ──────────────────────────────────────────────────── */

function SimilarAds({ sousCategorieId, categorieId, excludeId, navigation, rates }) {
  const { t } = useAppLanguage();
  const { data, isLoading } = useSimilarAds({ sousCategorieId, categorieId, excludeId });
  const products = data?.products ?? [];

  if (isLoading || products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("adDetailV2.similarTitle")}</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={simStyles.card}
            onPress={() =>
              navigation.push("ProductDetail", {
                annonceId: item.id,
                product: item,
              })
            }
          >
            <Image
              source={{ uri: item.image }}
              style={simStyles.img}
              resizeMode="cover"
            />
            <View style={simStyles.body}>
              <Text style={simStyles.title} numberOfLines={2}>{item.title}</Text>
              {item.priceDa > 0 ? (
                <PriceConversionRow
                  listing={{
                    priceDa: item.priceDa,
                    prix: item.priceDa,
                    categorieId: item.categorieId,
                    sousCategorieId: item.sousCategorieId,
                  }}
                  rates={rates}
                  size="sm"
                />
              ) : (
                <Text style={simStyles.price}>{t("adDetailV2.priceOnRequest")}</Text>
              )}
              <View style={simStyles.metaRow}>
                <Ionicons name="heart-outline" size={12} color={colors.textMuted} />
                <Text style={simStyles.metaText}>
                  {Number(item.favorisCount ?? 0)}
                </Text>
              </View>
              <Text style={simStyles.loc} numberOfLines={1}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const simStyles = StyleSheet.create({
  card: {
    width: 150, backgroundColor: colors.white,
    borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: colors.border,
  },
  img: { width: "100%", height: 100 },
  body: { padding: 8, gap: 4 },
  title: {
    fontSize: 12, fontWeight: "600", color: colors.textHeading,
    lineHeight: 16,
  },
  price: { fontSize: 12, fontWeight: "700", color: colors.primary },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: { fontSize: 11, color: colors.textMuted },
  loc: { fontSize: 11, color: colors.textMuted },
});

/* ─── Modal signalement ────────────────────────────────────────────────────── */


function ReportModal({ annonceId, visible, onClose }) {
  const { t } = useAppLanguage();
  const signal = useSignalAnnonce();
  const [selected, setSelected] = useState(null);
  const reasons = useMemo(() => getReportReasons(t), [t]);

  if (!visible) return null;

  const handleSend = () => {
    if (!selected) return;
    signal.mutate(
      { id: annonceId, reason: selected },
      {
        onSuccess: () => {
          Alert.alert(
            t("mobile.product.reportSentTitle"),
            t("mobile.product.reportSentBody")
          );
          onClose();
        },
        onError: () => Alert.alert(t("mobile.common.error"), t("mobile.product.reportError")),
      }
    );
  };

  return (
    <View style={rStyles.overlay}>
      <View style={rStyles.sheet}>
        <View style={rStyles.header}>
          <Text style={rStyles.title}>{t("mobile.product.reportModalTitle")}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textHeading} />
          </TouchableOpacity>
        </View>
        {reasons.map((r) => (
          <TouchableOpacity
            key={r}
            style={[rStyles.reason, selected === r && rStyles.reasonSelected]}
            onPress={() => setSelected(r)}
          >
            <Ionicons
              name={selected === r ? "radio-button-on" : "radio-button-off"}
              size={18}
              color={selected === r ? colors.primary : colors.textMuted}
            />
            <Text style={rStyles.reasonText}>{r}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[rStyles.sendBtn, !selected && rStyles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!selected || signal.isPending}
        >
          <Text style={rStyles.sendBtnText}>
            {signal.isPending ? t("annonceDetail.sending") : t("mobile.product.sendReport")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const rStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 200,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: Platform.OS === "ios" ? 38 : 24,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: "700", color: colors.textHeading },
  reason: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  reasonSelected: { backgroundColor: "#F0F6FF" },
  reasonText: { fontSize: 14, color: colors.textHeading },
  sendBtn: {
    marginTop: 18, backgroundColor: colors.primary,
    borderRadius: 10, paddingVertical: 14, alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});

/* ─── Écran principal ──────────────────────────────────────────────────────── */

export default function ProductDetailScreen({ route, navigation }) {
  const { t, language } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const annonceId = route.params?.annonceId ?? route.params?.product?.id;
  const fallbackRaw = route.params?.product;

  const { product, isLoading, isError } = usePublicAd(annonceId);
  const { data: stats } = usePublicAdStats(annonceId);
  const displayProduct = product ?? fallbackRaw;
  const { data: exchange } = useExchangeRate();
  const priceRates = useMemo(
    () => resolveExchangeRates(exchange),
    [exchange]
  );

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, requireAuth } = useAuth();
  const startConversation = useStartConversation();
  const { data: calendarData } = useReservationCalendar(
    isLocationsSaisonnieresAd(product ?? fallbackRaw) ? annonceId : undefined
  );

  const [imageIndex, setImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [reportVisible, setReportVisible] = useState(false);

  if (isLoading && !displayProduct) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!displayProduct || (isError && !fallbackRaw)) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.errorText}>{t("adDetailV2.notFound")}</Text>
      </SafeAreaView>
    );
  }

  const p = displayProduct;
  const photos = p.photos?.length ? p.photos : [p.image].filter(Boolean);
  const favorited = isFavorite(p.id);
  const favorisCount = stats?.favorisCount ?? p.favorisCount ?? 0;
  const views = stats?.views ?? p.views ?? null;

  const handleContact = () => {
    if (!isAuthenticated) {
      requireAuth({ name: "ProductDetail", params: route.params });
      return;
    }
    const id = annonceId ?? p.id;
    if (!id) {
      alertDialog(t("mobile.common.error"), t("mobile.product.missingListingId"));
      return;
    }
    const defaultMsg = t("mobile.product.contactDefaultMessage");
    confirmDialog(
      t("mobile.product.contactSellerTitle"),
      t("mobile.product.contactSellerPreview", { message: defaultMsg }),
      [
        { text: t("mobile.common.cancel"), style: "cancel" },
        {
          text: t("annonceDetail.send"),
          onPress: async () => {
            try {
              const conv = await startConversation.mutateAsync({
                annonceId: id,
                message: defaultMsg,
              });
              const conversationId = conv?.id;
              if (!conversationId) {
                throw new Error("Conversation créée mais id manquant.");
              }
              navigation.navigate("Messages", {
                screen: "Chat",
                params: {
                  conversationId,
                  annonceId: id,
                  productTitle: p.title,
                  productImage: p.image,
                  seedConversation: {
                    id: conversationId,
                    sellerId: p.sellerId,
                    sellerName: p.seller || t("annonceDetail.sellerFallback"),
                    sellerAvatar: null,
                    lastSeen: t("mobile.messages.messagingBrand"),
                    headerVariant: "seller",
                    product: {
                      id,
                      title: p.title,
                      price: formatPrice(p.priceDa),
                      image: p.image,
                    },
                    messages: [],
                  },
                },
              });
            } catch (err) {
              alertDialog(
                t("mobile.messages.title"),
                err?.message ?? t("mobile.product.conversationError")
              );
            }
          },
        },
      ]
    );
  };

  // Hauteur réelle de la topBar = insets.top + 50px (boutons 38px + paddings)
  const topBarHeight = insets.top + 50;
  // FloatingTabBar ~80px
  const TAB_BAR_H = 80 + Math.max(insets.bottom, 12);

  return (
    <View style={styles.safe}>
      {/* Barre haute flottante au-dessus de la galerie */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.roundBtn} onPress={() => toggleFavorite(p.id)}>
            <Ionicons
              name={favorited ? "heart" : "heart-outline"}
              size={22}
              color={favorited ? colors.primary : colors.textHeading}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roundBtn}
            onPress={() => {
              if (!isAuthenticated) { requireAuth(); return; }
              setReportVisible(true);
            }}
          >
            <Ionicons name="flag-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ScrollView avec offset pour éviter la superposition avec la topBar */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_H + 24 },
        ]}
        style={{ marginTop: 0 }}
      >
        {/* Espace pour que la galerie ne soit PAS sous la topBar */}
        <View style={{ height: topBarHeight }} />
        <PhotoGallery photos={photos} activeIndex={imageIndex} onSelect={setImageIndex} />

        {/* Carte info principale */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <TypeBadge type={p.type} />
                <SellerTypeBadge isPro={Boolean(p.vendeurEstPro)} variant="inline" />
              </View>
              <Text style={styles.title} numberOfLines={3}>{p.title}</Text>
              <Text style={styles.category}>
                {(() => {
                  const cat = translateCategoryDisplayName(
                    t,
                    p.categorieId,
                    p.categorieNom
                  );
                  const sous = translateSubcategoryDisplayName(
                    t,
                    p.sousCategorieId,
                    p.sousCategorieNom
                  );
                  return [cat, sous].filter(Boolean).join(" › ") || p.subtitle;
                })()}
              </Text>
            </View>
            <View style={styles.priceSideWrap}>
              {p.priceDa > 0 ? (
                <PriceConversionRow
                  listing={{
                    priceDa: p.priceDa,
                    prix: p.priceDa,
                    categorieId: p.categorieId,
                    sousCategorieId: p.sousCategorieId,
                    categorieNom: p.categorieNom,
                  }}
                  rates={priceRates}
                  size="lg"
                  showBankLine
                />
              ) : (
                <Text style={styles.priceSide}>{t("adDetailV2.priceOnRequest")}</Text>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            {p.location ? (
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{p.location}</Text>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <Ionicons name="heart-outline" size={13} color={colors.textMuted} />
              <Text style={styles.metaText}>
                {t("mobile.product.favorites", { count: favorisCount })}
              </Text>
            </View>
            {views != null ? (
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{t("mobile.product.views", { count: views })}</Text>
              </View>
            ) : null}
            {relativeDate(p.createdAt, t, language) ? (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>{relativeDate(p.createdAt, t, language)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.expandedPanel}>
          {/* Onglets */}
          <View style={styles.tabRow}>
            {[
              ["description", t("adDetailV2.descriptionTitle")],
              ["attrs", t("adDetailV2.characteristics")],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.tab, activeTab === key && styles.tabActive]}
                onPress={() => setActiveTab(key)}
              >
                <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "description" ? (
            <DescriptionSection key={p.description ?? "empty"} description={p.description} />
          ) : (
            <AttributsSection attributs={p.attributs} />
          )}

          {/* Carte localisation */}
          {(p.codePostal || p.ville) ? (
            <LocationMapCard codePostal={p.codePostal} ville={p.ville} />
          ) : null}

          {/* Livraison (comme le web) */}
          <AdDetailLivraisonCard
            livraisonDisponible={p.livraisonDisponible}
            partenaires={p.livraisonPartenaires}
            bureau={p.livraisonBureau}
          />

          {/* Simulateurs immobilier / véhicule */}
          {isImmobilierAd(p) ? (
            <View style={styles.section}>
              <MortgageLoanSimulator
                initialPrix={p.priceDa}
                compact
                showFullPageLink
                onOpenFull={() =>
                  navigation.navigate("MortgageSimulator", {
                    prix: p.priceDa,
                    annonceId: annonceId ?? p.id,
                  })
                }
              />
            </View>
          ) : null}
          {isVehicleAd(p) ? (
            <View style={styles.section}>
              <VehicleFinancingSimulator
                initialPrix={p.priceDa}
                compact
                showFullPageLink
                onOpenFull={() =>
                  navigation.navigate("VehicleSimulator", { prix: p.priceDa })
                }
                onContact={handleContact}
              />
            </View>
          ) : null}

          {/* Vendeur + WhatsApp */}
          <SellerSection
            annonceId={annonceId ?? p.id}
            sellerId={p.sellerId}
            sellerName={p.seller}
            vendeurEstPro={p.vendeurEstPro}
            navigation={navigation}
            onContact={handleContact}
            isPending={startConversation.isPending}
          />

          {isLocationsSaisonnieresAd(p) ? (
            <AdDetailReservationCard
              annonceId={annonceId ?? p.id}
              sellerId={p.sellerId}
              calendarData={calendarData}
              navigation={navigation}
            />
          ) : null}

          {/* Annonces similaires */}
          <SimilarAds
            sousCategorieId={p.sousCategorieId}
            categorieId={p.categorieId}
            excludeId={p.id}
            navigation={navigation}
            rates={priceRates}
          />
        </View>
      </ScrollView>

      <ReportModal
        annonceId={annonceId ?? p.id}
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
      />
    </View>
  );
}

/* ─── Styles ───────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FCFCFC", position: "relative" },
  backBtn: {
    margin: 20, width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  errorText: { paddingHorizontal: 24, color: colors.textPrimary, fontSize: 16 },
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 6,
  },
  topActions: { flexDirection: "row", gap: 8 },
  roundBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scrollContent: { flexGrow: 1 },
  infoCard: {
    margin: 16, marginTop: 12, backgroundColor: colors.white,
    borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  titleRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  title: { fontSize: 20, fontWeight: "700", color: colors.textHeading, lineHeight: 26 },
  category: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  priceSide: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "right",
  },
  priceSideWrap: {
    maxWidth: "48%",
    alignItems: "flex-end",
  },
  proBadgeInline: {
    backgroundColor: "#FEF3C7", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  proBadgeInlineText: { fontSize: 10, fontWeight: "800", color: "#92400E" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 12, color: colors.textMuted },
  expandedPanel: {
    marginHorizontal: 16, marginTop: 4, backgroundColor: colors.white,
    borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border,
  },
  tabRow: {
    flexDirection: "row", backgroundColor: colors.surfaceMuted,
    borderRadius: 10, padding: 4, marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  tabTextActive: { color: colors.textHeading, fontWeight: "700" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.textHeading, marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  seeAll: { fontSize: 13, fontWeight: "600", color: colors.primary },
  description: { fontSize: 14, lineHeight: 22, color: colors.textMuted },
  descriptionMeasureWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    zIndex: -1,
  },
  descriptionToggle: { marginTop: 10, alignSelf: "flex-start" },
  descriptionToggleText: { fontSize: 14, fontWeight: "600", color: colors.navy },
  attrGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  attrItem: {
    width: "47%", backgroundColor: colors.surfaceMuted, borderRadius: 10, padding: 10,
  },
  attrLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "500", marginBottom: 2 },
  attrValue: { fontSize: 13, color: colors.textHeading, fontWeight: "600" },
  sellerCard: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sellerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  sellerAvatarWrap: { position: "relative", width: 52, height: 52 },
  sellerAvatarImg: { width: 52, height: 52, borderRadius: 26 },
  sellerAvatarFallback: {
    backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center",
  },
  proBadge: {
    position: "absolute", bottom: -2, right: -2,
    backgroundColor: "#F59E0B", borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  proBadgeText: { fontSize: 8, fontWeight: "800", color: colors.white },
  sellerName: { fontSize: 14, fontWeight: "700", color: colors.textHeading },
  sellerMeta: { fontSize: 12, color: colors.textMuted },
  followBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    borderWidth: 1, borderColor: colors.primary,
  },
  followBtnActive: { backgroundColor: colors.primary },
  followBtnText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  followBtnTextActive: { color: colors.white },
  contactRow: { flexDirection: "row", gap: 8 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    backgroundColor: colors.navy, borderRadius: 10, paddingVertical: 13,
  },
  contactBtnWa: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    backgroundColor: "#25D366", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
  },
  contactBtnCall: {
    alignItems: "center", justifyContent: "center",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
  },
  contactBtnText: { color: colors.white, fontSize: 13, fontWeight: "700" },
});
