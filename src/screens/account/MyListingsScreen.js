import { useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { formatPrice } from "../../utils/productMapper";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import {
  useInfiniteMyManagedAds,
  useDeleteAnnonce,
} from "../../hooks/usePublish";
import { useAppLanguage } from "../../i18n/LanguageProvider";

const PAGE_SIZE = 20;

function isDraftStatus(item) {
  const raw = String(item.status ?? item.statut ?? "ACTIVE").toUpperCase();
  return (
    raw.includes("DRAFT") ||
    raw.includes("BROUILLON") ||
    raw.includes("PENDING")
  );
}

function mapManagedItem(item, defaultTitle) {
  const photoFromList =
    Array.isArray(item.photos) && item.photos.length
      ? resolveMediaUrl(
          item.photos[0]?.url ??
            item.photos[0]?.photoUrl ??
            item.photos[0]?.chemin
        )
      : undefined;

  return {
    id: item.id,
    title: item.titre ?? item.title ?? defaultTitle,
    price: Number(item.prix ?? item.price ?? 0),
    image:
      resolveMediaUrl(item.coverUrl ?? item.image) ??
      photoFromList ??
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    views: Number(item.views ?? item.vues ?? 0),
    favoris: Number(item.favorisCount ?? 0),
    messages: Number(item.messagesCount ?? item.messages ?? 0),
    whatsapp: Number(item.whatsappClicks ?? 0),
  };
}

export default function MyListingsScreen({ navigation }) {
  const { t } = useAppLanguage();
  const {
    items: rawItems,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMyManagedAds(PAGE_SIZE);
  const deleteMutation = useDeleteAnnonce();

  const defaultTitle = t("mobile.myListings.defaultTitle");

  const listings = useMemo(
    () =>
      rawItems
        .filter((item) => !isDraftStatus(item))
        .map((item) => mapManagedItem(item, defaultTitle)),
    [rawItems, defaultTitle]
  );

  const totals = useMemo(
    () =>
      listings.reduce(
        (acc, item) => ({
          views: acc.views + item.views,
          favoris: acc.favoris + item.favoris,
          messages: acc.messages + item.messages,
          whatsapp: acc.whatsapp + item.whatsapp,
          count: acc.count + 1,
        }),
        { views: 0, favoris: 0, messages: 0, whatsapp: 0, count: 0 }
      ),
    [listings]
  );

  const confirmAction = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: t("mobile.common.cancel"), style: "cancel" },
      {
        text: t("mobile.myListings.confirm"),
        style: "destructive",
        onPress: onConfirm,
      },
    ]);
  };

  const openListing = useCallback(
    (item) => {
      navigation.navigate("ProductDetail", {
        annonceId: item.id,
        product: {
          id: item.id,
          title: item.title,
          image: item.image,
          priceDa: item.price,
          priceEuro: item.price,
        },
      });
    },
    [navigation]
  );

  const onEndReached = useCallback(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (listings.length >= 8) return;
    fetchNextPage();
  }, [
    listings.length,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  ]);

  const listHeader = useMemo(
    () => (
      <View>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>{t("profileUi.sellFasterTitle")}</Text>
          <Text style={styles.ctaSub}>{t("profileUi.sellFasterDesc")}</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() =>
              navigation.navigate("MainTabs", { screen: "Publish" })
            }
          >
            <Text style={styles.ctaBtnText}>{t("profileUi.postAdBtn")}</Text>
          </TouchableOpacity>
        </View>

        {totals.count > 0 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {t("mobile.myListings.globalPerformance")}
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="eye-outline" size={18} color={colors.navy} />
                <Text style={styles.summaryValue}>{totals.views}</Text>
                <Text style={styles.summaryLabel}>{t("mobile.myListings.views")}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="heart-outline" size={18} color={colors.primary} />
                <Text style={styles.summaryValue}>{totals.favoris}</Text>
                <Text style={styles.summaryLabel}>
                  {t("mobile.myListings.favorites")}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={colors.navy}
                />
                <Text style={styles.summaryValue}>{totals.messages}</Text>
                <Text style={styles.summaryLabel}>{t("common.messages")}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons
                  name="logo-whatsapp"
                  size={18}
                  color="#25D366"
                />
                <Text style={styles.summaryValue}>{totals.whatsapp}</Text>
                <Text style={styles.summaryLabel}>
                  {t("mobile.myListings.whatsapp")}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : null}

        {isError ? (
          <Text style={styles.empty}>{t("mobile.myListings.loadError")}</Text>
        ) : null}

        {!isLoading && !isError && listings.length === 0 ? (
          <Text style={styles.empty}>{t("profileUi.emptyCategory")}</Text>
        ) : null}
      </View>
    ),
    [t, navigation, totals, isLoading, isError, listings.length]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => openListing(item)}>
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
              <Text style={styles.stat}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
              <Text style={styles.stat}>{item.favoris}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
              <Text style={styles.stat}>{item.messages}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="logo-whatsapp" size={14} color={colors.textMuted} />
              <Text style={styles.stat}>{item.whatsapp}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.viewBtn]}
              onPress={() => openListing(item)}
            >
              <Text style={[styles.actionText, styles.viewBtnText]}>
                {t("mobile.myListings.viewListing")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                confirmAction(
                  t("mobile.myListings.deleteTitle"),
                  t("profileUi.confirmDelete"),
                  () => deleteMutation.mutate(item.id)
                )
              }
            >
              <Text style={[styles.actionText, styles.danger]}>
                {t("mobile.common.delete")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [openListing, t, deleteMutation]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textHeading} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("layout.myAds")}</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={refetch}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  ctaCard: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 6,
  },
  ctaSub: {
    fontSize: 13,
    color: "#CCE4FD",
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.surfaceMuted,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textHeading,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    paddingVertical: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: colors.surfaceMuted,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textHeading,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stat: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  viewBtn: {
    borderColor: colors.navy,
    backgroundColor: colors.navy,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textHeading,
  },
  viewBtnText: {
    color: colors.white,
  },
  danger: {
    color: colors.primary,
  },
});
